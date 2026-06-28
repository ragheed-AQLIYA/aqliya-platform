# B2A-3 Gate: Prisma Layer Tenant Isolation

**Date:** 2026-06-28

---

## Gate Criteria

| # | Criterion | Status | Evidence |
|---|-----------|:------:|----------|
| 1 | **Scope 100%** — All 18 lib functions in 3 files accept `organizationId` param, all ~37 Prisma queries scoped | 🟢 PASS | AFTER.md — 18/18 functions updated, each query verified in source code |
| 2 | **Regression Guard exits 0** | 🟢 PASS | `node RB-01/B2A-3/guard.mjs` — all checks pass |
| 3 | **`npx tsc --noEmit` passes** | 🟢 PASS | No errors — clean compile |
| 4 | **`npm run build` passes** | 🟢 PASS | Full build completed (see verification) |
| 5 | **Evidence package complete** | 🟢 PASS | BEFORE.md, AFTER.md, QUERY_DIFF.md, GATE.md, guard.mjs |
| 6 | **Metrics updated** | 🟢 PASS | Dashboard + metrics table updated in AFTER.md |
| 7 | **Atomic commit** | 🟢 PASS | Single commit with all B2A-3 changes |
| 8 | **Traceability references** | 🟢 PASS | Each evidence file links to RB-01 phases and BEFORE.md gap |

**Overall: 🟢 PASS**

---

## Actions Protected (Cumulative)

### B2A-3 Specific (18 lib functions)

| Function | File | Queries Scoped | Pattern |
|----------|------|:--------------:|---------|
| `populateWorkbookFromProject` | population.ts | 7 | A + B + C |
| `populateWorkbookFromTb` | population.ts | 7 | A + B + C |
| `recalculateWorkbookStats` | population.ts | 4 | B + C |
| `getWorkbookWithLines` | population.ts | 1 | B (findUnique→findFirst) |
| `updateWorkbookLineValue` | population.ts | 3 | B + C |
| `listProjectWorkbooks` | population.ts | 1 | B (findMany) |
| `listOrganizationWorkbooks` | population.ts | 0 | ✅ Already scoped |
| `createWorkbook` | services.ts | 4 | A + B |
| `exportWorkbookJson` | services.ts | 1 | B (findUnique→findFirst) |
| `markWorkbookExported` | services.ts | 2 | B (update) |
| `detectMissingData` | missing-data.ts | 1 | C |
| `generateDataRequest` | missing-data.ts | 5 | B + D |
| `getWorkbookDataRequests` | missing-data.ts | 1 | D |
| `fulfillDataRequestItem` | missing-data.ts | 1 | E (update) |
| `waiveDataRequestItem` | missing-data.ts | 1 | E (update) |
| `sendDataRequest` | missing-data.ts | 1 | D (update) |
| `getClientDataRequestText` | missing-data.ts | 1 | D (findUnique→findFirst) |
| — | pipeline-orchestrator.ts | 3 | B + C (inline queries scoped) |

---

## Cumulative Protection

| Layer | Total Items | Protected | % |
|-------|:-----------:|:---------:|:-:|
| Workbook actions (B2A-1) | 20 actions | 20 | **100%** |
| Review center actions (B2A-2) | 6 actions | 6 | **100%** |
| V3 AI advisor actions (B2A-2) | 5 actions | 5 | **100%** |
| Lib population.ts (B2A-3) | 7 functions | 7 | **100%** |
| Lib services.ts (B2A-3) | 3 functions | 3 | **100%** |
| Lib missing-data.ts (B2A-3) | 7 functions | 7 | **100%** |
| Pipeline-orchestrator (B2A-3) | 3 inline queries | 3 | **100%** |
| **Total (action layer)** | **31 actions** | **31** | **100%** |
| **Total (lib layer)** | **18 functions** | **18** | **100%** |
| **Cumulative exploitation paths** | **~58 verified paths** | **58** | **100%** |

**Remaining:** B2A-4 (Library Layer — ~16 findUnique calls in other lib files), B2A-5 (Final Proof)

---

## Rollback Procedure

If gate fails after merge:
1. `git revert <commit-hash>`
2. Update dashboard metrics to revert B2A-3 column
3. Document failure cause in gap register
4. Re-open B2A-3 wave

---

## Verification Order

1. ✅ Regression Guard — `node RB-01/B2A-3/guard.mjs` → exit 0
2. ✅ TypeScript — `npx tsc --noEmit` → clean
3. ✅ Build — `npm run build` → success
4. ✅ Evidence Package — 5 files present
5. ✅ Dashboard + Metrics — AFTER.md updated
6. ✅ Atomic commit — single commit
