# AQLIYA Route Registry

**Purpose:** Official registry of all Next.js App Router routes, organized by product area.

**Maintenance:** Update this file whenever a route is added, removed, or reorganized. Keep the status column current.

---

## Legend

| Column | Meaning |
|--------|---------|
| Route | Full URL path |
| Type | `page` = full page, `api` = API endpoint, `layout` = layout wrapper |
| Auth | `✓` = requires auth, `✗` = public, `demo` = public demo |
| Status | `✅` = active, `⚠️` = prototype, `🟡` = partial, `🔴` = stub |
| Product | Which product/system owns this route |
| Notes | Important caveats |

---

## Special Root Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout (all routes inherit) |
| `src/app/loading.tsx` | Root loading state |
| `src/app/not-found.tsx` | Root 404 page |
| `src/app/global-error.tsx` | Global error boundary |
| `src/app/manifest.ts` | Web app manifest |
| `src/app/robots.ts` | Robots.txt |
| `src/app/sitemap.ts` | Sitemap |

---

## Marketing — Public Site `(marketing)`

All routes in this group are **public**, require **no auth**, and serve marketing content.

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/` | page+layout | ✗ | ✅ | Platform | Homepage — platform-first repositioning |
| `/industries` | page | ✗ | ✅ | Platform | Sector landing (audit, government, enterprise, PS) |
| `/proof` | page | ✗ | ✅ | Platform | Proof Center hub |
| `/about` | page | ✗ | ✅ | Platform | About page |
| `/buyers` | page | ✗ | ✅ | Platform | Buyers index |
| `/buyers/procurement` | redirect | ✗ | ✅ | Platform | Permanent → `/procurement-pack` |
| `/buyers/government` | page | ✗ | ✅ | Platform | Government persona |
| `/buyers/cio` | page | ✗ | ✅ | Platform | CIO persona |
| `/buyers/cfo` | page | ✗ | ✅ | Platform | CFO persona |
| `/buyers/audit-partner` | page | ✗ | ✅ | Platform | Audit partner persona |
| `/case-studies` | page | ✗ | ✅ | Platform | Case studies |
| `/contact` | page | ✗ | ✅ | Platform | Contact form |
| `/custom-product` | page | ✗ | ✅ | Platform | Custom product inquiry |
| `/demo` | page | ✗ | ✅ | Platform | Demo request |
| `/deployment` | page | ✗ | ✅ | Platform | Deployment info |
| `/engagement-models` | page | ✗ | ✅ | Platform | Engagement models |
| `/executive-brief` | page | ✗ | ✅ | Platform | Executive brief |
| `/executive-briefing` | page | ✗ | ✅ | Platform | Executive briefing |
| `/governance` | page | ✗ | ✅ | Platform | Governance page |
| `/how-we-work` | page | ✗ | ✅ | Platform | Methodology |
| `/insights` | page | ✗ | ✅ | Platform | Insights index |
| `/insights/ai-institutional-failures` | page | ✗ | ✅ | Platform | Blog/insight |
| `/insights/assistant-vs-governed-intelligence` | page | ✗ | ✅ | Platform | Blog/insight |
| `/insights/governance-over-intelligence` | page | ✗ | ✅ | Platform | Blog/insight |
| `/pilot-proof` | page | ✗ | ✅ | Platform | Pilot proof page |
| `/platform` | page | ✗ | ✅ | Platform | Platform overview |
| `/privacy` | page | ✗ | ✅ | Platform | Privacy policy |
| `/products` | page | ✗ | ✅ | Platform | Products index (secondary nav; linked from platform#capabilities) |
| `/products/audit` | page | ✗ | ✅ | AuditOS | Product marketing |
| `/products/decision` | page | ✗ | ✅ | DecisionOS | Product marketing |
| `/products/local-content` | page | ✗ | ✅ | LocalContentOS | Product marketing |
| `/products/sales` | page | ✗ | ✅ | SalesOS | Product marketing |
| `/products/simulation` | page | ✗ | ✅ | Platform | Simulation product |
| `/proof-library` | page | ✗ | ✅ | Platform | Proof/evidence library |
| `/security` | page | ✗ | ✅ | Platform | Security page |
| `/terms` | page | ✗ | ✅ | Platform | Terms of service |
| `/use-cases` | page | ✗ | ✅ | Platform | Use cases |

---

## Auth & Onboarding

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/login` | page | ✗ | ✅ | Platform | Login page |
| `/signup` | page | ✗ | ✅ | Platform | Signup |
| `/access-denied` | page | ✗ | ✅ | Platform | Access denied |
| `/invite/[token]` | page | ✗ | ✅ | Platform | Invitation acceptance |

---

## AuditOS — Authenticated Workspace

All routes under `/audit` require **auth** and **tenant isolation**.

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/audit` | page+layout+error+loading | ✓ | ✅ | AuditOS | Dashboard |
| `/audit/admin/users` | page | ✓ | ✅ | AuditOS | User management |
| `/audit/archived` | page+error+loading | ✓ | ✅ | AuditOS | Archived engagements |
| `/audit/portfolio` | page+error+loading | ✓ | ✅ | AuditOS | Portfolio view |
| `/audit/engagements/[engagementId]` | page+layout+error+loading+not-found | ✓ | ✅ | AuditOS | Engagement detail |
| `/audit/engagements/[engagementId]/approval` | page+error+loading | ✓ | ✅ | AuditOS | Approval workflow |
| `/audit/engagements/[engagementId]/audit-trail` | page+error+loading | ✓ | ✅ | AuditOS | Audit trail |
| `/audit/engagements/[engagementId]/evidence` | page+error+loading | ✓ | ✅ | AuditOS | Evidence vault |
| `/audit/engagements/[engagementId]/exports` | page+error+loading | ✓ | ✅ | AuditOS | Export center |
| `/audit/engagements/[engagementId]/findings` | page+error+loading | ✓ | ✅ | AuditOS | Findings |
| `/audit/engagements/[engagementId]/mapping` | page+error+loading | ✓ | ✅ | AuditOS | Account mapping |
| `/audit/engagements/[engagementId]/materiality` | page | ✓ | ✅ | AuditOS | Materiality calc |
| `/audit/engagements/[engagementId]/lead-schedules` | page | ✓ | ✅ | AuditOS | Lead schedules (flag: `audit.lead-schedule-auto`) |
| `/audit/engagements/[engagementId]/factory-map` | page | ✓ | ✅ | AuditOS | Factory mind map (flag: `audit.mind-map`) |
| `/audit/engagements/[engagementId]/notes` | page+error+loading | ✓ | ✅ | AuditOS | Disclosure notes |
| `/audit/engagements/[engagementId]/pilot` | page+error+loading | ✓ | ✅ | AuditOS | Pilot feedback |
| `/audit/engagements/[engagementId]/publication` | page+error+loading | ✓ | ✅ | AuditOS | Publication |
| `/audit/engagements/[engagementId]/recommendations` | page+error+loading | ✓ | ✅ | AuditOS | Recommendations |
| `/audit/engagements/[engagementId]/review` | page+error+loading | ✓ | ✅ | AuditOS | Review workflow |
| `/audit/engagements/[engagementId]/sampling` | page+error+loading | ✓ | ✅ | AuditOS | Audit sampling |
| `/audit/engagements/[engagementId]/statements` | page+error+loading | ✓ | ✅ | AuditOS | Financial statements |
| `/audit/engagements/[engagementId]/trial-balance` | page+error+loading | ✓ | ✅ | AuditOS | Trial balance |
| `/audit/engagements/[engagementId]/validation` | page+error+loading | ✓ | ✅ | AuditOS | Validation |

---

## auditos — Public Demo (NO AUTH)

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/auditos` | page+layout | ✗ | ✅ | AuditOS | Demo landing |
| `/auditos/evidence` | page | ✗ | ✅ | AuditOS | Demo — evidence |
| `/auditos/mapping` | page | ✗ | ✅ | AuditOS | Demo — mapping |
| `/auditos/statements` | page | ✗ | ✅ | AuditOS | Demo — statements |
| `/auditos/traceability` | page | ✗ | ✅ | AuditOS | Demo — traceability |
| `/auditos/trial-balance` | page | ✗ | ✅ | AuditOS | Demo — trial balance |

**Rules:** No auth, no mutations, no customer data, no uploads, no real API keys.

---

## Dashboard `(dashboard)` — Authenticated Main Workspace

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/assistant` | page+layout+error | ✓ | ✅ | Office AI | Assistant workspace |
| `/assistant/[taskId]` | page | ✓ | ✅ | Office AI | Task detail |
| `/assistant/stats` | page | ✓ | ⚠️ | Office AI | Task statistics |
| `/decisions` | page+error+loading | ✓ | ✅ | DecisionOS | Decision index |
| `/decisions/new` | page | ✓ | ✅ | DecisionOS | New decision request |
| `/decisions/[id]` | page+error+loading+not-found | ✓ | ✅ | DecisionOS | Detail |
| `/decisions/[id]/alerts` | page | ✓ | ✅ | DecisionOS | Risk alerts |
| `/decisions/[id]/framework` | page | ✓ | ✅ | DecisionOS | Framework |
| `/decisions/[id]/governance` | page | ✓ | ✅ | DecisionOS | Governance |
| `/decisions/[id]/insight` | page | ✓ | ✅ | DecisionOS | Insight |
| `/decisions/[id]/intake` | page | ✓ | ✅ | DecisionOS | Intake |
| `/decisions/[id]/outcome` | page | ✓ | ✅ | DecisionOS | Outcome tracking |
| `/decisions/[id]/overview` | page | ✓ | ✅ | DecisionOS | Overview |
| `/decisions/[id]/recommendation` | page | ✓ | ✅ | DecisionOS | Recommendation |
| `/decisions/[id]/report` | page | ✓ | ✅ | DecisionOS | Report |
| `/decisions/[id]/risks` | page | ✓ | ✅ | DecisionOS | Risks |
| `/decisions/[id]/scenarios` | page | ✓ | ✅ | DecisionOS | Scenarios |
| `/decisions/[id]/sector` | page | ✓ | ✅ | DecisionOS | Sector analysis |
| `/decisions/[id]/signals` | page | ✓ | ✅ | DecisionOS | Monitoring signals |
| `/decisions/[id]/simulation` | page | ✓ | ✅ | DecisionOS | Simulation |
| `/decisions/[id]/tender` | page | ✓ | ✅ | DecisionOS | Tender profile |
| `/decisions/[id]/what-to-do` | page | ✓ | ✅ | DecisionOS | Action planner |
| `/intelligence/sectors` | page | ✓ | ✅ | DecisionOS | Sector intelligence |
| `/intelligence/sectors/[id]` | page | ✓ | ✅ | DecisionOS | Sector detail |
| `/monitoring` | page | ✓ | ⚠️ | Platform | Monitoring dashboard |
| `/organizations` | page | ✓ | ✅ | Platform | Org list |
| `/organizations/[id]` | page | ✓ | ✅ | Platform | Org detail |
| `/organizations/sunbul` | page | ✓ | ⚠️ | Platform | Sunbul org view |
| `/settings` | page | ✓ | ⚠️ | Platform | Settings (generic) |
| `/settings/audit-logs` | page | ✓ | ✅ | Platform | Audit log viewer |
| `/settings/platform-organization` | page | ✓ | ✅ | Platform | Platform org settings |
| `/settings/siem` | page | ✓ | ⚠️ | Platform | SIEM settings |
| `/settings/sso` | page | ✓ | ⚠️ | Platform | SSO settings |
| `/settings/ai` | page | ✓ | ✅ | Platform | AI runtime configuration (Cloud/Local/Hybrid) |
| `/api/ai/providers` | api | ✓ | ✅ | Platform | AI provider status API |
| `/settings/team` | page | ✓ | ✅ | Platform | Team management |
| `/settings/workspaces` | page | ✓ | ✅ | Platform | Workspace management |
| `/settings/audit-bridge` | page+error+loading | ✓ | ⚠️ | Platform | Audit bridge |
| `/settings/audit-bridge/logs` | page | ✓ | ⚠️ | Platform | Bridge logs |
| `/settings/organization/advanced` | page+error+loading | ✓ | ⚠️ | Platform | Advanced org settings |
| `/settings/organization/advanced/events` | page | ✓ | ⚠️ | Platform | Org lifecycle events |
| `/settings/retention` | page | ✓ | ⚠️ | Platform | Data retention |

**Note:** `(dashboard)` group routes share a common layout. Some settings routes (SIEM, SSO, MFA) are prototype/partial pending L6 hardening.

---

## DecisionOS — Standalone Routes

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/decisions/gov` | page+error+loading+layout | ✓ | ✅ | DecisionOS | Platform governance console |
| `/decisions/gov/escalation-rules` | page | ✓ | ✅ | DecisionOS | Escalation rules |
| `/decision` | redirect | ✓ | ✅ | DecisionOS | → `/decisions` (legacy) |
| `/decision/gov` | redirect | ✓ | ✅ | DecisionOS | → `/decisions/gov` (legacy) |
| `/decision/gov/escalation-rules` | redirect | ✓ | ✅ | DecisionOS | → `/decisions/gov/escalation-rules` (legacy) |
| `/published/recommendation/[decisionId]` | page | ✓ | ✅ | DecisionOS | Published recommendation |

---

## LocalContentOS

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/local-content` | page+layout+error+loading | ✓ | ✅ | LocalContentOS | Dashboard |
| `/local-content/analytics` | page | ✓ | ✅ | LocalContentOS | Analytics |
| `/local-content/campaigns` | page | ✓ | ✅ | LocalContentOS | Campaign list |
| `/local-content/campaigns/[id]` | page+loading | ✓ | ✅ | LocalContentOS | Campaign detail |
| `/local-content/classification-rules` | page | ✓ | ✅ | LocalContentOS | Classification rules |
| `/local-content/outputs` | page+loading | ✓ | ✅ | LocalContentOS | Generated outputs |
| `/local-content/pilot-readiness` | page | ✓ | ✅ | LocalContentOS | Pilot Readiness Dashboard (V3.5: 11-dimension readiness) |
| `/local-content/projects` | page+loading | ✓ | ✅ | LocalContentOS | Project list |
| `/local-content/projects/[projectId]` | page+error+loading+not-found | ✓ | ✅ | LocalContentOS | Project detail |
| `/local-content/projects/[projectId]/approval` | page | ✓ | ✅ | LocalContentOS | Approval |
| `/local-content/projects/[projectId]/audit-trail` | page | ✓ | ✅ | LocalContentOS | Audit trail |
| `/local-content/projects/[projectId]/classification` | page | ✓ | ✅ | LocalContentOS | Classification |
| `/local-content/projects/[projectId]/evidence` | page | ✓ | ✅ | LocalContentOS | Evidence |
| `/local-content/projects/[projectId]/findings` | page | ✓ | ✅ | LocalContentOS | Findings |
| `/local-content/projects/[projectId]/reports` | page | ✓ | ✅ | LocalContentOS | Reports |
| `/local-content/projects/[projectId]/review` | page | ✓ | ✅ | LocalContentOS | Review |
| `/local-content/projects/[projectId]/spend` | page | ✓ | ✅ | LocalContentOS | Spend records |
| `/local-content/projects/[projectId]/suppliers` | page | ✓ | ✅ | LocalContentOS | Suppliers |
| `/local-content/projects/[projectId]/tender-match` | page | ✓ | ✅ | LocalContentOS | Tender matching |
| `/local-content/review` | page+loading | ✓ | ✅ | LocalContentOS | Review dashboard |
| `/local-content/settings/integrations` | page | ✓ | ⚠️ | LocalContentOS | ERP/CRM integration |

---

## SalesOS

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/sales` | page+layout+error+loading | ✓ | ✅ | SalesOS | Dashboard |
| `/sales/accounts` | page+error | ✓ | ✅ | SalesOS | Account list |
| `/sales/accounts/new` | page | ✓ | ✅ | SalesOS | New account |
| `/sales/accounts/[id]` | page+error | ✓ | ✅ | SalesOS | Account detail |
| `/sales/accounts/[id]/brief` | page | ✓ | ✅ | SalesOS | Account brief |
| `/sales/activities` | page | ✓ | ⚠️ | SalesOS | Activity log |
| `/sales/approval` | page | ✓ | ✅ | SalesOS | Approval queue |
| `/sales/audit-trail` | page | ✓ | ✅ | SalesOS | Audit trail |
| `/sales/command-center` | page+error | ✓ | ✅ | SalesOS | Command center |
| `/sales/deals` | page | ✓ | ✅ | SalesOS | Deal list |
| `/sales/deals/new` | page | ✓ | ✅ | SalesOS | New deal |
| `/sales/deals/[id]` | page | ✓ | ✅ | SalesOS | Deal detail |
| `/sales/deals/[id]/pilot` | page | ✓ | ✅ | SalesOS | Deal pilot |
| `/sales/forecast` | page | ✓ | ✅ | SalesOS | Forecasting |
| `/sales/funnel` | page | ✓ | ✅ | SalesOS | Funnel view |
| `/sales/icp` | page | ✓ | ⚠️ | SalesOS | ICP profile |
| `/sales/intelligence` | page+error+loading | ✓ | ✅ | SalesOS | Intelligence hub |
| `/sales/intelligence/forecasts` | page | ✓ | ✅ | SalesOS | Forecast detail |
| `/sales/opportunities` | page+error | ✓ | ✅ | SalesOS | Opportunities |
| `/sales/opportunities/new` | page | ✓ | ✅ | SalesOS | New opportunity |
| `/sales/opportunities/[id]` | page+error | ✓ | ✅ | SalesOS | Opportunity detail |
| `/sales/outreach` | page | ✓ | ⚠️ | SalesOS | Outreach |
| `/sales/pilot-handoff/[dealId]` | page | ✓ | ⚠️ | SalesOS | Pilot handoff |
| `/sales/pipeline` | page | ✓ | ✅ | SalesOS | Pipeline view |
| `/sales/pipeline-depth` | page | ✓ | ✅ | SalesOS | Pipeline depth |
| `/sales/reports` | page | ✓ | ✅ | SalesOS | Reports |
| `/sales/revenue` | page | ✓ | ⚠️ | SalesOS | Revenue view |
| `/sales/review` | page | ✓ | ✅ | SalesOS | Review queue |
| `/sales/settings/crm` | page | ✓ | ⚠️ | SalesOS | CRM settings |
| `/sales/signals` | page | ✓ | ⚠️ | SalesOS | Sales signals |

---

## LocalContactOS

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/contacts` | page+layout | ✓ | ✅ | LocalContactOS | Contact directory |
| `/contacts/new` | page | ✓ | ✅ | LocalContactOS | New contact |
| `/contacts/[id]` | page | ✓ | ✅ | LocalContactOS | Contact detail |
| `/contacts/[id]/interactions/new` | page | ✓ | ✅ | LocalContactOS | Log interaction |
| `/contacts/[id]/relations/new` | page | ✓ | ✅ | LocalContactOS | Add relation |

---

## Content Studio

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/content-studio` | page+error+loading | ✓ | ⚠️ | ContentStudio | Workspace index |
| `/content-studio/templates` | page | ✓ | ⚠️ | ContentStudio | Template library |
| `/content-studio/[workspaceId]` | page | ✓ | ⚠️ | ContentStudio | Workspace detail |
| `/content-studio/[workspaceId]/create` | page | ✓ | ⚠️ | ContentStudio | Create content |
| `/content-studio/[workspaceId]/[contentId]` | page | ✓ | ⚠️ | ContentStudio | Content detail |

---

## RiskOS

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/risk` | page+error+loading | ✓ | ⚠️ | RiskOS | Dashboard |
| `/risk/assessments` | page | ✓ | ⚠️ | RiskOS | Assessment list |
| `/risk/assessments/[id]` | page | ✓ | ⚠️ | RiskOS | Assessment detail |
| `/risk/[id]` | page | ✓ | ⚠️ | RiskOS | Risk detail |

---

## Sampling

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/sampling` | page+error+loading | ✓ | ✅ | AuditOS | Sampling dashboard |
| `/sampling/[id]` | page | ✓ | ✅ | AuditOS | Sampling detail |

---

## WorkflowOS

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/workflowos` | page+layout+error+loading | ✓ | ✅ | WorkflowOS | Dashboard |
| `/workflowos/admin` | page | ✓ | ✅ | WorkflowOS | Admin |
| `/workflowos/templates` | page | ✓ | ✅ | WorkflowOS | Template list |
| `/workflowos/templates/new` | page | ✓ | ✅ | WorkflowOS | New template |
| `/workflowos/templates/[id]` | page | ✓ | ✅ | WorkflowOS | Template detail |
| `/workflowos/records` | page | ✓ | ✅ | WorkflowOS | Record list |
| `/workflowos/records/[id]` | page | ✓ | ✅ | WorkflowOS | Record detail |
| `/workflowos/clients/[clientId]/records/[recordId]` | page | ✓ | ✅ | WorkflowOS | Sunbul-style record |

---

## Sunbul (WorkflowOS variant)

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/sunbul` | page | ✓ | ✅ | WorkflowOS | Dashboard |
| `/sunbul/admin` | page | ✓ | ✅ | WorkflowOS | Admin |
| `/sunbul/clients/[clientId]/records/[recordId]` | page | ✓ | ✅ | WorkflowOS | Sunbul record detail |

---

## Office AI Assistant

| Route | Type | Auth | Status | Product | Notes |
|-------|------|------|--------|---------|-------|
| `/office-ai/advanced` | page+error+loading | ✓ | ✅ | Office AI | Advanced settings |
| `/office-ai/advanced/role-config` | page | ✓ | ✅ | Office AI | Role config |
| `/office-ai/advanced/schedules` | page | ✓ | ✅ | Office AI | AI schedules |
| `/office-ai/advanced/templates` | page | ✓ | ✅ | Office AI | AI templates |

---

## API Routes

### Health & System

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/health` | GET | ✗ | ✅ | Full health check |
| `/api/health/live` | GET | ✗ | ✅ | Liveness probe |
| `/api/health/ready` | GET | ✗ | ✅ | Readiness probe |
| `/api/metrics` | GET | ✓ | ✅ | System metrics |

### Auth

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/auth/[...nextauth]` | All | ✗ | ✅ | NextAuth v5 catch-all |

### AI

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/ai/knowledge` | GET,POST | ✓ | ✅ | Knowledge engine |
| `/api/ai/knowledge/ingest` | POST | ✓ | ✅ | Document ingestion |
| `/api/ai/knowledge/search` | GET,POST | ✓ | ✅ | Vector search |
| `/api/ai/knowledge/metadata` | GET | ✓ | ✅ | Knowledge metadata |
| `/api/agent-memory` | GET,POST | ✓ | ⚠️ | Agent memory API |

### AuditOS — Downloads

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/audit/evidence/[evidenceId]/download` | GET | ✓ | ✅ | Evidence download with ticket |
| `/api/audit/engagements/[engagementId]/exports/[format]` | GET | ✓ | ✅ | Engagement export (pdf/csv/xlsx) |

### Decisions — Downloads

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/decisions/[decisionId]/evidence/[evidenceId]/download` | GET | ✓ | ✅ | Decision evidence download |

### LocalContent — Downloads

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/local-content/projects/[projectId]/evidence/[evidenceId]/download` | GET | ✓ | ✅ | LC evidence download |
| `/api/local-content/projects/[projectId]/reports/[reportId]/download` | GET | ✓ | ✅ | LC report download |

### Office AI — Downloads

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/office-ai/download` | GET | ✓ | ✅ | AI output download |

### Pilot Review

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/pilot-review` | POST | ✓ | ✅ | Pilot feedback submission |

### Platform — Retention

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/platform/retention` | GET | ✓ | ✅ | Retention overview |
| `/api/platform/retention/policies` | GET,POST | ✓ | ✅ | Policy management |
| `/api/platform/retention/holds` | GET,POST | ✓ | ✅ | Legal holds |
| `/api/platform/retention/holds/[id]` | GET,PATCH,DELETE | ✓ | ✅ | Hold detail |
| `/api/platform/retention/history` | GET | ✓ | ✅ | Enforcement history |
| `/api/platform/retention/run` | POST | ✓ | ✅ | Manual enforcement |
| `/api/platform/retention/dry-run` | POST | ✓ | ✅ | Dry run |
| `/api/platform/siem` | POST | ✓ | ⚠️ | SIEM event ingestion |

### SCIM v2

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/scim/v2/Groups` | GET,POST | ✓ | ⚠️ | SCIM groups |
| `/api/scim/v2/Groups/[id]` | GET,PUT,PATCH,DELETE | ✓ | ⚠️ | SCIM group detail |
| `/api/scim/v2/Users` | GET,POST | ✓ | ⚠️ | SCIM users |
| `/api/scim/v2/Users/[id]` | GET,PUT,PATCH,DELETE | ✓ | ⚠️ | SCIM user detail |

### WorkflowOS — Downloads & Escalation

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/workflowos/escalation-check` | POST | ✓ | ✅ | Escalation rule check |
| `/api/workflowos/documents/[documentId]/download` | GET | ✓ | ✅ | Document download |
| `/api/workflowos/records/[recordId]/download` | GET | ✓ | ✅ | Record download |
| `/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf` | GET | ✓ | ✅ | PDF export |

### SalesOS — Exports (page-embedded route.ts)

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/sales/accounts/[id]/brief/export` | GET | ✓ | ✅ | Account brief export |
| `/sales/deals/[id]/pilot/export` | GET | ✓ | ✅ | Deal pilot export |

### Miscellaneous

| Route | Methods | Auth | Status | Notes |
|-------|---------|------|--------|-------|
| `/api/custom-product-submit` | POST | ✗ | ✅ | Marketing form submission |

---

## Empty / Prototype Directories

These directories exist but have **no page.tsx or route.ts** — currently inactive shells:

| Directory | Potential Route | Notes |
|-----------|-----------------|-------|
| `src/app/(dashboard)/monitoring/ai/` | `/monitoring/ai` | No page file |
| `src/app/(dashboard)/sales/contacts/` | `/sales/contacts` | No page file |
| `src/app/(dashboard)/settings/mfa/` | `/settings/mfa` | No page file |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total pages (page.tsx)** | ~195 |
| **Total layouts** | ~10 |
| **Total loading states** | ~39 |
| **Total error boundaries** | ~39 |
| **Total not-found pages** | ~4 |
| **Total API routes** | ~36 |
| **Total route files** | ~323 |

### By Product Area

| Product Area | Pages | API Routes | Status |
|-------------|-------|-----------|--------|
| Platform (Marketing) | 35 | 1 | ✅ Active |
| Platform (Dashboard/Settings) | 14 | 10 | ✅ Active / ⚠️ Partial |
| Auth & Onboarding | 4 | 1 | ✅ Active |
| AuditOS | 21 | 2 | ✅ Active |
| auditos (Demo) | 6 | 0 | ✅ Active (no auth) |
| DecisionOS | 24 | 1 | ✅ Active |
| LocalContentOS | 22 | 2 | ✅ Active |
| SalesOS | 32 | 2 | ✅ Active |
| LocalContactOS | 5 | 0 | ✅ Active |
| Content Studio | 5 | 0 | ⚠️ Prototype |
| Office AI | 5 | 1 | ✅ Active |
| WorkflowOS | 8 | 4 | ✅ Active |
| Sunbul | 3 | 0 | ✅ Active |
| RiskOS | 4 | 0 | ⚠️ Prototype |
| Sampling | 2 | 0 | ✅ Active |
| SCIM v2 | 0 | 4 | ⚠️ Prototype |
| System/Health | 0 | 4 | ✅ Active |
| **Total** | **~195** | **~36** | |

---

## Governance Notes

1. **All workspace routes** under `/audit`, `/sales`, `/local-content`, `/contacts`, `/decisions`, `/decisions/gov`, `/workflowos`, `/sunbul`, `/content-studio`, `/risk` require authentication. Legacy `/decision/*` redirects to `/decisions/*`.
2. **All download API routes** are protected with auth + tenant-safe 404 + audit trail (hardened May 2026).
3. **Demo routes** (`/auditos/*`) are the only authenticated-exempt workspace routes — no mutations, no customer data.
4. **Route changes** must update this registry and `docs/source-of-truth/ROUTE_STRATEGY.md`.
5. **New workspace routes** must include error, loading, and not-found states where applicable.

*Last updated: 2026-06-17* — Added /local-content/pilot-readiness (LocalContentOS V3.5 Pilot Readiness Dashboard)
