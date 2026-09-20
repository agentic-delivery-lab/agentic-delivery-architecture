# Agentic Delivery Architecture Authority

This repository is the architectural authority for the `agentic-delivery-lab`
organization. It uses arc42 for the architecture narrative, MADR for
individual decisions, TOGAF-style principles for durable policy, and
ISO/IEC/IEEE 42010 terminology where stakeholders, concerns, viewpoints, and
views need to be distinguished.

The architecture is deliberately reference-oriented. ADRs retain their
rationale, section 09 indexes them, the domain register remains machine
readable, and diagrams retain model sources next to generated views.

The repository is currently a locally prepared, history-preserving extraction
from `agentic-delivery`. Publication as the organization repository requires a
separate operator-approved repository-creation and protection step.

## Checks

```text
pnpm architecture:check
pnpm test
```

The initial release is draft until the arc42/tooling lock and architecture
release digest have been reviewed and promoted.
