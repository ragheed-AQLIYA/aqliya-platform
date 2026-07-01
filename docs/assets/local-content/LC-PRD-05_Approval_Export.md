# LC-PRD-05: Approval & Export

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** PRD — retroactive alignment for Approval & Export subsystem
> **Epic:** LC-EPIC-05

---

## 1. Overview

Approval & Export manages the final approval gate for local content projects (requiring prerequisite reviews) and generates structured reports with scoring data, disclaimers, and audit trail. Reports can be generated in supported formats.

**In scope:** Approval submission with prerequisite validation, report generation with scoring snapshot, report listing, approval routing state computation.

---

## 2. File Organization

| Layer | Files | Purpose |
|---|---|---|
| Domain Services | `services.ts` — `listApprovals`, `createApproval`, `listReports`, `createReport`, `calculateProjectScore` | CRUD + scoring |
| Schemas | `schemas/review/` | Zod: `submitApprovalSchema` |
| Schemas | `schemas/report/` | Zod: `generateReportSchema` |
| Actions | `localcontent-actions.ts` | Actions: submit/list approvals, generate/list reports |
| Validation | `review-validation.ts` | `validateApprovalSubmission()` |

---

## 3. Functional Requirements

### FR-01: Approval Gate
| ID | Requirement | Implementation |
|---|---|---|
| FR-01.1 | Submit approval decision (approved/rejected/conditional) | `createApproval()` |
| FR-01.2 | Validate prerequisite reviews exist before approval | `validateApprovalSubmission()` |
| FR-01.3 | Store approval snapshot of project state | `approvalSnapshot` JSON field |
| FR-01.4 | List approvals for a project | `listApprovals(projectId)` |
| FR-01.5 | Compute approval routing state (reviews + approvals) | `getProjectApprovalRoutingState()` |

### FR-02: Report Export
| ID | Requirement | Implementation |
|---|---|---|
| FR-02.1 | Generate report with scoring data | `generateLocalContentReportAction()` |
| FR-02.2 | Include bilingual disclaimer in every report | `disclaimer` field (Arabic + English) |
| FR-02.3 | Report includes metadata: localContent%, totalSpend, supplierCount, evidenceCoverage, findingCount | `metadata` JSON field |
| FR-02.4 | List generated reports | `listReports(projectId)` |
| FR-02.5 | Audit event on every report generation | `localcontent.report.generated` |

---

## 4. Domain Rules

| ID | Rule | Enforcement |
|---|---|---|
| DR-01 | Approval requires at least one completed review | `validateApprovalSubmission()` |
| DR-02 | Approval snapshot captures current project state at time of approval | `approvalSnapshot` |
| DR-03 | Report disclaimer cannot be removed | Hardcoded in `generateLocalContentReportAction()` |
| DR-04 | Report generation triggers full scoring | `calculateProjectScore()` before `createReport()` |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Approval CRUD, report generation, scoring, validation in existing codebase |
| **Documented** | ✅ This PRD retroactively describes existing implementation |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-05a–05e
