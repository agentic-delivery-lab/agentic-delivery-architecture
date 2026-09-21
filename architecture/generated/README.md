# Generated architecture artifacts

Files in this directory are derived from canonical sources. The release
manifest records the immutable publication digest, the source commit used to
prepare it, the governed ADR/context identifiers, and integrity pins for the
conformance policy and tooling lock. The digest normalizes only the manifest's
own `contentSha256` field, so the release value is reproducible without a
self-referential hash.

`adr-primitive-index.json` is generated from the pinned
`architecture/references/primitive-catalog.lock.yml` projection and the local
ADR records. It records the Primitive release commit and distinguishes
Architecture-owned ADRs from ADRs owned by another bounded context. It is not
an editable second Primitive catalog.
