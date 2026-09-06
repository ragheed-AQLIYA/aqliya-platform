# Official Hierarchy

﻿# AQLIYA Architecture (aligned with v1.1 — repositioned)

## Official Hierarchy

```
AQLIYA Platform Company
│
├── AQLIYA Intelligence Core (shared platform layer)
│   ├── Platform Kernel 2.0 (single import surface — @/lib/kernel)
│   ├── AI Orchestration Engine
│   ├── Security Engine (prompt sanitization)
│   ├── Governance Engine
│   ├── Workflow Engine
│   ├── Evidence Graph
│   ├── Institutional Memory
│   ├── RBAC / Permissions
│   ├── Audit Logs (PlatformAuditLog — unified, single-write, productKey-scoped)
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
│   ├── AuditOS                 (audit workflow — L5 pilot-ready conditional)
│   ├── DecisionOS              (decision governance — **L6 production-hardened**)
│   ├── LocalContentOS          (local content & supply chain — L5 pilot-ready conditional)
│   ├── SalesOS                 (business development — L5 pilot-ready conditional)
│   └── SimulationOS            (capability label — not standalone)
│   ├── RiskOS                  (audit-adjacent risk workspace — L5 pilot-ready conditional)
│   ├── LocalContactOS          (governed relationship intelligence — L5 pilot-ready conditional)
│   ├── ContentStudio           (operational content workspace — L5 pilot-ready conditional)
│   ├── Knowledge Foundation    (governed versioning — L5 pilot-ready conditional)
│   └── Institutional Memory    (cross-product knowledge graph — L5 pilot-ready conditional)
│
├── Custom / Client-Specific Workspaces
│   └── WorkflowOS              (/workflowos) — governed custom workflow (L5 pilot-ready conditional)
│
├── Workspaces (execution environments)
│   ├── AuditOS Workspace       (/audit)
│   ├── DecisionOS Workspace    (/decisions, /intelligence/sectors)
│   ├── Office AI Workspace     (/assistant)
│   ├── WorkflowOS Workspace    (/workflowos) — L5 pilot-ready conditional
│   ├── Institutional Memory   (/institutional-memory) — L5 knowledge graph
│   ├── Sunbul Workspace        (/sunbul) — legacy redirect → /workflowos
├── Governance (cross-cutting)
│   ├── RBAC                     (multi-level permissions)
│   ├── Audit Trail              (immutable event log — unified PlatformAuditLog)
│   ├── Evidence Chain           (source-to-output traceability)
│   ├── AI Governance            (human-in-the-loop enforcement)
│   ├── Tenant Isolation         (per-organization data boundaries)
│   ├── Knowledge Foundation Versioning  (promotion pipeline for institutional knowledge)
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

Future products (not yet implemented): ComplianceOS, LegalOS, GovOS.
Deployment models: Cloud (active), Private/On-Prem (strategic), Air-Gapped (strategic).
```

## Layer Definitions

- **Platform Company**: The brand and product entity. Must be presented as a platform first, not a collection of products.
- **Platform Kernel 2.0**: The single import surface for all platform services (`@/lib/kernel`). All consumers import through kernel bridges; direct imports to internal modules are forbidden. Provides contracts, implementations, plugin system, event bus, and CQRS projections.
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
| `/local-content`                         | LocalContentOS governed workspace (27 routes, L5 pilot-ready conditional)           | Workspace              |
| `/sales`                                 | SalesOS governed workspace (32 routes, L5 pilot-ready conditional)                 | Workspace              |
| `/contacts`                              | LocalContactOS governed workspace (L5 pilot-ready conditional)           | Workspace              |
| `/risk`                                  | RiskOS governed workspace (L5 pilot-ready conditional)                   | Workspace              |
| `/organizations`                         | Protected organizations surface (L5 pilot-ready)                     | Workspace/Prototype    |
| `/institutional-memory`              | Institutional Memory governed workspace (L5)     | Workspace              |
| `/institutional-memory/collections`  | Institutional Memory collections (L5)            | Workspace              |
| `/institutional-memory/graph`        | Institutional Memory knowledge graph view (L5)   | Workspace              |
| `/settings`                              | Protected generic settings preview          | Workspace/Prototype    |
| `/login`                                 | Authentication                              | Internal               |
| `/access-denied`                         | Access control                              | Internal               |

## Platform Kernel 2.0

**Status:** Active — Sprint 7 (Consumer Migration) complete.  
**Import surface:** `@/lib/kernel`  
**Import rule:** All consumers must import from `@/lib/kernel`, never directly from platform modules.

The Platform Kernel is the single import surface for all platform services. It provides a stable abstraction layer between consumers (routes, actions, components) and the underlying platform modules. Direct imports to internal module paths are forbidden.

### Kernel Bridges

Each bridge wraps a platform service behind a stable contract:

| Bridge             | Path                                      | Wraps                                   |
| ------------------ | ----------------------------------------- | --------------------------------------- |
| `auth.ts`          | `@/lib/kernel/auth`                       | NextAuth session, currentUser           |
| `feature-flags.ts` | `@/lib/kernel/feature-flags`              | Feature flag evaluation                 |
| `cache.ts`         | `@/lib/kernel/cache`                      | Platform caching (getCachedOrFetch)     |
| `authorization.ts` | `@/lib/kernel/authorization`              | RBAC, tenant guard, permission checks   |
| `audit.ts`         | `@/lib/kernel/audit`                      | Audit log writes, audit trail queries   |
| `knowledge.ts`     | `@/lib/kernel/knowledge`                  | Institutional Memory, knowledge graph   |
| `governance.ts`    | `@/lib/kernel/governance`                 | Review/approval workflows, governance   |
| `workflowos.ts`    | `@/lib/kernel/workflowos`                 | Workflow engine, task lifecycle          |
| `prisma.ts`        | `@/lib/kernel/prisma`                     | Database client (server-only boundary)  |

### Kernel Contracts

20+ TypeScript interfaces defined in `src/lib/kernel/contracts/` establish the public API surface for every bridge. These contracts are the type-level boundary between kernel consumers and implementations.

### Kernel Implementations

`src/lib/kernel/implementations/` contains the concrete wrappers for each service. Implementations may change; contracts and import paths remain stable.

### Plugin System

Products register via the `ProductPlugin` interface and `ProductRegistry`. Plugins declare capabilities, event subscriptions, and workspace routes. Currently registered: `SalesOSPlugin`, `AuditOSPlugin`, `LocalContentOSPlugin`, `DecisionOSPlugin`.

### Event Bus

Domain event bus with:
- Named event types per product/domain
- Dead-letter queue for failed handlers
- Retry with exponential backoff
- Event history for audit and replay

### CQRS

Projection framework providing read models for cross-product queries. Read models are materialized from domain events and optimized for specific query patterns.

### Consumer Migration

Sprint 7 migrated **691 files** from direct module imports (`@/lib/sales/...`, `@/lib/audit/...`, etc.) to kernel imports (`@/lib/kernel/*`). All platform consumers now route through the kernel.

### Migration Enforcement

New code importing directly from platform modules (bypassing the kernel) will fail review. The kernel is the only sanctioned import surface for platform services.


## Audit Log Consolidation (2026-07-25)

**Status:** Complete — 8→1 model merge.

### Before (8 legacy models)
Each product maintained its own audit event model, creating schema fragmentation and dual-write complexity:

| Legacy Model              | Product        | Status      |
| ------------------------- | -------------- | ----------- |
| `AuditLog`                | DecisionOS     | Removed     |
| `AuditEvent`              | AuditOS        | Removed     |
| `SunbulAuditEvent`        | WorkflowOS     | Removed     |
| `WorkflowAuditEvent`      | WorkflowOS     | Removed     |
| `SalesAuditEvent`         | SalesOS        | Removed     |
| `LocalContentAuditEvent`  | LocalContentOS | Removed     |
| `DecisionAuditEvent`      | DecisionOS     | Removed     |
| `PlatformAuditLog` (v1)   | Platform       | Upgraded    |

### After (single unified model)
Single `PlatformAuditLog` model with `productKey` field for product-level scoping:

- **`productKey`** — Scopes entries to product (e.g., `"audit_os"`, `"sales_os"`, `"decision_os"`, `"local_content"`, `"workflowos"`, `"knowledge-foundation"`)
- **`sourceModel`** — Legacy model name for traceability (e.g., `"PlatformAuditLog"`, `"AuditEvent"`)
- **`sourceId`** — Original record ID if migrated
- **Hash chain protection** — `HashChainEntry` relation for immutability
- **Single-write enforcement** — All 699 consumer code references write exclusively to `prisma.platformAuditLog`
- **Unified query layer** — `src/lib/platform/audit/unified-query.ts` provides product-scoped search, summaries, and normalization

### Dual-Write Elimination

Previously, products wrote to both legacy models AND PlatformAuditLog (dual-write). All dual-write code has been eliminated; every audit event now writes to PlatformAuditLog exclusively. Migration comments (`[MIGRATED]`, `[MIGRATED v2]`) in code document the transition for each consumer.

### Data Flow (Updated)

```
Product Action → writePlatformAuditLog({ productKey, action, ... })
               → prisma.platformAuditLog.create()
               → hashChainEntry (immutability)
               → Unified query (productKey-scoped reads)
```

All download API routes, mutations, AI operations, and workflow transitions use this single path.

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
- `WorkflowOS` is the canonical governed workflow workspace at `/workflowos/*` (L5 Pilot-ready conditional). Template workflows, SLA monitoring, gated export, full error/loading/not-found boundaries, 31 action tests, seed data, monitoring dashboard metric.
- `Sunbul` is a legacy redirect alias: `/sunbul/*` routes → `permanentRedirect(302)` to `/workflowos/*`.
- `/organizations` is a protected surface — not yet v0.1 workspace complete.
- `LocalContentOS` is implemented as a governed workspace at `/local-content/*` with 27 routes, bilingual UI, evidence upload, binary PDF/XLSX exports, audit trail, AI recommendation engine with knowledge retrieval (V3.5), simulation explainability, recommendation feedback loop, pilot readiness dashboard, quality dashboard, review center, and ERP integration (SAP/Oracle/CSV). **L5 Pilot-ready (conditional)** — Full error/loading/not-found boundaries on all routes. All 9 L6 gaps closed. AI quality re-run achieved 100% readiness (7/7 GREEN), 95% acceptance, 88% confidence gradient. 321+ tests PASS. **Action split (2026-07-13)**: `localcontent-actions.ts` (1,471 lines) decomposed into 8 focused modules under `src/lib/local-content/` (supplier, spend, classification, evidence, findings, workbook, review, project).
- `DecisionOS` is a production-hardened governed workspace at `/decisions/*` (L6). Full lifecycle (draft → in_review → approved/rejected), evidence upload, bilingual PDF export, signal automation, sector intelligence wiring, cross-decision pattern analysis, decision portfolio view, outcome correlation analytics. Full error/loading/not-found boundaries on all 22 route segments. 275 tests (273 pass), seed data.
- `SalesOS` is a production-hardened governed commercial intelligence workspace at `/sales/*` (L6). 32 routes with full error/loading/not-found boundaries. Intelligence tab with 12 sub-engines, forecasting engine, CRM sync (HubSpot/Salesforce), conversion funnel analytics, pipeline depth analytics, bilingual UX. 878+ tests across 86 test files PASS. God Object split: `sales-actions.ts` (977 lines) split into 4 focused modules (`sales-actions-helpers`, `sales-interaction-actions`, `sales-agent-actions`, `sales-outreach-actions`). Product plugin registered (`SalesOSPlugin`) with event bus subscriptions for cross-product awareness.
- `AuditOS` is the most mature operating system with 12-station audit lifecycle, ISQM1 quality management, 8 L6 engines, and interactive demo at `/auditos`. **God Object split (2026-07-13)**: `audit-actions.ts` (3,657 lines) decomposed into 12 focused modules under `src/lib/audit/db/` (e.g., engagement-db, finding-db, evidence-db). Each module owns a single domain concern.
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
 - **Security layer (2026-07-13)**: `src/lib/security/prompt-sanitization.ts` added to the AQLIYA Intelligence Core security layer. Sanitizes AI prompts before provider dispatch — strips injection attempts, enforces output boundaries, logs sanitization events. Integrated into `AIOrchestrator` pipeline.
 - **Platform caching (2026-07-13)**: `src/lib/platform/cache-strategy.ts` implements `getCachedOrFetch` (5-minute TTL, per-user/org scoped keys) for all 5 primary dashboard server actions. Mutations call `invalidateDashboardCaches()` to bust stale entries. Pattern: write-through invalidation with key-prefix matching.
 - **Pagination standard (2026-07-13)**: All server actions across the platform return paginated results in `{ items, totalCount, hasMore }` format. No unbounded array returns.
 - **Platform Kernel 2.0 (Sprint 7 complete)**: All 691 consumer files migrated from direct module imports to `@/lib/kernel` imports. Kernel provides 9 bridges (auth, feature-flags, cache, authorization, audit, knowledge, governance, workflowos, prisma), 20+ TypeScript contracts, plugin system (`ProductPlugin`/`ProductRegistry`), domain event bus (with dead-letter queue, retry, history), and CQRS projection framework. The kernel is the sole import surface for platform services.
 - **LocalContactOS RBAC enforcement (2026-08-23)**: `enforce()` from `@/lib/kernel` added to all 9 CRUD actions in `contact-actions.ts` (listContacts, createContact, getContact, updateContact, deleteContact, createContactRelation, logContactInteraction, uploadContactEvidence, createContactReview). Previously only export and review actions had server-side RBAC enforcement. All LocalContactOS mutations now go through the kernel authorization layer.
 - **RTL hardening — DecisionOS + WorkflowOS (2026-08-23)**: 64+ physical CSS classes converted to logical (RTL-safe) equivalents across 30+ files: `pl-*`→`ps-*`, `ml-*`→`ms-*`, `mr-*`→`me-*`, `text-right`→`text-start`, `right-0`→`end-0`, `border-l-*`→`border-s-*`. English-only content translated to Arabic: DecisionOS report page (executive summary, table headers, score labels, scenario mapping), dashboard mock data, 18 strings in `decision-progress.tsx`, error/loading/not-found pages across report/governance/recommendation. Dropdown positioning fixed in `workflow-client-selector.tsx`.
