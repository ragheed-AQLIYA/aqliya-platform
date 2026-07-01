# Capability Backlog — SalesOS v2

> **Status:** Baseline v1.0 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Execution Backlog — bridge between `SALESOS_V2_BLUEPRINT.md` (frozen) and PRDs.
> **Traceability:** Every Epic → Product Capability → Blueprint section → ADR → Constitution principle.
> **Rule:** No code is written unless it traces to a Product Capability, a PRD, a Blueprint section, and an ADR.

---

## Traceability Chain

Every item in this backlog must maintain the full chain:

```
Constitution Principle → ADR → Blueprint Section → Product Capability → Epic → PRD → Spec → Implementation → Test
```

If any link is missing, the work item is not ready for execution.

---

## Execution Waves

Per Architecture Review Board direction, execution follows three waves:

| Wave | Focus | Product Capabilities | Rationale |
|---|---|---|---|
| **Wave 1** | Core Domain Model | Opportunity Management, Account Intelligence | Build the foundational entities (Deal, Account) and workflows before adding intelligence layers. |
| **Wave 2** | Commercial Operations | Pipeline Management, Commercial Memory | Add pipeline visualization and pattern capture once core entities exist. |
| **Wave 3** | Intelligence | Revenue Intelligence, Forecast Management | Intelligence requires real data. Building it before data exists leads to rework. |

---

## Epic Backlog

### EPIC-01: Opportunity Management

| Field | Value |
|---|---|
| **Product Capability** | Opportunity Management |
| **Blueprint Sections** | §5 (Product Capabilities), §7.2 (Deal Domain), §7.4 (Deal State Machine), §7.3 (Domain Events), §9 (Deal Modules) |
| **ADR** | ADR-001, ADR-015 |
| **Constitution Principles** | 1 (Product Independence), 2 (Platform Neutrality), 5 (Consumer-Driven Extraction) |
| **Wave** | 1 |
| **Depends On** | Platform Kernel: `platform.auth`, `platform.workflow`, `platform.evidence` |
| **PRD** | PRD-01 (to be created) |
| **Specifications** | Domain Spec: Deal lifecycle, stage transitions, evidence gates. API Spec: Deal CRUD, stage transition, evidence link. Workflow Spec: 7-state state machine with guards. UX Spec: Deal detail, deal review, approval panel. |
| **KPIs** | Review completion rate ≥ 90%, Evidence gate compliance ≥ 95%, Approval-to-close ratio ≥ 80% |
| **Exit Criteria** | SalesOS v2 can create a deal, transition through all 7 stages with evidence gates, submit for review, approve/reject, and close won/lost. All transitions create Domain Events. Audit trail complete. |

---

### EPIC-02: Account Intelligence

| Field | Value |
|---|---|
| **Product Capability** | Account Intelligence |
| **Blueprint Sections** | §5 (Product Capabilities), §7.2 (Account Domain), §7.4 (Account State Machine), §9 (Account Modules) |
| **ADR** | ADR-001, ADR-015 |
| **Constitution Principles** | 1, 2, 5 |
| **Wave** | 1 |
| **Depends On** | Platform Kernel: `platform.auth`, `platform.knowledge`, `platform.evidence`. Internal: EPIC-01 (Deal references Account). |
| **PRD** | PRD-02 (to be created) |
| **Specifications** | Domain Spec: Account lifecycle, ICP scoring, commercial memory linkage. API Spec: Account CRUD, ICP score, memory timeline. AI Spec: Account brief drafting with governance (if AI capability is available). |
| **KPIs** | ICP score coverage ≥ 80%, Account-memory linkage ≥ 90%, Brief export completion 100% |
| **Exit Criteria** | SalesOS v2 can create and qualify accounts, assign ICP scores, view commercial memory timeline, generate AI brief with governance. |

---

### EPIC-03: Pipeline Management

| Field | Value |
|---|---|
| **Product Capability** | Pipeline Management |
| **Blueprint Sections** | §5, §7.2 (Pipeline Domain), §9 (Pipeline Modules), §12 (UX: pipeline view) |
| **ADR** | ADR-001, ADR-015 |
| **Constitution Principles** | 1, 2 |
| **Wave** | 2 |
| **Depends On** | Platform Kernel: `platform.auth`, `platform.workflow`, `platform.features`. Internal: EPIC-01 (Deal data for pipeline). |
| **PRD** | PRD-03 (to be created) |
| **Specifications** | Domain Spec: Pipeline organization, stage definitions, deal-to-stage mapping. API Spec: Pipeline query, stage distribution, weighted value. UX Spec: Kanban board, drag-and-drop, stage totals. |
| **KPIs** | Pipeline data completeness ≥ 90%, Pipeline reload < 1s p95 |
| **Exit Criteria** | Visual pipeline with stage grouping, weighted value calculation, drag-and-drop stage transitions (gated by Workflow Engine), deal filtering, export summary. |

---

### EPIC-04: Commercial Memory

| Field | Value |
|---|---|
| **Product Capability** | Commercial Memory |
| **Blueprint Sections** | §5, §7.2 (Interaction, Signal, Objection, Competitor, WinLoss domains), §7.3 (Domain Events), §9 (Commercial Memory modules) |
| **ADR** | ADR-001, ADR-015 |
| **Constitution Principles** | 1, 2, 12 (Business First, Technology Second) |
| **Wave** | 2 |
| **Depends On** | Platform Kernel: `platform.auth`, `platform.event-bus`, `platform.signals`, `platform.memory`. Internal: EPIC-01 (Deal data), EPIC-02 (Account data). |
| **PRD** | PRD-04 (to be created) |
| **Specifications** | Domain Spec: Signal detection rules, objection categorization, competitor tracking, win/loss analysis. API Spec: Signal CRUD, objection recording, competitor mention, win/loss entry. AI Spec: Rule-based signal detection, pattern recognition (ML in v2.1+). |
| **KPIs** | Signal precision ≥ 75%, Duplicate signal rate ≤ 10%, Objection resolution rate ≥ 60%, Pattern reuse rate ≥ 40% |
| **Exit Criteria** | SalesOS v2 captures signals from interactions, tracks objections with resolution status, records competitor mentions with threat levels, analyzes win/loss with reason distribution, detects patterns across deals. |

---

### EPIC-05: Revenue Intelligence

| Field | Value |
|---|---|
| **Product Capability** | Revenue Intelligence |
| **Blueprint Sections** | §5, §7.2 (Brief domain, Forecast domain), §8 (AI Journeys), §9 (Brief modules, Forecast modules) |
| **ADR** | ADR-001, ADR-015 |
| **Constitution Principles** | 1, 2, 12 |
| **Wave** | 3 |
| **Depends On** | Platform Kernel: `platform.ai`, `platform.knowledge`. Internal: EPIC-01 (Deal data for win probability), EPIC-02 (Account data for briefs), EPIC-04 (Commercial Memory for pattern input). |
| **PRD** | PRD-05 (to be created) |
| **Specifications** | Domain Spec: AI brief structure, win probability computation, next-action rules. API Spec: Brief generation request/review/approve, win probability query, next action list. AI Spec: Governance contract per AI action, confidence scoring, model selection. |
| **KPIs** | Forecast accuracy ≥ 85%, Win prediction precision ≥ 80%, Brief acceptance rate ≥ 70% |
| **Exit Criteria** | AI generates account briefs with governance metadata, win probability is computed for each deal, next actions are suggested per deal stage, all AI outputs are reviewable and auditable. |

---

### EPIC-06: Forecast Management

| Field | Value |
|---|---|
| **Product Capability** | Forecast Management |
| **Blueprint Sections** | §5, §7.2 (Forecast domain), §7.4 (Forecast State Machine), §9 (Forecast modules) |
| **ADR** | ADR-001, ADR-015 |
| **Constitution Principles** | 1, 2 |
| **Wave** | 3 |
| **Depends On** | Platform Kernel: `platform.workflow`, `platform.features`. Internal: EPIC-01 (Deal pipeline data), EPIC-03 (Pipeline analytics). |
| **PRD** | PRD-06 (to be created) |
| **Specifications** | Domain Spec: Forecast period lifecycle (Open → Draft → Committed → Closed → Measured), scenario modeling. API Spec: Forecast CRUD, scenario create, accuracy measurement. |
| **KPIs** | Forecast commit accuracy ≥ 80%, Scenario coverage ≥ 3 per period, Update frequency ≥ 1/week |
| **Exit Criteria** | Weighted pipeline forecast, scenario modeling (best/base/worst case), commit vs. pipeline comparison, accuracy tracking over time. |

---

## Dependency Map Between Epics

```
EPIC-02 (Account) ←── EPIC-01 (Deal) ──→ EPIC-03 (Pipeline)
                           │                      │
                           │                      │
                           ▼                      ▼
                     EPIC-04 (Memory) ──────→ EPIC-05 (Intelligence)
                                                      │
                                                      ▼
                                                EPIC-06 (Forecast)
```

| Epic | Blocked By | Description |
|---|---|---|
| EPIC-01 (Deal) | Nothing | Can start first |
| EPIC-02 (Account) | Nothing | Can start alongside EPIC-01 |
| EPIC-03 (Pipeline) | EPIC-01 | Needs Deal data |
| EPIC-04 (Memory) | EPIC-01, EPIC-02 | Needs Deal + Account entities |
| EPIC-05 (Intelligence) | EPIC-01, EPIC-02, EPIC-04 | Needs data and memory patterns |
| EPIC-06 (Forecast) | EPIC-01, EPIC-03 | Needs Deal data + pipeline analytics |

---

## Platform Kernel Readiness Per Epic

| Epic | Required Platform Capabilities | Kernel Status (from Extraction Blueprint) |
|---|---|---|
| EPIC-01 | `platform.auth`, `platform.workflow`, `platform.evidence` | Wave 1 extraction |
| EPIC-02 | `platform.auth`, `platform.knowledge`, `platform.evidence` | Wave 1-3 extraction |
| EPIC-03 | `platform.auth`, `platform.workflow`, `platform.features` | Wave 1-2 extraction |
| EPIC-04 | `platform.auth`, `platform.event-bus`, `platform.signals`, `platform.memory` | Wave 1-3 extraction |
| EPIC-05 | `platform.ai`, `platform.knowledge` | Wave 2-3 extraction |
| EPIC-06 | `platform.workflow`, `platform.features` | Wave 1-2 extraction |

---

## Validation: Traceability Check

Before any Epic enters implementation:

| Check | Required | Verified By |
|---|---|---|
| Constitution principles mapped | ✅ All applicable principles listed | Epic definition |
| ADR reference present | ✅ At least one ADR | Epic definition |
| Blueprint sections referenced | ✅ All relevant sections | Epic definition |
| Product Capability named | ✅ Exactly one from Blueprint §5 | Epic definition |
| Domain defined | ✅ At least one domain from Blueprint §7 | Epic definition |
| Modules defined | ✅ At least one module from Blueprint §9 | Epic definition |
| KPIs defined | ✅ Measurable from Blueprint §13.6 | Epic definition |
| Platform dependencies declared | ✅ All from Blueprint §1 (Product Profile) | Epic definition |
| Exit criteria defined | ✅ Observable | Epic definition |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Execution Backlog
- **Date:** 2026-06-28
- **Version:** 1.0 (Baseline)
- **Parent:** `SALESOS_V2_BLUEPRINT.md` (frozen)
- **Status:** **Baseline v1.0** — ready for PRD creation. First PRD target: PRD-01 (Opportunity Management) or PRD-02 (Account Intelligence).
