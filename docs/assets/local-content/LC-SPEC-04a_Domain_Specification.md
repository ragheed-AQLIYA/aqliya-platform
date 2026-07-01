# LC-SPEC-04a: Domain Specification — Findings & Review

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Domain Specification — retroactive alignment
> **Parent:** `LC-PRD-04_Findings_Review.md` v0.1
> **Depends On:** — | **Template:** LC-SPEC-01a (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-PRD-04 |
| **Consumer** | Implementation, Data Team |
| **Evidence Classification** | Executive Evidence |

---

## 1. Domain Model

### 1.1 Entities

#### LocalContentFinding
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (UUID) | ✅ | Primary key |
| projectId | String | ✅ | FK → LocalContentProject |
| type | String | ✅ | "gap", "risk", "opportunity", "evidence_gap" |
| severity | String | ✅ | "low", "medium", "high", "critical" |
| title | String | ✅ | Short description |
| description | String | ✅ | Detailed description |
| status | String | ✅ | "draft", "submitted", "reviewed", "resolved", "dismissed" |
| linkedSupplierId | String? | | FK → LocalContentSupplier |
| linkedSpendRecordId | String? | | FK → LocalContentSpendRecord |
| createdById | String? | | FK → User |
| createdByName | String? | | User name denormalized |
| createdAt | DateTime | ✅ | Auto |
| updatedAt | DateTime | ✅ | Auto |

#### LocalContentReview
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (UUID) | ✅ | Primary key |
| projectId | String | ✅ | FK → LocalContentProject |
| reviewerId | String | ✅ | FK → User |
| reviewerName | String | ✅ | Denormalized for display |
| action | String | ✅ | "approved", "returned", "submitted", "needs_work" |
| comments | String? | | Free text |
| status | String | ✅ | "in_review", "completed", "returned" |
| createdAt | DateTime | ✅ | Auto |

### 1.2 Value Objects

| Value Object | Values | Source |
|---|---|---|
| FindingType | "gap", "risk", "opportunity", "evidence_gap" | Common types |
| FindingSeverity | "low", "medium", "high", "critical" | Common types |
| FindingStatus | "draft", "submitted", "reviewed", "resolved", "dismissed" | `VALID_FINDING_STATUSES` |
| ReviewAction | "approved", "returned", "submitted", "needs_work" | Review logic |
| ReviewStatus | "in_review", "completed", "returned" | Review logic |

### 1.3 Relationships

```
LocalContentProject ──┐
                     ├── LocalContentFinding (0..n)
                     │      linkedSupplierId? → LocalContentSupplier
                     │      linkedSpendRecordId? → LocalContentSpendRecord
                     │
                     ├── LocalContentReview (0..n)
                     ├── LocalContentApproval (0..n)
```

---

## 2. Domain Rules

| Rule | Enforcement |
|---|---|
| Finding belongs to exactly one project | FK on `projectId` |
| Finding status transitions: draft→submitted→reviewed→resolved|dismissed | `validateFindingStatus()` |
| Finding must have a type and severity | Zod required fields |
| Review action must be from valid set | Zod enum |
| Same reviewer cannot submit duplicate review | `validateReviewSubmission()` |
| Approval requires completed review(s) first | `validateApprovalSubmission()` |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Finding + Review + Approval models in Prisma, services in services.ts |
| **Documented** | ✅ This spec retroactively describes existing domain |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-04b (API Specification)
