# Workbook Coverage Report
## LocalContentOS Pilot — Real TB Validation

**Date:** 2026-06-16
**Subject:** Workbook Population Engine coverage assessment against real TB data

---

## Summary

| Metric | Value |
|--------|-------|
| Total template fields | 22 |
| Auto-fillable design | 13 |
| Auto-filled (matched in TB) | 9 |
| Auto-fillable match rate | 9/13 (69%) |
| Client required | 13 |

## Field-by-Field Analysis

⏳ **INF-01** [company_info] اسم المنشأة / Company Name
  - Source: D — Client Required
  - Manual entry required from client

⏳ **INF-02** [company_info] السجل التجاري / CR Number
  - Source: D — Client Required
  - Manual entry required from client

⏳ **INF-03** [company_info] تاريخ التأسيس / Date of Incorporation
  - Source: D — Client Required
  - Manual entry required from client

✅ **REV-01** [revenue] إيرادات العملاء المحليين / Local Customer Revenue
  - Source: A — TB (with value)
  - Auto-filled from TB (aggregated 5 accounts): 547,341,228.83 SAR

⚠️ **REV-02** [revenue] إيرادات العملاء الأجانب / Foreign Customer Revenue
  - Source: D — Client Required
  - No matching TB account found with existing patterns

✅ **REV-03** [revenue] إجمالي الإيرادات / Total Revenue
  - Source: A — TB (with value)
  - Auto-filled from TB (aggregated 5 accounts): 547,341,228.83 SAR

✅ **COS-01** [cost_of_sales] تكلفة المبيعات من موردين محليين / Local Supplier COS
  - Source: A — TB (with value)
  - Auto-filled from TB (aggregated 1 accounts): 3,839,810 SAR

⚠️ **COS-02** [cost_of_sales] تكلفة المبيعات من موردين أجانب / Foreign Supplier COS
  - Source: D — Client Required
  - No matching TB account found with existing patterns

✅ **COS-03** [cost_of_sales] إجمالي تكلفة المبيعات / Total Cost of Sales
  - Source: A — TB (with value)
  - Auto-filled from TB (aggregated 1 accounts): 1,267,242 SAR

✅ **GP-01** [gross_profit] إجمالي الربح / Gross Profit
  - Source: B — Formula (derived)
  - Derived from formula: REV-03 - COS-03 = 546,073,986.83 SAR

⚠️ **SPN-01** [supplier_spend] إجمالي المشتريات من موردين سعوديين / Saudi Supplier Spend
  - Source: D — Client Required
  - No matching TB account found with existing patterns

⚠️ **SPN-02** [supplier_spend] إجمالي المشتريات من موردين غير سعوديين / Non-Saudi Supplier Spend
  - Source: D — Client Required
  - No matching TB account found with existing patterns

✅ **SPN-03** [supplier_spend] إجمالي المشتريات / Total Procurement Spend
  - Source: A — TB (with value)
  - Auto-filled from TB (aggregated 1 accounts): 3,839,810 SAR

⏳ **WRK-01** [workforce] عدد الموظفين السعوديين / Saudi Workforce Count
  - Source: D — Client Required
  - Manual entry required from client

⏳ **WRK-02** [workforce] إجمالي عدد الموظفين / Total Workforce Count
  - Source: D — Client Required
  - Manual entry required from client

⏳ **WRK-03** [workforce] نسبة التوطين / Saudization Percentage
  - Source: D — Client Required
  - Manual entry required from client

✅ **WRK-04** [workforce] إجمالي الرواتب / Total Payroll
  - Source: A — TB (with value)
  - Auto-filled from TB (aggregated 4 accounts): 198,733,336.76 SAR

✅ **AST-01** [assets] الأصول الثابتة المحلية / Local Fixed Assets
  - Source: A — TB (with value)
  - Auto-filled from TB (aggregated 2 accounts): 9,883,590.29 SAR

✅ **AST-02** [assets] إجمالي الأصول الثابتة / Total Fixed Assets
  - Source: A — TB (with value)
  - Auto-filled from TB (aggregated 2 accounts): 9,883,590.29 SAR

⏳ **DEC-01** [declarations] حالة شهادة المحتوى المحلي / LC Certificate Status
  - Source: D — Client Required
  - Manual entry required from client

⏳ **DEC-02** [declarations] نسبة المحتوى المحلي المعلنة / Declared LC Percentage
  - Source: D — Client Required
  - Manual entry required from client

⏳ **DEC-03** [declarations] ملاحظات إضافية / Additional Notes
  - Source: D — Client Required
  - Manual entry required from client


## Pattern Matching Performance

### Matched Auto-Fillable Fields
- REV-01 (إيرادات العملاء المحليين / Local Customer Revenue) → matched "ايرادات الصيانه والتشغيل (مطالبات)" via pattern `إيرادات.*صيانة.*تشغيل|ايرادات.*صيانة.*تشغيل|إيرادات.*تشغيل|ايرادات.*تشغيل` → value: 221860796.68
- REV-03 (إجمالي الإيرادات / Total Revenue) → matched "ايرادات الصيانه والتشغيل (مطالبات)" via pattern `إيرادات.*صيانة|ايرادات.*صيانة|إيرادات.*تشغيل|ايرادات.*تشغيل` → value: 221860796.68
- COS-01 (تكلفة المبيعات من موردين محليين / Local Supplier COS) → matched "مشتريات مستعاضة" via pattern `مشتريات مستعاضة|مشتريات.*مستعاضة` → value: 3839810
- COS-03 (إجمالي تكلفة المبيعات / Total Cost of Sales) → matched "تكلفة مردم تبوك ( مخزون)" via pattern `تكلفة|مردم` → value: 1267242
- GP-01 (إجمالي الربح / Gross Profit) → matched "undefined" via pattern `undefined` → value: 0
- SPN-03 (إجمالي المشتريات / Total Procurement Spend) → matched "مشتريات مستعاضة" via pattern `مشتريات مستعاضة|مشتريات` → value: 3839810
- WRK-04 (إجمالي الرواتب / Total Payroll) → matched "رواتب قطاع الحاويات" via pattern `رواتب|مرتبات|أجور|اجور|payroll|salaries|wages` → value: 567190.65
- AST-01 (الأصول الثابتة المحلية / Local Fixed Assets) → matched "أثاث مكتبى" via pattern `أصول ثابتة|آلات ومعدات|أثاث` → value: 299837.95
- AST-02 (إجمالي الأصول الثابتة / Total Fixed Assets) → matched "أثاث مكتبى" via pattern `أصول ثابتة|آلات ومعدات|أثاث` → value: 299837.95

### Unmatched Auto-Fillable Fields
- REV-02 (إيرادات العملاء الأجانب / Foreign Customer Revenue) — no TB account matched patterns: none defined
- COS-02 (تكلفة المبيعات من موردين أجانب / Foreign Supplier COS) — no TB account matched patterns: none defined
- SPN-01 (إجمالي المشتريات من موردين سعوديين / Saudi Supplier Spend) — no TB account matched patterns: none defined
- SPN-02 (إجمالي المشتريات من موردين غير سعوديين / Non-Saudi Supplier Spend) — no TB account matched patterns: none defined

## Recommendations

1. Add patterns for: "ايرادات الصيانه والتشغيل", "مشتريات مستعاضة"
2. Add derived field engine for Total Revenue = REV-01 + REV-02
3. Add supplier classification flag (Saudi/non-Saudi) to supplier master

## April 16th Update

| Change | Detail |
|--------|--------|
| ✅ **COS-03 matched** | "تكلفة|مردم" pattern added to template COS-03, matches "تكلفة مردم تبوك ( مخزون)" |
| ✅ **Formula engine bugfix** | `evaluateFormula` now skips unreferenced null values instead of failing. GP-01 formula (`REV-03 - COS-03`) now works when GP-01 itself has no TB match |
| ✅ **TB Import UI** | "استيراد ميزان" dialog on workbook detail page. Supports JSON paste, file upload (.json), CSV/TSV with auto-detect |
| ✅ **CSV Parser** | `parseCsvTrialBalance()` utility supports Arabic/English headers, semicolon/tab/comma delimiters, Arabic numerals, quoted values, parentheses negatives |
| ✅ **Tests** | 65/65 passing (was 37). 14 new CSV parser tests, 1 regression test for unreferenced null values |

### New Files Added

| File | Purpose |
|------|---------|
| `src/lib/local-content/workbook/csv-parser.ts` | CSV/TSV trial balance parser → TbLine[] |
| `src/lib/local-content/workbook/__tests__/csv-parser.test.ts` | 14 tests covering English, Arabic, edge cases, realistic data |
| `src/app/local-content/workbook/[workbookId]/tb-import-dialog.tsx` | Import dialog with CSV/JSON tabs + file upload |
