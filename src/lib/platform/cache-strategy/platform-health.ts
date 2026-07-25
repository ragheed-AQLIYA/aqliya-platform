import { prisma } from "@/lib/prisma";
import { cacheAdapter } from "../redis-cache-adapter";
import { DASHBOARD_CACHE_TTL_MS, WarmResult } from "./common";

export async function warmPlatformHealth(
  organizationId: string,
  results: WarmResult[],
): Promise<void> {
  const healthKey = `dashboard:platform:${organizationId}:health`;
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [inReview, failedWorkflows, completedWorkflows, aiOutputs, aiAccepted, logsToday] =
      await Promise.all([
        prisma.decision.count({ where: { status: "IN_REVIEW" } }).catch(() => 0),
        prisma.workflowRecord.count({ where: { status: { in: ["rejected", "cancelled"] } } }).catch(() => 0),
        prisma.workflowRecord.count({ where: { status: "completed" } }).catch(() => 0),
        prisma.auditAiOutput.count().catch(() => 0),
        prisma.auditAiOutput.count({ where: { status: { in: ["accepted", "approved"] } } }).catch(() => 0),
        prisma.platformAuditLog.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      ]);

    const totalWorkflows = failedWorkflows + completedWorkflows;
    const reviewScore = Math.max(0, 100 - inReview * 5);
    const workflowScore =
      totalWorkflows > 0 ? Math.round((completedWorkflows / totalWorkflows) * 100) : 100;
    const aiScore = aiOutputs > 0 ? Math.round((aiAccepted / aiOutputs) * 100) : 100;
    const activityScore = Math.min(100, logsToday * 2);
    const healthScore = Math.round(
      reviewScore * 0.25 + workflowScore * 0.25 + aiScore * 0.25 + activityScore * 0.25,
    );

    const value = {
      healthScore,
      aiRunsToday: aiOutputs,
      pendingReviews: inReview,
      failedWorkflows,
      activeUsersToday: 0,
      auditEventsToday: logsToday,
      status: healthScore >= 90 ? "healthy" : healthScore >= 70 ? "warning" : "critical",
    };

    await cacheAdapter.set(healthKey, value, DASHBOARD_CACHE_TTL_MS);
    results.push({ key: healthKey, status: "warmed" });
  } catch (err) {
    results.push({
      key: healthKey,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
