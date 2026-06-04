/**
 * S7-06 — deterministic conversion funnel analytics (SalesOS).
 */

import type { SalesOpportunity } from "../types";

export const FUNNEL_STAGE_ORDER = [
  "Draft",
  "Qualification",
  "InReview",
  "Approved",
  "Negotiation",
  "ClosedWon",
  "ClosedLost",
] as const;

export type FunnelStageId = (typeof FUNNEL_STAGE_ORDER)[number];

export type FunnelStageRow = {
  stage: FunnelStageId | string;
  count: number;
  value: number;
  shareOfPipeline: number;
};

export type FunnelTransition = {
  from: string;
  to: string;
  conversionRate: number | null;
  dropOff: number;
};

export type ConversionFunnelSnapshot = {
  totalOpportunities: number;
  openCount: number;
  winCount: number;
  lostCount: number;
  winRatePct: number | null;
  stages: FunnelStageRow[];
  transitions: FunnelTransition[];
  disclaimerAr: string;
};

const OPEN_STAGES = new Set([
  "Draft",
  "Qualification",
  "InReview",
  "Approved",
  "Negotiation",
]);

export function buildConversionFunnel(
  opportunities: Pick<SalesOpportunity, "stage" | "valueEstimate">[],
): ConversionFunnelSnapshot {
  const counts: Record<string, number> = {};
  const values: Record<string, number> = {};

  for (const o of opportunities) {
    counts[o.stage] = (counts[o.stage] ?? 0) + 1;
    values[o.stage] = (values[o.stage] ?? 0) + (o.valueEstimate ?? 0);
  }

  const total = opportunities.length;
  const winCount = counts.ClosedWon ?? 0;
  const lostCount = counts.ClosedLost ?? 0;
  const closed = winCount + lostCount;
  const openCount = opportunities.filter((o) => OPEN_STAGES.has(o.stage)).length;

  const stages: FunnelStageRow[] = FUNNEL_STAGE_ORDER.map((stage) => {
    const count = counts[stage] ?? 0;
    return {
      stage,
      count,
      value: values[stage] ?? 0,
      shareOfPipeline: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    };
  });

  const transitions: FunnelTransition[] = [];
  for (let i = 0; i < FUNNEL_STAGE_ORDER.length - 1; i++) {
    const from = FUNNEL_STAGE_ORDER[i];
    const to = FUNNEL_STAGE_ORDER[i + 1];
    const fromCount = counts[from] ?? 0;
    const toCount = counts[to] ?? 0;
    transitions.push({
      from,
      to,
      conversionRate:
        fromCount > 0 ? Math.round((toCount / fromCount) * 1000) / 10 : null,
      dropOff: Math.max(0, fromCount - toCount),
    });
  }

  return {
    totalOpportunities: total,
    openCount,
    winCount,
    lostCount,
    winRatePct: closed > 0 ? Math.round((winCount / closed) * 1000) / 10 : null,
    stages,
    transitions,
    disclaimerAr:
      "تحليل قمع تحويل حتمي — لا يُعد توقعاً مالياً. المراجعة البشرية مطلوبة قبل أي قرار.",
  };
}
