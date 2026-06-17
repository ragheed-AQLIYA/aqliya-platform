# AQLIYA ClientWorkspace and Project Model Design

**Version:** 1.0
**Status:** Architecture design — not yet implemented
**Aligned with:** `aqliya-cloud-platform-build-plan.md`, `aqliya-platform-foundation-safety-review.md`, official v1.1 docs
**Strategic direction:** Build Cloud-first, Private-ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Context](#2-business-context)
3. [Current Platform Foundation](#3-current-platform-foundation)
4. [Concept Definitions](#4-concept-definitions)
5. [Proposed Data Model](#5-proposed-data-model)
6. [Product Integration Model](#6-product-integration-model)
7. [Permissions and RBAC Model](#7-permissions-and-rbac-model)
8. [Tenant / Client Isolation Rules](#8-tenant--client-isolation-rules)
9. [Audit and Evidence Implications](#9-audit-and-evidence-implications)
10. [Migration Strategy](#10-migration-strategy)
11. [Rollback Plan](#11-rollback-plan)
12. [UI Route Proposal](#12-ui-route-proposal)
13. [Implementation Plan](#13-implementation-plan)
14. [Risks and Mitigations](#14-risks-and-mitigations)
15. [No-Go Conditions](#15-no-go-conditions)
16. [Recommended Sprint 2B](#16-recommended-sprint-2b)

---

## 1. Executive Summary

The AQLIYA Platform now has a foundation `PlatformOrganization` bridge that unifies DecisionOS and AuditOS organizations under a single platform identity. The next abstraction layer is **ClientWorkspace** and **Project** — models that provide strict data isolation between clients and execution units within a platform organization.

### Why This Matters

Companies like **Sombol** serve many clients simultaneously. Each client's data must be strictly isolated:
- Audit engagements for Client A must never mix with Client B
- Local content analysis for Client C must never leak to Client D
- Office AI Assistant queries must be scoped to one client workspace
- Reports and exports must be client-specific

Without `ClientWorkspace` and `Project`, all of this isolation must be manually managed at the product level using product-specific models (`AuditClient` → `AuditEngagement`). This becomes unmanageable as new products are added.

### Design Philosophy

| Principle | Application |
|---|---|
| Additive only | New models have nullable FKs; existing models unchanged |
| Product-agnostic | `ClientWorkspace` and `Project` are shared platform models |
| Isolation-first | Data never crosses workspace or project boundaries |
| Cloud + Private ready | Same model works for multi-tenant Cloud and single-tenant Private |
| Incremental adoption | Start with new workspaces; migrate legacy data gradually |

---

## 2. Business Context: Sombol / Multi-Client Firms

### The Sombol Pattern

Sombol (and similar organizations) operate as a **service provider** to multiple clients:

```
Sombol (PlatformOrganization)
├── Client: Saudi Aramco (ClientWorkspace)
│   ├── Project: FY2025 Financial Audit (AuditOS)
│   └── Project: H2 2025 Supplier Analysis (LocalContentOS)
│
├── Client: SABIC (ClientWorkspace)
│   ├── Project: Q1 2026 Review (AuditOS)
│   └── Project: N/A Breakdown Report (LocalContentOS)
│
├── Client: Internal Operations (ClientWorkspace)
│   └── Project: Q4 Strategy Deck (Office AI Assistant)
│
└── Client: Ministry of Finance (ClientWorkspace)
    └── Project: Tender Decision Analysis (DecisionOS)
```

### Problems Without ClientWorkspace

| Problem | Current Workaround | Risk |
|---|---|---|
| No cross-product client isolation | Each product has its own client concept | Data leak between products for same client |
| No unified client identifier | AuditClient.id vs DecisionOS has no client concept | Cannot link audit + content work for same client |
| No workspace-level permissions | Managed per-product at engagement/decision level | Inconsistent access control |
| No workspace-scoped AI | AI queries can't be limited to one client's data | Cross-client data exposure in AI |
| No workspace-scoped reporting | Reports manually assembled per client | Inconsistent export experience |

### What ClientWorkspace Solves

A single `ClientWorkspace` record provides:
- A unified client identity visible across all products
- Workspace-scoped RBAC (users, roles, permissions)
- Workspace-scoped AI queries (Office AI Assistant)
- Workspace-scoped file storage (File Vault prefix)
- Workspace-scoped audit logs
- Workspace-scoped report generation

### What Project Solves

A single `Project` record provides:
- The execution unit within a workspace (audit engagement, content analysis, AI task)
- Granular data isolation within a workspace
- Project-scoped team assignments
- Project-scoped evidence graph
- Project-scoped workflow state
- Consistent `projectId` across all product entities

---

## 3. Current Platform Foundation

### What Exists Today

```
PlatformOrganization (implemented)
├── Organization (DecisionOS, legacy)
│   └── Decision[], AuditLog[]
├── AuditOrganization (AuditOS, legacy)
│   └── AuditClient[] → AuditEngagement[]
│       ├── AuditTrialBalance, AuditAccountMapping, ...
│       ├── AuditFinding, AuditRecommendation, ...
│       ├── AuditEvidence, AuditEvidenceLink, ...
│       └── AuditEvent, AuditAiOutput, ...
├── PlatformOrganizationContext (read helpers)
├── PlatformOrgGuard (report-only guard)
└── Session: platformOrganizationId (optional)
```

### What Does Not Exist Yet

- `ClientWorkspace` — proposed
- `Project` — proposed
- `ProjectId` on AuditEngagement — proposed (nullable)
- `ClientWorkspaceId` on AuditClient — proposed (nullable)
- Workspace-scoped RBAC — proposed
- Workspace UI routes — proposed

### Current AuditOS Data Flow (unchanged)

```
AuditOrganization → AuditClient → AuditEngagement
    (legacy org)      (client)       (project/engagement)
```

### Target Data Flow (additive)

```
PlatformOrganization
└── ClientWorkspace          ← NEW
    └── Project              ← NEW
        └── AuditEngagement  ← existing, linked via projectId (nullable)
```

---

## 4. Concept Definitions

### 4.1 ClientWorkspace

A **ClientWorkspace** is a governed environment within a `PlatformOrganization` that represents a single client, business relationship, or operational context. All data for that client lives inside its workspace.

| Property | Value |
|---|---|
| **Belongs to** | `PlatformOrganization` |
| **Represents** | A client, partner, internal department, or business unit |
| **Contains** | One or more `Project` records |
| **Isolation boundary** | Data never crosses workspace boundaries |
| **Lifecycle** | Active → Archived → (optional) Deleted |
| **Product scope** | Multiple products can operate within the same workspace |

### 4.2 Project

A **Project** is an execution unit within a `ClientWorkspace`. It represents a specific piece of work (an audit engagement, a content analysis, an AI task).

| Property | Value |
|---|---|
| **Belongs to** | `ClientWorkspace` |
| **Represents** | A specific engagement, analysis, or task |
| **Contains** | Product-specific data (FK'd to `projectId`) |
| **Isolation boundary** | Data never crosses project boundaries within a workspace |
| **Lifecycle** | Planned → Active → Review → Approved → Archived |
| **Product scope** | Exactly one product type per project |

### 4.3 Key Distinctions

| Concept | Scope | Example |
|---|---|---|
| PlatformOrganization | Company/tenant | "Sombol" |
| ClientWorkspace | Client relationship | "Saudi Aramco" |
| Project | Execution unit | "FY2025 Financial Audit" |
| AuditEngagement | AuditOS-specific | Currently maps to Project |

### 4.4 Workspace Types

| Type | Purpose | Examples |
|---|---|---|
| `audit` | Financial/audit client | External audit for a client |
| `content` | Local content measurement | Supplier locality analysis |
| `internal` | Internal operations | Office AI Assistant for employee tasks |
| `decision` | Strategic decisions | Tender decision workspace |

---

## 5. Proposed Data Model

### 5.1 ClientWorkspace

```prisma
model ClientWorkspace {
  id                        String         @id @default(cuid())
  platformOrganizationId    String
  platformOrganization      PlatformOrganization @relation(fields: [platformOrganizationId], references: [id])
  name                      String
  slug                      String
  workspaceType             String         // "audit" | "content" | "internal" | "decision"
  status                    String         @default("active")   // active | archived | suspended
  productAccess             Json?          // { audit: true, content: false, officeai: true }
  metadata                  Json?          // industry, region, settings, branding
  createdAt                 DateTime       @default(now())
  updatedAt                 DateTime       @updatedAt
  deletedAt                 DateTime?

  // Relations
  projects                  Project[]
  auditClients              AuditClient[]?  // optional link back (see section 10)

  @@unique([platformOrganizationId, slug])
  @@index([platformOrganizationId, status])
  @@index([workspaceType])
  @@index([status])
}
```

**Field decisions:**
- `+` `slug` unique within `PlatformOrganization` (composite unique) — allows orgs to reuse client names
- `+` `productAccess` JSON — enables/disables products per workspace for licensing
- `+` `deletedAt` — soft delete for client data retention compliance
- `-` No separate `displayName` — `name` is sufficient
- `-` No `settings` JSON — `metadata` handles extensibility
- `-` No explicit `industry` field — stored in `metadata`

### 5.2 Project

```prisma
model Project {
  id                        String         @id @default(cuid())
  workspaceId               String
  workspace                 ClientWorkspace @relation(fields: [workspaceId], references: [id])
  name                      String
  projectType               String         // "audit_engagement" | "content_analysis" | "office_task" | "decision"
  status                    String         @default("active")   // planned | active | review | approved | archived
  team                      Json?          // [{ userId, role }]
  metadata                  Json?          // framework, currency, fiscal period
  createdAt                 DateTime       @default(now())
  updatedAt                 DateTime       @updatedAt

  // Relations to product-specific models (nullable, deferred)
  // auditEngagements  AuditEngagement[]  // optional — added in migration phase
  // contentProjects   ContentProject[]   // future — LocalContentOS

  @@index([workspaceId, status])
  @@index([projectType])
  @@index([status])
  @@index([createdAt])
}
```

**Field decisions:**
- `+` `team` JSON — flexible team assignment without join table for MVP
- `+` `metadata` JSON — product-specific configuration
- `-` No timeline fields (`startDate`, `endDate`) — deferred, use `metadata`
- `-` No `projectId` FK on existing models yet — nullable FK added in migration

### 5.3 Relation to Existing Models (Additive Only)

```prisma
// AuditClient — add optional link to ClientWorkspace
model AuditClient {
  // ... existing fields ...
  clientWorkspaceId  String?
  clientWorkspace    ClientWorkspace? @relation(fields: [clientWorkspaceId], references: [id])
  @@index([clientWorkspaceId])
}

// AuditEngagement — add optional link to Project
model AuditEngagement {
  // ... existing fields ...
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id])
  @@index([projectId])
}
```

### 5.4 Fields Deferred to Future Sprints

| Field | Model | Reason | Sprint |
|---|---|---|---|
| `billingPlan` | ClientWorkspace | Commercial tier | Sprint 3+ |
| `storageQuota` | ClientWorkspace | Per-workspace limits | Sprint 3+ |
| `theme` / `branding` | ClientWorkspace | White-label | Post-12 |
| `startDate` / `endDate` | Project | Timeline management | Sprint 2C |
| `budget` | Project | Financial tracking | Sprint 2C |
| `templateId` | Project | Project from template | Sprint 9+ |
| `LegacyOrgId` on Project | Project | Link to AuditOrganization.id | Sprint 2B |

### 5.5 Indexes Summary

| Table | Index | Purpose |
|---|---|---|
| `ClientWorkspace` | `(platformOrganizationId, slug)` UNIQUE | Slug uniqueness per org |
| `ClientWorkspace` | `(platformOrganizationId, status)` | Org-scoped workspace listing |
| `ClientWorkspace` | `workspaceType` | Type-based queries |
| `ClientWorkspace` | `status` | Status-based filtering |
| `Project` | `(workspaceId, status)` | Workspace-scoped project listing |
| `Project` | `projectType` | Type-based queries |
| `Project` | `status` | Status-based filtering |
| `Project` | `createdAt` | Time-based ordering |
| `AuditClient` | `clientWorkspaceId` | Workspace lookup |
| `AuditEngagement` | `projectId` | Project lookup |

---

## 6. Product Integration Model

### 6.1 AuditOS Integration

**Current state:**
```
AuditOrganization → AuditClient → AuditEngagement
```

**Target state (additive):**
```
PlatformOrganization → ClientWorkspace (type: audit) → Project (type: audit_engagement)
                                                           ↑
                                              AuditEngagement (projectId FK)
```

**Integration points:**
| AuditOS Entity | Target Platform Entity | Type |
|---|---|---|
| `AuditOrganization` | `PlatformOrganization` | Already linked (Sprint 1A) |
| `AuditClient` | `ClientWorkspace` (optional FK) | Additive link |
| `AuditEngagement` | `Project` (optional FK) | Additive link |

**Migration:**
- Create `ClientWorkspace` from existing `AuditClient` records
- Create `Project` from existing `AuditEngagement` records
- Set nullable FKs on `AuditClient` and `AuditEngagement`
- Existing AuditOS queries unchanged

**No changes to:**
- `audit-actions.ts` — continues reading `engagement.organizationId`
- `tenant-guard.ts` — continues checking `organizationId`
- `actor-context.ts` — continues resolving via session `organizationId`
- AuditOS routes — unchanged

### 6.2 LocalContentOS Integration

**Current state:** Not implemented (marketing-only)

**Target state:**
```
PlatformOrganization → ClientWorkspace (type: content) → Project (type: content_analysis)
                                                             ↓
                                                   ContentProject (new model)
```

**Integration:**
- LocalContentOS builds on `ClientWorkspace` and `Project` from day one
- No legacy migration needed
- Uses workspace-scoped RBAC, audit, file vault

### 6.3 Office AI Assistant Integration

**Current state:** Not implemented

**Target state:**
```
PlatformOrganization → ClientWorkspace (type: internal) → Project (type: office_task)
                                                             ↓
                                                   AI queries scoped here
```

**Integration:**
- Each AI query receives `projectId` as governance context
- AI orchestration limits file access to project-scoped files
- Evidence Graph links are project-scoped
- Audit logs include `projectId`

### 6.4 DecisionOS Integration

**Current state:** `Organization` → `Decision`

**Target state:**
```
PlatformOrganization → ClientWorkspace (type: decision) → Project (type: decision)
                                                             ↓
                                                   Decision (projectId FK, optional)
```

**Integration:**
- DecisionOS already has `Organization` → `PlatformOrganization` via bridge
- Adding `projectId` to `Decision` model is optional and deferred
- Decisions can exist without a workspace (backward compatible)

---

## 7. Permissions and RBAC Model

### 7.1 Permission Hierarchy

```
PlatformOrganization (owner: platform_admin)
│
├── Workspace-level permissions (ClientWorkspace)
│   ├── workspace_admin    → full workspace control, user management
│   ├── workspace_manager  → create/edit projects, manage team
│   └── workspace_viewer   → read-only access to all projects
│
└── Project-level permissions (Project)
    ├── project_lead       → full project control, approvals
    ├── project_editor     → create/edit project data
    └── project_viewer     → read-only project access
```

### 7.2 Permission Enforcement

```
Request → auth middleware → platform org guard →
  workspace guard (user has access to ClientWorkspace?) →
    project guard (user has access to Project?) →
      product guard (product enabled for workspace?) →
        action guard (role has permission for action?)
```

### 7.3 Default Workspace Roles

| Role | Create Projects | Edit Data | Approve | Export | Manage Users |
|---|---|---|---|---|---|
| `workspace_admin` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `workspace_manager` | ✓ | ✓ | ✓ | ✓ | — |
| `workspace_viewer` | — | — | — | — | — |

### 7.4 Default Project Roles

| Role | Edit Data | Approve | Export | Manage Team |
|---|---|---|---|---|
| `project_lead` | ✓ | ✓ | ✓ | ✓ |
| `project_editor` | ✓ | — | ✓ | — |
| `project_viewer` | — | — | — | — |

### 7.5 Model Considerations

The permission model is **designed but not implemented**. Actual enforcement will use either:

1. **`PlatformRole` model** (preferred) — unified role model across all products (Sprint 3)
2. **Per-workspace membership table** — `WorkspaceMembership { userId, workspaceId, role }` — simpler, workspace-specific

**Recommendation:** Start with a `WorkspaceMembership` table for MVP (Sprint 2B), migrate to `PlatformRole` later (Sprint 3).

---

## 8. Tenant / Client Isolation Rules

### 8.1 Isolation Boundaries

| Layer | Isolation | Enforcement |
|---|---|---|
| PlatformOrganization | Hard tenant boundary | All queries filtered by `platformOrganizationId` |
| ClientWorkspace | Hard client boundary | All product queries filtered by workspace-scoped `projectId` |
| Project | Hard execution boundary | All product entities carry `projectId` |

### 8.2 Enforcement Rules

1. **Every query** that accesses client data MUST filter by `projectId` or `workspaceId`
2. **AI orchestration** receives `projectId` as mandatory governance context — queries scoped to that project's evidence and files
3. **File Vault** paths include `workspaceId` and `projectId` — no cross-project file access
4. **Audit Logs** include `workspaceId` and `projectId` — traceable to client and project
5. **Exports** are project-scoped — cannot export data from multiple projects simultaneously
6. **User access** is checked at workspace level first, then project level

### 8.3 Cloud vs Private

| Aspect | Cloud (Multi-Tenant) | Private (Single-Tenant) |
|---|---|---|
| PlatformOrganization | One per customer | One per deployment |
| ClientWorkspace isolation | Row-level `platformOrganizationId` | All workspaces belong to same org |
| Project isolation | Row-level `workspaceId` | Same as Cloud |
| Enforcement | Application-level + DB indexes | Same code, same rules |

---

## 9. Audit and Evidence Implications

### 9.1 Current Audit State

| Audit Source | Model | Scope |
|---|---|---|
| AuditOS actions | `AuditEvent` | Per-engagement |
| DecisionOS actions | `AuditLog` | Per-organization |

### 9.2 Target State with Workspace/Project

All audit events should carry `workspaceId` and `projectId` for cross-product tracing:

```prisma
// Future: PlatformAuditLog (Sprint 3)
model PlatformAuditLog {
  workspaceId  String?
  projectId    String?
  // ... other fields
}
```

### 9.3 Evidence Graph Implications

Evidence linking currently uses `AuditEvidenceLink` which links evidence to findings/recommendations within an engagement. With workspaces:

- Evidence nodes should carry `projectId`
- Evidence edges remain within-project
- Evidence graph queries scoped by `projectId`
- Cross-project evidence queries explicitly blocked

### 9.4 Migration Impact

- `AuditEvent` continues to work without `workspaceId`/`projectId` — field is optional
- `AuditEvidenceLink` continues without `projectId` — scoped via engagement → project link
- New events CAN include `workspaceId`/`projectId` if available
- No changes to existing audit queries

---

## 10. Migration Strategy

### 10.1 Phase 1: Schema Addition (Sprint 2A-1)

**Goal:** Create `ClientWorkspace` and `Project` tables with nullable FK columns on existing models.

**Steps:**
1. [ ] Add `ClientWorkspace` model to `prisma/schema.prisma`
2. [ ] Add `Project` model to `prisma/schema.prisma`
3. [ ] Add `clientWorkspaceId String?` to `AuditClient`
4. [ ] Add `projectId String?` to `AuditEngagement`
5. [ ] Add indexes for all new FK columns
6. [ ] Run `npx prisma generate` and `npx prisma db push`
7. [ ] Run `npx tsc --noEmit`, lint, build

**Duration:** 1 deployment
**Risk:** Minimal — additive only, no data changes

### 10.2 Phase 2: Backfill (Sprint 2A-2)

**Goal:** Create `ClientWorkspace` from `AuditClient` and `Project` from `AuditEngagement`.

**Steps:**
1. [ ] Create `scripts/backfill-client-workspaces.ts`
2. [ ] Dry-run mode by default
3. [ ] For each `AuditOrganization` → find linked `PlatformOrganization`
4. [ ] For each `AuditClient` → create `ClientWorkspace` (type: audit)
5. [ ] For each `AuditEngagement` → create `Project` (type: audit_engagement)
6. [ ] Set `AuditClient.clientWorkspaceId` and `AuditEngagement.projectId`
7. [ ] Verify all backfilled links

**Backfill matching:**
```
AuditClient.name → ClientWorkspace.name
AuditClient.organizationId → PlatformOrganization via AuditOrganization link
AuditEngagement (each) → Project
AuditEngagement.clientId → ClientWorkspace via AuditClient link
```

**Verification:**
- Every `AuditClient` has a `clientWorkspaceId`
- Every `AuditEngagement` has a `projectId`
- Every `Project` belongs to a `ClientWorkspace`
- Every `ClientWorkspace` belongs to a `PlatformOrganization`

### 10.3 Phase 3: Read Helpers (Sprint 2A-3)

**Goal:** Add read-only helpers for workspace/project context.

**New files:**
- `src/lib/platform/client-workspace-context.ts`
- `src/lib/platform/project-context.ts`

**Helpers:**
- `getWorkspaceById(id)`
- `getWorkspaceBySlug(orgId, slug)`
- `getWorkspaceByAuditClientId(clientId)`
- `getProjectById(id)`
- `getProjectByEngagementId(engagementId)`
- `resolveWorkspaceContext(lookup)`
- `assertWorkspaceAccess(currentUser, workspaceId)`

### 10.4 Phase 4: Guard (Sprint 2A-4)

**Goal:** Add workspace/project guard in report-only mode.

**New file:**
- `src/lib/platform/guards/workspace-guard.ts`

**Functions:**
- `getWorkspaceGuardReport(currentUser, workspaceId)` — report-only
- `requireWorkspaceAccess(currentUser, workspaceId)` — throws on failure

### 10.5 Deferred Items

| Item | Defer To | Reason |
|---|---|---|
| `PlatformRole` model for workspace RBAC | Sprint 3 | Need unified role model |
| `PlatformAuditLog` with workspaceId/projectId | Sprint 3 | Need unified audit model |
| Workspace UI routes (`/workspaces/[id]`) | Sprint 2B | Need route migration planning |
| Workspace settings/admin page | Sprint 2B | Follows route creation |
| DecisionOS `projectId` | Sprint 2C | Lower priority, optional |
| `ContentProject` model | Phase 6 (roadmap) | LocalContentOS not yet implemented |
| Office AI Assistant project integration | Sprint 7 | Office AI Assistant not yet implemented |

---

## 11. Rollback Plan

### 11.1 Schema Rollback (Phase 1)

```sql
ALTER TABLE "AuditEngagement" DROP COLUMN "projectId";
ALTER TABLE "AuditClient" DROP COLUMN "clientWorkspaceId";
DROP TABLE "Project";
DROP TABLE "ClientWorkspace";
```

**Impact:** Zero data loss. Additive columns removed.

### 11.2 Backfill Rollback (Phase 2)

```sql
UPDATE "AuditEngagement" SET "projectId" = NULL;
UPDATE "AuditClient" SET "clientWorkspaceId" = NULL;
DELETE FROM "Project";
DELETE FROM "ClientWorkspace";
```

**Impact:** Backfill undone. Project/Workspace records removed.

### 11.3 Full Rollback

1. Remove guard files
2. Remove context helper files
3. Rollback schema
4. Regenerate Prisma client
5. Run full test suite

---

## 12. UI Route Proposal

### 12.1 Workspace Routes (Future)

```
/(dashboard)/[orgSlug]/          ← platform org scope (Sprint 9)
├── workspaces/
│   ├── [workspaceId]/
│   │   ├── overview            ← workspace dashboard
│   │   ├── projects/           ← project listing
│   │   ├── settings            ← workspace admin
│   │   ├── audit/              ← AuditOS projects in workspace
│   │   ├── content/            ← LocalContentOS projects
│   │   └── assistant/          ← Office AI Assistant scoped to workspace
│   └── new                     ← create workspace
```

### 12.2 Route Migration Path

1. **Sprint 2B:** `/settings/workspaces` — admin read-only page (similar to platform org page)
2. **Sprint 2C:** `/settings/workspaces/[id]` — workspace detail page
3. **Sprint 9:** `/workspaces/` route group under org-scoped routes

### 12.3 What NOT to Build Yet

- `/workspaces/new` — no create action yet
- `/workspaces/[id]/settings` — no edit functionality
- `/workspaces/[id]/projects/new` — no project creation
- Org-scoped route prefix (`/[orgSlug]`) — deferred to Sprint 9
- Sidebar navigation to workspace pages — deferred until routes exist

---

## 13. Implementation Plan

### 13.1 Sprint 2A-1: Schema Addition (1-2 days)

1. Add `ClientWorkspace` + `Project` models to schema
2. Add nullable FKs to `AuditClient` and `AuditEngagement`
3. Generate migration
4. Validate (tsc, lint, build)

### 13.2 Sprint 2A-2: Backfill Script (1-2 days)

1. Create `scripts/backfill-client-workspaces.ts`
2. Dry-run and apply modes
3. Backfill existing `AuditClient` → `ClientWorkspace`
4. Backfill existing `AuditEngagement` → `Project`
5. Verify 100% coverage

### 13.3 Sprint 2A-3: Read Context Layer (1 day)

1. Create `src/lib/platform/client-workspace-context.ts`
2. Create `src/lib/platform/project-context.ts`
3. Wire to existing `platform-organization-context.ts`

### 13.4 Sprint 2A-4: Guard + Admin Page (1-2 days)

1. Create `src/lib/platform/guards/workspace-guard.ts`
2. Create `/settings/workspaces` admin read page
3. Add navigation link

### 13.5 Total Sprint Duration

**Estimated: 4-7 days** for all four phases.

---

## 14. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ClientWorkspace duplicates AuditClient fields | Medium | Low | AuditClient remains source of truth for audit-specific fields; ClientWorkspace is the platform abstraction |
| Backfill creates too many workspaces from test data | Medium | Low | Dry-run first; report unmatched records; manual review before apply |
| Workspace schema changes require AuditOS route changes | Low | Medium | All FKs are nullable; AuditOS routes unchanged until Sprint 9 |
| `slug` uniqueness conflicts during backfill | Low | Medium | Composite unique `(platformOrganizationId, slug)` — conflicts scoped to one org |
| Workspace RBAC implementation scope creep | Medium | Medium | Defer `PlatformRole` to Sprint 3; use simple ownership model for MVP |
| DecisionOS integration creates unnecessary coupling | Low | Low | DecisionOS `projectId` is optional and deferred; workspaces work without it |

---

## 15. No-Go Conditions

### Hard No-Go (Stop Immediately)

| Condition | Action |
|---|---|
| Any existing AuditOS test fails after schema change | Revert migration |
| `AuditClient.clientWorkspaceId` backfill misses records | Revert backfill, investigate |
| `AuditEngagement.projectId` backfill misses records | Revert backfill, investigate |
| npx tsc --noEmit reports errors in existing files | Revert changes affecting those files |
| Middleware or tenant-guard behavior changes | Revert, investigate |

### Soft No-Go (Pause and Assess)

| Condition | Action |
|---|---|
| More than 5% of AuditClients have no matching PlatformOrganization | Pause, fix PlatformOrganization backfill first |
| Slug generation produces unintelligible names for >5% of workspaces | Improve slug generation, manual override |
| Backfill takes longer than 5 minutes | Optimize with batch processing |

---

## 16. Recommended Sprint 2B

**Sprint 2B: Workspace Admin Page + Read Context**

After the schema (Sprint 2A-1) and backfill (Sprint 2A-2) are complete:

1. **Create read helpers:**
   - `src/lib/platform/client-workspace-context.ts` — `getWorkspaceById`, `getWorkspaceByAuditClientId`, `resolveWorkspaceContext`
   - `src/lib/platform/project-context.ts` — `getProjectById`, `getProjectByEngagementId`

2. **Create workspace guard:**
   - `src/lib/platform/guards/workspace-guard.ts` — report-only, `requireWorkspaceAccess` (throws)

3. **Create admin page:**
   - `/settings/workspaces` — read-only workspace listing
   - Shows workspace → projects → linked engagement mapping
   - Reports unmatched AuditClient records

4. **Add package scripts:**
   - `platform:verify-workspace-links`

5. **Validate:** tsc, lint, build, verify-workspace-links

**Do NOT build yet:**
- Workspace creation forms
- Project creation forms
- Workspace RBAC enforcement
- Workspace-scoped routes
- Sidebar navigation to workspaces
- DecisionOS `projectId`
