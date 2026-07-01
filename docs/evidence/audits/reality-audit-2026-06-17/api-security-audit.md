# API Security Audit — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Scope:** 44 API route handlers in `src/app/api/`  
**Method:** Static code review + middleware matcher analysis

---

## API Inventory — VERIFIED

Total route handlers: **44**

---

## Auth Coverage Matrix

| Route | Auth | Tenant Check | Rate Limit | Status |
|-------|------|--------------|------------|--------|
| `/api/health/*` | Public | N/A | health preset | VERIFIED (intentional) |
| `/api/auth/*` | Public | N/A | auth preset | VERIFIED |
| `/api/custom-product-submit` | Public | N/A | Unknown | PARTIAL (Zod only) |
| `/api/pilot-review` | Public | N/A | Unknown | PARTIAL |
| `/api/test-token` | **NONE** | N/A | **NONE** | **CRITICAL** |
| `/api/scim/v2/*` | Bearer API key | Single org | SCIM preset | VERIFIED |
| `/api/ai/*` | Middleware ADMIN/OPERATOR | Org context | AI preset | VERIFIED |
| `/api/platform/*` | Middleware ADMIN | Platform scope | Unknown | VERIFIED |
| `/api/monitoring/health` | ADMIN | N/A | Unknown | VERIFIED |
| `/api/metrics` | Middleware | N/A | Unknown | VERIFIED |
| `/api/skills/evaluate` GET | **NONE** | N/A | Unknown | **HIGH** |
| `/api/skills/evaluate` POST | Session | N/A | Unknown | PARTIAL |
| `/api/agent-memory` | Route-level session | Org | Outside middleware | PARTIAL |
| `/api/decisions/.../download` | Route-level | Decision access | Unknown | VERIFIED |
| `/api/audit/.../download` | Session + token | Engagement org | Audit rate limit | VERIFIED |
| `/api/local-content/.../download` | Route-level | Project access | Unknown | VERIFIED |
| `/api/workflowos/.../download` | Route-level | Client access | Unknown | VERIFIED |
| `/api/office-ai/download` | Route-level | Per-user memory limit | PARTIAL | PARTIAL |
| `/api/integration/health` | Middleware only | N/A | Unknown | PARTIAL |

---

## Middleware Matcher Gaps — VERIFIED

Routes **outside** middleware matcher (rely on route-level auth only):
- `/api/decisions/*`
- `/api/test-token`
- `/api/agent-memory`
- `/api/skills/*`
- `/api/health/*` (intentional public)

---

## Critical Findings

### API-01: `/api/test-token` — CRITICAL

**Evidence:** Returns JWT payload and raw cookies without authentication.  
**Impact:** Session hijack aid in any environment where route is reachable.  
**Recommendation:** Delete route or gate to `NODE_ENV=development` + localhost.  
**Effort:** 15 minutes.

### API-02: `/api/skills/evaluate` GET — HIGH

**Evidence:** Lists skill manifests without auth.  
**Impact:** Information disclosure of internal skill definitions.  
**Recommendation:** Require OPERATOR+ session.  
**Effort:** 30 minutes.

### API-03: Custom login CSRF bypass — HIGH

**Evidence:** `src/app/api/auth/custom-login/route.ts` sets session cookie directly.  
**Impact:** CSRF on login if attacker can trick victim to POST credentials.  
**Recommendation:** Restore NextAuth CSRF flow or add CSRF token validation.  
**Effort:** 4-8 hours.

---

## Input Validation — PARTIALLY VERIFIED

| Route | Validation |
|-------|------------|
| SCIM | SCIM schema validation in service |
| AI routes | Zod/typed handlers |
| custom-product-submit | Zod |
| Download routes | ID format + access guards |
| Retention API | Admin-only; payload validation present |

---

## Error Handling — PARTIALLY VERIFIED

- AI routes use `api-errors.ts` patterns
- Health routes return structured 503
- Some routes may leak stack traces in dev — not production-tested

---

## Rate Limiting — PARTIALLY VERIFIED

Edge presets (`src/lib/platform/rate-limiter/presets.ts`):
- AUTH: 10/min
- SCIM: 15/min
- AI: 30/min

**Gap:** Memory-only at edge; not shared across ECS tasks. Server-side Redis limiter exists but not uniformly applied.

---

## SSRF / Injection — UNVERIFIED

No dynamic URL fetch patterns found in API routes during static review.  
LLM HTTP client calls configured endpoints only — **PARTIALLY VERIFIED**.

---

## Security Score (API subset): 55/100

**Primary blockers:** test-token route, skills evaluate GET, middleware gaps.
