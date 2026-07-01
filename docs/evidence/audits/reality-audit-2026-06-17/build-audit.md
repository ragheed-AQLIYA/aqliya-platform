# Build Audit — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Environment:** Windows 10, Node (system), existing `node_modules`

---

## Summary

| Command | Result | Duration | Evidence |
|---------|--------|----------|----------|
| `npx tsc --noEmit` | **FAIL** (9 errors) | ~12s | Executed 2026-06-17 |
| `npm run build` | **FAIL** | ~170s | Executed 2026-06-17 |
| `npx prisma validate` | **PASS** | ~4s | Schema syntactically valid |
| `npm run lint` | **FAIL** (33,662 problems) | ~176s | Likely scanning non-ignored paths |
| `npm install` | **Not run** | — | `node_modules` already present |

**Verdict:** Production build is **BLOCKED**. Docs claiming "0 TS errors, build passes" (PRODUCT_STATUS_MATRIX Phase 7, 2026-05-28) are **FALSE** as of 2026-06-17.

---

## TypeScript Errors (9) — VERIFIED

```
.next/types/app/sales/contacts/page.ts(2,24): error TS2307: Cannot find module '../../../../../src/app/sales/contacts/page.js'
.next/types/app/sales/contacts/page.ts(7,29): error TS2307: Cannot find module '../../../../../src/app/sales/contacts/page.js'
.next/types/validator.ts(1790,39): error TS2307: Cannot find module '../../src/app/sales/contacts/page.js'
src/lib/platform/audit-event-service.ts(47,33): error TS2339: Property 'platformAuditEvent' does not exist on type 'PrismaClient'
src/lib/platform/secrets/vault.ts(6,15): error TS2305: Module '"./types"' has no exported member 'SecretEntry'
src/lib/platform/secrets/vault.ts(6,28): error TS2305: Module '"./types"' has no exported member 'SecretsVault'
src/lib/sales/prisma-intelligence-snapshots.ts(171,7): error TS2322: Type 'number' is not assignable to type 'SalesAIConfidence'
src/lib/sales/prisma-intelligence-snapshots.ts(190,7): error TS2322: Type 'number' is not assignable to type 'SalesAIConfidence'
src/lib/sales/prisma-legacy-adapters.ts(281,5): error TS2353: 'accountId' does not exist in type 'SalesWinLossInsight'
```

### Root Cause Analysis

| Error | Severity | Root Cause | Fix Effort |
|-------|----------|------------|------------|
| `platformAuditEvent` missing | **Critical** | Code references model not in `schema.prisma`; untracked `diff_platform_models.sql` | Medium (1-2h) |
| `SecretEntry`/`SecretsVault` exports | High | Incomplete platform secrets refactor | Low (30m) |
| Sales type mismatches | Medium | SalesOS intelligence types drift | Low (1h) |
| `sales/contacts/page.js` stale | Medium | Stale `.next/types` or missing page file | Low (clean + verify route) |

---

## Build Failure — VERIFIED

```
npm run build
→ prisma generate: OK
→ next build --webpack: Compiled with warnings in 98s
→ Running TypeScript: FAILED

./src/lib/platform/audit-event-service.ts:47:33
Type error: Property 'platformAuditEvent' does not exist on type 'PrismaClient'
```

**Impact:** Cannot deploy. CI `deploy.yml` runs `npx tsc --noEmit` first — **deploy pipeline would fail**.

---

## Build Warnings — PARTIALLY VERIFIED

- Webpack cache parsing warning for `next-intl` dynamic import
- Edge Runtime incompatibility: `jose` uses `CompressionStream`/`DecompressionStream` (via `next-auth/jwt`) — may affect middleware edge execution

---

## Lint Audit — PARTIALLY VERIFIED

```
✖ 33,662 problems (13,706 errors, 19,956 warnings)
```

**Note:** ESLint config (`eslint.config.mjs`) ignores large portions of `src/` but does NOT ignore `docs/archive/code/`, `knowledge-foundation/`, and other directories containing TypeScript. The 33K count is **not representative of production `src/` quality**.

**Recommendation:** Scope lint to `src/` only or add `docs/**` to `globalIgnores`. Re-run for accurate signal.

**Historical claim check:** PRODUCT_STATUS_MATRIX Phase 7 claims "135 ESLint warnings → 0" — **FALSE** for current full-repo lint scope; **UNVERIFIED** for scoped `src/` only.

---

## Slow Steps

| Step | Time | Notes |
|------|------|-------|
| Webpack compile | ~98s | Normal for Next.js 16 monorepo |
| Full build (failed at TS) | ~170s | Blocked before static generation complete |
| Lint full repo | ~176s | Too broad scope |

---

## Recommendations

| Priority | Action | Effort | Risk if ignored |
|----------|--------|--------|-----------------|
| P0 | Add `PlatformAuditEvent` model + migration OR revert `audit-event-service.ts` to `platformAuditLog` | 2h | Deploy blocked |
| P0 | Fix secrets vault type exports | 30m | TS gate blocked |
| P1 | Fix SalesOS type errors + remove duplicate `(1).test.ts` files | 4h | Test noise, TS failures |
| P1 | Clean `.next` and verify `/sales/contacts` route exists | 30m | Stale type artifacts |
| P2 | Narrow ESLint scope; restore CI lint gate meaning | 2h | False confidence |

---

**Evidence classification:** Build/tsc failures VERIFIED. Lint count PARTIALLY VERIFIED (scope issue).
