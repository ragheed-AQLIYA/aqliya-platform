# AQLIYA Product Comparison & Decisive Recommendation

> **v1.1 Alignment Notice:** This is an internal strategic analysis document written before the AQLIYA v1.1 official taxonomy. It contains comparative analysis useful for internal planning. For authoritative product boundaries and status, see `docs/official/aqliya-product-taxonomy-v1.1.md`. References to GovernanceOS as a product reflect a conceptual direction; v1.1 positions governance as a shared engine within AQLIYA Intelligence Core.

**Date:** 2026-05-13
**Scope:** Strategic comparison of GovernanceOS, DecisionOS, SalesOS, SimulationOS against AuditOS
**Source of truth:** Product Focus Doctrine (`docs/theoretical-reference/13-product-philosophy/13-12-product-focus-doctrine.md`)

---

## Part 1: Comparative Matrix

### مقارنة المنتجات حسب ستة أبعاد استراتيجية

| Dimension | GovernanceOS | DecisionOS | SalesOS | SimulationOS |
|---|---|---|---|---|
| **القرب من AuditOS** | ⭐⭐⭐⭐⭐ عالٍ جدًا | ⭐⭐⭐⭐ عالٍ | ⭐⭐ منخفض | ⭐⭐⭐ متوسط |
| **سهولة البيع** | ⭐⭐⭐ متوسط | ⭐⭐⭐⭐ عالٍ | ⭐⭐⭐ متوسط | ⭐⭐ منخفض |
| **سرعة بناء MVP** | ⭐⭐⭐ متوسط | ⭐⭐⭐⭐⭐ عالٍ جدًا | ⭐⭐⭐ متوسط | ⭐⭐ منخفض |
| **قوة التمايز** | ⭐⭐⭐⭐⭐ عالٍ جدًا | ⭐⭐⭐⭐ عالٍ | ⭐⭐⭐ متوسط | ⭐⭐⭐⭐ عالٍ |
| **قابلية الاستخدام داخليًا** | ⭐⭐⭐⭐⭐ عالٍ جدًا | ⭐⭐⭐⭐⭐ عالٍ جدًا | ⭐⭐⭐ متوسط | ⭐⭐⭐ متوسط |
| **الأثر على AQLIYA كمنصة** | ⭐⭐⭐⭐⭐ عالٍ جدًا | ⭐⭐⭐⭐⭐ عالٍ جدًا | ⭐⭐⭐ متوسط | ⭐⭐⭐ متوسط |

---

## Part 2: Detailed Dimension Analysis

### 2.1 القرب من AuditOS (Proximity to AuditOS)

**GovernanceOS: عالٍ جدًا** ⭐⭐⭐⭐⭐
- الحوكمة الهيكلية (approval chains, evidence gating, audit trails) مولودة داخل AuditOS
- AuditOS هو أول instance عملياتي لمنطق GovernanceOS
- الاستخراج تكرار طبيعي — ليس بناء من الصفر

**DecisionOS: عالٍ** ⭐⭐⭐⭐
- يشترك مع AuditOS في: governance layer, evidence model, workflow engine, intelligence layer
- الـ TENDER module صلة وصل مباشرة: financial scoring + margin analysis
- الفارق: DecisionOS يخدم قرارات عامة، AuditOS يخدم قرارات المراجعة تحديدًا

**SimulationOS: متوسط** ⭐⭐⭐
- الـ TENDER simulation engine موجود فعلًا داخل DecisionOS
- لا يستهلكه AuditOS مباشرة — AuditOS لا يحتاج محاكاة سيناريوهات
- الجسر الوحيد هو TENDER type في DecisionOS

**SalesOS: منخفض** ⭐⭐
- نطاق مختلف تمامًا (تجاري vs مالي)
- لا اعتماد مباشر على AuditOS
- يشارك البنية التحتية (DecisionOS + GovernanceOS + SimulationOS) لكنه vertical application مستقل

### 2.2 سهولة البيع (Ease of Selling)

**DecisionOS: عالٍ** ⭐⭐⭐⭐
- كل مدير تنفيذي يفهم "اتخاذ القرار" — ليس مفهومًا غريبًا
- المشكلة visible: القرارات تُتخذ بدون هيكل، أدلة، أو حوكمة
- الـ buyer واحد (CEO, CFO, Strategy Officer) يتخذ القرار ويشتري
- Language مباشر: "من 'نحتاج نقرر' إلى 'قررنا وهذا الدليل'"

**GovernanceOS: متوسط** ⭐⭐⭐
- مفهوم الحوكمة معروف لكن الـ buyer مختلف (Governance Officer, Compliance Director)
- ليس كل enterprise لديه Governance Officer مخصص
- القيمة حقيقية لكن دورة البيع أطول (تحتاج إقناع أن الحوكمة الهيكلية تختلف عن السياسات)
- Bi-modal: سهل البيع لمن عانى من فشل حوكمة، صعب على من يظن أن "السياسات كافية"

**SalesOS: متوسط** ⭐⭐⭐
- سوق CRM مشبع — يحتاج تمييز واضح: "لسنا CRM، نحن ذكاء قرارات تجاري"
- الـ buyer معتاد على أدوات تجارية لكنه متعب من الوعود
- Pilot أسهل (كل شركة عندها deals) لكن conversion لـ paid أصعب (الـ CRM incumbent)
- Integrate-don't-replace positioning صحيح لكنه يقلص perceived TAM

**SimulationOS: منخفض** ⭐⭐
- مفهوم مجرد يصعب بيعه standalone
- "multi-dimensional scenario engine" ليس language يفهمه الـ buyer بسهولة
- يباع أفضل embedded داخل DecisionOS ("شوف كيف السيناريوهات تطلع توصيات") من standalone

### 2.3 سرعة بناء MVP (Speed of MVP Build)

**DecisionOS: عالٍ جدًا** ⭐⭐⭐⭐⭐
- 80%+ من الـ code موجود ويعمل ✅
- Core A-1 pipeline مكتمل (Intake → Framework → Scenarios → Risks → Recommendation)
- 10 decision types مدعومة
- Intelligence layer مكتمل
- Governance page مكتمل
- Post-decision monitoring مكتمل
- المتبقي: generic simulation engine, generic recommendation engine, type-specific profiles, conditional tab visibility, new form handler (~3-4 أسابيع عمل مركز)

**GovernanceOS: متوسط** ⭐⭐⭐
- Governance logic موجود مبعثر في AuditOS و DecisionOS — لكنه ليس standalone product
- يحتاج: extraction, API layer, dedicated workspace, rule editor UI, compliance dashboard
- ليس صعبًا تقنيًا لكنه عمل structuring و packaging (~6-8 أسابيع عمل)

**SalesOS: متوسط** ⭐⭐⭐
- Prototype dashboard موجود لكنه ليس operational
- يحتاج: pipeline management, deal qualification framework, A-1 pipeline adaptation for deals, pricing recommendation, commercial approval chains (~8-10 أسابيع عمل)
- الاعتماد على DecisionOS يسرّع (A-1 pipeline موجود) لكن الـ UI والنماذج التجارية جديدة

**SimulationOS: منخفض** ⭐⭐
- Tender simulation موجود لكنه Tender-only
- يحتاج: generic simulation engine, 4+ type-specific adapters, sensitivity analysis, confidence scoring, simulation audit trail (~6-8 أسابيع عمل)
- تعقيد تقني أعلى (scoring formulas, dimension configuration, sensitivity math)

### 2.4 قوة التمايز (Differentiation Strength)

**GovernanceOS: عالٍ جدًا** ⭐⭐⭐⭐⭐
- لا يوجد منافس مباشر يقدم "structural governance enforcement" كمنتج
- GRC tools تراقب وتوثّق — لا تفرض. GovernanceOS يفرض.
- Evidence-gated workflows مفهوم غير موجود في السوق حاليًا
- Compliance-as-operating-system تمايز قوي

**DecisionOS: عالٍ** ⭐⭐⭐⭐
- "structured enterprise decisions with governed pipeline" فئة جديدة
- ليس PM tool، ليس BI dashboard، ليس voting app
- A-1 pipeline مع simulation + governance + post-decision monitoring لا يوجد له مقابل
- التحدي: شرح الفئة الجديدة يحتاج جهد (category creation burden)

**SimulationOS: عالٍ** ⭐⭐⭐⭐
- Multi-dimensional, governed, auditable simulation — تمايز حقيقي عن spreadsheets
- configurable per decision type — مرونة لا توجد في أدوات المحاكاة الحالية
- Sensitivity analysis + confidence scoring مع governance trail
- التحدي: العملاء الحاليون يستخدمون Excel ولا يرون المشكلة

**SalesOS: متوسط** ⭐⭐⭐
- سوق CRM/commercial tools مشبع جدًا
- التمايز في "governed commercial decisions" حقيقي لكنه niche
- أكبر المنافسين (Salesforce, HubSpot) عندهم ecosystems ضخمة
- AQLIYA لن تنافس على features — تنافس على governance + intelligence layer فوق الـ CRM

### 2.5 قابلية الاستخدام داخليًا (Internal Usability)

**GovernanceOS: عالٍ جدًا** ⭐⭐⭐⭐⭐
- AQLIYA نفسها تستخدم governance rules يوميًا (approval chains, evidence gating, platform audit)
- استخدام GovernanceOS داخليًا = تطوير المنتج من الداخل للخارج (dogfooding مثالي)
- كل feature سيبني يحتاجه الفريق فعلًا

**DecisionOS: عالٍ جدًا** ⭐⭐⭐⭐⭐
- AQLIYA تستخدم DecisionOS حاليًا لقراراتها الداخلية (tender evaluation, strategic decisions)
- Dogfooding موجود ونشط — المنتج يتحسن من الاستخدام الحقيقي
- كل decision type جديد يُختبر على قرارات حقيقية

**SalesOS: متوسط** ⭐⭐⭐
- AQLIYA عندها نشاط تجاري (AuditOS pilots and sales) — يمكن استخدام SalesOS لإدارته
- لكن حجم النشاط التجاري الحالي صغير (first pilots)
- الاستخدام الداخلي سيكون light — لا يوفر stress test حقيقي

**SimulationOS: متوسط** ⭐⭐⭐
- AQLIYA تتخذ قرارات تحتاج محاكاة (tender evaluation for own procurement)
- لكن عدد القرارات القابل للمحاكاة محدود
- الاستخدام الداخلي سيكون مفيدًا لكنه ليس كافيًا لصقل المنتج

### 2.6 الأثر على AQLIYA كمنصة (Impact on AQLIYA as a Platform)

**GovernanceOS: عالٍ جدًا** ⭐⭐⭐⭐⭐
- الحوكمة هي الطبقة المشتركة لكل منتج — بدونها لا توجد منصة
- GovernanceOS externalized = كل منتج يستهلك governance كخدمة بدل ما يبنيها داخليًا
- هو ما يجعل AQLIYA "platform" وليس "suite of products"

**DecisionOS: عالٍ جدًا** ⭐⭐⭐⭐⭐
- DecisionOS هو تعبير الفئة (category expression) — Enterprise Decision Intelligence
- AuditOS هو الـ wedge؛ DecisionOS هو الـ category
- بدونه قد يُساء فهم AQLIYA سوقيًا كشركة audit software بدل فهمها كمنصة decision intelligence أوسع
- نجاح DecisionOS = إثبات أن الـ category thesis يعمل خارج نطاق المراجعة

**SimulationOS: متوسط** ⭐⭐⭐
- Shared engine يخدم DecisionOS و SalesOS — قيمة معمارية عالية
- لكنه engine وليس product — أثره على positioning أقل
- وجوده يقوي DecisionOS و SalesOS لكنه لا يعرّف المنصة

**SalesOS: متوسط** ⭐⭐⭐
- يثبت أن منصة AQLIYA تخدم non-financial domains
- دليل على platform thesis وليس vertical thesis
- لكنه vertical application — ليس طبقة تحتية مشتركة
- نجاحه = توسع السوق. فشله = لا يؤثر على platform thesis.

---

## Part 3: Strategic Synthesis

### المصفوفة الاستراتيجية النهائية

```
                         أثر عالٍ على المنصة
                              │
                    GovernanceOS  │  DecisionOS
                        ●         │      ●
                                  │
    MVP بعيد ──────────────────────┼────────────────── MVP قريب
                                  │
                   SimulationOS   │
                        ●         │      ● SalesOS
                                  │
                         أثر متوسط على المنصة
```

### القراءة الاستراتيجية

1. **DecisionOS** — القمة اليمنى العليا: أقرب للـ MVP الجاهز + أعلى أثر على المنصة. المنتج الأكثر جاهزية والأقرب للتسويق.

2. **GovernanceOS** — القمة اليسرى العليا: أعلى أثر على المنصة لكنه يحتاج بناء أكثر. الطبقة المشتركة التي بدونها لا توجد "منصة".

3. **SalesOS** — الأسفل الأيمن: قريب MVP لكن أثره على المنصة أقل. Vertical application يستفيد من المنصة ولا يبنيها.

4. **SimulationOS** — الأسفل الأيسر: يحتاج بناء + أثره على المنصة متوسط. Shared engine وليس منتجًا قائمًا بذاته.

---

## Part 4: Decisive Recommendation

### السؤال الأول: أي منتج نعرّفه أولًا؟

**التوصية الحاسمة: DecisionOS**

الأسباب:

1. **الأكثر جاهزية** — 80%+ من الكود موجود ويعمل. الـ MVP ليس "بناء من الصفر" بل "إكمال الـ 20% المتبقية". السرعة إلى السوق هي الأعلى بين الأربعة.

2. **الأقرب للـ category thesis** — Product Focus Doctrine يعرّف AQLIYA كـ "Enterprise Decision Intelligence infrastructure". DecisionOS هو بالضبط هذا. تعريفه أولًا = تعريف الفئة نفسها.

3. **الأسهل بيعًا** — لغة "اتخاذ القرار" يفهمها كل مدير تنفيذي. لا تحتاج شرح فئة جديدة (مثل GovernanceOS) أو قتال في سوق مشبع (مثل SalesOS).

4. **امتداد طبيعي من AuditOS** — العميل الذي يستخدم AuditOS لمراجعة بياناته المالية هو نفس العميل الذي يتخذ قرارات استثمارية وتوسعية. الـ upsell path واضح ومباشر.

5. **يثبت platform thesis** — إذا نجح DecisionOS (قرارات غير مراجعة)، ثبت أن AQLIYA منصة وليست أداة مراجعة. هذا هو strategic unlock الأهم.

**الخطوة العملية:**
- إكمال MVP DecisionOS (3-4 أسابيع)
- بناء demo dataset لقرارات non-tender
- إعداد commercial assets (one-pager, demo script, ICP messaging)
- Pilot مع عميل AuditOS حالي على قرار استثماري/توسعي

---

### السؤال الثاني: أي منتج نؤجله؟

**التوصية الحاسمة: SalesOS (يُؤجّل) + SimulationOS (يُدمج ولا يُفصل)**

**SalesOS — يُؤجّل للأسباب التالية:**

1. **سوق مشبع** — CRM/commercial tools سوق ضخم لكنه مليء بالمنافسين الأقوياء (Salesforce, HubSpot, إلخ). الدخول يحتاج قوة منصة كبيرة وليس MVP صغير.

2. **الاعتماد على منتجين آخرين** — SalesOS يحتاج DecisionOS (للـ A-1 pipeline) + GovernanceOS (للـ commercial approvals) + SimulationOS (للـ pricing scenarios). بناء SalesOS قبل نضوج هذه المنتجات = بناء على أساس غير مكتمل.

3. **الـ wedge strategy** — Product Focus Doctrine واضح: AuditOS هو الـ wedge في financial intelligence. الدخول في commercial intelligence (SalesOS) قبل ترسيخ financial intelligence يشتت الموارد والفئة.

4. **Internal usage محدود** — AQLIYA لديها نشاط تجاري صغير حاليًا. استخدام SalesOS داخليًا لن يوفر الـ stress test اللازم لصقل المنتج.

**متى نفتح SalesOS؟**
- بعد 6-9 أشهر من إطلاق DecisionOS
- عندما يكون لدى AQLIYA 10+ عملاء نشطين على المنصة
- عندما يطلب عميلان على الأقل commercial decision intelligence

**SimulationOS — يُدمج ولا يُفصل للأسباب التالية:**

1. **Shared engine، ليس منتجًا** — SimulationOS اليوم هو `src/lib/simulation/`. قيمته في كونه محركًا مشتركًا يخدم DecisionOS و SalesOS، وليس منتجًا يباع منفصلًا.

2. **لا يوجد buyer مستقل** — من يشتري "simulation engine"؟ النادر. الـ buyer يشتري حل قرارات (DecisionOS) أو حل تجاري (SalesOS). المحاكاة ميزة داخل هذه المنتجات.

3. **بناء المحاكاة كـ shared engine** هو المسار الصحيح — وليس كـ standalone product. أنفق الجهد على generic simulation engine + type-specific adapters داخل DecisionOS.

**توصية SimulationOS:**
- ابقه كـ shared engine داخل منصة AQLIYA
- ابنِ generic simulation engine ضمن خارطة DecisionOS
- لا تبنِ له workspace مستقل أو commercial assets منفصلة
- راجع إمكانية productization بعد 12-18 شهرًا إذا ظهر طلب سوقي

---

### السؤال الثالث: أي منتج يمكن أن يكون الطبقة المشتركة لكل AQLIYA؟

**التوصية الحاسمة: GovernanceOS — هو الطبقة المشتركة لكل AQLIYA**

**لماذا GovernanceOS وليس غيره؟**

| لماذا GovernanceOS؟ | الدليل |
|---|---|
| **كل منتج يحتاج حوكمة** | AuditOS يحتاج approval chains + evidence gating. DecisionOS يحتاج approval chains + audit trail. SalesOS سيحتاج commercial approvals. الحوكمة هي الـ common denominator. |
| **الحوكمة موجودة فعلًا كمبدأ** | "AI assists. Humans decide. Evidence governs." هذا المبدأ يعمل في AuditOS. الحوكمة الهيكلية هي DNA الشركة. GovernanceOS يجعل هذا الـ DNA منتجًا. |
| **الحوكمة هي ما يجعل AQLIYA منصة وليس مجموعة منتجات** | بدون GovernanceOS، كل منتج يبني حوكمته داخليًا = silos. مع GovernanceOS، الحوكمة خدمة مشتركة = platform. |
| **الحوكمة هي التمايز الأعمق** | GRC tools تراقب. GovernanceOS يفرض. هذا تمايز لا يملكه أحد. |
| **قابل للتوسع خارج AQLIYA** | في المستقبل، GovernanceOS يمكن أن يخدم non-AQLIYA systems — أي enterprise system يحتاج approval chains و evidence gating. |

**ماذا يعني أن يكون GovernanceOS الطبقة المشتركة؟**

```text
                    ┌──────────────────────────────┐
                    │       AQLIYA Platform         │
                    │                              │
                    │  ┌────────────────────────┐  │
                    │  │     GovernanceOS        │  │  ← الطبقة المشتركة
                    │  │  • Approval Chains      │  │
                    │  │  • Evidence Gating      │  │
                    │  │  • Audit Trail          │  │
                    │  │  • Compliance Rules     │  │
                    │  │  • Role Enforcement     │  │
                    │  └────────┬───────────────┘  │
                    │           │                   │
                    │  ┌────────┼────────────────┐  │
                    │  │        │                │  │
                    │  ▼        ▼        ▼       ▼  │
                    │ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
                    │ │Aud │ │Dec │ │Sim │ │Sal │  │  ← المنتجات
                    │ │OS  │ │OS  │ │OS  │ │OS  │  │
                    │ └────┘ └────┘ └────┘ └────┘  │
                    └──────────────────────────────┘
```

**GovernanceOS كطبقة مشتركة لا يعني:**
- أنه يجب بناؤه قبل غيره — DecisionOS يُبنى أولًا (للأسباب أعلاه)
- أنه منتج يباع منفصلًا بالضرورة — يمكن أن يكون طبقة مشتركة داخلية + منتج للبيع

**GovernanceOS كطبقة مشتركة يعني:**
- أن كل feature حوكمة يُبنى في DecisionOS يجب أن يُصمم ليكون reusable
- أن approval chains و evidence gating و audit trails لا تُكرر في كل منتج
- أن GovernanceOS API هو الواجهة الوحيدة للحوكمة في أي منتج AQLIYA
- أن تعريف GovernanceOS (هذا المستند) يوجّه كل قرارات بناء الحوكمة في كل المنتجات

---

## Part 5: Executive Summary — Roadmap Recommendation

### التسلسل الموصى به

```
الآن:
  ├── AuditOS ← Pilot نشط، التركيز التجاري الحالي
  └── تعريف DecisionOS ← أولوية التعريف والتسويق

الـ 3 أشهر القادمة:
  ├── إكمال MVP DecisionOS (3-4 أسابيع)
  ├── Commercial assets لـ DecisionOS
  ├── أول Pilot لـ DecisionOS مع عميل AuditOS
  └── GovernanceOS كـ architecture layer (وليس منتجًا بعد)

الـ 6-9 أشهر القادمة:
  ├── GovernanceOS MVP كمنتج standalone
  ├── SimulationOS generic engine (داخل DecisionOS)
  ├── DecisionOS type-specific profiles (Investment, Expansion)
  └── SalesOS definition review (لا بناء)

الـ 9-18 شهرًا:
  ├── SalesOS MVP
  ├── GovernanceOS كمنتج قابل للبيع الخارجي
  └── SimulationOS review للـ productization المحتمل
```

### قاعدة القرار (Decision Rule)

استخدم هذه القاعدة لأي قرار مستقبلي حول هذه المنتجات:

1. **هل feature الحوكمة هذا يُستخدم في أكثر من منتج؟** → ابنه في GovernanceOS
2. **هل القرار من نوع non-audit؟** → هذا DecisionOS
3. **هل الميزة تحاكي سيناريوهات؟** → هذا SimulationOS engine
4. **هل الميزة تجارية/مبيعات؟** → انتظر حتى أولويتنا على SalesOS
5. **هل العميل يطلب شيئًا خارج هذه الحدود؟** → راجع Product Focus Doctrine

---

## Part 6: Final Word

المنتجات الأربعة مترابطة لكنها ليست متساوية في الأولوية:

1. **DecisionOS** هو المنتج الذي يعرّف الفئة. ابدأ به لأنه الأقرب والأسرع والأوضح.

2. **GovernanceOS** هو الطبقة المشتركة التي تجعل AQLIYA منصة. ابنِ الحوكمة كمبدأ shared من اليوم الأول، واجعله منتجًا مستقلاً لاحقًا.

3. **SimulationOS** هو محرك مشترك. استثمر فيه كـ engine داخل DecisionOS الآن، ولا تفصله كمنتج قبل ظهور طلب سوقي.

4. **SalesOS** هو التوسع الطبيعي بعد إثبات المنصة. أجّله حتى تثبت أن AQLIYA منصة قرارات قبل أن تكون منصة مبيعات.

**الجملة الفصل:** AQLIYA هي الشركة/المنصة الأم. AuditOS هو المنتج الحالي الأساسي تحتها اليوم، وDecisionOS يمثل توسعًا لاحقًا داخل نفس المنصة. GovernanceOS هو ما يربط المراحل الثلاث.

---

## Related References

1. `docs/product/governanceos-product-definition-pack.md`
2. `docs/product/decisionos-product-definition-pack.md`
3. `docs/product/salesos-product-definition-pack.md`
4. `docs/product/simulationos-product-definition-pack.md`
5. `docs/product/auditos-product-packaging.md`
6. `docs/theoretical-reference/13-product-philosophy/13-12-product-focus-doctrine.md`
7. `docs/source-of-truth/AQLIYA-company-product-architecture-official.md`
8. `docs/theoretical-reference/01-foundational-doctrine/`
