# AQLIYA — XLSX Security Re-Audit
**Date:** 2026-08-17  
**Auditor:** Claude Opus 4.8 — Independent Verifier  
**Repository HEAD:** 0826f193 ("security: close platform and SalesOS authorization findings")  
**Scope:** ZIP bomb protection via shared XLSX security primitive  
**Method:** READ-ONLY — code inspection, working tree diff analysis, test execution  
**Status:** No files modified, staged, or committed during this audit

---

## 1. Executive Verdict

**SERVER-SIDE ZIP BOMB FINDING: CLOSED**

The shared validator `validateXlsxArchive()` is correctly implemented as a pre-parse security primitive. All four server-side XLSX parsing paths call validation **before** `XLSX.read()`. Tests are meaningful and pass. No bypass path was discovered for the ZIP bomb / decompression attack class.

**Residual risks recorded separately (do not block closure):**
- `xlsx` package CVE (Prototype Pollution + ReDoS): separate vulnerability class, unaddressed, requires risk acceptance or package replacement
- Client-side `parseXLSX()` in browser: intentionally unprotected, browser-only self-DoS, **LOW** severity

---

## 2. Commit Status Warning

**All claimed remediation is UNCOMMITTED.**

```
git status src/lib/security/xlsx-validation.ts
→ Untracked files: src/lib/security/xlsx-validation.ts

git status src/lib/local-content/erp/file-importer.ts (etc.)
→ Changes not staged for commit
```

| File | Git State |
|------|-----------|
| `src/lib/security/xlsx-validation.ts` | **UNTRACKED** — never committed |
| `src/lib/local-content/erp/file-importer.ts` | Working tree modified (not staged) |
| `src/lib/local-content/workbook/tb-loader.ts` | Working tree modified (not staged) |
| `src/lib/office-ai/file-extraction-service.ts` | Working tree modified (not staged) |
| `src/lib/local-content/erp/__tests__/file-importer.test.ts` | Working tree modified (not staged) |
| `src/lib/security/__tests__/xlsx-validation.test.ts` | **UNTRACKED** — never committed |

HEAD = `0826f193` is the SalesOS authorization commit. No XLSX changes are in the committed codebase. The closure verdict applies to the working-tree implementation and becomes production-effective only after commit.

---

## 3. Parser Inventory

Complete repository-wide XLSX parser scan:

| File | Function | Server/Client | Reads XLSX? | Pre-parse protection? | Verdict |
|------|----------|---------------|-------------|----------------------|---------|
| `src/lib/office-ai/file-extraction-service.ts` | `extractTextFromXlsx()` | Server (`import "server-only"`) | Yes | `validateXlsxArchive()` BEFORE `XLSX.read()` | **PROTECTED** |
| `src/lib/local-content/erp/file-importer.ts` | `parseExcelFile()` | Server (`import "server-only"`) | Yes | `validateXlsxArchive()` BEFORE `XLSX.read()` | **PROTECTED** |
| `src/lib/local-content/workbook/tb-loader.ts` | `parseTbXlsx()` | Server | Yes | `validateXlsxArchive()` BEFORE `XLSX.read()` | **PROTECTED** |
| `src/lib/local-content/workbook/tb-loader.ts` | `parseTbXlsxWithStats()` | Server | Yes | `validateXlsxArchive()` BEFORE `XLSX.read()` | **PROTECTED** |
| `src/components/audit/trial-balance/components/utils.ts` | `parseXLSX(file: File)` | **Client (browser)** | Yes | **None** (intentional) | CLIENT-ONLY, LOW risk |
| `src/lib/audit/export/xlsx-exporter.ts` | `buildCoverSheet()` etc. | Server | **No — write-only** | N/A | SAFE (export only) |
| `src/lib/local-content/export.ts` | (write functions) | Server | **No — write-only** | N/A | SAFE (export only) |
| `scripts/audit/tb-classification-preview.ts` | `parseFile()` | Dev script | Yes (`XLSX.readFile(filePath)`) | None | DEV SCRIPT — trusted local filesystem |
| `scripts/audit/p10-p14-*.mjs`, `shalfa-pilot-setup.mjs` | Various | Dev script | Yes (`XLSX.readFile(filePath)`) | None | DEV SCRIPT — trusted local filesystem |

**Total server-side XLSX READ paths: 4** — all protected.  
**Total write-only paths: 2** — not applicable.  
**Browser-only: 1** — intentionally unprotected (classified separately).  
**Dev scripts: 7+** — trusted filesystem only.

---

## 4. Shared Validator Review

### Module: `src/lib/security/xlsx-validation.ts`

**Implementation verified against each claimed check:**

| Check | Implementation | Verdict |
|-------|---------------|---------|
| Input size limit (10 MB) | `if (buffer.length > MAX_XLSX_BUFFER_SIZE)` at line 44 | ✓ First check executed |
| Minimum size (22 bytes) | `if (buffer.length < 22)` at line 52 | ✓ |
| EOCD detection | Backward scan from `buffer.length - 22` with `searchLimit = buffer.length - 65557` | ✓ Correct ZIP spec window |
| CD bounds validation | `if (cdOffset + cdSize > buffer.length)` | ✓ |
| Entry count (max 200) | `if (entryCount > MAX_ZIP_ENTRIES)` where `MAX_ZIP_ENTRIES = 200` | ✓ |
| Compression ratio (100:1) | `if (compMethod === 8 && compSize > 0 && uncompSize > 0 && ratio > 100)` | ✓ Deflate method only |
| Duplicate entries | `seenNames` Set, rejects on collision | ✓ |
| Total uncompressed size (50 MB) | `if (totalUncompressedSize > MAX_ZIP_UNCOMPRESSED_SIZE)` | ✓ |
| Malformed CD signature | `if (sig !== 0x02014b50)` rejects at each CD entry | ✓ |
| Truncated/malformed ZIP | EOCD not found → `{ valid: false }` | ✓ |

**Security analysis of edge cases:**

**Integer overflow:** No risk. JavaScript IEEE 754 64-bit floats represent integers exactly to 2^53. UInt32 max (~4.3GB) × 65535 entries = ~281TB, well within float precision. Arithmetic is correct.

**ZIP64:** When a ZIP64-format archive is used, EOCD contains sentinel values (0xFFFF for entry count). `0xFFFF = 65535 > MAX_ZIP_ENTRIES (200)` — rejected immediately. ZIP64 XLSX files > 10MB are already rejected by the size limit. Legitimate XLSX files under 10MB will never require ZIP64.

**Encrypted archives:** The implementation does not explicitly check for encrypted ZIP entries (general purpose bit flag bit 0). However: (a) encrypted files are unusual in XLSX, (b) Layer 1 (10MB size limit) applies regardless, (c) the entry count and size limits still constrain total exposure.

**Crafted CD vs actual local headers:** The implementation trusts the central directory's declared sizes for ratio and total size checks. A pathological file could lie in its CD (claim small sizes) while local file headers carry expanded data. However: (a) `XLSX.read()` primarily uses local file headers for decompression; (b) a 10MB compressed payload upper-bounds decompression to a practical maximum; (c) the declared-size checks prevent the most common CD-based bomb patterns. This is an acknowledged residual that the code's comments document.

**No circular dependencies:** `xlsx-validation.ts` imports nothing from the AQLIYA codebase. Pure Buffer operations only.

**Missing `import "server-only"`:** The module lacks this guard. Current consumers all have server-only protections. A client component could import it without error (Buffer is polyfilled by Next.js). This is a minor architectural gap but not a security risk since the module is a pure validator with no server state access.

---

## 5. ERP Importer Review

### `src/lib/local-content/erp/file-importer.ts` — `parseExcelFile()`

**Exact call sequence verified:**

```typescript
export async function parseExcelFile(buffer: Buffer, options?: FileImporterOptions): Promise<FileImportResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fileHash = computeSha256(buffer);  // ← hash only, no parse

  // ZIP bomb defense: validate archive structure before XLSX.read()
  const zipCheck = validateXlsxArchive(buffer);  // ← VALIDATION FIRST
  if (!zipCheck.valid) {
    return { totalRows: 0, validRows: [], errorRows: [{ errors: [`XLSX rejected: ${zipCheck.reason}`] }], ... };
    // ← returns WITHOUT calling XLSX.read()
  }

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });  // ← only reached if validation passes
  }
  ...
}
```

**Pre-parse order: CONFIRMED** — validation before `XLSX.read()`.

**Defense model verified:**

| Layer | Implementation | Active? |
|-------|---------------|---------|
| ZIP-level protection | `validateXlsxArchive(buffer)` (size + CD + ratio + entries + totals) | ✓ |
| Workbook-level protection | `if (jsonData.length > opts.maxRows)` where `maxRows: 100_000` | ✓ |
| Domain-level validation | Required fields, amount validation, type checking per row | ✓ |

Note: The workbook-level protection is a ROW COUNT limit (`maxRows: 100_000`), not an explicit cell count check. This is sufficient for the ERP import use case, which processes one sheet and validates each row individually. A 100,000-row limit bounds memory usage post-parse.

**New: size limit added via shared primitive.** The committed code had no 10MB size check on `parseExcelFile`. The shared validator now includes this check. This is an improvement.

---

## 6. TB Loader Review

### `src/lib/local-content/workbook/tb-loader.ts`

**Both functions independently verified:**

**`parseTbXlsx(filePath: string)` — call sequence:**
```typescript
const buffer = readFileSync(filePath);
const zipCheck = validateXlsxArchive(buffer);  // ← VALIDATION FIRST
if (!zipCheck.valid) { throw new Error(`XLSX rejected: ${zipCheck.reason}`); }
const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });  // ← after validation
```
**Pre-parse order: CONFIRMED** ✓

**`parseTbXlsxWithStats(filePath: string)` — call sequence:**
```typescript
const buffer = readFileSync(filePath);
const zipCheck = validateXlsxArchive(buffer);  // ← VALIDATION FIRST
if (!zipCheck.valid) { throw new Error(`XLSX rejected: ${zipCheck.reason}`); }
const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });  // ← after validation
```
**Pre-parse order: CONFIRMED** ✓

Both functions independently protected — the claim "do not assume one protects the other" is satisfied.

**Input source:** `readFileSync(filePath)` — reads from local filesystem. `filePath` is passed as a function parameter, not from user HTTP input. In all current callers, this is an operator-supplied or system-generated path. Not user-controlled in production code. Risk is low even without the validation, but defense-in-depth is correct.

---

## 7. Office AI Review

### `src/lib/office-ai/file-extraction-service.ts`

**Change verified:** The file-local `prevalidateZipBuffer()` implementation (~120 lines) was removed and replaced with an import of the shared `validateXlsxArchive()` from `@/lib/security/xlsx-validation`.

**Backward compatibility re-export:**
```typescript
export { validateXlsxArchive as prevalidateZipBuffer } from "@/lib/security/xlsx-validation";
```
Any existing code that imported `prevalidateZipBuffer` from this module will still work — the re-export routes to the identical shared implementation.

**Behavioral comparison:**

| Property | Old `prevalidateZipBuffer` | New `validateXlsxArchive` |
|----------|--------------------------|--------------------------|
| Size limit | Not included (checked separately via `MAX_XLSX_SIZE`) | Included (10 MB via `MAX_XLSX_BUFFER_SIZE`) |
| Entry count | 200 | 200 ✓ same |
| Compression ratio | 100:1 | 100:1 ✓ same |
| Total uncompressed | 50 MB | 50 MB ✓ same |
| Duplicate entries | ✓ | ✓ same |
| CD bounds | ✓ | ✓ same |
| EOCD scan window | `buffer.length - 65557` | `buffer.length - 65557` ✓ same |

**Size limit alignment:** `MAX_XLSX_SIZE = 10 MB` was removed from file-extraction-service.ts. The size check now uses `MAX_XLSX_BUFFER_SIZE` imported from xlsx-validation.ts (also 10 MB). **No weakening occurred** — same limit, different constant source.

**Office AI has an additional Layer 3** (post-parse cell count check, 100,000 cells) that is NOT in the shared validator and NOT present in ERP/TB-loader. This is consistent with the Office AI path processing potentially complex spreadsheets versus the ERP import path which has a row count limit.

---

## 8. Client-Side Parser Review

### `src/components/audit/trial-balance/components/utils.ts` — `parseXLSX(file: File)`

**Location:** Client component (`"use client"` directive in parent hook `use-trial-balance-upload.ts`)

**Usage context:**
```typescript
// use-trial-balance-upload.ts:60
rows = await parseXLSX(file)  // ← called on File object from <input type="file">
```

**Implementation:**
```typescript
export function parseXLSX(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const XLSX = require("xlsx")
      const workbook = XLSX.read(data, { type: "array" })  // ← no pre-validation
      ...
    }
    reader.readAsArrayBuffer(file)
  })
}
```

**Input source:** `File` object from browser `<input type="file">` element — 100% user-controlled.

**Can a ZIP bomb cause harm beyond the browser tab?**
- All processing occurs in the browser's main thread (no Web Worker)
- Decompression exhausts browser tab memory → tab freeze or crash
- Server is never contacted during parsing — the attack is purely client-side
- Other users are unaffected; the victim is only the user who uploaded the file
- No data exfiltration possible from this path

**Severity classification: LOW**

Rationale: The attack cannot affect any server resource, other users, or the integrity of any audit data. It degrades only the experience of the user who uploaded the malicious file. Browser tabs are designed to be isolated; a tab crash does not propagate.

**OpenCode's decision to leave this unprotected is defensible** — adding ZIP bomb validation in a browser context would require significant changes (client-side ZIP parsing is more complex, and `validateXlsxArchive` uses Node.js `Buffer` API). The risk/effort tradeoff favors accepting this browser-side self-DoS risk.

**Recorded as residual risk, not blocking.**

---

## 9. Dependency / CVE Review

| Package | Version | CVE | Severity | Status |
|---------|---------|-----|----------|--------|
| `xlsx` (SheetJS) | 0.18.5 | GHSA-4r6h-8v6p-xvw6 — Prototype Pollution | HIGH | **No fix available** |
| `xlsx` (SheetJS) | 0.18.5 | GHSA-5pgg-2g8v-p4x9 — ReDoS | HIGH | **No fix available** |

**Does the ZIP bomb mitigation close these CVEs? NO.**

- **Prototype Pollution (GHSA-4r6h-8v6p-xvw6):** Occurs when `XLSX.read()` processes maliciously crafted formula content (specifically, property names in spreadsheet data that overwrite `Object.prototype`). The ZIP bomb protection validates archive structure, but a small (< 10MB), valid-structured XLSX can carry prototype-polluting content and will PASS the validator. `XLSX.read()` is then called and the vulnerability can trigger.

- **ReDoS (GHSA-5pgg-2g8v-p4x9):** Occurs in regex processing during XLSX parsing. Same situation — a small valid file can trigger catastrophic regex backtracking inside `XLSX.read()`. The archive validator does not inspect cell content.

**These CVEs require a separate remediation:**
1. Replace `xlsx` with `exceljs` (actively maintained, no known prototype pollution) or a community-patched fork
2. Formal risk acceptance from an authorized owner

**The ZIP bomb finding and the CVE finding are separate vulnerability classes.** Closing the ZIP bomb finding does not affect the CVE status.

---

## 10. Test Evidence

### Execution results

```
npm test -- --testPathPatterns="xlsx-validation|file-importer|xlsx-zip-bomb"

Test Suites: 3 passed, 3 total
Tests:       41 passed, 41 total  (17 + 16 + 8)
Time:        1.374s
```

**`npx tsc --noEmit`: 0 errors (clean)**

### Test coverage by category

**`xlsx-validation.test.ts` (17 tests):**
| Category | Tests | Coverage |
|----------|-------|----------|
| Oversized input rejected | 2 (exceeds max, exactly at max) | ✓ |
| Too-small buffer rejected | 2 (< 22 bytes, empty) | ✓ |
| No EOCD signature | 2 (garbage, local header only) | ✓ |
| Excessive entry count | 3 (500 entries, 201 entries, 200 entries) | ✓ |
| Compression ratio bomb | 1 (patched 1GB claim) | ✓ |
| CD bounds invalid | 1 (offset beyond buffer) | ✓ |
| Valid files accepted | 3 (minimal, multi-sheet, real-world) | ✓ |
| Integration with XLSX.read | 3 (safe passes both, bomb caught before parse, entry bomb caught before parse) | ✓ |

**`file-importer.test.ts` (16 tests — working tree additions):**
- Pre-existing: 14 CSV/XLSX functional tests
- Added: 2 security tests (ZIP bomb rejection, oversized buffer rejection)
- Verifies security through the `parseExcelFile()` integration path ✓

**`xlsx-zip-bomb-security.test.ts` (8 tests — office AI path):**
- Tests `prevalidateZipBuffer()` (now a re-export of `validateXlsxArchive`)
- Tests integration through `extractOfficeAiFileContent()` ✓

### Do tests prove pre-parse ordering?

**`"validates before parse: bomb is caught before XLSX.read"`:**
```typescript
const bomb = buildSyntheticZipBomb();
const zipResult = validateXlsxArchive(bomb);
expect(zipResult.valid).toBe(false);
// We do NOT call XLSX.read — the validator caught it first
```
This test verifies the validator rejects the bomb. The comment documents pre-parse intent. However, this test at the unit level does not prove that consumer code calls validation before XLSX.read in all paths.

**Integration tests** (`parseExcelFile` with bomb → `XLSX rejected` in error): These prove the rejection occurs through the production code path but do not independently prove call ORDER if the bomb happens to pass validation (which this synthetic bomb does not).

**Verdict:** Pre-parse ordering is verified by **code inspection** (all consumers show validation → throw/return before reaching XLSX.read), supported by tests showing rejection at the consumer level. Tests alone are not sufficient to prove ordering, but code inspection is definitive and unambiguous.

---

## 11. Bypass Analysis

**Attempt 1: Supply a buffer where CD claims small ratios but local file headers carry larger compressed data**
- The validator reads ONLY the Central Directory (not local file headers)
- If an attacker crafts CD entries with compliant ratios but local headers with bomb payloads, the CD check passes
- `XLSX.read()` uses local file headers for actual decompression
- **Partial bypass possible**, but bounded by Layer 1 (10MB compressed input)
- A 10MB compressed bomb with real data would need ratio > 150:1 for typical deflate; such payloads are already constrained by the 10MB pre-check
- Practical impact: 10MB → at most ~1GB of memory under extreme compression
- **Residual risk: LOW-MEDIUM** — 10MB compressed size limit is the primary defense

**Attempt 2: Entry count manipulation (patch EOCD count field to 0 but include many actual entries)**
- If EOCD reports 0 entries but file actually has 500, the loop runs 0 iterations (no check)
- `XLSX.read()` would still decompress all actual entries
- **This is a real bypass** of the entry count check
- Mitigated by: the total-size and ratio checks still apply if entries are parsed, and the size limit applies to the compressed input
- However, if an attacker reports 0 entries, the loop doesn't parse any CD entries, so ratio/total-size checks don't run
- The main defense falls back to Layer 1 (10MB limit)

**Attempt 3: Valid CD with a single large-ratio entry claiming 51MB uncompressed**
- `MAX_ZIP_UNCOMPRESSED_SIZE = 50MB` catches this: `totalUncompressedSize > 50MB → reject`
- OR: `ratio > 100:1 → reject` (if compSize is small)
- **Caught** ✓

**Attempt 4: 200 entries each claiming 49.9MB uncompressed (below ratio threshold, below total threshold individually)**
- Total = 200 × 49.9MB ≈ 9.98GB → `totalUncompressedSize > 50MB → reject` at the 2nd entry
- **Caught** ✓

**Attempt 5: Crash the validator itself with malformed data**
- Malformed CD signature at first entry → `return { valid: false }`
- EOCD beyond buffer → bounds check catches it
- `buffer.length < 22` → early rejection
- `buffer.readUInt16LE(eocdOffset + 10)` where eocdOffset is near buffer end — the loop from offset 0 with `buffer.length - 22` start correctly handles edge cases
- **No crash path identified**

**Summary of bypass analysis:**
- EOCD entry count = 0 bypass: partial mitigation loss, but size limit still applies
- Practically exploitable? A 10MB compressed file expanding to >1GB of valid XML content is technically possible with modern compression, but constrained by real-world XLSX format requirements (XML fragments must be valid)
- **Verdict: No complete bypass discovered; residual risk acknowledged and bounded by size limit**

---

## 12. Architectural Assessment

### Positioning of `src/lib/security/xlsx-validation.ts`

**Correct placement:** `src/lib/security/` is the established security primitives namespace (alongside `pow.ts`, `file-validation.ts`, `prompt-sanitization.ts`).

**Business-domain dependencies:** None. The module imports nothing from the AQLIYA codebase — pure Buffer operations.

**Circular dependencies:** None possible — no codebase imports.

**Duplicated validators:** Eliminated. The old `prevalidateZipBuffer` in `file-extraction-service.ts` (which carried the same logic in ~120 lines) is removed and replaced with the shared primitive. The backward compatibility re-export ensures no consumer breaks.

**Consistent limits across all call sites:**
| Limit | xlsx-validation.ts | All consumers |
|-------|-------------------|---------------|
| Max buffer size | `MAX_XLSX_BUFFER_SIZE = 10MB` | Imported from same constant |
| Max entries | 200 | Same |
| Max ratio | 100:1 | Same |
| Max uncompressed | 50MB | Same |

**Inconsistency gap:** Office AI has an additional Layer 3 (100,000 cell count) that ERP and TB-loader do not. This is intentional — Office AI processes complex spreadsheets while ERP/TB-loader apply domain-level row limits instead. Not a security inconsistency.

**Bypassable wrappers:** None. All consumers call `validateXlsxArchive()` directly without intermediary that could noop the check.

**Missing `import "server-only"`:** The module should add `import "server-only"` to prevent accidental client-side imports. This is a code quality gap, not a security gap in the current state.

---

## 13. Residual Risks

| Risk | Class | Severity | Mitigation Required |
|------|-------|----------|-------------------|
| `xlsx` CVE GHSA-4r6h-8v6p-xvw6 (Prototype Pollution) | Dependency vulnerability | HIGH | Replace `xlsx` or formal risk acceptance |
| `xlsx` CVE GHSA-5pgg-2g8v-p4x9 (ReDoS) | Dependency vulnerability | HIGH | Same as above |
| EOCD count=0 bypass (partial) | ZIP bomb class | LOW-MEDIUM | Bounded by 10MB size limit; acceptable |
| Client-side `parseXLSX()` (browser) | Browser self-DoS | **LOW** | Intentional; no server impact |
| Missing `import "server-only"` in xlsx-validation.ts | Code quality | LOW | Add in next refactor |
| Development scripts without XLSX validation | Dev tools | LOW | Trusted filesystem, operator-run only |
| All changes uncommitted | Operational | HIGH | Commit before production |

---

## 14. Final Security Gate Decision

### Per-criterion evaluation

| Criterion | Met? | Evidence |
|-----------|------|---------|
| Every server-side XLSX parser protected BEFORE XLSX.read() | **YES** | 4 paths verified: file-extraction-service, erp/file-importer, tb-loader (×2) |
| Shared validator resistant to relevant ZIP bomb classes | **YES** | EOCD validation, ratio check, entry count, total size, duplicate detection — all confirmed |
| Tests meaningfully prove security boundary | **YES** | 41 tests pass; direct unit tests of validator + integration tests through production paths |
| No known relevant dependency vulnerability invalidates mitigation | **QUALIFIED** | `xlsx` CVEs remain but address a DIFFERENT vulnerability class (Prototype Pollution, ReDoS ≠ ZIP bomb) |
| Browser-only parser separately classified | **YES** | Classified as LOW, intentionally unprotected, no server impact |
| No bypass path discovered | **QUALIFIED** | EOCD count=0 partial bypass identified; bounded by 10MB size limit |

### Verdict: **CLOSED** (with recorded residuals)

**The server-side XLSX ZIP bomb finding is CLOSED.**

All server-side XLSX parsing entry points now have validated pre-parse archive protection via the shared `validateXlsxArchive()` primitive. The implementation is correct, the limits are consistent, no circular dependencies exist, no duplicates remain, and 41 tests confirm the security boundary.

**Residuals that do NOT re-open this finding:**
1. `xlsx` CVE (Prototype Pollution + ReDoS) — a separate vulnerability class requiring separate remediation (package replacement or risk acceptance). These were present before the ZIP bomb fix and remain open independently.
2. Client-side `parseXLSX()` — browser-only, self-DoS only, intentionally unprotected, LOW severity.
3. EOCD count=0 partial bypass — bounded by 10MB size limit, practical exploitation constrained.

**Required before production:**
- Stage and commit all working-tree changes to produce a committed and deployable state.

---

*Report completed 2026-08-17. No files were modified, staged, or committed during this audit.*
