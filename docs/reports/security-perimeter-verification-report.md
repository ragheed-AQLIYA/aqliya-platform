# Security Perimeter Verification Report

**Date:** 2026-05-23
**Type:** Security perimeter verification
**Product/System affected:** AQLIYA Platform — proxy, auth, API routes, download/export endpoints

---

## Summary

- Verified that `src/proxy.ts` is the correct Next.js 16 middleware mechanism (no `middleware.ts` exists).
- Confirmed JWT-based protection via `getToken()` from `next-auth/jwt` — not cookie-existence-only.
- Confirmed security headers applied to all responses via `setSecurityHeaders()`.
- Verified all 7 sensitive API endpoints have route-level authentication and tenant-isolation checks.
- Identified one defense-in-depth gap: the proxy `config.matcher` does not include API routes, so the proxy's JWT check never runs for API requests. All endpoints still enforce auth at the route level.
- Identified dead code: `isApiPath()` and API-401 logic in `proxy.ts` never executes (API routes are not in the matcher).
- Identified `middleware-rate-limit.ts` is defined but never imported or called.
- **No fixes applied** — none of the findings are critical vulnerabilities (route-level auth is present everywhere), and fixes would either break public endpoints or change product behavior.

## Files Inspected

| File                                                                                  | Status                                                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/proxy.ts`                                                                        | Inspected — JWT-based auth, public route handling, dead API-401 code                 |
| `src/middleware-security.ts`                                                          | Inspected — comprehensive security headers applied to all responses                  |
| `src/middleware-rate-limit.ts`                                                        | Inspected — defined but never imported                                               |
| `src/lib/auth.ts`                                                                     | Inspected — JWT session, role checks, org access                                     |
| `src/lib/auth-config.ts`                                                              | Inspected — NextAuth v5 config with JWT strategy                                     |
| `src/lib/auth-next.ts`                                                                | Inspected — thin re-export of `auth` and `handlers`                                  |
| `src/lib/platform/guards/workspace-guard.ts`                                          | Inspected — workspace context guard, report-only mode                                |
| `src/lib/platform/guards/platform-org-guard.ts`                                       | Inspected — platform org guard, report-only mode                                     |
| `src/app/api/audit/evidence/[evidenceId]/download/route.ts`                           | Inspected — `getAuditActor` + `assertEngagementAccess` ✅                            |
| `src/app/api/audit/engagements/[engagementId]/exports/[format]/route.ts`              | Inspected — auth in `exportEngagementAction` ✅                                      |
| `src/app/api/office-ai/download/route.ts`                                             | Inspected — `requireUserContext("VIEWER")` + platform org check ✅                   |
| `src/app/api/metrics/route.ts`                                                        | Inspected — `requireUserContext("ADMIN")` ✅                                         |
| `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts` | Inspected — `getCurrentUser()` + `assertProjectAccess()` ✅                          |
| `src/app/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf/route.ts`        | Inspected — auth in `exportSunbulRecord` (`requireClientAccess`) ✅                  |
| `src/app/api/sunbul/documents/[documentId]/download/route.ts`                         | Inspected — `getCurrentUser()` + `retrieveSunbulDocument` (`requireClientAccess`) ✅ |
| `src/app/api/custom-product-submit/route.ts`                                          | Inspected — public POST form, no auth (correct)                                      |
| `src/app/api/auth/[...nextauth]/route.ts`                                             | Inspected — NextAuth handler, public (correct)                                       |
| `src/app/api/health/route.ts`                                                         | Inspected — public health check (correct)                                            |
| `src/lib/sunbul/tenant-guard.ts`                                                      | Inspected — client-scoped membership check                                           |
| `src/lib/sunbul/storage.ts`                                                           | Inspected — `requireClientAccess` called on retrieve                                 |
| `src/lib/sunbul/export/index.ts`                                                      | Inspected — `requireClientAccess` called on export                                   |
| `src/lib/sunbul/services.ts`                                                          | Inspected — `requireClientAccess` called on all record/document ops                  |
| `src/lib/rate-limit.ts`                                                               | Inspected — in-memory rate limiter, functional                                       |
| `docs/source-of-truth/ROUTE_STRATEGY.md`                                              | Inspected — aligned with code reality                                                |
| `docs/reports/auth-middleware-hardening-v0.1.md`                                      | Inspected — prior findings                                                           |
| `docs/reports/aqliya-next16-proxy-auth-restoration-report.md`                         | Inspected — prior findings                                                           |
| `docs/reports/aqliya-v0.1-reality-hardening-report.md`                                | Inspected — prior findings                                                           |

## Files Changed

None — no fixes applied (no critical vulnerabilities found).

## Security Status: PASS (with reservations)

### JWT Validation

- `proxy.ts` uses `getToken()` from `next-auth/jwt` — cryptographically validates JWT
- NOT cookie-existence-only
- Prior report confirms migration from `hasSessionCookie()` to `getToken()`

### Security Headers

- `setSecurityHeaders()` called on every response from `proxy.ts`
- Headers: X-DNS-Prefetch-Control (on), X-XSS-Protection (1; mode=block), X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy, Content-Security-Policy, X-Powered-By (removed)

### Sensitive API Route Auth

| Endpoint                                 | Route-Level Auth                                      | Tenant Isolation         | Cross-Tenant Risk |
| ---------------------------------------- | ----------------------------------------------------- | ------------------------ | ----------------- |
| `/api/audit/evidence/.../download`       | `getAuditActor` + `assertEngagementAccess`            | Engagement org scoped    | None              |
| `/api/audit/engagements/.../exports/...` | `assertEngagementAccess` (in action)                  | Engagement org scoped    | None              |
| `/api/office-ai/download`                | `requireUserContext("VIEWER")` + platform org check   | Platform org scoped      | None              |
| `/api/metrics`                           | `requireUserContext("ADMIN")`                         | N/A (admin only)         | None              |
| `/api/local-content/.../download`        | `getCurrentUser` + `assertProjectAccess`              | Project org scoped       | None              |
| `/api/sunbul/.../export/pdf`             | `requireClientAccess` (in export module)              | Client membership scoped | None              |
| `/api/sunbul/.../download`               | `getCurrentUser` + `requireClientAccess` (in storage) | Client membership scoped | None              |

### Download Endpoint Cross-Tenant Protection

All download endpoints validate that the requesting user has access to the owning entity (engagement, platform org, project, or sunbul client) before serving file content. Filenames are sanitized against header injection.

## Findings (No Fix Applied)

### Finding 1: Proxy matcher excludes API routes (defense-in-depth gap)

- `proxy.ts` `config.matcher` only includes page routes (`/audit`, `/decisions`, `/local-content`, etc.)
- API routes like `/api/metrics`, `/api/audit/*`, `/api/sunbul/*` are NOT matched
- The proxy's JWT check never runs for API requests
- Mitigation: All sensitive API endpoints have route-level auth

**Risk:** Low. Route-level auth is present and verified. The proxy would provide defense-in-depth.

**Fix not applied:** Adding `/api/:path*` to the matcher would break the public `/api/custom-product-submit` endpoint because `isPublicPath()` does not include it. A safe fix would require:

1. Adding `/api/custom-product-submit` to `isPublicPath()`
2. Adding `/api/:path*` to the matcher
   This changes proxy behavior scope and is not a critical vulnerability fix.

### Finding 2: Dead code — `isApiPath()` never executes

- `proxy.ts` defines `isApiPath()` and has API-401 response logic
- This code path never runs because API routes are not in the proxy matcher

**Risk:** None (cosmetic). Dead code does not affect security.

**Fix not applied:** Code removal is a refactor, not a security fix.

### Finding 3: `middleware-rate-limit.ts` is never imported

- `rateLimitMiddleware()` is defined in `src/middleware-rate-limit.ts`
- It is never imported or called by `proxy.ts` or any other file
- `src/lib/rate-limit.ts` provides the underlying in-memory rate limiter

**Risk:** Low. Rate limiting is an anti-abuse feature, not a security perimeter concern.

**Fix not applied:** This is a feature integration gap, not a security bug.

### Finding 4: Prior report claim of "two-layer defense" for API routes is inaccurate

- Report `auth-middleware-hardening-v0.1.md` states API routes have "Middleware" (proxy) + route-level auth
- The proxy does not run for API routes, so only route-level auth is active

**Risk:** Documentation inaccuracy, not a code vulnerability.

## Validation

| Command               | Result | Notes                                               |
| --------------------- | ------ | --------------------------------------------------- |
| File inspection       | Pass   | All allowed files read and analyzed                 |
| Cross-tenant analysis | Pass   | All download/export endpoints have tenant isolation |
| Auth layer analysis   | Pass   | JWT-based, not cookie-only                          |
| Security headers      | Pass   | Applied to all responses                            |

## Heavy Commands Used

**No** — only file reads, grep, glob.

## RAM Risk

**None** — no database, build, or TypeScript compiler commands executed.

## Remaining Risks

1. **No proxy-level JWT validation for API routes** — defense-in-depth gap. All endpoints are protected at route level, so this is low risk. If a new API route were added without route-level auth, it would be unprotected.
2. **Rate limiting not enabled** — `middleware-rate-limit.ts` exists but is never wired into `proxy.ts`. API endpoints lack rate-limit protection.
3. **Prior report inaccuracy** — `auth-middleware-hardening-v0.1.md` overstates the defense layer for API routes. This should be reconciled in a future doc update.
4. **Callback URL validation** — `proxy.ts` passes `callbackUrl` as-is from the request query without validating the redirect target. Potential open redirect if the `/login` page uses it unsafely.

## Next Lowest-Load Step

1. Validate callback URL handling in the `/login` page — ensure `callbackUrl` is validated against the same origin before redirect.
2. Consider wiring `middleware-rate-limit.ts` into `proxy.ts` for API rate limiting.
3. Reconcile `auth-middleware-hardening-v0.1.md` with this report's finding that proxy does not cover API routes.
4. Optional: Add specific API route patterns (`/api/metrics`, `/api/audit/:path*`, `/api/office-ai/:path*`, `/api/local-content/:path*`, `/api/sunbul/:path*`) to the proxy matcher for defense-in-depth, while keeping `/api/custom-product-submit` and `/api/auth/[...nextauth]` and `/api/health` in `isPublicPath`.
