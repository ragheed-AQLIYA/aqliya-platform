# LocalContentOS Operator Guide — دليل تشغيل المحتوى المحلي

> **Product:** LocalContentOS under AQLIYA  
> **Level:** L5 Pilot-ready  
> **Status:** Active | Version 1.0 | 2026-06-30  
> **Routes:** /local-content/*

---

## 1. Overview — نظرة عامة

LocalContentOS is AQLIYA's local content compliance and intelligence workspace. It helps organizations measure, track, and report local content across suppliers, spend, and workforce in alignment with Saudi Vision 2030 localization goals and regulatory requirements.

**Key capabilities:**
- Full lifecycle management of local content projects
- Supplier registration and classification (local/non-local/mixed)
- Spend record tracking and analysis
- AI-powered classification engine with confidence scoring
- Scoring workbook with auto-fill from trial balance
- Review and approval workflow with evidence attachments
- Bilingual PDF and XLSX export with status disclaimers
- Quality dashboards and AI pipeline monitoring
- Pilot readiness assessment tools

**Arabic positioning:**
> نظام إدارة المحتوى المحلي يساعد الجهات على قياس وتتبع وإبلاغ نسبة المحتوى المحلي في المشتريات والمقاولات والقوى العاملة.

---

## 2. Routes — المسارات

The LocalContentOS workspace is accessible under /local-content/:

| Route | Description | Auth Required |
|-------|-------------|---------------|
| /local-content | Dashboard with KPIs and summary | Yes |
| /local-content/projects | Project list with status filters | Yes |
| /local-content/projects/[id] | Project detail (12 sub-tabs) | Yes |
| /local-content/workbook | Scoring workbook list | Yes |
| /local-content/workbook/[id] | Workbook detail with line items | Yes |
| /local-content/review-center | AI suggestion review queue | Yes |
| /local-content/quality-dashboard | AI quality metrics and confidence | Yes |
| /local-content/pilot-readiness | Operational readiness checklist | Yes |
| /local-content/classification-rules | Classification rules engine | Yes |
| /local-content/settings/integrations | ERP and custom integration config | Yes |
| /local-content/campaigns | Campaign management | Yes |
| /local-content/analytics | Analytics and trends | Yes |
| /local-content/outputs | Reports and exports | Yes |
| /local-content/ai-advisor | AI-powered advisor workspace | Yes |

**Route security:** All routes require authentication and organization-scoped access. Unauthorized access returns 404 (not 403) to avoid leaking route existence.

---

## 3. Workflow Lifecycle — دورة حياة المشروع

### States (حالة المشروع)

| Status (English) | Status (Arabic) | Description |
|------------------|-----------------|-------------|
| DRAFT | مسودة | Project created, initial data entry |
| DATA_COLLECTION | جمع البيانات | Gathering supplier, spend, and workforce data |
| CLASSIFICATION | تصنيف | Classifying suppliers and scoring local content |
| REVIEW | مراجعة | Submitted for human review |
| APPROVED | معتمد | Project approved, reports available for export |
| ARCHIVED | مؤرشف | Final read-only state |

### Workflow Flow

DRAFT → DATA_COLLECTION → CLASSIFICATION → REVIEW → APPROVED → ARCHIVED

### Workflow Steps

1. **Create Project** — Define reporting period, scope, and tender requirements
2. **Import Suppliers** — Add suppliers with CR numbers, ownership type, locality status
3. **Record Spend** — Upload procurement records with amounts, categories, contract refs
4. **Classify** — Auto-classify suppliers; AI confidence scoring; manual override available
5. **Attach Evidence** — Upload certificates, contracts, invoices, attestations
6. **Submit for Review** — Status advances to REVIEW
7. **Review and Approve/Reject** — Authorized reviewer examines findings and evidence
8. **Export** — Generate PDF/XLSX/JSON reports
9. **Archive** — Final state

---

## 4. Scoring Engine — محرك التقييم

The local content score is calculated using four weighted metrics:

| Metric | Weight | Description |
|--------|--------|-------------|
| Revenue contribution | 35% | Local customer revenue / total revenue |
| Supplier spend | 35% | Spend with local suppliers / total procurement spend |
| Workforce localization | 20% | Saudi workforce count / total workforce count |
| Asset localization | 10% | Local fixed assets / total fixed assets |

### Calculation Formula

Score = (revenueRatio x 0.35) + (supplierSpendRatio x 0.35) + (workforceRatio x 0.20) + (assetRatio x 0.10)

Each ratio is capped at 1.0 (100%). The final score is expressed as a percentage.

### Workbook Lines

The scoring workbook contains lines organized by section:

| Section | Codes | Description |
|---------|-------|-------------|
| Company Info | INF-01 to INF-02 | Company name, CR number |
| Revenue | REV-01 to REV-03 | Local/foreign/total revenue |
| Cost of Sales | COS-01 to COS-03 | Local/foreign/total COS |
| Gross Profit | GP-01 | Calculated gross profit |
| Supplier Spend | SPN-01 to SPN-03 | Saudi/non-Saudi/total spend |
| Workforce | WRK-01 to WRK-04 | Saudi/total headcount, payroll |
| Assets | AST-01 to AST-02 | Local/total fixed assets |
| Declarations | DEC-01 to DEC-03 | Certificate status, declared LC percent |

Lines can be auto-filled from trial balance (TB) data or entered manually. Confidence levels: high, medium, low.

---

## 5. AI Pipeline — خط الذكاء الاصطناعي

The AI pipeline powers classification suggestions, confidence scoring, and quality monitoring.

### Pipeline Stages

1. **Context Building** — Aggregates data from 7 knowledge sources: supplier records, spend history, classification rules, industry benchmarks, historical patterns, regulatory requirements, evidence metadata
2. **Pattern Suggestion** — AI generates local content pattern suggestions with confidence scores (multi-level: 20%, 50%, 70%, 90%)
3. **Human Review** — All AI suggestions must be reviewed by a human operator. Categories: Accepted, Rejected, Modified, Escalated
4. **Feedback Loop** — Human review decisions feed back into the model for continuous improvement
5. **Quality Metrics Tracking** — Dashboard monitors acceptance rate, average confidence, suggestion count, review turnaround time

### Quality Dashboard Metrics

| Metric | Description |
|--------|-------------|
| Acceptance Rate | Percentage of AI suggestions accepted by human reviewers |
| Avg Confidence | Average confidence score across all suggestions |
| Total Suggestions | Total number of AI suggestions generated |
| Pending Review | Suggestions awaiting human review |
| High Confidence Accepted | High-confidence suggestions that were accepted |
| Low Confidence Rejected | Low-confidence suggestions that were rejected |

---

## 6. Evidence Management — إدارة الأدلة

Evidence is stored via the LocalContentEvidence model with support for multiple evidence types:

| Evidence Type | Description |
|---------------|-------------|
| certificate | Official local content certificate |
| contract | Signed contract or agreement |
| invoice | Purchase invoice |
| attestation | Self-declaration or attestation |
| registration | Commercial registration or license |

**Evidence statuses:** uploaded, verified, reviewed, linked, missing

**How to attach evidence:**
1. Navigate to project detail → Evidence tab
2. Click Upload Evidence (رفع دليل)
3. Select file (PDF, image, document, spreadsheet)
4. Select evidence type
5. Link to supplier (optional)
6. Submit

**Evidence rules:**
- Evidence requires authentication and tenant-scoped access
- Evidence verification status is tracked and audited
- Missing evidence is flagged as a finding
- All evidence is included in export reports

---

## 7. Export Formats — تنسيقات التصدير

### PDF Export

Bilingual (Arabic/English) PDF report with:
- Project overview: name, period, status
- Scoring summary with metrics breakdown
- Supplier list with classifications
- Evidence summary
- Findings and recommendations
- Review and approval history
- Footer with export date, organization, disclaimer

### XLSX Export

Excel workbook with formulas including:
- Raw data sheets (suppliers, spend, classifications)
- Scoring sheet with auto-calculated metrics
- Evidence inventory
- Audit trail summary

### JSON Export

Machine-readable JSON for API consumption:
- All project data serialized
- Metadata and timestamps
- Suitable for integration with external systems

**Permissions:** Export requires OPERATOR role or higher. Export is gated — only APPROVED projects can be exported without warning. Draft exports include watermark: DRAFT — NOT FINAL. Every export is audited.

---

## 8. Findings and Recommendations — النتائج والتوصيات

| Finding Type | Severity | Example |
|--------------|----------|---------|
| low_content | high/medium | Low local content in IT procurement |
| evidence_gap | medium | Missing certificate for joint venture supplier |
| data_quality | low | Foreign suppliers without workforce data |

**Findings workflow:**
1. System detects anomaly during classification
2. Finding created with severity level
3. Operator can add notes and link evidence
4. Findings included in review package
5. Findings appended to export reports

---

## 9. Roles and Permissions — الصلاحيات والأدوار

| Role | Permissions |
|------|-------------|
| VIEWER | View dashboard, projects, and reports |
| OPERATOR | Create/update projects, import data, classify, upload evidence, export |
| REVIEWER | Review findings, approve/reject classifications, submit review decisions |
| APPROVER | Final approval of project scoring and export |
| ADMIN | Full CRUD, manage users, delete data, archive projects |

---

## 10. Audit Trail — سجل التدقيق

| Event | Description |
|-------|-------------|
| project.created | New project created |
| suppliers.imported | Suppliers added to project |
| spend.imported | Spend records uploaded |
| classifications.completed | Classification run completed |
| evidence.uploaded | Evidence file attached |
| evidence.deleted | Evidence removed |
| review.submitted | Review submitted by reviewer |
| approval.decided | Approval or rejection decision |
| report.exported | Report generated for download |
| project.archived | Project moved to archived state |

**View audit trail:** Navigate to project detail → Governance tab.

---

## 11. Dashboard KPIs — مؤشرات الأداء

| Metric | Description |
|--------|-------------|
| Active Projects | Total projects in non-archived states |
| Total Suppliers | All registered suppliers across active projects |
| Total Spend | Aggregate spend amount across all projects |
| Avg LC Score | Average local content score |
| Pending Review | Projects awaiting review |
| AI Acceptance Rate | AI suggestion acceptance rate |
| Avg Confidence | Average AI confidence score |
| Findings | Open findings requiring attention |

---

## 12. Troubleshooting — استكشاف الأخطاء

### Workbook Not Scoring
- Ensure all required sections are populated (revenue, supplier spend, workforce)
- Check that auto-filled values have confidence ratings
- Verify that total values are greater than zero
- Look for NaN or null values in line items

### AI Suggestions Empty
- Check knowledge retrieval layer connectivity
- Verify that the pipeline orchestrator ran successfully
- Ensure at least one supplier and spend record exist
- Check AI service configuration in integrations settings
- Verify model endpoint is reachable

### Export Fails
- Verify pdfkit is installed
- Check file permissions on the output directory
- Ensure project status allows export
- Verify organization storage quota is not exceeded
- Check for special characters in project name or file names

### Classification Errors
- Ensure CR numbers are valid for local suppliers
- Check that locality classification is set for all suppliers
- Verify classification rules are defined in the rules engine
- Check for duplicate supplier entries

### Upload Failures
- Verify file size is within limits (default: 10MB)
- Check supported file types (PDF, DOCX, XLSX, images)
- Ensure storage backend is reachable (local or S3)
- Check disk space for local storage provider

---

## 13. Integration Guide — دليل التكامل

### ERP Integration

1. Navigate to /local-content/settings/integrations
2. Select ERP type (Oracle, SAP, Microsoft Dynamics, Custom)
3. Configure connection parameters (API URL, credentials)
4. Map chart of accounts to local content categories
5. Schedule sync frequency (daily, weekly, monthly)
6. Test connection and validate data mapping

### API Integration

For custom integrations, use the JSON export endpoint:

GET /api/local-content/projects/[id]/export?format=json

Requires authentication and appropriate permissions.

---

## 14. Related Resources — الموارد ذات الصلة

- Product Reference: docs/assets/LOCALCONTENTOS.md
- Pilot Materials: docs/pilot/
- Validation Reports: docs/evidence/reports/
- Architecture: docs/source-of-truth/AQLIYA_ARCHITECTURE.md
- Product Status: docs/source-of-truth/PRODUCT_STATUS_MATRIX.md
- Route Strategy: docs/source-of-truth/ROUTE_STRATEGY.md
- Seed Data: prisma/seed-local-content.ts
- Pipeline Orchestrator: src/lib/local-content/pipeline-orchestrator.ts
- Server Actions: src/actions/local-content/
- Scoring Engine: src/lib/local-content/scoring-engine.ts
