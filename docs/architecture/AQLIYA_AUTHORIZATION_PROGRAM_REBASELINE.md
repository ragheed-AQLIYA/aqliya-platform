# AQLIYA Authorization Program — Re-Baseline

**Status:** Active  
**Date:** 2026-07-10  
**Purpose:** Post-Wave 4 re-baseline to recommend Wave 5 candidate  
**Author:** Authorization Consolidation Agent

---

## 1. Post-Wave 4 State

### 1.1 What's Been Migrated (enforce() active)

| Area | File | enforce() calls | Legacy calls removed |
|------|------|----------------|---------------------|
| DecisionOS core | `src/actions/decisions.ts` | 19 | 19 requireDecisionAccess |
| DecisionOS evidence | `src/actions/decision-evidence-actions.ts` | 5 | 5 requireDecisionAccess |
| Organization mgmt | `src/actions/organization-actions.ts` | 5 | 5 requireUserContext |
| SSO admin | `src/actions/sso-admin-actions.ts` | 4 | 4 requireUserContext |
| AI settings | `src/actions/ai-settings-actions.ts` | 3 | 3 requireUserContext |
| Contact (partial) | `src/actions/contact-actions.ts` | 1 | 1 requireUserContext |
| LocalContent review | `src/actions/localcontent-review-export.ts` | 1 | — (new) |
| Download routes (×4) | API route handlers | 4 | 4 legacy auth |
| Product guards | `src/lib/authorization/product-guards.ts` | 8 | 8 requireUserContext |
| WorkflowOS export | `src/lib/workflowos/export/index.ts` | 1 | — (new) |
| **Total** | | **51** | **~49** |

### 1.2 What Remains — Legacy Auth Surface

#### requireDecisionAccess (32 call sites across 9 files)

| File | Calls | Role pattern | Notes |
|------|-------|-------------|-------|
| `approval.ts` | 9 | Mixed (VIEWER/OPERATOR/ADMIN) | Approval workflow actions |
| `decision-signals-alerts.ts` | 6 | OPERATOR/ADMIN | Signal/alert CRUD |
| `decision-outcomes.ts` | 4 | OPERATOR/ADMIN | Outcome tracking |
| `decision-intelligence.ts` | 4 | VIEWER/OPERATOR | Intelligence queries |
| `decision-sector.ts` | 2 | OPERATOR | Sector analysis |
| `decision-learning.ts` | 2 | VIEWER/OPERATOR | Learning loop |
| `tender.ts` | 2 | OPERATOR | Tender management |
| `simulation.ts` | 2 | OPERATOR/ADMIN | Simulation run |
| `decision-export.ts` | 1 | OPERATOR | Export action |
| **Total** | **32** | | |

#### requireUserContext (262 call sites across ~57 files)

| Product/Area | Files | Calls | Notes |
|-------------|-------|-------|-------|
| LocalContentOS | 10 | ~53 | Largest consumer; guards in localcontent-guards.ts |
| Content Studio | 1 | 22 | `content-studio/actions.ts` |
| Contact/LocalContactOS | 3 | ~33 | contact-actions, contact-export, contact-review |
| ERP | 1 | 14 | `erp-actions.ts` |
| Model Governance | 1 | 10 | `model-governance-actions.ts` |
| WorkflowOS | 6 | ~28 | actions + template-service |
| Office AI | 2 | ~10 | office-ai-actions + stats |
| Platform/Shared | 7 | ~22 | tenant, registration, platform-chain, etc. |
| SalesOS | 2 | ~14 | sales-actions + intelligence |
| DecisionOS peripheral | 2 | ~7 | decision-sector, decision-learning, decision-templates |
| API routes | ~20 | ~33 | Various platform/AI/monitoring routes |
| Agent Memory | 1 | 6 | `agent-memory-actions.ts` |
| Ingestion | 1 | 5 | `ingestion-actions.ts` |
| Authorization lib | 3 | ~4 | definition + re-exports |
| **Total** | **~57** | **~262** | |

#### SalesOS Parallel Auth System (119 call sites)

| Guard function | Files | Calls | Notes |
|---------------|-------|-------|-------|
| `requireSalesPermission("salesos:*")` | 5 | ~55 | Fine-grained: read/create/update |
| `assertSalesDealAccess(dealId)` | 4 | ~25 | Deal-level tenant check |
| `assertSalesAccountAccess(accountId)` | 3 | ~15 | Account-level tenant check |
| `requireSalesOrgAccess()` | 2 | ~5 | Org context fetch |
| **Total** | | **~100** | |

#### WorkflowOS Parallel Auth System (42 call sites)

| Guard function | Files | Calls | Notes |
|---------------|-------|-------|-------|
| `requireClientAccess(clientId, role?)` | 5 | ~22 | Membership-based access |
| `requireWorkflowAdmin()` | 2 | ~6 | Platform admin check |
| `canAccessWorkflowClient(userId, clientId)` | 1 | ~3 | Membership lookup |
| `requireUserContext()` (in WorkflowOS) | 6 | ~28 | Standard legacy pattern |
| **Total** | | **~59** | |

---

## 2. Migration Complexity Analysis

### 2.1 DecisionOS Peripherals — LOW COMPLEXITY

- **Auth pattern:** `requireDecisionAccess(decisionId, requiredRole)` → `getCurrentUser()` + `enforce("action")`
- **Mapping:** VIEWER→`"read"`, OPERATOR→`"update"`, ADMIN→`"admin"` — exact match with `ROLE_PERMISSIONS`
- **Established in:** Waves 2B, 3, 4 (identical migration repeated 30+ times)
- **Resource type:** Always `"decision"`
- **Test coverage:** 3 test suites, 59 tests — all passing post-Wave 4
- **New patterns needed:** None — copy-paste of established migration
- **Files affected:** 9 action files + potential test updates

### 2.2 WorkflowOS First Slice — HIGH COMPLEXITY

- **Auth pattern:** Dual system — `requireUserContext()` (standard) + `requireClientAccess()` (membership-based)
- **The deeper auth (requireClientAccess) doesn't map to enforce():**
  - WorkflowOS uses membership-based access control (client membership + role hierarchy: PlatformAdmin > Reviewer > Operator)
  - This is NOT role-based in the enforce() sense — it's membership-scoped
  - `enforce()` doesn't know about `sunbulUserMembership` table
  - Migrating only `requireUserContext()` would leave the core auth untouched
- **Resource type:** `"workflow"` exists but membership check is orthogonal
- **Test coverage:** `__tests__/services.test.ts` exists but mocks are heavy
- **New patterns needed:** Either extend enforce() for membership resources OR keep WorkflowOS tenant-guard as-is
- **Decision required:** Is WorkflowOS membership-based auth in scope, or only the requireUserContext surface?

### 2.3 SalesOS First Slice — MEDIUM-HIGH COMPLEXITY

- **Auth pattern:** Triple system — `requireUserContext()` (standard) + `requireSalesPermission("salesos:*")` (fine-grained) + `assertSales*Access()` (resource-level)
- **Sales permissions ("salesos:read/create/update") don't map directly to enforce() actions:**
  - `enforce()` uses: `"read"`, `"write"`, `"update"`, `"delete"`, `"admin"`, `"export"`, `"share"`, `"approve"`, `"configure"`, `"audit"`
  - Sales uses: `"salesos:read"`, `"salesos:create"`, `"salesos:update"` — product-scoped
  - Would need to either: (a) add Sales actions to ROLE_PERMISSIONS, or (b) create product-specific enforce wrapper
- **Resource type:** `"account"` and `"deal"` exist in product-guards.ts
- **Test coverage:** `sales-services.test.ts` exists
- **New patterns needed:** Either extend `enforce()` for product-scoped permissions, or redesign Sales guard to use standard actions
- **Decision required:** How to reconcile product-scoped fine-grained permissions with the unified action model

---

## 3. Three Candidates — Comparative Matrix

| Criterion | A: DecisionOS Peripherals | B: WorkflowOS First Slice | C: SalesOS First Slice |
|-----------|--------------------------|--------------------------|----------------------|
| Call sites to migrate | 32 | ~28 (requireUserContext) + 42 (requireClientAccess) | ~14 (requireUserContext) + ~100 (Sales guards) |
| Migration pattern complexity | LOW — proven pattern | HIGH — dual auth system | MEDIUM-HIGH — fine-grained permissions |
| New patterns needed | None | Membership-based auth integration | Product-scoped permission extension |
| Test coverage | Strong (59 tests, 3 suites) | Moderate (mock-heavy) | Moderate (exists) |
| Risk of regression | Low | Medium | Medium |
| Strategic value | Completes DecisionOS as first migrated product | Validates auth model for membership-based products | Validates auth model for permission-scoped products |
| Blocks other work? | No | No | No |
| Estimated scope | 9 files | 12+ files + possible enforce() extension | 7+ files + possible permission model extension |
| Decision required? | No — pattern is established | Yes — how to handle membership auth | Yes — how to handle product-scoped permissions |

---

## 4. Recommendation

### **Wave 5: DecisionOS Peripherals — Complete DecisionOS Migration**

**Rationale:**

1. **Completion principle:** DecisionOS is the first product where Waves 2B/3/4 established the migration pattern. Finishing it creates a clean "first product fully migrated" milestone.

2. **Zero new design decisions:** Every file uses the exact same `requireDecisionAccess(decisionId, requiredRole)` → `enforce("action")` pattern already proven 30+ times. No architectural debates needed.

3. **Low risk, high confidence:** The migration is mechanical — each of the 9 files follows the same transformation. Test suites exist and pass.

4. **Momentum preservation:** Waves 1-4 have been executing a clear escalation (routes → evidence → core actions → publication). Wave 5 completing the product follows the same rhythm.

5. **DecisionOS peripheral files are a clean batch:** `approval.ts` (9), `decision-signals-alerts.ts` (6), `decision-outcomes.ts` (4), `decision-intelligence.ts` (4), `decision-sector.ts` (2), `decision-learning.ts` (2), `tender.ts` (2), `simulation.ts` (2), `decision-export.ts` (1) — all use the same auth pattern.

6. **WorkflowOS and SalesOS require design decisions first:** Both products have parallel auth systems (membership-based and product-scoped permissions respectively) that need architectural decisions before migration can proceed. Rushing those decisions would be scope creep.

### After Wave 5

Post-Wave 5, DecisionOS will be fully migrated. The program will have a complete reference implementation to inform the design decisions needed for WorkflowOS (membership auth integration) and SalesOS (product-scoped permission extension).

**Wave 6 should be:** Design decision for WorkflowOS membership auth → then either WorkflowOS or SalesOS depending on which design resolves more cleanly.

---

## 5. Wave 5 Acceptance Criteria (Draft)

| ID | Criterion | Verification |
|----|-----------|-------------|
| C1 | All 9 DecisionOS peripheral files use `enforce()` — zero `requireDecisionAccess` call sites remain | `rg "requireDecisionAccess" src/actions/` returns zero matches |
| C2 | All 32 call sites migrated with correct action mapping: VIEWER→`"read"`, OPERATOR→`"update"`, ADMIN→`"admin"` | Manual code review |
| C3 | Import of `requireDecisionAccess` removed from all 9 files | Import check |
| C4 | No import of `requireDecisionAccess` remains in `src/actions/decisions.ts` (already clean from Wave 4) | Verified |
| C5 | Existing DecisionOS test suites pass | `npm test -- --testPathPattern=decision` |
| C6 | TypeScript clean | `npx tsc --noEmit` |

---

## 6. Remaining Legacy Auth Surface After Wave 5

| Pattern | Current | Post-Wave 5 | Notes |
|---------|---------|-------------|-------|
| `requireDecisionAccess` | 32 | **0** | Fully eliminated |
| `requireUserContext` (total) | ~262 | ~255 | 7 in DecisionOS peripherals also use requireUserContext |
| SalesOS parallel auth | ~100 | ~100 | Untouched |
| WorkflowOS parallel auth | ~42 | ~42 | Untouched |
| `enforce()` active | 51 | **83** | +32 from Wave 5 |

**DecisionOS auth migration status:** 100% complete after Wave 5.

---

## 7. Files Affected by Wave 5

| File | Current legacy calls | Migration action |
|------|---------------------|-----------------|
| `src/actions/approval.ts` | 9 requireDecisionAccess | Migrate all to enforce() |
| `src/actions/decision-signals-alerts.ts` | 6 requireDecisionAccess | Migrate all to enforce() |
| `src/actions/decision-outcomes.ts` | 4 requireDecisionAccess | Migrate all to enforce() |
| `src/actions/decision-intelligence.ts` | 4 requireDecisionAccess | Migrate all to enforce() |
| `src/actions/decision-sector.ts` | 2 requireDecisionAccess | Migrate all to enforce() |
| `src/actions/decision-learning.ts` | 2 requireDecisionAccess | Migrate all to enforce() |
| `src/actions/tender.ts` | 2 requireDecisionAccess | Migrate all to enforce() |
| `src/actions/simulation.ts` | 2 requireDecisionAccess | Migrate all to enforce() |
| `src/actions/decision-export.ts` | 1 requireDecisionAccess | Migrate all to enforce() |

**Total: 9 files, 32 call sites**
