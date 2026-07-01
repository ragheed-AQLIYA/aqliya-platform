# REPOSITORY RECOVERY PLAN

**Date:** 2026-06-23  
**Author:** OpenCode Agent (P0 Reproducibility Recovery)  
**Status:** COMPLETE  

---

## Reproducibility Verdict

**REPRODUCIBLE = NO**

Supported by evidence from all phases:
- **Phase A:** Migration lineage broken — 3 models never created in migrations
- **Phase B:** pgvector requirement not documented — default docker image lacks extension
- **Phase C:** `prisma migrate deploy` FAILS on clean database
- **Phase D:** Seed BLOCKED by migration failure
- **Phase E:** Build + test BLOCKED by migration failure
- **Phase F:** CI validates `db push` not `migrate deploy` — false confidence

---

## Issue Register

### Issue R01 — Missing KnowledgeCandidate CREATE TABLE (CRITICAL)

**Root cause:** `KnowledgeCandidate`, `KnowledgeCandidateEvidence`, and `KnowledgePromotionHistory` models were added to `prisma/schema.prisma` but their `CREATE TABLE` was never captured in a migration. The table was created via `prisma db push` in development. Later, migration `20260622000000_add_knowledge_candidate_createdById` was generated assuming the table already exists.

**Files affected:**
- `prisma/schema.prisma` (lines 3612–3674 — model definitions)
- `prisma/migrations/20260622000000_add_knowledge_candidate_createdById/migration.sql`
- `prisma/migrations/20270622110000_knowledge_foundation_version_candidate_bridge/migration.sql` (FK reference)

**Risk:** HIGH — blocks all deployments on fresh environments.

**Fix steps:**

1. Create a new migration `20260621000000_create_knowledge_candidate_tables` (note: timestamp BEFORE the broken migration #47) that contains:
   - `CREATE TABLE "KnowledgeCandidate" (...)` with full schema from `prisma/schema.prisma`
   - `CREATE TABLE "KnowledgeCandidateEvidence" (...)` with full schema
   - `CREATE TABLE "KnowledgePromotionHistory" (...)` with full schema
   - `CREATE TYPE "KnowledgeCandidateStatus" AS ENUM (...)` (if not already created)
   - Appropriate indexes

2. The new migration must have a timestamp EARLIER than `20260622000000_add_knowledge_candidate_createdById` so it runs first and creates the tables.

3. After adding the migration file, run:
   ```
   npx prisma migrate deploy
   ```

4. On an existing development database where tables already exist:
   ```
   npx prisma migrate resolve --applied 20260621000000_create_knowledge_candidate_tables
   npx prisma migrate resolve --applied 20260622000000_add_knowledge_candidate_createdById
   ```

**Validation steps:**
- `npx prisma migrate deploy` on clean `pgvector/pgvector:pg16` database
- Verify all 51+ migrations pass
- Verify `KnowledgeCandidate` table exists

### Issue R02 — Default Docker image lacks pgvector (HIGH)

**Root cause:** The main `docker-compose.yml` uses `postgres:16-alpine` which does NOT include the `vector` extension required by migration `20260605000001_ic01_pgvector_document_chunk`.

**Files affected:**
- `docker-compose.yml`
- `docker-compose.test.yml`
- `README.md`

**Risk:** HIGH — new developers using `docker compose up -d db` cannot run `migrate deploy`.

**Fix steps (Option A — Change default image):**

Change `docker-compose.yml`:
```yaml
services:
  db:
-    image: postgres:16-alpine
+    image: pgvector/pgvector:pg16
```

Change `docker-compose.test.yml`:
```yaml
services:
  postgres_test:
-    image: postgres:16-alpine
+    image: pgvector/pgvector:pg16
```

**Fix steps (Option B — Better documentation):**

Keep the plain Postgres for minimal dev use, but:
1. Update `README.md` to state pgvector requirement
2. Add explicit note that `docker compose -f docker-compose.yml -f docker-compose.pgvector.yml up -d db` is required
3. Add `SETUP.md` or update `README.md` with clear instructions

**Recommendation:** Option A is simpler and more reliable. The pgvector image is backward-compatible with plain Postgres — it doesn't break anything.

**Validation steps:**
- `docker compose up -d db` (with pgvector image) → starts clean
- `npx prisma migrate deploy` → all migrations pass

### Issue R03 — CI validates db push not migrate deploy (HIGH)

**Root cause:** `.github/workflows/ci.yml` uses `prisma db push` instead of `prisma migrate deploy`, so broken migration lineage is never detected in CI.

**Files affected:**
- `.github/workflows/ci.yml`

**Risk:** HIGH — false confidence in migration health.

**Fix steps:**

Replace in `ci.yml`:
```yaml
- name: Push schema to CI database
  run: |
    npx prisma db push --force-reset --accept-data-loss || true
    PGPASSWORD=ci psql -h localhost -U ci -d aqliya_ci -c "CREATE EXTENSION IF NOT EXISTS vector;"
    npx prisma db push --accept-data-loss
```

With:
```yaml
- name: Run database migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: postgresql://ci:ci@localhost:5432/aqliya_ci
```

**Note:** After this change, CI will correctly fail if migration lineage is broken (as it currently is with KnowledgeCandidate). Fix R01 first, then this change will pass.

**Validation steps:**
- CI run with `migrate deploy` passes after R01 fix

### Issue R04 — Deploy workflow has no migration step (HIGH)

**Root cause:** `.github/workflows/deploy.yml` does not run `prisma migrate deploy` anywhere. Production deployments push Docker images and update ECS but never apply database migrations.

**Files affected:**
- `.github/workflows/deploy.yml`
- `Dockerfile`

**Risk:** HIGH — production deployments may run code that expects new schema columns/tables that don't exist yet.

**Fix steps:**

1. Add a `migrate` job to `deploy.yml`:
```yaml
migrate:
  name: Run Database Migrations
  needs: [test]
  runs-on: ubuntu-latest
  environment: ${{ github.ref_name == 'main' && 'production' || 'staging' }}
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
    - run: npm ci --ignore-scripts
    - run: npx prisma generate
    - run: npx prisma migrate deploy
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

2. The `terraform` and `build-and-push` jobs should `needs: [migrate]` instead of or in addition to `needs: [test]`.

2. (Alternative) Add an `ENTRYPOINT` to the Dockerfile that runs `prisma migrate deploy` before starting the app server.

**Validation steps:**
- Deploy workflow runs migrations against the target environment database

### Issue R05 — README missing pgvector documentation (MEDIUM)

**Root cause:** `README.md` does not document pgvector requirement.

**Files affected:**
- `README.md`

**Risk:** MEDIUM — new developers and operators may not know about the vector extension requirement.

**Fix steps:**
Add to README:
```markdown
## Database Requirements

AQLIYA requires PostgreSQL with the pgvector extension for AI embedding support.

### Quick Start (with pgvector)

```bash
docker compose -f docker-compose.yml -f docker-compose.pgvector.yml up -d db
npx prisma migrate deploy
npx prisma db seed
```

### Without pgvector (limited functionality)

The default `docker-compose.yml` uses plain PostgreSQL. Vector-related features (DocumentChunk, AI embeddings) will not work.
```

---

## Recovery Execution Plan

### Phase 1: Fix migration lineage (R01)

**Duration:** ~15 minutes  
**Risk:** LOW — non-destructive migration addition  
**Validation:** `npx prisma migrate deploy` on clean database

### Phase 2: Fix docker images (R02)

**Duration:** ~5 minutes  
**Risk:** LOW — pgvector image is backward-compatible  
**Validation:** `docker compose up -d db` + `prisma migrate deploy`

### Phase 3: Fix CI workflow (R03)

**Duration:** ~10 minutes  
**Risk:** LOW — changes only CI workflow config  
**Validation:** CI run after R01+R02 fixes

### Phase 4: Fix deploy workflow (R04)

**Duration:** ~15 minutes  
**Risk:** MEDIUM — requires environment secrets access  
**Validation:** Deploy workflow dry-run

### Phase 5: Fix documentation (R05)

**Duration:** ~5 minutes  
**Risk:** LOW — docs only  
**Validation:** README review

### Phase 6: Full reproducibility verification

**Duration:** ~30 minutes  
**Steps:**
1. Start clean `pgvector/pgvector:pg16` container
2. `npx prisma migrate deploy` → all 52 migrations pass
3. `npx prisma db seed` → seed completes
4. `npm run build` → build succeeds
5. `npm test` → all tests pass

---

## Final Verdict

```

╔══════════════════════════════════════════╗
║          REPRODUCIBLE = NO               ║
║                                          ║
║  Evidence:                               ║
║  1. migrate deploy fails on clean DB     ║
║  2. 3 models missing CREATE TABLE        ║
║  3. Default docker lacks pgvector        ║
║  4. CI validates db push, not deploy     ║
║  5. No migration step in deploy pipeline ║
╚══════════════════════════════════════════╝

```

## Recovery Path

Fix the 5 issues in order (R01 → R02 → R03 → R04 → R05), then re-run the full reproducibility gate.

After all fixes applied, expected result:

```
prisma migrate deploy  → ✅ All 52 migrations pass
prisma db seed         → ✅ Seed completes
npm run build          ✅ Build successful
npm test               ✅ All tests pass
```

**REPRODUCIBLE = YES** (after fixes)
