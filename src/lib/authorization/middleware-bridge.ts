/**
 * Middleware bridge.
 *
 * Connects the edge middleware's routeMinRoles configuration
 * to the unified authorization facade.
 *
 * This allows middleware.ts to use unified role resolution
 * while maintaining backward compatibility.
 */

import { normalizeRole, ROLE_HIERARCHY } from "./types";

/**
 * Check if a JWT token role satisfies the required route role.
 * Edge-compatible — no database calls.
 *
 * Used by middleware.ts as the first gate. Detailed permission
 * checks happen server-side via authorize().
 */
export function checkRouteRole(
  userRole: string | undefined,
  requiredRouteRole: string,
): boolean {
  if (!userRole) return false;

  const userLevel = ROLE_HIERARCHY[normalizeRole(userRole)];
  const requiredLevel = ROLE_HIERARCHY[normalizeRole(requiredRouteRole)];

  if (userLevel === undefined || requiredLevel === undefined) return false;
  return userLevel >= requiredLevel;
}

/**
 * Role-based route access check.
 * Returns the minimum role required for a given path, or null if public.
 *
 * Meant to replace the inline logic in middleware.ts.
 */
export function getRouteMinRole(
  pathname: string,
  routeMap: Record<string, string>,
): string | null {
  for (const [prefix, role] of Object.entries(routeMap)) {
    if (pathname.startsWith(prefix)) return role;
  }
  return null;
}
