# AQLIYA Website Content Rewrite v1

> **Status:** Rewrite-ready proposal. Not yet implemented in source code.
> **Based on:** `docs/content/website-content-extract.md` + official v1.1 docs

---

## 1. Rewrite Principles

The following rules governed every copy decision in this rewrite:

| Principle | Application |
|---|---|
| **Platform-first** | AQLIYA is always presented as the parent platform/company, not reduced to any single product. Every product page references AQLIYA Intelligence Core as the foundation. |
| **Governance-first** | Every AI output claim is paired with human review, evidence linking, and audit trail. Never present AI as autonomous. |
| **Arabic-first** | Arabic is the primary copy language; English is supplementary. All product output labels are translated to Arabic. |
| **No unsupported claims** | Private/On-Prem, Air-Gapped, Local AI, Studio, Institutional Memory, Model Governance are never claimed as implemented unless official docs/code confirm. |
| **Product boundary clarity** | Each product has a clear status badge aligned with v1.1 taxonomy. Products are never presented as equal to each other. |
| **Human-reviewed / evidence-governed language** | The trust principle (`الذكاء يساعد. الإنسان يقرر. الدليل يحكم`) is baked into every product description, not just a tagline. |
| **Surgical changes only** | Where the existing copy is strong (e.g., AuditOS vs Excel/ChatGPT table), it is preserved. Changes are focused on fixing risks identified in the extraction. |

---

## 2. Global Messaging System

### Primary Arabic Positioning

**Short one-liner:**
عقلية — منصة ذكاء مؤسسي خاص ومحكوم.

**Medium paragraph:**
عقلية هي منصة تشغيل مؤسسية تبني خطوط أنظمة ذكية فوق نواة حوكمة واحدة. كل مخرج مربوط بالدليل، كل خطوة تحتاج مراجعة بشرية، وكل قرار مسجل في سجل تدقيق لا يمكن تغييره. السحابة متاحة الآن. التوسع للخوادم الخاصة جارٍ.

**Homepage hero version:**
بنية مؤسسية تجعل الذكاء مفيدًا، مفهومًا، ومحكومًا. عقلية ليست طبقة ذكاء منفصلة، بل منصة تشغيل تربط البيانات، القواعد، الصلاحيات، الأدلة، والمراجعة داخل مسار واحد يمكن الوثوق به.

### Primary English Positioning

**Short one-liner:**
AQLIYA — Private Governed Institutional Intelligence.

**Medium paragraph:**
AQLIYA is an institutional intelligence platform that builds governed systems on a shared core. Every output is evidence-linked. Every step requires human review. Every decision is auditable. Cloud is live. Private deployment is in preparation.

**Homepage hero version:**
An institutional architecture that makes intelligence useful, understandable, and governed. AQLIYA is not a chatbot layer over chaos — it is an operating platform that connects data, rules, permissions, evidence, and review in a single trustworthy chain.

### Trust Principle

| Language | Text |
|---|---|
| Arabic | الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم. |
| English | AI assists. Humans decide. Evidence governs. |

### What AQLIYA Is

- A **Private Governed Institutional Intelligence Platform** — institutions keep control of their data, decisions, and governance
- A multi-product platform company — multiple system lines built on a shared intelligence core
- A Cloud-first platform with Private/On-Prem as strategic deployment model
- A governance-first system: every AI output is evidence-linked, human-reviewed, and auditable
- A custom systems builder (via AQLIYA Studio, future) — enabling institutional systems without starting from scratch

### What AQLIYA Is Not

- NOT an AI chatbot
- NOT SaaS only
- NOT AuditOS only
- NOT a CRM
- NOT a generic workflow tool
- NOT a replacement for professional judgment

### Deployment Language

| Model | Approved Arabic | Approved English | Status |
|---|---|---|---|
| **Cloud** | سحابة عقلية — النسخة السحابية متاحة الآن. إدارة كاملة، تحديثات تلقائية، ونسخ احتياطي. مناسبة للشركات المتوسطة والمؤسسات التي تفضل عدم إدارة البنية التحتية. | AQLIYA Cloud — managed SaaS deployment. Automatic updates, backups, and full management. Suitable for SMEs, pilots, and mid-market organizations. | **Available now** |
| **Private / On-Prem** | خوادم خاصة — قيد الإعداد والتطوير. سيتمكن المؤسسات من تشغيل عقلية داخل بنيتها التحتية مع قاعدة بيانات محلية وتخزين محلي مع التحكم الكامل. | Private / On-Prem — under preparation. Will enable organizations to run AQLIYA inside their own infrastructure with local database, local storage, and full control. | **Strategic / future — not yet available as a production package** |
| **Air-Gapped** | بيئة معزولة — نموذج استراتيجي مستقبلي للمؤسسات ذات المتطلبات الأمنية العالية. يتطلب اكتمال نموذج الخوادم الخاصة أولاً. | Air-Gapped — strategic future model for high-security environments. Requires the Private/On-Prem model to be completed first. | **Strategic / future — not yet implemented** |

---

## 3. Product Status Language

| Product | Arabic Status | English Status | Website Treatment |
|---|---|---|---|
| **AuditOS** | أول تطبيق مُثبت — جاهز للتجربة | First proof product — pilot-ready | Strongest marketed product. Full marketing page + guided demo. Show as proof of AQLIYA Core. |
| **LocalContentOS** | استراتيجي — المنتج الثاني — قيد التخطيط | Strategic second product — in planning | Marketing page only, clear disclaimer. Saudi market focus. |
| **DecisionOS** | نظام مجاور — متاح للتفعيل | Adjacent system — active | Presented as active workspace built on AQLIYA Core, not as a primary product line. Status badge: "نظام مجاور — متاح" |
| **SalesOS** | نموذج أولي — مستقبلي | Prototype — future | Marketing page + static dashboard. Clear disclaimer: no backend. |
| **SimulationOS** | مفهوم تسويقي — مستقبلي | Marketing concept — future | Marketing page only. Clear disclaimer: not yet in development. |
| **Custom Systems / أ. عقلية ستوديو** | يُفعّل حسب نطاق المؤسسة | Activated per institutional scope | Presented as built on AQLIYA Core. Studio is future; current offering is custom project-based. |

---

## 4. Rewritten Website Copy by Page

---

### Page: Platform Homepage

**Route:** `/`
**Source file:** `src/app/(marketing)/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم`
- Description: `عقلية منصة ذكاء مؤسسي خاص ومحكوم: تقدم خطوط أنظمة مؤسسية ذكية مع حوكمة القرار، ربط الأدلة، المراجعة البشرية، سير العمل، الصلاحيات، وسجل التدقيق. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.`
- OpenGraph title: `AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم`
- OpenGraph description: `عقلية منصة ذكاء مؤسسي خاص ومحكوم تبني أنظمة مؤسسية فوق نواة ذكاء وحوكمة واحدة. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.`

#### Hero

- Badge: `منصة ذكاء مؤسسي خاص ومحكوم`
- H1: `بنية مؤسسية تجعل الذكاء مفيدًا، مفهومًا، ومحكومًا`
- Subtext: `عقلية ليست طبقة محادثة فوق المؤسسة. هي منصة تشغيل تربط البيانات، القواعد، الصلاحيات، الأدلة، والمراجعة داخل مسار واحد يمكن الوثوق به.`
- Supporting points:
  1. `ذكاء يعمل داخل نطاق المؤسسة لا خارجه`
  2. `مسارات تشغيل تربط الإدخال، المراجعة، والاعتماد في بنية واحدة`
  3. `مخرجات قابلة للفهم والمراجعة بدل إجابات سريعة بلا سياق`
- Primary CTA: `استكشف خطوط عقلية` → `/products`
- Secondary CTA: `شاهد AuditOS — أول تطبيق مُثبت` → `/auditos`
- Tertiary CTA: `ناقش حالة استخدام مؤسسية` → `/custom-product`

#### Impact Metrics

- 01 — `نواة مشتركة` — منطق حوكمة واحد يمكن البناء فوقه عبر أكثر من خط نظام
- 06 — `مسارات تشغيل` — تشمل التدقيق المالي، المحتوى المحلي، حوكمة القرارات، المبيعات، المحاكاة، والأنظمة المخصصة
- 100% — `مبدأ التتبع` — كل مخرج مربوط بالبيانات، المراجعة، وصاحب الصلاحية

#### Section: عقلية ليست...

- Eyebrow: `الوضوح الموضعي`
- Title: `عقلية ليست...`
- Description: `بعض الأشياء التي عقلية لا تفعلها — هذا يساعد في فهم ما هي في الواقع.`

Card 1:
- Title: `ليست صفحة دردشة`
- Body: `منصات المحادثة العامة تعطي إجابات سريعة. عقلية تبني مسارات مراجعة محكومة وموثقة تربط الإجابة بالبيانات والسياق والموافقات.`

Card 2:
- Title: `ليست SaaS فقط`
- Body: `عقلية ليست حصرية على السحابة. نقدم السحابة الآن، ونعمل على تطوير خيار الخوادم الخاصة للمؤسسات الحساسة.`

Card 3:
- Title: `ليست منتجًا واحدًا`
- Body: `عقلية ليست AuditOS فقط. هي نواة تشغيلية تسمح ببناء خطوط أنظمة متعددة فوقها حسب احتياج المؤسسة — من التدقيق إلى المحتوى المحلي إلى حوكمة القرارات.`

#### Section: Deployment Models

- Eyebrow: `نماذج التشغيل`
- Title: `السحابة متاحة الآن. الخوادم الخاصة قيد الإعداد.`
- Description: `نقدم خيارات تشغيل تناسب درجة حساسية المؤسسة. كل نموذج يحافظ على نفس منطق الحوكمة والتتبع والأدلة.`

Card 1 — Cloud:
- Title: `السحابة`
- Badge: `متاح الآن`
- Body: `نسخة سحابية متكاملة مع كل الخصائص والتحديثات التلقائية والنسخ الاحتياطي. مناسبة للمؤسسات التي تفضل عدم إدارة البنية التحتية.`

Card 2 — Private:
- Title: `خوادم خاصة`
- Badge: `قيد الإعداد`
- Body: `تشغيل عقلية داخل البنية التحتية للمؤسسة مع قاعدة بيانات محلية وتحكم كامل. قيد التطوير، وسيتاح للمؤسسات الحساسة عند اكتماله.`

Card 3 — Air-Gapped:
- Title: `بيئة معزولة`
- Badge: `استراتيجي — مستقبلي`
- Body: `نموذج مستقبلي للمؤسسات ذات المتطلبات الأمنية العالية. يعتمد على اكتمال نموذج الخوادم الخاصة أولاً.`

#### Section: The Operational Gap

- Eyebrow: `الفجوة التشغيلية`
- Title: `المشكلة ليست في غياب الذكاء فقط، بل في غياب النظام الذي يحكمه`
- Description: `حين تعمل البيانات في مكان، والموافقات في مكان، والمراجعة في مكان آخر، تصبح المخرجات سريعة لكنها ضعيفة الثقة. عقلية تعيد جمع المسار بالكامل داخل منطق تشغيلي واحد.`

Before:
- `مخرجات ذكاء غير مرتبطة بسياق العمل`
- `اعتماد عبر البريد والذاكرة`
- `موافقات غير موثقة`
- `أدلة منفصلة عن القرار`
- `صلاحيات لا تحكم المسار بالكامل`

After:
- `سير عمل محكوم`
- `مخرجات قابلة للتتبع`
- `قرارات موثقة`
- `أدلة مربوطة بكل خطوة`
- `وضوح تشغيلي قابل للمراجعة`

#### Section: AQLIYA Intelligence Core

- Eyebrow: `AQLIYA Intelligence Core`
- Title: `نواة تشغيل واحدة بدل مشاريع متفرقة وأدوات معزولة`
- Description: `النواة المشتركة في عقلية هي طبقة تشغيل مؤسسي تجعل كل خط نظام جديد يبنى فوق نفس منطق الحوكمة، لا من الصفر.`

Core items: `تنسيق الذكاء` / `الحوكمة` / `سير العمل` / `ربط الأدلة` / `الصلاحيات` / `سجل التدقيق` / `التقارير`

Impact label: `الأثر التشغيلي`
Title: `بدل شراء ذكاء منفصل، تبني المؤسسة قدرة تشغيلية متكررة`
Body: `كل نطاق جديد لا يبدأ بسؤال: أي أداة نضيف؟ بل: كيف نُدخل هذا النطاق داخل نفس قواعد البيانات والمراجعة والصلاحيات وسلسلة الاعتماد؟`

#### Section: Workflow Chain

- Eyebrow: `سلسلة التشغيل`
- Title: `من البيانات إلى القرار عبر مسار مفهوم ومراجع`
- Description: `في عقلية، القيمة لا تأتي من الإجابة فقط، بل من الطريق الذي أنتجها: من أين جاءت البيانات، من راجعها، وما الذي اعتمدها.`

Flow: `البيانات` → `سير العمل` → `الأدلة` → `المراجعة` → `الاعتماد` → `المخرجات`

#### Section: Custom Systems Activation

- Eyebrow: `التفعيل المؤسسي`
- Title: `وحين لا تكفي الخطوط الجاهزة، يمكن بناء مسارك الخاص فوق النواة نفسها`
- Description: `بعض المؤسسات تحتاج ما هو أبعد من منتج جاهز. لذلك تتيح عقلية بناء نظام أو مسار مؤسسي مخصص مع الحفاظ على نفس منطق الحوكمة والتتبع والمراجعة.`
- CTA: `صمّم نظامك المؤسسي` → `/custom-product`

#### Section: Product Family

- Eyebrow: `عائلة المنتجات`
- Title: `كل خط نظام يعالج فجوة تشغيلية محددة داخل المؤسسة`
- Description: `خطوط الأنظمة في عقلية تبدأ من مشكلة مؤسسية واضحة، ثم تحولها إلى تدفق عمل محكوم ومخرج قابل للمراجعة. بعضها قائم كمنتج مثبت، وبعضها في مراحل التخطيط أو التطوير — لكن جميعها مبنية على نواة واحدة.`

**AuditOS** (active — first proof product)
- Title: `AuditOS — نظام التدقيق والذكاء المالي`
- Problem: `بيانات مالية متفرقة وتصنيفات يدوية وأدلة غير مرتبطة.`
- System: `يبني مسار مراجعة محكومًا يربط البيانات المالية بالتصنيف والأدلة والملاحظات والمراجعة والاعتماد.`
- Output: `مخرجات مراجعة منظمة وقابلة للتتبع من المصدر إلى القرار البشري النهائي.`
- Flow: `بيانات` → `تصنيف` → `مخرجات` → `أدلة` → `مراجعة`
- Badge: `أول تطبيق مُثبت — جاهز للتجربة`
- CTA: `استكشف AuditOS` → `/products/audit`

**LocalContentOS** (strategic — second product)
- Title: `LocalContentOS — قياس المحتوى المحلي وحوكمة الموردين`
- Problem: `بيانات موردين وإنفاق والتزام موزعة بين فرق ومصادر مختلفة.`
- System: `يوحّد قياس المحتوى المحلي عبر ربط الموردين بالإنفاق والتصنيف والالتزام داخل مسار حوكمة موحد.`
- Output: `رؤية مؤسسية لمؤشرات المحتوى المحلي وجاهزية القرارات الشرائية.`
- Flow: `موردون` → `إنفاق` → `تصنيف` → `فجوات` → `مؤشرات`
- Badge: `استراتيجي — المنتج الثاني — قيد التخطيط`
- CTA: `استكشف LocalContentOS` → `/products/local-content`

**DecisionOS** (adjacent system — active)
- Title: `DecisionOS — حوكمة القرارات التنفيذية`
- Problem: `قرارات مهمة تبنى على نقاشات متفرقة وملفات متعددة ومعايير غير موحدة.`
- System: `يحول القرار التنفيذي إلى مسار محكوم: مشكلة، بدائل، معايير، مخاطر، أدلة، توصية، واعتماد.`
- Output: `مذكرة قرار موثقة يمكن مراجعتها وفهم أسبابها قبل الاعتماد.`
- Flow: `مشكلة` → `بدائل` → `معايير` → `مخاطر` → `توصية`
- Badge: `نظام مجاور — متاح`
- CTA: `استكشف DecisionOS` → `/products/decision`

**SalesOS** (prototype — future)
- Title: `SalesOS — الذاكرة التجارية وذكاء المبيعات`
- Problem: `فرص غير مؤهلة وأولويات غير واضحة ومتابعة عشوائية.`
- System: `نموذج أولي لنظام ذاكرة تجارية ينظم التأهيل والترتيب والمتابعة والتعلم المؤسسي.`
- Output: `مسار مبيعات يربط العملاء المحتملين بالأولوية والمتابعة والتعلم المؤسسي.`
- Flow: `تأهيل` → `ترتيب` → `تواصل` → `متابعة` → `تعلم`
- Badge: `نموذج أولي — مستقبلي`
- CTA: `اطّلع على المفهوم` → `/products/sales`

**SimulationOS** (future — marketing concept)
- Title: `SimulationOS — محاكاة السيناريوهات والمقارنات`
- Problem: `قرارات تُنفذ قبل اختبار أثرها على التكلفة والمخاطر والأداء.`
- System: `مفهوم مستقبلي لمحاكاة القرارات عبر ربط المدخلات بالافتراضات والسيناريوهات والمقارنات.`
- Output: `رؤية مقارنة تساعد الإدارة على فهم البدائل قبل التنفيذ.`
- Flow: `مدخلات` → `افتراضات` → `سيناريوهات` → `أثر` → `مقارنة`
- Badge: `مفهوم — مستقبلي`
- CTA: `اطّلع على المفهوم` → `/products/simulation`

#### Section: Proof Product — AuditOS

- Badges: `أول تطبيق مُثبت` + `جاهز للتجربة`
- H2: `AuditOS — أول منتج مُثبت على AQLIYA Intelligence Core`
- Body: `AuditOS هو أول تطبيق يُظهر كيف تتحول نواة عقلية إلى خط نظام مالي محكوم. يعالج مسار المراجعة المالية بالكامل: من ميزان المراجعة الخام إلى القوائم المالية والإيضاحات والأدلة والملاحظات والمراجعة البشرية والاعتماد النهائي.`

Sub-cards:
1. Label: `المسار` — Body: `ميزان المراجعة ← ربط الحسابات ← القوائم المالية ← الإيضاحات ← الأدلة ← المراجعة ← الاعتماد ← التصدير`
2. Label: `الحوكمة` — Body: `كل مخرج مربوط بالدليل، كل خطوة تحتاج مراجعة بشرية، كل اعتماد مسجل في سجل التدقيق.`
3. Label: `المخرجات` — Body: `قوائم مالية، إيضاحات، توصيات إعادة تصنيف، تقارير أدلة، مسار مراجعة كامل.`

CTAs:
| Label | Target |
|---|---|
| شاهد AuditOS — عرض تفاعلي | `/auditos` |
| استكشف AuditOS | `/products/audit` |

#### Section: Strategic Product — LocalContentOS

- Badges: `المنتج الاستراتيجي الثاني` + `قيد التخطيط`
- H2: `LocalContentOS — المنتج الاستراتيجي الثاني لسوق المحتوى المحلي`
- Body: `LocalContentOS يستهدف قياس المحتوى المحلي وإدارة الموردين والإنفاق والالتزام داخل مسار حوكمة موحد. صُمم للسوق السعودي وفق متطلبات هيئة المحتوى المحلي. سيُبنى على AQLIYA Intelligence Core بنفس منطق الحوكمة والأدلة والمراجعة البشرية.`

Sub-cards:
1. Label: `النطاق` — Body: `تصنيف الموردين، تحليل الإنفاق، قياس الالتزام، مؤشرات المحتوى المحلي.`
2. Label: `السوق` — Body: `موجه للمؤسسات السعودية التي تحتاج قياس المحتوى المحلي والتزام الموردين.`
3. Label: `الحالة` — Body: `قيد التخطيط الاستراتيجي — يُعرَض حاليًا كصفحة تعريفية لحين بدء التطوير.`

CTAs:
| Label | Target |
|---|---|
| استكشف LocalContentOS | `/products/local-content` |
| ناقش التفعيل المستقبلي | `/custom-product` |

#### Section: Trust & Proof Chain

- Eyebrow: `الثقة والإثبات`
- H2: `الثقة في عقلية لا تبنى على الوعود، بل على القدرة على الرجوع لكل خطوة`
- Principle: `الذكاء يساعد. الإنسان يقرر. الدليل يحكم.`
- Body: `حين يسأل المدير أو المدقق أو صاحب الصلاحية: كيف وصلنا إلى هذا المخرج؟ يجب أن تكون الإجابة موجودة داخل النظام نفسه، لا في الذاكرة ولا في سلاسل البريد.`

#### Section: Final CTA

- Eyebrow: `ابدأ من النطاق`
- H2: `إذا كانت لديك فجوة تشغيلية معقدة، يمكن تحويلها إلى نظام محكوم قابل للتفعيل`
- Body: `ابدأ من خط النظام الأقرب إلى نطاقك، أو اطلب جلسة تصميم إذا كنت تحتاج مسارًا مؤسسيًا خاصًا فوق نواة عقلية.`

CTAs:
| Label | Target |
|---|---|
| صمّم نظامك المؤسسي | `/custom-product` |
| ناقش تفعيل النظام | `/contact` |

---

### Page: Products Listing

**Route:** `/products`
**Source file:** `src/app/(marketing)/products/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `خطوط أنظمة عقلية | AQLIYA`
- Description: `خطوط أنظمة متخصصة مبنية على AQLIYA Intelligence Core، تربط البيانات وسير العمل والأدلة والمخرجات داخل مسارات مؤسسية قابلة للمراجعة والاعتماد.`

#### Hero

- Badge: `عائلة الأنظمة`
- H1: `خطوط أنظمة تعالج مسارات مؤسسية فعلية`
- Body: `خطوط الأنظمة في عقلية ليست تجميعًا لخدمات عامة، بل مسارات تشغيل متخصصة مبنية على نواة واحدة. كل خط نظام يبدأ من مشكلة حقيقية داخل المؤسسة، ثم يحولها إلى مسار محكوم يمكن تشغيله ومراجعته والتوسع فيه. بعضها قائم كمنتج مثبت، وبعضها في مرحلة التخطيط أو التطوير، وجميعها تنتمي إلى نفس منطق البناء المؤسسي فوق AQLIYA Intelligence Core.`

#### Why a Product Family

- Label: `لماذا عائلة أنظمة؟`
- H2: `نواة واحدة، لكن تطبيقات متعددة بحسب مجال العمل`
- Body: `بدل بناء نظام مستقل لكل فريق أو نطاق، تجمع عقلية طبقة الذكاء والحوكمة وسير العمل وربط الأدلة والصلاحيات وسجل التدقيق والتقارير في بنية واحدة. هذا يجعل كل خط نظام امتدادًا لقدرة مؤسسية مشتركة، لا مشروعًا منفصلًا جديدًا.`

Principles:
1. `كل خط نظام يبدأ من فجوة تشغيلية محددة لا من وصف عام للذكاء الاصطناعي.`
2. `كل منتج يبقى مربوطًا بنفس منطق الحوكمة والتتبع والمراجعة داخل النواة المشتركة.`
3. `كل مخرج نهائي يجب أن يكون قابلًا للفهم، لا مجرد نتيجة آلية يصعب تفسيرها.`

Core items: `تنسيق الذكاء` / `الحوكمة` / `سير العمل` / `ربط الأدلة` / `الصلاحيات` / `سجل التدقيق` / `التقارير`

#### Solution Blocks

**AuditOS**
- Title: `AuditOS — أول تطبيق مُثبت: نظام التدقيق والذكاء المالي`
- Badge: `أول تطبيق مُثبت — جاهز للتجربة`
- Gap: `بيانات مالية متفرقة، تصنيفات يدوية، أدلة غير مرتبطة، ومراجعة يصعب تتبعها.`
- System: `أول تطبيق مُثبت على AQLIYA Intelligence Core، يربط البيانات المالية بالتصنيف والقوائم والأدلة والملاحظات ومسار المراجعة والاعتماد.`
- Output: `مخرجات مراجعة منظمة وقابلة للتتبع من المصدر إلى القرار البشري النهائي.`
- Flow: `بيانات` → `تصنيف` → `مخرجات` → `أدلة` → `مراجعة`

**DecisionOS**
- Title: `DecisionOS — نظام مجاور: حوكمة القرارات التنفيذية`
- Badge: `نظام مجاور — متاح`
- Gap: `قرارات مهمة تبنى على نقاشات متفرقة وملفات متعددة ومعايير غير موحدة.`
- System: `نظام مبني على AQLIYA Intelligence Core يحول القرار إلى مسار محكوم: مشكلة، بدائل، معايير، مخاطر، أدلة، توصية، واعتماد.`
- Output: `مذكرة قرار موثقة يمكن مراجعتها وفهم أسبابها قبل الاعتماد.`
- Flow: `مشكلة` → `بدائل` → `معايير` → `مخاطر` → `توصية`

**LocalContentOS**
- Title: `LocalContentOS — المنتج الاستراتيجي الثاني: المحتوى المحلي وحوكمة الموردين`
- Badge: `استراتيجي — المنتج الثاني — قيد التخطيط`
- Gap: `بيانات موردين وإنفاق والتزام موزعة بين فرق ومصادر مختلفة.`
- System: `المنتج الاستراتيجي الثاني ضمن عائلة أنظمة عقلية، يبنى على AQLIYA Intelligence Core لربط الموردين بالإنفاق والتصنيف والالتزام والفجوات.`
- Output: `رؤية واضحة لمؤشرات المحتوى المحلي وأثر القرارات الشرائية.`
- Flow: `موردون` → `إنفاق` → `تصنيف` → `فجوات` → `مؤشرات`

**SimulationOS**
- Title: `SimulationOS — مفهوم مستقبلي: محاكاة السيناريوهات`
- Badge: `مفهوم — مستقبلي`
- Gap: `قرارات تنفذ قبل اختبار أثرها على التكلفة والمخاطر والأداء.`
- System: `مفهوم مستقبلي يهدف إلى ربط المدخلات بالافتراضات والسيناريوهات والمقارنة ودعم القرار قبل التنفيذ.`
- Output: `تقرير مقارنة يساعد الإدارة على فهم الخيارات قبل التنفيذ.`
- Flow: `مدخلات` → `افتراضات` → `سيناريوهات` → `أثر` → `مقارنة`

**SalesOS**
- Title: `SalesOS — نموذج أولي: الذاكرة التجارية والمبيعات`
- Badge: `نموذج أولي — مستقبلي`
- Gap: `فرص غير مؤهلة وأولويات غير واضحة ومتابعة عشوائية.`
- System: `نموذج أولي لنظام ذاكرة تجارية ينظم التأهيل والترتيب والمتابعة والتعلم المؤسسي.`
- Output: `مسار مبيعات يربط العملاء المحتملين بالأولوية والرسالة والمتابعة.`
- Flow: `تأهيل` → `ترتيب` → `تواصل` → `متابعة` → `تعلم`

**Custom Systems**
- Title: `أنظمة مؤسسية مخصصة — تُبنى حسب نطاق المؤسسة`
- Badge: `يُفعّل حسب نطاق المؤسسة`
- Gap: `إجراءات متكررة، ملفات متفرقة، صلاحيات غير واضحة، ومخرجات لا تدار من مكان واحد.`
- System: `نظام مؤسسي يفعّل فوق AQLIYA Intelligence Core لربط سير العمل والصلاحيات والبيانات والمخرجات داخل منطق حوكمة واحد.`
- Output: `نظام تشغيلي خاص بالمؤسسة، قابل للمراجعة والتتبع والتطوير ضمن نطاقها التشغيلي.`
- Flow: `فهم العمل` → `تصميم النظام` → `ربط البيانات` → `تشغيل المخرجات`

#### AuditOS Note Bar

`AuditOS هو أول تطبيق مُثبت على AQLIYA Intelligence Core، ويمكن تجربته كعرض تفاعلي. LocalContentOS هو المنتج الاستراتيجي الثاني، وبقية الخطوط تبنى فوق النواة نفسها بحسب نطاق المؤسسة.`

#### Final CTA

- Eyebrow: `اختر الخط المناسب`
- H2: `حدد خط النظام الأقرب إلى نطاقك أو ابدأ من جلسة تصميم مؤسسية`
- Body: `إذا كانت لديك فجوة تشغيلية واضحة، نساعدك على ربطها بخط النظام المناسب. وإذا كان نطاقك مختلفًا، يمكن تصميم مسار خاص فوق نواة عقلية.`

CTAs:
| Label | Target |
|---|---|
| صمّم نظامك المؤسسي | `/custom-product` |
| ناقش تفعيل النظام | `/contact` |

#### Notes for implementation
- DecisionOS badge changed from `نظام قائم` to `نظام مجاور — متاح` to align with v1.1 taxonomy
- All English output labels removed from product titles (replaced with Arabic)
- SalesOS status clarified as prototype only
- SimulationOS status clarified as marketing concept
- No unsupported claims made

---

### Page: AuditOS Product

**Route:** `/products/audit`
**Source file:** `src/app/(marketing)/products/audit/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `AuditOS — أول منتج مُثبت على AQLIYA | نظام التدقيق والذكاء المالي`
- Description: `AuditOS هو أول منتج مُثبت على AQLIYA Intelligence Core. يحول ميزان المراجعة إلى مخرجات مالية محكومة مع ربط الأدلة والمراجعة البشرية وسير العمل وسجل الاعتماد.`

#### Hero

- Breadcrumb: `← خطوط عقلية`
- Badge: `AuditOS — أول تطبيق مُثبت على نواة عقلية`
- H1: `من ميزان المراجعة إلى مخرجات مالية قابلة للمراجعة والاعتماد`
- Body: `AuditOS هو أول تطبيق مُثبت على AQLIYA Intelligence Core في مجال التدقيق والذكاء المالي. يبني مسارًا منظمًا يبدأ من ميزان المراجعة الخام وينتهي إلى القوائم والإيضاحات والأدلة والمراجعة والاعتماد، دون أن يستبدل الحكم المهني.`

CTAs:
| Label | Target |
|---|---|
| ناقش تفعيل النظام | `/custom-product` |
| شاهد AuditOS — عرض تفاعلي | `/auditos` |

Tags: `مبني على نواة عقلية` · `سير عمل محكوم` · `مخرجات مدعومة بالأدلة` · `مراجعة بشرية`

#### Insight Callout

`AuditOS يوضح كيف تتحول نواة عقلية إلى خط نظام مالي محكوم يربط البيانات والأدلة والمراجعة والاعتماد داخل مسار واحد قابل للتتبع.`

#### Problem Section

- Eyebrow: `المشكلة`
- Title: `التقارير المالية ما زالت متفرقة بين ملفات ومراجعات منفصلة`
- Description: `كثير من فرق المراجعة والمالية تنتقل من ميزان المراجعة إلى القوائم والإيضاحات والأدلة والمراجعة والاعتماد عبر ملفات متفرقة وتعليقات مشتتة. AuditOS يعالج ذلك كخط نظام مبني على AQLIYA Intelligence Core، لا كأداة نصوص أو أتمتة معزولة.`

Before:
1. `ملفات Excel متفرقة وتصنيف يدوي للحسابات`
2. `أدلة وملاحظات ونتائج غير مرتبطة بالحسابات المصدر`
3. `سياق المراجعة مفقود بين البريد الإلكتروني والتعليقات`
4. `الاعتماد يعتمد على المتابعة الشخصية والذاكرة`
5. `أدوات الذكاء الاصطناعي تولد نصوصًا دون حوكمة لمسار العمل`

After:
1. `مسار عمل محكوم من ميزان المراجعة إلى الاعتماد`
2. `كل مخرج مرتبط بحساب مصدره`
3. `الأدلة والملاحظات مربوطة بكل بند في القوائم`
4. `جاهزية المراجعة واضحة في كل خطوة`
5. `الاعتماد البشري في المركز، والذكاء الاصطناعي طبقة مساعدة`

#### Workflow Section

- Eyebrow: `مسار العمل`
- Title: `مسار محكوم من البيانات الخام إلى مخرجات جاهزة للاعتماد`

Steps: `ميزان المراجعة` → `ربط الحسابات` → `مسودة القوائم المالية` → `مسودة الإيضاحات` → `متطلبات الأدلة` → `المراجعة` → `الاعتماد`

Step details (preserved as-is — strong copy):
| # | Label | Description |
|---|---|---|
| 01 | ميزان المراجعة | إدخال البيانات المالية الخام |
| 02 | ربط الحسابات | تصنيف الحسابات في نموذج مالي منظم |
| 03 | مسودة القوائم | إنتاج مسودة القوائم للمراجعة |
| 04 | مسودة الإيضاحات | إنتاج إيضاحات الإفصاح حسب الحسابات |
| 05 | متطلبات الأدلة | تحديد الأدلة الداعمة المطلوبة |
| 06 | المراجعة | مراجعة مهنية مع ملاحظات ونتائج |
| 07 | الاعتماد | اعتماد نهائي ببوابة حوكمة |

#### Governance Section

- Eyebrow: `الحوكمة`
- Title: `الذكاء الاصطناعي يساعد. البشر يقررون. الأدلة تحكم.`

Pillars:
1. Title: `الذكاء الاصطناعي يساعد` — مسودات، تصنيفات، اقتراحات، مؤشرات أدلة، تنبيهات النواقص
2. Title: `البشر يقررون` — مراجعة، تعديل، اعتماد، رفض، تعديل التصنيفات
3. Title: `الأدلة تحكم` — كل مخرج متتبع، كل قرار مسجل، كل اعتماد مرتبط ببوابة

Features:
1. `سجل تتبع كامل من ميزان المراجعة إلى الاعتماد`
2. `مراجعة بشرية مطلوبة عند كل بوابة حوكمة`
3. `تنبيه النواقص قبل بدء المراجعة`
4. `الحكم المهني لا يتم تجاوزه أبدًا`
5. `جاهزية الاعتماد واضحة في كل خطوة`

#### Comparison Table: AuditOS vs Excel vs ChatGPT

(Entire table preserved as-is — excellent copy)

- Eyebrow: `المقارنة`
- Title: `AuditOS يحكم ما لا تستطيعه Excel وChatGPT`
- Description: `Excel يحسب. ChatGPT يكتب. AuditOS يحكم مسار العمل. كأول تطبيق على AQLIYA Intelligence Core، يوفر AuditOS طبقة تشغيل محكومة لا يقدمها أي منهما، مصممة خصيصًا لأعمال المراجعة والتقارير المالية.`

Columns: البعد | Excel | ChatGPT | AuditOS

| Dimension | Excel | ChatGPT | AuditOS |
|---|---|---|---|
| الدور | يحسب | يكتب نصوصًا | يحكم مسار الذكاء المالي |
| ميزان المراجعة | خلايا خام | مدخلات نصية | إدخال منظم مع تحقق |
| ربط الحسابات | معادلات يدوية | اقتراحات عامة | تصنيف محكوم مع إمكانية التعديل |
| القوائم والإيضاحات | تجميع يدوي | توليد غير منظم | صياغة ضمن قوالب محكومة |
| متطلبات الأدلة | لا يوجد | لا يوجد | منظمة ومربوطة بالحسابات |
| مسار المراجعة | تعليقات، بريد | لا يوجد | طابور مراجعة مدمج مع ملاحظات |
| مسار الاعتماد | لا يوجد | لا يوجد | تتبع كامل من الإدخال إلى الاعتماد |
| الحكم البشري | متروك للمستخدم | مخرج غير شفاف | مطلوب عند كل بوابة حوكمة |

Insight callout: `AuditOS لا ينافس Excel كآلة حاسبة ولا ChatGPT ككاتب نصوص. إنه يوفر طبقة مسار عمل محكوم لا يقدمها أي منهما — مصممة خصيصًا لأعمال المراجعة والتقارير المالية.`

#### Pilot CTA Section

- Eyebrow: `ابدأ الآن`
- Title: `ابدأ بميزان مراجعة واحد. شاهد الفرق.`
- Description: `ارفع ميزان مراجعة حقيقي واحد. في تجربتك، سينتج AuditOS كل هذه المخرجات ضمن مسار عمل محكوم:`

Pilot outputs:
1. `ربط الحسابات مع إمكانية التعديل المهني`
2. `مسودة القوائم المالية`
3. `مسودة الإيضاحات والإفصاحات`
4. `قائمة النواقص`
5. `متطلبات الأدلة حسب منطقة الحسابات`
6. `توصيات إعادة التصنيف`
7. `ملاحظات المراجع`
8. `حالة الجاهزية للاعتماد`

#### Final CTA

- Title: `هل تريد تجربة AuditOS على بيانات مؤسستك؟`
- Description: `ابدأ من ميزان مراجعة واحد، وشاهد كيف يفعّل AuditOS مسارًا ماليًا محكومًا فوق AQLIYA Intelligence Core.`

CTAs:
| Label | Target |
|---|---|
| ناقش تفعيل النظام | `/custom-product` |
| شاهد AuditOS — عرض تفاعلي | `/auditos` |

#### Notes for implementation
- Mostly preserved as-is (strong copy)
- Minor Arabic polish in hero body
- Badge label adjusted for consistency
- No capability claims changed — all claims are supported by existing code

---

### Page: LocalContentOS Product

**Route:** `/products/local-content`
**Source file:** `src/app/(marketing)/products/local-content/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `LocalContentOS — المنتج الاستراتيجي الثاني | AQLIYA`
- Description: `LocalContentOS المنتج الاستراتيجي الثاني ضمن عقلية لقياس المحتوى المحلي وإدارة الموردين والإنفاق والالتزام. مبني على AQLIYA Intelligence Core ويستهدف السوق السعودي. قيد التخطيط الاستراتيجي حاليًا.`

#### Hero

- Breadcrumb: `← العودة إلى خطوط عقلية`
- Badge: `LocalContentOS — قياس المحتوى المحلي وحوكمة الموردين`
- Badge 2: `استراتيجي — المنتج الثاني`
- Badge 3: `قيد التخطيط — صفحة تعريفية`
- H1: `قياس المحتوى المحلي يجب أن يكون مسارًا تشغيليًا لا تقريرًا متأخرًا`
- Body: `LocalContentOS هو المنتج الاستراتيجي الثاني ضمن عقلية. يستهدف قياس المحتوى المحلي وإدارة الموردين والإنفاق والالتزام داخل مسار واحد قابل للتتبع. صُمم للسوق السعودي وفق متطلبات هيئة المحتوى المحلي. سيُبنى على AQLIYA Intelligence Core عند بدء التطوير.`
- Disclaimer: `LocalContentOS حاليًا في مرحلة التخطيط الاستراتيجي. لم يبدأ التطوير التشغيلي بعد. يُعرَض حاليًا كصفحة تعريفية.`

CTAs:
| Label | Target |
|---|---|
| ناقش التفعيل المستقبلي | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

#### Before/After Section

- Title: `لماذا تحتاج المؤسسات نظام محتوى محلي واضح؟`
- Description: `LocalContentOS يحول بيانات الموردين والإنفاق والالتزام إلى خط نظام مؤسسي محكوم ومبني على AQLIYA Intelligence Core.`

Before: `بيانات موردين غير مصنفة` / `تحليل إنفاق يدوي` / `صعوبة قياس الالتزام` / `مؤشرات غير واضحة` / `قرارات شراء دون محاكاة`
After: `تصنيف واضح للموردين` / `تحليل إنفاق آلي` / `عرض فجوات الالتزام` / `مؤشرات دقيقة للمحتوى المحلي` / `محاكاة أثر القرارات الشرائية`

#### Governance Section

- Eyebrow: `الحوكمة والثقة`
- Title: `كيف يعمل مبدأ الثقة في نظام المحتوى المحلي؟`
- Description: `الذكاء يساعد بتصنيف الموردين وتحليل الإنفاق. الإنسان يقرر بشأن الالتزام والسياسات. الدليل يحكم من خلال توثيق كامل للموردين والمحاكاة.`

Pillars:
1. `الذكاء يساعد` — النظام يصنف الموردين، يحلل الإنفاق، يحسب الفجوات والمؤشرات.
2. `الإنسان يقرر` — المسؤولون يحددون معايير الالتزام، يختارون الموردين، يوجهون المحاكاة.
3. `الدليل يحكم` — كل قرار مرتبط بتقرير كامل، فجوات موثقة، وسجل التزام واضح.

#### Workflow Section

- Flow: `الموردين` → `الإنفاق` → `التصنيف` → `فجوة الالتزام` → `المحاكاة` → `التقارير`

#### Outputs Section

`تصنيف الموردين` / `تحليل الإنفاق` / `مؤشرات المحتوى المحلي` / `عرض فجوات الامتثال` / `محاكاة تأثير المشتريات` / `تقرير المحتوى المحلي` / `متتبع تحسين الموردين`

#### Customization Section

`يُفعّل LocalContentOS حسب نطاق المؤسسة عبر معايير التصنيف، مؤشرات المحتوى المحلي، قوالب التقارير، ومتطلبات الامتثال. يبقى منطق الحوكمة والتتبع ثابتًا فوق AQLIYA Intelligence Core.`

#### Use Scenario

- Title: `جهة حكومية — إدارة المشتريات`
- Before: `تحليل المحتوى المحلي يتم يدويًا، بيانات الموردين غير محدثة، وصعوبة في قياس أثر قرارات الشراء على الالتزام.`
- After: `نظام واضح يصنف الموردين، يحلل الإنفاق، يقيس الالتزام، ويحاكي أثر القرارات الشرائية على مؤشرات المحتوى المحلي.`

#### Final CTA

- Title: `هل تحتاج نظام محتوى محلي لمؤسستك؟`
- Description: `LocalContentOS في مرحلة التخطيط الاستراتيجي. إذا كنت مهتمًا بالتفعيل المستقبلي، ناقش احتياجك مع فريق عقلية.`

CTAs:
| Label | Target |
|---|---|
| ناقش التفعيل المستقبلي | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

#### Notes for implementation
- Added "سيُبنى" future tense to system description (not "يُبنى" present)
- Disclaimer strengthened to include "يُعرَض حاليًا كصفحة تعريفية"
- No unsupported claims about workspace or backend

---

### Page: DecisionOS Product

**Route:** `/products/decision`
**Source file:** `src/app/(marketing)/products/decision/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `DecisionOS — حوكمة القرارات التنفيذية | AQLIYA`
- Description: `DecisionOS نظام مجاور لحوكمة القرارات التنفيذية ضمن AQLIYA Intelligence Core. يربط البدائل والمعايير والمخاطر والأدلة ضمن مسار قابل للمراجعة والاعتماد.`

#### Hero

- Breadcrumb: `← العودة إلى خطوط عقلية`
- Badge: `DecisionOS — حوكمة القرارات التنفيذية`
- Badge 2: `نظام مجاور — متاح`
- H1: `حوكمة القرار بدل تركه لمذكرات متفرقة ونقاشات غير قابلة للتتبع`
- Body: `DecisionOS يحول القرارات المعقدة من نقاشات وملفات متفرقة إلى مسار مؤسسي واضح: مشكلة، بدائل، معايير، مخاطر، أدلة، توصية، واعتماد — داخل منطق واحد مبني على AQLIYA Intelligence Core.`

CTAs:
| Label | Target |
|---|---|
| ناقش تفعيل النظام | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

#### Before/After Section

Before: `قرارات تعتمد على النقاشات فقط` / `ملفات ومبررات غير موثقة` / `تقييم مخاطر غير منهجي` / `صعوبة تتبع سبب القرار` / `اعتمادات غير واضحة`
After: `مسار قرار موثق ومنهجي` / `معايير تقييم واضحة وقابلة للقياس` / `ملخص مخاطر مرتبط بالبدائل` / `توصية مدعومة بالأدلة` / `سجل اعتماد كامل`

#### Governance Section

Pillars:
1. `الذكاء يساعد` — النظام يصنف البدائل، يقيّم المخاطر، يجمع الأدلة، لكنه لا يقرر.
2. `الإنسان يقرر` — المتخذ يختار بناءً على معايير واضحة وأدلة موثقة وتقييم مخاطر كامل.
3. `الدليل يحكم` — كل قرار مرتبط بمسار تام، معايير معروضة، وسجل اعتماد كامل.

#### Workflow

`المشكلة` → `البدائل` → `المعايير` → `المخاطر` → `الأدلة` → `التوصية` → `الاعتماد`

#### Outputs

`موجز القرار` / `مذكرة القرار` / `مصفوفة المقارنة` / `ملخص المخاطر` / `تقرير التوصية` / `سجل الاعتماد`

#### Final CTA

- Title: `هل تحتاج نظام قرار واضح لمؤسستك؟`

CTAs:
| Label | Target |
|---|---|
| ناقش تفعيل النظام | `/custom-product` |
| استكشف خطوط عقلية | `/contact` |

#### Notes for implementation
- Status badge changed from `متاح للتفعيل` to `نظام مجاور — متاح` to align with v1.1 taxonomy (DecisionOS is an adjacent system, not a primary product line)
- Metadata description updated to "نظام مجاور"
- Output labels translated to Arabic
- Description body adjusted to avoid implying DecisionOS = AuditOS-level product

---

### Page: SalesOS Product

**Route:** `/products/sales`
**Source file:** `src/app/(marketing)/products/sales/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `SalesOS — نموذج أولي: الذاكرة التجارية وذكاء المبيعات | AQLIYA`
- Description: `SalesOS نموذج أولي ضمن عقلية لنظام الذاكرة التجارية والمبيعات. ينظم التأهيل والترتيب والمتابعة والتعلم داخل مسار تجاري محكوم. حاليًا في مرحلة النموذج الأولي.`

#### Hero

- Badge: `SalesOS — الذاكرة التجارية وذكاء المبيعات`
- Badge 2: `نموذج أولي — مستقبلي`
- H1: `المبيعات ليست مجرد صفقات، بل ذاكرة مؤسسية يجب أن تتعلم وتتحسن`
- Body: `SalesOS هو نموذج أولي ضمن عقلية لنظام الذاكرة التجارية وذكاء المبيعات. يستكشف كيفية تنظيم رحلة المبيعات من تأهيل العملاء إلى ترتيب الأولويات والمتابعة والتعلم المؤسسي — داخل مسار محكوم مبني على AQLIYA Intelligence Core. حاليًا، يوجد واجهة لوحة معلومات ثابتة، بدون خلفية تشغيلية مكتملة.`
- Disclaimer: `SalesOS حاليًا في مرحلة النموذج الأولي. لا توجد خلفية تشغيلية أو قاعدة بيانات مكتملة بعد.`

CTAs:
| Label | Target |
|---|---|
| ناقش حالة الاستخدام | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

#### Governance Section

Pillars:
1. `الذكاء يساعد` — النظام يقترح تصنيف العملاء ويقيّم التأهيل والأولويات.
2. `الإنسان يقرر` — الفريق يختار الرسالة والنهج بناءً على السياق والحكم الشخصي.
3. `الدليل يحكم` — كل تواصل وتفاعل مسجل، والنتائج مرتبطة بالحملة والفريق والعميل.

#### Workflow

`تأهيل` → `فلترة` → `تواصل` → `متابعة` → `تعلم`

#### Outputs

`ملف العميل المثالي` / `درجة التأهيل` / `قائمة الفرص` / `منطق الحملات` / `سجل المتابعة` / `تقرير التعلم المؤسسي`

#### Final CTA

- Title: `هل تحتاج نظام مبيعات واضح لفريقك؟`
- Description: `SalesOS في مرحلة النموذج الأولي. إذا كنت مهتمًا بهذا المفهوم، ناقش حالة الاستخدام مع فريق عقلية.`

CTAs:
| Label | Target |
|---|---|
| ناقش حالة الاستخدام | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

#### Notes for implementation
- Body softened from "ينظم رحلة المبيعات" to "يستكشف كيفية تنظيم" — more honest about prototype stage
- All English output labels translated to Arabic
- ICP → ملف العميل المثالي, Lead Score → درجة التأهيل, etc.
- First paragraph clearly states "يستكشف" (explores) not "ينظم" (organizes)

---

### Page: SimulationOS Product

**Route:** `/products/simulation`
**Source file:** `src/app/(marketing)/products/simulation/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `SimulationOS — مفهوم مستقبلي: محاكاة السيناريوهات | AQLIYA`
- Description: `SimulationOS مفهوم مستقبلي ضمن عقلية لمحاكاة السيناريوهات ومقارنة أثر القرارات قبل التنفيذ. يُعرَض حاليًا كصفحة تعريفية — لم يبدأ التطوير بعد.`

#### Hero

- Badge: `SimulationOS — محاكاة السيناريوهات والمقارنات`
- Badge 2: `مفهوم — مستقبلي`
- H1: `اختبار القرار قبل تنفيذه يجب أن يكون جزءًا من المسار لا تمرينًا منفصلًا`
- Body: `SimulationOS هو مفهوم مستقبلي ضمن عقلية لمحاكاة السيناريوهات ومقارنة أثر الخيارات على النتائج والتكلفة والمخاطر قبل التنفيذ. يُعرَض حاليًا كصفحة تعريفية — لم يبدأ التطوير بعد.`
- Disclaimer: `SimulationOS في المرحلة المفاهيمية فقط. لم يبدأ التطوير التشغيلي بعد.`

CTAs:
| Label | Target |
|---|---|
| ناقش حالة استخدام مؤسسية | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

#### Governance Section

Pillars:
1. `الذكاء يساعد` — النظام يعالج المدخلات ويبني النماذج ويحسب الأثر والمقارنات.
2. `الإنسان يقرر` — المتخذ يقيّم السيناريوهات ويختار الافتراضات ويحكم على الأثر.
3. `الدليل يحكم` — كل محاكاة مرتبطة بنموذج موثق وافتراضات معروضة وتقارير مدقوقة.

#### Workflow

`المدخلات` → `نموذج السيناريو` → `الافتراضات` → `الأثر` → `المقارنة` → `دعم القرار`

#### Outputs

`تقرير السيناريو` / `مقارنة الأثر` / `عرض المخاطر` / `محاكاة التكلفة والعائد` / `مدخلات التوصية`

#### Final CTA

- Title: `هل تحتاج نظام محاكاة لمؤسستك؟`
- Description: `SimulationOS في المرحلة المفاهيمية حاليًا. إذا كنت مهتمًا بهذا المفهوم، ناقش حالة الاستخدام مع فريق عقلية.`

CTAs:
| Label | Target |
|---|---|
| ناقش حالة الاستخدام | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

#### Notes for implementation
- All English output labels translated to Arabic
- "مستقبلي — تسويقي" badge replaced with "مفهوم — مستقبلي" for clarity
- Stronger disclaimer language
- Body language avoids any implication of existing functionality

---

### Page: About

**Route:** `/about`
**Source file:** `src/app/(marketing)/about/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `من نحن | AQLIYA`
- Description: `عقلية منصة ذكاء مؤسسي خاص ومحكوم تبني خطوط أنظمة مؤسسية فوق AQLIYA Intelligence Core، بحيث تبقى البيانات والمخرجات والمراجعات تحت حوكمة المؤسسة.`

#### Hero

- Badge: `About AQLIYA`
- H1: `عقلية وُجدت لأن المؤسسة لا تحتاج ذكاءً أسرع فقط، بل ذكاءً يمكن الوثوق به`
- Body: `بدأ التصور من سؤال بسيط وصعب: كيف تستفيد المؤسسة من الذكاء الاصطناعي من دون أن تفقد القدرة على المراجعة والتفسير وربط القرار بمساره الكامل؟ من هنا جاءت عقلية كمنصة لا تبني مخرجات فقط، بل تبني طريقة مؤسسية لإنتاجها.`

#### Why AQLIYA Exists

- H2: `لماذا وُجدت عقلية؟`
- Body: `لأن أغلب مبادرات الذكاء داخل المؤسسات تبدأ من أداة، بينما المشكلة الحقيقية تبدأ من التشغيل. إذا لم تكن البيانات واضحة والصلاحيات معروفة والأدلة مربوطة بالمخرج، فإن أي ذكاء سريع سيتحول إلى عبء جديد بدل أن يكون قيمة جديدة.`

Reasons:
1. `المشكلة ليست نقص أدوات الذكاء فقط، بل مخرجات بلا أدلة ومسارات بلا محاسبة.`
2. `المؤسسات تحتاج ذكاءً يعمل داخل الحوكمة، لا خارجها.`
3. `الخطر الحقيقي ليس بطء الأتمتة، بل قرارات لا يمكن تتبعها أو مراجعتها بعد صدورها.`

Closing: `لذلك تأتي عقلية كطبقة تشغيل مؤسسي: تربط الذكاء بالبيانات وسير العمل والأدلة والمراجعة البشرية. السؤال بعد صدور المخرج ليس: من قال هذا؟ بل: ما الذي أوصلنا إليه، ومن اعتمده، وعلى أي أساس؟`

#### Operating Beliefs

- Label: `مبادئ التشغيل`
- H2: `كيف تفكر عقلية قبل أن تبني أي نظام؟`

1. `لا نبدأ من الشاشة، بل من واقع المؤسسة: من يقرر، من يراجع، وما الذي يجب أن يبقى قابلًا للتفسير.`
2. `لا نبيع ذكاءً معزولًا عن المسؤولية. كل مخرج في عقلية يجب أن يجد طريقه إلى المراجعة والاعتماد.`
3. `لا نبني لكل نطاق نظامًا منفصلًا تمامًا؛ نبني قدرة تشغيلية يمكن تكرارها فوق نواة واحدة.`

#### AQLIYA Intelligence Core

- H2: `ماذا تعني AQLIYA Intelligence Core فعليًا؟`
- Body: `تعني أن المؤسسة لا تبدأ من الصفر كلما أرادت تفعيل نطاق جديد. نواة موحدة تجمع تنسيق الذكاء والحوكمة وسير العمل وربط الأدلة والصلاحيات وسجل التدقيق والتقارير في بنية واحدة قابلة لإعادة الاستخدام.`

Core items: `تنسيق الذكاء` / `الحوكمة` / `سير العمل` / `ربط الأدلة` / `الصلاحيات` / `سجل التدقيق` / `التقارير`

#### System Lines

- H2: `خطوط الأنظمة — مجالات تشغيل فعلية لا أقسام تسويقية`
- Body: `كل خط نظام تحت عقلية يعالج نمطًا مؤسسيًا متكررًا: تدقيق، محتوى محلي، قرار، مبيعات، محاكاة، أو مسار خاص. الفكرة ليست تنويع المنتجات، بل توحيد طريقة بناء الأنظمة المؤسسية المحكومة.`

List:
1. `AuditOS — نظام التدقيق والذكاء المالي` (أول تطبيق مُثبت)
2. `LocalContentOS — نظام المحتوى المحلي` (المنتج الاستراتيجي الثاني — قيد التخطيط)
3. `DecisionOS — نظام حوكمة القرارات` (نظام مجاور — متاح)
4. `SalesOS — الذاكرة التجارية والمبيعات` (نموذج أولي — مستقبلي)
5. `SimulationOS — محاكاة السيناريوهات` (مفهوم — مستقبلي)
6. `أنظمة مؤسسية مخصصة` (تُبنى حسب نطاق المؤسسة)

#### What Makes AQLIYA Different

- H2: `ما الذي يجعل عقلية مختلفة؟`
- Body: `الفارق ليس في استخدام الذكاء الاصطناعي بحد ذاته، بل في طريقة إدخاله داخل المؤسسة: كمساعد محكوم، لا كجهة تقرر بدل الإنسان أو تتجاوز مسار الحوكمة.`

Differentiators:
1. `منصة متكاملة — تشغل خطوط أنظمة متعددة فوق نواة حوكمة واحدة`
2. `خاصة ومحكومة — تعمل على بيانات المؤسسة، داخل بيئتها، وتحت حوكمتها`
3. `الإنسان هو صاحب القرار النهائي — الذكاء يساعد، لا يقرر`
4. `قابلة للتتبع والمراجعة — كل خطوة توثق وتربط بالأدلة والصلاحيات`
5. `جاهزة للتوسع — تُفعّل حسب نطاق المؤسسة`
6. `السحابة الآن، والخوادم الخاصة استراتيجيًا — قدرات On-Prem وAir-Gapped تقدم كمسارات مستقبلية قيد الإعداد`

#### Final CTA

- Tagline: `نواة واحدة. خطوط متعددة.`
- H2: `ابدأ من نطاق مؤسستك، لا من أداة عشوائية`
- Body: `إذا كانت لديك مشكلة تشغيلية تحتاج وضوحًا وتتبعًا ومراجعة، فابدأ من خط النظام المناسب أو من جلسة تصميم نظام مؤسسي محكوم فوق عقلية.`

CTAs:
| Label | Target |
|---|---|
| استكشف خطوط عقلية | `/products` |
| صمّم نظامك المؤسسي | `/custom-product` |

#### Notes for implementation
- System lines list updated with status badges inline
- "One Core. Multiple Systems." replaced with Arabic "نواة واحدة. خطوط متعددة."
- Differentiator #6 updated to clarify deployment roadmap
- Operating Beliefs label changed from English "Operating Beliefs" to Arabic "مبادئ التشغيل"

---

### Page: How We Work

**Route:** `/how-we-work`
**Source file:** `src/app/(marketing)/how-we-work/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `كيف نعمل | AQLIYA`
- Description: `عقلية لا تبدأ من بناء واجهة أو أداة منفصلة، بل من تفعيل مسار مؤسسي محكوم يربط البيانات وسير العمل والأدلة والمراجعة والاعتماد.`

#### Hero

- Badge: `منهجية العمل`
- H1: `كيف يتحول الواقع التشغيلي إلى نظام محكوم يمكن تشغيله والثقة به؟`
- Body: `عقلية لا تبدأ من واجهة ولا من نموذج ذكاء منفصل. تبدأ من فهم الواقع التشغيلي، ثم تعيد بناءه كمسار مؤسسي واضح: بيانات، صلاحيات، أدلة، مراجعة، واعتماد داخل منطق واحد مبني على AQLIYA Intelligence Core.`

#### 8 Phases

(Preserved as-is — the methodology copy is strong and accurate.)

| # | Title | Description | Output |
|---|---|---|---|
| 01 | فهم الواقع التشغيلي | نبدأ من طريقة عمل المؤسسة كما هي: القرارات، الملفات، الأدوار، الصلاحيات، والاختناقات. | خريطة الواقع التشغيلي |
| 02 | هيكلة البيانات | نحدد البيانات الحرجة ومصادرها وعلاقتها بالمخرجات. | نموذج البيانات التشغيلي |
| 03 | تصميم سير العمل | نحول الإجراءات الحالية إلى مسار واضح يربط الإدخال والمعالجة والمراجعة والاعتماد. | خريطة سير العمل المحكوم |
| 04 | ربط الأدلة والصلاحيات | نعرّف من يراجع، من يعتمد، وما الأدلة المطلوبة. | نموذج الحوكمة والأدلة |
| 05 | إضافة طبقة الذكاء | نفعّل الذكاء الاصطناعي كمساعد داخل المسار: اقتراحات، تصنيفات، تلخيصات، وتنبيهات. | طبقة مساعدة محكومة |
| 06 | المراجعة والاعتماد | نربط كل مخرج بالمراجعة البشرية والاعتماد الرسمي. | بوابات مراجعة واعتماد |
| 07 | التفعيل التشغيلي | نفعّل خط النظام داخل بيئة العمل الفعلية. | نظام مؤسسي مفعل |
| 08 | التحسين المستمر | نقيس الأثر ونطور المسار بناءً على الاستخدام. | تحسينات وتوسعات دورية |

#### Final CTA

- Eyebrow: `من الواقع إلى النظام`
- H2: `إذا كان لديك واقع تشغيلي معقد، يمكن تحويله إلى مسار محكوم قابل للتفعيل`
- Body: `نبدأ من الواقع كما هو، ثم نحوله إلى بنية تشغيلية واضحة يمكن توسيعها وربطها بالذكاء والمراجعة والاعتماد.`

CTAs:
| Label | Target |
|---|---|
| صمّم نظامك المؤسسي | `/custom-product` |
| ناقش تفعيل النظام | `/contact` |

#### Notes for implementation
- Phase copy preserved as-is (strong, accurate methodology)
- No changes needed — this page is well-aligned with v1.1

---

### Page: Custom Product

**Route:** `/custom-product`
**Source file:** `src/app/(marketing)/custom-product/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `صمّم نظامك مع عقلية | AQLIYA`
- Description: `صمّم نظامًا مؤسسيًا خاصًا بطبيعة عمل مؤسستك. املأ الطلب وسيتواصل معك فريق عقلية.`

#### Hero

- Badge: `نظام مؤسسي مخصص`
- H1: `عندما لا يكفي المنتج الجاهز، يمكن تصميم نظامك فوق نواة عقلية`
- Body: `هذه الصفحة للمؤسسات التي لا تحتاج أداة إضافية فقط، بل تحتاج مسارًا تشغيليًا محكومًا مبنيًا حول واقعها الفعلي: البيانات، الأدوار، الصلاحيات، المراجعة، والمخرجات.`

Fit cases:
1. `عندما تكون الإجراءات موزعة بين فرق متعددة ولا يوجد مسار واحد يحكمها.`
2. `عندما لا يكفي منتج جاهز وتحتاج المؤسسة منطق تشغيل خاصًا بطبيعة عملها.`
3. `عندما يجب أن تبقى البيانات والمخرجات والمراجعة والاعتماد داخل بيئة محكومة واحدة.`

Form steps: `المؤسسة` → `النظام` → `التحديات` → `البيئة` → `المخرجات` → `الهدف` → `التواصل`

#### Form Section

- H2: `ما الذي نحتاج فهمه قبل تصميم أي نظام؟`
- Description: `نحتاج فهم المجال ونمط القرارات وطبيعة البيانات وحدود الصلاحيات.`

Post-submission:
1. `مراجعة الطلب لفهم طبيعة الفجوة التشغيلية.`
2. `تحديد ما إذا كان الاحتياج أقرب إلى خط نظام جاهز أو تصميم مخصص.`
3. `التواصل معك بنقطة بداية واضحة بدل رد عام غير مفيد.`

#### Notes for implementation
- Form labels (industries, sizes, countries, system categories, challenges, etc.) preserved as-is — functional form copy
- No changes needed — page is well-aligned

---

### Page: Contact

**Route:** `/contact`
**Source file:** `src/app/(marketing)/contact/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

- Title: `تواصل معنا | AQLIYA`
- Description: `ابدأ من نطاق مؤسستك مع عقلية: حدد خط النظام المناسب، ناقش التفعيل، أو اطلب جلسة تصميم نظام مؤسسي محكوم.`

#### Hero

- Badge: `تواصل`
- H1: `ابدأ من نطاق مؤسستك، لا من طلب عام غير واضح`
- Body: `سواء كنت تريد تفعيل خط نظام تحت عقلية، أو تحديد المسار المؤسسي المناسب، أو تصميم نظام خاص فوق AQLIYA Intelligence Core — هذه الصفحة هي نقطة البداية العملية.`

#### Contact Form Section

- Eyebrow: `بداية التشغيل`
- H2: `ابدأ المحادثة من زاوية تشغيلية واضحة`
- Body: `أفضل نقطة بداية ليست طلب عرض عام، بل تحديد نوع الفجوة التي تريد معالجتها.`

Pathways:
1. `إذا كنت تعرف نطاق العمل، نوجهك إلى خط النظام الأقرب.`
2. `إذا كان النطاق مركبًا، نبدأ من جلسة تصميم مؤسسي محكوم.`
3. `إذا أردت إثباتًا عمليًا، نوجهك إلى AuditOS كأول تطبيق واضح.`

Email: `ragheed@aqliya.com`

#### Three-Pathway Cards

1. Title: `حدد خط النظام المناسب` — CTA: `استكشف خطوط عقلية` → `/products`
2. Title: `ابدأ من جلسة تصميم` — CTA: `اطلب جلسة تصميم النظام` → `/custom-product`
3. Title: `شاهد تطبيقًا فعليًا` — CTA: `شاهد AuditOS` → `/products/audit`

#### Notes for implementation
- Eyebrow changed from English "Engagement Start" to Arabic "بداية التشغيل"
- Form copy preserved as-is
- All CTAs aligned with product taxonomy

---

### Page: AuditOS Guided Demo

**Route:** `/auditos`
**Source file:** `src/app/auditos/page.tsx`
**Rewrite status:** Ready for implementation

#### Metadata

(Title and description are page-level; the demo page has no exported metadata — add if needed.)

- Title: `AuditOS — عرض تفاعلي | AQLIYA`
- Description: `عرض تفاعلي لـ AuditOS كأول تطبيق مُثبت على AQLIYA Intelligence Core. شاهد مسار التدقيق المالي المحكوم من ميزان المراجعة إلى الاعتماد.`

#### Hero

- Badge: `AuditOS — أول تطبيق مُثبت / عرض تفاعلي`
- H1: `شركة الخليج التجارية — FY2025`
- Duration: `مدة الاستعراض: 4 دقائق`
- Status: `عرض تفاعلي`
- Body: `AuditOS هو أول تطبيق مُثبت على AQLIYA Intelligence Core في مجال التدقيق والذكاء المالي. يوضح هذا العرض كيف تتحول النواة إلى مسار عمل محكوم يربط البيانات والأدلة والمراجعة والاعتماد داخل نظام واضح وقابل للتتبع.`
- Disclaimer: `هذا عرض تفاعلي ببيانات تجريبية لغرض شرح المسار، وليس بيئة تشغيل عميل حقيقية.`

CTAs:
| Label | Target |
|---|---|
| صفحة AuditOS | `/products/audit` |
| ناقش التفعيل | `/custom-product` |

#### Guided Demo Questions

1. `ما الذي تراه؟ أول تطبيق مُثبت على عقلية في مسار تدقيق وذكاء مالي محكوم.`
2. `لماذا هذا مهم؟ كل مخرج في النظام مرتبط بمصدره ومراجعته واعتماده.`
3. `ما المخرج؟ قوائم مالية، إيضاحات، أدلة، وسجل تتبع كامل داخل مسار واحد.`
4. `ما القرار التالي؟ استعراض كيفية انتقال البيانات من الإدخال إلى المراجعة والاعتماد.`

KPIs: `إجمالي الارتباطات` / `نشطة` / `مراجعات معلقة` / `ملاحظات مفتوحة`

Insight: `تم تصنيف 21 من 22 حسابًا. حساب واحد يحتاج مراجعة بشرية قبل الاعتماد. الذكاء الاصطناعي يساعد. الإنسان يقرر.`

#### Final CTA

- Title: `هل تريد تجربة AuditOS على بيانات مؤسستك؟`
- Body: `ابدأ برؤية أول تطبيق مُثبت على عقلية، ثم ناقش كيف يمكن تفعيل خط النظام نفسه أو تصميم مسار مؤسسي مناسب.`

CTAs:
| Label | Target |
|---|---|
| ناقش تفعيل النظام | `/custom-product` |
| ارجع إلى صفحة المنتج | `/products/audit` |

#### Notes for implementation
- Demo page preserved almost entirely — copy is functional and clear
- Minor label update: "عرض إرشادي" → "عرض تفاعلي" for clarity
- All references to AQLIYA Core aligned

---

### Page: Login

**Route:** `/login`
**Source file:** `src/app/login/page.tsx`
**Rewrite status:** Ready for implementation

#### Copy

Title: `الدخول إلى مساحة العمل المؤسسية`
Description: `أدخل بياناتك للوصول إلى بيئة تشغيل محكومة.`
Labels: `البريد الإلكتروني` / `كلمة المرور`
CTA: `تسجيل الدخول`
Loading: `جارٍ تسجيل الدخول...`
Errors: `بريد إلكتروني أو كلمة مرور غير صحيحة` / `حدث خطأ في الاتصال. حاول مرة أخرى.`

#### Notes for implementation
- Description shortened from longer version to cleaner phrasing
- "المراجعة، والأثر التشغيلي" removed from description — too verbose for a login page

---

### 404 Page

**Route:** `*`
**Source file:** `src/app/not-found.tsx`
**Rewrite status:** Ready for implementation

#### Copy

Display: `404`
H1: `الصفحة غير موجودة`
Body: `الصفحة التي تبحث عنها غير متوفرة أو ربما أزيلت.`
CTA: `العودة إلى الرئيسية` → `/`

#### Notes for implementation
- Minor polish: "قد تكون قد أزيلت" → "ربما أزيلت" (more natural Arabic)

---

### Access Denied Page

**Route:** `/access-denied`
**Source file:** `src/app/access-denied/page.tsx`
**Rewrite status:** Ready for implementation

#### Copy

Title: `الوصول غير مصرح`
Description: `ليس لديك صلاحية للوصول إلى هذا المسار.`
Body: `إذا كنت تعتقد أن الوصول مطلوب لطبيعة عملك، تواصل مع مسؤول المساحة أو مدير النظام.`
CTA: `العودة إلى البداية` → `/`

#### Notes for implementation
- Description shortened: removed "أو هذه الوحدة التشغيلية" (redundant)
- CTA changed from "العودة إلى مساحة البداية" to "العودة إلى البداية" for clarity

---

### Loading Page

**Route:** loading
**Source file:** `src/app/loading.tsx`
**Rewrite status:** Ready for implementation

Text: `جاري التحميل...` (preserved as-is)

---

### Footer

**Source file:** `src/components/layout/site-footer.tsx`
**Rewrite status:** Ready for implementation

#### Brand Description

`عقلية منصة ذكاء مؤسسي خاص ومحكوم، تبني خطوط أنظمة متخصصة فوق AQLIYA Intelligence Core. الذكاء يساعد. الإنسان يقرر. الدليل يحكم. السحابة متاحة الآن. الخوادم الخاصة قيد الإعداد.`

Trust box:
- Label: `المبدأ المؤسسي`
- Text: `الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.`
- Email: `ragheed@aqliya.com`

#### Link Groups

**الشركة:** من نحن (`/about`) / كيف نعمل (`/how-we-work`) / تواصل معنا (`/contact`) / صمّم نظامك المؤسسي (`/custom-product`) / راسلنا عبر البريد (`mailto:ragheed@aqliya.com`)

**خطوط الأنظمة:**
- AuditOS — نظام التدقيق والذكاء المالي (`/products/audit`)
- LocalContentOS — نظام المحتوى المحلي (`/products/local-content`)
- DecisionOS — حوكمة القرارات التنفيذية (`/products/decision`)
- SalesOS — الذاكرة التجارية والمبيعات (`/products/sales`)
- SimulationOS — محاكاة السيناريوهات (`/products/simulation`)
- أنظمة مؤسسية مخصصة (`/custom-product`)

**ابدأ الآن:**
- استكشف خطوط عقلية (`/products`)
- شاهد AuditOS كأول تطبيق (`/auditos`)
- ناقش حالة استخدام (`/custom-product`)

**نماذج التشغيل:**
- سحابة عقلية — متاحة الآن (`/products`)
- خوادم خاصة — قيد الإعداد (`/products`)
- بيئة معزولة — مستقبلية (`/products`)

Copyright: `© {year} AQLIYA. جميع الحقوق محفوظة.`

#### Notes for implementation
- Footer group "التفعيل والاستكشاف" renamed to "ابدأ الآن" for clarity
- Footer link "ناقش حالة استخدام مؤسسية" shortened to "ناقش حالة استخدام"
- Footer deployment labels updated:
  - "سحابة عقلية — متاح الآن" → "سحابة عقلية — متاحة الآن"
  - "خوادم خاصة — قيد التطوير" → "خوادم خاصة — قيد الإعداد"
  - "بيئة معزولة — استراتيجي" → "بيئة معزولة — مستقبلية"
- Brand description updated from "سحابة متاحة الآن. خوادم خاصة ومعزولة قيد التطوير" to "السحابة متاحة الآن. الخوادم الخاصة قيد الإعداد."

---

### Header

**Source file:** `src/components/layout/site-header.tsx`
**Rewrite status:** Ready for implementation

#### Navigation Labels

| Arabic | Target |
|---|---|
| الرئيسية | `/` |
| المنتجات | `/products` |
| منهجية العمل | `/how-we-work` |
| من نحن | `/about` |
| تواصل معنا | `/contact` |

CTA: `صمّم نظامك المؤسسي` → `/custom-product`

#### Language Switcher

AR / EN / TR (preserved as-is)

#### Notes for implementation
- Navigation label "كيف نعمل" → "منهجية العمل" (more precise — "methodology" rather than "how we work")
- All other navigation labels preserved

---

### Platform Sidebar (Dashboard)

**Source file:** `src/components/platform/platform-sidebar.tsx`
**Rewrite status:** Ready for implementation

#### Brand

- Logo alt: `AQLIYA`
- Subtitle: `منصة ذكاء مؤسسي خاص ومحكوم` (replaces "Mind The Future")

#### Module Switcher

| English | Arabic | Route |
|---|---|---|
| AuditOS | نظام التدقيق المالي | `/audit` |
| DecisionOS | نظام القرارات | `/decisions` |
| SalesOS | نظام المبيعات | `/sales` |

#### Navigation Items

DecisionOS context:
| Item | Route |
|---|---|
| ذكاء القرارات | `/decisions` |
| المنظمات | `/organizations` |
| الذكاء | `/intelligence/sectors` |
| الإعدادات | `/settings` |

AuditOS context:
| Arabic | Route |
|---|---|
| لوحة التحكم | `/audit` |
| المهام | `/audit` |
| العملاء | `/audit` |
| الأدلة | `/audit` |
| الملاحظات | `/audit` |
| المراجعات | `/audit` |
| الموافقة | `/audit` |
| سجل التدقيق | `/audit` |

SalesOS context:
| Arabic | Route |
|---|---|
| لوحة التحكم | `/sales` |
| المنظمات | `/organizations` |
| الإعدادات | `/settings` |

#### Footer

`منصة ذكاء مؤسسي خاص ومحكوم` / `الإصدار 1.1`

#### Notes for implementation
- Subtitle changed from "Mind The Future" to "منصة ذكاء مؤسسي خاص ومحكوم" — aligned with v1.1 positioning
- Sidebar footer label changed from "Governed Intelligence Platform" to "منصة ذكاء مؤسسي خاص ومحكوم"
- v1.1 label changed from "v1.1 — Private & Governed" to "الإصدار 1.1"

---

### Platform Header (Dashboard)

**Source file:** `src/components/platform/platform-header.tsx`
**Rewrite status:** Ready for implementation

#### Workspace Breadcrumbs

| Module | Arabic Workspace Label |
|---|---|
| Default | مساحة العمل |
| AuditOS | نظام التدقيق المالي |
| SalesOS | الذاكرة التجارية والمبيعات |
| DecisionOS | حوكمة القرارات |
| Settings | الإعدادات |

#### Search Placeholder

`ابحث في مساحة العمل...` (preserved as-is)

#### Notes for implementation
- Breadcrumb labels preserved — already aligned with v1.1 naming
- No changes needed for search and user menu copy

---

## 5. Fixes Applied Against Extracted Risks

| Risk | Old Copy | New Copy Direction | Status |
|---|---|---|---|
| Docker/Kubernetes private deployment claim | `متوفر على Docker أو Kubernetes` | `قيد الإعداد — تشغيل عقلية داخل البنية التحتية للمؤسسة` | **Fixed** |
| Air-Gapped described too strongly | `بيئة معزولة بدون أي اتصال بالانترنت (air-gapped) للمؤسسات ذات متطلبات أمنية صارمة. كل البيانات والمعالجة محلية بالكامل.` | `نموذج مستقبلي للمؤسسات ذات المتطلبات الأمنية العالية. يعتمد على اكتمال نموذج الخوادم الخاصة أولاً.` | **Fixed** |
| DecisionOS status inconsistency | `نظام قائم` badge on `/products` and `متاح للتفعيل` on `/products/decision` | Unified badge: `نظام مجاور — متاح` across all surfaces | **Fixed** |
| Mind The Future sidebar subtitle | `Mind The Future` | `منصة ذكاء مؤسسي خاص ومحكوم` | **Fixed** |
| Duplicate product copy | Product descriptions duplicated verbatim across homepage, products page, and product pages | Accept as-is for now; extracted to Section 6 (Copy Constants) for future deduplication | **Identified** |
| English-only output labels | DecisionOS: `Decision Brief`, SalesOS: `ICP Profiles`, SimulationOS: `Scenario Report` | All translated to Arabic: `موجز القرار`, `ملف العميل المثالي`, `تقرير السيناريو` | **Fixed** |
| SalesOS overstatement risk | `ينظم رحلة المبيعات من تعريف العميل المثالي إلى التأهيل` | `يستكشف كيفية تنظيم رحلة المبيعات من تأهيل العملاء` — uses future/conditional tone | **Fixed** |
| AQLIYA reduced to AuditOS risk | Homepage impact metrics list "06 lines starting from AuditOS" | Updated to `مسارات تشغيل` instead of `خطوط تشغيل` to avoid miscounting | **Softened** |
| 6 operating lines ambiguity | Lists AuditOS, LocalContentOS, DecisionOS, SalesOS, SimulationOS as "06" without clear criteria | Clarified as `مسارات تشغيل` that include multiple system lines at different maturity levels | **Clarified** |
| CTA clarity: "ناقش حالة استخدام مؤسسية" | Homepage: `ناقش حالة استخدام مؤسسية` → `/custom-product` | Changed to `ناقش حالة استخدام مؤسسية` leading to `/custom-product` — label kept but target surface needed | **Preserved** (CTA to form page is acceptable) |
| Footer deployment wording | `خوادم خاصة — قيد التطوير` / `بيئة معزولة — استراتيجي` | `خوادم خاصة — قيد الإعداد` / `بيئة معزولة — مستقبلية` | **Fixed** |
| "Engagement Start" English label | Contact page eyebrow: `Engagement Start` | Changed to Arabic: `بداية التشغيل` | **Fixed** |
| "6 operating lines" metric | Impact metric: `06 خطوط تشغيل` listing 5 products | Updated to `06 مسارات تشغيل` with clearer scope description | **Clarified** |
| Platform sidebar "Governed Intelligence Platform" | `Governed Intelligence Platform` + `v1.1 — Private & Governed` | `منصة ذكاء مؤسسي خاص ومحكوم` + `الإصدار 1.1` | **Fixed** |

---

## 6. Copy Constants Proposal

The following content is duplicated across multiple pages and should be extracted into reusable constants for implementation. Do NOT implement code yet — only design the grouping.

### `platformCopy`

| Key | Arabic | English |
|---|---|---|
| platformName | عقلية | AQLIYA |
| platformTagline | منصة ذكاء مؤسسي خاص ومحكوم | Private Governed Institutional Intelligence Platform |
| platformDescription | عقلية هي منصة تشغيل مؤسسية تبني خطوط أنظمة فوق نواة حوكمة واحدة. | AQLIYA is an institutional intelligence platform that builds governed systems on a shared core. |
| trustPrincipleAr | الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم. | — |
| trustPrincipleEn | — | AI assists. Humans decide. Evidence governs. |
| coreEngines | [تنسيق الذكاء, الحوكمة, سير العمل, ربط الأدلة, الصلاحيات, سجل التدقيق, التقارير] | [AI Orchestration, Governance Engine, Workflow Engine, Evidence Graph, RBAC/Permissions, Audit Logs, Reporting Engine] |

### `deploymentCopy`

| Key | Arabic | Status |
|---|---|---|
| cloudTitle | السحابة | متاح الآن |
| cloudBody | نسخة سحابية متكاملة مع كل الخصائص والتحديثات التلقائية والنسخ الاحتياطي. | Available |
| privateTitle | خوادم خاصة | قيد الإعداد |
| privateBody | تشغيل عقلية داخل البنية التحتية للمؤسسة مع قاعدة بيانات محلية وتحكم كامل. قيد التطوير. | Strategic/future |
| airGappedTitle | بيئة معزولة | مستقبلي |
| airGappedBody | نموذج مستقبلي للمؤسسات ذات المتطلبات الأمنية العالية. | Strategic/future |

### `productStatusCopy`

| Product | Arabic Status Badge | English Status Badge |
|---|---|---|
| audit | أول تطبيق مُثبت — جاهز للتجربة | First proof product — pilot-ready |
| localContent | استراتيجي — المنتج الثاني — قيد التخطيط | Strategic second product — in planning |
| decision | نظام مجاور — متاح | Adjacent system — active |
| sales | نموذج أولي — مستقبلي | Prototype — future |
| simulation | مفهوم — مستقبلي | Marketing concept — future |
| custom | يُفعّل حسب نطاق المؤسسة | Activated per institutional scope |

### `productCardsCopy`

Each product card has: title, problem, system, output, flow, note, maturity, href — these are duplicated across homepage, products page, and individual product pages. They should be defined once and imported.

Products: AuditOS, DecisionOS, LocalContentOS, SalesOS, SimulationOS, CustomSystems.

### `ctaCopy`

| Key | Arabic Label | Target |
|---|---|---|
| exploreProducts | استكشف خطوط عقلية | `/products` |
| watchAuditOS | شاهد AuditOS — عرض تفاعلي | `/auditos` |
| designSystem | صمّم نظامك المؤسسي | `/custom-product` |
| discussActivation | ناقش تفعيل النظام | `/custom-product` |
| discussFuture | ناقش التفعيل المستقبلي | `/custom-product` |
| discussUseCase | ناقش حالة استخدام | `/custom-product` |
| contactUs | تواصل معنا | `/contact` |

### `navigationCopy`

| Arabic Label | Route |
|---|---|
| الرئيسية | `/` |
| المنتجات | `/products` |
| منهجية العمل | `/how-we-work` |
| من نحن | `/about` |
| تواصل معنا | `/contact` |
| صمّم نظامك المؤسسي | `/custom-product` |

---

## 7. Implementation Mapping for Later

| Source File | Sections to Update | Priority | Notes |
|---|---|---|---|
| `src/app/(marketing)/page.tsx` | Hero impact metrics, deployment cards (Docker/Kubernetes fix, Air-Gapped fix), product cards status badges, DecisionOS badge, CTA labels | **High** | Most changes concentrated here |
| `src/app/(marketing)/products/page.tsx` | DecisionOS badge (`نظام قائم` → `نظام مجاور — متاح`), product descriptions alignment | **High** | Status badges need v1.1 alignment |
| `src/app/(marketing)/products/decision/page.tsx` | Badge `متاح للتفعيل` → `نظام مجاور — متاح`, output labels translation | **High** | Taxonomy alignment |
| `src/app/(marketing)/products/sales/page.tsx` | Body language (soften to future/conditional), output labels translation | **Medium** | Overstatement risk fix |
| `src/app/(marketing)/products/simulation/page.tsx` | Badge `مستقبلي — تسويقي` → `مفهوم — مستقبلي`, output labels translation | **Medium** | Clearer status badge |
| `src/app/(marketing)/about/page.tsx` | Operating Beliefs label (English→Arabic), System lines status badges, differentiator #6 | **Medium** | Alignment |
| `src/app/(marketing)/contact/page.tsx` | Eyebrow `Engagement Start` → `بداية التشغيل` | **Low** | Arabic-first polish |
| `src/app/not-found.tsx` | Body text minor polish | **Low** | Language polish |
| `src/app/access-denied/page.tsx` | Description shortened, CTA label | **Low** | Language polish |
| `src/components/layout/site-header.tsx` | Nav label `كيف نعمل` → `منهجية العمل` | **Low** | Precision improvement |
| `src/components/layout/site-footer.tsx` | Brand description, deployment labels, group titles, deployment wording | **Medium** | Multiple fixes |
| `src/components/platform/platform-sidebar.tsx` | Subtitle `Mind The Future` → `منصة ذكاء مؤسسي خاص ومحكوم`, footer label translation | **High** | Major positioning fix |
| `src/components/enterprise/SectionEyebrow` | Shared component — verify label alignment across all uses | **Low** | Check only |
| `src/app/layout.tsx` | Metadata — verify against v1.1 positioning | **Low** | Currently aligned |

---

## 8. Final Review Checklist

- [x] **No unsupported capabilities claimed** — Private/On-Prem marked as strategic/future; Air-Gapped marked as future; Docker/Kubernetes removed; Local AI, Studio, Institutional Memory, Model Governance not claimed
- [x] **AQLIYA not reduced to AuditOS** — Platform-first language throughout; product cards show multiple system lines; "what AQLIYA is not" section explicitly states "ليست منتجًا واحدًا"
- [x] **AuditOS remains first proof product** — Strongest marketed product; full page with comparison table; guided demo
- [x] **LocalContentOS remains second strategic product** — Clear strategic badge; Saudi market focus; disclaimer about planning phase
- [x] **DecisionOS status aligned with v1.1 taxonomy** — Badge changed to `نظام مجاور — متاح`; description updated to reflect adjacent system status
- [x] **Arabic-first copy polished** — English-only output labels translated; "Engagement Start" converted to Arabic; "Mind The Future" replaced; "One Core. Multiple Systems." → Arabic
- [x] **CTAs consistent** — Standardized across all surfaces; primary/secondary hierarchy maintained
- [x] **Navigation aligned** — Header labels polished; footer groups renamed; sidebar subtitle fixed
- [x] **Footer aligned** — Deployment wording updated; brand description refined
- [x] **Metadata aligned** — Titles and descriptions verified against v1.1 positioning
- [x] **Trust principle preserved** — `الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.` present in all key marketing surfaces

---

*End of rewrite proposal. No source code files were modified or created besides this document.*
