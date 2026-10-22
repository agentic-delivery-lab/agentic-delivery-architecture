# AP-004 — Projects plan; Issues authorize

## Statement

GitHub Projects is the primary portfolio planning, prioritization,
coordination, and progress-visibility surface. A source Issue in its owning
repository remains the canonical work record and the only source of execution
authorization.

## Goals and decision basis

This principle supports Architecture goals G-01, G-02, and G-04. It applies
ADR-0012's Issue lifecycle and authorization boundary to the required
portfolio role of Projects, and preserves ADR-0019's canonical Delivery State
terminology and migration constraints as clarified by ADR-0023. The
organizational strategy identifies two value streams:
Factory Evolution and Software Product Delivery.

## Consequences

- A Project-only card can be prioritized and discussed but cannot dispatch an
  agent or authorize any repository or Issue mutation. A maintainer first
  creates or links the source Issue, then normal identity, permission, policy,
  schema, and transition gates apply.
- Project-owned facts such as cross-repository sequencing remain distinct
  from Issue-owned intent, Issue Type, Priority, Lifecycle Stage, canonical
  Delivery State (currently displayed as legacy Delivery Readiness), and
  runner state. Project fields do not silently duplicate Issue fields.
- Project dependency fields express portfolio planning intent only. Execution
  dependency gates remain owned by the source Issue and Control Plane
  contract.
- Private organization portfolio #2 now has separate value-stream views under
  the owner-delegated configuration recorded by Architecture #15. Its API
  readback proves the initial configuration scope; App access and runtime
  planning-context admission remain separate gates.
- Evaluation findings and factory-improvement suggestions become Issues.
  People prioritize those Issues in Projects before any new execution begins.
- Project automation, App permissions, and Project configuration require
  separate owner implementation and review. This principle grants no live
  access or write permission.

## Evidence and current limits

The organizational strategy is a proposal linked to Architecture Issue #11.
The historical empty inventories remain in system evidence. On 2026-10-21,
private portfolio #2 was configured and independently read back with 19 factory
Issue items and no product items. Native Issue Priority is not exposed in its
field connection and was not duplicated. Browser rendering and explicit board
grouping were withdrawn from initial configuration acceptance; the supported
API query records the alternative. No App access or passing live delivery
integration is inferred. See the
[current gap matrix](../references/strategy-foundation-gap-matrix.md) and
`system-evidence.yml#portfolio-owner-delegated-configuration-20261021`.
