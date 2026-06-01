// ─── SalesOS Tier B1 intelligence persistence (Prisma hydrate maps) ───
// B1: SalesMarketSignal, SalesCommercialRecommendation

import "server-only";
import type {
  SalesCommercialRecommendation,
  SalesMarketSignal,
} from "./types";

/** Tier B1 entity maps merged on Prisma load. */
export interface TierB1IntelligenceMaps {
  marketSignals: Map<string, SalesMarketSignal>;
  commercialRecommendations: Map<string, SalesCommercialRecommendation>;
}

export function emptyTierB1Maps(): TierB1IntelligenceMaps {
  return {
    marketSignals: new Map(),
    commercialRecommendations: new Map(),
  };
}
