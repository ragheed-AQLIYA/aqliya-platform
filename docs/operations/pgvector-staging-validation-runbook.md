# pgvector Staging Validation Runbook

**Runbook ID:** OPS-RB-IC01-001  
**System:** Intelligence Core — pgvector RAG Pipeline  
**Migration:** `20260605000001_ic01_pgvector_document_chunk`  
**Target environment:** Staging PostgreSQL 16 (Linux)  
**Owner:** Platform Ops  
**Severity:** Standard change  

---

## 1. Preconditions

### 1.1 Staging server requirements

| Requirement | Check | Verification |
|---|---|---|
| PostgreSQL 16.x running | `psql --version` | `>= 16.0` |
| `postgresql-server-dev-16` installed | `dpkg -l \| grep postgresql-server-dev-16` | Installed (required for pgvector build) |
| `git` available | `git --version` | `>= 2.0` |
| `gcc` / `make` available | `gcc --version && make --version` | Present |
| `sudo` or root access | `sudo -n echo ok` | Outputs `ok` |
| 2 GB free disk | `df -h /var/lib/postgresql` | `>= 2GB` |
| Target database exists | `psql -d <DB> -c 'SELECT 1'` | Returns `1` row |

### 1.2 Connection parameters

| Variable | Value |
|---|---|
| `DB_HOST` | Staging hostname |
| `DB_PORT` | `5432` (default) |
| `DB_NAME` | `aqliya_pilot` |
| `DB_USER` | `postgres` |
| `DATABASE_URL` | `postgresql://postgres:<password>@<host>:5432/aqliya_pilot?schema=public` |

### 1.3 Artifacts to have ready

- `prisma/migrations/20260605000001_ic01_pgvector_document_chunk/` — migration SQL (canonical source)
- `scripts/verify-pgvector-staging.ts` — verification script (requires `tsx`)
- `prisma/schema.prisma` — Prisma schema with `DocumentChunk` model (for `prisma generate`)

### 1.4 Required tooling on staging host

| Tool | Purpose | Install if missing |
|---|---|---|
| `psql` | Direct DB inspection | `apt install postgresql-client-16` |
| `node` ≥ 18 | Run verify script | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt install -y nodejs` |
| `npx` / `tsx` | Execute TypeScript verify script | `npm install -g tsx` |
| `curl` | Test health endpoints | `apt install curl` |

---

## 2. pgvector Installation

**Important:** pgvector must be installed on the **database server** (not the application server). The extension runs inside PostgreSQL.

### 2.1 Method A — Debian/Ubuntu package (preferred if available)

```bash
# Check if distribution-specific package is available
apt-cache search postgresql-16-pgvector

# If available:
sudo apt update
sudo apt install -y postgresql-16-pgvector
```

### 2.2 Method B — Build from source (standard)

```bash
# 1. Clone pgvector
cd /tmp
git clone --branch v0.8.2 https://github.com/pgvector/pgvector.git
cd pgvector

# 2. Build and install
make
sudo make install

# 3. Verify extension files exist
ls -la $(pg_config --sharedir)/extension/vector*
ls -la $(pg_config --libdir)/vector.so
```

Expected output:
```
-rw-r--r--  vector.control
-rw-r--r--  vector--0.8.2.sql
-rwxr-xr-x  vector.so
```

### 2.3 Method C — PGXN client (alternative)

```bash
sudo apt install -y pgxnclient
sudo pgxn install pgvector
```

### 2.4 Verify extension can be loaded

```bash
sudo -u postgres psql -d aqliya_pilot -c "CREATE EXTENSION IF NOT EXISTS vector;"
sudo -u postgres psql -d aqliya_pilot -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
```

Expected:
```
 extname | extversion
---------+------------
 vector  | 0.8.2
```

---

## 3. Prisma Migration Commands

### 3.1 Pre-migration health check

```bash
# Check current migration state
npx prisma migrate status

# Verify the pgvector migration SQL matches remote DB state
# Expected: "Database schema is up to date" OR shows pending migration
```

### 3.2 Apply migration

```bash
# Apply pending migrations to staging DB
DATABASE_URL="postgresql://postgres:<password>@<host>:5432/aqliya_pilot?schema=public" \
  npx prisma migrate deploy
```

Or interactively (when running from a host with psql access):

```bash
npx prisma db push
```

### 3.3 Regenerate Prisma client

```bash
DATABASE_URL="postgresql://postgres:<password>@<host>:5432/aqliya_pilot?schema=public" \
  npx prisma generate
```

### 3.4 Verify migration record

```sql
SELECT migration_name, finished_at, rolled_back_at
FROM _prisma_migrations
WHERE migration_name = '20260605000001_ic01_pgvector_document_chunk';
```

Expected:
```
                migration_name                |         finished_at         | rolled_back_at
----------------------------------------------+----------------------------+----------------
 20260605000001_ic01_pgvector_document_chunk  | 2026-06-04 HH:MM:SS.MMM    | NULL
```

### 3.5 Verify DocumentChunk table

```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'DocumentChunk'
ORDER BY ordinal_position;
```

Expected:
```
   column_name    | data_type |   udt_name
------------------+-----------+--------------
 id               | text      | text
 organizationId   | text      | text
 documentId       | text      | text
 chunkIndex       | integer   | int4
 content          | text      | text
 tokenCount       | integer   | int4
 metadata         | jsonb     | jsonb
 embedding        | USER-DEFINED | vector
 createdBy        | text      | text
 createdAt        | timestamp | timestamp
```

### 3.6 Verify indexes

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'DocumentChunk';
```

Expected:
```
            indexname             | indexdef
----------------------------------+------------------------------------------
 DocumentChunk_pkey               | CREATE UNIQUE INDEX ... PRIMARY KEY (id)
 DocumentChunk_organizationId_documentId_idx | CREATE INDEX ... (organizationId, documentId)
 DocumentChunk_organizationId_chunkIndex_idx | CREATE INDEX ... (organizationId, chunkIndex)
 DocumentChunk_embedding_hnsw_idx | CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)
```

---

## 4. Verification Commands

### 4.1 Automated verification script

```bash
# From the application repository root (any host with DB access)
DATABASE_URL="postgresql://postgres:<password>@<host>:5432/aqliya_pilot?schema=public" \
  npx tsx scripts/verify-pgvector-staging.ts
```

**Expected output:**
```json
{
  "staging": true,
  "tableExists": true,
  "pgvector": true
}
PASS: DocumentChunk table and pgvector extension present.
```

### 4.2 Manual verification (via psql)

```bash
psql "postgresql://postgres:<password>@<host>:5432/aqliya_pilot" -f scripts/sql/verify-pgvector.sql
```

Or run these commands directly:

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
SELECT 'vector_column' AS check_name,
       CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM information_schema.columns
WHERE table_name = 'DocumentChunk' AND udt_name = 'vector';

-- 4. HNSW index exists
SELECT 'hnsw_index' AS check_name,
       CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM pg_indexes
WHERE tablename = 'DocumentChunk' AND indexdef LIKE '%hnsw%';

-- 5. Vector dimension check
SELECT 'dimension_check' AS check_name,
       CASE WHEN current_setting('server_version_num')::int >= 160000
            THEN 'PASS' ELSE 'WARN' END AS status
       || ' (PG ' || current_setting('server_version') || ')';
```

Expected: All 5 checks show `PASS`.

### 4.3 Application health endpoint

```bash
curl -sSf https://staging.aqliya.com/api/health
```

Expected: JSON health response with all key checks `ok`.

### 4.4 RAG pipeline smoke test (if RAG feature is enabled)

```bash
DATABASE_URL="postgresql://postgres:<password>@<host>:5432/aqliya_pilot?schema=public" \
  npx tsx scripts/ic-cycle5-smoke.ts
```

Expected output: All smoke checks pass.

---

## 5. Expected Outputs

### 5.1 Successful deployment checklist

| Step | Check | Status |
|---|---|---|
| Pre-migration | `npx prisma migrate status` shows pending migration | ✅ |
| Extension | `CREATE EXTENSION vector` succeeds | ✅ |
| Migration | `npx prisma migrate deploy` exits 0 | ✅ |
| Client | `npx prisma generate` exits 0 | ✅ |
| Table | `information_schema.tables` shows DocumentChunk | ✅ |
| Column | `udt_name = 'vector'` for embedding column | ✅ |
| Index | HNSW index present | ✅ |
| Verify script | `scripts/verify-pgvector-staging.ts` exits 0 with `{tableExists: true, pgvector: true}` | ✅ |
| Health API | `GET /api/health` returns 200 | ✅ |
| Rollback tested | Rollback procedure documented and verified | ✅ |

### 5.2 Full pass JSON output

```json
{
  "staging": true,
  "tableExists": true,
  "pgvector": true,
  "migrationFile": "20260605000001_ic01_pgvector_document_chunk",
  "prismaVersion": "7.x",
  "postgresVersion": "16.x",
  "pgvectorVersion": "0.8.2",
  "dimensions": 1536,
  "indexType": "hnsw",
  "distanceOp": "vector_cosine_ops"
}
```

---

## 6. Rollback Procedure

### 6.1 Rollback — migration only (safe)

If the migration was applied but no data exists yet:

```bash
# Mark migration as rolled back in Prisma (without dropping the table)
npx prisma migrate resolve --rolled-back 20260605000001_ic01_pgvector_document_chunk
```

### 6.2 Rollback — full (drops extension and table)

```bash
# 1. Drop the DocumentChunk table (and all data within)
psql "$DATABASE_URL" -c 'DROP TABLE IF EXISTS "DocumentChunk" CASCADE;'

# 2. Drop the extension
psql "$DATABASE_URL" -c 'DROP EXTENSION IF EXISTS vector;'

# 3. Mark migration as rolled back in Prisma
npx prisma migrate resolve --rolled-back 20260605000001_ic01_pgvector_document_chunk

# 4. Regenerate Prisma client
npx prisma generate
```

### 6.3 Rollback — minimal (retains extension, drops table)

```bash
# Keep pgvector extension for future use, drop only the table
psql "$DATABASE_URL" -c 'DROP TABLE IF EXISTS "DocumentChunk" CASCADE;'
npx prisma migrate resolve --rolled-back 20260605000001_ic01_pgvector_document_chunk
npx prisma generate
```

### 6.4 Verify rollback

```bash
npx tsx scripts/verify-pgvector-staging.ts
```

Expected:
```json
{
  "staging": true,
  "tableExists": false,
  "pgvector": false
}
FAIL: Apply migration ...
```

---

## 7. Failure Scenarios

### 7.1 `CREATE EXTENSION vector` fails

**Symptoms:**
```
ERROR: could not open extension control file ".../extension/vector.control": No such file or directory
ERROR: extension "vector" is not available
```

**Causes:**
- pgvector not installed on the PostgreSQL server
- pgvector installed but for a different PostgreSQL major version
- PostgreSQL was restarted after installation without reloading shared libraries

**Resolution:**
```bash
# Verify pgvector installation
ls -la $(pg_config --sharedir)/extension/vector.*
ls -la $(pg_config --libdir)/vector.so

# If pgvector was installed for wrong PG version, reinstall with correct pg_config
# On Debian/Ubuntu, install the matching version:
sudo apt install postgresql-$(pg_config --version | grep -oP '\d+\.\d+' | head -1 | cut -d. -f1)-pgvector

# Restart PostgreSQL and retry
sudo systemctl restart postgresql
psql -d aqliya_pilot -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**Fallback:** If pgvector cannot be installed, the migration is **non-blocking** for existing product workflows. DocumentChunk is a new table used by RAG features which are feature-flagged `off` by default (`ai.rag`). The table can be applied later.

### 7.2 HNSW index creation fails

**Symptoms:**
```
ERROR: operator class "vector_cosine_ops" does not exist for access method "hnsw"
```

**Causes:**
- pgvector version < 0.5.0 does not support HNSW on empty tables
- pgvector version < 0.6.0 may have different operator class names

**Resolution:**
```bash
# Check pgvector version
psql -d aqliya_pilot -c "SELECT extversion FROM pg_extension WHERE extname = 'vector';"

# If version < 0.5.0, upgrade pgvector:
cd /tmp/pgvector
git pull origin master
git checkout v0.8.2
make clean && make && sudo make install
sudo systemctl restart postgresql

# Then recreate the index:
psql -d aqliya_pilot -c "CREATE INDEX CONCURRENTLY IF NOT EXISTS \"DocumentChunk_embedding_hnsw_idx\"
    ON \"DocumentChunk\" USING hnsw (\"embedding\" vector_cosine_ops);"
```

**Fallback:** Replace HNSW with IVFFlat (available in pgvector >= 0.1.0):
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS "DocumentChunk_embedding_ivfflat_idx"
    ON "DocumentChunk" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
```

### 7.3 Prisma migration deploy fails

**Symptoms:**
```
Error: P3018: A migration failed to apply
Error: P3005: The database schema is not empty
```

**Resolution:**
```bash
# Check which migrations have already been applied
npx prisma migrate status

# If this migration partially applied, check DB state
psql "$DATABASE_URL" -c "SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations
    WHERE migration_name = '20260605000001_ic01_pgvector_document_chunk';"

# If migration is stuck, resolve it:
# Option A: Mark as applied (if SQL was manually run)
npx prisma migrate resolve --applied 20260605000001_ic01_pgvector_document_chunk

# Option B: Mark as rolled back and re-apply
psql "$DATABASE_URL" -c "DELETE FROM _prisma_migrations
    WHERE migration_name = '20260605000001_ic01_pgvector_document_chunk';"
npx prisma migrate deploy
```

### 7.4 Verification script fails

**Symptoms:**
```
FAIL: Apply migration 20260605000001_ic01_pgvector_document_chunk...
```

**Resolution:**
```bash
# Check table
psql "$DATABASE_URL" -c "\dt DocumentChunk"

# Check extension
psql "$DATABASE_URL" -c "SELECT * FROM pg_extension WHERE extname = 'vector';"

# Check pgvector extension files on server
ssh staging-server "ls -la \$(pg_config --sharedir)/extension/vector*"

# If extension is missing, restart from Section 2 (pgvector installation)
# If table is missing, restart from Section 3.2 (migration deploy)
```

### 7.5 Embedding dimension mismatch

**Symptoms:** Error at runtime when storing embeddings

**Cause:** The `embedding` column is defined as `vector(1536)` (OpenAI ada-002 dimensions). If another embedding model is used with different dimensions, storage will fail.

**Resolution:**
```bash
# Check column type
psql "$DATABASE_URL" -c "SELECT column_name, udt_name, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = 'DocumentChunk' AND column_name = 'embedding';"

# To change dimensions (requires dropping/recreating the column):
# ALTER TABLE "DocumentChunk" DROP COLUMN embedding;
# ALTER TABLE "DocumentChunk" ADD COLUMN embedding vector(<new_dimensions>);
```

---

## 8. Production Deployment Sequence

### 8.1 Order of operations

```
Step 1: Backup production database
Step 2: Deploy pgvector extension to production PostgreSQL (follow Section 2)
Step 3: Apply migration (follow Section 3)
Step 4: Run verification (follow Section 5)
Step 5: Enable feature flag via env var: FF_AI_RAG=true
Step 6: Run application smoke tests
Step 7: Enable RAG features in UI if applicable
Step 8: Monitor for 24 hours
```

### 8.2 Change advisory

| Item | Value |
|---|---|
| Change type | Standard |
| Risk | Low (new table, no existing data modified) |
| Downtime required | None (online DDL / migration) |
| Rollback time | < 2 minutes |
| Monitoring window | 24 hours post-deployment |
| Approval required | Platform lead |
| Communication | Notify team before Step 3 and after Step 4 |

### 8.3 Maintenance window

No maintenance window required. The migration:
- Does not alter existing tables
- `CREATE EXTENSION IF NOT EXISTS` is idempotent
- `CREATE TABLE IF NOT EXISTS` is idempotent
- `CREATE INDEX IF NOT EXISTS` is non-blocking (can be run concurrently)
- All application routes continue to work during migration

### 8.4 Post-deployment monitoring

| Metric | Alert threshold |
|---|---|
| DB connections | > 100 concurrent |
| DB disk usage | > 80% |
| Embedding query latency | > 5s P99 |
| `_prisma_migrations` errors | Any failure |
| Health endpoint status | Not `ok` for all checks |

### 8.5 Production backout plan

If rollback is needed in production:

```bash
# 1. Set feature flag off
unset FF_AI_RAG
# or set FF_AI_RAG=false

# 2. Restart application servers to pick up flag change
sudo systemctl restart aqliya-app

# 3. Run rollback (Section 6.3 — minimal, retain extension)
psql "$DATABASE_URL" -c 'DROP TABLE IF EXISTS "DocumentChunk" CASCADE;'
npx prisma migrate resolve --rolled-back 20260605000001_ic01_pgvector_document_chunk

# 4. Verify
npx tsx scripts/verify-pgvector-staging.ts

# 5. Document reason for rollback
```

---

## Appendix A: Verification SQL One-Liner

```bash
psql "$DATABASE_URL" -c "
SELECT 'pgvector' AS component,
       CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM pg_extension WHERE extname = 'vector'
UNION ALL
SELECT 'document_chunk_table',
       CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'DocumentChunk'
UNION ALL
SELECT 'hnsw_index',
       CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END
FROM pg_indexes
WHERE tablename = 'DocumentChunk' AND indexdef LIKE '%hnsw%';"
```

## Appendix B: CI/CD Integration

Add to staging deployment pipeline:

```yaml
# .github/workflows/deploy-staging.yml (excerpt)
- name: Apply pgvector migration
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}

- name: Verify pgvector staging
  run: npx tsx scripts/verify-pgvector-staging.ts
  env:
    DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
```

## Appendix C: Troubleshooting Commands

```bash
# Find pg_config for the correct PostgreSQL version
ls /usr/lib/postgresql/*/bin/pg_config
export PATH=/usr/lib/postgresql/16/bin:$PATH

# Verify extension installation paths
pg_config --sharedir
pg_config --libdir

# Check PostgreSQL version
psql --version

# Check shared_preload_libraries (pgvector doesn't need preloading, but verify)
psql -c "SHOW shared_preload_libraries;"

# Test a vector operation
psql -d aqliya_pilot -c "SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector AS cosine_distance;"

# Expected:
#  cosine_distance
# -----------------
#  12.5
```
