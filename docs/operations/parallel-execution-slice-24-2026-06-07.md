# Slice 24 — Demo smoke static gate aligned to repo

**Date:** 2026-06-07  
**Baseline:** `ec7beec`

## Delivered

| ID | Deliverable |
| -- | ----------- |
| **OPS** | `scripts/demo-smoke-check.mjs` — paths synced to real RAG/tenant/pgvector tests |
| **OPS** | `npm run demo:smoke` — **PASS** (static, no server) |

## Changes

- Removed stale `initSalesWorkspace` ban (SalesOS still uses workspace init; runbook documents Prisma path)
- RAG tests → `orchestrator-rag-inject`, `knowledge-api`, `audit-ai-bridge`, `pgvector-compat`, `retrieval-validation`
- Tenant → `cross-tenant-isolation.test.ts` + `org-scoping.test.ts`
- Middleware → `middleware-rate-limit-l014.test.ts`
- Migration scan uses `readdir` (was broken `readFile` on directory)

## Validation

| Command | Result |
| ------- | ------ |
| `npm run demo:smoke` | **PASS** |

**Status:** DONE
