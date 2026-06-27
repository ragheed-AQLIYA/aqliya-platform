# AQLIYA — Security Readiness Report
**ER-1 Audit | Generated: 2026-06-25**

---

## Executive Summary

| Area | Status | Risk | Action |
|------|--------|------|--------|
| SAST Integration | ⚠️ Partial | Medium | `eslint-plugin-security` installed; no CodeQL/advanced SAST |
| Secret Scanning | ⚠️ Partial | Medium | Gitleaks config created; not yet automated in CI |
| Dependency Scanning | ⚠️ Partial | High | `npm audit` in CI (continue-on-error); 48 vulns (8 high) |
| License Compliance | ❌ Missing | Low | No SPDX/license checks |
| CSP Verification | ✅ Implemented | Low | Strict CSP; style-src unsafe-inline required for Tailwind |
| Security Headers | ✅ Implemented | Low | All 8 headers set |
| Authentication | ✅ Implemented | Low | NextAuth v5 JWT + RBAC + MFA |
| Authorization | ✅ Implemented | Low | Route-based RBAC + server-side tenant guard |
| MFA Readiness | ✅ Implemented | Low | MFA gate, enroll/verify flows, tests |
| Audit Log Integrity | ✅ Implemented | Low | Dual-write verification, hash chain, scripts |
| Rate Limiting | ✅ Implemented | Low | Edge rate limiting for all API routes |

**Overall Rating: Pilot-Ready** — Production hardening needed for dependency vulnerabilities and SAST automation.

---

## 1. SAST Integration

### Current State
- **Severity: Medium**
- **Evidence**: `eslint.config.mjs` now includes `eslint-plugin-security` recommended rules
- **Missing**: No CodeQL, SonarQube, or Semgrep integration in CI. ESLint security rules only cover ~40 patterns (no deep SAST).
- **Remediation**: Add GitHub CodeQL in Phase ER-2. Configure `security/detect-*` rules in ESLint for critical paths.
- **Validation**: `npm run lint` passes with security plugin active.

### ESLint Security Rules Added
- `eslint-plugin-security` installed and configured in `eslint.config.mjs`
- Covers: `detect-possible-timing-attacks`, `detect-non-literal-fs-filename`, `detect-child-process`, `detect-pseudoRandomBytes`, etc.
- **Note**: All existing `security/detect-*` violations are pre-existing and do not block the build.

---

## 2. Secret Scanning

### Current State
- **Severity: Medium**
- **Evidence**: `.gitignore` contains `.env`, `.env.local`, `.env.*.local` patterns. `.env.session4.local` with pilot passwords is NOT tracked by git.
- **Missing**: No pre-commit hook. No CI-automated secret scanning. `.env.example` and `.env.pilot.example` contain placeholder values only (safe).
- **Remediation**: `.gitleaks.toml` created with custom rules for AQLIYA-specific patterns. Gitleaks should be installed and run in CI.
- **Validation**: `npx gitleaks detect --source . --no-git` should pass after allowlist review.

### Findings
| File | Finding | Status |
|------|---------|--------|
| `.env.session4.local` | Contains pilot passwords | ❌ Not tracked by git (safe) |
| `.env` | Contains dev secrets (AUTH_SECRET, DOWNLOAD_TOKEN_SECRET) | ⚠️ Permissions must be 600 |
| `.env.example` | Placeholder values only | ✅ Safe |
| `.env.pilot.example` | Placeholder values only | ✅ Safe |

---

## 3. Dependency Vulnerability Scanning

### Current State
- **Severity: High**
- **Evidence**: `npm audit` reports **48 vulnerabilities** (2 low, 38 moderate, 8 high)
- **Impact**: CI runs `npm audit --audit-level=high` with `continue-on-error: true`

### Critical Dependencies (High Severity)

| Package | Vulns | Severity | Fix Available | Impact |
|---------|-------|----------|---------------|--------|
| **next** | 11 | High | ✅ `npm audit fix --force` (breaks pinned version) | DoS, XSS, cache poisoning, SSRF, middleware bypass |
| **nodemailer** | 7 | High | ❌ No fix available | SMTP injection, CRLF injection, SSRF |
| **hono** | 12 | Mixed | ✅ `npm audit fix` | CSS injection, JWT validation, cache leakage |
| **fast-uri** | 2 | High | ✅ `npm audit fix` | Path traversal, host confusion |
| **form-data** | 1 | High | ✅ `npm audit fix` | CRLF injection |
| **tmp** | 1 | High | ✅ `npm audit fix` | Path traversal |
| **ws** | 1 | High | ✅ `npm audit fix` | DoS |
| **xlsx** | 2 | High | ❌ No fix available | Prototype pollution, ReDoS |

### Remediation
1. **Immediate**: `npm audit fix` resolves 39/48 vulnerabilities (non-breaking)
2. **Breaking**: next@16.2.9 requires careful testing (Next.js major features may change)
3. **Unfixable**: nodemailer and xlsx have no fixes; nodemailer is bundled with NextAuth
4. **Monitor**: Track GHSA advisories for nodemailer/xlsx fixes
5. **Validation**: After fixes, re-run `npm audit --audit-level=high` to verify zero high-severity

---

## 4. License Compliance

### Current State
- **Severity: Low**
- **Evidence**: No automated license checking configured
- **Missing**: `license-checker` or `license-report` in CI
- **Remediation**: Non-blocking for initial production. Add `npx license-checker --failOn "GPL"` to CI in Phase ER-2.
- **Validation**: Manual review of `node_modules` licenses for critical packages (MIT, Apache-2.0, ISC dominant).

---

## 5. CSP Verification

### Current State
- **Severity: Low** — Passes verification
- **Evidence**: `src/middleware-security.ts` sets the following CSP header:
  ```
  default-src 'self'; base-uri 'self'; object-src 'none';
  frame-ancestors 'none'; script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:; font-src 'self' data:;
  connect-src 'self' https://*.sentry.io;
  ```
- **Strengths**:
  - `object-src 'none'` prevents Flash/plugin injection
  - `frame-ancestors 'none'` prevents clickjacking
  - `script-src 'self'` no `unsafe-inline` or `unsafe-eval`
  - `base-uri 'self'` prevents base tag injection
- **Weakness**: `style-src 'self' 'unsafe-inline'` — required by Tailwind CSS runtime styles
- **Remediation**: None required. Style nonces would require significant Tailwind integration changes. Acceptable risk.
- **Validation**: Verified CSP header is set on all responses via middleware.

---

## 6. Security Headers Verification

### Current State
- **Severity: Low** — All 8 security headers present
- **Evidence**: `src/middleware-security.ts` sets:
  | Header | Value | Status |
  |--------|-------|--------|
  | `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | ✅ |
  | `X-DNS-Prefetch-Control` | `on` | ✅ |
  | `X-XSS-Protection` | `1; mode=block` | ✅ |
  | `X-Frame-Options` | `SAMEORIGIN` | ✅ |
  | `X-Content-Type-Options` | `nosniff` | ✅ |
  | `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
  | `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | ✅ |
  | `X-Powered-By` | (empty) | ✅ |
- **Validation**: Headers verified by `src/middleware.ts` applying `setSecurityHeaders()` on every response path.

---

## 7. Authentication Review

### Current State
- **Severity: Low** — Passes review
- **Evidence**:
  - **Framework**: NextAuth v5 with JWT session strategy
  - **Token**: JWT signed with `AUTH_SECRET` (minimum 32 chars)
  - **Session**: `authjs.session-token` salt for cookie storage
  - **Providers**: Google, GitHub, Azure AD, Okta (OAuth) — configured via env vars
  - **SCIM**: `/api/scim/v2/*` with Bearer token authentication
  - **Password**: Email/password auth via credentials provider
  - **Rate limiting**: API routes rate-limited (auth endpoints: 5 req/min per IP)
  - **Logout**: Session cookie cleared on sign-out
- **Verification**: Auth middleware returns 401 for unauthenticated API requests, 302 redirect to `/login` for page requests.

---

## 8. Authorization Review

### Current State
- **Severity: Low** — Passes review
- **Evidence**:
  - **Middleware RBAC**: 30+ route patterns mapped to minimum roles (viewer/operator/manager/admin)
  - **Role hierarchy**: `viewer < operator < manager < admin`
  - **Server-side checks**: `server-action-guard.ts` enforces permissions on Server Actions
  - **Tenant isolation**: `verifyOrgAccess()` scopes data by `organizationId` server-side
  - **ABAC**: Attribute-Based Access Control pipeline built (shadow mode); enforcement opt-in via `FF_ABAC_ENFORCE`
  - **Route coverage**: All private workspace routes require `viewer` minimum; admin routes require `admin`
- **Gap**: `/api/health` is intentionally public (no auth) — documented and monitored.

---

## 9. MFA Readiness

### Current State
- **Severity: Low** — Implemented and tested
- **Evidence**:
  - **MFA Gate**: `src/lib/auth/mfa-gate.ts` — `resolveMfaGateState()` handles 3 states: `allow`, `enroll`, `verify`
  - **MFA Config**: `src/lib/auth/mfa-roles.ts` — role-to-MFA-requirement mapping
  - **MFA Service**: `src/lib/auth/mfa.ts` — TOTP generation and verification
  - **Middleware integration**: MFA check runs on every authenticated request via `src/middleware.ts`
  - **Exempt paths**: `/login`, `/settings/mfa`, `/api/auth` exempt from MFA enforcement
  - **Tests**: `src/lib/auth/__tests__/mfa-gate.test.ts` covers all gate states
- **Validation**: All MFA test cases pass.

---

## 10. Audit Log Integrity

### Current State
- **Severity: Low** — Implemented and verified
- **Evidence**:
  - **Platform audit log**: `writePlatformAuditLog()` in `src/lib/platform/audit-log.ts`
  - **Hash chain**: `src/lib/platform/audit/hash-chain.ts` — cryptographically links audit entries
  - **Dual-write**: AuditOS + platform dual-write via `src/lib/platform/audit/` 
  - **Verification scripts**:
    - `npm run platform:audit-log:dry` — dry-run verification
    - `npm run platform:verify-audit-logs` — full audit trail verification
    - `npm run platform:auditos-dual-write:dry` — dual-write check
  - **Test coverage**: Multiple test suites validate audit log write behavior
- **Validation**: All audit-related tests pass.

---

## Findings Summary

### Immediate Actions (ER-1 Complete)
| # | Finding | Action Taken | Status |
|---|---------|-------------|--------|
| F-1 | No SAST in ESLint | Added `eslint-plugin-security` with recommended rules | ✅ Done |
| F-2 | No secret scanning config | Created `.gitleaks.toml` with custom AQLIYA rules | ✅ Done |
| F-3 | No license compliance | Documented; requires CI integration | ⚠️ Documented |
| F-4 | CSP `style-src 'unsafe-inline'` | Accepted — required by Tailwind | ✅ Documented |

### Deferred to ER-2 (CI/CD)
| # | Finding | Target |
|---|---------|--------|
| F-5 | CodeQL not integrated | ER-2 |
| F-6 | No secret scanning in CI | ER-2 |
| F-7 | `npm audit` blocking only at high — add moderate threshold | ER-2 |
| F-8 | License check automation | ER-2 |

### Unfixable / Monitor Only
| # | Finding | Status |
|---|---------|--------|
| F-9 | `nodemailer` — 7 high vulns, no fix | Monitor GHSA; consider replacing if patch doesn't arrive |
| F-10 | `xlsx` — 2 high vulns, no fix | Monitor; consider migrating to `exceljs` or similar |
| F-11 | Next.js 16.2.4 — 11 high vulns, fix requires breaking upgrade | Test Next 16.2.9 upgrade in staging before production |

---

## Verification Commands

```bash
# Verify ESLint security rules
npm run lint

# Verify TypeScript  
npx tsc --noEmit

# Verify tests
npm test

# Dependency audit (high severity)
npm audit --audit-level=high

# Gitleaks scan (requires gitleaks CLI)
# gitleaks detect --source . --config .gitleaks.toml

# Audit log verification
npm run platform:audit-log:dry
```

---

*Generated as part of ER-1 Security Hardening. All findings are evidence-backed and sourced from live code inspection.*
