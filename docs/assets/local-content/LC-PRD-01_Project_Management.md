# LC-PRD-01: Project Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Product Requirements Document — retroactive alignment in Standard format
> **Epic:** LC-EPIC-01 (Project Management)
> **Parent:** `LIA-001_CAPABILITY_BACKLOG.md` v1.0 → `LOCALCONTENTOS_BLUEPRINT.md` v0.1
> **Note:** This PRD documents the existing implementation. No new features are proposed. Alignment is format/process only.

---

## 1. Purpose

Project Management is the foundational capability of LocalContentOS. It enables organizations to create, track, and manage local content assessment projects through a governed 11-state lifecycle — from initial data collection through classification, evidence review, findings detection, review, approval, report export, and archival.

Every other capability depends on the Project domain. Suppliers, spend records, classifications, evidence, findings, reviews, approvals, and reports all belong to a project. Getting the project lifecycle right determines the integrity of the entire product.

---

## 2. Scope

### In Scope for v0.1 (existing implementation)

| Area | Description |
|---|---|
| Project CRUD | Create, read, update project metadata |
| Lifecycle Management | 11-state governed state machine with transitions |
| Status Transitions | Guarded transitions between all valid states |
| Audit Trail | Every state change and mutation creates an audit event |
| Role-Based Access | Permission guards based on user role (ADMIN, OPERATOR, VIEWER) |
| Tenant Isolation | All projects scoped by organizationId |
| Project List | Filterable, sortable list of projects |
| Access Guards | Server-side project access validation for all actions |

### Out of Scope for v0.1

| Area | Reason | Future |
|---|---|---|
| Multi-period comparison | Product scope — analytics is separate capability | v0.2 |
| Configurable workflows | Not implemented; 11-state is fixed | v0.2+ |
| Automated project creation from ERP data | Not implemented | v0.2+ |
| Project templates | Not implemented | v0.2+ |

---

## 3. Business Outcomes

| Outcome | Measurement | Target |
|---|---|---|
| Complete project audit trail | Every mutation creates auditable event | 100% |
| Status transition integrity | All transitions follow defined state machine | 100% |
| Tenant isolation | No cross-organization data exposure | 100% |
| Project completion rate | Projects reaching Exported state | ≥ 80% |

---

## 4. Product Capability Definition

| Field | Value |
|---|---|
| **Product Capability** | Project Management |
| **Epic** | LC-EPIC-01 |
| **Blueprint Section** | §3 (In Scope), §5 (Project Management), §7.1 (Project Context), §7.4 (State Machine), §10 (Project Modules) |
| **Constitution Principles** | 1 (Product Independence), 2 (Platform Neutrality) |
| **KPIs** | Status transition logging 100%, Project creation-to-completion ≤ 30 days |

---

## 5. Actors

| Actor | Role | Actions Permitted |
|---|---|---|
| **VIEWER** | Read-only access | View projects, view details |
| **OPERATOR** | Day-to-day operations | Create projects, manage suppliers/spend/evidence/findings, submit for review |
| **ADMIN** | Full control | All OPERATOR actions + approve projects, admin configuration |

Permissions enforced server-side via `guards.ts` (`canPerformAction`).

---

## 6. Functional Requirements

### FR-01: Create Project

| Field | Required | Type | Description |
|---|---|---|---|
| `organizationId` | ✅ | string | Owning organization |
| `name` | ✅ | string | Project name |
| `reportingPeriod` | ✅ | string | Reporting period identifier |
| `scopeDescription` | ❌ | string | Optional scope description |
| `platformOrganizationId` | ❌ | string | Platform org reference |
| `clientWorkspaceId` | ❌ | string | Client workspace reference |
| `createdById` | ❌ | string | Actor ID |
| `createdByName` | ❌ | string | Actor name |

**Behavior:**
- System sets initial status to `Draft`
- System creates audit event via `audit-events.ts`
- System returns created project

### FR-02: Get Project Detail

**Returns:**
- All project fields
- Suppliers (list)
- Spend records (list)
- Classifications (list)
- Evidence (list)
- Findings (list)
- Reviews (ordered by createdAt desc)
- Approvals (ordered by createdAt desc)
- Reports (ordered by createdAt desc)

**Behavior:**
- Server-side access guard (`assertProjectAccess`)
- Tenant isolation via organizationId

### FR-03: List Projects

| Filter | Type | Description |
|---|---|---|
| `organizationId` | string | Tenant scope (required) |

**Behavior:**
- Returns paginated list ordered by createdAt desc
- Response includes: id, name, reportingPeriod, status, localContentScore, createdAt

### FR-04: Transition Status

| From | To | Guard |
|---|---|---|
| Draft | DataCollection | — |
| DataCollection | ClassificationInProgress | Suppliers exist |
| ClassificationInProgress | EvidenceReview | Classifications exist |
| EvidenceReview | FindingsDrafted | Evidence verified |
| FindingsDrafted | InReview | Findings drafted |
| InReview | Approved | Reviewer decision |
| InReview | Returned | Reviewer decision |
| Approved | ReportReady | — |
| ReportReady | Exported | Report generated |
| Exported | Archived | — |
| Any | Returned | Reviewer decision |

**Behavior:**
- All transitions create audit event
- Returned can come from any active state

---

## 7. Domain Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| DR-01 | A Project belongs to exactly one organization | `organizationId` is required |
| DR-02 | Project status transitions must follow the state machine | `workflow-gating.ts` transition validation |
| DR-03 | Archived projects are read-only | No transitions from Archived |
| DR-04 | All mutations require server-side access guard | `guards.ts` — `assertProjectAccess` |
| DR-05 | Tenant isolation enforced server-side | All queries scoped by `organizationId` |
| DR-06 | Every mutation creates an audit event | `audit-events.ts` — all CRUD operations emit events |

---

## 8. Workflow

### State Machine (11 states)

All states and transitions are defined in `types.ts` (`VALID_PROJECT_STATUSES`) and enforced by `workflow-gating.ts`.

| State | Description | Entry Criteria |
|---|---|---|
| Draft | Initial state after project creation | — |
| DataCollection | Active data collection phase | — |
| ClassificationInProgress | Supplier classification underway | Suppliers exist |
| EvidenceReview | Evidence verification phase | Classifications exist |
| FindingsDrafted | Finding detection and drafting | Evidence verified |
| InReview | Submitted for review | Findings drafted |
| Returned | Returned with comments by reviewer | Review action |
| Approved | Approved by admin | Reviewer approval |
| Rejected | Rejected by admin | Reviewer rejection |
| ReportReady | Report generated and ready | Approval received |
| Exported | Final export completed | Report generated |
| Archived | Project archived | Exported |

---

## 9. Evidence Requirements

Evidence is managed by LC-EPIC-05 (Evidence Management). At the Project Management level, evidence is linked via `projectId` and accessed through the project detail view.

---

## 10. AI Touchpoints

AI is not part of Project Management v0.1. AI capabilities are defined in LC-EPIC-09 (AI Advisory).

---

## 11. Platform Dependencies

### Required Platform Capabilities

| Capability | Contract | Consumption Pattern |
|---|---|---|
| `platform.auth` | `requireUserContext()` | Server-side auth guard on all actions |
| Middleware RBAC | Role guard (viewer minimum) | Middleware route protection |

### Published Events (via Audit)

| Event | Payload | Description |
|---|---|---|
| `localcontent.project.created` | `{ projectId, organizationId }` | Project created |
| `localcontent.project.status_changed` | `{ projectId, fromStatus, toStatus }` | Status transition |

---

## 12. APIs

### Server Actions (in `localcontent-actions.ts`)

| Action | Input | Output |
|---|---|---|
| `createProjectAction` | `CreateProjectInput` | Project |
| `getProjectAction` | `{ projectId }` | ProjectDetail |
| `listProjectsAction` | `{ organizationId }` | Project[] |
| `updateProjectStatusAction` | `{ projectId, status }` | Project |

### Access Guard Pattern

All actions follow this guard pattern:

```typescript
async function guardedAction(projectId: string, action: ProjectAction) {
  const context = await assertProjectAccess(projectId, action);
  // proceed with operation scoped to context.project.organizationId
}
```

### Error Codes

| Code | When |
|---|---|
| `FORBIDDEN` | Missing permission or cross-tenant access |
| `NOT_FOUND` | Project not found |
| `VALIDATION_ERROR` | Invalid input |
| `BUSINESS_RULE_FAILED` | Domain invariant violated |

---

## 13. Acceptance Criteria

| AC ID | Criterion | Type |
|---|---|---|
| AC-01 | Authenticated user can create a project with required fields | Functional |
| AC-02 | Project appears in organization project list | Functional |
| AC-03 | Project status transitions follow the 11-state machine | Workflow |
| AC-04 | Invalid transitions are blocked | Governance |
| AC-05 | Archived projects are read-only | Lifecycle |
| AC-06 | Every mutation creates an Audit event | Audit |
| AC-07 | Tenant isolation: User from Org A cannot see Org B projects | Security |
| AC-08 | Role-based access: VIEWER cannot create/update projects | Authorization |

---

## 14. Test Scenarios

### Scenario 1: Happy Path — Full Lifecycle

```
1. ADMIN creates project → status = Draft
2. OPERATOR transitions to DataCollection → success
3. After supplier import, transition to ClassificationInProgress → success
4. After classifications, transition to EvidenceReview → success
5. After evidence verified, transition to FindingsDrafted → success
6. Submit for review → status = InReview
7. ADMIN approves → status = Approved
8. Generate report → status = ReportReady
9. Export → status = Exported
10. Archive → status = Archived
   Verify: All 10 audit events created, chronological order
```

### Scenario 2: Access Denied

```
1. VIEWER attempts to create project → FORBIDDEN
2. VIEWER attempts to transition status → FORBIDDEN
3. VIEWER can view project → success (read-only)
```

### Scenario 3: Tenant Isolation

```
1. User A (Org 1) creates Project
2. User B (Org 2) attempts to view Project → FORBIDDEN
3. User B attempts to transition Project → FORBIDDEN
```

---

## 15. Traceability

| PRD Element | Blueprint Reference | Constitution Principle | Code Evidence |
|---|---|---|---|
| Project CRUD | §3, §10 | 1, 2 | `services.ts` (listProjects, getProject, createProject) |
| State Machine | §7.4 | 1, 2 | `workflow-gating.ts`, `types.ts` (VALID_PROJECT_STATUSES) |
| Access Guards | §3 | 1 | `guards.ts` (assertProjectAccess, canPerformAction) |
| Audit Trail | §3 | 1 | `audit-events.ts` |
| Tenant Isolation | §3 | 2 | All services scoped by `organizationId` |
| Server Actions | §12 | 1 | `localcontent-actions.ts` |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Product Requirements Document — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LIA-001_CAPABILITY_BACKLOG.md` (LC-EPIC-01)
- **Grandparent:** `LOCALCONTENTOS_BLUEPRINT.md` (v0.1)
- **Program:** LIA-001
- **Status:** **Draft v0.1** — ready for review
- **Next:** Domain Specification (LC-SPEC-01a) → API Spec → Workflow Spec → UX Spec → Test Spec
