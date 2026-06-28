# B2A-1 AFTER — Workbook Actions Layer

## State After

### Guard Infrastructure
- **New shared guard module:** `src/actions/localcontent-guards.ts`
- **5 guard functions** extracted for LocalContentOS entity types:
  - `requireProjectAccess(projectId)` — verifies project → org ownership
  - `requireWorkbookAccess(workbookId)` — verifies workbook → project → org ownership
  - `requireWorkbookLineAccess(lineId)` — verifies line → workbook → project → org ownership
  - `requireDataRequestAccess(requestId)` — verifies request → workbook → project → org ownership
  - `requireDataRequestItemAccess(itemId)` — verifies item → request → workbook → project → org ownership
- All guards chain through `requireUserContext()` + Prisma `findFirst` with org filter
- All guards throw `"Access denied: ..."` which is caught by `safe()` → `{ ok: false, error }`

### Protection Coverage

| Pattern | Guard | Actions Protected |
|---------|-------|-------------------|
| A — projectId | `requireProjectAccess` | createWorkbookAction, populateWorkbookAction, populateWorkbookFromTbAction, listProjectWorkbooksAction (4) |
| B — workbookId | `requireWorkbookAccess` | getWorkbookAction, recalculateWorkbookAction, deleteWorkbookAction, detectMissingDataAction, generateDataRequestAction, getDataRequestsAction, exportWorkbookAction, markWorkbookExportedAction, computeWorkbookScoreAction (9) |
| C — lineId | `requireWorkbookLineAccess` | updateWorkbookLineAction (1) |
| D — itemId | `requireDataRequestItemAccess` | fulfillDataRequestItemAction, waiveDataRequestItemAction (2) |
| E — requestId | `requireDataRequestAccess` | sendDataRequestAction, getDataRequestTextAction (2) |
| — Already safe | `requireUserContext` inline | listOrganizationWorkbooksAction, getWorkbookDashboardAction (2) |

### Exploitation Paths Blocked

| ID | Action | Guard | Blocked |
|----|--------|-------|---------|
| E1 | `createWorkbookAction` | requireProjectAccess | ✅ |
| E2 | `populateWorkbookAction` | requireProjectAccess | ✅ |
| E3 | `populateWorkbookFromTbAction` | requireProjectAccess | ✅ |
| E4 | `getWorkbookAction` | requireWorkbookAccess | ✅ |
| E5 | `listProjectWorkbooksAction` | requireProjectAccess | ✅ |
| E6 | `updateWorkbookLineAction` | requireWorkbookLineAccess | ✅ |
| E7 | `recalculateWorkbookAction` | requireWorkbookAccess | ✅ |
| E8 | `deleteWorkbookAction` | requireWorkbookAccess | ✅ |
| E9 | `detectMissingDataAction` | requireWorkbookAccess | ✅ |
| E10 | `generateDataRequestAction` | requireWorkbookAccess | ✅ |
| E11 | `getDataRequestsAction` | requireWorkbookAccess | ✅ |
| E12 | `fulfillDataRequestItemAction` | requireDataRequestItemAccess | ✅ |
| — | `waiveDataRequestItemAction` | requireDataRequestItemAccess | ✅ |
| — | `sendDataRequestAction` | requireDataRequestAccess | ✅ |
| — | `getDataRequestTextAction` | requireDataRequestAccess | ✅ |
| — | `exportWorkbookAction` | requireWorkbookAccess | ✅ |
| — | `markWorkbookExportedAction` | requireWorkbookAccess | ✅ |
| — | `computeWorkbookScoreAction` | requireWorkbookAccess | ✅ |

### Server Action Guard Matrix Updated
- `createWorkbookAction` — Tenant isolation: ✅ (withProjectAccess → requireProjectAccess)
- `populateWorkbookAction` — Tenant isolation: ✅
- `getWorkbookAction` — Tenant isolation: ✅
- All remaining workbook actions — Tenant isolation: ✅

## Metrics (after)

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Exploit paths (this wave) | 18 | 0 | -18 ✅ |
| Actions protected in file | 2/20 (10%) | 20/20 (100%) | +18 ✅ |
| Guard functions extracted | 0 | 5 | +5 ✅ |
| Duplicated auth blocks | 2 inline patterns | 0 (5 shared guards) | -2 ✅ |

## Traceability
- **BEFORE → AFTER gap closed:** 18 exploitation paths blocked
- **Files changed:** `src/actions/localcontent-workbook-actions.ts`, `src/actions/localcontent-guards.ts` (new)
- **Regression guard:** `node RB-01/B2A-1/guard.mjs` — automates E1–E12 scenario verification
- **Dependency created:** B2A-2 (Review/V3 Actions) can import guards from `localcontent-guards.ts`
