// SalesOS v0.2 Institutional Learning — recommendation derivation

import type {
  InstitutionalLearningInput,
  InstitutionalLearningInsight,
  InstitutionalLearningPattern,
  InstitutionalLearningRecommendation,
} from "../types";
import { evidence } from "./common";

export function deriveRecommendations(
  patterns: InstitutionalLearningPattern[],
  insights: InstitutionalLearningInsight[],
  input: InstitutionalLearningInput,
): InstitutionalLearningRecommendation[] {
  const recs: InstitutionalLearningRecommendation[] = [];

  for (const pattern of patterns.slice(0, 5)) {
    if (pattern.evidence.length === 0) continue;
    recs.push({
      id: `rec-pattern-${pattern.id}`,
      priority: pattern.patternType === "loss_theme" ? "high" : "medium",
      title: pattern.recommendation,
      titleAr: pattern.recommendationAr,
      reasoning: `Pattern "${pattern.label}" repeated ${pattern.count} times with linked evidence.`,
      reasoningAr: `النمط "${pattern.labelAr}" تكرر ${pattern.count} مرات مع أدلة مرتبطة.`,
      confidence: pattern.confidence,
      evidence: pattern.evidence,
      outputStatus: "recommendation",
    });
  }

  const winTrend = insights.find((i) => i.id === "insight-top-win-theme");
  if (winTrend) {
    recs.push({
      id: "rec-scale-win-playbook",
      priority: "medium",
      title: "Codify win playbook from recurring themes",
      titleAr: "وثّق دليل الفوز من الأنماط المتكررة",
      reasoning: winTrend.narrative,
      reasoningAr: winTrend.narrativeAr,
      confidence: winTrend.confidence,
      evidence: winTrend.evidence,
      outputStatus: "recommendation",
    });
  }

  if (
    (input.lostDeals ?? []).length > (input.wonDeals ?? []).length &&
    (input.lostDeals ?? []).length >= 2
  ) {
    const lossEv = (input.lostDeals ?? []).slice(0, 4).map((d) =>
      evidence({
        source: "lost_deal",
        refId: d.opportunityId,
        summary: `Lost: ${d.name}`,
        summaryAr: `خسارة: ${d.name}`,
      }),
    );
    recs.push({
      id: "rec-loss-review",
      priority: "high",
      title: "Schedule institutional loss review",
      titleAr: "جدولة مراجعة خسارة مؤسسية",
      reasoning: `Loss count (${(input.lostDeals ?? []).length}) exceeds wins (${(input.wonDeals ?? []).length}) in current snapshot.`,
      reasoningAr: `الخسائر (${(input.lostDeals ?? []).length}) تتجاوز الفوز (${(input.wonDeals ?? []).length}) في هذه اللقطة.`,
      confidence: 0.72,
      evidence: lossEv,
      outputStatus: "recommendation",
    });
  }

  return recs
    .filter((r) => r.evidence.length > 0)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
}
