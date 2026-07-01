# Test Quality Audit

**Date:** 2026-06-04
**Auditor:** Test Quality Auditor (READ-ONLY)
**Scope:** Integration tests, security tests, tenant tests, middleware tests, MFA tests, rate limiter tests

---

## 1. Integration Tests

| Test File | Tests | Real/Mock DB | Meaningful? | False Confidence? |
|-----------|-------|-------------|-------------|-------------------|
| `cross-org-isolation.test.ts` | 13 | Mock (Prisma mock, auth mock) | ⚠️ Partial | HIGH |
| `rag-tenant-isolation.test.ts` | 11 | Mixed (real Prisma for storage, mock `$queryRawUnsafe` for search) | ⚠️ Partial | MEDIUM |
| `critical-paths.test.ts` | 5 | Real Prisma | ⚠️ Partial | HIGH |

### Detailed findings

#### `cross-org-isolation.test.ts` — 13 tests

- **HIGH FALSE CONFIDENCE — Mock-only auth layer.** The entire `@/lib/auth` module is replaced with a mock (lines 19-71). The mock's `requireOrgAccess`, `requireDecisionAccess`, `requireUserContext` are custom implementations, not the real functions. If the real `auth.ts` has a bug (e.g., wrong org comparison, missing MFA check), these tests pass anyway.
- **HIGH FALSE CONFIDENCE — Direct Prisma bypasses guards.** Tests at lines 108-115, 123-133, 135-145, 159-176, 189-203, 225-250 call `prisma.findMany`/`findUnique` directly without going through any guard. The test at line 135 even documents: "returns 404-like empty array for Org A querying Org B engagements **without guard**" — this proves the test bypasses the guard deliberately. The real API routes would have the guard enforced, so these tests don't reflect actual security behavior.
- **Positive & negative cases covered:** Each scenario tests both allowed (own org) and denied (cross-org) access. However, both paths use mocked guard functions.
- **404 vs 403 pattern tested:** Correctly tests that Prisma returns `null` (not throw) for non-existent IDs. But this only tests Prisma's behavior, not the API route's response code.
- **Missing:** Tests against real API routes (`/api/audit/engagements`), real Server Actions, or the actual middleware auth flow.

#### `rag-tenant-isolation.test.ts` — 11 tests

- **Real DB for storage.** `embedAndStore`, `prisma.documentChunk.findMany`, and `deleteMany` use real Prisma — these tests actually verify that chunks are written and scoped to the correct `organizationId`. This is meaningful.
- **HIGH FALSE CONFIDENCE — Search is fully mocked.** `searchChunks`, `retrieveContext`, and `retrieveGovernedContext` all use `queryRawSpy` which intercepts `$queryRawUnsafe` to return mock results. The actual pgvector similarity query (`ORDER BY embedding <=> ...`) is never executed. If the SQL has a bug (wrong WHERE clause, missing `organizationId` filter, wrong column), tests still pass.
- **Embedding provider is a mock.** The `MockEmbeddingProvider` returns fixed `[0.1, 0.2, 0.3, 0.4]` vectors — no actual embedding generation or vector comparison happens.
- **Storage isolation is well-tested** (tests 79-113, 226-252). The cross-query test at lines 243-251 specifically proves chunks from Org B are not returned when querying with Org A's `organizationId`.
- **Missing:** Integration test that exercises the full pipeline (embed → store → search → retrieve) with real embeddings and real pgvector queries in an org-scoped way.

#### `critical-paths.test.ts` — 5 tests

- **HIGH FALSE CONFIDENCE — "Gate Enforcement" test invents its own logic.** Lines 133-144 hardcode a transition map in the test and check `allowedTransitions["DRAFT"]?.includes("APPROVED")`. This is a tautology — it tests the test's own data, not any system gate. A real gate enforcement function is never called. This test passes even if the system has no gate enforcement at all.
- **HIGH FALSE CONFIDENCE — "Pattern Extraction Blocking" tests use local variable.** Lines 253-266 set `canExtract = decision.status === "APPROVED"` — a local check that bypasses any real pattern extraction guard. The "allows" test at line 283 does the same. These tests pass even if the system allows pattern extraction for any status.
- **Signal → Alert flow** creates signal and alert separately rather than testing that signal creation triggers alert creation. The trigger mechanism is not exercised.
- **Positive:** The Decision Pipeline test (lines 41-121) does exercise real Prisma CRUD across multiple related tables (organization → user → decision → recommendation → sector → pattern). Audit logs are created and verified.
- **Positive:** The "verifies audit logs are created" test (lines 224-228) confirms `auditLog.findMany` returns records.
- **Missing:** Tests that exercise API routes or Server Actions end-to-end. Tests call Prisma directly.

---

## 2. Security Tests

| Test File | Tests | Real/Mock DB | Meaningful? | False Confidence? |
|-----------|-------|-------------|-------------|-------------------|
| `auth-middleware.test.ts` | 61 | N/A (middleware via mocked JWT) | ✅ Good | MEDIUM |
| `cross-tenant-isolation.test.ts` | 31 | Mock auth | ⚠️ Partial | MEDIUM |
| `tenant-isolation-audit.test.ts` | 8 | N/A (unit + static) | ⚠️ Partial | MEDIUM |

### Detailed findings

#### `auth-middleware.test.ts` — 61 tests

- **Imports and tests the REAL middleware function.** This is the strongest test file in the suite. The `middleware` function from `@/middleware` is imported and called with mocked requests.
- **Good coverage of session/auth flows:** Missing session, valid session, JWT throw, API vs page routes, callback URL preservation, role passthrough for ADMIN/OPERATOR/VIEWER, MFA enforcement (enabled/disabled/unverified), MFA-exempt paths, public route bypass (26 exact paths + 9 prefix paths + 4 static assets), API 401 responses with JSON body.
- **MEDIUM FALSE CONFIDENCE — `rateLimitMiddleware` is mocked.** Line 15-17 always returns `null`. If the rate limiter has a bug that causes it to block legitimate traffic or fail open, the middleware test won't catch it.
- **MEDIUM FALSE CONFIDENCE — `setSecurityHeaders` is mocked.** Line 19-26 simulates setting `X-Response-Time` but doesn't test actual security headers (CSP, HSTS, X-Frame-Options, etc.). The test only checks that `X-Response-Time` is set. A missing CSP header would not be caught.
- **Missing edge cases:**
  - Expired JWT — test uses `getToken` mock, but never tests what happens with an expired token in the real flow
  - Malformed JWT (tampered, wrong secret) — `getToken` would return null, which is covered by "missing session" test, but the error path is different
  - No `AUTH_SECRET` set — middleware reads `process.env.AUTH_SECRET` but this path is not tested
  - XSS injection in URL path
  - Middleware with very long URL
  - POST vs GET behavior differences on login redirect

#### `cross-tenant-isolation.test.ts` — 31 tests

- **MEDIUM FALSE CONFIDENCE — `requireOrgAccess` is reimplemented in mock.** Lines 27-39 of the test file define a mock `requireOrgAccess` that reimplements the org comparison logic. If the real function has a different comparison (e.g., case sensitivity, trim), the test won't catch it.
- **Good:** `requireServerActionAccess` tests import and call the real function from `@/core/access/server-action-guard.ts` — the actual guard logic IS tested for the server action path.
- **Positive & negative tested** for: `hasRequiredRole` (all role combinations), `requireOrgAccess` (match/mismatch), `requireServerActionAccess` (cross-org allow/deny, role mapping, admin override).
- **Schema isolation tests:** Regex-based parsing of `schema.prisma` is valid for catching missing fields but doesn't test runtime isolation.
- **Middleware route protection tests:** Regex-based parsing of `middleware.ts` verifies route strings exist in the config. Valid but shallow — wouldn't catch a routing logic bug.
- **`CoreAccessControl` disabled test:** Tests that the legacy class throws an error — good for preventing regression.

#### `tenant-isolation-audit.test.ts` — 8 tests

- **Good:** Tests the REAL `assertOrganizationAccess` from `@/lib/audit/tenant-guard` and `requireRole` from `@/lib/audit/actor-context`. Both positive and negative cases.
- **MEDIUM FALSE CONFIDENCE — "tenant action gates" test uses regex.** Lines 82-91 count `requireUserContext("ADMIN")` string occurrences in `tenant-actions.ts`. This only checks for the string's presence, not that the guard actually executes. A refactor that keeps the string in comments (or dead code paths) would pass.
- **Schema field tests:** Verify `platformOrganizationId` exists on 4 models. This is positive but limited — doesn't test the runtime behavior.

---

## 3. Tenant Tests

| Test File | Tests | Positive + Negative? | Pass if guard always returns true? |
|-----------|-------|---------------------|-----------------------------------|
| `cross-tenant-isolation.test.ts` | 31 | ✅ Both tested for most scenarios | ⚠️ Partially — `requireOrgAccess` mock would still "work" |
| `cross-org-isolation.test.ts` | 13 | ✅ Both tested | ❌ YES — all guards are mocked |
| `tenant-isolation-audit.test.ts` | 8 | ✅ Both tested for `assertOrganizationAccess` | ❌ NO — uses real function |

### Can tests pass if `assertOrganizationAccess` is always `true`?

- **`tenant-isolation-audit.test.ts` tests 14-32:** NO — these test the real `assertOrganizationAccess`. If it never throws, the negative tests fail. This is resistant to that specific false confidence.
- **`cross-org-isolation.test.ts` tests 117-121, 135-145, 153-157, 182-186, 209-213:** YES — all guard calls go through the mock. If the mock returns success (it won't since each test sets up the mock), the tests would follow the mock's logic. The tests would pass even if the real `assertOrganizationAccess` always returns `true`.
- **`cross-tenant-isolation.test.ts` tests 161-183:** PARTIALLY — the `requireOrgAccess` in this file is also mocked (lines 27-39). But `requireServerActionAccess` tests (lines 201-282) use the real function which internally calls `requireUserContext` (mocked) — the org comparison happens in the real `server-action-guard.ts`. These tests would NOT pass if `assertOrganizationAccess` always returns true, because the real `requireServerActionAccess` has its own org comparison that would fail.

### Verdict on tenant tests:
The `server-action-guard.ts` tests are the strongest tenant isolation tests. The `cross-org-isolation.test.ts` tests are the weakest (full mock). Tenant test quality is **uneven**.

---

## 4. Middleware Tests

### Coverage assessment

| Area | Tested? | Notes |
|------|---------|-------|
| Valid session | ✅ | All roles, page and API routes |
| Missing session → redirect | ✅ | 307 + callbackUrl preserved |
| Missing session → API 401 | ✅ | JSON body with `UNAUTHENTICATED` code |
| JWT throws | ✅ | 307 on page, 401 on API |
| Public route bypass | ✅ | 26 exact + 9 prefix + 4 static assets |
| Role passthrough | ✅ | ADMIN, OPERATOR, VIEWER, no role |
| MFA: enabled+verified | ✅ | Passes through |
| MFA: not enabled (ADMIN) | ✅ | Redirect to /settings/mfa |
| MFA: enabled+not verified | ✅ | Redirect to /login?mfa=true |
| MFA: exempt paths | ✅ | /login, /settings/mfa, /api/auth |
| MFA: API route (no MFA) | ✅ | 403 JSON with `MFA_REQUIRED` code |
| Security headers | ⚠️ Partial | Only `X-Response-Time` checked; rest of `setSecurityHeaders` is mocked |
| Rate limit integration | ❌ Not tested | `rateLimitMiddleware` always returns null in mock |
| Expired JWT | ❌ Not tested | Would `getToken` return null or throw? |
| Malformed/tampered JWT | ❌ Not tested | `getToken` behavior on bad signature not covered |
| No AUTH_SECRET | ❌ Not tested | Middleware uses `process.env.AUTH_SECRET` unguarded |
| Long URL / injection | ❌ Not tested | Middleware processes `pathname` and `searchParams` |

### False confidence verdict

**MEDIUM.** The middleware tests are comprehensive for session and MFA flows. However:
- Rate limiter and security headers are fully mocked — real behavior unknown
- Missing auth edge cases (expired JWT, malformed JWT) 
- The repetitive public route tests (35 tests for static route checking) inflate the count without adding coverage depth

---

## 5. MFA Tests

| Test File | Tests | Real/Mock | Edge-safe module tested? | Meaningful? |
|-----------|-------|----------|------------------------|-------------|
| `mfa-l011.test.ts` | 14 | Mixed | ✅ Yes | ✅ Good |

### Detailed findings

- **Edge-safe module (`mfa-roles.ts`) IS tested.** Tests for `parseMfaRequiredRoles`, `getMFARequiredRoles`, `resetMFARequiredRolesCache`, and `isMFARequiredForRole` import from `@/lib/auth/mfa` which re-exports from `@/lib/auth/mfa-roles`. The real functions are exercised.
- **Good edge case coverage:** Empty env, undefined env, invalid roles, whitespace, case normalization, caching behavior.
- **MEDIUM FALSE CONFIDENCE — `requireMFA` is mocked.** The test mock at lines 88-101 reimplements `requireMFA` logic. The real `requireMFA` in `auth.ts` also calls `isMFARequiredForRole` and checks `mfaEnabled`/`mfaVerified`, but the test is testing the mock's version. However, the REAL `requireMFA` path IS tested indirectly through `auth-middleware.test.ts` (the middleware calls `isMFARequiredForRoleName` directly), so the enforcement path is covered at a different level.
- **Good:** `isMFARequiredError` tests the real function (imported from mock that wraps actual module).
- **Missing:** Tests for the TOTP functions in `mfa.ts` (`generateTOTPSecret`, `generateTOTPToken`, `verifyMFAToken`, `generateBackupCodes`, `hashBackupCode`, `verifyBackupCode`, `generateMFAQRCodeURI`). These are exported functions with non-trivial crypto logic, but have zero test coverage in this file.

---

## 6. Rate Limiter Tests

| Test File | Tests | Redis Lua tested? | Memory tested? | Meaningful? |
|-----------|-------|------------------|---------------|-------------|
| `rate-limiter-l014.test.ts` | 20 | ❌ Mock only | ✅ Thoroughly | ⚠️ Partial |

### Detailed findings

- **MemoryRateLimiter is well-tested** (10 tests): First request, burst limit, remaining tracking, window expiry, key reset, key isolation, dispose behavior, warning/suppress, resetAt consistency, custom windowMs.
- **HIGH FALSE CONFIDENCE — Redis Lua script never executed.** The mock at lines 13-21 simulates the Lua script's behavior in JavaScript. The actual Lua (`CHECK_AND_INCREMENT_SCRIPT` in `redis-rate-limiter.ts` lines 22-47) uses Redis commands like `INCR`, `PEXPIRE`, `PTTL` — none of these are actually called. The mock maintains a `__keyCounts` Map and replicates the expected response format. A real Lua bug (wrong return order, incorrect TTL handling, race condition on PEXPIRE after INCR) would pass the mock but fail in production.
- **Fallback test is meaningful** (line 164): Tests that when `eval` throws, `RedisRateLimiter` falls back to memory. This exercises the real error-handling path.
- **Factory tests are good** (6 tests): Environment variable configuration (memory/redis/unset/invalid), singleton caching via `getRateLimiter`.
- **Missing:** Integration test that connects to a real Redis instance and executes the actual Lua script. This is a gap for multi-instance deployment validation.

---

## Summary

| Area | Tests | Quality | False Confidence Risk |
|------|-------|---------|----------------------|
| Integration — cross-org isolation | 13 | ⚠️ Weak | HIGH — full auth mock |
| Integration — RAG tenant isolation | 11 | ⚠️ Partial | MEDIUM — search SQL mocked, storage real |
| Integration — critical paths | 5 | ⚠️ Weak | HIGH — gates tested with inline logic, not real guards |
| Middleware — auth | 61 | ✅ Good | MEDIUM — rate limiter + security headers mocked |
| Tenant — cross-tenant isolation | 31 | ⚠️ Partial | MEDIUM — requireOrgAccess mocked, server-action-guard real |
| Tenant — isolation audit | 8 | ⚠️ Partial | MEDIUM — regex-based gate counting |
| MFA — role parsing | 14 | ✅ Good | LOW — real Edge-safe module tested; requireMFA mocked but covered elsewhere |
| Rate limiter — memory/redis | 20 | ⚠️ Partial | HIGH — Redis Lua script never executed |

### False Confidence Score: HIGH

### Missing Critical Scenarios

1. **No real API route integration tests.** Every test calls functions directly (Prisma, auth guards, Server Actions) rather than exercising HTTP routes (`/api/...`). There is no test that verifies the full stack: HTTP request → middleware → route handler → auth → service → database → response.

2. **No Redis Lua script execution.** The most critical path for multi-instance rate limiting is never actually tested. A bug in the Lua script (e.g., missing `organizationId` scope, wrong TTL) only surfaces in production.

3. **No expired/malformed JWT tests.** The middleware has no tests for expired tokens, tokens signed with a different secret, or tampered tokens. While `getToken` likely handles these correctly, the middleware's behavior on unexpected errors from `getToken` is only partially covered.

4. **Zero TOTP/crypto tests.** The MFA module (`mfa.ts`) contains TOTP generation, verification, backup codes, QR URIs — non-trivial cryptographic code with zero test coverage in the reviewed files.

5. **No security header verification.** `setSecurityHeaders` is mocked — CSP, HSTS, X-Frame-Options, and other security headers are never verified in tests.

6. **Gate enforcement is not tested at the system level.** The "Gate Enforcement" and "Pattern Extraction" critical path tests invent their own logic instead of calling the actual enforcement functions. If no real enforcement exists, these tests still pass.

7. **No concurrent/race condition tests.** Tenant isolation under concurrent requests, rate limiter race conditions, and middleware race conditions are untested.

### Verdict: MAJOR GAPS for pilot confidence

**The test suite has substantial false confidence issues that reduce its value for pilot readiness assessment.**

**Strengths:**
- Middleware tests are comprehensive for session/MFA flows
- `server-action-guard.ts` tests exercise the real guard logic
- MFA role-parsing tests thoroughly cover the Edge-safe module
- Memory rate limiter is well-tested
- RAG storage isolation is tested with real Prisma

**Critical weaknesses:**
- The integration tests bypass real guards and API routes — they prove the mock works, not the system
- The "critical path" tests' gate enforcement is a tautology
- Redis Lua script is never executed in tests
- Zero TOTP/crypto tests for the MFA module
- `setSecurityHeaders` and `rateLimitMiddleware` are mocked out of the middleware tests

### Recommendations

1. **Replace mock auth in `cross-org-isolation.test.ts`** with real auth + controlled test session (or at minimum, test that the mock's behavior matches the real function).
2. **Add a real API route integration test** for at least one tenant isolation scenario (e.g., use `fetch` against a test server or route handler).
3. **Remove or fix the "Gate Enforcement" test** — it currently tests a hardcoded condition that proves nothing about the system.
4. **Add Redis integration test** (with testcontainers or a dedicated test Redis) that executes the actual Lua script.
5. **Add TOTP verification tests** for `verifyMFAToken`, `generateTOTPSecret`, and `generateBackupCodes`.
6. **Remove `setSecurityHeaders` mock** in middleware tests, or add assertions for real security headers.
7. **Add JWT edge case tests** (expired token, wrong secret) to the middleware test suite.
