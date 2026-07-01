import "server-only";

import { prisma } from "@/lib/prisma";
import { isAbacEnforceEnabledForOrg } from "./abac-gate";

export const ABAC_ENFORCE_MISMATCH_THRESHOLD_PERCENT = 5;
export const ABAC_ENFORCE_MIN_EVALUATIONS = 10;

export type AbacShadowMismatchRow = {
  id: string;
  action: string;
  actorId: string | null;
  targetType: string | null;
  targetId: string | null;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
};

export type AbacShadowMismatchReport = {
  organizationId: string;
  windowDays: number;
  totalMismatches: number;
  totalEvaluations: number;
  mismatchRate: number;
  recent: AbacShadowMismatchRow[];
  enforce: {
    enabled: boolean;
    readyForPilot: boolean;
    mismatchRateThresholdPercent: number;
    minEvaluationsRequired: number;
    recommendation: string;
  };
};

export async function getAbacShadowMismatchReport(
  organizationId: string,
  windowDays = 30,
): Promise<AbacShadowMismatchReport> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const [recent, totalMismatches, totalEvaluations] = await Promise.all([
    prisma.platformAuditLog.findMany({
      where: {
        platformOrganizationId: organizationId,
        action: "auth.abac.shadow.mismatch",
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        action: true,
        actorId: true,
        targetType: true,
        targetId: true,
        createdAt: true,
        metadata: true,
      },
    }),
    prisma.platformAuditLog.count({
      where: {
        platformOrganizationId: organizationId,
        action: "auth.abac.shadow.mismatch",
        createdAt: { gte: since },
      },
    }),
    prisma.platformAuditLog.count({
      where: {
        platformOrganizationId: organizationId,
        action: { in: ["auth.abac.shadow.mismatch", "auth.abac.shadow.evaluated"] },
        createdAt: { gte: since },
      },
    }),
  ]);

  const mismatchRate =
    totalEvaluations > 0
      ? Math.round((totalMismatches / totalEvaluations) * 1000) / 10
      : 0;

  const enforceEnabled = isAbacEnforceEnabledForOrg(organizationId);
  const readyForPilot =
    totalEvaluations >= ABAC_ENFORCE_MIN_EVALUATIONS &&
    mismatchRate <= ABAC_ENFORCE_MISMATCH_THRESHOLD_PERCENT;

  let recommendation: string;
  if (enforceEnabled) {
    recommendation = "ABAC enforce is active for this organization.";
  } else if (totalEvaluations < ABAC_ENFORCE_MIN_EVALUATIONS) {
    recommendation = `Collect at least ${ABAC_ENFORCE_MIN_EVALUATIONS} shadow evaluations before pilot enforce (current: ${totalEvaluations}).`;
  } else if (mismatchRate > ABAC_ENFORCE_MISMATCH_THRESHOLD_PERCENT) {
    recommendation = `Mismatch rate ${mismatchRate}% exceeds ${ABAC_ENFORCE_MISMATCH_THRESHOLD_PERCENT}% threshold — review policies before enforce.`;
  } else {
    recommendation =
      "Shadow metrics within pilot threshold — add org to ABAC_ENFORCE_ORG_IDS and set FF_ABAC_ENFORCE=true.";
  }

  return {
    organizationId,
    windowDays,
    totalMismatches,
    totalEvaluations,
    mismatchRate,
    recent: recent.map((row) => ({
      id: row.id,
      action: row.action,
      actorId: row.actorId,
      targetType: row.targetType,
      targetId: row.targetId,
      createdAt: row.createdAt,
      metadata:
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as Record<string, unknown>)
          : null,
    })),
    enforce: {
      enabled: enforceEnabled,
      readyForPilot,
      mismatchRateThresholdPercent: ABAC_ENFORCE_MISMATCH_THRESHOLD_PERCENT,
      minEvaluationsRequired: ABAC_ENFORCE_MIN_EVALUATIONS,
      recommendation,
    },
  };
}

export const AbacShadowReport = {
  getMismatchReport: getAbacShadowMismatchReport,
};
