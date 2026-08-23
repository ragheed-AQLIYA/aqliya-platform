// ─── Tests: LCGPA Workbook Scoring Service ───
//
// Verifies the bridge between workbook line data and the LCGPA bound
// calculation engine, including DB-backed dataset resolution.

import {
  computeLcgpaWorkbookScore,
  type LcgpaWorkbookScoreInput,
} from "../workbook-scoring-lcgpa";
import { makeDataset } from "../regulatory/__tests__/dataset-helpers";
import { product } from "../regulatory/__tests__/fixtures";
import type { PrismaClient } from "@prisma/client";
import type { LcWorkbookLine } from "@prisma/client";
// ─── Test Fixtures ───

function makeLine(overrides: Partial<LcWorkbookLine>): LcWorkbookLine {
  return {
    id: "line-1",
    workbookId: "wb-1",
    code: "REV-01",
    labelAr: "",
    labelEn: null,
    section: null,
    unit: null,
    autoFillValue: null,
    manualValue: null,
    isRequired: false,
    isLocked: false,
    filledAt: null,
    filledBy: null,
    sourceType: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeDbMock(datasets = [], lines = []): Partial<PrismaClient> {
  return {
    lcRegulatoryDataset: {
      findMany: async () => datasets,
      count: async () => datasets.length,
    } as unknown as PrismaClient["lcRegulatoryDataset"],
    lcWorkbookLine: {
      findMany: async () => lines,
    } as unknown as PrismaClient["lcWorkbookLine"],
    lcCalculationRun: {
      create: async (args: Record<string, unknown>) => args,
    } as unknown as PrismaClient["lcCalculationRun"],
  };
}

// ─── Tests ───

describe("computeLcgpaWorkbookScore", () => {
  it("returns a result with overallLcPct and totalCosts", async () => {
    const db = makeDbMock([], [
      makeLine({ code: "AST-01", manualValue: 100 }),
      makeLine({ code: "AST-02", manualValue: 200 }),
      makeLine({ code: "WRK-04", manualValue: 300 }),
      makeLine({ code: "CAP-04", manualValue: 50 }),
    ]) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [],
      totalGoodsServicesCost: 0,
    });

    expect(result.overallLcPct).toBeDefined();
    expect(result.totalCosts).toBeGreaterThan(0);
    expect(typeof result.recordable).toBe("boolean");
    expect(typeof result.gateReason).toBe("string");
    expect(result.ruleVersion).toBe("2026-01");
    expect(result.method).toBe("lcgpa_v1");
  });

  it("extracts labor pillar from WRK-05/WRK-06/WRK-04 lines", async () => {
    const db = makeDbMock([], [
      makeLine({ code: "WRK-05", manualValue: 700 }),
      makeLine({ code: "WRK-06", manualValue: 300 }),
    ]) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [],
      totalGoodsServicesCost: 0,
    });

    expect(result.lcLaborCompensation).toBe(811); // 700*1.0 + 300*0.37
    expect(result.trace.inputs.laborCompensation.saudiCompensation).toBe(700);
    expect(result.trace.inputs.laborCompensation.expatCompensation).toBe(300);
    expect(result.trace.inputs.laborCompensation.totalCompensation).toBe(1000);
  });

  it("extracts asset depreciation pillar from AST-01/AST-03", async () => {
    const db = makeDbMock([], [
      makeLine({ code: "AST-01", manualValue: 400 }),
      makeLine({ code: "AST-03", manualValue: 600 }),
    ]) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [],
      totalGoodsServicesCost: 0,
    });

    expect(result.lcAssetDepreciation).toBe(520); // 400*1.0 + 600*0.2
    expect(result.trace.inputs.assetDepreciation.ksaManufacturedDepreciation).toBe(400);
    expect(result.trace.inputs.assetDepreciation.foreignAssetDepreciation).toBe(600);
  });

  it("extracts capacity building pillar from CAP-01..CAP-04", async () => {
    const db = makeDbMock([], [
      makeLine({ code: "CAP-01", manualValue: 10 }),
      makeLine({ code: "CAP-02", manualValue: 20 }),
      makeLine({ code: "CAP-03", manualValue: 30 }),
    ]) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [],
      totalGoodsServicesCost: 0,
    });

    expect(result.lcCapacityBuilding).toBe(60);
    expect(result.trace.inputs.capacityBuilding.totalCapacityBuildingCost).toBe(60);
  });

  it("resolves regulatory binding when an ACTIVE dataset covers the product codes", async () => {
    const dataset = makeDataset("v1", [
      product("2801"),
      product("2802"),
    ], { status: "ACTIVE", effectiveFrom: new Date("2026-01-01") });
    const db = makeDbMock([dataset], []) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [
        {
          supplierId: "2801",
          name: "Supplier A",
          spend: 500,
          localityClassification: "local",
          localContentPercentage: 80,
          rank: 1,
        },
      ],
      totalGoodsServicesCost: 1000,
    });

    expect(result.regulatoryDatasetVersion).toBe(dataset.datasetVersion);
    expect(result.regulatoryArtifactSha256).toBe(dataset.artifactSha256);
    expect(result.recordable).toBe(true);
  });

  it("is NOT recordable when no dataset is in force and policy does not allow unbound", async () => {
    const db = makeDbMock([], []) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [],
      totalGoodsServicesCost: 0,
    });

    expect(result.recordable).toBe(false);
    expect(result.gateReason).toContain("REGULATORY_STATE_UNRESOLVED");
  });

  it("IS recordable when no dataset is in force but allowUnboundDataset is set", async () => {
    const db = makeDbMock([], []) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [],
      totalGoodsServicesCost: 0,
      policy: { allowUnboundDataset: true },
    });

    expect(result.recordable).toBe(true);
  });

  it("is NOT recordable when product codes do not resolve without explicit policy", async () => {
    const dataset = makeDataset("v1", [product("2801")], {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01"),
    });
    const db = makeDbMock([dataset], []) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [
        {
          supplierId: "9999",
          name: "Unknown Product",
          spend: 500,
          localityClassification: "local",
          localContentPercentage: 80,
          rank: 1,
        },
      ],
      totalGoodsServicesCost: 1000,
    });

    expect(result.recordable).toBe(false);
    expect(result.gateReason).toContain("PRODUCTS_UNRESOLVED");
  });

  it("is deterministic — same inputs produce same output", async () => {
    const dataset = makeDataset("v1", [product("2801")], {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01"),
    });
    const lines = [
      makeLine({ code: "AST-01", manualValue: 100 }),
      makeLine({ code: "WRK-05", manualValue: 700 }),
      makeLine({ code: "WRK-06", manualValue: 300 }),
      makeLine({ code: "CAP-01", manualValue: 10 }),
    ];
    const suppliers = [
      {
        supplierId: "2801",
        name: "Supplier A",
        spend: 500,
        localityClassification: "local" as const,
        localContentPercentage: 80,
        rank: 1,
      },
    ];

    const db1 = makeDbMock([dataset], lines) as PrismaClient;
    const db2 = makeDbMock([dataset], lines) as PrismaClient;

    const r1 = await computeLcgpaWorkbookScore(db1, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers,
      totalGoodsServicesCost: 1000,
    });
    const r2 = await computeLcgpaWorkbookScore(db2, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers,
      totalGoodsServicesCost: 1000,
    });

    expect(r1.overallLcPct).toBe(r2.overallLcPct);
    expect(r1.totalCosts).toBe(r2.totalCosts);
    expect(r1.regulatoryDatasetVersion).toBe(r2.regulatoryDatasetVersion);
  });

  it("produces 100% LC% when all inputs are fully local", async () => {
    const dataset = makeDataset("v1", [product("2801")], {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01"),
    });
    const lines = [
      makeLine({ code: "AST-01", manualValue: 1000 }),
      makeLine({ code: "AST-03", manualValue: 0 }),
      makeLine({ code: "WRK-05", manualValue: 1000 }),
      makeLine({ code: "WRK-06", manualValue: 0 }),
      makeLine({ code: "CAP-01", manualValue: 1000 }),
      makeLine({ code: "CAP-02", manualValue: 0 }),
      makeLine({ code: "CAP-03", manualValue: 0 }),
    ];
    const db = makeDbMock([dataset], lines) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [
        {
          supplierId: "2801",
          name: "Supplier A",
          spend: 1000,
          localityClassification: "local",
          localContentPercentage: 100,
          rank: 1,
        },
      ],
      totalGoodsServicesCost: 1000,
    });

    expect(result.overallLcPct).toBe(100);
  });
});
