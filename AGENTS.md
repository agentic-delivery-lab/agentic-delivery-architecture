# Architecture Authority

## Mission

This repository is the single architectural authority for the Agentic Delivery
domain. It contains architecture decisions, principles, bounded contexts,
models, views, quality requirements, risks, technical debt, and conformance
contracts.

## Boundaries

- Keep runtime lifecycle, routing, orchestration, credentials, and GitHub
  mutation in the Delivery Control Plane.
- Keep reusable agents, skills, hooks, validators, and MCP contracts in
  Agentic Primitives.
- Keep member publication and Copilot projections in `.github-private`.
- Keep generated views derived from text or model sources; never make a
  rendered image the only source.

## Authoritative sources

- arc42 chapter files are the documentation structure.
- MADR records are the individual decision records.
- `architecture/principles/index.yml` assigns stable principle identities.
- `architecture/domain/` owns bounded contexts and terminology.
- `architecture/models/` and `architecture/diagrams/` own model sources.
- `architecture/generated/` contains derived release and traceability output.

## Required validation

Run `pnpm architecture:check` and `pnpm test` before proposing a change.
Architecture releases, cross-repository references, and ADR changes require a
review pull request. A consumer may read this repository at an immutable
commit but must not write to it during runtime review.
