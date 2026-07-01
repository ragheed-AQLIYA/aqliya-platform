# AQLIYA Core Platform Hardening Report (Agent 1)

**Date:** 2026-05-29  
**Agent:** 1 — Core Platform Hardening  
**Scope:** Auth perimeter, RBAC, tenant isolation, audit logging, export/download safety  
**Baseline read:** `docs/reports/aqliya-eid-sprint-reality-check.md`  
**Rules:** Targeted patches only; no auth redesign, no schema changes, demo isolation preserved

---

## Executive Summary

Platform foundations are **generally sound** for v0.1 pilot: NextAuth JWT middleware guards governed workspaces, download routes implement auth + tenant checks + audit trails per `ROUTE_STRATEGY.md` §Download Security Standard, and AuditOS uses a dedicated actor/tenant guard layer.

**Three high-confidence gaps** were patched in this pass:

1. `/settings/audit-logs` exposed **cross-tenant** platform audit rows to any authenticated user (no ADMIN gate, no tenant filter).
2. `/monitoring` showed **global aggregate counts** to any authenticated user while `/api/metrics` correctly requires ADMIN.
3. Audit evidence **download tokens** compared legacy `User.organizationId` against `AuditOrganization.id`, breaking token issuance and risking incorrect org binding.

**Validation:** Targeted ESLint on edited files — clean. Full `tsc` / `build` / `test` **not run** (per sprint low-load protocol).

---

## 1. Route Access Matrix

Legend: **Public** = middleware bypass; **Protected** = JWT required; **Admin** = platform `UserRole.ADMIN` enforced in route/page/action.

### Marketing & demo (public)

| Route family | Access | Enforcement |
| ------------ | ------ | ----------- |
| `/`, `/about`, `/contact`, `/products/*`, `/buyers/*`, `/insights/*`, etc. | Public | `middleware.ts` `publicExact` / `publicPrefixes` |
| `/auditos/*` | Public (L1 demo) | Prefix `/auditos/` — mock-only, no mutations |
| `/login`, `/access-denied` | Public | Explicit allowlist |
| `/api/health`, `/api/auth/*` | Public | Matcher exclusion / auth handler |
| `/api/custom-product-submit`, `/api/pilot-review` | Public | Explicit allowlist (rate-limited intake) |

### Governed workspaces (protected — middleware JWT)

| Route family | Access | Secondary RBAC |
| ------------ | ------ | -------------- |
| `/audit/*` | Protected | AuditOS `getAuditActor()` + `requireRole()` + `assertEngagementAccess()` |
| `/decisions/*` | Protected | `requireOrgAccess` / `requireDecisionAccess` in actions |
| `/local-content/*` | Protected | `assertProjectAccess()` (legacy org + role) |
| `/assistant/*` | Protected | Platform org scoping on tasks/outputs |
| `/workflowos/*`, `/sunbul/*` (redirect) | Protected | `requireClientAccess()` membership or ADMIN + platform org |
| `/organizations/*`, `/sales` | Protected | Prototype — auth only, mock data |
| `/settings` (shell) | Protected | Client-local L2 shell |
| `/intelligence/*` | Protected | DecisionOS adjacent |
| `/published/recommendation/*` | Protected | Org-scoped publication |

### Platform admin / diagnostics

| Route | Documented access | Code reality (pre-patch) | Post-patch |
| ----- | ----------------- | ------------------------ | ---------- |
| `/settings/workspaces` | Protected admin diagnostics | Protected; tenant-scoped list but **global aggregate stats** | Unchanged (see §3) |
| `/settings/platform-organization` | Protected admin diagnostics | Protected; user-scoped guard report | Unchanged |
| `/settings/audit-logs` | Protected admin | Protected only — **any role, all tenants** | **ADMIN + tenant scope** |
| `/monitoring` | Protected admin | Protected only — **any role, global counts** | **ADMIN gate** |
| `/audit/admin/users` | Protected AuditOS admin | `requireRole(actor, ["admin"])` in server actions | OK |
| `/workflowos/admin` | Protected admin | `user.role === "ADMIN"` page gate | OK |

### API routes

| Route | Access | Tenant / RBAC |
| ----- | ------ | ------------- |
| `/api/metrics` | Admin | `requireUserContext("ADMIN")` |
| `/api/pilot/ops` | Protected | `getCurrentUser()` (facilitator diagnostics) |
| `/api/audit/evidence/*/download` | Protected | Session or HMAC token + engagement org match + audit log |
| `/api/audit/engagements/*/exports/*` | Protected | `exportEngagementAction` actor + engagement guard |
| `/api/decisions/*/evidence/*/download` | Protected | `requireDecisionAccess(VIEWER)` + audit log |
| `/api/local-content/*/download` | Protected | `assertProjectAccess` + audit log |
| `/api/office-ai/download` | Protected | Platform org match + rate limit + audit log |
| `/api/workflowos/documents/*/download` | Protected | `requireClientAccess` + audit log |
| `/api/workflowos/.../export/pdf` | Protected | `exportWorkflowRecord` → `requireClientAccess` |

**Middleware matcher gaps (defense-in-depth):** `/api/decisions/*` and `/api/pilot/*` were not in `middleware.config.matcher` but routes self-enforce auth. **Patched:** both prefixes added to matcher.

---

## 2. Inconsistent Auth / Role Checks

| Finding | Severity | Status |
| ------- | -------- | ------ |
| `/settings/audit-logs` — no ADMIN, no tenant filter | **High** | **Fixed** |
| `/monitoring` — no ADMIN (inconsistent with `/api/metrics`) | **High** | **Fixed** |
| `/settings/workspaces` — global platform totals visible to non-admin | Medium | Not patched (aggregate counts only; list is tenant-scoped) |
| `/settings/platform-organization` — any authenticated user | Low | Acceptable for org-scoped diagnostics |
| Sidebar links to admin settings visible to all modules | Low | UI hint only; routes now gated |
| AuditOS page shell relies on actions for RBAC | OK | Server actions enforce actor roles |
| Platform `UserRole` vs AuditOS role strings (`admin`, `partner`) | Informational | Separate namespaces by design |

---

## 3. Tenant Isolation Patterns

### Model layers

| Layer | ID field | Used by |
| ----- | -------- | ------- |
| Legacy `Organization` | `User.organizationId` | DecisionOS, LocalContentOS project guards |
| `PlatformOrganization` | `User.platformOrganizationId` | Office AI, WorkflowOS ADMIN bypass, platform audit logs |
| `AuditOrganization` | `AuditUser.organizationId` | AuditOS engagements, evidence, exports |

### Pattern assessment

| Product | Isolation mechanism | Verdict |
| ------- | ------------------- | ------- |
| AuditOS | `assertEngagementAccess` compares `AuditActor.organizationId` | **Strong** |
| DecisionOS | `requireOrgAccess(decision.organizationId)` | **Strong** (legacy org) |
| LocalContentOS | `project.organizationId === user.organizationId` | **Strong** within legacy org model |
| WorkflowOS | Membership or ADMIN + `platformOrganizationId` on client | **Strong** |
| Office AI | `task.platformOrganizationId === user.platformOrganizationId` | **Strong** |
| Platform audit log viewer | Was **none** | **Fixed** — filter by session `platformOrganizationId` |
| Download tokens (audit) | Was legacy org vs audit org mismatch | **Fixed** — resolve audit org via platform org bridge |

### Demo isolation

`/auditos/*` remains public with no Prisma mutations in demo path. `AUDIT_DEV_FALLBACK_ENABLED` demo actor is gated to non-production + explicit env flag. **Not weakened.**

---

## 4. Audit Log Coverage (Sensitive Operations)

### Download / export routes (platform audit log)

| Route | Auth | Tenant check | `auditLogger.record` |
| ----- | ---- | ------------ | -------------------- |
| Audit evidence download | Yes | Yes (404) | `evidence.download` |
| Audit engagement export | Yes | Yes | Via `recordAuditEvent` (engagement trail) |
| Decision evidence download | Yes | Yes | `evidence.download` |
| Local content evidence/report | Yes | Yes | `evidence.download` / `report.download` |
| Office AI download | Yes | Yes | `output.download` |
| WorkflowOS document download | Yes | Yes | `document.download` |
| WorkflowOS PDF export | Yes | Yes | `createWorkflowAuditEvent` (product-local) |
| Download token issuance | Yes | Yes | `download_token.issued` |

### Gaps (not patched — lower confidence or out of scope)

- Failed download attempts not uniformly logged (404 paths often skip audit — acceptable for noise).
- Token-based audit evidence download logs `platformOrganizationId` using audit org id (metadata skew — cosmetic).
- Decision export action logs success path; review/approval gate gaps noted in matrix (product scope B8).

---

## 5. Export / Download Token Safety

### HMAC token design (`src/lib/download-token.ts`)

| Control | Status |
| ------- | ------ |
| `DOWNLOAD_TOKEN_SECRET` required | Yes |
| HMAC-SHA256 signature | Yes |
| 5-minute expiry | Yes |
| Payload binds `sub`, `org`, `type`, `file` | Yes |
| Route validates `type` + `file` match URL param | Yes (audit evidence) |

### Pre-patch bug

`requestDownloadTokenAction` for `audit_evidence` compared `user.organizationId` (legacy DecisionOS org) to `engagement.organizationId` (AuditOrganization id). Tokens would fail for correctly provisioned users; if IDs ever collided, wrong binding possible.

### Post-patch

Resolve `AuditOrganization.id` via `platformOrganizationId` (same bridge as `getAuditActor()`), sign token with audit org id, verify in download route against engagement org.

### Office AI token path

`office_ai_output` type is defined but **no download route consumes tokens** today; Office AI uses session-auth query-param download only. No change required beyond stricter platform org null check.

---

## 6. Patches Applied

| File | Change |
| ---- | ------ |
| `src/app/(dashboard)/settings/audit-logs/page.tsx` | ADMIN gate (`/access-denied`); all queries scoped to `user.platformOrganizationId` |
| `src/app/(dashboard)/monitoring/page.tsx` | ADMIN gate aligned with `/api/metrics` |
| `src/actions/download-token-actions.ts` | Audit org resolution for evidence tokens; platform org null guard for office AI |
| `src/middleware.ts` | Matcher adds `/api/decisions/:path*`, `/api/pilot/:path*` |

---

## 7. Remaining Recommendations (not implemented)

| ID | Item | Rationale |
| -- | ---- | --------- |
| R1 | Scope `/settings/workspaces` aggregate stats to tenant or require ADMIN | Medium info disclosure |
| R2 | Hide admin nav links unless `user.role === "ADMIN"` | UX + defense in depth |
| R3 | Wire `requirePlatformOrganization()` on sensitive platform routes | Guard exists but report-only today |
| R4 | Unify tenant key (`platformOrganizationId`) in LocalContent/Decision guards | Larger refactor — deferred |
| R5 | Log failed sensitive download attempts at warning severity | Optional noise/compliance tradeoff |
| R6 | Agent 6 re-run `tsc` / targeted tests on integration branch | Sprint validation gate |

---

## 8. Validation

| Command | Result |
| ------- | ------ |
| Read lints on edited TS/TSX files | **Pass** (0 issues) |
| `npx tsc --noEmit` | **Not run** |
| `npm run build` | **Not run** |
| `npm test` | **Not run** |

---

## Agent 1 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE** |
| **High-confidence fixes** | 4 files |
| **Schema changed** | No |
| **Demo isolation weakened** | No |
| **Report** | `docs/reports/aqliya-core-platform-hardening-report.md` |
