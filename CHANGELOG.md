# Changelog

All notable changes to this repository are documented here.

## [Unreleased]

### Changed

- W02/W07 clarifies the bounded interactive operator field-canary disposition
  in ADR-0012 and ADR-0018. Exact identities, reviewed source/private bindings,
  before/write/restore readbacks and evidence limits are required. Ordinary
  lifecycle transition gates, runner exclusions and separate active admission
  remain in force.

- Review corrections for W04 require Requirements reference `1.0.0` under
  Architecture release contract `5.0.0`, reject non-ancestral prepared release
  sources, honor explicit approved QR selections alongside proposed records,
  and recognize equivalent QR/quality-requirement authority wording. Regression
  tests cover each boundary; previous contract artifacts retain immutable
  historical schemas/readers rather than being silently reinterpreted.

- W04 adopts an immutable approved Requirements baseline for normative QR
  ownership. All original QR IDs, scenario text and historical status/evidence
  remain available through an exact checked projection; direct local edits,
  draft/withdrawn inputs, origin mismatch and digest tampering fail validation.
  Five inferred execution obligations remain proposed in Requirements; no
  strategy-goal adoption, live satisfaction or participant activation is claimed.

- Added ADR-0024 for W03's owner-selected public Requirements Authority.
  Approved requirements and their immutable applicability baselines have one
  owner; Architecture retains organizational decisions and models. W04 owns
  the separate QR cutover, with original IDs and evidence preserved and no
  automatic adoption of generated drafts or live-satisfaction claims.

- Reconciled W02 development authority in ADR-0009, ADR-0018 and strategy:
  `sjefsharp` and the owner-authorized interactive Codex CLI may exercise
  scoped development acceptance and administration; the self-hosted runner
  receives none of that delegation. Operator acceptance, independent review,
  separate validation, adoption and activation remain distinct evidence.
  ADR-0009 retains its immutable historical origin with an exact declared
  canonical amendment; undeclared additions fail inventory validation.

- Clarified Architecture #11 / W01: the factory is a product and acceptance
  subject. Proposed Milestone A requires useful governed self-development
  across seven target surfaces; Milestone B adds real independent-product
  ownership, reuse, and observed usefulness. Administrative bootstrap and
  successful checks alone cannot establish either milestone. Strategy and
  goals remain proposed, with active delivery gated on admitted safety and
  authority rather than prior independent-product delivery.

- Amended ADR-0004 and ADR-0007 with managed workspace ownership, safe exact-tip cleanup, sibling worktree topology and failure-safe artifact teardown; registered AP-003 and QR-012, with profile rollout retained as implementation debt (Architecture #7).

- Amended ADR-0022 with recovery for ambiguous Neon writes, a scheduled
  GitHub App failed-delivery reconciler, and durable controller idempotency.
  GitHub does not automatically redeliver failed webhook deliveries; the
  amendment keeps event bodies and credentials out of Neon.

### Added

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
