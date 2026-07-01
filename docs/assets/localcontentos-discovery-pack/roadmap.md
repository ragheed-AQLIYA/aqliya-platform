# LocalContentOS — Roadmap

**Status:** Discovery / Planned (not implemented)
**Version:** 1.0 — Discovery Pack
**Note:** This is a pre-implementation roadmap. It describes the phases from discovery to production readiness. No code has been written.

---

## Roadmap Overview

| Phase | Name                           | Duration  | Dependency | Status      |
| ----- | ------------------------------ | --------- | ---------- | ----------- |
| 0     | Discovery Pack                 | 1–2 weeks | None       | **Current** |
| 1     | Data Templates                 | 2–3 weeks | Phase 0    | Planned     |
| 2     | Manual Workflow Prototype      | 4–6 weeks | Phase 1    | Planned     |
| 3     | MVP Workspace                  | 6–8 weeks | Phase 2    | Planned     |
| 4     | Evidence and Approval Workflow | 4–6 weeks | Phase 3    | Planned     |
| 5     | Reporting and Export           | 3–4 weeks | Phase 4    | Planned     |
| 6     | Customer Pilot                 | 8 weeks   | Phases 3–5 | Planned     |
| 7     | Production Hardening           | 4–6 weeks | Phase 6    | Planned     |

**Total estimated time to production readiness:** 8–10 months (phases 0–7, assuming sequential execution)

---

## Phase 0 — Discovery Pack (Current)

| Item                            | Detail                                                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                        | Complete product discovery, define commercial positioning, and prepare pilot materials                                                          |
| **Deliverables**                | Product definition, ICP analysis, workflow design, data requirements, logic model, pilot offer, demo storyline, commercial positioning, roadmap |
| **What NOT to Build**           | No code, no schema, no routes, no UI, no config changes                                                                                         |
| **Validation**                  | Reviewed internally, aligned with AQLIYA v1.1 official docs                                                                                     |
| **Dependencies on AQLIYA Core** | No dependency on Core engines — this is pure product discovery                                                                                  |

---

## Phase 1 — Data Templates

| Item                            | Detail                                                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                        | Create standardized data templates (Excel/CSV) that customers can fill for a pilot                                                             |
| **Deliverables**                | Vendor master template, spend data template, supplier classification template, contract register template, evidence checklist, data dictionary |
| **What NOT to Build**           | No system, no database, no import logic — just templates and documentation                                                                     |
| **Validation**                  | Test templates with sample data, verify completeness against workflow requirements                                                             |
| **Dependencies on AQLIYA Core** | None — templates are standalone                                                                                                                |

---

## Phase 2 — Manual Workflow Prototype

| Item                            | Detail                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                        | Define and document the full manual workflow that an AQLIYA analyst would follow using templates and tools to process customer data       |
| **Deliverables**                | Analyst workflow guide, classification criteria template, exception log template, finding/gap template, review checklist, report template |
| **What NOT to Build**           | No software application, no automation — this is a documented process that can be executed manually                                       |
| **Validation**                  | Run through the workflow with sample data end-to-end, time the process, identify bottlenecks                                              |
| **Dependencies on AQLIYA Core** | None — manual process only                                                                                                                |

---

## Phase 3 — MVP Workspace

| Item                            | Detail                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Goal**                        | Build the minimum viable LocalContentOS workspace on AQLIYA Core with basic data import, classification, and reporting |
| **Deliverables**                | LocalContentOS route/workspace, vendor data model, spend data import, basic classification logic, simple report view   |
| **What NOT to Build**           | No advanced workflow engine, no full evidence vault, no approval workflow, no integration with external systems        |
| **Validation**                  | Internal demo with sample data, test data import and classification, verify report output                              |
| **Dependencies on AQLIYA Core** | Requires Workspace Management, basic RBAC, Audit Logs from Core. Needs LocalContentOS-specific DB models in Prisma.    |

---

## Phase 4 — Evidence and Approval Workflow

| Item                            | Detail                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Goal**                        | Add evidence attachment, review workflow, and approval gates to the MVP workspace                                                                            |
| **Deliverables**                | Evidence vault UI, file upload/linking to vendors/transactions, review workflow (state machine), approval gates, exception handling, audit trail integration |
| **What NOT to Build**           | No full Evidence Graph (leverage existing), no multi-period comparison, no advanced analytics                                                                |
| **Validation**                  | Test full workflow from upload to approval, verify audit trail completeness, test exception scenarios                                                        |
| **Dependencies on AQLIYA Core** | Requires Governance Engine (approval), Workflow Engine (state machine), Evidence Graph (linking), storage abstraction                                        |

---

## Phase 5 — Reporting and Export

| Item                            | Detail                                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                        | Build comprehensive reporting and export capabilities for LocalContentOS                                                      |
| **Deliverables**                | Local content report builder, PDF export, XLSX data export, evidence index, management summary, period-over-period comparison |
| **What NOT to Build**           | No regulatory submission integration, no advanced analytics dashboard (basic reporting only)                                  |
| **Validation**                  | Generate reports from sample data, verify PDF and XLSX output quality, test with management audience                          |
| **Dependencies on AQLIYA Core** | Requires Reporting Engine from Core (extend for LocalContentOS domain), export libraries                                      |

---

## Phase 6 — Customer Pilot

| Item                            | Detail                                                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                        | Run a live pilot with a real customer using the MVP workspace                                                                                |
| **Deliverables**                | Pilot kickoff, data import from customer, classification and evidence processing, findings report, management summary, pilot closeout report |
| **What NOT to Build**           | No new features during pilot (bug fixes only), no production deployment, no SLA commitments                                                  |
| **Validation**                  | Pilot success criteria documented in pilot-offer.md. Measure against all success criteria.                                                   |
| **Dependencies on AQLIYA Core** | AQLIYA Cloud deployment, Core engines operational                                                                                            |

---

## Phase 7 — Production Hardening

| Item                            | Detail                                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Goal**                        | Prepare LocalContentOS for production use based on pilot learnings                                                         |
| **Deliverables**                | Performance optimization, security review, documentation, exception handling refinement, user management, onboarding guide |
| **What NOT to Build**           | No major new features — focus on stability, scalability, and usability based on pilot feedback                             |
| **Validation**                  | Security audit, load testing, user acceptance testing, production readiness review                                         |
| **Dependencies on AQLIYA Core** | Full Core stack required — governance, workflow, evidence, RBAC, audit logs, reporting                                     |

---

## Alignment with AQLIYA Official Roadmap (v1.1)

The AQLIYA official roadmap places LocalContentOS in **Phase 5 (3–6 months)** with these deliverables:

- Local Content Dashboard
- Procurement Analyzer
- Supplier Locality Engine
- Spend Classification
- Evidence Vault
- Tender Readiness
- Commitment Tracking
- Local Content Report Builder
- AI Compliance Assistant
- Approval Workflow

Our phased approach (Phases 3–7) maps to these deliverables as follows:

| Official Deliverable         | Our Phase(s)                         |
| ---------------------------- | ------------------------------------ |
| Local Content Dashboard      | Phase 3 (basic) → Phase 5 (enhanced) |
| Procurement Analyzer         | Phase 3                              |
| Supplier Locality Engine     | Phase 3                              |
| Spend Classification         | Phase 3                              |
| Evidence Vault               | Phase 4                              |
| Tender Readiness             | Phase 5 (future capability)          |
| Commitment Tracking          | Phase 4                              |
| Local Content Report Builder | Phase 5                              |
| AI Compliance Assistant      | Future (post-production)             |
| Approval Workflow            | Phase 4                              |

---

## What This Roadmap Does NOT Include

These capabilities are explicitly out of scope for the current planning:

- Direct LCGPA or regulatory integration (future possibility, not planned)
- Full AI-powered local content classification (requires Local AI/Cloud AI abstraction)
- Institutional Memory for Local ContentOS (requires Core Institutional Memory engine)
- On-Prem deployment package for LocalContentOS (requires Core On-Prem Package first)
- Multi-language support beyond Arabic/English
- Real-time ERP integration
- Marketplace / supplier-facing portal
