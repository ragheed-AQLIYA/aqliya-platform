# BUILD_FAILURE_MATRIX

**Date:** 2026-06-04  
**Scope:** Stabilization — `npm install` → `prisma generate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`  
**Next.js:** 16.2.4 (webpack build via `npm run build`)

---

## Priority Legend

| Priority | Meaning |
| -------- | ------- |
| **P0** | Build blocker — `npm run build` fails |
| **P1** | Type blocker — `npx tsc --noEmit` fails |
| **P2** | Lint blocker — `npm run lint` exits non-zero (errors, not warnings) |
| **P3** | Cleanup — warnings, deprecations, docs drift |

---

## P0 — Build Blockers

### P0-001 — Edge middleware bundles `ioredis` (RESOLVED)

| Field | Value |
| ----- | ----- |
| **File** | `src/middleware-rate-limit.ts` → `src/lib/rate-limit.ts` → `src/lib/platform/rate-limiter/index.ts` → `redis-rate-limiter.ts` → `redis-client.ts` |
| **Error** | `UnhandledSchemeError: Reading from "node:diagnostics_channel" is not handled by plugins` |
| **Root cause** | `middleware.ts` runs on **Edge Runtime**. Webpack traced a static import chain into `createRateLimiter()`, which includes a dynamic import of `redis-rate-limiter.ts`. That module statically imports `ioredis`, which requires Node built-ins (`node:diagnostics_channel`). Edge bundles cannot load Node-only modules. Occurred **regardless of `RATE_LIMITER` env** at runtime (bundle-time graph inclusion). |
| **Severity** | P0 — production build hard fail |
| **Fix required** | Split Edge vs Node rate-limit entrypoints. Middleware must not import `@/lib/rate-limit` or `@/lib/platform/rate-limiter/index.ts`. |
| **Fix applied** | Yes — see Phase 3 below |

**Webpack import trace (before fix):**

```
node:diagnostics_channel
./node_modules/ioredis/built/tracing.js
./node_modules/ioredis/built/Redis.js
./src/lib/platform/redis-client.ts
./src/lib/platform/rate-limiter/redis-rate-limiter.ts
./src/lib/platform/rate-limiter/index.ts
./src/lib/rate-limit.ts
./src/middleware-rate-limit.ts
```

---

## P1 — Type Blockers

| ID | File | Error | Root cause | Severity | Fix required |
| -- | ---- | ----- | ---------- | -------- | ------------ |
| — | — | — | No TypeScript errors at stabilization time | — | None |

**Verification:** `npx tsc --noEmit` — exit 0 (2026-06-04)

---

## P2 — Lint Blockers

| ID | File | Error | Root cause | Severity | Fix required |
| -- | ---- | ----- | ---------- | -------- | ------------ |
| — | — | — | CI uses `npm run lint -- --quiet`; 0 errors, 158 warnings without `--quiet` | P2 (non-blocking) | None for stabilization |

**Verification:**

- `npm run lint -- --quiet` — exit 0
- `npm run lint` (full) — exit 0, 158 warnings (`@typescript-eslint/no-unused-vars` in Sales vnext stubs, etc.)

---

## P3 — Cleanup / Non-blocking

### P3-001 — Middleware deprecation warning

| Field | Value |
| ----- | ----- |
| **File** | `src/middleware.ts` |
| **Error** | `The "middleware" file convention is deprecated. Please use "proxy" instead.` |
| **Root cause** | Next.js 16 rename `middleware` → `proxy` (Node default on proxy; Edge still via legacy middleware) |
| **Severity** | P3 — build succeeds |
| **Fix required** | Planned migration; not required for build stabilization |

### P3-002 — Sentry build warnings

| Field | Value |
| ----- | ----- |
| **File** | `sentry.client.config.ts` / `@sentry/nextjs` |
| **Error** | Deprecation + missing `authToken` for source maps |
| **Root cause** | Tooling config, not compile failure |
| **Severity** | P3 |
| **Fix required** | Optional — migrate to `instrumentation-client.ts`; set `SENTRY_AUTH_TOKEN` in CI if uploads needed |

### P3-003 — Docs claiming Redis middleware enforcement

| Field | Value |
| ----- | ----- |
| **File** | Historical reports (`EVIDENCE_REPORT.md`, etc.) |
| **Error** | Commercial/ops docs implied `RATE_LIMITER=redis` applies in middleware |
| **Root cause** | Wiring change on 2026-06-04 without runtime-boundary split |
| **Severity** | P3 — truthfulness |
| **Fix required** | Clarify: Edge = memory-only; Redis = server-only `checkRateLimit()` |

### P3-004 — Multi-instance rate limit gap (operational)

| Field | Value |
| ----- | ----- |
| **File** | `src/lib/rate-limit-edge.ts` |
| **Error** | N/A (design tradeoff) |
| **Root cause** | Edge middleware intentionally memory-only per instance |
| **Severity** | P3 — accepted for pilot; use `RATE_LIMITER=redis` on Node API consumers when wired |
| **Fix required** | Future: Node-layer Redis limiter on sensitive API routes (not middleware) |

---

## Edge vs Node Boundary Audit (post-fix)

| Module | Runtime | Safe for middleware? | Notes |
| ------ | ------- | -------------------- | ----- |
| `src/lib/rate-limit-edge.ts` | Edge | Yes | Memory-only; no `server-only`, no Redis |
| `src/lib/rate-limit.ts` | Node | No | `import "server-only"`; may load `ioredis` |
| `src/lib/platform/redis-client.ts` | Node | No | `ioredis` |
| `src/middleware.ts` | Edge | Yes | Auth via `next-auth/jwt`; MFA role helpers (types only from Prisma) |
| `proxy.ts` | — | N/A | Not present in repo |

---

## Phase 3 — Fixes Applied (P0 / P1)

| Change | Purpose |
| ------ | ------- |
| Added `src/lib/rate-limit-edge.ts` | Edge-safe `checkEdgeRateLimit()` using `MemoryRateLimiter` only |
| Updated `src/middleware-rate-limit.ts` | Import `@/lib/rate-limit-edge` instead of `@/lib/rate-limit` |
| Updated `src/lib/rate-limit.ts` | Marked `server-only`; Redis path for Node consumers only |
| Updated `src/__tests__/unit/middleware-rate-limit-l014.test.ts` | Mock `@/lib/rate-limit-edge` |

**No changes:** `middleware.ts` auth/MFA flow, `rate-limiter/index.ts` Redis factory, Prisma schema.

---

## Validation Snapshot (2026-06-04)

| Command | Result |
| ------- | ------ |
| `npx prisma generate` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run lint -- --quiet` | Pass |
| `npm run build` | Pass |
