-- AlterTable
ALTER TABLE "SalesAccount" ADD COLUMN     "nameAr" TEXT,
ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "SalesContact" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "sensitivityLevel" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "SalesDeal" ADD COLUMN     "name" TEXT,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "pipelineStage" TEXT NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE "SalesInteraction" ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "evidenceRef" TEXT;

-- CreateIndex
CREATE INDEX "SalesAccount_ownerId_idx" ON "SalesAccount"("ownerId");

-- CreateIndex
CREATE INDEX "SalesContact_ownerId_idx" ON "SalesContact"("ownerId");

-- CreateIndex
CREATE INDEX "SalesDeal_pipelineStage_idx" ON "SalesDeal"("pipelineStage");

-- CreateIndex
CREATE INDEX "SalesDeal_ownerId_idx" ON "SalesDeal"("ownerId");

-- CreateIndex
CREATE INDEX "SalesInteraction_contactId_idx" ON "SalesInteraction"("contactId");
