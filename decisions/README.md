# Architectural decisions

This directory is the repository's versioned decision log. Each record uses the MADR structure and explains one important choice, its reasons, alternatives and effects.

## Main is the source of truth

An ADR file on the default branch `main` is an official repository decision. A file added or removed only on a feature branch is provisional for that branch until its pull request is merged.

ADR frontmatter has no lifecycle status. The branch state supplies the status:

- present on `main`: official decision;
- added only on a feature branch: proposed decision for that branch;
- removed only on a feature branch: proposed removal for that branch; or
- absent from `main`: no official decision record.

Agents use ADR files from `main` as canonical context. On a feature branch they may also use that branch's additions or removals as provisional context. A branch that is behind `main` may not include the latest official decisions.

## Source issue and ADR tracking issue intake

A GitHub Issue is an assignment brief and audit trail, not automatically an ADR. It may be a normal product or implementation issue.

The source issue also serves as the ADR tracking issue when it directly tracks the decision work. During triage or refining, create a linked sub-issue with the architecture-decision issue form when a separate ADR tracking issue is useful. If the original issue already uses that form, use it directly. If the need appears during implementation, create or update the ADR tracking issue before adding the ADR to the feature branch. For a removal, record the affected ADR path and the reason there.

If no source issue is supplied, search existing issues read-only and present a likely candidate for confirmation. If no suitable issue exists, show an issue-form preview and require explicit confirmation before creating one. Stop on search, authentication or access failures. Never replace an inaccessible issue or publish a partial issue.

## Runbook

1. Identify the source issue and its ADR tracking issue. Create a linked sub-issue when separate tracking is useful.
2. Add `adr:needed` when triage finds that an ADR change is required.
3. Create a feature branch. Add a new ADR or remove an existing ADR there. The feature branch is the pull-request head; never create a pull request from `main`, which is only the protected base.
4. Update related agent primitives, README files and Markdown in the same branch when the decision affects them.
5. Add `adr:proposed` for an active ADR branch or pull request. Add `adr:removal` as well for a deletion.
6. Open or update a review pull request that links the source issue and describes the ADR change. Put the ADR tracking issue in the pull-request body with `Closes #123`, or use `Refs #123` when a broader source issue must remain open. Approval alone does not close the issue.
7. Merge only through protected `main` after the required review and checks succeed, and only with explicit human authorization.
8. After merge, update the source issue and ADR tracking issue with the action and links, remove active labels and close the ADR tracking issue. A `Closes #123` reference closes it during the merge; otherwise close it explicitly. Keep a broader source issue open when other work remains.

The repository has no acceptance workflow. A merged addition is accepted because it is present on `main`; a merged deletion removes the decision from official context. Branch protection must prevent direct pushes and bypasses.

## Rejection and removal

Do not merge a rejected proposal. Record the reason in the ADR tracking issue, apply `adr:rejected` and close that issue. The closed review pull request and Git history retain the proposal without adding it to `main`.

To remove an official ADR, create a feature branch and a pull request that deletes the file. The approved merge completes the removal.

## When to propose an ADR

Propose an ADR when a choice has meaningful alternatives and at least one of these signals applies:

- it is costly or risky to reverse;
- it affects multiple components, teams or future changes;
- it establishes or changes a public interface, data ownership, security/privacy posture, availability, performance, deployment model or important dependency;
- it introduces or changes a repository-wide standard; or
- its rationale is likely to be revisited and needs durable traceability.

Do not create an ADR for a local, easily reversible detail, an ordinary bug fix, a purely editorial change or a choice with no lasting alternative. When uncertain, record the question in the source issue and ask whether an ADR is warranted.

## Labels

Labels help triage and find work; `main` and Git history remain authoritative.

| Label | Meaning |
| --- | --- |
| `adr:needed` | Triage found an ADR change, but no ADR branch or PR exists yet |
| `adr:proposed` | An active branch or PR adds or changes an ADR |
| `adr:removal` | The active ADR change removes an existing record; combine it with `adr:proposed` |
| `adr:rejected` | The proposal was rejected and the reason is recorded in the issue |

After a successful merge, remove active labels and close the ADR tracking issue. Do not add an `adr:accepted` label: a file on `main` is the accepted state.

## Records

Use four digits and a lowercase dashed name:

```text
decisions/NNNN-title-with-dashes.md
```

Record numbers are never reused. A removed record may leave a numeric gap;
the validator checks ordering and base-branch history rather than requiring a
contiguous sequence. This keeps Git history as the record of removed
decisions without retaining obsolete architectural context on `main`.

The template intentionally lives beside README.md and the numbered records. Every record keeps a source-issue link, including when a separate ADR tracking issue is used.

Issues #52 and #53 are closed historical sources; neither authorizes current
implementation or live configuration changes. Architecture PR #2, which updated
ADR-0018, merged on 2026-09-24. The ADR remains the official decision on
`main`; its current runtime alignment and activation evidence remain separate
questions. Current recovery work is tracked by the new parent issue #59 and
Architecture issue #3.

## Canonical decision ownership

The proposed owner map centralizes 19 active ADR IDs, ADP-0001, and ADD-0001
in Architecture Authority.
The assignment is based on organization-wide decision stewardship, not on the
historical repository path. This remains provisional until the issue-linked
Architecture pull request is reviewed and merged. The repository-local copies
in Control Plane, Primitives, and Distribution remain at their audited source
revisions until each repository updates them in its own reviewed follow-up.

| Canonical text owner | Decision identifiers | Canonical text location |
| --- | --- | --- |
| Architecture Authority | ADR-0001 through ADR-0009, ADR-0011 through ADR-0013, ADR-0015 through ADR-0021, ADP-0001, ADD-0001 | This repository's `decisions/` directory, listed in the [decision inventory](../architecture/references/decision-inventory.yml) and pinned by the Architecture release. |

The active identifiers preserve the historical gaps: ADR-0010 is superseded by
ADR-0012, and ADR-0014 is superseded by ADR-0018. Neither has an active record
file. The inventory distinguishes Architecture's canonical text from imported
source hashes and from divergent historical source variants; it stores no
second decision prose.

The bounded-context registry assigns the repository used to route semantic
review for each affected domain. Governance and Control Plane reviews route to
`agentic-delivery-lab/agentic-delivery`; Primitives review routes to
`agentic-delivery-lab/agentic-delivery-primitives`; Distribution review routes
to `agentic-delivery-lab/agentic-delivery-distribution`. A record scoped to
multiple contexts requires semantic review from each mapped context steward.
The mapping identifies a repository, not a person, approval team, or active
CODEOWNERS rule. Current audit evidence records a one-member/CODEOWNERS limit
that blocks independent steward approval; see parent issue [#59](https://github.com/agentic-delivery-lab/agentic-delivery/issues/59).

Text ownership does not move runtime or artifact authority. The Control Plane
owns controller and GitHub adapter implementation; Primitives owns its
reusable agent, skill, validator, catalog, and release artifacts; Distribution
owns bootstrap and consumer bundle artifacts; `.github` and `.github-private`
own only their public or private adapter artifacts. A source issue in a context
links to an Architecture ADR-tracking issue. Canonical text changes only in an
issue-linked Architecture PR, followed by a separate implementation PR in the
owning repository pinned to the merged Architecture commit and digest.

ADR-0010 is a historical record superseded by ADR-0012. ADR-0014 is a
historical record superseded by ADR-0018. Neither has an active ADR file in the
current canonical text set. `.github` owns the public issue-form and pull-request
template artifacts, while the Control Plane owns the validator implementation
for the organization-wide Source/Plan contract. The private `.github-private`
repository owns only its private profile and agent-publication adapter. Those
artifact boundaries do not give either adapter ownership of an ADR or bounded
context.

## Decision source and review provenance

The table below retains known historical issue and review provenance. The
complete canonical ID/file set, imported source metadata, and source variants
are enforced by the decision inventory. “Not verified” means the audited
source did not contain a verifiable review pull request; it does not claim that
no review occurred.

| Number | Decision | Historical source | Verifiable review evidence |
| --- | --- | --- |
| [0001](0001-use-madr-for-architecture-decisions.md) | Use MADR and GitHub Issues for architectural decisions | [Issue #1](https://github.com/agentic-delivery-lab/agentic-delivery/issues/1) | Original decision review: [Control Plane PR #2](https://github.com/agentic-delivery-lab/agentic-delivery/pull/2); separate Architecture transfer review is unverified. |
| [0002](0002-use-plain-language-for-human-agent-communication.md) | Use plain language for human-agent communication | [Issue #3](https://github.com/agentic-delivery-lab/agentic-delivery/issues/3) | Imported from the pinned Control Plane baseline; a historical review PR was not verified in the audit. |
| [0003](0003-use-context-scoped-ubiquitous-language.md) | Use context-scoped ubiquitous language | [Issue #5](https://github.com/agentic-delivery-lab/agentic-delivery/issues/5) | Original decision review: [Control Plane PR #6](https://github.com/agentic-delivery-lab/agentic-delivery/pull/6); separate Architecture transfer review is unverified. |
| [0004](0004-use-trunk-based-delivery.md) | Use trunk-based delivery with short-lived feature branches | [Issue #7](https://github.com/agentic-delivery-lab/agentic-delivery/issues/7) | Imported from the pinned Control Plane baseline; a historical review PR was not verified in the audit. |
| [0005](0005-use-conventional-commits-with-gitmoji.md) | Use Conventional Commits with Gitmoji | [Issue #7](https://github.com/agentic-delivery-lab/agentic-delivery/issues/7) | Imported from the pinned Control Plane baseline; a historical review PR was not verified in the audit. |
| [0006](0006-curate-a-changelog.md) | Curate a human-readable changelog | [Issue #7](https://github.com/agentic-delivery-lab/agentic-delivery/issues/7) | Imported from the pinned Control Plane baseline; a historical review PR was not verified in the audit. |
| [0007](0007-use-issue-linked-conventional-branch-names.md) | Use issue-linked Conventional branch names | [Issue #11](https://github.com/agentic-delivery-lab/agentic-delivery/issues/11) | Imported from the pinned Control Plane baseline; a historical review PR was not verified in the audit. |
| [0008](0008-use-pnpm-with-delayed-dependency-adoption.md) | Use pnpm with delayed dependency adoption and Node.js automation | [Issue #12](https://github.com/agentic-delivery-lab/agentic-delivery/issues/12) | Imported from the pinned Control Plane baseline; a historical review PR was not verified in the audit. |
| [0009](0009-run-codex-from-source-issues-with-a-budget-boundary.md) | Run Codex from source issues with a budget boundary | [Issue #21](https://github.com/agentic-delivery-lab/agentic-delivery/issues/21) | Imported from the pinned Control Plane baseline; a historical review PR was not verified in the audit. |
| [0011](0011-run-layered-harness-architecture-reviews.md) | Run layered harness architecture reviews on pull requests | [Issue #25](https://github.com/agentic-delivery-lab/agentic-delivery/issues/25) | Unknown; no verifiable review PR for this Architecture record was found. |
| [0012](0012-use-github-as-the-lifecycle-control-plane.md) | Use GitHub as the lifecycle control plane | [Issue #29](https://github.com/agentic-delivery-lab/agentic-delivery/issues/29) | Unknown; no verifiable review PR for this Architecture record was found. |
| [0013](0013-derive-adr-traceability-from-agentic-primitives.md) | Derive ADR traceability from agentic primitives | [Issue #29](https://github.com/agentic-delivery-lab/agentic-delivery/issues/29) | Unknown; no verifiable review PR for this Architecture record was found. |
| [0015](0015-isolate-resumable-runner-execution.md) | Isolate resumable runner execution by source issue | [Issue #29](https://github.com/agentic-delivery-lab/agentic-delivery/issues/29) | Imported from the pinned Control Plane baseline; a historical review PR was not verified in the audit. |
| [0016](0016-require-structured-pull-request-descriptions.md) | Require structured pull-request descriptions | [Issue #44](https://github.com/agentic-delivery-lab/agentic-delivery/issues/44) | [Public adapter PR #2](https://github.com/agentic-delivery-lab/.github/pull/2) changed the template artifact; it does not verify review of this Architecture ADR. |
| [0017](0017-use-an-explicit-agent-invocation-boundary.md) | Use an explicit agent-invocation boundary for conversation-driven delivery | [Issue #46](https://github.com/agentic-delivery-lab/agentic-delivery/issues/46) | Imported from the pinned Control Plane baseline; a historical review PR was not verified in the audit. |
| [0018](0018-organization-wide-agentic-delivery-control-plane-distribution-and-versioning.md) | Organization-wide Agentic Delivery Control Plane distribution and versioning | [Closed Issue #53](https://github.com/agentic-delivery-lab/agentic-delivery/issues/53) | [Architecture PR #2](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/pull/2) merged 2026-09-24. |
| [0019](0019-canonicalize-delivery-state-field.md) | Canonicalize the orthogonal Delivery State field | [Closed Issue #52](https://github.com/agentic-delivery-lab/agentic-delivery/issues/52) | Unknown; no verifiable review PR for this Architecture record was found. The live rename remains separately gated. |
| [0020](0020-centralize-organization-decision-records.md) | Centralize organization decision records in Architecture Authority | [Issue #3](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/3) | Proposed on this issue-linked Architecture branch; context stewards and human review gate remain required. |
| [0021](0021-define-architecture-artifact-contracts.md) | Define per-family Architecture artifact contracts | [Issue #3](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/3) | Proposed on this issue-linked Architecture branch; context stewards and human review gate remain required. |
| [ADP-0001](ADP-0001-primitive-release-and-projection.md) | Primitive release and projection boundary | [Issue #52](https://github.com/agentic-delivery-lab/agentic-delivery/issues/52) | Imported from the pinned Primitive baseline; original source issue remains historical. |
| [ADD-0001](ADD-0001-distribution-boundary.md) | Distribution boundary | Not recorded in pinned source | Imported from the pinned Distribution baseline; historical issue and participants were not recorded. |

The reviewer must keep the `Source` and `Plan` pull-request headings separate.
ADR-0016 defines that organization-wide contract; it does not prove one
validator or one ruleset covers all repositories. The live baseline is pinned
in [`system-evidence.yml`](../architecture/references/system-evidence.yml).
