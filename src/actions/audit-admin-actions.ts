"use server"

import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertOrganizationAccess } from "@/lib/audit/tenant-guard"
import { recordAuditEvent as svcRecordAuditEvent } from "@/lib/audit/services"

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
  await svcRecordAuditEvent({
    engagementId: "",
    eventType: "audit_user.created",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
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
  await svcRecordAuditEvent({
    engagementId: "",
    eventType: "audit_user.role_updated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
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
  await svcRecordAuditEvent({
    engagementId: "",
    eventType: "audit_user.deactivated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "audit_user",
    targetId: userId,
    previousState: "active",
    newState: "inactive",
    description: `Audit user deactivated: ${user.email}`,
  })
  return toResult(updated)
}
