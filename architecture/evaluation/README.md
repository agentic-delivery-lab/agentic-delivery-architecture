# Evaluation evidence contract proposal

**Status: proposed, not adopted. Contract version: 1.0.0.** The JSON Schema
under `contracts/` and the example in this directory define an evidence format
for review. They do not implement an evaluator, establish a baseline, or prove
any live result.

## Purpose and scope

An evaluation report records attributable evidence for three distinct layers:

- **Agent capability:** task performance and failure modes for a pinned agent,
  skill, model configuration, or capability.
- **Factory behavior:** whether the delivery factory routes, authorizes,
  validates, and contains work as designed.
- **Product outcomes:** whether a delivered product change helps its intended
  users or operators over a stated observation window.

The report is an evidence envelope, not a result database or work-lifecycle
state machine. A conformance result may reference a report using its existing
evidence reference. The report records separate deterministic checks and
semantic judgments; a favorable semantic judgment cannot replace a failed
deterministic gate. Product owners retain authority over domain-specific
measures and interpretation.

## Required evidence

Every report identifies its layer and matching subject, evaluation mode,
generation time, and immutable source pins for the subject, dataset, each
grader, comparator, baseline definition, and dependencies. Dataset identity
includes the evaluated case IDs. Pins carry repository, commit, path, and
content digest so the evidence can be retrieved and checked again.

Deterministic checks record their stable check IDs, outcomes, and evidence
references. Semantic judgments are a separate collection and identify the
reviewer, relationship to the author, judgment, rationale, and uncertainty.
The report also records whether independent review is complete, the regression
severity assessment, and any recommended next step with an owner Issue link
when known.

An unmeasured baseline must be represented explicitly. A report may not claim
improvement unless it includes a measured, pinned baseline and a comparable
candidate measurement for the same metric, unit, and observation window under
the pinned comparator. Missing,
incomparable, or uncertain evidence must remain visible as such; it cannot be
filled with activity counts or inferred from a passing build.

## Authority and ownership

Architecture Authority owns this shared report shape and its semantics.
Agentic Primitives owns reusable offline datasets, graders, and replay tooling
under [Issue #3](https://github.com/agentic-delivery-lab/agentic-delivery-primitives/issues/3).
The Delivery Control Plane owns authorized execution and routing any proposed
follow-up to an Issue. Product repositories and their accountable stewards own
product-specific measures and outcome interpretation. Architecture Issues
[#12](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/12)
and [#13](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/13)
track the unresolved Project inventory and product ownership discoveries.

The report can recommend human review or an owner Issue. It cannot create,
edit, prioritize, or authorize work; change policy; start another execution;
write to a Project; enroll or activate a participant; merge; or release.
Projects coordinate and prioritize work. Only the source Issue in its owning
repository, after the established identity, permission, policy, type, and
lifecycle checks, can authorize bounded execution. See [AP-004](../principles/AP-004-projects-plan-issues-authorize.md)
and [QR-013–QR-016](../quality/quality-scenarios.yml).

## Ownership boundary and adoption gate

This contract is a proposal in the draft Architecture release. Adoption
requires review and merge through the Architecture repository. Dataset and
grader implementation, repeatable replay, independent review, measured
baselines, and any runtime integration remain separate work. Runtime
consumers must pin and validate a reviewed Architecture release and must not
interpret a report as authorization. No Project access, permissions, App
settings, participants, release, or live evaluation is changed by this
proposal.

The example under `examples/` is explicitly synthetic, uses no paid model
calls, and contains no measured baseline or live product claim.
