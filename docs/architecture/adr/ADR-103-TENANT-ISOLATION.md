# ADR-103: Tenant Isolation

**Status:** Accepted — Codified from repository reality  
**Date:** 2026-07-19  
**Owner:** Security Architecture / Platform  
**Constitution principles:** Product Independence (data plane), One Owner Rule  
**Related:** ADR-100, ADR-102, authorization waves docs under `docs/architecture/AQLIYA_AUTHORIZATION_*`

---

## Context

AQLIYA is multi-tenant. Hierarchy includes `PlatformOrganization` → workspaces/clients/projects → product entities. Isolation is enforced via JWT claims (`organizationId`), middleware RBAC, `authorize()` / `enforce()`, and product-specific tenant guards. ADMIN role may cross tenants by design in `checkTenantAccess`.

---

## Problem

1. Inconsistent field names (`organizationId` vs `platformOrganizationId` vs product-scoped IDs).
2. ADMIN cross-tenant allow is powerful — must remain explicit, audited, and rare.
3. Download/export routes are high-risk for IDOR if org checks are skipped.
4. Public demo routes (`/auditos`) must never touch real tenant data.
5. Middleware matcher gaps could leave routes without edge checks (defense in depth still required server-side).

---

## Options Considered

### Option A — Row-level security (Postgres RLS) as primary control

| Pros | Cons |
|------|------|
| DB-enforced | Not implemented; large migration; Prisma complexity |

### Option B — Application-layer tenancy with layered guards (selected)

| Pros | Cons |
|------|------|
| Already implemented | Relies on discipline + GOV rules |
| Fits Next.js Server Actions model | ADMIN bypass must be governed |

### Option C — Separate database per tenant

| Pros | Cons |
|------|------|
| Strong isolation | Cost/ops prohibitive at current stage |

---

## Decision

1. **Primary isolation key:** Authenticated user’s `organizationId` (JWT session) must match resource tenant for non-ADMIN actors.
2. **Enforcement layers (all required for private data):**
   - Edge: `src/middleware.ts` session + `routeMinRoles`
   - Server: `authorize()` / `enforce()` / product `tenant-guard` helpers
   - Data: queries scoped by org/workspace/engagement/project IDs
3. **ADMIN cross-tenant access:** Allowed only via explicit role check; mutations must still audit. Not a “skip auth” path.
4. **Downloads/exports:** Auth + tenant/RBAC + audit log (GOV-05). Prefer 404 over 403 for existence hiding where pattern already used.
5. **Demo/public surfaces:** No real customer data; no privileged mutations (`/auditos`, marketing APIs).
6. **New models:** Must include tenant ownership fields + indexes unless platform-global by ADR exception (e.g. some Knowledge Foundation releases).

---

## Consequences

### Positive
- Consistent with existing authorization program.
- Defense in depth across edge and server.

### Negative
- Without RLS, a missed `where` clause is a critical bug class.
- Field naming inconsistency continues until a normalization pass.

---

## Migration Strategy

1. Keep GOV-02/GOV-05 as BLOCK for new code.
2. Raise `enforce()` coverage on mutating actions (Architecture Governance TD-04).
3. Inventory download routes periodically via security agent.
4. Optional future: Postgres RLS as defense-in-depth — requires separate ADR.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Download routes with auth+tenant+audit | 100% of private downloads |
| Cross-tenant isolation tests | Present and green for critical paths |
| New models without tenant field | 0 (unless ADR exception) |
| Public demo data leakage incidents | 0 |

---

## Risks

| Risk | Mitigation |
|------|------------|
| IDOR via guessable IDs | Server-side org checks; audit |
| ADMIN abuse | MFA for admin roles; audit trail |
| Matcher miss | Server `enforce()` always |

---

## Related Components

- `src/lib/authorization/tenant-guard.ts`, `authorize.ts`, `action-guard.ts`
- `src/lib/audit/tenant-guard.ts`, `src/lib/workflowos/tenant-guard.ts`
- `src/middleware.ts`
- `src/lib/auth-config.ts` (JWT claims)

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| Unified tenant check | `src/lib/authorization/tenant-guard.ts` |
| Middleware roles | `src/middleware.ts` `routeMinRoles` |
| GOV-05 downloads | `engineering/gates/ACTIVE_GOVERNANCE_RULES.md` |
| Sample download pattern | `src/app/api/local-content/.../download/route.ts`, audit/office-ai download routes |
| Authorization program docs | `docs/architecture/AQLIYA_AUTHORIZATION_*.md` |
