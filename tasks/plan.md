# Implementation Plan: Strategy Foundation, Project Planning, and Evaluation Evidence

## Objective

Complete the Architecture #11 strategy foundation and plan its owner-specific
delivery across the six visible organization repositories. The target is one
governed strategy source, two value streams, an Issue-authorized execution
model with Projects as the planning surface, reproducible evaluation evidence,
and bounded feedback into human-prioritized work. The evaluation contract and
strategy work already recorded in Phases 1–3 below remain preserved. The
user's assignment authorizes local, reversible implementation and validation
on the existing Architecture #11 branch. This plan records scope and evidence;
it does not authorize live Project configuration, permission changes,
product-repository creation, merges, releases, or participant activation.

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
- Reports also pin a pre-run case-selection policy and dataset partition,
  evaluator versions, calibration evidence, and reviewer independence.
  Comparative claims use only validation or holdout cases and fail closed when
  grading or review independence is unknown.
- An unmeasured baseline forbids improvement claims. An evaluation result
  cannot itself create or prioritize work, authorize execution, alter policy,
  or approve a release. A separately authorized source Issue may request a
  bounded owner-Issue proposal or create/update operation; people retain
  prioritization and execution authority.
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
owns bounded evaluation-finding routing. Control Plane [#105](https://github.com/agentic-delivery-lab/agentic-delivery/issues/105)
owns per-run resource budgets and safe recovery receipts. It has no Project
association yet; Architecture #15 owns the human topology decision needed to
choose the Factory Evolution view.

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

### Phase 4: Complete strategy traceability and ownership

- [x] Task 4: Link every strategic goal to canonical quality scenarios,
  principles, decisions, capabilities/contracts, owner Issues, Project
  planning context, and evaluation evidence or an explicit capability gap.
  - Acceptance: Every target is named and stable; local IDs and contract paths
    resolve; capability references match exact audited main commits and
    inventoried paths; Issue references stay within the six audited repos;
    synthetic, pending, and observed evidence remain distinct.
  - Verification: Focused strategy tests, `pnpm architecture:check`,
    `pnpm migration:check`, and `pnpm test`.
  - Dependencies: Read-only inventory and owner Issue review.
  - Files likely touched: strategy schema/source, validator, tests, source map.
  - Estimated scope: Medium.

### Phase 5: Close evaluation-contract gaps

- [x] Task 5: Version the proposed evaluation contract with named task cases,
  expected outcomes, evaluator identity/independence, failure classes, and
  improvement hypotheses.
  - Acceptance: Case IDs exactly match the pinned dataset; comparisons require
    the same metric, unit, and observation window; improvement claims require
    a measured pinned baseline and a testable hypothesis. Comparative claims
    also require a pre-run selection policy and dataset-integrity assessment,
    validation/holdout partition with no known contamination, independently
    calibrated grader/evaluator versions, and independent review.
    The example remains synthetic and no run is fabricated.
  - Verification: Focused contract tests, `pnpm architecture:check`,
    `pnpm migration:check`, and `pnpm test`.
  - Dependencies: Tasks 1–3.
  - Files likely touched: evaluation schema/fixture, validator, release pin,
    arc42, quality requirements, and tests.
  - Estimated scope: Medium.

### Phase 6: Deliver the six required architecture views

- [x] Task 6: Complete strategic alignment, organization context,
  Project/Issue lifecycle, factory evolution, product delivery, and trust
  boundary diagrams; update the canonical Structurizr/C4 model.
  - Acceptance: Each view distinguishes a target relationship from observed
    operation; context includes GitHub App, Vercel ingress, Neon replay,
    Actions/Codex, both adapters, and the unidentified product-repository
    boundary. Webhook, session, and evaluation replay remain separate.
  - Verification: Diagram source tests and `pnpm architecture:check`.
  - Dependencies: Tasks 4–5 and current source inventory.
  - Files likely touched: `architecture/diagrams/`, Structurizr DSL,
    diagram validator, README, and arc42 chapters.
  - Estimated scope: Medium.

### Phase 7: Record runtime instruction-context evidence

- [x] Task 7: Tie the exact Control Plane main pin, Codex CLI version,
  controller instructions, task workspace, and isolated instruction-discovery
  test to the system evidence register.
  - Acceptance: Clearly distinguish source review and local CLI fixture from
    Actions/live evidence; identify any untested customization or injection
    behavior without claiming it is solved.
  - Verification: `pnpm architecture:check` and evidence-reference tests.
  - Dependencies: Current exact-main source inspection.
  - Files likely touched: `architecture/references/system-evidence.yml`,
    its schema, runtime/quality arc42 sections, and strategy trace references.
  - Estimated scope: Small.

### Phase 8: Cover bounded operations and evaluation integrity

- [x] Task 8: Trace the missing security/reliability/observability/resource-
  budget/human-accountability themes into quality scenarios, unmeasured
  measures, evaluation-contract checks, and the architecture risk register.
  - Acceptance: QR-017/QR-018 specify hard run limits and safe recovery;
    QR-019 specifies drift, contamination, case selection, and self-grading
    protections. SM-010–SM-012 define inspectable measures without inventing
    baselines or claiming runtime adoption.
  - Verification: Focused evaluation and strategy tests; `pnpm
    architecture:check`, `pnpm migration:check`, and `pnpm test`.
  - Dependencies: Architecture #11 review; owner-specific runtime/evaluation
    implementation remains gated on the accepted Architecture contract.
  - Files touched: evaluation schema/fixture/validator, strategy, quality
    scenarios, arc42, risk register, evidence, and tests.
  - Estimated scope: Medium.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| The schema is mistaken for an implemented evaluator. | High | Label it proposed; keep the example synthetic; distinguish it from Primitives #3 and any runtime execution. |
| A favorable result is claimed without a comparable baseline. | High | Require a measured pinned baseline for improvement claims and carry uncertainty in every report. |
| Grader drift, benchmark contamination, favorable-case selection, or self-grading invalidates comparisons. | High | Pin evaluator versions and calibration; pre-register case selection; use validation/holdout partitions and independent review; keep unknown results inconclusive. |
| Agent turns, retries, recursion, or unavailable quota accounting exceed bounded resources. | High | Require deterministic per-run caps and terminal usage receipts; report unknown quota/spend honestly and stop at hard limits. |
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
- Which run limits are available in the approved Codex runner, and which quota
  or spend counters does it expose? Control Plane #105 owns the design and
  evidence; Project association remains pending Architecture #15.

## Continuation Plan for Architecture Issue #11

### Read-only planning snapshot

The authenticated `gh` identity was `sjefsharp` and had `project`, `admin:org`,
`repo`, and `workflow` scopes. At 2026-10-09 15:56 UTC, the organization REST
resource reported both `has_organization_projects=true` and
`has_repository_projects=true`. Complete GraphQL connections for the
organization, authenticated user, and all six visible organization
repositories returned no Projects and no additional pages. The six
repositories had 19 open Issues in total; every open Issue had zero Project
associations. Nine organization Issue Types were enabled. The six organization
Issue Fields (Priority, Start date, Target date, Effort, Lifecycle Stage, and
Delivery Readiness) were all marked organization-members-only. No distinct
product repository or steward was identified in the six-repository inventory.
Corrected REST reads of the issue-field-values endpoint returned empty arrays
for all 19 open Issues at 15:58 UTC. No GitHub Releases were listed across the
six repositories; the Control Plane has draft controller tags, and the other
five repositories returned no tags. The latest cited exact-main controller
run completed authorization, classification, and receipt finalization but
skipped delivery; all six participants remain in shadow mode. The organization
App inventory showed the invoker installation has no Projects permission; the
authenticated user's broad OAuth scopes do not grant that permission to the
runtime App. The App installation's selected-repository membership endpoint
was not available to this identity. These are read-only observations; no
Project, field, permission, or Issue was changed.

The owner pull requests already open at this snapshot are Control Plane #102
(`c98b24e`), Control Plane #104 (`2cf258d`), Architecture #14 (`06e8f6e`), and
Primitives #4 (`b5f0050`). PR #14 is blocked and PR #4 is draft/blocked; #102
and #104 have passing exact-head checks but no human review. Their presence is
implementation evidence on provisional branches, not approval, merge,
release, or operational evidence.

At 16:13 UTC, `gh project list --owner agentic-delivery-lab` still returned no
organization Projects. The fetched Control Plane `main` commit
`67e5941a9bb594cab5c9cd2da0bead4caa7b6bbf` pins Codex CLI `0.159.3`; the
active Issue #60 checkout is older and pins `0.153.4`. Open PR #86 proposes
`0.160.0` but currently conflicts and has no review decision, so it is not the
accepted runner baseline. The CLI installed in this workspace reports
`codex-cli 0.157.1`; local help output is not evidence for behavior of the
runner's pinned `0.159.3`. At 16:19 UTC, the verified `0.159.3` package from
the exact `main` pin was exercised with `codex debug prompt-input` in an
isolated fixture: root and current-directory `AGENTS.md` markers were loaded,
nested instructions were excluded when running at the project root, and an
instruction above the `.git` project root was excluded. This did not test the
Actions runner's actual working directory, distributed customizations, or
instruction-injection resistance. The dedicated temporary directory was
removed automatically; no model call or authentication change occurred.

At 16:22 UTC, static review of the fetched Control Plane `main` at
`67e5941a9bb594cab5c9cd2da0bead4caa7b6bbf` established the current source path:
the workflow invokes `scripts/codex-delivery.mjs` from the controller checkout;
the Codex app-server starts with `controllerRoot` as its cwd, while each thread
starts or resumes with `CODEX_DELIVERY_STATE_DIR/<repository-id>/<issue>/workspace`
as its cwd. The controller clones the source repository's `main` into that
workspace, reads `.agents/codex-delivery.md` from `controllerRoot`, and passes
it as `developerInstructions`; Issue text is explicitly labeled untrusted.
The pinned Codex client also disables plugins and apps, so runtime integration
must not assume those customization surfaces are active. Existing controller
tests use `/workspace` in the thread setup but do not assert the actual `cwd`
field in `thread/start` or `thread/resume` requests.
This is source-code evidence, not proof of a live Actions run; all participants
remain in shadow mode.

At 16:43 UTC, `gh auth status` showed the authenticated `sjefsharp` account had
broad OAuth scopes including `admin:org`, `project`, `repo`, and `workflow`.
The organization CLI Project list still returned no Projects; the six
repository open-Issue listings still totaled 19. All six current `main`
commits matched the pins in `system-evidence.yml`. Control Plane PRs #102 and
#104 remained CLEAN without recorded review decisions, #86 remained DIRTY,
Architecture #14 remained BLOCKED, and Primitives #4 remained draft and
`REVIEW_REQUIRED`. The limited CLI recheck is recorded separately from the
complete GraphQL Project inventory. OAuth scopes describe this user's API
access; they neither grant Projects access to the runtime App nor authorize a
Project or organization-settings change.

At 17:02 UTC, a fresh GraphQL recheck with the expanded OAuth identity
returned zero Project v2 nodes for the organization, authenticated user, and
all six visible repositories. At 17:11 UTC, organization and user
`gh project list --closed` queries were also empty; Issue metadata reads
returned nine native types and six member-only organization fields. At
17:17 UTC, Control Plane #105 was created as a native `Task` for per-run
budgets and safe recovery receipts. At 17:18, all six repository open-Issue
counts totaled 20; #105 had no Project item. Architecture #15 remains the
human topology gate, and no live Project or runtime setting changed.

At 17:37 UTC, the full organization, authenticated-user, and six-repository
GraphQL Project inventory still returned no Projects or additional pages; the
organization and user `gh project list --closed` checks were also empty at
17:39. The broad OAuth identity enabled a fresh inventory of 20 open Issues,
five open PRs, all six default-branch commits, and release/tag state. No
published Release exists; Control Plane has 31 draft tags. Architecture #14
remains BLOCKED without a human review decision, while #102 and #104 are CLEAN
with required checks passing and no review decisions; Control Plane #86 is
DIRTY and Primitives #4 is draft, BLOCKED, and `REVIEW_REQUIRED`. The exact
heads and evidence limits are recorded in observation
`project-inventory-20261009-1737`.
Broad human OAuth scopes do not add Projects permission to the runtime App or
resolve Architecture #15; no Project, App, permission, release, or participant
was changed.

At 17:49 UTC, Control Plane [#106](https://github.com/agentic-delivery-lab/agentic-delivery/issues/106)
was created as a native `Task` and read back with Architecture [#11](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11)
as its parent and no Project item. It defines pinned strategy-context
integration for authorized Codex runs and blocks implementation on reviewed
and released Architecture #14 plus the #60/#66/#101 contracts. The six
repositories now have 21 open Issues. This is a planning Issue; no runtime or
Project configuration changed.

At 18:01 UTC, a read-only audit of Control Plane #101 / PR #102 confirmed the
same-number isolation fixture: source Issue #44 and Project item Issue #44 in
`service-a` are compared, then the item is changed to a foreign repository
while retaining #44 and must fail with `PROJECT_SOURCE_ISSUE_MISMATCH`. PR #102
is still open and has no review decision. Its single-item normalizer does not
select among multiple candidate Project links; that broader #11 acceptance
case remains unverified for any future selection path. See
`control-plane-project-planning-test-audit-20261009-1801`.

At 18:11 UTC, source-backed Codex CLI research for continuation item 3a was
added to `strategy-research-register.md`. The official upstream loader source
documents root-to-current-working-directory `AGENTS.md` discovery; the upstream
`codex exec` source documents its non-interactive option surface. Context7's
versioned catalog only reached `rust-v0.155.1`, while the audited runner pin is
`0.159.3`; the exact-version local fixture remains the separate evidence in
`system-evidence.yml#control-plane-codex-instruction-context-20261009-1622`.
The Control Plane uses app-server rather than `codex exec`, and no Actions or
production behavior is inferred from these documentation/source checks.

The pre-continuation Architecture review identified three proposal gaps:
strategy traceability stopped before quality goals, principles, ADRs,
capabilities/contracts, owner Issues/Project planning, and evaluation evidence;
several required system and trust-boundary views were absent; and the initial
evaluation contract lacked case stimulus/expected-outcome details, deterministic
evaluator identity/independence, failure classification, improvement hypothesis,
and portable comparability checks for units and observation windows. Phases 4–8
below address those local Architecture gaps. Structural validation still does
not establish semantic adoption, independent approval, runtime operation, or
measured outcomes.

### Architecture decisions and invariants

- Architecture Authority owns canonical strategy, goals, principles, ADRs,
  context language, quality requirements, and the shared evidence contract.
- Projects own portfolio sequencing, cross-stream grouping, and visibility;
  each origin repository Issue remains the canonical work request and only
  execution authority. Project membership, fields, dependencies, or events
  cannot authorize or block execution.
- Organization Issue Fields, native Issue Type, lifecycle and delivery
  readiness values remain Issue-owned. Existing lifecycle, runner/session,
  webhook replay, pull-request, and evaluation evidence remain distinct facts
  with their current owners.
- Primitives owns reusable evaluation cases and graders; the Control Plane
  owns bounded execution and routing; each product repository owns its
  domain-specific outcome measures. A report cannot mutate work by itself. A
  separately authorized source Issue may request a bounded owner-Issue
  proposal or create/update; humans retain priority and execution authority.
- Product outcomes and improvement remain unmeasured until a real product
  repository, steward, evidence source, and observation window are identified.
- Codex runs need a compact, provenance-pinned strategy context selected for
  the authorized source Issue. Until an approved Architecture release is
  consumed, the proposal is advisory design input; Issue/Project text remains
  untrusted and deterministic authorization remains separate.
- Existing open PRs remain provisional until independent review. This plan
  grants no live GitHub configuration or merge authority.
- Authorized execution remains time-, invocation-, retry-, and recursion-
  bounded. Control Plane #105 is the owner task; the proposed architecture
  contract does not claim those runtime receipts are already implemented.

### Ordered owner work and dependency map

Tasks remain in the existing GitHub Issues listed above and in Architecture
#11; this section is their ordered index, not a second task checklist. The
Architecture #11 body already links Control Plane #59 as the recovery-lineage
root with its own acceptance criteria and related-context-only boundary; a
fresh read confirms #59 remains open, so do not reopen or expand it. The
scoped strategy-context consumer is not covered by Control Plane #101 or #103
because both explicitly exclude runtime integration. Before implementing that
slice, create one bounded child Issue under Architecture #11 in the Control
Plane using the repository's existing intake rules. This plan does not create
that Issue or associate it with a Project.

| Order | Owner Issue / current PR | Work and acceptance boundary | Dependency / verification | Likely files / scope |
| --- | --- | --- | --- | --- |
| 1 | Architecture #11 / PR #14 | Add stable many-to-many trace links from each strategy goal to quality goals, principles, ADRs, capabilities/contracts, implementation Issues, Project planning context, and evaluation evidence. Complete `sourceOfTruth` for every assignment fact: Issue Type, lifecycle/delivery/governance metadata, source lineage, Issue priority, Project iteration/roadmap/membership/sequencing/dependencies, Actions/Codex/session/webhook state, PR state, decisions, strategy, and evaluation results. Assess ADR-0012/0018/0019 against ADR-0023 and AP-004; retain their Issue lifecycle, authorization, and projection restrictions while making clear that Projects remain the required planning surface. Validate one owner per fact, resolved references, and no inferred links. | Depends on current strategy proposal. Run Architecture, migration, and full tests; add negative fixtures for unresolved, duplicated, and multiply-owned references. | `organizational-strategy.yml`, strategy schema/validator, relevant ADRs, tests; M. |
| 2 | Architecture #11 / PR #14 | Complete all six required architecture views: strategic alignment through eval evidence; organization context including Projects, Issues, all factory owners, GitHub App, Vercel, Neon, Actions/Codex, and products; Project/Issue lifecycle; factory improvement sequence; gated product bootstrap/delivery; and trust boundaries. Update the Structurizr/C4 model where relevant. Keep webhook replay, session continuation, and evaluation replay distinct. | Depends on Task 1 trace terms and current arc42 boundaries. Run diagram validation and review all six views against the assignment and arc42. | Mermaid sources and `workspace.dsl`; M. |
| 3 | Architecture #11 / PR #14 | Extend the portable evaluation contract and reusable validation/tests with case task/stimulus/expected outcome, deterministic evaluator identity and independence, failure classification, improvement hypothesis, and comparable unit/window checks. Cover multiple fixtures, not only the current example. | Depends on the shared report model. Run architecture, migration, and full tests; prove invalid/improvement-without-baseline and incomparable metric cases fail. | evaluation schema, README, fixture, validator, tests; M. |
| 3a | Architecture #11 / PR #14 | Complete the source-backed research register across strategy, architecture, GitHub work management, Codex CLI in Actions, evaluation, and Markdown conventions. For each source record exact URL or repository commit/path, date/version, supported claim, limits, and architectural implication; distinguish verified facts from hypotheses. Context7 currently returns Codex instruction-discovery guidance from unversioned `main` and versioned docs only through `0.155.1`, so verify `0.159.3` behavior against the exact pinned runner rather than extrapolating. | Depends on the existing register and the source-driven research already recorded in the strategy proposal. Check each claim against its primary source and retain scope/version caveats. | `strategy-research-register.md`, strategy references; M. |
| 4 | Architecture #11 / PR #14 | Preserve the pinned 15:56 live evidence snapshot: complete Project/Issue inventory, empty values on 19 open Issues, nine Issue Types, six member-only fields, release/tag state, and execution/participant evidence. Append the 16:13 UTC recheck that the organization CLI Project list is still empty and PR #14/#102/#104 remain open without review decisions while PR #4 remains draft and review-required. Label observation times and historical data precisely. | Depends on exact API/Actions reads and immutable main commits. Run the evidence/schema checks and verify the Architecture release digest. | `system-evidence.yml`, gap matrix, generated release; M. |
| 5 | Primitives #3 / PR #4 | Supply versioned offline evaluation cases, deterministic graders, reproducible replay, immutable source pins, and reviewer-ready evidence for agent capability and factory behavior. Reconcile the manifest digest with the PR's reported digest; make replay output retainable as an artifact. Keep the manual semantic rubric distinct and product outcomes unclaimed. | Depends on the revised Architecture report contract. Run `pnpm primitive:check`, `pnpm migration:check`, and `pnpm test`; verify replay digests and second-run match. Do not describe synthetic cases as a measured baseline. | Primitives dataset/grader/replay files, manifest, CI/tests; M. |
| 6 | Control Plane #101 / PR #102 | Keep Project context as planning input. Required offline fixtures cover Project-only cards, foreign repository identities, same-number Issues in different repositories, multiple candidate links, missing Project/Issue read permissions, inaccessible or mismatched Projects, unsupported/stale fields, and dependency-only cards. Closed or transferred source Issues remain canonical Issue-state cases for the runtime gate, not decisions made by this normalizer. The positive fixture re-fetches the origin repository and Issue and checks the actor gate; it does not replace lifecycle, readiness, or plan authorization. At exact PR #102 head `c98b24e`, review verified the same-number foreign-repository test using Issue #44; multi-candidate link selection is not in this single-item normalizer and remains a separate #11 acceptance gap. | Depends on AP-004 and ADR-0023. Run focused planning-contract tests and the Control Plane quality, migration, portability, and hosted checks. Prove normalization cannot turn Project membership into authorization. No live Project integration is implied. | Planning-context module, schema, tests; M. |
| 7 | Control Plane [#106](https://github.com/agentic-delivery-lab/agentic-delivery/issues/106), child of Architecture #11 | Add a compact trusted strategy context to eligible Codex runs, pinned to an approved Architecture release and digest, selecting only relevant goals, principles, ADRs, contexts, and quality/evaluation criteria. Bind it to the exact authorized source Issue and repository identity, applicable role/capabilities, enforcement policy, and required validation; Project facts remain optional read-only context. Keep Issue and Project text untrusted and unable to alter deterministic authorization. | Block implementation on Architecture #14 review/merge and an approved release pin, Control Plane #60/#66 metadata contracts, and #101's planning boundary. Static review at exact `main` commit `67e5941` confirms the app-server starts at `controllerRoot`, each thread starts/resumes at the isolated Issue workspace, `.agents/codex-delivery.md` is passed as developer instructions, and plugins/apps are disabled; the exact `0.159.3` CLI's root-to-cwd discovery and project-root boundary passed an isolated prompt-input test. Existing tests do not assert the thread `cwd` payload. Add that assertion and test the real Actions runner workspace, distributed customizations that remain supported with plugins disabled, missing/incompatible pins, injection attempts, and no moving-branch strategy fallback. No Project permission is inferred for the App. | Strategy-context selector/envelope, runtime instructions, tests; M. |
| 8 | Control Plane #103 / PR #104 | Route only validated, pinned findings with an unambiguous canonical owner to a reviewable Issue proposal or a bounded create/update operation authorized by a separate source Issue. The proposed Issue must carry the observed problem/evidence, affected goals and capability, cause hypothesis, alternatives, risk, acceptance/eval criteria, baseline, authorization needs, and rollback. The finding cannot set priority or initiate execution. | Depends on the revised report contract and verified owner-routing evidence; end-to-end replay also depends on Primitives #3. Test owner ambiguity, self-targets, malformed/unpinned evidence, recursion depth, invocation/time budget, actor limits, idempotency, and event provenance; run focused routing tests and full Control Plane checks. | Evaluation router, owner map contract, retained result evidence/tests; M. |
| 8a | Control Plane #105 | Enforce pinned per-run duration, turn/invocation, retry, and recursion limits; record admission and terminal usage/stop receipts; distinguish webhook delivery replay, Codex continuation, and evaluation replay; preserve safe recovered-or-held dispositions and zero duplicate protected writes. | Depends on Architecture #14 review/merge. Associate with the approved Factory Evolution Project only after Architecture #15 and Project provisioning; currently #105 has no Project item. Keep all participants in existing modes until separate review/authorization. | Control Plane admission/receipt/recovery path and fixtures; M. |
| 9 | Control Plane #60 | Complete the canonical Issue Field and lifecycle contract using stable field identities, supported values, and the legacy Delivery Readiness compatibility rule. Keep native Issue Type separate from lifecycle, delivery readiness, runner, and PR states. | Coordinate with the existing active #60 worktree and inspect its dirty files before resuming; #62 is its canary. Run migration, field-contract, issue-intake, and scoped live evidence only as already authorized there. | `config/issue-metadata.yml`, issue-field API/tests, audit docs; M. |
| 10 | Architecture #15 | Record the accountable human's decision on the one-Project/two-view proposal, including owner, visibility, membership, and field semantics. If approved in principle, track actual configuration separately with explicit authorization; if rejected, record the alternative. | Human decision gate. Do not create or configure a Project, change field visibility, or add/move Issue items in this task. | Issue decision record only; XS. |
| 11 | Architecture #13 | Identify a real product repository, accountable steward, users/operators, approved evidence path, outcome signals, and observation windows. Keep product metrics and baselines unknown until evidence exists. | Requires human/product-owner input. Do not create a product repository or infer one from the six factory repositories. | Issue decision record only; XS. |
| 12 | Primitives #2 | Complete the existing owner-specific capability/catalog work in Agentic Primitives, including only strategy-alignment, evaluation, independent-review, or improvement-analysis primitives justified by the accepted Architecture and Control Plane contracts. Preserve source identity and release provenance. | Follow the Issue's pinned sources and `AGENTS.md`; writer work waits for the canonical Architecture decisions to be reviewed/merged. Run `pnpm primitive:check`, `pnpm migration:check`, and `pnpm test` as applicable. | Primitive catalog/ADR and tests; M. |
| 13 | Distribution #2 | Complete the existing pinned distribution work and provide a tested rollback path that restores the exact prior managed files and provenance, including explicit conflict behavior. | Follow the Issue's source pins and reviewed Architecture/Control Plane/Primitive contracts; run `pnpm distribution:check` and `pnpm test`; verify plan/apply/rollback against disposable consumer fixtures. | Source lock/bundle/bootstrap/rollback and tests; M. |
| 14 | `.github` #10 | Complete public GitHub governance and consumer-template work, including full-SHA and content-digest pins and planning-role language consistent with the Architecture decision. | Follow the Issue's acceptance conditions and repository checks; preserve the active dirty Issue #52 worktree and coordinate separately before any same-repository write. | Governance templates/docs and starter; M. |
| 15 | `.github-private` #2 | Complete private organization publication as a reviewed, generated projection from its canonical source; record the actual inactive/empty publication state and entitlement limits. | Follow the Issue's pinned source and checks; do not author a second primitive source or infer live protection from desired ruleset JSON. | Projection/lock/workflow and tests; M. |
| 16 | Distribution #3 | Onboard a confirmed product/consumer repository using a pinned, conflict-aware, opt-in plan/apply flow with source hashes and tested rollback. Validate repository naming, accountable owner/access, Project association, contribution/security policy, independent CI and branch/PR expectations, bootstrap compatibility, and recovery. | Depends on Architecture #13 and the relevant owner-approved integration contracts; no consumer is selected while product ownership remains unknown. | Consumer integration and provenance lock; M. |
| 17 | Future Project configuration and runtime integration | After #15 and separate explicit authorization, verify Project ID, owner, membership, visibility, field availability, and App/runtime access; then implement a reversible adapter and link eligible Issues. Keep offline fixtures separate from live evidence. Cover an authorized Issue with no Project, Project-only cards, same-number Issues across repositories, multiple links, closed/transferred/inaccessible source Issues, conflicting Project and Issue fields, Project read-scope failure, duplicate/out-of-order events, and prove a Project failure cannot block an otherwise authorized security or recovery Issue. | Blocked until topology and configuration gates are satisfied. Organization-members-only Issue Fields are unavailable to public/internal Projects; verify the chosen model before view design. Add tests that Project failure is non-authoritative and replay is idempotent. | New scoped Control Plane adapter, permission contract, live tests; L. Split into its own Issue before implementation. |
| 18 | Architecture #11 acceptance checkpoint | Verify traceability from strategy through goals, principles/ADRs, contracts, owner Issues, PRs, evaluations, and improvement recommendations. Report architecture, offline fixture, hosted CI, live configuration, and production-operation evidence separately. Cross-repository fixtures must cover a factory improvement planned in a Project but executed from its Issue, a product feature with its source Issue, eval failure becoming a triaged Issue without execution, Project permission failure, untrusted Issue/Project input, and idempotent replay. | Depends on owner slices above. Operational completion also requires actual Project visibility/association, authorized runner behavior, evaluation replay and independent review, and product evidence where claimed. Project state must not replace canonical Issue authorization. | Evidence rollup; M. |

### Implementation and governance boundary

The assignment authorizes local, reversible Architecture changes and their
validation on the existing Architecture #11 branch; a separate approval of
this plan is not a prerequisite. Cross-repository changes remain assigned to
their owner Issues and repositories. Independent semantic review is still
required before merge. No Project, Issue Field, App, permission, product
repository, release, or participant was changed by this local implementation.
Broad `gh` OAuth scopes establish the authenticated account's API capability;
they do not grant Projects permission to the runtime GitHub App or substitute
for the separate human decisions recorded in Architecture #13 and #15.

### Completion checkpoints

- **Architecture foundation:** strategy, ADR, source-of-truth map, diagrams,
  quality scenarios, evidence contract, and all Architecture checks are
  review-ready on one immutable head.
- **Offline operating path:** Primitives evaluation replay and Control Plane
  planning/finding fixtures pass from exact pinned inputs, with independent
  review evidence and no self-authorizing feedback loop.
- **Live planning path:** only after the separate #15 decision and
  configuration authorization, the approved Project exposes the accepted
  views and fields and links eligible source Issues; Project-only items remain
  non-executable.
- **Product outcome path:** only after #13 identifies a real product owner and
  evidence source, the product stream has a measured baseline, observation
  window, and reversible consumer integration.
- **Operational acceptance:** do not claim the full software factory is
  operational while Project, access, runner, evaluation replay, independent
  review, or product-evidence gates remain open.

## Additional Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Broad OAuth scopes are mistaken for authorization to change organization state. | High | Keep all current discovery read-only; require a separate explicit decision for each Project, Issue Field, App, permission, or product-repository mutation. |
| Member-only Issue Fields cannot appear in the chosen Project visibility. | High | Confirm visibility and field availability after #15 and before view design; use only distinct Project-owned planning fields where justified. |
| Existing PRs are treated as accepted because checks pass. | High | Require independent semantic review and human merge/release decisions; report exact head and check evidence. |
| Evaluation routing lacks canonical owner evidence or creates recursive work. | High | Require pinned evidence, an unambiguous owner map, bounded recommendations, and a human-prioritized Issue before another run. |
| Product outcomes are inferred from factory activity. | High | Separate product measures from capability/factory measures and report unmeasured baselines until product ownership and observations exist. |

## Additional Open Questions

- What visibility and membership model should the accountable owner choose for
  a portfolio Project, given the six member-only Issue Fields?
- Which product repository and steward will own user outcome evidence?
- Which independent reviewer will accept the Architecture proposal and each
  meaningful cross-repository contract?
- Which evaluation cases, deterministic graders, and replay environment can be
  used without paid external infrastructure?
