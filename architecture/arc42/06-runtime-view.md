# 6. Runtime View

<!-- arc42:section 06 -->

## 6.1 Desired short gated loop

1. A person creates or updates an issue in its origin repository.
2. The invocation boundary and participant contract decide whether processing
   may begin.
3. Semantic classification proposes a route, metadata, and orchestration
   pattern.
4. Deterministic checks validate issue identity, actor permission, type,
   fields/options, dependencies, policy, and transition.
5. One authorized writer performs bounded work on an issue-linked branch.
6. Tests and an independent Validator report evidence; the writer publishes a
   review pull request.
7. A human reviewer decides whether to merge. The source issue remains open
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
and contract pins.

## 6.4 Current runtime evidence and gaps

| Observation | Evidence | Limit |
| --- | --- | --- |
| Participant registry lists all six repositories in shadow mode with exact controller and Architecture/Primitive pins. | `participant-modes-and-release-pins` in system evidence. | Shadow configuration does not prove delivery, API identity, or write-back. |
| Issue-intake runs for recovery issues #59 and #60 failed before dependencies could install because the classify checkout path did not match its working directory. | [Run 36050051251](https://github.com/agentic-delivery-lab/agentic-delivery/actions/runs/36050051251), [run 36049717167](https://github.com/agentic-delivery-lab/agentic-delivery/actions/runs/36049717167), workflow at pinned Control Plane commit. | This identifies a workflow defect; it does not establish that field gate code is absent. |
| New recovery issues had no issue-field values after intake failed. | `organization-issue-field-values` observation. | This is limited to those new issues. |
| The observed App installation has All repositories access and comment/review subscriptions, while the Control Plane contract expects selected repositories and broader events. | `invoker-installation` observation and `config/github-app-contract.json` at CP commit. | The installation could not be bound to the credential used by the controller. No setting was changed. |
| Field definitions exist for Lifecycle Stage and Delivery Readiness; user-visible pinning remains unverified. | `organization-issue-fields` observation. | The definitions API does not report pinning; Projects are a separate surface outside this issue-field observation. |

The
[issue-delivery sequence](../diagrams/mermaid/issue-delivery-sequence.mmd)
shows the intended processing order. It is a contract view, not evidence that
the current runtime completed the path.

**Evidence:** this section separates target flow from run observations and
references pinned in [system evidence](../references/system-evidence.yml).
