import { prisma } from "@/lib/prisma";
import type { Engagement, DashboardSummary } from "@/types/audit";
import {
  toEngagement,
  toAuditEvent,
  emptyDashboardSummary,
  protectedAuditReadUnavailable,
  toAuditEventFromPlatformLog,
} from "../types";

export async function getDashboardSummary(
  organizationId?: string,
): Promise<DashboardSummary> {
  try {
    const orgFilter = organizationId ? { organizationId } : {};
    const [engagements, events, findings, evidence, _mappings] =
      await Promise.all([
        prisma.auditEngagement.findMany({
          where: orgFilter,
          include: { client: true },
        }),
        // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
        prisma.platformAuditLog.findMany({
          where: {
            productKey: "audit_os",
            ...(organizationId ? { platformOrganizationId: organizationId } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.auditFinding.findMany({
          where: {
            status: { not: "resolved" },
            ...(organizationId ? { engagement: { organizationId } } : {}),
          },
        }),
        prisma.auditEvidence.findMany({
          where: {
            state: "missing",
            ...(organizationId ? { engagement: { organizationId } } : {}),
          },
        }),
        prisma.auditAccountMapping.findMany({
          where: {
            status: "pending",
            ...(organizationId ? { engagement: { organizationId } } : {}),
          },
        }),
      ]);
    if (engagements.length === 0) {
      return emptyDashboardSummary();
    }
    const activeEngagements = engagements.filter(
      (e) => e.status !== "archived" && e.status !== "published",
    ).length;
    const pendingReviews = engagements.filter(
      (e) => e.status === "under_review" || e.status === "awaiting_client",
    ).length;
    const readyForApproval = engagements.filter(
      (e) => e.status === "ready_for_approval",
    ).length;
    const publishedCount = engagements.filter(
      (e) => e.status === "published",
    ).length;
    return {
      totalEngagements: engagements.length,
      activeEngagements,
      pendingReviews,
      openFindings: findings.length,
      missingEvidence: evidence.length,
      readyForApproval,
      publishedCount,
      recentActivity: events.map(toAuditEventFromPlatformLog),
      engagements: engagements.map(toEngagement),
    };
  } catch (error) {
    protectedAuditReadUnavailable("getDashboardSummary", error);
  }
}

export async function getEngagements(
  organizationId?: string,
): Promise<Engagement[]> {
  try {
    const orgFilter = organizationId ? { organizationId } : {};
    const engagements = await prisma.auditEngagement.findMany({
      where: orgFilter,
      include: { client: true },
    });
    if (engagements.length === 0) return [];
    return engagements.map(toEngagement);
  } catch (error) {
    protectedAuditReadUnavailable("getEngagements", error);
  }
}

export async function getEngagement(
  organizationId: string | undefined,
  id: string,
): Promise<Engagement | null> {
  try {
    const where: Record<string, unknown> = { id };
    if (organizationId)
      (where as Record<string, unknown>).organizationId = organizationId;
    const engagement = await prisma.auditEngagement.findUnique({
      where: where as { id: string },
      include: { client: true },
    });
    if (!engagement) return null;
    return toEngagement(engagement);
  } catch (error) {
    protectedAuditReadUnavailable(`getEngagement(${id})`, error);
  }
}
