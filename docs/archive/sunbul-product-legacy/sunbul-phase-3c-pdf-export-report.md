# Sunbul Phase 3C — Approved Case PDF Export

**Date:** 2026-05-18
**Status:** Complete
**Validation:** ✅ `npx tsc --noEmit` | ✅ `npm run lint` | ✅ `npx tsx scripts/validate-sunbul-e2e.ts` (54/54) | ✅ `npm run build`

---

## Purpose

Implement PDF export for approved/archived Sunbul records. This completes the core value chain: create → document → review → approve → export. The export includes case metadata, document references, review history, audit trail summary, and a governance disclaimer.

---

## Files Created

| File | Purpose |
|---|---|
| `src/lib/sunbul/export/pdf-export.ts` | pdfkit-based PDF generation — case info, docs, reviews, audit trail, disclaimer |
| `src/lib/sunbul/export/index.ts` | `exportSunbulRecord()` — orchestrates data fetch, access control, audit event |
| `src/app/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf/route.ts` | GET route — validates access, returns PDF as attachment |

## Files Modified

| File | Change |
|---|---|
| `src/components/sunbul/sunbul-record-detail.tsx` | Replaced export placeholder with download link for Approved/Archived records; shows blocked message for Draft/UnderReview |
| `scripts/validate-sunbul-e2e.ts` | Added Scenario 8 (7 PDF export tests) |

---

## Export Flow

```
Browser                          API Route                        Sunbul Export Service
  │                                 │                                     │
  ├─ GET /api/sunbul/clients/ ──────┤                                     │
  │   [clientId]/records/           │                                     │
  │   [recordId]/export/pdf         │                                     │
  │                                 ├─ requireClientAccess(clientId) ─────┤
  │                                 ├─ find record + validate status ─────┤
  │                                 ├─ fetch client, docs, reviews, audit─┤
  │                                 ├─ generateSunbulPdf() ──────────────┤
  │                                 │   └─ pdfkit → Buffer               │
  │                                 ├─ create audit event ───────────────┤
  │                                 └─ return NextResponse(PDF) ──────────┤
  ├─ PDF download ──────────────────┤                                     │
```

## Export Eligibility

| Status | Exportable | UI Shows |
|---|---|---|
| **Approved** | ✅ Yes | Download link |
| **Archived** | ✅ Yes | Download link |
| **Draft** | ❌ No | "لا يمكن تصدير القضية قبل الاعتماد" |
| **UnderReview** | ❌ No | "لا يمكن تصدير القضية قبل الاعتماد" |

## Permission Rules

| Role | Export Approved | Export Archived |
|---|---|---|
| PlatformAdmin | ✅ | ✅ |
| Operator | ✅ | ✅ |
| Reviewer | ✅ | ✅ |

All roles with client access may export — export is read-only and always audited.

## PDF Content

### Sections

| Section | Content |
|---|---|
| Header | سنبل — تقرير قضية سنبل, export date/time |
| Case Information | Title, ID, client name, status, created/submitted/approved/archived dates |
| Description | Record description or "لا يوجد وصف" |
| Documents | File name, type, size, date (no raw storage paths) |
| Reviews | Status (اعتماد/إرجاع), notes, date |
| Audit Trail | Recent events with Arabic labels (إنشاء القضية, إرسال للمراجعة, etc.) |
| Governance Disclaimer | Arabic text: "هذا التقرير يعرض بيانات القضية... الإنسان يقرر، والدليل يحكم" |

### PDF Details

- Library: **pdfkit** (already installed, no new dependencies)
- Page size: A4
- Font: Helvetica (built into pdfkit)
- Language: Arabic-first RTL layout
- Filename: `sunbul_record_{recordId_prefix}.pdf`
- MIME: `application/pdf`

## Audit Event

Export writes a `RECORD_ARCHIVED` audit event with metadata `{ action: "exported", format: "pdf", filename, sizeBytes }`. A dedicated export audit action is not yet in the `SunbulAuditAction` enum.

---

## Validation Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (133 pre-existing warnings) |
| `npx tsx scripts/validate-sunbul-e2e.ts` | ✅ **54/54 tests passed** (47 original + 7 export) |
| `npm run build` | ✅ Compiled. New route: `/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf` |

---

## E2E Export Tests

| Test | Result |
|---|---|
| PDF export returns a Buffer | ✅ |
| PDF has content (2704 bytes) | ✅ |
| PDF starts with `%PDF` header | ✅ |
| Export allowed for status: Approved | ✅ |
| Export allowed for status: Archived | ✅ |
| Export blocked for status: Draft | ✅ |
| Export blocked for status: UnderReview | ✅ |

---

## Known Limitations

1. **No export audit action** — `RECORD_ARCHIVED` is reused with metadata `{ action: "exported" }` since no `RECORD_EXPORTED` action exists in `SunbulAuditAction` enum
2. **No Excel export** — Only PDF is supported
3. **No embedded files** — Documents are listed by name/type/size only; actual file content is not embedded in the PDF
4. **Basic layout** — No tables, no page numbers. pdfkit is used in its simplest form
5. **Arabic RTL** — pdfkit has limited RTL support; Arabic text renders left-to-right with correct characters but may not align perfectly for mixed content

---

## Next Recommended Task

**Pilot Preparation** — With the complete MVP workflow validated (create → document → review → approve → export → archive), the next step is to harden for a controlled pilot: add user management UI, client creation UI, email notifications, and prepare pilot documentation.
