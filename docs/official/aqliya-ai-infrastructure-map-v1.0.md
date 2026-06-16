# AQLIYA Current AI Infrastructure Map v1.0

> **Status:** Official — Source of Truth  
> **Purpose:** Complete inventory of all existing AI infrastructure in the AQLIYA repository.  
> **Version:** 1.0  
> **Last Updated:** 2026-06-15

---

## Executive Summary

AQLIYA has **~70+ AI infrastructure files** spanning 18 subsystems. The AI architecture is mature, production-grade, and governed. It is NOT a greenfield — the Skill Operating System must be built **on top of** this existing foundation, not from scratch.

**Estimated reuse:** ~75% of required Skill OS infrastructure already exists.

---

## A. Current AI Architecture Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AQLIYA CURRENT AI ARCHITECTURE                        │
│                          (as of 2026-06-15)                                  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        PRESENTATION LAYER                             │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │  │
│  │  │ AI API Routes   │  │ Office AI UI    │  │ Agent Memory UI     │  │  │
│  │  │ /api/ai/*       │  │ /assistant/*    │  │ (Server Actions)    │  │  │
│  │  │ (5 endpoints)   │  │ (task creation) │  │ (5 CRUD actions)    │  │  │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     AI ORCHESTRATION LAYER                            │  │
│  │                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │   AI Orchestrator (singleton)  src/lib/ai/orchestrator.ts     │  │  │
│  │  │   ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │  │  │
│  │  │   │ Provider     │ │ Governance   │ │ RAG Context          │  │  │  │
│  │  │   │ Resolution   │ │ Context      │ │ Injection            │  │  │  │
│  │  │   └──────────────┘ └──────────────┘ └──────────────────────┘  │  │  │
│  │  │   ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │  │  │
│  │  │   │ Budget Quota │ │ Audit Log    │ │ OnGenerate Callback  │  │  │  │
│  │  │   │ Check        │ │ (platform)   │ │ (logging hook)       │  │  │  │
│  │  │   └──────────────┘ └──────────────┘ └──────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │   Prompt Registry (.ts)        src/lib/ai/prompt-registry.ts   │  │  │
│  │  │   6 task types → prompt builders → 7-layer prompt assembly    │  │  │
│  │  │   Tasks: statement_drafting, account_mapping, evidence_review, │  │  │
│  │  │          audit_findings, commercial_claim_review               │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    GOVERNANCE LAYER                                   │  │
│  │                                                                       │  │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │  │
│  │  │ Retrieval Router   │ │ Prompt Framework   │ │ Runtime Types   │  │  │
│  │  │ (10 task types     │ │ (7 prompt builders │ │ (10 task types, │  │  │
│  │  │  static contexts)  │ │  layer assembly)   │ │  8 approval st.) │  │  │
│  │  └────────────────────┘ └────────────────────┘ └─────────────────┘  │  │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │  │
│  │  │ Provenance Engine  │ │ Escalation Engine  │ │ Approval State  │  │  │
│  │  │ (create/mark ->   │ │ (12 triggers,      │ │ (8 states,      │  │  │
│  │  │  explain)          │ │  5 levels)          │ │  AI-forbidden)   │  │  │
│  │  └────────────────────┘ └────────────────────┘ └─────────────────┘  │  │
│  │  ┌────────────────────┐ ┌────────────────────┐                     │  │
│  │  │ Actor Lineage      │ │ Product AI Bridge  │                     │  │
│  │  │ (role-based        │ │ (cross-product     │                     │  │
│  │  │  mutation control)  │ │  governed entry)   │                     │  │
│  │  └────────────────────┘ └────────────────────┘                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   PROVIDER LAYER                                       │  │
│  │                                                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │             5 AI Providers                                   │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │  │
│  │  │  │OpenAI    │ │Anthropic │ │Cloud     │ │ Local/Ollama   │  │  │  │
│  │  │  │Adapter   │ │Adapter   │ │Adapter   │ │ Adapter        │  │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │  │  │
│  │  │  ┌──────────┐                                              │  │  │
│  │  │  │Determin. │  8 rule-based handlers for fallback          │  │  │
│  │  │  │Provider  │                                              │  │  │
│  │  │  └──────────┘                                              │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌───────────┐  │  │
│  │  │Provider    │ │Provider    │ │Circuit       │ │HTTP Client│  │  │
│  │  │Router      │ │Factory     │ │Breaker       │ │(shared)   │  │  │
│  │  │(cost-aware)│ │(SecretRes) │ │(per-provider)│ │(retry/err)│  │  │
│  │  └────────────┘ └────────────┘ └──────────────┘ └───────────┘  │  │
│  │  ┌────────────┐ ┌────────────┐                                  │  │
│  │  │Hybrid      │ │Cost Mapping│                                  │  │
│  │  │Router      │ │(per-model) │                                  │  │
│  │  └────────────┘ └────────────┘                                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     RAG & KNOWLEDGE LAYER                             │  │
│  │                                                                       │  │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │  │
│  │  │ Governed RAG       │ │ Hybrid Search      │ │ Vector Store    │  │  │
│  │  │ (retrieve → rank → │ │ (vector + lexical  │ │ (pgvector,      │  │  │
│  │  │  evidence → audit)  │ │  RRF fusion)       │ │  store/verify)   │  │  │
│  │  └────────────────────┘ └────────────────────┘ └─────────────────┘  │  │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │  │
│  │  │ Embedding Service  │ │ Chunking Engine    │ │ Knowledge Svc   │  │  │
│  │  │ (embed → store)    │ │ (para + sentence,  │ │ (CRUD, ingest,  │  │  │
│  │  │                    │ │  1024 chunk)       │ │  search)         │  │  │
│  │  └────────────────────┘ └────────────────────┘ └─────────────────┘  │  │
│  │  ┌────────────────────┐ ┌────────────────────┐                      │  │
│  │  │ Governance Meta    │ │ Governed RAG       │                      │  │
│  │  │ (productKey,       │ │ Metrics            │                      │  │
│  │  │  sensitivity, etc)  │ │                    │                      │  │
│  │  └────────────────────┘ └────────────────────┘                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     MEMORY LAYER                                      │  │
│  │                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ Platform Knowledge Graph (src/lib/platform/inst-mem/)     │  │  │
│  │  │ • Nodes: DOCUMENT, CONCEPT, DECISION, FACT, ENTITY,...   │  │  │
│  │  │ • Edges: REFERENCES, CAUSES, DEPENDS_ON, PART_OF,...     │  │  │
│  │  │ • Search (BFS, shortest path, subgraph)                  │  │  │
│  │  │ • Collections, document ingestion, dashboard stats       │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ AI-Layer Memory (src/lib/ai/memory/institutional-memory/) │  │  │
│  │  │ • Queries: storeQuery, getQueryHistory                    │  │  │
│  │  │ • Insights: storeInsight, getRelatedInsights             │  │  │
│  │  │ • Entities: createEntity, createRelation                 │  │  │
│  │  │ • Prisma tables: intelligenceQuery, GraphNode, GraphEdge │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ Agent Memory (src/lib/platform/agent-memory.ts)            │  │  │
│  │  │ • set/get/query/delete with TTL + tags                     │  │  │
│  │  │ • Server Actions: store, recall, query, forget, clean      │  │  │
│  │  │ • Prisma table: agentMemory                                │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ Sales Append-only Memory (src/lib/sales/institutional-mem) │  │  │
│  │  │ • Timeline in SalesAccount.metadata.institutionalMemory[]  │  │  │
│  │  │ • Types: audit, review_decision, icp_review               │  │  │
│  │  │ • Max 100 entries, deduplicated by sourceRef               │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   EVALUATION LAYER                                    │  │
│  │                                                                       │  │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │  │
│  │  │ EvalTypes          │ │ EvalRunner         │ │ EvalGate        │  │  │
│  │  │ (metric types,     │ │ (exact_match,      │ │ (suite runner,  │  │  │
│  │  │  test case, suite)  │ │  contains, regex)   │ │  threshold)     │  │  │
│  │  └────────────────────┘ └────────────────────┘ └─────────────────┘  │  │
│  │  ┌────────────────────┐ ┌────────────────────┐                      │  │
│  │  │ 4 Eval Suites      │ │ CLI Runner         │                      │  │
│  │  │ • financial_analysis│ │ (scripts/ai-eval)  │                      │  │
│  │  │ • disclosure_notes  │ │                    │                      │  │
│  │  │ • finding_summary   │ │                    │                      │  │
│  │  │ • framework_self    │ │                    │                      │  │
│  │  └────────────────────┘ └────────────────────┘                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   BUDGET & OBSERVABILITY LAYER                         │  │
│  │                                                                       │  │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │  │
│  │  │ Budget Manager     │ │ Spend Tracker      │ │ AI Observability│  │  │
│  │  │ (per-tenant quotas │ │ (30d aggregation   │ │ (spend + gov +  │  │  │
│  │  │  env-config)        │ │  by provider/model) │ │  circuit + lat)  │  │  │
│  │  └────────────────────┘ └────────────────────┘ └─────────────────┘  │  │
│  │  ┌────────────────────┐ ┌────────────────────┐                      │  │
│  │  │ Governance Metrics │ │ AI Review Gate     │                      │  │
│  │  │ (review rate,     │ │ (AISuggestion,     │                      │  │
│  │  │  override rate)    │ │  format + log)     │                      │  │
│  │  └────────────────────┘ └────────────────────┘                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   INFRASTRUCTURE LAYER                                │  │
│  │                                                                       │  │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │  │
│  │  │ Provider Registry  │ │ Failover Engine    │ │ Factory Registry│  │  │
│  │  │ (register→resolve→ │ │ (generalized       │ │ (AI, CRM, ERP,  │  │  │
│  │  │  healthCheck)       │ │  circuit breaker)   │ │  Storage, Email)│  │  │
│  │  └────────────────────┘ └────────────────────┘ └─────────────────┘  │  │
│  │  ┌────────────────────┐ ┌────────────────────┐                      │  │
│  │  │ AI Runtime Mode    │ │ Plan Features      │                      │  │
│  │  │ (cloud/hybrid/     │ │ • FF_AI_RAG        │                      │  │
│  │  │  air_gapped)        │ │ • FF_AI_REAL_PROV  │                      │  │
│  │  └────────────────────┘ └────────────────────┘                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   PRODUCT-SPECIFIC AI                                  │  │
│  │                                                                       │  │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │  │
│  │  │ Sales ICP Agent    │ │ TB Intelligence    │ │ Office AI       │  │  │
│  │  │ (rules engine      │ │ • Firm Memory      │ │ (task creation, │  │  │
│  │  │  + institutional   │ │ • Governance       │ │  file validat'n) │  │  │
│  │  │  memory)            │ │ • Holdout Eval     │ │                 │  │  │
│  │  └────────────────────┘ └────────────────────┘ └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## B. Reusable Components for Skill OS

The following existing assets can be **directly reused** (not rebuilt) for the Skill Operating System:

### Tier 1: Direct Reuse (No Changes Needed)

| Component | Location | What It Provides for Skill OS |
|-----------|----------|------------------------------|
| **AIOrchestrator** | `src/lib/ai/orchestrator.ts` | Provider routing, governance injection, budget enforcement, audit logging |
| **AIProvider interface** | `src/lib/ai/types.ts` | Provider abstraction (`execute`, `stream`, `getStatus`) |
| **5 AI Providers** | `src/lib/ai/providers/*.ts` | OpenAI, Anthropic, Cloud, Local/Ollama, Deterministic |
| **Provider Router** | `src/lib/ai/provider-router.ts` | Cost-aware optimal provider selection |
| **Hybrid Router** | `src/lib/ai/hybrid-router.ts` | Per-org AI execution mode (cloud/hybrid/local) |
| **Circuit Breaker** | `src/lib/ai/providers/provider-circuit-breaker.ts` | Per-provider circuit breaker |
| **Deterministic Handlers** | `src/lib/ai/handlers/*.ts` | 8 rule-based fallback handlers |
| **Governance Task Map** | `src/lib/governance/retrieval-router.ts` | 10 task types with static governance contexts |
| **Governance Runtime Types** | `src/lib/governance/runtime-types.ts` | TaskType, EvidenceRequirement, ApprovalState, EscalationLevel |
| **Prompt Framework** | `src/lib/governance/prompt-framework.ts` | 7-layer prompt assembly (doctrine → task) |
| **Provenance Engine** | `src/lib/governance/provenance.ts` | Audit trail, evidence status, explainability |
| **Escalation Engine** | `src/lib/governance/escalation.ts` | 12 triggers, auto-detection, 5 levels |
| **Approval State Machine** | `src/lib/governance/approval-state.ts` | 8 states with AI-forbidden transitions |
| **Platform Audit Log** | `src/lib/platform/audit-log.ts` | Every mutation logged |
| **Eval Framework** | `src/lib/ai/eval/eval-types.ts`, `eval-runner.ts`, `eval-gate.ts` | Metric types, suite runner, threshold gate |
| **AI Review Gate** | `src/lib/ai/review/ai-review-gate.ts` | Suggestion generation, formatting, audit logging |
| **Budget Manager** | `src/lib/ai/budget-manager.ts` | Per-tenant quotas, threshold alerts |
| **Spend Tracker** | `src/lib/ai/spend-tracker.ts` | 30-day aggregation by provider/model/org |
| **Governed RAG** | `src/lib/rag/intelligence-core-rag.ts` | Retrieval → ranking → evidence → governance → audit |
| **Institutional Memory** | `src/lib/platform/institutional-memory/institutional-memory-service.ts` | Knowledge graph CRUD, search, collections, ingestion |
| **Agent Memory** | `src/lib/platform/agent-memory.ts` | TTL-based memory with tags |
| **AI Runtime Mode** | `src/lib/ai/runtime/inference-service.ts` | Cloud/hybrid/air_gapped mode resolution |
| **Product AI Bridge** | `src/lib/platform/product-ai-bridge.ts` | Cross-product governed AI entry |

### Tier 2: Extendable (Reuse with Adaptation)

| Component | Location | Adaptation Needed |
|-----------|----------|-----------------|
| **Prompt Registry** | `src/lib/ai/prompt-registry.ts` | Currently maps GovernanceTaskType → prompt. Extend to also accept `skill:xxx` IDs and route to skill-specific prompts |
| **Eval Suites** | `src/lib/ai/eval/suites/*.ts` | Currently 4 AuditOS-focused suites. Extend with skill-specific evaluation datasets |
| **Institutional Memory** | Both platforms | Currently separate systems. Need unified query interface for skill execution feedback |
| **Deterministic Handlers** | `src/lib/ai/handlers/*.ts` | Currently 8 handlers for AuditOS. Extend with handlers for new skill types |

### Tier 3: New Components Needed

| Component | Why It Doesn't Exist |
|-----------|---------------------|
| **Skill Registry** | No centralized skill catalog. No manifest standard. No capability map. |
| **Skill Runtime** | No concept of "skill execution" as a discrete, traceable unit. Only task-type based execution exists. |
| **Skill Manifest** | No standard schema for defining skill identity, inputs, outputs, execution workflow |
| **Skill Composition Engine** | No multi-skill workflow orchestration. No DAG-based sequence/parallel execution. |
| **Skill Builder** | No meta-capability to generate new skills from descriptions |
| **Skill Governance Policies** | Access control is per-skill (not just per-task-type). No lifecycle management (draft->validate->publish->deprecate). |
| **Skill-Specific Evaluation Criteria** | System-level eval exists. Per-skill evaluation criteria, datasets, and drift tracking are missing. |
| **Skill Templates** | No base patterns for generating new skills |

---

## C. Gaps Analysis

### Gap 1: No Skill Abstraction Layer

**Current state:** The system thinks in terms of `GovernanceTaskType` (10 fixed types). There is no concept of a "skill" as a versioned, discoverable, composable asset.

**What's needed:** A Skill abstraction that wraps one or more GovernanceTaskType executions into a cohesive capability unit with identity, version, dependencies, and documentation.

**Severity:** HIGH — this is the core missing abstraction.

### Gap 2: No Registry or Discovery

**Current state:** Skills exist only as function calls. No catalog, no search, no "what can the AI do?".

**What's needed:** A file-based registry of skill manifests with indexed capabilities, dependency resolution, and search.

**Severity:** HIGH

### Gap 3: No Composition Engine

**Current state:** Each AI execution is a single task. No way to chain: `Repository Audit → Security Check → Release Assessment → Executive Report`.

**What's needed:** A DAG-based workflow engine that sequences/parallelizes skill execution, passes data between steps, and aggregates results.

**Severity:** MEDIUM-HIGH

### Gap 4: No Skill-Specific Evaluation

**Current state:** Eval framework exists but operates on task types with hardcoded thresholds. No per-skill evaluation criteria, datasets, or drift tracking.

**What's needed:** Each skill gets its own evaluation criteria, datasets, quality thresholds, and drift monitoring.

**Severity:** MEDIUM

### Gap 5: No Skill Builder

**Current state:** Creating a new AI capability requires manual implementation across multiple files (handler, prompt, governance context, eval suite).

**What's needed:** A meta-skill that, given a domain/workflow description, generates the complete skill package.

**Severity:** MEDIUM (Phase 3 priority)

### Gap 6: No Lifecycle Governance

**Current state:** AI capabilities are either "implemented" or "not implemented." No concept of draft → validated → published → deprecated → retired.

**What's needed:** Full lifecycle for skills with gates, approvals, and version management.

**Severity:** MEDIUM

---

## D. Target Skill Architecture (Built on Existing Infrastructure)

The Skill OS sits **on top of** existing infrastructure. It does not replace anything.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        SKILL OPERATING SYSTEM (NEW)                       │
│                           (wraps existing infrastructure)                  │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Skill        │  │ Skill        │  │ Skill        │  │ Skill        │ │
│  │ Registry     │  │ Runtime      │  │ Composer     │  │ Builder      │ │
│  │ (.files)     │  │ (orchestrator│  │ (workflow    │  │ (meta-skill) │ │
│  │              │  │  wrapper)    │  │  engine)     │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │               │               │               │            │
│         └───────────────┴───────────────┴───────────────┘            │
│                         │                                            │
└─────────────────────────┼────────────────────────────────────────────┘
                          │ CALLS (NOT REPLACES)
                          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    EXISTING AQLIYA AI INFRASTRUCTURE                      │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ AI           │  │ Governance   │  │ Eval         │  │ Institutional│ │
│  │ Orchestrator │  │ Framework    │  │ Framework    │  │ Memory      │ │
│  │ (provider    │  │ (task types, │  │ (4 suites,   │  │ (knowledge  │ │
│  │  routing)    │  │  prompts)    │  │  gate)       │  │  graph)     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ 5 AI         │  │ RAG Engine   │  │ Budget/Spend │  │ Provider    │ │
│  │ Providers    │  │ (governed    │  │ Manager      │  │ Registry    │ │
│  │              │  │  retrieval)  │  │              │  │ + Failover  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Integration Architecture

```
Skill Execution Flow:

User/Product requests skill execution
         │
         ▼
┌────────────────────────────────┐
│ 1. Skill Registry Resolve      │ ← finds manifest, checks deps, permissions
│    `resolveSkill("skill:xxx")` │
└───────────┬────────────────────┘
            ▼
┌────────────────────────────────┐
│ 2. Skill Runtime Prepare        │ ← resolves inputs, builds context
│    `prepareContext()`          │
└───────────┬────────────────────┘
            ▼
┌────────────────────────────────┐
│ 3. AI Orchestrator (existing)  │ ← calls existing provider routing,
│    `aiOrchestrator.generate()` │    governance injection, RAG
└───────────┬────────────────────┘
            ▼
┌────────────────────────────────┐
│ 4. Skill Runtime Capture        │ ← captures output, runs eval, logs audit
│    `captureResult()`           │
└───────────┬────────────────────┘
            ▼
┌────────────────────────────────┐
│ 5. Institutional Memory Store  │ ← stores execution record, patterns
│    `storeExecution()`          │
└────────────────────────────────┘
```

---

## E. Migration Plan

### Phase 1.0: Registry + Foundation (Weeks 1-2)

**Build:**
- `.skills/` folder structure
- Skill Manifest schema
- Registry index (`index.yaml`, `capability-map.yaml`, `dependency-graph.yaml`)
- Skill Runtime (thin wrapper around `aiOrchestrator.generate()`)

**Existing components leveraged:**
- AI Orchestrator (provider routing)
- Governance Framework (task types, evidence)
- Platform Audit Log (execution logging)

### Phase 1.1: L0 Foundation Skills (Weeks 2-3)

**Build:**
- 5 foundation skill manifests and wrappers
- Skill-specific prompt templates
- Registry validation

**Existing components leveraged:**
- Deterministic handlers for rule-based tasks
- Prompt Registry for prompt assembly
- File system for registry storage

### Phase 1.2: L1 Engineering Skills (Weeks 3-4)

**Build:**
- 6 engineering skill manifests and wrappers
- Skill-specific eval criteria
- First composition workflow (full repo audit)

**Existing components leveraged:**
- Eval Framework (metric types, runner, gate)
- Institutional Memory (store evaluation results)
- Agent Memory (intermediate step storage)

### Phase 2: Composition + Evaluation (Weeks 5-6)

**Build:**
- Skill Composition Engine (DAG-based workflow)
- Per-skill evaluation datasets and drift tracking
- Lifecycle governance (draft → validated → published → deprecated)

**Existing components leveraged:**
- Eval Framework (extend with skill-specific datasets)
- Platform Audit Log (lifecycle events)
- Governance Framework (approval states, actor lineage)

### Phase 3: Skill Builder (Weeks 7-8)

**Build:**
- L4 Meta skills (Builder, Auditor, Composer, Evaluator)
- Skill Builder architecture (analyze → design → generate → validate → register)
- Skill templates (5 categories)

**Existing components leveraged:**
- AI Orchestrator (the Builder itself runs via AI)
- Prompt Framework (Builder uses governed AI)
- Institutional Memory (Builder learns from past creations)

---

## F. Recommended First 10 Skills

These are the skills that should be built FIRST because they:
1. Deliver immediate value
2. Validate the Skill OS architecture
3. Build on existing infrastructure with minimal new code
4. Can be tested immediately with the existing evaluation framework

### L0 Foundation (5 skills)

| # | Skill ID | Purpose | Reuses |
|---|----------|---------|--------|
| 1 | `skill:foundation:repo-analysis` | Analyze repo structure, map modules, detect patterns | Deterministic handler, file system |
| 2 | `skill:foundation:doc-analysis` | Read and classify documentation, detect staleness | Deterministic handler, Prompt Registry |
| 3 | `skill:foundation:arch-mapping` | Map architecture layers and component relationships | AI Orchestrator, Governance RAG |
| 4 | `skill:foundation:dependency-map` | Map imports, packages, service dependencies | Deterministic handler, file system |
| 5 | `skill:foundation:knowledge-extract` | Extract entities, workflows, business rules from code | AI Orchestrator, Inst. Memory |

### L1 Engineering (3 skills)

| # | Skill ID | Purpose | Reuses |
|---|----------|---------|--------|
| 6 | `skill:engineering:security-audit` | Auth, tenant isolation, secret exposure audit | AI Orchestrator, Eval Framework |
| 7 | `skill:engineering:release-audit` | Release readiness verification | Deterministic + AI hybrid, Eval Gate |
| 8 | `skill:engineering:tech-debt` | Dead code, duplication, architectural drift | AI Orchestrator + Deterministic |

### L4 Meta (2 skills)

| # | Skill ID | Purpose | Reuses |
|---|----------|---------|--------|
| 9 | `skill:meta:skill-composer` | Compose multi-skill workflows | All L0-L1, AI Orchestrator |
| 10 | `skill:meta:skill-evaluator` | Evaluate any skill against criteria | Eval Framework, Inst. Memory |

### Selection Rationale

These 10 skills were chosen because:

1. **L0 foundation skills are self-reinforcing** — they understand the repo, docs, and architecture, which makes building higher skills easier
2. **L1 engineering skills validate governance** — security and release audits are high-value and exercise the governance framework
3. **Meta skills close the loop** — the Composer creates workflows, the Evaluator measures quality. Together they enable autonomous improvement
4. **All 10 can be built incrementally** — each depends only on existing infrastructure + the immediately preceding skills
5. **No new dependencies required** — they use existing providers, governance, eval, and memory
