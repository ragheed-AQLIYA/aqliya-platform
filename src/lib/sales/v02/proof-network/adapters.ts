// @ts-nocheck
import type { SalesProofAssetType } from "../../types";

export type AuditOSProofAdapterStatus = "stub" | "unavailable";
export type LocalContentProofAdapterStatus = "stub" | "unavailable";

export interface AuditOSAdapterQuery {
  organizationId: string;
  accountId?: string;
  opportunityId?: string;
}

export interface LocalContentAdapterQuery {
  organizationId: string;
  accountId?: string;
  industry?: string;
}

/** Read-only cross-product proof candidate (not persisted in SalesOS v0.2). */
export interface CrossProductProofCandidate {
  id: string;
  organizationId: string;
  source: "audit" | "local_content";
  title: string;
  summary?: string;
  suggestedAssetType: SalesProofAssetType;
  externalRef: string;
  accountId?: string;
  opportunityId?: string;
  adapterStatus: AuditOSProofAdapterStatus | LocalContentProofAdapterStatus;
}

export interface CrossProductProofAdapterMeta {
  sourceProduct: "audit" | "localcontent";
  status: "stub";
  description: string;
}

export const CROSS_PRODUCT_PROOF_ADAPTERS: CrossProductProofAdapterMeta[] = [
  {
    sourceProduct: "audit",
    status: "stub",
    description:
      "AuditOS engagement completion may emit case_study / audit_evidence candidates (read-only; no live sync in v0.2).",
  },
  {
    sourceProduct: "localcontent",
    status: "stub",
    description:
      "LocalContentOS approved deliverables may emit pilot_result / customer_quote candidates (read-only; no live sync in v0.2).",
  },
];

/**
 * Conceptual AuditOS proof candidates — stub returns one candidate when account or opportunity is set.
 */
export function listAuditOSProofCandidates(
  query: AuditOSAdapterQuery,
): CrossProductProofCandidate[] {
  if (!query.accountId && !query.opportunityId) return [];
  return [
    {
      id: `audit-stub-${query.accountId ?? query.opportunityId}`,
      organizationId: query.organizationId,
      source: "audit",
      title: "AuditOS engagement summary (stub)",
      suggestedAssetType: "audit_evidence",
      externalRef: `audit:stub:${query.accountId ?? query.opportunityId}`,
      accountId: query.accountId,
      opportunityId: query.opportunityId,
      adapterStatus: "stub",
    },
  ];
}

/**
 * Conceptual LocalContentOS proof candidates — stub returns one candidate when industry or account is set.
 */
export function listLocalContentProofCandidates(
  query: LocalContentAdapterQuery,
): CrossProductProofCandidate[] {
  if (!query.industry && !query.accountId) return [];
  return [
    {
      id: `lc-stub-${query.industry ?? query.accountId}`,
      organizationId: query.organizationId,
      source: "local_content",
      title: "LocalContentOS approved deliverable (stub)",
      suggestedAssetType: "pilot_result",
      externalRef: `lc:stub:${query.industry ?? query.accountId}`,
      accountId: query.accountId,
      adapterStatus: "stub",
    },
  ];
}

export function mergeCrossProductCandidates(
  ...lists: CrossProductProofCandidate[][]
): CrossProductProofCandidate[] {
  const seen = new Set<string>();
  const merged: CrossProductProofCandidate[] = [];
  for (const list of lists) {
    for (const item of list) {
      const key = `${item.source}:${item.externalRef}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

export async function listCrossProductProofCandidates(
  organizationId: string,
): Promise<CrossProductProofCandidate[]> {
  return mergeCrossProductCandidates(
    listAuditOSProofCandidates({ organizationId }),
    listLocalContentProofCandidates({ organizationId }),
  );
}
