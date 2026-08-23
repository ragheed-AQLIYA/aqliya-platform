# AQLIYA xlsx → ExcelJS Migration Report

**Date:** 2026-08-17  
**Status:** COMPLETE — All phases validated  
**Security posture:** Improved (unpatched CVE eliminated)

---

## Executive Summary

The `xlsx` (SheetJS) library (`^0.18.5`) has been **fully removed** from the AQLIYA codebase and replaced with ExcelJS. The migration touched 30+ files across `src/`, `scripts/`, and `tests/`. All 41 critical-path tests pass. TypeScript compiles cleanly. The `xlsx` package no longer appears in `package.json`, `package-lock.json`, or `node_modules/`.

### Key Metrics

| Metric | Before | After |
|--------|--------|-------|
| `xlsx` CVEs | 1 (unpatched, no fix available) | 0 |
| `xlsx` import sites | 30+ across src/ and scripts/ | 0 |
| `xlsx` in package.json | `"xlsx": "^0.18.5"` | Removed |
| `xlsx` in lockfile | Present | Removed |
| `xlsx` in node_modules | Present | Removed |
| Critical-path tests | 41/41 passing | 41/41 passing |
| TypeScript errors | 0 | 0 |

---

## Background

### Why Migrate

The `xlsx` library (SheetJS Community Edition, v0.18.5) is **permanently unpatched**. It has known CVEs with no fix path. SheetJS moved to a closed-source "Pro" model, meaning the community edition will never receive security updates. For a governed institutional intelligence platform, this is unacceptable.

### Why ExcelJS

- **0 open CVEs** at time of migration
- **14M weekly npm downloads** (battle-tested)
- **TypeScript built-in** (no `@types` needed)
- **Streaming support** for large files
- **Active maintenance** with regular releases
- **Same feature set** as the community xlsx library (read/write xlsx, CSV, styles, formulas, merged cells)

---

## Architecture Decisions

### 1. Parser Abstraction Layer (`src/lib/xlsx/`)

Instead of replacing `xlsx` imports directly with `import ExcelJS from 'exceljs'` everywhere, we created an abstraction layer:

```
src/lib/xlsx/
├── index.ts      — Public API barrel
├── types.ts      — Workbook/Worksheet/ReadOptions/WriteOptions
├── reader.ts     — readBuffer(), readFile()
├── writer.ts     — writeBuffer(), writeFile()
├── helpers.ts    — aoaToSheet, sheetToJson, decodeRange, etc.
└── __tests__/    — Unit tests for the abstraction
```

**Benefits:**
- Business code depends on AQLIYA's API, not ExcelJS directly
- Future parser swaps (if needed) require changes in one place only
- Consistent async interface (`readBuffer` returns `Promise<Workbook>`)
- Server-side code uses `@/lib/xlsx` abstraction; standalone scripts use ExcelJS directly

### 2. Two Migration Patterns

| Location | Pattern | Rationale |
|----------|---------|-----------|
| `src/` (production code) | `import { readBuffer } from '@/lib/xlsx'` | Abstraction layer — swap-safe |
| `scripts/` (standalone utilities) | `import ExcelJS from 'exceljs'` | Direct ExcelJS — simpler, no bundler needed |

### 3. Security Boundary Preserved

The ZIP bomb validation (`validateXlsxArchive()`) runs **before** any parser invocation. This invariant is parser-agnostic:

```
Buffer → validateXlsxArchive(buffer) → readBuffer(buffer) → ExcelJS parses
```

No changes were made to the security boundary. The validator lives in `src/lib/security/xlsx-validation.ts` and is imported by all consumers.

### 4. Async Write Paths

ExcelJS write operations (`writeBuffer()`) are async. All write-path callers were updated with `await`:

- `src/lib/audit/export/xlsx-exporter.ts` — `writeBuffer()` now awaited
- `src/lib/local-content/export.ts` — `writeBuffer()` now awaited

---

## Files Changed

### New Files (6)

| File | Purpose |
|------|---------|
| `src/lib/xlsx/index.ts` | Public API barrel — re-exports all types and functions |
| `src/lib/xlsx/types.ts` | TypeScript interfaces: Workbook, Worksheet, ReadOptions, WriteOptions |
| `src/lib/xlsx/reader.ts` | `readBuffer(buffer)`, `readFile(path)` — async ExcelJS parsing |
| `src/lib/xlsx/writer.ts` | `writeBuffer(wb)`, `writeFile(wb, path)` — async ExcelJS writing |
| `src/lib/xlsx/helpers.ts` | `aoaToSheet`, `sheetToJsonArrays`, `sheetToJsonObjects`, `decodeRange`, etc. |
| `src/lib/xlsx/__tests__/reader.test.ts` | Unit tests for the abstraction layer |

### Modified Files — src/ (9)

| File | Change |
|------|--------|
| `src/lib/office-ai/file-extraction-service.ts` | `import { readBuffer } from '@/lib/xlsx'` |
| `src/lib/office-ai/__tests__/xlsx-zip-bomb-security.test.ts` | `import { readBuffer } from '@/lib/xlsx'` |
| `src/lib/local-content/erp/file-importer.ts` | `import { readBuffer } from '@/lib/xlsx'` |
| `src/lib/local-content/erp/__tests__/file-importer.test.ts` | `import { readBuffer } from '@/lib/xlsx'` |
| `src/lib/security/__tests__/xlsx-validation.test.ts` | `import { readBuffer } from '@/lib/xlsx'` |
| `src/lib/local-content/workbook/tb-loader.ts` | Already migrated — verified |
| `src/lib/local-content/export.ts` | Already migrated — verified |
| `src/lib/audit/export/xlsx-exporter.ts` | Already migrated — verified |
| `src/components/audit/trial-balance/components/utils.ts` | Already migrated — verified |

### Modified Files — scripts/ (17)

| File | Change |
|------|--------|
| `scripts/audit/tb-xlsx-inspect.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/tb-unmapped-report.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/tb-remap-unmapped.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/tb-reclassify-all.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/tb-closing-adjustment-analysis.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/shalfa-pilot-setup.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/tb-classification-preview.ts` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/p10-pl-simulation.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/p11-audited-presentation-analysis.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/p12-generalization-validation.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/p13-2-validation.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/audit/p14-ga-mapping-gap.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/validation/tb-classification-run.ts` | `import ExcelJS from 'exceljs'` |
| `scripts/validation/tb-classification-validation.mjs` | `import { readBuffer } from '@/lib/xlsx'` |
| `scripts/local-content/generate-synthetic-tb.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/local-content/phase2-regenerate.mjs` | `import ExcelJS from 'exceljs'` |
| `scripts/localcontent/pilot-extract.cjs` | `const ExcelJS = require('exceljs')` |

### Removed (1)

| File | Change |
|------|--------|
| `package.json` | `"xlsx": "^0.18.5"` removed |

---

## Validation Results

### TypeScript

```
npx tsc --noEmit
# Result: 0 errors
```

### Critical-Path Tests

| Suite | Tests | Status |
|-------|-------|--------|
| `xlsx-validation` (security) | 17/17 | PASS |
| `file-importer` (ERP import) | 16/16 | PASS |
| `xlsx-zip-bomb` (Office AI) | 8/8 | PASS |
| **Total** | **41/41** | **PASS** |

### npm audit — xlsx CVEs

```
npm audit | Select-String "xlsx"
# Result: (no output) — zero xlsx mentions
```

The `xlsx` CVE is fully eliminated. Remaining audit findings are from unrelated packages (sharp, uuid/exceljs dependency, valibot) and are pre-existing.

---

## Security Impact

### Before

- `xlsx@0.18.5` — known CVE, no patch available, permanently abandoned by maintainer
- ZIP bomb validation in place (Layer 2) but underlying parser was unpatchable

### After

- `xlsx` fully removed from dependency tree
- ZIP bomb validation (Layer 2) preserved unchanged — parser-agnostic
- ExcelJS is actively maintained with 0 open CVEs
- `validateXlsxArchive()` → `readBuffer()` pipeline unchanged

### Security Invariant

```
Buffer → validateXlsxArchive(buffer) → readBuffer(buffer) → ExcelJS parses
```

This invariant was **not modified** during migration. The security boundary is parser-agnostic.

---

## Risk Assessment

### Risks Mitigated

| Risk | Mitigation |
|------|------------|
| Unpatched CVE in xlsx | Package removed entirely |
| ZIP bomb via crafted XLSX | Security validation unchanged, tests pass |
| Breaking change in write paths | All write callers updated to async, tests pass |
| Client-side parsing regression | `utils.ts` migrated to `@/lib/xlsx`, TS compiles |

### Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| ExcelJS async API may surface timing issues in edge cases | Low | All callers already async; no sync call sites |
| `exceljs` has transitive `uuid` dependency with moderate CVE | Low | Not exploitable in this context; pre-existing |
| Scripts using ExcelJS directly (not abstraction) | Low | Standalone utilities; no shared code paths |

---

## Migration Pattern Reference

### Pattern 1: Server-side read (src/)

```typescript
// Before
import * as XLSX from 'xlsx';
const wb = XLSX.read(buffer, { type: 'buffer' });

// After
import { readBuffer } from '@/lib/xlsx';
const wb = await readBuffer(buffer);
```

### Pattern 2: Server-side write (src/)

```typescript
// Before
import * as XLSX from 'xlsx';
const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

// After
import { writeBuffer } from '@/lib/xlsx';
const buf = await writeBuffer(wb);
```

### Pattern 3: AOA-to-sheet helper

```typescript
// Before
const ws = XLSX.utils.aoa_to_sheet(data);
ws['!cols'] = colWidths;
XLSX.utils.book_append_sheet(wb, ws, name);

// After
import { aoaToSheet } from '@/lib/xlsx';
const ws = aoaToSheet(wb, data, { sheetName: name, colWidths });
```

### Pattern 4: JSON-to-sheet helper

```typescript
// Before
const ws = XLSX.utils.json_to_sheet(data);

// After
import { jsonToSheet } from '@/lib/xlsx';
const ws = jsonToSheet(wb, data, { sheetName: 'Data' });
```

### Pattern 5: Sheet-to-JSON helper

```typescript
// Before
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// After
import { sheetToJsonArrays } from '@/lib/xlsx';
const rows = sheetToJsonArrays(ws);
```

### Pattern 6: Client-side parsing

```typescript
// Before
import * as XLSX from 'xlsx';
const wb = XLSX.read(buffer, { type: 'array' });

// After
import { readBuffer } from '@/lib/xlsx';
const wb = await readBuffer(buffer);
```

### Pattern 7: Standalone script (scripts/)

```javascript
// Before
import XLSX from 'xlsx';
const wb = XLSX.read(buffer, { type: 'buffer' });

// After
import ExcelJS from 'exceljs';
const wb = new ExcelJS.Workbook();
await wb.xlsx.load(buffer);
```

### Pattern 8: cellText helper (scripts/)

```javascript
// Before
const val = cell.v;

// After
function cellText(cell) {
  return cell?.text ?? cell?.result ?? cell?.value ?? '';
}
const val = cellText(cell);
```

---

## Pre-existing Audit Findings (Unchanged)

| Finding | Status |
|---------|--------|
| `src/lib/local-content/erp/prisma-repository.ts` — `@ts-nocheck` (R-04) | Pre-existing |
| `src/lib/content-studio/adapters/types.ts` — schema drift (R-03) | Pre-existing |
| `scripts/platform/validate-env.mjs` — env validation strict | Pre-existing |

These are unrelated to the xlsx migration and were not modified.

---

## Conclusion

The `xlsx` (SheetJS) library has been **completely eliminated** from the AQLIYA codebase. All 30+ import sites have been migrated to either the `@/lib/xlsx` abstraction layer (production code) or direct ExcelJS (standalone scripts). The security boundary (ZIP bomb validation) is preserved. All 41 critical-path tests pass. TypeScript compiles cleanly. The unpatched CVE is gone.

The codebase is now free of permanently unpatched dependencies in the xlsx processing path.

---

*Report generated by OpenCode agent (big-pickle) on 2026-08-17.*
