# AQLIYA Architecture (aligned with v1.1 — repositioned)

## Official Hierarchy

```
AQLIYA Platform Company
│
├── AQLIYA Intelligence Core (shared platform layer)
│   ├── AI Orchestration Engine
│   ├── Governance Engine
│   ├── Workflow Engine
│   ├── Evidence Graph
│   ├── Institutional Memory
│   ├── RBAC / Permissions
│   ├── Audit Logs
│   ├── Model Governance
│   ├── Document Intelligence
│   ├── Reporting Engine
│   └── Deployment Layer
│
├── Shared Applications (built on Core)
│   └── Office AI Assistant      (/assistant) — governed shared application
│
├── AQLIYA Studio (custom systems layer)
│
├── Specialized Operating Systems (capabilities — built on Core)
│   ├── AuditOS                 (audit workflow — L5 pilot-ready)
│   ├── DecisionOS              (decision governance — L5 pilot-ready)
│   ├── LocalContentOS          (local content & supply chain — L5 conditional)
│   ├── SalesOS                 (business development — early access)
│   └── SimulationOS            (capability label — not standalone)
│
├── Custom / Client-Specific Workspaces
│   └── WorkflowOS              (/workflowos) — governed custom workflow (L5 pilot-ready)
│
├── Workspaces (execution environments)
│   ├── AuditOS Workspace       (/audit)
│   ├── DecisionOS Workspace    (/decisions, /intelligence/sectors)
│   ├── Office AI Workspace     (/assistant)
│   ├── WorkflowOS Workspace    (/workflowos) — L5 pilot-ready
│   ├── Institutional Memory   (/institutional-memory) — L4 knowledge graph
│   ├── Sunbul Workspace        (/sunbul) — legacy redirect → /workflowos
├── Governance (cross-cutting)
│   ├── RBAC                     (multi-level permissions)
│   ├── Audit Trail              (immutable event log)
│   ├── Evidence Chain           (source-to-output traceability)
│   ├── AI Governance            (human-in-the-loop enforcement)
│   ├── Tenant Isolation         (per-organization data boundaries)
│   └── Deployment Controls      (Cloud / Private / Air-Gapped)
│
├── Proof Center (public evaluation)
│   ├── Interactive Demo         (/demo) — no-login walkthrough
│   ├── Executive Brief          (/executive-brief) — 4-page summary
│   ├── Pilot Framework          (/pilot-proof) — 28 evaluation criteria
│   ├── Evidence Library         (/proof-library) — sample outputs
│   └── Security Summary         (/security) — RBAC, audit, encryption
│
└── Marketing Pages
    ├── Homepage                 (/) — platform positioning, no product names
    ├── Platform                 (/platform) — Core + operating systems
    ├── Sectors                  (/industries) — audit, government, enterprise, professional services
    ├── Proof Center             (/proof) — all evaluation assets in one place
    ├── Governance               (/governance) — trust architecture
    ├── About                    (/about) — company + team
    ├── Operating System Detail  (/products/*) — deep-dive references
    ├── Custom Systems           (/custom-product)
    ├── Engagement Models        (/engagement-models)
    ├── Buyer Guides             (/buyers/*)
    ├── Insights                 (/insights/*)
    └── Case Studies             (/case-studies)

Future products (not yet implemented): RiskOS, ComplianceOS, LegalOS, GovOS.
Deployment models: Cloud (active), Private/On-Prem (strategic), Air-Gapped (strategic).
```

## Layer Definitions

- **Platform Company**: The brand and product entity. Must be presented as a platform first, not a collection of products.
- **AQLIYA Intelligence Core**: The shared platform layer. All operating systems built on it inherit governance, evidence graph, RBAC, and audit trail automatically.
- **Specialized Operating System**: A capability or workflow path built on the Core. Referred to as "نظام تشغيل" / "مسار تشغيلي" in Arabic. Not marketed as standalone products.
- **Shared Application**: A governed application built on Core that is real in code but not a standalone product category.
- **Custom Workspace**: A governed implementation for a client-specific or custom workflow.
- **Workspace**: A governed operational execution environment with auth, access control, and durable data.
- **Proof Center**: A consolidated public-facing section that centralizes demo, executive brief, pilot framework, evidence library, and security summary in one place.
- **Marketing Page**: Public-facing content describing a capability. OK to exist without a workspace.

## Route Model

| Route                                    | Purpose                                     | Layer                  |
| ---------------------------------------- | ------------------------------------------- | ---------------------- |
| `/`                                      | AQLIYA homepage (platform positioning)      | Company/Marketing      |
| `/platform`                              | AQLIYA Intelligence Core + operating systems| Company/Marketing      |
| `/industries`                            | Sectors page (audit, government, enterprise)| Company/Marketing      |
| `/proof`                                 | Proof Center (all evaluation assets)        | Company/Marketing      |
| `/governance`                            | Trust architecture (RBAC, audit, AI)        | Company/Marketing      |
| `/about`                                 | Company + team                              | Company/Marketing      |
| `/security`                              | Enterprise security overview                | Company/Marketing      |
| `/deployment`                            | Deployment models (Cloud, Private, Gapped)  | Company/Marketing      |
| `/demo`                                  | Interactive demo landing page               | Company/Marketing      |
| `/pilot-proof`                           | Pilot evaluation framework                  | Company/Marketing      |
| `/proof-library`                         | Sample evidence outputs                     | Company/Marketing      |
| `/executive-brief`                       | Executive summary                           | Company/Marketing      |
| `/engagement-models`                     | Partnership/engagement models               | Company/Marketing      |
| `/contact`                               | Pilot request + contact form                | Company/Marketing      |
| `/custom-product`                        | Custom system design inquiry                | Company/Marketing      |
| `/products`                              | Operating system catalog (references)       | Company/Marketing      |
| `/products/audit`                        | AuditOS detail page                         | Marketing/Reference    |
| `/products/decision`                     | DecisionOS detail page                      | Marketing/Reference    |
| `/products/local-content`                | LocalContentOS detail page                  | Marketing/Reference    |
| `/products/sales`                        | SalesOS detail page                         | Marketing/Reference    |
| `/products/simulation`                   | Redirects to /products                      | Marketing/Reference    |
| `/buyers/*`                              | Buyer persona guides                        | Company/Marketing      |
| `/insights/*`                            | Thought leadership articles                 | Company/Marketing      |
| `/case-studies`                          | Case study index                            | Company/Marketing      |
| `/privacy`                               | Privacy policy                              | Company/Legal          |
| `/terms`                                 | Terms of service                            | Company/Legal          |
| `/audit`                                 | AuditOS governed workspace                  | Workspace              |
| `/auditos`                               | AuditOS guided demo                         | Demo                   |
| `/auditos/*`                             | Demo sub-pages (trial-balance, mapping...)  | Demo                   |
| `/decisions`                             | DecisionOS workspace                        | Workspace              |
| `/assistant`                             | Office AI Assistant workspace               | Shared Application     |
| `/workflowos`                            | WorkflowOS governed workspace               | Custom Workspace       |
| `/sunbul`                                | Legacy redirect → /workflowos               | Custom Workspace Alias |
| `/local-content`                         | LocalContentOS governed workspace (14 routes including review-center, quality-dashboard)           | Workspace              |
| `/sales`                                 | SalesOS prototype dashboard                 | Workspace/Prototype    |
| `/contacts`                              | LocalContactOS governed workspace           | Workspace              |
| `/organizations`                         | Protected mock organizations surface        | Workspace/Prototype    |
| `/institutional-memory`              | Institutional Memory governed workspace     | Workspace              |
| `/institutional-memory/collections`  | Institutional Memory collections            | Workspace              |
| `/institutional-memory/graph`        | Institutional Memory knowledge graph view   | Workspace              |
| `/settings`                              | Protected generic settings preview          | Workspace/Prototype    |
| `/login`                                 | Authentication                              | Internal               |
| `/access-denied`                         | Access control                              | Internal               |

## Download Security Standard

Every file download API route must implement these three layers in order:

1. **Authentication** — Require valid session at entry.
2. **Tenant-safe access** — Return **404 on any failure**. Never return 403 for "exists but not yours".
3. **Audit trail** — Log successful downloads via `writePlatformAuditLog`.

Response headers: `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`.

**Enforced on**: Sunbul documents, Office AI outputs, AuditOS evidence, DecisionOS evidence, LocalContentOS evidence.

## Reality Alignment Notes

- AQLIYA is positioned as an **institutional operating platform**, not a product company. The homepage presents the platform first; operating systems are surfaced inside `/platform#capabilities`.
- `Office AI Assistant` is implemented in code today as a governed shared application.
- `WorkflowOS` is the canonical governed workflow workspace at `/workflowos/*` (L5 Pilot-ready). Template workflows, SLA monitoring, gated export, 31 action tests, seed data. Not full L6.
- `Sunbul` is a legacy redirect alias: `/sunbul/*` routes → `permanentRedirect(302)` to `/workflowos/*`.
- `/organizations`, `/settings`, and `/sales` are protected surfaces — not yet v0.1 workspace complete.
- `LocalContentOS` is implemented as a governed workspace at `/local-content/*` with 20+ routes, bilingual UI, evidence upload, binary PDF/XLSX exports, audit trail, AI recommendation engine with knowledge retrieval (V3.5), simulation explainability, recommendation feedback loop, and pilot readiness dashboard. **L5 Pilot-ready** — AI quality re-run achieved 100% readiness (7/7 GREEN), 95% acceptance, 88% confidence gradient. See `docs/deliverables/mission-summary-2026-06-17.md`. AI Quality Dashboard at `/local-content/quality-dashboard` (2026-06-17): composite quality score, 4-bucket confidence distribution, 4-week acceptance rate time-series, inline audit events table, bilingual PDF export. Review Center at `/local-content/review-center` with inline audit event viewer and export controls.
- `DecisionOS` is a pilot-ready governed workspace at `/decisions/*` (L5). Full lifecycle (draft → in_review → approved/rejected), evidence upload, bilingual PDF export, 42 action tests, seed data.
- `AuditOS` is the most mature operating system with 12-station audit lifecycle, ISQM1 quality management, and interactive demo at `/auditos`.
- **Schema v0.2 (2026-05-28)**: `createdById` added to 10 models, `DecisionEvidence` model added, `platformOrganizationId` added to SunbulClient.
- **Website repositioning (2026-06-09)**: Navigation changed to `المنصة | القطاعات | الإثبات | الحوكمة | عن عقلية`. Homepage redesigned with 9-section platform-first architecture. Products moved inside `/platform#capabilities`. Proof Center established at `/proof`. Sectors page at `/industries`.
- **Script Utils (2026-06-17)**: `scripts/db-utils/prisma.mjs` created as a shared Prisma client for scripts (bypasses `server-only` guard). All script-based database operations should import from this module instead of creating inline PrismaClients.

### Institutional Memory Architecture

Institutional Memory bridges products via the `InstitutionalMemoryEvent` model, creating a cross-product knowledge graph.

#### Cross-Product Linking Pattern

```
sourceProduct/sourceEntityId → eventType → targetProduct/targetEntityId

Example:
  decisions/decision-abc → "generated_by" → sales/account-xyz
  workflow/record-def → "linked" → contacts/contact-456
  audit/engagement-ghi → "referenced" → decisions/decision-abc
```

**Event types**: `linked`, `referenced`, `generated_by`, `approved_by`, `related_to`

**Models**:
- `InstitutionalMemoryEvent` — individual cross-product link with sourceProduct, sourceEntityId, sourceEntityType, targetProduct, targetEntityId, targetEntityType, eventType, description, metadata, confidence
- `InstitutionalMemoryCollection` — saved query/filter for organizing related links (`filterCriteria` JSON field)
- `IntelligenceGraphNode` — named graph nodes (entity, concept, insight, document, topic) with optional vector embeddings
- `IntelligenceGraphEdge` — typed relationships between nodes (related_to, derives_from, evidence_for, contradicts, supports, references)

#### Collections

Collections allow users to save specific queries for later reference. The `filterCriteria` field stores the query parameters, enabling dynamic reloading.

#### Knowledge Graph View

Located at `/institutional-memory/graph`. Uses `IntelligenceGraphNode` and `IntelligenceGraphEdge` models for interactive visualization. Supports finding paths between entities, subgraph extraction, and node neighbor exploration.

#### Agent Memory Integration

SalesOS integrates with Institutional Memory via `src/lib/sales/institutional-memory-sync.ts`, which collects memory candidates from various SalesOS activities (account updates, deal changes, etc.) and syncs them to the knowledge graph. The `src/lib/sales/institutional-memory-shared.ts` module provides shared types and utility functions for cross-product memory.

- **Script Utils (2026-06-17)**: `scripts/db-utils/prisma.mjs` created as a shared Prisma client for scripts (bypasses `server-only` guard). All script-based database operations should import from this module instead of creating inline PrismaClients.
