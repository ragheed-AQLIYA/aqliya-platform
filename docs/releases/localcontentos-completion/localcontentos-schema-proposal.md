# LocalContentOS Content Studio — Schema & Persistence

**Status:** Implemented in `prisma/schema.prisma`; migration packaged — **apply pending approval**

## Migration

- **Name:** `20260601120000_localcontentos_content_studio`
- **Path:** `prisma/migrations/20260601120000_localcontentos_content_studio/migration.sql`
- **Readiness:** `localcontentos-migration-readiness.md`

## Models (summary)

| Model | Purpose |
|-------|---------|
| ContentStudioProject | Content initiative / brief |
| ContentStudioCampaign | Channel campaign under project |
| ContentStudioSource | Evidence / reference links |
| ContentStudioContentItem | Draft → review → approval unit |
| ContentStudioReviewRecord | Operator review dimensions |
| ContentStudioApprovalRecord | ADMIN approval gate |
| ContentStudioOutputPackage | Export bundle metadata |
| ContentStudioAIAuditLog | Governed AI assist audit trail |

## Interim file store

- Path: `.data/localcontentos-content/store.json`
- Env: `LOCALCONTENT_CONTENT_BACKEND=file` (tests)
- **Not** recommended for multi-user pilot without Prisma cutover

## Dual persistence rule

Application selects Prisma when `DATABASE_URL` is set and repository uses DB adapter; otherwise file store. **Pilot should use migrated Prisma** for durability.

## Agent policy

- Do **not** run `prisma migrate dev/deploy` or `prisma generate` without explicit user approval
- Document only until approved
