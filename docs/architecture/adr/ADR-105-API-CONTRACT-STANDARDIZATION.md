# ADR-105: API Contract Standardization

**Status:** Accepted — Codified from repository patterns  
**Date:** 2026-07-19  
**Owner:** Platform Architecture  
**Related:** ADR-100, ADR-103, ADR-101; pagination standardization (2026-07-13)

---

## Context

AQLIYA exposes:

- Next.js **Server Actions** (`src/actions/**`, `"use server"`) as the primary mutation/query API for authenticated UI.
- **Route Handlers** (`src/app/api/**/route.ts`, ~66) for downloads, webhooks, SCIM, health, platform operator APIs, SAML.
- Kernel contracts as internal ports — not HTTP OpenAPI today.

Pagination was standardized to `{ items, totalCount, hasMore }` across server actions in the Pilot Hardening Sprint.

---

## Problem

1. Mixed response shapes and error formats across actions/routes.
2. Some public marketing APIs lack auth by design — must stay explicitly classified.
3. Download routes need a uniform security contract.
4. No single OpenAPI catalog — enterprise buyers may request one later.
5. Client components must not call Prisma; boundary violations appear as type imports.

---

## Options Considered

### Option A — Full REST/OpenAPI for all products

| Pros | Cons |
|------|------|
| Familiar to enterprise integrators | Duplicates Server Actions; huge rewrite |

### Option B — tRPC or GraphQL umbrella

| Pros | Cons |
|------|------|
| Typed end-to-end | Not in stack; migration cost |

### Option C — Server Actions primary + Route Handlers for non-UI; standardized envelopes (selected)

| Pros | Cons |
|------|------|
| Matches Next.js App Router reality | OpenAPI deferred |
| Already partially standardized | Needs discipline docs |

---

## Decision

1. **UI ↔ server contract:** Server Actions are the default for authenticated product workflows.
2. **HTTP Route Handlers** are reserved for:
   - File download/export streams
   - External integrations (SCIM, SAML, webhooks)
   - Health/readiness/operator automation
   - Explicit public marketing forms (documented exceptions)
3. **List/query actions** return paginated:
   ```ts
   { items: T[]; totalCount: number; hasMore: boolean }
   ```
4. **Mutation actions** return a result object with success/error; throw or return typed errors — never leak stack traces to clients.
5. **Authorization:** Mutating actions call `enforce()` / `authorize()` (GOV-02). Routes perform equivalent session/RBAC/tenant checks.
6. **Downloads:** Auth + tenant + audit (GOV-05); stream with correct content-type; no public signed URLs without expiry design.
7. **Public Exact paths** must be listed in middleware `publicExact` / prefixes and covered in Security Risk Register if unauthenticated.
8. **OpenAPI:** Not required for v0.1 pilot. If an enterprise contract demands it, publish for Route Handlers only under a future ADR.
9. **Validation:** Prefer Zod at action/route boundaries (`zod` is a dependency).

---

## Consequences

### Positive
- Clear placement rules for new endpoints.
- Aligns with existing pagination work.
- Keeps bundle boundaries clean.

### Negative
- Integrators lack a public HTTP catalog until needed.
- Dual paradigms (actions + routes) require onboarding docs.

---

## Migration Strategy

1. Document envelope in AGENTS / developer docs (no code change for acceptance).
2. New actions must use paginated list shape.
3. Inventory public routes quarterly.
4. Progressive Zod adoption on new/changed actions.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| New list actions using standard page shape | 100% |
| Private download routes meeting GOV-05 | 100% |
| Public routes documented | 100% of `publicExact` |
| Client Prisma boundary violations | → 0 |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Action surface sprawl | Product module folders; Kernel for shared |
| Inconsistent errors | Shared result helpers over time |
| Public API abuse | Rate limits; Risk Register |

---

## Related Components

- `src/actions/**`
- `src/app/api/**`
- `src/middleware.ts`
- `src/lib/authorization/action-guard.ts`
- Pagination notes in PRODUCT_STATUS_MATRIX Pilot Hardening Sprint

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| API route count ~66 | `src/app/api/**/route.ts` |
| Actions ~173 files | `src/actions/` |
| Public paths | `src/middleware.ts` |
| Pagination claim | `PRODUCT_STATUS_MATRIX.md` / AGENTS.md Pilot Hardening |
| Zod dependency | `package.json` |
