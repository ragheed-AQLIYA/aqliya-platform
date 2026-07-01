# FS Engine v2 — AuditOS 2.0 Phase 5

**Status:** Implemented (feature-flagged, default off)  
**Flag:** `audit.fs-v2` / `FF_AUDIT_FS_V2=true`

## Purpose

Upgrade the financial statement factory from **3 statements** to **4**:

| Statement | Type |
| --------- | ---- |
| Statement of Profit or Loss | `income_statement` |
| Statement of Financial Position | `balance_sheet` |
| Statement of Changes in Equity | `equity` |
| Statement of Cash Flows | `cash_flow` |

Adds **status lifecycle**: `draft` → `reviewed` → `approved`.

## Module

| File | Role |
| ---- | ---- |
| `types.ts` | Status + rebuild summary types |
| `cash-flow-builder.ts` | Simplified indirect cash flow |
| `fs-rebuild-service.ts` | 4-statement rebuild + audit event |
| `status-lifecycle.ts` | Transitions + bulk review |
| `index.ts` | Flag + `maybeRebuildFinancialStatements` hook |

Shared builder extracted to `src/lib/audit/db/statement-builder.ts`.

**RC-002 tie-out:** Income statement emits per-mapping detail lines for Revenue, Cost of Sales, and Operating Expenses (each with `linkedAccountMappings: [mappingId]`). Section totals alone do not satisfy RC-002.

## Integration

| Surface | Behavior |
| ------- | -------- |
| Mapping confirm / FS rebuild | `maybeRebuildFinancialStatements` when flag on |
| Statements UI | Rebuild v2, mark reviewed, per-statement review |
| Engagement approval | Existing `promoteFinancialStatementsOnApproval` |
| Reconciliation | RC-006 cash flow tie when flag on |

## Cash Flow Method (Pilot)

Simplified **indirect method**:

- Net profit from IS
- Add depreciation (accumulated depreciation mappings)
- Operating / investing / financing sections (investing & financing = 0 in v2 pilot)
- Cash at end = TB cash/bank mapping totals (ties RC-006)

## Local Testing

```env
FF_AUDIT_FS_V2=true
FF_AUDIT_RECONCILIATION=true
```

Flow: confirm mappings → 4 statements appear → cash flow tab → validation RC-006

## Phase 6 — Complete

IFRS rules runtime evaluates IAS 7 cash flow topics when FS v2 generates `cash_flow`.

## Limitations

- No prior-period cash at beginning (defaults 0)
- Investing/financing not derived from mappings
- Working capital changes not modeled
- Rebuild preserves `reviewed`/`approved` status (does not auto-reset to draft)
