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
- One organization portfolio Project with separate views for the two value
  streams is the proposed minimum topology. The current inventory found no
  Project, while the organization API reports organization and repository
  Project capability. Project ownership, field visibility, and any required
  access configuration must be reviewed before a specific Project is selected
  or configured.
- Evaluation findings and factory-improvement suggestions become Issues.
  People prioritize those Issues in Projects before any new execution begins.
- Project automation, App permissions, and Project configuration require
  separate owner implementation and review. This principle grants no live
  access or write permission.

## Evidence and current limits

The organizational strategy is a proposal linked to Architecture Issue #11.
The initial 2026-10-09 live audit lacked Project access. The latest complete
read-only GraphQL recheck, at 2026-10-12 04:59 UTC, found no Project in the
authenticated-viewer, organization, or six repository scopes and no Project
association on any of the 61 Issues. The separate full inventory at
2026-10-11 22:57 UTC found empty Issue Field Values on all 23 then-open Issues,
six organization-members-only Issue Fields, nine native Issue Types, and
Free-plan support for organization and repository Projects. Organization-only
fields do not appear in public or internal Projects; suitability for a future
private Project has not been verified. Neither query covers Projects outside
those scopes or establishes GitHub App access. See
`system-evidence.yml#portfolio-project-issue-association-recheck-20261012-0459`
and `system-evidence.yml#portfolio-issue-project-inventory-20261011-2257`.
The principle does not claim an implemented or passing live integration.
