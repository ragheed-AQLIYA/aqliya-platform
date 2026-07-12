# AQLIYA Product Documentation Index
# فهرس توثيق منتجات عقلية

> **Status:** Active | **Level 5** per docs/DOCUMENTATION_AUTHORITY.md
> **المستوى:** نشط | المستوى 5 حسب مستند سلطة التوثيق
> **Note:** This directory was restored 2026-07-12 after intentional cleanup removed it. Product documentation is maintained in various locations across the repo. This index maps to the canonical location for each product.
> **ملاحظة:** تمت استعادة هذا الدليل في 2026-07-12 بعد إزالته أثناء التنظيف. توثيق المنتجات موزع عبر المستودع وهذا الفهرس يوجه إلى الموقع الرسمي لكل منتج.

---

## Product Documentation Map — خريطة توثيق المنتجات

| Product | المنتج | Canonical Documentation Location | Status |
|---------|--------|----------------------------------|--------|
| **AuditOS** | أوديت — نظام التدقيق الذكي | docs/assets/auditos/ — engine docs, state, factory readiness | L6 (code-level) |
| **AuditOS (Commercial)** | أوديت — الحزمة التجارية | docs/commercial-pack/ — pilot commercial pack (Arabic-first) | Active |
| **AuditOS (Commercial Assets)** | أوديت — الأصول التجارية | docs/commercial/README.md — demo storyline, outreach templates | Active |
| **AuditOS (Operator Manual)** | أوديت — دليل المشغل | docs/assets/auditos/README.md — system overview and references | Active |
| **AuditOS (Pilot Execution)** | أوديت — تنفيذ التجربة | docs/pilot/ — pilot execution pack, scope, go/no-go, sessions | Active |
| **DecisionOS** | قرارات — نظام حوكمة القرارات | docs/runbooks/decisionos-operator-guide.md — operator guide, workflows, states | L6 (code-level) |
| **LocalContentOS** | المحتوى المحلي — نظام إدارة المحتوى المحلي | docs/runbooks/localcontentos-operator-guide.md — operator guide, routes, config | L6 (code-level) |
| **LocalContentOS (Deployment)** | المحتوى المحلي — النشر | docs/runbooks/localcontentos-deployment-runbook.md | Active |
| **LocalContentOS (DR)** | المحتوى المحلي — التعافي | docs/runbooks/localcontentos-dr-plan.md | Active |
| **LocalContentOS (AI Review)** | المحتوى المحلي — مراجعة الذكاء الاصطناعي | docs/runbooks/localcontentos-ai-auth-review.md | Active |
| **WorkflowOS** | سير العمل — نظام إدارة سير العمل | docs/runbooks/workflowos-operator-guide.md — operator guide, SLA, templates | L6 (code-level) |
| **SalesOS** | مبيعات — نظام ذكاء المبيعات | docs/architecture/SALESOS_ARCHITECTURE_REALITY_ASSESSMENT.md — architecture and reality assessment | L4 (internal preview) |
| **SalesOS (Blueprint)** | مبيعات — المخطط المعماري | docs/architecture/SALESOS_V2_BLUEPRINT.md — v2 architecture blueprint | Reference |
| **RiskOS** | المخاطر — نظام إدارة المخاطر | No dedicated product docs yet — see docs/source-of-truth/PRODUCT_STATUS_MATRIX.md §RiskOS | L6 (code-level) |
| **LocalContactOS** | العلاقات — نظام إدارة العلاقات المؤسسية | No dedicated product docs yet — see docs/source-of-truth/PRODUCT_STATUS_MATRIX.md §LocalContactOS | L6 (code-level) |
| **ContentStudio** | استوديو المحتوى — نظام إدارة المحتوى المؤسسي | No dedicated product docs yet — see docs/source-of-truth/PRODUCT_STATUS_MATRIX.md | L6 (code-level) |
| **Office AI Assistant** | المساعد الذكي — مساعد مكتبي محكوم | docs/architecture/ — authorization wave reports; docs/runbooks/intelligence-core-rag.md | L6 (code-level) |
| **Institutional Memory** | الذاكرة المؤسسية — رسم بياني معرفي | docs/runbooks/institutional-memory-guide.md — lightweight guide | L6 (code-level) |
| **Knowledge Foundation** | أساس المعرفة — إصدارات المعرفة المؤسسية | docs/architecture/adr/ADR-028-KNOWLEDGE-FOUNDATION-BRIDGE.md — ADR | L6 (code-level) |
| **SimulationOS** | محاكاة — تحويل فقط للتسويق | Marketing redirect only — see docs/source-of-truth/PRODUCT_STATUS_MATRIX.md | L1 |
| **AQLIYA Studio** | استوديو عقلية — طبقة الأنظمة المخصصة | Strategic future — not implemented | L0 |

---

## Key Product Status Sources — مصادر حالة المنتجات الرئيسية

| Document | Purpose | الغرض |
|----------|---------|-------|
| docs/source-of-truth/PRODUCT_STATUS_MATRIX.md | Authoritative product status across all dimensions | مصفوفة حالة المنتجات المعتمدة |
| docs/official/aqliya-product-taxonomy-v1.1.md | Product boundaries and classification | حدود وتصنيف المنتجات |
| docs/official/AQLIYA_MASTER_REFERENCE.md | Current platform master reference | المرجع الرئيسي الحالي للمنصة |

---

## Platform Architecture — معمارية المنصة

| Document | Purpose |
|----------|---------|
| docs/architecture/README.md | Architecture documentation index |
| docs/architecture/AQLIYA_ARCHITECTURE_CONSTITUTION.md | Architecture constitution and ADR index |
| docs/architecture/PLATFORM_KERNEL_ARCHITECTURE.md | Platform kernel architecture |
| docs/source-of-truth/AQLIYA_ARCHITECTURE.md | Architecture model and system hierarchy |

---

## Operator Guides — أدلة المشغلين

| Product | المنتج | Guide |
|---------|--------|-------|
| DecisionOS | قرارات | docs/runbooks/decisionos-operator-guide.md |
| LocalContentOS | المحتوى المحلي | docs/runbooks/localcontentos-operator-guide.md |
| WorkflowOS | سير العمل | docs/runbooks/workflowos-operator-guide.md |
| Production Support | الدعم الإنتاجي | docs/runbooks/production-support-runbook.md |
| Institutional Memory | الذاكرة المؤسسية | docs/runbooks/institutional-memory-guide.md |
| Intelligence Core | نواة الذكاء | docs/runbooks/intelligence-core-rag.md |

---

## Historical Note — ملاحظة تاريخية

> **Previous state:** docs/products/ was populated with 226+ files before being deleted in commit 8526d11 (2026-07-01) as part of a working tree cleanup that removed "archived docs paths (theoretical-reference, products, audits, reports, systems)." This index was created 2026-07-12 to restore Level 5 hierarchy compliance without duplicating content that exists elsewhere.

> **For files previously at docs/products/:** Check archived worktrees under .claude/worktrees/ or reload from git history (075922) if needed.
