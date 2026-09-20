# 1. Introduction and Goals

<!-- arc42:section 01 -->

The architecture authority describes the organization-wide Agentic Delivery
system as a set of bounded contexts with explicit ownership and versioned
contracts.

## Requirements overview

- GitHub Issues remain the durable work-state record.
- The Delivery Control Plane owns lifecycle execution and controlled write-back.
- Agentic Primitives own reusable capabilities.
- Architecture Authority owns the principles, decisions, models, and quality
  constraints that govern both contexts.

## Quality goals

1. One authoritative lifecycle implementation serves every enrolled repository.
2. Architectural intent remains readable to people and agents without a CLI.
3. Every generated projection has provenance and a verifiable source digest.
4. Cross-repository dependencies are pinned and upgradeable deliberately.
