# AQLIYA Permission System Audit

**Generated:** 2026-06-24
**Methodology:** Full source code search for permission, RBAC, access control, guard, authorization patterns.

---

## 1. Inventory of All Authorization Systems

### 1.1 Edge Middleware RBAC
- **File:** `src/middleware.ts`
- **Lines:** 341
- **Mechanism:** JWT token-based role check on every request
- **Roles:** viewer(0), operator(1), manager(2), admin(3)
- **Route map:** `routeMinRoles` — static config mapping route prefixes to minimum role
- **Coverage:** 30+ product routes, 15+ API routes
- **Enforcement:** Redirect (page) / 403 JSON (API)
- **Gap:** Static mapping — cannot express resource-level permissions

### 1.2 Server Action Guard
- **File:** `src/core/access/server-action-guard.ts`
- **Lines:** 7,349
- **Mechanism:** Server-side enforcement in every server action
- **Capabilities:** Role check, tenant check, permission check
- **Usage:** Imported by individual server actions

### 1.3 Platform Access Control
- **File:** `src/core/access/access-control.ts` (3,092 bytes)
- **Purpose:** Core access control logic

### 1.4 Platform RBAC Service
- **Files:** `src/lib/platform/access/` (7 files, 1,409 lines)
- **Components:**
  - `rbac-service.ts` (14,468 bytes) — Full RBAC implementation
  - `permissions.ts` (935 bytes) — Permission definitions
  - `workspace-access.ts` (3,153 bytes) — Workspace scoping
  - `principal.ts` — Principal abstraction
  - `seed-permissions.ts` (7,013 bytes) — Permission seeding

### 1.5 ABAC (Attribute-Based Access Control)
- **Files:** `src/lib/platform/abac/` (3 files)
- **Components:**
  - `abac-service.ts` — Policy evaluation engine
  - `condition-evaluator.ts` — Condition expression evaluator
- **Database:** `AbacPolicy`, `AbacPolicyCondition`, `AbacPolicyAssignment` models

### 1.6 Product-Specific Guards (7 total)

| Product | Guard File | Lines | What It Checks |
|---------|-----------|-------|----------------|
| AuditOS | `src/lib/audit/tenant-guard.ts` | 1,934 | Tenant access, engagement scope |
| AuditOS | `src/core/access/audit-access-adapter.ts` | 2,175 | Audit-specific access |
| AuditOS | `src/components/audit/layout/workflow-guard.tsx` | 2,199 | Workflow state access |
| SalesOS | `src/lib/sales/guards.ts` | 3,585 | Account/deal access |
| SalesOS | `src/lib/sales/permissions.ts` | 1,228 | Sales-specific permissions |
| LocalContentOS | `src/lib/local-content/guards.ts` | 2,894 | Project access |
| LocalContentOS | `src/lib/local-content/content/permissions.ts` | 1,048 | Content permissions |
| WorkflowOS | `src/lib/workflowos/tenant-guard.ts` | 4,064 | Record access |
| Platform | `src/lib/platform/guards/platform-org-guard.ts` | 4,118 | Organization-level access |
| Platform | `src/lib/platform/guards/workspace-guard.ts` | 5,256 | Workspace-level access |

---

## 2. Permission Check Distribution

### 2.1 By Layer
| Layer | Count | Risk |
|-------|-------|------|
| Edge (middleware.ts) | 1 implementation | ✅ Single point |
| Server Actions (guard imports) | ~75 action files | ⚠️ Inconsistent if product guard differs |
| Services (lib/) | ~22 service directories | ⚠️ Guard bypass in internal calls |
| Components (client) | ~10 UI guard components | ❌ Client-side checks are not security — can be bypassed |

### 2.2 By Product
| Product | Guard Files | UI Guards | Total |
|---------|-----------|-----------|-------|
| AuditOS | 3 (tenant-guard, access-adapter, workflow-guard) | 1 | 4 |
| SalesOS | 2 (guards, permissions) | 0 | 2 |
| LocalContentOS | 2 (guards, content/permissions) | 0 | 2 |
| WorkflowOS | 1 (tenant-guard) | 0 | 1 |
| Platform | 2 (org-guard, workspace-guard) | 0 | 2 |
| **Total** | **10** | **1** | **11** |

---

## 3. Critical Findings

### C-01: No Unified Authorization Service
Products implement their own guard logic independently. There is no single `authorize()` call that all products route through.

### C-02: ABAC Not Connected
The ABAC engine exists (`src/lib/platform/abac/`) but it's unclear if it's wired into the actual authorization flow. No evidence of ABAC policy being evaluated in the authorization path found.

### C-03: Client-Side Guard Exists
`src/components/audit/layout/workflow-guard.tsx` (2,199 bytes) performs access checks client-side. This is a security anti-pattern — client checks are cosmetic, not protective.

### C-04: Product Guards Don't Route Through Central Service
Product guards (sales, local-content, workflowos) each implement their own tenant isolation logic rather than calling a shared tenant guard service.

### C-05: Static Role Map Is Brittle
The `routeMinRoles` map in middleware.ts is a static object. Changes require code deployment. No runtime role resolution.

### C-06: SoD Service Exists But May Be Disconnected
`src/lib/platform/access/sod-service.ts` implements separation of duties but there's no evidence of it being enforced in the authorization path.

---

## 4. Role Definitions

### 4.1 Current Role Hierarchy
```
viewer (0) → read-only access
operator (1) → operational actions
manager (2) → approval authority
admin (3) → full system access
```

### 4.2 Where Roles Are Defined
| Location | Purpose | Completeness |
|----------|---------|-------------|
| `middleware.ts` | Edge RBAC | Uses hierarchy for route access |
| Prisma: `Role` model | Database roles | Includes custom roles |
| `src/lib/platform/access/rbac-service.ts` | Runtime RBAC | Full implementation |
| `src/lib/platform/access/seed-permissions.ts` | Default permissions | Seeded on init |
| `prisma/schema.prisma`: `UserRoleAssignment` | User-role mapping | Database relationship |

---

## 5. Tenant Isolation Analysis

### 5.1 Tenant Model
- **Root tenant:** `PlatformOrganization`
- **Secondary contexts:** Workspace, Engagement, Project, etc.
- **Organization chain:** `PlatformOrganization` → `User` → product context

### 5.2 Tenant Isolation Gaps
1. **Multiple tenant guards** — Each product implements tenant isolation independently
2. **Cross-product queries** — Common models (like User) may cross tenant boundaries
3. **Admin user access** — No evidence of strict admin scope enforcement
4. **API routes** — Not all API routes have explicit tenant scoping

---

*This audit is based on actual source code inspection of 30+ permission-related files, middleware configuration, and Prisma schema analysis. Findings are evidence-based, not documentation-based.*
