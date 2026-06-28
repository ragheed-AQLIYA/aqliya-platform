# B2A-3: Prisma Layer Tenant Isolation — AFTER State

**Date:** 2026-06-28
**Scope:** 18 lib functions in 3 files — `population.ts`, `services.ts`, `missing-data.ts`

---

## Changes Made

### 1. All 18 public lib functions now accept `organizationId: string`

| File | Functions Updated | Total Queries Scoped |
|------|-------------------|---------------------|
| `population.ts` | 7 public functions | ~20 Prisma queries |
| `services.ts` | 3 public functions | ~7 Prisma queries |
| `missing-data.ts` | 7 public functions | ~10 Prisma queries |

**Total: 18 functions, ~37 Prisma queries now org-scoped**

### 2. Detailed Function-by-Function Changes

#### `population.ts` (7 functions, ~20 queries)

| Function | Signature Change | Query Pattern |
|----------|-----------------|---------------|
| `populateWorkbookFromProject` | `+(organizationId: string)` | `LocalContentProject.findFirst` → `{ id, organizationId }`; `LcWorkbook.findFirst` → `{ projectId, project: { organizationId } }`; `LcWorkbookLine.findMany` → `{ workbookId, workbook: { project: { organizationId } } }`; `LcWorkbook.update` → `{ id, project: { organizationId } }` |
| `populateWorkbookFromTb` | `+(organizationId: string)` | `LocalContentProject.findFirst` → `{ id, organizationId }`; `LcWorkbook.deleteMany` → `{ workbookId, workbook: { project: { organizationId } } }`; `LcWorkbook.update` → `{ id, project: { organizationId } }`; `LcWorkbookLine.findMany` → `{ workbookId, workbook: { project: { organizationId } } }` |
| `recalculateWorkbookStats` | `+(organizationId: string)` | `LcWorkbook.findFirst` → `{ id, project: { organizationId } }`; `LcWorkbookLine.findMany` → `{ workbookId, workbook: { project: { organizationId } } }`; `LcWorkbookLine.update` → `{ id, workbook: { project: { organizationId } } }`; `LcWorkbook.update` → `{ id, project: { organizationId } }` |
| `getWorkbookWithLines` | `+(organizationId: string)` | `LcWorkbook.findFirst` → `{ id, project: { organizationId } }` (was findUnique with only id) |
| `updateWorkbookLineValue` | `+(organizationId: string)` | `LcWorkbookLine.findFirst` → `{ id, workbook: { project: { organizationId } } }`; `LcWorkbook.findFirst` → `{ id, project: { organizationId } }`; `LcWorkbookLine.update` → `{ id, workbook: { project: { organizationId } } }` |
| `listProjectWorkbooks` | `+(organizationId: string)` | `LcWorkbook.findMany` → `{ projectId, project: { organizationId } }` |
| `listOrganizationWorkbooks` | Already scoped (unchanged) | `LcWorkbook.findMany` → `{ project: { organizationId } }` |

#### `services.ts` (3 functions, ~7 queries)

| Function | Signature Change | Query Pattern |
|----------|-----------------|---------------|
| `getWorkbookDashboardSummary` | Already scoped (unchanged) | `LcWorkbook.findMany` → `{ project: { organizationId } }` |
| `createWorkbook` | `+(organizationId: string)` | `LocalContentProject.findFirst` → `{ id, organizationId }`; `LcWorkbook.findFirst` (return) → `{ id, project: { organizationId } }` |
| `exportWorkbookJson` | `+(organizationId: string)` | `LcWorkbook.findFirst` → `{ id, project: { organizationId } }` (was findUnique with only id) |
| `markWorkbookExported` | `+(organizationId: string)` | `LcWorkbook.findFirst` → `{ id, project: { organizationId } }`; `LcWorkbook.update` → `{ id, project: { organizationId } }` |

#### `missing-data.ts` (7 functions, ~10 queries)

| Function | Signature Change | Query Pattern |
|----------|-----------------|---------------|
| `detectMissingData` | `+(organizationId: string)` | `LcWorkbookLine.findMany` → `{ workbookId, workbook: { project: { organizationId } } }` |
| `generateDataRequest` | `+(organizationId: string)` | `LcWorkbook.findFirst` → `{ id, project: { organizationId } }`; `LcWorkbookLine.findMany` → `{ workbookId, workbook: { project: { organizationId } } }`; `LcDataRequest.findFirst` (return) → `{ id, workbook: { project: { organizationId } } }` |
| `getWorkbookDataRequests` | `+(organizationId: string)` | `LcDataRequest.findMany` → `{ workbookId, workbook: { project: { organizationId } } }` |
| `fulfillDataRequestItem` | `+(organizationId: string)` | `LcDataRequestItem.update` → `{ id, request: { workbook: { project: { organizationId } } } }` |
| `waiveDataRequestItem` | `+(organizationId: string)` | `LcDataRequestItem.update` → `{ id, request: { workbook: { project: { organizationId } } } }` |
| `sendDataRequest` | `+(organizationId: string)` | `LcDataRequest.update` → `{ id, workbook: { project: { organizationId } } }` |
| `getClientDataRequestText` | `+(organizationId: string)` | `LcDataRequest.findFirst` → `{ id, workbook: { project: { organizationId } } }` |

### 3. Callers Updated

| Caller | Changes |
|--------|---------|
| `localcontent-workbook-actions.ts` | All 14 action wrappers now capture `organizationId` from guard return value and pass to lib functions |
| `pipeline-orchestrator.ts` | 3 calls updated (`populateWorkbookFromProject`, `detectMissingData` ×2); 3 inline Prisma queries scoped with `project: { organizationId }` |
| `ai-advisor/page.tsx` | `getWorkbookWithLines` call now passes `organizationId` |
| Test file | Mocks updated — guards return `"org-1"`; Prisma mock `findFirst` replaces `findUnique` |

### 4. Scoping Patterns Used

| Entity | Scoping Pattern |
|--------|-----------------|
| `LocalContentProject` | `where: { id, organizationId }` (direct field) |
| `LcWorkbook` | `where: { id, project: { organizationId } }` (1 JOIN) |
| `LcWorkbookLine` | `where: { id/workbookId, workbook: { project: { organizationId } } }` (2 JOINs) |
| `LcDataRequest` | `where: { id/workbookId, workbook: { project: { organizationId } } }` (2 JOINs) |
| `LcDataRequestItem` | `where: { id, request: { workbook: { project: { organizationId } } } }` (3 JOINs) |

All `findUnique` calls replaced with `findFirst` using the same `id` filter plus org scope through relation chain.

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/local-content/workbook/population.ts` | +`organizationId` param to 7 functions; all Prisma queries scoped |
| `src/lib/local-content/workbook/services.ts` | +`organizationId` param to 3 functions; all Prisma queries scoped |
| `src/lib/local-content/workbook/missing-data.ts` | +`organizationId` param to 7 functions; all Prisma queries scoped |
| `src/actions/localcontent-workbook-actions.ts` | All 14 action wrappers pass `organizationId` to lib calls |
| `src/lib/local-content/pipeline-orchestrator.ts` | 3 calls updated, 3 inline queries scoped |
| `src/actions/__tests__/localcontent-workbook-actions.test.ts` | Mocks return `org-1`; Prisma mock updated |
| `src/app/local-content/projects/[projectId]/workbook/[workbookId]/ai-advisor/page.tsx` | orgId extracted before `getWorkbookWithLines` call |

---

## Metrics

| Metric | Before B2A-3 | After B2A-3 |
|--------|:------------:|:-----------:|
| Lib functions with orgId param | 2/18 (11%) | **18/18 (100%)** |
| Unscoped Prisma queries in 3 lib files | ~37 | **0** |
| findUnique in 3 lib files | 3 (getWorkbookWithLines, exportWorkbookJson, getClientDataRequestText) | **0** (all → findFirst) |
| Cumulative exploit paths remaining (action layer) | 0 (B2A-1+B2A-2) | **0** |
| Cumulative exploit paths remaining (lib layer) | 37 unscoped queries | **0** (all defense-in-depth) |
| Cumulative actions+lib protected | 30 actions + 0 lib = 30 | **30 actions + 18 lib functions (37 queries)** |
| Total guard functions | 8 | **8** (no new guards needed — lib uses param not guards) |

## Defense-in-Depth Layers

| Layer | Protection | Wave |
|-------|-----------|------|
| 1 — Action guards | verify org ownership for every server action | B2A-1, B2A-2 |
| 2 — Lib layer params + scoped queries | enforce org at Prisma query level | **B2A-3** |
| 3 — (future) Prisma middleware | global query filter for organizationId | B2A-5 |

B2A-3 provides **Layer 2 defense-in-depth**: Even if a caller bypasses action-layer guards, the lib functions themselves now enforce tenant isolation at the Prisma query level.

## Traceability

- BEFORE → AFTER gap closed: All 37 unscoped Prisma queries now filter by orgId through entity relation chain
- Files changed: 7 source files + 1 evidence package (RB-01/B2A-3/)
- Regression guard: `node RB-01/B2A-3/guard.mjs` — verifies all lib queries are org-scoped
- No new guards needed — B2A-3 uses parameter passing instead of guard calls (auth stays out of lib layer)
