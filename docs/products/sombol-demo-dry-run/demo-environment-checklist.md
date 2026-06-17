# Sombol Demo — Environment Checklist

**Demo date:** TBD
**Environment:** AQLIYA Cloud MVP RC1 (staging/demo, not production)
**Prepared by:** AQLIYA

---

## App Route Checklist

| # | المسار | الوظيفة | يعمل؟ |
|---|---|---|---|
| 1 | `/login` | صفحة تسجيل الدخول | ☐ |
| 2 | `/` | الصفحة الرئيسية | ☐ |
| 3 | `/(dashboard)/decisions` | DecisionOS (اختياري) | ☐ |
| 4 | `/settings/platform-organization` | منظمة المنصة | ☐ |
| 5 | `/settings/workspaces` | مساحات العمل | ☐ |
| 6 | `/settings/audit-logs` | سجل التدقيق | ☐ |
| 7 | `/audit` | لوحة AuditOS | ☐ |
| 8 | `/audit/engagements/[id]` | تفاصيل Engagement | ☐ |
| 9 | `/assistant` | Office AI Assistant الرئيسية | ☐ |
| 10 | `/assistant/[taskId]` | تفاصيل مهمة Office AI | ☐ |

## Login/Auth Checklist

| # | العنصر | يعمل؟ |
|---|---|---|
| 1 | تسجيل الدخول بالبريد الإلكتروني وكلمة المرور | ☐ |
| 2 | توجيه المستخدم غير الموثّق إلى /login | ☐ |
| 3 | حماية جميع مسارات العمل (middleware) | ☐ |
| 4 | تسجيل الخروج | ☐ |
| 5 | مستخدم تجريبي باسم "أحمد الغامدي" موجود | ☐ |

## Sidebar/Navigation Checklist

| # | العنصر | يعمل؟ |
|---|---|---|
| 1 | شريط التنقل الجانبي يظهر في AuditOS | ☐ |
| 2 | شريط التنقل الجانبي يظهر في DecisionOS | ☐ |
| 3 | رابط "Office AI Assistant" يظهر في التنقل | ☐ |
| 4 | رابط "Platform Audit Logs" يظهر | ☐ |
| 5 | رابط "Client Workspaces" يظهر | ☐ |
| 6 | مؤشر الوحدة النشطة (active module) صحيح | ☐ |
| 7 | زر طي/توسيع الشريط يعمل | ☐ |

## AuditOS Checklist

| # | العنصر | يعمل؟ |
|---|---|---|
| 1 | لوحة AuditOS تعرض الملخص (KPI cards) | ☐ |
| 2 | قائمة engagements تظهر | ☐ |
| 3 | engagement يعرض سياق المنصة (Platform Context Card) | ☐ |
| 4 | علامات التبويب (tab bar) تعمل | ☐ |
| 5 | ميزان المراجعة مرئي | ☐ |
| 6 | الأدلة مرئية | ☐ |
| 7 | النتائج مرئية | ☐ |
| 8 | سير عمل المراجعة مرئي | ☐ |

## Office AI Assistant Checklist

| # | العنصر | يعمل؟ |
|---|---|---|
| 1 | صفحة `/assistant` تظهر | ☐ |
| 2 | أنواع المهام (6 أنواع) مرئية | ☐ |
| 3 | نموذج إنشاء المهمة يعمل | ☐ |
| 4 | مهمة جديدة تظهر في Recent Tasks | ☐ |
| 5 | صفحة `/assistant/[taskId]` تظهر | ☐ |
| 6 | شريط التقدم (Status stepper) مرئي | ☐ |
| 7 | رفع ملف (file upload) يعمل | ☐ |
| 8 | توليد مسودة (Generate Draft) يعمل | ☐ |
| 9 | المسودة تحتوي على محتوى مستخرج من الملف | ☐ |
| 10 | إخلاء المسؤولية (disclaimer) مرئي | ☐ |
| 11 | زر "Approve" يعمل | ☐ |
| 12 | زر "Reject" يعمل | ☐ |
| 13 | إشعار الحوكمة (Governance Notice) مرئي | ☐ |

## PlatformAuditLog Checklist

| # | العنصر | يعمل؟ |
|---|---|---|
| 1 | صفحة `/settings/audit-logs` تظهر | ☐ |
| 2 | إحصائيات الملخص (Summary cards) مرئية | ☐ |
| 3 | أحداث office_ai_assistant مرئية | ☐ |
| 4 | أحداث audit_os مرئية | ☐ |
| 5 | تصفية حسب المنتج تعمل | ☐ |
| 6 | علامة TEST للأحداث التجريبية مرئية | ☐ |

## Browser/Device Checklist

| # | العنصر | يعمل؟ |
|---|---|---|
| 1 | Chrome (أحدث إصدار) | ☐ |
| 2 | Edge (أحدث إصدار) | ☐ |
| 3 | شاشة 1920×1080 أو أعلى | ☐ |
| 4 | RTL (اتجاه من اليمين لليسار) صحيح | ☐ |
| 5 | الخط العربي (Noto Sans Arabic) يظهر بشكل صحيح | ☐ |
| 6 | التمرير (scrolling) يعمل في القوائم الطويلة | ☐ |

## Server Run Instructions

| # | الوضع | الأمر | ملاحظات |
|---|---|---|---|
| 1 | تطوير محلي (localhost فقط) | `npm run dev` | يعمل على `localhost:3000` |
| 2 | **شبكة/عميل (Network Demo)** | `npm run build && npm run start:network` | **الوضع الموصى به للعرض** — يعمل على `http://[IP]:3000` |
| 3 | اختصار الشبكة | `npm run start:network` | بعد البناء الأولي: `npm run build` |

> ⚠ **تحذير:** لا تستخدم `npm run dev` لعرض الشبكة. `next-intl` v4 قد يُرجع 404 لبعض المسارات المحمية في وضع التطوير. استخدم `npm run build && npm run start:network` بدلاً من ذلك.

---

## Internet/Demo Fallback Checklist

| # | العنصر | تم التجهيز؟ |
|---|---|---|
| 1 | الإنترنت مستقر — سرعة 10 ميجابت+ | ☐ |
| 2 | خطة بديلة (عرض PDF بدون اتصال) جاهزة | ☐ |
| 3 | متصفح بديل مثبت | ☐ |
| 4 | حساب احتياطي جاهز | ☐ |
| 5 | الملفات التجريبية محفوظة محلياً | ☐ |
