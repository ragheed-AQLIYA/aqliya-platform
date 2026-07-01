# SalesOS v0.3 PR-8 - Account Signals Stub (Parallel A)

**Workstream:** Parallel A - `salesos_p8_signals`  
**Date:** 2026-06-01  
**Validation:** light validated (targeted Jest in `sales-signals.test.ts`)

## Goal

Phase 2 metadata-first sales signals stub toward L6: org-scoped list, account timeline, create with validation and audit - no full CRM, no Prisma migration.

## Storage

`SalesAccount.metadata.signals[]` (JSON array, max 50 per account).

## Files

- `src/lib/sales/signals.ts`
- `src/lib/sales/validation.ts` (validateCreateSalesSignalInput)
- `src/lib/sales/audit-events.ts` (sales.signal.created)
- `src/actions/sales-actions.ts`
- `src/app/sales/signals/page.tsx`
- `src/components/sales/account-signal-timeline.tsx`
- `src/app/sales/accounts/[id]/page.tsx`
- `scripts/seed-sales-demo.ts`
- `src/lib/sales/__tests__/sales-signals.test.ts`

## Arabic one-liner

**إشارات مبيعات stub في metadata الحساب - قائمة org-scoped وجدول زمني بدون CRM أو migration.**