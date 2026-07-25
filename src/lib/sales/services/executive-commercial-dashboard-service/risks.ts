import { salesGetCommercialRecommendations } from "@/lib/sales/services/commercial-recommendations-service";
import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";
import type { WaveAInstitutionalSignal } from "@/lib/sales/vnext/cross-product-signals";
import type { WaveBMarketIntelligenceView } from "@/lib/sales/vnext/market-intelligence";
import type { ExecutiveCommercialRisk } from "./types";
import type { ExecutiveCommercialSection } from "./common";

export function buildExecutiveRisksSection(
  revenue: RevenueIntelligenceSnapshot | null,
  commercialRecs: ReturnType<typeof salesGetCommercialRecommendations> | null,
  crossProduct: WaveAInstitutionalSignal[] | null,
  market: WaveBMarketIntelligenceView | null,
): ExecutiveCommercialSection<ExecutiveCommercialRisk[]> {
  try {
    const risks: ExecutiveCommercialRisk[] = [];

    if (revenue) {
      for (const flag of revenue.riskFlags.slice(0, 5)) {
        risks.push({
          id: flag.id,
          labelAr: flag.labelAr,
          severity: flag.severity,
          source: "revenue-intelligence",
          href: flag.opportunityId ? `/sales/opportunities/${flag.opportunityId}` : "/sales/revenue",
        });
      }
    }

    if (commercialRecs) {
      for (const rec of commercialRecs.byCategory.opps_at_risk.slice(0, 4)) {
        risks.push({
          id: rec.id,
          labelAr: rec.titleAr,
          severity: rec.priority === "high" ? "high" : rec.priority === "medium" ? "medium" : "low",
          source: "commercial-recommendations",
          href: rec.href ?? (rec.opportunityId ? `/sales/opportunities/${rec.opportunityId}` : "/sales"),
        });
      }
    }

    if (crossProduct) {
      for (const signal of crossProduct.filter((s) => s.severity === "high").slice(0, 3)) {
        risks.push({
          id: signal.id,
          labelAr: signal.titleAr,
          severity: "high",
          source: `cross-product:${signal.waveAKind}`,
        });
      }
    }

    if (market) {
      for (const competitor of market.topCompetitorSignals
        .filter((c) => c.threatLevel === "high")
        .slice(0, 2)) {
        risks.push({
          id: competitor.id,
          labelAr: `منافس: ${competitor.competitorName}`,
          severity: "medium",
          source: "market-intelligence",
        });
      }
    }

    const deduped = risks.filter(
      (row, index, arr) => arr.findIndex((other) => other.id === row.id) === index,
    );

    if (deduped.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا مخاطر تنفيذية مُعلّمة حالياً — راقب المسار والإشارات.",
        data: [],
      };
    }

    return { status: "ok", data: deduped.slice(0, 10) };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تجميع المخاطر التنفيذية.",
      data: [],
    };
  }
}
