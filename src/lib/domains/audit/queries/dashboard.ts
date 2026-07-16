import "server-only";

import { prisma } from "@/lib/kernel";
import { Projection } from "@/lib/kernel/cqrs/projection";
import type { ProjectionConfig } from "@/lib/kernel/cqrs/projection";

export interface AuditDashboardReadModel {
  totalEngagements: number;
  byStatus: Record<string, number>;
  openFindings: number;
  missingEvidence: number;
  totalApprovals: number;
  recentActivityCount: number;
  lastUpdatedAt: string;
}

const AUDIT_DASHBOARD_CONFIG: ProjectionConfig = {
  domain: "audit",
  actions: [
    "engagement.created",
    "engagement.status_changed",
    "engagement.published",
    "finding.created",
    "finding.status_changed",
    "evidence.uploaded",
    "evidence.linked",
    "review.completed",
  ],
  rebuildIntervalMs: 30_000,
};

export class AuditDashboardProjection extends Projection<AuditDashboardReadModel> {
  readonly id = "audit-dashboard";
  readonly name = "AuditOS Dashboard";

  protected config = AUDIT_DASHBOARD_CONFIG;

  async compute(organizationId: string): Promise<AuditDashboardReadModel> {
    const engagements = await prisma.auditEngagement.findMany({
      where: { organizationId },
      select: { id: true, status: true },
    });

    const ids = engagements.map((e) => e.id);

    const byStatus = engagements.reduce<Record<string, number>>((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});

    let openFindings = 0;
    let missingEvidence = 0;
    let totalApprovals = 0;
    let recentActivityCount = 0;

    if (ids.length > 0) {
      const [findings, evidence, approvals, recentEvents] = await Promise.all([
        prisma.auditFinding.count({
          where: { engagementId: { in: ids }, status: { not: "resolved" } },
        }),
        prisma.auditEvidence.count({
          where: { engagementId: { in: ids }, state: "missing" },
        }),
        prisma.auditApprovalRecord.count({
          where: { engagementId: { in: ids } },
        }),
        prisma.auditEvent.count({
          where: {
            engagementId: { in: ids },
            timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

      openFindings = findings;
      missingEvidence = evidence;
      totalApprovals = approvals;
      recentActivityCount = recentEvents;
    }

    return {
      totalEngagements: engagements.length,
      byStatus,
      openFindings,
      missingEvidence,
      totalApprovals,
      recentActivityCount,
      lastUpdatedAt: new Date().toISOString(),
    };
  }
}

export async function queryAuditDashboard(
  organizationId: string,
): Promise<AuditDashboardReadModel> {
  const projection = new AuditDashboardProjection();
  return projection.compute(organizationId);
}
