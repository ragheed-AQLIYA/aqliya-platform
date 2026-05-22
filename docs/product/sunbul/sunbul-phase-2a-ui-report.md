# Sunbul Phase 2A — Workspace Shell + Client Dashboard + Record CRUD

**Date:** 2026-05-18
**Status:** Complete
**Validation:** ✅ `npx tsc --noEmit` | ✅ `npm run lint` (0 errors) | ✅ `npm run build`

---

## Purpose

Connect Sunbul server actions to a usable workspace UI. Deliver the first navigable Sunbul experience with client selection, record listing, and record creation — all behind tenant isolation and role-based access.

---

## Files Changed

### New Files

| File | Purpose |
|---|---|
| `src/components/sunbul/sunbul-dashboard.tsx` | Main dashboard orchestrator — client selector, stat cards, record list, create form, placeholders |
| `src/components/sunbul/sunbul-client-selector.tsx` | Dropdown that loads accessible clients via `sunbul_listClients()`, auto-selects first |
| `src/components/sunbul/sunbul-record-list.tsx` | Server-side data table of records for selected client, with loading/empty/error states |
| `src/components/sunbul/sunbul-create-record-form.tsx` | Inline form to create a new Case (CASE) record in Draft status |
| `src/components/sunbul/sunbul-status-badge.tsx` | Arabic status badge with icons: مسودة, تحت المراجعة, معتمد, مؤرشف |
| `src/components/sunbul/sunbul-empty-state.tsx` | Reusable empty state component with icon + title + description + optional action |

### Modified Files

| File | Change |
|---|---|
| `src/components/platform/platform-sidebar.tsx` | Added Sunbul module to navigation (icon: KanbanSquare, color: aqliya-cyan, route: `/sunbul`) |
| `src/app/sunbul/page.tsx` | Replaced placeholder HTML with `<SunbulDashboard />` component |

---

## UI Behavior

### `/sunbul` Workspace Landing

1. **Header** — "سنبل" title with subtitle "مساحة عمل لإدارة القضايا والملفات ضمن عزل متعدد العملاء"
2. **Client selector** — Dropdown showing only clients the current user can access. Auto-selects first client. If no clients → empty state.
3. **Overview cards** — 4 cards: إجمالي القضايا, مسودة, تحت المراجعة, معتمدة (with counts from server)
4. **Record list** — Table: title (with file icon), status badge (Arabic), creation date (Arabic locale)
5. **Create record form** — Inline expandable form with title (required) + description (optional). Calls `sunbul_createRecord()`. Refreshes list on success.
6. **Placeholders** — 3 sidebar panels at right side:
   - قائمة المراجعة: "سيتم تفعيلها في Phase 2B"
   - المستندات: "سيتم تفعيلها في Phase 2C"
   - التصدير: "سيتم تفعيله لاحقاً"

### Empty States

| Scenario | Visual |
|---|---|
| No accessible clients | "اختر عميلاً للبدء" with folder icon |
| No records yet | "لا توجد قضايا بعد" with file icon |
| API error | Red error banner with message text |

### Loading States

- Client selector: spinning loader while loading client list
- Record list: centered spinner while loading records

---

## Access-Control Behavior

| User Type | Sees |
|---|---|
| **AQLIYA ADMIN** | All Sunbul clients (via `listSunbulClientsForUser` — checks AQLIYA role) |
| **Operator** | Only clients where they have active `SunbulUserMembership` with Operator role |
| **Reviewer** | Only clients where they have active membership with Reviewer role |
| **No membership** | Empty client list → no-access empty state |

All data access goes through server actions that call `requireClientAccess()` — tenant isolation is enforced at the DB query level.

---

## What Is Functional

| Feature | Status |
|---|---|
| Sunbul sidebar navigation | ✅ Added with KanbanSquare icon |
| Client selector loads accessible clients | ✅ Via `sunbul_listClients()` |
| Record list for selected client | ✅ Via `sunbul_listRecords(clientId)` |
| Create record (Case) in Draft | ✅ Via `sunbul_createRecord(clientId, { title, description })` |
| Status badges in Arabic | ✅ 4 states: مسودة, تحت المراجعة, معتمد, مؤرشف |
| Overview stat cards | ✅ Counts by status |
| Empty/loading/error states | ✅ All three covered |
| Role-based access (no membership → no data) | ✅ Tenant guard on every action |

---

## What Is Placeholder Only

| Feature | Status | Planned |
|---|---|---|
| Review queue UI | Placeholder panel | Phase 2B |
| Document management | Placeholder panel | Phase 2C |
| Export/PDF generation | Placeholder panel | Phase 3 |
| Record detail view | Only title/status/date in table | Phase 2B |
| Reviewer-specific view | Reviewer sees client but no create form (not enforced at UI level yet) | Phase 2B |
| File upload | Not implemented | Phase 2C |
| Audit trail page | Not implemented | Phase 2B |

---

## Validation Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (129 pre-existing warnings) |
| `npm run build` | ✅ Compiled. `/sunbul` static route |

---

## Known Limitations

1. **No client creation UI** — Platform Admin must create clients via direct server action call or database seed
2. **No user invitation UI** — Memberships must be created server-side
3. **Reviewer sees create form** — The create form is currently visible to all users who have a client selected. Role-based UI hiding is deferred to Phase 2B.
4. **No record detail page** — Clicking a record in the list does nothing (no href)
5. **No record editing** — Only creation is supported
6. **No document upload** — File storage is metadata-only
7. **Single-client assumption** — User membership check works for one client; cross-client membership is not tested
8. **No Arabic date formatting fallback** — `toLocaleDateString("ar-SA")` may not render correctly in all environments

---

## Next Recommended Task

**Phase 2B: Review Workflow UI + Record Detail** — Build the reviewer queue page, record detail view with status-aware actions (submit/review/approve/return), role-aware UI hiding, and audit trail display.
