"""Real OS negative controls for the same sandbox command used by validation."""
import json
import os
import pathlib
import socket
import sys
import tarfile
import tempfile
import time

sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'tools/structurizr'))
import runtime



with tempfile.TemporaryDirectory(prefix='architecture-isolation-test-') as directory:
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
    listener.close()
    report = json.loads((output / 'report.json').read_text())
    assert all(value is False for value in report.values())
    assert model.read_text() == 'read-only input'
    print(json.dumps({'guards': report, 'wallSeconds': round(time.monotonic() - started, 2),
                      'descendantsStopped': True, 'canonicalInputUnchanged': True}))
