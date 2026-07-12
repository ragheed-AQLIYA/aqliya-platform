"use server";

import { prisma } from "@/lib/prisma";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { getCachedOrFetch, DASHBOARD_CACHE_TTL_MS } from "@/lib/platform/cache-strategy";

// --- Dashboard Metrics ---
export async function getDashboardMetrics({ take = 1000 }: { take?: number } = {}) {
  try {
    const user = await getCurrentUser();
    const cacheKey = `dashboard:decision:${user.organizationId}:metrics`;

    return await getCachedOrFetch(cacheKey, async () => {
    const decisions = await prisma.decision.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        priority: true,
        createdAt: true,
        recommendation: {
          select: {
            humanReviewRequired: true,
            isClientVisible: true,
            publishedFromSnapshot: true,
          },
        },
        approvals: {
          select: {
            status: true,
          },
        },
        evidence: {
          select: {
            id: true,
          },
        },
        objectives: {
          select: {
            id: true,
          },
        },
        framework: {
          select: {
            context: true,
            purpose: true,
            options: true,
            criteria: true,
            values: true,
            informationGaps: true,
            certainty: true,
            assumptions: true,
          },
        },
        decisionScenarios: {
          select: {
            id: true,
          },
        },
        riskAnalyses: {
          select: {
            id: true,
          },
        },
        risks: {
          select: {
            level: true,
            description: true,
          },
        },
        outcome: {
          select: {
            outcomeStatus: true,
            actualOutcome: true,
            variance: true,
            reviewedAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    const totalDecisions = decisions.length;
    const byStatus = decisions.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byType = decisions.reduce(
      (acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byPriority = decisions.reduce(
      (acc, d) => {
        const p = d.priority || "MEDIUM";
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const approvedCount = decisions.filter((d) =>
      d.approvals.some((a) => a.status === "APPROVED"),
    ).length;

    const pendingApproval = decisions.filter(
      (d) =>
        d.recommendation && !d.approvals.some((a) => a.status === "APPROVED"),
    ).length;

    const draftCount = byStatus["DRAFT"] || 0;
    const inProgressCount = totalDecisions - draftCount - approvedCount;

    const completionRates = decisions.map((d) => {
      let stages = 0;
      let complete = 0;

      if (d.title) {
        stages++;
        complete++;
      }
      if (d.objectives.length > 0) {
        stages++;
        complete++;
      }
      if (d.framework) {
        stages++;
        complete++;
      }
      if (d.decisionScenarios.length >= 3) {
        stages++;
        complete++;
      }
      if (d.riskAnalyses.length > 0) {
        stages++;
        complete++;
      }
      if (d.recommendation) {
        stages++;
        complete++;
      }
      if (d.approvals.some((a) => a.status === "APPROVED")) {
        stages++;
        complete++;
      }

      return stages > 0 ? (complete / stages) * 100 : 0;
    });

    const avgCompletion =
      completionRates.length > 0
        ? Math.round(
            completionRates.reduce((a, b) => a + b, 0) / completionRates.length,
          )
        : 0;

    const evidenceBackedCount = decisions.filter(
      (d) => d.evidence.length > 0,
    ).length;
    const missingEvidenceCount = totalDecisions - evidenceBackedCount;
    const inReviewWithoutEvidence = decisions.filter(
      (d) => d.status === "IN_REVIEW" && d.evidence.length === 0,
    ).length;
    const humanReviewRequiredCount = decisions.filter(
      (d) => d.recommendation?.humanReviewRequired,
    ).length;
    const readyForReviewCount = decisions.filter(
      (d) =>
        d.status === "DRAFT" && !!d.recommendation && d.evidence.length > 0,
    ).length;
    const publishedWithoutSnapshotCount = decisions.filter(
      (d) =>
        d.recommendation?.isClientVisible &&
        !d.recommendation.publishedFromSnapshot,
    ).length;
    const highPriorityPendingApprovalCount = decisions.filter(
      (d) =>
        !!d.recommendation &&
        !d.approvals.some((a) => a.status === "APPROVED") &&
        ["HIGH", "CRITICAL"].includes(d.priority || ""),
    ).length;

    const recentDecisions = decisions.slice(0, 5).map((d) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      status: d.status,
      priority: d.priority,
      createdAt: d.createdAt,
      hasRecommendation: !!d.recommendation,
      hasApproval: d.approvals.some((a) => a.status === "APPROVED"),
      hasEvidence: d.evidence.length > 0,
      humanReviewRequired: Boolean(d.recommendation?.humanReviewRequired),
      stageCount: [
        !!d.title,
        d.objectives.length > 0,
        !!d.framework,
        d.decisionScenarios.length >= 3,
        d.riskAnalyses.length > 0,
        !!d.recommendation,
        d.approvals.some((a) => a.status === "APPROVED"),
      ].filter(Boolean).length,
    }));

    const bottlenecks = decisions
      .filter((d) => {
        const hasFramework = !!d.framework;
        const hasScenarios = d.decisionScenarios.length >= 3;
        const hasRisks = d.riskAnalyses.length > 0;
        const hasRecommendation = !!d.recommendation;
        const hasApproval = d.approvals.some((a) => a.status === "APPROVED");

        return (
          (hasFramework && !hasScenarios) ||
          (hasScenarios && !hasRisks) ||
          (hasRisks && !hasRecommendation) ||
          (hasRecommendation && !hasApproval)
        );
      })
      .map((d) => {
        let stage = "Unknown";
        if (d.framework && d.decisionScenarios.length < 3) stage = "Scenarios";
        else if (d.decisionScenarios.length >= 3 && d.riskAnalyses.length === 0)
          stage = "Risk Analysis";
        else if (d.riskAnalyses.length > 0 && !d.recommendation)
          stage = "Recommendation";
        else if (
          d.recommendation &&
          !d.approvals.some((a) => a.status === "APPROVED")
        )
          stage = "Approval";
        return { id: d.id, title: d.title, stage, priority: d.priority };
      });

    const { buildOutcomeDashboardMetrics } = await import(
      "@/lib/decision/outcome-dashboard"
    );
    const outcomeInput = decisions.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      priority: d.priority,
      type: d.type,
      outcome: d.outcome
        ? {
            outcomeStatus: d.outcome.outcomeStatus,
            actualOutcome: d.outcome.actualOutcome,
            variance: d.outcome.variance,
            reviewedAt: d.outcome.reviewedAt,
            updatedAt: d.outcome.updatedAt,
          }
        : null,
    }));

    const outcomeMetrics = buildOutcomeDashboardMetrics(outcomeInput);

    const { buildOutcomeCorrelation } = await import(
      "@/lib/decision/outcome-correlation"
    );
    const outcomeCorrelation = buildOutcomeCorrelation(outcomeInput);

    const { buildDecisionPortfolioSnapshot } = await import(
      "@/lib/decision/decision-portfolio"
    );
    const portfolioSnapshot = buildDecisionPortfolioSnapshot(
      decisions.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        type: d.type,
        priority: d.priority,
      })),
    );

    const { buildCrossDecisionPatterns } = await import(
      "@/lib/decision/cross-decision-patterns"
    );
    const crossDecisionPatterns = buildCrossDecisionPatterns(
      decisions.map((d) => ({
        id: d.id,
        type: d.type,
        status: d.status,
        risks: d.risks.map((r) => ({
          level: r.level,
          description: r.description,
        })),
        outcomeStatus: d.outcome?.outcomeStatus ?? null,
      })),
    );

    return {
      success: true,
      data: {
        totalDecisions,
        byStatus,
        byType,
        byPriority,
        approvedCount,
        pendingApproval,
        draftCount,
        inProgressCount,
        avgCompletion,
        governanceMetrics: {
          evidenceBackedCount,
          missingEvidenceCount,
          inReviewWithoutEvidence,
          humanReviewRequiredCount,
          readyForReviewCount,
          publishedWithoutSnapshotCount,
          highPriorityPendingApprovalCount,
        },
        recentDecisions,
        bottlenecks,
        outcomeMetrics,
        outcomeCorrelation,
        portfolioSnapshot,
        crossDecisionPatterns,
      },
    };
    }, DASHBOARD_CACHE_TTL_MS);
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching dashboard metrics:", error);
    }
    return { success: false, error: "Failed to fetch dashboard metrics" };
  }
}
