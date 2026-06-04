# Test Coverage Gap Report

**Date:** 2026-06-04
**Auditor:** AQLIYA Testing Agent
**Scope:** All src/__tests__/ files, key src/lib/*/__tests__/ files, Jest config, cycle 5 smoke script

---

## 1. CURRENT COVERAGE INVENTORY

### 1.1 Files in src/__tests__/ (Test Suite Core)

| File Path | Tests | What It Covers | .skip/.only/.todo | Quality Assessment |
|---|---|---|---|---|
| src/__tests__/unit/smoke.test.ts | 3 | Basic smoke: 1+1=2, async, truth | None | Trivial baseline, low value |
| src/__tests__/unit/safe-utils.test.ts | 11 | safeJsonParse, safeError | None | Good edge case coverage, clean |
| src/__tests__/unit/pagination.test.ts | 11 | paginate, offsetFromPage | None | Complete boundary testing |
| src/__tests__/unit/file-scanner.test.ts | 5 | File scanning dev/prod modes | None | Adequate for current stubs |
| src/__tests__/unit/export-generators.test.ts | 14 | PDF/XLSX export generation | None | Good format validation, size checks |
| src/__tests__/unit/localcontent-export-generators.test.ts | 3 | LocalContentOS PDF/XLSX | None | Minimal - no content validation |
| src/__tests__/unit/storage-provider.test.ts | 10 | LocalStorageProvider, buildStorageKey, parseStorageKey | None | Good CRUD, edge cases |
| src/__tests__/unit/workflow-gating.test.ts | 24 | Tab gating for AuditOS workflow | None | Excellent - all 15 tabs, transitions, bilingual reasons |
| src/__tests__/unit/mfa-l011.test.ts | 14 | MFA role parsing, requireMFA, isMFARequiredError | None | Good - config parsing, cache, enforcement |
| src/__tests__/unit/rate-limiter-l014.test.ts | 17 | MemoryRateLimiter, RedisRateLimiter, factory | None | Strong - window, reset, keys, fallback |
| src/__tests__/unit/middleware-rate-limit-l014.test.ts | 4 | Rate limit middleware: skip, pass, 429, IP keys | None | Good - tests integration with NextRequest |
| src/__tests__/unit/provider-ic09.test.ts | 14 | fetchWithRetry, createTimeoutSignal, OpenAI/Anthropic providers | None | Good - retry, timeout, stream, complete |
| src/__tests__/unit/ai-reliability.test.ts | 8 | Circuit breaker, provider observability, feature flags | None | Covers open/close/snapshot/flag gates |
| src/__tests__/unit/budget-manager.test.ts | 10 | AI budget config, status, quota check | None | Good - defaults, spend tracking, caps, month scoping |
| src/__tests__/unit/rag-ic01.test.ts | 17 | Chunking, cosine similarity, embedding service, RAG retriever | None | Strong - full pipeline, mock DB |
| src/__tests__/unit/intelligence-core-rag.test.ts | 6 | Governed RAG: ranking, evidence, retrieveGovernedContext | None | Good - metrics, evidence refs, format |
| src/__tests__/unit/orchestrator-ic02.test.ts | 8 | AI orchestrator: env gating, budget quota, deterministic fallback | None | Solid - mock providers, budget enforcement |
| src/__tests__/unit/orchestrator-rag-inject.test.ts | 4 | RAG context injection into orchestrator requests | None | Good - flag gating, query presence |
| src/__tests__/integration/ic01-pgvector.integration.test.ts | 2 | Live pgvector: vector extension, embed + store + retrieve | describe.skip when env not set | Skipped by default - requires live DB |
| src/__tests__/integration/api-health.test.ts | 1 | Health route GET export | None | Minimal - just checks export exists |
| src/__tests__/integration/org-scoping.test.ts | 3 | Cross-org decision access | None | Good - Org A vs Org B with real Prisma |
| src/__tests__/integration/critical-paths.test.ts | 5 | Full decision pipeline, gate enforcement, signal>alert, pattern extraction | None | Good - end-to-end with real DB |
| src/__tests__/integration/audit-governance-bridge.test.ts | 16 | Publication governance, finding escalation, evidence requirements, status mapping, provenance | None | Excellent - comprehensive pure function tests |
| src/__tests__/integration/recommendation-publication.test.ts | 4 | Publish/unpublish recommendations | None | Good - CRUD with real DB |
| src/__tests__/cross-tenant-isolation.test.ts | 31 | RBAC functions, server-action guard, schema isolation, middleware matcher | None | Excellent - broad coverage |
| src/__tests__/tenant-isolation-audit.test.ts | 8 | assertOrganizationAccess, requireRole, schema fields, tenant actions | None | Good - complements cross-tenant tests |
| src/__tests__/migration-evidence.test.ts | 8 | Migration file existence, SQL content, indexes | None | Good - validates migration integrity |
| src/__tests__/i18n/no-english-strings.test.ts | 1 (skip-warning) | Untranslated English in audit components | test.skip in warning mode | Robust scanner |
| src/__tests__/components/enterprise/loading-state.test.tsx | 1 | Export existence check | None | Minimal |
| src/__tests__/components/enterprise/empty-state.test.tsx | 1 | Export existence check | None | Minimal |
| src/__tests__/components/audit/status-badge.test.tsx | 1 | Export existence check | None | Minimal |
| src/__tests__/components/audit/engagement-tabs.test.tsx | 1 | Export existence check | None | Minimal |

### 1.2 Aggregate Statistics

| Metric | Count |
|---|---|
| Total test suites (jest) | 97 |
| Total individual tests | 821 |
| Skipped tests | 16 |
| .only directives | 0 |
| .todo directives | 0 |

> **📋 STATUS UPDATE 2026-06-04:** P0 test gaps 1–3 resolved:
> - Auth middleware: 61 tests → `src/__tests__/middleware/auth-middleware.test.ts` ✅
> - Cross-org isolation: 13 tests → `src/__tests__/integration/cross-org-isolation.test.ts` ✅
> - RAG tenant isolation: 11 tests → `src/__tests__/integration/rag-tenant-isolation.test.ts` ✅
> - Full suite: **913 passed, 0 failures** (up from 821)
>
> Remaining: pgvector CI integration, smoke test pgvector metrics, storage isolation tests.

---

## 2. COVERAGE GAP ANALYSIS

### 2.1 pgvector/RAG Pipeline

**What IS tested:**
- Chunking engine: paragraph split, sentence split, token estimation, empty input, metadata preservation (13 tests)
- Cosine similarity: identical, orthogonal, opposite, zero vectors, different lengths (5 tests)
- Embedding service: store chunks, governance metadata, ordering, deletion (6 tests)
- RAG retriever: search by similarity, minSimilarity filter, limit, error handling, formatRAGContext (8 tests)
- Governed RAG: buildRankingMetrics, buildEvidenceRefs, retrieveGovernedContext, format, toGovernedRAGPayload (6 tests)
- RAG inject into orchestrator: flag gating, query presence (4 tests)
- Live pgvector: vector extension check, embed->store->retrieve chain - but conditionally skipped (2 tests)

**What is NOT tested:**
- Real embedding provider integration - all tests use MockEmbeddingProvider
- **Cross-tenant RAG isolation** - No test verifies Org A's chunks invisible to Org B
- pgvector index performance - no ANN recall or latency tests
- DocumentChunk cleanup cascade on document deletion
- RAG with sensitivity-based access control
- Chunk overlap correctness verification
- Large document stress tests (>100kb)
- Token-aware chunking with actual tokenizer

**Risk Level:** Medium - Core pipeline tested with mocks, but pgvector integration is skipped by default and cross-tenant RAG isolation is untested.

### 2.2 Auth/MFA

**What IS tested:**
- MFA role parsing: empty, comma-separated, invalid filtering, case normalization (4 tests)
- getMFARequiredRoles: default ADMIN, env override, empty (3 tests)
- isMFARequiredForRole: default, configured, all-false (3 tests)
- requireMFA: pass/throw for enabled/disabled/unverified, non-required roles, disabled enforcement (5 tests)
- isMFARequiredError: recognize MFA errors, reject others (2 tests)

**What is NOT tested:**
- Actual TOTP generation, verification, recovery codes
- MFA middleware enforcement (no test that middleware blocks non-MFA users)
- MFA session expiry and re-verification timeout
- MFA enrollment UI or setup flow
- MFA bypass scenarios beyond the requireMFA function
- Role change triggering MFA re-check
- NextAuth session callback MFA integration

**Risk Level:** Medium - Core config/logic tested, but middleware enforcement pipeline is untested.

### 2.3 Tenant Isolation

**What IS tested:**
- RBAC pure functions: hasRequiredRole, isAdmin, isOperator, isViewer (12 tests)
- Access error detection: isExpectedAccessDeniedError (4 tests)
- requireOrgAccess: matching/mismatched org, role forwarding (3 tests)
- Server-action guard: cross-org rejection for 11 resource types, ADMIN override, default org, VIEWER (9 tests)
- Action-to-role mapping: admin/approve/reject/create/update/export/read (7 tests)
- Schema isolation: organizationId on 17 models, platformOrganizationId on 5 models, engagementId on 13 models, projectId on 2 models (37 tests)
- Middleware route protection: 18 workspace routes, 8 API routes (13 tests)
- assertOrganizationAccess: match/mismatch/message (3 tests)
- requireRole: match/mismatch (2 tests)
- Tenant action gates: requireUserContext count (1 test)
- Live cross-org: decision access denial, own-org access, viewer access (3 tests)

**What is NOT tested:**
- **Prisma query-level tenant scoping** - No test verifies every query includes organizationId in WHERE
- **RAG tenant isolation** - retrieveGovernedContext receives orgId but no cross-org verification
- **API route-level tenant enforcement** - No E2E test of Org A requesting Org B data via API
- **Middleware tenant attachment** - No test verifying middleware extracts orgId from session
- **Download/export route isolation** - No tenant test for file download endpoints
- **Audit log tenant scoping** - No test that Org A cannot see Org B's logs
- **Super-admin boundary exploitation** - No test for privilege escalation attempts

**Risk Level:** Low-Medium - Schema and guard layer well tested. Gap in query-level enforcement and E2E routes.

### 2.4 AI Providers

**What IS tested:**
- Circuit breaker: 5-failure open, reset+success close, snapshot (3 tests)
- Provider observability: flag states, cache invalidation (2 tests)
- Feature flags: 4 flags gated correctly (4 tests)
- fetchWithRetry: success, network retry, 4xx no-retry, 429 retry-until-success (4 tests)
- createTimeoutSignal: no abort, abort after (2 tests)
- OpenAI provider: config, stream, unconfigured, complete (5 tests)
- Anthropic provider: config, stream, unconfigured, complete, execute (6 tests)
- Budget manager: config, spend, caps, month scoping, quota check (10 tests)
- Orchestrator: fallback, cost routing, preferProvider, unavailable, budget (8 tests)

**What is NOT tested:**
- Real provider API integration (all mocked)
- **Provider failover chain** - No test for openai->anthropic->deterministic cascade
- Stream mid-failure handling
- Token counting accuracy across providers
- Rate limiter + provider retry integration
- Model version enforcement
- Parallel/concurrent provider calls
- Health check cache TTL behavior

**Risk Level:** Medium - Good mock coverage, but failover chain and real integration untested.

### 2.5 Middleware

**What IS tested:**
- Rate limit middleware: non-API skip, pass, 429, per-IP keys (4 tests)
- Middleware route matcher: 18 workspace routes, 8 API routes, auth/health exclusion (13 tests)

**What is NOT tested:**
- **Auth session validation** in middleware
- **Middleware tenant extraction** from request
- **Middleware redirect** on auth failure
- **Middleware bypass attempts** (path traversal, header injection)
- CORS middleware
- Middleware chain ordering
- Static file exclusion
- Middleware error handling/crash recovery

**Risk Level:** High - Middleware is the first defense, but actual auth enforcement in middleware is untested.

---

## 3. CROSS-TENANT ISOLATION EVIDENCE REVIEW

### 3.1 cross-tenant-isolation.test.ts

**Verified strengths:**
- Tests requireOrgAccess with matching/mismatched org
- Tests requireServerActionAccess cross-org rejection for all 11 resource types
- Tests ADMIN super-user cross-tenant access
- Tests action-to-role mapping (7 action types)
- Tests schema field presence (37 model checks)
- Tests middleware matcher (18 workspace + 8 API routes)
- Tests CoreAccessControl is disabled

**Verified limitations:**
- ORG A vs ORG B data testing is schema-level only (field existence, not runtime query isolation)
- No test for RAG isolation across orgs
- Live org-scoping.integration.test.ts does test Decision cross-org (3 tests) but doesn't cover AuditOS or SalesOS
- No test for file storage cross-org isolation
- No test for audit log cross-org isolation

### 3.2 tenant-isolation-audit.test.ts

**Verified strengths:**
- Tests assertOrganizationAccess with match/mismatch
- Tests requireRole with match/mismatch
- Tests platformOrganizationId on 4 models
- Tests tenant-actions.ts ADMIN gates

**Verified limitations:**
- Only 8 tests - much thinner than cross-tenant-isolation.test.ts
- Does not test business model tenant guards (Decision, SalesAccount, etc.)
- Does not test file-level tenant access

### 3.3 Pilot Readiness Verdict

| Layer | Coverage | Pilot Ready? |
|---|---|---|
| RBAC pure functions | Comprehensive | Yes |
| Server-action guard | Comprehensive | Yes |
| Schema field presence | Comprehensive | Yes |
| Middleware matcher | Comprehensive | Yes |
| Live cross-org (Decisions) | 3 tests | Yes |
| File storage isolation | NOT tested | No |
| RAG isolation | NOT tested | No |
| API route isolation | NOT tested | No |
| Audit log scoping | NOT tested | No |

---

## 4. CYCLE 5 SMOKE TEST REVIEW

### 4.1 Metrics (19 total, all pass offline)

1. circuit_closed_initial (bool)
2. circuit_open_after_5_failures (bool)
3. circuit_closed_after_reset_success (bool)
4. selection_flag_off (bool)
5. selection_flag_on_env (bool)
6. fallback_chain_length (number)
7. obs_fallback_chain (string)
8. obs_circuits_array (number)
9. obs_budget_alerts_flag (bool)
10. obs_rag_flag (bool)
11. obs_real_providers_flag (bool)
12. rag_ranking_measurable (number)
13. rag_evidence_attached (number)
14. rag_governance_parsed (string)
15. budget_alerts_gated (bool)
16. budget_alerts_on (bool)
17. budget_quotas_on (bool)
18. smoke_mode (string)
19. latency_routing_ms (string)

### 4.2 pgvector RAG in Smoke Test

**No.** The smoke test calls only pure functions (buildRankingMetrics, buildEvidenceRefs). It does NOT:
- Call isPgVectorAvailable()
- Call embedAndStore()
- Call retrieveGovernedContext()
- Call searchChunks()
- Verify DocumentChunk table existence
- Verify pgvector extension installation

The --live flag exists but only produces string placeholders, not actual live execution.

### 4.3 Critical Missing Metrics

| Missing Metric | Why Important | Impact |
|---|---|---|
| pgvector embedAndStore | Verifies embedding pipeline | Medium |
| pgvector retrieveContext | Verifies retrieval pipeline | Medium |
| Prisma connectivity | Database reachable | High (deliberate exclusion) |
| Storage provider health | File storage configured | Medium |
| Auth middleware response | Auth is active | High (requires server) |

---

## 5. RECOMMENDATIONS

### 5.1 Required Before Pilot (P0-P1)

| Priority | Area | Gap | Suggestion |
|---|---|---|---|
| P0 | API route tenant isolation | No E2E cross-org API access tests | Add 3-5 tests: authenticate as Org A, request Org B's data, verify 403/empty |
| P0 | File storage tenant isolation | No cross-org file access test | Add 2-3 tests: upload as Org A, download attempt as Org B, verify denial |
| P1 | RAG tenant isolation | No cross-org chunk isolation test | Add 2 tests: embed as Org A, query as Org B, verify Org A chunks excluded |
| P1 | RAG pgvector live CI | pgvector test skipped by default | Enable IC01_PGVECTOR_INTEGRATION=true in CI with pgvector Postgres |
| P1 | Auth middleware | No middleware session enforcement tests | Add 5 tests: unauthenticated redirect, expired session, invalid token, public passthrough |
| P1 | Smoke RAG check | Smoke skips pgvector pipeline | Add 3 metrics: pgvector extension, DocumentChunk table, embedding service |

### 5.2 Optional (P2-P3, High Value)

| Priority | Area | Gap | Suggestion |
|---|---|---|---|
| P2 | MFA middleware enforcement | No middleware + MFA integration test | Add 2-3 tests |
| P2 | Provider failover chain | No openai->anthropic->deterministic test | Add 1-2 orchestrator tests |
| P2 | Stream error handling | No mid-stream failure test | Add 2 tests: partial data+abort, malformed SSE |
| P2 | Large document RAG | No chunking stress test | Add 1 test with 1MB document |
| P3 | Component rendering | Only export existence checks | Expand to actual render testing |
| P3 | CORS middleware | No CORS test | Add 2 tests: allowed/disallowed origin |

### 5.3 Blocked on Infrastructure

| Gap | Blocked On |
|---|---|
| Live provider API tests (OpenAI/Anthropic) | API keys in CI + cost budget |
| Live pgvector test in CI | pgvector Docker image in CI env |
| E2E browser tests (Playwright) | Playwright setup + test DB seed |
| Load/stress tests | Dedicated test infrastructure |

---

## Appendix: Config

**jest.config.js:**
- Preset: ts-jest, env: node, workers: 1
- Test match: **/__tests__/**/*.test.ts(x)
- Mocks: next-auth, bcryptjs, server-only, Prisma client/adapter
- Alias: @/ -> src/

**setup.ts:**
- DATABASE_URL default: postgresql://localhost:5432/test_db
- AUTH_SECRET: test-secret
- NODE_ENV: test

---

*End of report*
