# AuditOS Commercial Operating System

Source of truth:

- `docs/product/auditos-product-packaging.md`
- `docs/product/auditos-commercial-assets/`
- `docs/product/auditos-outbound-kit/`
- `docs/product/auditos-sales-ops/`
- `docs/product/auditos-live-pilot-management/`
- `docs/product/auditos-first-customer-loop/`
- `docs/product/auditos-customer-conversion-reference/`
- `docs/product/auditos-market-proof-system/`

---

> **Positioning note (2026-06-09):** AQLIYA is now positioned as an **institutional operating platform** first. AuditOS is a **Specialized Operating System** within the platform. All references to "product" in this document should be understood in the context of "Specialized Operating System" running on the AQLIYA Intelligence Core. For the authoritative hierarchy, see `docs/official/AQLIYA_MASTER_REFERENCE.md` §5b.

---

## Purpose

هذا المستند هو **نظام التشغيل التجاري الموحّد** لـ AuditOS. يحوّل الحزم التجارية العشر من "مجموعة ملفات" إلى نظام تشغيل واحد واضح. أي شخص في الفريق — مؤسس، commercial lead، أو مشغّل — يعرف بالضبط:

1. في أي مرحلة نحن الآن؟
2. أي الملفات نستخدم؟
3. ما الخطوة التالية؟
4. من المسؤول؟

---

## The Commercial System At A Glance

```text
المرحلة 1  ←  Product Packaging        ←  من نحن؟ ماذا نبيع؟ لمن؟
المرحلة 2  ←  Commercial Assets         ←  ماذا نقول؟ كيف نعرض؟
المرحلة 3  ←  Outbound Kit              ←  كيف نتواصل؟ ماذا نرسل؟
المرحلة 4  ←  Sales Pipeline            ←  كيف ندير الفرص؟
المرحلة 5  ←  Sales-Ops Rhythm          ←  كيف نشغّل أسبوعيًا؟
المرحلة 6  ←  Execution Environment     ←  (مدمج في sales-ops كقواعد تشغيل)
المرحلة 7  ←  Live Pilot Management     ←  كيف ندير الـ pilot؟
المرحلة 8  ←  First-Customer Loop       ←  كيف نتعلم ونتحكم؟
المرحلة 9  ←  Customer Conversion       ←  كيف نغلق تجاريًا؟
المرحلة 10 ←  Market Proof System       ←  كيف نبني المصداقية؟
```

---

## Customer Journey Map

```text
OUTBOUND           ←  lead / prospect
    ↓
QUALIFICATION      ←  discovery / fit / ICP check
    ↓
DEMO               ←  product demo
    ↓
DECISION            ←  pilot agreement or no-go
    ↓
PILOT EXECUTION     ←  onboarding → active pilot → evidence
    ↓
SUCCESS REVIEW      ←  pilot success review
    ↓
COMMERCIAL CLOSE    ←  paid / extend / no-go
    ↓
REFERENCE           ←  referenceability & case study
    ↓
MARKET PROOF        ←  reusable proof assets
```

---

## Stage 1: Product Foundation & Positioning

**متى:** قبل أي نشاط تجاري. أساس كل شيء.

**الهدف:** تعريف المنتج، الـ ICP، positioning، الحدود، trust principle.

| الملف | النوع | متى يُستخدم | من يستخدمه |
|-------|-------|------------|------------|
| `auditos-product-packaging.md` | **أساسي** | مرجع دائم — بداية أي commercial work | الجميع |
| `AQLIYA-company-product-architecture-official.md` | داعم | عند الحاجة لوضع AuditOS في سياق AQLIYA | مؤسس |

**القاعدة:** أي شخص يعمل على AuditOS تجاريًا يجب أن يقرأ `auditos-product-packaging.md` أولًا.

---

## Stage 2: Commercial Assets — ماذا نقول؟

**متى:** قبل أول محادثة مع أي prospect.

**الهدف:** تجهيز كل ما يحتاجه الفريق لتمثيل المنتج تجاريًا.

| الملف | النوع | متى يُستخدم | من يستخدمه |
|-------|-------|------------|------------|
| `auditos-commercial-assets/one-page-product-brief.md` | **أساسي** | أي محادثة أولى — مرجع سريع | الجميع |
| `auditos-commercial-assets/sales-deck-outline.md` | **أساسي** | بناء أو تقديم عرض تقديمي | Commercial lead |
| `auditos-commercial-assets/demo-script.md` | **أساسي** | قبل أي demo مباشر | من يقدم الـ demo |
| `auditos-commercial-assets/icp-messaging.md` | داعم | صياغة رسائل لكل segment | Commercial lead |
| `auditos-commercial-assets/objection-handling.md` | داعم | تحضير للاعتراضات المتوقعة | Commercial lead |

---

## Stage 3: Outbound Kit — كيف نتواصل؟

**متى:** بدء الـ outreach لأي prospect.

**الهدف:** أدوات التواصل الأولي — email، WhatsApp، pitch، discovery.

| الملف | النوع | متى يُستخدم | من يستخدمه |
|-------|-------|------------|------------|
| `auditos-outbound-kit/outbound-email-templates.md` | **أساسي** | إرسال أول email لـ prospect | Commercial lead |
| `auditos-outbound-kit/whatsapp-openers.md` | **أساسي** | فتح محادثة WhatsApp | Commercial lead |
| `auditos-outbound-kit/discovery-questions.md` | **أساسي** | أي discovery call | Commercial lead |
| `auditos-outbound-kit/founder-pitch.md` | **أساسي** | محادثات المؤسس مع buyers | مؤسس |
| `auditos-outbound-kit/five-minute-demo.md` | داعم | Demo سريع جدًا | Commercial lead |
| `auditos-outbound-kit/fifteen-minute-demo.md` | داعم | Demo أطول قليلًا مع discovery | Commercial lead |
| `auditos-outbound-kit/follow-up-templates.md` | داعم | متابعة بعد أي محادثة | Commercial lead |

---

## Stage 4: Sales Pipeline — كيف ندير الفرص؟

**متى:** عند وجود أول lead مؤهل.

**الهدف:** هيكلة الـ CRM والمراحل والـ qualification.

| الملف | النوع | متى يُستخدم | من يستخدمه |
|-------|-------|------------|------------|
| `auditos-sales-ops/lead-status-definitions.md` | **أساسي** | تصنيف حالة أي lead | Commercial lead |
| `auditos-sales-ops/deal-stage-definitions.md` | **أساسي** | تحديد مرحلة أي فرصة | Commercial lead |
| `auditos-sales-ops/crm-qualification-fields.md` | **أساسي** | ملء بيانات الـ CRM لكل فرصة | Commercial lead |
| `auditos-sales-ops/simple-crm-board-structure.md` | داعم | إعداد لوحة الـ CRM | Commercial lead |
| `auditos-sales-ops/qualified-outreach-sequence.md` | داعم | تسلسل التواصل بعد الـ qualification | Commercial lead |

---

## Stage 5: Sales-Ops Rhythm — كيف نشغّل أسبوعيًا؟

**متى:** أسبوعيًا طوال فترة التشغيل التجاري.

**الهدف:** إيقاع تشغيلي منتظم لإدارة الـ pipeline والـ pilots.

| الملف | النوع | متى يُستخدم | من يستخدمه |
|-------|-------|------------|------------|
| `auditos-sales-ops/sales-ops-playbook.md` | **أساسي** | المرجع الأسبوعي لإدارة العمليات التجارية | Commercial lead |
| `auditos-sales-ops/next-step-checklist.md` | **أساسي** | قبل كل اجتماع — ماذا بعد؟ | الجميع |
| `auditos-sales-ops/weekly-pipeline-review.md` | **أساسي** | اجتماع مراجعة الـ pipeline الأسبوعي | Commercial lead + مؤسس |
| `auditos-sales-ops/proposal-template.md` | داعم | إعداد proposal لـ paid conversion | Commercial lead |
| `auditos-sales-ops/pilot-scoring-sheet.md` | داعم | تقييم أهلية pilot قبل البدء | Commercial lead |

---

## Stage 6: Execution Environment — قواعد التشغيل

**متى:** داخليًا — تحكم كل مرحلة.

**الهدف:** قواعد صارمة تمنع الفوضى التشغيلية.

**ملاحظة:** هذا ليس مجلدًا منفصلًا. قواعد execution environment موزعة ضمن:
- `auditos-sales-ops/sales-ops-playbook.md` (قواعد الـ demo، الـ pilot، الـ meeting، red flags)
- `auditos-first-customer-loop/first-5-customers-operating-rules.md` (قواعد أول 5 عملاء)
- `auditos-product-packaging.md` (الحدود — ما هو المنتج وما ليس هو)

**القواعد الأساسية الموزعة:**

1. لا demo قبل qualification
2. لا pilot قبل use case محددة
3. لا proposal قبل success criteria واضحة
4. لا نفتح أكثر من عدد pilots يمكن متابعته
5. لا نعد بمخرجات نهائية معتمدة
6. كل pilot يجب أن تنتج evidence
7. كل pilot يجب أن تنتهي بقرار واضح

---

## Stage 7: Live Pilot Management — كيف ندير الـ pilot؟

**متى:** من لحظة agreement على pilot حتى closeout.

**الهدف:** تشغيل pilot منضبط مع evidence، risks، تواصل منتظم.

| الملف | النوع | متى يُستخدم | من يستخدمه |
|-------|-------|------------|------------|
| `auditos-live-pilot-management/pilot-master-tracker.md` | **أساسي** | تتبع كل pilots دفعة واحدة | Commercial lead |
| `auditos-live-pilot-management/demo-to-pilot-handoff-template.md` | **أساسي** | نقل العميل من demo إلى pilot | Commercial lead |
| `auditos-live-pilot-management/pilot-evidence-checklist.md` | **أساسي** | تجميع evidence أثناء pilot | Pilot owner |
| `auditos-live-pilot-management/pilot-closeout-checklist.md` | **أساسي** | إغلاق pilot منظم | Pilot owner |
| `auditos-live-pilot-management/pilot-success-review.md` | **أساسي** | تقييم نجاح pilot | Commercial lead |
| `auditos-live-pilot-management/weekly-pilot-status-report.md` | **أساسي** | تقرير أسبوعي عن كل pilot | Pilot owner |
| `auditos-live-pilot-management/pilot-issue-risk-register.md` | داعم | تسجيل المخاطر والمشاكل | Pilot owner |
| `auditos-live-pilot-management/customer-communication-log.md` | داعم | سجل التواصل مع العميل | Pilot owner |
| `auditos-live-pilot-management/first-customer-case-study-capture.md` | داعم | التقاط مادة case study مبكرًا | Pilot owner |
| `auditos-live-pilot-management/light-crm-import-format.md` | داعم | تنسيق بيانات CRM خفيفة | Commercial lead |

---

## Stage 8: First-Customer Operating Loop — كيف نتعلم ونتحكم؟

**متى:** مع أول 3-5 عملاء — من pilot حتى paid.

**الهدف:** حلقة تعلم وتحكم مركزية تمنع الفوضى وتستخلص patterns.

| الملف | النوع | متى يُستخدم | من يستخدمه |
|-------|-------|------------|------------|
| `auditos-first-customer-loop/first-5-customers-operating-rules.md` | **أساسي** | مرجع دائم — يحكم كل العملاء الأوائل | الجميع |
| `auditos-first-customer-loop/pilot-command-center.md` | **أساسي** | لوحة القيادة الأسبوعية العليا | مؤسس + Commercial lead |
| `auditos-first-customer-loop/weekly-founder-pilot-review.md` | **أساسي** | اجتماع المؤسس الأسبوعي للقرارات | مؤسس |
| `auditos-first-customer-loop/customer-journey-timeline.md` | **أساسي** | تتبع تقدم كل عميل عبر المراحل | Commercial lead |
| `auditos-first-customer-loop/pilot-to-paid-conversion-memo.md` | داعم | قرار التحول إلى paid | Commercial lead |
| `auditos-first-customer-loop/referenceability-decision-template.md` | داعم | قرار أهلية العميل كـ reference | Commercial lead |
| `auditos-first-customer-loop/founder-learning-log.md` | داعم | سجل التعلم المتراكم | مؤسس |

---

## Stage 9: Customer Conversion & Reference — كيف نغلق تجاريًا؟

**متى:** بعد pilot ناجحة — حتى paid وما بعد.

**الهدف:** تحويل pilots إلى paid، وبناء references، وتوثيق case studies أولية.

| الملف | النوع | متى يُستخدم | من يستخدمه |
|-------|-------|------------|------------|
| `auditos-customer-conversion-reference/paid-conversion-offer-pack.md` | **أساسي** | تقديم عرض paid بعد pilot | Commercial lead |
| `auditos-customer-conversion-reference/reference-request-kit.md` | **أساسي** | طلب reference من عميل ناجح | Commercial lead |
| `auditos-customer-conversion-reference/first-case-study-drafting-pack.md` | **أساسي** | صياغة case study | Commercial lead |
| `auditos-customer-conversion-reference/customer-proof-library.md` | **أساسي** | مكتبة الـ proof القابلة لإعادة الاستخدام | الجميع |
| `auditos-customer-conversion-reference/conversion-objection-handling.md` | داعم | معالجة objections قبل conversion | Commercial lead |
| `auditos-customer-conversion-reference/pilot-extension-decision-framework.md` | داعم | قرار تمديد pilot | Commercial lead |
| `auditos-customer-conversion-reference/renewal-expansion-signals.md` | داعم | إشارات التجديد والتوسع | Commercial lead |

---

## Stage 10: Market Proof System — كيف نبني المصداقية؟

**متى:** بعد أول paid conversions — مستمر.

**الهدف:** تحويل نتائج العملاء إلى أصول إثبات سوقي منظمة وقابلة لإعادة الاستخدام.

| الملف | النوع | متى يُستخدم | من يستخدمه |
|-------|-------|------------|------------|
| `auditos-market-proof-system/proof-asset-index.md` | **أساسي** | السجل المركزي لكل proof assets | الجميع |
| `auditos-market-proof-system/reference-account-program.md` | **أساسي** | إدارة الحسابات المرجعية | Commercial lead |
| `auditos-market-proof-system/case-study-publication-workflow.md` | **أساسي** | نشر case study | Commercial lead + مؤسس |
| `auditos-market-proof-system/proof-usage-rules.md` | **أساسي** | قواعد استخدام proof في كل قناة | الجميع |
| `auditos-market-proof-system/market-credibility-dashboard.md` | **أساسي** | لوحة مؤشرات المصداقية | مؤسس + Commercial lead |
| `auditos-market-proof-system/founder-market-signal-review.md` | داعم | مراجعة إشارات السوق دوريًا | مؤسس |
| `auditos-market-proof-system/first-revenue-learning-memo.md` | داعم | توثيق التعلم من أول إيراد | Commercial lead |

---

## Operating Rhythm

### Daily

| الإجراء | المرجع |
|---------|--------|
| تحديث lead status | `lead-status-definitions.md` |
| تسجيل discovery notes بعد أي محادثة | `discovery-questions.md` |
| إرسال follow-up خلال 24 ساعة | `follow-up-templates.md` |

### Weekly

| الإجراء | المرجع | المسؤول |
|---------|--------|---------|
| Pipeline review meeting | `weekly-pipeline-review.md` | Commercial lead |
| لكل pilot: status report | `weekly-pilot-status-report.md` | Pilot owner |
| تحديث pilot command center | `pilot-command-center.md` | Commercial lead |
| تحديث market credibility dashboard | `market-credibility-dashboard.md` | Commercial lead |
| Founder pilot review (20-30 دقيقة) | `weekly-founder-pilot-review.md` | مؤسس |
| تسجيل learning في learning log | `founder-learning-log.md` | مؤسس |

### Monthly

| الإجراء | المرجع | المسؤول |
|---------|--------|---------|
| Founder market signal review (60-90 دقيقة) | `founder-market-signal-review.md` | مؤسس |
| مراجعة proof asset index — أي أصول جديدة؟ | `proof-asset-index.md` | Commercial lead |
| مراجعة reference account health | `reference-account-program.md` | Commercial lead |
| تحديث case study pipeline | `case-study-publication-workflow.md` | Commercial lead |

### Per Conversion

| الإجراء | المرجع | المسؤول |
|---------|--------|---------|
| Pilot success review | `pilot-success-review.md` | Commercial lead |
| Pilot-to-paid conversion memo | `pilot-to-paid-conversion-memo.md` | Commercial lead |
| Paid conversion offer | `paid-conversion-offer-pack.md` | Commercial lead |
| First revenue learning memo | `first-revenue-learning-memo.md` | Commercial lead |

### Quarterly

| الإجراء | المرجع | المسؤول |
|---------|--------|---------|
| Quarterly position review (نصف يوم) | `founder-market-signal-review.md` | مؤسس |
| Market credibility scorecard | `market-credibility-dashboard.md` | مؤسس + Commercial lead |

---

## Role Assignments

### المؤسس (Founder)

**الملفات الأساسية التي يجب أن يعرفها:**
- `auditos-product-packaging.md`
- `auditos-first-customer-loop/first-5-customers-operating-rules.md`
- `auditos-first-customer-loop/pilot-command-center.md`
- `auditos-first-customer-loop/weekly-founder-pilot-review.md`
- `auditos-market-proof-system/founder-market-signal-review.md`
- `auditos-market-proof-system/market-credibility-dashboard.md`

**المسؤوليات:**
- قرارات الـ positioning
- حضور محادثات buyers المهمة
- قرارات pilot go/no-go النهائية
- الموافقة على case study للنشر
- استخلاص patterns من إشارات السوق
- إعداد رسائل المستثمرين

---

### Commercial Lead

**الملفات الأساسية التي يجب أن يعرفها:**
- كل الملفات المصنفة "أساسي" في كل مرحلة
- `auditos-sales-ops/sales-ops-playbook.md`
- `auditos-market-proof-system/proof-usage-rules.md`

**المسؤوليات:**
- إدارة الـ pipeline كاملًا
- outreach و discovery و demo
- pilot qualification و handoff
- متابعة pilots الأسبوعية
- conversion proposals
- reference requests
- إدارة proof asset index

---

### Pilot Owner (لكل عميل)

**المسؤوليات:**
- إدارة pilot يوميًا
- communication log
- evidence capture
- risk register
- weekly status report
- case study capture المبكر

---

## Master File Index

### Core Files (يجب أن يعرفها كل من يعمل على AuditOS تجاريًا)

| # | الملف | المرحلة |
|---|-------|---------|
| 1 | `auditos-product-packaging.md` | 1 — Foundation |
| 2 | `auditos-commercial-assets/one-page-product-brief.md` | 2 — Commercial Assets |
| 3 | `auditos-commercial-assets/sales-deck-outline.md` | 2 — Commercial Assets |
| 4 | `auditos-commercial-assets/demo-script.md` | 2 — Commercial Assets |
| 5 | `auditos-outbound-kit/outbound-email-templates.md` | 3 — Outbound |
| 6 | `auditos-outbound-kit/whatsapp-openers.md` | 3 — Outbound |
| 7 | `auditos-outbound-kit/discovery-questions.md` | 3 — Outbound |
| 8 | `auditos-outbound-kit/founder-pitch.md` | 3 — Outbound |
| 9 | `auditos-sales-ops/lead-status-definitions.md` | 4 — Pipeline |
| 10 | `auditos-sales-ops/deal-stage-definitions.md` | 4 — Pipeline |
| 11 | `auditos-sales-ops/crm-qualification-fields.md` | 4 — Pipeline |
| 12 | `auditos-sales-ops/sales-ops-playbook.md` | 5 — Rhythm |
| 13 | `auditos-sales-ops/next-step-checklist.md` | 5 — Rhythm |
| 14 | `auditos-sales-ops/weekly-pipeline-review.md` | 5 — Rhythm |
| 15 | `auditos-live-pilot-management/pilot-master-tracker.md` | 7 — Pilot |
| 16 | `auditos-live-pilot-management/demo-to-pilot-handoff-template.md` | 7 — Pilot |
| 17 | `auditos-live-pilot-management/pilot-evidence-checklist.md` | 7 — Pilot |
| 18 | `auditos-live-pilot-management/pilot-closeout-checklist.md` | 7 — Pilot |
| 19 | `auditos-live-pilot-management/pilot-success-review.md` | 7 — Pilot |
| 20 | `auditos-live-pilot-management/weekly-pilot-status-report.md` | 7 — Pilot |
| 21 | `auditos-first-customer-loop/first-5-customers-operating-rules.md` | 8 — Loop |
| 22 | `auditos-first-customer-loop/pilot-command-center.md` | 8 — Loop |
| 23 | `auditos-first-customer-loop/weekly-founder-pilot-review.md` | 8 — Loop |
| 24 | `auditos-first-customer-loop/customer-journey-timeline.md` | 8 — Loop |
| 25 | `auditos-customer-conversion-reference/paid-conversion-offer-pack.md` | 9 — Conversion |
| 26 | `auditos-customer-conversion-reference/reference-request-kit.md` | 9 — Conversion |
| 27 | `auditos-customer-conversion-reference/first-case-study-drafting-pack.md` | 9 — Conversion |
| 28 | `auditos-customer-conversion-reference/customer-proof-library.md` | 9 — Conversion |
| 29 | `auditos-market-proof-system/proof-asset-index.md` | 10 — Proof |
| 30 | `auditos-market-proof-system/reference-account-program.md` | 10 — Proof |
| 31 | `auditos-market-proof-system/case-study-publication-workflow.md` | 10 — Proof |
| 32 | `auditos-market-proof-system/proof-usage-rules.md` | 10 — Proof |
| 33 | `auditos-market-proof-system/market-credibility-dashboard.md` | 10 — Proof |

### Supporting Files (تُستخدم عند الحاجة — ليست مطلوبة للجميع)

| # | الملف | المرحلة |
|---|-------|---------|
| 1 | `auditos-commercial-assets/icp-messaging.md` | 2 |
| 2 | `auditos-commercial-assets/objection-handling.md` | 2 |
| 3 | `auditos-outbound-kit/five-minute-demo.md` | 3 |
| 4 | `auditos-outbound-kit/fifteen-minute-demo.md` | 3 |
| 5 | `auditos-outbound-kit/follow-up-templates.md` | 3 |
| 6 | `auditos-sales-ops/simple-crm-board-structure.md` | 4 |
| 7 | `auditos-sales-ops/qualified-outreach-sequence.md` | 4 |
| 8 | `auditos-sales-ops/proposal-template.md` | 5 |
| 9 | `auditos-sales-ops/pilot-scoring-sheet.md` | 5 |
| 10 | `auditos-live-pilot-management/pilot-issue-risk-register.md` | 7 |
| 11 | `auditos-live-pilot-management/customer-communication-log.md` | 7 |
| 12 | `auditos-live-pilot-management/first-customer-case-study-capture.md` | 7 |
| 13 | `auditos-live-pilot-management/light-crm-import-format.md` | 7 |
| 14 | `auditos-first-customer-loop/pilot-to-paid-conversion-memo.md` | 8 |
| 15 | `auditos-first-customer-loop/referenceability-decision-template.md` | 8 |
| 16 | `auditos-first-customer-loop/founder-learning-log.md` | 8 |
| 17 | `auditos-customer-conversion-reference/conversion-objection-handling.md` | 9 |
| 18 | `auditos-customer-conversion-reference/pilot-extension-decision-framework.md` | 9 |
| 19 | `auditos-customer-conversion-reference/renewal-expansion-signals.md` | 9 |
| 20 | `auditos-market-proof-system/founder-market-signal-review.md` | 10 |
| 21 | `auditos-market-proof-system/first-revenue-learning-memo.md` | 10 |

---

## Quick Reference: When To Use What

### "عندي prospect جديد — من أين أبدأ؟"

1. راجع `one-page-product-brief.md`
2. استخدم `outbound-email-templates.md` أو `whatsapp-openers.md`
3. جهز `discovery-questions.md`
4. املأ `crm-qualification-fields.md` بعد أول محادثة

### "طلب مني prospect عرضًا — ماذا أحضّر؟"

1. راجع `demo-script.md`
2. تأكد من readiness حسب `sales-ops-playbook.md` (Demo Readiness Rule)
3. قدّم العرض باستخدام `sales-deck-outline.md`

### "العميل يريد pilot — كيف أبدأ؟"

1. املأ `demo-to-pilot-handoff-template.md`
2. تأكد من أهلية pilot حسب `sales-ops-playbook.md` (Pilot Readiness Rule)
3. اسجل العميل في `pilot-master-tracker.md`
4. طبق `first-5-customers-operating-rules.md`

### "الـ pilot مستمرة — ماذا أفعل أسبوعيًا؟"

1. املأ `weekly-pilot-status-report.md`
2. حدّث `pilot-command-center.md`
3. سجّل evidence في `pilot-evidence-checklist.md`
4. سجّل المخاطر في `pilot-issue-risk-register.md`
5. سجّل التواصل في `customer-communication-log.md`

### "الـ pilot انتهت — ما القرار؟"

1. املأ `pilot-success-review.md`
2. إذا success: `pilot-to-paid-conversion-memo.md`
3. إذا extension: `pilot-extension-decision-framework.md`
4. إذا close: `pilot-closeout-checklist.md`

### "العميل مستعد للتحول إلى paid — ماذا أقدّم؟"

1. استخدم `paid-conversion-offer-pack.md`
2. قدّم `proposal-template.md`
3. وثّق التعلم في `first-revenue-learning-memo.md`

### "كيف أحوّل عميل ناجح إلى reference؟"

1. قيّم الأهلية: `referenceability-decision-template.md`
2. اختر tier: `reference-account-program.md`
3. اطلب الموافقة: `reference-request-kit.md`
4. أضف للأصول: `proof-asset-index.md`

### "نريد نشر case study — كيف؟"

1. اجمع المادة: `first-customer-case-study-capture.md`
2. اصغ الـ draft: `first-case-study-drafting-pack.md`
3. اتبع مسار النشر: `case-study-publication-workflow.md`
4. التزم بقواعد الاستخدام: `proof-usage-rules.md`

---

## Trust Principle — الحاكم لكل المراحل

```text
AI assists. Humans decide. Evidence governs.
```

هذا المبدأ يظهر في كل حزمة وثائقية وفي كل مرحلة. لا مرحلة تجارية تخرق هذا المبدأ.

---

## What AuditOS Is Sold As — ثابت في كل المراحل

1. Governed preparation, review, and traceability workflow
2. مسار منظم من البيانات المالية إلى مخرجات جاهزة للمراجعة
3. نظام تشغيل لا يستبدل الحكم المهني

## What AuditOS Is NOT Sold As — ممنوع في كل المراحل

1. ليس بديلًا للمراجع
2. ليس منتجًا للقوائم المالية النهائية المعتمدة تلقائيًا
3. ليس autonomous audit engine
4. ليس chatbot عام
5. ليس ERP
6. ليس CRM

---

## Maintenance Rule

1. هذا المستند يُراجع كل شهر — هل تغير شيء في الحزم؟
2. أي ملف جديد يُضاف إلى إحدى الحزم يجب أن يُسجل هنا
3. أي ملف يُلغى أو يُدمج يجب أن يُزال من هنا
4. الـ core files يجب أن تبقى قليلة ومركزة
5. الـ supporting files يمكن أن تنمو — لكن لا تتحول إلى core بدون قرار
