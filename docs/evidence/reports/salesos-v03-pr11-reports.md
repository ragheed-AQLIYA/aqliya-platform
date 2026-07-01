# Summary

﻿# SalesOS v0.3 PR-11 — Founder Reports Stub

**Date:** 2026-06-01  
**Status:** DONE  
**Validation class:** not validated (no build/browser run in this pass)  
**Route:** `/sales/reports`  
**Slice:** `salesos_p2_reports` (read-only aggregation — no schema change)

---

## Summary

- Added `src/lib/sales/reporting.ts` — org-scoped founder snapshot aggregating pipeline health, ICP bands, due next actions, pending outreach reviews (graceful zero / metadata fallback), and evidence link count.
- Added `/sales/reports` server page — Arabic-first, read-only founder dashboard.
- Wired navigation from `SalesNavLinks` and dashboard `ContextualActions`.
- Added `getSalesFounderReportAction` with `sales.reports.viewed` audit event.

---

## Aggregates

| Metric | Source |
|--------|--------|
| Pipeline health (open / won / lost) | `partitionPipelineDeals` + Prisma deal statuses |
| ICP bands | `readAccountIcpScore` on `SalesAccount.metadata.icpScore` |
| Due next actions (7-day horizon) | `buildDueNextActions` on open deals |
| Pending outreach reviews | Dynamic `./outreach` import if present; else metadata `outreachDrafts[]` scan; else 0 |
| Evidence links per org | `prisma.salesEvidenceLink.count({ organizationId })` |

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/sales/reporting.ts` | **NEW** — aggregation service |
| `src/app/sales/reports/page.tsx` | **NEW** — founder reports page |
| `src/actions/sales-actions.ts` | `getSalesFounderReportAction` |
| `src/lib/sales/audit-events.ts` | `REPORTS_VIEWED` action constant |
| `src/components/sales/sales-shell.tsx` | Nav link «التقارير» |
| `src/app/sales/sales-dashboard-client.tsx` | Contextual action to reports |

---

## Governance Check

| Gate | Status |
|------|--------|
| RBAC | `salesos:read` required |
| Tenant isolation | All queries scoped by `organizationId` |
| Evidence | Count only — no export |
| Audit trail | `sales.reports.viewed` on page load |
| Review/approval | N/A (read-only) |
| Auto-send | None |

---

## Known Limitations

- No PDF/CSV export.
- Outreach count depends on PR-9 module or deal metadata shape.
- No time-series or historical comparison.
- Browser smoke not run in this pass.

---

## Next Recommended Step

PR-12+: export gate with human approval, or wire outreach queue deep-link from reports KPI.

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pending |
| `npm run lint` | Not run (low-load) |
| `npm run build` | Not run (low-load) |
| `npm test` | Not run (low-load) |
