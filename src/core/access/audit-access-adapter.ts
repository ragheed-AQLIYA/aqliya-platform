import "server-only";

import type { UserRole } from "@prisma/client";
import type { AuditActor } from "@/lib/audit/actor-context";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { checkAccess } from "./server-action-guard";
import type { AccessAction, AccessResource } from "./types";

/** Maps AuditUser.role slugs to platform UserRole for CoreAccessControl. */
export function mapAuditRoleToUserRole(actorRole: string): UserRole {
  const lower = actorRole.toLowerCase();
  if (lower === "admin") return "ADMIN";
  if (["operator", "manager", "partner", "reviewer"].includes(lower)) {
    return "OPERATOR";
  }
  return "VIEWER";
}

async function logAuditAccessDenial(
  actor: AuditActor,
  resource: AccessResource,
  action: AccessAction,
  reason: string,
  resourceId?: string,
): Promise<void> {
  try {
    await writePlatformAuditLog({
      productKey: "audit",
      sourceSystem: "core_access",
      actorId: actor.actorId,
      actorType: "user",
      action: "auth.access.denied",
      targetType: resource,
      targetId: resourceId ?? resource,
      severity: "warning",
      status: "denied",
      metadata: {
        accessAction: action,
        auditRole: actor.actorRole,
        organizationId: actor.organizationId,
        reason,
      },
    });
  } catch {
    // Fail-soft
  }
}

/**
 * Core access check for AuditOS actors — preserves AuditUser roles via adapter.
 * Tenant scoping remains the caller's responsibility (engagement org match).
 */
export async function requireAuditCoreAccess(
  actor: AuditActor,
  resource: AccessResource,
  action: AccessAction,
  resourceId?: string,
): Promise<void> {
  const role = mapAuditRoleToUserRole(actor.actorRole);
  const result = await checkAccess({
    userId: actor.actorId,
    organizationId: actor.organizationId,
    resource,
    action,
    resourceId,
    role,
  });

  if (result.decision !== "granted") {
    const reason = result.reason ?? "Access denied";
    await logAuditAccessDenial(actor, resource, action, reason, resourceId);
    throw new Error(reason);
  }
}
