import "server-only";

import { InMemoryEvidenceStore } from "@/lib/core/evidence/evidence-store";
import { PrismaEvidenceStore } from "@/lib/core/evidence/evidence-store-prisma";
import type { EvidenceCategory, EvidenceStore } from "@/lib/core/evidence/types";
import { SALESOS_PRODUCT_KEY } from "@/lib/sales/core-adoption";

export const STALE_PROOF_MS = 180 * 24 * 60 * 60 * 1000;

let store: EvidenceStore = new PrismaEvidenceStore();

export function proofCategory(assetType: string): EvidenceCategory {
  if (assetType === "audit_evidence") return "document";
  if (assetType === "customer_quote" || assetType === "benchmark") {
    return "source_record";
  }
  return "report";
}

export function coreEvidenceIdForProofAsset(proofAssetId: string): string {
  return `sales-proof:${proofAssetId}`;
}

export function coreEvidenceIdForCommercialRef(refId: string): string {
  return `sales-commercial-ref:${refId}`;
}

export function getSalesEvidenceStore(): EvidenceStore {
  return store;
}

export function resetSalesEvidenceStoreForTests(): void {
  store = new InMemoryEvidenceStore();
}

export { SALESOS_PRODUCT_KEY };
