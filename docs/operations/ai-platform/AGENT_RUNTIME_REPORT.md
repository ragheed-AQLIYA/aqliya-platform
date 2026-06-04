# Agent Runtime Report

**Date:** 2026-06-04  
**Scope:** Intelligence Core orchestration (not Cursor subagents)

## Runtime components

| Component | File | Validated |
|-----------|------|-----------|
| Orchestrator | `orchestrator.ts` | ✅ generate + stream |
| RAG inject | `orchestrator-rag-inject.ts` | ✅ unit tests |
| Provider router | `provider-router.ts` | ✅ IC-09 |
| Budget | `budget-manager.ts` | ✅ IC-06 when flagged |
| Deterministic registry | `register-handlers.ts` | ✅ 7 handlers |
| Prompt registry | `prompt-registry.ts` | ✅ 5 builders + cross-product assist |

## Routing

```
Request → governance context (retrieval-router)
        → prompt assembly (if builder exists)
        → RAG inject (if ai.rag + org + query/text)
        → budget check (if ai.budget-quotas)
        → selectOptimalProvider / preferProvider
        → execute → deterministic fallback on error
        → audit (onGenerate + product bridges)
```

## Tool calling

No autonomous tool-calling agent loop in repo.  
APIs are explicit: `/api/ai/stream`, `/api/ai/knowledge/*`, product bridges.

## Context propagation

| Source | Propagated via |
|--------|----------------|
| Doctrine | `getGovernanceContext` |
| RAG chunks | `taskInput.ragContext`, `ragEvidence`, `ragGovernance` |
| Product scope | `productKey`, `resourceId` in taskInput |

## Fallback behavior

| Failure | Behavior |
|---------|----------|
| RAG error | Non-blocking — generation continues |
| Real provider error | Falls back to `deterministic` |
| Missing handler | Error unless real provider returns text |
| Budget exceeded | Throws (when `ai.budget-quotas` on) |

## API surface

| Route | Auth |
|-------|------|
| `/api/ai/stream` | VIEWER + `ai.streaming` |
| `/api/ai/providers` | ADMIN |
| `/api/ai/knowledge/*` | VIEWER/OPERATOR + `ai.rag` |

## Tests

- `orchestrator-ic02.test.ts`
- `orchestrator-rag-inject.test.ts`
- `audit-ai-bridge.test.ts`
- `provider-router.test.ts`

## Readiness label

**Agent runtime: Repo-validated L5**  
**Live production: Conditional on OpenCode deployment + env flags**
