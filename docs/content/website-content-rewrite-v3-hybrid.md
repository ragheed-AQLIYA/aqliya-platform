# AQLIYA Website Content Rewrite v3 — Hybrid Final Version [PLATFORM-FIRST UPDATE]
> **Status:** Updated to current live site (2026-06-09). Reflects platform-first architecture. Product-centric pages described below are documented for historical/reference only and do NOT match the current marketing/navigation architecture.
> **Based on:** Live site source code (`src/app/(marketing)/`), navigation (`site-header.tsx`), footer (`site-footer.tsx`), and homepage (`page.tsx`)
> **Merge decision:** This document was updated on 2026-06-09 to reflect the platform-first architecture now live. Sections describing old product-centric pages are marked with ~~strikethrough~~ headings and replaced with notices.

> **⚠️ IMPORTANT:** The live site uses a platform-first architecture with navigation: المنصة | القطاعات | الإثبات | الحوكمة | عن عقلية. Primary CTA is احجز جلسة تشخيص. Product-specific routes (`/products`, `/products/audit`, etc.) still exist in code but are NOT in the primary navigation. See individual page sections for details.

> **Merge decision:** This version uses the OpenCode draft as the execution structure, then applies stricter capability-claim controls from the conservative draft. It is designed to be safer for public website use and easier to convert into source-code edits.

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
| **Future capability discipline** | Any future capability must be phrased as strategic/future unless the current codebase already supports it as a production capability. This applies especially to Private/On-Prem, Air-Gapped, Local AI, Studio, Institutional Memory, Model Governance, Kubernetes, and SIEM/SSO integrations. |
| **Execution-ready structure** | Every rewrite is mapped to source files and implementation priorities so it can be safely reflected into the website later. |

---

## 2. Global Messaging System

### Primary Arabic Positioning

**Short one-liner:**
عقلية — منصة ذكاء مؤسسي خاص ومحكوم.

**Medium paragraph:**
عقلية هي منصة تشغيل مؤسسية تبني خطوط أنظمة ذكية فوق نواة حوكمة واحدة. كل مخرج مربوط بالدليل، كل خطوة تحتاج مراجعة بشرية، وكل قرار أو مخرج داخل المسارات المدعومة موثق في سجل قابل للمراجعة. السحابة متاحة الآن. الخوادم الخاصة / On-Prem مسار استراتيجي مستقبلي، وليست حزمة إنتاجية متاحة حاليًا.

**Homepage hero version:**
بنية مؤسسية تجعل الذكاء مفيدًا، مفهومًا، ومحكومًا. عقلية ليست طبقة ذكاء منفصلة، بل منصة تشغيل تربط البيانات، القواعد، الصلاحيات، الأدلة، والمراجعة داخل مسار واحد يمكن الوثوق به.

### Primary English Positioning

**Short one-liner:**
AQLIYA — Private Governed Institutional Intelligence.

**Medium paragraph:**
AQLIYA is an institutional intelligence platform that builds governed systems on a shared core. Every output is evidence-linked. Every step requires human review. Every decision is auditable. Cloud is live. Private / On-Prem is a strategic future deployment path, not yet available as a production package.

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
- A Cloud-first platform with Private/On-Prem as a strategic future deployment model
- A governance-first system: every AI output is evidence-linked, human-reviewed, and auditable
- A custom systems builder (via AQLIYA Studio, strategic/future) — enabling institutional systems without starting from scratch

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
| **Cloud** | سحابة عقلية — النسخة السحابية متاحة الآن. إدارة للخصائص الحالية المتاحة، تحديثات تشغيلية، ونسخ احتياطي. مناسبة للشركات المتوسطة والمؤسسات التي تفضل عدم إدارة البنية التحتية. | AQLIYA Cloud — managed cloud deployment for currently available capabilities, with operational updates and backups. Suitable for SMEs, pilots, and mid-market organizations. | **Available now** |
| **Private / On-Prem** | خوادم خاصة / On-Prem — مسار استراتيجي مستقبلي قيد التخطيط والتحضير. عند اكتماله، سيتيح تشغيل عقلية داخل بيئة العميل مع قاعدة بيانات محلية وتخزين محلي وتحكم أعلى. ليس متاحًا حاليًا كحزمة إنتاجية. | Private / On-Prem — strategic future deployment path under planning and preparation. Once completed, it is intended to enable organizations to run AQLIYA inside their own infrastructure with local database, local storage, and higher control. Not currently available as a production package. | **Strategic / future — not yet available as a production package** |
| **Air-Gapped** | بيئة معزولة — نموذج استراتيجي مستقبلي للمؤسسات ذات المتطلبات الأمنية العالية. يتطلب اكتمال نموذج الخوادم الخاصة أولاً. | Air-Gapped — strategic future model for high-security environments. Requires the Private/On-Prem model to be completed first. | **Strategic / future — not yet implemented** |

---

## 3. Capabilities Status / حالة القدرات

| System / Capability | Arabic Status | English Status | Platform Context |
|---|---|---|---|
| **AuditOS** | أول تطبيق مُثبت — جاهز للتجربة | First proof product — pilot-ready | Shown as the first proof capability on the platform. Referenced from /platform#capabilities and via /auditos guided demo. |
| **LocalContentOS** | استراتيجي — المنتج الثاني — قيد التخطيط | Strategic second product — in planning | Described inside /platform#capabilities as a strategic system line. |
| **DecisionOS** | نظام مجاور — نشط | Adjacent active system | Referenced inside /platform#capabilities. Active workspace available. |
| **SalesOS** | نموذج أولي — مستقبلي | Prototype — future | Listed inside /platform#capabilities as a prototype/future system. |
| **SimulationOS** | مفهوم تسويقي — مستقبلي | Marketing concept — future | Referenced inside /platform#capabilities as a future concept. |
| **Custom Systems** | يُفعّل حسب نطاق المؤسسة | Activated per institutional scope | Described inside /platform#capabilities. /custom-product route exists as form. |

> **Note:** Since 2026-06-09, these are presented as capabilities of the AQLIYA platform, not standalone product pages. See [/platform#capabilities](/platform#capabilities). The primary navigation is: المنصة | القطاعات | الإثبات | الحوكمة | عن عقلية. Product-specific pages still exist in code but are not promoted in primary marketing navigation.
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
- Hero support line:
  1. `الذكاء لا يقرر. يساعد.`
  2. `الإنسان يقرر.`
  3. `والدليل يحكم.`
- Subtext: `عقلية ليست طبقة محادثة فوق المؤسسة. هي منصة تشغيل تربط البيانات، القواعد، الصلاحيات، الأدلة، والمراجعة داخل مسار واحد يمكن الوثوق به.`
- Supporting points:
  1. `ذكاء يعمل داخل نطاق المؤسسة لا خارجه`
  2. `مسارات تشغيل تربط الإدخال، المراجعة، والاعتماد في بنية واحدة`
  3. `مخرجات قابلة للفهم والمراجعة بدل إجابات سريعة بلا سياق`
- Primary CTA: `احجز جلسة تشخيص` → `/contact`
- Secondary CTA: `شاهد كيف تعمل عقلية` → `/platform`
- Tertiary CTA: `مركز الإثبات` → `/proof`

#### Impact Metrics

- 01 — `نواة مشتركة` — منطق حوكمة واحد يمكن البناء فوقه عبر أكثر من خط نظام
- عدة — `مسارات تشغيل` — تشمل التدقيق المالي، المحتوى المحلي، حوكمة القرارات، المبيعات، المحاكاة، والأنظمة المخصصة بدرجات نضج مختلفة
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

#### Section: ليست صناديق سوداء

- Eyebrow: `الوضوح والثقة`
- Title: `ليست صناديق سوداء. ليست قرارات آلية. ليست مخرجات بلا دليل.`
- Description: `داخل المؤسسة، الإجابة وحدها لا تكفي. يجب أن يعرف صاحب القرار: ما البيانات؟ ما الدليل؟ من راجع؟ ومن اعتمد؟ عقلية تجعل كل مخرج مفهومًا، قابلًا للمراجعة، ومرتبطًا بسياقه التشغيلي.`

#### Section: Deployment Models

- Eyebrow: `نماذج التشغيل`
- Title: `السحابة متاحة الآن. الخوادم الخاصة قيد التخطيط والتحضير.`
- Description: `نقدم خيارات تشغيل تناسب درجة حساسية المؤسسة. كل نموذج يحافظ على نفس منطق الحوكمة والتتبع والأدلة.`

Card 1 — Cloud:
- Title: `السحابة`
- Badge: `متاح الآن`
- Body: `نسخة سحابية للخصائص الحالية المتاحة، مع تحديثات تشغيلية ونسخ احتياطي. مناسبة للمؤسسات التي تفضل عدم إدارة البنية التحتية.`

Card 2 — Private:
- Title: `خوادم خاصة`
- Badge: `قيد التخطيط والتحضير`
- Body: `تشغيل عقلية داخل البنية التحتية للمؤسسة مع قاعدة بيانات محلية وتحكم كامل. قيد التخطيط والتحضير، وقد يُتاح للمؤسسات الحساسة بعد اكتماله واعتماده.`

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

#### Section: لماذا ليست أداة ذكاء عامة؟

- Eyebrow: `ما بعد الإجابة السريعة`
- Title: `معظم أدوات الذكاء تعطي إجابة. عقلية تبني مسارًا.`
- Description: `الإجابة السريعة قد تساعد فردًا، لكنها لا تكفي داخل مؤسسة. المؤسسة تحتاج مخرجًا يمكن تفسيره، مراجعته، وربطه بالدليل والصلاحية والاعتماد. لذلك لا تتعامل عقلية مع الذكاء كواجهة محادثة، بل كجزء من نظام تشغيل محكوم.`

#### Section: Custom Systems Activation

- Eyebrow: `التفعيل المؤسسي`
- Title: `وحين لا تكفي الخطوط الجاهزة، يمكن بناء مسارك الخاص فوق النواة نفسها`
- Description: `بعض المؤسسات تحتاج ما هو أبعد من منتج جاهز. لذلك تتيح عقلية بناء نظام أو مسار مؤسسي مخصص مع الحفاظ على نفس منطق الحوكمة والتتبع والمراجعة.`
- CTA: `صمّم نظامك المؤسسي` → `/custom-product`

#### ~~Section: Product Family / عائلة المنتجات (REMOVED)~~

> **REMOVED from homepage in platform-first redesign (2026-06-09).** Product/capability cards now live inside [/platform#capabilities](/platform#capabilities). The homepage is a 9-section platform architecture with NO product names in sections 1-8. Use cases are presented as operational scenarios (نماذج الاستخدام), not product cards.

> The detailed system card content (AuditOS, LocalContentOS, DecisionOS, SalesOS, SimulationOS) is preserved below in the individual system page sections for reference.

---

*End of removed section.*


#### ~~Section: Proof Product — AuditOS (REMOVED)~~

> **REMOVED from homepage in platform-first redesign.** AuditOS is now a use case inside the 9-section homepage (نماذج الاستخدام). Full demo at [/auditos](/auditos). Proof assets at [/proof](/proof).

#### ~~Section: Strategic Product — LocalContentOS (REMOVED)~~

> **REMOVED from homepage in platform-first redesign.** LocalContentOS is described inside [/platform#capabilities](/platform#capabilities) as a strategic capability.

#### ~~Section: Trust & Proof Chain (REPLACED)~~

> **Replaced.** The trust principle is now embedded in the hero section. Trust reasons are in §7 of homepage. Full governance page at [/governance](/governance).

#### Section: Final CTA (Homepage Bottom)

> **Note:** The old homepage Final CTA section referenced `/custom-product`. Current homepage ends with §9 (مركز الإثبات). Primary CTA is احجز جلسة تشخيص → `/contact`. See `src/app/(marketing)/page.tsx`.
---

### Page: Platform (replaces old Products Listing)

**Route:** `/platform`
**Source file:** `src/app/(marketing)/platform/page.tsx`

**Status:** LIVE — primary platform architecture page

> **Note:** The old `/products` route still exists in source code but is NOT in the primary navigation. The promoted architecture page is `/platform`. The old product listing content is archived below for reference.

#### New /platform Page Content

- Hero: platform architecture description
- Core engine items: الذكاء / الحوكمة / سير العمل / الأدلة / الصلاحيات / سجل التدقيق
- Capabilities section at bottom (`/platform#capabilities`) listing: AuditOS, DecisionOS, LocalContentOS, SalesOS, SimulationOS, أنظمة مؤسسية مخصصة
- Deployment models: Cloud / Private / Air-Gapped
- CTA: احجز جلسة تشخيص → /contact

---

#### Archived: Old /products Page Content (Reference Only)

The following is the old product listing page content from the original v3 rewrite. It does NOT reflect the current live site architecture.

---

*(Original /products page content preserved below for historical reference)*

---

### ~~Page: AuditOS Product~~

**~~Route: /products/audit~~**
> **NOT IN PRIMARY NAVIGATION.** This route exists in source code but is not promoted in the main nav or homepage. AuditOS is now described at `/platform#capabilities` and demonstrated at `/auditos`.
> **Note for reference:** The detailed copy below (comparison tables, journey steps, etc.) is strong content. If AuditOS is re-integrated into the marketing architecture, this copy should be used.

---

*(Original /products/audit content preserved below for reference)*

---

### ~~Page: LocalContentOS Product~~

**~~Route: /products/local-content~~**
> **NOT IN PRIMARY NAVIGATION.** This route exists but is not promoted. LocalContentOS is described inside /platform#capabilities.
> **Archive note:** The copy below is from the v3 rewrite before the platform-first redesign.

---

*(Original /products/local-content content preserved below for reference)*


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
- Badge 2: `نظام مجاور — نشط`
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
- Status badge changed from `متاح للتفعيل` to `نظام مجاور — نشط` to align with v1.1 taxonomy (DecisionOS is an adjacent system, not a primary product line)
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
- Description: `SalesOS نموذج أولي ضمن عقلية لنظام الذاكرة التجارية والمبيعات. يستكشف كيفية تنظيم التأهيل والترتيب والمتابعة والتعلم داخل مسار تجاري محكوم. حاليًا في مرحلة النموذج الأولي.`

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
1. `الذكاء يساعد` — التصور المستقبلي للنظام يساعد في تصنيف العملاء وتقييم التأهيل والأولويات.
2. `الإنسان يقرر` — الفريق يختار الرسالة والنهج بناءً على السياق والحكم الشخصي.
3. `الدليل يحكم` — في التصور المستقبلي، كل تواصل وتفاعل يصبح موثقًا ومرتبطًا بالحملة والفريق والعميل.

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
- Opening story:
  1. `وُجدت عقلية لأن المؤسسات لا تحتاج ذكاءً أسرع فقط.`
  2. `تحتاج ذكاءً يمكن مساءلته.`
  3. `القرار المؤسسي لا يكفي أن يكون صحيحًا.`
  4. `يجب أن يكون مفهومًا، موثقًا، وقابلًا للمراجعة.`
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
3. `DecisionOS — نظام حوكمة القرارات` (نظام مجاور — نشط)
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
6. `السحابة الآن، والخوادم الخاصة استراتيجيًا — قدرات On-Prem وAir-Gapped تقدم كمسارات مستقبلية قيد التخطيط والتحضير`

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
| احجز جلسة تشخيص | `/contact` |
| ناقش تفعيل النظام | `/contact` |

#### Notes for implementation
- Phase copy preserved as-is (strong, accurate methodology)
- CTA updated: old "صمّم نظامك المؤسسي" → "احجز جلسة تشخيص" (current live CTA)
- Route changed from /custom-product to /contact (current live behavior)

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

1. Title: `استكشف أنظمة المنصة` — CTA: `استكشف أنظمة المنصة` → `/platform#capabilities`
2. Title: `احجز جلسة تشخيص` — CTA: `احجز جلسة تشخيص` → `/contact`
3. Title: `شاهد تطبيقًا فعليًا` — CTA: `شاهد AuditOS — عرض تفاعلي` → `/auditos`

#### Notes for implementation
- Eyebrow changed from English "Engagement Start" to Arabic "بداية التشغيل"
- Form copy preserved as-is
- All CTAs aligned with platform-first architecture
- Three-Pathway Cards updated: old product routes replaced with /platform#capabilities, /contact, /auditos

---

---

### New Marketing Pages (added 2026-06-09)

The following pages are currently live in the primary navigation but not yet documented in this spec document. They are included here for future copy specification.

#### /industries — القطاعات

**Source:** Currently in primary nav header. Shows target industries served by AQLIYA platform. Copy specification needed.

**Proposed structure:** Hero → Industry cards (المالية/التدقيق, القطاع الحكومي, المقاولات, الطاقة, الرعاية الصحية, التعليم) → Platform fit description → CTA

---

#### /proof — مركز الإثبات / Evidence Center

**Source:** Currently in primary nav header. Demonstrates AQLIYA's commitment to evidence and traceability. Copy specification needed.

**Proposed structure:** Hero → Evidence principle explanation → Evidence types → Interactive walkthrough → CTA

---

#### /governance — الحوكمة

**Source:** Currently in primary nav header. Explains governance-first architecture. Copy specification needed.

**Proposed structure:** Hero → Governance pillars → Trust principle → Comparison (governed vs non-governed) → CTA

---

---

### New Marketing Pages (added 2026-06-09)

The following pages are currently live in the primary navigation but not yet documented in this spec document. They are included here for future copy specification.

#### /industries — القطاعات

**Source:** Currently in primary nav header. Shows target industries served by AQLIYA platform. Copy specification needed.

**Proposed structure:** Hero → Industry cards (المالية/التدقيق, القطاع الحكومي, المقاولات, الطاقة, الرعاية الصحية, التعليم) → Platform fit description → CTA

---

#### /proof — مركز الإثبات / Evidence Center

**Source:** Currently in primary nav header. Demonstrates AQLIYA's commitment to evidence and traceability. Copy specification needed.

**Proposed structure:** Hero → Evidence principle explanation → Evidence types → Interactive walkthrough → CTA

---

#### /governance — الحوكمة

**Source:** Currently in primary nav header. Explains governance-first architecture. Copy specification needed.

**Proposed structure:** Hero → Governance pillars → Trust principle → Comparison (governed vs non-governed) → CTA

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
| تعرف على AuditOS | `/platform#audit` |
| احجز جلسة تشخيص | `/contact` |

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
| احجز جلسة تشخيص | `/contact` |
| تعرف على أنظمة المنصة | `/platform#capabilities` |

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

`عقلية منصة ذكاء مؤسسي خاص ومحكوم، تبني خطوط أنظمة متخصصة فوق AQLIYA Intelligence Core. الذكاء يساعد. الإنسان يقرر. الدليل يحكم. السحابة متاحة الآن. الخوادم الخاصة قيد التخطيط والتحضير.`

Trust box:
- Label: `المبدأ المؤسسي`
- Text: `الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.`
- Email: `ragheed@aqliya.com`

#### Link Groups

**المنصة:**
- أنظمة عقلية (`/platform`)
- القطاعات (`/industries`)
- مركز الإثبات (`/proof`)
- الحوكمة (`/governance`)

**الشركة:**
- عن عقلية (`/about`)
- تواصل معنا (`/contact`)
- البريد الإلكتروني (`mailto:ragheed@aqliya.com`)

**الموارد:**
- عرض تفاعلي — AuditOS (`/auditos`)
- جلسة تشخيص (`/contact`)

**نماذج التشغيل:**
- سحابة عقلية — متاحة الآن
- خوادم خاصة — قيد التخطيط والتحضير
- بيئة معزولة — مستقبلية

Copyright: `© {year} AQLIYA. جميع الحقوق محفوظة.`#### Notes for implementation
- Footer group "التفعيل والاستكشاف" renamed to "ابدأ الآن" for clarity
- Footer link "ناقش حالة استخدام مؤسسية" shortened to "ناقش حالة استخدام"
- Footer deployment labels updated:
  - "سحابة عقلية — متاح الآن" → "سحابة عقلية — متاحة الآن"
  - "خوادم خاصة — قيد التطوير" → "خوادم خاصة — قيد التخطيط والتحضير"
  - "بيئة معزولة — استراتيجي" → "بيئة معزولة — مستقبلية"
- Brand description updated from "سحابة متاحة الآن. خوادم خاصة ومعزولة قيد التطوير" to "السحابة متاحة الآن. الخوادم الخاصة قيد التخطيط والتحضير."

---

### Header

**Source file:** `src/components/layout/site-header.tsx`
**Rewrite status:** Ready for implementation

#### Navigation Labels

| Arabic | Target |
|---|---|
**NOTICE: This section describes the OLD header. Current live header uses:**

| Arabic | Target |
|---|---|
| المنصة | `/platform` |
| القطاعات | `/industries` |
| الإثبات | `/proof` |
| الحوكمة | `/governance` |
| عن عقلية | `/about` |

CTA: `احجز جلسة تشخيص` → `/contact`

> **Archive note:** The old nav (above with /products, /how-we-work, /custom-product) has been replaced in the live site with the platform-first nav above. This section preserved for reference.

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
| Docker/Kubernetes private deployment claim | `متوفر على Docker أو Kubernetes` | `قيد التخطيط والتحضير — تشغيل عقلية داخل البنية التحتية للمؤسسة` | **Fixed** |
| Air-Gapped described too strongly | `بيئة معزولة بدون أي اتصال بالانترنت (air-gapped) للمؤسسات ذات متطلبات أمنية صارمة. كل البيانات والمعالجة محلية بالكامل.` | `نموذج مستقبلي للمؤسسات ذات المتطلبات الأمنية العالية. يعتمد على اكتمال نموذج الخوادم الخاصة أولاً.` | **Fixed** |
| DecisionOS status inconsistency | `نظام قائم` badge on `/products` and `متاح للتفعيل` on `/products/decision` | Unified badge: `نظام مجاور — نشط` across all surfaces | **Fixed** |
| Mind The Future sidebar subtitle | `Mind The Future` | `منصة ذكاء مؤسسي خاص ومحكوم` | **Fixed** |
| Duplicate product copy | Product descriptions duplicated verbatim across homepage, products page, and product pages | Accept as-is for now; extracted to Section 6 (Copy Constants) for future deduplication | **Identified** |
| English-only output labels | DecisionOS: `Decision Brief`, SalesOS: `ICP Profiles`, SimulationOS: `Scenario Report` | All translated to Arabic: `موجز القرار`, `ملف العميل المثالي`, `تقرير السيناريو` | **Fixed** |
| SalesOS overstatement risk | `ينظم رحلة المبيعات من تعريف العميل المثالي إلى التأهيل` | `يستكشف كيفية تنظيم رحلة المبيعات من تأهيل العملاء` — uses future/conditional tone | **Fixed** |
| AQLIYA reduced to AuditOS risk | Homepage impact metrics list "06 lines starting from AuditOS" | Updated to `مسارات تشغيل` instead of `خطوط تشغيل` to avoid miscounting | **Softened** |
| 6 operating lines ambiguity | Lists AuditOS, LocalContentOS, DecisionOS, SalesOS, SimulationOS as "06" without clear criteria | Clarified as `مسارات تشغيل` that include multiple system lines at different maturity levels | **Clarified** |
| CTA clarity: "ناقش حالة استخدام مؤسسية" | Homepage: `ناقش حالة استخدام مؤسسية` → `/custom-product` | Changed to `ناقش حالة استخدام مؤسسية` leading to `/custom-product` — label kept but target surface needed | **Preserved** (CTA to form page is acceptable) |
| Footer deployment wording | `خوادم خاصة — قيد التطوير` / `بيئة معزولة — استراتيجي` | `خوادم خاصة — قيد التخطيط والتحضير` / `بيئة معزولة — مستقبلية` | **Fixed** |
| "Engagement Start" English label | Contact page eyebrow: `Engagement Start` | Changed to Arabic: `بداية التشغيل` | **Fixed** |
| "6 operating lines" metric | Impact metric: `06 خطوط تشغيل` listing 5 products | Updated to `عدة مسارات تشغيل` with clearer scope description | **Clarified** |
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
| cloudBody | نسخة سحابية للخصائص الحالية المتاحة، مع تحديثات تشغيلية ونسخ احتياطي. | Available |
| privateTitle | خوادم خاصة | قيد التخطيط والتحضير |
| privateBody | تشغيل عقلية داخل البنية التحتية للمؤسسة مع قاعدة بيانات محلية وتحكم كامل. قيد التخطيط والتحضير، وليس حزمة إنتاجية متاحة حاليًا. | Strategic/future |
| airGappedTitle | بيئة معزولة | مستقبلي |
| airGappedBody | نموذج مستقبلي للمؤسسات ذات المتطلبات الأمنية العالية. | Strategic/future |

### `productStatusCopy`

| Product | Arabic Status Badge | English Status Badge |
|---|---|---|
| audit | أول تطبيق مُثبت — جاهز للتجربة | First proof product — pilot-ready |
| localContent | استراتيجي — المنتج الثاني — قيد التخطيط | Strategic second product — in planning |
| decision | نظام مجاور — نشط | Adjacent active system |
| sales | نموذج أولي — مستقبلي | Prototype — future |
| simulation | مفهوم — مستقبلي | Marketing concept — future |
| custom | يُفعّل حسب نطاق المؤسسة | Activated per institutional scope |

### `productCardsCopy`

Each product card has: title, problem, system, output, flow, note, maturity, href — these are duplicated across homepage, products page, and individual product pages. They should be defined once and imported.

Products: AuditOS, DecisionOS, LocalContentOS, SalesOS, SimulationOS, CustomSystems.

### `ctaCopy`

| Key | Arabic Label | Target |
|---|---|---|
| exploreProducts | استكشف أنظمة المنصة | `/platform#capabilities` |
| watchAuditOS | شاهد AuditOS — عرض تفاعلي | `/auditos` |
| designSystem | احجز جلسة تشخيص | `/contact` |
| discussActivation | ناقش تفعيل النظام | `/contact` |
| discussFuture | ناقش التفعيل المستقبلي | `/custom-product` |
| discussUseCase | ناقش حالة استخدام | `/custom-product` |
| contactUs | تواصل معنا | `/contact` |

### `navigationCopy`

| Arabic Label | Route |
|---|---|
| الرئيسية | `/` |
| المنصة | `/platform` |
| القطاعات | `/industries` |
| الإثبات | `/proof` |
| الحوكمة | `/governance` |
| عن عقلية | `/about` |
| تواصل معنا | `/contact` |

---

## 7. Implementation Mapping for Later

> **Platform-first update:** The /products/* pages and /custom-product route are no longer in the primary marketing navigation. Implementation priority should shift to /platform, /industries, /proof, /governance, and /contact. Product-specific pages are preserved in code for direct access and reference but should not be the primary marketing surface.

> **Platform-first update:** The /products/* pages and /custom-product route are no longer in the primary marketing navigation. Implementation priority should shift to /platform, /industries, /proof, /governance, and /contact. Product-specific pages are preserved in code for direct access and reference but should not be the primary marketing surface.

| Source File | Sections to Update | Priority | Notes |
|---|---|---|---|
| `src/app/(marketing)/page.tsx` | Hero impact metrics, deployment cards (Docker/Kubernetes fix, Air-Gapped fix), product cards status badges, DecisionOS badge, CTA labels | **High** | Most changes concentrated here |
| `src/app/(marketing)/products/page.tsx` | DecisionOS badge, product descriptions alignment | **Low** | ARCHIVED — route exists but not in primary nav; /platform is now the primary page |
| `src/app/(marketing)/products/decision/page.tsx` | Badge `متاح للتفعيل` → `نظام مجاور — نشط`, output labels translation | **High** | Taxonomy alignment |
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
- [x] **DecisionOS status aligned with v1.1 taxonomy** — Badge changed to `نظام مجاور — نشط`; description updated to reflect adjacent system status
- [x] **Arabic-first copy polished** — English-only output labels translated; "Engagement Start" converted to Arabic; "Mind The Future" replaced; "One Core. Multiple Systems." → Arabic
- [x] **CTAs consistent** — Standardized across all surfaces; primary/secondary hierarchy maintained
- [x] **Navigation aligned** — Header labels polished; footer groups renamed; sidebar subtitle fixed
- [x] **Footer aligned** — Deployment wording updated; brand description refined
- [x] **Metadata aligned** — Titles and descriptions verified against v1.1 positioning
- [x] **Platform-first navigation** — Header nav updated to المنصة / القطاعات / الإثبات / الحوكمة / عن عقلية
- [x] **New marketing pages documented** — /industries, /proof, /governance added as new page sections
- [x] **All product routes marked as archived** — /products/* pages exist in code but removed from primary marketing nav
- [x] **CTAs aligned with live site** — Primary CTA: احجز جلسة تشخيص → /contact; platform CTA: استكشف أنظمة المنصة → /platform#capabilities
- [x] **Platform-first navigation** — Header nav updated to المنصة / القطاعات / الإثبات / الحوكمة / عن عقلية
- [x] **New marketing pages documented** — /industries, /proof, /governance added as new page sections
- [x] **All product routes marked as archived** — /products/* pages exist in code but removed from primary marketing nav
- [x] **CTAs aligned with live site** — Primary CTA: احجز جلسة تشخيص → /contact; platform CTA: استكشف أنظمة المنصة → /platform#capabilities
- [x] **Trust principle preserved** — `الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.` present in all key marketing surfaces

---

## 9. Final Adoption Notes

### Recommended decision

Use this v3 hybrid document as the implementation source of truth for website copy. It keeps the stronger OpenCode structure while applying stricter public-claims discipline and vetted Claude marketing enhancements.

### Must remain unchanged during implementation

- Do not claim Private / On-Prem is available as a production package.
- Do not claim Air-Gapped is implemented.
- Do not claim Local AI runtime, AQLIYA Studio, Institutional Memory, or Model Governance are implemented.
- Do not reintroduce Docker / Kubernetes as available deployment claims.
- Do not describe AQLIYA as AuditOS only, SaaS only, or an AI chatbot.
- Keep AuditOS as first proof product.
- Keep LocalContentOS as second strategic product.
- Keep DecisionOS as an adjacent active system, not the primary product line.
- Keep SalesOS as prototype/future and SimulationOS as concept/future.

### Implementation recommendation

Implement in two safe passes:

1. **Copy safety pass:** deployment wording, product status badges, sidebar/footer identity, English-only labels.
2. **Content polish pass:** homepage hero, products page, product detail pages, about/contact refinements.

After implementation, run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```


---

## 10. Claude Marketing Enhancements — Used and Rejected

### Used Safely
- Stronger hero support line: `الذكاء لا يقرر. يساعد. الإنسان يقرر. والدليل يحكم.`
- No-black-box narrative (new section `ليست صناديق سوداء`)
- Trust principle as architectural commitment (expanded explanation)
- Stronger CTA hierarchy (`تحدث إلى متخصص` replaces generic labels)
- About page storytelling (`وُجدت عقلية لأن المؤسسات لا تحتاج ذكاءً أسرع فقط. تحتاج ذكاءً يمكن مساءلته.`)
- Generic AI tools vs AQLIYA comparison angle (`معظم أدوات الذكاء تعطي إجابة. عقلية تبني مسارًا.`)

### Rejected
- Unsupported performance metrics (e.g., "70-80% reduction in audit time", "100% Human-Approved")
- KYC / AML / SAMA / PDPL claims
- On-Prem as currently available (Claude: `متوقع الإتاحة [القريب]`)
- Air-Gapped as implemented
- Local AI runtime as available
- AQLIYA Studio as available
- Real-time continuous audit claims (`اكتشاف الانحرافات في الوقت الفعلي`)
- 24/7 support / SLA / security claims
- New routes not present in the app (`/decision`, `/localcontent`)
- Active development language for LocalContentOS or SalesOS (Claude: `قيد التطوير النشط`, `متوقع: الربع [X]`)
- Specific availability dates or quarters
- Claim that LocalContentOS handles "regulator requirements" without evidence
- "Six system lines" frame that miscounts prototype/future products

---

*End of v3 hybrid rewrite. No source code files were modified or created besides this document.*
