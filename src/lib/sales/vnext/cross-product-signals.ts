// SalesOS vNext cross-product institutional signals (Wave A facade over v0.2 + platform)

import "server-only";

import {
  aggregateCrossProductSignalsForSales,
  listInstitutionalSignalsForCommandCenter,
} from "@/lib/sales/v02/cross-product-signals/aggregator";
import type {
  CrossProductCommercialSignal,
  CrossProductSourceProduct,
  InstitutionalCommercialKind,
} from "@/lib/sales/v02/cross-product-signals/types";

export const CROSS_PRODUCT_SIGNAL_DISCLAIMER_EN =
  "AI-assisted / evidence-based institutional signal — not final truth. Human review required.";

export const CROSS_PRODUCT_SIGNAL_DISCLAIMER_AR =
  "Institutional signal — evidence-based recommendation only; human review required.";

/** Wave A institutional signal taxonomy (6 kinds). */
export type WaveAInstitutionalSignalKind =
  | "repeated_audit_concern"
  | "repeated_market_concern"
  | "recurring_customer_request"
  | "repeated_sales_objection"
  | "content_market_signal"
  | "proof_demand_signal";

export interface WaveAInstitutionalSignal {
  id: string;
  organizationId: string;
  waveAKind: WaveAInstitutionalSignalKind;
  sourceProduct: CrossProductSourceProduct;
  targetEntityType?: CrossProductCommercialSignal["targetEntityType"];
  targetEntityId?: string;
  titleAr: string;
  titleEn: string;
  severity: CrossProductCommercialSignal["severity"];
  payload: Record<string, unknown>;
  evidenceRefs: string[];
  outputStatus: CrossProductCommercialSignal["outputStatus"];
  createdAt: string;
  sourceSignalIds: string[];
  institutionalKind: InstitutionalCommercialKind;
}

export interface WaveACrossProductSignalAggregation {
  organizationId: string;
  aggregatedAt: string;
  signals: WaveAInstitutionalSignal[];
  byKind: Record<WaveAInstitutionalSignalKind, number>;
  bySource: Record<CrossProductSourceProduct, number>;
  institutionalSignalCount: number;
  disclaimerEn: typeof CROSS_PRODUCT_SIGNAL_DISCLAIMER_EN;
  disclaimerAr: typeof CROSS_PRODUCT_SIGNAL_DISCLAIMER_AR;
}

const EMPTY_WAVE_A_KIND_COUNTS = (): Record<WaveAInstitutionalSignalKind, number> => ({
  repeated_audit_concern: 0,
  repeated_market_concern: 0,
  recurring_customer_request: 0,
  repeated_sales_objection: 0,
  content_market_signal: 0,
  proof_demand_signal: 0,
});

const EMPTY_SOURCE_COUNTS = (): Record<CrossProductSourceProduct, number> => ({
  audit: 0,
  local_content: 0,
  sales: 0,
});

function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, "")
    .trim()
    .slice(0, 80);
}

export function isEvidenceBackedInstitutionalSignal(
  signal: CrossProductCommercialSignal,
): boolean {
  return signal.evidenceRefs.length > 0 && signal.sourceSignalIds.length > 0;
}

function toWaveASignal(
  signal: CrossProductCommercialSignal,
  waveAKind: WaveAInstitutionalSignalKind,
  overrides?: Partial<
    Pick<
      WaveAInstitutionalSignal,
      "id" | "titleAr" | "titleEn" | "payload" | "evidenceRefs" | "sourceSignalIds"
    >
  >,
): WaveAInstitutionalSignal {
  return {
    id: overrides?.id ?? `wavea-${waveAKind}-${signal.id}`,
    organizationId: signal.organizationId,
    waveAKind,
    sourceProduct: signal.sourceProduct,
    targetEntityType: signal.targetEntityType,
    targetEntityId: signal.targetEntityId,
    titleAr: overrides?.titleAr ?? signal.titleAr,
    titleEn: overrides?.titleEn ?? signal.titleEn,
    severity: signal.severity,
    payload: overrides?.payload ?? signal.payload,
    evidenceRefs: overrides?.evidenceRefs ?? signal.evidenceRefs,
    outputStatus: signal.outputStatus,
    createdAt: signal.createdAt,
    sourceSignalIds: overrides?.sourceSignalIds ?? signal.sourceSignalIds,
    institutionalKind: signal.signalType,
  };
}

function groupByNormalizedTitle(
  signals: CrossProductCommercialSignal[],
): Map<string, CrossProductCommercialSignal[]> {
  const buckets = new Map<string, CrossProductCommercialSignal[]>();
  for (const signal of signals) {
    const key = normalizeKey(signal.titleEn || signal.titleAr || signal.id);
    const list = buckets.get(key) ?? [];
    list.push(signal);
    buckets.set(key, list);
  }
  return buckets;
}

function aggregateGroupedWaveASignals(
  group: CrossProductCommercialSignal[],
  waveAKind: WaveAInstitutionalSignalKind,
  titleEn: string,
  titleAr: string,
): WaveAInstitutionalSignal {
  const lead = group[0];
  const evidenceRefs = [...new Set(group.flatMap((s) => s.evidenceRefs))];
  const sourceSignalIds = [...new Set(group.flatMap((s) => s.sourceSignalIds))];
  return toWaveASignal(lead, waveAKind, {
    id: `wavea-${waveAKind}-group-${normalizeKey(titleEn).slice(0, 24)}`,
    titleEn,
    titleAr,
    payload: {
      occurrenceCount: group.length,
      groupedInstitutionalIds: group.map((s) => s.id),
    },
    evidenceRefs,
    sourceSignalIds,
  });
}

export function transformInstitutionalToWaveA(
  institutional: CrossProductCommercialSignal[],
): WaveAInstitutionalSignal[] {
  const pool = institutional.filter(isEvidenceBackedInstitutionalSignal);
  const out: WaveAInstitutionalSignal[] = [];
  const consumed = new Set<string>();

  for (const signal of pool) {
    if (signal.signalType === "repeated_audit_finding") {
      out.push(toWaveASignal(signal, "repeated_audit_concern"));
      consumed.add(signal.id);
    }
  }

  for (const signal of pool) {
    if (signal.signalType !== "sales_objection" || consumed.has(signal.id)) continue;
    const frequency = Number(signal.payload?.frequency ?? 0);
    const repeated =
      frequency >= 2 ||
      signal.severity === "critical" ||
      signal.payload?.action === "objection.repeated";
    if (!repeated) continue;
    out.push(toWaveASignal(signal, "repeated_sales_objection"));
    consumed.add(signal.id);
  }

  for (const signal of pool) {
    if (
      signal.signalType !== "market_concern" ||
      signal.sourceProduct !== "local_content" ||
      consumed.has(signal.id)
    ) {
      continue;
    }
    out.push(toWaveASignal(signal, "content_market_signal"));
    consumed.add(signal.id);
  }

  const marketCandidates = pool.filter(
    (s) =>
      s.signalType === "market_concern" &&
      s.sourceProduct !== "local_content" &&
      !consumed.has(s.id),
  );
  for (const [, group] of groupByNormalizedTitle(marketCandidates)) {
    if (group.length < 2) continue;
    out.push(
      aggregateGroupedWaveASignals(
        group,
        "repeated_market_concern",
        `Repeated market concern: ${group[0].titleEn}`,
        `Repeated market concern: ${group[0].titleAr}`,
      ),
    );
    for (const s of group) consumed.add(s.id);
  }

  const requestCandidates = pool.filter(
    (s) => s.signalType === "customer_request" && !consumed.has(s.id),
  );
  for (const [, group] of groupByNormalizedTitle(requestCandidates)) {
    if (group.length < 2) continue;
    out.push(
      aggregateGroupedWaveASignals(
        group,
        "recurring_customer_request",
        `Recurring customer request: ${group[0].titleEn}`,
        `Recurring customer request: ${group[0].titleAr}`,
      ),
    );
    for (const s of group) consumed.add(s.id);
  }

  for (const signal of pool) {
    if (consumed.has(signal.id)) continue;
    if (signal.signalType === "evidence_gap" || signal.signalType === "buying_signal") {
      out.push(toWaveASignal(signal, "proof_demand_signal"));
      consumed.add(signal.id);
    }
  }

  const seen = new Set<string>();
  return out
    .filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    })
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function summarizeWaveAAggregation(
  organizationId: string,
  aggregatedAt: string,
  signals: WaveAInstitutionalSignal[],
  institutionalSignalCount: number,
): WaveACrossProductSignalAggregation {
  const byKind = EMPTY_WAVE_A_KIND_COUNTS();
  const bySource = EMPTY_SOURCE_COUNTS();
  for (const signal of signals) {
    byKind[signal.waveAKind] += 1;
    bySource[signal.sourceProduct] += 1;
  }
  return {
    organizationId,
    aggregatedAt,
    signals,
    byKind,
    bySource,
    institutionalSignalCount,
    disclaimerEn: CROSS_PRODUCT_SIGNAL_DISCLAIMER_EN,
    disclaimerAr: CROSS_PRODUCT_SIGNAL_DISCLAIMER_AR,
  };
}

export function buildWaveACrossProductSignalAggregation(
  organizationId: string,
  aggregatedAt: string,
  institutional: CrossProductCommercialSignal[],
): WaveACrossProductSignalAggregation {
  return summarizeWaveAAggregation(
    organizationId,
    aggregatedAt,
    transformInstitutionalToWaveA(institutional),
    institutional.length,
  );
}

export async function aggregateWaveACrossProductSignals(
  organizationId: string,
  ownerId = "system",
): Promise<WaveACrossProductSignalAggregation> {
  const institutional = await aggregateCrossProductSignalsForSales(
    organizationId,
    ownerId,
  );
  return buildWaveACrossProductSignalAggregation(
    organizationId,
    institutional.aggregatedAt,
    institutional.signals,
  );
}

export async function listWaveAInstitutionalSignals(
  organizationId: string,
  ownerId = "system",
  limit = 25,
): Promise<WaveAInstitutionalSignal[]> {
  const institutional = await listInstitutionalSignalsForCommandCenter(
    organizationId,
    ownerId,
    limit * 3,
  );
  return transformInstitutionalToWaveA(institutional).slice(0, limit);
}

export {
  aggregateCrossProductSignalsForSales,
  listInstitutionalSignalsForCommandCenter,
} from "@/lib/sales/v02/cross-product-signals/aggregator";

export type {
  CrossProductCommercialSignal,
  CrossProductSignalAggregation,
  InstitutionalCommercialKind,
  CrossProductSourceProduct,
} from "@/lib/sales/v02/cross-product-signals/types";
