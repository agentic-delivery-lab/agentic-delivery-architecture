---
date: 2026-09-29
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery/issues/60
decision-makers: Sjefsharp (repository maintainer)
consulted: None
informed: None
domains:
  - agentic-delivery-control-plane
required-enforcement:
  - deterministic
  - semantic
---

# Use Neon Postgres for webhook replay state

## Context and Problem Statement

The delivery controller receives GitHub webhook deliveries through Vercel
Functions. It uses the installation ID and GitHub delivery ID as the replay
key. After authentication and authorization succeed, the gateway claims that
key just before `repository_dispatch` and releases it if dispatch fails. The
[replay protection contract](https://github.com/agentic-delivery-lab/agentic-delivery/blob/9c59fa0ce4d47bdef4c659c0e5681f5598280574/docs/delivery/replay-protection.md)
defines the five-minute replay window and the data that a claim may store.

The current file-backed store supports one process or a shared filesystem.
Vercel Functions can run across separate instances, so the production gateway
needs one durable, shared store that can atomically grant a claim. Control
Plane [issue #60](https://github.com/agentic-delivery-lab/agentic-delivery/issues/60)
records this as a prerequisite to webhook activation.

This decision selects the managed database provider for the replay store. It
does not provision a database, add runtime code or credentials, change
deployment settings, or activate the webhook.

## Decision Drivers

- Concurrent function invocations must not both claim the same delivery.
- Claims must be shared across instances and survive process restarts.
- Existing replay expiry and dispatch-failure release behavior must remain
  intact.
- The handler must fail closed when durable replay state is unavailable.
- Store only the installation/delivery key and expiry, not event contents or
  credentials.
- Use a connection model suitable for serverless function invocations.

## Considered Options

- Neon Postgres with a pooled connection endpoint.
- Upstash Redis with an expiring, atomic set-if-absent operation.
- Supabase Postgres.
- In-memory or local/file state, and object or artifact storage.

## Decision Outcome

Chosen option: **Neon Postgres**, using its pooled connection endpoint from the
serverless gateway. A unique constraint and an atomic insert/conflict operation
provide one authoritative claim across concurrent invocations. The adapter
must treat an unexpired claim as a duplicate, reclaim an expired claim
atomically, and release a claim when dispatch fails. It must retain the
existing five-minute replay window, store only the permitted key and expiry,
and fail closed when Neon is unavailable. PostgreSQL documents the relevant
atomic conflict handling in [`INSERT`](https://www.postgresql.org/docs/current/sql-insert.html);
Neon documents pooled connections for applications with many concurrent
connections in its [connection-pooling guide](https://neon.com/docs/connect/connection-pooling).

The choice favors one durable Postgres primary for the claim operation. It
does not rely on replica reads to decide whether a delivery has already been
claimed.

### Consequences

- Good, because a database unique constraint gives the adapter a clear
  cross-instance atomic claim rule.
- Good, because the existing `replayStore` boundary can keep provider details
  out of webhook routing and authorization logic.
- Good, because retaining only the replay key and expiry limits the stored
  event data.
- Bad, because webhook handling now depends on Neon availability, network
  access, and connection-pool capacity. The required fail-closed behavior can
  pause dispatch while the store is unavailable.
- Bad, because Postgres does not remove expired rows automatically; the
  implementation must reclaim expired claims atomically and keep storage
  bounded.
- Neutral, because the deployment must store and rotate a database connection
  secret. This ADR does not configure that secret.

### Confirmation

The Control Plane implementation change must use the existing `replayStore`
adapter boundary and demonstrate that concurrent duplicate deliveries yield
one claim, expired claims can be retried, a failed dispatch releases its
claim, and a storage failure stops dispatch. It must also verify that no event
body or credential is persisted. Runtime tests and deployment verification
belong to that separate implementation work; this ADR does not claim they have
run.

## Pros and Cons of the Options

### Neon Postgres

- Good, because a unique index and atomic insert/conflict handling express
  the claim invariant in the database.
- Good, because Neon provides a pooled endpoint documented for concurrent
  application connections.
- Bad, because this adds a managed database dependency, connection secret,
  pool limits, and cleanup work for expired rows.
- Bad, because a Neon or network outage blocks webhook dispatch under the
  existing fail-closed contract.

### Upstash Redis

- Good, because an expiring set-if-absent operation is a direct fit for a
  short-lived replay claim.
- Bad, because its documented asynchronous replication requires the
  deployment to account for replica reads and failover behavior. A
  primary-only claim path could be viable, but that consistency mode would
  need to be pinned and verified.
- Neutral, because Redis is purpose-built for short-lived keys but would add a
  separate managed service.

### Supabase Postgres

- Good, because PostgreSQL uniqueness and conflict handling support the same
  atomic claim model.
- Bad, because it introduces another managed platform integration without a
  requirement here that distinguishes it from Neon.

### In-memory, local/file, object, or artifact storage

- Bad, because in-memory and local/file state do not provide shared durable
  claims across independent function instances.
- Bad, because object and CI artifact storage have not been selected or
  verified as a synchronous atomic create-if-absent claim service.

## More Information

- The Architecture proposal and ADR tracking issue is
  [Architecture issue #5](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/5).
- The source work remains [Control Plane issue #60](https://github.com/agentic-delivery-lab/agentic-delivery/issues/60).
- [Vercel Functions](https://vercel.com/docs/functions) documents the
  invocation and scaling model relevant to a shared store.
- [Upstash Redis consistency](https://upstash.com/docs/redis/features/consistency)
  documents asynchronous replication and eventual consistency behavior.
- Revisit this choice if workload, availability targets, connection behavior,
  or provider limits show that Neon cannot meet the replay contract.
- This record is provisional on its feature branch. A merged Architecture PR
  is required before it becomes an official decision. Production provisioning
  and activation remain separate, issue-linked work.
