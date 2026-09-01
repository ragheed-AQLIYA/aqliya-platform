"use server"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface ActivityItem {
  id: string
  type: "audit_event" | "decision_event" | "project_event" | "system_event"
  action: string
  entityType: string
  entityName: string
  actorName: string | null
  timestamp: Date
  url?: string
}

export async function getRecentActivity(limit = 20): Promise<ActivityItem[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const orgId = user.organizationId
   const activities: ActivityItem[] = []

  // Primary source: PlatformAuditLog (cross-product activity log)
  try {
    const logs = await prisma.platformAuditLog.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        productKey: true,
        action: true,
        targetType: true,
        targetLabel: true,
        actorName: true,
        createdAt: true,
      },
    })

    for (const log of logs) {
      activities.push({
        id: `log-${log.id}`,
        type: mapProductKeyToType(log.productKey),
        action: log.action,
        entityType: log.targetType ?? log.productKey,
        entityName: log.targetLabel ?? "",
        actorName: log.actorName,
        timestamp: log.createdAt,
      })
    }
  } catch {
    /* platformAuditLog may not exist or be empty */
  }

  // Fallback sources when platformAuditLog has no data
  if (activities.length === 0) {
    try {
      const engagements = await prisma.auditEngagement.findMany({
        where: { organizationId: orgId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          updatedAt: true,
          client: { select: { name: true } },
        },
      })
      for (const e of engagements) {
        activities.push({
          id: `eng-${e.id}`,
          type: "audit_event",
          action: `تحديث حالة: ${e.status}`,
          entityType: "engagement",
          entityName: e.client.name,
          actorName: null,
          timestamp: e.updatedAt,
          url: `/audit/engagements/${e.id}`,
        })
      }
    } catch { /* silent */ }

    try {
      const decisions = await prisma.decision.findMany({
        where: { organizationId: orgId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, updatedAt: true },
      })
      for (const d of decisions) {
        activities.push({
          id: `dec-${d.id}`,
          type: "decision_event",
          action: `تحديث حالة: ${d.status}`,
          entityType: "decision",
          entityName: d.title,
          actorName: null,
          timestamp: d.updatedAt,
          url: `/decisions/${d.id}`,
        })
      }
    } catch { /* silent */ }

    try {
      const projects = await prisma.localContentProject.findMany({
        where: { organizationId: orgId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, name: true, status: true, updatedAt: true },
      })
      for (const p of projects) {
        activities.push({
          id: `proj-${p.id}`,
          type: "project_event",
          action: `تحديث حالة: ${p.status}`,
          entityType: "project",
          entityName: p.name,
          actorName: null,
          timestamp: p.updatedAt,
          url: `/local-content/projects/${p.id}`,
        })
      }
    } catch { /* silent */ }
  }

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}

export async function getActivitySummary() {
  const user = await getCurrentUser()
  if (!user) return null

  const orgId = user.organizationId

  try {
    const [engagementCount, decisionCount, projectCount, activeUsers] = await Promise.all([
      prisma.auditEngagement.count({ where: { organizationId: orgId } }),
      prisma.decision.count({ where: { organizationId: orgId } }),
      prisma.localContentProject.count({ where: { organizationId: orgId } }).catch(() => 0),
      prisma.user.count({ where: { organizationId: orgId } }),
    ])

    return { engagementCount, decisionCount, projectCount, activeUsers }
  } catch {
    return null
  }
}

function mapProductKeyToType(productKey: string): ActivityItem["type"] {
  switch (productKey) {
    case "audit":
    case "auditos":
      return "audit_event"
    case "decision":
    case "decisionos":
      return "decision_event"
    case "localcontent":
    case "localcontentos":
      return "project_event"
    default:
      return "system_event"
  }
}
