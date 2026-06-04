-- A1-05: evidence versioning + chain-of-custody snapshots

CREATE TABLE "AuditEvidenceVersion" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "changes" JSONB NOT NULL,
    "changeDescription" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvidenceVersion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuditEvidenceVersion_evidenceId_versionNumber_key" ON "AuditEvidenceVersion"("evidenceId", "versionNumber");

CREATE INDEX "AuditEvidenceVersion_evidenceId_createdAt_idx" ON "AuditEvidenceVersion"("evidenceId", "createdAt");

ALTER TABLE "AuditEvidenceVersion" ADD CONSTRAINT "AuditEvidenceVersion_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "AuditEvidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
