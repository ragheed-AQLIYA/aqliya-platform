# Sunbul Phase 3A — Platform Storage Abstraction

**Date:** 2026-05-18
**Status:** Complete
**Validation:** ✅ `npx tsc --noEmit` | ✅ `npm run lint` | ✅ `npx tsx scripts/validate-sunbul-e2e.ts` (38/38) | ✅ `npm run build`

---

## Purpose

Extract a reusable storage abstraction from the AuditOS-specific location (`src/lib/audit/storage/`) into a shared platform-level module (`src/lib/platform/storage/`). This decouples Sunbul (and future products) from AuditOS internals while preserving full backward compatibility.

---

## Created Files

| File | Purpose |
|---|---|
| `src/lib/platform/storage/types.ts` | Core interfaces: `StorageProvider`, `StorageFile`, `StorageProviderType` |
| `src/lib/platform/storage/local-storage-provider.ts` | `LocalStorageProvider` class — filesystem-based storage with `uploads/` default dir |
| `src/lib/platform/storage/storage-errors.ts` | Error classes: `StorageError`, `StorageNotFoundError`, `StorageProviderNotConfiguredError` |
| `src/lib/platform/storage/index.ts` | Singleton factory `getStorageProvider()`, `createStorageProvider()`, type re-exports |

---

## Architecture

```
src/lib/platform/storage/       ← NEW: product-agnostic, shared by all products
├── types.ts                    ← StorageProvider interface
├── local-storage-provider.ts   ← LocalStorageProvider (filesystem)
├── storage-errors.ts           ← Error classes
└── index.ts                    ← Factory + exports

src/lib/audit/storage/          ← UNCHANGED: continues to work for AuditOS
├── types.ts                    ← (same interface, unchanged)
├── local-storage-provider.ts   ← (same class, unchanged)
├── object-storage-provider.ts  ← (S3/Azure stubs, unchanged)
└── index.ts                    ← (re-exports + AuditOS-specific build/parse key)
```

**Key design decision:** AuditOS files are completely untouched. Existing imports from `@/lib/audit/storage` continue to work identically. Sunbul can now import from `@/lib/platform/storage` without any dependency on AuditOS.

---

## What Changed

**Only new files were created.** Zero existing files were modified.

| File | Status |
|---|---|
| `src/lib/audit/storage/types.ts` | ✅ Unchanged |
| `src/lib/audit/storage/local-storage-provider.ts` | ✅ Unchanged |
| `src/lib/audit/storage/object-storage-provider.ts` | ✅ Unchanged |
| `src/lib/audit/storage/index.ts` | ✅ Unchanged |
| `src/actions/audit-actions.ts` | ✅ Unchanged (still imports from `@/lib/audit/storage`) |
| `src/app/api/audit/evidence/[...]/download/route.ts` | ✅ Unchanged |
| `src/__tests__/unit/storage-provider.test.ts` | ✅ Unchanged |

---

## Differences from AuditOS Storage

| Aspect | AuditOS (`src/lib/audit/storage/`) | Platform (`src/lib/platform/storage/`) |
|---|---|---|
| Path utilities | `buildStorageKey()`, `parseStorageKey()` — AuditOS-specific (`engagements/{id}/evidence/...`) | None — product-agnostic; Sunbul will define its own key pattern |
| Object storage stubs | `ObjectStorageProvider` for S3/Azure | Not included — deferred; uses `LocalStorageProvider` fallback |
| Error classes | None (raw throws) | `StorageError`, `StorageNotFoundError`, `StorageProviderNotConfiguredError` |
| MIME mapping | Inline `mimeFromExt()` | Same logic, duplicated intentionally to avoid coupling |

---

## Migration Path for AuditOS (Future)

AuditOS can optionally update its imports to re-export from the platform layer:

```typescript
// src/lib/audit/storage/index.ts — FUTURE OPTIONAL CHANGE
export { getStorageProvider, LocalStorageProvider } from "@/lib/platform/storage"
export { buildStorageKey, parseStorageKey } from "./audit-storage-utils"
```

This is **not done now** — no changes to AuditOS files.

---

## Validation Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (132 pre-existing warnings) |
| `npx tsx scripts/validate-sunbul-e2e.ts` | ✅ 38/38 tests passed |
| `npm run build` | ✅ Compiled. All routes unchanged. |

---

## Sunbul Upload Integration Path

When Sunbul is ready to implement real file upload:

1. Import `getStorageProvider()` from `@/lib/platform/storage`
2. Define Sunbul storage key pattern: `clients/{clientId}/records/{recordId}/{documentId}/{filename}`
3. In `services.ts`, replace metadata-only `storageKey` with a real call to `getStorageProvider().store(key, file)`
4. Create download API route at `/api/sunbul/documents/[id]/download`
5. Add `DOCUMENT_DELETED` to `SunbulAuditAction` enum (requires migration)

---

## Next Recommended Task

**Phase 3B: Sunbul Real File Upload** — Wire the platform `StorageProvider` into Sunbul's document service, replace metadata-only storage with real file storage, and create the download API route. This will make document management fully functional.
