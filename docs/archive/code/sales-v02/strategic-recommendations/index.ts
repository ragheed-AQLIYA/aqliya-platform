// @ts-nocheck
export {
  STRATEGIC_DISCLAIMER_AR,
  STRATEGIC_DISCLAIMER_COMPACT_AR,
  STRATEGIC_DISCLAIMER_EN,
  STRATEGIC_RECOMMENDATION_LABEL,
} from "./disclaimers";
export { STRATEGIC_RULE_IDS } from "./rules";
export {
  buildStrategicRecommendationsSnapshot,
  loadStrategicRecommendationsFromStore,
} from "./engine";
export type { StrategicRecommendationsInput } from "./engine";
export type {
  StrategicEvidenceItem,
  StrategicRecommendation,
  StrategicRecommendationCategory,
  StrategicRecommendationsSnapshot,
} from "./types";
export { STRATEGIC_RECOMMENDATION_CATEGORIES } from "./types";
