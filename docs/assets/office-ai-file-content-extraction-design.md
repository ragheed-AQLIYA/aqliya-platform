# Office AI Assistant — File Content Extraction Design

**Version:** 1.0
**Status:** Architecture design — not yet implemented
**Aligned with:** `office-ai-assistant-foundation-design.md`, `office-ai-cloud-provider-risk-gate.md`, platform foundation v1.1

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Why Extraction Is Needed](#2-why-extraction-is-needed)
3. [Current State](#3-current-state)
4. [Supported MVP File Types](#4-supported-mvp-file-types)
5. [Explicit Non-Goals](#5-explicit-non-goals)
6. [Extraction Architecture](#6-extraction-architecture)
7. [Library Choices](#7-library-choices)
8. [Limits and Safety Controls](#8-limits-and-safety-controls)
9. [Storage Strategy](#9-storage-strategy)
10. [Proposed Data Model Changes](#10-proposed-data-model-changes)
11. [Service/API Design](#11-serviceapi-design)
12. [Deterministic Generator Integration](#12-deterministic-generator-integration)
13. [Audit Log Event Taxonomy](#13-audit-log-event-taxonomy)
14. [Error Handling and Fallbacks](#14-error-handling-and-fallbacks)
15. [Security and Privacy Rules](#15-security-and-privacy-rules)
16. [Verification Plan](#16-verification-plan)
17. [Production Readiness Notes](#17-production-readiness-notes)
18. [Implementation Roadmap](#18-implementation-roadmap)
19. [Risks and Mitigations](#19-risks-and-mitigations)
20. [Recommended Sprint 7B](#20-recommended-sprint-7b)

---

## 1. Executive Summary

Office AI Assistant currently attaches files and references their names in generated outputs, but **does not read file contents**. This means deterministic generators produce template-based outputs with placeholder text.

This design proposes a **local file content extraction layer** that reads text from TXT, CSV, XLSX, DOCX, and PDF files using Node.js libraries — **no Cloud AI, no OCR, no external API calls**. Extracted text is stored alongside the file record and used by deterministic generators to produce content-aware outputs.

### Design Principles

| Principle | Application |
|---|---|
| Local only | No external APIs — all processing on the server |
| No OCR | MVP extracts only embedded text; image-based PDFs require OCR (deferred) |
| Safe by default | Strict size/page/row limits; no execution of file contents |
| Fallback always | If extraction fails, generator falls back to filename-only mode |
| Auditable | Every extraction attempt logged to PlatformAuditLog |

---

## 2. Why Extraction Is Needed

| Problem | Current Behavior | With Extraction |
|---|---|---|
| Generator outputs are template placeholders | "[Key finding 1]" becomes "Revenue decreased by 12%" | Content-aware output |
| No file utilization | Files attached but unused | Text extracted and referenced |
| No value demonstration for Sombol | Demo shows file attachment but no analysis | Demo shows extraction + content |
| Blocked Cloud AI path | Risk gate requires extraction before Cloud AI | Extraction unlocks path |

---

## 3. Current State

```
User uploads file → OfficeAiFile created (metadata only)
                         ↓
Generator runs → template with placeholders
                         ↓
Output: "# Document Summary\n\nKey points:\n- [placeholder]"
```

### Current OfficeAiFile Schema (Relevant Fields)

| Field | Type | Purpose |
|---|---|---|
| `id` | String | PK |
| `taskId` | String | FK to task |
| `filename` | String | Original filename |
| `fileType` | String | pdf, docx, xlsx, etc. |
| `mimeType` | String? | MIME type |
| `storageKey` | String? | File vault reference |
| `fileHash` | String? | SHA-256 |
| `sizeBytes` | Int? | File size |
| `uploadedById` | String? | Who uploaded |

**No field for extracted content exists.**

---

## 4. Supported MVP File Types

| Type | Extension | Extraction Method | Content |
|---|---|---|---|
| Plain text | `.txt` | Read as UTF-8 | Full text |
| CSV | `.csv` | Parse rows, extract headers + sample rows | Structured summary |
| Excel | `.xlsx` | Read sheets, extract headers + data sample | Per-sheet summary |
| Word | `.docx` | Read paragraphs via XML | Full text |
| PDF (text) | `.pdf` | Extract text layer | Full text (extracted text layer only) |

### Expected Data Yield

| Type | Typical Yield | MVP Scope |
|---|---|---|
| TXT | 100% of file content | Full text |
| CSV | Headers + first 50 rows + row count | Structured summary |
| XLSX | Sheet names + column headers + first 50 rows per sheet | Structured summary |
| DOCX | All paragraph text (no formatting, tables as text) | Full text |
| PDF | All text-layer content (no images, no OCR) | Full text |

---

## 5. Explicit Non-Goals

| Item | Reason | Defer To |
|---|---|---|
| OCR (image-based PDFs) | Requires Tesseract or Cloud AI — not MVP | Post-MVP |
| Image text extraction | Same as OCR | Post-MVP |
| PDF table structure preservation | Complex — requires layout analysis | Post-MVP |
| XLSX formula evaluation | Security risk — no macro execution | Never (by design) |
| File format conversion | Unnecessary for MVP | Post-MVP |
| Malware scanning | Separate concern — requires ClamAV | Pre-production |
| Cloud AI content analysis | Risk gate not approved | After risk gate passed |
| Sentiment analysis | Unnecessary for MVP | Post-MVP |
| Language detection | User selects language explicitly | Not needed |

---

## 6. Extraction Architecture

```
                        ┌─────────────────────────────┐
                        │   File Extraction Service    │
                        │  src/lib/office-ai/          │
                        │  file-extraction-service.ts  │
                        └──────────┬──────────────────┘
                                   │
                   ┌───────────────┼───────────────┐
                   ▼               ▼               ▼
            ┌──────────┐    ┌──────────┐    ┌──────────┐
            │ TXT/CSV  │    │  XLSX    │    │DOCX/PDF  │
            │ Extractor│    │ Extractor│    │ Extractor│
            └──────────┘    └──────────┘    └──────────┘
                   │               │               │
                   ▼               ▼               ▼
            ┌──────────────────────────────────────────┐
            │        ExtractedContent (string)          │
            │  + ExtractionMetadata (type, rowCount,   │
            │    sheetCount, pageCount, warnings)       │
            └──────────────────┬───────────────────────┘
                               ▼
            ┌──────────────────────────────────────────┐
            │          OfficeAiFile.extractedContent    │
            │          OfficeAiFile.extractionMeta      │
            └──────────────────────────────────────────┘
                               │
                               ▼
            ┌──────────────────────────────────────────┐
            │     Generator uses extracted text         │
            │     (instead of filename-only)            │
            └──────────────────────────────────────────┘
```

### Flow per File Upload

```
1. File uploaded → OfficeAiFile record created (metadata only)
2. Extraction triggered (async or on-demand before generation)
3. Extractor identified by fileType
4. File read from storage provider
5. Content extracted with limits enforced
6. OfficeAiFile updated with extractedContent + extractionMeta
7. PlatformAuditLog event emitted
8. Generator retrieves extractedContent when generating output
```

---

## 7. Library Choices

| File Type | Library | npm Package | Rationale |
|---|---|---|---|
| TXT | `fs` (built-in) | None | UTF-8 file read |
| CSV | `csv-parse` | `csv-parse` | Lightweight, streaming, well-maintained |
| XLSX | `xlsx` (SheetJS) | `xlsx` | The standard for Node.js Excel parsing |
| DOCX | `mammoth` | `mammoth` | Extracts text from .docx to plain text or HTML |
| PDF | `pdf-parse` | `pdf-parse` | Extracts text layer — no rendering, no OCR |

### Library Selection Criteria

| Criteria | csv-parse | xlsx (SheetJS) | mammoth | pdf-parse |
|---|---|---|---|---|
| Bundle size | ~50KB | ~500KB | ~100KB | ~200KB |
| No native deps | ✅ | ✅ | ✅ | ✅ |
| Streaming | ✅ (CSV) | ✅ | N/A | N/A |
| Active maintenance | ✅ | ✅ | ✅ | ✅ |
| Arabic support | ✅ (UTF-8) | ✅ | ✅ | ✅ |
| PDF image/OCR | N/A | N/A | N/A | ❌ (non-goal) |

### Dependency Additions

```json
{
  "dependencies": {
    "csv-parse": "^5.x",
    "xlsx": "^0.18.x",
    "mammoth": "^1.x",
    "pdf-parse": "^1.x"
  }
}
```

---

## 8. Limits and Safety Controls

### Size Limits

| File Type | Max File Size | Max Content Length | Max Rows/Pages |
|---|---|---|---|
| TXT | 1 MB | 50,000 chars | N/A |
| CSV | 5 MB | 50,000 chars | 500 rows |
| XLSX | 10 MB | 100,000 chars | 50 sheets, 500 rows/sheet |
| DOCX | 10 MB | 100,000 chars | N/A |
| PDF (text) | 10 MB | 100,000 chars | 50 pages |

### Safety Controls

| Control | Implementation |
|---|---|
| File size check | Already exists (10 MB max for upload) — reinforced at extraction |
| Content truncation | Extracted text truncated to `maxContentLength` with warning |
| No macro execution | XLSX only reads cell values — no formulas evaluated |
| No binary execution | TXT/DOCX/PDF parsers are read-only — no execution |
| UTF-8 validation | All text validated as UTF-8; invalid sequences replaced |
| Extraction timeout | 30 seconds per file — kills hung extraction |
| Row/page limits | CSV: 500 rows; XLSX: 500 rows per sheet; PDF: 50 pages |
| No external network | All libraries work offline — no callbacks |

---

## 9. Storage Strategy

### Option Comparison

| Option | Storage Location | Pros | Cons |
|---|---|---|---|
| **A: In OfficeAiFile.extractedContent** | Database (new TEXT column) | Simple query, no extra file IO, generator reads directly | DB size grows; large content stored in rows |
| **B: Separate OfficeAiExtraction table** | Database (new model) | Normalized, separate concerns | Extra join query, slightly more complex |
| **C: File vault (new file per extraction)** | Storage provider | Large content offloaded from DB | Extra read/write to storage, need to manage lifecycle |

### Recommendation: Option A (In-Table)

Store extracted text directly in a new nullable TEXT column on `OfficeAiFile`.

**Rationale:**
- Extraction content is read with the file record in most queries
- No need for a join or extra storage read
- Generator needs content synchronously
- Extraction is write-once, read-many — DB is appropriate
- If content exceeds DB limits, fall back to filename-only mode

**Risk:** DB row size increases. Mitigation: strict content length limits (100K chars max) keep row size under control.

---

## 10. Proposed Data Model Changes

### OfficeAiFile — Additions

```prisma
model OfficeAiFile {
  // ... existing fields ...

  extractedContent   String?   @db.Text   // Extracted text content (nullable — not yet extracted)
  extractionMeta     Json?                // { type, rowCount, sheetCount, pageCount, warnings, durationMs }
  extractedAt        DateTime?            // When extraction completed (null = not yet extracted)
  extractionStatus   String?              // "pending" | "completed" | "failed" | "skipped"
}
```

### Field Details

| Field | Type | Purpose |
|---|---|---|
| `extractedContent` | `String? @db.Text` | The extracted plain text. Null until extraction runs. Truncated to 100K chars. |
| `extractionMeta` | `Json?` | Metadata about extraction: `{ type: "xlsx", rowCount: 50, sheetCount: 3, warnings: ["Truncated at 500 rows"], durationMs: 120 }` |
| `extractedAt` | `DateTime?` | When extraction completed. Null = not attempted or pending. |
| `extractionStatus` | `String?` | Status: `"pending"` (queued), `"completed"`, `"failed"`, `"skipped"` (unsupported format). |

### No New Model Needed

No separate `OfficeAiExtraction` model is proposed. The task already has `sourceFiles` with the `OfficeAiFile` relation. Adding extracted content directly to the file record is simpler and maps to how generators consume the data.

---

## 11. Service/API Design

### Proposed Functions

```typescript
// src/lib/office-ai/file-extraction-service.ts

export async function extractFileContent(fileId: string): Promise<ExtractionResult>

export async function extractFileContentSync(
  taskId: string,
  fileId: string,
  content: Buffer,
  fileType: string,
): Promise<ExtractionResult>

export function getExtractor(fileType: string): FileExtractor | null

// Individual extractors (internal)
export interface FileExtractor {
  type: string
  extract(content: Buffer, limits: ExtractionLimits): ExtractedContent
}

// Types
interface ExtractionLimits {
  maxContentLength: number   // default 100,000
  maxRows: number            // default 500
  maxSheets: number          // default 50
  maxPages: number           // default 50
  timeoutMs: number          // default 30,000
}

interface ExtractedContent {
  text: string
  meta: {
    type: string
    rowCount?: number
    sheetCount?: number
    pageCount?: number
    warnings: string[]
    durationMs: number
  }
}

interface ExtractionResult {
  success: boolean
  extractedContent?: string
  extractionMeta?: Record<string, unknown>
  error?: string
}
```

### When to Extract

| Strategy | Pros | Cons | Recommendation |
|---|---|---|---|
| **On upload** | Content ready immediately for generation | Slows upload; may extract files user never generates | ❌ Not recommended |
| **On demand before generation** | Fast upload; extract only when needed | First generation is slower | ✅ **Recommended** |
| **Background job** | Non-blocking | Requires job queue; not available yet | 🟡 Future |

**MVP:** Extract on demand — when user clicks "Generate Draft", the service checks if extraction is needed, runs it, caches result, then generates.

---

## 12. Deterministic Generator Integration

### Current Generator Flow

```
Generator called with task metadata (title, instructions, createdByName)
  → Produces template with placeholders
  → Example: "- [Key finding 1]"
```

### Proposed Generator Flow

```
Generator called with task metadata + file extraction results
  → Checks task.sourceFiles for each OfficeAiFile
  → If file.extractionStatus === "completed":
       Uses extractedContent snippet
       Replaces placeholders with real content
  → If file has no extraction:
       Leaves placeholders
       Adds note: "File attached but not yet extracted"
```

### Generator Changes

Each generator function receives an additional parameter: `files: { filename: string; fileType: string; extractedContent?: string }[]`.

| Generator | Current Output | With Extraction |
|---|---|---|
| document_summary | "- [Key point 1]" | Actual summary extracted from file text |
| excel_analysis | "Total Rows: [value]" | `rowCount` from CSV/XLSX + header names |
| report_draft | "[Executive summary]" | Content from DOCX/PDF summary |
| presentation_outline | "- [Key point]" | Content from extracted text |
| executive_summary | "[Overview]" | Content from extracted text |
| meeting_notes | "[Attendees]" | Content from extracted DOCX/TXT |

### Example: CSV Summary (Before vs After)

**Before (current):**
```
## Data Summary
| Metric | Value |
| Total Rows | [value] |
| Total Columns | [value] |
```

**After (with extraction):**
```
## Data Summary
| Metric | Value |
| Total Rows | 1,234 |
| Total Columns | 15 |

**Columns:** Date, Client, Revenue, Cost, Margin, Region, ...
**First 5 rows sample:** 2025-01-01, Client A, 50,000, 30,000, 40%, North
```

---

## 13. Audit Log Event Taxonomy

### New Event Types

| Event | Description | Severity |
|---|---|---|
| `office_ai.file.extraction_started` | Extraction of file content began | info |
| `office_ai.file.extraction_completed` | Extraction succeeded | info |
| `office_ai.file.extraction_failed` | Extraction failed | warning |
| `office_ai.file.extraction_skipped` | Extraction skipped (unsupported format or size) | info |

### PlatformAuditLog Mapping

```typescript
// Extraction completed
writePlatformAuditLog({
  productKey: "office_ai_assistant",
  action: "office_ai.file.extraction_completed",
  clientWorkspaceId,
  projectId,
  actorId: "system",
  actorType: "system",
  targetType: "OfficeAiFile",
  targetId: file.id,
  severity: "info",
  sourceSystem: "office_ai_assistant",
  sourceModel: "OfficeAiFile",
  sourceId: file.id,
  metadata: {
    governedSharedApplication: true,
    extractionType: "xlsx",
    rowCount: 50,
    durationMs: 150,
    warnings: ["Truncated at 500 rows"],
  },
})
```

---

## 14. Error Handling and Fallbacks

| Scenario | Behavior | Fallback |
|---|---|---|
| File type not supported | ExtractionStatus = "skipped" | Generator uses filename-only |
| File exceeds size limit | ExtractionStatus = "failed" | Generator uses filename-only |
| Extraction throws | ExtractionStatus = "failed" + error logged | Generator uses filename-only |
| Extracted content empty | ExtractionStatus = "completed" with empty content | Generator uses filename-only |
| Extraction times out (30s) | ExtractionStatus = "failed" | Generator uses filename-only |
| Library not installed | ExtractionStatus = "failed" | Generator uses filename-only |
| File read from storage fails | ExtractionStatus = "failed" | Generator uses filename-only |

**Rule:** Extraction failure NEVER blocks task generation. The generator always has a fallback to filename-only mode.

---

## 15. Security and Privacy Rules

| Rule | Implementation |
|---|---|
| No external API calls | All libraries work offline |
| No file content stored outside extracted field | Extracted text stored in DB; original file in file vault |
| Extraction limits enforced | Size, rows, pages — hard limits |
| No PII detection | Not in MVP — deferred to content analysis phase |
| No sensitive content logging | Extracted text NOT logged — only metadata (row count, type, duration) |
| Extraction is opt-in per file | Only files with `extractionStatus = "completed"` are used by generators |
| File content not sent to browser | Extraction runs server-side; only generator output sent to client |
| Source file not modified | Extraction is read-only — original file unchanged |

---

## 16. Verification Plan

### Verification Script

**Script:** `scripts/verify-office-ai-extraction.ts`

**Modes:** dry-run (default), apply (--apply)

**Test Cases:**

| Test | File Type | Expected Result |
|---|---|---|
| Basic TXT | `hello.txt` → "Hello World" | Full text extracted |
| CSV with headers | `data.csv` → header names + first 3 rows | Structured summary |
| CSV empty | `empty.csv` → empty content | Completed with 0 rows |
| XLSX multi-sheet | `report.xlsx` → 2 sheets + column headers | Per-sheet summary |
| DOCX formatting | `report.docx` → paragraph text | Full text (no formatting) |
| PDF with text | `doc.pdf` → text content | Full text from PDF text layer |
| PDF scanned only | `scan.pdf` (no text layer) → empty or error | Failed extraction |
| Oversize TXT | 2 MB TXT → truncated at limit | Completed with warning |
| Binary file | `image.png` → skipped | Skipped (unsupported) |

---

## 17. Production Readiness Notes

| Concern | Status | Required Before Production |
|---|---|---|
| Malware scanning | ❌ Not implemented | **Required** — file scanning needed for production |
| Extraction timeout | ✅ Proposed (30s) | Acceptable for MVP |
| Content limits | ✅ Proposed (100K chars) | Acceptable for MVP |
| Storage size growth | ⚠️ Estimated: ~100KB per extracted file × 1000 files = ~100MB | Acceptable for MVP |
| PDF rendering | ❌ Not implemented | Not needed — text extraction only |
| Arabic text support | ✅ All libraries support UTF-8 | Tested with Arabic content |
| Library license review | ⚠️ Not yet performed | **Required** before adding dependencies |

### Production Checklist

- [ ] Malware scanning solution selected (ClamAV or similar)
- [ ] Library licenses reviewed (MIT, Apache 2.0, or compatible)
- [ ] Extraction performance benchmarked (target: < 5s per file)
- [ ] Arabic extraction tested with real Arabic PDF/DOCX
- [ ] Extraction failure handling tested end-to-end
- [ ] No memory leak under concurrent extraction

---

## 18. Implementation Roadmap

### Sprint 7B: TXT/CSV Extraction (✅ Complete)

| Task | Status |
|---|---|
| Add extraction fields to `OfficeAiFile` Prisma model | ✅ Complete |
| Create `file-extraction-service.ts` | ✅ Complete |
| Install `csv-parse` dependency | ✅ Complete |
| Implement TXT extractor | ✅ Complete |
| Implement CSV extractor | ✅ Complete |
| Wire extraction into `generateOfficeAiTaskOutput()` | ✅ Complete |
| Add extraction audit events | ✅ Complete |
| Verification script | ✅ Complete |

### Sprint 7C: XLSX Extraction (✅ Complete)

| Task | Status |
|---|---|
| Install `xlsx` (SheetJS) dependency | ✅ Complete |
| Implement XLSX extractor | ✅ Complete |
| Add sheet/row limits | ✅ Complete |
| Verification updated | ✅ Complete |

### Sprint 7D: DOCX Extraction (✅ Complete)

| Task | Status |
|---|---|
| Install `mammoth` dependency | ✅ Complete |
| Implement DOCX extractor | ✅ Complete |
| Add size/warning handling | ✅ Complete |
| Verification updated | ✅ Complete |

### Sprint 7E: PDF Text-Layer Extraction (✅ Complete)

| Task | Status |
|---|---|
| Install `pdf-parse` dependency | ✅ Complete |
| Implement PDF text-layer extractor | ✅ Complete |
| Add page/failed extraction handling | ✅ Complete |
| Verification updated | ✅ Complete |

### Remaining Roadmap

| Feature | Status | Sprint |
|---|---|---|
| OCR (scanned image PDFs) | ❌ Not implemented | Post-MVP |
| Legacy `.doc` / `.xls` | ❌ Not implemented | Post-MVP |
| Malware scanning | ❌ Not implemented | Pre-production |
| Cloud AI integration | ❌ Risk gate not approved | Phase 4 |
| Local AI runtime | ❌ Not implemented | Phase 5 |

---

## 19. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PDF text extraction yields garbage for Arabic PDFs | Medium | Medium | Test with real Arabic PDFs early; improve library config |
| XLSX library bundle size | Medium | Low | Dynamic import of `xlsx` only when used |
| Extraction blocks generation (performance) | Medium | Medium | On-demand extraction with timeout; fallback to filename-only |
| Memory spike with large PDFs | Low | Medium | Stream content; limit page count to 50 |
| Library incompatibility with Next.js runtime | Low | High | Test in build step; all libraries are Node.js-compatible |

---

## 20. Recommended Sprint 7B

**Sprint 7B: Extraction Schema + TXT/CSV File Extraction**

1. Add extraction fields to `OfficeAiFile` Prisma model
2. Create `src/lib/office-ai/file-extraction-service.ts`
3. Install `csv-parse` dependency
4. Implement TXT extractor (UTF-8 read)
5. Implement CSV extractor (headers + first 50 rows + row count)
6. Add `extractFileContent()` to the service
7. Wire extraction into `generateOfficeAiTaskOutput()` — extract before generation
8. Emit PlatformAuditLog events for extraction lifecycle
9. Run validation (generate, tsc, lint, build)

**Do NOT implement:** XLSX, DOCX, PDF extraction, generator integration, or verification script — these are Sprint 7C–7E.
