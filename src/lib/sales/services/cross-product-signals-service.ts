import {
  aggregateWaveACrossProductSignals,
  buildWaveACrossProductSignalAggregation,
  listWaveAInstitutionalSignals,
  transformInstitutionalToWaveA,
  type WaveACrossProductSignalAggregation,
  type WaveAInstitutionalSignal,
  type WaveAInstitutionalSignalKind,
} from "../vnext/cross-product-signals";
import type { CrossProductCommercialSignal } from "../v02/cross-product-signals/types";

export type {
  WaveACrossProductSignalAggregation,
  WaveAInstitutionalSignal,
  WaveAInstitutionalSignalKind,
  CrossProductCommercialSignal,
};

export async function salesAggregateCrossProductSignals(
  organizationId: string,
  ownerId = "system",
): Promise<WaveACrossProductSignalAggregation> {
  return aggregateWaveACrossProductSignals(organizationId, ownerId);
}

export async function salesListCrossProductSignalsForCommandCenter(
  organizationId: string,
  ownerId = "system",
  limit = 25,
): Promise<WaveAInstitutionalSignal[]> {
  return listWaveAInstitutionalSignals(organizationId, ownerId, limit);
}

export function salesTransformInstitutionalSignalsToWaveA(
  organizationId: string,
  institutional: CrossProductCommercialSignal[],
  aggregatedAt = new Date().toISOString(),
): WaveACrossProductSignalAggregation {
  return buildWaveACrossProductSignalAggregation(
    organizationId,
    aggregatedAt,
    institutional,
  );
}

export function salesFilterWaveASignalsByKind(
  aggregation: WaveACrossProductSignalAggregation,
  kind: WaveAInstitutionalSignalKind,
): WaveAInstitutionalSignal[] {
  return aggregation.signals.filter((s) => s.waveAKind === kind);
}

export { transformInstitutionalToWaveA };
