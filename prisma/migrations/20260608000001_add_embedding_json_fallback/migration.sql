-- Add JSON fallback column for pgvector compatibility
-- When pgvector extension is not available, embeddings are stored as JSON

ALTER TABLE "DocumentChunk"
ADD COLUMN IF NOT EXISTS "embedding_json" JSONB;
