# Agentic Delivery Architecture Authority

This repository is the cross-context architecture authority for the
`agentic-delivery-lab` organization. It records organization-wide principles,
bounded-context relationships, architecture descriptions, and cross-context
decisions. Architecture Authority is an ownership role and repository; it is
not a bounded context in the domain model.

The architecture description uses [arc42](https://arc42.org/documentation/)
as a documentation template and its [iterative method](https://arc42.org/method/)
as a docs-as-code practice. The [official examples repository](https://github.com/arc42/examples.arc42.org-site)
informs the level of detail. ISO/IEC/IEEE 42010:2022 supplies the terms used to
connect stakeholders and their concerns to viewpoints and views. These
references guide this description; arc42 is not treated as a formal
conformance standard. TOGAF artifacts are not applied because the current
evidence is already traceable through explicit goals, decisions, consequences,
and release contracts, with no demonstrated benefit from adding a separate
enterprise-principles process.

The four bounded contexts are Agentic Delivery Governance, Agentic Delivery
Control Plane, Agentic Primitives, and Developer Distribution. The public and
private `.github` repositories are GitHub adapters. Their files do not make
them domain contexts. See the [context model](architecture/domain/README.md),
the [source and live-evidence snapshot](architecture/references/system-evidence.yml),
the [arc42 chapter profile](architecture/arc42/README.md), and the twelve
[arc42 chapters](architecture/arc42/).

Architecture Authority is the proposed canonical text owner for all
organization ADR, ADP, and ADD records. The [decision index](decisions/README.md)
and [decision inventory](architecture/references/decision-inventory.yml) pin
the exact records, context scope, imported source identities, and provenance.
The ADR-to-Primitive index is generated from the pinned Primitive catalog and
resolves every ADR reference to exactly one local Architecture record.

[Requirements Authority](https://github.com/agentic-delivery-lab/agentic-delivery-requirements)
owns approved requirements and normative QR records under ADR-0024. The selected
immutable baseline is `architecture/references/requirements.lock.json`; the
local QR catalog is a checked derived projection, preserving historical IDs,
text, status and evidence. Approval is not observed satisfaction. Requirement
changes go to their central owner; `pnpm requirements:project` regenerates the
projection only after an accepted baseline-pin update. CI rejects local edits,
drafts, withdrawals, identity mismatch and source-digest changes. Source
checkout: `sources/requirements`, or `AGENTIC_SOURCE_ROOT_REQUIREMENTS` for a
trusted local checkout with the pinned Git objects. This cutover does not
adopt proposed strategy goals or activate runtime participants.

Architecture release contract `5.0.0` requires Requirements reference contract
`1.0.0` and rejects missing/unsupported pins. Consumers must dispatch by the
advertised contract version; historical `4.0.0` artifacts retain their original
immutable readers/schemas. Prepared source commits must be ancestors of the
reviewed tree, so cleanup cannot strand a release behind unretained objects.

Architecture-owned YAML and JSON source data are parsed and checked against
per-family JSON Schema Draft 2020-12 schemas under `architecture/contracts/`.
Separate cross-file checks verify IDs, context references, immutable pins, and
generated outputs; context stewards still review semantic meaning.

The public Architecture repository and its draft release are versioned on
`main`. A draft release is not a published or deployed architecture contract.
The latest live baseline and known evidence gaps are recorded with commit pins
in `architecture/references/system-evidence.yml`; they must be refreshed when
the architecture snapshot is updated.

## Checks

Use the pinned Node/pnpm toolchain and stock Git supporting both
`--no-lazy-fetch` and `--no-replace-objects`. Current catalog generation probes
these capabilities before reading source objects and reports an actionable
prerequisite failure when they are unavailable. Git 2.43 does not meet this
profile; upgrade the unmodified Git installation before running these checks.
The [Git documentation](https://github.com/git/htmldocs/blob/gh-pages/git.adoc)
defines `--no-lazy-fetch` as disabling demand fetching from promisor remotes.
An unsupported Git must not silently fall back to fetching missing objects.

```text
git --no-lazy-fetch --no-replace-objects version # required offline object-read capabilities
pnpm architecture:prepare # explicit networked download of the two exact pinned archives
pnpm architecture:check # offline after preparation
pnpm migration:check
pnpm test
node tools/architecture-content-digest.mjs . HEAD
```

Conformance requests must carry the digest for the exact Architecture content
snapshot they pin. A passing structural check does not prove runtime behavior,
live organization settings, or semantic term consistency; reviewers inspect
the cited evidence and its limits.

## Canonical C4 validation

The diagram check parses `architecture/models/workspace.dsl` with unchanged
Structurizr 2026.09.19 SDK 6.2.3 libraries through public parser APIs. The
repository adapter is part of this check; it is not a modified upstream parser.
The tooling lock pins the WAR, stock Temurin 21.0.13+9 archive and the twelve
bundled libraries actually exposed on the classpath. Preparation requires
Linux x64, Python 3.12+, curl and bubblewrap; other platforms fail explicitly.
Validation does not download or start a service. Remove `.cache/structurizr`
to discard downloaded archives and the last report, then prepare again.

The WAR digest records bytes obtained from the exact official HTTPS release;
a detached publisher signature/checksum was not verified. The Java digest was
matched to the publisher's GitHub asset digest. These are integrity/provenance
statements, not proof of a reproducible upstream build or runtime admission.
The bundled Jackson 2.21.4 libraries match eleven published advisory records.
The candidate does not accept JSON: it parses bounded DSL and deserializes only
JSON produced by its own SDK serializer. Current source/bytecode review found
no active-view, unwrapped-property, identity-collection or external scalar-type
binding path used by those advisories; no default typing is enabled. This is a
limited reachability assessment, not an upstream fix or proof of zero risk.
Per-request isolation, input/heap/CPU/deadline limits remain necessary. Admission
still requires review of this exact profile and its dependency assessment; there
is no advisory suppression or replacement of bundled libraries. Advisory records
are available through the [Jackson core](https://github.com/advisories/GHSA-7hhh-6rmp-j9qf)
and [databind](https://github.com/advisories/GHSA-5gvw-p9qm-jgwh) notices and their
linked upstream reports.

The stock JDK retains its bundled license notices. Libraries retain their
original bytes; this repository does not redistribute an assembled runtime.

Each request rechecks archive hashes, extracts a fresh private runtime and
mounts only declared inputs/tooling read-only. Bubblewrap clears inherited
environment and unshares network/process/IPC namespaces. CPU (40 seconds),
Java heap (256 MiB), address space (4 GiB), process wall time (60 seconds),
input (256 KiB) and per-file output (8 MiB) are bounded. The host wrapper has a
120-second overall cancellation deadline with bounded descendant cleanup. Kernel, Python, bubblewrap and host libraries are
recorded execution prerequisites, not a fully pinned hermetic operating system.
This profile must pass on the actual execution host; there is no unsafe fallback.
The wrapper starts its own session before exec, closes stdin and keeps the root
child waitable with WNOWAIT until its owned process group is stopped. This also
covers cancellation before bubblewrap installs its parent-death handler; the
flag alone has a documented startup race. No discovered PID number authorizes a
signal, and unrelated process groups are never selected. The extra bubblewrap
new-session flag is intentionally absent so startup children stay in that
already isolated group; output descriptors are files rather than terminals.

Supported parser feature controls disable scripts, plugins, component discovery,
includes, documentation/decision imports, environment interpolation, filesystem
and HTTP/HTTPS features. Independent OS isolation covers paths outside those
controls. External themes, image views/icons/logos and inspection overrides are
rejected. No blocking inspection rule has been approved: completeness findings
remain advisory even when upstream labels them ERROR. Parser/security failures
block the check. Promoting a rule or allowing a suppression needs a reviewed
conformance-profile change.

`.cache/structurizr/last-report.json` contains the input/tool/adapter/dependency
hashes, advisory findings and the three allowlisted view projections. Official
WorkspaceUtils JSON serialization/deserialization must preserve the entire
model. Selected JSON exports then compare element IDs, fields and relationship
IDs/endpoints against that parsed model and its round-trip. These are model
exports, not rendered diagrams. The canonical DSL remains the authority and
must remain unchanged by every request.

Rollback restores the previous validator, model, policy and tooling lock together
and prepares a new release digest; it must state that the previous marker check
cannot prove DSL validity. Neither this check nor its report activates the
factory controller, MCP, external rendering or an approved runtime context.

The optional checkout-root argument selects the entire trusted Architecture
tooling checkout: model, tooling lock, runtime, adapter, cache and report path.
It is an operator/profile input, never a value selected by DSL or Issue text.
Callers must admit that tooling checkout before executing it; this argument is
not a data-only interface for running arbitrary untrusted repository code.
Unsupported OS, architecture or Python versions fail before preparation creates
a cache or downloads artifacts.

Model inputs are read through regular-file descriptors without following file
or directory links, before the private snapshot is created. Use canonical
input paths. Special files are rejected without a blocking read. The trusted
tooling checkout is separate from the model input; a factory profile must pin
that tooling root instead of deriving it from candidate content.
