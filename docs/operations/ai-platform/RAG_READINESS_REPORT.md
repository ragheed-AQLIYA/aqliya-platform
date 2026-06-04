# RAG Readiness Report

**Date:** 2026-06-04  
**Intelligence Core:** IC-01 Governed RAG  
**Score context:** Pilot 81/100 — GO WITH CONDITIONS

## Pipeline status

| Stage | Module | Status | Notes |
|-------|--------|--------|-------|
| Chunking | `chunking-engine.ts` | ✅ | Paragraph/sentence aware |
| Embedding | `embedding-service.ts` + `embedding-provider.ts` | ✅ | OpenAI `text-embedding-3-small` (1536d) |
| Vector store | `vector-store.ts` | ✅ | Raw SQL `vector` update; graceful degrade without pgvector |
| Hybrid retrieval | `hybrid-search.ts` | ✅ | Vector-first; lexical when vector empty |
| Governed chain | `intelligence-core-rag.ts` | ✅ | retrieval → ranking → evidence → governance |
| Orchestrator inject | `orchestrator-rag-inject.ts` | ✅ | `generate()` + `generateStream()` parity |
| Audit | `rag-retriever.ts` | ✅ | `rag_search` with `retrievalMode` |

## Feature flags

| Flag | Effect |
|------|--------|
| `FF_AI_RAG=true` | Enables `ai.rag`, Knowledge APIs, orchestrator RAG inject |
| `FF_AI_REAL_PROVIDERS=true` | Real LLM path (optional for RAG retrieval) |

## Validation (repo)

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| `rag-ic01`, `intelligence-core-rag`, `hybrid-search`, `knowledge-api` tests | Pass (after hybrid fallback fix) |
| `ic01-pgvector.integration` | Requires pgvector DB (OpenCode) |

## Blockers (external)

1. Migration `20260605000001_ic01_pgvector_document_chunk` deploy — **OpenCode**
2. Staging smoke — `scripts/verify-pgvector-staging.ts`, `ai-intelligence-activation.md`

## Readiness label

**Repo: RAG production-ready with conditions**  
**Live: Not until pgvector migration applied on target environment**

## Risks

- Lexical fallback weaker than vector — logged as `retrievalMode: lexical`
- Embedding API dependency when ingesting/searching
- No merge-rank hybrid yet (vector OR lexical, not blended ranking)
