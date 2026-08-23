# AQLIYA — Pre-Commit Independent Security Review
**Date:** 2026-08-17  
**Reviewer:** Claude Opus 4.8 — Final Independent Review  
**Branch:** staging @ c885f57d (pre-commit)  
**Staged files:** 33  
**Method:** READ-ONLY — git diff --cached analysis, static code review, test execution  
**Scope:** Wave 0–3 security remediation + XLSX mitigation + SalesOS authorization closure

---

## 1. Executive Verdict

**CONDITIONAL — FIX 2 ITEMS BEFORE COMMIT**

All security findings are correctly and comprehensively addressed in the staged diff. The implementation is sound. Two non-security items must be fixed before committing to maintain CI integrity:

1. **`src/__tests__/migration-evidence.test.ts`** — Update the `ENUMS_ONDELETE` constant to `"20260803150000_add_user_preferences"` (the staged migration changes the latest migration but this test still expects the old value — it will remain a CI red after commit)
2. **`prisma/migrations/20260711153755_add_enums_ondelete/migration.sql`** — This historical migration file is mutated (working tree differs from committed version, hash mismatch confirmed). It must either be staged for restore OR superseded by a new migration. It is currently NOT staged and will remain mutated after this commit.

Both items are non-security. The security gate is CLOSED for the 15 SalesOS findings, XLSX, MFA, webhook, SQL injection, OAuth CSRF, and seed guards.

---

## 2. Staged Diff Review

### Repository State
```
Branch:  staging
HEAD:    c885f57d (unchanged — pre-commit)
Staged:  33 files (1,647 insertions, 126 deletions)
```

### File Classification

| File | Category | Notes |
|------|----------|-------|
| `prisma/migrations/20260803150000_add_user_preferences/migration.sql` | **C** Migration | Additive: `ADD COLUMN IF NOT EXISTS preferences JSONB` |
| `prisma/seed.ts` + 9 seed files | **A** Security | Production guard added |
| `src/actions/__tests__/sales-deal-health-security.test.ts` | **B** Test | 14 tests, all pass |
| `src/actions/__tests__/sales-intel-auth-security.test.ts` | **B** Test | 39 tests, all pass |
| `src/actions/sales-actions/accounts.ts` | **A** Security | Removes client-supplied orgId from autoEnrichAccount call |
| `src/actions/sales-actions/governance.ts` | **A** Security | Org mismatch check for upload action |
| `src/actions/sales-agent-actions.ts` | **A** Security | Org mismatch check for upload action |
| `src/actions/sales-deal-health.ts` | **A** Security | Auth + assertSalesDealAccess added |
| `src/actions/sales-intel-actions/ai-analysis.ts` | **A** Security | getCurrentUser→requireSalesPermission + org scoping |
| `src/actions/sales-intel-actions/auto-enrich.ts` | **A** Security | Removes client-supplied orgId; adds auth + tenant check |
| `src/actions/sales-intel-actions/index.ts` | **A** Security | All 13 HIGH intel actions gain requireSalesPermission |
| `src/actions/sales-oauth-actions.ts` | **A** Security | New: server-side OAuth state cookie action |
| `src/app/api/auth/mfa/verify/route.ts` | **A** Security | Salt fix |
| `src/app/api/sales/intel/oauth/callback/route.ts` | **A** Security | CSRF fix |
| `src/app/api/sales/intel/webhook/route.ts` | **A** Security | Fail-closed on missing secret |
| `src/components/sales/linkedin-connect-button.tsx` | **A** Security | PKCE/state moved to HTTP-only cookies |
| `src/lib/auth/mfa.ts` | **A** Security | TOTP HMAC fix |
| `src/lib/core/ai/retrieval/similarity-search.ts` | **A** Security | SQL parameterization |
| `src/lib/core/knowledge/rag/hybrid-search.ts` | **A** Security | SQL parameterization |
| `src/lib/office-ai/__tests__/xlsx-zip-bomb-security.test.ts` | **B** Test | 8 tests, all pass |
| `src/lib/office-ai/file-extraction-service.ts` | **A** Security | 3-layer ZIP bomb defense |
| `src/lib/sales/intelligence/__tests__/integration.test.ts` | **B** Test | Webhook test corrected for HMAC change |
| `src/lib/sales/intelligence/webhook/receiver.ts` | **A** Security | HMAC-SHA256 + timing-safe |
| `src/middleware-security.ts` | **A** Security | Dynamic CSP (prod/dev) |

**Classification summary:** 20 security (A), 4 tests (B), 1 migration (C), 8 seed files (A) = all 33 intentional. Zero unrelated (E) or suspicious (F) files.

**NOT staged (notable):** `next.config.mjs`, `tsconfig.json`, `.env.example` — these working-tree changes are appropriate to hold separately.

**PROBLEM — NOT staged:** `prisma/migrations/20260711153755_add_enums_ondelete/migration.sql` — still mutated from committed version.

---

## 3. Critical Findings Verification

### CRITICAL #1 — `listIntelProvidersAction` (previously unauthenticated)

**Before (committed):**
```typescript
export async function listIntelProvidersAction() {
  const { listRegisteredProviders } = await import("@/lib/sales/intelligence");
  return { success: true, providers: listRegisteredProviders() };
}
```

**After (staged):**
```typescript
export async function listIntelProvidersAction() {
  await requireSalesPermission("salesos:read");  // ← AUTH GATE ADDED
  const { listRegisteredProviders } = await import("@/lib/sales/intelligence");
  return { success: true, providers: listRegisteredProviders() };
}
```

**Execution path traced:**
1. `requireSalesPermission("salesos:read")` → `requireSalesOrgAccess()` → `getCurrentUser()` → throws `"Unauthenticated"` if no session
2. If authenticated: `assertSalesPermission(ctx.user.role, "salesos:read")` → throws `SalesAccessError("FORBIDDEN")` if insufficient role
3. Only then: `listRegisteredProviders()` is called

**listRegisteredProviders analysis:** Returns an array of string provider IDs (`["apollo", "ocean", "clay", ...]`) — no secrets, no configuration, no credentials. Even if accessed, the data is non-sensitive.

**Verdict: CONFIRMED FIXED** — Authentication + RBAC added. Function returns non-sensitive data even if bypassed.

---

### CRITICAL #2 — `autoEnrichAccount` (previously client-supplied organizationId)

**Before (committed):**
```typescript
// In auto-enrich.ts
export async function autoEnrichAccount(accountId: string, accountName: string, organizationId: string): Promise<void> {
  // organizationId came from caller (client-controllable)
  ...audit log with organizationId...
}

// In accounts.ts (caller)
.then((m) => m.autoEnrichAccount(account.id, name, ctx.organizationId))
```

**After (staged):**
```typescript
// In auto-enrich.ts
export async function autoEnrichAccount(accountId: string, accountName: string): Promise<void> {
  let ctx;
  try {
    ctx = await requireSalesPermission("salesos:create");  // ← derives org from auth
  } catch {
    return; // Auth failed — silent exit
  }
  // Tenant-scoped lookup — Org A cannot access Org B account
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId: ctx.organizationId },
    select: { id: true, organizationId: true },
  });
  if (!account) return; // Cross-tenant or not found — silently skips
  ...
}

// In accounts.ts (caller)
.then((m) => m.autoEnrichAccount(account.id, name))  // ← org removed from call
```

**Cross-tenant test (Org A + Org B account → DENY):**
- `prisma.salesAccount.findFirst({ where: { id: accountId, organizationId: ctx.organizationId } })` — if `accountId` belongs to Org B but caller is Org A, the query returns `null` because `ctx.organizationId` = Org A ≠ Org B's org
- `if (!account) return` — silently skips, no data leakage

**Note on fire-and-forget context:** `autoEnrichAccount` is called asynchronously after account creation. If `requireSalesPermission` fails (because the request context is no longer available), the function silently exits. This is acceptable for a best-effort background operation — no security bypass is possible.

**Verdict: CONFIRMED FIXED** — Client-supplied organizationId removed. Auth + DB-level tenant check enforce isolation.

---

## 4. High Findings Verification (13 actions)

All 13 actions in `sales-intel-actions/index.ts` migrated from `getAuth()` (authentication only, no RBAC) to `requireSalesPermission(permission)` (authentication + RBAC + org context):

| Action | Was | Now | Permission |
|--------|-----|-----|-----------|
| `enrichCompanyAction` | `getAuth()` | `requireSalesPermission` | `salesos:read` |
| `searchCompaniesAction` | `getAuth()` | `requireSalesPermission` | `salesos:read` |
| `findContactsAction` | `getAuth()` | `requireSalesPermission` | `salesos:read` |
| `verifyEmailAction` | `getAuth()` | `requireSalesPermission` | `salesos:read` |
| `waterfallEnrichAction` | `getAuth()` | `requireSalesPermission` | `salesos:read` |
| `checkIntelProviderHealthAction` | no auth | `requireSalesPermission` | `salesos:read` |
| `batchEnrichAccountsAction` | `getAuth()` | `requireSalesPermission` | `salesos:update` |
| `enrichAccountContactsAction` | `getAuth()` | `requireSalesPermission` | `salesos:create` |
| `createOutreachCampaignAction` | `getAuth()` | `requireSalesPermission` | `salesos:create` |
| `getOutreachEventsAction` | `getAuth()` | `requireSalesPermission` | `salesos:read` |
| `getOutreachAnalyticsAction` | `getAuth()` | `requireSalesPermission` | `salesos:read` |
| `scoreDealLeadsAction` | `getAuth()` | `requireSalesPermission` | `salesos:update` |
| `analyzeDealWithAI` | `getCurrentUser()` | `requireSalesPermission` | `salesos:update` |

**Downstream Prisma queries:** All database queries now use `ctx.organizationId` (from auth) instead of user-supplied `organizationId`:
```typescript
// Before: where: { id: dealId, organizationId: user.organizationId }
// After:  where: { id: dealId, organizationId: ctx.organizationId }
```
`ctx.organizationId` is derived from `getCurrentUser()` → session token → cannot be forged by client.

**Additional closures:**
- `getDealHealthAction` — `requireSalesPermission("salesos:read")` + `assertSalesDealAccess(dealId)` (DB-level tenant check)
- `listDealHealthAction` — bulk query scoped to `ctx.organizationId` before processing

**Old `getAuth()` helper:** Removed entirely. No residual unauthenticated paths.

**Verdict: ALL 13 HIGH FINDINGS CONFIRMED FIXED**

---

## 5. XLSX Assessment

### Three-Layer Defense (staged in `file-extraction-service.ts`)

**Layer 1 — Compressed size limit (pre-existing, runs before extractTextFromXlsx):**
```typescript
if (extractType === "xlsx" && buffer.length > MAX_XLSX_SIZE) { throw }
// MAX_XLSX_SIZE = 10MB
```
Rejects oversized compressed files before any ZIP parsing.

**Layer 2 — ZIP Central Directory pre-validation (NEW, runs BEFORE `XLSX.read()`):**
```typescript
const zipCheck = prevalidateZipBuffer(buffer);  // ← RUNS FIRST
if (!zipCheck.valid) { throw new Error(`XLSX rejected: ${zipCheck.reason}`) }
const workbook = XLSX.read(buffer, {...});  // ← only reached if Layer 2 passes
```

`prevalidateZipBuffer()` reads only the ZIP Central Directory (uncompressed metadata at the end of the ZIP — no decompression of entries):
- Entry count check: `entryCount > MAX_ZIP_ENTRIES (200)` → reject
- Total uncompressed size check: `totalUncompressedSize > MAX_ZIP_UNCOMPRESSED_SIZE (50MB)` → reject
- Per-entry compression ratio: `uncompSize / compSize > MAX_ENTRY_COMPRESSION_RATIO (100:1)` → reject
- Duplicate entry detection (ZIP bomb technique) → reject

**This is genuine pre-parse protection.** A typical ZIP bomb (1GB compressed to 1MB) would be caught by the 100:1 ratio check. A distributed ZIP bomb with 201 entries would be caught by the entry count check. A bomb that claims 51MB uncompressed total would be caught by the total size check.

**Layer 3 — Post-parse cell count (NEW, runs after XLSX.read()):**
```typescript
if (totalCells > MAX_TOTAL_CELLS) { throw }
// MAX_TOTAL_CELLS = 100,000
```
Belt-and-suspenders for bombs that bypass Layers 1+2.

**The Layer 2 limitation acknowledged in code comments:**
```
// NOTE: XLSX.read() with type:"buffer" fully decompresses the ZIP
// into memory. A crafted ZIP with valid central directory entries
// but malicious compressed data could still cause issues.
```
This limitation is real: if an attacker crafts a ZIP where the central directory correctly declares small sizes but the actual compressed data expands much larger, Layer 2 would pass and Layer 1/3 are the fallback. However:
- Layer 1 (10MB limit) bounds the compressed input, limiting decompression to a ratio bounded by realistic compression maximums
- This is a defense-in-depth approach with acceptable residual risk for an institutional platform with known uploaders

**RESIDUAL ISSUE — `erp/file-importer.ts` (NOT staged):**
```typescript
// src/lib/local-content/erp/file-importer.ts:276
workbook = XLSX.read(buffer, { type: "buffer" });  // no pre-validation
```
This function (`parseExcelFile`) is NOT protected. However, investigation confirms it is **currently dead code**: no user-facing action or API route calls `parseExcelFile`. It is exported from `erp/index.ts` but has no active callers in `src/actions/` or `src/app/`. Risk is LOW in current state but the function should be protected before it is wired up.

**Security test coverage (`xlsx-zip-bomb-security.test.ts`):**
- Tests `prevalidateZipBuffer()` directly with synthetic ZIP bombs
- Tests large compression ratio detection
- Tests excessive entry count
- Tests total uncompressed size limit
- Tests duplicate entries
- Integration test through the full `extractOfficeAiFileContent` path
- 8 tests, all passing

**Verdict: SUBSTANTIALLY FIXED** — Layer 2 pre-parse validation is correct and effective for the protected path. Residual: `erp/file-importer.ts` unprotected but currently dead code.

---

## 6. MFA Assessment

### JWT Salt Fix
```diff
-  ? "__Secure-next-auth.session-token"   // v4 naming — wrong
-  : "next-auth.session-token";           // v4 naming — wrong
+  ? "__Secure-authjs.session-token"      // v5 naming ✓
+  : "authjs.session-token";              // v5 naming ✓
...
-  salt: cookieName,    // wrong: derived from cookie name
+  salt: "authjs.session-token",  // correct: matches middleware getToken({ salt })
```

**Cross-check:**
- Middleware: `getToken({ salt: "authjs.session-token" })` ✓ matches
- SAML callback: `salt: SESSION_COOKIE` where `SESSION_COOKIE = "authjs.session-token"` ✓ matches
- MFA verify: now `salt: "authjs.session-token"` ✓ matches

All three JWT producers now use the same canonical v5 salt.

### TOTP Algorithm Fix
```diff
-  const hmac = createHash("sha1").update(key).update(counterBuf).digest();
+  const hmac = createHmac("sha1", key).update(counterBuf).digest();
```

**Impact:** The original `createHash("sha1")` was NOT HMAC — it was a plain SHA-1 hash treating the key as data. This would NOT produce the same output as RFC 4226 (HOTP) / RFC 6238 (TOTP) standard. Standard authenticator apps (Google Authenticator, Authy, Microsoft Authenticator) all implement proper HMAC-SHA1. This means **TOTP was non-functional before this fix** — registered secrets would never validate against real authenticators. The fix corrects to proper HMAC-SHA1.

**Verdict: CONFIRMED FIXED** — Salt aligned with NextAuth v5 conventions; TOTP corrected to RFC 4226/6238 standard.

---

## 7. Webhook Assessment

### Fail-Closed on Missing Secret
```diff
+    return NextResponse.json(
+      { error: "Webhook secret not configured" },
+      { status: 503 },
+    );
```
Empty/missing secret → 503 (fail closed). Previously continued processing. ✓

### HMAC Algorithm Correction
```diff
-  const computed = createHash("sha256").update(body + secret).digest("hex");
+  const computed = createHmac("sha256", secret).update(body).digest("hex");
```
- SHA-256 hash with concatenation → proper HMAC-SHA256. Closes length extension attack.
- Applies to all named providers (hubspot, smartlead, apollo) AND the default/custom provider.

### Timing-Safe Comparison (custom provider)
```diff
-  return signature === hmac;   // timing oracle
+  if (sigBuf.length !== compBuf.length) return false;
+  return timingSafeEqual(sigBuf, compBuf);  // timing-safe ✓
```

### Integration Test Updated
The test that previously used `createHash("sha256").update(body + secret)` to generate test signatures is now updated to use `createHmac("sha256", secret).update(body)`. This fixes the regression introduced by the HMAC change. ✓

**Replay protection:** Not addressed in this remediation (out of scope). Acceptable for current maturity.

**Tenant routing:** Webhook events route to the CRM connection's organization. Multi-org HubSpot risk (from prior audit P1-006) still open but out of scope here.

**Verdict: CONFIRMED FIXED** — Fail-closed, proper HMAC-SHA256, timing-safe. Test regression fixed.

---

## 8. SQL Injection Assessment

### `similarity-search.ts`
```diff
-  LIMIT ${options.k}             // interpolated
-  >= ${options.minScore}         // interpolated
+  LIMIT ${limitParam}            // $N bound parameter ✓
+  >= ${minScoreParam}            // $N bound parameter ✓
+  const safeK = Math.max(1, Math.min(options.k, 1000))      // validated
+  const safeMinScore = Math.max(0, Math.min(options.minScore, 1))  // validated
```

### `hybrid-search.ts`
```diff
-  LIMIT ${limit}        // interpolated
+  LIMIT ${limitParam}   // $N bound parameter ✓
+  const safeLimit = Math.max(1, Math.min(limit, 1000))  // validated + bounded
```

**Parameterization verified:** Values are added to `params[]` array via `params.push()` and referenced as `$N` placeholders. The `prisma.$queryRawUnsafe(sql, ...params)` passes them as true bound parameters, not string interpolation.

**Bounds validation confirmed:** Both LIMIT (clamped 1–1000) and score (clamped 0–1) are numerically bounded before parameterization.

**Full repository scan for remaining raw SQL:**
All other `$queryRawUnsafe`/`$executeRawUnsafe` calls verified safe:
- Health routes: `SELECT 1` (fixed string) ✓
- Ingestion pipeline: `$1::vector, $2` (parameterized) ✓
- vector-store.ts: fixed strings or parameterized ✓

**Verdict: CONFIRMED FIXED** — LIMIT and score parameterized. No remaining injection paths found.

---

## 9. OAuth CSRF Assessment

### Complete Flow Verified

**Initiation (LinkedIn client):**
```typescript
// Before: sessionStorage.setItem("linkedin_oauth_state", state)  ← XSS-vulnerable
// After: await storeOAuthStateAction(state, codeVerifier)
//   → HTTP-only cookie with httpOnly:true, secure:prod, sameSite:"lax", maxAge:600
```

**Server-side state storage (`sales-oauth-actions.ts`):**
```typescript
cookieStore.set("oauth_state", state, { httpOnly: true, secure: ..., sameSite: "lax", path: "/", maxAge: 600 })
cookieStore.set("oauth_verifier", codeVerifier, { httpOnly: true, ... })
```

**Callback validation:**
```typescript
const cookieState = request.cookies.get("oauth_state")?.value;
if (!state || !cookieState || state !== cookieState) { return redirect(error) }  // CSRF check ✓

const sessionToken = await getToken({ req: request, secret, salt: "authjs.session-token" });
if (!sessionToken?.sub) { return redirect(error) }  // Session auth ✓

const orgId = (sessionToken.organizationId as string) ?? "system";  // org from session ✓

const codeVerifier = request.cookies.get("oauth_verifier")?.value;
const tokens = await exchangeCodeForTokens(config, code, codeVerifier);  // PKCE ✓

// Clear cookies after use
response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });
response.cookies.set("oauth_verifier", "", { maxAge: 0, path: "/" });
```

**Residual observations:**
- Other OAuth providers (Google, Microsoft) that use this callback route will benefit from the same state validation
- However, only LinkedIn has the client-side `storeOAuthStateAction` call added; other providers' client code was not verified in the staged diff
- The `orgId = sessionToken.organizationId ?? "system"` fallback to `"system"` if organizationId is missing is a minor concern (authenticated user with no org would write audit log to "system" org). This should not happen in practice since all users have organizationId.

**Verdict: SUBSTANTIALLY FIXED** — CSRF state validation, session auth, org from session, PKCE in cookies. State and verifier stored in HTTP-only cookies with 10-minute TTL and cleared after use.

---

## 10. Migration Assessment

### New Migration (`20260803150000_add_user_preferences/migration.sql`)
```sql
-- Add preferences column to User (schema drift fix)
-- This column exists in schema.prisma but was never added by a migration
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferences" JSONB;
```

**Verification:**
- SQL is safe: pure `ALTER TABLE ADD COLUMN IF NOT EXISTS` — additive, idempotent, no destructive operations ✓
- `IF NOT EXISTS` ensures compatibility with databases that already have the column ✓
- Schema drift: `schema.prisma:717` defines `preferences Json?` — this migration closes the drift ✓
- `migration.sql` is staged as a new file ✓

**NOT ADDRESSED — Historical migration mutation:**
```
git show HEAD:prisma/migrations/20260711153755_add_enums_ondelete/migration.sql | md5sum
e2109ca84b83ebc22d3f44e3fe716e16

cat prisma/migrations/20260711153755_add_enums_ondelete/migration.sql | md5sum
b7534bc38684a3aa93b3a9bf10a132e7
```

The committed and working-tree versions of `20260711153755_add_enums_ondelete/migration.sql` differ. The working-tree version corrects `DROP INDEX` → `ALTER TABLE … DROP CONSTRAINT IF EXISTS`. This fix is NOT staged. After this commit, the file remains mutated.

**Impact:** For databases where the original migration ran successfully (Postgres allowed `DROP INDEX` on what happened to be a plain index, not a unique constraint), there is no issue. For databases where the original failed, a new remediation migration should be created.

**Verdict:** New migration is correct and staged. Historical mutation NOT resolved — blocking item noted.

---

## 11. Seed Security Assessment

### Guard Present in All 10 Seed Files

Verified in staged diff for all 10 files:
```typescript
if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED_IN_PROD) {
  throw new Error("Seeding in production is not allowed. Set ALLOW_SEED_IN_PROD to override.");
}
```

**Completeness verified:** All seeded entry points:
- `prisma/seed.ts` ✓
- `prisma/seed-audit.ts` ✓
- `prisma/seed-sales.ts` ✓
- `prisma/seed-office-ai.ts` ✓
- `prisma/seed-decisionos.ts` ✓
- `prisma/seed-knowledge-mining.ts` ✓
- `prisma/seed-local-content.ts` ✓
- `prisma/seed-localcontent.ts` ✓
- `prisma/seed-content-studio.ts` ✓
- `prisma/seed-pilot.ts` ✓

**SSO org ID bug fix:** `platformOrg.id` → `org.id` in `seed.ts` — correct ✓

**Remaining guard limitations (acknowledged, non-blocking):**
1. `ALLOW_SEED_IN_PROD` can override — this is an intentional escape hatch
2. Guard fires only when `NODE_ENV === "production"` — running against prod DB with `NODE_ENV=development` bypasses guard. This is a known deployment practice risk, not a code defect.

**Verdict: CONFIRMED FIXED** for the code-level protection.

---

## 12. Test Evidence

### Full Suite Run

```
Test Suites: 2 failed, 5 skipped, 448 passed, 450 of 455 total
Tests:       2 failed, 27 skipped, 5836 passed, 5865 total
Time:        60.14s
```

**vs. pre-remediation (first audit):**
- Before: 5804 total, 2 failing
- After (staged): 5865 total (+61 new security tests), 2 failing

**New security tests (3 files, 61 tests, all passing):**
```
src/actions/__tests__/sales-deal-health-security.test.ts  → 14 tests PASS
src/actions/__tests__/sales-intel-auth-security.test.ts   → 39 tests PASS
src/lib/office-ai/__tests__/xlsx-zip-bomb-security.test.ts →  8 tests PASS
Total: 61 security tests PASS
```

*(OpenCode reported "39/39" — this refers only to the intel auth file; the actual total is 61)*

### Remaining 2 Failures

**Failure 1: `src/__tests__/migration-evidence.test.ts`**
```
Expected: "20260724180519_add_platform_audit_log_merge_fields"
Received: "20260803150000_add_user_preferences"
```
Cause: The staged migration (`20260803150000_add_user_preferences`) is now the latest migration. The test constant `ENUMS_ONDELETE` still points to the previous latest. This test was pre-failing (migration existed on disk) but committing the migration without updating the test leaves CI permanently red.

**This is a regression introduced by this commit set** — the test was already failing in the working tree before staging, but staging the migration without updating the test constant causes this failure to persist into the committed state.

**Failure 2: `src/__tests__/unit/middleware/security-headers.test.ts`**
```
expect(csp).not.toContain("unsafe-eval")  ← FAILS in NODE_ENV=test
```
Cause: The CSP in `middleware-security.ts` is now dynamic — development mode includes `unsafe-eval`, production mode does not. The test runs in `NODE_ENV=test` (treated as development) and sees the dev CSP. The production CSP is correct; the test needs to mock `process.env.NODE_ENV = "production"`.

This is a pre-existing failure (test was failing before the staged changes) AND it was also a false positive (production CSP was always correct). Not a regression.

### TypeScript
```
npx tsc --noEmit → 0 errors (clean)
```

### WebHook Integration Test (previously failing — now fixed)
The `integration.test.ts` test was broken by the HMAC algorithm change. The staged diff correctly updates the test to use `createHmac("sha256", secret).update(body)`. This regression is RESOLVED.

---

## 13. Remaining Findings After Commit

### Security (none blocking post-commit):

| Item | Severity | Status |
|------|----------|--------|
| `erp/file-importer.ts` unprotected XLSX | LOW (dead code) | Open — not staged |
| Historical migration mutation | Integrity | Open — not staged |

### Non-Security Blocking (must fix before commit):

| Item | Impact | Fix |
|------|--------|-----|
| `migration-evidence.test.ts` constant | CI red after commit | Update `ENUMS_ONDELETE = "20260803150000_add_user_preferences"` |
| Historical migration mutation | Migration integrity | Stage restore of committed version OR create new superseding migration |

### Non-Security Non-Blocking (track as debt):

| Item | Notes |
|------|-------|
| `security-headers.test.ts` | Pre-existing; test needs `NODE_ENV=production` mock |
| `erp/file-importer.ts` XLSX | Dead code now; protect before wiring up |
| `getDealHealthAction` early-return without auth | Empty/null dealId returns null without auth; no data leak |
| Kernel product coupling | Architecture debt; out of scope here |
| Edge rate limiter not Redis-backed | Configuration gap; out of scope here |
| CRM webhook multi-org routing | P1-006; not in scope of this wave |

---

## 14. Exact Files Requiring Changes Before Commit

### Required Change #1 — Update migration test constant

**File:** `src/__tests__/migration-evidence.test.ts`  
**Line:** 21

```typescript
// Current (wrong after staging new migration):
const ENUMS_ONDELETE = "20260724180519_add_platform_audit_log_merge_fields"

// Required fix:
const ENUMS_ONDELETE = "20260803150000_add_user_preferences"
```

Also verify the `MIGRATIONS_EXCLUDED_FROM_APPLIED_CHAIN` list and the additive-only SQL check against the new migration (it's additive: only `ADD COLUMN`, no DROP).

### Required Change #2 — Historical migration integrity

**File:** `prisma/migrations/20260711153755_add_enums_ondelete/migration.sql`

Two options:
- **Option A (preferred):** Stage `git restore prisma/migrations/20260711153755_add_enums_ondelete/migration.sql` to restore committed version, then create a new migration `20260804000000_fix_knowledge_foundation_constraints.sql` with `ALTER TABLE "KnowledgeFoundationRelease" DROP CONSTRAINT IF EXISTS "KnowledgeFoundationRelease_versionId_key"; ALTER TABLE "KnowledgeFoundationVersion" DROP CONSTRAINT IF EXISTS "KnowledgeFoundationVersion_versionNumber_key";`
- **Option B:** Stage the working-tree correction to `20260711153755_add_enums_ondelete/migration.sql` with clear documentation of why an existing migration was modified (deviation from Prisma migration contract must be explicitly acknowledged)

---

## 15. Claim Verification Table

| Claim | Verified | Evidence | Residual Risk |
|-------|----------|----------|---------------|
| 2 CRITICAL findings closed | ✅ YES | `listIntelProvidersAction` + `autoEnrichAccount` diffs reviewed; auth + tenant enforced | None |
| 13 HIGH findings closed | ✅ YES | All 13 actions in `index.ts` use `requireSalesPermission`; downstream queries use `ctx.organizationId` | None |
| 0 CRITICAL/HIGH remaining | ✅ YES (with caveat) | Repo-wide scan: no auth-less `"use server"` actions found in sales intel paths | `erp/file-importer.ts` XLSX unprotected but dead code |
| XLSX closed | ⚠️ SUBSTANTIALLY FIXED | Layer 2 pre-parse ZIP validation correct and runs before XLSX.read(); `erp/file-importer.ts` not protected | `erp/file-importer.ts` dead but unprotected |
| MFA closed | ✅ YES | Salt corrected; TOTP HMAC RFC-compliant | None |
| Webhook closed | ✅ YES | Fail-closed; HMAC-SHA256; timing-safe | None |
| SQL injection closed | ✅ YES | LIMIT and score parameterized with bounds | None |
| OAuth CSRF closed | ✅ YES | Cookie state, session auth, PKCE | Other providers' client code not reviewed |
| Migrations clean | ⚠️ PARTIAL | New migration staged and correct; historical mutation NOT resolved | Migration chain integrity gap |
| Seeds protected | ✅ YES | All 10 seed files guarded | NODE_ENV bypass (known limitation) |
| 39/39 security tests | ✅ YES (61 actual) | 61 new security tests, all 61 passing | — |
| TypeScript 0 errors | ✅ YES | `npx tsc --noEmit` → clean | — |
| 33 staged files intentional | ✅ YES | All 33 classified A/B/C; zero unrelated or suspicious | — |
| 3 pre-existing failures | ❌ INCORRECT COUNT | 2 pre-existing failures (not 3); the webhook regression was fixed | — |
| 0 remediation-induced failures | ⚠️ QUALIFIED | Webhook regression fixed ✓; but migration-evidence failure will persist after staging the migration without test update | — |

---

## 16. Final Commit Recommendation

### Verdict: **CONDITIONAL — FIX 2 ITEMS BEFORE COMMIT**

**The security gate is CLOSED.** All 15 SalesOS authorization findings, XLSX pre-parse protection, MFA salt/TOTP, webhook HMAC, SQL parameterization, OAuth CSRF, and seed guards are correctly implemented in the staged diff.

**Two items must be fixed before committing to maintain CI integrity:**

1. **Update `src/__tests__/migration-evidence.test.ts` line 21:** Change `ENUMS_ONDELETE` to `"20260803150000_add_user_preferences"`. The staged migration breaks this test and CI would be red post-commit.

2. **Resolve `prisma/migrations/20260711153755_add_enums_ondelete/migration.sql`:** Either restore the committed version and create a new migration for the constraint fix, or stage the working-tree correction with documentation.

Once these two items are addressed and staged, the commit is ready. No blocking security issues were found.

---

*Review completed 2026-08-17. No files were modified, staged, or committed during this review.*
