-- SalesOS P1 -- SalesContact (PR-22 contacts slice)
-- Apply: npx prisma migrate deploy  (human; do not run migrate dev in agent)

CREATE TABLE "SalesContact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesContact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SalesContact_organizationId_accountId_idx" ON "SalesContact"("organizationId", "accountId");
CREATE INDEX "SalesContact_platformOrganizationId_accountId_idx" ON "SalesContact"("platformOrganizationId", "accountId");
CREATE INDEX "SalesContact_accountId_idx" ON "SalesContact"("accountId");

ALTER TABLE "SalesContact" ADD CONSTRAINT "SalesContact_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SalesAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
