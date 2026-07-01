# AQLIYA Dependency Graph

**Generated:** 2026-06-24
**Methodology:** File-level dependency tracing from source code import analysis + Prisma schema relationship analysis.

---

## 1. Layer Dependency Flow

```
src/app/ (Routes/Pages)
  ├── Depends on: src/components/, src/actions/
  └── Import restrictions: Server-only modules via server actions only

src/components/ (UI)
  ├── Depends on: src/actions/ (server actions), src/lib/(domain)/types
  ├── Depends on: src/components/ui/ (shared primitives)
  └── Must NOT import: prisma, server-only modules, lib/* directly (must go through actions)

src/actions/ (Server Actions)
  ├── Depends on: src/lib/(domain), src/core/access/, src/lib/platform/access/
  ├── Depends on: src/lib/prisma.ts, src/lib/auth.ts
  └── "use server" boundary — safe to import server modules

src/lib/ (Services)
  ├── lib/ai/ ←→ lib/governance/ (GOOD: clear integration)
  ├── lib/ai/ → lib/platform/ (for config, storage, etc.)
  ├── lib/audit/ → lib/ai/ (AI-powered audit features)
  ├── lib/audit/ → lib/governance/ (governance rules)
  ├── lib/sales/ → lib/platform/access/ (RBAC checks)
  ├── lib/local-content/ → lib/platform/ (guards, storage)
  └── ALL → prisma schema (via lib/prisma.ts)

src/core/ (Core Platform)
  ├── core/access/ → independent (just imports types + prisma)
  ├── core/ai/ → DUPLICATE of lib/ai/ (should be removed)
  ├── core/evidence/ → prisma
  ├── core/governance/ → DUPLICATE of lib/governance
  └── core/audit/ → prisma
```

---

## 2. Product Dependency Matrix

| Product Depends On | plat | audit | ai | gov | dec | lc | sales | wfos | cont | store | risk |
|-------------------|------|-------|----|-----|-----|----|-------|------|------|-------|------|
| Platform | — | — | ✓ | ✓ | — | — | — | — | — | — | — |
| AuditOS | ✓ | — | ✓ | ✓ | — | — | — | — | — | — | — |
| DecisionOS | ✓ | — | ✓ | ✓ | — | — | — | — | — | — | — |
| LocalContentOS | ✓ | — | ✓ | ✓ | — | — | — | — | — | — | — |
| SalesOS | ✓ | — | ✓ | ✓ | — | — | — | — | — | — | — |
| WorkflowOS | ✓ | — | — | — | — | — | — | — | — | — | — |
| LocalContactOS | ✓ | — | — | — | — | — | — | — | — | — | — |
| Content Studio | ✓ | — | ✓ | — | — | — | — | — | — | — | — |
| Office AI | ✓ | — | ✓ | ✓ | — | — | — | — | — | — | — |
| RiskOS | ✓ | ✓ | ✓ | — | — | — | — | — | — | — | — |

**Key:** plat=Platform, gov=Governance, dec=DecisionOS, lc=LocalContentOS, wfos=WorkflowOS, cont=LocalContactOS, store=Content Studio

---

## 3. Prisma Schema Dependency Graph

```
PlatformOrganization
  ├── User (via platformOrganizationId)
  │   ├── Account (OAuth accounts)
  │   ├── Session
  │   ├── UserRoleAssignment → Role → RolePermission → Permission
  │   └── AuditUser → AuditOrganization → AuditClient → AuditEngagement
  │       ├── AuditTrialBalance → AuditTrialBalanceLine
  │       ├── AuditCanonicalAccount → AuditAccountMapping
  │       ├── AuditFinancialStatement → AuditDisclosureNote
  │       ├── AuditEvidence → AuditEvidenceLink → AuditEvidenceVersion
  │       ├── AuditFinding → AuditRecommendation
  │       ├── AuditReviewComment → AuditApprovalRecord
  │       ├── AuditEvent (polymorphic audit log)
  │       └── AuditAiOutput
  ├── LocalContentProject
  │   ├── LocalContentSupplier
  │   ├── LocalContentSpendRecord
  │   ├── LocalContentClassification
  │   ├── LocalContentEvidence
  │   ├── LocalContentFinding → LocalContentReview → LocalContentApproval
  │   └── LocalContentAuditEvent
  ├── SalesPipeline → SalesPipelineStage → SalesDeal → SalesAccount
  │   ├── SalesContact → SalesInteraction
  │   ├── SalesProposal → SalesEvidenceLink
  │   ├── SalesReview → SalesApproval
  │   └── SalesAuditEvent
  ├── Decision (via Organization)
  │   ├── Approval → AuditLog
  │   ├── DecisionEvidence
  │   ├── DecisionRiskAnalysis
  │   └── DecisionOutcome
  ├── OfficeAiTask → OfficeAiOutput → OfficeAiFile
  ├── LocalContact → LocalContactRelation → LocalContactInteraction
  ├── ContentStudioProject → ContentStudioCampaign → ContentStudioItem
  └── WorkflowTemplate → WorkflowRecord → WorkflowAuditEvent
```

---

## 4. AI Service Dependency Graph

```
src/lib/ai/index.ts (facade)
  ├── provider-factory.ts → provider-router.ts → hybrid-router.ts
  │   ├── anthropic-provider.ts (primary LLM)
  │   ├── openai-provider.ts (secondary LLM)
  │   ├── local-provider.ts (On-Prem mode)
  │   ├── deterministic-provider.ts (fallback)
  │   └── cloud-provider.ts (cloud abstraction)
  │       └── provider-circuit-breaker.ts (failover)
  ├── orchestrator.ts → prompt-registry.ts → governed-ai-metadata.ts
  │   └── orchestrator-rag-inject.ts → retrieval/context-builder.ts
  │       └── embedding/embedding-provider.ts → retrieval/similarity-search.ts
  ├── eval-gate.ts → eval/eval-runner.ts → eval/eval-types.ts
  ├── intelligence-runtime.ts (cross-product AI execution)
  ├── model-registry.ts → governance-metrics.ts
  ├── spend-tracker.ts → budget-manager.ts → cost-mapping.ts
  ├── observability.ts (Sentry + custom metrics)
  └── ingestion/ingestion-pipeline.ts (document ingestion for RAG)
```

---

## 5. Authorization Dependency Graph

```
Middleware (edge) — independent
  └── Uses: next-auth/jwt getToken, routeMinRoles map

Server Action Guard (src/core/access/server-action-guard.ts)
  ├── imports: session from next-auth
  ├── imports: role/permission types
  └── imports: product-specific guard functions

Product Guards (decentralized)
  ├── src/lib/audit/tenant-guard.ts
  │   └── imports: prisma, session
  ├── src/lib/sales/guards.ts
  │   └── imports: prisma, session, permissions
  ├── src/lib/local-content/guards.ts
  │   └── imports: prisma, session
  ├── src/lib/workflowos/tenant-guard.ts
  │   └── imports: prisma, session
  └── src/lib/platform/guards/*.ts
      └── imports: prisma, session

Platform RBAC (src/lib/platform/access/)
  ├── rbac-service.ts
  │   └── imports: prisma, session
  ├── permissions.ts (independent — just enums/types)
  ├── workspace-access.ts
  │   └── imports: prisma
  ├── principal.ts (independent — just types)
  └── sod-service.ts (separation of duties)
      └── imports: prisma

ABAC (src/lib/platform/abac/)
  ├── abac-service.ts
  │   └── imports: prisma, condition-evaluator
  └── condition-evaluator.ts (independent)
```

---

## 6. External Service Dependencies

| Service | Integration Point | Purpose | Configuration Required |
|---------|------------------|---------|----------------------|
| Anthropic API | `src/lib/ai/providers/anthropic-provider.ts` | Primary LLM | ANTHROPIC_API_KEY |
| OpenAI API | `src/lib/ai/providers/openai-provider.ts` | Secondary LLM | OPENAI_API_KEY |
| OpenAI Embeddings | `src/lib/ai/providers/openai-embedding-provider.ts` | Vector embeddings | OPENAI_API_KEY |
| PostgreSQL + pgvector | `prisma/schema.prisma`, `src/lib/prisma.ts` | Database | DATABASE_URL |
| Redis | `src/lib/platform/redis-*.ts`, Bull, rate-limiter | Cache, queue, rate-limit | REDIS_URL |
| Sentry | `sentry.{client,edge,server}.config.ts` | Error tracking | SENTRY_DSN |
| AWS S3 | `src/lib/platform/storage/s3-storage-provider.ts` | File storage | AWS_* credentials |
| SMTP | `src/lib/platform/email/` | Notifications | SMTP_* config |
| SAML IdP | `@node-saml/node-saml` | SSO | SAML_* config |

---

## 7. Shared Service Duplication Map

### Locations where the same logic exists in 2+ places:

| Concept | Location 1 | Location 2 | Location 3 |
|---------|-----------|-----------|-----------|
| AI Framework | `src/lib/ai/` (69 files) | `src/lib/core/ai/` (35 files) | — |
| Governance | `src/lib/governance/` (8 files) | `src/lib/core/governance/` (2) | `src/lib/audit/governance/` (4) |
| Access Control | `src/lib/core/access/` | `src/lib/platform/access/` | `src/core/access/` |
| Evidence | `src/lib/core/evidence/` | `src/lib/platform/evidence/` | Product-specific |
| RAG Embedding | `src/lib/ai/embedding/` | `src/lib/rag/` | `src/lib/core/knowledge/rag/` |
| Cost Tracking | `src/lib/ai/budget-manager.ts` | `src/lib/ai/spend-tracker.ts` | `src/lib/core/ai/budget-manager.ts` |
| Eval Gate | `src/lib/ai/eval-gate.ts` | `src/lib/core/ai/eval-gate.ts` | — |

---

*This dependency graph was built from import analysis of all TypeScript source files, Prisma schema relationship inspection, and verification of actual file boundaries. No documentation assumptions were used.*
