# AQLIYA Route Strategy

> **Status:** Level 4 — Supporting reference  
> **Authority:** See `docs/DOCUMENTATION_AUTHORITY.md` for the documentation hierarchy.  
> **Cross-reference:** `docs/official/AQLIYA_MASTER_REFERENCE.md`, `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`  
> **Last updated:** 2026-06-17 — LocalContentOS V3.5: added /local-content/pilot-readiness route (Pilot Readiness Dashboard)

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
| `/how-we-work`        | AQLIYA Platform| Methodology page       | Public           | Loading                | Requires content fix |

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

### DecisionOS — Active Adjacent System

| Route                            | Product/System | Route Type         | Public/Protected | Implementation Status | Notes           |
| -------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | --------------- |
| `/decisions/gov`                 | DecisionOS     | Dashboard          | Protected        | Active (L4)           | Platform governance console: escalation rules, audit events |
| `/decisions/gov/escalation-rules`| DecisionOS     | Dashboard          | Protected        | Active (L4)           | Escalation rule management |
| `/decision`                      | DecisionOS     | Redirect           | Protected        | Redirect → `/decisions` | Legacy path (2026-06-17 cleanup) |
| `/decision/gov`                  | DecisionOS     | Redirect           | Protected        | Redirect → `/decisions/gov` | Legacy path (2026-06-17 cleanup) |
| `/decisions`                     | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Decision list   |
| `/decisions/new`                 | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Create decision |
| `/decisions/[id]`                | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Decision detail |
| `/decisions/[id]/overview`       | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/intake`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/signals`        | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/sector`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/risks`          | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/scenarios`      | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/simulation`     | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/recommendation` | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/governance`     | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/framework`      | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/alerts`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/insight`        | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/outcome`        | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/report`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/tender`         | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |
| `/decisions/[id]/what-to-do`     | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  |                 |

### LocalContentOS — Usable v0.1 Product Workspace (20 routes)

| Route                                                | Product/System | Route Type         | Public/Protected | Implementation Status | Notes                                                |
| ---------------------------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ---------------------------------------------------- |
| `/local-content`                                     | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Dashboard with project metrics, server-action-backed |
| `/local-content/analytics`                           | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | LC-06 org spend analytics (deterministic aggregates) |
| `/local-content/classification-rules`                | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | LC-04 classification rule admin (read)               |
| `/local-content/projects/[projectId]/tender-match`   | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | LC-02 tender requirement matching (metadata.tender)  |
| `/local-content/projects`                            | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Project list with create form, server-action-backed  |
| `/local-content/projects/[projectId]`                | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Project detail, navigation to sub-pages, workbook link |
| `/local-content/workbook`                            | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Workbook dashboard: status, completion metrics, score summary |
| `/local-content/workbook/[workbookId]`               | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Workbook detail with 3 tabs (lines/missing/requests) + gating. Scoring UI card showing contributions analysis + section breakdown |
| `/local-content/pilot-readiness`                     | LocalContentOS | Dashboard          | Protected        | L4 Usable v0.1    | V3.5: 11-dimension operational readiness assessment with GREEN/AMBER/RED status per metric and overall pilot score |
| `/local-content/projects/[projectId]/suppliers`      | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Supplier/vendor records                              |
| `/local-content/projects/[projectId]/spend`          | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Spend/procurement records                            |
| `/local-content/projects/[projectId]/classification` | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Local content classification workflow                |
| `/local-content/projects/[projectId]/evidence`       | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Evidence upload + protected file download            |
| `/local-content/projects/[projectId]/findings`       | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Gap/risk findings                                    |
| `/local-content/projects/[projectId]/review`         | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Review workflow                                      |
| `/local-content/projects/[projectId]/approval`       | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Approval workflow                                    |
| `/local-content/projects/[projectId]/reports`        | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Export/reports generation                            |
| `/local-content/projects/[projectId]/audit-trail`    | LocalContentOS | Governed workspace | Protected        | L4 Usable v0.1    | Audit log viewer                                     |

**LocalContentOS route limitations:**

- L4 Usable v0.1 - not L6 production-hardened
- Scoring engine (LcScore): 4 metrics - revenue 35%, supplier_spend 35%, workforce 20%, assets 10%
- Formula engine active: GP-01 (REV-03 - COS-03), WRK-03 (WRK-01 / WRK-02 x 100), SPN-03 (SPN-01 + SPN-02)
- Tab-level gating enforced: population, recalculation, edits, exports are gated per tab
- Score persistence: lcScore + lcScoreComputedAt saved to DB; export includes score data
- 265 passing LocalContent tests
- See `docs/reports/localcontentos-v0.1-documentation-truth-sync-2026-05-23.md`
### Office AI Assistant — Shared Application

| Route                 | Product/System      | Route Type         | Public/Protected | Implementation Status   | Notes                          |
| --------------------- | ------------------- | ------------------ | ---------------- | ----------------------- | ------------------------------ |
| `/assistant`          | Office AI Assistant | Shared application | Protected        | Shared application (L4) | Real governed task workspace   |
| `/assistant/[taskId]` | Office AI Assistant | Shared application | Protected        | Shared application (L4) | Real files/outputs/review flow |

### Intelligence / Sector Routes

| Route                        | Product/System | Route Type         | Public/Protected | Implementation Status | Notes               |
| ---------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ------------------- |
| `/intelligence/sectors`      | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Sector intelligence |
| `/intelligence/sectors/[id]` | DecisionOS     | Governed workspace | Protected        | Active adjacent (L4)  | Sector detail       |

### SalesOS — Governed CRM-lite Workspace (27 routes)

| Route                                  | Product/System | Route Type         | Public/Protected | Implementation Status    | Notes                                            |
| -------------------------------------- | -------------- | ------------------ | ---------------- | ------------------------ | ------------------------------------------------ |
| `/sales`                               | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Dashboard, server-action-backed                  |
| `/sales/accounts`                      | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Account list                                     |
| `/sales/accounts/new`                  | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Create account                                   |
| `/sales/accounts/[id]`                 | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Account detail                                   |
| `/sales/accounts/[id]/brief`           | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Account brief export preview                     |
| `/sales/accounts/[id]/brief/export`    | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Account brief export                             |
| `/sales/activities`                    | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Activity stream                                  |
| `/sales/approval`                      | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Approval queue                                   |
| `/sales/audit-trail`                   | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Audit log viewer                                 |
| `/sales/command-center`                | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Command center                                   |
| `/sales/deals`                         | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Deal list                                        |
| `/sales/deals/new`                     | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Create deal                                      |
| `/sales/deals/[id]`                    | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Deal detail                                      |
| `/sales/deals/[id]/pilot`              | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Deal pilot handoff                               |
| `/sales/deals/[id]/pilot/export`       | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Pilot export                                     |
| `/sales/icp`                           | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | ICP scoring & analysis                           |
| `/sales/intelligence`                  | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Sales intelligence hub (S7-01)                   |
| `/sales/forecast`                      | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | S7-02 pipeline forecast (deterministic)          |
| `/sales/funnel`                        | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | S7-06 conversion funnel analytics              |
| `/sales/pipeline-depth`                | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | S7-07 pipeline depth analytics                 |
| `/sales/opportunities`                 | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Opportunity list                                 |
| `/sales/opportunities/new`             | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Create opportunity                               |
| `/sales/opportunities/[id]`            | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Opportunity detail                               |
| `/sales/outreach`                      | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Governed outreach drafts (no auto-send)          |
| `/sales/pilot-handoff/[dealId]`        | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Pilot handoff page                               |
| `/sales/pipeline`                      | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Pipeline view                                    |
| `/sales/reports`                       | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Reports                                          |
| `/sales/revenue`                       | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Revenue tracking                                 |
| `/sales/review`                        | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Review queue                                     |
| `/sales/signals`                       | SalesOS        | Governed workspace | Protected        | Prototype (L3→L4)       | Signal feed                                      |

**SalesOS maturity notes:** Builds and compiles (2026-06-02) after Phantom Imports Gate. Real Prisma schema, server actions, RBAC, audit trail, evidence links. Test suite: 138 suites, 1069 tests, 0 failed. Not yet L4 production-usable — pending seed data verification and browser smoke test.

### Organizations — Prototype Surface

| Route                   | Product/System | Route Type      | Public/Protected | Implementation Status | Notes                      |
| ----------------------- | -------------- | --------------- | ---------------- | --------------------- | -------------------------- |
| `/organizations`        | Organizations  | Prototype/shell | Protected        | Prototype (L3)        | Mock/internal preview only |
| `/organizations/[id]`   | Organizations  | Prototype/shell | Protected        | Prototype (L3)        | Mock/internal preview only |
| `/organizations/sunbul` | Organizations  | Workspace       | Protected        | Prototype (L3)        | Links to Sunbul surface    |

### Platform Settings / Admin / Diagnostics

| Route                             | Product/System | Route Type     | Public/Protected | Implementation Status | Notes                             |
| --------------------------------- | -------------- | -------------- | ---------------- | --------------------- | --------------------------------- |
| `/settings`                       | Platform       | Settings/admin | Protected        | Shell (L2)            | Local-state-only internal preview |
| `/settings/workspaces`            | Platform       | Settings/admin | Protected        | Active (L4)           | Real workspace diagnostics        |
| `/settings/platform-organization` | Platform       | Settings/admin | Protected        | Active (L4)           | Real platform org diagnostics     |
| `/settings/audit-logs`            | Platform       | Settings/admin | Protected        | Active (L4)           | Real audit log viewer             |
| `/settings/skills/evaluate`       | Platform       | Settings/admin | Protected        | Active (L4)           | Skills evaluation dashboard       |
| `/monitoring`                     | Platform       | Settings/admin | Protected        | Active (L4)           | Real aggregate counts             |

### WorkflowOS — Governed Workspace

| Route                                               | Product/System | Route Type         | Public/Protected | Implementation Status | Notes                  |
| --------------------------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ---------------------- |
| `/workflowos`                                       | WorkflowOS     | Governed workspace | Protected        | Usable v0.1 (L4)      | Dashboard with real metrics via WorkflowDashboard + getWorkflowDashboardStats |
| `/workflowos/admin`                                 | WorkflowOS     | Governed workspace | Protected        | Usable v0.1 (L4)      |                        |
| `/workflowos/clients/[clientId]/records/[recordId]` | WorkflowOS     | Governed workspace | Protected        | Usable v0.1 (L4)      | Record detail          |
| `/workflowos/templates`                             | WorkflowOS     | Governed workspace | Protected        | Usable v0.1 (L4)      | Template list          |
| `/workflowos/templates/new`                         | WorkflowOS     | Governed workspace | Protected        | Usable v0.1 (L4)      | Create template        |
| `/workflowos/templates/[id]`                        | WorkflowOS     | Governed workspace | Protected        | Usable v0.1 (L4)      | Template detail        |
| `/workflowos/records`                               | WorkflowOS     | Governed workspace | Protected        | Usable v0.1 (L4)      | Org workflow records   |
| `/workflowos/records/[id]`                          | WorkflowOS     | Governed workspace | Protected        | Usable v0.1 (L4)      | Record from template   |

### LocalContactOS — Governed Workspace (v0.1 slice)

| Route                              | Product/System | Route Type         | Public/Protected | Implementation Status | Notes              |
| ---------------------------------- | -------------- | ------------------ | ---------------- | --------------------- | ------------------ |
| `/contacts`                        | LocalContactOS | Governed workspace | Protected        | Usable v0.1 (L4)      | Contact registry   |
| `/contacts/new`                    | LocalContactOS | Governed workspace | Protected        | Usable v0.1 (L4)      | Create contact     |
| `/contacts/[id]`                   | LocalContactOS | Governed workspace | Protected        | Usable v0.1 (L4)      | Contact detail     |
| `/contacts/[id]/relations/new`     | LocalContactOS | Governed workspace | Protected        | Usable v0.1 (L4)      | Add relation       |
| `/contacts/[id]/interactions/new`  | LocalContactOS | Governed workspace | Protected        | Usable v0.1 (L4)      | Log interaction    |

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
- `/workflowos`
- `/sales`
- `/published/recommendation`

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
4. `/local-content/*` = governed workspace (authenticated, server-action-backed, auditable). Usable v0.1 (L4). See limitations in route table above.
5. `/workflowos/*` = governed workspace (authenticated, DB-backed, auditable). WorkflowOS is the canonical product name.
6. `/sunbul/*` = redirect alias family over WorkflowOS implementation. Every route is a `permanentRedirect(302)` wrapper.
7. `/organizations/*` and `/settings` must be labeled prototype/internal preview until they have real persistence and workflow backing. SalesOS is no longer prototype-only — 27 routes with real Prisma schema, server actions, RBAC, audit trail, and evidence links now compile and build. Remaining gaps: seed data verification and browser smoke test.
8. `/api/*` sensitive endpoints (`/api/audit/evidence/*`, `/api/office-ai/download`, `/api/metrics`, `/api/decisions/*/evidence/*/download`, `/api/local-content/*/download`) must remain permissioned.
9. Do not create `/simulation` top-level routes until that system has a real workspace implementation.
10. Product marketing pages belong under `/products/*`.
11. Company and marketing pages must not imply future products are already implemented.
12. `/decisions/*` = DecisionOS active adjacent governed workspace (authenticated, DB-backed).
13. `/published/recommendation/*` is protected in current code reality because the backing action requires an authenticated user from the same organization.
14. `/executive-brief` is the canonical executive brief route. `/executive-briefing` is preserved only as a redirect alias.

15. **Download Security Standard** — Every file download API route must implement all three layers: (a) authentication at entry, (b) tenant-safe access check returning 404 on any failure (never 403 for "exists but not yours"), and (c) successful download audit trail via `writePlatformAuditLog` with `status: "success"`, `targetType`, `targetId`, `targetLabel`, `actorId`, `actorType`, `sourceSystem`. Response must use `Cache-Control: private, no-store`. Currently enforced on: `/api/audit/evidence/*/download`, `/api/office-ai/download`, `/api/workflowos/documents/*/download`, `/api/decisions/*/evidence/*/download`, `/api/local-content/*/evidence/*/download`.
