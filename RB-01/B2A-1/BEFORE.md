# B2A-1 BEFORE — Workbook Actions Layer

## Gap Reference
- **Program:** P0-B2A (Tenant Remediation)
- **Wave:** B2A-1 (Workbook Actions Layer)
- **RB-01 Gap:** 21 cross-tenant exploitation paths
- **Wave Scope:** 18 unscoped workbook actions → E1–E12 (12) + 6 additional (waive, send, getText, export, markExported, computeScore)

## State Before

### Guard Infrastructure
- No shared guard module existed for LocalContentOS entity access
- 2 actions had `requireUserContext()` (organizationId from session): `listOrganizationWorkbooksAction`, `getWorkbookDashboardAction`
- 18 actions had ZERO tenant isolation — accept IDs from client without verification
- `safe()` error wrapper existed but caught all errors including access denials as generic errors

### Exploitation Paths (E1–E12 + 6 more)

| ID | Action | Accepted ID | Risk |
|----|--------|-------------|------|
| E1 | `createWorkbookAction` | projectId | Create workbooks in any org's project |
| E2 | `populateWorkbookAction` | projectId | Populate workbooks in any org's project |
| E3 | `populateWorkbookFromTbAction` | projectId | Populate with TB lines in any org's project |
| E4 | `getWorkbookAction` | workbookId | Read any org's workbook |
| E5 | `listProjectWorkbooksAction` | projectId | List any org's project workbooks |
| E6 | `updateWorkbookLineAction` | lineId | Update any org's workbook line |
| E7 | `recalculateWorkbookAction` | workbookId | Recalculate any org's workbook |
| E8 | `deleteWorkbookAction` | workbookId | Delete any org's workbook |
| E9 | `detectMissingDataAction` | workbookId | Detect missing data in any org's workbook |
| E10 | `generateDataRequestAction` | workbookId | Generate data requests in any org's workbook |
| E11 | `getDataRequestsAction` | workbookId | Read data requests of any org's workbook |
| E12 | `fulfillDataRequestItemAction` | itemId | Fulfill items in any org's workbook |
| — | `waiveDataRequestItemAction` | itemId | Waive items in any org's workbook |
| — | `sendDataRequestAction` | requestId | Send requests in any org's workbook |
| — | `getDataRequestTextAction` | requestId | Read request text from any org's workbook |
| — | `exportWorkbookAction` | workbookId | Export any org's workbook |
| — | `markWorkbookExportedAction` | workbookId | Mark any org's workbook as exported |
| — | `computeWorkbookScoreAction` | workbookId | Compute score on any org's workbook |

### Code Structure
- **18 vulnerable actions** in `src/actions/localcontent-workbook-actions.ts`
- **0 guard functions** specific to LocalContentOS entity types
- Pattern: `safe(() => serviceFn(clientProvidedId))` — no ownership check before operation

### Duplicated Auth Blocks (baseline)
- 2 safe actions use inline `requireUserContext()` pattern (no shared guard)
- 18 vulnerable actions have zero auth
- Total: 2 auth patterns, both inline, no reuse

## Metrics (before)

| Metric | Value |
|--------|-------|
| Exploit paths remaining | 21 (total) / 18 (this wave) |
| Actions protected | 2/20 (10%) |
| Actions vulnerable | 18/20 (90%) |
| Guard functions extracted | 0 |
| Duplicated auth blocks | 2 inline patterns |

## Traceability
- **Gap:** RB-01 (21 cross-tenant exploitation paths)
- **→ Wave:** B2A-1 (Workbook actions layer — 18 of 21 paths)
- **→ Files:** `src/actions/localcontent-workbook-actions.ts`, `src/actions/localcontent-guards.ts` (new)
- **→ Guard:** `RB-01/B2A-1/guard.mjs`
- **→ Metric:** Exploit paths blocked = 18
