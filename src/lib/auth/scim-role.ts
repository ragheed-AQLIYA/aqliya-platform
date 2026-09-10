/**
 * SCIM provisioned roles — tenant roles only.
 * ADMIN is denied unless SCIM_ALLOW_ADMIN_ROLE=true (out-of-band operator approval).
 * This is not platform-admin; env platform-admin cannot be minted via SCIM.
 */

export type ScimProvisionedRole = "ADMIN" | "OPERATOR" | "VIEWER";

export class ScimRoleDeniedError extends Error {
  constructor(message = "SCIM cannot assign this role") {
    super(`Access denied: ${message}`);
    this.name = "ScimRoleDeniedError";
  }
}

export function isScimAdminRoleAllowed(): boolean {
  return process.env.SCIM_ALLOW_ADMIN_ROLE === "true";
}

export function resolveScimProvisionedRole(
  requested: string | undefined,
): ScimProvisionedRole {
  if (!requested || requested.trim() === "") return "OPERATOR";
  const role = requested.trim().toUpperCase();
  if (role === "ADMIN") {
    if (isScimAdminRoleAllowed()) return "ADMIN";
    throw new ScimRoleDeniedError(
      "SCIM cannot assign ADMIN unless SCIM_ALLOW_ADMIN_ROLE=true",
    );
  }
  if (role === "OPERATOR" || role === "VIEWER") return role;
  throw new ScimRoleDeniedError("SCIM cannot assign this role");
}

export function roleFromScimRolesValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value[0]) {
    const first = value[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first !== null && "value" in first) {
      const inner = (first as { value?: unknown }).value;
      return typeof inner === "string" ? inner : undefined;
    }
  }
  return undefined;
}
