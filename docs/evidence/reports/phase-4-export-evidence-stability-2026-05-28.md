# Phase 4 — Export & Evidence Stability Assessment

**Date:** 2026-05-28
**Agent:** Export & Evidence Stability Agent
**Status:** Assessment complete

---

## Files Inspected

| File | Role |
|------|------|
| `src/lib/platform/export.ts` | Core export utilities (format validation, MIME types, response builder) |
| `src/lib/platform/download.ts` | Core download response builder (security headers, filename sanitization) |
| `src/lib/audit/export/types.ts` | Export type definitions (ExportInput, ExportResult, Exporter) |
| `src/lib/audit/export/index.ts` | Export dispatcher (routes to pdf/xlsx exporters) |
| `src/lib/audit/export/pdf-exporter.ts` | PDFKit-based PDF generation |
| `src/lib/audit/export/xlsx-exporter.ts` | xlsx-based XLSX generation |
| `src/lib/audit/export-service.ts` | Export package builder (data aggregation) |
| `src/lib/audit/storage/index.ts` | Evidence storage provider factory |
| `src/lib/audit/storage/types.ts` | Storage provider types |
| `src/lib/audit/storage/local-storage-provider.ts` | Local filesystem storage (path traversal protection) |
| `src/lib/platform/storage/index.ts` | Platform storage provider factory |
| `src/lib/platform/storage/types.ts` | Platform storage types |
| `src/lib/platform/storage/local-storage-provider.ts` | Platform local storage (NO path traversal protection) |
| `src/lib/download-token.ts` | HMAC-SHA256 signed download tokens |
| `src/app/api/audit/evidence/[evidenceId]/download/route.ts` | Evidence download (auth + audit + storage) |
| `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts` | LC report download (auth + audit + generation) |
| `src/app/api/workflowos/documents/[documentId]/download/route.ts` | WorkflowOS doc download (auth + audit + storage) |
| `src/app/api/office-ai/download/route.ts` | Office AI download (auth + audit + inline generation) |

---

## Export Maturity

### AuditOS Exports

| Feature | Status | Notes |
|---------|--------|-------|
| Financial statement PDF | ✅ Implemented | pdfkit-based, A4, draft/approval labels, page numbers |
| Financial statement XLSX | ✅ Implemented | xlsx library, multi-sheet (Cover, Statements, Notes, Evidence, Findings) |
| Export metadata | ✅ Implemented | Status, draft warning, approval info, client info |
| Export audit log | ✅ Implemented | `evidence.download` logged via platform auditLogger |
| Bilingual export | ⚠️ Partial | `exportBilingual` function exists but only prefixes Arabic titles — no full Arabic PDF rendering |

### LocalContentOS Exports

| Feature | Status | Notes |
|---------|--------|-------|
| Assessment summary PDF | ✅ Implemented | `buildAssessmentSummaryPDF` |
| Spend classification XLSX | ✅ Implemented | `buildSpendClassificationXLSX` |
| Evidence index XLSX | ✅ Implemented | `buildEvidenceIndexXLSX` |
| Export audit log | ✅ Implemented | `report.download` via platform auditLogger |

### WorkflowOS Exports

| Feature | Status | Notes |
|---------|--------|-------|
| Document download | ✅ Implemented | via `retrieveWorkflowDocument` + platform auditLogger |
| PDF export | ✅ Implemented | |

### Office AI Assistant

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown/txt download | ✅ Implemented | With HTML sanitization |
| Print view | ✅ Implemented | HTML with embedded print() |
| Export audit log | ✅ Implemented | `output.download` via platform auditLogger |

---

## Evidence Durability

| Aspect | Status | Notes |
|--------|--------|-------|
| Local filesystem storage | ✅ Implemented | Both `lib/audit/storage/` and `lib/platform/storage/` |
| Path traversal protection | ✅ Audit storage | `local-storage-provider.ts:73-84` — TRAVERSAL_PATTERN + resolved path check |
| Path traversal protection | ❌ Platform storage | `platform/storage/local-storage-provider.ts` — no traversal protection |
| S3/Azure Blob provider | ✅ Defined | `ObjectStorageProvider` in `audit/storage/object-storage-provider.ts` |
| Checksum storage | ⚠️ File hash stored | Evidence model stores `fileHash` |
| MIME type from extension | ✅ Falls back to `application/octet-stream` |
| Download tokens | ✅ HMAC-SHA256, 5-min expiry |
| Retry behavior | ❌ None | Download fails fast on first error |

---

## Risks

| Priority | Risk | Location |
|----------|------|----------|
| P1 | **Platform storage has NO path traversal protection** — `src/lib/platform/storage/local-storage-provider.ts` lacks the traversal detection present in `src/lib/audit/storage/local-storage-provider.ts` | `platform/storage/local-storage-provider.ts` |
| P1 | **Arabic PDF rendering** — pdfkit uses Helvetica font; no Arabic font embedded. Arabic characters would render as boxes or tofu | `pdf-exporter.ts:12-14` |
| P1 | **Export buffer size unchecked** — no memory limit on PDF/XLSX generation for very large engagements | `pdf-exporter.ts:149`, `xlsx-exporter.ts:119` |
| P2 | **Export filename uses truncated engagement ID** — not human-readable | `pdf-exporter.ts:153` |
| P2 | **No export cache** — every export regenerates from scratch | All exporters |
| P2 | **No download analytics** — downloads are logged but not counted separately in dashboard | — |
| P2 | **Office AI rate limiter uses per-instance Map with setInterval** — stale entries accumulate on HMR | `office-ai/download/route.ts:9-21` |

---

## Arabic PDF Rendering Gap

**Problem:** The export PDF generator uses `Helvetica` which does not include Arabic glyphs.

**Current state:** `pdf-exporter.ts` uses `Helvetica` and `Helvetica-Bold` fonts exclusively.

**Impact:** Any Arabic content in exported PDFs would render incorrectly.

**Recommendation (minimal):** Register an Arabic-capable font (e.g., Noto Sans Arabic, or a bundled Arabic font) with pdfkit using `doc.registerFont()`. This is a P2 quality gap — acceptable for v0.1 pilot where exports are primarily English-language financial statements.

---

## Evidence Validation

| Check | Status |
|-------|--------|
| File size validation | ✅ Implemented |
| MIME type validation | ✅ Implemented |
| Hash stored on upload | ✅ Implemented (fileHash field) |
| Path traversal prevention | ✅ Audit storage (missing in platform storage — P1) |
| Storage key format | ✅ Structured: `engagements/{id}/evidence/{id}/{filename}` |
| Token expiry | ✅ 5-minute default, configurable |

---

## Assessment Summary

| Dimension | Maturity |
|-----------|----------|
| PDF export | L4 (functional, draft/approval labels, no Arabic font) |
| XLSX export | L4 (multi-sheet, functional) |
| Export audit trail | L5 (all downloads logged) |
| Evidence storage | L4 (local only, S3/Azure stubs exist) |
| Evidence validation | L4 (size, hash, path traversal in audit storage) |
| Platform storage security | L2 (no path traversal protection) |
| Download tokens | L5 (HMAC-SHA256, expiry, type-checked) |
| Arabic PDF rendering | L2 (Helvetica only) |
