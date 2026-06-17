# AQLIYA Cloud MVP RC1 — Demo Readiness Checklist

**Client:** Sombol (target)
**Demo format:** Live Cloud SaaS walkthrough
**Duration:** 20 minutes

---

## Pre-Demo Checklist

| # | العنصر | الحالة |
|---|---|---|
| 1 | بيئة العرض منفصلة — ليست production | ☐ |
| 2 | منصة AQLIYA عاملة — جميع المسارات تعمل | ☐ |
| 3 | الخادم يعمل في وضع الإنتاج: `npm run build && npm run start:network` | ☐ |
| 4 | ⚠ لا تستخدم `npm run dev` — قد يُرجع 404 للمسارات المحمية | ☐ |
| 3 | PlatformOrganization باسم "Sombol Demo" | ☐ |
| 4 | ClientWorkspaces جاهزة (عميلان على الأقل) | ☐ |
| 5 | Projects جاهزة (مشروع تدقيق لكل عميل) | ☐ |
| 6 | AuditOS engagements معبأة ببيانات تجريبية | ☐ |
| 7 | Office AI tasks سابقة (اختياري) | ☐ |
| 8 | ملفات تجريبية جاهزة (PDF, CSV, XLSX) | ☐ |
| 9 | PlatformAuditLog يحتوي على أحداث | ☐ |
| 10 | مستخدم تجريبي جاهز (اسم: أحمد الغامدي) | ☐ |
| 11 | الإنترنت مستقر — سرعة 10 ميجابت+ | ☐ |
| 12 | المتصفح محدث (Chrome / Edge) | ☐ |
| 13 | خطة بديلة إذا تعطل العرض المباشر | ☐ |
| 14 | كودرومر جاهز | ☐ |

---

## Demo Data Checklist

| # | العنصر | تم؟ |
|---|---|---|
| 1 | جميع بيانات العرض تجريبية — غير حقيقية | ☐ |
| 2 | أسماء العملاء من صنع AQLIYA | ☐ |
| 3 | لا توجد بيانات شخصية حقيقية (PII) | ☐ |
| 4 | ميزان المراجعة — أرقام تجريبية | ☐ |
| 5 | ملف PDF التجريبي — محتوى عام | ☐ |
| 6 | ملف CSV التجريبي — أرقام وهمية | ☐ |
| 7 | ملف XLSX التجريبي — بيانات غير حساسة | ☐ |
| 8 | لا توجد بيانات سرية في بيئة العرض | ☐ |

---

## Full Demo Flow

| الخطوة | المدة | الإجراء |
|---|---|---|
| 1. افتتاحية | 2 min | AQLIYA platform identity + trust principle |
| 2. Platform workspaces | 2 min | /settings/platform-organization → /settings/workspaces |
| 3. AuditOS context | 2 min | Engagement detail → Platform Context Card |
| 4. Office AI: create task | 2 min | /assistant → task type → workspace → project → title |
| 5. Attach file | 2 min | Upload PDF/CSV/XLSX → source section updates |
| 6. Generate draft | 2 min | Generate Draft → output with extracted content |
| 7. Review/approve | 2 min | Approve → status changes → stepper updates |
| 8. PlatformAuditLog | 2 min | /settings/audit-logs → filter by product → show events |
| 9. أسئلة وأجوبة | 4 min |

---

## Failover Plan

| المشكلة | الحل |
|---|---|
| المنصة لا تستجيب | انتقل إلى العرض التقديمي النصي (PDF) |
| Office AI generation يفشل | ركّز على AuditOS و workspace isolation |
| PlatformAuditLog فارغ | اشرح المفهوم بدون عرض مباشر |
| WiFi قطع | استخدم اتصال بديل (هاتف محمول) |
| وقت قصير (<15 دقيقة) | ركّز على: Office AI → Generate → Approve → Audit log |

---

## What Not to Claim

| لا تقل | الحقيقة |
|---|---|
| "Office AI Assistant هو chatbot" | مساعد عمل منظم، وليس chatbot |
| "النظام يحلل الصور والمستندات الممسوحة" | OCR غير مطبّق |
| "هذا ذكاء اصطناعي سحابي" | توليد بقوالب ذكية (Deterministic) |
| "النظام جاهز للتنصيب الداخلي" | Cloud فقط — النشر الداخلي مرحلة 2 |
| "جميع المخرجات نهائية" | كل المخرجات مسودة حتى المراجعة البشرية |
| "النظام يفحص الملفات من الفيروسات" | فحص الفيروسات غير مطبّق |
| "On-Prem جاهز" | في خارطة الطريق — ليس جاهزاً |

---

## Post-Demo Actions

| # | الإجراء | تم؟ |
|---|---|---|
| 1 | إرسال شكر عبر البريد الإلكتروني خلال 24 ساعة | ☐ |
| 2 | إرفاق: cloud-pilot-offer.md | ☐ |
| 3 | إرفاق: current-capabilities-and-limitations.md | ☐ |
| 4 | طلب تحديد موعد للمتابعة (أسبوعين) | ☐ |
| 5 | تسجيل ملاحظات Sombol في CRM | ☐ |
| 6 | تقييم الأداء الداخلي (ما نجح، ما يحتاج تحسين) | ☐ |
