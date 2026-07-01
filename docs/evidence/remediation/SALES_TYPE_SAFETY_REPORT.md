# SalesOS Type Safety Report

**Finding 3 from `REVIEW_AFTER_PHASE2.md`** — `prisma as any` Audit

## Audit Claim

> "TypeScript errors were hidden using `prisma as any` instead of fixed."

## Verdict: **PARTIALLY CONFIRMED** — 52 occurrences across 10 files, but with varying legitimacy.

---

## Complete Occurrence Table

| File | Occurrences | Risk | Verdict |
|------|------------|------|---------|
| `src/lib/sales/prisma-repository.ts` | 31 | Medium | **Legitimate** — accesses Tier B/A models not in Prisma schema. All wrapped in try/catch. |
| `src/lib/platform/audit-bridge/audit-bridge-service.ts` | 15 | **HIGH** | **Dangerous** — `bridgeLogEntry`/`auditBridgeRule` models don't exist. Will crash at runtime. |
| `src/lib/platform/org-advanced/org-adv-service.ts` | 1 (file-level, 20+ uses) | **HIGH** | **Dangerous** — `orgHierarchyNode`/`orgSetting`/`orgLifecycleEvent` don't exist. |
| `src/lib/platform/office-ai-adv/office-ai-adv-service.ts` | 1 (file-level, 21+ uses) | **HIGH** | **Dangerous** — `officeAiWorkflowTemplate`/`officeAiSchedule`/`officeAiRoleConfig` don't exist. |
| `src/lib/core/knowledge/rag/embedding-service.ts` | 1 | Low | **FIXED** — Was unnecessary. `DocumentChunk` model exists. Replaced with typed access. |
| `src/lib/core/knowledge/rag/knowledge-service.ts` | 1 | Low | **FIXED** — Was unnecessary. `DocumentChunk` model exists. Replaced with typed access. |
| `src/lib/core/memory/institutional-memory-service.ts` | 1 (file-level) | Medium | **DOCUMENTED** — Legitimate schema drift (`nodeId`/`action` fields not in model). Narrowed to targeted inline casts. |
| `src/lib/core/knowledge/rag/hybrid-search.ts` | 1 | Low | **Legitimate** — Dynamic WHERE clause construction. |
| `src/lib/platform/cross-product-ai/cross-product-ai-service.ts` | 1 (dynamic) | Low | **Legitimate** — Dynamic model name resolution via `productModelName()`. |
| Test files | 2 | Low | **Legitimate** — Jest mock patterns. |

---

## Classification Summary

| Classification | Count | Files |
|---------------|-------|-------|
| **DANGEROUS** — models don't exist, runtime crash | 17 casts / 3 files | `audit-bridge-service.ts`, `org-adv-service.ts`, `office-ai-adv-service.ts` |
| **FIXED** — unnecessary, replaced with typed access | 2 files | `embedding-service.ts`, `knowledge-service.ts` |
| **LEGITIMATE** — documented, guarded, or dynamic | ~33 casts / 5 files | `prisma-repository.ts`, `institutional-memory-service.ts`, `hybrid-search.ts`, `cross-product-ai-service.ts`, test files |

---

## Fixed Occurrences

### `src/lib/core/knowledge/rag/embedding-service.ts`

**Before:**
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any
...
await db.documentChunk.create({ ... })
await db.documentChunk.deleteMany({ ... })
```

**After:**
```typescript
// DocumentChunk model exists in schema — typed access used directly
...
await prisma.documentChunk.create({ ... })
await prisma.documentChunk.deleteMany({ ... })
```

### `src/lib/core/knowledge/rag/knowledge-service.ts`

**Before:**
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any
...
await db.documentChunk.findMany({ ... })
```

**After:**
```typescript
// DocumentChunk model exists in schema — typed access used directly
...
await prisma.documentChunk.findMany({ ... })
```

---

## Dangerous Occurrences (Need Schema Alignment)

The following files access Prisma models that DO NOT EXIST in the current schema. They will crash at runtime if the code paths are exercised.

### 1. `audit-bridge-service.ts` (15 casts)
- Missing models: `AuditBridgeRule`, `BridgeLogEntry`
- **Action needed:** Add models to schema or remove dead code

### 2. `org-adv-service.ts` (1 file-level cast, 20+ uses)
- Missing models: `OrgHierarchyNode`, `OrgSetting`, `OrgLifecycleEvent`
- **Action needed:** Add models to schema or remove dead code

### 3. `office-ai-adv-service.ts` (1 file-level cast, 21+ uses)
- Missing models: `OfficeAiWorkflowTemplate`, `OfficeAiSchedule`, `OfficeAiRoleConfig`
- **Action needed:** Add models to schema or remove dead code

---

## Legitimate Occurrences

### `prisma-repository.ts` (31 casts)
Documented in file header: "Tier B/A models remain as optional schema extensions with `as any` + fail-soft try/catch." All accesses are wrapped in try/catch, so runtime failure is handled gracefully. The models (`salesMarketSignal`, `salesCommercialRecommendation`, `salesKnowledgeGraphNode`, etc.) are documented as optional SalesOS advanced intelligence extensions not yet added to the schema.

---

## `@ts-nocheck` Files Referencing Prisma

| File | Prisma Ref | Verdict |
|------|-----------|---------|
| `audit-ai-bridge.test.ts` | Mocked models | Legitimate (complex mock setup) |
| `audit-sampling-action.test.ts` | No prisma ref | **Overly Broad** — remove `@ts-nocheck` |
| `guards.test.ts` | Mocked `findUnique` | **Overly Broad** — use `jest.mocked()` |
| `institutional-memory.test.ts` | 10+ mocked models | Legitimate |
| `localcontent-signal-producer.ts` | Real prisma calls, all models exist | **Overly Broad** — remove `@ts-nocheck` |
| `sales-signal-producer.ts` | No prisma ref | **Overly Broad** — remove `@ts-nocheck` |
| `sales/approval/page.tsx` | No prisma ref | **Overly Broad** — remove `@ts-nocheck` |

---

## Conclusion

The audit correctly identified the use of `prisma as any` across the codebase. However:
- **55% of occurrences** (31 of 52 in `prisma-repository.ts`) are **legitimate** — documented, guarded, or dynamically required
- **33%** (17 in 3 files) are **dangerous** — accessing models that don't exist
- **2 occurrences** (2 files) were **unnecessary** and have been **fixed**
- The remaining are low-risk test file patterns

The dangerous occurrences require schema alignment (separate task) — adding the missing models or removing the dead code paths.
