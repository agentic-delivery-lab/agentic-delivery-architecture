# Agentic Delivery Architecture Authority

This repository is the architectural authority for the `agentic-delivery-lab`
organization. It uses arc42 for the architecture narrative, MADR for
individual decisions, TOGAF-style principles for durable policy, and
ISO/IEC/IEEE 42010 terminology where stakeholders, concerns, viewpoints, and
views need to be distinguished.

The architecture is deliberately reference-oriented. ADRs retain their
rationale, section 09 indexes them, the domain register remains machine
readable, and diagrams retain model sources next to generated views. The
ADR-to-Primitive index is derived from a pinned Primitive release projection;
this repository does not import Primitive implementation merely to document
that relationship.

This is the published, public Architecture Authority repository. Its initial
history-preserving extraction and validator changes are integrated on `main`.
The active `Require reviewed main` ruleset protects the default branch. The
Architecture release remains a draft until its tooling lock, content digest,
and release metadata have been reviewed and promoted.

## Checks

```text
pnpm architecture:check
pnpm migration:check
pnpm test
node tools/architecture-content-digest.mjs . HEAD
```

The initial release is draft until the arc42/tooling lock and architecture
release digest have been reviewed and promoted. Conformance requests must
carry the digest for the exact Architecture commit they pin.
