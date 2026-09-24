# 9. Architecture Decisions

<!-- arc42:section 09 -->

This section is an index and context map, not a duplicate of ADR rationale.
Individual managed decisions remain in `../../decisions/` and are referenced by
stable ADR identifiers in `../../references/adr-aliases.json`.

ADR-0018 records the organization-wide control-plane distribution and
versioning decision. Its history-preserving extraction is present on this
repository's `main`; this review branch proposes a revision under Issue #53.
The revision chooses one organization App installation with `All repositories`
access and a separate reviewed participant registry, while keeping live App
configuration and production activation behind operator evidence. Its stable
alias is listed in `../../references/adr-aliases.json`; the rationale remains
in the individual ADR rather than being copied into this section.
