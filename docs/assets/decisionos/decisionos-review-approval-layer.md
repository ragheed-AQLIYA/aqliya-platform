# DecisionOS Review & Approval Layer

## Overview

Creates a governed approval lifecycle for DecisionOS so recommendations become approved decisions, not just generated outputs. Links the recommendation engine to a formal review process with role-based actions and full audit trail.

## Architecture

```
src/
├── actions/
│   └── approval.ts                    # Approval lifecycle actions
├── app/(dashboard)/decisions/[id]/
│   └── governance/page.tsx            # Governance & approval UX
└── prisma/
    └── schema.prisma                  # Added AuditAction entries
```

## Approval Lifecycle

### Statuses (using existing DecisionStatus enum)
| Status | Meaning | Who Can Transition |
|--------|---------|-------------------|
| DRAFT | Decision being prepared | OPERATOR (owner) |
| IN_REVIEW | Submitted for approval | OPERATOR → ADMIN |
| APPROVED | Approved by ADMIN | ADMIN |
| REJECTED | Rejected by ADMIN | ADMIN |
| ARCHIVED | Archived (manual) | ADMIN |

### Audit Actions (new entries in AuditAction enum)
| Action | Triggered By | Meaning |
|--------|-------------|---------|
| SUBMITTED_FOR_REVIEW | OPERATOR | Decision moved from DRAFT to IN_REVIEW |
| DECISION_APPROVED | ADMIN | Unconditional approval |
| DECISION_APPROVED_WITH_CONDITIONS | ADMIN | Approval with required conditions |
| DECISION_REJECTED | ADMIN | Decision rejected |
| REVISION_REQUESTED | ADMIN | Decision returned to DRAFT for revision |

## Server Actions (`src/actions/approval.ts`)

### `submitForReview(decisionId)`
- **Role**: OPERATOR
- **From**: DRAFT → IN_REVIEW
- **Creates**: AuditLog (SUBMITTED_FOR_REVIEW)
- **Validation**: Only allowed in DRAFT status

### `approveDecision(decisionId, notes?)`
- **Role**: ADMIN
- **From**: IN_REVIEW → APPROVED
- **Creates**: Approval record (APPROVED), AuditLog (DECISION_APPROVED)
- **Notes**: Optional

### `approveWithConditions(decisionId, conditions)`
- **Role**: ADMIN
- **From**: IN_REVIEW → APPROVED
- **Creates**: Approval record (APPROVED with conditions comment), AuditLog (DECISION_APPROVED_WITH_CONDITIONS)
- **Conditions**: Required — must be non-empty

### `rejectDecision(decisionId, reason)`
- **Role**: ADMIN
- **From**: IN_REVIEW → REJECTED
- **Creates**: Approval record (REJECTED), AuditLog (DECISION_REJECTED)
- **Reason**: Required — must be non-empty

### `requestRevision(decisionId, reason)`
- **Role**: ADMIN
- **From**: IN_REVIEW → DRAFT
- **Creates**: AuditLog (REVISION_REQUESTED)
- **Reason**: Required — must be non-empty
- **Note**: Does NOT create Approval record (decision returns to draft for rework)

### `getApprovalStatus(decisionId)`
- **Role**: VIEWER+
- **Returns**: Current status, approval history, review actions, recommendation summary

## Role Behavior

| Role | Submit for Review | Approve | Reject | Request Revision | View |
|------|------------------|---------|--------|-----------------|------|
| ADMIN | No | Yes | Yes | Yes | Yes |
| OPERATOR | Yes (DRAFT only) | No | No | No | Yes |
| VIEWER | No | No | No | No | Yes |

## Recommendation → Approval Link

- Recommendation should be generated before approval (warning shown if missing)
- Approval page shows recommendation summary (action + rationale)
- Approval does NOT require recommendation (ADMIN can override)
- Publish/unpublish remains separate from approval
- Approved decisions can still be published to clients

## Governance UX (`/decisions/[id]/governance`)

### Sections
1. **Status Badge** — Current decision status with color-coded variant
2. **Decision Roles** — Owner, Reviewer, Approver cards with names and roles
3. **Recommendation Summary** — Shows current recommendation action and rationale (if exists)
4. **Approval Actions** — Role-based action buttons:
   - OPERATOR in DRAFT: "Submit for Review"
   - ADMIN in IN_REVIEW: "Approve", "Approve with Conditions", "Reject / Request Revision"
5. **Latest Approval** — Most recent approval with approver, comments, and status
6. **Approval History** — All approval records in chronological order
7. **Review Audit Trail** — Table of all review-related audit actions with dates, actors, and details

### Forms
- **Approve**: Optional notes textarea
- **Approve with Conditions**: Required conditions textarea
- **Reject / Request Revision**: Required reason textarea with two action buttons

## Schema Changes

| Model | Change | Purpose |
|-------|--------|---------|
| AuditAction enum | Added 5 new values | Track approval lifecycle events |

No new models created. Existing `Approval`, `AuditLog`, and `Decision` models reused.

## Changed Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added 5 AuditAction enum values: SUBMITTED_FOR_REVIEW, DECISION_APPROVED, DECISION_APPROVED_WITH_CONDITIONS, DECISION_REJECTED, REVISION_REQUESTED |
| `src/actions/approval.ts` | NEW — 6 approval lifecycle actions with RBAC enforcement and audit logging |
| `src/app/(dashboard)/decisions/[id]/governance/page.tsx` | Complete rewrite — approval actions, recommendation summary, approval history, audit trail |

## Tender Compatibility Status

- Tender decisions use the same approval lifecycle
- No changes to TenderProfile or tender simulation
- Approval actions work for all decision types
- Existing publish/unpublish flow preserved

## Migration Impact

| Aspect | Impact |
|--------|--------|
| Schema | Additive only — 5 new enum values |
| Existing data | Preserved — no data migration required |
| Existing approvals | Work as before — Approval model unchanged |
| Existing audit logs | Work as before — new actions are additive |
| Routes | `/governance` route enhanced, not replaced |

## Remaining Risks

1. **No conditional approval tracking** — Conditions are stored in approval comments but not tracked as separate checklist items
2. **No re-submission workflow** — After revision request, decision returns to DRAFT but there's no explicit "re-submit" tracking
3. **No approval deadline** — No SLA or timeout for IN_REVIEW status
4. **No multi-level approval** — Single approver model; no escalation or chain of approval
5. **Recommendation not locked on approval** — Recommendation can still be edited after approval

## Recommended TASK-010

**Title:** Decision Intelligence Dashboard

**Scope:**
- Create executive dashboard showing all decisions with status, quality scores, and approval state
- Add decision comparison view (side-by-side scenario scores)
- Implement decision export (PDF/CSV) for simulation results and recommendations
- Add decision timeline visualization (intake → framework → scenarios → risks → simulation → recommendation → approval)
- Create decision template system for recurring decision types
