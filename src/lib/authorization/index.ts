/**
 * Authorization facade — public API.
 *
 * All authorization in the platform converges through this module.
 *
 * Usage:
 * ```ts
 * import { authorize, enforce } from "@/lib/authorization";
 * ```
 *
 * Deprecation notice:
 * - Use `getCurrentUser()` + `enforce()` from @/lib/auth
 * - Use `enforce()` with tenant tenantId for organization-scoped access
 */

// Core authorization entry point
export { authorize } from "./authorize";

// Types
export type {
  Principal,
  PrincipalRole,
  CurrentUser,
  ResourceType,
  AccessAction,
  Permission,
  AuthorizeOptions,
  AuthorizationResult,
  TenantContext,
} from "./types";

export {
  normalizeRole,
  principalFromUser,
  mapAuditRoleToUserRole,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from "./types";

// Tenant isolation
export { checkTenantAccess, assertTenantAccess, resolveCallerTenantId } from "./tenant-guard";
export type { TenantAccessRequest, TenantAccessResult } from "./tenant-guard";

export { isPlatformAdmin, assertPlatformAdmin } from "./platform-admin";

// Permission resolution
export {
  resolvePermissions,
} from "./permission-resolver";

// Action guard
export { enforce, isAllowed } from "./action-guard";
