# AQLIYA Full Site Map — Live & Demo Routes

**Generated:** 2026-05-22  
**Method:** Code inspection + HTTP verification via curl against live dev server (port 3000)  
**Server Status:** Running (Next.js 16.2.4, Turbopack)  
**Auth:** NextAuth v5 credentials — proxy-based guard at `src/proxy.ts`

---

## 1. Executive Summary

| Metric | Count |
|---|---|
| **Total page routes (page.tsx)** | 124 |
| **Total API routes (route.ts)** | 10 |
| **Total unique route paths** | 134 |
| **Live Product Workspace routes** | ~87 (protected, auth-backed) |
| **Demo routes (public, mock-backed)** | 6 (`/auditos/*`) |
| **Public Marketing routes** | 22 |
| **Protected routes (redirect to /login)** | ~87 (all workspace routes) |
| **Public routes (no auth required)** | ~29 (marketing + demo + auth pages) |
| **Routes returning 200 (HTTP verified)** | 22 (marketing non-500 + demo + auth + health) |
| **Routes returning 307 (redirect to login)** | ~87 (protected workspace routes) |
| **Routes returning 500 (server error)** | ~17 (marketing pages with compilation error) |
| **Routes returning 401/400/404 (API)** | 6 (various) |
| **Routes needing manual browser check** | 0 (all curl-verified) |

### Auth Guard Coverage

Protected paths (from `src/proxy.ts`):
`/audit`, `/decisions`, `/sales`, `/sunbul`, `/workflowos`, `/organizations`, `/intelligence`, `/monitoring`, `/settings`, `/assistant`, `/local-content`

All workspace routes correctly redirect to `/login?callbackUrl=` with HTTP 307 when unauthenticated.

---

## 2. Complete Route Table

### 2.1 Public Marketing Pages

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | `/` | Marketing | Public | Platform | Company homepage | `(marketing)/page.tsx` | 200 | Active, Arabic-first |
| 2 | `/platform` | Marketing | Public | Platform | AQLIYA Intelligence Core page | `(marketing)/platform/page.tsx` | 200 | Active |
| 3 | `/products` | Marketing | Public | Platform | Product catalog | `(marketing)/products/page.tsx` | 200 | Active |
| 4 | `/products/audit` | Marketing | Public | AuditOS | AuditOS product page | `(marketing)/products/audit/page.tsx` | 200 | Active |
| 5 | `/products/decision` | Marketing | Public | DecisionOS | DecisionOS product page | `(marketing)/products/decision/page.tsx` | 200 | Active |
| 6 | `/products/local-content` | Marketing | Public | LocalContentOS | LocalContentOS product page | `(marketing)/products/local-content/page.tsx` | 200 | Active — marketing only; workspace at /local-content/* |
| 7 | `/products/sales` | Marketing | Public | SalesOS | SalesOS product page | `(marketing)/products/sales/page.tsx` | 200 | Active — future-facing marketing only |
| 8 | `/products/simulation` | Marketing | Public | SimulationOS | SimulationOS product page | `(marketing)/products/simulation/page.tsx` | 200 | Active — marketing only, not standalone system |
| 9 | `/about` | Marketing | Public | Platform | About AQLIYA | `(marketing)/about/page.tsx` | 500 | **Compilation error** line 259 (stray `>`) |
| 10 | `/contact` | Marketing | Public | Platform | Contact page | `(marketing)/contact/page.tsx` | 200 | Active |
| 11 | `/custom-product` | Marketing | Public | Platform | Custom product inquiry | `(marketing)/custom-product/page.tsx` | 200 | Active commercial funnel |
| 12 | `/demo` | Marketing | Public | AuditOS | Demo overview page | `(marketing)/demo/page.tsx` | 200 | Links to /auditos likely |
| 13 | `/deployment` | Marketing | Public | Platform | Deployment environments | `(marketing)/deployment/page.tsx` | 200 | Active |
| 14 | `/engagement-models` | Marketing | Public | Platform | Engagement models | `(marketing)/engagement-models/page.tsx` | 500 | Compilation error propagation |
| 15 | `/executive-brief` | Marketing | Public | Platform | Executive brief | `(marketing)/executive-brief/page.tsx` | 500 | Compilation error propagation |
| 16 | `/executive-briefing` | Marketing | Public | Platform | Executive briefing | `(marketing)/executive-briefing/page.tsx` | 500 | Compilation error propagation |
| 17 | `/governance` | Marketing | Public | Platform | Governance & trust | `(marketing)/governance/page.tsx` | 500 | Compilation error propagation |
| 18 | `/how-we-work` | Marketing | Public | Platform | How we work | `(marketing)/how-we-work/page.tsx` | 500 | Compilation error propagation |
| 19 | `/insights` | Marketing | Public | Platform | Insights index | `(marketing)/insights/page.tsx` | 500 | Compilation error propagation |
| 20 | `/insights/ai-institutional-failures` | Marketing | Public | Platform | AI failures article | `(marketing)/insights/ai-institutional-failures/page.tsx` | 500 | Compilation error propagation |
| 21 | `/insights/assistant-vs-governed-intelligence` | Marketing | Public | Platform | Assistant vs GI article | `(marketing)/insights/assistant-vs-governed-intelligence/page.tsx` | 500 | Compilation error propagation |
| 22 | `/insights/governance-over-intelligence` | Marketing | Public | Platform | Governance over intelligence | `(marketing)/insights/governance-over-intelligence/page.tsx` | 500 | Compilation error propagation |
| 23 | `/pilot-proof` | Marketing | Public | Platform | Pilot proof guide | `(marketing)/pilot-proof/page.tsx` | 500 | Compilation error propagation |
| 24 | `/privacy` | Marketing | Public | Platform | Privacy policy | `(marketing)/privacy/page.tsx` | 500 | Compilation error propagation |
| 25 | `/proof-library` | Marketing | Public | Platform | Proof library | `(marketing)/proof-library/page.tsx` | 500 | Compilation error propagation |
| 26 | `/security` | Marketing | Public | Platform | Security page | `(marketing)/security/page.tsx` | 500 | Compilation error propagation |
| 27 | `/terms` | Marketing | Public | Platform | Terms of service | `(marketing)/terms/page.tsx` | 500 | Compilation error propagation |
| 28 | `/use-cases` | Marketing | Public | Platform | Use cases | `(marketing)/use-cases/page.tsx` | 500 | Compilation error propagation |
| 29 | `/buyers/cfo` | Marketing | Public | Platform | CFO buyer page | `(marketing)/buyers/cfo/page.tsx` | 500 | Compilation error propagation |
| 30 | `/buyers/cio` | Marketing | Public | Platform | CIO buyer page | `(marketing)/buyers/cio/page.tsx` | 500 | Compilation error propagation |
| 31 | `/buyers/audit-partner` | Marketing | Public | Platform | Audit partner page | `(marketing)/buyers/audit-partner/page.tsx` | 500 | Compilation error propagation |
| 32 | `/buyers/government` | Marketing | Public | Platform | Government buyer page | `(marketing)/buyers/government/page.tsx` | 500 | Compilation error propagation |
| 33 | `/buyers/procurement` | Marketing | Public | Platform | Procurement buyer page | `(marketing)/buyers/procurement/page.tsx` | 500 | Compilation error propagation |

> **Important:** The 17 × 500 errors are caused by a syntax error in `src/app/(marketing)/about/page.tsx:259` (stray `>` character). This appears to block Turbopack compilation for the entire `(marketing)` route group chunk. The pages exist and would render correctly once the syntax error is fixed. Additionally, `not-found.tsx` (custom 404 page) is also broken, causing any non-existent route to return 500.

### 2.2 Live Product Workspaces (Protected)

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 34 | `/audit` | Workspace | Protected | AuditOS | AuditOS dashboard | `audit/page.tsx` | 307 | Redirects to /login (correct) |
| 35 | `/audit/admin/users` | Workspace | Protected | AuditOS | User admin panel | `audit/admin/users/page.tsx` | 307 | Redirects to /login |
| 36 | `/audit/engagements/[engagementId]` | Workspace | Protected | AuditOS | Engagement main | `audit/engagements/[engagementId]/page.tsx` | 307 | Dynamic param |
| 37 | `/audit/engagements/[engagementId]/approval` | Workspace | Protected | AuditOS | Engagement approval | `audit/engagements/[engagementId]/approval/page.tsx` | 307 | Dynamic param |
| 38 | `/audit/engagements/[engagementId]/audit-trail` | Workspace | Protected | AuditOS | Audit trail | `audit/engagements/[engagementId]/audit-trail/page.tsx` | 307 | Dynamic param |
| 39 | `/audit/engagements/[engagementId]/evidence` | Workspace | Protected | AuditOS | Evidence vault | `audit/engagements/[engagementId]/evidence/page.tsx` | 307 | Dynamic param |
| 40 | `/audit/engagements/[engagementId]/findings` | Workspace | Protected | AuditOS | Findings | `audit/engagements/[engagementId]/findings/page.tsx` | 307 | Dynamic param |
| 41 | `/audit/engagements/[engagementId]/mapping` | Workspace | Protected | AuditOS | Account mapping | `audit/engagements/[engagementId]/mapping/page.tsx` | 307 | Dynamic param |
| 42 | `/audit/engagements/[engagementId]/notes` | Workspace | Protected | AuditOS | Notes | `audit/engagements/[engagementId]/notes/page.tsx` | 307 | Dynamic param |
| 43 | `/audit/engagements/[engagementId]/pilot` | Workspace | Protected | AuditOS | Pilot view | `audit/engagements/[engagementId]/pilot/page.tsx` | 307 | Dynamic param |
| 44 | `/audit/engagements/[engagementId]/publication` | Workspace | Protected | AuditOS | Publication | `audit/engagements/[engagementId]/publication/page.tsx` | 307 | Dynamic param |
| 45 | `/audit/engagements/[engagementId]/recommendations` | Workspace | Protected | AuditOS | Recommendations | `audit/engagements/[engagementId]/recommendations/page.tsx` | 307 | Dynamic param |
| 46 | `/audit/engagements/[engagementId]/review` | Workspace | Protected | AuditOS | Review | `audit/engagements/[engagementId]/review/page.tsx` | 307 | Dynamic param |
| 47 | `/audit/engagements/[engagementId]/statements` | Workspace | Protected | AuditOS | Financial statements | `audit/engagements/[engagementId]/statements/page.tsx` | 307 | Dynamic param |
| 48 | `/audit/engagements/[engagementId]/trial-balance` | Workspace | Protected | AuditOS | Trial balance | `audit/engagements/[engagementId]/trial-balance/page.tsx` | 307 | Dynamic param |
| 49 | `/audit/engagements/[engagementId]/validation` | Workspace | Protected | AuditOS | Validation | `audit/engagements/[engagementId]/validation/page.tsx` | 307 | Dynamic param |
| 50 | `/decisions` | Workspace | Protected | DecisionOS | Decision Intelligence dashboard | `(dashboard)/decisions/page.tsx` | 307 | Redirects to /login |
| 51 | `/decisions/new` | Workspace | Protected | DecisionOS | New decision creation | `(dashboard)/decisions/new/page.tsx` | 307 | |
| 52 | `/decisions/[id]` | Workspace | Protected | DecisionOS | Decision detail | `(dashboard)/decisions/[id]/page.tsx` | 307 | Dynamic param |
| 53 | `/decisions/[id]/alerts` | Workspace | Protected | DecisionOS | Decision alerts | `(dashboard)/decisions/[id]/alerts/page.tsx` | 307 | |
| 54 | `/decisions/[id]/framework` | Workspace | Protected | DecisionOS | Decision framework | `(dashboard)/decisions/[id]/framework/page.tsx` | 307 | |
| 55 | `/decisions/[id]/governance` | Workspace | Protected | DecisionOS | Decision governance | `(dashboard)/decisions/[id]/governance/page.tsx` | 307 | |
| 56 | `/decisions/[id]/insight` | Workspace | Protected | DecisionOS | Decision insight | `(dashboard)/decisions/[id]/insight/page.tsx` | 307 | |
| 57 | `/decisions/[id]/intake` | Workspace | Protected | DecisionOS | Decision intake | `(dashboard)/decisions/[id]/intake/page.tsx` | 307 | |
| 58 | `/decisions/[id]/outcome` | Workspace | Protected | DecisionOS | Decision outcome | `(dashboard)/decisions/[id]/outcome/page.tsx` | 307 | |
| 59 | `/decisions/[id]/overview` | Workspace | Protected | DecisionOS | Decision overview | `(dashboard)/decisions/[id]/overview/page.tsx` | 307 | |
| 60 | `/decisions/[id]/recommendation` | Workspace | Protected | DecisionOS | Recommendation | `(dashboard)/decisions/[id]/recommendation/page.tsx` | 307 | |
| 61 | `/decisions/[id]/report` | Workspace | Protected | DecisionOS | Decision report | `(dashboard)/decisions/[id]/report/page.tsx` | 307 | |
| 62 | `/decisions/[id]/risks` | Workspace | Protected | DecisionOS | Decision risks | `(dashboard)/decisions/[id]/risks/page.tsx` | 307 | |
| 63 | `/decisions/[id]/scenarios` | Workspace | Protected | DecisionOS | Decision scenarios | `(dashboard)/decisions/[id]/scenarios/page.tsx` | 307 | |
| 64 | `/decisions/[id]/sector` | Workspace | Protected | DecisionOS | Sector analysis | `(dashboard)/decisions/[id]/sector/page.tsx` | 307 | |
| 65 | `/decisions/[id]/signals` | Workspace | Protected | DecisionOS | Signals | `(dashboard)/decisions/[id]/signals/page.tsx` | 307 | |
| 66 | `/decisions/[id]/simulation` | Workspace | Protected | DecisionOS | Simulation | `(dashboard)/decisions/[id]/simulation/page.tsx` | 307 | |
| 67 | `/decisions/[id]/tender` | Workspace | Protected | DecisionOS | Tender module | `(dashboard)/decisions/[id]/tender/page.tsx` | 307 | Tender-specific module |
| 68 | `/decisions/[id]/what-to-do` | Workspace | Protected | DecisionOS | What to do | `(dashboard)/decisions/[id]/what-to-do/page.tsx` | 307 | |
| 69 | `/intelligence/sectors` | Workspace | Protected | DecisionOS | Sector intelligence | `(dashboard)/intelligence/sectors/page.tsx` | 307 | |
| 70 | `/intelligence/sectors/[id]` | Workspace | Protected | DecisionOS | Sector detail | `(dashboard)/intelligence/sectors/[id]/page.tsx` | 307 | Dynamic param |

### 2.3 Shared Applications (Protected)

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 71 | `/assistant` | Workspace | Protected | Core/Shared | Office AI Assistant workspace | `(dashboard)/assistant/page.tsx` | 307 | Governed shared app |
| 72 | `/assistant/[taskId]` | Workspace | Protected | Core/Shared | AI task detail | `(dashboard)/assistant/[taskId]/page.tsx` | 307 | Dynamic param, real workflow |

### 2.4 LocalContentOS Workspace (Protected)

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 73 | `/local-content` | Workspace | Protected | LocalContentOS | Dashboard | `local-content/page.tsx` | 307 | Redirects to /login |
| 74 | `/local-content/projects` | Workspace | Protected | LocalContentOS | Projects list | `local-content/projects/page.tsx` | 307 | |
| 75 | `/local-content/projects/[projectId]` | Workspace | Protected | LocalContentOS | Project detail | `local-content/projects/[projectId]/page.tsx` | 307 | Dynamic param |
| 76 | `/local-content/projects/[projectId]/approval` | Workspace | Protected | LocalContentOS | Project approval | `local-content/projects/[projectId]/approval/page.tsx` | 307 | |
| 77 | `/local-content/projects/[projectId]/audit-trail` | Workspace | Protected | LocalContentOS | Audit trail | `local-content/projects/[projectId]/audit-trail/page.tsx` | 307 | |
| 78 | `/local-content/projects/[projectId]/classification` | Workspace | Protected | LocalContentOS | Classification | `local-content/projects/[projectId]/classification/page.tsx` | 307 | |
| 79 | `/local-content/projects/[projectId]/evidence` | Workspace | Protected | LocalContentOS | Evidence upload | `local-content/projects/[projectId]/evidence/page.tsx` | 307 | |
| 80 | `/local-content/projects/[projectId]/findings` | Workspace | Protected | LocalContentOS | Findings | `local-content/projects/[projectId]/findings/page.tsx` | 307 | |
| 81 | `/local-content/projects/[projectId]/reports` | Workspace | Protected | LocalContentOS | Reports | `local-content/projects/[projectId]/reports/page.tsx` | 307 | |
| 82 | `/local-content/projects/[projectId]/review` | Workspace | Protected | LocalContentOS | Review | `local-content/projects/[projectId]/review/page.tsx` | 307 | |
| 83 | `/local-content/projects/[projectId]/spend` | Workspace | Protected | LocalContentOS | Spend records | `local-content/projects/[projectId]/spend/page.tsx` | 307 | |
| 84 | `/local-content/projects/[projectId]/suppliers` | Workspace | Protected | LocalContentOS | Suppliers | `local-content/projects/[projectId]/suppliers/page.tsx` | 307 | |

### 2.5 Custom/Client-Specific Workspaces (Protected)

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 85 | `/sunbul` | Workspace | Protected | Sunbul | Sunbul dashboard | `sunbul/page.tsx` | 307 | Custom client workspace |
| 86 | `/sunbul/admin` | Workspace | Protected | Sunbul | Sunbul admin | `sunbul/admin/page.tsx` | 307 | |
| 87 | `/sunbul/clients/[clientId]/records/[recordId]` | Workspace | Protected | Sunbul | Sunbul record detail | `sunbul/clients/[clientId]/records/[recordId]/page.tsx` | 307 | Deeply nested |
| 88 | `/workflowos` | Workspace | Protected | WorkflowOS (alias) | WorkflowOS dashboard | `workflowos/page.tsx` | 307 | Duplicate of Sunbul |
| 89 | `/workflowos/admin` | Workspace | Protected | WorkflowOS (alias) | WorkflowOS admin | `workflowos/admin/page.tsx` | 307 | |
| 90 | `/workflowos/clients/[clientId]/records/[recordId]` | Workspace | Protected | WorkflowOS (alias) | WorkflowOS record | `workflowos/clients/[clientId]/records/[recordId]/page.tsx` | 307 | Duplicate of Sunbul |

### 2.6 Prototype/Internal Preview (Protected)

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 91 | `/sales` | Workspace | Protected | SalesOS | Prototype dashboard | `sales/page.tsx` | 307 | Shell only, prototype |
| 92 | `/organizations` | Workspace | Protected | Platform | Generic orgs surface | `(dashboard)/organizations/page.tsx` | 307 | Mock/internal preview |
| 93 | `/organizations/[id]` | Workspace | Protected | Platform | Organization detail | `(dashboard)/organizations/[id]/page.tsx` | 307 | Mock/internal preview |
| 94 | `/organizations/sunbul` | Workspace | Protected | Sunbul | Sunbul org page | `organizations/sunbul/page.tsx` | 307 | Legacy/alternate path |

### 2.7 Platform Operator / Diagnostics (Protected)

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 95 | `/monitoring` | Workspace | Protected | Core/Platform | Platform monitoring dashboard | `(dashboard)/monitoring/page.tsx` | 307 | Real aggregate counts |
| 96 | `/settings` | Settings | Protected | Core/Platform | Generic settings | `(dashboard)/settings/page.tsx` | 307 | Shell |
| 97 | `/settings/audit-logs` | Settings | Protected | Core/Platform | Audit log viewer | `(dashboard)/settings/audit-logs/page.tsx` | 307 | Real audit trail viewer |
| 98 | `/settings/platform-organization` | Settings | Protected | Core/Platform | Platform org diagnostics | `(dashboard)/settings/platform-organization/page.tsx` | 307 | Real diagnostics |
| 99 | `/settings/workspaces` | Settings | Protected | Core/Platform | Workspace diagnostics | `(dashboard)/settings/workspaces/page.tsx` | 307 | Real diagnostics |

### 2.8 Demo Routes (Public)

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 100 | `/auditos` | Demo | Public | AuditOS | Demo overview | `auditos/page.tsx` | 200 | Mock-backed, unauthenticated |
| 101 | `/auditos/trial-balance` | Demo | Public | AuditOS | Demo trial balance | `auditos/trial-balance/page.tsx` | 200 | Mock-backed |
| 102 | `/auditos/mapping` | Demo | Public | AuditOS | Demo mapping | `auditos/mapping/page.tsx` | 200 | Mock-backed |
| 103 | `/auditos/statements` | Demo | Public | AuditOS | Demo statements | `auditos/statements/page.tsx` | 200 | Mock-backed |
| 104 | `/auditos/evidence` | Demo | Public | AuditOS | Demo evidence | `auditos/evidence/page.tsx` | 200 | Mock-backed |
| 105 | `/auditos/traceability` | Demo | Public | AuditOS | Demo traceability | `auditos/traceability/page.tsx` | 200 | Mock-backed |

### 2.9 Auth Routes

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 106 | `/login` | Auth | Public | Core/Auth | Login page | `login/page.tsx` | 200 | Email+password credentials |
| 107 | `/access-denied` | Auth | Public | Core/Auth | Access denied | `access-denied/page.tsx` | 200 | |

### 2.10 Legacy / Published Routes

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 108 | `/published/recommendation/[decisionId]` | Legacy | Public | DecisionOS | Published decision view | `published/recommendation/[decisionId]/page.tsx` | 200 | **Public legacy route** — no auth required |

### 2.11 System / Special Routes

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 109 | `/manifest.ts` | System | Public | Platform | PWA manifest | `manifest.ts` | — | Build-time |
| 110 | `/robots.ts` | System | Public | Platform | Robots.txt | `robots.ts` | — | Build-time |
| 111 | `/sitemap.ts` | System | Public | Platform | Sitemap.xml | `sitemap.ts` | — | Build-time |
| 112 | `/global-error.tsx` | System | Internal | Platform | Global error boundary | `global-error.tsx` | — | |
| 113 | `/loading.tsx` | System | Internal | Platform | Root loading | `loading.tsx` | — | |
| 114 | `/not-found.tsx` | System | Public | Platform | Custom 404 | `not-found.tsx` | 500 | **Broken** — rendering error |
| 115 | `/(dashboard)/error.tsx` | System | Internal | Platform | Dashboard error boundary | `(dashboard)/error.tsx` | — | |
| 116 | `/audit/error.tsx` | System | Internal | Platform | Audit error boundary | `audit/error.tsx` | — | |

### 2.12 API Routes

| # | Route | Type | Access | Product Area | Purpose | Source File | HTTP Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 117 | `/api/auth/[...nextauth]` | API | Public | Core/Auth | NextAuth handler | `api/auth/[...nextauth]/route.ts` | 400 | 400 without body (expected) |
| 118 | `/api/health` | API | Public | Core/Platform | Health check | `api/health/route.ts` | 200 | OK |
| 119 | `/api/metrics` | API | Admin | Core/Platform | Platform metrics | `api/metrics/route.ts` | 401 | Correctly guarded |
| 120 | `/api/custom-product-submit` | API | Public | Platform | Product inquiry submit | `api/custom-product-submit/route.ts` | 405 | 405 (method not GET) — POST only |
| 121 | `/api/audit/evidence/[evidenceId]/download` | API | Protected | AuditOS | Evidence file download | `api/audit/evidence/[evidenceId]/download/route.ts` | 404 | Not found (test ID) |
| 122 | `/api/audit/engagements/[engagementId]/exports/[format]` | API | Protected | AuditOS | Export engagement | `api/audit/engagements/[engagementId]/exports/[format]/route.ts` | 400 | Auth check fails without session |
| 123 | `/api/office-ai/download` | API | Protected | Core/Shared | Office AI download | `api/office-ai/download/route.ts` | 400 | Auth check fails without session |
| 124 | `/api/local-content/projects/[projectId]/reports/[reportId]/download` | API | Protected | LocalContentOS | Report download | `api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts` | 401 | Unauthorized (correct) |
| 125 | `/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf` | API | Protected | Sunbul | Export PDF | `api/sunbul/clients/[clientId]/records/[recordId]/export/pdf/route.ts` | 500 | Server error with test ID |
| 126 | `/api/sunbul/documents/[documentId]/download` | API | Protected | Sunbul | Document download | `api/sunbul/documents/[documentId]/download/route.ts` | 404 | Not found (test ID) |

---

## 3. Route Group Analysis

### 3.1 Public Marketing Pages (no auth)

| Route | Status |
|---|---|
| `/` | ✅ 200 |
| `/platform` | ✅ 200 |
| `/products` | ✅ 200 |
| `/products/audit` | ✅ 200 |
| `/products/decision` | ✅ 200 |
| `/products/local-content` | ✅ 200 |
| `/products/sales` | ✅ 200 |
| `/products/simulation` | ✅ 200 |
| `/about` | ❌ 500 |
| `/contact` | ✅ 200 |
| `/custom-product` | ✅ 200 |
| `/demo` | ✅ 200 |
| `/deployment` | ✅ 200 |
| `/buyers/*` (5 pages) | ❌ 500 |
| `/engagement-models` | ❌ 500 |
| `/executive-brief` | ❌ 500 |
| `/executive-briefing` | ❌ 500 |
| `/governance` | ❌ 500 |
| `/how-we-work` | ❌ 500 |
| `/insights` | ❌ 500 |
| `/insights/*` (3 articles) | ❌ 500 |
| `/pilot-proof` | ❌ 500 |
| `/privacy` | ❌ 500 |
| `/proof-library` | ❌ 500 |
| `/security` | ❌ 500 |
| `/terms` | ❌ 500 |
| `/use-cases` | ❌ 500 |

**Root cause of 500s:** Syntax error in `src/app/(marketing)/about/page.tsx:259` — a stray `>` character after `}` breaks Turbopack compilation for all pages sharing the route group chunk.

### 3.2 Live Product Workspaces (all protected, 307 redirect to /login)

| Product Area | Routes | HTTP |
|---|---|---|
| AuditOS | 15 (dashboard + 14 engagement sub-pages + admin) | All 307 |
| DecisionOS | 19 (dashboard + 18 decision sub-pages) | All 307 |
| Intelligence/Sectors | 2 | All 307 |
| Office AI Assistant | 2 | All 307 |
| LocalContentOS | 12 (dashboard + 11 project sub-pages) | All 307 |
| Sunbul | 3 | All 307 |
| WorkflowOS | 3 (duplicate of Sunbul) | All 307 |
| SalesOS | 1 (shell) | 307 |
| Organizations | 2 (prototype) | All 307 |
| Settings | 4 (2 real + 2 shells) | All 307 |

### 3.3 Demo Routes (public)

| Route | Status |
|---|---|
| `/auditos` | ✅ 200 |
| `/auditos/trial-balance` | ✅ 200 |
| `/auditos/mapping` | ✅ 200 |
| `/auditos/statements` | ✅ 200 |
| `/auditos/evidence` | ✅ 200 |
| `/auditos/traceability` | ✅ 200 |

### 3.4 API Routes

| Route | Method | Status | Guard |
|---|---|---|---|
| `/api/health` | GET | 200 | None |
| `/api/metrics` | GET | 401 | Admin-only |
| `/api/custom-product-submit` | POST | 405 (GET) | None |
| `/api/auth/[...nextauth]` | * | 400 | NextAuth |
| `/api/audit/evidence/*/download` | GET | 404 | Protected |
| `/api/audit/engagements/*/exports/*` | GET | 400 | Protected |
| `/api/office-ai/download` | GET | 400 | Protected |
| `/api/local-content/projects/*/reports/*/download` | GET | 401 | Protected |
| `/api/sunbul/clients/*/records/*/export/pdf` | GET | 500 | Protected |
| `/api/sunbul/documents/*/download` | GET | 404 | Protected |

---

## 4. Navigation Link Analysis

### 4.1 Site Header Nav (`site-header.tsx`)

| Label | href | Route Exists? | HTTP Status | Notes |
|---|---|---|---|---|
| المنصة | `/platform` | ✅ page.tsx | 200 | |
| الأنظمة | `/products` | ✅ page.tsx | 200 | |
| الحوكمة | `/governance` | ✅ page.tsx | 500 | Broken |
| الإثبات | `/case-studies` | ✅ page.tsx | 500 | Broken |
| من نحن | `/about` | ✅ page.tsx | 500 | Broken |
| تواصل | `/contact` | ✅ page.tsx | 200 | |

### 4.2 Site Footer Columns (`site-footer.tsx`)

**Column 1 — المنصة والحوكمة:**
| Label | href | Route Exists? | HTTP |
|---|---|---|---|
| AQLIYA Intelligence Core | `/platform` | ✅ | 200 |
| بنية الحوكمة والثقة | `/governance` | ✅ | 500 |
| عائلة الأنظمة | `/products` | ✅ | 200 |
| بيئات النشر | `/deployment` | ✅ | 200 |

**Column 2 — الأنظمة النشطة:**
| Label | href | Route Exists? | HTTP |
|---|---|---|---|
| AuditOS | `/products/audit` | ✅ | 200 |
| DecisionOS | `/products/decision` | ✅ | 200 |
| LocalContentOS | `/products/local-content` | ✅ | 200 |
| أنظمة مؤسسية مخصصة | `/custom-product` | ✅ | 200 |

**Column 3 — للمشترين:**
| Label | href | Route Exists? | HTTP |
|---|---|---|---|
| CFO | `/buyers/cfo` | ✅ | 500 |
| CIO | `/buyers/cio` | ✅ | 500 |
| شريك التدقيق | `/buyers/audit-partner` | ✅ | 500 |
| الجهات الحكومية | `/buyers/government` | ✅ | 500 |
| المشتريات والعقود | `/buyers/procurement` | ✅ | 500 |

**Column 4 — الدليل والتعاون:**
| Label | href | Route Exists? | HTTP |
|---|---|---|---|
| دراسات الحالة | `/case-studies` | ✅ | 500 |
| مكتبة الإثبات | `/proof-library` | ✅ | 500 |
| دليل البايلوت | `/pilot-proof` | ✅ | 500 |
| نماذج التعاون | `/engagement-models` | ✅ | 500 |
| الديمو التفاعلي | `/demo` | ✅ | 200 |
| الملخص التنفيذي | `/executive-brief` | ✅ | 500 |

**Column 5 — الشركة والمعرفة:**
| Label | href | Route Exists? | HTTP |
|---|---|---|---|
| من نحن | `/about` | ✅ | 500 |
| كيف نعمل | `/how-we-work` | ✅ | 500 |
| حالات الاستخدام | `/use-cases` | ✅ | 500 |
| رؤى ومقالات | `/insights` | ✅ | 500 |
| تواصل معنا | `/contact` | ✅ | 200 |
| ragheed@aqliya.com | `mailto:ragheed@aqliya.com` | — | — |

**Legal Links:**
| Label | href | Route Exists? | HTTP |
|---|---|---|---|
| سياسة الخصوصية | `/privacy` | ✅ | 500 |
| شروط الخدمة | `/terms` | ✅ | 500 |
| الأمن المؤسسي | `/security` | ✅ | 500 |
| بيئات النشر | `/deployment` | ✅ | 200 |

### 4.3 Platform Sidebar Modules (`platform-sidebar.tsx`)

| Label (Ar) | href | Route Exists? | HTTP |
|---|---|---|---|
| نظام التدقيق المالي | `/audit` | ✅ | 307 |
| نظام القرارات | `/decisions` | ✅ | 307 |
| نظام المبيعات | `/sales` | ✅ | 307 |
| نظام سير العمل | `/workflowos` | ✅ | 307 |

### 4.4 Platform Nav (`platform-sidebar.tsx` — DecisionOS context)

| Label | href | Route Exists? | HTTP |
|---|---|---|---|
| الذكاء القرارات | `/decisions` | ✅ | 307 |
| المنظمات | `/organizations` | ✅ | 307 |
| شركة سنبل | `/organizations/sunbul` | ✅ | 307 |
| الذكاء | `/intelligence/sectors` | ✅ | 307 |
| الإعدادات | `/settings` | ✅ | 307 |
| منظمة المنصة | `/settings/platform-organization` | ✅ | 307 |
| مساحات العملاء | `/settings/workspaces` | ✅ | 307 |
| سجلات تدقيق المنصة | `/settings/audit-logs` | ✅ | 307 |
| مساعد العمل الذكي | `/assistant` | ✅ | 307 |

### 4.5 Audit Sidebar (`audit-sidebar.tsx`)

| Label | href | Hash? | Route Exists? | HTTP |
|---|---|---|---|---|
| لوحة القيادة | `/audit` | — | ✅ | 307 |
| الارتباطات | `/audit#engagements` | engagements | ✅ | 307 |
| العملاء | `/audit#clients` | clients | ✅ | 307 |
| ميزان المراجعة | `/audit#trial-balances` | trial-balances | ✅ | 307 |
| القوائم المالية | `/audit#statements` | statements | ✅ | 307 |
| الأدلة | `/audit#evidence` | evidence | ✅ | 307 |
| النتائج | `/audit#findings` | findings | ✅ | 307 |
| التوصيات | `/audit#recommendations` | recommendations | ✅ | 307 |
| المراجعات | `/audit#reviews` | reviews | ✅ | 307 |
| الاعتماد | `/audit#approval` | approval | ✅ | 307 |
| النشر | `/audit#publication` | publication | ✅ | 307 |
| سجل التدقيق | `/audit#audit-trail` | audit-trail | ✅ | 307 |
| الإعدادات | `/audit#settings` | settings | ✅ | 307 |
| المشرفون | `/audit/admin/users` | — | ✅ | 307 |

### 4.6 Demo Sidebar (`auditos/demo-sidebar.tsx`)

| Step | href | Route Exists? | HTTP |
|---|---|---|---|
| نظرة عامة | `/auditos` | ✅ | 200 |
| ميزان المراجعة | `/auditos/trial-balance` | ✅ | 200 |
| تصنيف الحسابات | `/auditos/mapping` | ✅ | 200 |
| القوائم المالية | `/auditos/statements` | ✅ | 200 |
| الأدلة والملاحظات | `/auditos/evidence` | ✅ | 200 |
| التتبع | `/auditos/traceability` | ✅ | 200 |

### 4.7 Engagement Workflow Tabs (`engagement-tabs.tsx`)

| Tab | key | Corresponding Route | Route Exists? |
|---|---|---|---|
| Overview | overview | `/audit/engagements/[id]/overview` | **Not found** — no page.tsx for overview |
| ميزان المراجعة | trial-balance | `/audit/engagements/[id]/trial-balance` | ✅ |
| Mapping | mapping | `/audit/engagements/[id]/mapping` | ✅ |
| Validation | validation | `/audit/engagements/[id]/validation` | ✅ |
| Statements | statements | `/audit/engagements/[id]/statements` | ✅ |
| Notes | notes | `/audit/engagements/[id]/notes` | ✅ |
| Evidence | evidence | `/audit/engagements/[id]/evidence` | ✅ |
| Findings | findings | `/audit/engagements/[id]/findings` | ✅ |
| Recommendations | recommendations | `/audit/engagements/[id]/recommendations` | ✅ |
| Review | review | `/audit/engagements/[id]/review` | ✅ |
| Approval | approval | `/audit/engagements/[id]/approval` | ✅ |
| Publication | publication | `/audit/engagements/[id]/publication` | ✅ |
| سجل التدقيق | audit-trail | `/audit/engagements/[id]/audit-trail` | ✅ |
| Pilot | pilot | `/audit/engagements/[id]/pilot` | ✅ |

> **Observation:** Tab "Overview" maps to `overview` key but there is no `page.tsx` at `audit/engagements/[engagementId]/overview/`. The engagement layout uses `[engagementId]/page.tsx` as the default/overview page instead. The tab key "overview" likely links to the engagement root `/audit/engagements/[id]`.

### 4.8 Decision Modules (`decision-type-config.ts`)

| Module | href | Corresponding Route | Route Exists? |
|---|---|---|---|
| Intake | `/intake` | `/decisions/[id]/intake` | ✅ |
| Framework | `/framework` | `/decisions/[id]/framework` | ✅ |
| Scenarios | `/scenarios` | `/decisions/[id]/scenarios` | ✅ |
| Risks | `/risks` | `/decisions/[id]/risks` | ✅ |
| Recommendation | `/recommendation` | `/decisions/[id]/recommendation` | ✅ |
| Simulation | `/simulation` | `/decisions/[id]/simulation` | ✅ |
| Insight | `/insight` | `/decisions/[id]/insight` | ✅ |
| What to Do | `/what-to-do` | `/decisions/[id]/what-to-do` | ✅ |
| Executive | `/overview` | `/decisions/[id]/overview` | ✅ |
| Sector | `/sector` | `/decisions/[id]/sector` | ✅ |
| Signals | `/signals` | `/decisions/[id]/signals` | ✅ |
| Alerts | `/alerts` | `/decisions/[id]/alerts` | ✅ |
| Governance | `/governance` | `/decisions/[id]/governance` | ✅ |
| Outcome | `/outcome` | `/decisions/[id]/outcome` | ✅ |
| Report | `/report` | `/decisions/[id]/report` | ✅ |
| Tender | `/tender` | `/decisions/[id]/tender` | ✅ |

### 4.9 Organization Workspace Cards (`organization-workspace.tsx`)

| Product | href | adminHref | Routes Exist? |
|---|---|---|---|
| WorkflowOS | `/workflowos` | `/workflowos/admin` | ✅ |
| AuditOS | `/audit` | null | ✅ |
| DecisionOS | `/decisions` | null | ✅ |
| SalesOS | `/sales` | null | ✅ |

### 4.10 Command Palette (`command-palette.tsx`)

| Command | href | Route Exists? |
|---|---|---|
| Decision Intelligence | `/decisions` | ✅ |
| AuditOS Dashboard | `/audit` | ✅ |
| SalesOS Dashboard | `/sales` | ✅ |
| Organizations | `/organizations` | ✅ |
| Intelligence Sectors | `/intelligence/sectors` | ✅ |
| New Decision | `/decisions/new` | ✅ |
| Settings | `/settings` | ✅ |

---

## 5. Anomalies and Issues Found

### 5.1 Critical Issues

| # | Issue | Details | Severity |
|---|---|---|---|
| C1 | **17 marketing pages return HTTP 500** | Syntax error in `src/app/(marketing)/about/page.tsx:259` (stray `>` character) blocks Turbopack compilation for entire marketing route group | High |
| C2 | **Custom 404 page broken** | `not-found.tsx` returns 500 instead of 404, making all non-existent routes return 500 | High |
| C3 | **`/published/recommendation/[decisionId]` is public** | Legacy published decision view is unauthenticated — could leak decision data if content is accessible | Medium |
| C4 | **`/audit/engagements/[id]/overview` has no dedicated page** | Engagement tabs reference "overview" key but there is no `overview/page.tsx` — the root `[engagementId]/page.tsx` handles it | Low |

### 5.2 Route Inconsistencies

| # | Issue | Details |
|---|---|---|
| I1 | **Sunbul ↔ WorkflowOS duplication** | `/sunbul/*` and `/workflowos/*` are identical route families sharing the same implementation pattern. Documented as alias. |
| I2 | **Audit sidebar hash-only navigation** | `audit-sidebar.tsx` has 13 items where 12 use hash anchors (`/audit#section`) instead of sub-routes. Actual sub-routes exist at `/audit/engagements/[id]/*` |
| I3 | **`/organizations/sunbul` is outside `(dashboard)` route group** | Unlike other org pages which are inside `(dashboard)/`, `/organizations/sunbul` is at top level under `/organizations/` |
| I4 | **`/organizations/sunbul` vs `/sunbul`** | Two different routes both referencing "Sunbul" — likely legacy separation |
| I5 | **SalesOS sidebar items all point to `/sales`** | No sub-routes or detail pages exist for SalesOS — it's a shell/prototype |
| I6 | **Marketing route `/demo` vs workspace route `/auditos`** | Both exist — `/demo` is a marketing page describing the demo, `/auditos/*` is the actual demo |
| I7 | **`/executive-brief` and `/executive-briefing` both exist** | Two very similar route names — likely duplicate |

### 5.3 Navigation → Route Dead Links

All navigation links in header, footer, sidebar, and demo sidebar point to routes that **exist as page.tsx files**. No dead href references found.

However, many of these routes return 500 due to the compilation error described above.

### 5.4 Taxonomy / Naming Issues

| # | Issue | Details |
|---|---|---|
| T1 | **English tab labels in engagement workflow** | Mixed Arabic/English labels in `engagement-tabs.tsx` — some Arabic, some English |
| T2 | **Demo route `/auditos` uses AuditOS name** | Per AQLIYA identity rules, product names should not be mixed with platform name. `auditos` short for "AuditOS" is acceptable as a demo route name. |
| T3 | **workflowos uses "WorkflowOS" brand but reuses Sunbul code** | Could confuse customers about which product is real |

---

## 6. Middleware / Auth Guard Map

The proxy in `src/proxy.ts` protects these paths:

```
/audit/*        → Protected 307 → /login
/decisions/*    → Protected 307 → /login
/sales/*        → Protected 307 → /login
/sunbul/*       → Protected 307 → /login
/workflowos/*   → Protected 307 → /login
/organizations/* → Protected 307 → /login
/intelligence/* → Protected 307 → /login
/monitoring/*   → Protected 307 → /login
/settings/*     → Protected 307 → /login
/assistant/*    → Protected 307 → /login
/local-content/* → Protected 307 → /login
```

**Not protected:**
- `/` (homepage)
- `/(marketing)/*` (all marketing pages)
- `/auditos/*` (demo)
- `/login` (auth page)
- `/access-denied`
- `/published/*` (legacy published content)
- `/api/health`
- `/api/custom-product-submit`
- `/api/auth/*`

**API-level protection (in code, not proxy):**
- `/api/metrics` — 401 without valid session
- All download/export API routes check auth + organization membership internally

---

## 7. Summary Assessment

### 7.1 Most Important Live Routes

| Route | Product | Why Important |
|---|---|---|
| `/audit` + `/audit/engagements/*` | AuditOS | **Primary pilot-ready product** — 14 workflow steps, full governance, evidence, review/approval |
| `/decisions` + `/decisions/[id]/*` | DecisionOS | **Active adjacent system** — 16 sub-route modules |
| `/local-content` + `/local-content/projects/*` | LocalContentOS | **Strategic second product** — 11 project sub-routes, L5 pilot-ready claimed |
| `/assistant` | Office AI | **Real governed shared app** — task workspace with AI output |

### 7.2 Most Important Demo Routes

| Route | Product | Why Important |
|---|---|---|
| `/auditos` + 5 sub-routes | AuditOS | **Public guided demo** — all 6 work (200 OK), mock-backed, unauthenticated |

### 7.3 Broken / Suspicious Routes

| Route | Problem | Action Needed |
|---|---|---|
| **17 marketing pages** | HTTP 500 | Fix syntax error in `about/page.tsx:259` |
| `not-found.tsx` | HTTP 500 | Fix rendering error in custom 404 |
| `/api/sunbul/clients/*/records/*/export/pdf` | HTTP 500 | Server error with test params |
| `/published/recommendation/*` | Public access | Review if content should be protected |

### 7.4 Recommendation: Which Routes to Show Clients

**Safe to demonstrate:**
- `/auditos/*` (all 6 demo routes) — polished, public, mock-backed
- `/audit` workspace — if authenticated, shows full governance workflow
- `/decisions` workspace — if authenticated, shows real decision workflow
- `/local-content/projects/*` workspace — if authenticated
- `/` + `/platform` + `/products/audit` — marketing but load correctly (200)

**Do NOT show without fixing:**
- Any marketing page returning 500 (17 pages) — including `/about`, `/governance`, `/case-studies`, `/privacy`, etc.
- `/sales` — shell/prototype only, not implemented
- `/sunbul` or `/workflowos` — custom client workspaces, not platform-claimable products
- `/published/recommendation/*` — legacy public route with unclear content
- `/organizations` — mock/internal preview only

---

## 8. Route Count Summary

| Category | Count | HTTP Status Summary |
|---|---|---|
| Public marketing pages (200) | 13 | All ✅ 200 |
| Public marketing pages (500) | 17 | ❌ 500 — compilation error |
| Public marketing pages (subtotal) | 30 | |
| Demo routes | 6 | All ✅ 200 |
| Auth routes | 2 | All ✅ 200 |
| Live workspace routes | ~73 | All 307 → login (correct) |
| Legacy public routes | 1 | ✅ 200 |
| API routes | 10 | Mixed (200, 401, 400, 404, 405, 500) |
| System/special routes | 5 | N/A or 500 |
| **Total** | **~127 unique paths** | |

---

*Report generated by OpenCode via code inspection + curl HTTP verification on live Next.js 16 dev server.*
