import "server-only";

import { PrismaAuditLedger } from "@/core/audit/audit-ledger-prisma";
import {
  getCurrentUser,
  requireUserContext,
  type CurrentUser,
  type RequiredRole,
} from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { AuditEngine } from "@/lib/core/audit/engine";
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

async function logAccessDenialToPlatform(
  user: Pick<CurrentUser, "id" | "organizationId" | "role">,
  resource: AccessResource,
  action: AccessAction,
  reason: string,
  resourceId?: string,
): Promise<void> {
  try {
    await writePlatformAuditLog({
      productKey: "platform",
      sourceSystem: "core_access",
      actorId: user.id,
      actorType: "user",
      action: "auth.access.denied",
      targetType: resource,
      targetId: resourceId ?? resource,
      severity: "warning",
      status: "denied",
      metadata: {
        accessAction: action,
        role: user.role,
        organizationId: user.organizationId,
        reason,
      },
    });
  } catch {
    // Fail-soft: denial audit must not mask the authorization error.
  }
}

function denyAccess(
  user: Pick<CurrentUser, "id" | "organizationId" | "role">,
  resource: AccessResource,
  action: AccessAction,
  reason: string,
  resourceId?: string,
): never {
  void logAccessDenialToPlatform(user, resource, action, reason, resourceId);
  throw new Error(reason);
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
  resourceSensitivity?: string;
  abacAttributes?: Record<string, string>;
  crossTenantAttempt?: boolean;
};

async function finalizeAccessGrant(
  user: Pick<CurrentUser, "id" | "organizationId" | "role">,
  request: AccessRequest,
  result: AccessResult,
  options?: ServerActionAccessOptions,
): Promise<void> {
  const gateOptions = {
    resourceSensitivity: options?.resourceSensitivity,
    abacAttributes: {
      ...(options?.abacAttributes ?? {}),
      ...(options?.crossTenantAttempt
        ? { crossTenantAttempt: "true" }
        : {}),
    },
  };

  const { getAbacEnforceDenialReason } = await import("./abac-gate");
  const enforceReason = await getAbacEnforceDenialReason(request, gateOptions);
  if (enforceReason) {
    await AuditEngine.write({
      productKey: "platform",
      sourceSystem: "abac_enforce",
      platformOrganizationId: request.organizationId,
      actorId: request.userId,
      action: "auth.abac.enforced.denied",
      targetType: request.resource,
      targetId: request.resourceId ?? request.resource,
      severity: "warning",
      status: "denied",
      metadata: { reason: enforceReason, accessAction: request.action },
    }).catch(() => {});
    denyAccess(
      user,
      request.resource,
      request.action,
      enforceReason,
      request.resourceId,
    );
  }

  const { runAbacShadowEvaluation } = await import("./abac-shadow");
  await runAbacShadowEvaluation(request, result, {
    ...gateOptions,
    crossTenantAttempt: options?.crossTenantAttempt,
  });
}

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
      denyAccess(
        user,
        resource,
        action,
        result.reason ?? "Access denied",
        options?.resourceId,
      );
    }
    const adminRequest: AccessRequest = {
      userId: user.id,
      organizationId: user.organizationId,
      resource,
      action,
      resourceId: options?.resourceId,
      role: user.role,
      requiredRole: minRole,
    };
    await finalizeAccessGrant(user, adminRequest, result, options);
    return user;
  }

  if (targetOrgId !== user.organizationId && user.role !== "ADMIN") {
    denyAccess(
      user,
      resource,
      action,
      "Access denied: organization mismatch",
      options?.resourceId,
    );
  }

  const crossTenantAttempt =
    options?.crossTenantAttempt ??
    (targetOrgId !== user.organizationId && user.role === "ADMIN");

  const accessRequest: AccessRequest = {
    userId: user.id,
    organizationId: targetOrgId,
    resource,
    action,
    resourceId: options?.resourceId,
    role: user.role,
    requiredRole: minRole,
  };

  const result = await checkAccess(accessRequest);

  if (result.decision !== "granted") {
    denyAccess(
      user,
      resource,
      action,
      result.reason ?? "Access denied",
      options?.resourceId,
    );
  }

  await finalizeAccessGrant(user, accessRequest, result, {
    ...options,
    crossTenantAttempt,
  });

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
