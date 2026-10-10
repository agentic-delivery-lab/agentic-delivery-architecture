workspace "Agentic Delivery" "Organization-wide issue-based delivery architecture" {
  model {
    person maintainer "Maintainer" "Reviews issues, pull requests, and architecture changes."

    softwareSystem github "GitHub organization" "Repository work state and organization-managed settings." {
      container issues "Repository Issues and pull requests" "GitHub" "Origin-scoped work intent, native issue type, discussion, and review records."
      container issueTypes "Native Issue Types" "GitHub organization settings" "Native issue classification; not a lifecycle field."
      container orgFields "Organization issue-field definitions" "GitHub organization issue-field API" "Definitions and option identities for Lifecycle Stage and Delivery State; the latter is currently displayed as Delivery Readiness."
      container fieldValues "Per-issue field values API" "GitHub issue API" "Repository-scoped values, distinct from organization field definitions."
      container projects "GitHub Projects portfolio" "GitHub Projects API" "Primary planning and coordination surface; Project fields own distinct portfolio facts and never authorize execution."
      container app "GitHub App installation" "GitHub App" "Installation access and delivery of subscribed events; it does not distribute templates."
      container actions "Actions" "GitHub Actions" "Repository-scoped deterministic execution and review checks."
    }

    group "Domain contexts" {
      softwareSystem governance "Agentic Delivery Governance" "Repository delivery governance and reusable review rules."
      softwareSystem control "Agentic Delivery Control Plane" "Runtime lifecycle, routing, orchestration, GitHub access, runner/session handling, and controlled write-back." {
        container controller "Delivery controller" "Versioned runtime" "Consumes eligible events and checks deterministic contracts before writes."
        container participants "Participant contracts" "Versioned Control Plane configuration" "Selected repository identities, pins, modes, and contract versions; separate from App installation access."
      }
      softwareSystem primitives "Agentic Primitives" "Versioned catalog, reusable agent capabilities, contracts, releases, and projections."
      softwareSystem distribution "Developer Distribution" "Versioned bootstrap, bundle, and thin consumer integration."
    }

    softwareSystem architecture "Architecture Authority" "Cross-context authority for organization ADR, ADP, and ADD text, principles, arc42 architecture description, context map, and conformance; not a bounded context."
    softwareSystem publicAdapter "Public .github repository adapter" "Public community-health, issue-form, and pull-request-template defaults."
    softwareSystem privateAdapter "Private .github-private repository adapter" "Private member-profile and approved agent-publication boundary."
    softwareSystem consumers "Consumer repositories" "Repositories that receive pinned bootstrap and workflow projections."
    softwareSystem vercel "Vercel webhook ingress" "Hosts the Control Plane webhook function and scheduled delivery reconciler; source code is present, production operation is not established by this model."
    softwareSystem neon "Neon replay store" "PostgreSQL-backed delivery claims, controller receipts, and webhook scan checkpoints; deployed database state is not established by this model."
    softwareSystem codex "Codex CLI" "Pinned agent runtime started inside a bounded GitHub Actions runner workspace."
    softwareSystem productRepositories "Product repositories (unidentified)" "Expected product-owner boundary; the current six-repository inventory identifies no distinct product repository or accountable product steward."

    maintainer -> issues "creates and reviews origin work"
    maintainer -> projects "prioritizes linked Issues and tracks portfolio progress"
    projects -> issues "references canonical origin work; cannot authorize execution"
    app -> vercel "delivers signed subscribed webhook"
    vercel -> neon "claims delivery IDs and persists scan/replay state"
    vercel -> github "dispatches the bounded controller workflow after validation"
    actions -> neon "claims and finalizes controller receipts"
    actions -> controller "runs pinned intake and bounded delivery workflow"
    controller -> codex "starts the pinned CLI in the issue workspace"
    controller -> participants "checks enrollment and exact participant pins"
    controller -> issues "re-fetches and mutates only origin work after gates pass"
    controller -> issueTypes "reads native issue classification"
    controller -> orgFields "reads organization field definitions and options"
    controller -> fieldValues "reads and writes validated per-issue values"
    controller -> projects "target: may read planning context only after revalidating origin Issue gates"
    controller -> actions "dispatches gated execution and review checks"
    architecture -> governance "publishes canonical organization decision text and architecture contracts"
    architecture -> control "publishes canonical decision text through a pinned Architecture release"
    architecture -> primitives "publishes canonical ADR text and context references"
    architecture -> distribution "publishes canonical decision text and architecture contracts"
    primitives -> controller "supplies selected versioned capabilities"
    primitives -> privateAdapter "target: reviewed, versioned agent projection; entitlement remains unverified"
    primitives -> distribution "supplies versioned capability packages"
    control -> distribution "supplies the pinned workflow-bundle source"
    distribution -> consumers "installs versioned bootstrap and consumer projections"
    distribution -> productRepositories "target: bootstrap a product repository after owner discovery and explicit approval"
    productRepositories -> issues "target: own product requirements, source Issues, and pull requests"
    productRepositories -> projects "target: link product work for human portfolio planning"
    publicAdapter -> issues "supplies default templates; live form/type binding is unverified"
  }

  views {
    systemContext control "system-context" {
      include *
      autolayout lr
    }
    systemContext control "organization-context" {
      include *
      autolayout lr
    }
    container github "github-containers" {
      include *
      autolayout lr
    }
    theme default
  }
}
