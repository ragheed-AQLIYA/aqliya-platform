import "server-only"

import { prisma } from "@/lib/prisma"
import type { CrossProductStats } from "./types"

export async function getCrossProductStats(organizationId?: string): Promise<CrossProductStats> {
  const sessionWhere: Record<string, any> = {}
  if (organizationId) sessionWhere.organizationId = organizationId

  const totalSessions = await prisma.aiCrossProductSession.count({
    where: sessionWhere,
  })

  const pendingReviewCount = await prisma.aiCrossProductSession.count({
    where: { ...sessionWhere, status: "PENDING_REVIEW" },
  })

  const sessionsByProductRaw: Array<{ productContext: string; _count: { productContext: number } }> =
    await prisma.aiCrossProductSession.groupBy({
      by: ["productContext"],
      where: sessionWhere,
      _count: { productContext: true },
    }) as unknown as Array<{ productContext: string; _count: { productContext: number } }>

  const sessionsByProduct: Record<string, number> = {}
  for (const row of sessionsByProductRaw) {
    sessionsByProduct[row.productContext] = row._count.productContext ?? 0
  }

  const sessionsByStatusRaw: Array<{ status: string; _count: { status: number } }> =
    await prisma.aiCrossProductSession.groupBy({
      by: ["status"],
      where: sessionWhere,
      _count: { status: true },
    }) as unknown as Array<{ status: string; _count: { status: number } }>

  const sessionsByStatus: Record<string, number> = {}
  for (const row of sessionsByStatusRaw) {
    sessionsByStatus[row.status] = row._count.status ?? 0
  }

  const totalActions = await prisma.aiActionRegistry.count()
  const activeActions = await prisma.aiActionRegistry.count({
    where: { isActive: true },
  })

  const totalBridges = await prisma.aiContextBridge.count()

  return {
    totalSessions,
    sessionsByProduct,
    sessionsByStatus,
    pendingReviewCount,
    totalActions,
    activeActions,
    totalBridges,
  }
}
