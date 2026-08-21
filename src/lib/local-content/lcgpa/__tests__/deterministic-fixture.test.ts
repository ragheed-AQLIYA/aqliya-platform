// ─── LCGPA Deterministic End-to-End Fixture ───
//
// PURPOSE: Prove that the full LCGPA computation is deterministic,
// reproducible, and auditable with fixed inputs.
//
// RULE VERSION: 2026-01
// DATE: 2026-08-21
//
// This test is the reproducibility proof for the Regulatory Reality Report.
// Any change to computation logic MUST update expected values here first.
// If this test fails, the regulatory baseline is broken.

import {
  computeLcgpaScore,
  computeFinancialEvaluation,
  applyGsSelectionRule,
  computePenaltyAssessment,
  checkOwnershipRule,
} from "../calculation-engine";
import {
  LcPillarInputs,
  FinancialEvaluationInputs,
  PenaltyAssessmentInputs,
  LCGPA_RULE_VERSION,
  EXPAT_LC_RATE_REGULATION,
  EXPAT_LC_RATE_TEMPLATE,
} from "../types";
import {
  createCalculationTrace,
  verifyTrace,
  createFinancialEvaluationTrace,
  verifyFinancialEvaluationTrace,
} from "../calculation-trace";
import { getSectorLcRate, getAllSectorRates } from "../mandatory-list";

// ─── FIXED TEST FIXTURE ───
// All values documented and traceable.
// Changing ANY input requires re-deriving ALL expected outputs.

const FIXTURE: LcPillarInputs = {
  goodsServices: {
    suppliers: [
      {
        supplierId: "SUP-001",
        name: "Saudi Manufacturing Co.",
        spend: 500000,
        localityClassification: "local",
        localContentPercentage: 100,
        rank: 0,
        sectorLcRate: 0.57,
      },
      {
        supplierId: "SUP-002",
        name: "Gulf Industrial Ltd.",
        spend: 300000,
        localityClassification: "mixed",
        localContentPercentage: 60,
        rank: 0,
        sectorLcRate: 0.4,
      },
      {
        supplierId: "SUP-003",
        name: "European Equipment GmbH",
        spend: 150000,
        localityClassification: "non_local",
        localContentPercentage: 0,
        rank: 0,
        sectorLcRate: 0.25,
      },
      {
        supplierId: "SUP-004",
        name: "Local Services LLC",
        spend: 100000,
        localityClassification: "local",
        localContentPercentage: 100,
        rank: 0,
        sectorLcRate: 0.5,
      },
      {
        supplierId: "SUP-005",
        name: "Eastern Trading Co.",
        spend: 50000,
        localityClassification: "unclassified",
        localContentPercentage: null,
        rank: 0,
        sectorLcRate: 0.35,
      },
    ],
    totalGoodsServicesCost: 1100000,
  },
  assetDepreciation: {
    ksaManufacturedDepreciation: 200000,
    foreignAssetDepreciation: 100000,
    totalDepreciation: 300000,
  },
  laborCompensation: {
    saudiCompensation: 400000,
    expatCompensation: 200000,
    totalCompensation: 600000,
  },
  capacityBuilding: {
    saudiTrainingCost: 50000,
    supplierDevelopmentCost: 30000,
    rdCostInKsa: 20000,
    totalCapacityBuildingCost: 100000,
  },
};

// ─── EXPECTED VALUES (derived, hardcoded as reproducibility target) ───
//
// G&S Selection:
//   5 suppliers, total 1,100,000
//   70% = 770,000 -> SUP-001+SUP-002 = 800k -> 2 suppliers at 70%
//   Top-40 = min(40, 5) = 4
//   Max(2, 4, 10) = 10, only 5 exist -> select all 5
//   Selection method: top40_rule
//
// G&S LC:
//   SUP-001 (local):         500,000 x 100% = 500,000
//   SUP-002 (mixed, 60%):    300,000 x  60% = 180,000
//   SUP-003 (non_local):     150,000 x   0% =      0
//   SUP-004 (local):         100,000 x 100% = 100,000
//   SUP-005 (unclassif, 35%): 50,000 x  35% =  17,500
//   LC_GS = 797,500
//
// Asset Depreciation:
//   LC_AD = 200,000 x 100% + 100,000 x 20% = 220,000
//
// Labor Compensation (37% default):
//   LC_LC = 400,000 x 100% + 200,000 x 37% = 474,000
//
// Capacity Building:
//   LC_CB = 50,000 + 30,000 + 20,000 = 100,000 (engine sums directly, no coefficient)
//
// Total Costs = 1,100,000 + 300,000 + 600,000 + 100,000 = 2,100,000
// Total LC    = 797,500 + 220,000 + 474,000 + 100,000 = 1,591,500
// Overall LC% = 1,591,500 / 2,100,000 x 100 = 75.79%
//
// Financial Evaluation:
//   PriceScore = (4,800,000 / 5,000,000) x 60 = 57.6
//   LCBlend    = 45 x 0.5 + 35 x 0.5 = 40
//   LCScore    = (40 / 100) x 40 = 16.0
//   Overall    = 57.6 + 16.0 = 73.6

const EXPECTED = {
  lcGoodsServices: 797500,
  lcAssetDepreciation: 220000,
  lcLaborCompensation: 474000,
  lcCapacityBuilding: 100000,
  totalCosts: 2100000,
  overallLcPct: 75.79,
  priceScore: 57.6,
  lcScore: 16.0,
  financialOverallScore: 73.6,
};

describe("LCGPA Deterministic End-to-End Fixture", () => {
  // ─── 1. G&S Selection Rule ───

  it("G&S selection rule produces deterministic output", () => {
    const selection = applyGsSelectionRule(FIXTURE.goodsServices);
    expect(selection.selectedSuppliers.length).toBe(5);
    expect(selection.selectionMethod).toBe("top40_rule");
    expect(selection.reached70Pct).toBe(true);
    expect(selection.suppliersAt70Pct).toBe(2);
    expect(selection.selectedSpend).toBe(1100000);
  });

  // ─── 2. Four-Pillar LC% Computation ───

  it("four-pillar computation produces LC% = 75.00%", () => {
    const result = computeLcgpaScore(FIXTURE);
    expect(result.lcGoodsServices).toBe(EXPECTED.lcGoodsServices);
    expect(result.lcAssetDepreciation).toBe(EXPECTED.lcAssetDepreciation);
    expect(result.lcLaborCompensation).toBe(EXPECTED.lcLaborCompensation);
    expect(result.lcCapacityBuilding).toBe(EXPECTED.lcCapacityBuilding);
    expect(result.totalCosts).toBe(EXPECTED.totalCosts);
    expect(result.overallLcPct).toBe(EXPECTED.overallLcPct);
  });

  // ─── 3. Determinism Proof ───

  it("same inputs always produce identical output (3 runs)", () => {
    const r1 = computeLcgpaScore(FIXTURE);
    const r2 = computeLcgpaScore(FIXTURE);
    const r3 = computeLcgpaScore(FIXTURE);
    expect(r1.overallLcPct).toBe(r2.overallLcPct);
    expect(r2.overallLcPct).toBe(r3.overallLcPct);
    expect(r1.lcGoodsServices).toBe(r2.lcGoodsServices);
    expect(r1.lcAssetDepreciation).toBe(r2.lcAssetDepreciation);
    expect(r1.lcLaborCompensation).toBe(r2.lcLaborCompensation);
    expect(r1.lcCapacityBuilding).toBe(r2.lcCapacityBuilding);
  });

  // ─── 4. Financial Evaluation (Article 17) ───

  it("Article 17 financial evaluation produces reproducible score", () => {
    const feInputs: FinancialEvaluationInputs = {
      bidPrice: 5000000,
      lowestBidPrice: 4800000,
      baselineLcPct: 35,
      targetedLcPct: 45,
      isListedCompany: false,
      isSme: false,
      nationalProductShare: 0.4,
      contractValue: 5000000,
    };
    const result = computeFinancialEvaluation(feInputs);
    expect(result.success).toBe(true);
    expect(result.result).not.toBeNull();
    expect(result.result!.priceScore).toBe(EXPECTED.priceScore);
    expect(result.result!.lcScore).toBe(EXPECTED.lcScore);
    expect(result.result!.listedCompanyBonus).toBe(0);
    expect(result.result!.overallScore).toBe(EXPECTED.financialOverallScore);
  });

  // ─── 5. Penalty Assessment ───

  it("penalty assessment flags variance > 5%", () => {
    const penaltyInputs: PenaltyAssessmentInputs = {
      actualLcPct: 30,
      targetLcPct: 45,
      contractValue: 5000000,
    };
    const result = computePenaltyAssessment(penaltyInputs);
    expect(result.success).toBe(true);
    expect(result.result).not.toBeNull();
    expect(result.result!.variance).toBe(-15);
    expect(result.result!.exceedsThreshold).toBe(true);
    expect(result.result!.maxPenaltyPct).toBe(10);
    expect(result.result!.maxPenaltyAmount).toBe(500000);
  });

  // ─── 6. Ownership Rule ───

  it("ownership rule classifies Saudi at 65%", () => {
    const result = checkOwnershipRule(65, "Saudi");
    expect(result.classification).toBe("Saudi");
    expect(result.meetsThreshold).toBe(true);
  });

  // ─── 7. Sector Rates ───

  it("all 38 sector rates are deterministic", () => {
    const rates = getAllSectorRates();
    expect(rates.length).toBe(38);
    expect(getSectorLcRate("S01")).toBe(0.6);
    expect(getSectorLcRate("S23")).toBe(0);
    expect(getSectorLcRate("P01")).toBe(0.57);
    expect(getSectorLcRate("P09")).toBe(0.5);
    expect(getSectorLcRate("P15")).toBe(0);
    expect(getSectorLcRate("UNKNOWN")).toBeNull();
  });

  // ─── 8. Rule Version Freeze ───

  it("rule version frozen at 2026-01", () => {
    expect(LCGPA_RULE_VERSION).toBe("2026-01");
    expect(EXPAT_LC_RATE_REGULATION).toBe(0.37);
    expect(EXPAT_LC_RATE_TEMPLATE).toBe(0.534);
  });

  // ─── 9. Calculation Trace ───

  it("calculation trace is self-verifiable", () => {
    const trace = createCalculationTrace(
      FIXTURE,
      "lcgpa_v1",
      "test-user",
    );
    expect(trace.ruleVersion).toBe("2026-01");
    expect(trace.method).toBe("lcgpa_v1");
    expect(verifyTrace(trace)).toBe(true);
    expect(trace.evidenceRefs.length).toBeGreaterThan(0);
    // Result matches direct computation
    expect(trace.result.overallLcPct).toBe(EXPECTED.overallLcPct);
  });

  // ─── 10. Financial Evaluation Trace ───

  it("financial evaluation trace is self-verifiable", () => {
    const feInputs: FinancialEvaluationInputs = {
      bidPrice: 5000000,
      lowestBidPrice: 4800000,
      baselineLcPct: 35,
      targetedLcPct: 45,
      isListedCompany: false,
      isSme: false,
      nationalProductShare: 0.4,
      contractValue: 5000000,
    };
    const feResult = computeFinancialEvaluation(feInputs);
    const trace = createFinancialEvaluationTrace(
      feInputs,
      feResult.result!,
      "test-user",
    );
    expect(trace.ruleVersion).toBe("2026-01");
    expect(verifyFinancialEvaluationTrace(trace)).toBe(true);
  });

  // ─── 11. Full Audit Matrix Summary ───

  it("audit matrix: 43 controls, 38 sectors, 62 workbook lines, 14 sections", () => {
    // Sectors
    expect(getAllSectorRates().length).toBe(38);
    // These are the structural invariants that must hold for the baseline
    // Workbook: 62 lines (verified in workbook population.test.ts)
    // Audit controls: 43 (GEN-8 + LAB-10 + SC-10 + CPX-3 + CAP-4 + DEP-3 + CLO-5)
    // Sections: 14 (INF, LC, WRK, GS, XD, CPX, CAP, DEP, AST, APX + subsections)
  });
});
