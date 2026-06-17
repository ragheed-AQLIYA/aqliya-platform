# LocalContentOS — Implementation Phasing

**Status:** Specification only — not implemented
**Version:** 1.0

---

## Phase Overview

| Phase | Name                               | Duration  | Depends On              | Status     |
| ----- | ---------------------------------- | --------- | ----------------------- | ---------- |
| 0     | Analyst-Led Pilot Validation       | Ongoing   | None                    | **Active** |
| 1     | Data Workspace Setup               | 2–3 weeks | Phase 0                 | Planned    |
| 2     | Imports and Validation             | 3–4 weeks | Phase 1                 | Planned    |
| 3     | Evidence and Classification Review | 3–4 weeks | Phase 2                 | Planned    |
| 4     | Findings and Management Review     | 2–3 weeks | Phase 3                 | Planned    |
| 5     | Reporting and Export               | 2–3 weeks | Phase 4                 | Planned    |
| 6     | AI Assistance Layer                | 3–4 weeks | Phase 5, AQLIYA Core AI | Future     |
| 7     | Production Hardening               | 3–4 weeks | Phase 5/6               | Future     |

**Total estimated build time (Phases 1–5):** 12–17 weeks (3–4 months)
**Total with AI (Phase 6):** 15–21 weeks (4–5 months)

---

## Phase 0 — Analyst-Led Pilot Validation (Current)

| Field             | Detail                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Goal**          | Validate the LocalContentOS workflow with real customer data through manual analyst-led pilots before investing in software |
| **Deliverables**  | Pilot runbooks completed, customer feedback collected, workflow refinements documented                                      |
| **Dependencies**  | None — this is the current active phase                                                                                     |
| **Validation**    | 3+ pilot completions with success score ≥ 2.5                                                                               |
| **Do NOT Build**  | No code, no schema, no routes                                                                                               |
| **Exit Criteria** | At least one customer explicitly requests software (not analyst-led) AND confirms budget                                    |

---

## Phase 1 — Data Workspace Setup

| Field                   | Detail                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Goal**                | Create the basic LocalContentOS workspace on AQLIYA Core — organization setup, reporting period, empty data tables |
| **Deliverables**        | `/local-content` route created (basic), engagement CRUD, reporting period CRUD, user role assignment               |
| **Dependencies**        | AQLIYA Core (Organization, User, RBAC models), implementation approval                                             |
| **Validation Commands** | `npx tsc --noEmit`, `npm run lint`, `npm run build`                                                                |
| **Do NOT Build**        | No data import logic, no classification engine, no evidence management, no findings, no export                     |
| **Exit Criteria**       | Can create an engagement, set a period, assign users, and see the empty workspace                                  |

---

## Phase 2 — Imports and Validation

| Field                   | Detail                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Enable data import for vendor master, procurement spend, and contracts with validation                                       |
| **Deliverables**        | CSV import actions (vendor master, spend, contracts), validation logic, import summary, duplicate detection, error reporting |
| **Dependencies**        | Phase 1 workspace                                                                                                            |
| **Validation Commands** | `npx tsc --noEmit`, `npm run lint`, `npm run build`                                                                          |
| **Do NOT Build**        | No classification logic, no evidence linking, no findings                                                                    |
| **Exit Criteria**       | Can import all three data types with validation. 95%+ acceptance rate for valid data.                                        |

---

## Phase 3 — Evidence and Classification Review

| Field                   | Detail                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Build evidence management and classification review workflow                                                              |
| **Deliverables**        | Evidence upload and linking, classification proposal/review/approve flow, evidence confidence assignment, exceptions view |
| **Dependencies**        | Phase 2 data imports, AQLIYA Core file storage, Governance Engine (for approval workflow)                                 |
| **Validation Commands** | `npx tsc --noEmit`, `npm run lint`, `npm run build`                                                                       |
| **Do NOT Build**        | No findings, no management review, no reporting, no export, no AI                                                         |
| **Exit Criteria**       | Can upload evidence, link to vendors/spend, propose classification, and complete a review cycle                           |

---

## Phase 4 — Findings and Management Review

| Field                   | Detail                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Goal**                | Build findings management, management review, and approval workflow                             |
| **Deliverables**        | Findings CRUD, management review screen, approval workflow, lock/unlock, return for revision    |
| **Dependencies**        | Phase 3 classification, AQLIYA Core Workflow Engine                                             |
| **Validation Commands** | `npx tsc --noEmit`, `npm run lint`, `npm run build`                                             |
| **Do NOT Build**        | No reporting/export (Phase 5), no AI                                                            |
| **Exit Criteria**       | Can draft findings, submit for management review, collect decisions, and approve the engagement |

---

## Phase 5 — Reporting and Export

| Field                   | Detail                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Build reporting and export capabilities for all pilot outputs                                                                    |
| **Deliverables**        | Pilot Summary PDF/XLSX, Vendor Summary, Spend Summary, Evidence Gap Report, Findings Report, Decision Memo, Export Package Index |
| **Dependencies**        | Phase 4 approved data, AQLIYA Core Reporting Engine (AuditOS PDF/XLSX export patterns)                                           |
| **Validation Commands** | `npx tsc --noEmit`, `npm run lint`, `npm run build`                                                                              |
| **Do NOT Build**        | No AI                                                                                                                            |
| **Exit Criteria**       | Can generate all 7 outputs in PDF and XLSX formats from approved engagement data                                                 |

---

## Phase 6 — AI Assistance Layer

| Field                   | Detail                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Goal**                | Add AI-assisted capabilities following AQLIYA AI Orchestration architecture                                             |
| **Deliverables**        | AI classification suggestion, spend summary, evidence gap identification, finding drafting, management summary drafting |
| **Dependencies**        | Phase 5 completed, AQLIYA Core AI Abstraction phase (Phase 3 in official roadmap) complete                              |
| **Validation Commands** | `npx tsc --noEmit`, `npm run lint`, `npm run build`                                                                     |
| **Do NOT Build**        | No autonomous AI. No AI without human review. No AI without audit trail.                                                |
| **Exit Criteria**       | All 5 AI capabilities operational with human-in-the-loop, auditable, and governed                                       |

---

## Phase 7 — Production Hardening

| Field                   | Detail                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Goal**                | Prepare LocalContentOS for production use based on pilot feedback and performance data                     |
| **Deliverables**        | Security review, performance optimization, error handling, documentation, onboarding guide, backup/restore |
| **Dependencies**        | Phase 5 or 6 completed based on scope                                                                      |
| **Validation Commands** | `npx tsc --noEmit`, `npm run lint`, `npm run build`, integration tests                                     |
| **Do NOT Build**        | No major new features — stabilization only                                                                 |
| **Exit Criteria**       | Production readiness review passed                                                                         |

---

## Validation Commands (When Code Begins)

Every phase that produces code must pass:

- `npx tsc --noEmit` — TypeScript strict mode
- `npm run lint` — ESLint (pre-existing issues are documented)
- `npm run build` — Full build including Prisma generate

---

## Do-Not-Build List (Any Phase)

These remain out of scope for the MVP:

- Direct LCGPA/regulatory integration
- Full enterprise analytics dashboard
- Supplier self-service portal
- Mobile app
- Real-time ERP integration
- Multi-language beyond Arabic/English
- On-Prem or Air-Gapped deployment packaging
- Automated compliance certification

---

## Exit Criteria Summary

| Phase | Exit Criteria                                                              |
| ----- | -------------------------------------------------------------------------- |
| 0     | 3+ analyst-led pilots with score ≥ 2.5 AND 1+ software request with budget |
| 1     | Engagement created, period set, users assigned, workspace visible          |
| 2     | Vendor/spend/contract imports with 95%+ acceptance                         |
| 3     | Evidence uploaded, linked, classified, reviewed, and approved              |
| 4     | Findings drafted, management reviewed, engagement approved                 |
| 5     | All 7 outputs generated in PDF/XLSX                                        |
| 6     | 5 AI capabilities operational with governance                              |
| 7     | Production readiness review passed                                         |
