---
date: 2026-09-25
source-issue: https://github.com/agentic-delivery-lab/agentic-delivery-architecture/issues/3
decision-makers: Architecture issue #3 proposal
consulted: Context steward review pending
informed: Not recorded
domains:
  - agentic-delivery-governance
  - agentic-delivery-control-plane
  - agentic-primitives
  - developer-distribution
required-enforcement:
  - deterministic
  - instructional
  - semantic
---

# Define per-family Architecture artifact contracts

## Context and Problem Statement

The Architecture repository contains several artifact families with different
roles: arc42 chapters, decision records, principles, bounded-context language,
models, quality scenarios, risks, policies, provenance, and generated release
interfaces. File names and validation rules must make those roles discoverable
without treating Architecture Authority as a bounded context or flattening
context-specific language into one glossary.

The current arc42 files use a redundant `.arc42` suffix, decision families do
not all share the MADR structure, and multiple authoritative YAML/JSON sources
have no executable Draft 2020-12 schema. This makes changes and generated
references harder to review consistently. The source inventory, repository
instructions, and issue #3 provide the evidence and scope for this proposal.

## Decision Drivers

- Keep stable decision and principle identifiers resolvable while making
  ordinary Architecture paths predictable.
- Keep arc42 chapters aligned with the pinned official template and make
  chapter-specific evidence and non-applicability decisions reviewable.
- Give ADR, ADP, and ADD records one shared base structure without inventing
  historical dates, alternatives, rationale, or issue links absent from source.
- Validate parsed YAML and JSON structure while leaving cross-file integrity
  and semantic review explicit.
- Keep each bounded context's language and model within its own context.

## Considered Options

- Retain the current mixed suffixes, templates, and partial structured-data
  validation. This preserves current paths but leaves avoidable ambiguity and
  unvalidated data contracts.
- Apply one global naming and content template to every artifact. This is easy
  to state but would erase meaningful differences among chapters, decisions,
  principles, identifiers, and machine-readable contracts.
- Define a contract for each artifact family, cite external formats as
  references rather than universal naming authorities, and validate structured
  data with schemas plus separate integrity checks. This matches the observed
  repository families and preserves their distinct roles.

## Decision Outcome

Chosen option: **Define a contract for each artifact family**, because it keeps
file identity and content rules aligned with the job each artifact performs.

### Consequences

- arc42 uses the pinned official 12-section template. Each chapter is stored
  as `architecture/arc42/NN-title.md`; the local chapter guide records concerns,
  source expectations, evidence limits, and the reason required for an
  inapplicable section. The redundant `.arc42` suffix is removed while the
  chapter's existing title stem and section identity remain stable.
- Decision records retain MADR's `NNNN-title-with-dashes.md` form. ADR, ADP,
  and ADD records use the shared Architecture decision template and validated
  frontmatter. Their stable prefixes and identifiers remain unchanged. A
  source that lacks historical metadata records it as unrecorded; an author
  must not infer it from the transfer date.
- Principle files retain stable `AP-NNN` identifiers and use the principle
  template. The index remains the authority for identity and traceability.
- New ordinary Architecture-authored paths use lowercase kebab-case with a
  file extension matching their data or markup format. Platform- or tool-
  required names and stable identifier prefixes are documented exceptions.
- YAML is parsed using the pinned `yaml` package and validated as a JavaScript
  value against per-family JSON Schema Draft 2020-12 schemas using the pinned
  Ajv 8.17.1 and ajv-formats 3.0.1. JSON sources and generated Architecture
  outputs use the same schema validation path.
- Schemas reject unsupported properties where the data contract is closed.
  Cross-file checks continue to verify IDs, context references, source pins,
  release digests, and generated reproducibility. Structural validation does
  not establish semantic correctness; affected context stewards review meaning.
- The domain-language register stays context-scoped. This decision adds no
  global glossary and no repository-wide forbidden-word scan.
- arc42 examples use numbered Markdown chapter files, but neither arc42 nor
  MADR is treated as prescribing one universal filename rule across all
  artifact families. The naming convention above is this repository's local
  contract, based on its pinned formats and stable IDs.
- The copied Control Plane delivery-evidence schema and the unreferenced
  duplicate UML model are removed. The Structurizr DSL remains the canonical
  C4 model; the documented PlantUML file remains an optional supporting view.

### Confirmation

- `pnpm architecture:check` validates all twelve chapter paths and required
  headings, decision and principle templates, structured source schemas,
  cross-file references, and generated Architecture contracts.
- Negative tests reject a suffixed or otherwise invalid arc42 path, a missing
  required template heading, an unknown property in a closed data contract,
  and an invalid bounded-context reference.
- `pnpm migration:check`, `pnpm test`, and the Architecture release digest
  check pass on the issue-linked branch. A reviewer still checks context terms
  and semantics against the cited source evidence.
- The release remains draft until its independent review and merge. Consumers
  adopt any changed schema or naming contract in their own gated repository
  changes.

## Pros and Cons of the Options

### Retain mixed contracts

- Good, because existing paths and workflows need no updates.
- Bad, because readers cannot rely on consistent family-specific validation.

### Apply one global template

- Good, because a single rule is easy to describe.
- Bad, because it would impose irrelevant structure on distinct artifact
  families and could encourage generic domain language.

### Define per-family contracts

- Good, because each family gets requirements suited to its role, while stable
  identifiers and context-specific language remain intact.
- Bad, because schemas, guides, validators, generated pins, and tests must be
  updated together when a family changes.

## More Information

- The [arc42 download page](https://arc42.org/download/) offers the official
  Markdown and Markdown multi-page formats. The [arc42 examples repository](https://github.com/arc42/examples.arc42.org-site)
  contains complete systems split into numbered Markdown chapters. These are
  references for the chosen local structure, not a universal filename rule.
- The [MADR guide](https://adr.github.io/madr/) supplies the decision-record
  base structure used here; its guidance does not prescribe names for unrelated
  Architecture artifacts.
- [Eric Evans's Domain-Driven Design Reference](https://www.domainlanguage.com/ddd/reference/)
  informs the bounded-context and context-scoped language model.
- [YAML 1.2.2](https://yaml.org/spec/1.2.2/) defines the source serialization;
  [JSON Schema Validation Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-validation)
  defines structural validation for parsed data.
- `architecture/arc42/README.md` documents chapter concerns and evidence.
  `decisions/adr-template.md` is the shared ADR/ADP/ADD base template, and
  `architecture/principles/principle-template.md` defines the AP family.
- `architecture/contracts/` contains per-family schemas. The schemas and
  deterministic validators are separate from context-steward semantic review.
- This proposal affects `agentic-delivery-governance`,
  `agentic-delivery-control-plane`, `agentic-primitives`, and
  `developer-distribution`. Their stewarding repositories are recorded in
  `architecture/domain/bounded-contexts.yml`; that routing does not imply a
  named reviewer, GitHub approval, or an active CODEOWNERS gate.
- Stable prefixes `ADR-`, `ADP-`, `ADD-`, and `AP-` are identity exceptions.
  Exact names required by platform or tools are likewise exceptions. New
  ordinary Architecture files use lowercase kebab-case.
- The removal of `architecture/delivery-evidence.schema.json` follows its
  Control Plane `$id` and the absence of Architecture consumers. Evidence
  contract ownership remains with Control Plane. The duplicate
  `architecture/models/uml/bounded-contexts.puml` is removed because the
  diagram inventory already identifies the Structurizr source and one optional
  PlantUML view.
