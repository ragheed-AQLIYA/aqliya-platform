# Changes

﻿# SalesOS v0.3 — PR-7F fixes (Parallel F / L6)

**Date:** 2026-06-01  
**Path:** `C:\Users\PC\Documents\Aqliya`  
**Validation:** light validated (targeted Jest only)

## Changes

| Item | Action | Files |
|------|--------|-------|
| TS1127 encoding | Re-encoded UTF-16 → UTF-8 (no BOM) | `src/components/sales/account-interactions-panel.tsx` |
| TS1127 (test) | Re-encoded UTF-16 → UTF-8 for Jest compile | `src/lib/sales/__tests__/sales-rbac.test.ts` |
| VIEWER dashboard CTA | Hide «صفقة جديدة» when `canCreate` is false; pass RBAC from server | `src/app/sales/page.tsx`, `src/app/sales/sales-dashboard-client.tsx` |

## RBAC behavior

- `page.tsx` loads `getCurrentUser()` and `getSalesPermissionsForRole(user.role)`.
- `SalesDashboardClient` receives `canCreate`; `ContextualActions` omits `new-deal` for VIEWER; `SalesNavLinks` receives `canCreate`.

## Jest (approved run)

```text
npx jest src/lib/sales/__tests__/sales-services.test.ts \
  src/lib/sales/__tests__/sales-interactions.test.ts \
  src/lib/sales/__tests__/sales-rbac.test.ts --no-coverage
```

**Result:** 3 suites passed, **42** tests passed, 0 failed.

## Out of scope (per instruction)

- No new features.
- No edits to signals / outreach / governance / reporting modules (logic unchanged).

## Known limitations

- Full `npm test` / build not run (AQLIYA low-load).
- Browser pass not validated.
