# pgvector Staging — enable / migrate / verify (IC-01)

**Scope:** Staging Postgres only. **Forbidden:** production rollout, multi-env deploy, `terraform apply`.

---

## 1. Enable (Postgres image)

Standard `postgres:16-alpine` **does not** include the `vector` extension.

Use a pgvector-enabled image on **staging** compose:

```yaml
# docker-compose.staging.yml — db service
image: pgvector/pgvector:pg16
```

Start staging DB:

```bash
docker compose -f docker-compose.staging.yml up -d db
```

For local dev verification (optional):

```bash
docker compose -f docker-compose.yml -f docker-compose.pgvector.yml up -d db
npx prisma migrate deploy
npm run db:verify-pgvector
```

Or run `powershell -File scripts/ic/staging-ic01-activate.ps1` when Docker is available.

---

## 2. Migrate

Point `DATABASE_URL` at staging (never production for this runbook).

```bash
npx prisma migrate deploy
```

Migration: `20260605000001_ic01_pgvector_document_chunk`  
Creates `vector` extension, `DocumentChunk` table, HNSW index.

---

## 3. Verify

```bash
npm run db:verify-pgvector
```

Expected:

```json
{ "staging": true, "tableExists": true, "pgvector": true }
```

---

## 4. Activate RAG flags (staging app env)

```bash
FF_AI_RAG=true
FF_AI_REAL_PROVIDERS=true   # only when API keys set
OPENAI_API_KEY=...          # embeddings + optional LLM
```

See `docs/operations/ai-intelligence-activation.md`.

---

## 5. Smoke

```bash
npm run ic:smoke:cycle5          # offline metrics (CI-safe)
npm run ic:smoke:cycle5:live     # after server + flags on staging
```

Optional integration test (requires pgvector DB):

```bash
set IC01_PGVECTOR_INTEGRATION=true
npm test -- --testPathPatterns=ic01-pgvector.integration
```

---

## 6. Gate to Cycle 6 (A1-09)

Update **live** row in `ai-intelligence-activation.md` § Staging smoke log.  
Only then authorize `docs/operations/parallel-execution-cycle-6-plan.md`.

---

## Rollback

```sql
DROP INDEX IF EXISTS "DocumentChunk_embedding_hnsw_idx";
DROP TABLE IF EXISTS "DocumentChunk";
-- DROP EXTENSION vector;  -- only if no other tables use vector
```

Set `FF_AI_RAG=false` on staging app.
