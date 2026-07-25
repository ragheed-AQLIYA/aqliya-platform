import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";
import { buildPipelineAnalytics } from "@/lib/sales/vnext/pipeline-analytics";
import { listOpportunities } from "@/lib/sales/store";
import type { ExecutiveCommercialPipeline } from "./types";
import type { ExecutiveCommercialSection } from "./common";

export function buildPipelineSection(
  orgId: string,
  revenue: RevenueIntelligenceSnapshot | null,
  error?: unknown,
): ExecutiveCommercialSection<ExecutiveCommercialPipeline> {
  if (error) {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحليل المسار — راجع SalesOS Pipeline.",
      data: null,
    };
  }
  try {
    const opportunities = listOpportunities(orgId);
    const analytics = buildPipelineAnalytics(opportunities);
    const activeOpportunityCount = opportunities.filter(
      (o) => o.stage !== "ClosedWon" && o.stage !== "ClosedLost",
    ).length;

    if (opportunities.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا توجد فرص في المسار.",
        data: null,
      };
    }

    const stageEntries = Object.entries(analytics.stageDistribution)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([stage, count]) => ({
        stage,
        count,
        pct: Math.round((count / opportunities.length) * 100),
      }));

    return {
      status: "ok",
      data: {
        totalValue: analytics.totalValue,
        weightedValue: analytics.weightedValue,
        activeOpportunityCount,
        stalledCount: revenue?.stalledOpportunities.count ?? 0,
        dealsRequiringReview: analytics.dealsRequiringReview,
        avgQualificationScore: analytics.avgQualificationScore,
        topStages: stageEntries,
      },
    };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحليل المسار.",
      data: null,
    };
  }
}
