import 'server-only'

import { prisma } from '@/lib/prisma'
import {
  OfficeAiAdvError,
  type OfficeAiTaskStats,
  validateOrgId,
} from './common'
import { ADV_STRINGS } from '../adv-strings'

export async function getTaskStats(
  orgId: string,
  period?: { start: Date; end: Date },
): Promise<OfficeAiTaskStats> {
  validateOrgId(orgId)
  try {
    const end = period?.end ?? new Date()
    const start = period?.start ?? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

    const tasks = await prisma.officeAiTask.findMany({
      take: 100,
      where: {
        platformOrganizationId: orgId,
        createdAt: { gte: start, lte: end },
      },
    })

    const total = tasks.length
    const completed = tasks.filter(
      (t: any) => t.status === 'finalized' || t.status === 'approved',
    ).length
    const overdue = tasks.filter(
      (t: any) =>
        t.status !== 'finalized' &&
        t.status !== 'approved' &&
        t.status !== 'archived',
    ).length

    const byType: Record<string, number> = {}
    for (const t of tasks) {
      const type = t.taskType ?? 'unknown'
      byType[type] = (byType[type] ?? 0) + 1
    }

    return {
      total,
      completed,
      overdue,
      completionRate: total > 0 ? completed / total : 0,
      overdueRate: total > 0 ? overdue / total : 0,
      byType,
      period: { start, end },
    }
  } catch {
    throw new OfficeAiAdvError(ADV_STRINGS.error.GET_STATS_FAILED)
  }
}
