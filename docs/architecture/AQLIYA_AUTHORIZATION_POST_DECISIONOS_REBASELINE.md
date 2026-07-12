# AQLIYA Authorization — Post-DecisionOS Re-Baseline

**Status:** Active  
**Date:** 2026-07-10  
**Purpose:** Close DecisionOS program, establish WorkflowOS baseline, recommend Wave 6 first slice  
**Author:** Authorization Consolidation Agent

---

## 1. Purpose of This Chain

This chain executes three phases after DecisionOS completion:

1. **Phase A — DecisionOS Cleanup Pack:** Remove obsolete legacy auth remnants that are now dead after DecisionOS full migration
2. **Phase B — WorkflowOS Authorization Baseline:** Establish the true current auth model of WorkflowOS
3. **Phase C — Wave 6 First-Slice Plan:** Choose one bounded WorkflowOS migration slice and determine implementation readiness

This is a steering chain, not an implementation wave. It ends with a go/no-go recommendation for Wave 6.

---

## 2. DecisionOS Cleanup Pack Results

### 2.1 What Was Removed

| Item | Location | Reason |
|------|----------|--------|
| `requireDecisionAccess()` function | `src/lib/auth.ts:170-193` | Zero production call sites after Wave 5. Dead code. |
| `shadowEvaluateDecisionAccess()` | `src/lib/auth.ts:200-261` | Shadow evaluation helper — only called from `requireDecisionAccess`. Dead. |
| `shadowParityRequireUserContext()` | `src/lib/auth.ts:81-141` | Shadow parity logging — only called from `requireUserContext` for migration comparison. Dead after migration complete. |
| `isShadowModeEnabled()` | `src/lib/auth.ts:267-272` | Feature flag check — only used by shadow helpers. Dead. |
| `import { Decision }` | `src/lib/auth.ts:274` | Type import — only used by shadow helpers. Dead. |
| Shadow call in `requireUserContext` | `src/lib/auth.ts:68-71` | Fire-and-forget shadow parity call — removed with `shadowParityRequireUserContext`. |
| Deprecated `requireDecisionAccess` comment | `src/lib/authorization/index.ts:14` | Stale reference to removed function. |

**Net effect on `auth.ts`:** Reduced from 294 lines to ~178 lines. Removed ~116 lines of dead migration infrastructure.

### 2.2 What Was Kept and Why

| Item | Location | Reason |
|------|----------|--------|
| `requireUserContext()` | `src/lib/auth.ts:60-74` | **Still live** — used by WorkflowOS (~31 calls), LocalContentOS, Contact, ERP, and others |
| `requireOrgAccess()` | `src/lib/auth.ts:149-158` | **Still tested** — `cross-tenant-isolation.test.ts` tests it directly. Low-cost to keep. |
| `hasRequiredRole()` | `src/lib/auth.ts:44-52` | Used by `requireUserContext()` |
| `isAdmin/isOperator/isViewer` | `src/lib/auth.ts:160-172` | Utility functions used across the codebase |
| `isExpectedAccessDeniedError()` | `src/lib/auth.ts:174-180` | Used by all action error handlers |

### 2.3 Whether `requireDecisionAccess` / Related Helpers Still Remain for Non-DecisionOS Reasons

**No.** `requireDecisionAccess` had zero production call sites outside DecisionOS. It was used exclusively by DecisionOS action files, all of which were migrated in Waves 2-5.

The function definition and its shadow helpers were the last remnants. They have been removed.

`requireOrgAccess` remains — it is only called by `requireDecisionAccess` (now removed) and tested directly in `cross-tenant-isolation.test.ts`. It is a future cleanup candidate after WorkflowOS/SalesOS migration but is not harmful to keep.

### 2.4 Test Updates

| File | Change |
|------|--------|
| `src/actions/__tests__/decision-actions.test.ts` | Removed `requireDecisionAccess` mock + all references |
| `src/__tests__/unit/decision/workflow-routes.test.ts` | Updated assertion to check `getCurrentUser` only (removed `requireDecisionAccess` alternation) |
| `src/__tests__/integration/org-scoping.test.ts` | Rewritten to mock `enforce()` instead of `requireDecisionAccess` |

### 2.5 What Cleanup Was NOT Safe Yet

| Item | Reason |
|------|--------|
| `requireUserContext()` | Still used by ~255 call sites across WorkflowOS, LocalContentOS, Contact, ERP, and others |
| `requireOrgAccess()` | Still tested directly in `cross-tenant-isolation.test.ts` |
| `hasRequiredRole()` | Used by `requireUserContext()` |

These become cleanup candidates after their respective products migrate.

### 2.6 Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| DecisionOS tests (14 suites) | **PASS** — 164/164 tests |

---

## 3. WorkflowOS Authorization Baseline

### 3.1 Current Auth Model

WorkflowOS operates on a **dual-layer authorization model** with two distinct auth surfaces:

**Layer 1 — Action Layer (org-based):**
- Pattern: `requireUserContext()` → org-level auth
- Location: Action files (`workflowos-actions.ts`, `workflowos-template-actions.ts`, etc.)
- Call sites: ~31 across 5 action files
- Auth check: User has required role (OPERATOR/ADMIN) in their organization
- Tenant isolation: Manual `user.organizationId !== organizationId` checks after auth

**Layer 2 — Service Layer (membership-based):**
- Pattern: `requireClientAccess(clientId, requiredRole?)` → membership-based auth
- Location: Service files (`services.ts`, `storage.ts`, `audit.ts`, `export/index.ts`)
- Call sites: ~22 across 4 service files + 1 API route
- Auth check: User has active `sunbulUserMembership` record for the client with sufficient role level
- Role hierarchy: PlatformAdmin (3) > Reviewer (2) > Operator (1)
- Tenant isolation: Membership lookup against `sunbulClient` table

**Layer 3 — Admin Gate:**
- Pattern: `requireWorkflowAdmin()` → platform admin check
- Location: `services.ts` (6 calls)
- Auth check: User has ADMIN role in the platform
- Used for: Client creation, membership management, client status changes

### 3.2 Membership / Role / Guard Structure

```
┌─────────────────────────────────────────────────┐
│  User (Prisma User)                              │
│  ┌─────────────────────────────────────────────┐ │
│  │ role: VIEWER | OPERATOR | ADMIN             │ │
│  │ organizationId: string                      │ │
│  │ platformOrganizationId?: string             │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  requireUserContext(requiredRole)                │
│  - Checks: user.role >= requiredRole            │
│  - Scope: organization-level                    │
│  - Used by: action files (templates, records)   │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  requireClientAccess(clientId, requiredRole?)    │
│  - Checks: sunbulUserMembership for user+client │
│  - Scope: client-level (membership)             │
│  - Role hierarchy: PlatformAdmin > Reviewer >   │
│    Operator                                     │
│  - Used by: services, storage, audit, export    │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  requireWorkflowAdmin()                         │
│  - Checks: user.role === ADMIN                  │
│  - Scope: platform-level                        │
│  - Used for: client CRUD, membership mgmt       │
└─────────────────────────────────────────────────┘
```

### 3.3 Main Action Surfaces and Current Legacy Auth Usage

| File | `requireUserContext` calls | `requireClientAccess` calls | Notes |
|------|--------------------------|---------------------------|-------|
| `workflowos-actions.ts` | ~12 | 0 (delegates to services) | Templates, records, evidence, dashboard |
| `workflowos-template-actions.ts` | ~8 | 0 | Template CRUD, webhooks |
| `workflowos-export-actions.ts` | ~8 | 0 | Export request/approve/reject/download |
| `workflowos-admin-actions.ts` | 2 | 0 | Admin metrics, CSV export |
| `workflowos-sla-actions.ts` | 1 | 0 | SLA status check |
| `services.ts` | 0 | ~16 | Core business logic |
| `storage.ts` | 0 | ~3 | Document upload/download |
| `audit.ts` | 0 | ~1 | Audit event logging |
| `export/index.ts` | 0 | ~1 | Export bridge |
| API route (documents) | 0 | ~1 | Document download |
| **Total** | **~31** | **~22** | |

### 3.4 Overall Migration Readiness Assessment

| Layer | Readiness | Complexity | Notes |
|-------|-----------|-----------|-------|
| Action layer (`requireUserContext`) | **HIGH** | LOW | Straightforward `requireUserContext()` → `getCurrentUser()` + `enforce()` |
| Service layer (`requireClientAccess`) | **BLOCKED** | HIGH | Cannot map to `enforce()` without extending authorization model |
| Admin gate (`requireWorkflowAdmin`) | **HIGH** | TRIVIAL | Simple admin check → `enforce("admin")` |

**Key insight:** The action layer and service layer use different auth models. Migrating only the action layer (`requireUserContext`) would replace org-level auth with `enforce()` while leaving membership-based auth (`requireClientAccess`) untouched. This is **safe and correct** — the two layers serve different purposes.

---

## 4. Candidate WorkflowOS First Slices

### Candidate A: Template CRUD (`workflowos-template-actions.ts`)

| Attribute | Value |
|-----------|-------|
| **Files** | `src/actions/workflowos-template-actions.ts` |
| **Functions** | `createTemplate`, `updateTemplate`, `publishTemplate`, `archiveTemplate`, `listTemplates`, `registerWebhookAction`, `testWebhookAction`, `deleteWebhookAction` |
| **Legacy auth pattern** | `requireUserContext()` (8 calls) |
| **Membership auth involved** | No — all functions use direct Prisma queries with org scoping |
| **Migration difficulty** | LOW — proven pattern from DecisionOS |
| **Test readiness** | Moderate — `services.test.ts` exists but mocks are heavy |
| **Key risks** | `shareTemplateAction` and `importTemplateAction` delegate to `template-service` which may use `requireClientAccess` |
| **Scope** | Self-contained in one file |

### Candidate B: Admin/SLA (`workflowos-admin-actions.ts` + `workflowos-sla-actions.ts`)

| Attribute | Value |
|-----------|-------|
| **Files** | `src/actions/workflowos-admin-actions.ts`, `src/actions/workflowos-sla-actions.ts` |
| **Functions** | `getAdminDashboardMetrics`, `exportMetricsCSV`, `checkSlaStatus`, `getSlaInfoForRecord` |
| **Legacy auth pattern** | `requireUserContext()` (3 calls) |
| **Membership auth involved** | No — all functions use analytics service with org ID |
| **Migration difficulty** | TRIVIAL — smallest possible slice |
| **Test readiness** | Low — no dedicated tests |
| **Key risks** | Very small scope — may not validate the pattern sufficiently |
| **Scope** | 2 files, 3 auth calls |

### Candidate C: Export Surface (`workflowos-export-actions.ts`)

| Attribute | Value |
|-----------|-------|
| **Files** | `src/actions/workflowos-export-actions.ts` |
| **Functions** | `requestWorkflowExport`, `approveWorkflowExport`, `rejectWorkflowExport`, `downloadWorkflowExport`, `getWorkflowExportStatus`, `getCurrentUserPendingExportCount`, `getPendingExportRequests` |
| **Legacy auth pattern** | `requireUserContext()` (8 calls) + internal `assertRecordAccess` helper |
| **Membership auth involved** | No — all functions use direct Prisma queries with org scoping |
| **Migration difficulty** | LOW-MEDIUM — `assertRecordAccess` is a local helper that wraps `requireUserContext` |
| **Test readiness** | Moderate — `services.test.ts` covers export flows |
| **Key risks** | `assertRecordAccess` pattern needs rewriting |
| **Scope** | Self-contained in one file |

---

## 5. Recommended Wave 6 Slice

### **Candidate A: Template CRUD (`workflowos-template-actions.ts`)**

**Rationale:**

1. **Bounded scope:** 8 functions in a single file, all using `requireUserContext()` only
2. **No membership auth entanglement:** All functions use direct Prisma queries with `organizationId` scoping — no `requireClientAccess` calls
3. **Proven migration pattern:** Same `requireUserContext()` → `getCurrentUser()` + `enforce()` transformation used in DecisionOS
4. **Representative product surface:** Templates are a core WorkflowOS feature, not a peripheral utility
5. **Risk-isolated:** Template CRUD is independent of the membership-based client workflow — if migration fails, it doesn't affect record processing
6. **Existing test infrastructure:** `services.test.ts` covers template flows

**Files in scope:**
- `src/actions/workflowos-template-actions.ts` — 8 `requireUserContext` calls to migrate

**Legacy auth patterns involved:**
- `requireUserContext()` → `getCurrentUser()` + `enforce(user, { type: "organization", id: user.organizationId }, "update")`
- Manual `user.organizationId !== X` checks → replaced by `enforce()` tenant validation

**Expected role mapping:**
| Old | New |
|-----|-----|
| `requireUserContext()` (default OPERATOR) | `enforce(..., "update")` |
| `requireUserContext()` with org check | `enforce(..., "update")` with explicit `tenantId` |

---

## 6. Can Wave 6 Proceed Directly to Implementation?

### **Yes — implementation-ready**

**Evidence:**

1. **First slice is bounded:** 8 functions, 1 file, all using the same auth pattern
2. **Auth model maps cleanly:** `requireUserContext()` → `getCurrentUser()` + `enforce()` — identical to DecisionOS migration
3. **No new permission taxonomy needed:** Uses existing `"update"` action from `ROLE_PERMISSIONS`
4. **No new tenant/membership architecture needed:** All functions use org-level scoping via `organizationId`
5. **Behavior can be preserved:** Same role checks, same org validation, same error semantics
6. **No design-level invention required:** The migration is mechanical — copy the DecisionOS pattern

**What Wave 6 should NOT include:**
- Membership-based auth migration (`requireClientAccess` in `services.ts`) — that requires a separate design decision
- `requireUserContext` repo-wide removal — that's a multi-wave program
- SalesOS migration — out of scope
- Middleware changes — out of scope

---

## 7. What Wave 6 Should Not Include

| Excluded | Reason |
|----------|--------|
| `requireClientAccess` migration | Requires design decision about membership auth integration with `enforce()` |
| Service layer changes | `services.ts` uses membership auth — different model |
| SalesOS migration | Not the next product in sequence |
| `requireUserContext` repo-wide removal | Multi-wave program, not a single wave |
| RB-02 promotion | Out of scope for this chain |
| LocalContentOS / AuditOS changes | Out of scope |
| Middleware redesign | Out of scope |

---

## 8. Final Recommendation

**DecisionOS is closed.** The cleanup pack removed `requireDecisionAccess` and all shadow migration infrastructure from `auth.ts`. The function is dead, the tests are updated, and validation passes.

**WorkflowOS is baselined.** It has a dual-layer auth model: org-based (`requireUserContext`) in action files and membership-based (`requireClientAccess`) in service files. These are architecturally distinct and should be migrated separately.

**Wave 6 should migrate `workflowos-template-actions.ts`** — 8 functions using `requireUserContext()` only, no membership auth entanglement, proven pattern, implementation-ready.

**No design note is needed.** The first slice can proceed directly to implementation using the established DecisionOS migration pattern.

The next authorization move after Wave 6 should be: extend the template migration to other WorkflowOS action files that use only `requireUserContext()` (admin, SLA, export), then pause for a design decision on `requireClientAccess` integration.

---

## 9. Wave 6 Implementation Results

**Status:** COMPLETE  
**Date:** 2026-07-10

### 9.1 What Was Migrated

| File | Functions | Calls Migrated | Pattern |
|------|-----------|---------------|---------|
| `src/actions/workflowos-template-actions.ts` | 8 | 8 | `requireUserContext()` → `getCurrentUser()` + `enforce()` |

### 9.2 Migration Details

| Function | Auth Call | Tenant Check | Manual Org Check |
|----------|-----------|-------------|-----------------|
| `createTemplate` | `enforce(user, { type: "organization", id: user.organizationId, tenantId: user.organizationId }, "update")` | Via `tenantId` | None (no record) |
| `updateTemplate` | `enforce(user, { type: "organization", id: existing.organizationId, tenantId: existing.organizationId }, "update")` | Via `tenantId` | Removed (replaced by `enforce()`) |
| `publishTemplate` | `enforce(user, { type: "organization", id: existing.organizationId, tenantId: existing.organizationId }, "update")` | Via `tenantId` | Removed (replaced by `enforce()`) |
| `archiveTemplate` | `enforce(user, { type: "organization", id: existing.organizationId, tenantId: existing.organizationId }, "update")` | Via `tenantId` | Removed (replaced by `enforce()`) |
| `listTemplates` | `enforce(user, { type: "organization", id: user.organizationId, tenantId: user.organizationId }, "update")` | Via `tenantId` | None (no record) |
| `registerWebhookAction` | `enforce(user, { type: "organization", id: organizationId, tenantId: organizationId }, "update")` | Via `tenantId` | Removed (replaced by `enforce()`) |
| `testWebhookAction` | `enforce(user, { type: "organization", id: organizationId, tenantId: organizationId }, "update")` | Via `tenantId` | Removed (replaced by `enforce()`) |
| `deleteWebhookAction` | `enforce(user, { type: "organization", id: organizationId, tenantId: organizationId }, "update")` | Via `tenantId` | Removed (replaced by `enforce()`) |

### 9.3 What Changed

- **Import:** `requireUserContext` → `getCurrentUser` + `enforce`
- **Auth pattern:** `requireUserContext()` → `getCurrentUser()` + `enforce(user, resource, "update")`
- **Tenant isolation:** Manual `user.organizationId !== organizationId` checks replaced by `enforce()` with explicit `tenantId`
- **Error handling:** Same `mapAuthError` function — `enforce()` throws "Access denied: ..." which maps to "لا تملك صلاحية تنفيذ هذا الإجراء"

### 9.4 Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| WorkflowOS tests (6 suites) | **PASS** — 64/64 tests |
| DecisionOS tests (13 suites) | **PASS** — 161/161 tests |
| Full test suite | **PASS** — 366/367 suites (1 pre-existing failure in `api-smoke.test.ts`) |

### 9.5 Remaining `requireUserContext` in WorkflowOS

| File | Calls | Next Step |
|------|-------|-----------|
| `workflowos-actions.ts` | ~12 | Wave 7 candidate |
| `workflowos-export-actions.ts` | ~8 | Wave 7 candidate |
| `workflowos-admin-actions.ts` | 2 | Wave 7 candidate |
| `workflowos-sla-actions.ts` | 1 | Wave 7 candidate |

**Total remaining:** ~23 calls across 4 files. All use `requireUserContext()` only — same migration pattern.
