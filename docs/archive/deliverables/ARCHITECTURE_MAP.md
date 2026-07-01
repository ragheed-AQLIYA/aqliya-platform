# AQLIYA Architecture Map

**Generated:** 2026-06-24
**Source of truth:** Repository code, Prisma schema, middleware, server actions, route structure

---

## 1. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  src/app/ (551 route files)                                   │
│  ├─ (marketing)/  — Public routes (/, /about, /products, /demo)│
│  ├─ (dashboard)/  — Authenticated product workspaces           │
│  ├─ audit/        — AuditOS                                    │
│  ├─ local-content/ — LocalContentOS                            │
│  ├─ sales/        — SalesOS                                    │
│  ├─ decisions/    — DecisionOS                                 │
│  ├─ office-ai/    — Office AI Assistant                        │
│  ├─ contacts/     — LocalContactOS                             │
│  ├─ content-studio/ — Content Studio                           │
│  ├─ risk/         — RiskOS                                      │
│  ├─ sunbul/       — Sunbul (archived/workflow system)          │
│  ├─ workflowos/   — WorkflowOS                                 │
│  ├─ api/          — API routes                                  │
│  └─ ...            — Other product routes                       │
├──────────────────────────────────────────────────────────────┤
│                    COMPONENT LAYER                              │
│  src/components/ (23 domain directories)                       │
│  ├─ audit/        — AuditOS UI components                      │
│  ├─ local-content/ — LocalContentOS UI                         │
│  ├─ sales/        — SalesOS UI                                 │
│  ├─ decisions/    — DecisionOS UI                              │
│  ├─ contacts/     — LocalContactOS UI                          │
│  ├─ office-ai/    — Office AI Assistant UI                     │
│  ├─ ui/           — Shared UI primitives (shadcn/ui)           │
│  ├─ layout/       — Shared layout components                   │
│  ├─ platform/     — Cross-product platform components          │
│  ├─ enterprise/   — Enterprise UI patterns                     │
│  └─ ...                                                       │
├──────────────────────────────────────────────────────────────┤
│                    ACTION LAYER (Server Actions)                │
│  src/actions/ (~75 files)                                      │
│  ├─ audit-*       — AuditOS actions                            │
│  ├─ decisions*    — DecisionOS actions                         │
│  ├─ localcontent*  — LocalContentOS actions                     │
│  ├─ sales-*       — SalesOS actions                            │
│  ├─ office-ai-*   — Office AI Assistant actions                │
│  ├─ contact-*     — LocalContactOS actions                     │
│  ├─ workflowos-*  — WorkflowOS actions                         │
│  └─ platform-*    — Cross-product actions                      │
├──────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                                │
│  src/lib/ (22 service directories)                             │
│  ├─ ai/           — AI framework (PRIMARY — 69 files)          │
│  ├─ core/ai/      — AI framework (DUPLICATE — 35 files)        │
│  ├─ governance/   — Governance (PRIMARY)                       │
│  ├─ core/governance/ — Governance (DUPLICATE)                  │
│  ├─ core/access/  — Core access control                        │
│  ├─ platform/access/ — Platform RBAC (1,409 lines)             │
│  ├─ platform/abac/ — ABAC engine                               │
│  ├─ core/evidence/ — Core evidence service                     │
│  ├─ platform/evidence/ — Platform evidence                     │
│  ├─ audit/        — AuditOS services                           │
│  ├─ auth/         — Authentication & SSO                       │
│  ├─ platform/     — Platform services (50+ files)              │
│  ├─ decision/     — DecisionOS services                        │
│  ├─ sales/        — SalesOS services                           │
│  ├─ local-content/ — LocalContentOS services                    │
│  ├─ workflowos/   — WorkflowOS services                        │
│  └─ ...                                                       │
├──────────────────────────────────────────────────────────────┤
│                    CORE LAYER                                    │
│  src/core/                                                      │
│  ├─ access/       — Server action guard + access control       │
│  ├─ audit/        — Core audit engine                          │
│  ├─ evidence/     — Core evidence framework                    │
│  ├─ output/       — Core output generators                     │
│  └─ product-runtime.ts — Product runtime                       │
├──────────────────────────────────────────────────────────────┤
│                    PERSISTENCE LAYER                             │
│  prisma/schema.prisma (5,475 lines, ~210 models)               │
│  ├─ PlatformOrganization — Root tenant                         │
│  ├─ User + Account + Session — Auth models                     │
│  ├─ Role/UserRoleAssignment/Permission — RBAC                  │
│  ├─ AbacPolicy/AbacPolicyCondition — ABAC                      │
│  ├─ AuditEngagement → AuditTrialBalance → ... → AuditEvent     │
│  ├─ LocalContentProject → Supplier → Classification → ...     │
│  ├─ Decision → Approval → AuditLog → Evidence                  │
│  ├─ SalesPipeline → SalesDeal → SalesAccount → ...             │
│  ├─ OfficeAiTask → OfficeAiOutput → OfficeAiFile               │
│  └─ ... (~100 more product models)                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Product-to-Schema Mapping

| Product | Prisma Prefix | Core Models | Key Relationships |
|---------|--------------|-------------|-------------------|
| Platform | `Platform*` | Organization, AuditLog, OutboxEvent | Owns all tenant roots |
| AuditOS | `Audit*` | Engagement, TB, Statements, Evidence, Findings | Belongs to PlatformOrganization |
| DecisionOS | `Decision*` | Decision, Approval, AuditLog, Risk, Scenario | Belongs to Organization, Extension |
| LocalContentOS | `LocalContent*` | Project, Supplier, Spend, Classification | Belongs to PlatformOrganization |
| SalesOS | `Sales*` | Pipeline, Account, Deal, Contact, Proposal | Belongs to PlatformOrganization |
| Office AI | `OfficeAi*` | Task, Output, File | Belongs to PlatformOrganization |
| WorkflowOS | `Workflow*` | Template, Record, AuditEvent | Belongs to PlatformOrganization |
| LocalContactOS | `LocalContact*` | Contact, Relation, Interaction | Belongs to PlatformOrganization |
| Sunbul | `Sunbul*` | Client, Record, Document, Review | Legacy |
| Content Studio | `ContentStudio*`, `Content*` | Project, Campaign, Item, Output | Belongs to PlatformOrganization |

---

## 3. Authentication & Authorization Architecture

```
Request
  │
  ▼
Middleware (src/middleware.ts)
  ├─ Rate limit check (middleware-rate-limit.ts)
  ├─ Public path check (isPublicPath)
  ├─ JWT token validation (next-auth/jwt getToken)
  │   └─ If no token → redirect to /login or 401
  ├─ MFA gate check (resolveMfaGateState)
  │   └─ If MFA required → redirect to /login?mfa=true
  └─ RBAC check (routeMinRoles + roleHierarchy)
      └─ If insufficient → 403 or /access-denied
          │
          ▼
    Server Action / API Route
      │
      ▼
    Server Action Guard (src/core/access/server-action-guard.ts)
      ├─ Role check (server-side enforcement)
      ├─ Tenant guard (per-product: audit, sales, etc.)
      └─ Permission check (platform RBAC service)
          │
          ▼
    Domain Service
      │
      ▼
    Database / External Service
```

---

## 4. AI Architecture

```
Client Component
  │
  ▼
Server Action (e.g., audit-intelligence-actions.ts)
  │
  ▼
AI Framework (src/lib/ai/)
  ├─ Orchestrator (orchestrator.ts)
  │   ├─ Prompt Registry (prompt-registry.ts)
  │   ├─ RAG Injection (orchestrator-rag-inject.ts)
  │   └─ Evaluation Gate (eval-gate.ts)
  ├─ Provider Router (provider-router.ts)
  │   └─ → Hybrid Router (hybrid-router.ts)
  ├─ Provider Factory (provider-factory.ts)
  │   ├─ Anthropic Provider
  │   ├─ OpenAI Provider
  │   ├─ Local Provider
  │   ├─ Deterministic Provider
  │   └─ Cloud Provider
  ├─ Spend Tracker (spend-tracker.ts)
  ├─ Budget Manager (budget-manager.ts)
  ├─ AI Observability (observability.ts)
  ├─ Governance Metrics (governance-metrics.ts)
  └─ Ingestion Pipeline (ingestion/ingestion-pipeline.ts)
```

---

## 5. Cross-Cutting Dependencies

### 5.1 Critical Dependency Cycles (Potential)
```
platform/access/rbac-service.ts
  ← depends on → prisma schema (User, Role, Permission, UserRoleAssignment)
  ← depends on → core/access/ (action guard pattern)

lib/ai/
  ← depends on → lib/governance/ (governance integration)
  ← depends on → prisma schema (AiActionRegistry, AiModelRegistry, DocumentChunk)

lib/governance/
  ← depends on → prisma schema (AuditEvent, evidence models)
  ← depends on → lib/audit/ (audit-specific governance)
```

### 5.2 Shared Service Dependencies
- `src/lib/platform/` depends on: prisma, auth, storage, email, redis, sentry
- `src/lib/ai/` depends on: prisma, providers (external), platform config
- `src/actions/` depends on: lib services, prisma, auth
- `src/components/` depends on: actions (server actions), shared ui components

---

## 6. Infrastructure Architecture

```
Internet
  │
  ▼
Next.js Edge (Middleware)
  ├─ Rate limiter (Edge-compatible)
  ├─ Security headers
  ├─ Auth check (JWT)
  └─ RBAC gate
      │
      ▼
Next.js Server (Node.js 22)
  ├─ Sentry monitoring (client + edge + server)
  ├─ Redis (Bull queue, rate limiting, cache)
  ├─ PostgreSQL 16 + pgvector
  └─ File storage (local/S3)
```

---

## 7. Data Flow Pattern

```
User Interaction → Client Component
  → Server Action (src/actions/)
    → Permission Guard (src/core/access/ or product guard)
    → Domain Service (src/lib/<product>/)
      → AI Service (src/lib/ai/) [optional]
      → Database (Prisma)
      → Audit Log (PlatformAuditLog / AuditEvent)
      → Outbox Event (optional, for async processing)
    → Response → Client Component
```

---

*This architecture map was derived from actual file system inspection, source code analysis of service boundaries, and dependency tracing. It reflects implementation reality, not documentation intent.*
