# RAG Architecture Verification

**Finding 6 from `REVIEW_AFTER_PHASE2.md`** — RAG Architecture Audit

## Audit Claim

> "Duplicate implementations across three RAG-adjacent locations"

## Verdict: **PARTIALLY CONFIRMED** — Partially resolved by Phase 1C-3. Some issues remain.

---

## Current Architecture (After Phase 1C-3)

```
src/lib/core/knowledge/rag/   ← CANONICAL SOURCE OF TRUTH (11 files)
    │
    └── re-exported via ──→  src/lib/rag/  ← COMPATIBILITY SHIM (11 re-export stubs)
                                  │
                                  └── consumed by → 10 external consumers

src/lib/ai/retrieval/   ← SEPARATE INDEPENDENT LAYER (2 files, different embedding provider)
    │
    └── consumed by → src/lib/ai/review/ai-review-gate.ts (1 consumer)
```

---

## Directory Status

### `src/lib/rag/` (11 files) — Clean Re-export Shim ✅

After Phase 1C-3 fix, all files are uniform 4-line stubs:

```typescript
// Backward-compatible re-export. RAG pipeline moved to @/lib/core/knowledge/rag/.
export * from "@/lib/core/knowledge/rag/embedding-service";
```

**No duplicate implementations.** Files are byte-identical stubs.

### `src/lib/core/knowledge/rag/` (11 files) — Canonical Source of Truth ✅

All files contain real implementation:
- `vector-store.ts` (47 lines) — pgvector operations
- `rag-retriever.ts` (87 lines) — Search with audit logging
- `knowledge-service.ts` (241 lines) — CRUD with governance
- `intelligence-core-rag.ts` (95 lines) — Governed retrieval
- `hybrid-search.ts` (170 lines) — Vector + lexical search
- `embedding-service.ts` (103 lines) — Embedding orchestration
- `chunking-engine.ts` (137 lines) — Text splitting
- `embedding-provider.ts` (17 lines) — Singleton provider
- `governed-rag-metrics.ts` (95 lines) — Evidence/ranking
- `governance-metadata.ts` (44 lines) — Chunk metadata
- `index.ts` (34 lines) — Barrel export

### `src/lib/ai/retrieval/` (2 files) — Separate Independent Layer ❓

**NOT duplicate** — different embedding provider, different type system, different fallback strategy:
- `similarity-search.ts` (232 lines) — Uses `getDefaultEmbeddingProvider()` (NOT `getRagEmbeddingProvider()`)
- `context-builder.ts` (77 lines) — Context assembly with token limit

**Only consumer:** `src/lib/ai/review/ai-review-gate.ts`

---

## Remaining Issues

### Issue 1: 10 consumers still on the shim

| Consumer | Import | Should Import From |
|----------|--------|-------------------|
| `src/lib/ai/embedding/embedding-provider.ts` | `@/lib/rag/embedding-provider` | `@/lib/core/knowledge/rag/embedding-provider` |
| `src/lib/core/ai/orchestrator-rag-inject.ts` | `@/lib/rag/intelligence-core-rag` | `@/lib/core/knowledge/rag/intelligence-core-rag` |
| `src/lib/core/knowledge/engine.ts` | `@/lib/rag/intelligence-core-rag` | `@/lib/core/knowledge/rag/intelligence-core-rag` |
| `src/lib/core/knowledge/__tests__/engine.test.ts` | `@/lib/rag/intelligence-core-rag` | `@/lib/core/knowledge/rag/intelligence-core-rag` |
| `src/lib/ai/ingestion/ingestion-pipeline.ts` | `@/lib/rag/chunking-engine` | `@/lib/core/knowledge/rag/chunking-engine` |
| `src/__tests__/unit/knowledge-api.test.ts` | `@/lib/rag/knowledge-service` | `@/lib/core/knowledge/rag/knowledge-service` |
| `src/__tests__/unit/hybrid-search.test.ts` | `@/lib/rag/hybrid-search` | `@/lib/core/knowledge/rag/hybrid-search` |
| `src/app/api/ai/knowledge/route.ts` | `@/lib/rag/knowledge-service` | `@/lib/core/knowledge/rag/knowledge-service` |
| `src/app/api/ai/knowledge/search/route.ts` | `@/lib/rag/knowledge-service` | `@/lib/core/knowledge/rag/knowledge-service` |
| `src/app/api/ai/knowledge/ingest/route.ts` | `@/lib/rag/knowledge-service` | `@/lib/core/knowledge/rag/knowledge-service` |
| `src/app/api/ai/knowledge/metadata/route.ts` | `@/lib/rag/knowledge-service` | `@/lib/core/knowledge/rag/knowledge-service` |

**Impact:** Cannot remove shim until all consumers migrate.

### Issue 2: Canonical RAG depends on `@/lib/ai/types` (7 files)

`rag-retriever.ts`, `embedding-service.ts`, `intelligence-core-rag.ts`, `governed-rag-metrics.ts`, `hybrid-search.ts`, `chunking-engine.ts`, `embedding-provider.ts` all import from the "legacy" AI type layer.

**Impact:** Any type change in `@/lib/ai/types` affects the canonical RAG.

---

## Migration Plan

### Phase A: Migrate consumers (mechanical changes, low risk)
Update 10 files to import from canonical path instead of shim. Coordinate with module owners.

### Phase B: Resolve type dependency (optional)
Move shared types to `@/lib/core/ai/types` or duplicate locally. Low priority since imports are `type-only`.

### Phase C: Consolidate `src/lib/ai/retrieval/` (decision needed)
Options:
1. Keep separate — different embedding provider, different fallback strategy
2. Merge into canonical — would require adapting to use `getRagEmbeddingProvider`

---

## Conclusion

The audit's concern about duplicate RAG implementations was **partially valid but mostly resolved**:
- Phase 1C-3 already converted `src/lib/rag/` to clean re-export stubs (no duplicates)
- `src/lib/ai/retrieval/` is a separate independent layer, NOT a duplicate
- 10 consumers still route through the shim — cannot remove yet
- 7 canonical files still depend on `@/lib/ai/types` — low risk (type-only imports)
