# Phase 1c — pgvector Validation Report

**Date:** 2026-06-06  
**Scripts:** `npm run db:pgvector-health`, `npm run db:verify-pgvector`

---

## Local pgvector Docker (proxy for staging schema)

| Check | Command | Result |
|-------|---------|--------|
| Extension `vector` | `db:pgvector-health` | `pgvector_extension=true` |
| `DocumentChunk` table | `db:pgvector-health` | `document_chunk_table=true` |
| Strict verify | `db:verify-pgvector` | **PASS** |
| Migrations | `prisma migrate deploy` on `:5434` | Includes `20260606120000_add_agent_memory` |

**DATABASE_URL used:**

```text
postgresql://postgres:postgres@localhost:5434/aqliya_pilot
```

**FF_AI_RAG:** `disabled` (health check does not fail when flag off).

---

## Remote staging host

| Check | Result | Notes |
|-------|--------|-------|
| `DATABASE_URL` for staging RDS | **Not executed in-agent** | No staging secret in repo; operator must run locally or in GitHub Actions with `secrets.DATABASE_URL` (staging). |
| HTTPS `staging.aqliya.ai/api/health` | **Not executed** | Requires live staging deployment + network from runner. |

### Operator runbook (staging)

```bash
export DATABASE_URL="<staging-postgres-url-with-pgvector>"
npm run db:pgvector-health
npm run db:verify-pgvector
```

Expected: both exit 0 with `pgvector=true`, `tableExists=true`.

---

## Verdict

| Environment | pgvector ready | Evidence |
|-------------|----------------|----------|
| Local Docker :5434 | **Yes** | Commands run 2026-06-06 |
| Remote staging | **Pending** | Requires operator `DATABASE_URL` |

**Status:** DONE_WITH_CONCERNS — local validated; remote staging pending credentials.
