// ─── LocalContentOS RBAC Guards ───
// Bridges the RB-02 Authorization Engine into LCOS server actions.
// Each guard:
//   1. Calls requireUserContext() to get authenticated user + org + role
//   2. Calls AuthorizationEngine.authorize() to evaluate the permission
//   3. Throws "Access denied" if the role lacks the required permission

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

async function getEngine(): Promise<AuthorizationEngine> {
  if (!_engine) {
    const { engine } = await createStandardEngine();
    _engine = engine;
  }
  return _engine;
}

/**
 * Require the current user to have a specific permission.
 */
export async function requirePermission(
  permission: Permission,
  resourceType: ResourceType,
  resourceId?: string,
): Promise<void> {
  const user = await requireUserContext();

  const engine = await getEngine();
  const result = await engine.authorize({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    resourceType,
    resourceId: resourceId ?? undefined,
    action: `${resourceType}.${permissionToAction(permission)}`,
    context: { timestamp: new Date().toISOString() },
  });

  if (result.decision === Decision.DENY || result.decision === Decision.READ_ONLY) {
    throw new Error(`Access denied: insufficient permissions for ${permission}`);
  }
}

/**
 * Require the current user to have at least one of the specified permissions.
 */
export async function requireAnyPermission(
  permissions: Permission[],
  resourceType: ResourceType,
  resourceId?: string,
): Promise<void> {
  const user = await requireUserContext();

  for (const permission of permissions) {
    const engine = await getEngine();
    const result = await engine.authorize({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      resourceType,
      resourceId: resourceId ?? undefined,
      action: `${resourceType}.${permissionToAction(permission)}`,
      context: { timestamp: new Date().toISOString() },
    });

    if (result.decision === Decision.ALLOW || result.decision === Decision.REQUIRE_APPROVAL) {
      return;
    }
  }

  throw new Error("Access denied: insufficient permissions");
}

/**
 * Check if the current user has a specific role.
 * Compares as strings since UserRole (Prisma) and PlatformRole (engine) use different enums.
 */
export async function requireRole(role: PlatformRole): Promise<void> {
  const user = await requireUserContext();
  const targetRole = String(role);
  const userRole = String(user.role);
  if (userRole !== targetRole) {
    throw new Error(`Access denied: ${targetRole} role required (user has ${userRole})`);
  }
}

/**
 * Require the current user to have at least the specified minimum role level.
 */
export async function requireMinRole(minRole: PlatformRole): Promise<void> {
  const user = await requireUserContext();

  const roleHierarchy: string[] = [
    String(PlatformRole.INTEGRATION_ACCOUNT),
    String(PlatformRole.READ_ONLY),
    String(PlatformRole.EXTERNAL_AUDITOR),
    String(PlatformRole.ANALYST),
    String(PlatformRole.REVIEWER),
    String(PlatformRole.BUSINESS_MANAGER),
    String(PlatformRole.ORG_ADMIN),
  ];

  const minLevel = roleHierarchy.indexOf(String(minRole));
  const userLevel = roleHierarchy.indexOf(String(user.role));

  if (userLevel < minLevel) {
    throw new Error(
      `Access denied: minimum role ${String(minRole)} required (current: ${String(user.role)})`,
    );
  }
}

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
