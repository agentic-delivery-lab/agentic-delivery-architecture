# 10. Quality Requirements

<!-- arc42:section 10 -->

## 10.1 Quality requirements overview

| Priority | Concern | Stakeholder | Acceptance view |
| --- | --- | --- | --- |
| Essential | No write targets the wrong repository or issue. | Organization operator, repository owner | QR-001 and QR-002 |
| Essential | Every Primitive ADR reference resolves to a canonical owner and version. | Architecture reviewer, Primitive maintainer | QR-003 |
| Essential | Field/type/lifecycle semantics remain distinct and migration is reversible. | Repository writer, operator | QR-004 |
| Essential | Consumer upgrade, conflict handling, and rollback preserve provenance and repository identity. | Distribution maintainer, consumer owner | QR-002, QR-005, QR-010 |
| Important | Readers can review the architecture without a special renderer. | All maintainers and reviewers | QR-006 |
| Essential | Release and projection provenance can be recomputed from immutable sources. | Architecture, Primitive, and Distribution maintainers | QR-010 |
| Important | Live hosting evidence is scoped to the repository actually checked and unknown settings remain unknown. | Maintainer, security reviewer | QR-007 |
| Important | Semantic review is independent from implementation authorship on the long-running path. | Repository writer, independent Validator | QR-008 |

## 10.2 Quality scenarios

The detailed scenarios in [`quality-scenarios.yml`](../quality/quality-scenarios.yml)
state the stimulus, response, and measurable result. They are derived from the
recovery brief, ADR outcomes, and pinned sources; they are desired acceptance
criteria, not proof that a current live system has passed them.

At the 2026-09-24 snapshot, QR-001/QR-002 have code and contract evidence but
no end-to-end run. QR-003's Architecture release and owner projection checks
are introduced by this proposal; Primitive impact review automation remains
open. Issue-field pinning is unverified. The recovery intake runs failed before
dependency installation. Participants remain in shadow mode. Project
integration and inventory are outside this phase's acceptance scope and do not
affect the issue-field contract. These are unresolved
evidence gaps, not satisfied quality goals.

**Evidence:** source revisions and runtime checks are linked by identifier in
[`system-evidence.yml`](../references/system-evidence.yml).
