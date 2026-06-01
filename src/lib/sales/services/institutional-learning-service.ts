import {
  buildWaveCInstitutionalLearningSnapshot,
  type ContentAssetRef,
  type InstitutionalLearningSnapshot,
  type WaveCInstitutionalLearningView,
} from "../vnext/institutional-learning";
import { salesGetMarketIntelligenceForOrg } from "./market-intelligence-service";
import {
  listActivities,
  listAllInteractions,
  listObjections,
  listOpportunities,
  listProofAssets,
  listSignals,
  listWinLossInsights,
} from "../store";

export type {
  ContentAssetRef,
  InstitutionalLearningSnapshot,
  WaveCInstitutionalLearningView,
};

export {
  INSTITUTIONAL_LEARNING_WAVE_C_RECOMMENDATION_LABEL,
  INSTITUTIONAL_LEARNING_WAVE_C_DISCLAIMER_EN,
  INSTITUTIONAL_LEARNING_WAVE_C_DISCLAIMER_AR,
  buildInstitutionalLearningEvidenceMap,
  computeAggregateInstitutionalConfidence,
  buildWaveCInstitutionalLearningSnapshot,
} from "../vnext/institutional-learning";

function loadInstitutionalLearningInputs(
  organizationId: string,
  contentAssetRefs?: ContentAssetRef[],
) {
  return {
    organizationId,
    winLossInsights: listWinLossInsights(organizationId),
    opportunities: listOpportunities(organizationId),
    activities: listActivities(organizationId),
    interactions: listAllInteractions(organizationId),
    signals: listSignals(organizationId),
    proofAssets: listProofAssets(organizationId),
    objections: listObjections(organizationId),
    contentAssetRefs,
  };
}

export function salesBuildInstitutionalLearningSnapshot(
  organizationId: string,
  contentAssetRefs?: ContentAssetRef[],
): InstitutionalLearningSnapshot {
  return buildWaveCInstitutionalLearningSnapshot({
    ...loadInstitutionalLearningInputs(organizationId, contentAssetRefs),
    marketIntelligence: salesGetMarketIntelligenceForOrg(organizationId),
  });
}

export function salesGetInstitutionalLearningForOrg(
  organizationId: string,
  contentAssetRefs?: ContentAssetRef[],
): WaveCInstitutionalLearningView {
  return buildWaveCInstitutionalLearningSnapshot({
    ...loadInstitutionalLearningInputs(organizationId, contentAssetRefs),
    marketIntelligence: salesGetMarketIntelligenceForOrg(organizationId),
  });
}
