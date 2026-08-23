# LCGPA Regulatory Schema Audit (P0.1)

**Date:** 2026-08-22
**Question asked:** not "does `prisma migrate` succeed?" but **"can historical
regulatory state be lost or overwritten?"**
**Answer before the audit:** yes, trivially. **After:** no — and a test now
enforces it.

---

## 1. The finding that mattered

Seven relations pointed at `LcRegulatorySource` with `onDelete: Cascade`.

```sql
DELETE FROM "LcRegulatorySource" WHERE id = 'lcgpa-mandatory-list-government';
```

That single statement would have destroyed, silently and irrecoverably:

| Cascaded away | Why it matters |
|---|---|
| every `LcRegulatoryCheck` | the monitoring record — proof of when we looked |
| every `LcRegulatoryArtifact` | the SHA-256 provenance of every official file |
| every `LcRegulatoryDataset` | every normalized regulatory snapshot |
| → every `LcRegulatoryProduct` | (second-order cascade) every product fact |
| → every `LcRegulatoryChange` | (second-order cascade) every diff ever computed |
| every `LcRegulatoryCase` | every approval and rejection |
| every `LcRegulatoryAlert` | every warning ever raised |
| every `LcRegulatoryChangeEvent` | **the entire change journal** |

§34 says regulatory change events are never deleted. §8 says artifacts are never
overwritten. A cascade honours neither.

---

## 2. Findings and resolutions

| # | Severity | Finding | Resolution |
|---|---|---|---|
| F1 | **CRITICAL** | 6 relations `LcRegulatorySource → *` used `onDelete: Cascade` | → `Restrict`. A source that has ever been checked cannot be deleted. |
| F2 | **CRITICAL** | `LcRegulatoryChange.datasetAfter` used `Cascade` — deleting a dataset erased the proof of what changed | → `Restrict` |
| F3 | **HIGH** | `LcRegulatoryChange.datasetBefore` used `SetNull` — history rewritten in place, the "before" side vanishing with no trace | → `Restrict` |
| F4 | **HIGH** | `LcRegulatoryProduct.dataset` used `Cascade` | → `Restrict` |
| F5 | **MEDIUM** | `LcRegulatoryConflict.sourceAId/sourceBId` were loose strings with no foreign key — a conflict could dangle after its source vanished | Real FKs (`ConflictSourceA` / `ConflictSourceB`), both `Restrict` |
| F6 | **HIGH** | `LcCalculationRun.regulatoryDatasetVersion` was a loose string. A dataset that had produced calculations could be deleted, orphaning them | Real FK to `LcRegulatoryDataset.datasetVersion`, `Restrict`. **A dataset that produced a calculation can never be deleted.** |
| F7 | **MEDIUM** | No product-version identity. "Which product version did you use?" had no precise answer | `productVersionId` — a deterministic digest of the dataset version plus every normalized field, indexed |
| F8 | **MEDIUM** | Impact assessments lived as Json on the case, so "14 calculations affected" was not queryable | New `LcRegulatoryImpactAssessment` with typed counts and indexes |
| F9 | **HIGH** | Effective dates were plain columns with no source | New `LcRegulatoryEffectiveDateEvidence` — see [P0.7](#4-p07-effective-date-evidence) |
| F10 | **MEDIUM** | The sector code was the worksheet name — an invented official identifier | `sectorCode` is now nullable and always `null`; the published Arabic name lives in `sectorNameAr`; index moved to `sectorNameAr` |
| F11 | **LOW** | Missing temporal index for product lookups | `@@index([productCode, effectiveFrom])` |
| F12 | — | A duplicate `LcRegulatoryAuditEvent` table was considered | **Rejected.** The platform already has `PlatformAuditLog` + `HashChainEntry` with hash-chain verification. §40 forbids a parallel framework; the regulatory audit trail writes there. |

---

## 3. What now guarantees immutability

**Referential.** No `Cascade` and no `SetNull` remain anywhere in the twelve
regulatory models. Every relation is `Restrict`. Deleting a source, artifact or
dataset that anything else references now raises a foreign-key violation instead
of quietly succeeding.

**Content-addressed.** `@@unique([sourceId, sha256])` on artifacts means the same
bytes from the same source are one row, forever. A changed hash is a new row,
never an update.

**Application-level.** `persistArtifact` updates only `status`/`blockedReason`;
`persistDataset` writes products once and thereafter updates only lifecycle
columns; `persistCheck`, `persistDiff` and `persistConflicts` use create-only or
`skipDuplicates`; `persistEvidence` permits exactly one mutation — marking a
record superseded.

**Enforced by test.** `__tests__/schema-integrity.test.ts` parses
`prisma/schema.prisma` and fails the build if a `Cascade` or `SetNull` is
re-introduced into any regulatory model, if a relation loses `Restrict`, or if
the calculation→dataset foreign key disappears.

### Residual risk, stated plainly

`Restrict` stops the database from cascading. It does not stop a privileged
operator from issuing `DELETE` in the right order, or `UPDATE` on an immutable
column. Closing that requires database-level triggers or revoked grants on the
regulatory tables, which is a **deployment decision, not a schema one** — the
application's role cannot both write and be denied deletion. Recommended SQL for
the DBA is in §5 below; it is not applied by the migration, because revoking
rights from the application role is a production change I will not make blind.

---

## 4. P0.7 effective-date evidence

An effective date is a regulatory fact with its own source. It is never copied
onto a product because an announcement mentioned it.

```
LcRegulatoryEffectiveDateEvidence
├── sourceId          which source says so
├── artifactSha256    which file says so, if a file does
├── scope             PRODUCT | COHORT | DATASET
├── cohortLabel       the cohort as published, e.g. "1 أغسطس 2027م"
├── productCodes      only when the source names them
├── effectiveFrom
├── confidence        VERIFIED | CORROBORATED | ASSERTED | DISPUTED
├── evidence          document reference, announcement id, ticket
├── recordedById      a real actor
└── supersededById    superseded, never edited
```

**Precedence:** confidence first, then specificity. LCGPA's own words in a TIER 1
artifact (`VERIFIED`) outrank an operator's assertion (`ASSERTED`) whatever its
scope. `DISPUTED` and superseded records never apply. When nothing applies the
answer is `UNKNOWN` — never a guess.

**The 233-product cohort is modelled as two claims, not one fact:**

| Claim | Source | Says | Confidence |
|---|---|---|---|
| A | SPA N2514218 (2026-02-17) | 233 products from **2026-08-01** | `CORROBORATED` |
| B | July 2026 workbook, `acec6451…` | product 2118 from **2027-08-01** | `VERIFIED` |

`detectEvidenceConflicts()` surfaces the disagreement; `resolveEffectiveDate()`
lets the TIER 1 workbook win for the products it actually names. Both claims stay
on record. Neither is deleted, and "233" is never the system's product count —
that always comes from a named dataset version.

---

## 5. Recommended database-level hardening (for the DBA, not applied)

```sql
-- Deny the application role the ability to erase regulatory history.
REVOKE DELETE ON
  "LcRegulatoryArtifact", "LcRegulatoryDataset", "LcRegulatoryProduct",
  "LcRegulatoryChange", "LcRegulatoryChangeEvent", "LcRegulatoryCheck",
  "LcRegulatoryEffectiveDateEvidence", "LcRegulatoryImpactAssessment"
FROM <application_role>;

-- Make the immutable columns immutable in fact, not only by convention.
CREATE OR REPLACE FUNCTION lcgpa_reject_artifact_mutation() RETURNS trigger AS $$
BEGIN
  IF NEW.sha256 IS DISTINCT FROM OLD.sha256
     OR NEW.size IS DISTINCT FROM OLD.size
     OR NEW."acquiredAt" IS DISTINCT FROM OLD."acquiredAt" THEN
    RAISE EXCEPTION 'LCGPA artifact provenance is immutable (id=%)', OLD.id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER lcgpa_artifact_immutable
  BEFORE UPDATE ON "LcRegulatoryArtifact"
  FOR EACH ROW EXECUTE FUNCTION lcgpa_reject_artifact_mutation();
```

Apply after reviewing which role the application connects as.

---

## 6. Migration status

The schema validates and the migration SQL has been **generated and reviewed**:

```
prisma/migrations/20260822000000_lcgpa_regulatory_intelligence/migration.sql
```

### Verified properties of the generated SQL

| Property | Result |
|---|---|
| `CREATE TABLE` | 19 (12 regulatory + 7 pre-existing LCGPA engine tables never migrated) |
| `CREATE INDEX` / `CREATE UNIQUE INDEX` | 77 / 6 |
| `ADD CONSTRAINT` | 22 |
| `ADD COLUMN` | 3 statements, all on pre-existing tables, all nullable or defaulted |
| `DROP TABLE` / `DROP COLUMN` / `TRUNCATE` | **0 — the migration is purely additive** |
| `LcRegulatory*` foreign keys with `ON DELETE CASCADE` | **0** |
| `LcRegulatory*` foreign keys with `ON DELETE RESTRICT` | **15 — all of them** |
| `LcCalculationRun_regulatoryDatasetVersion_fkey` | `ON DELETE RESTRICT` — a dataset that produced a calculation can never be deleted |

The schema-level guarantee reached the SQL. That was the thing worth checking.

### It has NOT been applied, and here is why

The configured development database (`localhost:5432/aqliya`) is **drifted**:

| | |
|---|---|
| Tables in `public` | 238 |
| Rows in `_prisma_migrations` | **22** |
| Migration folders on disk | **58** |
| `LcRegulatory*` tables present | 0 |

36 migrations exist on disk but were never recorded as applied — the schema was
almost certainly advanced with `db push` at some point. In that state
`prisma migrate dev` detects drift and offers to **reset the database**, dropping
all 238 tables. That is a destructive action on a database this work did not
create, so it was not run.

This drift **predates the regulatory engine** and is a separate decision. Three
safe paths, in the [runbook](./LCGPA_RUNBOOK.md) §0:

1. **Apply just this migration** — `prisma db execute --file <migration.sql>`.
   Additive and verified above, but leaves the history table further behind.
2. **Baseline first** — `prisma migrate resolve --applied <each recorded migration>`
   until history matches, then `prisma migrate deploy`. The clean fix.
3. **Staging/production** — always `prisma migrate deploy`, never `migrate dev`.

After migrating, consider the database-level hardening in §5.
