// ─── AuditOS Actor Context ───
// Centralized actor resolution for AuditOS mutations.
// Tries authenticated user → AuditUser mapping first.
// Falls back to demo actor only in development mode.

import { prisma } from "@/lib/prisma";

export interface AuditActor {
  actorId: string;
  actorName: string;
  actorRole: string;
  organizationId: string;
}

let demoFallbackActive = false;

export function isUsingDemoFallback(): boolean {
  return demoFallbackActive;
}

/**
 * Resolve the current audit actor.
 *
 * Priority:
 * 1. Authenticated NextAuth session user mapped to AuditUser
 * 2. Demo fallback (development only, never in production)
 */
export async function getAuditActor(): Promise<AuditActor> {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const sessionUser = await getCurrentUser();

    // Map session user to AuditUser by email + organization
    const auditUser = await prisma.auditUser.findUnique({
      where: {
        organizationId_email: {
          organizationId: sessionUser.organizationId,
          email: sessionUser.email,
        },
      },
    });

    if (!auditUser) {
      throw new Error("Audit user not provisioned");
    }

    if (auditUser.status !== "active") {
      throw new Error(`Audit user status is ${auditUser.status}`);
    }

    // Update lastLoginAt
    await prisma.auditUser
      .update({
        where: { id: auditUser.id },
        data: { lastLoginAt: new Date() },
      })
      .catch(() => {});

    demoFallbackActive = false;
    return {
      actorId: auditUser.id,
      actorName: auditUser.name,
      actorRole: auditUser.role,
      organizationId: auditUser.organizationId,
    };
  } catch (error) {
    // DEV ONLY: Demo fallback used when no auth session or no AuditUser mapping.
    // Only available in development mode — never in test or production.
    if (process.env.NODE_ENV !== "development") {
      const message =
        error instanceof Error ? error.message : "Authentication required";
      throw new Error(message);
    }
    demoFallbackActive = true;
    return {
      actorId: "usr-ahmed",
      actorName: "Ahmed Al Ghamdi",
      actorRole: "operator",
      organizationId: "org-aqliya",
    };
  }
}

/**
 * Provision an AuditUser from a session user if one doesn't exist.
 * Safe to call in development/demo. In production, provisioning should
 * happen through a controlled admin workflow.
 */
export async function ensureAuditUserProvisioned(): Promise<AuditActor> {
  const { getCurrentUser } = await import("@/lib/auth");
  const sessionUser = await getCurrentUser();

  const existing = await prisma.auditUser.findUnique({
    where: {
      organizationId_email: {
        organizationId: sessionUser.organizationId,
        email: sessionUser.email,
      },
    },
  });

  if (existing) {
    return {
      actorId: existing.id,
      actorName: existing.name,
      actorRole: existing.role,
      organizationId: existing.organizationId,
    };
  }

  const auditUser = await prisma.auditUser.create({
    data: {
      organizationId: sessionUser.organizationId,
      email: sessionUser.email,
      name: sessionUser.name || sessionUser.email,
      role: mapRole(sessionUser.role),
      status: "active",
    },
  });

  return {
    actorId: auditUser.id,
    actorName: auditUser.name,
    actorRole: auditUser.role,
    organizationId: auditUser.organizationId,
  };
}

function mapRole(role: string): string {
  const roleMap: Record<string, string> = {
    ADMIN: "admin",
    OPERATOR: "operator",
    VIEWER: "viewer",
  };
  return roleMap[role] ?? "operator";
}

export function requireRole(actor: AuditActor, allowedRoles: string[]): void {
  if (!allowedRoles.includes(actor.actorRole)) {
    throw new Error(
      `Access denied: ${actor.actorRole} role cannot perform this action. Required: ${allowedRoles.join(" or ")}`,
    );
  }
}

export function canDraft(actor: AuditActor): boolean {
  return ["admin", "operator"].includes(actor.actorRole);
}

export function canReview(actor: AuditActor): boolean {
  return ["admin", "operator", "reviewer"].includes(actor.actorRole);
}

export function canApprove(actor: AuditActor): boolean {
  return ["admin", "partner"].includes(actor.actorRole);
}
