"use server";

import { createLogger } from "@/lib/observability/logger";

import { prisma } from "@/lib/prisma";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { getCachedOrFetch, DASHBOARD_CACHE_TTL_MS } from "@/lib/platform/cache-strategy";
import { computeAggregationMetrics } from "./aggregation-metrics";
import { computeQualityMetrics } from "./quality-metrics";
import { computeInsightMetrics } from "./insight-metrics";
import type { DecisionMetricsRecord } from "./common";

const logger = createLogger({ product: "platform", action: "unknown" });

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
      }) as unknown as DecisionMetricsRecord[];

      const aggregation = computeAggregationMetrics(decisions);
      const quality = computeQualityMetrics(decisions);
      const insight = computeInsightMetrics(decisions);

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
          ...aggregation,
          avgCompletion: quality.avgCompletion,
          governanceMetrics: {
            evidenceBackedCount: quality.evidenceBackedCount,
            missingEvidenceCount: quality.missingEvidenceCount,
            inReviewWithoutEvidence: quality.inReviewWithoutEvidence,
            humanReviewRequiredCount: quality.humanReviewRequiredCount,
            readyForReviewCount: quality.readyForReviewCount,
            publishedWithoutSnapshotCount: quality.publishedWithoutSnapshotCount,
            highPriorityPendingApprovalCount: quality.highPriorityPendingApprovalCount,
          },
          recentDecisions: insight.recentDecisions,
          bottlenecks: insight.bottlenecks,
          outcomeMetrics,
          outcomeCorrelation,
          portfolioSnapshot,
          crossDecisionPatterns,
        },
      };
    }, DASHBOARD_CACHE_TTL_MS);
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error fetching dashboard metrics:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to fetch dashboard metrics" };
  }
}
