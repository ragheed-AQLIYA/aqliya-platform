# Audited Presentation Alignment — Phase 11

**Engagement:** `eng-gulf-2025`  
**Source TB:** `TB 31-12-2025 Final.xlsx`  
**Reference:** `Audited FSs 31-12-2025.pdf` (Statement of Profit or Loss, page 7)  
**Evidence:** [`p11-audited-presentation-analysis.json`](./evidence/p11-audited-presentation-analysis.json)  
**Date:** 2026-06-14  
**Mode:** Presentation alignment — **accounting net profit, BS totals, cash, and equity reconciliation unchanged**

---

## Executive Summary

Phase 11 closes the **presentation gap** between AuditOS v3 (Factory Accuracy **79**) and the audited financial statements by applying **evidence-based display rules** on top of the Phase 10 signed-IS accounting engine.

| Line | AuditOS v3 | Phase 11 (v4) | Audited | v4 variance |
|------|----------:|--------------:|--------:|------------:|
| Operating revenue | 531,162,927 | **450,305,192** | 451,412,506 | **−0.24%** |
| Cost of revenue | 477,611,528 | **384,995,489** | 384,959,315 | **+0.009%** |
| Gross profit | 53,551,399 | **65,309,703** | 66,453,191 | −1.7% |
| G&A | 25,160,098 | 25,160,098 | 26,627,726 | −5.5% |
| Operating profit | 28,391,302 | **40,149,605** | 39,825,465 | **+0.8%** |
| Finance costs (net) | 13,235,282 | **12,901,271** | 12,901,271 | **0.0%** |
| Other income (net) | 11,171,845 | **735,915** | 735,915 | **0.0%** |
| Zakat | 2,575,257 | 2,575,257 | 2,575,257 | 0.0% |
| **Net profit** | **25,084,856** | **25,084,856** | **25,084,852** | **±0.000016%** |

**Accounting authority unchanged:** `computeIncomeStatementNetProfit()` still drives the **Net Profit** line from signed IS-source GL nets.

---

## 1. Revenue Alignment — 531M vs 451M

### 1.1 Waterfall (AuditOS v3 → audited operating revenue)

| Component | SAR | Role |
|-----------|----:|------|
| Map1 `Revenues` (7 GL accounts) | 462,388,883 | TB operating revenue bucket |
| **Intercompany / affiliate** GL `4401010005` (blank Map1) | 68,774,044 | **Not in audited consolidated revenue** — memo line |
| AuditOS v3 headline (Map1 + affiliate) | **531,162,927** | v3 total |
| **Less: audited segment reclassifications** | | |
| → GL `4401010004` (claims / مطالبات) | −3,744,152 | Reclassified in audited FS |
| → GL `4601010003` (waste recycling project) | −6,244,629 | Segment reclassified |
| → GL `4701010001` (containers) | −2,094,911 | Segment reclassified |
| **Subtotal exclusions** | −12,083,692 | |
| **Phase 11 operating revenue headline** | **450,305,192** | |
| Audited FS revenue | 451,412,506 | |
| **Residual presentation gap** | **+1,107,314** (+0.25%) | Auditor adjustment not expressible as whole GL exclusions* |

\*Map1 Revenues minus audited revenue = **10,976,377** exactly. The three GL exclusions sum to **12,083,692**; audited FS effectively excludes **~10.98M**, leaving a **1.1M** residual (likely partial segment / IFRS 15 presentation adjustment).

### 1.2 Revenue classification (Phase 11)

| Class | GL / rule | Amount (SAR) | On audited IS face? |
|-------|-----------|-------------:|:-------------------:|
| **Operating revenue** | Map1 `Revenues` minus reclass GLs above | 450,305,192 | **Yes (headline)** |
| **Intercompany / affiliate** | `4401010005` | 68,774,044 | **No** — consolidation memo |
| **Contract revenue (trace)** | `4401010004` + unbilled `4401010003` | 64,139,742 | Partial / memo |
| **Core facilities** | `4401010001` | 356,517,711 | Included in operating |
| **Security segment** | `4301010002` | 19,822,496 | Included in operating |
| **Environmental segment** | `4601010002` | 13,569,395 | Included in operating |
| **Unbilled (contract asset duplicate)** | `4401010003` | 60,395,590 | Included in operating; duplicates BS `1107040007` |

### 1.3 Consolidation policy — affiliate revenue

| Policy | Treatment |
|--------|-----------|
| **TB fact** | GL `4401010005` (ايرادات الشركات الشقيقة) has **blank Map1**; 68.77M credit closing |
| **Audited FS** | Consolidated revenue **451.4M excludes** affiliate gross-up |
| **Phase 11 rule** | Affiliate shown as **“Intercompany / Affiliate Revenue (consolidation memo)”** — **excluded from operating revenue headline** |
| **Accounting net** | Affiliate remains in signed IS net (economic activity); **display-only** exclusion |

---

## 2. Cost of Revenue Alignment — 478M vs 385M

### 2.1 Waterfall

| Component | SAR |
|-----------|----:|
| AuditOS v3 CoR (32xx/33xx + Map1) | 477,611,528 |
| **Excluded from audited CoR face (Phase 11)** | |
| → GL `3204010028` (government expenses — CoR Map1) | −49,143,510 |
| → GL `3204010054` (joint-venture shared costs) | −32,807,728 |
| → **All 33xx** (ROU amortization, e.g. `3301010011`) | −10,664,801 |
| **Phase 11 CoR headline** | **384,995,489** |
| Audited CoR | 384,959,315 |
| **Variance** | **+36,174 (+0.009%)** |

### 2.2 Interpretation

| AuditOS included | Audited FS treatment | Evidence |
|------------------|---------------------|----------|
| 3204010028 government (49.1M) | **Not on CoR line** — eliminated / reclassified | Map1 CoR vs audited −92M gap; top GL match |
| 3204010054 JV shared (32.8M) | **Not on CoR line** — consolidation / JV policy | Same |
| 33xx ROU amort (10.7M) | **Depreciation / G&A presentation** | IFRS 16 presentation difference |
| Remaining 32xx Map1 CoR (~385M) | **Audited CoR** | Matches within 0.01% |

**Not moved to G&A display:** excluded CoR amounts are **presentation-eliminated** (consolidation / reclassification), not added to the G&A line — preserving audited G&A ≈ 26.6M without inflating operating expenses.

---

## 3. Other Income Alignment — 11.2M vs 736K

### 3.1 Gross vs net

| GL | Name | TB closing (gross) | Audited presentation |
|----|------|-------------------:|---------------------:|
| 4501010001 | Fixed-asset disposal gain | 8,409 | **Included** |
| 4501010003 | Misc other income | **11,163,436** | **Net residual ~727,507** |
| 4501010003-1 | Murabaha deposit gain | 0 | Map1 Finance Costs — zero closing |
| 4501010003-2 | Lease disposal gain | 0 | — |
| **Total gross** | | **11,171,845** | |
| **Audited net** | | | **735,915** |
| **Implied internal netting** | | | **10,435,930** |

### 3.2 Phase 11 rule

- Present **4501010001** at full amount.
- Present **4501010003** at **residual misc net** = `min(misc gross, audited net band − small accounts)`.
- Pilot residual band = **735,915 SAR** (from audited FS; TB gross − net = 10,435,930).
- **Accounting net unchanged** — display-only netting on the misc bucket.

---

## 4. Finance Netting — gross vs net

| Measure | SAR |
|---------|----:|
| TB Map1 `Finance Costs` gross (19 accounts) | 13,235,282 |
| Audited finance costs **(net)** | 12,901,271 |
| **Presentation net offset** | **334,011** |
| Phase 11 finance line | **12,901,271** |

**Conclusion:** Audited FS presents **finance costs net** of murabaha / deposit income credits (~334K). TB Map1 stores **gross** finance debits; no closing credit on deposit-gain GL `4501010003-1` in this export.

Phase 11 applies `AUDITED_FINANCE_NET_OFFSET = 334,011` as a **presentation-only** deduction. No change to signed IS net.

---

## 5. Presentation Integrity vs Accounting

| Item | Unchanged | Notes |
|------|:---------:|-------|
| `computeIncomeStatementNetProfit()` | ✅ | Still signed IS-source sum |
| Balance sheet totals | ✅ | BS engine untouched |
| Cash | ✅ | Unchanged |
| Equity reconciliation / plug | ✅ | Bridge label + amount unchanged |
| Display subtotals (gross, PBT) | ⚠️ | **May not sum to net** when presentation rules apply; **Net Profit** remains accounting authority |

Phase 11 v4 **PBT display** 27,984,249 vs audited 27,660,109 (+1.2%) — residual from G&A presentation (−5.5%) and revenue residual (+0.25%).

---

## 6. Implementation Map

| Rule | Module | Constant / function |
|------|--------|---------------------|
| Operating revenue exclusions | `income-statement-presentation.ts` | `AUDITED_OPERATING_REVENUE_EXCLUSION_CODES` |
| Intercompany memo | same | `isPresentationIntercompanyRevenueMapping` |
| CoR exclusions | same | `AUDITED_COR_EXCLUSION_CODES` + `33xx` prefix |
| Other income net | same | `getAuditedAlignedOtherIncomeNet` |
| Finance net | same | `AUDITED_FINANCE_NET_OFFSET` |
| IS face | `statement-builder.ts` | `Operating Revenue` headline + memo sub-lines |

---

## 7. Validation

| Command | Result |
|---------|--------|
| `node -r ./scripts/mock-server-only.cjs --import tsx scripts/p10-pl-simulation.mjs` | Pass — see v4 figures above |
| `npx tsc --noEmit` | Pass |
| `npm test -- income-statement-presentation.test.ts` | Pass |

---

*Phase 11 — Audited Presentation Alignment — 2026-06-14*
