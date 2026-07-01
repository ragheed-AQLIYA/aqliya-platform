# Parallel Execution Cycle — Tier 2 Core Namespace

**Program:** AQLIYA Parallel Execution Director  
**Cycle ID:** `2026-06-21-tier2-core-namespace`  
**Branch:** `main`  
**Authority:** `docs/deliverables/EXECUTIVE_RECOMMENDATION_2026.md` (Tier 2)  
**Prerequisite:** Tier 1 exit gate G-T1-EXIT (code complete 2026-06-21)  
**Date:** 2026-06-21  
**Duration:** Days 31–90  
**Overall:** IN_PROGRESS — Tier 2 exit slices S7–S17 complete; Event Bus Phase 2 remaining

---

## Slice T2-S7 — Shared Workflow Engine (IC-P2-02)

**Status:** done

- `src/lib/core/workflow/*` — state machine + product adapters
- Wired: DecisionOS approvals, WorkflowOS records, LocalContent project status
- Tests: `engine.test.ts`, `workflowos-adapter.test.ts`, `product-adapters.test.ts`

---

## Slice T2-S8 — Evidence Graph Linkage (IC-P1-06)

**Status:** done

- `src/lib/core/evidence/graph.ts` · `link-after-upload.ts`
- Wired: AuditOS + LocalContent evidence uploads → `IntelligenceGraphNode`
- Test: `graph.test.ts`

---

## Slice T2-S15 — ISA Rules Evaluation Engine (IC-P3-02)

**Status:** done

- `isa-rules-loader.ts` · `isa-rule-checks.ts` · `isa-rules-engine.ts`
- Hook: FS rebuild path · flag `audit.isa-rules`
- Tests: `isa-rules.test.ts`, `isa-rule-checks.test.ts`

---

## Slice T2-S9 — ABAC Shadow Mode

**Status:** done

- `src/core/access/abac-shadow.ts` — log-only ABAC at unified gate
- Wired: `requireServerActionAccess()` after RBAC grant
- Flags: `platform.abac-shadow` (default on), `platform.abac-shadow-verbose`
- Test: `abac-shadow.test.ts`

---

## Slice T2-S11 — Intelligence Workspace MVP

**Status:** done

- `src/app/(dashboard)/intelligence/page.tsx` — cross-product dashboard
- `src/lib/intelligence/workspace-dashboard.ts`
- Sidebar link «الذكاء المؤسسي»

---

## Slice T2-S13 — Default ABAC Policies Seed

**Status:** done

- `prisma/seed-abac-policies.ts` — ORG-01, SENS-02, APR-01
- Wired into `prisma/seed.ts`

---

## Slice T2-S14 — ABAC Enforce Mode

**Status:** done (pilot-org gated)

- `src/core/access/abac-gate.ts` — enforce org allowlist via `ABAC_ENFORCE_ORG_IDS`
- Flag: `platform.abac-enforce` · env: `FF_ABAC_ENFORCE=true`
- Test: `abac-enforce.test.ts`

---

## Slice T2-S17 — Outbox Handlers + ABAC Shadow Report

**Status:** done

- SIEM + notification outbox handlers
- `abac-shadow-report.ts` + `GET /api/platform/abac/shadow-report`
- Dev DB migration applied

---

## Slice T2-S18 — Event Schema Registry (Phase 2)

**Status:** done

- `src/lib/core/events/schema-registry.ts` — built-in types + validation
- Flag: `platform.event-schema-registry` · `FF_EVENT_SCHEMA_REGISTRY=true`
- Outbox insert/dispatch validates when flag on
- `GET /api/platform/events/registry` (ADMIN)
- Intelligence dashboard: registry count + schema version

---

## Slice T2-S19 — AI Cost Governance Facade

**Status:** done

- `src/lib/core/ai/cost-governance.ts` — wraps `budget-manager`
- Exported via `@/lib/core/ai`

---

## Slice T2-S20 — AI Eval Gate Facade

**Status:** done

- `src/lib/core/ai/eval-gate.ts` — wraps `eval-gate`
- Exported via `@/lib/core/ai`

---

## Next Action

**Tier 2 exit gate closed (2026-06-21).** Tier 3 S1 enterprise health started — see `parallel-execution-cycle-tier3-enterprise-2026-06-21.md`.

---

## Tier 2 Exit Validation

| Criterion | Status |
|-----------|--------|
| Core facades (governance, AI, audit, knowledge, workflow, events) | ✅ |
| ABAC shadow operational + enforce pilot readiness report | ✅ |
| ISA rules loader wired | ✅ |
| Intelligence workspace MVP `/intelligence` | ✅ |
| Event contract + outbox Phase 1 + schema registry Phase 2 | ✅ |
| AI eval + cost governance facades | ✅ |

---

## Cycle Objective

Establish **`src/lib/core/`** as the canonical Intelligence Core namespace with backward-compatible facades, then incrementally migrate product call sites.

**Exit gate:** All Tier 2 items in `EXECUTIVE_RECOMMENDATION_2026.md` § Tier 2.

---

## Slice T2-S1 — Core Namespace (IC-P1-01)

**Status:** done (facade layer)

- Created `src/lib/core/` with 9 engine facades: access, audit, contracts, evidence, governance, ai, knowledge, memory, signals
- Registry: `src/lib/core/index.ts` + `CORE_ENGINE_KEYS`
- Migrated proof call sites: evidence download routes → `@/lib/core/evidence`; unified runtimes → `@/lib/core/signals`
- Test: `src/lib/core/__tests__/registry.test.ts`

**Not in scope (IC-P1-02+):** Physical file moves from `governance/`, `ai/`, `rag/`; GovernanceEngine.evaluate wrapper

---

## Slice T2-S2 — Governance Engine Facade (IC-P1-02)

**Status:** done (thin wrapper)

- `src/lib/core/governance/engine.ts` — `GovernanceEngine.evaluate()`, `listSupportedTasks()`

---

## Slice T2-S3 — AI Execution Facade (IC-P1-03)

**Status:** done

- `src/lib/core/ai/engine.ts` — `execute()`, `AIEngine`, `isCoreAIEnabled()`
- Routes: product → `product-ai-bridge`, audit → `audit-ai-bridge`, office → `office-ai-orchestrator-bridge`
- Migrated: `decision-ai-bridge.ts` → `@/lib/core/ai`
- Test: `src/lib/core/ai/__tests__/engine.test.ts`

---

## Slice T2-S4 — Knowledge / RAG Facade (IC-P1-04)

**Status:** done (thin wrapper)

- `src/lib/core/knowledge/engine.ts` — `KnowledgeEngine.retrieve()`, `retrieve()`
- Test: `src/lib/core/knowledge/__tests__/engine.test.ts`

---

## Slice T2-S5 — Audit Engine Facade (IC-P1-05)

**Status:** done (thin wrapper)

- `src/lib/core/audit/engine.ts` — `AuditEngine.write()` with optional `appendToChain`
- Test: `src/lib/core/audit/__tests__/engine.test.ts`

---

## Next Action

Incremental migration: audit-ai-bridge, local-content AI modules → `@/lib/core/ai`; product audit writes → `AuditEngine.write()`.
