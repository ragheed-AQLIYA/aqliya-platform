# SECURITY VERIFICATION
**Independent Audit — AQLIYA Repository**
**Date:** 2026-06-25
**Classification:** Technical Due Diligence
**Auditors:** Security Engineer · Platform Reliability Engineer

---

## 1. Authentication

### 1.1 Session Management

- **Provider:** NextAuth.js (`next-auth`) with JWT sessions
- **Token resolution:** `getToken({ req, secret, salt: "authjs.session-token" })` in middleware
- **Secret:** `AUTH_SECRET` environment variable (minimum 32 chars enforced in CI env)
- **MFA:** Gate implemented via `resolveMfaGateState()` in middleware — users without MFA configured are redirected to `/settings/mfa`
- **MFA exempt paths:** `/login`, `/settings/mfa`, `/api/auth` (correct)

**FINDING: LOW — Confirmed sound**

Authentication flow is correctly implemented. JWT validation happens at the Edge. MFA gate is enforced before route access for protected paths.

**Concern:** `AUTH_SECRET` value `SWPbmu3Vn4pYC0wUo+O2GpHXCIwaG2K6GMnV68spl8o=` is present in `.env`. This file is `.gitignore`d (confirmed: `git ls-files .env` returns no output, `git show HEAD:.env` returns nothing). The local dev credential is not in git history. This is acceptable for local development but operators must confirm production secrets are rotated and stored in AWS Secrets Manager, not in any `.env` committed to branches.

### 1.2 SCIM Authentication

- **Mechanism:** API key authentication (`SCIM_API_KEY`)
- **Location:** `/api/scim/v2/*`
- **Middleware enforcement:** `/api/scim` is mapped to `"admin"` role in `routeMinRoles`

**Concern:** SCIM routes are in `publicPrefixes` (`"/api/scim"` in the list). This means they bypass the standard JWT token check in middleware. Authentication for SCIM must therefore be entirely handled within the SCIM route handlers themselves. This is a design choice (SCIM uses Bearer/API-key auth, not session cookies) but it means any bug in the SCIM route's own auth check would leave provisioning APIs unprotected. This was not independently verified at the route handler level.

---

## 2. Authorization

### 2.1 RBAC at the Edge

Middleware (`src/middleware.ts`) implements a role hierarchy: `viewer(0) < operator(1) < manager(2) < admin(3)`.

Route minimum roles are enforced at the Edge for all protected paths. The mapping is explicit and readable. Gaps identified:

- `/risk` is mapped to `"viewer"` — RiskOS is described as a prototype that contradicts "do not build" in AGENTS.md. A prototype route being accessible to viewers is a concern.
- `/content-studio` is mapped to `"viewer"` — also an undocumented surface.
- No routes require `"manager"` role at the Edge. The `manager` level exists in the hierarchy but is not used in any route mapping.

### 2.2 Authorization Bypass Escape Hatch

**FINDING: HIGH**

`src/lib/authorization/authorize.ts` line 44:
```typescript
if (!context?.bypassTenantCheck) {
  const tenantOk = await checkTenantAccess(...)
  if (!tenantOk.allowed) { return { allowed: false, ... } }
}
```

The `AuthorizeOptions.context.bypassTenantCheck` field (types.ts line 93) can disable tenant isolation. No production callers currently pass `true`, but:

1. No audit log entry is written when this flag is present or evaluated.
2. No test asserts that passing `bypassTenantCheck: true` triggers an alert or log.
3. Any future developer who encounters a "tenant mismatch" error could simply add `bypassTenantCheck: true` without understanding the security implications.

For a multi-tenant financial governance platform, any mechanism that can disable tenant isolation must be logged, require elevated authorization, or be removed entirely.

### 2.3 Admin Cross-Tenant Access

`tenant-guard.ts`:
```typescript
if (user.role === "ADMIN") {
  return { allowed: true, resolvedTenantId: targetTenantId };
}
```

Admin users have unrestricted cross-tenant access for all resource types. This is a design choice for platform operations, but there is no second-factor requirement, no explicit audit log for admin cross-tenant access, and no time-bounded elevation (just-in-time admin). For an institutional platform with financial data, unrestricted permanent admin cross-tenant access is a risk.

---

## 3. Security Headers

**FINDING: CONFIRMED SOUND**

`src/middleware-security.ts` applies the following headers to all responses:

| Header | Value | Assessment |
|--------|-------|------------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Correct |
| `X-Frame-Options` | `SAMEORIGIN` | Correct |
| `X-Content-Type-Options` | `nosniff` | Correct |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Correct |
| `Permissions-Policy` | `camera=(); microphone=(); geolocation=(); interest-cohort=()` | Correct |
| `X-XSS-Protection` | `1; mode=block` | Acceptable (legacy header) |
| `Content-Security-Policy` | Restrictive — see below | Partially correct |
| `X-Powered-By` | Deleted | Correct |

**CSP concern:** `style-src 'self' 'unsafe-inline'` — inline styles are permitted. This weakens CSS injection protections. For a platform displaying financial data, inline style injection should be evaluated carefully.

**CSP concern:** `connect-src 'self' https://*.sentry.io` — Sentry telemetry is explicitly permitted. Confirm no sensitive financial data reaches Sentry error payloads.

---

## 4. Secrets Management

### 4.1 `.env` in Repository

`.env` is in `.gitignore` and is not tracked in git. Confirmed via `git ls-files .env` (empty result). The file exists only locally.

### 4.2 `.gitleaks.toml` Present

A `gitleaks` configuration exists at `.gitleaks.toml`. However, no CI job runs `gitleaks` or any secret scanning tool. The configuration file exists but is not enforced.

### 4.3 No Dependabot

No `.github/dependabot.yml` present. No automated dependency update PRs. No CVE alerting configured.

### 4.4 No Vulnerability Scanning in CI

The `ci.yml` workflow runs:
- Type checking
- Unit tests
- Linting
- Build
- License compliance (`license-checker --failOn "GPL;AGPL;LGPL-3.0"`)

**Missing from CI:**
- `npm audit` with failure threshold
- Snyk or Trivy container scanning
- SAST (static application security testing)
- Gitleaks secret scanning (config exists but is not wired into CI)
- Dependency vulnerability database check

**FINDING: HIGH** — A platform processing financial audit data has no automated CVE or secret scanning in its CI pipeline.

---

## 5. Rate Limiting

### 5.1 Architecture

**FINDING: CONFIRMED RISK (documented)**

Middleware rate limiting uses per-instance memory (`MemoryRateLimiter`). In a multi-instance ECS deployment (minimum 3 tasks), rate limits are **not shared across instances**. An attacker can bypass per-IP rate limits by distributing requests across the three minimum ECS tasks.

The BUILD_STABILIZATION_REPORT acknowledges this: *"Middleware rate limit is not shared across instances."*

Server-side routes can use Redis-backed rate limiting (`src/lib/rate-limit.ts`), but this requires explicit wiring per route. No evidence of systematic wiring was found.

### 5.2 Public API Rate Limiting

`/api/custom-product-submit` and `/api/pilot-review` are public APIs with no authentication. Middleware rate limiting applies (memory-only). These are low-traffic submission endpoints, but without Redis-backed limiting, sustained POST flood from multiple IPs could exhaust memory.

---

## 6. Audit Logging

**FINDING: MEDIUM**

Platform audit logging exists and is used. `PlatformAuditLog` is a Prisma model with `productKey`, `action`, `actorId`, `organizationId`, `aiProvider`, `aiModel`, `metadata` fields. AI operations write to this table via `spend-tracker.ts`.

**Gaps:**

1. Authorization bypass evaluations are not logged.
2. Admin cross-tenant access is not specifically logged.
3. The audit log verification script (`scripts/platform/verify-platform-audit-logs.ts`) is run in the deploy pipeline with `|| echo "completed (non-blocking)"` — failures are silently ignored.

---

## 7. Summary

| Control | Status | Severity |
|---------|--------|----------|
| Authentication (JWT + MFA) | Sound | — |
| RBAC at Edge | Sound with gaps | Low |
| Tenant isolation | Sound design, bypass hole | High |
| Security headers | Sound, one CSP gap | Low |
| Secrets in git | Not tracked (confirmed) | — |
| Secret scanning in CI | Missing | High |
| Dependency vulnerability scanning | Missing | High |
| Rate limiting (multi-instance) | Per-instance memory only | Medium |
| Audit log completeness | Partial — bypasses not logged | Medium |
| Admin cross-tenant access | Unrestricted, unlogged | Medium |

**Verdict: Authentication and headers are well-implemented. The authorization bypass escape hatch, absence of CI security scanning, and per-instance-only rate limiting are material risks for an enterprise financial platform.**
