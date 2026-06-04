// @ts-nocheck
// SalesOS v0.2 entry point for cross-product institutional signals
//
// Consumption (via services/cross-product-signals-service.ts):
// - Command center / Wave A lists: listInstitutionalSignalsForCommandCenter →
//   transformInstitutionalToWaveA (vnext) → salesListCrossProductSignalsForCommandCenter
// - Executive commercial dashboard: salesListCrossProductSignalsForCommandCenter (limit 8)
//   in executive-commercial-dashboard-service → buildSignalsSection

import "server-only";

import type { CrossProductSignalAggregation } from "./types";

// ─── Phantom imports (commented out — module does not exist) ───
// import {
//   collectCrossProductCommercialSignals,
//   deriveInstitutionalCommercialSignals,
//   collectCrossProductRuntimeInputs,
// } from "@/lib/platform/signals/cross-product-commercial";

// TODO: implement when platform/signals/cross-product-commercial exists
async function collectCrossProductCommercialSignals(
  _organizationId: string,
  _ownerId: string,
): Promise<CrossProductSignalAggregation> {
  throw new Error(
    "TODO: implement when platform/signals/cross-product-commercial exists",
  );
}
async function deriveInstitutionalCommercialSignals(): Promise<void> {
  throw new Error(
    "TODO: implement when platform/signals/cross-product-commercial exists",
  );
}
async function collectCrossProductRuntimeInputs(): Promise<void> {
  throw new Error(
    "TODO: implement when platform/signals/cross-product-commercial exists",
  );
}

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
