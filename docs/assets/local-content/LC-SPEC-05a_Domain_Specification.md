# LC-SPEC-05a: Domain Specification — Approval & Export

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Domain Specification — retroactive alignment
> **Parent:** `LC-PRD-05_Approval_Export.md` v0.1
> **Template:** LC-SPEC-01a (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-PRD-05 |
| **Evidence Classification** | Executive Evidence |

---

## 1. Domain Model

### 1.1 Entities

#### LocalContentApproval
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (UUID) | ✅ | Primary key |
| projectId | String | ✅ | FK → LocalContentProject |
| approverId | String | ✅ | FK → User |
| approverName | String | ✅ | Denormalized display name |
| decision | String | ✅ | "approved", "rejected", "conditional" |
| comments | String? | | Free text |
| approvalSnapshot | JSON? | | Project state snapshot |
| createdAt | DateTime | ✅ | Auto |

#### LocalContentReport
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (UUID) | ✅ | Primary key |
| projectId | String | ✅ | FK → LocalContentProject |
| reportType | String | ✅ | "full", "summary", "supplier", "spend" |
| format | String | ✅ | "pdf", "xlsx", "csv" |
| generatedById | String? | | FK → User |
| generatedByName | String? | | Denormalized |
| disclaimer | String? | | Bilingual disclaimer |
| metadata | JSON? | | Scoring snapshot |
| createdAt | DateTime | ✅ | Auto |

### 1.2 Value Objects

| Value Object | Values |
|---|---|
| ApprovalDecision | "approved", "rejected", "conditional" |
| ReportType | "full", "summary", "supplier", "spend" |
| ReportFormat | "pdf", "xlsx", "csv" |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Approval + Report models in Prisma, services |
| **Documented** | ✅ This spec retroactively describes existing domain |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-05b
