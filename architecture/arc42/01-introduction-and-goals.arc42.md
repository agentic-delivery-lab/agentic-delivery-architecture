# 1. Introduction and Goals

<!-- arc42:section 01 -->

## 1.1 Purpose

This architecture description explains the six-repository Agentic Delivery
system: its four domain contexts, two GitHub repository adapters, organization
surfaces, ownership boundaries, runtime paths, release pins, and evidence gaps.
The system supports people and coding agents in proposing, implementing,
reviewing, and recording changes while preserving human merge authority.

This file set is an architecture description about the system. It is not the
system itself. The terms **stakeholder**, **concern**, **viewpoint**, and
**view** follow ISO/IEC/IEEE 42010:2022 usage. This is a practical architecture
description, not a claim of conformance to that standard.

## 1.2 Goals

| ID | Goal | Evidence or decision |
| --- | --- | --- |
| G-01 | Give each durable fact one canonical owner and use references or controlled projections elsewhere. | AP-001; ADR-0012, ADR-0013, ADR-0018; recovery issue [#59](https://github.com/agentic-delivery-lab/agentic-delivery/issues/59). |
| G-02 | Keep issue intent and lifecycle state in GitHub, with deterministic authorization before a proposed operation can mutate it. | AP-002; ADR-0012 and ADR-0019; Control Plane source pinned in [system evidence](../references/system-evidence.yml). |
| G-03 | Make cross-repository releases, primitive impact, and generated projections attributable to immutable commits and digests. | ADR-0013 and ADR-0018; ADP-0001; ADD-0001. |
| G-04 | Let reviewers see current contracts and evidence limits without confusing repository configuration with live operation. | ADR-0011 and the live observations in [system evidence](../references/system-evidence.yml). |

These are architecture goals supported by the recovery brief and existing
decisions. They do not claim that current production operation satisfies
them; section 7 and the evidence snapshot record observed gaps.

## 1.3 Quality goals

| Priority | Quality goal | Required observable result |
| --- | --- | --- |
| 1 | Correct ownership and traceability | Every ADR referenced by a pinned Primitive catalog resolves to one local record or one immutable owner projection. |
| 2 | Safe state change | A model proposal cannot change lifecycle metadata until deterministic identity, permission, schema, option, and transition checks pass. |
| 3 | Recoverable release rollout | A participant can return to its previous exact source pins without introducing a second authoritative copy. |
| 4 | Reviewable architecture | A reviewer can follow source commits, file digests, and runtime observations without treating a passing structural check as live proof. |

## 1.4 Stakeholders, concerns, viewpoints, and views

A viewpoint states how a view addresses a stakeholder concern. This mapping
uses ISO/IEC/IEEE 42010:2022 terminology; it does not reproduce the standard.

| Stakeholder | Concern | Viewpoint | View(s) |
| --- | --- | --- | --- |
| Organization maintainer | Ownership, issue lifecycle, review authority, and safe rollout | Governance and ownership | Sections 3, 8, 9; context map and ADR owner map |
| Organization operator | App access, field definitions and pinning, Projects access, rulesets, rollback | Runtime and deployment | Sections 6–7; issue-delivery sequence and live-evidence table |
| Repository writer | Clear source issue, allowed route, feedback, and human review | Delivery process | Section 6; three runtime paths |
| Architecture reviewer | Decision meaning, bounded-context language, quality evidence, and provenance | Architecture conformance | Sections 3–5, 8–11; context map, ADR map, quality scenarios |
| Primitive maintainer | Catalog impact, release identity, and consumer projections | Capability release | Sections 5, 8–9; generated ADR-to-Primitive index |
| Distribution maintainer and consumer owner | Exact pins, safe bootstrap, conflict handling, and rollback | Distribution and deployment | Sections 5–7; bundle and deployment view |
| Independent Validator | Separate authorship, test evidence, semantic review, and source pins | Validation | Sections 9–11; ADR map and quality scenarios |

## 1.5 Scope

The architecture covers Agentic Delivery Governance, Agentic Delivery Control
Plane, Agentic Primitives, Developer Distribution, and their GitHub
organization and repository interfaces. It describes the public `.github`
repository and private `.github-private` repository as adapters, not domain
contexts. It does not assert that an adapter, App installation, field pin, or
ruleset is active unless the dated evidence says so.

**Evidence:** source revisions and live checks are pinned in
[`system-evidence.yml`](../references/system-evidence.yml).
