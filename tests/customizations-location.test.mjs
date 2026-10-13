import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { stewardMatchesAuditEvidence } from '../tools/decision-inventory.mjs';
import { assertCustomizationsRepository } from '../tools/validate-customizations-identity.mjs';
import { validateOrganizationalStrategyTraceabilityValue } from '../tools/organizational-strategy.mjs';
import { parseRepositoryYaml } from '../tools/lib/yaml.mjs';
import { validateStructuredValue } from '../tools/validate-structured-data.mjs';
import path from 'node:path';

test('current capability locator retains the audited immutable source without rewriting the audit', async () => {
  const strategy = parseRepositoryYaml(await readFile(new URL('../architecture/strategy/organizational-strategy.yml', import.meta.url), 'utf8'));
  const audit = parseRepositoryYaml(await readFile(new URL('../architecture/references/system-evidence.yml', import.meta.url), 'utf8'));
  for (const goal of strategy.strategicGoals) for (const ref of goal.traceability.capabilityRefs ?? []) {
    if (ref.repository === 'agentic-delivery-lab/agentic-delivery-primitives') {
      ref.repository = 'agentic-delivery-lab/agentic-delivery-agent-customizations';
      ref.repositoryId = 1380894656;
    }
  }
  assert.deepEqual(validateOrganizationalStrategyTraceabilityValue(strategy, { repositories: audit.repositories }), []);
  await validateStructuredValue(path.resolve(import.meta.dirname, '..'), 'architecture/strategy/organizational-strategy.yml', strategy);
  const ref = strategy.strategicGoals.flatMap(goal => goal.traceability.capabilityRefs ?? [])
    .find(ref => ref.repository === 'agentic-delivery-lab/agentic-delivery-agent-customizations');
  ref.repositoryId = 999999;
  await assert.rejects(validateStructuredValue(path.resolve(import.meta.dirname, '..'), 'architecture/strategy/organizational-strategy.yml', strategy), /equal to constant/);
  assert.ok(validateOrganizationalStrategyTraceabilityValue(strategy, { repositories: audit.repositories }).length > 0);
  ref.repositoryId = 1380894656;
  ref.sourceCommit = 'a'.repeat(40);
  assert.ok(validateOrganizationalStrategyTraceabilityValue(strategy, { repositories: audit.repositories }).length > 0);
});

test('renamed steward routes to unchanged historical evidence only under the selected repository ID', () => {
  const route = { repository: 'agentic-delivery-lab/agentic-delivery-agent-customizations', repositoryId: 1380894656 };
  const evidence = { slug: 'agentic-delivery-lab/agentic-delivery-primitives', githubRepositoryId: 1380894656 };
  assert.equal(stewardMatchesAuditEvidence(route, evidence), true);
  assert.equal(stewardMatchesAuditEvidence({ ...route, repositoryId: 999999 }, evidence), false);
  assert.equal(stewardMatchesAuditEvidence(route, { ...evidence, githubRepositoryId: 999999 }), false);
  assert.equal(stewardMatchesAuditEvidence(route, { ...evidence, slug: 'agentic-delivery-lab/other' }), false);
  assert.equal(stewardMatchesAuditEvidence({ ...route, repository: 'agentic-delivery-lab/arbitrary-rename' }, evidence), false);
  assert.equal(stewardMatchesAuditEvidence({}, {}), false);
});

test('unchanged stewardship still requires exact repository name and identity', () => {
  const evidence = { slug: 'agentic-delivery-lab/agentic-delivery', githubRepositoryId: 1358455028 };
  assert.equal(stewardMatchesAuditEvidence({ repository: evidence.slug, repositoryId: evidence.githubRepositoryId }, evidence), true);
  assert.equal(stewardMatchesAuditEvidence({ repository: evidence.slug, repositoryId: 1380894656 }, evidence), false);
});

test('hosting checkout requires native ID and explicit current name, not a redirect or reused name', () => {
  const repository = { id: 1380894656, full_name: 'agentic-delivery-lab/agentic-delivery-agent-customizations' };
  assert.deepEqual(assertCustomizationsRepository(repository), { repositoryId: repository.id, repository: repository.full_name });
  for (const invalid of [null, {}, { ...repository, id: 999999 }, { ...repository, id: '1380894656' },
    { ...repository, full_name: 'agentic-delivery-lab/agentic-delivery-primitives' }]) {
    assert.throws(() => assertCustomizationsRepository(invalid), /identity/);
  }
});
