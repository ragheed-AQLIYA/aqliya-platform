# Governance Engine — AuditOS 2.0 Phase 10

**Status:** Implemented (feature-flagged)  
**UI:** Approval tab checklist (extended)  
**Flag:** `audit.approval-gates` / `FF_AUDIT_APPROVAL_GATES=true`

## Purpose

Extend `getApprovalStatus` with **factory pipeline gates** that block engagement approval and export until governed artifacts are human-reviewed.

Trust principle: **AI assists. Humans decide. Evidence governs.**

## Module Layout

| File | Role |
|------|------|
| `types.ts` | Gate check types, `ApprovalGatesBlockedError` |
| `approval-gates.ts` | Pure gate evaluators |
| `governance-engine.ts` | Load snapshot, append gates, assert pass |
| `index.ts` | Public exports + flag |

## Factory Gates (v1)

| Gate ID | Label | Blocks when |
|---------|-------|-------------|
| `factory-disclosure-approved` | Rule-linked disclosure notes approved | Notes with `RULE_CITATION` not `reviewed`/`approved` |
| `factory-intelligence-reviewed` | Intelligence-enriched notes reviewed | Enriched notes still `draft`/`needs_info` |
| `factory-ai-drafts-reviewed` | AI-assisted drafts reviewed | `aiDrafted` notes not reviewed |
| `factory-validation-clean` | No critical/high validation issues | Open critical/high issues on latest run |
| `factory-fs-approved` | Financial statements approved | Any statement status ≠ `approved` |

## Integration

### `getApprovalStatus` (`db/index.ts`)

When flag on, appends `[Factory] …` checklist items and blocking issues.

### `createApprovalRecord` (`services.ts`)

When flag on and action is `approved`:

1. `assertFactoryApprovalGatesPass()` — throws if blocked
2. `promoteFinancialStatementsOnApproval()` — sets all FS to `approved`

### Export (`audit-export-actions.ts`)

When flag on, `assertFactoryApprovalGatesPass()` before generating PDF/XLSX.

## Local Testing

```env
FF_AUDIT_APPROVAL_GATES=true
```

Flow: complete factory pipeline → review/approve notes → Approval tab shows green checklist → approve engagement → export

## Phase 12 — Complete

See [`FACTORY_PILOT_READINESS.md`](./FACTORY_PILOT_READINESS.md) §2–3 for factory-map route and snapshot audit events in pilot profiles B/C.

## Known Limitations

- Reconciliation-specific gates deferred until reconciliation engine present in branch
- FS promotion sets all statements to `approved` on engagement approval (no partial)
- Flag off by default — legacy approval path unchanged
