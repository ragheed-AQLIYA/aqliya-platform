# AQLIYA Architecture Decision Index

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Reference — maps all architecture decisions to their owning documents, ADRs, and impacts.
> **Purpose:** Prevents document conflicts by providing a single place to answer: why was this decision made, and which document governs it?

---

## How to Use This Index

1. **When reviewing any architecture decision**, find its ADR in this index.
2. **When two documents conflict**, trace both decisions through this index to find which ADR has higher authority (see Constitution principle priority).
3. **When adding a new decision**, create an ADR file in `docs/architecture/adr/ADR-NNN.md` and add a row to this index.
4. **This index is the single source of truth** for which decisions have been made and why. If a decision is not here, it has not been formally adopted.

---

## Decision Map

| ID | Decision | Status | Constitution Principles | Owning Document | Impacts | Date |
|---|---|---|---|---|---|---|
| **ADR-001** | SalesOS v2 will not evolve from current SalesOS implementation | ✅ Accepted | 1, 3, 4, 6 | `SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md` | Platform Kernel, SalesOS v2, Extraction Blueprint | 2026-06-28 |
| **ADR-002** | Product Independence — every product independently licensable, deployable, operable, upgradable, testable. Kernel is the only shared dependency. | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | All products, Platform Kernel, all blueprints | 2026-06-28 |
| **ADR-003** | Platform Neutrality — Kernel must not know about any product | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Platform Kernel, all capabilities, Extraction Blueprint | 2026-06-28 |
| **ADR-004** | Consumer-Driven Extraction — no extraction without identified consumer and contract | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Extraction Blueprint, all waves, capability registry | 2026-06-28 |
| **ADR-005** | Kernel Budget Rule — every sprint ends with validated consumer | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Extraction Blueprint, sprint planning, wave validation | 2026-06-28 |
| **ADR-006** | One Owner Rule — every component has owner, contract, consumer, test | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Extraction Inventory, capability registry | 2026-06-28 |
| **ADR-007** | Extraction Reversibility — every extraction reversible until consumer validated | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Extraction Blueprint, wave execution, strangler pattern | 2026-06-28 |
| **ADR-008** | Contracts Before Implementation — interface first, then acceptance, then implementation | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Platform Kernel Architecture, all capability contracts | 2026-06-28 |
| **ADR-009** | Capability Registry — all platform capabilities registered in central registry | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Platform Kernel Architecture, capability runtime, product consumption | 2026-06-28 |
| **ADR-010** | Capability Versioning — each capability owns its own semver, products declare which version | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Platform Kernel Architecture, capability lifecycle, product upgrades | 2026-06-28 |
| **ADR-011** | Capability Lifecycle — Draft → Experimental → Internal → Stable → Deprecated → Retired | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Platform Kernel Architecture, capability registry, product planning | 2026-06-28 |
| **ADR-012** | Stable Core, Extensible Edge — Kernel grows by extension, not modification | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Platform Kernel Architecture, all capabilities, evolution rules | 2026-06-28 |
| **ADR-013** | Business First, Technology Second — every platform capability justified by shared business capability | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | Platform Kernel Architecture, capability proposals, Business Capability Map | 2026-06-28 |
| **ADR-014** | Business Capability Map — top-level business capability layer above platform capabilities | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | All product blueprints, new product proposals, FinanceOS/HROS roadmap | 2026-06-28 |
| **ADR-015** | Product Capability Layer — product-specific capabilities between Business Capabilities and Domains | ✅ Constitutional | — (self) | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` | All product blueprints, domain modeling, SalesOS v2 Blueprint template | 2026-06-28 |
| **ADR-016** | **Architectural Closure** — Architecture Program baseline v1.0 closed. Engineering Program authorized. No new architecture documents, ADRs, or principle changes without evidence from implementation. | ✅ Accepted | 12 (all) | `SALESOS_V2_BLUEPRINT.md` (final review) | Engineering program, all future product blueprints, PRDs, specifications. | 2026-06-28 |

---

## ADR Document Map

Each ADR is documented in two places:

1. **This index** — for quick reference and cross-indexing
2. **The owning document** — for full rationale and context

| ADR | Full Rationale In |
|---|---|
| ADR-001 | `SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md` — Architecture Decision Record section |
| ADR-002 through ADR-012 | `AQLIYA_ARCHITECTURE_CONSTITUTION.md` — each principle section includes rationale |

---

## Impact Traceability

```
ADR-001 (Freeze SalesOS v1)
        │
        ├── Impacts: Platform Kernel, SalesOS v2, Extraction Blueprint
        │
        ├── Implemented by: PLATFORM_CORE_EXTRACTION_BLUEPRINT.md (all waves)
        │
        └── Validated by: Wave exit gates in Extraction Blueprint


ADR-002 through ADR-012 (The 11 Principles)
        │
        ├── Impacts: All products, Platform Kernel, all blueprints
        │
        ├── Implemented by: PLATFORM_KERNEL_ARCHITECTURE.md (all sections)
        │
        ├── Enforced by: Architectural Validation gates in Extraction Blueprint §5
        │
        └── Validated by: CI gates, Registry validation, ADR board review
```

---

## How to Add a New Decision

1. Create an ADR file: `docs/architecture/adr/ADR-NNN.md` using the ADR template
2. Add a row to the Decision Map table above
3. If the decision affects the constitution, get unanimous ADR approval
4. Update the Owning Document to reference the ADR
5. Update the Impacts column to show which documents are affected

### ADR Template

```markdown
---
id: ADR-NNN
title: <decision title>
status: Proposed | Accepted | Deprecated | Superseded
date: YYYY-MM-DD
constitution-principles: <list of relevant principle numbers>
---

## Context

<what problem does this decision solve?>

## Decision

<what was decided?>

## Rationale

<why was this decision made?>

## Consequences

<what changes as a result of this decision?>

## Compliance

<how is this decision enforced and validated?>
```

---

## Document Hierarchy

```
AQLIYA_ARCHITECTURE_CONSTITUTION.md          ← 11 principles
        │
        ▼
ARCHITECTURE_DECISION_INDEX.md              ← All ADRs mapped
        │
        ▼
SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md  ← Diagnosis
        │
        ▼
PLATFORM_CORE_EXTRACTION_BLUEPRINT.md       ← Execution Contract
        │
        ▼
PLATFORM_KERNEL_ARCHITECTURE.md             ← Kernel Design
        │
        ▼
SALESOS_V2_BLUEPRINT.md (future)            ← Product Design
        │
        ▼
PRDs → Specifications → Implementation
```

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Reference — Decision Map
- **Date:** 2026-06-28
- **Version:** 0.3 (Final — Architecture Program closed)
- **Parent document:** `AQLIYA_ARCHITECTURE_CONSTITUTION.md`
- **Changes:**
  - v0.1: Initial index with ADR-001 through ADR-012
  - v0.2: **ADR-013** (Business First, Technology Second), **ADR-014** (Business Capability Map), **ADR-015** (Product Capability Layer) added. Aligned with Constitution v0.2.
  - v0.3 (final): **ADR-016** (Architectural Closure) added. Architecture Program baseline v1.0 closed. Engineering authorized. All 16 ADRs documented.
- **Status:** Draft — ready for review
