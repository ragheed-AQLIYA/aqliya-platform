# Intelligence Core Execution Backlog

**Classification:** Decision-grade architecture backlog  
**Date:** 2026-06-21  
**Scope:** Post-stabilization consolidation of `src/lib/ai`, `src/lib/governance`, `src/lib/platform`, `src/lib/rag`, `src/lib/audit` (product boundary), `src/lib/workflowos`  
**Authority:** Code inspection + existing deliverables (`INTELLIGENCE_CORE_MAP.md`, `INTELLIGENCE_DUPLICATION_REPORT.md`, `INTELLIGENCE_CORE_V2_ARCHITECTURE.md`)  
**Status:** Independent strategic track — no implementation in this document

---

## Current State Summary

AQLIYA has a **de facto Intelligence Core** spread across three pillars:

| Pillar | Location | Maturity |
|--------|----------|----------|
| Governance runtime | `src/lib/governance/` | **REAL** — 12 task types, approval/escalation/provenance |
| AI execution | `src/lib/ai/` | **REAL** — orchestrator, providers, budget, eval, hybrid routing |
| Platform services | `src/lib/platform/` + `src/lib/rag/` | **PARTIAL** — audit, memory, model governance real; evidence/signals stubs |

**Not yet unified:** `src/lib/core/` does not exist (0 files). `src/lib/intelligence/` does not exist. Workflow lives in `src/lib/workflowos/`.

**Completed (do not repeat):** Audit Event Unification, PlatformAuditLog adoption, hash chain, cross-product audit search, chain verification dashboard, Intelligence Core Discovery docs.

**Active risk:** Signal infrastructure (`src/lib/platform/signals/`) was removed without replacement; `unified-task-runtime.ts` returns empty signal collections.

---

## Backlog Items

### P0 — Foundation Blockers (Must complete before Core extraction)

---

#### IC-P0-01: Complete Legacy Audit Write Path Migration

| Field | Detail |
|-------|--------|
| **Description** | Migrate remaining `platform-audit.ts` callers to `writePlatformAuditLog()` and retire the legacy dual-write path. |
| **Business value** | Single audit truth for cross-product intelligence, SIEM, and compliance queries. Eliminates DecisionOS divergence from canonical platform audit. |
| **Technical value** | One write contract, one hash-chain path, one retention policy surface. |
| **Complexity** | LOW |
| **Dependencies** | Audit unification program (substantially complete) |
| **Risk** | LOW — 9 call sites remain (`decisions.ts`, `approval.ts`, `decision-*` actions, integration tests) |
| **Estimated effort** | 2–3 days |

**Evidence:** `grep platform-audit` → 10 files; `src/lib/platform-audit.ts` still active for DecisionOS.

---

#### IC-P0-02: Replace Signal Engine (Post-Deletion Recovery)

| Field | Detail |
|-------|--------|
| **Description** | Implement a canonical Signal Engine under future `src/lib/core/signals/` (or interim `src/lib/platform/signals/`) to replace deleted stubs. Unify `IntelligenceSignal` (platform), Decision Prisma signals, and Sales commercial signals. |
| **Business value** | Cross-product task center, operator dashboard, and Sales intelligence depend on signal aggregation. Currently broken. |
| **Technical value** | Restores `unified-task-runtime.ts` and `unified-activity-runtime.ts`; enables event-driven intelligence without full event bus. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P0-01 (audit for signal mutations); define signal taxonomy |
| **Risk** | HIGH if deferred — task runtime permanently degraded; Sales v02 cross-product signals are TODO |
| **Estimated effort** | 5–8 days |

**Evidence:** `src/lib/platform/operations/unified-task-runtime.ts:338-341` inline `signalEmpty` stub; `src/lib/sales/v02/cross-product-signals/` references removed platform signals.

---

#### IC-P0-03: Unified Authorization Gate Adoption (Intelligence Core prerequisite)

| Field | Detail |
|-------|--------|
| **Description** | Wire `requireServerActionAccess()` / `CoreAccessControl` as the mandatory gate for all Intelligence Core entry points (`product-ai-bridge`, RAG, institutional memory writes, model governance mutations). |
| **Business value** | Intelligence outputs on sensitive data require provable access control for enterprise buyers. |
| **Technical value** | Single enforcement point before Core extraction; enables ABAC attribute injection at Core boundary. |
| **Complexity** | MEDIUM |
| **Dependencies** | ABAC Readiness Phase 1 (see `ABAC_READINESS_ASSESSMENT.md`) |
| **Risk** | MEDIUM — gate exists but has zero production imports today |
| **Estimated effort** | 4–6 days |

**Evidence:** `src/core/access/server-action-guard.ts` tested but unwired; AI orchestrator checks permissions ad hoc.

---

#### IC-P0-04: Evidence Engine — Replace Stub with Registry

| Field | Detail |
|-------|--------|
| **Description** | Replace `src/lib/platform/evidence/evidence-service.ts` (5-line stub) with a canonical evidence registry: ownership, sensitivity, product linkage, download authorization hook, audit on mutation. |
| **Business value** | "Evidence governs" is platform doctrine; 9+ product-specific evidence models cannot scale to enterprise RFP. |
| **Technical value** | Unblocks ABAC evidence rules, RAG provenance, and cross-product evidence search. |
| **Complexity** | HIGH |
| **Dependencies** | IC-P0-03 (auth gate); schema design review (Prisma — separate program) |
| **Risk** | HIGH if built without schema — must start as facade over existing product models |
| **Estimated effort** | 10–15 days (facade phase) |

**Evidence:** `src/lib/platform/evidence/evidence-service.ts` returns `{ id: ev-${Date.now()} }`; AuditOS, DecisionOS, LC, Sales, Contacts each have separate evidence paths.

---

### P1 — Core Namespace Extraction (Weeks 3–6)

---

#### IC-P1-01: Create `src/lib/core/` with Backward-Compatible Re-exports

| Field | Detail |
|-------|--------|
| **Description** | Establish `src/lib/core/index.ts` registry and move governance, AI, RAG, audit write, memory behind stable interfaces per `INTELLIGENCE_CORE_V2_ARCHITECTURE.md`. |
| **Business value** | Product teams consume Core, not internal modules — reduces silo duplication. |
| **Technical value** | Enforces dependency rule: products → core → platform; enables versioned Core API. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P0-01, IC-P0-02 |
| **Risk** | MEDIUM — import churn across 70+ AI call sites |
| **Estimated effort** | 8–10 days |

**Evidence:** Zero `@/lib/core` imports in repository; v2 architecture specifies 10 engines.

---

#### IC-P1-02: Governance Engine Facade

| Field | Detail |
|-------|--------|
| **Description** | Expose `GovernanceEngine.evaluate(context)` wrapping `retrieval-router.ts` without changing internal task routing. Relocate to `core/governance/`. |
| **Business value** | Single governance entry for all products and AI tasks. |
| **Technical value** | Products stop importing `governance/retrieval-router` directly; audit bridge clarified. |
| **Complexity** | LOW |
| **Dependencies** | IC-P1-01 |
| **Risk** | LOW — module is mature and stable |
| **Estimated effort** | 3–4 days |

**Evidence:** `src/lib/governance/retrieval-router.ts` (~608 lines), 12 `GovernanceTaskType` contexts; used by AI orchestrator, product-ai-bridge, audit governance-bridge.

---

#### IC-P1-03: AI Execution Engine Facade

| Field | Detail |
|-------|--------|
| **Description** | Consolidate entry points: `product-ai-bridge`, `cross-product-ai-service`, `audit-ai-bridge`, `office-ai-orchestrator-bridge` behind `core/ai/execute()`. |
| **Business value** | Consistent AI governance, budget, and audit metadata across products. |
| **Technical value** | Eliminates 4 parallel adapter paths; `cross-product-ai-service` currently manages sessions without calling orchestrator. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P1-01, IC-P0-03 |
| **Risk** | MEDIUM — AuditOS bridge is pilot-critical |
| **Estimated effort** | 6–8 days |

**Evidence:** `src/lib/platform/product-ai-bridge.ts`, `src/lib/platform/cross-product-ai/cross-product-ai-service.ts`, `src/lib/audit/audit-ai-bridge.ts`.

---

#### IC-P1-04: Knowledge Engine Facade (RAG)

| Field | Detail |
|-------|--------|
| **Description** | Move `src/lib/rag/` under `core/knowledge/`; expose `KnowledgeEngine.retrieve()` wrapping `intelligence-core-rag.ts` and `knowledge-service.ts`. |
| **Business value** | Governed RAG becomes a first-class Core capability, not a feature-flag sidecar. |
| **Technical value** | Links knowledge-foundation assets to runtime through one API; enables admission-status checks. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P1-01; knowledge-foundation runtime wiring (see Knowledge Governance audit) |
| **Risk** | LOW — RAG is FF-gated (`FF_AI_RAG`) |
| **Estimated effort** | 4–5 days |

**Evidence:** `src/lib/rag/intelligence-core-rag.ts` — product-agnostic IC-01 API; only IFRS/SOCPA loaders exist for rules.

---

#### IC-P1-05: Audit Engine Facade

| Field | Detail |
|-------|--------|
| **Description** | Unify `audit-log.ts`, `audit-logger.ts`, and hash-chain append behind `core/audit/write()` and `core/audit/verify()`. |
| **Business value** | Operators and SIEM see one audit contract; chain verification dashboard already built. |
| **Technical value** | Completes audit unification at API level (write paths mostly done). |
| **Complexity** | LOW |
| **Dependencies** | IC-P0-01 |
| **Risk** | LOW |
| **Estimated effort** | 2–3 days |

**Evidence:** `src/lib/platform/audit-log.ts`, `src/lib/platform/audit/audit-store.ts`, `src/lib/platform/audit/hash-chain.ts`.

---

#### IC-P1-06: Memory Engine Consolidation

| Field | Detail |
|-------|--------|
| **Description** | Merge `platform/institutional-memory/institutional-memory-service.ts` (graph, 843 lines) and `ai/memory/institutional-memory.ts` (IntelligenceQuery log) under `core/memory/`. |
| **Business value** | Institutional intelligence requires one memory model for buyers evaluating "Private Governed Institutional Intelligence Platform." |
| **Technical value** | Eliminates dual models (`IntelligenceGraphNode` vs `IntelligenceQuery`); links AI queries to graph nodes. |
| **Complexity** | HIGH |
| **Dependencies** | IC-P1-01; Prisma alignment for IntelligenceQuery retention |
| **Risk** | MEDIUM — Institutional Memory is L5 pilot-ready on graph path |
| **Estimated effort** | 8–12 days |

**Evidence:** Two parallel implementations with no cross-import; retention policy covers `IntelligenceQuery` at 90 days only.

---

### P2 — Cross-Product Intelligence (Weeks 7–10)

---

#### IC-P2-01: Policy Engine (ABAC + Retention + Sensitivity)

| Field | Detail |
|-------|--------|
| **Description** | Unify `platform/abac/`, `platform/retention/`, and governance sensitivity references under `core/policy/evaluate()`. |
| **Business value** | Enterprise buyers require attribute-based rules on evidence, exports, and AI outputs. |
| **Technical value** | ABAC engine exists but unwired; retention engine is real but product audit tables excluded. |
| **Complexity** | HIGH |
| **Dependencies** | ABAC program Phase 2–3; IC-P0-03, IC-P0-04 |
| **Risk** | HIGH — policy errors are security incidents |
| **Estimated effort** | 12–15 days |

**Evidence:** `src/lib/platform/abac/abac-service.ts` — zero production call sites; `src/lib/platform/retention/policies.ts` covers PlatformAuditLog only.

---

#### IC-P2-02: Workflow Engine Extraction from WorkflowOS

| Field | Detail |
|-------|--------|
| **Description** | Extract state machine and template contracts from `src/lib/workflowos/` into `core/workflow/`; WorkflowOS becomes product adapter. |
| **Business value** | DecisionOS, LocalContentOS, and SalesOS need shared approval/review patterns without WorkflowOS coupling. |
| **Technical value** | Replaces `platform/workflow/product-templates.ts` stub; enables cross-product SLA/escalation. |
| **Complexity** | HIGH |
| **Dependencies** | IC-P1-01; WorkflowOS frozen for bugfix-only per parallel director rules |
| **Risk** | MEDIUM — WorkflowOS is L5 pilot-ready |
| **Estimated effort** | 10–14 days |

**Evidence:** `src/lib/workflowos/services.ts`, `template-service.ts`; platform stub returns null.

---

#### IC-P2-03: Decision Engine Facade

| Field | Detail |
|-------|--------|
| **Description** | Extract decision lifecycle contracts from `src/lib/decision/` and `platform/decision-gov/` into `core/decision/`. |
| **Business value** | DecisionOS patterns (evidence, committee, export gates) reusable by LocalContentOS and SalesOS governance. |
| **Technical value** | Separates product UI from decision state machine. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P1-01, IC-P0-01 |
| **Risk** | LOW — DecisionOS is L5 stable |
| **Estimated effort** | 6–8 days |

**Evidence:** `src/lib/platform/decision-gov/decision-gov-service.ts`, `DecisionGovEvent` model.

---

#### IC-P2-04: Core Adoption Enforcer — Make Real

| Field | Detail |
|-------|--------|
| **Description** | Upgrade `src/lib/platform/integration/core-adoption-enforcer.ts` from slug validation to runtime checks: products must use Core facades, not direct internal imports. |
| **Business value** | Prevents regression to silo architecture during parallel development. |
| **Technical value** | CI/lint rule or runtime assertion on product → core import graph. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P1-01 |
| **Risk** | LOW |
| **Estimated effort** | 3–5 days |

**Evidence:** Enforcer currently validates `productSlug` only.

---

#### IC-P2-05: Intelligence Workspace Routes

| Field | Detail |
|-------|--------|
| **Description** | Implement `/intelligence/*` workspace (middleware already protects prefix) for cross-product intelligence dashboard: signals, memory graph, AI activity, audit feed. |
| **Business value** | Platform positioning as "Institutional Intelligence" requires a visible intelligence surface beyond product silos. |
| **Technical value** | Consumes unified task/activity runtimes once signals restored. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P0-02, IC-P1-06 |
| **Risk** | LOW — UI-only if runtimes ready |
| **Estimated effort** | 5–7 days |

**Evidence:** `src/middleware.ts` routeMinRoles includes `/intelligence`; no matching `src/app/intelligence/` workspace.

---

### P3 — Optimization & Enterprise Hardening (Weeks 11–16)

---

#### IC-P3-01: Model Governance Registry UI + Runtime Wiring

| Field | Detail |
|-------|--------|
| **Description** | Expose `platform/model-governance/model-governance-service.ts` through Core and admin UI; enforce model approval before AI execution in production mode. |
| **Business value** | Enterprise AI governance requirement; PRODUCT_STATUS_MATRIX incorrectly lists Model Governance as L0 — code is L4+. |
| **Technical value** | Closes gap between documented status and implementation reality. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P1-03 |
| **Risk** | LOW |
| **Estimated effort** | 5–7 days |

**Evidence:** `src/lib/platform/model-governance/model-governance-service.ts` implemented; matrix says "Not implemented."

---

#### IC-P3-02: ISA / ISQM Knowledge Runtime Loaders

| Field | Detail |
|-------|--------|
| **Description** | Create `isa-rules-loader.ts` and `isqm-rules-loader.ts` mirroring IFRS/SOCPA pattern; wire AuditOS engines to knowledge-foundation assets. |
| **Business value** | AuditOS claims governed audit intelligence; Foundation has 15 ISAs + ISQM 1 admitted but disconnected from runtime. |
| **Technical value** | Closes knowledge-runtime gap; enables governed RAG over audit standards. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P1-04; knowledge-foundation admission status |
| **Risk** | LOW |
| **Estimated effort** | 6–8 days |

**Evidence:** `ifrs-rules-loader.ts`, `socpa-rules-loader.ts` exist; `isqm1-engine.ts` uses Prisma only.

---

#### IC-P3-03: Handler Generalization (AuditOS → Core)

| Field | Detail |
|-------|--------|
| **Description** | Move product-agnostic AI handlers from `src/lib/ai/handlers/` to Core; retain AuditOS-specific handlers as product adapters. |
| **Business value** | LocalContentOS and SalesOS reuse handlers without AuditOS coupling. |
| **Technical value** | Reduces AuditOS-centrism in AI layer. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P1-03 |
| **Risk** | MEDIUM — handler registration order |
| **Estimated effort** | 4–6 days |

**Evidence:** 9 handlers in `src/lib/ai/handlers/`, AuditOS-focused.

---

#### IC-P3-04: Persistent Async Queue for Core Operations

| Field | Detail |
|-------|--------|
| **Description** | Upgrade `platform/operations/queue-runtime.ts` from in-memory/feature-flagged to persistent Redis queue for AI batch, RAG ingest, notification dispatch. |
| **Business value** | Multi-instance ECS deployments require durable job processing. |
| **Technical value** | Prerequisite for event bus Phase 2; Bull infrastructure exists. |
| **Complexity** | HIGH |
| **Dependencies** | Redis verified in production (I-03 infra item) |
| **Risk** | MEDIUM — ops dependency |
| **Estimated effort** | 8–10 days |

**Evidence:** Queue runtime exists; `RATE_LIMITER=redis` unverified in prod ECS.

---

#### IC-P3-05: Core Event Contract (Pre-Bus)

| Field | Detail |
|-------|--------|
| **Description** | Define canonical event envelope (correlationId, productSlug, actorId, resourceType, action, metadata) and adapter layer for PlatformAuditLog writes — without implementing full event bus. |
| **Business value** | Standardizes cross-product activity feed before bus investment. |
| **Technical value** | De-risks EVENT_BUS program; aligns with `EVENT_BUS_PROPOSAL.md` Phase 0. |
| **Complexity** | MEDIUM |
| **Dependencies** | IC-P0-01, IC-P1-05 |
| **Risk** | LOW |
| **Estimated effort** | 4–5 days |

**Evidence:** No correlationId propagation; 11+ event stores with inconsistent schemas.

---

### P3 — Deferred (Do Not Start Yet)

| ID | Item | Reason |
|----|------|--------|
| IC-DEFER-01 | Full Event Bus implementation | Readiness 4/10; needs Core interfaces first |
| IC-DEFER-02 | AQLIYA Studio / plugin system | Readiness 4/10; no sandbox |
| IC-DEFER-03 | Multi-agent orchestration | No tool registry; governedAIExecute enforces human review |
| IC-DEFER-04 | Agent Platform (autonomous loops) | Conflicts with trust principle |
| IC-DEFER-05 | Air-gapped / local AI runtime L6 | ADR-001 L4 pilot only |

---

## Priority Summary

| Priority | Count | Theme | Target Window |
|----------|------:|-------|---------------|
| **P0** | 4 | Unblock Core — audit, signals, auth, evidence | Days 1–21 |
| **P1** | 6 | Core namespace + engine facades | Days 22–45 |
| **P2** | 5 | Policy, workflow, decision, intelligence UI | Days 46–75 |
| **P3** | 5 | Enterprise hardening, knowledge runtime, queue | Days 76–120 |

---

## Dependency Graph

```
IC-P0-01 (audit migration)
    └── IC-P1-05 (audit facade)
            └── IC-P3-05 (event contract)

IC-P0-02 (signals) ──► IC-P2-05 (intelligence workspace)
IC-P0-03 (auth gate) ──► IC-P0-04 (evidence) ──► IC-P2-01 (policy)
IC-P1-01 (core namespace)
    ├── IC-P1-02..06 (engine facades)
    └── IC-P2-02..04 (workflow, decision, enforcer)
```

---

## Validation Criteria (Per Item)

Each backlog item is **done** when:

1. Canonical module location exists with typed public API
2. Product call sites migrated or adapter documented
3. Audit trail for mutations verified
4. `npx tsc --noEmit` clean
5. Targeted tests pass (not full suite unless approved)
6. PRODUCT_STATUS_MATRIX / architecture doc updated if user-visible

---

## Known Limitations

- Prisma schema changes for unified evidence/signals are **out of scope** for this backlog document — require separate data architecture program.
- Parallel development agents must not edit overlapping files; P0 items are sequential prerequisites.
- Intelligence Readiness Scorecard (2026-06-21) rates Event Bus 4/10, Runtime Foundation 6/10, Agent Platform 5/10 — aligns with deferrals above.

**Document status:** DONE — decision-grade backlog for executive planning.
