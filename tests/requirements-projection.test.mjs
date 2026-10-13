import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cp, mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { requirementsDigest, buildQrProjection, validateRequirementsProjection } from '../tools/validate-requirements-projection.mjs';

function fixture() {
  const source = 'a'.repeat(40);
  const record = {
    id: 'QR-001', owner: 'sjefsharp', scopeIds: ['factory'], status: 'approved',
    statement: 'Retain origin.', source: { repository: 'agentic-delivery-lab/agentic-delivery-architecture', sourceCommit: 'b'.repeat(40), path: 'architecture/quality/quality-scenarios.yml', sha256: 'c'.repeat(64), issue: 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11' },
    approval: { actor: 'sjefsharp', decisionReference: 'https://github.com/agentic-delivery-lab/agentic-delivery-requirements/pull/4', approvedAt: '2026-10-13' },
    verification: { criterion: 'Zero wrong-origin writes.', evidenceStatus: 'unverified', evidence: [] },
    qualityScenario: { name: 'origin', stakeholder: 'operator', concern: 'wrong write', stimulus: 'event', response: 'Retain origin.', measure: 'Zero wrong-origin writes.', historicalEvidence: ['ADR-0018'], historicalStatus: 'target; no live proof' },
  };
  const catalog = { schemaVersion: 1, catalogId: 'factory', requirements: [record, { id: 'FR-001', status: 'proposed', statement: 'Candidate' }] };
  const manifest = { schemaVersion: 1, requirementsId: 'urn:agentic-delivery:requirements:authority', sourceRepository: 'agentic-delivery-lab/agentic-delivery-requirements', repositoryId: 1416207421, version: '1.0.0', sourceCommit: source, contentSha256: '0'.repeat(64), status: 'approved', approval: record.approval, catalogPaths: ['requirements/factory.yml'], approvedRequirementIds: ['QR-001'] };
  const files = new Map([['manifests/requirements-release.json', JSON.stringify(manifest)], ['requirements/factory.yml', JSON.stringify(catalog)]]);
  const digest = requirementsDigest(files);
  manifest.contentSha256 = digest;
  files.set('manifests/requirements-release.json', JSON.stringify(manifest));
  const lock = { schemaVersion: 1, repository: manifest.sourceRepository, repositoryId: manifest.repositoryId, commit: 'd'.repeat(40), manifestPath: 'manifests/requirements-release.json', contentSha256: digest, version: '1.0.0', qrIds: ['QR-001'] };
  return { lock, files, manifest, catalog };
}

test('approved immutable baseline projects original QR fields without inventing satisfaction', () => {
  const { lock, files } = fixture();
  const result = buildQrProjection(lock, files);
  assert.equal(result.scenarios.length, 1);
  assert.equal(result.scenarios[0].status, 'target; no live proof');
  assert.equal(result.scenarios[0].id, 'QR-001');
});

test('draft, withdrawn, moving, wrong-origin and incomplete QR admission fail closed', () => {
  for (const mutate of [
    f => { f.manifest.status = 'draft'; },
    f => { f.manifest.status = 'withdrawn'; },
    f => { f.lock.commit = 'main'; },
    f => { f.manifest.repositoryId = 1; },
    f => { f.lock.qrIds = ['QR-999']; },
    f => { f.catalog.requirements[0].status = 'proposed'; },
    f => { delete f.catalog.requirements[0].approval; },
  ]) {
    const f = fixture(); mutate(f);
    f.files.set('manifests/requirements-release.json', JSON.stringify(f.manifest));
    f.files.set('requirements/factory.yml', JSON.stringify(f.catalog));
    assert.throws(() => buildQrProjection(f.lock, f.files));
  }
});

test('tampered requirement and nested authority pins cannot match a selected digest', () => {
  const f = fixture();
  f.catalog.requirements[0].qualityScenario.response = 'Mutated';
  f.files.set('requirements/factory.yml', JSON.stringify(f.catalog));
  assert.throws(() => buildQrProjection(f.lock, f.files), /digest/);
  const g = fixture();
  g.manifest.authorityDecision = { sourceCommit: 'e'.repeat(40) };
  g.files.set('manifests/requirements-release.json', JSON.stringify(g.manifest));
  assert.throws(() => buildQrProjection(g.lock, g.files), /digest/);
});

test('the actual selected baseline rejects an independently edited local QR projection', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const directory = await mkdtemp(path.join(tmpdir(), 'qr-projection-test-'));
  const sourceRoot = process.env.AGENTIC_SOURCE_ROOT_REQUIREMENTS ?? path.join(root, 'sources/requirements');
  try {
    await mkdir(path.join(directory, 'architecture/references'), { recursive: true });
    await mkdir(path.join(directory, 'architecture/quality'), { recursive: true });
    await cp(path.join(root, 'architecture/references/requirements.lock.json'), path.join(directory, 'architecture/references/requirements.lock.json'));
    const file = path.join(directory, 'architecture/quality/quality-scenarios.yml');
    await cp(path.join(root, 'architecture/quality/quality-scenarios.yml'), file);
    assert.equal((await validateRequirementsProjection(directory, { sourceRoot })).qrScenarios, 18);
    await writeFile(file, (await readFile(file, 'utf8')) + '# local independent edit\n');
    await assert.rejects(validateRequirementsProjection(directory, { sourceRoot }), /stale or locally edited/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
