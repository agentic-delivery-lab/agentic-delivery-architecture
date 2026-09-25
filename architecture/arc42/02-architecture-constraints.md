# 2. Architecture Constraints

<!-- arc42:section 02 -->

## 2.1 Organization and repository constraints

- The system spans six repositories with distinct owners. The source commits
  observed on 2026-09-24 are listed in
  [system evidence](../references/system-evidence.yml).
- Architecture Authority owns principles, terminology, architecture
  descriptions, and organization-wide decision text, including context-local
  ADRs. It is a cross-context authority, not a bounded context.
- Control Plane runtime, App integration, orchestration, runner/session
  handling, and controlled GitHub write-back remain in
  `agentic-delivery`.
- Agentic Primitives owns reusable primitive source and its catalog.
  Distribution owns bootstrap, bundles, and consumer projections.
- The two `.github` repositories are GitHub adapters. They do not own the
  delivery controller or a bounded context.
- Every repository change is proposed on an issue-linked feature branch and
  reviewed through its own pull request. A change in one repository does not
  authorize writes to another repository or to live organization settings.
- Live fields, App installations, Projects, rulesets, releases, and participant
  modes must be evidenced separately from versioned definitions.

## 2.2 Work-state and safety constraints

Native GitHub Issue Types classify work. The organization-level
`Lifecycle Stage` field records lifecycle position. The separate orthogonal
`Delivery State` concept controls or holds the next operation; its current
live display name is `Delivery Readiness`. Governance metadata and runner
execution state remain separate. GitHub Projects fields are a distinct
projection surface. An issue form or configuration file does not prove that
fields are pinned or visible to users.

Semantic reasoning may propose an action. Deterministic code must validate the
origin repository and issue, actor authorization, schema, native type,
field/option identity, allowed transition, and orchestration policy before a
write. Human review and merge authority remain with repository maintainers.

## 2.3 Interface and release constraints

- Architecture and Primitive interfaces identify immutable source commits and
  content digests. Consumer repositories replace decision-text copies with
  pinned references only after separate reviewed follow-ups; they do not own
  shared runtime state.
- The decision inventory identifies imported origins and SHA-256 values;
  Architecture release integrity pins canonical decision files. Primitive
  ADR references resolve locally, without an external text projection.
- Architecture releases remain drafts until their source, digest, and
  compatibility evidence have been reviewed and intentionally released.
- ADR-0019 gates the field rename. The live field and option IDs must be
  inventoried and retained where possible; no second field or silent rename is
  permitted. If in-place rename is unsupported, work stops for a separate
  decision.
- No repository check is represented as an organization-wide GitHub guarantee.
  Rulesets and required checks are repository-scoped and are verified
  individually.

## 2.4 Documentation method and standards

[arc42](https://arc42.org/documentation/) supplies the twelve-section
documentation template. Its [method](https://arc42.org/method/) supports
iterative, docs-as-code maintenance; its
[official examples](https://github.com/arc42/examples.arc42.org-site) inform
section detail. The
Markdown and model files live with the architecture and are reviewed in Git.
arc42 is used as a template and method, not as a formal norm.

The [ISO/IEC/IEEE 42010:2022 standard](https://www.iso.org/standard/74393.html)
supplies the vocabulary for stakeholders, concerns, viewpoints, views, and
architecture descriptions. It distinguishes
an architecture from the description of that architecture; this repository
records the description and cited evidence.

TOGAF is not applied. The Open Group's [official framework description](https://www.opengroup.org/togaf)
is referenced for clarity. The current architecture has explicit goals,
decisions, consequences, owners, and context boundaries. No source evidence
shows a need for a separate enterprise-principles process, capability map, or
TOGAF artifacts that would improve those existing traceability links.

**Evidence:** repository and field/App/ruleset observations are recorded in
[`system-evidence.yml`](../references/system-evidence.yml); desired
constraints come from ADR-0011, ADR-0012, ADR-0018, and ADR-0019.
