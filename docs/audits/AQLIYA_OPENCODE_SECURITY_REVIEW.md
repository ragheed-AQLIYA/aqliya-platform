# AQLIYA — OpenCode Security Review
**Date:** 2026-08-16  
**Scope:** Authentication, Authorization, Tenant Isolation, API Security, AI Security, Secret Management, File Handling, Headers, SQL Injection

---

## 1. Executive Summary

The AQLIYA codebase demonstrates **mature authorization architecture** with centralized `enforce()` guards, comprehensive Next.js middleware matching 40+ route patterns, multi-layered file upload validation (magic bytes + ClamAV + SHA-256), and parameterized SQL throughout. No hardcoded secrets were found in production code.

However, **one confirmed P0 tenant isolation gap** and **multiple P1 gaps** degrade the security posture:

- **P0:** SalesOS server actions write a client-supplied `organizationId` to storage without validation, creating a cross-tenant IDOR.
- **P1:** CRM webhook handler lacks portal/organization filtering, risking cross-tenant data injection.
- **P1:** Multiple shared service layers query resources by `id` alone without `organizationId`, creating latent IDOR vectors.
- **P1:** Decision detail action fetches the full decision object (with risks, scenarios, tender profile) into memory before the authorization check.
- **P1:** Knowledge-mining API routes authenticate sessions but enforce no roles.
- **P1:** SCIM endpoints use a single global API key.
- **P1:** AI routes lack rate limiting.
- **P1:** Missing HSTS and Permissions-Policy security headers.

**Verdict:** The security foundation is strong, but the request-path and service-layer gaps must be closed before production deployment.

---

## 2. Authorization Matrix (Representative Routes)

| Route / Action | Auth Method | Tenant Check | Resource Check | Rate Limit | Verdict |
|---|---|---|---|---|---|
| `POST /api/sales/intel/webhook` | HMAC signature | ❌ Hardcoded `"system"` | N/A | N/A | **P1** |
| `POST /api/crm/webhook` | HMAC signature | ❌ No portal/org filter | N/A | N/A | **P1** |
| `GET /api/knowledge-mining/*` (6 routes) | `auth()` session | ❌ No visible org filter | ❌ No role check | ❌ None | **P1** |
| `GET /api/scim/v2/*` | Bearer `SCIM_API_KEY` | Single global org | N/A | ❌ None | **P1** |
| `GET /decisions/[id]` | `getCurrentUser()` + `enforce()` | ✅ `organizationId` | ✅ `enforce()` | ✅ `checkRateLimit` | ✅ Safe |
| `GET /api/audit/evidence/*/download` | Token or session | ✅ `assertEvidenceDownloadAccess` | ✅ `enforce()` | ✅ `enforceAuditRateLimit` | ✅ Safe |
| `POST /api/local-content/*/evidence/upload` | `getCurrentUser()` | ✅ `assertProjectAccess` | ✅ `enforce()` | ✅ `checkRateLimit` | ✅ Safe |
| `GET /api/office-ai/download` | `getCurrentUser()` | ✅ `platformOrganizationId` | ✅ `hasRequiredRole` | ✅ In-memory per-user | ✅ Safe (memory only) |
| `POST /api/ai/*` | `getCurrentUser()` + `hasRequiredRole` | ✅ `user.organizationId` | ✅ Role gates | ❌ None | **P1** |
| `POST /api/agent-memory/*` | `getCurrentUser()` + `hasRequiredRole` | ✅ `user.organizationId` | ✅ Role gates | ❌ None | **P1** |
| `GET /api/platform/health` | None (public) | N/A | N/A | N/A | ✅ Safe (LB-only) |
| `GET /api/health/*` | None (public) | N/A | N/A | N/A | ✅ Safe (LB-only) |
| `POST /api/pow/challenge` | None (public) | N/A | N/A | ✅ IP-based | ✅ Safe |
| `POST /api/custom-product-submit` | PoW + IP rate limit | N/A | N/A | ✅ `checkRateLimit` | ✅ Safe |
| `POST /actions/sales-agent-actions.ts` | `requireSalesPermission()` | ❌ Client `organizationId` bypass | ❌ No validation | ❌ None | **P0** |

**Note:** The middleware matcher (`src/middleware.ts`) covers 40+ route patterns with `routeMinRoles` mapping (viewer/operator/admin) and an MFA gate. This is **comprehensive at the perimeter**. The gaps are **inside the perimeter** — at the route handler and service layer.

---

## 3. Tenant Isolation Gaps

### P0 — SalesOS Cross-Tenant File Write (Confirmed)
**File:** `src/actions/sales-agent-actions.ts` (lines 149–170)  
**Pattern:** `input.organizationId` (client-supplied) is passed directly to `scaffoldSalesProofFileUpload({ organizationId: input.organizationId })` without validating against `ctx.organizationId`.  
**Second Location:** `src/actions/sales-actions/governance.ts` (lines 182–204) — identical pattern.  
**Impact:** User in Org A can upload files scoped to Org B.

### P1 — Service-Layer `findUnique` Without Tenant Scoping
High-risk shared services querying by `id` alone:

| File | Query | Risk |
|---|---|---|
| `src/lib/kernel/implementations/audit-ledger.ts:114` | `platformAuditLog.findUnique({ where: { id } })` | Cross-tenant audit log leak |
| `src/lib/kernel/implementations/files-service.ts:67` | `coreEvidence.findUnique({ where: { id } })` | Cross-tenant evidence leak |
| `src/lib/platform/cross-product-ai/.../bridges.ts:14` | `model.findUnique({ where: { id } })` | Cross-product AI data bridge leak |
| `src/lib/office-ai/file-extraction-service.ts:266` | `officeAiFile.findUnique({ where: { id } })` | Cross-tenant file metadata leak |
| `src/lib/platform/sampling/sampling-engine.ts:281` | `samplingPlan.findUnique(...)` | Sampling data leak |
| `src/lib/core/memory/institutional-memory-service/edges.ts:11` | `intelligenceGraphNode.findUnique(...)` | Graph node leak |

**Mitigation:** Add `organizationId` to all shared-service `findUnique` `where` clauses.

### P1 — CRM Webhook Cross-Tenant Injection
**File:** `src/app/api/crm/webhook/route.ts` (lines 80–86)  
`prisma.crmConnection.findFirst({ where: { provider: "hubspot", syncEnabled: true }, orderBy: { createdAt: "desc" } })`  
No `portalId` or `organizationId` filter. If two orgs have HubSpot connections, the most recent one wins, causing cross-tenant processing.

### P1 — Decision Fetched Before Authorization
**File:** `src/actions/decisions-crud/detail.ts` (lines 18–56)  
The full decision object (with related organization, owner, reviewer, objectives, constraints, risks, tender profile, scenarios, framework, approvals) is loaded from the database before `enforce()` is called at line 56.

### P1 — Sales Intel Webhook Tenant Misattribution
**File:** `src/app/api/sales/intel/webhook/route.ts` (line 64)  
`organizationId: "system", // Tenant resolved from webhook payload`  
No visible payload parsing or tenant validation. Webhook events processed under `"system"` tenant break audit trails.

### P1 — SCIM Single Global API Key
**File:** `src/app/api/scim/v2/auth.ts` (lines 16–44)  
All SCIM endpoints use `process.env.SCIM_API_KEY` (single secret) and map to `process.env.SCIM_DEFAULT_ORG_ID`. No per-organization key mapping.

---

## 4. AI Security Assessment

| Control | Status | Evidence |
|---|---|---|
| Prompt injection sanitization | ✅ | `src/lib/security/prompt-sanitization.ts` — strips code fences, role injection, XML tags, null bytes, enforces 4K length limit |
| Input sanitization in orchestrator | ✅ | `src/lib/core/ai/orchestrator.ts:228,343` — `sanitizeTaskInput()` |
| Budget quotas | ✅ | `src/lib/core/ai/orchestrator.ts:247–252` — `checkBudgetQuota(organizationId)` |
| Audit logging for AI generation | ✅ | `createDefaultOnGenerate()` writes `platformAuditLog` with provider, model, confidence, duration |
| Provider fallback | ✅ | Falls back to deterministic provider on failure |
| Tenant isolation in RAG search | ✅ | `searchPgvector` includes `organizationId = $1` in SQL `WHERE` clause |
| User identity validation in AI routes | ✅ | `/api/ai/*` uses `getCurrentUser()` + `hasRequiredRole()` |
| **AI route rate limiting** | **❌** | No `checkRateLimit` in `/api/ai/eval-gate`, `/api/ai/knowledge/ingest`, `/api/ai/governance`, `/api/ai/spend` |
| **AI output validation before persistence** | **❌** | No output sanitization visible in route or orchestrator persistence layer |
| **Cross-tenant RAG fallback** | **❌** | `searchLexicalFallback` uses `prisma.documentChunk.findMany({ where: { OR: terms.map(...) } })` with `take: options.k`. If `organizationId` is omitted by caller, it scans all tenant data. |
| **AI knowledge ingest org override** | **❌** | `POST /api/ai/knowledge/ingest` accepts `organizationId` in body. Requires audit of `resolveKnowledgeOrganizationId`. |

---

## 5. Secret Leakage Findings

**Status: ✅ CLEAR**

| Check | Result |
|---|---|
| Hardcoded API keys (`sk-...`) | None in production `src/` |
| Hardcoded `Bearer <token>` | None in production `src/` |
| Hardcoded passwords | None in production `src/` |
| Runtime secret retrieval | All use `process.env[...]` or secret resolver |
| Webhook secrets | Retrieved from env at runtime (`HUBSPOT_WEBHOOK_SECRET`, `*_WEBHOOK_SECRET`) |
| OAuth secrets | Retrieved from env at runtime (`*_OAUTH_CLIENT_SECRET`) |

**No confirmed secret leakage in production source code.**

---

## 6. File Handling Security

### Upload Paths

| Product | Type Whitelist | Magic Bytes | Virus Scan | Size Limit | Hash | Tenant Scoping |
|---|---|---|---|---|---|---|
| AuditOS evidence | ✅ | ✅ `validateFileContent` | ✅ `scanEvidenceFile` (ClamAV) | ✅ `MAX_FILE_SIZE_BYTES` | ✅ SHA-256 | ✅ `assertEngagementAccess` |
| LocalContentOS evidence | ✅ | ✅ `validateFileContent` | ✅ `scanEvidenceFile` | ✅ | ✅ SHA-256 | ✅ `assertProjectAccess` |
| SalesOS proof upload | ❌ Not visible | ❌ Not visible | ❌ Not visible | ❌ Not visible | ❌ Not visible | ❌ Client `organizationId` bypass |

**P0:** SalesOS upload path is the weakest — no visible type/scan validation and writes to a client-controlled tenant.

### Download Paths

| Product | Auth | Tenant Check | Audit Log | Ticket-Based |
|---|---|---|---|---|
| AuditOS evidence | ✅ Token or session | ✅ `assertEvidenceDownloadAccess` | ✅ | ✅ `verifyDownloadTicket` |
| LocalContentOS evidence | ✅ Session | ✅ `assertEvidenceDownloadAccess` | ✅ | ❌ |
| Office AI output | ✅ Session | ✅ `platformOrganizationId` | ✅ | ❌ |
| WorkflowOS document | ✅ Session | ✅ `user.organizationId` | ✅ | ❌ |

---

## 7. Other Security Findings

### CSP & Security Headers
**Evidence:** `next.config.mjs` lines 132–148

| Header | Production Value | Gap |
|---|---|---|
| `Content-Security-Policy` | Strict (`script-src 'self'`) | ✅ Correct in prod |
| `X-Frame-Options` | `SAMEORIGIN` | Should be `DENY` for financial platform |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| **HSTS** | **Missing** | **P1** |
| **Permissions-Policy** | **Missing** | **P1** |
| `Cache-Control` on downloads | `private, no-store` | ✅ |

**Note:** Dev/test CSP includes `unsafe-eval` and `unsafe-inline`, which is standard for Next.js Fast Refresh but causes a test failure (`security-headers.test.ts`).

### SQL Injection
**Status: ✅ CLEAR**

All `$queryRawUnsafe` and `$executeRawUnsafe` calls use parameterized placeholders (`$1`, `$2`, or template-literal parameterization). No string concatenation of user input into SQL.

Key safe usages:
- `src/lib/core/ai/ingestion/ingestion-pipeline.ts`
- `src/lib/core/ai/retrieval/similarity-search.ts`
- `src/lib/core/knowledge/rag/hybrid-search.ts`
- `src/app/api/platform/health/route.ts` (`$queryRaw` tagged template)
- `src/app/api/health/route.ts` (`$queryRaw` tagged template)

---

## 8. Top 10 Security Risks

| Rank | Risk | Severity | Evidence |
|---|---|---|---|
| 1 | SalesOS cross-tenant file write via client `organizationId` | **P0** | `src/actions/sales-agent-actions.ts:163`, `src/actions/sales-actions/governance.ts:196` |
| 2 | CRM webhook cross-tenant data injection | **P1** | `src/app/api/crm/webhook/route.ts:80-86` |
| 3 | Kernel `findUnique` without tenant scoping (audit-ledger, files-service) | **P1** | `src/lib/kernel/implementations/audit-ledger.ts:114`, `files-service.ts:67` |
| 4 | Decision full object fetched before `enforce()` | **P1** | `src/actions/decisions-crud/detail.ts:21-56` |
| 5 | Sales intel webhook tenant misattribution (`"system"`) | **P1** | `src/app/api/sales/intel/webhook/route.ts:64` |
| 6 | Knowledge-mining API routes lack role/resource checks | **P1** | `src/app/api/knowledge-mining/*/route.ts` |
| 7 | Missing HSTS and Permissions-Policy headers | **P1** | `next.config.mjs` |
| 8 | SCIM single global API key + no rate limiting | **P1** | `src/app/api/scim/v2/auth.ts` |
| 9 | AI knowledge ingest allows client `organizationId` override | **P1** | `src/app/api/ai/knowledge/ingest/route.ts:20,46-49` |
| 10 | AI routes lack rate limiting | **P1** | `/api/ai/eval-gate`, `/api/ai/governance`, `/api/ai/spend` |

---

*End of Security Review. No files were modified during this engagement.*
