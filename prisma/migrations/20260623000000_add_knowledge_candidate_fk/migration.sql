-- Add foreign key: KnowledgeCandidate.createdById -> User.id
-- This FK is defined in the Prisma schema via @relation("KnowledgeCandidateCreator")
-- but was never created by any migration (the table was originally created via db push)
ALTER TABLE "KnowledgeCandidate" ADD CONSTRAINT "KnowledgeCandidate_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
