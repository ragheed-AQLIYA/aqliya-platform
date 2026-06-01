import type {
  CompetitorSignal,
  IndustrySignal,
  MarketSignal,
  MarketSignalSeverity,
} from "./types";

export interface ScoredMarketSignal extends MarketSignal {
  score: number;
  severity: MarketSignalSeverity;
}

const SOURCE_WEIGHT: Record<MarketSignal["source"], number> = {
  stored_signal: 12,
  stored_competitor: 14,
  interaction: 10,
  icp_insight: 11,
  win_loss: 13,
  account_industry: 8,
  opportunity: 9,
};

const CATEGORY_WEIGHT: Record<MarketSignal["category"], number> = {
  industry: 10,
  competitor: 14,
  macro: 9,
  buying: 12,
  timing: 11,
  regulatory: 13,
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function severityFromScore(score: number): MarketSignalSeverity {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

export function scoreMarketSignal(signal: MarketSignal): ScoredMarketSignal {
  const base =
    25 +
    (SOURCE_WEIGHT[signal.source] ?? 8) +
    (CATEGORY_WEIGHT[signal.category] ?? 8);
  const labelBoost = Math.min(signal.label.length / 4, 10);
  const score = clamp(Math.round(base + labelBoost));
  return { ...signal, score, severity: severityFromScore(score) };
}

export function scoreIndustrySignal(signal: IndustrySignal): ScoredMarketSignal {
  const pipelineBoost = Math.min(signal.pipelineValue / 50_000, 25);
  const accountBoost = Math.min(signal.accountCount * 6, 18);
  const winBoost = signal.wonCount * 8;
  const trendBoost =
    signal.trend === "expanding" ? 12 : signal.trend === "contracting" ? -8 : 0;
  const score = clamp(
    Math.round(30 + pipelineBoost + accountBoost + winBoost + trendBoost),
  );
  return { ...signal, score, severity: severityFromScore(score) };
}

export function scoreCompetitorSignal(
  signal: CompetitorSignal,
): ScoredMarketSignal {
  const mentionBoost = Math.min(signal.mentionCount * 10, 30);
  const threatBoost =
    signal.threatLevel === "high"
      ? 20
      : signal.threatLevel === "medium"
        ? 12
        : 6;
  const oppBoost = Math.min(signal.affectedOpportunityIds.length * 5, 15);
  const score = clamp(Math.round(25 + mentionBoost + threatBoost + oppBoost));
  return { ...signal, score, severity: severityFromScore(score) };
}

export function scoreMarketSignals(input: {
  general: MarketSignal[];
  industrySignals: IndustrySignal[];
  competitorSignals: CompetitorSignal[];
}): {
  general: ScoredMarketSignal[];
  industrySignals: Array<IndustrySignal & { score: number; severity: MarketSignalSeverity }>;
  competitorSignals: Array<
    CompetitorSignal & { score: number; severity: MarketSignalSeverity }
  >;
} {
  return {
    general: input.general.map(scoreMarketSignal),
    industrySignals: input.industrySignals.map((s) => {
      const scored = scoreIndustrySignal(s);
      return { ...s, score: scored.score, severity: scored.severity };
    }),
    competitorSignals: input.competitorSignals.map((s) => {
      const scored = scoreCompetitorSignal(s);
      return { ...s, score: scored.score, severity: scored.severity };
    }),
  };
}

export function computeOverallMarketScore(
  scored: ReturnType<typeof scoreMarketSignals>,
): number {
  const allScores = [
    ...scored.general.map((s) => s.score),
    ...scored.industrySignals.map((s) => s.score),
    ...scored.competitorSignals.map((s) => s.score),
  ];
  if (allScores.length === 0) return 0;
  const avg = allScores.reduce((sum, n) => sum + n, 0) / allScores.length;
  return Math.round(avg);
}
