-- CreateTable
CREATE TABLE "PilotFeedback" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "decision" TEXT,
    "owner" TEXT,
    "nextAction" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilotFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBlocker" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'critical',
    "status" TEXT NOT NULL DEFAULT 'open',
    "requiredBefore" TEXT NOT NULL DEFAULT 'production',
    "owner" TEXT,
    "resolutionPlan" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionBlocker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PilotSignoff" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "checklistItem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "signedBy" TEXT,
    "signedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilotSignoff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PilotSignoff_engagementId_checklistItem_key" ON "PilotSignoff"("engagementId", "checklistItem");

-- AddForeignKey
ALTER TABLE "PilotFeedback" ADD CONSTRAINT "PilotFeedback_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBlocker" ADD CONSTRAINT "ProductionBlocker_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilotSignoff" ADD CONSTRAINT "PilotSignoff_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
