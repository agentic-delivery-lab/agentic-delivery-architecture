# 7. Deployment View

<!-- arc42:section 07 -->

## 7.1 Intended deployment topology

- GitHub hosts the six repositories, organization-level Issue Types and issue
  fields, Issues, pull requests, Actions, and the primary planning surface in
  GitHub Projects. Issues remain the canonical work and execution-authorization
  records.
- A GitHub App installation grants repository access and emits subscribed
  events to the Vercel webhook ingress. Vercel verifies and bounds dispatch to
  the controller repository; installation access and the participant
  registry remain separate gates.
- Vercel and the Control Plane Actions workflows use a shared Neon-backed
  replay store for delivery claims, controller receipts, and reconciliation
  checkpoints. These are distinct from Codex session state and evaluation
  replay.
- Control Plane workflows run bounded deterministic checks and route approved
  work to a pinned Codex CLI execution profile on the self-hosted runner.
- Architecture, Primitive, and Distribution sources are consumed through
  immutable commits and digests. Consumer repositories hold only the
  versioned integration/projection required by their surface.
- The public and private `.github` repositories provide their respective
  GitHub-defined repository surfaces. Distribution bootstrap supplies
  versioned environment and workflow artifacts.

This is the desired logical deployment. It does not imply that every
participant is active or that each hosting rule has been enabled.

## 7.2 Current inventory snapshot (2026-10-09)

| Surface | Observed state | Evidence limit |
| --- | --- | --- |
| Repository sources | Six factory repositories and adapters have current main commit pins in system evidence. | Pins identify the observed default-branch commits; they do not prove release compatibility or active deployment. |
| GitHub App, Actions, and repo protection | At 10:44 UTC, organization Actions settings reported all repositories enabled, all Actions allowed, and full-SHA pinning not required. Active workflow/ruleset counts were Control Plane 13/1, public adapter 2/1, Architecture 1/2, Primitives 1/1, Distribution 1/1, and private adapter 1/unavailable. Nine organization Issue Types were readable. | The private ruleset request returned 403 under the reported plan; App installation lookup returned 401 for the OAuth request. Org policy does not prove each repo's effective settings or actual workflow pins. |
| Vercel ingress and Neon replay store | The exact Control Plane main source contains the webhook function, scheduled reconciler, Neon adapter, and migrations; its runtime uses a pooled Neon connection. | Source presence does not prove deployment, secret configuration, migration state, webhook activation, successful reconciliation, or production data. |
| Codex runtime | The exact Control Plane main source installs CLI 0.159.3; static review and an isolated package fixture verified instruction discovery and separate controller/task workspaces. | No Actions-run observation confirms the current runner binary, runtime CWD, or end-to-end issue delivery. |
| Product delivery | The strategy specifies an owning product repository and steward boundary. | The read-only six-repository inventory found no distinct product repository or accountable steward; no product bootstrap or outcome baseline is claimed. |
| GitHub Projects | At 11:51 UTC, the authenticated CLI and complete organization, personal, and six repository GraphQL inventories returned zero Projects. All 19 open Issues returned zero Project associations. The organization REST response reported `plan=free`, `has_organization_projects=true`, and `has_repository_projects=true`; the membership endpoint returned `state=active`, `role=admin` for `sjefsharp`. | Projects are available as organization/repository features, but no Project is configured or visible within the queried owner scopes. Membership, fields, views, and visibility could not be inspected; App access and Projects owned outside the organization/user scopes remain unknown. |
| Organization Issue Fields | Six fields were read; Priority, dates, effort, Lifecycle Stage, and Delivery Readiness are all organization-members-only. | Current Project visibility fit and Issue Field pinning remain unverified. |
| Per-issue field values | At 11:52 UTC, the documented `/issue-field-values` endpoint returned an empty array for each of the 19 open Issues in the six visible repositories. | The read is limited to open Issues at that time. It does not establish Issue Type pinning or future Project visibility. The earlier request path was not captured and its 404 is inconclusive. |
| Control Plane execution | All six participants remain in shadow mode; latest run succeeded at authorization, classification, and finalization while delivery was skipped. | No completed delivery, central #62 canary, receipt completion, or independent field read-back is proven. |
| Control Plane release candidate | PR #86 for Codex CLI 0.160.0 remains open without reviews; current main uses a prior pin. | Passing checks do not constitute review, merge, smoke evidence, or activation. |
| Open work and releases | The 11:53 UTC snapshot records 19 open Issues and four open PRs: Architecture #14 at `d3fd429` (BLOCKED), Control Plane #102 at `c98b24e` (CLEAN) and #86 at `3c21e2a` (DIRTY), and Primitives #4 at `b5f0050` (BLOCKED). None has an approved human review decision. Architecture #14's exact-head validation passed. No Architecture GitHub Release was listed. | Exact open Issues, PR heads, checks, and release state are recorded in system evidence. Passing checks do not equal review; draft pins do not prove activation. |

The current default-branch commits and observations are recorded in
[system evidence](../references/system-evidence.yml). The Projects inventory
found no organization, personal, or repository Project visible within the
queried owner scopes. The positive organization/repository capability flags
and active organization admin role do not provide GitHub App installation
access or replace the separate human decision on Project topology.

## 7.3 Historical deployment snapshot (2026-09-24)

| Surface | Observed state | Evidence limit |
| --- | --- | --- |
| Organization issue fields | `Lifecycle Stage` ID 46888816 and `Delivery Readiness` ID 46888965; both visible to organization members. No `Delivery State` field found. | REST read confirmed definitions, not UI pinning to native Issue Types or issues without type. |
| Issue-field values | The historical read for #59 used `/issues/59/fields`, which is not the documented Issue Field values route; the recorded conclusion for #59 and #60 is inconclusive. | See the corrected 2026-10-09 read of `/issue-field-values`; it does not reconstruct historical values. |
| CLI scopes | `gist`, `read:org`, `repo`, `workflow`; no `read:project` or `admin:org`. | Projects were not inventoried. Routine work did not request organization-admin scope. |
| Invoker App installation | `agentic-delivery-lab-invoker-7f3a`, installation 163255060, All repositories, events `issue_comment`, `pull_request_review`, and `pull_request_review_comment`. | Repository list and binding to Control Plane credentials were not verified. |
| Control Plane participants | All six listed participants use shadow mode. Controller pin is `0.2.0-draft.37`; Architecture and Primitive pins are draft releases. | No active participant or end-to-end write-back was observed. |
| Issue-intake workflow | The classify job used a different checkout path from its configured working directory; the two recovery runs failed before dependency installation. | Workflow repair and live retest belong to the Control Plane phase. |
| Control Plane ruleset | Active required check: `Validate pull request body`. | Does not prove review requirements or rules in other repositories. |
| Public adapter ruleset | Active required check: `Validate pull request body`. | Does not prove template inheritance or other repositories' checks. |
| Architecture rulesets | Separate review and pull-request rules were present; a required review rule and check do not prove every semantic review occurred. | Repository-scoped hosting evidence only. |
| Private adapter | Branch API reported `protected=false`; ruleset query returned 403 on the current plan. Publication surface is `pending-entitlement`; agent lock has zero entries. | Ruleset state and entitlement remain unknown, not confirmed absent. |
| Releases | No published releases or tags were found in the six repositories. | Draft manifests and source pins remain unpromoted. |

The complete immutable repository commit pins and live API/run references are
in [system evidence](../references/system-evidence.yml). The above table keeps
desired topology separate from observed deployment.

## 7.4 Access and change boundary

The initial Projects read failed because the session lacked Project access.
The later read-only inventory ran after `gh auth status` reported `project`,
`admin:org`, and `repo`; the CLI and all organization, personal, and repository
GraphQL connections returned no Project, and all 19 open Issues had zero
Project associations. The organization REST response reported Projects
available for organization and repository use under its Free plan, and a
separate membership read confirmed the authenticated user has the active
organization role `admin`. No scope change was requested and no Project
mutation was performed. The org role does not establish GitHub App
installation access, and no Project topology or configuration approval was
given. Persistent `admin:org` is not a routine requirement. Any organization
field-definition change would require a separate, temporary, reviewed
operator action and is outside this Architecture change.

The 10:44 UTC organization inventory also reported `allowed_actions=all` and
`sha_pinning_required=false`; this is organization policy, not an audit of each
repository's Actions settings or workflow references. The App installation
lookup failed because the OAuth request did not supply a decodable App JWT, so
installation identity and permissions remain unknown. Organization-level
Actions secrets and variables returned zero; repository-level values were not
queried. The private adapter's ruleset API returned a plan-related 403, which
does not prove the ruleset is absent.

**Evidence:** see observations `organization-issue-fields`,
`project-inventory-20261009-1153`,
`issue-field-values-20261009-1152`,
`current-open-work-and-pull-requests-20261009-1153`,
`current-organization-capability-inventory-20261009-1044`,
`organization-issue-field-values`, `cli-oauth-scopes`,
`invoker-installation`, `participant-modes-and-release-pins`,
`recovery-issue-intake-runs`, and `repository-releases-and-rulesets` in
[`system-evidence.yml`](../references/system-evidence.yml).
