# Intelligence Core — RAG Pipeline
# نواة الذكاء — خط أنابيب التوليد المعزز بالاسترجاع

> Private Governed Institutional Intelligence — Retrieval-Augmented Generation
> ذكاء مؤسسي خاص ومحكوم — توليد معزز بالاسترجاع
> **Language:** Bilingual (Arabic/English) | **Level:** L6 Production-hardened

---

## Architecture — المعمارية

```
User Query → Embedding Provider → Similarity Search → Context Builder → AI Review Gate
                  ↓                                                           ↓
           DocumentChunks                                              Audit Log
                  ↓
          Institutional Memory (Graph)
```

## Pipeline Components — مكونات خط الأنابيب

### 1. Embedding Provider — مزود التضمين (`src/lib/ai/embedding/embedding-provider.ts`)

Abstract interface for text embedding with three implementations:
واجهة مجردة لتضمين النصوص بثلاث تطبيقات:

| Provider | Type | Description |
|----------|------|-------------|
| Mock | `mock` | Deterministic 1536-dim vectors for dev/test. No API key needed. |
| OpenAI | `openai` | Real embeddings via OpenAI API. Requires `OPENAI_API_KEY`. |
| Local | `local` | Placeholder for future local model integration. |

**Configuration — الإعدادات:**

```env
EMBEDDING_PROVIDER=mock|openai|local   # default: mock
OPENAI_API_KEY=sk-...                   # required for openai provider
```

**Usage — الاستخدام:**

```typescript
import { createEmbeddingProvider, getDefaultEmbeddingProvider } from "@/lib/ai/embedding/embedding-provider"

const provider = createEmbeddingProvider("mock")
const embedding = await provider.embed("text to embed")
const batch = await provider.embedBatch(["text1", "text2"])
```

### 2. Ingestion Pipeline — خط أنابيب الاستيعاب (`src/lib/ai/ingestion/ingestion-pipeline.ts`)

Processes documents through chunking → embedding → storage.

**Chunking Strategies — استراتيجيات التجزئة:**

| Strategy | Behavior | Best For |
|----------|----------|----------|
| `paragraph` | Split on paragraph boundaries | Documents with clear structure |
| `sentence` | Split on sentence boundaries with overlap | Long articles, reports |
| `fixed` | Fixed-size character chunks | Raw text, no structure |

**Configuration — الإعدادات:**

```typescript
const chunks = chunkText(text, {
  chunkSize: 1024,      // max chars per chunk
  chunkOverlap: 128,    // overlap between chunks
  strategy: "paragraph",
})
```

**Storage — التخزين:**
- pgvector `vector(1536)` column when pgvector extension is available
- JSON fallback via `embeddingJson` column when pgvector is unavailable

### 3. Similarity Search — البحث بالتشابه (`src/lib/ai/retrieval/similarity-search.ts`)

Three-tier search strategy — استراتيجية بحث ثلاثية المستويات:

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

### 4. Context Builder — بناء السياق (`src/lib/ai/retrieval/context-builder.ts`)

Retrieves chunks and formats them for LLM prompt injection with token budgeting.
يسترجع الأجزاء وينسقها لحقنها في الموجه مع ميزانية الرموز.

```typescript
const ctx = await buildContext("query", 3000, { organizationId: "org-123" })
// ctx.context — formatted string
// ctx.evidence  — source references — مراجع المصادر
// ctx.truncated — whether context was truncated
```

### 5. Institutional Memory — الذاكرة المؤسسية (`src/lib/ai/memory/institutional-memory.ts`)

Knowledge graph for institutional intelligence — رسم بياني معرفي للذكاء المؤسسي:

| Function | Description |
|----------|-------------|
| `storeQuery` | Record search query + results |
| `storeInsight` | Store derived insight with source references |
| `createEntity` | Create knowledge graph node |
| `createRelation` | Create edge between nodes |
| `getQueryHistory` | Past queries |
| `getRelatedInsights` | Find insights related to topic |
| `getEntityRelations` | Get node's connections |

### 6. AI Review Gate — بوابة مراجعة الذكاء الاصطناعي (`src/lib/ai/review/ai-review-gate.ts`)

Governance layer ensuring every AI output — طبقة حوكمة تضمن أن كل مخرج ذكاء اصطناعي:

- Links back to source chunks/evidence — يرتبط بمصادر/أدلة
- Shows confidence score — يظهر درجة الثقة
- Shows model/provider used — يظهر النموذج/المزود المستخدم
- Lists limitations — يسرد القيود
- Requires human review before use — يتطلب مراجعة بشرية قبل الاستخدام
- Is audited via `PlatformAuditLog` — مدقق عبر سجل التدقيق

```typescript
import { generateSuggestion, formatSuggestionForReview, logAIAction } from "@/lib/ai/review/ai-review-gate"

const suggestion = await generateSuggestion(chunks, "analysis text")
const formatted = formatSuggestionForReview(suggestion)
await logAIAction("suggestion_generated", input, output, userId, orgId)
```

## Governance Rules — قواعد الحوكمة

Every AI feature using the Intelligence Core must obey:
كل ميزة ذكاء اصطناعي تستخدم نواة الذكاء يجب أن تلتزم بـ:

1. **AI assists. Humans decide. Evidence governs.** — Never present AI output as final decision.
   **الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.** — لا تقدم مخرجات الذكاء الاصطناعي كقرار نهائي.

2. **Audit trail** — Every query, ingestion, and suggestion is logged.
   **سجل التدقيق** — كل استعلام واستيعاب واقتراح مسجل.

3. **Source evidence** — Every output must reference source chunks.
   **أدلة المصدر** — كل مخرج يجب أن يشير إلى أجزاء المصدر.

4. **Confidence transparency** — Always show confidence score and limitations.
   **شفافية الثقة** — أظهر دائماً درجة الثقة والقيود.

5. **Human review** — All AI-generated content requires human review before use as decision support.
   **المراجعة البشرية** — كل محتوى منتج بالذكاء الاصطناعي يتطلب مراجعة بشرية قبل الاستخدام.

6. **No autonomous decisions** — AI must not approve, export, or act without human approval.
   **لا قرارات ذاتية** — لا يحق للذكاء الاصطناعي الاعتماد أو التصدير أو التصرف دون موافقة بشرية.

## Provider Configuration — إعدادات المزود

```env
# Embedding
EMBEDDING_PROVIDER=mock        # mock | openai | local
OPENAI_API_KEY=sk-...          # Required for openai

# Storage (automatic)
# pgvector extension: uses vector column
# No pgvector: uses JSON fallback with JS cosine similarity
```

## Prisma Schema Models — نماذج مخطط بريزما

| Model | Purpose | الغرض |
|-------|---------|-------|
| `DocumentChunk` | Text chunks with embeddings (vector + JSON) | أجزاء النص مع التضمينات |
| `IntelligenceGraphNode` | Knowledge graph entities, concepts, insights | كيانات الرسم البياني المعرفي |
| `IntelligenceGraphEdge` | Relationships between nodes | العلاقات بين العقد |
| `IntelligenceQuery` | Query history with results | سجل الاستعلامات مع النتائج |
| `IngestionBatch` | Batch ingestion tracking | تتبع دفعات الاستيعاب |
| `IngestionDocument` | Individual document ingestion status | حالة استيعاب المستندات الفردية |

## Testing — الاختبارات

```bash
npx jest src/lib/ai/__tests__/embedding-provider.test.ts
npx jest src/lib/ai/__tests__/ingestion-pipeline.test.ts
npx jest src/lib/ai/__tests__/similarity-search.test.ts
npx jest src/lib/ai/__tests__/institutional-memory.test.ts
```

## Bilingual Notes — ملاحظات ثنائية اللغة

- Code identifiers, types, and function names use English for technical consistency
  معرفات الكود والأنواع وأسماء الدوال تستخدم الإنجليزية للاتساق التقني
- Documentation and inline comments should be bilingual (Arabic/English) where user-facing
  التوثيق والتعليقات يجب أن تكون ثنائية اللغة (عربي/إنجليزي) حيث تواجه المستخدم
- All AI-generated outputs should be available in Arabic for primary user flows
  جميع مخرجات الذكاء الاصطناعي يجب أن تكون متاحة بالعربية لتدفقات المستخدم الأساسية
- English terms in UI must be intentional, not accidental
  المصطلحات الإنجليزية في الواجهة يجب أن تكون مقصودة، وليست عشوائية
