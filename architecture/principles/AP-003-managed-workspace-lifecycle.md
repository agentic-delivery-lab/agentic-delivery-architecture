# AP-003 — Managed workspace lifecycle

## Statement

Every source workspace and task artifact has an explicit owner, purpose and
final disposition. Cleanup requires evidence that no retained or active work
will be lost.

## Goals and decision basis

This principle supports G-01 (one authoritative owner), G-02 (deterministic
validation before mutation) and G-04 (contracts distinguished from evidence).
[ADR-0004](../../decisions/0004-use-trunk-based-delivery.md) defines the lifecycle
under the existing trunk-based policy; [ADR-0007](../../decisions/0007-use-issue-linked-conventional-branch-names.md)
defines the directory projection of canonical branch identity. The amendment
source is [Architecture issue #7](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/7).

## Consequences

- Prefer a clean primary checkout for sequential work; use a managed sibling
  linked worktree for necessary isolation or parallel work. Source workspaces
  stay out of temporary storage and keep one integration trunk.
- Prove exact-tip integration against the freshly fetched remote default branch,
  check every registered worktree and active consumer, and guard concurrent
  remote updates before deleting completed clean work.
- Inventory stale remote-tracking refs before pruning and preserve refs that
  uniquely retain work until safe disposition is established.
- Coordinate session use and cleanup through ownership leases; hold an exclusive
  cleanup lease across final checks and removal, blocking new consumers. Keep
  active Git worktree locks owner-identified and preserve unknown owners.
- Preserve dirty, unmerged, unknown or active work. Age and pull-request closure
  are insufficient evidence. Record retention reasons and removal conditions.
- Scratch/test producers register teardown immediately, including initialization
  and failure paths. Durable incident evidence uses private state storage with
  an explicit retention gate. A janitor cannot replace producer teardown.
- Primitives owns reusable checks and agent guidance; Distribution installs
  pinned profile projections; the Control Plane applies them to execution and
  runner-owned artifacts. Architecture owns the policy and conformance criteria.

## Evidence and current limits

The source issue records recurring stale branches/worktrees and dirty starts.
The immutable Control Plane source at
[`67e5941a9bb594cab5c9cd2da0bead4caa7b6bbf`](https://github.com/agentic-delivery-lab/agentic-delivery/blob/67e5941a9bb594cab5c9cd2da0bead4caa7b6bbf/tests/delivery/package-policy.test.mjs)
creates `agentic-delivery-toolchain-*` test fixtures in `createProject` without
registering teardown; its `withRegistry` helper does register cleanup. This is
producer evidence, not proof of complete machine inventory or remediation.
[QR-012](../quality/quality-scenarios.yml) defines the target conformance scenario.
The policy and personal instructions do not prove installation or deterministic
enforcement in alternate Codex homes, service accounts or every consumer. Those
claims require reviewed implementation, pinned distribution and run evidence.
