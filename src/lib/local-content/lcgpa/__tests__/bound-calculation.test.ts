// ─── LocalContentOS — LCGPA Bound Calculation Tests ───
//
// 7 proof-of-binding tests proving that the calculation engine is wired
// to the regulatory intelligence system via resolveForCalculation().
//
// Every test is deterministic: no network, no filesystem, no randomness, no wall clock.

import {
  computeLcgpaWithBinding,
  createBoundCalculationTrace,
  type BoundCalculationResult,
  type BoundCalculationTrace,
} from "../bound-calculation";
import { makeDataset } from "../regulatory/__tests__/dataset-helpers";
import { product } from "../regulatory/__tests__/fixtures";
import type { LcPillarInputs, RankedSupplier } from "../types";

// ─── Test Datasets ───

/**
 * OLD dataset: effective 2026-01-01 to 2026-10-01, SUPERSEDED.
 * Product 2353 has minimumLcPct = 40.
 */
const OLD_DATASET = makeDataset(
  "LCGPA_MANDATORY_LIST_2026-01",
  [product("2353", { minimumLcPct: 40 })],
  {
    status: "SUPERSEDED",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: new Date("2026-10-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
);

/**
 * CURRENT dataset: effective 2026-10-01 onward, ACTIVE.
 * Product 2353 has minimumLcPct = 50 (increased from 40).
 */
const CURRENT_DATASET = makeDataset(
  "LCGPA_MANDATORY_LIST_2026-08",
  [product("2353", { minimumLcPct: 50 })],
  {
    status: "ACTIVE",
    effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
    createdAt: new Date("2026-08-21T00:00:00.000Z"),
  },
);

const DATASETS = [OLD_DATASET, CURRENT_DATASET];

// ─── Shared Pillar Inputs ───

function makePillarInputs(): LcPillarInputs {
  return {
    goodsServices: {
      suppliers: [
        {
          supplierId: "SUP-001",
          name: "Saudi supplier",
          spend: 500000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 1,
        },
        {
          supplierId: "SUP-002",
          name: "Global Import",
          spend: 300000,
          localityClassification: "non_local",
          localContentPercentage: 0,
          rank: 2,
        },
      ],
      totalGoodsServicesCost: 800000,
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

// ─── Proof 1: Resolver Invocation ───

describe("Bound Calculation — Proof 1: Resolver invocation", () => {
  it("computeLcgpaWithBinding resolves a regulatory binding before computing", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    // Binding is present and populated — proof that resolveForCalculation was called
    expect(bound.binding).toBeDefined();
    expect(bound.binding.regulatoryAsOf).toEqual(new Date("2026-06-01T00:00:00.000Z"));
    expect(bound.binding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-01");
    expect(bound.binding.ruleVersion).toBeDefined();
    expect(bound.binding.resolution.length).toBe(1);
    expect(bound.binding.resolution[0].productCode).toBe("2353");
  });

  it("binding carries the full regulatory provenance chain", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    // Every field in the binding chain is populated
    expect(bound.binding.regulatoryArtifactSha256).toBe(OLD_DATASET.artifactSha256);
    expect(bound.binding.regulatoryParserVersion).toBe(OLD_DATASET.parserVersion);
    expect(bound.binding.regulatorySchemaVersion).toBe(OLD_DATASET.schemaVersion);
    expect(bound.binding.complete).toBe(true);
    expect(bound.binding.unresolved).toEqual([]);
  });
});

// ─── Proof 2: Rule Version Resolution ───

describe("Bound Calculation — Proof 2: Rule version resolution", () => {
  it("resolves OLD dataset rule version for a May 2026 calculation", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-05-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    expect(bound.binding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-01");
    expect(bound.binding.resolution[0].minimumLcPct).toBe(40);
    expect(bound.ruleVersion).toBe(bound.binding.ruleVersion);
  });

  it("resolves CURRENT dataset rule version for a November 2026 calculation", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    expect(bound.binding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-08");
    expect(bound.binding.resolution[0].minimumLcPct).toBe(50);
    expect(bound.ruleVersion).toBe(bound.binding.ruleVersion);
  });

  it("different dates produce different bindings — no implicit latest", () => {
    const may = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-05-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    const nov = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    // Different dataset versions resolved
    expect(may.binding.regulatoryDatasetVersion).not.toBe(nov.binding.regulatoryDatasetVersion);
    // Different minimum LC% from the product
    expect(may.binding.resolution[0].minimumLcPct).toBe(40);
    expect(nov.binding.resolution[0].minimumLcPct).toBe(50);
  });
});

// ─── Proof 3: Effective-Date Handling ───

describe("Bound Calculation — Proof 3: Effective-date handling", () => {
  it("does NOT apply a future dataset to a past calculation", () => {
    // CURRENT dataset is effective 2026-10-01, but we calculate as of 2026-06-01
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    // Should resolve to OLD dataset, not CURRENT
    expect(bound.binding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-01");
    expect(bound.binding.resolution[0].minimumLcPct).toBe(40);
  });

  it("does NOT apply an expired dataset to a future calculation", () => {
    // OLD dataset expires 2026-10-01, but we calculate as of 2026-11-01
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    // Should resolve to CURRENT dataset, not OLD
    expect(bound.binding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-08");
    expect(bound.binding.resolution[0].minimumLcPct).toBe(50);
  });

  it("returns no dataset when calculation date is before all datasets", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2020-01-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    expect(bound.binding.regulatoryDatasetVersion).toBeNull();
    expect(bound.binding.regulatoryArtifactSha256).toBeNull();
    expect(bound.recordable).toBe(false);
  });
});

// ─── Proof 4: Dataset Selection ───

describe("Bound Calculation — Proof 4: Dataset selection", () => {
  it("selects the dataset whose effective window contains the calculation date", () => {
    // OLD: effective 2026-01-01 to 2026-10-01
    // CURRENT: effective 2026-10-01 onward
    // Calculation at 2026-09-30 should select OLD
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-09-30T23:59:59.999Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    expect(bound.binding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-01");
  });

  it("selects CURRENT at exactly the boundary (2026-10-01)", () => {
    // OLD expires at 2026-10-01 (effectiveTo), CURRENT starts at 2026-10-01
    // At the exact boundary, CURRENT is in force
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-10-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    expect(bound.binding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-08");
  });

  it("records rationale for dataset selection", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    // At least one resolution entry has a rationale
    expect(bound.binding.resolution[0].rationale.length).toBeGreaterThan(0);
  });
});

// ─── Proof 5: Calculation Result Correctness ───

describe("Bound Calculation — Proof 5: Calculation result correctness", () => {
  it("produces numerically correct LC% alongside the binding", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    // The calculation result is present and valid
    expect(bound.result.overallLcPct).toBeGreaterThanOrEqual(0);
    expect(bound.result.overallLcPct).toBeLessThanOrEqual(100);
    expect(bound.result.totalCosts).toBe(1900000); // 800k + 300k + 700k + 100k
    expect(bound.result.lcGoodsServices).toBeGreaterThanOrEqual(0);
    expect(bound.result.lcAssetDepreciation).toBeGreaterThanOrEqual(0);
    expect(bound.result.lcLaborCompensation).toBeGreaterThanOrEqual(0);
    expect(bound.result.lcCapacityBuilding).toBeGreaterThanOrEqual(0);
  });

  it("ruleVersion in result matches binding ruleVersion", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    // The top-level ruleVersion is FROM the binding, not a static constant
    expect(bound.ruleVersion).toBe(bound.binding.ruleVersion);
  });

  it("is deterministic — same inputs produce same binding + result", () => {
    const input = {
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    };

    const run1 = computeLcgpaWithBinding(input);
    const run2 = computeLcgpaWithBinding(input);

    // Same binding
    expect(run1.binding.regulatoryDatasetVersion).toBe(run2.binding.regulatoryDatasetVersion);
    expect(run1.binding.ruleVersion).toBe(run2.binding.ruleVersion);
    expect(run1.binding.resolution[0].minimumLcPct).toBe(run2.binding.resolution[0].minimumLcPct);

    // Same calculation result
    expect(run1.result.overallLcPct).toBe(run2.result.overallLcPct);
    expect(run1.result.lcGoodsServices).toBe(run2.result.lcGoodsServices);
    expect(run1.result.totalCosts).toBe(run2.result.totalCosts);
  });
});

// ─── Proof 6: Audit/Evidence Linkage ───

describe("Bound Calculation — Proof 6: Audit/evidence linkage", () => {
  it("bound trace carries full regulatory binding metadata", () => {
    const input = {
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
      computedById: "user-001",
    };

    const bound = computeLcgpaWithBinding(input);
    const trace = createBoundCalculationTrace(input, bound);

    // Trace carries the binding
    expect(trace.regulatoryBinding).toBeDefined();
    expect(trace.regulatoryBinding.regulatoryAsOf).toBe("2026-06-01T00:00:00.000Z");
    expect(trace.regulatoryBinding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-01");
    expect(trace.regulatoryBinding.regulatoryArtifactSha256).toBe(OLD_DATASET.artifactSha256);
    expect(trace.regulatoryBinding.ruleVersion).toBe("2026-01");
    expect(trace.regulatoryBinding.complete).toBe(true);
    expect(trace.regulatoryBinding.resolution.length).toBe(1);
  });

  it("trace ruleVersion comes from binding, not static constant", () => {
    const input = {
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    };

    const bound = computeLcgpaWithBinding(input);
    const trace = createBoundCalculationTrace(input, bound);

    // Trace ruleVersion matches binding ruleVersion
    expect(trace.ruleVersion).toBe(trace.regulatoryBinding.ruleVersion);
    expect(trace.ruleVersion).toBe(bound.binding.ruleVersion);
  });

  it("trace includes evidence references", () => {
    const input = {
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    };

    const bound = computeLcgpaWithBinding(input);
    const trace = createBoundCalculationTrace(input, bound);

    // Evidence references are built from inputs
    expect(trace.evidenceRefs.length).toBeGreaterThan(0);
    // Should have supplier declarations + financial statements + manual entries
    const types = new Set(trace.evidenceRefs.map((r) => r.type));
    expect(types.has("supplier_declaration")).toBe(true);
    expect(types.has("financial_statement")).toBe(true);
    expect(types.has("manual_entry")).toBe(true);
  });

  it("trace result matches bound calculation result", () => {
    const input = {
      datasets: DATASETS,
      calculationDate: new Date("2026-06-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    };

    const bound = computeLcgpaWithBinding(input);
    const trace = createBoundCalculationTrace(input, bound);

    // Trace result is the same as the bound result
    expect(trace.result.overallLcPct).toBe(bound.result.overallLcPct);
    expect(trace.result.lcGoodsServices).toBe(bound.result.lcGoodsServices);
    expect(trace.result.totalCosts).toBe(bound.result.totalCosts);
    expect(trace.gsSelection.selectedSpend).toBe(bound.gsSelection.selectedSpend);
  });
});

// ─── Proof 7: Error Behavior ───

describe("Bound Calculation — Proof 7: Error behavior", () => {
  it("THROWS when calculation date is missing", () => {
    expect(() =>
      computeLcgpaWithBinding({
        datasets: DATASETS,
        calculationDate: undefined as unknown as Date,
        productCodes: ["2353"],
        pillarInputs: makePillarInputs(),
      }),
    ).toThrow(/CALCULATION_DATE_REQUIRED/);
  });

  it("THROWS when calculation date is invalid", () => {
    expect(() =>
      computeLcgpaWithBinding({
        datasets: DATASETS,
        calculationDate: new Date("invalid"),
        productCodes: ["2353"],
        pillarInputs: makePillarInputs(),
      }),
    ).toThrow(/CALCULATION_DATE_REQUIRED/);
  });

  it("records UNKNOWN for unknown product codes", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["2353", "9999"],
      pillarInputs: makePillarInputs(),
    });

    expect(bound.binding.complete).toBe(false);
    expect(bound.binding.unresolved).toEqual(["9999"]);

    const unknown = bound.binding.resolution.find((r) => r.productCode === "9999");
    expect(unknown?.outcome).toBe("UNKNOWN");
    expect(unknown?.minimumLcPct).toBeNull();
    expect(unknown?.rationale).toMatch(/PRODUCT_NOT_IN_FORCE/);
  });

  it("marks unbound calculations as not recordable by default", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2020-01-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
    });

    expect(bound.recordable).toBe(false);
    expect(bound.gateReason).toMatch(/REGULATORY_STATE_UNRESOLVED/);
  });

  it("allows unbound calculations only under explicit policy", () => {
    // When no dataset is in force, product also fails to resolve → both gates fire
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2020-01-01T00:00:00.000Z"),
      productCodes: ["2353"],
      pillarInputs: makePillarInputs(),
      policy: { allowUnboundDataset: true, allowIncompleteResolution: true },
    });

    expect(bound.recordable).toBe(true);
  });

  it("allows incomplete calculations only under explicit policy", () => {
    const bound = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["2353", "9999"],
      pillarInputs: makePillarInputs(),
    });

    // Default: not recordable (incomplete)
    expect(bound.recordable).toBe(false);
    expect(bound.gateReason).toMatch(/PRODUCTS_UNRESOLVED/);

    // With policy: recordable
    const boundWithPolicy = computeLcgpaWithBinding({
      datasets: DATASETS,
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["2353", "9999"],
      pillarInputs: makePillarInputs(),
      policy: { allowIncompleteResolution: true },
    });

    expect(boundWithPolicy.recordable).toBe(true);
  });
});
