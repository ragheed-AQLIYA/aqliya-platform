# LC-SPEC-01a: Domain Specification — Project Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Domain Specification — retroactive alignment documenting the Project aggregate, value objects, domain events, invariants, and domain services for LocalContentOS Project Management.
> **Parent:** `LC-PRD-01_Project_Management.md` v0.1 (Draft)
> **Template:** Adapted from `SPEC-01a_Domain_Specification.md` (IES-001 Reference)
> **Note:** All types and behavior documented here reflect the existing implementation in `src/lib/local-content/`. No new design.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | `LC-PRD-01_Project_Management.md` v0.1 (Draft) |
| **Blocks** | LC-SPEC-01b (API Specification), LC-SPEC-01c (Workflow Specification), LC-SPEC-01e (Test Specification) |
| **Consumer** | Domain Engineering Team |
| **Evidence Classification** | Executable Evidence — all types trace to existing code |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Project domain definition | LC-PRD-01 | §6 (FR-01 to FR-04), §10 (Data Model) |
| Domain rules | LC-PRD-01 | §7 (DR-01 to DR-06) |
| State machine | LC-PRD-01 | §8 (Workflow) |
| Access guards | LC-PRD-01 | §7 (DR-04, DR-05) |
| Audit events | LC-PRD-01 | §7 (DR-06) |
| Prisma model | `schema.prisma` | `LocalContentProject` (lines 1970-2004) |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| Project aggregate interface | Core domain type with all properties, invariants, factory | LC-SPEC-01b (API), LC-SPEC-01c (Workflow) |
| Value object definitions | Status, ReportingPeriod, Score | LC-SPEC-01b |
| Domain event interfaces | ProjectCreated, ProjectStatusChanged | LC-SPEC-01b, LC-SPEC-01e |
| Domain service interfaces | ProjectService (CRUD + transitions) | LC-SPEC-01c |
| Guard interface | ProjectAccessGuard | LC-SPEC-01b |

---

## Dependencies

| Dependency | Type | Impact if Missing |
|---|---|---|
| Prisma `LocalContentProject` model | Schema | Cannot define aggregate |
| `platform.auth` `getCurrentUser()` | Contract | Cannot enforce access control |
| `audit-events.ts` | Service | No audit trail on mutations |

---

## Assumptions

| # | Assumption | Risk if Wrong |
|---|---|---|
| A-01 | Project is the Aggregate Root for LocalContentOS | Would need aggregate boundary refactor |
| A-02 | All related entities (Supplier, Spend, Evidence, etc.) reference Project via `projectId` | Foreign key integrity enforced by Prisma |
| A-03 | Status values are strings (not enums) for flexibility | Risk of invalid status values — mitigated by VALID_PROJECT_STATUSES const array |

---

## Open Questions

| # | Question | Impact | Resolution Needed By |
|---|---|---|---|
| OQ-01 | Should status be an enum in Prisma? | Type safety vs. migration cost | LC-SPEC-01a review |

---

## Non-Goals

This specification does NOT define:
- Prisma models or database schema (already defined in `schema.prisma`)
- Next.js Server Actions or API routes (defined in LC-SPEC-01b)
- UI components or page layouts (defined in LC-SPEC-01d)
- Testing infrastructure (defined in LC-SPEC-01e)
- Authentication flows (consumed from `platform.auth`)

---

## Implementation Independence

This specification defines:
- Business semantics for the Project aggregate
- Aggregate rules and invariants
- Domain event contracts
- Domain service interfaces
- Guard patterns

It does NOT define:
- Storage technology
- API transport
- UI framework

---

# 1. Aggregate Root: Project

## 1.1 Aggregate Definition

The **Project** is the Aggregate Root of LocalContentOS. It owns and enforces consistency for all entities within its boundary.

```text
Project (Aggregate Root)
  │
  ├── Status (current state in 11-state machine)
  ├── Suppliers[] (owned — cascade delete)
  ├── SpendRecords[] (owned — cascade delete)
  ├── Classifications[] (owned — cascade delete)
  ├── Evidence[] (owned — cascade delete)
  ├── Findings[] (owned — cascade delete)
  ├── Reviews[] (owned — cascade delete)
  ├── Approvals[] (owned — cascade delete)
  ├── Reports[] (owned — cascade delete)
  ├── AuditEvents[] (owned — cascade delete)
  └── Workbooks[] (owned — cascade delete)
```

**Rules:**
- All changes to a Project go through the Project Aggregate Root
- Related entities are accessed via `projectId` foreign key
- The Aggregate boundary ensures consistency: a Project cannot be `Approved` while `status` is `InReview`

## 1.2 Project Interface

```typescript
// From: src/lib/local-content/types.ts and Prisma schema
interface Project {
  // Identity
  id: string;
  organizationId: string;

  // Business fields
  name: string;
  reportingPeriod: string;
  scopeDescription?: string;

  // State
  status: ProjectStatus;  // 11 valid states
  localContentScore?: number;

  // Cross-product references
  platformOrganizationId?: string;
  clientWorkspaceId?: string;
  projectId?: string;

  // Audit
  createdById?: string;
  createdByName?: string;
  metadata?: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Related entities (accessed via projectId)
  suppliers: Supplier[];
  spendRecords: SpendRecord[];
  classifications: Classification[];
  evidence: Evidence[];
  findings: Finding[];
  reviews: Review[];
  approvals: Approval[];
  reports: Report[];
  auditEvents: AuditEvent[];
  workbooks: Workbook[];
}
```

### Factory

```typescript
// From: src/lib/local-content/services.ts — createProject()
function createProject(input: CreateProjectInput): Promise<Project> {
  // Sets initial status = "Draft"
  // Creates audit event: AuditActions.PROJECT_CREATED
  // Returns created project
}
```

### Reconstitution

```typescript
// From: src/lib/local-content/services.ts — getProjectById()
function getProjectById(projectId: string): Promise<Project | null> {
  // Includes all related entities
  // Guards: assertProjectAccess(projectId, "view")
}
```

## 1.3 Invariants

| Invariant ID | Invariant | Enforcement |
|---|---|---|
| PI-01 | Project must belong to exactly one organization | `organizationId` is required |
| PI-02 | Status must be a valid ProjectStatus value | Const array VALID_PROJECT_STATUSES |
| PI-03 | A project with status Archived is immutable | No transitions from Archived |
| PI-04 | Project name is required and non-empty | Validation in createProject |
| PI-05 | reportingPeriod is required | Validation in createProject |
| PI-06 | Tenant isolation: cross-org access is forbidden | `guards.ts` assertProjectAccess |

---

# 2. Value Objects

## 2.1 ProjectStatus

```typescript
// From: src/lib/local-content/types.ts
const VALID_PROJECT_STATUSES = [
  "Draft",
  "DataCollection",
  "ClassificationInProgress",
  "EvidenceReview",
  "FindingsDrafted",
  "InReview",
  "Returned",
  "Approved",
  "Rejected",
  "ReportReady",
  "Exported",
  "Archived",
] as const;

type ProjectStatus = typeof VALID_PROJECT_STATUSES[number];
```

**Rules:**
- Must be one of the 12 valid values
- Transitions governed by `workflow-gating.ts`
- Archived is terminal — no transitions out

## 2.2 ReportingPeriod

```typescript
interface ReportingPeriod {
  value: string;  // e.g., "2026-H1", "2025-Q4", "2025-2026"
}
```

**Rules:**
- Required on creation
- String type for flexibility (quarter, half-year, annual, fiscal year)

## 2.3 Score

```typescript
interface LocalContentScore {
  value: number;        // 0-100 percentage
  computedAt: Date;
  tier: ScoreTier;      // "strong" | "moderate" | "weak" | "critical"
}
```

**Rules:**
- Computed by `scoring.ts` — deterministic weighted formula
- Nullable — score is 0 until calculation is performed

---

# 3. Domain Events

Domain Events represent state changes within the Project aggregate. Currently implemented via `audit-events.ts` as structured audit records.

## 3.1 Event Interfaces

```typescript
// From: src/lib/local-content/audit-events.ts
interface ProjectCreated {
  eventType: "project.created";
  projectId: string;
  organizationId: string;
  name: string;
  reportingPeriod: string;
  actorId: string;
  timestamp: Date;
}

interface ProjectStatusChanged {
  eventType: "project.status_changed";
  projectId: string;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  actorId: string;
  timestamp: Date;
  metadata?: {
    transitionAction?: string;  // e.g., "submit_for_review", "approve"
  };
}
```

## 3.2 Audit Event Mapping

| Domain Event | AuditAction Constant | Payload |
|---|---|---|
| ProjectCreated | `AuditActions.PROJECT_CREATED` | `{ name, reportingPeriod }` |
| ProjectStatusChanged | `AuditActions.PROJECT_UPDATED` | `{ from: { status }, to: { status } }` |

## 3.3 Dual-Write Strategy

All audit events are dual-written:
1. **Product-scoped**: `prisma.localContentAuditEvent.create()` — LocalContentOS-specific audit
2. **Platform-scoped**: `writePlatformAuditLog()` — cross-product audit visibility
3. **Hash chain**: `appendToAuditChain()` — integrity verification

---

# 4. Domain Error Model

## 4.1 Error Types

```typescript
// From: src/lib/local-content/guards.ts
class ProjectAccessError extends Error {
  code: string;  // "FORBIDDEN" | "NOT_FOUND"
  constructor(message: string, code: string)
}

// From: src/lib/local-content/approval-routing.ts
class ApprovalRoutingError extends Error {
  constructor(message: string)
}
```

## 4.2 Error Mapping

| Error | Code | When |
|---|---|---|
| `ProjectAccessError` | `FORBIDDEN` | Insufficient role or cross-tenant access |
| `ProjectAccessError` | `NOT_FOUND` | Project does not exist |
| `ApprovalRoutingError` | — | Invalid approval routing state |
| Generic `Error` | — | Invalid status transition (from workflow-gating) |

---

# 5. Repository Interface

```typescript
// Implemented by: src/lib/local-content/services.ts
interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByOrganization(organizationId: string): Promise<ProjectSummary[]>;
  create(input: CreateProjectInput): Promise<Project>;
  updateStatus(id: string, status: string, actor?: { id: string; name: string }): Promise<Project>;
}
```

Where:

```typescript
interface ProjectSummary {
  id: string;
  name: string;
  reportingPeriod: string;
  status: string;
  localContentScore: number | null;
  createdAt: Date;
}
```

---

# 6. Domain Service Interfaces

```typescript
// Implemented by: src/lib/local-content/services.ts
interface ProjectDomainService {
  // Queries
  listProjectsByOrganization(organizationId: string): Promise<ProjectSummary[]>;
  getProjectById(projectId: string): Promise<Project | null>;

  // Commands
  createProject(input: CreateProjectInput): Promise<Project>;
  updateProjectStatus(projectId: string, status: string, actor?: Actor): Promise<Project>;

  // Scoring
  calculateProjectScore(projectId: string): Promise<ScoringResult>;
}

interface ProjectAccessGuard {
  assertProjectAccess(projectId: string, action: ProjectAction): Promise<ProjectAccessContext>;
  canPerformAction(user: CurrentUser, action: ProjectAction): boolean;
  resolveProjectContext(projectId: string): Promise<ProjectContext | null>;
}
```

---

# 7. Transition Guards

Status transitions are enforced by two guard layers:

## 7.1 Workflow Gate (Core)

From `workflow-gating.ts` — imported via `@/lib/core/workflow/local-content-adapter`:

```typescript
function assertLocalContentGovernanceTransition(current: string, next: string): void {
  // Validates against the 11-state machine
  // Throws Error if transition is not allowed
}
```

## 7.2 Access Guard

From `guards.ts`:

```typescript
function canPerformAction(user: CurrentUser, action: ProjectAction): boolean {
  // Role-based: ADMIN > OPERATOR > VIEWER
  // Permissions defined in exhaustive switch
}
```

---

# Traceability

| SPEC Element | PRD Reference | Code Evidence | Evidence Classification |
|---|---|---|---|
| Project Aggregate (§1) | §6 (FR-01 to FR-04) | `types.ts` (CreateProjectInput), `services.ts` (CRUD) | Executable |
| Value Objects (§2) | §8 (Workflow) | `types.ts` (VALID_PROJECT_STATUSES) | Executable |
| Domain Events (§3) | §7 (DR-06) | `audit-events.ts` (AuditActions, createLocalContentAuditEvent) | Executable |
| Error Model (§4) | §7 (DR-04, DR-05) | `guards.ts` (ProjectAccessError), `approval-routing.ts` (ApprovalRoutingError) | Executable |
| Repository (§5) | §6 (FR-01) | `services.ts` (CRUD functions) | Executable |
| Domain Services (§6) | §6 (FR-01 to FR-04) | `services.ts`, `guards.ts` | Executable |
| Transition Guards (§7) | §8 (Workflow) | `workflow-gating.ts`, `guards.ts` | Executable |
| Aggregate Invariants | §7 (DR-01 to DR-06) | `services.ts`, `guards.ts` | Executable |
| Constitution Principles | LC-PRD-01 §4 | Product Independence: no imports from other products | Governance |

---

## Alignment Delta

Because this is a **Brownfield Alignment** (LIA-001) and not a Greenfield or Cross-Product design:

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ All domain types, services, and guards exist in `src/lib/local-content/` |
| **Documented** | ✅ This specification retroactively describes the existing implementation |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only — alignment to IES-001 template, Constitution Principles mapping, and Evidence Classification |

---

## Freeze Checklist — LC-EPIC-01

Applies to the entire Epic after all 5 Specs (a–e) are complete:

| Check | Status |
|---|---|
| Blueprint Traceability | ✅ |
| PRD Complete | ✅ |
| Domain Spec Frozen | ✅ |
| API Spec Frozen | ✅ |
| Workflow Spec Frozen | ✅ |
| UX Spec Frozen | ✅ |
| Test Spec Frozen | ✅ |
| Code Evidence Verified | ✅ |
| Architecture Drift | None |
| **Freeze Decision** | **PASS** |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Domain Specification — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LC-PRD-01_Project_Management.md` v0.1
- **Program:** LIA-001 (LC-EPIC-01)
- **Status:** **Frozen** (LC-EPIC-01 complete)
- **Next:** LC-SPEC-01b (API Specification) — *already frozen*
