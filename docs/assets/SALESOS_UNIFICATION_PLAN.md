# SalesOS Architecture Unification Plan (TD-005)

**Status:** Plan — Awaiting Execution  
**Date:** 2026-06-30

## Current State

SalesOS has 3 parallel code layers with 7 duplicated domains:

| Layer | Files | Importers |
|-------|-------|-----------|
| `src/lib/sales/` (main) | ~170 | 97 |
| `src/lib/sales/v02/` | ~56 | 10 |
| `src/lib/sales/vnext/` | ~26 | 22 |

**7 duplicated domains:** proof-effectiveness, proof-network, market-intelligence, institutional-learning, cross-product-signals, knowledge-graph, strategic-recommendations

## Execution Plan

### Phase 1: Merge 7 vnext facades into v02 (1.5h)

Collapse these vnext files that are thin re-export facades:
- `commercial-knowledge-graph.ts` → `v02/knowledge-graph/index.ts`
- `commercial-proof-network.ts` → `v02/proof-network/index.ts`
- `commercial-recommendations.ts` → `v02/strategic-recommendations/index.ts`
- `proof-effectiveness.ts` + `wave-b.ts` → `v02/proof-effectiveness/index.ts`
- `cross-product-signals.ts` → `v02/cross-product-signals/index.ts`
- `proof-network-overview.ts` + `commercial-proof-network-overview.ts` → alongside v02

### Phase 2: Keep 14 genuinely new vnext modules (no action)

These have no v02 equivalent and stay:
account-intelligence, commercial-evidence, commercial-memory, commercial-review-runtime, deal-review, icp-learning, learning-loop, meeting-intelligence, next-action-engine, opportunity-intelligence, pipeline-analytics, proposal-workflow, revenue-intelligence, workspace-metadata

### Phase 3: Resolve double `next-action-engine.ts`

Both `src/lib/sales/next-action-engine.ts` and `src/lib/sales/vnext/next-action-engine.ts` exist. Must compare and merge.

### Phase 4: Fix v02→vnext reverse dependency

`v02/strategic-recommendations/icp-drift-rules.ts` imports from vnext — extract to shared `intelligence/`.

### Phase 5: Migrate 32 importers, update paths

### Phase 6: Create single `src/lib/sales/index.ts` public API

**Total effort:** ~5 days human / ~1.5h AI
