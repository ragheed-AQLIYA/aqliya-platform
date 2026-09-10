/**
 * Unified tenant isolation check.
 *
 * Tenant ADMIN is scoped to user.organizationId.
 * Only isPlatformAdmin() may access another tenant.
 */

import type { CurrentUser } from "./types";
import { isPlatformAdmin } from "./platform-admin";

export interface TenantAccessRequest {
  /** Resource type being accessed */
  resourceType: string;
  /** Resource tenant context */
  resourceId?: string;
  /** Explicit tenant override */
  tenantId?: string;
}

export interface TenantAccessResult {
  allowed: boolean;
  reason?: string;
  resolvedTenantId?: string;
}

/**
 * Check whether the current user has tenant-level access to the resource.
 *
 * A user's organizationId must match the resource's owning organization
 * unless the user is an explicit platform admin.
 */
export async function checkTenantAccess(
  user: CurrentUser,
  resource: { type: string; id?: string; tenantId?: string },
  options?: { tenantId?: string },
): Promise<TenantAccessResult> {
  const inferredFromResource =
    !options?.tenantId &&
    !resource.tenantId &&
    resource.id &&
    (resource.type === "organization" || resource.type === "settings")
      ? resource.id
      : undefined;

  const targetTenantId =
    options?.tenantId ?? resource.tenantId ?? inferredFromResource ?? user.organizationId;

  if (isPlatformAdmin(user)) {
    return { allowed: true, resolvedTenantId: targetTenantId };
  }

  const userOrgId = user.organizationId;
  if (userOrgId !== targetTenantId) {
    return {
      allowed: false,
      reason: `Tenant access denied: user organization (${userOrgId}) does not match resource organization (${targetTenantId})`,
      resolvedTenantId: targetTenantId,
    };
  }

  return { allowed: true, resolvedTenantId: targetTenantId };
}

/**
 * Assert tenant access, throwing on failure.
 * Convenience wrapper for server actions.
 */
export async function assertTenantAccess(
  user: CurrentUser,
  resource: { type: string; id?: string; tenantId?: string },
  options?: { tenantId?: string },
): Promise<string> {
  const result = await checkTenantAccess(user, resource, options);
  if (!result.allowed) {
    throw new Error(result.reason ?? "Tenant access denied");
  }
  return result.resolvedTenantId!;
}

/**
 * Resolve the caller's tenant id. Client-supplied ids are ignored unless
 * they match the session (or the caller is a platform admin).
 */
export function resolveCallerTenantId(
  user: CurrentUser,
  requested?: string | null,
): string {
  const requestedId = requested?.trim();
  if (!requestedId) return user.organizationId;
  if (requestedId === user.organizationId) return user.organizationId;
  if (isPlatformAdmin(user)) return requestedId;
  throw new Error("Access denied: organization scope mismatch");
}
