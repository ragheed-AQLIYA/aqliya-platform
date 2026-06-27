/**
 * Authorization facade — public API.
 *
 * All authorization in the platform converges through this module.
 *
 * Usage:
 * ```ts
 * import { authorize } from "@/lib/authorization";
 * import { enforce } from "@/lib/authorization/action-guard";
 * ```
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
export { checkTenantAccess, assertTenantAccess } from "./tenant-guard";
export type { TenantAccessRequest, TenantAccessResult } from "./tenant-guard";

// Permission resolution
export {
  resolvePermissions,
} from "./permission-resolver";

// Action guard
export { enforce, isAllowed, assertAuthorized, guardRoleLevel } from "./action-guard";

// Product guards
export {
  guardEngagementAccess,
  guardProjectAccess,
  guardDealAccess,
  guardAccountAccess,
  guardRecordAccess,
  guardOrganizationAccess,
  guardWorkspaceAccess,
} from "./product-guards";
