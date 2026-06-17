# Sombol Demo — Test Data Plan

**Environment:** Demo/Staging (not production)
**Data classification:** All data is synthetic/mock — no real client data

---

## Demo Organization

| الحقل | القيمة |
|---|---|
| اسم المنظمة | Sombol Demo |
| PlatformOrganization.slug | sombol-demo |
| مستخدم تجريبي | Ahmed Al Ghamdi / ahmed@sombol-demo.com |
| صلاحية المستخدم | ADMIN |

---

## Client Workspaces

| # | اسم مساحة العمل | النوع | الحالة |
|---|---|---|---|
| 1 | شركة الخليج للتجارة | audit | active |
| 2 | مؤسسة نجد للخدمات | audit | active |

---

## Projects

| # | اسم المشروع | مساحة العمل | ملاحظات |
|---|---|---|---|
| 1 | الخليج — تدقيق مالي 2025 | شركة الخليج للتجارة | Engagement موجود |
| 2 | نجد — تدقيق 2025 | مؤسسة نجد للخدمات | Engagement موجود |

---

## AuditOS Engagement

| الحقل | القيمة |
|---|---|
| العميل | Gulf Trading Co. |
| الفترة المالية | FY2025 |
| الحالة | in_progress |
| ميزان المراجعة | تجريبي (أرقام وهمية) |
| الأدلة | ملف PDF تجريبي + إيصال |
| النتائج | نتيجتان مفتوحتان |

---

## Office AI — Test Files

| # | اسم الملف | النوع | المحتوى | الاستخدام في العرض |
|---|---|---|---|---|
| 1 | financial-summary-q3.xlsx | XLSX | أرقام مبيعات ومصروفات وهمية | Excel Analysis |
| 2 | board-report-q3.pdf | PDF (طبقة نصية) | تقرير تجريبي عن الأداء المالي | Document Summary |
| 3 | meeting-notes.docx | DOCX | ملاحظات اجتماع وهمية | Meeting Notes |
| 4 | supplier-data.csv | CSV | قائمة موردين وهمية | Excel Analysis |

**محتويات الملفات:**

**financial-summary-q3.xlsx:**
| Sheet name | Columns |
|---|---|
| Summary | Quarter, Revenue, Cost, Profit, Margin |
| Details | Client, Service, Revenue, Cost, Date |

**board-report-q3.pdf نص تجريبي:**
```
Q3 2025 Financial Performance Summary
Revenue increased by 12% compared to Q2.
Operating costs decreased by 5%.
Key achievements: new client acquisition, process optimization.
```

**meeting-notes.docx نص تجريبي:**
```
Meeting: Quarterly Review
Date: 2025-10-15
Attendees: Ahmed, Sara, Khalid
Topics: Budget review, resource planning, risk assessment
Decisions: Approve Q4 budget, hire 2 additional auditors
```

**supplier-data.csv:**
```
Supplier Name,Category,Contract Value,Performance Rating
Al-Rajhi Supplies,Office,250000,4.5
Al-Othaim Logistics,Transport,180000,4.2
Saudi Tech Solutions,IT,320000,4.8
```

---

## Office AI — Demo Tasks

| # | نوع المهمة | اللغة | الملف المرفق | التعليمات |
|---|---|---|---|---|
| 1 | document_summary | ar | board-report-q3.pdf | "لخص تقرير الربع الثالث" |
| 2 | excel_analysis | ar | financial-summary-q3.xlsx | "حلل بيانات المبيعات" |
| 3 | meeting_notes | ar | meeting-notes.docx | "نظم ملاحظات الاجتماع" |
| 4 | executive_summary | en | (بدون ملف) | "Summarize the key achievements" |

---

## What Must Be Anonymized

| العنصر | الإجراء |
|---|---|
| أسماء العملاء | استخدم أسماء وهمية |
| أرقام الحسابات | استخدم أرقاماً وهمية |
| المبالغ المالية | غيّر القيم — لا تستخدم أرقاماً حقيقية |

## What Must NOT Be Used

| ❌ | السبب |
|---|---|
| بيانات عملاء حقيقية | مخاطرة أمنية وقانونية |
| مستندات ممسوحة ضوئياً | OCR غير مطبّق — لن يتم استخراج النص |
| ملفات أكبر من 10 MB | حد المنصة |
| ملفات تنفيذية (.exe, .msi) | ممنوعة لأسباب أمنية |
