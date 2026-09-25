# arc42 chapter profile

This repository follows the twelve-section arc42 9.0 template pinned in
[`../references/tooling-lock.json`](../references/tooling-lock.json). The
official [Markdown multi-page download](https://arc42.org/download/) and
[complete examples](https://github.com/arc42/examples.arc42.org-site) inform
the chapter-per-file layout. arc42 is a template and documentation method,
not a formal conformance standard or a rule for every filename in this
repository.

Chapter paths use `NN-title.md`. The section number and heading follow the
official template; the title stem remains descriptive. Every chapter includes
an `**Evidence:**` note that identifies pinned sources and distinguishes
observed facts from target contracts. Cite repository, immutable commit, and
path for external repository facts; cite the evidence snapshot and endpoint or
run URL for live observations. Do not present a repository definition as proof
of live GitHub enforcement or runtime behavior.

| Section | Stakeholder concern and required content | Evidence expectation |
| --- | --- | --- |
| 01 Introduction and Goals | Who uses or changes the system, their concerns, architecture goals, and the viewpoints and views that address them. | Goals must trace to the recovery brief or a cited decision; name stakeholder groups and link each concern to a view. |
| 02 Architecture Constraints | Constraints from repositories, tools, standards, platform interfaces, and organization policy. | Cite the pinned source or official external reference; state version and whether it is a constraint or a chosen local convention. |
| 03 Context and Scope | System boundary, four bounded contexts, context relationships, external actors, adapters, and context-specific language. | Cite the context register, context map, source commit, and live evidence limits where applicable. |
| 04 Solution Strategy | Decisions that address the goals and quality scenarios, including the three work paths and release sequencing. | Link the goal, decision, expected consequence, and evidence; label target behavior separately from observed behavior. |
| 05 Building Block View | Architecture, Control Plane, Primitives, Distribution, and GitHub adapter responsibilities and interfaces. | Each ownership claim cites its source; cross-context contracts identify immutable release or source pins. |
| 06 Runtime View | Relevant issue-to-delivery paths, including gated short work, independent fan-out/fan-in, and feedback into controlled releases. | Use sequence/model sources and pinned workflow evidence; mark paths not yet demonstrated as target contracts. |
| 07 Deployment View | Intended deployment topology and observed repository, App, participant, field, and ruleset state. | Separate source-defined topology from live observations. Give observation date, endpoint/run, repository identity, and access limitations. |
| 08 Crosscutting Concepts | Ownership, authorization, evidence, versioning, failure handling, security boundaries, and cross-context semantics. | Cite the decisions/contracts that establish each concept and identify the owning bounded context. |
| 09 Architecture Decisions | The decisions shaping the architecture description and the record ownership, scope, provenance, and review route. | Resolve each ID through the canonical inventory and release; distinguish historical origin from current canonical text. |
| 10 Quality Requirements | Measurable quality scenarios, stakeholders, stimuli, responses, measures, evidence, and status. | Each scenario has an observable measure and evidence; state when the measure is a target without runtime proof. |
| 11 Risks and Technical Debt | Current risks, evidence gaps, owners, mitigation, and exit conditions for transitional debt. | Link each risk or debt item to source evidence and keep unknown live state explicitly unknown. |
| 12 Glossary | Terms needed to read this architecture, mapped to their bounded-context meaning. | Use the context-scoped language register; do not create a second global glossary or infer cross-context equivalence from spelling. |

Mark content `Not applicable` only when the chapter guide's concern does not
apply to this system snapshot. Give the reason, affected scope, and evidence
that supports the exclusion. A missing source, unknown live state, or unfinished
implementation is an evidence gap, not a reason to mark a chapter
inapplicable.

The [architecture structure validator](../../tools/validate-arc42-structure.mjs)
checks paths, section headings, evidence markers, and required coverage. It
cannot establish that the selected views answer stakeholder concerns; that
remains a semantic review responsibility.
