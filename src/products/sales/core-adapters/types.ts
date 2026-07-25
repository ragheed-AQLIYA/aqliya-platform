import type { SalesEvidenceRef } from "@/lib/sales/store";

// SALESOS_PLACEHOLDER: inline type — implement when @/lib/platform/signals/types exists
export interface RuntimeSignal {
  id: string;
  organizationId: string;
  productSlug: string;
  kind?: string;
  action: string;
  severity: string;
  summaryEn?: string;
  summaryAr?: string;
  resourceId: string;
  resourceType?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type SalesProofEvidenceAlertKind =
  | "proof_missing_evidence_ref"
  | "proof_stale"
  | "proof_missing_for_stage"
  | "objection_without_proof"
  | "commercial_evidence_missing";

export interface SalesProofEvidenceAlert {
  id: string;
  organizationId: string;
  kind: SalesProofEvidenceAlertKind;
  resourceType: string;
  resourceId: string;
  labelEn: string;
  labelAr: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  href: string;
  metadata?: Record<string, unknown>;
}

export interface ProofEvidenceLinkage {
  proofAssetId: string;
  coreEvidenceId: string;
  salesEvidenceRefIds: string[];
  evidenceRef?: string;
}

export interface ProofUsageTraceEntry {
  proofAssetId: string;
  title: string;
  coreEvidenceId: string;
  evidenceRef?: string;
  linkedOpportunityIds: string[];
  linkedAccountIds: string[];
  usageScore: number;
}

export interface EvidenceBackedRecommendationCheck {
  ok: boolean;
  missingProofRefs: string[];
  missingEvidenceRefs: string[];
}

export type SalesProofEvidenceBridge = ProofEvidenceLinkage;
export type SalesProofUsageTrace = ProofUsageTraceEntry;
export type SalesEvidenceAlert = SalesProofEvidenceAlert;
export type SalesEvidenceAlertKind = SalesProofEvidenceAlertKind;
export type CommercialEvidenceRefShape = SalesEvidenceRef;
