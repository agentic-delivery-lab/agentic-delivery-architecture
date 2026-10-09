# 5. Building Block View

<!-- arc42:section 05 -->

## 5.1 System decomposition

| Building block | Canonical owner | Main responsibility | Contract or evidence |
| --- | --- | --- | --- |
| Architecture Authority | `agentic-delivery-architecture` | All organization decision text (ADR, ADP, ADD), principles, context map, architecture description, conformance policy, release identity | Decision inventory, Architecture release, ID aliases, context IDs, content digest |
| Governance | Domain context stewarded from `agentic-delivery` | Issue and PR governance, reusable delivery rules, decision lifecycle | ADR-0001 through ADR-0009, ADR-0011 through ADR-0013, ADR-0015, ADR-0016, ADR-0017, ADR-0018, ADR-0019, ADR-0020, ADR-0021; context register and pinned Control Plane evidence |
| Delivery Control Plane | `agentic-delivery` | Event intake, participant registry, routing, deterministic gates, workflow/session orchestration, controlled write-back, evidence | ADR-0022; controller pin, event/lifecycle/state-machine contracts |
| Agentic Primitives | `agentic-delivery-primitives` | Canonical agent/skill/validator/capability source, catalog, release, and projection metadata | Context steward; ADP-0001 decision text in Architecture; primitive catalog and immutable release |
| Developer Distribution | `agentic-delivery-distribution` | Reproducible bootstrap, compatible bundles, consumer workflow projections, conflict checks | Context steward; ADD-0001 decision text in Architecture; workflow bundle and distribution locks |
| Public GitHub adapter | `.github` | Public profile and repository community/template artifacts | Repository content and individual live consumer checks |
| Private GitHub adapter | `.github-private` | Private member profile and reviewed agent publication | Surface contract, projection lock, entitlement evidence |
| GitHub organization metadata | GitHub organization | Native Issue Types and organization-level field definitions and options | Read API and separate per-type pinning evidence |
| GitHub Projects | GitHub Projects service | Primary portfolio planning, prioritization, coordination, and progress views for both value streams | The complete 11:53 UTC read-only inventory returned no organization, user, or repository Project and no association for the 19 open Issues; a 16:43 UTC CLI recheck again returned no organization Project. Organization REST flags report organization and repository Projects available under the Free plan; proposed one-Project/two-view topology awaits human decision in Architecture #15; field visibility remains unverified |
| GitHub App | GitHub App installation | Repository access, permissions, and subscribed event delivery | Installation manifest and live App evidence |
| Vercel ingress | Control Plane deployment surface | Signed webhook intake, bounded controller dispatch, and scheduled delivery reconciliation | Control Plane source pin; production operation remains unverified |
| Neon replay store | Control Plane persistence adapter | Durable webhook claims, controller receipts, and scan checkpoints | Source adapter and migrations; deployed schema and data state remain unverified |
| Actions and Codex runtime | GitHub Actions plus pinned Codex CLI | Trusted authorization, isolated per-Issue workspace, bounded agent task, and finalization | Workflow and controller source pins; no completed live delivery is claimed |
| Consumer repository | Each enrolled repository | Origin work records and pinned local integration | Repository ID, controller/contract/architecture/primitive pins |
| Product repository boundary | Product owner, when identified | Product requirements, source Issues, and domain-specific outcome evidence | No distinct product repository or accountable steward is currently identified |

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
- GitHub App → Vercel → Control Plane Actions: signed webhook, replay claim,
  and bounded `repository_dispatch`; Vercel/Neon source integration does not
  prove production deployment or successful live delivery.
- Actions and Vercel → Neon: shared delivery claims, controller receipts, and
  scan checkpoints; Codex session state remains a separate runner-owned fact.
- Distribution → product repository: target bootstrap only after an identified
  owner and explicit repository-creation approval.

The interface names are versioned contracts or observed surface roles. Where a
live binding or consumer inheritance is not verified, the link is a target
relationship rather than an observed runtime connection.

**Evidence:** pinned source paths and repository roles appear in
[`system-evidence.yml`](../references/system-evidence.yml); canonical record
IDs, imported hashes, and historical variants are in
[`decision-inventory.yml`](../references/decision-inventory.yml).
