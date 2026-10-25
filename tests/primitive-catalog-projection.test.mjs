import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as projection from '../tools/primitive-catalog-source.mjs';
import { validatePrimitiveCatalogLock } from '../tools/generate-adr-primitive-index.mjs';

// Synthetic metadata only. These pins are not admitted release/source evidence.
const repository = 'agentic-delivery-lab/agentic-delivery-agent-customizations';
const repositoryId = 1380894656;
const architectureId = 'urn:agentic-delivery:architecture:authority';
function sourceFixture() {
  return {
    repository,
    repositoryId,
    manifestCommit: 'b'.repeat(40),
    manifest: {
      $schema: '../schemas/primitive-release.schema.json',
      schemaVersion: 1,
      releaseId: 'urn:agentic-delivery:primitive-release:0.1.0-synthetic.1',
      version: '0.1.0-synthetic.1',
      status: 'draft',
      architecture: { id: architectureId },
      sourceCommit: 'a'.repeat(40),
      contentSha256: 'c'.repeat(64),
      capabilityPolicyVersion: '0.1.0',
    },
    catalog: {
      $schema: '../schemas/primitive-catalog.schema.json',
      schemaVersion: 1,
      architectureId,
      primitives: [
        { id: 'synthetic-agent', kind: 'agent', version: '0.2.0', path: 'agents/synthetic-agent.md',
          enforcement: 'instructional', adrs: ['ADR-0009'], decisionIds: ['ADR-0009'], domains: ['agentic-delivery-control-plane'] },
        { id: 'synthetic-guard', kind: 'validator', version: '0.1.0', path: 'validators/synthetic-guard.py',
          enforcement: 'deterministic', adrs: ['ADR-0004', 'ADR-0007'], decisionIds: ['ADR-0004', 'ADR-0007'], domains: ['agentic-delivery-governance'] },
      ],
    },
  };
}

function expectedLock() {
  return {
    schemaVersion: 2,
    source: {
      repository, repositoryId,
      releaseId: 'urn:agentic-delivery:primitive-release:0.1.0-synthetic.1',
      releaseVersion: '0.1.0-synthetic.1',
      sourceCommit: 'b'.repeat(40),
      contentSha256: 'c'.repeat(64),
      status: 'draft',
    },
    architectureId,
    primitives: [
      { id: 'synthetic-agent', kind: 'agent', version: '0.2.0', sourcePath: 'agents/synthetic-agent.md',
        enforcement: 'instructional', adrs: ['ADR-0009'], domains: ['agentic-delivery-control-plane'] },
      { id: 'synthetic-guard', kind: 'validator', version: '0.1.0', sourcePath: 'validators/synthetic-guard.py',
        enforcement: 'deterministic', adrs: ['ADR-0004', 'ADR-0007'], domains: ['agentic-delivery-governance'] },
    ],
  };
}

function api() {
  assert.equal(typeof projection.projectPrimitiveCatalog, 'function');
  assert.equal(typeof projection.assertPrimitiveCatalogProjection, 'function');
  return projection;
}

test('pure projection maps exact manifest provenance and catalog rows into the current closed lock', () => {
  const source = sourceFixture();
  const before = structuredClone(source);
  const lock = api().projectPrimitiveCatalog(source);
  assert.deepEqual(lock, expectedLock());
  assert.notEqual(lock.source.sourceCommit, source.manifest.sourceCommit, 'Manifest commit and prepared source commit must not be substituted');
  assert.doesNotThrow(() => validatePrimitiveCatalogLock(lock));
  assert.doesNotThrow(() => api().assertPrimitiveCatalogProjection(lock, source));
  assert.deepEqual(source, before, 'Projection and verification must not mutate source metadata');
  assert.equal(Object.hasOwn(lock, '$schema'), false);
  assert.ok(lock.primitives.every((row) => !Object.hasOwn(row, 'decisionIds') && !Object.hasOwn(row, 'path')));
});

test('projection rejects unsupported or coerced manifest and catalog contract versions', () => {
  const { projectPrimitiveCatalog } = api();
  for (const document of ['manifest', 'catalog']) {
    for (const version of [undefined, null, 0, 2, '1', [1]]) {
      const source = sourceFixture();
      if (version === undefined) delete source[document].schemaVersion;
      else source[document].schemaVersion = version;
      assert.throws(() => projectPrimitiveCatalog(source));
    }
  }
});

test('projection rejects malformed release and primitive versions without coercion', () => {
  const { projectPrimitiveCatalog } = api();
  for (const version of [undefined, null, 'bad', '0.1', ['0.1.0']]) {
    const source = sourceFixture();
    source.manifest.version = version;
    assert.throws(() => projectPrimitiveCatalog(source));
    const rowSource = sourceFixture();
    rowSource.catalog.primitives[0].version = version;
    assert.throws(() => projectPrimitiveCatalog(rowSource));
  }
  const mismatched = sourceFixture();
  mismatched.manifest.releaseId = 'urn:agentic-delivery:primitive-release:9.9.9';
  assert.throws(() => projectPrimitiveCatalog(mismatched));
});

test('projection requires the exact current repository and numeric native identity', () => {
  const { projectPrimitiveCatalog } = api();
  for (const name of [undefined, 'agentic-delivery-lab/agentic-delivery-primitives', `${repository}/extra`, `${repository}.git`, [repository]]) {
    const source = sourceFixture();
    source.repository = name;
    assert.throws(() => projectPrimitiveCatalog(source));
  }
  for (const id of [undefined, null, `${repositoryId}`, repositoryId + 1, Number.MAX_SAFE_INTEGER + 1, [repositoryId]]) {
    const source = sourceFixture();
    source.repositoryId = id;
    assert.throws(() => projectPrimitiveCatalog(source));
  }
});

test('projection requires exact immutable manifest commit and content digest strings', () => {
  const { projectPrimitiveCatalog } = api();
  for (const value of [undefined, null, 'main', ['b'.repeat(40)], `${'b'.repeat(40)}\n`, 'b'.repeat(39)]) {
    const source = sourceFixture();
    source.manifestCommit = value;
    assert.throws(() => projectPrimitiveCatalog(source));
  }
  for (const value of [undefined, null, 'latest', ['c'.repeat(64)], `${'c'.repeat(64)}\n`, 'c'.repeat(63)]) {
    const source = sourceFixture();
    source.manifest.contentSha256 = value;
    assert.throws(() => projectPrimitiveCatalog(source));
  }
});

test('projection rejects duplicate IDs and rows that violate existing primitive lock semantics', () => {
  const { projectPrimitiveCatalog } = api();
  const duplicate = sourceFixture();
  duplicate.catalog.primitives.push(structuredClone(duplicate.catalog.primitives[0]));
  assert.throws(() => projectPrimitiveCatalog(duplicate));
  for (const [field, value] of [['kind', 'unknown'], ['enforcement', 'unknown'], ['path', ''], ['adrs', []], ['domains', []]]) {
    const source = sourceFixture();
    source.catalog.primitives[0][field] = value;
    assert.throws(() => projectPrimitiveCatalog(source));
  }
  const wrongArchitecture = sourceFixture();
  wrongArchitecture.catalog.architectureId = 'urn:unrelated:architecture';
  assert.throws(() => projectPrimitiveCatalog(wrongArchitecture));
});

test('projection assertion rejects valid-looking but wrong provenance and identity in the lock', () => {
  const { assertPrimitiveCatalogProjection } = api();
  for (const [field, value] of [
    ['sourceCommit', 'd'.repeat(40)], ['contentSha256', 'e'.repeat(64)],
    ['repository', 'agentic-delivery-lab/agentic-delivery-primitives'], ['repositoryId', repositoryId + 1],
    ['status', 'released'], ['releaseVersion', '9.9.9'],
  ]) {
    const lock = expectedLock();
    lock.source[field] = value;
    assert.throws(() => assertPrimitiveCatalogProjection(lock, sourceFixture()));
  }
});

test('projection assertion rejects missing, extra and duplicate current rows', () => {
  const { assertPrimitiveCatalogProjection } = api();
  const missing = expectedLock();
  missing.primitives.pop();
  const extra = expectedLock();
  extra.primitives.push({ ...structuredClone(extra.primitives[0]), id: 'synthetic-extra' });
  const duplicate = expectedLock();
  duplicate.primitives.push(structuredClone(duplicate.primitives[0]));
  for (const lock of [missing, extra, duplicate]) assert.throws(() => assertPrimitiveCatalogProjection(lock, sourceFixture()));
});

test('projection assertion rejects changed path, version, ADR, enforcement and domain mappings', () => {
  const { assertPrimitiveCatalogProjection } = api();
  for (const [field, value] of [
    ['sourcePath', 'agents/different.md'], ['version', '0.3.0'], ['adrs', ['ADR-0007']],
    ['enforcement', 'semantic'], ['domains', ['agentic-delivery-governance']],
  ]) {
    const lock = expectedLock();
    lock.primitives[0][field] = value;
    assert.throws(() => assertPrimitiveCatalogProjection(lock, sourceFixture()));
  }
});

test('projection assertion detects drift in the supplied source, not only malformed lock fields', () => {
  const { assertPrimitiveCatalogProjection } = api();
  for (const change of ['commit', 'digest', 'missing row', 'extra row', 'path', 'version', 'ADR', 'identity']) {
    const source = sourceFixture();
    if (change === 'commit') source.manifestCommit = 'd'.repeat(40);
    if (change === 'digest') source.manifest.contentSha256 = 'e'.repeat(64);
    if (change === 'missing row') source.catalog.primitives.pop();
    if (change === 'extra row') source.catalog.primitives.push({ ...structuredClone(source.catalog.primitives[0]), id: 'synthetic-extra' });
    if (change === 'path') source.catalog.primitives[0].path = 'agents/different.md';
    if (change === 'version') source.catalog.primitives[0].version = '0.3.0';
    if (change === 'ADR') source.catalog.primitives[0].adrs = ['ADR-0007'];
    if (change === 'identity') source.repositoryId += 1;
    assert.throws(() => assertPrimitiveCatalogProjection(expectedLock(), source));
  }
});
