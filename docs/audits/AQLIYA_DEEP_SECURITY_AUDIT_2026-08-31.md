# AQLIYA Deep Security, Authorization & API Audit

**Status:** Evidence report (not doctrine)  
**Date:** 2026-08-31  
**Auditor role:** Principal Security Engineer + Application Security Auditor  
**Scope:** Entire repository as of commit `1e65d00211e84eaebedbbe842a30ee2fc2e41e32`  
**Mode:** AUDIT ONLY — no production code was modified  
**Code is source of truth:** where this report conflicts with `AGENTS.md`, `PRODUCT_STATUS_MATRIX.md`, or prior audit docs, this report follows the current code.

---

# Executive Summary

AQLIYA has a real authentication layer (NextAuth v5 JWT), real product-level tenant guards on many download and Sales/AuditOS paths, and useful hardening (magic-byte file validation, ClamAV fail-closed in production, invite token hashing, SSO secret encryption at rest, parameterized RAG SQL).

The **authorization model is not a multi-tenant production control**. `User.role === "ADMIN"` is a per-organization role, but `checkTenantAccess()` treats every ADMIN as a **platform superuser**. Combined with client-supplied `organizationId` on admin and platform APIs, a tenant administrator of Org A can read, mutate, and (via retention) delete Org B data.

Independently of ADMIN, **any authenticated user** (including VIEWER) can read other tenants’ decision titles, workflow titles, LocalContent review comments, deal names, and critical audit-log labels through the platform notification feed / SSE.

Several `"use server"` actions perform sensitive reads/writes **without calling `getCurrentUser()`**. Next.js origin checks reduce cross-site CSRF, but same-origin callers (and anyone who can POST a Server Action ID) do not need a session.

**This is a production NO-GO for any multi-tenant or multi-organization deployment.** A single-tenant closed pilot with fully trusted operators is the only scenario in which these defects are operationally contained — and even then, unauthenticated Server Actions and webhook/SSRF paths remain.

```
SECURITY STATUS: NO-GO

P0 blockers: 4
P1 findings: 14
P2 findings: 16
P3 findings: 10

Authentication bypasses: 4 (unauthenticated Server Actions / unauthenticated webhook-adjacent actions)
Authorization vulnerabilities: 18
Cross-tenant vulnerabilities: 11
IDOR/BOLA findings: 8
Critical dependency vulnerabilities: 0 application-exploitable (5 known High in toolchain, not confirmed request-path RCE)
Secrets exposed in git: 0
Runtime secret leakage to clients: 1 (SSO clientSecret decrypted into list response)
Unprotected API routes: 11 public-by-design or unmatched (of 75)
Missing security tests: critical-path negatives for notifications, retention, ADMIN bypass, SSRF, unauthenticated actions
```

---

# Security Architecture

## Request flow (as implemented)

```text
HTTP request
  ↓
next.config.mjs headers()     CSP / X-Frame-Options / nosniff / Referrer-Policy (all routes)
  ↓
Middleware?                   ONLY if pathname is in config.matcher (allowlist, not default-deny)
  ↓
  rateLimitMiddleware()       IP from X-Forwarded-For (untrusted) — skipped if unmatched
  ↓
  isPublicPath()?             skip JWT / MFA / Edge RBAC
  ↓
  getToken(salt="authjs.session-token")
  ↓
  MFA gate                    ADMIN/OPERATOR by default — skipped if unmatched
  ↓
  Edge role map               viewer/operator/manager/admin strings
  ↓
Route handler / Server Action / Server Component
  ↓
getCurrentUser()              JWT claims snapshotted at login — NOT a live DB row
  ↓
enforce() / authorize()?      OPTIONAL — many paths only authenticate
  ↓
  checkTenantAccess()         ADMIN always allowed; else user.organizationId vs tenantId
                              If tenantId omitted → defaults to user's own org (always pass)
  ↓
Product resource guard?       LocalContentOS / SalesOS / AuditOS / some downloads — the real isolation
  ↓
Prisma query                  isolation only if caller passed organizationId / loaded-then-compared
```

## Where each control actually lives

| Control | Implementation | Completeness |
|---|---|---|
| Authentication | `src/lib/auth-config.ts` NextAuth v5 JWT; `src/lib/auth.ts` `getCurrentUser()` | Strong for matched routes and dashboard layout |
| Session cookie | Auth.js defaults (httpOnly, SameSite=lax, secure=auto). MFA/SAML rewrite cookies explicitly | No revocation; 30-day JWT; role/org stale |
| Middleware | `src/middleware.ts` allowlist matcher | **Not a global gate.** `/admin`, `/feedback`, `/api/knowledge/rag/*`, `/api/pow/challenge`, `/api/health*` unmatched |
| Edge RBAC | `routeMinRoles` in middleware | Coarse; `/api/crm` in matcher but no min-role |
| Authorization facade | `src/lib/authorization/authorize.ts` → tenant-guard → ROLE_PERMISSIONS → ABAC fail-open | ADMIN bypasses tenant. DB Role/Permission tables unused by this path |
| Tenant isolation | Intended in `checkTenantAccess`; **real isolation is product `organizationId` compare-after-load** | Broken for ADMIN; missing on several shared aggregators |
| Rate limit | `src/middleware-rate-limit.ts` only when middleware runs | Unmatched routes have none |
| Security headers | Dual: middleware + `next.config.mjs` | Diverge (HSTS only in middleware; CSP differs) |

## Identity and tenancy model

- Prisma `UserRole`: `ADMIN | OPERATOR | VIEWER`. One user → one `User.organizationId`.
- `PlatformOrganization` is the platform tenant; `Organization` is the product org.
- There is **no** `SUPER_ADMIN` / platform-admin flag. Comments that say “platform operations” refer to the same `ADMIN` assigned inside a tenant (`updateUserRole`, seed `admin@aqliya.com`).
- JWT stores `id`, `email`, `role`, `organizationId`, `platformOrganizationId`, `mfaEnabled`, `mfaVerified`. Role and org are **not re-read from DB** on each request (except some OAuth account attach).

## Parallel authorization systems (documentation vs code)

| System | Used by live path? |
|---|---|
| Facade `authorize()` / `enforce()` | Yes, many server actions |
| Prisma `Role` / `Permission` / `UserRoleAssignment` (`permission-resolver.ts`) | **No** — not called from `authorize()` |
| RB-02 `AuthorizationEngine` | LocalContentOS `localcontent-rbac.ts` only |
| AuditOS `getAuditActor()` + `assertEngagementAccess` | AuditOS — **no ADMIN bypass** (stronger than facade) |
| WorkflowOS `sunbulUserMembership` + `requireClientAccess` | Product membership; ADMIN shortcut still present |
| `authorizeAIAction()` | **Dead** — flag `platform.ai-authorization` not in registry; never called from production |

## Documentation discrepancies (code wins)

1. **AGENTS.md / prior hardening notes** claim CSP removed `unsafe-inline`. Code still has `script-src 'self' 'unsafe-inline'` in both `src/middleware-security.ts` and `next.config.mjs`.
2. **Security-gate skill** implies middleware covers workspace/API. Matcher is an **allowlist**; new routes are unprotected until listed.
3. **Tenant-guard tests encode ADMIN cross-tenant access as intended** (`src/lib/authorization/__tests__/tenant-guard.test.ts`). Product doctrine requires tenant isolation. This is a **deliberate code behavior**, not a one-off bug, and it is unsafe for multi-tenant production.
4. **`getCurrentUser()` is not authorization.** Hundreds of actions authenticate then rely on query scoping. Several shared aggregators do not scope.

## Auth entry points enumerated

| Path | Mechanism |
|---|---|
| `POST /api/auth/[...nextauth]` Credentials | bcrypt, JWT `mfaVerified=false` |
| OAuth (Google/GitHub/Azure/Okta/DB OIDC) | Invite-only: existing user required |
| `GET /api/auth/saml/:id/initiate` + `POST .../callback` | Custom SP; user must exist in provider org |
| `POST /api/auth/mfa/verify` | TOTP/backup; rewrites JWT cookie |
| `POST /api/scim/v2/*` | Bearer `SCIM_API_KEY` → `SCIM_DEFAULT_ORG_ID` |
| `/invite/:token` | SHA-256 hashed token, 7 days |
| `registerTenantAction` | Feature-flagged self-service tenant + ADMIN user |
| Password reset | **Not implemented** |
| Magic link | **Not implemented** |
| Session store | JWT only. Prisma `Session` model unused for live sessions |

---

# Authentication Findings

The credentials/OAuth login path itself is not an authentication bypass. Failures below are session, MFA, SCIM, invite, and unauthenticated Server Action gaps.

Notable authentication-adjacent issues are filed as P1/P2 (SEC-P1-01, SEC-P1-02, SEC-P1-12, SEC-P2-01, SEC-P2-02, SEC-P2-08, SEC-P2-16). There is **no** classic “skip JWT and become any user” on matched API routes that call `getCurrentUser()` / `auth()`.

---

# Authorization Findings

See **Critical Findings** SEC-P0-01, SEC-P0-04 and **High Findings** SEC-P1-01 through SEC-P1-14.

Pattern summary:

- `getCurrentUser()` ≠ authorized for the resource.
- `enforce(..., tenantId: clientOrg)` + ADMIN bypass = cross-tenant.
- Unknown `authorize()` actions map to `resource.view`, so viewers can pass unknown action names if a caller uses a non-canonical action string.
- OPERATOR has `"create"` and `"update"` in `ROLE_PERMISSIONS` — sufficient for webhook registration and several mutations.

---

# Tenant Isolation Findings

**READ isolation fails** for any authenticated user via notifications (SEC-P0-02), knowledge mining (SEC-P1-05), DecisionOS gov (SEC-P1-02), Office AI project list (SEC-P2-06), AI governance metrics (SEC-P2-11).

**WRITE isolation fails** for any tenant ADMIN via user/role/org APIs (SEC-P0-04), retention (SEC-P0-03), outbox (SEC-P1-10), Workflow membership (SEC-P1-11), knowledge ingest with other `organizationId` (SEC-P2-07).

**DELETE isolation fails** via retention (SEC-P0-03), organization delete (SEC-P0-04), knowledge-mining candidate delete (SEC-P1-05).

**Indirect isolation fails** via notification aggregator, dashboards (`getPlatformHealthAction` unscoped counts), SSE, knowledge mining KPIs, platform evidence health, AI spend/governance, WorkflowOS escalation side effects.

Product guards that **do** hold for OPERATOR/VIEWER (verified):

- AuditOS `assertEngagementAccess` compares `actor.organizationId` with **no ADMIN bypass**.
- SalesOS account/deal guards and CRM `organizationId === session org`.
- LocalContentOS `assertProjectAccess`.
- Most download routes (audit/LCOS/decision/office-ai/sales export/workflow record JSON).

---

# API Route Findings

**Inventory method:** glob of `src/app/api/**/route.ts` — **75 route files**. Middleware matcher is not `/api/*`.

Legend: Auth = session / public / bearer / HMAC. Tenant = session-org / resource-load / none / client-unverified. RL = middleware rate limit (only if matched).

| Route | Method | Auth | Authz | Tenant | Validation | RL | Risk |
|---|---|---|---|---|---|---|---|
| `/api/auth/[...nextauth]` | GET,POST | public | NextAuth | n/a | NextAuth | no | Low |
| `/api/auth/mfa/verify` | POST | JWT | own-user | n/a | zod | no | Medium |
| `/api/auth/saml/[providerId]/initiate` | GET | public | none | n/a | relative callback | no | Low |
| `/api/auth/saml/[providerId]/callback` | POST | public | SAML | provider org | form | no | Medium |
| `/api/auth/saml/[providerId]/metadata` | GET | public | none | n/a | none | no | Medium |
| `/api/pow/challenge` | GET | none | none | n/a | none | **no** | Medium |
| `/api/health` | GET | public | none | n/a | none | no | Medium |
| `/api/health/live` | GET | public | none | n/a | none | no | Low |
| `/api/health/ready` | GET | public | none | n/a | none | no | Medium |
| `/api/platform/health` | GET | public | none | n/a | none | yes | Medium |
| `/api/metrics` | GET | session | ADMIN | session | none | yes | Low |
| `/api/monitoring/health` | GET | session | ADMIN | none (platform) | none | yes | Medium |
| `/api/integration/health` | GET | session | VIEWER | **none** | none | yes | Medium |
| `/api/custom-product-submit` | POST | public | POW | n/a | zod+POW | yes | Low |
| `/api/pilot-review` | POST | public | POW | n/a | zod+POW | yes | Low |
| `/api/crm/webhook` | POST | HMAC but **MW requires session** | none | **findFirst HubSpot** | partial | yes | High |
| `/api/sales/intel/webhook` | POST | HMAC | none | **hardcoded `system`** | partial | yes | High |
| `/api/sales/intel/oauth/callback` | GET,POST | session | none | session org | state cookie | yes | Medium |
| `/api/sales/crm/connections` | GET | session | none | client org **verified** | manual | yes | Low |
| `/api/sales/crm/status` | GET | session | none | verified | manual | yes | Low |
| `/api/sales/crm/counts` | GET | session | none | verified | manual | yes | Low |
| `/api/sales/export` | GET | session | `salesos:read` | session | none | yes | Low |
| `/api/notifications/stream` | GET | session | none | **none** | none | yes | **Critical** |
| `/api/agent-memory` | GET,POST,DELETE | session | VIEWER/OPERATOR | session | zod/manual | yes | Medium |
| `/api/skills/evaluate` | GET,POST | session | ADMIN | none | zod | yes | Medium |
| `/api/workflowos/escalation-check` | GET | session | VIEWER | **none** | none | yes | **High** |
| `/api/workflowos/documents/[documentId]/download` | GET | session | `requireClientAccess` | resource | none | yes | Low* |
| `/api/workflowos/records/[recordId]/download` | GET | session | enforce+approval | record org | none | yes | Low |
| `/api/workflowos/clients/.../export/pdf` | GET | session | export action | resource | none | yes | Low* |
| `/api/audit/evidence/[evidenceId]/download` | GET | session or token | enforce/token | resource | none | yes | Medium |
| `/api/audit/engagements/.../exports/[format]` | GET | session | engagement access | resource | enum | yes | Low |
| `/api/decisions/.../evidence/.../download` | GET | session | enforce | resource | none | yes | Low |
| `/api/local-content/.../evidence/.../download` | GET | session | project access | resource | none | yes | Low |
| `/api/local-content/.../reports/.../download` | GET | session | project access | resource | none | yes | Low |
| `/api/local-content/.../audit/export` | GET | session | AUDIT_LOG_ACCESS | project | none | yes | Medium |
| `/api/local-content/metrics` | GET | session | none | session | none | yes | Low |
| `/api/office-ai/download` | GET | session | VIEWER | task org | manual | yes | Low |
| `/api/scim/v2/Users` | GET,POST | Bearer | none | env org | SCIM | yes | High |
| `/api/scim/v2/Users/[id]` | GET,PUT,PATCH,DELETE | Bearer | none | env org | partial | yes | High |
| `/api/scim/v2/Groups` | GET,POST | Bearer | none | env org | SCIM | yes | High |
| `/api/scim/v2/Groups/[id]` | GET,PUT,PATCH,DELETE | Bearer | none | env org | partial | yes | High |
| `/api/platform/outbox/process` | POST | session | ADMIN | **none** | none | yes | High |
| `/api/platform/outbox/status` | GET | session | ADMIN | **none** | none | yes | Medium |
| `/api/platform/outbox/retry` | POST | session | ADMIN | **none** | zod | yes | High |
| `/api/platform/cache/warm` | POST | session | ADMIN | session | none | yes | Low |
| `/api/platform/siem` | GET,POST | session | ADMIN | session | zod | yes | High (SSRF) |
| `/api/platform/abac/shadow-report` | GET | session | ADMIN | session | none | yes | Low |
| `/api/platform/abac/pilot-status` | GET | session | ADMIN | leaks enforce org IDs | none | yes | Medium |
| `/api/platform/retention` | GET | session | ADMIN | none | none | yes | Low |
| `/api/platform/retention/policies` | GET,PUT,DELETE | session | ADMIN | session | zod | yes | Medium |
| `/api/platform/retention/run` | POST | session | ADMIN | **client org unused in deletes** | zod | yes | **Critical** |
| `/api/platform/retention/dry-run` | POST | session | ADMIN | session | zod | yes | Medium |
| `/api/platform/retention/holds` | GET,POST | session | ADMIN | session | zod | yes | Low |
| `/api/platform/retention/holds/[id]` | DELETE | session | ADMIN | **unscoped id** | none | yes | Medium |
| `/api/platform/retention/history` | GET | session | ADMIN | **global memory** | none | yes | Medium |
| `/api/platform/events/registry` | GET | session | ADMIN | none | none | yes | Low |
| `/api/platform/evidence/health` | GET | session | ADMIN | **global counts** | none | yes | Medium |
| `/api/platform/enterprise-health` | GET | session | ADMIN | none | none | yes | Medium |
| `/api/ai/providers` | GET | session | none | none | none | no† | Medium |
| `/api/ai/governance` | GET | session | ADMIN | **none** | days | yes | Medium |
| `/api/ai/spend` | GET | session | ADMIN | **none** | days | yes | Medium |
| `/api/ai/eval-gate` | GET,POST,PUT | session | OPERATOR/ADMIN | POST session; PUT global | zod | yes | Medium |
| `/api/ai/knowledge/ingest` | POST | session | OPERATOR | ADMIN may pass other org | zod | yes | Medium |
| `/api/ai/knowledge/search` | GET | session | VIEWER | same | partial | yes | Medium |
| `/api/ai/knowledge` | DELETE | session | OPERATOR | same | manual | yes | Medium |
| `/api/ai/knowledge/metadata` | GET | session | VIEWER | same | manual | yes | Low |
| `/api/knowledge/rag/search` | GET,POST | session in-handler | none | hardcoded `platform` | partial | **no** | Medium |
| `/api/knowledge/rag/stats` | GET | session in-handler | none | none | none | **no** | Low |
| `/api/knowledge-mining/candidates` | GET,POST | session | VIEWER/OPERATOR | **none** | partial | yes | High |
| `/api/knowledge-mining/candidates/[id]` | GET,DELETE | session | VIEWER/ADMIN | **none** | none | yes | High |
| `/api/knowledge-mining/promote` | POST | session | OPERATOR | none | zod | yes | Medium |
| `/api/knowledge-mining/batch-promote` | POST | session | OPERATOR | none | zod | yes | Medium |
| `/api/knowledge-mining/review` | POST | session | OPERATOR | none | zod | yes | Medium |
| `/api/knowledge-mining/aggregate` | POST | session | OPERATOR | **client org** | zod | yes | High |
| `/api/knowledge-mining/kpis` | GET | session | VIEWER | **none** | none | yes | Medium |

\* Workflow document download: ADMIN shortcut in `requireClientAccess` if `platformOrganizationId` missing.  
† `/api/ai/providers` is **not in middleware matcher** — no Edge MFA/rate-limit; handler still requires session.

**Unprotected / public-by-design API routes (11):** NextAuth, SAML, MFA verify, SCIM, health trio, platform health, POW, custom-product-submit, pilot-review, sales intel webhook. Of these, POW and health/ready are the recon/abuse surfaces; intel webhook is HMAC-gated; SCIM is Bearer-gated.

---

# Database / Prisma Findings

- **`$queryRaw` tagged templates** in health checks: parameterized — not SQLi.
- **`$queryRawUnsafe` / `$executeRawUnsafe`** in RAG/ingestion/vector-store: SQL strings are static; vectors/IDs bound as `$1..$n`. **Not exploitable SQLi.** Residual risk: `organizationId` predicate is **optional** — omit org → scan all `DocumentChunk` rows (SEC-P2-05).
- **Mass assignment:** no `update({ data: req.body })` of full request bodies found on user/role fields in the audited API routes. Role changes go through explicit `updateUserRole` / SCIM `roles[0].value`.
- **Unscoped `findMany` / `findUnique({ id })`:** the production issue is missing `organizationId` on aggregator and mining queries, not raw SQL.
- **Retention `getExpiredRecords`:** `where: { createdAt: { lte: cutoff } }` with **no tenant filter**, then `deleteMany`/`updateMany` by those IDs (SEC-P0-03).

---

# Dependency Findings

Command run: `npm audit --omit=dev` (2026-08-31). Result: **8 vulnerabilities (3 moderate, 5 high). Zero critical.**

| Package | Severity | Advisory | Reachable in this app? | Application-exploitable? |
|---|---|---|---|---|
| `postcss` via `next` | High | XSS via unescaped `</style>`; sourceMappingURL file read | Next.js build/runtime CSS pipeline | **Not confirmed.** Users cannot supply CSS that PostCSS stringifies at request time. Treat as **known vulnerability**, not app RCE/XSS. |
| `sharp` via `next` | High | libvips CVEs | Next.js image optimizer. `images.remotePatterns` is **not** set (no open remote loader). Uploads go through custom storage, not necessarily sharp | **Unlikely** request-path exploit unless a future remote image config is added |
| `brace-expansion` | High | ReDoS/OOM via glob expansion | `glob` in skill runtime; ADMIN-only evaluate API | DoS if ADMIN feeds crafted glob — not unauthenticated RCE |
| `nanoid` `<3.3.18` | High | infinite loop if size=0 with custom generator | Transitive | **Not exploitable** unless a caller passes size 0 to a custom generator |
| `uuid` via `exceljs`/`bull` | Moderate | buffer bounds in v3/v5/v6 | Excel export / queues | **Not confirmed** for this usage (typically v4) |

**Conclusion:** report as known High toolchain vulns. Do **not** treat as production RCE. Upgrade `next` when a release leaves the affected PostCSS/sharp range; run `npm audit fix` for brace-expansion/nanoid if non-breaking.

---

# File Upload Findings

**Defenses present:** magic-byte validation (`src/lib/security/file-validation.ts`); size caps (10–20 MB by product); path sanitization in WorkflowOS storage; ClamAV **fail-closed in production** if `SCANNER_PROVIDER` unset (`src/lib/audit/file-scanner.ts`); download routes generally use `Content-Disposition: attachment`, `nosniff`, `Cache-Control: private, no-store`; tenant checks on evidence downloads.

**Weaknesses:** magic-byte skip when `NODE_ENV=test` or `JEST_WORKER_ID` (dangerous if a prod process inherits those); `.xls`/`.doc` mapped to ZIP signatures; Office AI MIME check is a no-op (extension + magic still apply). No ZIP-bomb specific guard beyond size cap.

Cross-tenant file retrieval for OPERATOR/VIEWER on the main evidence download routes was **not** demonstrated; those routes load the row and compare org/project.

---

# Injection Findings

- **SQL injection:** not found on request path (`$queryRawUnsafe` parameterized).
- **Command injection:** no `child_process` in `src/` production code.
- **XSS:** email template manager uses `dangerouslySetInnerHTML` on client-only state (self-XSS until persisted). JSON-LD uses `JSON.stringify` of static schema. CSP allows `'unsafe-inline'` scripts — stored XSS would execute if introduced later.
- **Template/LDAP/XPath:** not applicable.

---

# SSRF Findings

No blocklist for `127.0.0.1`, `169.254.169.254`, link-local, or private RFC1918 ranges anywhere in `src/`.

User-controlled outbound `fetch()`:

1. WorkflowOS `registerWebhookAction` / `testWebhookAction` / `sendWebhook` — OPERATOR+ (SEC-P1-08).
2. SIEM `destination.url` HTTP/Splunk delivery — ADMIN (SEC-P1-09).
3. Notification webhook channel (`src/lib/platform/notification/webhook-channel.ts`) — same class of issue.

LCGPA HTTP fetcher is HTTPS-only but still follows redirects with no host allowlist (defense-in-depth / P2 if source URLs are user-editable).

---

# CSRF Findings

- Session cookies: Auth.js default `sameSite=lax`, `httpOnly`.
- Next.js App Router Server Actions check Origin vs Host by default (not re-proven with a live PoC in this audit).
- CORS is origin-restricted to `NEXT_PUBLIC_APP_URL` / localhost and only applied to a small API prefix list. No `Access-Control-Allow-Credentials` wildcard.

**Exploitability:** classic cross-site CSRF of cookie-authenticated mutations is **low** given SameSite=lax + action origin checks. Unauthenticated Server Actions (SEC-P1-01, SEC-P1-02, SEC-P1-12) do not need cookies; they are **same-origin callable** without a session. That is an authz bug, not CSRF.

Inbound webhooks correctly use HMAC rather than cookies. `/api/crm/webhook` is currently **blocked by middleware session**, so HubSpot cannot call it (availability bug + unscoped `findFirst` if that gate is later removed).

---

# Rate Limiting Findings

Presets exist (auth 10/min, AI 30, SCIM 15, standard 100). Applied only when middleware matcher hits `/api/*`.

Gaps:

- Key = first `X-Forwarded-For` hop **without trusted-proxy validation** → IP rotation bypass.
- `/api/pow/challenge`, `/api/health*`, `/api/knowledge/rag/*`, `/api/ai/providers`, all `/api/auth/*` skip this limiter.
- No account lockout on credentials failures.
- Production multi-instance requires `RATE_LIMITER=redis` (documented; not verified live).

---

# Secrets Findings

Searched source, CI, Docker, Terraform patterns. **Did not print values.**

```
SECRET PRESENT: NO (in git-tracked source)
LOCATION: n/a for live customer secrets
TYPE: n/a
EXPOSURE: .env gitignored; .env.example placeholders; CI uses AUTH_SECRET placeholder; docker-compose ships a change-me default (must not be used in real deploys)
SEVERITY: n/a for git; operational risk if compose default is reused
```

```
SECRET PRESENT: YES (runtime API response, not git)
LOCATION: src/lib/auth/sso-service.ts toResponse() → listSsoProvidersAction()
TYPE: OAuth/OIDC clientSecret (decrypted from AES-256-GCM at rest)
EXPOSURE: returned to any authenticated caller of the Server Action (no enforce())
SEVERITY: HIGH (SEC-P1-07)
```

Health endpoints disclose **whether** `AUTH_SECRET` is set and if length `< 32` — not the value (SEC-P2-03).

---

# Security Headers

| Header | `next.config.mjs` (all routes) | Middleware (matched only) |
|---|---|---|
| CSP | `'unsafe-inline'` scripts; `worker-src 'none'`; `manifest-src 'self'`; `img-src` includes `https:` | `'unsafe-inline'`; **no** worker-src/manifest-src |
| HSTS | **Missing** | Present (`max-age=31536000; includeSubDomains; preload`) |
| X-Frame-Options | SAMEORIGIN | SAMEORIGIN — **conflicts** with CSP `frame-ancestors 'none'` |
| X-Content-Type-Options | nosniff | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin | same |
| Permissions-Policy | not in Next config | camera/mic/geo blocked |

Marketing `/` therefore has CSP **without HSTS** from Next config. Dual CSP is a maintenance hazard.

---

# Admin / Privileged Operations

Privilege is `User.role === "ADMIN"` everywhere that matters for platform APIs. There is no separate platform-admin.

Privileged surfaces: `/admin` (dashboard layout auth, **no MFA** because unmatched), `src/actions/admin-actions.ts`, organization update/delete, SCIM user/group CRUD, retention run, outbox process/retry, SIEM export, skills evaluate, WorkflowOS `requireWorkflowAdmin`.

`/admin` is under `src/app/(dashboard)/` so unauthenticated users redirect to `/login`. MFA is skipped.

---

# Cross-Product Security

Shared Prisma models + unscoped aggregators are the cross-product leak:

- Platform notification feed reads DecisionOS, WorkflowOS, LocalContentOS, SalesOS, and `platformAuditLog`.
- Knowledge mining candidates are shared with optional `organizationId`.
- Retention can archive/delete Decision and AuditEngagement rows globally.
- Outbox is a global event bus operable by any org ADMIN.
- `enforce()` ADMIN bypass is cross-product.

AuditOS engagement guards remain the strongest product boundary and do **not** inherit the facade ADMIN bypass.

---

# AI / LLM Security

- Prompt sanitization exists (`src/lib/security/prompt-sanitization.ts`) and is wired in the orchestrator. Heuristic (fence/role-prefix stripping), not a sandbox. Nested non-string fields not sanitized.
- `authorizeAIAction` is **not used** in production. Flag `platform.ai-authorization` is absent from the registry → would allow-all anyway.
- RAG SQL is parameterized. Org filter is optional at the query layer; product `searchKnowledge` passes org. ADMIN may search another org via `resolveKnowledgeOrganizationId`.
- Kernel `ToolRegistryImpl.invoke` does not execute tools. Skill runtime `filesystem:scan` uses `globSync` with caller `cwd` (ADMIN evaluate API).
- AI output is framed as suggestion/draft in orchestrator logging; mutations still depend on Server Actions keeping `enforce`/`getCurrentUser`. **AI authorization does not replace application authorization** — and currently does not even run.

---

# Audit Logging

Logged: many mutations, SSO CRUD, SAML login/fail, downloads (product-dependent), SCIM, webhook register, AI generate, retention holds, authorization **denies**.

Weak/missing:

- Credentials login **failure** not written to platform audit log.
- Rate-limit 429s not audited.
- ADMIN **cross-tenant allows** are not logged as security events.
- `createNotification` audit uses `actor: { id: params.userId }` (attacker-chosen), not a session user.

---

# Security Test Coverage

**Present:** `cross-tenant-isolation.test.ts`, `tenant-isolation-audit.test.ts`, product tenant-guard tests, authorization pipeline e2e, download-route tests, file-validation magic bytes, prompt-sanitization unit tests, rate-limit middleware tests, security-headers tests, SCIM auth tests.

**Missing / inverted:**

- No `*idor*` tests.
- No test that webhook URLs to `169.254.169.254` are rejected.
- No CSRF Origin-mismatch tests.
- `checkTenantAccess` **asserts ADMIN cross-tenant allow** — this encodes the P0 as correct behavior.
- Notification aggregation tests do **not** assert org scoping (they exercise unscoped mocks).
- `authorizeAIAction` tests turn the flag on; production flag is absent.
- No negative tests for `createNotification` without session, `getActiveEscalationsAction` without session, or retention unscoped delete.

---

# Attack Paths

## Path A — Cross-tenant data vacuum (any user)

```text
Authenticated VIEWER (any tenant)
        ↓
GET /api/notifications/stream  (matcher: viewer)
        ↓
getPlatformNotificationsAction()  (auth only; no org filter)
        ↓
prisma.decision / workflowRecord / localContentReview / salesDeal / platformAuditLog
        ↓
Titles, IDs, comments, hrefs of OTHER tenants over SSE
```

Exploitability: **High**. Impact: **Cross-tenant**.

## Path B — Tenant admin becomes platform admin

```text
Org A ADMIN
        ↓
listUsers("org-B") / updateUserRole(userInB, "ADMIN", "org-B")
        ↓
assertAdmin(organizationId) → enforce() → checkTenantAccess ADMIN bypass
        ↓
Promote users in Org B; or updateOrganizationAction / deleteOrganizationAction
        ↓
Cross-tenant privilege + data destruction
```

Exploitability: **High** (needs guessed/leaked org IDs — listable via `getPlatformStats` org count and other leaks). Impact: **Platform-wide**.

## Path C — Retention wrecking ball

```text
Org A ADMIN
        ↓
POST /api/platform/retention/run  { organizationId: optional }
        ↓
runScheduledRetention → getExpiredRecords() with NO org filter
        ↓
delete/archive Decisions, audit logs, contacts, ingestion docs across ALL tenants
```

Exploitability: **High**. Impact: **Cross-tenant integrity**. Bounded by retention windows (e.g. audit logs 365d, decisions 730d) but still unauthorized global mutation.

## Path D — Unauthenticated phishing inbox

```text
Unauthenticated caller (same origin / known Server Action ID)
        ↓
createNotification({ userId, organizationId, title, link: attacker URL })
        ↓
Victim sees trusted-looking in-app notification
        ↓
Credential theft or malware link
```

Exploitability: **Medium–High**. Impact: **Single user / phishing**.

## Path E — SSRF from operator

```text
OPERATOR (same tenant) or ADMIN (any tenant via enforce)
        ↓
registerWebhookAction(orgId, { url: "http://169.254.169.254/latest/meta-data/" })
        ↓
testWebhookAction → fetch(url)
        ↓
Cloud metadata / internal Redis/Postgres/admin ports
```

Exploitability: **Medium** (needs operator+; cloud metadata often requires IMDSv1). Impact: **Infrastructure**.

## Path F — Public webhook mutates any deal

```text
Attacker with APOLLO_/SMARTLEAD_/HUBSPOT_/CUSTOM_WEBHOOK_SECRET
        ↓
POST /api/sales/intel/webhook  (publicExact)
        ↓
HMAC OK; organizationId = "system"
        ↓
salesContact.findFirst({ email })  — no org
        ↓
Advance ANY tenant’s matching deal to negotiation
```

Exploitability: **Medium** (secret required). Impact: **Cross-tenant integrity**.

---

# Critical Findings

### SEC-P0-01

```
Finding ID: SEC-P0-01
Severity: P0 / CRITICAL
Category: Authorization / Tenant isolation
Title: Organization ADMIN is treated as a platform superuser

Affected file(s):
  src/lib/authorization/tenant-guard.ts
  src/lib/authorization/authorize.ts
  src/lib/authorization/action-guard.ts
  src/lib/authorization/__tests__/tenant-guard.test.ts
Affected route(s): every enforce()/authorize() consumer that accepts tenantId/organizationId
Affected function(s): checkTenantAccess, enforce, authorize

Evidence:
  checkTenantAccess() lines 40–43:
    if (user.role === "ADMIN") {
      return { allowed: true, resolvedTenantId: targetTenantId };
    }
  UserRole.ADMIN is stored per User in one organization. There is no SUPER_ADMIN.
  Tests explicitly expect "allows admin cross-tenant access".

Attack scenario:
  An ADMIN of Tenant A calls any enforce()-gated action with Tenant B’s resource id
  or organizationId. Tenant check returns allowed.

Impact:
  Cross-tenant read/write/delete wherever product code trusts enforce() instead of
  loading the row and comparing organizationId.

Root cause:
  Privilege model conflates tenant administrator with platform operator.

Exploitability: High
Tenant impact: Cross tenant / Platform-wide

Recommended remediation:
  Remove ADMIN bypass. Introduce an explicit platform-admin allow-list (env or
  PlatformOrganization flag) if platform ops are required. Tenant ADMIN must
  only match user.organizationId (or platformOrganizationId for that tenant).

Regression test required:
  yes — OPERATOR and ADMIN of org-A must be denied enforce() on org-B tenantId.
```

### SEC-P0-02

```
Finding ID: SEC-P0-02
Severity: P0 / CRITICAL
Category: Tenant isolation / IDOR
Title: Notification feed and SSE leak other tenants’ operational data

Affected file(s):
  src/actions/platform-overview-actions/notifications.ts
  src/app/api/notifications/stream/route.ts
Affected route(s): GET /api/notifications/stream; any UI calling getPlatformNotificationsAction
Affected function(s): getPlatformNotificationsAction, GET

Evidence:
  Stream requires only token.sub (lines 11–16 of stream/route.ts).
  getPlatformNotificationsAction calls getCurrentUser() then:
    prisma.decision.findMany({ where: { status: "IN_REVIEW" } })  — no organizationId
    same for overdue decisions, workflowRecord, localContentReview, salesDeal,
    platformAuditLog (severity error/critical).
  Returned fields include titles, IDs, comments slice, hrefs.

Attack scenario:
  Any logged-in VIEWER opens the SSE endpoint or dashboard notification widget
  and receives other institutions’ decision titles, workflow titles, LC comments,
  stale deal names, and audit-log labels.

Impact:
  Confidential cross-tenant business data. Enables follow-on IDOR by leaking IDs.

Root cause:
  Shared aggregator queries with authentication but no tenant predicate.

Exploitability: High
Tenant impact: Cross tenant

Recommended remediation:
  Filter every query by user.organizationId and/or platformOrganizationId.
  Do not use a global take-20 of IN_REVIEW rows.

Regression test required:
  yes — seed two orgs; VIEWER in A must not see B’s decision titles over SSE.
```

### SEC-P0-03

```
Finding ID: SEC-P0-03
Severity: P0 / CRITICAL
Category: Tenant isolation / Unauthorized deletion
Title: Retention run deletes/archives expired records across all tenants

Affected file(s):
  src/app/api/platform/retention/run/route.ts
  src/lib/core/policy/retention/engine.ts
  src/lib/core/policy/retention/policies.ts
Affected route(s): POST /api/platform/retention/run
Affected function(s): POST, runScheduledRetention, applyRetention, getExpiredRecords

Evidence:
  Route: any hasRequiredRole(ADMIN); body.organizationId optional; passed to
  runScheduledRetention but getExpiredRecords() uses only createdAt <= cutoff
  (engine.ts ~129–137). Default policies enable delete of PlatformAuditLog (365d),
  Decision (730d), archive AuditEngagement / LocalContact, etc.
  organizationId is stored on the job object; it is not a Prisma where clause
  on the destructive queries.

Attack scenario:
  Tenant A ADMIN POSTs /api/platform/retention/run. Engine processes up to 1000
  expired rows per model globally.

Impact:
  Cross-tenant data destruction and audit-log wiping (within retention windows).

Root cause:
  Retention engine is global; ADMIN is tenant-scoped; API exposes it to every ADMIN.

Exploitability: High
Tenant impact: Cross tenant / Platform-wide

Recommended remediation:
  Require platform-admin. Always AND organizationId/platformOrganizationId on
  findMany/deleteMany. Ignore client-supplied organizationId unless it equals
  the caller’s tenant.

Regression test required:
  yes — org-A ADMIN run must not delete org-B Decision/AuditLog rows.
```

### SEC-P0-04

```
Finding ID: SEC-P0-04
Severity: P0 / CRITICAL
Category: Privilege escalation / IDOR
Title: Tenant ADMIN can list users, change roles, and rename/delete other organizations

Affected file(s):
  src/actions/admin-actions.ts
  src/actions/organization-actions.ts
Affected route(s): Server Actions used by /admin and /organizations (dashboard)
Affected function(s): assertAdmin, listUsers, updateUserRole, getPlatformStats,
  updateOrganizationAction, deleteOrganizationAction

Evidence:
  assertAdmin(_organizationId?) uses client organizationId as enforce tenantId.
  Combined with SEC-P0-01, any ADMIN passes. listUsers(organizationId) then
  queries that org. updateUserRole checks user.organizationId === organizationId
  (the client-supplied victim org), then writes role including ADMIN.
  updateOrganizationAction/deleteOrganizationAction: enforce(user, { id: orgId },
  "admin") with no membership check that orgId belongs to the caller.

Attack scenario:
  Org A ADMIN calls listUsers("org-B"), updateUserRole(victimId, "ADMIN", "org-B"),
  or deleteOrganizationAction("org-B") (if empty enough to delete).

Impact:
  Full identity takeover of another tenant; org rename/delete.

Root cause:
  Client-trusted organizationId + ADMIN tenant bypass.

Exploitability: High
Tenant impact: Cross tenant / Platform-wide

Recommended remediation:
  Bind assertAdmin to user.organizationId === organizationId (or platform-admin
  only). For org update/delete, require org.platformOrganizationId ===
  user.platformOrganizationId AND (for non-platform-admin) org.id === user.organizationId.

Regression test required:
  yes — org-A ADMIN must 403 on listUsers(org-B) and updateOrganization(org-B).
```

---

# High Findings

### SEC-P1-01

```
Finding ID: SEC-P1-01
Severity: P1 / HIGH
Category: Authentication bypass / IDOR
Title: createNotification is an unauthenticated Server Action

Affected file(s): src/actions/notification-actions.ts
Affected route(s): Server Action createNotification ("use server")
Affected function(s): createNotification

Evidence:
  File is "use server". createNotification has no getCurrentUser/enforce.
  Writes organizationId, userId, title, body, link from params.
  Audit actor is params.userId.

Attack scenario:
  Caller invents a victim userId and injects an in-app notification with a
  phishing link. Next.js origin check reduces cross-site CSRF; same-origin /
  known action-id invocation does not require a session.

Impact:
  Trusted-UI phishing; notification inbox poisoning for any user.

Root cause:
  Internal helper exported as a public Server Action.

Exploitability: Medium–High
Tenant impact: Single tenant (targeted user) / Platform-wide (any userId)

Recommended remediation:
  Remove from Server Action surface; keep as server-only module. If kept,
  require session and force organizationId/userId from the session (or
  platform-admin + membership check).

Regression test required:
  yes — unauthenticated invoke must fail; caller cannot write another user’s row.
```

### SEC-P1-02

```
Finding ID: SEC-P1-02
Severity: P1 / HIGH
Category: Broken object-level authorization
Title: DecisionOS governance actions skip auth and tenant checks

Affected file(s):
  src/app/(dashboard)/decisions/gov/actions.ts
  src/lib/platform/decision-gov/decision-gov-service.ts
Affected route(s): Server Actions on /decisions/gov
Affected function(s): getActiveEscalationsAction, getDecisionEventLogAction,
  processEscalationsAction, getActiveEscalations, getDecisionEventLog, processEscalations

Evidence:
  getActiveEscalationsAction: no getCurrentUser; loads all active rules and
  overdue decisions (titles, org ids).
  getDecisionEventLogAction(decisionId): no auth; findMany({ decisionId }).
  processEscalationsAction: getCurrentUser() only, then processEscalations()
  writes ESCALATE events for every org.

Attack scenario:
  Read another tenant’s escalation queue / event log by decisionId; or trigger
  global escalation writes.

Impact:
  Cross-tenant confidentiality and integrity of DecisionOS governance.

Root cause:
  Job-style functions exposed as Server Actions without resource authz.

Exploitability: High (event log is IDOR by id); Medium (unauthenticated if action id known)
Tenant impact: Cross tenant

Recommended remediation:
  Require getCurrentUser on every action. Scope getActiveEscalations to
  user.organizationId. Load decision and compare organizationId before event log.
  Restrict processEscalations to platform-admin or cron, scoped per tenant.

Regression test required:
  yes — unauthenticated deny; org-A cannot read org-B decisionId events.
```

### SEC-P1-03

```
Finding ID: SEC-P1-03
Severity: P1 / HIGH
Category: Tenant isolation / Integrity
Title: Sales intel webhook mutates deals with no organization scope

Affected file(s):
  src/app/api/sales/intel/webhook/route.ts
  src/lib/sales/intelligence/webhook/salesos-handlers.ts
Affected route(s): POST /api/sales/intel/webhook (publicExact)
Affected function(s): POST, EMAIL_REPLIED handler and siblings

Evidence:
  receiveWebhook({ organizationId: "system", ... }). Comment says tenant is
  resolved from payload; handlers instead findFirst salesContact by email with
  no organizationId, then update salesDeal.

Attack scenario:
  Party who knows *_WEBHOOK_SECRET posts a signed event for a contact email
  that exists in another tenant; deal stage becomes negotiation.

Impact:
  Cross-tenant CRM integrity. Secret is global per provider, not per tenant.

Root cause:
  Shared webhook secret + email-only lookup.

Exploitability: Medium (requires secret)
Tenant impact: Cross tenant

Recommended remediation:
  Per-tenant secrets; bind contact/deal lookup to organizationId derived from
  the connection/portal, never "system".

Regression test required:
  yes — signed event for org-A email must not update org-B deal.
```

### SEC-P1-04

```
Finding ID: SEC-P1-04
Severity: P1 / HIGH
Category: Authorization / Cross-tenant write
Title: Any VIEWER can run global WorkflowOS export escalations

Affected file(s):
  src/app/api/workflowos/escalation-check/route.ts
  src/lib/workflowos/escalation-service.ts
Affected route(s): GET /api/workflowos/escalation-check
Affected function(s): GET, checkPendingExports, escalateExportRequest

Evidence:
  hasRequiredRole(user, "VIEWER") then checkPendingExports() loads ALL
  workflowRecord rows with exportStatus requested, no org filter, then
  updates escalatedAt and notifies admins.

Attack scenario:
  VIEWER repeatedly GETs the route (DoS/amplification) and mutates other
  tenants’ export workflow state.

Impact:
  Cross-tenant integrity; notification spam; job should be cron/platform-admin.

Root cause:
  Background job exposed as a viewer-accessible HTTP GET.

Exploitability: High
Tenant impact: Cross tenant

Recommended remediation:
  Remove from product API or require platform-admin + secret header.
  Scope records to caller org if it must remain interactive.

Regression test required:
  yes — VIEWER in org-A must not set escalatedAt on org-B records.
```

### SEC-P1-05

```
Finding ID: SEC-P1-05
Severity: P1 / HIGH
Category: IDOR / Tenant isolation
Title: Knowledge mining APIs list, read, review, and delete candidates with no org filter

Affected file(s):
  src/app/api/knowledge-mining/candidates/route.ts
  src/app/api/knowledge-mining/candidates/[id]/route.ts
  src/app/api/knowledge-mining/review/route.ts
  src/app/api/knowledge-mining/promote/route.ts
  src/lib/tb-intelligence/knowledge-mining/knowledge-candidate-service.ts
Affected route(s): /api/knowledge-mining/*
Affected function(s): GET/POST/DELETE handlers, listCandidates, getCandidate

Evidence:
  listCandidates only adds organizationId if the filter includes it; the GET
  route never passes it. getCandidate is findUnique({ id }).

Attack scenario:
  VIEWER lists all tenants’ mined account phrases/evidence. OPERATOR
  approve/reject/promote another tenant’s candidates. ADMIN DELETE by id.

Impact:
  Cross-tenant financial/account-name leakage and knowledge-base integrity.

Root cause:
  Deprecated “scheduled job” APIs kept with role checks only.

Exploitability: High
Tenant impact: Cross tenant

Recommended remediation:
  Always pass session organizationId. Deny cross-org candidate id. Or remove
  these routes if only server actions remain.

Regression test required:
  yes — org-A VIEWER list must not include org-B candidates; GET by id 403.
```

### SEC-P1-06

```
Finding ID: SEC-P1-06
Severity: P1 / HIGH
Category: Privilege escalation
Title: Any authenticated role can invite an ADMIN

Affected file(s): src/actions/registration-actions.ts
Affected route(s): inviteTeamMemberAction (settings/team)
Affected function(s): inviteTeamMemberAction

Evidence:
  getCurrentUser() only. role taken from client if in [ADMIN, OPERATOR, VIEWER].
  No enforce() / isAdmin(). Invitation stored with that role.

Attack scenario:
  VIEWER invites attacker@ as ADMIN. Victim accepts /invite/{token}.

Impact:
  Same-tenant privilege escalation to ADMIN (then SEC-P0-01 becomes available).

Root cause:
  Invite treated as authenticated-only, not admin-only; role is client-controlled.

Exploitability: High
Tenant impact: Single tenant (becomes platform-wide via P0-01)

Recommended remediation:
  Require ADMIN (or manage_users). Callers may only invite roles ≤ their own.
  Never accept ADMIN from non-admin.

Regression test required:
  yes — VIEWER invite role=ADMIN must fail.
```

### SEC-P1-07

```
Finding ID: SEC-P1-07
Severity: P1 / HIGH
Category: Secrets disclosure
Title: listSsoProvidersAction returns decrypted client secrets to any authenticated user

Affected file(s):
  src/actions/sso-admin-actions.ts
  src/lib/auth/sso-service.ts
Affected route(s): listSsoProvidersAction
Affected function(s): listSsoProvidersAction, getSsoProviders, toResponse

Evidence:
  listSsoProvidersAction: getCurrentUser() then getSsoProviders(user.organizationId)
  — no enforce("admin"). toResponse sets clientSecret: decryptSecret(...).
  Mutations correctly require enforce(..., "admin").

Attack scenario:
  VIEWER in an org with SSO configured reads OIDC clientSecret and impersonates
  the app at the IdP or forges tokens depending on IdP setup.

Impact:
  Identity-provider credential theft (tenant-scoped).

Root cause:
  Decrypt-for-display without RBAC; secrets should never round-trip to the client.

Exploitability: High (if SSO configured)
Tenant impact: Single tenant

Recommended remediation:
  Never return raw clientSecret. Mask (last-4) for admins only. Require enforce admin on list.

Regression test required:
  yes — VIEWER list must omit secrets; ADMIN list must not include full secret.
```

### SEC-P1-08

```
Finding ID: SEC-P1-08
Severity: P1 / HIGH
Category: SSRF
Title: WorkflowOS webhook registration fetches attacker-controlled URLs

Affected file(s):
  src/actions/workflowos-template-actions.ts
  src/lib/workflowos/webhook-service.ts
Affected route(s): registerWebhookAction, testWebhookAction
Affected function(s): registerWebhookAction, sendSingleWebhook

Evidence:
  enforce(..., "update") — OPERATOR is allowed update. url stored with no
  scheme/host/IP policy. fetch(url) 15s timeout, no private-IP block.
  Combined with P0-01, ADMIN may pass another organization’s id.

Attack scenario:
  Register http://127.0.0.1:6379 or http://169.254.169.254/... and test.

Impact:
  Internal network probe; possible cloud metadata (IMDSv1); webhook payload leak.

Root cause:
  User URLs fetched server-side without SSRF controls.

Exploitability: Medium–High
Tenant impact: Single tenant (OPERATOR); Cross tenant (ADMIN + P0-01)

Recommended remediation:
  Allowlist https + public DNS; block loopback, link-local, RFC1918, metadata.
  Resolve DNS and pin IPs. Disable redirects.

Regression test required:
  yes — localhost and 169.254.169.254 URLs must be rejected.
```

### SEC-P1-09

```
Finding ID: SEC-P1-09
Severity: P1 / HIGH
Category: SSRF
Title: SIEM export delivers audit logs to a client-supplied URL

Affected file(s):
  src/app/api/platform/siem/route.ts
  src/lib/platform/siem/export-service.ts
  src/lib/platform/siem/delivery.ts
Affected route(s): POST /api/platform/siem
Affected function(s): handleExport, deliverToHttp, deliverToSplunk

Evidence:
  destination.url from JSON body. deliverToHttp fetch(url) with audit payload.
  ADMIN-only, org from session (better than P0-01), but URL unrestricted.
  destination.type "file" uses destination.url as filesystem path (path risk).

Attack scenario:
  ADMIN sets destination.type=http url=http://169.254.169.254/... or
  type=file url=../../sensitive.

Impact:
  SSRF with sensitive audit JSON; possible local file write.

Exploitability: Medium (needs ADMIN)
Tenant impact: Single tenant + infrastructure

Recommended remediation:
  URL allowlist; SSRF IP policy; file destinations under a jailed directory only.

Regression test required:
  yes — private IPs rejected; file path jail enforced.
```

### SEC-P1-10

```
Finding ID: SEC-P1-10
Severity: P1 / HIGH
Category: Privileged operations / Cross-tenant
Title: Any tenant ADMIN can drain and retry the global event outbox

Affected file(s):
  src/app/api/platform/outbox/process/route.ts
  src/app/api/platform/outbox/retry/route.ts
  src/app/api/platform/outbox/status/route.ts
Affected route(s): /api/platform/outbox/*
Affected function(s): POST process/retry, GET status

Evidence:
  hasRequiredRole ADMIN only. processOutboxBatch(50) selects pending with no org.
  Status leaks other orgs’ organizationId/lastError.

Attack scenario:
  Org A ADMIN processes/replays events belonging to Org B, or reads failure details.

Impact:
  Cross-tenant event integrity and information disclosure.

Root cause:
  Platform bus exposed to tenant ADMIN.

Exploitability: High
Tenant impact: Cross tenant

Recommended remediation:
  Platform-admin only (secret or role). Scope status to caller org.

Regression test required:
  yes — org-A ADMIN must not process org-B outbox rows.
```

### SEC-P1-11

```
Finding ID: SEC-P1-11
Severity: P1 / HIGH
Category: Privilege escalation / IDOR
Title: WorkflowOS membership mutations skip client and user-org checks

Affected file(s):
  src/lib/workflowos/tenant-guard.ts
  src/lib/workflowos/services.ts
  src/actions/workflowos-actions/memberships.ts
Affected route(s): workflow_createMembership, workflow_addMembershipByEmail, role/status updates
Affected function(s): requireWorkflowAdmin, createWorkflowMembership, findUserByEmail

Evidence:
  requireWorkflowAdmin: User.role === ADMIN only. createWorkflowMembership
  does not call requireClientAccess and does not verify userId’s organization.
  findUserByEmail returns any platform user.

Attack scenario:
  Org A ADMIN adds themselves (or any userId) as PlatformAdmin on Org B’s clientId.

Impact:
  Cross-product, cross-tenant access to WorkflowOS clients.

Root cause:
  “Platform Admin” comment vs tenant ADMIN; missing requireClientAccess.

Exploitability: High
Tenant impact: Cross tenant

Recommended remediation:
  requireClientAccess(clientId) + target user.organizationId match.
  Stop global findUserByEmail.

Regression test required:
  yes — org-A ADMIN cannot create membership on org-B clientId.
```

### SEC-P1-12

```
Finding ID: SEC-P1-12
Severity: P1 / HIGH
Category: Authentication bypass / Secrets
Title: listWebhooksAction has no authentication and returns webhook secrets

Affected file(s): src/actions/workflowos-template-actions.ts
Affected route(s): listWebhooksAction
Affected function(s): listWebhooksAction

Evidence:
  No getCurrentUser. getWebhookConfigs(organizationId) for client-supplied org.
  Config objects include url and secret.

Attack scenario:
  Unauthenticated/same-origin caller lists another org’s webhook URLs and HMAC secrets.

Impact:
  Webhook forgery against customer endpoints; secret leak.

Root cause:
  Read path omitted the authz applied on register/test.

Exploitability: High
Tenant impact: Cross tenant

Recommended remediation:
  Require session; bind organizationId to session; never return full secrets.

Regression test required:
  yes — unauthenticated fail; org-A cannot list org-B webhooks.
```

### SEC-P1-13

```
Finding ID: SEC-P1-13
Severity: P1 / HIGH
Category: Account enumeration
Title: workflow_addMembershipByEmail enumerates users before authorization

Affected file(s): src/actions/workflowos-actions/memberships.ts
Affected route(s): workflow_addMembershipByEmail
Affected function(s): workflow_addMembershipByEmail, findUserByEmail

Evidence:
  findUserByEmail(data.email) runs before createWorkflowMembership (the ADMIN gate).
  Distinct error “المستخدم غير موجود حالياً” vs later Access denied.

Attack scenario:
  Any caller who can invoke the action probes emails across the platform.

Impact:
  Account enumeration; aids phishing and invite attacks.

Root cause:
  Lookup ordered before authorization; verbose existence error.

Exploitability: Medium–High
Tenant impact: Platform-wide

Recommended remediation:
  Authorize first. Uniform error. Scope email search to caller org.

Regression test required:
  yes — VIEWER gets identical error for existing vs missing emails; no dump of user id.
```

### SEC-P1-14

```
Finding ID: SEC-P1-14
Severity: P1 / HIGH
Category: Tenant isolation
Title: Knowledge mining aggregate accepts client organizationId; errors leak internals

Affected file(s): src/app/api/knowledge-mining/aggregate/route.ts
Affected route(s): POST /api/knowledge-mining/aggregate
Affected function(s): POST, aggregatePatterns

Evidence:
  OPERATOR session; body.organizationId passed through without comparing to
  session. Catch returns { error: String(error) } (stack/implementation leak).

Attack scenario:
  OPERATOR aggregates another tenant’s mining patterns; error strings leak internals.

Impact:
  Cross-tenant analytics; information disclosure.

Root cause:
  Client-trusted tenant id; debug error serialization.

Exploitability: Medium
Tenant impact: Cross tenant

Recommended remediation:
  Force session org. Use sanitizeError. Restrict to platform-admin if cross-org analytics are required.

Regression test required:
  yes — OPERATOR cannot pass another organizationId.
```

---

# Medium Findings

### SEC-P2-01 — Middleware matcher is allowlist (MFA/RBAC holes)

```
Finding ID: SEC-P2-01
Severity: P2
Category: Security misconfiguration
Title: Unlisted routes skip JWT/MFA/Edge RBAC/rate-limit
Affected file(s): src/middleware.ts
Evidence: config.matcher omits /admin, /feedback, /api/knowledge/rag/*, /api/pow/challenge, /api/health*, /api/ai/providers. Dashboard layout still authenticates /admin.
Attack scenario: MFA-required ADMIN hits /admin without completing MFA.
Impact: MFA bypass for unmatched pages; unmatched APIs rely solely on in-handler checks.
Root cause: Allowlist instead of default-deny.
Exploitability: Medium
Tenant impact: Single tenant
Recommended remediation: Default-deny matcher (`/((?!_next|...public).*)`) plus explicit public list.
Regression test required: yes — ADMIN without mfaVerified must not load /admin.
```

### SEC-P2-02 — JWT role/org stale for up to ~30 days; no revocation

```
Finding ID: SEC-P2-02
Severity: P2
Category: Session handling
Title: Role, org, and MFA flags live only in JWT
Affected file(s): src/lib/auth-config.ts, src/lib/auth.ts
Evidence: session: { strategy: "jwt" }; Prisma Session unused. jwt callback snapshots role/organizationId.
Attack scenario: Demoted ADMIN keeps ADMIN until token expires; stolen JWT cannot be revoked except secret rotation.
Impact: Delayed revocation; lingering privilege.
Exploitability: Medium
Tenant impact: Single tenant
Recommended remediation: Short maxAge; re-load user on jwt callback; token version / denylist.
Regression test required: yes — role change takes effect on next request (or within minutes).
```

### SEC-P2-03 — Unauthenticated health/ready information disclosure

```
Finding ID: SEC-P2-03
Severity: P2
Category: Sensitive information disclosure
Title: Health endpoints expose build SHA, storage path, Redis/pgvector, AI provider names, AUTH_SECRET presence/length
Affected file(s): src/app/api/health/route.ts, src/app/api/health/ready/route.ts, src/app/api/platform/health/route.ts
Attack scenario: Unauthenticated recon maps internals and secret hygiene.
Impact: Aids targeted attacks; AUTH_SECRET length is a crypto hygiene leak.
Exploitability: High (unauthenticated) / Limited impact
Tenant impact: Platform-wide
Recommended remediation: Keep /live unauthenticated. Gate /ready and /health details behind network or ADMIN. Never report secret length.
Regression test required: yes — unauthenticated /ready must not include storage paths or secret length.
```

### SEC-P2-04 — Rate limit trusts X-Forwarded-For

```
Finding ID: SEC-P2-04
Severity: P2
Category: Rate limiting
Title: Client can rotate X-Forwarded-For to bypass IP limits
Affected file(s): src/middleware-rate-limit.ts
Evidence: ip = x-forwarded-for first hop without trusted proxy list.
Exploitability: High against per-IP limits
Tenant impact: Platform-wide
Recommended remediation: Trust only the last hop from known proxies, or use platform connection IP.
Regression test required: yes — spoofed XFF must not create a new bucket when behind a trusted proxy.
```

### SEC-P2-05 — RAG vector search org filter is optional

```
Finding ID: SEC-P2-05
Severity: P2
Category: Tenant isolation / AI
Title: searchVector omits organizationId predicate when orgId is missing
Affected file(s): src/lib/core/knowledge/rag/hybrid-search.ts, similarity-search.ts
Evidence: if (orgId) conditions.push organizationId. Product searchKnowledge passes org; any caller that omits it scans all chunks.
DEFENSE PRESENT for /api/ai/knowledge/search (passes resolved org). Residual if a new caller forgets.
Recommended remediation: Require organizationId; throw if missing.
Regression test required: yes — omitted org must not return other tenants’ chunks.
```

### SEC-P2-06 — Office AI lists all active projects

```
Finding ID: SEC-P2-06
Severity: P2
Category: Cross-tenant read
Title: getUserTaskList loads prisma.project.findMany({ status: "active" }) without org
Affected file(s): src/actions/office-ai-workspace-actions.ts (~134–145)
Impact: Other tenants’ project names/ids in assistant filters.
Recommended remediation: Filter by workspaceIds already loaded for platformOrganizationId.
Regression test required: yes
```

### SEC-P2-07 — Knowledge org override for ADMIN; Office AI skips check if platformOrganizationId missing

```
Finding ID: SEC-P2-07
Severity: P2
Category: Tenant isolation
Title: resolveKnowledgeOrganizationId allows ADMIN to pass any org; Office AI task access skipped when session platformOrganizationId is unset
Affected file(s): src/lib/core/knowledge/rag/knowledge-service.ts; src/actions/office-ai-actions/task-actions.ts
Evidence: if (orgId !== user.organizationId && user.role !== "ADMIN") throw. Task check only if both platform org ids are set.
Recommended remediation: Deny ADMIN override unless platform-admin. Fail closed if platformOrganizationId missing.
Regression test required: yes
```

### SEC-P2-08 — SCIM: one global Bearer key can mint ADMIN

```
Finding ID: SEC-P2-08
Severity: P2 (P1 if key leaks)
Category: Privileged operations
Title: SCIM_API_KEY maps to one env org; createUser accepts roles[0].value ADMIN
Affected file(s): src/app/api/scim/v2/auth.ts, src/lib/auth/scim-service.ts (~221)
Evidence: /api/scim is public prefix so Edge admin role never runs. Single env key.
Recommended remediation: Per-tenant keys in DB; deny ADMIN via SCIM or require out-of-band approval.
Regression test required: yes — SCIM cannot set ADMIN unless explicitly allowed.
```

### SEC-P2-09 — ABAC fail-open; unused DB permission resolver

```
Finding ID: SEC-P2-09
Severity: P2
Category: Authorization
Title: evaluateAbac returns allowed on errors; authorize() never calls resolvePermissions()
Affected file(s): src/lib/authorization/abac-bridge.ts, permission-resolver.ts
Impact: Operators may believe ABAC/SoD is enforced.
Recommended remediation: Fail closed when FF_ABAC_ENFORCE is on; or remove claims.
Regression test required: yes if enforce mode ships
```

### SEC-P2-10 — authorizeAIAction unused

```
Finding ID: SEC-P2-10
Severity: P2
Category: AI security
Title: AI authorization gate is dead code
Affected file(s): src/lib/core/ai/ai-authorization.ts
Evidence: Not imported by orchestrator; flag not in FLAG_REGISTRY.
Recommended remediation: Wire it or delete the claim from docs.
Regression test required: yes if wired
```

### SEC-P2-11 — Admin AI governance/spend and integration health are unscoped

```
Finding ID: SEC-P2-11
Severity: P2
Category: Cross-tenant read
Title: /api/ai/governance, /api/ai/spend, /api/integration/health query global metrics
Affected file(s): src/lib/core/ai/governance-metrics.ts (findMany productKey ai_core, no org); integration health route
Impact: Tenant ADMIN sees other tenants’ AI volume/cost; VIEWER sees global LCOS counts.
Recommended remediation: Filter by organizationId; restrict integration health to ADMIN + org.
Regression test required: yes
```

### SEC-P2-12 — CRM webhook: session-blocked and unscoped HubSpot connection

```
Finding ID: SEC-P2-12
Severity: P2
Category: Webhook security
Title: /api/crm/webhook requires JWT (HubSpot 401) and findFirst latest hubspot connection
Affected file(s): src/app/api/crm/webhook/route.ts, src/middleware.ts
Impact: Dead webhook today; if made public, portalId unused → wrong tenant connection.
Recommended remediation: publicExact + HMAC + bind portalId to organizationId. Length-check timingSafeEqual.
Regression test required: yes
```

### SEC-P2-13 — POW challenge unmatched / no rate limit

```
Finding ID: SEC-P2-13
Severity: P2
Category: Abuse
Title: GET /api/pow/challenge mints tokens with no middleware rate limit
Affected file(s): src/app/api/pow/challenge/route.ts
Impact: Token farm against public forms (forms have their own RL — residual).
Recommended remediation: Add to matcher; rate-limit; increase difficulty.
Regression test required: no (hardening)
```

### SEC-P2-14 — SAML JWT salt vs middleware salt in production

```
Finding ID: SEC-P2-14
Severity: P2
Category: Session handling
Title: SAML encodes with cookie-name salt; middleware getToken uses "authjs.session-token"
Affected file(s): src/app/api/auth/saml/[providerId]/callback/route.ts; src/middleware.ts:185
Impact: Production SAML sessions may fail Edge validation (availability) or diverge from Auth.js cookies.
Recommended remediation: Use one salt matching Auth.js cookie name for the environment.
Regression test required: yes — SAML login accepted by middleware in production cookie mode.
```

### SEC-P2-15 — requireClientAccess skips org check if platformOrganizationId missing

```
Finding ID: SEC-P2-15
Severity: P2
Category: Tenant isolation
Title: Workflow ADMIN shortcut returns PlatformAdmin when session or client lacks platformOrganizationId
Affected file(s): src/lib/workflowos/tenant-guard.ts (~73–88)
Impact: Cross-tenant client access for ADMIN with incomplete identity claims.
Recommended remediation: Fail closed unless both IDs present and equal.
Regression test required: yes
```

### SEC-P2-16 — trustHost: true; no explicit cookie Secure/Domain

```
Finding ID: SEC-P2-16
Severity: P2
Category: Session / Host header
Title: NextAuth trustHost true relies on Host / X-Forwarded-Host
Affected file(s): src/lib/auth-config.ts
Impact: Misconfigured proxy can affect callback URLs. Standard for reverse-proxy deploys if the proxy is locked down.
Recommended remediation: Set AUTH_URL/NEXTAUTH_URL; restrict forwarded hosts at the edge.
Regression test required: no
```

---

# Low Findings

### SEC-P3-01

```
Finding ID: SEC-P3-01
Severity: P3 / LOW
Category: XSS
Title: Email template preview uses unsanitized dangerouslySetInnerHTML
Affected file(s): src/components/sales/email-template-manager.tsx
Affected route(s): Sales email template UI (client state only)
Affected function(s): renderBody
Evidence: t.body interpolated into HTML without encode; templates are useState, not persisted.
Attack scenario: User pastes HTML into their own template preview.
Impact: Self-XSS only unless persistence is added later (CSP unsafe-inline would then execute it).
Root cause: Preview convenience without sanitizer.
Exploitability: Low
Tenant impact: None
Recommended remediation: textContent or DOMPurify if templates become stored.
Regression test required: no unless persistence is added
```

### SEC-P3-02

```
Finding ID: SEC-P3-02
Severity: P3 / LOW
Category: Security headers
Title: Production CSP allows script-src 'unsafe-inline'; HSTS missing on unmatched routes
Affected file(s): src/middleware-security.ts, next.config.mjs
Evidence: Both CSP strings include 'unsafe-inline' for scripts. next.config headers() has no HSTS; middleware HSTS only on matcher.
Impact: Amplifies future stored XSS; marketing pages lack HSTS at app layer (may exist at CDN).
Exploitability: Low
Tenant impact: Platform-wide
Recommended remediation: Nonce/hash CSP; add HSTS in next.config headers().
Regression test required: no (hardening)
```

### SEC-P3-03

```
Finding ID: SEC-P3-03
Severity: P3 / LOW
Category: Security headers
Title: X-Frame-Options SAMEORIGIN conflicts with CSP frame-ancestors 'none'
Affected file(s): src/middleware-security.ts, next.config.mjs
Evidence: Both set X-Frame-Options SAMEORIGIN while CSP forbids framing.
Impact: Ambiguous clickjacking policy; CSP should win in modern browsers.
Exploitability: Low
Tenant impact: None
Recommended remediation: Align X-Frame-Options with DENY or drop it and rely on CSP.
Regression test required: no
```

### SEC-P3-04

```
Finding ID: SEC-P3-04
Severity: P3 / LOW
Category: File upload
Title: Magic-byte validation skipped when JEST_WORKER_ID is set
Affected file(s): src/lib/security/file-validation.ts (~101–105)
Evidence: NODE_ENV=test OR JEST_WORKER_ID → valid:true without magic check.
Impact: If a production process inherits JEST_WORKER_ID, malware disguised as PDF would pass.
Exploitability: Low
Tenant impact: None unless mis-set env
Recommended remediation: Gate skip on NODE_ENV===test only.
Regression test required: yes if env footgun is considered in-scope
```

### SEC-P3-05

```
Finding ID: SEC-P3-05
Severity: P3 / LOW
Category: File upload
Title: .xls/.doc mapped to ZIP/OOXML magic bytes
Affected file(s): src/lib/security/file-validation.ts EXTENSION_TO_MAGIC_TYPE
Evidence: xls→xlsx ZIP signature; any ZIP renamed .xlsx passes type check (size cap still applies).
Impact: ZIP-as-Office; not OLE2 .xls. Residual malware packing.
Exploitability: Low
Tenant impact: Single tenant
Recommended remediation: Reject legacy .xls/.doc or inspect OOXML members.
Regression test required: no
```

### SEC-P3-06

```
Finding ID: SEC-P3-06
Severity: P3 / LOW
Category: Authentication
Title: VIEWER role skips MFA by default
Affected file(s): src/lib/auth/mfa-roles.ts (MFA_REQUIRED_ROLES default ADMIN+OPERATOR)
Impact: Stolen VIEWER session is enough for SEC-P0-02 data vacuum.
Exploitability: Low (requires stolen VIEWER session)
Tenant impact: Cross tenant via P0-02
Recommended remediation: Require MFA for all roles on internet-facing deploys.
Regression test required: no
```

### SEC-P3-07

```
Finding ID: SEC-P3-07
Severity: P3 / LOW
Category: Authentication
Title: No password-reset or magic-link flow
Affected file(s): (absence) Prisma VerificationToken unused for reset
Impact: Not a vulnerability; operational gap. Stolen passwords cannot be self-serviced; also no reset enumeration.
Exploitability: n/a
Tenant impact: None
Recommended remediation: If added, use hashed tokens, expiry, rate limits, constant-time responses.
Regression test required: n/a
```

### SEC-P3-08

```
Finding ID: SEC-P3-08
Severity: P3 / LOW
Category: Audit logging
Title: Credentials login failures are not written to platform audit log
Affected file(s): src/lib/auth-config.ts authorize()
Impact: Brute-force and credential-stuffing lack a first-class forensic trail (rate limit 429s also unaudited).
Exploitability: n/a (detection gap)
Tenant impact: Platform-wide
Recommended remediation: Log auth.login.failure without leaking password; alert on threshold.
Regression test required: yes if implemented
```

### SEC-P3-09

```
Finding ID: SEC-P3-09
Severity: P3 / LOW
Category: AI / prompt injection
Title: Prompt sanitization is heuristic and orchestrator-only
Affected file(s): src/lib/security/prompt-sanitization.ts; src/lib/core/ai/orchestrator.ts
Evidence: Fence/role-prefix stripping; not used on all LLM paths; nested objects not sanitized.
Impact: Residual prompt injection; does not replace application authz (correctly unused as an authz substitute).
Exploitability: Low–Medium depending on untrusted document content in prompts
Tenant impact: Single tenant
Recommended remediation: Apply on every provider call; treat retrieved docs as untrusted data.
Regression test required: no
```

### SEC-P3-10

```
Finding ID: SEC-P3-10
Severity: P3 / LOW
Category: Privileged operations
Title: Skill runtime filesystem:scan has no root jail
Affected file(s): src/lib/skill-runtime/runtime/steps.ts
Affected route(s): POST /api/skills/evaluate (ADMIN)
Evidence: globSync with caller cwd; evaluate API is ADMIN-only.
Impact: ADMIN local file enumeration. Defense-in-depth only.
Exploitability: Low
Tenant impact: None (host filesystem)
Recommended remediation: Canonicalize cwd under repo root; reject ...
Regression test required: no
```

---

# False Positives / Defenses Verified

| Claim | Verdict |
|---|---|
| `$queryRawUnsafe` in RAG/ingestion is SQLi | **DEFENSE PRESENT** — bound parameters, static SQL |
| `child_process` RCE in app | **Not present** in `src/` production |
| Download routes are unauthenticated IDOR | **DEFENSE PRESENT** for Audit/LCOS/Decision/Office-AI/Sales export/Workflow record JSON (OPERATOR/VIEWER) |
| Sales CRM `?organizationId=` IDOR | **DEFENSE PRESENT** — compared to session org |
| Agent memory | **DEFENSE PRESENT** — scoped to `user.organizationId` |
| IFRS RAG `/api/knowledge/rag/search` trusts client org | **DEFENSE PRESENT** — hardcoded `"platform"` |
| AuditOS ADMIN cross-tenant via `assertEngagementAccess` | **DEFENSE PRESENT** — no ADMIN bypass |
| HubSpot CRM webhook HMAC bypass via length mismatch | **Not a bypass** — throws 500; route also session-blocked |
| `createNotification` callers inside trusted server modules | The **export** is the issue; internal use is fine if unpublished |
| Hardcoded production API keys in git | **Not found** |
| Demo `/auditos` auth bypass | **PUBLIC_BY_DESIGN** — must remain mock/seed only (policy); middleware does not enforce mock-only |
| NextAuth credentials login without session | **Working as designed** — bcrypt + JWT |
| Health `/api/platform/health` unauthenticated | **PUBLIC_BY_DESIGN** for load balancers; keep payload minimal (SEC-P2-03) |
| ABAC deny as a second lock | **Not a lock** — fail-open (SEC-P2-09) |

---

# Remediation Plan

Order by attacker value. Do not “improve authorization generally.”

| Priority | Action | Closes |
|---|---|---|
| 1 | Remove ADMIN bypass in `checkTenantAccess`. Add explicit platform-admin if needed. | P0-01, P0-04, several P1 |
| 2 | Scope `getPlatformNotificationsAction` (and health aggregator) to session org. | P0-02 |
| 3 | Scope retention `getExpiredRecords` by org; restrict run to platform-admin. | P0-03 |
| 4 | Bind `assertAdmin(organizationId)` to session org; fix org update/delete. | P0-04 |
| 5 | Authz on all Server Actions: `createNotification`, DecisionOS gov, `listWebhooksAction`. | P1-01, P1-02, P1-12 |
| 6 | Tenant-scope knowledge-mining APIs or delete them. | P1-05, P1-14 |
| 7 | Invite: admin-only; role ≤ caller. Mask SSO secrets. | P1-06, P1-07 |
| 8 | SSRF allowlist on all user URLs (webhooks, SIEM). | P1-08, P1-09 |
| 9 | Workflow membership `requireClientAccess` + org match; escalate-check cron-only. | P1-04, P1-11, P1-13 |
| 10 | Per-tenant intel webhook secrets + org-scoped contact lookup. | P1-03 |
| 11 | Outbox platform-admin only. | P1-10 |
| 12 | Default-deny middleware; MFA on `/admin`; trusted proxy for RL. | P2-01, P2-04 |
| 13 | Negative tests: cross-tenant VIEWER/ADMIN, unauthenticated actions, SSRF, retention. | Coverage gap |
| 14 | `npm audit fix` for brace-expansion/nanoid; plan Next.js upgrade for postcss/sharp. | Deps |

---

# Final Security Verdict

```
SECURITY STATUS: NO-GO
```

**Why NO-GO (evidence, not process):**

1. Any authenticated user can read other tenants’ operational titles and comments (SEC-P0-02).
2. Any tenant ADMIN is a platform superuser in `enforce()` (SEC-P0-01) and can administer other orgs’ users (SEC-P0-04).
3. Any tenant ADMIN can run global retention deletes (SEC-P0-03).
4. Multiple Server Actions perform sensitive operations without authentication.

A **single-tenant, fully trusted operator** pilot can operate **only with documented residual risk**. Multi-tenant production, customer pilots with more than one organization, or internet-exposed ADMIN UIs must not proceed until P0 items are fixed and re-audited.

```
P0 blockers: 4
P1 findings: 14
P2 findings: 16
P3 findings: 10

Authentication bypasses: 4
Authorization vulnerabilities: 18
Cross-tenant vulnerabilities: 11
IDOR/BOLA findings: 8
Critical dependency vulnerabilities: 0 (application-exploitable)
Known High toolchain vulnerabilities: 5 (Next/postcss/sharp/brace-expansion/nanoid)
Secrets exposed in git: 0
Runtime secret leakage: 1 (SSO clientSecret to clients)
Unprotected API routes: 11 public-or-unmatched of 75
Missing security tests: critical-path negatives listed in Security Test Coverage
```

**Honest validation label:** this audit is **static code evidence**. It did not include a live penetration test, authenticated browser exploit, or production environment inspection (`RATE_LIMITER`, `SCANNER_PROVIDER`, live SSO). External pen-test remains a stated production blocker in platform governance (ADR-109).

---

# Appendix A — Commands run

| Command | Result |
|---|---|
| Repository enumeration (glob/grep/read) | Completed |
| `git rev-parse HEAD` | `1e65d00211e84eaebedbbe842a30ee2fc2e41e32` |
| `npm audit --omit=dev` | 8 vulns (5 high, 3 moderate, 0 critical) |
| `npx tsc --noEmit` | Not run (audit-only; low-load) |
| `npm test` / `npm run build` | Not run (heavy; not requested as a fix cycle) |
| Live exploit / browser PoC | Not run |

**Heavy commands avoided:** full test suite, production build, prisma migrate, secret-value printing.

---

# Appendix B — Skills loaded

- `docs/AI_ENTRYPOINT.md`, `docs/DOCUMENTATION_AUTHORITY.md`
- `.skills/aqliya/aqliya-security-gate.md`
- `.skills/aqliya/aqliya-docs-authority.md`
- `.skills/aqliya/aqliya-execution-protocol.md`

Prior audit documents under `docs/audits/` were **not** used as authority. Code was re-traced.

---

# Appendix C — Terminal summary

```text
==================================================
AQLIYA DEEP SECURITY AUDIT
==================================================

Repository: C:/Users/PC/Documents/Aqliya
Commit: 1e65d00211e84eaebedbbe842a30ee2fc2e41e32
Date: 2026-08-31

Routes audited: 75 API route.ts files
Auth paths audited: Credentials, OAuth, SAML, MFA, SCIM, invites, registerTenant
Authorization paths audited: enforce/authorize/checkTenantAccess, product guards, Server Actions
Prisma access patterns audited: $queryRaw(Unsafe), unscoped findMany/findUnique, retention deletes

P0: 4
P1: 14
P2: 16
P3: 10

Cross-tenant vulnerabilities: 11
IDOR/BOLA: 8
Privilege escalation: 6 (invite ADMIN, tenant ADMIN→platform, SCIM ADMIN, Workflow membership, org role write, DecisionOS processEscalations)
Auth bypass: 4 (unauthenticated Server Actions)
Critical dependencies: 0 application-exploitable
Secrets: 0 in git; 1 runtime SSO secret leak
Unprotected routes: 11 public-or-unmatched

Security tests reviewed: cross-tenant suite, tenant-guard (encodes ADMIN bypass as pass), download routes, file-validation, prompt sanitization, headers, SCIM, notification aggregation (no org assert)

FINAL VERDICT:
NO-GO

Audit report:
docs/audits/AQLIYA_DEEP_SECURITY_AUDIT_2026-08-31.md
==================================================
```

---

# Remediation (2026-08-31)

Code was changed after this audit. The original findings above remain the historical record of commit `1e65d00211e84eaebedbbe842a30ee2fc2e41e32`.

Authoritative post-fix status: `docs/audits/AQLIYA_SECURITY_REMEDIATION_REPORT_2026-08-31.md`.

Authorization model: `docs/audits/AQLIYA_AUTHORIZATION_MODEL_REMEDIATION.md`.

## P0 status after remediation

| ID | Finding | Status |
|---|---|---|
| SEC-P0-01 | `checkTenantAccess()` treated `User.role === ADMIN` as platform superuser | **Fixed.** Cross-tenant only via `isPlatformAdmin()` env allow-list. Tenant ADMIN is scoped to `user.organizationId`. Organization/settings `resource.id` is treated as the target tenant. |
| SEC-P0-02 | Notification SSE/feed aggregated other tenants’ titles | **Fixed.** `getPlatformNotificationsAction` filters Decision, Workflow, LocalContent (via project), SalesDeal, and audit logs by session org. |
| SEC-P0-03 | Retention `getExpiredRecords()` unscoped | **Fixed.** `runScheduledRetention` requires `organizationId`. Tenant ADMIN cannot pass another org. Queries on org-owned models include `organizationId`. Models without org fields are skipped on tenant runs. |
| SEC-P0-04 | Tenant ADMIN user/org admin via client `organizationId` | **Fixed.** `assertAdmin` denies foreign org IDs. Org update/delete pass `tenantId`. `getSunbulStats` no longer scans all users/clients. |

## Related P1 closures (this cycle)

Unauthenticated `createNotification`, DecisionOS gov reads, `listWebhooksAction` (auth + secret stripping), sales intel webhook tenant binding, centralized SSRF, SSO list secret stripping, AI `authorizeAIAction` fail-closed + orchestrator wiring, knowledge-mining session org, Workflow membership email enumeration, outbox platform-admin, escalation-check tenant ADMIN scope.

Follow-up (same day): platform-global operator APIs locked to `isPlatformAdmin()`; AI spend/governance and retention policies/holds tenant-scoped; SCIM cannot mint `ADMIN` unless `SCIM_ALLOW_ADMIN_ROLE=true`.

Second follow-up (same day): middleware default-deny; SCIM per-org keys; JWT salt/lifetime/refresh; trusted-proxy IP; health secret disclosure removed; ABAC enforce fail-closed; CRM webhook org-bound; monitoring/operator UI split; platform operator Server Actions + SIEM session-org bind.

## Post-remediation verdict

See `AQLIYA_SECURITY_REMEDIATION_REPORT_2026-08-31.md`. The original audit verdict for the audited commit remains **NO-GO**. That verdict does not describe the tree after this remediation.
