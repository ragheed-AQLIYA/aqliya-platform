/**
 * Auth layer — NextAuth.js v5
 * Replaces static user + dev-user-email cookie
 */

import type { UserRole } from "@/generated/prisma/client";
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
