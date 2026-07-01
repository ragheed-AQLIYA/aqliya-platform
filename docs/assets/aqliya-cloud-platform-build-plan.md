# AQLIYA Cloud Platform Build Plan

**Version:** 1.0
**Status:** Architecture planning — not yet implemented
**Aligned with:** `aqliya-vision-v1.1.md`, `aqliya-roadmap-v1.1.md`, `aqliya-product-taxonomy-v1.1.md`, `aqliya-core-architecture-v1.1.md`
**Strategic direction:** Build Cloud-first, Private-ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Platform Status](#2-current-platform-status)
3. [Target Cloud Platform Architecture](#3-target-cloud-platform-architecture)
4. [Multi-Organization Model](#4-multi-organization-model)
5. [Client Workspace Model](#5-client-workspace-model)
6. [Project-Level Data Separation](#6-project-level-data-separation)
7. [Product Integration Model](#7-product-integration-model)
8. [Shared Core Services](#8-shared-core-services)
9. [Route Structure Proposal](#9-route-structure-proposal)
10. [Data Model Reuse Assessment](#10-data-model-reuse-assessment)
11. [Required New Entities](#11-required-new-entities)
12. [Permission Model](#12-permission-model)
13. [File Storage Strategy](#13-file-storage-strategy)
14. [AI Assistant Strategy](#14-ai-assistant-strategy)
15. [Reporting and Presentation Generation Strategy](#15-reporting-and-presentation-generation-strategy)
16. [Export Control Strategy](#16-export-control-strategy)
17. [Security and Tenant Isolation Requirements](#17-security-and-tenant-isolation-requirements)
18. [Private-Ready Design Principles](#18-private-ready-design-principles)
19. [What to Build Now](#19-what-to-build-now)
20. [What to Defer](#20-what-to-defer)
21. [Implementation Backlog by Sprint](#21-implementation-backlog-by-sprint)
22. [Validation Strategy](#22-validation-strategy)
23. [Risks and Mitigations](#23-risks-and-mitigations)
24. [Open Questions](#24-open-questions)

---

## 1. Executive Summary

AQLIYA is a **Private Governed Institutional Intelligence Platform**. It is not a single product — it is a multi-product intelligence platform that includes AuditOS (first proof product), LocalContentOS (second strategic product), Office AI Assistant (shared governed application), and future products.

This build plan defines the architecture and execution path for **AQLIYA Cloud Platform** — a governed, multi-tenant SaaS that hosts all AQLIYA products and shared applications on a shared Intelligence Core.

### Key Principles

- **Cloud-first, Private-ready** — Build for Cloud SaaS now, design for On-Prem migration later
- **Governance-first** — Every feature includes approval, evidence, audit, and RBAC
- **Multi-tenant by design** — Organization-level isolation, client workspace boundaries, project-level data separation
- **Shared Core** — All products reuse Governance Engine, Workflow Engine, Evidence Graph, RBAC, Audit Logs, AI Orchestration, and Reporting
- **Incremental delivery** — Sprint-by-sprint builds on existing code; no big-bang rewrites

### Scope

This plan covers:

- Cloud Platform multi-organization and workspace model
- Product integration for AuditOS, LocalContentOS, and Office AI Assistant
- Shared Core service unification
- Implementation sprints 1–12

**Out of scope for this phase:**

- On-Prem deployment package
- Local AI runtime
- Air-Gapped mode
- AQLIYA Studio
- Institutional Memory engine
- Model Governance registry

---

## 2. Current Platform Status

### What Exists Today

| Capability                                        | Status                | Location                                   |
| ------------------------------------------------- | --------------------- | ------------------------------------------ |
| Next.js 16 + TypeScript 5 + PostgreSQL + Prisma 7 | Active                | Entire codebase                            |
| Authentication (NextAuth v5)                      | Active                | `src/app/api/auth/`                        |
| DecisionOS workspace                              | Active                | `/(dashboard)/` routes                     |
| AuditOS workspace                                 | Pilot-ready           | `/audit` routes                            |
| AuditOS guided demo                               | Active                | `/auditos` (mock-backed)                   |
| SalesOS prototype                                 | Shell only            | `/sales`                                   |
| Governance framework                              | Active                | `src/lib/governance/`                      |
| Workflow state machines                           | Active                | `src/lib/governance/workflow-gating.ts`    |
| Evidence linking (AuditOS)                        | Active                | `src/lib/audit/` via notes engine          |
| RBAC (per-organization, per-role)                 | Active                | `tenant-guard.ts`, role checks in actions  |
| Audit logs (AuditEvent, AuditLog)                 | Active                | Separate models for AuditOS and DecisionOS |
| AI Orchestration                                  | Phase 3B complete     | DeterministicAIProvider with 5 handlers    |
| Cloud AI Provider                                 | Stub — throws on call | `src/lib/ai/providers/cloud-provider.ts`   |
| Local AI Provider                                 | Stub — throws on call | `src/lib/ai/providers/local-provider.ts`   |
| File storage (local filesystem)                   | Active                | `src/lib/platform/storage/`                |
| Reporting/Export (PDF/XLSX)                       | Active                | `src/lib/audit/export/` (AuditOS only)     |
| Bilingual data processing                         | Active                | Throughout AuditOS modules                 |
| WorkspaceContext abstraction                      | Active                | `src/lib/platform/workspace.ts`            |

### Key Gaps

| Gap                                   | Impact                                                                  | Addressed In |
| ------------------------------------- | ----------------------------------------------------------------------- | ------------ |
| No cross-product organization model   | AuditOS and DecisionOS have separate org hierarchies, no unified tenant | Sprint 2     |
| No unified RBAC across products       | Each product enforces its own role model                                | Sprint 3     |
| Cloud AI Provider is a stub           | No real LLM integration for AI features                                 | Sprint 4     |
| Evidence Graph is AuditOS-only        | Not a cross-product shared graph                                        | Sprint 5     |
| Reporting is AuditOS-only             | No shared export/reporting service                                      | Sprint 6     |
| Office AI Assistant not implemented   | No shared work assistant exists                                         | Sprint 7     |
| LocalContentOS has no workspace       | Marketing page only                                                     | Sprint 10    |
| File storage is local only            | No cloud blob storage (S3/Azure)                                        | Sprint 3     |
| Sunbul product has separate hierarchy | Third independent org model                                             | Post-phase   |

---

## 3. Target Cloud Platform Architecture

### High-Level Layer Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     SHARED APPLICATIONS                           │
│  Office AI Assistant  │  (future shared apps)                     │
├──────────────────────────────────────────────────────────────────┤
│                         PRODUCTS                                  │
│  AuditOS  │  LocalContentOS  │  DecisionOS  │  (future products)  │
├──────────────────────────────────────────────────────────────────┤
│                   AQLIYA INTELLIGENCE CORE                        │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐         │
│  │Governance│ Workflow │ Evidence │   AI     │Reporting │         │
│  │  Engine  │  Engine  │  Graph   │Orchestrat│  Engine  │         │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┤         │
│  │   RBAC   │  Audit   │  File    │  Model   │Institution│        │
│  │          │   Logs   │  Vault   │Governance│  Memory  │         │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘         │
├──────────────────────────────────────────────────────────────────┤
│                    PLATFORM INFRASTRUCTURE                         │
│  Multi-Org │ Workspace │ Auth │ Storage │ Deployment │ Monitoring │
│   Tenant   │  Manager  │(NextA│(S3/Azure│  (Cloud)   │ (Health,   │
│  Identity  │           │ uth) │ Blob)   │            │  Alerts)   │
└──────────────────────────────────────────────────────────────────┘
```

### Deployment Model

```
┌─────────────────────────────────────────────────────────────┐
│                     AQLIYA CLOUD                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Org A   │  │  Org B   │  │  Org C   │  ...              │
│  │(isolated)│  │(isolated)│  │(isolated)│                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                             │
│  Shared: PostgreSQL (schema-per-tenant or row-level),       │
│  Blob Storage (container-per-tenant), Auth Provider         │
└─────────────────────────────────────────────────────────────┘
        │
        │ Private-ready: same architecture, containerized,
        │ deployable inside customer infrastructure
        ▼
┌─────────────────────────────────────────────────────────────┐
│                   AQLIYA PRIVATE / ON-PREM                   │
│  Single-tenant deployment inside customer environment        │
│  Local database, local file storage, local AI (future)       │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Decisions

| Decision                  | Choice                                                                        | Rationale                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Tenant isolation model    | Schema-per-tenant (for Cloud), row-level `organizationId` (for Private-ready) | Schema isolation provides strongest separation for Cloud; row-level simplifies On-Prem single-tenant deployment |
| Monolith or microservices | Modular monolith (Next.js)                                                    | Existing architecture, simpler deployment, single codebase; can extract services later                          |
| AI provider model         | Provider abstraction (Cloud AI / Deterministic AI / Local AI)                 | Already designed in Phase 3; extend Cloud AI adapter                                                            |
| File storage              | Provider abstraction (Local → S3/Azure Blob)                                  | Already designed; implement cloud adapters                                                                      |
| Authentication            | NextAuth v5 with org-scoped sessions                                          | Already active; extend for multi-org                                                                            |

---

## 4. Multi-Organization Model

### Current State

Two independent organization hierarchies exist:

- `Organization` (DecisionOS) — top-level grouping for decisions, users, audit logs
- `AuditOrganization` (AuditOS) — top-level grouping for audit clients, users, engagements
- `SunbulClient` (Sunbul) — third independent hierarchy

These are **completely disconnected** — no shared tenant identity, no cross-product user management.

### Target State

A single **Platform Organization** model that unifies all products under one tenant umbrella:

```
PlatformOrganization
├── id, name, slug, jurisdiction, status, tier (pilot/enterprise)
├── Features enabled (product licensing: audit, localcontent, officeai)
├── PlatformUser[]
│   ├── id, email, name, role (org-level: admin/operator/viewer)
│   └── ProductRole[] (per-product role: audit_lead, content_analyst, etc.)
├── ClientWorkspace[] (see section 5)
├── AuditOrganization (link to existing AuditOS org — backward compat)
├── AuditLog[] (unified platform audit trail)
└── Settings (governance rules, retention, branding)
```

### Implementation Approach

**Phase 1 (Sprint 1–2):** Create `PlatformOrganization` model as a thin wrapper.

- Add `platformOrganizationId` to existing `Organization` and `AuditOrganization`
- Create migration: `PlatformOrganization` ← `Organization`, `PlatformOrganization` ← `AuditOrganization`
- All new signups create a `PlatformOrganization` first
- Existing data: create `PlatformOrganization` records from existing `Organization`/`AuditOrganization` and link them

**Phase 2 (Sprint 3):** Unify user management.

- `PlatformUser` is the primary user record
- Legacy `User` (DecisionOS) and `AuditUser` (AuditOS) become role references from `PlatformUser`
- Auth session carries `platformOrganizationId` for tenant identification

**Backward compatibility:**

- All existing routes continue to work during migration
- Existing `tenant-guard.ts` checks extended to also validate `platformOrganizationId`
- Old models remain until full deprecation

---

## 5. Client Workspace Model

### Definition

A **client workspace** is a governed operational environment within an organization that contains data for a specific client, engagement, or business relationship. Workspaces are the primary unit of data isolation within an organization.

### Current State

| Product        | Workspace Concept                                     | Scope                                                                                                                        |
| -------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| AuditOS        | `AuditClient` → `AuditEngagement`                     | Organization → Client → Engagement                                                                                           |
| DecisionOS     | `Organization` → `Decision`                           | Organization → Decision (no client concept)                                                                                  |
| SalesOS        | Static dashboard only                                 | None                                                                                                                         |
| LocalContentOS | `LocalContentProject` workspace at `/local-content/*` | L5 pilot-ready with conditions / usable v0.1 (see `docs/reports/localcontentos-v0.1-documentation-truth-sync-2026-05-23.md`) |

### Target State

Unified workspace model across all products:

```
PlatformOrganization
└── ClientWorkspace
    ├── id, name, status (active/archived), workspaceType (audit/content/internal)
    ├── productAccess: which products are enabled in this workspace
    ├── metadata: industry, region, settings
    ├── AuditOS: linked AuditClient + AuditEngagement[]
    ├── LocalContentOS: linked ContentProjects[]
    ├── Office AI Assistant: file context, Q&A scope
    └── PlatformUser[] with workspace-level roles
```

### Workspace Types

| Type       | Purpose                                  | Example                         |
| ---------- | ---------------------------------------- | ------------------------------- |
| `audit`    | Financial/audit engagements              | External audit client workspace |
| `content`  | Local content measurement                | Supplier locality analysis      |
| `internal` | Internal operations, Office AI Assistant | Employee work assistant context |
| `decision` | Strategic decision governance            | Tender decision workspace       |

### Key Design Rules

1. Every workspace belongs to exactly one organization
2. A user may have access to multiple workspaces within an organization
3. Data never crosses workspace boundaries
4. AI queries are scoped to a single workspace
5. Reports and exports are workspace-scoped

---

## 6. Project-Level Data Separation

Within a client workspace, data is further separated by **project** (e.g., an audit engagement, a content analysis project, a decision).

### Current State

| Product             | Project Model     | Isolation Level                                   |
| ------------------- | ----------------- | ------------------------------------------------- |
| AuditOS             | `AuditEngagement` | Engagement-level: all data FK'd to `engagementId` |
| DecisionOS          | `Decision`        | Decision-level: each decision is independent      |
| Office AI Assistant | Not implemented   | N/A                                               |

### Target State

```
ClientWorkspace
└── Project
    ├── id, name, type, status, timeline
    ├── metadata: framework, currency, fiscal period
    ├── team: users assigned with project roles
    └── product-specific data (FK'd to projectId)
```

### Data Separation Rules

1. All product entities have a `projectId` foreign key
2. Queries always filter by `projectId` (never project-crossing)
3. AI orchestration receives `projectId` as a governance context parameter
4. Evidence Graph links are scoped to a project
5. Audit logs include `projectId` for tracing
6. File storage paths include `projectId` in the container path

### Migration Path

- AuditOS: `AuditEngagement` already serves as the project model — `projectId = engagementId`
- DecisionOS: Add `projectId` to `Decision` model (optional, backward-compat)
- LocalContentOS: New model, built with `projectId` from day one
- Office AI Assistant: Query context scoped by `projectId`

---

## 7. Product Integration Model

### 7.1 AuditOS

**Current Status:** Pilot-ready, active workspace at `/audit`

**Integration Points:**

- Auth: `AuditUser` → will be linked to `PlatformUser`
- Org: `AuditOrganization` → will be linked to `PlatformOrganization`
- Client: `AuditClient` → maps to `ClientWorkspace`
- Engagement: `AuditEngagement` → maps to `Project`
- Evidence: `AuditEvidence` → will be linked to shared Evidence Graph
- AI: `AuditAiOutput` → will use shared AI Orchestration
- Audit: `AuditEvent` → will be unified with platform Audit Logs
- Export: `PDF/XLSX` → will become shared Reporting Engine

**Changes Required:**

- Add `projectId` field to AuditOS models (aliased from `engagementId` initially)
- Extend `tenant-guard.ts` to validate platform org membership
- Migrate `AuditEvent` to unified platform `AuditLog` (dual-write during transition)
- Refactor `src/lib/audit/export/` into `src/lib/platform/reporting/`

**No changes to existing business logic** — only add abstraction layers.

### 7.2 LocalContentOS

**Current Status:** Marketing-only at `/products/local-content`

**Integration Points:**

- No existing models, workspace, or actions
- Will build new models on shared Core from day one
- Will use shared Governance Engine, Workflow, RBAC, Audit Logs, and AI Orchestration

**First Implementation (Sprint 10):**

- Create `ContentProject` model (extends `Project`)
- Create `SupplierRecord`, `LocalityAssessment`, `SpendClassification` models
- Build workspace route under shared workspace shell
- Use existing `file-scanner.ts` for document intake

**Key principle:** LocalContentOS reuse over reimplement — governance, workflow, evidence, and RBAC come from shared Core, not duplicated.

### 7.3 Office AI Assistant

**Current Status:** Planned / MVP target — no implementation yet

**Position:** Shared application built on AQLIYA Intelligence Core, NOT a standalone product.

**Integration Points:**

- No separate workspace route — operates within existing product workspaces
- Uses AI Orchestration Engine for all generation tasks
- Uses Evidence Graph for source linking
- Uses RBAC for permission enforcement
- Uses Audit Logs for action tracing
- Uses File Vault for document access
- Uses Governance Engine for human review gates
- Uses Workflow Engine for review/approval flows
- Uses Reporting Engine for output generation

**First Implementation (Sprint 7–8):**

- Inline assistant UI component embedded in product pages (no `/office-ai` route)
- File analysis (PDF, Word, Excel) via existing Document Intelligence
- Summary generation via AI Orchestration handlers
- Draft output with source evidence links
- Human review gate before output finalization
- All actions logged to unified Audit Log

**Boundaries (non-negotiable):**

- Not a chatbot — no free-form conversational interface
- No autonomous decisions — outputs are suggestions only
- No cross-client data mixing — scoped to current workspace
- No customer data training — zero-shot prompts only
- No On-Prem or Local AI claim — Cloud AI only for MVP

---

## 8. Shared Core Services

### 8.1 Governance Engine

**Current:** Active at `src/lib/governance/` — approval states, escalation, provenance, retrieval routing

**Cloud Platform Changes:**

- Extend `retrieval-router.ts` to accept `platformOrganizationId` and `projectId` as governance context
- Add `GovernancePolicy` model for per-organization customizable rules (approval chains, risk thresholds)
- Make escalation configurable per organization (not just hardcoded)
- Add compliance framework tagging (regulatory scope per project)

**Status:** Extend — do not rewrite

### 8.2 Workflow Engine

**Current:** Active at `src/lib/governance/workflow-gating.ts` — state machines: Draft → Prepared → Reviewed → Returned → Approved → Locked → Exported → Archived

**Cloud Platform Changes:**

- Generalize the state machine to accept custom state definitions per product
- Add workflow template system (predefined flows for audit, content, office tasks)
- Add workflow instance persistence (track which projects are in which state)
- Add workflow event hooks (trigger notifications, exports, AI actions on state change)

**Status:** Extend — do not rewrite

### 8.3 Evidence Graph

**Current:** Partial — evidence linking exists in AuditOS via `evidence-requirements.ts` and notes engine, but not cross-product

**Cloud Platform Changes:**

- Create shared `EvidenceNode` model (product-agnostic: can link to any entity)
- Create shared `EvidenceEdge` model (source → target relationship with type, context, timestamp)
- Migrate `AuditEvidenceLink` to shared `EvidenceEdge` (dual-write)
- Add evidence graph query API (`getRelatedEvidence(projectId, entityType, entityId)`)
- Add evidence graph visualization component (shared)

**Status:** Build — new shared models needed

### 8.4 RBAC

**Current:** Active — permission model via `tenant-guard.ts`, role-based auth in actions, separate role enums per product

**Cloud Platform Changes:**

- Create unified `PlatformRole` model: `{ organizationId, userId, product, workspaceId?, role }`
- Define global permission set: `{ canCreate, canRead, canUpdate, canDelete, canReview, canApprove, canExport, canManageUsers, canConfigure }`
- Map product-specific roles to platform permissions (e.g., `audit_lead` → all audit permissions)
- Extend `tenant-guard.ts` to check platform permissions before delegating to product-specific checks
- Add permission inheritance: Organization → Workspace → Project with override support

**Status:** Build — new shared model, extend guard

### 8.5 Audit Logs

**Current:** Two separate models — `AuditEvent` (AuditOS, FK to engagementId) and `AuditLog` (DecisionOS, FK to organizationId)

**Cloud Platform Changes:**

- Create unified `PlatformAuditLog` model: `{ organizationId, workspaceId, projectId, userId, action, targetType, targetId, previousState, newState, metadata, timestamp, aiRelated }`
- Dual-write to both old and new during transition
- Add organization-level audit log view (cross-product)
- Add workspace-level audit log view
- Add export filter (by product, user, action type, date range)

**Status:** Build — new shared model, dual-write migration

### 8.6 File Vault

**Current:** Active — provider abstraction at `src/lib/platform/storage/`, local filesystem provider only

**Cloud Platform Changes:**

- Implement `S3StorageProvider` (AWS S3)
- Implement `AzureBlobStorageProvider` (Azure Blob Storage)
- Add file encryption at rest (AES-256)
- Add file access logging (who accessed what file, when)
- Add file retention policies (auto-delete based on project/workspace settings)
- Add file versioning (optional per workspace)
- Add upload size limits per organization tier

**Status:** Extend — implement cloud providers

### 8.7 Reporting Engine

**Current:** Active — PDF/XLSX export at `src/lib/audit/export/`, AuditOS only

**Cloud Platform Changes:**

- Move export logic to `src/lib/platform/reporting/` with product-agnostic API
- Add template system (report layouts defined separately from data)
- Add scheduled report generation
- Add report distribution (email, download, shared link)
- Add report watermarking (draft/approved/confidential)
- Add bilingual (Arabic/English) report support in shared engine

**Status:** Refactor — move from AuditOS-specific to shared

### 8.8 AI Orchestration

**Current:** Phase 3B — DeterministicAIProvider with 5 handlers, CloudAIProvider is a stub, LocalAIProvider is a stub

**Cloud Platform Changes:**

- Implement `CloudAIProvider` — wire to external LLM API (OpenAI/Claude)
- Implement output validation against provider interface
- Add prompt registry with versioning (file-based or DB config table)
- Add AI action logging (model, prompt version, confidence, reviewer decision)
- Extend provider selection to support product-specific routing
- Add AI health check endpoint
- Add fallback chain (Cloud → Deterministic if Cloud unavailable)
- Deprecate `src/lib/audit/ai-service.ts` in favor of shared AI Orchestration

**Status:** Extend — implement Cloud AI provider

---

## 9. Route Structure Proposal

### Current Route Structure

| Route            | Purpose              | Status |
| ---------------- | -------------------- | ------ |
| `/`              | Company homepage     | Active |
| `/(marketing)/*` | Public content       | Active |
| `/(dashboard)/*` | DecisionOS workspace | Active |
| `/audit/*`       | AuditOS workspace    | Active |
| `/auditos/*`     | AuditOS guided demo  | Active |
| `/sales`         | SalesOS prototype    | Active |
| `/api/*`         | API routes           | Active |

### Proposed Route Structure

```
/
├── (marketing)/          # Public pages (unchanged)
├── (dashboard)/          # Workspace shell (unchanged)
│   └── [orgSlug]/        # NEW: Organization-scoped workspace
│       ├── audit/        # AuditOS (moved from /audit)
│       ├── content/      # LocalContentOS workspace (NEW)
│       ├── decisions/    # DecisionOS (unchanged)
│       └── assistant/    # Office AI Assistant embedded view (NEW)
├── audit/                # Legacy redirect to /[orgSlug]/audit
├── auditos/              # AuditOS demo (unchanged)
├── sales/                # SalesOS (unchanged)
├── api/                  # API routes (unchanged)
└── settings/             # Organization settings
    └── [orgSlug]/
        ├── profile
        ├── users
        ├── billing
        └── governance
```

### Route Migration Strategy

1. **Phase 1 (Sprint 1):** Add `[orgSlug]` route group — new signups use org-scoped routes
2. **Phase 2 (Sprint 2):** Dual-support both `/audit` and `/[orgSlug]/audit` — legacy orgs continue on old routes
3. **Phase 3 (Sprint 3):** Redirect `/audit` to `/[orgSlug]/audit` for all orgs after data migration complete
4. **Legacy:** `/audit` routes maintained as redirects for at least 2 release cycles

### Office AI Assistant Route Strategy

Office AI Assistant does NOT get a top-level workspace route. It is embedded:

- Panel component within existing product pages (`/audit/*`, `/content/*`)
- Standalone view at `/(dashboard)/[orgSlug]/assistant/` for cross-product queries
- No separate `/office-ai` or `/assistant` route outside org scope

---

## 10. Data Model Reuse Assessment

### Models That Can Be Reused As-Is

| Model                    | Product | Reuse Potential      | Notes                             |
| ------------------------ | ------- | -------------------- | --------------------------------- |
| `PlatformUser` (new)     | All     | Shared               | Unified user record               |
| `PlatformAuditLog` (new) | All     | Shared               | Unified audit trail               |
| `EvidenceNode` (new)     | All     | Shared               | Cross-product evidence graph      |
| `EvidenceEdge` (new)     | All     | Shared               | Evidence relationships            |
| `AuditCanonicalAccount`  | AuditOS | Accounting standards | Reusable by any financial product |

### Models That Need Abstraction

| Model               | Current Product | Target                   | Migration              |
| ------------------- | --------------- | ------------------------ | ---------------------- |
| `AuditOrganization` | AuditOS         | → `PlatformOrganization` | Add FK, dual-write     |
| `Organization`      | DecisionOS      | → `PlatformOrganization` | Add FK, dual-write     |
| `AuditEvent`        | AuditOS         | → `PlatformAuditLog`     | Dual-write, deprecate  |
| `AuditLog`          | DecisionOS      | → `PlatformAuditLog`     | Dual-write, deprecate  |
| `AuditUser`         | AuditOS         | → `PlatformUser`         | Link via FK, deprecate |
| `User`              | DecisionOS      | → `PlatformUser`         | Link via FK, deprecate |

### Models That Are Product-Specific (No Reuse)

| Model                                         | Product        | Reason                              |
| --------------------------------------------- | -------------- | ----------------------------------- |
| `AuditEngagement`                             | AuditOS        | Audit-specific lifecycle and fields |
| `AuditTrialBalance` + `AuditTrialBalanceLine` | AuditOS        | Financial audit domain              |
| `AuditAccountMapping`                         | AuditOS        | Audit mapping logic                 |
| `AuditFinancialStatement`                     | AuditOS        | Financial statement structure       |
| `AuditFinding` + `AuditRecommendation`        | AuditOS        | Audit findings domain               |
| `AuditDisclosureNote`                         | AuditOS        | Disclosure notes domain             |
| `Decision` + all related models               | DecisionOS     | Decision governance domain          |
| `ContentProject` (future)                     | LocalContentOS | Content analysis domain             |

### Shared Models to Create (New)

| Model                           | Purpose                               | Sprint |
| ------------------------------- | ------------------------------------- | ------ |
| `PlatformOrganization`          | Unified tenant identity               | 1      |
| `PlatformUser`                  | Unified user record                   | 2      |
| `ClientWorkspace`               | Workspace abstraction across products | 2      |
| `Project`                       | Base project model for all products   | 2      |
| `PlatformRole`                  | Unified RBAC permission model         | 3      |
| `PlatformAuditLog`              | Unified audit trail                   | 3      |
| `EvidenceNode` + `EvidenceEdge` | Cross-product Evidence Graph          | 5      |
| `ReportTemplate`                | Shared reporting templates            | 6      |
| `AiActionLog`                   | AI action registry                    | 4      |

---

## 11. Required New Entities

### Entity: `PlatformOrganization`

```
PlatformOrganization {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  jurisdiction    String?
  tier            String    @default("pilot")    // pilot | enterprise
  status          String    @default("active")
  features        Json?                          // enabled products/config
  settings        Json?                          // org-level settings
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

**Links from existing orgs:**

- `Organization.platformOrganizationId String?` (DecisionOS FK)
- `AuditOrganization.platformOrganizationId String?` (AuditOS FK)

**Links to:** `PlatformUser[]`, `ClientWorkspace[]`, `PlatformAuditLog[]`

### Entity: `PlatformUser`

```
PlatformUser {
  id                String    @id @default(cuid())
  platformOrganizationId String
  platformOrganization   PlatformOrganization @relation(...)
  email             String    @unique
  name              String
  role              String    @default("member") // admin | member
  status            String    @default("active")
  lastLoginAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

**Backward compat:** `User.platformUserId String?`, `AuditUser.platformUserId String?`

### Entity: `ClientWorkspace`

```
ClientWorkspace {
  id                String    @id @default(cuid())
  platformOrganizationId String
  platformOrganization   PlatformOrganization @relation(...)
  name              String
  workspaceType     String    // audit | content | internal | decision
  status            String    @default("active")
  productAccess     Json?     // { audit: true, localcontent: false, officeai: true }
  metadata          Json?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

**Links to:** `AuditClient` (optional), `ContentProject[]`, `Project[]`

### Entity: `Project` (base)

```
Project {
  id                String    @id @default(cuid())
  workspaceId       String
  workspace         ClientWorkspace @relation(...)
  name              String
  type              String    // audit_engagement | content_analysis | office_task
  status            String    @default("active")
  team              Json?     // [{ userId, role }]
  metadata          Json?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

**Product-specific extensions:**

- `AuditEngagement` extends `Project` (or links via `projectId`)
- `ContentProject` extends `Project` (LocalContentOS)

### Entity: `PlatformRole`

```
PlatformRole {
  id                String    @id @default(cuid())
  platformOrganizationId String
  platformOrganization   PlatformOrganization @relation(...)
  userId            String
  product           String    // audit | localcontent | decisions | officeai
  workspaceId       String?   // null = org-wide role
  role              String    // admin | manager | operator | viewer
  permissions       Json      // { canCreate, canRead, canUpdate, canDelete, ... }
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### Entity: `PlatformAuditLog`

```
PlatformAuditLog {
  id                String    @id @default(cuid())
  platformOrganizationId String
  organization      PlatformOrganization @relation(...)
  workspaceId       String?
  projectId         String?
  userId            String
  userName          String
  userRole          String?
  action            String    // entity.created | entity.updated | entity.deleted | etc.
  targetType        String    // engagement | decision | finding | evidence | etc.
  targetId          String
  previousState     String?
  newState          String?
  description       String
  metadata          Json?
  aiRelated         Boolean   @default(false)
  timestamp         DateTime  @default(now())
}
```

### Entity: `EvidenceNode`

```
EvidenceNode {
  id                String    @id @default(cuid())
  projectId         String
  type              String    // file | finding | note | decision | ai_output
  sourceId          String    // FK to the actual entity
  title             String
  description       String?
  metadata          Json?
  createdAt         DateTime  @default(now())
}
```

### Entity: `EvidenceEdge`

```
EvidenceEdge {
  id                String    @id @default(cuid())
  sourceNodeId      String
  sourceNode        EvidenceNode @relation("SourceNode")
  targetNodeId      String
  targetNode        EvidenceNode @relation("TargetNode")
  linkType          String    // supports | contradicts | references | derives_from
  context           String?
  createdBy         String?
  createdAt         DateTime  @default(now())
}
```

### Entity: `ReportTemplate`

```
ReportTemplate {
  id                String    @id @default(cuid())
  name              String
  product           String    // audit | localcontent | officeai
  type              String    // pdf | xlsx | docx
  layout            Json
  fields            Json
  bilingual         Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### Entity: `AiActionLog`

```
AiActionLog {
  id                String    @id @default(cuid())
  projectId         String
  userId            String
  actionType        String    // summarize | draft | analyze | suggest
  provider          String    // cloud_ai | deterministic | local_ai
  modelVersion      String?
  promptVersion     String?
  inputContext      String?
  outputContent     String
  confidence        Float?
  status            String    // suggested | accepted | rejected | overridden
  reviewerId        String?
  reviewerDecision  String?
  evidenceLinks     Json?     // [{ nodeId, type }]
  createdAt         DateTime  @default(now())
}
```

---

## 12. Permission Model

### Hierarchy

```
PlatformOrganization (owner: platform_admin)
│
├── Organization-level roles (apply to all workspaces)
│   ├── admin       → full access to all products and settings
│   ├── manager     → create/edit workspaces, manage users
│   └── member      → access assigned workspaces only
│
├── Workspace-level roles (apply within a single workspace)
│   ├── workspace_admin  → full workspace control
│   ├── workspace_lead   → manage projects, team, exports
│   └── workspace_viewer → read-only access
│
└── Project-level roles (apply within a single project)
    ├── project_lead     → full project control
    ├── project_editor   → create/edit project data
    └── project_viewer   → read-only project access
```

### Permission Matrix

| Action              | Org Admin | Org Manager | Org Member | Ws Admin | Ws Lead | Ws Viewer | Proj Lead | Proj Editor | Proj Viewer |
| ------------------- | --------- | ----------- | ---------- | -------- | ------- | --------- | --------- | ----------- | ----------- |
| View workspaces     | All       | All         | Assigned   | All      | All     | Own       | Own       | Own         | Own         |
| Create workspace    | ✓         | ✓           | —          | —        | —       | —         | —         | —           | —           |
| Delete workspace    | ✓         | ✓           | —          | —        | —       | —         | —         | —           | —           |
| Manage users        | ✓         | ✓           | —          | ✓ (ws)   | —       | —         | —         | —           | —           |
| View project data   | All       | All         | Assigned   | All      | All     | Own       | Own       | Own         | Own         |
| Create project      | ✓         | ✓           | —          | ✓        | ✓       | —         | —         | —           | —           |
| Edit project data   | ✓         | ✓           | —          | ✓        | ✓       | —         | ✓         | ✓           | —           |
| Approve workflow    | ✓         | ✓           | —          | ✓        | ✓       | —         | ✓         | —           | —           |
| Export/report       | ✓         | ✓           | —          | ✓        | ✓       | —         | ✓         | ✓           | —           |
| AI assistant access | ✓         | ✓           | —          | ✓        | ✓       | ✓         | ✓         | ✓           | ✓           |
| View audit logs     | All       | All         | Own        | All      | Own     | Own       | Own       | Own         | Own         |
| Configure settings  | ✓         | ✓           | —          | ✓ (ws)   | —       | —         | —         | —           | —           |

### Enforcement Pattern

```
Request → Route Guard (authenticated) →
  PlatformOrg Guard (org membership) →
    Workspace Guard (workspace access) →
      Product Guard (product licensing) →
        Action Guard (role/permission check)
```

### Implementation

1. `src/lib/platform/guards/org-guard.ts` — validates `platformOrganizationId` from session
2. `src/lib/platform/guards/workspace-guard.ts` — validates workspace access and user membership
3. `src/lib/platform/guards/permission-guard.ts` — validates specific action permissions
4. Existing `tenant-guard.ts` — extended to delegate to permission guard

---

## 13. File Storage Strategy

### Cloud Storage Architecture

```
┌──────────────────────────────────────────────────────┐
│                    File Vault API                     │
│  store(file, context) → key                          │
│  retrieve(key, context) → file                       │
│  delete(key, context) → void                         │
│  list(context) → files[]                             │
│  getSignedUrl(key, context) → url                    │
├──────────────────────────────────────────────────────┤
│                   Storage Provider                   │
│  ┌────────────────┐  ┌──────────────────────┐        │
│  │ S3Provider     │  │ AzureBlobProvider    │        │
│  │ (AWS S3)       │  │ (Azure Blob Storage) │        │
│  └────────────────┘  └──────────────────────┘        │
│  ┌────────────────┐                                  │
│  │ LocalProvider  │  (dev/test only)                 │
│  └────────────────┘                                  │
└──────────────────────────────────────────────────────┘
```

### Path Structure

```
{provider}://{bucket}/{orgSlug}/{workspaceId}/{projectId}/{entityType}/{entityId}/{filename}
```

Example: `s3://aqliya-files/acme-corp/ws-abc/proj-123/evidence/evid-456/fs-report-2024.pdf`

### Encryption

- **At rest:** AES-256 server-side encryption (S3 SSE-S3 or Azure SSE)
- **In transit:** HTTPS/TLS
- **Client-side encryption:** Optional per-organization (bring-your-own-key for enterprise tier)

### Retention

| File Type        | Retention                  | Auto-Delete                         |
| ---------------- | -------------------------- | ----------------------------------- |
| Project evidence | Project lifetime + 7 years | After retention period + org config |
| AI outputs       | 1 year                     | After 1 year unless referenced      |
| Draft exports    | 90 days                    | After 90 days                       |
| Approved exports | Project lifetime + 7 years | After retention period              |
| Temp uploads     | 24 hours                   | After 24 hours                      |

### Access Control

- File access checked against workspace/project permissions
- File download logged to PlatformAuditLog
- Signed URLs expire (default 15 minutes)
- Bulk download restricted to workspace_admin/project_lead

### Implementation Priority

1. **Sprint 3:** Implement `S3StorageProvider` — wire to environment config
2. **Sprint 3:** Add signed URL generation
3. **Sprint 4:** Add file access logging
4. **Sprint 5:** Add retention policy enforcement (background job)
5. **Sprint 6:** Add `AzureBlobStorageProvider` for private-cloud customers
6. **Sprint 7:** Add client-side encryption option (enterprise tier)

---

## 14. AI Assistant Strategy

### Architecture

```
User Query (within workspace context)
  │
  ▼
AI Orchestration Gateway
  ├── Governance Context Injection (projectId, userId, permissions, workspace scope)
  ├── Document Intelligence (retrieve relevant files via File Vault)
  ├── Evidence Graph (retrieve relevant linked evidence)
  ├── Prompt Assembly (select prompt template from Prompt Registry)
  ├── Provider Selection (Cloud AI → Deterministic fallback)
  ├── Output Generation
  ├── Output Validation (format, confidence, evidence links)
  ├── Human Review Gate (output held for review if required)
  └── Audit Logging (AiActionLog + PlatformAuditLog)
```

### Query Types and Handlers

| Query Type           | Handler                    | Evidence Source                      | Provider |
| -------------------- | -------------------------- | ------------------------------------ | -------- |
| `summarize_document` | `documentSummaryHandler`   | Linked files in project              | Cloud AI |
| `analyze_excel`      | `excelAnalysisHandler`     | Uploaded Excel files                 | Cloud AI |
| `draft_report`       | `reportDraftHandler`       | Evidence graph + files               | Cloud AI |
| `generate_outline`   | `outlineGenerationHandler` | Project context                      | Cloud AI |
| `executive_summary`  | `executiveSummaryHandler`  | Findings, recommendations, decisions | Cloud AI |
| `answer_question`    | `workspaceQaHandler`       | All project evidence (scoped)        | Cloud AI |
| `summarize_notes`    | `notesSummaryHandler`      | Meeting notes, review comments       | Cloud AI |
| `bilingual_draft`    | `bilingualDraftHandler`    | Source content                       | Cloud AI |

### Human Review Gate

```
AI Output → Review Required? → Yes → Hold for human review
                                ↓
                               No → Direct to output (configurable per org)

Review Flow:
  Output → Assigned Reviewer → Review Page →
    ├── Accept → Output finalized, logged, evidence-linked
    ├── Edit → Reviewer modifies, then finalized
    └── Reject → Output discarded, logged with reason

All states logged to AiActionLog + PlatformAuditLog.
```

### MVP Limitations (Sprint 7–8)

- Cloud AI only (no Local AI fallback in MVP)
- Deterministic fallback for format-only queries
- No streaming responses (full response, then display)
- No conversational memory (each query is stateless)
- Human review gate always active (configurable post-MVP)
- No email integration (requires secure email connector — future)
- English-first with Arabic bilingual support; Arabic-first UI in future iteration

---

## 15. Reporting and Presentation Generation Strategy

### Shared Reporting Engine

All reports and presentations go through a unified `ReportingEngine`:

```
ReportingEngine.generate({
  projectId,
  templateId,
  data: { ... },
  format: 'pdf' | 'xlsx' | 'docx' | 'pptx',
  language: 'en' | 'ar' | 'bilingual',
  watermark: 'draft' | 'approved' | 'confidential',
  outputOptions: { ... }
}) → StorageKey + DownloadURL
```

### Report Types

| Type                 | Product             | Format   | Template                  |
| -------------------- | ------------------- | -------- | ------------------------- |
| Financial Statements | AuditOS             | PDF/XLSX | `financial-statement-v1`  |
| Audit Report         | AuditOS             | PDF      | `audit-report-v1`         |
| Management Letter    | AuditOS             | PDF/DOCX | `management-letter-v1`    |
| Local Content Report | LocalContentOS      | PDF/XLSX | `local-content-report-v1` |
| Executive Summary    | Office AI Assistant | PDF/DOCX | `executive-summary-v1`    |
| Presentation Outline | Office AI Assistant | PPTX     | `presentation-outline-v1` |
| Meeting Notes        | Office AI Assistant | PDF/DOCX | `meeting-notes-v1`        |

### Template Engine

- Templates defined as JSON: `{ layout, sections, fields, styles }`
- Stored in `ReportTemplate` model or file-based registry
- Support for bilingual templates (Arabic RTL + English LTR sections)
- Custom templates per organization (enterprise tier)

### Generation Pipeline

```
Data Collection → Template Selection → Content Assembly →
  Format Rendering → Watermark → Audit Log → Storage → Notification
```

### Implementation Priority

1. **Sprint 6:** Refactor `src/lib/audit/export/` → `src/lib/platform/reporting/`
2. **Sprint 6:** Create shared `ReportingEngine` with PDF/XLSX support
3. **Sprint 7:** Add `ReportTemplate` model and template selection
4. **Sprint 8:** Add DOCX/PPTX support (Office AI Assistant)
5. **Sprint 9:** Add bilingual template support
6. **Sprint 10:** Add scheduled report generation (background job)

---

## 16. Export Control Strategy

### Export Policy Framework

All exports are governed by a centralized policy engine:

```
ExportRequest
  ├── Who: userId, role, organization
  ├── What: targetType, targetId, format
  ├── Why: purpose (internal | client | regulatory)
  └── When: timestamp

ExportPolicy
  ├── Allowed formats per product
  ├── Watermark requirements (draft/approved/confidential)
  ├── Approval requirements (auto-export vs. require approval)
  ├── Retention requirements (auto-archive after N days)
  └── Audit requirements (always logged)
```

### Export Flow

```
User requests export →
  ╔══ Policy Check ═══════════════════════════╗
  ║ 1. Is user authorized to export? (RBAC)   ║
  ║ 2. Is the target in approved state?       ║
  ║ 3. Is the format allowed?                 ║
  ║ 4. Is approval required? → if yes, hold   ║
  ╚════════════════════════════════════════════╝
  ↓
Generate report (Reporting Engine) →
  Add watermark →
  Log to PlatformAuditLog →
  Store to File Vault →
  Return download URL or deliver
```

### Export Approval

- Configurable per organization: which products/formats require approval
- Approval workflow uses shared Workflow Engine
- Approved exports are logged with approver identity and timestamp
- Auto-export to client portal (future) requires explicit approval

### Watermark Rules

| Status       | Watermark Text              | Opacity     |
| ------------ | --------------------------- | ----------- |
| Draft        | "DRAFT — NOT FINAL"         | 30% overlay |
| Under Review | "UNDER REVIEW"              | 20% overlay |
| Approved     | (none)                      | —           |
| Confidential | "CONFIDENTIAL — [Org Name]" | 40% overlay |

---

## 17. Security and Tenant Isolation Requirements

### Tenant Isolation

| Layer        | Isolation Mechanism                   | Cloud                   | Private/On-Prem             |
| ------------ | ------------------------------------- | ----------------------- | --------------------------- |
| Network      | Virtual network per tenant (future)   | Enterprise tier         | Single-tenant by definition |
| Compute      | Shared (stateless)                    | Cloud                   | Single-tenant               |
| Database     | `platformOrganizationId` on every row | Row-level security      | Single database             |
| File storage | `{orgSlug}` prefix in path            | Container/blob prefix   | Local filesystem            |
| AI context   | `projectId` in governance context     | Shared API with context | Local AI                    |
| Cache        | Key prefix per org                    | Redis key namespacing   | Single-tenant               |
| Sessions     | JWT with org claim                    | Shared auth             | Single-tenant               |

### Authentication & Authorization

- **Auth:** NextAuth v5 with credentials provider (extend to SSO/SAML in future)
- **Session:** JWT with `platformOrganizationId`, `userId`, `role`
- **Password:** bcrypt hashing, minimum complexity requirements
- **MFA:** Future (enterprise tier)
- **Session timeout:** Configurable per organization (default 8 hours)

### Data Protection

| Measure               | Implementation                                           |
| --------------------- | -------------------------------------------------------- |
| Encryption at rest    | Database-level encryption (PostgreSQL TDE or disk-level) |
| Encryption in transit | HTTPS/TLS for all connections                            |
| File encryption       | AES-256 server-side (S3 SSE or Azure SSE)                |
| Secrets management    | Environment variables → vault service (future)           |
| API keys              | Hashed storage, rotation support                         |
| PII handling          | Field-level tagging, restricted export                   |

### Audit & Compliance

- All access to sensitive data logged (PlatformAuditLog)
- Export log includes recipient purpose, approver, timestamp
- File access log includes user, file, timestamp, action
- Admin actions (user create/delete, role changes) always logged
- Retention policies enforced by background job

### Security Headers

- Content Security Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security: max-age=31536000
- Referrer-Policy: strict-origin-when-cross-origin

---

## 18. Private-Ready Design Principles

These principles ensure the Cloud Platform can be deployed as a single-tenant Private/On-Prem instance without architectural changes.

### Principle 1: No Hard Dependencies on Cloud Infrastructure

- All cloud services behind abstraction layers (Storage Provider, AI Provider, Auth Provider)
- No hard coupling to AWS/Azure services — use environment-configurable adapters
- Database: PostgreSQL is available on-prem; no managed-service-only features
- File storage: Local filesystem is a valid provider (already implemented)

### Principle 2: Configuration-Driven

```
# Cloud deployment
STORAGE_PROVIDER=s3
AI_PROVIDER=cloud_ai
AUTH_PROVIDER=nextauth
DATABASE_URL=postgresql://...

# Private/On-Prem deployment
STORAGE_PROVIDER=local
AI_PROVIDER=local_ai    # future
AUTH_PROVIDER=nextauth   # or ldap (future)
DATABASE_URL=postgresql://local-postgres
```

### Principle 3: Single-Tenant by Default for On-Prem

- Row-level `organizationId` isolation works for multi-tenant Cloud
- Single-tenant On-Prem: one organization per deployment, no multi-tenant overhead
- Same codebase, different configuration

### Principle 4: Offline Capable

- AI orchestration must support fully offline operation (Local AI)
- File scanning and OCR must support local-only processing
- No required callbacks to cloud services
- Feature detection: graceful degradation when cloud services unavailable

### Principle 5: Containerized Deployment

- Docker Compose for single-server On-Prem (Phase 8)
- Kubernetes for enterprise On-Prem (Phase 8+)
- Health checks for all services (already partially implemented)
- Backup/restore scripts for PostgreSQL and file storage

### Principle 6: Audit & Governance Do Not Depend on Cloud

- Audit logs are stored in local PostgreSQL (not cloud log services)
- Evidence Graph is local-first (no cloud graph database dependency)
- Governance Engine runs locally (no external policy service)

---

## 19. What to Build Now

### Immediate Priority (Sprints 1–6)

| Priority | Item                                       | Rationale                                                              |
| -------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| 1        | `PlatformOrganization` model + migration   | Foundation for all multi-org features                                  |
| 2        | `ClientWorkspace` + `Project` base models  | Required for workspace isolation                                       |
| 3        | `PlatformUser` + unified auth session      | Required for cross-product identity                                    |
| 4        | Cloud AI Provider implementation           | Required for AI features (Office AI Assistant, AI Abstraction Phase 3) |
| 5        | `S3StorageProvider`                        | Required for cloud file storage                                        |
| 6        | `PlatformAuditLog` (dual-write)            | Required for unified audit trail                                       |
| 7        | Route migration (`[orgSlug]` prefix)       | Required for org-scoped workspaces                                     |
| 8        | `PlatformRole` + extended permission guard | Required for cross-product RBAC                                        |

### Near-Term Priority (Sprints 7–9)

| Priority | Item                                                    | Rationale                           |
| -------- | ------------------------------------------------------- | ----------------------------------- |
| 9        | Office AI Assistant MVP                                 | First shared governed application   |
| 10       | Shared Evidence Graph (`EvidenceNode` + `EvidenceEdge`) | Required for cross-product evidence |
| 11       | Shared Reporting Engine                                 | Required for all products           |
| 12       | Office AI Assistant handlers (6 query types)            | Core AI assistant capability        |

### Medium-Term Priority (Sprints 10–12)

| Priority | Item                         | Rationale                 |
| -------- | ---------------------------- | ------------------------- |
| 13       | LocalContentOS workspace MVP | Second strategic product  |
| 14       | Scheduled report generation  | Enterprise feature        |
| 15       | Azure Blob Storage provider  | Private Cloud readiness   |
| 16       | Bilingual report templates   | Core platform requirement |

---

## 20. What to Defer

| Item                          | Defer To           | Rationale                                     |
| ----------------------------- | ------------------ | --------------------------------------------- |
| On-Prem deployment package    | Phase 8 (roadmap)  | Requires Cloud Platform stabilization first   |
| Local AI runtime              | Phase 5 (roadmap)  | Requires Cloud AI provider first              |
| Air-Gapped mode               | Phase 8+ (roadmap) | Requires On-Prem + Local AI                   |
| AQLIYA Studio                 | Phase 9 (roadmap)  | Requires Core + Governance + Workflow clarity |
| Institutional Memory engine   | Phase 8+ (roadmap) | Not yet scoped                                |
| Model Governance registry     | Phase 7 (roadmap)  | Governance hardening phase                    |
| SSO/LDAP/AD integration       | Post-12 sprints    | Enterprise requirement, not MVP               |
| SIEM integration              | Post-12 sprints    | Enterprise requirement, not MVP               |
| Streaming AI responses        | Post-Office AI MVP | Nice-to-have, not MVP requirement             |
| Conversational AI memory      | Post-Office AI MVP | Stateless is sufficient for MVP               |
| Email integration (Office AI) | Post-Office AI MVP | Requires secure email connector               |
| MFA                           | Post-12 sprints    | Enterprise tier requirement                   |
| Custom branding/white-label   | Post-12 sprints    | Enterprise tier requirement                   |
| Public API (REST/GraphQL)     | Post-12 sprints    | Not yet required by products                  |

---

## 21. Implementation Backlog by Sprint

### Sprint 1: Platform Organization Foundation

**Goal:** Create unified tenant identity model.

| Task                                                                                     | Type   | Dependencies               |
| ---------------------------------------------------------------------------------------- | ------ | -------------------------- |
| Create `PlatformOrganization` Prisma model                                               | Schema | None                       |
| Create migration: add `platformOrganizationId` to `Organization` and `AuditOrganization` | Schema | PlatformOrganization model |
| Create seed migration: backfill `PlatformOrganization` from existing orgs                | Data   | Migration                  |
| Add `[orgSlug]` route group (shell only)                                                 | Routes | PlatformOrganization       |
| Extend auth session to include `platformOrganizationId`                                  | Auth   | PlatformOrganization       |
| Create `org-guard.ts` route guard                                                        | Guard  | Auth session               |
| Update `tenant-guard.ts` to validate platform org                                        | Guard  | Auth session               |

**Validation:** New signup creates `PlatformOrganization`; existing orgs continue working.

### Sprint 2: Workspace and Project Models

**Goal:** Create shared workspace and project abstraction.

| Task                                                                       | Type    | Dependencies                    |
| -------------------------------------------------------------------------- | ------- | ------------------------------- |
| Create `ClientWorkspace` Prisma model                                      | Schema  | PlatformOrganization (Sprint 1) |
| Create `Project` base Prisma model                                         | Schema  | ClientWorkspace                 |
| Create migration: add `projectId` to applicable models                     | Schema  | Project model                   |
| Create workspace manager service (`src/lib/platform/workspace-manager.ts`) | Service | ClientWorkspace                 |
| Create workspace guard (`workspace-guard.ts`)                              | Guard   | ClientWorkspace                 |
| Create `PlatformUser` Prisma model                                         | Schema  | PlatformOrganization            |
| Backfill `PlatformUser` from existing `User` and `AuditUser`               | Data    | PlatformUser model              |

**Validation:** User can create workspace; projects created within workspace are isolated.

### Sprint 3: RBAC + File Storage + Audit Unification

**Goal:** Unified permission model, cloud file storage, and unified audit trail.

| Task                                                    | Type    | Dependencies                    |
| ------------------------------------------------------- | ------- | ------------------------------- |
| Create `PlatformRole` Prisma model                      | Schema  | PlatformUser (Sprint 2)         |
| Create `PlatformAuditLog` Prisma model                  | Schema  | PlatformOrganization (Sprint 1) |
| Create permission guard (`permission-guard.ts`)         | Guard   | PlatformRole                    |
| Implement `S3StorageProvider`                           | Service | Storage abstraction (existing)  |
| Add signed URL generation to File Vault                 | Service | S3StorageProvider               |
| Implement dual-write: `AuditEvent` + `PlatformAuditLog` | Service | PlatformAuditLog                |
| Implement dual-write: `AuditLog` + `PlatformAuditLog`   | Service | PlatformAuditLog                |
| Define global permission matrix as TypeScript types     | Types   | PlatformRole                    |

**Validation:** S3 upload/download works; audit events written to unified log; RBAC enforced at org/workspace/project level.

### Sprint 4: Cloud AI Provider + AI Abstraction

**Goal:** Wire Cloud AI provider and complete AI abstraction layer.

| Task                                                             | Type     | Dependencies                |
| ---------------------------------------------------------------- | -------- | --------------------------- |
| Implement `CloudAIProvider.execute()` — wire to external LLM API | Service  | Existing provider interface |
| Create `AiActionLog` Prisma model                                | Schema   | PlatformOrganization        |
| Implement AI action logging                                      | Service  | AiActionLog                 |
| Add output validation against provider interface                 | Service  | CloudAIProvider             |
| Build prompt registry with versioning (file-based)               | Service  | Existing prompt-registry.ts |
| Add AI health check endpoint                                     | API      | CloudAIProvider             |
| Add provider fallback chain (Cloud → Deterministic)              | Service  | Both providers              |
| Deprecate `src/lib/audit/ai-service.ts`                          | Refactor | CloudAIProvider             |

**Validation:** Cloud AI calls succeed with validated output; fallback to deterministic works; all AI actions logged.

### Sprint 5: Evidence Graph

**Goal:** Create cross-product Evidence Graph.

| Task                                                                 | Type      | Dependencies               |
| -------------------------------------------------------------------- | --------- | -------------------------- |
| Create `EvidenceNode` Prisma model                                   | Schema    | Project (Sprint 2)         |
| Create `EvidenceEdge` Prisma model                                   | Schema    | EvidenceNode               |
| Create evidence graph service (`src/lib/platform/evidence-graph.ts`) | Service   | EvidenceNode, EvidenceEdge |
| Migrate `AuditEvidenceLink` to shared `EvidenceEdge` (dual-write)    | Data      | EvidenceEdge               |
| Create evidence graph query API                                      | API       | Evidence graph service     |
| Create evidence graph visualization component                        | Component | Evidence graph service     |
| Add evidence linking to governance context in AI Orchestration       | Service   | Evidence graph service     |

**Validation:** Evidence links created cross-product; graph queries return correct relationships.

### Sprint 6: Shared Reporting Engine

**Goal:** Refactor AuditOS export into shared reporting engine.

| Task                                                              | Type     | Dependencies         |
| ----------------------------------------------------------------- | -------- | -------------------- |
| Create `ReportTemplate` Prisma model                              | Schema   | PlatformOrganization |
| Move `src/lib/audit/export/` → `src/lib/platform/reporting/`      | Refactor | None                 |
| Create shared `ReportingEngine` with product-agnostic API         | Service  | Reporting code       |
| Add bilingual (Arabic/English) report support                     | Service  | ReportingEngine      |
| Add watermark support (draft/approved/confidential)               | Service  | ReportingEngine      |
| Create report distribution service (email, download, shared link) | Service  | ReportingEngine      |
| Add export policy framework                                       | Service  | ExportControl        |

**Validation:** Reports generate in PDF/XLSX with correct watermarks; bilingual output works.

### Sprint 7: Office AI Assistant — Core

**Goal:** First iteration of Office AI Assistant with core capabilities.

| Task                                                        | Type       | Dependencies               |
| ----------------------------------------------------------- | ---------- | -------------------------- |
| Create `documentSummaryHandler`                             | AI Handler | CloudAIProvider (Sprint 4) |
| Create `excelAnalysisHandler`                               | AI Handler | CloudAIProvider            |
| Create `reportDraftHandler`                                 | AI Handler | CloudAIProvider            |
| Create assistant UI component (embedded panel)              | Component  | Workspace shell            |
| Add human review gate before output finalization            | Service    | Workflow Engine (existing) |
| Wire AI outputs to Evidence Graph (source linking)          | Service    | Evidence Graph (Sprint 5)  |
| Log all assistant actions to AiActionLog + PlatformAuditLog | Service    | Sprint 3 + Sprint 4        |
| Add assistant panel to AuditOS workspace (pilot)            | Component  | Assistant UI               |

**Validation:** Document summary works; report draft generates with evidence links; human review gate functions.

### Sprint 8: Office AI Assistant — Advanced

**Goal:** Expand assistant capabilities.

| Task                                                                 | Type       | Dependencies                     |
| -------------------------------------------------------------------- | ---------- | -------------------------------- |
| Create `outlineGenerationHandler`                                    | AI Handler | CloudAIProvider                  |
| Create `executiveSummaryHandler`                                     | AI Handler | CloudAIProvider                  |
| Create `notesSummaryHandler`                                         | AI Handler | CloudAIProvider                  |
| Create `bilingualDraftHandler`                                       | AI Handler | CloudAIProvider                  |
| Create `workspaceQaHandler`                                          | AI Handler | CloudAIProvider + Evidence Graph |
| Add DOCX/PPTX export support to Reporting Engine                     | Service    | Reporting Engine (Sprint 6)      |
| Add assistant standalone view at `/(dashboard)/[orgSlug]/assistant/` | Route      | Assistant UI                     |
| Add RBAC enforcement for assistant actions                           | Guard      | Permission Guard (Sprint 3)      |

**Validation:** All 6 query types work; bilingual output correct; workspace-scoped Q&A respects permissions.

### Sprint 9: Route Migration + Governance Hardening

**Goal:** Complete route migration and harden shared governance.

| Task                                                   | Type      | Dependencies                 |
| ------------------------------------------------------ | --------- | ---------------------------- |
| Implement `/audit` → `/[orgSlug]/audit` redirect       | Route     | Sprint 1 org slug            |
| Update all internal links to use org-scoped routes     | Refactor  | Redirect                     |
| Add route backward-compat layer (2 release cycles)     | Route     | Redirect                     |
| Extend Governance Engine for per-organization policies | Service   | Governance Engine (existing) |
| Add workflow template system (predefined flows)        | Service   | Workflow Engine (existing)   |
| Add governance policy configuration UI                 | Component | Governance Engine            |
| Harden permission guard with performance caching       | Guard     | Sprint 3                     |

**Validation:** Legacy `/audit` routes redirect correctly; governance policies per organization work.

### Sprint 10: LocalContentOS Workspace MVP

**Goal:** Begin second strategic product implementation.

| Task                                                                        | Type        | Dependencies                 |
| --------------------------------------------------------------------------- | ----------- | ---------------------------- |
| Create `ContentProject` model (extends Project)                             | Schema      | Project (Sprint 2)           |
| Create `SupplierRecord`, `LocalityAssessment`, `SpendClassification` models | Schema      | ContentProject               |
| Create LocalContentOS workspace route                                       | Route       | Org-scoped routes (Sprint 9) |
| Create LocalContentOS components                                            | Component   | Workspace shell              |
| Reuse file scanner for document intake                                      | Service     | Existing `file-scanner.ts`   |
| Wire to shared Governance + Workflow + RBAC + Audit                         | Integration | All shared Core services     |
| Create local content report template                                        | Template    | Reporting Engine (Sprint 6)  |

**Validation:** Content project created; documents uploaded; governance workflow functions.

### Sprint 11: Scheduled + Automated Reporting

**Goal:** Add scheduled report generation and distribution.

| Task                                                         | Type      | Dependencies         |
| ------------------------------------------------------------ | --------- | -------------------- |
| Add scheduled report background job (cron)                   | Service   | Reporting Engine     |
| Add email distribution for scheduled reports                 | Service   | Reporting Engine     |
| Create dashboard widgets (recent exports, scheduled reports) | Component | Reporting Engine     |
| Add report access logging                                    | Service   | PlatformAuditLog     |
| Add report sharing (expiring link)                           | Service   | Reporting Engine     |
| Add custom report templates per organization                 | Template  | ReportTemplate model |

**Validation:** Scheduled report generates and delivers; shared link expires correctly.

### Sprint 12: Azure Blob + Final Hardening

**Goal:** Add Azure Blob provider and final security/compliance hardening.

| Task                                                   | Type        | Dependencies        |
| ------------------------------------------------------ | ----------- | ------------------- |
| Implement `AzureBlobStorageProvider`                   | Service     | Storage abstraction |
| Add client-side encryption option (enterprise tier)    | Service     | File Vault          |
| Add file retention policy enforcement (background job) | Service     | File Vault          |
| Add compliance framework tagging                       | Service     | Governance Engine   |
| Add data export for compliance (GDPR-style)            | Service     | PlatformAuditLog    |
| Security audit and penetration testing                 | Security    | All services        |
| Performance audit and optimization                     | Performance | All services        |
| Update all documentation to reflect Cloud Platform     | Docs        | All                 |

**Validation:** Azure Blob upload/download works; security audit passes; retention policies enforced.

---

## 22. Validation Strategy

### Per-Sprint Validation

| Sprint | Validation Criteria                                                        |
| ------ | -------------------------------------------------------------------------- |
| 1      | New org created; existing orgs migrated; auth session carries org ID       |
| 2      | Workspace created; project created; data isolated between workspaces       |
| 3      | S3 upload/download works; unified audit log receives events; RBAC enforced |
| 4      | Cloud AI call succeeds; fallback to deterministic; AI action logged        |
| 5      | Evidence links created; graph query returns correct relationships          |
| 6      | PDF/XLSX generated from shared engine; bilingual output correct            |
| 7      | Document summary generated; evidence linked; human review gate works       |
| 8      | All 6 assistant handlers work; workspace-scoped Q&A correct                |
| 9      | Legacy routes redirect; org-level governance policy enforced               |
| 10     | Content project lifecycle complete; governance workflow functions          |
| 11     | Scheduled report generates and delivers; shared link expires               |
| 12     | All cloud providers work; security audit passes; retention enforced        |

### Automated Testing

| Test Type         | Scope                           | Tool                 |
| ----------------- | ------------------------------- | -------------------- |
| Unit tests        | All services, guards, handlers  | Jest                 |
| Integration tests | API routes, database operations | Jest + Supertest     |
| RBAC tests        | All permission combinations     | Jest + mock session  |
| AI handler tests  | All prompt/handler combinations | Jest + mock provider |
| E2E tests         | Critical user journeys          | Playwright (future)  |

### Pre-Deployment Gate

```
npx tsc --noEmit        # Must pass with 0 errors
npm run lint             # Must pass (pre-existing warnings documented)
npm run build            # Must pass (includes prisma generate)
npm test                 # Must pass (unit + integration)
# Additional:
npm run audit:health     # Health check must pass
npm run backup:verify    # Data integrity check
```

### Monitoring

- Application performance monitoring (APM) — Response times, error rates, throughput
- AI provider monitoring — Latency, token usage, error rate, fallback rate
- Storage monitoring — Upload/download rates, storage growth, access patterns
- Security monitoring — Failed auth attempts, unusual access patterns, export anomalies

---

## 23. Risks and Mitigations

| Risk                                                      | Likelihood | Impact   | Mitigation                                                                                    |
| --------------------------------------------------------- | ---------- | -------- | --------------------------------------------------------------------------------------------- |
| Data migration from existing org models fails             | Medium     | High     | Dual-write strategy; rollback plan; extensive testing with production-like data               |
| Cloud AI provider latency/cost exceeds budget             | Medium     | Medium   | Deterministic fallback for all handlers; token usage monitoring; cost alerts                  |
| Multi-tenant isolation breach                             | Low        | Critical | Row-level security; schema-per-tenant option; regular security audits                         |
| Route migration breaks existing links/SEO                 | Medium     | Medium   | Backward-compat redirect layer; maintain old routes for 2 release cycles                      |
| Office AI Assistant perceived as chatbot                  | Medium     | Medium   | UI/UX explicitly labels as governed work assistant; no free-form chat; all outputs reviewable |
| LocalContentOS workspace dependencies not ready           | Medium     | Medium   | Shared Core services built first; LocalContentOS uses same Governance/Workflow/RBAC/Audit     |
| Performance degradation from multi-tenant queries         | Medium     | Medium   | Indexed `organizationId`/`workspaceId`; query optimization; connection pooling                |
| Developer learning curve for new shared models            | Medium     | Low      | Comprehensive docs; example implementations; pair programming                                 |
| Scope creep from product teams wanting immediate features | High       | Low      | Strict sprint scope; Product Owner sign-off per sprint; defer non-critical items              |
| PostgreSQL schema migrations for existing data            | Medium     | High     | Backward-compat migrations; test with full dataset; rollback plan per migration               |

---

## 24. Open Questions

These questions require stakeholder decisions before implementation:

### Multi-Organization Model

1. Should `PlatformOrganization` be a new table or should we rename one existing org model (e.g., `Organization` → `PlatformOrganization`)?
2. Should existing `AuditOrganization` records be merged into `PlatformOrganization` or linked via FK?
3. For Private/On-Prem, should we use a single `PlatformOrganization` or skip the org layer entirely?

### Workspace Model

4. Should Office AI Assistant have its own workspace type or should it be embedded within product workspaces?
5. Should workspace creation be self-service or admin-only?
6. What is the maximum number of workspaces per organization for the Cloud Pilot tier?

### AI Strategy

7. Which Cloud AI provider(s) should be supported for MVP? (OpenAI, Claude, Gemini?)
8. Should AI costs be passed to the organization or absorbed in the subscription?
9. What is the acceptable latency for AI responses? (5s? 15s? 30s?)

### LocalContentOS

10. Is LocalContentOS workspace development gated on Cloud Platform completion, or can it proceed in parallel?

### Commercial

11. What is the pricing model for Office AI Assistant? (Per-user? Per-query? Included in subscription?)
12. What organization tier limits apply? (Max users, workspaces, storage, AI queries per month)

### Technical

13. Should we adopt schema-per-tenant for PostgreSQL or row-level `orgId` isolation? (Recommend: row-level for Cloud, single-schema for On-Prem)
14. Should the existing Sunbul product hierarchy be migrated to `PlatformOrganization` or remain separate?
15. What is the SLA target for Cloud Platform availability? (99.5%? 99.9%?)
