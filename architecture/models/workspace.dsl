workspace "Agentic Delivery" "Organization-wide issue-based delivery architecture" {
  model {
    person maintainer "Maintainer" "Reviews issues, pull requests, and architecture changes."
    softwareSystem github "GitHub" "Issues, pull requests, Projects, Actions, and organization fields." {
      container issues "Issues and Projects" "GitHub" "Durable work state and operational projection."
      container actions "Actions" "GitHub Actions" "Deterministic execution plane."
      container app "GitHub App" "GitHub App" "Event intake, authentication, routing, and controlled mutation."
    }
    softwareSystem architecture "Architecture Authority" "arc42, ADRs, principles, models, and conformance."
    softwareSystem control "Agentic Delivery Control Plane" "Lifecycle, routing, orchestration, and evidence."
    softwareSystem primitives "Agentic Primitives" "Reusable agents, skills, hooks, validators, and contracts."
    softwareSystem distribution "Developer Distribution" "Dev Container, Features, bootstrap, and plugins."
    softwareSystem publication ".github-private" "Member profile and promoted Copilot agent projections."

    maintainer -> issues "creates and reviews work"
    app -> control "delivers signed repository events"
    control -> issues "reads and writes origin work state"
    control -> actions "dispatches deterministic execution"
    architecture -> control "governs through pinned release"
    architecture -> primitives "governs through ADR and concept references"
    primitives -> control "supplies selected capabilities"
    primitives -> publication "promotes approved agent projections"
    primitives -> distribution "supplies versioned capability packages"
    distribution -> control "installs thin consumer integration"
  }

  views {
    systemContext github "system-context" {
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
