/**
 * Auth layer — NextAuth.js v5
 * Replaces static user + dev-user-email cookie
 */

import type { UserRole } from "@prisma/client";
export type RequiredRole = UserRole;

import { auth } from "@/lib/auth-next";

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

export interface CurrentOrgContext {
  user: CurrentUser;
  organization: CurrentUser["organization"];
  role: UserRole;
}

/**
 * Get current user from NextAuth session (server-side)
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthenticated");
  }
  return session.user as unknown as CurrentUser;
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(
  user: CurrentUser,
  requiredRole: RequiredRole,
): boolean {
  if (requiredRole === "ADMIN") return user.role === "ADMIN";
  if (requiredRole === "OPERATOR")
    return ["OPERATOR", "ADMIN"].includes(user.role);
  return ["VIEWER", "OPERATOR", "ADMIN"].includes(user.role);
}

/**
 * Require user to have given role, throw otherwise
 */
export async function requireUserContext(
  requiredRole: RequiredRole = "OPERATOR",
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, requiredRole)) {
    throw new Error(`Access denied: ${requiredRole} role required`);
  }
  return user;
}

/**
 * Require access to a specific organization
 */
export async function requireOrgAccess(
  organizationId: string,
  requiredRole: RequiredRole = "OPERATOR",
): Promise<CurrentUser> {
  const user = await requireUserContext(requiredRole);
  if (user.organizationId !== organizationId) {
    throw new Error("Access denied: organization access required");
  }
  return user;
}

/**
 * Require access to a decision (org + role)
 */
export async function requireDecisionAccess(
  decisionId: string,
  requiredRole: RequiredRole = "OPERATOR",
): Promise<{ user: CurrentUser; organizationId: string }> {
  const { prisma } = await import("./prisma");
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { organizationId: true },
  });

  if (!decision) {
    throw new Error("Decision not found");
  }

  const user = await requireOrgAccess(decision.organizationId, requiredRole);
  return { user, organizationId: decision.organizationId };
}

export function isAdmin(user: CurrentUser): boolean {
  return user.role === "ADMIN";
}

export function isOperator(user: CurrentUser): boolean {
  return ["OPERATOR", "ADMIN"].includes(user.role);
}

export function isViewer(user: CurrentUser): boolean {
  return user.role === "VIEWER";
}

export function isExpectedAccessDeniedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.startsWith("Access denied:") ||
      error.message === "Unauthenticated")
  );
}
