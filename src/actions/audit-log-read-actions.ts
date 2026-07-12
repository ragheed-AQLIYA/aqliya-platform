"use server";

import { prisma } from "@/lib/prisma";

export async function getPlatformAuditLogStats() {
  const [
    total,
    testRows,
    auditOsRows,
    missingPlatformOrg,
    missingWorkspace,
    missingProject,
    products,
  ] = await Promise.all([
    prisma.platformAuditLog.count(),
    prisma.platformAuditLog.count({
      where: {
        action: {
          in: ["verify.platform_audit_log_write", "platform.dual_write_test"],
        },
      },
    }),
    prisma.platformAuditLog.count({ where: { productKey: "audit_os" } }),
    prisma.platformAuditLog.count({ where: { platformOrganizationId: null } }),
    prisma.platformAuditLog.count({ where: { clientWorkspaceId: null } }),
    prisma.platformAuditLog.count({ where: { projectId: null } }),
    prisma.platformAuditLog.groupBy({
      by: ["productKey"],
      _count: true,
    }),
  ]);

  return {
    total,
    testRows,
    auditOsRows,
    missingPlatformOrg,
    missingWorkspace,
    missingProject,
    products,
  };
}

export async function getPlatformAuditLogEntries(
  where: Record<string, unknown>,
  limit: number,
) {
  const [recentLogs, filteredCount] = await Promise.all([
    prisma.platformAuditLog.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.platformAuditLog.count({ where: where as never }),
  ]);
  return { recentLogs, filteredCount };
}
