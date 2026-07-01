# AQLIYA Platform Inventory — Wave 4D Final

**Date:** 2026-05-31  
**Agent:** 4D  
**Status:** DONE

---

## Product Inventory

| # | Product/System | Route(s) | Current Level | DoD Met | Notes |
|---|---------------|----------|---------------|---------|-------|
| 1 | **AQLIYA Platform** | `/`, shared authenticated surfaces | L4 | ✅ | PlatformOrganization, ClientWorkspace, Project with createdById |
| 2 | **AQLIYA Intelligence Core** | `src/core/` (shared services) | L4 | ✅ | 17 modules: ai, audit, evidence, workflow, product-runtime, identity, notifications, events, tasks, output, memory, studio, observability, security, tenant, access, governance |
| 3 | **Core Access Control** | `src/core/access/` | L4 | ✅ | AccessControlService with RBAC + tenant isolation + audit logging |
| 4 | **Core Governance Engine** | `src/core/governance/` | L4 | ✅ | GovernanceService with 12 transitions, role gates, evidence reqs |
| 5 | **Core Identity** | `src/core/identity/` | L4 | ✅ | InMemoryIdentityService |
| 6 | **Core Notifications** | `src/core/notifications/` | L4 | ✅ | InMemoryNotificationService |
| 7 | **Core Observability** | `src/core/observability/` | L4 | ✅ | InMemoryObservabilityService |
| 8 | **Core Security** | `src/core/security/` | L4 | ✅ | InMemorySecurityService |
| 9 | **Core Tenant** | `src/core/tenant/` | L4 | ✅ | InMemoryTenantService |
| 10 | **Core Memory Engine** | `src/core/memory/` | L4 | ✅ | InMemoryMemoryService — strategic institutional memory |
| 11 | **Core Studio** | `src/core/studio/` | L2 | ⚠️ | StudioBuilderService + types exist. No routes, no UI. Strategic future layer. |
| 12 | **Core Output Service** | `src/core/output/` | L4 | ✅ | InMemoryOutputService |
| 13 | **Core Task Service** | `src/core/tasks/` | L4 | ✅ | InMemory + Prisma TaskService, factory pattern |
| 14 | **Core Events** | `src/core/events/` | L2 | ⚠️ | Types only. No runtime event bus. |
| 15 | **Core AI** | `src/core/ai/` | L4 | ✅ | AIRouter with providers (OpenAI, Anthropic, Mock), prompt registry, safety classifier, cost meter |
| 16 | **Core Audit** | `src/core/audit/` | L4 | ✅ | AuditLedger + PrismaAuditLedger |
| 17 | **Core Evidence** | `src/core/evidence/` | L4 | ✅ | EvidenceStore + PrismaEvidenceStore |
| 18 | **Core Workflow** | `src/core/workflow/` | L4 | ✅ | WorkflowEngine + PrismaWorkflowEngine |
| 19 | **Core Product Runtime** | `src/core/product-runtime/` | L4 | ✅ | ProductRegistry + defineProduct |
| 20 | **AuditOS** | `/audit/*` (22+ routes), `/auditos/*` (5 demo routes) | L5 | ✅ | Full workspace, demo, evidence, exports, AI review, pilot-ready. Some L6 elements. |
| 21 | **DecisionOS** | `/decisions/*` (18 routes), `/intelligence/sectors/*` | L5 | ✅ | Server-side submit/approve/reject, evidence download, export gate |
| 22 | **LocalContentOS** | `/local-content/*` (15 routes) | L6 | ✅ | Production-hardened: query-optimizer, monitoring, export-tracker, operator manual, 15 error boundaries |
| 23 | **Office AI Assistant** | `/assistant/*`, `/assistant/[taskId]` | L5 | ✅ | File extraction, Core AI adapter, review/approval, audit trail |
| 24 | **WorkflowOS** | `/workflowos/*`, `/workflowos/admin`, `/workflowos/clients/*/records/*` | L5 | ✅ | Governed workflow workspace, not-found.tsx, seed data |
| 25 | **Sunbul** | `/sunbul/*` (redirect alias to WorkflowOS) | N/A | ✅ | pureRedirect(302) wrappers only |
| 26 | **SalesOS** | `/sales/*`, `/sales/accounts/*`, `/sales/opportunities/*`, `/sales/command-center` | L5 | ✅ | Pilot-ready with smoke test. Loading/error states, Core files scaffold, governed AI |
| 27 | **SimulationOS** | `/products/simulation` | L1 | ⚠️ | Marketing-only. No workspace. |
| 28 | **LocalContactOS** | — | L0 | ❌ | Future product |
| 29 | **RiskOS** | — | L0 | ❌ | Future product |
| 30 | **ComplianceOS** | — | L0 | ❌ | Future product |
| 31 | **LegalOS** | — | L0 | ❌ | Future product |
| 32 | **GovOS** | — | L0 | ❌ | Future product |
| 33 | **On-Prem / Private** | — | L0 | ❌ | Strategic future |
| 34 | **Air-Gapped** | — | L0 | ❌ | Strategic future |
| 35 | **Local AI Runtime** | — | L0 | ❌ | Strategic future |
| 36 | **Custom Product Inquiry** | `/custom-product`, `/api/custom-product-submit` | L4 | ✅ | Active commercial funnel |

## Route Inventory

### Marketing Routes (public)
- `/`, `/about`, `/contact`, `/deployment`, `/engagement-models`, `/executive-brief`, `/governance`, `/how-we-work`, `/insights`, `/platform`, `/pilot-proof`, `/proof-library`, `/security`, `/terms`, `/privacy`, `/use-cases`, `/case-studies`, `/demo`, `/buyers/*`, `/custom-product`
- `/products`, `/products/audit`, `/products/decision`, `/products/simulation`, `/products/sales`, `/products/local-content`

### Auth Routes (public)
- `/login`, `/access-denied`

### Demo Routes (public, mock-only)
- `/auditos`, `/auditos/trial-balance`, `/auditos/mapping`, `/auditos/statements`, `/auditos/evidence`, `/auditos/traceability`

### Governed Workspaces (protected)
- `/audit/*` (22+ routes) — AuditOS
- `/decisions/*` (18 routes) — DecisionOS
- `/local-content/*` (15 routes) — LocalContentOS
- `/assistant/*` (2 routes) — Office AI Assistant
- `/workflowos/*` (3 routes) — WorkflowOS
- `/sales/*` (11 routes) — SalesOS
- `/sunbul/*` (3 routes — redirect only)
- `/intelligence/sectors/*` (2 routes) — Sector intelligence

### Admin/Settings (protected)
- `/settings`, `/settings/workspaces`, `/settings/platform-organization`, `/settings/audit-logs`
- `/monitoring`
- `/platform/institutional`, `/platform/search`

### Prototype (protected)
- `/organizations`, `/organizations/[id]`, `/organizations/sunbul`

### API Routes
- `/api/auth/[...nextauth]` — NextAuth v5
- `/api/health` — Public health check
- `/api/custom-product-submit` — Public form
- `/api/pilot-review` — Public form
- `/api/metrics` — Admin-only
- `/api/pilot/ops` — Protected ops diagnostics
- `/api/audit/evidence/*/download` — Protected download
- `/api/audit/engagements/*/exports/*` — Protected export
- `/api/decisions/*/evidence/*/download` — Protected download
- `/api/office-ai/download` — Protected download
- `/api/local-content/projects/*/evidence/*/download` — Protected download
- `/api/local-content/projects/*/reports/*/download` — Protected download
- `/api/sales/:path*` — SalesOS API
- `/api/core/:path*` — Core API
- `/api/workflowos/clients/*/records/*/export/pdf` — Protected export
- `/api/workflowos/documents/*/download` — Protected download

## Documentation Alignment

| Doc | Status | Notes |
|-----|--------|-------|
| `docs/DOCUMENTATION_AUTHORITY.md` | ✅ Matches | Hierarchy and conflict rules current |
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | ⚠️ Needs update | Missing Wave 3/4 results, Studio, Memory Engine |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | ⚠️ Needs update | Missing Phase 13/14 details for Wave 3+4 |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | ⚠️ Needs update | Missing Studio routes, Memory routes, latest SalesOS routes |
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | ⚠️ Needs update | Missing memory/studio Core modules |
| `README.md` | ⚠️ Needs update | Needs Quick Start improvements, repo map, CI badge |
| `AGENTS.md` | ✅ Matches | Current |

## Discrepancies Found

1. **AQLIYA_MASTER_REFERENCE.md §6**: SalesOS listed at L4 — should be L5 (Pilot-ready per Wave 3B). LocalContentOS listed at L5 — should be L6 (Production-hardened per Wave 3D). Office AI at L4 — should be L5. WorkflowOS at L4 — should be L5.
2. **AQLIYA_MASTER_REFERENCE.md**: Missing Memory Engine and Studio modules in Core taxonomy.
3. **ROUTE_STRATEGY.md**: SalesOS route notes still say "L5 with conditions" — needs updating to reflect Wave 3B L5 status.
4. **AQLIYA_ARCHITECTURE.md**: Missing `core/memory/`, `core/studio/`, `core/output/`, `core/tasks/`, `core/events/` modules.
5. **Not-found coverage**: Missing not-found.tsx for `/audit`, `/local-content`, `/sales`, `/assistant`, `/organizations`, `/settings`, `/sunbul` top-level routes.
6. **Metadata coverage**: All product layouts (sales, audit, local-content, workflowos, dashboard) missing metadata exports.

## Reconciliation

All discrepancies will be corrected in the updates below. Identity/governance claims remain consistent with v1.1 doctrine. Implementation status updates follow code reality.
