// ─── LocalContentOS — Workbook-to-LCGPA Mapper Tests ───
// Verifies that workbook lines are correctly extracted into LCGPA pillar inputs.

import type { LcWorkbookLine } from "@prisma/client";
import {
  extractLcgpaInputs,
  extractLaborPillar,
  extractAssetPillar,
  extractCapacityBuildingPillar,
} from "../workbook-mapper";
import { computeLcgpaScore } from "../calculation-engine";
import type { RankedSupplier } from "../types";

// ─── Helper: Create a mock workbook line ───

function makeLine(
  code: string,
  manualValue: number | null,
  autoFillValue: number | null = null,
): LcWorkbookLine {
  return {
    id: `line-${code}`,
    workbookId: "wb-test",
    section: "workforce",
    code,
    name: `Line ${code}`,
    autoFillable: true,
    autoFilled: autoFillValue !== null,
    autoFillValue,
    autoFillSource: null,
    manualValue,
    source: "manual",
    confidence: "high",
    evidenceRequired: false,
    evidenceTypes: null,
    notes: null,
    displayOrder: 0,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as LcWorkbookLine;
}

// ─── Labor Pillar Tests ───

describe("Workbook Mapper — Labor Pillar", () => {
  it("extractLaborPillar reads WRK-05 and WRK-06 values", () => {
    const lines = [
      makeLine("WRK-05", 400000), // Saudi compensation
      makeLine("WRK-06", 300000), // Expat compensation
      makeLine("WRK-04", 700000), // Total payroll
    ];

    const result = extractLaborPillar(lines);
    expect(result.saudiCompensation).toBe(400000);
    expect(result.expatCompensation).toBe(300000);
    expect(result.totalCompensation).toBe(700000);
  });

  it("extractLaborPillar falls back to sum when WRK-04 is missing", () => {
    const lines = [
      makeLine("WRK-05", 400000),
      makeLine("WRK-06", 300000),
    ];

    const result = extractLaborPillar(lines);
    expect(result.totalCompensation).toBe(700000);
  });

  it("extractLaborPillar returns zeros when no lines present", () => {
    const result = extractLaborPillar([]);
    expect(result.saudiCompensation).toBe(0);
    expect(result.expatCompensation).toBe(0);
    expect(result.totalCompensation).toBe(0);
  });

  it("extractLaborPillar uses manualValue over autoFillValue", () => {
    const lines = [
      makeLine("WRK-05", 500000, 400000),
      makeLine("WRK-06", 200000, 250000),
    ];

    const result = extractLaborPillar(lines);
    expect(result.saudiCompensation).toBe(500000);
    expect(result.expatCompensation).toBe(200000);
  });
});

// ─── Asset Pillar Tests ───

describe("Workbook Mapper — Asset Pillar", () => {
  it("extractAssetPillar reads AST-01, AST-02, AST-03 values", () => {
    const lines = [
      makeLine("AST-01", 200000), // KSA manufactured
      makeLine("AST-03", 100000), // Foreign
      makeLine("AST-02", 300000), // Total
    ];

    const result = extractAssetPillar(lines);
    expect(result.ksaManufacturedDepreciation).toBe(200000);
    expect(result.foreignAssetDepreciation).toBe(100000);
    expect(result.totalDepreciation).toBe(300000);
  });

  it("extractAssetPillar falls back to sum when AST-02 is missing", () => {
    const lines = [
      makeLine("AST-01", 200000),
      makeLine("AST-03", 100000),
    ];

    const result = extractAssetPillar(lines);
    expect(result.totalDepreciation).toBe(300000);
  });

  it("extractAssetPillar returns zeros when no lines present", () => {
    const result = extractAssetPillar([]);
    expect(result.ksaManufacturedDepreciation).toBe(0);
    expect(result.foreignAssetDepreciation).toBe(0);
    expect(result.totalDepreciation).toBe(0);
  });
});

// ─── Capacity Building Pillar Tests ───

describe("Workbook Mapper — Capacity Building Pillar", () => {
  it("extractCapacityBuildingPillar reads CAP-01, CAP-02, CAP-03, CAP-04", () => {
    const lines = [
      makeLine("CAP-01", 50000),  // Training
      makeLine("CAP-02", 30000),  // Supplier dev
      makeLine("CAP-03", 20000),  // R&D
      makeLine("CAP-04", 100000), // Total
    ];

    const result = extractCapacityBuildingPillar(lines);
    expect(result.saudiTrainingCost).toBe(50000);
    expect(result.supplierDevelopmentCost).toBe(30000);
    expect(result.rdCostInKsa).toBe(20000);
    expect(result.totalCapacityBuildingCost).toBe(100000);
  });

  it("extractCapacityBuildingPillar falls back to sum when CAP-04 is missing", () => {
    const lines = [
      makeLine("CAP-01", 50000),
      makeLine("CAP-02", 30000),
      makeLine("CAP-03", 20000),
    ];

    const result = extractCapacityBuildingPillar(lines);
    expect(result.totalCapacityBuildingCost).toBe(100000);
  });

  it("extractCapacityBuildingPillar returns zeros when no lines present", () => {
    const result = extractCapacityBuildingPillar([]);
    expect(result.saudiTrainingCost).toBe(0);
    expect(result.supplierDevelopmentCost).toBe(0);
    expect(result.rdCostInKsa).toBe(0);
    expect(result.totalCapacityBuildingCost).toBe(0);
  });
});

// ─── Full Mapper Tests ───

describe("Workbook Mapper — Full Extraction", () => {
  it("extractLcgpaInputs produces valid inputs for computeLcgpaScore", () => {
    const lines = [
      makeLine("WRK-05", 400000),
      makeLine("WRK-06", 300000),
      makeLine("WRK-04", 700000),
      makeLine("AST-01", 200000),
      makeLine("AST-03", 100000),
      makeLine("AST-02", 300000),
      makeLine("CAP-01", 50000),
      makeLine("CAP-02", 30000),
      makeLine("CAP-03", 20000),
      makeLine("CAP-04", 100000),
    ];

    const suppliers: RankedSupplier[] = [
      {
        supplierId: "S1",
        name: "Local supplier",
        spend: 500000,
        localityClassification: "local",
        localContentPercentage: 100,
        rank: 1,
      },
    ];

    const inputs = extractLcgpaInputs(lines, suppliers, 500000);

    // Verify the inputs can be fed to the engine without error
    const result = computeLcgpaScore(inputs);
    expect(result.overallLcPct).toBeGreaterThanOrEqual(0);
    expect(result.overallLcPct).toBeLessThanOrEqual(100);
    expect(result.totalCosts).toBeGreaterThan(0);
  });

  it("extractLcgpaInputs handles empty workbook (all zeros)", () => {
    const inputs = extractLcgpaInputs([], [], 0);
    const result = computeLcgpaScore(inputs);
    expect(result.overallLcPct).toBe(0);
    expect(result.totalCosts).toBe(0);
  });

  it("extractLcgpaInputs produces deterministic results", () => {
    const lines = [
      makeLine("WRK-05", 400000),
      makeLine("WRK-06", 300000),
      makeLine("AST-01", 200000),
      makeLine("AST-03", 100000),
      makeLine("CAP-01", 50000),
    ];

    const inputs1 = extractLcgpaInputs(lines, [], 0);
    const inputs2 = extractLcgpaInputs(lines, [], 0);

    const result1 = computeLcgpaScore(inputs1);
    const result2 = computeLcgpaScore(inputs2);

    expect(result1.overallLcPct).toBe(result2.overallLcPct);
    expect(result1.lcLaborCompensation).toBe(result2.lcLaborCompensation);
    expect(result1.lcAssetDepreciation).toBe(result2.lcAssetDepreciation);
  });
});
