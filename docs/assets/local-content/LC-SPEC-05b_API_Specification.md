# LC-SPEC-05b: API Specification — Approval & Export

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** API Specification — retroactive alignment
> **Parent:** `LC-PRD-05_Approval_Export.md` v0.1
> **Depends On:** LC-SPEC-05a | **Template:** LC-SPEC-01b (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-05a |
| **Consumer** | Frontend, QA |
| **Evidence Classification** | Executable Evidence |

---

## 1. Server Actions

| Action | Signature | Returns | Permission | Audit Event |
|---|---|---|---|---|
| `submitLocalContentApprovalAction` | `(projectId, formData) ⇒ ActionResult<Approval>` | Created approval | `approve` | `localcontent.approval.submitted` |
| `listLocalContentApprovalsAction` | `(projectId) ⇒ ActionResult<Approval[]>` | Approvals list | `view` | — |
| `getLocalContentApprovalRoutingAction` | `(projectId) ⇒ ActionResult<ApprovalRoutingState>` | Routing state | `view` | — |
| `generateLocalContentReportAction` | `(projectId, reportType, format) ⇒ ActionResult<Report>` | Created report | `create_spend` | `localcontent.report.generated` |
| `listLocalContentReportsAction` | `(projectId) ⇒ ActionResult<Report[]>` | Reports list | `view` | — |

---

## 2. Schemas

### submitApprovalSchema
| Field | Type | Required |
|---|---|---|
| `decision` | string (enum) | ✅ |
| `comments` | string | |
| `approverId` | string | ✅ |
| `approverName` | string | ✅ |

### generateReportSchema
| Field | Type | Required |
|---|---|---|
| `reportType` | string | ✅ |
| `format` | string | ✅ |

---

## 3. Error Handling

| Error | Code | HTTP Equivalent |
|---|---|---|
| Prerequisite reviews missing | — | 409 |
| Validation error | VALIDATION_ERROR | 400 |
| Not found | NOT_FOUND | 404 |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ All approval + report actions in localcontent-actions.ts |
| **Documented** | ✅ This spec retroactively describes existing API surface |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-05c
