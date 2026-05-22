# AQLIYA Controlled Pilot — Customer Trial Balance Request Message

**Document:** 10-customer-tb-request-message.md  
**Purpose:** Customer-facing message requesting the Trial Balance file for the pilot.  
**Tone:** Professional, concise, trust-driven  

---

## Arabic Version

### الموضوع: طلب ميزان المراجعة — تجربة AuditOS

السلام عليكم ورحمة الله وبركاتة،

نشكر لكم اهتمامكم بالمشاركة في التجربة التجريبية لـ AuditOS.

لبدء التجربة، نرجو منكم تزويدنا بميزان المراجعة (Trial Balance) الخاص بفترة التقرير المتفق عليها. سيتم استخدام الميزان كمدخل أساسي للنظام لإنتاج مسودات القوائم المالية والإيضاحات ومتطلبات الأدلة ومسارات المراجعة والتتبع.

**البيانات المطلوبة:**

| الحقل | مطلوب؟ | ملاحظات |
|-------|--------|---------|
| كود الحساب | مطلوب | يجب أن يكون فريدًا لكل حساب |
| اسم الحساب | مطلوب | بالعربية أو الإنجليزية |
| مبلغ مدين (Debit) | مطلوب | قيمة رقمية، أعلى من أو تساوي صفر |
| مبلغ دائن (Credit) | مطلوب | قيمة رقمية، أعلى من أو تساوي صفر |
| عملة الميزان | مطلوب | مثلاً: SAR, USD |

**البيانات الاختيارية:**

| الحقل | يوصى به؟ | ملاحظات |
|-------|-----------|---------|
| رصيد افتتاحي (Opening Balance) | يوصى به | للمقارنة مع الفترة السابقة |
| رصيد السنة السابقة (Prior Year Balance) | يوصى به | لتحليل الاتجاهات |
| تصنيف الحساب | إضافي | يساعد في التصنيف الآلي |
| فترة التقرير | إضافي | يجب أن تتطابق مع فترة التجربة |
| اسم المنشأة | إضافي | في حال وجود ميزان لكيانات متعددة |

**الصيغ المدعومة:** Excel (.xlsx, .xls) أو CSV (.csv)

**ملاحظات مهمة:**

- جميع مخرجات النظام هي **مسودات** وتتطلب مراجعة بشرية قبل الاعتماد.
- الذكاء الاصطناعي يقدم اقتراحات فقط — القرار النهائي للمراجع.
- يتم تتبع كل مخرج إلى مصدره الأصلي في ميزان المراجعة.

**الخطوات التالية بعد استلام الميزان:**

1. استلام الملف وتأكيد الاستلام
2. التحقق من جودة البيانات
3. تحميل الميزان إلى النظام ومعالجته
4. إنتاج القوائم المالية والإيضاحات
5. مراجعة المخرجات مع فريقكم
6. جمع الملاحظات

نتطلع للعمل معكم في هذه التجربة.

مع جزيل الشكر،

فريق AQLIYA

---

## English Version

### Subject: Trial Balance Request — AuditOS Pilot

Dear [Customer Name],

Thank you for participating in the AuditOS pilot program.

To begin, please provide us with your Trial Balance for the agreed reporting period. This file will serve as the primary input for the system to generate draft financial statements, notes, evidence requirements, review workflows, and traceability chains.

**Required Fields:**

| Field | Required? | Notes |
|-------|-----------|-------|
| Account Code | Required | Must be unique per account |
| Account Name | Required | Arabic or English |
| Debit Amount | Required | Numeric, ≥ 0 |
| Credit Amount | Required | Numeric, ≥ 0 |
| Currency | Required | e.g., SAR, USD |

**Optional Fields:**

| Field | Recommended? | Notes |
|-------|--------------|-------|
| Opening Balance | Recommended | For comparative analysis |
| Prior Year Balance | Recommended | For trend analysis |
| Account Type | Nice-to-have | Helps with auto-classification |
| Reporting Period | Nice-to-have | Should match pilot period |
| Entity Name | Nice-to-have | For multi-entity TBs |

**Accepted Formats:** Excel (.xlsx, .xls) or CSV (.csv)

**Important Notes:**

- All system outputs are **drafts** and require human review before use.
- AI provides suggestions only — final decisions rest with the reviewer.
- Every output is traceable back to its source in the Trial Balance.

**Next Steps After Receipt:**

1. File receipt acknowledged
2. Data quality validation
3. File uploaded to system and processed
4. Financial statements and notes generated
5. Outputs reviewed with your team
6. Feedback collected

We look forward to running this pilot with you.

Best regards,

The AQLIYA Team

---

## Delivery

| Field | Value |
|-------|-------|
| Send via | Email |
| Attachments | None (message only) |
| Subject line | [Customer Name] — AuditOS Pilot — Trial Balance Request |
| Expected response | TB file attached or secure link |
