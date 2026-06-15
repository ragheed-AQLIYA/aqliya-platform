# ADR-001: AI Runtime Strategy — TB Classification Pipeline

**Status:** Accepted  
**Date:** 2026-06-09  
**Program:** AQLIYA Parallel Execution — AI Runtime + TB Intelligence  
**Related:** [`CURRENT_STATE.md`](../operations/CURRENT_STATE.md)

---

## Context

AQLIYA requires a unified AI execution and TB classification strategy so Agent-IC (routing), Agent-AuditOS (classification), and Agent-Platform (settings) implement **one pipeline**, not three divergent assumptions.

Trust principle: **AI assists. Humans decide. Evidence governs.**

---

## Decision 1 — AI Execution Model

Organizations configure one of:

| Mode | Available | Behavior |
|------|-----------|----------|
| **Cloud** | Cycle 1+ | OpenAI, Anthropic, Azure-compatible endpoints only |
| **Local** | Cycle 2+ | Ollama REST — no cloud egress for routed tasks |
| **Hybrid** | Cycle 2+ (default for pilots) | Task-level routing local vs cloud |

Cycle 1 operates as **Cloud** until Ollama ships in Cycle 2.

Configuration storage: `TenantIntegration` (type `AI`) `configMetadata` + env fallback (`AI_MODE`, `AI_PROVIDER`).

---

## Decision 2 — Provider Priority (canonical order)

Agents **MUST NOT** skip or reorder:

```text
1. Firm Memory        — org-scoped deterministic patterns (TBMappingPattern)
2. Rules Engine       — COA KB + synonyms + prefix heuristics
3. Pattern Matching   — similarity within org/engagement history
4. Local Model        — Ollama (Cycle 2+; no-op in Cycle 1)
5. Cloud Model        — aiOrchestrator.generateClassification()
6. Human Review       — mandatory before mapping commit
```

Each step logs to `TBClassificationHistory` with `source` and `confidence`.

---

## Decision 3 — Classification Pipeline

```text
TB Account (code + name)
        ↓
   Firm Memory lookup
        ↓ miss
   COA Rules Engine
        ↓ miss
   Pattern Matching
        ↓ miss
   Local AI (Ollama) — Cycle 2+ only
        ↓ miss
   Cloud AI
        ↓
   Suggested Mapping (AuditAccountMapping status=pending, mappingType=ai_suggested)
        ↓
   Human Review → TBMappingFeedback → Firm Memory learn
        ↓ accept
   Mapping Commit (status=confirmed) → rebuildFinancialStatements
```

Implementation owner: `src/lib/tb-intelligence/engine.ts`

---

## Decision 4 — Governance Rules (non-negotiable)

| Rule | Enforcement |
|------|-------------|
| **No Auto Publish** | FS/exports stay `draft` until publication workflow |
| **No Auto Approval** | AI never sets `approved` |
| **No Auto Mapping Commit** | `confirmMapping` requires human server action |
| Evidence governs | `TBClassificationHistory` + platform audit log on every classification |
| Tenant isolation | All Firm Memory queries scoped by `organizationId` |

---

## Decision 5 — Agent Contract

| Agent | Bound sections | Primary paths |
|-------|----------------|---------------|
| Agent-IC | §1, §2, §4 | `src/lib/ai/**`, hybrid-router Cycle 2 |
| Agent-AuditOS | §3 | `src/lib/tb-intelligence/**`, audit services |
| Agent-Platform | §1 | `/settings/ai` — reflects model only, no custom routing |
| Agent-QA | §2–§4 | Pipeline order + governance gate tests |

---

## Consequences

- Cycle 1 delivers commercial MVP with Cloud step 5 only (step 4 stubbed).
- Cycle 2 adds Ollama + Hybrid without changing pipeline order.
- Cycle 5 RAG/embeddings must not alter TB classification order.
- PRODUCT_STATUS_MATRIX updated at Cycle 2 for Local AI L4 pilot with conditions.

---

## Director Sign-off

- [x] ADR-001 Accepted — 2026-06-09
- Unblocks: Pre-Cycle 0 schema + Cycle 1 implementation
