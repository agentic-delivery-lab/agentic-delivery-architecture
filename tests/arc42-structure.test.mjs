import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { validateArc42Structure } from '../tools/validate-arc42-structure.mjs';
import { validateArchitectureContracts } from '../tools/validate-architecture-contracts.mjs';
import { validateArchitectureRelease } from '../tools/validate-architecture-release.mjs';
import { validateConformanceRequest } from '../tools/validate-conformance-request.mjs';
import { architectureContentDigest } from '../tools/architecture-content-digest.mjs';
import { validateDiagrams } from '../tools/validate-diagrams.mjs';
import { validateDecisionInventory } from '../tools/decision-inventory.mjs';
import { validateStructuredData, validateStructuredValue } from '../tools/validate-structured-data.mjs';
import { parseRepositoryYaml } from '../tools/lib/yaml.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('official arc42 chapter structure is complete', async () => {
  assert.deepEqual(await validateArc42Structure(root), { chapters: 12 });
});

test('arc42 contract rejects legacy suffixes and non-template headings', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'architecture-arc42-'));
  const chapters = path.join(fixture, 'architecture/arc42');
  try {
    await cp(path.join(root, 'architecture/arc42'), chapters, { recursive: true });
    await mkdir(path.join(fixture, 'architecture/generated'), { recursive: true });
    await cp(
      path.join(root, 'architecture/generated/architecture-release.json'),
      path.join(fixture, 'architecture/generated/architecture-release.json'),
    );
    const chapter = path.join(chapters, '01-introduction-and-goals.md');
    await rename(chapter, `${chapter}.arc42`);
    await assert.rejects(validateArc42Structure(fixture), /must exactly match the twelve pinned chapter paths/);

    await rename(`${chapter}.arc42`, chapter);
    const original = await readFile(chapter, 'utf8');
    await writeFile(chapter, original.replace('# 1. Introduction and Goals', '# 1. Wrong Heading'));
    await assert.rejects(validateArc42Structure(fixture), /must start with the pinned official arc42 heading/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('architecture contracts and aliases are deterministic', async () => {
  assert.deepEqual(await validateArchitectureContracts(root), { schemas: 6, aliases: 19 });
});

test('all authoritative structured data uses closed Draft 2020-12 contracts', async () => {
  assert.deepEqual(await validateStructuredData(root), { files: 17, schemas: 20 });

  const principleIndex = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/principles/index.yml'), 'utf8'),
    'principle index test fixture',
  );
  principleIndex.unexpectedProperty = true;
  await assert.rejects(
    validateStructuredValue(root, 'architecture/principles/index.yml', principleIndex),
    /must NOT have additional properties/,
  );

  const missingRequired = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/principles/index.yml'), 'utf8'),
    'principle index missing-field fixture',
  );
  delete missingRequired.principles;
  await assert.rejects(
    validateStructuredValue(root, 'architecture/principles/index.yml', missingRequired),
    /must have required property 'principles'/,
  );

  const contextMap = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/domain/context-map.yml'), 'utf8'),
    'context map test fixture',
  );
  contextMap.boundedContexts[0] = 'architecture-authority';
  await assert.rejects(
    validateStructuredValue(root, 'architecture/domain/context-map.yml', contextMap),
    /must be equal to one of the allowed values/,
  );
});

test('structured-data check rejects an invalid schema definition', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'architecture-schema-'));
  const contracts = path.join(fixture, 'architecture/contracts');
  try {
    await cp(path.join(root, 'architecture/contracts'), contracts, { recursive: true });
    const schemaPath = path.join(contracts, 'principle-index.schema.json');
    const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
    schema.properties.schemaVersion = { type: 'not-a-json-schema-type' };
    await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
    await assert.rejects(validateStructuredData(fixture), /is not a valid Draft 2020-12 schema/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('ADR/Primitive traceability resolves only through the canonical Architecture inventory', async () => {
  const index = JSON.parse(await readFile(path.join(root, 'architecture/generated/adr-primitive-index.json'), 'utf8'));
  const indexSchema = JSON.parse(await readFile(path.join(root, 'architecture/contracts/adr-primitive-index.schema.json'), 'utf8'));
  const release = JSON.parse(await readFile(path.join(root, 'architecture/generated/architecture-release.json'), 'utf8'));
  const inventory = await validateDecisionInventory(root);
  assert.equal(index.schemaVersion, 3);
  assert.equal(indexSchema.title, 'Architecture ADR to Primitive index v3');
  assert.equal(indexSchema.properties.schemaVersion.const, 3);
  assert.equal(release.contractVersions.adrPrimitiveIndex, '3.0.0');
  assert.equal(index.source, 'released-primitive-catalog');
  assert.match(index.primitiveRelease.sourceCommit, /^[0-9a-f]{40}$/);
  assert.ok(index.primitives.length > 0);
  assert.ok(index.primitives.every((primitive) => primitive.sourceRepository === 'agentic-delivery-lab/agentic-delivery-primitives'));
  assert.ok(index.primitives.every((primitive) => !primitive.sourcePath.startsWith('docs/')));
  assert.deepEqual(index.externalAdrs, []);
  assert.ok(index.primitives.every((primitive) => primitive.externalAdrs.length === 0 && primitive.adrs.every((id) => primitive.localAdrs.includes(id))));
  assert.ok(index.primitives.every((primitive) => primitive.adrs.every((id) => inventory.recordById.has(id))));
  assert.equal(index.decisionInventory.path, 'architecture/references/decision-inventory.yml');
  assert.match(index.decisionInventory.sha256, /^[0-9a-f]{64}$/);
});

test('canonical inventory has exact record coverage and rejects projections and duplicate IDs', async () => {
  const result = await validateDecisionInventory(root);
  const release = JSON.parse(await readFile(path.join(root, 'architecture/generated/architecture-release.json'), 'utf8'));
  assert.equal(result.decisionIds.length, 21);
  assert.equal(result.adrIds.length, 19);
  assert.ok(result.recordById.has('ADP-0001'));
  assert.ok(result.recordById.has('ADD-0001'));
  assert.equal(result.importedTransforms.length, 9);
  assert.deepEqual(release.decisionIds, result.decisionIds);
  assert.deepEqual(release.adrIds, result.adrIds.map((id) => `urn:agentic-delivery:adr:architecture:${id.slice(4)}`));
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'architecture/generated/adr-primitive-index.json'), 'utf8')).externalAdrs, []);

  const orgWideRecords = {
    'ADR-0002': '0a1e105b8decd7fde8ef6b7bc6d3598462416d4b35c019dfe72bb05449acdc8f',
    'ADR-0004': '8fedc47ccf0f680848bae42fc784216707058f1cf5e3737ba317923a82d42923',
    'ADR-0005': '92b57bac30a25b34529bb18cf3d325a40bce78a7e09f3340ca9d4556815f1962',
    'ADR-0006': '960899e2bd61f7cf9bfd7e36b0b858eb347c050b5c174a4dc0acc502e0a0c8f1',
    'ADR-0007': 'bd118215329f889cb2bd8a6bd7f59ecb6279ccaba787e6f318d2c2df26675895',
  };
  for (const [id, sha256] of Object.entries(orgWideRecords)) {
    const origin = result.recordById.get(id).origin;
    assert.equal(origin.type, 'architecture-baseline');
    assert.equal(origin.repositoryId, 1380894616);
    assert.equal(origin.sha256, sha256);
  }
  assert.equal(result.recordById.get('ADR-0018').origin.reviewEvidence, 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/pull/2');
  const historicalAdr18 = result.inventory.historicalVariants.find((variant) => variant.id === 'ADR-0018');
  assert.equal(historicalAdr18.sha256, 'b94dabcb84fe7da679a0441442e97646196ae4bb88d4b0e9ad983a9519b4eef5');
  assert.match(historicalAdr18.disposition, /older duplicate.*Architecture PR #2.*canonical/i);

  const withDuplicate = structuredClone(result.inventory);
  withDuplicate.records[1].id = withDuplicate.records[0].id;
  await assert.rejects(validateDecisionInventory(root, { inventory: withDuplicate }), /must be a unique ADR, ADP, or ADD identifier/);

  const proposedDomainDrift = structuredClone(result.inventory);
  proposedDomainDrift.records.find((record) => record.id === 'ADR-0020').domains = ['agentic-delivery-governance'];
  await assert.rejects(validateDecisionInventory(root, { inventory: proposedDomainDrift }), /domains must match the record's bounded-context frontmatter/);

  const withExternalProjection = structuredClone(result.inventory);
  withExternalProjection.externalAdrs = [];
  await assert.rejects(validateDecisionInventory(root, { inventory: withExternalProjection }), /external ADR projections are forbidden/);

  const withUnknownProperty = structuredClone(result.inventory);
  withUnknownProperty.records[0].unexpected = true;
  await assert.rejects(validateDecisionInventory(root, { inventory: withUnknownProperty }), /records\[0\] contains unsupported property unexpected/);

  const withWrongPath = structuredClone(result.inventory);
  withWrongPath.records[0].path = withWrongPath.records[1].path;
  await assert.rejects(validateDecisionInventory(root, { inventory: withWrongPath }), /canonical decisions file/);

  const withChangedOriginHash = structuredClone(result.inventory);
  withChangedOriginHash.records.find((record) => record.id === 'ADR-0008').origin.sha256 = '0'.repeat(64);
  await assert.rejects(validateDecisionInventory(root, { inventory: withChangedOriginHash }), /does not match git show/);
});

test('diagram sources remain model-first and structurally valid', async () => {
  assert.deepEqual(await validateDiagrams(root), { structurizr: 1, mermaid: 2, plantuml: 1 });
});

test('architecture release identifies the target authority', async () => {
  const result = await validateArchitectureRelease(root);
  const release = JSON.parse(await readFile(path.join(root, 'architecture/generated/architecture-release.json'), 'utf8'));
  const releaseSchema = JSON.parse(await readFile(path.join(root, 'architecture/contracts/architecture-release.schema.json'), 'utf8'));
  assert.equal(result.architectureId, 'urn:agentic-delivery:architecture:authority');
  assert.match(result.contentSha256, /^[0-9a-f]{64}$/);
  assert.equal(result.status, 'draft');
  assert.equal(release.contractVersions.architectureRelease, '4.0.0');
  assert.equal(releaseSchema.properties.contractVersions.properties.architectureRelease.const, '4.0.0');
  assert.match(releaseSchema.description, /consumers to dispatch by version/);
});

test('architecture release sourceCommit contains the digest-pinned authored tree', async () => {
  const release = JSON.parse(await readFile(path.join(root, 'architecture/generated/architecture-release.json'), 'utf8'));
  const result = await validateArchitectureRelease(root, release.sourceCommit);
  assert.equal(result.sourceCommit, release.sourceCommit);
  assert.equal(result.contentSha256, release.contentSha256);
});

test('architecture content digest is deterministic for a pinned tree', async () => {
  const first = await architectureContentDigest(root, 'HEAD');
  const second = await architectureContentDigest(root, 'HEAD');
  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(first, second);
});

test('conformance requests bind implementation and Architecture commits', () => {
  const architectureCommit = '0123456789abcdef0123456789abcdef01234567';
  const result = validateConformanceRequest({
    schemaVersion: 1,
    architectureCommit,
    architectureDigest: 'a'.repeat(64),
    implementationCommit: 'fedcba9876543210fedcba9876543210fedcba98',
    affectedIdentifiers: ['urn:agentic-delivery:architecture:authority'],
  }, architectureCommit);
  assert.deepEqual(result.affectedIdentifiers, ['urn:agentic-delivery:architecture:authority']);
  assert.throws(() => validateConformanceRequest({
    schemaVersion: 1,
    architectureCommit,
    architectureDigest: 'a'.repeat(64),
    implementationCommit: 'fedcba9876543210fedcba9876543210fedcba98',
    affectedIdentifiers: ['duplicate', 'duplicate'],
  }, architectureCommit), /must be unique/);
});
