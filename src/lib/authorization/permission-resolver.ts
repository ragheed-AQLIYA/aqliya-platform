/**
 * Permission resolver.
 *
 * Resolves permissions from roles, supporting both static role-permission
 * mappings and database-driven permission assignments.
 *
 * Consolidates:
 *   - src/lib/platform/access/permissions.ts (static mappings)
 *   - src/lib/platform/access/rbac-service.ts (database assignments)
 */

import { prisma } from "@/lib/prisma";
import type { Principal, PrincipalRole, Permission } from "./types";
import { ROLE_PERMISSIONS } from "./types";

export interface ResolvedPermissions {
  role: PrincipalRole;
  permissions: Permission[];
  /** Database-level permission slugs (for fine-grained checks) */
  permissionSlugs: string[];
}

/**
 * Resolve permissions for a given principal.
 *
 * First checks database-assigned permissions, then falls back to
 * the static role→permission mapping.
 */
export async function resolvePermissions(
  principal: Principal,
): Promise<ResolvedPermissions> {
  // Try database permissions first
  const dbPerms = await resolveDbPermissions(principal.userId, principal.organizationId);
  if (dbPerms.length > 0) {
    return {
      role: principal.role,
      permissions: ROLE_PERMISSIONS[principal.role] ?? ["read"],
      permissionSlugs: dbPerms,
    };
  }

  // Fall back to static role-based permissions
  return {
    role: principal.role,
    permissions: ROLE_PERMISSIONS[principal.role] ?? ["read"],
    permissionSlugs: [],
  };
}

/**
 * Check if a principal has a specific permission.
 */
export async function hasPermission(
  principal: Principal,
  permission: Permission,
): Promise<boolean> {
  const resolved = await resolvePermissions(principal);
  return resolved.permissions.includes(permission);
}

/**
 * Check if a principal has a specific database-level permission slug.
 */
export async function hasPermissionSlug(
  principal: Principal,
  slug: string,
): Promise<boolean> {
  const resolved = await resolvePermissions(principal);
  return resolved.permissionSlugs.includes(slug);
}

// ─── Database Permission Resolution ───

async function resolveDbPermissions(
  userId: string,
  organizationId: string,
): Promise<string[]> {
  try {
    const assignments = await prisma.userRoleAssignment.findMany({
      where: {
        userId,
        organizationId,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const slugs = new Set<string>();
    for (const assignment of assignments) {
      for (const rp of assignment.role.permissions) {
        slugs.add(rp.permission.slug);
      }
    }

    return Array.from(slugs);
  } catch {
    // Fail-soft: db unavailable does not block resolution
    return [];
  }
}
