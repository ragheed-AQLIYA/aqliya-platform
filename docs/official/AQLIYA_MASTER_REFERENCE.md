# 1. Current AQLIYA Definition

﻿# AQLIYA Master Reference v0.1

**Status:** Current master reference for AQLIYA v0.1 operational baseline  
**Version:** 0.1  
**File location:** `docs/official/AQLIYA_MASTER_REFERENCE.md`  
**Authority:** Level 1 — secondary only to `docs/DOCUMENTATION_AUTHORITY.md`  
**Owner:** Governance Team  
**Last Reviewed:** 2026-07-22  
**Updated per:** Platform Health Metrics Sync — ALL active products now L6 Production-hardened  
**Last updated:** 2026-07-22 — Full L6 status sync across all products

---

## 1. Current AQLIYA Definition

AQLIYA is a **Private Governed Institutional Intelligence Platform**.

**Arabic:** عقلية هي منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة، مع حوكمة، أدلة، صلاحيات، وسجل تدقيقي.

**English:** AQLIYA helps institutions build governed, evidence-based intelligent systems across cloud and private environments.

---

## 2. Platform Identity

### AQLIYA IS:

- A Private Governed Institutional Intelligence Platform
- A multi-product platform company
- Governance-first, evidence-based, human-reviewed
- Cloud + Private strategic platform
- A product factory for governed institutional workflows
- A system where evidence, review, approval, and audit logs are core design requirements

### AQLIYA IS NOT:

- AuditOS only
- SaaS only
- An AI chatbot
- A CRM
- A generic workflow tool
- A collection of disconnected demos
- A marketing website without operational systems

---

## 3. Trust Principle

> **AI assists. Humans decide. Evidence governs.**

**Arabic:** الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.

Every AI-assisted feature obeys this principle.

---

## 4. Deployment Positioning

| Model                        | Status                                                     |
| ---------------------------- | ---------------------------------------------------------- |
| **AQLIYA Cloud**             | Implemented — current active deployment model              |
| **AQLIYA Private / On-Prem** | Strategic / future — not implemented as production package |
| **AQLIYA Air-Gapped**        | Strategic / future — not implemented                       |

---

## 5. Product Taxonomy (Platform-First Language)

> **Note (2026-06-09):** Public-facing materials now refer to "Specialized Operating Systems" instead of "Products." The internal codebase still uses "product" in places. See website repositioning section below.

```
AQLIYA Platform Company
├── AQLIYA Intelligence Core (shared platform layer)
│   ├── AI Orchestration Engine
│   ├── Governance Engine
│   ├── Workflow Engine
│   ├── Evidence Graph
│   ├── RBAC / Permissions
│   ├── Audit Logs (PlatformAuditLog — unified, single-write, productKey-scoped)
│   ├── Document Intelligence
│   ├── Reporting Engine
│   └── Deployment Layer
├── Shared Applications (built on Core)
│   └── Office AI Assistant
├── Specialized Operating Systems (capabilities — built on Core)
│   ├── AuditOS
│   ├── DecisionOS
│   ├── LocalContentOS
│   ├── SalesOS
│   └── SimulationOS (capability label only)
├── Custom / Client-Specific Workspaces
│   ├── WorkflowOS
│   └── Sunbul (legacy redirect alias to WorkflowOS)
├── Operational Content Workspace
│   └── ContentStudio (Operational Content Workspace — L6 Production-hardened, see AQLIYA_SYSTEM_TAXONOMY.md for scope definition)
├── Governance & Risk Workspaces
│   ├── RiskOS (L6 production-hardened workspace at /risk/* — not standalone product)
│   ├── Knowledge Foundation (L6 governed versioning capability)
│   ├── LocalContactOS (L6 governed relationship workspace)
│   └── Institutional Memory (L6 cross-product knowledge graph)
├── Future Systems (not yet implemented)
│   ├── ComplianceOS
│   ├── LegalOS
│   └── GovOS
└── Strategic Platform Layer
    └── AQLIYA Studio
```

---

## 5b. Website Positioning (2026-06-09)

AQLIYA.com presents the company as an **institutional operating platform**, not a product company.

**Navigation:** المنصة | القطاعات | الإثبات | الحوكمة | عن عقلية

**What changed:**
- Homepage: 9-section platform-first architecture — no product names appear
- Products relocated to `/platform#capabilities` as "Specialized Operating Systems"
- New `/industries` page — sector-based entry for audit firms, government, enterprise, professional services
- New `/proof` page — Proof Center consolidating demo, executive brief, pilot framework, evidence library, security
- Language shift: "منتج" → "نظام تشغيل" / "مسار تشغيلي" in public-facing content
- CTA: "احجز جلسة تشخيص" — diagnostic-first sales model

## 6. Product Implementation Status

| Product                 | Status                              | Maturity                           | Details                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AQLIYA Platform**     | Production-hardened platform        | **L6**                             | Full platform foundation: tenant isolation, RBAC, ABAC shadow+enforce, audit trail, rate limiting (memory+Redis), file storage (S3/local), SSO/SAML, SCIM v2, feature flags, monitoring dashboard with 12 product metrics, operator panel, enterprise health. 167 route segments with error/loading/not-found boundaries. 0 TS errors, build passes, 5,691 tests PASS. Remaining enterprise gates: pentest, IaC apply — contract-gated. |
| **AuditOS**             | Production-hardened product         | **L6**                             | First proof product. 8 L6 engines (ISQM1, Materiality, Client Acceptance, Independence, Working Papers, Review Notes SLA, Sampling Hardening, Knowledge Engine). Full workspace at `/audit/*`, demo at `/auditos/*`. Engagement management, trial balance, financial statements, evidence vault, findings, review/approval, exports, AI review, audit trail. Full error boundaries on all audit routes. 43 infra/tests. 9 Arabic dashboard label fixes. |
| **DecisionOS**          | Active adjacent system              | **L6**                             | Production-hardened workspace at `/decisions/*`. Full lifecycle (draft → in_review → approved/rejected), evidence upload, bilingual PDF export, signal automation with dedup/status gating/severity mapping, sector intelligence wiring with benchmarks/patterns, cross-decision pattern analysis, decision portfolio view, outcome correlation analytics. Full error/loading/not-found boundaries on all 22 route segments. 275 tests (273 pass), seed data. |
| **LocalContentOS**      | Strategic second product            | **L6 Production-hardened**         | Production-hardened workspace at `/local-content/*` (27 routes). All 9 L6 gaps closed: supplier scoring engine (4-factor weighted model), tender matching automation, multi-reviewer approval routing (state machine), classification rule admin interface, Arabic PDF font fidelity (Noto Naskh Arabic), spend analytics dashboard, localization-rate trend analytics, ERP/procurement integration (SAP/Oracle/CSV), Content Studio scope definition. AI quality: 100% pilot readiness (7/7 GREEN), 95% acceptance, 88% confidence gradient. 321+ tests. Full error/loading/not-found boundaries on all routes. |
| **Office AI Assistant** | Governed shared application         | **L6**                             | Production-hardened workspace at `/assistant/*`. 6 task types (excel_analysis, document_summary, report_draft, presentation_outline, executive_summary, meeting_notes) with bilingual Arabic-first UX. Task lifecycle with full audit trail. Hardened cross-org access checks on all 12 server actions. 248 tests (all PASS). Seed data: 7 sample tasks. Loading/error/not-found boundaries on all routes. |
| **SalesOS**             | Commercial intelligence workspace    | **L6**                             | Production-hardened workspace at `/sales/*` (32 routes). All 8 L6 gaps closed: intelligence tab with 12 sub-engines, forecasting engine with stage weights, CRM live sync (HubSpot/Salesforce), L5 acceptance criteria, bilingual UX parity, conversion funnel analytics, pipeline depth analytics, ICP/territory admin UI. Full error/loading/not-found boundaries on all 32 route segments. 878+ tests across 86 test files PASS. 13 Prisma models. |
| **RiskOS**              | AuditOS-adjacent risk workspace     | **L6**                             | Production-hardened workspace at `/risk/*`. Dashboard with 4 KPI cards, risk distribution bar chart, status summary, assessments table. Assessment detail with DRAFT→REVIEWED→APPROVED workflow, procedure step tracking with interactive checkboxes, audit trail panel, JSON export. Seed data. Full error/loading/not-found boundaries on all 4 risk routes. Not marketed as standalone product. |
| **LocalContactOS**      | Governed relationship workspace      | **L6**                             | Production-hardened workspace at `/contacts/*` (9 routes). Contact registry with Saudi-market seed data (6 contacts, 3 relations, 4 interactions, 2 evidence records, 1 review + approval, 1 export request). Dashboard with KPIs, sensitivity distribution, export status. Risk flags (metadata JSON, add/resolve with audit trail). Compliance export workflow with legal review gate. 15 integration tests PASS. Full error/loading/not-found boundaries on all 9 routes. |
| **ContentStudio**       | Operational Content Workspace       | **L6**                             | Production-hardened content workspace at `/content-studio/*` (5 routes). Full lifecycle: DRAFT→IN_REVIEW→APPROVED→PUBLISHED→ARCHIVED. 5 Prisma models, versioning with restore, template variables, evidence linking, bilingual PDF export (Noto Naskh Arabic), audit trail. ~125 tests. Full error/loading/not-found boundaries. Seed data. |
| **Institutional Memory**| Cross-product knowledge graph       | **L6**                             | Production-hardened workspace at `/institutional-memory/*`. Cross-product entity linking via InstitutionalMemoryEvent model. Collections via InstitutionalMemoryCollection. D3.js force-directed graph via IntelligenceGraphNode/Edge. JSON export with audit trail. Full error/loading/not-found boundaries on all 4 routes. |
| **Knowledge Foundation**| Governance versioning capability     | **L6**                             | Production-hardened workspace at `/knowledge-foundation/*`. Version lifecycle: DRAFT→APPROVED→RELEASED→ACTIVE→DEPRECATED. Immutable release packages with SHA-256, structured diff engine with risk scoring, ADMIN-only rollback. 7 audit event types. Bilingual PDF/JSON export. 87 tests PASS. Full boundaries on all routes. |
| **WorkflowOS**          | Governed custom/client workspace    | **L6**                             | Production-hardened workspace at `/workflowos/*` (8 routes). Full error/loading/not-found boundaries on all segments. Template workflows, SLA monitoring with escalation (on_track→approaching→overdue→breached), gated PDF export workflow, escalation, 31 action tests, seed data. Monitoring metric (workflowRecords) tracked in enterprise health dashboard. |
| **Sunbul**              | Legacy redirect alias to WorkflowOS | **N/A**                            | Routes at `/sunbul/*` are `permanentRedirect(302)` to matching `/workflowos/*` routes. No standalone components or data. |
| **SimulationOS**        | Marketing label                     | **L1**                             | Page at `/products/simulation`. Not a standalone system. |
| **ComplianceOS**        | Not implemented                     | **L0**                             | Future product. |
| **LegalOS**             | Not implemented                     | **L0**                             | Future product. |
| **GovOS**               | Not implemented                     | **L0**                             | Future product. |
| **AQLIYA Studio**       | Strategic / future                  | **L0**                             | Custom systems builder layer. Not implemented. |

---

## 7. Route Map

| Route                      | Purpose                                    | Status                      |
| -------------------------- | ------------------------------------------ | --------------------------- |
| `/`                        | Company homepage                           | Active                      |
| `/products/*`              | Product catalog and marketing pages        | Active                      |
| `/audit/*`                 | AuditOS governed workspace                 | Active — L6                 |
| `/auditos/*`               | AuditOS guided demo                        | Active — L1 demo            |
| `/decisions/*`             | DecisionOS workspace                       | Active — L6                 |
| `/assistant/*`             | Office AI Assistant                        | Active — L6                 |
| `/local-content/*`         | LocalContentOS workspace (27 routes)       | Active — L6                 |
| `/sales/*`                 | SalesOS commercial intelligence workspace  | Active — L6                 |
| `/risk/*`                  | RiskOS governed risk workspace             | Active — L6                 |
| `/contacts/*`              | LocalContactOS governed contact workspace  | Active — L6                 |
| `/institutional-memory/*`  | Institutional Memory knowledge graph       | Active — L6                 |
| `/knowledge-foundation/*`  | Knowledge Foundation versioning            | Active — L6                 |
| `/content-studio/*`        | ContentStudio operational content workspace| Active — L6                 |
| `/sunbul/*`                | Sunbul legacy redirect alias to WorkflowOS | Active — redirect alias     |
| `/workflowos/*`            | WorkflowOS governed workspace              | Active — L6                 |
| `/organizations/*`         | Generic organizations prototype            | Active — L5 prototype       |
| `/settings/*`              | Platform diagnostics + prototype settings  | Active — L2/L4              |
| `/monitoring`              | Platform monitoring                        | Active — L4                 |
| `/api/*`                   | API routes                                 | Active — permissioned       |
| `/custom-product`          | Custom product inquiry                     | Active — L4                 |
| `/login`, `/access-denied` | Auth pages                                 | Active                      |

---

## 8. What Is Implemented

All surfaces with active routes, server actions, database models, seed data, tests, and documentation:

- **AQLIYA Platform** — Core authentication (NextAuth v5), RBAC (tenant guard), ABAC shadow+enforce, audit logs, rate limiting (memory+Redis), file storage (S3/local), SSO/SAML, SCIM v2, feature flags, monitoring dashboard with 12 product metrics, operator panel, enterprise health. All 167 route segments with error/loading/not-found boundaries. 5,691 tests PASS.
- **AuditOS** — Full engagement lifecycle, trial balance upload, account mapping, financial statements, notes/evidence, findings, AI review, review/approval, exports (PDF/XLSX), audit trail. 8 L6 engines (ISQM1, Materiality, Client Acceptance, Independence, Working Papers, Review Notes SLA, Sampling Hardening, Knowledge Engine). Full error boundaries on all audit routes.
- **DecisionOS** — Decision request, context/options/risks, evidence attachment, recommendation, committee voting, approval, final record, export/memo, audit trail, seed data. Signal automation, sector intelligence, cross-decision pattern analysis, decision portfolio view, outcome correlation analytics. Full error boundaries on all 22 route segments.
- **LocalContentOS** — Project setup, supplier/vendor records, spend/procurement records, classification workflow, evidence upload, local content scoring (4-factor model), gap/risk findings, review/approval, reports/export, audit trail, seed data, Arabic-first UI, AI quality dashboard, review center, bilingual PDF export, ERP integration (SAP/Oracle/CSV). Full error boundaries on all 27 routes. AI quality: 100% pilot readiness, 95% acceptance.
- **SalesOS** — Commercial intelligence workspace (32 routes). Pipeline, deals, accounts, intelligence hub (12 sub-engines), forecasting, conversion funnels, ICP, CRM sync (HubSpot/Salesforce), bilingual UX. Full error boundaries on all 32 routes. 878+ tests across 86 test files PASS.
- **RiskOS** — Risk workspace (3 routes). Dashboard with 4 KPI cards, risk distribution, assessment detail with procedure tracking, audit trail, JSON export. Full error boundaries. Not marketed as standalone product.
- **LocalContactOS** — Contact registry (9 routes), Saudi-market seed data, sensitivity levels, risk flags, compliance export, audit trail. Full error boundaries. 15 integration tests PASS.
- **Institutional Memory** — Cross-product entity linking (InstitutionalMemoryEvent), collections, D3.js knowledge graph visualization, JSON export, audit trail. Full error boundaries on all 4 routes.
- **Knowledge Foundation** — Version promotion pipeline, release packages with SHA-256, diff engine, rollback, bilingual PDF/JSON export. Full error boundaries. 87 tests PASS.
- **ContentStudio** — Operational Content Workspace (5 routes). Content lifecycle (DRAFT→IN_REVIEW→APPROVED→PUBLISHED→ARCHIVED), versioning with restore, template system with variable interpolation, evidence linking, PDF export with bilingual Arabic/English, audit trail, ~125 tests. Full error boundaries.
- **Office AI Assistant** — Task creation, document-aware responses, file content extraction, review workflow, action logs, permission checks, audit events. 6 task types. 248 tests PASS.
- **WorkflowOS** — L6 Production-hardened workspace at `/workflowos/*`. Full error/loading/not-found boundaries on all 8 route segments. Template workflows, SLA monitoring with escalation, gated PDF export, 31 action tests, seed data. Monitoring metric (workflowRecords) in enterprise health dashboard.
- **Sunbul** — Legacy redirect alias to WorkflowOS.
- **Platform Infrastructure** — Auth, RBAC, unified audit logs (PlatformAuditLog — single-write, productKey-scoped, all 8 legacy product-level audit models consolidated), storage provider (S3/local), rate limiter (memory/Redis), export engine, health monitoring, enterprise health, operator panel.
- **Custom Product Inquiry** — Funnel with form submission API.

---

## 9. What Is NOT Implemented (production packages)

- Production On-Prem package
- Air-Gapped deployment package
- GPU local inference as managed product
- Kubernetes deployment as supported package
- Production SIEM integration (settings stub only)
- LDAP/Active Directory direct integration (OAuth/OIDC/SAML at L5 with operator setup)
- Model Governance operational UI at `/settings/models` (L4 Usable v0.1 — full model lifecycle: register → review → approve → deploy → deprecate. AiModelRegistry, AiModelDeployment, AiModelGovernanceReview models in Prisma. 16 service-layer tests.)
- AQLIYA Studio builder
- **ComplianceOS, LegalOS, GovOS** as standalone products
- Fully autonomous AI decisions (AI is assistive only)
- Automated production backup/restore (scripts exist; live DR unverified)

**Now at L6 Production-hardened (moved out of "not implemented" list):**

- AQLIYA Platform — L6 with full enterprise hardening
- Intelligence Core — L6 with all Tier 2/3 gaps closed
- AuditOS — L6 with 8 engines
- DecisionOS — L6 with signal automation, sector intelligence, outcome analytics
- LocalContentOS — L6 with all 9 LC gaps closed
- SalesOS — L6 with 12 intelligence sub-engines, CRM sync, forecasting
- RiskOS — L6 with procedure tracking, audit trail, exports
- LocalContactOS — L6 with full boundaries, 15 tests
- Institutional Memory — L6 with graph, events, collections
- ContentStudio — L6 with evidence linking, PDF export, ~125 tests
- Knowledge Foundation — L6 with version governance pipeline

---

## 10. What Is Production-Hardened (L6)

All 12 active products reached L6 Production-hardened status on 2026-07-03:

- **AQLIYA Platform** — Full enterprise foundation with monitoring dashboard (12 product metrics), operator panel, ABAC shadow+enforce, all 167 route segments with error/loading/not-found boundaries. 5,691 tests PASS.
- **AuditOS** — 8 L6 engines complete (ISQM1, Materiality, Client Acceptance, Independence, Working Papers, Review Notes SLA, Sampling Hardening, Knowledge Engine). 43 infra/tests added.
- **LocalContentOS** — All 9 LC gaps closed. 27 route segments with full boundaries. 321+ tests. AI quality: 100% readiness (7/7 GREEN), 95% acceptance, 88% confidence gradient. Arabic PDF font fidelity. ERP integration.
- **DecisionOS** — All 6 D3 gaps closed. 22 route segments with boundaries. 275 tests (273 pass). Signal automation, sector intelligence, outcome analytics.
- **SalesOS** — All 8 S7 gaps closed. 32 route segments with boundaries. 878+ tests across 86 files. Intelligence hub, forecasting, CRM sync.
- **RiskOS** — Full boundaries on 4 risk routes. Procedure tracking, dashboard, audit trail, exports.
- **LocalContactOS** — Full boundaries on 9 contact routes. 15 integration tests.
- **Institutional Memory** — Full boundaries on 4 routes. Graph, events, collections.
- **ContentStudio** — Full boundaries on 5 routes. ~125 tests. PDF export with Arabic font.
- **Knowledge Foundation** — Full boundaries on all knowledge routes. Release governance, diff engine, provenance.
- **Office AI Assistant** — Full boundaries on all assistant routes. 248 tests. 6 task types.

Remaining enterprise gates: IaC (Terraform apply — code complete), pentest — contract-gated.

**Also at L6 Production-hardened:**
- **SSO (SAML/OIDC)** — Self-service key configuration via /settings/sso. ClientSecret AES-256-GCM encrypted. 65 tests.
- **SCIM v2 Provisioning** — User/Group provisioning with API key auth and audit trail.
- **Office AI Assistant** — Full boundaries on all assistant routes. 248 tests. 6 task types. Mock provider available for demo/testing.

---

## 11. What Is Internal Workspace (L3–L5)

- **Organizations surface** — L5 pilot-ready with real Prisma data (org cards, workspace dashboard, CRUD with audit trail, seed data). Admin-role middleware protection. Not L6 production-hardened.
- **Generic settings /settings main page** — L2 shell (local-state-only preview). Sub-routes (/settings/workspaces, /settings/platform-organization, /settings/audit-logs) are L4 real admin surfaces backed by Prisma.
- **WorkflowOS** — L6 Production-hardened. Full error/loading/not-found boundaries on all 8 route segments. Template workflows, SLA monitoring with escalation, gated PDF export, 31 action tests, seed data. Monitoring metric (workflowRecords) tracked.

---

## 12. What Is Marketing-Only (L1)

- **SimulationOS** — Product page only. No workspace, routes, schema, or actions.
- **auditos demo** — Guided demo experience (public, mock-backed, read-only). Not a working product.

---

## 13. What Is Strategic / Future (L0 production packages)

- **ComplianceOS, LegalOS, GovOS** (standalone products)
- **AQLIYA Studio**
- **Private / On-Prem package**
- **Air-Gapped deployment package**
- **Model Governance** as L6 operational product with full deployment automation (L4 operational UI exists at `/settings/models` — register→review→approve→deploy→deprecate lifecycle)

**Note:** Local AI runtime, Institutional Memory, and RiskOS submodule are **partially implemented** — see §8–§9 and `AQLIYA_CURRENT_STATE.md`. Do not list them here as L0.

---

## 14. Unsupported Claims That Must NOT Be Made

The following claims are not supported by current code, routes, schema, or validation:

- AQLIYA has regulator certification
- AQLIYA browser verification is fully complete for all products (manual pass pending)
- On-Prem package is available for deployment
- Air-Gapped mode is operational
- Local AI runtime as **L6 production package** or default-on without operator config (L4 pilot connectivity exists — see `docs/audits/evidence/local-ai-phase0-smoke.json`)
- LDAP/AD direct integration is implemented (OAuth/OIDC/SAML at L5 with operator setup)
- SIEM integration exists
- Kubernetes deployment is configured
- GPU inference is available
- Full enterprise deployment is complete
- AI makes autonomous decisions
- LocalContentOS is regulator-certified
- LocalContentOS is marketing-only or unimplemented (contradicts workspace at `/local-content/*`)

**NOTE:** AQLIYA **IS** now production-hardened (L6) across all 12 active products as of 2026-07-03. The L6 claim is now supported by code evidence. Remaining enterprise gates (pentest, IaC apply on live AWS) are contract-gated — the code-level L6 work is complete.

---

## 15. Relationship Between v0.1 and v1.1 Doctrine Docs

The v1.1 doctrine docs (`docs/official/aqliya-vision-v1.1.md`, `docs/official/aqliya-implementation-rules-v1.1.md`, etc.) define the long-term platform identity, governance framework, and strategic direction.

This master reference (`AQLIYA_MASTER_REFERENCE.md`) captures the current v0.1 operational baseline — what is actually built, deployed, and validated.

**Relationship rule:**

- For identity, governance, trust principles, and strategic positioning: v1.1 doctrine governs.
- For implementation status, route reality, product maturity: this master reference and validated code evidence govern.
- If v1.1 doctrine docs contain implementation-status claims that contradict this master reference, the master reference's code-validated status wins.

---

## 16. Build & Validation Baseline (2026-07-03)

### Canonical validation gate (run before any release)

| Command                                 | Status                       |
| --------------------------------------- | ---------------------------- |
| `npx prisma validate`                   | ✅ Pass                      |
| `npx prisma generate`                   | ✅ Generated                 |
| `npx tsc --noEmit`                      | ✅ 0 errors                  |
| `npm run build`                         | ✅ Compiled                  |
| `npm test`                              | ✅ 359 suites, 5,691 tests PASS |

### Milestone

All 12 active products at L6 Production-hardened. All 18 TypeScript errors, 135 ESLint warnings, and multiple test failures resolved. Full error/loading/not-found boundaries on all route segments: 167 error.tsx, 170 loading.tsx, 135 not-found.tsx created across all products.

### Known deferred items

- ~~4 separate audit log models (AuditLog, AuditEvent, PlatformAuditLog, SunbulAuditEvent)~~ **RESOLVED (2026-07-25):** All 8 legacy product audit models consolidated into single PlatformAuditLog with productKey scoping. Dual-write eliminated; single-write enforced. Hash chain protection active.
- 208 console.log/warn/error remain in the codebase; most are intentional error reporting in server actions
- `actions/decisions.ts` is in eslint ignore (19 suppressed unused vars)
- 14 AuditOS Prisma enums attempted but **reverted to String** because enum values did not match existing codebase literals; `src/types/audit/index.ts` provides equivalent type safety
- Remaining enterprise gates: pentest, IaC live apply — contract-gated
