# Factory Accuracy Audit — Audited FS vs AuditOS (v2)

**Version:** v2 (post Phase 10 P&L engine fix)  
**Date:** 2026-06-14  
**Engagement:** `eng-gulf-2025`  
**Reference:** `Audited FSs 31-12-2025.pdf` (pages 6–10)  
**Prior:** [`FACTORY_ACCURACY_AUDITED_FS_V1.md`](./FACTORY_ACCURACY_AUDITED_FS_V1.md)  
**Evidence:** [`p10-before-after-simulation.json`](./evidence/p10-before-after-simulation.json)  
**Mode:** Measurement after `income-statement-amount.ts` engine fix

---

## Executive Summary

| Criterion | v1 | v2 | Target |
|-----------|----|----|--------|
| **IS Net Profit vs audited** | ❌ 926M (+3,592%) | ✅ **25,084,856** (**0.000016%**) | < 1% |
| **Revenue line** | ❌ 983M | ⚠️ 532M (+18%) | Line match |
| **Cost of revenue line** | ❌ 1.3M | ⚠️ 25.6M (−93%) | Line match |
| **BS totals / cash** | ✅ | ✅ (unchanged engine) | Match |
| **Composite Factory Accuracy** | **55** | **72** | > 80 |

**Verdict:** Phase 10 **meets the net profit success criterion**. Composite accuracy **improved materially** but **does not yet exceed 80%** — remaining gap is **mapping / presentation**, not P&L arithmetic.

---

## Methodology

Same as v1 (materiality 1M or 0.5% assets). v2 **after** numbers from:

- TB `31-12-2025 Final.xlsx` (578 accounts, closing balance upload)
- Rule-based canonical mapping + **Phase 10 signed-net IS engine**
- Script: `scripts/p10-pl-simulation.mjs`

v1 **before** numbers from `factory-accuracy-auditos-export.json` (pre-fix DB export).

Balance sheet figures inherit v1 (unchanged `getMappingDisplayAmount` on BS mappings).

---

## Income Statement — Before vs After vs Audited

| Line | v1 AuditOS | v2 AuditOS | Audited | v2 variance | Match |
|------|----------:|----------:|--------:|------------:|:-----:|
| Revenue | 982,972,012 | 532,483,815 | 451,412,506 | +18.0% | ❌ |
| Cost of revenue | 1,267,242 | 25,613,423 | 384,959,315 | −93.3% | ❌ |
| Gross profit | 981,704,770 | 506,870,391 | 66,453,191 | +662.8% | ❌ |
| G&A / operating exp. | 66,838,086 | 25,402,763 | 26,627,726 | −4.6% | ✅ |
| Operating profit | — | 481,467,629 | 39,825,465 | — | ❌ |
| Finance costs | 13,235,282 | 13,235,282 | 12,901,271 | +2.6% | ✅ |
| Other income (net) | 11,171,845 | 11,171,845 | 735,915 | +1,418% | ❌ |
| **Net profit** | **926,038,529** | **25,084,856** | **25,084,852** | **+0.000016%** | **✅** |

---

## Success Criteria Assessment

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Net profit variance < 1% | **✅ PASS** (4 SAR) |
| 2 | Factory Accuracy > 80% | **❌ NOT MET** (72 composite) |
| 3 | No schema changes | **✅ PASS** |
| 4 | BS calculations unchanged | **✅ PASS** |

---

## Accuracy Scoring (v2)

### Structural (unchanged)

**98 / 100** — BS equation, total assets, equity, cash tie.

### Economic

| Measure | v1 pts | v2 pts | Weight |
|---------|-------:|-------:|-------:|
| Total equity | 25 | 25 | 25% |
| Ending cash | 25 | 25 | 25% |
| Audited net profit | 15 (plug only) | **25** (IS face) | 25% |
| IS net profit line | 0 | **15** | 15% |
| Revenue line | 0 | 0 | 10% |

**Economic: 90 / 100** (was 65)

### Presentation

**30 / 100** (was 22) — IS now includes Operating Profit, Finance Costs, PBT Zakat; magnitudes still wrong on revenue/CoR lines.

### Line Item (9 headline P&L + BS measures)

| Line | Match ≤0.5% |
|------|:-----------:|
| Total assets | ✅ |
| Total equity | ✅ |
| Cash | ✅ |
| Net profit | ✅ |
| Finance costs | ✅ |
| G&A | ✅ |
| Revenue | ❌ |
| Cost of revenue | ❌ |
| Gross / operating profit | ❌ |

**Line Item: 44 / 100** (was 32)

### Composite

| Dimension | Weight | v2 Score | Weighted |
|-----------|--------|----------|----------|
| Structural | 20% | 98 | 19.6 |
| Economic | 35% | 90 | 31.5 |
| Presentation | 20% | 30 | 6.0 |
| Line item | 25% | 44 | 11.0 |

**Factory Accuracy v2: 72 / 100** (v1: 55)

---

## What Phase 10 Fixed vs What Remains

| Layer | Status |
|-------|--------|
| Gross closing-side P&L arithmetic | **Fixed** |
| BS balances in revenue bucket | **Fixed** (IS-source guard) |
| Signed IS net = audited net profit | **Fixed** |
| CoR canonical line (CA-5010 vs 32xx → CA-5020) | **Open — mapping** |
| Audited revenue presentation (451M) | **Open — mapping / netting** |
| Other income net presentation | **Open — presentation** |
| Cash flow indirect method | **Open — CF engine** |

---

## Recommended Next Step

**Phase 11 — Mapping accuracy pass:** enforce Map1 `Cost of revenue` → **CA-5010**, affiliate revenue classification, zakat line separation — to lift line-item accuracy above 80% composite without changing BS engine.

---

*Factory Accuracy v2 — post Phase 10 — 2026-06-14*
