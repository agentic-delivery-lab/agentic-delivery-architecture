import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseRepositoryYaml } from './lib/yaml.mjs';
import { validateDecisionInventory } from './decision-inventory.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), 'utf8'));
}

export async function validateArchitectureContracts(root = repositoryRoot) {
  const errors = [];
  const release = JSON.parse(await readFile(path.join(root, 'architecture/generated/architecture-release.json'), 'utf8'));
  const decisionInventory = await validateDecisionInventory(root);
  if (release.schemaVersion !== 2 || release.status !== 'draft') errors.push('draft architecture release must use schemaVersion 2 and status draft');
  if (release.sourceRepository !== 'agentic-delivery-lab/agentic-delivery-architecture') errors.push('architecture release sourceRepository must identify Architecture Authority');
  if (!/^[0-9a-f]{40}$/.test(release.sourceCommit)) errors.push('architecture release sourceCommit must be immutable');
  if (!/^[0-9a-f]{64}$/.test(release.contentSha256 ?? '')) errors.push('architecture release contentSha256 must be a non-null SHA-256 digest');
  if (!Array.isArray(release.adrIds) || release.adrIds.length === 0) errors.push('architecture release must identify ADRs');
  const expectedAdrUris = decisionInventory.adrIds.map((id) => `urn:agentic-delivery:adr:architecture:${id.slice(4)}`);
  if (JSON.stringify(release.adrIds) !== JSON.stringify(expectedAdrUris)) errors.push('architecture release ADR IDs must exactly match local Architecture ADR records');
  if (JSON.stringify(release.decisionIds) !== JSON.stringify(decisionInventory.decisionIds)) errors.push('architecture release decision IDs must exactly match the canonical decision inventory');
  if (!Array.isArray(release.contextIds) || release.contextIds.length === 0) errors.push('architecture release must identify bounded contexts');
  if (release.contractVersions?.architectureRelease !== '4.0.0') errors.push('architecture release must pin contract 4.0.0 for digest, exact decision inventory, and artifact-family semantics');
  if (release.contractVersions?.decisionInventory !== '1.0.0') errors.push('architecture release must pin decision inventory contract 1.0.0');
  if (release.contractVersions?.architectureArtifacts !== '1.0.0') errors.push('architecture release must pin architecture artifact contract 1.0.0');
  for (const name of ['conformancePolicy', 'toolingLock']) {
    const reference = release[name];
    if (!reference || typeof reference.path !== 'string' || !/^[0-9a-f]{64}$/.test(reference.sha256 ?? '')) errors.push(`architecture release ${name} integrity reference is required`);
  }
  const aliases = JSON.parse(await readFile(path.join(root, 'architecture/references/adr-aliases.json'), 'utf8'));
  const aliasValues = Object.values(aliases.aliases ?? {});
  if (aliases.schemaVersion !== 1 || aliasValues.length === 0 || new Set(aliasValues).size !== aliasValues.length) errors.push('ADR aliases must be unique schemaVersion 1 records');
  const expectedAliases = Object.fromEntries(decisionInventory.adrIds.map((id) => [id, `urn:agentic-delivery:adr:architecture:${id.slice(4)}`]));
  if (JSON.stringify(aliases.aliases) !== JSON.stringify(expectedAliases)) errors.push('ADR aliases must exactly match local Architecture ADR IDs');
  const tooling = JSON.parse(await readFile(path.join(root, 'architecture/references/tooling-lock.json'), 'utf8'));
  const releaseSchema = JSON.parse(await readFile(path.join(root, 'architecture/contracts/architecture-release.schema.json'), 'utf8'));
  const indexSchema = JSON.parse(await readFile(path.join(root, 'architecture/contracts/adr-primitive-index.schema.json'), 'utf8'));
  const generatedIndex = JSON.parse(await readFile(path.join(root, 'architecture/generated/adr-primitive-index.json'), 'utf8'));
  if (indexSchema.title !== 'Architecture ADR to Primitive index v3' || indexSchema.properties?.schemaVersion?.const !== 3) errors.push('ADR/Primitive index schema must be version 3');
  if (generatedIndex.schemaVersion !== 3) errors.push('generated ADR/Primitive index must implement schemaVersion 3');
  if (generatedIndex.externalAdrs?.length !== 0) errors.push('generated index must not retain external ADR owners or copied-text projections');
  if (release.contractVersions?.adrPrimitiveIndex !== '3.0.0') errors.push('architecture release must pin ADR/Primitive index contract 3.0.0');
  if (releaseSchema.properties?.schemaVersion?.const !== 2 || releaseSchema.title !== 'Architecture release manifest schemaVersion 2') errors.push('Architecture release schema must describe manifest schemaVersion 2');
  if (releaseSchema.properties?.contractVersions?.properties?.architectureRelease?.const !== '4.0.0') errors.push('Architecture release schema must require contract version 4.0.0');
  if (releaseSchema.properties?.contractVersions?.properties?.decisionInventory?.const !== '1.0.0') errors.push('Architecture release schema must require decision inventory contract 1.0.0');
  if (releaseSchema.properties?.contractVersions?.properties?.architectureArtifacts?.const !== '1.0.0') errors.push('Architecture release schema must require artifact-family contract 1.0.0');
  if (tooling.schemaVersion !== 1 || tooling.status !== 'draft') errors.push('tooling lock must be schemaVersion 1 draft');
  if (tooling.arc42?.version !== '9.0') errors.push('arc42 tooling lock must pin the tested official version');
  if (tooling.structuredData?.yaml?.package !== 'yaml' || tooling.structuredData.yaml.version !== '2.9.0'
    || tooling.structuredData.jsonSchema?.draft !== '2020-12'
    || tooling.structuredData.jsonSchema?.validator !== 'ajv' || tooling.structuredData.jsonSchema.version !== '8.17.1'
    || tooling.structuredData.jsonSchema?.formats !== 'ajv-formats' || tooling.structuredData.jsonSchema.formatsVersion !== '3.0.1') {
    errors.push('structured-data tooling must pin yaml 2.9.0, Ajv 8.17.1, ajv-formats 3.0.1, and JSON Schema Draft 2020-12');
  }
  if (tooling.arc42Language?.package !== '@doctc/arc42' || tooling.arc42Language?.version !== '0.24.0') errors.push('arc42-language tooling lock must pin @doctc/arc42 0.24.0');
  if (!/^sha512-[A-Za-z0-9+/=]+$/.test(tooling.arc42Language?.integrity ?? '')) errors.push('arc42-language tooling lock must include package integrity');
  if (!Array.isArray(tooling.arc42Language?.testedCommands) || !tooling.arc42Language.testedCommands.includes('validate')) errors.push('arc42-language tooling lock must record tested commands');
  const contextModel = parseRepositoryYaml(await readFile(path.join(root, 'architecture/domain/bounded-contexts.yml'), 'utf8'), 'bounded-context register');
  const contextIds = (contextModel.contexts ?? []).map((context) => context.id);
  const expectedContexts = ['agentic-delivery-governance', 'agentic-delivery-control-plane', 'agentic-primitives', 'developer-distribution'];
  if (expectedContexts.some((id) => !contextIds.includes(id))) errors.push('bounded-context register is missing a domain context');
  if (contextIds.length !== expectedContexts.length || new Set(contextIds).size !== contextIds.length) errors.push('bounded-context register must list the four distinct domain contexts exactly once');
  if (contextIds.includes('architecture-authority')) errors.push('Architecture Authority is a cross-context authority, not a bounded context');
  if ((contextModel.crossContextAuthority ?? {}).id !== 'architecture-authority') errors.push('bounded-context register must identify Architecture Authority separately');
  if (contextModel.schemaVersion !== 3 || !(contextModel.crossContextAuthority?.owns ?? []).includes('organization-decision-text')) errors.push('bounded-context register must describe the organization decision text authority contract');
  for (const [contextId, steward] of Object.entries(decisionInventory.contextStewards)) {
    if (!contextIds.includes(contextId) || !steward?.repositoryId || !steward?.evidencePath) errors.push(`bounded context ${contextId} must identify an evidence-backed context steward repository`);
  }
  const adapterIds = (contextModel.repositoryAdapters ?? []).map((adapter) => adapter.id);
  if (!adapterIds.includes('public-github-adapter') || !adapterIds.includes('private-github-adapter')) errors.push('bounded-context register must classify both .github repositories as adapters');
  const contextMap = parseRepositoryYaml(await readFile(path.join(root, 'architecture/domain/context-map.yml'), 'utf8'), 'context map');
  if ((contextMap.boundedContexts ?? []).join(',') !== expectedContexts.join(',')) errors.push('context map boundedContexts must match the four domain contexts');
  if (contextMap.governanceOverlay?.authority !== 'architecture-authority') errors.push('context map must model Architecture Authority as a governance overlay');
  if (contextMap.governanceOverlay?.classification !== 'cross-context authority, not a bounded-context endpoint') errors.push('context map must keep Architecture Authority outside bounded-context relationships');
  const overlayContexts = (contextMap.governanceOverlay?.appliesTo ?? []).map((entry) => entry.context);
  if (expectedContexts.some((id) => !overlayContexts.includes(id)) || overlayContexts.length !== expectedContexts.length) errors.push('Architecture Authority governance overlay must identify all four affected contexts');
  if ((contextMap.relationships ?? []).some((relationship) => [relationship.upstream, relationship.downstream].includes('architecture-authority'))) errors.push('context relationships must not model Architecture Authority as a bounded-context endpoint');
  if (contextMap.infrastructureSurfaces?.find((surface) => surface.id === 'github-organization-metadata')?.distinctFrom?.includes('github-project-fields') !== true) errors.push('context map must distinguish organization issue fields from GitHub Projects fields');
  if (contextMap.infrastructureSurfaces?.find((surface) => surface.id === 'github-app')?.purpose?.includes('does not distribute generic templates') !== true) errors.push('context map must separate App access/events from template distribution');
  const principleIndex = parseRepositoryYaml(await readFile(path.join(root, 'architecture/principles/index.yml'), 'utf8'), 'principle index');
  const goals = await readFile(path.join(root, 'architecture/arc42/01-introduction-and-goals.md'), 'utf8');
  const principleTemplate = await readFile(path.join(root, 'architecture/principles/principle-template.md'), 'utf8').catch(() => '');
  const principleSections = [
    '## Statement',
    '## Goals and decision basis',
    '## Consequences',
    '## Evidence and current limits',
  ];
  if (!principleTemplate.startsWith('# AP-NNN — Short principle name\n')
    || principleSections.some((heading) => !principleTemplate.includes(heading))) {
    errors.push('principle template must define the AP family heading and shared sections');
  }
  const knownOwners = { architecture: 'agentic-delivery-lab/agentic-delivery-architecture' };
  const expectedPrincipleGoals = { 'AP-001': ['G-01'], 'AP-002': ['G-02', 'G-04'] };
  const principles = principleIndex.principles ?? [];
  if (principleIndex.schemaVersion !== 2 || principles.length !== 2) errors.push('principle index must contain only the two evidence-backed principles at schemaVersion 2');
  if (new Set(principles.map((principle) => principle.id)).size !== principles.length) errors.push('principle identifiers must be unique');
  for (const principle of principles) {
    const location = `principle ${principle.id ?? '(missing id)'}`;
    if (!/^AP-\d{3}$/.test(principle.id ?? '')) errors.push(`${location} must use an AP-NNN identifier`);
    const principleSource = typeof principle.source === 'string'
      ? await readFile(path.join(root, 'architecture', principle.source), 'utf8').catch(() => null)
      : null;
    if (!principleSource) errors.push(`${location} must resolve to a Markdown source`);
    else {
      if (!principleSource.startsWith(`# ${principle.id} — `)) errors.push(`${location} source heading must match its stable index ID`);
      const headingPositions = principleSections.map((heading) => principleSource.indexOf(heading));
      if (headingPositions.some((position) => position < 0)
        || headingPositions.some((position, index) => index > 0 && position < headingPositions[index - 1])) {
        errors.push(`${location} source must follow the shared principle template sections in order`);
      }
    }
    const requiredGoals = expectedPrincipleGoals[principle.id];
    if (!requiredGoals || !requiredGoals.every((goalId) => (principle.goalIds ?? []).includes(goalId))) errors.push(`${location} must trace to its evidenced arc42 goal`);
    for (const goalId of principle.goalIds ?? []) if (!goals.includes(`| ${goalId} |`)) errors.push(`${location} references missing goal ${goalId}`);
    if (!Array.isArray(principle.consequences) || principle.consequences.length === 0) errors.push(`${location} must list decision consequences`);
    if (!Array.isArray(principle.evidence) || principle.evidence.length === 0) errors.push(`${location} must list source evidence`);
    for (const reference of principle.evidence ?? []) {
      const sourcePath = String(reference).split('#')[0];
      if (!(await readFile(path.join(root, 'architecture', sourcePath), 'utf8').catch(() => null))) errors.push(`${location} evidence source does not exist: ${reference}`);
    }
    if (!Array.isArray(principle.decisions) || principle.decisions.length === 0) errors.push(`${location} must map to owned decisions`);
    for (const decision of principle.decisions ?? []) {
      if (!/^(ADR|ADP|ADD)-\d{4}$/.test(decision.id ?? '') || knownOwners[decision.owner] !== decision.repository) errors.push(`${location} has an invalid decision owner mapping`);
    }
  }
  if (Object.keys(expectedPrincipleGoals).some((id) => !principles.some((principle) => principle.id === id))) errors.push('principle index is missing AP-001 or AP-002');
  for (const file of [
    'architecture/contracts/architecture-release.schema.json',
    'architecture/contracts/adr-primitive-index.schema.json',
    'architecture/contracts/decision-inventory.schema.json',
    'architecture/contracts/primitive-reference.schema.json',
    'architecture/contracts/conformance-request.schema.json',
    'architecture/contracts/conformance-result.schema.json',
  ]) {
    const schema = await json(file);
    if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') errors.push(`${file} must use JSON Schema 2020-12`);
  }
  if (errors.length > 0) throw new Error(`architecture contract check failed:\n${errors.join('\n')}`);
  return { schemas: 6, aliases: aliasValues.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateArchitectureContracts(process.argv[2] ?? repositoryRoot);
    process.stdout.write(`architecture contract check passed: ${result.schemas} schemas, ${result.aliases} ADR aliases.\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
