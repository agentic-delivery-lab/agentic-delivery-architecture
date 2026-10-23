"""Real OS negative controls for the same sandbox command used by validation."""
import json
import ctypes
from contextlib import contextmanager
import os
import pathlib
import socket
import signal
import sys
import tarfile
import tempfile
import time
from unittest.mock import patch

sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'tools/structurizr'))
import runtime

runtime.require_supported_platform()
signal.signal(signal.SIGTERM, runtime.cancelled)


def own_children():
    parent = os.getpid()
    return [int(pid) for pid in pathlib.Path(f'/proc/{parent}/task/{parent}/children').read_text().split()]


def assert_no_survivors():
    live = []
    for pid in own_children():
        fields = pathlib.Path(f'/proc/{pid}/stat').read_text().rsplit(')', 1)[1].split()
        if fields[0] not in ('Z', 'X'):
            live.append(pid)
        else:
            os.waitpid(pid, 0)
    assert not live, f'Owned sandbox survivors after cancellation: {live}'


@contextmanager
def observe_orphans():
    # Test-only kernel observation independent of the wrapper's group scanner.
    libc = ctypes.CDLL(None, use_errno=True)
    libc.prctl.argtypes = [ctypes.c_int] + [ctypes.c_ulong] * 4
    libc.prctl.restype = ctypes.c_int
    previous = ctypes.c_int()
    assert libc.prctl(37, ctypes.addressof(previous), 0, 0, 0) == 0  # PR_GET_CHILD_SUBREAPER
    assert libc.prctl(36, 1, 0, 0, 0) == 0  # PR_SET_CHILD_SUBREAPER
    try:
        yield
    finally:
        deadline = time.monotonic() + 5
        # Every listed PID is our own unreaped child; no unrelated process is targeted.
        while own_children():
            for pid in own_children():
                fields = pathlib.Path(f'/proc/{pid}/stat').read_text().rsplit(')', 1)[1].split()
                if fields[0] in ('Z', 'X'):
                    os.waitpid(pid, 0)
                else:
                    os.kill(pid, signal.SIGKILL)
            if time.monotonic() >= deadline:
                raise AssertionError('Test could not stop its owned children')
            time.sleep(0.01)
        assert libc.prctl(36, previous.value, 0, 0, 0) == 0



with tempfile.TemporaryDirectory(prefix='architecture-isolation-test-') as directory, observe_orphans():
    root = pathlib.Path(directory)
    jdk, _ = list(runtime.archives())
    with tarfile.open(jdk) as archive:
        archive.extractall(root / 'java', filter='data')
    sdk, output = root / 'sdk', root / 'output'
    sdk.mkdir()
    output.mkdir()
    model = root / 'workspace.dsl'
    model.write_text('read-only input')
    secret = root / 'host-secret'
    secret.write_text('private canary')
    listener = socket.socket()
    listener.bind(('127.0.0.1', 0))
    listener.listen()
    port = listener.getsockname()[1]
    adapter = root / 'ValidateWorkspace.java'
    adapter.write_text('''
import java.nio.file.*;
import java.net.*;
public class ValidateWorkspace {
  public static void main(String[] args) throws Exception {
    if (System.getenv("W19_ISOLATION_CANARY") != null) throw new Exception("Inherited secret environment");
    try { Files.readString(Path.of(HOST_SECRET)); throw new Exception("Host secret readable"); }
    catch (NoSuchFileException expected) { }
    try { Files.writeString(Path.of("/workspace.dsl"), "mutated"); throw new Exception("Source writable"); }
    catch (java.nio.file.FileSystemException expected) { }
    try (Socket socket = new Socket()) {
      try { socket.connect(new InetSocketAddress("127.0.0.1", PORT), 1000); throw new Exception("Host network reachable"); }
      catch (java.io.IOException expected) { }
    }
    Files.writeString(Path.of("/output/report.json"), "{\\"environment\\":false,\\"hostSecretRead\\":false,\\"sourceWrite\\":false,\\"hostNetwork\\":false}");
    Thread.sleep(120000);
  }
}
'''.replace('HOST_SECRET', json.dumps(str(secret))).replace('PORT', str(port)))
    command = runtime.sandbox_command(next((root / 'java').iterdir()), sdk, model, adapter, output)
    env = {'PATH': '/usr/bin:/bin', 'W19_ISOLATION_CANARY': 'must-not-enter-sandbox'}
    with (output / 'stdout').open('wb') as stdout, (output / 'stderr').open('wb') as stderr:
        started = time.monotonic()
        try:
            runtime.run_bounded(command, stdout, stderr, env)
        except TimeoutError as error:
            assert 'descendants stopped' in str(error)
        else:
            raise AssertionError('Probe exited before wall bound: ' + (output / 'stderr').read_text()[:4096])
    assert_no_survivors()
    normal_wall = time.monotonic() - started
    early = []
    for seconds in (0.001, 0.01, 0.05, 0.1, 0.5):
        with patch.dict(runtime.PIN, {'wallSeconds': seconds}):
            with (output / 'early-stdout').open('wb') as stdout, (output / 'early-stderr').open('wb') as stderr:
                try:
                    runtime.run_bounded(command, stdout, stderr, env)
                except TimeoutError as error:
                    assert 'descendants stopped' in str(error)
                    assert_no_survivors()
                    early.append(seconds)
                else:
                    raise AssertionError('Early-cancellation fixture unexpectedly completed')
    # Deliver a real cancellation after fork/exec but before Popen hands
    # ownership back to run_bounded. No thread or upstream modification needed.
    started_processes = []
    real_start = runtime.subprocess.Popen
    def spawn_then_cancel(*args, **kwargs):
        process = real_start(*args, **kwargs)
        started_processes.append(process)
        os.kill(os.getpid(), signal.SIGTERM)
        return process
    previous_handler = signal.signal(signal.SIGTERM, runtime.cancelled)
    try:
        with patch.object(runtime.subprocess, 'Popen', side_effect=spawn_then_cancel):
            with (output / 'spawn-stdout').open('wb') as stdout, (output / 'spawn-stderr').open('wb') as stderr:
                try:
                    runtime.run_bounded(command, stdout, stderr, env)
                except InterruptedError:
                    pass
                else:
                    raise AssertionError('Cancellation at spawn was not delivered')
        assert started_processes and all(p.returncode is not None for p in started_processes)
        assert_no_survivors()
    finally:
        for process in started_processes:
            if process.returncode is None:
                runtime.stop_owned_group(process.pid)
                process.wait(timeout=5)
        signal.signal(signal.SIGTERM, previous_handler)
    listener.close()
    report = json.loads((output / 'report.json').read_text())
    assert all(value is False for value in report.values())
    assert model.read_text() == 'read-only input'
    print(json.dumps({'guards': report, 'wallSeconds': round(normal_wall, 2),
                      'descendantsStopped': True, 'earlyCancellationSeconds': early, 'spawnCancellationStopped': True, 'orphanSurvivors': 0, 'canonicalInputUnchanged': True}))
