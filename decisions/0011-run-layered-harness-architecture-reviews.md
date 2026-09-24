---
date: 2026-09-10
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery/issues/25
decision-makers: Sjef Jenniskens
consulted: Not recorded
informed: Not recorded
domains:
  - agentic-delivery-governance
  - agentic-delivery-control-plane
required-enforcement:
  - deterministic
  - semantic
---

# Run layered harness architecture reviews on pull requests

## Context and Problem Statement

A pull request may change a contract, a bounded-context term, a deterministic
control, or only its implementation. Structural validators can identify
objective contract failures but cannot establish that the change preserves a
decision's intent. Semantic reviewers can assess meaning, but their judgment
is not deterministic proof. Reviewers need cited evidence and must see when
runtime evidence is unavailable.

This is an organization-wide review contract. It does not assign one validator,
workflow, or live ruleset to all repositories. Each repository may require its
own adapter and hosting rule, and the availability of those rules is verified
per repository.

## Decision Drivers

- Fail deterministically on objective contract and provenance violations.
- Assess decision intent, bounded-context language, and architecture drift
  with cited evidence.
- Keep semantic findings advisory or inconclusive when they depend on
  interpretation or missing runtime evidence.
- Use official decisions from the base revision and treat branch-only ADR
  changes as provisional.
- Preserve human merge authority and keep review evidence read-only.

## Considered Options

- Documentation-only review, which has low runtime cost but does not detect
  structural drift predictably.
- Deterministic-only review, which can enforce structure but cannot assess
  meaning or evidence quality.
- Mandatory semantic review as a merge gate, which makes merge eligibility
  depend on model availability and non-deterministic judgment.
- Layered review, which assigns objective rules to deterministic checks and
  interpretation to a cited, read-only semantic review.

## Decision Outcome

Chosen option: **Layered review**, because it keeps deterministic rules
repeatable and exposes semantic concerns without treating a model response as
mathematical proof.

The Architecture Authority owns the cross-context review contract: required
inputs, applicable ADR and domain-language references, deterministic failure
criteria, and the requirement that semantic findings cite exact evidence.
Structural violations fail their check. Semantic concerns, invalid semantic
output, and unavailable model or runtime evidence are reported as advisory or
inconclusive findings. A human reviewer decides whether the cited evidence is
sufficient and retains merge authority.

The Architecture Authority's `architecture/harness-review.yml` describes the
architecture surfaces to consider, and its conformance policy defines the
review boundary. The Control Plane owns the executable review service,
workflow permissions and triggers, model and reasoning configuration, quota,
sandbox and network policy, redaction, session handling, and any runner-state
or pull-request evidence projection. Its implementation and runtime contracts
are pinned separately in the [Control Plane source baseline](https://github.com/agentic-delivery-lab/agentic-delivery/tree/c6c891fa937b7db06e3925c3e83ea83656b3d617),
including [ADR-0009](https://github.com/agentic-delivery-lab/agentic-delivery/blob/c6c891fa937b7db06e3925c3e83ea83656b3d617/docs/decisions/0009-run-codex-from-source-issues-with-a-budget-boundary.md),
[ADR-0015](https://github.com/agentic-delivery-lab/agentic-delivery/blob/c6c891fa937b7db06e3925c3e83ea83656b3d617/docs/decisions/0015-isolate-resumable-runner-execution.md),
and the Control Plane review workflow and implementation. Primitive definitions
remain in Agentic Primitives; they are not copied into the Architecture
reviewer context beyond the pinned catalog metadata needed to assess impact.

The review reads official ADRs from the base revision and provisional changes
from the pull-request head. It consumes bounded source-issue intent, the
merge-base diff, generated traceability, the domain register, deterministic
results, and whitelisted runtime evidence when available. A finding links to
the exact repository, immutable revision, issue, run, or session evidence that
supports it. Missing runtime data is recorded as a limit, not inferred from
passing tests or documentation.

### Consequences

- Good, because objective contract violations fail reproducibly.
- Good, because semantic findings remain visible without becoming an
  unsupported deterministic gate.
- Good, because the owner of each concern is clear: Architecture owns review
  criteria; the Control Plane owns execution and evidence publication.
- Bad, because the Control Plane must keep its implementation aligned with the
  versioned Architecture contract and pinned source release.
- Bad, because semantic quality still depends on a human checking meaning and
  cited evidence.
- Neutral, because repository-specific workflows and rulesets remain separate
  hosting adapters and must be audited individually.

### Confirmation

Architecture checks must verify the review contract, context and ADR
references, and generated traceability. They must not claim that their
structural checks prove runtime behavior. Control Plane tests must verify its
workflow permissions, safe base/head inputs, deterministic failure codes,
read-only semantic boundary, redaction, quota and execution handling, and
idempotent evidence publication. An independent reviewer must inspect whether
findings cite evidence and whether the cited evidence supports the conclusion.
Live App permissions, issue-field APIs, rulesets, runner behavior, and end-to-end
issue-to-pull-request execution require separate runtime evidence.

## More Information

- Historical source issue: [Issue #25](https://github.com/agentic-delivery-lab/agentic-delivery/issues/25). Its source and review history are not execution authorization.
- The base record on Architecture `main` is official; no verifiable Architecture review PR for the original decision was found, so its review provenance is unknown. This issue #3 change proposes the Architecture Authority/Control Plane ownership split and cross-context review scope; those amendments remain provisional until their issue-linked review PR is merged.
- Architecture review map: [`architecture/harness-review.yml`](../architecture/harness-review.yml).
- Architecture conformance policy: [`architecture/policies/conformance.yml`](../architecture/policies/conformance.yml).
- Pinned repository revisions and current evidence limits: [`system-evidence.yml`](../architecture/references/system-evidence.yml).
- [ADR-0001](0001-use-madr-for-architecture-decisions.md), [ADR-0003](0003-use-context-scoped-ubiquitous-language.md), [ADR-0012](0012-use-github-as-the-lifecycle-control-plane.md), and [ADR-0013](0013-derive-adr-traceability-from-agentic-primitives.md) establish related ownership and review boundaries.
