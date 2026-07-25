import "server-only";

import { prisma } from "@/lib/prisma";
import {
  buildAuditPortfolioSnapshot,
  type AuditPortfolioSnapshot,
} from "./portfolio-analytics";

export async function getOrganizationPortfolioAnalytics(
  organizationId: string,
): Promise<AuditPortfolioSnapshot> {
  const engagements = await prisma.auditEngagement.findMany({
    where: { organizationId },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });

  if (engagements.length === 0) {
    return buildAuditPortfolioSnapshot([]);
  }

  const ids = engagements.map((e) => e.id);

  const [findings, missingEvidence, approvals, lastEvents] = await Promise.all([
    prisma.auditFinding.groupBy({
      by: ["engagementId"],
      where: {
        engagementId: { in: ids },
        status: { not: "resolved" },
      },
      _count: { _all: true },
    }),
    prisma.auditEvidence.groupBy({
      by: ["engagementId"],
      where: {
        engagementId: { in: ids },
        state: "missing",
      },
      _count: { _all: true },
    }),
    prisma.auditApprovalRecord.groupBy({
      by: ["engagementId"],
      where: { engagementId: { in: ids } },
      _count: { _all: true },
    }),
    // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
    // Note: PlatformAuditLog does not support Prisma's distinct on a JSON sub-field.
    // We fetch events grouped by sourceId (engagementId) and dedupe in-memory.
    prisma.platformAuditLog.findMany({
      where: { productKey: "audit_os", sourceId: { in: ids } },
      orderBy: { createdAt: "desc" },
      select: { sourceId: true, createdAt: true },
    }),
  ]);

  const findingsMap = new Map(
    findings.map((f) => [f.engagementId, f._count._all]),
  );
  const evidenceMap = new Map(
    missingEvidence.map((e) => [e.engagementId, e._count._all]),
  );
  const approvalMap = new Map(
    approvals.map((a) => [a.engagementId, a._count._all]),
  );
  const eventMap = new Map(
    lastEvents.map((e) => [e.sourceId, e.createdAt.toISOString()]),
  );

  const rows = engagements.map((e) => ({
    engagementId: e.id,
    clientName: e.client?.name ?? "—",
    fiscalPeriod: e.fiscalPeriod,
    status: e.status,
    openFindings: findingsMap.get(e.id) ?? 0,
    missingEvidence: evidenceMap.get(e.id) ?? 0,
    approvalCount: approvalMap.get(e.id) ?? 0,
    lastEventAt: eventMap.get(e.id) ?? e.updatedAt.toISOString(),
  }));

  return buildAuditPortfolioSnapshot(rows);
}
