# Phase 3 — Next.js 16 + Prisma 7 Runtime Fix

## Problem

Two separate issues prevented the app from building and running:

1. **Next.js 15/16 PageProps typing change** — `params` became a `Promise`, requiring `await params` in server components and `React.use(params)` or wrapper pattern in client components.

2. **Prisma 7 breaking change** — `engineType = "client"` became the only engine. `new PrismaClient()` without `adapter` or `accelerateUrl` throws `PrismaClientConstructorValidationError`. Additionally, `@prisma/adapter-pg` depends on `pg` which uses Node.js native modules (`fs`, `net`, `tls`, `dns`) that cannot be bundled by webpack/Turbopack.

## Root Cause

The architectural root cause was a **client-server boundary violation**:

```
❌ Before (broken):
Client Components → @/lib/audit/services → db/index → prisma.ts → @prisma/adapter-pg → pg
```

13 client components imported read functions directly from `@/lib/audit/services`. Next.js bundlers traced the full import chain into `pg` (Node.js native modules), causing build failures.

## Fix

```
✅ After (fixed):
Client Components → Server Actions ("use server") → AuditOS Services → DB Layer → Prisma (server-only)
```

### Changes Made

| File | Change |
|------|--------|
| `src/lib/prisma.ts` | Added `import "server-only"`, static `import { PrismaPg }`, removed Proxy/dynamic require/catch fallback |
| `prisma/schema.prisma` | Removed `engineType = "library"` (ignored by Prisma 7) |
| `next.config.mjs` | Created with `serverExternalPackages` for `@prisma/client`, `@prisma/adapter-pg`, `pg` |
| `src/actions/audit-read-actions.ts` | NEW — 16 server actions wrapping all read-only service functions |
| 4 AQLIYA Decision OS pages | Fixed `params: Promise<{ id: string }>` with `await params` |
| 13 audit client components | Changed imports from `@/lib/audit/services` to `@/actions/audit-read-actions` |

### Architecture Boundary

```
Client Components              (never imports @/lib/audit/services directly)
  ↓
Server Actions ("use server")  (src/actions/audit-read-actions.ts, audit-actions.ts)
  ↓
AuditOS Services               (src/lib/audit/services.ts — import("./db") dynamic)
  ↓
Audit DB Layer                 (src/lib/audit/db/index.ts)
  ↓
Prisma (server-only)           (src/lib/prisma.ts — "server-only" guard)
  ↓
PostgreSQL                     (via @prisma/adapter-pg)
```

### Validation Results

| Check | Result |
|-------|--------|
| `npx prisma generate` | ✅ Pass (Prisma 7.8.0) |
| `npm run seed:audit` | ✅ Pass |
| `npx tsc --noEmit` | ✅ **Zero errors** |
| `npm run build -- --webpack` | ✅ Compiled, type-checked, page data collected |
| `npm run dev` | ✅ Ready in 351ms |

### Key Metrics

- Critical dependency warnings: **Eliminated** (previously 3+ per build)
- PrismaClientConstructorValidationError: **Fixed**
- Client bundle pg/fs/net/tls/dns leakage: **Prevented**
- TypeScript PageProps errors: **Fixed** (4 pages)
