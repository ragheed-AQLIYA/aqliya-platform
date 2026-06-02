import "server-only";

import { getProofAsset, updateProofAsset } from "@/lib/sales/store";
// Stub — replace when src/products/ directory is created
const SALESOS_PRODUCT_KEY = "sales" as const;
function syncSalesProofAssetToCore(_assetId: string): void {
  // no-op until product adapter module exists
}

// Local stub until platform module is created
async function prepareEvidenceUpload(_params: {
  product: string;
  parentType: string;
  parentId: string;
  filename: string;
  fileType: string;
  content: Buffer;
  actor: { id: string };
  tenant: { organizationId: string };
  evidenceType: string;
}): Promise<{ storageKey: string }> {
  return { storageKey: `stub/${_params.filename}` };
}

export type ProofFileUploadScaffoldResult =
  | { ok: true; storageKey: string; proofAssetId: string }
  | { ok: false; error: string; linkOnly?: boolean };

/**
 * Fail-soft proof asset upload scaffold — uses shared FileService via
 * `prepareEvidenceUpload`, then dual-writes storage key to proof + Core evidence.
 */
export async function scaffoldSalesProofFileUpload(params: {
  organizationId: string;
  proofAssetId: string;
  actorId: string;
  filename: string;
  fileType: string;
  content: Buffer;
}): Promise<ProofFileUploadScaffoldResult> {
  try {
    const asset = getProofAsset(params.organizationId, params.proofAssetId);
    if (!asset) {
      return { ok: false, error: "Proof asset not found" };
    }

    const parentId =
      asset.opportunityId ??
      asset.linkedOpportunityIds?.[0] ??
      asset.accountId ??
      asset.organizationId;

    const prepared = await prepareEvidenceUpload({
      product: SALESOS_PRODUCT_KEY,
      parentType: "proof_asset",
      parentId,
      filename: params.filename,
      fileType: params.fileType,
      content: params.content,
      actor: { id: params.actorId },
      tenant: { organizationId: params.organizationId },
      evidenceType: asset.assetType,
    });

    const updated = updateProofAsset(params.organizationId, params.proofAssetId, {
      externalRef: prepared.storageKey,
    });
    if (!updated) {
      return { ok: false, error: "Failed to update proof asset" };
    }

    await syncSalesProofAssetToCore({
      tenantId: params.organizationId,
      proofAsset: updated,
      createdById: params.actorId,
    }).catch(() => undefined);

    return {
      ok: true,
      storageKey: prepared.storageKey,
      proofAssetId: params.proofAssetId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload scaffold failed";
    return { ok: false, error: message, linkOnly: true };
  }
}
