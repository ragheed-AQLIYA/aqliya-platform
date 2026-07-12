# AQLIYA User Manual

> **Version:** v0.1 | **Last Updated:** 2026-07-11 | **Languages:** العربية, English

---

## What is AQLIYA?

**AQLIYA (عقلية)** is a **Private Governed Institutional Intelligence Platform** — a multi-product ecosystem that helps institutions build, operate, and govern intelligent systems within a controlled environment.

### Core Principles

> **AI assists. Humans decide. Evidence governs.**
>
> الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.

### What AQLIYA is NOT

- ❌ Not just an audit tool (AuditOS is one product)
- ❌ Not a SaaS-only platform (Private/On-Prem ready)
- ❌ Not an AI chatbot (governed AI with human oversight)
- ❌ Not a CRM (SalesOS is governed, not generic CRM)

---

## Getting Started

### 1. Login

1. Navigate to your AQLIYA instance URL
2. Click **تسجيل الدخول** (Sign In)
3. Enter your credentials (email + password)
4. Complete MFA if enabled
5. If your organization uses SAML SSO, click **الدخول الموحد** (SSO Login)

**First login:** If you received an invitation email, follow the link to set your password.

### 2. Workspace Layout

AQLIYA uses a **right-to-left (RTL)** layout optimized for Arabic-first workflows.

| Element | Location | Description |
|---------|----------|-------------|
| **Main Navigation** | Top bar | Platform name + product menu |
| **Product Sidebar** | Right side | Current product modules and actions |
| **Content Area** | Center | Main workspace |
| **User Menu** | Top-right | Profile, settings, logout |

### 3. Language

- Default interface language is **Arabic**
- Switch to English using the language toggle in the user menu
- Both languages are fully supported throughout the platform

### 4. User Roles

| Role | Permissions |
|------|-------------|
| **VIEWER** | View dashboards, read data, download exports |
| **OPERATOR** | Create and edit records, run workflows, submit for review |
| **ADMIN** | Full access — manage users, configure settings, approve/reject, delete |

Your role is assigned by your organization administrator.

---

## Products Overview

### AuditOS — نظام المراجعة والتدقيق

AuditOS is the first proof product — a comprehensive financial audit intelligence system.

**Capabilities:**
- Engagement management (create, scope, assign)
- Trial balance upload and account mapping
- Automated financial statement generation
- Evidence vault with file uploads
- AI-assisted review with human oversight
- Findings and recommendations
- Multi-step review and approval workflow
- PDF and XLSX export
- Full audit trail

**Typical users:** Audit managers, engagement leads, reviewers, client liaisons.

### DecisionOS — نظام اتخاذ القرارات

DecisionOS provides governed decision-making workflows.

**Capabilities:**
- Decision request submission
- Context collection and evidence linking
- Options analysis with risk assessment
- Recommendation drafting
- Committee review and voting
- Final decision record with audit trail
- Export decision memo

**Typical users:** Executive management, committee members, decision owners.

### LocalContentOS — نظام المحتوى المحلي

LocalContentOS is a strategic product for managing local content compliance, particularly for the Saudi market.

**Capabilities:**
- Project setup and baseline configuration
- Supplier and vendor registration
- Spend and procurement records
- Local content classification and scoring
- Gap analysis and risk findings
- Evidence upload and verification
- Review, approval, and certification workflow
- Export audit reports and assessments

**Typical users:** Local content officers, procurement managers, compliance teams.

### SalesOS — نظام المبيعات

SalesOS provides governed sales pipeline management with institutional memory.

**Capabilities:**
- Account and contact management
- Deal tracking and pipeline visualization
- Sales memory (interaction history with sensitivity levels)
- Dashboard export (CSV)

**Status:** Prototype (L3) — basic pipeline tracking available. Full governance features in roadmap.

### Office AI Assistant — المساعد المكتبي

A governed shared assistant for AI-powered document tasks.

**Capabilities:**
- Task categories (summarize, draft, analyze, translate)
- Document-aware responses
- Action logs for auditability
- Output download (Markdown, plain text, print-friendly HTML)

**Key principle:** All AI output requires human review. No autonomous decisions.

### WorkflowOS (Sunbul) — سنبل

A workflow and document management system for structured institutional processes.

**Capabilities:**
- Client workspace management
- Document upload and storage
- Record tracking with status workflow
- Export records as PDF
- Escalation handling

---

## Navigation Guide

### Main Navigation

The top navigation bar presents AQLIYA as a platform:

| Menu Item | Translation | Purpose |
|-----------|-------------|---------|
| المنصة | Platform | Overview of AQLIYA Core |
| القطاعات | Industries | Industry-specific solutions |
| الإثبات | Proof | Evidence center, demos, briefs |
| الحوكمة | Governance | Trust architecture, AI governance |
| عن عقلية | About | Company story and team |

### Product Workspace Navigation

Once logged in, access your products from the products menu:

1. Click the AQLIYA logo to return to the platform overview
2. Use the product switcher to navigate between products
3. Each product has its own sidebar with domain-specific modules

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` or `⌘+K` | Command palette (search) |
| `Ctrl+B` or `⌘+B` | Toggle sidebar |
| `Escape` | Close modal / cancel |

---

## Common Tasks

### AuditOS

| Task | Steps |
|------|-------|
| **Create engagement** | AuditOS → Engagements → إنشاء تكليف (Create) → Fill details → Save |
| **Upload trial balance** | Open engagement → قيد المراجعة (Under Review) → تحميل ميزان المراجعة (Upload TB) |
| **Run AI review** | After TB upload → المراجعة الذكية (AI Review) → Review suggestions → Accept/Reject |
| **Generate financial statements** | AI Review complete → القوائم المالية (Statements) → Generate |
| **Add evidence** | Open engagement → الأدلة (Evidence) → رفع دليل (Upload) |
| **Export engagement report** | Open engagement → تصدير (Export) → Choose PDF or XLSX |
| **Approve engagement** | Review complete → الموافقة (Approve) → Confirm |

### LocalContentOS

| Task | Steps |
|------|-------|
| **Create project** | LocalContentOS → المشاريع (Projects) → إنشاء مشروع (Create) |
| **Add supplier** | Open project → الموردون (Suppliers) → إضافة مورد (Add) |
| **Record spend** | Open project → الإنفاق (Spend) → إضافة سجل إنفاق (Add Record) |
| **Run scoring** | After data entry → حساب النتيجة (Calculate Score) |
| **Generate report** | Open project → التقارير (Reports) → Choose report type → Download |

### DecisionOS

| Task | Steps |
|------|-------|
| **Create decision** | DecisionOS → قرار جديد (New Decision) → Fill context → Save |
| **Add options** | Open decision → الخيارات (Options) → إضافة خيار (Add) |
| **Submit for review** | After options → تقديم للمراجعة (Submit for Review) |
| **Approve/reject** | Review queue → مراجعة (Review) → اعتماد/رفض (Approve/Reject) |

### Office AI Assistant

| Task | Steps |
|------|-------|
| **Write a summary** | Office AI → مهمة جديدة (New Task) → اختر تلخيص (Summarize) → Paste text → إنشاء (Generate) |
| **Download output** | After generation → تحميل (Download) → Choose format (MD/TXT/Print) |

---

## Dashboard & Metrics

### Platform Dashboard

The main dashboard displays:
- Active engagements and decisions
- Evidence counts by product
- Recent activity timeline
- Platform health indicators

### Product Dashboards

Each product has its own dashboard:
- **AuditOS:** Engagement pipeline, status breakdown, reviewer workload
- **LocalContentOS:** Project counts, scoring distribution, compliance status
- **DecisionOS:** Decision pipeline, pending reviews, approval rates

---

## Exports & Reports

### Available Export Formats

| Product | Formats | Requires Approval? |
|---------|---------|-------------------|
| AuditOS | PDF, XLSX | Yes (review + approval required) |
| LocalContentOS | CSV (audit), PDF (assessment), XLSX (classification, evidence index) | Yes |
| DecisionOS | Memo (via download) | Yes |
| SalesOS | CSV (dashboard) | No |
| Office AI Assistant | MD, TXT, HTML (print) | No |

### Export Characteristics

All exports include:
- Generated timestamp
- Organization/workspace name
- Status or disclaimer
- Evidence/source references where applicable
- No false certification claims

---

## Data & Privacy

- **Tenant isolation:** Your data is isolated per organization
- **Audit trail:** All mutations are logged and immutable
- **File storage:** Uploads are stored securely (local or S3)
- **AI data:** AI requests are logged; provider data handling follows configured settings
- **Retention:** Data retention policies are configurable by administrators

---

## Support & Feedback

### Getting Help

- **In-app help:** Click the `?` icon in the bottom-right corner
- **Documentation:** See `docs/` for runbooks and operator guides
- **Contact your admin:** For account issues, role changes, or permissions

### Reporting Issues

- **Bugs:** Report through your organization's support channel
- **Feature requests:** Submit via pilot review form or contact your AQLIYA representative

### Pilot Program

If you are part of the pilot program:
- Use the pilot review form at `/pilot-review` for structured feedback
- Your feedback directly shapes product development
- Weekly sync meetings with the AQLIYA team

---

## Glossary

| Term | العربية | Definition |
|------|---------|------------|
| AuditOS | نظام المراجعة والتدقيق | Financial audit intelligence system |
| DecisionOS | نظام اتخاذ القرارات | Governed decision-making system |
| LocalContentOS | نظام المحتوى المحلي | Local content compliance system |
| SalesOS | نظام المبيعات | Governed sales intelligence |
| Evidence | دليل | Source file or record supporting an output |
| Governance | حوكمة | Rules, roles, approvals, and audit trail |
| Tenant | المستأجر | Isolated organization workspace |
| RBAC | صلاحيات الأدوار | Role-based access control |
| RTL | من اليمين إلى اليسار | Right-to-left text direction |

---

## Appendix: System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Browser | Chrome 90+, Firefox 90+, Edge 90+, Safari 15+ | Latest version |
| Screen resolution | 1024×768 | 1920×1080 |
| Internet | 5 Mbps | 25 Mbps |
| PDF viewer | Required for exports | — |
