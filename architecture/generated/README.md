# Generated architecture artifacts

Files in this directory are derived from canonical sources. A released
architecture must replace the draft release manifest's null digest with a
content digest computed by the pinned release tool and must record the source
commit used for the release.

`adr-primitive-index.json` is generated from the pinned
`architecture/references/primitive-catalog.lock.yml` projection and the local
ADR records. It records the Primitive release commit and distinguishes
Architecture-owned ADRs from ADRs owned by another bounded context. It is not
an editable second Primitive catalog.
