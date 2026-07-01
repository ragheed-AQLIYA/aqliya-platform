# PGVECTOR REQUIREMENTS AUDIT

**Date:** 2026-06-23  
**Author:** OpenCode Agent (P0 Reproducibility Recovery)  
**Status:** COMPLETE  

---

## Objective

Audit pgvector usage across the repository: migration requirements, Docker images, documentation, and configuration gaps.

---

## Migration Analysis

### First migration requiring pgvector

**Migration:** `20260605000001_ic01_pgvector_document_chunk`  
**Created:** 2026-06-05  
**File:** `prisma/migrations/20260605000001_ic01_pgvector_document_chunk/migration.sql`

### Required SQL

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "DocumentChunk" (
    ...
    "embedding" vector(1536),
    ...
);

CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_hnsw_idx"
    ON "DocumentChunk" USING hnsw ("embedding" vector_cosine_ops);
```

### Extension Requirements

| Requirement | Value |
|-------------|-------|
| PostgreSQL extension | `vector` |
| Extension provider | `pgvector` |
| Vector dimension | 1536 (OpenAI text-embedding-ada-002 compatible) |
| Index type | HNSW (requires pgvector >= 0.5.0) |
| Index operator | `vector_cosine_ops` |

### Failure mode without pgvector

If the `vector` extension is not available, migration `20260605000001_ic01_pgvector_document_chunk` fails with:

```
ERROR: type "vector" does not exist
```

---

## Docker Image Audit

### Image matrix

| Compose file | Database image | Has pgvector? | Port | Environment |
|---|---|---|---|---|
| `docker-compose.yml` | `postgres:16-alpine` | ❌ NO | 5432 | Dev/Default |
| `docker-compose.test.yml` | `postgres:16-alpine` | ❌ NO | 5433 | Integration tests |
| `docker-compose.pgvector.yml` | `pgvector/pgvector:pg16` | ✅ YES | 5434 | Dev override |
| `docker-compose.staging.yml` | `pgvector/pgvector:pg16` | ✅ YES | 5432 | Staging |
| CI (`ci.yml`) | `pgvector/pgvector:pg16` | ✅ YES | 5432 | CI |

### Critical gap

**Default `docker-compose.yml` and `docker-compose.test.yml` use plain `postgres:16-alpine` which does NOT include the `vector` extension.**

### Impact

| Scenario | Impact |
|----------|--------|
| `docker compose up -d db` (without override) | ❌ Database starts but `prisma migrate deploy` fails at migration #22 (`20260605000001_ic01_pgvector_document_chunk`) |
| `docker compose -f docker-compose.yml -f docker-compose.pgvector.yml up -d db` | ✅ Works (pgvector on port 5434) |
| `npm run test:integration` (uses `docker-compose.test.yml`) | ❌ Integration tests requiring vector extension will fail |
| CI (`pgvector/pgvector:pg16`) | ✅ CI works (but uses `db push`, not `migrate deploy`) |

---

## Dockerfile Analysis

The production `Dockerfile` does not run `prisma migrate deploy` at startup. It uses:

```dockerfile
CMD ["node", "server.js"]
```

No migration entrypoint script exists. No `ENTRYPOINT` for `prisma migrate deploy`.

---

## Documentation Audit

| Document | Mentions pgvector? | Status |
|---|---|---|
| `README.md` | ❌ NO — no mention of pgvector | **MISSING** |
| `docs/official/aqliya-core-architecture-v1.1.md` | ❌ Not checked | — |
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | ❌ Not checked | — |
| `PRIVACY.md` | N/A | — |
| `docker-compose.pgvector.yml` | ✅ YES (description) | Adequate |

### README gaps

The `README.md` does not document:
1. That pgvector is a required dependency for running the full stack
2. That the default `docker-compose.yml` uses a plain Postgres image without pgvector
3. That users must pass `-f docker-compose.pgvector.yml` to get a working database for development
4. That integration tests (`docker-compose.test.yml`) lack pgvector support

---

## Recommendations

### Minimum fixes required

1. **Update `README.md`** — Document pgvector requirement and the override compose file
2. **Update `docker-compose.yml`** — Change base image from `postgres:16-alpine` to `pgvector/pgvector:pg16` (or document why not)
3. **Update `docker-compose.test.yml`** — Change test image to `pgvector/pgvector:pg16` so integration tests work
4. **Add startup migration** — Ensure production deployments run `prisma migrate deploy` before the app starts

### Additional documentation

- Add pgvector to the system requirements list
- Document the `vector` extension requirement for any self-hosted/on-prem deployments
- Document the minimum pgvector version (≥0.5.0 for HNSW support)

---

## Summary

| Check | Status |
|-------|--------|
| Migration requires pgvector | ✅ Confirmed (migration #22) |
| Correct Docker image | ⚠️ Partial — only staging and CI use correct image |
| Default dev image supports migrate | ❌ `postgres:16-alpine` does NOT support vector type |
| Test image supports migrate | ❌ `postgres:16-alpine` — vector type missing |
| README documents requirement | ❌ No mention |
| Startup runs migrate | ❌ No entrypoint script |
