-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SunbulAuditAction" ADD VALUE 'MEMBERSHIP_ROLE_CHANGED';
ALTER TYPE "SunbulAuditAction" ADD VALUE 'MEMBERSHIP_STATUS_CHANGED';
ALTER TYPE "SunbulAuditAction" ADD VALUE 'RECORD_EXPORTED';
ALTER TYPE "SunbulAuditAction" ADD VALUE 'DOCUMENT_DELETED';
