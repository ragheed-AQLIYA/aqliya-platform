---
name: aqliya-data-discipline
description: Prisma schema changes, migrations, seeds, data integrity, query safety — AGENTS.md §13 enforcement
version: 1.0
date: 2026-07-12
status: active
---

# AQLIYA Data Discipline

## When to Load
Load this skill when the task involves:
- Prisma schema changes (`schema.prisma`)
- Database migrations (`prisma migrate`)
- Seed data modifications
- Adding, removing, or changing models/fields
- Query optimization or query pattern changes
- Data integrity concerns

## Core Rules (from AGENTS.md §13)

### Before Any Schema Change, Ask:
1. Can this use an existing model?
2. Can this use `AuditEvent` or `PlatformAuditLog`?
3. Can this use metadata/config JSON fields?
4. Is this future speculation?
5. Is this product actually being built now?

### Every New Business Model Must Consider:
- `id` — UUID primary key
- `organizationId` or tenant ownership
- `workspaceId` where applicable
- `createdBy` / `updatedBy`
- `createdAt` / `updatedAt` timestamps
- `status` / workflow state field
- Audit events linkage
- Evidence links where relevant

### Forbidden:
- ❌ Schema changes for hypothetical On-Prem/Air-Gapped features
- ❌ Future product tables before product implementation
- ❌ Migrations not tied to active scope
- ❌ Breaking seed data without updating seed scripts
- ❌ Exposing Prisma to Client Components

## Migration Safety Checklist

Before `npx prisma migrate dev`:
- [ ] All existing seed scripts still compile
- [ ] No data loss in existing tables (additive changes preferred)
- [ ] New fields have sensible defaults or are optional
- [ ] `@@index` added for new filterable fields
- [ ] Foreign key relationships have proper `onDelete` behavior
- [ ] Migration is scoped to only the needed changes (no drift)
- [ ] `prisma migrate dev --create-only` used to review SQL first
- [ ] Backup taken if production database

## Query Safety Patterns

### DO
```typescript
// ✅ Always scope by organizationId
const items = await prisma.model.findMany({
  where: { organizationId: user.organizationId },
  take: 20,  // Always paginate list queries
  select: { id: true, name: true },  // Select only needed fields
});

// ✅ Batch writes with $transaction
await prisma.$transaction(
  items.map(item => prisma.model.update({ where: { id: item.id }, data: item }))
);

// ✅ Use createMany for bulk inserts
await prisma.model.createMany({ data: items });
```

### DO NOT
```typescript
// ❌ Unscoped query
const items = await prisma.model.findMany();

// ❌ Unbounded query
const allItems = await prisma.model.findMany({ where: { orgId } });

// ❌ N+1 mutation loop
for (const item of items) {
  await prisma.model.update({ where: { id: item.id }, data: item });
}

// ❌ Fetching full objects for list views
const items = await prisma.model.findMany({ include: { relation1: true, relation2: true } });

// ❌ Raw SQL without sanitization
await prisma.$queryRawUnsafe(`SELECT * FROM model WHERE name = '${userInput}'`);
```

## Index Discipline

When adding a new query pattern, always check if an index exists:
```sql
-- Common index patterns needed:
CREATE INDEX ON "Model" ("organizationId");
CREATE INDEX ON "Model" ("organizationId", "status");
CREATE INDEX ON "Model" ("createdAt" DESC);
CREATE INDEX ON "Model" ("organizationId", "createdAt" DESC);
```

## File Size Discipline

- Actions files: max 500 lines (split by domain)
- Service files: max 800 lines
- Schema files: organize by product with clear section headers
- Seed files: one per product, max 500 lines each

## Validation

Before merging any schema/query change:
- [ ] `npx prisma validate` passes
- [ ] `npx tsc --noEmit` passes (after `npx prisma generate`)
- [ ] Seed script runs without errors: `npx prisma db seed`
- [ ] No Prisma imports in Client Components
- [ ] All queries have `organizationId` where clause (for tenant-isolated models)
- [ ] All list queries have `take`/`skip` pagination
