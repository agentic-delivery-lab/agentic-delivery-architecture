# Agentic Delivery Architecture Authority

This repository is the cross-context architecture authority for the
`agentic-delivery-lab` organization. It records organization-wide principles,
bounded-context relationships, architecture descriptions, and cross-context
decisions. Architecture Authority is an ownership role and repository; it is
not a bounded context in the domain model.

The architecture description uses [arc42](https://arc42.org/documentation/)
as a documentation template and its [iterative method](https://arc42.org/method/)
as a docs-as-code practice. The [official examples repository](https://github.com/arc42/examples.arc42.org-site)
informs the level of detail. ISO/IEC/IEEE 42010:2022 supplies the terms used to
connect stakeholders and their concerns to viewpoints and views. These
references guide this description; arc42 is not treated as a formal
conformance standard. TOGAF artifacts are not applied because the current
evidence is already traceable through explicit goals, decisions, consequences,
and release contracts, with no demonstrated benefit from adding a separate
enterprise-principles process.

The four bounded contexts are Agentic Delivery Governance, Agentic Delivery
Control Plane, Agentic Primitives, and Developer Distribution. The public and
private `.github` repositories are GitHub adapters. Their files do not make
them domain contexts. See the [context model](architecture/domain/README.md),
the [source and live-evidence snapshot](architecture/references/system-evidence.yml),
the [arc42 chapter profile](architecture/arc42/README.md), and the twelve
[arc42 chapters](architecture/arc42/).

Architecture Authority is the proposed canonical text owner for all
organization ADR, ADP, and ADD records. The [decision index](decisions/README.md)
and [decision inventory](architecture/references/decision-inventory.yml) pin
the exact records, context scope, imported source identities, and provenance.
The ADR-to-Primitive index is generated from the pinned Primitive catalog and
resolves every ADR reference to exactly one local Architecture record.

Architecture-owned YAML and JSON source data are parsed and checked against
per-family JSON Schema Draft 2020-12 schemas under `architecture/contracts/`.
Separate cross-file checks verify IDs, context references, immutable pins, and
generated outputs; context stewards still review semantic meaning.

The public Architecture repository and its draft release are versioned on
`main`. A draft release is not a published or deployed architecture contract.
The latest live baseline and known evidence gaps are recorded with commit pins
in `architecture/references/system-evidence.yml`; they must be refreshed when
the architecture snapshot is updated.

## Checks

```text
pnpm architecture:check
pnpm migration:check
pnpm test
node tools/architecture-content-digest.mjs . HEAD
```

Conformance requests must carry the digest for the exact Architecture content
snapshot they pin. A passing structural check does not prove runtime behavior,
live organization settings, or semantic term consistency; reviewers inspect
the cited evidence and its limits.
