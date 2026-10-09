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
| GitHub App, Actions, and repo protection | At 18:45:29, the organization installations endpoint returned three Apps. The selected-repository invoker (App 5011055, installation 163255060) subscribes to Issues, issue comments, pull requests and review events; it declares contents/Issues/pull-request writes and Issue Field/Type reads, with no Project permission. Vercel and ChatGPT Codex connector report all-repository selection. | The invoker's selected repository endpoint returned 403, so repository membership and deployed credential binding remain unverified. No App token or runtime write was tested. The private ruleset request returned 403; org policy does not prove each repo's effective settings or actual workflow pins. See `github-app-installation-inventory-20261009-1845`. |
| Vercel ingress and Neon replay store | The exact Control Plane main source contains the webhook function, scheduled reconciler, Neon adapter, and migrations; its runtime uses a pooled Neon connection. | Source presence does not prove deployment, secret configuration, migration state, webhook activation, successful reconciliation, or production data. |
| Run budgets and failure recovery | QR-017/QR-018 define per-run hard limits and durable recovery evidence across webhook, Actions/Codex, and evaluation replay. | No accepted end-to-end receipt proves all budget limits, hard-stop behavior, or safe recovery; available quota/spend values remain unknown when the approved runtime does not expose them. |
| Codex runtime | The exact Control Plane main source installs CLI 0.159.3; static review and an isolated package fixture verified instruction discovery and separate controller/task workspaces. | No Actions-run observation confirms the current runner binary, runtime CWD, or end-to-end issue delivery. |
| Product delivery | The strategy specifies an owning product repository and steward boundary. | The read-only six-repository inventory found no distinct product repository or accountable steward; no product bootstrap or outcome baseline is claimed. |
| GitHub Projects | At 18:39:35, complete GraphQL connections returned no Project for the organization, authenticated user, or six repository owners; organization and user CLI lists including closed Projects were also empty. Each of the 22 open Issues had zero Project items. The human identity has `project` and `admin:org`; organization REST capability flags for organization/repository Projects are true. | No Project is configured in the queried owner scopes. Membership, Project fields, views, and visibility could not be inspected. The selected-repository invoker declares no Projects permission; its exact repository membership and deployed credential binding remain unknown. |
| Organization Issue Types and Fields | At 18:38:50, REST returned nine enabled native Issue Types and six organization Issue Fields. Priority, Start date, Target date, Effort, Lifecycle Stage, and Delivery Readiness are all `organization_members_only`; stable IDs and select options are recorded in the current evidence event. | No Project exists to inspect Project-specific fields or field visibility. Organization Issue Field definitions and values are separate from Project custom fields; their fit in a future portfolio view remains unverified. |
| Per-issue field values | At 18:41:59, the documented `/issue-field-values` endpoint returned HTTP 200 and an empty array for each of the 22 open Issues in the six visible repositories. | This is a point-in-time read of open Issues only. It does not establish Issue Type pinning, why values are empty, or future Project visibility. |
| Control Plane execution | All six participants remain in shadow mode; latest run succeeded at authorization, classification, and finalization while delivery was skipped. | No completed delivery, central #62 canary, receipt completion, or independent field read-back is proven. |
| Control Plane release candidate | PR #86 for Codex CLI 0.160.0 remains open without reviews; current main uses a prior pin. | Passing checks do not constitute review, merge, smoke evidence, or activation. |
| Open work and releases | At 18:38:24, 22 open Issues and five open PRs remained; the six Release listings were empty. The 18:49 read found Architecture #14 at `7b3d1ff51a293c1800435bc99885af32afdf2bce`, BLOCKED with no recorded review decision; exact-head run 37975873683 passed. At 18:38, Control Plane #102 (`c98b24e5`) and #104 (`2cf258d5`) were CLEAN with no review decisions; #86 (`3c21e2aa`) was DIRTY; draft Primitives #4 (`b5f00505`) was BLOCKED and `REVIEW_REQUIRED`. Distribution and both GitHub adapters had no open PRs. Detailed non-Architecture PR check states were last read at 18:30:42. | Exact open Issues, PR heads, checks, and release state are recorded in system evidence. Passing checks do not equal review; draft pins do not prove activation. |

The current default-branch commits and observations are recorded in
[system evidence](../references/system-evidence.yml). The Projects inventory
found no organization, personal, or repository Project visible within the
queried owner scopes. The positive organization/repository capability flags
and active organization admin role do not grant Projects permission to the
selected-repository invoker App or replace the separate human decision on
Project topology.

At 17:02 UTC, a fresh GraphQL query with the expanded OAuth identity again
returned zero Project v2 nodes for the organization, authenticated user, and
all six repositories; 17:11 CLI queries including closed organization and user
Projects were also empty. The same identity could read the nine native Issue
Types and six member-only Issue Fields. No Project exists in these owner scopes
to inspect field options, views, or membership.

At 17:17 UTC, Control Plane Issue [#105](https://github.com/agentic-delivery-lab/agentic-delivery/issues/105)
was created as a native Task for run-budget and recovery work; its read-back
shows no Project item. The six visible repositories now have 20 open Issues.
The 17:37 GraphQL inventory again found no organization, user, or repository
Projects; 17:39 CLI listings including closed Projects were also empty. The
same snapshot recorded five open PRs, no published Releases, and 31
Control-Plane-only draft tags; exact heads and checks are in the cited system
evidence.
At 17:49 UTC, Control Plane #106 was created as a native Task under
Architecture #11 for pinned strategy context; it has no Project item. The
six-repository open-Issue count is now 21. The Issue is blocked on the normal
Architecture review/release and Control Plane contract dependencies; no
runtime deployment or Project configuration followed.

Between 18:38:15 and 18:44:44 UTC, a fresh read-only inventory confirmed no
Projects in the organization, authenticated user, or six repository owners,
and no Project item association for any of the 22 open Issues. All 22
documented Issue Field value reads returned HTTP 200 with empty arrays. The
organization catalog returned nine enabled Issue Types and six member-only
Issue Fields; the six repository `main` commits and Issue counts were
unchanged. Five PRs remained open and the six Release listings were empty.
Exact values, IDs, head commits, and evidence limits are in
`portfolio-issue-project-inventory-20261009-1839`.
At 18:45:29 UTC, a separate organization installation read returned three
Apps. The Control Plane invoker declares no Project permission, and its
selected-repository listing returned 403; the exact app/event/permission data
is recorded in `github-app-installation-inventory-20261009-1845`.

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
mutation was performed. The org role does not provide Project permission to
the runtime App, and no Project topology or configuration approval was given.
Persistent `admin:org` is not a routine requirement. Any organization
field-definition change would require a separate, temporary, reviewed
operator action and is outside this Architecture change.

The 17:02–17:39 recheck observed the authenticated `sjefsharp` account with
broad OAuth scopes including organization, hook, repository, deletion,
package, user, workflow, `project`, and `admin:org`. These scopes enabled the
current Project, Issue Type, Issue Field, and App-installation metadata reads;
they remain human OAuth authority and do not authorize writes through or
expand the App.

The 10:44 UTC organization inventory also reported `allowed_actions=all` and
`sha_pinning_required=false`; this is organization policy, not an audit of each
repository's Actions settings or workflow references. At 17:25 UTC, the
organization installations endpoint returned the invoker App's permission
map without `organization_projects` or `repository_projects`. The endpoint
does not reveal the selected repository list to this identity; its membership
read returned 403, and no App token or runtime operation was tested. The
earlier App-JWT request failure remains historical, not the current
installation-permission result. Organization-level
Actions secrets and variables returned zero; repository-level values were not
queried. The private adapter's ruleset API returned a plan-related 403, which
does not prove the ruleset is absent.

**Evidence:** see observations `organization-issue-fields`,
`project-inventory-20261009-1153`,
`expanded-gh-auth-project-and-issue-inventory-20261009-1711`,
`control-plane-budget-recovery-issue-created-20261009-1717`,
`github-app-installation-permissions-20261009-1725`,
`portfolio-issue-project-inventory-20261009-1839`,
`pull-request-release-inventory-20261009-1924`,
`primitives-offline-evaluation-refresh-20261009-1924`,
`control-plane-strategy-context-issue-created-20261009-1749`,
`issue-field-values-20261009-1152`,
`current-open-work-and-pull-requests-20261009-1153`,
`current-organization-capability-inventory-20261009-1044`,
`organization-issue-field-values`, `cli-oauth-scopes`,
`invoker-installation`, `participant-modes-and-release-pins`,
`recovery-issue-intake-runs`, and `repository-releases-and-rulesets` in
[`system-evidence.yml`](../references/system-evidence.yml).
