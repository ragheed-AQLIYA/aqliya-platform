# AQLIYA Product Maturity Matrix

> **Status:** Code-reconciled | **Date:** 2026-07-10 | **Method:** Route + schema + action + test evidence  
> **Supersedes:** Optimistic L6 rows in `PRODUCT_STATUS_MATRIX.md` where they conflict with this matrix

---

## How to read this matrix

| Column | Meaning |
|--------|---------|
| **Real Status** | What the code actually does today |
| **Maturity Level** | L0–L6 rubric from AGENTS.md — evidence-based, not aspirational |
| **Safe To Demo?** | Can show externally with honest framing |
| **Safe For Pilot?** | Can run controlled customer pilot |
| **Safe To Sell?** | Commercial production claim without caveats |

**Maturity rubric reminder:**
- L1 = Marketing/demo only
- L2 = Shell route, no real workflow
- L3 = Prototype with limited persistence
- L4 = Usable v0.1 — real workflow, persistence, basic governance
- L5 = Pilot-ready — evidence, review, export, audit trail, seeds
- L6 = Production-hardened — security, monitoring, backups, deployment, scale

---

## A. Product Maturity Matrix (Primary)

| System/Product | Route Family | Product Type | Real Status | Maturity Level | Safe To Demo? | Safe For Pilot? | Safe To Sell? | Notes / Evidence |
|----------------|--------------|--------------|-------------|----------------|---------------|-----------------|---------------|------------------|
| **AQLIYA Platform (core)** | `/overview`, `/operator`, `/monitoring` | Platform | Auth + Prisma operator surfaces, health APIs, 12 product metrics | **L4** | Yes (internal) | Yes (internal) | No | `src/lib/platform/enterprise-health.ts`, `/api/platform/*` — not L6 without pentest/HA |
| **AQLIYA Marketing** | `/`, `(marketing)/*`, `/en/*` | Marketing | Static bilingual copy, public capability notes | **L1** | Yes | N/A | N/A | `(marketing)/page.tsx` — no DB |
| **Platform marketing hub** | `/platform` | Marketing | Static deployment model copy | **L1** | Yes | N/A | N/A | Not operational workspace — use `/overview` |
| **AuditOS workspace** | `/audit/*` | Governed product | Full engagement workflow, Prisma, tenant guards, 8 engines | **L5** | Yes | **Yes** | No | 27 pages; `audit/page.tsx` → prisma + services; deepest product |
| **AuditOS demo** | `/auditos/*` | Guided demo | 100% mock, read-only, isolated | **L1** | **Yes** | No | No | `auditos/demo-data.ts` — no audit lib imports |
| **LocalContentOS** | `/local-content/*` | Governed product | Projects, scoring, workbook AI, review center, ERP UI | **L5** | Yes | **Yes** | No | 29 pages; 23+ test files; AI quality re-run evidence |
| **DecisionOS** | `/decisions/*` | Governed product | Full lifecycle, 15 tabs, evidence, PDF export | **L5** | Yes | **Yes** | No | 22 pages; `actions/decisions.ts`; 42+ action tests claimed |
| **SalesOS** | `/sales/*` | Governed product | Prisma CRUD, pipeline, review/approval, CRM sync UI | **L4–L5** | Yes | Yes (caution) | No | Pilot badge in layout; v02/vnext debt; 71 test files |
| **WorkflowOS** | `/workflowos/*` | Governed product | Templates, records, SLA, gated export | **L4–L5** | Yes | Yes | No | 8 pages; 31 action tests claimed; Sunbul redirects here |
| **Sunbul** | `/sunbul/*` | Redirect alias | permanentRedirect to `/workflowos/*` | N/A | No | No | No | `sunbul/page.tsx` — no UI |
| **Office AI Assistant** | `/assistant/*`, `/office-ai/*` | Shared app | Task lifecycle, review/approve, file attach | **L4–L5** | Yes | Yes | No | Split routes; 248 tests claimed; deterministic AI default |
| **LocalContactOS** | `/contacts/*` | Governed product | Registry, dashboard, review, export workflow | **L4** | Yes | Internal pilot | No | 7 pages; integration tests mock Prisma |
| **ContentStudio** | `/content-studio/*` | Governed product | Content lifecycle, versioning, evidence, PDF | **L4–L5** | Yes | Yes | No | Standalone — NOT LC subsystem; ~125 tests |
| **RiskOS** | `/risk/*` | Audit-adjacent | Dashboard, assessments, procedures, JSON export | **L4–L5** | Yes (context) | Internal | No | Not standalone marketed; 4 pages |
| **Institutional Memory** | `/institutional-memory/*` | Platform capability | Graph, events, collections, export | **L4** | Yes | Internal | No | Missing middleware — edge auth gap |
| **Knowledge Foundation** | `/knowledge-foundation/*` | Platform capability | Version/release/diff/rollback pipeline | **L5** | Yes | Yes (internal) | No | 87 tests claimed; strong governance |
| **Organizations** | `/organizations/*` | Platform surface | Prisma org CRUD, workspace dashboard | **L4–L5** | Yes | Yes | No | Doc "mock-only" is **stale** — real Prisma |
| **Settings (mixed)** | `/settings/*` | Platform admin | Sub-routes real; index page L2 shell | **L2–L4** | Partial | Internal | No | Two folder trees; SSO/MFA/retention real |
| **SSO/SAML** | `/settings/sso`, `/login` | Enterprise auth | Provider CRUD, encrypted secrets, SAML routes | **L4–L5** | Yes | Yes (setup) | No | 65 tests; operator keys required |
| **SCIM v2** | `/api/scim/v2/*` | Identity API | User provisioning, audit events | **L4–L5** | Yes | Yes (setup) | No | API key auth |
| **Intelligence workspace** | `/intelligence` | Platform | Sector intelligence UI | **L3–L4** | Internal | Internal | No | Connected to core intelligence |
| **Knowledge review** | `/knowledge-review` | Platform | Review queue for knowledge candidates | **L4** | Internal | Internal | No | Mining → review pipeline |
| **Governance hub** | `/governance-hub` | Platform | Cross-product governance UI | **L3–L4** | Internal | Internal | No | |
| **Content ingestion** | `/api/knowledge-mining/*` | Platform API | Mining API with auth | **L4** | Internal | Internal | No | |
| **Custom product funnel** | `/custom-product`, API submit | Company funnel | Form + rate-limited API | **L4** | Yes | N/A | N/A | Commercial lead capture |
| **SimulationOS** | `/products/simulation` | Marketing label | Marketing only — DecisionOS capability | **L1** | No as product | No | No | Do not show as separate product |
| **ComplianceOS** | — | Future | Not implemented | **L0** | No | No | No | |
| **LegalOS** | — | Future | Not implemented | **L0** | No | No | No | |
| **GovOS** | — | Future | Not implemented | **L0** | No | No | No | |
| **AQLIYA Studio** | — | Future | Not implemented | **L0** | No | No | No | |
| **On-Prem deployment** | — | Strategic | Not implemented | **L0** | No | No | No | |
| **Air-Gapped mode** | — | Strategic | Not implemented | **L0** | No | No | No | |
| **Local AI runtime (prod)** | Ollama path in core | Runtime | Wired but flag-gated, operator endpoint | **L3–L4** | No as prod | Pilot only | No | ADR path exists; not L6 |
| **DevOps / IaC** | `infra/terraform/` | Infrastructure | Real Terraform + deploy workflow | **L4–L5** | Internal | Internal | No | Prod tfvars compromises; deploy ungated |

---

## B. Route Truth Table (Complete Major Routes)

| Route | Owner | Route Type | Auth? | Data Source | Real / Mock / Partial / Dead | Notes |
|-------|-------|------------|-------|-------------|------------------------------|-------|
| `/` | Platform | Marketing | Public | Static | Real (marketing) | Arabic home |
| `/platform` | Platform | Marketing | Public | Static | Real (marketing) | |
| `/overview` | Platform | Governed workspace | Yes | Actions/Prisma | Real | Platform ops hub |
| `/login`, `/signup` | Platform | Auth | Public | Auth providers | Real | SSO buttons |
| `/audit` | AuditOS | Workspace dashboard | Yes | Prisma | Real | Portfolio + engagements |
| `/audit/engagements/[id]/*` | AuditOS | Workspace (17 sub-routes) | Yes + tenant | Prisma/services | Real | Full audit workflow |
| `/audit/portfolio` | AuditOS | Workspace | Yes | Prisma | Real | |
| `/audit/archived` | AuditOS | Workspace | Yes | Prisma | Real | Archive surface |
| `/audit/acceptance` | AuditOS | Workspace | Yes | Engine | Real | Client acceptance |
| `/audit/independence` | AuditOS | Workspace | Yes | Engine | Real | |
| `/audit/knowledge` | AuditOS | Workspace | Yes | Engine | Real | |
| `/audit/quality` | AuditOS | Workspace | Yes | ISQM1 engine | Real | |
| `/audit/admin/users` | AuditOS | Admin | Yes | Prisma | Real | |
| `/auditos` | AuditOS | Demo | Public | demo-data.ts | **Mock** | |
| `/auditos/trial-balance` | AuditOS | Demo | Public | demo-data.ts | **Mock** | |
| `/auditos/mapping` | AuditOS | Demo | Public | demo-data.ts | **Mock** | |
| `/auditos/statements` | AuditOS | Demo | Public | demo-data.ts | **Mock** | |
| `/auditos/evidence` | AuditOS | Demo | Public | demo-data.ts | **Mock** | |
| `/auditos/traceability` | AuditOS | Demo | Public | demo-data.ts | **Mock** | |
| `/local-content` | LCOS | Workspace | Yes | Actions | Real | Dashboard |
| `/local-content/projects/*` | LCOS | Workspace | Yes | Actions | Real | 10+ sub-routes |
| `/local-content/workbook` | LCOS | Workspace | Yes | Actions | Real | AI scoring |
| `/local-content/review-center` | LCOS | Workspace | Yes | Actions | Real | Batch review |
| `/local-content/pilot-readiness` | LCOS | Workspace | Yes | Actions | Real | 11-dimension assessment |
| `/local-content/quality-dashboard` | LCOS | Workspace | Yes | Actions | Real | AI metrics |
| `/local-content/settings/integrations` | LCOS | Admin | Yes | ERP connectors | Real | Operator creds |
| `/sales` | SalesOS | Workspace | Yes | Prisma | Real | Dashboard |
| `/sales/deals`, `/pipeline`, `/accounts` | SalesOS | Workspace | Yes | Actions/Prisma | Real | |
| `/sales/intelligence` | SalesOS | Workspace | Yes | v02 engines | Partial | v02 import debt |
| `/sales/review`, `/approval` | SalesOS | Workspace | Yes | Actions | Real | Governance |
| `/sales/settings/crm` | SalesOS | Admin | Yes | CRM sync | Real | HubSpot/SF |
| `/decisions` | DecisionOS | Workspace | Yes | Actions | Real | List + KPIs |
| `/decisions/[id]/*` | DecisionOS | Workspace (15 tabs) | Yes | Actions/engine | Real | |
| `/decisions/pilot-readiness` | DecisionOS | Workspace | Yes | Actions | Real | |
| `/workflowos` | WorkflowOS | Workspace | Yes | Actions | Real | |
| `/workflowos/templates/*` | WorkflowOS | Workspace | Yes | Actions | Real | |
| `/workflowos/records/*` | WorkflowOS | Workspace | Yes | Actions | Real | |
| `/workflowos/admin` | WorkflowOS | Admin | Yes | Actions | Real | |
| `/sunbul/*` | WorkflowOS | Redirect | Varies | N/A | Redirect | → `/workflowos/*` |
| `/assistant` | Office AI | Workspace | Yes | Prisma/actions | Real | Task list |
| `/assistant/[taskId]` | Office AI | Workspace | Yes | Prisma/actions | Real | Review flow |
| `/assistant/stats` | Office AI | Stats | Yes | Actions | Real | No dashboard layout |
| `/office-ai/advanced` | Office AI | Admin | Yes | Actions | Real | |
| `/contacts/*` | LocalContactOS | Workspace | Yes | Actions | Real | 7 pages |
| `/content-studio/*` | ContentStudio | Workspace | Yes | Actions | Real | 6 pages |
| `/risk/*` | RiskOS | Workspace | Yes | Actions | Real | 4 pages |
| `/institutional-memory/*` | Platform | Workspace | Partial edge | Actions | Real | No middleware |
| `/knowledge-foundation/*` | Platform | Workspace | Yes | KF lib | Real | |
| `/organizations/*` | Platform | Admin | Admin | Prisma | Real | |
| `/settings` | Platform | Shell | Yes | Local state | **Partial** | L2 preview shell |
| `/settings/sso`, `/mfa`, `/team` | Platform | Admin | Yes | Actions/Prisma | Real | |
| `/settings/ai-governance`, `/models` | Platform | Admin | Yes | Actions | Real | |
| `/settings/audit-logs`, `/workspaces` | Platform | Admin | Yes | Prisma | Real | |
| `/monitoring` | Platform | Operator | Admin | Health APIs | Real | |
| `/operator` | Platform | Operator | Admin | Actions | Real | |
| `/intelligence` | Platform | Workspace | Yes | Intelligence lib | Real | |
| `/governance-hub` | Platform | Workspace | Yes | Governance | Real | |
| `/notifications` | Platform | Workspace | Yes | Notification engine | Real | |
| `/sampling` | AuditOS | Workspace | Yes | Sampling engine | Real | Adjacent to audit |
| `/print/*` | Marketing | Public print | Public | Static | Real | Trust assets |
| `/products/*` | Marketing | Marketing | Public | Static | Real | Product pages |
| `/demo` | Marketing | Marketing | Public | Static | Real | Links to `/auditos` |
| `/api/health` | Platform | API | Public | Prisma ping | Real | |
| `/api/audit/*` | AuditOS | API | Yes | Actions | Real | Exports protected |
| `/api/decisions/*` | DecisionOS | API | Yes | Actions | Real | |
| `/api/local-content/*` | LCOS | API | Yes | Actions | Real | |
| `/api/sales/*` | SalesOS | API | Yes | Actions | Real | |
| `/api/workflowos/*` | WorkflowOS | API | Yes | Actions | Real | |
| `/api/office-ai/*` | Office AI | API | Yes | Actions | Real | |
| `/api/platform/*` | Platform | API | Admin | Platform services | Real | |
| `/api/ai/*` | Platform | API | Yes | AI orchestrator | Real | Flag-gated |
| `/api/scim/v2/*` | Platform | API | API key | SCIM service | Real | |
| `/api/skills/evaluate` | Platform | API | Admin | Skill runtime | Real | |
| `/audit/settings` | — | — | — | — | **Dead** | Linked in nav, no route |

---

## C. Product Capability Truth Tables

### AuditOS

| Dimension | Assessment |
|-----------|------------|
| **Purpose in practice** | Financial audit engagement workspace — TB through publication |
| **Routes** | 27 workspace + 6 demo |
| **Data model** | AuditOrganization, AuditEngagement, AuditTrialBalance, AuditFinding, AuditEvidence, AuditEvent, + 8 L6 engines (ISQM1, materiality, etc.) |
| **Actions** | ~27 audit-* action modules |
| **Governance** | Review, approval, publication package, audit trail, tenant guard, download gate |
| **AI** | AI review with human oversight; `audit.mock-ai` fallback on; intelligence flag off |
| **Verdict** | **L5 pilot-ready** |

### LocalContentOS

| Dimension | Assessment |
|-----------|------------|
| **Purpose** | Saudi local content compliance scoring and evidence |
| **Routes** | 29 pages |
| **Data model** | LocalContentProject, Supplier, Spend, Classification, LcWorkbook, LcAiReviewRun, etc. |
| **Actions** | ~15 localcontent-* modules |
| **Governance** | Multi-reviewer approval, audit events, evidence vault, export with review |
| **AI** | Workbook AI advisor, pattern suggestions, quality dashboard — governed with confidence |
| **Verdict** | **L5 pilot-ready** |

### DecisionOS

| Dimension | Assessment |
|-----------|------------|
| **Purpose** | Institutional decision governance with evidence |
| **Routes** | 22 pages |
| **Data model** | Decision, DecisionEvidence, DecisionReport, Approval, DecisionGovEvent |
| **Actions** | decisions.ts, decision-export, simulation, tender |
| **Governance** | Lifecycle states, committee workflow, PDF export gated |
| **AI** | Recommendations assistive; simulation engine |
| **Verdict** | **L5 pilot-ready** |

### SalesOS

| Dimension | Assessment |
|-----------|------------|
| **Purpose** | Governed commercial intelligence (not CRM clone) |
| **Routes** | 30 pages |
| **Data model** | SalesAccount, SalesDeal, SalesPipeline, SalesAuditEvent, etc. |
| **Actions** | sales-actions, sales-dashboard-actions |
| **Governance** | Review, approval, audit trail, tenant guards |
| **AI** | Commercial review runtime; v02 intelligence engines |
| **Verdict** | **L4–L5** — pilot with v02 debt disclosure |

### WorkflowOS

| Dimension | Assessment |
|-----------|------------|
| **Purpose** | Template-based governed workflows with SLA |
| **Routes** | 8 pages |
| **Data model** | WorkflowTemplate, WorkflowRecord, WorkflowEvidence, WorkflowAuditEvent |
| **Actions** | workflowos-actions, export, SLA |
| **Governance** | Step execution, evidence per record, export approval |
| **AI** | Minimal |
| **Verdict** | **L4–L5** |

### Office AI Assistant

| Dimension | Assessment |
|-----------|------------|
| **Purpose** | Shared governed work assistant on Core |
| **Routes** | `/assistant/*`, `/office-ai/*` |
| **Data model** | OfficeAiTask, OfficeAiOutput, OfficeAiFile |
| **Actions** | office-ai-actions, workspace-actions |
| **Governance** | Human review required; status machine; audit events |
| **AI** | Deterministic generators default; real providers behind flag |
| **Verdict** | **L4–L5** |

### WorkflowOS / Sunbul

Sunbul is **redirect alias only** — all capability lives under WorkflowOS.

### Platform operator surfaces

| Dimension | Assessment |
|-----------|------------|
| **Routes** | `/overview`, `/monitoring`, `/operator`, `/settings/*` (mixed) |
| **Verdict** | **L4** internal operations — not commercial product |

---

## D. Doc vs Matrix Reconciliation

| PRODUCT_STATUS claim | This matrix | Action |
|---------------------|-------------|--------|
| All active products L6 | L4–L5 | Update PRODUCT_STATUS rows |
| Organizations mock-only | L4–L5 real | Delete stale reality note line 95 |
| AuditOS L6 | L5 | Align ROUTE_STRATEGY + matrix |
| LocalContact 15 integration tests | L4 | Clarify tests are mocked |
| Commercial Ready | No | Keep NO-GO until blockers closed |

---

**Evidence base:** Route inspection, Prisma schema clusters, action layer grep, test file counts, middleware analysis, subagent audits 2026-07-10.

**Status:** DONE
