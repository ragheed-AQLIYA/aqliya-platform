/**
 * Server action guard.
 *
 * Unified guard for server actions. Routes all authorization
 * through the `authorize()` facade, replacing product-specific
 * guard logic in individual actions.
 *
 * Consolidates:
 *   - src/core/access/server-action-guard.ts
 *   - src/lib/platform/access/rbac-service.ts (action-level checks)
 *   - Product-specific guards (tenant-guard.ts in each product)
 */

import type { CurrentUser } from "@/lib/auth";
import type { AccessAction, AuthorizeOptions, ResourceType } from "./types";
import { authorize } from "./authorize";
import { principalFromUser } from "./types";

/**
 * Enforce authorization in a server action.
 *
 * Throws on failure — designed for server action try/catch patterns.
 * Returns nothing on success.
 *
 * Usage:
 * ```ts
 * "use server";
 * import { enforce } from "@/lib/authorization/action-guard";
 *
 * export async function approveEngagement(id: string) {
 *   const user = await getCurrentUser();
 *   await enforce(user, { type: "engagement", id }, "approve");
 *   // ... proceed
 * }
 * ```
 */
export async function enforce(
  user: CurrentUser,
  resource: AuthorizeOptions["resource"],
  action: AccessAction,
  context?: AuthorizeOptions["context"],
): Promise<void> {
  const result = await authorize({
    user,
    resource,
    action,
    context,
  });

  if (!result.allowed) {
    throw new Error(result.reason ?? "Authorization denied");
  }
}

/**
 * Check authorization without throwing.
 * Returns boolean for non-blocking checks.
 */
export async function isAllowed(
  user: CurrentUser,
  resource: AuthorizeOptions["resource"],
  action: AccessAction,
  context?: AuthorizeOptions["context"],
): Promise<boolean> {
  const result = await authorize({
    user,
    resource,
    action,
    context,
  });
  return result.allowed;
}

/**
 * Assert authorization, returning the principal on success.
 * Throws on failure with the denial reason.
 */
export async function assertAuthorized(
  user: CurrentUser,
  resource: AuthorizeOptions["resource"],
  action: AccessAction,
  context?: AuthorizeOptions["context"],
): ReturnType<typeof authorize> {
  const result = await authorize({
    user,
    resource,
    action,
    context,
  });

  if (!result.allowed) {
    throw new Error(result.reason ?? "Authorization denied");
  }

  return result;
}

/**
 * Middleware-style guard for product contexts.
 * Checks role level without DB access — for backward compatibility.
 */
export function guardRoleLevel(
  userRole: string,
  minimumRole: "viewer" | "operator" | "manager" | "admin",
): boolean {
  const hierarchy: Record<string, number> = {
    viewer: 0,
    operator: 1,
    manager: 2,
    admin: 3,
  };

  const userLevel = hierarchy[userRole.toLowerCase()];
  const requiredLevel = hierarchy[minimumRole];

  if (userLevel === undefined || requiredLevel === undefined) return false;
  return userLevel >= requiredLevel;
}
