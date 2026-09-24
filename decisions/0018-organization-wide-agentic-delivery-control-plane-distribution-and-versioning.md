---
date: 2026-09-23
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery/issues/53
decision-makers: Repository maintainers
consulted: Official GitHub Actions, GitHub Apps, and webhook documentation
informed: None
domains:
  - agentic-delivery-control-plane
  - agentic-delivery-governance
required-enforcement:
  - deterministic
  - semantic
supersedes:
  - ADR-0014
---

# Organization-wide Agentic Delivery control-plane distribution and versioning

## Context and Problem Statement

The supplied `main` snapshot showed a repository-local issue-based delivery
harness. Its webhook rejected events from another repository,
`repository_dispatch` targeted the controller repository, Actions checked out
and mutated that same repository, and repository-scoped App variables and
secrets reinforced the coupling. That snapshot is migration evidence, not a
description of the current implementation.

Current `agentic-delivery` `main` has staged organization-wide foundations: a
central webhook, a repository-ID participant registry, signed event envelopes,
controller and contract pins, origin-aware intake, and shadow execution. The
offline multi-repository acceptance fixture and the cross-repository release
chain pass. They do not prove a live App installation, production webhook
delivery, organization issue-field access, or production write-back. The
fixture currently uses a synthetic second repository and synthetic
`.github-private` identity; live installation and event evidence remain an
operator gate.

The operator reported on 2026-09-23 that the organization App installation is
set to **All repositories**, because the same lifecycle is intended to be
available across existing and future repositories. That setting is not
independently readable with the available identity. The current Control Plane
App contract and validator still require `selected-repositories`. This is
explicit contract drift, not proof that the reported setting is wrong or that
the live setting has been verified.

Issue [#52](https://github.com/agentic-delivery-lab/agentic-delivery/issues/52)
captured and persisted the migration plan; it is closed and is not
implementation authorization. Issue
[#53](https://github.com/agentic-delivery-lab/agentic-delivery/issues/53) is
the successor architecture gate. It requires this decision, machine-validated
contracts, offline acceptance evidence, and later operator verification; it
explicitly does not authorize App-setting changes, private-surface activation,
or production write-back as part of this ADR change.

Architecture Authority now exists as the dedicated, history-preserving
repository and is the canonical owner of this global decision. The matching
record under `agentic-delivery/docs/decisions/` is a migration bridge until
Control Plane consumers have moved to the pinned Architecture contract; it
must not become a separately edited decision.

The GitHub platform supplies several separate mechanisms, and they must not be
collapsed into one contract:

- an App registration and organization installation grant event and API access;
- webhooks deliver signed events with installation and repository identity;
- the central controller executes routing, authorization, orchestration and
  write-back;
- Actions execute workflows in a repository or call a reusable workflow;
- reusable workflows and bootstrap artifacts distribute thin integration code;
- GitHub secrets and variables hold credentials and configuration; and
- Issues, pull requests and organization fields remain the durable work-state
  authority.

The platform references for this decision are [installing a GitHub App](https://docs.github.com/en/apps/using-github-apps/installing-your-own-github-app),
[GitHub App permissions](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app),
[installation access tokens](https://docs.github.com/en/rest/apps/apps#create-an-installation-access-token-for-an-app),
[webhook types](https://docs.github.com/en/webhooks/types-of-webhooks),
[webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads),
and [reusable workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows).

## Decision Drivers

- Keep exactly one authoritative implementation of the generic lifecycle,
  semantic routing, deterministic authorization, orchestration policy and
  evidence contract.
- Preserve issue-based work while allowing the technical implementation to be
  event-driven.
- Identify the originating repository from the signed event and repository ID,
  never from a hard-coded controller repository name.
- Make participation explicit and reversible for existing and future
  repositories.
- Make the single organization App installation cover the intended organization
  scope without treating App access as enrollment.
- Honor the operator's organization-wide intent while containing event
  processing and API tokens to explicitly enrolled repository identities.
- Prevent a central release from silently changing a participant's behavior.
- Keep App credentials out of participating repositories unless a local
  operation genuinely needs them.
- Preserve repository-local CI/CD, security, Dependabot, release and validation
  workflows.
- Provide a safe shadow, upgrade and rollback path before mutation is enabled.
- Keep `.github` and `.github-private` as GitHub-defined adapters rather than
  runtime locations.

## Considered Options

- Central App webhook and controller with an **All repositories** installation
  plus a separate participant registry, with optional thin reusable-workflow
  callers.
- Central App webhook and controller with a **selected repositories**
  installation plus the same registry.
- Copy the complete lifecycle runtime into every participating repository.
- Require a thin consumer workflow in every repository as the primary event
  intake path.
- Execute every participant from the current controller `main` branch.
- Register a separate GitHub App for every repository.
- Use App installation access alone as implicit enrollment.
- Use `.github` or `.github-private` as the runtime repository.

## Decision Outcome

Chosen option: **One organization-installed GitHub App with All repositories
access, a central Delivery Control Plane, and a reviewed participant registry
as the independent enrollment and authorization gate. Use thin reusable
workflows or bootstrap integrations only where repository-local execution is
needed.**

The existing `agentic-delivery` repository remains the deliberate owner of
the Delivery Control Plane during and after the split. It is not a generic
organization repository and must not remain a hub by accident. Its future
bounded context owns the App source and webhook boundary, participant
registry, event envelope, lifecycle and transition contracts, semantic routing,
deterministic authorization, orchestration policy, reusable workflows, runner
and session control, GitHub Projects projection, evidence and controlled
write-back.

### Organization-wide App installation

One GitHub App registration and one organization installation serve the
organization; GitHub does not require a separate App definition per
repository. The target installation setting is **All repositories**, matching
the operator's stated organization-wide intent. GitHub documents `All
repositories` and `Only select repositories` as installation choices, and an
App webhook receives configured events for repositories the installation can
access. A new repository is therefore within platform scope when the
installation remains set to `All repositories`.

This broad App reach is not participation. A newly created or otherwise
accessible repository remains denied until its immutable repository ID is
added through a reviewed Control Plane registry change. The controller fails
closed for unknown, disabled, mismatched, or incompatible participants. App
access changes never create registry records. The registry is the explicit
onboarding, version pin, shadow/active mode, and rollback authority.

Repository access and webhook subscriptions are separate settings. The
versioned event catalog defines which `issues`, `issue_comment`, pull-request,
and review events are meaningful; the lifecycle decides whether an event is
ignored, observed, offered for semantic routing, or eligible for a validated
transition. An issue comment can request an invocation only through the
registered explicit mention and actor/source checks. A pull-request or review
event is not by itself a lifecycle transition. Projects remain projections,
and their events are not part of the active route until separately implemented
and versioned. GitHub's `installation_repositories` event is useful to audit
access changes, but it must never enroll a repository. The last observable App
subscription snapshot omitted `issues`; an App-authorized owner must verify and
correct subscriptions separately before any issue-based activation.

The App registration, organization installation, webhook event subscriptions,
central execution, workflow execution, workflow/configuration distribution,
credential storage, and origin mutation are separate controls:

1. **App registration:** one organization App defines callback URL, requested
   permissions, and webhook events.
2. **App installation:** one organization installation grants repository
   access. Its reported `All repositories` setting must be verified by an App-
   authorized owner before activation.
3. **Webhook reception:** GitHub sends only subscribed events for accessible
   repositories to the App's central webhook. Event reception does not enroll
   or route a repository by itself.
4. **Control Plane execution:** `agentic-delivery` receives the signed event,
   resolves the participant's immutable controller/contract pins, and runs the
   single lifecycle, routing, orchestration, and authorization implementation.
5. **Workflow execution:** central workflows execute in the Control Plane
   repository. Optional reusable workflows execute in a caller repository only
   for an explicitly versioned local integration.
6. **Distribution:** no consumer needs a copy of lifecycle logic. Optional
   bootstrap files or reusable workflow callers are thin, reviewed adapters
   pinned to an immutable SHA.
7. **Configuration:** the participant registry is canonical in the Control
   Plane; neither `.github` nor `.github-private` contains a second registry.
8. **Credentials:** the App private key and webhook/dispatch secrets remain in
   the central deployment or Control Plane secret boundary. They are never
   copied into a participant repository or exposed to Codex/model processes.
9. **Mutation:** installation tokens are minted just in time, scoped to the
   originating repository ID and the minimum required permission subset; the
   central `GITHUB_TOKEN` is limited to the Control Plane repository.

The current App contract expresses `contents:write`, `issues:write`,
`pull_requests:write`, and metadata read, with `workflows` permission disabled.
It requests no organization administration or Projects permission. The exact
permissions needed for organization issue-field GraphQL mutations have not
been proven with the live App; therefore the permission set is a tested target
contract, not an assertion of live sufficiency or minimality. Do not add a
Projects permission until a separately scoped Project projection requires and
validates it. Do not change App settings in this ADR PR.

### Participation contract

Participation is the conjunction of two independently auditable conditions:

1. the organization App installation has access to the exact numeric
   repository ID, proven by the origin-scoped installation-token operation; and
2. the central `participants.yml` registry contains that repository ID with
   `mode: shadow` or `mode: active`, an expected full name, a controller
   release commit, supported event/lifecycle/state-machine/evidence contract
   versions, and a declared local integration profile.

The repository ID is the primary identity and survives a rename. The full name
is a verification value, not an identity key. App access without a registry
entry does not activate delivery; a registry entry without App access fails
closed. With `All repositories` installed, App access is broad but the
participant registry remains an explicit opt-in. Enrollment and mode changes
are reviewed pull requests in the Control Plane, not side effects of an
installation event, arbitrary repository workflow, Project field, or App
repository-access change.

### Event and execution boundary

The App webhook verifies the signature, installation, organization, supported
event/action, delivery ID and repository identity. It emits a versioned event
envelope whose complete `repository_dispatch` payload is signed with a
separate central HMAC dispatch secret. The controller verifies that signature
and its bounded timestamp before fetching the current GitHub object again,
resolving the participant's pinned controller and contract versions, asking
the semantic router for a proposal, and applying only deterministically
authorized mutations to the originating repository. The webhook secret and
dispatch secret are separate credentials: the former authenticates GitHub
ingress, while the latter authenticates the gateway-to-controller handoff.
Neither is available to an origin repository or model process.

An event is input, not a lifecycle transition. The lifecycle policy decides
whether an issue, comment, pull request, review, workflow or Project event is
ignored, observed, routed or authorized. Conversation-driven execution still
requires the explicit invocation boundary from ADR-0017. Repository identity,
issue number, delivery ID, source revision and controller version are carried
through orchestration and evidence.

The central workflow's `GITHUB_TOKEN` is used only for the controller
repository. Origin reads and writes use a just-in-time App installation token
scoped to the originating repository. The App private key and installation
tokens are never passed to Codex, a primitive, a model process or untrusted
consumer-repository code.

When a participant needs Actions execution in its own repository, it receives a
thin caller or bootstrap bundle. The caller pins the reusable workflow to an
immutable commit SHA, passes named inputs and secrets only, and owns no copy of
the lifecycle, routing or agent definitions. `secrets: inherit` is prohibited.
Local CI/CD and security workflows remain independent; central checks use a
distinct `agentic-delivery-*` namespace and do not assume ownership of all
workflow files.

### Versioning and compatibility

The controller release is SemVer plus an immutable Git commit. Each participant
stores the exact controller commit and compatible contract versions in the
registry. Event envelopes use an integer major with additive changes within a
major. Lifecycle, state-machine and evidence contracts use SemVer. Reusable
workflow callers and bootstrap bundles use SemVer plus an exact source SHA.
Primitive and Architecture dependencies use a release version, source commit
and content digest.

The controller publishes a release manifest containing supported event,
lifecycle, state-machine, evidence, primitive, Architecture and minimum
bootstrap versions. It supports the current major and immediately preceding
major for at least 90 days after a successor is generally available unless the
published support policy extends that window. Incompatible changes require an
expand/migrate/contract migration and a reviewed participant update; they may
not be hidden behind a mutable `main` reference. A critical security revocation
may fail closed through an incident record and explicit registry changes.

An upgrade publishes and validates an immutable release, evaluates every
active participant, runs the new version in shadow mode, compares proposals and
deterministic results without duplicate mutation, then updates participants one
at a time through reviewed registry changes. Rollback restores the previous
exact commit and contract versions. Runner state records the controller and
state-machine versions so a resume cannot silently cross an incompatible
boundary. An existing participant may remain on an older supported version
until its intentional upgrade window or the support policy's end date.

### Consequences

- Good, because one implementation serves all enrolled repositories without
  copying the lifecycle or secrets.
- Good, because repository identity and authorization remain explicit from
  webhook ingress through write-back and evidence.
- Good, because enrollment, upgrades and rollback are reviewable and
  independently reversible.
- Good, because repository-local workflows can continue without central
  ownership of their files.
- Bad, because the organization needs a central registry, release manifests,
  shadow execution, App operations and cross-repository contract tests.
- Bad, because App permissions and central credential storage become shared
  infrastructure that requires careful operational ownership.
- Bad, because an All-repositories installation broadens the App's potential
  reach. A compromised App key could mint tokens for any organization
  repository within the App's granted permissions; registry checks and
  origin-scoped tokens reduce routine exposure but do not replace key
  protection, rotation, or incident revocation.
- Neutral, because a small thin bootstrap may still be present in a consumer,
  but it is an adapter rather than a second control plane.

### Confirmation

Deterministic tests and an operator smoke run must prove:

- events from two different repositories enter one controller and retain their
  repository IDs through routing, execution and evidence;
- a repository not present in the registry is rejected even when App access is
  present, and a registry entry without App access fails closed;
- lifecycle transitions mutate the originating repository only;
- no generic controller path depends on the literal name
  `agentic-delivery`;
- installation-token requests are narrowed to the origin repository and the
  App permissions are sufficient but minimal;
- a new repository can enroll with the documented two-part contract;
- an older supported participant can remain pinned while another participant
  upgrades;
- a deliberate upgrade and exact-commit rollback work without duplicate
  mutation;
- `.github-private` events can participate without receiving the central App
  private key; and
- participant-local CI/CD remains independently executable.

Current local evidence is narrower: `pnpm acceptance:check` reports
`offline-fixture`, and `pnpm release-chain:check` passes when given the four
cross-repository roots. The fixture demonstrates two distinct identities and
the private-surface path without consumer App credentials, but its second
repository and `.github-private` IDs are synthetic. It does not verify the
organization App, event subscriptions, Projects, or live mutations. Keep every
participant in `shadow` mode until the operator evidence is recorded and the
App contract and validator agree with this decision.

## Pros and Cons of the Options

### Central App and controller with registry (chosen)

- Good, because the lifecycle, state machine, routing, credentials and
  evidence have one owner and can be tested centrally.
- Good, because the registry keeps participation explicit even though the App
  can receive events for every organization repository.
- Bad, because App reach is broader than the set of active participants and a
  private-key compromise has a larger potential impact.
- Bad, because central availability and release operations affect enrolled
  participants.

### Central App with selected repositories and the same registry

- Good, because the App installation has a smaller platform-access set.
- Bad, because every existing and future repository would require a separate
  installation-access change before its events could reach the shared
  lifecycle, contrary to the operator's organization-wide intent.
- Neutral, because the registry would still be required for explicit
  enrollment, release pins, shadow mode, and rollback.

### Copy the complete runtime into every repository

- Good, because each repository appears self-contained.
- Bad, because it duplicates state machines, routing, agents, secrets and
  security fixes, and makes drift and incompatible upgrades likely.

### Thin workflow in every repository as primary intake

- Good, because repository-local Actions are familiar and can use local
  permissions.
- Bad, because every repository must maintain triggers and event filtering;
  it is a poor primary path for organization-wide webhook and enrollment
  policy. It remains an optional adapter for local execution.

### Run every participant from current `main`

- Good, because it is initially simple.
- Bad, because a merge silently changes behavior for every participant and
  makes rollback and compatibility evidence ambiguous.

### One App definition per repository

- Good, because access appears isolated.
- Bad, because one organization installation can cover multiple repositories;
  multiple registrations multiply credentials, event configuration, and
  operational failure modes without a platform requirement.

### App access alone as enrollment

- Good, because it has one setting.
- Bad, because granting an App access would unexpectedly activate lifecycle
  processing. It cannot express a shadow mode, contract pin or local profile.

### `.github` or `.github-private` as runtime

- Good, because those names have organization-wide meaning.
- Bad, because GitHub's documented special-repository behavior does not make
  either repository the canonical runtime. `.github` supplies public default
  community health files; `.github-private` supplies the private profile and,
  where supported, organization-level agent publication. Neither owns App
  execution or lifecycle state.

## More Information

- Refines [ADR-0012: Use GitHub as the lifecycle control plane](0012-use-github-as-the-lifecycle-control-plane.md): GitHub remains the work-state authority, while the executable controller becomes organization-aware.
- Supersedes the historical [ADR-0014: Use a repository-scoped GitHub App for event-producing mutations](https://github.com/agentic-delivery-lab/agentic-delivery/blob/1212568eeb80960696385f04a1dd6313e38e4e04/docs/decisions/0014-use-a-repository-scoped-github-app.md): the App installation is organization-wide with per-origin repository token narrowing. Its record is removed from the active tree, but the commit history remains the historical source.
- Refines [ADR-0015](https://github.com/agentic-delivery-lab/agentic-delivery/blob/c6c891fa937b7db06e3925c3e83ea83656b3d617/docs/decisions/0015-isolate-resumable-runner-execution.md): runner namespaces and continuation records must include repository ID, issue and pinned controller/state-machine versions.
- Refines [ADR-0017](https://github.com/agentic-delivery-lab/agentic-delivery/blob/c6c891fa937b7db06e3925c3e83ea83656b3d617/docs/decisions/0017-use-an-explicit-agent-invocation-boundary.md): invocation envelopes retain the originating repository and are authorized centrally.
- Architecture Authority is now the canonical owner of this ADR. Architecture, Primitives, Distribution, and the private special-surface repositories exist; their presence does not prove their runtime or publication is activated. The Control Plane remains in `agentic-delivery` to preserve existing issue and pull-request URLs.
- The All-repositories installation is an organization access choice, not an enrollment mechanism. At the 2026-09-24 audit, the observed invoker installation had All repositories access and a limited comment/review event set, while the Control Plane contract still expected selected repositories and a broader event set. The exact runtime installation-to-credential binding remains unverified; the separate Control Plane follow-up is [issue #60](https://github.com/agentic-delivery-lab/agentic-delivery/issues/60) under the new recovery parent issue #59. This Architecture ADR does not change the App installation or its contract.
- The available CLI identity could read organization issue-field definitions but could not read the App installation's repository list; that endpoint requires a separate user scope. Projects inventory was not read because `read:project` is absent. Neither limitation proves that a setting, Project, or permission is absent.
- `Delivery Readiness` remains the current live field name for the canonical Delivery State concept. ADR-0019 governs the separate, gated in-place migration; this ADR does not authorize that migration.
- Source issue #53 is closed and remains historical context only. Architecture PR #2 merged on 2026-09-24 and is the verified review for this ADR; the base record is official on Architecture `main`. Proposed issue #3 ownership and evidence amendments remain provisional until their issue-linked review PR is merged. This record does not authorize production activation or live configuration changes.
