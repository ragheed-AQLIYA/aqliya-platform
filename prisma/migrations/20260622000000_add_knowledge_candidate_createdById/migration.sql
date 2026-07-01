-- Add createdById to KnowledgeCandidate for creator provenance
ALTER TABLE "KnowledgeCandidate" ADD COLUMN "createdById" TEXT;

-- Add relation index
CREATE INDEX "KnowledgeCandidate_createdById_idx" ON "KnowledgeCandidate"("createdById");
