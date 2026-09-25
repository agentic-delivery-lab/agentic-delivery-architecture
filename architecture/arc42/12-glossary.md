# 12. Glossary

<!-- arc42:section 12 -->

The canonical, context-scoped terms are in
[`ubiquitous-language.yml`](../domain/ubiquitous-language.yml). This chapter
does not maintain a second glossary. Qualify a term with its context when an
external product label or a legacy name might be ambiguous.

Key distinctions for this architecture description:

- **Architecture Authority** is the cross-context owner of principles,
  decisions, and architecture description. It is not a bounded context.
- **Bounded context** is a domain boundary whose model and terms have defined
  meaning. Agentic Delivery Governance, Agentic Delivery Control Plane,
  Agentic Primitives, and Developer Distribution are the four contexts
  modeled here.
- **Repository adapter** is a GitHub repository that supplies files for a
  GitHub-defined surface. The public and private `.github` repositories are
  adapters, not bounded contexts.
- **Control plane** in Agentic Delivery Governance is GitHub's issue, pull
  request, metadata, and deterministic Actions surface. **Delivery
  controller** in Agentic Delivery Control Plane is the executable event and
  routing implementation.
- **Issue Type**, **Lifecycle Stage**, and **Delivery State** are distinct
  dimensions. Delivery State is currently exposed under the legacy
  `Delivery Readiness` name. Runner execution state is separate.
- **Pinned issue field** is an organization-level field configured for relevant
  issue types. Its definition does not prove UI pinning or user visibility.
- **GitHub Projects field** is a Project-specific field, distinct from an
  organization issue-field definition.
- **Primitive projection** is a generated copy of selected canonical Primitive
  source. **Distribution bundle** is a versioned set of bootstrap and consumer
  integration artifacts. They serve different interfaces.
- **Shadow mode** is a participant mode that can evaluate and report without
  authorized lifecycle or repository mutation.

**Evidence:** see context definitions and terms in
[`architecture/domain/`](../domain/) and the pinned Control Plane register
at the revision listed in [system evidence](../references/system-evidence.yml).
