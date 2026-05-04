# AQLIYA Decision OS - MVP Demo Guide

## نظرة عامة

AQLIYA Decision OS هو نظام ذكاء قراري يساعد المنظمات في اتخاذ قرارات مدروسة حول دخول المناقصات. هذا MVP يركز على حالة استخدام واحدة: **نظام قرار المناقصة (Tender Decision System)**.

---

## هدف الـ MVP

هيكلة → محاكاة → توصية → حوكمة → تعلم

---

## Use Case المستخدم: Non-Profit Training Tender

**السيناريو:**
منظمة غير ربحية تفكر في التقدم لمناقصة تدريب وتمكين 1,000 مستفيد من الضمان الاجتماعي.

---

## مسار العرض (Step-by-Step)

### 1. الصفحة الرئيسية
- افتح `http://localhost:3000/`
- ستظهر شاشة ترحيب مع اسم النظام: **أكليا - نظام دعم القرار**

### 2. قائمة القرارات
- اذهب إلى `/decisions`
- ستجد قراراً واحداً من بيانات seed:
  - **Non-Profit Training & Empowerment Tender - 1,000 Beneficiaries**
  - الحالة: `IN_REVIEW`
  - النوع: `TENDER`
  - المالك: `Ahmed Al-Mansouri`

### 3. تفصيل القرار (Overview)
- انقر على القرار لفتح `/decisions/[id]`
- ستجد:
  - **الأهداف (Objectives):** 3 عناصر
  - **القيود (Constraints):** 3 عناصر
  - **الافتراضات (Assumptions):** 3 عناصر
  - **البدائل (Alternatives):** 3 عناصر
  - **المخاطر (Risks):** 3 عناصر مع مستوى الخطر
  - **ملف المناقصة (Tender Profile):** بيانات العميل والقيم التعاقدية
  - **السيناريوهات (Scenarios):** 3 سيناريوهات مع النتائج
  - **التوصية (Recommendation):** GO_WITH_CONDITIONS

### 4. تبويبات القرار (Tabs)
عند قاع القرار، ستجد 6 تبويبات:
1. **Overview** - نظرة عامة
2. **Tender** - تفاصيل المناقصة
3. **Simulation** - محاكاة السيناريوهات
4. **Recommendation** - التوصية
5. **Governance** - الحوكمة
6. **Report** - التقرير

---

## ماذا يثبت كل تبويب؟

### 1. Tender Tab
- يعرض بيانات المناقصة من `TenderProfile`
- يمكن تعديل البيانات وحفظها
- عند الحفظ، يتم إنشاء **AuditLog** بـ action: `UPDATED` أو `CREATED`

### 2. Simulation Tab
- يعرض 3 سيناريوهات:
  - **Best Case** - أفضل الاحتمالات
  - **Expected Case** - الحالة المتوقعة
  - **Worst Case** - أسوأ الاحتمالات

**كيفية تشغيل المحاكاة:**
1. انقر على زر **"Run Simulation"**
2. سيتم حساب 6 أنواع من النقاط لكل سيناريو:
   - Feasibility Score
   - Financial Score (وزن 30%)
   - Capacity Score (وزن 25%)
   - Risk Score (وزن 25%)
   - Strategic Fit (وزن 20%)
   - Overall Decision Score

**منطق الحساب (Simulation Logic):**
- **Financial:** بناءً على هامش الربح (margin) والعائد على الاستثمار (ROI)
- **Capacity:** بناءً على نسبة السعة المتاحة إلى السعة المطلوبة
- **Risk:** بناءً على مستوى الخطر (Low=85, Medium=65, High=40)
- **Feasibility:** متوسط مرجح لـ Financial و Capacity و Risk
- **Overall:** مجموع مرجح للأنواع الأربعة

### 3. Recommendation Tab
- تُحدث تلقائياً بعد المحاكاة
- **المنطق:**
  - Overall >= 75 → **GO**
  - 55-74 → **GO_WITH_CONDITIONS**
  - < 55 → **NO_GO**

**محتويات التوصية:**
- نوع التوصية (type)
- درجة الثقة (confidenceScore)
- المبررات (reasoning)
- الشروط (conditions)
- ملاحظات المخاطر (riskNotes)

### 4. Governance Tab
يعرض:
- **أدوار القرار:**
  - المالك (Owner): Ahmed Al-Mansouri
  - المراجع (Reviewer): Sara Al-Otaibi
  - المعتمد (Approver): Mohammad Al-Harbi

- **سجل التدقيق (AuditLog):**
  - تاريخ الحدث
  - المستخدم
  - الإجراء (CREATED, UPDATED, STATUS_CHANGED)
  - الكيان (entity)
  - البيانات قبل وبعد التغيير (before/after)

- **الموافقات (Approvals):**
  - الحالة (PENDING, APPROVED, REJECTED)
  - التعليقات

### 5. Report Tab
تقرير قرار مطبوع يحتوي على:
1. **Decision Header** - العنوان، الحالة، المالك
2. **Executive Summary** - ملخص تنفيذي
3. **Tender Context** - سياق المناقصة
4. **Objectives, Constraints, Assumptions, Alternatives**
5. **Risk Map** - خريطة المخاطر
6. **Scenario Comparison** - مقارنة السيناريوهات
7. **Score Breakdown** - تفصيل النقاط
8. **Final Recommendation** - التوصية النهائية
9. **Governance Trail** - مسار الحوكمة

**ميزات التقرير:**
- تصميم جاهز للطباعة (Print-friendly)
- زر **"Print Report"** لطباعة التقرير

---

## ماذا لا يشمله الـ MVP (Out of Scope)

- ❌ نظام مصادقة (Authentication)
- ❌ منظمات متعددة (Multi-tenancy معقد)
- ❌ ذكاء اصطناعي متقدم (AI)
- ❌ تكاملات خارجية (Integrations)
- ❌ محاكاة Monte Carlo
- ❌ تصدير PDF
- ❌ نظام Sales OS

---

## البيانات الحالية (Seed Data)

القرار المعروض:
- **العميل:** Social Development Non-Profit Organization
- **قيمة العقد:** SAR 2,800,000
- **التكلفة المقدرة:** SAR 2,460,000
- **المدة:** 4 أشهر
- **السعة المطلوبة:** 35
- **السعة المتاحة:** 50
- **توافق استراتيجي:** 90/100
- **مستوى الخطر:** LOW
- **هامش الربح:** 12.1%

**النتائج المتوقعة:**
- Best Case: ~93.2
- Expected Case: ~83.0
- Worst Case: ~71.0
- **التوصية:** GO_WITH_CONDITIONS

---

## الخطوة التالية

بعد العرض التجريبي، الخطوات المقترحة:
1. **اختبار التدفق الكامل** - التأكد من سير العمل
2. **إضافة مصادقة بسيطة** - ربط userId الحقيقي
3. **ربط صفحات المنظمات** - Organizations pages
4. **تحسين واجهة المستخدم** - تحسينات بصرية
5. **نشر MVP** - نشر على بيئة تجريبية

---

**مميزات التصميم:**
- ✅ RTL (لغة عربية)
- ✅ Clean UI (بدون طابع chatbot)
- ✅ مؤسسي (Institutional)
- ✅ نظيف (Clean)
