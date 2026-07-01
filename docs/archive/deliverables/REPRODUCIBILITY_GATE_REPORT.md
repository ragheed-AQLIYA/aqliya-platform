# REPRODUCIBILITY GATE REPORT

**Date:** 2026-06-23  
**Author:** OpenCode Agent (P0 Reproducibility Recovery)  
**Status:** BLOCKED — cannot proceed  

---

## Gate Requirements

The reproducibility gate requires:

1. ✅ Fresh PostgreSQL + pgvector → `prisma migrate deploy`
2. ❌ `prisma db seed` (blocked by #1)
3. ❌ `npm run build` (blocked by #1, #2)
4. ❌ `npm test` (blocked by #1, #2, #3)

## Gate 1: Migration — FAILED

**Verdict:** `prisma migrate deploy` FAILS on a clean database.

Failure at migration #47 (`20260622000000_add_knowledge_candidate_createdById`):

```
ERROR: relation "KnowledgeCandidate" does not exist
```

## Gate 2: Seed — BLOCKED

**Verdict:** Cannot proceed — migrations incomplete.

## Gate 3: Build — BLOCKED

**Verdict:** Cannot proceed — database state invalid.

## Gate 4: Tests — BLOCKED

**Verdict:** Cannot proceed — build cannot run without valid database.

---

## Current Build Status (without fresh DB)

For reference, the current build status using the existing development database (`postgres:16-alpine` with `db push` schema) was verified on 2026-05-28:

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | ✅ Pass (0 errors) |
| `npm run lint` | ✅ Pass (0 warnings) |
| `npm run build` | ✅ Pass |
| `npm test` | ✅ Pass (all tests) |

**However**, these results are on an existing database that was created with `prisma db push`, NOT with `prisma migrate deploy`. The build may succeed with `db push` but fail with `migrate deploy` depending on schema drift.

---

## Risk Assessment

| Risk | Description | Severity |
|------|-------------|----------|
| Migration lineage broken | 3 tables missing from migration history | CRITICAL |
| CI uses db push, not migrate deploy | Migrations never validated in CI | HIGH |
| No seeding validated | Seed has never been tested against clean migration | HIGH |
| Build references missing tables | If build assumes KnowledgeCandidate exists, it may fail | MEDIUM |
| Test suite references missing tables | Tests may fail on missing tables | MEDIUM |

---

## Reproducibility Verdict

**REPRODUCIBLE = NO**

Evidence: `prisma migrate deploy` fails on a clean `pgvector/pgvector:pg16` database.
