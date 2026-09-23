# Changelog

All notable changes to this repository are documented here.

## [Unreleased]

### Changed

- Updated ADR-0018 to select one organization App installation with
  `All repositories` access and an independent reviewed participant registry;
  recorded live-configuration and activation evidence gaps without changing
  App settings.
- Marked the history-preserving Architecture extraction as published after
  verifying its public `main`, merged import, and active branch ruleset.

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
