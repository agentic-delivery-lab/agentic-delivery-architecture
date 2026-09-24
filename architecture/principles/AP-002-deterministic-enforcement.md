# AP-002 — Deterministic enforcement after semantic proposal

## Statement

Semantic reasoning may propose an action, but deterministic validation must
authorize the action before any lifecycle, issue, branch, publication, or
credential-sensitive mutation occurs.

## Goals and decision basis

This principle supports architecture goals G-02 (deterministic authorization
before a proposed operation mutates lifecycle state) and G-04 (reviewers can
distinguish contracts from evidence). Architecture ADR-0012 assigns lifecycle
control to GitHub-backed contracts; ADR-0019 keeps Delivery State distinct
from lifecycle position; and ADR-0011 defines an independent, read-only review
contract. Architecture owns the canonical text for all organization decisions,
including the issue-execution, runner, and invocation-boundary records. The
Control Plane retains those records' runtime and invocation implementation.
The decision inventory maps affected contexts to stewarding repositories and
pins imported source history without a second decision-text projection.

## Consequences

- The delivery controller treats a model-produced route and field values as a
  proposal. Before a write, deterministic contracts validate repository and
  actor identity, participant pins, permissions, issue schema and options,
  allowed lifecycle transitions, and the selected orchestration contract.
- The controller writes only to the originating repository after the gates
  pass. A failed or missing field, invalid option, or unknown repository
  identity blocks mutation and produces evidence for review.
- Native Issue Type, Lifecycle Stage, Delivery State, governance metadata,
  and per-runner execution state remain separate inputs with context-specific
  meanings. GitHub Projects fields are a separate surface.
- Architecture conformance review is read-only and independent from the
  implementation author. Deterministic structural failures are reported as
  failures; semantic findings are evidence-cited and advisory or inconclusive.
  The reviewer does not approve a merge or replace the human maintainer's
  merge authority.

The first two consequences describe the Control Plane runtime contract; the
last describes Architecture's cross-context review contract. They are not one
validator or one organization-wide live gate.

## Evidence and current limits

Goal G-02 is described in [arc42 chapter 1](../arc42/01-introduction-and-goals.arc42.md).
At the pinned Control Plane revision, the source evidence includes
`config/issue-metadata.yml`, `config/participants.yml`,
`config/github-app-contract.json`, `.github/workflows/issue-intake.yml`, and
`scripts/lib/issue-field-api.mjs`; exact source revisions are recorded in
[`system-evidence.yml`](../references/system-evidence.yml). The issue-intake
runs for recovery issues #59 and #60 failed before dependency installation,
and all participants remained in shadow mode at the 2026-09-24 snapshot.
Those facts are not evidence that the gates passed end to end. The live
organization field definitions were readable, but UI pinning and field
visibility for every native Issue Type and issues without a type remain
unverified. No live mutation or field rename is authorized by this principle.
