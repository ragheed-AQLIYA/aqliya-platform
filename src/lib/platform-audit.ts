import { prisma } from "@/lib/prisma";
import { AuditAction as PrismaAuditAction } from "@prisma/client";
import { auditLogger, Product } from "@/lib/platform/audit-logger";

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
  | "SUBMITTED_FOR_REVIEW"
  | "DECISION_APPROVED"
  | "DECISION_APPROVED_WITH_CONDITIONS"
  | "DECISION_REJECTED"
  | "REVISION_REQUESTED"
  | "SNAPSHOT_PUBLISHED"
  | "CURRENT_PUBLISHED_WITHOUT_APPROVAL"
  | "STALE_PUBLISH_BLOCKED"
  | "STALE_PUBLISH_OVERRIDE"
  | "OUTCOME_CREATED"
  | "OUTCOME_UPDATED"
  | "OUTCOME_REVIEWED";

const actionMap: Record<AuditAction, PrismaAuditAction> = {
  DECISION_CREATED: PrismaAuditAction.DECISION_CREATED,
  DECISION_UPDATED: PrismaAuditAction.DECISION_UPDATED,
  RECOMMENDATION_UPDATED: PrismaAuditAction.RECOMMENDATION_UPDATED,
  PATTERN_EXTRACTED: PrismaAuditAction.PATTERN_EXTRACTED,
  ALERT_RESOLVED: PrismaAuditAction.ALERT_RESOLVED,
  SECTOR_ASSIGNED: PrismaAuditAction.SECTOR_ASSIGNED,
  BENCHMARK_CREATED: PrismaAuditAction.BENCHMARK_CREATED,
  OUTPUT_PUBLISHED: PrismaAuditAction.OUTPUT_PUBLISHED,
  OUTPUT_UNPUBLISHED: PrismaAuditAction.OUTPUT_UNPUBLISHED,
  SUBMITTED_FOR_REVIEW: PrismaAuditAction.SUBMITTED_FOR_REVIEW,
  DECISION_APPROVED: PrismaAuditAction.DECISION_APPROVED,
  DECISION_APPROVED_WITH_CONDITIONS:
    PrismaAuditAction.DECISION_APPROVED_WITH_CONDITIONS,
  DECISION_REJECTED: PrismaAuditAction.DECISION_REJECTED,
  REVISION_REQUESTED: PrismaAuditAction.REVISION_REQUESTED,
  SNAPSHOT_PUBLISHED: PrismaAuditAction.SNAPSHOT_PUBLISHED,
  CURRENT_PUBLISHED_WITHOUT_APPROVAL:
    PrismaAuditAction.CURRENT_PUBLISHED_WITHOUT_APPROVAL,
  STALE_PUBLISH_BLOCKED: PrismaAuditAction.STALE_PUBLISH_BLOCKED,
  STALE_PUBLISH_OVERRIDE: PrismaAuditAction.STALE_PUBLISH_OVERRIDE,
  OUTCOME_CREATED: PrismaAuditAction.OUTCOME_CREATED,
  OUTCOME_UPDATED: PrismaAuditAction.OUTCOME_UPDATED,
  OUTCOME_REVIEWED: PrismaAuditAction.OUTCOME_REVIEWED,
};

export async function logAudit(
  userId: string,
  decisionId: string,
  action: AuditAction,
  entity: string,
  before?: string,
  after?: string,
  organizationId?: string,
) {
  const resolvedOrganizationId =
    organizationId ??
    (
      await prisma.decision.findUnique({
        where: { id: decisionId },
        select: { organizationId: true },
      })
    )?.organizationId;

  if (!resolvedOrganizationId) {
    throw new Error("Cannot create audit log without organization context");
  }

  const auditLog = await prisma.auditLog.create({
    data: {
      userId,
      decisionId,
      organizationId: resolvedOrganizationId,
      action: actionMap[action],
      entity,
      before,
      after,
    },
  });

  // Dual-write to PlatformAuditLog (safe mode — never blocks)
  try {
    let platformOrgId: string | undefined;
    try {
      const org = await prisma.organization.findUnique({
        where: { id: resolvedOrganizationId },
        select: { platformOrganizationId: true },
      });
      platformOrgId = org?.platformOrganizationId ?? undefined;
    } catch {
      // Best-effort resolution
    }

    let actorName = userId;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });
      if (user) actorName = user.name || user.email || userId;
    } catch {
      // Best-effort: use userId as fallback name
    }

    const alog = auditLogger({
      productKey: Product.DECISION_OS,
      sourceSystem: "decision_os",
      organization: { platformOrganizationId: platformOrgId },
      actor: { id: userId, type: "user", name: actorName },
    });
    await alog.record(
      action.toString(),
      {
        type: entity,
        id: decisionId,
      },
      {
        severity: "info",
        status: "recorded",
        sourceModel: "AuditLog",
        sourceId: auditLog.id,
        metadata: {
          originalId: auditLog.id,
          dualWrite: true,
          decisionId,
          before: before ? before : undefined,
          after: after ? after : undefined,
        },
      },
    );
  } catch {
    // Dual-write failure must never affect the primary action
  }

  return auditLog;
}

export function toAuditJson(value: unknown): string | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  return JSON.stringify(value);
}
