-- Create ContentEvidence table for ContentStudio evidence/file attachments
CREATE TABLE "ContentEvidence" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "fileHash" TEXT,
    "storageKey" TEXT,
    "uploadedById" TEXT,
    "description" TEXT,
    "evidenceType" TEXT NOT NULL DEFAULT 'attachment',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentEvidence_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "ContentEvidence_contentId_idx" ON "ContentEvidence"("contentId");
CREATE INDEX "ContentEvidence_organizationId_idx" ON "ContentEvidence"("organizationId");
CREATE INDEX "ContentEvidence_createdAt_idx" ON "ContentEvidence"("createdAt");

-- Add foreign key to ContentItem
ALTER TABLE "ContentEvidence" ADD CONSTRAINT "ContentEvidence_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
