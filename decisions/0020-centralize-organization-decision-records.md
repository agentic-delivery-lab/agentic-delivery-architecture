---
date: 2026-09-25
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/3
decision-makers: Not recorded
consulted: Not recorded
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

# Centralize organization decision records in Architecture Authority

## Context and Problem Statement

Agentic Delivery's decision records are spread across the Architecture,
Control Plane, Primitives, and Distribution repositories. Several ADR IDs have
multiple copies, and those copies can diverge in content or in links to
context-specific implementation. Consumers then have no reliable way to know
which prose is authoritative. Repository boundaries also represent different
bounded contexts and implementation responsibilities, so moving the text must
not erase those boundaries.

Issue [#3](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/3)
chooses one organization-wide source for the existing 17 ADR IDs, ADP-0001,
ADD-0001, and this additional ADR-0020. The current duplicate variants,
historical origins, context scope, and proposed text are recorded in the
Architecture decision inventory.

## Decision Drivers

- Give every organization decision identifier one canonical text source.
- Preserve identifiers, historical issue links, source provenance, and
  bounded-context scope.
- Keep domain meaning under semantic review by the affected context stewards.
- Keep runtime, implementation, primitive, bootstrap, and adapter artifacts in
  their respective repositories.
- Let consumers verify an immutable Architecture source commit and content
  digest without maintaining a second decision-text copy.

## Considered Options

- Keep each repository's decisions in its own files and maintain cross-repo
  owner projections.
- Keep only cross-context ADRs in Architecture and leave context-local
  decision prose in each implementation repository.
- Keep all organization decision text in Architecture and make bounded-context
  stewards required semantic reviewers for decisions in their context.

## Decision Outcome

Chosen option: **Keep all organization decision text in Architecture
Authority**, including decisions scoped to one bounded context. Architecture
Authority is the canonical text owner for all organization ADR, ADP, and ADD
records. It preserves the existing identifiers and each record's declared
domain scope; ADR-0020 adds no renumbering. The Architecture release lists the
exact decision identifier set and pins the record files through its immutable
source commit and content digest. Imported source identity, original path, and
per-file SHA-256 are retained as metadata, without copying a second prose
projection.

Each record's declared bounded context determines which context steward or
stewards must review its semantics. A context steward is a review role; this
decision does not name a person or prescribe a team. Cross-context records
require review from each affected context. Architecture Authority maintains
the cross-context inventory and release contract, but it is not an additional
bounded context.

The context register maps each bounded context to the repository containing
its current model or implementation evidence. That repository mapping routes a
review request; it does not grant GitHub approval, establish CODEOWNERS
coverage, or prove that a human completed the review. The 2026-09-24 live audit
recorded in [parent issue #59](https://github.com/agentic-delivery-lab/agentic-delivery/issues/59)
that the current one-member/CODEOWNERS gate prevents independent steward
approval. Human review remains required, and a maintainer must resolve
that gate before claiming the complete review route is active. This decision
does not change repository settings.

The future change path is explicit: a context source issue links an Architecture
ADR-tracking issue; canonical decision text changes only in an issue-linked
Architecture pull request; the required context stewards review the affected
semantics; and any runtime, catalog, or bootstrap implementation change then
lands in its own repository pull request pinned to the merged Architecture
release commit and digest. A text-only Architecture change does not authorize
or silently perform a live implementation change.

Decision text ownership does not move implementation authority. The Control
Plane retains runtime and GitHub-adapter implementation; Primitives retains
agents, skills, validators, catalog, and release implementation; Distribution
retains bootstrap and bundle implementation; `.github` adapters retain their
template, community, profile, and publication artifacts. Each repository will
replace its duplicate decision prose with a version-pinned reference only in
its own reviewed follow-up. Until those follow-ups merge, this proposal does
not claim that external copies have already been removed.

### Consequences

- Good, because one released Architecture source resolves each organization
  decision identifier while origin hashes preserve migration provenance.
- Good, because the context's language and implementation model remain visible
  and its steward reviews semantic changes.
- Bad, because an organization-wide decision change requires coordinated
  semantic review and later consumer-repository reference updates.
- Neutral, because Architecture owns decision text while bounded-context
  repositories continue to own executable behavior and artifacts.

### Confirmation

The deterministic Architecture checks compare the decision inventory's IDs
and paths with the local decision files, reject duplicate IDs and provenance
collisions, verify imported file hashes, require exact release coverage, and
ensure Primitive ADR references resolve only to local Architecture records.
The pull-request review must record semantic review by the steward role for
each context listed by a changed record. These checks do not infer a steward's
identity or prove that a human review occurred; the required reviews remain a
review-process obligation. Each consumer repository must validate its
version-pinned references in a separate reviewed change before its duplicate
text is removed.

## Pros and Cons of the Options

### Repository-local decision copies and external owner projections

- Good, because decision text stays beside its original implementation.
- Bad, because duplicate records can diverge and projections add a second
  owner map that must be kept in sync.

### Architecture owns cross-context records only

- Good, because context-local prose stays near its context implementation.
- Bad, because consumers must resolve and compare multiple canonical sources,
  which preserves the existing ambiguity for shared or cross-context records.

### Architecture owns all organization decision text

- Good, because stable IDs and a single release pin provide one answer to
  “which decision text applies?”
- Bad, because context stewards must review changes even when the Architecture
  repository hosts the text.
- Neutral, because ownership of decision rationale does not move code,
  runtime, catalog, or bootstrap responsibilities.

## More Information

- Related decision: [ADR-0001](0001-use-madr-for-architecture-decisions.md),
  which records the ADR and issue-linked review process.
- Related decision: [ADR-0003](0003-use-context-scoped-ubiquitous-language.md),
  which keeps each record's meaning within its declared context.
- Related decision: [ADR-0013](0013-derive-adr-traceability-from-agentic-primitives.md),
  which defines generated Primitive traceability from canonical Architecture
  records.
- The [decision inventory](../architecture/references/decision-inventory.yml)
  records canonical paths, source pins, and historical source variants without
  copying their decision prose.
- The source issue directed this proposal; the named decision-maker and
  consultation history remain unrecorded.
- This ADR and its ownership changes are proposed on the issue-linked feature
  branch. They remain provisional until the review pull request is merged.
