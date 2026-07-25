# AQLIYA Service Level Agreement Template
# نموذج اتفاقية مستوى الخدمة — عقلية

**Status:** Draft for legal review | **Version:** 1.0 | **Date:** 2026-07-25
**Owner:** Commercial Team | **Last Reviewed:** 2026-07-25
**Audience:** Enterprise customers, legal, sales
**Attach:** Must reference `WHAT_WE_DO_NOT_CLAIM.md` as Appendix A

---

## 1. Parties — الأطراف

| Role | Entity |
|------|--------|
| **Provider — مقدم الخدمة** | AQLIYA / [LEGAL ENTITY NAME] |
| **Customer — العميل** | [CUSTOMER LEGAL NAME] |
| **Effective Date — تاريخ السريان** | [DATE] |

This Service Level Agreement (SLA) applies to AQLIYA Cloud subscriptions at the **Enterprise** tier. Starter and Professional tiers receive best-effort support unless an SLA addendum is contracted separately.

تنطبق اتفاقية مستوى الخدمة هذه على اشتراكات عقلية السحابية من فئة **المؤسسات**. تحصل فئات البداية والمهنية على دعم بأفضل جهد ما لم يتم التعاقد على ملحق SLA منفصل.

---

## 2. Definitions — التعريفات

| Term — المصطلح | Definition — التعريف |
|----------------|----------------------|
| **Uptime — وقت التشغيل** | Percentage of time the AQLIYA Cloud platform is available and responding to authenticated requests, measured monthly. — النسبة المئوية للوقت الذي تكون فيه منصة عقلية السحابية متاحة وتستجيب للطلبات الموثقة، تقاس شهرياً. |
| **Downtime — وقت التعطل** | Any period where the platform is unavailable to authenticated users, excluding planned maintenance and exclusions listed in §7. — أي فترة لا تكون فيها المنصة متاحة للمستخدمين الموثقين، باستثناء الصيانة المجدولة والاستثناءات المدرجة في §7. |
| **Incident — حادثة** | An unplanned interruption or degradation of service. — انقطاع أو تدهور غير مخطط له في الخدمة. |
| **Response Time — وقت الاستجابة** | Time from incident report acknowledgement to first substantive response from AQLIYA support. — الوقت من استلام بلاغ الحادثة إلى أول استجابة فعلية من دعم عقلية. |
| **Resolution Time — وقت الحل** | Time from incident report to restoration of service or delivery of an acceptable workaround. — الوقت من الإبلاغ عن الحادثة إلى استعادة الخدمة أو تقديم حل بديل مقبول. |
| **Business Hours — ساعات العمل** | Sunday–Thursday, 08:00–18:00 (UTC+3, Saudi Arabia Standard Time). — الأحد–الخميس، 08:00–18:00 (توقيت السعودية). |
| **Measurement Month — شهر القياس** | Calendar month, UTC. — الشهر الميلادي، بتوقيت UTC. |

---

## 3. Uptime Commitment — التزام وقت التشغيل

### 3.1 Target — الهدف

| Metric — المقياس | Commitment — الالتزام |
|-------------------|----------------------|
| **Platform Uptime** | **99.5%** (measured monthly) |
| **وقت تشغيل المنصة** | **99.5%** (يقاس شهرياً) |

### 3.2 Calculation — طريقة الحساب

```
Uptime % = (Total Minutes in Month − Downtime Minutes) / Total Minutes in Month × 100
```

```
نسبة وقت التشغيل = (إجمالي دقائق الشهر − دقائق التعطل) / إجمالي دقائق الشهر × 100
```

### 3.3 Measurement — القياس

- Uptime is measured via automated synthetic health checks from at least two geographically distributed monitoring locations.
- Health checks run at 60-second intervals against the authenticated platform health endpoint (`/api/platform/health`) and the public platform homepage.
- Both endpoints must return HTTP 2xx for the platform to be considered available.
- Measurement data is retained for 12 months and available to the customer upon request.

- يقاس وقت التشغيل عبر فحوصات آلية من موقعي رصد موزعين جغرافياً على الأقل.
- تجري الفحوصات كل 60 ثانية مقابل نقطة صحة المنصة الموثقة (`/api/platform/health`) والصفحة الرئيسية العامة.
- يجب أن يعيد كلا المسارين استجابة HTTP 2xx لاعتبار المنصة متاحة.
- تحفظ بيانات القياس لمدة 12 شهراً وتتاح للعميل عند الطلب.

---

## 4. Incident Severity Levels — مستويات خطورة الحوادث

| Level — المستوى | Severity — الخطورة | Definition — التعريف | Examples — أمثلة |
|-----------------|-------------------|----------------------|-------------------|
| **P1** | **Critical — حرج** | Platform completely unavailable; all users unable to access core functionality; data loss or corruption risk. — المنصة غير متاحة بالكامل؛ جميع المستخدمين غير قادرين على الوصول للوظائف الأساسية؛ خطر فقدان أو تلف البيانات. | Login failure for all users, database corruption, entire platform down |
| **P2** | **High — عالي** | Major feature unavailable; significant degradation affecting multiple users; no workaround available. — ميزة رئيسية غير متاحة؛ تدهور كبير يؤثر على عدة مستخدمين؛ لا يوجد حل بديل. | File upload broken, report generation failing, SSO outage |
| **P3** | **Medium — متوسط** | Partial degradation; limited user impact; workaround available. — تدهور جزئي؛ تأثير محدود على المستخدمين؛ يوجد حل بديل. | Minor UI bug, slow page loads, non-critical feature issue |
| **P4** | **Low — منخفض** | Cosmetic issue; single-user impact; no operational disruption. — مشكلة تجميلية؛ تأثير على مستخدم واحد؛ لا يوجد تعطيل تشغيلي. | Typo, visual glitch, enhancement request |

---

## 5. Response & Resolution Times — أوقات الاستجابة والحل

### 5.1 Response Times — أوقات الاستجابة

| Severity — الخطورة | Response Time — وقت الاستجابة | Measurement Window — نافذة القياس |
|--------------------|------------------------------|----------------------------------|
| **P1 — Critical** | **1 hour — ساعة واحدة** | 24/7 — على مدار الساعة |
| **P2 — High** | **4 hours — 4 ساعات** | Business hours — ساعات العمل |
| **P3 — Medium** | **8 hours — 8 ساعات** | Business hours — ساعات العمل |
| **P4 — Low** | **24 hours — 24 ساعة** | Business hours — ساعات العمل |

### 5.2 Resolution Times — أوقات الحل

| Severity — الخطورة | Resolution Time — وقت الحل | Definition — التعريف |
|--------------------|----------------------------|----------------------|
| **P1 — Critical** | **4 hours — 4 ساعات** | Service restored or emergency fix deployed — استعادة الخدمة أو نشر إصلاح طارئ |
| **P2 — High** | **24 hours — 24 ساعة** | Fix deployed or acceptable workaround provided — نشر الإصلاح أو تقديم حل بديل مقبول |
| **P3 — Medium** | **72 hours — 72 ساعة** | Fix deployed or scheduled for next maintenance window — نشر الإصلاح أو جدولته لنافذة الصيانة التالية |
| **P4 — Low** | **Next release — الإصدار التالي** | Included in next planned release cycle — يدرج في دورة الإصدار المخطط التالية |

### 5.3 Measurement — القياس

- Response time is measured from the timestamp AQLIYA acknowledges receipt of the incident report to the timestamp of the first substantive human response (not automated acknowledgement).
- Resolution time is measured from incident report acknowledgement to restoration of service or delivery of an acceptable workaround confirmed by the customer.
- Incidents reported outside business hours for P2–P4 are acknowledged at the start of the next business day.

- يقاس وقت الاستجابة من وقت استلام عقلية لبلاغ الحادثة إلى وقت أول استجابة بشرية فعلية (وليس إشعاراً آلياً).
- يقاس وقت الحل من استلام البلاغ إلى استعادة الخدمة أو تقديم حل بديل مقبول يؤكده العميل.
- الحوادث المبلغة خارج ساعات العمل للمستويات P2–P4 يتم استلامها مع بداية يوم العمل التالي.

---

## 6. Support Hours — ساعات الدعم

| Parameter — المعيار | Value — القيمة |
|--------------------|----------------|
| **Days — الأيام** | Sunday–Thursday — الأحد–الخميس |
| **Hours — الساعات** | 08:00–18:00 (UTC+3, Saudi Arabia Standard Time) |
| **Critical (P1) coverage — تغطية الحالات الحرجة** | 24/7 with on-call escalation — على مدار الساعة مع تصعيد الطوارئ |
| **Holidays — العطلات** | Saudi public holidays excluded — باستثناء العطلات الرسمية السعودية |

### Support Channels — قنوات الدعم

| Channel — القناة | Scope — النطاق |
|------------------|----------------|
| **Email — البريد الإلكتروني** | support@aqliya.com — all severity levels |
| **Phone — الهاتف** | [PHONE NUMBER] — P1/P2 only (Enterprise tier) |
| **Portal — البوابة** | [SUPPORT PORTAL URL] — ticket tracking, knowledge base |

---

## 7. Exclusions — الاستثناءات

The following are **excluded** from uptime calculations and response/resolution time commitments:

يتم **استبعاد** ما يلي من حسابات وقت التشغيل والتزامات أوقات الاستجابة والحل:

### 7.1 Force Majeure — القوة القاهرة

- Natural disasters, war, terrorism, civil unrest, pandemics, or government action.
- الكوارث الطبيعية، الحروب، الإرهاب، الاضطرابات المدنية، الأوبئة، أو الإجراءات الحكومية.

### 7.2 Customer-Caused Incidents — حوادث بسبب العميل

- Misconfiguration by customer administrators.
- Use of unsupported browsers, clients, or integrations.
- Customer-authored custom code, scripts, or API misuse.
- Customer network or internet connectivity failures.
- Failure to follow documented operational procedures.

- سوء إعداد من قبل مديري النظام لدى العميل.
- استخدام متصفحات أو عملاء أو تكاملات غير مدعومة.
- أكواد أو سكريبتات أو إساءة استخدام API من قبل العميل.
- أعطال شبكة العميل أو اتصال الإنترنت.
- عدم اتباع إجراءات التشغيل الموثقة.

### 7.3 Scheduled Maintenance — الصيانة المجدولة

- Maintenance windows communicated at least **48 hours** in advance.
- Emergency maintenance communicated at least **2 hours** in advance where possible.
- Total scheduled maintenance per month shall not exceed **8 hours**.
- Maintenance is scheduled outside business hours (Friday–Saturday or 18:00–06:00 KSA) whenever possible.

- فترات صيانة يتم الإعلان عنها قبل **48 ساعة** على الأقل.
- صيانة طارئة يتم الإعلان عنها قبل **ساعتين** على الأقل حيثما أمكن.
- لا يتجاوز إجمالي الصيانة المجدولة شهرياً **8 ساعات**.
- تجدول الصيانة خارج ساعات العمل (الجمعة–السبت أو 18:00–06:00) كلما أمكن.

### 7.4 Third-Party Services — خدمات الطرف الثالث

- Outages of third-party services beyond AQLIYA''s control (e.g., cloud provider infrastructure failures, upstream DNS issues), provided AQLIYA has configured reasonable redundancy where commercially available.

- انقطاعات خدمات الطرف الثالث الخارجة عن سيطرة عقلية (مثل أعطال البنية التحتية لمزود الخدمة السحابية، مشاكل DNS)، شريطة أن تكون عقلية قد هيأت تكراراً معقولاً حيثما كان متاحاً تجارياً.

### 7.5 Beta/Preview Features — ميزات تجريبية

- Features explicitly labeled as "beta," "preview," or "prototype" are excluded from SLA commitments.

- الميزات المصنفة صراحةً "تجريبية" أو "معاينة" أو "نموذج أولي" مستثناة من التزامات SLA.

---

## 8. Service Credits — أرصدة تعويض الخدمة

### 8.1 Credit Schedule — جدول التعويضات

If AQLIYA fails to meet the uptime commitment in any calendar month, the customer is entitled to the following service credits:

إذا أخفقت عقلية في تحقيق التزام وقت التشغيل في أي شهر ميلادي، يحق للعميل أرصدة التعويض التالية:

| Monthly Uptime — وقت التشغيل الشهري | Service Credit — رصيد التعويض |
|-------------------------------------|------------------------------|
| **99.5% – 99.0%** | **5%** of monthly fee — من الرسوم الشهرية |
| **99.0% – 97.0%** | **10%** of monthly fee — من الرسوم الشهرية |
| **97.0% – 95.0%** | **15%** of monthly fee — من الرسوم الشهرية |
| **Below 95.0% — أقل من 95.0%** | **25%** of monthly fee — من الرسوم الشهرية |

### 8.2 Credit Conditions — شروط التعويض

- Credits are calculated on the monthly subscription fee for the affected service only.
- Credits are applied to the next billing cycle.
- Maximum total credits in any 12-month period shall not exceed **25%** of total annual fees.
- Credits are the customer''s sole and exclusive remedy for SLA failures.
- Credits must be requested in writing within **30 days** of the end of the affected calendar month.

- تحسب التعويضات على رسوم الاشتراك الشهرية للخدمة المتأثرة فقط.
- تطبق التعويضات على دورة الفوترة التالية.
- لا يتجاوز إجمالي التعويضات في أي فترة 12 شهراً **25%** من إجمالي الرسوم السنوية.
- التعويضات هي العلاج الوحيد والحصري للعميل عن إخفاقات SLA.
- يجب طلب التعويضات كتابياً خلال **30 يوماً** من نهاية الشهر المتأثر.

### 8.3 Response Time Credits — تعويضات وقت الاستجابة

If AQLIYA fails to meet the response time commitment for a P1 or P2 incident:

إذا أخفقت عقلية في تحقيق التزام وقت الاستجابة لحادثة P1 أو P2:

| Miss — الإخفاق | Credit — التعويض |
|----------------|-------------------|
| P1 response > 1 hour — استجابة P1 > ساعة | **SAR 500** per incident — لكل حادثة |
| P2 response > 4 hours — استجابة P2 > 4 ساعات | **SAR 250** per incident — لكل حادثة |

---

## 9. Reporting — التقارير

### 9.1 Monthly SLA Report — تقرير SLA الشهري

AQLIYA shall provide a monthly SLA performance report including:

- Monthly uptime percentage
- Total downtime minutes (with breakdown: unplanned vs. scheduled maintenance)
- Incident summary (count by severity, mean response time, mean resolution time)
- Service credits earned (if any)
- Root cause summaries for P1 incidents

تقدم عقلية تقرير أداء SLA شهري يتضمن:

- نسبة وقت التشغيل الشهرية
- إجمالي دقائق التعطل (مع تفصيل: غير مخطط مقابل صيانة مجدولة)
- ملخص الحوادث (العدد حسب الخطورة، متوسط وقت الاستجابة، متوسط وقت الحل)
- أرصدة التعويض المستحقة (إن وجدت)
- ملخصات الأسباب الجذرية لحوادث P1

### 9.2 Status Page — صفحة الحالة

AQLIYA maintains a public status page at **[status.aqliya.com]** displaying:

- Current platform status
- Incident history (last 90 days)
- Scheduled maintenance calendar
- RSS/email subscription for status updates

تحتفظ عقلية بصفحة حالة عامة على **[status.aqliya.com]** تعرض:

- حالة المنصة الحالية
- سجل الحوادث (آخر 90 يوماً)
- تقويم الصيانة المجدولة
- اشتراك RSS/بريد إلكتروني لتحديثات الحالة

---

## 10. Escalation Path — مسار التصعيد

| Level — المستوى | Contact — جهة الاتصال | Trigger — المحفز |
|-----------------|----------------------|-------------------|
| **L1: Support Team** | support@aqliya.com | Initial incident report — البلاغ الأولي |
| **L2: Support Manager** | [ESCALATION EMAIL] | P1 unresolved after 2 hours — P1 غير محلولة بعد ساعتين |
| **L3: Engineering Lead** | [ENGINEERING EMAIL] | P1 unresolved after 4 hours — P1 غير محلولة بعد 4 ساعات |
| **L4: Executive** | [EXECUTIVE EMAIL] | P1 unresolved after 8 hours; repeat SLA breaches — P1 غير محلولة بعد 8 ساعات؛ تكرار إخفاقات SLA |

---

## 11. Review & Amendments — المراجعة والتعديلات

- This SLA is reviewed **annually** or upon material change to the AQLIYA platform architecture.
- Amendments require written agreement from both parties.
- Either party may request an SLA review with **60 days** written notice.
- In the event of a conflict between this SLA and the Master Services Agreement (MSA), the MSA prevails.

- تراجع اتفاقية مستوى الخدمة هذه **سنوياً** أو عند تغيير جوهري في بنية منصة عقلية.
- تتطلب التعديلات موافقة خطية من الطرفين.
- يجوز لأي طرف طلب مراجعة SLA بإشعار خطي قبل **60 يوماً**.
- في حال تعارض هذه الاتفاقية مع اتفاقية الخدمات الرئيسية (MSA)، تسود اتفاقية MSA.

---

## 12. Appendices — الملاحق

| Appendix | Document |
|----------|----------|
| **A** | `WHAT_WE_DO_NOT_CLAIM.md` — Platform exclusions and limitations |
| **B** | Product-specific scope (AuditOS / LocalContentOS) as defined in SOW |
| **C** | Support contact details and escalation matrix |

---

## Change Log — سجل التغييرات

| Date | Version | Change |
|------|---------|--------|
| 2026-07-25 | 1.0 | Initial SLA template — bilingual AR/EN |

---

*This document is a template. Legal review is required before customer signature. Pricing and contact details must be completed before use.*
*هذه الوثيقة نموذج. المراجعة القانونية مطلوبة قبل توقيع العميل. يجب استكمال تفاصيل التسعير وجهات الاتصال قبل الاستخدام.*
