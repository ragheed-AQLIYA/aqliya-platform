# AQLIYA — Security Remediation Verification Matrix
**Date:** 2026-08-17  
**Auditor:** Claude Opus 4.8 — Second Independent Pass  
**Source commit:** c885f57d (staging HEAD — unchanged)  
**Remediation state:** Working tree only — NOT committed

> **Critical baseline fact:** Every remediation change is in the working tree. Zero of the remediation changes have been committed to the `staging` branch. The branch HEAD is `c885f57d`, identical to the pre-remediation audit. Any deployment from the branch would deploy the PRE-REMEDIATION code.

---

## Verification Matrix

| ID | Finding | Claimed Fix | Evidence Checked | Verdict | Residual Risk |
|----|---------|-------------|-----------------|---------|---------------|
| P0-001 | CSP Inversion | `middleware-security.ts` made dynamic; `next.config.mjs` made dynamic | Both files read; production CSP verified to exclude unsafe-eval | **FALSE POSITIVE** — Production CSP was always correct; test ran in dev mode. Dev CSP correctly includes unsafe-eval for Next.js dev server. | Security-headers test still fails (test not updated to mock production env). Low residual risk. |
| P0-002 | SalesOS Cross-Tenant IDOR | `ctx.organizationId !== input.organizationId` check added | Diff verified; `proof-file-upload-scaffold.ts` and in-memory store reviewed; `getOrgStore()` is org-partitioned | **PARTIALLY FIXED** | Fix only applied to `scaffoldUploadSalesProofAssetFileAction`; `prepareEvidenceUpload` is a stub returning `stub/${filename}`; real upload path not auditable yet. Only committed when working tree is committed. |
| P0-003 | XLSX ZIP Bomb | 100,000 cell cap added in `file-extraction-service.ts` | File read and execution order verified | **PARTIALLY FIXED** | Cell check is POST-PARSE: `XLSX.read()` allocates memory BEFORE check. 10MB pre-check provides first-line defense. `erp/file-importer.ts` still has no cell check. `tb-loader.ts` (filesystem read, not user upload) unprotected but lower risk. Not committed. |
| P1-001 | MFA JWT Salt Mismatch | Cookie name and salt both corrected to `authjs.session-token` | `mfa/verify/route.ts` diff verified; SAML callback cross-checked; middleware cross-checked | **CONFIRMED FIXED** | None. Salt is now `"authjs.session-token"` matching middleware and SAML. `mfa.ts` TOTP also fixed from `createHash` to `createHmac` (RFC compliance). Not committed. |
| P1-002 | Webhook Secret Bypass | Returns 503 when secret missing; `createHmac` replaces `createHash`; custom provider now uses timingSafeEqual | `webhook/route.ts` and `receiver.ts` diffs verified | **PARTIALLY FIXED** | Fix is correct. BUT: broke 2 integration tests (test used old incorrect algorithm to generate test signatures). Tests not updated. Fix is NOT committed. |
| P1-003 | User Preferences Migration | — | `git status` checked; directory still `??` untracked | **NOT FIXED** | Migration still untracked. Schema drift remains. Test still failing. |
| P1-004 | Historical Migration Mutation | — | Hash comparison: committed vs working tree | **NOT FIXED** | `20260711153755_add_enums_ondelete/migration.sql` still mutated from committed version (hash `e2109ca8` vs `b7534bc3`). Migration file inconsistency persists. |
| P1-005 | Seed Production Guard | Guard added to all 10 seed files | All 10 seed file diffs verified | **PARTIALLY FIXED** | Guards present in all files ✓. Bypass: `ALLOW_SEED_IN_PROD` env var. Bypass 2: guard only fires when `NODE_ENV === "production"` — misses local-against-prod execution. SSO org ID bug also fixed. None committed. |
| P1-006 | CRM Webhook Tenant Routing | Not in scope of Wave 0-2 | CRM webhook route reviewed | **UNVERIFIED** | `/api/crm/webhook` still not in middleware matcher. Route uses own HMAC auth (correct). No rate limiting from middleware. |
| P1-007 | DecisionOS Auth/Data-Fetch Ordering | Not explicitly remediated | `decisions-crud/detail.ts` read | **FALSE POSITIVE** | Pattern is "fetch-then-authorize" not "authorize-then-fetch." The authorization check IS applied before returning data. Cross-org data is never exposed. Audit log fetch is post-authorization. Low residual risk. |
| P1-008 | Knowledge Foundation Tenant Model | Not explicitly remediated | `knowledge-foundation/actions.ts` briefly reviewed | **UNVERIFIED** | Could not complete full scan in this pass. Requires dedicated review. |
| P1-009 | Platform Kernel Product Coupling | Not explicitly remediated | `kernel/index.ts` and `kernel/audit.ts` read in full | **NOT FIXED** | Kernel re-exports hundreds of AuditOS-specific domain functions (canDraft, canReview, presentation policies, scan/storage functions, archival). This is an active architectural violation. |
| P1-010 | Unbounded Database Queries | Not explicitly remediated | Top queries scanned | **PARTIALLY ADDRESSED** | `activity-actions.ts` uses `take: limit`. `admin-actions.ts` `getSunbulStats()` calls `prisma.user.findMany()` with no limit (admin-only). Many queries are org-scoped (natural bound). Dedicated pagination review not done. |
| P1-011 | Synchronous AI / Timeout Resilience | Not explicitly remediated | `llm-http-client.ts` reviewed | **FALSE POSITIVE / ADEQUATE** | All LLM calls use `AbortSignal.timeout(30_000)`. Embedding and local providers have timeouts. No circuit breaker but timeouts prevent indefinite blocking. Requests are synchronous (blocking) but bounded. |
| P1-012 | Raw SQL Injection | LIMIT and score parameterized in similarity-search.ts and hybrid-search.ts | Both files diffs verified; all other raw SQL scanned | **CONFIRMED FIXED** | All 6 `$queryRawUnsafe`/`$executeRawUnsafe` calls verified safe: 2 remediated, 4 were already safe. Not committed. |
| P1-013 | OAuth CSRF | Cookie-based state + session auth + PKCE in cookies | `oauth/callback/route.ts` diff; `linkedin-connect-button.tsx` diff; `sales-oauth-actions.ts` read | **SUBSTANTIALLY FIXED** | CSRF protection correct. But `sales-oauth-actions.ts` is untracked. LinkedIn UI updated; other providers not verified. Not committed. |

---

## Remediation Completeness By Wave

### Wave 0 (P0 findings)
| Finding | Status |
|---------|--------|
| P0-001 CSP Inversion | FALSE POSITIVE |
| P0-002 SalesOS IDOR | PARTIALLY FIXED (uncommitted) |
| P0-003 XLSX ZIP Bomb | PARTIALLY FIXED (uncommitted, post-parse check) |

### Wave 1 (P1 findings)
| Finding | Status |
|---------|--------|
| P1-001 MFA Salt | CONFIRMED FIXED (uncommitted) |
| P1-002 Webhook Secret | PARTIALLY FIXED — regressed 2 tests (uncommitted) |
| P1-012 SQL Injection | CONFIRMED FIXED (uncommitted) |
| P1-013 OAuth CSRF | SUBSTANTIALLY FIXED (uncommitted) |

### Wave 2 (Schema/seed)
| Finding | Status |
|---------|--------|
| P1-003 Migration | NOT FIXED |
| P1-004 Migration Mutation | NOT FIXED |
| P1-005 Seed Guards | PARTIALLY FIXED (uncommitted) |

---

## Commit Status of All Remediation Changes

| File | Change | Committed |
|------|--------|-----------|
| `src/actions/sales-agent-actions.ts` | Org mismatch check | **NO** |
| `src/actions/sales-actions/governance.ts` | Org mismatch check | **NO** |
| `src/app/api/auth/mfa/verify/route.ts` | Salt fix | **NO** |
| `src/app/api/sales/intel/oauth/callback/route.ts` | CSRF fix | **NO** |
| `src/app/api/sales/intel/webhook/route.ts` | Fail-closed on missing secret | **NO** |
| `src/components/sales/linkedin-connect-button.tsx` | PKCE/state in cookies | **NO** |
| `src/lib/auth/mfa.ts` | TOTP HMAC fix | **NO** |
| `src/lib/core/ai/retrieval/similarity-search.ts` | SQL parameterization | **NO** |
| `src/lib/core/knowledge/rag/hybrid-search.ts` | SQL parameterization | **NO** |
| `src/lib/office-ai/file-extraction-service.ts` | Cell count check (post-parse) | **NO** |
| `src/lib/sales/intelligence/webhook/receiver.ts` | HMAC + timing-safe fix | **NO** |
| `src/middleware-security.ts` | Dev/prod CSP split | **NO** |
| `next.config.mjs` | Dev/prod CSP split; standalone disabled | **NO** |
| `prisma/seed*.ts` (×10 files) | Production guard | **NO** |
| `src/actions/sales-oauth-actions.ts` | New file — OAuth state server action | **NO (untracked)** |
| `prisma/migrations/20260803150000_add_user_preferences/` | New migration | **NO (untracked)** |

**Total: 0 of 26 changes committed.**

---

## Test Regression Report

| Test Suite | Before Remediation | After Remediation | Delta |
|-----------|-------------------|-------------------|-------|
| `migration-evidence.test.ts` | FAIL | FAIL | Unchanged |
| `security-headers.test.ts` | FAIL | FAIL | Unchanged |
| `sales/intelligence/__tests__/integration.test.ts` | PASS | **FAIL** | ← New regression |

**Total failures: 4 tests, 3 suites (was 2 tests, 2 suites)**

The HMAC fix (receiver.ts) broke 2 webhook integration tests because the test was computing signatures using the old (incorrect) `createHash("sha256").update(body + secret)` algorithm. The fix is correct; the tests need to be updated to use `createHmac("sha256", secret).update(body)`.

---

*Matrix prepared 2026-08-17. All verdicts based on direct code inspection and git diff evidence.*
