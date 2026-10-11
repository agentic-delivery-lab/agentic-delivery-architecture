# 6. Runtime View

<!-- arc42:section 06 -->

## 6.1 Desired short gated loop

1. A person creates or updates a source Issue in its origin repository and
   links it to the portfolio Project for prioritization and progress visibility.
   A Project-only card is planning input and cannot invoke execution.
2. The invocation boundary and participant contract decide whether processing
   may begin.
3. Semantic classification proposes a route, metadata, and orchestration
   pattern.
4. Deterministic checks validate issue identity, actor permission, type,
   fields/options, dependencies, policy, and transition.
5. One authorized writer performs work on an issue-linked branch within the
   pinned time, invocation, retry, and recursion budget recorded at admission.
6. Tests, a versioned evaluation, and an independent Validator report evidence;
   the writer publishes a review pull request.
7. A human reviewer decides whether to merge. The source Issue remains open
   until its normal disposition.

Any failed gate blocks mutation. The semantic proposal is not authorization.

## 6.2 Desired long-running fan-out/fan-in

The coordinator defines bounded read-only research questions and launches
independent researchers. The researchers return cited findings without
modifying the implementation branch. The coordinator reconciles sources and
records unresolved conflicts, then assigns one implementer as the sole writer.
A separate Validator, who did not author the change, checks source use,
bounded-context language, release pins, tests, and rollback evidence. Human
review remains the merge boundary.

## 6.3 Desired continuous feedback

A validated issue changes or clarifies an ADR or contract. The Architecture
release identifies the applicable ADRs and exact commit/digest. Primitive
metadata records impacted capability identifiers and versions. A reviewed
Primitive release feeds a versioned Distribution bundle. A consumer upgrades
by immutable pins in shadow mode, records validation and provenance, then
activates only after its own review gate. Rollback restores its prior commit
and contract pins. Product delivery additionally records whether the Issue's
user or operator outcome was observed; factory delivery records capability,
authorization, and operating evidence. Actionable findings return as Issues
for human prioritization in Projects before any subsequent execution.

## 6.4 Target: evaluation and recursive improvement

This is a target contract. Architecture PR #14 merged the versioned evidence
report schema and synthetic fixture into `main` at `61d99cb`. Agentic
Primitives #3 owns reusable datasets, deterministic graders, and replay;
Control Plane #103 owns offline finding routing. The schema is in a draft
Architecture release. No live evaluation loop, measured baseline, or
improvement claim is evidenced here.

The target offline evaluation uses a versioned representative dataset, named
task cases with stimulus and expected outcomes, a case-selection policy and
dataset-integrity assessment recorded before the run, and a declared
development, calibration, validation, or holdout partition. Reports pin
deterministic and semantic grader definitions and evaluator versions,
calibration datasets and results for those exact versions, candidate source,
and baseline. Failures receive an explicit class. A comparative claim uses
validation or holdout cases whose pre-run integrity assessment found no known
contamination, exact case coverage, independent calibrated graders, and an
independent review; evaluator drift, suspected contamination, unknown
independence, or unexplained exclusions make the result inconclusive. The
claim also needs a testable hypothesis and baseline/candidate measurements
with the same metric, unit, and observation window. Deterministic
checks produce repeatable pass/fail results; semantic judgments record reviewer
identity, independence, rationale, and uncertainty separately. Evaluation replay
repeats that case set and graders against a named candidate. It is
distinct from webhook-delivery replay, which retries event handling, and
Codex-session continuation, which restores one bounded runner operation.

Under this target, an evaluation miss, operational anomaly, unmet product outcome, or agent
improvement suggestion is recorded as a new or updated Issue in its owning
repository and prioritized in the portfolio Project. It cannot edit its own
policy, activate its own participant, approve or merge its change, or trigger
an unbounded follow-up run.

## 6.5 Current runtime evidence and gaps

| Observation | Evidence | Limit |
| --- | --- | --- |
| At 19:33 UTC, the complete read-only inventory found no organization, user, or repository Projects and zero Project items across all 23 open Issues. All 23 Issue Field Value arrays were empty; the six organization fields are member-only. | `strategy-live-inventory-recheck-20261011-1933`. | No Project-specific fields, visibility, or membership could be inspected. The one-Project/two-view proposal awaits the human topology decision in Architecture #15; Project visibility outside the six repository owners remains unknown. |
| At 11:52 UTC, the documented `/issue-field-values` endpoint returned an empty array for each of the 19 then-open Issues. | `issue-field-values-20261009-1152`. | This is a historical point-in-time values read, not evidence about Issue Type pinning or future Project visibility; the earlier `/fields` request was inconclusive. |
| Evaluation report contract 2.0.0 is merged in Architecture PR #14 and remains in the draft Architecture release; its contract includes a pre-registered selection pin, exact case coverage, dataset partition, grader/evaluator versions, calibration evidence, independence, failure classes, and comparable measurements. | Architecture PR #14 at `61d99cb`; Primitives #3; Control Plane #103; QR-015, QR-016, and QR-019. | The schema is not an evaluator. No representative validation/holdout dataset, calibration run, measured baseline, independent outcome review, live report, or automatic follow-up exists. Merge status alone does not establish independent human acceptance. |
| Per-run budget enforcement and operational recovery evidence remain target scenarios. The architecture records hard limits for duration, turns/invocations, retries, and recursion, with available quota/spend and recovery receipts. | QR-017, QR-018; ADR-0009 and ADR-0015. | Existing actor and bot-hop gates do not prove complete per-run budget receipts, zero calls after limit exhaustion, or end-to-end safe recovery. Unknown quota/spend remains unknown. |
| Exact Control Plane main source pins Codex CLI 0.159.3 and separates controller instructions from the task workspace; an isolated 0.159.3 fixture confirmed root/CWD AGENTS discovery. | `control-plane-codex-instruction-context-20261009-1622` in system evidence. | Source inspection and local fixture are not an Actions-run observation and do not prove customization propagation, prompt-injection resistance, or successful live delivery. |
| Control Plane #106 is an open native Task under Architecture #11 for pinned strategy context in authorized Codex runs. | `control-plane-strategy-context-issue-created-20261009-1749`; Architecture PR #14 is merged at `61d99cb`; `architecture-pr14-review-recheck-20261011-1950` records its review decision and submitted review; the 19:33 inventory found no Project association. | The merge prerequisite is satisfied, but independent human review remains unverified: GitHub reports `REVIEW_REQUIRED` and only a Codex `COMMENTED` review on older head `da5a33f`. Issue #106's body retains this independent-review/merge gate appropriately and was not edited. An approved Architecture release, the #60/#66 metadata contracts, and the #101 planning boundary remain prerequisites. PR #17 is still draft. No runtime injection or Project association is implemented. |
| Control Plane PR #102's offline Project fixture binds source Issue #44 and Project item Issue #44, then rejects the same number from a foreign repository. | `control-plane-project-planning-test-audit-20261009-1801`. | This proves repository identity in that fixture only. The normalizer accepts one item and does not select among multiple candidate links; no live Project integration is evidenced. |
| The latest issue run completed authorization, classification, and finalization while delivery was skipped. | current-delivery-and-release-state observation. | A skipped delivery does not prove a completed issue-to-PR flow or independent field-value read-back. |
| Participant registry lists all six repositories in shadow mode with exact controller and Architecture/Primitive pins. | `participant-modes-and-release-pins` in system evidence. | Shadow configuration does not prove delivery, API identity, or write-back. |
| Issue-intake runs for recovery issues #59 and #60 failed before dependencies could install because the classify checkout path did not match its working directory. | [Run 36050051251](https://github.com/agentic-delivery-lab/agentic-delivery/actions/runs/36050051251), [run 36049717167](https://github.com/agentic-delivery-lab/agentic-delivery/actions/runs/36049717167), workflow at pinned Control Plane commit. | This identifies a workflow defect; it does not establish that field gate code is absent. |
| At 19:33 UTC, Recovery Issues #59 and #60 returned empty arrays from the documented Issue Field Value endpoint. | `strategy-live-inventory-recheck-20261011-1933`; historical path correction in `issue-field-values-20261009-1152`. | Empty values do not explain why they are absent or establish the result of intake; no causal link is inferred. |
| The 19:14 UTC installation inventory reports the Control Plane invoker selects repositories, subscribes to issue and pull-request events, and declares Contents/Issues/PR writes plus Issue Field/Type reads, with no Projects permission. | `strategy-live-inventory-recheck-20261011-1914`; `config/github-app-contract.json` at the pinned Control Plane commit. | The human OAuth selected-repository request returned 403, so exact repository membership and deployed credential binding remain unknown. No App setting or runtime credential was changed. |
| Field definitions exist for Lifecycle Stage and Delivery Readiness; user-visible pinning remains unverified. | `organization-issue-fields` observation. | The definitions API does not report pinning; Projects are a separate surface outside this issue-field observation. |
| The 19:33 UTC read found six organization-members-only Issue Field definitions and empty values for all 23 open Issues. | `strategy-live-inventory-recheck-20261011-1933`. | Empty values do not establish native Issue Type pinning, Project visibility, or why values are unset. |

The [issue-delivery sequence](../diagrams/mermaid/issue-delivery-sequence.mmd),
[Project-Issue lifecycle](../diagrams/mermaid/project-issue-lifecycle.mmd),
[factory-evolution sequence](../diagrams/mermaid/factory-evolution-sequence.mmd),
and [product-delivery sequence](../diagrams/mermaid/product-delivery-sequence.mmd)
show the intended processing order. They are contract views, not evidence
that the current runtime completed the path.

**Evidence:** this section separates target flow from run observations and
references pinned in [system evidence](../references/system-evidence.yml).
