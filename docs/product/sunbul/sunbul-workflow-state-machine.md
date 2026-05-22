# Sunbul Workflow State Machine

**Version:** 0.1
**Status:** Draft

---

## States

```
                    ┌─────────────┐
                    │   DRAFT     │
                    └──────┬──────┘
                           │ submit
                    ┌──────▼──────┐
                    │  SUBMITTED  │
                    └──────┬──────┘
                           │ assign
                    ┌──────▼──────┐
                    │ UNDER REVIEW│
                    │             │
                    └──┬──────┬───┘
               return  │      │  approve
                  ┌─────┘      └──────┐
          ┌───────▼───────┐   ┌──────▼───────┐
          │   RETURNED    │   │   APPROVED   │
          │ (→ DRAFT)     │   │              │
          └───────┬───────┘   └──────┬───────┘
                  │ re-submit        │ lock
          ┌───────▼───────┐   ┌──────▼───────┐
          │  SUBMITTED    │   │   LOCKED     │
          └───────────────┘   └──────┬───────┘
                                     │ export
                              ┌──────▼───────┐
                              │  EXPORTED    │
                              └──────┬───────┘
                                     │ archive
                              ┌──────▼───────┐
                              │  ARCHIVED    │
                              └──────────────┘
```

## State Definitions

### DRAFT
- **Description:** Record is being created/edited. Not yet ready for review.
- **Allowed roles:** Operator, Client Owner, Client Manager
- **Editable:** Yes — title, description, documents, evidence, priority, due date
- **Deletable:** Yes
- **Visibility:** Creator, Client Owner, Client Manager

### SUBMITTED
- **Description:** Record has been submitted for review but not yet assigned to a reviewer.
- **Allowed roles:** Any (initiated by Operator or Client Owner)
- **Editable:** No (except by Client Owner or Client Manager in exceptional circumstances)
- **Deletable:** No
- **Visibility:** All client roles
- **Next action:** Assign to a reviewer (automatic or manual)

### UNDER REVIEW
- **Description:** Record is being examined by a Reviewer.
- **Allowed roles:** Reviewer, Client Owner, Client Manager
- **Editable:** No
- **Deletable:** No
- **Possible transitions:**
  - `→ RETURNED` — Reviewer returns record for revision
  - `→ APPROVED` — Reviewer approves (or forwards to Approver)

### RETURNED
- **Description:** Record has been returned to the Operator for revision.
- **Allowed roles:** Operator, Client Owner, Client Manager
- **Editable:** Yes (by Operator)
- **Deletable:** No
- **Required:** Reviewer must provide a reason/comments for return
- **Next transition:** `→ SUBMITTED` — re-submit after revision

### APPROVED
- **Description:** Record has been approved by the reviewer/approver.
- **Allowed roles:** All (view only)
- **Editable:** No
- **Deletable:** No
- **Next transition:** `→ LOCKED` — automatic or manual lock after approval

### LOCKED
- **Description:** Record is locked after approval. No further changes possible.
- **Allowed roles:** All (view only)
- **Editable:** No
- **Deletable:** No
- **Next transition:** `→ EXPORTED` — when record is exported

### EXPORTED
- **Description:** Record has been exported as a final deliverable.
- **Allowed roles:** All (view only)
- **Editable:** No
- **Deletable:** No
- **Metadata:** Export timestamp, exported by, export file reference, export version
- **Next transition:** `→ ARCHIVED` — soft delete / archival

### ARCHIVED
- **Description:** Record has been archived. Not visible in active views.
- **Allowed roles:** Platform Admin, Client Owner, Client Manager (search/restore only)
- **Editable:** No
- **Deletable:** No (permanent deletion requires Platform Admin)
- **Restorable:** Yes (by Client Owner or Platform Admin)

## State Transition Table

| From | To | Trigger | Required Role | Audit Event | Blocker |
|---|---|---|---|---|---|
| DRAFT | SUBMITTED | User clicks "Submit" | Operator, Client Owner | `RECORD_SUBMITTED` | Record must have required fields filled |
| SUBMITTED | UNDER REVIEW | System assigns or user assigns | System / Client Manager | `RECORD_ASSIGNED` | Reviewer must exist and have active status |
| UNDER REVIEW | RETURNED | Reviewer clicks "Return to Draft" | Reviewer | `RECORD_RETURNED` | Comment/reason required |
| UNDER REVIEW | APPROVED | Reviewer/Approver clicks "Approve" | Reviewer, Approver | `RECORD_APPROVED` | — |
| RETURNED | SUBMITTED | Operator re-submits | Operator | `RECORD_RESUBMITTED` | — |
| APPROVED | LOCKED | System auto-locks after approval | System | `RECORD_LOCKED` | — |
| LOCKED | EXPORTED | User clicks "Export" | Operator (own), Client Owner, Client Manager | `RECORD_EXPORTED` | Export must succeed |
| EXPORTED | ARCHIVED | User clicks "Archive" or scheduled | Client Owner, Client Manager | `RECORD_ARCHIVED` | — |
| ARCHIVED | DRAFT | User clicks "Restore" | Client Owner, Platform Admin | `RECORD_RESTORED` | — |

## Blockers / Guards

| Guard | Description | Where Applied |
|---|---|---|
| Required fields | Title, type, and at least one document required before submit | Submit action |
| Review assignment | Record cannot be under review without an assigned reviewer | Assign action |
| Comment on return | Return to draft requires a comment/reason | Return action |
| Approval chain | If multiple approvers configured, all must approve | Approval checks |
| Export readiness | Record must be locked before export | Export action |
| Archive protection | Archived records cannot be edited, only restored | All edit actions |
| Concurrent edit lock | Only one user can edit a draft at a time | Edit action (future) |
| Time window (future) | Records past due date may require special handling | Submit/approve actions |

## Approval Chain Options (MVP Simplification)

For MVP, approval requires a single approval action. Future versions may support:

- Sequential approval (approver 1 → approver 2 → approver 3)
- Parallel approval (all approvers must approve)
- Threshold approval (2 of 3 approvers)
- Escalation (if not approved within timeframe, escalate to next level)

## Audit Events Per Transition

| Transition | Audit Event | Metadata Captured |
|---|---|---|
| DRAFT → SUBMITTED | `RECORD_SUBMITTED` | `actorId`, `timestamp`, `recordId`, `clientId` |
| SUBMITTED → UNDER REVIEW | `RECORD_ASSIGNED` | `actorId`, `timestamp`, `reviewerId` |
| UNDER REVIEW → RETURNED | `RECORD_RETURNED` | `actorId`, `timestamp`, `reason` |
| UNDER REVIEW → APPROVED | `RECORD_APPROVED` | `actorId`, `timestamp`, `approverRole` |
| RETURNED → SUBMITTED | `RECORD_RESUBMITTED` | `actorId`, `timestamp` |
| APPROVED → LOCKED | `RECORD_LOCKED` | `actorId`, `timestamp` |
| LOCKED → EXPORTED | `RECORD_EXPORTED` | `actorId`, `timestamp`, `exportFileRef`, `exportVersion` |
| EXPORTED → ARCHIVED | `RECORD_ARCHIVED` | `actorId`, `timestamp` |
| ARCHIVED → DRAFT | `RECORD_RESTORED` | `actorId`, `timestamp`, `reason` |
