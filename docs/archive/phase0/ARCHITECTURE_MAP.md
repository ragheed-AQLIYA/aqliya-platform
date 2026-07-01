# AQLIYA — Architecture Map
**Phase 0 Reality Audit | Generated: 2026-06-24**

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser / RTL)                           │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼─────────────────────────────────────────┐
│                    CloudFront CDN (static assets, S3)                   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│              Next.js App (ECS Fargate — me-south-1)                     │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │  Edge Middleware │  │  App Router Pages │  │   API Routes (62)     │  │
│  │  (auth, RBAC,   │  │  (260 pages)      │  │   /api/...            │  │
│  │  MFA, rate limit)│  │                  │  │                       │  │
│  └─────────────────┘  └──────────────────┘  └───────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │               Server Actions (src/actions/)                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │               Application Library (src/lib/)                     │   │
│  │  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐ │   │
│  │  │  lib/core/   │  │  lib/platform/ │  │  Product libs        │ │   │
│  │  │  (engines)   │  │  (services)    │  │  audit, sales, lc... │ │   │
│  │  └──────────────┘  └────────────────┘  └──────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Prisma ORM → PostgreSQL + pgvector (RDS Multi-AZ)              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
         │           │            │             │
         ▼           ▼            ▼             ▼
    Redis        S3 Storage   AI Providers  Email (SMTP)
  (ElastiCache)  (+ CloudFront)  (Anthropic,  (Nodemailer)
                               OpenAI, vLLM)
```

---

## 2. Source Code Layer Map

### Layer 1 — Request Handling (Edge)
```
src/middleware.ts               Auth gate + RBAC + MFA gate + rate limit
src/middleware-security.ts      Security headers (CSP, X-Frame-Options, etc.)
src/middleware-rate-limit.ts    Edge-compatible rate limit (Node-side Redis call)
```

### Layer 2 — Routing (Next.js App Router)
```
src/app/
├── (dashboard)/               Protected product workspaces (auth required)
│   ├── assistant/             Office AI Assistant [/assistant/*]
│   ├── decisions/             DecisionOS [/decisions/*]
│   ├── governance-hub/        Governance Hub [/governance-hub/*]
│   ├── intelligence/          Intelligence Core [/intelligence/*]
│   ├── knowledge-foundation/  Knowledge Foundation [/knowledge-foundation/*]
│   ├── knowledge-review/      Knowledge Review [/knowledge-review/*]
│   ├── monitoring/            Platform Monitoring [/monitoring/*]
│   ├── notifications/         Platform Notifications [/notifications/*]
│   ├── operator/              Operator Dashboard [/operator/*]
│   ├── organizations/         Org Management [/organizations/*]
│   ├── overview/              Platform Overview [/(dashboard)/overview]
│   └── settings/              Platform Settings [/settings/*]
│
├── (marketing)/               Public marketing pages (no auth)
│   ├── products/, buyers/     Product pages
│   ├── insights/              Blog articles
│   └── [other public pages]
│
├── audit/                     AuditOS workspace [/audit/*]
├── auditos/                   AuditOS public demo [/auditos/*] ← MOCK ONLY
├── contacts/                  LocalContactOS [/contacts/*]
├── content-studio/            ContentStudio [/content-studio/*]
├── institutional-memory/      Institutional Memory [/institutional-memory/*]
├── local-content/             LocalContentOS [/local-content/*]
├── office-ai/                 Office AI workspace [/office-ai/*]
├── risk/                      RiskOS [/risk/*] ← CONTRADICTS AGENTS.md
├── sales/                     SalesOS [/sales/*]
├── sampling/                  Sampling workspace [/sampling/*]
├── workflowos/                WorkflowOS [/workflowos/*]
│
├── en/                        ⚠ DUPLICATE: 21 English marketing routes
├── sunbul/                    ⚠ SHOULD BE REDIRECT: has live page content
├── print/                     Print/PDF views (public-ish)
└── published/                 Public published recommendations
```

### Layer 3 — Server Actions
```
src/actions/
├── audit-actions.ts           AuditOS mutations
├── contact-actions.ts         LocalContactOS mutations
├── decision-actions.ts        DecisionOS mutations
├── decision-evidence-actions.ts
├── knowledge-foundation-actions.ts (+ related)
├── localcontent-*.ts          LocalContentOS mutations
├── office-ai-workspace-actions.ts
├── sales-actions.ts           ⚠ TS ERRORS (SALES_OS enum missing)
├── sales-icp-actions.ts       ⚠ TS ERRORS
└── workflow-actions.ts
```

### Layer 4 — Library (Core Engines)
```
src/lib/core/
├── ai/                 AI execution engine, providers, routing, budget, eval
│   ├── engine.ts       Governed AI executor
│   ├── provider-factory.ts
│   ├── hybrid-router.ts
│   ├── budget-manager.ts
│   ├── spend-tracker.ts
│   ├── observability.ts
│   ├── eval-gate.ts
│   ├── prompt-registry.ts
│   └── providers/      Anthropic, OpenAI, vLLM, local, deterministic, circuit-breaker
├── audit/              Audit engine
├── decision/           Decision engine + evaluators (framework, risk, scenarios, intake)
│   └── adapters/       DecisionOS adapter
├── evidence/           Core evidence service, graph, lifecycle, workflow bridge
│   └── adapters/       Audit + LocalContent adapters
├── events/             Outbox service, SIEM handler, schema registry
├── governance/         Governance engine
├── knowledge/          Knowledge engine + RAG (chunking, embedding, hybrid search, vector)
├── memory/             AI memory + institutional memory service
├── policy/
│   ├── access/         ABAC policy service + condition evaluator
│   └── retention/      Retention policy engine + holds
├── signals/            Signal engine + product signal producers
└── workflow/           Workflow engine + product adapters (workflowos, local-content, decision)
```

### Layer 5 — Library (Platform Services)
```
src/lib/platform/
├── abac/               ABAC policy enforcement
├── access/             SoD (separation of duty) checks
├── audit/              Audit search + hash chain (tamper-evident log)
├── audit-bridge/       AuditOS bridge service
├── cache/              Redis cache adapter + strategy
├── content-studio/     ContentStudio persistence
├── cross-product-ai/   Cross-product AI bridge
├── decision-gov/       Decision governance integration
├── download/           Secure download token service
├── email/              Email sending (Nodemailer)
├── encryption/         Symmetric key management (EncryptionKey model)
├── feature-flags/      Feature flag resolution
├── guards/             Platform-level access guards
├── institutional-memory/ Platform memory service
├── integration/        ERP/CRM integration framework
├── model-governance/   AI model governance + registry
├── monitoring/         System health monitor
├── notification/       Notification engine (email, webhook channels)
├── office-ai-adv/      Advanced Office AI features
├── operations/         Queue runtime (Bull/Redis)
├── org-advanced/       Advanced org management
├── rate-limiter/       Redis + memory rate limiters
├── registry/           Platform service registry
├── retention/          Data retention engine (mirrors lib/core/policy/retention)
├── sales-intelligence/ Sales intelligence service
├── sampling/           Sampling engine
├── secrets/            Vault/secret management
├── siem/               SIEM export + delivery
├── storage/            S3 + local storage provider abstraction
└── [others]
```

### Layer 6 — Library (Product-Specific)
```
src/lib/
├── ai/             ⚠ LEGACY WRAPPER — re-exports from lib/core/ai
├── audit/          AuditOS: materiality, sampling, evidence, independence, export, governance
├── audit-intelligence/  Audit intelligence service
├── decision/       DecisionOS: engine, portfolio, scenarios, signals, sector intelligence
├── decisions/      ⚠ THIN — only export.ts (should be merged into lib/decision)
├── integration/    Integration framework (failover, health, adapters)
├── local-content/  LocalContentOS: approval, scoring, ERP, workbook, classification
├── local-content-intelligence/  LC intelligence
├── localcontactos/ LocalContactOS services
├── marketing/      Marketing utilities
├── office-ai/      Office AI task service
├── organization/   Organization management
├── recommendation/ Recommendation engine
├── rag/            ⚠ DUPLICATE? Check vs lib/core/knowledge/rag
├── sales/          SalesOS: accounts, deals, pipeline, CRM, signals, v02/, vnext/
├── simulation/     Simulation utilities
├── skill-runtime/  AI skill evaluation runtime
├── tb-intelligence/ Trial balance intelligence
├── types/          Cross-product types
├── validation/     Shared validators
└── workflowos/     WorkflowOS business logic
```

### Layer 7 — Authorization Stack
```
src/lib/authorization/
├── authorize.ts        Master authorize() facade
├── action-guard.ts     enforce() / isAllowed() for server actions
├── tenant-guard.ts     Tenant isolation checks
├── product-guards.ts   Per-product guard functions
├── abac-bridge.ts      Bridge to ABAC policy engine
├── middleware-bridge.ts Bridge to edge middleware
├── permission-resolver.ts Permission resolution logic
└── types.ts            CurrentUser, AccessAction, ResourceType

src/core/access/         ⚠ OLD LAYER — partially migrated, still present
├── access-control.ts
├── abac-gate.ts
├── server-action-guard.ts  (now in lib/authorization)
└── abac-shadow.ts
```

---

## 3. Database Architecture

### Primary Database
- PostgreSQL (RDS Multi-AZ) with pgvector extension
- ~200 Prisma models covering all products
- Connection pooling: `@prisma/adapter-pg`

### Model Ownership by Domain

| Domain | Key Models |
|---|---|
| Platform | User, Organization, Role, Permission, UserRoleAssignment, PlatformOrganization, PlatformAuditLog, AuditLog, PlatformOutboxEvent, PlatformNotification |
| Auth | Account, Session, VerificationToken, SsoProvider, SeparationOfDutyRule |
| AuditOS | AuditEngagement, AuditClient, AuditEvidence, AuditFinding, AuditUser, AuditRiskAssessment, AuditTrialBalance(Line), AuditValidationRun, QualityFinding, SamplingPlan, ... |
| DecisionOS | Decision, DecisionEvidence, DecisionFramework, DecisionOutcome, DecisionPattern, DecisionScenario, DecisionRiskAnalysis, Alternative, ... |
| LocalContentOS | LocalContentProject, LocalContentEvidence, LocalContentApproval, LcWorkbook(Line), ErpConnection, ErpImportBatch, ... |
| WorkflowOS | WorkflowRecord, WorkflowTemplate, WorkflowEvidence, SunbulClient, SunbulRecord, ClientWorkspace, ... |
| SalesOS | SalesAccount, SalesDeal, SalesContact, SalesPipeline(Stage), SalesProposal, SalesInteraction, SalesApproval, CrmConnection, ... |
| LocalContactOS | LocalContact, LocalContactInteraction, LocalContactRelation, ContactApproval, ContactEvidence |
| ContentStudio | ContentStudioItem, ContentStudioProject, ContentStudioApproval, ContentWorkspace, ContentItem |
| AI / Knowledge | AiModelRegistry, AiContextBridge, DocumentChunk, KnowledgeFoundationVersion, KnowledgeCandidate, IntelligenceGraphNode(Edge), AgentMemory |
| Platform Services | HashChainEntry, EncryptionKey, VaultEntry, PlatformSecret, TenantIntegration, PlatformOutboxEvent |
| ABAC | AbacPolicy, AbacPolicyAssignment, AbacPolicyCondition |

---

## 4. AI Architecture

```
Request (product action)
     │
     ▼
lib/core/ai/engine.ts (governed executor)
     │
     ├─── lib/core/ai/eval-gate.ts         (pre-flight governance gate)
     ├─── lib/core/ai/orchestrator.ts      (task orchestration)
     │         └── orchestrator-rag-inject.ts (RAG context injection)
     ├─── lib/core/ai/hybrid-router.ts     (cloud/local/hybrid decision)
     │         ├─── cloud-provider.ts
     │         ├─── local-provider.ts (Ollama)
     │         └─── deterministic-provider.ts (testing)
     ├─── lib/core/ai/budget-manager.ts    (per-org spend limits)
     ├─── lib/core/ai/spend-tracker.ts     (usage tracking → DB)
     ├─── lib/core/ai/observability.ts     (metrics, latency, errors)
     └─── lib/core/ai/governance-metrics.ts

RAG Pipeline:
lib/core/knowledge/rag/
     ├─── embedding-service.ts → openai-embedding-provider.ts
     ├─── vector-store.ts → PostgreSQL pgvector
     ├─── hybrid-search.ts (semantic + keyword)
     └─── rag-retriever.ts → knowledge-service.ts
```

---

## 5. Event / Outbox Architecture

```
Product action triggers event
     │
     ▼
lib/core/events/outbox-service.ts
     │ (PlatformOutboxEvent → DB — transactional write)
     ▼
Outbox handlers (outbox-handlers.ts):
     ├── outbox-notification-handler.ts → Notification Engine
     └── outbox-siem-handler.ts → SIEM delivery (lib/platform/siem/)

Feature-flagged: FF_EVENT_OUTBOX, FF_EVENT_SCHEMA_REGISTRY
```

---

## 6. Infrastructure Topology

```
AWS me-south-1 (PRIMARY)
┌────────────────────────────────────────────────────────────┐
│  VPC                                                        │
│  ┌─────────────────┐    ┌─────────────────────────────┐   │
│  │  ECS Fargate    │    │  RDS PostgreSQL (Multi-AZ)  │   │
│  │  (3-10 tasks)   │◄──►│  + pgvector extension       │   │
│  │  1 vCPU / 2 GB  │    └─────────────────────────────┘   │
│  └────────┬────────┘    ┌─────────────────────────────┐   │
│           │             │  ElastiCache Redis           │   │
│           │◄───────────►│  (cache, rate limit, queues) │   │
│           │             └─────────────────────────────┘   │
│           │             ┌─────────────────────────────┐   │
│           │◄───────────►│  S3 (uploads + assets)      │   │
│           │             └─────────────────────────────┘   │
│  CloudWatch Alarms/Logs                                    │
│  Sentry (error tracking)                                   │
└────────────────────────────────────────────────────────────┘
         │ Cross-region replication
         ▼
AWS eu-central-1 (DR)
┌────────────────────────────────────────────────────────────┐
│  RDS Read Replica + S3 Cross-Region Replication            │
└────────────────────────────────────────────────────────────┘
```

---

## 7. Security Architecture

```
Perimeter:
  CloudFront → WAF (if configured) → ECS

Edge:
  middleware.ts:
    1. Rate limit check (Redis-backed)
    2. Public path bypass
    3. JWT token verification (NextAuth)
    4. MFA gate (enroll/verify)
    5. RBAC minimum role check

Application:
  Server Actions → lib/authorization/authorize()
                 → lib/authorization/tenant-guard.ts
                 → lib/core/policy/access/ (ABAC - FF_ABAC_ENFORCE)

Data:
  AuditLog / PlatformAuditLog → all mutations logged
  HashChainEntry → tamper-evident log chain
  EncryptionKey + VaultEntry → field-level encryption
  DownloadTicket → short-lived signed download tokens

File Upload:
  ClamAV integration → file-scanner.ts
  S3 pre-signed URLs for direct upload
```

---

*Architecture Map generated from live code — 2026-06-24.*
