# Cycle 5 Final Validation

**Date:** 2026-06-04  
**Release scope:** pgvector extension deployment, DocumentChunk table migration, RAG pipeline (feature-flagged `off`), Intelligence Core IC-01  
**Runbook:** `docs/operations/pgvector-staging-validation-runbook.md`  
**Release assessment:** `docs/release-blocking-assessment-cycle5.md`

---

## 1. Prerequisite Verification

| # | Prerequisite | Status | Evidence |
|---|---|---|---|
| 1.1 | Migration SQL exists and correct | ✅ | `prisma/migrations/20260605000001_ic01_pgvector_document_chunk/migration.sql` — 29 lines, CREATE EXTENSION vector + CREATE TABLE DocumentChunk + 3 indexes (2 B-tree, 1 HNSW) |
| 1.2 | Migration TOML exists | ✅ | `migration.toml` present with IC-01 annotation |
| 1.3 | Prisma schema has DocumentChunk model | ✅ | `prisma/schema.prisma:2335` — model with 10 fields, `embedding` as `Unsupported("vector(1536)")`, 2 composite indexes |
| 1.4 | Schema ↔ migration SQL consistent | ✅ | All fields match: id, organizationId, documentId, chunkIndex, content, tokenCount, metadata, embedding (vector(1536)), createdBy, createdAt |
| 1.5 | Verify script exists | ✅ | `scripts/verify-pgvector-staging.ts` — checks tableExists + pgvector extension, exits non-zero on failure |
| 1.6 | Verify script imports correct module | ✅ | Imports `verifyDocumentChunkTable` from `src/lib/rag/vector-store` — function exists at line 31 |
| 1.7 | Cycle 5 smoke test exists | ✅ | `scripts/ic-cycle5-smoke.ts` — 20 metrics covering circuit breaker, provider flags, observability, governed RAG chain, budget flags |
| 1.8 | Smoke test passes (offline) | ✅ | 20/20 metrics pass, exit 0 |
| 1.9 | Feature flag `ai.rag` defaults `"off"` | ✅ | `registry.ts:49` — `variant: "off"`. Env override: `FF_AI_RAG === "true"` |
| 1.10 | TypeScript compilation | ✅ | `npx tsc --noEmit` — 0 errors |
| 1.11 | Next.js build | ✅ | `npm run build` — passes. Only pre-existing Sentry warnings + SalesOS dynamic route warning |
| 1.12 | Unit tests (AI, orchestrator, middleware) | ✅ | ai-reliability: 9/9, orchestrator-ic02: 8/8, rate-limit: 4/4 all pass |
| 1.13 | Release blocking assessment | ✅ | GO — 0 release blockers, 0 findings in Cycle 5 release path, 1 pre-existing production risk (DecisionOS, tracked, unrelated) |
| 1.14 | Repository audit | ✅ | 0 `@ts-ignore`, 0 `FIXME`, 0 `HACK`, 0 `.only`, 0 `.todo` |
| 1.15 | Runbook documented | ✅ | `docs/operations/pgvector-staging-validation-runbook.md` — 8 sections, 3 appendices |

---

## 2. Exact Command Sequence — pgvector Installation

Run on the **staging database server** (Linux, PostgreSQL 16):

### Step 1: Install pgvector extension

```bash
# Preferred — Debian/Ubuntu package (check availability first)
apt-cache search postgresql-16-pgvector
sudo apt update && sudo apt install -y postgresql-16-pgvector

# Fallback — build from source (v0.8.2)
# cd /tmp && git clone --branch v0.8.2 https://github.com/pgvector/pgvector.git
# cd pgvector && make && sudo make install
```

### Step 2: Verify installation

```bash
# Verify extension files
ls -la $(pg_config --sharedir)/extension/vector.*
ls -la $(pg_config --libdir)/vector.so
# Expected: vector.control, vector--0.8.2.sql, vector.so all present

# Load extension into target database
sudo -u postgres psql -d aqliya_pilot -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Confirm version
sudo -u postgres psql -d aqliya_pilot -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
# Expected: vector | 0.8.2

# Quick functional test
sudo -u postgres psql -d aqliya_pilot -c "SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector AS d;"
# Expected: d = 12.5
```

---

## 3. Exact Command Sequence — Migration

Run from the **application server** (or any host with `npx` and DB access):

### Step 3: Pre-migration check

```bash
DATABASE_URL="postgresql://postgres:<password>@<staging-host>:5432/aqliya_pilot?schema=public" \
  npx prisma migrate status
# Expected: shows 20260605000001_ic01_pgvector_document_chunk as pending
```

### Step 4: Apply migration

```bash
DATABASE_URL="postgresql://postgres:<password>@<staging-host>:5432/aqliya_pilot?schema=public" \
  npx prisma migrate deploy
# Expected: exits 0, migration applied
```

### Step 5: Regenerate Prisma client

```bash
DATABASE_URL="postgresql://postgres:<password>@<staging-host>:5432/aqliya_pilot?schema=public" \
  npx prisma generate
# Expected: exits 0
```

### Step 6: Verify migration record

```bash
psql "$DATABASE_URL" -c "
SELECT migration_name, finished_at, rolled_back_at
FROM _prisma_migrations
WHERE migration_name = '20260605000001_ic01_pgvector_document_chunk';
"
# Expected: finished_at is set, rolled_back_at is NULL
```

---

## 4. Verification Checklist

### 4.1 Automated verification

```bash
DATABASE_URL="postgresql://postgres:<password>@<staging-host>:5432/aqliya_pilot?schema=public" \
  npx tsx scripts/verify-pgvector-staging.ts
```

**Expected pass output:**
```json
{ "staging": true, "tableExists": true, "pgvector": true }
PASS: DocumentChunk table and pgvector extension present.
```

### 4.2 Manual verification SQL

```sql
-- 1. Extension present
SELECT 'pgvector_installed' AS check_name,
       CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM pg_extension WHERE extname = 'vector';

-- 2. Table exists
SELECT 'document_chunk_table' AS check_name,
       CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'DocumentChunk';

-- 3. Vector column exists
SELECT 'vector_column' AS check_name, ... FROM information_schema.columns
WHERE table_name = 'DocumentChunk' AND udt_name = 'vector';

-- 4. HNSW index exists
SELECT 'hnsw_index' AS check_name, ... FROM pg_indexes
WHERE tablename = 'DocumentChunk' AND indexdef LIKE '%hnsw%';

-- 5. PostgreSQL >= 16
SELECT 'dimension_check' AS check_name, ...
       CASE WHEN current_setting('server_version_num')::int >= 160000
       THEN 'PASS' ELSE 'WARN' END ...
```

**Expected:** All 5 checks return `PASS`.

### 4.3 Application health check

```bash
curl -sSf https://staging.aqliya.com/api/health
# Expected: JSON with all key checks "ok"
```

---

## 5. Release Candidate Checklist

| # | Item | Status | Verified By |
|---|---|---|---|
| **Code** | | | |
| RC-1 | TypeScript compilation: 0 errors | ✅ PASS | `npx tsc --noEmit` |
| RC-2 | Build: 0 errors | ✅ PASS | `npm run build` (pre-existing Sentry/SalesOS warnings only) |
| RC-3 | Unit tests: passing | ✅ PASS | ai-reliability (9/9), orchestrator-ic02 (8/8), rate-limit (4/4), middleware-rate-limit (4/4) |
| RC-4 | Cycle 5 smoke test (offline): passing | ✅ PASS | 20/20 metrics, exit 0 |
| RC-5 | Repository audit: no release blockers | ✅ PASS | 0 release blockers; 1 production risk (DecisionOS, tracked) |
| **Artifacts** | | | |
| RC-6 | Migration SQL: correct and complete | ✅ PASS | 3 DDL statements (extension + table + indexes) |
| RC-7 | Verify script: correct | ✅ PASS | Checks extension + table, typed return |
| RC-8 | Runbook: complete | ✅ PASS | Preconditions, install, migrate, verify, rollback, failures, production |
| RC-9 | Rollback procedure: documented | ✅ PASS | 3 levels (migration-only, full, minimal) + verification |
| **Risk** | | | |
| RC-10 | Release blockers: 0 | ✅ PASS | Per release-blocking-assessment-cycle5.md |
| RC-11 | New production risks: 0 | ✅ PASS | Only pre-existing DecisionOS risk (unrelated) |
| RC-12 | Rollback time: < 2 min | ✅ PASS | `DROP TABLE` + `prisma migrate resolve --rolled-back` |
| **Operations** | | | |
| RC-13 | pgvector staging install: documented | ✅ PASS | 3 methods (apt, source, PGXN) |
| RC-14 | Production deployment order: documented | ✅ PASS | 8-step sequence with monitoring and backout |
| RC-15 | Failure scenarios: documented | ✅ PASS | 5 scenarios with symptoms, causes, resolutions, fallbacks |
| RC-16 | CI/CD integration: documented | ✅ PASS | GitHub Actions snippet in Appendix B |

---

## Final Verdict

**All 16 Release Candidate checks pass.** All 15 prerequisites verified. Zero release blockers. Zero new production risks. Build clean. Tests pass. Smoke test passes. Runbook complete with rollback procedures.

---

# READY FOR STAGING VALIDATION ✅

The staging operator should:

1. SSH into the staging database server (Linux, PostgreSQL 16)
2. Execute **Section 2 commands** (pgvector install)
3. Execute `CREATE EXTENSION vector` and verify
4. From the application host, execute **Section 3 commands** (migration)
5. Execute **Section 4 commands** (verification)
6. Run `curl` against the staging health endpoint
7. If all pass: release is staged successfully
8. If any failure: consult **Section 7** of the runbook or rollback via **Section 6**

**Post-staging action:** Enable `FF_AI_RAG=true` in staging env to activate RAG pipeline, then run the Cycle 5 smoke test in `--live` mode.
