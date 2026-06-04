-- CreateTable
CREATE TABLE "PlatformSecret" (
    "key" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "description" TEXT,
    "rotationPeriodDays" INTEGER,
    "lastRotatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSecret_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PlatformNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'in_app',
    "severity" TEXT NOT NULL DEFAULT 'info',
    "recipientId" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "organizationId" TEXT,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformSecret_createdAt_idx" ON "PlatformSecret"("createdAt");

-- CreateIndex
CREATE INDEX "PlatformNotification_recipientId_readAt_idx" ON "PlatformNotification"("recipientId", "readAt");

-- CreateIndex
CREATE INDEX "PlatformNotification_organizationId_idx" ON "PlatformNotification"("organizationId");

-- CreateIndex
CREATE INDEX "PlatformNotification_createdAt_idx" ON "PlatformNotification"("createdAt");
