/**
 * S7-07 — extended pipeline analytics (deterministic).
 */

import type { SalesOpportunity } from "../types";
import { buildPipelineAnalytics } from "../vnext/pipeline-analytics";
import { formatSalesStageLabel } from "../sales-ux-copy";

export type PipelineStageDepthRow = {
  stage: string;
  labelAr: string;
  count: number;
  totalValue: number;
  avgValue: number;
  sharePct: number;
};

export type PipelineDepthSnapshot = {
  summary: ReturnType<typeof buildPipelineAnalytics>;
  stages: PipelineStageDepthRow[];
  stalledCount: number;
  disclaimerAr: string;
};

const MS_PER_DAY = 86_400_000;

export function buildPipelineDepthMetrics(
  opportunities: SalesOpportunity[],
  stalledDays = 14,
): PipelineDepthSnapshot {
  const summary = buildPipelineAnalytics(opportunities);
  const total = opportunities.length;
  const now = Date.now();

  const byStage = new Map<string, { count: number; value: number }>();
  let stalledCount = 0;

  for (const o of opportunities) {
    const bucket = byStage.get(o.stage) ?? { count: 0, value: 0 };
    bucket.count += 1;
    bucket.value += o.valueEstimate ?? 0;
    byStage.set(o.stage, bucket);

    const updated = o.updatedAt ? new Date(o.updatedAt).getTime() : now;
    if (now - updated > stalledDays * MS_PER_DAY && o.stage !== "ClosedWon" && o.stage !== "ClosedLost") {
      stalledCount += 1;
    }
  }

  const stages: PipelineStageDepthRow[] = [...byStage.entries()]
    .map(([stage, data]) => ({
      stage,
      labelAr: formatSalesStageLabel(stage),
      count: data.count,
      totalValue: data.value,
      avgValue: data.count > 0 ? Math.round(data.value / data.count) : 0,
      sharePct: total > 0 ? Math.round((data.count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  return {
    summary,
    stages,
    stalledCount,
    disclaimerAr:
      "تحليل عمق المسار مساعد — لا يُعد commit مالياً. المراجعة البشرية مطلوبة.",
  };
}
