-- AlterTable: Add merged audit fields to PlatformAuditLog
-- This migration adds columns for unified audit data from multiple source
-- audit models (AuditLog, AuditEvent, LocalContentAuditEvent, LcAiAuditEvent,
-- SalesAuditEvent, WorkflowAuditEvent).

ALTER TABLE "PlatformAuditLog" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "PlatformAuditLog" ADD COLUMN "beforeState" TEXT;
ALTER TABLE "PlatformAuditLog" ADD COLUMN "afterState" TEXT;
ALTER TABLE "PlatformAuditLog" ADD COLUMN "eventDescription" TEXT;
ALTER TABLE "PlatformAuditLog" ADD COLUMN "aiRelated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PlatformAuditLog" ADD COLUMN "aiConfidence" DOUBLE PRECISION;
ALTER TABLE "PlatformAuditLog" ADD COLUMN "aiStatus" TEXT;
ALTER TABLE "PlatformAuditLog" ADD COLUMN "inputSummary" JSONB;
ALTER TABLE "PlatformAuditLog" ADD COLUMN "outputSummary" JSONB;
ALTER TABLE "PlatformAuditLog" ADD COLUMN "durationMs" INTEGER;

-- CreateIndex: organization-level queries
CREATE INDEX "PlatformAuditLog_organizationId_createdAt_idx" ON "PlatformAuditLog"("organizationId", "createdAt");

-- CreateIndex: organization + action lookup
CREATE INDEX "PlatformAuditLog_organizationId_action_createdAt_idx" ON "PlatformAuditLog"("organizationId", "action", "createdAt");