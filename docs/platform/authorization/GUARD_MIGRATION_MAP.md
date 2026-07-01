---
title: "RB-02B — Guard Migration Map"
status: active
program: "Platform Authorization"
phase: "Implementation — Wave 1 Complete"
version: "1.0"
date: 2026-06-28
classification: migration-map
---

# Guard Migration Map

> **Purpose:** Map every legacy guard function to the new Authorization Engine equivalent. This is the reference for Waves 4–9 (product migrations).
>
> **Legacy systems:** 5 product-specific guard systems + 2 centralized layers
> **Total guard points to migrate:** ~433+

---

## Migration Pattern

Every legacy guard will be replaced by a call to:

```typescript
const decision = await engine.authorize({
  userId,
  organizationId,
  role,
  resourceType,
  resourceId,
  action,
  context,
});
```

The `decision.decision` (ALLOW / DENY / REQUIRE_APPROVAL / READ_ONLY) determines the response.

---

## 1. Core Auth Layer (`src/lib/auth.ts`)

| Legacy Function | Call Sites | New Engine Equivalent | Migration Wave |
|----------------|:----------:|----------------------|:--------------:|
| `requireUserContext(requiredRole?)` | ~190 | `engine.authorize({ ... action: "session.access" })` + Identity Resolution handler | W9 |
| `requireOrgAccess(orgId, requiredRole?)` | ~10 | `engine.authorize({ ..., resourceType: "organization", action: "organization.access" })` | W9 |
| `requireDecisionAccess(decisionId, requiredRole?)` | ~40 | `engine.authorize({ ..., resourceType: "decision", resourceId: decisionId, action: ... })` | W4 |
| `isAdmin(user)` | ~20 | Remove — use Permission check + Policy Engine | W9 |
| `isOperator(user)` | ~10 | Remove — use Permission check | W9 |
| `isViewer(user)` | ~10 | Remove — use Permission check | W9 |

---

## 2. LocalContentOS Guards (`src/actions/localcontent-guards.ts`)

| Legacy Function | Call Sites | New Engine Equivalent | Migration Wave |
|----------------|:----------:|----------------------|:--------------:|
| `requireProjectAccess(projectId)` | 4+ | `engine.authorize({ ..., resourceType: "project", resourceId: projectId, action: ... })` | W5 |
| `requireWorkbookAccess(workbookId)` | 13+ | `engine.authorize({ ..., resourceType: "workbook", resourceId: workbookId, action: ... })` | W5 |
| `requireWorkbookLineAccess(lineId)` | 1 | Remove — workbook-line is not a resource per ADR-RB02-005 | W5 |
| `requireDataRequestAccess(requestId)` | 2 | `engine.authorize({ ..., resourceType: "data-request", resourceId: requestId, ... })` | W5 |
| `requireDataRequestItemAccess(itemId)` | 2 | `engine.authorize({ ..., resourceType: "data-request-item", resourceId: itemId, ... })` | W5 |
| `requireOrganizationAccess(orgId)` | 7+ | `engine.authorize({ ..., resourceType: "organization", resourceId: orgId, action: "organization.access" })` | W5 |
| `requirePatternSuggestionAccess(suggestionId)` | 2 | `engine.authorize({ ..., resourceType: "pattern-suggestion", resourceId: suggestionId, action: ... })` | W5 |
| `requireMatchReviewAccess(matchReviewId)` | 2 | `engine.authorize({ ..., resourceType: "match-review", resourceId: matchReviewId, action: ... })` | W5 |

---

## 3. LocalContentOS Guards (`src/lib/local-content/guards.ts`)

| Legacy Function | Call Sites | New Engine Equivalent | Migration Wave |
|----------------|:----------:|----------------------|:--------------:|
| `canPerformAction(user, action)` | ~3 | `engine.authorize({ ... })` | W5 |
| `assertProjectAccess(projectId, action?)` | ~33 | `engine.authorize({ ..., resourceType: "project", resourceId: projectId, action })` | W5 |
| `resolveProjectContext(projectId)` | ~5 | Remove — context comes from AuthorizationRequest | W5 |

---

## 4. LocalContentOS Permissions (`src/lib/local-content/content/permissions.ts`)

| Legacy Function | Call Sites | New Engine Equivalent | Migration Wave |
|----------------|:----------:|----------------------|:--------------:|
| `hasLocalContentPermission(role, permission)` | ~5 | `engine.authorize({ ..., role: ..., action: permission })` | W5 |
| `assertLocalContentPermission(role, permission)` | ~5 | Same as above | W5 |

---

## 5. SalesOS Guards (`src/lib/sales/guards.ts`)

| Legacy Function | Call Sites | New Engine Equivalent | Migration Wave |
|----------------|:----------:|----------------------|:--------------:|
| `requireSalesOrgAccess()` | ~5 | `engine.authorize({ ..., resourceType: "organization", action: "sales.access" })` | W6 |
| `requireSalesPermission(permission)` | ~30 | `engine.authorize({ ..., action: permission })` | W6 |
| `assertSalesPermission(role, permission)` | ~10 | Same as above | W6 |
| `assertSalesAccountAccess(accountId)` | ~10 | `engine.authorize({ ..., resourceType: "account", resourceId: accountId, ... })` | W6 |
| `assertSalesDealAccess(dealId)` | ~5 | `engine.authorize({ ..., resourceType: "deal", resourceId: dealId, ... })` | W6 |

---

## 6. SalesOS Permissions (`src/lib/sales/permissions.ts`)

| Legacy Function | Call Sites | New Engine Equivalent | Migration Wave |
|----------------|:----------:|----------------------|:--------------:|
| `hasSalesPermission(role, permission)` | ~5 | `engine.authorize({ ... })` | W6 |
| `getSalesPermissionsForRole(role)` | ~3 | Remove — use Permission Registry | W6 |

---

## 7. AuditOS Tenant Guards (`src/lib/audit/tenant-guard.ts`)

| Legacy Function | Call Sites | New Engine Equivalent | Migration Wave |
|----------------|:----------:|----------------------|:--------------:|
| `assertEngagementAccess(engagementId, actor)` | ~33 | `engine.authorize({ ..., resourceType: "engagement", resourceId: engagementId, ... })` | W7 |
| `assertClientAccess(clientId, actor)` | ~5 | `engine.authorize({ ..., resourceType: "client", resourceId: clientId, ... })` | W7 |
| `assertOrganizationAccess(orgId, actor)` | ~5 | `engine.authorize({ ..., resourceType: "organization", resourceId: orgId, ... })` | W7 |

---

## 8. DecisionOS Guards (`src/lib/auth.ts` — `requireDecisionAccess`)

| Legacy Function | Call Sites | New Engine Equivalent | Migration Wave |
|----------------|:----------:|----------------------|:--------------:|
| `requireDecisionAccess(decisionId, requiredRole?)` | ~40 | `engine.authorize({ ..., resourceType: "decision", resourceId: decisionId, action: ... })` | W4 |
| `approval.ts` — various `requireDecisionAccess` calls | ~9 | Same as above | W4 |

---

## 9. WorkflowOS Guards (`src/lib/workflowos/tenant-guard.ts`)

| Legacy Function | Call Sites | New Engine Equivalent | Migration Wave |
|----------------|:----------:|----------------------|:--------------:|
| `requireClientAccess(clientId, requiredRole?)` | ~22 | `engine.authorize({ ..., resourceType: "client", resourceId: clientId, ... })` | W8 |
| `requireWorkflowAdmin()` | ~4 | `engine.authorize({ ..., action: "workflow.admin" })` | W8 |
| `canAccessWorkflowClient(userId, clientId)` | ~3 | `engine.authorize({ ..., resourceType: "client", resourceId: clientId, ... })` | W8 |

---

## 10. Unified Facade (`src/lib/authorization/action-guard.ts`)

| Legacy Function | Usage | New Engine Equivalent | Migration Wave |
|----------------|:----:|----------------------|:--------------:|
| `enforce()` | 8 | Replace with `engine.authorize()` | W4–W8 |
| `isAllowed()` | ~5 | Replace with `engine.authorize()` | W4–W8 |
| `assertAuthorized()` | ~3 | Replace with `engine.authorize()` | W4–W8 |
| `guardRoleLevel()` | ~3 | Remove — Policy Engine handles role level | W9 |

---

## 11. Platform Access (`src/lib/platform/access/`)

| File | Legacy | Migration | Wave |
|------|--------|-----------|:----:|
| `permissions.ts` | `can()` function | Replace with engine.authorize() | W9 |
| `rbac-service.ts` | `hasPermission()` | Replace with Permission Registry | W9 |
| `workspace-access.ts` | `validateWorkspaceAccess()` | Replace with engine.authorize() | W9 |

---

## 12. Middleware (`src/middleware.ts`)

| Feature | Migration | Wave |
|---------|-----------|:----:|
| 31 route-role mappings | Move to Policy Engine as route-scope policies | W9 |
| `hasSufficientRole()` | Replace with Decision Precedence | W9 |

---

## 13. Admin Bypass Patterns (Critical — ADR-RB02-003 Violations)

| # | Location | Migration Strategy | Wave |
|---|----------|-------------------|:----:|
| 1 | `src/lib/authorization/tenant-guard.ts:41` | Remove — let engine evaluate admin role via Policy Engine | W9 |
| 2 | `src/lib/workflowos/tenant-guard.ts:71` | Remove — use `BUSINESS_MANAGER` permission instead | W9 |
| 3 | `src/lib/workflowos/services.ts:24` | Remove — use engine.authorize() | W9 |
| 4 | `src/lib/core/knowledge/rag/knowledge-service.ts:22` | Remove — use engine.authorize() | W9 |
| 5 | `src/actions/knowledge-mining-actions.ts:41` | Remove — use engine.authorize() | W9 |
| 6 | `src/lib/platform/product-ai-bridge.ts:135` | Remove — use engine.authorize() | W9 |

---

## 14. Direct Role Comparisons (70 instances)

These are distributed across:
- `src/lib/` — ~25 (service layer)
- `src/actions/` — ~3 (action layer)
- `src/app/` — ~25 (page layer)
- `src/app/api/` — ~14 (route handler layer)

**Strategy:** Replace ALL with `engine.authorize()` calls. Each comparison becomes a specific action check. For example:
- `if (user.role !== "ADMIN")` → `engine.authorize({ ..., action: "admin.operation" })`
- `if (user.role === "VIEWER")` → `engine.authorize({ ..., action: "viewer.restricted" })`

**Wave:** W9 (Core Cleanup)

---

## Summary

| Category | Guard Points | Wave |
|----------|:-----------:|:----:|
| DecisionOS (`requireDecisionAccess`) | ~40 | W4 |
| LocalContentOS (`require*` + `assertProjectAccess`) | ~50 | W5 |
| SalesOS (`requireSalesPermission` + `assertSales*`) | ~60 | W6 |
| AuditOS (`assertEngagementAccess`) | ~33 | W7 |
| WorkflowOS (`requireClientAccess`) | ~26 | W8 |
| Core (`requireUserContext` + `isAdmin` + role comparisons + bypasses) | ~224 | W9 |
| **Total** | **~433** | |
