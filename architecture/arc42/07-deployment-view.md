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

## 7.2 Current inventory snapshot (observations dated per surface)

| Surface | Observed state | Evidence limit |
| --- | --- | --- |
| Repository sources | The six default-branch commits are Control Plane 9a2e1f3549428bc042d5c59d09beb300ca2d1362, Architecture 61d99cbcca175f5bb5de4277d21f2ce4d56cbd0c, Primitives e4933566fbf5b0f593830f8933f18fbd21024fa7, Distribution b69c5710928b47efc4d3ab12ec4d5b596c80720c, public .github af52c92e49616e78f8d6647cf5cf538a7e571d78, and private .github-private f9e6589b65c71da9e7b35d8e026f3d4a91dab78f. | Observed branch heads do not prove compatibility or active deployment. |
| GitHub Projects and Issues | The 10:50 UTC complete recheck returned no Projects in the viewer, organization, or six repository scopes and no Project item on any of the 62 Issues. The separate 09:17–09:22 UTC metadata inventory found no organization Issue Field Values on the 24 open Issues, six organization Issue Fields, nine native Issue Types, #111 typed as a Bug under #105, and five untyped open Issues. | No Project exists in the queried scopes to inspect membership, fields, views, or visibility. The metadata inventory does not establish Project-specific field visibility or App access. Empty Issue values do not establish a lifecycle transition. See `strategy-publication-surface-and-project-recheck-20261012-1054` and `portfolio-project-issue-association-recheck-20261012-0922` in system evidence. |
| GitHub Apps, Actions, and protection | Three App installations were listed. The Control Plane invoker installation selects repositories and has Contents/Issues/PR write plus Issue Field/Type read, with no Projects permission; its selected-repository API returned 403. Organization Actions allow all actions, do not require SHA pinning, and are enabled for all repositories. Public rulesets were read; the private ruleset endpoint returned 403. | The selected repository set, deployed credential binding, and private ruleset state remain unknown. Organization policy does not prove individual workflow pins or runtime behavior. |
| Pull requests and Releases | The 11:48 UTC six-repository PR inventory found eight open PRs. Control Plane #112 is draft/clean; #86/#109/#110 are clean. Architecture #16 is blocked on review and #17 is draft/clean at `c241997ca864fd1842ba0c2d79bcec9b8cfffb91`, stacked on #16 at `c11164c1cb387ca3b36706c6da3a1a1d6bdd5a5f`; exact-head validation run [38243930448](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/actions/runs/38243930448) passed. Primitives #4 is draft/blocked and #5 is blocked on review; Distribution and both `.github` adapters have no open PRs. Control Plane #112 remains draft at `996e9bf2254c23de288dd21612b213f7780bdb4c`; its checks pass, but its held-receipt retry semantics and live migration prerequisite remain unresolved. The latest six-repository Release inventory (06:22 UTC) listed no releases. | Passing CI is not human review, release adoption, participant activation, or production acceptance. Architecture #17 remains stacked on #16 and is not an approved Architecture release. See `portfolio-runtime-and-pr17-recheck-20261012-1156` in system evidence. |
| Production runtime | The 2026-10-12 05:56 UTC Vercel recheck found production deployment `dpl_5hgNTb6CWoTqVv5TBCMqFYFRoMKZ` READY on Control Plane `main` commit `9a2e1f3549428bc042d5c59d09beb300ca2d1362`; five webhook POSTs for Architecture returned HTTP 202. Invocation and reconciler observations are detailed in §7.2.1. | Readiness and HTTP 202 do not prove signature validation, durable receipts, successful delivery, or reconciler execution. Production Neon data was not read. See `system-evidence.yml#vercel-production-runtime-recheck-20261012-0556`. |
| Control Plane invocation | The latest observed repository-dispatch run on Control Plane `main` was 38227232599 at 09:01 UTC. Authorization, classification, and finalization passed on `9a2e1f3549428bc042d5c59d09beb300ca2d1362`; delivery was skipped because the participant remained in shadow mode. | This is not end-to-end delivery. Two 08:14 UTC runs failed explicit-invocation validation and skipped finalization/delivery; the 05:56 production snapshot separately records an earlier finalizer failure. See `portfolio-runtime-and-pr17-recheck-20261012-1156` and `vercel-production-runtime-recheck-20261012-0556`. |

The broad read-only inventory, exact identities, PR heads, check runs, and
scope limits are recorded in
[system evidence](../references/system-evidence.yml#strategy-live-inventory-recheck-20261011-1914).
The latest complete Project and Issue association recheck, completed at 10:50
UTC, found no Project or Project-item association across all 62 Issues; see
`system-evidence.yml#strategy-publication-surface-and-project-recheck-20261012-1054`.
The separate 09:17–09:22 UTC metadata inventory records Issue Field values,
Issue Types, and assignments in
`system-evidence.yml#portfolio-project-issue-association-recheck-20261012-0922`.
The 11:48 UTC pull-request, runtime, and exact-head refresh is recorded in
`system-evidence.yml#portfolio-runtime-and-pr17-recheck-20261012-1156`. App installations,
Actions policy, rulesets, Release listings, and production runtime remain tied
to their separately dated observations. The inventory does not approve a
Project topology. No Project, App permission, participant, or runtime setting
changed.

### 7.2.1 Production and invocation recheck (2026-10-12 05:56 UTC)

| Surface | Observed state | Evidence limit |
| --- | --- | --- |
| Production deployment | Vercel deployment `dpl_5hgNTb6CWoTqVv5TBCMqFYFRoMKZ` is `READY` on Control Plane `main` commit `9a2e1f3549428bc042d5c59d09beb300ca2d1362`; GitHub deployment `6987095413` reports success. | Readiness does not prove webhook processing, receipt persistence, or completed delivery. |
| Webhook ingress | The seven-day request-log query for Architecture repository ID `1380894616` found five webhook POSTs, all HTTP 202. The detailed function-log sample includes `pull_request:synchronize` at 05:03:52.353 UTC and `issues:edited` at 05:04:44.069 UTC. | HTTP 202 is an accepted response, not proof of signature verification, durable state, Actions completion, or downstream delivery. |
| Invocation finalization | Actions run 38206400933 on that same `main` commit passed authorization, classification, and route validation. Finalization failed because the checked-out participant pin `7d38227f7f8d8377ed7cd1b883d90b71b69bfc9` lacks `scripts/finalize-agent-invocation.mjs`; the command failed with `MODULE_NOT_FOUND`. The participant is in shadow mode, so delivery was skipped. | No terminal receipt or successful delivery was established. Production Neon data was not read, and request logs do not correlate a particular webhook with the Actions run. Pin repair belongs to a reviewed Control Plane change. |
| Scheduled reconciliation | Production configuration declares `/api/cron/reconcile-webhooks` on a daily 00:00 UTC schedule. | No reconciler request was observed in the seven-day request-log query; configuration does not prove a cron execution. |

### 7.2.2 Invocation and PR recheck (2026-10-12 08:14–11:56 UTC)

| Surface | Observed state | Evidence limit |
| --- | --- | --- |
| Explicit invocation validation | Runs [38222376379](https://github.com/agentic-delivery-lab/agentic-delivery/actions/runs/38222376379) and [38222376214](https://github.com/agentic-delivery-lab/agentic-delivery/actions/runs/38222376214) passed authorization but failed explicit-invocation validation at 08:14 UTC. Finalization and delivery were skipped. | These runs did not create a completed invocation receipt and do not establish delivery behavior. |
| Shadow invocation | Run [38227232599](https://github.com/agentic-delivery-lab/agentic-delivery/actions/runs/38227232599) on Control Plane `main` commit `9a2e1f3549428bc042d5c59d09beb300ca2d1362` passed authorization, classification, and finalization at 09:01 UTC using controller commit `08728c4210ec2d227eec2b6c182dcf3bafd80db1`. The finalizer persisted completion/retryability; delivery was skipped in shadow mode. | A successful finalizer with delivery skipped does not prove a completed product or factory task, write-back, or runtime acceptance. |
| Recovery follow-up | Control Plane PR #112 remains OPEN/DRAFT/CLEAN at `996e9bf2254c23de288dd21612b213f7780bdb4c`, with passing named checks and no human review decision. | Read-only review found unresolved routing holds can be finalized as completed, preventing retry. Migration 0008 has not been proven applied to the live database; do not treat the draft as accepted recovery behavior. |
| Architecture PR #17 | PR #17 remains OPEN/DRAFT/CLEAN at `c241997ca864fd1842ba0c2d79bcec9b8cfffb91`, stacked on PR #16 at `c11164c1cb387ca3b36706c6da3a1a1d6bdd5a5f`; exact-head validation run [38243930448](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/actions/runs/38243930448) passed. | No human review decision is recorded. PR #17 remains a proposal and is not an approved Architecture release. |

The exact run states, source inventory, PR heads, and review limits are recorded
in `system-evidence.yml#portfolio-runtime-and-pr17-recheck-20261012-1156`.

### 7.2.3 Hold-retry fix in Control Plane PR #112 (2026-10-12 12:30 UTC)

| Surface | Observed state | Evidence limit |
| --- | --- | --- |
| Control Plane PR #112 | The draft head is `61f0565e4208eeb7c7b7477032e9a023592be757`; it makes an empty or `hold` route produce a retryable receipt when delivery is skipped. Non-hold shadow/read-only skips preserve the current intentional completion behavior. Hosted quality, recovery-SQL, all three portability jobs, ADR validation, PR-body validation, Vercel, and Harness review checks pass; `classify_updater` is skipped by policy. | Control Plane `main` remains `9a2e1f3549428bc042d5c59d09beb300ca2d1362`; the change is not merged and has no human review decision. Migration 0008 remains unverified in the live database, and these checks do not prove end-to-end delivery. See `system-evidence.yml#control-plane-pr112-hold-retry-validation-20261012-1230`. |

See `system-evidence.yml#vercel-production-runtime-recheck-20261012-0556`
and `system-evidence.yml#control-plane-invocation-runtime-recheck-20261012-0555`.

## 7.3 Historical deployment snapshot (2026-10-09; observation times shown per surface)

| Surface | Observed state | Evidence limit |
| --- | --- | --- |
| Repository sources | Six factory repositories and adapters have current main commit pins in system evidence. | Pins identify the observed default-branch commits; they do not prove release compatibility or active deployment. |
| GitHub App, Actions, and repo protection | At 19:35:52, the organization installations endpoint returned three Apps. The selected-repository invoker (App 5011055, installation 163255060) subscribes to Issues, issue comments, pull requests and review events; it declares contents/Issues/pull-request writes and Issue Field/Type reads, with no Project permission. Vercel and ChatGPT Codex connector report all-repository selection. The invoker repository-list request returned 403. | The invoker's selected repository membership and deployed credential binding remain unverified. No App token or runtime write was tested. The private ruleset endpoint returned 403; org policy does not prove each repo's effective settings or actual workflow pins. See `system-evidence.yml#github-app-installation-inventory-20261009-1935`. |
| Vercel ingress and Neon replay store | At 19:45, the visible Vercel team had one `agentic-delivery` project (`prj_pMRZLeDcqIzWGwLU5yeLGgLY7vss`), Node.js `24.x`, `live=false`, and no reported framework. Its latest production deployment was `READY` on Control Plane `main` commit `67e5941a`; the latest overall deployment was a `READY` preview of PR #104 commit `2cf258d5`. The exact Control Plane `main` source contains the webhook function, scheduled reconciler, Neon adapter, and migrations. | The Vercel `live` value is uninterpreted. Deployment metadata does not establish route health, webhook delivery, App credential binding, event processing, Neon connectivity, migration state, reconciliation, or production data. No Neon-specific connector was available. See `system-evidence.yml#vercel-deployment-inventory-20261009-1945`. |
| Run budgets and failure recovery | QR-017/QR-018 define per-run hard limits and durable recovery evidence across webhook, Actions/Codex, and evaluation replay. | No accepted end-to-end receipt proves all budget limits, hard-stop behavior, or safe recovery; available quota/spend values remain unknown when the approved runtime does not expose them. |
| Codex runtime | The exact Control Plane main source installs CLI 0.159.3; static review and an isolated package fixture verified instruction discovery and separate controller/task workspaces. | No Actions-run observation confirms the current runner binary, runtime CWD, or end-to-end issue delivery. |
| Product delivery | The strategy specifies an owning product repository and steward boundary. | The read-only six-repository inventory found no distinct product repository or accountable steward; no product bootstrap or outcome baseline is claimed. |
| GitHub Projects | At 19:34–19:35, complete GraphQL connections returned no Project for the organization, authenticated user, or six repository owners; organization and user CLI lists including closed Projects were also empty. Each of the 22 open Issues had zero Project items. The human identity has `project` and `admin:org` scopes and active organization-admin membership; REST capability flags are true on the Free plan. | No Project is configured in the queried scopes. Fields, views, membership, and visibility cannot be inspected. The selected-repository invoker declares no Projects permission, and its exact repository membership and deployed credential binding remain unknown. See `system-evidence.yml#portfolio-issue-project-inventory-20261009-1935`. |
| Organization Issue Types and Fields | At 19:35, REST returned nine enabled native Issue Types and six organization Issue Fields. Priority, Start date, Target date, Effort, Lifecycle Stage, and Delivery Readiness remain `organization_members_only`; stable IDs and select options are recorded in the current evidence event. | No Project exists to inspect Project-specific fields or field visibility. Organization Issue Field definitions and values are separate from Project custom fields; their fit in a future portfolio view remains unverified. See `system-evidence.yml#portfolio-issue-project-inventory-20261009-1935`. |
| Per-issue field values | At 19:34–19:35, the documented `/issue-field-values` endpoint returned HTTP 200 and an empty array for each of the 22 open Issues in the six visible repositories. | This is a point-in-time read of open Issues only. It does not establish Issue Type pinning, why values are empty, or future Project visibility. See `system-evidence.yml#portfolio-issue-project-inventory-20261009-1935`. |
| Control Plane execution | All six participants remain in shadow mode; latest run succeeded at authorization, classification, and finalization while delivery was skipped. | No completed delivery, central #62 canary, receipt completion, or independent field read-back is proven. |
| Control Plane release candidate | PR #86 for Codex CLI 0.160.0 remains open without reviews; current main uses a prior pin. | Passing checks do not constitute review, merge, smoke evidence, or activation. |
| Open work and releases | At 19:35:52, five PRs remained open and the six Release listings were empty. At 19:50:27, Architecture #14 had advanced to `8de9003c` (`BLOCKED`, no review decision) and exact-head run [37982904873](https://github.com/agentic-delivery-lab/agentic-delivery-architecture/actions/runs/37982904873) passed; the strategy draft has eight goals and thirteen measures. The 19:35 read found Control Plane #102 (`c98b24e5`) and #104 (`2cf258d5`) `CLEAN` with passing listed checks and no human review decisions; #86 (`3c21e2aa`) `DIRTY` with passing listed checks; draft Primitives #4 (`0b75ed7e`) `BLOCKED` and `REVIEW_REQUIRED` with exact-head run 37979821675 passed. Distribution and both adapters had no open PRs, and no workflow was in progress in the six repos. | Passing checks do not equal human review, merge, publication, runtime pin adoption, participant activation, or deployment. Draft tags were not queried. See `system-evidence.yml#pull-request-release-inventory-20261009-1935` and `#architecture-pr14-validation-20261009-1950`. |

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

## 7.4 Historical deployment snapshot (2026-09-24)

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

## 7.5 Access and change boundary

The latest Project-existence and Issue-association inventory is
system-evidence.yml#strategy-publication-surface-and-project-recheck-20261012-1054;
it found no Project-item association across all 62 Issues. The separate
system-evidence.yml#portfolio-project-issue-association-recheck-20261012-0922
records Issue Field Values, Issue Types, and assignments; it found no values
on any of the 24 open Issues and confirmed the actual Issue Field is named
`Delivery Readiness`, not `Delivery State`. App, ruleset, runtime, and release
observations remain separately dated in their evidence events.
The latest App-permission evidence remains
system-evidence.yml#strategy-live-inventory-recheck-20261011-1914; it confirms
that human OAuth scopes do not grant Projects access to the runtime App, and
the selected repository list remains unavailable to this identity. No
Project topology was approved.

The initial Projects read failed because the session lacked Project access.
The later read-only inventory ran after `gh auth status` reported `project`,
`admin:org`, and `repo`; earlier organization, personal, and repository
GraphQL reads returned no Project. A targeted 2026-10-11 19:33 recheck found
no Project items on the 23 then-open Issues; this is a historical snapshot,
superseded by the complete 2026-10-12 inventory above. No scope change was
requested and no Project mutation was performed. The org role does not provide
Project permission to the runtime App, and no Project topology or configuration
approval was given.
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
