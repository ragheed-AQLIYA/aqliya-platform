// @ts-nocheck
// SalesOS v0.2 entry point for cross-product institutional signals
//
// Consumption (via services/cross-product-signals-service.ts):
// - Command center / Wave A lists: listInstitutionalSignalsForCommandCenter →
//   transformInstitutionalToWaveA (vnext) → salesListCrossProductSignalsForCommandCenter
// - Executive commercial dashboard: salesListCrossProductSignalsForCommandCenter (limit 8)
//   in executive-commercial-dashboard-service → buildSignalsSection

import "server-only";

import {
  collectCrossProductCommercialSignals,
  deriveInstitutionalCommercialSignals,
  collectCrossProductRuntimeInputs,
} from "@/lib/platform/signals/cross-product-commercial";
import type { CrossProductSignalAggregation } from "./types";

export {
  collectCrossProductCommercialSignals,
  deriveInstitutionalCommercialSignals,
  collectCrossProductRuntimeInputs,
};

export async function aggregateCrossProductSignalsForSales(
  organizationId: string,
  ownerId = "system",
): Promise<CrossProductSignalAggregation> {
  return collectCrossProductCommercialSignals(organizationId, ownerId);
}

export async function listInstitutionalSignalsForCommandCenter(
  organizationId: string,
  ownerId = "system",
  limit = 25,
): Promise<CrossProductSignalAggregation["signals"]> {
  const agg = await aggregateCrossProductSignalsForSales(
    organizationId,
    ownerId,
  );
  return agg.signals.slice(0, limit);
}
