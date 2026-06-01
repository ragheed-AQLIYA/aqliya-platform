"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertOrganizationAccess } from "@/lib/audit/tenant-guard"

// Inline DB access via prisma to avoid circular dependencies
import { prisma } from "@/lib/prisma"

export interface AuditUserResult {
  id: string
  email: string
  name: string
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
}

function toResult(u: {
  id: string; email: string; name: string; role: string; status: string;
  lastLoginAt: Date | null; createdAt: Date;
}): AuditUserResult {
  return { id: u.id, email: u.email, name: u.name, role: u.role, status: u.status, lastLoginAt: u.lastLoginAt?.toISOString() ?? null, createdAt: u.createdAt.toISOString() }
}

async function recordOrgEvent(actor: { actorId: string; actorName: string; actorRole: string; organizationId: string }, params: {
  eventType: string; targetType: string; targetId: string; newState: string; previousState?: string; description: string;
}) {
  try {
    const engagement = await prisma.auditEngagement.findFirst({
      where: { organizationId: actor.organizationId },
      select: { id: true },
    })
    if (!engagement) {
      console.warn(`[AdminAudit] No engagement found for org ${actor.organizationId}; skipping audit event for ${params.eventType}`)
      return
    }
    await prisma.auditEvent.create({
      data: {
        engagementId: engagement.id,
        eventType: params.eventType,
        actorId: actor.actorId,
        actorName: actor.actorName,
        actorRole: actor.actorRole,
        targetType: params.targetType,
        targetId: params.targetId,
        previousState: params.previousState ?? '',
        newState: params.newState,
        description: params.description,
      },
    })
  } catch (e) {
    console.warn(`[AdminAudit] Failed to record audit event ${params.eventType}:`, (e as Error).message)
  }
}

export async function getAuditUsersAdminAction(): Promise<AuditUserResult[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin"])
  const users = await prisma.auditUser.findMany({
    where: { organizationId: actor.organizationId },
    orderBy: { name: "asc" },
  })
  return users.map(toResult)
}

export async function createAuditUserAction(params: {
  email: string; name: string; role: string;
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin"])
  const existing = await prisma.auditUser.findUnique({
    where: { organizationId_email: { organizationId: actor.organizationId, email: params.email } },
  })
  if (existing) {
    throw new Error("Audit user with this email already exists in your organization")
  }
  const user = await prisma.auditUser.create({
    data: {
      organizationId: actor.organizationId,
      email: params.email,
      name: params.name,
      role: params.role,
      status: "active",
    },
  })
  await recordOrgEvent(actor, {
    eventType: "audit_user.created",
    targetType: "audit_user",
    targetId: user.id,
    newState: "active",
    description: `Audit user created: ${params.email} (${params.role})`,
  })
  return toResult(user)
}

export async function updateAuditUserRoleAction(userId: string, role: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin"])
  const user = await prisma.auditUser.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")
  if (user.organizationId !== actor.organizationId) {
    throw new Error("Access denied: user belongs to another organization")
  }
  const updated = await prisma.auditUser.update({ where: { id: userId }, data: { role } })
  await recordOrgEvent(actor, {
    eventType: "audit_user.role_updated",
    targetType: "audit_user",
    targetId: userId,
    previousState: user.role,
    newState: role,
    description: `Audit user role updated: ${user.email} → ${role}`,
  })
  return toResult(updated)
}

export async function deactivateAuditUserAction(userId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin"])
  const user = await prisma.auditUser.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")
  if (user.organizationId !== actor.organizationId) {
    throw new Error("Access denied: user belongs to another organization")
  }
  if (user.id === actor.actorId) {
    throw new Error("Cannot deactivate yourself")
  }
  const updated = await prisma.auditUser.update({ where: { id: userId }, data: { status: "inactive" } })
  await recordOrgEvent(actor, {
    eventType: "audit_user.deactivated",
    targetType: "audit_user",
    targetId: userId,
    previousState: "active",
    newState: "inactive",
    description: `Audit user deactivated: ${user.email}`,
  })
  return toResult(updated)
}
