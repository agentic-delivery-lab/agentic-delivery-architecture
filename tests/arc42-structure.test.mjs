import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { validateArc42Structure } from '../tools/validate-arc42-structure.mjs';
import { validateArchitectureContracts } from '../tools/validate-architecture-contracts.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('official arc42 chapter structure is complete', async () => {
  assert.deepEqual(await validateArc42Structure(root), { chapters: 12 });
});

test('architecture contracts and aliases are deterministic', async () => {
  assert.deepEqual(await validateArchitectureContracts(root), { schemas: 5, aliases: 12 });
});

test('ADR/Primitive traceability uses a pinned release projection', async () => {
  const index = JSON.parse(await readFile(path.join(root, 'architecture/generated/adr-primitive-index.json'), 'utf8'));
  assert.equal(index.source, 'released-primitive-catalog');
  assert.match(index.primitiveRelease.sourceCommit, /^[0-9a-f]{40}$/);
  assert.ok(index.primitives.length > 0);
  assert.ok(index.primitives.every((primitive) => primitive.sourceRepository === 'agentic-delivery-lab/agentic-delivery-primitives'));
  assert.ok(index.primitives.every((primitive) => !primitive.sourcePath.startsWith('docs/')));
  assert.ok(index.externalAdrs.includes('ADR-0009'));
});
