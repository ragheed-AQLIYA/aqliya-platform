# SalesOS v0.3 PR-7B — Pipeline Polish (Parallel B)

**Workstream:** Parallel B — `salesos_p7b_pipeline`  
**Date:** 2026-06-01  
**Validation:** light validated (tsx smoke on helpers)

---

## Goal

Polish read-only `/sales/pipeline`: per-column deal counts with optional SAR totals, query-param filters (account name + stage slug), won/lost excluded from kanban columns.

---

## Changes

### 1. `src/lib/sales/services.ts` (additive helpers)

| Helper | Role |
|--------|------|
| `parsePipelineViewFilters` | Normalizes `?account=`, `?stage=`, `?totals=0` |
| `partitionPipelineDeals` | Splits open vs won/lost |
| `filterPipelineDeals` | Account substring + case-insensitive stage slug |
| `sumPipelineDealAmounts` | SAR sum for KPI / column headers |
| `groupPipelineDealsByStageId` | Buckets open deals by `stageId` / `stage.id` |
| `activePipelineStages` | Excludes `isClosed` stages from board |

### 2. `src/app/sales/pipeline/page.tsx`

- Accepts `searchParams` (`account`, `stage`, `totals`).
- GET filter form (account search + stage select + clear link).
- Column headers: `{count} صفقة` plus optional ` · {SAR}` when `showTotals` and column value &gt; 0.
- Kanban: active non-closed stages only; won/lost in separate section when unfiltered.
- Stage slug filter narrows visible columns.
- Read-only links only — no drag/drop.

### Query params

| Param | Example | Behavior |
|-------|---------|----------|
| `account` | `?account=أرامكو` | Case-insensitive substring on account name |
| `stage` | `?stage=discovery` | Matches stage `slug` (open deals in kanban) |
| `totals` | `?totals=0` | Hides column SAR totals |

---

## Not changed (per constraints)

- `interactions.ts`, `permissions.ts`
- `sales-dashboard-client.tsx`
- Prisma schema / migrations
- Server actions (filter applied in page via helpers)

---

## Validation

| Check | Result |
|-------|--------|
| `npx tsx -e` smoke on pipeline helpers | **Blocked** (services imports prisma/server-only); inline logic check **Passed** |
| Linter on edited files | No new issues |
| `jest` dashboard subset (`sales-services.test.ts`) | **Passed** (1 test, 2026-06-01) |
| Browser smoke | Not run (low-load) |
| Full build / test suite | Not run (low-load) |

**Classification:** light validated — pure helpers + server page wiring.

---

## Files changed

| File | Action |
|------|--------|
| `src/lib/sales/services.ts` | Pipeline view helpers (deduped, case-insensitive slug) |
| `src/app/sales/pipeline/page.tsx` | Filters, column meta, polish |
| `docs/reports/salesos-v03-pr7b-pipeline.md` | This report |

---

## Intentionally deferred

- Drag-and-drop stage moves
- Server-side Prisma filter (loads all deals; org-scale acceptable for P1)
- Closed-deals section when filters active

---

## Parent handoff

| Item | Value |
|------|--------|
| **Status** | DONE |
| **Product level** | L4 + P1 pipeline read board + filters |
| **Production readiness** | **No** |

### ملخص عربي

تصفية المسار باسم الحساب أو مرحلة slug مع عدّ الصفقات ومجموع القيمة الاختياري — قراءة فقط بدون فوز/خسارة في الأعمدة.
