import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseRepositoryYaml } from './lib/yaml.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTEXT_IDS = [
  'agentic-delivery-governance',
  'agentic-delivery-control-plane',
  'agentic-primitives',
  'developer-distribution',
];
const ARCHITECTURE_GOAL_IDS = ['G-01', 'G-02', 'G-03', 'G-04'];

function duplicates(values) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function isOrganizationIssueReference(reference, repositorySlugs) {
  if (typeof reference !== 'string') return false;
  const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/issues\/([1-9][0-9]*)$/.exec(reference);
  return Boolean(match && repositorySlugs.has(match[1]));
}

function asSet(values) {
  return values instanceof Set ? values : new Set(values ?? []);
}

export function validateOrganizationalStrategyTraceabilityValue(strategy, {
  qualityScenarioIds,
  principleIds,
  decisionIds,
  contractPaths,
  repositories,
  localEvidencePaths,
  observationIds,
} = {}) {
  const errors = [];
  const qualityScenarioIdSet = qualityScenarioIds ? asSet(qualityScenarioIds) : null;
  const principleIdSet = principleIds ? asSet(principleIds) : null;
  const decisionIdSet = decisionIds ? asSet(decisionIds) : null;
  const contractPathSet = contractPaths ? asSet(contractPaths) : null;
  const localEvidencePathSet = localEvidencePaths ? asSet(localEvidencePaths) : null;
  const observationIdSet = observationIds ? asSet(observationIds) : null;
  const repositoryBySlug = new Map((repositories ?? []).map((repository) => [repository.slug, repository]));
  const repositorySlugs = new Set(repositoryBySlug.keys());
  const validateRepositoryReferences = repositories !== undefined;

  for (const goal of strategy.strategicGoals ?? []) {
    const location = 'strategic goal ' + goal.id + ' traceability';
    const traceability = goal.traceability ?? {};
    const links = [
      ['qualityScenarioIds', traceability.qualityScenarioIds ?? [], qualityScenarioIdSet, 'quality scenario'],
      ['principleIds', traceability.principleIds ?? [], principleIdSet, 'principle'],
      ['decisionIds', traceability.decisionIds ?? [], decisionIdSet, 'decision'],
      ['contractRefs', traceability.contractRefs ?? [], contractPathSet, 'contract'],
    ];

    if (!(traceability.capabilityRefs?.length) && !(traceability.capabilityGaps?.length)) {
      errors.push(location + ' must identify a pinned capability or state its capability gap');
    }
    for (const [field, values, registry, label] of links) {
      if (duplicates(values).length) errors.push(location + ' has duplicate ' + field);
      if (registry) {
        for (const value of values) {
          if (!registry.has(value)) errors.push(location + ' references unknown ' + label + ' ' + value);
        }
      }
    }

    if (validateRepositoryReferences) {
      for (const capability of traceability.capabilityRefs ?? []) {
        const repository = repositoryBySlug.get(capability.repository);
        if (!repository) {
          errors.push(location + ' references an unregistered capability repository ' + capability.repository);
        } else {
          if (capability.sourceCommit !== repository.mainCommit) {
            errors.push(location + ' capability pin does not match the inventoried main revision for ' + capability.repository);
          }
          if (!(repository.evidencePaths ?? []).includes(capability.path)) {
            errors.push(location + ' capability path is outside the audited source inventory: ' + capability.path);
          }
        }
      }
    }

    if (validateRepositoryReferences) {
      for (const field of ['implementationIssueRefs', 'projectPlanningRefs']) {
        for (const reference of traceability[field] ?? []) {
          if (!isOrganizationIssueReference(reference, repositorySlugs)) {
            errors.push(location + ' has an invalid or out-of-inventory ' + field + ' reference: ' + reference);
          }
        }
      }
    }

    for (const evidence of traceability.evaluationEvidenceRefs ?? []) {
      const reference = evidence.reference ?? '';
      if (reference.startsWith('https://github.com/')) {
        if (validateRepositoryReferences && !isOrganizationIssueReference(reference, repositorySlugs)) {
          errors.push(location + ' has an invalid pending evaluation Issue reference: ' + reference);
        } else if (evidence.status === 'synthetic' || evidence.status === 'observed') {
          errors.push(location + ' cannot classify an Issue reference as synthetic or observed evidence');
        }
        continue;
      }
      const [sourcePath, fragment] = reference.split('#', 2);
      if (localEvidencePathSet && !localEvidencePathSet.has(sourcePath)) {
        errors.push(location + ' references missing local evaluation evidence: ' + sourcePath);
      }
      if (evidence.status === 'observed'
        && (sourcePath !== 'architecture/references/system-evidence.yml'
          || !fragment || (observationIdSet && !observationIdSet.has(fragment)))) {
        errors.push(location + ' observed evaluation evidence must resolve to a system-evidence observation');
      }
      if (evidence.status === 'synthetic' && !sourcePath.startsWith('architecture/evaluation/examples/')) {
        errors.push(location + ' synthetic evaluation evidence must reference a synthetic evaluation fixture');
      }
    }
  }

  return errors;
}

export function validateOrganizationalStrategyValue(strategy, {
  contextIds = CONTEXT_IDS,
  architectureGoalIds = ARCHITECTURE_GOAL_IDS,
  qualityScenarioIds,
  principleIds,
  decisionIds,
  contractPaths,
  repositories,
  localEvidencePaths,
  observationIds,
} = {}) {
  const errors = [];
  const audiences = strategy.audiences ?? [];
  const audienceIds = audiences.map(({ id }) => id);
  const goals = strategy.strategicGoals ?? [];
  const goalIds = goals.map(({ id }) => id);
  const measures = strategy.successMeasures ?? [];
  const measureIds = measures.map(({ id }) => id);
  const streams = (strategy.valueStreams ?? []).map(({ id }) => id);
  const research = strategy.researchBasis ?? [];
  const researchSources = research.map(({ source }) => source);
  const referenceUrls = new Set((strategy.references ?? []).map(({ url }) => url));

  if (strategy.sourceIssue !== 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11') {
    errors.push('organizational strategy must link to Architecture source Issue #11');
  }
  if (duplicates(researchSources).length) errors.push('organizational strategy research sources must be unique');
  for (const source of researchSources) {
    if (!referenceUrls.has(source)) errors.push('organizational strategy research source must resolve to a cited reference: ' + source);
  }
  if (strategy.status === 'adopted' && !strategy.adoptionEvidence?.record) {
    errors.push('an adopted strategy requires a reviewed adoption record');
  }
  if (strategy.status === 'superseded' && !strategy.supersessionEvidence?.successor) {
    errors.push('a superseded strategy requires a successor record');
  }
  if (duplicates(audienceIds).length) errors.push('audience identifiers must be unique');
  if (duplicates(goalIds).length) errors.push('strategic goal identifiers must be unique');
  if (duplicates(measureIds).length) errors.push('success measure identifiers must be unique');
  if (duplicates(streams).length || streams.length !== 2
    || !streams.includes('factory-evolution') || !streams.includes('software-product-delivery')) {
    errors.push('strategy must define the two distinct factory-evolution and software-product-delivery value streams');
  }

  const audienceIdSet = new Set(audienceIds);
  const propositionAudienceIds = new Set();
  for (const proposition of strategy.valuePropositions ?? []) {
    if (!audienceIdSet.has(proposition.audienceId)) {
      errors.push('value proposition references unknown audience ' + proposition.audienceId);
    }
    propositionAudienceIds.add(proposition.audienceId);
  }
  for (const audienceId of audienceIds) {
    if (!propositionAudienceIds.has(audienceId)) errors.push('audience ' + audienceId + ' has no value proposition');
  }

  const measureIdSet = new Set(measureIds);
  for (const goal of goals) {
    if (goal.status === 'adopted' && !goal.adoptionEvidence?.record) {
      errors.push('adopted strategic goal ' + goal.id + ' requires a reviewed adoption record');
    }
    if (goal.status === 'retired' && !goal.retirementEvidence?.record) {
      errors.push('retired strategic goal ' + goal.id + ' requires a retirement record');
    }
    for (const stakeholder of goal.stakeholders ?? []) {
      if (!audienceIdSet.has(stakeholder)) errors.push('strategic goal ' + goal.id + ' references unknown stakeholder ' + stakeholder);
    }
    for (const contextId of goal.contextIds ?? []) {
      if (!contextIds.includes(contextId)) errors.push('strategic goal ' + goal.id + ' references unknown bounded context ' + contextId);
    }
    for (const goalId of goal.architectureGoalIds ?? []) {
      if (!architectureGoalIds.includes(goalId)) errors.push('strategic goal ' + goal.id + ' references missing arc42 goal ' + goalId);
    }
    for (const measureId of goal.measureIds ?? []) {
      if (!measureIdSet.has(measureId)) errors.push('strategic goal ' + goal.id + ' references missing measure ' + measureId);
    }
  }
  errors.push(...validateOrganizationalStrategyTraceabilityValue(strategy, {
    qualityScenarioIds,
    principleIds,
    decisionIds,
    contractPaths,
    repositories,
    localEvidencePaths,
    observationIds,
  }));
  if ([...new Set(goalIds)].some((id) => !/^SG-\d{2}$/.test(id))) {
    errors.push('strategic goals must use unique stable SG-NN identifiers');
  }
  if ([...new Set(measureIds)].some((id) => !/^SM-\d{3}$/.test(id))) {
    errors.push('success measures must use stable SM-NNN identifiers');
  }
  const referencedMeasures = new Set(goals.flatMap((goal) => goal.measureIds ?? []));
  for (const measureId of measureIds) {
    if (!referencedMeasures.has(measureId)) errors.push('success measure ' + measureId + ' is not linked to a strategic goal');
  }
  for (const measure of measures) {
    if (!['unmeasured', 'measured'].includes(measure.baselineStatus)) {
      errors.push('success measure ' + measure.id + ' has an invalid baseline status');
    }
    if (!['set-after-baseline', 'approved'].includes(measure.targetStatus)) {
      errors.push('success measure ' + measure.id + ' has an invalid target status');
    }
    if (measure.baselineStatus === 'unmeasured' && measure.baseline !== undefined) {
      errors.push('unmeasured success measure ' + measure.id + ' cannot claim a baseline');
    }
    if (measure.baselineStatus === 'measured') {
      const baseline = measure.baseline;
      if (!baseline || !baseline.evidence?.length || !baseline.observedAt || !baseline.reportingWindow) {
        errors.push('measured success measure ' + measure.id + ' requires dated baseline evidence and a reporting window');
      } else {
        if (!Number.isInteger(baseline.numerator) || !Number.isInteger(baseline.denominator)
          || baseline.numerator < 0 || baseline.denominator < 0) {
          errors.push('success measure ' + measure.id + ' baseline counts must be non-negative integers');
        } else if (baseline.denominator === 0 && (baseline.value !== 'undefined' || baseline.numerator !== 0)) {
          errors.push('success measure ' + measure.id + ' must report a zero denominator and numerator as undefined');
        } else if (baseline.denominator > 0 && (baseline.numerator > baseline.denominator
          || typeof baseline.value !== 'number'
          || Math.abs(baseline.value - baseline.numerator / baseline.denominator) > 1e-9)) {
          errors.push('success measure ' + measure.id + ' baseline value must equal numerator divided by denominator, and the numerator cannot exceed denominator');
        }
      }
    }
    if (measure.targetStatus === 'set-after-baseline' && measure.target !== undefined) {
      errors.push('success measure ' + measure.id + ' cannot set a target before baseline review');
    }
    if (measure.targetStatus === 'approved'
      && (measure.baselineStatus !== 'measured' || !measure.target?.approvalIssue || !measure.target?.approvedAt)) {
      errors.push('approved target for success measure ' + measure.id + ' requires a measured baseline and approval record');
    }
  }

  if (strategy.projectPlanning?.primarySurface !== 'GitHub Projects') {
    errors.push('GitHub Projects must be the proposed primary planning surface');
  }
  if (strategy.projectPlanning?.currentInventoryStatus === 'unknown-no-read-project-scope'
    && !strategy.projectPlanning.issueFieldConstraint?.includes('organization-members-only')) {
    errors.push('unverified Project inventory must preserve the known organization Issue Field visibility constraint');
  }
  if (strategy.projectPlanning?.currentInventoryStatus === 'inventoried' && !strategy.projectPlanning.inventoryEvidence) {
    errors.push('an inventoried Project status requires dated live inventory evidence');
  }
  if (!/dependency fields, or automation never authorizes or blocks execution/i.test(strategy.projectPlanning?.executionAuthorizationRule ?? '')) {
    errors.push('Project state or dependencies must never authorize or block execution');
  }
  if (!/planning input/i.test(strategy.projectPlanning?.projectOnlyCardRule ?? '')
    || !/authorized source Issue/i.test(strategy.projectPlanning?.projectOnlyCardRule ?? '')) {
    errors.push('a Project-only card must remain planning input until linked to an authorized source Issue');
  }

  const truthRules = strategy.sourceOfTruth ?? [];
  if (duplicates(truthRules.map((entry) => entry.fact)).length) {
    errors.push('each durable source-of-truth fact must have exactly one canonical row');
  }
  const issueAuthorities = truthRules.filter((entry) => /work intent/i.test(entry.fact));
  const projectAuthorities = truthRules.filter((entry) => /portfolio sequencing/i.test(entry.fact));
  const issueAuthority = issueAuthorities[0];
  const projectAuthority = projectAuthorities[0];
  if (issueAuthorities.length !== 1 || !issueAuthority || !/Origin repository Issue/.test(issueAuthority.owner)
    || !/cannot replace it or authorize execution/i.test(issueAuthority.rule)) {
    errors.push('source-of-truth map must keep work intent and execution authorization with the origin Issue');
  }
  if (projectAuthorities.length !== 1 || !projectAuthority || !/Approved organization portfolio Project/.test(projectAuthority.owner)
    || !/Issue Priority remains the canonical per-Issue priority/i.test(projectAuthority.rule)
    || !/distinct portfolio sequencing, grouping, and planning dependencies only/i.test(projectAuthority.rule)
    || !/execution dependency gates remain owned by the source Issue and Control Plane contract/i.test(projectAuthority.rule)) {
    errors.push('source-of-truth map must limit Project dependencies to planning and ensure execution dependency gates remain owned by the source Issue and Control Plane contract');
  }
  return errors;
}

export function validateProjectInventoryEvidence(strategy, systemEvidence) {
  const errors = [];
  const planning = strategy.projectPlanning ?? {};
  const observation = (systemEvidence.observations ?? []).find(
    ({ id }) => id === planning.projectInventoryEvidenceId,
  );
  if (!observation) {
    errors.push('Project inventory status must reference a dated observation in system-evidence.yml');
    return errors;
  }
  if (planning.currentInventoryStatus === 'unknown-no-read-project-scope') {
    if (planning.projectInventoryEvidenceId !== 'project-inventory-access'
      || !String(observation.result).includes('Project existence is unknown, not absent.')
      || observation.projectInventoryComplete === true) {
      errors.push('unknown Project inventory status must point to the read-scope failure, not a completed inventory');
    }
  } else if (planning.currentInventoryStatus === 'inventoried') {
    const inventory = planning.inventoryEvidence;
    if (!inventory || observation.projectInventoryComplete !== true
      || !Array.isArray(observation.projectIds)
      || inventory.observedAt !== observation.observedAt
      || JSON.stringify([...inventory.projectIds].sort()) !== JSON.stringify([...observation.projectIds].sort())) {
      errors.push('inventoried Project status must match a completed dated inventory observation and its Project IDs');
    }
  }
  return errors;
}

export async function validateOrganizationalStrategy(root = repositoryRoot) {
  const strategy = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/strategy/organizational-strategy.yml'), 'utf8'),
    'organizational strategy',
  );
  const contextModel = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/domain/bounded-contexts.yml'), 'utf8'),
    'bounded-context register',
  );
  const systemEvidence = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/references/system-evidence.yml'), 'utf8'),
    'system evidence',
  );
  const qualityScenarios = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/quality/quality-scenarios.yml'), 'utf8'),
    'quality-scenario register',
  );
  const principleIndex = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/principles/index.yml'), 'utf8'),
    'principle index',
  );
  const decisionInventory = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/references/decision-inventory.yml'), 'utf8'),
    'decision inventory',
  );
  const contractFiles = await readdir(path.join(root, 'architecture/contracts'));
  const evaluationExamples = await readdir(path.join(root, 'architecture/evaluation/examples'));
  const localEvidencePaths = [
    'architecture/references/strategy-foundation-gap-matrix.md',
    ...evaluationExamples.map((name) => 'architecture/evaluation/examples/' + name),
    'architecture/references/system-evidence.yml',
  ];
  const goalsText = await readFile(path.join(root, 'architecture/arc42/01-introduction-and-goals.md'), 'utf8');
  const goalIds = [...goalsText.matchAll(/^\| (G-\d{2}) \|/gm)].map((match) => match[1]);
  const contextIds = (contextModel.contexts ?? []).map((context) => context.id);
  const errors = [
    ...validateOrganizationalStrategyValue(strategy, {
      contextIds,
      architectureGoalIds: goalIds,
      qualityScenarioIds: (qualityScenarios.scenarios ?? []).map(({ id }) => id),
      principleIds: (principleIndex.principles ?? []).map(({ id }) => id),
      decisionIds: (decisionInventory.records ?? []).map(({ id }) => id),
      contractPaths: contractFiles
        .filter((name) => name.endsWith('.schema.json'))
        .map((name) => 'architecture/contracts/' + name),
      repositories: systemEvidence.repositories ?? [],
      localEvidencePaths,
      observationIds: (systemEvidence.observations ?? []).map(({ id }) => id),
    }),
    ...validateProjectInventoryEvidence(strategy, systemEvidence),
  ];
  if (errors.length > 0) throw new Error('organizational strategy validation failed:\n' + errors.join('\n'));
  return {
    audiences: strategy.audiences.length,
    goals: strategy.strategicGoals.length,
    measures: strategy.successMeasures.length,
    valueStreams: strategy.valueStreams.length,
    traceabilityLinks: strategy.strategicGoals.reduce((count, goal) => {
      const traceability = goal.traceability ?? {};
      return count + ['qualityScenarioIds', 'principleIds', 'decisionIds', 'capabilityRefs', 'contractRefs',
        'implementationIssueRefs', 'projectPlanningRefs', 'evaluationEvidenceRefs']
        .reduce((links, field) => links + (traceability[field]?.length ?? 0), 0);
    }, 0),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await validateOrganizationalStrategy(process.argv[2] ?? repositoryRoot);
    process.stdout.write('organizational strategy validated: ' + result.goals + ' goals, '
      + result.measures + ' measures, ' + result.valueStreams + ' value streams.\n');
  } catch (error) {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  }
}
