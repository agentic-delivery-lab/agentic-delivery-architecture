import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
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
import {
  validateOrganizationalStrategy,
  validateOrganizationalStrategyTraceabilityValue,
  validateOrganizationalStrategyValue,
  validateProjectInventoryEvidence,
} from '../tools/organizational-strategy.mjs';

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
  assert.deepEqual(await validateArchitectureContracts(root), { schemas: 7, aliases: 21 });
});

test('all authoritative structured data uses closed Draft 2020-12 contracts', async () => {
  assert.deepEqual(await validateStructuredData(root), { files: 19, schemas: 22 });

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

test('evaluation report contract distinguishes layers, pins, baselines, and evidence-only recommendations', async () => {
  const reportPath = 'architecture/evaluation/examples/agent-capability-report.yml';
  const report = parseRepositoryYaml(await readFile(path.join(root, reportPath), 'utf8'), reportPath);
  await validateStructuredValue(root, reportPath, report);
  assert.ok(Date.parse(report.dataset.selection.registeredAt) < Date.parse(report.runStartedAt));
  assert.equal(report.dataset.partition, 'synthetic');
  assert.ok(report.dataset.selection.policyPin.sha256);
  assert.equal(report.dataset.integrity.contaminationStatus, 'unknown');
  assert.ok(Date.parse(report.dataset.integrity.assessedAt) < Date.parse(report.runStartedAt));
  assert.equal(report.graders.semantic.calibration.status, 'not-applicable');
  const missingCaseDefinition = structuredClone(report);
  delete missingCaseDefinition.cases;
  await assert.rejects(
    validateStructuredValue(root, reportPath, missingCaseDefinition),
    /must have required property 'cases'/,
  );
  assert.equal(report.cases[0].caseId, report.dataset.caseIds[0]);
  assert.ok(report.cases[0].task && report.cases[0].stimulus && report.cases[0].expectedOutcome.acceptanceCriteria.length > 0);
  assert.ok(report.graders.deterministic.evaluator.id);
  assert.equal(report.graders.deterministic.evaluator.kind, 'deterministic-tool');
  assert.ok(report.graders.deterministic.evaluator.version);
  assert.ok(report.graders.deterministic.independence.relation && report.graders.deterministic.independence.basis);

  const missingExpectedOutcome = structuredClone(report);
  delete missingExpectedOutcome.cases[0].expectedOutcome;
  await assert.rejects(validateStructuredValue(root, reportPath, missingExpectedOutcome), /must have required property 'expectedOutcome'/);

  const missingEvaluatorIdentity = structuredClone(report);
  delete missingEvaluatorIdentity.graders.deterministic.evaluator.id;
  await assert.rejects(validateStructuredValue(root, reportPath, missingEvaluatorIdentity), /must have required property 'id'/);

  const missingEvaluatorVersion = structuredClone(report);
  delete missingEvaluatorVersion.graders.semantic.evaluator.version;
  await assert.rejects(validateStructuredValue(root, reportPath, missingEvaluatorVersion), /must have required property 'version'/);

  const unregisteredSelection = structuredClone(report);
  unregisteredSelection.dataset.selection.registeredAt = '2026-10-09T09:01:00Z';
  await assert.rejects(validateStructuredValue(root, reportPath, unregisteredSelection), /selection policy and dataset-integrity assessment must be recorded before the candidate run starts/);

  const concurrentlyRegisteredSelection = structuredClone(report);
  concurrentlyRegisteredSelection.dataset.selection.registeredAt = concurrentlyRegisteredSelection.runStartedAt;
  await assert.rejects(validateStructuredValue(root, reportPath, concurrentlyRegisteredSelection), /selection policy and dataset-integrity assessment must be recorded before the candidate run starts/);

  const postRunIntegrityAssessment = structuredClone(report);
  postRunIntegrityAssessment.dataset.integrity.assessedAt = postRunIntegrityAssessment.runStartedAt;
  await assert.rejects(validateStructuredValue(root, reportPath, postRunIntegrityAssessment), /dataset-integrity assessment must be recorded before the candidate run starts/);

  const reportGeneratedAtRunStart = structuredClone(report);
  reportGeneratedAtRunStart.generatedAt = reportGeneratedAtRunStart.runStartedAt;
  await assert.rejects(validateStructuredValue(root, reportPath, reportGeneratedAtRunStart), /report must be generated after it starts/);

  const unclassifiedFailure = structuredClone(report);
  unclassifiedFailure.cases[0].outcome = 'fail';
  await assert.rejects(validateStructuredValue(root, reportPath, unclassifiedFailure), /must have required property 'failureClass'/);

  const mismatchedCaseSet = structuredClone(report);
  mismatchedCaseSet.cases[0].caseId = 'case-not-in-pinned-dataset';
  await assert.rejects(validateStructuredValue(root, reportPath, mismatchedCaseSet), /must cover exactly the pinned dataset case IDs/);
  const externallyPinnedContract = structuredClone(report);
  externallyPinnedContract.$schema = 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/blob/0123456789abcdef0123456789abcdef01234567/architecture/contracts/evaluation-report.schema.json';
  await validateStructuredValue(root, reportPath, externallyPinnedContract);

  const movingContractReference = structuredClone(report);
  movingContractReference.$schema = 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/blob/main/architecture/contracts/evaluation-report.schema.json';
  await assert.rejects(validateStructuredValue(root, reportPath, movingContractReference), /violates evaluation-report\.schema\.json/);

  assert.deepEqual(report.results.deterministicChecks.map((check) => check.checkId), ['synthetic-contract-shape']);
  assert.deepEqual(report.results.semanticJudgments, []);
  assert.equal(report.baseline.status, 'unmeasured');
  assert.equal(report.comparison.claim, 'not-compared');

  for (const layer of ['factory', 'product-outcome']) {
    const matchingLayer = structuredClone(report);
    matchingLayer.layer = layer;
    matchingLayer.subject.layer = layer;
    await validateStructuredValue(root, reportPath, matchingLayer);
  }

  const mismatchedLayer = structuredClone(report);
  mismatchedLayer.layer = 'factory';
  await assert.rejects(validateStructuredValue(root, reportPath, mismatchedLayer), /violates evaluation-report\.schema\.json/);

  const missingImmutablePin = structuredClone(report);
  delete missingImmutablePin.dataset.sourcePin.commit;
  await assert.rejects(validateStructuredValue(root, reportPath, missingImmutablePin), /must have required property 'commit'/);

  const unsupportedProperty = structuredClone(report);
  unsupportedProperty.authorizesExecution = true;
  await assert.rejects(validateStructuredValue(root, reportPath, unsupportedProperty), /must NOT have additional properties/);

  const unsupportedNestedProperty = structuredClone(report);
  unsupportedNestedProperty.subject.sourcePin.branch = 'main';
  await assert.rejects(validateStructuredValue(root, reportPath, unsupportedNestedProperty), /must NOT have additional properties/);

  const unmeasuredImprovement = structuredClone(report);
  unmeasuredImprovement.comparison.claim = 'improvement';
  await assert.rejects(validateStructuredValue(root, reportPath, unmeasuredImprovement), /must be equal to constant/);

  const incompleteMeasuredBaseline = structuredClone(report);
  incompleteMeasuredBaseline.baseline.status = 'measured';
  delete incompleteMeasuredBaseline.baseline.reasonUnmeasured;
  await assert.rejects(validateStructuredValue(root, reportPath, incompleteMeasuredBaseline), /must have required property 'measurement'/);

  const comparableImprovement = structuredClone(report);
  comparableImprovement.baseline.status = 'measured';
  delete comparableImprovement.baseline.reasonUnmeasured;
  comparableImprovement.baseline.measurement = {
    metricId: 'task-success', value: 0.5, unit: 'ratio', observationWindow: '2026-Q3',
    observedAt: '2026-10-01T00:00:00Z', evidenceRefs: ['baseline.json'],
  };
  comparableImprovement.comparison.claim = 'improvement';
  comparableImprovement.comparison.candidateMeasurement = {
    metricId: 'task-success', value: 0.75, unit: 'ratio', observationWindow: '2026-Q3',
    observedAt: '2026-10-08T00:00:00Z', evidenceRefs: ['candidate.json'],
  };
  comparableImprovement.improvementHypothesis = {
    status: 'proposed',
    rationale: 'A measured candidate change is expected to improve the pinned task-success measure.',
    statement: 'The candidate improves task success under the same case set and observation window.',
    metricId: 'task-success',
    expectedDirection: 'higher-is-better',
  };
  comparableImprovement.dataset.partition = 'validation';
  comparableImprovement.dataset.integrity = {
    contaminationStatus: 'assessed-no-known-contamination',
    assessedAt: comparableImprovement.dataset.integrity.assessedAt,
    provenanceBasis: 'The pre-registered validation cases were checked against candidate-development artifacts and author access records.',
    evidenceRefs: ['https://github.com/agentic-delivery-lab/agentic-delivery-primitives/blob/0123456789abcdef0123456789abcdef01234567/evaluations/validation/integrity-review.yml'],
  };
  comparableImprovement.graders.deterministic.independence.relation = 'independent';
  comparableImprovement.graders.semantic.independence.relation = 'independent';
  for (const grader of Object.values(comparableImprovement.graders)) {
    grader.calibration = {
      status: 'verified',
      evaluatorVersion: grader.evaluator.version,
      datasetPin: structuredClone(comparableImprovement.dataset.sourcePin),
      resultRef: 'https://github.com/agentic-delivery-lab/agentic-delivery-primitives/blob/0123456789abcdef0123456789abcdef01234567/evaluations/calibration/result.yml',
      rationale: 'A pinned calibration set was replayed against this exact grader version.',
    };
  }
  comparableImprovement.review.status = 'independent';
  comparableImprovement.review.reviewerId = 'independent-validator';
  comparableImprovement.review.rationale = 'A reviewer outside the candidate authorship reviewed the result.';
  await validateStructuredValue(root, reportPath, comparableImprovement);

  const selfGradedComparison = structuredClone(comparableImprovement);
  selfGradedComparison.graders.semantic.independence.relation = 'not-independent';
  await assert.rejects(validateStructuredValue(root, reportPath, selfGradedComparison), /comparative claims require independent, calibrated graders and an independent review/);

  const uncalibratedComparison = structuredClone(comparableImprovement);
  uncalibratedComparison.graders.semantic.calibration.status = 'inconclusive';
  await assert.rejects(validateStructuredValue(root, reportPath, uncalibratedComparison), /comparative claims require independent, calibrated graders and an independent review/);

  const staleCalibration = structuredClone(comparableImprovement);
  staleCalibration.graders.semantic.calibration.evaluatorVersion = 'older-evaluator-version';
  await assert.rejects(validateStructuredValue(root, reportPath, staleCalibration), /require calibration evidence for each pinned evaluator version/);

  const selectedDevelopmentSet = structuredClone(comparableImprovement);
  selectedDevelopmentSet.dataset.partition = 'development';
  await assert.rejects(validateStructuredValue(root, reportPath, selectedDevelopmentSet), /comparative claims require a validation or holdout dataset partition/);

  const contaminatedComparison = structuredClone(comparableImprovement);
  contaminatedComparison.dataset.integrity.contaminationStatus = 'suspected';
  await assert.rejects(validateStructuredValue(root, reportPath, contaminatedComparison), /comparative claims require a dataset assessed with no known contamination/);

  const unknownIntegrityComparison = structuredClone(comparableImprovement);
  unknownIntegrityComparison.dataset.integrity.contaminationStatus = 'unknown';
  await assert.rejects(validateStructuredValue(root, reportPath, unknownIntegrityComparison), /comparative claims require a dataset assessed with no known contamination/);

  const incomparableImprovement = structuredClone(comparableImprovement);
  incomparableImprovement.comparison.candidateMeasurement.observationWindow = '2026-Q4';
  await assert.rejects(validateStructuredValue(root, reportPath, incomparableImprovement), /must use the same observationWindow/);

  const incomparableUnit = structuredClone(comparableImprovement);
  incomparableUnit.comparison.candidateMeasurement.unit = 'percent';
  await assert.rejects(validateStructuredValue(root, reportPath, incomparableUnit), /must use the same unit/);

  const ungroundedHypothesis = structuredClone(comparableImprovement);
  ungroundedHypothesis.improvementHypothesis.status = 'not-proposed';
  await assert.rejects(validateStructuredValue(root, reportPath, ungroundedHypothesis), /must be equal to constant/);
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
  assert.equal(result.decisionIds.length, 23);
  assert.equal(result.adrIds.length, 21);
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
  assert.equal(result.recordById.get('ADR-0022').origin.sourceIssue, 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/5');
  assert.equal(result.recordById.get('ADR-0023').origin.sourceIssue, 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11');
  assert.notEqual(result.recordById.get('ADR-0022').origin.sourceIssue, result.inventory.sourceIssue);
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

  const proposalFromOtherRepository = structuredClone(result.inventory);
  proposalFromOtherRepository.records.find((record) => record.id === 'ADR-0022').origin.sourceIssue = 'https://github.com/agentic-delivery-lab/agentic-delivery/issues/60';
  await assert.rejects(validateDecisionInventory(root, { inventory: proposalFromOtherRepository }), /must point to an issue in this Architecture repository/);

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
  assert.deepEqual(await validateDiagrams(root), { structurizr: 1, mermaid: 8, requiredMermaid: 6, plantuml: 1 });
});

test('organizational strategy has stable goals, measurable evidence, and fail-closed Project boundaries', async () => {
  const result = await validateOrganizationalStrategy(root);
  assert.equal(result.goals, 7);
  assert.equal(result.measures, 12);
  assert.equal(result.valueStreams, 2);
  assert.ok(result.traceabilityLinks >= 100);

  const strategy = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/strategy/organizational-strategy.yml'), 'utf8'),
    'organizational strategy test fixture',
  );
  const sourceOfTruthRequirements = [
    [/strategic goals, principles, ADRs, quality scenarios, and measure definitions/i, /Architecture Authority/],
    [/native Issue Type definitions/i, /Organization Issue Types/],
    [/organization Issue Field definitions/i, /Organization Issue Field/],
    [/Issue-native type value.*labels/i, /Origin repository Issue/],
    [/portfolio sequencing/i, /Approved organization portfolio Project/],
    [/pull request review.*release decisions/i, /human maintainer/],
    [/evaluation datasets, cases, graders/i, /Agentic Primitives/],
    [/observed evaluation report values/i, /repository that owns the evaluated/],
    [/released capability, controller, and consumer artifact pins/i, /repository that publishes/],
  ];
  for (const [factPattern, ownerPattern] of sourceOfTruthRequirements) {
    const row = strategy.sourceOfTruth.find(({ fact }) => factPattern.test(fact));
    assert.ok(row && ownerPattern.test(row.owner), `source-of-truth map must cover ${factPattern}`);
  }
  const operationalGoal = strategy.strategicGoals.find(({ id }) => id === 'SG-03');
  assert.ok(['SM-002', 'SM-010', 'SM-011'].every((id) => operationalGoal.measureIds.includes(id)));
  assert.ok(strategy.successMeasures.some(({ id, name }) => id === 'SM-010' && /budget/i.test(name)));
  assert.ok(strategy.successMeasures.some(({ id, name }) => id === 'SM-011' && /recovery/i.test(name)));
  assert.ok(strategy.successMeasures.some(({ id, name }) => id === 'SM-012' && /evaluation integrity/i.test(name)));
  const unresolvedResearchSource = structuredClone(strategy);
  unresolvedResearchSource.researchBasis[0].source = 'https://example.com/unlisted-research';
  assert.ok(validateOrganizationalStrategyValue(unresolvedResearchSource)
    .some((error) => /research source must resolve to a cited reference/.test(error)));

  const duplicated = structuredClone(strategy);
  duplicated.strategicGoals[1].id = duplicated.strategicGoals[0].id;
  assert.ok(validateOrganizationalStrategyValue(duplicated).some((error) => /identifiers must be unique/.test(error)));

  const projectCanAuthorize = structuredClone(strategy);
  projectCanAuthorize.projectPlanning.executionAuthorizationRule = 'Project status authorizes execution.';
  assert.ok(validateOrganizationalStrategyValue(projectCanAuthorize).some((error) => /never authorize or block execution/.test(error)));

  const inventedTarget = structuredClone(strategy);
  inventedTarget.successMeasures[0].targetStatus = 95;
  assert.ok(validateOrganizationalStrategyValue(inventedTarget).some((error) => /invalid target status/.test(error)));

  const unsupportedAdoption = structuredClone(strategy);
  unsupportedAdoption.strategicGoals[0].status = 'adopted';
  assert.ok(validateOrganizationalStrategyValue(unsupportedAdoption).some((error) => /adoption record/.test(error)));
  await assert.rejects(
    validateStructuredValue(root, 'architecture/strategy/organizational-strategy.yml', unsupportedAdoption),
    /adoptionEvidence/,
  );
  unsupportedAdoption.strategicGoals[0].adoptionEvidence = {
    record: 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11',
    recordedAt: '2026-10-09',
  };
  assert.deepEqual(validateOrganizationalStrategyValue(unsupportedAdoption), []);
  await validateStructuredValue(root, 'architecture/strategy/organizational-strategy.yml', unsupportedAdoption);

  const measured = structuredClone(strategy);
  measured.successMeasures[0].baselineStatus = 'measured';
  measured.successMeasures[0].baseline = {
    value: 0.75,
    numerator: 3,
    denominator: 4,
    unit: 'ratio',
    reportingWindow: '2026-Q3',
    observedAt: '2026-10-09',
    evidence: ['https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11'],
  };
  measured.successMeasures[0].targetStatus = 'approved';
  measured.successMeasures[0].target = {
    value: 0.9,
    unit: 'ratio',
    approvedAt: '2026-10-09',
    approvalIssue: 'https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11',
  };
  assert.deepEqual(validateOrganizationalStrategyValue(measured), []);
  await validateStructuredValue(root, 'architecture/strategy/organizational-strategy.yml', measured);

  const inconsistentRatio = structuredClone(measured);
  inconsistentRatio.successMeasures[0].baseline.value = 0.8;
  assert.ok(validateOrganizationalStrategyValue(inconsistentRatio).some((error) => /must equal numerator divided by denominator/.test(error)));

  const impossibleRatio = structuredClone(measured);
  impossibleRatio.successMeasures[0].baseline.numerator = 5;
  impossibleRatio.successMeasures[0].baseline.denominator = 4;
  impossibleRatio.successMeasures[0].baseline.value = 1.25;
  assert.ok(validateOrganizationalStrategyValue(impossibleRatio).some((error) => /numerator cannot exceed denominator/.test(error)));

  const projectOwnsExecutionDependency = structuredClone(strategy);
  projectOwnsExecutionDependency.sourceOfTruth.find((entry) => /portfolio sequencing/i.test(entry.fact)).rule =
    'Issue Priority remains the canonical per-Issue priority value when assigned; Project fields may own distinct portfolio sequencing or grouping and execution dependency gates.';
  assert.ok(validateOrganizationalStrategyValue(projectOwnsExecutionDependency).some((error) => /execution dependency gates remain owned by the source Issue/.test(error)));

  const productRegressionMeasure = strategy.successMeasures.find((measure) => measure.id === 'SM-007');
  assert.match(productRegressionMeasure.computation, /same completed observation window/i);
  const zeroDenominator = structuredClone(measured);
  zeroDenominator.successMeasures[0].baseline.denominator = 0;
  assert.ok(validateOrganizationalStrategyValue(zeroDenominator).some((error) => /zero denominator and numerator as undefined/.test(error)));
  const impossibleZeroDenominator = structuredClone(zeroDenominator);
  impossibleZeroDenominator.successMeasures[0].baseline.numerator = 1;
  assert.ok(validateOrganizationalStrategyValue(impossibleZeroDenominator).some((error) => /zero denominator and numerator as undefined/.test(error)));
  await assert.rejects(
    validateStructuredValue(root, 'architecture/strategy/organizational-strategy.yml', impossibleZeroDenominator),
    /must be equal to constant/,
  );

  const impossibleTarget = structuredClone(measured);
  impossibleTarget.successMeasures[0].target.value = 1.1;
  await assert.rejects(
    validateStructuredValue(root, 'architecture/strategy/organizational-strategy.yml', impossibleTarget),
    /must be <= 1/,
  );

  const evidence = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/references/system-evidence.yml'), 'utf8'),
    'system evidence test fixture',
  );
  assert.deepEqual(validateProjectInventoryEvidence(strategy, evidence), []);
  const unsupportedInventory = structuredClone(strategy);
  unsupportedInventory.projectPlanning.projectInventoryEvidenceId = 'project-inventory-access';
  delete unsupportedInventory.projectPlanning.inventoryEvidence;
  assert.ok(validateProjectInventoryEvidence(unsupportedInventory, evidence).some((error) => /completed dated inventory/.test(error)));
  await assert.rejects(
    validateStructuredValue(root, 'architecture/strategy/organizational-strategy.yml', unsupportedInventory),
    /must NOT have additional properties|must have required property 'inventoryEvidence'/,
  );

  const projectIdsDoNotMatch = structuredClone(strategy);
  projectIdsDoNotMatch.projectPlanning.inventoryEvidence.projectIds = ['PVT_example'];
  assert.ok(validateProjectInventoryEvidence(projectIdsDoNotMatch, evidence).some((error) => /completed dated inventory/.test(error)));

  const duplicateFact = structuredClone(strategy);
  duplicateFact.sourceOfTruth.push(structuredClone(duplicateFact.sourceOfTruth[0]));
  assert.ok(validateOrganizationalStrategyValue(duplicateFact).some((error) => /exactly one canonical row/.test(error)));
});

test('every strategic goal declares traceability across governance, delivery, planning, and evaluation', async () => {
  const strategy = parseRepositoryYaml(
    await readFile(path.join(root, 'architecture/strategy/organizational-strategy.yml'), 'utf8'),
    'organizational strategy traceability fixture',
  );
  const untracedGoal = structuredClone(strategy);
  delete untracedGoal.strategicGoals[0].traceability;

  await assert.rejects(
    validateStructuredValue(root, 'architecture/strategy/organizational-strategy.yml', untracedGoal),
    /traceability/,
  );

  const [qualityScenarios, principleIndex, decisionInventory, systemEvidence] = await Promise.all([
    readFile(path.join(root, 'architecture/quality/quality-scenarios.yml'), 'utf8')
      .then((value) => parseRepositoryYaml(value, 'quality-scenario traceability fixture')),
    readFile(path.join(root, 'architecture/principles/index.yml'), 'utf8')
      .then((value) => parseRepositoryYaml(value, 'principle traceability fixture')),
    readFile(path.join(root, 'architecture/references/decision-inventory.yml'), 'utf8')
      .then((value) => parseRepositoryYaml(value, 'decision traceability fixture')),
    readFile(path.join(root, 'architecture/references/system-evidence.yml'), 'utf8')
      .then((value) => parseRepositoryYaml(value, 'system-evidence traceability fixture')),
  ]);
  const contractPaths = (await readdir(path.join(root, 'architecture/contracts')))
    .filter((name) => name.endsWith('.schema.json'))
    .map((name) => 'architecture/contracts/' + name);
  const traceabilityCatalogs = {
    qualityScenarioIds: qualityScenarios.scenarios.map(({ id }) => id),
    principleIds: principleIndex.principles.map(({ id }) => id),
    decisionIds: decisionInventory.records.map(({ id }) => id),
    contractPaths,
    repositories: systemEvidence.repositories,
    localEvidencePaths: [
      'architecture/references/strategy-foundation-gap-matrix.md',
      'architecture/references/system-evidence.yml',
      'architecture/evaluation/examples/agent-capability-report.yml',
    ],
    observationIds: systemEvidence.observations.map(({ id }) => id),
  };
  const strategyWithTraceability = structuredClone(strategy);
  assert.deepEqual(validateOrganizationalStrategyTraceabilityValue(strategyWithTraceability, traceabilityCatalogs), []);

  const unresolvedScenario = structuredClone(strategyWithTraceability);
  unresolvedScenario.strategicGoals[0].traceability.qualityScenarioIds = ['QR-999'];
  assert.ok(validateOrganizationalStrategyTraceabilityValue(unresolvedScenario, traceabilityCatalogs)
    .some((error) => /unknown quality scenario QR-999/.test(error)));

  const wrongCapabilityPin = structuredClone(strategyWithTraceability);
  wrongCapabilityPin.strategicGoals[0].traceability.capabilityRefs[0].sourceCommit = '0'.repeat(40);
  assert.ok(validateOrganizationalStrategyTraceabilityValue(wrongCapabilityPin, traceabilityCatalogs)
    .some((error) => /capability pin does not match the inventoried main revision/.test(error)));

  const missingContract = structuredClone(strategyWithTraceability);
  missingContract.strategicGoals[0].traceability.contractRefs = ['architecture/contracts/missing.schema.json'];
  assert.ok(validateOrganizationalStrategyTraceabilityValue(missingContract, traceabilityCatalogs)
    .some((error) => /unknown contract architecture\/contracts\/missing\.schema\.json/.test(error)));

  const fabricatedRepository = structuredClone(strategyWithTraceability);
  fabricatedRepository.strategicGoals[0].traceability.implementationIssueRefs = [
    'https://github.com/agentic-delivery-lab/unknown-repository/issues/1',
  ];
  assert.ok(validateOrganizationalStrategyTraceabilityValue(fabricatedRepository, traceabilityCatalogs)
    .some((error) => /invalid or out-of-inventory implementationIssueRefs/.test(error)));

  const falseObservation = structuredClone(strategyWithTraceability);
  falseObservation.strategicGoals[0].traceability.evaluationEvidenceRefs = [{
    reference: 'architecture/references/system-evidence.yml#invented-evaluation',
    status: 'observed',
  }];
  assert.ok(validateOrganizationalStrategyTraceabilityValue(falseObservation, traceabilityCatalogs)
    .some((error) => /observed evaluation evidence must resolve to a system-evidence observation/.test(error)));
});

test('architecture release identifies the target authority', async () => {
  const result = await validateArchitectureRelease(root);
  const release = JSON.parse(await readFile(path.join(root, 'architecture/generated/architecture-release.json'), 'utf8'));
  const releaseSchema = JSON.parse(await readFile(path.join(root, 'architecture/contracts/architecture-release.schema.json'), 'utf8'));
  assert.equal(result.architectureId, 'urn:agentic-delivery:architecture:authority');
  assert.match(result.contentSha256, /^[0-9a-f]{64}$/);
  assert.equal(result.status, 'draft');
  assert.equal(release.contractVersions.evaluationReport, '2.0.0');
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
