# قائمة التحقق من إطلاق البرنامج التجريبي / Pilot Launch Checklist

> AQLIYA v0.1 — Pilot Launch
> **Date:** 2026-07-25
> **Status:** Pre-Launch

---

## المرحلة 1: التحقق قبل الإطلاق / Phase 1: Pre-Launch Verification

### 1.1 البيئة / Environment

- [ ] بيئة الإطلاق (staging/production) محددة ومهيأة
  Launch environment (staging/production) defined and provisioned
- [ ] قاعدة البيانات مهيأة ومتصلة
  Database provisioned and connected
- [ ] متغيرات البيئة مكتملة وصحيحة
  Environment variables complete and correct
- [ ] شهادة SSL سارية
  SSL certificate valid
- [ ] اسم النطاق (domain) موجه بشكل صحيح
  Domain DNS correctly configured

### 1.2 التبعيات / Dependencies

- [ ] `npm install` ناجح بدون أخطاء
  `npm install` successful with no errors
- [ ] `npx prisma generate` يعمل
  `npx prisma generate` working
- [ ] `npx prisma db push` (أو migrate) ناجح
  `npx prisma db push` (or migrate) successful
- [ ] جميع الحزم محدثة بدون ثغرات حرجة
  All packages up to date with no critical vulnerabilities
- [ ] `npm audit` لا يحتوي على ثغرات HIGH/CRITICAL
  `npm audit` has no HIGH/CRITICAL vulnerabilities

### 1.3 البناء / Build

- [ ] `npx tsc --noEmit` يمر بدون أخطاء
  `npx tsc --noEmit` passes with zero errors
- [ ] `npm run lint` يمر بدون أخطاء جديدة
  `npm run lint` passes with no new errors
- [ ] `npm run build` ناجح
  `npm run build` successful
- [ ] `npm test` جميع الاختبارات تمر
  `npm test` all tests pass

---

## المرحلة 2: بذور البيانات التجريبية / Phase 2: Pilot Seed Data

### 2.1 تنفيذ البذور / Seed Execution

- [ ] تشغيل `npx prisma db seed` (أو `npx ts-node prisma/seed-pilot.ts`)
  Run `npx prisma db seed` (or `npx ts-node prisma/seed-pilot.ts`)
- [ ] لا توجد أخطاء في الإخراج
  No errors in output
- [ ] ظهور رسالة "PILOT SEED COMPLETE"
  "PILOT SEED COMPLETE" message displayed

### 2.2 التحقق من البيانات / Data Verification

- [ ] **8 مستخدمين** بأدوار مختلفة موجودين
  **8 users** with distinct roles exist
  - `admin.pilot@aqliya.com` (ADMIN)
  - `partner.pilot@aqliya.com` (ADMIN)
  - `manager.pilot@aqliya.com` (OPERATOR)
  - `auditor.pilot@aqliya.com` (OPERATOR)
  - `reviewer.pilot@aqliya.com` (OPERATOR)
  - `operator.pilot@aqliya.com` (OPERATOR)
  - `analyst.pilot@aqliya.com` (OPERATOR)
  - `viewer.pilot@aqliya.com` (VIEWER)

- [ ] **كلمة المرور الموحدة:** `pilot123` تعمل لجميع المستخدمين
  **Unified password:** `pilot123` works for all users

- [ ] **AuditOS:** تحقق من:
  - 3 عملاء تدقيق (Audit Clients)
  - مهمتي تدقيق (Engagements)
  - ميزاني مراجعة مع 6 أسطر لكل منهما
  - 5 ملاحظات تدقيقية (Findings)
  - 3 أدلة (Evidence)
  - تعليقي مراجعة (Review Comments)

- [ ] **DecisionOS:** تحقق من:
  - 3 قرارات (Decisions)
  - إطار قرار واحد مع سيناريوهات ومخاطر وأهداف
  - توصية واحدة ودليل واحد

- [ ] **LocalContentOS:** تحقق من:
  - مشروعي محتوى محلي
  - 6 موردين (Suppliers)
  - 10 سجلات إنفاق (Spend Records)
  - 4 ملاحظات (Findings)
  - 3 أدلة (Evidence)

- [ ] **SalesOS:** تحقق من:
  - مسار مبيعات واحد مع 5 مراحل
  - 4 حسابات (Accounts)
  - 3 صفقات (Deals)
  - 6 تفاعلات (Interactions)

- [ ] **Content Studio:** تحقق من:
  - 3 مساحات عمل (Workspaces)
  - 8 محتويات (Content Items)

- [ ] **LocalContactOS:** تحقق من:
  - 5 جهات اتصال (Contacts)
  - 3 علاقات (Relations)
  - 4 تفاعلات (Interactions)

- [ ] **RiskOS:** تحقق من:
  - نموذج مخاطر واحد
  - تقييم مخاطر واحد
  - 3 إجراءات مخاطر (Procedures)

- [ ] **PlatformAuditLog:** تحقق من:
  - 20 سجل تدقيق موحد
  - تغطية جميع المنتجات الستة (auditos، decisionos، localcontentos، salesos، riskos، platform)
  - كل سجل يحتوي على productKey، action، actorId، eventDescription

### 2.3 عدد السجلات / Record Count

- [ ] **180+ سجل مؤسسي** سعودي تم إنشاؤه بنجاح
  **180+ Saudi institutional records** created successfully
- [ ] جميع السجلات مرتبطة بالمنظمة التجريبية
  All records linked to pilot organization

---

## المرحلة 3: اختبار الدخان / Phase 3: Smoke Test

### 3.1 المصادقة / Authentication

- [ ] صفحة تسجيل الدخول تعمل
  Login page loads
- [ ] تسجيل الدخول كـ `admin.pilot@aqliya.com` يعمل
  Login as `admin.pilot@aqliya.com` works
- [ ] تسجيل الدخول كـ `viewer.pilot@aqliya.com` يعمل
  Login as `viewer.pilot@aqliya.com` works
- [ ] تسجيل الخروج يعمل
  Logout works
- [ ] كلمة مرور خاطئة تظهر رسالة خطأ
  Wrong password shows error message

### 3.2 الصلاحيات / RBAC

- [ ] ADMIN يمكنه الوصول لجميع الصفحات
  ADMIN can access all pages
- [ ] OPERATOR لا يمكنه الوصول لصفحات الإدارة
  OPERATOR cannot access admin pages
- [ ] VIEWER لا يمكنه إجراء تعديلات
  VIEWER cannot perform mutations
- [ ] كل دور يرى فقط ما هو مصرح له
  Each role sees only what is authorized

### 3.3 التنقل / Navigation

- [ ] لوحة التحكم الرئيسية تعرض البيانات
  Main dashboard displays data
- [ ] شريط التنقل يعمل لجميع المنتجات
  Navigation sidebar works for all products
- [ ] **AuditOS:** `/audit` يعرض المهام التدقيقية
  `/audit` shows audit engagements
- [ ] **DecisionOS:** `/decisions` يعرض القرارات
  `/decisions` shows decisions
- [ ] **LocalContentOS:** `/local-content` يعرض المشاريع
  `/local-content` shows projects
- [ ] **SalesOS:** `/sales` يعرض خط المبيعات
  `/sales` shows sales pipeline
- [ ] **WorkflowOS:** `/workflowos` يعمل
  `/workflowos` works

### 3.4 سجل التدقيق الموحد / Unified Audit Trail

- [ ] **الإعدادات > سجل التدقيق** يعرض 20+ سجل
  **Settings > Audit Logs** shows 20+ entries
- [ ] فلتر المنتج يعمل (auditos، decisionos، إلخ)
  Product filter works (auditos, decisionos, etc.)
- [ ] فلتر نوع الإجراء يعمل
  Action type filter works
- [ ] فلتر المستخدم يعمل
  User filter works
- [ ] تفاصيل السجل تظهر جميع الحقول
  Log details show all fields
- [ ] **الإعدادات > التحقق من السلسلة** يعمل
  **Settings > Chain Verification** works

### 3.5 العمليات الأساسية / Core Operations

- [ ] إنشاء ملاحظة تدقيقية جديدة (AuditOS)
  Create a new audit finding
- [ ] إنشاء قرار جديد (DecisionOS)
  Create a new decision
- [ ] إضافة مورد جديد (LocalContentOS)
  Add a new supplier
- [ ] تحديث مرحلة صفقة (SalesOS)
  Update a deal stage
- [ ] إضافة جهة اتصال (LocalContactOS)
  Add a contact

### 3.6 نقاط النهاية / Endpoints

- [ ] `/api/platform/health` يعيد 200
  `/api/platform/health` returns 200
- [ ] صفحة 404 المخصصة تعمل
  Custom 404 page works
- [ ] صفحة 500 المخصصة تعمل
  Custom 500 page works

---

## المرحلة 4: اختبار الأداء / Phase 4: Performance Check

- [ ] تحميل الصفحة الرئيسية أقل من 3 ثوانٍ
  Main page loads in under 3 seconds
- [ ] تحميل صفحة سجل التدقيق مع 20 سجل أقل من 2 ثانية
  Audit log page with 20 entries loads in under 2 seconds
- [ ] لا توجد أخطاء في console المتصفح
  No errors in browser console
- [ ] لا توجد تسريبات في الذاكرة بعد 5 دقائق من الاستخدام
  No memory leaks after 5 minutes of usage

---

## المرحلة 5: خطة التراجع / Phase 5: Rollback Plan

### 5.1 محفزات التراجع / Rollback Triggers

إذا حدث أي من التالي، يتم تفعيل خطة التراجع فوراً:
If any of the following occurs, rollback is activated immediately:

- [ ] فشل في المصادقة لجميع المستخدمين
  Authentication failure for all users
- [ ] ثغرة أمنية حرجة تم اكتشافها
  Critical security vulnerability discovered
- [ ] فقدان أو تلف بيانات حقيقية
  Real data loss or corruption
- [ ] توقف الخدمة لأكثر من 15 دقيقة
  Service outage exceeding 15 minutes
- [ ] خطأ في قاعدة البيانات يؤثر على البيانات
  Database error affecting data integrity

### 5.2 إجراءات التراجع / Rollback Procedure

1. **إيقاف الخدمة / Stop Service:**
   - `npm run stop` أو إيقاف حاوية Docker
   - `npm run stop` or stop Docker container

2. **استعادة قاعدة البيانات / Restore Database:**
   - استخدام أحدث نسخة احتياطية: `npm run backup:restore`
   - Use latest backup: `npm run backup:restore`

3. **استعادة الكود / Restore Code:**
   - `git checkout <previous-stable-commit>`
   - `npm run build`

4. **إعادة التشغيل / Restart:**
   - `npm run start`

5. **التحقق / Verify:**
   - تشغيل اختبار الدخان من المرحلة 3
   - Run smoke test from Phase 3

### 5.3 جهات الاتصال للطوارئ / Emergency Contacts

| الدور / Role | الاسم / Name | البريد / Email |
|-------------|-------------|----------------|
| مسؤول النظام / System Admin | — | admin@aqliya.com |
| مسؤول الأمن / Security | — | security@aqliya.com |
| مدير المشروع / Project Manager | — | pm@aqliya.com |
| الدعم الفني / Tech Support | — | support@aqliya.com |

---

## المرحلة 6: التوثيق / Phase 6: Documentation

- [ ] دليل المستخدم محدث (`PILOT_USER_GUIDE.md`)
  User guide updated
- [ ] سيناريو العرض محدث (`DEMO_FLOW.md`)
  Demo flow script updated
- [ ] قائمة التحقق هذه مكتملة
  This checklist completed
- [ ] تقرير الإطلاق جاهز للتوقيع
  Launch report ready for sign-off

---

## المرحلة 7: التوقيع / Phase 7: Sign-Off

| الموقّع / Signatory | الدور / Role | التاريخ / Date | التوقيع / Signature |
|---------------------|-------------|----------------|---------------------|
| — | مدير النظام / System Admin | — | — |
| — | مدير المشروع / Project Manager | — | — |
| — | مسؤول الأمن / Security Officer | — | — |

---

## الملاحظات / Notes

- جميع بنود القائمة يجب أن تكون ✓ قبل الإطلاق
  All checklist items must be ✓ before launch
- أي بند ❌ يحتاج إلى توثيق السبب والإجراء التصحيحي
  Any ❌ item requires documented reason and corrective action
- النسخة الاحتياطية قبل الإطلاق إلزامية
  Pre-launch backup is mandatory
- مبدأ الثقة: الذكاء الاصطناعي يساعد، الإنسان يقرر، الدليل يحكم
  Trust principle: AI assists, humans decide, evidence governs
