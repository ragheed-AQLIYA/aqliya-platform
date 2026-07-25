import {
  ensureSalesSeed,
  listEvidenceForOpportunity,
  listOpportunities,
  listProofAssets,
} from "@/lib/sales/store";
import type { SalesEvidenceRef } from "@/lib/sales/store";
import type { SalesProofAsset } from "@/lib/sales/types";

import type { ProofEvidenceLinkage } from "./types";
import {
  coreEvidenceIdForCommercialRef,
  coreEvidenceIdForProofAsset,
  getSalesEvidenceStore,
  proofCategory,
  SALESOS_PRODUCT_KEY,
} from "./store";

export async function syncProofAssetToCore(params: {
  tenantId: string;
  proofAsset: SalesProofAsset;
  createdById: string;
}): Promise<void> {
  try {
    const store = getSalesEvidenceStore();
    const coreId = coreEvidenceIdForProofAsset(params.proofAsset.id);
    const existing = await store.getById(coreId);
    const metadata = {
      proofAssetId: params.proofAsset.id,
      assetType: params.proofAsset.assetType,
      externalRef: params.proofAsset.externalRef,
      evidenceRef: params.proofAsset.evidenceRef,
      linkedOpportunityIds: params.proofAsset.linkedOpportunityIds ?? [],
      linkedAccountIds: params.proofAsset.linkedAccountIds ?? [],
    };
    if (existing) {
      await store.update(coreId, {
        status: params.proofAsset.status === "archived" ? "archived" : "attached",
        title: params.proofAsset.title,
        metadata,
      });
      return;
    }
    await store.create({
      id: coreId,
      tenantId: params.tenantId,
      productKey: SALESOS_PRODUCT_KEY,
      category: proofCategory(params.proofAsset.assetType),
      status: params.proofAsset.status === "archived" ? "archived" : "attached",
      title: params.proofAsset.title,
      description: params.proofAsset.description,
      source: `sales_proof_asset:${params.proofAsset.id}`,
      metadata,
      createdById: params.createdById,
    } as never);
  } catch {
    // Dual-write failure must never affect the primary action
  }
}

export async function syncCommercialEvidenceRefToCore(params: {
  tenantId: string;
  ref: SalesEvidenceRef;
  createdById: string;
}): Promise<void> {
  try {
    const store = getSalesEvidenceStore();
    const coreId = coreEvidenceIdForCommercialRef(params.ref.id);
    const existing = await store.getById(coreId);
    const metadata = {
      salesEvidenceRefId: params.ref.id,
      opportunityId: params.ref.opportunityId,
      typeId: params.ref.typeId,
    };
    if (existing) {
      await store.update(coreId, { status: "attached", metadata });
      return;
    }
    await store.create({
      id: coreId,
      tenantId: params.tenantId,
      productKey: SALESOS_PRODUCT_KEY,
      category: "note",
      status: "attached",
      title: params.ref.label,
      source: `sales_opportunity:${params.ref.opportunityId}`,
      metadata,
      createdById: params.createdById,
    } as never);
    await store.link(
      coreId,
      "SalesOpportunity",
      params.ref.opportunityId,
      "commercial_evidence",
    );
  } catch {
    // Dual-write failure must never affect the primary action
  }
}

export async function linkProofAssetToCore(params: {
  proofAssetId: string;
  targetType: string;
  targetId: string;
  relationship?: string;
}): Promise<void> {
  try {
    const store = getSalesEvidenceStore();
    const coreId = coreEvidenceIdForProofAsset(params.proofAssetId);
    await store.link(
      coreId,
      params.targetType,
      params.targetId,
      params.relationship ?? "supports",
    );
  } catch {
    // Dual-write failure must never affect the primary action
  }
}

export async function refreshSalesProofCoreSnapshots(
  organizationId: string,
  ownerId = "system",
): Promise<void> {
  try {
    await ensureSalesSeed(organizationId, ownerId);
    const proofAssets = listProofAssets(organizationId);
    const actorId = ownerId;
    await Promise.all(
      proofAssets.map((asset) =>
        syncProofAssetToCore({
          tenantId: organizationId,
          proofAsset: asset,
          createdById: actorId,
        }),
      ),
    );
    const opportunities = listOpportunities(organizationId);
    for (const opp of opportunities) {
      const refs = listEvidenceForOpportunity(organizationId, opp.id);
      for (const ref of refs) {
        await syncCommercialEvidenceRefToCore({
          tenantId: organizationId,
          ref,
          createdById: actorId,
        });
      }
    }
  } catch {
    // Snapshot refresh is best-effort only
  }
}

export function mapProofAssetToCoreRef(
  asset: SalesProofAsset,
  evidenceRefs: SalesEvidenceRef[],
): ProofEvidenceLinkage {
  const linkedRefIds = evidenceRefs
    .filter((ref) => {
      const oppIds = asset.linkedOpportunityIds ?? [];
      return (
        ref.opportunityId === asset.opportunityId ||
        oppIds.includes(ref.opportunityId)
      );
    })
    .map((ref) => ref.id);
  return {
    proofAssetId: asset.id,
    coreEvidenceId: coreEvidenceIdForProofAsset(asset.id),
    salesEvidenceRefIds: linkedRefIds,
    evidenceRef: asset.evidenceRef,
  };
}

export async function buildProofEvidenceLinkageMap(
  organizationId: string,
  ownerId = "system",
): Promise<ProofEvidenceLinkage[]> {
  await ensureSalesSeed(organizationId, ownerId);
  const proofAssets = listProofAssets(organizationId);
  const allRefs = listOpportunities(organizationId).flatMap((opp) =>
    listEvidenceForOpportunity(organizationId, opp.id),
  );
  return proofAssets.map((asset) => mapProofAssetToCoreRef(asset, allRefs));
}

export async function bridgeProofAssetsToEvidenceRefs(
  organizationId: string,
  ownerId = "system",
): Promise<ProofEvidenceLinkage[]> {
  return buildProofEvidenceLinkageMap(organizationId, ownerId);
}

export function proofAssetToEvidenceRef(asset: SalesProofAsset) {
  return coreEvidenceIdForProofAsset(asset.id);
}

export const syncSalesProofAssetToCore = syncProofAssetToCore;
export const syncSalesEvidenceRefToCore = syncCommercialEvidenceRefToCore;
export const linkSalesProofToCore = linkProofAssetToCore;
export const syncAllSalesProofAssetsToCore = refreshSalesProofCoreSnapshots;
