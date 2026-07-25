import "server-only";

import { getCachedOrFetch, DASHBOARD_CACHE_TTL_MS } from "@/lib/platform/cache-strategy";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { PlatformHealth } from "./types";

// ─── Health score formula ─────────────────────────────────────────────────
//
// Pending Reviews ............ 25%
// Failed Workflows ........... 25%
// AI Success Rate ............ 25%
// System Activity ............ 15%
// Audit Coverage ............. 10%
//
// >=90 → healthy
// 70-89 → warning
// <70 → critical

export async function getPlatformHealthAction(): Promise<PlatformHealth> {
  const user = await getCurrentUser();
  const cacheKey = `dashboard:platform:${user.organizationId}:health`;
  return await getCachedOrFetch(cacheKey, async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      decisionsInReview,
      workflowFailed,
      workflowCompleted,
      aiOutputCount,
      aiAcceptedCount,
      auditLogsToday,
      auditLogsLast7Days,
      platformAuditLogsToday,
      usersLoggedInToday,
    ] = await Promise.all([
      prisma.decision.count({ where: { status: "IN_REVIEW" } }).catch(() => 0),
      prisma.workflowRecord
        .count({ where: { status: { in: ["rejected", "cancelled"] } } })
        .catch(() => 0),
      prisma.workflowRecord
        .count({ where: { status: "completed" } })
        .catch(() => 0),
      prisma.auditAiOutput.count().catch(() => 0),
      prisma.auditAiOutput
        .count({ where: { status: { in: ["accepted", "approved"] } } })
        .catch(() => 0),
      // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
      prisma.platformAuditLog.count({ where: { productKey: "audit_os", createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.platformAuditLog
        .count({ where: { productKey: "audit_os", createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } })
        .catch(() => 0),
      prisma.platformAuditLog
        .count({ where: { createdAt: { gte: todayStart } } })
        .catch(() => 0),
      prisma.platformAuditLog
        .findMany({
          where: { createdAt: { gte: todayStart } },
          select: { actorId: true },
          distinct: ["actorId"],
        })
        .then((rows) => rows.length)
        .catch(() => 0),
    ]);

    const maxPendingThreshold = 20;
    const pendingScore =
      decisionsInReview <= maxPendingThreshold
        ? 25
        : Math.max(0, 25 - ((decisionsInReview - maxPendingThreshold) / 10) * 5);

    const totalWorkflows = workflowCompleted + workflowFailed;
    const failureRate = totalWorkflows > 0 ? workflowFailed / totalWorkflows : 0;
    const failedScore = Math.max(0, 25 - failureRate * 100 * 0.5);

    const aiSuccessRate = aiOutputCount > 0 ? aiAcceptedCount / aiOutputCount : 1;
    const aiScore = 25 * aiSuccessRate;

    const activityThreshold = 5;
    const activityScore = Math.min(15, (usersLoggedInToday / activityThreshold) * 15);

    const avgDailyLast7 = Math.max(1, auditLogsLast7Days / 7);
    const dailyRatio = auditLogsToday / avgDailyLast7;
    const auditScore = Math.min(10, dailyRatio * 10);

    const healthScore = Math.round(pendingScore + failedScore + aiScore + activityScore + auditScore);
    const clamped = Math.min(100, Math.max(0, healthScore));

    const status: PlatformHealth["status"] =
      clamped >= 90 ? "healthy" : clamped >= 70 ? "warning" : "critical";

    return {
      healthScore: clamped,
      aiRunsToday: aiOutputCount,
      pendingReviews: decisionsInReview,
      failedWorkflows: workflowFailed,
      activeUsersToday: usersLoggedInToday,
      auditEventsToday: platformAuditLogsToday,
      status,
    };
  }, DASHBOARD_CACHE_TTL_MS);
}
