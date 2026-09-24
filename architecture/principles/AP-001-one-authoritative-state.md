# AP-001 — One authoritative state

## Statement

Every durable fact has exactly one canonical owner. Other contexts may hold a
reference, projection, cache, or evidence record, but not an independently
editable authoritative copy.

## Goals and decision basis

This principle supports architecture goal G-01: keep each durable fact under
one owner and use references or controlled projections elsewhere. It is
grounded in Architecture ADR-0012 (GitHub work-state ownership), ADR-0013
(generated ADR-to-Primitive traceability), and ADR-0018 (cross-repository
release and distribution boundaries). These records are listed with their
canonical owners in [`decisions/README.md`](../../decisions/README.md).

## Consequences

- GitHub Issues and organization issue-field values are the canonical work
  state; Projects fields are a separate projection and do not replace it.
- Architecture owns cross-context principles, terminology, models, and ADRs.
  The Control Plane owns runtime lifecycle and authorized writes; Primitives
  own reusable capability definitions; Distribution owns bootstrap and
  consumer-bundle behavior.
- `.github` and `.github-private` own adapter artifacts at their respective
  public and private publication boundaries; neither owns a domain context.
- A consumer artifact or cross-repository reference identifies its source
  repository, immutable commit, and digest. External ADR projections also
  identify the canonical path and per-file digest; copied decision prose is
  not a projection.

These boundaries follow the current owner map and the pinned Primitive and
Distribution contracts. If source material does not establish a boundary,
the architecture records it as a proposal or evidence gap rather than an
operational fact.

## Evidence and current limits

Goal G-01 is described in [arc42 chapter 1](../arc42/01-introduction-and-goals.arc42.md).
The [system evidence snapshot](../references/system-evidence.yml) pins all six
repository sources, participant release pins, and the observed draft/shadow
state. It does not prove active end-to-end execution or current live settings
after 2026-09-24. The architecture release source commit and digest pin local
Architecture records; `adr-owner-projection.yml` pins external Control Plane
records by repository identity, commit, path, and SHA-256.
