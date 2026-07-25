# دليل المستخدم الأولي / Pilot User Guide

> AQLIYA v0.1 — Pilot Program
> Date: 2026-07-13

---

## مقدمة / Introduction

AQLIYA هي منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة، مع حوكمة، أدلة، صلاحيات، وسجل تدقيقي.

AQLIYA is a Private Governed Institutional Intelligence Platform that helps institutions build governed, evidence-based intelligent systems across cloud and private environments.

هذا الدليل يساعدك على البدء في استخدام المنصة في بيئة التجريب.

This guide helps you get started using the platform in the pilot environment.

---

## ما الجديد / What's New (يوليو 2026)

> **آخر تحديث:** 2026-07-25 | **Last Updated:** 2026-07-25

### دمج سجل التدقيق / Unified Audit Trail

تم دمج جميع سجلات التدقيق الخاصة بالمنتجات في نموذج **PlatformAuditLog** الموحد.
All product-specific audit logs have been merged into a single unified **PlatformAuditLog** model.

- **قبل / Before:** كل منتج كان له جدول تدقيق منفصل (AuditEvent، AuditLog، SalesAuditEvent، إلخ)
  Each product had its own audit table (AuditEvent, AuditLog, SalesAuditEvent, etc.)
- **بعد / After:** سجل واحد موحد `PlatformAuditLog` يغطي جميع المنتجات والمنصة
  One unified `PlatformAuditLog` table covering all products and platform events
- **الفوائد / Benefits:**
  - رؤية موحدة لكل الأحداث / Single unified view of all events
  - تتبع كامل عبر المنتجات / Cross-product traceability
  - سلسلة تدقيق مشفرة / Cryptographic hash chain verification
  - دعم الذكاء الاصطناعي مع درجة ثقة / AI event tracking with confidence scores
  - تحليل موحد للصلاحيات / Unified RBAC audit analysis

### تحسينات البيانات التجريبية / Pilot Data Improvements

- **180+ سجل مؤسسي** سعودي واقعي عبر جميع المنتجات
  **180+ Saudi institutional records** across all product areas
- **20 سجل تدقيق موحد** تغطي 6 منتجات
  **20 unified audit log entries** covering 6 product areas
- **8 مستخدمين** بأدوار وصلاحيات مختلفة
  **8 users** with distinct roles and permissions

---


---

## المبادئ الأساسية / Core Principles

| المبدأ / Principle | الشرح / Description |
|---------------------|---------------------|
| الذكاء الاصطناعي يساعد | AI assists — suggestions, not decisions |
| الإنسان يقرر | Humans decide — every AI output requires human review |
| الدليل يحكم | Evidence governs — every decision links to evidence |

---

## الحسابات التجريبية / Demo Accounts

| البريد الإلكتروني / Email | كلمة المرور / Password | الدور / Role | الدور بالعربي / Arabic Role |
|---------------------------|------------------------|--------------|----------------------------|
| admin@aqliya.com | admin123 | ADMIN | مدير النظام |
| partner@aqliya.com | partner123 | PARTNER | شريك |
| manager@aqliya.com | manager123 | MANAGER | مدير |
| reviewer@aqliya.com | reviewer123 | REVIEWER | مراجع |
| operator@aqliya.com | operator123 | OPERATOR | مشغل |

> ⚠️ ملاحظة: هذه حسابات تجريبية فقط. جميع البيانات في بيئة التجريب.
> Note: These are pilot accounts only. All data is in the pilot environment.

---

## الصلاحيات حسب الدور / Role-Based Permissions

| الدور / Role | الوصول / Access | الملاحظات / Notes |
|--------------|-----------------|-------------------|
| ADMIN | كامل / Full | إدارة النظام والمستخدمين / System & user management |
| PARTNER | واسع / Broad | رؤية شاملة للمنتجات / Cross-product visibility |
| MANAGER | إداري / Managerial | إنشاء وإدارة المشاريع / Create & manage projects |
| REVIEWER | مراجعة / Review | مراجعة واعتماد / Review & approve |
| OPERATOR | تشغيلي / Operational | تنفيذ المهام اليومية / Daily task execution |

---

## الواجهة الرئيسية / Main Interface

### تسجيل الدخول / Login

1. افتح المتصفح وانتقل إلى عنوان المنصة
2. Open browser and navigate to the platform URL
3. أدخل البريد الإلكتروني وكلمة المرور
4. Enter email and password
5. اضغط "تسجيل الدخول" / Click "Login"

### شريط التنقل / Navigation Sidebar

| القسم / Section | الرابط / Route | الوصف / Description |
|----------------|---------------|---------------------|
| لوحة التحكم | /overview | نظرة عامة على المنصة / Platform overview |
| التدقيق | /audit | AuditOS — التدقيق والمراجعة |
| القرارات | /decisions | DecisionOS — اتخاذ القرارات |
| المحتوى المحلي | /local-content | LocalContentOS — المحتوى المحلي |
| المبيعات | /sales | SalesOS — المبيعات |
| سير العمل | /workflowos | WorkflowOS — سير العمل |
| المراقبة | /monitoring | لوحة المراقبة / Monitoring dashboard |

---

## المسارات الرئيسية / Key Workflows

### 1. AuditOS — التدقيق والمراجعة

التدقيق والمراجعة المالية هي اللبنة الأولى لمنصة AQLIYA.

Financial audit and review is the foundational product of AQLIYA.

**خطوات العمل / Workflow Steps:**

| الخطوة / Step | الوصف / Description | بالعربي / Arabic |
|--------------|---------------------|------------------|
| 1 | Create engagement | إنشاء عملية تدقيق |
| 2 | Upload trial balance | رفع ميزان المراجعة |
| 3 | Map accounts | تعيين الحسابات |
| 4 | Generate financial statements | إنشاء القوائم المالية |
| 5 | Upload evidence | إرفاق الأدلة |
| 6 | Create findings | إنشاء الملاحظات |
| 7 | Review | مراجعة |
| 8 | Approve | اعتماد |
| 9 | Export | تصدير |

**الوصول:** انتقل إلى /audit
**Access:** Navigate to /audit

---

### 2. DecisionOS — اتخاذ القرارات

نظام حوكمة القرارات يضمن أن كل قرار موثق ومدعوم بالدليل.

The Decision Governance System ensures every decision is documented and evidence-backed.

**خطوات العمل / Workflow Steps:**

| الخطوة / Step | الوصف / Description | بالعربي / Arabic |
|--------------|---------------------|------------------|
| 1 | Create decision request | إنشاء طلب قرار |
| 2 | Add context and data | إضافة السياق والبيانات |
| 3 | Analyze risks | تحليل المخاطر |
| 4 | Generate recommendation | إنشاء توصية |
| 5 | Review and vote | مراجعة وتصويت |
| 6 | Approve / Archive | اعتماد / أرشفة |

**الوصول:** انتقل إلى /decisions
**Access:** Navigate to /decisions

---

### 3. LocalContentOS — المحتوى المحلي

نظام المحتوى المحلي يساعد المؤسسات على تتبع وتحسين محتوىهم المحلي.

Local Content System helps institutions track and improve their local content.

**خطوات العمل / Workflow Steps:**

| الخطوة / Step | الوصف / Description | بالعربي / Arabic |
|--------------|---------------------|------------------|
| 1 | Create project | إنشاء مشروع |
| 2 | Add suppliers | إضافة موردين |
| 3 | Track spend | تتبع الإنفاق |
| 4 | Classify content | تصنيف المحتوى |
| 5 | Score local content | تقييم المحتوى المحلي |
| 6 | Upload evidence | إرفاق الأدلة |
| 7 | Create findings | إنشاء ملاحظات |
| 8 | Review & Export | مراجعة وتصدير |

**الوصول:** انتقل إلى /local-content
**Access:** Navigate to /local-content

---

### 4. SalesOS — المبيعات

نظام المبيعات يوفر رؤية شاملة للحسابات والفرص مع حوكمة كاملة.

Sales System provides full visibility into accounts and opportunities with complete governance.

**خطوات العمل / Workflow Steps:**

| الخطوة / Step | الوصف / Description | بالعربي / Arabic |
|--------------|---------------------|------------------|
| 1 | View dashboard | عرض لوحة التحكم |
| 2 | Manage pipeline | إدارة خط المبيعات |
| 3 | Track deals | تتبع الصفقات |
| 4 | Manage accounts | إدارة الحسابات |
| 5 | Review intelligence | مراجعة الذكاء |
| 6 | Generate reports | إنشاء تقارير |

**الوصول:** انتقل إلى /sales
**Access:** Navigate to /sales

---

### 5. WorkflowOS — سير العمل

نظام سير العمل يتيح إنشاء وتنفيذ عمليات مؤسسية مضبوطة.

Workflow System enables creation and execution of governed institutional processes.

**خطوات العمل / Workflow Steps:**

| الخطوة / Step | الوصف / Description | بالعربي / Arabic |
|--------------|---------------------|------------------|
| 1 | Create template | إنشاء قالب |
| 2 | Execute workflow | تنفيذ سير العمل |
| 3 | Track SLA | تتبع التزامات الوقت |
| 4 | Export results | تصدير النتائج |

**الوصول:** انتقل إلى /workflowos
**Access:** Navigate to /workflowos

---

## ميزات الحوكمة / Governance Features

### سجل التدقيق / Audit Trail

كل إجراء في المنصة مسجل. يمكنك مراجعة:
Every action on the platform is logged. You can review:

- من قام بالإجراء / Who performed the action
- متى تم / When it was performed
- ماذا تم / What was done
- أي أدلة مرتبطة / What evidence is linked

### مراجعة واعتماد / Review & Approval

المخرجات المهمة تحتاج مراجعة واعتماد قبل التصدير:
Important outputs require review and approval before export:

1. إنشاء المخرج / Create output
2. مراجعة من مراجع / Review by reviewer
3. اعتماد من مدير / Approval by manager
4. تصدير / Export


### سجل التدقيق الموحد / Unified Audit Trail (PlatformAuditLog)

جميع الأحداث في المنصة مسجلة في سجل تدقيق موحد واحد.
All platform events are logged in a single unified audit trail.

**ما يتم تسجيله / What is logged:**

| الحقل / Field | الوصف / Description |
|---------------|---------------------|
| **productKey** | المنتج (auditos، decisionos، salesos، إلخ) / Product area |
| **action** | نوع الإجراء (إنشاء، تعديل، اعتماد، إلخ) / Action type |
| **actorId / actorName** | من قام بالإجراء / Who performed the action |
| **targetType / targetId** | ما هو المستهدف / What was affected |
| **severity** | مستوى الخطورة (info، warning، critical) |
| **eventDescription** | وصف كامل للحدث / Full event description |
| **aiRelated** | هل الحدث متعلق بالذكاء الاصطناعي؟ / AI involvement |
| **aiConfidence** | درجة ثقة الذكاء الاصطناعي / AI confidence score |
| **evidenceRefs** | الأدلة المرتبطة / Linked evidence |

**الوصول إلى السجل / Accessing the audit trail:**

1. انتقل إلى **الإعدادات > سجل التدقيق** / Navigate to **Settings > Audit Logs**
2. استخدم الفلاتر حسب المنتج، نوع الإجراء، المستخدم / Filter by product, action type, user
3. تحقق من سلامة السلسلة (Hash Chain) / Verify chain integrity
4. صدّر السجل للتحليل الخارجي / Export for external analysis

**التحقق من سلسلة التجزئة / Hash Chain Verification:**

- انتقل إلى **الإعدادات > التحقق من السلسلة** / Navigate to **Settings > Chain Verification**
- كل سجل تدقيق مرتبط بالسجل السابق بتجزئة مشفرة
  Each audit log entry is cryptographically linked to the previous entry
- أي تعديل غير مصرح به سيظهر فوراً
  Any unauthorized modification is immediately detectable

### عزل البيانات / Data Isolation

كل منظمة بياناتها معزولة. لا يمكن لمنظمة رؤية بيانات منظمة أخرى.
Each organization's data is isolated. One organization cannot see another's data.

---

## ملاحظات أمنية / Security Notes

- جميع البيانات في بيئة التجريب — لا توجد بيانات حقيقية للعملاء
- All data is demo data — no real customer data

- الصلاحيات مضبوطة حسب الدور: كل دور له صلاحيات مختلفة
- RBAC enforced: each role has different permissions

- كل الإجراءات مسجلة في سجل التدقيق
- All actions are audited

- التصديرات تحتاج اعتماد
- Exports require approval

- مبدأ الثقة: الذكاء الاصطناعي يساعد، الإنسان يقرر، الدليل يحكم
- Trust principle: AI assists, humans decide, evidence governs

---

## الأسئلة الشائعة / FAQ

### س: كيف أعيد تعيين كلمة المرور؟
### Q: How do I reset my password?

ر: اتصل بمدير النظام
A: Contact the system administrator

### س: هل يمكنني تغيير الدور؟
### Q: Can I change my role?

ر: يتطلب موافقة مدير النظام
A: Requires system administrator approval

### س: ماذا يحدث إذا فشلت عملية؟
### Q: What happens if an operation fails?

ر: سيتم تسجيل الخطأ. تحقق من سجل التدقيق أو تواصل مع الدعم.
A: The error will be logged. Check the audit trail or contact support.

---

## الدعم / Support

- البريد الإلكتروني / Email: support@aqliya.com
- التوثيق / Documentation: /docs
- سجل التدقيق / Audit Trail: متوفر في كل صفحة / Available on every page

---

> ملاحظة: هذا دليل أولي. سيتم تحديثه بناءً على ملاحظات المشاركين في البرنامج التجريبي.
> Note: This is an initial guide. It will be updated based on pilot program participant feedback.
