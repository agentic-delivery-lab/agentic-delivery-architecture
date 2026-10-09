# Implementation Plan: Evaluation Evidence Contract and Gap Matrix

## Objective

Specify a versioned, provenance-complete evaluation report contract for agent
capabilities, factory behavior, and product outcomes; add a synthetic offline
example and structural tests; and record the current strategy-foundation gaps
with their evidence and owner Issues. This is an Architecture proposal. It does
not run evaluations, create Project configuration, or claim production
integration.

## Architecture Decisions

- Architecture Authority owns the shared evaluation-report shape and its
  meaning. Agentic Primitives owns reusable datasets and graders; the Control
  Plane owns authorized evaluation execution and Issue routing; product
  repositories own their product-specific outcomes.
- Evaluation reports extend the existing evidence/conformance model by being
  addressable through evidence references. They do not create a second
  results store or a work-lifecycle state machine.
- Every report distinguishes deterministic checks from semantic judgments and
  pins its subject, dataset/case, grader, comparator, baseline, and dependencies
  by immutable source identity and digest.
- An unmeasured baseline forbids improvement claims. An evaluation result may
  recommend an owner Issue, but it cannot create or prioritize work, authorize
  execution, alter policy, or approve a release.
- Product-specific outcomes remain unknown until Architecture Issue #13
  identifies a real product repository and accountable steward. The newly
  authorized read-only inventory returned no organization or personal
  Projects and no Project associations for the deliverable Issues. Issue #12
  now supplies that evidence; a separate human-review configuration
  recommendation remains necessary.

## Task List

Tasks are tracked in the existing external owner Issues rather than a duplicate
checklist: [Architecture #11](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11)
owns this proposal; [Primitives #3](https://github.com/agentic-delivery-lab/agentic-delivery-primitives/issues/3)
owns offline datasets and graders; [Architecture #12](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/12)
owns read-only Project inventory; [Architecture #13](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/13)
owns product discovery; [Control Plane #101](https://github.com/agentic-delivery-lab/agentic-delivery/issues/101)
owns the provisional Project-planning contract; and [Distribution #3](https://github.com/agentic-delivery-lab/agentic-delivery-distribution/issues/3)
owns conditional consumer onboarding. Architecture [#15](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/15)
owns the human portfolio-topology decision; Control Plane [#103](https://github.com/agentic-delivery-lab/agentic-delivery/issues/103)
owns bounded evaluation-finding routing.

### Phase 1: Specify evidence boundaries

- [x] Task 1: Define the shared evaluation report contract and dated current-
  state gap matrix.
  - Acceptance: Cover all three evaluation layers, immutable pins, baseline
    semantics, evaluator independence, uncertainty, evidence, regression
    severity, owner-Issue recommendation, and non-authorizing behavior.
  - Verification: Review the specification against assignment Sections 12,
    13, 16, and Deliverables A/D/E; cite the audited sources and open owner
    Issues.
  - Dependencies: None.
  - Files likely touched: `architecture/evaluation/README.md`,
    `architecture/references/strategy-foundation-gap-matrix.md`.
  - Estimated scope: Small.

### Phase 2: Validate a report fixture

- [x] Task 2: Add a strict versioned JSON Schema and synthetic report fixture.
  - Acceptance: The fixture validates; missing immutable pins, layer/subject
    mismatches, unsupported properties, and improvement claims without a
    measured baseline fail validation. Deterministic and semantic outcomes
    remain separate.
  - Verification: `pnpm architecture:check` and focused contract tests.
  - Dependencies: Task 1.
  - Files likely touched: `architecture/contracts/evaluation-report.schema.json`,
    `architecture/evaluation/examples/agent-capability-report.yml`,
    `tools/validate-structured-data.mjs`, and `tests/arc42-structure.test.mjs`.
  - Estimated scope: Medium.

### Phase 3: Pin and trace the proposal

- [x] Task 3: Pin the report-contract version in the draft Architecture
  release and connect its evidence boundaries to quality requirements and the
  current-state matrix.
  - Acceptance: The exact contract version is validated; QR-015 and arc42
    distinguish the proposed schema from pending datasets, graders, baselines,
    runtime evaluation, and live evidence.
  - Verification: `pnpm architecture:check`, `pnpm migration:check`, and
    `pnpm test`; recompute and verify the normalized Architecture source digest.
  - Dependencies: Task 2.
  - Files touched: Architecture release manifest/schema, quality scenarios,
    arc42 evidence, and tests.
  - Estimated scope: Medium.

### Checkpoint: Proposed contract

- [x] All Architecture validation and tests pass on the exact pinned tree.
- [x] The example remains explicitly synthetic and reports no live baseline.
- [x] The gap matrix links every unresolved operational increment to evidence
  and an owner Issue.
- [x] No Projects, permissions, App settings, releases, or participants were
  changed.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| The schema is mistaken for an implemented evaluator. | High | Label it proposed; keep the example synthetic; distinguish it from Primitives #3 and any runtime execution. |
| A favorable result is claimed without a comparable baseline. | High | Require a measured pinned baseline for improvement claims and carry uncertainty in every report. |
| Product fields over-standardize product outcomes. | Medium | Keep the report envelope generic and let product owners define domain-specific measures. |
| A complete Project inventory is mistaken for proof about unrelated owners or future field visibility. | High | Record the authenticated owners and page completion; keep any future Project's field visibility and entitlement unverified. |

## Open Questions

- Should the organization provision the proposed one-Project/two-view
  portfolio? The complete read-only inventory returned no Project; Architecture
  #15 now records the required human topology decision.
- Which product repository, steward, user evidence, and approved feedback path
  should define product-outcome evaluations? Architecture #13 records these
  as unknown pending discovery.
- Which dataset, deterministic graders, replay runner, and independent
  reviewer are available? Primitives #3 owns that implementation discovery.
