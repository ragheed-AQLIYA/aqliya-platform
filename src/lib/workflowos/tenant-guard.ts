import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { WorkflowUserRole } from "@/lib/workflowos/types";

export interface WorkflowMembershipInfo {
  membershipId: string;
  clientId: string;
  clientName: string;
  clientSlug: string;
  role: WorkflowUserRole;
  status: string;
}

export async function getUserWorkflowMemberships(
  userId: string,
): Promise<WorkflowMembershipInfo[]> {
  const memberships = await prisma.sunbulUserMembership.findMany({
    where: { userId, status: "Active" },
    include: {
      client: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return memberships.map((m) => ({
    membershipId: m.id,
    clientId: m.clientId,
    clientName: m.client.name,
    clientSlug: m.client.slug,
    role: m.role as WorkflowUserRole,
    status: m.status,
  }));
}

export async function canAccessWorkflowClient(
  userId: string,
  clientId: string,
): Promise<WorkflowMembershipInfo | null> {
  const membership = await prisma.sunbulUserMembership.findUnique({
    where: {
      clientId_userId: { clientId, userId },
    },
    include: {
      client: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!membership || membership.status !== "Active") return null;

  return {
    membershipId: membership.id,
    clientId: membership.clientId,
    clientName: membership.client.name,
    clientSlug: membership.client.slug,
    role: membership.role as WorkflowUserRole,
    status: membership.status,
  };
}

export async function requireClientAccess(
  clientId: string,
  requiredRole?: WorkflowUserRole,
) {
  const user = await getCurrentUser();

  const platformAdminCheck = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (platformAdminCheck?.role === "ADMIN") {
    return { ...user, workflowRole: "PlatformAdmin" as WorkflowUserRole };
  }

  const membership = await canAccessWorkflowClient(user.id, clientId);

  if (!membership) {
    throw new Error("Access denied: no active Workflow client membership");
  }

  if (requiredRole) {
    const roleHierarchy: Record<WorkflowUserRole, number> = {
      PlatformAdmin: 3,
      Reviewer: 2,
      Operator: 1,
    };

    const userLevel = roleHierarchy[membership.role] ?? 0;
    const requiredLevel = roleHierarchy[requiredRole] ?? 0;

    if (userLevel < requiredLevel) {
      throw new Error(`Access denied: ${requiredRole} role or higher required`);
    }
  }

  return {
    ...user,
    workflowRole: membership.role as WorkflowUserRole,
    membershipId: membership.membershipId,
  };
}

export async function requireWorkflowAdmin() {
  const user = await getCurrentUser();
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (record?.role !== "ADMIN") {
    throw new Error("Access denied: Platform Admin role required");
  }
  return user;
}

export async function getUserWorkflowRole(
  clientId: string,
): Promise<string | null> {
  const user = await getCurrentUser();

  const isAdmin =
    (
      await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      })
    )?.role === "ADMIN";
  if (isAdmin) return "PlatformAdmin";

  const membership = await prisma.sunbulUserMembership.findUnique({
    where: {
      clientId_userId: { clientId, userId: user.id },
    },
    select: { role: true, status: true },
  });

  if (!membership || membership.status !== "Active") return null;
  return membership.role;
}
