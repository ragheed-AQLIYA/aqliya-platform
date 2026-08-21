// ─── LocalContentOS — LCGPA Baseline/Target/Actual Tests ───
// Deterministic, reproducible. Every assertion backed by known inputs/outputs.

import {
  createBaselineSnapshot,
  createActualSnapshot,
  createPeriodicSnapshot,
  computeTargetProgress,
  compareSnapshots,
  findMostRecentActual,
  findBaselineSnapshot,
} from "../baseline-target";
import type { LcPillarInputs, LcSnapshot } from "../types";

// ─── Test Fixtures ───

const TEST_INPUTS: LcPillarInputs = {
  goodsServices: {
    suppliers: [
      {
        supplierId: "SUP-001",
        name: "Saudi Supplier",
        spend: 500000,
        localityClassification: "local",
        localContentPercentage: 85,
        rank: 1,
      },
      {
        supplierId: "SUP-002",
        name: "Foreign Supplier",
        spend: 300000,
        localityClassification: "non_local",
        localContentPercentage: 10,
        rank: 2,
      },
    ],
    totalGoodsServicesCost: 800000,
  },
  assetDepreciation: {
    ksaManufacturedDepreciation: 100000,
    foreignAssetDepreciation: 50000,
    totalDepreciation: 150000,
  },
  laborCompensation: {
    saudiCompensation: 200000,
    expatCompensation: 100000,
    totalCompensation: 300000,
  },
  capacityBuilding: {
    saudiTrainingCost: 20000,
    supplierDevelopmentCost: 10000,
    rdCostInKsa: 5000,
    totalCapacityBuildingCost: 35000,
  },
};

// ─── createBaselineSnapshot Tests ───

describe("createBaselineSnapshot", () => {
  it("should create a baseline snapshot with correct LC%", () => {
    const snapshot = createBaselineSnapshot("proj-1", TEST_INPUTS, "user-1", "Initial baseline");

    expect(snapshot.type).toBe("baseline");
    expect(snapshot.projectId).toBe("proj-1");
    expect(snapshot.method).toBe("lcgpa_v1");
    expect(snapshot.ruleVersion).toBe("2026-01");
    expect(snapshot.capturedById).toBe("user-1");
    expect(snapshot.note).toBe("Initial baseline");
    expect(snapshot.id).toMatch(/^SNAP-/);
    expect(snapshot.capturedAt).toBeDefined();

    // Verify LC% calculation
    // Total costs = 800000 + 150000 + 300000 + 35000 = 1285000
    // LC_GS = 500000 × 100% + 300000 × 0% = 500000
    // LC_AD = 100000 × 100% + 50000 × 20% = 110000
    // LC_LC = 200000 × 100% + 100000 × 37% = 237000
    // LC_CB = 20000 + 10000 + 5000 = 35000
    // Overall = (500000 + 110000 + 237000 + 35000) / 1285000 × 100 ≈ 68.63%
    expect(snapshot.lcPct).toBeCloseTo(68.63, 1);
    expect(snapshot.result.overallLcPct).toBeCloseTo(68.63, 1);
  });

  it("should store complete inputs for reproducibility", () => {
    const snapshot = createBaselineSnapshot("proj-1", TEST_INPUTS);
    expect(snapshot.inputs).toEqual(TEST_INPUTS);
  });

  it("should default capturedById and note to null", () => {
    const snapshot = createBaselineSnapshot("proj-1", TEST_INPUTS);
    expect(snapshot.capturedById).toBeNull();
    expect(snapshot.note).toBeNull();
  });
});

// ─── createActualSnapshot Tests ───

describe("createActualSnapshot", () => {
  it("should create an actual snapshot with correct type", () => {
    const snapshot = createActualSnapshot("proj-1", TEST_INPUTS, "user-2", "Q2 measurement");
    expect(snapshot.type).toBe("actual");
    expect(snapshot.projectId).toBe("proj-1");
    expect(snapshot.capturedById).toBe("user-2");
    expect(snapshot.note).toBe("Q2 measurement");
  });

  it("should compute same LC% as baseline for same inputs", () => {
    const baseline = createBaselineSnapshot("proj-1", TEST_INPUTS);
    const actual = createActualSnapshot("proj-1", TEST_INPUTS);
    expect(actual.lcPct).toBe(baseline.lcPct);
  });
});

// ─── createPeriodicSnapshot Tests ───

describe("createPeriodicSnapshot", () => {
  it("should create a periodic snapshot with correct type", () => {
    const snapshot = createPeriodicSnapshot("proj-1", TEST_INPUTS, "user-3", "Monthly check");
    expect(snapshot.type).toBe("periodic");
    expect(snapshot.projectId).toBe("proj-1");
    expect(snapshot.capturedById).toBe("user-3");
    expect(snapshot.note).toBe("Monthly check");
  });
});

// ─── computeTargetProgress Tests ───

describe("computeTargetProgress", () => {
  it("should compute progress correctly when target not yet met", () => {
    const progress = computeTargetProgress(
      50, // baseline
      80, // target
      65, // current
      new Date("2026-01-01"),
      new Date("2026-12-31"),
    );

    expect(progress.baselineLcPct).toBe(50);
    expect(progress.targetLcPct).toBe(80);
    expect(progress.currentLcPct).toBe(65);
    expect(progress.progressPct).toBe(50); // (65-50)/(80-50) × 100 = 50%
    expect(progress.targetMet).toBe(false);
    expect(progress.gapPct).toBe(15); // 80 - 65 = 15
    expect(progress.deadlinePassed).toBe(false);
  });

  it("should compute progress correctly when target is met", () => {
    const progress = computeTargetProgress(50, 80, 85);
    expect(progress.progressPct).toBe(116.67); // (85-50)/(80-50) × 100 = 116.67%
    expect(progress.targetMet).toBe(true);
    expect(progress.gapPct).toBe(-5); // 80 - 85 = -5
  });

  it("should handle baseline equals target", () => {
    const progress = computeTargetProgress(50, 50, 50);
    expect(progress.progressPct).toBe(100);
    expect(progress.targetMet).toBe(true);
    expect(progress.gapPct).toBe(0);
  });

  it("should handle no dates provided", () => {
    const progress = computeTargetProgress(50, 80, 65);
    expect(progress.daysSinceBaseline).toBeNull();
    expect(progress.daysUntilTarget).toBeNull();
    expect(progress.deadlinePassed).toBe(false);
  });

  it("should detect deadline passed", () => {
    const progress = computeTargetProgress(
      50,
      80,
      65,
      new Date("2025-01-01"),
      new Date("2025-12-31"), // Past date
    );
    expect(progress.deadlinePassed).toBe(true);
  });
});

// ─── compareSnapshots Tests ───

describe("compareSnapshots", () => {
  it("should compute positive change correctly", () => {
    const earlier: LcSnapshot = {
      id: "SNAP-1",
      projectId: "proj-1",
      type: "actual",
      lcPct: 50,
      method: "lcgpa_v1",
      ruleVersion: "2026-01",
      capturedAt: "2026-01-01T00:00:00Z",
      capturedById: null,
      inputs: TEST_INPUTS,
      result: { overallLcPct: 50, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
      evidenceRefs: [],
      note: null,
    };
    const later: LcSnapshot = {
      ...earlier,
      id: "SNAP-2",
      lcPct: 65,
      capturedAt: "2026-04-01T00:00:00Z", // 90 days later
      result: { ...earlier.result, overallLcPct: 65 },
    };

    const comparison = compareSnapshots(earlier, later);
    expect(comparison.lcPctChange).toBe(15);
    expect(comparison.improved).toBe(true);
    expect(comparison.daysBetween).toBe(90);
    expect(comparison.monthlyRate).toBe(5); // 15% / 3 months = 5% per month
  });

  it("should compute negative change correctly", () => {
    const earlier: LcSnapshot = {
      id: "SNAP-1",
      projectId: "proj-1",
      type: "actual",
      lcPct: 70,
      method: "lcgpa_v1",
      ruleVersion: "2026-01",
      capturedAt: "2026-01-01T00:00:00Z",
      capturedById: null,
      inputs: TEST_INPUTS,
      result: { overallLcPct: 70, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
      evidenceRefs: [],
      note: null,
    };
    const later: LcSnapshot = {
      ...earlier,
      id: "SNAP-2",
      lcPct: 60,
      capturedAt: "2026-02-01T00:00:00Z", // 30 days later
      result: { ...earlier.result, overallLcPct: 60 },
    };

    const comparison = compareSnapshots(earlier, later);
    expect(comparison.lcPctChange).toBe(-10);
    expect(comparison.improved).toBe(false);
    expect(comparison.daysBetween).toBe(31);
    expect(comparison.monthlyRate).toBeCloseTo(-9.68, 1); // -10% / (31/30 months) ≈ -9.68
  });

  it("should handle same-day snapshots", () => {
    const snapshot: LcSnapshot = {
      id: "SNAP-1",
      projectId: "proj-1",
      type: "actual",
      lcPct: 50,
      method: "lcgpa_v1",
      ruleVersion: "2026-01",
      capturedAt: "2026-01-01T00:00:00Z",
      capturedById: null,
      inputs: TEST_INPUTS,
      result: { overallLcPct: 50, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
      evidenceRefs: [],
      note: null,
    };

    const comparison = compareSnapshots(snapshot, { ...snapshot, id: "SNAP-2" });
    expect(comparison.lcPctChange).toBe(0);
    expect(comparison.improved).toBe(false);
    expect(comparison.daysBetween).toBe(0);
    expect(comparison.monthlyRate).toBe(0);
  });
});

// ─── findMostRecentActual Tests ───

describe("findMostRecentActual", () => {
  it("should find the most recent actual snapshot", () => {
    const snapshots: LcSnapshot[] = [
      {
        id: "SNAP-1",
        projectId: "proj-1",
        type: "baseline",
        lcPct: 50,
        method: "lcgpa_v1",
        ruleVersion: "2026-01",
        capturedAt: "2026-01-01T00:00:00Z",
        capturedById: null,
        inputs: TEST_INPUTS,
        result: { overallLcPct: 50, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
        evidenceRefs: [],
        note: null,
      },
      {
        id: "SNAP-2",
        projectId: "proj-1",
        type: "actual",
        lcPct: 55,
        method: "lcgpa_v1",
        ruleVersion: "2026-01",
        capturedAt: "2026-02-01T00:00:00Z",
        capturedById: null,
        inputs: TEST_INPUTS,
        result: { overallLcPct: 55, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
        evidenceRefs: [],
        note: null,
      },
      {
        id: "SNAP-3",
        projectId: "proj-1",
        type: "actual",
        lcPct: 60,
        method: "lcgpa_v1",
        ruleVersion: "2026-01",
        capturedAt: "2026-03-01T00:00:00Z",
        capturedById: null,
        inputs: TEST_INPUTS,
        result: { overallLcPct: 60, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
        evidenceRefs: [],
        note: null,
      },
    ];

    const mostRecent = findMostRecentActual(snapshots);
    expect(mostRecent?.id).toBe("SNAP-3");
    expect(mostRecent?.lcPct).toBe(60);
  });

  it("should return null if no actual snapshots exist", () => {
    const snapshots: LcSnapshot[] = [
      {
        id: "SNAP-1",
        projectId: "proj-1",
        type: "baseline",
        lcPct: 50,
        method: "lcgpa_v1",
        ruleVersion: "2026-01",
        capturedAt: "2026-01-01T00:00:00Z",
        capturedById: null,
        inputs: TEST_INPUTS,
        result: { overallLcPct: 50, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
        evidenceRefs: [],
        note: null,
      },
    ];

    expect(findMostRecentActual(snapshots)).toBeNull();
  });

  it("should return null for empty list", () => {
    expect(findMostRecentActual([])).toBeNull();
  });
});

// ─── findBaselineSnapshot Tests ───

describe("findBaselineSnapshot", () => {
  it("should find the baseline snapshot", () => {
    const snapshots: LcSnapshot[] = [
      {
        id: "SNAP-1",
        projectId: "proj-1",
        type: "actual",
        lcPct: 55,
        method: "lcgpa_v1",
        ruleVersion: "2026-01",
        capturedAt: "2026-02-01T00:00:00Z",
        capturedById: null,
        inputs: TEST_INPUTS,
        result: { overallLcPct: 55, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
        evidenceRefs: [],
        note: null,
      },
      {
        id: "SNAP-2",
        projectId: "proj-1",
        type: "baseline",
        lcPct: 50,
        method: "lcgpa_v1",
        ruleVersion: "2026-01",
        capturedAt: "2026-01-01T00:00:00Z",
        capturedById: null,
        inputs: TEST_INPUTS,
        result: { overallLcPct: 50, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
        evidenceRefs: [],
        note: null,
      },
    ];

    const baseline = findBaselineSnapshot(snapshots);
    expect(baseline?.id).toBe("SNAP-2");
    expect(baseline?.lcPct).toBe(50);
  });

  it("should return null if no baseline snapshot exists", () => {
    const snapshots: LcSnapshot[] = [
      {
        id: "SNAP-1",
        projectId: "proj-1",
        type: "actual",
        lcPct: 55,
        method: "lcgpa_v1",
        ruleVersion: "2026-01",
        capturedAt: "2026-02-01T00:00:00Z",
        capturedById: null,
        inputs: TEST_INPUTS,
        result: { overallLcPct: 55, lcGoodsServices: 0, lcAssetDepreciation: 0, lcLaborCompensation: 0, lcCapacityBuilding: 0, totalCosts: 1, gsLcPct: 0, adLcPct: 0, lcPillarLcPct: 0, cbLcPct: 0 },
        evidenceRefs: [],
        note: null,
      },
    ];

    expect(findBaselineSnapshot(snapshots)).toBeNull();
  });
});
