# AP-002 — Deterministic enforcement after semantic proposal

## Statement

Semantic reasoning may propose an action, but deterministic validation must
authorize the action before any lifecycle, issue, branch, publication, or
credential-sensitive mutation occurs.

## Consequences

The controller records the proposal, contract versions, validator results, and
evidence links. Model output is untrusted until the deterministic gate passes.
