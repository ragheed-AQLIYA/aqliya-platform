import type { IntelligenceLevel, IntelligenceSignal } from "@/lib/platform/intelligence";
import {
  buildCommercialMemorySnapshot,
  getCompetitorMentions,
  getTopObjections,
  getTopSignals,
  getWinLossPatterns,
  type CommercialMemorySnapshot,
  type CompetitorMemoryItem,
  type RankedMemoryItem,
  type WinLossPattern,
} from "../vnext/commercial-memory";
import type { SalesObjectionSignal } from "../types";
import {
  listAllInteractions,
  listCompetitorMentions,
  listObjections,
  listOpportunities,
  listSignals,
  listWinLossInsights,
} from "../store";

export function mapRankedToObjectionSignals(
  items: RankedMemoryItem[],
): SalesObjectionSignal[] {
  return items.map((item, idx) => ({
    id: `vnext-obj-${idx}`,
    labelAr: item.label,
    count: item.count,
    source: item.source === "interaction" ? "interaction" : "derived",
  }));
}

export function mapRankedToIntelligenceSignals(
  items: RankedMemoryItem[],
): IntelligenceSignal[] {
  return items.map((item, idx) => {
    const level: IntelligenceLevel =
      item.count >= 3 ? "high" : item.count >= 2 ? "medium" : "low";
    return {
      id: `vnext-sig-${idx}`,
      dimension: "pipeline_quality",
      level,
      value: Math.min(100, item.count * 25),
      confidence: 0.65,
      label: item.label,
      description: `Commercial memory (${item.source}) — draft only`,
      module: "sales",
      timestamp: new Date(),
      source: "derived",
    };
  });
}

function loadCommercialMemoryInputs(organizationId: string) {
  return {
    organizationId,
    interactions: listAllInteractions(organizationId),
    opportunities: listOpportunities(organizationId),
    objections: listObjections(organizationId),
    signals: listSignals(organizationId),
    competitors: listCompetitorMentions(organizationId),
    winLoss: listWinLossInsights(organizationId),
  };
}

export function salesBuildCommercialMemorySnapshot(
  organizationId: string,
): CommercialMemorySnapshot {
  return buildCommercialMemorySnapshot(loadCommercialMemoryInputs(organizationId));
}

export function salesGetTopObjections(
  organizationId: string,
  limit = 5,
): RankedMemoryItem[] {
  const input = loadCommercialMemoryInputs(organizationId);
  return getTopObjections({
    objections: input.objections,
    interactions: input.interactions,
    limit,
  });
}

export function salesGetTopSignals(
  organizationId: string,
  limit = 5,
): RankedMemoryItem[] {
  const input = loadCommercialMemoryInputs(organizationId);
  return getTopSignals({
    signals: input.signals,
    interactions: input.interactions,
    limit,
  });
}

export function salesGetCompetitorMentions(
  organizationId: string,
  limit = 8,
): CompetitorMemoryItem[] {
  const input = loadCommercialMemoryInputs(organizationId);
  return getCompetitorMentions({
    competitors: input.competitors,
    interactions: input.interactions,
    limit,
  });
}

export function salesGetWinLossPatterns(
  organizationId: string,
): WinLossPattern[] {
  const input = loadCommercialMemoryInputs(organizationId);
  return getWinLossPatterns({
    winLoss: input.winLoss,
    opportunities: input.opportunities,
    interactions: input.interactions,
  });
}
