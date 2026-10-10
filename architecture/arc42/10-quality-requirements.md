# 10. Quality Requirements

<!-- arc42:section 10 -->

## 10.1 Quality requirements overview

| Priority | Concern | Stakeholder | Acceptance view |
| --- | --- | --- | --- |
| Essential | No write targets the wrong repository or issue. | Organization operator, repository owner | QR-001 and QR-002 |
| Essential | Every Primitive ADR reference resolves to exactly one local Architecture record and version. | Architecture reviewer, Primitive maintainer | QR-003 |
| Essential | Field/type/lifecycle semantics remain distinct and migration is reversible. | Repository writer, operator | QR-004 |
| Essential | Consumer upgrade, conflict handling, and rollback preserve provenance and repository identity. | Distribution maintainer, consumer owner | QR-002, QR-005, QR-010 |
| Important | Readers can review the architecture without a special renderer. | All maintainers and reviewers | QR-006 |
| Essential | Release and projection provenance can be recomputed from immutable sources. | Architecture, Primitive, and Distribution maintainers | QR-010 |
| Important | Live hosting evidence is scoped to the repository actually checked and unknown settings remain unknown. | Maintainer, security reviewer | QR-007 |
| Important | Semantic review is routed to every affected context steward and remains distinct from implementation authorship. | Repository writer, context stewards, independent Validator | QR-008, QR-011 |
| Essential | Workspace cleanup preserves retained and active work and disposes owned task artifacts. | Repository owner, execution-profile owner | QR-012 |
| Essential | A Project item cannot bypass the authorized source-Issue boundary. | Organization operator, repository owner | QR-013, QR-014 |
| Essential | Evaluation results are reproducible, attributable, and return to human-prioritized Issues. | Maintainer, capability consumer, independent reviewer | QR-015, QR-016, QR-019 |
| Essential | Every authorized agent run stays within inspectable resource limits and stops safely at a hard limit. | Maintainer, organization operator, capability consumer | QR-017 |
| Essential | Runtime failures have durable evidence and recover without duplicate protected writes. | Organization operator, repository owner, maintainer | QR-018 |
| Important | Product outcome evidence reflects user or operator results rather than activity counts. | Product user, product owner, delivery team | Strategy measures SM-003, SM-004, and SM-007 |

## 10.2 Quality scenarios

The detailed scenarios in [`quality-scenarios.yml`](../quality/quality-scenarios.yml)
state the stimulus, response, and measurable result. They are derived from the
recovery brief, ADR outcomes, and pinned sources; they are desired acceptance
criteria, not proof that a current live system has passed them.

At the 2026-10-09 snapshot, QR-001/QR-002 have code and contract evidence but
no end-to-end run. QR-003's local decision-set and Primitive-resolution checks
are introduced by this proposal; Primitive impact review automation remains
open. QR-011's repository routing is validated, but independent human steward
approval is blocked by the one-member/CODEOWNERS gate. Issue-field pinning is
unverified. The recovery intake runs failed before dependency installation.
Participants remain in shadow mode. The refreshed authorized Projects
inventory returned no organization, personal, or repository Project visible
to the queried identity, and all 19 open Issues in the six visible
repositories had zero Project item associations. The organization REST response reports
organization and repository Projects available under the Free plan, and the
identity has an active organization admin role. The six organization Issue
Fields are organization-members-only.
Architecture PR #14 proposes the QR-015 evaluation-report schema and synthetic
fixture, while Primitives #3 owns dataset/grader/replay implementation and
Control Plane #103 owns finding routing. There is no measured baseline or live
evaluation. QR-013–QR-016 remain target scenarios; they do not report complete
runtime integration or achieved outcomes. These are unresolved evidence gaps,
not satisfied quality goals.

The proposed report contract 2.0.0 requires each case to state its task,
stimulus, expected outcome, and acceptance criteria; the case set must match
the pinned dataset. It records deterministic evaluator identity and
independence, explicit failure classes, and a testable improvement hypothesis.
The validator rejects comparisons whose metric, unit, or observation window
differs. These checks establish report structure and comparability only; they
do not establish task quality, evaluator independence, or an observed baseline.

Contract 2.0 also pins the evaluation partition and a case-selection policy
and dataset-integrity assessment recorded before the run, evaluator versions,
and calibration evidence tied to those exact versions. Comparative claims are
accepted only for validation or holdout cases whose pre-run integrity
assessment found no known contamination, with independent calibrated graders
and an independent review. The validator
rejects late selection or integrity registration, suspected or unknown
contamination, unknown grader independence, mismatched or missing calibration,
and incomparable measurements. It cannot prove representative sampling,
clean calibration data, or genuine reviewer independence; those remain
explicit human-review responsibilities.

QR-017 and QR-018 add target controls for per-run limits and cross-path
recovery evidence. No accepted evidence currently proves complete admission
and usage receipts, a stop at every hard cap, or end-to-end safe recovery.
Available quota and spend data remain unknown when the approved runtime does
not expose them.

**Evidence:** source revisions and runtime checks are linked by identifier in
[`system-evidence.yml`](../references/system-evidence.yml).

QR-012 requires exact-tip, ownership, concurrent-use and producer-teardown
evidence in the implementing repositories. Its cross-profile rollout remains
a target under Architecture issue #7.
