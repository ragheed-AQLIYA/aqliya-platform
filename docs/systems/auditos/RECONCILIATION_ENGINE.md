# Reconciliation Engine — AuditOS 2.0 Phase 4

**Status:** Implemented (feature-flagged, default off)  
**Flags:**  
- `audit.reconciliation` / `FF_AUDIT_RECONCILIATION=true`  
- `audit.reconciliation-gates` / `FF_AUDIT_RECONCILIATION_GATES=true` (requires reconciliation)

## Purpose

Factory **tie-out** between pipeline stages:

```
TB ↔ Lead Schedules ↔ Financial Statements
Balance Sheet: A = L + E
Income Statement → Equity (current year profit)
```

## Checks (RC-001..006)

| Code | Type | Rule |
| ---- | ---- | ---- |
| RC-001 | `tb_ls_tie` | Confirmed mapping balances vs lead schedule **lines** (by mapping id) |
| RC-002 | `ls_fs_tie` | Lead schedule line refs vs linked FS line amounts (**per mapping**) |
| RC-003 | `balance_sheet_equation` | TOTAL ASSETS = TOTAL L+E |
| RC-004 | `is_equity_flow` | IS profit = equity current year profit |
| RC-005 | `reconciliation_coverage` | Every confirmed mapping in a lead schedule line |
| RC-006 | `cash_flow_tie` | Cash at end vs TB cash (requires FS v2) |

## Module

| File | Role |
| ---- | ---- |
| `types.ts` | Check codes + result types |
| `reconciliation-checks.ts` | Pure check functions |
| `reconciliation-engine.ts` | Load context, run, validation/approval append |
| `reconciliation-graph-sync.ts` | `RECONCILIATION_CHECK` nodes |
| `index.ts` | Flags + pipeline hook |

## Integration

| Surface | When |
| ------- | ---- |
| Validation tab | `ReconciliationPanel` + issues on `runValidation` |
| FS rebuild hook | `maybeRunReconciliationAfterPipeline` |
| Approval | `appendReconciliationApprovalGates` when gates flag on |
| Reporting graph | `RECONCILES` edges per check |

## Local Testing

```env
FF_AUDIT_RECONCILIATION=true
FF_AUDIT_LEAD_SCHEDULE_AUTO=true
FF_AUDIT_REPORTING_GRAPH=true
```

Flow: confirm mappings → lead schedules → run validation → see RC checks

## Phase 5 Handoff

FS Engine v2 adds cash flow — RC-006 active when `audit.fs-v2` is on.

## Limitations

- Tolerance-based (0.01 SAR) not materiality-aware
- RC-002 compares **non-total** FS lines with exactly one `linkedAccountMapping`; FS v2 must emit per-mapping detail lines for Revenue, Cost of Sales, and Operating Expenses (section totals alone are insufficient)
- RC-006 requires cash flow statement from FS v2

## Seed Validation (2026-06-13)

On `eng-gulf-2025` with factory flags on: **RC-001..006 all pass**, `failedCount: 0`.  
Diagnostic script: `scripts/audit/recon-rc002-detail.mjs`
