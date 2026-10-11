# Changelog

All notable changes to this repository are documented here.

## [Unreleased]

### Changed

- Following independent review, clarified that Architecture PR #14 is merged
  but its independent human review remains unverified, so Control Plane #106's
  review/merge gate is still open. Clarified PR #109's offline router coverage
  separately from composed/live Project-runtime coverage and advanced the draft
  Architecture pin to 0.1.0-draft.37.

- Rechecked Architecture #11's Projects and Issue evidence at 2026-10-11
  19:33 UTC: no Project is visible across the organization, viewer, or six
  repository scopes; 23 open Issues have no Project associations or Issue
  Field Values. Updated current arc42 and strategy evidence, clarified that
  Architecture #14 is merged while independent human review is unverified, and
  advanced the draft Architecture pin to 0.1.0-draft.36. No Project or runtime
  configuration changed.

- Refreshed Architecture #11's read-only Projects, Issue metadata, App,
  Actions, ruleset, release, and open-PR evidence through 2026-10-11 19:14 UTC.
  The organization, viewer, and all six repository scopes expose no Projects;
  all 23 open Issues have no Project items or Issue Field Values. Nine native
  Issue Types and six organization-members-only fields remain inventoried.
  Control Plane #104 is merged with its changelog entry present; the current
  CHANGELOG.md conflict is on open PR #86. Architecture #17 validation passes
  at its exact draft head. No live configuration changed.

- Recorded the 07:17 UTC exact-head recheck for Architecture PRs #16 and #17.
  Both hosted validations passed; #16 remains blocked pending human review,
  and draft #17 now includes the corrected #16 head without live configuration
  changes. The draft source pin requires a merge commit or a later repin.

- Refreshed Architecture #11's read-only Project, Issue, release, and pull-
  request evidence at 2026-10-11 06:46 UTC. Organization, viewer, and six-
  repository inventories found no visible Projects or Project items among 23
  open Issues. Architecture #16 is blocked on human review; draft #17 and
  Control Plane #109/#110 remain open without review decisions; #106 remains
  gated on an approved Architecture release. No GitHub Release or live
  issue-to-PR delivery is evidenced, and no Project or runtime setting changed.

- Clarified Project membership and portfolio-planning ownership, and made
  product-repository bootstrap precede product Issues in a new repository.

- Amended ADR-0004 and ADR-0007 with managed workspace ownership, safe exact-tip cleanup, sibling worktree topology and failure-safe artifact teardown; registered AP-003 and QR-012, with profile rollout retained as implementation debt (Architecture #7).

- Amended ADR-0022 with recovery for ambiguous Neon writes, a scheduled
  GitHub App failed-delivery reconciler, and durable controller idempotency.
  GitHub does not automatically redeliver failed webhook deliveries; the
  amendment keeps event bodies and credentials out of Neon.

### Added

- Refreshed Architecture [Issue #12](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/12)'s read-only GitHub Projects and Issue inventory at 2026-10-10 23:53 UTC, including current repository refs, open pull requests, release state, organization Issue Fields, and App permission limits. No Project or live configuration was changed.

- Proposed ADR-0022 to use Neon Postgres for durable webhook replay claims.
  The decision records the provider and replay-store constraints only; it does
  not provision a database or activate the webhook.
- Allowed each proposed inventory record to link its own Architecture tracking
  issue, separate from the issue that introduced the canonical inventory.
- Proposed per-family Architecture naming, template, and structured-data
  contracts with pinned schema validation.

### Changed

- Renamed the twelve arc42 chapter files to the documented `NN-title.md`
  pattern and routed all Architecture decision families through the shared
  MADR base structure.

### Removed

- Removed the copied Control Plane evidence schema and the unreferenced
  duplicate bounded-context UML model.

### Changed

- Centralized all 19 active ADRs, ADP-0001, and ADD-0001 in Architecture
  Authority as the proposed canonical text set. Preserved
  bounded-context metadata, routed semantic review through evidence-backed
  context steward repositories, and recorded imported and differing historical
  source hashes without a second prose projection.
- Added issue-linked ADR scope review before each non-draft Architecture release
  and at least annually, with explicit triggers and evidence fields. Each formal
  ADR/ADP/ADD gets an organization-wide, cross-context, or context-specific
  proposed scope; local candidates are marked local-only or promoted, with
  consumer impact and steward review status recorded for human semantic review.
  Durable one-context architecture decisions may be promoted without claiming
  cross-context impact; routine or transient implementation details stay local.
- Bumped the Architecture release manifest to schemaVersion 2 and contract
  `4.0.0`; it pins the exact ADR/ADP/ADD decision ID set and the new artifact
  family contract while retaining the normalized sourceCommit/contentSha256
  digest algorithm. Consumers must dispatch by version and adopt it in their
  own gated phase.
- Added per-family Draft 2020-12 schemas for all authoritative and generated
  Architecture structured data, with pinned YAML, Ajv, and format packages.
- Bumped the generated ADR/Primitive index to v3. Every Primitive ADR
  reference must resolve to one local Architecture ADR; external text
  projections are forbidden.
- Updated ADR-0018 to select one organization App installation with
  `All repositories` access and an independent reviewed participant registry;
  recorded live-configuration and activation evidence gaps without changing
  App settings.
- Marked the history-preserving Architecture extraction as published after
  verifying its public `main`, merged import, and active branch ruleset.

### Fixed

- Verified imported source bytes with `git show` at pinned source commits and
  recorded the two relative-link corrections required by relocating ADR-0008
  and ADR-0009 into the Architecture decision directory.
- Replaced the missing local architecture-decision skill link with the
  immutable canonical Primitive skill source.

### Added

- Added Architecture draft release `0.1.0-draft.8`, documenting the separate
  HMAC authentication boundary for the webhook-to-controller dispatch hop.

- Added Architecture draft release `0.1.0-draft.7`, rebinding the generated
  Primitive traceability projection to the filtered main-snapshot Primitive
  candidate and updating the reproducible Architecture content digest; draft6
  remains the explicit rollback release.

- Added Architecture draft release `0.1.0-draft.6` with a non-null,
  reproducible content digest, explicit ADR and bounded-context identifiers,
  and integrity pins for the conformance policy and tooling lock. Draft5
  remains the explicit rollback release.

- Added Architecture draft release `0.1.0-draft.4`, updating the generated
  Primitive traceability index to Primitive release `0.1.0-draft.4`.

- Added Architecture draft release `0.1.0-draft.3`, updating the generated
  Primitive traceability index to Primitive release `0.1.0-draft.3`.

- Added Architecture draft release `0.1.0-draft.2`, whose generated
  Primitive traceability index pins Primitive release `0.1.0-draft.2` and its
  canonical content digest.

- Added a deterministic SHA-256 Architecture content digest and made the
  conformance request require that digest for the pinned Architecture tree.

- Added the history-preserving Architecture Authority extraction, arc42
  chapter structure, principles, bounded-context model, contracts, diagrams,
  risks, and deterministic validation scaffold.
