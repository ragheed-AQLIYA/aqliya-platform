// LocalContentOS Content Studio — governance permissions

import type { UserRole } from "@prisma/client";
import type { LocalContentPermission } from "./contracts";

const ROLE_PERMISSIONS: Record<UserRole, LocalContentPermission[]> = {
  VIEWER: ["localcontentos:read"],
  OPERATOR: [
    "localcontentos:read",
    "localcontentos:create",
    "localcontentos:update",
    "localcontentos:review",
  ],
  ADMIN: [
    "localcontentos:read",
    "localcontentos:create",
    "localcontentos:update",
    "localcontentos:review",
    "localcontentos:approve",
    "localcontentos:export",
  ],
};

export function hasLocalContentPermission(
  role: UserRole,
  permission: LocalContentPermission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function assertLocalContentPermission(
  role: UserRole,
  permission: LocalContentPermission,
): void {
  if (!hasLocalContentPermission(role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}
