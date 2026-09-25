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

- `architecture/arc42/NN-title.md` chapters follow the pinned arc42 template;
  `architecture/arc42/README.md` records chapter concerns and evidence rules.
- ADR, ADP, and ADD records use the shared MADR base structure in
  `decisions/adr-template.md`; their stable identifier prefixes are part of
  their identity.
- `architecture/contracts/` owns per-family JSON Schema Draft 2020-12
  contracts for authoritative and generated structured Architecture data.
  Cross-file integrity and context-semantic review remain separate checks.
- `architecture/principles/index.yml` assigns stable principle identities.
- `architecture/domain/` owns bounded contexts and terminology.
- `architecture/models/workspace.dsl` is the canonical C4 model source;
  `architecture/diagrams/` contains supporting Mermaid/PlantUML views and
  generated review output.
- `architecture/generated/` contains derived release and traceability output.
- `architecture/references/primitive-catalog.lock.yml` is a pinned generated
  projection from the Primitive release; it is not an editable Primitive
  implementation or second catalog.

## Required validation

Run `pnpm architecture:check`, `pnpm migration:check`, and `pnpm test` before proposing a change.
The architecture check validates arc42 structure, ADR/MADR records, domain
language, contracts, and regenerated ADR-to-Primitive traceability.
Architecture releases, cross-repository references, and ADR changes require a
review pull request. A consumer may read this repository at an immutable
commit but must not write to it during runtime review.
