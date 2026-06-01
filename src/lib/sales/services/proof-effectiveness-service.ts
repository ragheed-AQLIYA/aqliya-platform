import {
  buildProofEffectivenessAnalysis,
  buildProofEffectivenessSnapshot,
  loadProofEffectivenessSnapshot,
  readProofEffectivenessInput,
  toProofEffectivenessWidgetSummary,
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
  PROOF_EFFECTIVENESS_RECOMMENDATION_LABEL,
} from "../vnext/proof-effectiveness";
import { listAccounts } from "../store";

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

export function salesLoadProofEffectivenessSnapshot(organizationId: string) {
  return loadProofEffectivenessSnapshot(organizationId);
}
