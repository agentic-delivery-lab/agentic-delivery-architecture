---
date: 2026-09-06
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery/issues/7
decision-makers: Sjef Jenniskens
consulted: None
informed: None
domains:
  - agentic-delivery-governance
  - agentic-delivery-control-plane
  - agentic-primitives
  - developer-distribution
required-enforcement:
  - instructional
  - deterministic
---

# Use trunk-based delivery with short-lived feature branches

## Context and Problem Statement

Issue [#7](https://github.com/agentic-delivery-lab/agentic-delivery/issues/7) asks the repository to introduce trunk-based development. The repository needs a delivery model that keeps `main` deployable, gives a review pull request a clear head and base, and does not leave parallel branch histories to drift.

The repository is maintained by people and coding agents. Agents need an explicit boundary for branch creation, review and merge actions. A branch-local change is provisional until its review pull request is merged into `main`; the contents of `main` remain the official repository context.

The amendment requested by [Architecture issue #7](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/7) extends this policy to source workspaces and task artifacts across repositories and Codex execution profiles. Branch integration alone does not remove a linked checkout, scratch clone, or leaked test fixture. Workspace ownership and safe disposal must be explicit. The original source issue and decision date above retain the initial decision provenance; this amendment is proposed on 2026-10-09.

## Decision Drivers

- Keep `main` continuously integrable and deployable.
- Make review pull-request head and base unambiguous.
- Limit merge conflicts and stale branch context.
- Preserve a reviewable history for this governance repository.
- Keep merge and issue-closing authority with a human.
- Make the policy observable in local checks and CI where possible.

## Considered Options

- Trunk-based delivery with one `main` branch and short-lived feature branches.
- Gitflow with permanent `develop`, release and hotfix branches.
- Direct commits to `main` without a feature branch or review pull request.

## Decision Outcome

Chosen option: **Trunk-based delivery with one `main` branch and short-lived feature branches**, because it keeps integration frequent while retaining a review boundary for every change.

Contributors create a feature branch from the current `main`, open a review pull request with that branch as its head and `main` as its base, and merge only after checks and human review succeed. A feature branch should be completed within two calendar days. The repository does not create a permanent `develop` branch or a long-lived branch for ordinary feature work.

This repository uses merge commits for approved pull requests so the integration event remains visible in history. The repository settings disable squash merges, rebase merges and automatic merging. The contributor or agent may push the feature branch and open or update the review pull request, but only an explicitly authorized human may merge it or close its source issue. A merged head branch is deleted when the hosting service supports that setting.

The policy follows the [Trunk Based Development guidance](https://trunkbaseddevelopment.com/). The two-day target and merge-commit choice are local operating rules for this repository, not claims made by that source.

### Workspace lifecycle

[AP-003](../architecture/principles/AP-003-managed-workspace-lifecycle.md)
requires an owner, purpose, and final disposition for each source workspace and
task artifact. This lifecycle applies to local CLI sessions, automated runs,
and supported installed profiles. Instructions guide the agent; deterministic
checks authorize cleanup. A repository setting or scheduled janitor alone does
not implement the lifecycle.

1. **Discover:** inspect the common Git directory, every registered worktree,
   checked-out branches, local and remote-tracking refs with unique commits,
   status including untracked files, stashes, remote default branch, open pull
   requests, active workflow runs, and sessions using
   those paths or refs. Discovery is read-only. Unknown ownership blocks
   mutation of the affected item; report the evidence and its resolution gate.
Before any pruning pass, inventory remote-tracking refs that no longer exist on
the server. A stale ref may be the only reference preserving unique work. Prove
its commits are integrated or retained by an identified owned ref before pruning
it. If ownership or reachability is unknown, fetch without pruning and report
the blocked prune; do not delete the affected work.

2. **Start or resume:** fetch/prune under that preservation guard, confirm the source issue and branch identity,
   and select a clean base synchronized with the current remote default branch.
   Prefer a clean primary checkout for sequential work. Resume an existing task
   workspace when appropriate. When identified existing work requires isolation
   or work runs in parallel, create one linked worktree from the freshly fetched
   default-branch commit in the sibling topology below. Preserve primary local
   history and dirty files. Do not duplicate a workspace to evade unexplained
   dirty state or silently use it for another issue.
3. **Active:** retain one checked-out worktree per task branch, record the owning
   task/session and retention reason, and keep the existing two-calendar-day
   branch target. At stage handoffs, account for every pending change rather
   than claiming a clean workspace while changes remain.
4. **Complete:** after an approved merge, capture the actual merge commit, fetch
   and prune again, and prove that the exact feature tip is an ancestor of the
   current remote default branch. Recheck all worktrees, dirty/untracked files,
   active consumers, open pull requests and runs. Remove a completed clean linked
   worktree with normal `git worktree remove`, then its integrated local branch
   with normal `git branch -d`. Recheck the exact tip immediately before deleting
   any remote head; use an expected-tip guard so a concurrent update blocks
   deletion. Fetch/prune again, inspect any prunable registration before pruning,
   and record the final state. Keep the primary checkout and default branch.
5. **Abandon or retain:** a closed pull request, matching name, or age alone does
   not prove integration or authorize discard. Preserve unique commits, stashes,
   dirty or unknown untracked files, release/support branches, tags, and work
   used by another session. Explicitly discarded experiments require human
   disposal authorization and preservation of required operational evidence.
   Record each blocker and the condition allowing later removal; temporary
   preservation must not become an unexplained permanent backup branch.

The local topology is:

```text
<parent>/
├── <repo>/
└── <repo>.worktrees/
    └── <issue-linked-branch-with-slashes-replaced-by-hyphens>/
```

The `.worktrees` container is a sibling of the primary checkout, never a
subdirectory of it. Git supports linked worktrees but does not prescribe this
layout. Branch identity remains canonical; ADR-0007 defines its local filesystem
projection. Source worktrees and scratch clones must not live in `/tmp`.

Short-lived scratch and test data may use one dedicated temporary directory per
task. Track ownership and register teardown immediately after allocation,
including initialization failures, exceptions and cancellation where supported.
An abrupt process kill can prevent teardown; inspect residual ownership and
active use before later cleanup. Inspect untracked files individually and remove
only identified disposable artifacts. Never use blanket `git clean`,
`git reset --hard`, force branch/worktree removal, or recursive `/tmp` deletion
to satisfy a hygiene check. A guarded remote deletion is not a history rewrite;
it must reject a changed tip and does not permit force pushing rewritten history.

Evidence required by an unresolved incident belongs in a clearly named private,
durable state directory with restrictive permissions, an explicit retention
reason, and an exit condition. Preserve audit manifests, recovery records and
rollback inputs until that condition is satisfied. Do not touch another
account's files or an active process's artifacts. Ordinary scratch storage is
not an incident archive.

### Implementation ownership and rollout

- Architecture owns this lifecycle, terminology, AP-003 and conformance criteria.
- Agentic Primitives owns one reusable lifecycle inspection/guard contract and
  agent guidance; consumers must not grow unrelated copies of cleanup scripts.
- Developer Distribution installs pinned projections into supported profiles,
  including alternate Codex homes and service accounts, with provenance and
  rollback. A personal default-profile instruction does not cover those homes.
- The Control Plane applies the released contract to execution and runner-owned
  artifact producers. Producers must register teardown; a periodic cleanup job
  is an audit/recovery aid, not the primary disposal mechanism.

Implementation requires reviewed changes in the owning repositories and explicit
release/pin approval under their existing contracts. Architecture text does not
activate participants, grant credentials, change hosting settings, or prove
installation into every CLI session. Until those changes provide evidence,
organization-wide deterministic enforcement remains a target. Architecture
issue #7 remains open while its implementation and rollout criteria are unmet.

### Consequences

- Good, because `main` remains the single integration point and official source of truth.
- Good, because short-lived branches reduce divergence and make review scope clear.
- Good, because merge commits show when a review pull request entered `main`.
- Bad, because incomplete work needs a feature flag or another safe, reversible boundary.
- Bad, because contributors must keep a branch current and finish work promptly.
- Good, because completed workspaces and artifacts have a safe, observable final disposition.
- Bad, because proving ownership and concurrent-use safety adds checks, and unknown or unmerged work must sometimes remain.
- Neutral, because release branches remain possible when a future release needs stabilization.

### Confirmation

- `AGENTS.md`, the delivery skill and the pull-request template state that the feature branch is the pull-request head and `main` is the base.
- The delivery-quality workflow checks that new first-parent commits on `main` are merge commits and validates pull-request commit ranges.
- Repository settings allow merge commits, disable squash/rebase/automatic merging and delete merged head branches.
- Reviewers check branch age, head/base selection and human authorization before merging.

- Workspace conformance [QR-012](../architecture/quality/quality-scenarios.yml)
  requires no deletion of dirty, unmerged, unknown or active work; changed remote
  tips fail closed; completion leaves no owned disposable artifact without an
  explicit retention reason. Validate success, initialization failure,
  cancellation, dirty starts, concurrent consumers and deletion races in each
  implementation owner. These are acceptance criteria, not passed live checks.
- At task start, after approved integration and before the final response,
  record removed items, active items and preserved work with cleanup gates.

## Pros and Cons of the Options

### Trunk-based delivery with short-lived feature branches

- Good, because integration happens frequently and the branch lifetime is bounded.
- Good, because every change has a review pull request without introducing a second trunk.
- Bad, because contributors need disciplined small increments and feature flags for unfinished work.

### Gitflow with permanent `develop`, release and hotfix branches

- Good, because release stabilization can be separated from feature integration.
- Bad, because permanent branches add merge points and allow context to become stale.
- Bad, because the repository has no release process that justifies the extra long-lived branches.

### Direct commits to `main`

- Good, because it has no branch-management overhead.
- Bad, because it removes the review pull-request boundary and makes agent authorization unsafe.
- Bad, because a mistake immediately changes the official source of truth.

### Workspace disposal alternatives

- Ban all temporary directories: rejected, because short-lived scratch and test
  isolation needs temporary storage; the FHS explicitly provides `/tmp` for it.
- Allow ad hoc clones and periodic sweeping: rejected, because age does not prove
  ownership, integration or disposal authority, and producers can keep leaking.
- Managed workspace lifecycle with producer teardown: chosen, because it permits
  necessary isolation while preserving work and bounding disposable state.

## More Information

- Assignment brief: [GitHub issue #7](https://github.com/agentic-delivery-lab/agentic-delivery/issues/7)
- Amendment: [Architecture issue #7](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/7)
- Temporary storage: [FHS /tmp](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch03s18.html)
- Linked worktrees: [Git documentation](https://git-scm.com/docs/git-worktree)
- Source: [Trunk Based Development](https://trunkbaseddevelopment.com/)
- Related decisions: [ADR-0001](0001-use-madr-for-architecture-decisions.md), [ADR-0003](0003-use-context-scoped-ubiquitous-language.md)
- Delivery guidance: [`docs/delivery/README.md`](../delivery/README.md)
- Revisit this decision when the repository needs a release branch, a second integration trunk or a different merge authority.
