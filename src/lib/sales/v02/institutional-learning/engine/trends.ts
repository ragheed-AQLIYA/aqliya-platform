// SalesOS v0.2 Institutional Learning — trend derivation

import type {
  InstitutionalLearningInput,
  InstitutionalLearningTrend,
} from "../types";
import { evidence, MS_30_DAYS } from "./common";

export function deriveTrends(
  input: InstitutionalLearningInput,
): InstitutionalLearningTrend[] {
  const trends: InstitutionalLearningTrend[] = [];
  const now = Date.now();
  const recentActs = input.activities.filter(
    (a) => now - new Date(a.loggedAt).getTime() <= MS_30_DAYS,
  );
  const priorActs = input.activities.filter(
    (a) => now - new Date(a.loggedAt).getTime() > MS_30_DAYS,
  );

  const recentCount = recentActs.length;
  const priorCount = priorActs.length;
  let activityDirection: InstitutionalLearningTrend["direction"] =
    "insufficient_data";
  if (recentCount + priorCount >= 3) {
    if (recentCount > priorCount) activityDirection = "up";
    else if (recentCount < priorCount) activityDirection = "down";
    else activityDirection = "stable";
  }
  trends.push({
    id: "trend-activity-volume",
    metric: "Logged activities (30d vs prior)",
    metricAr: "الأنشطة المسجلة (٣٠ يومًا مقابل السابق)",
    direction: activityDirection,
    currentValue: recentCount,
    priorValue: priorCount,
    confidence: recentCount + priorCount >= 3 ? 0.62 : 0.35,
    evidence: [...recentActs, ...priorActs].slice(0, 6).map((a) =>
      evidence({
        source: "activity",
        refId: a.id,
        summary: a.summary.slice(0, 80),
      }),
    ),
    outputStatus: "recommendation",
  });

  const won = (input.wonDeals ?? []).length;
  const lost = (input.lostDeals ?? []).length;
  const total = won + lost;
  const winRate = total > 0 ? won / total : 0;
  trends.push({
    id: "trend-win-rate",
    metric: "Closed win rate",
    metricAr: "معدل الفوز على الصفقات المغلقة",
    direction:
      total < 2
        ? "insufficient_data"
        : winRate >= 0.5
          ? "up"
          : "down",
    currentValue: Math.round(winRate * 100),
    confidence: total >= 3 ? 0.7 : 0.4,
    evidence: [
      ...(input.wonDeals ?? []).slice(0, 3).map((d) =>
        evidence({
          source: "won_deal",
          refId: d.opportunityId,
          summary: `Won: ${d.name}`,
          summaryAr: `فوز: ${d.name}`,
        }),
      ),
      ...(input.lostDeals ?? []).slice(0, 3).map((d) =>
        evidence({
          source: "lost_deal",
          refId: d.opportunityId,
          summary: `Lost: ${d.name}`,
          summaryAr: `خسارة: ${d.name}`,
        }),
      ),
    ],
    outputStatus: "recommendation",
  });

  const strongSignals = input.signals.filter(
    (s) => s.strength === "strong",
  );
  trends.push({
    id: "trend-strong-signals",
    metric: "Strong buying signals",
    metricAr: "إشارات شراء قوية",
    direction:
      strongSignals.length >= 3
        ? "up"
        : strongSignals.length === 0
          ? "down"
          : "stable",
    currentValue: strongSignals.length,
    confidence: strongSignals.length >= 2 ? 0.68 : 0.42,
    evidence: strongSignals.slice(0, 5).map((s) =>
      evidence({
        source: "signal",
        refId: s.id,
        summary: s.description,
      }),
    ),
    outputStatus: "recommendation",
  });

  return trends;
}
