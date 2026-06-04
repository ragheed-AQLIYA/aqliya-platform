-- IC-01 Cycle 5: pgvector extension + DocumentChunk (staging-ready)
-- Apply on staging Postgres only per program-execution-state.md

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "DocumentChunk" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "embedding" vector(1536),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DocumentChunk_organizationId_documentId_idx"
    ON "DocumentChunk"("organizationId", "documentId");

CREATE INDEX IF NOT EXISTS "DocumentChunk_organizationId_chunkIndex_idx"
    ON "DocumentChunk"("organizationId", "chunkIndex");

-- HNSW supports empty tables on pgvector >= 0.5; skip if extension version incompatible (ops fallback: IVFFlat after seed)
CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_hnsw_idx"
    ON "DocumentChunk" USING hnsw ("embedding" vector_cosine_ops);
