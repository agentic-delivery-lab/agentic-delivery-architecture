# Migration evidence

`manifest.json` records the completed history-preserving extraction from the
Control Plane source. `source-commit-map.csv` is the generated mapping
produced by the pinned `git-filter-repo` run. It exists for traceability only;
it is not an architecture or runtime registry.

The target repository exists publicly on `main`; its initial import and CI
pull requests are merged, and its active default-branch ruleset is verified.
Issue and pull-request URLs remain the original GitHub URLs. This manifest
records the repository publication state; it does not promote the draft
Architecture release or activate Control Plane participants.

The filtered history and source map were generated from the supplied `main`
snapshot `8b9bd77e1cb6008ce9dab3bbe8652ab7979b4c99` with the pinned tool. The
manifest and map are checked against that immutable source before publication;
changing metadata alone is not sufficient.
