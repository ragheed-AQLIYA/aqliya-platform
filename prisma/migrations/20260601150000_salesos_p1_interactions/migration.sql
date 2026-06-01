-- SalesOS P1 — SalesInteraction (PR-5 interactions slice)
-- Apply: npx prisma migrate deploy  (human; do not run migrate dev in agent)

CREATE TABLE "SalesInteraction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "accountId" TEXT NOT NULL,
    "dealId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "summary" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesInteraction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SalesInteraction_organizationId_occurredAt_idx" ON "SalesInteraction"("organizationId", "occurredAt");
CREATE INDEX "SalesInteraction_platformOrganizationId_occurredAt_idx" ON "SalesInteraction"("platformOrganizationId", "occurredAt");
CREATE INDEX "SalesInteraction_accountId_occurredAt_idx" ON "SalesInteraction"("accountId", "occurredAt");
CREATE INDEX "SalesInteraction_dealId_occurredAt_idx" ON "SalesInteraction"("dealId", "occurredAt");
CREATE INDEX "SalesInteraction_organizationId_accountId_idx" ON "SalesInteraction"("organizationId", "accountId");

ALTER TABLE "SalesInteraction" ADD CONSTRAINT "SalesInteraction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SalesAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesInteraction" ADD CONSTRAINT "SalesInteraction_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "SalesDeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
