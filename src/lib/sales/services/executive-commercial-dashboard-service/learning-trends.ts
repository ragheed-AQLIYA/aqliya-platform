import type { InstitutionalLearningSnapshot } from "@/lib/sales/v02/institutional-learning";
import type { ICPLearningSnapshot } from "@/lib/sales/vnext/icp-learning";
import type { ExecutiveCommercialLearningTrend } from "./types";
import { pct, type ExecutiveCommercialSection } from "./common";

function mapInstitutionalTrendDirection(
  direction: InstitutionalLearningSnapshot["trends"][number]["direction"],
): ExecutiveCommercialLearningTrend["direction"] {
  if (direction === "insufficient_data") return "insufficient_data";
  return direction;
}

export function buildLearningTrendsSection(
  institutional: InstitutionalLearningSnapshot | null,
  icpSnapshot: ICPLearningSnapshot | null,
  institutionalError?: unknown,
  icpError?: unknown,
): ExecutiveCommercialSection<ExecutiveCommercialLearningTrend[]> {
  if (institutionalError && icpError) {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر استنتاج اتجاهات التعلم.",
      data: [],
    };
  }

  const trends: ExecutiveCommercialLearningTrend[] = [];

  if (institutional) {
    for (const row of institutional.trends.slice(0, 4)) {
      trends.push({
        id: row.id,
        labelAr: row.metricAr,
        direction: mapInstitutionalTrendDirection(row.direction),
        confidencePct: pct(row.confidence),
        summaryAr: `${row.metricAr}: ${row.currentValue}${row.priorValue != null ? ` (سابق ${row.priorValue})` : ""}`,
      });
    }
    for (const pattern of institutional.patterns.slice(0, 2)) {
      trends.push({
        id: pattern.id,
        labelAr: pattern.labelAr,
        direction: pattern.patternType === "loss_theme" ? "down" : "up",
        confidencePct: pct(pattern.confidence),
        summaryAr: pattern.recommendationAr,
      });
    }
  }

  if (trends.length < 3 && icpSnapshot) {
    if (icpSnapshot.overallConfidence > 0) {
      trends.push({
        id: "icp-overall",
        labelAr: "ثقة ICP الإجمالية",
        direction:
          icpSnapshot.overallConfidence >= 0.6
            ? "up"
            : icpSnapshot.overallConfidence < 0.45
              ? "down"
              : "stable",
        confidencePct: pct(icpSnapshot.overallConfidence),
        summaryAr: icpSnapshot.currentHypothesis.recommendationAr,
      });
    }
  }

  if (trends.length === 0) {
    return {
      status: "empty",
      fallbackMessageAr: "لا اتجاهات تعلم كافية — أغلق صفقات أو سجّل تفاعلات.",
      data: [],
    };
  }
  return { status: "ok", data: trends.slice(0, 6) };
}
