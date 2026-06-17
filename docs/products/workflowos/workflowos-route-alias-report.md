> **Historical report (2026-05-19).** Superseded by canonical WorkflowOS identity: `/workflowos/*` is the governed workspace; `/sunbul/*` is a legacy redirect alias. See `docs/products/workflowos/README.md` and `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`.

# WorkflowOS Route Alias Report

**Date:** 2026-05-19
**Status:** Historical — documents the initial route-alias phase before Sunbul became redirect-only

---

## Route Aliases Added

| Route                                               | Component                         | Status                                      |
| --------------------------------------------------- | --------------------------------- | ------------------------------------------- |
| `/workflowos`                                       | `SunbulDashboard`                 | ✅ Active — alias over Sunbul dashboard     |
| `/workflowos/admin`                                 | `SunbulAdminPage` with auth guard | ✅ Active — alias over Sunbul admin route   |
| `/workflowos/clients/[clientId]/records/[recordId]` | `SunbulRecordDetail`              | ✅ Active — alias over Sunbul record detail |
| `/workflowos/loading`                               | Shared loading component          | ✅ Active                                   |

## Legacy Routes Preserved

| Route                                           | Status         | Notes                    |
| ----------------------------------------------- | -------------- | ------------------------ |
| `/sunbul`                                       | ✅ Still works | Legacy — unchanged       |
| `/sunbul/admin`                                 | ✅ Still works | Legacy — unchanged       |
| `/sunbul/clients/[clientId]/records/[recordId]` | ✅ Still works | Legacy — unchanged       |
| `/sunbul/layout.tsx`                            | ✅ Still works | Legacy layout unchanged  |
| `/sunbul/loading.tsx`                           | ✅ Still works | Legacy loading unchanged |

## Navigation Changes

| Component                        | Old Link                    | New Link                                         |
| -------------------------------- | --------------------------- | ------------------------------------------------ |
| Product module switcher          | `/sunbul`                   | `/workflowos`                                    |
| Sidebar nav (sunbulNav)          | `/sunbul` → `/sunbul/admin` | `/workflowos` → `/workflowos/admin`              |
| Org workspace "فتح WorkflowOS"   | `/sunbul`                   | `/workflowos`                                    |
| Org workspace "إدارة WorkflowOS" | `/sunbul/admin`             | `/workflowos/admin`                              |
| Header breadcrumbs               | —                           | Added WorkflowOS support for `/workflowos` paths |

## Implementation Detail

All `/workflowos/*` route pages import and reuse the same components as `/sunbul/*`:

- `/workflowos/page.tsx` → `SunbulDashboard`
- `/workflowos/admin/page.tsx` → `SunbulAdminPage` (with auth check)
- `/workflowos/clients/[clientId]/records/[recordId]/page.tsx` → `SunbulRecordDetail`
- `/workflowos/layout.tsx` → `PlatformSidebar` + `PlatformHeader`
- `/workflowos/loading.tsx` → shared loader

No business logic was changed. No Prisma models were renamed. No tests were modified.

## Current Classification

- `workflowos` is visible and implemented in code.
- It currently reuses Sunbul components, actions, and Prisma models.
- It should be documented as a duplicate route family / branded alias over Sunbul patterns until a separate domain model or explicit product decision exists.

## Remaining Technical Debt

| Debt                                                                                         | Priority | Plan                                                          |
| -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| Internal code symbols still use "Sunbul" prefix (`SunbulDashboard`, `SunbulAdminPage`, etc.) | Low      | Deferred — rename in dedicated refactor phase                 |
| Prisma models still use `Sunbul*` prefix (`SunbulClient`, `SunbulRecord`, etc.)              | Low      | Deferred — requires migration                                 |
| Server actions still in `sunbul-actions.ts`                                                  | Low      | Deferred — rename in dedicated refactor phase                 |
| `/workflowos/layout.tsx` is a duplicate of `/sunbul/layout.tsx`                              | Low      | Acceptable — both need to exist until legacy route is removed |

## Validation Results

See validation run below.
