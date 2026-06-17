import "server-only";

import { PrismaAuditLedger } from "@/core/audit/audit-ledger-prisma";
import {
  getCurrentUser,
  requireUserContext,
  type CurrentUser,
  type RequiredRole,
} from "@/lib/auth";
import { CoreAccessControl } from "./access-control";
import type {
  AccessAction,
  AccessRequest,
  AccessResource,
  AccessResult,
} from "./types";

let accessControl: CoreAccessControl | null = null;

function getAccessControl(): CoreAccessControl {
  if (!accessControl) {
    accessControl = new CoreAccessControl(new PrismaAuditLedger());
  }
  return accessControl;
}

export async function checkAccess(request: AccessRequest): Promise<AccessResult> {
  return getAccessControl().check(request);
}

export async function isAuthorized(request: AccessRequest): Promise<boolean> {
  const result = await checkAccess(request);
  return result.decision === "granted";
}

const ACTION_MIN_ROLE: Partial<Record<AccessAction, RequiredRole>> = {
  admin: "ADMIN",
  delete: "OPERATOR",
  approve: "ADMIN",
  reject: "ADMIN",
  create: "OPERATOR",
  update: "OPERATOR",
  export: "VIEWER",
  read: "VIEWER",
};

export type ServerActionAccessOptions = {
  organizationId?: string;
  resourceId?: string;
  role?: RequiredRole;
  /** Platform ADMIN may act on organization records outside their home org */
  allowPlatformAdminCrossTenant?: boolean;
};

/**
 * Unified server-action gate: session role + CoreAccessControl RBAC/tenant check.
 */
export async function requireServerActionAccess(
  resource: AccessResource,
  action: AccessAction,
  options?: ServerActionAccessOptions,
): Promise<CurrentUser> {
  const minRole = options?.role ?? ACTION_MIN_ROLE[action] ?? "OPERATOR";
  const user = await requireUserContext(minRole);
  const targetOrgId = options?.organizationId ?? user.organizationId;

  if (
    user.role === "ADMIN" &&
    resource === "organization" &&
    options?.allowPlatformAdminCrossTenant
  ) {
    const result = await checkAccess({
      userId: user.id,
      organizationId: user.organizationId,
      resource,
      action,
      resourceId: options?.resourceId,
      role: user.role,
      requiredRole: minRole,
    });
    if (result.decision !== "granted") {
      throw new Error(result.reason ?? "Access denied");
    }
    return user;
  }

  if (targetOrgId !== user.organizationId && user.role !== "ADMIN") {
    throw new Error("Access denied: organization mismatch");
  }

  const result = await checkAccess({
    userId: user.id,
    organizationId: targetOrgId,
    resource,
    action,
    resourceId: options?.resourceId,
    role: user.role,
    requiredRole: minRole,
  });

  if (result.decision !== "granted") {
    throw new Error(result.reason ?? "Access denied");
  }

  return user;
}

/** Read-only actions: authenticate + core read permission without throwing on missing session in callers that catch. */
export async function requireServerActionRead(
  resource: AccessResource,
  options?: ServerActionAccessOptions,
): Promise<CurrentUser> {
  return requireServerActionAccess(resource, "read", {
    ...(options ?? {}),
    role: options?.role ?? "VIEWER",
  });
}

export async function assertAuthenticatedForAction(): Promise<CurrentUser> {
  return getCurrentUser();
}

export async function requireReadAccess(
  resource: AccessResource,
  options?: Omit<ServerActionAccessOptions, "role">,
): Promise<CurrentUser> {
  return requireServerActionRead(resource, options);
}

export async function requireMutationAccess(
  resource: AccessResource,
  action: AccessAction,
  options?: ServerActionAccessOptions & { minRole?: RequiredRole },
): Promise<CurrentUser> {
  const { minRole, ...rest } = options ?? {};
  return requireServerActionAccess(resource, action, {
    ...rest,
    role: minRole ?? rest.role,
  });
}
