/**
 * Access policy facade — bridges Tier 1 @/core/access with Intelligence Core namespace.
 */
export type {
  AccessAction,
  AccessRequest,
  AccessResource,
  AccessResult,
} from "@/core/access";

export {
  CoreAccessControl,
  assertAuthenticatedForAction,
  checkAccess,
  isAuthorized,
  mapAuditRoleToUserRole,
  requireAccess,
  requireAuditCoreAccess,
  requireMutationAccess,
  requireReadAccess,
  requireServerActionAccess,
  requireServerActionRead,
} from "@/core/access";

export type { ServerActionAccessOptions } from "@/core/access/server-action-guard";
