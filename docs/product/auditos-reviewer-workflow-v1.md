# AuditOS Reviewer Workflow v1

## Overview

Reviewer Workflow v1 provides minimal, human-driven status transitions for disclosure notes. It enables reviewers to move notes through clear states without building a complex approval system.

**Core principle:** AI assists. Humans decide. Evidence governs.

## Supported Review States

| Status | Meaning | Transition From |
|--------|---------|-----------------|
| `draft` | Auto-generated, unreviewed | Initial state |
| `needs_info` | Reviewer requested additional information | draft, reviewed |
| `reviewed` | Reviewer has examined the note | draft, needs_info |
| `approved` | Note accepted for final statements | draft, reviewed, needs_info |
| `rejected` | Note requires revision | draft, reviewed, needs_info |

### State Transition Rules

```
draft ──────────→ reviewed ──→ approved
  │                  │            ↑
  ├────→ needs_info ─┘            │
  │                               │
  └───────────────→ rejected ─────┘
```

- Any non-final state can transition to any other non-final state.
- `approved` and `rejected` are terminal states (UI disables further actions).
- No AI auto-approval — every transition is human-triggered.

## Architecture

### Service Layer

**`src/lib/audit/services.ts`**

```typescript
updateNoteStatus(noteId, status, engagementId, reviewerName?, comment?)
```

- Updates the note's status in the database.
- Optionally creates a review comment linked to the note.
- Records an audit event (`note.status_changed`).
- Returns the updated note and any created review comment.

### Server Action

**`src/actions/audit-actions.ts`**

```typescript
updateNoteStatusAction(noteId, status, engagementId, comment?)
```

- Requires role: `admin`, `operator`, or `reviewer`.
- Validates engagement access.
- Delegates to `updateNoteStatus` service.

### UI Controls

**`src/components/audit/notes/notes-page.tsx`**

Each expanded note card shows:

1. **Status indicator** — contextual banner based on current state:
   - Amber: Draft (requires review)
   - Blue: Reviewed (pending approval)
   - Green: Approved (accepted)
   - Red: Rejected (needs revision)

2. **Reviewer action buttons** (hidden for approved/rejected notes):
   - **Mark Reviewed** — sets status to `reviewed`
   - **Approve** — sets status to `approved`
   - **Reject** — sets status to `rejected`
   - **Request Info** — sets status to `needs_info`

3. **Review comment textarea** — optional comment attached to the status change.

4. **Existing review comments** — displayed below actions with reviewer name, timestamp, status, and resolution.

## Review Comments

Review comments are created via the existing `AuditReviewComment` model:

- `targetType: 'note'` links the comment to a disclosure note.
- `requiredAction` is set based on the status change:
  - `needs_info` → `provide_evidence`
  - `rejected` → `revise`
  - Other → `none`
- Comments are visible in the expanded note card.

## Audit Trail

Every status change creates an `AuditEvent`:

- `eventType: 'note.status_changed'`
- `actorName`: reviewer name
- `targetType: 'disclosure_note'`
- `newState`: the new status
- `description`: includes note title and optional comment preview

## Demo Data

The seed script creates 14 notes with varied statuses:

| Note | Title | Status |
|------|-------|--------|
| 1 | General Information and Basis of Preparation | reviewed |
| 2 | Cash and Cash Equivalents | reviewed |
| 3 | Trade Receivables | needs_info |
| 4 | Inventories | needs_info |
| 5 | Property, Plant and Equipment | needs_info |
| 6 | Trade Payables | approved |
| 7 | Short-term Borrowings | needs_info |
| 8 | Revenue | needs_info |
| 9 | Expenses by Nature | needs_info |
| 10 | Finance Cost | needs_info |
| 11 | Zakat and Tax | needs_info |
| 12 | Share Capital | draft |
| 13 | Related Party Transactions | needs_info |
| 14 | Commitments and Contingencies | needs_info |

Three review comments are seeded:
- `rc-1`: Statement-level comment (open)
- `rc-2`: PPE note comment (open)
- `rc-3`: General information note comment (resolved)

## Files Changed

| File | Change |
|------|--------|
| `src/types/audit/index.ts` | Added `'rejected'` to `DisclosureNote.status` |
| `src/lib/audit/services.ts` | Added `updateNoteStatus` service function |
| `src/actions/audit-actions.ts` | Added `updateNoteStatusAction` server action |
| `src/components/audit/notes/notes-page.tsx` | Added status controls, comment input, status banners, review comment display |
| `prisma/seed-audit.ts` | Updated note statuses, added 3rd review comment |
| `src/lib/audit/mock-data.ts` | Updated note statuses, added review comments |

## Schema Changes

**None.** The existing `AuditDisclosureNote.status` field is a free-form `String @default("draft")`, so adding `'rejected'` requires no migration.

## Validation

| Command | Result |
|---------|--------|
| `npm run seed:audit` | **PASS** — 14 notes, 3 review comments |
| `npx tsc --noEmit` | **PASS** — zero errors |
| `npm run build -- --webpack` | **PASS** — full build succeeded |

## Skipped Items

| Item | Reason |
|------|--------|
| Role-based access control | Out of scope — existing role checks suffice for v1 |
| Electronic signature | Out of scope — requires external dependency |
| Full audit sign-off workflow | Out of scope — v1 focuses on note-level review |
| AI auto-approval | Explicitly forbidden by core principle |
| Notification system | Out of scope — no notification infrastructure exists |
| Complex reviewer assignment | Out of scope — actor context provides reviewer identity |
| Findings/statements workflow | Deferred — notes are the priority; patterns can be reused later |
| Prisma schema changes | Not needed — status field is free-form string |

## Future Enhancements (v2+)

- Apply same workflow to findings and financial statements
- Add reviewer assignment and delegation
- Add email/in-app notifications for status changes
- Add bulk status transitions
- Add approval workflow with partner sign-off
- Add electronic signature integration
- Add review checklist per note type
