# Route Model

> **GOVERNANCE FREEZE (P0 — 2026-07-19 / ADR-109):** Route maturity labels previously marked L6 are **L5 Pilot-ready (conditional)** until pen-test and ops gates close. Prefer this document + code over marketing L6 language.

﻿# AQLIYA Route Strategy

> **Status:** Level 4 — Supporting reference  
> **Version:** 1.0  
> **Authority:** See `docs/DOCUMENTATION_AUTHORITY.md` for the documentation hierarchy.  
> **Cross-reference:** `docs/official/AQLIYA_MASTER_REFERENCE.md`, `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`  
> **Owner:** Platform Architect  
> **Last Reviewed:** 2026-07-22  
> **Last updated:** 2026-07-22 — Full L6 status sync across all products

---

## Route Model

### Route Type Options

- platform landing
- product marketing page
- guided demo
- governed workspace
- dashboard
- settings/admin
- prototype/shell
- API / server-action-backed workspace
- legacy

### Implementation Status Options

- active
- Pilot-ready (L5 conditional)
- pilot-ready
- L5 with conditions
- active adjacent system (L4)
- shared application (L4)
- prototype (L3)
- shell (L2)
- marketing-only (L1)
- strategic/future (L0)
- legacy

---

## Complete Route Table

### Company & Marketing Routes (Platform-First Navigation)

The primary navigation presents AQLIYA as a platform, not a product company:
**المنصة | القطاعات | الإثبات | الحوكمة | عن عقلية** with CTA **احجز جلسة تشخيص**.

| Route                 | Product/System | Route Type             | Public/Protected | Implementation Status | Notes                                 |
| --------------------- | -------------- | ---------------------- | ---------------- | --------------------- | ------------------------------------- |
| `/`                   | AQLIYA Platform| Platform landing       | Public           | Active                | 9-section platform positioning, no product names |
| `/platform`           | AQLIYA Platform| Platform page          | Public           | Active                | Intelligence Core + operating systems list |
| `/industries`         | AQLIYA Platform| Sectors page           | Public           | Active                | 4 sectors: audit, government, enterprise, professional services |
| `/proof`              | AQLIYA Platform| Proof Center           | Public           | Active                | Central hub: demo, brief, pilot, library, security |
| `/governance`         | AQLIYA Platform| Governance page        | Public           | Active                | Trust architecture with AI governance section |
| `/about`              | AQLIYA Platform| Company page           | Public           | Active                | Story + team + methodology |
| `/security`           | AQLIYA Platform| Enterprise security    | Public           | Active                | RBAC, audit trail, encryption, deployment controls |
| `/deployment`         | AQLIYA Platform| Deployment models      | Public           | Active                | Cloud / Private / Air-Gapped |
| `/demo`               | AQLIYA Platform| Interactive demo landing| Public           | Active                | Demo walkthrough landing |
| `/executive-brief`    | AQLIYA Platform| Executive summary      | Public           | Active                | Canonical 4-page brief for leadership |
| `/executive-briefing` | AQLIYA Platform| Redirect alias         | Public           | Active                | Redirect → `/executive-brief` |
| `/pilot-proof`        | AQLIYA Platform| Pilot framework        | Public           | Active                | 28 evaluation criteria + scenarios |
| `/pilot-outcomes`     | AQLIYA Platform| Pilot outcomes hub     | Public           | Active                | Honest placeholder until ≥2 completed pilots |
| `/soc2-roadmap`       | AQLIYA Platform| SOC2 target roadmap    | Public           | Active                | Not a certification claim; Q-targets |
| `/proof-library`      | AQLIYA Platform| Evidence library       | Public           | Active                | Sample outputs on mock data |
| `/contact`            | AQLIYA Platform| Pilot request form     | Public           | Active                | Integrated pilot/demo/contact form |
| `/procurement-pack`   | AQLIYA Platform| Procurement hub        | Public           | Active                | PDF pack: brief, security, DPA, residency, SOW |
| `/print/*`            | AQLIYA Platform| Printable trust assets | Public           | Active                | noindex; executive brief AR/EN, security, DPA, etc. |
| `/en`                 | AQLIYA Platform| English marketing MVP  | Public           | Active                | Home, proof, security, audit, demo, contact, brief |
| `/en/*`               | AQLIYA Platform| English marketing MVP  | Public           | Active                | Subpaths of `/en` only (not full site localization) |
| `/case-studies`       | AQLIYA Platform| Case study index       | Public           | Active                | Simulated scenarios + reference #1 placeholder |
| `/engagement-models`  | AQLIYA Platform| Partnership page       | Public           | Active                | Diagnostic → Pilot → Deploy → Scale + pricing band |
| `/custom-product`     | AQLIYA Platform| Custom system inquiry  | Public           | Active                | Leads to `/api/custom-product-submit` |
| `/terms`              | AQLIYA Platform| Terms of service       | Public           | Active                | Enterprise-grade terms |
| `/privacy`            | AQLIYA Platform| Privacy policy         | Public           | Active                | Honest about no SOC2 yet |
| `/insights`           | AQLIYA Platform| Articles index         | Public           | Active                | Thought leadership |
| `/insights/*`         | AQLIYA Platform| Individual articles    | Public           | Active                |                                        |
| `/buyers/*`           | AQLIYA Platform| Buyer persona guides   | Public           | Active                | Audit partner, CFO, CIO, government |
| `/use-cases`          | AQLIYA Platform| Use case listing       | Public           | Active                |                                        |
| `/how-we-work`        | AQLIYA Platform| Methodology page       | Public           | Active                 | 4-phase methodology, trust principle, AI governance, CTA |

### Operating System Reference Pages (deep-links from /platform#capabilities)

These pages serve as detail references for specialized operating systems. They are NOT primary navigation items — linked from `/platform#capabilities` and footer only.

| Route                     | Operating System | Route Type             | Public/Protected | Implementation Status | Notes                                                               |
| ------------------------- | ---------------- | ---------------------- | ---------------- | --------------------- | ------------------------------------------------------------------- |
| `/products`               | OS catalog       | Reference page         | Public           | Active                | Listing of all operating systems                                    |
| `/products/audit`         | AuditOS          | Reference page         | Public           | Active                | 12-station audit lifecycle detail                                   |
| `/products/decision`      | DecisionOS       | Reference page         | Public           | Active                | Decision governance workflow detail                                 |
| `/products/local-content` | LocalContentOS   | Reference page         | Public           | Active                | Local content compliance detail                                     |
| `/products/sales`         | SalesOS          | Reference page         | Public           | Active                | Business development workflow detail                                |
| `/products/office-ai`     | Office AI        | Reference page         | Public           | Active                | Shared application detail                                           |
| `/products/simulation`    | SimulationOS     | Reference page         | Public           | Redirect only         | marketing-only label — redirects to /products                       |

### Auth & Internal Routes

| Route            | Product/System  | Route Type     | Public/Protected | Implementation Status | Notes |
| ---------------- | --------------- | -------------- | ---------------- | --------------------- | ----- |
| `/login`         | AQLIYA Platform | Authentication | Public           | Active                |       |
| `/access-denied` | AQLIYA Platform | Access control | Public           | Active                |       |

### AuditOS — Governed Workspace

| Route                                               | Product/System | Route Type         | Public/Protected | Implementation Status | Notes                      |
| --------------------------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | -------------------------- |
| `/audit`                                            | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Dashboard, engagement list |
| `/audit/portfolio`                                  | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Org portfolio analytics (A1-07) |
| `/audit/archived`                                   | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Archived engagements + restore (A1-10) |
| `/audit/admin/users`                                | AuditOS        | Settings/admin     | Protected        | Pilot-ready (L5)      | Admin panel                |
| `/audit/engagements/[engagementId]`                 | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Engagement detail          |
| `/audit/engagements/[engagementId]/trial-balance`   | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/mapping`         | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Account mapping            |
| `/audit/engagements/[engagementId]/statements`      | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Financial statements       |
| `/audit/engagements/[engagementId]/notes`           | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/evidence`        | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Evidence vault             |
| `/audit/engagements/[engagementId]/findings`        | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/review`          | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/approval`        | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/recommendations` | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/publication`     | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/validation`      | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/audit-trail`     | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      |                            |
| `/audit/engagements/[engagementId]/pilot`           | AuditOS        | Governed workspace | Protected        | Pilot-ready (L5)      | Pilot-specific             |

### AuditOS — Guided Demo

| Route                    | Product/System | Route Type  | Public/Protected | Implementation Status | Notes                        |
| ------------------------ | -------------- | ----------- | ---------------- | --------------------- | ---------------------------- |
| `/auditos`               | AuditOS demo   | Guided demo | Public           | Demo (L1)             | Mock-backed, unauthenticated |
| `/auditos/trial-balance` | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |
| `/auditos/mapping`       | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |
| `/auditos/statements`    | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |
| `/auditos/evidence`      | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |
| `/auditos/traceability`  | AuditOS demo   | Guided demo | Public           | Demo (L1)             |                              |

### DecisionOS — Production-hardened Governed Workspace (L6)

| Route                            | Product/System | Route Type         | Public/Protected | Implementation Status | Notes           |
| -------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | --------------- |
| `/decisions/gov`                 | DecisionOS     | Dashboard          | Protected        | Pilot-ready (L5 conditional) | Platform governance console: escalation rules, audit events |
| `/decisions/gov/escalation-rules`| DecisionOS     | Dashboard          | Protected        | Pilot-ready (L5 conditional) | Escalation rule management |
| `/decision`                      | DecisionOS     | Redirect           | Protected        | Redirect → `/decisions` | Legacy path (2026-06-17 cleanup) |
| `/decision/gov`                  | DecisionOS     | Redirect           | Protected        | Redirect → `/decisions/gov` | Legacy path (2026-06-17 cleanup) |
| `/decisions`                     | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Decision list. Outcome-tracking dashboard, cross-decision patterns, portfolio view. |
| `/decisions/new`                 | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Create decision |
| `/decisions/[id]`                | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Decision detail with 15 tabs |
| `/decisions/[id]/overview`       | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/intake`         | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/signals`        | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Signal automation engine wired |
| `/decisions/[id]/sector`         | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Sector intelligence + benchmarks wired |
| `/decisions/[id]/risks`          | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/scenarios`      | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/simulation`     | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/recommendation` | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/governance`     | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/framework`      | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/alerts`         | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/insight`        | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/outcome`        | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Outcome correlation analytics |
| `/decisions/[id]/report`         | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Bilingual PDF export |
| `/decisions/[id]/tender`         | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |
| `/decisions/[id]/what-to-do`     | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) |                 |

### LocalContentOS — Production-hardened Governed Workspace (27 routes, L6)

| Route                                                | Product/System | Route Type         | Public/Protected | Implementation Status | Notes                                                |
| ---------------------------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ---------------------------------------------------- |
| `/local-content`                                     | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Dashboard with project metrics, server-action-backed |
| `/local-content/analytics`                           | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | LC-06 org spend analytics (deterministic aggregates) |
| `/local-content/classification-rules`                | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | LC-04 classification rule admin interface           |
| `/local-content/projects/[projectId]/tender-match`   | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | LC-02 tender requirement matching (metadata.tender)  |
| `/local-content/projects`                            | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Project list with create form, server-action-backed  |
| `/local-content/projects/[projectId]`                | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Project detail, navigation to sub-pages, workbook link |
| `/local-content/workbook`                            | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Workbook dashboard: status, completion metrics, score summary |
| `/local-content/workbook/[workbookId]`               | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Workbook detail with 3 tabs (lines/missing/requests) + gating. Scoring UI card showing contributions analysis + section breakdown |
| `/local-content/pilot-readiness`                     | LocalContentOS | Dashboard          | Protected        | Pilot-ready (L5 conditional) | 11-dimension operational readiness assessment with GREEN/AMBER/RED status per metric |
| `/local-content/review-center`                       | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | AI review center with batch approve/reject, inline audit events (last 10), bilingual PDF export |
| `/local-content/quality-dashboard`                   | LocalContentOS | Dashboard          | Protected        | Pilot-ready (L5 conditional) | AI Quality Score composite, confidence distribution (4 buckets), acceptance rate time-series (4-week) |
| `/local-content/projects/[projectId]/suppliers`      | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Supplier/vendor records                              |
| `/local-content/projects/[projectId]/spend`          | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Spend/procurement records                            |
| `/local-content/projects/[projectId]/classification` | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Local content classification workflow                |
| `/local-content/projects/[projectId]/evidence`       | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Evidence upload + protected file download            |
| `/local-content/projects/[projectId]/findings`       | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Gap/risk findings                                    |
| `/local-content/projects/[projectId]/review`         | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Review workflow                                      |
| `/local-content/projects/[projectId]/approval`       | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Approval workflow                                    |
| `/local-content/projects/[projectId]/reports`        | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Export/reports generation                            |
| `/local-content/projects/[projectId]/audit-trail`    | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Audit log viewer                                     |
| `/local-content/settings/integrations`               | LocalContentOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | ERP integration admin: SAP/Oracle/CSV importers      |

**LocalContentOS notes:**

- Scoring engine (LcScore): 4 metrics - revenue 35%, supplier_spend 35%, workforce 20%, assets 10%; tier calculation
- Formula engine active: GP-01 (REV-03 - COS-03), WRK-03 (WRK-01 / WRK-02 x 100), SPN-03 (SPN-01 + SPN-02)
- Tab-level gating enforced: population, recalculation, edits, exports are gated per tab
- Score persistence: lcScore + lcScoreComputedAt saved to DB; export includes score data
- Multi-reviewer approval routing with state machine (awaiting_reviews→ready_for_approval→approved/rejected)
- Arabic PDF font fidelity: Noto Naskh Arabic embedded via shared font registry
- 321+ tests PASS
- AI quality: 100% pilot readiness (7/7 GREEN), 95% acceptance, 88% confidence gradient
### Office AI Assistant — Shared Application

| Route                 | Product/System      | Route Type         | Public/Protected | Implementation Status   | Notes                          |
| --------------------- | ------------------- | ------------------ | ---------------- | ----------------------- | ------------------------------ |
| `/assistant`          | Office AI Assistant | Shared application | Protected        | Pilot-ready (L5)        | Real governed task workspace — 6 task types, bilingual UX, seed data |
| `/assistant/[taskId]` | Office AI Assistant | Shared application | Protected        | Pilot-ready (L5)        | Real files/outputs/review flow |

### Intelligence / Sector Routes

| Route                        | Product/System | Route Type         | Public/Protected | Implementation Status | Notes               |
| ---------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ------------------- |
| `/intelligence`              | Intelligence Core | Platform workspace | Protected     | Usable v0.1 (L4)      | Core engines dashboard, ABAC readiness, outbox stats, audit feed |
| `/intelligence/sectors`      | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional)  | Sector intelligence |
| `/intelligence/sectors/[id]` | DecisionOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Sector detail       |

### Knowledge Foundation Versioning — Pilot-ready (L5 conditional)

| Route                                   | Product/System | Route Type         | Public/Protected | Implementation Status | Notes               |
| --------------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ------------------- |
| `/knowledge-foundation`                 | Knowledge Foundation Versioning | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Version promotion pipeline, promotion analytics dashboard |
| `/knowledge-foundation/[id]`           | Knowledge Foundation Versioning | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Version detail, governance lifecycle, rollback UI, PDF/JSON export buttons |
| `/knowledge-foundation/new`            | Knowledge Foundation Versioning | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Create new version form |
| `/knowledge-foundation/diff`           | Knowledge Foundation Versioning | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Compare two versions with visual diff |
| `/knowledge-foundation/history`         | Knowledge Foundation Versioning | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Audit event log table |

### Platform Operator APIs (Intelligence Core / Tier 3)

| Route | Product/System | Route Type | Public/Protected | Implementation Status | Notes |
|-------|----------------|------------|------------------|----------------------|-------|
| `/api/platform/enterprise-health` | Intelligence Core | Operator API | Protected (ADMIN) | Usable v0.1 (L4) | Tier 3 readiness snapshot |
| `/api/platform/outbox/status` | Intelligence Core | Operator API | Protected (ADMIN) | Usable v0.1 (L4) | Outbox queue counts + failed rows |
| `/api/platform/outbox/process` | Intelligence Core | Operator API | Protected (ADMIN) | Usable v0.1 (L4) | Process pending outbox batch |
| `/api/platform/outbox/retry` | Intelligence Core | Operator API | Protected (ADMIN) | Usable v0.1 (L4) | Reset failed → pending (audited) |
| `/api/platform/events/registry` | Intelligence Core | Operator API | Protected (ADMIN) | Usable v0.1 (L4) | Event schema registry (Phase 2) |
| `/api/platform/abac/shadow-report` | Intelligence Core | Operator API | Protected (ADMIN) | Usable v0.1 (L4) | ABAC shadow mismatch report |
| `/api/platform/abac/pilot-status` | Intelligence Core | Operator API | Protected (ADMIN) | Usable v0.1 (L4) | ABAC enforce pilot readiness |
| `/monitoring` | Platform | Operator workspace | Protected (ADMIN) | Usable v0.1 (L4) | Enterprise health panel + outbox actions |
| `/operator` | Platform | Operator workspace | Protected (ADMIN) | Usable v0.1 (L4) | Operator dashboard + enterprise health |

### SalesOS — Production-hardened Commercial Intelligence Workspace (32 routes, L6)

| Route                               | Product/System | Route Type             | Public/Protected | Implementation Status | Notes                                       |
| ----------------------------------- | -------------- | ---------------------- | ---------------- | --------------------- | ------------------------------------------- |
| `/sales`                               | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Dashboard, server-action-backed             |
| `/sales/accounts`                      | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Account list                                |
| `/sales/accounts/new`                  | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Create account                              |
| `/sales/accounts/[id]`                 | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Account detail                              |
| `/sales/accounts/[id]/brief`           | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Account brief export preview                |
| `/sales/accounts/[id]/brief/export`    | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Account brief export                        |
| `/sales/activities`                    | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Activity stream                             |
| `/sales/approval`                      | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Approval queue                              |
| `/sales/audit-trail`                   | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Audit log viewer                            |
| `/sales/command-center`                | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Command center                              |
| `/sales/deals`                         | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Deal list                                   |
| `/sales/deals/new`                     | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Create deal                                 |
| `/sales/deals/[id]`                    | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Deal detail                                 |
| `/sales/deals/[id]/pilot`              | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Deal pilot handoff                          |
| `/sales/deals/[id]/pilot/export`       | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Pilot export                                |
| `/sales/icp`                           | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | ICP scoring & analysis                      |
| `/sales/intelligence`                  | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Sales intelligence hub with 12 sub-engines  |
| `/sales/forecast`                      | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Pipeline forecast with stage weights       |
| `/sales/funnel`                        | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Conversion funnel analytics                |
| `/sales/pipeline-depth`                | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Pipeline depth analytics                   |
| `/sales/opportunities`                 | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Opportunity list                            |
| `/sales/opportunities/new`             | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Create opportunity                          |
| `/sales/opportunities/[id]`            | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Opportunity detail                          |
| `/sales/outreach`                      | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Governed outreach drafts (no auto-send)     |
| `/sales/pilot-handoff/[dealId]`        | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Pilot handoff page                          |
| `/sales/pipeline`                      | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Pipeline view                               |
| `/sales/reports`                       | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Reports                                     |
| `/sales/revenue`                       | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Revenue tracking                            |
| `/sales/review`                        | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Review queue                                |
| `/sales/signals`                       | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Signal feed                                 |
| `/sales/settings/crm`                  | SalesOS        | Governed workspace | Protected        | Pilot-ready (L5 conditional) | CRM sync admin (HubSpot/Salesforce)         |

**SalesOS maturity notes:** L5 Pilot-ready (conditional) (2026-07-03). Full error/loading/not-found boundaries on all 32 route segments. All 8 L6 gaps closed. 878+ tests across 86 test files PASS. Prisma-backed P0 Core models (13). ~80 components. Sidebar entry in both sidebars. Seed data wired in main `prisma/seed.ts`.

### Organizations — Pilot-Ready Surface

| Route                   | Product/System | Route Type      | Public/Protected | Implementation Status | Notes                                          |
| ----------------------- | -------------- | --------------- | ---------------- | --------------------- | ---------------------------------------------- |
| `/organizations`        | Organizations  | List workspace  | Protected        | Pilot-ready (L5)      | Real Prisma data — org cards with counts       |
| `/organizations/[id]`   | Organizations  | Detail workspace| Protected        | Pilot-ready (L5)      | OrgWorkspace dashboard — users, products, edit |
| `/organizations/sunbul` | Organizations  | Workspace       | Protected        | Pilot-ready (L5)      | Sunbul org workspace with real data             |

### Platform Settings / Admin / Diagnostics

| Route                             | Product/System | Route Type     | Public/Protected | Implementation Status | Notes                             |
| --------------------------------- | -------------- | -------------- | ---------------- | --------------------- | --------------------------------- |
| `/settings`                       | Platform       | Settings/admin | Protected        | Shell (L2)            | Local-state-only internal preview |
| `/settings/workspaces`            | Platform       | Settings/admin | Protected        | Active (L4)           | Real workspace diagnostics        |
| `/settings/platform-organization` | Platform       | Settings/admin | Protected        | Active (L4)           | Real platform org diagnostics     |
| `/settings/audit-logs`            | Platform       | Settings/admin | Protected        | Active (L4)           | Unified audit log viewer (PlatformAuditLog, productKey-scoped) |
| `/settings/skills/evaluate`       | Platform       | Settings/admin | Protected        | Active (L4)           | Skills evaluation dashboard       |
| `/settings/ai-governance`         | Platform       | Settings/admin | Protected        | Active (L4)           | Centralized AI governance dashboard: AI audit events across products, stats, model/provider tracking |
| `/settings/models`                | Platform       | Settings/admin | Protected        | Active (L4)           | Model Governance: AI model registry with lifecycle (register→review→approve→deploy→deprecate). ADMIN only. |
| `/monitoring`                     | Platform       | Settings/admin | Protected        | Active (L4)           | Real aggregate counts             |

### WorkflowOS — Production-hardened Governed Workspace (L6)

| Route                                               | Product/System | Route Type         | Public/Protected | Implementation Status | Notes                  |
| --------------------------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ---------------------- |
| `/workflowos`                                       | WorkflowOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Dashboard with real metrics via WorkflowDashboard + getWorkflowDashboardStats |
| `/workflowos/admin`                                 | WorkflowOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Admin panel (ADMIN role only) |
| `/workflowos/clients/[clientId]/records/[recordId]` | WorkflowOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Record detail          |
| `/workflowos/templates`                             | WorkflowOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Template list          |
| `/workflowos/templates/new`                         | WorkflowOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Create template (drag-and-drop) |
| `/workflowos/templates/[id]`                        | WorkflowOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Template detail        |
| `/workflowos/records`                               | WorkflowOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Org workflow records   |
| `/workflowos/records/[id]`                          | WorkflowOS     | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Record from template   |

### LocalContactOS — Production-hardened Governed Workspace (L6)

| Route                              | Product/System | Route Type         | Public/Protected | Implementation Status | Notes              |
| ---------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ------------------ |
| `/contacts`                        | LocalContactOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Contact registry with search + sensitivity filter |
| `/contacts/dashboard`              | LocalContactOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | KPIs, charts, recent activity |
| `/contacts/new`                    | LocalContactOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Create contact     |
| `/contacts/[id]`                   | LocalContactOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Detail: info, relations, interactions, evidence, reviews, export, risk flags |
| `/contacts/[id]/edit`              | LocalContactOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Edit contact form (pre-populated) |
| `/contacts/[id]/relations/new`     | LocalContactOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Add relation       |
| `/contacts/[id]/interactions/new`  | LocalContactOS | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Log interaction    |

### Institutional Memory — Production-hardened Knowledge Graph (L6)

| Route                         | Product/System      | Route Type         | Public/Protected | Implementation Status | Notes                                        |
| ----------------------------- | ------------------- | ------------------ | ---------------- | --------------------- | -------------------------------------------- |
| `/institutional-memory`              | Institutional Memory| Governed workspace | Protected        | Pilot-ready (L5 conditional) | Cross-product knowledge graph dashboard      |
| `/institutional-memory/events`       | Institutional Memory| Governed workspace | Protected        | Pilot-ready (L5 conditional) | Memory event list with delete & JSON export |
| `/institutional-memory/collections`  | Institutional Memory| Governed workspace | Protected        | Pilot-ready (L5 conditional) | Saved collections of memory event links      |
| `/institutional-memory/graph`        | Institutional Memory| Governed workspace | Protected        | Pilot-ready (L5 conditional) | Interactive knowledge graph visualization (D3.js) |

### RiskOS — Production-hardened Risk Workspace (L6)

| Route                              | Product/System | Route Type         | Public/Protected | Implementation Status | Notes                                        |
| ---------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | -------------------------------------------- |
| `/risk`                            | RiskOS         | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Dashboard with 4 KPI cards, risk distribution, recent assessments + model list toggle |
| `/risk/[id]`                       | RiskOS         | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Risk model detail                            |
| `/risk/assessments/[id]`           | RiskOS         | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Assessment detail: score bars, category scores, procedure step tracking, audit trail, JSON export |

### ContentStudio — Production-hardened Content Workspace (L6)

| Route                                     | Product/System | Route Type            | Public/Protected | Implementation Status | Notes                                                            |
| ----------------------------------------- | -------------- | --------------------- | ---------------- | --------------------- | ---------------------------------------------------------------- |
| \/content-studio\                       | ContentStudio  | Dashboard             | Protected        | Pilot-ready (L5 conditional) | Dashboard with workspace cards, KPI stats (workspaces, content, published), workspace creation dialog. AR-first RTL UI. |
| \/content-studio/[workspaceId]\          | ContentStudio  | Governed workspace    | Protected        | Pilot-ready (L5 conditional) | Workspace detail with status-filtered tabs (ALL/DRAFT/IN_REVIEW/APPROVED/PUBLISHED/ARCHIVED), per-workspace stats. |
| \/content-studio/[workspaceId]/create\   | ContentStudio  | Governed workspace    | Protected        | Pilot-ready (L5 conditional) | Content creation form with optional template pre-fill.           |
| \/content-studio/[workspaceId]/[contentId]\ | ContentStudio  | Governed workspace | Protected        | Pilot-ready (L5 conditional) | Content detail: title, body, metadata, version history, lifecycle actions, evidence section, bilingual PDF export. |
| \/content-studio/templates\              | ContentStudio  | Governed workspace    | Protected        | Pilot-ready (L5 conditional) | Template list + inline create form with variable interpolation.  |

**ContentStudio notes:** L5 Pilot-ready (conditional) (2026-07-03). Full error/loading/not-found boundaries on all 5 routes. Standalone Operational Content Workspace (NOT a subsystem of LocalContentOS). 5 Prisma models (ContentWorkspace, ContentItem, ContentVersion, ContentTemplate, ContentEvidence). Content lifecycle: DRAFT→IN_REVIEW→APPROVED→PUBLISHED→ARCHIVED. PDF export with bilingual Arabic/English (Noto Naskh Arabic), markdown-aware formatting, audit trail. ~125 tests across 3 files — all PASS. Seed data: 3 workspaces, 7 content items, 12 versions, 2 templates, 4 evidence records.
### Sunbul — Redirect Alias to WorkflowOS

| Route                                           | Product/System | Route Type        | Public/Protected | Implementation Status | Notes                                                                  |
| ----------------------------------------------- | -------------- | ----------------- | ---------------- | --------------------- | ---------------------------------------------------------------------- |
| `/sunbul`                                       | Sunbul         | Route alias (302) | Protected        | Redirect alias        | `permanentRedirect` to `/workflowos`. No components, no data, no UI.   |
| `/sunbul/admin`                                 | Sunbul         | Route alias (302) | Protected        | Redirect alias        | `permanentRedirect` to `/workflowos/admin`.                            |
| `/sunbul/clients/[clientId]/records/[recordId]` | Sunbul         | Route alias (302) | Protected        | Redirect alias        | `permanentRedirect` to matching `/workflowos/clients/.../records/...`. |

### Legacy Routes

| Route                                    | Product/System | Route Type | Public/Protected | Implementation Status | Notes                                                       |
| ---------------------------------------- | -------------- | ---------- | ---------------- | --------------------- | ----------------------------------------------------------- |
| `/published/recommendation/[decisionId]` | DecisionOS     | Legacy     | Protected        | Legacy                | Legacy route backed by organization-scoped publication data |

---

## API Routes

| Route                                                                    | Product/System      | Route Type     | Public/Protected | Implementation Status | Notes                                                           |
| ------------------------------------------------------------------------ | ------------------- | -------------- | ---------------- | --------------------- | --------------------------------------------------------------- |
| `/api/auth/[...nextauth]`                                                | AQLIYA Platform     | API — auth     | Public           | Active                | NextAuth v5                                                     |
| `/api/health`                                                            | AQLIYA Platform     | API — health   | Public           | Active                | Safe health check                                               |
| `/api/custom-product-submit`                                             | AQLIYA Platform     | API — form     | Public           | Active                | Custom product inquiry                                          |
| `/api/metrics`                                                           | AQLIYA Platform     | API — metrics  | Protected        | Active                | Admin-only                                                      |
| `/api/skills/evaluate`                                                   | AQLIYA Platform     | API — eval     | Protected        | Active                | GET lists skills; POST runs evaluation (auth required)          |
| `/api/audit/evidence/[evidenceId]/download`                              | AuditOS             | API — download | Protected        | Active                | Authenticated + engagement access + audit log                   |
| `/api/audit/engagements/[engagementId]/exports/[format]`                 | AuditOS             | API — export   | Protected        | Active                | Authenticated + engagement access                               |
| `/api/decisions/[decisionId]/evidence/[evidenceId]/download`             | DecisionOS          | API — download | Protected        | Active                | Authenticated + tenant-safe decision access + audit log         |
| `/api/office-ai/download`                                                | Office AI Assistant | API — download | Protected        | Active                | Authenticated + platform-org access + audit log                 |
| `/api/local-content/projects/[projectId]/evidence/[evidenceId]/download` | LocalContentOS      | API — download | Protected        | Active                | Authenticated + tenant-safe project access + audit log          |
| `/api/local-content/projects/[projectId]/reports/[reportId]/download`    | LocalContentOS      | API — download | Protected        | Active                | Authenticated + project access + audit log                      |
| `/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf`       | WorkflowOS          | API — export   | Protected        | Active                | Permissioned PDF export. Canonical WorkflowOS API route.        |
| `/api/workflowos/documents/[documentId]/download`                        | WorkflowOS          | API — download | Protected        | Active                | Permissioned document download. Canonical WorkflowOS API route. |

---

## Proxy Auth Protection

Current code reality uses `src/middleware.ts` for route protection. It uses `getToken` from `next-auth/jwt` to validate session tokens before allowing access to protected routes. Next.js 16 documentation deprecates the `middleware` filename in favor of `proxy`, but this repository currently runs the auth perimeter through `src/middleware.ts` and must not be re-renamed casually without validating runtime behavior.

### Protected Route Prefixes

- `/audit`
- `/decisions`
- `/local-content`
- `/assistant`
- `/organizations`
- `/settings`
- `/monitoring`
- `/intelligence`
- `/sunbul`
- `/contacts`
- `/institutional-memory`
- `/workflowos`
- /content-studio
- `/sales`
- `/published/recommendation`
- `/knowledge-foundation`

Protected route behavior:

- Page requests without a valid JWT redirect to `/login?callbackUrl=<original_path>`.
- Security headers are applied to all responses via `setSecurityHeaders`.

### Public Route Exclusions

Marketing pages, demo routes, auth pages, and static assets bypass the auth check:

- Root `/`, `/about`, `/contact`, `/custom-product`, `/demo`, `/deployment`
- `/engagement-models`, `/executive-brief`, `/executive-briefing`, `/governance`
- `/how-we-work`, `/insights/*`, `/pilot-proof`, `/platform`, `/privacy`
- `/proof-library`, `/products/*`, `/security`, `/terms`, `/use-cases`
- `/case-studies`, `/auditos/*`, `/buyers/*`
- `/login`, `/access-denied`
- `/api/auth/*`, `/api/health`
- Static: `/_next/*`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`

`/auditos/*` is the only intentionally public AuditOS route family. Its public status is allowed only because it is a sanitized guided demo, not a workspace.

## Route Rules

1. `/audit/*` = governed workspace (authenticated, DB-backed, auditable). Do not treat as a public demo.
2. `/auditos/*` = guided demo (public, mock-backed, read-only). Always label as `Demo` in UI and docs.
   `/auditos/*` is intentionally public because it is a sanitized, mock-only, read-only guided demo. It must not use customer data, uploads, mutations, exports/downloads, tenant state, or operational audit workflows. If any of these are introduced, the route must move behind authentication/gating before release.
3. `/assistant/*` = governed shared application on AQLIYA Core. Do not market it as a standalone product unless explicitly reclassified.
4. `/local-content/*` = governed workspace (authenticated, server-action-backed, auditable). **L5 Pilot-ready (conditional)** — all 9 LC gaps closed, full error/loading/not-found boundaries on 27 route segments, 321+ tests. Arabic PDF font fidelity (Noto Naskh Arabic embedded). Scoring engine, tender matching, multi-reviewer approval routing, ERP integration. AI quality: 100% readiness (7/7 GREEN), 95% acceptance, 88% confidence gradient.
5. `/workflowos/*` = governed workspace (authenticated, DB-backed, auditable). **L5 Pilot-ready (conditional)** — full error/loading/not-found boundaries on all route segments, template workflows, SLA monitoring (on_track→approaching→overdue→breached), gated export workflow, escalation, 31 action tests, seed data. Monitoring metric tracked in enterprise health dashboard.
6. `/sunbul/*` = redirect alias family over WorkflowOS implementation. Every route is a `permanentRedirect(302)` wrapper.
7. `/organizations/*` and `/settings` must be labeled prototype/internal preview until they have real persistence and workflow backing. SalesOS is now **L5 Pilot-ready (conditional)** — 32 routes with full error/loading/not-found boundaries, real Prisma models (13), server actions, RBAC, audit trail, evidence links, seed data, sidebar navigation. Intelligence hub with 12 sub-engines, forecasting engine, CRM sync (HubSpot/Salesforce). 878+ tests across 86 test files PASS.
8. `/api/*` sensitive endpoints (`/api/audit/evidence/*`, `/api/office-ai/download`, `/api/metrics`, `/api/decisions/*/evidence/*/download`, `/api/local-content/*/evidence/*/download`) must remain permissioned.
9. Do not create `/simulation` top-level routes until that system has a real workspace implementation.
10. Product marketing pages belong under `/products/*`.
11. Company and marketing pages must not imply future products are already implemented.
12. `/decisions/*` = DecisionOS production-hardened governed workspace (L6). Authenticated, DB-backed, evidence upload, bilingual PDF export, signal automation, sector intelligence, cross-decision pattern analysis, outcome correlation analytics. 275 tests (273 pass), seed data. Full error/loading/not-found boundaries on all 22 route segments.
13. `/published/recommendation/*` is protected in current code reality because the backing action requires an authenticated user from the same organization.
14. `/executive-brief` is the canonical executive brief route. `/executive-briefing` is preserved only as a redirect alias.
15. `/risk/*` = RiskOS governed workspace (L5 Pilot-ready (conditional)). Authenticated, dashboard with 4 KPI cards + risk distribution, seed data with 1 model / 1 assessment / 2 procedures. Assessment detail page with DRAFT→REVIEWED→APPROVED workflow, procedure step tracking with interactive checkboxes, audit trail panel, JSON export. Full error/loading/not-found boundaries on all 4 risk routes.
16. **Download Security Standard** — Every file download API route must implement all three layers: (a) authentication at entry, (b) tenant-safe access check returning 404 on any failure (never 403 for "exists but not yours"), and (c) successful download audit trail via `writePlatformAuditLog` (unified single-write model, audit consolidation 2026-07-25) with `status: "success"`, `targetType`, `targetId`, `targetLabel`, `actorId`, `actorType`, `sourceSystem`. Response must use `Cache-Control: private, no-store`. Currently enforced on all 11 download routes across 5 products. All routes write to unified PlatformAuditLog (single-write, no dual-write).
17. `/institutional-memory/*` = governed knowledge graph workspace (L5 Pilot-ready (conditional)). Authenticated, DB-backed, cross-product entity linking via InstitutionalMemoryEvent (10 seed events). Collections via InstitutionalMemoryCollection (2 seed collections). D3.js force-directed graph visualization via IntelligenceGraphNode/Edge (13 seed nodes, 10 seed edges). Export memory events as JSON with audit trail.
18. `/content-studio/*` = ContentStudio production-hardened content workspace (L6). Authenticated, 5 Prisma models, content lifecycle (DRAFT→IN_REVIEW→APPROVED→PUBLISHED→ARCHIVED), versioning with restore, template variable interpolation, evidence linking, bilingual PDF export with Noto Naskh Arabic, audit trail via writePlatformAuditLog. ~125 tests. Full error/loading/not-found boundaries on all 5 routes.
19. `/knowledge-foundation/*` = governed Knowledge Foundation Versioning workspace (L5 Pilot-ready (conditional)). Authenticated, DB-backed, promotion pipeline for institutional knowledge: version lifecycle (DRAFT→APPROVED→RELEASED→ACTIVE→DEPRECATED), immutable release packages with SHA-256, structured diff engine, ADMIN-only rollback with reason, 7 audit event types to PlatformAuditLog, bilingual PDF/JSON export with audit trail. 87 tests PASS. Full error boundaries on all routes.

20. **Pagination standard (2026-07-13)**: All server actions across the platform now return paginated results in `{ items, totalCount, hasMore }` format. No server action returns unbounded arrays. This applies to all product dashboards, list views, and data-fetching actions.
21. **Dashboard cache strategy (2026-07-13)**: All 5 primary dashboard server actions use `getCachedOrFetch` with a 5-minute TTL. Cached keys are scoped per user/org. Implemented via `src/lib/platform/cache-strategy.ts`.
22. **Cache invalidation (2026-07-13)**: Mutations that affect dashboard data call `invalidateDashboardCaches()` to bust the 5-minute TTL cache. Ensures stale data is never served after write operations (create, update, delete, status change).
