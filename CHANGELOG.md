# Changelog

All notable changes to this repository are documented here.

## [Unreleased]

### Added

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
