import "server-only"
import { prisma } from "@/lib/prisma"
import { getCached, invalidateCacheByPrefix } from "@/lib/platform/cache/memory-cache"

const DASHBOARD_TTL_MS = 300_000 // 5 minutes
const CACHE_PREFIX = "localcontactos:dashboard:"

// ---------------------------------------------------------------------------
// Types that match what the dashboard page consumes from Prisma
// ---------------------------------------------------------------------------

export interface DashboardInteraction {
  id: string
  interactionType: string
  subject: string | null
  occurredAt: Date
  contact: {
    id: string
    name: string
  }
}

export interface DashboardRecentContact {
  id: string
  name: string
  sensitivityLevel: string
  position: string | null
  organizationName: string | null
  createdAt: Date
}

export interface DashboardMetrics {
  totalContacts: number
  sensitivityCounts: Array<{ sensitivityLevel: string; _count: number }>
  exportStatusCounts: Array<{ exportStatus: string; _count: number }>
  recentInteractions: DashboardInteraction[]
  reviewStats: Array<{ status: string }>
  recentContacts: DashboardRecentContact[]
}

// ---------------------------------------------------------------------------
// Cached fetcher
// ---------------------------------------------------------------------------

/**
 * Return dashboard metrics for a given organisation.
 *
 * Results are cached in-memory for 5 minutes (configurable via
 * DASHBOARD_TTL_MS) keyed by organisation ID.  Subsequent loads within
 * the TTL window return the cached snapshot without hitting the database.
 */
export async function getDashboardMetrics(
  orgId: string,
): Promise<DashboardMetrics> {
  const cacheKey = CACHE_PREFIX + orgId

  return getCached(cacheKey, DASHBOARD_TTL_MS, async () => {
    const [
      totalContacts,
      sensitivityCounts,
      exportStatusCounts,
      rawInteractions,
      reviewStats,
      recentContacts,
    ] = await Promise.all([
      prisma.localContact.count({
        where: { organizationId: orgId, isActive: true },
      }),

      prisma.localContact.groupBy({
        by: ["sensitivityLevel"],
        where: { organizationId: orgId, isActive: true },
        _count: true,
      }),

      prisma.localContact.groupBy({
        by: ["exportStatus"],
        where: { organizationId: orgId, isActive: true },
        _count: true,
      }),

      prisma.localContactInteraction.findMany({
        where: { organizationId: orgId },
        include: { contact: { select: { id: true, name: true } } },
        orderBy: { occurredAt: "desc" },
        take: 10,
      }),

      prisma.contactReview.findMany({
        where: { organizationId: orgId },
        select: { status: true },
      }),

      prisma.localContact.findMany({
        where: { organizationId: orgId, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          sensitivityLevel: true,
          position: true,
          organizationName: true,
          createdAt: true,
        },
      }),
    ])

    return {
      totalContacts,
      sensitivityCounts: sensitivityCounts.map((s) => ({
        sensitivityLevel: s.sensitivityLevel,
        _count: s._count,
      })),
      exportStatusCounts: exportStatusCounts.map((s) => ({
        exportStatus: s.exportStatus,
        _count: s._count,
      })),
      recentInteractions: rawInteractions.map((i) => ({
        id: i.id,
        interactionType: i.interactionType,
        subject: i.subject,
        occurredAt: i.occurredAt,
        contact: { id: i.contact.id, name: i.contact.name },
      })),
      reviewStats,
      recentContacts,
    }
  })
}

/**
 * Invalidate the cached dashboard metrics for a given organisation so the
 * next load will fetch fresh data from the database.
 */
export function invalidateDashboardCache(orgId: string): void {
  invalidateCacheByPrefix(CACHE_PREFIX + orgId)
}
