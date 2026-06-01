import type {
  CompetitorSignal,
  IndustrySignal,
  MarketInsight,
  MarketIntelligenceInput,
  MarketIntelligenceSnapshot,
  MARKET_INTEL_LABEL,
} from "./types";
import {
  MARKET_INTEL_DISCLAIMER_AR,
  MARKET_INTEL_DISCLAIMER_EN,
  MARKET_INTEL_LABEL as INSIGHT_LABEL,
} from "./types";
import { collectMarketSignals } from "./collect";
import { categorizeMarketSignals } from "./categorize";
import {
  computeOverallMarketScore,
  scoreMarketSignals,
  type ScoredMarketSignal,
} from "./score";

function insightRow(
  partial: Omit<MarketInsight, "insightLabel" | "outputStatus">,
): MarketInsight {
  return {
    ...partial,
    insightLabel: INSIGHT_LABEL,
    outputStatus: "draft",
  };
}

function buildIndustryInsight(
  signal: IndustrySignal & { score: number; severity: MarketInsight["severity"] },
): MarketInsight {
  const trendAr =
    signal.trend === "expanding"
      ? "توسع"
      : signal.trend === "contracting"
        ? "انكماش"
        : "مستقر";
  return insightRow({
    id: `mi-insight-ind-${signal.industry}`,
    title: `${signal.industry} segment momentum`,
    titleAr: `زخم قطاع ${signal.labelAr}`,
    summary: `${signal.accountCount} accounts, pipeline ${signal.pipelineValue}, trend ${signal.trend}`,
    summaryAr: `${signal.accountCount} حساب · مسار ${signal.pipelineValue} · ${trendAr}`,
    category: "industry",
    score: signal.score,
    confidence: Math.min(0.55 + signal.accountCount * 0.08 + signal.wonCount * 0.05, 0.92),
    severity: signal.severity,
    signalIds: [signal.id],
    recommendation: `Prioritize ${signal.industry} accounts while trend is ${signal.trend} — draft only.`,
    recommendationAr: `أولِّ حسابات ${signal.labelAr} بينما الاتجاه ${trendAr} — مسودة فقط.`,
  });
}

function buildCompetitorInsight(
  signal: CompetitorSignal & { score: number; severity: MarketInsight["severity"] },
): MarketInsight {
  return insightRow({
    id: `mi-insight-comp-${signal.competitorName}`,
    title: `Competitive pressure: ${signal.competitorName}`,
    titleAr: `ضغط تنافسي: ${signal.competitorName}`,
    summary: `${signal.mentionCount} mentions · threat ${signal.threatLevel}`,
    summaryAr: `${signal.mentionCount} إشارة · تهديد ${signal.threatLevel}`,
    category: "competitor",
    score: signal.score,
    confidence: Math.min(0.5 + signal.mentionCount * 0.1, 0.9),
    severity: signal.severity,
    signalIds: [signal.id],
    recommendation: `Prepare proof assets and human review for ${signal.competitorName} deals — recommendation only.`,
    recommendationAr: `جهّز أصول الإثبات ومراجعة بشرية لصفقات ${signal.competitorName} — توصية فقط.`,
  });
}

function buildGeneralInsight(signal: ScoredMarketSignal): MarketInsight {
  return insightRow({
    id: `mi-insight-gen-${signal.id}`,
    title: signal.label,
    titleAr: signal.labelAr,
    summary: signal.description,
    summaryAr: signal.descriptionAr,
    category: signal.category,
    score: signal.score,
    confidence: Math.min(0.45 + signal.score / 200, 0.85),
    severity: signal.severity,
    signalIds: [signal.id],
    recommendation: "Validate with account owner before adjusting market motion — draft only.",
    recommendationAr: "تحقق مع مالك الحساب قبل تعديل حركة السوق — مسودة فقط.",
  });
}

export function summarizeMarketIntelligence(
  scored: ReturnType<typeof scoreMarketSignals>,
): MarketInsight[] {
  const insights: MarketInsight[] = [];

  for (const industry of scored.industrySignals.slice(0, 4)) {
    insights.push(buildIndustryInsight(industry));
  }
  for (const competitor of scored.competitorSignals.slice(0, 4)) {
    insights.push(buildCompetitorInsight(competitor));
  }
  for (const signal of scored.general
    .filter((s) => s.severity !== "low")
    .slice(0, 6)) {
    insights.push(buildGeneralInsight(signal));
  }

  return insights.sort((a, b) => b.score - a.score).slice(0, 12);
}

export function buildMarketIntelligenceSnapshot(
  input: MarketIntelligenceInput,
): MarketIntelligenceSnapshot {
  const collected = collectMarketSignals(input);
  const categorized = categorizeMarketSignals(collected, {
    accounts: input.accounts,
    opportunities: input.opportunities,
    competitorMentions: input.competitorMentions,
  });
  const scored = scoreMarketSignals(categorized);
  const insights = summarizeMarketIntelligence(scored);
  const overallScore = computeOverallMarketScore(scored);

  return {
    organizationId: input.organizationId,
    collectedAt: new Date().toISOString(),
    signals: collected,
    industrySignals: scored.industrySignals,
    competitorSignals: scored.competitorSignals,
    insights,
    overallScore,
    topIndustry: scored.industrySignals[0],
    topCompetitor: scored.competitorSignals[0],
    disclaimerAr: MARKET_INTEL_DISCLAIMER_AR,
    disclaimerEn: MARKET_INTEL_DISCLAIMER_EN,
  };
}
