# AQLIYA Client Onboarding Guide
# دليل تأهيل العملاء — عقلية

**Status:** Active | **Version:** 1.0 | **Date:** 2026-07-25
**Owner:** Commercial Team / Customer Success | **Last Reviewed:** 2026-07-25
**Audience:** Customer success, sales, new clients, implementation teams
**Applies to:** All tiers (Starter, Professional, Enterprise)

---

## Overview — نظرة عامة

This guide defines the standard onboarding process for new AQLIYA Cloud customers. The goal is a structured, predictable path from contract signature to operational use within **2–4 weeks**, depending on tier and complexity.

يُعرّف هذا الدليل عملية التأهيل القياسية لعملاء عقلية السحابية الجدد. الهدف هو مسار منظم ويمكن التنبؤ به من توقيع العقد إلى الاستخدام التشغيلي خلال **2–4 أسابيع**، حسب المستوى والتعقيد.

### Timeline by Tier — الجدول الزمني حسب المستوى

| Tier — المستوى | Typical Timeline — المدة النموذجية |
|----------------|-----------------------------------|
| **Starter** | 2 weeks — أسبوعان |
| **Professional** | 3 weeks — 3 أسابيع |
| **Enterprise** | 4 weeks (with custom integrations) — 4 أسابيع (مع تكاملات مخصصة) |

---

## Phase 1: Discovery — مرحلة الاكتشاف
### Phase 1: Discovery — مرحلة الاكتشاف

**Duration: 2–3 business days — المدة: 2–3 أيام عمل**

### Objectives — الأهداف

- Confirm customer requirements, use cases, and success criteria.
- Identify data sources, existing systems, and integration points.
- Define roles, permissions, and workspace structure.
- Establish communication cadence and escalation paths.

- تأكيد متطلبات العميل وحالات الاستخدام ومعايير النجاح.
- تحديد مصادر البيانات والأنظمة الحالية ونقاط التكامل.
- تحديد الأدوار والصلاحيات وهيكل مساحة العمل.
- إنشاء وتيرة التواصل ومسارات التصعيد.

### Activities — الأنشطة

| Activity — النشاط | Owner — المسؤول | Output — المخرج |
|-------------------|-----------------|-----------------|
| Kick-off meeting | AQLIYA Support + Client Admin | Meeting notes, confirmed scope |
| Requirements workshop | AQLIYA Support + Client Admin | Requirements document |
| Technical discovery | AQLIYA Engineering + Client IT | Integration assessment, data map |
| Role & permissions mapping | Client Admin + AQLIYA Support | Role matrix |
| Success criteria definition | Both parties | KPIs and acceptance criteria |
| Project plan & timeline | AQLIYA Support | Gantt/schedule with milestones |

### Discovery Questionnaire — استبيان الاكتشاف

Key questions to resolve during discovery:

- Which product workspace(s) will be used? (AuditOS / LocalContentOS / both)
- How many users? What roles? (VIEWER, EDITOR, REVIEWER, APPROVER, ADMIN)
- Is SSO required? Which identity provider? (SAML/OIDC)
- What data needs to be imported/migrated? (format, volume, source system)
- Are there regulatory or compliance requirements specific to the client?
- What are the top 3 workflows the client wants operational first?
- Who is the designated Client Admin? (must have technical authority)

---

## Phase 2: Setup — مرحلة الإعداد
### Phase 2: Setup — مرحلة الإعداد

**Duration: 3–7 business days — المدة: 3–7 أيام عمل**

### Objectives — الأهداف

- Provision the AQLIYA tenant and workspaces.
- Configure authentication (SSO if applicable).
- Set up user accounts, roles, and permissions.
- Import or seed initial data.
- Configure product-specific settings.

- تجهيز مستأجر عقلية ومساحات العمل.
- إعداد المصادقة (SSO إن وجد).
- إنشاء حسابات المستخدمين والأدوار والصلاحيات.
- استيراد أو تهيئة البيانات الأولية.
- إعداد الإعدادات الخاصة بالمنتج.

### Activities — الأنشطة

| Activity — النشاط | Owner — المسؤول | Timeline — المدة |
|-------------------|-----------------|-----------------|
| Tenant provisioning | AQLIYA Engineering | Day 1 |
| SSO configuration (if applicable) | AQLIYA Engineering + Client IT | 1–3 days |
| User account creation | Client Admin (self-service) or AQLIYA Support | 1–2 days |
| Role & permission assignment | Client Admin | 1 day |
| Workspace configuration | AQLIYA Support + Client Admin | 1–2 days |
| Data import / migration | AQLIYA Support (with Client IT) | 2–5 days |
| Feature flag activation | AQLIYA Engineering | Day 1 (per scope) |
| Integration setup (if applicable) | AQLIYA Engineering + Client IT | 2–5 days |

### Data Migration Assistance — المساعدة في ترحيل البيانات

Scope of AQLIYA-assisted data migration (included in Enterprise tier; add-on for Starter/Professional):

| Activity — النشاط | Scope — النطاق |
|-------------------|----------------|
| **Data format assessment** | AQLIYA reviews client data schemas and advises on mapping |
| **CSV/Excel import** | AQLIYA provides templates and imports up to 50 GB |
| **ERP connector setup** | Enterprise tier: SAP, Oracle, or generic REST connector |
| **Data validation** | Row-count verification + sample spot-checks |
| **Historical data** | Import of last 12–24 months (per SOW) |
| **Excluded** | Data cleansing, deduplication, or transformation beyond template mapping |

**Client responsibilities:**

- Provide data in agreed format (CSV, Excel, or API-accessible source).
- Validate imported data within 5 business days of import completion.
- Flag discrepancies with specific examples.

---

## Phase 3: Training — مرحلة التدريب
### Phase 3: Training — مرحلة التدريب

**Duration: 2–5 business days — المدة: 2–5 أيام عمل**

### Objectives — الأهداف

- Ensure Client Admin can manage users, roles, workspaces, and configurations.
- Ensure end users can perform core workflows in their assigned product.
- Provide reference materials and documentation.

- ضمان قدرة مدير النظام لدى العميل على إدارة المستخدمين والأدوار ومساحات العمل والإعدادات.
- ضمان قدرة المستخدمين النهائيين على تنفيذ سير العمل الأساسي في منتجهم.
- توفير مواد مرجعية ووثائق.

### Training Sessions — جلسات التدريب

#### Session 1: Admin Training — تدريب المديرين
#### Session 1: Admin Training — تدريب المديرين

**Duration: 2–3 hours | Audience: Client Admin(s) | Delivery: Remote (video call)**

| Module — الوحدة | Topics — المواضيع |
|-----------------|-------------------|
| **Platform overview** | Navigation, dashboard, AQLIYA Intelligence Core |
| **User management** | Create/edit/deactivate users, role assignment, bulk import |
| **SSO & authentication** | SAML/OIDC management, MFA enforcement, session policies |
| **Workspace management** | Create workspaces, assign products, configure settings |
| **Permissions & RBAC** | Role hierarchy, tenant isolation, audit log access |
| **Monitoring & reporting** | Platform health dashboard, audit logs, export |
| **Support process** | Ticket creation, escalation paths, SLA expectations |

#### Session 2: User Training — تدريب المستخدمين
#### Session 2: User Training — تدريب المستخدمين

**Duration: 2–4 hours (per product) | Audience: End users (by role) | Delivery: Remote (video call)**

| Module — الوحدة | Topics — المواضيع |
|-----------------|-------------------|
| **Product workspace** | Product-specific navigation and workflow |
| **Core workflows** | Create, review, approve, export (hands-on walkthrough) |
| **Evidence & documents** | Upload, attach, version management |
| **AI-assisted features** | How AI helps, human review requirements, confidence scores |
| **Export & reports** | Generate reports, download, disclaimers |
| **Common tasks** | Role-specific daily workflows |

### Training Materials — المواد التدريبية

All clients receive:

- **Quick Reference Card** (PDF, bilingual AR/EN) — one-page workflow summary
- **User Manual** — linked from within the platform (per product)
- **Video Library** — recorded training sessions for self-paced review
- **Sandbox Workspace** — safe environment for practice (Professional and Enterprise only)

---

## Phase 4: Go-Live — مرحلة التشغيل
### Phase 4: Go-Live — مرحلة التشغيل

**Duration: 1–3 business days — المدة: 1–3 أيام عمل**

### Objectives — الأهداف

- Validate all systems are operational.
- Confirm users can access and perform workflows.
- Formal handover from onboarding to support.
- Begin operational monitoring.

- التحقق من أن جميع الأنظمة تعمل.
- تأكيد قدرة المستخدمين على الوصول وتنفيذ سير العمل.
- التسليم الرسمي من التأهيل إلى الدعم.
- بدء المراقبة التشغيلية.

### Go-Live Checklist — قائمة تشغيل ما قبل الانطلاق

| # | Item — البند | Owner — المسؤول | ✓ |
|---|-------------|-----------------|---|
| 1 | All user accounts created and verified | Client Admin | ☐ |
| 2 | SSO login tested (if applicable) | Client IT | ☐ |
| 3 | Roles and permissions verified per role matrix | AQLIYA Support | ☐ |
| 4 | Data import validated (row counts + spot checks) | Client Admin | ☐ |
| 5 | Core workflow tested end-to-end (by product) | Client Users + AQLIYA Support | ☐ |
| 6 | Export/report generation tested | Client Users | ☐ |
| 7 | Evidence upload/download tested | Client Users | ☐ |
| 8 | Audit log accessible and recording events | AQLIYA Support | ☐ |
| 9 | Support contact info shared with all users | AQLIYA Support | ☐ |
| 10 | Go/No-Go decision meeting held | Both parties | ☐ |
| 11 | Production access enabled (remove sandbox flags) | AQLIYA Engineering | ☐ |
| 12 | Monitoring alerts configured for client tenant | AQLIYA Engineering | ☐ |

### Go/No-Go Criteria — معايير الانطلاق/التأجيل

**GO conditions — شروط الانطلاق:**

- All 12 checklist items completed.
- No blocking P1/P2 issues open.
- Client Admin confirms readiness in writing.

**NO-GO conditions — شروط التأجيل:**

- Critical workflow fails end-to-end test.
- SSO/authentication blocking users.
- Data import incomplete or unvalidated.
- Client requests delay.

---

## Phase 5: First 30 Days Support — دعم أول 30 يوماً
### Phase 5: First 30 Days Support — دعم أول 30 يوماً

After go-live, AQLIYA provides enhanced support during the hypercare period.

بعد الانطلاق، تقدم عقلية دعماً معززاً خلال فترة العناية المركزة.

### Hypercare Activities — أنشطة العناية المركزة

| Week — الأسبوع | Activity — النشاط | Owner — المسؤول |
|----------------|-------------------|-----------------|
| **Week 1** | Daily check-in (30 min) — use review, issue triage | AQLIYA Support + Client Admin |
| **Week 2** | Twice-weekly check-in — workflow optimization, feedback | AQLIYA Support + Client Admin |
| **Week 3** | Weekly check-in — adoption metrics review | AQLIYA Support + Client Admin |
| **Week 4** | Weekly check-in + 30-day review meeting | Both parties |

### 30-Day Review — مراجعة الـ 30 يوماً

| Agenda Item — بند الجدول | Details — التفاصيل |
|--------------------------|---------------------|
| **Adoption metrics** | Active users, logins, workflows completed, exports generated |
| **Issue resolution** | Tickets opened, resolved, outstanding; SLA performance |
| **User feedback** | Survey results, common themes, feature requests |
| **Optimization** | Configuration adjustments, workflow improvements identified |
| **Next steps** | Additional training needs, expansion plans, renewal |

### Transition to Standard Support — الانتقال للدعم القياسي

After 30 days, the client transitions to standard support per their tier SLA. Key changes:

- Check-in cadence shifts to monthly (Starter/Professional) or bi-weekly (Enterprise).
- Ticket priority returns to standard SLA response times.
- Client Admin becomes primary point of contact for user-level issues.

---

## Roles & Responsibilities — الأدوار والمسؤوليات

| Role — الدور | Responsibilities — المسؤوليات |
|-------------|------------------------------|
| **Client Admin — مدير النظام لدى العميل** | User management, role assignment, initial configuration, first-line support for their users, data validation, go/no-go decision authority. — إدارة المستخدمين، تعيين الأدوار، الإعداد الأولي، دعم الخط الأول لمستخدميهم، التحقق من البيانات، سلطة قرار الانطلاق/التأجيل. |
| **Client Users — المستخدمون لدى العميل** | Attend training, execute workflows, report issues, provide feedback. — حضور التدريب، تنفيذ سير العمل، الإبلاغ عن المشكلات، تقديم الملاحظات. |
| **AQLIYA Support — دعم عقلية** | Project management, tenant provisioning, SSO setup, data migration assistance, training delivery, go-live validation, hypercare support. — إدارة المشروع، تجهيز المستأجر، إعداد SSO، المساعدة في ترحيل البيانات، تقديم التدريب، التحقق من الانطلاق، دعم العناية المركزة. |
| **AQLIYA Engineering — هندسة عقلية** | Technical integration, custom development (per SOW), infrastructure provisioning, monitoring configuration. — التكامل التقني، التطوير المخصص (حسب العقد)، تجهيز البنية التحتية، إعداد المراقبة. |

---

## Escalation During Onboarding — التصعيد أثناء التأهيل

| Level — المستوى | Trigger — المحفز | Contact — جهة الاتصال |
|-----------------|-------------------|----------------------|
| **L1** | Routine issue, question | AQLIYA Support (support@aqliya.com) |
| **L2** | Blocking issue unresolved > 24h | Onboarding Lead |
| **L3** | Go-live at risk, integration failure | Customer Success Manager |
| **L4** | Contract-level escalation | Account Executive / Founder |

---

## What Onboarding Does NOT Include — ما لا يتضمنه التأهيل

Per `WHAT_WE_DO_NOT_CLAIM.md`:

- Custom software development beyond configured integrations.
- Data cleansing, enrichment, or transformation beyond template mapping.
- Third-party system configuration (ERP, CRM, etc.) outside AQLIYA connectors.
- Business process re-engineering or consulting.
- Legal or regulatory compliance advice.
- On-Prem or Air-Gapped deployment setup (strategic future only).

---

## Related Documents — وثائق ذات صلة

| Document | Path |
|----------|------|
| Pricing Model | `docs/commercial/PRICING_MODEL.md` |
| SLA Template | `docs/commercial/SLA_TEMPLATE.md` |
| Pilot SOW Template | `docs/commercial/PILOT_SOW_TEMPLATE.md` |
| What We Do Not Claim | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` |
| Pilot User Guide | `docs/pilot/PILOT_USER_GUIDE.md` |
| Demo Flow | `docs/pilot/DEMO_FLOW.md` |

---

## Change Log — سجل التغييرات

| Date | Version | Change |
|------|---------|--------|
| 2026-07-25 | 1.0 | Initial onboarding guide — bilingual AR/EN |

---

*This guide is a living document. Update after every client onboarding retrospective.*
*هذا الدليل وثيقة حية. يُحدّث بعد كل مراجعة تأهيل عميل.*
