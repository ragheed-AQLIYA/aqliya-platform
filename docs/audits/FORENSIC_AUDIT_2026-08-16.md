# AQLIYA — Full Terminal Forensic Audit
**Date:** 2026-08-16  
**Auditor:** Claude Opus 4.8 (Forensic Mode)  
**Branch:** staging @ c885f57d  
**Effort Level:** xhigh  
**Scope:** Repository-wide — code, schema, tests, CI/CD, dependencies, configuration  
**Status:** READ-ONLY — no code was modified

---

## Executive Summary

The platform has a well-structured multi-product architecture with solid tenant isolation, a dual-layer authorization model (middleware RBAC + server-side `enforce()`), HMAC-signed download tokens, MFA infrastructure, and a comprehensive 5,804-test suite (5,775 passing at time of audit). The documentation governance is mature.

However, five concrete issues block pilot production readiness, and a further set of medium-risk items need remediation before unrestricted deployment.

**Verdict: CONDITIONAL GO**

All P1 items must be resolved. The P0 dependency (`xlsx`) requires a written risk-acceptance decision from an authorized owner before launch.

---

## 1. Repository Discovery

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.2.4 |
| Language | TypeScript | 5.x, strict mode |
| ORM | Prisma | 7.8.0 |
| Auth | NextAuth v5 (beta.31) | JWT strategy |
| Database | PostgreSQL + pgvector | |
| Queue | Bull (Redis-backed) | 4.16.5 |
| Runtime | Node.js ≥ 20 | |
| Testing | Jest 30 | 5,804 tests |
| CI | GitHub Actions | push to main + PRs |

### Uncommitted Working-Tree Changes
The following files are modified but not committed (git status `M`):
- `.env.example` — documentation-only change
- `next.config.mjs` — CSP hardening for dev mode (standalone output disabled)
- `prisma/migrations/20260711153755_add_enums_ondelete/migration.sql` — `DROP INDEX` corrected to `ALTER TABLE … DROP CONSTRAINT IF EXISTS`
- `prisma/migrations/20260724232330_drop_deprecated_audit_models/migration.sql` — BOM removal only
- `prisma/seed.ts` — SSO org ID bug fix (platformOrg.id → org.id)

The following are **untracked** (git status `??`):
- `prisma/migrations/20260803150000_add_user_preferences/` — new migration, not committed

---

## 2. Architecture Reconstruction

### Authorization Model
```
Middleware (Edge)  →  getToken() + RBAC prefix check (viewer/operator/admin)
                                ↓ (matched paths only)
Server Action / Route Handler
    getCurrentUser() → throw "Unauthenticated"
    enforce(user, { type, id, tenantId }, action)
        └── authorize()
                1. checkTenantAccess()  [user.orgId === resource.orgId]
                2. ROLE_PERMISSIONS[role].includes(permission)
                3. ABAC conditions (if context.attributes set)
```

### Multi-Tenant Isolation
- Primary isolation: `organizationId` column on every product table
- Audit product: `assertEngagementAccess(engagementId, actor)` DB-level cross-check
- Authorization layer: `checkTenantAccess()` rejects cross-org resource access
- ADMIN role: explicitly granted cross-tenant access (platform operations)

### Rate Limiting Architecture
- **Edge Middleware**: Always memory-only (`rate-limit-edge.ts` → `MemoryRateLimiter`), regardless of `RATE_LIMITER` env var
- **Non-edge API routes**: Configurable via `RATE_LIMITER=memory|redis`
- Rate limiter presets: AUTH=10/min, AI=30/min, SCIM=15/min, Standard=100/min

### Session/JWT Flow
- NextAuth v5, JWT strategy, `salt: "authjs.session-token"` (v5 canonical)
- Session contains: id, email, name, role, organizationId, platformOrganizationId, mfaEnabled, mfaVerified
- MFA state: `mfaVerified=false` on login, `true` after successful TOTP/backup code

### CSP Architecture
Two parallel CSP implementations exist:
1. `next.config.mjs` → `headers()` function (applied to all routes)
2. `middleware-security.ts` → `setSecurityHeaders()` (applied only to middleware-matched paths)

Production CSP from both sources correctly excludes `unsafe-inline` and `unsafe-eval` from `script-src`.

---

## 3. Test Suite Status

| Category | Count |
|----------|-------|
| Total tests | 5,804 |
| Passing | 5,775 |
| **Failing** | **2** |
| Skipped | 27 |

### Failing Test Suites

**1. `src/__tests__/migration-evidence.test.ts`**
```
Expected: "20260724180519_add_platform_audit_log_merge_fields"
Received: "20260803150000_add_user_preferences"
```
Cause: The migration `20260803150000_add_user_preferences/` exists on disk but is not committed. The test's hardcoded constant `ENUMS_ONDELETE` needs to be updated, and the migration needs to be committed.

**2. `src/__tests__/unit/middleware/security-headers.test.ts`**
```
expect(csp).not.toContain("unsafe-eval")  →  FAILS
```
Cause: Test runs in NODE_ENV=test (treated as development), so the dev CSP (which includes `unsafe-eval`) is applied. The test validates the production CSP but runs in development mode. The underlying production code is correct — the production CSP properly excludes `unsafe-eval`. The test needs to mock `process.env.NODE_ENV = "production"`.

---

## 4. Security Analysis

### 4.1 Authentication

**NextAuth v5 Configuration (auth-config.ts)**
- Credentials provider: bcrypt compare (cost 10) ✓
- JWT strategy: uses `AUTH_SECRET` for HMAC ✓
- OAuth: invite-only gate (`isOAuthInviteAllowed`) ✓
- Cookie flags: httpOnly, sameSite=lax, secure=auto ✓
- `debug: false` ✓

**SAML SSO (api/auth/saml/[providerId]/callback/route.ts)**
- Uses `salt: SESSION_COOKIE` where `SESSION_COOKIE = "authjs.session-token"` (dev) ✓
- Validates SAML assertion via `@node-saml/node-saml` ✓
- Restricts to users with matching organizationId ✓
- RelayState validated: must start with "/" and not "//" ✓

**MFA Implementation**
- TOTP standard via `verifyMFAToken(token, plainSecret)` ✓
- Backup codes: SHA-256 hashed, single-use (consumed on use) ✓
- MFA gate in middleware: `resolveMfaGateState()` ✓
- **[P1] Salt mismatch in MFA verify route** — see findings below

### 4.2 Authorization

**Middleware RBAC**
- Role hierarchy: viewer(0) → operator(1) → manager(2) → admin(3)
- Note: `manager` exists in hierarchy only; not in `UserRole` DB enum (ADMIN/OPERATOR/VIEWER). Dead code, not a security risk.
- Public paths are explicitly enumerated in `publicExact` Set and `publicPrefixes` array ✓

**Route-to-Role Mapping Gaps**
- `/api/crm/webhook` — NOT in middleware matcher. Route has its own HMAC verification but bypasses rate limiting.
- `/api/pow/challenge` — NOT in middleware matcher. Public endpoint; acceptable.
- `/api/sales/intel/webhook` — Listed in `publicExact` (unauthenticated). Has HMAC signature verification.
- `/api/sales/intel/oauth` — Listed in `publicExact` (unauthenticated). **[P2] Missing CSRF state validation.**

### 4.3 Tenant Isolation

The tenant isolation model is well-implemented:
- Server-side: `checkTenantAccess()` compares `user.organizationId` to resource's `organizationId` ✓
- Audit product: `assertEngagementAccess()` does a DB lookup to confirm org ownership ✓
- Evidence downloads: `assertEvidenceDownloadAccess()` enforces orgId scope ✓
- Signed download tokens: `sub`, `org`, `type`, `file`, `exp` — HMAC-SHA256 with Web Crypto API ✓
- `DOWNLOAD_TOKEN_SECRET` value in local .env decodes to "SuperSecretDownloadTokenSecretKey123" — low entropy (P2 for local dev, P1 if copied to production)

### 4.4 Webhook Security

**HubSpot CRM webhook (`/api/crm/webhook`)**
- HMAC-SHA256 with `crypto.timingSafeEqual` ✓
- Rejects if `HUBSPOT_WEBHOOK_SECRET` is not set ✓
- **[P2]** Not in middleware matcher → no middleware rate limiting

**Sales intel webhook (`/api/sales/intel/webhook`)**
- Provider-agnostic HMAC verification ✓
- **[P1]** If webhook secret env var is missing, route logs a warning but continues processing with `webhookSecret: ""`. The empty secret allows computing a valid HMAC if the attacker knows the body, enabling forged payloads.
- **[P3]** Custom provider uses non-timing-safe `===` comparison instead of `timingSafeEqual`

### 4.5 SCIM Endpoint

- Bearer token authentication with `crypto.timingSafeEqual` ✓
- **[P3]** Length check before `timingSafeEqual` leaks SCIM key length (minor timing oracle)
- **[P2]** `count` parameter from URL query string has no server-side upper bound:
  ```ts
  const count = parseInt(url.searchParams.get("count") || "100", 10);
  // No MAX_COUNT check — authenticated caller can request unlimited records
  ```

### 4.6 Database / SQL Injection

**Parameterized queries**: All standard Prisma ORM calls use parameterized queries. ✓

**Raw SQL (`$queryRawUnsafe`)** — 4 locations:
1. `similarity-search.ts`: `LIMIT ${options.k}` and `>= ${options.minScore}` — interpolated from `SearchOptions`. User-facing API provides these via `parseInt(searchParams.get("limit"))` and `parseFloat(searchParams.get("minSimilarity"))`. `parseInt`/`parseFloat` prevent string injection but NaN would cause a SQL syntax error. **[P2] Bad practice; should use parameterized values or validate/clamp inputs.**
2. `hybrid-search.ts`: Same pattern — `LIMIT ${limit}` interpolated.
3. `vector-store.ts`: `isPgVectorAvailable()` — fixed string query, no user input. Safe. ✓
4. `vector-store.ts`: `storeChunkEmbedding()` — parameterized (`$1`, `$2`). Safe. ✓

### 4.7 Content Security Policy

**Production CSP (middleware-security.ts):**
```
default-src 'self'; base-uri 'self'; object-src 'none'; 
frame-ancestors 'none'; script-src 'self'; 
style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
font-src 'self' data:; connect-src 'self' https://*.sentry.io;
```

**Production CSP (next.config.mjs, working-tree version):**
```
default-src 'self'; base-uri 'self'; object-src 'none'; 
frame-ancestors 'none'; script-src 'self'; 
style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:;  ← https: extra
font-src 'self' data:; connect-src 'self' https://*.sentry.io; 
worker-src 'none'; manifest-src 'self';
```

**Inconsistency**: `img-src` in next.config.mjs allows `https:` (all remote images); middleware CSP restricts to `self data: blob:` only. For middleware-matched paths, the middleware CSP applies (more restrictive). For unmatched paths, next.config.mjs CSP applies (more permissive). [P2]

**X-Frame-Options vs CSP conflict**: Both sources set `X-Frame-Options: SAMEORIGIN` but `frame-ancestors 'none'` in CSP. `frame-ancestors` takes precedence in CSP-supporting browsers (effectively 'none'). Non-CSP-supporting browsers (IE) would use SAMEORIGIN. Functionally this means framing is prohibited in modern browsers. [P3 — cosmetic inconsistency]

### 4.8 Security Headers Coverage

Middleware sets HSTS via `middleware-security.ts`. Only middleware-matched paths receive HSTS. Paths not in the matcher (e.g., static assets, `/api/pow/challenge`) do not receive HSTS from middleware. The `next.config.mjs` `headers()` function does NOT set HSTS. [P3]

---

## 5. Dependency Vulnerabilities

**npm audit summary: 19 vulnerabilities (1 low, 4 moderate, 14 high)**

### High Severity — Production Impact

| Package | CVE | Severity | Impact | Fix Available |
|---------|-----|----------|--------|---------------|
| `xlsx` | GHSA-4r6h-8v6p-xvw6 (Prototype Pollution) | HIGH | Production — used for spreadsheet uploads/exports | **No fix available** |
| `xlsx` | GHSA-5pgg-2g8v-p4x9 (ReDoS) | HIGH | Production — same | **No fix available** |
| `brace-expansion` | GHSA-mh99-v99m-4gvg | HIGH | Via `glob` (production dep) | `npm audit fix` |
| `fast-uri` | GHSA-7p8r-x3mc-p8w7 | HIGH | Transitive | `npm audit fix` |
| `find-my-way` | (see advisory) | HIGH | Via `@prisma/dev` (dev-only) | Fix available |
| `extract-zip` | GHSA-jmr9-qjv8-65gv | HIGH | Via `cypress` (dev-only) | Fix available |
| `esbuild` | GHSA-g7r4-m6w7-qqqr | HIGH | Dev server on Windows only | Fix available |
| `uuid` | (advisory) | HIGH | Via `bull` (production) | Breaking change only |

**`xlsx` is the highest-risk item**: It is a direct production dependency (`"xlsx": "^0.18.5"`) with no patched version available. The prototype pollution vulnerability allows an attacker who can upload a malicious `.xlsx` file to potentially escalate privileges or corrupt server state.

**Remediation options for `xlsx`:**
1. Replace with `exceljs` or `@e965/xlsx` (community fork with security patches)  
2. Sandbox XLSX processing in a worker thread with no access to the main process scope
3. Formal risk acceptance from an authorized owner

---

## 6. Schema / Migration State

### Migration Chain Status
- Latest committed migration: `20260724232330_drop_deprecated_audit_models`
- Uncommitted migration on disk: `20260803150000_add_user_preferences`
  - Content: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferences" JSONB;`
  - `preferences` field IS defined in `schema.prisma` (line 717)
  - `user-preferences-actions.ts` server action references this field
  - **Schema drift**: Any production database without this migration lacks the `preferences` column; server actions calling it will fail at runtime

### Modified Migration Files
- `20260711153755_add_enums_ondelete/migration.sql` — Changes `DROP INDEX` to `ALTER TABLE … DROP CONSTRAINT IF EXISTS`. This is a correctness fix (unique constraints are not plain indexes). Modifying already-committed migration files violates Prisma migration contract. **[P1]**
  - Risk: New database setups use the corrected SQL; existing databases have the original SQL in their migration history. The files diverge silently.
- `20260724232330_drop_deprecated_audit_models/migration.sql` — BOM removal only (CRLF whitespace). No SQL change. Low risk.

### Seed Default Passwords
`prisma/seed.ts` creates these accounts:
| Email | Password | Role |
|-------|----------|------|
| admin@aqliya.com | admin123 | ADMIN |
| operator@aqliya.com | operator123 | OPERATOR |
| viewer@aqliya.com | viewer123 | VIEWER |

**[P1]** If `npx prisma db seed` is ever run against a production database (e.g., accidentally during setup), these accounts exist with weak passwords. There is no guard against running seed in production.

### Uncommitted seed.ts fix
`prisma/seed.ts` has a working-tree change:
```diff
- await seedSsoProviders(prisma, platformOrg.id);
+ await seedSsoProviders(prisma, org.id);
```
This fixes SSO providers being seeded against the platform org instead of the application org. The fix is correct but uncommitted.

---

## 7. MFA Salt Mismatch (P1 Detail)

**Location**: `src/app/api/auth/mfa/verify/route.ts` vs `src/middleware.ts`

**Middleware reads JWT with:**
```ts
token = await getToken({ req: request, secret, salt: "authjs.session-token" });
```

**MFA verify route re-encodes JWT with:**
```ts
const cookieName = process.env.NODE_ENV === "production"
  ? "__Secure-next-auth.session-token"  // NextAuth v4 naming!
  : "next-auth.session-token";          // NextAuth v4 naming!

const newJwt = await encode({ token: {..., mfaVerified: true}, secret, salt: cookieName });
```

**SAML route encodes JWT with (correct):**
```ts
const SESSION_COOKIE = process.env.NODE_ENV === "production"
  ? "__Secure-authjs.session-token"   // NextAuth v5 naming ✓
  : "authjs.session-token";           // NextAuth v5 naming ✓
```

The MFA verify route uses NextAuth v4-style cookie names (`next-auth.session-token`) as the JWT salt, while the middleware expects NextAuth v5-style (`authjs.session-token`). After MFA verification, the re-encoded token cannot be verified by the middleware, causing a redirect to `/login` in an infinite loop for users with MFA enabled.

**Currently masked by**: `MFA_REQUIRED_ROLES=` (empty string) in `.env`, which disables MFA enforcement entirely. If staging or production is configured without this override, ADMIN and OPERATOR users will be unable to use the platform.

**Fix**: Change the MFA verify route to use `salt: "authjs.session-token"` (dev) and `salt: "__Secure-authjs.session-token"` (prod), matching the SAML callback and the middleware.

---

## 8. Rate Limiter Architecture Gap (P2 Detail)

**Location**: `src/lib/rate-limit-edge.ts`

The Edge middleware rate limiter is always `MemoryRateLimiter`, regardless of `RATE_LIMITER` env var:
```ts
function getEdgeRateLimiter(): MemoryRateLimiter {
  if (!globalForEdgeRateLimit.__aqliyaEdgeRateLimiter) {
    globalForEdgeRateLimit.__aqliyaEdgeRateLimiter = new MemoryRateLimiter(...)
  }
  return globalForEdgeRateLimit.__aqliyaEdgeRateLimiter;
}
```

In multi-instance deployments (ECS Fargate, Kubernetes with `desired_count > 1`), each instance has independent counters. An attacker can trivially bypass rate limits by distributing requests across instances. The auth endpoint rate limit (10 req/min) is effectively `10 * instance_count` req/min from an attacker's perspective.

The `RATE_LIMITER=redis` env var only affects non-edge routes (server-side rate limiting). The middleware rate limiter needs a separate Redis-aware implementation.

---

## 9. Findings Register

### P0 — Requires Risk Acceptance Decision Before Pilot

| ID | Finding | Location | Evidence |
|----|---------|----------|---------|
| P0-01 | `xlsx` HIGH severity CVE: Prototype Pollution (GHSA-4r6h-8v6p-xvw6) — no fix available | `package.json` → `"xlsx": "^0.18.5"` | `npm audit` |

### P1 — Must Fix Before Pilot Launch

| ID | Finding | Location | Evidence |
|----|---------|----------|---------|
| P1-01 | **MFA JWT salt mismatch**: After MFA verification, middleware cannot read re-encoded token. Locks out ADMIN/OPERATOR when MFA is enabled. | `src/app/api/auth/mfa/verify/route.ts:94` | Code review, NextAuth v5 salt docs |
| P1-02 | **Webhook secret bypass**: Sales intel webhook continues with empty secret, only logs a warning. | `src/app/api/sales/intel/webhook/route.ts:55-58` | Code review |
| P1-03 | **Weak seed passwords**: admin123/operator123/viewer123 in seed.ts. No production guard. | `prisma/seed.ts:137,147,157` | grep |
| P1-04 | **Uncommitted migration causes schema drift**: `preferences` column missing from any DB that hasn't applied `20260803150000_add_user_preferences`. Runtime failures likely for `user-preferences-actions.ts`. | `prisma/migrations/20260803150000_add_user_preferences/` | git status |
| P1-05 | **Modified migration file (20260711153755)**: Alters already-committed migration SQL. New databases use different behavior than existing ones. | `prisma/migrations/20260711153755_add_enums_ondelete/migration.sql` | git diff HEAD |

### P2 — Fix Before Production Scaling

| ID | Finding | Location | Evidence |
|----|---------|----------|---------|
| P2-01 | **Edge rate limiter always memory-only**: Multi-instance deployments have no shared rate limiting. Auth brute force window = 10 × num_instances. | `src/lib/rate-limit-edge.ts:15-20` | Code review |
| P2-02 | **X-Forwarded-For IP spoofing for rate limit bypass**: Rate key uses first XFF value without proxy verification. | `src/middleware-rate-limit.ts:27-31` | Code review |
| P2-03 | **SCIM `count` parameter unbounded**: Authenticated SCIM caller can request millions of records. | `src/app/api/scim/v2/Users/route.ts:26` | Code review |
| P2-04 | **OAuth callback CSRF**: `/api/sales/intel/oauth/callback` uses `state` param as orgId without validation. | `src/app/api/sales/intel/oauth/callback/route.ts:67` | Code review |
| P2-05 | **`$queryRawUnsafe` with interpolated LIMIT/score**: Mitigated by parseInt/parseFloat but not by parameterization. | `src/lib/core/ai/retrieval/similarity-search.ts:66-68`, `hybrid-search.ts:54` | Code review |
| P2-06 | **CRM webhook not in middleware matcher**: `/api/crm/webhook` bypasses middleware rate limiting and security headers. | `src/middleware.ts:config`, `src/app/api/crm/webhook/route.ts` | Code review |
| P2-07 | **CSP img-src inconsistency**: Middleware CSP (matched paths) restricts to `blob:`, next.config.mjs CSP allows `https:` (all paths). | `src/middleware-security.ts:73` vs `next.config.mjs:136` | Code review |
| P2-08 | **2 failing test suites in CI**: Migration-evidence (uncommitted migration) and security-headers (environment mismatch). | `npm test` output | Verified |
| P2-09 | **DOWNLOAD_TOKEN_SECRET low entropy in local .env**: "SuperSecretDownloadTokenSecretKey123". If copied to production/staging, download tokens are weak. | `.env:DOWNLOAD_TOKEN_SECRET` | Decoded |
| P2-10 | **Uncommitted seed.ts SSO bug fix**: `platformOrg.id` → `org.id` fix in working tree but not committed. | `prisma/seed.ts` git diff | git diff |
| P2-11 | **Custom webhook provider non-timing-safe comparison**: `receiver.ts` uses `===` for "custom" provider. | `src/lib/sales/intelligence/webhook/receiver.ts:60` | Code review |

### P3 — Low Priority

| ID | Finding | Location | Evidence |
|----|---------|----------|---------|
| P3-01 | SCIM length check leaks API key length before timing-safe equal | `src/app/api/scim/v2/auth.ts:32` | Code review |
| P3-02 | X-Frame-Options SAMEORIGIN conflicts with CSP frame-ancestors 'none' | `src/middleware-security.ts:63`, `next.config.mjs:144` | Code review |
| P3-03 | HSTS not set in next.config.mjs (only in middleware) — unmatched paths lack HSTS | `next.config.mjs` headers() | Code review |
| P3-04 | `manager` role in middleware hierarchy has no DB enum equivalent | `src/middleware.ts:128-133` | Code review |
| P3-05 | Health endpoints public information disclosure (pgvector, storage type, redis, AI providers) | `src/app/api/health/ready/route.ts` | Code review |
| P3-06 | 4 test files with `@ts-nocheck` — bypasses type safety in tests | grep across src | Verified |
| P3-07 | 14 HIGH-severity npm vulnerabilities (fixes available for all except xlsx) | `npm audit` | Verified |

---

## 10. CI/CD Assessment

**Strengths:**
- PostgreSQL with pgvector service in CI ✓
- Runs: migrations, type-check, unit+integration tests, lint, build, license check, dependency audit, gitleaks ✓
- Build gate on every push to main ✓
- `npm audit --audit-level=high` in CI — **would currently fail** due to `xlsx` and other HIGH vulns

**Gaps:**
- `npm audit` step is in CI but has `--audit-level=high` — the 14 HIGH vulns should be failing CI. Either the CI step is passing `continue-on-error` implicitly, or the vulnerabilities were introduced after last CI run on main.
- No E2E test step (Cypress) in CI — only unit/integration
- Secret scanning uses gitleaks with `continue-on-error: true` — failures are non-blocking

---

## 11. Production Readiness Checklist

| Gate | Status | Notes |
|------|--------|-------|
| TypeScript: zero errors | ✅ PASS | `npx tsc --noEmit` clean |
| Test suite | ⚠️ 2 FAILING | Migration-evidence, security-headers |
| `xlsx` CVE risk decision | ❌ OPEN | No fix available; risk not formally accepted |
| Commit uncommitted migration | ❌ OPEN | `20260803150000_add_user_preferences` |
| Fix modified migration file | ❌ OPEN | `20260711153755_add_enums_ondelete` must not be retroactively changed OR must be documented |
| MFA JWT salt mismatch | ❌ OPEN | Breaks ADMIN/OPERATOR login when MFA required |
| Webhook secret empty-secret bypass | ❌ OPEN | `P1-02` |
| Seed password guard | ❌ OPEN | `P1-03` |
| Edge rate limiter Redis-backed | ⚠️ DEFERRED | Memory-only in middleware; acceptable for single-instance pilot |
| SCIM count bound | ⚠️ LOW RISK | Only exposed to SCIM key holders |
| OAuth CSRF state validation | ⚠️ MEDIUM | `/api/sales/intel/oauth/callback` |
| Strong DOWNLOAD_TOKEN_SECRET | ⚠️ LOCAL | Must rotate before production copy |
| Scanner provider configured | ⚠️ NOT SET | `SCANNER_PROVIDER=` empty in .env; required for production evidence uploads |
| MFA_REQUIRED_ROLES in production | ⚠️ CONFIG | Currently empty string = MFA disabled; must be set if MFA is a compliance requirement |

---

## 12. Verdict

**CONDITIONAL GO** — Pilot-ready after resolving P1 items

### Required Before Any Pilot Deployment:
1. **[P1-01]** Fix MFA JWT salt in `src/app/api/auth/mfa/verify/route.ts`: change `salt: cookieName` to `salt: "authjs.session-token"` (dev) / `salt: "__Secure-authjs.session-token"` (prod), matching the SAML callback and middleware.
2. **[P1-02]** Fix webhook secret bypass: return 401 (not just warn) when `webhookSecret` is empty.
3. **[P1-03]** Add seed environment guard: reject execution if `NODE_ENV === "production"` or add a `--confirm-nonprod` flag.
4. **[P1-04]** Commit `prisma/migrations/20260803150000_add_user_preferences/` and update `migration-evidence.test.ts` constant.
5. **[P1-05]** Document or revert the modified migration file `20260711153755_add_enums_ondelete`. If the fix is correct, create a NEW migration for the `DROP CONSTRAINT` behavior instead of modifying the existing one.
6. **[P0-01]** Obtain written risk acceptance for `xlsx` CVE, or replace with a patched alternative (`exceljs`, community fork).

### Should Fix Before Production Scaling:
- P2-01 through P2-11 (rate limiter, SCIM bounds, OAuth CSRF, raw SQL, CRM webhook gap)

### Fix Before Unrestricted Deployment (L6):
- All P3 items
- Full npm audit remediation
- E2E test coverage
- Pen test (per ADR-109 requirement)

---

*Report generated: 2026-08-16 | Source of truth: repository HEAD (c885f57d) + working tree evidence | No code was modified during this audit.*
