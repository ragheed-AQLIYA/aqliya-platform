# AQLIYA System Taxonomy

> **Language note (2026-06-09):** Public-facing materials now refer to "Specialized Operating Systems" instead of "Products." The platform is positioned as an "institutional operating platform" first, with capabilities surfaced inside it. See `docs/official/AQLIYA_MASTER_REFERENCE.md §5b` for details.

## Terms

| Term                             | Definition                                                                       | Examples                                | Allowed Usage                                           | Forbidden Usage                                     |
| -------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| **Company**                      | Parent legal and brand entity                                                    | AQLIYA                                  | Use as top-level identity                               | Do not present as a single product                  |
| **Platform Layer**               | Shared underlying technical/governance foundation                                | AQLIYA Intelligence Core                | Use for cross-product/shared foundations                | Do not market as a finished product                 |
| **Product / System**             | Named operational system with route, data, workflow, and governance purpose      | AuditOS, DecisionOS, RiskOS             | Use for real operational systems                        | Do not apply to marketing-only pages                |
| **Shared Application**           | Governed application built on the Core but not a standalone product family       | Office AI Assistant                     | Use for real shared work-assistant style applications   | Do not reframe as product without explicit decision |
| **Custom Workspace**             | Real governed workspace tailored to a client-specific or custom workflow         | WorkflowOS                              | Use for the canonical governed workflow workspace       | Do not hide if it exists                            |
| **Legacy Redirect Alias**        | Permanent redirect route family to a canonical workspace                         | Sunbul                                  | Use only for legacy `/sunbul/*` redirect compatibility  | Do not describe as separate product or workspace     |
| **Demo**                         | Guided, read-only, mock-backed walkthrough                                       | `/auditos`                              | Use only for explicit demo surfaces                     | Do not present as live workspace                    |
| **Prototype / Internal Preview** | Incomplete or local-state-only workspace-like surface                            | `/sales`, `/organizations`, `/settings` | Use to label real but incomplete surfaces               | Do not present as v0.1-complete product             |
| **Marketing-only Product Page**  | Product description with no operational implementation                           | SimulationOS, SalesOS marketing page    | Use on `/products/*`                                    | Do not claim as working product                     |
| **Strategic / Future**           | Planned direction without implemented route/workflow/data proof                  | On-Prem, Air-Gapped, Studio             | Use for roadmap truthfulness                            | Do not present as available                         |

## Key Distinctions

### AuditOS

- `AuditOS` = product/system
- `/audit` = real governed workspace
- `/auditos` = demo only

### DecisionOS

- Real product/system
- Real workspace under `/decisions`
- Included in v0.1 as active adjacent system

### RiskOS

- Real AuditOS-adjacent risk workspace at `/risk/*`
- Dashboard with KPI cards, risk distribution, assessments table, model list
- Assessment detail: score bars, procedure steps, audit trail, JSON export
- L6 Production-hardened — not marketed as standalone product
- Uses `AuditRiskModel`/`AuditRiskAssessment` Prisma models (AuditOS schema)

### Office AI Assistant

- Real governed shared application
- Real routes at `/assistant/*`
- Not a standalone product claim

### WorkflowOS and Sunbul

- `WorkflowOS` = canonical governed workspace at `/workflowos/*` (L6 Production-hardened)
- `Sunbul` = legacy redirect alias only; `/sunbul/*` routes are `permanentRedirect(302)` to matching `/workflowos/*` routes
- Prisma models retain `Sunbul*` prefixes for schema compatibility; product identity is WorkflowOS
- Neither should be hidden, and WorkflowOS should not be promoted into a general AQLIYA product claim without further product decisions

### SalesOS, organizations, settings

- `SalesOS` current runtime surface is L6 Production-hardened commercial intelligence workspace at `/sales/*` (32 routes, 878+ tests across 86 test files, full boundaries, 12 intelligence sub-engines, CRM sync, forecasting).
- `/organizations/*` surface is L5 pilot-ready with real Prisma data.
- `/settings` generic surface is internal preview/prototype only (L2 shell for main page, L4 for sub-routes).
- These must not be shown as implemented v0.1 operational modules (except SalesOS which is production-hardened).

### ContentStudio — Operational Content Workspace

**Identity:** ContentStudio is AQLIYA's **Operational Content Workspace** — a governed platform for creating, reviewing, approving, publishing, and versioning institutional content. It is a **standalone governed workspace**, not a subsystem of any other product.

**Scope:**
- Content lifecycle management: DRAFT → IN_REVIEW → APPROVED → PUBLISHED → ARCHIVED
- Versioning with full history and restore capability
- Template system with variable interpolation (e.g., `{{projectName}}`)
- PDF export with bilingual Arabic/English rendering
- Audit trail via `writePlatformAuditLog` for all mutations
- Role-based access via authenticated routes + server-side guards
- Multiple workspaces per organization for content domain separation

**Prisma models:** ContentWorkspace, ContentItem, ContentVersion, ContentTemplate

**What ContentStudio is NOT:**
- NOT a CMS (no web publishing, no public rendering, no SEO/metadata for web)
- NOT a Document Management System (no folder hierarchy, no complex metadata taxonomy, no file storage)
- NOT a subsystem of LocalContentOS (LocalContentOS = supplier/local content scoring & intelligence; ContentStudio = general content workspace)
- NOT a marketing tool (no analytics, no A/B testing, no campaign management)
- NOT a documentation platform (no wiki-style linking, no cross-reference engine)

**Boundaries with adjacent products:**
- **LocalContentOS:** LocalContentOS handles supplier scoring, local content percentage calculation, tender matching, ERP integration, and spend analytics. ContentStudio handles general content creation/review/publishing. The unified review abstraction layer (`src/lib/platform/reviews/`) supports both independently.
- **Knowledge Foundation:** Knowledge Foundation handles governed promotion pipelines with SHA-256 release packages and structured diff engines. ContentStudio handles simpler content versioning for operational documents.
- **Office AI Assistant:** Assistant generates draft content as suggestions. ContentStudio can be the target workspace where those drafts are stored, reviewed, and published.

**Current maturity:** L6 Production-hardened (2026-07-03)
- Full error/loading/not-found boundaries on all 5 routes
- Real Prisma persistence (5 models: ContentWorkspace, ContentItem, ContentVersion, ContentTemplate, ContentEvidence)
- 5 route groups (dashboard, workspace detail, content create, content detail, templates)
- Full lifecycle with 5 states + versioning with restore
- Evidence linking with file upload/download/delete/audit trail
- PDF export with bilingual Arabic/English rendering (Noto Naskh Arabic), markdown-aware formatting, metadata headers
- Audit trail on all mutations via writePlatformAuditLog
- ~125 tests across 3 test files (content-studio-service, content-studio-actions, content-export)
- Arabic-first RTL UI
- Seed data: 3 workspaces, 7 content items, 12 versions, 2 templates, 4 evidence records

**Target taxonomy classification:** "Specialized Operating System" — Operational Content Workspace

### Institutional Memory

- Real governed workspace at `/institutional-memory/*`
- Prisma models: InstitutionalMemoryEvent, InstitutionalMemoryCollection
- Used for collections, events, and graph views of institutional knowledge
- Currently undocumented — classified as internal capability

### Sampling

- Real workspace at `/sampling/*`
- Prisma models: SamplingPlan, SamplingResult, SamplingReview, SamplingEvidence
- Used by AuditOS for engagement sampling workflows
- Middleware-protected route

### Knowledge Foundation

- Real governance capability at `/knowledge-foundation/*` (inside dashboard)
- Full governed promotion pipeline for institutional knowledge
- Version lifecycle: DRAFT→APPROVED→RELEASED→ACTIVE→DEPRECATED
- Documented in PRODUCT_STATUS_MATRIX.md as L4 usable

### LocalContentOS and SimulationOS

- `LocalContentOS` = strategic second product with real workspace at `/local-content/*` (L6 Production-hardened). All 9 LC gaps closed: supplier scoring engine, tender matching, multi-reviewer approval routing, classification rule admin, Arabic PDF font fidelity, spend analytics, trend analytics, ERP integration (SAP/Oracle/CSV), Content Studio scope definition. 27 routes with full error/loading/not-found boundaries. 321+ tests PASS. AI quality: 100% pilot readiness (7/7 GREEN), 95% acceptance, 88% confidence gradient. Marketing page at `/products/local-content` is not the workspace.
- `SimulationOS` = current marketing/category label, not standalone runtime

## Release-Scope Mapping

| Area                | Release Inclusion Status                | Maturity       | Customer Demo Status          |
| ------------------- | --------------------------------------- | -------------- | ----------------------------- |
| AQLIYA Platform     | Included in v0.1                        | **L6 Production-hardened** | Safe to show with explanation |
| AuditOS             | Included as pilot-ready product         | L6 Production-hardened | Safe to show                  |
| DecisionOS          | Included as active adjacent system      | L6 Production-hardened | Safe to show with explanation |
| RiskOS              | AuditOS-adjacent risk workspace         | L6 Production-hardened | Safe to show with explanation |
| Office AI Assistant | Included as governed shared application | L6 Production-hardened | Safe to show with explanation |
| WorkflowOS          | Included as governed workspace          | L6 Production-hardened | Safe to show with explanation |
| Sunbul              | Legacy redirect alias over WorkflowOS   | Redirect alias | Internal only                 |
| auditos             | Included as demo only                   | L1 Marketing   | Demo only                     |
| ContentStudio       | Included as operational content workspace | L6 Production-hardened | Safe to show with explanation |
| Institutional Memory| Governance capability                   | L6 Production-hardened | Safe to show with explanation |
| Knowledge Foundation| Governance capability                   | L6 Production-hardened | Safe to show with explanation |
| SalesOS             | Commercial intelligence workspace       | L6 Production-hardened | Safe to show with explanation |
| LocalContactOS      | Governed relationship workspace         | L6 Production-hardened | Safe to show with explanation |
| SSO (SAML/OIDC)     | Enterprise auth capability              | L6 Production-hardened | Safe to show with explanation |
| SCIM v2 Provisioning| Identity management (SCIM API)          | L6 Production-hardened | Safe to show with explanation |
| LocalContentOS      | Included as pilot-ready with conditions | L6 Production-hardened | Safe to show with explanation |
