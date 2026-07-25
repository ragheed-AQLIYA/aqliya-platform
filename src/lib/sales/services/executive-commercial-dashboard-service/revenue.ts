import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";
import type { ExecutiveCommercialRevenue } from "./types";
import { pct, type ExecutiveCommercialSection } from "./common";

export function buildRevenueSection(
  revenue: RevenueIntelligenceSnapshot | null,
  error?: unknown,
): ExecutiveCommercialSection<ExecutiveCommercialRevenue> {
  if (error) {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحميل ذكاء الإيرادات — عرض ملخص محدود.",
      data: null,
    };
  }
  if (!revenue || revenue.totalPipeline === 0) {
    return {
      status: "empty",
      fallbackMessageAr: "لا توجد بيانات إيرادات كافية بعد.",
      data: null,
    };
  }
  return {
    status: "ok",
    data: {
      totalPipeline: revenue.totalPipeline,
      weightedForecast: revenue.weightedForecast,
      forecastConfidence: revenue.forecastConfidence,
      pipelineCoverageLevel: revenue.pipelineCoverage.level,
      pipelineCoverageLabelAr: revenue.pipelineCoverage.labelAr,
      coverageRatioPct: pct(revenue.pipelineCoverage.ratio),
      wonCount: revenue.won.count,
      wonValue: revenue.won.value,
      lostCount: revenue.lost.count,
      lostValue: revenue.lost.value,
      riskFlagCount: revenue.riskFlags.length,
      noteCount: revenue.revenueNotes.length,
    },
  };
}
