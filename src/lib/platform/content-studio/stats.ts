import { CS_STRINGS } from './cs-strings'
import { ContentStudioError } from './types'
import type { WorkspaceStats } from './types'
import { p } from './common'

export async function getWorkspaceStats(workspaceId: string): Promise<WorkspaceStats> {
  const workspace = await p.contentWorkspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, organizationId: true },
  })
  if (!workspace) throw new ContentStudioError(CS_STRINGS.error.WORKSPACE_NOT_FOUND)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalContent, contentByStatus, recentContent, versionCount, templateUsage] =
    await Promise.all([
      p.contentItem.count({ where: { workspaceId } }),
      p.contentItem.groupBy({
        by: ['status'],
        where: { workspaceId },
        _count: { id: true },
      }),
      p.contentItem.count({
        where: { workspaceId, updatedAt: { gte: thirtyDaysAgo } },
      }),
      p.contentVersion.count({
        where: {
          contentId: { in: (await p.contentItem.findMany({
            where: { workspaceId },
            select: { id: true },
          })).map((c: { id: string }) => c.id) },
        },
      }),
      p.contentItem.count({
        where: { workspaceId, templateId: { not: null } },
      }),
    ])

  const statusMap: Record<string, number> = {}
  for (const group of contentByStatus) {
    statusMap[group.status] = group._count.id
  }

  const publishedCount = statusMap['PUBLISHED'] ?? 0
  const publishedPercentage = totalContent > 0 ? Math.round((publishedCount / totalContent) * 100) : 0

  return {
    totalContent,
    contentByStatus: statusMap,
    publishedPercentage,
    totalVersions: versionCount,
    recentActivity: recentContent,
    templatesUsed: templateUsage,
  }
}
