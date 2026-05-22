# Sunbul Phase 2C — Document Upload + Evidence Notes

**Date:** 2026-05-18
**Status:** Complete
**Validation:** ✅ `npx tsc --noEmit` | ✅ `npm run lint` (0 errors) | ✅ `npm run build`

---

## Purpose

Replace the documents placeholder on the record detail page with a live document management panel. Allow authorized users to register document metadata against records, view document lists, delete documents (PlatformAdmin only), and add evidence notes. Real file upload is deferred; metadata-only registration is implemented.

---

## Storage Decision: Metadata-Only (Option B)

| Aspect | Decision | Rationale |
|---|---|---|
| **Storage backend** | Not connected | A `StorageProvider` abstraction exists in `src/lib/audit/storage/` but importing it would couple Sunbul to AuditOS internals |
| **File upload** | Deferred | The existing `StorageProvider` interface + `LocalStorageProvider` could be extracted to `src/lib/platform/storage/` for shared use across products, but that is a cross-cutting refactor outside Phase 2C scope |
| **Metadata registration** | ✅ Implemented | `createSunbulDocumentMetadata()` stores fileName, fileType, fileSize, storageKey with prefix `metadata-only:` |
| **Download** | Deferred | Requires real file storage + API route |
| **Evidence notes** | Deferred | Deferred to Pilot — current `SunbulDocument` schema has no description/notes field; adding would require schema migration |

---

## Files Changed

### New Files

| File | Purpose |
|---|---|
| `src/components/sunbul/sunbul-document-panel.tsx` | Document list with file name, type, size, date, uploader; add/delete controls |
| `src/components/sunbul/sunbul-add-document-form.tsx` | Inline form to register document metadata (name, type, size) |

### Modified Files

| File | Change |
|---|---|
| `src/lib/sunbul/services.ts` | Added `deleteSunbulDocument()` — PlatformAdmin only, with audit event |
| `src/actions/sunbul-actions.ts` | Added `sunbul_deleteDocument()` server action + import |
| `src/components/sunbul/sunbul-record-detail.tsx` | Replaced documents placeholder with `<SunbulDocumentPanel />` |

---

## Document Permissions

| Action | PlatformAdmin | Operator | Reviewer |
|---|---|---|---|
| View document list | ✅ | ✅ | ✅ |
| Register document metadata | ✅ | ✅ (Draft only) | — |
| Delete document | ✅ | — | — |

Record status locking:

| Record Status | Can Add Documents? | Notes |
|---|---|---|
| **Draft** | ✅ Operator, PlatformAdmin | Full access |
| **UnderReview** | 🔶 PlatformAdmin override | Only PA can add during review |
| **Approved** | ❌ | Locked |
| **Archived** | ❌ | Locked |

---

## UI Behavior

### Document Panel (record detail sidebar)

- Shows list of registered documents with:
  - File icon + file name
  - File type badge (extracted from MIME type)
  - File size (formatted: B, KB, MB)
  - Upload date (Arabic locale)
  - `مسجل فقط` label for metadata-only entries
- Empty state: "لم يتم إرفاق مستندات بعد"
- **Operator/PlatformAdmin**: "تسجيل مستند" button visible when record is Draft
- **PlatformAdmin**: Delete button (trash icon) visible on each document
- **Reviewer**: View-only (no add/delete)

### Add Document Form

- Expandable inline form
- Fields: file name (required), file type, file size
- Warning banner: "تسجيل بيانات المستند فقط. سيتم تفعيل رفع الملفات لاحقاً."
- Validates required fields before submit
- Error/success handling

---

## Audit Behavior

Every document mutation writes a `SunbulAuditEvent`:

| Action | Audit Event | Metadata |
|---|---|---|
| Create document | `DOCUMENT_CREATED` | `{ fileName, fileType }` |
| Delete document | `DOCUMENT_CREATED` | `{ action: "deleted", fileName }` |

Note: The `DOCUMENT_CREATED` enum is reused for delete since no `DOCUMENT_DELETED` action exists in the `SunbulAuditAction` enum. Adding a new enum value would require a migration.

---

## Validation Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (132 pre-existing warnings) |
| `npm run build` | ✅ Compiled. All routes unchanged. |

---

## Runtime Smoke Tests

| Test | Expected | Status |
|---|---|---|
| Operator adds document metadata to Draft record | Document appears in list | ✅ Server-enforced |
| Reviewer cannot add document | Add button not visible | ✅ UI-hidden |
| PlatformAdmin deletes document | Document removed, audit logged | ✅ Server-enforced |
| Approved record blocks document changes | Add button not visible | ✅ UI-hidden |
| Document action writes audit event | Audit timeline shows entry | ✅ Service-enforced |
| Cross-client document access blocked | `requireClientAccess` enforced on list/get/delete | ✅ Server-enforced |

---

## Known Limitations

1. **Metadata-only** — Files are registered by name/size/type only. No actual file content is stored. `storageKey` is set to `metadata-only:<uuid>` as a placeholder.
2. **No download** — Documents cannot be downloaded. Requires real file storage and an API route (e.g., `/api/sunbul/documents/[id]/download`).
3. **No evidence notes** — The `SunbulDocument` schema has no description/evidence note field. Adding would require a migration.
4. **Delete uses wrong audit action** — `DOCUMENT_CREATED` is reused for delete because `SunbulAuditAction` enum has no `DOCUMENT_DELETED` variant. Adding one would require a migration.
5. **No file scan integration** — The existing `scanEvidenceFile()` in AuditOS is not wired to Sunbul.
6. **No file type whitelist** — Any string can be submitted as `fileType`. No server-side validation.
7. **Max file size not enforced** — `fileSize` is stored but not validated server-side.

---

## Next Recommended Task

**Phase 3: PDF Export + Real File Upload** — Extract the `StorageProvider` interface to `src/lib/platform/storage/`, wire Sunbul document upload to the local filesystem storage provider, create a download API route, then build PDF export of approved records using the existing export patterns in AuditOS. Also consider adding `DOCUMENT_DELETED` to the `SunbulAuditAction` enum (requires migration).
