---
name: eng-prisma-review
description: Prisma schema review — model design, indexes, relations, migrations, tenant safety, performance
version: 1.0
date: 2026-07-13
status: active
owner: Layer 2 — Intelligence + Layer 5 — Performance
inputs: Prisma schema, migration history
outputs: Schema review with model design, index, and migration recommendations
dependencies: aqliya-data-discipline
---

# Engineering Prisma Review

## Checklist
1. **Model Design**: Normalization, naming, field types, defaults
2. **Indexes**: Missing indexes on foreign keys, query fields
3. **Relations**: Cascade behavior, optional vs required
4. **Tenant Safety**: Every business model has organizationId
5. **Migrations**: Safe migrations, no data loss, rollback plan
6. **Enums vs Strings**: Consistency with codebase
7. **Timestamps**: createdAt, updatedBy on all models

## Output
```md
## Prisma Review: <schema>
| Finding | Severity | Model | Recommendation |
```
