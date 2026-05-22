# AQLIYA Client/Organization Model v1.0

**Status:** Architecture correction — supersedes Sunbul-as-product model
**Date:** 2026-05-19
**Source of truth:** This document + `aqliya-product-taxonomy-v1.1.md`

---

## 1. Core Distinction

AQLIYA has always had two distinct concepts, but the codebase conflated them:

| Concept | Definition | Example |
|---------|-----------|---------|
| **Product** | A governed workspace with business logic, data model, routes, and UI | AuditOS, DecisionOS, SalesOS, WorkflowOS |
| **Client / Organization** | A company or institution that uses AQLIYA products | Sunbul, Future Client B, Future Client C |

**The correction:** Sunbul is a **client organization**, not a product. The workflow/case-management system previously called "Sunbul" is a **product** that should be named **WorkflowOS**.

---

## 2. AQLIYA Platform Model

```
AQLIYA (parent platform/company)
├── AQLIYA Intelligence Core (shared platform layer)
│   ├── AI Orchestration Engine
│   ├── Governance Engine
│   ├── Workflow Engine
│   ├── Evidence Graph
│   ├── Institutional Memory
│   ├── RBAC / Permissions
│   ├── Audit Logs
│   ├── Model Governance
│   ├── Document Intelligence
│   └── Reporting Engine
├── Products (built on Core)
│   ├── AuditOS         — Audit engagement platform
│   ├── DecisionOS      — Decision intelligence
│   ├── SalesOS         — Sales pipeline
│   ├── WorkflowOS      — Governed case/workflow management (was "Sunbul" code)
│   ├── LocalContentOS  — Local content compliance
│   └── [Future products]
├── AQLIYA Studio (custom systems layer)
│   ├── Workflow builder
│   ├── Form builder
│   ├── Approval configuration
│   ├── Evidence model configuration
│   ├── AI prompt/action configuration
│   ├── Custom reports
│   ├── Custom roles
│   └── Custom policies
└── Organizations / Clients
    ├── Sunbul
    ├── [Future Client B]
    └── [Future Client C]
```

---

## 3. Product vs. Client/Organization

### Product Characteristics
- Has its own workspace route: `/audit`, `/decisions`, `/sales`, `/sunbul` (legacy, to become `/workflowos`)
- Has its own Prisma models: `AuditEvent`, `Decision`, `SunbulClient` (legacy), `SunbulRecord`
- Has its own server actions and business logic
- Has its own UI components
- Has its own permissions within that product
- Is built on shared AQLIYA Intelligence Core engines

### Client/Organization Characteristics
- Is a legal entity or business unit
- Has employees/users (already modeled as `User` with `organizationId`)
- Has roles within the organization (already modeled as `UserRole`)
- Has product access entitlements (which products they can use)
- Has its own isolated data within each product
- Has its own audit trail across products

---

## 4. Sunbul Definition — Client Organization

**Name:** Sunbul (سنبل)
**Type:** Internal pilot client / reference organization
**Status:** Active — first organization using AQLIYA products
**Products enabled:** WorkflowOS (active), others TBD

### What Sunbul is
- A company/organization that uses AQLIYA products
- Has employees with roles (some already exist in the system)
- Has data isolated within each product
- Has an audit trail

### What Sunbul is NOT
- NOT a product
- NOT a workspace
- NOT the workflow/case management system (that is WorkflowOS)

---

## 5. Product Access Model

Each organization has access to a subset of products:

```
Organization Sunbul
├── Product Entitlements
│   ├── AuditOS:     enabled (future)
│   ├── DecisionOS:  enabled (future)
│   ├── SalesOS:     enabled (future)
│   ├── WorkflowOS:  enabled (current — pilot active)
│   └── [Others]:    disabled
├── Employees
│   ├── admin@aqliya.com    — Platform Admin
│   ├── sara@aqliya.com     — Operator
│   └── mohammad@aqliya.com — Viewer
└── Data
    ├── WorkflowOS: cases, documents, reviews, audit events (active)
    ├── AuditOS:    TBD
    └── DecisionOS: TBD
```

The current data model supports organization membership via `User.organizationId`. Product-level entitlement tables do not yet exist — this is a future capability.

---

## 6. Employee and Role Model

Currently:
- `User` model has `organizationId` → `Organization`
- `User` model has `role` → `UserRole` (ADMIN, OPERATOR, VIEWER)
- `SunbulUserMembership` maps users to `SunbulClient` with a product-level role (PlatformAdmin, Operator, Reviewer)

**Note:** `SunbulClient` in the current codebase represents clients **within** the WorkflowOS product. This is an internal product entity, NOT the organization/client concept described here. The naming collision is a known technical debt.

**Migration needed (future):** `SunbulClient` should be renamed to `WorkflowClient` or similar to avoid confusion with the organization-level client concept.

---

## 7. Data Isolation Model

Data isolation operates at two levels:

1. **Organization-level**: `User.organizationId` separates users by org (already implemented via `requireOrgAccess`)
2. **Product-level**: Each product has its own isolation mechanism
   - WorkflowOS: `SunbulClient` + `SunbulUserMembership` enforces per-client isolation within the product (`requireClientAccess`)
   - AuditOS: `AuditEngagement` + `organizationId` isolation
   - DecisionOS: `Decision.organizationId` isolation

**Problem:** WorkflowOS `SunbulClient` is product-scoped, not organization-scoped. An organization using WorkflowOS would need a `SunbulClient` record per internal unit. This is architecturally correct for a multi-tenant workflow product but confusingly named.

---

## 8. Product Attachments to Organization

How each product attaches to an organization:

| Product | Attachment Model | Isolation Key |
|---------|-----------------|---------------|
| AuditOS | `AuditEngagement.organizationId` | Organization |
| DecisionOS | `Decision.organizationId` | Organization |
| SalesOS | Not yet implemented | Organization (future) |
| WorkflowOS | `SunbulClient` (product-level client) | Product client (not org-level) |

**Gap:** WorkflowOS does not yet link `SunbulClient` to `Organization`. This means a WorkflowOS client cannot be mapped to an organization directly. This is acceptable for the current pilot phase but should be addressed in a future migration.

---

## 9. Renaming Sunbul Workflow → WorkflowOS

### What stays the same
- All code files, routes, server actions, and components
- Prisma models (temporarily)
- All 54+ validated tests
- The running `/sunbul` route

### What changes now
- UI navigation label: "Sunbul" → "WorkflowOS" in sidebar
- Documentation: Sunbul README marked as legacy, WorkflowOS docs created
- Organization: Sunbul defined as client, not product

### What changes now (completed)
- Route alias: `/workflowos/*` added, reuses Sunbul components
- Navigation: sidebar and links now point to `/workflowos`

### What changes later (future phase)
- Prisma model rename: `SunbulClient` → `WorkflowClient`, etc.
- Code symbol renames throughout
- Database migration for model renames

---

## 10. Migration Strategy

| Step | Risk | When | Action |
|------|------|------|--------|
| 1. Documentation | None | Now | Write architecture doc, update READMEs |
| 2. UI labels | Low | Now | Change sidebar labels only |
| 3. Org seed script | None | Now | Create seed script for Sunbul organization |
| 4. Route rename | ✅ Complete | Phase 2 | `/workflowos/*` routes added; `/sunbul/*` preserved as legacy |
| 5. Model rename | High | Phase 3 | Rename Prisma models + migration (requires careful deprecation) |
| 6. Symbol rename | Medium | Phase 3 | Rename all code symbols (actions, components, lib) |

---

## 11. Risks and No-Delete Policy

### Risks
1. **Naming collision**: `SunbulClient` in Prisma sounds like "Sunbul the organization" but is actually "a client within WorkflowOS". This will confuse developers.
2. **Broken tests**: Renaming routes or models could break the 54 validated tests. Defer until dedicated test-update phase.
3. **Missing org linkage**: WorkflowOS `SunbulClient` records have no `organizationId` foreign key. Adding it later requires a migration.
4. **Multi-product navigation**: The sidebar currently shows products. Once organizations become first-class, the nav model needs to switch to "select organization → see products".

### No-Delete Policy
- No existing Sunbul code will be deleted
- No existing test will be removed or invalidated
- No Prisma migration will be created for renames
- All existing routes continue to work
- The `/sunbul` route remains active (legacy)
- The `/workflowos` route is the preferred product route

### Current Tech Debt Register
1. `SunbulClient` model name conflicts with organization concept
2. Route `/sunbul` has `/workflowos` alias (legacy route preserved)
3. No `organizationId` on WorkflowOS client records
4. No product entitlement table (org→product access mapping)
5. Sidebar lacks organization context switcher
