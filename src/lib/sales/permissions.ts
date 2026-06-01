// SalesOS — product-scoped RBAC (mirrors LocalContentOS permission pattern)

import type { UserRole } from "@prisma/client";

export type SalesPermission =
  | "salesos:read"
  | "salesos:create"
  | "salesos:update";

export const SALESOS_PERMISSIONS: SalesPermission[] = [
  "salesos:read",
  "salesos:create",
  "salesos:update",
];

const ROLE_PERMISSIONS: Record<UserRole, SalesPermission[]> = {
  VIEWER: ["salesos:read"],
  OPERATOR: ["salesos:read", "salesos:create", "salesos:update"],
  ADMIN: ["salesos:read", "salesos:create", "salesos:update"],
};

export function hasSalesPermission(
  role: UserRole,
  permission: SalesPermission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function assertSalesPermission(
  role: UserRole,
  permission: SalesPermission,
): void {
  if (!hasSalesPermission(role, permission)) {
    throw new Error(`Access denied: missing permission ${permission}`);
  }
}

export function getSalesPermissionsForRole(role: UserRole) {
  return {
    canCreate: hasSalesPermission(role, "salesos:create"),
    canUpdate: hasSalesPermission(role, "salesos:update"),
    canReview: role === "ADMIN",
  };
}
