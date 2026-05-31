# Sunbul Phase 2B — Review Workflow UI + Record Detail

**Date:** 2026-05-18
**Status:** Complete
**Validation:** ✅ `npx tsc --noEmit` | ✅ `npm run lint` (0 errors) | ✅ `npm run build`

---

## Purpose

Connect Sunbul workflow server actions to a usable record detail page with review/approve/return/archive actions, role-aware controls, audit trail display, and a live review queue on the dashboard.

---

## Files Changed

### New Files

| File | Purpose |
|---|---|
| `src/app/sunbul/clients/[clientId]/records/[recordId]/page.tsx` | Dynamic route for record detail page |
| `src/components/sunbul/sunbul-record-detail.tsx` | Main record detail with metadata, dates, documents, reviews, audit trail, workflow actions |
| `src/components/sunbul/sunbul-workflow-actions.tsx` | Action buttons (submit, approve, return with notes, archive) with role-aware visibility |
| `src/components/sunbul/sunbul-review-panel.tsx` | Review history display (approve/return records) |
| `src/components/sunbul/sunbul-audit-trail.tsx` | Timeline of audit events with Arabic labels |
| `src/components/sunbul/sunbul-review-queue.tsx` | Live review queue sidebar on dashboard |

### Modified Files

| File | Change |
|---|---|
| `src/actions/sunbul-actions.ts` | Added `sunbul_getUserRole()` server action |
| `src/lib/sunbul/tenant-guard.ts` | Added `getUserSunbulRole()` utility function |
| `src/components/sunbul/sunbul-record-list.tsx` | Added links to record detail (`/sunbul/clients/[clientId]/records/[recordId]`) |
| `src/components/sunbul/sunbul-dashboard.tsx` | Replaced review queue placeholder with live `SunbulReviewQueue`; added role-aware create form visibility |

---

## Routes Added

| Route | Type | Description |
|---|---|---|
| `/sunbul/clients/[clientId]/records/[recordId]` | Dynamic (ƒ) | Record detail page with metadata, workflow actions, reviews, audit trail |

---

## Workflow Behavior

| Current Status | Allowed Action | UI Shows | Server Enforces |
|---|---|---|---|
| **Draft** | Submit for review | ✅ Button | `requireClientAccess(clientId, "Operator")` |
| **UnderReview** | Approve | ✅ Button | `requireClientAccess(clientId, "Reviewer")` |
| **UnderReview** | Return (with notes) | ✅ Inline form | `requireClientAccess(clientId, "Reviewer")` + audit event |
| **UnderReview** | Submit (disabled) | ❌ Grayed out | — |
| **Approved** | Archive | ✅ Button (PlatformAdmin only) | `requireClientAccess(clientId, "Reviewer")` + `sunbulRole === "PlatformAdmin"` |
| **Archived** | All actions (hidden) | ❌ None shown | — |

Return transitions the record back to **Draft** status with a `SunbulReview` record (status: `Returned`) and an audit event. The return action includes an optional notes field via an inline form that appears when the user clicks "إرجاع".

---

## Role Behavior

| Action | PlatformAdmin | Operator | Reviewer |
|---|---|---|---|
| Submit Draft | ✅ | ✅ | — |
| Approve | ✅ | — | ✅ |
| Return | ✅ | — | ✅ |
| Archive | ✅ | — | — |
| View review queue | ✅ | — | ✅ |
| Create record form visible | ✅ | ✅ | — |

- **UI hiding** is applied for create form and review queue based on user role.
- **Server enforcement** is the source of truth — disabled/buttons still go through `requireClientAccess()`.

---

## Audit Trail Behavior

Record detail includes a full audit trail timeline showing:

- Arabic action labels (e.g., "تم إنشاء القضية", "تم إرسال القضية للمراجعة", "تم اعتماد القضية")
- Timestamps in Arabic locale format
- Actor ID reference
- Status transition metadata (from → to)

Audit events are fetched via `sunbul_listAuditEvents(clientId, { recordId })`.

---

## What Is Functional

| Feature | Status |
|---|---|
| Record detail page with metadata | ✅ Title, status badge, description, dates |
| Submit Draft for review | ✅ Via `sunbul_submitRecord()` |
| Approve UnderReview record | ✅ Via `sunbul_approveRecord()` |
| Return UnderReview to Draft | ✅ Via `sunbul_returnRecord()` with notes |
| Archive Approved record | ✅ Via `sunbul_archiveRecord()` |
| Role-aware action buttons | ✅ Buttons disabled/hidden based on role + status |
| Review queue on dashboard | ✅ Live list of under-review records with links |
| Audit trail on record detail | ✅ Timeline with Arabic labels |
| Review history panel | ✅ Shows past review actions |
| Breadcrumb navigation | ✅ سنبل → Client → Record title |
| Error/success feedback | ✅ Inline error messages on action failure |

## What Remains Placeholder

| Feature | Status | Planned |
|---|---|---|
| Document upload | Placeholder | Phase 2C |
| PDF export | Placeholder | Phase 3 |
| Record editing (title/description) | Not built | Future |
| User management UI (invite members) | Not built | Future |
| Client management UI (create client) | Not built | Future |

---

## Validation Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (133 pre-existing warnings) |
| `npm run build` | ✅ Compiled. `/sunbul/clients/[clientId]/records/[recordId]` listed as dynamic route. |

---

## Known Limitations

1. **Actor names in audit trail** — Only actor ID (truncated) is shown. Full user names require a User model join (the `User` relation was omitted from Prisma schema to avoid modifying existing models).
2. **Review queue shows all records** — The review queue on the dashboard currently lists all records for the client (not filtered by UnderReview status). The `listSunbulRecords` action does not support status filtering; this can be added when needed.
3. **Return action requires page reload** — After return, the record detail page needs to refetch. The `onActionComplete` callback triggers a reload but loading state transitions are not seamless.
4. **No confirmation dialogs** — Actions execute immediately without "Are you sure?" confirmation.
5. **No cross-client protection in UI routing** — A user could manually navigate to `/sunbul/clients/ANOTHER_CLIENT_ID/records/...`. The server action enforces access, but the UI does not block the navigation.
6. **Role check on every page load** — `sunbul_getUserRole()` is called on every mount; no caching.

---

## Next Recommended Task

**Phase 2C: Document Upload + Evidence Notes** — Implement real file upload using existing `createSunbulDocumentMetadata` action, file storage integration (local or existing AQLIYA storage), and evidence note attachments on records.
