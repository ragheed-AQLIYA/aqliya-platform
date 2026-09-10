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
    prisma.decision.count({ where: { organizationId: orgId } }).catch(() => 0),
    prisma.salesDeal.count({ where: { organizationId: orgId } }).catch(() => 0),
    prisma.workflowRecord.count({ where: { organizationId: orgId } }).catch(() => 0),
    prisma.localContact.count({ where: { organizationId: orgId } }).catch(() => 0),
    prisma.localContentProject.count({ where: { organizationId: orgId } }).catch(() => 0),
    // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
    prisma.platformAuditLog.count({ where: { productKey: "audit_os", organizationId: orgId } }),
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
  const user = await getCurrentUser();
  const orgId = user.organizationId;

  const [recentDecisions, recentSalesDeals] = await Promise.all([
    prisma.decision
      .findMany({
        where: { organizationId: orgId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true },
      })
      .catch(() => []),
    prisma.salesDeal
      .findMany({
        where: { organizationId: orgId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true },
      })
      .catch(() => []),
  ]);

  return { recentDecisions, recentSalesDeals };
}

export async function getMonitoringMetrics() {
  const user = await getCurrentUser();
  const orgId = user.organizationId;

  const counts = await Promise.all([
    prisma.auditEngagement.count({ where: { organizationId: orgId } }),
    prisma.decision.count({ where: { organizationId: orgId } }),
    prisma.auditClient.count({ where: { organizationId: orgId } }),
    prisma.auditEvidence.count({ where: { engagement: { organizationId: orgId } } }),
    prisma.localContentProject.count({ where: { organizationId: orgId } }).catch(() => 0),
    prisma.localContact.count({ where: { organizationId: orgId } }).catch(() => 0),
    prisma.salesAccount.count({ where: { organizationId: orgId } }).catch(() => 0),
    prisma.contentWorkspace.count({ where: { organizationId: orgId } }).catch(() => 0),
    prisma.risk.count({ where: { decision: { organizationId: orgId } } }).catch(() => 0),
    prisma.institutionalMemoryEvent.count({ where: { organizationId: orgId } }).catch(() => 0),
    prisma.knowledgeFoundationVersion.count({ where: { createdBy: { organizationId: orgId } } }).catch(() => 0),
    // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
    prisma.platformAuditLog.count({ where: { productKey: "audit_os", organizationId: orgId } }),
  ]);

  return counts;
}
