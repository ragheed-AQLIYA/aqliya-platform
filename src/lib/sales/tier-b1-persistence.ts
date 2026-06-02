// ─── SalesOS Tier B1 intelligence persistence (Prisma hydrate maps) ───
// B1: SalesMarketSignal, SalesCommercialRecommendation

import "server-only";

// Types defined locally until promoted to types.ts
export interface SalesMarketSignal {
  id: string;
  organizationId: string;
  type: string;
  description: string;
  severity?: string;
  source?: string;
  detectedAt: string;
  createdById?: string;
  createdAt: string;
}
export interface SalesCommercialRecommendation {
  id: string;
  organizationId: string;
  dealId?: string;
  recommendation: string;
  rationale: string;
  confidence: number;
  status: string;
  createdById: string;
  createdAt: string;
}

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
