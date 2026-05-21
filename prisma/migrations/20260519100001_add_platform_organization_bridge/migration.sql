-- Create PlatformOrganization bridge table
-- Additive only: existing Organization and AuditOrganization records remain unchanged

CREATE TABLE "PlatformOrganization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlatformOrganization_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlatformOrganization_slug_key" UNIQUE ("slug")
);

-- Add nullable platformOrganizationId FK to Organization (DecisionOS)
ALTER TABLE "Organization" ADD COLUMN "platformOrganizationId" TEXT;
CREATE INDEX "Organization_platformOrganizationId_idx" ON "Organization"("platformOrganizationId");
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_platformOrganizationId_fkey"
    FOREIGN KEY ("platformOrganizationId") REFERENCES "PlatformOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add nullable platformOrganizationId FK to AuditOrganization (AuditOS)
ALTER TABLE "AuditOrganization" ADD COLUMN "platformOrganizationId" TEXT;
CREATE INDEX "AuditOrganization_platformOrganizationId_idx" ON "AuditOrganization"("platformOrganizationId");
ALTER TABLE "AuditOrganization" ADD CONSTRAINT "AuditOrganization_platformOrganizationId_fkey"
    FOREIGN KEY ("platformOrganizationId") REFERENCES "PlatformOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- PlatformOrganization indexes
CREATE INDEX "PlatformOrganization_status_idx" ON "PlatformOrganization"("status");
CREATE INDEX "PlatformOrganization_createdAt_idx" ON "PlatformOrganization"("createdAt");
