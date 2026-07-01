# Intelligence Duplication Report

**Generated:** 2026-06-21  
**Method:** Full repository code inspection  
**Severity Levels:**
- **LOW** — Cosmetic or naming overlap, no behavioral conflict
- **MEDIUM** — Behavioral overlap, can coexist but should merge
- **HIGH** — Multiple implementations of same function, active confusion risk
- **CRITICAL** — Competing implementations of security/audit/governance primitives

---

## 1. CRITICAL — Audit Log Write Paths

### Duplicates
| # | Module | Lines | Type | Use Count |
|---|--------|-------|------|-----------|
| A | `src/lib/platform/audit-log.ts` (writePlatformAuditLog) | 196 | Canonical | ~300+ call sites |
| B | `src/lib/platform/audit-logger.ts` (AuditLogger) | 101 | Convenience wrapper | ~50 call sites |
| C | `src/lib/platform/audit-event-service.ts` (writeAuditEvent) | 105 | Alternative wrapper | ~20 call sites |
| D | `src/lib/platform-audit.ts` | Unknown | Legacy helper | ~5 call sites |

### Analysis
All four write to `PlatformAuditLog` table but use different function signatures, import paths, and metadata formats. `writeAuditEvent` (C) duplicates `writePlatformAuditLog` (A) with a different input type. `AuditLogger` (B) is a thin builder pattern on top of (A) — actually well-designed. (D) is legacy and should be removed.

**Severity: CRITICAL** — 4 competing write paths to the same table with different interfaces. Risk of inconsistent records.

**Resolution:**
- (A) KEEP as canonical
- (B) MERGE interface options into (A) or keep as thin wrapper (valid pattern)
- (C) REPLACE calls with (A)
- (D) REMOVE

---

## 2. HIGH — Notification Systems

### Duplicates
| # | Module | Lines | Type | Use Count |
|---|--------|-------|------|-----------|
| A | `src/lib/platform/notification/engine.ts` | 212 | Canonical notification engine | ~30 call sites |
| B | `src/lib/platform/notifications/engine.ts` | Unknown | Duplicate engine | ~5 call sites |
| C | `src/lib/workflowos/notification-service.ts` | 221 | WorkflowOS wrapper | ~15 call sites |

### Analysis
(A) is the canonical multi-channel notification engine (email, in-app, webhook, rate-limited, preference-aware). (B) is a separate engine in a sibling namespace (`platform/notifications/` vs `platform/notification/`) — same directory purpose, different implementations. (C) wraps (A) with WorkflowOS-specific types — legitimate adapter pattern but adds complexity.

**Severity: HIGH** — Two notification engines in the same package namespace.

**Resolution:**
- (A) KEEP as canonical
- (B) REMOVE — merge functionality into (A)
- (C) KEEP as thin adapter, but ensure all notifications go through (A)

---

## 3. HIGH — Signal Systems

### Duplicates
| # | Module | Lines | Type | Use Count |
|---|--------|-------|------|-----------|
| A | `src/lib/platform/signals/` (audit-signal-producer, sales-signal-producer, localcontent-signal-producer) | 284+ | Product-specific signals | ~5 products |
| B | `src/lib/decision/signal-automation.ts` | 60 | Decision monitoring signals | ~10 call sites |
| C | `src/lib/platform/intelligence.ts` (IntelligenceSignal, RiskAssessment, etc.) | 129 | Intelligence signal contracts | ~20 call sites |
| D | `src/lib/platform/signals/types.ts` (RuntimeSignal) | 33 | Runtime signal type | ~15 call sites |

### Analysis
(A) and (D) share the same directory but use different signal models. (B) uses Prisma models (DecisionMonitoringSignal, DecisionRiskAlert) — completely separate from (A)/(D). (C) defines intelligence-level signal contracts that could unify everything. The platform signal index (`index.ts`) has all collector stubs returning `[]` despite real implementations in the product-specific files.

**Severity: HIGH** — Three signal models (RuntimeSignal, IntelligenceSignal, DecisionMonitoringSignal) for essentially the same thing.

**Resolution:**
- (C) KEEP as canonical signal contract type
- (A) MERGE signal producers to use (C) types
- (B) KEEP decision-specific but align with (C)
- (D) MERGE into (C)

---

## 4. MEDIUM — Memory Systems

### Duplicates
| # | Module | Lines | Type | Use Count |
|---|--------|-------|------|-----------|
| A | `src/lib/platform/institutional-memory/institutional-memory-service.ts` | 842 | Graph-based memory | ~40 call sites |
| B | `src/lib/ai/memory/institutional-memory.ts` | 272 | Query/insight memory | ~15 call sites |
| C | `src/lib/platform/agent-memory.ts` | 118 | Key-value agent memory | ~10 call sites |
| D | `src/lib/tb-intelligence/firm-memory.ts` | ~200 | Firm-specific memory | ~8 call sites |

### Analysis
(A) is the full institutional memory service with graph nodes, edges, collections, batch ingestion, search. (B) is an AI-specific memory that stores queries and insights using IntelligenceQuery model — different model, different purpose but same "memory" concept. (C) is agent key-value memory with TTL — distinct purpose. (D) is AuditOS-specific trial balance classification memory.

**Severity: MEDIUM** — (A) and (B) serve overlapping use cases with different data models.

**Resolution:**
- (A) KEEP as canonical institutional memory
- (B) MERGE into (A) — migrate query/insight storage to graph nodes
- (C) KEEP as agent memory (distinct use case)
- (D) KEEP as TB-specific (distinct use case)

---

## 5. MEDIUM — Knowledge Systems

### Duplicates
| # | Module | Status | Type |
|---|--------|--------|------|
| A | `knowledge-foundation/` (17 files) | Frozen charter | Knowledge authority ontology |
| B | `src/lib/rag/knowledge-service.ts` | REAL (FF gated) | RAG knowledge ingestion |
| C | `src/lib/rag/` (12 files) | REAL (FF gated) | Full RAG pipeline |
| D | `knowledge/` (4 dirs) | REAL | Domain data files |
| E | `src/lib/audit/knowledge-engine.ts` | REAL | Audit domain knowledge |
| F | `src/lib/tb-intelligence/` (20 files) | REAL | TB classification knowledge |

### Analysis
Knowledge is scattered across 6 locations. The `knowledge-foundation/` is a frozen architecture document set (not runtime code). `src/lib/rag/` is the runtime RAG system. `knowledge/` contains data files. Domain-specific knowledge engines (E, F) exist in products.

**Severity: MEDIUM** — Fragmented but not directly conflicting. Each has a distinct purpose.

**Resolution:**
- (A) KEEP as frozen architecture authority
- (B) KEEP as canonical knowledge ingestion
- (C) KEEP as canonical RAG pipeline
- (D) MERGE under knowledge-foundation
- (E) MERGE into RAG knowledge service
- (F) KEEP as TB-specific (distinct use case, not RAG)

---

## 6. MEDIUM — Governing AI Execution

### Duplicates
| # | Module | Lines | Type |
|---|--------|-------|------|
| A | `src/lib/ai/orchestrator.ts` + `src/lib/ai/governed-ai-executor.ts` | 500 total | Canonical AI execution |
| B | `src/lib/platform/product-ai-bridge.ts` | 122 | Cross-product AI entry |
| C | `src/lib/platform/cross-product-ai/cross-product-ai-service.ts` | Unknown | Thin wrapper |
| D | `src/lib/office-ai/office-ai-orchestrator-bridge.ts` | Unknown | Office AI bridge |

### Analysis
(A) is the canonical orchestrator. (B) wraps (A) with product-specific governance. (C) is a thin re-export of (B). (D) connects Office AI Assistant to the orchestrator.

**Severity: MEDIUM** — Layered wrappers are acceptable, but (C) is unnecessary indirection.

**Resolution:**
- (A) KEEP as canonical
- (B) KEEP as product gateway
- (C) REMOVE — unnecessary layer
- (D) KEEP as Office AI adapter

---

## 7. LOW — Tenant Guard Implementations

### Duplicates
| Module | Product |
|--------|---------|
| `src/lib/platform/guards/platform-org-guard.ts` | Platform |
| `src/lib/platform/guards/workspace-guard.ts` | Platform |
| `src/lib/workflowos/tenant-guard.ts` | WorkflowOS |
| `src/lib/audit/tenant-guard.ts` | AuditOS |

**Severity: LOW** — Each has product-specific logic. Acceptable unless they can be unified.

---

## 8. LOW — Workflow Template Systems

### Duplicates
| Module | Status |
|--------|--------|
| `src/lib/workflowos/template-service.ts` | REAL (606 lines) |
| `src/lib/platform/workflow/product-templates.ts` | STUB (5 lines, returns null) |

**Severity: LOW** — The platform stub is unused.

---

## 9. LOW — Export Services

### Duplicates
| Module | Product |
|--------|---------|
| `src/lib/platform/export.ts` | Platform |
| `src/lib/platform/production-export.ts` | Platform |
| `src/lib/platform/download.ts` | Platform download |
| `src/lib/audit/export-service.ts` | AuditOS |
| `src/lib/workflowos/export/` | WorkflowOS |
| `src/lib/decision/decision-export-formats.ts` | DecisionOS |

**Severity: LOW** — Each export serves a different domain. Platform export is a shared utility.

---

## 10. LOW — Cross-Product Intelligence Routing

### Duplicates
| Module | Status |
|--------|--------|
| `src/lib/ai/intelligence-runtime.ts` | REAL (92 lines) |
| `src/lib/platform/intelligence.ts` | Contracts only (129 lines) |

**Severity: LOW** — Contracts vs runtime. They complement each other.

---

## Summary

| # | Area | Severity | Current Count | Target Count | Effort |
|---|------|----------|---------------|--------------|--------|
| 1 | Audit log write paths | CRITICAL | 4 → 1 | 2 (canonical + thin wrapper) | 2 days |
| 2 | Notification systems | HIGH | 3 → 1 | 2 (canonical engine + product adapter) | 3 days |
| 3 | Signal systems | HIGH | 4 → 1 | 2 (canonical signal contract + product producers) | 5 days |
| 4 | Memory systems | MEDIUM | 4 → 2 | 2 (institutional memory + agent memory) | 4 days |
| 5 | Knowledge systems | MEDIUM | 6 → 4 | 3 (foundation + RAG + domain data) | 3 days |
| 6 | Governing AI execution | MEDIUM | 4 → 3 | 3 (orchestrator + product bridge + adapters) | 1 day |
| 7 | Tenant guards | LOW | 4 → 4 | KEEP | 0 days |
| 8 | Workflow templates | LOW | 2 → 1 | 1 | 0.5 days |
| 9 | Export services | LOW | 6 → 6 | KEEP | 0 days |
| 10 | Intelligence routing | LOW | 2 → 2 | KEEP | 0 days |

**Total duplication cleanup effort:** ~18.5 days
