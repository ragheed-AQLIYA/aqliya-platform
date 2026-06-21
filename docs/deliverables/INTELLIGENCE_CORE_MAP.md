# Intelligence Core Map

**Generated:** 2026-06-21  
**Status:** Discovery — complete intelligence capability inventory  
**Method:** Full repository code inspection across 47 modules

---

## Category Index

| # | Category | Count | Coverage |
|---|----------|-------|----------|
| 1 | AI | 13 | FULL |
| 2 | Governance | 8 | FULL |
| 3 | Audit | 9 | FULL |
| 4 | Workflow | 5 | FULL |
| 5 | Decisioning | 9 | FULL |
| 6 | Knowledge | 7 | PARTIAL |
| 7 | Evidence | 6 | FULL |
| 8 | Signals | 4 | PARTIAL |
| 9 | Notifications | 3 | FULL |
| 10 | Search | 2 | PARTIAL |
| 11 | Authorization | 4 | FULL |
| 12 | Policy | 3 | FULL |
| 13 | Risk | 3 | FULL |
| 14 | Memory | 4 | FULL |

---

## 1. AI

### 1.1 AIOrchestrator
- **Location:** `src/lib/ai/orchestrator.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** AIRequest, GovernanceTaskType, organization budget
- **Outputs:** AIResponse, GenerateEvent (audit-logged)
- **Dependencies:** provider-factory, governance/retrieval-router, platform/audit-log, provider-router, hybrid-router, budget-manager, orchestrator-rag-inject
- **Runtime path:** Server Action → AIOrchestrator.generate() → provider selection → governance injection → execute → audit log
- **Status:** REAL — 383 lines, 3 provider backends, RAG injection, budget check, audit trail

### 1.2 GovernedAIExecutor
- **Location:** `src/lib/ai/governed-ai-executor.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** AIProvider, AIRequest
- **Outputs:** GovernedAIExecuteResult (response, auditId, requiresReview, cost)
- **Dependencies:** platform/audit-log, cost-mapping, feature-flags, budget-manager
- **Runtime path:** Called by orchestrator — wraps provider.execute() with budget check + cost tracking + audit
- **Status:** REAL — 117 lines, production-ready

### 1.3 Provider System
- **Location:** `src/lib/ai/providers/`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** AIRequest
- **Outputs:** AIResponse
- **Dependencies:** llm-http-client, circuit-breaker
- **Status:**
  - `deterministic-provider.ts` — REAL (default fallback)
  - `openai-provider.ts` — REAL (opt-in via env)
  - `anthropic-provider.ts` — REAL (opt-in via env)
  - `cloud-provider.ts` — STUB (throws or not wired)
  - `local-provider.ts` — STUB (Ollama REST, not production)
  - `provider-factory.ts` — REAL
  - `provider-router.ts` — REAL (cost-based optimization)
  - `hybrid-router.ts` — REAL (Orchestrator → Local → Cloud tiered routing)

### 1.4 Governance Context Injection
- **Location:** `src/lib/governance/retrieval-router.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** GovernanceTaskType
- **Outputs:** GovernanceContext (doctrine, evidence reqs, escalation, output boundary)
- **Dependencies:** runtime-types
- **Status:** REAL — 607 lines, 12 task types with full governance context

### 1.5 Intelligence Runtime Router
- **Location:** `src/lib/ai/intelligence-runtime.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** IntelligenceRoutingInput
- **Outputs:** IntelligenceRoutingResult (route, governanceContext, metadata)
- **Dependencies:** governance/retrieval-router
- **Runtime path:** Product AI bridge → routeIntelligenceRequest → governance context lookup → routing decision
- **Status:** REAL — 92 lines, use-case → task-type mapping

### 1.6 AI Handlers
- **Location:** `src/lib/ai/handlers/`
- **Product owner:** AuditOS (primarily)
- **Inputs:** Task-specific context
- **Outputs:** AI-generated drafts/reviews
- **Dependencies:** AIOrchestrator, governance context
- **Status:** REAL — 10 handlers (analytical-review, commercial-claim, disclosure-enrichment, draft-notes, evidence-suggestions, finding-drafts, pilot-decision, recommendation-drafts)
- **Note:** All AuditOS-focused — not cross-product

### 1.7 Product AI Bridge
- **Location:** `src/lib/platform/product-ai-bridge.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** GovernedProductAIInput (productKey, useCase, organizationId, userId, query)
- **Outputs:** GovernedProductAIResult
- **Dependencies:** AIOrchestrator, intelligence-runtime, feature-flags, audit-log
- **Status:** REAL — 122 lines, cross-product entry point

### 1.8 Cross-Product AI Service
- **Location:** `src/lib/platform/cross-product-ai/cross-product-ai-service.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** Product-specific AI inputs
- **Outputs:** AI outputs
- **Dependencies:** product-ai-bridge
- **Status:** REAL — thin wrapper over product-ai-bridge

### 1.9 Prompt Registry
- **Location:** `src/lib/ai/prompt-registry.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** Task type, context
- **Outputs:** Assembled prompts
- **Status:** REAL

### 1.10 AI Evaluation System
- **Location:** `src/lib/ai/eval/`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** Skill evaluation requests
- **Outputs:** Evaluation scores and reports
- **Status:** REAL — 25 skills evaluated, CLI + API + dashboard

### 1.11 Model Registry
- **Location:** `src/lib/ai/model-registry.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** Model configuration
- **Outputs:** Model metadata
- **Status:** REAL — basic registry

### 1.12 Budget Manager / Spend Tracker
- **Location:** `src/lib/ai/budget-manager.ts`, `src/lib/ai/spend-tracker.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — per-tenant budget quotas, cost tracking

### 1.13 AI Review Gate
- **Location:** `src/lib/ai/review/ai-review-gate.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — human review enforcement

---

## 2. Governance

### 2.1 Governance Engine (Core)
- **Location:** `src/lib/governance/`
- **Product owner:** Platform / Intelligence Core
- **Components:** `retrieval-router.ts` (607 lines), `runtime-types.ts` (188 lines), `approval-state.ts`, `escalation.ts`, `provenance.ts`, `actor-lineage.ts`, `prompt-framework.ts`
- **Status:** REAL — full governance runtime with doctrine references, evidence requirements, escalation triggers, approval state machine, output boundaries

### 2.2 Governance Prompt Framework
- **Location:** `src/lib/governance/prompt-framework.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — 6 prompt builders (statement-drafting, mapping, evidence-review, audit-finding, commercial-claim)

### 2.3 ABAC Engine
- **Location:** `src/lib/platform/abac/`
- **Product owner:** Platform
- **Status:** REAL — attribute-based access control with policy conditions and assignments (4 files)

### 2.4 AI Governance Metrics
- **Location:** `src/lib/ai/governance-metrics.ts`, `src/lib/ai/governed-ai-metadata.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — AI output metadata with governance context

### 2.5 Skill Governance
- **Location:** `src/lib/governance/examples/`
- **Product owner:** Platform
- **Status:** REAL — governed skill execution

### 2.6 Decision Governance Bridge
- **Location:** `src/lib/platform/decision-gov/`
- **Product owner:** DecisionOS
- **Status:** REAL — decision-specific governance (4 files)

### 2.7 Audit Governance Bridge
- **Location:** `src/lib/audit/governance-bridge.ts`
- **Product owner:** AuditOS
- **Status:** REAL — audit-specific governance integration

### 2.8 Governance UI
- **Location:** `src/lib/governance/ui/`
- **Product owner:** Platform
- **Status:** REAL — governance UI components

---

## 3. Audit

### 3.1 PlatformAuditLog (Canonical)
- **Location:** `src/lib/platform/audit-log.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** PlatformAuditLogInput
- **Outputs:** PlatformAuditLogWriteResult
- **Dependencies:** Prisma
- **Status:** REAL — central write path, 196 lines, safe/strict modes

### 3.2 AuditLogger (Convenience Layer)
- **Location:** `src/lib/platform/audit-logger.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — thin wrapper over audit-log.ts with context binding, 101 lines

### 3.3 AuditEventService (Legacy/Alternative)
- **Location:** `src/lib/platform/audit-event-service.ts`
- **Product owner:** Platform
- **Status:** REAL — alternative write path that also uses PlatformAuditLog internally, 105 lines
- **Note:** DUPLICATE of audit-log.ts with slightly different interface

### 3.4 Platform-Audit.ts (Legacy)
- **Location:** `src/lib/platform-audit.ts`
- **Product owner:** Platform
- **Status:** REAL but LEGACY — root-level audit utility, alternative path

### 3.5 Audit Hash Chain
- **Location:** `src/lib/platform/audit/` (6 files)
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — immutable hash chain with SHA-256 proof-of-work, 343 lines (audit-store), 194 lines (hash-chain)

### 3.6 Audit Bridge Service
- **Location:** `src/lib/platform/audit-bridge/`
- **Product owner:** Platform
- **Status:** REAL — bridges between audit systems

### 3.7 Audit Intelligence
- **Location:** `src/lib/audit/intelligence/`
- **Product owner:** AuditOS
- **Status:** REAL — audit-specific intelligence index

### 3.8 Audit-Specific Services
- **Location:** `src/lib/audit/` (53 entries including db, export, governance, intelligence, rules, sampling, storage)
- **Product owner:** AuditOS
- **Status:** REAL — extensive domain-specific audit tooling

### 3.9 Audit-Bridge Cross-Product
- **Location:** `src/lib/platform/audit-bridge/`
- **Product owner:** Platform
- **Status:** REAL — cross-product audit integration

---

## 4. Workflow

### 4.1 WorkflowOS Engine
- **Location:** `src/lib/workflowos/services.ts`
- **Product owner:** WorkflowOS
- **Inputs:** CreateWorkflowRecordInput, etc.
- **Outputs:** Workflow records, templates
- **Dependencies:** Prisma, tenant-guard, audit
- **Status:** REAL — 606 lines, template-based workflow, step execution, evidence

### 4.2 WorkflowOS Audit
- **Location:** `src/lib/workflowos/audit.ts`
- **Product owner:** WorkflowOS
- **Status:** REAL — WorkflowAuditEvent model

### 4.3 Workflow Template Service
- **Location:** `src/lib/workflowos/template-service.ts`
- **Product owner:** WorkflowOS
- **Status:** REAL

### 4.4 WorkflowOS Export
- **Location:** `src/lib/workflowos/export/`
- **Product owner:** WorkflowOS
- **Status:** REAL — gated PDF export

### 4.5 Platform Workflow Templates
- **Location:** `src/lib/platform/workflow/product-templates.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** STUB — returns null, only 5 lines

---

## 5. Decisioning

### 5.1 Decision Engine
- **Location:** `src/lib/decision/decision-engine.ts`
- **Product owner:** DecisionOS
- **Inputs:** DecisionForEngine (type, title, status, objectives, alternatives, risks, framework, scenarios, riskAnalyses, recommendation)
- **Outputs:** DecisionStageState[], DecisionCompletionState
- **Dependencies:** intake, framework, scenarios, risk-analysis, recommendation, decision-type-config
- **Status:** REAL — 170 lines, 6-stage pipeline

### 5.2 Decision Intelligence
- **Location:** `src/lib/decision/intelligence-gate.ts`, `decision-ai-bridge.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — AI-assisted decision evaluation

### 5.3 Decision Learning Engine
- **Location:** `src/lib/decision/learning-engine.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — outcome learning and pattern extraction

### 5.4 Decision Sector Intelligence
- **Location:** `src/lib/decision/sector-intelligence.ts`, `sector-intelligence-service.ts`, `sector-benchmark.ts`, `sector-pattern.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — sector-aware decision intelligence

### 5.5 Decision Signals & Alerts
- **Location:** `src/lib/decision/signal-automation.ts`, `signals-alerts.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — monitoring signals, risk alerts (Prisma models: DecisionMonitoringSignal, DecisionRiskAlert)

### 5.6 Decision Outcomes
- **Location:** `src/lib/decision/outcome-correlation.ts`, `outcome-dashboard.ts`, `sector.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — outcome tracking and correlation

### 5.7 Decision Templates
- **Location:** `src/lib/decision/decision-templates.ts`, `decision-type-config.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — configurable decision types

### 5.8 Decision Portfolio
- **Location:** `src/lib/decision/decision-portfolio.ts`, `overview.ts`, `insight.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — portfolio-level analytics

### 5.9 Decision Framework & Intake
- **Location:** `src/lib/decision/framework.ts`, `intake.ts`, `gate.ts`, `scenarios.ts`, `risk-analysis.ts`, `recommendation.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — full decision workflow components

---

## 6. Knowledge

### 6.1 Knowledge Foundation
- **Location:** `knowledge-foundation/` (8 directories, 17 files)
- **Product owner:** Platform / Intelligence Core
- **Status:** CHARTER FROZEN — 7 canonical JSON artifacts, 5 domain directories (IFRS, ISA, ISQM, SOCPA, local-content), governance prompt pack

### 6.2 RAG Knowledge Service
- **Location:** `src/lib/rag/knowledge-service.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** KnowledgeIngestInput (documentId, content, metadata, productKey, sourceType, sensitivity)
- **Outputs:** KnowledgeIngestResult (documentId, chunkCount, tokenCount)
- **Dependencies:** embedding-service, hybrid-search, intelligence-core-rag, audit-log, feature-flags
- **Status:** REAL — 241 lines, feature-flag gated (FF_AI_RAG)

### 6.3 RAG System
- **Location:** `src/lib/rag/` (12 files)
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — full pipeline: chunking, embedding, vector store, hybrid search, governed retrieval, evidence metrics
- **Components:**
  - `chunking-engine.ts` — REAL
  - `embedding-service.ts` — REAL (103 lines)
  - `embedding-provider.ts` — REAL
  - `vector-store.ts` — REAL (pgvector support)
  - `hybrid-search.ts` — REAL (170 lines, 3 modes)
  - `rag-retriever.ts` — REAL (87 lines)
  - `intelligence-core-rag.ts` — REAL (95 lines, governed retrieval)
  - `governed-rag-metrics.ts` — REAL (95 lines, evidence refs, ranking)
  - `governance-metadata.ts` — REAL

### 6.4 TB Intelligence
- **Location:** `src/lib/tb-intelligence/` (20 files)
- **Product owner:** AuditOS (Trial Balance intelligence)
- **Status:** REAL — pattern matcher, classification engine, firm memory, ERP intelligence mining

### 6.5 Audit Knowledge Engine
- **Location:** `src/lib/audit/knowledge-engine.ts`
- **Product owner:** AuditOS
- **Status:** REAL

### 6.6 Local Content Intelligence
- **Location:** `src/lib/local-content-intelligence/` (4 files)
- **Product owner:** LocalContentOS
- **Status:** REAL — audit-engagement bridge for local content

### 6.7 Knowledge Datasets
- **Location:** `knowledge/` (4 dirs)
- **Product owner:** Various
- **Status:** REAL — chart-of-accounts, local-content, tb-intelligence data

---

## 7. Evidence

### 7.1 Evidence Service (Platform)
- **Location:** `src/lib/platform/evidence/evidence-service.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** STUB — 5 lines, returns { id: `ev-${Date.now()}` }

### 7.2 Evidence Engine (Audit)
- **Location:** `src/lib/audit/evidence-versioning-service.ts`
- **Product owner:** AuditOS
- **Status:** REAL — versioned evidence management

### 7.3 Evidence Models (Cross-Product)
- **Prisma models:** AuditEvidence, AuditEvidenceLink, AuditEvidenceVersion, DecisionEvidence, LocalContentEvidence, SalesEvidenceLink, WorkflowEvidence, ContactEvidence, SamplingEvidence
- **Status:** REAL — evidence models exist in every product, all following same pattern

### 7.4 RAG Evidence Metrics
- **Location:** `src/lib/rag/governed-rag-metrics.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — evidence references from RAG retrieval

### 7.5 Governance Provenance
- **Location:** `src/lib/governance/provenance.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — evidence status tracking (createDraftProvenance, attachEvidenceStatus)

### 7.6 Audit Evidence Storage
- **Location:** `src/lib/audit/storage/`
- **Product owner:** AuditOS
- **Status:** REAL — file storage for audit evidence

---

## 8. Signals

### 8.1 Platform Signal Types and Collection
- **Location:** `src/lib/platform/signals/` (7 files)
- **Product owner:** Platform / Intelligence Core
- **Status:**
  - `types.ts` — REAL (RuntimeSignal, ProductMetricSignals)
  - `audit-signal-producer.ts` — REAL (284 lines, query-based audit signals)
  - `sales-signal-producer.ts` — REAL
  - `localcontent-signal-producer.ts` — REAL
  - `cross-product-commercial.ts` — STUB (returns [])
  - `index.ts` — STUB (all collectors return [])
  - `index.ts` exports — PARTIAL (stubs exist but implementations are empty)

### 8.2 Decision Monitoring Signals
- **Location:** `src/lib/decision/signal-automation.ts`, `signals-alerts.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — post-decision monitoring, system-generated signals, human-resolved alerts (Prisma models: DecisionMonitoringSignal, DecisionRiskAlert)

### 8.3 Platform Intelligence Signal Contracts
- **Location:** `src/lib/platform/intelligence.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — IntelligenceSignal, IntelligenceSummary, RiskAssessment, ReadinessAssessment, EvidenceAssessment, WorkflowHealth types with scoring utilities

### 8.4 Audit Signal Producers (Product-specific)
- **Location:** Various product signal implementations
- **Product owner:** Individual products
- **Status:** PARTIAL — Audit has real signal production, others are stubs

---

## 9. Notifications

### 9.1 Platform Notification Engine
- **Location:** `src/lib/platform/notification/` (12 files)
- **Product owner:** Platform / Intelligence Core
- **Inputs:** NotificationPayload (channels, recipients, content)
- **Outputs:** DeliveryResult[]
- **Dependencies:** Prisma (UserNotificationPreference)
- **Status:** REAL — 212 lines, multi-channel (email, in-app, webhook), rate-limiting, preference-aware

### 9.2 WorkflowOS Notification Service
- **Location:** `src/lib/workflowos/notification-service.ts`
- **Product owner:** WorkflowOS
- **Status:** REAL — wraps platform notification engine, adds WorkflowOS-specific types, 221 lines
- **Note:** PARTIAL DUPLICATION of notification/engine.ts usage pattern

### 9.3 Platform Notifications (Alternative)
- **Location:** `src/lib/platform/notifications/` (3 files)
- **Product owner:** Platform
- **Status:** REAL — alternative notification channels
- **Note:** DUPLICATE namespace — same function as platform/notification/ but different implementation

---

## 10. Search

### 10.1 Global Search Action
- **Location:** `src/actions/global-search-actions.ts`
- **Product owner:** Platform
- **Inputs:** Query string, limit
- **Outputs:** SearchResult[] (decisions, accounts, opportunities, engagements, assessments)
- **Runtime path:** Server Action → Prisma queries across 5 product tables → scoreField ranking
- **Status:** REAL — 167 lines, simple cross-product text search, no embeddings

### 10.2 RAG Hybrid Search
- **Location:** `src/lib/rag/hybrid-search.ts`
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — vector + lexical hybrid search over DocumentChunks, feature-flag gated

---

## 11. Authorization

### 11.1 RBAC Service
- **Location:** `src/lib/platform/access/rbac-service.ts`
- **Product owner:** Platform
- **Status:** REAL — 457 lines, role-based access with system permissions, SoD validation, audit trail

### 11.2 ABAC Service
- **Location:** `src/lib/platform/abac/abac-service.ts`
- **Product owner:** Platform
- **Status:** REAL — attribute-based policy evaluation with conditions

### 11.3 Core Permissions
- **Location:** `src/lib/platform/access/permissions.ts`
- **Product owner:** Platform
- **Status:** REAL — role-permission matrix (29 lines, 4 roles × 9 permissions)

### 11.4 Tenant Guards
- **Location:** `src/lib/platform/guards/`, `src/lib/workflowos/tenant-guard.ts`, `src/lib/audit/tenant-guard.ts`
- **Product owner:** Platform + Products
- **Status:** REAL — per-product tenant isolation guards

---

## 12. Policy

### 12.1 ABAC Policy Model
- **Location:** `prisma/schema.prisma` (AbacPolicy, AbacPolicyCondition, AbacPolicyAssignment)
- **Product owner:** Platform
- **Status:** REAL — data model for attribute-based policies

### 12.2 Retention Policy Engine
- **Location:** `src/lib/platform/retention/` (8 files)
- **Product owner:** Platform
- **Status:** REAL — configurable retention policies per model, dry-run, holds, audit trail

### 12.3 Governance Policy Framework
- **Location:** `src/lib/governance/retrieval-router.ts` (governance references, escalation triggers, evidence requirements)
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — 12 governance task types with policy references

---

## 13. Risk

### 13.1 Decision Risk Analysis
- **Location:** `src/lib/decision/risk-analysis.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — decision-level risk evaluation

### 13.2 Decision Risk Alerts
- **Location:** `src/lib/decision/signals-alerts.ts`, `signal-automation.ts`
- **Product owner:** DecisionOS
- **Status:** REAL — automated risk alert generation

### 13.3 Audit RiskOS
- **Location:** `src/app/risk/*`, `prisma` (AuditRiskModel, AuditRiskAssessment, AuditRiskProcedure)
- **Product owner:** AuditOS
- **Status:** REAL — risk assessment dashboard and workflow at L5

### 13.4 Platform Risk Assessment
- **Location:** `src/lib/platform/intelligence.ts` (RiskAssessment, RiskFactor)
- **Product owner:** Platform / Intelligence Core
- **Status:** REAL — shared risk assessment contracts

---

## 14. Memory

### 14.1 Institutional Memory Service (Platform)
- **Location:** `src/lib/platform/institutional-memory/institutional-memory-service.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** CreateNodeInput, CreateEdgeInput, SearchMemoryInput, IngestDocumentInput
- **Outputs:** Node/Edge/MemoryStats/Query results
- **Dependencies:** Prisma (InstitutionalMemoryEvent, IntelligenceGraphNode/Edge), audit-log
- **Status:** REAL — 842 lines, full graph-based memory with CRUD operations, collections, search, batch ingestion
- **Prisma models:** InstitutionalMemoryEvent (2787), InstitutionalMemoryCollection (2816), IntelligenceGraphNode (2839), IntelligenceGraphEdge (2858)

### 14.2 AI Memory (Institutional Memory)
- **Location:** `src/lib/ai/memory/institutional-memory.ts`
- **Product owner:** Platform / Intelligence Core
- **Inputs:** Query, results, insight
- **Outputs:** Stored records
- **Dependencies:** Prisma (IntelligenceQuery)
- **Status:** REAL — 272 lines, query/insight storage, different model (IntelligenceQuery) from platform/institutional-memory
- **Note:** PARTIAL DUPLICATION — uses IntelligenceQuery model, not graph nodes

### 14.3 Agent Memory
- **Location:** `src/lib/platform/agent-memory.ts`
- **Product owner:** Platform
- **Inputs:** AgentMemoryInput
- **Outputs:** Memory value
- **Dependencies:** Prisma (AgentMemory)
- **Status:** REAL — 118 lines, key-value memory for AI agents with TTL

### 14.4 TB Firm Memory
- **Location:** `src/lib/tb-intelligence/firm-memory.ts`, `firm-memory-engine.ts`, `firm-memory-governance.ts`
- **Product owner:** AuditOS (TB Intelligence)
- **Status:** REAL — firm-specific classification memory for trial balance intelligence

---

## Cross-Cutting Observations

### Well-Integrated
- AI orchestration → Governance context injection → Audit trail
- RAG → Governed retrieval → Evidence metrics → Audit trail
- Decision lifecycle → Signals → Alerts → Audit trail
- Workflow → Evidence → SLA → Export → Audit trail

### Fragmented
- **Notifications** — 3 implementations (platform/notification/, platform/notifications/, workflowos/notification-service.ts)
- **Signals** — platform/signals/ stubs vs decision/signal-automation vs product-specific producers
- **Memory** — 3 memory systems (institutional memory graph, AI query memory, agent memory) with different models
- **Audit log** — 4 write paths (audit-log.ts, audit-logger.ts, audit-event-service.ts, platform-audit.ts)
- **Evidence** — 9 product-specific evidence models vs RAG evidence metrics
- **Knowledge** — knowledge-foundation (frozen charter) disconnected from RAG knowledge service

### Missing
- Unified Intelligence Core entry point / orchestrator
- Cross-product signal aggregation
- Event bus for inter-product communication
- Model governance registry
- Enterprise knowledge graph (graph nodes exist but are disconnected)
