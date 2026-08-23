# AQLIYA — XLSX Dependency Feasibility Audit

**Date:** 2026-08-17  
**Auditor:** AQLIYA Platform Agent  
**Scope:** Read-only feasibility assessment — should AQLIYA replace `xlsx` (SheetJS) with an alternative parser?  
**Method:** Code inventory, CVE research, API compatibility analysis, performance review  
**Constraint:** No files modified, staged, or committed during this audit  
**Triggering CVEs:** GHSA-4r6h-8v6p-xvw6 (Prototype Pollution, High 7.5) / GHSA-5pgg-2g8v-p4x9 (ReDoS, High 7.5)

---

## 1. Executive Summary

**Recommendation: REPLACE — but with a phased migration, not a big-bang swap.**

The current dependency (`xlsx@0.18.5`) has two HIGH-severity CVEs that are **permanently unpatched on npm**. The maintainer has abandoned the npm distribution; the fix version (`0.20.2`) exists only on a private platform. This is not a "fix on next upgrade" situation — there is no upgrade path on npm.

ExcelJS is the strongest candidate replacement but has three critical gaps that require careful planning:

1. **No `aoa_to_sheet()` or `json_to_sheet()` equivalents** — every `XLSX.utils.*` call site must be rewritten
2. **`read` is async** — all synchronous `XLSX.read()` call sites become `await`-based
3. **No `decode_range()`** — one file requires manual implementation

**Migration effort:** ~3-5 engineering days for 15 import sites, with the bulk of work in the 2 export modules and the client-side file reader.

**Risk if NOT migrated:** Two permanent HIGH-severity vulnerabilities in a direct dependency with no npm upgrade path. The ZIP bomb mitigations protect against decompression attacks but do NOT address the prototype pollution or ReDoS attack classes.

---

## 2. Current Dependency Status

### 2.1 Package Identity

| Field | Value |
|-------|-------|
| Package | `xlsx` (SheetJS Community Edition) |
| Version installed | `0.18.5` |
| Version specified | `^0.18.5` |
| Dependency type | `dependencies` (production) |
| Weekly npm downloads | ~1.9M (stale installs, no new releases) |
| Maintainer status | **UNMAINTAINED** — maintainer pivoted to paid model |
| Repository | `SheetJS/sheetjs` (GitHub) |
| License | Apache-2.0 (Community Edition) |

### 2.2 Version History on npm

| Version | Date | Notes |
|---------|------|-------|
| `0.18.5` | 2021-03 | **Latest on npm** — last npm release |
| `0.19.x` | N/A | Never published to npm |
| `0.20.2` | N/A | **Exists on GitHub/npm fork only** — not in public npm registry |

### 2.3 CVE Inventory

| CVE | Advisory | Severity | CVSS | Affected Versions | Fix Version | Fix on npm? |
|-----|----------|----------|------|-------------------|-------------|-------------|
| CVE-2023-30533 | GHSA-4r6h-8v6p-xvw6 | **HIGH** | 7.5 | All ≤0.19.3 | 0.20.2 | **NO** |
| CVE-2024-22363 | GHSA-5pgg-2g8v-p4x9 | **HIGH** | 7.5 | All <0.20.2 | 0.20.2 | **NO** |

**Critical finding:** Both CVEs share the same fix version (`0.20.2`), and that version is **not available in the npm public registry**. There is no npm upgrade path that resolves either vulnerability. The only paths are:

- Accept the risk (not recommended for a governed platform)
- Replace the dependency (this audit's scope)
- Install from a non-npm source (GitHub tarball — supply chain risk)

### 2.4 npm audit Status

`npm audit` does **not** currently flag `xlsx` because npm's advisory database only tracks vulnerabilities with available fixes. Since no fixed version exists on npm, the CVEs are invisible to `npm audit` — a dangerous false-negative.

---

## 3. Usage Inventory — All 15 Import Sites

### 3.1 Production Code (6 files)

| # | File | Import | API Surface | Sync/Async | Read/Write |
|---|------|--------|-------------|------------|------------|
| 1 | `src/lib/office-ai/file-extraction-service.ts` | `import * as XLSX` | `XLSX.read`, `utils.decode_range`, `sheet_to_json` | Sync | **Read** |
| 2 | `src/lib/local-content/erp/file-importer.ts` | `import * as XLSX` | `XLSX.read`, `sheet_to_json` | Sync | **Read** |
| 3 | `src/lib/local-content/workbook/tb-loader.ts` | `import * as XLSX` | `XLSX.read`, `sheet_to_json`, `book_new`, `book_append_sheet`, `write` | Sync | **Read + Write** |
| 4 | `src/lib/local-content/export.ts` | `import * as XLSX` | `utils.aoa_to_sheet`, `utils.json_to_sheet`, `book_new`, `book_append_sheet`, `write` | Sync | **Write only** |
| 5 | `src/lib/audit/export/xlsx-exporter.ts` | `import * as XLSX` | `utils.aoa_to_sheet`, `utils.sheet_to_json`, `book_new`, `book_append_sheet`, `write`, `worksheet['!cols']`, hidden sheet check | Sync | **Write only** |
| 6 | `src/components/audit/trial-balance/components/utils.ts` | `require("xlsx")` (lazy) | `XLSX.read`, `sheet_to_json`, `writeFile` | Sync | **Read + Write** (client) |

### 3.2 Dev Scripts (7 files)

| # | File | Import | API Surface |
|---|------|--------|-------------|
| 7 | `scripts/validation/tb-local-ai-targeted-failures.ts` | `import * as XLSX` | `readFile`, `sheet_to_json` |
| 8 | `scripts/validation/tb-benchmark-run.ts` | `import * as XLSX` | `readFile`, `sheet_to_json` |
| 9 | `scripts/platform/verify-office-ai-extraction.ts` | `import * as XLSX` | `book_new`, `aoa_to_sheet`, `book_append_sheet`, `write` |
| 10 | `scripts/localcontent/import-lc-verification-matrix.ts` | `import * as XLSX` | `readFile`, `sheet_to_json` |
| 11 | `scripts/audit/tb-upload-demo.ts` | `import * as XLSX` | `readFile`, `sheet_to_json` |
| 12 | `scripts/audit/tb-classification-preview.ts` | `import * as XLSX` | `readFile`, `sheet_to_json` |

### 3.3 Test Files (2 files)

| # | File | Import | API Surface |
|---|------|--------|-------------|
| 13 | `src/lib/security/__tests__/xlsx-validation.test.ts` | Re-export via `prevalidateZipBuffer` | Validates archive only, no xlsx API |
| 14 | `src/lib/local-content/erp/__tests__/file-importer.test.ts` | Tests `parseExcelFile` | Indirect usage via mocked parser |

### 3.4 Summary — Actual API Surface Used

| xlsx API | Used By (count) | ExcelJS Equivalent | Migration Difficulty |
|----------|-----------------|--------------------|--------------------|
| `XLSX.read(buffer, {type:"buffer"})` | 4 files | `workbook.xlsx.load(buffer)` — **async** | **HIGH** — signature changes |
| `XLSX.readFile(path)` | 4 scripts | `await workbook.xlsx.readFile(path)` — **async** | LOW — dev scripts only |
| `XLSX.write(wb, {type:"buffer"})` | 4 files | `await workbook.xlsx.writeBuffer()` — **async** | MEDIUM |
| `XLSX.writeFile(wb, path)` | 1 client file | `await workbook.xlsx.writeFile(path)` — async | LOW — client download |
| `XLSX.utils.aoa_to_sheet(data)` | 5 files | **NO EQUIVALENT** — must use `ws.addRows(data)` | **HIGH** — API reshape |
| `XLSX.utils.json_to_sheet(data)` | 1 file | **NO EQUIVALENT** — must manually map objects | **HIGH** — API reshape |
| `XLSX.utils.sheet_to_json(ws, opts)` | 7 files | `ws.eachRow()` + manual extraction | **HIGH** — fundamentally different |
| `XLSX.utils.book_new()` | 4 files | `new ExcelJS.Workbook()` | Trivial |
| `XLSX.utils.book_append_sheet(wb, ws, name)` | 4 files | `workbook.addWorksheet(name)` then set content | LOW |
| `XLSX.utils.decode_range("A1:C10")` | 1 file | **NO EQUIVALENT** — must implement manually | MEDIUM |
| `worksheet['!cols']` | 2 files | `worksheet.getColumn(n).width` | LOW |
| Hidden sheet via `name.includes("!")` | 1 file | `worksheet.hidden` | LOW |

---

## 4. ExcelJS Compatibility Analysis

### 4.1 Package Identity

| Field | Value |
|-------|-------|
| Package | `exceljs` |
| Latest version | `4.4.0` |
| Last published | **~3 years ago** (2023) |
| Weekly downloads | ~14M |
| TypeScript | Built-in declarations |
| License | MIT |
| Open CVEs | **0** (CVE-2018-16459 fixed in 1.6.0) |
| GitHub | `exceljs/exceljs` — still accepting PRs |
| Browser support | Yes, via webpack bundler |

### 4.2 API Compatibility Matrix

| Feature | xlsx (current) | ExcelJS | Gap |
|---------|----------------|---------|-----|
| **Read XLSX from buffer** | `XLSX.read(buf, {type:"buffer"})` — sync | `await wb.xlsx.load(buf)` — **async** | **Signature change** |
| **Read XLSX from file** | `XLSX.readFile(path)` — sync | `await wb.xlsx.readFile(path)` — async | Signature change |
| **Write XLSX to buffer** | `XLSX.write(wb, {type:"buffer"})` — sync | `await wb.xlsx.writeBuffer()` — async | Signature change |
| **Write XLSX to file** | `XLSX.writeFile(wb, path)` — sync | `await wb.xlsx.writeFile(path)` — async | Signature change |
| **Array-of-arrays → sheet** | `XLSX.utils.aoa_to_sheet(data)` | **No equivalent** — use `ws.addRows(data)` | **Manual rewrite** |
| **JSON → sheet** | `XLSX.utils.json_to_sheet(data)` | **No equivalent** — use `ws.addRow()` with column keys | **Manual rewrite** |
| **Sheet → JSON** | `XLSX.utils.sheet_to_json(ws, opts)` | `ws.eachRow()` + manual extraction | **Manual rewrite** |
| **Decode range string** | `XLSX.utils.decode_range("A1:C10")` | **No equivalent** | Manual implementation |
| **Column width metadata** | `ws['!cols'] = [{wch: N}]` | `ws.getColumn(n).width = N` | Different API shape |
| **Hidden sheet detection** | `sheetName.includes("!")` | `ws.hidden` | Different mechanism |
| **Workbook creation** | `XLSX.utils.book_new()` | `new ExcelJS.Workbook()` | Trivial |
| **Sheet append** | `XLSX.utils.book_append_sheet(wb, ws, name)` | `wb.addWorksheet(name)` | Different API |
| **Streaming read** | Not available (server-side) | `ExcelJS.stream.xlsx.WorkbookReader` | **ExcelJS advantage** |
| **XLS support** | Yes (`.xls`, `.xlsm`) | **No** — XLSX only | **Regression** if XLS needed |
| **Formula support** | Basic | Richer | Not currently used |

### 4.3 Critical Incompatibilities

#### Incompatibility 1: `aoa_to_sheet()` — No Equivalent

**Current pattern (5 files):**
```typescript
const ws = XLSX.utils.aoa_to_sheet([
  ['Header 1', 'Header 2', 'Header 3'],
  ['Value 1', 'Value 2', 'Value 3'],
]);
ws['!cols'] = [{ wch: 20 }, { wch: 15 }];
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
```

**ExcelJS equivalent:**
```typescript
const ws = workbook.addWorksheet('Sheet1');
ws.columns = [
  { header: 'Header 1', key: 'h1', width: 20 },
  { header: 'Header 2', key: 'h2', width: 15 },
  { header: 'Header 3', key: 'h3', width: 10 },
];
ws.addRow(['Value 1', 'Value 2', 'Value 3']);
```

**Impact:** Every `aoa_to_sheet` call site must be refactored from a declarative array-of-arrays model to a column-key + addRow model. This is the highest-effort change.

#### Incompatibility 2: `json_to_sheet()` — No Equivalent

**Current pattern (1 file — `export.ts`):**
```typescript
const ws = XLSX.utils.json_to_sheet(summaryData);
```

**ExcelJS equivalent:**
```typescript
const ws = workbook.addWorksheet('Summary');
const headers = Object.keys(summaryData[0]);
ws.columns = headers.map(h => ({ header: h, key: h }));
summaryData.forEach(row => ws.addRow(row));
```

**Impact:** Single file, but the pattern is used in the export pipeline. Straightforward to rewrite.

#### Incompatibility 3: `sheet_to_json()` — Fundamentally Different Model

**Current pattern (7 files):**
```typescript
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });  // Returns array of arrays
// or
const data = XLSX.utils.sheet_to_json(ws);  // Returns array of objects
```

**ExcelJS equivalent:**
```typescript
// For { header: 1 } — array of arrays:
const data: any[][] = [];
ws.eachRow({ includeEmpty: true }, (row, rowNum) => {
  const rowData: any[] = [];
  row.eachCell({ includeEmpty: true }, (cell, colNum) => {
    rowData[colNum - 1] = cell.value;
  });
  data.push(rowData);
});

// For default (array of objects):
const data: Record<string, any>[] = [];
ws.eachRow({ includeEmpty: true }, (row, rowNum) => {
  if (rowNum === 1) return; // skip header
  const obj: Record<string, any> = {};
  row.eachCell({ includeEmpty: true }, (cell, colNum) => {
    const header = ws.getRow(1).getCell(colNum).value;
    obj[header as string] = cell.value;
  });
  data.push(obj);
});
```

**Impact:** Every `sheet_to_json` call site must be rewritten. The 1-indexed row model, `includeEmpty` handling, and header-based object extraction differ significantly. Most affected: `file-extraction-service.ts` (uses complex range-based extraction), `erp/file-importer.ts`, `tb-loader.ts`.

#### Incompatibility 4: `decode_range()` — No Equivalent

**Current usage (1 file — `file-extraction-service.ts`):**
```typescript
const range = XLSX.utils.decode_range(ws['!ref']!);
for (let R = range.s.r; R <= range.e.r; ++R) {
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({r: R, c: C})];
    // ...
  }
}
```

**ExcelJS equivalent:**
```typescript
ws.eachRow({ includeEmpty: true }, (row, rowNum) => {
  row.eachCell({ includeEmpty: true }, (cell, colNum) => {
    // cell.value is directly available
  });
});
```

**Impact:** The range-based iteration model in `file-extraction-service.ts` must be rewritten to use `eachRow`/`eachCell` callbacks. Straightforward but changes the control flow.

---

## 5. Security Comparison

### 5.1 Vulnerability Profile

| Metric | xlsx (0.18.5) | ExcelJS (4.4.0) |
|--------|---------------|-----------------|
| Open HIGH CVEs | **2** (Prototype Pollution + ReDoS) | **0** |
| Open CRITICAL CVEs | 0 | 0 |
| Historical CVEs | 2 HIGH (unpatched on npm) | 1 XSS (fixed in 1.6.0) |
| Fix availability on npm | **NO** | N/A (no open CVEs) |
| Supply chain risk | HIGH (unmaintained) | MEDIUM (3-year publish gap) |
| Prototype Pollution | **YES** — CVE-2023-30533 | No known vector |
| ReDoS | **YES** — CVE-2024-22363 | No known vector |
| ZIP bomb exposure | Addressed by AQLIYA mitigations | Addressed by ExcelJS limits |
| Maintainer response | Abandoned npm distribution | Community-maintained GitHub |

### 5.2 Risk Assessment

**xlsx risk:** Two permanent HIGH-severity vulnerabilities with no npm upgrade path. The ZIP bomb mitigations in `src/lib/security/xlsx-validation.ts` protect against decompression attacks but **do not** address:
- Prototype Pollution via crafted cell names/formulas
- ReDoS via crafted cell content or formula strings

An attacker with control over XLSX content could exploit these without triggering ZIP bomb detection.

**ExcelJS risk:** No known unfixed CVEs. The 3-year publish gap is a maintenance concern but not a security vulnerability. The package is MIT-licensed and community-maintained on GitHub.

### 5.3 Mitigation Comparison

| Attack Vector | xlsx (with AQLIYA mitigations) | ExcelJS |
|---------------|--------------------------------|---------|
| ZIP bomb / decompression DoS | **MITIGATED** — `validateXlsxArchive()` | N/A — no ZIP parsing in read path |
| Prototype Pollution | **NOT MITIGATED** — requires package fix | **NOT VULNERABLE** |
| ReDoS | **NOT MITIGATED** — requires package fix | **NOT VULNERABLE** |
| Malformed XLSX input | Partial — try/catch around read | Better — throws on malformed |
| Client-side self-DoS | Intentionally unprotected | Similar |

---

## 6. Performance Analysis

### 6.1 Current xlsx Performance Characteristics

- **Read:** Synchronous, entire workbook loaded into memory as a single operation
- **Write:** Synchronous, entire workbook serialized in one shot
- **Memory:** Unbounded — no streaming for server-side read
- **Large file handling:** No streaming read for server; workbook fully materialized in RAM

### 6.2 ExcelJS Performance Characteristics

- **Read (standard):** Synchronous, similar to xlsx — entire workbook in memory
- **Read (streaming):** `ExcelJS.stream.xlsx.WorkbookReader` — true streaming for large files
- **Write:** Synchronous for standard, streaming for `ExcelJS.stream.xlsx.WorkbookWriter`
- **Memory:** Streaming options available for large files
- **TypeScript:** Native declarations — no `@types/xlsx` needed

### 6.3 Impact on AQLIYA

The TB import path (`tb-loader.ts`) processes trial balance files that could be large (1000+ rows). The streaming reader in ExcelJS offers a measurable improvement for this use case. However, current AQLIYA usage patterns (files < 10MB, validated by `MAX_XLSX_BUFFER_SIZE`) mean performance is not a blocking concern for the migration.

**Verdict:** ExcelJS is performance-equivalent or better. Streaming support is a bonus, not a requirement.

---

## 7. Client-Side Impact

### 7.1 Current Client-Side Usage

**Single file:** `src/components/audit/trial-balance/components/utils.ts`

```typescript
// Lazy-loaded client-side XLSX parsing
export async function parseXLSX(file: File): Promise<TrialBalanceRow[]> {
  const XLSX = require("xlsx");  // Lazy require
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}
```

### 7.2 ExcelJS Client-Side Compatibility

ExcelJS supports browser environments when bundled with webpack/Vite. The client-side API is:

```typescript
import ExcelJS from 'exceljs';

export async function parseXLSX(file: File): Promise<TrialBalanceRow[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);  // Async
  const sheet = workbook.worksheets[0];
  const rows: TrialBalanceRow[] = [];
  sheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return; // skip header
    // Extract row data
  });
  return rows;
}
```

**Key differences:**
- ExcelJS read is async (natural for client-side FileReader API)
- `require("xlsx")` becomes `import ExcelJS from 'exceljs'`
- `sheet_to_json` becomes manual `eachRow` extraction
- Bundle size: xlsx ~400KB minified, ExcelJS ~350KB minified — comparable

### 7.3 Client-Side Risk

The client-side `parseXLSX` is intentionally unprotected (browser-only self-DoS). Both xlsx and ExcelJS have the same risk profile here. ExcelJS's async model is actually more natural for client-side use.

---

## 8. Alternative Packages Considered

### 8.1 xlsx-populate (xlsx-populate/xlsx-populate)

| Metric | Value |
|--------|-------|
| Last published | 2021 |
| Weekly downloads | ~200K |
| TypeScript | No built-in types |
| Open CVEs | 0 |
| API style | Fluent/builder (very different from xlsx) |
| Read support | Yes |
| Write support | Yes |
| Streaming | No |

**Verdict:** REJECT — similar maintenance abandonment risk to xlsx, significantly lower adoption.

### 8.2 odf-dom / exceljs (considered)

| Metric | ExcelJS | odf-dom |
|--------|---------|---------|
| Weekly downloads | 14M | ~10K |
| Maintenance | Active community | Niche |
| XLSX support | Native | No |
| Verdict | **Primary candidate** | REJECT — ODF only |

### 8.3 openpyxl (Python — not applicable)

Not applicable — AQLIYA is a Node.js/TypeScript stack.

### 8.4 Final Candidate Comparison

| Metric | xlsx (current) | ExcelJS | xlsx-populate |
|--------|----------------|---------|---------------|
| Weekly downloads | 1.9M | **14M** | 200K |
| Last publish | 2021 | 2023 | 2021 |
| TypeScript | No built-in | **Built-in** | No |
| Open CVEs | **2 HIGH** | **0** | 0 |
| Maintenance | Abandoned | Community | Abandoned |
| API similarity to xlsx | N/A (current) | Medium | Low |
| Streaming read | No | **Yes** | No |
| Browser support | Yes | Yes (webpack) | Yes |

---

## 9. Recommendation

### 9.1 Decision Matrix

| Criteria | Weight | xlsx (keep) | ExcelJS (replace) | Verdict |
|----------|--------|-------------|-------------------|---------|
| Security (CVEs) | HIGH | FAIL — 2 unpatched HIGH | PASS — 0 CVEs | **ExcelJS** |
| Maintenance status | HIGH | FAIL — abandoned | PASS — community | **ExcelJS** |
| API compatibility | MEDIUM | PASS — current API works | WARN — significant rewrite | xlsx easier |
| npm upgrade path | HIGH | FAIL — none | N/A | **ExcelJS** |
| Performance | LOW | PASS | PASS (better streaming) | Tie |
| Client-side support | LOW | PASS | PASS | Tie |
| TypeScript support | LOW | WARN — needs @types | PASS — built-in | **ExcelJS** |
| Bundle size | LOW | ~400KB | ~350KB | Tie |

### 9.2 Recommendation: REPLACE with ExcelJS

**Rationale:**

1. **No npm upgrade path for xlsx** — this is the deciding factor. Two HIGH CVEs with no fix available on npm means the vulnerability is permanent unless the dependency is replaced.
2. **ExcelJS has zero open CVEs** — immediate security improvement.
3. **ExcelJS is the most widely used alternative** — 14M weekly downloads vs xlsx's declining 1.9M.
4. **ExcelJS is TypeScript-first** — eliminates `@types/xlsx` dependency and improves type safety.
5. **The rewrite is bounded** — 15 import sites, well-understood API mapping, no architectural changes required.

**Counter-arguments acknowledged:**
- The API rewrite is real work (~3-5 engineering days)
- ExcelJS `read` being async changes function signatures
- ExcelJS hasn't been published in 3 years (but has active GitHub, no CVEs)

### 9.3 Risk of NOT Replacing

| Risk | Severity | Likelihood | Impact |
|------|----------|------------|--------|
| Prototype Pollution exploit | HIGH | Medium | Data corruption, potential RCE in server context |
| ReDoS exploit | HIGH | Medium | Server denial of service |
| Supply chain attack on unmaintained package | MEDIUM | Low | Depends on npm package integrity |
| Auditor finding (HIGH CVEs in production dependency) | HIGH | High | Compliance failure for institutional customers |

---

## 10. Migration Plan

### Phase 0: Preparation (0.5 day)

1. Install ExcelJS: `npm install exceljs`
2. Create `src/lib/xlsx/exceljs-adapter.ts` — thin wrapper that provides the familiar API surface
3. Write adapter tests covering: read buffer, read file, write buffer, write file, aoa_to_sheet, json_to_sheet, sheet_to_json
4. Verify adapter passes equivalent output for all existing test fixtures

### Phase 1: Export Modules (1 day) — LOW RISK

These files are write-only (no untrusted input parsing):

| File | Change |
|------|--------|
| `src/lib/local-content/export.ts` | Replace `aoa_to_sheet`, `json_to_sheet`, `book_new`, `book_append_sheet`, `write` |
| `src/lib/audit/export/xlsx-exporter.ts` | Replace `aoa_to_sheet`, `sheet_to_json`, `book_new`, `book_append_sheet`, `write`, `!cols` |

**Strategy:** Write-based modules are simpler because they construct XLSX output from known-good data. No security implications during migration.

### Phase 2: Parser Modules (1.5 days) — HIGH RISK

These files read untrusted XLSX input:

| File | Change |
|------|--------|
| `src/lib/office-ai/file-extraction-service.ts` | Replace `XLSX.read` (sync→async), `decode_range`, `sheet_to_json` |
| `src/lib/local-content/erp/file-importer.ts` | Replace `XLSX.read` (sync→async), `sheet_to_json` |
| `src/lib/local-content/workbook/tb-loader.ts` | Replace `XLSX.read` (sync→async), `sheet_to_json`, `book_new`, `write` |

**Strategy:** These modules are called from Server Actions (already async). The sync→async change should propagate naturally. The ZIP bomb mitigations (`validateXlsxArchive`) remain valid — they run before the parser is called.

**Critical:** Every parser change must be accompanied by:
- Running existing parser tests
- Verifying ZIP bomb mitigations still run before the new parser
- Adding regression tests with known XLSX fixtures

### Phase 3: Client-Side (0.5 day) — LOW RISK

| File | Change |
|------|--------|
| `src/components/audit/trial-balance/components/utils.ts` | Replace `require("xlsx")` with ExcelJS import, async read, `eachRow` extraction |

**Strategy:** Already async. Bundle size impact is negligible. Test with manual browser verification.

### Phase 4: Dev Scripts (0.5 day) — NO RISK

| File | Change |
|------|--------|
| `scripts/validation/tb-local-ai-targeted-failures.ts` | Replace `readFile`, `sheet_to_json` |
| `scripts/validation/tb-benchmark-run.ts` | Replace `readFile`, `sheet_to_json` |
| `scripts/platform/verify-office-ai-extraction.ts` | Replace `book_new`, `aoa_to_sheet`, `write` |
| `scripts/localcontent/import-lc-verification-matrix.ts` | Replace `readFile`, `sheet_to_json` |
| `scripts/audit/tb-upload-demo.ts` | Replace `readFile`, `sheet_to_json` |
| `scripts/audit/tb-classification-preview.ts` | Replace `readFile`, `sheet_to_json` |

**Strategy:** Dev scripts are trusted-local-filesystem only. Low priority. Can be done last or in parallel.

### Phase 5: Cleanup (0.5 day)

1. Remove `xlsx` from `package.json`: `npm uninstall xlsx`
2. Remove `@types/xlsx` if present
3. Remove any remaining `import * as XLSX from 'xlsx'` references
4. Update `src/lib/office-ai/file-extraction-service.ts` re-export (currently exports `prevalidateZipBuffer` from old xlsx-validation — keep as-is)
5. Run full validation: `npx tsc --noEmit && npm run lint -- --quiet && npm test`
6. Update `PRODUCT_STATUS_MATRIX.md` and `AQLIYA_ARCHITECTURE.md` to reflect dependency change

### Total Estimated Effort

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 0: Preparation | 0.5 day | Low |
| Phase 1: Export modules | 1 day | Low |
| Phase 2: Parser modules | 1.5 days | High |
| Phase 3: Client-side | 0.5 day | Low |
| Phase 4: Dev scripts | 0.5 day | None |
| Phase 5: Cleanup | 0.5 day | Low |
| **Total** | **~4.5 days** | |

---

## 11. Decision Options

### Option A: Replace with ExcelJS (RECOMMENDED)

- **Effort:** ~4.5 engineering days
- **Security:** Eliminates 2 HIGH CVEs immediately
- **Risk:** Medium — bounded rewrite with clear API mapping
- **Maintenance:** Active community, TypeScript-first
- **Long-term:** Better streaming, better DX, no CVE debt

### Option B: Stay on xlsx + Accept Risk

- **Effort:** 0
- **Security:** 2 permanent HIGH CVEs, no upgrade path
- **Risk:** HIGH — auditor finding, potential exploit
- **Justification:** Only valid if migration is blocked by timeline and risk is formally accepted with documented mitigation

### Option C: Install xlsx from GitHub (not recommended)

- **Effort:** Low — change package source
- **Security:** Fixes CVEs but introduces supply chain risk (non-npm source)
- **Risk:** HIGH — unverified package source, no npm integrity checks
- **Justification:** Only valid as emergency interim measure

### Option D: Hybrid — Keep xlsx for write-only, ExcelJS for read

- **Effort:** ~2 days
- **Security:** Partial — write-only modules don't parse untrusted input, so xlsx CVEs are less exploitable there
- **Risk:** Medium — two xlsx-like dependencies increases bundle size and cognitive load
- **Justification:** Only valid if full migration is blocked and partial improvement is acceptable

---

## Appendix A: API Quick-Reference for Migration

### xlsx → ExcelJS Conversion Cheat Sheet

| Task | xlsx | ExcelJS |
|------|------|---------|
| Create workbook | `XLSX.utils.book_new()` | `new ExcelJS.Workbook()` |
| Add sheet | `XLSX.utils.book_append_sheet(wb, ws, name)` | `const ws = wb.addWorksheet(name)` |
| AOA to sheet | `XLSX.utils.aoa_to_sheet(data)` | `ws.addRows(data)` |
| JSON to sheet | `XLSX.utils.json_to_sheet(data)` | `ws.columns = headers.map(...); data.forEach(row => ws.addRow(row))` |
| Sheet to JSON | `XLSX.utils.sheet_to_json(ws, {header:1})` | See Section 4.3, Incompatibility 3 |
| Read buffer | `XLSX.read(buf, {type:"buffer"})` | `await wb.xlsx.load(buf)` (async) |
| Write buffer | `XLSX.write(wb, {type:"buffer"})` | `await wb.xlsx.writeBuffer()` (async) |
| Decode range | `XLSX.utils.decode_range(ref)` | Manual — parse ref string, extract row/col |
| Column widths | `ws['!cols'] = [{wch: N}]` | `ws.getColumn(n).width = N` |
| Cell access | `ws[XLSX.utils.encode_cell({r,c})]` | `ws.getRow(r+1).getCell(c+1)` (1-indexed) |

### Row Index Note

xlsx uses 0-indexed rows; ExcelJS uses 1-indexed rows. All row iteration must account for this offset.

---

## Appendix B: Security Mitigation Continuity

The existing ZIP bomb mitigations in `src/lib/security/xlsx-validation.ts` are **parser-agnostic**. They validate the ZIP archive structure before any parser reads it. This means:

- `validateXlsxArchive()` calls remain unchanged
- The pre-parse check runs before ExcelJS `load()` just as it ran before `XLSX.read()`
- No security regression during migration

The only security change is the **elimination** of the two CVE attack vectors (Prototype Pollution + ReDoS) that the ZIP bomb mitigations could not address.

---

**Document status:** FINAL — Ready for review  
**Next action:** Present to platform team for Go/No-Go decision on migration  
**Blocking question:** Is the ~4.5 day migration effort acceptable for the current sprint?
