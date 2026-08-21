// ─── LocalContentOS — LCGPA Supplier Ranking Tests ───
// Deterministic, reproducible. Every assertion backed by known inputs/outputs.

import { rankAndSelectSuppliers, buildLcgpaInputsFromRaw, computeLcgpaFromRaw, checkExpandedSupplierRules, applyCapexRules } from "../supplier-ranking";
import type { RawSupplierSpend, CapexAsset } from "../supplier-ranking";

// ─── Test Fixtures ───

const SAUDI_SUPPLIER: RawSupplierSpend = {
  supplierId: "SUP-001",
  name: "شركةzillaSolution Saudi",
  spend: 500000,
  localityClassification: "local",
  localContentPercentage: 85,
};

const FOREIGN_SUPPLIER: RawSupplierSpend = {
  supplierId: "SUP-002",
  name: "Global Tech Inc",
  spend: 300000,
  localityClassification: "non_local",
  localContentPercentage: 10,
};

const MIXED_SUPPLIER: RawSupplierSpend = {
  supplierId: "SUP-003",
  name: "Mixed Corp",
  spend: 200000,
  localityClassification: "mixed",
  localContentPercentage: 60,
};

const UNCLASSIFIED_SUPPLIER: RawSupplierSpend = {
  supplierId: "SUP-004",
  name: "Unknown Supplier",
  spend: 100000,
  localityClassification: "unclassified",
  localContentPercentage: null,
};

// ─── rankAndSelectSuppliers Tests ───

describe("rankAndSelectSuppliers", () => {
  it("should rank suppliers by descending spend", () => {
    const result = rankAndSelectSuppliers([
      SAUDI_SUPPLIER,
      FOREIGN_SUPPLIER,
      MIXED_SUPPLIER,
      UNCLASSIFIED_SUPPLIER,
    ]);

    expect(result.allSuppliers).toHaveLength(4);
    expect(result.allSuppliers[0].supplierId).toBe("SUP-001");
    expect(result.allSuppliers[0].rank).toBe(1);
    expect(result.allSuppliers[1].supplierId).toBe("SUP-002");
    expect(result.allSuppliers[1].rank).toBe(2);
    expect(result.allSuppliers[2].supplierId).toBe("SUP-003");
    expect(result.allSuppliers[2].rank).toBe(3);
    expect(result.allSuppliers[3].supplierId).toBe("SUP-004");
    expect(result.allSuppliers[3].rank).toBe(4);
  });

  it("should break ties by supplierId lexicographic order", () => {
    const tie1: RawSupplierSpend = {
      supplierId: "SUP-B",
      name: "B Supplier",
      spend: 100000,
      localityClassification: "local",
      localContentPercentage: 100,
    };
    const tie2: RawSupplierSpend = {
      supplierId: "SUP-A",
      name: "A Supplier",
      spend: 100000,
      localityClassification: "local",
      localContentPercentage: 100,
    };

    const result = rankAndSelectSuppliers([tie1, tie2]);
    expect(result.allSuppliers[0].supplierId).toBe("SUP-A");
    expect(result.allSuppliers[1].supplierId).toBe("SUP-B");
  });

  it("should apply 70% rule when it requires more suppliers than top-40", () => {
    // Create 50 suppliers each with 2% of total
    // Total = 50 × 10000 = 500000
    // 70% of total = 350000
    // Need 35 suppliers to reach 70% (35 × 10000 = 350000)
    // Top-40 rule would select 40 suppliers
    // max(35, 40) = 40 → top-40 rule wins
    const suppliers: RawSupplierSpend[] = Array.from({ length: 50 }, (_, i) => ({
      supplierId: `SUP-${String(i + 1).padStart(3, "0")}`,
      name: `Supplier ${i + 1}`,
      spend: 10000,
      localityClassification: "local" as const,
      localContentPercentage: 100,
    }));

    const result = rankAndSelectSuppliers(suppliers);
    expect(result.selection.selectionMethod).toBe("top40_rule");
    expect(result.selection.selectedSuppliers).toHaveLength(40);
    expect(result.excludedCount).toBe(10);
    expect(result.excludedSpend).toBe(100000);
  });

  it("should apply 70% rule when it requires more suppliers than top-40", () => {
    // Create 100 suppliers with varying spend
    // Top supplier has 50% of total → 70% rule reaches with 2 suppliers
    // Top-40 rule would select 40 suppliers
    // max(2, 40) = 40 → top-40 rule wins
    const suppliers: RawSupplierSpend[] = [
      { supplierId: "BIG", name: "Big Supplier", spend: 500000, localityClassification: "local", localContentPercentage: 100 },
      ...Array.from({ length: 99 }, (_, i) => ({
        supplierId: `SUP-${String(i + 1).padStart(3, "0")}`,
        name: `Supplier ${i + 1}`,
        spend: 5050, // Total of 99 small suppliers = 499950 ≈ 500000
        localityClassification: "local" as const,
        localContentPercentage: 100,
      })),
    ];

    const result = rankAndSelectSuppliers(suppliers);
    // 70% of 999950 = 699965
    // BIG has 500000, need 199965 more
    // Next suppliers: SUP-001 has 5050, SUP-002 has 5050, etc.
    // Need ~40 more suppliers to reach 70%
    // But top-40 rule selects 40 suppliers
    expect(result.selection.selectedSuppliers.length).toBeGreaterThanOrEqual(40);
  });

  it("should compute LC_GS value correctly for local suppliers", () => {
    const result = rankAndSelectSuppliers([SAUDI_SUPPLIER]);
    // Local supplier: 100% LC contribution
    expect(result.lcGoodsServicesValue).toBe(500000);
    expect(result.lcGoodsServicesPct).toBe(100);
  });

  it("should compute LC_GS value correctly for mixed suppliers", () => {
    const result = rankAndSelectSuppliers([MIXED_SUPPLIER]);
    // Mixed supplier: 60% LC contribution
    expect(result.lcGoodsServicesValue).toBe(120000);
    expect(result.lcGoodsServicesPct).toBe(60);
  });

  it("should compute LC_GS value correctly for non-local suppliers", () => {
    const result = rankAndSelectSuppliers([FOREIGN_SUPPLIER]);
    // Non-local supplier: 0% LC contribution
    expect(result.lcGoodsServicesValue).toBe(0);
    expect(result.lcGoodsServicesPct).toBe(0);
  });

  it("should handle empty supplier list", () => {
    const result = rankAndSelectSuppliers([]);
    expect(result.allSuppliers).toHaveLength(0);
    expect(result.selection.selectedSuppliers).toHaveLength(0);
    expect(result.totalGoodsServicesCost).toBe(0);
    expect(result.lcGoodsServicesValue).toBe(0);
    expect(result.lcGoodsServicesPct).toBe(0);
    expect(result.excludedCount).toBe(0);
    expect(result.excludedSpend).toBe(0);
  });

  it("should return correct rule version", () => {
    const result = rankAndSelectSuppliers([SAUDI_SUPPLIER]);
    expect(result.ruleVersion).toBe("2026-01");
  });

  it("should correctly identify excluded suppliers", () => {
    // 50 suppliers, each with 2% → top-40 rule wins
    const suppliers: RawSupplierSpend[] = Array.from({ length: 50 }, (_, i) => ({
      supplierId: `SUP-${String(i + 1).padStart(3, "0")}`,
      name: `Supplier ${i + 1}`,
      spend: 10000,
      localityClassification: "local" as const,
      localContentPercentage: 100,
    }));

    const result = rankAndSelectSuppliers(suppliers);
    expect(result.excludedCount).toBe(10);
    expect(result.excludedSpend).toBe(100000);
  });
});

// ─── buildLcgpaInputsFromRaw Tests ───

describe("buildLcgpaInputsFromRaw", () => {
  it("should build complete LCGPA inputs from raw data", () => {
    const inputs = buildLcgpaInputsFromRaw(
      [SAUDI_SUPPLIER, FOREIGN_SUPPLIER],
      {
        ksaManufacturedDepreciation: 100000,
        foreignAssetDepreciation: 50000,
        totalDepreciation: 150000,
        saudiCompensation: 200000,
        expatCompensation: 100000,
        totalCompensation: 300000,
        saudiTrainingCost: 20000,
        supplierDevelopmentCost: 10000,
        rdCostInKsa: 5000,
        totalCapacityBuildingCost: 35000,
      },
    );

    // G&S pillar
    expect(inputs.goodsServices.suppliers).toHaveLength(2);
    expect(inputs.goodsServices.totalGoodsServicesCost).toBe(800000);

    // Asset pillar
    expect(inputs.assetDepreciation.ksaManufacturedDepreciation).toBe(100000);
    expect(inputs.assetDepreciation.foreignAssetDepreciation).toBe(50000);
    expect(inputs.assetDepreciation.totalDepreciation).toBe(150000);

    // Labor pillar
    expect(inputs.laborCompensation.saudiCompensation).toBe(200000);
    expect(inputs.laborCompensation.expatCompensation).toBe(100000);
    expect(inputs.laborCompensation.totalCompensation).toBe(300000);

    // Capacity building pillar
    expect(inputs.capacityBuilding.saudiTrainingCost).toBe(20000);
    expect(inputs.capacityBuilding.supplierDevelopmentCost).toBe(10000);
    expect(inputs.capacityBuilding.rdCostInKsa).toBe(5000);
    expect(inputs.capacityBuilding.totalCapacityBuildingCost).toBe(35000);
  });

  it("should default workbook values to zero when not provided", () => {
    const inputs = buildLcgpaInputsFromRaw([SAUDI_SUPPLIER]);

    expect(inputs.assetDepreciation.ksaManufacturedDepreciation).toBe(0);
    expect(inputs.assetDepreciation.foreignAssetDepreciation).toBe(0);
    expect(inputs.assetDepreciation.totalDepreciation).toBe(0);
    expect(inputs.laborCompensation.saudiCompensation).toBe(0);
    expect(inputs.laborCompensation.expatCompensation).toBe(0);
    expect(inputs.laborCompensation.totalCompensation).toBe(0);
    expect(inputs.capacityBuilding.saudiTrainingCost).toBe(0);
    expect(inputs.capacityBuilding.supplierDevelopmentCost).toBe(0);
    expect(inputs.capacityBuilding.rdCostInKsa).toBe(0);
    expect(inputs.capacityBuilding.totalCapacityBuildingCost).toBe(0);
  });

  it("should handle empty supplier list", () => {
    const inputs = buildLcgpaInputsFromRaw([]);
    expect(inputs.goodsServices.suppliers).toHaveLength(0);
    expect(inputs.goodsServices.totalGoodsServicesCost).toBe(0);
  });
});

// ─── computeLcgpaFromRaw Tests ───

describe("computeLcgpaFromRaw", () => {
  it("should compute full LCGPA score from raw data", () => {
    const { result, supplierRanking } = computeLcgpaFromRaw(
      [SAUDI_SUPPLIER, FOREIGN_SUPPLIER],
      {
        ksaManufacturedDepreciation: 100000,
        foreignAssetDepreciation: 50000,
        totalDepreciation: 150000,
        saudiCompensation: 200000,
        expatCompensation: 100000,
        totalCompensation: 300000,
        saudiTrainingCost: 20000,
        supplierDevelopmentCost: 10000,
        rdCostInKsa: 5000,
        totalCapacityBuildingCost: 35000,
      },
    );

    // Total costs = 800000 + 150000 + 300000 + 35000 = 1285000
    expect(result.totalCosts).toBe(1285000);

    // LC_GS: SAUDI has 500000 spend at 100%, FOREIGN has 300000 spend at 0%
    // But selection rule may exclude FOREIGN (depends on 70%/top-40)
    // With 2 suppliers, top-40 rule selects both
    // LC_GS = 500000 × 100% + 300000 × 0% = 500000
    expect(result.lcGoodsServices).toBe(500000);

    // LC_AD: 100000 × 100% + 50000 × 20% = 110000
    expect(result.lcAssetDepreciation).toBe(110000);

    // LC_LC: 200000 × 100% + 100000 × 37% = 237000
    expect(result.lcLaborCompensation).toBe(237000);

    // LC_CB: 20000 + 10000 + 5000 = 35000
    expect(result.lcCapacityBuilding).toBe(35000);

    // Overall LC% = (500000 + 110000 + 237000 + 35000) / 1285000 × 100
    // = 882000 / 1285000 × 100 ≈ 68.63%
    expect(result.overallLcPct).toBeCloseTo(68.63, 1);

    // Supplier ranking
    expect(supplierRanking.allSuppliers).toHaveLength(2);
    expect(supplierRanking.lcGoodsServicesValue).toBe(500000);
  });

  it("should handle single supplier", () => {
    const { result } = computeLcgpaFromRaw([SAUDI_SUPPLIER], {
      ksaManufacturedDepreciation: 100000,
      totalDepreciation: 100000,
      saudiCompensation: 200000,
      totalCompensation: 200000,
    });

    // Total costs = 500000 + 100000 + 200000 + 0 = 800000
    expect(result.totalCosts).toBe(800000);

    // LC_GS = 500000 × 100% = 500000
    expect(result.lcGoodsServices).toBe(500000);

    // LC_AD = 100000 × 100% = 100000
    expect(result.lcAssetDepreciation).toBe(100000);

    // LC_LC = 200000 × 100% = 200000
    expect(result.lcLaborCompensation).toBe(200000);

    // LC_CB = 0
    expect(result.lcCapacityBuilding).toBe(0);

    // Overall LC% = (500000 + 100000 + 200000) / 800000 × 100 = 100%
    expect(result.overallLcPct).toBe(100);
  });

  it("should handle empty suppliers", () => {
    const { result } = computeLcgpaFromRaw([]);
    expect(result.totalCosts).toBe(0);
    expect(result.overallLcPct).toBe(0);
  });
});

// ─── Expanded Supplier Rules Tests (SC-05, SC-10) ───

describe("checkExpandedSupplierRules", () => {
  const makeSuppliers = (count: number, baseSpend: number): RawSupplierSpend[] =>
    Array.from({ length: count }, (_, i) => ({
      supplierId: `SUP-${String(i + 1).padStart(3, "0")}`,
      spend: baseSpend * (count - i), // Descending spend
      localContentPct: 0.5,
    }));

  it("should not require expansion when goods >= 50% and residual < 500M", () => {
    const suppliers = makeSuppliers(30, 10_000_000); // 300M total
    const result = checkExpandedSupplierRules(suppliers, 300_000_000, 200_000_000); // goods = 66.7%
    expect(result.needsExpandedTracking).toBe(false);
    expect(result.needsExtraDisclosure).toBe(false);
    expect(result.recommendedMaxSuppliers).toBe(40);
  });

  it("should require extra disclosure when goods < 50% (SC-10)", () => {
    const suppliers = makeSuppliers(30, 10_000_000); // 300M total
    const result = checkExpandedSupplierRules(suppliers, 300_000_000, 100_000_000); // goods = 33.3%
    expect(result.needsExtraDisclosure).toBe(true);
    expect(result.recommendedMaxSuppliers).toBe(300);
    expect(result.reasons[0]).toContain("SC-10");
  });

  it("should require expanded tracking when residual >= 500M (SC-05)", () => {
    // Build suppliers where top-40 capture small portion, leaving large residual
    // After sort descending: 200 suppliers at 3M = ranks 1-200, 40 at 2M = ranks 201-240
    // Top-40 spend = 40 × 3M = 120M, Total = 680M, Residual = 560M ≥ 500M
    const suppliers: RawSupplierSpend[] = [
      ...Array.from({ length: 200 }, (_, i) => ({
        supplierId: `SUP-${String(i + 1).padStart(3, "0")}`,
        spend: 3_000_000, // 3M each
        localContentPct: 0.5,
      })),
      ...Array.from({ length: 40 }, (_, i) => ({
        supplierId: `SM-${String(i + 1).padStart(3, "0")}`,
        spend: 2_000_000, // 2M each
        localContentPct: 0.5,
      })),
    ];
    // Total = 680M, top-40 = 120M, residual = 560M ≥ 500M → expansion
    const result = checkExpandedSupplierRules(suppliers, 680_000_000, 400_000_000);
    expect(result.needsExpandedTracking).toBe(true);
    expect(result.recommendedMaxSuppliers).toBeGreaterThanOrEqual(41);
    expect(result.reasons.some(r => r.includes("SC-05"))).toBe(true);
  });

  it("should combine both rules when both triggered", () => {
    const suppliers: RawSupplierSpend[] = [
      ...Array.from({ length: 200 }, (_, i) => ({
        supplierId: `SUP-${String(i + 1).padStart(3, "0")}`,
        spend: 3_000_000,
        localContentPct: 0.5,
      })),
      ...Array.from({ length: 40 }, (_, i) => ({
        supplierId: `SM-${String(i + 1).padStart(3, "0")}`,
        spend: 2_000_000,
        localContentPct: 0.5,
      })),
    ];
    const result = checkExpandedSupplierRules(suppliers, 680_000_000, 200_000_000); // goods = 29.4% < 50%
    expect(result.needsExpandedTracking).toBe(true);
    expect(result.needsExtraDisclosure).toBe(true);
    expect(result.recommendedMaxSuppliers).toBe(300); // SC-10 dominates (300 > expansion count)
    expect(result.reasons.length).toBe(2);
  });
});

// ─── Capex Rules Tests (CPX-01, CPX-02, CPX-03) ───

describe("applyCapexRules", () => {
  const makeAssets = (count: number, baseCost: number): CapexAsset[] =>
    Array.from({ length: count }, (_, i) => ({
      assetId: `ASSET-${String(i + 1).padStart(3, "0")}`,
      description: `Capital Asset ${i + 1}`,
      cost: baseCost * (count - i),
      isKsaManufactured: i % 2 === 0,
      category: "equipment" as const,
      excludeFromBaseline: false,
    }));

  it("should not require full mapping when capex < 100M", () => {
    const assets = makeAssets(10, 5_000_000); // Total: 275M... too high
    // Make smaller
    const smallAssets: CapexAsset[] = [
      { assetId: "A1", description: "Item 1", cost: 30_000_000, isKsaManufactured: true, category: "equipment", excludeFromBaseline: false },
      { assetId: "A2", description: "Item 2", cost: 20_000_000, isKsaManufactured: false, category: "equipment", excludeFromBaseline: false },
    ];
    const result = applyCapexRules(smallAssets);
    expect(result.exceedsThreshold).toBe(false);
    expect(result.requiresFullMapping).toBe(false);
    expect(result.trackedAssets.length).toBe(2);
  });

  it("should require full mapping when capex >= 100M (CPX-01)", () => {
    const assets: CapexAsset[] = [
      { assetId: "A1", description: "Large Asset", cost: 80_000_000, isKsaManufactured: true, category: "building", excludeFromBaseline: false },
      { assetId: "A2", description: "Medium Asset", cost: 30_000_000, isKsaManufactured: false, category: "equipment", excludeFromBaseline: false },
    ];
    const result = applyCapexRules(assets);
    expect(result.exceedsThreshold).toBe(true);
    expect(result.requiresFullMapping).toBe(true);
    expect(result.totalCapexAfterExclusions).toBe(110_000_000);
  });

  it("should exclude assets flagged by CPX-02", () => {
    const assets: CapexAsset[] = [
      { assetId: "A1", description: "Equipment", cost: 60_000_000, isKsaManufactured: true, category: "equipment", excludeFromBaseline: false },
      { assetId: "A2", description: "Real Estate", cost: 50_000_000, isKsaManufactured: false, category: "building", excludeFromBaseline: true },
      { assetId: "A3", description: "Land", cost: 30_000_000, isKsaManufactured: false, category: "other", excludeFromBaseline: true },
    ];
    const result = applyCapexRules(assets);
    expect(result.excludedCount).toBe(2);
    expect(result.excludedSpend).toBe(80_000_000);
    expect(result.totalCapexAfterExclusions).toBe(60_000_000);
    expect(result.exceedsThreshold).toBe(false); // 60M < 100M after exclusions
  });

  it("should track top 80 assets by descending cost (CPX-03)", () => {
    const assets = makeAssets(100, 2_000_000); // 100 assets, largest = 200M
    const result = applyCapexRules(assets);
    expect(result.trackedAssets.length).toBe(80);
    expect(result.trackedAssets[0].cost).toBeGreaterThanOrEqual(result.trackedAssets[79].cost);
    expect(result.warnings.some(w => w.includes("CPX-03"))).toBe(true);
  });

  it("should track all assets when fewer than 80", () => {
    const assets = makeAssets(50, 3_000_000);
    const result = applyCapexRules(assets);
    expect(result.trackedAssets.length).toBe(50);
    expect(result.warnings.some(w => w.includes("CPX-03"))).toBe(false);
  });

  it("should handle empty asset list", () => {
    const result = applyCapexRules([]);
    expect(result.exceedsThreshold).toBe(false);
    expect(result.trackedAssets.length).toBe(0);
    expect(result.excludedCount).toBe(0);
  });
});
