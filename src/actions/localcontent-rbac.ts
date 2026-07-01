// ─── LocalContentOS RBAC Guards ───
// Bridges the RB-02 Authorization Engine into LCOS server actions.
// Each guard:
//   1. Calls requireUserContext() to get authenticated user + org + role
//   2. Calls AuthorizationEngine to evaluate the permission
//   3. Throws "Access denied" if the role lacks the required permission
//
// Pattern: action → AuthorizationEngine.evaluate() → ALLOW/DENY
//
// These guards sit ABOVE the tenant isolation guards (localcontent-guards.ts).
// Tenant guards verify orgId; RBAC guards verify role permissions.
// Both are required for production enforcement.

import { requireUserContext } from "@/lib/auth";
import {
  AuthorizationEngine,
  Permission,
  PlatformRole,
  ResourceType,
  Decision,
  createStandardEngine,
} from "@/lib/authorization/engine";

// Singleton engine instance
let _engine: AuthorizationEngine | null = null;

function getEngine(): AuthorizationEngine {
  if (!_engine) {
    _engine = createStandardEngine();
  }
  return _engine;
}

/**
 * Require the current user to have a specific permission.
 * This is the primary RBAC guard for LCOS actions.
 *
 * @param permission The required Permission (from RB-02 registry)
 * @param resourceType The resource type being accessed
 * @param resourceId Optional specific resource ID for policy evaluation
 */
export async function requirePermission(
  permission: Permission,
  resourceType: ResourceType,
  resourceId?: string,
): Promise<void> {
  const user = await requireUserContext();

  const engine = getEngine();
  const result = await engine.evaluate({
    user: {
      id: user.id,
      organizationId: user.organizationId,
      roles: user.roles ?? [user.role as PlatformRole],
    },
    action: `${resourceType}.${permissionToAction(permission)}`,
    resource: {
      type: resourceType,
      id: resourceId ?? "unknown",
      organizationId: user.organizationId,
    },
    context: {
      timestamp: new Date(),
    },
  });

  if (result.decision === Decision.DENY || result.decision === Decision.READ_ONLY) {
    throw new Error(`Access denied: insufficient permissions for ${permission}`);
  }
}

/**
 * Require the current user to have at least one of the specified permissions.
 * Used when an action can be performed by multiple role levels.
 */
export async function requireAnyPermission(
  permissions: Permission[],
  resourceType: ResourceType,
  resourceId?: string,
): Promise<void> {
  const user = await requireUserContext();

  for (const permission of permissions) {
    const engine = getEngine();
    const result = await engine.evaluate({
      user: {
        id: user.id,
        organizationId: user.organizationId,
        roles: user.roles ?? [user.role as PlatformRole],
      },
      action: `${resourceType}.${permissionToAction(permission)}`,
      resource: {
        type: resourceType,
        id: resourceId ?? "unknown",
        organizationId: user.organizationId,
      },
      context: {
        timestamp: new Date(),
      },
    });

    if (result.decision === Decision.ALLOW || result.decision === Decision.REQUIRE_APPROVAL) {
      return; // at least one permission allows
    }
  }

  throw new Error("Access denied: insufficient permissions");
}

/**
 * Check if the current user has a specific role.
 * Used for ADMIN-only operations like project deletion.
 */
export async function requireRole(role: PlatformRole): Promise<void> {
  const user = await requireUserContext();
  const userRoles: PlatformRole[] = user.roles ?? [user.role as PlatformRole];

  if (!userRoles.includes(role)) {
    throw new Error(`Access denied: ${role} role required`);
  }
}

/**
 * Require the current user to have at least the specified minimum role level.
 * Role hierarchy (from lowest to highest):
 *   INTEGRATION_ACCOUNT < READ_ONLY < EXTERNAL_AUDITOR < ANALYST < REVIEWER < BUSINESS_MANAGER < ORG_ADMIN
 */
export async function requireMinRole(minRole: PlatformRole): Promise<void> {
  const user = await requireUserContext();
  const userRoles: PlatformRole[] = user.roles ?? [user.role as PlatformRole];

  const roleHierarchy: PlatformRole[] = [
    PlatformRole.INTEGRATION_ACCOUNT,
    PlatformRole.READ_ONLY,
    PlatformRole.EXTERNAL_AUDITOR,
    PlatformRole.ANALYST,
    PlatformRole.REVIEWER,
    PlatformRole.BUSINESS_MANAGER,
    PlatformRole.ORG_ADMIN,
  ];

  const minLevel = roleHierarchy.indexOf(minRole);
  const maxUserLevel = Math.max(
    ...userRoles.map((r) => roleHierarchy.indexOf(r)),
  );

  if (maxUserLevel < minLevel) {
    throw new Error(
      `Access denied: minimum role ${minRole} required (current: ${userRoles.join(", ")})`,
    );
  }
}

/**
 * Map a Permission to its primary action string for the Authorization Engine.
 */
function permissionToAction(permission: Permission): string {
  const actionMap: Record<string, string> = {
    [Permission.PROJECT_MANAGEMENT]: "create",
    [Permission.PROJECT_DELETION]: "delete",
    [Permission.WORKBOOK_MANAGEMENT]: "create",
    [Permission.WORKBOOK_EXPORT]: "export",
    [Permission.SUPPLIER_MANAGEMENT]: "create",
    [Permission.SPEND_DATA_ENTRY]: "create",
    [Permission.EVIDENCE_UPLOAD]: "upload",
    [Permission.EVIDENCE_READ]: "read",
    [Permission.EVIDENCE_DELETION]: "delete",
    [Permission.FINDING_MANAGEMENT]: "create",
    [Permission.FINDING_CLOSE]: "close",
    [Permission.REVIEW_MANAGEMENT]: "create",
    [Permission.REVIEW_APPROVAL]: "approve",
    [Permission.REVIEW_OVERRIDE]: "override",
    [Permission.AI_REVIEW]: "read",
    [Permission.CLASSIFICATION_MANAGEMENT]: "create",
    [Permission.IMPORT]: "create",
    [Permission.EXPORT_MANAGEMENT]: "create",
    [Permission.REPORT_MANAGEMENT]: "create",
    [Permission.AUDIT_LOG_ACCESS]: "read",
    [Permission.SETTINGS_MANAGEMENT]: "read",
    [Permission.ORGANIZATION_MEMBERSHIP]: "read",
    [Permission.AI_CONFIGURATION]: "read",
  };
  return actionMap[permission] ?? "read";
}

export {
  Permission,
  PlatformRole,
  ResourceType,
} from "@/lib/authorization/engine";
