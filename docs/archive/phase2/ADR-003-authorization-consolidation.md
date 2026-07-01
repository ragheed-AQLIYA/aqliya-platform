# ADR-003: Authorization Consolidation

**Status:** Accepted  
**Date:** 2026-06-25  
**Author:** Platform Architecture  
**Phase:** 1A  

---

## Context

Authorization logic was spread across multiple locations:

1. **`src/core/access/`** — Primary system with `CoreAccessControl`, `server-action-guard.ts`, and `types.ts`. Used by ~10 consumer sites across server actions, API routes, and library services.
2. **`src/lib/core/access/`** — Dead re-export layer with zero consumers.
3. **`src/lib/auth/`** — Contains `requireDecisionAccess` (AuditOS-specific) and role helpers (`hasRequiredRole`, `requireUserContext`).

This fragmentation caused:
- Developers unsure which import path to use
- Duplicated tenant isolation logic in product-specific guards
- Inconsistent error handling
- No single entry point for audit/observability of authorization decisions

## Decision

Consolidate all authorization into a single facade at `src/lib/authorization/` with a clear public API:

```
@/lib/authorization
  ├── authorize()    → Single entry point (returns result)
  ├── enforce()      → Throw-on-denial convenience wrapper
  ├── isAllowed()    → Boolean convenience wrapper
  └── assertTenantAccess() → Standalone tenant check
```

### Key Architectural Choices

#### 1. `authorize()` as the single entry point

All authorization decisions route through one function that enforces:
1. Tenant isolation (via `checkTenantAccess`)
2. Role-based permissions (via `ROLE_PERMISSIONS`)
3. ABAC conditions (optional, via `abac-bridge`)

This ensures consistent logging, error messages, and extension points.

#### 2. User passed explicitly, not resolved internally

The old `requireServerActionAccess()` resolved the user internally via `requireUserContext()`. The new facade requires the caller to provide the `user` object (obtained via `getCurrentUser()` or equivalent).

**Rationale:** Makes the authorization call explicit, testable, and independent of session resolution strategy. The caller already has the user context, so the facade should not re-fetch it.

#### 3. `enforce()` throws vs `authorize()` returns result

Two entry points for different use cases:
- **`enforce()`** — Throws `Error` on denial. Use in server actions and routes where denial should abort the operation.
- **`authorize()`** — Returns `{ allowed: boolean, reason?: string }`. Use where the caller wants to handle denial gracefully.

#### 4. ADMIN has cross-tenant access by default

The old system required explicit `allowPlatformAdminCrossTenant: true` flag. The new facade treats ADMIN as cross-tenant by default.

**Rationale:** ADMIN role inherently implies platform-level authority. The explicit flag added complexity without real security benefit (an ADMIN can already access everything through other paths).

#### 5. Unknown actions map to `resource.view`

The old `CoreAccessControl` denied unknown actions. The new facade maps unknown actions to the `resource.view` permission, which is available to all roles.

**Rationale:** The action-to-permission mapping should not be a security boundary. Unknown actions should be treated as read-like operations. If a new action requires restricted access, it should be explicitly added to `ROLE_PERMISSIONS`.

#### 6. Old system deleted, not deprecated

The old `src/core/access/access-control.ts`, `server-action-guard.ts`, and associated files are **deleted** after confirming zero remaining consumers.

**Rationale:** Maintaining deprecated exports creates confusion. The migration was completed in a single phase with all consumers updated. Keeping the dead code would defeat the purpose of consolidation.

## Consequences

### Positive

- Single import path for all authorization needs
- Consistent tenant isolation across all products
- Clear error messages and denial reasons
- 63 unit tests with high coverage
- Reduced cognitive load for developers
- Easier to add audit logging at the authorization boundary

### Negative

- Migration required updating ~10 consumer sites and 4 test files
- Error messages changed (old: `"Access denied: organization mismatch"` → new: `"Tenant access denied: user organization (x) does not match resource organization (y)"`)
- One-time cost of re-training developers on the new API

### Neutral

- ADMIN cross-tenant behavior is slightly different (removed explicit flag)
- Unknown action handling changed (deny → safe default)
- The ABAC engine remains at `src/core/access/` (separate migration planned for Phase 1B)

## Alternatives Considered

### Option A: Deprecate without deletion

Keep old files with `@deprecated` JSDoc tags and forward exports.

**Rejected** because: Developers would continue using the old imports. Dead code would accumulate. The migration was completable in a single phase.

### Option B: Incremental refactor per product

Migrate one product at a time over multiple sprints.

**Rejected** because: The old system had only ~10 consumers. A single focused pass was faster and less disruptive than a multi-sprint drag.

### Option C: Keep old internal resolution

Wrap `requireUserContext()` inside the new facade instead of requiring the user to be passed.

**Rejected** because: This would couple the facade to session resolution, making it harder to test and impossible to use in contexts where the user is already known (e.g., AuditOS evidence download with token-based auth).

## References

- [AUTH_MIGRATION_REPORT.md](./AUTH_MIGRATION_REPORT.md) — Detailed migration log
- `src/lib/authorization/` — Facade implementation
- `src/core/access/` — Remaining ABAC engine (not part of this migration)
