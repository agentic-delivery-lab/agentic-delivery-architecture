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

This is a target contract. Architecture PR #14 proposes a versioned evidence
report schema and synthetic fixture. Agentic Primitives #3 owns reusable
datasets, deterministic graders, and replay; Control Plane #103 owns offline
finding routing. No live evaluation loop, measured baseline, or improvement
claim is evidenced here.

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
| Projects are the required portfolio planning surface in the proposed model, but the 17:02 UTC authenticated inventory returned no organization, personal, or repository Project. At 17:17, new Control Plane Issue #105 was created for run budgets and recovery and has no Project item; the six-repository open-Issue total is now 20. | `project-inventory-20261009-1153`, `expanded-gh-auth-project-and-issue-inventory-20261009-1711`, `control-plane-budget-recovery-issue-created-20261009-1717`, and `github-app-installation-permissions-20261009-1725`. | No Project-specific fields, visibility, or membership could be inspected; the invoker installation declares no organization- or repository-Projects permission, and its selected repository membership and deployed credential binding remain unverified. The one-Project/two-view proposal awaits human decision in Architecture #15; all six organization Issue Fields are member-only. |
| The documented `/issue-field-values` endpoint returned an empty array for each of the 19 currently open Issues. | `issue-field-values-20261009-1152`. | This is a point-in-time values read, not evidence about Issue Type pinning or future Project visibility; the earlier `/fields` request was inconclusive. |
| Evaluation report contract 2.0.0 is proposed with a pre-registered selection pin, exact case coverage, dataset partition, grader/evaluator versions, calibration evidence, independence, failure classes, and comparable measurements; offline replay and finding-routing implementations have owners. | Architecture PR #14; Primitives #3; Control Plane #103; QR-015, QR-016, and QR-019. | The schema is not an evaluator. No representative validation/holdout dataset, calibration run, measured baseline, independent outcome review, live report, or automatic follow-up exists. |
| Per-run budget enforcement and operational recovery evidence remain target scenarios. The architecture records hard limits for duration, turns/invocations, retries, and recursion, with available quota/spend and recovery receipts. | QR-017, QR-018; ADR-0009 and ADR-0015. | Existing actor and bot-hop gates do not prove complete per-run budget receipts, zero calls after limit exhaustion, or end-to-end safe recovery. Unknown quota/spend remains unknown. |
| Exact Control Plane main source pins Codex CLI 0.159.3 and separates controller instructions from the task workspace; an isolated 0.159.3 fixture confirmed root/CWD AGENTS discovery. | `control-plane-codex-instruction-context-20261009-1622` in system evidence. | Source inspection and local fixture are not an Actions-run observation and do not prove customization propagation, prompt-injection resistance, or successful live delivery. |
| The latest issue run completed authorization, classification, and finalization while delivery was skipped. | current-delivery-and-release-state observation. | A skipped delivery does not prove a completed issue-to-PR flow or independent field-value read-back. |
| Participant registry lists all six repositories in shadow mode with exact controller and Architecture/Primitive pins. | `participant-modes-and-release-pins` in system evidence. | Shadow configuration does not prove delivery, API identity, or write-back. |
| Issue-intake runs for recovery issues #59 and #60 failed before dependencies could install because the classify checkout path did not match its working directory. | [Run 36050051251](https://github.com/agentic-delivery-lab/agentic-delivery/actions/runs/36050051251), [run 36049717167](https://github.com/agentic-delivery-lab/agentic-delivery/actions/runs/36049717167), workflow at pinned Control Plane commit. | This identifies a workflow defect; it does not establish that field gate code is absent. |
| Recovery Issues #59 and #60 have no values in the current `/issue-field-values` read; the earlier historical read was inconclusive because its captured path was `/fields`. | `issue-field-values-20261009-1152` and corrected `organization-issue-field-values` observation. | The current empty values do not explain why they are absent or establish the result of intake; no causal link is inferred. |
| The observed App installation has All repositories access and comment/review subscriptions, while the Control Plane contract expects selected repositories and broader events. | `invoker-installation` observation and `config/github-app-contract.json` at CP commit. | The installation could not be bound to the credential used by the controller. No setting was changed. |
| Field definitions exist for Lifecycle Stage and Delivery Readiness; user-visible pinning remains unverified. | `organization-issue-fields` observation. | The definitions API does not report pinning; Projects are a separate surface outside this issue-field observation. |

The [issue-delivery sequence](../diagrams/mermaid/issue-delivery-sequence.mmd),
[Project-Issue lifecycle](../diagrams/mermaid/project-issue-lifecycle.mmd),
[factory-evolution sequence](../diagrams/mermaid/factory-evolution-sequence.mmd),
and [product-delivery sequence](../diagrams/mermaid/product-delivery-sequence.mmd)
show the intended processing order. They are contract views, not evidence
that the current runtime completed the path.

**Evidence:** this section separates target flow from run observations and
references pinned in [system evidence](../references/system-evidence.yml).
