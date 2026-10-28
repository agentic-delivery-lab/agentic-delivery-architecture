import assert from 'node:assert/strict';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { validateStructuredValue } from '../tools/validate-structured-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const location = 'architecture/evaluation/owners.json';
const customizations = 'agentic-delivery-lab/agentic-delivery-agent-customizations';
function owners() {
  return {
    schemaVersion: 1,
    scope: 'offline-proposal-only',
    mappings: [{
      layer: 'agent-capability',
      subjectId: 'repository-delivery-validation',
      subjectSource: { repository: customizations, repositoryId: 1380894656, path: 'capabilities/catalog.yml' },
      owner: { repository: customizations, repositoryId: 1380894656 },
      sourceIssue: `https://github.com/${customizations}/issues/3`,
      rationale: 'Reusable evaluation capability is maintained by Customizations under its existing source Issue.',
    }],
  };
}

test('explicit evaluation owner mapping is a closed offline contract', async () => {
  await validateStructuredValue(root, location, owners());
});

for (const [name, mutate] of [
  ['unsupported schema version', v => { v.schemaVersion = 2; }],
  ['live execution scope', v => { v.scope = 'execute'; }],
  ['unknown report layer', v => { v.mappings[0].layer = 'participant'; }],
  ['missing native identity', v => { delete v.mappings[0].owner.repositoryId; }],
  ['string native identity', v => { v.mappings[0].owner.repositoryId = '1380894656'; }],
  ['path glob', v => { v.mappings[0].subjectSource.path = 'manifests/*'; }],
  ['path traversal', v => { v.mappings[0].subjectSource.path = 'manifests/../secrets'; }],
  ['implicit repository wildcard', v => { v.mappings[0].subjectId = '*'; }],
  ['priority field', v => { v.mappings[0].priority = 'urgent'; }],
  ['execution flag', v => { v.executionAuthorized = true; }],
  ['duplicate subject binding', v => { v.mappings.push(structuredClone(v.mappings[0])); }],
  ['conflicting subject ownership', v => { const other = structuredClone(v.mappings[0]); other.owner = { repository: 'agentic-delivery-lab/agentic-delivery', repositoryId: 1358455028 }; v.mappings.push(other); }],
  ['owner Issue in another repository', v => { v.mappings[0].sourceIssue = 'https://github.com/agentic-delivery-lab/agentic-delivery/issues/103'; }],
  ['renamed repository with wrong native ID', v => { v.mappings[0].owner.repositoryId = 1358455028; }],
]) {
  test(`evaluation ownership rejects ${name}`, async () => {
    const changed = owners(); mutate(changed);
    await assert.rejects(validateStructuredValue(root, location, changed));
  });
}

test('owner mapping layers use the exact shared evaluation-report vocabulary', async () => {
  const mappingSchema = JSON.parse(await readFile(path.join(root, 'architecture/contracts/evaluation-owners.schema.json'), 'utf8'));
  const reportSchema = JSON.parse(await readFile(path.join(root, 'architecture/contracts/evaluation-report.schema.json'), 'utf8'));
  assert.deepEqual(mappingSchema.properties.mappings.items.properties.layer.enum, reportSchema.properties.layer.enum);
});

test('current explicit owner map validates without inventing a product owner', async () => {
  const value = JSON.parse(await readFile(path.join(root, location), 'utf8'));
  await validateStructuredValue(root, location, value);
  assert.equal(value.mappings.some(mapping => mapping.layer === 'product-outcome'), false);
  assert.equal(value.mappings.find(mapping => mapping.layer === 'agent-capability').subjectSource.path, 'capabilities/catalog.yml');
});
