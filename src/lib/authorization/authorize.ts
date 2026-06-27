/**
 * Unified authorization entry point.
 *
 * Single `authorize()` function that routes through:
 *   1. Tenant isolation check
 *   2. Role-based permission check
 *   3. ABAC condition evaluation (if configured)
 *
 * All authorization paths converge here.
 */

import type { UserRole } from "@prisma/client";

import type { CurrentUser, RequiredRole } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/auth";

import type {
  AuthorizeOptions,
  AuthorizationResult,
  Permission,
  PrincipalRole,
} from "./types";
import { ROLE_HIERARCHY, ROLE_PERMISSIONS, principalFromUser, normalizeRole } from "./types";
import { checkTenantAccess } from "./tenant-guard";
import { evaluateAbac } from "./abac-bridge";

/**
 * Single entry point for all authorization checks across the platform.
 *
 * Usage:
 * ```ts
 * const result = await authorize({
 *   user: currentUser,
 *   resource: { type: "engagement", id: engagementId },
 *   action: "approve",
 * });
 * if (!result.allowed) throw new Error(result.reason);
 * ```
 */
export async function authorize(options: AuthorizeOptions): Promise<AuthorizationResult> {
  const { user, resource, action, context } = options;

  // 1. Tenant isolation check
  if (!context?.bypassTenantCheck) {
    const tenantOk = await checkTenantAccess(user, resource, {
      tenantId: resource.tenantId,
    });
    if (!tenantOk.allowed) {
      return {
        allowed: false,
        reason: tenantOk.reason ?? "Tenant access denied",
      };
    }
  }

  // 2. Resolve principal & permissions
  const principal = principalFromUser(user);
  const principalRole = normalizeRole(user.role);

  const requiredPerm = actionToPermission(action);
  const rolePerms = ROLE_PERMISSIONS[principalRole];

  if (!rolePerms?.includes(requiredPerm)) {
    return {
      allowed: false,
      reason: `Insufficient permissions: '${principalRole}' role cannot perform '${action}' on '${resource.type}'`,
      principal,
    };
  }

  // 3. Overridden required role check (used for fine-grained actions)
  if (context?.requiredRole) {
    const userRoleUpper = user.role.toUpperCase() as UserRole;
    if (!hasRequiredRole(user, context.requiredRole as RequiredRole)) {
      return {
        allowed: false,
        reason: `Requires '${context.requiredRole}' role for '${action}'`,
        principal,
      };
    }
  }

  // 4. ABAC condition evaluation (if configured for this resource+action)
  if (context?.attributes) {
    const abacResult = await evaluateAbac({
      principal,
      resourceType: resource.type,
      action,
      attributes: context.attributes,
    });
    if (!abacResult.allowed) {
      return {
        allowed: false,
        reason: abacResult.reason ?? "ABAC policy denied access",
        principal,
      };
    }
  }

  return { allowed: true, principal };
}

/**
 * Check if a principal has direct permission on an action.
 * Inline alternative to the full authorize() flow.
 */
export function hasPermission(
  role: PrincipalRole,
  permission: Permission,
): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Check if a user has sufficient role hierarchy level.
 */
export function hasSufficientRoleLevel(
  userRole: string,
  requiredRole: string,
): boolean {
  const userLevel = ROLE_HIERARCHY[normalizeRole(userRole)];
  const requiredLevel = ROLE_HIERARCHY[normalizeRole(requiredRole)];
  if (userLevel === undefined || requiredLevel === undefined) return false;
  return userLevel >= requiredLevel;
}

// ─── Internal Helpers ───

function actionToPermission(action: string): Permission {
  switch (action) {
    case "read":
    case "create":
    case "update":
    case "delete":
    case "admin":
    case "approve":
    case "reject":
    case "export":
    case "review":
    case "manage_users":
      return action as Permission;
    default:
      return "resource.view";
  }
}
