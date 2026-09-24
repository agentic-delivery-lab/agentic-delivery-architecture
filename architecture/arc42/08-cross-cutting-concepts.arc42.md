# 8. Cross-cutting Concepts

<!-- arc42:section 08 -->

## 8.1 One owner, then references or projections

Each durable fact has a canonical owner. Architecture Authority owns
cross-context ADR prose; Control Plane owns lifecycle/runtime implementation;
Agentic Primitives owns reusable capability source; Distribution owns
bootstrap and consumer integrations. A `.github` adapter may contain a local
artifact required by GitHub, but that artifact does not become a second
authoritative model.

External ADR projections carry owner repository identity, immutable source
commit, canonical path, and per-file SHA-256. Generated traceability keeps the
external ADR ID attached to every Primitive that references it; the decision
text remains at its owner.

## 8.2 Work state and execution state

The GitHub control plane owns native Issue Type, Lifecycle Stage, Delivery
State, governance metadata, and source-issue lineage. The current live Delivery
State field name is Delivery Readiness; the logical `readiness` key remains a
versioned compatibility alias until an explicit migration. Runner state is
separate and describes one resumable operation. Projects fields are a
projection, not an alternate lifecycle authority.

A field rename must retain the one existing field identity and option IDs where
the platform supports in-place change, compare old/new projections in shadow,
and preserve rollback. The current architecture change does not mutate a
field.

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
