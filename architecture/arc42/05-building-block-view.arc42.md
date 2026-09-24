# 5. Building Block View

<!-- arc42:section 05 -->

## 5.1 System decomposition

| Building block | Canonical owner | Main responsibility | Contract or evidence |
| --- | --- | --- | --- |
| Architecture Authority | `agentic-delivery-architecture` | Cross-context ADRs, principles, context map, architecture description, conformance policy, release identity | Architecture release, ADR aliases, context IDs, content digest |
| Governance | Domain context represented across the system | Issue and PR governance, reusable delivery rules, decision lifecycle | ADR-0001, ADR-0003, CP-owned repository rules |
| Delivery Control Plane | `agentic-delivery` | Event intake, participant registry, routing, deterministic gates, workflow/session orchestration, controlled write-back, evidence | Controller pin, event/lifecycle/state-machine contracts |
| Agentic Primitives | `agentic-delivery-primitives` | Canonical agent/skill/validator/capability source, catalog, release, and projection metadata | ADP-0001, primitive catalog and immutable release |
| Developer Distribution | `agentic-delivery-distribution` | Reproducible bootstrap, compatible bundles, consumer workflow projections, conflict checks | ADD-0001, workflow bundle, distribution locks |
| Public GitHub adapter | `.github` | Public profile and repository community/template artifacts | Repository content and individual live consumer checks |
| Private GitHub adapter | `.github-private` | Private member profile and reviewed agent publication | Surface contract, projection lock, entitlement evidence |
| GitHub organization metadata | GitHub organization | Native Issue Types and organization-level field definitions and options | Read API and separate per-type pinning evidence |
| GitHub Projects | GitHub Projects service | Optional project-specific views and fields | Separate scope, field bindings, and API access |
| GitHub App | GitHub App installation | Repository access, permissions, and subscribed event delivery | Installation manifest and live App evidence |
| Consumer repository | Each enrolled repository | Origin work records and pinned local integration | Repository ID, controller/contract/architecture/primitive pins |

A repository and a bounded context are not interchangeable. Architecture
Authority and both adapters are shown as owners or infrastructure surfaces,
not domain contexts.

## 5.2 Cross-context interfaces

- Architecture → Control Plane: immutable architecture release, ADR identifiers,
  context IDs, conformance contract, and digest.
- Architecture → Primitives: governing ADR identifiers and context-scoped
  language; primitive authors mark affected IDs and versions.
- Primitives → Distribution: selected, immutable capability release.
- Primitives → private adapter: reviewed agent projection with source
  provenance and compatibility target.
- Control Plane → Distribution: pinned workflow bundle and supported
  lifecycle, event, and state-machine contracts.
- Distribution → consumer repository: managed bootstrap files with
  conflict detection and rollback.
- Public adapter → GitHub repository UI: community and template artifacts;
  this path does not represent the Distribution bootstrap mechanism.
- GitHub App → Control Plane: access and subscribed events; App
  installation is not participant enrollment.

The interface names are versioned contracts or observed surface roles. Where a
live binding or consumer inheritance is not verified, the link is a target
relationship rather than an observed runtime connection.

**Evidence:** pinned source paths appear in
[`system-evidence.yml`](../references/system-evidence.yml); owner metadata for
external ADRs is in [`adr-owner-projection.yml`](../references/adr-owner-projection.yml).
