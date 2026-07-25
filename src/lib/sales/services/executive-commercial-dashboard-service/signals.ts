import {
  salesBuildCommercialMemorySnapshot,
  salesGetTopSignals,
} from "@/lib/sales/services/commercial-memory-service";
import type { WaveAInstitutionalSignal } from "@/lib/sales/vnext/cross-product-signals";
import type { WaveBMarketIntelligenceView } from "@/lib/sales/vnext/market-intelligence";
import type { ExecutiveCommercialSignal } from "./types";
import type { ExecutiveCommercialSection } from "./common";

export function buildSignalsSection(
  orgId: string,
  market: WaveBMarketIntelligenceView | null,
  crossProduct: WaveAInstitutionalSignal[] | null,
): ExecutiveCommercialSection<ExecutiveCommercialSignal[]> {
  try {
    const merged: ExecutiveCommercialSignal[] = [];

    if (crossProduct && crossProduct.length > 0) {
      for (const signal of crossProduct.slice(0, 4)) {
        merged.push({
          label: signal.titleAr,
          count: signal.severity === "high" ? 3 : signal.severity === "medium" ? 2 : 1,
          source: `cross-product:${signal.waveAKind}`,
        });
      }
    }

    if (market) {
      for (const signal of market.topMarketSignals.slice(0, 3)) {
        merged.push({
          label: signal.labelAr ?? signal.label,
          count: Math.round(signal.score),
          source: "market-intelligence",
        });
      }
    }

    const ranked = salesGetTopSignals(orgId, 6);
    const memory = salesBuildCommercialMemorySnapshot(orgId);
    const memorySignals = ranked.length > 0 ? ranked : memory.topSignals.slice(0, 6);

    for (const item of memorySignals.slice(0, 4)) {
      merged.push({
        label: item.label,
        count: item.count,
        source: item.source,
      });
    }

    const deduped = merged.filter(
      (row, index, arr) =>
        arr.findIndex((other) => other.label === row.label && other.source === row.source) ===
        index,
    );

    if (deduped.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا إشارات تجارية مسجلة بعد.",
        data: [],
      };
    }

    return { status: "ok", data: deduped.slice(0, 10) };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر استخراج الإشارات من الذاكرة التجارية.",
      data: [],
    };
  }
}
