import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { validateStructurizr } from '../tools/lib/structurizr.mjs';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('explicit trusted tooling root controls dispatch, policy, cache and report location', async (t) => {
  const selected = await mkdtemp(path.join(os.tmpdir(), 'architecture-tooling-root-'));
  t.after(() => rm(selected, { recursive: true, force: true }));
  await mkdir(path.join(selected, 'tools/structurizr'), { recursive: true });
  await mkdir(path.join(selected, 'architecture/references'), { recursive: true });
  await cp(path.join(root, 'architecture/models'), path.join(selected, 'architecture/models'), { recursive: true });
  await cp(path.join(root, 'architecture/diagrams'), path.join(selected, 'architecture/diagrams'), { recursive: true });
  const lock = JSON.parse(await readFile(path.join(root, 'architecture/references/tooling-lock.json')));
  lock.diagramRenderers.structurizr.views = ['alternate'];
  await writeFile(path.join(selected, 'architecture/references/tooling-lock.json'), JSON.stringify(lock));
  await writeFile(path.join(selected, 'tools/structurizr/ValidateWorkspace.java'), 'trusted protocol fixture adapter');
  // This fixture tests dispatch/provenance only; the separate corpus runs the real stock SDK.
  const fixture = `import pathlib,sys,json,hashlib
root=pathlib.Path(__file__).resolve().parents[2]
model={'people':[{'id':'1','name':'Alternate root'}]}
workspace={'model':model,'views':{'systemContextViews':[{'key':'alternate','elements':[{'id':'1'}],'relationships':[]}]}}
cache=root/'.cache/structurizr'
cache.mkdir(parents=True,exist_ok=True)
(cache/'fixture-marker').write_text('selected root')
digest=lambda data:hashlib.sha256(data).hexdigest()
print(json.dumps({'schemaVersion':1,'status':'parsed','workspace':workspace,'roundtrip':workspace,
'inspection':{'policy':'advisory','findings':[]},'inputSha256':digest(pathlib.Path(sys.argv[1]).read_bytes()),
'adapterSha256':digest((root/'tools/structurizr/ValidateWorkspace.java').read_bytes()),
 'toolingLockSha256':digest((root/'architecture/references/tooling-lock.json').read_bytes())}))
`;
  await writeFile(path.join(selected, 'tools/structurizr/runtime.py'), fixture);
  const report = await validateStructurizr(path.join(selected, 'architecture/models/workspace.dsl'), ['alternate'], selected);
  assert.equal(report.runtimeAdapterSha256, hash(fixture));
  assert.equal(report.selectedViews[0].elements[0].name, 'Alternate root');
  assert.equal(await readFile(path.join(selected, '.cache/structurizr/fixture-marker'), 'utf8'), 'selected root');
  const originalReport = await readFile(path.join(root, '.cache/structurizr/last-report.json')).catch(() => null);
  await run(process.execPath, [path.join(root, 'tools/validate-diagrams.mjs'), selected]);
  const written = JSON.parse(await readFile(path.join(selected, '.cache/structurizr/last-report.json')));
  assert.equal(written.runtimeAdapterSha256, hash(fixture));
  assert.deepEqual(written.selectedViews.map(({ key }) => key), ['alternate']);
  assert.deepEqual(await readFile(path.join(root, '.cache/structurizr/last-report.json')).catch(() => null), originalReport);
});
