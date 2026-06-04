# SalesOS Migration Runbook

**Updated:** 2026-06-02 (parallel remediation)

## Persistence

- **Canonical:** Prisma models + `src/lib/sales/services.ts` + `src/lib/sales/l5-governance.ts`
- **Deprecated hot path:** `src/lib/sales/service.ts` in-memory store — do not use for review/approve/evidence from UI
- **User-facing loaders:** `prisma-revenue-intelligence.ts`, `buildSalesCommandCenterFromPrisma`, `loadOrgSalesDataFromPrisma`

## Archive

- `src/lib/sales/_v02/` excluded from TypeScript build (`tsconfig.json`) and Jest (`jest.config.js`). Do not import from active code; use `vnext/` or `services/`.

## Seed

```bash
npx prisma db seed
# includes prisma/seed-sales.ts when wired in seed.ts
```
