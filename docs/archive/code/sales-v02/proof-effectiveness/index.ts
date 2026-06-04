// @ts-nocheck
import {
  buildProofEffectivenessSnapshot,
  getMostEffectiveProofAssets,
  type ProofEffectivenessInput,
} from "./analytics";
import { readProofEffectivenessInput } from "./store-loader";
import { toProofEffectivenessWidgetSummary } from "./widget";
import {
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
  type ProofAssetEffectivenessRow,
  type ProofEffectivenessSnapshot,
  type ProofEffectivenessSummary,
  type ProofEffectivenessWidgetSummary,
  type ProofUsageMetrics,
  type WinContributionMetrics,
  type ObjectionResolutionMetrics,
  type OppInfluenceMetrics,
  type ProofEffectivenessEvidenceItem,
} from "./types";

export {
  buildProofEffectivenessSnapshot,
  getMostEffectiveProofAssets,
  toProofEffectivenessWidgetSummary,
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
  type ProofEffectivenessInput,
  type ProofEffectivenessSnapshot,
  type ProofEffectivenessSummary,
  type ProofEffectivenessWidgetSummary,
  type ProofUsageMetrics,
  type WinContributionMetrics,
  type ObjectionResolutionMetrics,
  type OppInfluenceMetrics,
  type ProofEffectivenessEvidenceItem,
  type ProofAssetEffectivenessRow,
};

// v0.2 archived aliases — match test import expectations
export function computeProofAssetEffectiveness(
  input: ProofEffectivenessInput,
): ProofAssetEffectivenessRow[] {
  return buildProofEffectivenessSnapshot(input).rankedAssets;
}

export function analyzeOrgProofEffectiveness(
  organizationId: string,
): ProofEffectivenessSnapshot {
  const input = readProofEffectivenessInput(organizationId);
  return buildProofEffectivenessSnapshot(input);
}

export function buildProofEffectivenessReport(
  input: ProofEffectivenessInput,
): ProofEffectivenessSnapshot {
  return buildProofEffectivenessSnapshot(input);
}

export function getTopProofAssets(
  rankedAssets: ProofAssetEffectivenessRow[],
  limit?: number,
): ProofAssetEffectivenessRow[] {
  return rankedAssets.slice(0, limit ?? 10);
}

export { loadProofEffectivenessSnapshot, readProofEffectivenessInput } from "./store-loader";
