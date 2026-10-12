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
choose the Factory Evolution view. Control Plane [#106](https://github.com/agentic-delivery-lab/agentic-delivery/issues/106)
owns pinned strategy context; Control Plane
[#107](https://github.com/agentic-delivery-lab/agentic-delivery/issues/107)
owns the deferred multi-Project planning-context selection policy. Both are
native Tasks under Architecture #11 with no Project association pending the
topology and configuration gates.

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
  boundary diagrams; review the canonical Structurizr/C4 model and update it
  where a required relationship is missing.
  - Acceptance: Each view distinguishes a target relationship from observed
    operation; context includes GitHub App, Vercel ingress, Neon replay,
    Actions/Codex, both adapters, and the unidentified product-repository
    boundary. Webhook, session, and evaluation replay remain separate.
  - Evidence: The existing `architecture/models/workspace.dsl` already
    contains the required Project, Issue, factory-owner, ingress, replay,
    Actions/Codex, and product-boundary elements. Review found no missing
    relationship that justified a C4 source change; the six supporting views
    carry the current evidence and target sequences.
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

At 18:17 UTC, Control Plane #107 was created after a read-only issue search
found no existing multi-Project selection task. GitHub readback confirmed the
native Task type, Architecture #11 parent, open state, and no Project item; the
parent now has child Issues #106 and #107. The 18:21:44 UTC readback plus
six-repository open-Issue refresh returned 22 total. Issue #107 owns the
deferred, fail-closed selector and offline fixtures; it blocks target selection
on Architecture #15 and contract adoption on PR #14/#101. No Project or
runtime permission was changed.

At 18:30:42 UTC, the read-only PR/check/Release refresh found five open PRs
and no Releases in the six visible repositories. Architecture #14 remained
BLOCKED at `6b0a4eef` with exact-head validation passed; Control Plane #102 and
#104 were CLEAN with checks passed and no review decisions; Control Plane #86
was DIRTY; and draft Primitives #4 remained BLOCKED and `REVIEW_REQUIRED`.
Distribution and both adapters had no open PRs. The open-Issue count remained
the last observed total of 22 from 18:21:44; no new Issue or Project query was
part of this refresh. Exact commits, checks, and limitations are in
[`strategy-foundation-gap-matrix.md`](../architecture/references/strategy-foundation-gap-matrix.md)
and observation `pull-request-release-inventory-20261009-1830`.

Between 18:38:15 and 18:44:44 UTC, a fresh read-only inventory confirmed zero
Projects in the organization, viewer, and six repository owners; all 22 open
Issues have zero Project items. Per-Issue field-value reads returned HTTP 200
with empty arrays for all 22 Issues. Organization REST reads returned nine
enabled Issue Types and six member-only Issue Fields with their stable
IDs/options; organization and repository Project capability flags are true.
The six `main` commits and open-Issue counts are unchanged. Five PRs remain
open, including Architecture #14 at `e835cb7`; all six Release queries were
empty. Exact IDs, options, commit pins, PR heads, and limits are recorded in
[`system-evidence.yml`](../architecture/references/system-evidence.yml#portfolio-issue-project-inventory-20261009-1839).
No Project or permission was changed.

At 18:45:29 UTC, the organization installation API returned three Apps. The
selected-repository Control Plane invoker declares no Project permission; the
human OAuth token could read the permission/event map but received 403 when
requesting its selected repository list. Its deployed credential binding and
repository membership remain unverified. See
`github-app-installation-inventory-20261009-1845`; no App state was changed.

At 18:49:12 UTC, the exact-head Architecture #14 check read passed on
`7b3d1ff51a293c1800435bc99885af32afdf2bce` against `4ae924966280706c28cb602ea0b3d338e8e4a875`.
The PR remains `BLOCKED` with no review decision. Its body was refreshed and
read back with the current inventory, digest, and check evidence. See
`architecture-pr14-check-refresh-20261009-1849`; no review, merge, release, or
Project/App configuration changed.

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

### 01:12 UTC read-only follow-up

The organization Projects v2 connection returned zero nodes with no next page.
Default gh project list queries for the organization and authenticated user
also returned no entries. This identity remains sjefsharp with admin:org,
project, repo, and workflow scopes. The 00:44 record remains the latest
complete six-repository, open-Issue field-value, App installation, and release
inventory; a narrower 01:12 refresh confirmed that all six default-branch
commits still match that record.

Architecture Issues #11, #13, and #15 are still open, unassigned, and have no
comments or labels. #13 and #15 remain human ownership/topology gates. Control
Plane PR #110 is now at ce109c85ba767337c4aee2c755af914d6996984b, clean and
open with no human review decision; exact-head validation, all required
quality/portability/recovery checks, Vercel, PR-body validation, and Harness
review run 38100354177 passed. PR #109 is also clean/open without a human
review decision. Architecture #16 is blocked pending review; draft #17 is
clean and stacked on #16; Primitives #4 remains draft, blocked, and
review-required. Control Plane #86 remains the open PR with a changelog
conflict. PR #104 is already merged at
9a2e1f3549428bc042d5c59d09beb300ca2d1362; its merge contains both the #101
and #103 entries. No GitHub Releases are listed across the six repositories.
Main agent-observation run 38100356790 passed, but it did not perform
issue-to-PR delivery. See
system-evidence.yml#strategy-current-status-recheck-20261011-0112.

### 08:29 UTC read-only status recheck

The complete Projects v2 inventory and all 23 open-Issue Project-item
associations were refreshed at 08:24 UTC: organization, authenticated user,
and six repository scopes still return zero Projects and zero Issue links.
The six repository default-branch commits, open pull requests, releases, and
human-review decisions were rechecked. Control Plane #110 is now at
`088a6b02391367f401b687e1873754e38c2a71fc`; its selector regressions are
fixed, local regression coverage passes, and exact-head validation, quality,
recovery-SQL, portability, Vercel, body validation, and Harness review pass.
Control Plane #109 remains open at `4e70c17b970f7500674dacc12a26f2c84cabafdc`
with hosted checks passing and no human review decision. Architecture #16
remains review-required; draft #17 is clean, stacked on #16, and has passing
validation. Primitives #4 remains draft and review-required. Control Plane
#104 is merged; its `CHANGELOG.md` blob is identical on PR head, merge commit,
and current `main`, includes the #103 entry, and has no conflict markers.
No release or live configuration change was observed. Issue Field Values,
Issue Types, App installation access, and production runtime were not re-read;
use the earlier dated evidence for those scopes.

### 09:01 UTC PR-status and conflict recheck

The complete Projects and per-Issue association inventory remains the 08:24
UTC observation; this refresh did not query Project configuration, Issue Field
Values, Issue Types, App installation access, releases, or production runtime.
Control Plane #109 is open and clean at
1180b1559a1e694b12fa95df1f548accb4697344; its validation, quality,
recovery-SQL, three-platform portability, body validation, Harness review, and
Vercel checks pass. The calibration-dataset-pin regression is included, but
human review remains pending; classify_updater was skipped by policy. #110
is open and clean at 088a6b02391367f401b687e1873754e38c2a71fc with hosted
checks passing and human review pending. The only current open merge conflict
is #86: it is 62 commits behind main and conflicts in CHANGELOG.md. PR #104
is merged; its changelog blob is identical on its head, merge commit, and
current main, with the #103 entry present and no conflict markers. No PR was
approved or merged and no live configuration changed during this refresh.

### 19:14 UTC live portfolio and open-work recheck

The complete organization/viewer/six-repository Projects v2 inventory at
19:09 UTC returned no Projects and no Project associations for any of the 23
open Issues. The same refresh window found empty Field Values on all 23
Issues, six organization-members-only Issue Fields, and nine native Issue
Types; five Issues remain untyped. Three organization App installations are
visible; the invoker has no Projects permission, and its selected-repository
endpoint still returns 403. Organization Actions and public rulesets were
queried, while the private ruleset endpoint remains unavailable on the Free
plan. No Release exists in the six repositories.

At 19:14 UTC, PR #104 remains merged and its CHANGELOG.md blob is identical on
the PR head, merge commit, and current main. The open conflict is PR #86,
which is 62 commits behind main and conflicts only in CHANGELOG.md. Control
Plane #109/#110 checks pass with human review pending; Architecture #16
requires review and draft #17 validation passes at 01528d3; Primitives #4
remains draft/review-required with validation passed. Runtime production
metadata was not refreshed; the last recorded production observation predates
current main. No PR, Issue, Project, permission, release, or runtime setting
was changed. See
system-evidence.yml#strategy-live-inventory-recheck-20261011-1914.

### 19:33 UTC targeted portfolio and pull-request recheck

The read-only refresh reconfirmed zero Projects in the organization,
authenticated-user, and six-repository scopes. The 23 open Issues have
zero Project-item associations and empty Field Value arrays; nine native
Issue Types remain enabled, with 18 Issues typed Task and five untyped.
The six main commits and exact Issues are recorded in
`system-evidence.yml#strategy-live-inventory-recheck-20261011-1933`.
Architecture PR #14 is merged at `61d99cb`; #16 remains blocked pending
human review at `9635044`; draft #17 is clean at `979a5bd`, stacked on
#16, with exact-head validation run 38167634212 passed and no submitted
reviews. Control Plane #104 was already merged; at this historical checkpoint,
the CHANGELOG.md conflict belonged to PR #86, not #104. The later
`system-evidence.yml#control-plane-changelog-state-recheck-20261011-2134`
supersedes that branch state: it confirms PR #104's conflict-resolution merge
and PR #86 clean against current main. Control
Plane #109/#110 remain clean with Codex COMMENTED reviews only; Primitives
#4 remains draft and review-required. Control Plane #106 remains open with
no Project item. Its PR #14 review/merge gate is only partly satisfied:
PR #14 is merged, but its GitHub reviewDecision remains REVIEW_REQUIRED and
the only submitted review is Codex COMMENTED on an older head. Independent
human review remains a blocker, and the Issue body was not changed. The broad
App, Actions, ruleset,
Release, and production observations remain the 19:14 event and were not
re-read. No Project or runtime setting was changed.

### 19:50 UTC PR #14 review-state follow-up

The current review connection for merged Architecture PR #14 returns
`REVIEW_REQUIRED` and only one submitted Codex `COMMENTED` review, against
older head `da5a33f`; independent human review is not established. This means
Control Plane #106's merge condition is met but its independent-review
condition remains open. The Issue body correctly retains that gate and was not
edited. Evidence: `system-evidence.yml#architecture-pr14-review-recheck-20261011-1950`.

Independent review of Architecture PR #17 at `5b0dfe0542d78e0993b71a4e9ca093108360cc61`
found this wording error and an optional precision improvement to the PR #109
offline evidence description. Both documentation corrections are included in
this follow-up. A second consistency pass aligned the strategy task sequence
with the actual offline router tests while retaining the limitation on
composed/live Project-runtime evidence. No runtime or GitHub configuration
changed.

### 20:07 UTC Projects and Issue metadata refresh

The complete read-only Projects v2 inventory again returned zero nodes for
the organization, authenticated user, and all six repositories. All 23 open
Issues had zero Project-item and Issue Field Value connections. The
organization remains on the Free plan with organization and repository
Projects enabled; it has nine native Issue Types and six organization-only
Issue Fields. Eighteen open Issues are typed Task; five are untyped. Exact
Issue counts, field/type IDs, and all six `main` commit identities are
recorded in `system-evidence.yml#strategy-live-inventory-recheck-20261011-2007`.
No Project or Issue metadata was changed. This recheck did not refresh App
installations, Actions policy, rulesets, releases, or production runtime; those
surfaces retain their separate timestamped observations.

Architecture PR #17 remains OPEN/DRAFT/MERGEABLE at
`19dcc691006d93e169f9eb4f76c9456f5c6b46fe`, based on open PR #16, and exact-
head validation run `38171652069` passes. Its draft Architecture release is
`0.1.0-draft.39`, pinned to `1101d24ac1d12461080f020783560e0cc3654325` with
digest `1e3d7fe2586c6fc13b1b9d9dcdc535a24aefc48fd6acb794d1f5197ff5f1a2f4`.
It is not merged or an approved Architecture release. Control Plane PR #104 is
already merged; the open Control Plane conflict remains on PR #86. No GitHub
write occurred during the 20:07 UTC read-only inventory.

### 20:25 UTC Architecture PR recheck

The current GitHub read confirms Architecture PR #16 remains
OPEN/MERGEABLE/REVIEW_REQUIRED at
`9635044ab2e7b91c8004ac1cd06241b35b9ec30e`. Draft PR #17 remains
OPEN/DRAFT/MERGEABLE on #16 at exact head
`19dcc691006d93e169f9eb4f76c9456f5c6b46fe`; its required `validate` check
passes on run `38171652069`, and GitHub has no review decision for #17. The
read is recorded in
`system-evidence.yml#architecture-pr17-validation-recheck-20261011-2025`.
Human review of #16 remains the prerequisite to retargeting #17 to `main`.
No issue, Project, permission, App, release, participant, or runtime setting
changed.

### 20:29 UTC Architecture PR recheck

The current GitHub read confirms Architecture PR #16 remains
OPEN/MERGEABLE/REVIEW_REQUIRED at
`9635044ab2e7b91c8004ac1cd06241b35b9ec30e`. Draft PR #17 remains
OPEN/DRAFT/MERGEABLE on #16 at exact head
`64dfc8ea4f2a3438c875f14e88aadc0860d953df`; its required `validate` check
passed on run [38172355305](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/actions/runs/38172355305),
and GitHub has no review decision for #17. The read is recorded at
`2026-10-11T20:29:26Z`. Human review of #16 remains the prerequisite to
retargeting #17 to `main`. No Issue, Project, permission, App, release,
participant, or runtime setting changed.

### 21:34 UTC conflict and open-work verification

A fresh read-only GitHub check confirms that the reported PR #104 conflict is
already resolved and merged. Evidence is recorded at
architecture/references/system-evidence.yml#control-plane-changelog-state-recheck-20261011-2134.

- Control Plane PR #104 is MERGED at 9a2e1f3549428bc042d5c59d09beb300ca2d1362.
  Its second parent is the PR head f9a536fee6f6fc436189a55acf3b8180d4144211,
  which merged current main into the feature branch to resolve CHANGELOG.md.
  `main` still points at the merge commit, contains both #101 and #103
  changelog entries, and has no conflict markers. No further #104 edit is needed.
- The separate Control Plane PR #86 is OPEN/CLEAN at
  3a0adfb7942c760f4504478c2f47cc6a0624f966; its exact-head hosted checks pass
  and no human review has been submitted. It proposes Codex CLI 0.160.0, while
  official upstream latest remains 0.162.1. The release asset and runner
  compatibility for 0.162.1 are not verified; do not approve or retarget #86
  solely from the changelog conflict resolution.
- Control Plane #109/#110 remain open and clean with their required checks
  passing and no human review. Architecture #16 remains blocked on independent
  human review; draft #17 is clean on #16 and hosted validation passes. Primitives
  #4 remains draft/review-required although its validation passes. No review,
  approval, merge, release, Project, permission, or runtime mutation occurred.

### 06:01 UTC PR #104 and adapter-protection recheck

GitHub still reports Control Plane PR #104 as MERGED at
`9a2e1f3549428bc042d5c59d09beb300ca2d1362`. Its changed-file record includes
`CHANGELOG.md` with two additions; current `main` has no conflict-marker lines.
All executed PR checks report success; `classify_updater` is skipped by policy.
The `Conflicts: CHANGELOG.md` text is historical merge-commit metadata from the
conflict-resolution merge on the PR head, not an outstanding GitHub conflict.
See
`system-evidence.yml#control-plane-changelog-state-recheck-20261012-0601`.

The active public `.github` ruleset 23698176 requires only the pull-request
body status check, and the default-branch protection API reports the branch is
not protected. The private adapter's ruleset API remains inaccessible (403),
so effective private protection is unknown. See
`system-evidence.yml#adapter-protection-recheck-20261012-0601`. These were
read-only checks; no PR, review, approval, or governance setting changed.

### 06:04 UTC Distribution source review

Static review at Distribution `main` commit
`b69c5710928b47efc4d3ab12ec4d5b596c80720c` found that bootstrap and
projection-promotion path checks do not inspect parent components for symbolic
links before file operations. The Dev Container Feature install script checks
the controller SHA shape and prints a prepared message; it does not install the
controller. This is a source-based risk inference, not a reproduced exploit or
live-consumer test. No Distribution file or consumer was changed. See
`system-evidence.yml#distribution-bootstrap-source-review-20261012-0604`.

### 06:10 UTC PR #17 exact-head verification

Pushed the issue-linked draft branch by fast-forward to
`1a4dba59d922bbef3fa2b927bc23e618ecaf3d9c` and refreshed PR #17's title and
description with draft release .44 and the current evidence. GitHub reports
the PR OPEN, DRAFT, CLEAN, and stacked on #16; exact-head Architecture
validation run 38211127172 passed. No human review decision exists. Keep the
draft open pending review of #16 and #17; no merge or release occurred. See
`system-evidence.yml#architecture-pr17-verified-head-20261012-0610`.

### 06:22 UTC PR #104 and exact-head recheck

The user-reported CHANGELOG conflict was checked again against GitHub and the
fetched `main` history. PR #104 remains merged; its merge commit is an ancestor
of current `main`, the PR file listing records two additions to
`CHANGELOG.md`, and current `main` contains both the #101 and #103 entries
without conflict-marker lines. GitHub returned Not Found for PR #104 on the
other five inventoried repository paths. No change to the closed PR or Control Plane
files was made. See
`system-evidence.yml#control-plane-changelog-state-recheck-20261012-0622`.

At this observation, Architecture PR #17 remained OPEN/DRAFT/MERGEABLE at
`9987691b17eaf9a6ced96366f980734d5761b5f8`, stacked on PR #16, with exact-head
validation run 38211441830 passing and no human review decision. This was the
head before the current runtime/deployment documentation refresh; the pushed
documentation revision requires its own hosted validation. See
`system-evidence.yml#architecture-pr17-exact-head-recheck-20261012-0622`.

### 07:03 UTC Project and open-PR recheck

At 07:00 UTC, a fresh GraphQL query found zero Projects in authenticated-viewer, organization, and all six repository scopes. It found 23 open Issues across the six repositories; none had a Project item. The query returned no next page for any relevant connection. The previous complete 61-Issue association query remains separately dated at 04:59 UTC.

At 07:03 UTC, the six-repository inventory found seven open PRs. Control Plane #86, #109, and #110 are CLEAN with passing named checks and no human review decision. Architecture #16 remains blocked pending human review; all six automated review threads are resolved and exact-head validation passes. Draft #17 is clean and passing exact-head validation at d5f18fc4c8d1ee987ad82dcfc195ad3e726ecd0b, stacked on #16. Primitives #5 is passing exact-head validation with all four Codex threads resolved, but remains blocked pending human review; #4 remains draft and review-required. No open PR exists in the other three repositories.

PR #104 is MERGED at 9a2e1f3549428bc042d5c59d09beb300ca2d1362. Its feature-branch merge commit f9a536fee6f6fc436189a55acf3b8180d4144211 records '# Conflicts: CHANGELOG.md' as historical merge metadata. The resolved PR and current-main changelog contain the #103 and #101 entries and no conflict markers. All three Codex review threads are resolved, and source/tests cover their findings. No PR comment, approval, review, merge, Project, or runtime mutation was made in this recheck. Evidence: architecture/references/system-evidence.yml#portfolio-project-issue-association-recheck-20261012-0700, #portfolio-open-pr-recheck-20261012-0703, and #control-plane-changelog-state-recheck-20261012-0703.

### 09:17–09:23 UTC Project, PR, and changelog recheck

The complete 09:17–09:22 UTC read-only inventory returned zero Projects for the authenticated viewer, organization, and all six repository scopes, with no additional pages. All 62 Issues had zero Project items; all 24 open Issues had zero organization Issue Field Values. Control Plane #111 is a Bug under recovery Issue #105, and five open Issues remain untyped. The read confirmed six organization Issue Fields, nine native Issue Types, and the Free organization plan. There is no organization Issue Field named Delivery State; the actual field is Delivery Readiness. Project fields, views, membership, and visibility remain unknown because no Project exists in the queried scopes. Evidence: `architecture/references/system-evidence.yml#portfolio-project-issue-association-recheck-20261012-0922`.

At 09:23 UTC, eight PRs were open across the six repositories. Control Plane #112 is draft and CLEAN with required named checks passing; #86/#109/#110 are CLEAN with named checks passing, though `classify_updater` is skipped by policy for #109/#110/#112. No human review decision exists for these Control Plane PRs. Architecture #16 is BLOCKED/REVIEW_REQUIRED; draft #17 is CLEAN and exact-head validation passes, but it remains stacked on #16 and has no human review decision. Primitives #4 is draft and #5 is open; both are BLOCKED/REVIEW_REQUIRED with validation passing. Distribution, public `.github`, and private `.github-private` have no open PRs. Passing automation does not establish human approval. Evidence: `architecture/references/system-evidence.yml#portfolio-open-pr-recheck-20261012-0923`.

PR #104 remains merged at `9a2e1f3549428bc042d5c59d09beb300ca2d1362`, the current Control Plane `main` head. Its PR-head merge commit records a historical `CHANGELOG.md` conflict, but both final lowercase `CHANGELOG.md` files contain #103 and #101 with no conflict markers; all three Codex review threads are resolved. The uppercase `CHANGELOG.MD` path does not exist. No new change is needed on the closed PR. Evidence: `architecture/references/system-evidence.yml#control-plane-pr104-changelog-conflict-resolution-recheck-20261012-0923`.

After the user reiterated the conflict report, a 09:34 UTC live API recheck confirmed PR #104 is still MERGED and current remote `main` is the merge commit. The `main` Contents API returns lowercase `CHANGELOG.md` with both Issue #103 and #101 entries and no conflict markers; uppercase `CHANGELOG.MD` returns 404. The historical conflict note is in a commit message only, and a merged PR cannot receive a conflict-resolution commit. Evidence: `architecture/references/system-evidence.yml#control-plane-pr104-changelog-conflict-resolution-recheck-20261012-0934`.

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
because both explicitly exclude runtime integration; Control Plane #106 now
tracks that slice. Control Plane #107 separately tracks multi-Project planning
context selection. Both are native child Tasks under Architecture #11 and have
no Project association because no eligible Project is inventoried.

| Order | Owner Issue / related PR status (evidence dates stated per row) | Work and acceptance boundary | Dependency / verification | Likely files / scope |
| --- | --- | --- | --- | --- |
| 1 | Architecture #11 / PR #14 (merged; source-of-truth follow-up on this issue-linked branch) | Add stable many-to-many trace links from each strategy goal to quality goals, principles, ADRs, capabilities/contracts, implementation Issues, Project planning context, and evaluation evidence. Complete `sourceOfTruth` for every assignment fact: Issue Type, lifecycle/delivery/governance metadata, source lineage, Issue priority, Project priority, iteration, roadmap, membership/sequencing/dependencies, Actions/Codex/session/webhook state, PR state, decisions, strategy, and evaluation results. Assess ADR-0012/0018/0019 against ADR-0023 and AP-004; retain their Issue lifecycle, authorization, and projection restrictions while keeping Project topology and field semantics provisional until #15. Validate one owner per fact, resolved references, and no inferred links. | Depends on the current strategy proposal. Run Architecture, migration, and full tests; retain negative fixtures for unresolved, duplicated, and multiply-owned references. | `organizational-strategy.yml`, strategy schema/validator, relevant ADRs, tests; M. |
| 2 | Architecture #11 / PR #14 (merged; diagram follow-up on this issue-linked branch) | Complete all six required architecture views: strategic alignment through evaluation evidence; organization context including Projects, Issues, all factory owners, GitHub App, Vercel, Neon, Actions/Codex, and products; Project/Issue lifecycle; factory improvement sequence; correctly ordered product bootstrap/delivery; and trust boundaries. Update the Structurizr/C4 model where relevant. Keep webhook replay, session continuation, and evaluation replay distinct. | Depends on Task 1 trace terms and current arc42 boundaries. Run diagram validation and review all six views against the assignment and arc42. | Mermaid sources and `workspace.dsl`; M. |
| 3 | Architecture #11 / PR #14 (merged) | Extend the portable evaluation contract and reusable validation/tests with case task/stimulus/expected outcome, deterministic evaluator identity and independence, failure classification, improvement hypothesis, and comparable unit/window checks. Cover multiple fixtures, not only the current example. | Depends on the shared report model. Run architecture, migration, and full tests; prove invalid/improvement-without-baseline and incomparable metric cases fail. | evaluation schema, README, fixture, validator, tests; M. |
| 3a | Architecture #11 / PR #14 (merged) | Complete the source-backed research register across strategy, architecture, GitHub work management, Codex CLI in Actions, evaluation, and Markdown conventions. For each source record exact URL or repository commit/path, date/version, supported claim, limits, and architectural implication; distinguish verified facts from hypotheses. Refreshed Codex research on 2026-10-11: Context7 still has no 0.159.3 docs version (latest listed 0.155.1); the `rust-v0.159.3` tag resolves to exact commit `01fc69f4026735edfdf6789820549727a4867b11`, which GitHub reports unsigned/unverified. Its loader source and root-to-cwd test were inspected, along with app-server thread protocol fields. | Depends on the existing register and the source-driven research already recorded in the strategy proposal. Check each claim against its primary source and retain scope/version caveats. | `strategy-research-register.md`, strategy references; M. |
| 4 | Architecture #12 / PR #16 (open; human review required) | Preserve the complete dated inventory and the separation between Project planning and Issue-owned execution. | The latest 09:17–09:22 UTC read found no Project in authenticated-viewer, organization, or any of the six repository scopes; all 62 Issues have zero Project items and all 24 open Issues have zero organization Issue Field Values. PR #16 remains OPEN/BLOCKED/REVIEW_REQUIRED at c11164c1cb387ca3b36706c6da3a1a1d6bdd5a5f, with exact-head validation passing. | system-evidence.yml, gap matrix, generated release; M. |
| 4a | Architecture #11 / PR #17 (draft; stacked on #16) | Refresh the dated Project and Issue evidence, current open-PR state, production and runtime evidence, and the strategy/gap analysis without converting planning context into execution authority. The 09:17–09:22 UTC query found zero Projects in organization/viewer/six-repository scopes and zero Project items across 62 Issues; all 24 open Issues had no organization Issue Field Values. This issue-linked update advances the draft Architecture release to 0.1.0-draft.50; the generated manifest pins its authored source commit and normalized digest across authoritative Architecture roots. | The 09:23 UTC snapshot recorded PR #17 OPEN/DRAFT/CLEAN at 5c0a62c782bfbe3ee1c7f90cdf0cd231c19ecaa1, stacked on open PR #16 at c11164c1cb387ca3b36706c6da3a1a1d6bdd5a5f; exact-head validation run 38224909964 passed, with no human review decision. Keep #17 stacked until #16 receives human review, then repin if its base merge changes its source. Architecture #15 remains the topology gate and #13 the product-owner gate. No live Project, runtime, or repository configuration changed. | system-evidence.yml, gap matrix, task plan, generated release; architecture, migration, full test suite, and exact-head hosted validation; M. |
| 5 | Primitives #3 / PR #4 (draft; blocked pending human review) | Supply versioned offline evaluation cases, deterministic graders, reproducible replay, immutable source pins, and reviewer-ready evidence for agent capability and factory behavior. Reconcile the manifest digest with the PR's reported digest; make replay output retainable as an artifact. Keep the manual semantic rubric distinct and product outcomes unclaimed. | Depends on the revised Architecture report contract. Run `pnpm primitive:check`, `pnpm migration:check`, and `pnpm test`; verify replay digests and second-run match. Do not describe synthetic cases as a measured baseline. | Primitives dataset/grader/replay files, manifest, CI/tests; M. |
| 6 | Control Plane [#101](https://github.com/agentic-delivery-lab/agentic-delivery/issues/101) / [PR #102 (merged)](https://github.com/agentic-delivery-lab/agentic-delivery/pull/102) | Keep Project context as planning input in the single-item offline normalizer. Existing fixtures cover Project-only cards, foreign repository identities, same-number cross-repository Issues, access failures, inaccessible or mismatched Projects, unsupported/stale fields, and dependency-only cards. The positive fixture re-fetches the origin repository and Issue and checks the actor gate, but not lifecycle, readiness, plan, or downstream authorization. Multi-candidate selection is excluded from #101/PR #102 and tracked separately in Control Plane #107. | Depends on AP-004 and ADR-0023. Run focused planning-contract tests and the Control Plane quality, migration, portability, and hosted checks. Prove normalization cannot turn Project membership into authorization. No live Project integration is implied. | Planning-context module, schema, tests; M. |
| 6a | Control Plane [#107](https://github.com/agentic-delivery-lab/agentic-delivery/issues/107) / [PR #110 (open; no human review decision)](https://github.com/agentic-delivery-lab/agentic-delivery/pull/110) | Define deterministic selection when a source Issue has multiple candidate Project links. Use stable Project/item/repository/Issue identities and an approved topology policy; never select by API order or silently merge candidates. Treat ambiguity, missing policy, or inaccessible/unapproved Projects as explicit planning-context gaps, while preserving Issue-owned authorization and recovery behavior. Add offline fixtures for unique, multiple, ambiguous, inaccessible, conflicting-field, cross-repository same-number, duplicate, and out-of-order cases. | Depends on Architecture #15's human topology decision, merged Architecture PR #14, and Control Plane #101 planning contract (PR #102 is merged; Issue #101 remains open). Implementation is delivered at exact head `088a6b02391367f401b687e1873754e38c2a71fc`; regression tests and all required exact-head hosted checks pass (classify_updater was skipped by policy), but human review is pending. Any live read or runtime connection requires separate Project identity, permission, and configuration approval. | Project-context selector, policy contract, tests; M. |
| 7 | Control Plane [#106](https://github.com/agentic-delivery-lab/agentic-delivery/issues/106), child of Architecture #11 | Add a compact trusted strategy context to eligible Codex runs, pinned to an approved Architecture release and digest, selecting only relevant goals, principles, ADRs, contexts, and quality/evaluation criteria. Bind it to the exact authorized source Issue and repository identity, applicable role/capabilities, enforcement policy, and required validation; Project facts remain optional read-only context. Keep Issue and Project text untrusted and unable to alter deterministic authorization. | Block implementation on an approved Architecture release pin, Control Plane #60/#66 metadata contracts, and #101's planning boundary. Static review at current main commit `9a2e1f3549428bc042d5c59d09beb300ca2d1362` confirms the app-server starts at `controllerRoot`; each new/resumed thread receives the isolated Issue workspace and `.agents/codex-delivery.md` as developer instructions; apps and plugins are disabled. The exact `0.159.3` source tag supports root-to-cwd instruction discovery, but GitHub reports it unsigned/unverified. Current `codex-client.test.mjs` exercises start/resume without asserting `cwd` or developer-instruction values. Add those assertions and test the real Actions runner workspace, supported distributed customizations, missing/incompatible pins, injection attempts, and no moving-branch fallback. No Project permission is inferred for the App. | Strategy-context selector/envelope, runtime instructions, tests; M. |
| 8 | Control Plane #103 / PR #104 (merged) | Keep the offline evaluation router fail-closed: preserve evidence and hold report-asserted owner Issues as non-actionable dispositions until canonical ownership is established. | PR #104 merged at 9a2e1f3549428bc042d5c59d09beb300ca2d1362. Its source merge commit records historical conflict metadata for CHANGELOG.md, while the resolved file in the PR tree and current main contains both #101 and #103 entries with no conflict markers. All three Codex threads are resolved; the case-insensitive self-target, owner-verification hold, and directional comparator findings are covered by merged code and tests. Evidence: system-evidence.yml#control-plane-changelog-state-recheck-20261012-0703. | Evaluation router, owner-map contract, retained evidence/tests; M. |
| 8a | Control Plane #105 | Enforce pinned per-run duration, turn/invocation, retry, and recursion limits; record admission and terminal usage/stop receipts; distinguish webhook delivery replay, Codex continuation, and evaluation replay; preserve safe recovered-or-held dispositions and zero duplicate protected writes. | Depends on the approved Architecture release pin and the required Control Plane metadata contracts. Associate with the approved Factory Evolution Project only after Architecture #15 and Project provisioning; currently #105 has no Project item. Keep all participants in existing modes until separate review/authorization. | Control Plane admission/receipt/recovery path and fixtures; M. |
| 9 | Control Plane #60 (active local branch; preserved changes) | Complete the canonical Issue Field and lifecycle contract using stable field identities, supported values, and the legacy Delivery Readiness compatibility rule. Keep native Issue Type separate from lifecycle, delivery readiness, runner, and PR states. | Coordinate with the existing active #60 worktree and inspect its dirty files before resuming; #62 is its canary. Run migration, field-contract, issue-intake, and scoped live evidence only as already authorized there. | `config/issue-metadata.yml`, issue-field API/tests, audit docs; M. |
| 10 | Architecture #15 | Record the accountable human's decision on the one-Project/two-view proposal, including owner, visibility, membership, and field semantics. If approved in principle, track actual configuration separately with explicit authorization; if rejected, record the alternative. | Human decision gate. Do not create or configure a Project, change field visibility, or add/move Issue items in this task. | Issue decision record only; XS. |
| 11 | Architecture #13 | Identify a real product repository, accountable steward, users/operators, approved evidence path, outcome signals, and observation windows. Keep product metrics and baselines unknown until evidence exists. | Requires human/product-owner input. Do not create a product repository or infer one from the six factory repositories. | Issue decision record only; XS. |
| 12 | Primitives #2 / PR #5 (open; human review required) | Complete owner-specific capability/catalog work only against reviewed Architecture and Control Plane contracts, preserving immutable source identity and release provenance. | PR #5 is OPEN/BLOCKED/REVIEW_REQUIRED at 035547fc1c7885e96cf9a8f8295c94a26f269847; exact-head run 38214454926 passes and all four Codex threads are resolved, but independent human review remains pending. PR #4 remains OPEN/DRAFT/BLOCKED/REVIEW_REQUIRED. Writer work remains gated on the canonical Architecture decisions. | Primitive catalog/ADR and tests; M. |
| 13 | Distribution #2 | Complete the existing pinned distribution work and provide a tested rollback path that restores the exact prior managed files and provenance, including explicit conflict behavior. | Follow the Issue's source pins and reviewed Architecture/Control Plane/Primitive contracts; run `pnpm distribution:check` and `pnpm test`; verify plan/apply/rollback against disposable consumer fixtures. | Source lock/bundle/bootstrap/rollback and tests; M. |
| 14 | `.github` #10 | Complete public GitHub governance and consumer-template work, including full-SHA and content-digest pins and planning-role language consistent with the Architecture decision. | Follow the Issue's acceptance conditions and repository checks; preserve the active dirty Issue #52 worktree and coordinate separately before any same-repository write. | Governance templates/docs and starter; M. |
| 15 | `.github-private` #2 | Complete private organization publication as a reviewed, generated projection from its canonical source; record the actual inactive/empty publication state and entitlement limits. | Follow the Issue's pinned source and checks; do not author a second primitive source or infer live protection from desired ruleset JSON. | Projection/lock/workflow and tests; M. |
| 16 | Distribution #3 | Onboard a confirmed product/consumer repository using a pinned, conflict-aware, opt-in plan/apply flow with source hashes and tested rollback. Validate repository naming, accountable owner/access, Project association, contribution/security policy, independent CI and branch/PR expectations, bootstrap compatibility, and recovery. | Depends on Architecture #13 and the relevant owner-approved integration contracts; no consumer is selected while product ownership remains unknown. | Consumer integration and provenance lock; M. |
| 17 | Future Project configuration and runtime integration | After #15 and separate explicit authorization, verify Project ID, owner, membership, visibility, field availability, and App/runtime access; then implement a reversible adapter and link eligible Issues. Keep offline fixtures separate from live evidence. Cover an authorized Issue with no Project, Project-only cards, same-number Issues across repositories, multiple links, closed/transferred/inaccessible source Issues, conflicting Project and Issue fields, Project read-scope failure, duplicate/out-of-order events, and prove a Project failure cannot block an otherwise authorized security or recovery Issue. | Blocked until topology and configuration gates are satisfied. Organization-members-only Issue Fields are unavailable to public/internal Projects; verify the chosen model before view design. Add tests that Project failure is non-authoritative and replay is idempotent. | New scoped Control Plane adapter, permission contract, live tests; L. Split into its own Issue before implementation. |
| 18 | Architecture #11 acceptance checkpoint (Control Plane #108 / PR #109 open; human review pending) | Verify traceability from strategy through goals, principles/ADRs, contracts, owner Issues, PRs, evaluations, and improvement recommendations. Report architecture, offline fixture, hosted CI, live configuration, and production-operation evidence separately. Cross-repository fixtures must cover a factory improvement planned in a Project but executed from its Issue, a product feature with its source Issue, eval failure becoming a triaged Issue without execution, Project permission failure, untrusted Issue/Project input, and idempotent replay. | Depends on owner slices above. At head `1180b1559a1e694b12fa95df1f548accb4697344`, PR #109's validation, quality, recovery-SQL, three-platform portability, body-validation, Vercel, and latest Harness review passed; `classify_updater` was skipped by policy and human review remains absent. Its derived evidence now includes optional grader-calibration dataset pins while preserving the full report. Operational completion also requires actual Project visibility/association, authorized runner behavior, evaluation replay and independent review, and product evidence where claimed. Project state must not replace canonical Issue authorization. | Evidence rollup; M. |

### Implementation and governance boundary

The assignment authorizes local, reversible Architecture changes and their
validation on an issue-linked feature branch for Architecture #11; a separate
approval of this plan is not a prerequisite. Cross-repository changes remain
assigned to their owner Issues and repositories. Independent semantic review is still
required before merge. No Project, Issue Field, App, permission, product
repository, published GitHub Release, or participant was changed by this local
implementation. The Architecture draft release manifest was updated and
remains draft; no runtime consumer adopts it.
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
