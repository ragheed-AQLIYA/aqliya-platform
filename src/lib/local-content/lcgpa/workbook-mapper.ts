// ─── LocalContentOS — Workbook-to-LCGPA Pillar Mapping ───
// Extracts LCGPA pillar inputs from workbook line values.
// This is the bridge between workbook data and the LCGPA calculation engine.

import type { LcWorkbookLine } from "@prisma/client";
import type {
  LcPillarInputs,
  GoodsServicesInputs,
  AssetDepreciationInputs,
  LaborCompensationInputs,
  CapacityBuildingInputs,
  RankedSupplier,
} from "./types";
import { getLineValue } from "../workbook/scoring";

/**
 * Extract LCGPA pillar inputs from workbook lines.
 *
 * Maps workbook line codes to LCGPA pillar fields:
 *   WRK-05 → saudiCompensation
 *   WRK-06 → expatCompensation
 *   WRK-04 → totalCompensation
 *   AST-01 → ksaManufacturedDepreciation (existing, repurposed)
 *   AST-03 → foreignAssetDepreciation (new)
 *   AST-02 → totalDepreciation (existing, repurposed)
 *   CAP-01 → saudiTrainingCost
 *   CAP-02 → supplierDevelopmentCost
 *   CAP-03 → rdCostInKsa
 *   CAP-04 → totalCapacityBuildingCost
 *
 * @param lines - Workbook lines from database
 * @param suppliers - Ranked suppliers for G&S pillar (passed separately)
 * @param totalGoodsServicesCost - Total G&S cost (passed separately)
 * @returns LCGPA pillar inputs ready for computeLcgpaScore()
 */
export function extractLcgpaInputs(
  lines: LcWorkbookLine[],
  suppliers: RankedSupplier[] = [],
  totalGoodsServicesCost: number = 0,
): LcPillarInputs {
  const getValue = (code: string): number => {
    const line = lines.find((l) => l.code === code);
    if (!line) return 0;
    return getLineValue(line) ?? 0;
  };

  // ── Goods & Services Pillar ──
  const goodsServices: GoodsServicesInputs = {
    suppliers,
    totalGoodsServicesCost,
  };

  // ── Asset Depreciation Pillar ──
  // AST-01 = local fixed assets (repurposed as KSA-manufactured depreciation)
  // AST-03 = foreign fixed assets (new line)
  // AST-02 = total fixed assets (repurposed as total depreciation)
  const ksaManufacturedDepreciation = getValue("AST-01");
  const foreignAssetDepreciation = getValue("AST-03");
  const totalDepreciation = getValue("AST-02");

  const assetDepreciation: AssetDepreciationInputs = {
    ksaManufacturedDepreciation,
    foreignAssetDepreciation,
    totalDepreciation: totalDepreciation > 0
      ? totalDepreciation
      : ksaManufacturedDepreciation + foreignAssetDepreciation,
  };

  // ── Labor Compensation Pillar ──
  // WRK-05 = Saudi employee compensation (new line)
  // WRK-06 = Expat employee compensation (new line)
  // WRK-04 = Total payroll (existing, repurposed as total compensation)
  const saudiCompensation = getValue("WRK-05");
  const expatCompensation = getValue("WRK-06");
  const totalCompensationFromLine = getValue("WRK-04");

  const laborCompensation: LaborCompensationInputs = {
    saudiCompensation,
    expatCompensation,
    totalCompensation: totalCompensationFromLine > 0
      ? totalCompensationFromLine
      : saudiCompensation + expatCompensation,
  };

  // ── Capacity Building Pillar ──
  // CAP-01 = Saudi training cost
  // CAP-02 = Supplier development cost
  // CAP-03 = R&D cost in KSA
  // CAP-04 = Total capacity building cost
  const saudiTrainingCost = getValue("CAP-01");
  const supplierDevelopmentCost = getValue("CAP-02");
  const rdCostInKsa = getValue("CAP-03");
  const totalCapacityBuildingCostFromLine = getValue("CAP-04");

  const capacityBuilding: CapacityBuildingInputs = {
    saudiTrainingCost,
    supplierDevelopmentCost,
    rdCostInKsa,
    totalCapacityBuildingCost: totalCapacityBuildingCostFromLine > 0
      ? totalCapacityBuildingCostFromLine
      : saudiTrainingCost + supplierDevelopmentCost + rdCostInKsa,
  };

  return {
    goodsServices,
    assetDepreciation,
    laborCompensation,
    capacityBuilding,
  };
}

/**
 * Extract a single pillar's inputs from workbook lines.
 * Useful for partial calculations or pillar-specific analysis.
 */
export function extractLaborPillar(
  lines: LcWorkbookLine[],
): LaborCompensationInputs {
  const getValue = (code: string): number => {
    const line = lines.find((l) => l.code === code);
    if (!line) return 0;
    return getLineValue(line) ?? 0;
  };

  const saudiCompensation = getValue("WRK-05");
  const expatCompensation = getValue("WRK-06");
  const totalFromLine = getValue("WRK-04");

  return {
    saudiCompensation,
    expatCompensation,
    totalCompensation: totalFromLine > 0
      ? totalFromLine
      : saudiCompensation + expatCompensation,
  };
}

/**
 * Extract asset depreciation pillar from workbook lines.
 */
export function extractAssetPillar(
  lines: LcWorkbookLine[],
): AssetDepreciationInputs {
  const getValue = (code: string): number => {
    const line = lines.find((l) => l.code === code);
    if (!line) return 0;
    return getLineValue(line) ?? 0;
  };

  const ksaManufacturedDepreciation = getValue("AST-01");
  const foreignAssetDepreciation = getValue("AST-03");
  const totalFromLine = getValue("AST-02");

  return {
    ksaManufacturedDepreciation,
    foreignAssetDepreciation,
    totalDepreciation: totalFromLine > 0
      ? totalFromLine
      : ksaManufacturedDepreciation + foreignAssetDepreciation,
  };
}

/**
 * Extract capacity building pillar from workbook lines.
 */
export function extractCapacityBuildingPillar(
  lines: LcWorkbookLine[],
): CapacityBuildingInputs {
  const getValue = (code: string): number => {
    const line = lines.find((l) => l.code === code);
    if (!line) return 0;
    return getLineValue(line) ?? 0;
  };

  const saudiTrainingCost = getValue("CAP-01");
  const supplierDevelopmentCost = getValue("CAP-02");
  const rdCostInKsa = getValue("CAP-03");
  const totalFromLine = getValue("CAP-04");

  return {
    saudiTrainingCost,
    supplierDevelopmentCost,
    rdCostInKsa,
    totalCapacityBuildingCost: totalFromLine > 0
      ? totalFromLine
      : saudiTrainingCost + supplierDevelopmentCost + rdCostInKsa,
  };
}
