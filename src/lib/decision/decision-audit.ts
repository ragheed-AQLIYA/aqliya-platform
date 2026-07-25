import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { Product } from "@/lib/platform/audit-logger";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";

export interface DecisionAuditLogItem {
  id: string;
  action: string;
  entity: string | null;
  createdAt: Date;
  after: string | null;
  user: { name: string | null; email: string | null } | null;
}

/** [MIGRATED] DecisionOS audit read: prisma.auditLog → prisma.platformAuditLog with productKey:"decision_os" */
export async function getDecisionAuditLogs(
  decisionId: string,
  opts?: { orderBy?: "asc" | "desc"; take?: number },
): Promise<DecisionAuditLogItem[]> {
  const logs = await prisma.platformAuditLog.findMany({
    where: {
      productKey: "decision_os",
      targetId: decisionId,
      targetType: "Decision",
    },
    orderBy: { createdAt: opts?.orderBy ?? "desc" },
    ...(opts?.take ? { take: opts.take } : {}),
    select: {
      id: true,
      action: true,
      targetType: true,
      createdAt: true,
      afterState: true,
      actorName: true,
      actorEmail: true,
    },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.targetType,
    createdAt: log.createdAt,
    after: log.afterState,
    user: log.actorName
      ? { name: log.actorName, email: log.actorEmail ?? null }
      : null,
  }));
}

/** [MIGRATED] DecisionOS audit count: prisma.auditLog.count → prisma.platformAuditLog.count with productKey:"decision_os" */
export async function countDecisionAuditLogs(decisionId: string): Promise<number> {
  return prisma.platformAuditLog.count({
    where: {
      productKey: "decision_os",
      targetId: decisionId,
      targetType: "Decision",
    },
  });
}

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

export async function logDecisionAudit(
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

  const platformResult = await writePlatformAuditLog({
    productKey: Product.DECISION_OS,
    sourceSystem: "decision_os",
    platformOrganizationId: platformOrgId,
    actorId: userId,
    actorType: "user",
    actorName,
    action: action.toString(),
    targetType: entity,
    targetId: decisionId,
    severity: "info",
    status: "recorded",
    beforeState: before,
    afterState: after,
    organizationId: resolvedOrganizationId,
    metadata: {
      decisionId,
      before: before ? before : undefined,
      after: after ? after : undefined,
    },
  });

  if (platformResult.ok && platformResult.id) {
    await appendToAuditChain(platformResult.id, action.toString(), userId);
  }

  const pal = await prisma.platformAuditLog.findUnique({
    where: { id: platformResult.id! },
  });
  if (!pal) {
    throw new Error("PlatformAuditLog not found after write");
  }

  return pal;
}

/** @deprecated Use logDecisionAudit — retained for call-site migration */
export const logAudit = logDecisionAudit;

export function toAuditJson(value: unknown): string | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  return JSON.stringify(value);
}
