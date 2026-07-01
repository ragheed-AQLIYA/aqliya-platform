# Demo/Pilot Hardening Lock — 2026-05-25

## Executive Verdict

- Internal Development: **GO**
- Internal Demo: **GO**
- Controlled Customer Demo: **GO**
- Controlled Pilot: **CONDITIONAL GO**
- Paid Production: **NO-GO**

---

## What Was Fixed

| # | File | Change Summary |
|---|------|----------------|
| 1 | `src/app/api/health/route.ts` | Stripped from 33 lines to 5. Removed `prisma` import, `dynamic` export, `process.env.NODE_ENV`, `process.uptime()`, `timestamp`, response `checks` map. Now returns `{ status: "ok" }` only. |
| 2 | `next.config.mjs` | Added `poweredByHeader: false`. Added `async headers()` with `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` applied globally. |
| 3 | `next.config.mjs` | Removed `turbopack.root: "C:/Users/PC/Documents/Aqliya"` — absolute Windows developer path no longer exposed in config. |
| 4 | `src/app/(marketing)/page.tsx` | Corrected LocalContentOS status label from `"نشط — L4 Usable v0.1"` to `"نشط — Pilot-ready بشروط"`, aligning homepage copy with `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` (L5 with conditions). |
| 5 | All modified files | `npx eslint` on all 3 files passed with zero errors/warnings. |

---

## Security Reality

- **`src/proxy.ts`** is the active Next.js 16 edge-runtime auth boundary. It is NOT dead code. It exports `proxy()` with `config.matcher`, calls `setSecurityHeaders()` and `rateLimitMiddleware()`. The original OpenCode reconciliation confirmed this is the correct convention for Next.js 16.2.4. The file was not modified in this sprint.

- **No P0 security blocker is known.** The security/auth coverage lock (2026-05-24) remains valid. The proxy matcher covers all protected prefixes. Route-level auth calls `getCurrentUser()`, `requireUserContext()`, and `assertEngagementAccess()` before returning data. Rate limiting is wired.

- **All P1 security/reality gaps have been closed:**
  - `/api/health` no longer leaks `NODE_ENV` or `process.uptime()`
  - `poweredByHeader` disabled — `X-Powered-By` no longer exposed
  - CSP added as defense-in-depth (in addition to headers set by `proxy.ts`)
  - Absolute developer Windows path removed from `next.config.mjs`
  - Homepage no longer understates LocalContentOS status (codelabel was L4, truth is L5 with conditions)

- **Remaining P2/P3 items do not block Controlled Demo** but are required before Paid Production.

---

## Remaining Conditions for Controlled Pilot

Each condition must be documented and agreed before a controlled pilot begins:

- [ ] Pilot scope documented and signed off
- [ ] Pilot agreement executed with customer
- [ ] No overclaims — marketing/UI copy audited against implemented capability
- [ ] Customer data handling rules defined (scope, retention, deletion, isolation)
- [ ] P2 security improvements scheduled and timeline shared
- [ ] Pilot exit criteria defined

---

## Remaining Production Blockers

These must be completed before Paid Production is viable:

- Redis/Upstash rate limiting (replace in-memory Map)
- JWT `maxAge`/rotation policy
- Callback URL validation hardening
- Monitoring and alerting
- Backup automation and restore testing
- SSO/OAuth (enterprise IdP integration)
- Penetration test (third-party)
- Stricter CSP (remove `unsafe-inline`/`unsafe-eval` when feasible)

---

## Final Decision

AQLIYA is controlled-demo ready.

AQLIYA is conditionally pilot-ready.

AQLIYA is not paid-production ready.
