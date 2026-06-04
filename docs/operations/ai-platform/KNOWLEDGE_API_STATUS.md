# Knowledge API Status

**Date:** 2026-06-04  
**Owner:** Cursor (Product & AI Integration Director)  
**Pilot gate:** PILOT_VALIDATION_COMPLETE — GO WITH CONDITIONS  
**Deployment:** Blocked on OpenCode (`20260605000001_ic01_pgvector_document_chunk`)

## Summary

Governed Knowledge APIs are implemented in-repo and gated by `FF_AI_RAG=true` (`ai.rag` feature flag). No Prisma schema changes in this slice.

## Endpoints

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | `/api/ai/knowledge/ingest` | OPERATOR | Embed + store document chunks |
| GET | `/api/ai/knowledge/search` | VIEWER | Governed search (`retrieveGovernedContext` + hybrid retrieval) |
| GET | `/api/ai/knowledge/metadata` | VIEWER | Document chunk metadata aggregate |
| DELETE | `/api/ai/knowledge` | OPERATOR | Delete embeddings for `documentId` |

## Service layer

- `src/lib/rag/knowledge-service.ts` — tenant scope, audit logs, flag gate
- `src/lib/rag/hybrid-search.ts` — vector-first, lexical fallback
- `src/lib/ai/api-errors.ts` — shared API error mapping

## Governance

- `organizationId` must match session org (ADMIN may override)
- All writes emit `knowledge_ingest` / `knowledge_delete` platform audit events
- Search reuses IC-01 governed chain (evidence + ranking + governance metadata)
- Outputs are informational — human review required downstream

## Activation

```bash
FF_AI_RAG=true
OPENAI_API_KEY=<for embeddings>
# pgvector extension + DocumentChunk migration on target DB (OpenCode)
```

## Readiness

| Item | Status |
|------|--------|
| API routes | ✅ In repo |
| Unit tests | ✅ `knowledge-api.test.ts` |
| Staging pgvector | ⏳ OpenCode deployment gate |
| Production | ❌ Not claimed |

## Next (post-deployment)

- Index status webhook for async ingest queues (OpenCode infra)
- Rate limits per org on ingest (Platform)
