# برومبت توجيهي — تحليل موقع AQLIYA التسويقي وخطة التطوير

**الاستخدام:** انسخ المحتوى داخل صندوق «البرومبت» أدناه بالكامل إلى Claude (Code أو Projects).  
**اللغة المطلوبة للتقرير:** العربية (مع مسارات URL وأسماء ملفات بالإنجليزية).  
**لا تطلب من Claude تنفيذ كود** إلا إذا أضفت في النهاية: «نفّذ الموجة R1».

---

## البرومبت (انسخ من هنا)

```markdown
# المهمة

أنت **مدير منتج تسويقي + UX strategist + محلل تحويل B2B enterprise** تعمل على تقييم الموقع العام لمنصة **AQLIYA** (عقلية) — Private Governed Institutional Intelligence Platform.

مطلوب منك:
1. **تحليل دقيق وشامل** للموقع من الكود والمحتوى (ليس افتراضات).
2. **تقييم** المحتوى، العرض، التصميم، خريطة الموقع (Sitemap)، رحلة المشتري، والتحويل.
3. **خطة تطوير احترافية كاملة** — فين المشكلة، كيف تُحل، بأي أولوية، وبأي ملفات/مسارات.

لا تكتب تقريراً عاماً. كل نقطة يجب أن تقول: **أين (URL/ملف)** + **ماذا الخطأ** + **كيف تُصلح** + **الأولوية (P0/P1/P2)**.

---

# هوية AQLIYA (ثابت — لا تغيّره)

- AQLIYA = منصة ذكاء مؤسسي خاص ومحكوم — **ليست** AuditOS فقط، وليست chatbot، وليست CRM.
- مبدأ الثقة: **الذكاء يساعد. الإنسان يقرر. الدليل يحكم.**
- المنتجات على المنصة: AuditOS، DecisionOS، LocalContentOS (+ Office AI، SalesOS في خارطة).
- الديمو العام: `/auditos/*` فقط — mock، read-only.
- Workspaces الحقيقية: `/audit/*`, `/local-content/*`, `/decisions/*` — **خارج نطاق التسويق**.

---

# قيود صارمة

1. **لا تقترح** تغيير `PRODUCT_STATUS_MATRIX.md`, `READINESS_GATES.md`, أو وثائق هندسة داخلية.
2. **لا تخترع** شهادات عملاء، أرقام أداء، أو قدرات غير موجودة في الكود.
3. على صفحات **Vision** لا تُقترح مصطلحات: L4–L6، pilot-ready، جاهز للبايلوت، قيد التطوير.
4. On-Prem / Air-Gapped / Local AI — **استراتيجي** ما لم يثبت الكود خلاف ذلك؛ اذكر بصدق.
5. التحليل من **الكود أولاً** ثم المحتوى؛ إن لم تستطع فتح الموقع حياً، اذكر ذلك صراحة.

---

# خطوة 0 — اقرأ قبل أي حكم

بالترتيب:
1. `docs/DOCUMENTATION_AUTHORITY.md`
2. `docs/marketing/MARKETING_TERMINOLOGY.md`
3. `docs/marketing/MARKETING_GAP_ASSESSMENT.md`
4. `docs/marketing/MARKETING_ROADMAP.md`
5. `docs/marketing/MARKETING_REDESIGN_PLAN.md`
6. `src/lib/marketing/public-status.ts`
7. `src/lib/marketing/buyer-journeys.ts`
8. `src/components/layout/site-header.tsx`
9. `src/components/layout/site-footer.tsx`

---

# خطوة 1 — خريطة الموقع الكاملة (Sitemap Audit)

افحص **كل** مسار في القائمة أدناه. لكل مسار أنشئ صفاً في جدول:

| URL | ملف المصدر | الطبقة (Vision/Journey/Proof/Convert/Depth) | الحالة | درجة 1–5 | ملاحظة |

## مسارات عربية `(marketing)`

### Entry & Journey
- `/` — `src/app/(marketing)/page.tsx`
- `/start` — `src/app/(marketing)/start/page.tsx`
- `/platform` — `src/app/(marketing)/platform/page.tsx`
- `/about` — `src/app/(marketing)/about/page.tsx`

### Operating Systems
- `/products` — `src/app/(marketing)/products/page.tsx`
- `/products/audit` — `src/app/(marketing)/products/audit/page.tsx`
- `/products/decision` — `src/app/(marketing)/products/decision/page.tsx`
- `/products/local-content` — `src/app/(marketing)/products/local-content/page.tsx`
- `/products/office-ai` — `src/app/(marketing)/products/office-ai/page.tsx`
- `/products/sales` — `src/app/(marketing)/products/sales/page.tsx`
- `/products/simulation` — `src/app/(marketing)/products/simulation/page.tsx`

### Proof & Conversion
- `/proof` — `src/app/(marketing)/proof/page.tsx`
- `/demo` — `src/app/(marketing)/demo/page.tsx`
- `/auditos` — `src/app/auditos/` (demo public)
- `/executive-brief` — `src/app/(marketing)/executive-brief/page.tsx`
- `/pilot-proof` — `src/app/(marketing)/pilot-proof/page.tsx`
- `/pilot-outcomes` — `src/app/(marketing)/pilot-outcomes/page.tsx`
- `/proof-library` — `src/app/(marketing)/proof-library/page.tsx`
- `/case-studies` — `src/app/(marketing)/case-studies/page.tsx`
- `/procurement-pack` — `src/app/(marketing)/procurement-pack/page.tsx`
- `/engagement-models` — `src/app/(marketing)/engagement-models/page.tsx`
- `/contact` — `src/app/(marketing)/contact/page.tsx`
- `/contact/contact-form.tsx`

### Depth & Trust
- `/use-cases` — `src/app/(marketing)/use-cases/page.tsx`
- `/industries` — `src/app/(marketing)/industries/page.tsx`
- `/governance` — `src/app/(marketing)/governance/page.tsx`
- `/security` — `src/app/(marketing)/security/page.tsx`
- `/deployment` — `src/app/(marketing)/deployment/page.tsx`
- `/how-we-work` — `src/app/(marketing)/how-we-work/page.tsx`
- `/buyers` — `src/app/(marketing)/buyers/page.tsx`
- `/buyers/cfo`, `/cio`, `/audit-partner`, `/government`
- `/custom-product` — `src/app/(marketing)/custom-product/page.tsx`
- `/soc2-roadmap` — `src/app/(marketing)/soc2-roadmap/page.tsx`

### Content
- `/insights` — `src/app/(marketing)/insights/page.tsx`
- `/insights/*` (3 مقالات)

### Legal
- `/privacy`, `/terms`

### Print (PDF)
- `/print/*` — executive-brief، pilot-sow، evaluation-sow-en، إلخ.

## مسارات إنجليزية `/en/*`

افحص parity مع العربية:
- `/en`, `/en/platform`, `/en/about`, `/en/industries`, `/en/governance`
- `/en/proof`, `/en/contact`, `/en/demo`
- `/en/products/audit`, `/decision`, `/local-content`
- `/en/engagement-models`, `/deployment`, `/procurement-pack`, `/how-we-work`
- **تحقق:** هل يوجد `/en/start`؟ `/en/use-cases`؟ `/en/buyers`؟

## Redirects

افحص `next.config.mjs` → `redirects()` و`src/lib/marketing/locale-paths.ts` — هل التوجيهات متسقة؟ هل `/use-cases` يعمل؟ هل `/buyers/cfo` redirect صحيح؟

---

# خطوة 2 — محاكاة عميل (إلزامي)

مشِّ على الموقع كـ **3 شخصيات** ووثّق كل خطوة:

## شخصية أ — CFO شركة مقاولات (محتوى محلي + مراجعة)
- الهدف: تقليل مخاطر امتثال، تقارير تنظيمية
- المسار: `/` → `/start` → LocalContentOS → `/proof` → `/contact`
- سجّل: أين توقفت؟ أين شككت؟ هل وجدت مسارك؟

## شخصية ب — شريكة مكتب تدقيق
- المسار: `/start#audit` → `/buyers` → `/demo` → `/auditos`
- ركّز على: مصداقية مهنية، IFRS/SOCPA، نبرة enterprise

## شخصية ج — مسؤول مشتريات حكومي
- المسار: `/procurement-pack` → `/security` → `/deployment` → `/engagement-models`
- ركّز على: SOC2، سعر، حزمة PDF، متطلبات الترسية

لكل شخصية: **احتمال التحويل %** + **السبب**.

---

# خطوة 3 — أبعاد التقييم (كل بُعد 1–5 + دليل)

## 3.1 المحتوى (Content)
- وضوح القيمة في 30 ثانية
- تمايز vs Excel / ERP / ChatGPT
- اتساق المصطلحات مع `MARKETING_TERMINOLOGY.md`
- طول الصفحات (عدد الأقسام، تكرار)
- صدق تجاري (لا مبالغة)
- عربي أولاً + جودة EN

## 3.2 العرض والرسالة (Positioning)
- هل يُفهم أن AQLIYA منصة وليست منتجاً واحداً؟
- هل أنظمة التشغيل واضحة أم مخفية؟
- هل مسار «تشخيص → تقييم تشغيلي → قرار بالأدلة» مفهوم؟
- إثبات اجتماعي: دراسات حالة، outcomes، فيديو

## 3.3 التصميم وتجربة الاستخدام (UX/UI)
- التنقل: header، footer، active states
- طول التمرير والإرهاق
- التسلسل البصري (hero-gradient، بطاقات، CTAs)
- إمكانية الوصول: عناوين، تباين، RTL
- تناسق المكوّنات (`components/enterprise` vs `components/marketing`)
- إيموجي vs أيقونات احترافية في صفحات المنتج
- نموذج التواصل: حقول، احتكاك، زمن الرد المتوقع

## 3.4 خريطة المعلومات (IA / Sitemap)
- تكرار الصفحات (brief، proof، buyers، engagement)
- صفحات يتيمة (orphan) — لا وصول من nav
- عمق النقر حتى CTA
- اقتراح IA جديد: كم صفحة أساسية؟ ماذا يُدمج؟ ماذا يُعاد توجيهه؟

## 3.5 التحويل (Conversion)
- CTAs: وضوح، ترتيب، تكرار
- `/api/pilot-review` — نموذج التواصل
- `/api/custom-product-submit`
- مسار الديمو `/demo` → `/auditos`
- فيديو: `NEXT_PUBLIC_DEMO_VIDEO_URL` — هل مفعّل؟

## 3.6 تقني تسويقي
- `src/__tests__/unit/marketing/vision-layer-language.test.ts`
- `marketing-routes.test.ts`
- `post-deploy-smoke.mjs` / `demo-smoke-check.mjs`
- SEO: metadata، عناوين مكررة

---

# خطوة 4 — تحليل صفحة بصفحة (نموذج إلزامي)

لكل صفحة **أساسية** (على الأقل: `/`, `/start`, `/products`, `/products/audit`, `/proof`, `/demo`, `/contact`):

```markdown
## [URL]

**الملف:** `path/to/page.tsx`  
**عدد الأسطر التقريبي:** N  
**الطبقة:** Vision | Journey | Proof | Convert  

### ماذا يفعل اليوم
(جملتان)

### نقاط القوة
- ...

### نقاط الضعف
| # | أين بالضبط | المشكلة | التأثير على العميل | الأولوية |
|---|------------|---------|-------------------|----------|

### اقتراح إعادة التصميم
- **فين:** (قسم/مكوّن/سطر)
- **كيف:** (محتوى/هيكل/دمج/حذف/redirect)
- **بعد:** (وصف الحالة المستهدفة)

### روابط مرتبطة
(إلى أي صفحة يجب أن يشير؟)
```

---

# خطوة 5 — خطة التطوير المطلوبة

قدّم خطة على **5 موجات** (يمكنك تحسين `MARKETING_REDESIGN_PLAN.md` الموجود):

| الموجة | المدة | P0/P1 | المخرجات | الملفات المتأثرة | معيار الإغلاق |
|--------|-------|-------|----------|------------------|---------------|

تضمين:
- **دمج الصفحات** (من → إلى + 301)
- **اختصار المحتوى** (هدف أسطر لكل صفحة)
- **مكوّنات جديدة** (`MarketingPageShell`, `ProductPageTemplate`, …)
- **EN parity**
- **إثبات تجاري** (فيديو، outcomes حقيقية — متى يتوفر محتوى من الفريق)
- **KPIs** لـ 30 / 60 / 90 يوم

---

# خطوة 6 — مخرجات التقرير النهائي (هيكل إلزامي)

```markdown
# تقرير تحليل موقع AQLIYA التسويقي

## 1. الملخص التنفيذي (للإدارة — 10 أسطر)
## 2. الدرجة الإجمالية X/5 + جدول الأبعاد الستة
## 3. خريطة الموقع — جدول كامل (كل URL)
## 4. خريطة معلومات مقترحة (رسم ASCII أو Mermaid)
## 5. نتائج محاكاة العملاء (3 شخصيات)
## 6. تحليل صفحة بصفحة (الصفحات الأساسية)
## 7. تقييم التصميم والمكوّنات
## 8. فجوات EN vs AR
## 9. خطة التطوير — موجات R1–R5 (مفصّلة)
## 10. Quick Wins (أسبوع واحد)
## 11. مخاطر وقيود
## 12. ما لا يجب فعله
## 13. الخطوة التالية الموصى بها (commit واحد محدد)
```

---

# معايير الجودة للتقرير

- **لا جمل فضفاضة** مثل «يحتاج تحسين» — دائماً: فين + كيف.
- **أرقام** حيث ممكن: عدد أقسام الرئيسية، أسطر الملف، نقرات حتى CTA.
- **قارن** بالخطة الموجودة في `MARKETING_REDESIGN_PLAN.md` — وافق أو عدّل مع مبرر.
- **ميز** بين ما يحتاج **محتوى من الفريق** (شهادة عميل، فيديو) وما يحتاج **كود فقط**.
- التقرير بالعربية؛ URLs ومسارات الملفات بالإنجليزية.

---

# أوامر مساعدة للمستودع (إن كنت في Claude Code)

```bash
# خريطة الملفات
find src/app/\(marketing\) -name "page.tsx" | sort

# طول الصفحات
wc -l src/app/\(marketing\)/**/page.tsx src/app/en/**/page.tsx 2>/dev/null

# اختبارات تسويق
npm test -- src/__tests__/unit/marketing/

# مصطلحات محظورة
rg -i "pilot-ready|L[456]|جاهز للبايلوت|قيد التطوير" src/app/\(marketing\) src/app/en
```

ابدأ التحليل الآن. لا تتوقف عند الملخص — أكمل كل الأقسام الـ 13.
```

---

## ملاحظات للمستخدم

| البند | التوصية |
|-------|---------|
| **Claude Projects** | ارفع `docs/marketing/*` + `src/app/(marketing)/**` + `site-header/footer` |
| **Claude Code** | الصق البرومبت في جلسة جديدة مع مسار المستودع |
| **موقع حي** | أضف: «افتح staging.aqliya.com أو localhost:3000 وأكمل التحليل البصري» |
| **بعد التقرير** | قل «نفّذ Quick Wins» أو «نفّذ R1» للتنفيذ |

---

**آخر تحديث:** 2026-06-23
