# LocalContentOS V3.5 — Engine State Dashboard

**Date:** 2026-06-17  
**Purpose:** Real-time dashboard capture of every V3.5 engine's execution state, data dependencies, and trigger mechanism.

---

## 1. V3.5 Feature Overview

V3.5 introduced 6 connected capabilities on 2026-06-17:

| Feature | Code State | Data State | Dependency Chain |
|---------|-----------|------------|-----------------|
| 1. Knowledge Retrieval Layer | ✅ Built | ❌ Empty | No memories → no context |
| 2. Recommendation Grounding | ✅ Built | ❌ Not triggered | No context → no grounded recs |
| 3. Simulation Explainability | ✅ Built | ❌ Not triggered | No scores → no sims |
| 4. Recommendation Feedback Loop | ✅ Built | ❌ No data | No recs → no feedback |
| 5. Pilot Readiness Dashboard | ✅ Built | ❌ Mostly RED | No data → all defaults |
| 6. Local RAG Integration | ✅ Built | ❌ Never invoked | No context → no RAG |

**All 6 features share the same root cause:** The data pipeline that feeds them has never been started.

---

## 2. Data Flow Diagram (Actual State)

```
Seed Script ──────────────────────────────────────────────────────┐
  ├── Creates Project (lc-project-demo-001)                      │
  ├── Creates 12 Suppliers                                        │
  ├── Creates 30 Spend Records (SAR 64M)                          │
  ├── Creates 1 Workbook (23 lines, 35% complete)                 │
  ├── Creates 12 Classifications (8 confirmed, 4 draft)           │
  ├── Creates 15 Evidence Records                                 │
  ├── Creates 5 Findings                                          │
  ├── Creates 1 Review                                            │
  ├── Creates 1 Approval                                          │
  └── Creates 6 Audit Events                                      │
                                                                  ▼
                                                    ┌─────────────────────────┐
                                                    │   RAW DATA READY        │
                                                    │   All models populated  │
                                                    │   But engines never run │
                                                    └─────────────────────────┘
                                                              │
                    ┌─────────────────────────────────────────┤
                    │                                         │
                    ▼                                         ▼
    ┌───────────────────────────┐             ┌───────────────────────────┐
    │   Population Engine       │             │   Missing Data Engine     │
    │   (auto-fill workbook)    │             │   (data requests)         │
    │   ❌ NOT TRIGGERED         │             │   ❌ NOT TRIGGERED         │
    │   Would fill SPN/WRK/AST  │             │   Would find 13 gaps      │
    └───────────────────────────┘             └───────────────────────────┘
                    │                                         │
                    ▼                                         ▼
    ┌───────────────────────────┐             ┌───────────────────────────┐
    │   Scoring Engine          │             │   Pattern Engine          │
    │   (LC score from lines)   │             │   (find patterns)         │
    │   ⚠️ REVENUE ONLY (79%)   │             │   ❌ NOT TRIGGERED         │
    │   65% weight missing      │             │   Would find supplier     │
    └───────────────────────────┘             │   localization patterns   │
                    │                         └───────────────────────────┘
                    ▼                                         │
    ┌───────────────────────────┐                             │
    │   Recommendation Engine   │◄────────────────────────────┘
    │   (5 category builders)   │
    │   ❌ NOT TRIGGERED         │
    │   Needs workbook + memory │
    └───────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────┐             ┌───────────────────────────┐
    │   Simulation Engine       │             │   Knowledge Retrieval     │
    │   (what-if scenarios)     │             │   (context-builder.ts)    │
    │   ❌ NOT TRIGGERED         │             │   ❌ NEVER INVOKED         │
    │   Needs workbook + recs   │             │   7 sources all empty     │
    └───────────────────────────┘             └───────────────────────────┘
                    │                                         │
                    ▼                                         ▼
    ┌───────────────────────────┐             ┌───────────────────────────┐
    │   Feedback Loop           │             │   Local RAG Pipeline      │
    │   (outcomes + health)     │             │   (Ollama qwen3:8b)       │
    │   ❌ NO DATA               │             │   ❌ NEVER INVOKED         │
    │   Needs recs + outcomes   │             │   AI ready, no context    │
    └───────────────────────────┘             └───────────────────────────┘
```

---

## 3. Per-Engine Status Detail

### 3.1 Knowledge Retrieval Layer (`context-builder.ts`)

| Source | Expected Count | Actual | Status |
|--------|---------------|--------|--------|
| Industry Pattern Memory | ≥1 | 0 | ❌ Empty |
| Organization Match Memory | ≥1 | 0 | ❌ Empty |
| Workbook Analysis | Live workbook | 23 lines | ✅ Available but not structured as context |
| Pattern History | ≥1 | 0 | ❌ Empty |
| Baseline Study | N/A | 0 | ❌ No baseline records |
| Knowledge | N/A | 0 | ❌ No knowledge records |
| ERP Mappings | N/A | 0 | ❌ No ERP import |

**Impact:** Any AI call to `runGovernedProductAI` with workbook context would receive an empty context structure.

### 3.2 Recommendation Grounding

| Category Builder | Data Available | Would Generate | Status |
|-----------------|---------------|----------------|--------|
| `supplier_optimization` | 12 suppliers, 30 spend, 53% local | ✅ Yes — "improve from 53% to 70%" | ❌ Not triggered |
| `workforce_localization` | WRK-01/02/03 null, WRK-04 = 3.6M | ⚠️ Partial — needs workforce baseline | ❌ Not triggered |
| `asset_localization` | AST-01 null, AST-02 = 15M | ⚠️ Needs target-to-actual ratio | ❌ Not triggered |
| `missing_data_resolution` | 13 null lines | ✅ Yes — "fill 13 critical gaps" | ❌ Not triggered |
| `evidence_improvement` | 8 confirmed classifications, 4 draft | ⚠️ Partial — confirm 4 draft classifications | ❌ Not triggered |

### 3.3 Simulation Explainability

| Scenario Type | Data Available | Would Run | Status |
|---------------|---------------|-----------|--------|
| `supplier` | Supplier spend data, workbook lines | ✅ Would compute delta | ❌ Not triggered |
| `workforce` | Payroll cost baseline | ⚠️ Needs WRK-01/02 filled | ❌ Not triggered |
| `asset` | AST-02 = 15M | ⚠️ Needs AST-01 filled | ❌ Not triggered |
| `mixed` | Revenue data | ⚠️ Needs all metrics | ❌ Not triggered |

**Drivers decomposition** (`drivers` JSON field) would produce entries like:
```json
[
  { "factor": "Supplier Localization", "impact": 4.2, "contributionPct": 50.6 },
  { "factor": "Missing Data", "impact": -2.1, "contributionPct": -25.0 }
]
```
This feature is tested in code but never executed.

### 3.4 Recommendation Feedback Loop

| Metric | Expected | Actual | Status |
|--------|----------|--------|--------|
| Total outcomes | ≥1 | 0 | ❌ Empty |
| Acceptance rate | Computed | N/A | ❌ No data |
| Prediction accuracy | Computed | N/A | ❌ No data |
| Top performers | Identified | None | ❌ No data |
| Pattern health records | ≥1 | 0 | ❌ Empty |

### 3.5 Pilot Readiness Dashboard

Full breakdown in `LOCALCONTENT_PILOT_READINESS_REPORT_V1.md`.  
Dashboard at `/local-content/pilot-readiness` returns **6 RED, 3 AMBER, 2 GREEN**.

### 3.6 Local RAG Integration

| Component | Status | Detail |
|-----------|--------|--------|
| Ollama host | ✅ Running | `http://localhost:11434` |
| Model (qwen3:8b) | ✅ Loaded | Confirmed earlier |
| Embedding model | ✅ Pulled | `nomic-embed-text` |
| Context builder → AI | ❌ Never called | `runGovernedProductAI` never invoked with LC context |
| Grounding pipeline | ❌ Never wired | No evidence-grounded prompts sent to Ollama |
| Audit trail | ✅ Schema ready | `LcAiAuditEvent` table ready for events |

**The Local RAG Integration is the most advanced V3.5 feature and is also the most dormant.** All infrastructure works; no data flows through it.

---

## 4. Execution Priority Matrix

| Priority | Engine | Effort | Impact | Depends On |
|----------|--------|--------|--------|------------|
| P0 | Fix workbook seed data | 1 session | 41%→85% completion | — |
| P0 | Run population engine | 30 min | Fill SPN/WRK/AST | Fixed seed |
| P1 | Run missing data engine | 15 min | Create data requests | Populated workbook |
| P1 | Run recommendation engine | 30 min | 5+ grounded recs | Populated workbook |
| P1 | Run simulation engine | 15 min | 4+ scenarios | Workbook + recs |
| P2 | Run pattern suggestion | 20 min | 3+ suggestions | Supplier data |
| P2 | Seed memory tables | 20 min | Industry + org memory | Pattern suggestions |
| P3 | Trigger AI pipeline | 30 min | AI audit events | Context + patterns |
| P3 | Invoke RAG pipeline | 30 min | Grounded AI output | AI pipeline |
| P4 | Full loop validation | 1 session | End-to-end green | All above |

---

## 5. Key Configuration / Entry Points

| Action | Entry Point | Location |
|--------|-------------|----------|
| Populate workbook | Server action `populateWorkbook` | `src/app/local-content/workbook/actions.ts` |
| Score workbook | Server action `computeAndSaveLcScore` | Same file |
| Generate data requests | Server action `generateDataRequests` | Same file |
| Generate recommendations | Server action `generateRecommendations` | Likely same or adjacent |
| Run simulation | Server action `runSimulation` | Likely same or adjacent |
| Invoke AI review | `runGovernedProductAI` | `src/lib/ai/*` |
| Seed memories | Direct Prisma or engine output | Manual or batch script |

**Recommended next step:** Create a single CLI script (`scripts/seed-lc-pipeline.ts`) that invokes all engines in dependency order, or manually trigger each via its server action.
