import {
  buildProofEffectivenessAnalysis,
  buildProofEffectivenessSnapshot,
  buildProofEffectivenessWaveBSnapshot,
  filterProofEffectivenessForOpportunity,
  loadProofEffectivenessSnapshot,
  readProofEffectivenessInput,
  toProofEffectivenessWidgetSummary,
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
  PROOF_EFFECTIVENESS_RECOMMENDATION_LABEL,
} from "../vnext/proof-effectiveness";
import { listAccounts, listProofAssetsForOpportunity } from "../store";

export type {
  ProofEffectivenessAnalysis,
  ProofEffectivenessEnrichedRow,
  ProofEffectivenessGap,
  ProofEffectivenessRecommendation,
  ProofEffectivenessSnapshot,
  ProofEffectivenessWidgetSummary,
} from "../vnext/proof-effectiveness";

export {
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
  PROOF_EFFECTIVENESS_RECOMMENDATION_LABEL,
  buildProofEffectivenessSnapshot,
  getMostEffectiveProofAssets,
  loadProofEffectivenessSnapshot,
  readProofEffectivenessInput,
  toProofEffectivenessWidgetSummary,
} from "../vnext/proof-effectiveness";

export function salesBuildProofEffectivenessAnalysis(organizationId: string) {
  const input = readProofEffectivenessInput(organizationId);
  return buildProofEffectivenessAnalysis({
    ...input,
    accounts: listAccounts(organizationId),
  });
}

export const salesBuildProofEffectivenessWaveB = salesBuildProofEffectivenessAnalysis;

export function salesGetProofEffectivenessForOpportunity(
  organizationId: string,
  opportunityId: string,
) {
  const waveB = salesBuildProofEffectivenessWaveB(organizationId);
  const linked = listProofAssetsForOpportunity(organizationId, opportunityId);
  const linkedAssetIds = new Set(linked.map((asset) => asset.id));
  return filterProofEffectivenessForOpportunity(waveB, linkedAssetIds);
}

export function salesLoadProofEffectivenessSnapshot(organizationId: string) {
  return loadProofEffectivenessSnapshot(organizationId);
}
