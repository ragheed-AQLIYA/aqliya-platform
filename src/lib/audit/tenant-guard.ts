// ─── AuditOS Tenant Guard ───
// Organization-level access control for multi-tenant isolation.

import { prisma } from "@/lib/prisma"
import type { AuditActor } from "./actor-context"

export class TenantAccessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TenantAccessError"
  }
}

/**
 * Assert the actor has access to the given engagement.
 * Fetches the engagement's organizationId and compares against actor.organizationId.
 * Throws TenantAccessError if the actor does not belong to the same organization.
 */
export async function assertEngagementAccess(engagementId: string, actor: AuditActor): Promise<void> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { organizationId: true },
  })

  if (!engagement) {
    throw new TenantAccessError(`Engagement not found: ${engagementId}`)
  }

  if (engagement.organizationId !== actor.organizationId) {
    throw new TenantAccessError(
      `Access denied: engagement belongs to another organization`
    )
  }
}

/**
 * Assert the actor has access to the given client.
 */
export async function assertClientAccess(clientId: string, actor: AuditActor): Promise<void> {
  const client = await prisma.auditClient.findUnique({
    where: { id: clientId },
    select: { organizationId: true },
  })

  if (!client) {
    throw new TenantAccessError(`Client not found: ${clientId}`)
  }

  if (client.organizationId !== actor.organizationId) {
    throw new TenantAccessError(
      `Access denied: client belongs to another organization`
    )
  }
}

/**
 * Assert the actor has access to the given organization.
 */
export async function assertOrganizationAccess(organizationId: string, actor: AuditActor): Promise<void> {
  if (organizationId !== actor.organizationId) {
    throw new TenantAccessError(
      `Access denied: organization mismatch`
    )
  }
}
