# LC-PRD-04: Findings & Review

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** PRD — retroactive alignment for Findings & Review subsystem
> **Epic:** LC-EPIC-04

---

## 1. Overview

Findings & Review manages actionable findings (gaps, risks, opportunities) identified during local content analysis, and provides a review workflow with reviewer assignment, comments, and status tracking. Every finding and review has an audit trail. The review workflow feeds into the approval gate (LC-EPIC-05).

**In scope:** Finding CRUD, status workflow, review submission, reviewer assignment, finding-to-evidence linking.

---

## 2. File Organization

| Layer | Files | Purpose |
|---|---|---|
| Domain Services | `services.ts` — `listFindings`, `createFinding`, `deleteFinding` | CRUD operations |
| Schemas | `schemas/finding/` | Zod: `createFindingSchema`, `updateFindingSchema` |
| Schemas | `schemas/review/` | Zod: `submitReviewSchema`, `submitApprovalSchema` |
| Actions | `localcontent-actions.ts` | Actions: list/create/update/delete finding, submit review/approval |
| Audit | `audit-events.ts` | Events: FINDING_CREATED, FINDING_DELETED, REVIEW_SUBMITTED |
| UX | `components/local-content/finding-form.tsx` | Finding form component |

---

## 3. Functional Requirements

### FR-01: Finding Management
| ID | Requirement | Implementation |
|---|---|---|
| FR-01.1 | Create finding with title, description, type, severity | `createFinding()` |
| FR-01.2 | Update finding status (draft→submitted→reviewed→resolved/dismissed) | `updateLocalContentFindingAction()` |
| FR-01.3 | Link finding to supplier and/or spend record | `linkedSupplierId`, `linkedSpendRecordId` |
| FR-01.4 | List findings descending by creation date | `listFindings(projectId)` |
| FR-01.5 | Delete finding with audit trail | `deleteFinding()` |

### FR-02: Review Workflow
| ID | Requirement | Implementation |
|---|---|---|
| FR-02.1 | Submit review with action (approved/returned/submit/needs_work) | `submitLocalContentReviewAction()` |
| FR-02.2 | Track review status (in_review / completed / returned) | `listReviews()` |
| FR-02.3 | Validate review submission against existing reviews | `validateReviewSubmission()` |
| FR-02.4 | Prevent duplicate reviews from same reviewer | Validation logic |
| FR-02.5 | Compute approval routing state from reviews + approvals | `getProjectApprovalRoutingState()` |

---

## 4. Finding Status Machine

```
draft ──► submitted ──► reviewed ──► resolved
                         │
                         └──► dismissed
```

## 5. Review Actions

| Action | Meaning | Result Status |
|---|---|---|
| `approved` | Reviewer approves with conditions | `in_review` |
| `returned` | Reviewer rejects | `returned` |
| `submitted` | Submit for next stage | `completed` |
| `needs_work` | Needs changes | `in_review` |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Finding CRUD, review submission, approval routing in existing codebase |
| **Documented** | ✅ This PRD retroactively describes the existing implementation |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-04a (Domain Spec)
