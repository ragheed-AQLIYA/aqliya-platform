# Migration Forensics Report — KnowledgeCandidate Lineage

**Generated:** 2026-06-23  
**Scope:** Phase F — verify KnowledgeCandidate creation migration exists and ordering is valid  
**Method:** Source grep + migration SQL review + schema cross-check

---

## Executive Finding

**KNOWLEDGE_CANDIDATE_LINEAGE = BROKEN**

No migration in `prisma/migrations/` contains `CREATE TABLE "KnowledgeCandidate"`. Two migrations assume the table already exists.

---

## Evidence 1 — Grep: No CREATE TABLE

```bash
rg 'CREATE TABLE.*KnowledgeCandidate' prisma/migrations/
→ No matches
```

---

## Evidence 2 — All migration references to KnowledgeCandidate

| Migration | Timestamp order | SQL action |
|-----------|-----------------|------------|
| `20260622000000_add_knowledge_candidate_createdById` | ~40/51 | `ALTER TABLE "KnowledgeCandidate" ADD COLUMN "createdById"` |
| `20270622110000_knowledge_foundation_version_candidate_bridge` | ~48/51 | `FOREIGN KEY ("candidateId") REFERENCES "KnowledgeCandidate"("id")` |

Full `20260622000000` migration:

```sql
-- Add createdById to KnowledgeCandidate for creator provenance
ALTER TABLE "KnowledgeCandidate" ADD COLUMN "createdById" TEXT;
CREATE INDEX "KnowledgeCandidate_createdById_idx" ON "KnowledgeCandidate"("createdById");
```

Full FK from `20270622110000`:

```sql
ALTER TABLE "KnowledgeFoundationVersionCandidate" ADD CONSTRAINT "KnowledgeFoundationVersionCandidate_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "KnowledgeCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Evidence 3 — Schema defines model; migrations do not create it

`prisma/schema.prisma` (lines ~3612–3642) defines:

- `enum KnowledgeCandidateStatus`
- `model KnowledgeCandidate` (full column set including `createdById`)
- `model KnowledgeCandidateEvidence`
- Related relations to `KnowledgePromotionHistory`, `KnowledgeFoundationVersionCandidate`

**None** of these tables/enums appear in any `migration.sql` except ALTER/FK above.

---

## Evidence 4 — Related models also missing CREATE migrations

Grep for `KnowledgeCandidateEvidence`, `KnowledgePromotionHistory`, `KnowledgeCandidateStatus` in `prisma/migrations/`:

```text
KnowledgeCandidateEvidence → no CREATE in migrations
KnowledgePromotionHistory → no CREATE in migrations
KnowledgeCandidateStatus → no CREATE TYPE in migrations
```

These exist only in:

- `prisma/schema.prisma` (canonical model)
- `scripts/platform/tabletop-minimal-schema.sql` (recovery workaround — **not** migration lineage)

---

## Evidence 5 — Ordering violation

| Check | Result |
|-------|--------|
| Creation migration exists | **NO** |
| CREATE TABLE in migration history | **NO** |
| ALTER before CREATE | **N/A — CREATE never exists; ALTER at 20260622000000 is first reference** |
| FK before CREATE | **YES — 20270622110000 FK references missing table** |
| Fresh DB can create KnowledgeCandidate via migrations | **NO** |

Chronological problem:

```
20260622000000  ALTER KnowledgeCandidate     ← table must exist (it does not)
     ...
20270622110000  FK → KnowledgeCandidate     ← table must exist (it does not)
```

---

## Evidence 6 — How production/local DBs likely got the table

| Path | Evidence |
|------|----------|
| `prisma db push` | CI uses push, not deploy (`.github/workflows/ci.yml` L48–52) |
| Manual SQL | `scripts/platform/tabletop-minimal-schema.sql` creates `KnowledgeCandidate` with `CREATE TABLE IF NOT EXISTS` |
| Vercel production | `vercel.json` build runs `prisma generate` only — DB schema managed separately; likely push or manual history |

---

## Evidence 7 — KF migrations that DO exist (for contrast)

| Migration | Creates |
|-----------|---------|
| `20270622100000_knowledge_foundation_versioning` | `KnowledgeFoundationVersion`, `KnowledgeFoundationRelease`, `KnowledgeFoundationDiff` |
| `20270622110000_knowledge_foundation_version_candidate_bridge` | `KnowledgeFoundationVersionCandidate` (+ FK to missing `KnowledgeCandidate`) |
| `20270622120000_knowledge_foundation_release_provenance` | Release provenance columns |
| `20270622130000_knowledge_foundation_release_artifact_status` | Artifact status enum/table |
| `20270622140000_knowledge_foundation_release_trust_chain` | Trust chain fields |

KF versioning tables have proper CREATE migrations. Knowledge mining tables do not.

---

## Recommended Fix (not executed — P0 evidence only)

Add a new migration **before** `20260622000000_add_knowledge_candidate_createdById` containing:

1. `CREATE TYPE "KnowledgeCandidateStatus" AS ENUM (...)`
2. `CREATE TABLE "KnowledgeCandidate" (...)`
3. `CREATE TABLE "KnowledgeCandidateEvidence" (...)`
4. `CREATE TABLE "KnowledgePromotionHistory" (...)`
5. Indexes and FKs to `AuditCanonicalAccount`, `User`

Then re-run fresh DB `migrate deploy` on `pgvector/pgvector:pg16`.

**Caution:** Timestamp ordering may require renaming/squashing strategy — engineering decision outside P0 scope.

---

## Verdict

| Check | Status |
|-------|--------|
| Creation migration exists | **FAIL** |
| CREATE TABLE in history | **FAIL** |
| No ALTER before CREATE | **FAIL** (ALTER exists; CREATE does not) |
| Fresh DB reproducibility | **FAIL** |

**KNOWLEDGE_CANDIDATE_LINEAGE = BROKEN**
