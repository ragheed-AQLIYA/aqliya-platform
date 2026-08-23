-- Forward repair: close the gap between the migration chain and schema.prisma.
--
-- One table and ten indexes exist in prisma/schema.prisma and in every running
-- database, but NO migration in this repository has ever created them. They
-- were applied out of band while the chain was stalled at
-- 20260605000001_ic01_pgvector_document_chunk (pgvector was not installed on
-- the server, the migration failed, and Prisma halts at a failure).
--
-- Without this migration, an environment built from migrations alone -- CI, a
-- new developer machine, a disaster-recovery restore -- comes up missing the
-- Notification table entirely.
--
-- Every statement is idempotent, so this is a no-op wherever the objects
-- already exist and effective wherever they do not. Purely additive: no DROP,
-- no RENAME, no TRUNCATE, no ALTER COLUMN.
--
-- Verified 2026-08-22: applied to a clean-room database built by replaying the
-- full chain, after which `prisma migrate diff` against schema.prisma reported
-- "No difference detected"; applied twice in a row without error; applied to a
-- data-carrying clone of development with zero row change.

-- CreateTable
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_organizationId_createdAt_idx" ON "Notification"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Approval_decisionId_status_idx" ON "Approval"("decisionId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditEngagement_organizationId_status_idx" ON "AuditEngagement"("organizationId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditFinding_engagementId_status_idx" ON "AuditFinding"("engagementId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Decision_organizationId_status_idx" ON "Decision"("organizationId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Decision_organizationId_priority_idx" ON "Decision"("organizationId", "priority");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "KnowledgeCandidateEvidence_organizationId_idx" ON "KnowledgeCandidateEvidence"("organizationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LocalContentProject_organizationId_status_idx" ON "LocalContentProject"("organizationId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SunbulRecord_clientId_status_idx" ON "SunbulRecord"("clientId", "status");

-- AddForeignKey
DO $repair$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_userId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $repair$;

-- AddForeignKey
DO $repair$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_organizationId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $repair$;
