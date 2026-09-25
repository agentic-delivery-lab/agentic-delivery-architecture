---
date: 2026-09-25
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/3
decision-makers: Not recorded in pinned source
consulted: Not recorded in pinned source
informed: Not recorded in pinned source
domains:
  - developer-distribution
required-enforcement:
  - instructional
---

# ADD-0001 — Distribution boundary

## Context and Problem Statement

The Distribution repository owns reproducible developer-environment and thin
consumer integration artifacts. It does not own lifecycle state, generic
orchestration, credentials, or canonical Primitive implementations.

## Decision Drivers

The pinned source does not separately record decision drivers.

## Considered Options

The pinned Distribution source record does not enumerate alternatives.

## Decision Outcome

The recorded outcome is the Distribution ownership and exclusions in the
Context and Problem Statement above.

### Consequences

The first release is draft because external image digests, Agent Plugin
support, and the supported VS Code Automation surface still require entitlement
and preview verification.

### Confirmation

The pinned source does not show that these verifications were completed; this
record makes no release-acceptance claim.

## More Information

The pinned Distribution source did not record a historical date, decision
participants, or source issue. The date and source issue in this frontmatter
identify this canonical record preparation; the source revision and original
content digest are retained in
[`decision-inventory.yml`](../architecture/references/decision-inventory.yml).
