# Architecture diagrams

The canonical architecture model is the Structurizr DSL source at
`../models/workspace.dsl`. It is the authoritative C4 model for system and
container relationships. No rendered image is authoritative.

The other source formats have deliberately smaller roles:

- Mermaid is supporting model-as-code for readable context and runtime
  sequences that are useful in Markdown reviews.
- `plantuml/bounded-contexts.puml` is the only optional PlantUML view. It may
  explain a model element but may not introduce a competing ownership
  relationship. There is no second bounded-context model under `models/uml/`.
- UML terminology describes the view when it clarifies a concern; it does not
  create a second model source.

Generated SVG/PNG output is disposable review output under
`generated/`. CI validates source presence and safe structure without
requiring a network renderer. A renderer may be added to a pinned release only
when its output is reproducible and its version is recorded in
`../references/tooling-lock.json`.

The mapping to arc42 is stable:

| Source | arc42 sections |
| --- | --- |
| `../models/workspace.dsl` | 3, 5, 7 |
| `mermaid/context-map.mmd` | 3, 5 |
| `mermaid/issue-delivery-sequence.mmd` | 6 |
| `plantuml/bounded-contexts.puml` | 5, optional UML view |
