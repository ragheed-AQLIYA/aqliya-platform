export type PrincipalRole = "admin" | "manager" | "operator" | "viewer";

export interface Principal {
  id: string;
  organizationId: string;
  role: PrincipalRole;
  userId: string;
  displayName?: string;
  email?: string;
}

/** Maps session UserRole (ADMIN) and AuditUser slugs to download-gate PrincipalRole. */
export function normalizePrincipalRole(role: string): PrincipalRole {
  switch (role.toLowerCase()) {
    case "admin":
      return "admin";
    case "manager":
    case "partner":
      return "manager";
    case "operator":
    case "reviewer":
      return "operator";
    default:
      return "viewer";
  }
}

export function getPrincipalRole(principal: Principal): PrincipalRole {
  return principal.role;
}

export function isAdmin(principal: Principal): boolean {
  return principal.role === "admin";
}

export function principalFromCurrentUser(user: {
  id: string;
  organizationId: string;
  role: string;
}): Principal {
  return {
    id: user.id,
    organizationId: user.organizationId,
    role: normalizePrincipalRole(user.role),
    userId: user.id,
  };
}
