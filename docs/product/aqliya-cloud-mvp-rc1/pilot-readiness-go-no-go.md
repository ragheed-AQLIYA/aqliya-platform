# AQLIYA Cloud MVP RC1 — Pilot Readiness: Go / No-Go

**Release:** RC1
**Purpose:** Define criteria for advancing from internal demo to Sombol cloud pilot

---

## Go Criteria: Internal Demo

| المعيار | الشرط | الحالة |
|---|---|---|
| All validation checks pass (1–10) | No failures | ☐ |
| Demo flow rehearsed at least twice | Flow is smooth | ☐ |
| Demo data prepared and verified | No real data | ☐ |
| No-claim reminders reviewed | Understood | ☐ |
| Alternative plan ready | Documented | ☐ |

**Decision:** Internal demo can proceed when ALL criteria above are met.

---

## Go Criteria: Sombol Cloud Pilot

| المعيار | الشرط | ملاحظات |
|---|---|---|
| Internal demo successful | Sombol expressed interest | — |
| Pilot scope agreed | Pilot offer signed | 3 months, up to 11 users, 2-3 clients |
| Sombol acknowledges limitations | See acknowledgements section | — |
| Sombol provides test client data | Anonymized or mock only | — |
| Sombol assigns internal coordinator | Single point of contact | — |
| Pilot environment is isolated | Staging/demo, not production | — |
| Migration drift documented | Explicitly accepted by Sombol | Drift exists — see migration plan |
| No real client data in pilot | Mock/anonymized only | — |

**Decision:** Sombol cloud pilot can proceed when ALL criteria above are met.

---

## No-Go Criteria: Internal Demo

| الشرط | الإجراء |
|---|---|
| Validation checks fail (1–6) | Fix issues before demo |
| Demo flow not rehearsed | Rehearse first |
| Real data in demo environment | Remove and replace with mock data |
| Platform not accessible | Fix network/access before demo |

---

## No-Go Criteria: Sombol Pilot

| الشرط | الإجراء |
|---|---|
| Sombol requires On-Prem or Private deployment | Explain this is phase 2 |
| Sombol requires Cloud AI for real client data | Risk gate not passed |
| Sombol requires OCR or scanned PDF support | Not implemented — explain timeline |
| Sombol requires malware scanning | Not implemented — explain pre-production requirement |
| Sombol requires file content parsing for all formats | OCR not implemented — explain |
| Sombol requires SSO / SAML / LDAP | Not available |
| Sombol requires production SLA (99.9%+) | Not ready — migration drift unresolved |
| Sombol requires full production deployment immediately | Not ready — pilot only |

---

## Production No-Go Criteria

These are absolute blockers for production deployment — do not bypass:

| الشرط | السبب |
|---|---|
| Migration drift unresolved | `prisma migrate deploy` will fail |
| Malware scanning not implemented | Security risk for uploaded files |
| Backup not automated | Data loss risk |
| Monitoring not active | Cannot detect outages |
| No file size/ext validation hardening | Already implemented ✅ |
| No auth middleware | Already implemented ✅ |

---

## Required Decisions Before Pilot

| القرار | الجهة المسؤولة | الموعد |
|---|---|---|
| تحديد العملاء التجريبيين | Sombol | قبل الأسبوع 1 |
| تعيين منسق داخلي | Sombol | قبل الأسبوع 1 |
| الموافقة على قيود المنصة | Sombol | قبل التوقيع |
| تحديد مستوى الدعم | AQLIYA | قبل الأسبوع 1 |
| تحديد قنوات التواصل | AQLIYA + Sombol | قبل الأسبوع 1 |
| خطة تقييم المرحلة التجريبية | AQLIYA + Sombol | الأسبوع 1 |

---

## Required Client Acknowledgements

يجب أن يقر Sombol كتابةً بما يلي قبل بدء المرحلة التجريبية:

| الإقرار | الصيغة المقترحة |
|---|---|
| **عيـــنـــة:** هذه منصة تجريبية، وليست جاهزة للإنتاج الكامل. | "أقر أن AQLIYA Cloud هي منصة تجريبية وأن الترحيل إلى الإنتاج يتطلب خطوات إضافية." |
| **عيـــنـــة:** فحص الفيروسات غير مطبّق. | "أقر أن فحص الملفات من الفيروسات غير مطبّق، ولن يتم رفع ملفات حساسة." |
| **عيـــنـــة:** الذكاء الاصطناعي السحابي غير مفعّل. | "أقر أن جميع المخرجات يتم توليدها بقوالب ذكية محلية (Deterministic)، وليس ذكاء اصطناعي سحابي." |
| **عيـــنـــة:** OCR غير مطبّق. | "أقر أن استخراج النص من الصور والمستندات الممسوحة ضوئياً غير متوفر." |
| **عيـــنـــة:** النشر الداخلي غير متوفر. | "أقر أن هذه منصة Cloud، والنشر الداخلي (On-Prem/Private) غير متوفر حالياً." |
| **عيـــنـــة:** مبدأ الحوكمة. | "أقر أن جميع مخرجات الذكاء مسودة حتى المراجعة البشرية. AI assists. Humans decide. Evidence governs." |

> **AI assists. Humans decide. Evidence governs.**
> **الذكاء يساعد. الإنسان يقرر. الدليل يحكم.**
