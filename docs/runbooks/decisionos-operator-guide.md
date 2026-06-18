# DecisionOS Operator Guide — دليل تشغيل قرارات

> **Product:** DecisionOS under AQLIYA  
> **Level:** L5 Pilot-ready  
> **Routes:** /decisions, /decisions/[id]/*, /intelligence/sectors  
> **Last updated:** 2026-06-18

---

## 1. Overview — نظرة عامة

DecisionOS is a governed decision intelligence system under AQLIYA. It helps institutions create, review, approve, and track decisions with full evidence, audit trail, and bilingual (Arabic/English) export.

**Key capabilities:**
- Decision lifecycle management (draft → review → approval → archive)
- 15 specialized decision tabs (overview, intake, signals, sector, risks, scenarios, simulation, recommendation, governance, framework, alerts, insight, outcome, report, tender)
- Evidence upload with DecisionEvidence model and file storage
- Bilingual PDF export (Arabic + English) via pdfkit
- Dashboard with real KPIs (byStatus, byType, byPriority, approvedCount, pendingApproval)
- Audit trail for all mutations
- 10 decision types: TENDER, INVESTMENT, EXPANSION, PROCUREMENT, HIRING, PARTNERSHIP, PRICING, STRATEGIC, OPERATIONS, CUSTOM

---

## 2. Decision Workflow Lifecycle — دورة حياة القرار

### States (حالات القرار)

`
DRAFT ──→ IN_REVIEW ──→ APPROVED ──→ [Implemented]
                    └──→ REJECTED ──→ [Archived]
`

| Status (English) | Status (Arabic) | Description |
|-----------------|-----------------|-------------|
| DRAFT | مسودة | Initial creation. Decision can be edited freely. |
| IN_REVIEW | قيد المراجعة | Decision submitted for review. Evidence and recommendation must be attached. |
| APPROVED | معتمد | Decision approved by authorized reviewer. Export becomes available. |
| REJECTED | مرفوض | Decision rejected. Can be revised and resubmitted. |
| ARCHIVED | مؤرشف | Final state. Decision is read-only. |

### Workflow Steps

1. **Create** — User fills decision intake form (type, priority, title, description, owner)
2. **Develop** — Work through tabs: signals, sector analysis, risks, scenarios, simulation, recommendation
3. **Attach Evidence** — Upload supporting files via DecisionEvidence
4. **Submit for Review** — Status advances to IN_REVIEW
5. **Review & Approve/Reject** — Authorized reviewer examines evidence + recommendation
6. **Export** — If APPROVED, user can export bilingual PDF report
7. **Implement** — Post-approval execution (tracked outside DecisionOS)
8. **Archive** — Final read-only state

---

## 3. Evidence Management — إدارة الأدلة

Evidence is stored via the DecisionEvidence model with the following fields:

- id — unique identifier
- decisionId — linked decision
- ileName — original filename
- ileType — MIME type
- ileSize — size in bytes
- ilePath or ileUrl — storage location
- description — user-provided description
- createdById — who uploaded
- createdAt — timestamp

**How to attach evidence:**
1. Navigate to decision detail page (/decisions/[id])
2. Click the "Evidence" section/tab
3. Click "Upload Evidence" (رفع دليل)
4. Select file (PDF, image, document, spreadsheet)
5. Add optional description
6. Submit

**Evidence rules:**
- Evidence requires authentication and tenant-scoped access
- Evidence deletion is logged to audit trail
- Evidence count is limited per decision (configurable)
- All evidence is included in PDF export

---

## 4. PDF Export Guide — دليل تصدير PDF

DecisionOS generates bilingual PDF reports using pdfkit.

### Export Flow

`
User clicks Export → System generates PDF → Audit log entry (OUTPUT_PUBLISHED) → File download
`

### How to Export

1. Navigate to the decision's Report tab (/decisions/[id]/report)
2. Click "Export PDF" (تصدير PDF)
3. The system generates:
   - Arabic (RTL) content with Arabic labels
   - English content with English labels
   - Decision overview: title, type, status, priority, owner, dates
   - Recommendation summary (if approved)
   - Evidence list with file names
   - Approval history (if approved)
   - Footer with export date, organization, disclaimer

**Permissions:**
- Export requires decision.export permission (OPERATOR role or higher)
- Export is gated — only approved decisions can be exported
- Every export is audited with OUTPUT_PUBLISHED event

### Export Warnings

The system may include warnings in the PDF:
- "No supporting evidence attached to this decision"
- "Decision not yet approved — export is for draft review only"

---

## 5. Audit Trail — سجل التدقيق

Every mutation in DecisionOS is logged. The audit trail captures:

| Event | Description |
|-------|-------------|
| DECISION_CREATED | New decision created |
| DECISION_UPDATED | Decision details modified |
| STATUS_CHANGED | Workflow state transition (e.g., DRAFT → IN_REVIEW) |
| EVIDENCE_UPLOADED | File evidence attached |
| EVIDENCE_DELETED | Evidence removed |
| DECISION_APPROVED | Decision approved by reviewer |
| DECISION_REJECTED | Decision rejected |
| OUTPUT_PUBLISHED | PDF export generated |
| DECISION_ARCHIVED | Decision archived |

**View audit trail:** Navigate to /decisions/[id]/governance tab.

---

## 6. Dashboard KPIs — مؤشرات الأداء

The DecisionOS dashboard (/decisions) displays:

| Metric | Description |
|--------|-------------|
| Total Decisions | Total count of all decisions |
| By Status | Count per status (DRAFT, IN_REVIEW, APPROVED, REJECTED, ARCHIVED) |
| By Type | Count per decision type (TENDER, INVESTMENT, etc.) |
| By Priority | Count per priority level (LOW, MEDIUM, HIGH, URGENT) |
| Approved Count | Decisions with at least one approved review |
| Pending Approval | Decisions with recommendation but no approval |
| In Progress | Decisions that are not draft and not approved |

Data is fetched via getDashboardMetrics() server action.

---

## 7. Roles and Permissions — الصلاحيات والأدوار

| Role | Permissions |
|------|-------------|
| VIEWER | View decisions, view evidence, view dashboard |
| OPERATOR | Create decisions, upload evidence, export PDF, update status |
| ADMIN | Full CRUD, manage users, delete evidence, archive decisions |

**Permission slugs:**
- decision.view — view decisions
- decision.create — create decisions
- decision.edit — edit decisions
- decision.delete — delete decisions
- decision.export — export PDF reports
- decision.approve — approve/reject decisions

---

## 8. FAQ — الأسئلة الشائعة

### How do I create a new decision?
Navigate to /decisions/new. Fill in the required fields (title, type, priority, description, owner). Click "Create Decision" (إنشاء قرار).

### How does approval work?
1. Ensure the decision has a recommendation attached
2. Change status to IN_REVIEW
3. An authorized reviewer examines the decision
4. The reviewer approves or rejects via the approval panel on the Governance tab
5. If approved, the decision status changes to APPROVED

### How do I export a decision?
The decision must be in APPROVED status. Go to the Report tab and click "Export PDF". The export requires decision.export permission.

### Can I edit a decision after it's approved?
Approved decisions are locked. You may need to reject and recreate.

### What happens when I delete evidence?
The evidence file and database record are deleted. An audit event is logged.

### Is the PDF bilingual?
Yes. The PDF is generated with both Arabic (primary) and English (secondary) content.

### How is tenant isolation enforced?
All queries filter by organizationId. Evidence download routes verify tenant access server-side and return 404 on any mismatch.

---

## 9. Related Resources

- DecisionOS Route Table: docs/source-of-truth/ROUTE_STRATEGY.md
- DecisionOS Status: docs/source-of-truth/PRODUCT_STATUS_MATRIX.md
- Architecture: docs/source-of-truth/AQLIYA_ARCHITECTURE.md
- Evidence actions: src/actions/decision-evidence-actions.ts
- Export logic: src/actions/decision-export.ts
- Dashboard: src/actions/decisions.ts (getDashboardMetrics)
- Prisma schema: prisma/schema.prisma (Decision, DecisionEvidence, DecisionStatus enum)
