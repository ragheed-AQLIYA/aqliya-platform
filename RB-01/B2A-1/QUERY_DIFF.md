# B2A-1 QUERY_DIFF — Workbook Actions Layer

## Prisma Queries Added

### Guard: requireProjectAccess

```sql
-- Pattern: verify project belongs to current user's organization
SELECT id FROM "LocalContentProject"
WHERE id = '<projectId>' AND "organizationId" = '<session.organizationId>'
LIMIT 1
```

Used by: createWorkbookAction, populateWorkbookAction, populateWorkbookFromTbAction, listProjectWorkbooksAction

### Guard: requireWorkbookAccess

```sql
-- Pattern: verify workbook belongs to current user's organization via project chain
SELECT lw.id FROM "LcWorkbook" lw
JOIN "LocalContentProject" lcp ON lcp.id = lw."projectId"
WHERE lw.id = '<workbookId>' AND lcp."organizationId" = '<session.organizationId>'
LIMIT 1
```

Used by: getWorkbookAction, recalculateWorkbookAction, deleteWorkbookAction, detectMissingDataAction, generateDataRequestAction, getDataRequestsAction, exportWorkbookAction, markWorkbookExportedAction, computeWorkbookScoreAction

### Guard: requireWorkbookLineAccess

```sql
-- Pattern: verify workbook line belongs to current user's organization
SELECT lwl.id FROM "LcWorkbookLine" lwl
JOIN "LcWorkbook" lw ON lw.id = lwl."workbookId"
JOIN "LocalContentProject" lcp ON lcp.id = lw."projectId"
WHERE lwl.id = '<lineId>' AND lcp."organizationId" = '<session.organizationId>'
LIMIT 1
```

Used by: updateWorkbookLineAction

### Guard: requireDataRequestAccess

```sql
-- Pattern: verify data request belongs to current user's organization
SELECT ldr.id FROM "LcDataRequest" ldr
JOIN "LcWorkbook" lw ON lw.id = ldr."workbookId"
JOIN "LocalContentProject" lcp ON lcp.id = lw."projectId"
WHERE ldr.id = '<requestId>' AND lcp."organizationId" = '<session.organizationId>'
LIMIT 1
```

Used by: sendDataRequestAction, getDataRequestTextAction

### Guard: requireDataRequestItemAccess

```sql
-- Pattern: verify data request item belongs to current user's organization
SELECT ldri.id FROM "LcDataRequestItem" ldri
JOIN "LcDataRequest" ldr ON ldr.id = ldri."requestId"
JOIN "LcWorkbook" lw ON lw.id = ldr."workbookId"
JOIN "LocalContentProject" lcp ON lcp.id = lw."projectId"
WHERE ldri.id = '<itemId>' AND lcp."organizationId" = '<session.organizationId>'
LIMIT 1
```

Used by: fulfillDataRequestItemAction, waiveDataRequestItemAction

## Query Cost Analysis

| Guard | JOIN Depth | Query Type | Estimated Cost |
|-------|-----------|------------|----------------|
| requireProjectAccess | 0 (direct) | findFirst on indexed PK + organizationId | Minimum |
| requireWorkbookAccess | 1 (project) | findFirst on indexed PK + relation | Low |
| requireWorkbookLineAccess | 2 (workbook→project) | findFirst on indexed PK + 2 relations | Low |
| requireDataRequestAccess | 2 (workbook→project) | findFirst on indexed PK + 2 relations | Low |
| requireDataRequestItemAccess | 3 (request→workbook→project) | findFirst on indexed PK + 3 relations | Low |

All queries use the entity's primary key (`id`) which is unique and indexed. The additional JOINs use foreign keys which are also indexed. Estimated overhead per action: **1–5ms database time**.

## Schema Impact
- **No schema changes** — all relationships already exist in Prisma schema
- All guards use existing foreign keys (projectId, workbookId, requestId)
- No new indexes required

## File Structure Impact

### New File
- `src/actions/localcontent-guards.ts` — 5 shared guard functions (89 lines)

### Modified File
- `src/actions/localcontent-workbook-actions.ts` — Added import + 18 guard calls (+15 lines)
