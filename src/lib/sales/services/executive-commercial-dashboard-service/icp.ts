import type { ICPLearningSnapshot } from "@/lib/sales/vnext/icp-learning";
import type { ExecutiveCommercialIcp } from "./types";
import { pct, type ExecutiveCommercialSection } from "./common";

export function buildIcpSection(
  snapshot: ICPLearningSnapshot | null,
  error?: unknown,
): ExecutiveCommercialSection<ExecutiveCommercialIcp> {
  if (error) {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحميل ICP — راجع /sales/icp.",
      data: null,
    };
  }
  if (!snapshot) {
    return { status: "empty", data: null };
  }

  const topFitSegments = snapshot.icpFit.slice(0, 4).map((row) => ({
    labelAr: row.labelAr,
    pct: row.pct,
  }));

  const reviewQueueCount =
    snapshot.winLossPatterns.filter((r) => r.confidence < 0.6).length +
    snapshot.storedInsights.filter((r) => r.confidence < 0.55).length;

  return {
    status: "ok",
    data: {
      hypothesisAr: snapshot.currentHypothesis.recommendationAr,
      overallConfidencePct: pct(snapshot.overallConfidence),
      topFitSegments,
      reviewQueueCount,
    },
  };
}
