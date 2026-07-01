# CI REPRODUCIBILITY AUDIT

**Date:** 2026-06-23  
**Author:** OpenCode Agent (P0 Reproducibility Recovery)  
**Status:** COMPLETE — CI CANNOT VALIDATE MIGRATION LINEAGE  

---

## Objective

Determine whether CI validates `prisma migrate deploy` or `prisma db push`, and whether CI can produce false confidence in migration health.

---

## CI Workflow Files Inspected

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Pull request and push CI |
| `.github/workflows/deploy.yml` | Deploy to AWS ECS |
| `.github/workflows/promote.yml` | Promote staging → production |
| `.github/workflows/preview.yml` | Vercel preview deployments |
| `.github/workflows/backup.yml` | Scheduled database backup |

---

## CI Migration Step Analysis

### `ci.yml` (PR/push CI)

```yaml
- name: Push schema to CI database
  run: |
    npx prisma db push --force-reset --accept-data-loss || true
    PGPASSWORD=ci psql -h localhost -U ci -d aqliya_ci -c "CREATE EXTENSION IF NOT EXISTS vector;"
    npx prisma db push --accept-data-loss
```

**Uses:** `prisma db push`  
**Does NOT use:** `prisma migrate deploy`

### `deploy.yml` (AWS deploy)

```yaml
- run: npx prisma generate
```

**No migration step at all.** The deploy workflow:
1. Runs `npx prisma generate` (in `test` job)
2. Builds Docker image
3. Pushes to ECR
4. Updates ECS service

No `prisma migrate deploy` is executed during deployment. The Docker container does not run migrations on startup (`CMD ["node", "server.js"]`).

### `promote.yml` (staging → production)

No Prisma operations at all. Only ECS service update.

### `preview.yml` (Vercel preview)

```yaml
- run: npm run build
```

No Prisma migration step. Build-only.

### `backup.yml`

No migration. Backup-only.

---

## Analysis

### Question A: Does CI validate `migrate deploy`?

**NO.** CI validates `prisma db push` only.

### Question B: Does CI validate `db push`?

**YES.** But `db push` is not a substitute for `migrate deploy` because:

| Capability | `db push` | `migrate deploy` |
|------------|-----------|-----------------|
| Creates tables from schema | ✅ Yes | ✅ Yes |
| Validates migration order | ❌ No | ✅ Yes |
| Detects broken lineage | ❌ No | ✅ Yes |
| Tracks which migrations have run | ❌ No | ✅ Yes |
| Supports rollback | ❌ No | ✅ Yes (via migrate) |
| Production-safe | ❌ No (data loss risk) | ✅ Yes |
| Detects missing CREATE TABLE | ❌ No — creates tables silently | ✅ Yes — fails with 42P01 |

### Question C: Can CI produce false confidence?

**YES.** The current CI produces **false confidence** in migration health:

1. CI runs `prisma db push` which silently creates all tables from the schema — including those that have no migration (like `KnowledgeCandidate`)
2. CI never runs `prisma migrate deploy`, so broken migration lineage is never detected
3. CI would pass even if all migrations were deleted — `db push` works from schema alone
4. A developer who runs `prisma db push` in development sees all tables working, then generates a migration that assumes tables already exist (exactly what happened with `20260622000000_add_knowledge_candidate_createdById`)
5. The deploy workflow has **zero** migration validation — it doesn't even run `db push`

### Actual failure path

```
Local dev: prisma db push → creates KnowledgeCandidate ✅
Developer: prisma migrate dev → generates migration assuming table exists ✅
CI: prisma db push → silently creates all tables ✅ (false positive)
Production: prisma migrate deploy → FAILS ❌ (relation doesn't exist)
```

---

## Detailed CI Issues

### Issue CI-01: Uses db push instead of migrate deploy

**File:** `.github/workflows/ci.yml` line 48-52  
**Severity:** CRITICAL  
**Impact:** CI never validates migration lineage

### Issue CI-02: Deploy workflow has no migration step

**File:** `.github/workflows/deploy.yml`  
**Severity:** CRITICAL  
**Impact:** Production deployments don't run `prisma migrate deploy` at all

### Issue CI-03: Docker entrypoint doesn't run migrations

**File:** `Dockerfile` (CMD line)  
**Severity:** HIGH  
**Impact:** Even if deploy workflow were fixed, the Docker container doesn't run migrations on startup

### Issue CI-04: CI creates extension manually

```yaml
PGPASSWORD=ci psql -h localhost -U ci -d aqliya_ci -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**Severity:** LOW  
**Note:** This works because CI uses `pgvector/pgvector:pg16` image. The manual `CREATE EXTENSION` is redundant but harmless. The real issue is that `db push` wouldn't fail even without manual extension creation — it would just skip the vector column.

---

## Exact Workflow Changes Needed

### Fix CI-01: Change `ci.yml` db push to migrate deploy

Replace:
```yaml
- name: Push schema to CI database
  run: |
    npx prisma db push --force-reset --accept-data-loss || true
    PGPASSWORD=ci psql -h localhost -U ci -d aqliya_ci -c "CREATE EXTENSION IF NOT EXISTS vector;"
    npx prisma db push --accept-data-loss
```

With:
```yaml
- name: Run migrations against CI database
  run: |
    npx prisma migrate deploy
  env:
    DATABASE_URL: postgresql://ci:ci@localhost:5432/aqliya_ci
```

### Fix CI-02: Add migration step to `deploy.yml`

Add between the `test` job and the `terraform` / `build-and-push` jobs:

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

### Fix CI-03: Add migration entrypoint to Dockerfile

Add to the production Docker image:
```dockerfile
COPY --from=builder /app/prisma ./prisma
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
```

Where `docker-entrypoint.sh` includes:
```bash
#!/bin/sh
npx prisma migrate deploy
exec "$@"
```

---

## Summary

| Check | Status |
|-------|--------|
| CI validates `migrate deploy` | ❌ NO — uses `db push` |
| CI validates migration lineage | ❌ NO — `db push` ignores lineage |
| Deploy runs migrations | ❌ NO — no migration step |
| Docker runs migrations on start | ❌ NO — no entrypoint |
| CI can detect broken lineage | ❌ NO — gives false confidence |
| CI catches `KnowledgeCandidate` issue | ❌ NO — `db push` creates it silently |
