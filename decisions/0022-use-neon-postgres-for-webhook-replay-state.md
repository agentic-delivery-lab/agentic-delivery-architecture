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
key. The gateway must record the delivery before it calls
`repository_dispatch`. GitHub does not automatically redeliver failed webhook
deliveries, so the system must own retry and recovery rather than treating a
5xx response as an automatic retry request.

Control Plane [issue #60](https://github.com/agentic-delivery-lab/agentic-delivery/issues/60)
identified a shared, durable replay store as a prerequisite to webhook
activation. The original proposal, tracked by Architecture
[issue #5](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/5),
selected Neon Postgres and required storing only the replay key and expiry.
Control Plane [issue #64](https://github.com/agentic-delivery-lab/agentic-delivery/issues/64)
implements that provider decision.

Review of Control Plane [PR #83](https://github.com/agentic-delivery-lab/agentic-delivery/pull/83)
identified a correctness gap in the key-and-expiry-only contract. Neon can
commit an insert while the HTTP response to the function is lost. The function
then returns an error before dispatching. On redelivery, the existing row is
treated as a completed duplicate and the event is acknowledged without ever
reaching the controller. The same ambiguity can arise at the external dispatch
boundary: GitHub may accept a dispatch while its response is lost. The P1
[review finding](https://github.com/agentic-delivery-lab/agentic-delivery/pull/83#discussion_r4173017841)
therefore requires recovery state and idempotent handling at the receiving
controller. GitHub's documented recovery path is to list failed deliveries
and request redelivery through the GitHub App webhook API; that operation
requires a short-lived JSON Web Token (JWT) signed by the App and must run on a
schedule.

This amendment retains Neon as the provider and replaces the key-and-expiry-
only constraint with a minimal delivery state contract. It does not provision a
database, add credentials, change deployment settings, or activate the webhook.

## Decision Drivers

- A delivery whose claim or dispatch result is uncertain must remain retryable;
  it must not be acknowledged as completed.
- Recovery must be initiated by this system because GitHub does not
  automatically redeliver failed webhook deliveries.
- Concurrent attempts for one delivery must not dispatch concurrently.
- Repeated dispatches after an ambiguous downstream response must not create
  duplicate controller work.
- Retain the existing five-minute replay window unless new evidence supports a
  change.
- Fail closed on storage errors while returning a retryable response for
  incomplete or leased work.
- Persist only the delivery identity and bounded operational state needed for
  recovery. Do not persist event bodies, credentials, private keys, or model
  output.
- Keep Neon as the shared primary and retain the existing storage-adapter
  boundary where practical.

## Considered Options

- Keep only the replay key and expiry and treat any existing key as completed.
- Store minimal delivery state and a bounded dispatch lease; use a scheduled
  GitHub App delivery reconciler and make the controller idempotent by delivery
  ID.
- Add a durable outbox and a separate dispatcher, with idempotent handling at
  the controller.

## Decision Outcome

Chosen option: **Keep Neon, add minimal delivery state, and run a scheduled
GitHub App delivery reconciler with duplicate-safe controller handling.** A
reconciler is a scheduled job that checks delivery history and asks GitHub to
send failed deliveries again. The database record must distinguish incomplete
work from a completed dispatch. It may contain the installation/delivery key,
expiry, dispatch state, and lease expiry; it must not contain the event body or
credentials. A saved scan checkpoint lets the reconciler page through recent
GitHub App webhook deliveries, find failed attempts, and request redelivery
with an App JWT.

The Control Plane implementation must enforce these transitions atomically
against the Neon primary:

1. Create or reclaim a delivery record and acquire a bounded lease (a
   short-lived ownership lock) before dispatch. Only the lease holder may call
   `repository_dispatch`.
2. Treat a delivery with an active lease as in progress and return a retryable
   response, not a successful duplicate response. The scheduled reconciler
   must request redelivery for failed attempts; GitHub will not retry them
   automatically.
3. Mark a delivery complete only after GitHub confirms the dispatch and the
   completion state is durably recorded. A completed delivery may be
   acknowledged as a duplicate.
4. On a definite dispatch failure, make the delivery retryable. On an
   ambiguous outcome, keep it incomplete until the lease expires; do not infer
   success from the existence of a replay key. The scheduled reconciler must
   use GitHub's App webhook delivery API, page with a persisted checkpoint and
   overlap, and request redelivery for failed attempts with bounded retry
   behavior.
5. Use the stable GitHub delivery ID to prevent duplicate controller work.
   The controller must durably recognize a repeated delivery and resume
   incomplete work or ignore work already accepted. A runner-local marker
   alone does not prove recovery after an interrupted run or across multiple
   runners.
6. Persist reconciler progress only after a page has been examined and its
   redelivery requests have been accepted. A repeated scan must be safe and
   must not lose a failed delivery when the reconciler exits partway through a
   page.

This provides retryable delivery. GitHub may send the same delivery again, but
the controller must use its delivery ID to create at most one work item and
resume incomplete work. The database and GitHub API do not share one atomic
transaction, so the system does not promise exactly-once delivery. The
scheduled reconciler and controller's durable delivery record are required
parts of the contract. The implementation must keep the five-minute replay
window and fail closed when Neon is unavailable.

### Consequences

- Good, because an uncertain claim remains retryable instead of silently
  suppressing the GitHub redelivery.
- Good, because a lease prevents concurrent gateway attempts from dispatching
  the same delivery at once.
- Good, because a durable controller record for the delivery ID makes
  repeated dispatch safe when the external API response is ambiguous.
- Good, because the scheduled reconciler closes the recovery gap left by
  GitHub's lack of automatic retries for failed webhook deliveries.
- Good, because the database still stores only delivery identity and bounded
  operational metadata, not event contents or credentials.
- Bad, because the schema and adapter now manage delivery status, lease
  expiry, and retry responses in addition to the replay window.
- Bad, because the reconciler needs App-level JWT access to list and redeliver
  webhook events, plus a durable scan checkpoint and scheduled execution.
- Bad, because a repeated external dispatch is possible after an ambiguous
  response; the controller's durable idempotency behavior must be implemented
  and verified before production activation.
- Bad, because lease expiry adds retry delay after a function or network
  failure.
- Neutral, because Neon availability, network access, and pooled connection
  capacity remain dispatch dependencies. The handler must fail closed while
  storage is unavailable.

### Confirmation

The Control Plane implementation must demonstrate, with an isolated Neon
database, receiver tests, and a scheduled reconciler, that:

- one concurrent attempt holds a lease and other attempts receive a retryable
  response;
- a database commit followed by a lost HTTP response is recovered by a later
  delivery attempt rather than acknowledged as complete;
- expired leases can be reclaimed and completed deliveries are acknowledged as
  duplicates;
- a failed or ambiguous dispatch remains retryable;
- failed GitHub App webhook deliveries are found through paginated scans and
  redelivered from a durable checkpoint, including after a reconciler
  interruption;
- repeated dispatches with one delivery ID do not start duplicate controller
  work and can resume interrupted work;
- storage failures prevent dispatch; and
- the schema contains only delivery identity, expiry, status, and lease
  metadata, never event contents or credentials.

Live database and deployment evidence belongs to the separate implementation
and activation work. This ADR does not claim that those checks have run.

## Pros and Cons of the Options

### Key and expiry only

- Good, because the schema is small and stores little data.
- Bad, because an existing key cannot distinguish a completed dispatch from a
  claim whose commit response was lost before dispatch.
- Bad, because returning success for every existing key can suppress a valid
  redelivery.
- Bad, because GitHub does not automatically redeliver failed webhook
  deliveries.

### Minimal delivery state, lease, and scheduled GitHub delivery reconciler

- Good, because a pending or expired delivery can be retried without
  acknowledging it as complete.
- Good, because an active lease prevents two gateway attempts from dispatching
  concurrently.
- Good, because the controller can recognize duplicate external dispatches
  without claiming a distributed exactly-once transaction.
- Good, because the GitHub App API lets a scheduled reconciler request failed
  deliveries again without persisting webhook payloads in Neon.
- Bad, because the gateway and controller both need recovery-aware state and
  integration verification.
- Bad, because the reconciler requires App JWT credentials and reliable
  scheduling, pagination, checkpointing, and bounded retries.
- Bad, because a stale or overly long lease can delay a retry; lease duration
  and renewal behavior must be bounded and tested.

### Durable outbox and separate dispatcher

- Good, because accepting a delivery can be separated from calling GitHub and
  pending dispatches can be retried independently of the webhook request.
- Bad, because it requires storing enough event data to recreate a dispatch or
  adds another GitHub read path, which expands the data and privacy boundary.
- Bad, because it adds an outbox worker, monitoring, and operational
  complexity. It still needs controller idempotency because the GitHub API
  response can be ambiguous.

## More Information

- Original provider decision: Architecture
  [issue #5](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/5)
  and Control Plane [source issue #60](https://github.com/agentic-delivery-lab/agentic-delivery/issues/60).
- Recovery amendment: Control Plane
  [source issue #64](https://github.com/agentic-delivery-lab/agentic-delivery/issues/64)
  and Architecture [tracking issue #8](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/8).
- Implementation proposal: Control Plane
  [PR #83](https://github.com/agentic-delivery-lab/agentic-delivery/pull/83).
- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
  documents the pooled endpoint used by serverless applications.
- PostgreSQL documents atomic conflict handling in
  [`INSERT`](https://www.postgresql.org/docs/current/sql-insert.html).
- The [GitHub repository dispatch endpoint](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)
  is the external handoff boundary; dispatch retries therefore rely on the
  controller's delivery-ID idempotency contract.
- GitHub [does not automatically redeliver failed deliveries](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries).
  Its [GitHub App redelivery guide](https://docs.github.com/en/webhooks/using-webhooks/creating-a-script-to-automatically-redeliver-failed-deliveries-for-a-github-app-webhook)
  and [App webhook API](https://docs.github.com/en/rest/apps/webhooks) describe
  listing and requesting redelivery with an App JWT.
- This recovery amendment is provisional on the issue-linked Architecture
  branch. It becomes official only when its review pull request is merged to
  `main`. Production provisioning and activation remain separate, issue-linked
  work.
