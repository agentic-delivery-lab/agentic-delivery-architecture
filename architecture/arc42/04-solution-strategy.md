# 4. Solution Strategy

<!-- arc42:section 04 -->

## 4.1 Ownership before integration

Give every durable decision, runtime contract, primitive, and bootstrap
artifact one owner. Consumers pin and reference the owner. Use a generated
projection only where a consumer surface requires local files, and attach
repository identity, source commit, content digest, policy version, and
compatibility target.

Architecture Authority is the proposed canonical text owner for every
organization ADR, ADP, and ADD record. A decision retains its bounded-context
scope, and the affected context stewards review its semantics. The context
repositories keep runtime, implementation, catalog, and bootstrap artifacts.
The current owner and provenance inventory is in
[section 9](09-architecture-decisions.md) and
[decisions/README.md](../../decisions/README.md).

## 4.2 Portfolio planning and authorized work

GitHub Projects is the primary portfolio surface for both value streams. The
proposed minimum topology is one organization portfolio Project with separate
Factory Evolution and Software Product Delivery views, reusing a suitable
existing Project if an authorized inventory confirms fit. The latest complete
read-only recheck, completed 2026-10-12 09:17–09:22 UTC, found no Project in the
authenticated-viewer, organization, or six repository scopes and no Project
association across all 62 Issues. All 24 open Issues had zero organization
Issue Field Values. The same inventory found six organization Issue Fields,
nine native Issue Types, and Free organization plan support; Project-specific
ownership, fields, views, and visibility could not be inspected because no
Project existed. A Project-only card can be discussed and prioritized but
cannot authorize execution. See
`system-evidence.yml#portfolio-project-issue-association-recheck-20261012-0922`.

Every executable unit of work has a source Issue in its owning repository.
The Project links that Issue and may own distinct portfolio planning facts.
Issue intent, Issue Type, Priority, Lifecycle Stage, the delivery-readiness
value, and authorization remain with the source Issue and organization Issue
Field contracts. The current organization Issue Field is named `Delivery
Readiness`; the live inventory returned no field named `Delivery State`. Use
the existing Issue-owned Priority value for per-Issue priority
where the approved Project view can expose it; a Project field must not
silently duplicate that value. The issue-field catalog is currently
organization-members-only and Project-view suitability has not been verified.

The intended operating loop is source Issue → Project prioritization →
deterministic authorization → bounded implementation → pull request →
independent validation and evaluation → human review and merge → outcome
evidence → improvement Issue → Project prioritization. The diagrams under
[architecture diagrams](../diagrams/README.md) show the value streams,
strategic alignment, portfolio lifecycle, factory evolution, product delivery,
and trust boundaries. Project planning remains a proposed integration because
the latest read-only recheck found no Project in the queried scopes; see the
evidence events above.

## 4.3 Proposal and enforcement

The Control Plane accepts an eligible GitHub event for an authorized source
Issue, retrieves its origin identity and participant contract, and obtains a
structured semantic proposal. Project membership or events supply planning
context only.
It then checks the proposal against repository identity, permissions, schema,
issue type, fields and options, lifecycle transitions, governance controls,
dependencies, and allowed orchestration patterns. Only a valid proposal may
write to the originating repository. A failed or unavailable gate leaves work
state unchanged and records bounded evidence.

This strategy is a desired contract. The current issue-intake workflow failed
for recovery issues #59 and #60 before dependency installation; the relevant
Actions runs are linked in
[`system-evidence.yml`](../references/system-evidence.yml). Passing unit
tests do not establish live issue-field pinning or end-to-end write-back.

## 4.4 Versioned release and rollout

Architecture releases select the ADR set and conformance policy. The Primitive
catalog records affected primitive identifiers, versions, ADR references,
and domains. Distribution bundles pin compatible Architecture, Control Plane,
and Primitive sources. A consumer upgrade is validated in shadow mode, then
rolled out with provenance and a tested rollback to its previous exact pins.
The six currently registered participants remain in shadow mode in the
observed Control Plane baseline.

## 4.5 Three delivery paths

1. **Product delivery loop:** when a steward-owned product repository exists,
   product work starts from a typed Issue in that repository. When no
   steward-owned product repository is confirmed, record requirements,
   ownership discovery, and the intended user or operator outcome in an Issue
   in an existing owning repository. A human must approve the repository
   choice, access, stewardship, and feedback path; creating a repository and its
   pinned bootstrap require explicit approval. Only an owned, onboarded
   repository can own product Issues. Link the product Issue to the approved
   Project for prioritization and progress visibility. Deterministic gates
   authorize one bounded writer; a Validator checks the change; a pull request
   is independently reviewed and merged by a human. Product evidence after delivery informs the
   next Issue. No product repository or accountable steward is currently
   identified.
2. **Factory evolution loop:** a factory defect, capability gap, or measured
   improvement becomes an Issue in its owning factory repository, is
   prioritized in Projects, and follows the same authorized delivery and
   human-review path. Evaluation and operational findings return to Issues;
   they do not start recursive execution.
3. **Long-running fan-out/fan-in:** researchers work read-only in parallel;
   one coordinator synthesizes the evidence; one implementer owns the feature
   branch; an independent Validator checks it. Researchers do not write to the
   implementation branch.
4. **Continuous improvement loop:** a validated issue leads to a cross-context
   ADR or contract update, a reviewed harness or Primitive release, and a
   version-pinned Distribution rollout. Each participant records provenance,
   upgrade evidence, and rollback pins.

These are composable paths selected by the issue and orchestration policy, not
a required waterfall.

## 4.6 Documentation and methods

The architecture uses arc42's template and iterative docs-as-code method.
Changes to Markdown, YAML, and diagram sources are reviewed alongside their
contracts. ISO/IEC/IEEE 42010:2022 terms connect stakeholders and concerns to
viewpoints and views. TOGAF is not applied: no evidence shows a concrete
benefit beyond the direct traceability already supplied by goals, ADRs,
principle consequences, context maps, and release pins.

**Evidence:** the proposed purpose, mission, value streams, goals, measures,
and guardrails are in the
[canonical strategy source](../strategy/organizational-strategy.yml).
Projects planning and Issue authorization are proposed in ADR-0023 and AP-004.
Other desired strategy is based on AP-001/AP-002 and ADR-0011, ADR-0012,
ADR-0013, and ADR-0018. Current operation and release states are pinned in
[system evidence](../references/system-evidence.yml).
