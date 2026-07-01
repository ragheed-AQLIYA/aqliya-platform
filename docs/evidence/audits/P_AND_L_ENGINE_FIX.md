# P&L Engine Fix — Phase 10

**Engagement:** `eng-gulf-2025`  
**Date:** 2026-06-14  
**Related:** [`P_AND_L_ROOT_CAUSE_ANALYSIS.md`](./P_AND_L_ROOT_CAUSE_ANALYSIS.md) · [`FACTORY_ACCURACY_AUDITED_FS_V2.md`](./FACTORY_ACCURACY_AUDITED_FS_V2.md)

---

## Objective

Replace **gross closing-balance arithmetic** on Income Statement mappings with **signed net (credit − debit)** period amounts, scoped to **Income Statement source GL accounts** only. Balance Sheet logic is unchanged.

---

## Root Cause Recap

| Issue | Before | After |
|-------|--------|-------|
| Amount basis | `creditAmount` if ≠ 0 else `debitAmount` (gross side) | `creditAmount − debitAmount` (signed net), expenses as `debit − credit` |
| BS leakage | BS debits mapped to **CA-4010** counted as revenue | Excluded via **IS source GL prefix guard** |
| Net profit | **926,038,529** | **25,084,856** (vs audited **25,084,852**) |

---

## Code Changes

### New module: `src/lib/audit/db/income-statement-amount.ts`

| Function | Purpose |
|----------|---------|
| `inferSourceErpStatementSide()` | Infer ERP BS/IS from Saudi GL prefixes (`31–33`, `43–47` = IS) |
| `isIncomeStatementSourceAccount()` | Guard — only IS-source GL rows enter P&L buckets |
| `getSignedTrialBalanceNet()` | `creditAmount − debitAmount` |
| `getIncomeStatementPeriodAmount()` | Signed net → positive revenue / positive expense display |
| `classifyIncomeStatementMapping()` | Route to Revenue, CoR, OpEx, Finance, Zakat, Other Income |
| `isCostOfRevenueMapping()` | **CA-5010** + **32xx** expense GL (pilot CoR lives here) |
| `computeIncomeStatementNetProfit()` | Sum signed nets on all confirmed IS-source mappings |

### Updated: `src/lib/audit/db/statement-builder.ts`

- **`getMappingDisplayAmount()`** — **unchanged** (Balance Sheet, equity plug, cash, lead schedules BS).
- **`buildStatementLinesFromMappings(..., 'income_statement')`** — uses new IS path only.
- **New IS face:** Revenue → CoS → Gross Profit → Operating Expenses → **Operating Profit** → Finance Costs → Other Income → **Profit Before Zakat** → Zakat → **Net Profit**.
- **Net Profit line** always uses `computeIncomeStatementNetProfit()` (signed IS-source total).

### Updated: `src/lib/audit/lead-schedule/balance-utils.ts`

- IS lead schedules mirror the new signed-net logic; BS uses prior gross closing logic.

### Tests: `src/lib/audit/db/__tests__/income-statement-amount.test.ts`

- Signed net vs gross side regression
- BS-on-revenue exclusion
- 32xx CoR classification
- Net profit integrity

---

## Where Gross Debit/Credit Was Used (Before)

| Location | Statement | Still gross? |
|----------|-----------|--------------|
| `getMappingDisplayAmount()` | BS, equity, CF cash | **Yes (unchanged)** |
| `buildStatementLinesFromMappings` — IS branch | P&L face | **No — fixed** |
| `buildStatementLinesFromMappings` — BS branch | SFP | **Yes (unchanged)** |
| `balance-utils.getMappingClosingBalance()` | Lead schedule IS | **No — aligned** |
| `cash-flow-builder` | Cash / depreciation | **Yes (unchanged)** |

---

## Before / After Comparison (Pilot TB Simulation)

Source: `docs/audits/evidence/p10-before-after-simulation.json` (578-row TB, rule-based mappings + new engine).

| Measure | Before (gross closing) | After (signed net IS) | Audited FS |
|---------|------------------------:|----------------------:|-----------:|
| **Revenue** | 986,814,510 | 532,483,815 | 451,412,506 |
| **Cost of Revenue** | 0 | 25,613,423 | 384,959,315 |
| **Gross Profit** | 986,814,510 | 506,870,391 | 66,453,191 |
| **Operating Profit** | — | 481,467,629 | 39,825,465 |
| **Net Profit** | **933,723,526** | **25,084,856** | **25,084,852** |

**Net profit variance after fix: 0.000016%** (4 SAR on 25.08M — within success threshold).

### Why line items still differ from audited presentation

- **Revenue / CoR line buckets** depend on **canonical mapping** (CoR synonyms → CA-5020/5070 vs CA-5010; affiliate revenue; audited netting of other income/finance).
- **Net profit** is correct because it sums **all IS-source signed nets**, regardless of canonical bucket presentation — matching ERP IS slice arithmetic from Phase 9.

---

## Column Policy (Amount Mode)

| TB export column | P&L engine use |
|------------------|----------------|
| Closing gross debit/credit (uploaded today) | Convert to **signed net** per row |
| Period movement | Equivalent net on this pilot TB (opening = 0 on IS rows) |
| **Should use** | Signed net / movement — **now implemented** |

No schema change required: `debitAmount` / `creditAmount` on mappings remain the storage fields; interpretation changed for IS reporting only.

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| `npm test -- src/lib/audit/db/__tests__/income-statement-amount.test.ts` | Pass (7 tests) |
| `npm test -- src/lib/audit/fs-engine/__tests__/fs-engine.test.ts` | Pass |
| Pilot TB simulation (`scripts/p10-pl-simulation.mjs`) | Net profit ±0.000016% vs audited |
| DB export (`scripts/factory-accuracy-export.mjs`) | Not run — Postgres unavailable locally |

---

## Remaining Work (Out of Phase 10 Scope)

1. **Mapping pass** — route CoR Map1 accounts consistently to **CA-5010** so CoR **line** matches audited 385M.
2. **Revenue presentation** — affiliate / unbilled revenue netting to audited 451M line.
3. **Zakat line** — separate from G&A when mapped to CA-5070 (amount still in signed net total).
4. **Persist ERP `BS/IS` column** on mapping metadata (optional; prefix guard covers pilot).

---

*Phase 10 — P&L Engine Correction — 2026-06-14*
