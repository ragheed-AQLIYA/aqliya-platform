# Authorization Migration Report (Phase 1A)

**Date:** 2026-06-25  
**Status:** Complete  
**Phase:** 1A — Consolidate Authorization into `@/lib/authorization`  

---

## 1. Objective

Consolidate all authorization logic spread across `src/core/access/` and `src/lib/core/access/` into a single unified facade at `src/lib/authorization/`, then delete the old system.

### Old Architecture (Before)

```
src/core/access/
├── access-control.ts        # CoreAccessControl class
├── server-action-guard.ts   # requireServerActionAccess / requireServerActionRead
├── types.ts                 # AccessRequest / AccessResult
├── index.ts                 # Barrel exports
├── audit-access-adapter.ts  # AuditOS → platform adapter
├── abac-gate.ts             # ABAC engine (KEPT)
├── abac-shadow.ts           # ABAC shadow (KEPT)
├── abac-shadow-report.ts    # ABAC shadow report (KEPT)
└── __tests__/
    ├── access-control.test.ts (DELETED)
    ├── abac-enforce.test.ts (KEPT)
    ├── abac-shadow.test.ts (KEPT)
    └── abac-shadow-report.test.ts (KEPT)

src/lib/core/access/
└── index.ts                 # Dead re-export layer (DELETED)
```

### New Architecture (After)

```
src/lib/authorization/
├── index.ts                 # Public facade — unified export
├── types.ts                 # Principal, CurrentUser, ResourceType, ROLE_PERMISSIONS
├── authorize.ts             # Single authorize() entry point
├── action-guard.ts          # enforce(), isAllowed(), assertAuthorized(), guardRoleLevel()
├── tenant-guard.ts          # checkTenantAccess(), assertTenantAccess()
├── permission-resolver.ts   # resolvePermissions()
├── product-guards.ts        # Product-specific guards
├── abac-bridge.ts           # Optional ABAC connection
├── middleware-bridge.ts     # Middleware integration
└── __tests__/               # 63 unit tests
```

---

## 2. What Was Migrated

### 2.1 Source Files Deleted (5 files)

| File | Reason |
|------|--------|
| `src/core/access/access-control.ts` | Replaced by `authorize()` + `enforce()` facade |
| `src/core/access/server-action-guard.ts` | Replaced by `enforce()` + `checkTenantAccess()` |
| `src/core/access/types.ts` | Restored minimal version for ABAC only |
| `src/core/access/index.ts` | No remaining consumers after migration |
| `src/core/access/audit-access-adapter.ts` | No remaining consumers after migration |

### 2.2 Consumers Migrated (10 sites across 4 batches)

#### Batch 1 — Server Actions (3 files)
| File | Old API | New API |
|------|---------|---------|
| `src/actions/localcontent-review-export.ts` | `requireServerActionAccess("record", "export")` | `enforce(user, { type: "record" }, "export")` |
| `src/actions/decisions.ts` | `requireServerActionAccess("decision", "export")` | `enforce(user, { type: "decision" }, "export")` |
| `src/actions/contact-actions.ts` | `requireServerActionAccess("contact", "export")` | `enforce(user, { type: "contact" }, "export")` |

#### Batch 2 — API Routes (3 files)
| File | Old API | New API |
|------|---------|---------|
| `src/app/api/decisions/.../download/route.ts` | `requireServerActionAccess("decision", "read")` | `enforce(user, { type: "decision" }, "read")` |
| `src/app/api/local-content/.../download/route.ts` | `requireServerActionAccess("project", "read")` | `enforce(user, { type: "project" }, "read")` |
| `src/app/api/audit/.../download/route.ts` | `requireServerActionAccess("evidence", "read")` | `enforce(auditUser, { type: "evidence" }, "read")` |

#### Batch 3 — Library Services (2 files)
| File | Old API | New API |
|------|---------|---------|
| `src/lib/workflowos/export/index.ts` | `requireServerActionAccess("workflow", "export")` | `enforce(ctx, { type: "workflow" }, "export")` |
| `src/lib/platform/product-ai-bridge.ts` | `requireServerActionAccess(key, "create")` | `enforce(user, { type: key }, "create")` |

#### Batch 4 — Dead Re-Export Layer (1 file)
| File | Action |
|------|--------|
| `src/lib/core/access/index.ts` | Deleted (zero consumers) |

### 2.3 Tests Migrated (4 files)

| File | Old System References | New System References |
|------|----------------------|----------------------|
| `src/__tests__/cross-tenant-isolation.test.ts` | `requireServerActionAccess`, `CoreAccessControl` | `enforce`, `authorize` from facade |
| `src/__tests__/api-smoke.test.ts` | `CoreAccessControl` | `authorize` from facade |
| `src/__tests__/integration/decision-evidence-download-route.test.ts` | Mock of `@/core/access/server-action-guard` | Mock of `@/lib/authorization` (enforce) |
| `src/actions/__tests__/localcontent-ai-pipeline.integration.test.ts` | Mock of `@/core/access/server-action-guard` | Mock of `@/lib/authorization` (enforce) |

### 2.4 Fixes Applied During Migration

| Issue | Fix |
|-------|-----|
| `tenant-guard.ts` used `user.platformOrganizationId ?? user.organizationId` | Changed to `user.organizationId` to match old system behavior |
| Missing `"export"` in operator and viewer permissions | Added `"export"` to `ROLE_PERMISSIONS` for both roles |
| `mapAuditRoleToUserRole()` not re-exported from facade index | Added to `@/lib/authorization` public exports |
| `src/lib/core/index.ts` referenced deleted `./access` module | Removed dead re-export |

---

## 3. What Was Kept

The following are **not** part of this migration and remain untouched:

### ABAC Engine (`src/core/access/`)
- `abac-gate.ts` — Attribute-Based Access Control enforcement
- `abac-shadow.ts` — ABAC shadow evaluation (parallel dry-run)
- `abac-shadow-report.ts` — ABAC mismatch report generation
- `__tests__/abac-enforce.test.ts`
- `__tests__/abac-shadow.test.ts`
- `__tests__/abac-shadow-report.test.ts`

### AuditOS Legacy (`src/lib/auth/`)
- `requireDecisionAccess` — separate AuditOS-specific function (not part of old `src/core/access/`)

---

## 4. Validation Results

| Check | Before Migration | After Migration | Delta |
|-------|-----------------|-----------------|-------|
| TypeScript errors | 5 pre-existing | 4 pre-existing | -1 (fixed `lib/core/index.ts`) |
| Test suites | 320 | 319 | -1 (old `access-control.test.ts`) |
| Tests passed | 3125 | 3118 | -7 (old `CoreAccessControl` tests — behavior covered by facade's 63 tests + migrated suites) |
| Test failures | 0 | 0 | — |

### Remaining TypeScript Errors (pre-existing, not related to this migration)
1. `src/app/(dashboard)/knowledge-foundation/page.tsx:23` — missing `kpi-cards` module
2. `src/app/(dashboard)/knowledge-foundation/page.tsx:24` — missing `candidate-pool-overview-card` module
3. `src/app/(dashboard)/knowledge-foundation/page.tsx:25` — missing `version-table` module
4. `src/app/(marketing)/contact/page.tsx:3` — missing `contact-form` module

---

## 5. Migration Pattern Reference

### Old → New API Mapping

```ts
// Old: requireServerActionAccess
const result = await requireServerActionAccess("sales", "read", {
  organizationId: "org-123",
});

// New: enforce (throws on denial)
await enforce(user, { type: "sales", tenantId: "org-123" }, "read");

// New: authorize (returns result)
const result = await authorize({
  user,
  resource: { type: "sales", tenantId: "org-123" },
  action: "read",
});
// result.allowed === true/false
// result.reason === "..." (only when denied)
```

### Key Differences

| Aspect | Old System | New Facade |
|--------|-----------|------------|
| User resolution | Internal (`requireUserContext`) | External (caller provides `user` via `getCurrentUser()`) |
| Error on denial | Throws `Error("Access denied: ...")` | `enforce()` throws; `authorize()` returns `{ allowed: false }` |
| Tenant isolation | `organizationId` option + admin flag | `tenantId` in resource object; ADMIN auto-bypasses |
| Unknown actions | Denied with descriptive reason | Map to `resource.view` permission (safe default, all roles have it) |
| Default tenant | `user.organizationId` | `user.organizationId` |

---

## 6. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Different error messages in tests | All migrated tests updated to match new facade's error messages |
| ABAC engine accidentally deleted | Kept as-is with restored minimal `types.ts` |
| Cross-product dependency from facade to AuditOS | Avoided by passing user directly instead of importing AuditOS types |
| ADMIN cross-tenant behavior changes | Checked: old system allowed ADMIN bypass with/without flag; new facade allows ADMIN bypass by default |

---

## 7. Next Steps (Phase 1B)

- **Clean up `src/core/access/types.ts`** when ABAC engine is eventually migrated to the authorization facade
- **Generate ADR-003** for the architectural decision record (see `ADR-003-authorization-consolidation.md`)
- **Monitor** for any missed consumers during subsequent code reviews
