/**
 * SalesOS Store — Proof Assets domain
 */

import type { SalesProofAsset } from "../types";
import { salesTimestamps } from "../entity-factory";
import {
  getOrgStore,
  putGovernedEntity,
  getGovernedEntity,
  updateGovernedEntity,
  deleteGovernedEntity,
} from "./common";

export function listProofAssets(organizationId: string): SalesProofAsset[] {
  return [...getOrgStore(organizationId).proofAssets.values()];
}

export function getProofAsset(
  organizationId: string,
  assetId: string,
): SalesProofAsset | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).proofAssets,
    assetId,
  );
}

export function listProofAssetsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesProofAsset[] {
  return listProofAssets(organizationId).filter(
    (a) =>
      a.opportunityId === opportunityId ||
      a.linkedOpportunityIds?.includes(opportunityId),
  );
}

export function createProofAsset(
  input: Omit<
    SalesProofAsset,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesProofAsset {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).proofAssets,
    "sales-proof",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

export function updateProofAsset(
  organizationId: string,
  assetId: string,
  patch: Partial<SalesProofAsset>,
): SalesProofAsset | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).proofAssets,
    assetId,
    patch,
  );
}

export function deleteProofAsset(
  organizationId: string,
  assetId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).proofAssets,
    assetId,
  );
}
