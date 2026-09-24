import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { validateArc42Structure } from '../tools/validate-arc42-structure.mjs';
import { validateArchitectureContracts } from '../tools/validate-architecture-contracts.mjs';
import { validateArchitectureRelease } from '../tools/validate-architecture-release.mjs';
import { validateConformanceRequest } from '../tools/validate-conformance-request.mjs';
import { architectureContentDigest } from '../tools/architecture-content-digest.mjs';
import { validateDiagrams } from '../tools/validate-diagrams.mjs';
import { validateOwnerProjection } from '../tools/generate-adr-primitive-index.mjs';
import { parseRepositoryYaml } from '../tools/lib/yaml.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('official arc42 chapter structure is complete', async () => {
  assert.deepEqual(await validateArc42Structure(root), { chapters: 12 });
});

test('architecture contracts and aliases are deterministic', async () => {
  assert.deepEqual(await validateArchitectureContracts(root), { schemas: 6, aliases: 8 });
});

test('ADR/Primitive traceability uses a pinned release projection', async () => {
  const index = JSON.parse(await readFile(path.join(root, 'architecture/generated/adr-primitive-index.json'), 'utf8'));
  assert.equal(index.source, 'released-primitive-catalog');
  assert.match(index.primitiveRelease.sourceCommit, /^[0-9a-f]{40}$/);
  assert.ok(index.primitives.length > 0);
  assert.ok(index.primitives.every((primitive) => primitive.sourceRepository === 'agentic-delivery-lab/agentic-delivery-primitives'));
  assert.ok(index.primitives.every((primitive) => !primitive.sourcePath.startsWith('docs/')));
  assert.ok(index.externalAdrs.some((adr) => adr.id === 'ADR-0009'
    && adr.owner.repositoryId === 1358455028
    && adr.owner.canonicalPath === 'docs/decisions/0009-run-codex-from-source-issues-with-a-budget-boundary.md'
    && /^[0-9a-f]{64}$/.test(adr.owner.sha256)));
});

test('external ADR owner projection requires immutable identity and file digests', async () => {
  const projection = parseRepositoryYaml(await readFile(path.join(root, 'architecture/references/adr-owner-projection.yml'), 'utf8'), 'test owner projection');
  const owners = validateOwnerProjection(projection);
  assert.equal(owners.get('ADR-0002').canonicalPath, 'docs/decisions/0002-use-plain-language-for-human-agent-communication.md');
  assert.throws(() => validateOwnerProjection({
    ...projection,
    owner: { ...projection.owner, repositoryId: 1 },
  }), /repository ID is invalid/);
  assert.throws(() => validateOwnerProjection({
    ...projection,
    records: projection.records.map((record, index) => index === 0 ? { ...record, sha256: 'bad' } : record),
  }), /per-file SHA-256 digest/);
});

test('diagram sources remain model-first and structurally valid', async () => {
  assert.deepEqual(await validateDiagrams(root), { structurizr: 1, mermaid: 2, plantuml: 1 });
});

test('architecture release identifies the target authority', async () => {
  const result = await validateArchitectureRelease(root);
  assert.equal(result.architectureId, 'urn:agentic-delivery:architecture:authority');
  assert.match(result.contentSha256, /^[0-9a-f]{64}$/);
  assert.equal(result.status, 'draft');
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
