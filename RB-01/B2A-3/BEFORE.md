# BEFORE — B2A-3: Prisma Layer Tenant Isolation

## Wave Goal
Add `organizationId` parameter to all lib-layer functions in `population.ts`, `services.ts`, and `missing-data.ts`, and scope every Prisma query to enforce tenant isolation at the database layer — defense-in-depth beyond action-layer guards.

## Current State (Before)

### Trust Boundary
- Action-layer guards (B2A-1, B2A-2) verify org ownership for all 30 workbook/review/v3 actions
- However, lib-layer Prisma queries accept raw entity IDs (`workbookId`, `projectId`, `lineId`, `requestId`, `itemId`) with **zero org scoping**
- A bug or future caller bypassing action guards can read/write across tenant boundaries

### 3 Lib Files, 18 Functions, ~37 Unscoped Prisma Queries

#### `src/lib/local-content/workbook/population.ts` (8 functions, ~20 unscoped queries)

| Function | Queries | Unscoped IDs |
|---|---|---|
| `populateWorkbookFromProject` | 7 | projectId, workbookId |
| `populateWorkbookFromTb` | 7 | projectId, workbookId |
| `recalculateWorkbookStats` | 4 | workbookId, lineId |
| `getWorkbookWithLines` | 1 | workbookId |
| `updateWorkbookLineValue` | 3 | lineId, workbookId |
| `listProjectWorkbooks` | 1 | projectId |
| `listOrganizationWorkbooks` | 1 | ✅ Already scoped |
| `deleteWorkbook` | 2 | workbookId |

#### `src/lib/local-content/workbook/services.ts` (4 functions, ~7 unscoped queries)

| Function | Queries | Unscoped IDs |
|---|---|---|
| `getWorkbookDashboardSummary` | 1 | ✅ Already scoped |
| `createWorkbook` | 4 | projectId, workbookId |
| `exportWorkbookJson` | 1 | workbookId |
| `markWorkbookExported` | 2 | workbookId |

#### `src/lib/local-content/workbook/missing-data.ts` (7 functions, ~10 unscoped queries)

| Function | Queries | Unscoped IDs |
|---|---|---|
| `detectMissingData` | 1 | workbookId |
| `generateDataRequest` | 5 | workbookId, requestId |
| `getWorkbookDataRequests` | 1 | workbookId |
| `fulfillDataRequestItem` | 1 | itemId |
| `waiveDataRequestItem` | 1 | itemId |
| `sendDataRequest` | 1 | requestId |
| `getClientDataRequestText` | 1 | requestId |

### Callers Updated

| Caller | Functions called |
|---|---|
| `localcontent-workbook-actions.ts` | All 19 functions, guards provide orgId |
| `pipeline-orchestrator.ts` | `populateWorkbookFromProject`, `detectMissingData` (already has orgId) |
| `ai-auto-review.ts` | `getWorkbookWithLines` (already has orgId) |
| Test file | `exportWorkbookJson` |

### Chain Diagram (entity → org)

```
LcWorkbookLine → LcWorkbook → LocalContentProject.organizationId
LcDataRequest → LcWorkbook → LocalContentProject.organizationId
LcDataRequestItem → LcDataRequest → LcWorkbook → LocalContentProject.organizationId
LcPatternSuggestion.organizationId (direct)
LcMatchReview.organizationId (direct)
```

## Target State (After)

Every public function in these 3 files accepts `organizationId: string`. All Prisma queries that read or write by entity ID add the org scope through the entity's relation chain.

### Scoping Pattern

```typescript
// Read by ID (project → direct orgId field)
const project = await prisma.localContentProject.findFirst({
  where: { id: projectId, organizationId },
});

// Read by ID (workbook → project → org)
const workbook = await prisma.lcWorkbook.findFirst({
  where: { id: workbookId, project: { organizationId } },
});

// Read by ID (line → workbook → project → org)
const line = await prisma.lcWorkbookLine.findFirst({
  where: { id: lineId, workbook: { project: { organizationId } } },
});

// Write operations: verify ownership first via findFirst, then write
```

## Scope
- Files modified: population.ts, services.ts, missing-data.ts, localcontent-workbook-actions.ts, pipeline-orchestrator.ts, ai-auto-review.ts, test file
- No schema changes
- No behavior changes for legitimate users (orgId always matches their own org)
