# Security Reports Reconciliation - 2026-05-24

**Date:** 2026-05-24  
**Type:** Documentation reconciliation  
**Scope:** `docs/reports/**` security/auth reporting only  
**Primary current source of truth:** `docs/reports/security-auth-coverage-lock-2026-05-24.md`

---

## Summary

- Reconciled stale security/auth reporting inside `docs/reports/**` against the post-lock code reality documented on 2026-05-24.
- Added top-of-file supersession notes to stale reports instead of deleting historical evidence.
- Established `docs/reports/security-auth-coverage-lock-2026-05-24.md` as the current report-level security/auth source of truth.
- Confirmed this reconciliation is documentation-only and does not change auth or proxy implementation.

## Current Source Of Truth

Within `docs/reports/**`, use these in this order:

1. `docs/reports/security-auth-coverage-lock-2026-05-24.md`
2. `docs/reports/security-reports-reconciliation-2026-05-24.md`

Supporting authority outside `docs/reports/**` remains:

- `docs/DOCUMENTATION_AUTHORITY.md`
- `docs/source-of-truth/ROUTE_STRATEGY.md`

## Stale Reports Reconciled

| Report | Stale claim category | Stale claim | Current resolved status |
| --- | --- | --- | --- |
| `docs/reports/auth-middleware-hardening-v0.1.md` | Proxy/API coverage | Report says `/api/*` is excluded from proxy coverage and lists `/published/recommendation/*` as public | Current code reality is that `src/proxy.ts` covers audited API prefixes and `/published/recommendation/*`; route/helper auth also remains in place |
| `docs/reports/security-perimeter-verification-report.md` | Proxy/API coverage | Report says proxy JWT checks do not run for API requests and recommends adding API matchers later | Current code reality is that audited API matchers already exist in `src/proxy.ts`; report preserved as prior evidence only |
| `docs/reports/aqliya-repository-discovery-audit.md` | Sensitive API exposure | Discovery rows describe sensitive download/metrics routes as under-protected or lacking visible auth | Current code reality is PASS for protected routes + audited APIs per 2026-05-24 lock report |
| `docs/reports/aqliya-full-site-map-live-demo.md` | Protected route status | Report classifies `/published/recommendation/[decisionId]` and `/published/recommendation/*` as public | Current code reality is protected route coverage for `/published/recommendation/*` plus authenticated same-org access at the data layer |
| `docs/reports/documentation-truth-controller-report.md` | Documentation conclusion drift | Report conclusion assumes the older API proxy-exclusion state is current | Conclusion is now historical; current coverage is defined by the 2026-05-24 lock report |
| `docs/reports/documentation-truth-cleanup-report.md` | Documentation conclusion drift | Cleanup report describes `/api/*` proxy exclusion as the current documentation truth | That description is now historical after the auth coverage lock and matcher expansion |
| `docs/reports/project-root-inventory.md` | Historical architecture snapshot | Inventory treats `middleware.ts` as an active required App Router boundary | Current repository reality uses `src/proxy.ts` as the active network-boundary file |
| `docs/reports/repository-structure-audit/file-inventory.md` | Historical architecture snapshot | File inventory marks `middleware.ts` as active runtime-critical source | Current repository reality uses `src/proxy.ts` instead |
| `docs/reports/repository-structure-audit/full-folder-tree.md` | Historical architecture snapshot | Folder tree lists root `middleware.ts` as the active routing boundary | That tree is historical; current boundary is `src/proxy.ts` |
| `docs/reports/repository-structure-audit/delete-archive-candidates.md` | Historical architecture snapshot | Report says `middleware.ts` must not be deleted because routing depends on it | Current active boundary is `src/proxy.ts`; the old statement is historical only |
| `docs/reports/localcontentos-v0.1-route-404-debug-report.md` | Historical debug architecture | Debug narrative still references `middleware.ts` / `src/middleware.ts` as the active boundary in parts of the report | Debug history preserved, but current active boundary is `src/proxy.ts` |

## Supersession Notes Added

Supersession notes were added to the top of these stale reports:

- `docs/reports/auth-middleware-hardening-v0.1.md`
- `docs/reports/security-perimeter-verification-report.md`
- `docs/reports/aqliya-repository-discovery-audit.md`
- `docs/reports/aqliya-full-site-map-live-demo.md`
- `docs/reports/documentation-truth-controller-report.md`
- `docs/reports/documentation-truth-cleanup-report.md`
- `docs/reports/project-root-inventory.md`
- `docs/reports/repository-structure-audit/file-inventory.md`
- `docs/reports/repository-structure-audit/full-folder-tree.md`
- `docs/reports/repository-structure-audit/delete-archive-candidates.md`
- `docs/reports/localcontentos-v0.1-route-404-debug-report.md`

## Resolved Current Status

Per `docs/reports/security-auth-coverage-lock-2026-05-24.md`, the current report-level security/auth position is:

- `src/proxy.ts` is the active Next.js 16 network-boundary auth mechanism.
- Missing `middleware.ts` is not a live blocker in this repository's current architecture.
- Protected route prefixes are covered, including `/published/recommendation/*`.
- Audited sensitive APIs are covered by proxy and by server-side route/helper authorization.
- The audited auth model is not cookie-existence-only.
- Route-level or helper-level server authorization remains acceptable and documented.

## Remaining Security Scope Not Covered By This Reconciliation

This reconciliation does not re-audit or newly verify:

- Rate-limit effectiveness as an operational hardening control
- Callback URL validation and redirect-safety details
- Broader CSP/header sufficiency beyond the already documented auth-coverage lock
- Non-auth security topics outside the audited routes
- Runtime validation via build, lint, tests, or live HTTP replay

This file reconciles documentation state only.

## Files Inspected

- `docs/reports/security-auth-coverage-lock-2026-05-24.md`
- `docs/reports/auth-middleware-hardening-v0.1.md`
- `docs/reports/security-perimeter-verification-report.md`
- `docs/reports/aqliya-repository-discovery-audit.md`
- `docs/reports/aqliya-full-site-map-live-demo.md`
- `docs/reports/documentation-truth-controller-report.md`
- `docs/reports/documentation-truth-cleanup-report.md`
- `docs/reports/project-root-inventory.md`
- `docs/reports/repository-structure-audit/file-inventory.md`
- `docs/reports/repository-structure-audit/full-folder-tree.md`
- `docs/reports/repository-structure-audit/delete-archive-candidates.md`
- `docs/reports/localcontentos-v0.1-route-404-debug-report.md`

## Files Changed

- `docs/reports/auth-middleware-hardening-v0.1.md`
- `docs/reports/security-perimeter-verification-report.md`
- `docs/reports/aqliya-repository-discovery-audit.md`
- `docs/reports/aqliya-full-site-map-live-demo.md`
- `docs/reports/documentation-truth-controller-report.md`
- `docs/reports/documentation-truth-cleanup-report.md`
- `docs/reports/project-root-inventory.md`
- `docs/reports/repository-structure-audit/file-inventory.md`
- `docs/reports/repository-structure-audit/full-folder-tree.md`
- `docs/reports/repository-structure-audit/delete-archive-candidates.md`
- `docs/reports/localcontentos-v0.1-route-404-debug-report.md`
- `docs/reports/security-reports-reconciliation-2026-05-24.md`

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Targeted grep in `docs/reports/**` | Pass | Used to identify stale security/auth claims |
| Targeted read of affected reports | Pass | Used to verify stale claims and confirm supersession notes |
| Build | Not run | Explicitly skipped per instruction |
| Lint | Not run | Explicitly skipped per instruction |
| Tests | Not run | Explicitly skipped per instruction |

## RAM Risk

Low. Documentation-only work using targeted `grep` and `read`; no build, lint, tests, or database activity.
