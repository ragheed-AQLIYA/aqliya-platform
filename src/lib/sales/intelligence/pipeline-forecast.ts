import type { SalesOpportunity } from "../types";

const STAGE_WEIGHT: Record<string, number> = {
  Draft: 0.05,
  Qualification: 0.15,
  InReview: 0.35,
  Approved: 0.55,
  Negotiation: 0.7,
  ClosedWon: 1,
  ClosedLost: 0,
  Rejected: 0,
  Archived: 0,
};

export interface PipelineForecast {
  totalRaw: number;
  weightedTotal: number;
  byStage: Record<string, { count: number; raw: number; weighted: number }>;
  forecastConfidence: "low" | "medium" | "high";
}

export function buildPipelineForecast(
  opportunities: SalesOpportunity[],
): PipelineForecast {
  const byStage: PipelineForecast["byStage"] = {};
  let totalRaw = 0;
  let weightedTotal = 0;
  let activeCount = 0;

  for (const o of opportunities) {
    if (["ClosedLost", "Archived", "Rejected"].includes(o.stage)) continue;
    activeCount++;
    const value = o.valueEstimate ?? 0;
    const weight = STAGE_WEIGHT[o.stage] ?? 0.1;
    totalRaw += value;
    weightedTotal += value * weight;
    const bucket = byStage[o.stage] ?? { count: 0, raw: 0, weighted: 0 };
    bucket.count += 1;
    bucket.raw += value;
    bucket.weighted += value * weight;
    byStage[o.stage] = bucket;
  }

  const forecastConfidence: PipelineForecast["forecastConfidence"] =
    activeCount >= 5 && weightedTotal > 0
      ? "high"
      : activeCount >= 2
        ? "medium"
        : "low";

  return { totalRaw, weightedTotal, byStage, forecastConfidence };
}
