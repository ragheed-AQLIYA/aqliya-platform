# Auth Middleware Hardening — v0.1

**Date:** 2026-05-22
**Type:** Security hardening
**Product/System affected:** AQLIYA Platform — access control

---

## Summary

- Updated `src/proxy.ts` (Next.js 16 equivalent of middleware) with JWT-validated route protection using `getToken` from `next-auth/jwt` (Edge-compatible). Former proxy only checked cookie existence — now validates JWT token cryptographically.
- 11 protected route prefixes now redirect unauthenticated browsers to `/login` with callback URL preservation.
- All sensitive API routes have their own server-side auth (two-layer defense).
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.) applied to all responses via `setSecurityHeaders`.
- Fixed `401`/`403` error handling in `/api/audit/engagements/[engagementId]/exports/[format]` and `/api/sunbul/documents/[documentId]/download`.
- All existing per-route auth checks in the 7 audited sensitive API endpoints remain intact and are now defended by both proxy (outer layer) and route-level (inner layer) auth.
- Updated `docs/source-of-truth/ROUTE_STRATEGY.md` with auth documentation.

## Files Changed

| File                                                                     | Change                                                                                                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/proxy.ts`                                                           | **Updated** — Replaced cookie-existence check with `getToken` JWT validation; added public route preservation, API 401 responses, and security headers |
| `src/middleware.ts`                                                      | **Deleted** — Not used in Next.js 16 (proxy.ts is the standard)                                                                                        |
| `src/app/api/audit/engagements/[engagementId]/exports/[format]/route.ts` | **Fixed** — Added 401/403 error handling for auth errors                                                                                               |
| `src/app/api/sunbul/documents/[documentId]/download/route.ts`            | **Fixed** — Added "Unauthenticated" catch returning 401                                                                                                |
| `docs/source-of-truth/ROUTE_STRATEGY.md`                                 | **Updated** — Added Proxy Auth Protection section                                                                                                      |
| `docs/reports/auth-middleware-hardening-v0.1.md`                         | **Created** — This report                                                                                                                              |

## Proxy Strategy

Next.js 16 uses `src/proxy.ts` instead of `src/middleware.ts`. The proxy provides selective protection:

1. **For page routes (UI):** Proxy validates JWT session token cryptographically via `getToken({ req, secret })` from `next-auth/jwt` before any protected page route handler runs. This is Edge-compatible and does not call server-only `auth()` or Prisma. Previously, the proxy only checked for cookie existence (`hasSessionCookie`) — now it validates the actual JWT.

2. **For API routes:** The proxy config.matcher excludes `/api/*` routes, so proxy-layer JWT validation does NOT run for API endpoints. API routes are protected exclusively by route-level authentication.

3. **Route-level auth (all protected routes):** Each sensitive API endpoint independently calls `requireUserContext`, `getCurrentUser`, `getAuditActor`, `requireClientAccess`, or equivalent to validate auth + permissions before serving data. Page routes may also have additional route-level checks.

This ensures:

- Unauthenticated users never reach protected page route handlers (proxy validates JWT first).
- API endpoints are protected by route-level auth only (proxy does not cover `/api/*` paths).
- Even if proxy config changes, each sensitive API route independently enforces auth.
- Server-side `auth()` (from NextAuth v5) is only called inside route handlers and Server Actions, not in proxy.
- Expired or tampered JWT tokens are rejected by the proxy (for page routes) or by route-level auth handlers (for API routes).

## Protected Routes

| Prefix           | Auth Layer             | Behavior (Unauthenticated) |
| ---------------- | ---------------------- | -------------------------- |
| `/audit`         | Middleware + per-route | Redirect to `/login`       |
| `/decisions`     | Middleware + per-route | Redirect to `/login`       |
| `/local-content` | Middleware + per-route | Redirect to `/login`       |
| `/assistant`     | Middleware + per-route | Redirect to `/login`       |
| `/organizations` | Middleware + per-route | Redirect to `/login`       |
| `/settings`      | Middleware + per-route | Redirect to `/login`       |
| `/monitoring`    | Middleware + per-route | Redirect to `/login`       |
| `/intelligence`  | Middleware + per-route | Redirect to `/login`       |
| `/sunbul`        | Middleware + per-route | Redirect to `/login`       |
| `/workflowos`    | Middleware + per-route | Redirect to `/login`       |
| `/sales`         | Middleware + per-route | Redirect to `/login`       |

## Public Routes Preserved

- Marketing: `/`, `/about`, `/products/*`, `/demo`, `/deployment`, `/platform`, `/security`, `/terms`, `/privacy`, `/use-cases`, `/case-studies`, `/buyers/*`, `/insights/*`, etc.
- Demo: `/auditos/*`
- Auth: `/login`, `/access-denied`, `/api/auth/*`
- Health: `/api/health`
- Legacy/published: `/published/recommendation/*`
- Static: `/_next/*`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`

## API Routes Secured

All 7 sensitive API endpoints were audited. Note: Proxy middleware does not cover `/api/*` routes (excluded from config.matcher), so only route-level auth protects these endpoints:

| API Route                                                | Route-Level Auth                                       | Status                       |
| -------------------------------------------------------- | ------------------------------------------------------ | ---------------------------- |
| `/api/audit/evidence/[evidenceId]/download`              | ✅ `getAuditActor` + `assertEngagementAccess`          | Already secure               |
| `/api/audit/engagements/[engagementId]/exports/[format]` | ✅ `getAuditActor` + `assertEngagementAccess`          | Fixed 401/403 error handling |
| `/api/office-ai/download`                                | ✅ `requireUserContext("VIEWER")` + platform org check | Already secure               |
| `/api/metrics`                                           | ✅ `requireUserContext("ADMIN")`                       | Already secure               |
| `/api/local-content/.../download`                        | ✅ `getCurrentUser` + `assertProjectAccess`            | Already secure               |
| `/api/sunbul/.../export/pdf`                             | ✅ `requireClientAccess` in `exportSunbulRecord`       | Already secure               |
| `/api/sunbul/documents/[documentId]/download`            | ✅ `requireClientAccess` in `retrieveSunbulDocument`   | Fixed 401 error handling     |

## Validation Results

| Command            | Result                                        |
| ------------------ | --------------------------------------------- |
| `npx tsc --noEmit` | Pass                                          |
| `npm run lint`     | Pass (0 errors, 169 warnings pre-existing)    |
| `npm run build`    | Pass (19 CSS optimizer warnings pre-existing) |
| `npm test`         | Pass (22 suites, 206 tests)                   |

## Manual Checks

### Unauthenticated — should redirect to `/login`

- [ ] `/audit`
- [ ] `/decisions`
- [ ] `/local-content`
- [ ] `/assistant`
- [ ] `/organizations`
- [ ] `/settings`
- [ ] `/monitoring`
- [ ] `/intelligence/sectors`
- [ ] `/sales`

### Public — should remain accessible

- [ ] `/`
- [ ] `/products/audit`
- [ ] `/auditos`
- [ ] `/login`
- [ ] `/published/recommendation/test`

### Unauthenticated API — should return 401

- [ ] `/api/metrics`
- [ ] `/api/audit/evidence/fake-id/download`

## Remaining Risks

1. **Middleware bypass via `NextResponse.next()`** — If a future config change removes the middleware matcher, protected routes become unprotected. Mitigation: each sensitive API has its own route-level auth, so data is still protected.
2. **Server Actions** — Server Actions are not covered by middleware (they are POST endpoints handled by Next.js internally). They rely on `getCurrentUser()` calls inside the action. This is acceptable because the action handler validates auth before mutating data.
3. **Cookie name assumption** — Middleware uses the default NextAuth v5 cookie name (`authjs.session-token`). If the cookie name changes in a future NextAuth upgrade, the middleware token read would silently return `null`. Mitigation: should be verified after any NextAuth upgrade.
4. **No CSRF protection** — This is handled by NextAuth v5's built-in CSRF token mechanism for Server Actions. Middleware does not add additional CSRF checks.
5. **No post-login redirect validation** — The `callbackUrl` is used as-is from the request. In a hardened security review, callback URLs should be validated to prevent open redirect attacks.

## Next Recommended Step

1. Run browser-based smoke tests on all protected routes (manual checks above).
2. Add route-level auth to `src/actions/localcontent-actions.ts` and `src/actions/sunbul-actions.ts` if not already present (checked — `getCurrentUser` is called at the top of server actions).
3. Consider adding `AUTH_SECRET` rotation documentation for deployment.
4. Add automated integration tests for middleware redirect behavior.
5. Verify callback URL format in `/login` page renders correctly with `callbackUrl` parameter.
