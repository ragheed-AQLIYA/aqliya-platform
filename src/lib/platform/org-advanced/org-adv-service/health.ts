import { prisma } from '@/lib/prisma'
import { ORG_STRINGS } from '../org-strings'
import { OrgAdvError } from './common'
import type { OrgHealth } from './types'

export async function getOrgHealth(orgId: string): Promise<OrgHealth> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)

  const [settings, users, hierarchyNode, recentEvents, criticalEvents] =
    await Promise.all([
      prisma.orgSetting.findMany({ take: 100, where: { organizationId: orgId } }),
      prisma.user.findMany({
        take: 100,
        where: { organizationId: orgId },
      }),
      prisma.orgHierarchyNode.findFirst({
        where: { organizationId: orgId },
      }),
      prisma.orgLifecycleEvent.findMany({
        take: 100,
        where: {
          organizationId: orgId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.orgLifecycleEvent.findMany({
        take: 100,
        where: {
          organizationId: orgId,
          eventType: { in: ['SUSPENDED', 'MERGED'] },
        },
      }),
    ])

  const hasSettings = settings.length > 0 ? 20 : 0
  const hasActiveUsers = users.length > 0 ? 25 : 0
  const hasHierarchy = hierarchyNode !== null ? 15 : 0
  const recentActivity = recentEvents.length > 0 ? 20 : 0
  const noCriticalEvents = criticalEvents.length === 0 ? 20 : 0

  const score = hasSettings + hasActiveUsers + hasHierarchy + recentActivity + noCriticalEvents

  return {
    score,
    breakdown: {
      hasSettings: {
        score: hasSettings,
        max: 20,
        detail: ORG_STRINGS.health.SETTINGS_CONFIGURED,
      },
      hasActiveUsers: {
        score: hasActiveUsers,
        max: 25,
        detail: ORG_STRINGS.health.ACTIVE_USERS,
      },
      hasHierarchy: {
        score: hasHierarchy,
        max: 15,
        detail: ORG_STRINGS.health.HAS_HIERARCHY,
      },
      recentActivity: {
        score: recentActivity,
        max: 20,
        detail: ORG_STRINGS.health.RECENT_ACTIVITY,
      },
      noCriticalEvents: {
        score: noCriticalEvents,
        max: 20,
        detail: ORG_STRINGS.health.NO_CRITICAL_EVENTS,
      },
    },
  }
}
