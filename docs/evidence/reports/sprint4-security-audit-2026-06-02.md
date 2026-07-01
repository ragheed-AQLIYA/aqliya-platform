# Sprint 4 Security Audit Report

Date: 2026-06-02
Auditor: Agent B3

## Routes Audited

- Total API routes: **14**
- Protected: **9**
- Unprotected (intentional): **5** (NextAuth handler, MFA verify, health check, custom-product-submit, pilot-review)
- Unprotected (potential issue): **0**

## API Route Details

| Route | Auth | Tenant Isolation | Audit Trail | Notes |
|-------|------|-----------------|-------------|-------|
| `api/auth/[...nextauth]` | ✗ (public) | N/A | N/A | NextAuth handler — public by design ✓ |
| `api/auth/mfa/verify` | ✗ (public) | N/A | N/A | MFA verify — public by design ✓ |
| `api/health` | ✗ (public) | N/A | N/A | Health check — public by design ✓ |
| `api/custom-product-submit` | ✗ (public) | N/A | N/A | Public form — public by design ✓ |
| `api/pilot-review` | ✗ (public) | N/A | N/A | Public form — public by design ✓ |
| `api/audit/engagements/[id]/exports/[format]` | ✓ getAuditActor + requireRole | ⚠️ Returns 403 on access denied (not tenant-safe 404) | ✓ In exportEngagementAction | **Finding 1** |
| `api/audit/evidence/[id]/download` | ✓ getAuditActor | ✓ 404 on tenant mismatch | ✓ auditLogger | 3 layers present ✓ |
| `api/decisions/[id]/evidence/[id]/download` | ✓ requireDecisionAccess | ✓ 404 on not found | ✓ auditLogger | 3 layers present ✓ |
| `api/local-content/projects/[id]/evidence/[id]/download` | ✓ assertProjectAccess | ✓ 404 on not found | ✓ auditLogger | 3 layers present ✓ |
| `api/local-content/projects/[id]/reports/[id]/download` | ✓ getCurrentUser + assertProjectAccess | ✓ 404 on not found | ✓ auditLogger | 3 layers present ✓ |
| `api/metrics` | ✓ requireUserContext(ADMIN) | ✓ orgId filter | N/A | Not a download route |
| `api/office-ai/download` | ✓ requireUserContext(VIEWER) | ✓ 404 on org mismatch | ✓ auditLogger | 3 layers present ✓ |
| `api/workflowos/clients/[id]/records/[id]/export/pdf` | ✓ requireClientAccess (via service) | ✓ 404 on "not found" | ✓ createWorkflowAuditEvent (via service) | Auth delegated to service layer |
| `api/workflowos/documents/[id]/download` | ✓ getCurrentUser | ✓ 404 on not found | ✓ auditLogger | 3 layers present ✓ |

### Protected: 9/14
### Download routes with 3-layer protection: 7/8 (1 has 403 instead of 404)

## Server Action Coverage

Auth pattern scan (all 27 action files):

| Pattern | Action Files Using It |
|---------|----------------------|
| `getAuditActor` / `requireRole` | audit-actions, audit-admin-actions, audit-export-actions, audit-read-actions |
| `getCurrentUser` | decisions, download-token-actions, tender (via requireDecisionAccess) |
| `requireUserContext` | decisions, office-ai-actions, localcontent-actions, local-content-workspace-actions |
| `requireDecisionAccess` | decisions, decision-evidence-actions, decision-export, decision-intelligence, decision-learning, decision-outcomes, decision-sector, decision-signals-alerts, decision-templates, simulation, tender, approval |
| `auth()` | mfa |
| `requireSalesPermission` / `requireSalesOrgAccess` | sales-actions, sales-dashboard-actions, sales-icp-actions, sales-read-actions, sales-review-list-actions |
| `getCurrentUser` / `requireClientAccess` (via services) | workflowos-actions |

### Actions with auth check: 27/27 (100%)
### Actions with org filter: 23/27 (85%)

Notes:
- `mfa.ts` — no orgId needed (user-level MFA setup only)
- `simulation.ts`, `decision-intelligence.ts` — auth via `requireDecisionAccess` which implicitly filters by org
- `workflowos-actions.ts` — auth via `getUserRole` / service-layer guards

## Middleware

### `middleware.ts`
- **Auth method**: `getToken` from `next-auth/jwt`
- **Protected prefixes**:
  - Workspace: `/audit`, `/decisions`, `/local-content`, `/assistant`, `/sales`, `/sunbul`, `/workflowos`, `/organizations`, `/intelligence`, `/monitoring`, `/published/recommendation`, `/settings`
  - API: `/api/audit`, `/api/office-ai`, `/api/local-content`, `/api/sunbul`, `/api/workflowos`, `/api/metrics`
- **Public exclusions** (exact): `/`, `/about`, `/contact`, `/custom-product`, `/demo`, `/deployment`, `/engagement-models`, `/executive-brief`, `/executive-briefing`, `/governance`, `/how-we-work`, `/insights`, `/login`, `/access-denied`, `/pilot-proof`, `/platform`, `/privacy`, `/proof-library`, `/products`, `/security`, `/terms`, `/use-cases`, `/case-studies`, `/auditos`, `/api/custom-product-submit`, `/api/pilot-review`
- **Public prefixes**: `/_next`, `/api/auth`, `/api/auth/mfa/verify`, `/api/health`, `/auditos/`, `/products/`, `/buyers/`, `/insights/`
- **`isApiPath` function**: Protects all `/api/` paths except `/api/auth/` and `/api/health`
- Rate limiting: Applied before auth check for all `/api/` paths

**MFA verify route exclusion**: ✓ Present in `publicPrefixes` at `/api/auth/mfa/verify`

### `middleware-security.ts`
- **HSTS**: `max-age=31536000; includeSubDomains; preload` ✓
- X-XSS-Protection: `1; mode=block` ✓
- X-Frame-Options: `SAMEORIGIN` ✓
- X-Content-Type-Options: `nosniff` ✓
- Content-Security-Policy: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'` ✓
- Referrer-Policy: `strict-origin-when-cross-origin` ✓
- Permissions-Policy: `camera=(), microphone=(), geolocation=(), interest-cohort=()` ✓
- X-Powered-By: Removed ✓

### `middleware-timing.ts`
- No security concerns. Adds `X-Response-Time` header, logs slow requests.

### `middleware-rate-limit.ts`
- Rate limiting on all `/api/` paths
- IP-based (`x-forwarded-for` / `x-real-ip`)
- Returns 429 with `Retry-After` header
- In-memory only (per-instance; acceptable for v0.1)

## Secret Scan

### Hardcoded secrets in source code: **0**
- Scan of all `src/**/*.ts` and `src/**/*.tsx` files for hardcoded `api_key`, `apiKey`, `apikey`, `secret`, `password`, `token` patterns found **no hardcoded credentials**.
- All secrets are read from `process.env.*` at runtime.

### Environment files with actual secrets:
| File | Status | Risk |
|------|--------|------|
| `.env` | Contains `AUTH_SECRET` + `DATABASE_URL` with credentials | Low — git-ignored, local dev only |
| `.env.session4.local` | Contains `PILOT_FACILITATOR_PASSWORD` + `PILOT_OPERATOR_PASSWORD` | Low — git-ignored, local dev only |
| `.next/standalone/.env` | Build output copy of `.env` | ⚠️ **Medium** — may be bundled into deployment |

### Git check:
- `.env` is git-ignored ✓
- `.env.*.local` is git-ignored ✓
- No `.env` has ever been committed to git history ✓

## MFA Route

| Check | Status |
|-------|--------|
| Public access | ✓ Correct — accessible with partial auth (session token present but no MFA) |
| Route existence | ✓ Exists at `src/app/api/auth/mfa/verify/route.ts` |
| Middleware exclusion | ✓ Listed in `publicPrefixes` at `/api/auth/mfa/verify` |
| Auth check in route | ✓ Uses `getToken` to check session, returns 401 if no session |
| Verified | Yes |

## Findings

**4 findings total**

### Finding 1 — Medium: Audit export route returns 403 on access denied

- **Route**: `/api/audit/engagements/[engagementId]/exports/[format]`
- **File**: `src/app/api/audit/engagements/[engagementId]/exports/[format]/route.ts:41`
- **Issue**: When the export action throws "Access denied", the route returns HTTP 403. This differs from the evidence download routes which return 404 for tenant mismatch. Returning 403 reveals that the resource exists but the user lacks access, enabling information leakage.
- **Evidence**: Compare with `src/app/api/audit/evidence/[evidenceId]/download/route.ts:54` which returns 404 on org mismatch.
- **Recommendation**: Change the 403 catch block to 404 to prevent tenant resource enumeration. Use `"Export not found"` instead of the access-denied message.

### Finding 2 — Low: `.next/standalone/.env` may contain secrets in build output

- **File**: `.next/standalone/.env`
- **Issue**: Build output contains a copy of `.env` with `AUTH_SECRET` and `DATABASE_URL`. If the standalone build is packaged for deployment, this file carries production secrets.
- **Recommendation**: Either add `.next/standalone/.env` to `.gitignore` (it may already be generated at build time) or add a build step to delete/redact it. Verify `NEXT_PRIVATE_STANDALONE` behavior with env file handling.

### Finding 3 — Low: WorkflowOS action file lacks direct auth calls

- **File**: `src/actions/workflowos-actions.ts`
- **Issue**: The action file exports functions that delegate to service-layer functions (`listWorkflowClientsForUser`, `createWorkflowClient`, etc.) without calling any auth function directly. Auth is performed inside `services.ts` via `getCurrentUser()`. This indirection makes it harder to audit that auth is actually performed before data access.
- **Recommendation**: Add explicit auth call (`getCurrentUser` or similar) at the start of each exported action function, or add a wrapper that calls auth before delegation. This provides defense-in-depth and clearer audit trail.

### Finding 4 — Low: No explicit `organizationId` filter in `workflowos-actions.ts`

- **File**: `src/actions/workflowos-actions.ts` (and service layer)
- **Issue**: WorkflowOS uses client-based membership access control rather than direct `organizationId` filtering. While functionally correct (membership is validated via tenant-guard), it's an architectural inconsistency with the rest of the platform which uses `organizationId` for tenant isolation.
- **Recommendation**: This is an accepted design choice for WorkflowOS's client-scoped model. Document this explicitly if not already done.

### Finding summary

| Severity | Count | Details |
|----------|-------|---------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 1 | Finding 1: Audit export 403 leak |
| Low | 3 | Findings 2–4: Build env, action auth indirection, org filter consistency |
| **Total** | **4** | |

## Recommendations

1. **Fix audit export 403 → 404** (Medium): Change `src/app/api/audit/engagements/[engagementId]/exports/[format]/route.ts` to return 404 instead of 403 for access-denied errors, matching the evidence download pattern.

2. **Add build-time env scrub** (Low): Configure build to exclude `.env` from standalone output, or add a postbuild script (`postbuild.js`) that deletes `.next/standalone/.env`.

3. **Add explicit auth to workflowos-actions** (Low): Add `getCurrentUser()` call at the top of exported functions for defense-in-depth.

4. **Test MFA enforcement** (Informational): Verify that routes requiring MFA (`mfaVerified: true`) actually check it server-side after the initial auth check passes.

5. **Schedule periodic secret scans** (Informational): Run automated `gitleaks` or `trufflehog` scan as part of CI to catch any future hardcoded secrets.

## Files Inspected

- `src/middleware.ts`
- `src/middleware-security.ts`
- `src/middleware-timing.ts`
- `src/middleware-rate-limit.ts`
- `src/lib/auth.ts`
- `src/lib/auth-config.ts`
- `src/lib/auth-next.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/mfa/verify/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/custom-product-submit/route.ts`
- `src/app/api/pilot-review/route.ts`
- `src/app/api/metrics/route.ts`
- `src/app/api/audit/engagements/[engagementId]/exports/[format]/route.ts`
- `src/app/api/audit/evidence/[evidenceId]/download/route.ts`
- `src/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts`
- `src/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route.ts`
- `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts`
- `src/app/api/office-ai/download/route.ts`
- `src/app/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf/route.ts`
- `src/app/api/workflowos/documents/[documentId]/download/route.ts`
- All 27 files in `src/actions/`
- `src/lib/workflowos/tenant-guard.ts`
- `src/lib/workflowos/services.ts`
- `src/lib/workflowos/export/index.ts`
- `src/lib/download-token.ts`
- `.env`, `.env.example`, `.env.session4.local`
- `.gitignore`
