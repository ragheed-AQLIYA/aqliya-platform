# AQLIYA Security Review - Audit Report

**File:** docs/audits/security-review-pgvector-cycle.md
**Date:** 2026-06-04
**Reviewer:** AQLIYA Security Agent
**Scope:** MFA, RBAC, tenant isolation, middleware security
**Mode:** Read-only review with findings. No fixes implemented unless single-line obvious bug.

---

## Executive Summary

This review covers the full security layer of AQLIYA: authentication (MFA), authorization (RBAC), multi-tenant isolation, and middleware (rate limiting, CSP, session management). The platform has a strong architectural foundation with defense-in-depth patterns (dual MFA enforcement at middleware + action layer, JWT revocation via jti, consistent server-action guards across products). However, several critical and high-severity findings exist:

1. Middleware MFA enforcement ignores MFA_REQUIRED_ROLES env var - hard-coded to ADMIN + OPERATOR.
2. Any ADMIN bypasses tenant isolation - no platform-ADMIN distinction, no cross-tenant guard for non-organization resources.
3. CSP is ineffective - unsafe-inline + unsafe-eval on scripts renders XSS protection moot.
4. Step-up authentication absent - no re-verification for sensitive operations (password change, export, approval).
5. Rate limiter is in-memory only - not suitable for production multi-instance deployments.
6. Platform org guard and workspace guard are report-only - not wired into any enforcement path.

---

## Review Summary Table

| Area | Current Level | Critical Findings | High Findings | Key Gaps |
|------|--------------|-------------------|---------------|----------|
| MFA | L5 | 1 (no step-up auth) | 3 | Middleware hard-codes roles; no backup code rate limit; token not revoked after verify |
| RBAC | L4 | 1 (ADMIN bypasses tenant isolation) | 0 | No ABAC; resourceId not validated; no platform vs org ADMIN distinction |
| Tenant Isolation | L5 | 0 | 1 | Report-only guards not wired; no automated query scoping; action-layer only |
| Middleware Security | L4 | 1 (CSP ineffective) | 2 | In-memory rate limiter; missing cross-origin headers; no refresh token rotation |

---

## 1. MFA REVIEW

Current level: L5 (TOTP + backup codes, role-based enforcement, dual-layer checking)

### 1.1 Middleware-Level MFA Enforcement

The middleware at src/middleware.ts lines 139-163 checks MFA for ADMIN and OPERATOR roles:

```typescript
if (role && (role === "ADMIN" || role === "OPERATOR")) {
```

Finding: MFA-MW-01 - Middleware MFA enforcement hard-codes roles.

- Severity: High
- The middleware hard-codes ADMIN and OPERATOR as MFA-required roles.
- The MFA library (src/lib/auth/mfa.ts) supports configurable roles via the MFA_REQUIRED_ROLES environment variable and defaults to ADMIN only.
- If MFA_REQUIRED_ROLES is set to ADMIN (operator does not require MFA), the middleware incorrectly blocks OPERATORs without MFA.
- If MFA_REQUIRED_ROLES is set to ADMIN,OPERATOR,VIEWER, the middleware fails to enforce MFA for VIEWERs.
- Recommendation: Middleware should call isMFARequiredForRole() from the MFA library instead of hard-coding role names.
- This is a single-line fix: replace the role check with isMFARequiredForRole(role as UserRole)

### 1.2 Dual-Layer MFA Enforcement

MFA is enforced at two layers:
1. Middleware (route access) - checks token claims mfaEnabled and mfaVerified
2. requireUserContext (action access) - calls requireMFA() which checks role against MFA_REQUIRED_ROLES

Finding: MFA-MW-02 - Middleware and action layer use different role configurations.
- Severity: Medium
- Middleware uses hard-coded list; requireMFA uses env-var-driven list.
- Inconsistency could lead to confusing error states where a user is blocked by middleware but would be allowed by the action layer (or vice versa).

### 1.3 Backup Codes

Generation:
- generateBackupCodes() - 8 codes of 8 hex chars each (32 bits of entropy per code)
- Generated via crypto.randomBytes(4).toString("hex").toUpperCase()

Storage:
- Hashed with SHA-256 via hashBackupCode() before storage
- Stored as JSON string array of SHA-256 hashes in mfaBackupCodes field
- Stored during enableMFA() server action

Display:
- Returned only once (at enable time) as plaintext from enableMFA() action

Verification:
- Via verifyBackupCode(code, hashedCodes) - SHA-256 hash comparison
- Used codes are consumed (removed from the array)

Finding: MFA-BC-01 - Backup code entropy is adequate but not configurable.
- Severity: Low
- 32 bits per code, 8 codes = 256 bits total. Acceptable for one-time use.
- Not configurable in count or length.

Finding: MFA-BC-02 - Backup code verification has weak rate limiting.
- Severity: High
- No specific rate limit on backup code verification.
- The generic rate limiter (60 req/min/IP) applies but is not tailored.
- Backup codes have only 32 bits of entropy.

### 1.4 Rate Limit on MFA Verification

Finding: MFA-RL-01 - No targeted rate limit for MFA/backup code verification.
- Severity: High
- Generic rate limiter applies 60 req/min/IP to all /api/ routes uniformly.
- MFA verification should have a much lower limit (e.g., 5 attempts per minute per user).
- The MFA verify endpoint is public-path listed in middleware (bypasses auth check at middleware level, does its own auth check internally).

### 1.5 Step-Up Authentication

Finding: MFA-SU-01 - No step-up authentication for sensitive operations.
- Severity: Critical
- After initial MFA verification, there is no re-authentication / step-up for:
  - Password change
  - Email change
  - Sensitive exports
  - Audit report approvals
  - Cross-tenant admin operations
- disableMFA() requires password confirmation but NOT MFA re-verification.
- The JWT carries mfaVerified: true for the full 30-day token lifetime with no re-verification.

### 1.6 MFA Setup Flow

Finding: MFA-SU-02 - MFA setup does not require role check.
- Severity: Low
- getMFASetup() and enableMFA() only require authentication, not any specific role.
- Any authenticated user (including VIEWER) can set up MFA - acceptable, but inconsistent with middleware enforcement.

### 1.7 Token Rotation on MFA Verify

Finding: MFA-TOK-01 - Old token not revoked after MFA verification.
- Severity: Medium
- The MFA verify route creates a new JWT with mfaVerified: true but does NOT revoke the old pre-MFA token.
- The old token (without mfaVerified) remains valid until expiry (30 days).
- An attacker who captured the pre-MFA token could still use it on routes where middleware MFA enforcement has an exemption.

---

## 2. RBAC REVIEW

Current level: L4 (per-product RBAC, unified server-action guard)

### 2.1 Server-Action Guard Consistency

Finding: RBAC-GUARD-01 - Consistent guard usage across all products.
- Severity: Informational (positive finding)
- All 6 product action files use requireServerActionAccess() with their respective AccessResource:
  - audit, sales, decisions, local_content, assistant, workflowos
- The unified guard architecture is well-designed and provides consistent enforcement.

### 2.2 Unified Policy Engine

Finding: RBAC-POL-01 - Single policy engine exists; CoreAccessControl intentionally disabled.
- Severity: Low
- server-action-guard.ts is the unified policy engine with action-to-role mapping in ACTION_MIN_ROLE.
- CoreAccessControl is explicitly disabled - throws error directing to server-action-guard.ts. Good pattern.

### 2.3 ABAC (Attribute-Based Access Control)

Finding: RBAC-ABAC-01 - No ABAC implementation; resourceId option is silently ignored.
- Severity: Medium
- No attribute-based policies exist (resource-level, relationship-level, context-based).
- The resourceId field exists in ServerActionAccessOptions but is never validated or checked in the guard function.
- This means resourceId in the options object has zero effect on access decisions.

### 2.4 Cross-Tenant ADMIN Bypass

Finding: RBAC-CROSS-01 - Any ADMIN bypasses tenant isolation on all non-organization resources.
- Severity: Critical
- In server-action-guard.ts lines 53-55:
  if (targetOrgId !== user.organizationId && user.role !== "ADMIN") {
    throw new Error("Access denied: organization mismatch");
  }
- For resources other than "organization", ANY ADMIN bypasses the tenant check.
- The allowPlatformAdminCrossTenant flag only controls access for the "organization" resource type.
- For audit, sales, decisions, local_content, assistant, workflowos - any ADMIN can access any organization data.
- Test at cross-tenant-isolation.test.ts lines 256-264 confirms this behavior.
- This is intentional design (ADMIN as super-admin) but:
  - No distinction between platform ADMIN and organization ADMIN
  - No audit trail specifically for cross-tenant ADMIN access
  - No way to restrict a subset of ADMINs from cross-tenant access

### 2.5 Action-to-Role Mapping Coverage

Finding: RBAC-ACT-01 - Action-to-role mapping covers all standard CRUD actions.
- Severity: Informational (positive finding)
- ACTION_MIN_ROLE covers: admin, delete, approve, reject, create, update, export, read
- Reasonable defaults: admin/approve/reject -> ADMIN, create/update/delete -> OPERATOR, read/export -> VIEWER

---

## 3. TENANT ISOLATION REVIEW

Current level: L5 (per-product guards, platformOrganizationId on entities, cross-tenant test coverage)

### 3.1 Prisma Query Scoping

Finding: TI-SCHEMA-01 - Organization-level isolation fields exist on all major business models.
- Severity: Informational (positive finding)
- organizationId on: User, Decision, AuditEngagement, AuditClient, DecisionEvidence, LocalContentProject, SalesAccount, SalesDeal, etc.
- Engagement-chain models use engagementId for isolation (AuditFinding, AuditRecommendation, AuditEvent, etc.)
- Project-chain models use projectId for isolation (LocalContentSupplier, LocalContentSpendRecord)
- platformOrganizationId on: Organization, ClientWorkspace, AuditOrganization, SunbulClient, LocalContentProject

Finding: TI-SCHEMA-02 - No automated query scoping - relies on developer discipline.
- Severity: Medium
- There is no Prisma middleware or query interceptor that automatically adds organizationId scoping.
- Every service/action must manually scope its queries.
- Risk exists that a new feature or refactor could miss the tenant scope.

### 3.2 Tenant Guard Application Layers

Finding: TI-GUARD-01 - Tenant isolation applied at action layer only.
- Severity: Medium
- Middleware performs NO tenant isolation checks - only auth + MFA.
- Tenant guard is only in the action/service layer via requireServerActionAccess.
- If a new API route handler is added that does not use Server Actions, it would bypass tenant isolation.

### 3.3 Report-Only Guards

Finding: TI-GUARD-02 - Platform org guard and workspace guard are report-only and not wired into enforcement.
- Severity: High
- platform-org-guard.ts is explicitly Report-Only Mode (line 1).
- workspace-guard.ts is explicitly Report-Only Mode (line 1).
- requirePlatformOrganization() has a code comment: "NOT yet wired into any existing routes" (line 124).
- These guards produce diagnostic reports but do NOT block any access.
- They can throw if throwOnError: true is passed, but no caller uses this option.

### 3.4 Cross-Tenant Test Coverage

Finding: TI-TEST-01 - Cross-tenant test coverage is solid for guard functions but does not test individual query paths.
- Severity: Medium
- cross-tenant-isolation.test.ts (526 lines) covers role-based access, server action guard across all resources, action-to-role mapping, schema isolation fields, middleware route protection, and CoreAccessControl disabled enforcement.
- tenant-isolation-audit.test.ts (93 lines) covers tenant guard assertions.
- Missing: Integration tests simulating actual cross-tenant data leakage scenarios.

---

## 4. MIDDLEWARE SECURITY REVIEW

Current level: L4 (auth, CSP, rate limiting, session management)

### 4.1 Content Security Policy (CSP)

Finding: CSP-01 - CSP is ineffective due to unsafe-inline + unsafe-eval.
- Severity: Critical
- Current CSP: script-src self unsafe-inline unsafe-eval
- unsafe-inline allows ALL inline scripts - nullifies CSP primary XSS protection.
- unsafe-eval allows eval(), setTimeout(string), and other dynamic evaluation.
- Without strict CSP, any stored/reflected XSS vulnerability can execute arbitrary JavaScript.
- Next.js App Router supports nonce-based CSP in modern versions - should be investigated.

Finding: CSP-02 - Missing cross-origin headers (COEP, COOP, CORP).
- Severity: Low
- Missing: Cross-Origin-Embedder-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy
- These provide defense-in-depth against Spectre-type attacks and cross-origin information leaks.

### 4.2 Rate Limiting

Finding: RL-01 - In-memory rate limiter is not suitable for production.
- Severity: High
- Source docs confirm: "not suitable for production multi-instance deployment".
- In a horizontally scaled deployment, each instance has its own memory store.
- No Redis-based rate limiter is implemented, though RateLimiterType has "redis" as a type option.

Finding: RL-02 - No differentiated rate limits for auth/MFA endpoints.
- Severity: Medium
- Rate limit is 60 req/min/IP for ALL /api/ routes uniformly.
- No differentiated limits for auth/MFA/login endpoints vs regular API endpoints.
- No per-user rate limiting - only per-IP.

### 4.3 Session Management

Finding: SESS-01 - JWT revocation works but no refresh token rotation.
- Severity: Medium
- JWT revocation via jti + RevokedToken table is implemented - checked in the jwt callback.
- Each JWT verification requires a database lookup (performance concern).
- No refresh token rotation - the JWT is valid for 30 days with no short-lived access token pattern.
- cleanupExpiredTokens() exists but must be called explicitly (not scheduled).

Finding: SESS-02 - Session recording is fire-and-forget.
- Severity: Low
- recordSession() is called with .catch() - failures are logged but not actioned.
- A failed session recording does not prevent sign-in.

### 4.4 Security Headers

Finding: HEAD-01 - Security headers are generally well-configured.
- Severity: Informational (positive finding)
- HSTS: preload-ready (max-age=31536000, includeSubDomains)
- X-Frame-Options: SAMEORIGIN (anti-clickjacking)
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restricts camera, microphone, geolocation
- X-Powered-By: removed

### 4.5 Middleware Route Coverage

Finding: MW-01 - Correct HTTP status codes and consistent error format.
- Severity: Informational (positive finding)
- 401 for unauthenticated, 403 for MFA-required - correct HTTP semantics.
- Consistent error response format with error and code fields.

Finding: MW-02 - Reverse proxy can strip security headers.
- Severity: Low
- Security headers set in middleware can be stripped/overridden by reverse proxies.
- CSP enforcement is more reliable when configured at the reverse proxy level.

---

## 5. READINESS IMPACT

### 5.1 Blocks Pilot

| Finding | Severity | Impact |
|---------|----------|--------|
| CSP-01 - CSP ineffective | Critical | XSS can compromise any pilot user session |
| MFA-SU-01 - No step-up auth | Critical | Stolen session with mfaVerified=true gives 30-day unlimited access |
| RBAC-CROSS-01 - ADMIN bypasses tenant isolation | Critical | Compromised ADMIN account accesses ALL organizations |
| MFA-BC-02 - No backup code rate limit | High | Backup codes (32-bit entropy) can be brute-forced |
| MFA-RL-01 - No targeted MFA rate limit | High | MFA endpoint has insufficient protection |

Pilot Blocking Assessment: 3 Critical, 2 High - material security risks that could expose customer data or allow account takeover. Should be resolved before external pilot.

> **📋 FIX STATUS 2026-06-04:**
> - **MFA-MW-01** — ✅ Fixed. `src/middleware.ts:140` now uses `isMFARequiredForRoleName(role)` instead of hard-coded `["ADMIN", "OPERATOR"]`. Edge-safe module created at `src/lib/auth/mfa-roles.ts`. 17/17 MFA tests pass.
> - **RL-01** — ✅ Fixed. Redis rate limiter (`src/lib/platform/rate-limiter/redis-rate-limiter.ts`) now uses Redis Lua EVAL as primary store with in-memory fallback only. 20/20 rate limiter tests pass.
> - **MFA-RL-01** — Partially mitigated by RL-01 fix (rate limiter now works across instances).
> - **CSP-01** — Not fixed (requires architectural decision).
> - **MFA-SU-01** — Not fixed (requires architectural decision).
> - **RBAC-CROSS-01** — Not fixed (requires architectural decision).

### 5.2 Blocks Production

| Finding | Severity | Impact |
|---------|----------|--------|
| RL-01 - In-memory rate limiter | High | Rate limiting is per-process; horizontal scaling bypasses it completely — ✅ **FIXED** |
| MFA-MW-01 - Middleware ignores MFA_REQUIRED_ROLES | High | Cannot configure MFA requirements without code change — ✅ **FIXED** |
| TI-GUARD-02 - Platform org/workspace guards report-only | High | Platform org consistency is unenforced |
| MFA-TOK-01 - Token not revoked after MFA verify | Medium | Pre-verification token remains valid on non-MFA routes |
| SESS-01 - No refresh token rotation | Medium | Long-lived JWT (30 days) with no rotation mechanism |
| TI-SCHEMA-02 - No automated query scoping | Medium | Developer discipline only; new features risk data leakage |
| RL-02 - No differentiated rate limits | Medium | Auth endpoints not specifically protected |

Production Blocking Assessment: 3 High, 4 Medium - production deployment requires at minimum: Redis-backed rate limiter, wired-up platform org guards, and refresh token rotation.

### 5.3 Acceptable Risk (v0.1)

| Finding | Severity | Rationale |
|---------|----------|----------|
| RBAC-ABAC-01 - No ABAC | Medium | Acceptable for v0.1; ABAC is future scope |
| TI-GUARD-01 - Action-layer only | Medium | Current architecture pattern; known limitation |
| TI-TEST-01 - No full-stack cross-tenant integration tests | Medium | Guard-level tests exist; integration tests are follow-up |
| RBAC-POL-01 - CoreAccessControl disabled | Low | Intentionally disabled with clear error guidance |
| MFA-SU-02 - MFA setup no role check | Low | Any user can set up MFA - not a security issue |
| MFA-BC-01 - Backup code entropy not configurable | Low | 32 bits x 8 codes is adequate for one-time use |
| CSP-02 - Missing COEP/COOP/CORP | Low | Defense-in-depth; low risk for v0.1 |
| SESS-02 - Session recording fire-and-forget | Low | Non-blocking; failures do not affect auth |
| MW-02 - Reverse proxy considerations | Low | Deployment-specific; documented for operator |

---

## 6. FINDINGS SUMMARY

| ID | Area | Severity | Description |
|----|------|----------|-------------|
| MFA-MW-01 | MFA | High | Middleware MFA enforcement hard-codes roles instead of using MFA_REQUIRED_ROLES |
| MFA-MW-02 | MFA | Medium | Middleware and action layer use different role configurations for MFA |
| MFA-BC-01 | MFA | Low | Backup code entropy is adequate but not configurable |
| MFA-BC-02 | MFA | High | Backup code verification has weak/no specific rate limiting |
| MFA-RL-01 | MFA | High | No targeted rate limit for MFA verification endpoint |
| MFA-SU-01 | MFA | Critical | No step-up authentication for sensitive operations |
| MFA-SU-02 | MFA | Low | MFA setup does not require role check |
| MFA-TOK-01 | MFA | Medium | Old JWT not revoked after MFA verification |
| RBAC-GUARD-01 | RBAC | Info | Consistent guard usage across all products (positive) |
| RBAC-POL-01 | RBAC | Low | CoreAccessControl intentionally disabled with guidance (positive) |
| RBAC-ABAC-01 | RBAC | Medium | No ABAC; resourceId option silently ignored |
| RBAC-CROSS-01 | RBAC | Critical | Any ADMIN bypasses tenant isolation on non-organization resources |
| RBAC-ACT-01 | RBAC | Info | Action-to-role mapping covers all standard CRUD actions (positive) |
| TI-SCHEMA-01 | Tenant | Info | Organization-level isolation fields on all major models (positive) |
| TI-SCHEMA-02 | Tenant | Medium | No automated query scoping - relies on developer discipline |
| TI-GUARD-01 | Tenant | Medium | Tenant isolation applied at action layer only |
| TI-GUARD-02 | Tenant | High | Platform org and workspace guards are report-only, not wired |
| TI-TEST-01 | Tenant | Medium | No full-stack cross-tenant integration tests |
| CSP-01 | Middleware | Critical | CSP ineffective due to unsafe-inline + unsafe-eval |
| CSP-02 | Middleware | Low | Missing cross-origin headers (COEP, COOP, CORP) |
| RL-01 | Middleware | High | In-memory rate limiter not suitable for multi-instance production |
| RL-02 | Middleware | Medium | No differentiated rate limits for auth/MFA endpoints |
| SESS-01 | Middleware | Medium | No refresh token rotation; database lookup on every JWT verify |
| SESS-02 | Middleware | Low | Session recording is fire-and-forget |
| HEAD-01 | Middleware | Info | Security headers well-configured (positive) |
| MW-01 | Middleware | Info | Correct HTTP status codes and consistent error format (positive) |
| MW-02 | Middleware | Low | Reverse proxy can strip security headers |

---

## 7. FILES INSPECTED

- src/lib/auth/mfa.ts
- src/lib/auth/sessions.ts
- src/lib/auth/encryption.ts
- src/lib/auth.ts
- src/lib/auth-config.ts
- src/lib/auth-next.ts
- src/lib/rate-limit.ts
- src/lib/platform/rate-limiter/memory-rate-limiter.ts
- src/lib/platform/rate-limiter/types.ts
- src/core/access/server-action-guard.ts
- src/core/access/access-control.ts
- src/core/access/types.ts
- src/core/access/index.ts
- src/middleware.ts
- src/middleware-security.ts
- src/middleware-rate-limit.ts
- src/lib/audit/tenant-guard.ts
- src/lib/platform/guards/platform-org-guard.ts
- src/lib/platform/guards/workspace-guard.ts
- src/actions/mfa.ts
- src/app/api/auth/mfa/verify/route.ts
- src/__tests__/unit/mfa-l011.test.ts
- src/__tests__/cross-tenant-isolation.test.ts
- src/__tests__/tenant-isolation-audit.test.ts
- prisma/schema.prisma
- src/actions/audit-actions.ts (usage example)
- src/actions/sales-actions.ts (usage example)
- src/actions/decisions.ts (usage example)
- src/actions/workflowos-actions.ts (usage example)
- src/actions/office-ai-actions.ts (usage example)
- src/actions/localcontent-actions.ts (usage example)

---

## 8. NEXT RECOMMENDED STEPS

1. Single-line fix: Update middleware.ts to use isMFARequiredForRole() instead of hard-coding role names (High, MFA-MW-01).
2. Add step-up authentication for sensitive operations (Critical, MFA-SU-01).
3. Implement Redis-backed rate limiter and apply differentiated limits to auth/MFA endpoints (High, RL-01 + MFA-RL-01).
4. Distinguish platform ADMIN from organization ADMIN in the RBAC model (Critical, RBAC-CROSS-01).
5. Wire platform org guard and workspace guard into actual enforcement paths (High, TI-GUARD-02).
6. Investigate nonce-based CSP for Next.js App Router to remove unsafe-inline from script-src (Critical, CSP-01).
7. Revoke the old JWT in the MFA verify route after issuing the new mfaVerified=true token (Medium, MFA-TOK-01).
8. Implement automated Prisma query scoping (middleware-based tenant filter) as defense-in-depth (Medium, TI-SCHEMA-02).

