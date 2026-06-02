import type { Principal, PrincipalRole } from "./principal";

export type Permission =
  | "read"
  | "write"
  | "delete"
  | "admin"
  | "export"
  | "approve"
  | "review"
  | "manage_users"
  | "resource.view";

const ROLE_PERMISSIONS: Record<PrincipalRole, Permission[]> = {
  admin: ["read", "write", "delete", "admin", "export", "approve", "review", "manage_users", "resource.view"],
  manager: ["read", "write", "export", "approve", "review", "resource.view"],
  operator: ["read", "write", "resource.view"],
  viewer: ["read", "resource.view"],
};

export function can(
  principal: Principal,
  permission: Permission,
  _context?: { type: string; id: string; organizationId: string },
): { allowed: boolean; reason?: string } {
  const perms = ROLE_PERMISSIONS[principal.role];
  if (!perms) return { allowed: false, reason: "Unknown role" };
  return { allowed: perms.includes(permission) };
}
