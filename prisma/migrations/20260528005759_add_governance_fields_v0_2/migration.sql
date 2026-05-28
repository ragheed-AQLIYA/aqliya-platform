-- DropIndex
DROP INDEX "PlatformOrganization_status_idx";

-- AlterTable
ALTER TABLE "AuditClient" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "AuditEngagement" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "AuditFinding" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "AuditOrganization" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "AuditUser" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "ClientWorkspace" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "LocalContentSpendRecord" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "LocalContentSupplier" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "PlatformOrganization" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "SunbulClient" ADD COLUMN     "platformOrganizationId" TEXT;

-- CreateTable
CREATE TABLE "DecisionEvidence" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "fileHash" TEXT,
    "storageKey" TEXT,
    "uploadedById" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DecisionEvidence_decisionId_idx" ON "DecisionEvidence"("decisionId");

-- CreateIndex
CREATE INDEX "DecisionEvidence_organizationId_idx" ON "DecisionEvidence"("organizationId");

-- CreateIndex
CREATE INDEX "DecisionEvidence_createdAt_idx" ON "DecisionEvidence"("createdAt");

-- CreateIndex
CREATE INDEX "SunbulClient_platformOrganizationId_idx" ON "SunbulClient"("platformOrganizationId");

-- AddForeignKey
ALTER TABLE "DecisionEvidence" ADD CONSTRAINT "DecisionEvidence_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunbulClient" ADD CONSTRAINT "SunbulClient_platformOrganizationId_fkey" FOREIGN KEY ("platformOrganizationId") REFERENCES "PlatformOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
