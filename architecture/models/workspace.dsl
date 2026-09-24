workspace "Agentic Delivery" "Organization-wide issue-based delivery architecture" {
  model {
    person maintainer "Maintainer" "Reviews issues, pull requests, and architecture changes."

    softwareSystem github "GitHub organization" "Repository work state and organization-managed settings." {
      container issues "Repository Issues and pull requests" "GitHub" "Origin-scoped work intent, native issue type, discussion, and review records."
      container issueTypes "Native Issue Types" "GitHub organization settings" "Native issue classification; not a lifecycle field."
      container orgFields "Organization issue-field definitions" "GitHub organization issue-field API" "Definitions and option identities for Lifecycle Stage and Delivery State; the latter is currently displayed as Delivery Readiness."
      container fieldValues "Per-issue field values API" "GitHub issue API" "Repository-scoped values, distinct from organization field definitions."
      container projects "GitHub Projects fields" "GitHub Projects API" "Separate planning projection; no lifecycle-field binding is claimed."
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

    softwareSystem architecture "Architecture Authority" "Cross-context authority for principles, arc42 architecture description, context map, cross-context ADRs, and conformance; not a bounded context."
    softwareSystem publicAdapter "Public .github repository adapter" "Public community-health, issue-form, and pull-request-template defaults."
    softwareSystem privateAdapter "Private .github-private repository adapter" "Private member-profile and approved agent-publication boundary."
    softwareSystem consumers "Consumer repositories" "Repositories that receive pinned bootstrap and workflow projections."

    maintainer -> issues "creates and reviews origin work"
    app -> controller "delivers subscribed event with repository identity"
    controller -> participants "checks enrollment and exact participant pins"
    controller -> issues "re-fetches and mutates only origin work after gates pass"
    controller -> issueTypes "reads native issue classification"
    controller -> orgFields "reads organization field definitions and options"
    controller -> fieldValues "reads and writes validated per-issue values"
    controller -> actions "dispatches gated execution and review checks"
    architecture -> governance "owns cross-context principles, language register, and decisions"
    architecture -> control "governs through a pinned Architecture release"
    architecture -> primitives "provides ADR and context references"
    architecture -> distribution "provides cross-context architecture contracts"
    primitives -> controller "supplies selected versioned capabilities"
    primitives -> privateAdapter "target: reviewed, versioned agent projection; entitlement remains unverified"
    primitives -> distribution "supplies versioned capability packages"
    control -> distribution "supplies the pinned workflow-bundle source"
    distribution -> consumers "installs versioned bootstrap and consumer projections"
    publicAdapter -> issues "supplies default templates; live form/type binding is unverified"
  }

  views {
    systemContext control "system-context" {
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
