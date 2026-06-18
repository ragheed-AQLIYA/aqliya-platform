# WorkflowOS Operator Guide — دليل تشغيل سير العمل

> **Product:** WorkflowOS under AQLIYA  
> **Level:** L5 Pilot-ready  
> **Routes:** `/workflowos`, `/workflowos/templates/*`, `/workflowos/records/*`  
> **Alias:** `/sunbul/*` → permanent redirect to `/workflowos/*`
> **Last updated:** 2026-06-18

---

## 1. Overview — نظرة عامة

WorkflowOS is a governed workflow automation system under AQLIYA. It enables institutions to create template-based workflows with step-by-step execution, evidence tracking, SLA monitoring, and gated export with approval.

**Key capabilities:**
- Template-based workflow creation (categories: general, approval, review, inspection, custom)
- Step-by-step execution with `currentStep` tracking
- Evidence upload via WorkflowEvidence model
- SLA monitoring with escalation
- Export workflow: request → approve/reject → download
- Audit events via WorkflowAuditEvent model
- Dashboard with real metrics

---

## 2. Template Creation — إنشاء النماذج

Workflow templates define the structure of a workflow before execution.

### Template Fields

| Field | Type | Description |
|-------|------|-------------|
| name | String | Template name (العنوان) |
| description | Text | Optional description (الوصف) |
| category | Enum | general, approval, review, inspection, custom |
| status | String | active (default) or inactive |
| steps | JSON | Array of step definitions |

### Step Definition Format

Each step in the `steps` JSON array has:

| Field | Type | Description |
|-------|------|-------------|
| index | Number | Step order (0-based) |
| label | String | Step name |
| description | String | Step description |
| assigneeRole | String | Who performs this step |
| slaMinutes | Number | Time limit in minutes (optional) |
| requiredEvidence | Boolean | Whether evidence upload is required |

### How to Create a Template

1. Navigate to `/workflowos/templates/new`
2. Enter template name, description, and category
3. Add steps with labels and optional SLA limits
4. Click "Create Template" (إنشاء النموذج)
5. The template is created in active status

---

## 3. Workflow Execution — تنفيذ سير العمل

### Record States

`PENDING → IN_PROGRESS → COMPLETED`
`IN_PROGRESS → REJECTED → CANCELLED`

| Status | Description |
|--------|-------------|
| PENDING | Workflow created, not yet started |
| IN_PROGRESS | Active execution, currentStep tracking |
| COMPLETED | All steps completed successfully |
| REJECTED | Rejected at some step |
| CANCELLED | Cancelled by operator |

### How to Start a Workflow

1. Navigate to `/workflowos/templates`
2. Select a template and click "Start Workflow" (بدء سير العمل)
3. Fill in record details: title, description, priority, assignee, due date
4. Click "Create Record" (إنشاء السجل)
5. The record starts in PENDING status

### Step Execution

1. Open the record at `/workflowos/records/[id]`
2. The current step is highlighted
3. Perform the step's required actions
4. Upload evidence if required
5. Click "Complete Step" (إكمال الخطوة)
6. System advances `currentStep` and logs the action

---

## 4. Evidence Tracking — تتبع الأدلة

Evidence is stored via the `WorkflowEvidence` model.

**How to attach evidence to a workflow record:**
1. Open the record detail page
2. Click "Upload Evidence" (رفع دليل)
3. Select file (PDF, image, document)
4. Add optional description
5. Submit

**Evidence fields:**
- `id` — unique identifier
- `recordId` — linked workflow record
- `fileName` — original filename
- `fileType` — MIME type
- `fileSize` — size in bytes
- `fileUrl` — storage location
- `description` — user description
- `createdById` — who uploaded
- `createdAt` — timestamp

Evidence is linked to the specific workflow step via `stepIndex` in metadata.

---

## 5. SLA Monitoring — مراقبة مستوى الخدمة

SLA monitoring is handled by `src/lib/workflowos/sla-service.ts`.

### SLA Status Levels

| Status | Color | Description |
|--------|-------|-------------|
| on_track | Green | Within time limits |
| approaching | Yellow | Near time limit (default: 80% elapsed) |
| overdue | Orange | Past time limit |
| breached | Red | Time limit exceeded |

### How SLA Works

1. Each template step can have `slaMinutes` configured
2. When a step starts, `dueAt` is calculated: `createdAt + slaMinutes`
3. The SLA status is checked based on elapsed time vs total allowed time
4. If approaching threshold is crossed, a warning is raised
5. If breached, escalation can be triggered via `src/lib/workflowos/escalation-service.ts`

### Escalation

When an SLA is breached:
1. The record can be escalated to a supervisor or manager
2. Escalation is tracked via `escalatedAt` and `escalatedToId` fields
3. Notification is sent to the escalation target

---

## 6. Export with Approval — التصدير مع الموافقة

WorkflowOS exports require an approval workflow before download.

### Export Flow

`User requests export → Status: requested`
`Operator/Admin approves → Status: approved → Download available`
`Operator/Admin rejects → Status: rejected → Reason recorded`

### How to Export

1. Navigate to the workflow record detail
2. Click "Request Export" (طلب تصدير)
3. The export status changes to "requested"
4. An authorized user reviews the export request
5. If approved: status changes to "approved" and PDF becomes available for download
6. If rejected: status changes to "rejected" with a reason

### PDF Export Details

The PDF is generated via `src/lib/workflowos/export/pdf-export.ts` using pdfkit:
- Arabic + English bilingual content
- Organization name and export date
- Record title, status, steps, and evidence list
- Footer: "WorkflowOS — AQLIYA"

### API Routes for Export

- Request: `requestWorkflowExport` action
- Approve: `approveWorkflowExport` action
- Reject: `rejectWorkflowExport` action
- Download: `/api/workflowos/documents/[documentId]/download`

---

## 7. Dashboard Metrics — مؤشرات الأداء

The WorkflowOS dashboard (`/workflowos`) displays:

| Metric | Description |
|--------|-------------|
| Total Records | Count of all workflow records |
| By Status | PENDING, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED |
| By Template | Records grouped by template |
| SLA Status | Count on_track, approaching, overdue, breached |
| Export Queue | Number of pending export requests |
| Recent Activity | Last 10 audit events |

Data is fetched via `getWorkflowDashboardStats()` server action.

---

## 8. Roles and Permissions — الصلاحيات والأدوار

| Role | Permissions |
|------|-------------|
| VIEWER | View templates, records, dashboard |
| OPERATOR | Create records, upload evidence, complete steps, request export |
| ADMIN | Full CRUD, approve/reject exports, manage templates, manage users |

**Permission slugs:**
- `workflow.view` — view workflows
- `workflow.create` — create records
- `workflow.edit` — edit records
- `workflow.delete` — delete records
- `workflow.export` — export PDF
- `workflow.approve` — approve export requests

---

## 9. FAQ — الأسئلة الشائعة

### How do I create a workflow template?
Go to `/workflowos/templates/new`. Add name, description, category, and steps. Each step can have a label, description, and optional SLA time limit.

### How do I start a workflow from a template?
Go to `/workflowos/templates`, select a template, click "Start Workflow". Fill in the record details.

### Can I edit a workflow after it starts?
The template structure is fixed at creation time. Step results are tracked as JSON in `stepResults`. Record metadata can be updated.

### How does SLA monitoring help?
SLA monitoring tracks time per step. If a step takes too long, it moves from on_track to approaching to overdue to breached. Escalation can notify supervisors.

### How do I export a completed workflow?
Open the record, click "Request Export". An authorized user must approve the request. After approval, the PDF is available for download.

### Where are audit events stored?
Workflow audit events are stored in the `WorkflowAuditEvent` model. View them via the record detail page or the admin panel.

### What is the difference between WorkflowOS and Sunbul?
Sunbul is a legacy alias. All `/sunbul/*` routes are `permanentRedirect(302)` to the matching `/workflowos/*` routes. There is no separate Sunbul implementation.

---

## 10. Related Resources

- WorkflowOS Route Table: `docs/source-of-truth/ROUTE_STRATEGY.md`
- WorkflowOS Status: `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- Architecture: `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`
- Workflow actions: `src/actions/workflowos-actions.ts`
- Export: `src/actions/workflowos-export-actions.ts`
- SLA: `src/lib/workflowos/sla-service.ts`
- Escalation: `src/lib/workflowos/escalation-service.ts`
- Audit: `src/lib/workflowos/audit.ts`
- Prisma schema: `prisma/schema.prisma` (WorkflowTemplate, WorkflowRecord, WorkflowEvidence, WorkflowAuditEvent)
- RAG pipeline: `docs/runbooks/intelligence-core-rag.md`