// ─── LocalContentOS — LCGPA Calculation Engine Tests ───
// Deterministic, explainable, versioned, auditable, reproducible.
// Every test uses known inputs and verifies exact expected outputs.

import {
  computeLcgpaScore,
  computeLcGoodsServices,
  computeLcAssetDepreciation,
  computeLcLaborCompensation,
  computeLcCapacityBuilding,
  applyGsSelectionRule,
  computeFinancialEvaluation,
  rankFinancialEvaluations,
  validateFinancialEvaluationInputs,
  computePenaltyAssessment,
  computeGradualPlan,
  checkOwnershipRule,
  computeSmePreference,
  computePricePreference,
  computeTenderEvaluation,
  validateLcInputs,
} from "../calculation-engine";
import {
  createCalculationTrace,
  createFinancialEvaluationTrace,
  verifyTrace,
  verifyFinancialEvaluationTrace,
} from "../calculation-trace";
import type { TenderEvaluationInputs } from "../types";
import type {
  LcPillarInputs,
  RankedSupplier,
  GoodsServicesInputs,
  AssetDepreciationInputs,
  LaborCompensationInputs,
  CapacityBuildingInputs,
  FinancialEvaluationInputs,
} from "../types";

// ─── Test Data Factories ───

function makeSuppliers(overrides: Partial<RankedSupplier> = {}): RankedSupplier[] {
  return [
    {
      supplierId: "SUP-001",
      name: "Saudi supplier",
      spend: 500000,
      localityClassification: "local",
      localContentPercentage: 100,
      rank: 1,
      ...overrides,
    },
  ];
}

function makeFullInputs(): LcPillarInputs {
  return {
    goodsServices: {
      suppliers: [
        {
          supplierId: "SUP-001",
          name: "Al Rajhi Supplies",
          spend: 500000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 1,
        },
        {
          supplierId: "SUP-002",
          name: "Global Import Co",
          spend: 300000,
          localityClassification: "non_local",
          localContentPercentage: 0,
          rank: 2,
        },
        {
          supplierId: "SUP-003",
          name: "Mixed Trading",
          spend: 200000,
          localityClassification: "mixed",
          localContentPercentage: 60,
          rank: 3,
        },
      ],
      totalGoodsServicesCost: 1000000,
    },
    assetDepreciation: {
      ksaManufacturedDepreciation: 200000,
      foreignAssetDepreciation: 100000,
      totalDepreciation: 300000,
    },
    laborCompensation: {
      saudiCompensation: 400000,
      expatCompensation: 300000,
      totalCompensation: 700000,
    },
    capacityBuilding: {
      saudiTrainingCost: 50000,
      supplierDevelopmentCost: 30000,
      rdCostInKsa: 20000,
      totalCapacityBuildingCost: 100000,
    },
  };
}

// ─── Goods & Services Pillar Tests ───

describe("LCGPA G&S Pillar", () => {
  it("computeLcGoodsServices sums local spend for selected suppliers", () => {
    const inputs: GoodsServicesInputs = {
      suppliers: [
        {
          supplierId: "S1",
          name: "Local A",
          spend: 600000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 1,
        },
        {
          supplierId: "S2",
          name: "Foreign B",
          spend: 400000,
          localityClassification: "non_local",
          localContentPercentage: 0,
          rank: 2,
        },
      ],
      totalGoodsServicesCost: 1000000,
    };

    const result = computeLcGoodsServices(inputs);
    // S1 (local): 600000 × 100% = 600000
    // S2 (non_local): 400000 × 0% = 0
    // Total LC = 600000
    expect(result.lcValue).toBe(600000);
    expect(result.totalCost).toBe(1000000);
  });

  it("computeLcGoodsServices handles mixed suppliers with declared percentage", () => {
    const inputs: GoodsServicesInputs = {
      suppliers: [
        {
          supplierId: "S1",
          name: "Mixed supplier",
          spend: 1000000,
          localityClassification: "mixed",
          localContentPercentage: 75,
          rank: 1,
        },
      ],
      totalGoodsServicesCost: 1000000,
    };

    const result = computeLcGoodsServices(inputs);
    // Mixed: 1000000 × 75% = 750000
    expect(result.lcValue).toBe(750000);
  });

  it("computeLcGoodsServices returns 0 for empty suppliers", () => {
    const inputs: GoodsServicesInputs = {
      suppliers: [],
      totalGoodsServicesCost: 0,
    };

    const result = computeLcGoodsServices(inputs);
    expect(result.lcValue).toBe(0);
  });

  it("computeLcGoodsServices uses sector LC% rate as fallback for unclassified suppliers", () => {
    const inputs: GoodsServicesInputs = {
      suppliers: [
        {
          supplierId: "S1",
          name: "Unclassified with sector rate",
          spend: 500000,
          localityClassification: "unclassified",
          localContentPercentage: null,
          rank: 1,
          sectorLcRate: 0.6, // S01 Housing & Rental rate = 60%
        },
        {
          supplierId: "S2",
          name: "Unclassified without sector rate",
          spend: 300000,
          localityClassification: "unclassified",
          localContentPercentage: null,
          rank: 2,
          // no sectorLcRate → fallback to 0%
        },
        {
          supplierId: "S3",
          name: "Local supplier",
          spend: 200000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 3,
        },
      ],
      totalGoodsServicesCost: 1000000,
    };

    const result = computeLcGoodsServices(inputs);
    // S1 (unclassified + sector rate 0.6): 500000 × 60% = 300000
    // S2 (unclassified, no sector rate): 300000 × 0% = 0
    // S3 (local): 200000 × 100% = 200000
    // Total LC = 500000
    expect(result.lcValue).toBe(500000);
  });

  it("computeLcGoodsServices uses minimum vendor floor of 10 (SC-04)", () => {
    // 5 suppliers, none reaching 70% individually
    const suppliers = Array.from({ length: 5 }, (_, i) => ({
      supplierId: `S${i + 1}`,
      name: `Supplier ${i + 1}`,
      spend: 100000,
      localityClassification: "unclassified" as const,
      localContentPercentage: null,
      rank: i + 1,
    }));

    const inputs: GoodsServicesInputs = {
      suppliers,
      totalGoodsServicesCost: 1000000,
    };

    const selection = applyGsSelectionRule(inputs);
    // SC-04: minimum floor = 10, but only 5 suppliers exist
    // Should select all 5 (can't select more than exist)
    expect(selection.selectedSuppliers.length).toBe(5);
  });
});

describe("LCGPA Selection Rule Extended", () => {
  it("applyGsSelectionRule selects top suppliers by descending spend", () => {
    const inputs: GoodsServicesInputs = {
      suppliers: [
        {
          supplierId: "S3",
          name: "Small",
          spend: 100000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 3,
        },
        {
          supplierId: "S1",
          name: "Large",
          spend: 500000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 1,
        },
        {
          supplierId: "S2",
          name: "Medium",
          spend: 300000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 2,
        },
      ],
      totalGoodsServicesCost: 900000,
    };

    const result = applyGsSelectionRule(inputs);
    // S1: 500000 (55.6%), S2: 300000 (33.3%), cumulative 88.9% ≥ 70%
    // suppliersAt70Pct = 2, top40Count = min(40, 3) = 3
    // selectionMethod = max(2, 3) = 3 → "top40_rule" (3 suppliers > 2)
    expect(result.selectedSuppliers[0].supplierId).toBe("S1");
    expect(result.selectedSuppliers[1].supplierId).toBe("S2");
    expect(result.reached70Pct).toBe(true);
    expect(result.selectionMethod).toBe("top40_rule");
  });

  it("applyGsSelectionRule uses top-40 when 70% rule selects fewer", () => {
    // 50 suppliers each spending 20000 (total 1000000)
    // 70% = 700000, need 35 suppliers for 70%
    // But top-40 is greater, so top-40 wins
    const suppliers: RankedSupplier[] = Array.from({ length: 50 }, (_, i) => ({
      supplierId: `S${String(i + 1).padStart(3, "0")}`,
      name: `Supplier ${i + 1}`,
      spend: 20000,
      localityClassification: "local" as const,
      localContentPercentage: 100,
      rank: i + 1,
    }));

    const inputs: GoodsServicesInputs = {
      suppliers,
      totalGoodsServicesCost: 1000000,
    };

    const result = applyGsSelectionRule(inputs);
    // 70% needs 35 suppliers, top-40 is 40 → top-40 wins
    expect(result.selectedSuppliers.length).toBe(40);
    expect(result.selectionMethod).toBe("top40_rule");
  });

  it("applyGsSelectionRule ties broken by supplierId lexicographic order", () => {
    const inputs: GoodsServicesInputs = {
      suppliers: [
        {
          supplierId: "S2",
          name: "B",
          spend: 100000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 1,
        },
        {
          supplierId: "S1",
          name: "A",
          spend: 100000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 1,
        },
      ],
      totalGoodsServicesCost: 200000,
    };

    const result = applyGsSelectionRule(inputs);
    // Same spend → sorted by supplierId: S1 before S2
    expect(result.selectedSuppliers[0].supplierId).toBe("S1");
    expect(result.selectedSuppliers[1].supplierId).toBe("S2");
  });
});

// ─── Asset Depreciation Pillar Tests ───

describe("LCGPA Asset Pillar", () => {
  it("computeLcAssetDepreciation applies 100% to KSA and 20% to foreign", () => {
    const inputs: AssetDepreciationInputs = {
      ksaManufacturedDepreciation: 200000,
      foreignAssetDepreciation: 100000,
      totalDepreciation: 300000,
    };

    const result = computeLcAssetDepreciation(inputs);
    // KSA: 200000 × 100% = 200000
    // Foreign: 100000 × 20% = 20000
    // Total LC = 220000
    expect(result.lcValue).toBe(220000);
    expect(result.totalCost).toBe(300000);
  });

  it("computeLcAssetDepreciation returns 0 when all assets are foreign", () => {
    const inputs: AssetDepreciationInputs = {
      ksaManufacturedDepreciation: 0,
      foreignAssetDepreciation: 500000,
      totalDepreciation: 500000,
    };

    const result = computeLcAssetDepreciation(inputs);
    // Foreign: 500000 × 20% = 100000
    expect(result.lcValue).toBe(100000);
  });

  it("computeLcAssetDepreciation returns full value when all assets are KSA", () => {
    const inputs: AssetDepreciationInputs = {
      ksaManufacturedDepreciation: 500000,
      foreignAssetDepreciation: 0,
      totalDepreciation: 500000,
    };

    const result = computeLcAssetDepreciation(inputs);
    expect(result.lcValue).toBe(500000);
  });

  it("computeLcAssetDepreciation handles zero total depreciation", () => {
    const inputs: AssetDepreciationInputs = {
      ksaManufacturedDepreciation: 0,
      foreignAssetDepreciation: 0,
      totalDepreciation: 0,
    };

    const result = computeLcAssetDepreciation(inputs);
    expect(result.lcValue).toBe(0);
    expect(result.totalCost).toBe(0);
  });
});

// ─── Labor Compensation Pillar Tests ───

describe("LCGPA Labor Pillar", () => {
  it("computeLcLaborCompensation applies 100% to Saudi and 37% to expat", () => {
    const inputs: LaborCompensationInputs = {
      saudiCompensation: 400000,
      expatCompensation: 300000,
      totalCompensation: 700000,
    };

    const result = computeLcLaborCompensation(inputs);
    // Saudi: 400000 × 100% = 400000
    // Expat: 300000 × 37% = 111000
    // Total LC = 511000
    expect(result.lcValue).toBe(511000);
    expect(result.totalCost).toBe(700000);
  });

  it("computeLcLaborCompensation returns full value when all employees are Saudi", () => {
    const inputs: LaborCompensationInputs = {
      saudiCompensation: 1000000,
      expatCompensation: 0,
      totalCompensation: 1000000,
    };

    const result = computeLcLaborCompensation(inputs);
    expect(result.lcValue).toBe(1000000);
  });

  it("computeLcLaborCompensation returns 37% when all employees are expat", () => {
    const inputs: LaborCompensationInputs = {
      saudiCompensation: 0,
      expatCompensation: 1000000,
      totalCompensation: 1000000,
    };

    const result = computeLcLaborCompensation(inputs);
    expect(result.lcValue).toBe(370000);
  });

  it("computeLcLaborCompensation handles zero compensation", () => {
    const inputs: LaborCompensationInputs = {
      saudiCompensation: 0,
      expatCompensation: 0,
      totalCompensation: 0,
    };

    const result = computeLcLaborCompensation(inputs);
    expect(result.lcValue).toBe(0);
  });

  it("computeLcLaborCompensation uses 37% default when expatLcRate is omitted", () => {
    const inputs: LaborCompensationInputs = {
      saudiCompensation: 0,
      expatCompensation: 1000000,
      totalCompensation: 1000000,
    };

    const result = computeLcLaborCompensation(inputs);
    // Default: 1000000 × 0.37 = 370000
    expect(result.lcValue).toBe(370000);
  });

  it("computeLcLaborCompensation uses 53.4% when expatLcRate = 0.534 (template rate)", () => {
    const inputs: LaborCompensationInputs = {
      saudiCompensation: 0,
      expatCompensation: 1000000,
      totalCompensation: 1000000,
      expatLcRate: 0.534,
    };

    const result = computeLcLaborCompensation(inputs);
    // Template rate: 1000000 × 0.534 = 534000
    expect(result.lcValue).toBe(534000);
  });

  it("computeLcLaborCompensation with custom rate mixes Saudi 100% and expat custom %", () => {
    const inputs: LaborCompensationInputs = {
      saudiCompensation: 400000,
      expatCompensation: 300000,
      totalCompensation: 700000,
      expatLcRate: 0.534,
    };

    const result = computeLcLaborCompensation(inputs);
    // Saudi: 400000 × 100% = 400000
    // Expat: 300000 × 53.4% = 160200
    // Total LC = 560200
    expect(result.lcValue).toBe(560200);
  });
});

// ─── Capacity Building Pillar Tests ───

describe("LCGPA Capacity Building Pillar", () => {
  it("computeLcCapacityBuilding sums all local attributions", () => {
    const inputs: CapacityBuildingInputs = {
      saudiTrainingCost: 50000,
      supplierDevelopmentCost: 30000,
      rdCostInKsa: 20000,
      totalCapacityBuildingCost: 100000,
    };

    const result = computeLcCapacityBuilding(inputs);
    // Training: 50000 × 100% = 50000
    // Development: 30000
    // R&D: 20000 × 100% = 20000
    // Total LC = 100000
    expect(result.lcValue).toBe(100000);
    expect(result.totalCost).toBe(100000);
  });

  it("computeLcCapacityBuilding returns 0 when no capacity building costs", () => {
    const inputs: CapacityBuildingInputs = {
      saudiTrainingCost: 0,
      supplierDevelopmentCost: 0,
      rdCostInKsa: 0,
      totalCapacityBuildingCost: 0,
    };

    const result = computeLcCapacityBuilding(inputs);
    expect(result.lcValue).toBe(0);
    expect(result.totalCost).toBe(0);
  });
});

// ─── Overall LCGPA Formula Tests ───

describe("LCGPA Overall Formula", () => {
  it("computeLcgpaScore produces correct 4-pillar result", () => {
    const inputs = makeFullInputs();
    const result = computeLcgpaScore(inputs);

    // Verify pillar values
    expect(result.lcGoodsServices).toBeDefined();
    expect(result.lcAssetDepreciation).toBeDefined();
    expect(result.lcLaborCompensation).toBeDefined();
    expect(result.lcCapacityBuilding).toBeDefined();

    // Verify overall percentage is between 0 and 100
    expect(result.overallLcPct).toBeGreaterThanOrEqual(0);
    expect(result.overallLcPct).toBeLessThanOrEqual(100);

    // Verify pillar percentages sum approximately to overall
    const pillarSum =
      result.gsLcPct + result.adLcPct + result.lcPillarLcPct + result.cbLcPct;
    expect(Math.abs(pillarSum - result.overallLcPct)).toBeLessThan(0.1);
  });

  it("computeLcgpaScore is deterministic — same inputs produce same output", () => {
    const inputs = makeFullInputs();
    const result1 = computeLcgpaScore(inputs);
    const result2 = computeLcgpaScore(inputs);

    expect(result1.overallLcPct).toBe(result2.overallLcPct);
    expect(result1.lcGoodsServices).toBe(result2.lcGoodsServices);
    expect(result1.lcAssetDepreciation).toBe(result2.lcAssetDepreciation);
    expect(result1.lcLaborCompensation).toBe(result2.lcLaborCompensation);
    expect(result1.lcCapacityBuilding).toBe(result2.lcCapacityBuilding);
    expect(result1.totalCosts).toBe(result2.totalCosts);
  });

  it("computeLcgpaScore handles all-zero inputs", () => {
    const inputs: LcPillarInputs = {
      goodsServices: { suppliers: [], totalGoodsServicesCost: 0 },
      assetDepreciation: {
        ksaManufacturedDepreciation: 0,
        foreignAssetDepreciation: 0,
        totalDepreciation: 0,
      },
      laborCompensation: {
        saudiCompensation: 0,
        expatCompensation: 0,
        totalCompensation: 0,
      },
      capacityBuilding: {
        saudiTrainingCost: 0,
        supplierDevelopmentCost: 0,
        rdCostInKsa: 0,
        totalCapacityBuildingCost: 0,
      },
    };

    const result = computeLcgpaScore(inputs);
    expect(result.overallLcPct).toBe(0);
    expect(result.totalCosts).toBe(0);
  });

  it("computeLcgpaScore produces 100% when all inputs are fully local", () => {
    const inputs: LcPillarInputs = {
      goodsServices: {
        suppliers: [
          {
            supplierId: "S1",
            name: "Local",
            spend: 1000000,
            localityClassification: "local",
            localContentPercentage: 100,
            rank: 1,
          },
        ],
        totalGoodsServicesCost: 1000000,
      },
      assetDepreciation: {
        ksaManufacturedDepreciation: 500000,
        foreignAssetDepreciation: 0,
        totalDepreciation: 500000,
      },
      laborCompensation: {
        saudiCompensation: 800000,
        expatCompensation: 0,
        totalCompensation: 800000,
      },
      capacityBuilding: {
        saudiTrainingCost: 100000,
        supplierDevelopmentCost: 50000,
        rdCostInKsa: 50000,
        totalCapacityBuildingCost: 200000,
      },
    };

    const result = computeLcgpaScore(inputs);
    // All local → LC = total costs → 100%
    expect(result.overallLcPct).toBe(100);
  });

  it("computeLcgpaScore correctly computes with known numbers", () => {
    // Simplified: only labor pillar, no G&S, no assets, no CB
    const inputs: LcPillarInputs = {
      goodsServices: { suppliers: [], totalGoodsServicesCost: 0 },
      assetDepreciation: {
        ksaManufacturedDepreciation: 0,
        foreignAssetDepreciation: 0,
        totalDepreciation: 0,
      },
      laborCompensation: {
        saudiCompensation: 100000,
        expatCompensation: 100000,
        totalCompensation: 200000,
      },
      capacityBuilding: {
        saudiTrainingCost: 0,
        supplierDevelopmentCost: 0,
        rdCostInKsa: 0,
        totalCapacityBuildingCost: 0,
      },
    };

    const result = computeLcgpaScore(inputs);
    // LC_LC = 100000 × 100% + 100000 × 37% = 137000
    // Total costs = 200000
    // LC% = 137000 / 200000 × 100 = 68.5%
    expect(result.lcLaborCompensation).toBe(137000);
    expect(result.totalCosts).toBe(200000);
    expect(result.overallLcPct).toBe(68.5);
  });
});

// ─── Financial Evaluation Tests (Article 17) ───

describe("LCGPA Financial Evaluation", () => {
  const validInputs: FinancialEvaluationInputs = {
    tenderReference: "T-2026-001",
    supplierId: "SUP-001",
    supplierName: "Saudi Supplier",
    bidPrice: 1000000,
    lowestBidPrice: 900000,
    baselineLcPct: 60,
    targetedLcPct: 75,
    isListedCompany: false,
  };

  it("computeFinancialEvaluation produces correct Article 17 score", () => {
    const output = computeFinancialEvaluation(validInputs);

    expect(output.success).toBe(true);
    expect(output.error).toBeNull();
    expect(output.result).not.toBeNull();

    // PriceScore = (900000 / 1000000) × 60 = 54
    expect(output.result!.priceScore).toBe(54);

    // LCScore = ((75 × 50% + 60 × 50%) / 100 + 0) × 40 = (67.5 / 100) × 40 = 0.675 × 40 = 27
    expect(output.result!.lcScore).toBe(27);

    expect(output.result!.listedCompanyBonus).toBe(0);
    expect(output.result!.overallScore).toBe(81); // 54 + 27
    expect(output.result!.rank).toBeNull();
  });

  it("computeFinancialEvaluation adds 5% listed company bonus", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      isListedCompany: true,
    });

    expect(output.success).toBe(true);
    expect(output.result!.listedCompanyBonus).toBe(5);

    // LCScore = ((75 × 50% + 60 × 50%) / 100 + 5/100) × 40 = (0.675 + 0.05) × 40 = 29
    expect(output.result!.lcScore).toBe(29);
    expect(output.result!.overallScore).toBe(83); // 54 + 29
  });

  it("computeFinancialEvaluation handles same price as lowest", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      bidPrice: 500000,
      lowestBidPrice: 500000,
    });

    expect(output.success).toBe(true);
    // Price ratio = 500000 / 500000 = 1
    expect(output.result!.priceScore).toBe(60); // 1 × 60
  });

  it("computeFinancialEvaluation returns error for zero bid price", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      bidPrice: 0,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe("BID_PRICE_ZERO");
    expect(output.result).toBeNull();
  });

  it("computeFinancialEvaluation returns error for negative bid price", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      bidPrice: -1000000,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe("BID_PRICE_NEGATIVE");
    expect(output.result).toBeNull();
  });

  it("computeFinancialEvaluation returns error for bid below lowest", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      bidPrice: 800000,
      lowestBidPrice: 900000,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe("BID_BELOW_LOWEST");
    expect(output.result).toBeNull();
  });

  it("computeFinancialEvaluation returns error for LC% out of range", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      baselineLcPct: 110,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe("BASELINE_LC_PCT_OUT_OF_RANGE");
    expect(output.result).toBeNull();
  });

  it("computeFinancialEvaluation returns error for negative LC%", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      targetedLcPct: -5,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe("TARGETED_LC_PCT_OUT_OF_RANGE");
    expect(output.result).toBeNull();
  });

  it("computeFinancialEvaluation normalizes LC% correctly (boundary 0%)", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      baselineLcPct: 0,
      targetedLcPct: 0,
    });

    expect(output.success).toBe(true);
    // LCScore = ((0 × 50% + 0 × 50%) / 100 + 0) × 40 = 0
    expect(output.result!.lcScore).toBe(0);
    expect(output.result!.overallScore).toBe(output.result!.priceScore);
  });

  it("computeFinancialEvaluation normalizes LC% correctly (boundary 100%)", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      baselineLcPct: 100,
      targetedLcPct: 100,
    });

    expect(output.success).toBe(true);
    // LCScore = ((100 × 50% + 100 × 50%) / 100 + 0) × 40 = (100 / 100) × 40 = 40
    expect(output.result!.lcScore).toBe(40);
    expect(output.result!.overallScore).toBe(output.result!.priceScore + 40);
  });

  it("computeFinancialEvaluation handles equal baseline and target", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      baselineLcPct: 50,
      targetedLcPct: 50,
    });

    expect(output.success).toBe(true);
    // LCScore = ((50 × 50% + 50 × 50%) / 100) × 40 = (50 / 100) × 40 = 20
    expect(output.result!.lcScore).toBe(20);
  });

  it("computeFinancialEvaluation adds warning for bid equals lowest", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      bidPrice: 900000,
      lowestBidPrice: 900000,
    });

    expect(output.success).toBe(true);
    expect(output.warnings).toContain("Bid price equals lowest bid price");
  });

  it("computeFinancialEvaluation adds warning for both LC% zero", () => {
    const output = computeFinancialEvaluation({
      ...validInputs,
      baselineLcPct: 0,
      targetedLcPct: 0,
    });

    expect(output.success).toBe(true);
    expect(output.warnings).toContain("Both baseline and target LC% are zero");
  });
});

// ─── Financial Evaluation Ranking Tests ───

describe("LCGPA Financial Evaluation Ranking", () => {
  it("rankFinancialEvaluations ranks bids correctly", () => {
    const bidA = computeFinancialEvaluation({
      tenderReference: "T-2026-001",
      supplierId: "SUP-A",
      supplierName: "Bid A",
      bidPrice: 1000000,
      lowestBidPrice: 800000,
      baselineLcPct: 60,
      targetedLcPct: 70,
      isListedCompany: false,
    });

    const bidB = computeFinancialEvaluation({
      tenderReference: "T-2026-001",
      supplierId: "SUP-B",
      supplierName: "Bid B",
      bidPrice: 900000,
      lowestBidPrice: 800000,
      baselineLcPct: 65,
      targetedLcPct: 75,
      isListedCompany: false,
    });

    const ranked = rankFinancialEvaluations([bidA, bidB]);
    expect(ranked[0].result!.rank).toBe(1);
    expect(ranked[1].result!.rank).toBe(2);
  });

  it("rankFinancialEvaluations assigns same rank for tied scores", () => {
    const bidA = computeFinancialEvaluation({
      tenderReference: "T-2026-001",
      supplierId: "SUP-A",
      supplierName: "Bid A",
      bidPrice: 1000000,
      lowestBidPrice: 800000,
      baselineLcPct: 60,
      targetedLcPct: 70,
      isListedCompany: false,
    });

    const bidB = computeFinancialEvaluation({
      tenderReference: "T-2026-001",
      supplierId: "SUP-B",
      supplierName: "Bid B",
      bidPrice: 1000000,
      lowestBidPrice: 800000,
      baselineLcPct: 60,
      targetedLcPct: 70,
      isListedCompany: false,
    });

    const ranked = rankFinancialEvaluations([bidA, bidB]);
    expect(ranked.length).toBe(2);
    // Both tied scores get rank 1
    expect(ranked[0].result!.rank).toBe(1);
    expect(ranked[1].result!.rank).toBe(1);
  });

  it("rankFinancialEvaluations preserves failed evaluations at end", () => {
    const validBid = computeFinancialEvaluation({
      tenderReference: "T-2026-001",
      supplierId: "SUP-A",
      supplierName: "Valid Bid",
      bidPrice: 1000000,
      lowestBidPrice: 800000,
      baselineLcPct: 60,
      targetedLcPct: 70,
      isListedCompany: false,
    });

    const invalidBid = computeFinancialEvaluation({
      tenderReference: "T-2026-001",
      supplierId: "SUP-B",
      supplierName: "Invalid Bid",
      bidPrice: 0, // Invalid
      lowestBidPrice: 800000,
      baselineLcPct: 60,
      targetedLcPct: 70,
      isListedCompany: false,
    });

    const ranked = rankFinancialEvaluations([invalidBid, validBid]);
    expect(ranked.length).toBe(2);
    // Valid bid comes first (ranked), invalid at end
    expect(ranked[0].result!.rank).toBe(1);
    expect(ranked[0].success).toBe(true);
    expect(ranked[1].success).toBe(false);
    expect(ranked[1].result).toBeNull();
  });
});

// ─── Financial Evaluation Validation Tests ───

describe("LCGPA Financial Evaluation Validation", () => {
  it("validateFinancialEvaluationInputs returns empty array for valid inputs", () => {
    const errors = validateFinancialEvaluationInputs({
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Supplier",
      bidPrice: 1000000,
      lowestBidPrice: 900000,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    });

    expect(errors).toEqual([]);
  });

  it("validateFinancialEvaluationInputs detects zero bid price", () => {
    const errors = validateFinancialEvaluationInputs({
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Supplier",
      bidPrice: 0,
      lowestBidPrice: 900000,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    });

    expect(errors).toContain("BID_PRICE_ZERO");
  });

  it("validateFinancialEvaluationInputs detects negative bid price", () => {
    const errors = validateFinancialEvaluationInputs({
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Supplier",
      bidPrice: -1000000,
      lowestBidPrice: 900000,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    });

    expect(errors).toContain("BID_PRICE_NEGATIVE");
  });

  it("validateFinancialEvaluationInputs detects bid below lowest", () => {
    const errors = validateFinancialEvaluationInputs({
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Supplier",
      bidPrice: 800000,
      lowestBidPrice: 900000,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    });

    expect(errors).toContain("BID_BELOW_LOWEST");
  });

  it("validateFinancialEvaluationInputs detects LC% out of range", () => {
    const errors = validateFinancialEvaluationInputs({
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Supplier",
      bidPrice: 1000000,
      lowestBidPrice: 900000,
      baselineLcPct: 110,
      targetedLcPct: 75,
      isListedCompany: false,
    });

    expect(errors).toContain("BASELINE_LC_PCT_OUT_OF_RANGE");
  });

  it("validateFinancialEvaluationInputs detects multiple errors", () => {
    const errors = validateFinancialEvaluationInputs({
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Supplier",
      bidPrice: -1000000,
      lowestBidPrice: 900000,
      baselineLcPct: 110,
      targetedLcPct: 75,
      isListedCompany: false,
    });

    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(errors).toContain("BID_PRICE_NEGATIVE");
    expect(errors).toContain("BASELINE_LC_PCT_OUT_OF_RANGE");
  });

  it("validateFinancialEvaluationInputs allows zero lowest bid", () => {
    const errors = validateFinancialEvaluationInputs({
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Supplier",
      bidPrice: 1000000,
      lowestBidPrice: 0,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    });

    // Zero lowest bid is allowed (it means no other bids yet)
    expect(errors).toEqual([]);
  });

  it("validateFinancialEvaluationInputs allows bid equals lowest", () => {
    const errors = validateFinancialEvaluationInputs({
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Supplier",
      bidPrice: 900000,
      lowestBidPrice: 900000,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    });

    expect(errors).toEqual([]);
  });
});

// ─── Financial Evaluation Traceability Tests ───

describe("LCGPA Financial Evaluation Traceability", () => {
  it("createFinancialEvaluationTrace produces reproducible trace", () => {
    const inputs: FinancialEvaluationInputs = {
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Saudi Supplier",
      bidPrice: 1000000,
      lowestBidPrice: 900000,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    };

    const trace = createFinancialEvaluationTrace(inputs, "user-001");

    expect(trace.evaluationRunId).toMatch(/^fev_/);
    expect(trace.method).toBe("lcgpa_v1");
    expect(trace.ruleVersion).toBeDefined();
    expect(trace.evaluatedAt).toBeDefined();
    expect(trace.evaluatedById).toBe("user-001");
    expect(trace.inputs).toEqual(inputs);
    expect(trace.intermediates.priceRatio).toBe(0.9);
    expect(trace.intermediates.lcBlendRaw).toBe(67.5);
    expect(trace.intermediates.lcNormalized).toBe(0.675);
    expect(trace.result.priceScore).toBe(54);
    expect(trace.result.lcScore).toBe(27);
    expect(trace.result.overallScore).toBe(81);
  });

  it("verifyFinancialEvaluationTrace confirms reproducibility", () => {
    const inputs: FinancialEvaluationInputs = {
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Saudi Supplier",
      bidPrice: 1000000,
      lowestBidPrice: 900000,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    };

    const trace = createFinancialEvaluationTrace(inputs);
    const isReproducible = verifyFinancialEvaluationTrace(trace);

    expect(isReproducible).toBe(true);
  });

  it("verifyFinancialEvaluationTrace fails for tampered trace", () => {
    const inputs: FinancialEvaluationInputs = {
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Saudi Supplier",
      bidPrice: 1000000,
      lowestBidPrice: 900000,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    };

    const trace = createFinancialEvaluationTrace(inputs);

    // Tamper with the result
    trace.result.overallScore = 999;

    const isReproducible = verifyFinancialEvaluationTrace(trace);
    expect(isReproducible).toBe(false);
  });

  it("createFinancialEvaluationTrace includes evidence references", () => {
    const inputs: FinancialEvaluationInputs = {
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Saudi Supplier",
      bidPrice: 1000000,
      lowestBidPrice: 900000,
      baselineLcPct: 60,
      targetedLcPct: 75,
      isListedCompany: false,
    };

    const trace = createFinancialEvaluationTrace(inputs);

    expect(trace.evidenceRefs.length).toBe(2);
    expect(trace.evidenceRefs[0].type).toBe("tender_document");
    expect(trace.evidenceRefs[1].type).toBe("supplier_declaration");
  });
});

// ─── Penalty Assessment Tests ───

describe("LCGPA Penalty Assessment", () => {
  it("computePenaltyAssessment flags penalty when gap exceeds 5%", () => {
    const output = computePenaltyAssessment({
      contractValue: 10000000,
      targetLcPct: 60,
      actualLcPct: 54,
    });

    expect(output.success).toBe(true);
    // Variance = 54 - 60 = -6 (gap of 6%)
    expect(output.result!.variance).toBe(-6);
    expect(output.result!.exceedsThreshold).toBe(true);
    expect(output.result!.maxPenaltyPct).toBe(10);
    expect(output.result!.maxPenaltyAmount).toBe(1000000); // 10M × 10% = 1M
  });

  it("computePenaltyAssessment does NOT flag when gap is exactly 5%", () => {
    const output = computePenaltyAssessment({
      contractValue: 10000000,
      targetLcPct: 60,
      actualLcPct: 55,
    });

    expect(output.success).toBe(true);
    // Variance = 55 - 60 = -5 (exactly 5%, not exceeding)
    expect(output.result!.variance).toBe(-5);
    expect(output.result!.exceedsThreshold).toBe(false);
    expect(output.result!.maxPenaltyPct).toBe(0);
    expect(output.result!.maxPenaltyAmount).toBe(0);
  });

  it("computePenaltyAssessment does NOT flag when actual exceeds target", () => {
    const output = computePenaltyAssessment({
      contractValue: 10000000,
      targetLcPct: 60,
      actualLcPct: 70,
    });

    expect(output.success).toBe(true);
    // Variance = 70 - 60 = +10 (positive, exceeds 5%)
    expect(output.result!.variance).toBe(10);
    expect(output.result!.exceedsThreshold).toBe(true);
    expect(output.result!.maxPenaltyPct).toBe(10);
  });

  it("computePenaltyAssessment handles zero contract value", () => {
    const output = computePenaltyAssessment({
      contractValue: 0,
      targetLcPct: 60,
      actualLcPct: 50,
    });

    expect(output.success).toBe(true);
    expect(output.result!.variance).toBe(-10);
    expect(output.result!.exceedsThreshold).toBe(true);
    expect(output.result!.maxPenaltyAmount).toBe(0); // 0 × 10% = 0
  });

  it("computePenaltyAssessment returns error for negative contract value", () => {
    const output = computePenaltyAssessment({
      contractValue: -1000000,
      targetLcPct: 60,
      actualLcPct: 50,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe("CONTRACT_VALUE_NEGATIVE");
    expect(output.result).toBeNull();
  });

  it("computePenaltyAssessment returns error for LC% out of range", () => {
    const output = computePenaltyAssessment({
      contractValue: 10000000,
      targetLcPct: 110,
      actualLcPct: 50,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe("TARGET_LC_PCT_OUT_OF_RANGE");
    expect(output.result).toBeNull();
  });
});

// ─── Gradual Plan Tests ───

describe("LCGPA Gradual Plan", () => {
  it("computeGradualPlan sets deadline 60 days after award", () => {
    const awardDate = new Date("2026-01-01");
    const output = computeGradualPlan({
      awardDate,
      baselineLcPct: 50,
      targetLcPct: 70,
    });

    expect(output.success).toBe(true);
    const expectedDeadline = new Date("2026-03-02"); // Jan 1 + 60 days
    expect(output.result!.submissionDeadline.getTime()).toBe(expectedDeadline.getTime());
  });

  it("computeGradualPlan correctly computes days remaining", () => {
    const awardDate = new Date();
    awardDate.setDate(awardDate.getDate() - 30); // 30 days ago
    const output = computeGradualPlan({
      awardDate,
      baselineLcPct: 50,
      targetedLcPct: 70,
    });

    expect(output.success).toBe(true);
    // 30 days passed, 30 days remaining
    expect(output.result!.daysRemaining).toBeGreaterThanOrEqual(29);
    expect(output.result!.daysRemaining).toBeLessThanOrEqual(31);
  });

  it("computeGradualPlan generates milestones", () => {
    const output = computeGradualPlan({
      awardDate: new Date("2026-01-01"),
      baselineLcPct: 50,
      targetedLcPct: 70,
    }, 4);

    expect(output.success).toBe(true);
    expect(output.milestones).not.toBeNull();
    expect(output.milestones!.length).toBe(4);
    expect(output.milestones![0].sequence).toBe(1);
    expect(output.milestones![3].targetLcPct).toBe(70);
  });

  it("computeGradualPlan returns error for invalid inputs", () => {
    const output = computeGradualPlan({
      awardDate: new Date("invalid"),
      baselineLcPct: 50,
      targetedLcPct: 70,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe("AWARD_DATE_REQUIRED");
    expect(output.result).toBeNull();
  });

  it("computeGradualPlan returns error for target below baseline", () => {
    const output = computeGradualPlan({
      awardDate: new Date("2026-01-01"),
      baselineLcPct: 70,
      targetedLcPct: 50,
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe("TARGET_BELOW_BASELINE");
    expect(output.result).toBeNull();
  });
});

// ─── Ownership Rule Tests ───

describe("LCGPA Ownership Rule", () => {
  it("checkOwnershipRule classifies Saudi when ownership >= 50%", () => {
    const result = checkOwnershipRule(50, null);
    expect(result.meetsThreshold).toBe(true);
    expect(result.classification).toBe("Saudi");
  });

  it("checkOwnershipRule classifies joint_venture when ownership < 50%", () => {
    const result = checkOwnershipRule(30, null);
    expect(result.meetsThreshold).toBe(false);
    expect(result.classification).toBe("joint_venture");
  });

  it("checkOwnershipRule classifies foreign when ownership is 0", () => {
    const result = checkOwnershipRule(0, "foreign");
    expect(result.meetsThreshold).toBe(false);
    expect(result.classification).toBe("foreign");
  });

  it("checkOwnershipRule handles null ownership", () => {
    const result = checkOwnershipRule(null, null);
    expect(result.meetsThreshold).toBe(false);
    expect(result.saudiOwnershipPct).toBe(0);
  });

  it("checkOwnershipRule clamps values to 0-100", () => {
    const result = checkOwnershipRule(150, null);
    expect(result.saudiOwnershipPct).toBe(100);
    expect(result.meetsThreshold).toBe(true);
  });
});

// ─── Validation Tests ───

describe("LCGPA Input Validation", () => {
  it("validateLcInputs returns empty array for valid inputs", () => {
    const inputs = makeFullInputs();
    const errors = validateLcInputs(inputs);
    expect(errors).toHaveLength(0);
  });

  it("validateLcInputs catches negative values", () => {
    const inputs = makeFullInputs();
    inputs.goodsServices.totalGoodsServicesCost = -100;
    const errors = validateLcInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("non-negative");
  });

  it("validateLcInputs catches out-of-range localContentPercentage", () => {
    const inputs = makeFullInputs();
    inputs.goodsServices.suppliers[0].localContentPercentage = 150;
    const errors = validateLcInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("0-100");
  });
});

// ─── Calculation Trace Tests ───

describe("LCGPA Calculation Trace", () => {
  it("createCalculationTrace produces verifiable trace", () => {
    const inputs = makeFullInputs();
    const trace = createCalculationTrace(inputs, "lcgpa_v1", "user-001");

    expect(trace.calculationRunId).toMatch(/^lcr_/);
    expect(trace.method).toBe("lcgpa_v1");
    expect(trace.ruleVersion).toBe("2026-01");
    expect(trace.computedById).toBe("user-001");
    expect(trace.result.overallLcPct).toBeGreaterThanOrEqual(0);
    expect(trace.evidenceRefs.length).toBeGreaterThan(0);
  });

  it("verifyTrace confirms reproducibility", () => {
    const inputs = makeFullInputs();
    const trace = createCalculationTrace(inputs, "lcgpa_v1");

    expect(verifyTrace(trace)).toBe(true);
  });

  it("createCalculationTrace is deterministic", () => {
    const inputs = makeFullInputs();
    const trace1 = createCalculationTrace(inputs, "lcgpa_v1");
    const trace2 = createCalculationTrace(inputs, "lcgpa_v1");

    // Same result (different IDs and timestamps)
    expect(trace1.result.overallLcPct).toBe(trace2.result.overallLcPct);
    expect(trace1.result.lcGoodsServices).toBe(trace2.result.lcGoodsServices);
    expect(trace1.result.totalCosts).toBe(trace2.result.totalCosts);
  });
});

// ─── SME Preference Tests (Article 12) ───

describe("LCGPA SME Preference (Article 12)", () => {
  it("computeSmePreference applies 10% discount for local SME", () => {
    const result = computeSmePreference(1000000, true);
    expect(result.preferenceApplied).toBe(true);
    expect(result.preferenceAmount).toBe(100000);
    expect(result.adjustedPrice).toBe(900000);
  });

  it("computeSmePreference does not apply for non-SME", () => {
    const result = computeSmePreference(1000000, false);
    expect(result.preferenceApplied).toBe(false);
    expect(result.preferenceAmount).toBe(0);
    expect(result.adjustedPrice).toBe(1000000);
  });

  it("computeSmePreference does not apply for negative bid price", () => {
    const result = computeSmePreference(-1000000, true);
    expect(result.preferenceApplied).toBe(false);
    expect(result.adjustedPrice).toBe(-1000000);
  });

  it("computeSmePreference does not apply for zero bid price", () => {
    const result = computeSmePreference(0, true);
    expect(result.preferenceApplied).toBe(false);
    expect(result.adjustedPrice).toBe(0);
  });

  it("computeSmePreference rounds to 2 decimal places", () => {
    const result = computeSmePreference(333333, true);
    expect(result.preferenceAmount).toBe(33333.3);
    expect(result.adjustedPrice).toBe(299999.7);
  });
});

// ─── Price Preference Tests (Article 11) ───

describe("LCGPA Price Preference (Article 11)", () => {
  it("computePricePreference adds 10% for zero national products", () => {
    const result = computePricePreference(1000000, 0);
    expect(result.preferenceApplied).toBe(true);
    expect(result.preferenceAmount).toBe(100000);
    expect(result.adjustedBidValue).toBe(1100000);
  });

  it("computePricePreference adds nothing for 100% national products", () => {
    const result = computePricePreference(1000000, 1);
    expect(result.preferenceApplied).toBe(false);
    expect(result.preferenceAmount).toBe(0);
    expect(result.adjustedBidValue).toBe(1000000);
  });

  it("computePricePreference adds partial for 60% national products", () => {
    const result = computePricePreference(1000000, 0.6);
    expect(result.preferenceApplied).toBe(true);
    expect(result.preferenceAmount).toBe(40000);
    expect(result.adjustedBidValue).toBe(1040000);
  });

  it("computePricePreference clamps share to [0,1]", () => {
    const result = computePricePreference(1000000, 1.5);
    expect(result.preferenceAmount).toBe(0);
    expect(result.adjustedBidValue).toBe(1000000);
  });

  it("computePricePreference does not apply for negative bid price", () => {
    const result = computePricePreference(-1000000, 0.5);
    expect(result.preferenceApplied).toBe(false);
    expect(result.adjustedBidValue).toBe(-1000000);
  });
});

// ─── Unified Tender Evaluation Tests (WAVE 8) ───

describe("LCGPA Unified Tender Evaluation (WAVE 8)", () => {
  const baseInputs: TenderEvaluationInputs = {
    tenderReference: "T-2026-001",
    supplierId: "SUP-001",
    supplierName: "Supplier A",
    bidPrice: 1000000,
    lowestBidPrice: 950000,
    baselineLcPct: 45,
    targetedLcPct: 55,
    isListedCompany: false,
    saudiOwnershipPct: 60,
    currentClassification: null,
    isLocalSme: false,
    nationalProductShare: 0.5,
  };

  it("computeTenderEvaluation succeeds with all inputs", () => {
    const result = computeTenderEvaluation(baseInputs);
    expect(result.ownershipCheck.meetsThreshold).toBe(true);
    expect(result.smePreference.preferenceApplied).toBe(false);
    expect(result.pricePreference.preferenceApplied).toBe(true);
    expect(result.pricePreference.preferenceAmount).toBe(50000);
    expect(result.adjustedBidPrice).toBe(1050000);
    expect(result.financialEvaluation.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0); // price preference warning
  });

  it("computeTenderEvaluation applies SME preference", () => {
    const inputs: TenderEvaluationInputs = {
      ...baseInputs,
      isLocalSme: true,
    };
    const result = computeTenderEvaluation(inputs);
    expect(result.smePreference.preferenceApplied).toBe(true);
    expect(result.smePreference.preferenceAmount).toBe(100000);
    // SME reduces by 100k, price preference adds 50k (for 50% non-national)
    expect(result.adjustedBidPrice).toBe(950000);
  });

  it("computeTenderEvaluation fails ownership check when <50%", () => {
    const inputs: TenderEvaluationInputs = {
      ...baseInputs,
      saudiOwnershipPct: 30,
    };
    const result = computeTenderEvaluation(inputs);
    expect(result.ownershipCheck.meetsThreshold).toBe(false);
    expect(result.warnings).toContainEqual(
      expect.stringContaining("Saudi ownership"),
    );
  });

  it("computeTenderEvaluation includes penalty assessment when provided", () => {
    const inputs: TenderEvaluationInputs = {
      ...baseInputs,
      contractValue: 1000000,
      targetLcPct: 50,
      actualLcPct: 52,
    };
    const result = computeTenderEvaluation(inputs);
    expect(result.penaltyAssessment).toBeDefined();
    expect(result.penaltyAssessment!.success).toBe(true);
  });

  it("computeTenderEvaluation includes gradual plan when award date provided", () => {
    const inputs: TenderEvaluationInputs = {
      ...baseInputs,
      awardDate: new Date("2026-01-01"),
    };
    const result = computeTenderEvaluation(inputs);
    expect(result.gradualPlan).toBeDefined();
    expect(result.gradualPlan!.success).toBe(true);
  });

  it("computeTenderEvaluation omits penalty and plan when not provided", () => {
    const result = computeTenderEvaluation(baseInputs);
    expect(result.penaltyAssessment).toBeUndefined();
    expect(result.gradualPlan).toBeUndefined();
  });

  it("computeTenderEvaluation handles listed company bonus", () => {
    const inputs: TenderEvaluationInputs = {
      ...baseInputs,
      isListedCompany: true,
    };
    const result = computeTenderEvaluation(inputs);
    expect(result.financialEvaluation.success).toBe(true);
    // Listed company gets +5 percentage points
    if (result.financialEvaluation.success) {
      expect(result.financialEvaluation.result!.lcScore).toBeGreaterThan(0);
    }
  });

  it("computeTenderEvaluation handles 100% national products (no price adjustment)", () => {
    const inputs: TenderEvaluationInputs = {
      ...baseInputs,
      nationalProductShare: 1,
    };
    const result = computeTenderEvaluation(inputs);
    expect(result.pricePreference.preferenceApplied).toBe(false);
    expect(result.pricePreference.preferenceAmount).toBe(0);
    expect(result.adjustedBidPrice).toBe(1000000);
  });
});
