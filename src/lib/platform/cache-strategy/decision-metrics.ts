import { prisma } from "@/lib/prisma";
import { cacheAdapter } from "../redis-cache-adapter";
import { DASHBOARD_CACHE_TTL_MS, WarmResult } from "./common";

export async function warmDecisionMetrics(
  organizationId: string,
  results: WarmResult[],
): Promise<void> {
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
}
