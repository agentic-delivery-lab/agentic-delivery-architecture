---
date: 2026-09-16
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery/issues/44
decision-makers: Repository maintainers
consulted: GitHub documentation and organization maintainers
informed: Organization maintainers
domains:
  - agentic-delivery-governance
  - agentic-delivery-control-plane
required-enforcement:
  - instructional
  - deterministic
---

# Require structured pull-request descriptions

## Context and Problem Statement

Reviewers need a consistent description of the source issue, implementation
plan, deviations, verification, risks, rollback, and review guidance. The
contract is organization-wide, but its template artifact, validator
implementation, and hosting rules have different owners. A template alone is
advisory, and one repository's check or ruleset does not prove enforcement in
another repository.

## Decision Drivers

- Keep `Source` and `Plan` as separate pull-request headings.
- Give reviewers the evidence needed to understand changes and assess rollback.
- Keep the organization contract distinct from the template file and validator
  implementation.
- Run structural checks as trusted, deterministic code with only the
  permissions they need.
- Report live enforcement per repository; versioned definitions alone are not
  proof of active hosting settings.
- Preserve human merge authority and repository-specific semantic review.

## Considered Options

- An organization-wide body contract with a shared template artifact and
  repository-scoped deterministic validation.
- Independent repository-specific headings and templates.
- An advisory template without a structural check.
- A broad ruleset bypass for bot accounts.

## Decision Outcome

Chosen option: **One organization-wide body contract with separately owned
artifacts and controls**, because reviewers need a consistent description
while each repository retains an auditable implementation and enforcement
boundary.

Every review pull request uses separate `## Source` and `## Plan` headings.
`Source` identifies the source issue. `Plan` records the implementation plan
and material deviations. The remaining template sections capture verification,
risks, rollback, and review guidance. A combined `## Source and plan` heading
is invalid. A structural validator may check headings and required evidence,
but a passing result does not prove that an answer is complete or true.

Ownership is explicit:

- Architecture Authority owns this cross-context description contract and its
  conformance criteria.
- The public `.github` repository owns the organization pull-request template
  artifact. Its source is pinned in the live baseline; form inheritance or
  template visibility in every repository is separately verified.
- The Control Plane owns the validator implementation and any reusable
  workflow that invokes it. The validator is a Primitive implementation
  reference, not Architecture-owned runtime code.
- GitHub rulesets and required checks are repository-scoped hosting settings.
  Each repository's settings and active checks require independent evidence.

The validator must evaluate trusted code, use read-only permissions where
possible, avoid secrets, and exempt only explicitly approved actors. Any
Dependabot exception applies only to this body contract and does not bypass
other required checks or reviews. Semantic completeness and evidence quality
remain human review responsibilities.

### Consequences

- Good, because authors and reviewers have a shared, discoverable structure.
- Good, because the decision owner, template owner, and validator owner are
  distinct and traceable.
- Good, because reviewers can tell a repository contract from live ruleset
  enforcement.
- Bad, because the template, validator, and consumer pins must remain
  compatible across repositories.
- Bad, because deterministic structure cannot prove the truth or adequacy of
  the supplied plan and evidence.
- Neutral, because the hosting platform must be checked repository by
  repository.

### Confirmation

Architecture checks verify the decision and conformance contract. The public
adapter check verifies the template has separate `Source` and `Plan` sections.
Control Plane tests verify the validator's schema, permissions, trusted-code
boundary, supported events, and approved exceptions. Integrated verification
compares each participant's template source, validator version, check result,
and active ruleset independently. The evidence snapshot at
[`system-evidence.yml`](../architecture/references/system-evidence.yml) records
that the Control Plane and public adapter currently require a body check, while
the private adapter's ruleset status is unknown. This evidence does not prove
that one validator or ruleset covers all repositories.

## Pros and Cons of the Options

### One organization-wide contract with separate owners

- Good, because the review meaning stays consistent while each implementation
  remains attributable to its repository.
- Bad, because version pins and cross-repository changes require coordination.

### Independent repository-specific contracts

- Good, because repositories can respond quickly to local needs.
- Bad, because equivalent work can be described and reviewed differently.

### Advisory template only

- Good, because it requires little workflow maintenance.
- Bad, because empty or placeholder sections may reach review without a signal.

### Broad bot bypass

- Good, because automation is less likely to be blocked by human-oriented
  fields.
- Bad, because a broad bypass can waive unrelated checks and reviews.

## More Information

- Original template history: [public adapter PR #2](https://github.com/agentic-delivery-lab/.github/pull/2).
- Architecture owns the contract; the source template is in the public adapter at [commit `af52c92`](https://github.com/agentic-delivery-lab/.github/tree/af52c92e49616e78f8d6647cf5cf538a7e571d78), and Control Plane enforcement sources are in the [pinned Control Plane tree](https://github.com/agentic-delivery-lab/agentic-delivery/tree/c6c891fa937b7db06e3925c3e83ea83656b3d617).
- Live ruleset and branch evidence is recorded in [`system-evidence.yml`](../architecture/references/system-evidence.yml).
- Related decisions: [ADR-0004](https://github.com/agentic-delivery-lab/agentic-delivery/blob/c6c891fa937b7db06e3925c3e83ea83656b3d617/docs/decisions/0004-use-trunk-based-delivery.md), [ADR-0011](0011-run-layered-harness-architecture-reviews.md), and [ADR-0012](0012-use-github-as-the-lifecycle-control-plane.md).
- The base ADR-0016 is present on Architecture `main` and is official. The
  public adapter PR #2 changed the template artifact, not review of this
  Architecture decision; no verifiable Architecture review PR for the ADR was
  found. The issue #3 ownership and content amendments remain provisional
  until their issue-linked review PR is merged.
