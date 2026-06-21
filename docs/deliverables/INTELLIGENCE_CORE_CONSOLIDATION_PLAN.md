# Phase 3 — Intelligence Core Consolidation Plan

**Date:** 2026-06-20  
**Scope:** Identification and consolidation of intelligence, governance, audit, workflow, notification, and permission implementations  
**Data Sources:** `src/lib/ai/`, `src/lib/governance/`, `src/lib/platform/intelligence.ts`, `src/lib/platform/institutional-memory/`, `src/lib/platform/signals/`, `src/lib/platform/cross-product-ai/`, `src/lib/platform/workflow/`, `src/lib/platform/operations/`, `src/lib/rag/`, `src/lib/audit-intelligence/`, `src/lib/local-content-intelligence/`, `src/lib/tb-intelligence/`

---

## Executive Summary

The codebase describes an "Intelligence Core" in architectural documentation, but no unified engine exists. Instead, intelligence capabilities are distributed across **12+ separate locations** with overlapping responsibilities. The governance abstraction (`src/lib/governance/`) is mature and should form the foundation of a consolidated Intelligence Core. The RAG engine is product-agnostic and well-designed. The institutional memory graph is full-featured.

**Intelligence Core Consolidation Score: 4.5/10** — scattered but salvageable

---

## 1. Current State: 12 Locations Claiming "Intelligence Core"

| # | Location | Files | Role | Overlaps With |
|---|----------|-------|------|---------------|
| IC-01 | `src/lib/ai/` | 33 | AI orchestration, providers, routing | IC-04, IC-06, IC-09 |
| IC-02 | `src/lib/governance/` | 22 | Cross-product governance framework | IC-06 (governance bridge in audit/) |
| IC-03 | `src/lib/platform/intelligence.ts` | 1 | Types/scoring only | — (pure types, no overlap) |
| IC-04 | `src/lib/platform/cross-product-ai/` | 4 | AI sessions, action registry | IC-01, IC-09 |
| IC-05 | `src/lib/platform/institutional-memory/` | 4 | Knowledge graph, collections | — (unique capability) |
| IC-06 | `src/lib/platform/signals/` | 7 | Cross-product runtime signals | IC-02 (governance events) |
| IC-07 | `src/lib/platform/workflow/` | 1 | Stub | IC-08 (contracts runtime) |
| IC-08 | `src/lib/platform/contracts/` | 4 | Audit trail + review/approval contracts | IC-07 |
| IC-09 | `src/lib/audit/governance/` | 6 | Audit-specific governance | IC-02 (duplicates governance concepts) |
| IC-10 | `src/lib/audit-intelligence/` | 1 | Thin bridge | — (1 file, minimal) |
| IC-11 | `src/lib/local-content-intelligence/` | 1 | Thin bridge | — (1 file, minimal) |
| IC-12 | `src/lib/tb-intelligence/` | 20 | Trial balance AI | IC-01 (AI orchestration) |
| IC-13 | `src/lib/rag/` | ~15 | RAG engine | IC-01 (orchestrator-rag-inject) |
| IC-14 | `src/lib/platform/operations/` | 8 | Task center, activity stream | IC-06 (signals produce tasks) |

---

## 2. Duplicate Governance Implementations

### G-01: Governance Context — `governance/` vs `audit/governance/`

| Feature | `src/lib/governance/` | `src/lib/audit/governance/` |
|---------|----------------------|---------------------------|
| Scope | Cross-product | AuditOS-specific |
| Files | 22 (types, provenance, approval, escalation, prompts, retrieval) | 6 (approval-gates, governance-engine, types) |
| Maturity | L5 — comprehensive | L4 — audit-specific wrapper |
| Reuse | Should be shared by all products | Currently only used by AuditOS |
| Overlap | Governance task types, approval states, escalation | Wraps governance concepts for audit domain |

**Impact:** `audit/governance/` duplicates or wraps governance concepts that already exist in `governance/`. Approval gates and governance engines are re-implemented for the audit domain when they could reuse the shared framework.

**Recommendation:** Deprecate `audit/governance/`. The audit domain should use `governance/` directly or via thin product-specific adapters.

### G-02: Provenance Tracking — `governance/provenance.ts`

Well-designed functional provenance engine. However:
- No product has adopted it
- AuditOS tracks provenance through `AuditEvent.previousState/newState`
- LocalContentOS tracks through `LocalContentAuditEvent.before/after`
- SalesOS uses in-memory audit entries

**Recommendation:** Provenance should become the canonical cross-product provenance tracker, adopted by all products.

### G-03: Approval State Machine — `governance/approval-state.ts`

Rules are comprehensive:
- 8 states (draft_generated → human_review → approved_by_human → finalized)
- AI cannot auto-approve (hard-coded rule)
- 3 professional tasks always require human approval

**However:** This state machine is NOT enforced at the middleware, API, or database level — it's an in-memory contract. Actual enforcement depends on each product implementing its own approval gates.

**Recommendation:** Wire approval state machine into a middleware guard for all product routes that require human approval.

---

## 3. Duplicate Audit Implementations

### See Phase 4 (Audit Unification) for complete audit analysis.

Summary of audit duplication:
- 11 separate Prisma audit models
- 5 product-specific audit write services
- 3 platform-level audit write paths
- 0 product adoptions of platform audit
- Hash chain only protects PlatformAuditLog (not any product audit table)

---

## 4. Duplicate Workflow Implementations

### W-01: Workflow Engine — 4 Incomplete Locations

| Location | What Exists | Status |
|----------|------------|--------|
| `lib/platform/workflow/product-templates.ts` | `getWorkflowTemplateForProduct()` | Returns null — shell |
| `lib/platform/contracts/review-approval-runtime.ts` | In-memory review state machine | Not connected to any product |
| `lib/workflowos/` | Full workflow service layer (14 files) | Product-specific to WorkflowOS |
| `lib/decision/` | Decision templates (7 types) | Template definitions, no workflow runtime |

**Impact:** Workflow is simultaneously over-engineered (4 locations) and non-existent (no actual cross-product workflow engine).

**Recommendation:** Consolidate into `lib/platform/workflow/` with:
1. Product-agnostic workflow engine
2. Template definitions per product
3. Review/approval as a plug-in state machine
4. Integration with governance framework

---

## 5. Duplicate Notification Implementations

### N-01: See Phase 2 D-01

Two notification engines: `notification/` (12 files) and `notifications/` (3 files). Both write to `PlatformNotification`.

---

## 6. Duplicate Permission Systems

### P-01: Authorization — 4 Layers

| Layer | Location | Maturity | Integration |
|-------|----------|----------|-------------|
| Middleware | `src/middleware.ts` (routeMinRoles) | L5 | Used by all protected routes |
| RBAC Service | `access/` | L5 | Used by server actions and API routes |
| ABAC | `abac/` | L3 | NOT wired into any authorization path |
| Core Access | `core/access/` | L4 | Re-exports platform access |

**Issue:** Middleware uses static `routeMinRoles` map. RBAC service does database-backed permission checks. ABAC is separate and unused. These don't compose.

The middleware does not call the RBAC service and has no knowledge of ABAC policies. Server actions that call the RBAC service go through a second authorization path. This means:
- A route allowed by middleware could be denied by the RBAC service
- ABAC policies could contradict both
- No single audit trail of authorization decisions

**Recommendation:** Create `authorize()` that composes:
1. Middleware gate (route-level)
2. RBAC check (permission-level)
3. ABAC evaluation (policy-level) — if policies exist for the resource
4. Tenant guard (organization-level)

---

## 7. Intelligence Core Target Architecture

### Proposed Unified Intelligence Core

```
src/lib/intelligence-core/
├── index.ts                    # Public API
├── types.ts                    # Shared types
│
├── governance/                 # ← from src/lib/governance/
│   ├── runtime-types.ts
│   ├── retrieval-router.ts     # Master governance context
│   ├── provenance.ts
│   ├── approval-state.ts
│   ├── escalation.ts
│   └── prompt-framework.ts
│
├── ai/                         # ← from src/lib/ai/
│   ├── orchestrator.ts
│   ├── providers/
│   ├── hybrid-router.ts
│   ├── governed-ai-executor.ts
│   └── budget-manager.ts
│
├── rag/                        # ← from src/lib/rag/
│   ├── intelligence-core-rag.ts
│   ├── rag-retriever.ts
│   ├── chunking-engine.ts
│   └── embedding-service.ts
│
├── memory/                     # ← from src/lib/platform/institutional-memory/
│   ├── institutional-memory-service.ts
│   └── knowledge-graph.ts
│
├── signals/                    # ← from src/lib/platform/signals/
│   ├── signal-types.ts
│   ├── audit-signal-producer.ts
│   ├── sales-signal-producer.ts
│   └── localcontent-signal-producer.ts
│
├── workflow/                   # Consolidated
│   ├── workflow-engine.ts
│   ├── review-approval.ts
│   └── templates/
│
├── events/                     # NEW — unified event system
│   ├── event-types.ts
│   ├── event-bus.ts
│   └── event-persistence.ts
│
├── operations/                 # ← from src/lib/platform/operations/
│   ├── task-center.ts
│   ├── activity-stream.ts
│   └── queue-runtime.ts
│
└── contracts/                  # ← from src/lib/platform/contracts/
    ├── audit-event-contract.ts
    ├── audit-trail-runtime.ts
    ├── review-approval-contract.ts
    └── review-approval-runtime.ts
```

### Key Design Principles

1. **Governance-first:** Every AI task, workflow transition, and signal is governed by `governance/` context
2. **Single provider resolution:** One routing path with consistent fallback chain
3. **Unified audit client:** Every intelligence operation writes to PlatformAuditLog + hash chain
4. **Event-driven:** Signals, audit events, and workflow transitions share a common event taxonomy
5. **Product-agnostic core:** Product-specific adapters live in product directories, not in the core
6. **Configurable governance:** Task-type-to-governance mapping from `retrieval-router.ts` should be extensible per organization

---

## 8. Consolidation Migration Plan

### Phase 1 — Governance Unification (2 weeks)
| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 1.1 | Move `governance/` to `intelligence-core/governance/` | 1 day | Low |
| 1.2 | Deprecate `audit/governance/`, update AuditOS to use shared | 2 days | Medium |
| 1.3 | Add governance context to platform-level types | 1 day | Low |
| 1.4 | Wire approval state machine into middleware guard | 2 days | Medium |

### Phase 2 — AI Runtime Unification (2 weeks)
| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 2.1 | Consolidate provider resolution (C-01, C-02, C-03) | 2 days | Medium |
| 2.2 | Move `ai/` to `intelligence-core/ai/` | 1 day | Low |
| 2.3 | Integrate `governed-ai-executor` into orchestrator | 2 days | Medium |
| 2.4 | Move `rag/` to `intelligence-core/rag/` | 1 day | Low |

### Phase 3 — Memory & Signals (1 week)
| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 3.1 | Move institutional memory to `intelligence-core/memory/` | 1 day | Low |
| 3.2 | Consolidate signals into `intelligence-core/signals/` | 2 days | Low |
| 3.3 | Remove signal index stubs | 0.5 days | Low |

### Phase 4 — Unified Event System (3 weeks)
| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 4.1 | Define platform event taxonomy | 2 days | Medium |
| 4.2 | Create event bus abstraction | 3 days | High |
| 4.3 | Migrate audit to unified event system | 5 days | High |
| 4.4 | Migrate signals to event system | 2 days | Medium |

### Phase 5 — Workflow Engine (3 weeks)
| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 5.1 | Design workflow engine architecture | 2 days | Medium |
| 5.2 | Implement core workflow engine | 5 days | High |
| 5.3 | Migrate product workflow templates | 3 days | Medium |
| 5.4 | Connect review/approval state machine | 3 days | Medium |

### Phase 6 — Operations Runtime (1 week)
| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 6.1 | Move operations to `intelligence-core/operations/` | 1 day | Low |
| 6.2 | Enable queue by default with Redis persistence | 2 days | Medium |
| 6.3 | Implement task persistence | 3 days | High |
| 6.4 | Enable output queue | 2 days | High |

**Total Estimated Effort:** **13-14 weeks** (3-4 months for full consolidation)

---

## 9. Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Moving files breaks imports across 100+ files | Build failure | Scripted migration + thorough test suite |
| Governance unification requires AuditOS changes | AuditOS destabilization | Keep old path for AuditOS during migration, add deprecation warnings |
| Workflow engine takes longer than estimated | Scope creep | Ship Phase 1-3 first (governance + AI + signals), defer workflow |
| Event bus changes affect all products | Coordination overhead | Define contract first, then migrate products one by one |
| Queue enablement with Redis dependency | Operational complexity | Keep fallback mode (in-memory) as default until deployment tested |

---

## 10. Scoring

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Governance reuse | 2/10 | 9/10 | 7 |
| AI runtime coherence | 4/10 | 8/10 | 4 |
| Workflow consistency | 2/10 | 8/10 | 6 |
| Audit event consistency | 3/10 | 9/10 | 6 |
| Notification consistency | 5/10 | 9/10 | 4 |
| Authorization consistency | 4/10 | 8/10 | 4 |
| **Composite** | **3.5/10** | **8.5/10** | **5.0** |
