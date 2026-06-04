# Product AI Integration Report

**Date:** 2026-06-04  
**Bridge:** `src/lib/platform/product-ai-bridge.ts`

## Integrated products

| Product | Entry | Task type | Status |
|---------|-------|-----------|--------|
| LocalContentOS | `src/lib/local-content/content/ai.ts` | `commercial_claim_review` | ✅ Orchestrator path when `ai.rag` or `ai.real-providers` |
| SalesOS | `intelligence-runtime.ts` routing | `commercial_claim_review` | ✅ Route metadata (runtime builder) |
| AuditOS | `audit-ai-bridge.ts` | Audit task types | ✅ Pre-existing A1-09 |

## Cross-product deterministic handlers

| Handler | Task type |
|---------|-----------|
| `commercial-claim-assist-handler.ts` | `commercial_claim_review` |
| `pilot-decision-assist-handler.ts` | `pilot_decision` |

Registered in `register-handlers.ts` — enables governed fallback without AuditOS engagement.

## `runGovernedProductAI` contract

- Tenant-scoped `organizationId`
- Intelligence route via `routeIntelligenceRequest`
- Orchestrator `generate()` with RAG inject when flagged
- Platform audit: `product_ai_generation`
- Always `reviewRequired: true`

## LocalContentOS behavior

When Core flags on: draft body may include orchestrator output + source summary.  
When off: existing governed prompt + deterministic Arabic draft (unchanged).

## Not in scope this slice

- SalesOS vnext placeholder audit stubs (`commercial-review-runtime.ts`)
- WorkflowOS AI workflows
- New product routes

## Readiness

| Label | Value |
|-------|-------|
| Repo integration | L4+ wired |
| Production AI | Conditional on flags + pgvector |
