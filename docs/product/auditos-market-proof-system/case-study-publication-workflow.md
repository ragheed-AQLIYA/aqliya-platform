# AQLIYA AuditOS Case Study Publication Workflow

Source of truth:

1. `docs/product/auditos-customer-conversion-reference/first-case-study-drafting-pack.md`
2. `docs/product/auditos-live-pilot-management/first-customer-case-study-capture.md`
3. `docs/product/auditos-customer-conversion-reference/reference-request-kit.md`

## Purpose

هذا المستند يحدد المسار الكامل لإنتاج ونشر case study من عميل AuditOS فعلي، من تحديد الحالة إلى النشر والاستخدام التجاري.

## Workflow Overview

```text
Candidate Identification
    → Evidence Collection
    → Customer Approval Request
    → Drafting
    → Internal Review
    → Customer Approval
    → Publication
    → Distribution & Reuse
```

## Phase 1: Candidate Identification

### المعايير:

1. عميل أكمل pilot أو paid period بنجاح
2. value ظهرت بوضوح (في 3 فئات proof على الأقل)
3. stakeholder satisfaction جيدة
4. العميل مؤهل لـ reference tier 1 أو 2

### مصدر الترشيح:

1. Pilot Success Review
2. Referenceability Decision Template
3. Founder Weekly Pilot Review

---

## Phase 2: Evidence Collection

اجمع من المصادر التالية:

| المصدر | ما يُستخرج منه |
|--------|---------------|
| Pilot Evidence Checklist | metrics الموثقة |
| Pilot Success Review | value summary |
| Customer Communication Log | quotes غير رسمية |
| First Customer Case Study Capture | snapshot + before/after |

**القاعدة:** لا تدخل أي claim في الـ case study بدون evidence واضحة من هذه المصادر.

---

## Phase 3: Customer Approval Request

### إذا كانت الحالة Tier 1 (Public Named):

1. أرسل الطلب باستخدام `reference-request-kit.md`
2. اطلب موافقة كتابية على:
   - ذكر اسم الشركة
   - استخدام quote محددة
   - نشر الحالة في قنوات محددة
3. انتظر الموافقة قبل البدء في drafting

### إذا كانت الحالة Tier 2 (Anonymized):

1. أرسل طلب مشاركة التفاصيل بدون اسم
2. اشرح كيف ستتم عملية anonymization
3. اعرض المسودة على العميل قبل النشر

---

## Phase 4: Drafting

### الهيكل المعتمد للـ case study:

| القسم | المحتوى |
|-------|---------|
| 1. Customer Context | القطاع، حجم الفريق، نوع use case |
| 2. Before AuditOS | كيف كان workflow قبل AuditOS |
| 3. Why They Tried AuditOS | trigger الأساسي والدافع |
| 4. What Was Implemented | الـ workflow والـ modules المستخدمة |
| 5. What Improved | النتائج حسب فئات proof |
| 6. Proof Assets | quote، metrics، قبل/بعد |
| 7. Looking Forward | الخطوة التالية أو التوسع |

### قواعد الصياغة:

1. استخدم لغة مباشرة بدون exaggeration
2. استخدم metrics حقيقية فقط
3. لا تقل "AuditOS استبدل المراجع" أو "أنتج بيانات معتمدة تلقائيًا"
4. حافظ على positioning: governed preparation, review, and traceability
5. اذكر المشكلة قبل الحل
6. case study تروي القيمة — لا تبيع

---

## Phase 5: Internal Review

### مراجعة من:

1. **Commercial lead:** التأكد من دقة positioning والـ claims
2. **Founder:** الموافقة النهائية على النشر
3. **Technical owner (إذا لزم):** التأكد من دقة وصف الـ workflow

### نقاط التدقيق:

- [ ] هل كل claims مدعومة بـ evidence؟
- [ ] هل usage level مطبق بشكل صحيح؟
- [ ] هل positioning متوافق مع `auditos-product-packaging.md`؟
- [ ] هل تم تجنب أي claims ممنوعة؟
- [ ] هل الـ anonymization كافية (إذا كانت Tier 2)؟

---

## Phase 6: Customer Final Approval

أرسل المسودة النهائية للعميل مع:

1. النص الكامل للـ case study
2. القنوات المخطط للنشر فيها
3. تاريخ النشر المستهدف
4. خيار تعديل أو رفض أي جزء

**القاعدة:** للعميل حق veto كامل على أي جزء. لا ننشر شيئًا لم يوافق عليه.

---

## Phase 7: Publication

### قنوات النشر المحتملة:

| القناة | Tier 1 (Public) | Tier 2 (Anonymized) |
|--------|-----------------|---------------------|
| موقع AQLIYA | نعم | نعم |
| Sales deck | نعم | نعم |
| Outbound materials | نعم | نعم |
| Social media | نعم | لا (إلا بموافقة خاصة) |
| Proposals | نعم | نعم |
| Founder updates | نعم | نعم |
| Investment materials | نعم | نعم |

---

## Phase 8: Distribution & Reuse

بعد النشر:

1. أضف case study إلى `proof-asset-index.md`
2. أضف proof assets الفردية إلى الـ index
3. اربط الـ case study في الـ sales deck والـ proposals
4. درّب الفريق على استخدامها في المحادثات
5. سجّل أي feedback يصل من prospects حول الـ case study

## Case Study Pipeline Tracker

| # | Account | Tier | Status | Target Date | Published |
|---|---|---|---|---|---|
| 1 | — | — | candidate / drafting / review / approved / published | — | — |

## Case Study Rules For First 3–5 Customers

1. لا تنشر case study قبل أن تستقر العلاقة التجارية
2. أنتج case study واحدة قوية قبل التفكير في الثانية
3. اجعل أول case study بسيطة وقابلة للتصديق
4. لا تبالغ في claims
5. احترم رغبة العميل في عدم النشر — هذا ليس فشلًا

## What Not To Claim In Any Case Study

1. AuditOS يستبدل المراجعين
2. AuditOS ينتج final approved financial statements تلقائيًا
3. AuditOS يضمن الامتثال
4. النتائج مضمونة لكل عميل
5. أي claim غير موثق بـ evidence

## Related Docs

1. `first-case-study-drafting-pack.md` — قالب drafting
2. `first-customer-case-study-capture.md` — التقاط المادة الأولية
3. `reference-request-kit.md` — طلب الموافقة
4. `proof-usage-rules.md` — قواعد استخدام الحالة المنشورة
