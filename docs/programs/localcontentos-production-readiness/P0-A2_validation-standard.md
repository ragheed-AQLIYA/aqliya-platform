---
title: "P0-A2 — LCOS Input Validation Standard"
status: active
program: "LocalContentOS Production Readiness"
phase: 2
work-item: "P0-A2 — SC-01 Standard Definition"
date: 2026-06-27
---

# P0-A2 — LCOS Input Validation Standard

**Objective:** Define a single, consistent validation standard for all LCOS entry points — not an exhaustive Zod retrofit of 116 functions, but a targeted standard that closes the real gap.

**Real gap:** 19 mutation entry points accept untrusted external data without any standardized validation. The rest either have manual validation (partial) or accept only path parameters (implicitly safe).

---

## 1. Validation Pipeline (Standard)

Every mutation entry point must follow this sequence. Every. Single. One.

```
Entry Point (Server Action / API Route)
    │
    ▼
┌─────────────────────────────┐
│ 1. Zod Schema Parse         │  ← Validate shape + types BEFORE anything else
│    (z.object().parse())     │
└─────────────────────────────┘
    │ fail → return { success: false, code: "VALIDATION_ERROR", ... }
    ▼
┌─────────────────────────────┐
│ 2. Normalize / Transform    │  ← Trim strings, coerce numbers, default values
│    (schema.transform())     │
└─────────────────────────────┘
    ▼
┌─────────────────────────────┐
│ 3. Authorization Guard      │  ← requireUserContext / assertProjectAccess
│    (existing patterns)      │
└─────────────────────────────┘
    │ fail → throw / redirect
    ▼
┌─────────────────────────────┐
│ 4. Business Rules           │  ← Domain-level invariants (optional, after auth)
│    (service layer)          │
└─────────────────────────────┘
    ▼
┌─────────────────────────────┐
│ 5. Persistence / Mutation   │
│    (service → Prisma)       │
└─────────────────────────────┘
    ▼
┌─────────────────────────────┐
│ 6. Audit Log                │  ← Log mutation AFTER success
│    (existing pattern)       │
└─────────────────────────────┘
```

**Rule:** Step 1 (Zod) is **always first**, before auth, before business logic, before anything. This prevents malformed data from reaching auth checks or services.

**Rule:** Read-only entry points (queries, lists, exports) do NOT require Zod — path params from Next.js routing are trusted. But if they accept query params, those must have Zod schemas too.

---

## 2. Schema Library Structure

New directory: `src/lib/local-content/schemas/`

```
src/lib/local-content/schemas/
├── common.ts          ← Shared primitives (entityId, percentage, year, etc.)
├── project.ts         ← Project CRUD schemas
├── supplier.ts        ← Supplier CRUD schemas
├── evidence.ts        ← Evidence upload/status schemas
├── spend.ts           ← Spend record + CSV import schemas
├── finding.ts         ← Finding CRUD schemas
├── review.ts          ← Review/approval schemas
├── report.ts          ← Report generation schemas
├── workbook.ts        ← Workbook + line schemas
├── content-studio.ts  ← Content studio schemas
├── ai-review.ts       ← AI review action schemas (patterns, flags, etc.)
└── index.ts           ← Re-exports all schemas for convenience
```

### `common.ts` — Shared Primitives

```ts
import { z } from "zod";

// === Identifiers ===
export const entityId = z.string().trim().min(1, "Required");
export const optionalEntityId = z.string().trim().min(1).optional();

// === Text Fields ===
export const requiredText = z.string().trim().min(1, "Required");
export const optionalText = z.string().trim().optional();
export const longText = z.string().trim().min(1).max(10000, "Too long");
export const optionalLongText = z.string().trim().max(10000).optional();

// === Numeric Fields ===
export const percentage = z.coerce.number().min(0).max(100);
export const optionalPercentage = z.coerce.number().min(0).max(100).optional();
export const nonNegativeNumber = z.coerce.number().min(0);
export const optionalNonNegativeNumber = z.coerce.number().min(0).optional();
export const positiveNumber = z.coerce.number().min(0.01);
export const currencyAmount = z.coerce.number().min(0).multipleOf(0.01);
export const optionalCurrencyAmount = z.coerce.number().min(0).optional();

// === Enums (reused from Prisma-generated enums) ===
import { ProjectStatus, SupplierStatus, AssessmentType } from "@prisma/client";
export const projectStatusEnum = z.nativeEnum(ProjectStatus);
export const supplierStatusEnum = z.nativeEnum(SupplierStatus);
export const assessmentTypeEnum = z.nativeEnum(AssessmentType);

// === Special Formats ===
export const yearField = z.coerce.number().int().min(2020).max(2100);
export const csvText = z.string().min(1).max(5_000_000); // 5MB max
export const booleanFlag = z.boolean();
export const optionalBooleanFlag = z.boolean().optional();

// === ID Arrays ===
export const idArray = z.array(entityId).min(1);

// === FormData Helpers ===
export function formText(formData: FormData, key: string): z.ZodString {
  return z.string().trim().min(1).parse(formData.get(key) ?? "");
}
// NOTE: Helper functions are for migration convenience. Prefer parse(formData)
// with z.object() where possible.
```

### Every schema file exports:
- **CreateSchema** — fields required for creation
- **UpdateSchema** — fields for update (usually partial)
- **ActionSchema** — if a single specific action (approve, reject, submit)
- **Any other schemas** needed for specific entry points

---

## 3. Error Contract

Every Zod validation failure returns the same shape, everywhere.

### Successful response:

```json
{
  "success": true,
  "data": { ... }
}
```

### Validation error response:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": [
    { "field": "supplierName", "message": "Required", "code": "too_small" },
    { "field": "percentage", "message": "Must be 0-100", "code": "too_big" }
  ]
}
```

### Server Action helper (reusable):

```ts
import { ZodError } from "zod";

export function parseOrError<T>(schema: z.ZodSchema<T>, input: unknown): 
  | { success: true; data: T }
  | { success: false; code: "VALIDATION_ERROR"; message: string; details: Array<{ field: string; message: string; code: string }> }
{
  const result = schema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const details = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));

  return {
    success: false,
    code: "VALIDATION_ERROR",
    message: "Invalid input",
    details,
  };
}
```

This goes in `src/lib/local-content/schemas/common.ts` and is the **only** way to handle Zod errors in LCOS.

### Rule for Server Actions:

```ts
// BEFORE (current pattern — inconsistent):
export async function createSupplierAction(projectId: string, formData: FormData) {
  const name = validateRequired(formData, "name");
  const status = formData.get("status") as string; // no validation
  // ...

// AFTER (standard):
export async function createSupplierAction(projectId: string, formData: FormData) {
  const parsed = parseOrError(supplierSchema, formData);
  if (!parsed.success) return parsed; // ← standard error response

  const { name, status, ...rest } = parsed.data;
  // ... proceed with typed, validated data
}
```

---

## 4. Migration Matrix — 19 Must-Fix Entry Points

Priority categories:

| Priority | Meaning | Action |
|:--------:|:--------|:-------|
| **P0** | Mutation, no validation, high risk | Fix first |
| **P0a** | Mutation, partial manual validation | Migrate to Zod |
| **P1** | Mutation, no validation, lower risk | Fix second |
| **P1a** | Mutation, partial validation, low risk | Migrate to Zod |
| **P2** | Mutation, no auth + no validation | Requires separate authorization fix |

### P0 — Mutation, no validation, state-changing, untrusted data

| # | Entry Point | File | Risk | Schema File |
|:-:|:------------|:-----|:----:|:------------|
| 1 | `updateLocalContentEvidenceStatusAction` | localcontent-actions.ts | 🔴 Raw string status (expecting enum) | evidence.ts |
| 2 | `uploadLocalContentEvidenceFileAction` | localcontent-actions.ts | 🔴 FormData with file bytes + metadata | evidence.ts |
| 3 | `createLocalContentFindingAction` | localcontent-actions.ts | 🔴 FormData — creates records | finding.ts |
| 4 | `updateLocalContentFindingAction` | localcontent-actions.ts | 🔴 FormData — updates records | finding.ts |
| 5 | `submitLocalContentReviewAction` | localcontent-actions.ts | 🔴 FormData — triggers workflow | review.ts |
| 6 | `submitLocalContentApprovalAction` | localcontent-actions.ts | 🔴 FormData — triggers approval | review.ts |
| 7 | `importLocalContentSpendCsvAction` | localcontent-actions.ts | 🔴 Large raw text, CSV injection risk | spend.ts |

### P0a — Mutation, partial manual validation, migrate to Zod

| # | Entry Point | File | Risk | Schema File |
|:-:|:------------|:-----|:----:|:------------|
| 8 | `createLocalContentProjectAction` | localcontent-actions.ts | 🟡 Has `validateRequired` — standardize | project.ts |
| 9 | `createLocalContentSupplierAction` | localcontent-actions.ts | 🟡 Has ad-hoc validators — standardize | supplier.ts |
| 10 | `updateLocalContentSupplierAction` | localcontent-actions.ts | 🟡 Has ad-hoc validators — standardize | supplier.ts |
| 11 | `createLocalContentSpendRecordAction` | localcontent-actions.ts | 🟡 Has `validatePercentage` — standardize | spend.ts |
| 12 | `classifyLocalContentSpendRecordAction` | localcontent-actions.ts | 🟡 Has `validateRequired` — standardize | spend.ts |
| 13 | `createLocalContentEvidenceAction` | localcontent-actions.ts | 🟡 Has `validateRequired` — standardize | evidence.ts |
| 14 | `updateLocalContentVerificationItemAction` | localcontent-actions.ts | 🟡 Has `getOptionalTrimmedValue` — standardize | project.ts |

### P1 — Mutation, raw string params, no validation

| # | Entry Point | File | Risk | Schema File |
|:-:|:------------|:-----|:----:|:------------|
| 15 | `generateLocalContentReportAction` | localcontent-actions.ts | 🟡 Raw reportType + format strings | report.ts |

### P1a — Mutation, partial validation (workbook/import/review)

| # | Entry Point | File | Risk | Schema File |
|:-:|:------------|:-----|:----:|:------------|
| 16 | `populateWorkbookFromTbAction` | localcontent-workbook-actions.ts | 🟡 TbLine[] array, untrusted | workbook.ts |
| 17 | `runSimulationAction` | localcontent-ai-advisor-v3-actions.ts | 🟡 Record<string, number> params | ai-review.ts |

### P2 — Requires auth fix + validation (out of SC-01 scope, noted for reference)

| # | Entry Point | File | Risk | Note |
|:-:|:------------|:-----|:----:|:-----|
| 18 | `createWorkbookAction` | localcontent-workbook-actions.ts | 🟡 No auth guard | Needs RBAC fix first |
| 19 | `populateWorkbookAction` | localcontent-workbook-actions.ts | 🟡 No auth guard | Needs RBAC fix first |

### Excluded from SC-01

The following 12 functions in `localcontent-review-actions.ts` and `localcontent-workbook-actions.ts` lack *both* auth and validation. They are **not included** in SC-01's 19 count because:

- They require a separate RBAC pass to add auth guards
- Adding validation to a publicly accessible action is incomplete
- They will be fixed in a follow-up program (SC-02 or dedicated RBAC work item)

---

## 5. Exit Criteria for P0-A2

P0-A2 is **complete** when:

| Criteria | Standard | Status |
|:---------|:---------|:-------|
| **Pipeline defined** | Single standard pipeline doc | ✅ Done (Section 1 above) |
| **Schema library structure defined** | Directory layout + file responsibilities | ✅ Done (Section 2 above) |
| **Common primitives defined** | `common.ts` — id, text, numbers, enums, helpers | ✅ Done (Section 2 above) |
| **Error contract defined** | Single `parseOrError` helper + response shape | ✅ Done (Section 3 above) |
| **Migration matrix defined** | 19 entry points mapped to priorities + schema files | ✅ Done (Section 4 above) |
| **Exclusion rationale documented** | Why certain entry points are not in SC-01 | ✅ Done (Section 4 above) |
| **Naming convention defined** | Schema file naming, export naming | ⚠️ Standardized within this doc, formalized below |

### Naming Convention

| Pattern | Example |
|:--------|:--------|
| **Schema file** | `kebab-case.ts` matching domain |
| **Export: create** | `createSupplierSchema` |
| **Export: update** | `updateSupplierSchema` |
| **Export: action** | `approveEvidenceSchema` |
| **Export: query** | `listProjectsQuerySchema` (only if query params are used) |
| **Import** | `import { createSupplierSchema } from "../schemas/supplier"` |

### Rule: One schema per action pattern

Each Server Action that accepts a FormData or object input gets exactly one export from the schema library:

```ts
// In server action file:
import { createSupplierSchema } from "../schemas/supplier";

export async function createSupplierAction(projectId: string, formData: FormData) {
  const parsed = parseOrError(createSupplierSchema, Object.fromEntries(formData));
  // ...
}
```

Exception: If the same input shape is used by multiple actions (e.g. status update), export a shared schema like `updateStatusSchema` from the appropriate file.

---

## 6. Validation Summary Table (Short Reference)

```
Pipeline:  Zod → Normalize → Auth → Business → Persist → Audit
Errors:    parseOrError → { success, code, message, details }
Schema:    src/lib/local-content/schemas/{domain}.ts
Primitives: entityId, requiredText, percentage, currencyAmount, etc.
Target:    19 P0/P0a/P1 entry points → Zod schemas
Excluded:  entry points without auth (deferred to RBAC program)
Rule:      Zod ALWAYS before auth
```

---

## Ready for P0-A3

This standard is now defined. The next phase (P0-A3) implements:

1. Create `src/lib/local-content/schemas/` directory with all files
2. Implement `parseOrError` helper in `common.ts`
3. Retrofit P0 entry points (1-7) — create schema + wire into action
4. Retrofit P0a entry points (8-14) — replace manual validation with Zod
5. Retrofit P1 entry points (15-17)
6. Update tests for each changed action
7. Validate: `npx tsc --noEmit && npm run build && npm test`
