import type { UserRole } from "@prisma/client";

const ALL_ROLES: UserRole[] = ["ADMIN", "OPERATOR", "VIEWER"];

/**
 * Default roles that require MFA.
 * Includes OPERATOR to match original middleware intent.
 * Override via MFA_REQUIRED_ROLES env var.
 */
const DEFAULT_MFA_REQUIRED_ROLES: UserRole[] = ["ADMIN", "OPERATOR"];

let _cachedMfaRequiredRoles: UserRole[] | null = null;

export function parseMfaRequiredRoles(envValue: string | undefined): UserRole[] {
  if (!envValue || envValue.trim() === "") return [];
  return envValue
    .split(",")
    .map((r) => r.trim().toUpperCase() as UserRole)
    .filter((r) => ALL_ROLES.includes(r));
}

export function getMFARequiredRoles(): UserRole[] {
  if (_cachedMfaRequiredRoles !== null) return _cachedMfaRequiredRoles;
  const envValue = process.env.MFA_REQUIRED_ROLES;
  if (envValue === undefined) {
    _cachedMfaRequiredRoles = DEFAULT_MFA_REQUIRED_ROLES;
  } else {
    _cachedMfaRequiredRoles = parseMfaRequiredRoles(envValue);
  }
  return _cachedMfaRequiredRoles;
}

export function resetMFARequiredRolesCache(): void {
  _cachedMfaRequiredRoles = null;
}

export function isMFARequiredForRole(role: UserRole): boolean {
  return getMFARequiredRoles().includes(role);
}

export function isMFARequiredForRoleName(role: string): boolean {
  return getMFARequiredRoles().includes(role as UserRole);
}
