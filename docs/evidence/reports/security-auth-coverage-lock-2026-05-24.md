# Security/Auth Coverage Lock - 2026-05-24

**Date:** 2026-05-24  
**Type:** Security/auth coverage verification  
**Product/System affected:** AQLIYA Platform - proxy, auth, protected routes, download/export APIs  
**Result:** PASS

---

## Summary

- Verified that `src/proxy.ts` is the active Next.js 16 network-boundary auth mechanism. The older `middleware.ts` assumption is stale for this repository.
- Closed one real proxy coverage gap by adding `/published/recommendation` and `/published/recommendation/:path*` to the proxy matcher.
- Verified all protected route prefixes in `docs/source-of-truth/ROUTE_STRATEGY.md` are now covered by proxy.
- Verified the audited sensitive APIs also enforce server-side auth and authorization at the route/helper layer.
- Verified auth is not cookie-existence-only. The code uses signed session/JWT validation through NextAuth helpers.

## Scope

- `src/proxy.ts`
- `src/middleware-security.ts`
- `src/middleware-rate-limit.ts`
- `src/app/api/**/route.ts`
- `src/lib/auth*`
- `src/lib/**/guards/*`
- Supporting helper modules used by the audited download/export routes

## Files Changed

| File | Change |
| --- | --- |
| `src/proxy.ts` | Added `/published/recommendation` proxy matcher coverage |
| `docs/reports/security-auth-coverage-lock-2026-05-24.md` | Created this report |

## Proxy Coverage

### Next.js 16 verification

- Repository reality uses `src/proxy.ts`.
- Next.js 16 documentation in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` and `.../upgrading/version-16.md` confirms `middleware` was renamed to `proxy`.
- Therefore, proxy coverage must be evaluated against `src/proxy.ts`, not against a missing `middleware.ts` file.

### Protected prefixes verified in proxy matcher

All protected prefixes documented in `docs/source-of-truth/ROUTE_STRATEGY.md` are now present in `src/proxy.ts`:

- `/audit`
- `/decisions`
- `/local-content`
- `/assistant`
- `/organizations`
- `/settings`
- `/monitoring`
- `/intelligence`
- `/sunbul`
- `/workflowos`
- `/sales`
- `/published/recommendation`

Current matcher evidence: `src/proxy.ts:116-147`.

## Sensitive API Coverage

| Route | Proxy coverage | Route/helper auth | Authorization scope | Status |
| --- | --- | --- | --- | --- |
| `/api/audit/evidence/[evidenceId]/download` | Yes (`/api/audit/:path*`) | `getAuditActor()` + `assertEngagementAccess()` | Engagement organization | PASS |
| `/api/audit/engagements/[engagementId]/exports/[format]` | Yes (`/api/audit/:path*`) | `exportEngagementAction()` -> `getAuditActor()` + `assertEngagementAccess()` | Engagement organization | PASS |
| `/api/office-ai/download` | Yes (`/api/office-ai/:path*`) | `requireUserContext("VIEWER")` + platform org check | Platform organization | PASS |
| `/api/local-content/projects/[projectId]/reports/[reportId]/download` | Yes (`/api/local-content/:path*`) | `getCurrentUser()` + `assertProjectAccess(projectId, "view")` | Project organization | PASS |
| `/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf` | Yes (`/api/sunbul/:path*`) | `exportSunbulRecord()` -> `requireClientAccess(clientId)` | Sunbul client membership | PASS |
| `/api/sunbul/documents/[documentId]/download` | Yes (`/api/sunbul/:path*`) | `getCurrentUser()` before lookup + `retrieveSunbulDocument()` -> `requireClientAccess(clientId)` | Sunbul client membership | PASS |
| `/api/metrics` | Yes (`/api/metrics`) | `requireUserContext("ADMIN")` | Admin-only | PASS |

### Required download APIs

The specifically requested download APIs are protected as follows:

1. Audit evidence download: `src/app/api/audit/evidence/[evidenceId]/download/route.ts`
2. Office AI download: `src/app/api/office-ai/download/route.ts`
3. Sunbul document download: `src/app/api/sunbul/documents/[documentId]/download/route.ts`

All three are behind proxy coverage and also enforce server-side auth/authorization before file content is returned.

## No Cookie-Only Auth

- `src/proxy.ts` uses `getToken({ req, secret })` from `next-auth/jwt`, which validates the signed JWT/session token.
- `src/lib/auth.ts` uses `auth()` from NextAuth to resolve the current server session.
- Route handlers in scope use `getCurrentUser()`, `requireUserContext()`, `getAuditActor()`, `assertProjectAccess()`, `assertEngagementAccess()`, or `requireClientAccess()`.
- No route in the audited scope authorizes access based only on the presence of a raw cookie value.

## Route-Level Or Helper-Level Auth Acceptability

Accepted pattern for this repository:

- Proxy protection for protected prefixes.
- Server-side route/helper authorization inside the route handler, server action, or server-only module before data is returned.

This is acceptable and recommended here because:

- Next.js proxy docs explicitly warn against relying on proxy coverage alone when routes/actions move.
- The repository's sensitive routes already use server-side authorization helpers tied to tenant or org ownership.
- Defense-in-depth is stronger than proxy-only enforcement.

Examples verified in code:

- `assertEngagementAccess()` for AuditOS
- `assertProjectAccess()` for LocalContentOS
- `requireClientAccess()` for Sunbul
- `requireUserContext()` / `getCurrentUser()` for platform and Office AI routes

## Conflict Resolution Notes

Per `docs/DOCUMENTATION_AUTHORITY.md`, implementation status is determined by code reality.

Conflicts resolved during this lock:

1. Older references that treat missing `middleware.ts` as a live auth failure are stale in this Next.js 16 repository. `src/proxy.ts` is the correct active file convention.
2. Older reports claiming proxy does not cover API routes are stale relative to current code reality. `src/proxy.ts` now includes explicit API matchers for audit, office-ai, local-content, sunbul, and metrics.
3. `docs/source-of-truth/ROUTE_STRATEGY.md` documents `/published/recommendation/*` as protected. Code reality previously lagged that documentation at the proxy layer. This report and the `src/proxy.ts` patch bring runtime behavior back into alignment.

## Verdict

**PASS: protected routes + APIs covered**

Reason:

- All documented protected route prefixes are now covered by proxy.
- All audited sensitive APIs are covered by proxy and by server-side auth/authorization.
- No cookie-only auth pattern was found in the audited scope.
- Helper-level auth remains acceptable because it is enforced server-side and aligned with Next.js guidance.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| File inspection | Pass | Read proxy, auth, guards, and audited route handlers |
| Matcher verification | Pass | Confirmed protected prefixes and API matchers in `src/proxy.ts` |
| Download API auth verification | Pass | Confirmed auth + authorization for audit, office-ai, and sunbul downloads |
| Build | Not run | Explicitly skipped per instruction |
| Prisma | Not run | Explicitly skipped per instruction |

## Residual Notes

- This lock verifies auth coverage, not full security hardening.
- Older reports remain historically useful but should not override current code reality for proxy behavior.
