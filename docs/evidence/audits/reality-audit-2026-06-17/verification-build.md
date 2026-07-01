# Verification — Build Claims

**Verification date:** 2026-06-17 02:27–02:41 +03:00  
**Auditor:** Independent Verification Board (no trust in prior audit)

---

## CLAIM 1: `npx tsc --noEmit` fails with 9 errors

### Original audit statement
> 9 TypeScript errors; includes `platformAuditEvent`, secrets vault exports, sales types, stale `.next/types` for `sales/contacts/page`

### Run 1 — 2026-06-17 02:27:34 +03:00

**Command:**
```powershell
cd C:\Users\PC\Documents\Aqliya
npx tsc --noEmit
```

**Exit code:** `2`

**Raw output (6 errors, not 9):**
```
src/lib/platform/audit-event-service.ts(47,33): error TS2339: Property 'platformAuditEvent' does not exist on type 'PrismaClient<...>'.
src/lib/platform/secrets/vault.ts(6,15): error TS2305: Module '"./types"' has no exported member 'SecretEntry'.
src/lib/platform/secrets/vault.ts(6,28): error TS2305: Module '"./types"' has no exported member 'SecretsVault'.
src/lib/sales/prisma-intelligence-snapshots.ts(171,7): error TS2322: Type 'number' is not assignable to type 'SalesAIConfidence'.
src/lib/sales/prisma-intelligence-snapshots.ts(190,7): error TS2322: Type 'number' is not assignable to type 'SalesAIConfidence'.
src/lib/sales/prisma-legacy-adapters.ts(281,5): error TS2353: Object literal may only specify known properties, and 'accountId' does not exist in type 'SalesWinLossInsight'.
```

**Note:** No `.next/types/sales/contacts` errors in this run (original audit claimed 3 such errors).

### Run 2 — 2026-06-17 ~02:38 (after workspace state change)

**Command:** `npx tsc --noEmit`  
**Exit code:** `0`  
**Output:** (empty — pass)

### Current file evidence — `audit-event-service.ts:47`

```47:47:src/lib/platform/audit-event-service.ts
    const record = await prisma.platformAuditLog.create({
```

`grep platformAuditEvent src/` → **0 matches** (property no longer referenced).

### Current file evidence — `secrets/vault.ts`

Types are **inline interfaces** (lines 8–21), not imported from `./types`.

| Sub-claim | Verdict |
|-----------|---------|
| Exactly 9 errors | **FALSE** (6 at run 1; 0 at run 2) |
| Errors reproducible at audit time | **PARTIALLY CONFIRMED** (run 1 matched 6 of 9 cited classes) |
| Errors reproducible now | **FALSE** — tsc passes |
| Environment-specific | **YES** — workspace changed within verification window |

**VERDICT:** **PARTIALLY CONFIRMED at audit time; FALSE as current state**

---

## CLAIM 2: `npm run build` fails

### Original audit statement
> Build FAIL at TypeScript check — `platformAuditEvent` type error

### Run 1 — 2026-06-17 02:28:19 +03:00 (dirty `.next`)

**Command:** `npm run build`  
**Exit code:** `1`

**Key output:**
```
✓ Compiled successfully in 55s
  Running TypeScript ...
  Finished TypeScript in 40s ...
  Collecting page data using 15 workers ...
> Build error occurred
Error: ENOENT: no such file or directory, open '...\ .next\server\pages-manifest.json'
```

**Failure mode:** Filesystem/cache (`ENOENT`), **not** `platformAuditEvent` TS error.

### Run 2 — 2026-06-17 02:38:38 +03:00 (clean `.next`)

**Command:**
```powershell
Remove-Item -Recurse -Force .next
npm run build
```

**Exit code:** `0`  
**Result:** Full build completed; 128 static pages generated; `/api/test-token` listed in route manifest.

| Sub-claim | Verdict |
|-----------|---------|
| Build always fails | **FALSE** |
| Build failed due to platformAuditEvent TS | **FALSE** (even run 1 passed Next.js TS step) |
| Build can fail with corrupt `.next` | **CONFIRMED** (ENOENT on run 1) |
| Build passes on clean tree (current code) | **CONFIRMED** |

**VERDICT:** **FALSE** (primary claim inaccurate); build failure was **environment/cache-specific**, not the cited TS root cause.

---

## CLAIM 3: Build is truly blocked / deploy impossible

### Evidence

- Clean build exit 0 at 02:38 +03:00
- CI runs `npx tsc --noEmit` then build — **would pass on current workspace state**
- Deploy pipeline blocker from original audit is **not reproducible now**

| Question | Answer |
|----------|--------|
| Is build truly blocked? | **NO** (current state) |
| Was it blocked at original audit time? | **PARTIALLY** — tsc failed then; build failure mode differed from audit description |
| Environment-specific? | **YES** |

**VERDICT:** **FALSE** as current production blocker

---

## Summary Table

| Claim | Original Audit | Verification Result | Verdict |
|-------|---------------|---------------------|---------|
| 9 TS errors | Stated | 6 then 0 observed | **FALSE** (count + current state) |
| tsc fails | Stated | Failed run 1; passed run 2 | **PARTIAL** |
| npm build fails | Stated | Failed dirty `.next`; passes clean | **PARTIAL** |
| platformAuditEvent blocks build | Stated | Code uses `platformAuditLog`; build passes | **FALSE** |
| Deploy pipeline blocked | Implied | Not reproducible now | **FALSE** |

---

## Reproduction steps (current PASS state)

```powershell
cd C:\Users\PC\Documents\Aqliya
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npx tsc --noEmit          # expect exit 0
npm run build             # expect exit 0 (~178s)
```

**Raw logs saved:**
- `verification-build-output.txt` (run 1)
- `verification-build-clean-output.txt` (run 2, PASS)
