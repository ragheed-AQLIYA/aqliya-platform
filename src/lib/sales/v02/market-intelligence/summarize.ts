import { countSignalsByCategory } from "./categorize";
import type {
  CompetitorSignal,
  IndustrySignal,
  MarketInsight,
  MarketInsightType,
  MarketSignal,
} from "./types";

export interface SummarizeMarketIntelligenceInput {
  organizationId: string;
  marketSignals: MarketSignal[];
  industrySignals: IndustrySignal[];
  competitorSignals: CompetitorSignal[];
}

function clampConfidence(value: number): number {
  return Math.max(0.35, Math.min(0.95, value));
}

function buildInsight(
  organizationId: string,
  insightType: MarketInsightType,
  title: string,
  titleAr: string,
  summary: string,
  summaryAr: string,
  score: number,
  confidence: number,
  evidence: string[],
): MarketInsight {
  return {
    id: `mi-insight-${insightType}-${title.slice(0, 24).replace(/\s+/g, "-").toLowerCase()}`,
    organizationId,
    insightType,
    title,
    titleAr,
    summary,
    summaryAr,
    score,
    confidence: clampConfidence(confidence),
    outputStatus: "recommendation",
    evidence: evidence.slice(0, 5),
  };
}

/** Summarize scored signals into draft market insights (rules only). */
export function summarizeMarketIntelligence(
  input: SummarizeMarketIntelligenceInput,
): MarketInsight[] {
  const insights: MarketInsight[] = [];
  const categoryCounts = countSignalsByCategory(input.marketSignals);

  const topIndustry = input.industrySignals[0];
  if (topIndustry && topIndustry.score >= 45) {
    insights.push(
      buildInsight(
        input.organizationId,
        "industry_momentum",
        `${topIndustry.industry} shows strongest pipeline momentum`,
        `${topIndustry.labelAr} — أقوى زخم في خط الأنابيب`,
        `${topIndustry.accountCount} accounts, ${topIndustry.activeOpportunityCount} active opportunities, pipeline ${topIndustry.pipelineValue.toLocaleString()}.`,
        `${topIndustry.accountCount} حسابات، ${topIndustry.activeOpportunityCount} فرص نشطة.`,
        topIndustry.score,
        0.55 + topIndustry.winCount * 0.05,
        topIndustry.evidence,
      ),
    );
  }

  const topCompetitor = input.competitorSignals[0];
  if (topCompetitor && topCompetitor.mentionCount >= 1) {
    insights.push(
      buildInsight(
        input.organizationId,
        "competitive_pressure",
        `Competitive pressure: ${topCompetitor.competitorName}`,
        `ضغط تنافسي: ${topCompetitor.competitorName}`,
        `${topCompetitor.mentionCount} mentions across ${topCompetitor.accountIds.length} accounts (${topCompetitor.threatLevel} threat).`,
        `${topCompetitor.mentionCount} إشارة عبر ${topCompetitor.accountIds.length} حسابات.`,
        topCompetitor.score,
        0.5 + topCompetitor.mentionCount * 0.06,
        topCompetitor.contexts,
      ),
    );
  }

  const timingSignals = categoryCounts.timing + categoryCounts.buying;
  if (timingSignals >= 2) {
    const evidence = input.marketSignals
      .filter((s) => s.category === "timing" || s.category === "buying")
      .map((s) => s.label)
      .slice(0, 4);
    insights.push(
      buildInsight(
        input.organizationId,
        "market_timing",
        "Active buying and timing signals cluster",
        "تجمع إشارات التوقيت والشراء",
        `${timingSignals} buying/timing signals detected — prioritize follow-up while motion is active.`,
        `${timingSignals} إشارات شراء/توقيت — أولوية المتابعة أثناء الحركة النشطة.`,
        Math.min(90, 40 + timingSignals * 8),
        0.52 + timingSignals * 0.04,
        evidence,
      ),
    );
  }

  const riskSignals = categoryCounts.risk + categoryCounts.budget;
  const riskyIndustry = input.industrySignals.find((i) => i.lossCount >= 1);
  if (riskSignals >= 2 || riskyIndustry) {
    const evidence = [
      ...input.marketSignals
        .filter((s) => s.category === "risk" || s.category === "budget")
        .map((s) => s.label),
      ...(riskyIndustry ? riskyIndustry.evidence : []),
    ].slice(0, 4);
    insights.push(
      buildInsight(
        input.organizationId,
        "sector_risk",
        riskyIndustry
          ? `${riskyIndustry.industry} sector shows loss friction`
          : "Budget and competitive risk signals elevated",
        riskyIndustry
          ? `قطاع ${riskyIndustry.industry} — احتكاك خسارة`
          : "إشارات مخاطر ميزانية وتنافسية مرتفعة",
        riskyIndustry
          ? `${riskyIndustry.lossCount} losses vs ${riskyIndustry.winCount} wins in sector.`
          : `${riskSignals} risk/budget signals — validate qualification gates.`,
        riskyIndustry
          ? `${riskyIndustry.lossCount} خسائر مقابل ${riskyIndustry.winCount} انتصارات.`
          : `${riskSignals} إشارات مخاطر — تحقق من بوابات التأهيل.`,
        riskyIndustry ? riskyIndustry.score - 10 : 50 + riskSignals * 5,
        0.58,
        evidence,
      ),
    );
  }

  return insights.sort((a, b) => b.score - a.score);
}
