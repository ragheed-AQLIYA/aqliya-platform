// @ts-nocheck
// ─── SalesOS v0.2 cross-product commercial signal contracts ───

import type { RuntimeSignalSeverity } from "@/lib/platform/signals/types";

/** v0.2 sources wired in Agent 8 (AuditOS + LocalContentOS + SalesOS). */
export type CrossProductSourceProduct =
  | "audit"
  | "local_content"
  | "sales";

export type InstitutionalCommercialKind =
  | "repeated_audit_finding"
  | "market_concern"
  | "customer_request"
  | "sales_objection"
  | "evidence_gap"
  | "governance_pressure"
  | "buying_signal";

export type CrossProductTargetEntityType =
  | "account"
  | "opportunity"
  | "proof_asset"
  | "engagement"
  | "project";

/** Aligns with salesos-v02-commercial-intelligence-layer CrossProductSignal envelope. */
export interface CrossProductCommercialSignal {
  id: string;
  organizationId: string;
  sourceProduct: CrossProductSourceProduct;
  targetEntityType: CrossProductTargetEntityType;
  targetEntityId?: string;
  signalType: InstitutionalCommercialKind;
  titleAr: string;
  titleEn: string;
  severity: RuntimeSignalSeverity;
  payload: Record<string, unknown>;
  evidenceRefs: string[];
  outputStatus: "draft" | "recommendation";
  createdAt: string;
  /** Upstream runtime or domain signal ids for traceability. */
  sourceSignalIds: string[];
}

export interface CrossProductSignalAggregation {
  organizationId: string;
  aggregatedAt: string;
  signals: CrossProductCommercialSignal[];
  byKind: Record<InstitutionalCommercialKind, number>;
  bySource: Record<CrossProductSourceProduct, number>;
}
