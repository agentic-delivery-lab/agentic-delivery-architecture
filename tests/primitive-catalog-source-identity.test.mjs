import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';
import * as generator from '../tools/generate-adr-primitive-index.mjs';
import { parseRepositoryYaml } from '../tools/lib/yaml.mjs';
import { validateStructuredValue } from '../tools/validate-structured-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const lockPath = 'architecture/references/primitive-catalog.lock.yml';
const historicalCommit = '6392c3770219304a78393faac42276e12eb1525f';
const oldRepository = 'agentic-delivery-lab/agentic-delivery-primitives';
const currentRepository = 'agentic-delivery-lab/agentic-delivery-agent-customizations';
const repositoryId = 1380894656;
// Keep the actual historical fixture even when the working-tree lock advances.
// No fetching, replacement objects, generated writes or source checkout copies.
const { stdout: historicalBytes } = await promisify(execFile)('git', [
  '--no-lazy-fetch', '--no-replace-objects', 'show', `${historicalCommit}:${lockPath}`,
], {
  cwd: root, encoding: 'utf8', timeout: 10_000, maxBuffer: 1024 * 1024,
  env: { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))), GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' },
});
const historical = parseRepositoryYaml(historicalBytes, 'actual 6392 primitive catalog lock');

function candidate() {
  const lock = structuredClone(historical);
  lock.schemaVersion = 2;
  lock.source.repository = currentRepository;
  lock.source.repositoryId = repositoryId;
  return lock;
}

function semanticValidator() {
  assert.equal(typeof generator.validatePrimitiveCatalogLock, 'function', 'Generator must export validatePrimitiveCatalogLock(lock) for its source identity boundary');
  return generator.validatePrimitiveCatalogLock;
}

const validators = {
  schema: (lock) => validateStructuredValue(root, lockPath, lock),
  generator: (lock) => semanticValidator()(lock),
};

for (const [name, validate] of Object.entries(validators)) {
  test(`${name} preserves the actual historical schema-1 lock without native ID or data changes`, async () => {
    const lock = structuredClone(historical);
    assert.equal(lock.schemaVersion, 1);
    assert.equal(lock.source.repository, oldRepository);
    assert.equal(Object.hasOwn(lock.source, 'repositoryId'), false);
    await validate(lock);
    assert.deepEqual(lock, historical);
  });

  test(`${name} accepts schema 2 only with the current repository and numeric native identity`, async () => {
    const lock = candidate();
    const before = structuredClone(lock);
    await validate(lock);
    assert.deepEqual(lock, before, 'Validation must not rewrite source pins or primitives');
    assert.equal(lock.source.sourceCommit, historical.source.sourceCommit);
    assert.equal(lock.source.contentSha256, historical.source.contentSha256);
    assert.deepEqual(lock.primitives, historical.primitives);
  });

  test(`${name} prevents schema-1 downgrade and mixing old/new identity contracts`, async () => {
    const legacyWithId = structuredClone(historical);
    legacyWithId.source.repositoryId = repositoryId;
    const legacyWithNewName = structuredClone(historical);
    legacyWithNewName.source.repository = currentRepository;
    const downgraded = candidate();
    downgraded.schemaVersion = 1;
    const currentWithOldName = candidate();
    currentWithOldName.source.repository = oldRepository;
    for (const lock of [legacyWithId, legacyWithNewName, downgraded, currentWithOldName]) {
      await assert.rejects(async () => validate(lock));
    }
  });

  test(`${name} rejects missing, wrong, nonnumeric and unsafe native identities`, async () => {
    for (const id of [undefined, null, '1380894656', repositoryId + 1, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, [repositoryId], { id: repositoryId }]) {
      const lock = candidate();
      if (id === undefined) delete lock.source.repositoryId;
      else lock.source.repositoryId = id;
      await assert.rejects(async () => validate(lock), `Reject repositoryId ${JSON.stringify(id)}`);
    }
  });

  test(`${name} rejects repository identity aliases, URLs and path-boundary variants`, async () => {
    for (const repository of [
      'agentic-delivery-lab/agentic-delivery-agent-customizations-extra',
      `${currentRepository}/nested`, `${currentRepository}.git`, `https://github.com/${currentRepository}`,
      'agentic-delivery-lab/../agentic-delivery-agent-customizations',
      'agentic-delivery-lab\\agentic-delivery-agent-customizations',
      currentRepository.toUpperCase(), `${currentRepository} `, [currentRepository], null,
    ]) {
      const lock = candidate();
      lock.source.repository = repository;
      await assert.rejects(async () => validate(lock));
    }
  });

  test(`${name} rejects unknown or coerced schema versions`, async () => {
    for (const version of [undefined, null, 0, 3, '1', '2', [2]]) {
      const lock = candidate();
      if (version === undefined) delete lock.schemaVersion;
      else lock.schemaVersion = version;
      await assert.rejects(async () => validate(lock));
    }
  });

  test(`${name} requires immutable SHA and digest strings in both supported versions`, async () => {
    for (const base of [historical, candidate()]) {
      for (const field of ['sourceCommit', 'contentSha256']) {
        for (const invalid of [undefined, null, [base.source[field]], 123, 'main', base.source[field].toUpperCase(), `${base.source[field]}\n`]) {
          const lock = structuredClone(base);
          if (invalid === undefined) delete lock.source[field];
          else lock.source[field] = invalid;
          await assert.rejects(async () => validate(lock), `Reject ${field} ${JSON.stringify(invalid)}`);
        }
      }
    }
  });

  test(`${name} keeps root, source and primitive records closed in both versions`, async () => {
    for (const base of [historical, candidate()]) {
      for (const location of ['root', 'source', 'primitive']) {
        const lock = structuredClone(base);
        const record = location === 'root' ? lock : location === 'source' ? lock.source : lock.primitives[0];
        record.unrecognizedIdentity = repositoryId;
        await assert.rejects(async () => validate(lock));
      }
    }
  });
}

test('the current ADR/Primitive index explicitly selects schema 4 with native identity fields', async () => {
  const indexPath = 'architecture/generated/adr-primitive-index.json';
  const index = JSON.parse(await readFile(path.join(root, indexPath), 'utf8'));
  await validateStructuredValue(root, indexPath, index);
  assert.equal(index.schemaVersion, 4);
  assert.equal(index.primitiveRelease.repositoryId, repositoryId);
  assert.deepEqual(Object.keys(index).sort(), ['adrs', 'architecture', 'decisionInventory', 'domains', 'externalAdrs', 'primitiveRelease', 'primitives', 'schemaVersion', 'source', 'uncoveredAdrs'].sort());
  assert.deepEqual(Object.keys(index.primitiveRelease).sort(), ['repository', 'repositoryId', 'releaseId', 'version', 'sourceCommit', 'contentSha256', 'status'].sort());
  for (const primitive of index.primitives) {
    assert.equal(primitive.sourceRepositoryId, repositoryId);
    assert.deepEqual(Object.keys(primitive).sort(), ['id', 'kind', 'version', 'sourceRepository', 'sourceRepositoryId', 'sourceCommit', 'sourcePath', 'enforcement', 'adrs', 'localAdrs', 'externalAdrs', 'domains'].sort());
  }
});


test('actual historical schema-3 index and its schema remain accepted without identity rewriting', async () => {
  const indexPath = 'architecture/generated/adr-primitive-index.json';
  const git = async (file) => (await promisify(execFile)('git', ['--no-lazy-fetch', '--no-replace-objects', 'show', `${historicalCommit}:${file}`], {cwd: root, encoding: 'utf8'})).stdout;
  const index = JSON.parse(await git(indexPath));
  assert.equal(index.schemaVersion, 3);
  assert.equal(index.primitiveRelease.repository, oldRepository);
  await validateStructuredValue(root, indexPath, index);
  assert.equal(await readFile(path.join(root, 'architecture/contracts/adr-primitive-index.schema.json'), 'utf8'), await git('architecture/contracts/adr-primitive-index.schema.json'));
});

test('index contracts reject mixed versions, missing or wrong current native IDs and unknown versions', async () => {
  const indexPath = 'architecture/generated/adr-primitive-index.json';
  const current = JSON.parse(await readFile(path.join(root, indexPath), 'utf8'));
  for (const change of ['downgrade', 'unknown', 'missing ID', 'wrong ID', 'wrong row ID', 'old release name', 'old row name']) {
    const index = structuredClone(current);
    if (change === 'downgrade') index.schemaVersion = 3;
    if (change === 'unknown') index.schemaVersion = 5;
    if (change === 'missing ID') delete index.primitiveRelease.repositoryId;
    if (change === 'wrong ID') index.primitiveRelease.repositoryId += 1;
    if (change === 'wrong row ID') index.primitives[0].sourceRepositoryId += 1;
    if (change === 'old release name') index.primitiveRelease.repository = oldRepository;
    if (change === 'old row name') index.primitives[0].sourceRepository = oldRepository;
    await assert.rejects(validateStructuredValue(root, indexPath, index), change);
  }
});
