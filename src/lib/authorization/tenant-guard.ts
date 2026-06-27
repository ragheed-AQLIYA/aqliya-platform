/**
 * Unified tenant isolation check.
 *
 * Consolidates tenant resolution logic previously scattered across
 * product-specific guards. All products route through this single check
 * to ensure consistent tenant isolation.
 */

import type { CurrentUser } from "./types";

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
 * The fundamental rule: a user's organizationId must match the resource's
 * owning organization (unless the user is an admin with cross-tenant access).
 */
export async function checkTenantAccess(
  user: CurrentUser,
  resource: { type: string; id?: string; tenantId?: string },
  options?: { tenantId?: string },
): Promise<TenantAccessResult> {
  // Determine the target tenant
  const targetTenantId = options?.tenantId ?? resource.tenantId ?? user.organizationId;

  // Admin users have cross-tenant access for platform operations
  if (user.role === "ADMIN") {
    return { allowed: true, resolvedTenantId: targetTenantId };
  }

  // Standard tenant isolation: user must belong to the target organization.
  // We use organizationId (the user's home org) — platformOrganizationId
  // is a platform-level scoping field that should not influence tenant
  // isolation at the resource level.
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
