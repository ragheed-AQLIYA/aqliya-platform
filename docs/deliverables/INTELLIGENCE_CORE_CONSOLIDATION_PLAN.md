# Intelligence Core Consolidation Plan

**Generated:** 2026-06-21  
**Based on:** INTELLIGENCE_CORE_MAP.md, INTELLIGENCE_DUPLICATION_REPORT.md, INTELLIGENCE_DEPENDENCY_GRAPH.md, INTELLIGENCE_CORE_V2_ARCHITECTURE.md

---

## Decision Key

| Decision | Meaning |
|----------|---------|
| KEEP | Module stays as-is (correct location, proper design) |
| MERGE | Module should merge into another with its functionality absorbed |
| REPLACE | Module should be replaced with a new implementation |
| REMOVE | Module should be deleted (no value, superseded, or dead code) |

---

## Phase 0: Foundation (Week 1-2)

### P0.1 Audit Engine Consolidation
**Effort:** 3 days | **Risk:** LOW | **Complexity:** LOW

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| `writePlatformAuditLog` | `src/lib/platform/audit-log.ts` | KEEP | Canonical — single write path |
| `AuditLogger` | `src/lib/platform/audit-logger.ts` | MERGE → audit-log.ts | Thin wrapper, add builder pattern to canonical |
| `writeAuditEvent` | `src/lib/platform/audit-event-service.ts` | REPLACE | Duplicate of writePlatformAuditLog |
| `platform-audit.ts` | `src/lib/platform-audit.ts` | REMOVE | Legacy — all callers migrated to writePlatformAuditLog |
| Hash chain | `src/lib/platform/audit/` | KEEP | Well-designed, no changes needed |
| Audit search | `src/lib/platform/audit/` | KEEP | Already unified in Phase 0 audit event unification |

**Steps:**
1. Add AuditEventInput → PlatformAuditLogInput adapter to audit-log.ts
2. Migrate all writeAuditEvent call sites to writePlatformAuditLog
3. Delete audit-event-service.ts
4. Migrate all platform-audit.ts call sites
5. Delete platform-audit.ts
6. Verify all 300+ call sites compile

**Dependencies:** None (standalone refactor)

---

### P0.2 Notification Consolidation
**Effort:** 2 days | **Risk:** LOW | **Complexity:** LOW

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| Notification engine | `src/lib/platform/notification/` | KEEP | Canonical multi-channel engine |
| Alternative engine | `src/lib/platform/notifications/` | MERGE → notification/ | Merge features, remove duplicate |
| WorkflowOS wrapper | `src/lib/workflowos/notification-service.ts` | KEEP | Legitimate adapter pattern |

**Steps:**
1. Move any unique features from `platform/notifications/` into `platform/notification/`
2. Update all imports from `platform/notifications/` to `platform/notification/`
3. Delete `src/lib/platform/notifications/`
4. Verify WorkflowOS notification service still works

**Dependencies:** None

---

### P0.3 Platform Stub Cleanup
**Effort:** 1 day | **Risk:** LOW | **Complexity:** LOW — COMPLETED ✅

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| `platform/workflow/product-templates.ts` | REAL (15 lines) | REMOVED ✅ | Dead code — zero importers |
| `platform/evidence/evidence-service.ts` | REAL (240 lines) | KEEP | Facade phase — registerEvidence returns registered:false |
| `platform/signals/index.ts` | Signal producers | KEEP | Real implementations for audit, sales, local-content |
| `platform/signals/cross-product-commercial.ts` | STUB (returns []) | REMOVED ✅ | Dead code, no callers |

**All P0 items delivered.**|

**Dependencies:** None

---

## Phase 1: Core Engine Extraction (Week 3-4)

### P1.1 Governance Engine Move
**Effort:** 2 days | **Risk:** LOW | **Complexity:** LOW

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| retrieval-router | `src/lib/governance/` | MERGE → `src/lib/core/governance/` | Move to canonical location |
| runtime-types | `src/lib/governance/` | MERGE → `src/lib/core/contracts/` | Move types to contracts |
| approval-state | `src/lib/governance/` | KEEP (move) | Well-designed |
| escalation | `src/lib/governance/` | KEEP (move) | Well-designed |
| provenance | `src/lib/governance/` | KEEP (move) | Well-designed |
| actor-lineage | `src/lib/governance/` | KEEP (move) | Well-designed |
| prompt-framework | `src/lib/governance/` | KEEP (move) | Well-designed |

**Steps:**
1. Create `src/lib/core/contracts/governance-types.ts` (runtime-types)
2. Move governance modules to `src/lib/core/governance/`
3. Add barrel exports in `src/lib/core/governance/index.ts`
4. Keep backward-compatible re-exports in `src/lib/governance/`
5. Verify all imports resolve

**Dependencies:** P0.1

---

### P1.2 AI Execution Engine Move
**Effort:** 2 days | **Risk:** LOW | **Complexity:** LOW

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| AIOrchestrator | `src/lib/ai/orchestrator.ts` | MERGED ✅ → `src/lib/core/ai/orchestrator.ts` | Moved to core/ai/ with updated dynamic import. Backward-compat re-export in old location. |
| governedAIExecute | `src/lib/ai/governed-ai-executor.ts` | MERGED ✅ → `src/lib/core/ai/governed-ai-executor.ts` | Moved to core/ai/. Original deleted. |
| providers | `src/lib/ai/providers/` | MERGED ✅ → `src/lib/core/ai/providers/` | 14 files copied, backward-compat re-export in old location |
| types | `src/lib/ai/types.ts` | MERGED ✅ → `src/lib/core/ai/types.ts` | Moved, backward-compat re-export in old location |
| intelligence-runtime | `src/lib/ai/intelligence-runtime.ts` | MERGED ✅ → `src/lib/core/ai/intelligence-runtime.ts` | Moved, backward-compat re-export stub |
| handlers | `src/lib/ai/handlers/` | KEEP (product-specific) | Keep in products, not core |
| memory | `src/lib/ai/memory/` | MERGED ✅ → Memory Engine | Absorbed into `src/lib/core/memory/ai-memory.ts` |
| product-ai-bridge | `src/lib/platform/product-ai-bridge.ts` | KEEP | Legitimate product gateway |

**Steps:**
1. ~~Create `src/lib/core/ai/` directory structure~~ ✅ Done
2. ~~Move governed-ai-executor~~ ✅ Done
3. ~~Move intelligence-runtime~~ ✅ Done
4. ~~Move providers/ to core/ai/providers/~~ ✅ Done (14 files)
5. ~~Move types.ts to core/ai/types~~ ✅ Done
6. ~~Move orchestrator (with dynamic import fix)~~ ✅ Done
7. Keep backward-compatible exports in `@/lib/ai/`
8. Add AI Execution Engine interface

**Dependencies:** P0.1, P1.1

---

### P1.3 Knowledge Engine Extraction
**Effort:** 3 days | **Risk:** MEDIUM | **Complexity:** MEDIUM

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| RAG pipeline | `src/lib/rag/` | MERGED ✅ → `src/lib/core/knowledge/rag/` | 11 files moved to core/knowledge/rag/. Backward-compat re-export in old location. |
| knowledge-service | `src/lib/rag/knowledge-service.ts` | MERGED ✅ → core/knowledge/rag/ | Moved with full pipeline |
| intelligence-core-rag | `src/lib/rag/intelligence-core-rag.ts` | MERGED ✅ → core/knowledge/rag/ | Moved with full pipeline |
| governed-rag-metrics | `src/lib/rag/governed-rag-metrics.ts` | MERGED ✅ → core/knowledge/rag/ | Moved with full pipeline |
| hybrid-search | `src/lib/rag/hybrid-search.ts` | MERGED ✅ → core/knowledge/rag/ | Moved with full pipeline |
| embedding-service | `src/lib/rag/embedding-service.ts` | MERGED ✅ → core/knowledge/rag/ | Moved with full pipeline |
| knowledge-foundation | `knowledge-foundation/` | KEEP | Frozen charter — no code changes |
| knowledge/ | `knowledge/` | KEEP | Data files — no code changes |
| audit knowledge-engine | `src/lib/audit/knowledge-engine.ts` | KEEP (product) | Audit-specific, not RAG |
| TB intelligence | `src/lib/tb-intelligence/` | KEEP | Domain-specific |

**Steps:**
1. ~~Create `src/lib/core/knowledge/` directory~~ ✅ Done
2. ~~Move RAG pipeline (11 files) to core/knowledge/rag/~~ ✅ Done
3. ~~Extract Knowledge Engine interface~~ ✅ Done (engine.ts)
4. ~~Add Knowledge Engine to core registry~~ ✅ Done (core/index.ts)
5. ~~Keep backward-compatible re-exports in `src/lib/rag/`~~ ✅ Done (index.ts re-exports to core)

**Dependencies:** P0.1, P1.1

---

## Phase 2: Memory & Signal Consolidation (Week 5-6)

### P2.1 Memory Engine Consolidation
**Effort:** 4 days | **Risk:** MEDIUM | **Complexity:** HIGH

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| Institutional memory service | `src/lib/platform/institutional-memory/` | MERGED ✅ → `src/lib/core/memory/institutional-memory-service.ts` | Copied to core/memory/. Core facade updated to import locally. |
| AI query memory | `src/lib/ai/memory/institutional-memory.ts` | MERGED ✅ → `src/lib/core/memory/ai-memory.ts` | Merged into core/memory/ai-memory.ts, re-exported through core/memory/index.ts. Orphaned AI source deleted. |
| Agent memory | `src/lib/platform/agent-memory.ts` | KEEP | Distinct key-value use case |
| TB firm memory | `src/lib/tb-intelligence/firm-memory.ts` | KEEP | Domain-specific |

**Steps:**
1. Create `src/lib/core/memory/` directory
2. Move institutional-memory-service.ts (842 lines) to core/memory/
3. Add IntelligenceQuery storage as a graph node ingestion path
4. Create unified Memory Engine interface
5. Migrate AI memory callers to use core/memory/

**Dependencies:** P1.2, P1.3

---

### P2.2 Signal Engine Consolidation
**Effort:** 5 days | **Risk:** HIGH | **Complexity:** HIGH

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| Signal contracts | `src/lib/platform/intelligence.ts` | MERGED ✅ → `src/lib/core/signals/engine.ts` | Core Signal Engine facade with produce/acknowledge/resolve |
| Runtime signal types | `src/lib/platform/signals/types.ts` | MERGED ✅ → `src/lib/core/signals/types.ts` | Core types, backward-compat re-export in platform |
| Audit signal producer | `src/lib/platform/signals/audit-signal-producer.ts` | MERGED ✅ → `src/lib/core/signals/producers/` | Moved with updated import |
| Sales signal producer | `src/lib/platform/signals/sales-signal-producer.ts` | MERGED ✅ → `src/lib/core/signals/producers/` | Moved with updated import |
| LC signal producer | `src/lib/platform/signals/localcontent-signal-producer.ts` | MERGED ✅ → `src/lib/core/signals/producers/` | Moved with updated import |
| Decision signals | `src/lib/decision/signal-automation.ts` | MERGE → core/signals/ | Route through Signal Engine |
| Decision risk alerts | `src/lib/decision/signals-alerts.ts` | KEEP (decision-specific) | Decision-specific resolution flow |

**Steps:**
1. Create `src/lib/core/signals/` directory
2. Unify signal types (IntelligenceSignal + RuntimeSignal → CoreSignal)
3. Move product signal producers to core/signals/producers/
4. Create Signal Engine interface with produce/acknowledge/resolve
5. Add signal routing and classification
6. Wire Decision monitoring signals through Signal Engine
7. Mark product-specific signal stubs for deprecation

**Dependencies:** P0.1, P1.1, P2.1

---

## Phase 3: Policy & Decision Extraction (Week 7-8)

### P3.1 Policy Engine
**Effort:** 3 days | **Risk:** MEDIUM | **Complexity:** MEDIUM — DONE ✅

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| ABAC policies | `src/lib/platform/abac/` | MERGED ✅ → `src/lib/core/policy/access/` | Core policy engine |
| Retention policies | `src/lib/platform/retention/` | MERGED ✅ → `src/lib/core/policy/retention/` | Policy sub-module |
| Governance policy refs | `src/lib/governance/retrieval-router.ts` | MERGE → core/policy/governance/ | Policy references |
| Access/rbac | `src/lib/platform/access/` | KEEP (wraps Policy Engine) | Execution layer |

**Steps:**
1. ~~Create `src/lib/core/policy/` directory~~ ✅ Done
2. ~~Create Policy Engine interface~~ ✅ Done (core/policy/index.ts)
3. ~~Move ABAC to core/policy/access/~~ ✅ Done
4. ~~Move retention to core/policy/retention/~~ ✅ Done
5. ~~Register Policy in core registry~~ ✅ Done

**Dependencies:** P1.1, P0.1

---

### P3.2 Decision Engine Extraction
**Effort:** 3 days | **Risk:** MEDIUM | **Complexity:** MEDIUM

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| Decision Engine | `src/lib/decision/decision-engine.ts` | EXTRACT → `src/lib/core/decision/` | Generalize multi-criteria engine |
| Decision contracts | `src/lib/decision/decision-type-config.ts` | KEEP (product) | DecisionOS-specific config |
| Decision intake | `src/lib/decision/intake.ts` | EXTRACT → core/decision/ | General evaluation |
| Decision framework | `src/lib/decision/framework.ts` | EXTRACT → core/decision/ | General evaluation |
| Decision recommendation | `src/lib/decision/recommendation.ts` | EXTRACT → core/decision/ | General evaluation |
| Decision-specific | `src/lib/decision/sector*.ts, outcome*.ts` | KEEP (product) | DecisionOS-specific |

**Steps:**
1. Create `src/lib/core/decision/` directory
2. Extract generic evaluation logic from DecisionOS
3. Create Decision Engine interface
4. Keep product-specific logic in DecisionOS
5. Wire DecisionOS to use core engine

**Dependencies:** P1.2 (AI), P1.1 (Governance), P0.1 (Audit)

---

## Phase 4: Evidence & Workflow (Week 9)

### P4.1 Evidence Engine
**Effort:** 5 days | **Risk:** HIGH | **Complexity:** HIGH

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| Evidence Service stub | `src/lib/platform/evidence/evidence-service.ts` | REPLACE | Replace with full engine |
| Product evidence models (9) | `prisma/schema.prisma` | MERGE → core evidence | Unify evidence registry |
| RAG evidence metrics | `src/lib/rag/governed-rag-metrics.ts` | MERGE → core/evidence/ | Evidence refs from RAG |
| Governance provenance | `src/lib/governance/provenance.ts` | MERGE → core/evidence/ | Evidence status tracking |

**Steps:**
1. Design canonical Evidence model in Prisma (superset of all 9 product models)
2. Create `src/lib/core/evidence/` with full engine
3. Add migration: create CoreEvidence table
4. Add evidence registration API
5. Gradually migrate products to register evidence through Core
6. Keep product-specific evidence models as views/legacy during transition

**Dependencies:** P0.1, P1.3, P2.1

---

### P4.2 Workflow Engine
**Effort:** 3 days | **Risk:** LOW | **Complexity:** MEDIUM

| Capability | Current Location | Decision | Rationale |
|------------|-----------------|----------|-----------|
| WorkflowOS | `src/lib/workflowos/` | KEEP (product) | Product-specific workflow (template-based) |
| Platform stub | `src/lib/platform/workflow/product-templates.ts` | REMOVE | Already planned in P0.3 |

**Note:** Workflow Engine in the core is a cross-product state machine, NOT a replacement for WorkflowOS. WorkflowOS provides template-based custom workflows. Core Workflow Engine provides workflow primitives (transitions, gates, conditions) for other core engines.

**Dependencies:** P1.1

---

## Phase 5: Core Integration (Week 10)

### P5.1 Core Registry & Event Wiring
**Effort:** 3 days | **Risk:** MEDIUM | **Complexity:** MEDIUM

| Capability | Decision | Rationale |
|------------|----------|-----------|
| Core module registry | CREATE | Central registry of all core engines |
| Core-to-product adapters | CREATE | Bridge between Core interfaces and product implementations |
| Export path cleanup | TASK | Clean up all import paths post-moves |
| Documentation update | TASK | Update ARCHITECTURE, MAP, STATUS docs |

**Dependencies:** All prior phases

---

## Summary

| Phase | Scope | Effort | Risk | Dependencies |
|-------|-------|--------|------|-------------|
| P0.1 | Audit Engine consolidation | 3 days | LOW | None |
| P0.2 | Notification consolidation | 2 days | LOW | None |
| P0.3 | Platform stub cleanup | 1 day | LOW | None |
| P1.1 | Governance Engine move | 2 days | LOW | P0.1 |
| P1.2 | AI Execution Engine move | 2 days | LOW | P0.1, P1.1 |
| P1.3 | Knowledge Engine extraction | 3 days | MEDIUM | P0.1, P1.1 |
| P2.1 | Memory Engine consolidation | 4 days | MEDIUM | P1.2, P1.3 |
| P2.2 | Signal Engine consolidation | 5 days | HIGH | P0.1, P1.1, P2.1 |
| P3.1 | Policy Engine | 3 days | MEDIUM | P1.1, P0.1 |
| P3.2 | Decision Engine extraction | 3 days | MEDIUM | P1.2, P1.1, P0.1 |
| P4.1 | Evidence Engine | 5 days | HIGH | P0.1, P1.3, P2.1 |
| P4.2 | Workflow Engine | 3 days | LOW | P1.1 |
| P5.1 | Core integration | 3 days | MEDIUM | All prior |

**Total effort:** ~39 days (8 weeks)
**Total risk:** 2 HIGH, 4 MEDIUM, 4 LOW
**Blueprint stability:** HIGH — no new Prisma migrations required for Phases 0-1 (code moves only); Phases 2-4 require schema changes

---

## Prisma Migration Impact

| Phase | Requires Migration | Impact |
|-------|-------------------|--------|
| P0 | No | Code moves only |
| P1 | No | Code moves only |
| P2 | Yes (Memory) | IntelligenceQuery → graph node data migration |
| P2 | Yes (Signals) | Unified signal table |
| P3 | No | Code moves only |
| P4 | Yes (Evidence) | CoreEvidence table + 9 product model migration |
| P5 | No | Registry only |






