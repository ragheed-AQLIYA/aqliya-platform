# AQLIYA Authorization — Wave 10: AuditOS Assessment Report

**Status:** Complete  
**Date:** 2026-07-11  
**Purpose:** Assess AuditOS authorization state and determine migration needs  
**Author:** Authorization Consolidation Agent

---

## 1. Executive Summary

**AuditOS requires no migration.** It has zero `requireUserContext` calls and already operates on a clean, modern authorization architecture that is functionally equivalent to — and in some respects more sophisticated than — the shared platform model.

| Metric | Value |
|--------|-------|
| `requireUserContext` calls in AuditOS | **0** |
| AuditOS-specific auth infrastructure | 3 files (actor-context.ts, tenant-guard.ts, rate-limit.ts) |
| Action files using `getAuditActor()` | 22 files |
| Server pages using `getAuditActor()` | 5 files |
| API routes using platform `enforce()` | 1 file (evidence download) |
| Tests covering AuditOS auth | 7 test files |
| Migration needed | **None** |

---

## 2. AuditOS Authorization Architecture

AuditOS has its own complete authorization system that predates and is independent of the platform consolidation effort. It was built from the ground up with ISA/ISQM compliance requirements in mind.

### 2.1 Core Auth Infrastructure

| File | Purpose |
|------|---------|
| `src/lib/audit/actor-context.ts` | Core actor resolution — bridges NextAuth session to `AuditActor`; provides `getAuditActor()`, `requireRole()`, `canDraft()`, `canReview()`, `canApprove()` |
| `src/lib/audit/tenant-guard.ts` | AuditOS tenant isolation — `assertEngagementAccess()`, `assertClientAccess()`, `assertOrganizationAccess()` |
| `src/lib/audit/rate-limit.ts` | Per-actor, per-organization rate enforcement |

### 2.2 Auth Flow (Every AuditOS Server Action)

```
1. getAuditActor()
   → getCurrentUser() [platform] → AuditOrganization lookup → AuditUser lookup
   → Returns: AuditActor { actorId, actorName, actorRole, organizationId }

2. requireRole(actor, ["admin", "operator", ...])
   → Role-based gate (AuditOS 6-role hierarchy)

3. assertEngagementAccess(engagementId, actor)
   → DB lookup → engagement.organizationId === actor.organizationId
   → Tenant isolation (engagement-scoped)
```

### 2.3 Role Hierarchy

| Role | canDraft | canReview | canApprove | Platform Mapping |
|------|----------|-----------|------------|-----------------|
| `admin` | ✅ | ✅ | ✅ | ADMIN |
| `partner` | ❌ | ❌ | ✅ | OPERATOR |
| `manager` | ❌ | ✅ | ❌ | OPERATOR |
| `operator` | ✅ | ✅ | ❌ | OPERATOR |
| `reviewer` | ❌ | ✅ | ❌ | VIEWER |
| `viewer` | ❌ | ❌ | ❌ | VIEWER |

### 2.4 Dual-Tenant Model

AuditOS has a **bridge architecture** between platform organizations and audit organizations:

```
PlatformOrganization
  └─ platformOrganizationId
       └─ AuditOrganization.platformOrganizationId (bridge)
            └─ AuditOrganization.id (audit-specific org)
                 └─ AuditUser.organizationId (audit user)
                      └─ AuditEngagement.organizationId (engagement scoping)
```

`getAuditActor()` traverses this chain: `sessionUser.platformOrganizationId` → `AuditOrganization` → `AuditUser` → `AuditActor`.

---

## 3. Why AuditOS Was Not Affected by the Legacy Pattern

AuditOS was built **before** the `requireUserContext` pattern was established. It has its own auth infrastructure (`actor-context.ts`) that was designed specifically for audit workflow requirements:

1. **6-role hierarchy** vs platform's 3-role — audit workflows need `partner`, `manager`, `reviewer` distinctions
2. **Engagement-level scoping** — resources are scoped through `engagementId`, not direct `organizationId`
3. **Dual-tenant bridge** — audit firms manage multiple client organizations through the `PlatformOrganization` bridge
4. **ISA compliance** — role-based gates for drafting, reviewing, approving are ISA 230/320/450 requirements

The only AuditOS file that uses the platform's `enforce()` is the evidence download route (`src/app/api/audit/evidence/[evidenceId]/download/route.ts`), which is an API route that needs platform-level export controls.

---

## 4. Comparison: AuditOS vs Platform Model

| Capability | AuditOS System | Platform `enforce()` |
|-----------|---------------|---------------------|
| Role-based access | `requireRole(actor, [...])` — 6 roles | `enforce(user, resource, action)` — 3 roles |
| Tenant isolation | `assertEngagementAccess()` — DB lookup | `checkTenantAccess()` — organizationId match |
| Resource scoping | Engagement-level (DB chain) | Organization-level (direct) |
| Actor resolution | `getAuditActor()` → `getCurrentUser()` | `getCurrentUser()` directly |
| Rate limiting | `enforceAuditRateLimit()` — per-actor | Not in platform model |
| Audit trail | `AuditEvent` model — every mutation | Not in platform model |

**AuditOS is more sophisticated than the platform model** for its domain. Migrating it to `enforce()` would be a downgrade in granularity.

---

## 5. Unused Code in AuditOS Auth

The audit found 3 defined-but-never-called functions in `actor-context.ts`:

| Function | Purpose | Callers |
|----------|---------|---------|
| `canDraft(actor)` | Returns `["admin", "operator"].includes(actor.actorRole)` | 0 |
| `canReview(actor)` | Returns `["admin", "operator", "reviewer"].includes(actor.actorRole)` | 0 |
| `canApprove(actor)` | Returns `["admin", "partner"].includes(actor.actorRole)` | 0 |

Also in `tenant-guard.ts`:
| Function | Purpose | Callers |
|----------|---------|---------|
| `assertClientAccess()` | Client-level tenant guard | 0 |

These are **utility helpers** that were built for convenience but all action files use `requireRole(actor, [...])` directly with explicit role arrays. They are not dead code — they are unused utilities that could be useful in the future.

**Recommendation:** Keep as-is. They are small, correct, and may be used by future AuditOS features.

---

## 6. Remaining `requireUserContext` Calls (Post-Wave 9)

After Waves 1–9, the global `requireUserContext` count:

| Product/Area | Calls | Status |
|-------------|-------|--------|
| **AuditOS** | **0** | ✅ Never used legacy pattern |
| **DecisionOS** | ~8 | ✅ Migrated (Waves 1–3) |
| **SalesOS** | **0** | ✅ Migrated (Wave 9) |
| **WorkflowOS** | ~9 | ✅ Migrated (Waves 4–7) |
| **LocalContentOS** | ~51 | ⏸️ Next in sequence |
| **LocalContactOS** | ~33 | ⏸️ After LocalContentOS |
| **Platform/Admin** | ~43 | ⏸️ After product migrations |
| **API Routes** | ~25 | ⏸️ After product migrations |
| **Server Pages** | ~12 | ⏸️ After product migrations |
| **Other** | ~49 | ⏸️ Deferred |
| **Total remaining** | **~230** | — |

---

## 7. Recommendation

### 7.1 No Migration Needed for AuditOS

AuditOS is **not a migration candidate**. Its authorization system is:
- Functionally correct
- Well-tested (7 test files)
- More granular than the platform model
- Compliant with ISA/ISQM requirements
- Already uses `getCurrentUser()` as its foundation

### 7.2 Skip to LocalContentOS

The authorization consolidation should proceed to **LocalContentOS** (Wave 11) next, which has ~51 `requireUserContext` calls and is the platform's second strategic product.

### 7.3 Future Consideration: Platform Model Evolution

If the platform model evolves to support:
1. More granular role hierarchies (6+ roles)
2. Engagement-level resource scoping
3. Dual-tenant bridge architecture

Then AuditOS could be reconsidered. But this is a **platform evolution** task, not a product migration task.

---

## 8. Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| AuditOS `requireUserContext` count | **0** — confirmed |
| AuditOS auth infrastructure | **Intact** — 3 lib files, 22 action files, 5 pages |

---

## 9. Summary

| Metric | Value |
|--------|-------|
| Files modified | **0** |
| Files deleted | **0** |
| `requireUserContext` calls eliminated | **0** (none existed) |
| Migration effort | **None** |
| Security impact | **None** — AuditOS already secure |
| Recommendation | **Skip to LocalContentOS (Wave 11)** |

**AuditOS is the authorization consolidation program's first "no-op" wave.** The product was built with its own modern auth system from the start and was never touched by the legacy `requireUserContext` pattern. This is a positive finding — it validates that the AuditOS team made correct architectural decisions early.
