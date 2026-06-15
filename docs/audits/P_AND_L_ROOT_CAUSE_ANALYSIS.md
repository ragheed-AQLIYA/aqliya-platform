# P&L Root Cause Analysis — Phase 9

**Engagement:** `eng-gulf-2025`  
**Source TB:** `TB 31-12-2025 Final.xlsx` (578 accounts)  
**Reference audited FS:** `Audited FSs 31-12-2025.pdf` (page 7 — Statement of Profit or Loss)  
**AuditOS export:** `docs/audits/evidence/factory-accuracy-auditos-export.json`  
**Machine evidence:** `docs/audits/evidence/p-and-l-root-cause-data.json` (all 222 IS GL lines)  
**Analysis date:** 2026-06-14  
**Mode:** Read-only diagnosis — **no code, mapping, COA, or schema changes**

---

## Executive Verdict

| Measure | SAR | Meaning |
|---------|-----|---------|
| **AuditOS Net Profit** | **926,038,529** | Sum of **TB closing-balance gross sides** on **canonical-mapped** accounts, using `getMappingDisplayAmount` |
| **Audited Net Profit** | **25,084,852** | Audited P&L for year ended 31-12-2025 |
| **Variance** | **+900,953,677** | **+3,592%** — material P&L failure |
| **True period result (TB IS slice)** | **25,084,856** | Sum of **signed** period movement / closing net on all 222 IS rows |
| **TB Closing Classification plug** | **25,084,856** | Equals audited net profit (±4 SAR) — equity bridge, not IS face |

**One-sentence root cause:** AuditOS reports **926M** because the FS engine **sums non-net closing debit/credit sides** on **mis-mapped accounts** (balance-sheet positions and cost accounts folded into **CA-4010 Revenue**, while **CA-5010 Cost of Sales** captures only **1.3M** of **477M** TB cost-of-revenue). The **audited 25.08M** is the **signed net of all IS GL movement**, which the factory **does not use** for the income statement face.

---

## 1. The Question Restated

```
AuditOS IS Net Profit     = 926,038,529 SAR
Audited IS Net Profit     =  25,084,852 SAR
Gap                       = 900,953,677 SAR
```

The balance sheet **does** reconcile (total equity ≈ audited) because the **25.08M plug** on equity equals audited net profit. The **income statement face is wrong** for a different reason than the plug alone.

---

## 2. Which Column Is Used vs Which Should Be Used

### 2.1 TB export columns (Arabic headers)

| Column | Header (approx.) | Role |
|--------|------------------|------|
| **Opening** | `صافي الرصيد الافتتاحي` | Opening net balance |
| **Movement debit** | `حركة الفترة مدين` | Period debit movement |
| **Movement credit** | `حركة الفترة دائن` | Period credit movement |
| **Closing debit/credit** | `الرصيد الحالي مدين/دائن` | Year-end gross sides |
| **Closing net** | `صافي الرصيد الحالي` | Signed year-end net |
| **ERP slice** | `BS/IS` | Balance Sheet vs Income Statement partition |

### 2.2 Current factory behaviour

| Stage | Column / logic | Evidence |
|-------|----------------|----------|
| **TB upload** | **`closing`** balance mode — stores year-end **debitAmount / creditAmount** on each mapping | `scripts/tb-upload-demo.ts` → `amountMode: "closing"` when closing debit/credit columns present |
| **FS engine amount** | **`getMappingDisplayAmount`**: for `income_statement`, returns **`creditAmount` if ≠ 0, else `debitAmount`** — **not signed net** | `src/lib/audit/db/statement-builder.ts` L55–63 |
| **P&L aggregation** | Sums those amounts into Revenue − CoS − OpEx + Other Income | `buildStatementLinesFromMappings` L141–150 |

**Currently used:** **Closing balance gross side** (debit OR credit per row, always positive in display).

**Should be used for period P&L (when RE is not rolled):**

1. **Primary:** **Period movement net** (`حركة الفترة مدين − حركة الفترة دائن`) on **IS-slice accounts only**, with credit-nature lines shown positive for revenue and debit-nature for expenses; **or**
2. **Alternative:** **Signed closing net** (`صافي الرصيد الحالي`) on IS rows — equals movement net when opening = 0 on all IS rows (true for this TB).

**Must not be used:** Gross closing debit/credit sides summed as if they were **period flows**, especially when **balance-sheet GL balances are mapped to revenue canonical (CA-4010)**.

### 2.3 Proof that the correct column already exists in the TB

| Aggregate (all 222 IS rows) | SAR (file sign) | Display profit |
|-----------------------------|-----------------|----------------|
| Sum of **period movement net** | **−25,084,855.92** | **+25,084,856** |
| Sum of **closing net** | **−25,084,855.92** | **+25,084,856** |
| **Audited net profit** | — | **25,084,852** |

The TB **already contains** the audited result in the **IS slice net**. AuditOS **ignores** this net when building the P&L face.

---

## 3. Three-Way P&L Reconstruction (Opening | Movement | Closing)

All amounts in **SAR**. **Movement display** = expense-style positive for costs/expenses, revenue-style positive for revenue/other income (absolute economic flow, not file sign).

### 3.1 By ERP Mapping 1 (222 IS accounts)

| Mapping 1 | Accts | Opening | Movement (display) | Closing net (file) | FS engine (closing gross) | Audited FS |
|-----------|------:|--------:|-------------------:|-------------------:|--------------------------:|-----------:|
| **Revenues** | 7 | 0 | **462,388,883** | −462,388,883 | **462,388,883** | **451,412,506** |
| **Cost of revenue** | 122 | 0 | **474,813,175** | +474,813,175 | **477,454,949** | **384,959,315** |
| **General and administrative expenses** | 69 | 0 | **26,626,202** | +26,626,202 | **26,648,924** | **26,627,726** |
| **Finance Costs** | 19 | 0 | **13,235,282** | +13,235,282 | **13,235,282** | **12,901,271** |
| **Other income** | 3 | 0 | **11,171,845** | −11,171,845 | **11,171,845** | **735,915** |
| **zakat expense** | 1 | 0 | **2,575,257** | +2,575,257 | **2,575,257** | **2,575,257** |
| **(blank Map1)** | 1 | 0 | **68,774,044** | −68,774,044 | **68,774,044** | *(in audited revenue/other)* |
| **All IS rows (signed net)** | 222 | 0 | — | **−25,084,856** | — | **25,084,852** |

**Notes:**

- **G&A, finance, zakat** movement ≈ audited (presentation timing / netting differences only).
- **Revenue** movement (462M) vs audited (451M): **+10.98M** — largely **unmapped affiliate revenue** GL `4401010005` (68.77M movement) partially offset by **audited netting** of other income / finance.
- **Cost of revenue** movement (475M) vs audited (385M): **+89.85M** — audited FS **reclassifies** portions to presentation lines not equal to raw Map1 (still nets to 25.08M on IS slice).

### 3.2 Naive P&L from TB columns (IS rows only, Map1 buckets)

Using **FS-engine-style gross closing sums** on IS rows only (no BS mis-map):

| Line | FS closing gross | Movement display | Audited |
|------|-----------------:|-----------------:|--------:|
| Revenue (+ blank) | 531,162,927 | 531,162,927 | 451,412,506 |
| Cost of revenue | 477,454,949 | 474,813,175 | 384,959,315 |
| G&A | 26,648,924 | 26,626,202 | 26,627,726 |
| Finance | 13,235,282 | 13,235,282 | 12,901,271 |
| Other income | 11,171,845 | 11,171,845 | 735,915 |
| Zakat | 2,575,257 | 2,575,257 | 2,575,257 |
| **Implied net (gross closing)** | **22,420,360** | — | **25,084,852** |
| **Signed net all IS rows** | — | — | **25,084,852** ✓ |

Even on **IS rows alone**, gross-side closing arithmetic gives **~22.4M**, not 926M. The **903.6M extra** comes from **canonical mapping scope** (BS → revenue, CoR → non-CoS buckets / revenue).

### 3.3 AuditOS generated P&L (canonical aggregation)

| Line | AuditOS (SAR) | Canonical driver |
|------|--------------:|------------------|
| Revenue | **982,972,012** | **CA-4010** = 982,972,012 |
| Cost of Sales | **1,267,242** | **CA-5010** = 1,267,242 |
| Operating Expenses | **66,838,086** | CA-5020 + CA-5040 + CA-5070 (+ mis-posted IS) |
| Other Income | **11,171,845** | CA-5100 |
| **Net Profit** | **926,038,529** | `Revenue − CoS − OpEx + Other` |

**Canonical expense totals (mapped, all statements):**

| Code | Name | Mapped total (SAR) |
|------|------|-------------------:|
| CA-5010 | Cost of Sales | 1,267,242 |
| CA-5020 | Employee Benefits | 24,240,478 |
| CA-5040 | Utilities | 12,785,207 |
| CA-5070 | G&A | 16,577,118 |
| CA-2050 | Finance Cost | 13,235,282 |
| CA-5100 | Other Income | 11,171,845 |

**TB Cost of revenue closing gross = 477,454,949** but **CA-5010 = 1,267,242** → **476,187,707 SAR of CoR not in Cost of Sales bucket** (≈ **99.7%** of audited CoR).

---

## 4. Variance Waterfall — 926M vs 25.08M

| # | Driver | Estimated impact (SAR) | Class |
|---|--------|------------------------:|-------|
| 1 | **Wrong amount basis:** gross closing sides instead of signed IS net / movement | Enables entire distortion | **C** |
| 2 | **Revenue inflation:** CA-4010 vs TB `Revenues` Map1 closing | **+520,583,129** | **A / C** |
| 3 | **CoS collapse:** TB CoR 477M → CA-5010 1.3M | **−476,187,707** (understates expense) | **A** |
| 4 | **BS balances in revenue bucket** (receivables, contract assets, related parties) | **~473M** identified on BS Map1 groups | **A** |
| 5 | **Duplicate contract asset / unbilled revenue** (60.4M × 2) | **~60,395,590** | **A** |
| 6 | **Affiliate revenue unmapped Map1** (`4401010005`, 68.77M) | **+68,774,044** in IS gross sums | **A / B** |
| **Net** | **AuditOS 926M − Audited 25.08M** | **≈ 900,953,677** | |

**Mechanism (ranked):**

1. **Column / arithmetic (necessary):** Summing **non-net closing debits/credits** treats **cumulative GL positions** as **period P&L flows**.
2. **Mapping (amplifying):** **~521M** of non-revenue balances sit in **CA-4010**; **~476M** of CoR never reaches **CA-5010**.
3. **Presentation (minor on net):** Audited FS **nets** finance/other and **reclassifies** Map1 lines; IS signed net still **25.08M**.

---

## 5. Revenue Trace (7 Map1 + 1 unmapped + BS leakage)

### 5.1 TB `Revenues` accounts (Map1) — full trace

| GL | Account name | Opening | Movement net (file) | Closing net (file) | FS engine (closing gross) | Audited role |
|----|--------------|--------:|--------------------:|-------------------:|--------------------------:|--------------|
| 4401010001 | ايرادات مشاريع التشغيل والصيانة | 0 | −356,517,711 | −356,517,711 | **356,517,711** | Core facilities revenue |
| 4401010003 | ايرادات الصيانه والتشغيل (غير مفوترة) | 0 | −60,395,590 | −60,395,590 | **60,395,590** | **Duplicates contract asset 1107040007** |
| 4301010002 | ايرادات قطاع الامن والسلامة | 0 | −19,822,496 | −19,822,496 | **19,822,496** | Segment revenue |
| 4601010002 | ايرادات قطاع الخدمات البيئية | 0 | −13,569,395 | −13,569,395 | **13,569,395** | Segment revenue |
| 4601010003 | ايرادات مشروع تدوير النفايات | 0 | −6,244,629 | −6,244,629 | **6,244,629** | Segment revenue |
| 4401010004 | ايرادات الصيانه والتشغيل (مطالبات) | 0 | −3,744,152 | −3,744,152 | **3,744,152** | Claims revenue |
| 4701010001 | ايرادات الحاويات | 0 | −2,094,911 | −2,094,911 | **2,094,911** | Other revenue |
| **Subtotal Revenues** | | **0** | **−462,388,883** | **−462,388,883** | **462,388,883** | **451,412,506** |

### 5.2 Unmapped IS revenue (blank Map1)

| GL | Account name | Movement (display) | FS engine | Note |
|----|--------------|-------------------:|----------:|------|
| **4401010005** | **ايرادات الشركات الشقيقة** | **68,774,044** | **68,774,044** | Affiliate / intercompany revenue — **no Map1** in export; synonym rules map **intercompany revenue → CA-4010** |

### 5.3 Balance-sheet accounts contributing to AuditOS revenue (CA-4010 inflation)

Estimated **473M** from BS Map1 groups mapped to revenue canonical (via aliases: receivables, contract assets, related-party debits, “ايرادات”):

| GL | Map1 | FS closing gross (SAR) | Issue |
|----|------|------------------------:|-------|
| 1107040007 | Contract Assets | 60,395,590 | **Same balance as GL 4401010003** — double count |
| 1103370205 | Accounts receivable | 82,108,194 | Trade receivable ≠ revenue |
| 1103010001 | Due from related parties | 47,691,569 | Balance sheet debit |
| 1103370200 | Due from related parties | 43,614,908 | Balance sheet debit |
| 1107020005 | Due from related parties | 106,618,256 | Balance sheet debit |
| *(others)* | Receivables / prep / contract | *balance* | Folded into **CA-4010** |

**AuditOS CA-4010 total = 982,972,012** ≈ TB Revenues **462M** + BS revenue-alias mappings **~521M**.

---

## 6. Cost of Revenue Trace (122 accounts)

### 6.1 Map1 summary

| Map2 bucket (top) | Accounts | FS closing gross | Movement (display) |
|-------------------|--------:|-----------------:|-------------------:|
| Wages, salaries | 15 | **229,880,870** | 229,880,470 |
| Spare Parts & Consumables | 25 | 64,460,214 | 64,370,506 |
| Government expenses | 4 | 53,049,732 | 53,049,732 |
| Expenses for Joint venture | 1 | 32,807,728 | 32,807,728 |
| Maintenance | 4 | 23,340,269 | 23,340,269 |
| Other expenses | 42 | 17,055,730 | 14,504,063 |
| Vehicles and fuel | 11 | 15,855,431 | 15,855,431 |
| External labor | 1 | 13,423,001 | 13,423,001 |
| Amortization ROU | 1 | 9,831,172 | 9,831,172 |
| Depreciation PP&E | 8 | 8,907,395 | 8,907,395 |
| **Total Cost of revenue** | **122** | **477,454,949** | **474,813,175** |

### 6.2 Top 5 CoR GL accounts

| GL | Name | Map2 | FS closing | Movement | AuditOS canonical (inferred) |
|----|------|------|----------:|---------:|------------------------------|
| 3204010001 | رواتب | Wages, salaries | 179,655,890 | 179,655,890 | **CA-5020** (Employee Benefits), **not CA-5010** |
| 3204010028 | مصروفات حكومية | Government expenses | 49,143,510 | 49,143,510 | **CA-5070** / G&A bucket |
| 3204010054 | مصروفات مشتركة مشاريع التضامن | Joint venture | 32,807,728 | 32,807,728 | **CA-5070** |
| 3204010090 | مقاولين باطن | Maintenance | 22,875,597 | 22,875,597 | **CA-5010** partial / **CA-5070** |
| 3204010030 | تأمينات اجتماعية | Wages, salaries | 22,336,176 | 22,336,176 | **CA-5020** |

**Only ~1.27M** lands in **CA-5010 Cost of Sales** in AuditOS. The FS engine **subtracts 1.27M** from **983M revenue**, producing **illusory gross margin** and **926M net profit**.

---

## 7. Expense Trace (G&A, Finance, Zakat, Other)

### 7.1 General and administrative (69 accounts)

| Metric | SAR |
|--------|----:|
| FS closing gross sum | 26,648,924 |
| Movement (display) | 26,626,202 |
| **Audited G&A** | **26,627,726** |
| AuditOS operating bucket | 66,838,086 *(includes mis-mapped CoR + zakat in CA-5070)* |

Top Map2: Other Exp. (20), Bank fees (18), Salaries (10), Government (9), Depreciation (4).

**Zakat expense GL 3101020005** (2,575,257) is Map1 `zakat expense` but mapped to **CA-5070 G&A** in pilot (`equity-bridge-raw.json`), not a separate IS line — presentation difference only; amount matches audited.

### 7.2 Finance costs (19 accounts)

| Metric | SAR |
|--------|----:|
| FS closing / movement | 13,235,282 |
| **Audited finance costs (net)** | **12,901,271** |
| AuditOS | 13,235,282 *(CA-2050)* |

Includes borrowings, lease interest, EOSB finance, Murabaha deposit **credit** line (netting differs in audited FS).

### 7.3 Other income (3 accounts)

| GL | Name | FS closing | Audited other income (net) |
|----|------|----------:|---------------------------:|
| *(3 IS accounts)* | Fixed asset gains, misc., lease disposal | **11,171,845** | **735,915** |

Audited FS presents **net** other income after internal offsets; TB Map1 **gross** credits sum to 11.2M.

---

## 8. FS Engine Logic (why 926M is deterministic)

```55:63:src/lib/audit/db/statement-builder.ts
export function getMappingDisplayAmount(mapping: MappingWithCanonical): number {
  const category =
    mapping.statementClassification ?? mapping.canonicalAccount?.category ?? "";
  const statementType = mapping.canonicalAccount?.statementType ?? "";
  if (statementType === "income_statement") {
    return mapping.creditAmount !== 0
      ? mapping.creditAmount
      : mapping.debitAmount;
  }
```

For each mapped account:

1. Upload stores **year-end closing** in `debitAmount` / `creditAmount`.
2. IS accounts contribute **always-positive** amounts to bucket sums.
3. **P&L formula:** `Net = Revenue − CoS − OpEx + Other Income` (finance inside OpEx when mapped to expense canonicals).

**Numeric closure:**

```
982,972,012  (CA-4010 Revenue)
−    1,267,242  (CA-5010 CoS)
−   66,838,086  (OpEx canonicals)
+   11,171,845  (CA-5100 Other income)
≈  926,038,529  (AuditOS Net Profit)
```

This matches `computedNetProfit` in `equity-bridge-raw.json` exactly.

---

## 9. Reconciled Audited P&L (movement basis)

Reconstructed from **IS slice period movement** with audited presentation where Map1 ≈ audited line:

| Line | TB movement (display) | Audited FS | Variance |
|------|----------------------:|-----------:|---------:|
| Revenue | 462,388,883 + 68,774,044* | 451,412,506 | Map1 / netting |
| Cost of revenue | 474,813,175 | 384,959,315 | Reclassification |
| **Gross profit** | *(naive negative)* | **66,453,191** | Audited adjusts lines |
| G&A | 26,626,202 | 26,627,726 | ✓ |
| Finance costs | 13,235,282 | 12,901,271 | ~334K |
| Other income (net) | 11,171,845 | 735,915 | Netting |
| Profit before zakat | *(line items don’t sum)* | **27,660,109** | Presentation |
| Zakat | 2,575,257 | 2,575,257 | ✓ |
| **Net profit** | **25,084,856** (signed IS total) | **25,084,852** | **✓ ±4 SAR** |

\*Affiliate GL included in economic revenue but blank Map1.

**Authoritative net:** Use **signed sum of all 222 IS movement nets = audited net profit**. Line-item presentation requires **auditor adjustments** not present as Map1 subtotals.

---

## 10. Root Cause Summary Table

| Layer | Finding | Impact on 926M vs 25M |
|-------|---------|------------------------|
| **TB export** | IS slice nets to **−25.08M**; RE GL **unchanged** | Audited profit lives in **IS net**, not RE line |
| **Column choice** | Factory uses **closing gross sides** | Wrong basis for period P&L |
| **Mapping — revenue** | **CA-4010** includes **~521M** non-revenue TB balances | **+521M** revenue error |
| **Mapping — CoS** | **477M** TB CoR → **1.3M** CA-5010 | **−476M** expense missing from CoS |
| **Double count** | Contract asset **1107040007** + revenue **4401010003** = **60.4M** each | Overstatement |
| **Equity bridge** | **Plug = 25.08M** = audited NP | BS correct; **IS face wrong** |

---

## 11. Answers to Phase 9 Requirements

| # | Requirement | Answer |
|---|-------------|--------|
| 1 | Trace every revenue account | §5 — 7 Map1 + 1 unmapped; full 222-row detail in evidence JSON |
| 2 | Trace every cost account | §6 — 122 CoR accounts; top GL + Map2 buckets |
| 3 | Trace every expense account | §7 — G&A (69), Finance (19), Zakat (1), Other income (3) |
| 4 | TB Closing / Movement / FS engine | Columns in §3.1; per-account in evidence JSON |
| 5 | Column used vs should use | §2 — **Closing gross** used; **movement net or signed closing net** should be used |
| 6 | Reconstruct audited P&L (O/M/C) | §3, §9 |
| 7 | Quantify variance | §4 waterfall — **901M total**; **521M revenue**, **476M CoS** dominant |

---

## 12. Evidence Index

| Artifact | Path |
|----------|------|
| All 222 IS account lines (O/M/C/FS) | `docs/audits/evidence/p-and-l-root-cause-data.json` |
| AuditOS FS export | `docs/audits/evidence/factory-accuracy-auditos-export.json` |
| Equity / plug bridge | `docs/audits/evidence/equity-bridge-raw.json`, `EQUITY_BRIDGE_ANALYSIS.md` |
| Factory accuracy scores | `FACTORY_ACCURACY_AUDITED_FS_V1.md` |
| FS engine | `src/lib/audit/db/statement-builder.ts` |
| TB upload mode | `scripts/tb-upload-demo.ts` |

---

## 13. Diagnosis Boundary

This document **explains** the 926M vs 25.08M gap. It does **not** prescribe fixes. Remediation would require separate approved work on: **amount mode policy**, **P&L vs BS canonical guards**, **CoR → CA-5010 mapping**, **revenue canonical eligibility**, and **contract asset / unbilled revenue deduplication**.

---

*Phase 9 — P&L Root Cause Analysis — read-only — 2026-06-14*
