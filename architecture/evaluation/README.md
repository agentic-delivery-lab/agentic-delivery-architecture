# Evaluation evidence contract proposal

**Status: proposed, not adopted. Contract version: 2.0.0.** The JSON Schema
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

Every report identifies its layer and matching subject, evaluation mode, run
start and report time, and immutable source pins for the subject, dataset,
case-selection policy, each grader, comparator, baseline definition, and
dependencies. The dataset declares whether cases are for development,
calibration, validation, holdout, or a synthetic example. Its pre-registered
selection record states the eligible population, sampling method, inclusion
criteria, and exclusions. Every report repeats each selected case's task,
stimulus, expected outcome and acceptance criteria, observed outcome, and
evidence; its case set must exactly match the pinned dataset. A selection
policy must be registered before the candidate run starts. Pins carry
repository, commit, path, and content digest so the evidence can be retrieved
and checked again.

An example stored in this repository may use the relative `$schema` path to
the local contract. A report produced by another repository must use the
GitHub URL form with an immutable 40-character Architecture commit; a moving
branch or tag is not a valid report-contract reference. Consumers should pin
the report-schema dependency in their own release context as well.

Deterministic checks record their stable check IDs, outcomes, failure class
when they fail, and evidence references. Each pinned grader names its evaluator,
kind, and version, and states whether it is independent of the subject and
author, not independent, or unknown, with a basis for that statement. It also
records calibration status and, when verified, pins the calibration dataset
and result. A deterministic grader identifies the deterministic tool that ran
it. Semantic judgments are a separate collection and identify the reviewer,
relationship to the author, judgment, rationale, and uncertainty. Failed cases
and unacceptable judgments carry an explicit failure class.
The report also records whether independent review is complete, the regression
severity assessment, and any recommended next step with an owner Issue link
when known.

Comparative claims use only a validation or holdout partition whose dataset
integrity is assessed with no known contamination, and require independent,
calibrated graders and an independent review. The report records the
assessment time, basis, and evidence references before the candidate run;
`suspected` or `unknown` status keeps a comparison inconclusive. Calibration
evidence names the exact pinned evaluator version; changing that version
requires new calibration evidence before results can support a comparison.
Unknown independence, stale or missing calibration, contamination, or
unexplained case exclusions keep the result inconclusive.
The pinned selection policy and exact case coverage make the population and
sampling decision reviewable before any result is interpreted; a favorable
subset cannot silently stand in for the declared eligible population.

An unmeasured baseline must be represented explicitly. A report may not claim
improvement unless it includes a measured, pinned baseline, a comparable
candidate measurement for the same metric, unit, and observation window under
the pinned comparator, and a testable improvement hypothesis for that metric.
Missing, incomparable, or uncertain evidence must remain visible as such; it
cannot be filled with activity counts or inferred from a passing build.

The schema verifies pins, declared partitions, selection timing, exact case
coverage, calibration references, and the evidence gates for comparative
claims. It cannot by itself prove that a population is representative, a
calibration set is uncontaminated, or a reviewer is truly independent. Those
claims require source inspection and accountable human review; the contract
records their evidence and fails closed when the relationship is unknown.

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
