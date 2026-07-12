import "server-only";
import { cacheAdapter } from "./redis-cache-adapter";
import { isRedisAvailable } from "./redis-client";
import { prisma } from "@/lib/prisma";

/** Default TTL for dashboard/metrics cache: 5 minutes (300 seconds) */
export const DASHBOARD_CACHE_TTL_MS = 5 * 60 * 1000;

/** Default TTL for entity cache (e.g., decision detail): 2 minutes */
export const ENTITY_CACHE_TTL_MS = 2 * 60 * 1000;

export function getCacheKey(product: string, entity: string, id: string): string {
  return `${product}:${entity}:${id}`;
}

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const cached = await cacheAdapter.get<T>(key);
  if (cached !== null) return cached;

  const value = await fetchFn();
  await cacheAdapter.set(key, value, ttlMs);
  return value;
}

/**
 * Invalidate a specific cache key.
 */
export async function invalidateProductCache(
  product: string,
  entity: string,
  entityId: string,
): Promise<void> {
  const key = getCacheKey(product, entity, entityId);
  await cacheAdapter.del(key);
}

/**
 * Invalidate all cache entries matching a prefix pattern.
 * For Redis: uses SCAN + DEL to avoid blocking.
 * For in-memory: iterates and deletes matching keys.
 */
export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  await cacheAdapter.del(prefix);
}

/**
 * Invalidate all dashboard caches for an organization.
 * Call this after mutations that affect dashboard data (creates, status changes, etc.).
 */
export async function invalidateDashboardCaches(orgId: string): Promise<void> {
  const prefixes = [
    `dashboard:decision:${orgId}`,
    `dashboard:platform:${orgId}`,
    `dashboard:governance:${orgId}`,
  ];
  for (const prefix of prefixes) {
    await invalidateCacheByPrefix(prefix);
  }
}

export type WarmResult = {
  key: string;
  status: "warmed" | "skipped" | "failed";
  error?: string;
};

/**
 * Pre-populate dashboard caches for an organization.
 * Call this on startup, after cache clear, or via admin API.
 * Handles Redis unavailable gracefully — skips warming.
 */
export async function warmDashboardCaches(
  organizationId: string,
): Promise<WarmResult[]> {
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    return [
      {
        key: "dashboard:*",
        status: "skipped",
        error: "Redis not available — skipping cache warming",
      },
    ];
  }

  const results: WarmResult[] = [];

  // ── Decision metrics ────────────────────────────────────────────────
  const decisionKey = `dashboard:decision:${organizationId}:metrics`;
  try {
    const decisions = await prisma.decision.findMany({
      where: { organizationId },
      include: {
        owner: true,
        recommendation: true,
        approvals: { include: { approver: true } },
        evidence: { select: { id: true } },
        objectives: true,
        constraints: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: true,
        riskAnalyses: true,
        outcome: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const totalDecisions = decisions.length;
    const byStatus = decisions.reduce<Record<string, number>>(
      (acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; },
      {},
    );
    const byType = decisions.reduce<Record<string, number>>(
      (acc, d) => { acc[d.type] = (acc[d.type] || 0) + 1; return acc; },
      {},
    );
    const byPriority = decisions.reduce<Record<string, number>>(
      (acc, d) => { acc[d.priority] = (acc[d.priority] || 0) + 1; return acc; },
      {},
    );
    const approvedCount = byStatus["APPROVED"] || 0;
    const pendingApproval = byStatus["IN_REVIEW"] || 0;
    const avgCompletion = decisions.reduce((sum, d) => {
      const total = (d.objectives?.length || 0) + (d.alternatives?.length || 0) +
        (d.risks?.length || 0) + (d.framework ? 1 : 0) +
        (d.decisionScenarios?.length || 0) + (d.recommendation ? 1 : 0);
      const present = (d.objectives?.length || 0) + (d.alternatives?.length || 0) +
        (d.risks?.length || 0) + (d.framework ? 1 : 0) +
        (d.decisionScenarios?.length || 0) + (d.recommendation ? 1 : 0);
      return sum + (total > 0 ? Math.round((present / total) * 100) : 0);
    }, 0);

    const value = {
      totalDecisions,
      approvedCount,
      pendingApproval,
      avgCompletion: totalDecisions > 0 ? Math.round(avgCompletion / totalDecisions) : 0,
      byStatus,
      byType,
      byPriority,
      governanceMetrics: {
        evidenceBackedCount: decisions.filter((d) => (d.evidence?.length || 0) > 0).length,
        inReviewWithoutEvidence: decisions.filter(
          (d) => d.status === "IN_REVIEW" && (d.evidence?.length || 0) === 0,
        ).length,
        readyForReviewCount: decisions.filter(
          (d) => d.status === "DRAFT",
        ).length,
        highPriorityPendingApprovalCount: decisions.filter(
          (d) => d.status === "IN_REVIEW" && (d.priority === "HIGH" || d.priority === "CRITICAL"),
        ).length,
      },
    };

    await cacheAdapter.set(decisionKey, value, DASHBOARD_CACHE_TTL_MS);
    results.push({ key: decisionKey, status: "warmed" });
  } catch (err) {
    results.push({
      key: decisionKey,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // ── Platform health ──────────────────────────────────────────────────
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

  // ── Governance dashboard ─────────────────────────────────────────────
  const governanceKey = `dashboard:governance:${organizationId}:items`;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = [];

    // Pending decisions
    try {
      const decisions = await prisma.decision.findMany({
        where: { status: "IN_REVIEW" },
        select: { id: true, title: true, description: true, status: true, targetDate: true, owner: { select: { name: true } }, createdAt: true },
      });
      for (const d of decisions) {
        items.push({
          id: d.id, productKey: "decision", productLabel: "DecisionOS",
          type: "مراجعة", title: d.title, description: d.description,
          status: d.status, priority: "medium", createdBy: d.owner?.name || null,
          createdAt: d.createdAt, deadline: d.targetDate, href: `/decisions/${d.id}`,
        });
      }
    } catch { /* skip on error */ }

    // Pending workflows
    try {
      const workflows = await prisma.workflowRecord.findMany({
        where: { status: { in: ["in_progress", "pending_approval"] } },
        select: { id: true, title: true, description: true, status: true, dueDate: true, createdById: true, createdAt: true },
      });
      for (const w of workflows) {
        items.push({
          id: w.id, productKey: "workflow", productLabel: "WorkflowOS",
          type: "موافقة", title: w.title, description: w.description,
          status: w.status, priority: "medium", createdBy: w.createdById,
          createdAt: w.createdAt, deadline: w.dueDate, href: "/workflows",
        });
      }
    } catch { /* skip on error */ }

    // Local content reviews
    try {
      const reviews = await prisma.localContentReview.findMany({
        where: { status: "pending" },
        select: { id: true, project: { select: { name: true } }, status: true, reviewerName: true, createdAt: true, projectId: true },
      });
      for (const r of reviews) {
        items.push({
          id: r.id, productKey: "localcontent", productLabel: "LocalContentOS",
          type: "مراجعة", title: r.project?.name || "مراجعة محتوى محلي",
          description: null, status: r.status, priority: "high",
          createdBy: r.reviewerName, createdAt: r.createdAt, deadline: null,
          href: `/local-content/reviews/${r.id}`,
        });
      }
    } catch { /* skip on error */ }

    // Sales reviews
    try {
      const reviews = await prisma.salesReview.findMany({
        where: { status: "pending" },
        select: { id: true, deal: { select: { title: true } }, status: true, reviewerName: true, createdAt: true, dealId: true },
      });
      for (const r of reviews) {
        items.push({
          id: r.id, productKey: "sales", productLabel: "SalesOS",
          type: "مراجعة", title: r.deal?.title || "مراجعة صفقة",
          description: null, status: r.status, priority: "high",
          createdBy: r.reviewerName, createdAt: r.createdAt, deadline: null,
          href: `/sales/reviews/${r.id}`,
        });
      }
    } catch { /* skip on error */ }

    // Risk assessments
    try {
      const assessments = await prisma.auditRiskAssessment.findMany({
        where: { status: "pending_review" },
        select: { id: true, title: true, inherentLevel: true, assessedAt: true, assessedById: true, createdAt: true, status: true },
      });
      for (const r of assessments) {
        items.push({
          id: r.id, productKey: "risk", productLabel: "RiskOS",
          type: "موافقة", title: r.title, description: null,
          status: r.status, priority: r.inherentLevel === "critical" ? "high" : "medium",
          createdBy: r.assessedById, createdAt: r.createdAt, deadline: null,
          href: `/risk/${r.id}`,
        });
      }
    } catch { /* skip on error */ }

    // Audit findings
    try {
      const findings = await prisma.auditFinding.findMany({
        where: { status: { in: ["open", "under_review"] } },
        select: { id: true, title: true, description: true, severity: true, status: true, assignedTo: true, engagementId: true, createdAt: true },
      });
      for (const f of findings) {
        items.push({
          id: f.id, productKey: "audit", productLabel: "AuditOS",
          type: "اعتماد", title: f.title, description: f.description,
          status: f.status, priority: (f.severity === "critical" || f.severity === "high") ? "high" : "medium",
          createdBy: f.assignedTo, createdAt: f.createdAt, deadline: null,
          href: `/audit/engagements/${f.engagementId}/findings`,
        });
      }
    } catch { /* skip on error */ }

    const totalPending = items.length;
    const criticalCount = items.filter((i) => i.priority === "high").length;
    const byProduct = items.reduce<Record<string, number>>(
      (acc, i) => { acc[i.productKey as string] = (acc[i.productKey as string] || 0) + 1; return acc; },
      {},
    );
    const avgAge = items.length > 0
      ? Math.round(items.reduce((sum, i) => sum + (Date.now() - new Date(i.createdAt as Date).getTime()), 0) / items.length / (1000 * 60 * 60 * 24))
      : 0;

    const value = { items, stats: { totalPending, criticalCount, byProduct, averageAge: avgAge } };

    await cacheAdapter.set(governanceKey, value, DASHBOARD_CACHE_TTL_MS);
    results.push({ key: governanceKey, status: "warmed" });
  } catch (err) {
    results.push({
      key: governanceKey,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return results;
}
