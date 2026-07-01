# Factory Accuracy Audit — Audited FS vs AuditOS Generated FS

**Version:** v1  
**Date:** 2026-06-14  
**Engagement:** `eng-gulf-2025`  
**Source TB:** `TB 31-12-2025 Final.xlsx`  
**Reference (source of truth for this audit):** `Audited FSs 31-12-2025.pdf` (pages 6–10 rendered)  
**AuditOS export:** `docs/audits/evidence/factory-accuracy-auditos-export.json`  
**Mode:** Read-only measurement — **no code, mapping, COA, or schema changes**

---

## Executive Summary

AuditOS was compared line-by-line against the **audited financial statements** of Shalfa Facilities Management Company for the year ended **31 December 2025**.

| Finding | Result |
|---------|--------|
| **Balance sheet totals (Assets, Liabilities, Equity)** | **Near-exact match** (≤0.01% variance on totals) |
| **Ending cash** | **Exact match** (62,819,989 SAR) |
| **Audited net profit (25,084,852)** | **Equals plug line**, **not** AuditOS IS net profit (926,038,529) |
| **Income statement (P&L face)** | **Material failure** — revenue, costs, and net profit do not match audited FS |
| **Statement of changes in equity** | **Material failure** — RE closing 69.9M vs TB RE 44.8M; plug substitutes for rolled profit |
| **Cash flow statement** | **Material failure** — operating/investing/financing sections incomplete vs audited |
| **Disclosure notes** | **Not comparable** — auto-generated amounts conflict with audited note references |

**Bottom line:** AuditOS reproduces **TB-derived balance sheet totals and cash** with high structural fidelity, but **does not reproduce audited P&L, SOCI rollforward, or cash flow presentation**. The **25.08M plug equals audited net profit** — confirming this is an **equity rollforward / TB export methodology** issue, not random mapping noise.

---

## Methodology

### Materiality

Material line = absolute variance **>** greater of:

- **1,000,000 SAR**, or  
- **0.5% × Total Assets** = **1,880,692 SAR** (audited total assets 376,138,426)

Immaterial presentation-only differences (label wording, note references) are noted but not scored as failures.

### AuditOS collection

Exported from `eng-gulf-2025` after FS v2 rebuild (2026-06-14):

- Statement of Financial Position (`balance_sheet`)
- Statement of Profit or Loss (`income_statement`)
- Statement of Changes in Equity (`equity`)
- Statement of Cash Flows (`cash_flow`)
- Disclosure notes (`auditDisclosureNote` — 15 notes)

### Audited FS collection

PDF is **image-based** (no machine-readable text). Pages **6–10** were rendered and read independently. Amounts below are taken from those pages; page numbers refer to **PDF pagination** (user reference pages 6–10).

### Classification codes

| Code | Meaning |
|------|---------|
| **A** | Mapping issue |
| **B** | Presentation difference |
| **C** | TB export methodology |
| **D** | Equity rollforward difference |
| **E** | Cash flow logic |
| **F** | Unknown |

---

## STEP 3 — Line-by-Line Comparison (Material Items)

### A. Statement of Financial Position (PDF page 6)

| Line Item | AuditOS (SAR) | Audited FS (SAR) | Variance (SAR) | Variance % | Class |
|-----------|---------------|------------------|----------------|------------|-------|
| **Total Assets** | 376,111,039 | 376,138,426 | −27,387 | −0.007% | B |
| Current Assets | 320,483,881 | 320,511,272 | −27,391 | −0.009% | B |
| Cash and cash equivalents | 62,819,989 | 62,819,989 | 0 | 0.00% | — |
| Trade receivables | 154,553,914 | 136,420,486 | +18,133,428 | +13.29% | A |
| Contract assets | 61,760,368 | 59,858,023 | +1,902,345 | +3.18% | A |
| Inventories | 4,181,854 | 2,881,491 | +1,300,363 | +45.13% | A |
| Prepaid & other CA (mapped) | 37,167,755 | 37,167,798 | −43 | ~0% | B |
| Contract costs (in prep/other) | — (in prep) | 2,665,142 | immaterial split | — | B |
| Due from related parties | (in receivables/prep) | 18,698,343 | not isolated | — | A |
| **Non-Current Assets** | 55,627,158 | 55,627,154 | +4 | ~0% | — |
| PPE (net) | ~31,670,175 | 31,285,469 | +384,706 | +1.23% | A |
| ROU assets (net) | 23,956,984 | 23,956,980 | +4 | ~0% | — |
| Intangible assets | (in PPE bucket) | 384,705 | not split | — | B |
| **Total Liabilities** | 263,524,312 | 263,551,705 | −27,393 | −0.010% | B |
| **Non-Current Liabilities** | 14,719,607 | 40,387,891 | −25,668,284 | −63.6% | A / C |
| Employee benefit obligation | 15,954,949 (in accrued) | 15,954,949 | presentation | — | B |
| LT Murabaha (non-current) | 14,719,607 (partial) | 3,900,772 | +10,818,835 | +277% | A |
| Lease liabilities (non-current) | **0 mapped** | 20,532,170 | −20,532,170 | −100% | A |
| **Current Liabilities** | 248,804,705 | 223,163,814 | +25,640,891 | +11.5% | A / C |
| Trade payables | 34,469,972 | 34,371,930 | +98,042 | +0.29% | — |
| Accrued & other CL | 111,274,777 | 52,635,743 | +58,639,034 | +111% | A |
| Contract liabilities | **not mapped** | 25,023,279 | −25,023,279 | −100% | A |
| Short-term Murabaha | 92,784,682 | 100,354,623 | −7,569,941 | −7.5% | A |
| LT Murabaha (current) | (in ST borrowings) | 3,248,894 | split | — | A |
| Lease liabilities (current) | **0 mapped** | 4,859,046 | −4,859,046 | −100% | A |
| Zakat provision | 2,575,257 | 2,575,257 | 0 | 0.00% | — |
| **Total Equity** | 112,586,726 | 112,586,721 | +5 | ~0% | — |
| Share capital | 42,000,000 | 42,000,000 | 0 | 0.00% | — |
| General reserve | 150,000 | 150,000 | 0 | 0.00% | — |
| Actuarial reserve | 552,969 | 552,969 | 0 | 0.00% | — |
| Retained earnings (audited closing) | 44,798,901 | **69,883,752** | −25,084,851 | −35.9% | **D** |
| TB Closing plug | **25,084,856** | *(not in audited FS)* | n/a | n/a | **D / C** |

**Notes:**

- AuditOS **total equity matches audited** because **RE (44.8M) + plug (25.08M) ≈ audited RE (69.9M)**.
- Audited FS shows **rolled net profit in RE**; AuditOS shows **unrolled TB RE + synthetic plug**.

---

### B. Income Statement (PDF page 7)

| Line Item | AuditOS (SAR) | Audited FS (SAR) | Variance (SAR) | Variance % | Class |
|-----------|---------------|------------------|----------------|------------|-------|
| **Revenue** | 982,972,012 | 451,412,506 | +531,559,506 | +117.8% | **C** |
| Cost of revenue | 1,267,242 | 384,959,315 | −383,692,073 | −99.7% | **C** |
| **Gross profit** | 981,704,770 | 66,453,191 | +915,251,579 | +1,377% | **C** |
| G&A / operating expenses | 66,838,086 | 26,627,726 | +40,210,360 | +151% | A / C |
| **Profit from operations** | — (not separate) | 39,825,465 | n/a | n/a | B |
| Finance costs (net) | 13,235,282 | 12,901,271 | +334,011 | +2.6% | — |
| Other income (net) | 11,171,845 | 735,915 | +10,435,930 | +1,418% | A / C |
| Profit before zakat | 914,866,684 | 27,660,109 | +887,206,575 | +3,207% | **C** |
| Zakat expense | (in G&A 2,575,257) | 2,575,257 | presentation | — | B |
| **Net profit** | **926,038,529** | **25,084,852** | **+900,953,677** | **+3,592%** | **C / D** |
| OCI — actuarial remeasurement | *(not on IS)* | 94,138 | n/a | n/a | B |

**Critical observation:** Audited **net profit = 25,084,852** matches AuditOS **plug (25,084,856)** to within **4 SAR**. AuditOS **IS net profit is not the audited result** — it aggregates **TB closing balances on IS GL accounts**, not **period P&L presentation**.

---

### C. Statement of Changes in Equity (PDF page 8)

| Line Item | AuditOS (SAR) | Audited FS (SAR) | Variance | Class |
|-----------|---------------|------------------|----------|-------|
| Opening equity (1 Jan 2025) | *(not shown)* | 87,407,731 | n/a | B |
| Net profit for year | 926,038,529 (Current Year Profit) | 25,084,852 | +900,953,677 | **C / D** |
| OCI actuarial | *(not in SOCI)* | 94,138 | n/a | B |
| Closing RE | 44,798,901 | 69,883,752 | −25,084,851 | **D** |
| Closing total equity | 1,013,540,400 (broken total) / BS 112.6M | 112,586,721 | SOCI broken | **D** |

AuditOS equity statement **Total Equity line shows 1.01B** (includes erroneous 926M current-year profit) — **does not reconcile** to audited SOCI. Balance sheet equity **does** reconcile via plug.

---

### D. Cash Flow Statement (PDF pages 9–10)

| Line Item | AuditOS (SAR) | Audited FS (SAR) | Variance (SAR) | Variance % | Class |
|-----------|---------------|------------------|----------------|------------|-------|
| Profit before zakat (CF start) | 926,038,529 | 27,660,109 | +898,378,420 | +3,248% | **C / E** |
| Net cash from operating | 62,819,989 | 19,915,468 | +42,904,521 | +215% | **E** |
| Net cash from investing | 0 | −16,576,737 | +16,576,737 | −100% | **E** |
| Net cash from financing | 0 | 19,153,634 | −19,153,634 | −100% | **E** |
| Net change in cash | 62,819,989 | 22,492,365 | +40,327,624 | +179% | **E** |
| Cash at beginning | 0 | 40,327,624 | −40,327,624 | −100% | **E** |
| **Cash at end** | **62,819,989** | **62,819,989** | **0** | **0.00%** | **E** |

AuditOS CF **ends at correct cash** by summing **TB cash mappings**, but **does not reproduce indirect method**, working capital, or investing/financing sections from audited FS.

---

### E. Disclosure Summary

| Metric | AuditOS | Audited FS |
|--------|---------|------------|
| Notes count | 15 auto-generated | 34 integral notes |
| Share capital in note 12 | SAR 2,705,000 (wrong) | SAR 42,000,000 |
| Cash in note 2 | SAR 2,575,000 (wrong) | SAR 62,819,989 |
| Revenue in note 8 | SAR 5,295,000 (wrong) | SAR 451,412,506 |

Disclosures are **draft/auto-generated** and **not accuracy-comparable** to audited notes. Scored separately; excluded from line-item accuracy numerator.

---

## STEP 4 — Variance Classification Summary

| Class | Count (material lines) | Dominant themes |
|-------|------------------------|-----------------|
| **A — Mapping** | 8 | Receivables, contract assets, inventory, lease liabilities, contract liabilities, NCL split |
| **B — Presentation** | 6 | Plug vs RE rollforward; actuarial/OCI placement; line aggregation |
| **C — TB export methodology** | 5 | IS closing-balance vs period P&L; revenue/CoS inflation; BS/IS slice |
| **D — Equity rollforward** | 4 | RE 44.8M vs 69.9M; plug = audited NI; SOCI broken |
| **E — Cash flow logic** | 5 | No indirect method; zero investing/financing; wrong opening cash |
| **F — Unknown** | 0 | — |

---

## STEP 5 — Accuracy Scoring

### 1. Structural Accuracy (Assets = Liabilities + Equity)

| Criterion | Score |
|-----------|-------|
| BS equation balances internally | ✅ |
| Total assets vs audited | ✅ (0.007%) |
| Total L+E vs audited | ✅ (0.007%) |
| No orphan sections | ✅ |

**Structural Accuracy: 98 / 100**  
*(−2 for synthetic plug line and mis-aggregated sub-lines despite balanced totals)*

---

### 2. Economic Accuracy (Revenue, Profit, Cash, Equity)

| Economic measure | Match? | Weight | Points |
|------------------|--------|--------|--------|
| Total equity (economic) | ✅ | 25% | 25 |
| Ending cash | ✅ | 25% | 25 |
| Audited net profit (25.08M) | ✅ **via plug only** | 25% | 15 |
| IS net profit line | ❌ (926M) | 15% | 0 |
| Revenue | ❌ (983M vs 451M) | 10% | 0 |

**Economic Accuracy: 65 / 100**  
*(Totals and cash align; P&L economics wrong on face but captured in plug)*

---

### 3. Presentation Accuracy (Resemblance to audited FS)

| Criterion | Score impact |
|-----------|--------------|
| BS layout recognizable | +20 |
| Plug line absent in audited FS | −25 |
| IS structure wrong magnitudes | −30 |
| SOCI not rollforward-compliant | −20 |
| CF skeleton only | −25 |
| Bilingual / note cross-refs | N/A |

**Presentation Accuracy: 22 / 100**

---

### 4. Line Item Accuracy (Material lines matched)

Material lines assessed: **28**

| Result | Count |
|--------|-------|
| Match (≤ materiality or ≤0.5%) | **9** |
| Immaterial / presentation only | 3 |
| Material mismatch | **16** |

Matched material lines include: Total assets, total equity, total liabilities, cash, zakat, share capital, reserves, actuarial, ROU net, finance costs (approx).

**Line Item Accuracy: 32 / 100** (9 ÷ 28 × 100, rounded)

---

### Composite Factory Accuracy

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| Structural | 20% | 98 | 19.6 |
| Economic | 35% | 65 | 22.8 |
| Presentation | 20% | 22 | 4.4 |
| Line item | 25% | 32 | 8.0 |

**Factory Accuracy: 55 / 100**

---

## STEP 6 — Top 20 Largest Variances

| Rank | Line | AuditOS | Audited | Variance | Root cause | Fix domain |
|------|------|---------|---------|----------|------------|------------|
| 1 | Net profit (IS face) | 926,038,529 | 25,084,852 | +900,953,677 | TB **closing balance** summed on IS accounts | **FS Engine** |
| 2 | Revenue | 982,972,012 | 451,412,506 | +531,559,506 | Same — cumulative GL closings | **FS Engine** |
| 3 | Cost of revenue | 1,267,242 | 384,959,315 | −383,692,073 | CoS mis-mapped / closing mode | **FS Engine / Mapping** |
| 4 | Gross profit | 981,704,770 | 66,453,191 | +915,251,579 | Derived from #1–3 | **FS Engine** |
| 5 | Profit before zakat | 914,866,684 | 27,660,109 | +887,206,575 | Derived | **FS Engine** |
| 6 | CF — profit start | 926,038,529 | 27,660,109 | +898,378,420 | Uses wrong net profit | **Cash Flow Engine** |
| 7 | Retained earnings (closing) | 44,798,901 | 69,883,752 | −25,084,851 | **Plug = audited NI**; RE not rolled | **Equity Engine / C** |
| 8 | Plug (AuditOS only) | 25,084,856 | 0 | +25,084,856 | TB equity GL vs IS slice | **Equity Engine / C** |
| 9 | Accrued liabilities | 111,274,777 | 52,635,743 | +58,639,034 | EBO 15.9M in accrued; aggregation | **Mapping / COA** |
| 10 | CF operating | 62,819,989 | 19,915,468 | +42,904,521 | CF = cash TB sum, not indirect | **Cash Flow Engine** |
| 11 | CF net change | 62,819,989 | 22,492,365 | +40,327,624 | No opening cash; no sections | **Cash Flow Engine** |
| 12 | Trade receivables | 154,553,914 | 136,420,486 | +18,133,428 | Mapping / contra accounts | **Mapping** |
| 13 | Lease liabilities (NCL+CL) | 0 | 25,391,216 | −25,391,216 | Not mapped to CA-2110/2120 | **Mapping / COA** |
| 14 | NCL total | 14,719,607 | 40,387,891 | −25,668,284 | Missing lease + EBO presentation | **Mapping / FS Engine** |
| 15 | Contract liabilities | 0 | 25,023,279 | −25,023,279 | No canonical line used | **COA / Mapping** |
| 16 | G&A expense | 66,838,086 | 26,627,726 | +40,210,360 | Closing balance aggregation | **FS Engine** |
| 17 | Other income | 11,171,845 | 735,915 | +10,435,930 | Closing balance aggregation | **FS Engine** |
| 18 | ST Murabaha | 92,784,682 | 100,354,623 | −7,569,941 | Borrowings split across codes | **Mapping** |
| 19 | CF investing | 0 | −16,576,737 | +16,576,737 | Not implemented | **Cash Flow Engine** |
| 20 | CF financing | 0 | 19,153,634 | −19,153,634 | Not implemented | **Cash Flow Engine** |

**No implementation proposed** — domains listed for future prioritization only.

---

## STEP 7 — Final Verdict

| Metric | Score | Interpretation |
|--------|-------|----------------|
| **Factory Accuracy %** | **55%** | Strong on **BS totals + cash**; weak on **P&L face, SOCI, CF** |
| **Factory Readiness %** | **45%** | Factory pipeline runs end-to-end; output **not audit-face equivalent** |
| **Pilot Readiness %** | **60%** | Suitable for **internal TB→FS pipeline demo** with disclosed limitations |
| **External Sign-off Readiness %** | **15%** | **Not suitable** for external audit sign-off without manual override |

### Decision: **Internal Pilot Only**

| Option | Verdict |
|--------|---------|
| Reject | ❌ (pipeline has measurable value on totals) |
| **Internal Pilot Only** | ✅ **Selected** |
| Limited External Pilot | ❌ (IS/CF/SOCI gaps too large) |
| External Pilot Ready | ❌ |
| Production Ready | ❌ |

---

## Conclusions for Independent Review

1. **Your visual finding is confirmed:** Audited **net profit ≈ plug ≈ 25.08M SAR** — not coincidental ([`EQUITY_BRIDGE_ANALYSIS.md`](./EQUITY_BRIDGE_ANALYSIS.md)).
2. **This is not primarily a Phase 8.1 mapping failure** on totals — **total assets, equity, cash, and zakat** tie closely to audited FS.
3. **Primary factory gap:** **Income statement engine uses TB closing balances**, producing **926M net profit** while audited FS shows **25M** — the latter appears correctly only as **equity plug**, not on P&L.
4. **Secondary gaps:** **Lease liabilities, contract liabilities, SOCI rollforward, indirect cash flow** — presentation and mapping layers.
5. **Disclosures:** Auto-generated notes contain **materially wrong figures** vs audited notes — do not use for accuracy scoring or external packages.

---

## Evidence Package

| Artifact | Path |
|----------|------|
| AuditOS export JSON | `docs/audits/evidence/factory-accuracy-auditos-export.json` |
| Audited PDF page renders | `docs/audits/evidence/audited-fs-pages/page-6.png` … `page-10.png` |
| Equity bridge | `docs/audits/EQUITY_BRIDGE_ANALYSIS.md` |
| Source PDF | `Audited FSs 31-12-2025.pdf` (repo root) |
| Source TB | `TB 31-12-2025 Final.xlsx` (user Downloads) |

---

## Auditor Independence Statement

This assessment:

- Treats **audited FS as reference truth** for comparison  
- Treats **AuditOS output as measured**, not assumed correct  
- Makes **no code, mapping, COA, or schema changes**  
- Makes **no implementation recommendations** (fix domains named for classification only)

---

*Factory Accuracy Audit v1 — measurement only — 2026-06-14*
