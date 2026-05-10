-- AlterTable
ALTER TABLE "AuditAiOutput" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "sourceEntityId" TEXT,
ADD COLUMN     "sourceEntityType" TEXT;

-- CreateIndex
CREATE INDEX "AuditAiOutput_engagementId_sourceEntityType_sourceEntityId_idx" ON "AuditAiOutput"("engagementId", "sourceEntityType", "sourceEntityId");
