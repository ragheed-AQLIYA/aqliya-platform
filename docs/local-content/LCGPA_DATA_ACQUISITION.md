# LCGPA Official Data Acquisition Policy

**Status:** MANDATORY  
**Date:** 2026-08-21  
**Owner:** LocalContentOS Data Governance  
**Rule:** No product data enters the system without official LCGPA provenance.

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

### Current state (2026-08-21)

| Item | Status |
|------|--------|
| Product registry module | BUILT (`product-registry.ts`) |
| Provenance types | DEFINED |
| Hash computation | IMPLEMENTED |
| Version diff engine | IMPLEMENTED |
| Validation gates | IMPLEMENTED |
| Gate check | IMPLEMENTED |
| Prisma schema enhancement | NEEDS MIGRATION |
| Actual LCGPA data | NOT YET ACQUIRED |
| Official source endpoint | NEEDS IDENTIFICATION |

### Known data points

| Source | Count | Date | Notes |
|--------|-------|------|-------|
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
| Identify official LCGPA data endpoint/URL | Data team | PENDING |
| Download current official publication | Data team | PENDING |
| Compute source hash | Automated | READY |
| Parse official file | product-registry.ts | READY |
| Compute version diff | product-registry.ts | READY |
| Gate check | product-registry.ts | READY |
| Prisma migration (schema enhancement) | Database agent | PENDING |
| Write to database | Pipeline | PENDING |
| Audit log entry | Audit system | PENDING |

---

## 8. References

- LCGPA Official Documents Library
- LCGPA Product Addition Service (MyGov)
- Regulations on Preference for Local Content (MOF)
- SPA announcement: 233 products with minimum LC requirements (Aug 2026)
