# AQLIYA Website Content Extract

> **Warning:** This is a CONTENT EXTRACTION document only. Do not use for redesign, rewriting, or UI changes. Preserve current copy exactly.

---

## 1. Extraction Metadata

| Field | Value |
|---|---|
| **Date/time of extraction** | 2026-05-15 22:30 AST |
| **Branch name** | `main` |
| **Current commit hash** | `e276ac68750d9ce4c3115d90f28cb4b217144c77` |
| **Working tree uncommitted changes** | Yes — modified files in `docs/`, `src/app/(marketing)/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/components/audit/layout/audit-sidebar.tsx`, `messages/`, `middleware.ts`, `next.config.mjs`, `prisma/`, `scripts/`, test files, and many untracked docs/ and config files. No source code changes to marketing pages were made. |
| **Files scanned** | 28 source files (all public-facing pages, layouts, shared components) |
| **Files skipped with reason** | `src/components/forms/custom-product-form.tsx` — form internal labels only (developer/form text, included where visible to users); `src/app/audit/page.tsx` (lines 160+) — internal workspace copy (KPI labels, module-specific text) included in summary; `src/components/enterprise/*` — extracted via usage in pages; `src/lib/*` — internal logic only |

---

## 2. Official Positioning Guardrails

These rules MUST protect any future copy rewrite. Extracted from `docs/official/aqliya-vision-v1.1.md`, `aqliya-implementation-rules-v1.1.md`, and `AGENTS.md`.

### What AQLIYA IS

- A **Private Governed Institutional Intelligence Platform**
- A multi-product intelligence company
- A builder of custom institutional systems (via AQLIYA Studio)
- A Cloud + Private/On-Prem dual-deployment platform
- A governance-first, evidence-based, human-reviewed AI system
- Platform parent company above all products

### What AQLIYA IS NOT

- NOT an AI chatbot
- NOT SaaS only
- NOT AuditOS only
- NOT a CRM
- NOT a generic workflow tool

### Product Boundaries

| Priority | Product | Description | Status |
|---|---|---|---|
| 1 | **AuditOS** | Governed financial & audit intelligence | Active (primary, pilot-ready) |
| 2 | **LocalContentOS** | Local content measurement & governance | Strategic (second product) |
| 3 | **AQLIYA Core / Studio** | Custom systems builder layer | Platform foundation |
| 4 | SalesOS | Governed revenue intelligence | Future |
| 5 | LocalContactOS | Institutional relationship intelligence | Future |
| 6 | DecisionOS | Executive decision governance | Active (adjacent system) |
| 7 | RiskOS | Internal risk intelligence | Future |
| 8 | ComplianceOS | Regulated compliance management | Future |
| 9 | LegalOS | Legal intelligence assistant | Future |
| 10 | GovOS | Government institutional intelligence | Future |

### Claims That Must NOT Be Made Unless Implemented

- On-Prem deployment package (not yet implemented)
- Air-Gapped mode (not yet implemented)
- Local AI runtime (not yet implemented)
- AQLIYA Studio (not yet implemented)
- Institutional Memory engine (not yet implemented)
- Model Governance registry (not yet implemented)
- LocalContentOS workspace (not yet implemented — marketing page only)
- SalesOS backend (not yet implemented — shell only)
- SSO/LDAP/AD integration (not yet implemented)
- SIEM integration (not yet implemented)

### Trust Principle

> AI assists. Humans decide. Evidence governs.
> الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.

---

## 3. Website Route Map

| Route / Surface | Source File | Purpose | Notes |
|---|---|---|---|
| `/` (homepage) | `src/app/(marketing)/page.tsx` | Platform homepage — hero, positioning, product cards, CTAs | Fully bilingual (Arabic-first, English secondary) |
| `/products` | `src/app/(marketing)/products/page.tsx` | Product family listing — all system lines | Arabic-first with English product names |
| `/products/audit` | `src/app/(marketing)/products/audit/page.tsx` | AuditOS product detail page | Full marketing page with comparison table |
| `/products/decision` | `src/app/(marketing)/products/decision/page.tsx` | DecisionOS product detail page | Marketing page with governance framing |
| `/products/local-content` | `src/app/(marketing)/products/local-content/page.tsx` | LocalContentOS product detail page | Strategic — notes "planning phase" |
| `/products/sales` | `src/app/(marketing)/products/sales/page.tsx` | SalesOS product detail page | Prototype — notes "no backend yet" |
| `/products/simulation` | `src/app/(marketing)/products/simulation/page.tsx` | SimulationOS product detail page | Future/marketing only |
| `/about` | `src/app/(marketing)/about/page.tsx` | About AQLIYA — vision, beliefs, what makes it different | Long-form institutional positioning |
| `/how-we-work` | `src/app/(marketing)/how-we-work/page.tsx` | Methodology — 8-phase engagement process | Detailed operational methodology |
| `/custom-product` | `src/app/(marketing)/custom-product/page.tsx` | Custom system design request | Form with system categories |
| `/contact` | `src/app/(marketing)/contact/page.tsx` | Contact page with form | Three-pathway CTA structure |
| `/auditos` | `src/app/auditos/page.tsx` | AuditOS guided demo (public, mock data) | Interactive demo with mock data |
| `/login` | `src/app/login/page.tsx` | Login page | Minimal — credentials form |
| `/` (dashboard root) | `src/app/(dashboard)/layout.tsx` | Dashboard layout (header + sidebar) | Authenticated workspace |
| `/sales` | `src/app/sales/page.tsx` | SalesOS prototype dashboard | Mock data dashboard |
| `/audit` | `src/app/audit/page.tsx` | AuditOS workspace dashboard | Live data dashboard |
| `404 Not Found` | `src/app/not-found.tsx` | 404 error page | Static |
| `Access Denied` | `src/app/access-denied/page.tsx` | 403 error page | Static |
| `Loading` | `src/app/loading.tsx` | Global loading state | Minimal |
| `robots.txt` | `src/app/robots.ts` | SEO — robots configuration | Disallows API, workspace routes |
| `sitemap.xml` | `src/app/sitemap.ts` | SEO — sitemap | Lists all public routes |
| `manifest.json` | `src/app/manifest.ts` | PWA manifest | Brand info |

---

## 4. Full Extracted Website Copy

---

### Platform Homepage

**Route:** `/`
**Source file:** `src/app/(marketing)/page.tsx`
**Purpose:** Primary marketing homepage for the AQLIYA platform

#### Metadata

- Title: `AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم`
- Description: `عقلية منصة ذكاء مؤسسي خاص ومحكوم: تقدم خطوط أنظمة مؤسسية ذكية مع حوكمة القرار، ربط الأدلة، المراجعة البشرية، سير العمل، الصلاحيات، وسجل التدقيق. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.`
- OpenGraph title: `AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم`
- OpenGraph description: `عقلية منصة ذكاء مؤسسي خاص ومحكوم مع حوكمة مدمجة، ربط الأدلة، مراجعة بشرية، وسير عمل مؤسسي. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.`

#### Hero / Main Section

**Badge:** `منصة ذكاء مؤسسي خاص ومحكوم`
**Brand line:** `AQLIYA`
**H1:** `بنية مؤسسية تجعل الذكاء مفيدًا، مفهومًا، ومحكومًا`
**Subtext:** `عقلية ليست صفحة دردشة للمؤسسة، وليست طبقة AI منفصلة فوق الفوضى. هي منصة تشغيل تربط البيانات، القواعد، الصلاحيات، الأدلة، والمراجعة داخل مسار واحد يمكن الوثوق به.`

**Promise points:**
1. `ذكاء يعمل داخل نطاق المؤسسة لا خارجه`
2. `مسارات تشغيل تربط الإدخال، المراجعة، والاعتماد في بنية واحدة`
3. `مخرجات قابلة للفهم والمراجعة بدل إجابات سريعة بلا سياق`

**Trust principle box:**
- Label: `مبدأ الثقة:`
- Text: `الذكاء يساعد. الإنسان يقرر. الدليل يحكم.`

**Impact metrics:**
1. Value: `01` | Label: `نواة مشتركة` | Detail: `منطق حوكمة واحد يمكن البناء فوقه عبر أكثر من خط نظام`
2. Value: `06` | Label: `خطوط تشغيل` | Detail: `تبدأ من AuditOS وتمتد إلى المحتوى المحلي والقرار والمبيعات والمحاكاة`
3. Value: `100%` | Label: `مبدأ التتبع` | Detail: `كل مخرج يجب أن يبقى مربوطًا بالبيانات، والمراجعة، وصاحب الصلاحية`

#### CTAs (Hero)

| Label | Target | Source |
|---|---|---|
| استكشف خطوط عقلية | `/products` | `src/app/(marketing)/page.tsx:172` |
| شاهد AuditOS كأول تطبيق | `/auditos` | `src/app/(marketing)/page.tsx:176` |
| ناقش حالة استخدام مؤسسية | `/custom-product` | `src/app/(marketing)/page.tsx:180` |

#### Section: "عقلية ليست..." (What AQLIYA Is Not)

**Eyebrow:** `الوضوح الموضعي`
**Title:** `عقلية ليست...`
**Description:** `بعض الأشياء التي عقلية لا تفعلها. هذا يساعد في فهم ما هي في الواقع.`

Three cards:
1. Title: `ليست صفحة دردشة` — Body: `صفحات الدردشة العامة تعطيك إجابات. عقلية تعطيك مسارات مراجعة محكومة وموثقة تربط الإجابة بالبيانات والسياق والموافقات.`
2. Title: `ليست SaaS فقط` — Body: `عقلية ليست حصرية على السحابة. نقدم نموذج تشغيل مزدوج: سحابة متاحة الآن، وخوادم خاصة ومعزولة قيد التطوير للمؤسسات الحساسة.`
3. Title: `ليست منتج واحد فقط` — Body: `بعض المؤسسات تبحث عن أداة واحدة مثل AuditOS. عقلية نواة تشغيلية تسمح ببناء أكثر من خط نظام فوقها حسب احتياج المؤسسة.`

#### Section: Deployment Models

**Eyebrow:** `نماذج التشغيل`
**Title:** `السحابة متاحة الآن. الخوادم الخاصة والمعزولة قادمة`
**Description:** `نقدم خيارات تشغيل مختلفة حسب احتياجات المؤسسة الأمنية والتشغيلية. كل نموذج يحافظ على نفس منطق الحوكمة والتتبع والأدلة.`

Three cards:
1. Title: `السحابة` | Badge: `متاح الآن` — Body: `إصدار سحابة متكامل مع كل الخصائص والتحديثات التلقائية والنسخ الاحتياطي. مثالي للمؤسسات التي تفضل عدم إدارة البنية التحتية.`
2. Title: `خوادم خاصة` | Badge: `قريبًا` — Body: `تثبيت على خوادمك الخاصة مع كل خصائص الحوكمة والتحكم. متوفر على Docker أو Kubernetes. يسمح بالتحكم الكامل والتعديلات المؤسسية.`
3. Title: `معزولة تماما` | Badge: `استراتيجي` — Body: `بيئة معزولة بدون أي اتصال بالانترنت (air-gapped) للمؤسسات ذات متطلبات أمنية صارمة. كل البيانات والمعالجة محلية بالكامل.`

#### Section: The Operational Gap

**Eyebrow:** `الفجوة التشغيلية`
**Title:** `المشكلة ليست في غياب الذكاء فقط، بل في غياب النظام الذي يحكمه`
**Description:** `حين تعمل البيانات في مكان، والموافقات في مكان، والمراجعة في مكان آخر، تصبح المخرجات سريعة لكنها ضعيفة الثقة. عقلية تعيد جمع المسار كاملًا داخل منطق تشغيلي واحد.`

**Before (problem):**
- `مخرجات ذكاء غير مرتبطة بسياق العمل`
- `اعتماد عبر البريد والذاكرة`
- `موافقات غير موثقة`
- `أدلة منفصلة عن القرار`
- `صلاحيات لا تحكم المسار كاملًا`

**After (solution):**
- `سير عمل محكوم`
- `مخرجات قابلة للتتبع`
- `قرارات موثقة`
- `أدلة مربوطة بكل خطوة`
- `وضوح تشغيلي قابل للمراجعة`

#### Section: AQLIYA Intelligence Core

**Eyebrow:** `AQLIYA Intelligence Core`
**Title:** `نواة تشغيل واحدة بدل مشاريع متفرقة وأدوات معزولة`
**Description:** `النواة المشتركة في عقلية لا تعني إعادة تسمية مجموعة خصائص تقنية. هي طبقة تشغيل مؤسسي تجعل كل خط نظام جديد يبنى فوق نفس منطق الحوكمة، لا من الصفر.`

**Core engine items (Arabic | English):**
| Arabic | English |
|---|---|
| تنسيق الذكاء | AI Orchestration |
| الحوكمة | Governance Engine |
| سير العمل | Workflow Engine |
| ربط الأدلة | Evidence Graph |
| الصلاحيات | RBAC / Permissions |
| سجل التدقيق | Audit Logs |
| التقارير | Reporting Engine |

**Impact sub-section:** Label: `الأثر التشغيلي`
Title: `بدل شراء ذكاء منفصل، تبني المؤسسة قدرة تشغيلية متكررة`
Body: `هذا يعني أن كل نطاق جديد لا يبدأ من سؤال: أي أداة نضيف؟ بل من سؤال: كيف نُدخل هذا النطاق داخل نفس قواعد البيانات، والمراجعة، والصلاحيات، وسلسلة الاعتماد؟`

#### Section: Workflow Chain

**Eyebrow:** `سلسلة التشغيل`
**Title:** `من البيانات إلى القرار عبر مسار مفهوم ومراجع`
**Description:** `في عقلية، القيمة لا تأتي من الإجابة نفسها فقط، بل من الطريق الذي أنتجها: من أين جاءت البيانات، من راجعها، وما الذي اعتمدها، وما الذي يمكن الرجوع إليه بعد ذلك.`

**Flow steps:** `البيانات` → `سير العمل` → `الأدلة` → `المراجعة` → `الاعتماد` → `المخرجات`

#### Section: Custom Systems Activation

**Eyebrow:** `التفعيل المؤسسي`
**Title:** `وحين لا تكفي الخطوط الجاهزة، يمكن بناء مسارك الخاص فوق النواة نفسها`
**Description:** `بعض المؤسسات تحتاج ما هو أبعد من منتج جاهز. لذلك تسمح عقلية بتفعيل نظام أو مسار مؤسسي مخصص مع الحفاظ على نفس منطق الحوكمة والتتبع والمراجعة.`

**CTA:** `صمّم نظامك المؤسسي` → `/custom-product`

#### Section: Product Family

**Eyebrow:** `عائلة المنتجات`
**Title:** `كل خط نظام يعالج فجوة تشغيلية محددة داخل المؤسسة`
**Description:** `هذه ليست صفحات منتجات عامة. كل خط نظام في عقلية يبدأ من مشكلة مؤسسية واضحة، ثم يحولها إلى تدفق عمل محكوم ومخرج قابل للمراجعة والتوسع.`

**Product cards:**

**AuditOS**
- Title: `AuditOS | أول تطبيق مُثبت على عقلية`
- Problem: `بيانات مالية متفرقة، تصنيفات يدوية، أدلة غير مرتبطة، ومراجعة يصعب تتبعها.`
- System: `يبني مسار مراجعة وتدقيق محكوم يربط البيانات المالية بالتصنيف، الأدلة، الملاحظات، المراجعة، والاعتماد.`
- Output: `مخرجات مراجعة منظمة وقابلة للتتبع من المصدر إلى القرار البشري النهائي.`
- Flow: `بيانات` → `تصنيف` → `مخرجات` → `أدلة` → `مراجعة`
- Note: `أول تطبيق مُثبت على AQLIYA Intelligence Core، ويُظهر كيف يتحول الذكاء المالي إلى مسار محكوم وقابل للمراجعة.`
- Maturity: `أول تطبيق مُثبت` | Status: `active`

**LocalContentOS**
- Title: `LocalContentOS | المنتج الاستراتيجي الثاني ضمن عقلية`
- Problem: `بيانات موردين، إنفاق، التزام، وتصنيفات موزعة بين فرق ومصادر مختلفة.`
- System: `يوحّد قياس المحتوى المحلي عبر ربط الموردين بالإنفاق، التصنيف، نسب الالتزام، الفجوات، ومسارات التتبع.`
- Output: `رؤية مؤسسية أوضح لمؤشرات المحتوى المحلي وجاهزية القرارات الشرائية.`
- Flow: `موردون` → `إنفاق` → `تصنيف` → `فجوات` → `مؤشرات`
- Note: `المنتج الاستراتيجي الثاني ضمن عقلية، موجه لسوق المحتوى المحلي السعودي، ويبنى على AQLIYA Intelligence Core.`
- Maturity: `استراتيجي — المنتج الثاني` | Status: `strategic`

**DecisionOS**
- Title: `DecisionOS | حوكمة القرار التنفيذي`
- Problem: `قرارات مهمة تُبنى على نقاشات متفرقة، ملفات متعددة، ومعايير غير موحدة.`
- System: `يحوّل القرار التنفيذي إلى مسار محكوم: بدائل، معايير، مخاطر، أدلة، توصية، واعتماد.`
- Output: `مذكرة قرار موثقة يمكن مراجعتها وفهم أسبابها قبل الاعتماد.`
- Flow: `مشكلة` → `بدائل` → `معايير` → `مخاطر` → `توصية`
- Note: `خط نظام لحوكمة القرار التنفيذي، يُفعّل ضمن نطاق المؤسسة ويبنى على AQLIYA Intelligence Core.`
- Maturity: `متاح للتفعيل` | Status: `available`

**SalesOS**
- Title: `SalesOS | خط نظام الذاكرة التجارية والمبيعات`
- Problem: `فرص غير مؤهلة، أولويات غير واضحة، متابعة عشوائية، وتعلم ضعيف من الحملات.`
- System: `ينظم تأهيل الفرص، ترتيبها، وضبط المتابعة داخل مسار مبيعات محكوم ومبني على الذاكرة المؤسسية.`
- Output: `مسار مبيعات أوضح يربط العملاء المحتملين بالأولوية، المتابعة، والتعلم المؤسسي.`
- Flow: `ICP` → `تأهيل` → `ترتيب` → `تواصل` → `متابعة` → `تعلم`
- Note: `خط نظام مستقبلي ضمن عقلية — نموذج أولي بلوحة معلومات ثابتة، بدون خلفية تشغيلية بعد.`
- Maturity: `نموذج أولي — مستقبلي` | Status: `prototype`

**SimulationOS**
- Title: `SimulationOS | خط نظام محاكاة السيناريوهات`
- Problem: `قرارات تُنفذ قبل اختبار أثرها على التكلفة، المخاطر، الأداء، أو النتائج.`
- System: `يربط المدخلات بالافتراضات والسيناريوهات والمقارنات قبل التنفيذ داخل مسار محاكاة قابل للمراجعة.`
- Output: `رؤية مقارنة تساعد الإدارة على فهم البدائل قبل اعتماد القرار أو تنفيذ الأثر.`
- Flow: `مدخلات` → `افتراضات` → `سيناريوهات` → `أثر` → `مقارنة`
- Note: `خط نظام مستقبلي ضمن عقلية — يُعرَض حاليًا كمفهوم تسويقي لحين تطوير النموذج التشغيلي.`
- Maturity: `مستقبلي` | Status: `future`

#### Section: Proof Product — AuditOS (Homepage Callout)

**Badges:** `أول تطبيق مُثبت` + `جاهز للتجربة`
**H2:** `AuditOS — أول منتج مُثبت على AQLIYA Intelligence Core`
**Body:** `AuditOS هو أول تطبيق يُظهر كيف تتحول نواة عقلية إلى خط نظام مالي محكوم. يعالج مسار المراجعة المالية بالكامل: من ميزان المراجعة الخام إلى القوائم المالية، الإيضاحات، الأدلة، الملاحظات، المراجعة البشرية، والاعتماد النهائي.`

**Three sub-cards:**
1. Label: `المسار` | Body: `ميزان المراجعة ← ربط الحسابات ← القوائم المالية ← الإيضاحات ← الأدلة ← المراجعة ← الاعتماد ← التصدير`
2. Label: `الحوكمة` | Body: `كل مخرج مربوط بالدليل، كل خطوة تحتاج مراجعة بشرية، كل اعتماد مسجل في سجل التدقيق.`
3. Label: `المخرجات` | Body: `قوائم مالية، إيضاحات، توصيات إعادة تصنيف، تقارير الأدلة، مسار مراجعة كامل.`

**CTAs:**
| Label | Target |
|---|---|
| شاهد AuditOS — عرض تفاعلي | `/auditos` |
| استكشف AuditOS | `/products/audit` |

#### Section: Strategic Product — LocalContentOS (Homepage Callout)

**Badges:** `المنتج الاستراتيجي الثاني` + `مستقبلي — قيد التخطيط`
**H2:** `LocalContentOS — المنتج الاستراتيجي الثاني لسوق المحتوى المحلي`
**Body:** `LocalContentOS يستهدف قياس المحتوى المحلي وإدارة الموردين والإنفاق والالتزام داخل مسار حوكمة موحد. صُمم خصيصًا للسوق السعودي، وسيُبنى على AQLIYA Intelligence Core بنفس منطق الحوكمة والأدلة والمراجعة البشرية.`

**Three sub-cards:**
1. Label: `النطاق` | Body: `تصنيف الموردين، تحليل الإنفاق، قياس الالتزام، مؤشرات المحتوى المحلي.`
2. Label: `السوق` | Body: `موجه للمؤسسات السعودية التي تحتاج قياس المحتوى المحلي والتزام الموردين وفق متطلبات هيئة المحتوى المحلي.`
3. Label: `الحالة` | Body: `قيد التخطيط الاستراتيجي — يُعرَض حاليًا كصفحة تعريفية لحين بدء التطوير.`

**CTAs:**
| Label | Target |
|---|---|
| استكشف LocalContentOS | `/products/local-content` |
| ناقش التفعيل المستقبلي | `/custom-product` |

#### Section: Trust & Proof Chain

**Badge:** `الثقة والإثبات`
**H2:** `الثقة في عقلية لا تُبنى على الوعود، بل على القدرة على الرجوع لكل خطوة`

**Principle box:**
- Label: `المبدأ الأساسي:`
- Text: `الذكاء يساعد. الإنسان يقرر. الدليل يحكم.`

**Body:** `عندما يسأل المدير أو المدقق أو صاحب الصلاحية: كيف وصلنا إلى هذا المخرج؟ يجب أن تكون الإجابة موجودة داخل النظام نفسه، لا في الذاكرة ولا في سلاسل البريد.`

#### Section: Final CTA

**Badge:** `ابدأ من النطاق`
**H2:** `إذا كانت لديك فجوة تشغيلية معقدة، يمكن تحويلها إلى نظام محكوم قابل للتفعيل`
**Body:** `ابدأ من خط النظام الأقرب إلى نطاقك، أو اطلب جلسة تصميم إذا كنت تحتاج مسارًا مؤسسيًا خاصًا فوق نواة عقلية.`

**CTAs:**
| Label | Target |
|---|---|
| صمّم نظامك المؤسسي | `/custom-product` |
| ناقش تفعيل النظام | `/contact` |

---

### Products Listing Page

**Route:** `/products`
**Source file:** `src/app/(marketing)/products/page.tsx`
**Purpose:** Overview of all AQLIYA system lines

#### Metadata

- Title: `خطوط أنظمة عقلية | AQLIYA`
- Description: `خطوط أنظمة متخصصة مبنية على AQLIYA Intelligence Core، تربط البيانات، سير العمل، الأدلة، والمخرجات داخل مسارات مؤسسية قابلة للمراجعة والاعتماد.`

#### Hero

**Badge:** `عائلة الأنظمة`
**H1:** `خطوط أنظمة تعالج مسارات مؤسسية فعلية`
**Body 1:** `المنتجات تحت عقلية ليست تجميعًا لخدمات عامة، بل خطوط تشغيل متخصصة مبنية على نواة واحدة. كل خط نظام يبدأ من مشكلة حقيقية داخل المؤسسة، ثم يحولها إلى مسار محكوم يمكن تشغيله ومراجعته والتوسع فيه.`
**Body 2:** `بعضها قائم كأول تطبيق واضح مثل AuditOS، وبعضها يُفعّل بحسب نطاق المؤسسة، لكن جميعها تنتمي إلى نفس منطق البناء المؤسسي داخل AQLIYA Intelligence Core.`

#### "Why a product family?" Section

**Label:** `لماذا عائلة أنظمة؟`
**H2:** `نواة واحدة، لكن تطبيقات متعددة بحسب مجال العمل`
**Body:** `بدل بناء نظام مستقل بالكامل لكل فريق أو نطاق، تجمع عقلية طبقة الذكاء، الحوكمة، سير العمل، ربط الأدلة، الصلاحيات، سجل التدقيق، والتقارير في بنية واحدة. هذا يجعل كل خط نظام امتدادًا لقدرة مؤسسية مشتركة، لا مشروعًا منفصلًا جديدًا.`

**Three principles:**
1. `كل خط نظام يبدأ من فجوة تشغيلية محددة لا من وصف عام للذكاء الاصطناعي.`
2. `كل منتج يبقى مربوطًا بنفس منطق الحوكمة والتتبع والمراجعة داخل النواة المشتركة.`
3. `كل مخرج نهائي يجب أن يكون قابلًا للفهم، لا مجرد نتيجة آلية يصعب تفسيرها لاحقًا.`

**Core items:** `تنسيق الذكاء` / `الحوكمة` / `سير العمل` / `ربط الأدلة` / `الصلاحيات` / `سجل التدقيق` / `التقارير`

#### Solution Blocks (alternating)

Each solution has sections: الفجوة الحالية (The Gap) / كيف يعمل النظام (How It Works) / القيمة الناتجة (Value) / المسار التشغيلي (Workflow Path) + CTA `استكشف خط النظام` + `ناقش التفعيل`

**AuditOS:**
- Title: `AuditOS — نظام التدقيق والذكاء المالي`
- Line badge: `أول تطبيق مُثبت` (active)
- Gap: `بيانات مالية متفرقة، تصنيفات يدوية، أدلة غير مرتبطة، ومراجعة يصعب تتبعها.`
- System: `أول تطبيق مُثبت على AQLIYA Intelligence Core، يربط البيانات المالية بالتصنيف، القوائم، الأدلة، الملاحظات، ومسار المراجعة والاعتماد.`
- Output: `مخرجات مراجعة منظمة وقابلة للتتبع من المصدر إلى القرار البشري النهائي.`
- Flow: `بيانات` → `تصنيف` → `مخرجات` → `أدلة` → `مراجعة`

**DecisionOS:**
- Title: `DecisionOS — نظام حوكمة القرارات`
- Line badge: `نظام قائم` (active)
- Gap: `قرارات مهمة تُبنى على نقاشات متفرقة، ملفات متعددة، ومعايير غير موحدة.`
- System: `خط نظام مبني على AQLIYA Intelligence Core يحوّل القرار إلى مسار محكوم: بدائل، معايير، مخاطر، أدلة، توصية، واعتماد.`
- Output: `مذكرة قرار موثقة يمكن مراجعتها وفهم أسبابها قبل الاعتماد.`
- Flow: `مشكلة` → `بدائل` → `معايير` → `مخاطر` → `توصية`

**LocalContentOS:**
- Title: `LocalContentOS — نظام المحتوى المحلي`
- Line badge: `استراتيجي — المنتج الثاني` (strategic)
- Gap: `بيانات موردين، إنفاق، التزام، وتصنيفات موزعة بين فرق ومصادر مختلفة.`
- System: `المنتج الاستراتيجي الثاني ضمن عائلة الأنظمة تحت عقلية، يبنى على AQLIYA Intelligence Core لربط الموردين بالإنفاق، التصنيف، نسب الالتزام، والفجوات.`
- Output: `رؤية واضحة لمؤشرات المحتوى المحلي وأثر القرارات الشرائية.`
- Flow: `موردون` → `إنفاق` → `تصنيف` → `فجوات` → `مؤشرات`

**SimulationOS:**
- Title: `SimulationOS — نظام محاكاة السيناريوهات`
- Line badge: `مستقبلي — تسويقي` (future)
- Gap: `قرارات تُنفذ قبل اختبار أثرها على التكلفة، المخاطر، الأداء، أو النتائج.`
- System: `خط نظام مستقبلي يهدف إلى ربط المدخلات بالافتراضات، السيناريوهات، المقارنة، ودعم القرار قبل التنفيذ.`
- Output: `تقرير مقارنة يساعد الإدارة على فهم الخيارات قبل التنفيذ.`
- Flow: `مدخلات` → `افتراضات` → `سيناريوهات` → `أثر` → `مقارنة`

**SalesOS:**
- Title: `SalesOS — نظام الذاكرة التجارية والمبيعات`
- Line badge: `نموذج أولي — مستقبلي` (prototype)
- Gap: `فرص غير مؤهلة، أولويات غير واضحة، متابعة عشوائية، وتعلم ضعيف من الحملات.`
- System: `نموذج أولي لنظام ذاكرة تجارية محكومة ينظم التأهيل، الترتيب، المتابعة، والتعلم المؤسسي.`
- Output: `مسار مبيعات واضح يربط العملاء المحتملين بالأولوية، الرسالة، والمتابعة.`
- Flow: `ICP` → `تأهيل` → `ترتيب` → `تواصل` → `متابعة` → `تعلم`

**Custom Systems:**
- Title: `Custom Systems — أنظمة مؤسسية مخصصة`
- Line badge: `يُفعّل حسب نطاق المؤسسة` (available)
- Gap: `إجراءات متكررة، ملفات متفرقة، صلاحيات غير واضحة، ومخرجات لا تُدار من مكان واحد.`
- System: `خط نظام مؤسسي يُفعّل فوق AQLIYA Intelligence Core لربط سير العمل، الصلاحيات، البيانات، والمخرجات داخل منطق حوكمة واحد.`
- Output: `نظام تشغيلي خاص بالمؤسسة، قابل للمراجعة، التتبع، والتطوير ضمن نطاقها التشغيلي.`
- Flow: `فهم العمل` → `تصميم النظام` → `ربط البيانات` → `تشغيل المخرجات`

#### AuditOS Note Bar

`AuditOS هو أول تطبيق مُثبت على AQLIYA Intelligence Core، ويمكن تجربته كعرض تفاعلي. LocalContentOS هو المنتج الاستراتيجي الثاني، وبقية الخطوط تُفعّل فوق النواة نفسها بحسب نطاق المؤسسة وجاهزيتها.`

#### Final CTA

**Badge:** `اختر الخط المناسب`
**H2:** `حدّد خط النظام الأقرب إلى نطاقك أو ابدأ من جلسة تصميم مؤسسية`
**Body:** `إذا كانت لديك فجوة تشغيلية واضحة، نساعدك على ربطها بخط النظام المناسب. وإذا كان نطاقك مختلفًا، يمكن تصميم مسار خاص فوق نواة عقلية نفسها.`

**CTAs:**
| Label | Target |
|---|---|
| صمّم نظامك المؤسسي | `/custom-product` |
| ناقش تفعيل النظام | `/contact` |

---

### AuditOS Product Page

**Route:** `/products/audit`
**Source file:** `src/app/(marketing)/products/audit/page.tsx`
**Purpose:** Detailed marketing page for AuditOS

#### Metadata

- Title: `AuditOS — أول منتج مُثبت على AQLIYA | نظام المراجعة والذكاء المالي`
- Description: `AuditOS هو أول منتج مُثبت على AQLIYA Intelligence Core. يحوّل ميزان المراجعة إلى مخرجات مالية محكومة مع ربط الأدلة، المراجعة البشرية، سير العمل، وسجل الاعتماد.`

#### Hero

**Breadcrumb:** `← خطوط عقلية` → `/products`
**Badge:** `AuditOS / أول تطبيق مثبت على نواة عقلية`
**H1:** `من ميزان المراجعة إلى مخرجات مالية قابلة للمراجعة والاعتماد`
**Body:** `AuditOS هو أول تطبيق مُثبت تحت عقلية في مجال التدقيق والذكاء المالي. يبني مسارًا منظمًا فوق AQLIYA Intelligence Core يبدأ من ميزان المراجعة الخام وينتهي إلى القوائم والإيضاحات والأدلة والمراجعة والاعتماد، دون أن يستبدل الحكم المهني.`

**CTAs:**
| Label | Target |
|---|---|
| ناقش تفعيل النظام | `/custom-product` |
| شاهد AuditOS كأول تطبيق | `/auditos` |

**Tags:** `مبني على نواة عقلية · سير عمل محكوم · مخرجات مدعومة بالأدلة · مراجعة بشرية`

#### Insight Callout (Trust Bar)

`AuditOS يوضح كيف تتحول نواة عقلية إلى خط نظام مالي محكوم يربط البيانات، الأدلة، المراجعة، والاعتماد داخل مسار واحد قابل للتتبع.`

#### Problem Section

**Eyebrow:** `المشكلة`
**Title:** `التقارير المالية ما زالت متشظية بين ملفات ومراجعات منفصلة`
**Description:** `ما زالت كثير من فرق المراجعة والمالية تنتقل من ميزان المراجعة إلى القوائم والإيضاحات والأدلة والمراجعة والاعتماد عبر ملفات متفرقة وتعليقات متشتتة. AuditOS يعالج ذلك كخط نظام مبني على AQLIYA Intelligence Core، لا كأداة نصوص أو أتمتة معزولة.`

**Before (problem):**
1. `ملفات Excel متفرقة وتصنيف يدوي للحسابات`
2. `أدلة وملاحظات ونتائج غير مرتبطة بالحسابات المصدر`
3. `سياق المراجعة مفقود بين البريد الإلكتروني والتعليقات`
4. `الاعتماد يعتمد على المتابعة الشخصية والذاكرة`
5. `أدوات الذكاء الاصطناعي تولد نصوصًا دون حوكمة لمسار العمل`

**After (solution):**
1. `مسار عمل محكوم من ميزان المراجعة إلى الاعتماد`
2. `كل مخرج مرتبط بحساب مصدره`
3. `الأدلة والملاحظات مربوطة بكل بند في القوائم`
4. `جاهزية المراجعة واضحة في كل خطوة`
5. `الاعتماد البشري في المركز، والذكاء الاصطناعي طبقة مساعدة`

#### Workflow Section

**Eyebrow:** `مسار العمل`
**Title:** `مسار محكوم من البيانات الخام إلى مخرجات جاهزة للاعتماد`

**Steps:** `ميزان المراجعة` → `ربط الحسابات` → `مسودة القوائم المالية` → `مسودة الإيضاحات` → `متطلبات الأدلة` → `المراجعة` → `الاعتماد`

**Step details:**
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

**Eyebrow:** `الحوكمة`
**Title:** `الذكاء الاصطناعي يساعد. البشر يقررون. الأدلة تحكم.`

**Three governance pillars:**
1. Title: `الذكاء الاصطناعي يساعد` | Body: `مسودات، تصنيفات، اقتراحات، مؤشرات أدلة، تنبيهات النواقص`
2. Title: `البشر يقررون` | Body: `مراجعة، تعديل، اعتماد، رفض، تعديل التصنيفات`
3. Title: `الأدلة تحكم` | Body: `كل مخرج متتبع، كل قرار مسجل، كل اعتماد مرتبط ببوابة`

**Governance features list:**
1. `سجل تتبع كامل من ميزان المراجعة إلى الاعتماد`
2. `مراجعة بشرية مطلوبة عند كل بوابة حوكمة`
3. `تنبيه النواقص قبل بدء المراجعة`
4. `الحكم المهني لا يتم تجاوزه أبدًا`
5. `جاهزية الاعتماد واضحة في كل خطوة`

#### Comparison Table: AuditOS vs Excel vs ChatGPT

**Eyebrow:** `المقارنة`
**Title:** `AuditOS يحكم ما لا تستطيعه Excel و ChatGPT`
**Description:** `Excel يحسب. ChatGPT يكتب. AuditOS يحكم مسار العمل. كأول تطبيق على AQLIYA Intelligence Core، يوفر AuditOS طبقة تشغيل محكومة لا يقدمها أي منهما، مصممة خصيصًا لأعمال المراجعة والتقارير المالية.`

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

**Insight callout:** `AuditOS لا ينافس Excel كآلة حاسبة ولا ChatGPT ككاتب نصوص. إنه يوفر طبقة مسار عمل محكوم لا يقدمها أي منهما — مصممة خصيصًا لأعمال المراجعة والتقارير المالية.`

#### Pilot CTA Section

**Eyebrow:** `ابدأ الآن`
**Title:** `ابدأ بميزان مراجعة واحد. شاهد الفرق.`
**Description:** `ارفع ميزان مراجعة حقيقي واحد. في تجربتك، سينتج AuditOS كل هذه المخرجات ضمن مسار عمل محكوم:`

**Pilot output items:**
1. `ربط الحسابات مع إمكانية التعديل المهني`
2. `مسودة القوائم المالية`
3. `مسودة الإيضاحات والإفصاحات`
4. `قائمة النواقص`
5. `متطلبات الأدلة حسب منطقة الحسابات`
6. `توصيات إعادة التصنيف`
7. `ملاحظات المراجع`
8. `حالة الجاهزية للاعتماد`

#### Final CTA

**Title:** `هل تريد تجربة AuditOS على بيانات مؤسستك؟`
**Description:** `ابدأ من ميزان مراجعة واحد، وشاهد كيف يُفعّل AuditOS مسارًا ماليًا محكومًا فوق AQLIYA Intelligence Core من البيانات إلى المراجعة والاعتماد.`

**CTAs:**
| Label | Target |
|---|---|
| ناقش تفعيل النظام | `/custom-product` |
| شاهد AuditOS كأول تطبيق | `/auditos` |

---

### LocalContentOS Product Page

**Route:** `/products/local-content`
**Source file:** `src/app/(marketing)/products/local-content/page.tsx`
**Purpose:** Marketing page for LocalContentOS (strategic, pre-development)

#### Metadata

- Title: `LocalContentOS — المنتج الاستراتيجي الثاني | AQLIYA`
- Description: `LocalContentOS المنتج الاستراتيجي الثاني ضمن عقلية لقياس المحتوى المحلي وإدارة الموردين والإنفاق والالتزام، مبني على AQLIYA Intelligence Core ويستهدف السوق السعودي.`

#### Hero

**Breadcrumb:** `← العودة إلى خطوط عقلية`
**Badge:** `LocalContentOS / Supplier & Spend Intelligence`
**Badge 2:** `استراتيجي — المنتج الثاني`
**Badge 3:** `قيد التخطيط — يُعرَض حاليًا كصفحة تعريفية`
**H1:** `قياس المحتوى المحلي يجب أن يكون مسارًا تشغيليًا لا تقريرًا متأخرًا`
**Body:** `LocalContentOS هو المنتج الاستراتيجي الثاني ضمن عقلية، يستهدف قياس المحتوى المحلي وإدارة الموردين والإنفاق والالتزام داخل مسار واحد قابل للتتبع. صُمم خصيصًا للسوق السعودي وفق متطلبات هيئة المحتوى المحلي، وسيُبنى على AQLIYA Intelligence Core.`

**CTAs:**
| Label | Target |
|---|---|
| ناقش التفعيل المستقبلي | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

**Disclaimer:** `LocalContentOS حاليًا في مرحلة التخطيط الاستراتيجي. لم يبدأ التطوير التشغيلي بعد.`

#### Before/After Section

**Eyebrow:** `المشكلة والحل`
**Title:** `لماذا تحتاج المؤسسات نظام محتوى محلي واضح؟`
**Description:** `LocalContentOS لا يقدم مؤشرًا منفصلًا فقط، بل يحوّل بيانات الموردين والإنفاق والالتزام إلى خط نظام مؤسسي محكوم ومبني على AQLIYA Intelligence Core.`

**Before:** `بيانات الموردين غير مصنفة` / `تحليل إنفاق يدوي وغير دقيق` / `صعوبة قياس الالتزام` / `مؤشرات محتوى محلي غير واضحة` / `قرارات شراء دون محاكاة الأثر`
**After:** `تصنيف واضح للموردين` / `تحليل إنفاق آلي وقابل للتتبع` / `عرض فجوات الالتزام` / `مؤشرات محتوى محلي دقيقة` / `محاكاة أثر القرارات الشرائية`

#### Governance Section

**Eyebrow:** `الحوكمة والثقة`
**Title:** `كيف يعمل مبدأ الثقة في نظام المحتوى المحلي؟`
**Description:** `الذكاء يساعد بتصنيف الموردين وتحليل الإنفاق. الإنسان يقرر بشأن الالتزام والسياسات. الدليل يحكم من خلال توثيق كامل للموردين والمحاكاة.`

**Three pillars:**
1. Title: `الذكاء يساعد` | Body: `النظام يصنف الموردين، يحلل الإنفاق، يحسب الفجوات والمؤشرات.`
2. Title: `الإنسان يقرر` | Body: `المسؤولون يحددون معايير الالتزام، يختارون الموردين، يوجهون المحاكاة.`
3. Title: `الدليل يحكم` | Body: `كل قرار مرتبط بتقرير كامل، فجوات موثقة، وسجل الالتزام واضح.`

#### Workflow Section

**Eyebrow:** `سير العمل`
**Title:** `كيف يعمل النظام؟`
**Description:** `من الموردين والإنفاق إلى الفجوات والمؤشرات والتقارير، ضمن مسار واحد قابل للمراجعة والاعتماد.`

**Flow:** `الموردين` → `الإنفاق` → `التصنيف` → `فجوة الالتزام` → `المحاكاة` → `التقارير`

#### Outputs Section

**Outputs list:** `تصنيف الموردين` / `تحليل الإنفاق` / `مؤشرات المحتوى المحلي` / `عرض فجوات الامتثال` / `محاكاة تأثير المشتريات` / `تقرير المحتوى المحلي` / `متتبع تحسين الموردين`

#### Customization Section

**Description:** `يُفعّل LocalContentOS حسب نطاق المؤسسة عبر معايير التصنيف، مؤشرات المحتوى المحلي، قوالب التقارير، ومتطلبات الامتثال، مع بقاء منطق الحوكمة والتتبع ثابتًا فوق AQLIYA Intelligence Core.`

#### Use Scenario

**Title:** `جهة حكومية — إدارة المشتريات`
**Before:** `تحليل المحتوى المحلي يتم يدويًا، بيانات الموردين غير محدثة، وصعوبة في قياس أثر قرارات الشراء على الالتزام.`
**After:** `نظام واضح يصنف الموردين، يحلل الإنفاق، يقيس الالتزام، ويحاكي أثر القرارات الشرائية على مؤشرات المحتوى المحلي.`

#### Final CTA

**Title:** `هل تحتاج نظام محتوى محلي لمؤسستك؟`
**Description:** `LocalContentOS في مرحلة التخطيط الاستراتيجي. إذا كنت مهتمًا بالتفعيل المستقبلي، ناقش احتياجك مع فريق عقلية.`

**CTAs:**
| Label | Target |
|---|---|
| ناقش التفعيل المستقبلي | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

---

### DecisionOS Product Page

**Route:** `/products/decision`
**Source file:** `src/app/(marketing)/products/decision/page.tsx`
**Purpose:** Marketing page for DecisionOS

#### Metadata

- Title: `DecisionOS — حوكمة القرارات التنفيذية | AQLIYA`
- Description: `DecisionOS خط نظام لحوكمة القرارات التنفيذية ضمن AQLIYA Intelligence Core، يربط البدائل والمعايير والمخاطر والأدلة ضمن مسار قابل للمراجعة والاعتماد.`

#### Hero

**Breadcrumb:** `← العودة إلى خطوط عقلية`
**Badge:** `DecisionOS / Governed Decisions`
**Badge 2:** `متاح للتفعيل`
**H1:** `حوكمة القرار بدل تركه لمذكرات متفرقة ونقاشات غير قابلة للتتبع`
**Body:** `DecisionOS يحول القرارات المعقدة من نقاشات وملفات متفرقة إلى مسار مؤسسي واضح: مشكلة، بدائل، معايير، مخاطر، أدلة، توصية، واعتماد داخل منطق واحد مبني على AQLIYA Intelligence Core.`

**CTAs:**
| Label | Target |
|---|---|
| ناقش تفعيل النظام | `/custom-product` |
| استكشف خطوط عقلية | `/products` |

#### Before/After Section

**Before:** `قرارات تعتمد على النقاشات فقط` / `ملفات ومبررات غير موثقة` / `تقييم مخاطر غير منهجي` / `صعوبة تتبع سبب القرار` / `اعتمادات غير واضحة`
**After:** `مسار قرار موثق ومنهجي` / `معايير تقييم واضحة وقابلة للقياس` / `ملخص مخاطر مرتبط بالبدائل` / `توصية مدعومة بالأدلة` / `سجل اعتماد كامل`

#### Governance Section

**Three pillars:**
1. `الذكاء يساعد` — `النظام يصنف البدائل، يقيّم المخاطر، يجمع الأدلة، لكنه لا يقرر.`
2. `الإنسان يقرر` — `المتخذ يختار بناءً على معايير واضحة وأدلة موثقة وتقييم مخاطر كامل.`
3. `الدليل يحكم` — `كل قرار مرتبط بمسار تام، معايير معروضة، وسجل اعتماد كامل.`

#### Workflow

**Flow:** `المشكلة` → `البدائل` → `المعايير` → `المخاطر` → `الأدلة` → `التوصية` → `الاعتماد`

#### Outputs

`Decision Brief` / `Decision Memo` / `Comparison Matrix` / `Risk Summary` / `Recommendation Report` / `Approval Log`

#### Final CTA

**Title:** `هل تحتاج نظام قرار واضح لمؤسستك؟`
**CTAs:**
| Label | Target |
|---|---|
| ناقش تفعيل النظام | `/custom-product` |
| استكشف خطوط عقلية | `/contact` |

---

### SalesOS Product Page

**Route:** `/products/sales`
**Source file:** `src/app/(marketing)/products/sales/page.tsx`
**Purpose:** Marketing page for SalesOS (prototype stage)

#### Metadata

- Title: `SalesOS — الذاكرة التجارية والمبيعات | AQLIYA`
- Description: `SalesOS نموذج أولي لنظام الذاكرة التجارية والمبيعات ضمن عقلية، ينظم التأهيل والترتيب والمتابعة والتعلم داخل مسار تجاري محكوم.`

#### Hero

**Badge:** `SalesOS / Commercial Memory`
**Badge 2:** `نموذج أولي — مستقبلي`
**H1:** `المبيعات ليست فقط Pipeline بل ذاكرة تشغيلية يجب أن تتعلم وتتحسن`
**Body:** `SalesOS هو نموذج أولي ضمن عقلية لنظام الذاكرة التجارية والمبيعات. ينظم رحلة المبيعات من تعريف العميل المثالي إلى التأهيل والترتيب والمتابعة والتعلم المؤسسي. حاليًا، يوجد واجهة لوحة معلومات ثابتة بدون خلفية تشغيلية مكتملة.`

**Disclaimer:** `SalesOS حاليًا في مرحلة النموذج الأولي. لا توجد خلفية تشغيلية أو قاعدة بيانات مكتملة بعد.`

**CTAs:** `/custom-product`, `/products`

#### Governance Section

**Three pillars:**
1. `الذكاء يساعد` — `النظام يصنف العملاء وفقاً لـ ICP، يقيّم التأهيل، يوصي بالأولويات.`
2. `الإنسان يقرر` — `الفريق يختار الرسالة والنهج والأولويات بناءً على السياق والحكم الشخصي.`
3. `الدليل يحكم` — `كل تواصل وتفاعل مسجل، والنتائج مرتبطة بالحملة والفريق والعميل.`

#### Workflow

**Flow:** `ICP` → `التأهيل` → `الفلترة` → `التواصل` → `المتابعة` → `التعلم`

#### Outputs

`ICP Profiles` / `Lead Score` / `Opportunity List` / `Campaign Logic` / `Follow-up Tracker` / `Sales Learning Report`

---

### SimulationOS Product Page

**Route:** `/products/simulation`
**Source file:** `src/app/(marketing)/products/simulation/page.tsx`
**Purpose:** Marketing page for SimulationOS (future concept)

#### Metadata

- Title: `SimulationOS — محاكاة السيناريوهات | AQLIYA`
- Description: `SimulationOS مفهوم مستقبلي ضمن عقلية لمحاكاة السيناريوهات ومقارنة أثر القرارات قبل التنفيذ. يُعرَض حاليًا كصفحة تعريفية.`

#### Hero

**Badge:** `SimulationOS / Scenario Intelligence`
**Badge 2:** `مستقبلي — تسويقي`
**H1:** `اختبار القرار قبل تنفيذه يجب أن يكون جزءًا من المسار لا تمرينًا منفصلًا`
**Disclaimer:** `SimulationOS حاليًا في المرحلة التسويقية فقط. لم يبدأ التطوير التشغيلي بعد.`

#### Governance Section

**Three pillars:**
1. `الذكاء يساعد` — `النظام يعالج المدخلات، يبني النماذج، يحسب الأثر والمقارنات.`
2. `الإنسان يقرر` — `المتخذ يقيّم السيناريوهات، يختار الافتراضات الأساسية، يحكم على الأثر.`
3. `الدليل يحكم` — `كل محاكاة مرتبطة بنموذج موثق، افتراضات معروضة، وتقارير مدقوقة.`

#### Workflow

**Flow:** `المدخلات` → `نموذج السيناريو` → `الافتراضات` → `الأثر` → `المقارنة` → `دعم القرار`

#### Outputs

`Scenario Report` / `Impact Comparison` / `Risk View` / `Cost/Benefit Simulation` / `Recommendation Input`

---

### About Page

**Route:** `/about`
**Source file:** `src/app/(marketing)/about/page.tsx`
**Purpose:** About AQLIYA — vision, beliefs, differentiation

#### Metadata

- Title: `من نحن | AQLIYA`
- Description: `عقلية منصة ذكاء مؤسسي خاص ومحكوم تبني خطوط أنظمة مؤسسية فوق AQLIYA Intelligence Core، بحيث تبقى البيانات والمخرجات والمراجعات تحت حوكمة المؤسسة.`

#### Hero

**Badge:** `About AQLIYA`
**H1:** `عقلية وُجدت لأن المؤسسة لا تحتاج ذكاءً أسرع فقط، بل ذكاءً يمكن الوثوق به`
**Body:** `بدأ التصور من سؤال بسيط وصعب في الوقت نفسه: كيف تستفيد المؤسسة من الذكاء الاصطناعي من دون أن تفقد القدرة على المراجعة، والتفسير، وربط القرار بمساره الكامل؟ من هنا جاءت عقلية كمنصة لا تبني مخرجات فقط، بل تبني طريقة مؤسسية لإنتاجها.`

#### "Why AQLIYA Exists" Section

**H2:** `لماذا وُجدت عقلية؟`
**Body:** `لأن أغلب مبادرات الذكاء داخل المؤسسات تبدأ من أداة، بينما المشكلة الحقيقية تبدأ من التشغيل. إذا لم تكن البيانات واضحة، والصلاحيات معروفة، والأدلة مربوطة بالمخرج، فإن أي ذكاء سريع سيتحول إلى عبء جديد بدل أن يكون قيمة جديدة.`

**Three reasons:**
1. `المشكلة ليست نقص أدوات الذكاء الاصطناعي فقط، بل مخرجات بلا أدلة ومسارات بلا محاسبة.`
2. `المؤسسات تحتاج ذكاءً يعمل داخل الحوكمة، لا خارجها.`
3. `الخطر الحقيقي ليس بطء الأتمتة، بل قرارات لا يمكن تتبعها أو مراجعتها أو تفسيرها بعد صدورها.`

**Closing body:** `لذلك تأتي عقلية كطبقة تشغيل مؤسسي: تربط الذكاء بالبيانات، وسير العمل، والأدلة، والمراجعة البشرية، حتى لا يصبح السؤال بعد صدور المخرج: من قال هذا؟ بل: ما الذي أوصلنا إليه، ومن اعتمده، وعلى أي أساس؟`

#### Operating Beliefs

**Label:** `Operating Beliefs`
**H2:** `كيف تفكر عقلية قبل أن تبني أي نظام؟`

**Three beliefs:**
1. `لا نبدأ من الشاشة، بل من واقع المؤسسة: من يقرر، من يراجع، وما الذي يجب أن يبقى قابلًا للتفسير.`
2. `لا نبيع ذكاءً معزولًا عن المسؤولية. كل مخرج في عقلية يجب أن يجد طريقه إلى المراجعة والاعتماد.`
3. `لا نبني لكل نطاق نظامًا منفصلًا تمامًا؛ نبني قدرة تشغيلية يمكن تكرارها فوق نواة واحدة.`

#### AQLIYA Intelligence Core (About)

**H2:** `ماذا تعني AQLIYA Intelligence Core فعليًا؟`
**Body:** `تعني أن المؤسسة لا تبدأ من الصفر كلما أرادت تفعيل نطاق جديد. هناك نواة موحدة تجمع تنسيق الذكاء، والحوكمة، وسير العمل، وربط الأدلة، والصلاحيات، وسجل التدقيق، والتقارير في بنية واحدة قابلة لإعادة الاستخدام.`

**Core items:** `تنسيق الذكاء` / `الحوكمة` / `سير العمل` / `ربط الأدلة` / `الصلاحيات` / `سجل التدقيق` / `التقارير`

#### System Lines (About)

**List of system lines:**

1. `AuditOS — نظام التدقيق والذكاء المالي`
2. `LocalContentOS — نظام المحتوى المحلي`
3. `DecisionOS — نظام حوكمة القرارات`
4. `SalesOS — نظام الذاكرة التجارية والمبيعات`
5. `SimulationOS — نظام محاكاة السيناريوهات`
6. `Custom Systems — أنظمة مؤسسية مخصصة`

**Sub-description per item:** `خط متخصص ضمن عقلية، قابل للتفعيل حسب نطاق المؤسسة، ويرتبط بسير العمل، والأدلة، والمراجعة، والاعتماد.`

#### What Makes AQLIYA Different

**H2:** `ما الذي يجعل عقلية مختلفة؟`
**Body:** `الفارق ليس في استخدام الذكاء الاصطناعي بحد ذاته، بل في طريقة إدخاله داخل المؤسسة: كمساعد محكوم، لا كجهة تقرر بدل الإنسان أو تتجاوز مسار الحوكمة.`

**Six differentiators:**
1. `منصة متكاملة، لا منتج واحد — تشغّل خطوط أنظمة متعددة فوق نواة حوكمة واحدة`
2. `خاصة ومحكومة — تعمل على بيانات المؤسسة، داخل بيئتها، وتحت حوكمتها`
3. `الإنسان هو صاحب القرار النهائي — الذكاء يساعد، لا يقرر`
4. `قابلة للتتبع والمراجعة — كل خطوة تُوثَّق وتُربط بالأدلة والصلاحيات`
5. `جاهزة للتوسع — تُفعّل حسب نطاق المؤسسة، من خط نظام إلى مسار مؤسسي كامل`
6. `Cloud + Private استراتيجيًا — قدرات On-Prem وAir-Gapped وLocal AI تُعرض كمسارات مستقبلية، ولا تُقدَّم كمنتجات إنتاجية منفذة إلا بعد اكتمالها واعتمادها`

#### Final CTA

**Tagline:** `One Core. Multiple Systems.`
**H2:** `ابدأ من نطاق مؤسستك، لا من أداة عشوائية`
**Body:** `إذا كانت لديك مشكلة تشغيلية تحتاج وضوحًا، وتتبعًا، ومراجعة، فابدأ من خط النظام المناسب أو من جلسة تصميم نظام مؤسسي محكوم فوق عقلية.`

**CTAs:**
| Label | Target |
|---|---|
| استكشف خطوط عقلية | `/products` |
| صمّم نظامك المؤسسي | `/custom-product` |

---

### How We Work Page

**Route:** `/how-we-work`
**Source file:** `src/app/(marketing)/how-we-work/page.tsx`
**Purpose:** Methodology page — 8-phase institutional engagement process

#### Metadata

- Title: `كيف نعمل | AQLIYA`
- Description: `عقلية لا تبدأ من بناء واجهة أو أداة منفصلة، بل من تفعيل مسار مؤسسي محكوم يربط البيانات وسير العمل والأدلة والمراجعة والاعتماد.`

#### Hero

**Badge:** `منهجية العمل`
**H1:** `كيف يتحول الواقع التشغيلي إلى نظام محكوم يمكن تشغيله والثقة به؟`
**Body:** `عقلية لا تبدأ من واجهة ولا من نموذج ذكاء منفصل. تبدأ من فهم الواقع التشغيلي، ثم تعيد بناءه كمسار مؤسسي واضح: بيانات، صلاحيات، أدلة، مراجعة، واعتماد داخل منطق واحد مبني على AQLIYA Intelligence Core.`

#### 8 Phases

| Phase | Title | Description | Output | Participants | Next |
|---|---|---|---|---|---|
| 01 | فهم الواقع التشغيلي | نبدأ من طريقة عمل المؤسسة كما هي: القرارات، الملفات، الأدوار، الصلاحيات، والاختناقات التي تمنع وضوح التشغيل. | خريطة الواقع التشغيلي | فريق عقلية + أصحاب العلاقة | هيكلة البيانات |
| 02 | هيكلة البيانات | نحدد البيانات الحرجة، مصادرها، علاقتها بالمخرجات، وما الذي يجب أن يبقى قابلًا للتتبع والمراجعة داخل النظام. | نموذج البيانات التشغيلي | فريق عقلية | تصميم سير العمل |
| 03 | تصميم سير العمل | نحوّل الإجراءات الحالية إلى مسار واضح يربط الإدخال، المعالجة، المراجعة، والاعتماد بدل الاعتماد على الذاكرة والتتبع اليدوي. | خريطة سير العمل المحكوم | فريق عقلية + أصحاب العلاقة | ربط الأدلة والصلاحيات |
| 04 | ربط الأدلة والصلاحيات | نعرّف من يراجع، من يعتمد، ما الأدلة المطلوبة، وكيف تُحكم الصلاحيات حتى لا تنفصل المخرجات عن المسؤولية المؤسسية. | نموذج الحوكمة والأدلة | فريق عقلية | إضافة طبقة الذكاء |
| 05 | إضافة طبقة الذكاء | نفعّل الذكاء الاصطناعي كمساعد داخل المسار، لا كصاحب قرار: اقتراحات، تصنيفات، تلخيصات، وتنبيهات تخضع للمراجعة البشرية. | طبقة مساعدة محكومة | فريق عقلية | المراجعة والاعتماد |
| 06 | المراجعة والاعتماد | نربط كل مخرج بالمراجعة البشرية والاعتماد الرسمي حتى تصبح القرارات والمخرجات قابلة للفحص قبل اعتمادها أو نشرها. | بوابات مراجعة واعتماد | فريق عقلية + المستخدمون | التفعيل التشغيلي |
| 07 | التفعيل التشغيلي | نفعّل خط النظام أو المسار المؤسسي داخل بيئة العمل الفعلية مع تدريب الفرق على التشغيل ضمن منطق حوكمة واضح. | نظام مؤسسي مفعل | فريق عقلية + فريق المؤسسة | التحسين المستمر |
| 08 | التحسين المستمر | نقيس ما تغير في التشغيل ونطوّر المسار بناءً على الاستخدام الحقيقي، والأثر، والملاحظات، ومتطلبات المراجعة المستمرة. | تحسينات وتوسعات دورية | فريق عقلية + فريق المؤسسة | — |

#### Final CTA

**Badge:** `من الواقع إلى النظام`
**H2:** `إذا كان لديك واقع تشغيلي معقد، يمكن تحويله إلى مسار محكوم قابل للتفعيل`
**Body:** `نبدأ من الواقع كما هو، ثم نحوله إلى بنية تشغيلية واضحة يمكن توسيعها وربطها بالذكاء والمراجعة والاعتماد.`

**CTAs:**
| Label | Target |
|---|---|
| صمّم نظامك المؤسسي | `/custom-product` |
| ناقش تفعيل النظام | `/contact` |

---

### Custom Product Page

**Route:** `/custom-product`
**Source file:** `src/app/(marketing)/custom-product/page.tsx`
**Purpose:** Request form for custom institutional system design

#### Metadata

- Title: `صمّم نظامك مع عقلية | AQLIYA`
- Description: `صمّم نظامًا برمجيًا خاصًا بطبيعة عمل مؤسستك. املأ الطلب وسيتواصل معك فريق عقلية.`

#### Hero

**Badge:** `نظام مؤسسي مخصص`
**H1:** `عندما لا يكفي المنتج الجاهز، يمكن تصميم نظامك فوق نواة عقلية نفسها`
**Body:** `هذه الصفحة مخصصة للمؤسسات التي لا تحتاج أداة إضافية فقط، بل تحتاج مسارًا تشغيليًا محكومًا مبنيًا حول واقعها الفعلي: البيانات، الأدوار، الصلاحيات، المراجعة، والمخرجات.`

**When this fits:** Label: `متى يكون هذا مناسبًا؟`
1. `عندما تكون الإجراءات موزعة بين فرق متعددة ولا يوجد مسار واحد يحكمها.`
2. `عندما لا يكفي منتج جاهز وتحتاج المؤسسة منطق تشغيل خاصًا بطبيعة عملها.`
3. `عندما يجب أن تبقى البيانات، والمخرجات، والمراجعة، والاعتماد داخل بيئة محكومة واحدة.`

**Form steps:** `المؤسسة` → `النظام` → `التحديات` → `البيئة` → `المخرجات` → `الهدف` → `التواصل`

#### Form Labels (from CustomProductForm component)

**Section label:** `قبل إرسال الطلب`
**H2:** `ما الذي نحتاج فهمه قبل تصميم أي نظام؟`
**Description:** `نحتاج فهم المجال، ونمط القرارات، وطبيعة البيانات، وحدود الصلاحيات، وما إذا كان المطلوب خط نظام واضحًا أو مسارًا مركبًا عابرًا للفرق.`

**Post-submission info:** `ما الذي يحدث بعد الإرسال؟`
1. `مراجعة الطلب لفهم طبيعة الفجوة التشغيلية.`
2. `تحديد ما إذا كان الاحتياج أقرب إلى خط نظام جاهز أو تصميم مخصص.`
3. `التواصل معك بنقطة بداية واضحة بدل رد عام غير مفيد.`

**Form fields (user-visible labels from data arrays):**

- Industry: `اختر القطاع...` / `الخدمات المالية` / `المراجعة والمحاسبة` / `الاستشارات` / `النفط والغاز` / `الإنشاءات` / `التجزئة والجملة` / `الرعاية الصحية` / `التقنية` / `التصنيع` / `الخدمات اللوجستية` / `القطاع الحكومي` / `التعليم` / `العقارات` / `قطاع آخر`
- Org size: `اختر الحجم...` / `١–١٠ موظفين` / `١١–٥٠ موظفًا` / `٥١–٢٠٠ موظف` / `٢٠١–٥٠٠ موظف` / `+٥٠٠ موظف`
- Country: `اختر الدولة...` / `المملكة العربية السعودية` / `الإمارات العربية المتحدة` / `الكويت` / `قطر` / `البحرين` / `عُمان` / `مصر` / `الأردن` / `دولة أخرى`
- System category: `أنظمة اتخاذ القرار` / `أنظمة المحاكاة` / `أنظمة المبيعات` / `أنظمة المراجعة والتدقيق` / `أنظمة المحتوى المحلي` / `نظام مؤسسي مخصص`
- Challenges: `بطء في اتخاذ القرارات` / `إجراءات متفرقة وغير مترابطة` / `مراجعة وتدقيق يدوية` / `ضعف التتبع والمراجعة` / `بيانات منفصلة غير متصلة` / `ضعف القدرة على التنبؤ والتخطيط` / `غياب رؤية واضحة لأداء المبيعات` / `صعوبة الالتزام بمتطلبات المحتوى المحلي` / `عبء إعداد التقارير` / `اعتماد مفرط على Excel والملفات اليدوية` / `تحديات أخرى`
- Environment: `نظام ERP` / `Excel / أوراق عمل` / `أنظمة قديمة (Legacy)` / `إجراءات ورقية / يدوية` / `خليط من أنظمة متفرقة` / `لا يوجد نظام حالي`
- Outcomes: `أتمتة الإجراءات` / `وضوح البيانات والمؤشرات` / `تحكم تشغيلي أفضل` / `تقارير دقيقة ومؤتمتة` / `قابلية المراجعة والتتبع` / `محاكاة السيناريوهات` / `التنبؤ والتخطيط` / `الالتزام والامتثال` / `تتبع كامل للمخرجات`
- Intent: `اختر هدف التواصل...` / `نقاش استكشافي — فهم الإمكانيات` / `طلب عرض توضيحي — مشاهدة نظام حي` / `مشروع تجريبي — تطبيق مبدئي` / `بناء نظام كامل — جاهز للتشغيل`

---

### Contact Page

**Route:** `/contact`
**Source file:** `src/app/(marketing)/contact/page.tsx`
**Purpose:** Contact page with form and navigation paths

#### Metadata

- Title: `تواصل معنا | AQLIYA`
- Description: `ابدأ من نطاق مؤسستك مع عقلية: حدد خط النظام المناسب، ناقش التفعيل، أو اطلب جلسة تصميم نظام مؤسسي محكوم.`

#### Hero

**Badge:** `تواصل`
**H1:** `ابدأ من نطاق مؤسستك، لا من طلب عام غير واضح`
**Body:** `سواء كنت تريد تفعيل خط نظام تحت عقلية، أو تحديد المسار المؤسسي المناسب، أو تصميم نظام خاص فوق AQLIYA Intelligence Core، فهذه الصفحة هي نقطة البداية العملية للحديث الصحيح.`

#### Contact Form Section

**Eyebrow:** `Engagement Start`
**H2:** `ابدأ المحادثة من زاوية تشغيلية واضحة`
**Body:** `أفضل نقطة بداية ليست طلب عرض عام، بل تحديد نوع الفجوة التي تريد معالجتها: هل تحتاج خط نظام جاهز؟ هل لديك مسار خاص؟ هل تريد مشاهدة تطبيق فعلي قبل أي نقاش؟`

**Three pathways:**
1. `إذا كنت تعرف نطاق العمل، نوجّهك إلى خط النظام الأقرب.`
2. `إذا كان النطاق مركبًا، نبدأ من جلسة تصميم مؤسسي محكوم.`
3. `إذا أردت إثباتًا عمليًا، نوجّهك إلى AuditOS كأول تطبيق واضح.`

**Direct email:** `راسلنا مباشرة` — `ragheed@aqliya.com` — `سنرد عليك بمسار البداية الأنسب بدل رسالة عامة لا تقود إلى قرار.`

**Form title:** `أرسل رسالة مباشرة`
**Form description:** `اذكر بإيجاز المجال، نوع البيانات، وما إذا كنت تبحث عن خط نظام جاهز أو مسار مخصص.`
**Form fields:** `الاسم` / `البريد الإلكتروني` / `الرسالة`

#### Three-Pathway Cards Section

1. **Title:** `حدد خط النظام المناسب`
   **Body:** `إذا كنت تعرف المجال الذي تريد تفعيله داخل مؤسستك، ابدأ من استكشاف خطوط عقلية وتحديد الخط الأقرب إلى طبيعة العمل.`
   **CTA:** `استكشف خطوط عقلية` → `/products`

2. **Title:** `ابدأ من جلسة تصميم`
   **Body:** `إذا كان نطاقك مركبًا أو عابرًا للأقسام، فابدأ من جلسة تصميم نظام مؤسسي محكوم فوق النواة نفسها.`
   **CTA:** `اطلب جلسة تصميم النظام` → `/custom-product`

3. **Title:** `شاهد تطبيقًا فعليًا`
   **Body:** `إذا كنت تريد رؤية كيف تتحول النواة المشتركة إلى تطبيق حي، ابدأ بعرض AuditOS كأول تطبيق واضح تحت عقلية.`
   **CTA:** `شاهد AuditOS` → `/products/audit`

---

### AuditOS Guided Demo Page

**Route:** `/auditos`
**Source file:** `src/app/auditos/page.tsx`
**Purpose:** Public interactive demo page for AuditOS with mock data

#### Page Copy

**Badge:** `AuditOS — أول تطبيق مثبت / عرض إرشادي`
**H1:** `شركة الخليج التجارية — FY2025`
**Duration note:** `مدة الاستعراض: 4 دقائق`
**Status badge:** `عرض إرشادي عام`

**Body:** `AuditOS هو أول تطبيق مُثبت تحت عقلية في مجال التدقيق والذكاء المالي. يوضح هذا الديمو كيف تتحول AQLIYA Intelligence Core إلى مسار عمل محكوم يربط البيانات، الأدلة، المراجعة، والاعتماد داخل نظام واضح وقابل للتتبع.`

**Disclaimer:** `هذا عرض توضيحي عام ببيانات إرشادية/تجريبية لغرض شرح المسار، وليس بيئة تشغيل عميل حقيقية أو نشرًا إنتاجيًا مستقلًا.`

**CTAs:** `صفحة AuditOS` → `/products/audit` | `ناقش التفعيل` → `/custom-product`

**Guided demo questions:**
1. `ما الذي تراه؟ أول تطبيق مُثبت تحت عقلية في مسار تدقيق وذكاء مالي محكوم.`
2. `لماذا هذا مهم؟ كل مخرج في النظام مرتبط بمصدره، ومراجعته، واعتماده.`
3. `ما المخرج؟ قوائم مالية، إيضاحات، أدلة، وسجل تتبع كامل داخل مسار واحد.`
4. `ما القرار التالي؟ استعراض كيف تنتقل البيانات من الإدخال إلى المراجعة والاعتماد.`

**KPI labels:** `إجمالي الارتباطات` / `نشطة` / `مراجعات معلقة` / `ملاحظات مفتوحة`

**Insight callout:** `تم تصنيف 21 من 22 حسابًا. حساب واحد يحتاج مراجعة بشرية قبل الاعتماد. الذكاء الاصطناعي يساعد. الإنسان يقرر.`

**Engagement section:** `الارتباط التجريبي`
- `العميل` / `الفترة المالية` / `نوع الارتباط: مراجعة كاملة` / `الإطار المحاسبي: IFRS for SMEs` / `الحالة: قيد التنفيذ` / `الفريق`

**Activity section:** `آخر النشاطات`

**Traceability section:** `مسار التتبع في AuditOS`
- Steps: `حساب خام` → `قرار التصنيف` → `بند في القائمة` → `إيضاح` → `دليل` → `نتيجة` → `نقطة مراجعة`
- Body: `هذا هو جوهر AuditOS كأول تطبيق تحت عقلية: لا يكتفي بإخراج نتيجة، بل يحافظ على مسار الدليل والمراجعة والقرار داخل بيئة واحدة قابلة للتتبع.`

**Final CTA:**
**Title:** `هل تريد تجربة AuditOS على بيانات مؤسستك؟`
**Body:** `ابدأ برؤية أول تطبيق مُثبت على عقلية، ثم ناقش كيف يمكن تفعيل خط النظام نفسه أو تصميم مسار مؤسسي مناسب لنطاق مؤسستك.`
**CTAs:** `ناقش تفعيل النظام` / `ارجع إلى صفحة المنتج`

---

### Login Page

**Route:** `/login`
**Source file:** `src/app/login/page.tsx`
**Purpose:** Authentication page

**Title:** `الدخول إلى مساحة العمل المؤسسية`
**Description:** `أدخل بياناتك للوصول إلى بيئة تشغيل محكومة تربط العمل بالصلاحيات، المراجعة، والأثر التشغيلي.`

**Labels:** `البريد الإلكتروني` / `كلمة المرور`
**CTA:** `تسجيل الدخول`
**Error messages:** `بريد إلكتروني أو كلمة مرور غير صحيحة` / `تم تسجيل الدخول ولكن الجلسة لم تُنشأ. حاول مرة أخرى.` / `حدث خطأ في الاتصال. حاول مرة أخرى.`
**Loading state:** `جارٍ تسجيل الدخول...`

---

### Not Found Page (404)

**Route:** `404`
**Source file:** `src/app/not-found.tsx`

**Display:** `404`
**H1:** `الصفحة غير موجودة`
**Body:** `الصفحة التي تبحث عنها غير متوفرة أو قد تكون قد أزيلت.`
**CTA:** `العودة إلى الرئيسية` → `/`

---

### Access Denied Page (403)

**Route:** `/access-denied`
**Source file:** `src/app/access-denied/page.tsx`

**Title:** `الوصول غير مصرح`
**Description:** `ليس لديك صلاحية للوصول إلى هذا المسار أو هذه الوحدة التشغيلية.`
**Body:** `إذا كنت تعتقد أن الوصول مطلوب لطبيعة عملك، تواصل مع مسؤول المساحة أو مدير النظام.`
**CTA:** `العودة إلى مساحة البداية` → `/`

---

### Loading Page

**Route:** `loading`
**Source file:** `src/app/loading.tsx`

**Display:** Spinner + text `جاري التحميل...`

---

### AuditOS Workspace Dashboard

**Route:** `/audit`
**Source file:** `src/app/audit/page.tsx`
**Purpose:** Authenticated workspace dashboard for AuditOS

> Note: Internal workspace copy — included for completeness since it contains user-facing Arabic labels.

**Workspace status message:** `جميع المهام التشغيلية` (or `${n} نتيجة مفتوحة تتطلب الانتباه`)
**Title:** `AuditOS`
**Subtitle:** `ذكاء مالي ومسارات تدقيق مؤسسي محكوم`
**AI label:** `ذكاء التدقيق`

**KPI labels:** `إجمالي المهام` / `المهام النشطة` / `بانتظار المراجعة` / `النتائج المفتوحة` / `أدلة مفقودة` / `جاهز للاعتماد` / `منشورة`

**Intelligence panel:** `ذكاء التدقيق`
**Signals:** `عمق المراجعة` / `الأهمية المالية` / `قوة الأدلة`

---

### SalesOS Prototype Dashboard

**Route:** `/sales`
**Source file:** `src/app/sales/page.tsx`
**Purpose:** Prototype dashboard for SalesOS (static mock data)

**Title:** `SalesOS`
**Subtitle:** `ذكاء الإيرادات وإدارة مسارات البيع المؤسسي`
**Badge:** `نموذج أولي — بيانات توضيحية`

**KPI labels:** `إجمالي المسار` / `الصفقات النشطة` / `معدل الفوز` / `الحسابات النشطة`
**Intelligence panel:** `ذكاء المسار البيعي`
**Signals:** `جودة المسار` / `مخاطر التحويل` / `ثقة التوقّع` / `استعجال المتابعة`

**AI Insight (Arabic):** `بناءً على سرعة المسار الحالية، الإيرادات المتوقعة للربع الثالث هي ١٫٨ مليون دولار (±١٢٪). ٣ صفقات تُظهر احتمالاً عالياً للإغلاق هذا الشهر. التركيز الموصى به: قطاع المؤسسات.`

**Pipeline sections:** `تأهيل` / `عرض` / `تفاوض`
**Follow-up section:** `متابعة مطلوبة`
**Activity:** `آخر النشاطات`

---

## 5. Navigation & Shared Layout Copy

### Site Header (`src/components/layout/site-header.tsx`)

| Label (Arabic) | Target | Context |
|---|---|---|
| الرئيسية | `/` | Desktop + mobile nav |
| المنتجات | `/products` | Desktop + mobile nav |
| كيف نعمل | `/how-we-work` | Desktop + mobile nav |
| من نحن | `/about` | Desktop + mobile nav |
| تواصل معنا | `/contact` | Desktop + mobile nav |
| صمّم نظامك المؤسسي | `/custom-product` | Desktop + mobile nav CTA |
| AR | (toggle locale) | Language switch |
| EN | (toggle locale) | Language switch |
| TR | (toggle locale) | Language switch |

**Mobile hamburger icon:** aria-label `Toggle menu`
**Desktop nav aria-label:** `التنقل الرئيسي`
**Mobile nav aria-label:** `التنقل الرئيسي للجوال`

### Site Footer (`src/components/layout/site-footer.tsx`)

**Brand description:** `عقلية منصة ذكاء مؤسسي خاص ومحكوم، تبني خطوط أنظمة متخصصة فوق AQLIYA Intelligence Core. الذكاء يساعد. الإنسان يقرر. الدليل يحكم. سحابة متاحة الآن. خوادم خاصة ومعزولة قيد التطوير.`

**Trust principle box:** Label: `المبدأ المؤسسي` | Text: `الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.` | Email: `ragheed@aqliya.com`

**Footer link groups:**

| Group Title | Links |
|---|---|
| الشركة | من نحن (`/about`) / كيف نعمل (`/how-we-work`) / تواصل معنا (`/contact`) / صمّم نظامك المؤسسي (`/custom-product`) / راسلنا عبر البريد (`mailto:ragheed@aqliya.com`) |
| خطوط الأنظمة | AuditOS — نظام التدقيق والذكاء المالي (`/products/audit`) / LocalContentOS — نظام المحتوى المحلي (`/products/local-content`) / DecisionOS — نظام حوكمة القرارات (`/products/decision`) / SalesOS — نظام الذاكرة التجارية والمبيعات (`/products/sales`) / SimulationOS — نظام محاكاة السيناريوهات (`/products/simulation`) / Custom Systems — أنظمة مؤسسية مخصصة (`/custom-product`) |
| التفعيل والاستكشاف | استكشف خطوط عقلية (`/products`) / شاهد AuditOS كأول تطبيق (`/auditos`) / ناقش حالة استخدام مؤسسية (`/custom-product`) |
| نماذج التشغيل | سحابة عقلية — متاح الآن (`/products`) / خوادم خاصة — قيد التطوير (`/products`) / بيئة معزولة — استراتيجي (`/products`) |

**Copyright:** `© {year} AQLIYA. جميع الحقوق محفوظة.`

### Platform Sidebar (Dashboard — `src/components/platform/platform-sidebar.tsx`)

**Brand subtitle:** `Mind The Future`

**Module switcher items:**
| Module | English Name | Arabic Name | Route |
|---|---|---|---|
| audit | AuditOS | نظام التدقيق المالي | `/audit` |
| decision | DecisionOS | نظام القرارات | `/decisions` |
| sales | SalesOS | نظام المبيعات | `/sales` |

**Platform nav (DecisionOS context):**
| Item | Route |
|---|---|
| Decision Intelligence / الذكاء القرارات | `/decisions` |
| المنظمات | `/organizations` |
| الذكاء | `/intelligence/sectors` |
| الإعدادات | `/settings` |

**AuditOS workspace nav:**
| English | Arabic | Route |
|---|---|---|
| Dashboard | لوحة التحكم | `/audit` |
| Engagements | المهام | `/audit` |
| Clients | العملاء | `/audit` |
| Evidence | الأدلة | `/audit` |
| Findings | الملاحظات | `/audit` |
| Reviews | المراجعات | `/audit` |
| Approval | الموافقة | `/audit` |
| Audit Trail | سجل التدقيق | `/audit` |

**SalesOS workspace nav:**
| Item | Route |
|---|---|
| Dashboard / لوحة التحكم | `/sales` |
| المنظمات | `/organizations` |
| الإعدادات | `/settings` |

**Sidebar footer:** `Governed Intelligence Platform` / `v1.1 — Private & Governed`

### Platform Header (Dashboard — `src/components/platform/platform-header.tsx`)

**Workspace breadcrumb labels:**
- Default: `منصة عقلية` / `مساحة العمل`
- AuditOS: `AuditOS` / `نظام التدقيق المالي`
- SalesOS: `SalesOS` / `الذاكرة التجارية والمبيعات`
- DecisionOS: `DecisionOS` / `حوكمة القرارات`

**Search placeholder:** `ابحث في مساحة العمل...`
**Keyboard shortcut hint:** `⌘K`

### Legacy Sidebar (`src/components/layout/sidebar.tsx` — inside `(dashboard)/layout.tsx`)

**Brand subtitle:** `منصة ذكاء مؤسسي`

**Navigation:**
| Item | Route |
|---|---|
| حوكمة القرارات | `/decisions` |
| المنظمات | `/organizations` |
| الإعدادات | `/settings` |

---

## 6. Product Copy Inventory

### AQLIYA Platform

Current copy found:
- "منصة ذكاء مؤسسي خاص ومحكوم" (Private Governed Institutional Intelligence Platform)
- "بنية مؤسسية تجعل الذكاء مفيدًا، مفهومًا، ومحكومًا"
- Positioned as a multi-product platform, not a single product
- References AQLIYA Intelligence Core as the shared layer
- Cloud + Private deployment model framed
- "عقلية ليست صفحة دردشة للمؤسسة، وليست طبقة AI منفصلة فوق الفوضى"

### AuditOS

Current copy found:
- "أول تطبيق مُثبت على AQLIYA Intelligence Core" (first proof product)
- Positioned as financial and audit intelligence system
- Clear problem → system → output structure
- Excel vs ChatGPT vs AuditOS comparison table
- Strong governance framing (AI assists, humans decide, evidence governs)
- Guided demo page with mock data at `/auditos`
- Arabic-first copy with consistent terminology

### LocalContentOS

Current copy found:
- "المنتج الاستراتيجي الثاني ضمن عقلية" (second strategic product)
- Saudi market focus (هيئة المحتوى المحلي)
- Clear disclaimers: "قيد التخطيط الاستراتيجي — لم يبدأ التطوير التشغيلي بعد"
- Marketing page only — no workspace exists yet
- Arabic-first copy

### DecisionOS

Current copy found:
- "خط نظام لحوكمة القرار التنفيذي"
- "متاح للتفعيل" (available for activation)
- Active adjacent system with workspace at `/decisions`
- Governed decision process framing
- Arabic-first with English output labels (Decision Brief, Decision Memo, etc.)
- Marketing page content partially overlaps with homepage product card

### SalesOS

Current copy found:
- "نموذج أولي ضمن عقلية لنظام الذاكرة التجارية والمبيعات"
- "حاليًا، يوجد واجهة لوحة معلومات ثابتة بدون خلفية تشغيلية مكتملة"
- Prototype dashboard at `/sales` with mock data
- Clear disclaimer about no backend yet
- English output labels (ICP Profiles, Lead Score, etc.)

### Other Products / Future Products

**SimulationOS:**
- "مفهوم مستقبلي ضمن عقلية لمحاكاة السيناريوهات"
- "يُعرَض حاليًا كصفحة تعريفية" — marketing only
- English output labels (Scenario Report, Impact Comparison, etc.)

**Custom Systems:**
- "أنظمة مؤسسية مخصصة" — available for activation
- Detailed form-based intake at `/custom-product`

---

## 7. Content Issues Found

| Issue Type | Location | Current Copy | Why It Matters | Recommended Fix Direction |
|---|---|---|---|---|
| **Identity confusion** | Homepage impact metrics | `06 خطوط تشغيل` — starts from AuditOS and extends to local-content, decision, sales, simulation | Counts DecisionOS and SalesOS as "operating lines" but v1.1 taxonomy lists them differently | Clarify what qualifies as a "خط تشغيل" and align with roadmap phases |
| **AQLIYA reduced to one product** | Homepage product card | `AuditOS | أول تطبيق مُثبت على عقلية` — could be read as AuditOS being the only product | Repeated consistently but the "not one product" section does clarify | Keep current framing but strengthen platform-first language before product list |
| **SaaS-only framing** | Deployment section | `السحابة متاحة الآن. الخوادم الخاصة والمعزولة قادمة` — Private listed as "قادمة" (coming) | Aligned with v1.1 — Private is strategic/future, not misleading | OK as-is; verify "Docker أو Kubernetes" claim for private cloud |
| **Unimplemented capability claim** | Homepage deployment card 2 | `متوفر على Docker أو Kubernetes` — Private Cloud deployment | Docker Compose exists for test env only; Kubernetes deployment is not implemented | Rephrase to indicate Docker Compose for test/dev, Kubernetes is future |
| **Unimplemented capability claim** | Homepage deployment card 3 | `بيئة معزولة بدون أي اتصال بالانترنت` — Air-Gapped described as a model | Air-Gapped is not implemented; the description is aspirational | Strengthen "استراتيجي" marker or add explicit disclaimer |
| **Unimplemented capability claim** | SalesOS marketing page | `حاليًا، يوجد واجهة لوحة معلومات ثابتة بدون خلفية تشغيلية مكتملة` — clear enough | OK, but `ينظم رحلة المبيعات` in the same paragraph may overstate | Ensure system description uses future/conditional tense |
| **Weak Arabic wording** | Various | Some Arabic phrasing could be more precise (e.g., "نواة مشتركة" vs "Core") | Arabic-first tone needs tightening | Audit for natural Arabic phrasing throughout |
| **Weak English wording** | Sidebar | `Mind The Future` as brand subtitle | Does not match v1.1 positioning (Private Governed Institutional Intelligence) | Align with official positioning tagline |
| **Duplicate copy** | Homepage vs Products page vs AuditOS page | Product descriptions are duplicated almost verbatim across pages | Hard to maintain consistency; changes need multi-file updates | Extract into shared constants or content files |
| **Duplicate copy** | Header vs Footer | Navigation labels duplicated | Expected for nav; minor maintenance burden | Acceptable |
| **Inconsistent terminology** | Products page | DecisionOS line badge: `نظام قائم` vs homepage badge: `متاح للتفعيل` | Two labels for same status | Unify status badge labels |
| **Missing CTA clarity** | Homepage | `ناقش حالة استخدام مؤسسية` leads to `/custom-product` | The label suggests "discussion" but target is a design request form | Either rename CTA or redirect to contact page |
| **Missing product boundary** | Homepage product section | DecisionOS listed among products but is described as "adjacent system" in v1.1 taxonomy | Product boundaries need clearer delineation | Add "نظام مجاور" context to DecisionOS |
| **Missing governance/evidence/human-review framing** | SalesOS/SimulationOS pages | Governance section is generic and repeated across products | Should feel product-specific | Customize governance copy per product |
| **English/Arabic imbalance** | Product output labels | DecisionOS, SalesOS, SimulationOS use English for output labels (e.g., "Decision Brief", "ICP Profiles") | Inconsistent with Arabic-first design | Translate output labels to Arabic |

---

## 8. Suggested Rewrite Workplan

### 1. Platform Homepage Rewrite
- Strengthen "AQLIYA is a platform, not a product" positioning
- Clarify impact metrics (06 lines → what exactly counts)
- Tighten Arabic phrasing in hero, promise points, and trust principle
- Verify Private/On-Prem deployment claims match implementation reality

### 2. Product Taxonomy Rewrite
- Align all product descriptions with v1.1 taxonomy
- Unify status badges (active / strategic / prototype / future)
- Add consistent product boundary context across pages

### 3. AuditOS Page Refinement
- Keep strong comparison table (Excel/ChatGPT)
- Refine governance section copy for precision
- Add more specific use-case scenarios

### 4. LocalContentOS Positioning
- Maintain clear "strategic / pre-development" framing
- Strengthen Saudi market focus language
- Add more detail about LCGPA requirements

### 5. Shared Navigation Cleanup
- Remove or align sidebar subtitle "Mind The Future" with v1.1 branding
- Unify footer link labels with page metadata
- Audit all header/sidebar labels for consistency

### 6. CTA Unification
- Standardize CTA labels and target mapping
- Ensure "ناقش تفعيل النظام" consistently leads to the same surface
- Add clear CTA hierarchy (primary/secondary/tertiary)

### 7. Arabic-First Tone Polish
- Audit Arabic phrasing across all pages for precision and fluency
- Translate remaining English-only labels (outputs, badges)
- Ensure RTL rendering consistency

### 8. Final Implementation Pass
- Update metadata titles/descriptions where needed
- Ensure no unimplemented capability claims slip through
- Verify all disclaimers are present on prototype/future products

---

## 9. Implementation Notes for Later

### Files That Likely Need Editing

| File | Reason |
|---|---|
| `src/app/(marketing)/page.tsx` | Platform homepage — hero, metrics, product cards, CTAs |
| `src/app/(marketing)/products/page.tsx` | Product listing — solution blocks, badges, core items |
| `src/app/(marketing)/products/audit/page.tsx` | AuditOS product page |
| `src/app/(marketing)/products/decision/page.tsx` | DecisionOS product page |
| `src/app/(marketing)/products/local-content/page.tsx` | LocalContentOS product page |
| `src/app/(marketing)/products/sales/page.tsx` | SalesOS product page |
| `src/app/(marketing)/products/simulation/page.tsx` | SimulationOS product page |
| `src/app/(marketing)/about/page.tsx` | About page — vision, beliefs, differentiators |
| `src/app/(marketing)/how-we-work/page.tsx` | Methodology page |
| `src/app/(marketing)/custom-product/page.tsx` | Custom product form page |
| `src/app/(marketing)/contact/page.tsx` | Contact page |
| `src/app/(marketing)/contact/contact-form.tsx` | Contact form component |
| `src/app/auditos/page.tsx` | Guided demo page |
| `src/app/layout.tsx` | Root metadata |
| `src/app/manifest.ts` | PWA manifest text |
| `src/components/layout/site-header.tsx` | Nav labels |
| `src/components/layout/site-footer.tsx` | Footer copy and links |
| `src/components/platform/platform-sidebar.tsx` | Dashboard sidebar labels |
| `src/components/platform/platform-header.tsx` | Dashboard header labels |
| `src/components/layout/sidebar.tsx` | Legacy sidebar labels |

### Components Containing Shared Copy

| Component | Copy Used In |
|---|---|
| `src/components/enterprise/SectionEyebrow` | Multiple pages (section labels, titles, descriptions) |
| `src/components/enterprise/BeforeAfterBlock` | Multiple product pages |
| `src/components/enterprise/WorkflowChain` | Homepage, AuditOS, How We Work |
| `src/components/enterprise/ProductProofCard` | Homepage product grid |
| `src/components/enterprise/OutputCard` | Multiple product pages |
| `src/components/enterprise/EnterpriseCTA` | Multiple product pages (final CTA) |
| `src/components/enterprise/InsightCallout` | AuditOS page, demo page |

### Copy That Should Become Reusable Constants

- Product descriptions (problem/system/output) — duplicated in homepage, products page, and individual product pages
- Status badge labels (`active` / `strategic` / `prototype` / `future`)
- Core engine names (7 items) — duplicated in homepage, products page, about page
- Trust principle text (`الذكاء يساعد. الإنسان يقرر. الدليل يحكم.`)
- Deployment model descriptions (3 models)
- Navigation labels (header/footer)
- CTA label variations

### Claims Requiring Verification Before Publishing

| Claim | File | Verification Needed |
|---|---|---|
| Private Cloud available on "Docker أو Kubernetes" | `(marketing)/page.tsx:291` | Docker Compose test env only; Kubernetes not implemented |
| "6 operating lines" | `(marketing)/page.tsx:23` | Count includes SalesOS (prototype) and SimulationOS (future) |
| DecisionOS listed alongside AuditOS as equivalent product | Multiple | DecisionOS is "adjacent system" per v1.1 taxonomy |
| "نظام قائم" badge for DecisionOS | `products/page.tsx:45` | v1.1 says "Active adjacent" — may need different label |
| Air-Gapped mode description as a current model | `(marketing)/page.tsx:303-305` | Air-Gapped is strategic/future, not implemented |
| SalesOS description implies working system | `products/sales/page.tsx:51-54` | Has disclaimer but early paragraph may oversell |
| "Governed Intelligence Platform" in sidebar | `platform-sidebar.tsx:215` | Should align with v1.1 "Private Governed Institutional Intelligence Platform" |
| "Mind The Future" subtitle | `platform-sidebar.tsx:129` | Not aligned with v1.1 positioning |

---

*End of extraction. No source code files were modified or created.*
