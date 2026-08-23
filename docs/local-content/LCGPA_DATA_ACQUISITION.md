# LCGPA Official Data Acquisition Policy

**Status:** MANDATORY  
**Date:** 2026-08-21  
**Owner:** LocalContentOS Data Governance  
**Rule:** No product data enters the system without official LCGPA provenance.

---

> **SUPERSEDED IN PART — 2026-08-21.**
> Continuous monitoring, artifact versioning, semantic diffing, effective-date
> resolution, impact analysis, governance and rollback are now implemented by the
> **LCGPA Regulatory Intelligence Engine** at
> `src/lib/local-content/lcgpa/regulatory/`.
> See [`docs/regulatory/LCGPA_REGULATORY_INTELLIGENCE.md`](../regulatory/LCGPA_REGULATORY_INTELLIGENCE.md)
> and the [operational runbook](../regulatory/LCGPA_RUNBOOK.md).
> This document remains the statement of acquisition **policy**; the engine is
> its enforcement. The "official source endpoint" step below is still PENDING —
> see the evidence boundary in the architecture document.

---

## 1. Principle

The LCGPA Mandatory Product List is **regulatory data**. Its source of truth is the **Local Content and Government Procurement Authority (LCGPA)** — not commercial platforms, not third-party aggregators, not scraped websites.

**Rule:** Every product record in the LocalContentOS database must be traceable to an official LCGPA publication with:
- Official document reference
- SHA-256 hash of the source file
- Effective date from the official publication
- Version identifier matching LCGPA's own versioning
- Change detection against the previous version

---

## 2. Official Sources

| Source | Type | Trust Level |
|--------|------|-------------|
| LCGPA Official Documents Library | PDF/Excel publications | SOURCE_OF_TRUTH |
| LCGPA Circulars | Official announcements | SOURCE_OF_TRUTH |
| Um Al-Qura Gazette | Legal publication | SOURCE_OF_TRUTH |
| Third-party platforms (Wattan, etc.) | Cross-check only | DISCOVERY_ONLY |
| Commercial datasets | Do NOT use | BLOCKED |

### Where to find official data

1. **LCGPA website** — Official documents library
2. **LCGPA service portal** — Product addition requests
3. **Official gazette** — Legal amendments
4. **LCGPA circulars** — Sector-specific updates

---

## 3. Data Acquisition Pipeline

```
LCGPA Official Source (PDF/Excel)
        │
        ▼
[1] Download official file
        │
        ▼
[2] Compute SHA-256 hash
        │
        ▼
[3] Archive original file (raw source archive)
        │
        ▼
[4] Parse / Normalize (product-registry.ts)
        │
        ▼
[5] Validate all records
        │
        ▼
[6] Compute version diff (if previous version exists)
        │
        ▼
[7] Gate check (canImportDataset)
        │
        ▼
[8] Write to database with full provenance
        │
        ▼
[9] Audit log entry
```

### Step 1: Download Official File

- Only from official LCGPA sources
- Record the exact URL or reference number
- Record the download date and time

### Step 2: Compute Hash

```typescript
import { computeSourceHash } from "./product-registry";

const hash = computeSourceHash(fileBuffer, "mandatory-list-2026-Q2.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
// hash.sha256 = "a1b2c3d4..." (unique fingerprint)
```

### Step 3: Archive Original

Store the original file in a controlled location:
```
uploads/lcgpa-sources/
  ├── 2026-Q2/
  │   ├── mandatory-list-2026-Q2.xlsx
  │   ├── hash-manifest.json
  │   └── import-log.json
  └── 2026-Q3/
      └── ...
```

### Step 4-5: Parse and Validate

Use `product-registry.ts` to parse the official file and validate every record.

### Step 6: Version Diff

If a previous version exists, compute the diff:
```typescript
import { computeVersionDiff } from "./product-registry";

const diff = computeVersionDiff(previousRecords, newRecords, "2026-Q1", "2026-Q2");
// diff.added = [...]
// diff.removed = [...]
// diff.modified = [...]
```

### Step 7: Gate Check

```typescript
import { canImportDataset } from "./product-registry";

const gate = canImportDataset(provenance, records);
if (!gate.allowed) {
  throw new Error(`Import blocked: ${gate.reason}`);
}
```

### Step 8-9: Write and Audit

Write to database with full provenance. Create audit log entry.

---

## 4. Schema Requirements

### LcMandatoryList (existing, needs enhancement)

```prisma
model LcMandatoryList {
  id                    String    @id @default(cuid())
  version               String    @unique
  sourceUrl             String
  effectiveDate         DateTime
  productCount          Int
  sectorCount           Int
  importedAt            DateTime  @default(now())
  importedById          String?
  status                String    @default("active")
  createdAt             DateTime  @default(now())

  // NEW: Provenance fields
  sourceDocumentTitleAr String?
  sourceDocumentTitleEn String?
  sourceFileHash        String?   // SHA-256
  sourceFileSizeBytes   Int?
  sourceFileName        String?
  documentType          String?   // "mandatory_list", "circular", etc.
  gazetteReference      String?
  importMethod          String?   // "xlsx_parser", "csv_parser", etc.
  validationStatus      String?   // "pending", "validated", "failed"
  validationErrors      String?   // JSON array
  validationWarnings    String?   // JSON array
  changeSummary         String?   // JSON: { added, removed, modified counts }

  items                 LcMandatoryListItem[]
}
```

### LcMandatoryListItem (existing, needs enhancement)

```prisma
model LcMandatoryListItem {
  id                    String    @id @default(cuid())
  listId                String
  list                  LcMandatoryList @relation(...)
  productCode           String
  productNameAr         String
  productNameEn         String?
  sectorCode            String
  sectorNameAr          String
  sectorNameEn          String?
  effectiveDate         DateTime
  createdAt             DateTime  @default(now())

  // NEW: Provenance fields
  minimumLcRequirement  Float?    // 0-100% if specified
  certificateRequirement String?  // Description of required certificate
  category              String?   // Product category within sector
  recordStatus          String?   // "active", "superseded", "removed"

  @@unique([listId, productCode])
}
```

### LcMandatoryListChange (NEW)

```prisma
model LcMandatoryListChange {
  id                    String    @id @default(cuid())
  fromVersionId         String
  toVersionId           String
  productCode           String
  changeType            String    // "added", "removed", "modified"
  productNameAr         String
  previousData          String?   // JSON snapshot of previous record
  newData               String?   // JSON snapshot of new record
  changedFields         String?   // JSON array of field names
  createdAt             DateTime  @default(now())

  @@index([fromVersionId])
  @@index([toVersionId])
  @@index([productCode])
  @@index([changeType])
}
```

---

## 5. What We Know Today

### Current state (2026-08-21) — ACQUISITION COMPLETE

| Item | Status |
|------|--------|
| Product registry module | BUILT (`product-registry.ts`) |
| Provenance types | DEFINED |
| Hash computation | IMPLEMENTED |
| Version diff engine | IMPLEMENTED |
| Validation gates | IMPLEMENTED |
| Gate check | IMPLEMENTED |
| Prisma schema enhancement | NEEDS MIGRATION |
| Official LCGPA data | **ACQUIRED** |
| Official source endpoint | **IDENTIFIED** |

### Acquired Official Datasets

| # | File | SHA-256 | Size | Products | Date |
|---|------|---------|------|----------|------|
| 1 | `gov-entities-mandatory-list-july-2026.xlsx` | `93F3E1F4...D632` | 461,503 B | 1,984 | 2026-08-21 |
| 2 | `state-owned-companies-mandatory-list-july-2026.xlsx` | `F613722D...DFC` | 419,723 B | 1,985 | 2026-08-21 |
| 3 | `minimum-lc-requirements-july-2026.xlsx` | `ACEC6451...673F` | 117,819 B | 1,198 | 2026-08-21 |

**Source:** `https://lcgpa.gov.sa/p/ar_SA/MandatoryListNationalProducts/Documents`
**Download method:** Playwright browser (session-authenticated)
**Archive location:** `uploads/lcgpa-sources/2026-Q3/`

### Sector Breakdown (File #1 — Gov Entities)

| Sector (Arabic) | Product Count |
|-----------------|--------------|
| المستلزمات الطبية | 585 |
| البناء و التشييد | 386 |
| الأدوية و المستحضرات الطبية | 366 |
| الأثاث | 261 |
| الأغذية و المنتجات الزراعية | 95 |
| المواد الكيميائية و الاسمدة | 77 |
| معدات ولوازم شخصية ومنزلية | 55 |
| النقل و الخدمات اللوجستية | 45 |
| مستهلكات النظافة | 19 |
| تقنية المعلومات | 14 |
| الأمن السيبراني | 12 |
| المنتجات الاستهلاكية الورقية | 12 |
| القرطاسية والأدوات المكتبية | 20 |
| المنتجات الاستهلاكية البلاستيكية | 24 |
| الأعمال الفنية | 8 |
| المعدات و اللوازم الرياضية | 5 |
| **Total** | **1,984** |

### Minimum LC Requirements (File #3)

| Year | Products with Min LC |
|------|---------------------|
| 2026 | 2 |
| 2027 | 233 |
| 2028 | 1,198 (all) |
| 2029 | 1,198 (all) |
| 2030 | 1,198 (all) |
| 2031 | 977 |

### Known data points

| Source | Count | Date | Notes |
|--------|-------|------|-------|
| LCGPA Gov Entities List | 1,984 | July 2026 | Official, SHA-256 verified |
| LCGPA State-Owned List | 1,985 | July 2026 | Official, SHA-256 verified |
| LCGPA Min LC Requirements | 1,198 | July 2026 | Official, SHA-256 verified |
| Previous snapshot | 1,444+ | Unknown | May be outdated |
| Wattan.co (cross-check only) | 1,749 | April 2026 | Third-party, NOT source of truth |
| SPA announcement | 233 new | Aug 2026 | New minimum LC requirements |

### The actual count may differ

The number of products in the Mandatory List changes with each LCGPA publication. We do NOT hardcode a count. The system tracks:
- Products added between versions
- Products removed between versions
- Products modified between versions
- Effective dates for each change

---

## 6. Blocking Rules

The following are BLOCKED in the pipeline:

1. **No import without source hash** — Every file must be SHA-256 hashed
2. **No import without official source reference** — Every dataset must reference an LCGPA document
3. **No import without validation** — All records must pass validation
4. **No import without provenance record** — Complete audit trail required
5. **No manual data entry of product records** — Only through the pipeline
6. **No third-party data as source** — Only LCGPA official publications

---

## 7. Next Steps

| Step | Owner | Status |
|------|-------|--------|
| Identify official LCGPA data endpoint/URL | Data team | **DONE** |
| Download current official publication | Data team | **DONE** |
| Compute source hash | Automated | **DONE** |
| Parse official file | product-registry.ts | **DONE** |
| Compute version diff | product-registry.ts | READY |
| Gate check | product-registry.ts | READY |
| Map xlsx sectors to engine LCGPA_SECTORS | Data team | PENDING |
| Prisma migration (schema enhancement) | Database agent | PENDING |
| Write to database with provenance | Pipeline | PENDING |
| Audit log entry | Audit system | PENDING |
| Build UI for mandatory list display | Frontend | PENDING |

---

## 8. References

- LCGPA Official Documents Library: `https://lcgpa.gov.sa/p/ar_SA/MandatoryListNationalProducts/Documents`
- File #1: Gov Entities Mandatory List (يوليو 2026) — SHA-256: `93F3E1F4533DA8D12644C0C9B964C4712972B1EADE347D805458ACA0D0D1D632`
- File #2: State-Owned Companies Mandatory List (يوليو 2026) — SHA-256: `F613722D4017C8B0B2B471B99FBA1C61D53BF5F4B29266A4D901671419E83DFC`
- File #3: Minimum LC Requirements (يوليو 2026) — SHA-256: `ACEC6451903348B92484C4E0280D26A076E2321219D565E1253A0AA9D111673F`
- LCGPA Product Addition Service (MyGov)
- Regulations on Preference for Local Content (MOF)
- SPA announcement: 233 products with minimum LC requirements (Aug 2026)

### Provenance Evidence

- **Download date:** 2026-08-21
- **Download method:** Playwright browser (session-authenticated, not API)
- **Archive location:** `uploads/lcgpa-sources/2026-Q3/`
- **Hash manifest:** See SHA-256 hashes above
- **Sector mapping:** 16 xlsx sectors → 38 engine sectors (S01-S23 + P01-P15) requires mapping
- **Data integrity:** All 3 files parsed successfully, product counts verified
