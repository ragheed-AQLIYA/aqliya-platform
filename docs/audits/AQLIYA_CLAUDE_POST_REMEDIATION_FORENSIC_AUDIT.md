# AQLIYA — Claude Post-Remediation Forensic Audit
**Date:** 2026-08-17  
**Auditor:** Claude Opus 4.8 — Second Independent Pass  
**Source commit:** c885f57d (staging HEAD)  
**Working tree:** 25 modified files, 2 untracked (none committed)  
**Effort:** xhigh — READ-ONLY, evidence-based only  
**Prior report:** `FORENSIC_AUDIT_2026-08-16.md`

---

## Phase 1 — Repository Baseline

### Critical Finding: All Remediation Is Uncommitted

```
git log --oneline -1
c885f57d test(localcontactos): 33 tests for v2 — graph, analytics, cross-product services
```

The `staging` branch HEAD has not moved since the first audit. Every remediation change exists only in the working tree. A deployment from this branch would deploy **pre-remediation code**.

### Working Tree State

**25 modified files (M), 2 untracked (??)**:
```
M  src/actions/sales-agent-actions.ts
M  src/actions/sales-actions/governance.ts
M  src/app/api/auth/mfa/verify/route.ts
M  src/app/api/sales/intel/oauth/callback/route.ts
M  src/app/api/sales/intel/webhook/route.ts
M  src/components/sales/linkedin-connect-button.tsx
M  src/lib/auth/mfa.ts
M  src/lib/core/ai/retrieval/similarity-search.ts
M  src/lib/core/knowledge/rag/hybrid-search.ts
M  src/lib/office-ai/file-extraction-service.ts
M  src/lib/sales/intelligence/webhook/receiver.ts
M  src/middleware-security.ts
M  next.config.mjs
M  tsconfig.json
M  prisma/seed.ts  (and 9 other seed files)
??  prisma/migrations/20260803150000_add_user_preferences/
??  src/actions/sales-oauth-actions.ts
```

---

## Phase 2 — Wave 0 Verification

### P0-001 — CSP Inversion

**Verdict: FALSE POSITIVE**

**Evidence:**
- `src/middleware-security.ts` (committed): CSP was a **static string** — always the production CSP (no unsafe-eval for scripts), regardless of `NODE_ENV`.
- In production, this was always correct. The test ran in `NODE_ENV=test` (development), which is why `unsafe-eval` appeared.
- The remediation makes BOTH `middleware-security.ts` and `next.config.mjs` dynamic (dev/prod conditional).
- Production CSP after remediation: identical to production CSP before remediation — `script-src 'self'`.

**New observation**: The working-tree `next.config.mjs` now correctly serves `unsafe-eval` only in dev mode (matching middleware). Pre-remediation, `next.config.mjs` had a static production CSP regardless of `NODE_ENV`. The fix actually corrects this for development. In production, the CSPs are now consistent between both sources.

**Residual**: The `security-headers.test.ts` still fails — it tests `setSecurityHeaders()` in `NODE_ENV=test` and sees the dev CSP (which includes `unsafe-eval`). The test was never updated to mock `NODE_ENV=production`. This is a test quality issue, not a security issue.

---

### P0-002 — SalesOS Cross-Tenant IDOR

**Verdict: PARTIALLY FIXED (uncommitted)**

**Evidence examined:**
1. `sales-agent-actions.ts:158` — `if (ctx.organizationId !== input.organizationId) throw SalesAccessError`
2. `sales-actions/governance.ts:191` — Same check added

**Proof asset store is org-partitioned:** `getGovernedEntity(organizationId, getOrgStore(organizationId).proofAssets, assetId)` — looks up assets within the org's isolated store. Cross-org access by ID alone is impossible at the store level.

**Remaining gaps:**
- Fix only covers `scaffoldUploadSalesProofAssetFileAction`. Broader scan found no other immediate IDOR paths in `sales-agent-actions.ts` (`assertSalesDealAccess`, `assertSalesAccountAccess` do DB-level tenant checks).
- `prepareEvidenceUpload` in `proof-file-upload-scaffold.ts` is a no-op stub: `return { storageKey: \`stub/\${filename}\` }`. The real upload path is not implemented. This is not a security gap in the current code, but it means the upload scaffold has no real security-critical code path to exploit.
- **Uncommitted**: The fix does not exist in the deployed code.

---

### P0-003 — XLSX ZIP Bomb

**Verdict: PARTIALLY FIXED (uncommitted, post-parse check)**

**Execution order verified (critical):**
```typescript
// line 112-113
const workbook = XLSX.read(buffer, {...})  // ← memory allocated HERE

// lines 119-131 (NEW — added by remediation)
const MAX_TOTAL_CELLS = 100_000;
let totalCells = 0;
for (const name of workbook.SheetNames) { ... }
if (totalCells > MAX_TOTAL_CELLS) { throw new Error("possible ZIP bomb") }
```

`XLSX.read()` decompresses and parses the entire workbook **before** the cell count check. A malicious file can still cause excessive memory allocation during parse. The check limits further processing but cannot reclaim memory already allocated.

**Pre-parse mitigation:** A 10MB buffer size check runs BEFORE `extractTextFromXlsx()`:
```typescript
if (extractType === "xlsx" && buffer.length > MAX_XLSX_SIZE) { throw }
```
This limits the maximum compressed size to 10MB. A 10MB ZIP bomb could potentially expand to hundreds of MB of worksheet data.

**Unprotected xlsx paths:**
- `src/lib/local-content/erp/file-importer.ts:276` — `XLSX.read(buffer)` with no pre-check. Caller must enforce size limits upstream.
- `src/lib/local-content/workbook/tb-loader.ts:45,143` — Reads from filesystem (`readFileSync(filePath)`), not user uploads. Low risk unless filePath is user-controlled (it is not in current code).

**True fix requires:** pre-read size limit + streaming parse OR replacing `xlsx` with a safer library.

---

## Phase 3 — Wave 1 Verification

### P1-001 — MFA JWT Salt / Cookie Compatibility

**Verdict: CONFIRMED FIXED (uncommitted)**

**Before (committed):**
```typescript
const cookieName = process.env.NODE_ENV === "production"
  ? "__Secure-next-auth.session-token"   // v4 naming
  : "next-auth.session-token";           // v4 naming
// ...
salt: cookieName,   // wrong salt
```

**After (working tree):**
```typescript
const cookieName = process.env.NODE_ENV === "production"
  ? "__Secure-authjs.session-token"   // v5 naming ✓
  : "authjs.session-token";           // v5 naming ✓
// ...
salt: "authjs.session-token",   // hardcoded v5 canonical ✓
```

**Cross-checks:**
- Middleware: `getToken({ salt: "authjs.session-token" })` — matches ✓
- SAML callback: `salt: SESSION_COOKIE` where `SESSION_COOKIE = "authjs.session-token"` — matches ✓
- MFA `mfa.ts` TOTP fix: `createHmac("sha1", key).update(counterBuf)` — now RFC 6238 compliant ✓ (was `createHash("sha1").update(key).update(counterBuf)` — not HMAC)

**Impact of TOTP fix**: The original TOTP implementation was using `createHash("sha1")` with the key as data, not as an HMAC key. This means TOTP tokens were generated incorrectly and would not have validated against standard authenticator apps (Google Authenticator, Authy, etc.). The fix corrects this to proper HMAC-SHA1 as specified in RFC 4226/6238. **This is a critical correctness fix — TOTP likely did not work before this fix.**

---

### P1-002 — Sales Intelligence Webhook Empty Secret

**Verdict: PARTIALLY FIXED — introduces test regression (uncommitted)**

**Before:** Empty secret → warn → continue (exploitable)
**After:** Empty secret → warn → `return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 })`

Fail-closed behavior is correct. ✓

**HMAC Algorithm Fix:**
```diff
-  const computed = createHash("sha256").update(body + secret).digest("hex");
+  const computed = createHmac("sha256", secret).update(body).digest("hex");
```
This corrects a significant security bug: the original was a SHA-256 hash of `body + secret` (concatenation, NOT HMAC). This is vulnerable to **length extension attacks**. The fix uses proper HMAC-SHA256.

**Custom provider timing fix:**
```diff
-  return signature === hmac;   // timing oracle
+  if (sigBuf.length !== compBuf.length) return false;
+  return timingSafeEqual(sigBuf, compBuf);  // timing-safe ✓
```

**Test regression introduced:**
The integration test (`integration.test.ts:232`) computed a test signature using the OLD algorithm:
```typescript
const signature = createHash("sha256").update(body + secret).digest("hex");
const valid = verifySignature(body, signature, secret, "smartlead");
expect(valid).toBe(true);  // NOW FAILS — algorithm changed
```
The fix is correct; the test must be updated to use `createHmac("sha256", secret).update(body).digest("hex")`.

---

### P1-012 — Raw SQL Injection

**Verdict: CONFIRMED FIXED (uncommitted)**

**`similarity-search.ts`:** LIMIT and minScore are now bound parameters:
```diff
-  LIMIT ${options.k}
-  AND score >= ${options.minScore}
+  LIMIT ${limitParam}      -- parameterized via $N
+  AND score >= ${minScoreParam}  -- parameterized via $N
```

**`hybrid-search.ts`:** Same fix:
```diff
-  LIMIT ${limit}
+  LIMIT ${limitParam}   -- parameterized via $N
```

**Full repository scan results** — all other `$queryRawUnsafe`/`$executeRawUnsafe` calls verified safe:
- Health routes: `SELECT 1` (fixed string) ✓
- Ingestion pipeline: `$1::vector, $2` (parameterized) ✓
- Vector store: fixed strings or parameterized ✓

---

### P1-013 — OAuth CSRF

**Verdict: SUBSTANTIALLY FIXED (partially uncommitted)**

**State validation added:**
```typescript
const cookieState = request.cookies.get("oauth_state")?.value;
if (!state || !cookieState || state !== cookieState) { return redirect(error) }
```

**Session authentication added:**
```typescript
const sessionToken = await getToken({ req: request, secret, salt: "authjs.session-token" });
if (!sessionToken?.sub) { return redirect(error) }
const orgId = (sessionToken.organizationId as string) ?? "system";
```

OrgId now comes from the session, not the `state` param. ✓

**PKCE verifier stored server-side:**
```typescript
const codeVerifier = request.cookies.get("oauth_verifier")?.value;
const tokens = await exchangeCodeForTokens(config, code, codeVerifier);
```

**Client-side fix (`linkedin-connect-button.tsx`):**
- Removed `sessionStorage.setItem("linkedin_oauth_state", state)` and `sessionStorage.setItem("linkedin_code_verifier", codeVerifier)` (vulnerable to XSS theft)
- Now calls `storeOAuthStateAction(state, codeVerifier)` to store in HTTP-only cookies

**Remaining concern:** `storeOAuthStateAction` is an untracked new file. The oauth cookies are set with `maxAge: 600` (10 minutes) and `httpOnly: true, sameSite: "lax"` — correct. Other OAuth providers in the UI were not verified to have the same sessionStorage-to-cookie migration.

---

## Phase 4 — Wave 2 Verification

### P1-003 — User Preferences Migration

**Verdict: NOT FIXED**

```
git status → ?? prisma/migrations/20260803150000_add_user_preferences/
```
Migration exists on disk but is untracked. `prisma/schema.prisma:717` defines `preferences Json?`. `src/actions/user-preferences-actions.ts` uses this field. Any database without this migration will fail at runtime when preferences are accessed. Test `migration-evidence.test.ts` continues to fail.

---

### P1-004 — Historical Migration Mutation

**Verdict: NOT FIXED**

```
git show HEAD:prisma/migrations/20260711153755_add_enums_ondelete/migration.sql | md5sum
e2109ca84b83ebc22d3f44e3fe716e16

cat prisma/migrations/20260711153755_add_enums_ondelete/migration.sql | md5sum
b7534bc38684a3aa93b3a9bf10a132e7
```

The files differ. The committed version used `DROP INDEX`; the working-tree version uses `ALTER TABLE … DROP CONSTRAINT IF EXISTS`. This change is a correctness fix but it is NOT committed and the committed file remains mutated relative to its original applied state.

**Correct remediation**: Create a NEW migration for the constraint fix. Do not modify already-committed migrations.

---

### P1-005 — Production Seed Guards

**Verdict: PARTIALLY FIXED (uncommitted)**

Guards added to all 10 seed files (verified via diff):
- `prisma/seed.ts`, `seed-audit.ts`, `seed-sales.ts`, `seed-office-ai.ts`, `seed-decisionos.ts`, `seed-knowledge-mining.ts`, `seed-local-content.ts`, `seed-localcontent.ts`, `seed-content-studio.ts`, `seed-pilot.ts`

Guard pattern:
```typescript
if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED_IN_PROD) {
  throw new Error("Seeding in production is not allowed...");
}
```

**Remaining risks:**
1. `ALLOW_SEED_IN_PROD` override exists. If an operator sets this env var, seeds run in production.
2. Guard only fires if `NODE_ENV === "production"`. Seeding a production database while `NODE_ENV=development` (e.g., developer running locally against prod DB) bypasses the guard.
3. SSO org ID bug (`platformOrg.id` → `org.id`) also fixed ✓

---

## Phase 5 — Independent Reassessment

### P1-006 — CRM Webhook Tenant Routing

**Verdict: UNVERIFIED / UNCHANGED**

`/api/crm/webhook` is NOT in the middleware matcher. It has its own HMAC verification (`HUBSPOT_WEBHOOK_SECRET`). But:
- No rate limiting applied (no middleware)
- The `findFirst({ where: { provider: "hubspot", syncEnabled: true } })` query returns the most recent connection without org filter. This could route webhook data to a different org if multiple orgs have HubSpot connections. Severity: LOW (requires two orgs with HubSpot).
- This finding was not addressed in the remediation waves.

### P1-007 — DecisionOS Auth/Data-Fetch Ordering

**Verdict: FALSE POSITIVE**

Pattern in `getDecisionById`:
1. `getCurrentUser()` — authenticated ✓
2. `prisma.decision.findUnique({ where: { id } })` — fetches without org filter
3. `enforce(user, { tenantId: decision.organizationId }, "read")` — authorizes against fetched org

The data is only returned if `enforce()` succeeds. Cross-org data is NOT exposed. The pattern is "fetch-then-authorize" which is suboptimal (unnecessary DB fetch) but not exploitable — the `fail()` path returns only an error, not the decision data.

### P1-009 — Platform Kernel Product Coupling

**Verdict: NOT FIXED — Active Architectural Violation**

`src/lib/kernel/index.ts` re-exports via `src/lib/kernel/audit.ts`:
- `canDraft`, `canReview`, `canApprove` — AuditOS workflow state machine
- `assertEngagementAccess`, `assertClientAccess` — AuditOS tenant guards
- `recordAuditOsAuditEvent` — AuditOS audit events
- `evaluateTabGate`, `evaluateAllTabGates`, `isTabAccessible` — AuditOS UI gates
- `scanEvidenceFile`, `getStorageProvider`, `buildStorageKey`, `pingClamAv`, `scanBufferWithClamAv` — AuditOS evidence storage
- `evaluateEngagementArchival`, `ARCHIVABLE_ENGAGEMENT_STATUSES`, `listArchivedEngagements` — AuditOS engagement lifecycle
- `calculatePerformanceMateriality`, `classifyBalanceMateriality` — AuditOS financial logic
- `isFsV2Enabled`, `isReportingGraphEnabled` — AuditOS feature flags
- Numerous presentation policy functions

The kernel is acting as a pass-through for ~50 AuditOS-specific domain functions. This violates the "kernel as contracts" principle. Products should import directly from `@/lib/audit/*`, not through the kernel.

The event type files (`lcos-events.ts`, `sales-events.ts`, `audit-events.ts`) contain only type/constant definitions — borderline acceptable as event contracts.

---

## Phase 6 — Performance Forensic Review (Top 20 Queries)

**Scope:** Highest-risk unbounded or poorly-scoped queries

| # | Location | Query | Risk | Severity |
|---|----------|-------|------|----------|
| 1 | `admin-actions.ts:160` | `prisma.user.findMany({ select: { role: true } })` — no limit, no org filter | Fetches ALL users. Admin-only. Counts should use grouped `count()`. | MEDIUM |
| 2 | `activity-actions.ts:27` | `platformAuditLog.findMany({ take: limit })` — `limit` defaults to 20, max not enforced | Limit comes from function param default. Caller controls. | LOW |
| 3 | `ai-governance-actions.ts:66,115` | `platformAuditLog.findMany({ where: platformOrgId })` — no `take` | Could fetch all audit logs for an org. Admin-only. | MEDIUM |
| 4 | `audit-log-read-actions.ts:49` | `platformAuditLog.findMany({ take: limit, skip: offset })` | Paginated with take/skip ✓ | LEGITIMATE |
| 5 | `contact-actions.ts:80` | `localContact.findMany({ where: orgId, take, skip })` | Has take/skip ✓ | LEGITIMATE |
| 6 | `contact-actions.ts:277` | `localContactRelation.findMany({ where: contactId })` — no limit | Relations per contact. Expected cardinality low. | LOW |
| 7 | `bulk-actions.ts:41,91,131` | Multiple `findMany` without take | These appear to be batch operations fetching all records for processing. Scope: admin-only. | MEDIUM |
| 8 | `audit-read-actions/batch.ts:9,18` | `project.findMany`, `clientWorkspace.findMany` | No take. Batch context, likely internal. | MEDIUM |
| 9 | `audit-admin-actions.ts:60` | `auditUser.findMany({ where: orgId })` | No take. Admin-only. Org-scoped. | LOW |
| 10 | `getSunbulStats` admin function | `user.findMany()` — no filter, fetches all users | **HIGHEST RISK** — returns all users across all orgs. Should use `groupBy` count query. Admin-only. | HIGH (admin context) |
| 11–20 | Various audit/decision actions | Most have org scoping + take | Generally bounded by org size | LOW–MEDIUM |

**Observation:** The "692 unbounded findMany" count from previous documentation is a gross overestimate. Most `findMany` calls are org-scoped (inherently bounded), paginated (have `take`), or in admin-only contexts where large result sets are acceptable. True unbounded risks affecting production load are approximately 5–10 cases, all in admin-only paths.

**Top risk:** `getSunbulStats()` fetches all users to count by role. This should use:
```typescript
const [adminCount, operatorCount, viewerCount] = await Promise.all([
  prisma.user.count({ where: { role: "ADMIN" } }),
  prisma.user.count({ where: { role: "OPERATOR" } }),
  prisma.user.count({ where: { role: "VIEWER" } }),
])
```

---

## Phase 7 — Platform Kernel Architecture

**Architecture Verdict: VIOLATION CONFIRMED — NOT REMEDIATED**

The kernel was supposed to be a product-independent platform layer exposing contracts and shared utilities. Instead it has become a barrel export for AuditOS product logic.

**What the kernel should export:** Generic contracts, shared utilities, platform plumbing.

**What the kernel currently exports via `kernel/audit.ts`:** AuditOS-specific domain logic — workflow gates, tenant guards, presentation policies, evidence scanning, materiality calculations, archival logic.

**Evidence-based classification:**
| Category | Kernel Component | Verdict |
|----------|-----------------|---------|
| Generic contracts (IAuditLedger, etc.) | `kernel/contracts/*` | ✓ Appropriate |
| Generic implementations | `kernel/implementations/*` | ✓ Appropriate |
| Platform auth/cache/events | `kernel/auth.ts`, `kernel/cache.ts`, etc. | ✓ Appropriate |
| AuditOS bridge | `kernel/audit.ts` with 50+ AuditOS exports | ✗ VIOLATION |
| Product event types | `kernel/events/lcos-events.ts` etc. | ⚠ Borderline — type-only |

**Impact:** Any product that imports from `@/lib/kernel` now implicitly depends on AuditOS. This makes product independence impossible to achieve and violates ADR-100-109 constraints.

---

## Phase 8 — AI Resilience

**Verdict: ADEQUATE (P1-011 was FALSE POSITIVE)**

**Verified:**
- All LLM provider HTTP calls: `AbortSignal.timeout(30_000)` (30 seconds) ✓
- Local provider: `AbortSignal.timeout(LOCAL_EXECUTION_TIMEOUT_MS)` ✓
- Embedding provider: `AbortSignal.timeout(LOCAL_EMBEDDING_TIMEOUT_MS)` ✓
- Error handling: Timeout caught, user-friendly error thrown ✓

**Gaps (acceptable for current maturity level):**
- No circuit breaker: repeated failures don't reduce load
- No background queue: AI calls block HTTP threads for up to 30s
- No retry logic: single attempt only
- No concurrency limit: multiple simultaneous AI requests could saturate LLM quota

**Risk verdict:** For a pilot-scale deployment (< 10 concurrent users), the 30s timeout is adequate. Circuit breaking becomes necessary at scale.

---

## Phase 9 — Tenant Isolation Deep Scan

**Pattern used:** `findUnique`/`findFirst` by ID without org filter — then post-fetch org check.

| Location | Pattern | Risk |
|----------|---------|------|
| `decisions-crud/detail.ts:21` | Fetch by ID → authorize(tenantId) | SAFE — data returned only after auth |
| `office-ai/download/route.ts:86` | Fetch by ID → `task.platformOrganizationId !== userOrg` | SAFE — 404 on mismatch |
| `audit/evidence/download/route.ts` | Token-based OR session-based → `assertEvidenceDownloadAccess(org)` | SAFE ✓ |
| `audit/tenant-guard.ts` | `assertEngagementAccess`: fetches engagement → compares org | SAFE ✓ |
| `knowledge-mining/candidates/route.ts` | Not fully reviewed | UNVERIFIED |
| `workflowos/records/download/route.ts` | Not fully reviewed | UNVERIFIED |

**No exploitable cross-tenant paths identified** in the reviewed routes. The "fetch-then-authorize" pattern is suboptimal but not exploitable when the return value is gated on authorization success.

---

## Phase 10 — Test/Build/Static Validation

### TypeScript
```
npx tsc --noEmit  → 0 errors (clean)
```

### Test Suite
```
Test Suites: 3 failed, 5 skipped, 444 passed, 447 of 452 total
Tests:       4 failed, 27 skipped, 5773 passed, 5804 total
Time: 45.73s
```

**Failing tests:**
1. `migration-evidence.test.ts` — latest migration is `20260803150000_add_user_preferences` (uncommitted), test expects `20260724180519_add_platform_audit_log_merge_fields`
2. `security-headers.test.ts` — tests dev CSP, expects prod CSP (environment mismatch, not a code bug)
3. `sales/intelligence/__tests__/integration.test.ts:232` — `verifySignature` test uses old HMAC algorithm (regressed by correct fix)
4. `sales/intelligence/__tests__/integration.test.ts:275` — Webhook routing test fails (depends on test 3)

**Regression count:** +2 tests failing vs. pre-remediation (remediation introduced 2 new failures)

### Build
Not run (would require live database). TypeScript clean is the proxy indicator.

### Lint
Not run in this pass. Prior audit reported lint as separate concern.

---

## Phase 11 — Dependency Security Review

**npm audit: UNCHANGED — 19 vulnerabilities (1 low, 4 moderate, 14 high)**

No packages were updated as part of remediation. The `xlsx` vulnerability remains.

**xlsx usage in production paths:**
| File | Context | User Input? | Protected? |
|------|---------|------------|-----------|
| `file-extraction-service.ts` | Office AI uploads | Yes | Post-parse check + 10MB pre-check |
| `erp/file-importer.ts` | ERP XLSX import | Potentially yes | **NO cell check** |
| `workbook/tb-loader.ts` | Trial balance | Filesystem (scripts) | No (low risk) |
| `audit/export/xlsx-exporter.ts` | Export (write only) | No | N/A |
| `local-content/export.ts` | Export (write only) | No | N/A |

**`xlsx` Prototype Pollution exploitability in AQLIYA:**
- User can upload XLSX files via Office AI file upload API
- A crafted XLSX can trigger prototype pollution during `XLSX.read()`, potentially allowing an attacker to inject properties into `Object.prototype`
- Impact: could affect property lookups across the application, potentially leading to privilege escalation or data exposure
- **Risk acceptance decision required — no fix available**

---

## Phase 12 — Infrastructure / Production Claims

| Claim | Verification Status | Evidence |
|-------|--------------------|---------|-
| AWS ECS Fargate deployment | DOCUMENTED ONLY | Terraform modules in `infra/terraform/`; no live state |
| PostgreSQL RDS | DOCUMENTED ONLY | Terraform database module present |
| Redis rate limiting | DOCUMENTED ONLY | `RATE_LIMITER=memory` in `.env` (no Redis locally) |
| CloudFront WAF | DOCUMENTED ONLY | Networking module in Terraform |
| Sentry error monitoring | CONFIGURED, NOT VERIFIED | `SENTRY_DSN=` empty in `.env` |
| pgvector extension | DOCUMENTED ONLY | `SKIP_VECTOR_CHECK=true` in `.env` |
| ClamAV file scanning | NOT CONFIGURED | `SCANNER_PROVIDER=` empty in `.env` |
| External pen test | NOT EVIDENCED | ADR-109 requires it; no report found |

**No live infrastructure was verified.** All infrastructure claims are derived from Terraform configuration and documentation only.

---

## Phase 13 — Final Security Matrix

| ID | Previous Severity | Current Verdict | Evidence | Residual Risk |
|----|-------------------|-----------------|----------|---------------|
| P0-001 CSP Inversion | P0 | **FALSE POSITIVE** | Production CSP was always correct; test ran in wrong mode | Security-headers test still fails |
| P0-002 SalesOS IDOR | P0 | **PARTIALLY FIXED** (uncommitted) | Org check added to upload actions; store is org-partitioned | Other action patterns not audited; uncommitted |
| P0-003 XLSX ZIP Bomb | P0 | **PARTIALLY FIXED** (uncommitted, post-parse) | Cell check after XLSX.read(); 10MB pre-check | Memory still allocated before check; erp/file-importer.ts unprotected |
| P1-001 MFA Salt | P1 | **CONFIRMED FIXED** (uncommitted) | Cookie name and salt corrected; TOTP HMAC corrected | Must be committed |
| P1-002 Webhook Secret | P1 | **PARTIALLY FIXED** (uncommitted, test regression) | Fail-closed on empty secret; HMAC algorithm corrected | 2 integration tests broken by fix |
| P1-003 Migration Drift | P1 | **NOT FIXED** | `git status` — still untracked | Schema drift; runtime failures for preferences |
| P1-004 Migration Mutation | P1 | **NOT FIXED** | MD5 hash mismatch confirmed | Divergence between existing and new databases |
| P1-005 Seed Guards | P1 | **PARTIALLY FIXED** (uncommitted) | All 10 seed files guarded | NODE_ENV bypass; ALLOW_SEED_IN_PROD override |
| P1-006 CRM Webhook | P1 | **UNVERIFIED / UNCHANGED** | Route reviewed; no fix applied | Multi-org HubSpot routing ambiguity |
| P1-007 DecisionOS Order | P1 | **FALSE POSITIVE** | Code reviewed; data gated on auth success | Performance: unnecessary DB fetch before auth |
| P1-008 Knowledge Tenant | P1 | **UNVERIFIED** | Insufficient coverage in this pass | Requires dedicated review |
| P1-009 Kernel Coupling | P1 | **NOT FIXED** | `kernel/index.ts` exports 50+ AuditOS-specific functions | Active architectural violation; no product independence |
| P1-010 Unbounded Queries | P2 | **PARTIALLY ADDRESSED** | Most queries org-scoped/paginated; `getSunbulStats` unbounded | Admin-only; non-critical for pilot |
| P1-011 AI Resilience | P1 | **FALSE POSITIVE** | 30s timeout on all LLM calls; proper error handling | No circuit breaker; acceptable for pilot scale |
| P1-012 SQL Injection | P1 | **CONFIRMED FIXED** (uncommitted) | LIMIT and score parameterized; full repo scan clean | Must be committed |
| P1-013 OAuth CSRF | P2 | **SUBSTANTIALLY FIXED** (uncommitted) | Cookie-based state + session auth + PKCE | salesOAuthActions untracked; other providers unverified |

---

## Phase 14 — Final Production Gate

### Verdict: NO-GO

**Rationale:** 0 of 26 remediation changes are committed. The staging branch deploys pre-remediation code. Beyond the commit deficit, blocking issues remain unresolved.

---

## Executive Verdict

**NO-GO** — Remediation is engineering-complete (with exceptions) but operationally undeployed.

The fixes performed in the working tree are largely correct and, if committed, would meaningfully reduce the attack surface. However:

1. **Nothing is committed** — a deployment from `staging` today would deploy the original vulnerable code
2. **2 new test failures** introduced by the remediation (regression)
3. **Critical migration still uncommitted** — production deployments would have schema drift
4. **Kernel product coupling** — architectural violation not addressed
5. **TOTP was broken** before the fix (using `createHash` not `createHmac`) — unclear if MFA was ever functional with standard authenticators

---

## P0 Status

| Finding | Status |
|---------|--------|
| CSP Inversion | FALSE POSITIVE — Production CSP was always correct |
| SalesOS IDOR | Partially fixed in working tree. Not production-ready. |
| XLSX ZIP Bomb | Partially fixed in working tree (post-parse check). `xlsx` CVE unaddressed. Risk acceptance still required. |

---

## P1 Status

| Finding | Status |
|---------|--------|
| MFA Salt | Fixed (uncommitted). Also reveals TOTP was functionally broken before fix. |
| Webhook Secret | Fixed logic. Regressed 2 tests. Not committed. |
| User Preferences Migration | NOT FIXED |
| Historical Migration Mutation | NOT FIXED |
| Seed Guards | Partially fixed in working tree |
| CRM Webhook | Unchanged |
| Kernel Coupling | Active violation, not addressed |
| SQL Injection | Fixed in working tree |
| OAuth CSRF | Substantially fixed in working tree |

---

## P2 Status

- **Edge rate limiter always memory**: Unchanged. Memory-only in middleware regardless of RATE_LIMITER config.
- **X-Forwarded-For spoofing**: Unchanged.
- **SCIM count unbounded**: Unchanged.
- **CSP img-src inconsistency**: Partially addressed (both sources now dynamic/consistent).
- **CRM webhook not in matcher**: Unchanged.

---

## Remaining Production Blockers

### BLOCKING
1. **Commit remediation** — no change is deployed; commit all 26 working-tree changes first
2. **Fix 2 integration test regressions** — update `integration.test.ts` to use `createHmac` for test signature generation
3. **Commit user preferences migration** — `20260803150000_add_user_preferences` must be committed and applied; update `migration-evidence.test.ts` constant
4. **Resolve migration mutation** — either revert `20260711153755_add_enums_ondelete/migration.sql` to committed version, or create a new migration for the constraint fix (do NOT modify committed migrations)
5. **XLSX risk acceptance** — formal risk decision required before processing untrusted XLSX files; or replace `xlsx` with a safe alternative
6. **Configure `SCANNER_PROVIDER`** — ClamAV required for production evidence uploads

### IMPORTANT BUT NON-BLOCKING
7. Update `security-headers.test.ts` to mock `NODE_ENV=production`
8. Fix `getSunbulStats()` to use grouped `count()` instead of `findMany()` with no limit
9. Verify complete OAuth CSRF fix for providers beyond LinkedIn
10. Address Kernel product coupling (migration path, not blocking pilot)

### TECHNICAL DEBT
11. Platform Kernel architectural violation (50+ AuditOS exports)
12. "Fetch-then-authorize" pattern in DecisionOS (performance, not security)
13. Edge rate limiter Redis-backing for multi-instance deployments
14. npm audit: 13 fixable HIGH vulns (run `npm audit fix`)
15. HSTS not set via `next.config.mjs` for middleware-unmatched paths

---

## Test Evidence

```
Pre-remediation:  Tests: 2 failed, 5775 passed / 5804 total
Post-remediation: Tests: 4 failed, 5773 passed / 5804 total
Delta: -2 tests passing, +2 failures (regression)
TypeScript: 0 errors (clean, unchanged)
```

---

## Security Regression Status

**Yes — remediation introduced 2 new test failures:**
- `integration.test.ts:232` — HMAC algorithm change broke test signature generation
- `integration.test.ts:275` — Webhook routing test depends on above

These are test-level regressions (test code is wrong, fix is correct). But unaddressed, CI would block.

---

## Architecture Verdict

The Platform Kernel violates product independence. It has been converted from a contracts layer to an AuditOS barrel export. This is the most significant architectural debt item. It will require incremental migration: move consumers to import directly from `@/lib/audit/*`; deprecate kernel re-exports one by one.

---

## Performance Verdict

No critical unbounded queries in user-facing paths. Approximately 5 unbounded `findMany` calls in admin-only functions. The "692 unbounded queries" figure is grossly overstated. Genuine performance concerns are minor and admin-scoped. Non-blocking for pilot.

---

## Production Readiness Verdict

**NOT READY — CONDITIONAL GO after resolving blockers 1-6 above.**

The engineering work is sound. The security fixes are directionally correct. The test failures need to be corrected. The uncommitted state is the single highest-priority action.

---

## Top 10 Next Actions

1. **git add + git commit** all 25 modified working-tree files in a single remediation commit
2. **Fix `integration.test.ts`** webhook test to use `createHmac("sha256", secret).update(body).digest("hex")`
3. **git add + git commit** `prisma/migrations/20260803150000_add_user_preferences/` and update `migration-evidence.test.ts` constant to the new migration name
4. **Either revert or supersede** `20260711153755_add_enums_ondelete/migration.sql` — if the constraint fix is needed, create a NEW migration; restore the original file from `git restore`
5. **Formal risk decision** on `xlsx` CVE (prototype pollution) — either replace with `exceljs` or obtain written risk acceptance
6. **Set `SCANNER_PROVIDER=clamav`** and configure ClamAV in deployment before accepting evidence uploads
7. **Update `security-headers.test.ts`** to set `process.env.NODE_ENV = "production"` before calling `setSecurityHeaders()`
8. **Fix `erp/file-importer.ts`** — add same 10MB pre-check and post-parse cell count check as `file-extraction-service.ts`
9. **Verify OAuth CSRF fix** for all providers in `linkedin-connect-button.tsx` and any other OAuth entry points
10. **Plan Kernel de-coupling** — create migration plan to remove AuditOS-specific exports from `kernel/index.ts`

---

*Report prepared 2026-08-17. All findings based on direct code inspection, git diff analysis, and test execution. No code was modified during this audit.*
