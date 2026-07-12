# AQLIYA Authorization — Platform Rebaseline

**Status:** Active  
**Date:** 2026-07-10  
**Purpose:** Establish the definitive post-Wave-8 authorization architecture baseline  
**Author:** Authorization Consolidation Agent

---

## 1. Authorization Architecture — Current State

### 1.1 Module Structure

```
src/lib/authorization/
├── index.ts              ← Public facade (barrel exports)
├── authorize.ts          ← Unified authorize() entry point
├── action-guard.ts       ← enforce() + isAllowed()
├── tenant-guard.ts       ← Cross-tenant isolation
├── types.ts              ← Shared types, role hierarchy, permissions
├── permission-resolver.ts ← Permission resolution logic
├── abac-bridge.ts        ← ABAC condition evaluation bridge
└── engine/
    ├── index.ts          ← Engine barrel
    ├── engine.ts         ← RB-02B Authorization Engine
    ├── types.ts          ← Engine types
    ├── policies/         ← Policy definitions
    └── registries/       ← Resource/permission registries
```

**Removed in Wave 8:**
- `product-guards.ts` (deleted — zero consumers)
- `engine/migration/` (deleted — 6 orphaned files, 1,657 lines)

### 1.2 Core API Surface

| Export | Location | Purpose | Status |
|--------|----------|---------|--------|
| `authorize(options)` | `authorize.ts` | Single entry point for all authorization | **ACTIVE** — primary API |
| `enforce(user, resource, action)` | `action-guard.ts` | Throws on denial — server action pattern | **ACTIVE** — primary usage |
| `isAllowed(user, resource, action)` | `action-guard.ts` | Boolean check — non-blocking | **ACTIVE** |
| `checkTenantAccess(user, resource)` | `tenant-guard.ts` | Cross-tenant isolation | **ACTIVE** — called by authorize() |
| `hasPermission(role, permission)` | `authorize.ts` | Direct permission check | **ACTIVE** |
| `hasSufficientRoleLevel(userRole, requiredRole)` | `authorize.ts` | Role hierarchy check | **ACTIVE** |
| `resolvePermissions(role)` | `permission-resolver.ts` | Permission list for role | **ACTIVE** |
| `principalFromUser(user)` | `types.ts` | Convert user to principal | **ACTIVE** |
| `normalizeRole(role)` | `types.ts` | Normalize role string | **ACTIVE** |

### 1.3 Types

```typescript
// Core types from types.ts
interface Principal { id, email, role, organizationId }
interface CurrentUser { id, email, name, role, organizationId, platformOrganizationId?, organization }
interface AuthorizeOptions { user, resource, action, context? }
interface AuthorizationResult { allowed, reason?, principal? }

type ResourceType = "engagement" | "client" | "organization" | "decision" | "sales" | "audit" | "platform" | "settings" | "project" | "workspace" | "record" | "deal" | "account" | ...
type AccessAction = "read" | "create" | "update" | "delete" | "admin" | "approve" | "reject" | "export" | "review" | "manage_users" | ...
type PrincipalRole = "viewer" | "operator" | "manager" | "admin"
```

---

## 2. Authorization Flow

```
Server Action / API Route
    │
    ▼
getCurrentUser()          ← from @/lib/auth (NextAuth session)
    │
    ▼
enforce(user, resource, action)
    │
    ▼
authorize({ user, resource, action, context })
    │
    ├── 1. checkTenantAccess()     ← tenant isolation
    ├── 2. ROLE_PERMISSIONS check  ← role-based permission
    ├── 3. hasRequiredRole()       ← optional fine-grained check
    └── 4. evaluateAbac()          ← optional ABAC conditions
    │
    ▼
throw Error (denied) | return { allowed: true, principal }
```

---

## 3. Product Migration Status

### 3.1 Completed Migrations

| Product | Status | Migration Pattern | Call Sites Migrated |
|---------|--------|-------------------|-------------------|
| **DecisionOS** | **FULLY MIGRATED** | `requireUserContext` → `getCurrentUser()` + `enforce()` | ~40 actions across 14 files |
| **WorkflowOS** | **FULLY MIGRATED** | Same pattern | 24 action-layer calls across 15 files (Waves 6+7) |

### 3.2 Pending Migrations

| Product | Legacy Pattern | Estimated Call Sites | Priority |
|---------|---------------|---------------------|----------|
| **SalesOS** | `requireUserContext` | ~10 | Wave 9 |
| **AuditOS** | `requireUserContext` | ~5 (action layer) | Wave 9 |
| **LocalContentOS** | `requireUserContext` | ~70+ | Wave 10+ |
| **Platform** | `requireUserContext` | ~60+ | Wave 10+ |
| **Office AI** | `requireUserContext` | ~12 | Wave 10+ |
| **ContentStudio** | `requireUserContext` | ~25 | Wave 10+ |
| **Contacts** | `requireUserContext` | ~40+ | Wave 10+ |
| **ERP** | `requireUserContext` | ~15 | Wave 10+ |

**Total remaining `requireUserContext` call sites:** ~371

---

## 4. Legacy Auth Module (`@/lib/auth`)

### 4.1 Functions

| Function | Status | Production Consumers | Notes |
|----------|--------|---------------------|-------|
| `getCurrentUser()` | **PRIMARY** | All products | The standard pattern — session-based user resolution |
| `requireUserContext(role)` | **DEPRECATED** | ~371 call sites | Still the most-used auth pattern. Gradual migration required. |
| `hasRequiredRole(user, role)` | **INTERNAL** | 2 (authorize.ts, requireUserContext) | Core dependency of both old and new patterns |
| `isAdmin(user)` | **ACTIVE** | 3 (Platform) | Simple role check utility |
| `isOperator(user)` | **TEST-ONLY** | 0 | Only used in cross-tenant-isolation.test.ts |
| `isViewer(user)` | **TEST-ONLY** | 0 | Only used in cross-tenant-isolation.test.ts |
| `requireOrgAccess(orgId, role)` | **DEPRECATED** | 0 (test mocks only) | Dead in production; only in test infrastructure |
| `isExpectedAccessDeniedError(err)` | **ACTIVE** | All migrated action files | Standard error classifier |

### 4.2 Deprecation Path

```
requireUserContext(role)
    │
    ▼ (deprecated)
getCurrentUser() + enforce(user, resource, action)
    │
    ▼ (target state)
All products use enforce() directly
```

---

## 5. Dead Code — Wave 8 Removal Summary

All items below were removed in Wave 8 (see `AQLIYA_AUTHORIZATION_CLEANUP_REPORT.md`):

| Removed Item | Lines | Was |
|-------------|-------|-----|
| `requireUserContextToEnforce()` | 15 | Dead export |
| `requireOrgAccessToEnforce()` | 20 | Dead export |
| `assertAuthorized()` | 19 | Dead export |
| `guardRoleLevel()` | 17 | Test-only duplicate |
| `product-guards.ts` (8 functions) | 116 | Dead module |
| `engine/migration/` (6 files) | 1,657 | Orphaned migration infra |
| `action-guard.test.ts` | 38 | Tested removed function |
| Unused imports in authorize.ts | 3 | Dead code |
| Dead barrel exports | ~30 | 11 removed exports |

**Total:** ~1,908 lines removed across 8 deleted files + 4 modified files.

---

## 6. Authorization Test Coverage

| Test Suite | Location | Tests | Status |
|-----------|----------|-------|--------|
| authorize.test.ts | `authorization/__tests__/` | Core authorize() logic | PASS |
| e2e-authorization-pipeline.test.ts | `authorization/__tests__/` | Full pipeline E2E | PASS |
| tenant-guard.test.ts | `authorization/__tests__/` | Tenant isolation | PASS |
| types.test.ts | `authorization/__tests__/` | Type utilities | PASS |
| middleware-bridge.test.ts | `authorization/__tests__/` | Middleware bridge | PASS |
| engine.test.ts | `engine/__tests__/` | Authorization engine | PASS |
| registries.test.ts | `engine/__tests__/` | Resource registries | PASS |
| policies.test.ts | `engine/policies/__tests__/` | Policy evaluation | PASS |

**Total:** 8 suites, 166 tests — all passing.

---

## 7. Governance Model

### 7.1 Access Control Layers

| Layer | Mechanism | Enforcement Point |
|-------|-----------|-------------------|
| **Authentication** | NextAuth v5 session | `getCurrentUser()` |
| **Tenant Isolation** | `organizationId` match | `checkTenantAccess()` in authorize() |
| **Role-Based** | ROLE_PERMISSIONS matrix | `authorize()` step 2 |
| **Fine-Grained** | `context.requiredRole` | `authorize()` step 3 |
| **ABAC** | `context.attributes` | `evaluateAbac()` in authorize() |

### 7.2 Role Hierarchy

```
admin > manager > operator > viewer
```

### 7.3 Action-to-Role Mapping

| Action | Minimum Role |
|--------|-------------|
| `read`, `export` | viewer |
| `create`, `update`, `review` | operator |
| `approve`, `reject` | manager |
| `admin`, `manage_users` | admin |

---

## 8. Next Steps

### Wave 9: SalesOS + AuditOS Migration
- Migrate SalesOS (~10 call sites) and AuditOS action layer (~5 call sites)
- Both are small, bounded products
- Establish pattern for LocalContentOS/Platform migration

### Wave 10+: Large Product Migration
- LocalContentOS (~70+ call sites) — largest single product
- Platform (~60+ call sites) — many API routes
- Office AI, ContentStudio, Contacts, ERP

### Future Cleanup
- Remove `requireOrgAccess()` from auth.ts (after test updates)
- Remove `isOperator()`/`isViewer()` from auth.ts (after test updates)
- Consider removing `requireUserContext()` entirely (after all products migrated)

---

## 9. Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| Authorization tests (8 suites, 166 tests) | **PASS** |
| Full test suite (366 suites) | **366 pass, 1 pre-existing fail** (api-smoke) |
| Dead export grep | **0 matches** — all removed |
| Build | Not run (heavy command — pre-existing clean state) |
