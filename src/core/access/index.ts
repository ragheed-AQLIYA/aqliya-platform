export type { AccessAction, AccessRequest, AccessResource, AccessResult } from "./types";
export { CoreAccessControl } from "./access-control";
export {
  assertAuthenticatedForAction,
  checkAccess,
  isAuthorized,
  requireMutationAccess,
  requireReadAccess,
  requireServerActionAccess,
  requireServerActionRead,
  type ServerActionAccessOptions,
} from "./server-action-guard";
export type { RequiredRole } from "@/lib/auth";

import type { RequiredRole } from "@/lib/auth";
import type { AccessAction, AccessResource } from "./types";
import {
  requireServerActionAccess,
  type ServerActionAccessOptions,
} from "./server-action-guard";

export async function requireAccess(params: {
  resource: AccessResource;
  action: AccessAction;
  minRole?: RequiredRole;
  organizationId?: string;
  resourceId?: string;
}) {
  return requireServerActionAccess(params.resource, params.action, {
    role: params.minRole,
    organizationId: params.organizationId,
    resourceId: params.resourceId,
  });
}
