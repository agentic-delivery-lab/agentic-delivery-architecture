# 3. Context and Scope

<!-- arc42:section 03 -->

## 3.1 Domain contexts and ownership

| Context or owner | Responsibility | Boundary |
| --- | --- | --- |
| Agentic Delivery Governance | Repository rules and reusable delivery policies for proposing, reviewing, validating, and recording work | Domain context `agentic-delivery-governance`; GitHub is its work-state control plane. |
| Agentic Delivery Control Plane | Event intake, repository enrollment, semantic routing, deterministic authorization, orchestration, and controlled write-back | Domain context `agentic-delivery-control-plane`; executable source remains in `agentic-delivery`. |
| Agentic Primitives | Reusable agents, skills, instructions, hooks, validators, capabilities, and MCP contracts; catalog, releases, and projections | Domain context `agentic-primitives`; source remains in `agentic-delivery-primitives`. |
| Developer Distribution | Reproducible development environment, bootstrap, bundles, and thin consumer integrations | Domain context `developer-distribution`; source remains in `agentic-delivery-distribution`. |
| Architecture Authority | Canonical organization ADR, ADP, and ADD text; principles, architecture description, context map, and conformance | Cross-context authority and canonical decision-text owner, not a bounded context. |
| Public `.github` adapter | Public profile, community-health files, issue-form artifacts, and pull-request template | GitHub repository adapter, not a bounded context. Whether each artifact is inherited by every repository is a separate live check. |
| Private `.github-private` adapter | Member profile and reviewed agent-publication projections | GitHub repository adapter, not a bounded context. Publication entitlement remains unverified. |

Agentic Primitives and Developer Distribution are separate contexts because
their contracts model different catalog/release/projection and
bootstrap/bundle responsibilities. They are not classified as contexts merely
because they have separate repositories. The machine-readable context map is
[`../domain/bounded-contexts.yml`](../domain/bounded-contexts.yml) and
[`../domain/context-map.yml`](../domain/context-map.yml).

## 3.2 External systems and surfaces

- **GitHub organization metadata:** native Issue Types and organization-level
  issue-field definitions. These are distinct from Project-specific fields.
- **GitHub Issues and pull requests:** durable issue work state, lineage, and
  review records.
- **GitHub Projects:** required primary planning, prioritization,
  coordination, and progress-visibility surface for Factory Evolution and
  Software Product Delivery. Origin repository Issues remain canonical work
  records and the only source of execution authorization. The 2026-10-09
  inventory found no organization, user, or repository Project, while the
  organization API reports Project capability under its Free plan. The
  authenticated user has an active organization admin role, but Project views,
  fields, per-Project access, GitHub App access, and live lifecycle integration
  remain unverified. No live configuration is claimed.
- **GitHub App:** installation access, permissions, and subscribed event
  delivery. It grants access and supplies events; it does not distribute
  generic issue forms or templates.
- **Vercel webhook ingress:** the pinned Control Plane source contains a
  Vercel function for signed webhook intake and scheduled reconciliation. A
  READY production deployment on the observed Control Plane `main` commit is
  confirmed by Vercel metadata; route health, webhook delivery, and successful
  reconciliation remain untested.
- **Neon replay store:** the pinned Control Plane source contains a PostgreSQL
  adapter and migrations for webhook replay claims, controller receipts, and
  scan checkpoints. A live database's schema and state are not established by
  source inspection.
- **GitHub Actions and self-hosted runner:** deterministic workflows and
  bounded execution; a pinned Codex CLI runs inside the authorized workspace.
  Current source and run evidence are called out in section 6.
- **Consumer repositories:** receive thin, version-pinned integration from
  Distribution and reviewed Primitive projections from their canonical source.
- **Product repositories:** the expected owner boundary for product Issues and
  product outcome evidence; no distinct product repository or steward was
  identified in the six-repository inventory.

## 3.3 Scope exclusions

The architecture description does not define GitHub's internal implementation,
claim that the organization settings are fully configured, or claim that
hosting rules enforce policy in every repository. It does not make Architecture
Authority, `.github`, or `.github-private` bounded contexts. It does not
authorize an App, field, ruleset, release, or participant-mode mutation.

## 3.4 Context view

See [context map](../diagrams/mermaid/context-map.mmd) and the canonical
[Structurizr/C4 model](../models/workspace.dsl). They separate the four domain
contexts, Architecture Authority, GitHub adapters, organization metadata,
Project fields, App access/events, Vercel ingress, Neon replay state, Actions,
Codex, and the unconfirmed product-repository boundary.

**Evidence:** pinned contracts are the Architecture context model,
Control Plane domain register, ADP-0001 and the Primitive catalog, and
ADD-0001 and the Distribution bundle at revisions listed in
[`system-evidence.yml`](../references/system-evidence.yml).
