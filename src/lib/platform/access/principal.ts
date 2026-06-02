export type PrincipalRole = "admin" | "manager" | "operator" | "viewer";

export interface Principal {
  id: string;
  organizationId: string;
  role: PrincipalRole;
  userId: string;
  displayName?: string;
  email?: string;
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
    role: user.role as PrincipalRole,
    userId: user.id,
  };
}
