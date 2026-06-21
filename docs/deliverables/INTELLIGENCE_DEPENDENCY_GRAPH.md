# Intelligence Dependency Graph

**Generated:** 2026-06-21  
**Status:** Current architecture mapping

---

## 1. Current Dependency Graph

```
                               ┌──────────────────────────────────────┐
                               │         CORE PLATFORM LAYER          │
                               │                                      │
                               │  prisma  auth  cache  storage  env   │
                               └──────────┬───────────────────────────┘
                                          │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
         ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
         │   AUDIT LAYER    │   │ GOVERNANCE LAYER │   │    AI LAYER      │
         │                  │   │                  │   │                  │
         │ audit-log.ts ────┼───┤→ retrieval-router│   │ orchestrator.ts  │
         │ hash-chain.ts    │   │ runtime-types    │   │→ governed-executor│
         │ audit-store.ts   │   │ approval-state   │   │→ providers/*      │
         │ audit-bridge/    │   │ escalation       │   │→ intelligence-    │
         │ siem/            │   │ provenance       │   │  runtime.ts       │
         └────────┬─────────┘   │ actor-lineage    │   │→ memory/          │
                  │             └────────┬─────────┘   │→ handlers/*       │
                  │                      │             │→ prompt-registry   │
                  │                      │             │→ model-registry    │
                  │                      │             │→ eval/             │
                  │                      │             │→ budget-manager    │
                  │                      │             └────────┬──────────┘
                  │                      │                      │
                  ▼                      ▼                      ▼
         ┌─────────────────────────────────────────────────────────────┐
         │                     PRODUCT AI BRIDGE                       │
         │                                                             │
         │  product-ai-bridge.ts → cross-product-ai/cross-product-     │
         │                           ai-service.ts                     │
         │  intelligence-runtime.ts (use-case routing)                 │
         └────────────┬────────────────────┬──────────────────────────-┘
                      │                    │
          ┌───────────┼───────────┬────────┼───────────┬───────────┐
          │           │           │        │           │           │
          ▼           ▼           ▼        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ AUDITOS │ │DECISION │ │LOCAL-   │ │ SALESOS │ │WORKFLOW │ │ OFFICE  │
   │         │ │ OS      │ │CONTENTOS│ │         │ │ OS      │ │ AI      │
   │ 53 lib  │ │ 32 lib  │ │ 4 lib   │ │ 13 lib  │ │ 14 lib  │ │ 8 lib   │
   │ files   │ │ files   │ │ files   │ │ files   │ │ files   │ │ files   │
   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
        │           │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼           ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                     RAG / KNOWLEDGE LAYER                    │
   │                                                             │
   │  rag/{chunking, embedding, vector-store, hybrid-search,     │
   │       rag-retriever, intelligence-core-rag, knowledge-      │
   │       service, governed-rag-metrics}                        │
   │                                                             │
   │  knowledge-foundation/ (frozen charter)                     │
   │  knowledge/ (domain data files)                             │
   └──────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                 CROSS-CUTTING SERVICES                       │
   │                                                             │
   │  NOTIFICATIONS: platform/notification/, platform/           │
   │                 notifications/, workflowos/notification-     │
   │                 service.ts                                   │
   │                                                             │
   │  SIGNALS: platform/signals/, decision/signal-automation,    │
   │           platform/intelligence.ts (contracts)              │
   │                                                             │
   │  EVIDENCE: 9 product-specific models + RAG evidence metrics │
   │                                                             │
   │  MEMORY: platform/institutional-memory/, ai/memory/,        │
   │          platform/agent-memory, tb-intelligence/firm-memory │
   │                                                             │
   │  AUTHORIZATION: access/rbac, abac/, guards/*                │
   │                                                             │
   │  POLICY: governance/retrieval-router, retention/, abac/     │
   └────────────────────────────────────────────────────────────-┘
```

## 2. Current Dependencies (Directed)

```
writePlatformAuditLog ← writeAuditEvent
writePlatformAuditLog ← AuditLogger
writePlatformAuditLog ← AIOrchestrator
writePlatformAuditLog ← governedAIExecute
writePlatformAuditLog ← product-ai-bridge
writePlatformAuditLog ← retention/engine
writePlatformAuditLog ← institutional-memory-service
writePlatformAuditLog ← workflowos/services
writePlatformAuditLog ← RAG pipeline (all stages)
writePlatformAuditLog ← platform/signals

getGovernanceContext ← intelligence-runtime.ts
getGovernanceContext ← product-ai-bridge.ts
getGovernanceContext ← AIOrchestrator
getGovernanceContext ← AI handlers

aiOrchestrator ← product-ai-bridge.ts
aiOrchestrator ← governedAIExecute
aiOrchestrator ← provider-factory → providers/*
aiOrchestrator ← budget-manager
aiOrchestrator ← provider-router
aiOrchestrator ← hybrid-router
aiOrchestrator ← orchestrator-rag-inject → rag/intelligence-core-rag

workflowos/notification-service → platform/notification/engine
workflowos/services → workflowos/audit
workflowos/services → workflowos/tenant-guard

platform/signals/audit-signal-producer → prisma (auditEvent)
platform/signals/sales-signal-producer → prisma
platform/signals/localcontent-signal-producer → prisma

decision/decision-engine → decision/intake, framework, scenarios, risk-analysis, recommendation
decision/signal-automation → decision/signals-alerts
decision/learning-engine → decision/outcome-correlation

rag/* → prisma (DocumentChunk, IntelligenceQuery)
rag/* → embedding-provider
rag/* → audit-log
rag/* → feature-flags

platform/institutional-memory → prisma (graph nodes/edges/events)
platform/agent-memory → prisma (AgentMemory)
```

## 3. Identified Cycles

| Cycle | Path | Severity |
|-------|------|----------|
| C1 | `governance/retrieval-router` ↔ `AI types` (imports) | LOW — types only |
| C2 | `platform/audit-log` ↔ `platform/audit` (hash chain audit store) | LOW — controlled circular dependency |
| C3 | `decision/decision-engine` ↔ `decision/decision-type-config` → `decision/intake` | LOW — intentional module decomposition |

**No critical cycles found.** The architecture is generally acyclic, with product modules depending on core services.

## 4. Target Dependency Graph

```
                               ┌────────────────────────────────────────┐
                               │          INTELLIGENCE CORE              │
                               │                                        │
                               │  ┌──────────────────────────────────┐  │
                               │  │          CORE CONTRACTS           │  │
                               │  │  platform/intelligence.ts        │  │
                               │  │  platform/types.ts               │  │
                               │  └──────────────┬───────────────────┘  │
                               │                 │                      │
                               │  ┌──────────────▼───────────────────┐  │
                               │  │          MODULE INTERFACES       │  │
                               │  │                                  │  │
                               │  │  Knowledge Engine (interface)    │  │
                               │  │  Evidence Engine (interface)     │  │
                               │  │  Governance Engine (interface)   │  │
                               │  │  Audit Engine (interface)        │  │
                               │  │  Policy Engine (interface)       │  │
                               │  │  Workflow Engine (interface)     │  │
                               │  │  Decision Engine (interface)     │  │
                               │  │  AI Execution Engine (interface) │  │
                               │  │  Institutional Memory (interface)│  │
                               │  │  Signal Engine (interface)       │  │
                               │  └──────────────┬───────────────────┘  │
                               │                 │                      │
                               │  ┌──────────────▼───────────────────┐  │
                               │  │       IMPLEMENTATIONS             │  │
                               │  │                                  │  │
                               │  │  → audit-log (canonical)         │  │
                               │  │  → governance/retrieval-router   │  │
                               │  │  → rag/intelligence-core-rag     │  │
                               │  │  → ai/orchestrator               │  │
                               │  │  → platform/institutional-memory │  │
                               │  │  → platform/notification/engine  │  │
                               │  │  → platform/signals (unified)    │  │
                               │  └──────────────────────────────────┘  │
                               └──────────────────┬─────────────────────┘
                                                  │
                    ┌──────────────────────────────┼──────────────────┐
                    │                              │                  │
                    ▼                              ▼                  ▼
         ┌──────────────────┐          ┌──────────────────┐  ┌──────────────────┐
         │  EVENT BUS       │          │   PRODUCTS       │  │  EXTERNAL        │
         │  (future)        │          │                  │  │  INTEGRATIONS    │
         │                  │          │  AuditOS         │  │                  │
         │  Products emit   │          │  DecisionOS      │  │  SIEM            │
         │  → Core consumes │          │  LocalContentOS  │  │  Webhooks        │
         │  → Products react│          │  SalesOS         │  │  Email           │
         │                  │          │  WorkflowOS      │  │  SCIM            │
         │                  │          │  Office AI       │  │  SSO             │
         └──────────────────┘          └──────────────────┘  └──────────────────┘
```

## 5. Target Dependency Rules

```
All modules → Core Contracts (types)
Core Contracts → Module Interfaces
Module Interfaces → Implementations
Products → Module Interfaces (not implementations directly)
Products → Event Bus (emit events)
Event Bus → Core (process events)
Core → Module Implementations
No product → product dependencies (all through Core)
No cyclic dependencies allowed
```

## 6. Violations in Current Architecture

| Violation | Current | Target | Impact |
|-----------|---------|--------|--------|
| V1 | Products import `writePlatformAuditLog` directly | Products should emit events → Core writes audit | HIGH — tight coupling |
| V2 | Products import `aiOrchestrator` directly | Products should use Product AI Bridge → Core AI | MEDIUM — bypasses governance |
| V3 | Products implement their own evidence models | Products should use Evidence Engine | MEDIUM — fragmented evidence |
| V4 | Products implement their own signal collectors | Products should use Signal Engine | MEDIUM — duplicated collection logic |
| V5 | Products implement their own tenant guards | Products should use Core authorization | LOW — acceptable specialization |

**Total Target Architecture Transition Complexity: HIGH** — requires event bus adoption, module interface extraction, and product refactoring.
