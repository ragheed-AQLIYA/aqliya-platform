/**
 * Shared authorization types for the unified authorization facade.
 *
 * Consolidates types previously scattered across:
 *   - src/core/access/types.ts
 *   - src/lib/platform/access/principal.ts
 *   - src/lib/platform/access/permissions.ts
 *   - src/lib/auth.ts
 */

import type { UserRole } from "@prisma/client";
import type { RequiredRole } from "@/lib/auth";

// ─── Principal Types ───

export type PrincipalRole = "admin" | "manager" | "operator" | "viewer";

export interface Principal {
  id: string;
  organizationId: string;
  role: PrincipalRole;
  userId: string;
  displayName?: string;
  email?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  platformOrganizationId?: string;
  organization: {
    id: string;
    name: string;
  };
}

// ─── Resource & Action Types ───

export type ResourceType =
  | "organization"
  | "workspace"
  | "settings"
  | "user"
  | "platform"
  | "engagement"
  | "project"
  | "deal"
  | "account"
  | "record"
  | "decision"
  | "document"
  | "evidence"
  | "report"
  | "contact"
  | string;

export type AccessAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "admin"
  | "approve"
  | "reject"
  | "export"
  | "review"
  | "manage_users";

export type Permission = AccessAction | "resource.view" | "manage_users";

// ─── Authorization Request & Result ───

export interface AuthorizeOptions {
  /** Authenticated user session */
  user: CurrentUser;
  /** Resource being accessed */
  resource: {
    type: ResourceType;
    id?: string;
    /** Override tenant context (defaults to user.organizationId) */
    tenantId?: string;
  };
  /** Action being performed */
  action: AccessAction;
  /** Optional context modifiers */
  context?: {
    /** Require MFA verification */
    requireMfa?: boolean;
    /** Bypass tenant isolation check */
    bypassTenantCheck?: boolean;
    /** Override minimum role requirement */
    requiredRole?: RequiredRole;
    /** Additional attributes for ABAC evaluation */
    attributes?: Record<string, unknown>;
  };
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  /** Resolved principal information */
  principal?: Principal;
}

// ─── Tenant Types ───

export interface TenantContext {
  organizationId: string;
  workspaceId?: string;
  engagementId?: string;
  projectId?: string;
}

// ─── Permission Mapping ───

export const ROLE_HIERARCHY: Record<PrincipalRole, number> = {
  viewer: 0,
  operator: 1,
  manager: 2,
  admin: 3,
};

export const ROLE_PERMISSIONS: Record<PrincipalRole, Permission[]> = {
  admin: [
    "read",
    "create",
    "update",
    "delete",
    "admin",
    "export",
    "approve",
    "reject",
    "review",
    "manage_users",
    "resource.view",
  ],
  manager: [
    "read",
    "create",
    "update",
    "export",
    "approve",
    "reject",
    "review",
    "resource.view",
  ],
  operator: [
    "read",
    "create",
    "update",
    "export",
    "review",
    "resource.view",
  ],
  viewer: [
    "read",
    "export",
    "resource.view",
  ],
};

// ─── Role Normalization ───

export function normalizeRole(role: string): PrincipalRole {
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

/** Map AuditOS actor roles to platform UserRole for unified authorization. */
export function mapAuditRoleToUserRole(actorRole: string): UserRole {
  const lower = actorRole.toLowerCase();
  if (lower === "admin") return "ADMIN";
  if (["operator", "manager", "partner", "reviewer"].includes(lower)) {
    return "OPERATOR";
  }
  return "VIEWER";
}

export function principalFromUser(user: CurrentUser): Principal {
  return {
    id: user.id,
    organizationId: user.organizationId,
    role: normalizeRole(user.role),
    userId: user.id,
  };
}
