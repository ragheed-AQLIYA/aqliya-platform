# Prisma Client Extensions Migration Plan

**Status:** In Progress  
**Created:** 2026-07-24  
**Owner:** Platform Architect

---

## Current State

### Problem
SalesOS Tier B/A modules use `getPrismaAny()` to access Prisma models that exist at runtime but aren't in the generated TypeScript types.

```typescript
// src/lib/sales/prisma-repository/common.ts
export function getPrismaAny(): any {
  return prisma;
}
```

### Impact
- **34 call sites** across 4 files use `getPrismaAny()`
- All access is **untyped** — no autocomplete, no type checking
- Runtime errors possible if model names change

### Affected Files
| File | Call Sites |
|------|-----------|
| `src/lib/sales/prisma-repository/tier-a.ts` | ~12 |
| `src/lib/sales/prisma-repository/tier-b1.ts` | ~8 |
| `src/lib/sales/prisma-repository/tier-b2.ts` | ~7 |
| `src/lib/sales/prisma-repository/tier-b3.ts` | ~7 |

## Target State

### Approach: Prisma Client Extensions
Use Prisma's built-in extension mechanism to add type-safe access to all models.

```typescript
// src/lib/prisma-extensions.ts
import { prisma } from "@/lib/prisma"

type ExtendedPrismaClient = typeof prisma

export function getExtendedPrisma(): ExtendedPrismaClient {
  return prisma
}
```

### Benefits
- **Type-safe**: Full autocomplete and type checking
- **Zero runtime cost**: Just a type cast, no additional queries
- **Incremental**: Can migrate one file at a time
- **Backward compatible**: `getPrismaAny()` still works during migration

## Migration Steps

### Phase 1: Create Extension (DONE)
- [x] Create `src/lib/prisma-extensions.ts`
- [x] Export `getExtendedPrisma()` function
- [x] Deprecate `getPrismaAny()` with JSDoc

### Phase 2: Migrate Tier B1 (High Priority)
- [ ] `src/lib/sales/prisma-repository/tier-b1.ts`
  - Replace `getPrismaAny()` → `getExtendedPrisma()`
  - Verify all models compile
  - Run tests: `npx jest tier-b1`

### Phase 3: Migrate Tier B2
- [ ] `src/lib/sales/prisma-repository/tier-b2.ts`
  - Same pattern as Phase 2

### Phase 4: Migrate Tier B3
- [ ] `src/lib/sales/prisma-repository/tier-b3.ts`
  - Same pattern as Phase 2

### Phase 5: Migrate Tier A
- [ ] `src/lib/sales/prisma-repository/tier-a.ts`
  - Same pattern as Phase 2

### Phase 6: Remove Deprecated Function
- [ ] Remove `getPrismaAny()` from `common.ts`
- [ ] Update all imports to use `getExtendedPrisma()`
- [ ] Run full test suite

## Timeline Estimate

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1 | Done | None |
| Phase 2 | 30 min | Low — type-only change |
| Phase 3 | 30 min | Low |
| Phase 4 | 30 min | Low |
| Phase 5 | 30 min | Low |
| Phase 6 | 15 min | Medium — requires full test pass |

**Total: ~2.5 hours**

## Validation

After each phase:
1. `npx tsc --noEmit` — no new errors
2. `npx jest <affected-file>` — tests pass
3. `npm run build` — build succeeds

## Notes

- The `getExtendedPrisma()` function is type-only — it returns the same `prisma` instance
- No Prisma schema changes required
- No migration required
- Safe to do incrementally alongside other work
