# Factory Accuracy Audit — Audited FS vs AuditOS (v3)

**Version:** v3 (post Phase 10.5 presentation accuracy program)  
**Date:** 2026-06-14  
**Engagement:** `eng-gulf-2025`  
**Reference:** `Audited FSs 31-12-2025.pdf` (pages 6–10)  
**Prior:** [`FACTORY_ACCURACY_AUDITED_FS_V2.md`](./FACTORY_ACCURACY_AUDITED_FS_V2.md)  
**Evidence:** [`p10-before-after-simulation.json`](./evidence/p10-before-after-simulation.json)  
**Mode:** Measurement after `income-statement-presentation.ts` presentation layer (accounting net unchanged)

---

## Executive Summary

| Criterion | v1 | v2 | v3 | Target |
|-----------|----|----|-----|--------|
| **IS Net Profit vs audited** | ❌ 926M (+3,592%) | ✅ **25,084,856** | ✅ **25,084,856** | < 1% |
| **Revenue line** | ❌ 983M | ⚠️ 532M (+18%) | ⚠️ **531M (+17.7%)** + sub-lines | Line match |
| **Cost of revenue line** | ❌ 1.3M | ⚠️ 26M (−93%) | ⚠️ **478M (+24%)** | Line match |
| **Zakat on IS face** | in G&A bucket | in G&A bucket | ✅ **2,575,257** (exact) | Separate line |
| **G&A / operating exp.** | — | ⚠️ 25.4M (−4.6%) | ⚠️ **25.2M (−5.5%)** | Line match |
| **Other income (net)** | — | ❌ 11.2M (+1,418%) | ❌ **11.2M (+1,418%)** | Audited netting |
| **Composite Factory Accuracy** | **55** | **72** | **79** | **> 85** |

**Verdict:** Phase 10.5 **materially improves presentation accuracy** (+7 points vs v2) **without changing accounting net profit**. **85%+ target is not yet met** — remaining gap is **audited FS netting / mapping** (other income, revenue vs TB Map1, CoR audited adjustment), not P&L arithmetic.

---

## Version Progression

| Version | Engine | Presentation | Net profit | Composite |
|---------|--------|--------------|------------|-----------|
| **v1** | Gross closing-side IS | Canonical buckets only | 926M ❌ | **55** |
| **v2** | Signed-net IS (`income-statement-amount.ts`) | Operating / finance / PBT lines | 25.08M ✅ | **72** |
| **v3** | Same as v2 (unchanged) | Map1 + GL-prefix presentation layer | 25.08M ✅ | **79** |

---

## Phase 10.5 Presentation Changes (no architecture change)

| Area | Change | Module |
|------|--------|--------|
| Revenue trace | **Affiliate / Contract / Other** sub-lines on IS | `income-statement-presentation.ts` |
| CoR presentation | **32xx / 33xx** + Map1 `Cost of revenue` + CA-5010 | Same |
| Zakat | **Map1 `zakat expense` only** — government 310102* stays in G&A | Same |
| Unbilled duplicate | GL `4401010003` → **Other Revenue** (contract-asset duplicate) | Same |
| Other income net | Finance deposit gain netting helper (no closing balance on pilot TB) | Same |
| SOCI | **Equity bridge label** replaces “TB Closing Classification Adjustments” | `statement-builder.ts` |
| Accounting net | **`computeIncomeStatementNetProfit()` unchanged** | `income-statement-amount.ts` |

---

## Income Statement — v1 / v2 / v3 vs Audited

| Line | v1 | v2 | v3 | Audited | v3 variance | Match |
|------|---:|---:|---:|--------:|------------:|:-----:|
| Revenue | 982,972,012 | 532,483,815 | **531,162,927** | 451,412,506 | +17.7% | ❌ |
| — Affiliate Revenue | — | — | **68,774,044** | *(trace)* | — | trace |
| — Contract Revenue | — | — | **3,744,152** | *(trace)* | — | trace |
| — Other Revenue | — | — | **458,644,732** | *(trace)* | — | trace |
| Cost of revenue | 1,267,242 | 25,613,423 | **477,611,528** | 384,959,315 | +24.1% | ❌ |
| Gross profit | 981,704,770 | 506,870,391 | **53,551,399** | 66,453,191 | −19.4% | ❌ |
| G&A / operating exp. | 66,838,086 | 25,402,763 | **25,160,098** | 26,627,726 | −5.5% | ✅ |
| Operating profit | — | 481,467,629 | **28,391,302** | 39,825,465 | −28.7% | ❌ |
| Finance costs | 13,235,282 | 13,235,282 | **13,235,282** | 12,901,271 | +2.6% | ✅ |
| Other income (net) | 11,171,845 | 11,171,845 | **11,171,845** | 735,915 | +1,418% | ❌ |
| Profit before zakat | — | — | **26,327,864** | 27,660,109 | −4.8% | ⚠️ |
| **Zakat** | *(in G&A)* | *(in G&A)* | **2,575,257** | **2,575,257** | **0.0%** | **✅** |
| **Net profit** | **926,038,529** | **25,084,856** | **25,084,856** | **25,084,852** | **+0.000016%** | **✅** |

\*Presentation subtotals (gross / operating / PBT) are **display buckets**; **Net Profit** remains the signed IS accounting total.

---

## Statement of Changes in Equity

| Item | v2 | v3 |
|------|----|----|
| Plug label | TB Closing Classification Adjustments | **Current Year Profit (IS period — unclosed to RE in TB export)** |
| Bridge amount | 25,084,856 | 25,084,856 (same) |
| Opening equity | TB GL balances | TB GL balances + component lines |
| Total equity | 112,586,726 | 112,586,726 (unchanged) |

---

## Accuracy Scoring (v3)

### Structural (unchanged)

**98 / 100** — BS equation, total assets, equity, cash tie.

### Economic

| Measure | v1 | v2 | v3 | Weight |
|---------|---:|---:|---:|-------:|
| Total equity | 25 | 25 | 25 | 25% |
| Ending cash | 25 | 25 | 25 | 25% |
| Audited net profit | 15 | 25 | 25 | 25% |
| IS net profit line | 0 | 15 | 15 | 15% |
| Revenue line | 0 | 0 | 0 | 10% |

**Economic: 90 / 100** (unchanged from v2)

### Presentation

**55 / 100** (v2: 30) — revenue sub-buckets, CoR magnitude aligned to TB Map1/32xx, zakat separated, equity bridge; other income / revenue headline still diverge from audited FS.

### Line Item (headline P&L + BS)

| Line | v3 match (≤ ~5% per v2 rubric) |
|------|:------------------------------:|
| Total assets | ✅ |
| Total equity | ✅ |
| Cash | ✅ |
| Net profit | ✅ |
| Zakat | ✅ |
| Finance costs | ✅ |
| G&A | ✅ |
| Revenue | ❌ |
| Cost of revenue | ❌ |
| Gross / operating profit | ❌ |
| Other income | ❌ |

**Line Item: 52 / 100** (v2: 44)

### Composite

| Dimension | Weight | v3 Score | Weighted |
|-----------|--------|----------|----------|
| Structural | 20% | 98 | 19.6 |
| Economic | 35% | 90 | 31.5 |
| Presentation | 20% | 55 | 11.0 |
| Line item | 25% | 52 | 13.0 |

**Factory Accuracy v3: 79 / 100** (v1: 55 → v2: 72 → v3: 79)

---

## What Phase 10.5 Fixed vs What Remains

| Layer | v3 status |
|-------|-----------|
| Signed IS net = audited net profit | **Fixed (Phase 10)** |
| CoR presentation (32xx / Map1) | **Improved** — 478M vs 26M (v2); still +24% vs audited 385M |
| Zakat separated from G&A on IS | **Fixed** — 2,575,257 exact |
| Revenue sub-buckets (Affiliate / Contract / Other) | **Added** — traceability; headline still +17.7% vs audited |
| Other income audited netting | **Open** — TB closing gross 11.2M vs audited net 736K |
| Audited CoR adjustment (~90M) | **Open** — TB Map1 movement vs audited presentation |
| Cash flow indirect method | **Open** — CF engine (out of scope) |

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| `npm test -- income-statement-presentation.test.ts income-statement-amount.test.ts fs-engine.test.ts` | Pass (12 tests) |
| `node -r ./scripts/mock-server-only.cjs --import tsx scripts/p10-pl-simulation.mjs` | Pass — net profit variance 0.000016% |

---

## Recommended Next Step

**Phase 11 — Mapping accuracy pass:** CA-5010 CoR canonical enforcement, audited other-income / finance netting rules with movement evidence, affiliate revenue consolidation policy — to lift composite above **85** without changing signed IS net.

---

*Factory Accuracy v3 — post Phase 10.5 presentation program — 2026-06-14*
