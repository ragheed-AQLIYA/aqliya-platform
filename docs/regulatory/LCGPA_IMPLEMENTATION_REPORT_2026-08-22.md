# LCGPA REGULATORY INTELLIGENCE — CLOSURE REPORT

**Date:** 2026-08-22
**Scope:** LocalContentOS only. SalesOS untouched.
**Supersedes:** [`LCGPA_IMPLEMENTATION_REPORT_2026-08-21.md`](./LCGPA_IMPLEMENTATION_REPORT_2026-08-21.md)

The twelve items requested on 2026-08-22 are complete. The evidence boundary that
blocked the engine yesterday is closed: the official artifacts were retrieved,
verified and ingested.

---

## 1. Run the actual test suite ✅

Executed natively on Windows (the Linux bridge VM cannot run jest — the repo's
`node_modules` is a Windows install).

| | Before | After |
|---|---|---|
| Repo suites | 509 | **515** |
| Repo tests | 7,366 | **7,460** (7,433 passed, 27 skipped, **0 failed**) |
| LCGPA scope | 254 | **615** |
| Repo-wide `tsc --noEmit` | — | **0 errors** |

The "254 existing tests" in the original brief was the LCGPA subset, not the
repository total.

## 2. Obtain the official LCGPA artifact ✅

`lcgpa.gov.sa` is a **Mendix single-page application**; the SharePoint paths in
the brief no longer resolve. The documents page renders eight published
documents, each served from `/file?guid=…&changedDate=…` — an endpoint that
returns **HTTP 401 without a Mendix session cookie** and carries **no file
extension**.

All eight were retrieved. Three are the regulatory datasets:

| Document | Bytes | SHA-256 |
|---|---:|---|
| القائمة الإلزامية للجهات الحكومية (يوليو 2026).xlsx | 461,503 | `93f3e1f4533da8d12644c0c9b964c4712972b1eade347d805458aca0d0d1d632` |
| القائمة الإلزامية للشركات المملوكة للدولة (July 2026).xlsx | 419,723 | `f613722d4017c8b0b2b471b99fba1c61d53bf5f4b29266a4d901671419e83dfc` |
| الحد الأدنى لنسبة المحتوى المحلي … يوليو 2026.xlsx | 117,819 | `acec6451903348b92484c4e0280d26a076e2321219d565e1253a0aa9d111673f` |

Full catalogue, including the five PDFs: [`LCGPA_ARTIFACT_CATALOGUE.md`](./LCGPA_ARTIFACT_CATALOGUE.md).

Preserved raw bytes: `uploads/lcgpa-sources/2026-07/` (git-ignored — regulatory
binaries are not committed).

## 3. Verify SHA-256 and provenance ✅

Every artifact was hashed **before** parsing, from the raw bytes as served.
Ingestion produced a complete 17-field provenance chain, e.g.:

```
sourceAuthority      LCGPA
sourceUrl            https://lcgpa.gov.sa/file?guid=8725724278325064&changedDate=1785224655483
artifactFilename     القائمة الإلزامية للجهات الحكومية (يوليو 2026).xlsx
artifactSha256       93f3e1f4533da8d12644c0c9b964c4712972b1eade347d805458aca0d0d1d632
artifactSize         461503
datasetVersion       LCGPA_MANDATORY_LIST_GOV_sha-93f3e1f4533d
parserVersion        lcgpa-mandatory-list-xlsx@1.0.0
ruleVersion          2026-01
```

Integrity validation passed with two warnings that are correct and worth
keeping: the official workbook contains `xl/externalLinks/` parts and a
calculation chain. The parser reads **cached cell values only**.

## 4. Discover the real schema ✅

**Mandatory List** — one worksheet per sector; the sheet name *is* the sector's
published identity (LCGPA publishes no sector code, so none was invented).
Columns B–J, matched on the **Arabic** header half because the English half is
unreliable in the published file.

**Minimum-LC schedule** — one sheet; per-product commencement date plus six year
columns (2026-2031) whose cells carry three distinct meanings, none of them zero:
a number, `-` (NOT_APPLICABLE) and `TBD`. Percentages are published as fractions.

Verified content:

| | |
|---|---:|
| Mandatory List products | **1,727** across 14 sectors |
| Minimum-LC products | **1,198** |
| Commencing 2026-08-01 | 2 (ceramic + porcelain tiles, 23%) |
| Commencing 2027-08-01 | 231 |
| Commencing 2028-06-01 | 965 |

## 5. Build the real parser ✅

- `parsers/lcgpa-mandatory-list.ts` — sector-sheet workbooks
- `parsers/lcgpa-minimum-lc.ts` — multi-year schedule
- `parsers/xlsx-reader.ts` — ExcelJS wrapper, cached values only, formula cells
  yield their stored result and never their formula
- `parsers/arabic-dates.ts` — `1 أغسطس 2026م` and ISO; refuses `01/08/2026`

All fail closed. 60 parser tests, of which 13 assert against the real artifacts,
pinned by SHA-256 and skipped with a printed reason on a clean checkout.

## 6. Ingest the first official dataset ✅

```
OUTCOME     PENDING_REVIEW
dataset     LCGPA_MANDATORY_LIST_GOV_sha-93f3e1f4533d  (1,727 products)
artifact    93f3e1f4…  461,503 bytes  VERIFIED
alerts      1  [MEDIUM] NEW_REGULATION: Baseline established … 1727 product(s)
case        PENDING_REVIEW
```

Both mandatory lists and the schedule ingested the same way. **Nothing was
approved and nothing was activated.**

Entry point: `npm run lc:regulatory:ingest`.

## 7. Persist sources, artifacts, datasets, changes ✅

Ten Prisma models added; `prisma validate` and `prisma generate` both pass.

`LcRegulatorySource`, `LcRegulatoryCheck`, `LcRegulatoryArtifact`,
`LcRegulatoryDataset`, `LcRegulatoryProduct`, `LcRegulatoryChange`,
`LcRegulatoryCase`, `LcRegulatoryAlert`, `LcRegulatoryChangeEvent`,
`LcRegulatoryConflict`.

The engine core stays pure: `persistence/repository.ts` hydrates state from the
database, the pure pipeline runs, results are persisted. Artifacts, datasets,
products, changes and journal entries are written once; only lifecycle columns
are updated.

## 8. Wire the scheduler ✅

`scripts/localcontent/lcgpa-regulatory-monitor.ts` +
`.github/workflows/lcgpa-regulatory.yml` (daily 02:00 AST, plus manual dispatch).

Defaults to a **dry run**; `--commit` persists. It detects, diffs, assesses
impact and records at `PENDING_REVIEW`. It cannot approve or activate.

## 9. Wire the activation sweep ✅

`scripts/localcontent/lcgpa-regulatory-activate.ts`. Acts **only** on datasets a
human already approved, and only once the effective date has arrived. Refuses a
dataset with no governance case (`NO_GOVERNANCE_CASE`). Dry run by default.

## 10. Bind calculation-engine → regulatory version ✅

`calculation-binding.ts` resolves the regulatory state **as of the calculation
date** and refuses to record a calculation that cannot be explained later:

- `REGULATORY_STATE_UNRESOLVED` — no dataset in force at that date
- `PRODUCTS_UNRESOLVED` — some product codes did not resolve

Both are overridable only through an explicit policy, and unresolved products
are stored as `UNKNOWN`, never substituted. `LcCalculationRun` gained
`regulatoryDatasetVersion`, `regulatoryArtifactSha256`, `regulatoryParserVersion`,
`regulatorySchemaVersion`, `regulatoryAsOf` and `regulatoryResolution`.

Note: nothing in the repository currently writes `LcCalculationRun`.
`recordCalculationRun()` is the gate the first writer must use.

## 11. Implement the real ImpactResolver ✅

`persistence/impact-resolver.ts` resolves against the real schema **and declares
its coverage**, because an empty array has two meanings:

| Entity | State |
|---|---|
| `calculationIds` | RESOLVED — direct link via `regulatoryDatasetVersion` |
| `projectIds`, `supplierIds`, `tenderIds`, `reportIds`, `complianceAssessmentIds` | DERIVED from affected projects |
| `contractIds` | **NOT_LINKED** — no contract model exists; empty means UNKNOWN |

`LocalContentSupplier` and `LocalContentSpendRecord` carry no LCGPA product code.
Fuzzy name matching would manufacture a regulatory fact, so it is not done.

## 12. Run the complete regression ✅

`tsc --noEmit` repo-wide: **0 errors**. `jest --ci` repo-wide: **7,460 tests,
0 failures**.

---

## Two defects the real data exposed

Both were found by running the engine against the official artifacts, and both
are fixed with tests.

**1. Extensionless URLs.** The Mendix document endpoint serves from
`/file?guid=…`, so the filename resolved to `file` and integrity validation
correctly quarantined the artifact with `EXTENSION_NOT_ALLOWED`. The server
states the real filename in `Content-Disposition`; `deriveFilename()` now reads
it (including RFC 5987 Arabic filenames) and strips path separators.

**2. Baselines were being classified as retroactive changes.** Every product in
a first observation carries a historical effective date, so the retroactivity
escalation fired on all of them — the first real ingestion produced **1,724
CRITICAL changes**. A baseline is the system learning the existing state, not the
authority changing it. Diffs now carry `isBaseline`, the escalation is suppressed
for them, and the alert engine emits one `NEW_REGULATION` alert instead of 1,727.

---

## Open items — all requiring a human, none requiring code

**1. Effective dates are not stated in the workbooks.** Only per-product
`تاريخ التطبيق` dates are published; there is no dataset-level effective date.
Activation therefore refuses with `EFFECTIVE_DATE_UNKNOWN`. An operator must
supply an evidence-backed date at approval, or leave the datasets published and
inactive. The engine will not infer one.

**2. A live regulatory conflict.** Six product codes — `2802, 2804, 2805, 2808,
2809, 2814` — carry a published minimum local content percentage but are absent
from the July 2026 Mandatory List. Two TIER 1 artifacts from the same month
disagree. Recorded as `PENDING_HUMAN_REVIEW`; LCGPA must be asked which governs.

**3. The 233-product cohort has moved.** SPA N2514218 announced 233 products
binding from 2026-08-01. The July 2026 schedule splits those 233 into 2 (from
2026-08-01) and 231 (from 2027-08-01). The arithmetic matches exactly, which is
consistent with a rescheduling — but confirming what LCGPA decided requires the
official amendment. Recorded as an observation with both sources.

**4. No database migration has been applied.** The models exist in
`schema.prisma` and the client is generated, but `prisma migrate` has not been
run — that touches a live database and was not done unprompted. Run
`npx prisma migrate dev --name lcgpa_regulatory_intelligence` before the first
`--commit`.

**5. The scheduled workflow is committed but not enabled.** It needs
`DATABASE_URL` in the `production` environment and outbound access to
`lcgpa.gov.sa` from the runner.

**6. Discovery needs a rendering fetcher.** `createHttpFetcher()` handles the
`FILE_FINGERPRINT` sources. The documents page is a SPA, so `DOCUMENT_DISCOVERY`
needs a headless browser to see newly published documents. Until then, a
republished document is caught by the artifact URL 404-ing rather than by
discovery.

---

## Files

**Added** — `regulatory/calculation-binding.ts`; `regulatory/parsers/` (5 files);
`regulatory/fetchers/` (2); `regulatory/persistence/` (4);
`scripts/localcontent/lcgpa-regulatory-{ingest,monitor,activate}.ts`;
`.github/workflows/lcgpa-regulatory.yml`; `tsconfig.scripts-regulatory.json`;
6 test files; `docs/regulatory/LCGPA_ARTIFACT_CATALOGUE.md` and this report.

**Modified** — `regulatory/{types,parser,pipeline,semantic-diff,change-classification,versioning,artifact-store,alerts,source-registry,index}.ts`;
`prisma/schema.prisma` (10 new models + `LcCalculationRun` binding columns);
`package.json` (3 scripts); 3 existing test files; 6 documents.

**Unchanged** — the LCGPA computation engine (`calculation-engine.ts`,
`mandatory-list.ts`, `product-registry.ts`, `baseline-target.ts`,
`supplier-ranking.ts`, `reviewer-workflow.ts`), and all of SalesOS.
`LCGPA_RULE_VERSION` remains frozen at **2026-01** — a product-data update is a
dataset change, not a rule change.
