# Slice 32 — Standalone smoke + health probes + SalesOS notice

**Date:** 2026-06-04  
**Baseline:** `07dc145`

## Delivered

| ID | Deliverable |
| -- | ----------- |
| **OPS** | `/api/health/live` — liveness without DB |
| **OPS** | `/api/health/ready` — readiness (deps) |
| **OPS** | `/api/health` — liveness + auth secret |
| **B** | `npm run smoke:local` — post-deploy against localhost |
| **B** | `ProductWorkspaceNotice` on SalesOS layout (L3 truthful) |
| **B** | Notification engine + SMTP `.env.example` |
| **B** | `health-routes.test.ts` |

**Validation:** `tsc` pass; health + notification tests pass. `smoke:local` not run — `.next/standalone` missing (re-run `npm run build` then `start:standalone`).

**Status:** DONE_WITH_CONCERNS
