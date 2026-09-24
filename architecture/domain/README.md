# Domain language and context boundaries

## Purpose and authority

This register is the cross-context vocabulary for Agentic Delivery. It is
maintained here as part of the Architecture Authority. The Control Plane's
register at the baseline commit cited in
[`system-evidence.yml`](../references/system-evidence.yml) has the same 83
terms for the two original contexts; the four-context model here adds the
distinct catalog/release and bootstrap/bundle models evidenced by the
Primitive and Distribution contracts. The Control Plane remains responsible
for its own executable model and must review any later language changes that
affect its context.

The architecture describes the system and its contracts. Architecture
Authority is the cross-context owner of this description, principles,
conformance rules, and organization-wide ADRs. It is not a fifth bounded
context: this repository does not establish a separate business model or
ubiquitous language. Likewise, `.github` and `.github-private` are GitHub
adapters that hold public community/template artifacts and private profile or
agent projections; repository boundaries alone do not create domain contexts.

## Bounded contexts

The domain register contains four contexts supported by distinct language or
model boundaries:

| Context | Owns | Evidence and boundary |
| --- | --- | --- |
| `agentic-delivery-governance` | Repository delivery governance and reusable rules for proposing, reviewing, validating, and recording work | Defined in the Control Plane register and ADR-0003. The repository-level control plane is a GitHub surface; it is not the executable controller. |
| `agentic-delivery-control-plane` | The delivery controller, event intake, enrollment, lifecycle contracts, orchestration, and controlled GitHub write-back | Defined in the Control Plane register; runtime implementation remains in `agentic-delivery`. It does not own Architecture or Primitive source. |
| `agentic-primitives` | Versioned agents, skills, instructions, hooks, validators, capabilities, and MCP contracts, with a catalog and release/projection rules | Distinct catalog and release model in ADP-0001 and `manifests/primitive-catalog.yml` at the pinned Primitive revision. |
| `developer-distribution` | Reproducible development-environment and thin consumer integration bundles, bootstrap, and consumer projections | Distinct bundle/bootstrap model in ADD-0001 and `manifests/workflow-bundle.json` at the pinned Distribution revision. |

The last two are domain contexts because their contracts define different
catalog, release, compatibility, and bootstrap behavior. That classification
is based on those models, not on the names or number of repositories. The
contexts and their relationships are also recorded in
[`bounded-contexts.yml`](bounded-contexts.yml) and
[`context-map.yml`](context-map.yml).

## Context-scoped language

The canonical machine-readable vocabulary is
[`ubiquitous-language.yml`](ubiquitous-language.yml). A term has one meaning
inside its listed context; the same spelling elsewhere is not presumed to
have that meaning. At a boundary, name the owning context or use an explicit
translation.

In Agentic Delivery Governance, **control plane** means GitHub Issues, native
Issue Types, organization issue fields, pull requests, and deterministic
Actions that hold work intent and state. In Agentic Delivery Control Plane,
**delivery controller** means the executable service that consumes eligible
events and proposes and applies authorized operations. Those meanings are
related but are not interchangeable.

In governance, **issue type** identifies what an issue represents;
**Lifecycle Stage** records lifecycle position; **Delivery State** is the
orthogonal operation authorization/hold field, currently exposed as the legacy
`Delivery Readiness` name; governance metadata expresses cross-cutting
controls; and runner execution state describes one operation. GitHub Projects
fields are a separate projection surface. Native GitHub Issue Types and
organization issue-field definitions are also separate organization
settings. Their configuration and visible pinning are not proved merely by
the existence of repository schemas or forms.

In Agentic Primitives, **primitive catalog**, **primitive release**, and
**primitive projection** refer to the versioned capability inventory, its
immutable source/digest, and a generated consumer copy. In Developer
Distribution, **distribution bundle**, **bootstrap**, and **consumer
projection** refer to versioned installation inputs and the controlled update
of thin repository integrations. A Primitive projection and a Distribution
bundle are not the same artifact.

## Changing the model

Treat language as part of the domain model. Update this register and affected
artifacts in the same change when a modeled concept is missing, a term changes
meaning, or a context boundary or translation changes. State the affected
contexts and terms in decision work. Use the canonical
[architecture-decision skill](https://github.com/agentic-delivery-lab/agentic-delivery-primitives/blob/e4933566fbf5b0f593830f8933f18fbd21024fa7/skills/architecture-decision/SKILL.md)
from the pinned Agentic Primitives baseline for significant or cross-cutting
changes. Review new context classifications against their authoritative
contracts instead of assuming that a repository boundary proves a separate
domain model.

An `avoid` entry is context-specific review guidance. Exact names from
external systems and identifiers remain unchanged; explain their context when
the difference could be ambiguous.

## Enforcement and evidence boundary

`tools/validate-domain-language.mjs` checks register structure, context
references, and duplicate or conflicting terms. These checks do not prove
semantic consistency. Reviewers must compare meaning with the bounded
context's contract and inspect the source revisions cited by the architecture
description. There is no repository-wide forbidden-word scan.

Agentic primitives carry concise metadata naming their ADR IDs and bounded
contexts. The generated traceability index derives relationships from a
pinned Primitive catalog and carries immutable owner metadata for external
ADRs. It is not an editable rationale map and does not copy ADR prose.

The evidence snapshot pins source commits and records live observations and
their limits. It is historical evidence, not an assertion that live settings
or runtime behavior remain unchanged after the observation date.

## Sources

- [Eric Evans, *Domain-Driven Design Reference* (2015)](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf): bounded contexts and context-scoped language.
- [ADR-0001](../../decisions/0001-use-madr-for-architecture-decisions.md) and [ADR-0003](../../decisions/0003-use-context-scoped-ubiquitous-language.md): decision and language policies.
- Control Plane decisions are owned in the Control Plane repository; immutable links and SHA-256 values are in [`adr-owner-projection.yml`](../references/adr-owner-projection.yml).
- [ADP-0001](https://github.com/agentic-delivery-lab/agentic-delivery-primitives/blob/e4933566fbf5b0f593830f8933f18fbd21024fa7/docs/decisions/ADP-0001-primitive-release-and-projection.md) and its pinned catalog define the Primitive context.
- [ADD-0001](https://github.com/agentic-delivery-lab/agentic-delivery-distribution/blob/b69c5710928b47efc4d3ab12ec4d5b596c80720c/docs/decisions/ADD-0001-distribution-boundary.md) and its pinned bundle define the Distribution context.
