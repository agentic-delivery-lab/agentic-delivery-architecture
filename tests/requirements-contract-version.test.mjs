import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { validateStructuredValue } from '../tools/validate-structured-data.mjs';
import { validateOrganizationalStrategyValue } from '../tools/organizational-strategy.mjs';
import { parseRepositoryYaml } from '../tools/lib/yaml.mjs';
const root = path.resolve(import.meta.dirname, '..');

test('Requirements reference contract must be present at the supported version', async () => {
  const release = JSON.parse(await readFile(path.join(root, 'architecture/generated/architecture-release.json'), 'utf8'));
  for (const value of [undefined, '9.0.0']) {
    const changed = structuredClone(release);
    if (value === undefined) delete changed.contractVersions.requirementsReference;
    else changed.contractVersions.requirementsReference = value;
    await assert.rejects(validateStructuredValue(root, 'architecture/generated/architecture-release.json', changed), /requirementsReference/);
  }
});

test('equivalent QR record and quality-requirement wording cannot declare a second owner', async () => {
  const source = parseRepositoryYaml(await readFile(path.join(root, 'architecture/strategy/organizational-strategy.yml'), 'utf8'));
  for (const fact of ['normative QR records', 'editable quality requirements', 'QR catalog', 'QRs']) {
    const changed = structuredClone(source);
    changed.sourceOfTruth.push({ fact, owner: 'Architecture Authority', rule: 'Editable normative copy' });
    assert(validateOrganizationalStrategyValue(changed).some(error => /sole normative QR owner/.test(error)));
  }
});
