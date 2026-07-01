# LC-SPEC-01b: API Specification — Project Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** API Specification — retroactive alignment documenting the Server Actions (Next.js App Router), Route Handlers, guard layers, and API contract for LocalContentOS Project Management.
> **Parent:** `LC-PRD-01_Project_Management.md` v0.1 (Draft)
> **Depends On:** `LC-SPEC-01a_Domain_Specification.md` v0.1
> **Template:** Adapted from `SPEC-01b_API_Specification.md` (IES-001 Reference)
> **Note:** All endpoints documented here reflect the existing implementation in `src/actions/` and `src/app/api/local-content/`. No new design.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | `LC-SPEC-01a_Domain_Specification.md` v0.1 |
| **Blocks** | LC-SPEC-01c (Workflow), LC-SPEC-01e (Test) |
| **Consumer** | API Engineering, Frontend Integration Teams |
| **Evidence Classification** | Executable Evidence — all endpoints trace to existing code |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Domain Model | LC-SPEC-01a | §§1-7 |
| Prisma Model | `schema.prisma` | `LocalContentProject`, `LocalContentSupplier`, etc. |
| Server Action implementations | `src/actions/localcontent-actions.ts` | 38 exported actions |
| Route Handler implementations | `src/app/api/local-content/` | 2 download routes |
| Guard implementations | `src/actions/localcontent-guards.ts` | 7 guard functions |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| Server Action Map | Complete inventory of 38 Server Actions | Frontend teams, Column generation |
| Route Handler Map | 2 REST-like download endpoints | Frontend file download flows |
| Guard Layer Contract | Tenant isolation and permission guard chain | Security review, Column generation |
| Input Validation Schema | Zod schemas for write operations | QA, Test teams |
| Error Response Contract | Standardized error shape | API consumers |
| ActionResult Pattern | Safe wrapper type for all Server Actions | Frontend error handling |

---

## Dependencies

| Dependency | Type | Impact if Missing |
|---|---|---|
| `platform.auth` `requireUserContext()` | Auth | No user identity for tenant isolation |
| `platform.auth` `getCurrentUser()` | Auth | No user identity for Route Handlers |
| `guards.ts` (local-content) | Access control | No organization-scoped access |
| `validation.ts` (local-content) | Input validation | No structured validation |
| `schemas/*` (Zod) | Schema validation | No runtime type checking |

---

## Assumptions

| # | Assumption | Risk if Wrong |
|---|---|---|
| A-01 | Server Actions are the primary API for Project Management | Route Handlers exist only for downloads |
| A-02 | `ActionResult<T>` is the standard return type | Page components may use different patterns |
| A-03 | Tenant isolation is enforced server-side via `requireUserContext` + `assertProjectAccess` | Downstream code may skip guard calls |

---

## Open Questions

| # | Question | Impact | Resolution Needed By |
|---|---|---|---|
| OQ-01 | Should Route Handlers use the same safe() wrapper pattern as Server Actions? | Consistency | LC-SPEC-01b review |

---

## Non-Goals

This specification does NOT define:
- Service layer implementation (defined in `services.ts`)
- UI component integration (defined in LC-SPEC-01d)
- Database queries (defined in Prisma + services)
- Authentication flow (consumed from `platform.auth`)

---

## Implementation Independence

This specification defines:
- Server Action interface signatures
- Route Handler contracts
- Guard layer contracts
- Input validation schemas (by reference)
- Error response shape

It does NOT define:
- HTTP transport details beyond what Route Handlers expose
- Database technology
- Deployment configuration

---

# 1. API Surface Overview

## 1.1 API Classification

LocalContentOS exposes two API surfaces:

| Surface | Technology | Count | Purpose |
|---|---|---|---|
| **Server Actions** | Next.js Server Actions (`"use server"`) | 38 | CRUD + workflow transitions + scoring |
| **Route Handlers** | Next.js App Router `route.ts` | 2 | File download (evidence, reports) |

Both surfaces require authentication and enforce tenant isolation server-side.

## 1.2 Server Action Map (Project Management subset)

All Server Actions are in `src/actions/localcontent-actions.ts`. Each follows the pattern:

```typescript
async function actionName(param1: Type1, ...): Promise<ActionResult<ResponseType>>
```

Where `ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; code?: string }`.

### Project CRUD

```typescript
listLocalContentProjectsAction(): Promise<ActionResult<ProjectSummary[]>>
  // Query: listProjectsByOrganization(currentUser.organizationId)
  // Guard: requireUserContext() + org-scoped query

getLocalContentProjectAction(projectId: string): Promise<ActionResult<Project>>
  // Query: getProjectById(projectId) — includes all relations
  // Guard: assertProjectAccess(projectId, "view")

createLocalContentProjectAction(formData: FormData): Promise<ActionResult<Project>>
  // Mutates: createProject(input)
  // Guard: requireUserContext()
  // Validation: Zod schemas for required fields
  // Revalidates: /local-content/projects

updateLocalContentProjectAction(input: { id: string; status: string }): Promise<ActionResult<Project>>
  // Mutates: updateProjectStatus(projectId, status)
  // Guard: assertProjectAccess(projectId, "edit")
  // Audit: PROJET_UPDATED event

revalidateLocalContentProject(projectId: string): void
  // Revalidates: /local-content/projects/[projectId]
```

### Supplier CRUD

```typescript
listLocalContentSuppliersAction(projectId: string): Promise<ActionResult<Supplier[]>>
  // Guard: requireProjectAccess(projectId)

createLocalContentSupplierAction(formData: FormData): Promise<ActionResult<Supplier>>
  // Guard: requireProjectAccess(projectId)
  // Validation: validateSupplierLocality, validateOwnershipType

updateLocalContentSupplierAction(formData: FormData): Promise<ActionResult<Supplier>>

deleteLocalContentSupplierAction(supplierId: string): Promise<ActionResult<void>>
  // Guard: chain via projectId
  // Audit: SUPPLIER_DELETED event
```

### Spend Management

```typescript
listLocalContentSpendRecordsAction(projectId: string): Promise<ActionResult<SpendRecord[]>>
  // Guard: requireProjectAccess(projectId)

createLocalContentSpendRecordAction(formData: FormData): Promise<ActionResult<SpendRecord>>
  // Validation: Zod spend schema (amount, date, description)

importLocalContentSpendCsvAction(formData: FormData): Promise<ActionResult<ImportResult>>
  // Batch import with CSV parsing via parseLocalContentCSV()
  // Audit: SPEND_IMPORTED event

classifyLocalContentSpendRecordAction(formData: FormData): Promise<ActionResult<SpendRecord>>
  // AI-assisted classification
  // Audit: SPEND_CLASSIFIED event

deleteLocalContentSpendRecordAction(spendId: string): Promise<ActionResult<void>>
```

### Evidence Management

```typescript
listLocalContentEvidenceAction(projectId: string): Promise<ActionResult<Evidence[]>>
  // Guard: requireProjectAccess(projectId)

createLocalContentEvidenceAction(formData: FormData): Promise<ActionResult<Evidence>>
  // Validation: Zod evidence schema (type, description)

updateLocalContentEvidenceStatusAction(formData: FormData): Promise<ActionResult<Evidence>>
  // Updates review status of evidence item

deleteLocalContentEvidenceAction(evidenceId: string): Promise<ActionResult<void>>

uploadLocalContentEvidenceFileAction(formData: FormData): Promise<ActionResult<Evidence>>
  // File upload via getStorageProvider().store()
  // Audit: EVIDENCE_UPLOADED event
```

### Findings

```typescript
listLocalContentFindingsAction(projectId: string): Promise<ActionResult<Finding[]>>
  // Guard: requireProjectAccess(projectId)

createLocalContentFindingAction(formData: FormData): Promise<ActionResult<Finding>>
  // Validation: validateFindingType, validateFindingSeverity

updateLocalContentFindingAction(formData: FormData): Promise<ActionResult<Finding>>

deleteLocalContentFindingAction(findingId: string): Promise<ActionResult<void>>
```

### Review/Approval

```typescript
submitLocalContentReviewAction(projectId: string, formData: FormData): Promise<ActionResult<Review>>
  // Guard: assertProjectAccess(projectId, "review")
  // Validation: Zod review schema
  // Audit: REVIEW_SUBMITTED event

submitLocalContentApprovalAction(projectId: string, formData: FormData): Promise<ActionResult<Approval>>
  // Guard: assertProjectAccess(projectId, "approve")
  // Validation: Zod approval schema
  // Workflow gate: assertLocalContentGovernanceTransition
  // Audit: APPROVAL_SUBMITTED event

listLocalContentReviewsAction(projectId: string): Promise<ActionResult<Review[]>>
  // Guard: requireProjectAccess(projectId)

listLocalContentApprovalsAction(projectId: string): Promise<ActionResult<Approval[]>>
  // Guard: requireProjectAccess(projectId)

getLocalContentApprovalRoutingAction(projectId: string): Promise<ActionResult<ApprovalRoutingState>>
  // Pure computation: no mutation
  // Guard: requireProjectAccess(projectId)
```

### Scoring & Reports

```typescript
getLocalContentScoreAction(projectId: string): Promise<ActionResult<ScoringResult>>
  // Guard: assertProjectAccess(projectId, "view")
  // Computation: calculateProjectScore() — deterministic weighted formula

listLocalContentReportsAction(projectId: string): Promise<ActionResult<Report[]>>
  // Guard: requireProjectAccess(projectId)

generateLocalContentReportAction(formData: FormData): Promise<ActionResult<Report>>
  // Guard: assertProjectAccess(projectId, "export")
  // Mutates: createReport() with generated content
```

### Analytics & Cross-Product

```typescript
getLocalContentSpendAnalyticsAction(organizationId: string): Promise<ActionResult<SpendAnalytics>>
  // Guard: requireOrganizationAccess(organizationId)

getLocalContentTenderMatchAction(projectId: string): Promise<ActionResult<TenderMatchReport>>
  // Guard: requireProjectAccess(projectId)
  // Cross-product: reads AuditOS engagement signals

getLocalContentTbSignalsAction(projectId: string): Promise<ActionResult<TbSignalResult>>
  // Cross-product: extracts TB (Trial Balance) signals from AuditOS

getLocalContentClassificationRulesAction(organizationId: string): Promise<ActionResult<ClassificationRule[]>>

getLocalContentVerificationChecklistAction(projectId: string): Promise<ActionResult<VerificationChecklist>>
  // Guard: requireProjectAccess(projectId)

updateLocalContentVerificationItemAction(formData: FormData): Promise<ActionResult<VerificationItem>>
  // Guard: requireProjectAccess(projectId)
```

---

## 1.3 Route Handler Map

### GET `/api/local-content/projects/[projectId]/evidence/[evidenceId]/download`

**Source:** `src/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route.ts`

| Aspect | Detail |
|---|---|
| **Auth** | `getCurrentUser()` + `assertProjectAccess(projectId, "view")` |
| **Guard** | `assertEvidenceDownloadAccess()` — validates evidence belongs to project + org |
| **Storage** | `getStorageProvider().retrieve(storageKey)` |
| **Audit** | Logs `evidence.download` event with file metadata |
| **Response** | `buildDownloadResponse()` — Streams file with Content-Disposition headers |
| **Errors** | 401 (unauthenticated), 403 (access denied), 404 (not found), 500 (server error) |

### GET `/api/local-content/projects/[projectId]/reports/[reportId]/download`

**Source:** `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts`

| Aspect | Detail |
|---|---|
| **Auth** | `getCurrentUser()` + `assertProjectAccess(projectId, "view")` |
| **Generation** | Dynamic — PDF (assessment summary) or XLSX (spend classification, evidence index) |
| **Audit** | Logs `report.download` event |
| **Response** | Built file streamed with Content-Disposition attachment header |
| **Errors** | 401, 403, 404, 500 |

### Report Type Routing

| `reportType` | Builder Function | Format |
|---|---|---|
| `"spend_classification"` | `buildSpendClassificationXLSX()` | XLSX |
| `"evidence_index"` | `buildEvidenceIndexXLSX()` | XLSX |
| `"assessment_summary"` (default) | `buildAssessmentSummaryPDF()` | PDF |

---

# 2. Guard Layer Contract

## 2.1 Guard Architecture

All API calls pass through a multi-layer guard chain:

```
Request
  │
  ├─ Layer 1: Authentication ── requireUserContext() / getCurrentUser()
  │     • Verifies session exists
  │     • Returns CurrentUser (id, organizationId, role)
  │
  ├─ Layer 2: Tenant Isolation ── requireProjectAccess(projectId)
  │     • Verifies entity belongs to current user's organization
  │     • Pattern: entity → parent → ... → organizationId
  │
  ├─ Layer 3: Permission ── assertProjectAccess(projectId, action) / enforce()
  │     • Verifies user role permits the action
  │     • Roles hierarchy: ADMIN > OPERATOR > VIEWER
  │
  └─ Layer 4: Workflow Gate ── assertLocalContentGovernanceTransition()
        • Validates status transitions against 11-state machine
        • Only applies to mutation actions
```

## 2.2 Guard Functions

| Function | Source | Purpose | Entity Checked |
|---|---|---|---|
| `requireUserContext()` | `@/lib/auth` | Auth + organization context | Current user session |
| `requireOrganizationAccess(orgId)` | `localcontent-guards.ts` | Verify org matches user's org | Organization |
| `requireProjectAccess(projectId)` | `localcontent-guards.ts` | Verify project belongs to user's org | `LocalContentProject` |
| `requireWorkbookAccess(workbookId)` | `localcontent-guards.ts` | Chain: LcWorkbook → project → org | `LcWorkbook` |
| `requireWorkbookLineAccess(lineId)` | `localcontent-guards.ts` | Chain: LcWorkbookLine → workbook → project → org | `LcWorkbookLine` |
| `requireDataRequestAccess(requestId)` | `localcontent-guards.ts` | Chain: LcDataRequest → workbook → project → org | `LcDataRequest` |
| `requirePatternSuggestionAccess(id)` | `localcontent-guards.ts` | Direct organizationId on model | `LcPatternSuggestion` |
| `requireMatchReviewAccess(id)` | `localcontent-guards.ts` | Direct organizationId on model | `LcMatchReview` |
| `assertProjectAccess(pid, action)` | `guards.ts` | Auth + tenant + role + action permissions | Combined |
| `enforce(user, resource, permission)` | `@/lib/authorization` | Platform-level role-based enforcement | Generic resource |

## 2.3 Guard Chains by Entity

| Entity | Chain (shortest path to organizationId) | Guard Function |
|---|---|---|
| `LocalContentProject` | Direct: `project.organizationId` | `requireProjectAccess(id)` |
| `LocalContentSupplier` | `supplier.projectId → project.organizationId` | `requireProjectAccess(supplier.projectId)` |
| `LocalContentSpendRecord` | `spend.projectId → project.organizationId` | `requireProjectAccess(spend.projectId)` |
| `LocalContentEvidence` | `evidence.projectId → project.organizationId` | `assertEvidenceDownloadAccess()` |
| `LcWorkbook` | `workbook.project.organizationId` | `requireWorkbookAccess(id)` |
| `LcWorkbookLine` | `line.workbook.project.organizationId` | `requireWorkbookLineAccess(id)` |
| `LcPatternSuggestion` | Direct: `suggestion.organizationId` | `requirePatternSuggestionAccess(id)` |
| `LcMatchReview` | Direct: `review.organizationId` | `requireMatchReviewAccess(id)` |

---

# 3. Input Validation Schema Map

All write operations use Zod schemas for input validation.

| Schema | Source | Validated On |
|---|---|---|
| `createEvidenceSchema` | `schemas/evidence.ts` | `createLocalContentEvidenceAction()` |
| `updateEvidenceStatusSchema` | `schemas/evidence.ts` | `updateLocalContentEvidenceStatusAction()` |
| `uploadEvidenceFileSchema` | `schemas/evidence.ts` | `uploadLocalContentEvidenceFileAction()` |
| `createFindingSchema` | `schemas/finding.ts` | `createLocalContentFindingAction()` |
| `updateFindingSchema` | `schemas/finding.ts` | `updateLocalContentFindingAction()` |
| `submitReviewSchema` | `schemas/review.ts` | `submitLocalContentReviewAction()` |
| `submitApprovalSchema` | `schemas/review.ts` | `submitLocalContentApprovalAction()` |
| `createSpendRecordSchema` | `schemas/spend.ts` | `createLocalContentSpendRecordAction()` |
| `classifySpendRecordSchema` | `schemas/spend.ts` | `classifyLocalContentSpendRecordAction()` |

---

# 4. Error Response Contract

## 4.1 Server Action Error Shape

```typescript
// Success
{ ok: true; data: T }

// Failure
{ ok: false; error: string; code?: string }
```

**Error codes used:**
- `"VALIDATION_ERROR"` — Zod schema validation failed
- `"FORBIDDEN"` — Access denied or role insufficient
- `"NOT_FOUND"` — Entity not found
- `"GOVERNANCE_ERROR"` — Invalid status transition
- `"INTERNAL_ERROR"` — Unexpected server error

## 4.2 Route Handler Error Shape

```typescript
{ error: string; status: number }
```

| HTTP Status | Meaning | Typical Cause |
|---|---|---|
| 401 | Authentication required | No valid session |
| 403 | Access denied | Cross-tenant access or insufficient role |
| 404 | Not found | Entity does not exist |
| 500 | Internal server error | Unexpected failure |

---

# 5. Revalidation Contracts

Server Actions that mutate data call `revalidatePath()` to refresh Next.js cache.

| Action | Revalidation Path |
|---|---|
| `createLocalContentProjectAction` | `/local-content/projects` |
| `updateLocalContentProjectAction` | `/local-content/projects/[id]` |
| `revalidateLocalContentProject(projectId)` | `/local-content/projects/[projectId]` |
| All Supplier/Spend/Evidence/Findings mutations | Via `revalidateLocalContentProject()` |
| Review/Approval mutations | Via `revalidateLocalContentProject()` |

---

# Traceability

| SPEC Element | PRD Reference | Code Evidence | Evidence Classification |
|---|---|---|---|
| Server Action Map (§1.2) | §5 (User Journeys) | `src/actions/localcontent-actions.ts` (38 fns) | Executable |
| Route Handler Map (§1.3) | §5 (J-03, J-04) | 2 route.ts files | Executable |
| Guard Layer (§2) | §7 (DR-04, DR-05) | `localcontent-guards.ts`, `guards.ts` | Executable |
| Validation Schemas (§3) | §7 (DR-01) | `schemas/evidence.ts`, etc. | Executable |
| Error Contracts (§4) | §7 (DR-03) | `ActionResult<T>` pattern, route handlers | Executable |
| Revalidation Contracts (§5) | §2 (File Organization) | `revalidatePath()` calls in actions | Executable |
| Constitution Principle: Tenant Isolation | §4 | All guard functions check organizationId | Governance |

---

## Alignment Delta

Because this is a **Brownfield Alignment** (LIA-001) and not a Greenfield or Cross-Product design:

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ 38 Server Actions in `src/actions/localcontent-actions.ts`, 2 Route Handlers, 7 guard functions |
| **Documented** | ✅ This specification retroactively describes the existing API surface |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** API Specification — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LC-PRD-01_Project_Management.md` v0.1
- **Program:** LIA-001 (LC-EPIC-01)
- **Status:** **Frozen** (LC-EPIC-01 complete)
- **Next:** LC-SPEC-01c (Workflow Specification) — *already frozen*
