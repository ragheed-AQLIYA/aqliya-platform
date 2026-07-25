"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { requirePermission, Permission, ResourceType } from "@/actions/localcontent-rbac";

const AUDIT_RETENTION_DAYS = 7 * 365; // 7 years for financial data
const OPERATIONAL_RETENTION_DAYS = 3 * 365; // 3 years for operational data

export async function archiveOldAuditEventsAction(
  beforeDate?: Date,
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "audit_log", id: "global", tenantId: user.organizationId }, "admin");
    await requirePermission(Permission.AUDIT_LOG_ACCESS, ResourceType.AUDIT_LOG);

    const cutoff = beforeDate ?? new Date(Date.now() - AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const result = await prisma.platformAuditLog.updateMany({
      where: {
        productKey: "local_content",
        createdAt: { lt: cutoff },
        action: { not: "archived" },
      },
      data: {
        action: "archived",
      },
    });

    return { success: true, count: result.count };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive audit events",
    };
  }
}
