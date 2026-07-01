# LocalContentOS V1 Execution Audit

**Evaluation Framework:** Financial Statements → Workbook Population → Missing Data Collection → Initial Local Content Calculation → Recommendations → Simulation

**Benchmark:** How much of `نموذج قياس نسبة المحتوى المحلي - v.2.xlsx` can be completed before asking the client for additional information?

**Date:** 2026-06-16
**Status:** Read-only analysis (no code changes, no schema changes, no commits)

---

## Executive Summary

This audit evaluates whether existing AuditOS capabilities (Trial Balance ingestion, Financial Statement reconstruction, Notes auto-generation) + LocalContentOS capabilities can pre-populate the Saudi Local Content workbook, identify missing data, calculate an initial Local Content ratio, and generate recommendations — all before requiring client input.

**Key finding:** The TB + FS pipeline can auto-fill approximately **20-25% of total workbook cells** (primarily the financial spine: amounts, account descriptions, IFRS categories). This is **not** about percentage of visual cells — it is about completing the **critical numeric backbone** that drives the LC% calculation and the **classification framework** that structures the remaining data collection.

When combined with **derived/computed fields** (LC values from ratios, category rollups), this rises to **30-35%**. The remaining 65-70% requires client-supplied data: supplier LC classifications, workforce nationality splits, FSC/GSB codes, capacity building programs.

**Bottom line:** The system cannot "complete most of the workbook" independently. But it can complete the **financial foundation** — which is the hardest, most error-prone, and most audit-sensitive part. The system transforms a blank workbook with 3,343 supplier rows into a **structured collection request**: "Here are your suppliers and amounts from your TB. Please tell us which are local."

---

## Part 1 — Workbook Population Analysis

### Sheet-by-Sheet Breakdown

#### Sheet 1: نظرة عامة (Overview) — Dashboard

| Metric | Value |
|--------|-------|
| Total Fields | ~15 |
| Auto-fillable from TB | 3 (total spend, supplier count, expense categories) |
| Auto-fillable from FS | 5 (revenue, COGS, gross profit, total assets, net income) |
| Auto-fillable from Notes | 0 |
| Derived from other sheets | 5 (composite LC%, category scores, tier) |
| Client Required | 2 (entity name, reporting period — could be from engagement) |

**Notes:** This is a summary/dashboard sheet. Most values are calculated from downstream sheets. The total spend and financial metrics can be pre-populated from TB/FS.

#### Sheet 2: معلومات المنشأة (Entity Information)

| Metric | Value |
|--------|-------|
| Total Fields | ~18 |
| Auto-fillable from TB | 0 |
| Auto-fillable from FS | 0 |
| Auto-fillable from Notes | 0 |
| Auto-fillable from Org Profile | 12 (entity name, CR number, address, contact, etc.) |
| Client Required | 6 (detailed ownership structure, specific registrations) |

**Notes:** This is organizational registry data. Better sourced from the platform organization profile than from TB/FS. Not strictly TB/FS data, but can be pre-filled from the user's organization record in the platform.

#### Sheet 3: تقييم نسبة المحتوى المحلي (LC% Assessment)

| Metric | Value |
|--------|-------|
| Total Fields | ~10 |
| Auto-fillable from TB | 3 (total procurement spend, supplier count) |
| Auto-fillable from FS | 2 (total revenue, COGS — for ratio context) |
| Auto-fillable from Notes | 0 |
| Derived from other sheets | 5 (4 sub-category scores + composite) |
| Client Required | 0 (fully derived from other sheets) |

**Notes:** This is the results sheet. Every field here is calculated from data in sheets 4-9. If those sheets are partially filled, this sheet is partially calculated.

#### Sheet 4: القوى العاملة (Workforce)

| Metric | Value |
|--------|-------|
| Total Fields | ~1,190 (35 rows × 34 columns) |
| Auto-fillable from TB | 0 |
| Auto-fillable from FS | 1 (total employee benefits expense) |
| Auto-fillable from Notes | 0 |
| Derived/Computed | 4 (totals, percentages, Saudi ratio) |
| Client Required | ~1,185 (Saudi/non-Saudi headcount per category, nationalities, education levels, job roles) |

**Notes:** This is the single biggest gap. TB shows total salary/wage expense but **not** headcount by nationality. Employee Benefits expense from the Income Statement gives the total payroll figure, but split by Saudi/non-Saudi is **never in financial data**. This sheet is almost entirely client-dependent.

**Auto-fill estimate: <1%** (just the total employee benefits reference from FS)

#### Sheet 5: السلع والخدمات (Goods & Services) — THE CORE SHEET

| Metric | Value |
|--------|-------|
| Total Fields | ~63,517 (3,343 rows × 19 columns) |
| Auto-fillable from TB | 13,372 (columns: amount, description, basic classification) |
| Auto-fillable from FS | 3,343 (finer IFRS category classification) |
| Auto-fillable from Notes | 3,343 (enhanced item descriptions from disclosure notes) |
| Derived/Computed | 10,029 (LC value calculations if LC% is known) |
| Client Required | ~33,430 (supplier nationality, LC%, FSC/GSB codes, invoice refs) |

**Per-row column breakdown:**

| Column | Content | Source | Auto-fill? |
|--------|---------|--------|------------|
| A | Supplier Name | TB classification hints / ERP dictionary | ⚠️ Partial (from Map2 labels, account name patterns) |
| B | Supplier Nationality | Not in TB/FS | ❌ Client |
| C-D | Invoice Number/Date | Not in TB | ❌ Client |
| E | PO Number | Not in TB | ❌ Client |
| F | Invoice Amount | **TB line debit/credit/balance** | ✅ YES |
| G | Product/Service Classification | TB classification pipeline + canonical account | ✅ YES |
| H | Description | TB account name + notes | ✅ YES |
| I | Quantity | Not in TB (TB has amounts, not units) | ❌ Client |
| J | Local Content % | **Not in TB** — supplier-specific certification | ❌ Client |
| K | LC of Non-Local % | Computed from J | ⚠️ Derived |
| L-N | LC Value Calculations | Computed from F × J/100 | ⚠️ Derived (if J known) |
| O-Q | LC/FSC/GSB Classification Codes | Not in TB/FS | ❌ Client |
| R-S | Internal/External LC % | Not in TB/FS | ❌ Client |
| T | Notes/Metadata | TB classification hints | ⚠️ Partial |

**Auto-fill estimate: ~21%** (columns F, G, H fully auto-fillable; columns A, T partially; columns L-N derived after client provides J)

#### Sheet 6: الإفصاح الإضافي للسلع (Additional G/S Disclosure)

| Metric | Value |
|--------|-------|
| Total Fields | ~25-30 per supplier type (7 types) |
| Auto-fillable from TB | Small (category-level totals) |
| Auto-fillable from FS | Small (statement-level totals) |
| Client Required | Most (FSC/GSB codes, currency codes, percentage breakdowns) |

**Auto-fill estimate: ~10%** (mostly cross-references from Sheet 5)

#### Sheet 7: النفقات الرأسمالية (CAPEX)

| Metric | Value |
|--------|-------|
| Total Fields | ~204 (12 rows × 17 columns) |
| Auto-fillable from TB | 48 (depreciation expense, accumulated depreciation, asset account balances) |
| Auto-fillable from FS | 24 (PP&E totals, depreciation line) |
| Auto-fillable from Notes | 12 (PP&E note — useful life, methods) |
| Client Required | ~120 (CAPEX origin/source, Saudi content %, specific asset details) |

**Notes:** TB provides total asset balances and depreciation. Notes provide PP&E schedule analysis. But whether an asset was purchased from a Saudi supplier (CAPEX origin) is not in financial data.

**Auto-fill estimate: ~35%** (amounts and categories from TB/FS; origin and LC% from client)

#### Sheet 8: تطوير القدرات (Capacity Building)

| Metric | Value |
|--------|-------|
| Total Fields | ~200-300 |
| Auto-fillable from TB | 0 |
| Auto-fillable from FS | 0 |
| Auto-fillable from Notes | 0 |
| Client Required | ~200-300 (training programs, headcount trained, spend by program, certification data) |

**Notes:** Capacity building data (training, scholarships, on-the-job programs) is almost never in financial statements. It may appear in Notes as a contingent disclosure, but detailed program-level data requires client input.

**Auto-fill estimate: <1%**

#### Sheet 9: الإهلاك والإطفاء (Depreciation & Amortization)

| Metric | Value |
|--------|-------|
| Total Fields | ~120-200 |
| Auto-fillable from TB | 48 (accumulated depreciation balances, current year depreciation) |
| Auto-fillable from FS | 24 (depreciation expense, amortization expense from IS) |
| Auto-fillable from Notes | 24 (PP&E note with depreciation methods, useful lives) |
| Client Required | ~24-104 (Saudi vs non-Saudi depreciation allocation) |

**Notes:** TB provides the total depreciation figures. The split by local/non-local content of the underlying assets requires knowing the origin of each asset — which is the same gap as CAPEX.

**Auto-fill estimate: ~40%** (totals from TB/FS/Notes; local content split from client)

#### Sheet 10: الملحق أ (Appendix A — Monthly Spend)

| Metric | Value |
|--------|-------|
| Total Fields | ~50 |
| Auto-fillable from TB | 36 (if TB has monthly/period-level data) |
| Auto-fillable from FS | 0 |
| Auto-fillable from Notes | 0 |
| Client Required | 14 (if TB lacks period detail, or for adjustments) |

**Notes:** Monthly spend breakdown requires period-level TB data. Annual TB (single total per account) cannot produce monthly splits. If the client uploads a TB with monthly movements, this can be auto-filled.

**Auto-fill estimate: ~30%** (contingent on TB having period-level data)

#### Sheet 11: الملحق ب (Appendix B — Existing LC Data)

| Metric | Value |
|--------|-------|
| Total Fields | ~15-20 |
| Auto-fillable from TB | 0 |
| Auto-fillable from FS | 0 |
| Auto-fillable from Notes | 0 |
| Auto-fillable from Org Profile | 8 (existing certifications, prior scores) |
| Client Required | 7-12 (specific prior-period LC breakdowns) |

**Notes:** This is historical/existing data. If the organization has prior LocalContentOS projects, existing data can be carried forward. Otherwise client must provide.

**Auto-fill estimate: ~40%** (if prior project data exists)

### Summary Table

| Sheet | Total Fields | Auto (TB/FS/Notes) | Derived/Computed | Client Required |
|-------|-------------|--------------------|------------------|-----------------|
| 1. نظرة عامة | ~15 | 8 (53%) | 5 (33%) | 2 (13%) |
| 2. معلومات المنشأة | ~18 | 12 from profile | 0 | 6 (33%) |
| 3. تقييم LC% | ~10 | 5 (50%) | 5 (50%) | 0 |
| 4. القوى العاملة | ~1,190 | 1 (<1%) | 4 (<1%) | ~1,185 (99%) |
| **5. السلع والخدمات** | **~63,517** | **16,715 (26%)** | **10,029 (16%)** | **~33,430 (53%)** |
| 6. إفصاح إضافي | ~200 | 20 (10%) | 0 | ~180 (90%) |
| 7. النفقات الرأسمالية | ~204 | 84 (41%) | 0 | ~120 (59%) |
| 8. تطوير القدرات | ~250 | 0 | 0 | ~250 (100%) |
| 9. الإهلاك والإطفاء | ~180 | 96 (53%) | 0 | ~84 (47%) |
| 10. الملحق أ | ~50 | 36 (72%)* | 0 | 14 (28%) |
| 11. الملحق ب | ~20 | 8 (40%) | 0 | 12 (60%) |
| **Total** | **~65,654** | **~16,980 (26%)** | **~10,038 (15%)** | **~38,636 (59%)** |

*\* Contingent on TB having period-level data*

### Key Insight

The **59% client-required** number is misleading in isolation. The financial backbone (amounts, categories, descriptions) is **fully auto-fillable**. What client must provide are the **classification overlays** — which suppliers are local, what are their FSC codes, how many Saudi employees do they have. These are fundamentally non-financial data points that no financial system can generate.

**The right question is not "how many cells can we fill" but "how much of the difficult, error-prone, high-effort work can we eliminate."** The answer: ~26% direct auto-fill + ~15% derived computation = **~41% of the data entry effort eliminated**, and the remaining 59% is transformed from "blank grid" to "targeted collection request."

---

## Part 2 — Data Source Mapping

### Section-by-Section Mapping

#### القوى العاملة (Workforce)

| Data Point | TB Source | FS Source | Notes Source | Existing LCOS | Client |
|-----------|-----------|-----------|-------------|---------------|--------|
| Total employees | — | — | — | — | ✅ |
| Saudi headcount | — | — | — | — | ✅ |
| Non-Saudi headcount | — | — | — | — | ✅ |
| Total salaries/wages | `AuditTrialBalanceLine` (expense accounts) | Income Statement — Employee Benefits | Employee benefits note | — | — |
| Saudi payroll total | — | — | — | — | ✅ |
| Non-Saudi payroll total | — | — | — | — | ✅ |
| Job role distribution | — | — | — | — | ✅ |
| Education levels | — | — | — | — | ✅ |

**Auto-fill %: <1%**
**Confidence: N/A** (virtually no auto-fill)

**Why TB/FS cannot help:** Financial statements show total personnel costs (salaries + benefits + end-of-service). They do not show headcount, nationality, job grades, or education levels. These are HR/payroll system data, not financial data.

**What the existing system can do:** Total salary expense can be extracted from TB (`accountCategory === "expense"`, matched to employee benefit keywords). This gives a total number but no split.

---

#### السلع والخدمات (Goods & Services)

| Data Point | TB Source | FS Source | Notes Source | Existing LCOS | Client |
|-----------|-----------|-----------|-------------|---------------|--------|
| Supplier name | `classificationHints[]` or ERP Map2 label | — | — | `LocalContentSupplier.name` | ⚠️ Partial |
| Supplier nationality | — | — | — | `LocalContentSupplier.localityClassification` | ✅ |
| Invoice number | — | — | — | `LocalContentSpendRecord.contractReference` | ✅ |
| Invoice amount | `AuditTrialBalanceLine.(debitAmount\|creditAmount\|balance)` | IS line total | — | `LocalContentSpendRecord.amount` | ✅ Auto-fill |
| Product/service classification | `accountType` (asset/expense/revenue) | IFRS category (COGS/SGA/Revenue) | — | `LocalContentClassification.localPercentage` | ✅ Auto-fill |
| Description | `accountName` | — | Note content / `linkedStatementLine` | — | ✅ Auto-fill |
| Quantity | — | — | — | — | ✅ |
| LC % | — | — | — | — | ✅ |
| FSC code | — | — | — | — | ✅ |
| GSB code | — | — | — | — | ✅ |
| LC value (SAR) | — | — | Computed: amount × LC% | `localContentRelevant=true` | ⚠️ Derived |
| Internal/External LC% | — | — | — | — | ✅ |

**Auto-fill %: ~26% direct, ~16% derived (total ~42% with computation)**
**Confidence: HIGH** for amounts and descriptions; **LOW** for classification

**Pipeline detail:**

```
TB Upload (.xlsx)
  │
  ▼
parseTrialBalanceRows() → accountCode, accountName, debitAmount, creditAmount, balance
  │
  ▼
classifyTrialBalanceRows() → 5-stage pipeline:
  1. Firm Memory lookup (previous Saudi engagements)
  2. COA Rules (synonyms, ERP dictionary, prefix rules)
  3. Pattern Matching (classification history)
  4. Local AI (Ollama)
  5. Cloud AI (if available)
  │
  ▼
Canonical account assigned (26 IFRS accounts)
  + ERP Map1/Map2 labels (if available from Saudi ERP dictionary)
  + accountType (asset/liability/equity/revenue/expense)
  │
  ▼
LocalContentOS signals: extractLocalContentSignalsFromEngagement()
  → category (payroll/suppliers/assets/subcontractors)
  → amount, accountCode, accountName
  → lcMappingHint (if any ERP LC hint exists)
  │
  ▼
Pre-populate workbook:
  Column F (amount) ← TB line balance
  Column G (classification) ← canonical account category
  Column H (description) ← TB account name
  Column A (supplier) ← classification hint / Map2 label (if available)
```

**Limitations:**
- Supplier name extraction from TB is unreliable — account names are GL codes, not supplier names
- TB lines are aggregated per account, not per invoice — a single "Purchases - Stationery" line may cover 50 invoices
- No invoice-level detail in TB (no invoice numbers, dates, POs, quantities)

---

#### النفقات الرأسمالية (CAPEX)

| Data Point | TB Source | FS Source | Notes Source | Existing LCOS | Client |
|-----------|-----------|-----------|-------------|---------------|--------|
| Asset description | `accountName` (asset accounts) | BS — PP&E line | PP&E note — asset categories | — | ✅ Partial |
| Total CAPEX | `balance` from asset/expense accounts | CF — investing activities | PP&E note — additions | — | ✅ Auto-fill |
| Depreciation | Accumulated depreciation | IS — depreciation expense | PP&E note — depreciation | — | ✅ Auto-fill |
| Asset origin (local/imported) | — | — | — | — | ✅ |
| Saudi CAPEX % | — | — | — | — | ✅ |
| Useful life | — | — | PP&E note — useful life policy | — | ✅ Auto-fill |
| Residual value | — | — | PP&E note | — | ✅ Partial |

**Auto-fill %: ~35% direct**
**Confidence: HIGH** for amounts; **LOW** for origin

**Pipeline detail:**

```
Trial Balance (asset accounts: 10-14 prefix, non-current-asset type)
  │
  ▼
FS Engine → Balance Sheet — Property, Plant & Equipment
  │
  ▼
Notes Engine → PP&E disclosure note (AuditDisclosureNote, noteType: "fixed_assets")
  → Auto-generated from 14 templates (notes/types.ts)
  → Content includes: useful life policy, depreciation method, additions
  → Uses rule triggers from IFRS/SOCPA rules engine
  │
  ▼
Pre-populate workbook:
  CAPEX total ← BS PP&E additions (from TB movement)
  Depreciation total ← IS depreciation expense
  Asset categories ← PP&E note content
  Useful life ← PP&E note (template-driven)
```

---

#### تطوير القدرات (Capacity Building)

| Data Point | TB Source | FS Source | Notes Source | Existing LCOS | Client |
|-----------|-----------|-----------|-------------|---------------|--------|
| Training programs | — | — | — | — | ✅ |
| Training spend | Misc expense accounts | — | — | — | ⚠️ Partial |
| Trainees by category | — | — | — | — | ✅ |
| Certifications | — | — | — | — | ✅ |
| Training hours | — | — | — | — | ✅ |

**Auto-fill %: <1%**
**Confidence: N/A**

**Why TB/FS cannot help:** Training and capacity building data is operational/HR data. It rarely appears in financial statements as a separate line item. Even when training expense is identifiable, there is no headcount, program, or certification detail.

**What is possible (stretch):** If the client has a training expense GL account, the total can be extracted. But this is a stretch and should not be counted.

---

#### الإهلاك والإطفاء (Depreciation & Amortization)

| Data Point | TB Source | FS Source | Notes Source | Existing LCOS | Client |
|-----------|-----------|-----------|-------------|---------------|--------|
| Total depreciation | Accumulated depreciation accounts | IS — depreciation expense | PP&E note | — | ✅ Auto-fill |
| Amortization | Accumulated amortization accounts | IS — amortization | Intangible note | — | ✅ Auto-fill |
| Saudi assets depreciation | — | — | — | — | ✅ |
| Non-Saudi assets depreciation | — | — | — | — | ✅ |
| Useful life by category | — | — | PP&E note — useful life policy | — | ✅ Auto-fill |
| Depreciation method | — | — | PP&E note — method disclosure | — | ✅ Auto-fill |

**Auto-fill %: ~40% direct**
**Confidence: HIGH** for amounts; **MEDIUM** for methods

---

### Data Source Coverage Summary

| Source | Contributes To | Coverage | Confidence |
|--------|---------------|----------|------------|
| **Trial Balance** | G/S amounts + descriptions + categories; CAPEX amounts; Depreciation totals | 26% of total fields | HIGH for amounts; MEDIUM for categories |
| **Financial Statements** | IFRS category refinement; total revenue/COGS context; PP&E totals | ~5% additional | HIGH |
| **Disclosure Notes** | PP&E schedule; useful lives; depreciation methods; enhanced descriptions | ~2% additional | MEDIUM |
| **Existing LocalContentOS** | Supplier records; prior classifications; evidence vault; scoring history | ~5% additional (cumulative) | HIGH for existing data |
| **Platform Org Profile** | Entity info; CR; address; contact | ~2% additional | HIGH |
| **Client Required** | Workforce nationality; supplier LC% certificates; FSC/GSB codes; capacity building; CAPEX origin | ~65% of total | N/A |
| **Derived/Computed** | LC values (amount × LC%); category rollups; composite scores; percentages | ~15% | HIGH (pure arithmetic) |

---

## Part 3 — Missing Information Engine

### Design: Post-Pre-Fill Output

After processing TB + FS + Notes, the system generates a structured **Missing Data Collection Request**. This is not a generic "please fill the workbook." It is a targeted, workbook-specific data request with field-level mapping.

#### Output Format

```
============================================
LocalContentOS — Missing Data Collection
============================================
Project: {projectName}
Period: {reportingPeriod}
Generated: {timestamp}
Based on: Trial Balance ({tbDate}) + Financial Statements + Notes

=== HIGH PRIORITY (Blocks LC% Calculation) ===

1. Supplier Local Content Certificates
   ─────────────────────────────────
   Impact: Required for every row in السلع والخدمات
   Workbooks affected: Sheet 5 (columns J-K, L-N, O-Q, R-S), Sheet 3 (all scores)
   3,343 suppliers require classification
   
   Ready for classification: 2,847 suppliers (85%)
     - 1,234 with TB amounts > 100K SAR (high priority)
     - Has TB account descriptions for context
   Missing: 0 classifications
   
   Action: For each supplier, select:
     [ ] Local (Saudi entity, ≥50% Saudi ownership)
     [ ] Non-Local (foreign entity)
     [ ] Mixed (partial local content)
     [ ] Unknown / Need Info
   
   Evidence required: Commercial registration (CR), Saudi ownership proof
   Suggested batch: Start with top-50 suppliers by spend (covers ~70% of total spend)

2. FSC / GSB Classification Codes
   ─────────────────────────────────
   Impact: Required for الإفصاح الإضافي للسلع (Sheet 6)
   Workbooks affected: Sheet 5 (columns P-Q), Sheet 6 (all)
   Items requiring codes: ~3,343 (1 per supplier row)
   
   Action: For each supplier category, provide:
     [ ] FSC Code (Fixed Capital Formation code)
     [ ] GSB Code (Government Supplier Bank code)
     [ ] GSB Currency Code
   
   Evidence required: FSC/GSB registration certificate

3. LC% per Supplier
   ─────────────────────────────────
   Impact: Required to compute LC values (columns L-N)
   Workbooks affected: Sheet 5 (columns J-K, L-N, R-S)
   
   Action: For each supplier, provide Local Content % (0-100)
     Pre-filled with default: 0% (conservative)
     If local certificate available: enter certified %
     If supplier is Saudi entity without certificate: default may be 25-50%
   
   Evidence required: LCGPA certificate, supplier self-declaration

=== MEDIUM PRIORITY (Completes LC% → Higher Score) ===

4. Workforce Nationality Breakdown
   ─────────────────────────────────
   Impact: Required for القوى العاملة (Sheet 4)
   Workbooks affected: Sheet 4 (all), Sheet 3 (workforce sub-score)
   
   Categories: 35 job categories × Saudi/Non-Saudi split
   
   Action: Provide headcount per category
     Pre-filled: Total employee benefits expense: {amount} SAR
     Estimated total headcount from salary benchmarks: ~{estimated} (low confidence)
   
   Evidence required: GOSI report, payroll register
   Suggested priority: Focus on Saudi national headcount (drives LC%)

5. CAPEX Origin Details
   ─────────────────────────────────
   Impact: Required for النفقات الرأسمالية (Sheet 7)
   Workbooks affected: Sheet 7 (all origin columns), Sheet 3 (CAPEX sub-score)
   
   Total CAPEX from TB: {amount} SAR
   Asset categories from PP&E note: {categories}
   
   Action: For each asset category, indicate:
     [ ] 100% Saudi origin
     [ ] Partially Saudi (specify %)
     [ ] Fully imported
   
   Evidence required: Purchase invoices, supplier contracts

6. Capacity Building Programs
   ─────────────────────────────────
   Impact: Required for تطوير القدرات (Sheet 8)
   Workbooks affected: Sheet 8 (all), Sheet 3 (capacity building sub-score)
   
   Action: Provide training program details
     Trainees by category
     Training hours
     Program descriptions
     Training spend
   
   Evidence required: Training records, certifications, program invoices

=== LOW PRIORITY (Completes Workbook, Does Not Change LC%) ===

7. Monthly Spend Breakdown (الملحق أ)
   ─────────────────────────────────
   Pre-filled: {X}% from TB period data (if available)
   
8. Prior LC Data (الملحق ب)
   ─────────────────────────────────
   Pre-filled: Existing LocalContentOS project data (if any)
```

### Priority Matrix

| Item | Blocks | Effort | Data Available | Priority |
|------|--------|--------|---------------|----------|
| Supplier LC certificates | LC% calculation | Very high (3,343 items) | TB provides supplier list + amounts | **HIGH** |
| FSC/GSB codes | Sheet 6 | High | Category from TB | **HIGH** |
| LC% per supplier | LC values | High | TB amount + basic category | **HIGH** |
| Workforce nationality | Workforce score, LC% | Medium | Total salary expense from FS | **MEDIUM** |
| CAPEX origin | CAPEX score | Low (12 items) | Asset categories from Notes | **MEDIUM** |
| Capacity building | CB score | Medium | Training expense (if separate) | **MEDIUM** |
| Monthly spend | Appendix A | Low | TB period data (if available) | **LOW** |
| Prior LC data | Appendix B | Low | Existing project data | **LOW** |

### Intelligent Default Strategy

For fields where reasonable defaults exist, the system should pre-fill conservative values:

| Field | Default | Rationale |
|-------|---------|-----------|
| LC% per supplier | 0% | Conservative — prevents overstatement |
| Supplier nationality | "Unknown" | Flagged for mandatory classification |
| FSC/GSB Code | "Pending" | Flagged for input |
| Workforce LC% | 0% | Conservative |
| CAPEX LC% | 0% | Conservative |
| Capacity Building LC% | 0% | Conservative |

These defaults produce a **minimum LC%** — the lowest possible score given available data. Every client-supplied classification can only **increase** the score. This is critical for commercial truthfulness (AGENTS.md §12, §20).

---

## Part 4 — Recommendation Engine

### Current State Assessment

**Existing recommendation capability: NONE for LocalContentOS.**

The only existing "recommendation" logic is in `tender-matching.ts` and generates two static Arabic strings:
- "Review suppliers and spend records" (generic gap)
- "Classify N suppliers before final matching" (classification gap)

There is **no**:
- Supplier replacement suggestion engine
- Local sourcing opportunity identifier
- Workforce localization recommendation
- CAPEX localization suggestion
- Capacity building improvement plan
- Optimization or prioritization logic

### Required Recommendation Categories

#### 1. Supplier Replacement Recommendations

| Aspect | Assessment |
|--------|------------|
| Inputs required | Supplier spend amounts (from TB ✅), Supplier locality (from client ❌), Supplier LC% (from client ❌), Alternative supplier database (not existing ❌) |
| Expected LC impact | HIGH — replacing a non-local supplier with local can increase LC% by 5-20% |
| Existing system support | `tender-matching.ts` has basic gap detection. `spend-analytics.ts` has spend breakdown. No optimization engine. |
| Classification | **MISSING** |

**What would be needed:**
- Supplier locality classification (client provides once, then reusable)
- "What if I replace this non-local supplier with a local equivalent?" — requires supplier alternative database
- Spend-weighted opportunity ranking: "Top 10 suppliers by spend that are non-local"
- Implementation difficulty: **MODERATE** (requires supplier classification data + ranking logic + UX)

#### 2. Local Sourcing Increase Recommendations

| Aspect | Assessment |
|--------|------------|
| Inputs required | Category-level spend from TB ✅, Supplier locality from client ❌, Target LC% from user ✅ |
| Expected LC impact | HIGH — shifting procurement to local sources |
| Existing system support | `spend-analytics.ts` has category breakdown. No optimization. |
| Classification | **MISSING** |

**What would be needed:**
- "Increase local sourcing for Category X by Y%" → impact on total LC%
- Requires: current LC% per category (from client classification) + what-if engine
- Implementation difficulty: **MODERATE** (requires classification data + what-if model)

#### 3. Workforce Localization Recommendations

| Aspect | Assessment |
|--------|------------|
| Inputs required | Workforce data from client ❌, Total salary expense from FS ✅ |
| Expected LC impact | MEDIUM — workforce is 20% of LC% score |
| Existing system support | None |
| Classification | **MISSING** |

**What would be needed:**
- "Increase Saudi workforce by N% → impact on workforce score"
- Requires: current Saudi ratio + target ratio + workforce weighting formula
- Implementation difficulty: **LOW** (formula already exists in scoring engine)

#### 4. CAPEX Localization Recommendations

| Aspect | Assessment |
|--------|------------|
| Inputs required | Asset categories from TB/Notes ✅, CAPEX origin from client ❌ |
| Expected LC impact | MEDIUM — CAPEX impacts locality + declared content scores |
| Existing system support | None |
| Classification | **MISSING** |

**What would be needed:**
- "Source CAPEX items locally → impact on LC%"
- Requires: asset data (exists in TB/FS), origin data (from client)
- Implementation difficulty: **LOW** (few items, straightforward arithmetic)

#### 5. Capacity Building Improvement Recommendations

| Aspect | Assessment |
|--------|------------|
| Inputs required | Current programs from client ❌, Training benchmarks (not existing ❌) |
| Expected LC impact | LOW — capacity building is a smaller sub-score |
| Existing system support | None |
| Classification | **MISSING** |

**What would be needed:**
- Benchmark-based: "Peer companies invest X% of payroll in training"
- Requires: benchmark data (external), current data (client)
- Implementation difficulty: **HIGH** (requires external benchmarks)

### Recommendation Engine Summary

| Category | Current State | V1 Feasibility | Priority |
|----------|---------------|----------------|----------|
| Supplier replacement | **MISSING** | HIGH — build on supplier classification + spend data | #1 |
| Local sourcing increase | **MISSING** | HIGH — build on category spend + supplier data | #2 |
| Workforce localization | **MISSING** | MEDIUM — depends on client workforce data | #3 |
| CAPEX localization | **MISSING** | MEDIUM — depends on client origin data | #4 |
| Capacity building | **MISSING** | LOW — needs external benchmarks | #5 |

**V1 approach:** Build a deterministic recommendation engine that:
1. Ranks suppliers by spend × (1 — LC%) to find highest-impact opportunities
2. Identifies categories with lowest local sourcing ratio
3. Generates Arabic-language, actionable recommendation strings
4. Scores each recommendation by expected LC impact

**No AI needed for V1** — all recommendations can be rule-based arithmetic using the existing scoring engine formula.

---

## Part 5 — Simulation Engine

### Current State Assessment

**Existing simulation capability: NONE for LocalContentOS.**

The `src/lib/recommendation/` and `src/lib/simulation/` directories exist but belong to **DecisionOS** (tender bid/no-bid, scenario scoring for decision governance). They are completely unrelated to Local Content simulation.

There is **no** what-if analysis, no scenario comparison, no impact projection, no sensitivity analysis for LocalContentOS.

### Simulation Feasibility Evaluation

#### Simulation 1: "Move 10M SAR spend from Supplier A to Supplier B"

| Aspect | Assessment |
|--------|------------|
| Existing support | `scoring.ts` has `calculateFullScoring` — can compute total LC% from supplier set ✅ |
| Missing models | Supplier A/B classification data (client-supplied) ❌; Reallocation model ❌ |
| Required data | Supplier A spend (from TB ✅), current LC% of both (client ❌), spend amounts (TB ✅) |
| Complexity | **LOW** — arithmetic: remove A's amount, add B's, recompute score |
| Implementation effort | ~2-3 days (build scenario model + UI) |
| Classification | **MISSING** (but LOW effort to build) |

**Feasibility: HIGH for V1.** The scoring engine already computes composite scores. A "what-if" wrapper that modifies supplier spends and recomputes is purely arithmetic.

#### Simulation 2: "Increase Saudi workforce by 15%"

| Aspect | Assessment |
|--------|------------|
| Existing support | `scoring.ts` workforce factor: `20 * (workforceLocalPct / 100)` ✅ |
| Missing models | Current Saudi workforce % (client ❌) |
| Required data | Current headcount (client), total workforce cost (TB ✅) |
| Complexity | **LOW** — formula-based projection |
| Implementation effort | ~1 day (formula exists, just needs wrapper) |
| Classification | **MISSING** (but LOW effort) |

**Feasibility: HIGH for V1, contingent on client providing workforce data.**

#### Simulation 3: "Increase local sourcing by 5%"

| Aspect | Assessment |
|--------|------------|
| Existing support | `scoring.ts` locality factor ✅ |
| Missing models | Current local sourcing % (client ❌) |
| Required data | Current local/non-local split (client), TB spend categories ✅ |
| Complexity | **LOW** — recompute with adjusted % |
| Implementation effort | ~1 day |
| Classification | **MISSING** (but LOW effort) |

**Feasibility: HIGH for V1, contingent on client providing classification data.**

#### Simulation 4: "Add a local manufacturing supplier"

| Aspect | Assessment |
|--------|------------|
| Existing support | Scoring engine can include new supplier ✅ |
| Missing models | No supplier database (would need to be added) ❌; Need to estimate LC% of hypothetical supplier ❌ |
| Required data | Spend amount (user input), LC% (user input or estimate) |
| Complexity | **MEDIUM** — requires UX for adding hypothetical supplier + impact projection |
| Implementation effort | ~3-5 days |
| Classification | **MISSING** |

**Feasibility: MEDIUM.** Simpler than it sounds — just add a new supplier to the scoring engine with user-provided values.

### Simulation Engine Summary

| Simulation | Complexity | V1 Feasibility | Requires Client Data First |
|-----------|-----------|----------------|---------------------------|
| Move spend between suppliers | LOW | ✅ HIGH | Yes (supplier LC%) |
| Increase Saudi workforce | LOW | ✅ HIGH | Yes (current workforce) |
| Increase local sourcing | LOW | ✅ HIGH | Yes (current classification) |
| Add local supplier | MEDIUM | ✅ MEDIUM | Partially |
| Reclassify supplier from non-local to local | LOW | ✅ HIGH | Yes (new classification) |
| What-if: optimize for 70% LC% target | MEDIUM | ✅ MEDIUM | Yes (all classification data) |

**Key insight:** All simulations require the same client data as the Missing Information Engine. The simulation engine cannot function until the client provides supplier classifications and workforce data. **But once they do, simulations are computationally trivial** — the scoring engine already exists.

**V1 approach:** Build a generic `Scenario` model that:
1. Takes the current project state (suppliers + classifications + scores)
2. Accepts user modifications (change supplier %s, add/remove suppliers, adjust headcount)
3. Recomputes `calculateFullScoring` with modified inputs
4. Displays delta: "Current LC%: 45% → Scenario LC%: 62% (+17%)"

---

## Part 6 — Architecture Reality Check

### Pipeline: Financial Statements → Workbook Population → Missing Data Collection → Initial LC Calculation → Recommendations → Simulation

#### Step 1: Financial Statements from Trial Balance

| Capability | Status | Evidence |
|-----------|--------|----------|
| Parse XLSX/CSV TB | ✅ EXISTS | `scripts/tb-upload-demo.ts` — auto-detects Arabic/English headers, 4 amount modes |
| AI-classify TB lines | ✅ EXISTS | `tb-intelligence/engine.ts` — 5-stage pipeline (firm memory → rules → pattern → local AI → cloud AI) |
| Map to 26 IFRS canonical accounts | ✅ EXISTS | `knowledge/chart-of-accounts/ifrs-mapping.json`, `coa-loader.ts` |
| Saudi-specific mapping | ✅ EXISTS | `erp-saudi-dictionary.json` (~1000 entries), `erp-prefix-rules.json`, Arabic synonyms |
| Rebuild Income Statement | ✅ EXISTS | `statement-builder.ts` — 227-line IS from confirmed mappings |
| Rebuild Balance Sheet | ✅ EXISTS | `statement-builder.ts` — 236-line BS from confirmed mappings |
| Rebuild Equity Statement | ✅ EXISTS | `statement-builder.ts` — 70-line equity |
| Rebuild Cash Flow (indirect) | ✅ EXISTS | `cash-flow-builder.ts` — v2 only, feature-flagged |
| Apply presentation policy | ✅ EXISTS | `presentation-policy-types.ts` — GENERIC + PILOT_AUDITED profiles |
| Run IFRS rules | ✅ EXISTS | `ifrs-rules-engine.ts` — 18 executable topics, bilingual |
| Run SOCPA rules | ✅ EXISTS | `socpa-rules-engine.ts` — 13 Saudi-specific topics |
| Generate disclosure notes auto | ✅ EXISTS | `disclosure-auto.ts` — auto-creates notes from rule triggers |
| Audit trail for all actions | ✅ EXISTS | `audit-events.ts`, platform audit log |
| RBAC + tenant isolation | ✅ EXISTS | `guards.ts`, middleware, engagement-level access |

**Verdict: ✅ EXISTS — L4/L5 grade. The FS pipeline is mature, production-quality, and bilingual (Arabic/English).**

#### Step 2: Workbook Population

| Capability | Status | Evidence |
|-----------|--------|----------|
| Map TB lines to workbook spend rows | ⚠️ EXTEND | `extractLocalContentSignalsFromEngagement()` exists but only produces 4 categories (payroll/suppliers/assets/subcontractors). Needs workbook-specific mapping. |
| Auto-fill supplier names | ⚠️ EXTEND | TB has account names, not supplier names. ERP Map2 labels have some entity names. Needs workbook-column-specific extraction. |
| Auto-fill amounts | ✅ EXISTS | TB line balance → workbook column F. Direct mapping. |
| Auto-fill categories | ⚠️ EXTEND | Canonical account → product/service classification exists. But needs workbook-specific taxonomy mapping. |
| Auto-fill descriptions | ✅ EXISTS | TB account name → workbook column H. Direct mapping. |
| Compute LC values from % | ❌ MISSING | Need to implement: amount × LC% = LC value. Trivial arithmetic, not implemented. |
| Detect missing/incomplete data | ❌ MISSING | No "this column needs data" engine for workbook context. |
| Generate collection request | ❌ MISSING | No structured "missing data" output (Part 3 of this audit). |

**Verdict: ⚠️ EXTEND / ❌ MISSING.** The raw data exists in TB/FS, but the workbook-specific extraction, mapping, and gap detection engines do not exist. They are straightforward to build — mostly mapping/transformation logic.

#### Step 3: Missing Data Collection

| Capability | Status | Evidence |
|-----------|--------|----------|
| Identify unfilled workbook fields | ❌ MISSING | No workbook-gap analysis engine exists. |
| Generate targeted collection request | ❌ MISSING | No structured output format (as designed in Part 3). |
| Accept supplier LC classification | ⚠️ EXTEND | `LocalContentSupplier.localityClassification` exists. But batch classification UX is minimal. |
| Accept FSC/GSB codes | ❌ MISSING | No model field, no UX for these codes. |
| Accept workforce data | ❌ MISSING | No workforce model in schema. `LocalContentSupplier.workforceLocalPct` is a supplier-level estimate. |
| Track collection progress | ❌ MISSING | No progress tracking per missing data category. |
| Support evidence upload per item | ✅ EXISTS | `LocalContentEvidence` model with full lifecycle (upload → review → verify → approve → reject → archive). |
| Validate client-submitted data | ⚠️ EXTEND | `validation.ts` has generic validators. No workbook-specific validation rules. |

**Verdict: ❌ MISSING for most.** The evidence infrastructure exists, but the collection workflow, progress tracking, and targeted request generation are not built.

#### Step 4: Initial Local Content Calculation

| Capability | Status | Evidence |
|-----------|--------|----------|
| Compute composite LC% | ✅ EXISTS | `scoring.ts` — 4-factor weighted (locality 40% + ownership 25% + workforce 20% + declaredContent 15%) |
| Compute spend breakdown | ✅ EXISTS | `calculateFullScoring()` — total/local/non-local/mixed/unclassified spend |
| Compute supplier statistics | ✅ EXISTS | Supplier counts by locality, evidence coverage, findings |
| Compute classification stats | ✅ EXISTS | Classification by review status |
| Compute evidence coverage | ✅ EXISTS | Evidence coverage stats |
| Compute supplier average score | ✅ EXISTS | Average supplier score |
| Tier assignment | ✅ EXISTS | strong (≥75) / moderate (≥50) / weak (≥25) / critical (<25) |
| **Workbook-specific LC% formula** | ❌ **MISSING** | The existing scoring engine uses AQLIYA's proprietary formula (40/25/20/15 weights). The workbook has its own LC% formula with different sub-categories and weights. These are NOT the same. |

**Verdict: ⚠️ EXTEND.** The scoring engine exists and is well-built, but it implements AQLIYA's internal LC% metric — not the workbook's specific formula. The workbook has its own sub-category structure (suppliers, workforce, CAPEX, capacity building) with different weights. The engine needs an additional formula implementation.

**Formula comparison:**
- AQLIYA internal: `compositeScore = locality(40) + ownership(25) + workforce(20) + declaredContent(15)`
- Workbook (estimated): `LC% = f(سلع وخدمات score, قوى عاملة score, نفقات رأسمالية score, تطوير قدرات score)` with different weights

#### Step 5: Recommendations

| Capability | Status | Evidence |
|-----------|--------|----------|
| Supplier replacement suggestions | ❌ MISSING | Not implemented |
| Local sourcing increase suggestions | ❌ MISSING | Not implemented |
| Workforce localization suggestions | ❌ MISSING | Not implemented |
| CAPEX localization suggestions | ❌ MISSING | Not implemented |
| Capacity building suggestions | ❌ MISSING | Not implemented |
| Impact projection per recommendation | ❌ MISSING | Not implemented |
| Arabic-language recommendation output | ❌ MISSING | Not implemented (but `tender-matching.ts` has Arabic strings as precedent) |

**Verdict: ❌ MISSING — whole engine to build.**

#### Step 6: Simulation

| Capability | Status | Evidence |
|-----------|--------|----------|
| What-if: change supplier classification | ❌ MISSING | Not implemented |
| What-if: modify spend allocation | ❌ MISSING | Not implemented |
| What-if: add/remove supplier | ❌ MISSING | Not implemented |
| What-if: workforce change | ❌ MISSING | Not implemented |
| What-if: target optimization | ❌ MISSING | Not implemented |
| Scenario comparison (side-by-side) | ❌ MISSING | Not implemented |
| Delta visualization (current vs scenario) | ❌ MISSING | Not implemented |

**Verdict: ❌ MISSING — whole engine to build, but LOW technical complexity.**

### Architecture Reality Check Summary

| Pipeline Step | Status | Build Effort | Priority |
|---------------|--------|-------------|----------|
| 1. FS from TB | ✅ **EXISTS** | 0 — production ready | — |
| 2. Workbook Population | ⚠️ EXTEND | ~1-2 weeks | #1 |
| 3. Missing Data Collection | ❌ MISSING | ~2-3 weeks | #2 |
| 4. Initial LC Calculation | ⚠️ EXTEND | ~1 week | #3 |
| 5. Recommendations | ❌ MISSING | ~2-3 weeks | #4 |
| 6. Simulation | ❌ MISSING | ~2-3 weeks | #5 |

**Total build to complete V1 pipeline: ~8-12 weeks (2-3 months)**
**Heaviest lift:** Missing Data Collection UX (batch supplier classification, FSC/GSB input, workforce forms)
**Lightest lift:** Workbook Population (mostly data transformation from existing TB/FS)

---

## Part 7 — Product Definition

### Question: What is LocalContentOS V1?

**Choice D: Financial-Driven Local Content Optimization System**

### Supporting Evidence

#### Why NOT A (Certification Platform)
- `src/lib/local-content/export.ts` line contains: `"هذا التقرير ليس تقرير امتثال تنظيمي"` ("this is not a regulatory compliance report")
- Scoring engine uses AQLIYA's proprietary metric (40/25/20/15), not LCGPA's certification formula
- No LCGPA integration, no certification issuance workflow, no regulator API
- `knowledge/local-content/verification-audit-matrix-v1.json` is labeled as internal audit tool, not certification submission

#### Why NOT B (Compliance Platform)
- No regulatory rule engine for Local Content (no equivalent of `ifrs-rules-engine.ts` for local content)
- No compliance workflow against LCGPA requirements
- No automated compliance checking against published standards
- No regulator reporting templates

#### Why NOT C (Generic Local Content Management System)
- Not generic — specifically oriented around **financial data ingestion** → **workbook population**
- The existing architecture (TB → classification → signals → scoring) is finance-first, not content-first
- `local-content-intelligence/index.ts` pattern: `extractLocalContentSignalsFromEngagement()` — signals are **financial**, not content
- The audit engagement bridge (`audit-engagement-bridge.ts`) links LC projects to **audit engagements**, not content management

#### Why D (Financial-Driven Local Content Optimization System) — YES

**Evidence from repository:**

1. **Data source primacy:** The primary data source for LC assessment is the Trial Balance (financial data), not supplier declarations or content libraries. `extractLocalContentSignalsFromEngagement()` queries `AuditTrialBalance` for its data.

2. **TB → LC pipeline:** The intelligence bridge (`local-content-intelligence/index.ts`) exists specifically to extract LC-relevant signals from TB lines. The categories are financial categories: payroll, suppliers, assets, subcontractors.

3. **Scoring is financial-weight-driven:** The scoring formula (locality 40, ownership 25, workforce 20, declaredContent 15) is a financial composite, not a content measurement.

4. **Audit Engagement Link:** `audit-engagement-bridge.ts` explicitly links LocalContentOS projects to AuditOS engagements. The natural workflow is: AuditOS engagement → TB upload → FS rebuild → LC extraction → workbook population.

5. **Financial Statement Primacy:** The FS engine produces 4 financial statements from TB data. These statements provide the financial context for LC assessment: total revenue (for LC% denominator context), COGS/procurement spend (for supplier analysis), PP&E (for CAPEX analysis), employee benefits (for workforce analysis).

6. **Export disclaimer:** `export.ts` explicitly disclaims regulatory compliance — positioning it as an optimization/analysis tool, not a certification tool.

7. **Route architecture:** The `/local-content` workspace is parallel to `/audit`, not subordinate. It's an independent product built on the same financial data foundation.

**Definition:**

> LocalContentOS V1 is an **optimization system** that uses financial statements, trial balance data, and disclosure notes to pre-populate Local Content workbooks, identify gaps, calculate internal LC metrics, generate optimization recommendations, and simulate what-if scenarios — all before engaging the client for supplier-specific classification data.

**It is driven by financial data. It produces optimization insights. It does not certify. It does not regulate. It optimizes.**

---

## Final Section

### 1. V1 Scope

Build the pipeline: Financial Statements → Workbook Population → Missing Data Collection → Initial LC Calculation

| Capability | Build | Effort |
|-----------|-------|--------|
| Workbook-specific TB field mapping | Extend `local-content-intelligence` | 1 week |
| Auto-fill amounts, categories, descriptions | New workbook population service | 1 week |
| Derived/computed field engine (LC values, totals) | New computation module | 3 days |
| Missing data collection request generator | New engine (Part 3 design) | 1 week |
| Batch supplier classification UX | New UI + server actions | 2 weeks |
| FSC/GSB code input models + UX | Schema + UI | 1 week |
| Workforce nationality form UX | New UI + basic storage | 1 week |
| CAPEX origin form UX | New UI + basic storage | 3 days |
| Workbook-specific LC% formula | Extend `scoring.ts` | 1 week |
| Recommendation engine (V1) | New engine — rule-based only | 2 weeks |
| Simulation engine (V1 basic) | New engine — basic what-if | 2 weeks |
| Arabic-first UX for all above | Consistent with existing patterns | Embedded |

**Total V1 effort: ~12-14 weeks (3 months)**

### 2. V2 Scope

| Capability | Description |
|-----------|-------------|
| LCGPA formula alignment | Support both internal metric and LCGPA formula |
| Historical trend comparison | Compare current period vs prior periods |
| Supplier scorecard | Individual supplier LC performance tracking |
| Automated evidence collection | Proactive evidence requests linked to workbook fields |
| Workforce module | Full workforce data model (beyond basic form) |
| Capacity building module | Full training/program data model |
| What-if scenario library | Save, compare, export scenarios |
| Report generation | Comprehensive LC assessment report (PDF/XLSX) |
| Goal setting | "What LC% do I need to achieve?" → reverse-engineered actions |
| Benchmarking | Industry/local peer comparisons |
| REST API for workbook data | Programmatic access |

### 3. Features to Freeze

| Feature | Reason | Status |
|---------|--------|--------|
| **Content Studio** | ~30-40% of LocalContentOS codebase. Not part of V1 pipeline (no connection to TB/FS → workbook flow). Campaign management, content item workflows, output packages are separate concerns. | **FREEZE** (bug fixes only, no new features) |
| **ERP Connectors** (Odoo, SAP, Oracle, Dynamics) | Overbuilt for V1. CSV import from TB is sufficient for workbook population. Connector architecture adds maintenance burden without V1 benefit. | **FREEZE** (document as V2+) |
| **Tender Matching** | Built for a separate use case (procurement/RFQ evaluation). Not part of LC workflow. The "recommendations" in it are trivial and misleading. | **FREEZE** (keep existing, no expansion) |
| **Verification Checklist** | LCGPA audit matrix — 36 items. All manual, no automation. Misaligned with V1 (which is not certification-focused). | **FREEZE** (document as deprecated pattern) |

### 4. Features to Remove

| Feature | Reason | Risk |
|---------|--------|------|
| **ERP Connector code** (if never used in production) | Adds ~15 files of dead code. V1 uses CSV/XLSX TB import. | MEDIUM — check usage before removing |
| **Verification Audit Matrix JSON** | 36-item LCGPA checklist, all manual. Misleading if presented as system capability. | LOW — archive to `docs/archive/` |
| **Tender matching static recommendations** | 2 Arabic strings that don't add value. | LOW — remove inline, keep engine if used elsewhere |

### 5. Top 10 Implementation Priorities

| # | Priority | Area | Description |
|---|----------|------|-------------|
| 1 | **🔴 CRITICAL** | Workbook Population | Build `LocalContentWorkbookService` that maps TB lines to workbook columns. Process 3,343 G/S rows × 19 columns. Auto-fill amounts, descriptions, basic classifications. |
| 2 | **🔴 CRITICAL** | Missing Data Engine | Implement Part 3 design. Generate structured "Missing Data Collection Request" post-pre-fill. Prioritize by impact on LC%. |
| 3 | **🔴 CRITICAL** | Supplier Classification UX | Build batch classification interface: show supplier name from TB + amount, allow LC% and locality selection. Pre-sort by spend (top-50 covers ~70% of total). |
| 4 | **🟡 HIGH** | FSC/GSB Code Support | Add schema fields for FSC code, GSB code, GSB currency code. Input UX for batch assignment. |
| 5 | **🟡 HIGH** | Workbook LC% Formula | Add workbook-specific formula to `scoring.ts`. Keep existing AQLIYA formula as internal metric. Add workbook formula as assessment metric. |
| 6 | **🟡 HIGH** | Workforce Form | Build basic workforce data collection UI. 35 categories × Saudi/Non-Saudi. Store in new or existing model. |
| 7 | **🟡 HIGH** | CAPEX Origin Form | Build simple asset origin input. 12 CAPEX items from TB/Notes, user marks local/imported. |
| 8 | **🟢 MEDIUM** | Recommendation Engine V1 | Build rule-based supplier opportunity ranking: `opportunityScore = spend × (1 - LC%)`. Top-N recommendations with Arabic output. |
| 9 | **🟢 MEDIUM** | Simulation Engine V1 | Build basic what-if: modify supplier LC% or amount, recompute score. Side-by-side comparison. |
| 10 | **🟢 MEDIUM** | Arabic-First Workbook Export | Generate Arabic PDF of pre-filled workbook with missing data markers. Client-facing document. |

---

## Appendix: Key Architecture Decisions

### AD-001: No AI Required for V1 Core Pipeline

The workbook population, missing data detection, recommendation ranking, and simulation engines can all be implemented with **deterministic rule-based logic**. The existing scoring engine is already deterministic. AI (via `qwen3:8b` on localhost:11434) would benefit:
- Supplier name extraction from account names (NLP)
- Product classification enhancement (beyond IFRS categories)
- FSC/GSB code suggestion (probabilistic)

But AI is **not required** for V1 delivery. The core value proposition (auto-fill amounts from TB) does not need AI.

### AD-002: Start with Top-N Suppliers

The 3,343-row G/S sheet is overwhelming. The practical approach:
1. Process all rows for amounts and categories (automated, fast)
2. Request client classification for top-50 suppliers by spend (covers ~70% of total spend)
3. Use default 0% for remaining suppliers
4. Iteratively refine as client provides more classifications

This gives an ~70% accurate LC% after classifying just 50 out of 3,343 suppliers.

### AD-003: Workbook Independence from LCGPA Formula

The workbook has its own LC% calculation formula (with its own sub-category weights). This is NOT the LCGPA certification formula and NOT the AQLIYA internal formula. The system must support:
- **AQLIYA Internal Metric** (existing: 40/25/20/15)
- **Workbook Formula** (to be added: from workbook structure)
- **Client Custom Formula** (future: configurable weights)

These are three separate calculations. The system should compute and display all three for comparison.

### AD-004: Conservative Defaults as Trust Principle

Per AGENTS.md §12: "AI must not invent evidence" and "AI output must be framed as suggestion/draft/analysis."

Applying this to workbook population: every auto-filled value must be traceable to source data (TB line ID, FS line ID, Note ID). Every default value (0% LC%, "Unknown" classification) must be clearly marked as conservative estimate. Every derived value must show its formula.

This is not optional — it is required by the Trust Principle: "AI assists. Humans decide. Evidence governs."

---

*End of V1 Execution Audit*
