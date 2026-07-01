# REPRODUCIBILITY FINAL VERDICT

**Date:** 2026-06-23  
**Status:** ✅ **REPRODUCIBILITY RESTORED**  
**Program:** P0 Repository Reproducibility Recovery (9 Phases A–I)

---

## The Problem

`prisma migrate deploy` failed on a fresh PostgreSQL 16 + pgvector database at migration #47 of 51:

```
ERROR: relation "KnowledgeCandidate" does not exist
```

Root cause: 3 models (`KnowledgeCandidate`, `KnowledgeCandidateEvidence`, `KnowledgePromotionHistory`) were added to `schema.prisma` via `prisma db push` without corresponding migration files. Migration #47 (`20260622000000_add_knowledge_candidate_createdById`) assumed the table existed and crashed. All subsequent migrations (including 5 Knowledge Foundation migrations) were blocked.

---

## The Fix

Two forward-fix migrations inserted into the timestamp gap before the broken migration:

| Migration | Created | Purpose |
|---|---|---|
| `20260621190000_create_knowledge_candidate_tables` | 82 lines SQL | Creates `KnowledgeCandidateStatus` enum, `KnowledgeCandidate`, `KnowledgeCandidateEvidence`, `KnowledgePromotionHistory` tables with all columns, indexes, and FKs |
| `20260623000000_add_knowledge_candidate_fk` | 6 lines SQL | Adds `KnowledgeCandidate.createdById → User.id` FK constraint |

Total migration count: **51 → 53**.

---

## CI/CD Hardening

Three systemic changes to prevent recurrence:

### 1. CI migration verification

```
Before: npx prisma db push --force-reset --accept-data-loss
After:  npx prisma migrate deploy && npx prisma migrate status
```

### 2. Production deployment migration step

New `migrate` job added to `deploy.yml` that runs `prisma migrate deploy` against the target database before Terraform apply.

### 3. Infrastructure alignment

| File | Change |
|---|---|
| `docker-compose.yml` | `postgres:16-alpine` → `pgvector/pgvector:pg16` |
| `docker-compose.test.yml` | `postgres:16-alpine` → `pgvector/pgvector:pg16` |
| `package.json` | `test:integration:setup` uses `prisma migrate deploy` |

---

## Fresh Database Proof

All commands executed on a brand-new `pgvector/pgvector:pg16` container with no prior data:

| # | Step | Result |
|---|---|---|
| 1 | `prisma migrate deploy` | ✅ **53/53 migrations applied** — `Database schema is up to date!` |
| 2 | `prisma db seed` | ✅ **Seed completed successfully** — all products seeded |
| 3 | `npx tsc --noEmit` | ✅ **0 errors** |
| 4 | `npm run build` | ✅ **138 routes, compiled in 48s**, 0 errors |
| 5 | `npm test` | ✅ **307 suites, 2912 tests, 0 failures** (17.6s) |

### All 9 Knowledge tables exist

```
 KnowledgeCandidate
 KnowledgeCandidateEvidence
 KnowledgeFoundationDiff
 KnowledgeFoundationRelease
 KnowledgeFoundationVersion
 KnowledgeFoundationVersionCandidate
 KnowledgePattern
 KnowledgePromotionHistory
 KnowledgeRecommendation
```

---

## Deliverables

| Deliverable | File |
|---|---|
| Migration forensics | `MIGRATION_FORENSICS_REPORT.md` |
| Recovery strategy | `KNOWLEDGE_CANDIDATE_RECOVERY.md` |
| Fresh DB migration proof | `FRESH_DB_MIGRATION_PROOF.md` |
| Fresh DB seed proof | `FRESH_DB_SEED_PROOF.md` |
| CI reproducibility audit | `CI_REPRODUCIBILITY_AUDIT.md` |
| Repository recovery plan | `REPOSITORY_RECOVERY_PLAN.md` |
| Reproducibility gate report | `REPRODUCIBILITY_GATE_REPORT.md` |
| **Final verdict** | **`REPRODUCIBILITY_FINAL_VERDICT.md`** |

---

## Remaining Gaps (No Code Changes Needed)

| Gap | Impact | Workaround |
|---|---|---|
| Terraform RDS parameter group lacks `vector` in `shared_preload_libraries` | Schema with vector columns fails on RDS | Manual `CREATE EXTENSION vector` after RDS creation |
| Existing databases created via `db push` | Migration #51–52 not tracked | `prisma migrate resolve --applied` for both new migrations |
| First production `migrate deploy` never executed | Production database may have unapplied migrations | Run with backup taken first |

---

## Verdict

**The repository is fully reproducible.** A fresh `pgvector/pgvector:pg16` database can be initialized with the standard sequence:

```bash
npx prisma migrate deploy    # 53/53 pass
npx prisma db seed           # All products seeded
npm run build                 # 138 routes, 0 errors
npm test                      # 307 suites, 2912 tests, 0 failures
```

The P0 is closed. The root cause (missing CREATE TABLE in migration lineage) is repaired. CI/CD is hardened to prevent recurrence.
