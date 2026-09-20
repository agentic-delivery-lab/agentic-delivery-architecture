# 3. Context and Scope

<!-- arc42:section 03 -->

The system context is captured in the Structurizr DSL source at
`../models/workspace.dsl` and the Mermaid context view at
`../diagrams/mermaid/context-map.mmd`.

## External systems

- GitHub Issues, pull requests, Projects, Actions, and organization fields.
- GitHub App installation and webhook delivery.
- Codex/Copilot clients and approved tool providers.
- Consumer repositories containing product, platform, architecture, or
  governance assets.

The public and private special repositories are adapters for GitHub-supported
surfaces, not runtime bounded contexts.
