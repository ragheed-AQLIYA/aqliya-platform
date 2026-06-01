import {
  buildCommercialRecommendationsSnapshot,
  loadCommercialRecommendationsFromStore,
  transformStrategicToCommercialSnapshot,
  type CommercialRecommendation,
  type CommercialRecommendationCategory,
  type CommercialRecommendationsSnapshot,
} from "../vnext/commercial-recommendations";
import type { StrategicRecommendationsInput } from "../v02/strategic-recommendations";

export type {
  CommercialRecommendation,
  CommercialRecommendationCategory,
  CommercialRecommendationsSnapshot,
};

export function salesGetCommercialRecommendations(
  organizationId: string,
  now?: Date,
): CommercialRecommendationsSnapshot {
  return loadCommercialRecommendationsFromStore(organizationId, now);
}

export function salesBuildCommercialRecommendations(
  input: StrategicRecommendationsInput,
): CommercialRecommendationsSnapshot {
  return buildCommercialRecommendationsSnapshot(input);
}

export function salesTransformStrategicRecommendations(
  strategic: Parameters<typeof transformStrategicToCommercialSnapshot>[0],
): CommercialRecommendationsSnapshot {
  return transformStrategicToCommercialSnapshot(strategic);
}

export function salesFilterCommercialByCategory(
  snapshot: CommercialRecommendationsSnapshot,
  category: CommercialRecommendationCategory,
): CommercialRecommendation[] {
  return snapshot.byCategory[category];
}
