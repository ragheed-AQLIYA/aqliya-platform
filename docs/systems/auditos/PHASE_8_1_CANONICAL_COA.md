# Phase 8.1 — Canonical COA Expansion

**Status:** Implemented (2026-06-13)  
**Engagement pilot:** `eng-gulf-2025`  
**Related analysis:** [`docs/audits/TB_CLOSING_ADJUSTMENT_ANALYSIS.md`](../../audits/TB_CLOSING_ADJUSTMENT_ANALYSIS.md)

## Objective

Expand the AuditOS canonical chart of accounts from **23 → 33** lines so Saudi ERP Mapping 1 labels (IFRS 16 ROU, lease liabilities, actuarial/OCI reserves, zakat provision, long-term debt, contract assets, deferred tax) map to **dedicated FS presentation buckets** instead of nearest expense/RE/utility buckets.

## New Canonical Accounts

| Code | Name | FS Category |
| ---- | ---- | ----------- |
| CA-1070 | Right-of-Use Assets | Non-Current Assets |
| CA-1071 | ROU Accumulated Depreciation | Non-Current Assets |
| CA-1080 | Contract Assets | Current Assets |
| CA-2035 | Zakat Provision | Current Liabilities |
| CA-2110 | Lease Liabilities - Current | Current Liabilities |
| CA-2120 | Lease Liabilities - Non-Current | Non-Current Liabilities |
| CA-2130 | Long-Term Debt | Non-Current Liabilities |
| CA-2140 | Deferred Tax | Non-Current Liabilities |
| CA-3030 | Actuarial Reserve | Equity |
| CA-3040 | OCI Reserve | Equity |

## Source of Truth

- **Module:** `src/lib/audit/coa/canonical-coa.ts` — seed + mock fallback
- **Synonyms:** `src/lib/tb-intelligence/synonyms.ts` — Phase 8.1 rules ordered **before** broad buckets
- **Seed:** `prisma/seed-audit.ts` imports `CANONICAL_COA_ACCOUNTS`

## Operational Apply (existing DB)

```bash
node scripts/coa-phase-81-upsert.mjs
node scripts/coa-phase-81-upsert.mjs --remap eng-gulf-2025
```

Then rebuild FS v2 and re-run reconciliation on the engagement.

## Expected Pilot Impact

From TB closing adjustment analysis:

- **~12.3M SAR** of the 16.4M plug is addressable by fixing nine cross-classified GL rows.
- Phase 8.1 COA + synonym order + pilot remap targets those rows (ROU, long-term loan, actuarial reserve, zakat provision, contract assets, finance/zakat expense lines).
- **Residual plug** may remain until all lease/OCI/deferred-tax GL lines are mapped and Non-Current Liabilities section is populated.

## Governance

- No schema change (`AuditCanonicalAccount` model unchanged).
- **BS/IS guard** (2026-06-13): `classifyByRules` skips canonical codes whose `statementType` conflicts with the ERP `BS/IS` column — prevents mapping IS expense rows to BS liability/asset codes.
- **ROU disambiguation**: accumulated depreciation account names route to CA-1071 even when Mapping 1 says "Right of-use-assets".
- No autonomous mapping approval — remaps are script-assisted; human review required for external sign-off.
- Retained earnings double-count guard in `statement-builder.ts` is **unchanged**.

## Validation

| Check | Command |
| ----- | ------- |
| TypeScript | `npx tsc --noEmit` |
| Phase 8.1 synonyms | `npm test -- coa-phase-81.test.ts` |
| TB intelligence | `npm test -- tb-intelligence.test.ts` |
