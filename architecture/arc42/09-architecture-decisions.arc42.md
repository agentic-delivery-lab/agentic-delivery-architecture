# 9. Architecture Decisions

<!-- arc42:section 09 -->

This chapter indexes canonical owners; it does not copy decision rationale.
The owner map in [`decisions/README.md`](../../decisions/README.md) is the
editable record. Changes on this feature branch remain provisional until its
review pull request is merged.

| Owner | Decisions |
| --- | --- |
| Architecture Authority | ADR-0001, ADR-0003, ADR-0011, ADR-0012, ADR-0013, ADR-0016, ADR-0018, ADR-0019 |
| Agentic Delivery Control Plane | ADR-0002, ADR-0004–ADR-0009, ADR-0015, ADR-0017 |
| Agentic Primitives | ADP-0001 |
| Developer Distribution | ADD-0001 |

The Architecture repository removes only its duplicate copies of ADR-0002 and
ADR-0004 through ADR-0007. The Control Plane records remain at their canonical
paths. Primitive references to Control Plane decisions resolve through the
immutable owner projection, which records the repository ID, source commit,
canonical path, and per-file SHA-256. No Control Plane decision prose is
copied into the Architecture repository.

ADR-0010 is historical and superseded by ADR-0012. ADR-0014 is historical and
superseded by ADR-0018. The Architecture-owned ADR-0011 defines cross-context
conformance criteria; the Control Plane owns model settings, quota, sandbox,
workflow, runner, and evidence-projection implementation. ADR-0016 defines the
organization-wide Source/Plan body contract; `.github` owns the template
artifact and the Control Plane owns the validator. Neither decision claims one
validator or ruleset covers every repository.

Issues #52 and #53 are closed historical sources. Architecture PR #2, which
updated ADR-0018, merged on 2026-09-24. Neither closed issue authorizes a new
live change. Current recovery work is [parent issue #59](https://github.com/agentic-delivery-lab/agentic-delivery/issues/59)
with this repository's [Architecture issue #3](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/3).

**Evidence:** canonical local records are listed in
[`decisions/README.md`](../../decisions/README.md); external Control Plane
records are pinned in [`adr-owner-projection.yml`](../references/adr-owner-projection.yml).
