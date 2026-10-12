---
date: 2026-10-09
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11
decision-makers: Architecture issue #11 proposal
consulted: Context steward review pending
informed: Not recorded
domains:
  - agentic-delivery-governance
  - agentic-delivery-control-plane
  - agentic-primitives
  - developer-distribution
required-enforcement:
  - deterministic
  - semantic
---

# Use Projects for planning and Issues for execution authorization

## Context and Problem Statement

The organizational strategy needs one portfolio surface for prioritization,
sequencing, cross-repository coordination, and progress visibility across
Factory Evolution and Software Product Delivery. The existing architecture
describes GitHub Projects as optional, while ADR-0012 and ADR-0019 correctly
keep work intent and lifecycle values with repository Issues and organization
Issue Fields.

A Project item is not an authorization record. Allowing a Project-only card to
trigger agent execution would bypass the originating repository's Issue
identity, actor permission, Issue Type, lifecycle, policy, and transition
checks. Copying Issue-owned fields into separately editable Project fields
would create conflicting state. The initial read-only audit could not
inventory Projects because the authenticated CLI did not have `read:project`;
that is historical evidence, superseded by the complete 2026-10-12
09:17–09:22 UTC read. With `project`, `admin:org`, and `repo` OAuth scopes,
the active organization-admin identity's organization, viewer, and all six
repository Project v2 connections returned no Project nodes or further pages.
All 62 Issues in those repositories had zero Project items; all 24 open Issues
had zero organization Issue Field Values. The read confirmed six
organization-members-only Issue Fields, nine native Issue Types, and a Free
organization plan with organization and repository Project capability flags.
No Project exists in the queried scopes to inspect membership, views, fields,
or visibility, and the human OAuth grants do not establish GitHub App access.
The exact results and scope limits are in
`system-evidence.yml#portfolio-project-issue-association-recheck-20261012-0922`.

## Decision Drivers

- Make GitHub Projects the primary planning, coordination, and portfolio
  progress surface without changing the Issue-first execution boundary.
- Keep one canonical owner for each durable fact and preserve native Issue
  Type, Lifecycle Stage, Delivery State, authorization, runner, pull-request,
  and evaluation semantics.
- Represent both value streams in one reviewable portfolio and distinguish
  factory improvements from software delivered to users.
- Fail closed for Issue execution when origin identity, actor permission, or
  required policy is unknown. Hold only Project-dependent operations when
  Project identity, access, or field meaning cannot be verified; report the
  planning gap and preserve otherwise authorized Issue-first security or
  recovery work without requiring Project access.
- Avoid an unreviewed Project mutation, permission expansion, or duplicated
  Issue field; retain the separate Architecture #15 human decision before
  creating or configuring a Project.

## Considered Options

- Keep Projects optional and leave cross-repository planning to Issues alone.
  This preserves current architecture wording but does not provide the
  required portfolio coordination and progress views.
- Let Projects own the whole work lifecycle and allow cards to start agent
  work. This combines planning with authorization and duplicates Issue state.
- Use one organization portfolio Project for planning and visibility while
  retaining origin Issues as the only work and authorization records. Keep
  Project-owned fields limited to distinct portfolio facts, and select or
  configure a concrete Project only after its live inventory and visibility
  have been reviewed.

## Decision Outcome

Proposed operating model: **Use GitHub Projects for portfolio planning,
prioritization, coordination, and progress visibility; use origin repository
Issues for work intent and execution authorization.** The proposed minimum
topology is one organization portfolio Project with separate Factory Evolution
and Software Product Delivery views. Architecture #15 asks the accountable
organization owner to approve, revise, or reject that topology; until that
human decision is recorded, it remains a proposal. Reuse a suitable existing
Project only if a separately authorized inventory confirms fit. Otherwise,
propose creation as a separate authorized task. This draft ADR does not claim
that a Project exists or authorize any Project, Issue Field, permission, or
App configuration change.

### Consequences

- A Project item references its source repository and canonical Issue. A
  Project-only card is planning input only; before execution, a maintainer
  creates or links an Issue in the owning repository and that Issue passes the
  normal deterministic authorization checks.
- Project membership, status, priority, automation, or a Project event cannot
  authorize a model call, repository write, Issue Field write, pull request,
  release, or activation. The Control Plane re-fetches the source Issue and
  validates repository identity and actor permission before execution.
- Native Issue Type, Lifecycle Stage, Delivery State (currently displayed as
  Delivery Readiness), Issue-owned priority, and runner state retain their
  existing owners. A Project field can own a distinct portfolio planning fact;
  it must not silently duplicate an Issue-owned fact or become a second
  lifecycle source.
- Project dependency fields express planning dependencies among portfolio
  items. Execution dependency gates remain part of the origin Issue and
  Control Plane contract; a Project dependency does not authorize or block
  execution by itself.
- Project views must distinguish Issue lifecycle and Delivery State from PR
  review, runner/session, webhook replay, and evaluation state. Webhook
  delivery replay, resumable Codex session state, and evaluation replay stay
  distinct.
- Organization Project capability is reported available under the current
  Free plan. The audited organization Issue Fields are organization-members-
  only; public and internal Project views may not expose them. Because no
  Project exists in the queried owner scopes, a future view still requires a
  live field-visibility and access check.
- Architecture owns strategy and this decision. The Control Plane owns
  project event handling and authorization implementation; Primitives owns
  reusable planning/evaluation capabilities; Distribution owns any
  versioned consumer workflow. Each owner implements its part in an
  issue-linked reviewed pull request.
- GitHub's documented Projects API separates read access from Project
  mutations. The current user has `project` and `admin:org` OAuth scopes and
  an active organization admin role, but a future Project write path still
  requires a separately reviewed permission contract. This decision does not
  expand current identity scopes or authorize any live change.

### Confirmation

- Architecture checks validate stable strategy goal and measure IDs, source
  references, the Project-only-card invariant, and the exact decision set.
- The Control Plane phase adds deterministic fixture coverage proving that a
  Project-only card or Project dependency cannot authorize execution, and that
  wrong Issue identity or missing Issue permission cannot start a run. Missing
  Project context holds only Project-dependent operations; an otherwise
  authorized Issue-first security or recovery path remains available without
  Project access.
- An operator read-only inventory confirms Project identity, membership,
  field configuration, and visibility before any board configuration or write
  integration is proposed. Current evidence reports Project features
  available but no Project to configure; Architecture #15 remains the human
  topology decision.
- Offline fixtures, hosted CI, and live operation are reported as separate
  evidence. No successful live Project integration is claimed by this record.

## Pros and Cons of the Options

### Keep Projects optional

- Good, because it preserves the current deployment and permission model.
- Bad, because prioritization, sequencing, and progress visibility across the
  two value streams have no single operational surface.

### Let Projects own execution lifecycle

- Good, because planning and execution appear together on one board.
- Bad, because a card can lack source Issue identity or origin-repository
  permission, and duplicate lifecycle fields can diverge from the Issue.

### Plan in Projects; authorize from Issues

- Good, because portfolio visibility and Issue-based execution authority
  coexist with explicit field ownership.
- Good, because Project-only planning and Project-dependent actions hold safely
  without losing the source Issue or blocking independent Issue-first recovery.
- Bad, because the future integration needs Project access, visible fields,
  reconciliation, permission-failure handling, and owner-specific tests.

## More Information

- The canonical purpose, mission, vision, goals, measures, value streams,
  guardrails, and source-of-truth map are in
  [organizational-strategy.yml](../architecture/strategy/organizational-strategy.yml).
- The current read-only inventory gap and dated repository revisions are in
  [system-evidence.yml](../architecture/references/system-evidence.yml).
- Related decisions are ADR-0012, ADR-0019, AP-001, and AP-002. This decision
  adds AP-004.
- ADR-0018's existing Project-projection wording continues to prohibit a
  second Issue lifecycle authority and unreviewed Project-event routing.
  ADR-0019's projection wording applies to Issue-owned lifecycle and delivery
  values; it does not prohibit distinct Project-owned portfolio facts such as
  cross-Issue sequencing. ADR-0023 clarifies that these constraints coexist
  with Projects as the required planning surface.
- Impact assessment against the strategy requirement: retain ADR-0012's
  source-Issue lifecycle and authorization boundary, ADR-0018's central
  Control Plane and unreviewed Project-event restrictions, and ADR-0019's
  prohibition on a second lifecycle authority. None makes Project planning
  optional. Read with this decision and AP-004, they establish Projects as the
  primary portfolio planning and coordination surface while Issues remain the
  canonical lifecycle and execution-authority records; no amendment to those
  three decisions is needed to express the requirement.
- The canonical strategy is the
  [organizational strategy source](../architecture/strategy/organizational-strategy.yml);
  dated live observations are in
  [system evidence](../architecture/references/system-evidence.yml).
- [GitHub Projects overview](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects),
  [Issue Fields and visibility](https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-issue-fields),
  and [Projects API permissions](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
  describe Projects capabilities, synchronization, visibility, and API access.
- The complete current empty Project inventory, organization capability flags,
  and identity caveats are in the
  [strategy gap matrix](../architecture/references/strategy-foundation-gap-matrix.md)
  and [system evidence](../architecture/references/system-evidence.yml).
- This record is proposed on the issue-linked branch. Context stewards and
  human reviewers must review it before it becomes the Architecture
  repository's accepted decision on main.
