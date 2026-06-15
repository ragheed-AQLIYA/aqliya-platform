# TB Closing Classification Adjustments — Pilot Gate Analysis

**Engagement:** `eng-gulf-2025`  
**Source file:** `TB 31-12-2025 Final.xlsx`  
**Trial balance:** 578 accounts, trusted (variance 0.03 SAR)  
**Mappings confirmed:** 578 / 578  
**Analysis date:** 2026-06-13  
**Reconciliation:** RC-001 through RC-006 pass (with this synthetic equity line)

---

## Executive Summary

The balance sheet line **"TB Closing Classification Adjustments"** for **16,427,398.92 SAR** is **not a single general-ledger account**. It is a **computed plug** inserted by the FS v2 builder when:

1. Retained earnings (and related equity) are taken **directly from the trial balance**, and  
2. The builder **does not** add full current-year P&L to equity (to avoid double-counting against TB retained earnings), but  
3. **Assets − Liabilities − Equity (from mappings)** still does not equal zero.

The adjustment **closes the balance sheet arithmetically**. It represents a **classification and presentation residual**, not an auditor-approved accounting entry. Root cause is **primarily mapping / FS classification error (~75%)**, with a **residual structural gap (~25%)** after correcting the worst cross-classifications.

**Pilot gate verdict:** Reconciliation passes; **factory readiness requires human review** of this line before external sign-off. The adjustment **can be largely eliminated** (~12.3M of 16.4M) by fixing nine mis-mapped accounts; **~4.1M SAR** would likely remain without schema/canonical COA extensions (ROU, lease liability, OCI/actuarial).

---

## 1. What the Line Is (Mechanism)

### Formula (from `statement-builder.ts` logic)

When `Retained Earnings` exists on the TB with a non-zero balance:

```
TB Closing Plug = TOTAL ASSETS − (TOTAL LIABILITIES + EQUITY CORE)
```

Where:

| Component | Amount (SAR) | Source |
|-----------|----------------|--------|
| **Total assets** | 348,579,752.85 | Sum of confirmed mappings → Current + Non-Current Assets |
| **Total liabilities** | 244,650,483.47 | Sum of confirmed mappings → Current Liabilities (no Non-Current Liabilities bucket used) |
| **Equity core** | 87,501,870.46 | Share capital + retained earnings + reserves (all from TB mappings) |
| **Plug (adjustment)** | **16,427,398.92** | Difference |

### FS presentation

| Label | Amount (SAR) |
|-------|----------------|
| Equity section total (includes plug) | 103,929,269.38 |
| … Share capital (3 partners) | 42,000,000.00 |
| … General reserve | 150,000.00 |
| … Actuarial reserve | 552,969.00 |
| … Retained earnings | 44,798,901.46 |
| **… TB Closing Classification Adjustments** | **16,427,398.92** |
| **TOTAL LIABILITIES AND EQUITY** | **348,579,752.85** (= TOTAL ASSETS) |

Evidence: `scripts/recon-debug.mjs` on `eng-gulf-2025` after FS rebuild; JSON export `docs/audits/evidence/tb-closing-adjustment-analysis.json`.

---

## 2. Exact Source Accounts Contributing to the Adjustment

There is **no one GL account** for the 16.4M. The plug is the **net effect** of how **all 356 balance-sheet-tagged TB rows** and **222 income-statement-tagged rows** are mapped into a **23-line canonical COA** and split across BS vs IS.

### 2.1 Accounts that **directly** define equity core (TB side of plug)

These are the **only** equity mappings on the engagement. They set the equity core used in the formula; they do **not** individually equal 16.4M.

| GL Code | Account name (AR) | Mapping 1 (ERP) | TB net (SAR) | FS amount (SAR) | Canonical | Category |
|---------|-------------------|-----------------|--------------|-----------------|-----------|----------|
| 2401010001 | راس المال شريك 1 | Share capital | −14,000,000 | 14,000,000 | CA-3010 Share Capital | Equity |
| 2401010002 | راس المال شريك 2 | Share capital | −14,000,000 | 14,000,000 | CA-3010 Share Capital | Equity |
| 2401010003 | رأس مال الشريك 3 | Share capital | −14,000,000 | 14,000,000 | CA-3010 Share Capital | Equity |
| 2303010002 | احتياطى نظامى | General reserve | −150,000 | 150,000 | CA-3020 Retained Earnings | Equity |
| 2303020009 | احتياطي اكتواري | Actuarial reserve | −552,969 | 552,969 | CA-3020 Retained Earnings | Equity |
| 2404010001 | أرباح وخسائر مستبقاة | Retained earninggs | −44,798,901.46 | **44,798,901.46** | CA-3020 Retained Earnings | Equity |

**Equity core total:** 87,501,870.46 SAR  

**Implied equity** (Assets − Liabilities): **103,929,269.38 SAR  
**Shortfall → plug:** **16,427,398.92 SAR**

### 2.2 Primary **indirect** contributors (cross-classification)

Ten accounts are tagged **Balance Sheet** in the ERP export but mapped to **income statement** canonical accounts (or the reverse). These distort Assets, Liabilities, and Equity core **without** moving the same amounts on both sides of the equation.

| GL Code | Account name | ERP BS/IS | ERP Mapping 1 | Mapped to (wrong) | FS amount (SAR) | Effect on plug |
|---------|--------------|-----------|---------------|-------------------|-----------------|----------------|
| **1301010011** | اصول حق الاستخدام | Balance Sheet | Right of-use-assets | CA-5070 G&A expense | 34,016,514.77 | Asset **omitted** from BS (~+34M to plug if corrected to PPE) |
| **2302010009** | مجمع اهلاك اصول حق الاستخدام | Balance Sheet | Right of-use-assets | CA-5070 G&A expense | 10,059,531.46 | Contra-asset **omitted** from BS |
| **2108020001** | قرض طويل الاجل بنك الرياض… | Balance Sheet | Short Term Loans | CA-5040 Utilities | 10,222,653.94 | Liability **omitted** (~−10M plug if on CA-2040) |
| **2104010001** | رواتب مستحقة | Balance Sheet | Accrued expenses… | CA-5020 Employee Benefits | 4,613,253.46 | Liability **omitted** |
| **1106010021** | تجهيزات مشاريع (Contract Costs) | Balance Sheet | Contract Costs | CA-5040 Utilities | 1,364,778.07 | Asset **omitted** |
| **3101020005** | رسوم الزكاة والدخل | Income Statement | zakat expense | CA-2030 Zakat Payable | −2,575,256.63 | Expense on **liability** line |
| **3101070021** | عمولة قرض بنك الرياض… | Income Statement | Finance Costs | CA-2030 Zakat Payable | −513,539.17 | Finance cost on **zakat liability** |
| **3101070045** | عمولة قروض طويلة الاجل… | Income Statement | Finance Costs | CA-2040 Short-term Borrowings | −6,843.18 | Finance cost on **borrowing** line |
| **3204010091** | تكلفة مردم تبوك (مخزون) | Income Statement | Cost of revenue | CA-1030 Inventories | −1,267,242.00 | Expense on **inventory** asset |
| 1106010001 | م مدفوعة مقدماً (رواتب) | Balance Sheet | Prepaid… | CA-5020 Employee Benefits | 0.00 | Zero balance; no amount impact |

**Estimated plug reduction if nine non-zero rows were correctly classified:** **~12,314,251 SAR**  
**Estimated residual plug:** **~4,113,148 SAR**

(Sensitivity model in evidence JSON; not a posted journal.)

### 2.3 Zakat cluster (related but **not** equal to 16.4M)

| GL Code | Name | Mapping 1 | Canonical | FS amount (SAR) |
|---------|------|-----------|-----------|-----------------|
| 2303010003 | مخصص الزكاة الشرعية | Zakat provision | CA-2030 Tax and Zakat Payable | 2,575,257.00 |
| 3101020005 | رسوم الزكاة والدخل | zakat expense | CA-2030 (wrong) | −2,575,256.63 |
| 1103370203 | مبالغ محتجزة-هيئة الزكاة… | Prepaid… | CA-2030 (wrong) | −942,282.43 |
| 2108020005 | قرض … هئية الزكاة… | Short Term Loans | CA-2030 (wrong) | 0.00 |

**Net FS effect of zakat-tagged mappings:** **−1,455,821.23 SAR** (provision ≈ expense, but **lines wrong**).

Zakat **explains part of the misclassification story**; it does **not** fully explain the 16.4M plug.

---

## 3. Account Balances (TB Closing — Amount Mode)

Trial balance uploaded in **closing balance** mode (year-end `31-12-2025`):

| TB aggregate | SAR |
|--------------|-----|
| Total debits | 1,042,934,982.80 |
| Total credits | 1,042,934,982.83 |
| Variance | −0.03 |

**ERP column sums (all 578 accounts):**

| Slice | Net sum (SAR) |
|-------|----------------|
| Balance Sheet rows (`BS/IS = Balance Sheet`) | +25,084,855.89 |
| Income Statement rows | −25,084,855.92 |
| **Combined** | **≈ 0** (balanced TB) |

**Income statement (mapped, FS display logic):**

| P&L component | SAR |
|---------------|-----|
| Revenue (excl. Other income) | 808,049,610.32 |
| Cost of sales | (included in expense bucket) |
| Operating + finance expenses | 310,113,424.50 |
| **Computed net profit (RC-004)** | **497,936,185.82** |

**Retained earnings TB line (2404010001):** **44,798,901.46 SAR** — far below computed net profit, confirming **most P&L sits on IS accounts in the export**, not in the RE line.

---

## 4. Canonical Mappings (Equity & Reserves)

| Reserve / element | ERP label | Current canonical | Appropriate pilot target |
|-------------------|-----------|-------------------|---------------------------|
| General reserve | General reserve | CA-3020 Retained Earnings | Separate **equity reserve** (not in seed COA) |
| Actuarial reserve | Actuarial reserve | CA-3020 Retained Earnings | **OCI / actuarial reserve** or **employee benefit liability** (IAS 19) |
| Retained earnings | Retained earninggs | CA-3020 Retained Earnings | Correct |
| Share capital | Share capital | CA-3010 Share Capital | Correct |
| Zakat provision | Zakat provision | CA-2030 Tax and Zakat Payable | Correct (BS liability) |
| Zakat expense | zakat expense | CA-2030 (incorrect) | **CA-5070** or dedicated zakat expense |
| ROU asset / acc. dep. | Right of-use-assets | CA-5070 (incorrect) | **CA-1050 / CA-1060** or IFRS 16 ROU models |
| Long-term loan | Short Term Loans | CA-5040 / CA-2040 mixed | **Non-current liability** canonical (missing in seed) |

Seed COA has **23 canonical accounts** and **no** IFRS 16 ROU, non-current liability, or OCI lines — forcing misclassification into nearest bucket.

---

## 5. Equity Impact

| Measure | SAR |
|---------|-----|
| Equity core (TB mappings only) | 87,501,870.46 |
| TB Closing Classification Adjustments | 16,427,398.92 |
| **Equity section total on BS** | **103,929,269.38** |
| Current year profit (IS → equity statement, RC-004) | 497,936,185.82 |

**Important distinction:**

- The **16.4M** appears only on the **balance sheet** equity section as a **classification plug**.
- It is **not** the same as **current-year profit** (498M).
- RC-004 still ties **IS net profit** to the **statement of changes in equity** separately.
- The plug means: **“mapped BS accounts imply 16.4M more equity than TB equity lines capture, after excluding IS from the BS equation.”**

---

## 6. Classification of the Adjustment

| Hypothesis | Applies? | Evidence |
|------------|----------|----------|
| **Zakat reserve** | Partial | Provision vs expense almost net zero; **mis-posted to CA-2030** distorts liabilities, not 16.4M plug directly |
| **OCI / actuarial reserve** | Partial | **2303020009** actuarial reserve (552,969) rolled into CA-3020; actuarial **interest expense** on IS (417,620) separate — **reserve should not be RE** for BS equation purposes |
| **Actuarial reserve (balance sheet)** | Yes (minor) | 552,969 SAR — classification issue, not plug magnitude |
| **Retained earnings issue** | **Yes (structural)** | RE TB **44.8M** vs IS net **498M** — builder correctly avoids adding full 498M when RE exists, but **mapping gaps** leave **16.4M** unallocated |
| **Mapping issue** | **Primary (~75%)** | **10 cross-class accounts**; **~12.3M** of plug sensitive to fixing nine rows |
| **Real accounting adjustment** | **No** | No supporting GL, memo, or management approval; **synthetic FS line only** |

**Conclusion:** The 16.4M is **overwhelmingly a mapping / canonical COA limitation artifact**, with **retained-earnings vs unclosed IS presentation** as the structural backdrop. It is **not** a verified zakat, OCI, or actuarial **posting** in the client TB.

---

## 7. Can the Adjustment Be Eliminated?

| Action | Plug impact (est.) | Feasibility |
|--------|-------------------|-------------|
| Re-map **1301010011** ROU → PPE / ROU canonical | Large | Needs COA extension (IFRS 16) |
| Re-map **2302010009** ROU dep. → Accumulated depreciation | Large | Same |
| Re-map **2108020001** long-term loan → non-current liability | ~10.2M | Needs non-current liability canonical |
| Re-map **2104010001** accrued salaries → CA-2020 | ~4.6M | **Can fix now** (synonym/rule) |
| Re-map **1106010021** contract costs → CA-1030/1040 | ~1.4M | **Can fix now** |
| Re-map zakat/finance IS accounts off CA-2030/2040 | ~3.1M | **Can fix now** |
| Re-map **3204010091** off inventory | ~1.3M | **Can fix now** |
| Split actuarial / general reserve from CA-3020 | Minor | Needs equity reserve / OCI COA |
| Add full current-year profit to BS equity | **Worsens** | Would **re-open ~481M** double-count vs RE |

**Answer:** **Mostly yes, partially no.**

- **~75% (~12.3M SAR)** can be removed by **mapping corrections** without changing TB data.
- **~25% (~4.1M SAR)** likely remains until **canonical COA** adds ROU, lease liabilities, non-current debt, and proper reserve categories.
- **100% elimination without a plug** requires either:
  - **Client TB** with IS **closed to retained earnings** and equity lines that tie to assets − liabilities, or  
  - **Full chart of accounts** aligned to IFRS/SOCPA mapping matrix (beyond pilot seed).

---

## 8. Can It Be Fully Explained and Documented?

**Yes — for pilot gate with conditions.**

### What we can document truthfully today

1. **Mechanism** — plug formula and FS line label (this document).  
2. **Account-level drivers** — nine cross-class mappings + equity core table (Section 2).  
3. **Quantified sensitivity** — ~12.3M correctable vs ~4.1M residual (Section 7).  
4. **Zakat / actuarial / RE narrative** — separate from plug magnitude (Section 6).  
5. **Reconciliation status** — RC-001–006 pass **with disclosed synthetic line**; RC-003 passes **because** of the plug, not because TB classifications naturally balance on the BS face.

### Required for external / audit sign-off

| Requirement | Owner |
|-------------|--------|
| Partner review of **1301010011 / 2302010009** (ROU) classification | Audit team |
| Confirm **2404010001** RE policy (partial vs full year) with client | Audit team |
| Mapping workbook sign-off for **3101020005 / 3101070021** (zakat/finance) | Operator |
| Decision: extend COA vs accept **residual plug ≤ 5M SAR** with disclosure note | Product / partner |
| FS disclosure note: *“Classification adjustment to align mapped TB with balance sheet equation; subject to review”* | Reporting |

### Recommended disclosure (draft)

> **TB Closing Classification Adjustments (SAR 16,427,399):** Mechanical equity classification line required because year-end trial balance equity accounts (retained earnings and reserves) do not fully reconcile mapped balance sheet assets and liabilities under the pilot canonical chart of accounts. Primary drivers are misclassification of right-of-use assets, long-term borrowings, and accrued liabilities, and zakat/finance accounts mapped to liability canonical codes. This is **not** a client-approved journal entry. **Human review required.**

---

## 9. Pilot Gate Recommendation

| Criterion | Status |
|-----------|--------|
| RC-001 – RC-006 pass | ✅ |
| TB trusted | ✅ |
| 578 / 578 mapped | ✅ |
| Plug fully explained | ✅ (this document) |
| Plug eliminated | ❌ (~4.1M residual after fixes) |
| Safe for **external** factory sign-off | ⚠️ **Conditional** — disclose plug + fix nine mappings first |
| Safe for **internal** factory / demo pilot | ✅ with disclosure |

**Recommendation:** **Profile B pilot readiness** — factory pipeline operational on real TB; **hold L5 external sign-off** until mapping remediation on the nine accounts and partner review of ROU / long-term debt treatment.

---

## 10. Evidence & Reproduction

| Artifact | Path |
|----------|------|
| Analysis JSON | `docs/audits/evidence/tb-closing-adjustment-analysis.json` |
| Analysis script (read-only) | `scripts/tb-closing-adjustment-analysis.mjs` |
| Reconciliation output | `npx tsx -r ./scripts/mock-server-only.cjs scripts/recon-debug.mjs` |
| Cross-class detail | `scripts/recon-rc002-detail.mjs` |
| Source TB | `TB 31-12-2025 Final.xlsx` (user Downloads) |

---

## Appendix A — Balance Sheet Bridge

```
Total assets (mapped)                    348,579,752.85
Less: Total liabilities (mapped)       − 244,650,483.47
                                         ───────────────
Implied equity required                  103,929,269.38

Less: Equity core from TB mappings     −  87,501,870.46
  Share capital                           42,000,000.00
  General reserve                            150,000.00
  Actuarial reserve                          552,969.00
  Retained earnings                       44,798,901.46

TB Closing Classification Adjustments       16,427,398.92
                                         ───────────────
TOTAL LIABILITIES AND EQUITY             348,579,752.85  ✓
```

---

*Analysis only — no application code modified per pilot gate review instructions.*
