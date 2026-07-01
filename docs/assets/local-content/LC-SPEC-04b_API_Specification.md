# LC-SPEC-04b: API Specification — Findings & Review

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** API Specification — retroactive alignment
> **Parent:** `LC-PRD-04_Findings_Review.md` v0.1
> **Depends On:** LC-SPEC-04a | **Template:** LC-SPEC-01b (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-04a |
| **Consumer** | Frontend, QA |
| **Evidence Classification** | Executable Evidence |

---

## 1. Server Actions

### 1.1 Finding Actions

| Action | Signature | Returns | Permission | Audit Event |
|---|---|---|---|---|
| `listLocalContentFindingsAction` | `(projectId) ⇒ ActionResult<Finding[]>` | Findings list (desc) | `view` | — |
| `createLocalContentFindingAction` | `(projectId, formData) ⇒ ActionResult<Finding>` | Created finding | `create_finding` | `localcontent.finding.created` |
| `updateLocalContentFindingAction` | `(projectId, findingId, formData) ⇒ ActionResult<Finding>` | Updated finding | `update_finding` | `localcontent.finding.updated` |
| `deleteLocalContentFindingAction` | `(projectId, findingId) ⇒ ActionResult<void>` | — | `create_finding` | `localcontent.finding.deleted` |

### 1.2 Review Actions

| Action | Signature | Returns | Permission | Audit Event |
|---|---|---|---|---|
| `submitLocalContentReviewAction` | `(projectId, formData) ⇒ ActionResult<Review>` | Created review | `review` | `localcontent.review.submitted` |
| `listLocalContentReviewsAction` | `(projectId) ⇒ ActionResult<Review[]>` | Reviews list | `view` | — |
| `getLocalContentApprovalRoutingAction` | `(projectId) ⇒ ActionResult<ApprovalRoutingState>` | Routing state | `view` | — |

### 1.3 Approval Actions

| Action | Signature | Returns | Permission | Audit Event |
|---|---|---|---|---|
| `submitLocalContentApprovalAction` | `(projectId, formData) ⇒ ActionResult<Approval>` | Created approval | `approve` | `localcontent.approval.submitted` |
| `listLocalContentApprovalsAction` | `(projectId) ⇒ ActionResult<Approval[]>` | Approvals list | `view` | — |

---

## 2. Request/Response Contracts

### createFindingSchema — FormData

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | ✅ | Finding type enum |
| `severity` | string | | Default: "medium" |
| `title` | string | ✅ | Short description |
| `description` | string | ✅ | Detailed description |
| `linkedSupplierId` | string | | FK to supplier |
| `linkedSpendRecordId` | string | | FK to spend record |

### updateFindingSchema — FormData

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | string | ✅ | New status |
| `title` | string | | Updated title |
| `description` | string | | Updated description |
| `severity` | string | | Updated severity |

### submitReviewSchema — FormData

| Field | Type | Required | Description |
|---|---|---|---|
| `action` | string | ✅ | Review action |
| `comments` | string | | Free text |
| `reviewerId` | string | ✅ | FK to user |
| `reviewerName` | string | ✅ | Display name |

### submitApprovalSchema — FormData

| Field | Type | Required | Description |
|---|---|---|---|
| `decision` | string | ✅ | "approved", "rejected", "conditional" |
| `comments` | string | | Free text |
| `approverId` | string | ✅ | FK to user |
| `approverName` | string | ✅ | Display name |

---

## 3. Error Handling

| Error | Code | HTTP Equivalent |
|---|---|---|
| Validation error | VALIDATION_ERROR | 400 |
| Not found | NOT_FOUND | 404 |
| Duplicate review | — | 409 (via validateReviewSubmission) |
| Missing prerequisite reviews | — | 409 (via validateApprovalSubmission) |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ All actions + schemas in existing codebase |
| **Documented** | ✅ This spec retroactively describes existing API surface |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-04c (Workflow Specification)
