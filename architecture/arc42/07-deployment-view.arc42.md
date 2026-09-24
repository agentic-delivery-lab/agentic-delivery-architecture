# 7. Deployment View

<!-- arc42:section 07 -->

## 7.1 Intended deployment topology

- GitHub hosts the six repositories, organization-level Issue Types and issue
  fields, Issues, pull requests, Actions, and optional Projects.
- A GitHub App installation grants repository access and emits subscribed
  events to the Control Plane. Installation access and the participant
  registry are separate gates.
- Control Plane workflows run bounded deterministic checks and route approved
  work to a pinned execution profile on the self-hosted runner.
- Architecture, Primitive, and Distribution sources are consumed through
  immutable commits and digests. Consumer repositories hold only the
  versioned integration/projection required by their surface.
- The public and private `.github` repositories provide their respective
  GitHub-defined repository surfaces. Distribution bootstrap supplies
  versioned environment and workflow artifacts.

This is the desired logical deployment. It does not imply that every
participant is active or that each hosting rule has been enabled.

## 7.2 Observed deployment snapshot (2026-09-24)

| Surface | Observed state | Evidence limit |
| --- | --- | --- |
| Organization issue fields | `Lifecycle Stage` ID 46888816 and `Delivery Readiness` ID 46888965; both visible to organization members. No `Delivery State` field found. | REST read confirmed definitions, not UI pinning to native Issue Types or issues without type. |
| Issue-field values | Separate issue-field API; the newly created #59 and #60 returned no values after their intake runs failed. | No claim about other issues. |
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

## 7.3 Access and change boundary

Read-only organization metadata access uses `read:org`; reading an issue's
field values uses a separate issue endpoint with repository access. A
`read:project` expansion was not requested because no project change is in
scope. Persistent `admin:org` is not a routine requirement. Any organization
field-definition change would require a separate, temporary, reviewed operator
action and is outside this Architecture change.

**Evidence:** see observations `organization-issue-fields`,
`organization-issue-field-values`, `cli-oauth-scopes`,
`invoker-installation`, `participant-modes-and-release-pins`,
`recovery-issue-intake-runs`, and `repository-releases-and-rulesets` in
[`system-evidence.yml`](../references/system-evidence.yml).
