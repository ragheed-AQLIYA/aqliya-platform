-- Drop deprecated audit tables (migrated to PlatformAuditLog)

-- 1. Tables without foreign keys
DROP TABLE IF EXISTS "LcAiAuditEvent" CASCADE;
DROP TABLE IF EXISTS "WorkflowAuditEvent" CASCADE;
DROP TABLE IF EXISTS "SalesAuditEvent" CASCADE;

-- 2. Tables with foreign keys (CASCADE handles FK removal)
DROP TABLE IF EXISTS "LocalContentAuditEvent" CASCADE;
DROP TABLE IF EXISTS "SunbulAuditEvent" CASCADE;
DROP TABLE IF EXISTS "AuditEvent" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;

-- 3. Drop enum types
DROP TYPE IF EXISTS "SunbulAuditAction" CASCADE;
DROP TYPE IF EXISTS "AuditAction" CASCADE;
