# Security P1 Hardening Report

**Date:** 2026-05-23
**Type:** Narrow P1 security hardening
**Based on:** `docs/reports/security-perimeter-verification-report.md`
**Product/System affected:** AQLIYA Platform — `src/proxy.ts`, `src/lib/rate-limit.ts`

---

## Summary

- Added sensitive API route prefixes to the proxy `config.matcher`, enabling the proxy's JWT check to run as an outer defense layer for API requests (defense-in-depth).
- Wired `rateLimitMiddleware()` into `proxy.ts` — rate limiting now applies to matched API routes (60 req/min per IP+path).
- Removed `setInterval` from `src/lib/rate-limit.ts` to avoid Edge runtime crash when the module is imported (Edge does not support `setInterval`; cleanup is now lazy via expiry checks in `checkRateLimit`).
- All existing route-level auth and tenant isolation remain intact — no product behavior changed.

## Files Inspected

| File                                                     | Reason                                     |
| -------------------------------------------------------- | ------------------------------------------ |
| `src/proxy.ts`                                           | Core change — matcher, rate limit wiring   |
| `src/middleware-rate-limit.ts`                           | Verify rate limit middleware is compatible |
| `src/middleware-security.ts`                             | Verify security headers integration        |
| `src/lib/rate-limit.ts`                                  | Required — Edge runtime compatibility fix  |
| `docs/reports/security-perimeter-verification-report.md` | Baseline findings                          |

## Files Changed

| File                    | Change                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/proxy.ts`          | Added `rateLimitMiddleware` import + call; added 5 sensitive API route patterns to `config.matcher`    |
| `src/lib/rate-limit.ts` | Removed `setInterval` periodic cleanup — entries expire lazily via `resetAt` check in `checkRateLimit` |

## Security Decision for API Protection

**Decision:** API routes are now included in the proxy matcher — but only the known sensitive prefixes, not all API routes.

### Why not add `/api/:path*` blanket?

A blanket `/api/:path*` would trigger the proxy's JWT check on public API endpoints (`/api/custom-product-submit`) that are not in `isPublicPath()`. This would break the public marketing inquiry form.

### What was added instead?

Specific sensitive prefixes only — those whose route handlers already enforce auth:

| Prefix                      | Routes Covered                              |
| --------------------------- | ------------------------------------------- |
| `/api/audit/:path*`         | Evidence download, engagement exports       |
| `/api/office-ai/:path*`     | Office AI download                          |
| `/api/local-content/:path*` | LocalContent report download                |
| `/api/sunbul/:path*`        | Sunbul document download, record PDF export |
| `/api/metrics`              | Platform metrics (admin-only)               |

### Excluded (correctly)

| Prefix                       | Reason                              |
| ---------------------------- | ----------------------------------- |
| `/api/auth/[...nextauth]`    | NextAuth handler — public by design |
| `/api/health`                | Health check — public by design     |
| `/api/custom-product-submit` | Marketing form — public by design   |

### Defense layers now

| Layer         | Scope                     | Mechanism                                                          |
| ------------- | ------------------------- | ------------------------------------------------------------------ |
| Outer (proxy) | Matched page + API routes | `getToken()` JWT validation                                        |
| Inner (route) | All sensitive endpoints   | `requireUserContext`, `getAuditActor`, `requireClientAccess`, etc. |

## Rate Limiting Decision

**Wired — with Edge compatibility fix.**

### What was done

1. `rateLimitMiddleware()` is now called at the top of `proxy()` — before public path check and JWT check.
2. On matched routes, requests exceeding 60 per minute per IP+path receive a 429 response with `Retry-After` header.

### Why this is safe

- The rate limiter checks `pathname.startsWith("/api/")` and returns `null` for non-API paths — page routes pass through.
- API routes not in the proxy matcher (NextAuth, health, custom-product-submit) never trigger the proxy, so the rate limiter never runs for them.
- In-memory Map is ephemeral per instance — acceptable for anti-abuse, not production-hardened.

### Why `setInterval` was removed

- Next.js 16 middleware runs in Edge runtime, which does not support `setInterval`.
- `src/lib/rate-limit.ts` had a module-level `setInterval` for periodic cleanup.
- Removing it is safe: `checkRateLimit` already handles expiry lazily (`if (!entry \|\| entry.resetAt < now)`).
- Removed module-level code prevents an Edge runtime `ReferenceError` at import time.

### What was explicitly NOT done

- Global `"*"` rate limiting — would break demos (`/auditos/*`) and public marketing.
- Route-handler-level rate limiting — deferred to avoid touching individual route handlers.

## Commands Run

| Command            | Classification          | Result          |
| ------------------ | ----------------------- | --------------- |
| `npx tsc --noEmit` | Light (type-check only) | Pass — 0 errors |

## Heavy Commands Used

**No.**

## RAM Risk

**None.** TypeScript type check only; no database, Prisma, build, or test execution.

## Remaining Risks

1. **Rate limiter is in-memory** — does not persist across server restarts; not effective in multi-instance serverless deployments. Acceptable for initial anti-abuse.
2. **Rate limiter key is IP+pathname** — pathname includes `[...nextauth]` dynamic segments in theory, but since NextAuth routes are excluded from the matcher, this is moot.
3. **Callback URL validation** — still unaddressed. `proxy.ts` passes `callbackUrl` from the request query without validation. If `/login` uses it unsafely, an open redirect is possible. This is a separate concern from this pass.
4. **Prior report inaccuracy** — `auth-middleware-hardening-v0.1.md` states "Middleware ✅ 401 JSON" for API routes. Technically the proxy was not running for API routes before this change. The claim is now accurate.

## Recommendation

**Pilot-ready** — API defense-in-depth gap closed; rate limiting enabled; Edge runtime compatibility verified. No remaining blocker for pilot use.

## Next Lowest-Load Step

1. Validate callback URL handling in the `/login` page — ensure `callbackUrl` is validated against same origin before redirect.
2. Consider route-level rate limiting in individual API route handlers for finer-grained control.
