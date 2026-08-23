# AQLIYA IFRS RAG Ingestion Report

**Date:** 2026-08-18
**Scope:** RAG pipeline implementation analysis for IFRS knowledge foundation assets
**Status:** Pipeline exists but is not connected to knowledge foundation

---

## 1. EXECUTIVE SUMMARY

The RAG pipeline is **functional for user-uploaded documents** but has **no bridge** to the knowledge foundation asset system. The pipeline supports chunking, embedding (OpenAI/Ollama), vector storage (pgvector), hybrid search (vector + lexical), governed retrieval, and evidence citations. However, no code reads knowledge foundation asset.json/rules.json/guidance.json files, extracts content, or feeds it into the pipeline.

---

## 2. PIPELINE ARCHITECTURE

### 2.1 Ingestion Path

```
Source: User upload or API call
  ↓
API: src/app/api/ai/knowledge/ingest/route.ts
  ↓
Service: src/lib/core/knowledge/rag/knowledge-service.ts
  → ingestKnowledgeDocument()
    → assertKnowledgeEnabled() [checks FF_AI_RAG]
    → embedAndStore()
      → chunkText() [src/lib/core/knowledge/rag/chunking-engine.ts]
      → provider.embed() [src/lib/core/knowledge/rag/embedding-provider.ts]
      → prisma.documentChunk.createManyAndReturn()
      → storeChunkEmbedding() [src/lib/core/knowledge/rag/vector-store.ts]
      → writePlatformAuditLog()
```

### 2.2 Retrieval Path

```
Query: search query string
  ↓
Service: src/lib/core/knowledge/rag/knowledge-service.ts
  → searchKnowledge()
    → assertKnowledgeEnabled()
    → retrieveGovernedContext() [src/lib/core/knowledge/rag/intelligence-core-rag.ts]
      → searchChunks() [src/lib/core/knowledge/rag/rag-retriever.ts]
        → hybridSearchChunks() [src/lib/core/knowledge/rag/hybrid-search.ts]
          → searchVector() [pgvector cosine similarity]
          → searchLexical() [Prisma contains search]
      → buildEvidenceRefs()
      → buildRankingMetrics()
    → toGovernedRAGPayload()
```

### 2.3 Orchestrator Integration

```
AI Request → injectGovernedRagIntoRequest()
  → retrieveGovernedContext()
  → injects ragContext, ragEvidence, ragRanking, ragGovernance into taskInput
```

---

## 3. KEY FILES

### 3.1 Core RAG Module

| File | Lines | Role | Status |
|------|-------|------|--------|
| `src/lib/core/knowledge/rag/index.ts` | 34 | Public exports | ✓ Complete |
| `src/lib/core/knowledge/rag/embedding-service.ts` | 104 | Chunk + embed + store | ✓ Functional |
| `src/lib/core/knowledge/rag/chunking-engine.ts` | 137 | Text chunking | ✓ Functional |
| `src/lib/core/knowledge/rag/vector-store.ts` | 47 | pgvector storage | ✓ Functional |
| `src/lib/core/knowledge/rag/hybrid-search.ts` | 171 | Vector + lexical search | ✓ Functional |
| `src/lib/core/knowledge/rag/rag-retriever.ts` | 87 | Search entry point | ✓ Functional |
| `src/lib/core/knowledge/rag/intelligence-core-rag.ts` | 95 | Governed retrieval | ✓ Functional |
| `src/lib/core/knowledge/rag/knowledge-service.ts` | 240 | Knowledge API | ✓ Functional |
| `src/lib/core/knowledge/rag/governance-metadata.ts` | 44 | Governance metadata | ✓ Functional |
| `src/lib/core/knowledge/rag/governed-rag-metrics.ts` | 95 | Evidence + ranking | ✓ Functional |
| `src/lib/core/knowledge/rag/embedding-provider.ts` | — | Provider abstraction | ✓ Functional |

### 3.2 Ingestion Pipeline

| File | Lines | Role | Status |
|------|-------|------|--------|
| `src/lib/core/ai/ingestion/ingestion-pipeline.ts` | 345 | Batch ingestion | ✓ Functional |
| `src/actions/ingestion-actions.ts` | 110 | Server actions | ✓ Functional |
| `src/app/api/ai/knowledge/ingest/route.ts` | — | API endpoint | ✓ Functional |

### 3.3 Feature Flags

| Flag | Key | Status | Description |
|------|-----|--------|-------------|
| AI RAG/pgvector Pipeline | `ai.rag` | **ON** | Enables embeddings and vector search |

### 3.4 Database Schema

| Model | Table | Key Fields | Status |
|-------|-------|------------|--------|
| `DocumentChunk` | DocumentChunk | id, organizationId, documentId, chunkIndex, content, tokenCount, metadata, embedding (vector 1536), embeddingJson, createdBy, createdAt | ✓ |
| `IngestionBatch` | IngestionBatch | id, organizationId, status, source, totalDocuments, processedCount, failedCount, metadata, createdById, createdAt, completedAt, errorMessage | ✓ |
| `IngestionDocument` | IngestionDocument | id, organizationId, batchId, documentId, title, sourceType, status, contentHash, totalChunks, tokenCount, metadata, createdById, createdAt, completedAt, errorMessage | ✓ |

---

## 4. CHUNKING ENGINE

### 4.1 Strategy: Paragraph-based (default)

```typescript
// chunking-engine.ts
const DEFAULT_OPTIONS = {
  chunkSize: 1024,    // characters
  chunkOverlap: 128,  // characters
  minChunkSize: 10,   // characters
}
```

### 4.2 Process

1. Split text by double newlines (paragraphs)
2. If paragraph fits in chunkSize → single chunk
3. If paragraph exceeds chunkSize → split by sentences
4. Accumulate sentences until chunkSize exceeded → emit chunk
5. Apply overlap from previous chunk
6. Filter chunks below minChunkSize

### 4.3 Token Estimation

```typescript
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}
```

### 4.4 Consistency

The chunking engine is deterministic — same input produces same output (verified by test).

---

## 5. EMBEDDING PROVIDERS

### 5.1 OpenAI Provider

| Property | Value |
|----------|-------|
| Model | `text-embedding-3-small` |
| Dimensions | 1536 |
| Endpoint | `https://api.openai.com/v1/embeddings` |
| Timeout | Configurable via `OPENAI_EMBEDDING_HTTP_TIMEOUT_MS` |

### 5.2 Ollama Provider

| Property | Value |
|----------|-------|
| Model | `nomic-embed-text` |
| Endpoint | `{baseUrl}/api/embeddings` |
| Timeout | Configurable via `LOCAL_EMBEDDING_TIMEOUT_MS` |

### 5.3 Provider Selection

```typescript
// embedding-provider.ts
export function getRagEmbeddingProvider(): EmbeddingProvider {
  // Returns OpenAI if OPENAI_API_KEY is set
  // Returns Ollama if OLLAMA_BASE_URL is set
  // Throws if neither is configured
}
```

---

## 6. VECTOR STORE

### 6.1 pgvector Support

```typescript
// vector-store.ts
const EMBEDDING_DIMENSIONS = 1536

export async function isPgVectorAvailable(): Promise<boolean> {
  // Checks pg_extension for 'vector'
}
```

### 6.2 Storage Strategy

1. If pgvector available → store as `embedding vector(1536)`
2. If pgvector unavailable → store as `embeddingJson JSON`
3. Fallback: JSON storage with in-memory cosine similarity

### 6.3 Query Strategy

```sql
-- Vector search
SELECT id, "documentId", content, metadata,
       1 - (embedding <=> $1::vector) AS similarity
FROM "DocumentChunk"
WHERE "embedding" IS NOT NULL
  AND "organizationId" = $2
ORDER BY embedding <=> $1::vector
LIMIT $3
```

---

## 7. HYBRID SEARCH

### 7.1 Mode Selection

1. **Vector-first**: Try vector search first
2. **Lexical fallback**: If vector returns empty, try lexical (Prisma `contains`)
3. **Empty**: If both return empty, return empty results

### 7.2 Lexical Scoring

```typescript
const LEXICAL_BASE_SIMILARITY = 0.35
// Each result decreases by 0.02, minimum 0.1
```

### 7.3 Deduplication

Results are deduplicated by `chunkId` across vector and lexical results.

---

## 8. GOVERNANCE

### 8.1 Chunk Metadata

Every chunk gets governance metadata:

```typescript
{
  productKey: "ai_core",
  sourceDocumentId: documentId,
  sourceType: "document",
  sensitivity: "internal",  // default
  retentionDays: 365,       // default
  ingestedAt: ISO timestamp
}
```

### 8.2 Evidence References

```typescript
{
  chunkId: string,
  documentId: string,
  similarity: number,
  rank: number,
  contentPreview: string,  // first 200 chars
  governance: RAGGovernanceMetadata
}
```

### 8.3 Audit Logging

Every operation is audit-logged:
- `embedding_created` — after successful embedding
- `embedding_deleted` — after deletion
- `rag_search` — after retrieval
- `knowledge_ingest` — after ingestion
- `knowledge_delete` — after deletion
- `ingestion_document_processed` — after batch processing
- `ingestion_document_failed` — on failure
- `ingestion_batch_completed` — after batch completion

---

## 9. TENANT ISOLATION

| Check | Status | Evidence |
|-------|--------|----------|
| organizationId on chunks | ✓ | DocumentChunk schema |
| Vector query scoping | ✓ | `WHERE "organizationId" = $1` in SQL |
| Lexical query scoping | ✓ | `where: { organizationId }` in Prisma |
| Cross-tenant prevention | ✓ | `resolveKnowledgeOrganizationId()` checks role |
| API-level scoping | ✓ | `ingestKnowledgeDocument()` requires organizationId |

---

## 10. WHAT'S MISSING FOR IFRS ASSETS

### 10.1 No Bridge Module

There is no code that:
- Reads `knowledge-foundation/domains/ifrs/*/asset.json`
- Reads `knowledge-foundation/domains/ifrs/*/rules.json`
- Reads `knowledge-foundation/domains/ifrs/*/guidance.json`
- Extracts content from these files
- Feeds content into `embedAndStore()` or `IngestionPipeline`

### 10.2 No Content to Ingest

The asset.json files contain **metadata only** — no standard text. The rules.json files contain **rule text** (e.g., "A.1.1 Inventories shall be measured at the lower of cost and net realisable value") but these are short extracts, not full standard text.

The guidance.json files have `"guidance": []` — **empty arrays**.

### 10.3 No Version Tracking

The DocumentChunk schema has no field for:
- `standardCode` (e.g., "IAS 2")
- `standardVersion` (e.g., "IAS 2:2024")
- `paragraphReference` (e.g., "IAS 2.A1.1")
- `sourceUrl` (e.g., "https://www.ifrs.org/...")

### 10.4 No Stale-Content Detection

There is no mechanism to:
- Detect when a standard has been updated
- Flag ingested chunks as stale
- Trigger re-ingestion of updated content

### 10.5 No Deduplication on Re-Ingestion

The `IngestionDocument.contentHash` field exists but is never set during ingestion. Re-ingesting the same standard would create duplicate chunks.

---

## 11. RECOMMENDED ARCHITECTURE FOR IFRS RAG

### 11.1 Bridge Module (R-01)

```
src/lib/core/knowledge/rag/ifrs-bridge.ts
  → readAssetJson(standardDir) → IfrsAsset
  → extractContent(asset, rules, guidance) → string
  → ingestIfrsStandard(organizationId, standardDir)
    → reads asset.json + rules.json + guidance.json
    → extracts authoritative content
    → calls embedAndStore() with enriched metadata
    → metadata includes: standardCode, versionLabel, paragraphRef, sourceUrl
```

### 11.2 Schema Extension (R-03)

```prisma
model DocumentChunk {
  // ... existing fields ...
  standardCode    String?   // "IAS 2"
  standardVersion String?   // "IAS 2:2024"
  paragraphRef    String?   // "IAS 2.A1.1"
  sourceUrl       String?   // "https://www.ifrs.org/..."
  contentHash     String?   // for deduplication
}
```

### 11.3 Citation Enhancement

```typescript
// Enhanced evidence ref
{
  chunkId: string,
  documentId: string,
  standardCode: string,      // NEW
  standardVersion: string,    // NEW
  paragraphRef: string,       // NEW
  sourceUrl: string,          // NEW
  similarity: number,
  rank: number,
  contentPreview: string,
  governance: RAGGovernanceMetadata
}
```

---

## 12. VALIDATION RESULTS

| Check | Result |
|-------|--------|
| TypeScript compilation | 0 errors |
| RAG pipeline tests | Passing (existing) |
| Knowledge foundation tests | Passing (existing) |
| IFRS rule tests | 815 passing |
| RAG ingestion of IFRS assets | **Not possible** — no bridge |
| RAG retrieval of IFRS content | **Not possible** — no content |

---

*This report documents the current state of the RAG pipeline and its relationship to IFRS knowledge foundation assets. No files were modified.*
