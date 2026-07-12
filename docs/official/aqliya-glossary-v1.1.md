# AQLIYA Glossary v1.1 — مسرد مصطلحات عقلية

**Version:** 1.1  
**Status:** Official terminology reference aligned to v0.1 operational baseline — مرجع مصطلحات رسمي متوافق مع خط الأساس التشغيلي
**Last Reviewed:** 2026-07-12  
**Note:** Product/system definitions updated to reflect L6 Production-hardened status for all 12 active products (2026-07-03).
**ملاحظة:** تم تحديث تعريفات المنتجات/الأنظمة لتعكس حالة L6 الجاهزة للإنتاج لجميع المنتجات النشطة الـ 12.

---

## Company and Platform Terms — مصطلحات الشركة والمنصة

| Term | المصطلح بالعربية | Definition |
| ---- | ---------------- | ---------- |
| **AQLIYA** | **عقلية** | The parent company and platform brand. A Private Governed Institutional Intelligence Platform. — الشركة الأم والعلامة التجارية للمنصة. منصة ذكاء مؤسسي خاص ومحكوم. |
| **AQLIYA Intelligence Core** | **نواة عقلية الذكية** | Shared platform layer for governance, workflow, AI orchestration, permissions, audit logs, document handling, and reporting. — طبقة المنصة المشتركة للحوكمة وسير العمل وتنسيق الذكاء الاصطناعي والصلاحيات وسجلات التدقيق ومعالجة المستندات والتقارير. |
| **AQLIYA Cloud** | **عقلية السحابية** | Current implemented deployment model. — نموذج النشر المنفذ حالياً. |
| **AQLIYA Private / On-Prem** | **عقلية الخاصة / داخلية** | Strategic future deployment model. Not implemented as a production package. — نموذج نشر استراتيجي مستقبلي. غير منفذ كحزمة إنتاجية. |
| **AQLIYA Studio** | **استوديو عقلية** | Strategic custom-systems builder layer. Not implemented. — طبقة بناء أنظمة مخصصة استراتيجية. غير منفذة. |

---

## Runtime Surface Terms — مصطلحات أسطح التشغيل

| Term | المصطلح بالعربية | Definition |
| ---- | ---------------- | ---------- |
| **Product / System** | **منتج / نظام** | A named operational system with route, data model, and workflow purpose. — نظام تشغيلي مسمى له مسار ونموذج بيانات وغرض سير عمل. |
| **Shared Application** | **تطبيق مشترك** | A governed application built on AQLIYA Core, real in code, but not a standalone product family. — تطبيق محكوم مبني على نواة عقلية، حقيقي في الكود لكن ليس عائلة منتجات مستقلة. |
| **Custom Workspace** | **مساحة عمل مخصصة** | A real governed workspace for a client-specific or custom workflow. — مساحة عمل محكومة حقيقية لسير عمل خاص بعميل أو مخصص. |
| **Demo** | **عرض توضيحي** | Guided, read-only, mock-backed experience. — تجربة موجهة للقراءة فقط مدعومة ببيانات وهمية. |
| **Prototype / Internal Preview** | **نموذج أولي / معاينة داخلية** | Route or surface that exists but is not a complete v0.1 operational module. — مسار أو سطح موجود لكنه ليس وحدة تشغيلية مكتملة v0.1. |
| **Strategic / Future** | **استراتيجي / مستقبلي** | Planned direction with no implemented operational surface. — اتجاه مخطط بدون سطح تشغيلي منفذ. |

---

## Product and System Terms — مصطلحات المنتجات والأنظمة

| Term | المصطلح بالعربية | Definition |
| ---- | ---------------- | ---------- |
| **AuditOS** | **أوديت — نظام التدقيق** | The first proof product under AQLIYA. Real, governed, and pilot-ready candidate. — أول منتج إثبات تحت عقلية. حقيقي، محكوم، ومرشح جاهز للتجربة. |
| **DecisionOS** | **قرارات — نظام القرارات** | Real active adjacent decision-governance system under AQLIYA. — نظام حوكمة قرارات نشط ومجاور تحت عقلية. |
| **Office AI Assistant** | **المساعد الذكي المكتبي** | Real governed shared application for work-assistant tasks. Not a standalone product and not a generic chatbot. — تطبيق مشترك محكوم حقيقي لمهام المساعدة في العمل. ليس منتجاً مستقلاً وليس روبوت محادثة عام. |
| **WorkflowOS** | **سير العمل — نظام سير العمل** | Canonical governed custom/client-specific workspace at `/workflowos/*` (L4 usable v0.1). Real CRUD, workflow states, audit trail, PDF export. — مساحة عمل محكومة مخصصة/خاصة بالعميل في `/workflowos/*`. إنشاء وقراءة وتحديث وحذف حقيقي، حالات سير عمل، سجل تدقيق، تصدير PDF. |
| **Sunbul** | **سنبل** | Legacy redirect alias to WorkflowOS only. `/sunbul/*` routes are `permanentRedirect(302)` to matching `/workflowos/*` routes. Not a separate product, surface, or workspace. — اسم مستعار قديم للتحويل إلى سير العمل فقط. مسارات `/sunbul/*` تحول إلى مسارات `/workflowos/*` المطابقة. ليس منتجاً أو سطحاً أو مساحة عمل منفصلة. |
| **SalesOS** | **مبيعات — نظام المبيعات** | Governed commercial intelligence workspace at /sales/* (L6 Production-hardened). Pipeline, deals, accounts, ICP, intelligence, audit trail, seed data. — مساحة عمل ذكاء تجاري محكوم في `/sales/*`. خط أنابيب، صفقات، حسابات، ملف العميل المثالي، ذكاء، سجل تدقيق، بيانات تمهيد. |
| **LocalContentOS** | **المحتوى المحلي** | Strategic second product. Pilot-ready with conditions / usable v0.1 (L5). Workspace at `/local-content/*` (12 routes), server actions, seed data, bilingual UI, evidence upload, review/approval, binary PDF/XLSX exports, audit trail. — المنتج الاستراتيجي الثاني. جاهز للتجربة بشروط / قابل للاستخدام v0.1. مساحة عمل في `/local-content/*`، واجهة ثنائية اللغة، رفع الأدلة، مراجعة/اعتماد، تصدير PDF/XLSX، سجل تدقيق. |
| **SimulationOS** | **محاكاة** | Marketing/category label today; not a standalone implemented product. — تصنيف تسويقي حالياً؛ ليس منتجاً منفذاً مستقلاً. |
| **LocalContactOS** | **العلاقات — نظام العلاقات** | Governed relationship workspace at /contacts/* (L6 Production-hardened). Contact registry, sensitivity levels, interaction history, risk flags, compliance export, audit trail. — مساحة عمل علاقات محكومة في `/contacts/*`. سجل جهات الاتصال، مستويات الحساسية، سجل التفاعلات، إشارات المخاطر، تصدير الامتثال، سجل تدقيق. |
| **ContentStudio** | **استوديو المحتوى** | **Operational Content Workspace** — standalone governed platform for creating, reviewing, approving, publishing, and versioning institutional content. Has own Prisma models, 5 route groups, full lifecycle (DRAFT→IN_REVIEW→APPROVED→PUBLISHED→ARCHIVED), versioning, PDF export, audit trail, ~125 tests. L6 Production-hardened. — **مساحة عمل المحتوى التشغيلي** — منصة محكومة مستقلة لإنشاء ومراجعة واعتماد ونشر وإصدار المحتوى المؤسسي. لديها نماذج Prisma خاصة، 5 مجموعات مسارات، دورة حياة كاملة، إصدارات، تصدير PDF، سجل تدقيق. |
| **Knowledge Foundation** | **أساس المعرفة** | Governance capability under AQLIYA Intelligence Core. Provides knowledge versioning, diff tracking, integrity verification (SHA-256), and release management for institutional knowledge assets. — قدرة حوكمة تحت نواة عقلية الذكية. توفر إصدارات المعرفة، تتبع الفروقات، التحقق من السلامة (SHA-256)، وإدارة الإصدارات لأصول المعرفة المؤسسية. |
| **RiskOS** | **المخاطر — نظام المخاطر** | AuditOS-adjacent risk workspace at /risk/* (L6 Production-hardened). Dashboard, assessment detail, procedure tracking, audit trail, JSON export. Not marketed as standalone product. — مساحة عمل مخاطر مجاورة لأوديت في `/risk/*`. لوحة معلومات، تفاصيل التقييم، تتبع الإجراءات، سجل تدقيق، تصدير JSON. لا تسوق كمنتج مستقل. |
| **ComplianceOS** | **امتثال — نظام الامتثال** | Future compliance system. Not implemented. — نظام امتثال مستقبلي. غير منفذ. |
| **LegalOS** | **قانوني — المساعد القانوني** | Future legal intelligence assistant. Not implemented. — مساعد ذكاء قانوني مستقبلي. غير منفذ. |
| **GovOS** | **حكومي — النظام الحكومي** | Future government institutional intelligence system. Not implemented. — نظام ذكاء مؤسسي حكومي مستقبلي. غير منفذ. |

---

## Governance and AI Terms — مصطلحات الحوكمة والذكاء الاصطناعي

| Term | المصطلح بالعربية | Definition |
| ---- | ---------------- | ---------- |
| **Evidence Graph** | **الرسم البياني للأدلة** | Cross-reference idea for linking outputs to sources. Partially real in AuditOS, not yet a full cross-product engine. — فكرة إسناد ترافقي لربط المخرجات بالمصادر. منفذة جزئياً في أوديت، ليست بعد محركاً كاملاً عبر المنتجات. |
| **Governance Engine** | **محرك الحوكمة** | Shared runtime for approval, escalation, provenance, and review rules. — وقت تشغيل مشترك للاعتماد والتصعيد والمصدر وقواعد المراجعة. |
| **Audit Logs** | **سجلات التدقيق** | Domain and platform logs that capture who did what, when, and in what context. — سجلات النطاق والمنصة التي تلتقط من فعل ماذا ومتى وفي أي سياق. |
| **Model Governance** | **حوكمة النماذج** | Strategic future model registry and policy layer. Not implemented. — سجل نماذج وطبقة سياسات استراتيجية مستقبلية. غير منفذة. |
| **Institutional Memory** | **الذاكرة المؤسسية** | Cross-product entity linking workspace at /institutional-memory/* (L6 Production-hardened). Knowledge graph visualization, event linking, collections, export. — مساحة عمل ربط الكيانات عبر المنتجات في `/institutional-memory/*`. تصور الرسم البياني المعرفي، ربط الأحداث، مجموعات، تصدير. |
| **Local AI Provider** | **مزود الذكاء الاصطناعي المحلي** | Local AI pilot runtime (L4 pilot with conditions). Ollama REST + hybrid routing via ADR-001 Cycle 2. Operator Ollama endpoint required. — وقت تشغيل ذكاء اصطناعي محلي تجريبي (L4 بشروط). Ollama REST + توجيه هجين. |

---

## Release Terms — مصطلحات الإصدار

| Term | المصطلح بالعربية | Definition |
| ---- | ---------------- | ---------- |
| **Included in v0.1** | **مضمن في الإصدار ٠.١** | Part of the first complete usable platform release scope. — جزء من نطاق أول إصدار منصة كامل قابل للاستخدام. |
| **Included as pilot-ready product** | **مضمن كمنتج جاهز للتجربة** | Usable and suitable for controlled pilot/demo with product framing. — قابل للاستخدام ومناسب للتجربة/العرض المضبوط مع تأطير المنتج. |
| **Included as active adjacent system** | **مضمن كنظام نشط مجاور** | Real and included, but not the primary proof product. — حقيقي ومضمن، لكن ليس منتج الإثبات الأساسي. |
| **Included as governed shared application** | **مضمن كتطبيق مشترك محكوم** | Real and included, but classified below standalone product level. — حقيقي ومضمن، لكن مصنف دون مستوى المنتج المستقل. |
| **Included as custom/internal workspace** | **مضمن كمساحة عمل مخصصة/داخلية** | Real and included, but custom/internal in positioning. — حقيقي ومضمن، لكن مخصص/داخلي في التموضع. |
| **Included as demo only** | **مضمن كعرض توضيحي فقط** | Visible in release scope as a demo surface only. — مرئي في نطاق الإصدار كسطح عرض توضيحي فقط. |
| **Do not claim as live** | **لا تدّعِ أنه مباشر** | May exist in docs or marketing, but must not be presented as implemented. — قد يوجد في التوثيق أو التسويق، لكن يجب ألا يقدم كمنفذ. |
