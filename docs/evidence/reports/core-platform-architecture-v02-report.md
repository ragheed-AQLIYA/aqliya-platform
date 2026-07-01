# Core Platform Architecture — v0.2 Report (Agent 1)

**Date:** 2026-05-29
**Agent:** 1 — Core Platform Architecture (Foundation, Phase F)
**Branch:** `eid-sprint-stabilization-2026-05-29`
**Committed baseline:** `6034950` (working tree **NOT clean** — see Agent 0 P0-1)
**Wave:** 1 — Foundation freeze-or-extend
**Mode:** **DOCUMENTATION-ONLY** (no code/schema edits; all changes proposed as backlog)
**Trust principle:** AI assists. Humans decide. Evidence governs.
**Classification (unchanged, not upgraded):** Controlled pilot ready with conditions

> This report follows the program's required 9-section structure. It inspects the shared platform foundation (auth, tenants, RBAC, middleware, navigation, settings/admin, monitoring, audit, download/export safety) **as it exists in code today** and proposes — but does **not** apply — a prioritized, minimal-diff backlog. Core is FROZEN per `docs/source-of-truth/CORE_PLATFORM_ARCHITECTURE.md`; every primitive that touches auth/tenant/RBAC is treated as approval-gated.

---

## 1. Scope Inspected

### 1.1 Authority & source-of-truth docs read

- `docs/reports/aqliya-full-platform-build-program-plan.md` (Agent 0 master plan — baseline + coordination rules)
- `docs/source-of-truth/CORE_PLATFORM_ARCHITECTURE.md` (Phase 1 FROZEN; deferred primitives list)
- `docs/source-of-truth/ROUTE_STRATEGY.md` (route table, protected-prefix model, Download Security Standard)

### 1.2 Code reality inspected (narrow Read/Grep/Glob only)

| Area | Files read |
| ---- | ---------- |
| Route perimeter | `src/middleware.ts` |
| Auth / session | `src/lib/auth.ts`, `src/lib/auth-config.ts`, `src/lib/auth-next.ts` |
| Tenant contexts | `src/lib/platform/platform-organization-context.ts`, `client-workspace-context.ts`, `project-context.ts` |
| Guards | `src/lib/platform/guards/workspace-guard.ts`, `guards/platform-org-guard.ts`, `src/lib/platform/require-platform-admin.ts`, `src/lib/local-content/guards.ts` |
| Admin scoping | `src/lib/platform/admin-metrics-scope.ts` |
| Navigation | `src/lib/platform/navigation.ts` |
| API routes | `api/metrics`, `api/audit/evidence/[evidenceId]/download`, `api/decisions/[decisionId]/evidence/[evidenceId]/download`, `api/office-ai/download`, `api/local-content/.../evidence/[evidenceId]/download` (route inventory via Glob: 14 `route.ts`) |
| Admin/settings pages | `(dashboard)/settings/page.tsx`, `settings/audit-logs/page.tsx`, `(dashboard)/monitoring/page.tsx`, `audit/admin/users/page.tsx` |
| Schema | `prisma/schema.prisma` (model/enum index + Platform/Org/User/PlatformAuditLog/OfficeAi models in full) |

### 1.3 Not run (Low-Load Execution Protocol)

`npm run build|lint|test`, `tsc --noEmit`, `prisma generate|validate|migrate`, dev server, Docker, browser automation, dependency installs, broad scans. No application code or schema was edited.

---

## 2. Current Reality

### 2.1 Auth & session

- **NextAuth v5, JWT strategy, Credentials provider** (`auth-config.ts`). Password verified via `bcrypt` against `User.passwordHash`. No OAuth/SSO/MFA.
- The JWT/session carries: `id`, `email`, `name`, `role`, `organizationId`, `organization`, and `platformOrganizationId` (derived from `Organization.platformOrganizationId` at sign-in).
- `getCurrentUser()` throws `"Unauthenticated"`; `requireUserContext(role)`, `requireOrgAccess(orgId, role)`, `requireDecisionAccess(decisionId, role)` layer role + single-org checks.

### 2.2 Route perimeter (middleware)

- `src/middleware.ts` enforces **authentication only** (token presence via `getToken`). It performs **no RBAC and no tenant check**. Model = public-allowlist (`publicExact` + `publicPrefixes`) ∪ explicit `matcher` of protected prefixes.
- Unauthenticated page → redirect `/login?callbackUrl=…`; unauthenticated API → `401 UNAUTHENTICATED` JSON. Security headers + rate-limit applied on every matched path.
- **Matcher is an explicit allowlist of prefixes**, not a catch-all. API families *not* listed in `matcher` (e.g. `/api/pilot-review`, `/api/custom-product-submit`, any future `/api/*`) bypass the middleware perimeter entirely and depend solely on their own handler guards.

### 2.3 Tenant model (as built)

Two parallel tenancy spines coexist:

1. **Platform spine (target):** `PlatformOrganization → ClientWorkspace → Project`, with `PlatformAuditLog` carrying `platformOrganizationId / clientWorkspaceId / projectId`. Read-only resolver helpers exist (`*-context.ts`) that bridge legacy IDs → platform IDs.
2. **Legacy/product spines (still authoritative for access):** DecisionOS scopes by `Organization.id`; AuditOS scopes by `AuditOrganization.id`; LocalContentOS scopes by `LocalContentProject.organizationId`; WorkflowOS/Sunbul by `SunbulClient` + `SunbulUserMembership`.

The platform `User` belongs to exactly **one** legacy `Organization` (`User.organizationId`); `platformOrganizationId` is only an *indirect* attribute via that org. There is **no** `User.platformOrganizationId` column and **no** multi-workspace membership model at the platform level.

### 2.4 RBAC (as built)

- One platform role enum: **`UserRole = ADMIN | OPERATOR | VIEWER`** (`schema.prisma`). Hierarchy implemented in `hasRequiredRole()` (ADMIN ⊃ OPERATOR ⊃ VIEWER).
- Enforcement is **per-product / per-route**, not centralized. There is no shared `PermissionEnforcer` (explicitly deferred, FROZEN).
- Product-local capability maps exist independently — e.g. LocalContentOS `canPerformAction(user, action)` maps actions→roles inside `src/lib/local-content/guards.ts`. AuditOS and Sunbul carry their **own** user/role models (`AuditUser`, `SunbulUserRole`, `SunbulUserMembership`), separate from the platform `User`.
- Admin surfaces: `requirePlatformAdminPage()` redirects non-`ADMIN` to `/access-denied`. Confirmed wired on `/settings/audit-logs` and `/monitoring`. **`/audit/admin/users/page.tsx` renders a client component with no page-level admin gate** (no `requirePlatformAdminPage` / role check found in the admin component); it relies on middleware-auth + whatever its server actions enforce — unverified here.

### 2.5 Tenant guards (as built)

- `platform-org-guard.ts` and `workspace-guard.ts` are **report-only / diagnostic** by default. `requirePlatformOrganization()` is documented as *"NOT yet wired into any existing routes."* Tenant isolation in production paths is therefore enforced by **ad-hoc equality checks inside each route**, not by these shared guards.

### 2.6 Download / export safety (as built)

The Download Security Standard (ROUTE_STRATEGY rule 15) requires: (a) auth at entry, (b) tenant-safe access check returning **404 on any failure (never 403 "exists but not yours")**, (c) success audit log, (d) `Cache-Control: private, no-store`.

| Route | Auth | Tenant scope key | Not-yours response | Audit | Std-compliant |
| ----- | ---- | ---------------- | ------------------ | ----- | ------------- |
| `api/audit/evidence/*/download` | `getAuditActor` / signed token | `AuditEngagement.organizationId` | **404** | yes | ✅ |
| `api/office-ai/download` | `requireUserContext("VIEWER")` | `OfficeAiTask.platformOrganizationId` | **404** | yes | ✅ |
| `api/decisions/*/evidence/*/download` | `requireDecisionAccess("VIEWER")` | `Decision.organizationId` | **403** ("Access denied") | yes | ⚠️ leaks existence |
| `api/local-content/*/evidence/*/download` | `assertProjectAccess(…, "view")` | `LocalContentProject.organizationId` | **403** ("…another organization") | yes | ⚠️ leaks existence |
| `api/workflowos/documents/*/download` | (WorkflowOS guard — not re-read this pass) | Sunbul client/membership | — | yes (per docs) | not re-verified |

The audit-evidence route is also the **only** one that does not use the shared `buildDownloadResponse()` Core helper (hand-rolls headers) and accepts a **signed download token** path that sets `actorRole: "viewer"` and trusts `payload.org` for the tenant check.

### 2.7 Navigation / settings / monitoring (as built)

- `navigation.ts` is a **static, role-agnostic** `NAVIGATION_ITEMS` list (no permission/tenant filtering). It still advertises `SalesOS` (L3 prototype) and `/organizations` (L3 prototype) as first-class nav.
- `/settings` is a **client-only mock** (`"use client"`, local state, labeled "Internal Preview") — auth-gated by middleware but not admin-gated and not persisted.
- `/monitoring` and `/settings/audit-logs` are ADMIN-gated server pages; metrics are tenant-scoped via `buildPlatformOrgMetricFilters(platformOrganizationId)` and **fail-closed** (no `platformOrganizationId` ⇒ empty/`scoped:false`).

---

## 3. Gaps

### 3.1 Route access matrix (route family → auth → RBAC → tenant scope → notes)

| Route family | Auth required | RBAC (today) | Tenant scope key | Enforced where | Notes / gap |
| ------------ | ------------- | ------------ | ---------------- | -------------- | ----------- |
| `/` + marketing (`/about`,`/products/*`,`/insights/*`,`/buyers/*`,…) | No (public) | none | none | — | Allowlisted |
| `/login`, `/access-denied` | No | none | none | — | Public auth pages |
| `/auditos/*` (demo) | No (public) | none | none | — | Mock/read-only by contract |
| `/audit/*` | Yes | product-local (AuditUser) | `AuditOrganization.id` | route/actions | Separate identity spine |
| `/audit/admin/users` | Yes | **none at page level** | — | client component | **Admin gate not enforced at page** (verify actions) |
| `/decisions/*` | Yes | `requireUserContext`/`requireDecisionAccess` | `Organization.id` | route/actions | 403 on cross-tenant (leaks existence) |
| `/local-content/*` | Yes | `canPerformAction` map | `LocalContentProject.organizationId` | `assertProjectAccess` | 403 on cross-tenant (leaks existence) |
| `/assistant/*` (Office AI) | Yes | `requireUserContext` | `OfficeAiTask.platformOrganizationId` | route/actions | Platform-org scoped (good model) |
| `/workflowos/*`, `/sunbul/*` | Yes | Sunbul membership/role | `SunbulClient` + membership | route/actions | Separate identity spine; Sunbul = 302 alias |
| `/intelligence/*` | Yes | `requireUserContext` | `Organization.id` | route/actions | DecisionOS-backed |
| `/organizations/*` | Yes | none documented | mock | — | L3 prototype; nav-advertised |
| `/sales/*` | Yes | none | none (mock) | — | L3 prototype; nav-advertised |
| `/settings` | Yes | **none (not admin-gated)** | none | middleware only | Client mock; "Internal Preview" |
| `/settings/workspaces`,`/settings/platform-organization`,`/settings/audit-logs` | Yes | **ADMIN** | `platformOrganizationId` | `requirePlatformAdminPage` | Platform-org scoped |
| `/monitoring` | Yes | **ADMIN** | `platformOrganizationId` | `requirePlatformAdminPage` + metric filters | Fail-closed |
| `/published/recommendation/*` | Yes | org-scoped action | `Organization.id` | backing action | Legacy |
| `/api/auth/*`, `/api/health` | No | none | none | — | Public |
| `/api/custom-product-submit`, `/api/pilot-review` | No | none | none | handler | **Not in middleware `matcher`** (handler-only) |
| `/api/metrics` | Yes | **ADMIN** | `platformOrganizationId` | handler | Fail-closed; scoped |
| `/api/audit/*` | Yes | product-local | `AuditOrganization.id` | handler | 404 on cross-tenant ✅ |
| `/api/office-ai/*` | Yes | `requireUserContext` | `platformOrganizationId` | handler | 404 ✅ |
| `/api/decisions/*` | Yes | `requireDecisionAccess` | `Organization.id` | handler | 403 on cross-tenant ⚠️ |
| `/api/local-content/*` | Yes | `assertProjectAccess` | `LocalContentProject.organizationId` | handler | 403 on cross-tenant ⚠️ |
| `/api/workflowos/*` | Yes | Sunbul membership | Sunbul client | handler | Permissioned per docs |
| `/api/pilot/*` | Yes (matcher) | handler | — | handler | In matcher; handler enforces |

### 3.2 Identified gaps

- **G1 — Fragmented identity.** Three user/role spines: platform `User` (`UserRole`), `AuditUser`, `Sunbul*` membership. No single principal; cross-product RBAC reasoning is impossible from one model.
- **G2 — Inconsistent tenant granularity.** Access checks key off **legacy `Organization.id`** (DecisionOS, LocalContentOS), **`AuditOrganization.id`** (AuditOS), or **`platformOrganizationId`** (Office AI, metrics). A user in legacy org A cannot see org B data even within the same `PlatformOrganization`, while admin metrics aggregate at the platform-org level — an inconsistency that will surface as "counts don't match what I can open."
- **G3 — Download Security Standard not uniform.** `/decisions` and `/local-content` downloads return **403** ("exists but not yours") instead of **404**, leaking resource existence and contradicting ROUTE_STRATEGY rule 15. The audit-evidence route bypasses the shared `buildDownloadResponse()` helper.
- **G4 — Tenant guards exist but are unwired.** `requirePlatformOrganization` / `workspace-guard` are report-only; real isolation is hand-rolled per route, so correctness depends on every author repeating the pattern (and they don't, per G3).
- **G5 — RBAC is per-product, no central enforcer.** Capability→role maps are duplicated (`hasRequiredRole`, `canPerformAction`, AuditOS, Sunbul). No `Permission` concept beyond three coarse roles; no resource-level or workspace-level grants.
- **G6 — Admin gating inconsistency.** `/settings/audit-logs` + `/monitoring` are correctly ADMIN-gated; `/audit/admin/users` has **no page-level admin gate**; `/settings` shell is auth-only.
- **G7 — Middleware matcher is an allowlist, not catch-all.** New `/api/*` routes are unprotected by default unless explicitly added to `matcher` — a fail-open default for the perimeter.
- **G8 — Navigation advertises prototypes.** `navigation.ts` surfaces SalesOS (L3) and `/organizations` (L3) as peers of pilot-ready products, and is not permission/tenant-filtered.
- **G9 — No platform primitives for ReviewRequest / ApprovalDecision / ExportJob / Notification / SystemSetting.** These exist only as product-local fields/enums (e.g. `ApprovalStatus`, `AuditApprovalRecord`, `LocalContentApproval`) or not at all.

### 3.3 Platform primitives — current state + target interface sketch

> "Current" = what backs it in code today. Target interfaces are **sketches for review**, not approved designs. Anything touching auth/tenant/RBAC is FROZEN/approval-gated.

| Primitive | Current state | Backing (today) | Target interface sketch |
| --------- | ------------- | --------------- | ----------------------- |
| **Organization** | IMPLEMENTED (dual) | `PlatformOrganization` (bridge) + legacy `Organization` + `AuditOrganization` | `resolveOrg(lookup) → PlatformOrgContext` (already exists, read-only); target: make `PlatformOrganization` the single tenant root, legacy orgs become child scopes |
| **User** | PARTIAL / fragmented | `User` (+ `AuditUser`, `Sunbul*` separate) | `Principal { id, email, role, platformOrganizationId, memberships[] }` unifying product identities; add `User.platformOrganizationId` (denormalized) |
| **Role** | IMPLEMENTED (coarse) | `UserRole` enum (3 values) | keep enum; add product-scoped role mapping table or `Membership.role` per workspace |
| **Permission** | MISSING (implicit) | `hasRequiredRole`, `canPerformAction` (per-product) | `can(principal, action, resource) → boolean` central matrix; capability registry per product |
| **ProductWorkspace** | PARTIAL | `ClientWorkspace.productAccess` (Json) + `Project` | `WorkspaceContext { id, platformOrganizationId, products: Record<ProductKey,bool> }`; wire `productAccess` into guards |
| **AuditEvent** | IMPLEMENTED | `PlatformAuditLog` + `auditLogger()` Core helper (19 sites) + product `AuditEvent`/`*AuditEvent` tables | keep `PlatformAuditLog` as canonical; deprecate per-product audit tables over time |
| **FileAsset** | IMPLEMENTED (per-product) | `OfficeAiFile`, `AuditEvidence`, `LocalContentEvidence`, `SunbulDocument` + `storage/*` provider | `FileAsset { id, storageKey, mimeType, sizeBytes, ownerScope }` + shared storage provider (already partly shared) |
| **EvidenceItem** | IMPLEMENTED (per-product) | `DecisionEvidence`, `AuditEvidence(+Link)`, `LocalContentEvidence` | `EvidenceItem` interface over product tables; deferred per FROZEN (`EvidenceService`) |
| **ReviewRequest** | PARTIAL (per-product) | `AuditReviewComment`, `LocalContentReview`, `SunbulReview`, governance `approval-state` | `ReviewRequest { subjectRef, requestedBy, status, reviewers[] }` shared state machine |
| **ApprovalDecision** | PARTIAL (per-product) | `Approval`, `AuditApprovalRecord`, `LocalContentApproval`, `ApprovalStatus` enum | `ApprovalDecision { subjectRef, decidedBy, status, conditions? }` over governance `approval-state.ts` |
| **ExportJob** | PARTIAL (synchronous) | `buildExportResponse()` + product exporters (pdfkit/xlsx); no job record | `ExportJob { id, productKey, format, status, fileAssetId }` if async exports needed |
| **Notification** | MISSING | none (settings mock toggles only) | `Notification { recipientId, kind, payload, readAt }` — net-new, out of FROZEN Core scope |
| **SystemSetting** | MISSING (mock) | `/settings` local-state only | `SystemSetting { scope, key, value }` keyed by platform-org/workspace |

---

## 4. Proposed Architecture (target, approval-gated)

**Direction (must not invert):** `Foundation → Core Services → {Intelligence, Governance} → Factory → Portfolio → QA`. Foundation should converge the two tenancy spines onto `PlatformOrganization` and unify identity, **without** silently expanding FROZEN Core.

**Target shape:**

1. **Single principal:** `User` gains a denormalized `platformOrganizationId` and an optional `memberships` relation (workspace-scoped roles). `AuditUser` / `Sunbul*` become product *profiles* linked to one `User`.
2. **Central permission check:** a `can(principal, action, resource)` enforcer (the deferred `PermissionEnforcer`) that products call instead of duplicating role maps. Build only under explicit approval (P1 in Agent 0 risks).
3. **Wired tenant guard:** promote `requirePlatformOrganization` / workspace guard from report-only to enforcing on new routes; standardize cross-tenant failures to **404**.
4. **Perimeter hardening:** convert middleware API matching to a **deny-by-default** posture (protect `/api/*` then allowlist public APIs) so new routes are protected automatically.
5. **Permission-aware navigation:** filter `NAVIGATION_ITEMS` by role + `productAccess`; hide/flag L0–L3 prototypes.

**Prioritized backlog (PROPOSED — do NOT apply this wave).** Each item lists exact path + minimal-diff intent. Items touching auth/tenant/RBAC require approval (FROZEN Core).

| # | Pri | Type | File(s) | Minimal-diff proposal | Risk / gate |
| - | --- | ---- | ------- | --------------------- | ----------- |
| B1 | P1 | guard fix | `src/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts` | Map "Access denied" on the *resource* check to **404** (not 403) to stop existence leak; keep 401 for unauth | Behavior change — needs QA re-validate |
| B2 | P1 | guard fix | `src/lib/local-content/guards.ts` + local-content download route | Return **404** for `organizationId` mismatch instead of 403 `FORBIDDEN`; align with Download Security Standard | Behavior change — gated |
| B3 | P1 | admin gating | `src/app/audit/admin/users/page.tsx` (+ admin server actions) | Add server-side `requirePlatformAdminPage()` (or audit-admin equivalent) at the page boundary; verify underlying actions enforce ADMIN | Auth-adjacent — gated |
| B4 | P1 | perimeter | `src/middleware.ts` | Add deny-by-default for `/api/:path*` with explicit public-API allowlist, OR add a lint/test asserting every `/api` route is in `matcher` | Perimeter change — QA gate |
| B5 | P2 | label/docs | `src/lib/platform/navigation.ts` | Flag/segregate SalesOS (L3) + `/organizations` (L3) as "prototype"; add `disabled`/badge; document not pilot-ready | Low risk (UI label) |
| B6 | P2 | label/docs | `src/app/(dashboard)/settings/page.tsx` | Keep "Internal Preview" badge; add explicit note that no persistence/admin gating exists (already mock) | Low risk |
| B7 | P2 | consistency | audit-evidence download route | Migrate hand-rolled headers to shared `buildDownloadResponse()`; review token path (`actorRole:"viewer"`, trusted `payload.org`) | Touches audit trail — gated |
| B8 | P2 | docs | `docs/source-of-truth/ROUTE_STRATEGY.md` (owned by Agent 6 — *propose only*) | Record 403-vs-404 deviations + matcher-allowlist caveat; do not edit (single-owner) | Coordination |
| B9 | P3 | schema (gated) | `prisma/schema.prisma` (Agent 5 owns — *propose only*) | Add `User.platformOrganizationId String?` (denormalized) + index; backfill migration | **Approval-gated** schema |
| B10 | P3 | schema (gated) | `prisma/schema.prisma` | Introduce `Membership { userId, clientWorkspaceId, role }` to model multi-workspace access | **Approval-gated** schema |
| B11 | P3 | primitive (gated) | new `src/lib/platform/permission.ts` | Central `can(principal, action, resource)` enforcer; products migrate off local role maps | FROZEN (`PermissionEnforcer`) — approval required |
| B12 | P3 | primitive (gated) | promote `guards/platform-org-guard.ts` to enforcing | Wire `requirePlatformOrganization` into new routes; default 404 | FROZEN (`OrgResolver`) — approval required |

### 4.1 Schema change proposals (clearly approval-gated)

Owned by **Agent 5**; listed here as proposals only. None applied.

```prisma
// PROPOSAL ONLY — requires approval per AGENTS.md §13 + Agent 0 P1/P3
model User {
  // ...existing fields...
  platformOrganizationId String?  // denormalized from Organization for direct scoping
  // @@index([platformOrganizationId])
}

// PROPOSAL ONLY — multi-workspace membership (replaces single-org assumption)
model Membership {
  id                String          @id @default(cuid())
  userId            String
  clientWorkspaceId String
  role              UserRole        @default(VIEWER)
  // @@unique([userId, clientWorkspaceId])
}
```

---

## 5. Files Changed

| File | Change |
| ---- | ------ |
| `docs/reports/core-platform-architecture-v02-report.md` | **Created** — this report |

No application code, schema, route, config, navigation, or single-owner doc was modified. `PRODUCT_STATUS_MATRIX.md`, `AGENTS.md`, and `aqliya-product-taxonomy-v1.1.md` were **not** edited (coordination rule honored).

---

## 6. Commands Run

```text
# Read-only inspection only (Low-Load Execution Protocol)
Glob   src/lib/platform/**/*.ts
Glob   src/app/api/**/route.ts ; src/app/**/{admin,settings,monitoring}/**/page.tsx
Grep   ^model|^enum  prisma/schema.prisma
Grep   requireUserContext|requirePlatformAdmin|ADMIN  src/components/audit/admin
Read   middleware.ts, auth*.ts, platform/*-context.ts, guards/*, require-platform-admin.ts,
       admin-metrics-scope.ts, navigation.ts, local-content/guards.ts, schema.prisma,
       api/{metrics,audit,decisions,office-ai,local-content} download routes,
       settings/monitoring/audit-logs/admin pages
```

No `git` mutations. No `git diff --stat` was needed (documentation-only; no staged changes beyond this file). No build/lint/test/prisma/docker/dev-server/browser commands run.

---

## 7. Validation Result

| Check | Result |
| ----- | ------ |
| `tsc --noEmit` | **Not run** (Low-Load; delegate to QA Agent 13) |
| `prisma validate` | **Not run** (Low-Load) |
| `npm run lint|test|build` | **Not run** (heavy) |
| Documentation deliverable produced | **Pass** — report created with 9 sections, route access matrix, primitives table |
| Code/schema changed | **None** (documentation-only wave) |

**Interpretation:** Findings are grounded in the **current working tree** (uncommitted, per Agent 0 P0-1), not the committed `6034950`. No engineering-green claim is made or transferred. Behavior-changing backlog items (B1–B4, B7) must be re-validated by QA on a committed tree before adoption.

---

## 8. Risks

| ID | Risk | Severity | Mitigation |
| -- | ---- | -------- | ---------- |
| R1 | Working tree dirty (Agent 0 P0-1) — findings may shift once committed/stashed | High | Re-confirm against committed baseline before applying any backlog item |
| R2 | Changing 403→404 (B1/B2) alters API contract; clients/tests may assert 403 | Medium | QA re-validate; update tests in same PR |
| R3 | Centralizing RBAC (B11) or wiring OrgResolver (B12) violates FROZEN Core if done without approval | High | Treat as approval-gated; coordinate Agent 1 + Agent 4 (no simultaneous auth+governance edits) |
| R4 | Schema changes (B9/B10) are Agent 5-owned and block portfolio writes | Medium | Sequence via Agent 5 schema pass; AGENTS.md §13 gate |
| R5 | `/audit/admin/users` gating unverified — may already be enforced in actions, or may be a real hole | Medium | Verify server actions before assuming exposure; do not weaken existing behavior |
| R6 | Editing single-owner docs (ROUTE_STRATEGY/matrix/taxonomy) would cause contention | Medium | Proposals routed to owning agents (6/9/10); not edited here |

---

## 9. Next Lowest-Load Step

1. **Owner decision on Agent 0 P0-1** (commit vs stash the ~49 uncommitted paths) so backlog items can be evaluated against a single baseline. Until then, no behavior changes.
2. **Cheapest high-value verification (read-only):** confirm whether `/audit/admin/users` server actions enforce ADMIN (resolves R5/B3 severity) and whether any `/api/*` route is missing from the middleware `matcher` (resolves B4 scope).
3. **First safe apply candidates (after baseline committed + approval):** B5/B6 (pure UI labels/docs, no auth/tenant impact), then B1/B2 (403→404 alignment) as a single QA-validated PR. Defer B11/B12 (FROZEN Core primitives) to an explicitly approved Agent 1 + Agent 4 joint pass.

---

## Agent 1 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE_WITH_CONCERNS** (dirty working tree inherited; backlog proposed, not applied) |
| **Code changed** | No |
| **Schema changed** | No |
| **Single-owner docs touched** | No |
| **Classification** | Controlled pilot ready with conditions (unchanged — not upgraded) |
| **Deliverable** | `docs/reports/core-platform-architecture-v02-report.md` |

*Agent 1 — Core Platform Architecture. Foundation inspected at the working tree on top of `6034950`; RBAC is per-product, tenancy spans two spines, Core remains FROZEN. AI assists. Humans decide. Evidence governs.*
