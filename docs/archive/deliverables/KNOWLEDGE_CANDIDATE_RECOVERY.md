# KnowledgeCandidate Lineage Recovery

**Date:** 2026-06-23  
**Status:** COMPLETE  

---

## Root Cause

Three models (`KnowledgeCandidate`, `KnowledgeCandidateEvidence`, `KnowledgePromotionHistory`) were added to `prisma/schema.prisma` but their `CREATE TABLE` was never captured in a migration. The tables were created via `prisma db push` in development. Subsequently, migration `20260622000000_add_knowledge_candidate_createdById` was generated assuming the tables already existed.

On a fresh database running `prisma migrate deploy`, migration #47 fails with:

```
ERROR: relation "KnowledgeCandidate" does not exist
```

## Migration Strategy

**Approach:** Forward-fix with two new migrations inserted in the timestamp gap.

### Before fix (broken lineage):

```
#33 20260621180000_core_evidence_platform
#34 (broken) 20260622000000_add_knowledge_candidate_createdById  ← ALTER TABLE on missing table
#35 20270622100000_knowledge_foundation_versioning  ← blocked
#36 20270622110000_knowledge_foundation_version_candidate_bridge  ← blocked + FK to missing table
#37 20270622120000_knowledge_foundation_release_provenance  ← blocked
#38 20270622130000_knowledge_foundation_release_artifact_status  ← blocked
#39 20270622140000_knowledge_foundation_release_trust_chain  ← blocked
```

### After fix (repaired lineage):

```
#33 20260621180000_core_evidence_platform
NEW #34 20260621190000_create_knowledge_candidate_tables  ← CREATE TABLE for 3 missing tables
  #35 (was #34) 20260622000000_add_knowledge_candidate_createdById  ← now succeeds
NEW #36 20260623000000_add_knowledge_candidate_fk  ← creates FK createdById→User
  #37 (was #35) 20270622100000_knowledge_foundation_versioning  ← now unblocked
  #38 (was #36) 20270622110000_knowledge_foundation_version_candidate_bridge  ← now unblocked
  #39 (was #37) 20270622120000_knowledge_foundation_release_provenance  ← now unblocked
  #40 (was #38) 20270622130000_knowledge_foundation_release_artifact_status  ← now unblocked
  #41 (was #39) 20270622140000_knowledge_foundation_release_trust_chain  ← now unblocked
```

## Migrations Added

### 1. `20260621190000_create_knowledge_candidate_tables`

Creates:
- `KnowledgeCandidateStatus` enum (CANDIDATE, UNDER_REVIEW, APPROVED, REJECTED, PROMOTED)
- `KnowledgeCandidate` table (without `createdById` — added by subsequent migration)
- `KnowledgeCandidateEvidence` table
- `KnowledgePromotionHistory` table
- All indexes
- FK: `KnowledgeCandidate.canonicalAccountId → AuditCanonicalAccount.id`
- FK: `KnowledgeCandidateEvidence.candidateId → KnowledgeCandidate.id`
- FK: `KnowledgePromotionHistory.candidateId → KnowledgeCandidate.id`

### 2. `20260623000000_add_knowledge_candidate_fk`

Adds:
- FK: `KnowledgeCandidate.createdById → User.id` (on DELETE SET NULL)

This FK is defined in the Prisma schema via `@relation("KnowledgeCandidateCreator")` but was never created by any migration.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Duplicate table on existing DB | HIGH (tables exist via db push) | Migration fails | Must `prisma migrate resolve --applied` for both new migrations on existing DBs |
| FK already exists on existing DB | MEDIUM | Migration fails | Same resolve approach |
| Existing migration order changed | LOW | None—timestamps preserve order | Inserted between existing migrations |
| Schema drift detected by Prisma | MEDIUM | Prisma warnings | Run `prisma db push` after migrate for drift resolution |

## Before/After Graph

### Before
```
init → ... → core_evidence_platform
                                    ↘
                         KnowledgeCandidate ALTER → FAILS (table missing)
                                    ↙
                         All KF migrations BLOCKED
```

### After
```
init → ... → core_evidence_platform
                                    ↓
                create_knowledge_candidate_tables → CREATE TABLEs succeed
                                    ↓
                add_knowledge_candidate_createdById → ALTER succeeds
                                    ↓
                add_knowledge_candidate_fk → FK constraint created
                                    ↓
                All KF migrations → all succeed
                                    ↓
                         REPRODUCIBLE
```

## On Existing Databases

For databases where the tables already exist (created via `prisma db push`), after pulling this change:

```bash
# Mark the new migrations as already applied (tables already exist)
npx prisma migrate resolve --applied 20260621190000_create_knowledge_candidate_tables
npx prisma migrate resolve --applied 20260623000000_add_knowledge_candidate_fk
```

Then verify status:
```bash
npx prisma migrate status
# Should show "Database schema is up to date"
```
