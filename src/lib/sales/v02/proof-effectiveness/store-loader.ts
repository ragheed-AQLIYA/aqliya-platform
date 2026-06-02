// @ts-nocheck
import {
  listAllInteractions,
  listObjections,
  listOpportunities,
  listProofAssets,
  listWinLossInsights,
} from "../../store";
import { buildProofEffectivenessSnapshot } from "./analytics";
import type { ProofEffectivenessInput, ProofEffectivenessSnapshot } from "./types";

/** Read-only store access — no mutations. */
export function readProofEffectivenessInput(
  organizationId: string,
): ProofEffectivenessInput {
  return {
    organizationId,
    proofAssets: listProofAssets(organizationId),
    opportunities: listOpportunities(organizationId),
    objections: listObjections(organizationId),
    winLossInsights: listWinLossInsights(organizationId),
    interactions: listAllInteractions(organizationId),
  };
}

export function loadProofEffectivenessSnapshot(
  organizationId: string,
): ProofEffectivenessSnapshot {
  return buildProofEffectivenessSnapshot(readProofEffectivenessInput(organizationId));
}
