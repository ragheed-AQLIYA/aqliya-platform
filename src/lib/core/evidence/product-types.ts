// ─── Per-product evidence type catalogs (v0.3 foundation) ───

import type { V1ProductKey } from "@/lib/platform/registry/product-contracts";

export interface ProductEvidenceTypeDefinition {
  id: string;
  labelEn: string;
  labelAr: string;
  requiredForApproval?: boolean;
}

export type ProductEvidenceTypeCatalog = Record<
  V1ProductKey,
  readonly ProductEvidenceTypeDefinition[]
>;

export const PRODUCT_EVIDENCE_TYPES: ProductEvidenceTypeCatalog = {
  audit: [
    {
      id: "trial_balance",
      labelEn: "Trial balance source",
      labelAr: "مصدر ميزان المراجعة",
      requiredForApproval: true,
    },
    {
      id: "working_paper",
      labelEn: "Working paper",
      labelAr: "ورقة عمل",
    },
    {
      id: "supporting_doc",
      labelEn: "Supporting documentation",
      labelAr: "مستند داعم",
    },
    {
      id: "correspondence",
      labelEn: "Correspondence",
      labelAr: "مراسلات",
    },
  ],
  local_content: [
    {
      id: "supplier_certificate",
      labelEn: "Supplier certificate",
      labelAr: "شهادة المورد",
      requiredForApproval: true,
    },
    {
      id: "contract",
      labelEn: "Contract",
      labelAr: "عقد",
    },
    {
      id: "attestation",
      labelEn: "Management attestation",
      labelAr: "إقرار إداري",
    },
    {
      id: "spend_invoice",
      labelEn: "Spend invoice",
      labelAr: "فاتورة إنفاق",
    },
  ],
  sales: [
    {
      id: "proposal",
      labelEn: "Proposal document",
      labelAr: "مستند عرض",
    },
    {
      id: "interaction_log",
      labelEn: "Interaction log",
      labelAr: "سجل تفاعل",
    },
    {
      id: "qualification_note",
      labelEn: "Qualification evidence",
      labelAr: "دليل تأهيل",
      requiredForApproval: true,
    },
  ],
};

export function listEvidenceTypesForProduct(
  product: V1ProductKey,
): readonly ProductEvidenceTypeDefinition[] {
  return PRODUCT_EVIDENCE_TYPES[product];
}

export function getEvidenceTypeDefinition(
  product: V1ProductKey,
  typeId: string,
): ProductEvidenceTypeDefinition | undefined {
  return PRODUCT_EVIDENCE_TYPES[product].find((t) => t.id === typeId);
}

export function getRequiredEvidenceForApproval(
  product: V1ProductKey,
): readonly ProductEvidenceTypeDefinition[] {
  return PRODUCT_EVIDENCE_TYPES[product].filter((t) => t.requiredForApproval);
}
