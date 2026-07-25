import "server-only"
import { prisma } from "@/lib/prisma"
import type { MemoryStats } from "./common"

// ─── Dashboard ───

export async function getMemoryStats(organizationId?: string): Promise<MemoryStats> {
  const orgFilter = organizationId ? { organizationId } : {}
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalNodes, totalEdges, totalCollections, totalQueries, nodesByType, recentEvents] =
    await Promise.all([
      prisma.intelligenceGraphNode.count({ where: orgFilter }),
      prisma.intelligenceGraphEdge.count({ where: orgFilter }),
      prisma.institutionalMemoryCollection.count({
        where: { ...orgFilter, isActive: true } as Record<string, unknown>,
      }),
      prisma.intelligenceQuery.count({ where: orgFilter }),
      prisma.intelligenceGraphNode.groupBy({
        by: ["type"],
        where: orgFilter,
        _count: { id: true },
      }),
      prisma.institutionalMemoryEvent.count({
        where: {
          ...orgFilter,
          createdAt: { gte: thirtyDaysAgo },
        } as Record<string, unknown>,
      }),
    ])

  return {
    totalNodes,
    totalEdges,
    totalCollections,
    totalQueries,
    nodesByType: Object.fromEntries(
      nodesByType.map((n: { type: string; _count: { id: number } }) => [n.type, n._count.id]),
    ),
    recentActivity: recentEvents,
  }
}
