# Repository Audit Report

**Date:** 2026-06-04  
**Scope:** `src/`, `scripts/`, `prisma/` — TODO, FIXME, HACK, XXX, `@ts-ignore`, `as any`, disabled tests, feature flags  
**Method:** grep + manual classification  
**Clean build:** ✅ Verified (`npx tsc --noEmit` + `npm run build` pass)

---

## Critical (3 items — must fix before production)

### C1. `src/lib/sales/prisma-repository.ts` — mass `prisma as any` bypass

**File:** `src/lib/sales/prisma-repository.ts`  
**Count:** ~35 occurrences  
**Pattern:** `const db = prisma as any` — repeated in every method  
**Impact:** Entire SalesOS data access layer bypasses Prisma type safety. Schema changes silently break at runtime. No compile-time protection.  
**Action:** Replace with a shared dynamic model accessor (or generated types). At minimum, extract the `as any` pattern into one typed helper function.

### C2. `src/lib/audit/db/index.ts` — file-scoped `any` escape hatch

**File:** `src/lib/audit/db/index.ts`  
**Pattern:** `/* eslint-disable @typescript-eslint/no-explicit-any */` at line 1 + 12 `as any` casts  
**Impact:** Core AuditOS data access layer has zero type enforcement. 2800+ line file with unchecked dynamic access.  
**Action:** Remove the eslint disable. Add targeted `// eslint-disable-next-line` per line with justification. Type the dynamic Prisma model access.

### C3. `src/actions/decisions.ts` — `as any` casts in production actions

**File:** `src/actions/decisions.ts`  
**Lines:** 242, 315, 1552  
**Pattern:** `form as any`, `} as any,`, `} as unknown as {`  
**Impact:** Server Actions that process user input (`framework: form as any`) bypass type validation. Could accept malformed or malicious payloads.  
**Action:** Define proper types for the framework field instead of casting to `any`.

---

## Medium (5 items — schedule for next sprint)

### M1. SalesOS vnext placeholders throw at runtime

**Files:**
- `src/products/sales/core-adapters/audit-adapter.ts` (TODO)
- `src/products/sales/core-adapters/output-adapter.ts` (3× TODO)
- `src/lib/sales/vnext/workspace-metadata.ts` (TODO)
- `src/lib/sales/vnext/proposal-workflow.ts` (2× TODO)
- `src/lib/sales/vnext/deal-review.ts` (4× TODO)
- `src/lib/sales/vnext/commercial-review-runtime.ts` (2× TODO)
- `src/lib/sales/vnext/commercial-evidence.ts` (TODO)
- `src/lib/sales/_v02/cross-product-signals/` (4× TODO in types.ts, patterns.ts, from-sales-intelligence.ts, aggregator.ts)

**Pattern:** `throw new Error("TODO: ...")`  
**Impact:** If any SalesOS vnext code path is accidentally invoked (e.g. via a feature flag or route change), it will throw an unhandled runtime error.  
**Action:** Either implement the functions or change placeholders to no-op returns with a logger warning. Add runtime guards (`isEnabled` checks) at entry points.

### M2. Skipped integration tests

| File | Pattern | Reason |
|---|---|---|
| `src/__tests__/integration/ic01-pgvector.integration.test.ts` | `describe.skip` gated by `runLive` | Requires pgvector-enabled DB |
| `src/lib/sales/vnext/__tests__/cross-product-signals.test.ts` | `describe.skip` | Vnext placeholder |
| `src/lib/sales/_v02/cross-product-signals/__tests__/aggregator.test.ts` | `describe.skip` | V0.2 placeholder |
| `src/lib/local-content/content/__tests__/content-studio-prisma-repository.test.ts` | `describe.skip` gated by `hasDatabase` | Requires DB |

**Action:** For ic01-pgvector test: enable after pgvector staging verification. For sales vnext: either implement or remove. For local-content: gate properly or document.

### M3. `src/lib/rag/*.ts` — `prisma as any` in RAG layer

**Files:** `src/lib/rag/embedding-service.ts:11`, `src/lib/rag/rag-retriever.ts:8`  
**Pattern:** `const db = prisma as any`  
**Impact:** Same as C1 but scoped to RAG/vector pipeline. Lower severity because `ai.rag` is feature-flagged `off`.  
**Action:** After pgvector deployment, type these through the Prisma generated types.

### M4. `src/lib/office-ai/*.ts` — 6× `as unknown as` casts

**Files:** `file-extraction-service.ts`, `office-ai-task-service.ts`  
**Pattern:** `as unknown as Prisma.InputJsonValue`, `as unknown as Uint8Array`  
**Impact:** Type bypass for Prisma JSON fields and binary data. Could hide schema drift.  
**Action:** Use Prisma's typed `JsonValue` / `Prisma.InputJsonValue` properly. Extract JSON coercion to a typed helper.

### M5. `src/__tests__/i18n/no-english-strings.test.ts` — skipped test

**File:** `src/__tests__/i18n/no-english-strings.test.ts:478`  
**Pattern:** `test.skip(...)`  
**Impact:** Incomplete i18n coverage for English string detection.  
**Action:** Investigate why this test is skipped and either fix or remove.

---

## Low (4 items — cosmetic / non-blocking)

### L1. Phone placeholder text

- `src/app/login/page.tsx:159` — `placeholder="XXXXXXXX"`
- `src/components/forms/custom-product-form.tsx:648` — `placeholder="+966 5X XXX XXXX"`

**Action:** Replace with proper Saudi phone format placeholder or remove redundant placeholder.

### L2. `ai.streaming` feature flag set `"on"` by default

**File:** `src/lib/platform/feature-flags/registry.ts:29`  
**Impact:** None in current codebase (streaming is a UI behavior). Flagged only for awareness before production.  
**Action:** Verify streaming is properly handled in all AI response consumers before enabling in production.

### L3. `ai.real-providers` feature flag `"off"` by default

**File:** `src/lib/platform/feature-flags/registry.ts:9`  
**Impact:** All AI calls use deterministic fallback. Intentionally `"off"` for staging.  
**Action:** Must be set to `"on"` (via env var `FF_AI_REAL_PROVIDERS=true`) in production after provider keys are configured.

### L4. `process.exit(1)` in operational scripts

All scripts in `scripts/` use `process.exit(1)` for error handling. This is standard for CLI scripts. Noted only for awareness if any script is ever called from a programmatic context.

---

## Summary

| Severity | Count | Key action |
|---|---|---|
| Critical | 3 | Fix `as any` in prisma-repository.ts, audit/db/index.ts, decisions.ts |
| Medium | 5 | Guard SalesOS placeholders, enable skipped tests, type RAG/OfficeAI layers |
| Low | 4 | Phone placeholders, feature flag defaults |
| **Negative findings** | `@ts-ignore` | **0 found** ✅ |
| | `@ts-expect-error` | **0 found** ✅ |
| | `FIXME` | **0 found** ✅ |
| | `HACK` | **0 found** ✅ |
| | `describe.only` / `it.only` | **0 found** ✅ |
| | `test.todo` / `it.todo` | **0 found** ✅ |

---

## Files Clean

| Check | Result |
|---|---|
| `@ts-ignore` in `src/` | 0 (pass) |
| `@ts-expect-error` in `src/` | 0 (pass) |
| `FIXME` in `src/` | 0 (pass) |
| `HACK` in `src/` | 0 (pass) |
| `describe.only` / `it.only` | 0 (pass) |
| `test.todo` / `it.todo` | 0 (pass) |
| TypeScript compilation | Pass (0 errors) |
| Build | Pass (0 warnings) |
| Tests | All passing |
