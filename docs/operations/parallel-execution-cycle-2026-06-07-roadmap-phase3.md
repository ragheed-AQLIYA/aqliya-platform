# Roadmap Phase 3 Execution — Cycle 2026-06-07

**Authority:** `docs/official/AQLIYA_ROADMAP_v1.2.md`, `docs/execution-backlog/v1.2-execution-backlog.md`  
**Branch:** `main`  
**Mode:** Implement highest open Phase 3 items with repo evidence

---

## Pre-flight

| Check | Result |
| ----- | ------ |
| Phase 1–2 backlog | Majority ✅ in code (see L6_COMPLETION_PROGRAM) |
| Cycle 6 Track A | LOCAL_COMPLETE; remote staging DNS blocked |
| Phase 3 target | S7-01 (SalesOS intelligence hub) |

---

## Delivered — S7-01

**Task:** Wire `/sales/intelligence` tabs to real vNext engines (replace placeholders).

| Tab | Before | After |
| --- | ------ | ----- |
| Market | Placeholder | `MarketIntelligenceView` + `salesGetMarketIntelligenceForOrg` |
| Proof | Placeholder | `ProofEffectivenessView` + `salesBuildProofEffectivenessAnalysis` |
| Memory | Real | unchanged (`IntelligenceMemoryView`) |
| Graph | Placeholder | `CommercialKnowledgeGraphPanel` + snapshot |

**File:** `src/app/sales/intelligence/page.tsx`

---

## Verified already in repo (marked in backlog)

| ID | Evidence |
| -- | -------- |
| A1-01 | All engagement tabs have `loading.tsx` / `error.tsx` |
| A1-02 | `src/lib/audit/sampling/engine.ts` — 25 tests pass with LC |
| LC-01 | `src/lib/local-content/scoring.ts` — weighted factors |
| LC-03 | `src/lib/local-content/approval-routing.ts` |
| A1-09 | `audit-ai-bridge.ts` + Cycle 6 smoke |

---

## Validation

| Command | Result |
| ------- | ------ |
| `npm test` (LC + audit sampling) | 25 passed |
| `npm test` (sales vnext intelligence) | 15 passed |
| `npx tsc --noEmit` | WIP unrelated errors in workflowos/sales (local dirty) |

---

## Delivered — Phase 3 slice 2 (2026-06-07)

| ID | Deliverable | Evidence |
| -- | ----------- | -------- |
| **S7-02** | Pipeline forecasting | `src/lib/sales/intelligence/pipeline-forecast.ts`, `/sales/forecast`, `PipelineForecastView`, nav |
| **LC-06** | Org spend analytics | `src/lib/local-content/spend-analytics.ts`, `/local-content/analytics`, `getOrganizationSpendAnalytics` |
| **D3-02** | Risk-based monitoring signals | `src/lib/decision/signal-automation.ts`, `runMonitoringSignalAutomationAction`, signals UI button |

### Validation (slice 2)

| Command | Result |
| ------- | ------ |
| `npm test` spend-analytics + signal-automation | 4 passed |

---

## Delivered — Phase 3 slice 3 (parallel)

| ID | Deliverable | Evidence |
| -- | ----------- | -------- |
| **S7-04** | L5 acceptance criteria | `docs/product/salesos-l5-acceptance-criteria.md`, `l5-acceptance.ts` |
| **D3-03** | Sector intelligence on decision detail | `sector-intelligence*.ts`, `DecisionSectorIntelligencePanel` |

### Validation (slice 3)

| Command | Result |
| ------- | ------ |
| `npm test` l5-acceptance + sector-intelligence | See commit report |

---

## Next roadmap items

| ID | Task | Blocker |
| -- | ---- | ------- |
| L0-01 | Terraform apply | Operator approval |
| L0-04 | Pentest | Vendor |
| Cycle 6 CLOSED | Remote staging | DNS / `staging.aqliya.ai` |
| LC-02 | Tender matching | Large |
| S7-05 | Bilingual UX parity | Medium |

## Delivered — S7-05 (2026-06-07)

| Item | Evidence |
| ---- | -------- |
| RTL layout | `src/app/sales/layout.tsx` (existing) + hub/views `dir="rtl"` |
| Arabic loading | `src/app/sales/loading.tsx` |
| Copy helpers | `src/lib/sales/sales-ux-copy.ts` |
| Parity gate | `src/lib/sales/sales-bilingual-parity.ts` |
| L5 evaluator | `U1_BILINGUAL_RTL` true in `l5-acceptance.ts` baseline |

## Delivered — S7-06 + LC-02 (2026-06-07)

| ID | Deliverable |
| -- | ----------- |
| **S7-06** | `/sales/funnel`, `conversion-funnel.ts`, command-center snippet |
| **LC-02** | `tender-matching.ts`, `/local-content/projects/[id]/tender-match`, seed metadata |

## Delivered — slice 4 (2026-06-07)

| ID | Deliverable |
| -- | ----------- |
| **A1-03** | `materiality.ts` + sampling threshold |
| **LC-04** | `/local-content/classification-rules` |
| **LC-09** | Content Studio scope doc |
| **D3-05** | Portfolio panel on decisions dashboard |
| **D3-06** | Outcome correlation on dashboard |
| **S7-07** | `/sales/pipeline-depth` |

## Delivered — slice 5 (2026-06-07)

| ID | Deliverable |
| -- | ----------- |
| **A1-04** | `rollforward.ts`, `rollforward-service.ts`, `RollforwardPanel` on statements |
| **LC-05** | `pdf-arabic.ts`, Arabic/RTL labels in `local-content/export.ts` PDF |
| **D3-04** | `cross-decision-patterns.ts`, recurring themes on `/decisions` dashboard |

### Validation (slice 5)

| Command | Result |
| ------- | ------ |
| `npm test` rollforward + cross-decision-patterns + pdf-arabic | See commit report |

## Delivered — slice 6 (2026-06-07)

| ID | Deliverable |
| -- | ----------- |
| **A1-05** | `AuditEvidenceVersion` migration, versioning service, evidence version history UI |
| **A1-06** | `arabic-pdf-support.ts`, bilingual locale on `exportEngagementAction` + PDF exporter |

### Validation (slice 6)

| Command | Result |
| ------- | ------ |
| `npm test` arabic-pdf-support | See commit report |

**Status:** DONE_WITH_CONCERNS (Phase 3 slices 1–6); migration `20260607100000` needs `migrate deploy` on envs; Cycle 6 remote BLOCKED; A1-07/A1-08 open
