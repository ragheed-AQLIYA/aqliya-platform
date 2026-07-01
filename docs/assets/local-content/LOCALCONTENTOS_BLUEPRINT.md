# LocalContentOS — Product Blueprint

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Product Blueprint — Brownfield alignment under LIA-001
> **Predecessor:** Existing L5 implementation (built before IES-001)
> **Template:** Adapted from `SALESOS_V2_BLUEPRINT.md` (IES-001 Reference Template)
> **Note:** This document describes the existing product as implemented, not a new design. Alignment is documentation/format/process, not structural redesign.

---

## Purpose

LocalContentOS is the second strategic product under AQLIYA — a **governed local content intelligence workspace** for Saudi-market institutions to measure, classify, score, review, and report on local content compliance and performance across their supply chain.

This Blueprint retroactively documents the existing L5 implementation in the Standard IES-001 format. It does not propose new capabilities — it aligns existing ones.

---

### How to Read This Document

Each section must pass three tests:

| # | Question | If No |
|---|---|---|
| 1 | Does this section accurately represent LocalContentOS as implemented? | Section is incorrect |
| 2 | Can this section's structure be reused for another product (with different content)? | Template needs revision |
| 3 | Does this section depend only on Platform Capabilities (not on other products)? | Violates Product Independence |

---

# 1. Product Profile

| Field | Value |
|---|---|
| **Product ID** | `local-content` |
| **Product Name** | LocalContentOS |
| **Product Version** | 0.1 (L5 Pilot-ready) |
| **Product Tagline (EN)** | Governed Local Content Intelligence |
| **Product Tagline (AR)** | ذكاء المحتوى المحلي الحوكمي |
| **Product Type** | Specialized Operating System under AQLIYA |
| **Parent Platform** | AQLIYA Platform Core |
| **Required Platform Capabilities** | `platform.auth`, `platform.evidence`, `platform.workflow` |
| **Optional Platform Capabilities** | `platform.ai`, `platform.knowledge` |
| **Product Capabilities** | Project Management, Supplier Classification, Spend Analytics, Content Scoring, Evidence Management, Finding & Risk Detection, Review & Approval, Report & Export, AI Advisory, Tender Matching |
| **Deployment Modes** | SaaS (v0.1), Private Cloud (planned) |
| **Licensing Unit** | Per-organization, per-product. Independent of AuditOS, DecisionOS. |
| **Edition Matrix** | Core (v0.1), Enterprise (planned) |
| **First Consumer Of** | `platform.evidence`, `platform.ai` (via AI advisor governance) |
| **Governance Constitution** | All 12 principles apply. Highest priority: Product Independence. |

---

# 2. Vision

## 2.1 Product Vision Statement

> **LocalContentOS is the governed local content intelligence workspace for Saudi-market institutions and government entities.**
>
> It enables organizations to measure, classify, and report on local content across their supply chain — from supplier registration and spend classification through evidence-based verification, AI-assisted gap detection, scoring, review, approval, and auditable export.
>
> LocalContentOS does not clone ERP modules or procurement systems. It is a **governed intelligence product** that sits above procurement data, transforming raw spend and supplier records into measurable local content compliance intelligence.

## 2.2 Key Differentiators from Generic Tools

| Dimension | Generic Approach | LocalContentOS |
|---|---|---|
| Data model | Spreadsheet or ERP report | Structured project with suppliers, spend, classification, evidence, findings, reviews |
| Workflow | Manual tracking | 11-state governed project lifecycle with audit trail |
| Scoring | Ad-hoc calculation | Deterministic weighted scoring (40% locality, 25% ownership, 20% workforce, 15% declared content) |
| Evidence | File storage | Structured evidence vault with type, status, verification, reviewer audit |
| Classification | Manual entry | Multi-basis classification (certificate, self-declaration, contract term, analyst estimate) |
| AI | No governance | Governed AI advisor with confidence scores, human review, audit log |
| Tender matching | Manual cross-reference | Automated tender-to-supplier matching with compliance scoring |
| Reports | Ad-hoc PDF | Multi-format export (PDF, XLSX) with disclaimers, audit trail, approval gating |
| Arabic UX | English-first | Arabic-first RTL UI with bilingual terminology |

## 2.3 Product Principles (derived from Constitution)

| Principle | LocalContentOS Application |
|---|---|
| Product Independence | LocalContentOS must work with only the Platform Core. No dependency on AuditOS, DecisionOS, or SalesOS. |
| Platform Neutrality | LocalContentOS must not introduce product-specific concepts into the Platform Core. No LocalContentSupplier type in platform. |
| AI Governance | Every AI output must have confidence scores, governance metadata, human review, and audit trail. No autonomous decisions. |
| Evidence Governance | All scoring and findings must be traceable to source evidence. No evidence = no claim. |
| Commercial Truth | No claim of certified audit opinion, no claim of regulator-approved reporting, no claim of autonomous compliance certification. |

---

# 3. Product Boundaries

## 3.1 In Scope for v0.1

| Area | Scope |
|---|---|
| Project Management | Create, track, manage local content assessment projects with 11-state lifecycle |
| Supplier Registry | Register suppliers with CR numbers, locality, ownership, workforce data |
| Spend Records | Import and categorize spend by supplier, category, period (SAP/Oracle/CSV) |
| Supplier Classification | Classify suppliers by locality (local/non-local/mixed), ownership, content percentage |
| Content Scoring | Deterministic weighted scoring: composite score per supplier + aggregated project score |
| Evidence Vault | Upload, link, review, verify evidence files per supplier/spend/classification |
| Finding & Risk Detection | Detect evidence gaps, low content, unclassified suppliers, data quality issues, compliance risks |
| Review Workflow | Multi-step review: submit, return with comments, complete review cycle |
| Approval Workflow | Final approval with decision snapshot and audit trail |
| Report Generation | PDF and XLSX exports: assessment summary, supplier register, spend classification, gap/risk, evidence index, final package |
| Audit Trail | Every mutation logged with actor, action, before/after state, entity reference |
| AI Advisory | AI-powered suggestions for classification, gap detection, finding prioritization with governance |
| Tender Matching | Match supplier capabilities to tender requirements with compliance scoring |
| Verification Checklist | Structured verification workflow with checklist management |
| Spend Analytics | Organization-wide spend distribution, local content percentage trends, category breakdown |
| Arabic-First UX | Full RTL, Arabic labels, bilingual terminology, Arabic-Indic digits support |
| ERP Integration | SAP, Oracle, CSV data import pipelines |

## 3.2 Out of Scope for v0.1

| Area | Reason | Future |
|---|---|---|
| CRM Sync | Product boundary — procurement data import is sufficient | v0.2 as integration module |
| Automated ERP Sync (real-time) | Not implemented; batch import only | v0.2+ |
| ML-based Scoring | v0.1 uses deterministic scoring only | v0.2 |
| Regulatory Filing | No regulator API integration | v0.2+ or separate product |
| Supply Chain Risk Monitoring | Not procurement risk; local content scope only | v0.2+ |
| Vendor Management Platform | Product boundary — supplier registry is assessment scope only | Not LocalContentOS scope |
| Certificate Verification API | No integration with government certificate databases | v0.2+ |
| Multi-language (beyond EN/AR) | Not in scope for Saudi market | v0.2+ |

## 3.3 Product Boundary Matrix

| Capability | LocalContentOS | Platform Core | Other Product |
|---|---|---|---|
| Supplier data | ✅ Domain model | ❌ | ❌ |
| Spend data | ✅ Domain model | ❌ | ❌ |
| User authentication | ❌ | `platform.auth` | ❌ |
| Evidence storage | ✅ Internal (file + metadata) | `platform.evidence` (consumer) | ❌ |
| Workflow/lifecycle | ✅ 11-state state machine | `platform.workflow` (adapter) | ❌ |
| AI generation | ✅ Governed AI advisor | `platform.ai` (patterns) | ❌ |
| Audit events | ✅ Internal audit model | Platform audit pattern | ❌ |
| Report generation | ✅ Internal PDF/XLSX | ❌ | ❌ |
| ERP data | ✅ Import adapters | ❌ | Integration scope |
| Intelligence cross-ref | ❌ | ❌ | AuditOS (bridge adapter) |

---

# 4. Business Capabilities

Mapped from the AQLIYA Architecture Constitution Business Capability Map:

| Business Capability | Platform Capability | How LocalContentOS Consumes It |
|---|---|---|
| Identity & Access Management | `platform.auth` | Authenticate users, authorize actions (middleware role guard: viewer minimum) |
| Business Workflow Orchestration | `platform.workflow` | Project lifecycle transitions with guards via adapter |
| Governed AI Intelligence | `platform.ai` | AI advisor suggestions for classification, gap detection, finding prioritization |
| Evidence & Audit Management | `platform.evidence` | Evidence file upload, linking, verification, integrity hashing |

---

# 5. Product Capabilities

These are LocalContentOS-specific capabilities. They sit between Business Capabilities (shared) and Domains (structural).

| Product Capability | Description | Business Capability | Platform Capabilities Used |
|---|---|---|---|
| **Project Management** | Create, track, manage local content assessment projects through 11-state lifecycle | Business Workflow Orchestration | `platform.workflow`, `platform.auth` |
| **Supplier Classification** | Register suppliers, classify by locality/ownership, score content percentage | Identity & Access Management | `platform.auth` |
| **Spend Analytics** | Import spend data, categorize, compute local content percentage, trend analysis | Evidence & Audit Management | `platform.auth` |
| **Content Scoring** | Deterministic multi-factor weighted scoring per supplier and project aggregate | Evidence & Audit Management | `platform.auth` |
| **Evidence Management** | Upload, link, review, verify evidence with type classification and status tracking | Evidence & Audit Management | `platform.evidence`, `platform.auth` |
| **Finding & Risk Detection** | Detect gaps, low content, unclassified suppliers, quality issues, compliance risks | Governed AI Intelligence | `platform.ai`, `platform.auth` |
| **Review & Approval** | Multi-step review workflow with return/comment, final approval with decision snapshot | Business Workflow Orchestration | `platform.workflow`, `platform.auth` |
| **Report & Export** | Generate PDF/XLSX reports with disclaimers, audit trail, approval gating | Evidence & Audit Management | `platform.auth` |
| **AI Advisory** | AI-powered suggestions for classification, gap detection, finding prioritization with governance | Governed AI Intelligence | `platform.ai`, `platform.auth` |
| **Tender Matching** | Match supplier capabilities to tender requirements with compliance scoring | Evidence & Audit Management | `platform.auth` |

---

# 6. Capability Ownership Matrix

| Business Capability | Platform Capability | Product Capability | Domain | Modules |
|---|---|---|---|---|
| Business Workflow Orchestration | `platform.workflow` | Project Management | Project | ProjectCreate, ProjectDetail, ProjectList, ProjectStatusTransition |
| Identity & Access Management | `platform.auth` | Supplier Classification | Supplier | SupplierForm, SupplierList, SupplierDetail, ClassificationForm |
| Evidence & Audit Management | `platform.auth` | Spend Analytics | Spend | SpendForm, SpendList, SpendAnalyticsView, SpendTrends |
| Evidence & Audit Management | `platform.auth` | Content Scoring | Score | ScoringEngine, ScoringResult, SupplierScoreCard |
| Evidence & Audit Management | `platform.evidence` | Evidence Management | Evidence | EvidenceUpload, EvidenceList, EvidenceReview, EvidenceVerification |
| Governed AI Intelligence | `platform.ai` | Finding & Risk Detection | Finding | FindingForm, FindingList, FindingSeverityMatrix, DetectionEngine |
| Business Workflow Orchestration | `platform.workflow` | Review & Approval | Review, Approval | ReviewQueue, ReviewForm, ApprovalForm, ApprovalHistory |
| Evidence & Audit Management | `platform.auth` | Report & Export | Report | ReportGeneration, ReportDownload, ReportList |
| Governed AI Intelligence | `platform.ai` | AI Advisory | AI | AIAdvisorOverview, AIAdvisorDetail, AISuggestionReview |
| Evidence & Audit Management | `platform.auth` | Tender Matching | Tender | TenderMatchView, TenderSpecForm, MatchResults |

---

# 7. Domain Model

## 7.1 Bounded Contexts

```text
┌──────────────────────────────────────────────────────────────────┐
│  Project Context                         Classification Context   │
│  ┌──────────────────────┐              ┌──────────────────────┐  │
│  │ Project              │              │ Classification       │  │
│  │ - name, period       │──has many──▶ │ - localPercentage    │  │
│  │ - status (11-state)  │              │ - basis              │  │
│  │ - score              │              │ - confidence         │  │
│  └──────┬───────────────┘              └──────────────────────┘  │
│         │                                                         │
│         │ has many                   has many                     │
│         ▼                           through classification        │
│  ┌──────────────────────┐              ┌──────────────────────┐  │
│  │ Supplier             │◄────────────▶│ SpendRecord          │  │
│  │ - CR number          │  one-to-many│ - amount, category   │  │
│  │ - locality           │              │ - period             │  │
│  │ - ownership          │              └──────────────────────┘  │
│  └──────┬───────────────┘                                         │
│         │                                                         │
│         │ has many                                                │
│         ▼                                                         │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Evidence Context                  Finding Context        │    │
│  │  ┌─────────────────────┐          ┌────────────────────┐ │    │
│  │  │ Evidence            │          │ Finding            │ │    │
│  │  │ - type, status      │          │ - type, severity   │ │    │
│  │  │ - file, hash, size  │          │ - status           │ │    │
│  │  │ - reviewedBy        │          │ - linked evidence  │ │    │
│  │  └─────────────────────┘          └────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Governance Context                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐              │
│  │ Review               │  │ Approval             │              │
│  │ - reviewer, action   │  │ - approver, decision │              │
│  │ - comments, status   │  │ - snapshot, comments │              │
│  └──────────────────────┘  └──────────────────────┘              │
│                                                                   │
│  Output Context                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐              │
│  │ Report               │  │ AuditEvent           │              │
│  │ - type, format       │  │ - actor, action      │              │
│  │ - status, disclaimer │  │ - before/after       │              │
│  └──────────────────────┘  └──────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

### Context Integration Rules

| Context | Communicates With | Via |
|---|---|---|
| Project | Supplier, SpendRecord, Classification | Direct references (projectId) |
| Evidence | Supplier, SpendRecord, Finding | Foreign key references |
| Review | Project | projectId — review belongs to project |
| Approval | Project | projectId — approval belongs to project |
| Report | Project | projectId — report belongs to project |
| AuditEvent | Project | projectId — event belongs to project |

## 7.2 Domains

| Domain | Bounded Context | Product Capability | Description |
|---|---|---|---|
| **Project** | Project | Project Management | Local content assessment project: name, reporting period, status, score, metadata |
| **Supplier** | Supplier | Supplier Classification | Supplier records: name, CR number, locality classification, ownership, workforce data |
| **Spend** | Classification | Spend Analytics | Spend transactions: amount, currency, category, contract reference, period |
| **Classification** | Classification | Supplier Classification | Classification records: local percentage, basis, confidence, review status |
| **Evidence** | Evidence | Evidence Management | Evidence files: type, status, file metadata, reviewer, verification |
| **Finding** | Finding | Finding & Risk Detection | Detected issues: type, severity, title, description, status |
| **Review** | Governance | Review & Approval | Review actions: reviewer, action (submitted/returned/commented), status |
| **Approval** | Governance | Review & Approval | Approval decisions: approver, decision (approved/rejected), snapshot |
| **Report** | Output | Report & Export | Generated reports: type, format, status, storage, disclaimer |
| **AuditEvent** | Output | Project Management | Audit trail: actor, action, entity, before/after state |
| **Tender** | Classification | Tender Matching | Tender specifications, match results, compliance scoring |
| **AI-Advisor** | Intelligence | AI Advisory | AI suggestions, confidence scores, governance metadata, review status |

## 7.3 Domain Events

Domain Events represent state changes within the domain model. Currently LocalContentOS uses direct audit event logging rather than a formal Domain Event pattern — this is a Yellow gap.

```text
Project Lifecycle Events (mapped to audit events):
    ProjectCreated → StatusChanged (×11 states) → ProjectArchived

Supplier Lifecycle Events:
    SupplierCreated → SupplierUpdated → ClassificationChanged

Evidence Lifecycle Events:
    EvidenceUploaded → EvidenceLinked → EvidenceReviewed → EvidenceVerified → EvidenceRejected

Finding Lifecycle Events:
    FindingDetected → FindingSubmitted → FindingReviewed → FindingResolved → FindingDismissed

Review & Approval Events:
    ReviewSubmitted → ReviewReturned → ReviewCompleted → ApprovalDecided

Report Lifecycle Events:
    ReportGenerated → ReportDownloaded → ReportArchived
```

## 7.4 State Machine — Project Lifecycle

```
Draft ──▶ DataCollection ──▶ ClassificationInProgress ──▶ EvidenceReview ──▶ FindingsDrafted
    │                                                                              │
    └────────────────────────── (return from any state) ◀──────────────────────────┘
                                                                                   │
                                                                                   ▼
                                                                            InReview ──▶ Returned
                                                                                │
                                                                                ▼
                                                                         ┌──────────┐
                                                                         │ Approved │
                                                                         └────┬─────┘
                                                                              │
                                                                              ▼
                                                                        ReportReady ──▶ Exported
                                                                                          │
                                                                                          ▼
                                                                                     Archived
```
**Transition rules (from `approval-routing.ts` and `services.ts`):**

| From | To | Guard |
|---|---|---|
| Draft | DataCollection | — |
| DataCollection | ClassificationInProgress | Suppliers exist |
| ClassificationInProgress | EvidenceReview | Classifications exist |
| EvidenceReview | FindingsDrafted | Evidence verified |
| FindingsDrafted | InReview | Findings drafted |
| InReview | Approved | Reviewer decision |
| InReview | Returned | Reviewer decision |
| Approved | ReportReady | — |
| ReportReady | Exported | Report generated |
| Exported | Archived | — |
| Any | Returned | Reviewer decision (from review) |

## 7.5 Domain Ownership Rules

| Rule | Enforcement |
|---|---|
| Each domain belongs to exactly one Bounded Context and one Product Capability | No domain serves two contexts |
| Each context owns its data | No cross-context direct DB access |
| Domains use shared types from `types.ts` | All domain types in single file |
| Domains do not reference other products' domains | No imports from `@/lib/audit` inside LocalContentOS code |

---

# 8. User Journeys

## 8.1 Core Journeys (v0.1)

| Journey | Actor | Steps | Product Capabilities Involved |
|---|---|---|---|
| **Create Project** | LC Analyst | Create project → Set reporting period → Define scope → Begin data collection | Project Management |
| **Import Suppliers** | LC Analyst | Import supplier data (manual/CSV) → Set CR numbers → Classify locality/ownership | Supplier Classification |
| **Import Spend** | LC Analyst | Upload spend data (CSV/SAP/Oracle) → Map categories → Validate records | Spend Analytics |
| **Classify Suppliers** | LC Analyst | Review supplier data → Set classification basis → Assign local content percentage → Confirm | Supplier Classification |
| **Upload Evidence** | LC Analyst | Upload files → Link to supplier/spend → Set evidence type → Submit for review | Evidence Management |
| **Review Evidence** | LC Reviewer | View evidence queue → Check files → Verify/Reject → Add comments | Evidence Management, Review |
| **Detect Findings** | LC Analyst | Run detection → Review findings → Set severity → Link evidence | Finding & Risk Detection, AI Advisory |
| **Review Project** | LC Reviewer | Review all data → Check findings → Return with comments or approve for final review | Review & Approval |
| **Approve Project** | LC Approver | View approval summary → Review snapshot → Approve/Reject → Decision logged | Review & Approval |
| **Generate Report** | LC Analyst | Select report type → Choose format → Generate → Download with disclaimer | Report & Export |
| **View Analytics** | LC Manager | View organization spend trends → Local content distribution → Category breakdown | Spend Analytics |
| **Run Tender Match** | LC Analyst | Define tender spec → Run matching → Review matched suppliers → Export results | Tender Matching |

## 8.2 AI Journeys (Governed)

| Journey | AI Action | Human Review | Governance Metadata |
|---|---|---|---|
| **Classification Suggestion** | AI suggests supplier local percentage based on available data | Analyst must accept, edit, or dismiss | `confidence`, `modelUsed`, `reviewStatus` |
| **Gap Detection** | AI flags missing evidence or unclassified suppliers | Analyst reviews and creates findings | `confidence`, `gapType`, `evidenceRef` |
| **Finding Prioritization** | AI suggests severity/title for detected findings | Analyst adjusts and confirms | `confidence`, `severity`, `ruleId` |

---

# 9. AI Journeys (Deep Dive)

## 9.1 Governance Contract for Every AI Action

Every AI action in LocalContentOS follows this contract (from `localcontent-ai-advisor-v3-actions.ts`):

```typescript
interface LocalContentAIAction {
  actionType: "classification_suggestion" | "gap_detection" | "finding_prioritization";
  input: {
    projectId: string;
    sourceData: string[];       // references to suppliers/spend/evidence
    userContext?: string;        // optional user guidance
  };
  output: {
    suggestions: AISuggestion[];
    confidence: number;          // 0.0 - 1.0
    disclaimerAr: string;        // Arabic disclaimer
    disclaimerEn: string;        // English disclaimer
  };
  governance: {
    governanceId: string;        // unique ID for audit trail
    modelUsed: string;
    provider: string;
    reviewStatus: "pending" | "accepted" | "edited" | "dismissed";
    reviewedBy?: string;
    reviewedAt?: string;
  };
}
```

## 9.2 AI Capability Maturity

| AI Feature | v0.1 (current) | v0.2 (planned) |
|---|---|---|
| Classification Suggestion | Rule-based + AI-assisted | ML-based from historical patterns |
| Gap Detection | AI-assisted pattern matching | Cross-project pattern learning |
| Finding Prioritization | Rule-based severity + AI refinement | Predictive risk scoring |

---

# 10. Module Architecture

## 10.1 Module Map

Each module belongs to exactly one Domain. Modules reference actual files from the codebase.

```
LocalContentOS
│
├── Project Domain
│   ├── ProjectList          — `/local-content/projects` — list/search/filter
│   ├── ProjectCreate        — `/local-content/projects/new` — create form
│   ├── ProjectDetail        — `/local-content/projects/[projectId]` — full view
│   └── ProjectStatusTransition — services.ts — lifecycle state changes
│
├── Supplier Domain
│   ├── SupplierList         — `/local-content/projects/[projectId]/suppliers`
│   ├── SupplierForm         — `supplier-form.tsx` — create/edit
│   └── SupplierDetail       — inline within project detail
│
├── Spend Domain
│   ├── SpendList            — `/local-content/projects/[projectId]/spend`
│   ├── SpendForm            — `spend-form.tsx` — create/edit
│   └── SpendAnalyticsView   — `spend-analytics-view.tsx` — organization analytics
│
├── Classification Domain
│   ├── ClassificationForm   — `classification-form.tsx` — classify suppliers
│   └── ClassificationRulesView — `classification-rules-view.tsx` — rule management
│
├── Evidence Domain
│   ├── EvidenceUpload       — `evidence-file-upload-form.tsx` — file upload
│   ├── EvidenceList         — `/local-content/projects/[projectId]/evidence`
│   ├── EvidenceReview       — inline review within evidence list
│   └── EvidenceVerification — services.ts — verify/reject
│
├── Finding Domain
│   ├── FindingList          — `/local-content/projects/[projectId]/findings`
│   ├── FindingForm          — `finding-form.tsx` — create/edit
│   ├── FindingSeverityMatrix — inline severity view
│   └── DetectionEngine      — `tender-matching.ts`, `classification-rules.ts`
│
├── Review Domain
│   ├── ReviewQueue          — `/local-content/review-center` — central queue
│   ├── ReviewForm           — inline review actions
│   └── ReviewHistory        — services.ts — review listing
│
├── Approval Domain
│   ├── ApprovalForm         — `/local-content/projects/[projectId]/approval`
│   └── ApprovalHistory      — services.ts — approval listing
│
├── Report Domain
│   ├── ReportGeneration     — `report-generation-button.tsx` — generate
│   ├── ReportList           — `/local-content/projects/[projectId]/reports`
│   └── ReportDownload       — `/api/local-content/projects/.../reports/.../download`
│
├── AI Domain
│   ├── AIAdvisorOverview    — `ai-advisor-overview.tsx` — suggestions list
│   ├── AIAdvisorDetail      — `/local-content/ai-advisor` — detailed view
│   └── AISuggestionReview   — actions — accept/edit/dismiss with governance
│
├── Tender Domain
│   ├── TenderMatchView      — `tender-match-view.tsx` — match results
│   ├── TenderSpecForm       — inline — define tender spec
│   └── MatchResults         — tender-matching.ts — matching engine
│
├── Analytics Domain
│   ├── SpendTrends          — `localization-rate-trends.ts` — trend analysis
│   └── AnalyticsDashboard   — `/local-content/analytics` — org-wide view
│
└── Audit Domain
    ├── AuditTrailView       — `/local-content/projects/[projectId]/audit-trail`
    └── AuditEventService    — `audit-events.ts` — event creation
```

## 10.2 Module Rules

| Rule | Enforcement |
|---|---|
| Each module belongs to exactly one Domain | Single-domain modules |
| Modules communicate through domain services | `services.ts` as service layer |
| Modules consume Platform Capabilities through contracts | auth guards, workflow adapter |

---

# 11. Data Model

## 11.1 Entity Design Principles

| Principle | Application |
|---|---|
| **Tenant-isolated** | All entities carry `organizationId` or `projectId` → `organizationId` |
| **Audit-traced** | Every mutation creates an audit event via `audit-events.ts` |
| **Evidence-linked** | Evidence entities carry type, status, reviewer, verification |
| **Status-driven** | All core entities have status fields for lifecycle management |

## 11.2 Core Entities

```typescript
// Existing Prisma models — not new design

interface LocalContentProject {
  id: string;
  organizationId: string;
  name: string;
  reportingPeriod: string;
  status: string;           // 11 states
  localContentScore: Float?;
  createdById: String?;
}

interface LocalContentSupplier {
  id: string;
  projectId: string;
  name: string;
  crNumber?: string;
  localityClassification?: string; // local, non_local, mixed, unclassified
  localContentPercentage?: Float;
  ownershipType?: string;   // Saudi, foreign, joint_venture
  workforceLocalPct?: Float;
  status: string;           // active, inactive, under_review
}

interface LocalContentSpendRecord {
  id: string;
  projectId: string;
  supplierId: string;
  amount: Float;
  currency: string;         // default: SAR
  category: string;
  contractReference?: string;
  period: string;
}

interface LocalContentClassification {
  id: string;
  projectId: string;
  supplierId?: string;
  localPercentage: Float;
  classificationBasis: string; // certificate, self_declaration, contract_term, analyst_estimate
  confidence: string;       // high, medium, low, unverified
  reviewStatus: string;     // draft, reviewed, confirmed, disputed
}

interface LocalContentEvidence {
  id: string;
  projectId: string;
  filename: string;
  fileType: string;
  storageKey?: string;
  fileHash?: string;
  evidenceType: string;     // certificate, contract, attestation, invoice, registration, other
  status: string;           // uploaded, linked, reviewed, verified, rejected, missing
  reviewedById?: string;
}

interface LocalContentFinding {
  id: string;
  projectId: string;
  type: string;             // evidence_gap, low_content, unclassified_supplier, data_quality, compliance_risk
  severity: string;         // low, medium, high, critical
  title: string;
  description: string;
  status: string;           // draft, submitted, reviewed, resolved, dismissed
}

interface LocalContentAuditEvent {
  id: string;
  projectId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: string;          // JSON snapshot
  after?: string;           // JSON snapshot
}
```

## 11.3 Storage Rules

| Entity Type | Storage | Access |
|---|---|---|
| Project, Supplier, Spend, Classification | Prisma (via `services.ts`) | LocalContentOS services only |
| Evidence, Finding, Review, Approval, Report, AuditEvent | Prisma (via `services.ts`) | LocalContentOS services only |
| Evidence files | Local filesystem (`./uploads/`) | Via download API route |
| Audit events | Prisma `LocalContentAuditEvent` | Product-scoped, not global audit |

---

# 12. UX Architecture

## 12.1 UX Principles

| Principle | Application |
|---|---|
| **Arabic-first** | Primary navigation, labels, and content in Arabic |
| **RTL-native** | Layout designed for right-to-left |
| **Governance-visible** | Review status, evidence requirements, finding severity shown inline |
| **Progressive disclosure** | Project list → Project detail → Tabbed sub-sections |
| **State-aware** | Empty states explain next action, loading states present, error states actionable |

## 12.2 Navigation Structure

```
LocalContentOS
│
├── Dashboard          — `/local-content` — project list, recent activity, score summary
├── Projects
│   ├── Project Detail — tabs: Suppliers, Spend, Classification, Evidence, Findings, Review, Approval, Reports, Audit Trail
│   │   ├── Suppliers      — supplier registry with classification
│   │   ├── Spend          — spend records with category breakdown
│   │   ├── Classification — supplier classification forms
│   │   ├── Evidence       — evidence vault with upload/review
│   │   ├── Findings       — detected gaps, risks, issues
│   │   ├── Review         — submit for review, review actions
│   │   ├── Approval       — final approval with snapshot
│   │   ├── Reports        — generate/download reports
│   │   ├── Audit Trail    — chronological event log
│   │   ├── Verification   — verification checklist
│   │   └── Tender Match   — tender matching results
│   └── New Project     — create project form
├── Workbook            — `/local-content/workbook` — TB import, workbook management
├── Review Center       — `/local-content/review-center` — central review queue
├── Analytics           — `/local-content/analytics` — org-wide spend trends
├── AI Advisor          — `/local-content/ai-advisor` — AI suggestions hub
├── Quality Dashboard   — `/local-content/quality-dashboard` — quality metrics
├── Campaigns           — `/local-content/campaigns` — campaign management
├── Outputs             — `/local-content/outputs` — generated outputs
├── Classification Rules — `/local-content/classification-rules` — rule management
├── Pilot Readiness     — `/local-content/pilot-readiness` — readiness metrics
└── Settings            — `/local-content/settings/integrations` — ERP integration config
```

## 12.3 Key UX Patterns

| Pattern | Description |
|---|---|
| **Status Badge** | Color-coded project status with Arabic labels |
| **Severity Indicator** | Finding severity (low/medium/high/critical) with color coding |
| **Score Gauge** | Visual local content score percentage with tier indicator |
| **Evidence Gate Indicator** | Evidence status per supplier with coverage percentage |
| **AI Disclaimer Banner** | Every AI suggestion displays confidence and "human review required" |
| **Review Decision Timeline** | Chronological view of review/approval decisions |
| **Empty State Guidance** | Every empty list provides next-action button and Arabic explanation |
| **Error State** | Actionable error messages with retry option |
| **Loading Skeleton** | Loading placeholders for async content |

---

# 13. Non-Functional Requirements

## 13.1 Performance

| Requirement | Target | Measurement |
|---|---|---|
| Page load (server) | < 500ms p95 | Synthetic monitoring |
| Page load (client) | < 2s p95 | Lighthouse |
| Project detail load (100 suppliers + 1000 spend records) | < 2s p95 | API response time |
| Report generation (PDF) | < 15s p95 | End-to-end timing |
| AI suggestion generation | < 10s p95 | End-to-end timing |
| Evidence upload (10MB) | < 5s p95 | Upload timing |

## 13.2 Security

| Requirement | Implementation |
|---|---|
| Authentication | Platform Auth (middleware role guard: viewer minimum) |
| Authorization | Server-side guards per action (`guards.ts`) |
| Tenant isolation | All queries scoped by `organizationId` |
| Audit trail | Every mutation creates audit event (`audit-events.ts`) |
| Evidence integrity | File hash stored, download permissioned |
| AI safety | Governance metadata on every AI output |
| Export control | PDF/XLSX with disclaimer, audit trail on download |

## 13.3 Availability

| Requirement | Target |
|---|---|
| Uptime (SaaS) | 99.9% |
| Recovery time (RTO) | < 1 hour |
| Recovery point (RPO) | < 5 minutes |

## 13.4 Internationalization

| Requirement | Support |
|---|---|
| Primary language | Arabic (Saudi market) |
| Secondary language | English |
| RTL layout | All pages |
| Date format | Gregorian (Arabic numeral support) |
| Currency | SAR (default) |
| Terminology | Saudi local content terminology throughout |

## 13.5 Capability KPIs

### Project Management

| KPI | Target | Measurement |
|---|---|---|
| Project creation-to-completion | ≤ 30 days | Median time from Draft to Exported |
| Status transition logging | 100% | Every transition creates audit event |

### Supplier Classification

| KPI | Target | Measurement |
|---|---|---|
| Supplier classification coverage | ≥ 95% | Suppliers with classification assigned |
| Classification accuracy | ≥ 80% | Verified classifications / total classifications |

### Evidence Management

| KPI | Target | Measurement |
|---|---|---|
| Evidence coverage | ≥ 85% | Suppliers with at least one evidence item |
| Evidence verification rate | ≥ 90% | Verified evidence / total submitted for review |

### Finding & Risk Detection

| KPI | Target | Measurement |
|---|---|---|
| Finding resolution rate | ≥ 70% | Resolved findings / total findings |
| AI suggestion acceptance rate | ≥ 60% | Accepted AI suggestions / total suggestions |

### Review & Approval

| KPI | Target | Measurement |
|---|---|---|
| Review completion rate | ≥ 90% | Reviews completed within SLA |
| Approval audit completeness | 100% | All approvals logged with snapshot |

---

# 14. Evolution Matrix

| Capability | v0.1 (current — L5) | v0.2 (planned) | v0.3 (future) |
|---|---|---|---|
| **Project Management** | 11-state lifecycle, audit trail | Configurable workflows per org | Multi-period comparison |
| **Supplier Classification** | Manual + AI-assisted | ML-based classification from history | Automated via government API |
| **Spend Analytics** | Category breakdown, trends | Cross-project aggregation | Predictive spend forecasting |
| **Content Scoring** | Deterministic weighted (rule-based) | Configurable weight models | Industry-benchmarked scoring |
| **Evidence Management** | Upload, link, verify, review | Bulk upload, OCR extraction | Smart evidence suggestions |
| **Finding & Risk Detection** | Manual + AI-assisted | Automated ML-based detection | Predictive risk scoring |
| **Review & Approval** | Single review + approval | Multi-level review chains | SLA-enforced routing |
| **Report & Export** | PDF (4 types), XLSX | Configurable templates, batch export | Automated distribution |
| **AI Advisory** | Classification, gap, finding | Cross-project pattern learning | Prescriptive recommendations |
| **Tender Matching** | Rule-based matching | ML-enhanced scoring | Marketplace integration |

---

# Blueprint Validation

This Blueprint is a retrospective alignment document, not a forward design. Validation criteria are adapted accordingly.

## Evidence Classification

Throughout this Blueprint, evidence is classified into three types:

| Classification | Examples in LocalContentOS |
|---|---|
| **Executable Evidence** | `services.ts` (CRUD), `scoring.ts` (weighted engine), `guards.ts` (access control), `audit-events.ts`, `workflow-gating.ts`, all route files |
| **Governance Evidence** | ADR references (Product Independence, Platform Neutrality), Constitution Principles mapping, Blueprint Traceability tables |
| **Alignment Evidence** | Code-to-documentation mapping confirmed, existing 265 tests, build passing |

Evidence = Code + Governance + Operations. All three must exist for a claim to be validated.

## Alignment Validation

| Criterion | Required | Status |
|---|---|---|
| All 12 Constitution principles satisfied | ✅ Yes | ⏸️ To be validated |
| No violation of Product Independence | ✅ Zero product-to-product dependencies | ✅ Verified (code confirmed) |
| No violation of Platform Neutrality | ✅ Zero product types in Platform Core | ✅ Verified (code confirmed) |
| AI Governance applies to every AI journey | ✅ All 3 AI journeys have governance | ✅ Verified (code confirmed) |
| All Product Capabilities have traceable code | ✅ 10 capabilities mapped to code | ⏸️ To be validated |
| All Domains have corresponding Prisma models | ✅ 10 models mapped | ✅ Verified (schema confirmed) |

## Sign-off

| Role | Sign-off | Date |
|---|---|---|
| **Product Architect** | ⬜ | — |
| **Platform Architect** | ⬜ | — |
| **Governance Lead** | ⬜ | — |

---

# Appendix: Document Hierarchy

```
AQLIYA_ARCHITECTURE_CONSTITUTION.md              ← 12 principles
        │
        ▼
ARCHITECTURE_DECISION_INDEX.md                  ← ADRs
        │
        ▼
IES-001_INSTITUTIONAL_STANDARD.md               ← Engineering Standard
        │
        ▼
LIA-001_INSTITUTIONAL_ALIGNMENT.md              ← Alignment Plan
        │
        ▼
LOCALCONTENTOS_BLUEPRINT.md                     ← THIS DOCUMENT
        │
        ▼
Capability Backlog → PRDs → Specifications → Implementation (under IES-001)
```

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Product Blueprint — Brownfield Alignment (retrospective)
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Predecessor:** Existing L5 implementation, `LIA-001_INSTITUTIONAL_ALIGNMENT.md`
- **Template:** Adapted from `SALESOS_V2_BLUEPRINT.md` (IES-001 Reference Template)
- **Status:** **Draft v0.1** — ready for review
- **Next:** Capability Backlog → PRD → Specifications
