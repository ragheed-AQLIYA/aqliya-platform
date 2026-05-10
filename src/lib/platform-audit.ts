import { prisma } from "@/lib/prisma"
import { AuditAction as PrismaAuditAction } from "@prisma/client"

export type AuditAction =
  | "DECISION_CREATED"
  | "DECISION_UPDATED"
  | "RECOMMENDATION_UPDATED"
  | "PATTERN_EXTRACTED"
  | "ALERT_RESOLVED"
  | "SECTOR_ASSIGNED"
  | "BENCHMARK_CREATED"
  | "OUTPUT_PUBLISHED"
  | "OUTPUT_UNPUBLISHED"

const actionMap: Record<AuditAction, PrismaAuditAction> = {
  "DECISION_CREATED": PrismaAuditAction.DECISION_CREATED,
  "DECISION_UPDATED": PrismaAuditAction.DECISION_UPDATED,
  "RECOMMENDATION_UPDATED": PrismaAuditAction.RECOMMENDATION_UPDATED,
  "PATTERN_EXTRACTED": PrismaAuditAction.PATTERN_EXTRACTED,
  "ALERT_RESOLVED": PrismaAuditAction.ALERT_RESOLVED,
  "SECTOR_ASSIGNED": PrismaAuditAction.SECTOR_ASSIGNED,
  "BENCHMARK_CREATED": PrismaAuditAction.BENCHMARK_CREATED,
  "OUTPUT_PUBLISHED": PrismaAuditAction.OUTPUT_PUBLISHED,
  "OUTPUT_UNPUBLISHED": PrismaAuditAction.OUTPUT_UNPUBLISHED,
}

export async function logAudit(
  userId: string,
  decisionId: string,
  action: AuditAction,
  entity: string,
  before?: string,
  after?: string,
  organizationId?: string
) {
  const resolvedOrganizationId = organizationId ?? (
    await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true },
    })
  )?.organizationId

  if (!resolvedOrganizationId) {
    throw new Error("Cannot create audit log without organization context")
  }

  return await prisma.auditLog.create({
    data: {
      userId,
      decisionId,
      organizationId: resolvedOrganizationId,
      action: actionMap[action],
      entity,
      before,
      after,
    },
  })
}

export function toAuditJson(value: unknown): string | undefined {
  if (typeof value === "undefined") {
    return undefined
  }

  return JSON.stringify(value)
}
