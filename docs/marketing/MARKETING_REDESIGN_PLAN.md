# خطة إعادة التصميم الكاملة — الموقع التسويقي AQLIYA

**الإصدار:** 1.0  
**التاريخ:** 2026-06-23  
**الحالة:** معتمد للتنفيذ  
**النطاق:** مسارات `(marketing)` + `/en/*` + مكوّنات التسويق — **لا** workspaces داخلية  
**مرجع:** `MARKETING_GAP_ASSESSMENT.md` + محاكاة عميل محتمل (2026-06-23)

---

## 1. الهدف

تحويل الموقع من **موسوعة محتوى طويلة** إلى **آلة تحويل مؤسسية**:

| قبل | بعد |
|-----|-----|
| ٤٠+ صفحة، ٩ أقسام في الرئيسية | **١٢ صفحة أساسية** + عمق اختياري |
| «اقرأ كل شيء ثم قرر» | **اختر دورك → أثبت → تواصل** في ≤ 3 دقائق |
| إثبات مبعثر | **مركز إثبات واحد** مع فيديو + ديمو + PDF |
| AR قوي / EN ضعيف | **مرآة EN كاملة** لمسار التحويل |
| صفحات منتج ٣٠٠–٦٥٠ سطر | **قالب منتج موحّد** ~١٢٠ سطر |

**معيار النجاح (90 يوم):**  
زائر مؤسسي يصل إلى CTA (تشخيص أو ديمو) خلال **≤ 3 نقرات** و**≤ 3 دقائق قراءة**.

---

## 2. التشخيص — لماذا إعادة تصميم كاملة؟

### أرقام الواقع الحالي

| الصفحة | أسطر تقريباً | المشكلة |
|--------|-------------|---------|
| `/` (الرئيسية) | ~660 | ٩ أقسام — إرهاق |
| `/executive-brief` | ~635 | تكرار الرئيسية + المنصة |
| `/engagement-models` | ~650 | يجب أن يكون قسماً لا صفحة منفصلة طويلة |
| `/pilot-proof` | ~538 | يُدمج في `/proof` |
| `/proof-library` | ~534 | يُدمج في `/proof` |
| `/security` | ~509 | يُختصر + رابط PDF |
| `/products/*` | ٢٠٠–٣٣٠ | إيموجي + تفاصيل تقنية زائدة |

### فجوات محاكاة العميل

1. **لا إثبات اجتماعي** — `/pilot-outcomes` فارغ  
2. **لا فيديو** — `NEXT_PUBLIC_DEMO_VIDEO_URL` غير مفعّل  
3. **مسار مقاولات/محتوى محلي** غير بارز في `/start`  
4. **لا نطاق سعري** للمشتريات  
5. **EN** بدون `/en/start` وHero قديم  
6. **On-Prem** في brief بدون توضيح «استراتيجي»

---

## 3. مبادئ التصميم الجديد

### 3.1 قاعدة الـ 3-3-3

```
٣ ثوانٍ  → فهم القيمة (Hero)
٣ دقائق  → اختيار المسار (/start)
٣ نقرات  → إثبات أو تواصل (/proof أو /contact)
```

### 3.2 طبقات المحتوى (لا تتغير)

| الطبقة | الغرض | الحد الأقصى للصفحة |
|--------|--------|-------------------|
| **Entry** | جذب + توجيه | ٤ أقسام |
| **Journey** | مسار حسب الدور | ٦ بطاقات + CTA |
| **Proof** | إثبات قبل الشراء | ٧ بطاقات + فيديو |
| **Depth** | تفاصيل للمهتمين | قابل للتوسع عبر tabs |

### 3.3 نبرة بصرية

| احذف | استبدل بـ |
|------|-----------|
| إيموجي في صفحات المنتج | أيقونات SVG هندسية (موجودة في `components/visuals`) |
| `hero-gradient` متكرر ١٥+ مرة | **Marketing Shell** واحد: Hero + Body + CTA band |
| بطاقات متشابهة ٤٠ نوع | **٦ مكوّنات** فقط (انظر §6) |
| نصوص إنجليزية مختلطة في النماذج | عربي/إنجليزي حسب locale |

### 3.4 الصدق التجاري (غير قابل للتفاوض)

- لا L-levels على Vision  
- لا شهادات وهمية  
- On-Prem / Private = «استراتيجي — تواصل للنطاق»  
- دراسات الحالة = «سيناريو موثّق» حتى يوجد عميل حقيقي  

---

## 4. هيكل المعلومات الجديد (IA)

```
                    ┌─────────────┐
                    │     /       │  Entry (4 blocks)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  /start  │ │ /products│ │  /proof  │
        │  Journey │ │  Systems │ │  Proof   │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │            │            │
             └────────────┼────────────┘
                          ▼
                    ┌──────────┐
                    │ /contact │  Convert
                    └──────────┘

Depth (footer + روابط داخلية):
  /use-cases · /industries · /about · /insights · /governance
  /security · /deployment · /procurement-pack (PDF hub)
```

### التنقل الرئيسي (نهائي)

| AR | EN | المسار |
|----|-----|--------|
| من أين تبدأ | Get Started | `/start` |
| أنظمة التشغيل | Systems | `/products` |
| الإثبات | Proof | `/proof` |
| تواصل | Contact | `/contact` |

**يُزال من الهيدر:** المنصة، عن عقلية، القطاعات → **Footer + Entry**

---

## 5. خريطة الصفحات — دمج وإعادة توجيه

### 5.1 صفحات أساسية (تبقى — تُعاد تصميمها)

| المسار | الدور الجديد | هدف الأسطر |
|--------|-------------|-----------|
| `/` | Entry مختصرة | ≤ 200 |
| `/start` | محور الرحلة (+ مسار مقاولات) | ≤ 180 |
| `/products` | فهرس أنظمة التشغيل | ≤ 150 |
| `/products/audit` | قالب منتج | ≤ 120 |
| `/products/decision` | قالب منتج | ≤ 120 |
| `/products/local-content` | قالب منتج | ≤ 120 |
| `/proof` | **مركز إثبات موحّد** | ≤ 250 |
| `/demo` | بوابة الديمو + فيديو | ≤ 150 |
| `/contact` | تحويل | ≤ 120 |
| `/use-cases` | عمق — ٤ حالات رئيسية فقط | ≤ 200 |
| `/procurement-pack` | PDF hub (مشتريات) | ≤ 80 |

### 5.2 صفحات تُدمج (محتوى ينتقل → redirect 301)

| من | إلى | السبب |
|----|-----|--------|
| `/executive-brief` | `/proof#executive-brief` | تكرار |
| `/pilot-proof` | `/proof#evaluation-framework` | تكرار |
| `/proof-library` | `/proof#evidence-samples` | تكرار |
| `/pilot-outcomes` | `/proof#outcomes` | فارغ → قسم واحد |
| `/how-we-work` | `/start#process` | رحلة موحّدة |
| `/engagement-models` | `/start#engagement` | ٥ نماذج = قسم |
| `/platform` | `/products` + `/about#platform` | تداخل |
| `/buyers/cfo` … | `/start#cfo` | redirects حالياً |
| `/buyers` (كاملة) | `/start` (بطاقات موسّعة) | تكرار |
| `/executive-briefing` | `/proof#executive-brief` | alias قديم |

### 5.3 صفحات عمق (تبقى — تُختصر)

| المسار | التغيير |
|--------|---------|
| `/about` | قصة + فريق + رؤية — بدون قائمة أنظمة |
| `/industries` | ٤ قطاعات — رابط لـ `/start` |
| `/governance` | ملخص + رابط PDF |
| `/security` | ملخص + جدول + PDF (من 509 → ~150 سطر) |
| `/deployment` | جدول صادق ٣ نماذج |
| `/case-studies` | ٢ سيناريو فقط حتى إثبات حقيقي |
| `/insights` | مدونة — بدون use cases (منقولة لـ `/use-cases`) |
| `/custom-product` | نموذج مختصر |

### 5.4 صفحات تُخفض الأولوية (footer فقط)

| المسار | المعاملة |
|--------|----------|
| `/products/office-ai` | footer link |
| `/products/sales` | footer link |
| `/products/simulation` | redirect `/products` |
| `/soc2-roadmap` | قسم في `/security` |

### 5.5 طباعة `/print/*`

**تبقى** — تُربط من `/procurement-pack` و`/proof` فقط.

---

## 6. نظام المكوّنات (Design System v2)

### مكوّنات جديدة — `src/components/marketing/v2/`

| المكوّن | الاستخدام |
|---------|-----------|
| `MarketingPageShell` | Hero + eyebrow + title + subtitle + actions |
| `PersonaPathCard` | بطاقة مسار في `/start` |
| `ProofAssetCard` | بطاقة في `/proof` |
| `SystemTeaserCard` | بطاقة نظام في `/products` |
| `ProductPageTemplate` | قالب موحّد لـ audit/decision/local-content |
| `ConversionBand` | شريط CTA ثابت قبل Footer |
| `TrustStrip` | ٣ نقاط ثقة (بدون أرقام وهمية) |
| `HonestBadge` | «سيناريو موثّق» / «قريباً» |

### مكوّنات تُستبدل تدريجياً

- `SectionEyebrow` + `EnterpriseCTA` → `MarketingPageShell`  
- تكرار `hero-gradient` في كل page → shell واحد  
- `BeforeAfterBlock` → يبقى داخل `ProductPageTemplate` فقط  

### Tokens بصرية

```css
/* مقترح — في marketing-v2.css أو Tailwind @theme */
--marketing-hero-max-width: 48rem;
--marketing-section-py: 4rem;      /* كان 5-6rem */
--marketing-card-radius: 1rem;     /* توحيد — كان 24px و 28px */
--marketing-body-max: 65ch;
```

---

## 7. إعادة تصميم الصفحات — تفصيل

### 7.1 الرئيسية `/` — من ٩ أقسام إلى ٤

```
┌────────────────────────────────────────────┐
│ BLOCK 1 — Hero                             │
│  · جملة تمايز واحدة                        │
│  · 3 CTAs: من أين تبدأ | ديمو | تشخيص      │
│  · 5 شرائح دور                             │
├────────────────────────────────────────────┤
│ BLOCK 2 — المشكلة → الحل (مدمج)            │
│  · 5 أدوات (Excel…) + سلسلة تشغيل ٦ خطوات  │
│  · رابط: حالات الاستخدام                   │
├────────────────────────────────────────────┤
│ BLOCK 3 — أنظمة التشغيل (٣ بطاقات)         │
│  AuditOS · DecisionOS · LocalContentOS      │
│  CTA → /products                           │
├────────────────────────────────────────────┤
│ BLOCK 4 — إثبات + تحويل                    │
│  · 3 بطاقات: ديمو | brief | حزمة مشتريات   │
│  · ConversionBand → /contact               │
└────────────────────────────────────────────┘
```

**يُحذف من الرئيسية:** المبادئ، من نخدم، لماذا يثق، رحلة العمل الكاملة، proof grid الكبير → كلها في `/start` و `/proof`.

**هدف:** من ~660 سطر → **~180 سطر**.

### 7.2 `/start` — محور الرحلة

**إضافة مسار سابع:**

| ID | الدور |
|----|-------|
| `contracting` | مقاولات / محتوى محلي / امتثال |

**أقسام الصفحة:**

1. Hero قصير  
2. ٧ بطاقات PersonaPathCard  
3. قسم `#engagement` — ٥ نماذج تعاون (مختصر من engagement-models)  
4. قسم `#process` — ٤ مراحل  
5. ConversionBand  

### 7.3 `/proof` — مركز إثبات موحّد

```
#proof
├── #demo              → /demo + فيديو
├── #executive-brief   → ملخص 5 دقائق (مدمج)
├── #evaluation-framework  ← pilot-proof
├── #evidence-samples  ← proof-library
├── #outcomes          ← pilot-outcomes (صدق حتى يمتلئ)
├── #procurement       → /procurement-pack
└── #security          → ملخص + رابط /security
```

**هدف:** صفحة واحدة بدل ٥ — الزائر لا يتوه.

### 7.4 `/products` + قالب المنتج

**فهرس `/products`:**

- ٣ أنظمة Tier-1 (بطاقات)  
- ٢ roadmap (Office AI، Sales) — muted  
- CTA → `/start`  

**قالب `ProductPageTemplate`:**

1. Hero: مشكلة → نتيجة (سطران)  
2. Before/After (موجود)  
3. Flow ٦ خطوات (موجود `WorkflowChain`)  
4. ٣ highlights  
5. رابط ديمو + CTA تشخيص  
6. **لا** journey ٧ مراحل كاملة — رابط «التفاصيل التقنية» اختياري collapsible  

### 7.5 `/contact`

- نموذج ٥ حقول (يبقى)  
- إزالة «General Inquiry» الإنجليزي → «استفسار عام»  
- تتبع: `diagnostic_request` بدل `pilot_review`  
- اختيار الدور يُعبّأ من `?persona=cfo` في URL  

---

## 8. خطة التنفيذ — 5 موجات (10 أسابيع)

### الموجة R1 — أساس (أسبوع 1–2) `P0`

| # | المهمة | الملفات |
|---|--------|---------|
| R1.1 | `MarketingPageShell` + `ConversionBand` | `components/marketing/v2/*` |
| R1.2 | اختصار الرئيسية → ٤ blocks | `page.tsx` |
| R1.3 | مسار `contracting` في buyer-journeys | `buyer-journeys.ts`, `start/page.tsx` |
| R1.4 | redirects في `next.config.mjs` | دمج الصفحات §5.2 |
| R1.5 | تحديث `marketing-routes.test.ts` | اختبارات |

**معيار الإغلاق:** الرئيسية ≤ 250 سطر، redirects تعمل، tsc + tests.

### الموجة R2 — Proof Hub (أسبوع 3–4) `P0`

| # | المهمة |
|---|--------|
| R2.1 | دمج pilot-proof + proof-library + executive-brief في `/proof` |
| R2.2 | تفعيل فيديو أو placeholder احترافي + تسجيل شاشة |
| R2.3 | اختصار `/demo` |
| R2.4 | `/pilot-outcomes` → قسم `#outcomes` مع حالة صادقة |

### الموجة R3 — Products (أسبوع 5–6) `P1`

| # | المهمة |
|---|--------|
| R3.1 | `ProductPageTemplate` |
| R3.2 | إعادة كتابة audit / decision / local-content |
| R3.3 | اختصار `/products` index |
| R3.4 | إزالة إيموجي — أيقونات visuals |

### الموجة R4 — Journey + EN (أسبوع 7–8) `P1`

| # | المهمة |
|---|--------|
| R4.1 | دمج engagement-models + how-we-work في `/start` |
| R4.2 | دمج `/buyers` في `/start` |
| R4.3 | `/en/start`, `/en/proof`, تحديث `/en` hero |
| R4.4 | `locale-paths` كامل |

### الموجة R5 — عمق + مشتريات (أسبوع 9–10) `P2`

| # | المهمة |
|---|--------|
| R5.1 | اختصار `/security`, `/deployment` |
| R5.2 | نطاق سعري تقريبي في engagement (جدول «من–إلى») |
| R5.3 | `/use-cases` → ٤ حالات Tier-1 فقط |
| R5.4 | Staging QA + `post-deploy-smoke` |
| R5.5 | تحديث `MARKETING_ROADMAP` + `CONTENT_CHANGE_LOG` |

---

## 9. جدول الاختصار المستهدف

| الصفحة | قبل (سطر) | بعد (هدف) | نسبة |
|--------|-----------|-----------|------|
| `/` | 660 | 180 | −73% |
| `/executive-brief` | 635 | 0 (مدمج) | −100% |
| `/proof` + المدمج | ~1600 | 250 | −84% |
| `/engagement-models` | 650 | 0 (مدمج) | −100% |
| `/products/audit` | 328 | 120 | −63% |
| `/buyers` | 405 | 0 (مدمج) | −100% |
| **إجمالي marketing LOC** | ~12,000 | ~4,500 | **−62%** |

---

## 10. EN Strategy

| AR | EN | أولوية |
|----|-----|--------|
| `/start` | `/en/start` | P0 |
| `/proof` | `/en/proof` (مدمج) | P0 |
| `/` مختصرة | `/en` محدّثة | P0 |
| `/products/*` | موجود جزئياً — قالب موحّد | P1 |
| `/contact` | `/en/contact` | موجود |

---

## 11. KPIs

| المؤشر | خط الأساس | هدف 90 يوم |
|--------|-----------|------------|
| وقت لأول CTA | غير مقاس | ≤ 90 ثانية |
| معدل وصول `/contact` من `/start` | — | ≥ 15% |
| Scroll depth الرئيسية | ~40% | ≥ 70% (صفحة أقصر) |
| Bounce `/pilot-outcomes` | عالي | يُزال |
| امتثال لغوي Vision | 100% CI | 100% |
| EN parity مسار التحويل | ~40% | 100% |

---

## 12. مخاطر وقيود

| المخاطرة | التخفيف |
|----------|---------|
| كسر SEO لروابط قديمة | 301 redirects + `sitemap` |
| فقد محتوى مفيد | يُنقل لـ `/insights` أو PDF لا يُحذف |
| Scope creep | لا لمس workspaces |
| ادعاءات On-Prem | نص «استراتيجي — تواصل» |
| لا إثبات حقيقي بعد R2 | صدق + «قريباً» حتى المرحلة 2 تجارية |

---

## 13. ما لا نفعله

- لا redesign لـ `/audit/*`, `/local-content/*` workspaces  
- لا تغيير `PRODUCT_STATUS_MATRIX`  
- لا شهادات عملاء مزيفة  
- لا build كامل في كل commit — `tsc` + marketing tests فقط  
- لا حذف `/print/*`  

---

## 14. ترتيب البدء الموصى به

```
الأسبوع 1:  R1.1 + R1.2  → رئيسية مختصرة + shell
الأسبوع 2:  R1.3 + R1.4  → redirects + مسار مقاولات
الأسبوع 3:  R2.1         → proof hub موحّد
الأسبوع 4:  R2.2 + فيديو → أقوى إثبات
ثم:        R3 → R4 → R5
```

**أول commit مقترح:**  
`feat(marketing): R1 — MarketingPageShell + homepage 4-block redesign`

---

## 15. الملفات المرجعية

| ملف | الغرض |
|-----|--------|
| `MARKETING_REDESIGN_PLAN.md` | هذه الخطة |
| `MARKETING_ROADMAP.md` | خارطة تجارية (مراحل 0–6) |
| `MARKETING_GAP_ASSESSMENT.md` | تقييم الفجوات |
| `MARKETING_TERMINOLOGY.md` | مفردات معتمدة |
| `STAGING_QA_CHECKLIST.md` | QA بعد كل موجة |

---

**الحكم:** إعادة التصميم ليست «تجميلاً» — هي **دمج 40 صفحة في 12 مسار تحويل** مع اختصار 62% من المحتوى مع الحفاظ على الصدق.

**الخطوة التالية:** تنفيذ الموجة R1 — قل «يلا R1» للبدء.
