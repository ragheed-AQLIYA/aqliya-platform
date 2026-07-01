# SalesOS v0.3 PR-6B — Dashboard Due Next Actions

**Workstream:** Parallel B — `salesos_p6_dashboard`  
**Date:** 2026-06-01  
**Validation:** light validated (unit test added; execution blocked by pre-existing `interactions.ts` encoding issue — see below)

---

## Goal

Surface open deals with a `nextActionAt` due within 7 days or overdue on the SalesOS dashboard.

---

## Changes

### 1. `src/lib/sales/services.ts`

- Imported `readDealNextAction` from `deal-metadata.ts`.
- Added `buildDueNextActions()` helper (7-day horizon, overdue flag, ascending sort by date).
- Extended `getSalesDashboardStats()` with a parallel Prisma query for open deals (includes `metadata`).
- Return shape now includes `dueNextActions: DueNextActionDeal[]`.

**Filter logic**

| Condition | Included |
|-----------|----------|
| Deal status `open` | Yes |
| `metadata.nextActionAt` parseable | Yes |
| `nextActionAt` ≤ now + 7 days | Yes |
| `nextActionAt` > now + 7 days | No |
| No `nextActionAt` | No |

### 2. `src/app/sales/sales-dashboard-client.tsx`

- Extended `SalesDashboardStats` interface with `dueNextActions`.
- Added minimal RTL section **«إجراءات مستحقة»** after AI insight, before pipeline stages.
- Each row links to `/sales/deals/[id]`; shows title, account, optional action text, date, overdue badge.

### 3. `src/lib/sales/__tests__/sales-services.test.ts`

- Extended Prisma mock (`count`, `findMany` on deal/account/stage).
- Added `dashboard stats` describe block: overdue + within-7-days included; future and empty metadata excluded.

---

## Not Changed (per constraints)

- Guards / RBAC matrix
- `interactions.ts`
- Pipeline page
- Prisma schema
- No migration

---

## Validation

| Check | Result |
|-------|--------|
| Typecheck / lint on edited files | No new linter issues on changed files |
| Unit test `returns due next actions for open deals within 7 days or overdue` | **Not executed** — Jest/ts-jest fails on pre-existing `TS1127 Invalid character` in `src/lib/sales/interactions.ts` (UTF-16 corruption; unrelated to this PR) |
| Browser smoke | Not run (low-load protocol) |
| Full build / test suite | Not run (low-load protocol) |

**Classification:** light validated — logic and UI wired; targeted test authored but blocked by unrelated repo issue.

---

## Files Changed

| File | Action |
|------|--------|
| `src/lib/sales/services.ts` | Extended dashboard stats |
| `src/app/sales/sales-dashboard-client.tsx` | Due next actions UI |
| `src/lib/sales/__tests__/sales-services.test.ts` | Dashboard stats test |
| `docs/reports/salesos-v03-pr6b-dashboard.md` | This report |

---

## Known Limitations

- `nextActionAt` lives in JSON `metadata`; filtering is in-memory after fetching all open deals (acceptable for v0.3 prototype scale).
- No pagination cap on due list (all matching open deals returned).
- AI insight banner text unchanged (still references PR-2).

---

## Arabic Summary

تمت إضافة قسم «إجراءات مستحقة» في لوحة SalesOS يعرض الصفقات المفتوحة ذات موعد إجراء خلال 7 أيام أو متأخرة، مع رابط لصفحة الصفقة.
