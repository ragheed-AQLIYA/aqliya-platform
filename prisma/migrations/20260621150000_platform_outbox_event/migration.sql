-- Tier 2 Event Bus Phase 1 — transactional outbox on PlatformAuditLog writes
CREATE TABLE "PlatformOutboxEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "platformAuditLogId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformOutboxEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlatformOutboxEvent_status_createdAt_idx" ON "PlatformOutboxEvent"("status", "createdAt");
CREATE INDEX "PlatformOutboxEvent_organizationId_createdAt_idx" ON "PlatformOutboxEvent"("organizationId", "createdAt");
CREATE INDEX "PlatformOutboxEvent_eventType_status_idx" ON "PlatformOutboxEvent"("eventType", "status");
