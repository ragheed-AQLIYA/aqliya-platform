# AuditOS — Pilot Dataset

## Gulf Trading Co. (GTC) — FY2025 — SAR — IFRS for SMEs

---

# 1. Trial Balance — ميزان المراجعة

| Code | Account Name (AR)             | Account Name (EN)                    | Debit (SAR)     | Credit (SAR)    | Statement Classification | Suggested Mapping                      |
| ---- | ----------------------------- | ------------------------------------ | --------------- | --------------- | ------------------------ | -------------------------------------- |
| 1001 | الصندوق                       | Cash on Hand                         | 200,000         | —               | Current Assets           | Cash & Cash Equivalents                |
| 1002 | البنك — حساب جاري             | Bank — Current Account               | 3,000,000       | —               | Current Assets           | Cash & Cash Equivalents                |
| 1003 | البنك — وديعة إسلامية         | Bank — Islamic Deposit               | 6,000,000       | —               | Current Assets           | Cash & Cash Equivalents                |
| 1010 | ذمم تجارية مدينة              | Trade Receivables                    | 9,000,000       | —               | Current Assets           | Trade Receivables                      |
| 1011 | مخصص ديون مشكوك فيها          | Allowance for Doubtful Debts         | —               | 900,000         | Contra-Asset             | Trade Receivables (offset)             |
| 1012 | ذمم طرف ذي علاقة              | Due from Related Party               | 1,300,000       | —               | Current Assets           | Related Party Receivables              |
| 1013 | ذمم مدينة أخرى                | Other Receivables                    | 250,000         | —               | Current Assets           | Other Receivables                      |
| 1014 | سلف موظفين                    | Staff Receivables                    | —               | 70,000          | Current Liabilities      | Payables / Reclass Required            |
| 1020 | مخزون — بضاعة تامة            | Inventory — Finished Goods           | 12,500,000      | —               | Current Assets           | Inventory                              |
| 1021 | مخصص تقادم مخزون              | Inventory Provision — Slow-moving    | —               | 650,000         | Contra-Asset             | Inventory (offset)                     |
| 1022 | مخزون — بضاعة في الطريق       | Inventory — Goods in Transit         | 2,700,000       | —               | Current Assets           | Inventory                              |
| 1030 | إيجار مدفوع مقدماً            | Prepaid Rent                         | 350,000         | —               | Current Assets           | Prepayments                            |
| 1031 | تأمين مدفوع مقدماً            | Prepaid Insurance                    | 200,000         | —               | Current Assets           | Prepayments                            |
| 1032 | دفعات مقدمة للموردين          | Advances to Suppliers                | 800,000         | —               | Current Assets           | Advances to Suppliers                  |
| 1033 | ضريبة القيمة المضافة — مدينة  | VAT Receivable                       | 420,000         | —               | Current Assets           | VAT / Tax Receivable                   |
| 1050 | حساب معلق                     | Suspense Account                     | 380,000         | —               | Current Assets           | Ambiguous — Requires Investigation     |
| 1100 | أراضي                         | Land                                 | 10,000,000      | —               | Non-Current Assets       | Property, Plant & Equipment            |
| 1101 | مباني                         | Buildings                            | 17,000,000      | —               | Non-Current Assets       | Property, Plant & Equipment            |
| 1102 | آلات ومعدات                   | Machinery & Equipment                | 5,800,000       | —               | Non-Current Assets       | Property, Plant & Equipment            |
| 1103 | سيارات                        | Vehicles                             | 2,830,000       | —               | Non-Current Assets       | Property, Plant & Equipment            |
| 1104 | أثاث وتجهيزات                 | Furniture & Fixtures                 | 1,500,000       | —               | Non-Current Assets       | Property, Plant & Equipment            |
| 1105 | أجهزة حاسب آلي                | Computer Equipment                   | 1,000,000       | —               | Non-Current Assets       | Property, Plant & Equipment            |
| 1106 | مجمع إهلاك مباني              | Accumulated Depreciation — Buildings | —               | 4,200,000       | Contra-Asset             | PPE (offset)                           |
| 1107 | مجمع إهلاك آلات               | Accumulated Depreciation — Machinery | —               | 2,400,000       | Contra-Asset             | PPE (offset)                           |
| 1108 | مجمع إهلاك سيارات             | Accumulated Depreciation — Vehicles  | —               | 950,000         | Contra-Asset             | PPE (offset)                           |
| 1109 | مجمع إهلاك أثاث               | Accumulated Depreciation — Furniture | —               | 450,000         | Contra-Asset             | PPE (offset)                           |
| 1110 | مجمع إهلاك حاسب آلي           | Accumulated Depreciation — Computers | —               | 600,000         | Contra-Asset             | PPE (offset)                           |
| 1120 | أصول غير ملموسة — برمجيات     | Intangible Assets — Software         | 700,000         | —               | Non-Current Assets       | Intangible Assets                      |
| 1121 | مجمع إطفاء برمجيات            | Accumulated Amortisation — Software  | —               | 240,000         | Contra-Asset             | Intangible Assets (offset)             |
| 1130 | استثمار في شركة زميلة         | Investment in Associate              | 3,500,000       | —               | Non-Current Assets       | Investments                            |
| 1140 | أصل ضريبي مؤجل                | Deferred Tax Asset                   | 300,000         | —               | Non-Current Assets       | Deferred Tax Assets                    |
| 2001 | ذمم تجارية دائنة              | Trade Payables                       | —               | 8,000,000       | Current Liabilities      | Trade Payables                         |
| 2002 | ذمم دائنة — طرف ذي علاقة      | Due to Related Party                 | —               | 2,000,000       | Current Liabilities      | Related Party Payables                 |
| 2003 | رواتب مستحقة                  | Accrued Salaries                     | —               | 480,000         | Current Liabilities      | Accruals                               |
| 2004 | إيجار مستحق                   | Accrued Rent                         | —               | 200,000         | Current Liabilities      | Accruals                               |
| 2005 | أتعاب مهنية مستحقة            | Accrued Professional Fees            | —               | 320,000         | Current Liabilities      | Accruals                               |
| 2006 | فواتير مرافق مستحقة           | Accrued Utilities                    | —               | 75,000          | Current Liabilities      | Accruals                               |
| 2007 | ضريبة القيمة المضافة — دائنة  | VAT Payable                          | —               | 620,000         | Current Liabilities      | VAT / Tax Payable                      |
| 2008 | مخصص زكاة                     | Zakat Provision                      | —               | 780,000         | Current Liabilities      | Zakat / Tax Provision                  |
| 2009 | دفعات مقدمة من العملاء        | Advances from Customers              | —               | 1,200,000       | Current Liabilities      | Deferred Revenue                       |
| 2010 | أرباح مستحقة الدفع            | Dividends Payable                    | —               | 400,000         | Current Liabilities      | Dividends Payable                      |
| 2011 | تمويل مرابحة قصير الأجل       | Short-term Murabaha Financing        | —               | 4,500,000       | Current Liabilities      | Borrowings — Current                   |
| 2012 | قرض طويل الأجل                | Long-term Loan                       | —               | 11,000,000      | Non-Current Liabilities  | Borrowings — Non-Current               |
| 2013 | القسط الجاري — قرض طويل       | Current Portion — LT Loan            | —               | 2,200,000       | Current Liabilities      | Borrowings — Current                   |
| 2014 | مخصص مكافأة نهاية الخدمة      | EOSB Provision                       | —               | 1,900,000       | Non-Current Liabilities  | Employee Benefits                      |
| 2015 | التزام ضريبي مؤجل             | Deferred Tax Liability               | —               | 150,000         | Non-Current Liabilities  | Deferred Tax Liabilities               |
| 3001 | رأس المال                     | Share Capital                        | —               | 25,000,000      | Equity                   | Share Capital                          |
| 3002 | احتياطي نظامي                 | Statutory Reserve                    | —               | 2,800,000       | Equity                   | Reserves                               |
| 3003 | احتياطي عام                   | General Reserve                      | —               | 1,100,000       | Equity                   | Reserves                               |
| 3004 | أرباح مبقاة — مرحلة           | Retained Earnings — Brought Forward  | —               | 5,500,000       | Equity                   | Retained Earnings                      |
| 4001 | إيرادات — جملة                | Revenue — Wholesale                  | —               | 48,000,000      | Revenue                  | Revenue                                |
| 4002 | إيرادات — تجزئة               | Revenue — Retail                     | —               | 19,000,000      | Revenue                  | Revenue                                |
| 4003 | مردودات ومسموحات مبيعات       | Sales Returns & Allowances           | 1,400,000       | —               | Contra-Revenue           | Revenue (offset)                       |
| 4010 | إيرادات أخرى                  | Other Income                         | —               | 600,000         | Other Income             | Other Income                           |
| 4011 | أرباح استثمار في شركة زميلة   | Investment Income — Associate        | —               | 450,000         | Other Income             | Share of Profit of Associate           |
| 5001 | تكلفة مبيعات — مشتريات        | COGS — Purchases                     | 40,500,000      | —               | Cost of Sales            | Cost of Sales                          |
| 5002 | تكلفة مبيعات — شحن وجمارك     | COGS — Freight & Customs             | 2,700,000       | —               | Cost of Sales            | Cost of Sales                          |
| 5003 | تكلفة مبيعات — تسوية مخزون    | COGS — Inventory Write-down          | 500,000         | —               | Cost of Sales            | Cost of Sales                          |
| 6001 | رواتب وأجور                   | Salaries & Wages                     | 8,500,000       | —               | Operating Expense        | Employee Costs                         |
| 6002 | اشتراكات التأمينات الاجتماعية | GOSI Contributions                   | 1,275,000       | —               | Operating Expense        | Employee Costs                         |
| 6003 | مصروف إيجار                   | Rent Expense                         | 2,400,000       | —               | Operating Expense        | Occupancy Costs                        |
| 6004 | مصروف مرافق                   | Utilities Expense                    | 580,000         | —               | Operating Expense        | Occupancy Costs                        |
| 6005 | أتعاب مهنية — تدقيق           | Professional Fees — Audit            | 350,000         | —               | Operating Expense        | Professional Fees                      |
| 6006 | أتعاب مهنية — قانونية         | Professional Fees — Legal            | 250,000         | —               | Operating Expense        | Professional Fees                      |
| 6007 | أتعاب مهنية — استشارات        | Professional Fees — Consulting       | 1,200,000       | —               | Operating Expense        | **Potential Reclassification (Capex)** |
| 6008 | مصروف إهلاك                   | Depreciation Expense                 | 2,050,000       | —               | Operating Expense        | Depreciation                           |
| 6009 | مصروف إطفاء                   | Amortisation Expense                 | 100,000         | —               | Operating Expense        | Amortisation                           |
| 6010 | مصروف ديون مشكوك فيها         | Bad Debt Expense                     | 300,000         | —               | Operating Expense        | Impairment — Receivables               |
| 6011 | مصروف تأمين                   | Insurance Expense                    | 190,000         | —               | Operating Expense        | Insurance                              |
| 6012 | مصروف دعاية وإعلان            | Advertising & Marketing              | 1,400,000       | —               | Operating Expense        | Selling & Marketing                    |
| 6013 | مصروف سفر                     | Travel Expense                       | 650,000         | —               | Operating Expense        | Administrative Expenses                |
| 6014 | مصروف صيانة                   | Repairs & Maintenance                | 420,000         | —               | Operating Expense        | Repairs & Maintenance                  |
| 6015 | مصروف قرطاسية                 | Office Supplies                      | 180,000         | —               | Operating Expense        | Administrative Expenses                |
| 6016 | مصروف عمولات بنكية            | Bank Charges                         | 130,000         | —               | Operating Expense        | Finance Costs — Bank                   |
| 6017 | مصروف اتصالات                 | Telecom Expense                      | 170,000         | —               | Operating Expense        | Administrative Expenses                |
| 6020 | تكلفة تمويل — مرابحة          | Finance Cost — Murabaha              | 400,000         | —               | Finance Cost             | Finance Costs                          |
| 6021 | تكلفة تمويل — قرض طويل        | Finance Cost — LT Loan               | 580,000         | —               | Finance Cost             | Finance Costs                          |
| 6030 | مصروف زكاة                    | Zakat Expense                        | 780,000         | —               | Taxation                 | Zakat / Income Tax                     |
| \*\* | **الإجمالي / Total**          | **TOTAL**                            | **146,735,000** | **146,735,000** |                          |                                        |

> **Trial Balance is balanced** ✓  
> **Net Profit for FY2025 = SAR 1,045,000** (Revenue CR 68,050,000 − Expenses DR 67,005,000)  
> Net Profit Margin = 1.5%

---

## حسابات ملخصة / Summary Accounts

| Metric                               | SAR        |
| ------------------------------------ | ---------- |
| Net Revenue (68,050,000 − 1,400,000) | 66,650,000 |
| Gross Profit                         | 22,950,000 |
| Operating Profit (EBIT)              | 2,805,000  |
| Profit before Zakat                  | 1,825,000  |
| Net Profit after Zakat               | 1,045,000  |
| Total Assets (Net)                   | 69,270,000 |
| Total Liabilities                    | 33,825,000 |
| Total Equity (excl. CY profit)       | 34,400,000 |
| Gearing Ratio                        | 42%        |

---

# 2. Mapping Edge Cases — 8 حالات تخطيط شاذة

| #   | Edge Case                               | Code        | Account                                        | Issue                                                                         | Expected Handling                                                                               |
| --- | --------------------------------------- | ----------- | ---------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | **غامض / Ambiguous**                    | 1050        | Suspense Account — SAR 380,000 DR              | رصيد بحساب معلق منذ Q2 بدون مستند تفسيري                                      | Flag for auditor; request breakdown; reclass to correct account(s) before sign-off              |
| 2   | **إعادة تبويب / Reclass**               | 6007        | Professional Fees — Consulting — SAR 1,200,000 | يتضمن رسوم تطبيق ERP System بالكامل كمصروف بدلاً من رأسمالته كأصل غير ملموس   | Reclass SAR 850,000 to Intangible Assets — ERP; remaining SAR 350,000 stays in P&L              |
| 3   | **ناقص دليل / Missing Evidence**        | 1032        | Advances to Suppliers — SAR 800,000            | دفعات لموردين بدون عقود مكتوبة أو تأكيدات أرصدة                               | Request supplier confirmations + signed contracts; consider ECL provision if unrecoverable      |
| 4   | **طرف ذو علاقة / Related Party**        | 1012 / 2002 | Due from RP (1.3M DR) / Due to RP (2.0M CR)    | معاملات مع شركة شقيقة بدون آليات تسعير تحويلية موثقة                          | Obtain related party register; verify arm's-length pricing; IAS 24 disclosures required         |
| 5   | **رصيد غير طبيعي / Unnatural Balance**  | 1014        | Staff Receivables — SAR 70,000 CR              | أصل مفترض أن يكون مديناً لكنه دائن (مديونية للموظفين)                         | Reclass to Staff Payables or Accrued Salaries; investigate over-deduction                       |
| 6   | **إطفاء أصل / Amortisation Gap**        | 1120/1121   | Intangible Assets (700K) / Accum Amort (240K)  | لا توجد سياسة إطفاء موثقة لبرمجيات ERP المفترضة                               | Document useful life (5–7 yrs); apply straight-line; adjust prior-year amortisation if material |
| 7   | **ترحيل إيراد / Revenue Cut-off**       | 2009        | Advances from Customers — SAR 1,200,000        | دفعات مقدمة من عملاء لم يتم تحديد ما إذا كان الإيراد قد استُحِق قبل 31 ديسمبر | Test cut-off; verify delivery docs; reclass earned portion to Revenue                           |
| 8   | **تقييدات إقفال / Closing Adjustments** | 2005        | Accrued Professional Fees — SAR 320,000        | يشمل فاتورة Q4-2024 غير مسددة مسجلة ضمن المستحقات رغم استلامها                | Reverse duplicate accrual; match against invoice register; adjust P&L                           |

---

# 3. Evidence Requests — طلبات أدلة التدقيق

| ER#  | Account Code(s)        | Request Description (AR)                                                  | Request Description (EN)                                                 | Risk Area         | Priority |
| ---- | ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------- | -------- |
| ER01 | 1002, 1003             | كشوف حسابات بنكية مصدّقة حتى 31 ديسمبر 2025 + تسويات بنكية                | Certified bank statements to 31 Dec 2025 + bank reconciliations          | Cash & Banks      | High     |
| ER02 | 1010, 1011             | تأكيدات أرصدة عملاء + تقرير أعمار ديون + تحليل مخصص الديون                | Customer balance confirmations + AR ageing + ECL analysis                | Receivables       | High     |
| ER03 | 1020, 1021, 1022       | تقرير جرد مخزون 31 ديسمبر + بوليصة شحن بضاعة في الطريق + تحليل مخصص تقادم | 31 Dec physical count report + bill of lading for GIT + NRV analysis     | Inventory         | High     |
| ER04 | 1032                   | تأكيدات أرصدة موردين للدفعات المقدمة + نسخ العقود                         | Supplier confirmations for advances + signed contracts                   | Advances          | Medium   |
| ER05 | 1100–1110              | سجل الأصول الثابتة + سياسة الإهلاك المعتمدة + فواتير شراء الأصول الجديدة  | Fixed asset register + depreciation policy + addition invoices           | PPE               | High     |
| ER06 | 6007, 1120             | تفصيل استشارات FY2025 + عقد ERP + فواتير الاستشاري                        | Consulting engagement breakdown + ERP contract + consultant invoices     | Reclassification  | High     |
| ER07 | 1050                   | تفصيل وتحليل الحساب المعلق مع المستندات المؤيدة                           | Suspense account breakdown with supporting documents                     | Ambiguous         | Critical |
| ER08 | 2008, 6030             | إقرار زكاة FY2024 + حساب زكاة FY2025 + شهادة هيئة الزكاة                  | FY2024 Zakat filing + FY2025 computation + ZATCA certificate             | Zakat             | High     |
| ER09 | 2011, 2012, 6020, 6021 | عقود تمويل مرابحة + عقد قرض بنكي + جداول سداد                             | Murabaha agreements + loan agreement + repayment schedules               | Borrowings        | High     |
| ER10 | 1012, 2002             | سجل أطراف ذوي علاقة + سياسة تسعير تحويلية + تأكيدات أرصدة                 | Related-party register + transfer pricing policy + balance confirmations | Related Parties   | Medium   |
| ER11 | 2009                   | عقود عملاء مع دفعات مقدمة + مستندات تسليم بضاعة                           | Customer contracts with advance payments + delivery notes (cut-off)      | Revenue Cut-off   | Medium   |
| ER12 | 1014                   | كشف سلف ومديونيات الموظفين مع التسويات                                    | Staff advances / receivables ledger with settlement analysis             | Unnatural Balance | Medium   |

---

# 4. Draft Findings — نتائج أولية مقترحة

| F#  | Title                                                                        | Category           | Accounts    | Detail                                                                                                                                                                     | Materiality (SAR) | Risk   |
| --- | ---------------------------------------------------------------------------- | ------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------ |
| F01 | **حساب معلق غير مبرر** — Unexplained Suspense                                | Control Deficiency | 1050        | رصيد SAR 380,000 بدون تحليل أو مستندات مؤيدة منذ 30 يونيو 2025. يثير شكاً حول اكتمال ودقة القيود المحاسبية.                                                                | 380,000           | Medium |
| F02 | **رسملة غير صحيحة لمصاريف ERP** — Improper Expense Classification            | Misstatement       | 6007 / 1120 | مبلغ SAR 850,000 من أصل SAR 1,200,000 مصاريف استشارات يتعلق بتصميم وتطبيق نظام ERP ويجب رسملته وفقاً لـ IAS 38. الأثر: الموجودات غير المتداولة ناقصة والمصاريف مبالغ فيها. | 850,000           | High   |
| F03 | **غياب تأكيدات دفعات مقدمة** — Unsupported Supplier Advances                 | Evidence Gap       | 1032        | دفعات مقدمة بقيمة SAR 800,000 لـ 5 موردين بدون عقود موقعة أو تأكيدات أرصدة. لا يمكن تأكيد وجود وحقوق هذه الدفعات.                                                          | 800,000           | High   |
| F04 | **رصيد دائن غير طبيعي لسلف موظفين** — Unnatural Credit in Staff Receivables  | Misstatement       | 1014        | رصيد دائن SAR 70,000 بحساب مدين بطبيعته. يشير إلى خصومات زائدة من رواتب موظفين أو خطأ ترحيل. يجب إعادة التبويب.                                                            | 70,000            | Low    |
| F05 | **معاملات أطراف ذات علاقة غير مسعّرة** — Unpriced Related-Party Transactions | Disclosure         | 1012 / 2002 | أرصدة مدينة ودائنة مع شركة شقيقة بإجمالي صافي SAR 700,000 دائن. لا توجد سياسة تسعير تحويلية ولا إفصاحات IAS 24.                                                            | 3,300,000 (gross) | Medium |
| F06 | **مخاطر انقطاع الإيراد** — Revenue Cut-off Risk                              | Accuracy / Cut-off | 2009 / 4001 | دفعات مقدمة SAR 1,200,000 قد تشمل إيراداً مستحقاً قبل 31 ديسمبر 2025. عدم فحص مستندات التسليم قد يؤدي إلى نقص الإيراد في FY2025.                                           | 1,200,000         | Medium |

---

# 5. Draft Recommendations — توصيات مقترحة

| R#  | Recommendation (AR)                                                                         | Recommendation (EN)                                                                                    | Related Finding | Priority | Responsible             |
| --- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- | -------- | ----------------------- |
| R01 | تصفية الحساب المعلق فوراً وإعادة تبويب المبلغ إلى الحسابات الصحيحة مع مستندات مؤيدة         | Clear the suspense account immediately; reclass to correct accounts with supporting evidence           | F01             | Critical | Chief Accountant        |
| R02 | رسملة SAR 850,000 من مصاريف ERP كأصل غير ملموس وإطفاؤه على 6 سنوات وتعديل أتعاب Q4 2025     | Capitalise SAR 850,000 ERP cost as intangible asset; amortise over 6 years; restate Q4 consulting fees | F02             | High     | CFO / IT Director       |
| R03 | الحصول على تأكيدات أرصدة الموردين والعقود الموقعة للدفعات المقدمة وتكوين مخصص إذا لزم الأمر | Obtain supplier confirmations and signed contracts for advances; provide provision if unrecoverable    | F03             | High     | Procurement / Finance   |
| R04 | إعادة تبويب SAR 70,000 إلى ذمم دائنة موظفين أو تسويتها مع كشوف الرواتب                      | Reclass SAR 70,000 to Staff Payables or settle via payroll reconciliation                              | F04             | Low      | HR / Payroll Accountant |
| R05 | إعداد سجل أطراف ذات علاقة وسياسة تسعير تحويلية والإفصاح المطلوب في الإيضاحات                | Prepare related-party register, transfer pricing policy, and IAS 24 disclosures in notes               | F05             | Medium   | CFO / Legal             |

---

# 6. Notes Outline — هيكل إيضاحات القوائم المالية

| Note | Title (AR)                | Title (EN)                      | Key Disclosures                                                                                                                                                                                                                   |
| ---- | ------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | معلومات عامة              | General Information             | Gulf Trading Co., CR No. 1010XXXXXX, Riyadh, KSA. Wholesale & retail trading. IFRS for SMEs.                                                                                                                                      |
| 2    | أساس الإعداد              | Basis of Preparation            | Historical cost basis except investment in associate (equity method). FY2025 — 12 months ended 31 Dec 2025. Functional & presentation currency: SAR.                                                                              |
| 3    | السياسات المحاسبية الهامة | Significant Accounting Policies | Revenue recognition (IFRS 15), inventory (lower of cost or NRV, weighted average), PPE (cost model, straight-line depreciation), intangible assets, leases (IFRS 16 if applicable), ECL for receivables, EOSB (actuarial), Zakat. |
| 4    | تقديرات وأحكام هامة       | Critical Estimates & Judgements | Allowance for doubtful debts, inventory NRV provision, useful lives of PPE & intangibles, EOSB actuarial assumptions, Zakat provision.                                                                                            |
| 5    | النقد وما يعادله          | Cash & Cash Equivalents         | Breakdown: Cash on hand SAR 200K, Bank current SAR 3.0M, Islamic deposit SAR 6.0M. Total SAR 9,200,000.                                                                                                                           |
| 6    | ذمم مدينة                 | Trade & Other Receivables       | Gross receivables SAR 9,000K, ECL allowance SAR 900K. Ageing analysis. Related-party due SAR 1,300K.                                                                                                                              |
| 7    | مخزون                     | Inventory                       | Finished goods SAR 12,500K, GIT SAR 2,700K. Provision for slow-moving SAR 650K. NRV assessment performed.                                                                                                                         |
| 8    | ممتلكات ومعدات            | Property, Plant & Equipment     | Opening NBV + additions − disposals − depreciation = closing NBV per class. Depreciation rates: Buildings 5%, Machinery 15%, Vehicles 20%, Furniture 10%, Computers 33.3%.                                                        |
| 9    | أصول غير ملموسة           | Intangible Assets               | Software SAR 700K, Accum Amort SAR 240K. ERP capitalisation adjustment (see Finding F02).                                                                                                                                         |
| 10   | استثمار في شركة زميلة     | Investment in Associate         | 35% stake in XYZ Trading LLC (Saudi). Equity method applied. Share of profit SAR 450K.                                                                                                                                            |
| 11   | ذمم دائنة ومستحقات        | Trade Payables & Accruals       | Trade payables SAR 8,000K, related party SAR 2,000K, accrued expenses detail.                                                                                                                                                     |
| 12   | قروض وتسهيلات             | Borrowings                      | Murabaha SAR 4,500K at SIBOR+2.5%, LT loan SAR 11,000K at SAIBOR+3%, current portion SAR 2,200K. Maturity profile and covenants.                                                                                                  |
| 13   | مكافأة نهاية الخدمة       | End-of-Service Benefits         | Provision SAR 1,900K per Saudi Labour Law. Actuarial assumptions disclosed.                                                                                                                                                       |
| 14   | زكاة                      | Zakat                           | FY2025 provision SAR 780K. FY2024 assessment status with ZATCA. Base computation method.                                                                                                                                          |
| 15   | إيرادات                   | Revenue                         | Wholesale SAR 48,000K, Retail SAR 19,000K. Disaggregated by segment and timing of recognition.                                                                                                                                    |
| 16   | أطراف ذات علاقة           | Related-Party Disclosures       | Balances and transactions with related parties. Key management compensation (if applied).                                                                                                                                         |
| 17   | أحداث لاحقة               | Events After Reporting Date     | Any material post-31-Dec events (dividend declaration, new facilities, etc.).                                                                                                                                                     |

---

# 7. Expected Review Observations — ملاحظات المراجعة المتوقعة

| O#  | Observation                                                                  | TB Impact                             | Suggested Audit Response                                                  |
| --- | ---------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| O01 | Suspense Account SAR 380,000 without any sub-ledger — control weakness       | Assets overstated by up to SAR 380K   | Demand full breakdown; propose reclass journal; test subsequent clearance |
| O02 | Consulting fees include ERP capitalisation — P&L overstated                  | OpEx +850K; Intangibles −850K         | Propose adjusting entry; assess amortisation charge impact on profit      |
| O03 | No supplier confirmations for SAR 800K advances — existence risk             | Assets potentially overstated         | Circularise suppliers; assess recoverability; provide if needed           |
| O04 | Staff Receivables in credit — classification error                           | Dr/Cr flip SAR 70K                    | Reclass to payables; test payroll system to prevent recurrence            |
| O05 | Related-party balances netted incorrectly (IAS 24 prohibits offset)          | Gross presentation required           | Restate to gross; assess arm's-length nature                              |
| O06 | Inventory provision may be insufficient given 18-month ageing tail           | COGS understated                      | Extended NRV testing on aged SKUs; recalibrate provision %                |
| O07 | Revenue cut-off: advances possibly earned pre-year-end                       | Revenue understated by up to SAR 350K | Vouch delivery documents dated Dec 2025 for 3 largest advance customers   |
| O08 | Zakat base computation not independently verified — reliance on management   | Zakat expense may be +/- SAR 120K     | Engage Zakat specialist review; reconcile to ZATCA methodology            |
| O09 | Depreciation rates not reviewed for 3 years — potential useful life mismatch | Depreciation expense ± SAR 200K       | Benchmark rates to industry; physically inspect major assets              |

---

# 8. Additional Data Notes

- **Company Profile**: Gulf Trading Co. (GTC), headquartered in Riyadh, KSA. Operates 12 retail outlets and 3 wholesale distribution centres across the Central and Eastern regions. ~280 employees. VAT-registered. Subject to Zakat (ZATCA). Fiscal year = Gregorian calendar.
- **Industry**: General trading — consumer electronics, home appliances, and building materials.
- **Audit Firm Assumed**: Mid-tier Saudi audit firm. IFRS for SMEs framework.
- **Key Ratios for Analytical Review**:

| Ratio                              | Value   | Benchmark  | Assessment                                  |
| ---------------------------------- | ------- | ---------- | ------------------------------------------- |
| Current Ratio                      | 1.78    | >1.5       | Adequate                                    |
| Quick Ratio                        | 0.82    | >0.8       | Borderline                                  |
| AR Turnover (days)                 | 49 days | 45–60 days | Normal                                      |
| Inventory Turnover (days)          | 95 days | 60–90 days | Slightly slow — investigate aged stock      |
| GP Margin                          | 34.4%   | 30–35%     | In range                                    |
| NP Margin                          | 1.5%    | 2–5%       | Slightly low — investigate consulting spike |
| Debt-to-Equity                     | 0.85    | <1.0       | Acceptable                                  |
| Interest Cover (EBIT/Finance Cost) | 2.86x   | >2.5x      | Acceptable                                  |

---

> **End of Pilot Dataset — Gulf Trading Co. FY2025**  
> Prepared for AuditOS Pilot Deployment  
> Data classification: Synthetic / Test Data Only — No Real Client Information  
> Ready for CSV/XLSX export — all figures in SAR
