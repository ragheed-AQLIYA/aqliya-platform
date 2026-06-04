# Intelligence Core — RAG Pipeline

> Private Governed Institutional Intelligence — Retrieval-Augmented Generation

## Architecture

```
User Query → Embedding Provider → Similarity Search → Context Builder → AI Review Gate
                  ↓                                                           ↓
           DocumentChunks                                              Audit Log
                  ↓
          Institutional Memory (Graph)
```

## Pipeline Components

### 1. Embedding Provider (`src/lib/ai/embedding/embedding-provider.ts`)

Abstract interface for text embedding with three implementations:

| Provider | Type | Description |
|----------|------|-------------|
| Mock | `mock` | Deterministic 1536-dim vectors for dev/test. No API key needed. |
| OpenAI | `openai` | Real embeddings via OpenAI API. Requires `OPENAI_API_KEY`. |
| Local | `local` | Placeholder for future local model integration. |

**Configuration:**

```env
EMBEDDING_PROVIDER=mock|openai|local   # default: mock
OPENAI_API_KEY=sk-...                   # required for openai provider
```

**Usage:**

```typescript
import { createEmbeddingProvider, getDefaultEmbeddingProvider } from "@/lib/ai/embedding/embedding-provider"

const provider = createEmbeddingProvider("mock")
const embedding = await provider.embed("text to embed")
const batch = await provider.embedBatch(["text1", "text2"])
```

### 2. Ingestion Pipeline (`src/lib/ai/ingestion/ingestion-pipeline.ts`)

Processes documents through chunking → embedding → storage.

**Chunking Strategies:**

| Strategy | Behavior | Best For |
|----------|----------|----------|
| `paragraph` | Split on paragraph boundaries | Documents with clear structure |
| `sentence` | Split on sentence boundaries with overlap | Long articles, reports |
| `fixed` | Fixed-size character chunks | Raw text, no structure |

**Configuration:**

```typescript
const chunks = chunkText(text, {
  chunkSize: 1024,      // max chars per chunk
  chunkOverlap: 128,    // overlap between chunks
  strategy: "paragraph",
})
```

**Storage:**
- pgvector `vector(1536)` column when pgvector extension is available
- JSON fallback via `embeddingJson` column when pgvector is unavailable

### 3. Similarity Search (`src/lib/ai/retrieval/similarity-search.ts`)

Three-tier search strategy:

1. **pgvector** — `ORDER BY embedding <-> query LIMIT k` (fast, accurate)
2. **JSON fallback** — Cosine similarity computed in JS (slower, but works without pgvector)
3. **Lexical fallback** — Text contains matching (when no embeddings available)

```typescript
const results = await findSimilarChunks("search query", {
  k: 10,
  minScore: 0.3,
  organizationId: "org-123",
})
```

### 4. Context Builder (`src/lib/ai/retrieval/context-builder.ts`)

Retrieves chunks and formats them for LLM prompt injection with token budgeting.

```typescript
const ctx = await buildContext("query", 3000, { organizationId: "org-123" })
// ctx.context — formatted string
// ctx.evidence  — source references
// ctx.truncated — whether context was truncated
```

### 5. Institutional Memory (`src/lib/ai/memory/institutional-memory.ts`)

Knowledge graph for institutional intelligence:

| Function | Description |
|----------|-------------|
| `storeQuery` | Record search query + results |
| `storeInsight` | Store derived insight with source references |
| `createEntity` | Create knowledge graph node |
| `createRelation` | Create edge between nodes |
| `getQueryHistory` | Past queries |
| `getRelatedInsights` | Find insights related to topic |
| `getEntityRelations` | Get node's connections |

### 6. AI Review Gate (`src/lib/ai/review/ai-review-gate.ts`)

Governance layer ensuring every AI output:

- Links back to source chunks/evidence
- Shows confidence score
- Shows model/provider used
- Lists limitations
- Requires human review before use
- Is audited via `PlatformAuditLog`

```typescript
import { generateSuggestion, formatSuggestionForReview, logAIAction } from "@/lib/ai/review/ai-review-gate"

const suggestion = await generateSuggestion(chunks, "analysis text")
const formatted = formatSuggestionForReview(suggestion)
await logAIAction("suggestion_generated", input, output, userId, orgId)
```

## Governance Rules

Every AI feature using the Intelligence Core must obey:

1. **AI assists. Humans decide. Evidence governs.** — Never present AI output as final decision.
2. **Audit trail** — Every query, ingestion, and suggestion is logged.
3. **Source evidence** — Every output must reference source chunks.
4. **Confidence transparency** — Always show confidence score and limitations.
5. **Human review** — All AI-generated content requires human review before use as decision support.
6. **No autonomous decisions** — AI must not approve, export, or act without human approval.

## Provider Configuration

```env
# Embedding
EMBEDDING_PROVIDER=mock        # mock | openai | local
OPENAI_API_KEY=sk-...          # Required for openai

# Storage (automatic)
# pgvector extension: uses vector column
# No pgvector: uses JSON fallback with JS cosine similarity
```

## Prisma Schema Models

| Model | Purpose |
|-------|---------|
| `DocumentChunk` | Text chunks with embeddings (vector + JSON) |
| `IntelligenceGraphNode` | Knowledge graph entities, concepts, insights |
| `IntelligenceGraphEdge` | Relationships between nodes |
| `IntelligenceQuery` | Query history with results |
| `IngestionBatch` | Batch ingestion tracking |
| `IngestionDocument` | Individual document ingestion status |

## Testing

```bash
npx jest src/lib/ai/__tests__/embedding-provider.test.ts
npx jest src/lib/ai/__tests__/ingestion-pipeline.test.ts
npx jest src/lib/ai/__tests__/similarity-search.test.ts
npx jest src/lib/ai/__tests__/institutional-memory.test.ts
```

## Bilingual Notes

- Code identifiers, types, and function names use English for technical consistency
- Documentation and inline comments should be bilingual (Arabic/English) where user-facing
- All AI-generated outputs should be available in Arabic for primary user flows
- English terms in UI must be intentional, not accidental
