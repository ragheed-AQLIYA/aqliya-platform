-- Intelligence Core — governed document ingestion (IC-01 extension)
-- Prisma models: IngestionBatch, IngestionDocument

CREATE TABLE "IngestionBatch" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "totalDocuments" INTEGER NOT NULL DEFAULT 0,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    CONSTRAINT "IngestionBatch_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IngestionBatch_organizationId_status_createdAt_idx" ON "IngestionBatch"("organizationId", "status", "createdAt");

CREATE TABLE "IngestionDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "title" TEXT,
    "sourceType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "contentHash" TEXT,
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "tokenCount" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    CONSTRAINT "IngestionDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IngestionDocument_organizationId_batchId_idx" ON "IngestionDocument"("organizationId", "batchId");
CREATE INDEX "IngestionDocument_organizationId_documentId_idx" ON "IngestionDocument"("organizationId", "documentId");

ALTER TABLE "IngestionDocument" ADD CONSTRAINT "IngestionDocument_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "IngestionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
