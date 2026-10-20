---
date: 2026-10-13
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11
decision-makers: Sjef Jenniskens (sjefsharp), through owner-selected implementation direction
consulted: Corrected implementation plan dated 2026-10-12; canonical strategy and authority boundaries
informed: None
domains:
  - agentic-delivery-governance
  - agentic-delivery-control-plane
  - agentic-primitives
  - developer-distribution
required-enforcement:
  - deterministic
  - semantic
---

# Centralize approved requirements in Requirements Authority

## Context and Problem Statement

The owner selected a public `agentic-delivery-requirements` repository as the
canonical authority for factory, shared and product requirements in the
2026-10-12 corrected implementation plan (W03–W04). Architecture currently
owns the QR catalog at `architecture/quality/quality-scenarios.yml`. Its stable
IDs, scenario text and historical evidence must survive transfer. Proposed
strategy, target scenarios and local fixtures do not establish live satisfaction.

W01 and W02 distinguish factory self-development from independent-product
acceptance and record the current interactive development delegation. This
decision selects authority placement; adoption of a requirements baseline and
active delivery remain separate acceptance events.

## Decision Drivers

- Give each normative requirement one editable owner across all products.
- Preserve QR identities and immutable historical provenance.
- Select only approved, explicitly applicable obligations from immutable baselines.
- Keep public content suitable for publication and prevent authority expansion
  through product specifications, Projects, model output or mutable references.
- Keep organizational decisions in Architecture under ADR-0020, without creating
  a new bounded context merely because a repository is introduced.

## Considered Options

- A centralized public Requirements Authority with explicit baseline cutover.
- Keep requirements editable in Architecture and federate product catalogs.
- Duplicate normative catalogs across repositories and reconcile them later.

## Decision Outcome

Chosen option: **A centralized public Requirements Authority**, as selected by
the owner, with one approved immutable cutover baseline for each transferred
catalog. The authority owns approved factory, shared and product requirements,
normative QR scenarios, applicability and baseline manifests. Architecture
retains mission, strategy, principles, organizational ADRs, domain contexts,
structural model, arc42 and conformance rules. Product repositories own
implementation specifications, code, tests, deployment and operational evidence;
they reference central requirement IDs rather than duplicate normative records.

Each record includes a stable ID, accountable owner, explicit scope, statement,
source provenance and verification criterion. Approval, proposed content,
withdrawal and observed satisfaction are distinct facts. An approval record
names the authority and actor, acceptance reference, exact requirement revision
and baseline, evidence limits and rollback. Generated drafts never become
normative through regeneration, a passing test, a merge or Issue/Project text.

The initial repository contains a charter, closed schema, catalog validator,
meaningful negative tests, CI and a draft baseline manifest. It remains absent
from active enrollment or explicitly shadow. A baseline references exact source
commit and content digest, plus an explicit ordered approved-ID set. Consumers
reject moving, tampered, draft, withdrawn or incompatible sources and unknown
applicability; selection does not widen Issue execution authority.

W04 transfers QR records with their original IDs, text and immutable origin.
Inferred execution obligations remain candidate until accepted. Architecture
keeps its existing normative catalog until a recorded cutover baseline is
accepted; candidate copies in Requirements are explicitly non-normative. At
cutover, Architecture becomes reference-only or a checked derived projection
of that exact Requirements baseline. There cannot be two editable normative
catalogs. Historical evidence and target/live distinctions remain intact.

Public requirements must exclude credentials, private operational evidence,
personal data and unsuitable product material. A product whose requirements
cannot safely be public is held pending an explicit visibility decision and
rights agreement; this decision does not silently introduce private mirrors.
Central requirements do not require a new domain context or universal graph.

### Consequences

- Good, because factory and independent products share a single normative
  catalog and immutable applicability contract.
- Good, because QR provenance survives while approval and satisfaction remain
  separately evidenced.
- Bad, because cutover and consumer pin changes require coordinated owner PRs.
- Bad, because a public authority cannot serve unsuitable product content
  without a separate visibility decision.
- Neutral, because initial repository bootstrap is administrative work and
  does not count as Milestone A delivery.

### Confirmation

W03 checks required fields, closed schema, stable unique IDs, explicit scopes,
source pins, approval evidence and reproducible draft provenance. Negative tests
reject unapproved normative selection, duplicate IDs, unknown scopes, moving
source references, tampered manifests and unsupported versions. CI runs without
execution or publication authority. W04 proves all original QR IDs resolve,
exact transfer reproduction, one normative owner and accepted cutover rollback.
W12 and W20 consume approved immutable baselines; they must reject drafts,
withdrawals, origin mismatch and applicability uncertainty.

## Pros and Cons of the Options

### Central public authority

- Good, because the selected owner boundary is explicit and testable.
- Bad, because public suitability and baseline coordination are admission gates.

### Architecture or federated catalogs

- Good, because fewer initial transfers are needed.
- Bad, because this differs from the owner's selected central authority target.

### Duplicate editable catalogs

- Bad, because no exact baseline can establish a single normative owner.

## More Information

Source: [Architecture #11](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/11).
Related: ADR-0018 (enrollment and delegation), ADR-0020 (organizational decision
ownership), ADR-0021 (artifact contracts), W03/W04/W12/W20. No runtime activation,
App access, Issue Field rename, repository rename or hosted modeling service
is introduced by this decision. Reversal requires an explicit selected authority
baseline and reference-only consumers, preserving Git history and avoiding two
editable catalogs. Creation of Requirements is owner-authorized; baseline
approval and cutover must still produce their own truthful acceptance records.
