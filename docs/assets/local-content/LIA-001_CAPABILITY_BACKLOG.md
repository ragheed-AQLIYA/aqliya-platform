# Capability Backlog — LocalContentOS

> **Program:** LIA-001 (Institutional Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Execution Backlog — bridge between `LOCALCONTENTOS_BLUEPRINT.md` and PRDs.
> **Traceability:** Every Epic → Product Capability → Blueprint section → Code evidence.
> **Note:** This backlog retroactively documents existing implementation under IES-001 format. All Epics reference actual code, not planned work.

---

## Traceability Chain

Every item in this backlog maintains the full chain to evidence:

```
Blueprint Section → Product Capability → Epic → Code Path → Tests
```

If any link is missing, the alignment is incomplete.

### Evidence Classification

Evidence is categorized into three types throughout LIA-001:

| Classification | Definition | Examples |
|---|---|---|
| **Executable Evidence** | Code and tests that implement the capability | Server actions, domain services, Prisma queries, test files |
| **Governance Evidence** | Architecture decisions and constitutional compliance | ADR references, Constitution principles, blueprint mapping |
| **Operational Evidence** | CI/CD, validation, deployment readiness | Build passing, lint clean, drift reviews, ERR gates |

---

## Execution Waves

For the alignment project, Epics follow the existing implementation order (not a new sequence):

| Wave | Focus | Product Capabilities | Rationale |
|---|---|---|---|
| **Wave A** | Project Foundation | Project Management, Supplier Classification | Core domain — everything depends on projects and suppliers |
| **Wave B** | Classification & Evidence | Spend Analytics, Classification, Evidence Management | Data operations — fills the project with structured data |
| **Wave C** | Intelligence & Governance | Content Scoring, Finding & Risk Detection, AI Advisory | Analytics layer — requires data to be meaningful |
| **Wave D** | Delivery & Operations | Review & Approval, Report & Export, Tender Matching | Output layer — completes the project lifecycle |

---

## Epic Backlog

### LC-EPIC-01: Project Management

| Field | Value |
|---|---|
| **Product Capability** | Project Management |
| **Blueprint Sections** | §3 (Boundaries), §5 (Product Capabilities), §7.1 (Project Context), §7.4 (State Machine), §10 (Project Modules) |
| **Constitution Principles** | 1 (Product Independence), 2 (Platform Neutrality) |
| **Wave** | A |
| **Code Location** | `src/lib/local-content/services.ts` (lines 43-100: listProjects, getProject, createProject), `src/app/local-content/projects/`, `src/actions/localcontent-actions.ts` |
| **Key Files** | `types.ts` (CreateProjectInput, VALID_PROJECT_STATUSES), `services.ts` (CRUD), `workflow-gating.ts` (status transitions), `approval-routing.ts` (state routing), `audit-events.ts` (audit logging) |
| **Test Files** | `src/lib/local-content/__tests__/` |
| **Exit Criteria** | ✅ Existing: Create project, 11-state lifecycle, audit events on every transition, project list with filters |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing (265 total) |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

### LC-EPIC-02: Supplier Classification

| Field | Value |
|---|---|
| **Product Capability** | Supplier Classification |
| **Blueprint Sections** | §3 (Supplier Registry), §5 (Supplier Classification), §7.2 (Supplier Domain), §10 (Supplier Modules) |
| **Constitution Principles** | 1, 2 |
| **Wave** | A |
| **Code Location** | `src/lib/local-content/types.ts` (supplier types, VALID_SUPPLIER_LOCALITIES, VALID_OWNERSHIP_TYPES), `src/lib/local-content/services.ts` (supplier CRUD), `src/components/local-content/supplier-form.tsx`, `src/app/local-content/projects/[projectId]/suppliers/` |
| **Key Files** | `classification-rules.ts` (rule engine), `registry.ts` (supplier registry lookups) |
| **Exit Criteria** | ✅ Existing: Create suppliers, classify by locality/ownership, CR number tracking, status management |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

### LC-EPIC-03: Spend Analytics

| Field | Value |
|---|---|
| **Product Capability** | Spend Analytics |
| **Blueprint Sections** | §3 (Spend Records), §5 (Spend Analytics), §7.2 (Spend Domain), §10 (Spend Modules) |
| **Constitution Principles** | 1, 2 |
| **Wave** | B |
| **Code Location** | `src/lib/local-content/services.ts` (spend CRUD), `src/lib/local-content/spend-analytics.ts` (organization analytics engine), `src/components/local-content/spend-form.tsx`, `src/components/local-content/spend-analytics-view.tsx`, `src/lib/local-content/localization-rate-trends.ts` (trend analysis) |
| **Key Files** | `erp/` directory (SAP/Oracle/CSV importers), `import.ts` (data import pipeline) |
| **Exit Criteria** | ✅ Existing: Create spend records, import from ERP, category breakdown, trend analysis, localization rate calculation |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

### LC-EPIC-04: Content Scoring

| Field | Value |
|---|---|
| **Product Capability** | Content Scoring |
| **Blueprint Sections** | §3 (Content Scoring), §5 (Content Scoring), §7.2 (Score Domain) |
| **Constitution Principles** | 1, 2, 12 (Business First) |
| **Wave** | C |
| **Code Location** | `src/lib/local-content/scoring.ts` (390 lines — deterministic weighted scoring engine), `src/lib/local-content/types.ts` (ScoringResult, SupplierWeightedScore, SupplierScoreTier) |
| **Key Files** | `scoring.ts` (scoreLocalityFactor, scoreOwnershipFactor, scoreWorkforceFactor, scoreDeclaredContent, calculateFullScoring, getTierFromScore) |
| **Tests** | `src/lib/local-content/__tests__/` |
| **Exit Criteria** | ✅ Existing: Weighted scoring (40/25/20/15), supplier composite scores, project aggregate score, tier classification, evidence statistics |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

### LC-EPIC-05: Evidence Management

| Field | Value |
|---|---|
| **Product Capability** | Evidence Management |
| **Blueprint Sections** | §3 (Evidence Vault), §5 (Evidence Management), §7.2 (Evidence Domain), §10 (Evidence Modules) |
| **Constitution Principles** | 1, 2, 5 (Evidence Governance) |
| **Wave** | B |
| **Code Location** | `src/lib/local-content/services.ts` (evidence CRUD), `src/lib/local-content/types.ts` (VALID_EVIDENCE_TYPES, VALID_EVIDENCE_STATUSES), `src/components/local-content/evidence-form.tsx`, `src/components/local-content/evidence-file-upload-form.tsx` |
| **API Routes** | `src/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route.ts` |
| **Key Files** | `verification-checklist.ts` (evidence verification workflow) |
| **Exit Criteria** | ✅ Existing: File upload with hash, type classification, status tracking (uploaded → linked → reviewed → verified → rejected), download permissioned, evidence coverage statistics |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

### LC-EPIC-06: Finding & Risk Detection

| Field | Value |
|---|---|
| **Product Capability** | Finding & Risk Detection |
| **Blueprint Sections** | §3 (Finding & Risk Detection), §5 (Finding & Risk Detection), §7.2 (Finding Domain), §10 (Finding Modules) |
| **Constitution Principles** | 1, 2, 12 |
| **Wave** | C |
| **Code Location** | `src/lib/local-content/services.ts` (finding CRUD), `src/lib/local-content/types.ts` (VALID_FINDING_TYPES, VALID_FINDING_SEVERITIES), `src/components/local-content/finding-form.tsx` |
| **Key Files** | `classification-rules.ts` (detection rules), `tender-matching.ts` (gap detection), `verification-checklist.ts` (verification gap detection) |
| **Exit Criteria** | ✅ Existing: 5 finding types (evidence_gap, low_content, unclassified_supplier, data_quality, compliance_risk), 4 severity levels, status lifecycle (draft → submitted → reviewed → resolved → dismissed) |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

### LC-EPIC-07: Review & Approval

| Field | Value |
|---|---|
| **Product Capability** | Review & Approval |
| **Blueprint Sections** | §3 (Review Workflow, Approval Workflow), §5 (Review & Approval), §7.2 (Review Domain, Approval Domain), §10 (Review Modules, Approval Modules) |
| **Constitution Principles** | 1, 2, 5 |
| **Wave** | D |
| **Code Location** | `src/lib/local-content/services.ts` (review CRUD, approval CRUD), `src/lib/local-content/approval-routing.ts` (route computation, validation), `src/actions/localcontent-review-actions.ts` (review server actions) |
| **UI** | `src/app/local-content/review-center/`, `src/app/local-content/projects/[projectId]/review/`, `src/app/local-content/projects/[projectId]/approval/`, `src/components/local-content/content-review-queue.tsx` |
| **Key Files** | `approval-routing.ts` (computeApprovalRoutingState, validateApprovalSubmission, validateReviewSubmission) |
| **Exit Criteria** | ✅ Existing: Multi-step review (submit → return → complete), final approval with decision snapshot, audit trail on all review/approval actions, central review queue |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

### LC-EPIC-08: Report & Export

| Field | Value |
|---|---|
| **Product Capability** | Report & Export |
| **Blueprint Sections** | §3 (Report Generation), §5 (Report & Export), §7.2 (Report Domain), §10 (Report Modules) |
| **Constitution Principles** | 1, 2, 5 |
| **Wave** | D |
| **Code Location** | `src/lib/local-content/services.ts` (report CRUD), `src/lib/local-content/export.ts` (export service), `src/lib/local-content/pdf-arabic.ts` (Arabic PDF generation) |
| **UI** | `src/components/local-content/report-generation-button.tsx`, `src/app/local-content/projects/[projectId]/reports/` |
| **API Routes** | `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts` |
| **Key Files** | `export.ts`, `pdf-arabic.ts` |
| **Exit Criteria** | ✅ Existing: 6 report types (assessment_summary, supplier_register, spend_classification, gap_risk, evidence_index, final_package), PDF and XLSX formats, disclaimer on exports, download audit trail |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

### LC-EPIC-09: AI Advisory

| Field | Value |
|---|---|
| **Product Capability** | AI Advisory |
| **Blueprint Sections** | §3 (AI Advisory), §5 (AI Advisory), §8 (AI Journeys), §9 (AI Governance) |
| **Constitution Principles** | 1, 2, 7 (AI Governance) |
| **Wave** | C |
| **Code Location** | `src/actions/localcontent-ai-advisor-actions.ts`, `src/actions/localcontent-ai-advisor-v3-actions.ts` (AI advisor server actions with governance) |
| **UI** | `src/components/local-content/ai-advisor/ai-advisor-overview.tsx`, `src/app/local-content/ai-advisor/` |
| **Key Files** | `src/app/local-content/projects/[projectId]/workbook/[workbookId]/ai-advisor/` (workbook AI) |
| **Exit Criteria** | ✅ Existing: AI classification suggestions, gap detection, finding prioritization — all with confidence scores, governance metadata, human review (accept/edit/dismiss), audit trail |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

### LC-EPIC-10: Tender Matching

| Field | Value |
|---|---|
| **Product Capability** | Tender Matching |
| **Blueprint Sections** | §3 (Tender Matching), §5 (Tender Matching), §7.2 (Tender Domain), §10 (Tender Modules) |
| **Constitution Principles** | 1, 2, 12 |
| **Wave** | D |
| **Code Location** | `src/lib/local-content/tender-matching.ts` (matching engine), `src/components/local-content/tender-match-view.tsx` |
| **UI** | `src/app/local-content/projects/[projectId]/tender-match/` |
| **Key Files** | `tender-matching.ts` (buildTenderMatchReport, parseTenderSpecFromMetadata, DEFAULT_TENDER_SPEC) |
| **Exit Criteria** | ✅ Existing: Tender spec definition, supplier-to-requirement matching, compliance scoring, match results view |

**Implementation Status:**

| Item | Status |
|---|---|
| Documentation | 🟢 Complete |
| Code | 🟢 Existing |
| Tests | 🟢 Existing |
| Traceability | 🟢 Complete |
| Alignment | 🟢 Complete |

---

## Dependency Map Between Epics

```
LC-EPIC-01 (Project) ──→ LC-EPIC-05 (Evidence)
        │                       │
        ▼                       ▼
LC-EPIC-02 (Supplier) ──→ LC-EPIC-03 (Spend)
        │                       │
        ▼                       ▼
LC-EPIC-04 (Scoring) ◀── LC-EPIC-06 (Findings)
        │                       │
        ▼                       ▼
LC-EPIC-07 (Review) ──── LC-EPIC-09 (AI)
        │                       │
        ▼                       ▼
LC-EPIC-08 (Report) ──── LC-EPIC-10 (Tender)
```

| Epic | Code Depends On | Description |
|---|---|---|
| LC-EPIC-01 (Project) | Nothing | Can be documented first |
| LC-EPIC-02 (Supplier) | LC-EPIC-01 | Belongs to a project |
| LC-EPIC-03 (Spend) | LC-EPIC-01, LC-EPIC-02 | Belongs to project + supplier |
| LC-EPIC-04 (Scoring) | LC-EPIC-02, LC-EPIC-03 | Requires supplier + spend data |
| LC-EPIC-05 (Evidence) | LC-EPIC-01, LC-EPIC-02, LC-EPIC-03 | Links to suppliers/spend/findings |
| LC-EPIC-06 (Findings) | LC-EPIC-01, LC-EPIC-02, LC-EPIC-03 | Depends on project data |
| LC-EPIC-07 (Review) | LC-EPIC-01 | Belongs to project |
| LC-EPIC-08 (Report) | LC-EPIC-01, LC-EPIC-04 | Needs project + score data |
| LC-EPIC-09 (AI) | LC-EPIC-01, LC-EPIC-02, LC-EPIC-03 | Needs data for suggestions |
| LC-EPIC-10 (Tender) | LC-EPIC-01, LC-EPIC-02 | Needs project + suppliers |

---

## Alignment Check: Traceability

Before any Epic is declared aligned:

| Check | Required | Verified By |
|---|---|---|
| Blueprint sections referenced | ✅ All relevant sections | Epic definition above |
| Product Capability named | ✅ Exactly one from Blueprint §5 | Epic definition |
| Domain defined | ✅ At least one from Blueprint §7 | Epic definition |
| Modules defined | ✅ At least one from Blueprint §10 | Epic definition |
| Code path exists | ✅ Implementation confirmed | Epic definition |
| Tests exist | ✅ 265 passing tests | Confirmed by test suite |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Capability Backlog — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 1.0 (Baseline)
- **Parent:** `LOCALCONTENTOS_BLUEPRINT.md`
- **Program:** LIA-001
- **Status:** **Baseline v1.0** — ready for PRD creation.
- **Total Epics:** 10 (all existing — no new capabilities proposed)
- **First PRD target:** LC-PRD-01 (Project Management) — the foundational capability
