# 8. Crosscutting Concepts

<!-- arc42:section 08 -->

## 8.1 One owner, then references or projections

Each durable fact has a canonical owner. Architecture Authority owns all
organization ADR, ADP, and ADD decision text, including context-local records.
The Control Plane owns lifecycle/runtime implementation; Agentic Primitives
owns reusable capability source; Distribution owns bootstrap and consumer
integrations. A `.github` adapter may contain a local artifact required by
GitHub, but that artifact does not become a second authoritative model.

The decision inventory keeps imported repository identity, immutable source
commit, original path, and per-file SHA-256 as migration provenance. The
Architecture release pins the one canonical text file for each stable ID.
Generated traceability resolves every Primitive ADR reference to a local
Architecture record; external ADR text projections are forbidden. Consumer
repositories will replace their copies with version-pinned references only in
their own reviewed follow-up changes.

## 8.2 Work state and execution state

The GitHub control plane owns native Issue Type, Lifecycle Stage, Delivery
State, governance metadata, and source-issue lineage. The current live Delivery
State field name is Delivery Readiness; the logical `readiness` key remains a
versioned compatibility alias until an explicit migration. Runner state is
separate and describes one resumable operation. GitHub Projects is the primary
portfolio planning and coordination surface, while Issues remain canonical
work and authorization records. Project-owned planning fields must remain
distinct from Issue-owned lifecycle values; a Project card never authorizes
execution.

A field rename must retain the one existing field identity and option IDs where
the platform supports in-place change, compare old/new projections in shadow,
and preserve rollback. The current architecture change does not mutate a
field.

The initial 2026-10-09 read failed because Project access was unavailable. A
refreshed complete query under the authenticated `project` and `admin:org`
scopes returned no organization or personal Projects and no next page; all 19
open Issues in the six visible organization repositories also had no Project
associations. No Project field, membership, or visibility could be inspected;
App installation access and owners outside the queried scopes remain unknown.
The proposed one-Project/two-view topology awaits a human decision in
Architecture #15. All six organization Issue Fields have
`organization_members_only` visibility, which remains a view-design constraint
for any future Project.

## 8.3 Semantic proposals and deterministic authorization

A semantic process may propose classification and work. Versioned schemas,
repository identity, permission checks, known options, transitions, dependency
gates, and policy catalogs decide whether it is allowed. Unknown metadata or a
stale event fails closed. Architecture review treats structural failures as
deterministic and meaning findings as advisory or inconclusive; human review
interprets the cited evidence.

## 8.4 Contracts, provenance, and compatibility

A release or projection identifies its repository, immutable source commit,
content digest, contract version, and compatible consumer surface. Participant
registry pins control execution versions; Primitive metadata traces ADR impact;
Distribution locks state exact consumer inputs. Upgrade, shadow comparison,
rollback, and repository identity are required evidence before activation.

## 8.5 GitHub organization settings and repository adapters

Native Issue Types and organization issue-field definitions are organization
settings. A GitHub Project defines separate Project-specific fields. The App
installation grants access and delivers subscribed events; participant
enrollment remains a Control Plane decision. Public template/community files
and private profile/agent projections belong to different `.github` adapters.
Distribution supplies bootstrap and version-bound consumer artifacts. These
surfaces are not interchangeable.

## 8.6 Human language and architecture documentation

The ubiquitous-language register assigns meanings to bounded contexts. Review
terms semantically; structural YAML checks can detect malformed entries but
cannot prove that prose or code expresses the intended meaning. arc42 Markdown,
models, ADRs, and machine-readable registers are kept in Git as docs-as-code.
An architecture description links each view to stakeholder concerns and cites
its source revisions and evidence limitations.

**Evidence:** AP-001 and AP-002 consequences, ADR-0003, ADR-0011 through
ADR-0019, the domain register, and pinned cross-repository sources in
[`system-evidence.yml`](../references/system-evidence.yml).

## 8.7 Workspace and artifact lifecycle

AP-003 and ADR-0004 require explicit ownership and disposition for source
workspaces and artifacts. Prefer a clean primary checkout; necessary isolated
work uses a sibling `<repo>.worktrees` container with the ADR-0007 branch-name
projection. Source checkouts stay outside temporary storage. Scratch/test
producers register immediate teardown; incident evidence has private durable
storage and retention gates. Cleanup proves exact-tip integration, checks dirty
and active consumers, guards remote races, and preserves unknown work.

Primitives owns reusable guards; Distribution owns pinned profile installation;
the Control Plane applies those contracts to execution and artifact producers.
QR-012 is a target scenario. Architecture issue #7 tracks implementation and
rollout; this text does not demonstrate universal installation or enforcement.

## 8.8 Evaluation evidence and recursive improvement

Architecture owns the proposed version 1.0.0 evaluation-report envelope and
its evidence semantics. It separates agent-capability, factory, and
product-outcome evaluations; immutable subject, dataset, grader, comparator,
baseline, and dependency pins; deterministic checks; semantic judgments;
uncertainty; independent-review status; regression severity; and recommended
owner-Issue follow-up. A comparative improvement claim requires a measured
pinned baseline and a comparable candidate measurement.

The report is evidence only. It cannot create or prioritize work, authorize
execution, change policy, write Project state, activate participants, merge,
or release. Primitives #3 owns reusable datasets, graders, and replay;
Control Plane #103 owns bounded finding routing; product owners retain their
domain outcomes. The schema and synthetic fixture are proposed in Architecture
PR #14; none of these artifacts is a live evaluation result.
