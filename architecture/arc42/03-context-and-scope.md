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
- **GitHub Projects:** optional planning/projection surface. No current
  Projects inventory or lifecycle binding is claimed; Project operations are
  outside the acceptance scope of this Architecture change.
- **GitHub App:** installation access, permissions, and subscribed event
  delivery. It grants access and supplies events; it does not distribute
  generic issue forms or templates.
- **GitHub Actions and self-hosted runner:** deterministic workflows and
  bounded execution. Current run evidence is called out in section 6.
- **Consumer repositories:** receive thin, version-pinned integration from
  Distribution and reviewed Primitive projections from their canonical source.

## 3.3 Scope exclusions

The architecture description does not define GitHub's internal implementation,
claim that the organization settings are fully configured, or claim that
hosting rules enforce policy in every repository. It does not make Architecture
Authority, `.github`, or `.github-private` bounded contexts. It does not
authorize an App, field, ruleset, release, or participant-mode mutation.

## 3.4 Context view

See [context map](../diagrams/mermaid/context-map.mmd). It separates the four
domain contexts, Architecture Authority, GitHub adapters, organization
metadata, Project fields, App access/events, and Distribution bootstrap.

**Evidence:** pinned contracts are the Architecture context model,
Control Plane domain register, ADP-0001 and the Primitive catalog, and
ADD-0001 and the Distribution bundle at revisions listed in
[`system-evidence.yml`](../references/system-evidence.yml).
