// ─── LocalContentOS — LCGPA G&S Supplier Ranking Service ───
// Bridges raw supplier spend data to the LCGPA G&S pillar.
// Applies the 70%/top-40 selection rule deterministically.
// Every number traceable to: Rule, Version, Inputs, Calculation, Result, Evidence, Timestamp, Actor.

import type {
  RankedSupplier,
  GoodsServicesInputs,
  GsSelectionResult,
  LcPillarInputs,
  LcPillarResult,
} from "./types";
import {
  applyGsSelectionRule,
  computeLcGoodsServices,
  computeLcgpaScore,
} from "./calculation-engine";
import { LCGPA_RULE_VERSION } from "./types";

// ─── Raw Supplier Spend Data ───

/**
 * Raw supplier spend record from database or workbook.
 * This is the input format before ranking.
 */
export interface RawSupplierSpend {
  /** Unique supplier identifier */
  supplierId: string;
  /** Supplier name */
  name: string;
  /** Total spend with this supplier (SAR) */
  spend: number;
  /** Locality classification */
  localityClassification: "local" | "non_local" | "mixed" | "unclassified";
  /** Supplier's declared local content percentage (0-100) */
  localContentPercentage: number | null;
}

// ─── Ranking Result ───

/**
 * Full ranking result with selection and LC contribution details.
 */
export interface SupplierRankingResult {
  /** All suppliers ranked by descending spend */
  allSuppliers: RankedSupplier[];
  /** Selected suppliers after 70%/top-40 rule */
  selection: GsSelectionResult;
  /** Total G&S cost (all suppliers combined) */
  totalGoodsServicesCost: number;
  /** LC_GS value: sum of (spend × localPct) for selected suppliers */
  lcGoodsServicesValue: number;
  /** LC_GS as percentage of total G&S cost */
  lcGoodsServicesPct: number;
  /** Number of suppliers excluded by selection rule */
  excludedCount: number;
  /** Spend excluded by selection rule (SAR) */
  excludedSpend: number;
  /** Rule version used */
  ruleVersion: string;
}

// ─── Ranking Functions ───

/**
 * Rank suppliers by descending spend and apply the 70%/top-40 selection rule.
 *
 * This is the primary entry point for G&S supplier ranking.
 * It takes raw supplier spend data, ranks it, applies the selection rule,
 * and computes the LC_GS value.
 *
 * Deterministic: same inputs always produce same output.
 * Tie-breaking: suppliers with identical spend are ordered by supplierId (lexicographic).
 *
 * @param suppliers - Raw supplier spend records
 * @returns Full ranking result with selection and LC contribution
 */
export function rankAndSelectSuppliers(
  suppliers: RawSupplierSpend[],
): SupplierRankingResult {
  // Compute total G&S cost
  const totalGoodsServicesCost = suppliers.reduce(
    (sum, s) => sum + s.spend,
    0,
  );

  // Convert to RankedSupplier format (without ranks — ranks assigned by applyGsSelectionRule)
  const goodsServicesInputs: GoodsServicesInputs = {
    suppliers: suppliers.map((s) => ({
      ...s,
      rank: 0, // Will be assigned by applyGsSelectionRule
    })),
    totalGoodsServicesCost,
  };

  // Apply the 70%/top-40 selection rule
  const selection = applyGsSelectionRule(goodsServicesInputs);

  // Compute ranked suppliers (sorted by descending spend, tie-break by supplierId)
  const ranked: RankedSupplier[] = [...goodsServicesInputs.suppliers]
    .sort((a, b) => {
      if (b.spend !== a.spend) return b.spend - a.spend;
      return a.supplierId.localeCompare(b.supplierId);
    })
    .map((s, i) => ({ ...s, rank: i + 1 }));

  // Compute LC_GS value from selected suppliers
  const { lcValue } = computeLcGoodsServices(goodsServicesInputs);

  // Compute LC_GS as percentage of total G&S cost
  const lcGoodsServicesPct =
    totalGoodsServicesCost > 0
      ? Math.round((lcValue / totalGoodsServicesCost) * 10000) / 100
      : 0;

  // Compute excluded suppliers
  const selectedIds = new Set(
    selection.selectedSuppliers.map((s) => s.supplierId),
  );
  const excludedSuppliers = ranked.filter(
    (s) => !selectedIds.has(s.supplierId),
  );
  const excludedSpend = excludedSuppliers.reduce(
    (sum: number, s: RankedSupplier) => sum + s.spend,
    0,
  );

  return {
    allSuppliers: ranked,
    selection,
    totalGoodsServicesCost,
    lcGoodsServicesValue: lcValue,
    lcGoodsServicesPct,
    excludedCount: excludedSuppliers.length,
    excludedSpend,
    ruleVersion: LCGPA_RULE_VERSION,
  };
}

/**
 * Build LCGPA pillar inputs from raw supplier data and workbook values.
 *
 * This function bridges the gap between raw data and the LCGPA calculation engine.
 * It combines supplier ranking with workbook-derived values for the other pillars.
 *
 * @param suppliers - Raw supplier spend records
 * @param workbookValues - Workbook line values for other pillars
 * @returns Complete LCGPA pillar inputs ready for computeLcgpaScore()
 */
export function buildLcgpaInputsFromRaw(
  suppliers: RawSupplierSpend[],
  workbookValues: {
    ksaManufacturedDepreciation?: number;
    foreignAssetDepreciation?: number;
    totalDepreciation?: number;
    saudiCompensation?: number;
    expatCompensation?: number;
    totalCompensation?: number;
    saudiTrainingCost?: number;
    supplierDevelopmentCost?: number;
    rdCostInKsa?: number;
    totalCapacityBuildingCost?: number;
  } = {},
): LcPillarInputs {
  // Rank and select suppliers for G&S pillar
  const ranking = rankAndSelectSuppliers(suppliers);

  // Build G&S inputs from ranking
  const goodsServices: GoodsServicesInputs = {
    suppliers: ranking.selection.selectedSuppliers,
    totalGoodsServicesCost: ranking.totalGoodsServicesCost,
  };

  // Build asset depreciation inputs from workbook values
  const ksaMfg = workbookValues.ksaManufacturedDepreciation ?? 0;
  const foreign = workbookValues.foreignAssetDepreciation ?? 0;
  const assetDepreciation = {
    ksaManufacturedDepreciation: ksaMfg,
    foreignAssetDepreciation: foreign,
    totalDepreciation:
      workbookValues.totalDepreciation ?? ksaMfg + foreign,
  };

  // Build labor compensation inputs from workbook values
  const saudi = workbookValues.saudiCompensation ?? 0;
  const expat = workbookValues.expatCompensation ?? 0;
  const laborCompensation = {
    saudiCompensation: saudi,
    expatCompensation: expat,
    totalCompensation:
      workbookValues.totalCompensation ?? saudi + expat,
  };

  // Build capacity building inputs from workbook values
  const training = workbookValues.saudiTrainingCost ?? 0;
  const supplierDev = workbookValues.supplierDevelopmentCost ?? 0;
  const rd = workbookValues.rdCostInKsa ?? 0;
  const capacityBuilding = {
    saudiTrainingCost: training,
    supplierDevelopmentCost: supplierDev,
    rdCostInKsa: rd,
    totalCapacityBuildingCost:
      workbookValues.totalCapacityBuildingCost ?? training + supplierDev + rd,
  };

  return {
    goodsServices,
    assetDepreciation,
    laborCompensation,
    capacityBuilding,
  };
}

/**
 * Compute the full LCGPA score from raw supplier data and workbook values.
 *
 * This is the high-level function that combines supplier ranking with the
 * LCGPA calculation engine. It returns the full LCGPA result.
 *
 * Deterministic: same inputs always produce same output.
 * Versioned: tied to LCGPA_RULE_VERSION.
 * Auditable: full input/output trace is recorded.
 *
 * @param suppliers - Raw supplier spend records
 * @param workbookValues - Workbook line values for other pillars
 * @returns Full LCGPA calculation result
 */
export function computeLcgpaFromRaw(
  suppliers: RawSupplierSpend[],
  workbookValues: Parameters<typeof buildLcgpaInputsFromRaw>[1] = {},
): {
  inputs: LcPillarInputs;
  result: LcPillarResult;
  supplierRanking: SupplierRankingResult;
} {
  const inputs = buildLcgpaInputsFromRaw(suppliers, workbookValues);
  const result = computeLcgpaScore(inputs);
  const supplierRanking = rankAndSelectSuppliers(suppliers);

  return { inputs, result, supplierRanking };
}

// ─── Expanded Supplier Rules (Audit Matrix SC-05, SC-10) ───

/**
 * Check if expanded supplier tracking is required per LCGPA rules.
 *
 * Rules:
 * 1. SC-05: If unmapped residual spend ≥ 500M SAR, expand to 80 suppliers
 *    or until residual drops below 500M.
 * 2. SC-10: If physical goods < 50% of cost base, include up to 300 suppliers
 *    in Section 4.1.
 *
 * @param suppliers - All suppliers ranked by descending spend
 * @param totalGoodsServicesCost - Total G&S cost
 * @param goodsCost - Cost of physical goods only (for SC-10 check)
 * @returns Expansion requirements
 */
export function checkExpandedSupplierRules(
  suppliers: RawSupplierSpend[],
  totalGoodsServicesCost: number,
  goodsCost: number,
): {
  needsExpandedTracking: boolean; // SC-05: 500M SAR residual
  needsExtraDisclosure: boolean;  // SC-10: goods < 50%
  recommendedMaxSuppliers: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let needsExpandedTracking = false;
  let needsExtraDisclosure = false;
  let recommendedMaxSuppliers = 40; // Default: top 40

  // Sort suppliers by descending spend
  const sorted = [...suppliers].sort((a, b) => b.spend - a.spend);

  // SC-10: Check if goods < 50% of cost base
  const goodsPct = totalGoodsServicesCost > 0
    ? goodsCost / totalGoodsServicesCost
    : 0;
  if (goodsPct < 0.5) {
    needsExtraDisclosure = true;
    recommendedMaxSuppliers = Math.max(recommendedMaxSuppliers, 300);
    reasons.push(
      `SC-10: Physical goods (${(goodsPct * 100).toFixed(1)}%) < 50% of cost base. ` +
      `Section 4.1 requires up to 300 suppliers.`
    );
  }

  // SC-05: Check if residual spend ≥ 500M SAR after top-40 selection
  const top40Spend = sorted
    .slice(0, 40)
    .reduce((sum, s) => sum + s.spend, 0);
  const residualSpend = totalGoodsServicesCost - top40Spend;
  const residualThreshold = 500_000_000; // 500M SAR

  if (residualSpend >= residualThreshold) {
    needsExpandedTracking = true;
    // Find how many suppliers needed to reduce residual below 500M
    let cumulative = top40Spend;
    let expandedCount = 40;
    for (let i = 40; i < sorted.length; i++) {
      cumulative += sorted[i].spend;
      expandedCount = i + 1;
      if (totalGoodsServicesCost - cumulative < residualThreshold) break;
    }
    recommendedMaxSuppliers = Math.max(recommendedMaxSuppliers, Math.min(expandedCount, 80));
    reasons.push(
      `SC-05: Residual spend after top-40 = ${(residualSpend / 1_000_000).toFixed(0)}M SAR ` +
      `(≥ 500M threshold). Expanded tracking to ${recommendedMaxSuppliers} suppliers.`
    );
  }

  return {
    needsExpandedTracking,
    needsExtraDisclosure,
    recommendedMaxSuppliers,
    reasons,
  };
}

// ─── Capex Threshold Rules (Audit Matrix CPX-01, CPX-03) ───

/**
 * Capex tracking rules from the official LCGPA template.
 *
 * Rules:
 * - CPX-01: If gross annual capital additions ≥ 100M SAR, full compliance mapping.
 * - CPX-02: Exclude real estate, bare land, inventory, intra-group transfers.
 * - CPX-03: Map top 80 unique capital assets in descending cost order.
 */
export interface CapexAsset {
  assetId: string;
  description: string;
  cost: number;
  isKsaManufactured: boolean;
  category: "building" | "equipment" | "vehicle" | "it" | "other";
  excludeFromBaseline: boolean; // CPX-02 exclusions
}

export interface CapexTrackingResult {
  /** Whether capex exceeds 100M SAR threshold (CPX-01) */
  exceedsThreshold: boolean;
  /** Total capex (after exclusions) */
  totalCapexAfterExclusions: number;
  /** Assets included in tracking (top 80 or all if < 80) */
  trackedAssets: CapexAsset[];
  /** Number of assets excluded by CPX-02 rules */
  excludedCount: number;
  /** Total excluded spend */
  excludedSpend: number;
  /** Whether full compliance mapping is required */
  requiresFullMapping: boolean;
  warnings: string[];
}

export function applyCapexRules(
  assets: CapexAsset[],
): CapexTrackingResult {
  const warnings: string[] = [];

  // CPX-02: Apply exclusions
  const excluded = assets.filter(a => a.excludeFromBaseline);
  const included = assets.filter(a => !a.excludeFromBaseline);

  const excludedSpend = excluded.reduce((sum, a) => sum + a.cost, 0);
  const totalAfterExclusions = included.reduce((sum, a) => sum + a.cost, 0);

  // CPX-01: Check 100M SAR threshold
  const exceedsThreshold = totalAfterExclusions >= 100_000_000;

  // CPX-03: Sort by descending cost, take top 80
  const sorted = [...included].sort((a, b) => b.cost - a.cost);
  const trackedAssets = sorted.slice(0, 80);

  if (sorted.length > 80) {
    warnings.push(
      `CPX-03: ${sorted.length} assets after exclusions. Top 80 tracked by cost. ` +
      `${sorted.length - 80} assets beyond tracking threshold.`
    );
  }

  return {
    exceedsThreshold,
    totalCapexAfterExclusions: totalAfterExclusions,
    trackedAssets,
    excludedCount: excluded.length,
    excludedSpend,
    requiresFullMapping: exceedsThreshold,
    warnings,
  };
}
