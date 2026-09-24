# 9. Architecture Decisions

<!-- arc42:section 09 -->

This chapter indexes canonical decision text ownership; it does not copy
decision rationale. The owner map in
[`decisions/README.md`](../../decisions/README.md) and exact ID/file set in
[`decision-inventory.yml`](../references/decision-inventory.yml) are the
editable contract. Changes on this feature branch remain provisional until
its review pull request is merged.

| Canonical text owner | Decisions |
| --- | --- |
| Architecture Authority | 18 ADRs (ADR-0001–0009, ADR-0011–0013, ADR-0015–0020), ADP-0001, ADD-0001 |

Proposed ADR-0020 makes Architecture Authority the canonical text owner for
all organization ADR, ADP, and ADD records while preserving each record's
bounded-context scope and routing semantic review to affected context stewards.

Bounded-context scope remains on each record. The context registry maps each
scope to the repository where semantic review is routed: governance and
Control Plane to `agentic-delivery`, Primitives to
`agentic-delivery-primitives`, and Distribution to
`agentic-delivery-distribution`. A multi-context record requires reviews from
all mapped steward roles. This repository mapping does not establish named
reviewers or GitHub approval. Independent steward approval is currently
limited by the one-member/CODEOWNERS gate recorded in the live audit.

The inventory preserves source repository identity, commit, source path, and
per-file SHA-256 for imported records. It also records the differing CP source
variants for ADR-0012, ADR-0018, and ADR-0019 without copying their prose.
Architecture's ADR-0018 is the current canonical record; its review is
Architecture PR #2. The older CP variant is historical. ADR-0012 and ADR-0019
retain Architecture's canonical baseline links where the CP copies use
context-local paths.

The ADR/Primitive index requires each Primitive ADR reference to resolve to
exactly one local Architecture ADR. No external ADR text projection is
permitted. Source repositories replace their existing copies with
release-pinned references only in their own reviewed follow-up pull requests.

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
records and source variants are pinned in
[`decision-inventory.yml`](../references/decision-inventory.yml). The release
lists the exact 20 decision IDs and pins canonical Architecture content by
source commit and digest.
