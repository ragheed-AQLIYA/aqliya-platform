// @ts-nocheck
// Unified institutional (v0.2) and Wave A cross-product signal taxonomy

export const INSTITUTIONAL_COMMERCIAL_KINDS = [
  "repeated_audit_finding",
  "market_concern",
  "customer_request",
  "sales_objection",
  "evidence_gap",
  "governance_pressure",
  "buying_signal",
] as const;

export type InstitutionalCommercialKind =
  (typeof INSTITUTIONAL_COMMERCIAL_KINDS)[number];

export const WAVE_A_INSTITUTIONAL_SIGNAL_KINDS = [
  "repeated_audit_concern",
  "repeated_market_concern",
  "recurring_customer_request",
  "repeated_sales_objection",
  "content_market_signal",
  "proof_demand_signal",
] as const;

export type WaveAInstitutionalSignalKind =
  (typeof WAVE_A_INSTITUTIONAL_SIGNAL_KINDS)[number];

/** Institutional kinds surfaced on executive / command-center Wave A views. */
export const INSTITUTIONAL_KINDS_EXCLUDED_FROM_WAVE_A: readonly InstitutionalCommercialKind[] =
  ["governance_pressure"];

/** Direct 1:1 institutional → Wave A mapping (grouped kinds use vNext transform rules). */
export const DIRECT_INSTITUTIONAL_TO_WAVE_A: Partial<
  Record<InstitutionalCommercialKind, WaveAInstitutionalSignalKind>
> = {
  repeated_audit_finding: "repeated_audit_concern",
  sales_objection: "repeated_sales_objection",
  market_concern: "content_market_signal",
  evidence_gap: "proof_demand_signal",
  buying_signal: "proof_demand_signal",
};

export function isInstitutionalKindExcludedFromWaveA(
  kind: InstitutionalCommercialKind,
): boolean {
  return INSTITUTIONAL_KINDS_EXCLUDED_FROM_WAVE_A.includes(kind);
}

export function isEvidenceBackedInstitutionalSignal(signal: {
  evidenceRefs: string[];
  sourceSignalIds: string[];
}): boolean {
  return signal.evidenceRefs.length > 0 && signal.sourceSignalIds.length > 0;
}

/** Fail-soft: mirror runtime ids into evidenceRefs when detectors omit either field. */
export function normalizeInstitutionalEvidenceRefs<
  T extends { evidenceRefs: string[]; sourceSignalIds: string[] },
>(signal: T): T {
  const sourceSignalIds =
    signal.sourceSignalIds.length > 0
      ? signal.sourceSignalIds
      : [...signal.evidenceRefs];
  const evidenceRefs =
    signal.evidenceRefs.length > 0 ? signal.evidenceRefs : [...sourceSignalIds];
  if (
    evidenceRefs === signal.evidenceRefs &&
    sourceSignalIds === signal.sourceSignalIds
  ) {
    return signal;
  }
  return { ...signal, evidenceRefs, sourceSignalIds };
}
