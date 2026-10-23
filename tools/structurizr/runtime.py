"""Bounded adapter runtime for the existing diagram validator, Linux x64 only."""
import hashlib
import json
import os
import pathlib
import platform
import resource
import signal
import select
import time
import subprocess
import sys
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


def prepare():
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


def run_bounded(command, stdout, stderr, env):
    process = subprocess.Popen(command, stdout=stdout, stderr=stderr, preexec_fn=limits,
                               env=env, start_new_session=True)
    try:
        return process.wait(timeout=PIN['wallSeconds'])
    except BaseException as error:
        # Only Popen.kill() signals a process. Its unreaped child cannot have
        # its PID reused. Stock bwrap --die-with-parent and the private PID
        # namespace stop descendants; direct-child pidfds only observe this.
        handles = []
        changed = []
        try:
            try:
                children = pathlib.Path(f'/proc/{process.pid}/task/{process.pid}/children').read_text().split()
            except FileNotFoundError:
                children = []
            for child in children:
                pid = int(child)
                try:
                    stat = pathlib.Path(f'/proc/{pid}/stat')
                    before = stat.read_text().rsplit(')', 1)[1].split()
                    if int(before[1]) != process.pid:
                        changed.append(pid)
                        continue
                    handle = os.pidfd_open(pid)
                    try:
                        after = stat.read_text().rsplit(')', 1)[1].split()
                        if after[19] != before[19] or int(after[1]) != process.pid:
                            changed.append(pid)
                            os.close(handle)
                            continue
                    except FileNotFoundError:
                        os.close(handle)
                        continue
                    handles.append(handle)
                except (FileNotFoundError, ProcessLookupError):
                    pass
        finally:
            try:
                process.kill()
                process.wait(timeout=5)
                deadline = time.monotonic() + 5
                for handle in handles:
                    poll = select.poll()
                    poll.register(handle, select.POLLIN)
                    if not poll.poll(max(0, int((deadline - time.monotonic()) * 1000))):
                        raise RuntimeError('Sandbox cleanup uncertain after deadline; process admission failed')
            finally:
                for handle in handles:
                    os.close(handle)
        if changed:
            raise RuntimeError('Sandbox child identity changed; unverified PID was not signalled') from error
        if isinstance(error, subprocess.TimeoutExpired):
            raise TimeoutError('Parser exceeded wall bound; owned sandbox descendants stopped') from error
        raise


def sandbox_command(java_home, sdk, model, adapter, output):
    command = ['bwrap', '--unshare-all', '--die-with-parent', '--new-session', '--clearenv']
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


def validate(source):
    if platform.system() != 'Linux' or platform.machine() not in ('x86_64', 'AMD64'):
        raise ValueError('This admitted artifact candidate is Linux x64 only')
    with pathlib.Path(source).open('rb') as stream:
        contents = stream.read(PIN['maxInputBytes'] + 1)
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
