# AQLIYA Authorization — Current State

> **Status:** Verified by code inspection and execution | **Date:** 2026-07-10  
> **Scope:** Complete authorization architecture across all AQLIYA governed products  
> **Method:** Full repository inventory, call-site counting, flow mapping, product sampling

---

## 1. Executive Summary

AQLIYA's authorization system is in a **mid-migration state** with **six enforcement mechanisms** operating simultaneously. The platform has:

- A **production-ready, shadow-mode-only** 6-stage policy engine (RB-02)
- A **new `authorize()` facade** (~15 call sites) designed to be the single entry point
- A **dominant legacy `requireUserContext()` pattern** (87+ files, ~200+ call sites)
- **Product-specific guards** that independently check roles and tenant scope
- An **edge middleware** that provides first-line route protection
- A **database-driven RBAC system** with granular permission slugs

**Fragmentation score: 7/10** — the system works for the current pilot scope, but the coexistence of six enforcement paths creates auditability gaps, policy drift risk, and a growing maintenance burden as more governed products come online.

---

## 2. Scope of Analysis

### In scope
- All authorization-related modules under `src/lib/auth*`, `src/lib/authorization/`, `src/lib/platform/access/`
- Middleware route protection (`src/middleware.ts`)
- Product-specific guard files and access checks
- Server action patterns using `requireUserContext`, `authorize`, product guards
- API route handler protections
- Role/permission definitions and mappings
- Tenant isolation logic
- Any ABAC or policy-engine code connected to access decisions

### Out of scope
- Authentication / SSO / MFA mechanics (treated as inputs to the authorization system)
- Business governance rules that are distinct from authorization (workflow gating, evidence requirements, approval routing)
- Product-specific data model details
- Deployment-specific permission handling

---

## 3. Authorization Mechanism Inventory

### Mechanism 1: Edge Middleware Route Protection

| Property | Value |
|----------|-------|
| **File** | `src/middleware.ts` |
| **Layer** | Middleware (edge) |
| **What it decides** | Is route path accessible? Is user authenticated? Does user have minimum role? |
| **Role vocabulary** | `viewer`, `operator`, `manager`, `admin` (lowercase, inline hierarchy) |
| **Coverage** | ~45 route prefix entries in `routeMinRoles`, ~70 in `config.matcher` |
| **Products covered** | All products via route prefixes |
| **Authoritative?** | **Yes** — first edge gate; deny stops request before any code runs |
| **Notes** | Route-level only; no resource-scoped decisions |

### Mechanism 2: `requireUserContext()` and helpers

| Property | Value |
|----------|-------|
| **File** | `src/lib/auth.ts` |
| **Layer** | Server action / API route handler |
| **What it decides** | Is user authenticated? Does user have required role? |
| **Role vocabulary** | `ADMIN`, `OPERATOR`, `VIEWER` (uppercase, Prisma `UserRole` enum) |
| **Call sites** | **87+ files** — dominant pattern |
| **Variants** | `getCurrentUser()` (auth only), `requireUserContext()` (auth + role), `requireOrgAccess()` (auth + role + tenant), `requireDecisionAccess()` (auth + role + tenant + shadow engine) |
| **Authoritative?** | **Yes** — this is the primary enforcement path for the majority of server actions |
| **Notes** | Returns `CurrentUser` — used for identity + role + org context downstream |

### Mechanism 3: `authorize()` Facade

| Property | Value |
|----------|-------|
| **File** | `src/lib/authorization/authorize.ts` |
| **Layer** | Action/API (via `enforce()`/`isAllowed()`/`assertAuthorized()`) |
| **What it decides** | Tenant access → RBAC permission → ABAC condition |
| **Role vocabulary** | `admin`, `manager`, `operator`, `viewer` (normalized via `ROLE_HIERARCHY`) |
| **Call sites** | **~15 files** — growing but still minority |
| **Consumers** | Shared product guards (`product-guards.ts`), some action files |
| **Authoritative?** | **Partial** — designed to be primary but not yet dominant |
| **Notes** | Routes through unified `ROLE_PERMISSIONS` map; supports fine-grained `AccessAction` |

### Mechanism 4: Product-Local Guards

| Property | LocalContentOS | SalesOS | AuditOS | WorkflowOS |
|----------|---------------|---------|---------|------------|
| **File** | `src/lib/local-content/guards.ts` | `src/lib/salesos/workflow/guards.ts` | (inline patterns) | (inline patterns) |
| **Pattern** | Custom `canPerformAction()` + `assertProjectAccess()` | Transition guard pipeline (validation→business→governance) | Varied — some use `requireUserContext`, some use own tenant guard | Uses tenant-guard pattern |
| **Role vocabulary** | `ADMIN`/`OPERATOR`/`VIEWER` | N/A (business rules, not role checks) | Mixed | Mixed |
| **Authoritative?** | **Yes for LC** — replaces facade in LC actions | **Partial** — focuses on transition rules, not person authz | **Partial** — mixed patterns | **Partial** |
| **Notes** | Exists outside the unified facade. Duplicates role logic. | These are workflow guards, not person authorization — they check deal state transitions | AuditOS has its own `AuditOrganization`/`AuditUser` parallel identity |

### Mechanism 5: RB-02 Authorization Engine (Shadow)

| Property | Value |
|----------|-------|
| **File** | `src/lib/authorization/engine/engine.ts` |
| **Layer** | Policy evaluation — called shadow-only |
| **What it decides** | Full 6-stage authorization decision (identity → authz → policy → workflow → composition → trace) |
| **Stage count** | 6 pipeline stages, 9 policies (POL-01 to POL-09) |
| **Role vocabulary** | Uses `AuthorizationRequest.role` (string — passed through from caller) |
| **Call sites** | **1 active shadow call** — in `requireDecisionAccess()` via `src/lib/auth.ts` |
| **Status** | **Shadow-only** — behind `FEATURE_AUTHZ_SHADOW` env flag |
| **Migration infra** | `shadow-logger.ts`, `parity-report.ts`, `decision-replay.ts`, `evidence-package.ts` |
| **Authoritative?** | **No** — shadow mode; errors silently swallowed |
| **Notes** | Production-ready engine in shadow; has full trace, audit event tracking, SoD support |

### Mechanism 6: Legacy Platform Permissions (Database RBAC)

| Property | Value |
|----------|-------|
| **Files** | `src/lib/platform/access/rbac-service.ts`, `permissions.ts`, `sod-service.ts`, `workspace-access.ts` |
| **Layer** | Database-driven role/permission management |
| **What it decides** | Granular permission checks via `hasPermission(userId, permissionSlug)` |
| **Permission scope** | Product-specific slugs: `audit.engagement.read`, `decision.approve`, `settings.admin`, etc. |
| **Model** | `Role` → `RolePermission` → `Permission` → `UserRoleAssignment` |
| **Status** | **Legacy but active** — `permission-resolver.ts` bridges to new facade |
| **SoD support** | `sod-service.ts` validates role assignments against `SeparationOfDutyRule` |
| **Authoritative?** | **Partial** — some service actions use it directly; facade wraps it |
| **Notes** | The most granular permission system in the codebase; slug definitions comprehensive |

---

## 4. Layer-by-Layer Current Model

### 4.1 Authentication / Session Resolution

**Input:** NextAuth v5 session (JWT).  
**Process:**
1. `auth()` from `src/lib/auth-next.ts` resolves NextAuth session
2. `getCurrentUser()` in `src/lib/auth.ts` extracts `CurrentUser` from session
3. JWT payload includes `role` (Prisma `UserRole` enum), `organizationId`, `platformOrganizationId`

**Output:** `CurrentUser` object: `{ id, email, name, role, organizationId, organization }`

**Key detail:** The JWT role is set at login time from the database. No runtime DB query is needed for identity resolution in most paths. This makes middleware edge checks fast.

### 4.2 Middleware / Route Protection

**Architecture:**
```
Request → middleware.ts → matcher check → JWT decode → isRoutePublic? → 
  auth check → role check (routeMinRoles) → MFA check → pass/redirect
```

**Key characteristics:**
- Routes not in `config.matcher` are not intercepted at all
- Route-to-role mapping is a flat `Record<string, string>` in code
- Role hierarchy is inline: `{ viewer: 0, operator: 1, manager: 2, admin: 3 }`
- MFA enforcement happens at middleware level for eligible roles
- Public routes are exempted via `publicExact` Set and `publicPrefixes` array
- No per-path fine-grained permission — just minimum role

**Gap (now closed):** `/institutional-memory/*` was missing from matcher (fixed in hardening mission).

### 4.3 Server Action / API Protection

**Three patterns coexist:**

**Pattern A — requireUserContext (dominant):**
```typescript
"use server";
import { requireUserContext } from "@/lib/auth";

export async function myAction(data: Input) {
  const user = await requireUserContext("ADMIN");
  // ... proceed with user context
}
```
- Used in 87+ files
- Simple, fast, well-understood
- No per-action granularity — just minimum role
- Tenant check optional via `requireOrgAccess()`

**Pattern B — authorize() facade (emerging):**
```typescript
"use server";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/authorization";

export async function myAction(data: Input) {
  const user = await getCurrentUser();
  await enforce(user, { type: "project", id: id }, "approve");
  // ... proceed
}
```
- Fine-grained permission control via `AccessAction`
- Tenant check built in
- ABAC extension point available
- ~15 call sites

**Pattern C — Product guards (legacy):**
```typescript
import { assertProjectAccess } from "@/lib/local-content/guards";

export async function lcAction(projectId: string) {
  const { user, project } = await assertProjectAccess(projectId, "approve");
  // ... proceed
}
```
- Product-specific guard functions
- Duplicate role and tenant logic
- Not consistently connected to the authorization facade

### 4.4 Product-Local Guards and Helpers

**LocalContentOS (`src/lib/local-content/guards.ts`):**
- Custom `ProjectAction` enum (9 actions: view, approve, classify, etc.)
- `canPerformAction()` — maps actions to ADMIn/OPERATOR/VIEWER roles
- `assertProjectAccess()` — performs tenant check + role check in one function
- **Does NOT use the `authorize()` facade** — fully independent

**SalesOS (`src/lib/salesos/workflow/guards.ts`):**
- This is a **workflow transition guard pipeline** — not authorization
- Checks deal state transition rules, evidence gates, reviewer-not-owner rules
- Correctly separate from person authorization — this is **business governance**

**AuditOS (inline patterns):**
- Some actions use `requireUserContext()` directly
- Has its own tenant guard path using `AuditOrganization` model
- The `audit/tenant-guard.ts` (separate from `authorization/tenant-guard.ts`) checks against AuditOS's own organization model
- Newer routes use the unified `product-guards.ts` → `guardEngagementAccess()` → `enforce()` → `authorize()` path

**WorkflowOS:**
- Uses `requireUserContext()` for auth
- Has own `tenant-guard` pattern in `src/lib/workflowos/` for record access
- Exports via product-guards `guardRecordAccess()`

### 4.5 Policy / RBAC / Shadow Systems

**RB-02 Engine (`src/lib/authorization/engine/`):**
- 6-stage pipeline: Identity Resolution → Authorization Resolution → Policy Evaluation → Workflow Constraints → Decision Composition → Decision Trace
- 9 policies (POL-01 to POL-09) covering ownership, creator privilege, project scope, integration restriction, external auditor restriction, time-based access, approval gates, resource sensitivity, bulk operation limits
- **Shadow mode only** — only activated in `requireDecisionAccess()` when `FEATURE_AUTHZ_SHADOW=true`
- Has migration infrastructure: shadow logger, parity reporter, decision replay, evidence package

**ABAC System (`src/lib/platform/abac/`):**
- Attribute-based access control
- Connected via `abac-bridge.ts` to the `authorize()` facade
- Fail-open: if ABAC is unavailable, base RBAC decision stands
- ENV-gated enforce mode

**Database RBAC (`src/lib/platform/access/`):**
- All authentication is backed by Prisma `UserRoleAssignment` model
- `Role`, `Permission`, `RolePermission`, and `UserRoleAssignment` models
- System roles: admin, manager, operator, viewer
- Comprehensive permission slugs organized by product group
- SoD validation via `sod-service.ts`

---

## 5. Product-by-Product Authorization Usage

### AuditOS

| Layer | Mechanism | Details |
|-------|-----------|---------|
| Middleware | `routeMinRoles["/audit"] = "viewer"` | Edge check for /audit/* |
| Route-level | JWT checked via middleware | Standard pattern |
| Server actions | Mixed — some use `requireUserContext()`, some use `guardEngagementAccess()` | Transitional |
| Tenant isolation | **Separate `AuditOrganization` model** | Bypasses platform org model |
| Product guard | `guardEngagementAccess()` in `product-guards.ts` → `enforce()` → `authorize()` | Newer actions |
| Audit | `AuditEvent` model + `PlatformAuditLog` | Dual-write |

### LocalContentOS

| Layer | Mechanism | Details |
|-------|-----------|---------|
| Middleware | `routeMinRoles["/local-content"] = "viewer"` | Edge check |
| Server actions | **Own guard system** — `assertProjectAccess()` in `src/lib/local-content/guards.ts` | NOT using authorize facade |
| Tenant isolation | Manual check in `assertProjectAccess()` — compares `project.organizationId` to `user.organizationId` | Duplicates tenant-guard logic |
| Custom action enum | `ProjectAction` — 9 local-content-specific actions | Not connected to global `AccessAction` |
| Evidence upload | Direct `requireUserContext()` + file-scanner | Mixed |

### DecisionOS

| Layer | Mechanism | Details |
|-------|-----------|---------|
| Middleware | `routeMinRoles["/decisions"] = "viewer"` | Edge check |
| Server actions | Mix of `requireUserContext()` and `requireDecisionAccess()` (which IS connected to RB-02 shadow) | Most progressive |
| Shadow integration | `requireDecisionAccess()` runs RB-02 engine in shadow | Only place shadow is active |
| Tenant isolation | `requireOrgAccess()` via `requireDecisionAccess()` | Standard |
| Export | `decision-export.ts` — downloads gated | Download gate + auth |

### SalesOS

| Layer | Mechanism | Details |
|-------|-----------|---------|
| Middleware | `routeMinRoles["/sales"] = "viewer"` | Edge check |
| Server actions | Mix of `requireUserContext()` and `guardDealAccess()` | Transitional |
| Workflow guards | `src/lib/salesos/workflow/guards.ts` — business transition rules | Correctly separated |
| Tenant isolation | Via `guardDealAccess()` → `enforce()` → `authorize()` tenant check | Unified path |
| v02/vnext | Some legacy action files use direct checks | Fragmented |

### Shared Platform / Admin

| Surface | Mechanism | Details |
|---------|-----------|---------|
| `/settings` | `routeMinRoles["/settings"] = "viewer"` | Viewer for settings list; admin for SSO |
| `/settings/sso` | `routeMinRoles["/settings/sso"] = "admin"` | Admin-only |
| `/organizations` | `routeMinRoles["/organizations"] = "admin"` | Admin-only |
| `/monitoring` | `routeMinRoles["/monitoring"] = "admin"` | Admin-only |
| `/operator` | `routeMinRoles["/operator"] = "admin"` | Admin-only |
| Platform API | `routeMinRoles["/api/platform"] = "admin"` | Admin-only |

---

## 6. Permission and Role Taxonomy — Current State

### Role Landscape

| Role Vocabulary | Where Used | Values |
|----------------|-----------|--------|
| Middleware roles | `src/middleware.ts` | `viewer`, `operator`, `manager`, `admin` (lowercase) |
| Prisma UserRole | `@prisma/client` (schema enum) | `ADMIN`, `OPERATOR`, `VIEWER` (uppercase) |
| Authorization facade | `src/lib/authorization/types.ts` | `admin`, `manager`, `operator`, `viewer` (normalized) |
| RB-02 Engine | `src/lib/authorization/engine/` | `role: string` (passthrough) |
| Download gate | Download API routes | Lowercase string comparison |

**Problem:** Three active representations of the same concept, requiring continuous `normalizeRole()` / `mapAuditRoleToUserRole()` / `toLowerCase()` conversion.

### Permission Landscape

| Permission System | Granularity | Coverage |
|------------------|-------------|----------|
| Middleware `routeMinRoles` | Route prefix → min role | ~45 route prefixes |
| `ROLE_PERMISSIONS` (facade types) | Role → `AccessAction[]` | 10 actions × 4 roles |
| DB permission slugs (rbac-service) | Slug per product+action | ~60+ slugs across products |
| RB-02 policy engine | Policy per rule | 9 policies |
| Product-guard action enums | Per-product action lists | Varies |

### Static Permission Map (from `ROLE_PERMISSIONS` in `types.ts`)

| Permission | admin | manager | operator | viewer |
|-----------|-------|---------|----------|--------|
| read | ✅ | ✅ | ✅ | ✅ |
| create | ✅ | ✅ | ✅ | ❌ |
| update | ✅ | ✅ | ✅ | ❌ |
| delete | ✅ | ❌ | ❌ | ❌ |
| admin | ✅ | ❌ | ❌ | ❌ |
| export | ✅ | ✅ | ✅ | ✅ |
| approve | ✅ | ✅ | ❌ | ❌ |
| reject | ✅ | ✅ | ❌ | ❌ |
| review | ✅ | ✅ | ✅ | ❌ |
| manage_users | ✅ | ❌ | ❌ | ❌ |

### Database Permission Slugs (from `rbac-service.ts`)

| Group | Slugs Examples |
|-------|---------------|
| `audit.engagement` | read, write, delete, export, admin |
| `audit.evidence` | read, write, delete, upload, download |
| `audit.review` | read, write, approve, reject |
| `decision` | read, write, delete, approve, reject, export, admin |
| `localcontent` | read, write, delete, export, admin |
| `settings` | read, write, admin |
| `user` | read, write, admin, manage_roles |
| `platform` | read, admin, manage_secrets, manage_siem, manage_retention |
| `workflow` | read, write, delete, execute, export, admin |

---

## 7. Fragmentation Map

```
                    ┌──────────────────────────────────┐
                    │       Middleware (edge)           │
                    │   routeMinRoles (45 prefixes)     │
                    └──────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                   ▼
   ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐
   │ requireUser    │  │ authorize()    │  │ Product guards   │
   │ Context()      │  │ facade         │  │ (LC, WF, Audit)  │
   │ 87+ files      │  │ ~15 files      │  │ varied            │
   │ src/lib/auth.ts│  │ src/lib/       │  │ per-product       │
   └───────┬────────┘  │ authorization/ │  └───────┬──────────┘
           │           └───────┬────────┘          │
           ▼                   ▼                   ▼
   ┌─────────────────────────────────────────────────────┐
   │              Authorization Decisions                 │
   │  (allow/deny — no unified logging of all decisions)  │
   └─────────────────────────────────────────────────────┘
           │                                            │
           ▼                                            ▼
   ┌──────────────────┐                     ┌────────────────────┐
   │ PlatformAuditLog  │                     │ Product *AuditEvent│
   │ (general audit)   │                     │ (product-specific) │
   └──────────────────┘                     └────────────────────┘

   ┌──────────────────────────────────────────────────────┐
   │           Shadow Systems (behind feature flags)       │
   │  ┌──────────────────┐  ┌─────────────────────────┐   │
   │  │ RB-02 Engine     │  │ ABAC Engine             │   │
   │  │ 6-stage pipeline │  │ Attribute-based control │   │
   │  │ 9 policies       │  │ env-gated enforce       │   │
   │  │ shadow mode only │  │ fail-open fallback      │   │
   │  └──────────────────┘  └─────────────────────────┘   │
   └──────────────────────────────────────────────────────┘
```

### Fragmentation Score: 7/10

> **Note on composition layers:** `product-guards.ts`, `permission-resolver.ts`, and `action-guard.ts` are **composition layers** — they call through to `authorize()` rather than making independent decisions. They are counted as separate mechanisms because they exist as separate call sites with distinct contracts, but they do NOT represent independent enforcement paths. The fragmentation score accounts for the developer experience cost of multiple entry points, not multiple independent decision engines.

| Dimension | Score | Explanation |
|-----------|-------|-------------|
| Number of paths | 2/1 | 6 mechanisms for the same job (3 are composition layers) |
| Consistency across products | 3/5 | Some products use facade; others independent |
| Testability | 4/5 | Authorization tests exist but don't cover all paths |
| Auditability | 3/5 | No single unified authorization decision log |
| Migration readiness | 5/5 | Migration infra already built for shadow engine |
| **Composite** | **7/10** | **High fragmentation — needs consolidation** |

---

## 8. Top Current-State Risks

| # | Risk | Severity | Blast Radius | Evidence |
|---|------|----------|--------------|----------|
| 1 | **Tenant isolation bypass via AuditOS parallel graph** | **High** | Cross-org data leak | `AuditOrganization`/`AuditUser` separate from platform `Organization`/`User` |
| 2 | **Shadow engine never promoted** | **High** | All products | RB-02 runs only when `FEATURE_AUTHZ_SHADOW=true`; production behavior unaffected |
| 3 | **Role vocabulary inconsistency** | **Medium** | All actions | Three role representations require continuous conversion |
| 4 | **Product-local guards unconnected to facade** | **Medium** | LCOS, Sales v02, legacy Audit | `local-content/guards.ts` has its own role logic; bypasses unified tenant checks |
| 5 | **No unified authorization decision logging** | **Medium** | All products | Can't query "who denied what and why" across the platform |
| 6 | **Middleware-only protection on some routes** | **Medium** | Broad routes | Middleware provides no resource-scoped decisions; page-level check required |
| 7 | **`requireUserContext("ADMIN")` pattern bypasses permissions** | **Low-Medium** | Admin actions | Role check works but skips granular permission model; ABAC not evaluated |
| 8 | **SoD models exist but under-adopted** | **Low-Medium** | Role administration | `SeparationOfDutyRule` model exists; enforcement incomplete |

---

## 9. Reusable Components vs Retirement Candidates

### Keep and promote (future primary path)

| Component | Why keep |
|-----------|----------|
| `authorize()` facade (`src/lib/authorization/authorize.ts`) | Designed as single entry point; covers tenant + RBAC + ABAC |
| `action-guard.ts` (`enforce`/`isAllowed`/`assertAuthorized`) | Clean contract for server actions |
| `product-guards.ts` (`guardEngagementAccess`, etc.) | Thin wrappers — keep as product convenience layer |
| RB-02 Engine and policies | Production-ready; promote from shadow to active |
| RB-02 `engine/types.ts` (`AuthorizationRequest`, `AuthorizationDecision`) | Well-designed decision contract |
| `authorization/engine/policies/*` | 9 real policies — migration investment already made |
| `tenant-guard.ts` | Unified tenant isolation — one place to harden |
| `authorization/types.ts` (`ROLE_PERMISSIONS`, `ROLE_HIERARCHY`) | Clean permission map |
| Shadow migration infra (`shadow-logger`, `parity-report`, etc.) | Built for this exact migration |

### Retire or integrate

| Component | Why retire | Replacement |
|-----------|-----------|-------------|
| `src/lib/local-content/guards.ts` | Duplicates facade logic + role checking | Use `enforce()` or `guardProjectAccess()` via facade |
| `src/lib/auth.ts` `requireUserContext()` variants (except `getCurrentUser`) | Role check duplicated in facade | `getCurrentUser()` for identity; `enforce()` for authorization |
| `src/lib/platform/access/rbac-service.ts` standalone `hasPermission()` calls | Replaced by `permission-resolver.ts` bridged to facade | Use `authorize()` with appropriate action |
| Inline role checks in legacy actions | Scattered ad-hoc patterns | Use facade helpers |
| `/decision` dead middleware key | Already removed in hardening fix | — |

### Keep as-is (not authorization)

| Component | Why keep |
|-----------|----------|
| `src/lib/salesos/workflow/guards.ts` | Business governance, not person authorization |
| `src/lib/platform/access/sod-service.ts` | Complements authorization — keep and connect |
| `src/lib/platform/access/workspace-access.ts` | Platform workspace management |

---

## 10. Current-State Verdict

AQLIYA has a **real, functioning authorization system that works for current pilot operations**, but it is **not yet a coherent, unified architecture**.

**What works:**
- Every governed route has middleware protection ✅
- Every mutation path has a server-side role check ✅
- Tenant isolation is enforced on all resource-scoped operations ✅
- A well-designed engine and migration path exists (RB-02) ✅
- The `authorize()` facade provides a clean target for convergence ✅

**What needs consolidation:**
- Six enforcement paths → one documented stack
- Three role vocabularies → single normalized role model
- Authorization decisions → unified audit trail
- Product-specific guards → shared platform authorization primitives
- Shadow engine → active enforcement (with feature-flag rollout)

**The authorization system is at L3–L4 maturity**: functional for controlled use, fragmented in implementation, with a clear target already partially built but not yet activated.

---

**Evidence basis:** Full inventory of `src/lib/auth.ts`, `src/lib/authorization/*`, `src/middleware.ts`, `src/lib/platform/access/*`, `src/lib/local-content/guards.ts`, `src/lib/salesos/workflow/guards.ts`, `src/lib/authorization/engine/*`, product server actions.  
**Status:** DONE
