---
title: "RB-02B — Authorization Discovery Report (Wave 0)"
status: active
program: "Platform Authorization"
phase: "Implementation — Wave 0 (Discovery)"
version: "1.0"
date: 2026-06-28
classification: implementation-baseline
---

# Authorization Discovery Report — Wave 0

> **Purpose:** Complete inventory of all current authorization points before RB-02B migration. This is the **BEFORE** baseline. Every item here must be either migrated to the new Authorization Engine or explicitly exempted.

---

## Executive Summary

| Metric | Count |
|--------|:-----:|
| **Guard/authorization files** | 17 files |
| **Unique guard function names** | 34 (`require*` + `assert*` + `can*` + helpers) |
| **Guard call sites (all products)** | ~433+ |
| **Direct role comparison instances** | 70 (`role ===` in .ts + .tsx) |
| **Admin bypass patterns** | 6 distinct locations |
| **Middleware role-route mappings** | 31 route prefixes |
| **Products with separate guard systems** | 5 (AuditOS, LocalContentOS, SalesOS, DecisionOS, WorkflowOS) |

---

## 1. Authorization Systems Inventory

### 1.1 Unified Authorization Facade (`src/lib/authorization/`)

| File | Purpose |
|------|---------|
| `action-guard.ts` | Unified facade: `enforce()`, `isAllowed()`, `assertAuthorized()`, `guardRoleLevel()` |
| `authorize.ts` | Core `authorize()` — routes through tenant isolation, RBAC, ABAC |
| `types.ts` | Shared types: `PrincipalRole`, `CurrentUser`, `AccessAction`, `Permission`, `ROLE_HIERARCHY`, `ROLE_PERMISSIONS` |
| `tenant-guard.ts` | Unified tenant isolation: `checkTenantAccess()`, `assertTenantAccess()` |
| `abac-bridge.ts` | ABAC bridge: `evaluateAbac()` |
| `permission-resolver.ts` | Permission resolution: `resolvePermissions()`, `hasPermission()`, `hasPermissionSlug()` |
| `product-guards.ts` | Thin wrappers: `guardEngagementAccess()`, `guardProjectAccess()`, etc. — **zero usage in actions** |

**Adoption:** The `enforce()` facade is used in only **8 locations** across the entire codebase. The product wrappers are defined but unused.

### 1.2 Product-Specific Guard Systems

| System | File | Functions Used | Primary Consumer |
|--------|------|----------------|-----------------|
| **LocalContentOS** | `src/actions/localcontent-guards.ts` | `requireProjectAccess`, `requireWorkbookAccess`, `requireWorkbookLineAccess`, `requireDataRequestAccess`, `requireOrganizationAccess`, `requirePatternSuggestionAccess`, `requireMatchReviewAccess` | `localcontent-workbook-actions.ts`, `localcontent-review-actions.ts` |
| **LocalContentOS** | `src/lib/local-content/guards.ts` | `canPerformAction()`, `assertProjectAccess()`, `resolveProjectContext()` | `localcontent-actions.ts` (33 calls) |
| **LocalContentOS** | `src/lib/local-content/content/permissions.ts` | `hasLocalContentPermission()`, `assertLocalContentPermission()` | Content management |
| **AuditOS** | `src/lib/audit/tenant-guard.ts` | `assertEngagementAccess()`, `assertClientAccess()`, `assertOrganizationAccess()` | `audit-actions.ts` (33 calls) + 15+ other audit action files |
| **DecisionOS** | `src/lib/auth.ts` | `requireDecisionAccess()` | `decisions.ts` (~40 calls) + 12+ decision action files |
| **SalesOS** | `src/lib/sales/guards.ts` | `requireSalesOrgAccess()`, `assertSalesPermission()`, `assertSalesAccountAccess()`, `assertSalesDealAccess()` | `sales-actions.ts` (~60 calls) |
| **WorkflowOS** | `src/lib/workflowos/tenant-guard.ts` | `requireClientAccess()`, `requireWorkflowAdmin()`, `canAccessWorkflowClient()` | `workflowos/services.ts` (~22 calls) |

### 1.3 Core Auth Layer (`src/lib/auth.ts`)

The most widely adopted pattern:

| Function | Purpose | Call Sites |
|----------|---------|:----------:|
| `requireUserContext(requiredRole?)` | Session + role gate | **~190** across 25+ action files |
| `requireOrgAccess(orgId)` | Organization membership | ~10 |
| `requireDecisionAccess(decisionId)` | Decision-level resource guard | ~40 in 12 action files |
| `isAdmin(user)` / `isOperator(user)` / `isViewer(user)` | Role helpers | ~70 direct comparisons |

### 1.4 Middleware (`src/middleware.ts`)

| Feature | Detail |
|---------|--------|
| Route-role mappings | 31 prefixes mapped to `viewer`, `admin` |
| Role hierarchy | `viewer: 0, operator: 1, manager: 2, admin: 3` |
| `hasSufficientRole()` | Level-based comparison |
| MFA gate | Enforces MFA for ADMIN/OPERATOR |

---

## 2. Direct Role Comparison Inventory

### 2.1 In Service Layer (`src/lib/`)

| File | Line | Pattern | Risk |
|------|------|---------|------|
| `src/lib/auth.ts` | 48 | `if (requiredRole === "ADMIN") return user.role === "ADMIN"` | 🔴 Bypasses Permission model |
| `src/lib/auth.ts` | 103 | `return user.role === "ADMIN"` (isAdmin) | 🔴 Used as bypass gate |
| `src/lib/authorization/tenant-guard.ts` | 41 | `if (user.role === "ADMIN")` — cross-tenant bypass | 🔴 Intentional, conflicts with RB-01 |
| `src/lib/local-content/guards.ts` | 46,51 | `return role === "ADMIN" \|\| role === "OPERATOR"` | 🟡 Hardcoded role logic |
| `src/lib/sales/permissions.ts` | 42 | `canReview: role === "ADMIN"` | 🟡 Static permission map |
| `src/lib/platform/access/principal.ts` | 33 | `return principal.role === "admin"` (isAdmin) | 🔴 Duplicate isAdmin |
| `src/lib/workflowos/tenant-guard.ts` | 71 | `if (user.role === "ADMIN")` — bypasses membership | 🔴 Bypass |
| `src/lib/workflowos/services.ts` | 24,266 | `user.role === "ADMIN"` | 🔴 Bypass |
| 6+ KB/Foundation files | multiple | `user.role !== "ADMIN"` | 🟡 Scattered role checks |

### 2.2 In Action Layer (`src/actions/`)

| File | Line | Pattern |
|------|------|---------|
| `src/actions/knowledge-foundation/actions.ts` | 33,257 | `if (user.role !== "ADMIN" && user.role !== "OPERATOR")` |
| `src/actions/knowledge-mining-actions.ts` | 35,41 | `if (user.role !== "ADMIN" ...)` |
| `src/actions/decisions.ts` | 642 | `if (user.role === "VIEWER")` |

### 2.3 In Page/Route Layer (`src/app/`)

| File | Pattern |
|------|---------|
| 8 knowledge-mining API routes | `if (minRole === "ADMIN" && role !== "ADMIN")` |
| 6 knowledge-foundation pages | `user.role === "ADMIN" \|\| user.role === "OPERATOR"` |
| `contacts/[id]/page.tsx` | `{user.role === "ADMIN" \|\| user.role === "OPERATOR"}` |
| `workflowos/admin/page.tsx` | `if (user.role !== "ADMIN")` |

---

## 3. Admin Bypass Patterns (Critical)

These patterns explicitly grant ADMIN users elevated access, bypassing normal authorization:

| # | Location | Pattern | Notes |
|---|----------|---------|-------|
| 1 | `src/lib/authorization/tenant-guard.ts:41` | `if (user.role === "ADMIN") return { allowed: true }` | Cross-tenant admin access |
| 2 | `src/lib/workflowos/tenant-guard.ts:71` | `if (user.role === "ADMIN")` — bypass membership | Admin sees all clients |
| 3 | `src/lib/workflowos/services.ts:24` | `if (user.role === "ADMIN")` — list all | Same pattern |
| 4 | `src/lib/core/knowledge/rag/knowledge-service.ts:22` | `user.role !== "ADMIN"` — tenant override | KB admin bypass |
| 5 | `src/actions/knowledge-mining-actions.ts:41` | `if (user.role !== "ADMIN")` — mining bypass | KF admin bypass |
| 6 | `src/lib/platform/product-ai-bridge.ts:135` | `user.role !== "ADMIN"` — AI bridge bypass | AI admin bypass |

**All 6 violate ADR-RB02-003 (No Admin Bypass).** Must be eliminated in RB-02B.

---

## 4. Guard Call Count by System

| System | Guard Calls | Action Files |
|--------|:-----------:|:------------:|
| AuditOS (`assertEngagementAccess`) | ~33+ | 11+ |
| LocalContentOS (`assertProjectAccess` + `require*`) | ~50+ | 4 |
| DecisionOS (`requireDecisionAccess`) | ~40+ | 12 |
| SalesOS (`requireSalesPermission` + `assertSales*`) | ~60+ | 1 |
| WorkflowOS (`requireClientAccess`) | ~26+ | 3 |
| Core (`requireUserContext`) | ~190+ | 25+ |
| Unified Facade (`enforce()`) | 8 | 4+ |
| **Total** | **~433+** | **~50+** |

---

## 5. Migration Strategy

### Recommended Approach: Incremental (Not Big Bang)

| Argument | Incremental | Big Bang |
|----------|:-----------:|:--------:|
| Risk | Low — each wave is testable | High — everything changes at once |
| Rollback | Easy — revert one wave | Complex — entire system reverted |
| RB-01 experience | ✅ Proven with B2A waves | N/A |
| Production safety | ✅ Can run old + new in parallel | ❌ Outage required |
| Timeline | Longer total, but predictable | Faster if no failures, catastrophic if failures |

**Decision:** ✅ **Incremental migration** — Product by product, guard by guard.

### Migration Order

1. **Wave 1: Authorization Engine** — Engine exists, no production code uses it yet
2. **Wave 2: Permission Registry** — Code types/enums for all 23 permissions
3. **Wave 3: Policy Registry** — Policy data structures
4. **Wave 4: DecisionOS** — First product migration (~40 `requireDecisionAccess` calls)
5. **Wave 5: LocalContentOS** — Second product (~50 `require*` + `assertProjectAccess` calls)
6. **Wave 6: SalesOS** — Third product (~60 calls)
7. **Wave 7: AuditOS** — Fourth product (~33 `assertEngagementAccess` calls)
8. **Wave 8: WorkflowOS** — Fifth product (~26 calls)
9. **Wave 9: Core Cleanup** — Migrate ~190 `requireUserContext` calls + 70 role comparisons + 6 admin bypasses
10. **Wave 10: Decision Trace + Observability**

---

## 6. BEFORE Baseline Summary

**Total authorization points to migrate: 433+** across **50+ action files** and **5 product-specific guard systems.**

This is the **largest migration in AQLIYA history** — larger than RB-01 (which focused on a single product's tenant isolation). RB-02B affects every product and every action file.

---

> *This report is the **BEFORE** baseline for RB-02B. Each wave will produce its own BEFORE/AFTER/GATE evidence package, following the methodology proven in RB-01 (B2A-1 through B2A-5).*
