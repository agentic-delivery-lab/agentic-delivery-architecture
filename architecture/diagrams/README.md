# Architecture diagrams

The canonical architecture model is the Structurizr DSL source at
`../models/workspace.dsl`. It is the authoritative C4 model for system and
container relationships. No rendered image is authoritative.

The other source formats have deliberately smaller roles:

- Mermaid is supporting model-as-code for readable context and runtime
  sequences, strategic alignment, product bootstrap, factory evolution, and
  portfolio lifecycle views that are useful in Markdown reviews.
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
| `mermaid/strategic-alignment.mmd` | 1, 4, 5, 10 |
| `mermaid/context-map.mmd` | 3, 5 |
| `mermaid/issue-delivery-sequence.mmd` | 6 |
| `mermaid/strategy-value-streams.mmd` | 1, 4, 5 |
| `mermaid/project-issue-lifecycle.mmd` | 4, 6, 8 |
| `mermaid/factory-evolution-sequence.mmd` | 4, 6, 8, 10 |
| `mermaid/product-delivery-sequence.mmd` | 4, 6, 10 |
| `mermaid/trust-boundaries.mmd` | 3, 6, 8 |
| `plantuml/bounded-contexts.puml` | 5, optional UML view |

The six assignment views are `strategic-alignment`, `context-map`,
`project-issue-lifecycle`, `factory-evolution-sequence`,
`product-delivery-sequence`, and `trust-boundaries`. The earlier value-stream,
runtime-sequence, and PlantUML views remain supporting views. Every status
banner distinguishes intended relationships from observed live integration;
Vercel webhook replay, Codex session continuation, and evaluation replay are
separate state owners.
