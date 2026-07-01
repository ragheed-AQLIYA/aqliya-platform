# Problem

﻿# SalesOS L6 — Phase 3 bundler boundary unblock

**Date:** 2026-06-01  
**Branch:** `feature/salesos-l6-unblock`  
**Validation:** code review + grep (not browser-signed)

---

## Problem

Authenticated `/sales/*` routes failed at runtime with `ModuleParseError`: duplicate `syncInstitutionalMemoryForAccount` in a `next-flight-loader` bundle adjacent to `icp-types` / `clampScore` (consistent with `icp-fit-agent` entering the client graph via server-action extraction).

## Mitigations applied (Phase 3)

| Change | Purpose |
|--------|---------|
| `institutional-memory-shared.ts` | Client-safe types + metadata helpers (no Prisma) |
| `signals-shared.ts`, `governance-shared.ts`, `commercial-claims-shared.ts`, `deal-risk-shared.ts` | Break server modules out of client imports |
| `server-only` on `institutional-memory.ts`, `governance.ts`, `icp-fit-agent.ts`, etc. | Enforce server boundary |
| Client components import `*-shared` only | e.g. `account-signal-timeline`, `account-institutional-memory-timeline` |
| `icp-fit.ts` → `icp-fit-agent.ts` | Naming clarity; removed institutional-memory hook from agent |

## Phase 4 follow-up (same branch)

- `governance.ts`: removed static `institutional-memory` import; `syncInstitutionalMemoryForAccount` loaded via **dynamic import** at call site.
- `governance.ts`: re-export `appendReviewDecisionMetadata` from `governance-shared` (Jest import surface).
- `account-brief-view.tsx`: uses `signals-shared` (verified).

## Honest status after Phase 4 re-smoke

**Browser smoke remains BLOCKED** until a human restarts dev with a clean `.next` cache and re-tests authenticated routes.

## Classification

- **Code boundary fix:** light validated (grep + targeted Jest)
- **Browser validated:** **No**
- **L6 institutional sign-off:** **No**
