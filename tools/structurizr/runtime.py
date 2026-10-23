"""Bounded adapter runtime for the existing diagram validator, Linux x64 only."""
import hashlib
import json
import os
import pathlib
import platform
try:
    import resource
except ImportError:
    resource = None
import signal
import time
import subprocess
import sys
import stat
import tarfile
import tempfile
import zipfile

REPO = pathlib.Path(__file__).resolve().parents[2]
LOCK_BYTES = (REPO / 'architecture/references/tooling-lock.json').read_bytes()
PIN = json.loads(LOCK_BYTES)['diagramRenderers']['structurizr']
CACHE = REPO / '.cache/structurizr'


def digest(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()


def archives():
    for name, pin in [('jdk.tar.gz', PIN['java']), ('structurizr.war', PIN['archive'])]:
        path = CACHE / name
        if not path.is_file() or path.stat().st_size != pin['size'] or digest(path) != pin['sha256']:
            raise ValueError('Missing or changed pinned archive; run pnpm architecture:prepare: ' + name)
        yield path


def require_supported_platform():
    if (platform.system() != 'Linux' or platform.machine() not in ('x86_64', 'AMD64')
            or sys.version_info < (3, 12) or resource is None):
        raise ValueError('Unsupported host: Linux x64 and Python 3.12+ are required')


def prepare():
    require_supported_platform()
    CACHE.mkdir(parents=True, exist_ok=True)
    for name, pin in [('jdk.tar.gz', PIN['java']), ('structurizr.war', PIN['archive'])]:
        destination = CACHE / name
        if destination.is_file() and destination.stat().st_size == pin['size'] and digest(destination) == pin['sha256']:
            continue
        with tempfile.TemporaryDirectory(prefix='download-', dir=CACHE) as folder:
            target = pathlib.Path(folder) / name
            subprocess.run(['curl', '--fail', '--location', '--silent', '--show-error', '--proto', '=https',
                            '--proto-redir', '=https', '--max-time', '180', '--max-filesize', str(pin['size']),
                            '--output', str(target), pin['url']], check=True, timeout=185)
            if target.stat().st_size != pin['size'] or digest(target) != pin['sha256']:
                raise ValueError('Downloaded artifact does not match reviewed pin: ' + name)
            os.replace(target, destination)
    list(archives())


def limits():
    resource.setrlimit(resource.RLIMIT_CPU, (PIN['cpuSeconds'], PIN['cpuSeconds']))
    resource.setrlimit(resource.RLIMIT_AS, (PIN['addressSpaceBytes'], PIN['addressSpaceBytes']))
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    resource.setrlimit(resource.RLIMIT_FSIZE, (PIN['maxReportBytes'], PIN['maxReportBytes']))


def live_group_members(group):
    live = []
    for entry in pathlib.Path('/proc').iterdir():
        if not entry.name.isdigit():
            continue
        try:
            fields = (entry / 'stat').read_text().rsplit(')', 1)[1].split()
            if int(fields[2]) == group and fields[0] not in ('Z', 'X'):
                live.append(int(entry.name))
        except (FileNotFoundError, ProcessLookupError):
            pass
    return live


def stop_owned_group(group):
    deadline = time.monotonic() + 5
    while True:
        try:
            os.killpg(group, signal.SIGKILL)
        except ProcessLookupError:
            pass
        if not live_group_members(group):
            return
        if time.monotonic() >= deadline:
            raise RuntimeError('Sandbox process-group cleanup uncertain; request failed')
        time.sleep(0.01)


def run_bounded(command, stdout, stderr, env):
    if signal.getsignal(signal.SIGCHLD) != signal.SIG_DFL:
        raise ValueError('Sandbox requires exclusive child-reaping ownership')
    process = None
    owned = True
    timed_out = False
    pending = None
    blocked = {signal.SIGTERM, signal.SIGINT}
    previous = signal.pthread_sigmask(signal.SIG_BLOCK, blocked)
    def child_setup():
        limits()
        signal.pthread_sigmask(signal.SIG_SETMASK, previous)
    try:
        process = subprocess.Popen(command, stdin=subprocess.DEVNULL, stdout=stdout, stderr=stderr,
                                   preexec_fn=child_setup, env=env, start_new_session=True)
        # Deliver pending cancellation only after process ownership is protected.
        signal.pthread_sigmask(signal.SIG_SETMASK, previous)
        deadline = time.monotonic() + PIN['wallSeconds']
        # WNOWAIT reserves the root PID/group identity even if bwrap exits
        # before its parent-death handler is installed. Never poll/reap early.
        while os.waitid(os.P_PID, process.pid, os.WEXITED | os.WNOWAIT | os.WNOHANG) is None:
            if time.monotonic() >= deadline:
                timed_out = True
                break
            time.sleep(0.01)
    except ChildProcessError as error:
        owned = False
        raise RuntimeError('Sandbox root ownership lost; no unverified group signalled') from error
    except BaseException as error:
        pending = error
    finally:
        signal.pthread_sigmask(signal.SIG_BLOCK, blocked)
        try:
            if process is not None and owned:
                stop_owned_group(process.pid)
                returncode = process.wait(timeout=5)  # Reap after the reserved group is stopped.
        finally:
            signal.pthread_sigmask(signal.SIG_SETMASK, previous)
    if pending is not None:
        raise pending
    if timed_out:
        raise TimeoutError('Parser exceeded wall bound; owned sandbox descendants stopped')
    return returncode


def sandbox_command(java_home, sdk, model, adapter, output):
    command = ['bwrap', '--unshare-all', '--die-with-parent', '--clearenv']
    for directory in ['/usr', '/lib', '/lib64']:
        command += ['--ro-bind', directory, directory]
    command += ['--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp']
    for host, guest in [(java_home, '/jdk'), (sdk, '/sdk'),
                        (model, '/workspace.dsl'), (adapter, '/ValidateWorkspace.java')]:
        command += ['--ro-bind', str(host), guest]
    command += ['--bind', str(output), '/output', '--setenv', 'HOME', '/tmp', '--setenv', 'LANG', 'C.UTF-8',
                '--', '/jdk/bin/java', '-Xms16m', '-Xmx' + str(PIN['heapMiB']) + 'm',
                '-XX:CompressedClassSpaceSize=64m', '-XX:MaxMetaspaceSize=256m', '-XX:ReservedCodeCacheSize=64m',
                '--class-path', '/sdk/*', '/ValidateWorkspace.java', '/workspace.dsl', '/output/report.json']
    return command


def read_model_input(source):
    parts = pathlib.Path(os.path.abspath(source)).parts
    directory = os.open(parts[0], os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        for part in parts[1:-1]:
            next_directory = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=directory)
            os.close(directory)
            directory = next_directory
        descriptor = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=directory)
        with os.fdopen(descriptor, 'rb') as stream:
            if not stat.S_ISREG(os.fstat(stream.fileno()).st_mode):
                raise ValueError('Model input must be a regular file without symbolic links')
            return stream.read(PIN['maxInputBytes'] + 1)
    except OSError as error:
        raise ValueError('Model input must be a regular file without symbolic links') from error
    finally:
        os.close(directory)


def validate(source):
    require_supported_platform()
    contents = read_model_input(source)
    if not contents or len(contents) > PIN['maxInputBytes']:
        raise ValueError('DSL input is empty or exceeds the pinned byte limit')
    jdk, war = list(archives())
    # Fresh extraction prevents mutable executable caches from becoming trusted inputs.
    with tempfile.TemporaryDirectory(prefix='architecture-structurizr-') as folder:
        root = pathlib.Path(folder)
        with tarfile.open(jdk) as archive:
            archive.extractall(root / 'java', filter='data')
        sdk = root / 'sdk'
        sdk.mkdir()
        with zipfile.ZipFile(war) as archive:
            for library in PIN['libraries']:
                target = sdk / library['name']
                target.write_bytes(archive.read('WEB-INF/lib/' + library['name']))
                if digest(target) != library['sha256'] or target.stat().st_size != library['size']:
                    raise ValueError('Bundled SDK dependency differs from reviewed pin')
        model = root / 'workspace.dsl'
        model.write_bytes(contents)
        adapter = root / 'ValidateWorkspace.java'
        adapter_bytes = (REPO / 'tools/structurizr/ValidateWorkspace.java').read_bytes()
        adapter.write_bytes(adapter_bytes)
        output = root / 'output'
        output.mkdir()
        command = sandbox_command(next((root / 'java').iterdir()), sdk, model, adapter, output)
        with (output / 'stdout.log').open('wb') as stdout, (output / 'stderr.log').open('wb') as stderr:
            returncode = run_bounded(command, stdout, stderr, {'PATH': '/usr/bin:/bin'})
        if returncode:
            with (output / 'stderr.log').open('rb') as stderr:
                raise ValueError('Isolated parser failed: ' + stderr.read(4096).decode(errors='replace'))
        report = output / 'report.json'
        if report.stat().st_size > PIN['maxReportBytes']:
            raise ValueError('Isolated parser report exceeds the pinned byte limit')
        result = json.loads(report.read_text())
        result['inputSha256'] = hashlib.sha256(contents).hexdigest()
        result['adapterSha256'] = hashlib.sha256(adapter_bytes).hexdigest()
        result['toolingLockSha256'] = hashlib.sha256(LOCK_BYTES).hexdigest()
        return result


def cancelled(signum, frame):
    raise InterruptedError('Host cancelled the isolated validation request')


if __name__ == '__main__':
    signal.signal(signal.SIGTERM, cancelled)
    try:
        if sys.argv[1:] == ['--prepare']:
            prepare()
            print('Pinned stock Structurizr and Java archives verified; validation remains offline')
        else:
            print(json.dumps(validate(sys.argv[1])))
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
