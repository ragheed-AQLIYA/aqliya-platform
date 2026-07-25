import { salesGetCommercialRecommendations } from "@/lib/sales/services/commercial-recommendations-service";
import type { CommercialRecommendation } from "@/lib/sales/vnext/commercial-recommendations";
import type { ExecutiveCommercialRecommendationRow } from "./types";
import { pct, type ExecutiveCommercialSection } from "./common";

export function buildRecommendationsSection(
  orgId: string,
): ExecutiveCommercialSection<ExecutiveCommercialRecommendationRow[]> {
  try {
    const snapshot = salesGetCommercialRecommendations(orgId);
    const rows = snapshot.recommendations.slice(0, 8).map((rec) => ({
      id: rec.id,
      titleAr: rec.titleAr,
      priority: rec.priority,
      reasoningAr: rec.reasoningAr,
      category: rec.category,
      confidencePct: pct(rec.confidence),
      href: rec.href,
    }));

    if (rows.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا توصيات استراتيجية حالية — مسار نظيف أو بيانات ناقصة.",
        data: [],
      };
    }
    return { status: "ok", data: rows };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر توليد التوصيات التجارية.",
      data: [],
    };
  }
}
