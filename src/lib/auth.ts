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
 *
 * W4A Shadow Mode: After the legacy guard completes, the Authorization Engine
 * is called in shadow mode. The engine's decision is logged for parity analysis.
 * Production behavior is NEVER affected by the shadow call.
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

  // W4A Shadow Mode: fire-and-forget engine evaluation
  // Errors are caught — never affects production behavior
  shadowEvaluateDecisionAccess(decisionId, requiredRole, user).catch(() => {
    // Shadow mode errors are intentionally swallowed
  });

  return { user, organizationId: decision.organizationId };
}

/**
 * Shadow evaluation: call the new Authorization Engine and log the result.
 * Completely isolated from production — errors are never propagated.
 * Uses structured ShadowLogger instead of console.debug.
 */
async function shadowEvaluateDecisionAccess(
  decisionId: string,
  requiredRole: RequiredRole,
  user: CurrentUser,
): Promise<void> {
  // Feature flag: only run if enabled
  if (!isShadowModeEnabled()) return;

  const { AuthorizationEngine } = await import(
    "@/lib/authorization/engine/engine"
  );
  const {
    createDefaultRegistry,
    createHandlersFromRegistry,
  } = await import(
    "@/lib/authorization/engine/policies/index"
  );
  const { shadowLogger } = await import(
    "@/lib/authorization/engine/migration/shadow-logger"
  );

  const registry = createDefaultRegistry();
  const handlers = createHandlersFromRegistry(registry);
  const engine = new AuthorizationEngine();
  engine.registerStages(handlers);
  engine.initialize();

  const engineStart = Date.now();
  const result = await engine.authorize({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    resourceType: "decision",
    resourceId: decisionId,
    action: "decision.access",
    context: { requiredRole },
  });
  const engineLatency = Date.now() - engineStart;

  const engineAllowed = result.decision === "ALLOW" || result.decision === "READ_ONLY";
  const legacyAllowed = true; // If we reached here, requireDecisionAccess succeeded

  // Extract exercised policies from the trace
  const policiesExercised = result.trace.policyResults
    .filter((pr) => pr.policyId && !pr.policyId.includes("_COMPOSITE") && !pr.policyId.includes("_DEFAULT"))
    .map((pr) => pr.policyId);

  shadowLogger.record({
    resourceType: "decision",
    resourceId: decisionId,
    action: "decision.access",
    role: user.role,
    organizationId: user.organizationId,
    legacyAllowed,
    engineDecision: result.decision,
    isMatch: legacyAllowed === engineAllowed,
    latencyLegacyMs: 0,
    latencyEngineMs: engineLatency,
    tracePolicy: result.trace.winningPolicy,
    policiesExercised,
  });
}

/**
 * Check whether shadow mode is enabled.
 * Controlled by environment variable — defaults to disabled.
 */
function isShadowModeEnabled(): boolean {
  return (
    process.env.FEATURE_AUTHZ_SHADOW === "1" ||
    process.env.FEATURE_AUTHZ_SHADOW === "true"
  );
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
