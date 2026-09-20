import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';

import { validateArc42Structure } from '../tools/validate-arc42-structure.mjs';
import { validateArchitectureContracts } from '../tools/validate-architecture-contracts.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('official arc42 chapter structure is complete', async () => {
  assert.deepEqual(await validateArc42Structure(root), { chapters: 12 });
});

test('architecture contracts and aliases are deterministic', async () => {
  assert.deepEqual(await validateArchitectureContracts(root), { schemas: 4, aliases: 12 });
});
