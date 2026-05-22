# Sunbul Phase 3B — Real File Upload + Download

**Date:** 2026-05-18
**Status:** Complete
**Validation:** ✅ `npx tsc --noEmit` | ✅ `npm run lint` | ✅ `npx tsx scripts/validate-sunbul-e2e.ts` (47/47) | ✅ `npm run build`

---

## Purpose

Replace Sunbul's metadata-only document registration with real file upload/download using the platform storage abstraction (`@/lib/platform/storage`). This completes the document management feature — files are now stored to disk, linked to records via `storageKey`, and downloadable through a tenant-guarded API route.

---

## Files Changed

### New Files

| File | Purpose |
|---|---|
| `src/lib/sunbul/storage.ts` | `uploadSunbulDocument()`, `deleteStoredSunbulDocument()`, `retrieveSunbulDocument()` — file storage service using `@/lib/platform/storage` |
| `src/app/api/sunbul/documents/[documentId]/download/route.ts` | Download API route — validates client/record access before streaming file |

### Modified Files

| File | Change |
|---|---|
| `src/actions/sunbul-actions.ts` | Added `sunbul_uploadDocument()` (base64 input) + updated `sunbul_deleteDocument()` to use `deleteStoredSunbulDocument()` (removes from storage) |
| `src/components/sunbul/sunbul-add-document-form.tsx` | Replaced manual metadata form with real file input + base64 reader + upload action |
| `src/components/sunbul/sunbul-document-panel.tsx` | Added download link for stored files, kept metadata-only badge for legacy |
| `scripts/validate-sunbul-e2e.ts` | Added Scenario 7 (9 storage tests) — store, retrieve, exists, delete, key pattern validation |

---

## Upload Flow

```
Client (browser)                  Server Action                     Platform Storage
      │                               │                                  │
      ├─ select file ─────────────────┤                                  │
      ├─ FileReader.readAsDataURL ────┤                                  │
      ├─ base64 content ──────────────┤                                  │
      │                               ├─ requireClientAccess() ──────────┤
      │                               ├─ validate file type + size ──────┤
      │                               ├─ create SunbulDocument (DB) ─────┤
      │                               ├─ buildSunbulStorageKey() ────────┤
      │                               ├─ getStorageProvider().store() ────┤
      │                               ├─ update storageKey (DB) ─────────┤
      │                               ├─ create audit event ─────────────┤
      ├─ success ─────────────────────┤                                  │
```

## Download Flow

```
Client (browser)                    API Route                          Platform Storage
      │                               │                                     │
      ├─ GET /api/sunbul/documents/ ──┤                                     │
      │   [documentId]/download       │                                     │
      │                               ├─ find SunbulDocument (DB) ─────────┤
      │                               ├─ retrieveSunbulDocument() ─────────┤
      │                               │   ├─ requireClientAccess() ────────┤
      │                               │   └─ getStorageProvider().retrieve()┤
      │                               ├─ return file with Content-Disposition
      ├─ file download ───────────────┤                                     │
```

## Storage Key Pattern

```
sunbul/clients/{clientId}/records/{recordId}/documents/{documentId}/{safeFileName}
```

Safe filename replaces problematic characters (`/ \ : * ? " < > |`) with underscores.

## File Validation

| Check | Limit |
|---|---|
| Max file size | 20 MB |
| Allowed extensions | `.pdf`, `.xlsx`, `.xls`, `.docx`, `.jpg`, `.jpeg`, `.png`, `.csv` |

## Storage Path

Files are stored at `{cwd}/uploads/sunbul/clients/{clientId}/...` when using the default local provider. The base directory can be changed via `LOCAL_STORAGE_DIR` environment variable.

## Permission Enforcement

| Action | Server Guard | HTTP Status |
|---|---|---|
| Upload (Draft) | `requireClientAccess(clientId, "Operator")` | 403 if denied |
| Upload (UnderReview) | PlatformAdmin override only | 403 if denied |
| Upload (Approved/Archived) | Blocked entirely | 403 |
| Download | `requireClientAccess(clientId)` (any role) | 403 / 404 |
| Delete | PlatformAdmin only + storage.delete() | 403 |
| Reviewer upload | Blocked at UI + server | 403 |

---

## Validation Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (133 pre-existing warnings) |
| `npx tsx scripts/validate-sunbul-e2e.ts` | ✅ **47/47 tests passed** (38 data layer + 9 storage) |
| `npm run build` | ✅ Compiled. New route: `/api/sunbul/documents/[documentId]/download` (ƒ dynamic) |

---

## What Changed Since Metadata-Only

| Aspect | Before (Phase 2C) | After (Phase 3B) |
|---|---|---|
| File storage | `metadata-only:<uuid>` placeholder | `sunbul/clients/{clientId}/.../{safeFileName}` on disk |
| Upload UI | Manual name/type/size fields | Native `<input type="file">` + FileReader |
| Upload action | `sunbul_createDocumentMetadata()` | `sunbul_uploadDocument()` (base64) |
| Download | Not available | `GET /api/sunbul/documents/[id]/download` |
| Delete | DB record only | DB record + storage file removed |
| File validation | None | Type whitelist + 20MB max |

---

## Known Limitations

1. **Base64 overhead** — Upload encodes file as base64 in the server action payload (~33% size overhead). Acceptable for MVP (<20MB files).
2. **No chunked/streaming upload** — Entire file loaded into memory on client and server.
3. **No download audit events** — Downloads are not logged to reduce noise. Can be added if needed.
4. **No storage provider fallback** — If `STORAGE_PROVIDER` is set to `s3` or `azure-blob`, uploads will fail (those providers are stubs).
5. **Metadata-only fallback kept** — `deleteStoredSunbulDocument` and `retrieveSunbulDocument` both handle `metadata-only:` keys gracefully, but the UI now prefers real uploads.
6. **No file scanning** — Unlike AuditOS, Sunbul does not call `scanEvidenceFile()`. Can be added when needed.

---

## Next Recommended Task

**Phase 3C: PDF Export of Approved Records** — Build a server action that generates a PDF document containing record details, document references, review history, and audit trail. Follow the existing AuditOS export patterns in `src/lib/audit/export/`.
