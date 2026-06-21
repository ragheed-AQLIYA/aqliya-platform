# ABAC Readiness Assessment

**Classification:** Decision-grade authorization architecture  
**Date:** 2026-06-21  
**Scope:** RBAC current state, ABAC target model, blockers, migration strategy  
**Method:** Read-only code inspection — no implementation  
**Related:** `AUTHORIZATION_EVOLUTION_PLAN.md` (2026-06-20), `src/lib/platform/abac/`, `src/core/access/`

---

## Executive Summary

AQLIYA has **strong RBAC foundations** and a **built-but-dormant ABAC engine**. Authorization is architecturally centralized but **operationally scattered** across products. Organization isolation is good in mature products; workspace isolation and evidence access are inconsistent. ABAC migration readiness is **LOW–MEDIUM on infrastructure, HIGH on integration debt**.

| Dimension | Score (0–10) | Status |
|-----------|-------------:|--------|
| RBAC schema & seeds | 8 | Built, underused |
| RBAC runtime enforcement | 6 | Middleware + ad hoc guards |
| ABAC engine | 7 | Built, zero production wiring |
| Unified auth gate | 3 | Designed, not adopted |
| Organization isolation | 7 | Consistent in L5 products |
| Workspace isolation | 3 | Diagnostic only |
| Evidence access unification | 4 | Product-fragmented |
| Sensitivity model | 5 | Inconsistent enums |
| **Overall ABAC readiness** | **5.2/10** | **CONDITIONAL — do not enable ABAC policies until gate unified** |

---

## 1. Current RBAC Assessment

### 1.1 Platform Session Roles (Primary Runtime)

| Source | Roles | Enforcement |
|--------|-------|-------------|
| `User.role` (Prisma) | `ADMIN`, `OPERATOR`, `VIEWER` | JWT via NextAuth v5 |
| `src/middleware.ts` | Hierarchy: viewer(0) → operator(1) → manager(2) → admin(3) | ~40 route prefixes |
| `src/lib/auth.ts` | Same 3 roles + `requireOrgAccess()` | ~100+ call sites |
| `src/core/access/access-control.ts` | Action matrix: read→VIEWER, mutate→OPERATOR, approve→ADMIN | **Tests only — 0 production imports** |

**Gap:** Middleware includes `manager` level; `UserRole` enum has no `MANAGER`. AuditOS uses separate `AuditUser.role` with 6 values (`admin`, `operator`, `reviewer`, `manager`, `partner`, `viewer`).

### 1.2 Database RBAC (Built, Disconnected)

| Component | Path | Status |
|-----------|------|--------|
| Models | `Permission`, `Role`, `RolePermission`, `UserRoleAssignment` | Prisma schema ~3162–3226 |
| Service | `src/lib/platform/access/rbac-service.ts` | `hasPermission()` defined |
| Seeds | `src/lib/platform/access/seed-permissions.ts` | 55+ permission slugs |
| SoD | `src/lib/platform/access/sod-service.ts` | HARD/SOFT conflicts |

**Critical gap:** Session JWT carries `User.role`, not DB-assigned roles. `hasPermission()` is never called outside `rbac-service.ts`. Permission query lacks `organizationId` filter — cross-org bleed risk if wired without fix.

### 1.3 Product-Scoped Static Matrices

| Product | Enforcement | Pattern |
|---------|-------------|---------|
| AuditOS | `requireRole(actor, [...])` in ~20+ action files | Hardcoded role lists per action |
| SalesOS | `requireSalesPermission()` + `assertSalesAccountAccess()` | Static matrix on `UserRole` |
| LocalContentOS | `assertProjectAccess()` + `canPerformAction()` | Project + org scoping |
| LocalContactOS | Org match + sensitivity export gate | **Closest to ABAC today** |
| DecisionOS | `requireDecisionAccess()` | Org + decision membership |
| Downloads | `can(principal, permission)` in `platform/access/permissions.ts` | Possible role casing bug: `ADMIN` vs `admin` |

### 1.4 Authorization Flow (Current — Fragmented)

```
Request
  ├── Middleware (routeMinRoles) ── coarse role, no DB
  ├── Session helpers (requireUserContext) ── org match ad hoc
  ├── Product guards (requireRole, assertProjectAccess, etc.) ── scattered
  ├── DB RBAC (hasPermission) ── NEVER CALLED
  └── ABAC (evaluateAccess) ── NEVER CALLED
```

---

## 2. Target Model: RBAC + ABAC Hybrid

### 2.1 Design Principles

1. **Deny by default** — already in `CoreAccessControl`; must become universal
2. **RBAC first, ABAC refines** — role grants baseline; attributes restrict within role
3. **Single decision point** — all paths through `AuthorizationGate.evaluate()`
4. **Audit every denial** — extend PlatformAuditLog with `auth.denied` events
5. **Human-readable policies** — ABAC policies stored in DB, versioned, org-scoped

### 2.2 Target Architecture

```
Request (route / action / API / download)
        │
        ▼
┌───────────────────────────────────────┐
│  AuthorizationGate.evaluate()         │
│  src/core/access/ (extended)          │
├───────────────────────────────────────┤
│  1. Authenticate (session/API key)    │
│  2. Build AbacContext                 │
│  3. RBAC: hasPermission(org-scoped)   │
│  4. ABAC: evaluateAccess(policies)     │
│  5. Product guard (legacy adapter)    │
│  6. Audit log (allow + deny)          │
└───────────────────────────────────────┘
        │
        ▼
   ALLOW / DENY (403/404 tenant-safe)
```

### 2.3 Attribute Model

#### Subject (User/Actor)

| Attribute | Source | Used today? |
|-----------|--------|-------------|
| `user.id` | Session | Yes |
| `user.role` | Session / AuditUser | Yes (inconsistent) |
| `user.organizationId` | Session | Yes |
| `user.platformOrganizationId` | Session | SalesOS only |
| `user.workspaceIds[]` | **Missing** | No |
| `user.clearanceLevel` | **Missing** | No |
| `user.mfaVerified` | JWT | Partial |

#### Resource

| Attribute | Source | Used today? |
|-----------|--------|-------------|
| `resource.organizationId` | Entity | Yes |
| `resource.workspaceId` | Entity | Stored, not enforced |
| `resource.ownerId` / `createdById` | Entity | Partial |
| `resource.sensitivity` | Entity metadata | Contacts, Sales — inconsistent enums |
| `resource.productSlug` | Context | Ad hoc |
| `resource.evidenceId` | Entity | Per-product |
| `resource.exportStatus` | Entity | Contacts, WorkflowOS |
| `resource.approvalStatus` | Workflow state | Product-specific |

#### Environment

| Attribute | Source | ABAC support |
|-----------|--------|--------------|
| `time.hour`, `time.dayOfWeek` | Server clock | `condition-evaluator.ts` supports |
| `request.ip` | Headers | Not in evaluator |
| `request.channel` | Context | Not defined |

### 2.4 Rule Categories (Target Policies)

#### Ownership Rules

| Rule ID | Policy | RBAC fallback | ABAC condition |
|---------|--------|---------------|----------------|
| OWN-01 | Creator can read own drafts | OPERATOR+ | `resource.createdById == user.id` |
| OWN-02 | Creator cannot approve own submission | ADMIN | SoD: creator ≠ approver |
| OWN-03 | Account owner sees Sales deal evidence | salesos:read | `resource.ownerId == user.id` OR role manager+ |

#### Organization Rules

| Rule ID | Policy | Enforcement |
|---------|--------|-------------|
| ORG-01 | Tenant isolation — deny cross-org | `user.organizationId == resource.organizationId` |
| ORG-02 | Platform ADMIN cross-tenant | Explicit allow with audit |
| ORG-03 | SCIM-provisioned users bound to default org | `sso-service.ts` pattern |

#### Workspace Rules

| Rule ID | Policy | Current state |
|---------|--------|---------------|
| WS-01 | User must belong to workspace for project access | **NOT ENFORCED** |
| WS-02 | ClientWorkspace scopes LocalContent projects | `clientWorkspaceId` stored, not checked in guards |
| WS-03 | ContentStudio workspace isolation | Org-level only |

**Blocker:** No `UserWorkspaceMembership` model. `UserRoleAssignment.workspaceId` is audit metadata only, not in schema.

#### Sensitivity Rules

| Rule ID | Policy | Products |
|---------|--------|----------|
| SENS-01 | `confidential` requires ADMIN or explicit clearance | Contacts, Sales (different enums) |
| SENS-02 | `sensitive` export requires approval | Contacts: `exportStatus == approved` |
| SENS-03 | RAG retrieval filtered by sensitivity metadata | RAG knowledge metadata — not enforced at query |

**Target enum (platform-wide):** `PUBLIC | INTERNAL | RESTRICTED | CONFIDENTIAL`

Map legacy: Contacts `normal/sensitive/confidential` → INTERNAL/RESTRICTED/CONFIDENTIAL; Sales `standard/restricted/confidential` → same.

#### Evidence Rules

| Rule ID | Policy | Current |
|---------|--------|---------|
| EV-01 | Evidence download requires product read + evidence permission slug | Slugs exist, not enforced on routes |
| EV-02 | Malware-scanned files only downloadable | ClamAV integrated, not universal gate |
| EV-03 | Evidence linked to engagement/project scope | Per-product |
| EV-04 | Signed download tokens bypass role — log + expire | AuditOS pattern exists |

**Blocker:** `platform/evidence/evidence-service.ts` is a stub. No unified evidence registry.

#### Approval Rules

| Rule ID | Policy | Products |
|---------|--------|----------|
| APR-01 | Export requires APPROVED workflow state | WorkflowOS, DecisionOS, LC |
| APR-02 | AI output requires human review before export | `governedAIExecute`, Office AI |
| APR-03 | SoD: submitter ≠ approver | `sod-service.ts` — not wired to actions |
| APR-04 | Committee vote quorum | DecisionOS — product-local |

---

## 3. Blockers for ABAC Migration

### Blocker B1: No Unified Authorization Gate (CRITICAL)

`requireServerActionAccess()` has zero production imports. Enabling ABAC without a single gate means patching 200+ scattered checks.

**Resolution:** Phase 1 — mandate gate on all new mutations; migrate high-risk paths (downloads, exports, AI) first.

### Blocker B2: ABAC Engine Unwired (CRITICAL)

`evaluateAccess()` in `abac-service.ts` is only consumed by tests. No middleware hook, no action wrapper.

**Resolution:** Phase 2 — call ABAC inside gate after RBAC pass; default ALLOW if no policies match (explicit opt-in deny policies).

### Blocker B3: Dual/Triple Role Systems (HIGH)

Three role namespaces: `User.role`, `AuditUser.role`, DB `Role.slug`. ABAC conditions reference `role.slug` but session carries different shape.

**Resolution:** Phase 1 — `RoleResolver.normalize(session)` → canonical slug before evaluation.

### Blocker B4: Workspace Not First-Class (HIGH)

`workspace-guard.ts` is report-only. No membership model. ABAC cannot evaluate `workspace.id`.

**Resolution:** Phase 3 — add workspace membership; enforce in LC/ContentStudio guards before ABAC policies.

### Blocker B5: Inconsistent Sensitivity (MEDIUM)

Four different sensitivity representations across products and RAG.

**Resolution:** Phase 2 — platform enum + migration mapping layer (no schema change initially — metadata transform).

### Blocker B6: Evidence Fragmentation (MEDIUM)

9+ product evidence models; download routes each implement own auth.

**Resolution:** Phase 3 — evidence facade (see IC-P0-04) with unified download authorization hook.

### Blocker B7: DB RBAC Org Scope (MEDIUM)

`hasPermission()` query missing `organizationId` filter.

**Resolution:** Phase 1 — fix before any wiring.

### Blocker B8: No Policy Admin UI (LOW for pilot, HIGH for enterprise)

ABAC policy CRUD exists in service but no operator UI/API routes in routine paths.

**Resolution:** Phase 4 — admin surface at `/settings/policies` (ADMIN only).

---

## 4. Migration Strategy

### Phase 0: Preconditions (Week 1) — No ABAC yet

| Step | Action | Owner |
|------|--------|-------|
| 0.1 | Fix `hasPermission()` org scope | Platform |
| 0.2 | Fix `can()` role casing normalization | Platform |
| 0.3 | Complete `platform-audit.ts` migration | Platform |
| 0.4 | Document canonical role mapping table | Governance |

**Exit criteria:** RBAC service safe to call; audit path unified.

### Phase 1: Unified Gate (Weeks 2–4)

| Step | Action | Risk |
|------|--------|------|
| 1.1 | Extend `requireServerActionAccess()` with org + action + resource context | LOW |
| 1.2 | Wire gate to download routes (audit, decision, LC evidence) | MEDIUM |
| 1.3 | Wire gate to export actions (WorkflowOS, DecisionOS, LC, Contacts) | MEDIUM |
| 1.4 | Wire gate to AI execution entry (`product-ai-bridge`) | HIGH |
| 1.5 | Log denials to PlatformAuditLog | LOW |
| 1.6 | Migrate middleware to call DB RBAC for `/api/*` routes (optional enhancement) | MEDIUM |

**Exit criteria:** All export/download/AI paths through gate; denial audit verified.

### Phase 2: ABAC Shadow Mode (Weeks 5–7)

| Step | Action | Risk |
|------|--------|------|
| 2.1 | Build `AbacContext` builder from session + resource | LOW |
| 2.2 | Call `evaluateAccess()` in gate — **log only, do not enforce** | LOW |
| 2.3 | Seed default policies: SENS-02, APR-01, ORG-01 | LOW |
| 2.4 | Unify sensitivity enum mapping | MEDIUM |
| 2.5 | Compare ABAC shadow decisions vs actual allows — report mismatches | LOW |

**Exit criteria:** <5% unexpected mismatches on pilot org; policy catalog reviewed.

### Phase 3: ABAC Enforcement (Weeks 8–10)

| Step | Action | Risk |
|------|--------|------|
| 3.1 | Enable enforce mode per policy (feature flag per org) | HIGH |
| 3.2 | Add workspace membership model + WS-01 policy | HIGH |
| 3.3 | Evidence facade with EV-01/EV-02 | HIGH |
| 3.4 | Wire SoD service to approval actions | MEDIUM |
| 3.5 | Deprecate scattered `requireRole()` — adapter to gate | MEDIUM |

**Exit criteria:** Pilot org on full ABAC; AuditOS retains AuditUser roles via adapter.

### Phase 4: Enterprise ABAC (Weeks 11–16)

| Step | Action |
|------|--------|
| 4.1 | Policy admin UI |
| 4.2 | Custom org policies (not just system defaults) |
| 4.3 | Policy versioning + audit |
| 4.4 | ABAC decision export for SOC2 evidence |
| 4.5 | Pen test scope includes authorization bypass attempts |

---

## 5. RBAC + ABAC Decision Matrix

| Scenario | RBAC alone | ABAC required |
|----------|------------|---------------|
| Route access (/audit, /sales) | ✅ Middleware | Optional time-based |
| CRUD within org | ✅ Role + org match | Owner rules for drafts |
| Cross-org access | ❌ Deny (except ADMIN) | ADMIN + audit policy |
| Evidence download | ⚠️ Partial | Sensitivity + scan status |
| Export PDF | ⚠️ Product gates | Approval state + sensitivity |
| AI generation | ⚠️ Role only | Data classification + budget |
| Contact confidential export | ❌ RBAC insufficient | ✅ Already attribute-like |
| Workspace project access | ❌ Not enforced | ✅ WS-01 required |

---

## 6. Evidence Appendix

### Key Files

| Path | Role |
|------|------|
| `src/middleware.ts` | Edge RBAC |
| `src/lib/auth.ts` | Session + org |
| `src/core/access/server-action-guard.ts` | Unified gate (unwired) |
| `src/lib/platform/access/rbac-service.ts` | DB RBAC |
| `src/lib/platform/abac/abac-service.ts` | ABAC engine |
| `src/lib/platform/abac/condition-evaluator.ts` | Attribute operators |
| `src/lib/platform/guards/workspace-guard.ts` | Diagnostic only |
| `src/lib/platform/evidence/evidence-service.ts` | Stub |
| `src/lib/audit/actor-context.ts` | AuditOS roles |
| `src/actions/contact-actions.ts` | Sensitivity export gate |
| `src/__tests__/cross-tenant-isolation.test.ts` | Tenant tests |

### Prisma Models (Authorization)

- `User`, `UserRole` enum
- `Permission`, `Role`, `RolePermission`, `UserRoleAssignment`
- `AbacPolicy`, `AbacPolicyCondition`, `AbacPolicyAssignment`
- `AuditUser` (separate role enum)

---

## 7. Recommendations

1. **Do not seed ABAC policies in production until Phase 1 gate is live** — policies without enforcement create false confidence.
2. **Treat Contacts sensitivity export gate as the reference pattern** for SENS-02 implementation.
3. **Do not merge AuditUser roles into User.role** — use adapter; AuditOS pilot depends on fine roles.
4. **Fix DB RBAC org scope before any demo to enterprise buyers** — latent security defect.
5. **Align with Intelligence Core P0-03** — auth gate is shared prerequisite.

**Document status:** DONE — decision-grade ABAC readiness assessment.
