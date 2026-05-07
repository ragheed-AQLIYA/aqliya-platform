/*
  Warnings:

  - Added the required column `organizationId` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `DecisionMonitoringSignal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `DecisionPattern` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `DecisionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `DecisionRiskAlert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DecisionMonitoringSignal" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DecisionPattern" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DecisionReport" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DecisionRiskAlert" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "DecisionMonitoringSignal_organizationId_idx" ON "DecisionMonitoringSignal"("organizationId");

-- CreateIndex
CREATE INDEX "DecisionPattern_organizationId_idx" ON "DecisionPattern"("organizationId");

-- CreateIndex
CREATE INDEX "DecisionReport_organizationId_idx" ON "DecisionReport"("organizationId");

-- CreateIndex
CREATE INDEX "DecisionRiskAlert_organizationId_idx" ON "DecisionRiskAlert"("organizationId");

-- AddForeignKey
ALTER TABLE "DecisionMonitoringSignal" ADD CONSTRAINT "DecisionMonitoringSignal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRiskAlert" ADD CONSTRAINT "DecisionRiskAlert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionPattern" ADD CONSTRAINT "DecisionPattern_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionReport" ADD CONSTRAINT "DecisionReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
