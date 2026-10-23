import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { validateStructurizr } from '../tools/lib/structurizr.mjs';

const valid = `workspace "Fixture" "Offline parser fixture" {
  model {
    actor = person "Actor"
    system = softwareSystem "System"
    actor -> system "Uses"
  }
  views {
    systemContext system "system-context" {
      include *
    }
  }
}`;

test('stock parser distinguishes parsing, policy and advisory inspection results', async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'architecture-structurizr-tests-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  async function request(name, source) {
    const file = path.join(directory, `${name}.dsl`);
    await writeFile(file, source);
    try { return await validateStructurizr(file, ['system-context']); }
    finally { assert.equal(await readFile(file, 'utf8'), source, 'request must preserve source bytes'); }
  }
  await t.test('valid JSON export retains view element and relationship meaning', async () => {
    const report = await request('valid', valid);
    assert.equal(report.inspection.policy, 'advisory');
    assert.ok(report.inspection.findings.some(({ rule }) => rule === 'model.relationship.technology'));
    assert.ok(report.inspection.findings.some(({ rule }) => rule.includes('description')));
    const view = report.selectedViews[0];
    assert.deepEqual(view.elements.map(({ name }) => name).sort(), ['Actor', 'System']);
    assert.equal(view.relationships.length, 1);
    assert.equal(view.relationships[0].description, 'Uses');
  });
  const negatives = [
    ['syntax', valid.replace('include *', 'notValidDsl'), /parse-error.*Unexpected tokens/],
    ['reference', valid.replace('actor -> system', 'actor -> missing'), /parse-error.*does not exist/],
    ['view', valid.replace('systemContext system', 'container actor'), /parse-error.*not a software system/],
    ['script', valid.replace('  model {', '  !script javascript {\n  }\n  model {'), /!script is not permitted/],
    ['plugin', valid.replace('  model {', '  !plugin example.Plugin\n  model {'), /!plugin is not permitted/],
    ['include', valid.replace('  model {', '  !include https://example.invalid/model.dsl\n  model {'), /!include is not permitted/],
    ['filesystem', valid.replace('  model {', '  !include /etc/passwd\n  model {'), /!include is not permitted/],
    ['documentation', valid.replace('  model {', '  !docs /etc\n  model {'), /!docs is not permitted/],
    ['theme', valid.replace('  views {', '  views {\n    theme https://example.invalid/theme.json'), /policy-error.*themes/],
    ['external-icon', valid.replace('  views {', '  views {\n    styles {\n      element \"Person\" {\n        icon https://example.invalid/icon.svg\n      }\n    }'), /Icons via HTTPS are not permitted/],
    ['external-image', valid.replace('  views {', '  views {\n    image * \"external\" {\n      image https://example.invalid/image.svg\n    }'), /Image views via HTTPS are not permitted/],
    ['suppression', valid.replace('  model {', '  properties {\n    "structurizr.inspection.model.relationship.technology" "ignore"\n  }\n  model {'), /policy-error.*reviewed rule profile/],
  ];
  for (const [name, source, expected] of negatives) {
    await t.test(name, () => assert.rejects(request(name, source), expected));
  }
  await t.test('environment substitution cannot read the host environment', async () => {
    process.env.W19_ENV_CANARY = 'host-secret-canary-not-for-parser';
    try {
      const report = await request('environment', valid.replace('"Actor"', '"${W19_ENV_CANARY}"'));
      assert.ok(report.selectedViews[0].elements.some(({ name }) => name === '${W19_ENV_CANARY}'));
      assert.ok(!JSON.stringify(report).includes(process.env.W19_ENV_CANARY));
    } finally { delete process.env.W19_ENV_CANARY; }
  });
  await t.test('unknown view and oversized input are rejected before runtime startup', async () => {
    const file = path.join(directory, 'large.dsl');
    await writeFile(file, 'x'.repeat(262145));
    await assert.rejects(validateStructurizr(file, ['system-context']), /byte limit/);
    await assert.rejects(validateStructurizr(file, ['unknown-view']), /Unapproved Structurizr view/);
  });
});
