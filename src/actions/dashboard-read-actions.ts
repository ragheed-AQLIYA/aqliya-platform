"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getPlatformProductCounts() {
  const user = await getCurrentUser();
  const orgId = user.organizationId;

  const [
    decisionCount,
    salesDealCount,
    workflowRecordCount,
    localContactCount,
    localContentProjectCount,
    totalAuditEvents,
  ] = await Promise.all([
    prisma.decision.count().catch(() => 0),
    prisma.salesDeal.count().catch(() => 0),
    prisma.workflowRecord.count().catch(() => 0),
    prisma.localContact.count().catch(() => 0),
    prisma.localContentProject.count().catch(() => 0),
    // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
    prisma.platformAuditLog.count({ where: { productKey: "audit_os" } }),
  ]);

  return {
    decisionCount,
    salesDealCount,
    workflowRecordCount,
    localContactCount,
    localContentProjectCount,
    totalAuditEvents,
  };
}

export async function getRecentProductActivity() {
  await getCurrentUser();

  const [recentDecisions, recentSalesDeals] = await Promise.all([
    prisma.decision
      .findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true },
      })
      .catch(() => []),
    prisma.salesDeal
      .findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true },
      })
      .catch(() => []),
  ]);

  return { recentDecisions, recentSalesDeals };
}

export async function getMonitoringMetrics() {
  await getCurrentUser();

  const counts = await Promise.all([
    prisma.auditEngagement.count(),
    prisma.decision.count(),
    prisma.auditClient.count(),
    prisma.auditEvidence.count(),
    prisma.localContentProject.count().catch(() => 0),
    prisma.localContact.count().catch(() => 0),
    prisma.salesAccount.count().catch(() => 0),
    prisma.contentWorkspace.count().catch(() => 0),
    prisma.risk.count().catch(() => 0),
    prisma.institutionalMemoryEvent.count().catch(() => 0),
    prisma.knowledgeFoundationVersion.count().catch(() => 0),
    // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
    prisma.platformAuditLog.count({ where: { productKey: "audit_os" } }),
  ]);

  return counts;
}
