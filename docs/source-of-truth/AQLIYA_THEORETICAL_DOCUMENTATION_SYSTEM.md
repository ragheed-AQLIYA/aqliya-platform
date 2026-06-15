# AQLIYA Theoretical Documentation System

> **Status:** Supporting reference — architecture and system lifecycle model  
> **Authority:** Level 4 — see `docs/DOCUMENTATION_AUTHORITY.md`  
> **This file is NOT the highest documentation authority.**  
> For conflict resolution, identity, product status, and implementation reality, follow `docs/DOCUMENTATION_AUTHORITY.md`.

> **Language note (2026-06-09):** Public-facing materials now refer to "Specialized Operating Systems" instead of "Products." The platform is positioned as an "institutional operating platform" first, with capabilities surfaced inside it. See `docs/official/AQLIYA_MASTER_REFERENCE.md §5b` for details.

---

## 1. Purpose

This document describes the AQLIYA system philosophy, product maturity model, system lines, and governance framework. It serves as a supporting reference for architecture and system lifecycle understanding.

## 2. AQLIYA Company Thesis

AQLIYA is a **Private Governed Institutional Intelligence Platform** — a multi-product platform that gives institutions private intelligence running on their data, within their environment, under their governance. AQLIYA builds AI-augmented institutional systems spanning financial intelligence, audit assurance, local content governance, revenue intelligence, executive decisions, risk management, and compliance — all sharing a common Core of governance, workflow, evidence, and AI orchestration engines.

## 3. System Philosophy

AQLIYA systems are designed around three philosophical pillars:

- **Auditability**: Every decision must be traceable to the evidence and reasoning that produced it.
- **Structured agency**: AI operates within governed boundaries, not as an autonomous oracle.
- **Iterative maturity**: Systems evolve through defined maturity states; no system jumps from concept to commercial without passing through rigorous validation gates.

We build systems, not features. A system has a lifecycle, a workspace, a maturity state, and governed access. Features are temporary; systems endure.

## 4. Core Principle

> **AI assists. Humans decide. Evidence governs.**

- **AI assists**: AI provides analysis, synthesis, summarization, and pattern detection. It does not make final decisions.
- **Humans decide**: A qualified human decision-maker retains ultimate authority and accountability for every decision.
- **Evidence governs**: Every decision must cite its evidentiary basis. Decisions made without supporting evidence are invalid by default.

This principle is non-negotiable across all AQLIYA systems, at all maturity levels.

## 5. Company → Systems → Workspaces Model

AQLIYA is organized as a four-tier hierarchy:

### Company (AQLIYA)

The legal and operational entity. Owns all systems and workspaces.

### AQLIYA Intelligence Core (platform layer)

The shared platform layer containing AI Orchestration, Governance, Workflow, Evidence Graph, Institutional Memory, RBAC, Audit Logs, Model Governance, Document Intelligence, Reporting, and Deployment engines. All products are built on this Core.

### AQLIYA Studio (custom systems layer)

Enables building custom institutional systems on top of the Core without starting from scratch. Strategic/future — not yet implemented.

### Systems

A system is a product line with a defined purpose, maturity state, and lifecycle. Systems are the primary unit of product organization. Examples: AuditOS, DecisionOS, SalesOS, LocalContentOS.

### Workspaces

A workspace is a concrete deployment instance of a system. Workspaces belong to exactly one system. A system may have multiple workspaces at different maturity levels (e.g., active workspace, guided demo workspace).

Workspaces are the unit of access control, data isolation, and operational governance.

```
AQLIYA (Company)
 └── AQLIYA Intelligence Core (Shared Platform)
      └── AQLIYA Studio (Custom Systems — future)
      └── AuditOS (System — first proof product)
           ├── /audit (Active Workspace)
           └── /auditos (Guided Demo Workspace)
      └── DecisionOS (System — adjacent)
           └── (Active Workspace)
      └── SalesOS (System)
           └── (Prototype Workspace)
      └── LocalContentOS (System — second product)
           └── /local-content/* (Active Workspace — L5 pilot-ready with conditions)
      └── SimulationOS (System)
           └── (Marketing-only)
```

> **Note:** This model is a conceptual reference. For current implementation status of each system, see `docs/official/AQLIYA_MASTER_REFERENCE.md` or inspect the code. System maturity states in this file may be outdated; refer to validated code and reports for current reality.

## 6. System Lifecycle

Every AQLIYA system progresses through a defined lifecycle:

1. **Conception**: Idea is documented and reviewed.
2. **Marketing-only**: Public-facing materials exist. No working software. No workspace. No real data.
3. **Prototype**: Working software exists in a sandbox workspace. Limited to synthetic or carefully scoped test data.
4. **Active Workspace**: A governed workspace with real (but controlled) data. Human oversight required for all decisions.
5. **Demo-ready**: The system can be demonstrated to potential customers with controlled scenarios.
6. **Pilot-ready**: The system is ready for a limited production pilot with a customer under strict governance.
7. **Commercial-ready**: The system is approved for general commercial sale.

A system may regress to an earlier state if it fails readiness gates. Progression requires explicit approval per the Readiness Rules.

## 7. Product Maturity States

| State                | Definition                                  | Data Rules                         | Access          |
| -------------------- | ------------------------------------------- | ---------------------------------- | --------------- |
| **Marketing-only**   | Public materials exist; no working software | No real data                       | Public          |
| **Prototype**        | Working software, sandbox workspace         | Synthetic or scoped test data only | Internal        |
| **Active Workspace** | Governed workspace with real data           | Real data with backup and approval | Controlled      |
| **Demo-ready**       | Can demonstrate to customers                | Controlled demo scenarios          | Demo access     |
| **Pilot-ready**      | Limited production pilot                    | Customer data under strict SLA     | Pilot customers |
| **Commercial-ready** | General commercial availability             | Full production data               | General         |
| (Pre-conception)     | Idea phase                                  | None                               | None            |

> **Note:** For current system maturity states, see `docs/official/AQLIYA_MASTER_REFERENCE.md` or `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`.

## 8. AQLIYA System Lines

### AuditOS — _Active_

The flagship AQLIYA system. Provides structured, auditable decision-making workflows. Governed workspace at `/audit`. Guided demo at `/auditos`. Active primary system. Supports evidence capture, decision logging, and audit trail generation.

### DecisionOS — _Active_

Adjacent system to AuditOS. Extends decision support with analysis and synthesis capabilities. Active workspace with governed data access.

### LocalContentOS — _Active Workspace (pilot-ready with conditions)_

Local content measurement and governance system. Targeted at Saudi market. Second strategic product. Workspace at `/local-content/*` (12 routes). Evidence upload, scoring, review/approval, exports, audit trail implemented. See `AQLIYA_MASTER_REFERENCE.md` for full details.

### SalesOS — _Prototype_

System for sales process management and decision support. Currently in prototype state. Static dashboard only.

### SimulationOS — _Marketing-only_

Decision simulation environment. Public marketing materials exist. No working software or workspace.

## 9. AuditOS as Current Flagship

AuditOS is the primary focus of current development and the reference implementation for all AQLIYA systems. Key facts:

- **Status**: Active Workspace (highest maturity of any AQLIYA system)
- **Workspaces**: `/audit` (active governed), `/auditos` (guided demo)
- **Role**: Establishes architectural patterns, governance models, and UI conventions that other systems follow
- **Data**: Real data intake is governed. Requires backup before intake and explicit approval.
- **Commercial**: Not commercial-ready. All deployments are internal or demo.

All architectural decisions, route strategies, and agent instructions should be validated against AuditOS first. What works for AuditOS may not work for other systems, but what breaks AuditOS is unacceptable.

## 10. Documentation Governance

- This document is a supporting reference for architecture and system lifecycle.
- The highest documentation authority is `docs/DOCUMENTATION_AUTHORITY.md`.
- For identity, governance principles, and strategic positioning: follow `docs/official/` doctrine docs.
- For implementation status: inspect code, routes, actions, tests, and validation reports.
- Route strategy changes require explicit human instruction.
- Outdated or conflicting docs should be flagged and reconciled against the current authority hierarchy.

## 11. AI Agent Operating Context

AI agents operating within the AQLIYA ecosystem must:

1. Read `docs/DOCUMENTATION_AUTHORITY.md` first.
2. Read `docs/official/AQLIYA_MASTER_REFERENCE.md` for current status.
3. Read `AGENTS.md` for execution rules.
4. Read the current route strategy before modifying routes.
5. Never guess or assume facts not present in documentation or project files.
6. Never change route strategy unless explicitly instructed by a human.
7. Flag ambiguities rather than silently resolving them.
8. Default to conservative behavior when instructions are unclear.

## 12. Anti-Drift Rules

These rules prevent the project from deviating from its defined architecture and philosophy:

- **No autonomous AI decisions**: AI may analyze, summarize, and recommend. AI may not approve real data intake, change maturity states, or authorize commercial readiness.
- **No route strategy changes without human instruction**: Route files are governed. Agent-driven route modifications are prohibited.
- **No undocumented state changes**: Any change to a system's maturity state must be reflected in canonical docs.
- **No real data without backup and approval**: Real data intake requires (a) a verified backup and (b) explicit human approval.
- **No commercial readiness without governance review**: Commercial-ready state requires passing all readiness gates with documented evidence.

## 13. Expansion Rules

When expanding the AQLIYA ecosystem:

- New systems must be documented in the architecture and system taxonomy before development begins.
- New systems start at marketing-only or prototype; no system skips maturity states.
- New workspaces must belong to an existing system and specify their maturity state.
- Cross-system integrations must be documented and approved.
- Architectural patterns should be reused from AuditOS where applicable; divergence requires justification.

## 14. Readiness Rules

Progression between maturity states requires:

| Transition                      | Requirements                                                        |
| ------------------------------- | ------------------------------------------------------------------- |
| Pre-conception → Marketing-only | Documented concept brief                                            |
| Marketing-only → Prototype      | Working software in sandbox; synthetic data tests passing           |
| Prototype → Active Workspace    | Data governance plan; backup procedure; human oversight defined     |
| Active Workspace → Demo-ready   | Demo script; controlled data set; UI/UX review                      |
| Demo-ready → Pilot-ready        | SLA defined; customer agreement; security review; support plan      |
| Pilot-ready → Commercial-ready  | Full readiness audit; legal review; pricing model; commercial terms |

## 15. References

| Document                | Location                                         | Purpose                                |
| ----------------------- | ------------------------------------------------ | -------------------------------------- |
| Documentation Authority | `docs/DOCUMENTATION_AUTHORITY.md`                | Conflict-resolution authority          |
| AQLIYA Master Reference | `docs/official/AQLIYA_MASTER_REFERENCE.md`       | Current master reference               |
| Architecture            | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`    | System architecture                    |
| System Taxonomy         | `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | System definitions and hierarchy       |
| Route Strategy          | `docs/source-of-truth/ROUTE_STRATEGY.md`         | Route configuration and strategy       |
| Product Status Matrix   | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`  | Current maturity states of all systems |
| Readiness Gates         | `docs/source-of-truth/READINESS_GATES.md`        | Gate definitions and criteria          |
| README                  | `README.md`                                      | Project overview and quickstart        |
