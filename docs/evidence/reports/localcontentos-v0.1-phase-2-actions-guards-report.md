# LocalContentOS v0.1 Phase 2 — Actions & Guards Report

## 1. Executive Summary

Phase 2 is complete. The governed server-action layer is implemented with project access guards, role-based permission checks, full platform audit dual-write, a bilingual CSV import parser, and safe error handling. No UI routes were created — this is the actions/guards/import foundation only.

## 2. Actions Implemented

| Action                                   | Purpose                             | Guard               | Audit             |
| ---------------------------------------- | ----------------------------------- | ------------------- | ----------------- |
| `listLocalContentProjectsAction`         | List projects for authenticated org | Org scoping         | No                |
| `getLocalContentProjectAction`           | Get project by ID                   | Project view access | No                |
| `createLocalContentProjectAction`        | Create new project                  | Admin only          | Domain + Platform |
| `updateLocalContentProjectAction`        | Update project status               | Admin only          | Domain + Platform |
| `listLocalContentSuppliersAction`        | List suppliers per project          | Project view access | No                |
| `createLocalContentSupplierAction`       | Create supplier                     | Operator+           | Domain + Platform |
| `updateLocalContentSupplierAction`       | Update supplier                     | Operator+           | Domain + Platform |
| `listLocalContentSpendRecordsAction`     | List spend records                  | Project view access | No                |
| `createLocalContentSpendRecordAction`    | Create spend record                 | Operator+           | Domain + Platform |
| `updateLocalContentSpendRecordAction`    | Update spend record                 | Operator+           | Domain + Platform |
| `importLocalContentSpendCsvAction`       | Bulk CSV import                     | Operator+           | Domain + Platform |
| `classifyLocalContentSpendRecordAction`  | Classify spend/supplier             | Operator+           | Domain + Platform |
| `listLocalContentEvidenceAction`         | List evidence                       | Project view access | No                |
| `createLocalContentEvidenceAction`       | Create evidence metadata            | Operator+           | Domain + Platform |
| `updateLocalContentEvidenceStatusAction` | Update evidence review status       | Operator+           | Domain + Platform |
| `listLocalContentFindingsAction`         | List findings                       | Project view access | No                |
| `createLocalContentFindingAction`        | Create finding                      | Operator+           | Domain + Platform |
| `submitLocalContentReviewAction`         | Submit review                       | Operator+           | Domain + Platform |
| `submitLocalContentApprovalAction`       | Submit approval                     | Admin only          | Domain + Platform |
| `getLocalContentScoreAction`             | Calculate scores                    | Project view access | No                |
| `listLocalContentAuditEventsAction`      | List audit events                   | Operator+           | No                |

## 3. Guard Model

Created `src/lib/local-content/guards.ts`:

- `assertProjectAccess(projectId, action)` — verifies user is authenticated, has sufficient role for the action, and the project belongs to the user's organization
- `canPerformAction(user, action)` — stateless permission check against `UserRole` (ADMIN/OPERATOR/VIEWER)
- `resolveProjectContext(projectId)` — resolves platform context fields for audit dual-write
- `ProjectAccessError` — structured error with code (FORBIDDEN, NOT_FOUND)

## 4. Permission Matrix

| Action Type                                          | Viewer | Operator | Admin |
| ---------------------------------------------------- | ------ | -------- | ----- |
| Read project/suppliers/spend/evidence/findings/score | Yes    | Yes      | Yes   |
| Create/update supplier, spend, evidence              | No     | Yes      | Yes   |
| Classify spend/supplier                              | No     | Yes      | Yes   |
| Manage findings                                      | No     | Yes      | Yes   |
| Submit review                                        | No     | Yes      | Yes   |
| Review evidence                                      | No     | Yes      | Yes   |
| Approve                                              | No     | No       | Yes   |
| Admin (create project, change status)                | No     | No       | Yes   |
| View audit events                                    | No     | Yes      | Yes   |

Note: the permission model currently maps to the existing AQLIYA `UserRole` enum (ADMIN/OPERATOR/VIEWER) since LocalContentOS does not yet have its own role model. OPERATOR is used for both preparer and reviewer actions. A separate membership model can be added later for finer-grained role assignment.

## 5. CSV Import

Created `src/lib/local-content/import.ts`:

- `parseLocalContentCSV(csvText)` — parses CSV text with bilingual header support
- Required columns: amount, supplierName, category, period
- Optional columns: contractReference, currency, description, supplierRegistrationNumber
- Arabic headers supported: المبلغ, اسم المورد, تصنيف الإنفاق, الفترة, etc.
- Returns `ImportResult` with valid rows, rejected rows, and summary counts
- Rejects rows with: invalid amounts, missing required fields, empty data
- Row-level error reporting preserves row numbers
- Supplier auto-creation during import: if supplier name doesn't match an existing supplier in the project, creates a new unclassified supplier record

## 6. Platform Audit Dual-Write

All mutation actions write to both `LocalContentAuditEvent` (domain audit) and `PlatformAuditLog` (platform audit):

- Product key: `"localcontent"`
- Context resolved from project's `platformOrganizationId`, `clientWorkspaceId`, `projectId`
- Safe mode: platform audit failure never blocks the primary action
- Actor fields: id, name, email from authenticated session
- Target metadata includes entity type and descriptive fields

## 7. Tests Added

| File                                             | Scope             | Tests                                                                    |
| ------------------------------------------------ | ----------------- | ------------------------------------------------------------------------ |
| `src/lib/local-content/__tests__/guards.test.ts` | Permission matrix | 3 tests (viewer, operator, admin)                                        |
| `src/lib/local-content/__tests__/import.test.ts` | CSV parser        | 9 tests (rejection, English, Arabic, validation, quoted values, summary) |

## 8. Files Changed

**Created:**

- `src/lib/local-content/guards.ts` — project access guards and permission checks
- `src/lib/local-content/import.ts` — bilingual CSV import parser
- `src/actions/localcontent-actions.ts` — 21 server actions with auth/guard/audit
- `src/lib/local-content/__tests__/guards.test.ts` — permission matrix tests
- `src/lib/local-content/__tests__/import.test.ts` — CSV parser tests
- `docs/reports/localcontentos-v0.1-phase-2-actions-guards-report.md` — this report

## 9. Validation Results

| Command                   | Result                       |
| ------------------------- | ---------------------------- |
| `npx tsc --noEmit`        | Pass                         |
| `npm run lint`            | Pass (pre-existing warnings) |
| `npm run build`           | Pass                         |
| `npm test -- --runInBand` | Pass (22 suites, 206 tests)  |

## 10. Remaining Gaps

- No UI routes — Phase 3 scope
- Permission model uses existing AQLIYA UserRole (ADMIN/OPERATOR/VIEWER); no LocalContentOS-specific membership model
- Reviewer self-review prevention not enforced at guard level (service-level only)
- No file upload handling — evidence entries are metadata-only
- No PDF/XLSX export — Phase 5 scope
- `revalidatePath` calls are ready but only effective once routes exist

## 11. Next Recommended Step

**LocalContentOS Phase 3 — Workspace Routes.** Create the `/local-content` dashboard and project workflow pages, using this actions layer for all data access. Start with the dashboard (`/local-content/page.tsx`), project detail (`/local-content/projects/[projectId]/page.tsx`), and supplier/spend list pages.
