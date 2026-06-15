// ─── Vault Admin (إدارة الخزنة) ───
// عمليات إدارية: تقارير الصحة، تدقيق الوصول، التنظيف

import { prisma } from "@/lib/prisma"
import { getRotationHealth } from "./key-rotation"
import type { PlatformAuditLogInput } from "../audit-log"

/**
 * تقرير صحة الخزنة الكامل
 */
export async function getVaultHealth(): Promise<{
  totalSecrets: number
  byCategory: Record<string, number>
  byStatus: Record<string, number>
  rotationCompliance: {
    total: number
    due: number
    compliant: number
    nonCompliant: number
  }
  compromisedKeys: number
}> {
  const allSecrets = await prisma.vaultEntry.findMany({
    where: { deletedAt: null },
    select: {
      category: true,
      status: true,
    },
  })

  const byCategory: Record<string, number> = {}
  const byStatus: Record<string, number> = {}
  let compromisedKeys = 0

  for (const secret of allSecrets) {
    byCategory[secret.category] = (byCategory[secret.category] ?? 0) + 1
    byStatus[secret.status] = (byStatus[secret.status] ?? 0) + 1

    if (secret.status === "COMPROMISED") {
      compromisedKeys++
    }
  }

  const rotationCompliance = await getRotationHealth()

  return {
    totalSecrets: allSecrets.length,
    byCategory,
    byStatus,
    rotationCompliance,
    compromisedKeys,
  }
}

/**
 * سجل تدقيق الوصول لسر معين
 */
export async function getAccessAudit(
  key: string,
  limit: number = 50,
): Promise<PlatformAuditLogInput[]> {
  const logs = await prisma.platformAuditLog.findMany({
    where: {
      productKey: "vault",
      targetLabel: key,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return logs.map((log) => ({
    productKey: log.productKey,
    action: log.action,
    platformOrganizationId: log.platformOrganizationId ?? undefined,
    actorId: log.actorId ?? undefined,
    actorEmail: log.actorEmail ?? undefined,
    actorName: log.actorName ?? undefined,
    targetType: log.targetType ?? undefined,
    targetId: log.targetId ?? undefined,
    targetLabel: log.targetLabel ?? undefined,
    severity: log.severity ?? "info",
    status: log.status ?? "recorded",
    metadata: log.metadata as Record<string, unknown> | undefined,
  }))
}

/**
 * حذف نهائي للأسرار المؤرشفة الأقدم من تاريخ معين
 */
export async function purgeArchived(before: Date): Promise<number> {
  const result = await prisma.vaultEntry.deleteMany({
    where: {
      status: "ARCHIVED",
      deletedAt: { not: null },
      updatedAt: { lte: before },
    },
  })

  return result.count
}
