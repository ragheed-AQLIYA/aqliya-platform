# Phase 4 — Auth & Session Hardening Assessment

**Date:** 2026-05-28
**Agent:** Auth & Session Hardening Agent
**Status:** Assessment complete

---

## Files Inspected

| File | Role |
|------|------|
| `src/lib/auth.ts` | Core auth utilities (getCurrentUser, requireUserContext, requireOrgAccess) |
| `src/lib/auth-config.ts` | NextAuth v5 config (Credentials provider, JWT strategy, callbacks) |
| `src/lib/auth-next.ts` | Thin re-export of auth/handlers |
| `src/middleware-security.ts` | Security headers middleware |
| `src/middleware-rate-limit.ts` | API rate limiting middleware |
| `src/lib/download-token.ts` | HMAC-SHA256 signed download tokens |
| `src/lib/rate-limit.ts` | In-memory rate limiter for API routes |
| `src/lib/audit/actor-context.ts` | AuditOS actor resolution (auth → audit user bridge) |
| `src/lib/audit/tenant-guard.ts` | AuditOS tenant isolation guards |
| `src/lib/audit/rate-limit.ts` | AuditOS per-action rate limiter |
| `src/lib/workflowos/tenant-guard.ts` | WorkflowOS tenant + membership guards |
| `src/lib/local-content/guards.ts` | LocalContentOS project access guards |
| `src/lib/platform/guards/workspace-guard.ts` | Workspace consistency guard (report-only) |
| `src/lib/platform/guards/platform-org-guard.ts` | Platform org guard (report-only) |
| `src/lib/governance/actor-lineage.ts` | Actor lineage helpers (canMutateByLineage, actorDisplayName) |
| `src/app/api/audit/evidence/[evidenceId]/download/route.ts` | Evidence download route |
| `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts` | LC report download route |
| `src/app/api/workflowos/documents/[documentId]/download/route.ts` | WorkflowOS doc download route |
| `src/app/api/office-ai/download/route.ts` | Office AI download route |

---

## Auth Architecture Overview

1. **Provider:** NextAuth v5 with Credentials provider (email + bcrypt password)
2. **Strategy:** JWT-based sessions
3. **Session shape:** id, email, name, role, organizationId, organization, platformOrganizationId
4. **Routes:** No root `src/middleware.ts` — middleware is split into security headers + rate-limiting only
5. **Auth enforcement:** Route-level via Server Actions and API route handlers calling auth utilities
6. **Download auth:** Signed HMAC tokens (5-min expiry) + session auth dual path

---

## Auth Maturity Findings

### Strengths

| Area | Finding |
|------|---------|
| Tenant isolation | All product guards check organizationId |
| Actor resolution | Audit actor bridges NextAuth session → AuditUser with PlatformOrganization |
| Download tokens | HMAC-SHA256 signed, 5-min expiry, path traversal protection |
| Role hierarchy | ADMIN > OPERATOR > VIEWER enforced server-side |
| Audit logging | All download routes log via platform auditLogger |
| Rate limiting | Separate rate limiters for API routes and AuditOS actions |
| Security headers | CSP, X-Frame-Options, X-Content-Type-Options, HSTS-ready |
| Session enrichment | JWT callback populates org/role/platform org from DB |
| Demo fallback | Gated behind NODE_ENV !== production + AUDIT_DEV_FALLBACK_ENABLED===true |

### Gaps

| Priority | Gap | Location | Risk |
|----------|-----|----------|------|
| P0 | **No root middleware.ts** — route-level auth is ad-hoc. Every route handler must explicitly call auth. No global guard for unauthenticated access to workspace routes. | Missing `src/middleware.ts` | Unauthenticated requests reach route handlers before auth check; works because each handler checks, but fragile |
| P0 | **No CSRF protection** — NextAuth v5 with JWT does not provide CSRF tokens. Credentials provider bypasses CSRF, but no double-submit cookie or SameSite enforcement beyond Next.js defaults | `src/lib/auth-config.ts` | Low risk for server actions (Next.js applies CSRF), but API routes could be vulnerable to CSRF |
| P1 | **requirePlatformOrganization is NOT wired** into any existing routes (`src/lib/platform/guards/platform-org-guard.ts:126`) — report-only only | `platform-org-guard.ts` | Platform org consistency not enforced at route level |
| P1 | **WorkspaceGuard is report-only** — diagnostics without blocking (`src/lib/platform/guards/workspace-guard.ts:1`) | `workspace-guard.ts` | Workspace consistency not enforced at route level |
| P1 | **Rate limiting is in-memory only** — no shared state across instances (`src/lib/rate-limit.ts:1`, `src/lib/audit/rate-limit.ts:12`) | Both rate limiters | In multi-instance deployment, rate limiting is per-instance; acceptable for v0.1 |
| P1 | **Download token secret must be set** — no fallback, hard error if missing (`src/lib/download-token.ts:11-13`) | `download-token.ts` | Works as designed (fail-secure), but no startup validation |
| P1 | **Office AI download rate limiter uses setInterval** with no cleanup of closed intervals on HMR (`src/app/api/office-ai/download/route.ts:14-20`) | Office AI download route | Minor memory leak risk in development |
| P2 | **Audit actor demo fallback** — hardcoded fallback actor in development (`src/lib/audit/actor-context.ts:96-101`) | `actor-context.ts` | Already gated behind two env checks. Low risk but worth documenting as intentional |
| P2 | **No session revocation** — JWT-based sessions cannot be revoked server-side without a blocklist | `auth-config.ts` | Acceptable for v0.1; blocklist would require database or Redis |
| P2 | **No password rotation policy** — no password expiry enforcement | `auth-config.ts` | Not required for v0.1 pilot |
| P2 | **Mixed audit log models** — AuditLog, AuditEvent, PlatformAuditLog, SunbulAuditEvent all exist separately | Prisma schema | Documented in master reference; not merged |

---

## P0/P1 Auth Risks

### P0 — Missing root middleware

**Risk:** Route-level auth is ad-hoc. If a new route handler or API route is added without explicit auth checks, it could be accessible without authentication.

**Current mitigation:** Audit evidence, LC reports, WorkflowOS, and Office AI download routes all call `getCurrentUser()` or `requireUserContext()` at handler start. This pattern is consistent across all inspected routes.

**Recommendation:** Add a root `src/middleware.ts` that:
- Protects `/api/*` routes (except public ones)
- Protects `/(dashboard)/*` routes
- Passes session to route handlers via request headers
- Is lightweight — just auth check, no heavy imports

### P1 — Platform org guard not wired

**Risk:** Platform org consistency is diagnosed but not enforced. A user could operate with stale/incorrect `platformOrganizationId`.

**Recommendation:** Wire `requirePlatformOrganization` into workspace-level route layout or page-level server component for AuditOS and LocalContentOS.

### P1 — In-memory rate limiting only

**Risk:** Per-instance rate limiting means in multi-instance deployment, limits are effectively multiplied by instance count.

**Acceptable for v0.1.** Document as deployment constraint.

---

## Recommended Minimal Hardening Path

| Priority | Action | Effort |
|----------|--------|--------|
| P0 | Add root `src/middleware.ts` with auth check for protected routes | ~2h |
| P1 | Wire `requirePlatformOrganization` into AuditOS/LocalContentOS route layouts | ~1h |
| P1 | Add `DOWNLOAD_TOKEN_SECRET` to `.env.example` with warning note | ~5min |
| P2 | Add startup validation for `DOWNLOAD_TOKEN_SECRET` | ~15min |
| P2 | Clean up Office AI download rate limiter setInterval leak | ~10min |
| P2 | Document in-memory rate limiting as deployment constraint | ~5min |

---

## Assessment Summary

| Dimension | Maturity |
|-----------|----------|
| Auth provider maturity | L4 (NextAuth v5, JWT, bcrypt) |
| Tenant isolation | L5 (org-level guards across all products) |
| Route-level auth | L3 (no root middleware, ad-hoc checks) |
| Download security | L5 (HMAC tokens + session auth + audit) |
| Rate limiting | L3 (in-memory only) |
| CSRF protection | L3 (Next.js defaults only) |
| Session revocation | L1 (JWT; no blocklist) |
| Platform org consistency | L2 (report-only, not enforced) |
