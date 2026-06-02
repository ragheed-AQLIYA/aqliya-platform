// ─── SalesOS pipeline analytics helpers ───

import type { SalesOpportunity, SalesOpportunityStage } from "../types";

export interface PipelineAnalyticsSummary {
  totalValue: number;
  weightedValue: number;
  stageDistribution: Record<SalesOpportunityStage, number>;
  avgQualificationScore: number;
  dealsRequiringReview: number;
}

const STAGE_WEIGHT: Partial<Record<SalesOpportunityStage, number>> = {
  Draft: 0.1,
  Qualification: 0.25,
  InReview: 0.4,
  Approved: 0.6,
  ClosedWon: 1.0,
  ClosedLost: 0,
};

export function buildPipelineAnalytics(
  opportunities: SalesOpportunity[],
): PipelineAnalyticsSummary {
  const stageDistribution = {} as Record<SalesOpportunityStage, number>;
  let totalValue = 0;
  let weightedValue = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  let dealsRequiringReview = 0;

  for (const o of opportunities) {
    stageDistribution[o.stage] = (stageDistribution[o.stage] ?? 0) + 1;
    const value = o.valueEstimate ?? 0;
    totalValue += value;
    weightedValue += value * (STAGE_WEIGHT[o.stage] ?? 0.15);
    if (o.qualificationScore !== undefined) {
      scoreSum += o.qualificationScore;
      scoreCount++;
    }
    if (o.stage === "InReview" || o.reviewStatus === "InReview") {
      dealsRequiringReview++;
    }
  }

  return {
    totalValue,
    weightedValue: Math.round(weightedValue),
    stageDistribution,
    avgQualificationScore:
      scoreCount === 0 ? 0 : Math.round(scoreSum / scoreCount),
    dealsRequiringReview,
  };
}
