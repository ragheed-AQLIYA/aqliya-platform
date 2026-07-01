# LC-SPEC-04c: Workflow Specification — Findings & Review

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Workflow Specification — retroactive alignment
> **Parent:** `LC-PRD-04_Findings_Review.md` v0.1
> **Depends On:** LC-SPEC-04a, LC-SPEC-04b | **Template:** LC-SPEC-01c (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-04a, LC-SPEC-04b |
| **Evidence Classification** | Governance Evidence |

---

## 1. Finding Lifecycle

```
                ┌─────────┐
                │  DRAFT  │ (initial state)
                └────┬────┘
                     │
                ┌────▼──────┐
                │ SUBMITTED │ (ready for review)
                └────┬──────┘
                     │
                ┌────▼──────┐
                │ REVIEWED  │ (reviewer has examined)
                └────┬──────┘
                     │
               ┌─────┴──────────┐
               ▼                 ▼
         ┌──────────┐     ┌───────────┐
         │ RESOLVED │     │ DISMISSED │ (terminal states)
         └──────────┘     └───────────┘
```

### Transitions

| Transition | Trigger | Permission |
|---|---|---|
| → DRAFT | createLocalContentFindingAction | `create_finding` |
| → SUBMITTED | updateFindingAction(status) | `update_finding` |
| → REVIEWED | updateFindingAction(status) | `update_finding` |
| → RESOLVED | updateFindingAction(status) | `update_finding` |
| → DISMISSED | updateFindingAction(status) | `update_finding` |

---

## 2. Review Submission Flow

```
1. User navigates to review section of project
2. User selects review action + enters optional comments
3. On submission:
   a. Server validates input schema
   b. Server fetches existing reviews for project
   c. Server validates against duplicate reviewer rule
   d. Server determines review status:
      - action "returned" → status "returned"
      - action "submitted" → status "completed"
      - any other → status "in_review"
   e. Review record created with audit event
4. Approval routing state recomputed via computeApprovalRoutingState()
```

## 3. Approval Prerequisites

```
For approval to proceed:
1. Project must have at least one "completed" review
2. All required reviewers must have submitted reviews
3. No "returned" reviews without resolution
4. Violations → rejection with specific error message
```

---

## 4. Audit Events

| Event | Entity | When |
|---|---|---|
| `localcontent.finding.created` | LocalContentFinding | After create |
| `localcontent.finding.updated` | LocalContentFinding | After update |
| `localcontent.finding.deleted` | LocalContentFinding | After delete |
| `localcontent.review.submitted` | LocalContentReview | After review creation |
| `localcontent.approval.submitted` | LocalContentApproval | After approval creation |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Finding lifecycle, review validation, approval routing in existing codebase |
| **Documented** | ✅ This spec retroactively describes existing workflows |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-SPEC-04d (UX Specification)
