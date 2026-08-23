// ─── Tests: LCGPA Workbook Scoring Service ───
//
// Verifies the bridge between workbook line data and the LCGPA bound
// calculation engine, including DB-backed dataset resolution.

import {
  computeLcgpaWorkbookScore,
  loadProjectSuppliersFromSpend,
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

function makeDbMock(
  datasets = [],
  lines = [],
  opts: {
    spendGroups?: Array<{ supplierId: string; _sum: { amount: number | null } }>;
    spendRows?: Array<{ supplierId: string; amount: number; metadata: unknown }>;
    supplierRows?: Array<{
      id: string;
      name: string;
      localityClassification: string | null;
      localContentPercentage: number | null;
    }>;
  } = {},
): Partial<PrismaClient> {
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
    localContentSpendRecord: {
      groupBy: async () => opts.spendGroups ?? [],
      findMany: async () => opts.spendRows ?? [],
    } as unknown as PrismaClient["localContentSpendRecord"],
    localContentSupplier: {
      findMany: async () => opts.supplierRows ?? [],
    } as unknown as PrismaClient["localContentSupplier"],
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

// ─── loadProjectSuppliersFromSpend ───

describe("loadProjectSuppliersFromSpend", () => {
  const SPEND_GROUPS = [
    { supplierId: "s-b", _sum: { amount: 3000 } },
    { supplierId: "s-a", _sum: { amount: 7000 } },
    { supplierId: "s-c", _sum: { amount: null } },
    { supplierId: "s-ghost", _sum: { amount: 500 } }, // no supplier row
  ];
  const SUPPLIER_ROWS = [
    {
      id: "s-a",
      name: "Alpha",
      localityClassification: "local",
      localContentPercentage: 80,
    },
    {
      id: "s-b",
      name: "Beta",
      localityClassification: "weird_value", // invalid → unclassified
      localContentPercentage: null,
    },
    // s-c intentionally missing from supplier rows too
  ];

  it("aggregates spend per supplier, ranks descending, totals consistently", async () => {
    const db = makeDbMock([], [], {
      spendRows: [
        { supplierId: "s-b", amount: 3000, metadata: {} },
        { supplierId: "s-a", amount: 7000, metadata: { lcgpaProductCode: "0002801" } },
        { supplierId: "s-c", amount: 0, metadata: {} },
        { supplierId: "s-ghost", amount: 500, metadata: {} },
      ],
      supplierRows: SUPPLIER_ROWS,
    }) as PrismaClient;

    const { suppliers, totalGoodsServicesCost } =
      await loadProjectSuppliersFromSpend(db, "proj-1");

    // s-c has zero spend → filtered out (spend must be > 0)
    expect(suppliers).toHaveLength(3);

    // Rank order: s-a (7000) → s-b (3000) → s-ghost (500)
    expect(suppliers.map((s) => s.supplierId)).toEqual([
      "s-a",
      "s-b",
      "s-ghost",
    ]);
    expect(suppliers[0].rank).toBe(1);
    expect(suppliers[2].rank).toBe(3);

    // Total = sum of the same records used for aggregation
    expect(totalGoodsServicesCost).toBe(10500);

    // Classification mapping
    expect(suppliers[0].localityClassification).toBe("local");
    expect(suppliers[1].localityClassification).toBe("unclassified");
    // Ghost supplier falls back to id as name, unclassified
    expect(suppliers[2].name).toBe("s-ghost");
    expect(suppliers[2].localityClassification).toBe("unclassified");
  });

  it("returns empty result when project has no spend records", async () => {
    const db = makeDbMock([], [], {}) as PrismaClient;

    const { suppliers, totalGoodsServicesCost } =
      await loadProjectSuppliersFromSpend(db, "proj-empty");

    expect(suppliers).toEqual([]);
    expect(totalGoodsServicesCost).toBe(0);
  });

  it("breaks spend ties by supplierId lexicographically", async () => {
    const db = makeDbMock([], [], {
      spendRows: [
        { supplierId: "t-2", amount: 1000, metadata: {} },
        { supplierId: "t-1", amount: 1000, metadata: {} },
        { supplierId: "t-10", amount: 1000, metadata: {} },
      ],
      supplierRows: [],
    }) as PrismaClient;

    const { suppliers } = await loadProjectSuppliersFromSpend(db, "proj-1");

    expect(suppliers.map((s) => s.supplierId)).toEqual(["t-1", "t-10", "t-2"]);
  });
});

// ─── Auto-load fallback in computeLcgpaWorkbookScore ───

describe("computeLcgpaWorkbookScore — supplier auto-load fallback", () => {
  it("auto-loads suppliers from spend when none are provided explicitly", async () => {
    const dataset = makeDataset("v1", [product("2801")], {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01"),
    });
    const db = makeDbMock([dataset], [], {
      spendRows: [{ supplierId: "supplier-cuid", amount: 4000, metadata: { lcgpaProductCode: "2801" } }],
      supplierRows: [
        {
          id: "supplier-cuid",
          name: "Local Supplier",
          localityClassification: "local",
          localContentPercentage: 75,
        },
      ],
    }) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      computedById: null,
    });

    // G&S pillar used auto-loaded data. Engine rule: "local" → 100%
    // effective LC% (declared 75 is ignored for local suppliers).
    expect(result.lcGoodsServices).toBe(4000);
    // Binding resolved via product code from auto-loaded supplier
    expect(result.recordable).toBe(true);
    expect(result.regulatoryDatasetVersion).toBe(dataset.datasetVersion);
    // Total costs include the auto-loaded G&S base
    expect(result.totalCosts).toBeGreaterThanOrEqual(4000);
  });

  it("explicit suppliers take precedence over auto-load", async () => {
    const dataset = makeDataset("v1", [product("2801")], {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01"),
    });
    const db = makeDbMock([dataset], [], {
      spendRows: [{ supplierId: "9999", amount: 999999, metadata: { lcgpaProductCode: "9999" } }],
      supplierRows: [
        {
          id: "9999",
          name: "Should Not Be Used",
          localityClassification: "non_local",
          localContentPercentage: 0,
        },
      ],
    }) as PrismaClient;

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [
        {
          supplierId: "2801",
          name: "Explicit Supplier",
          spend: 200,
          localityClassification: "local",
          localContentPercentage: 50,
          rank: 1,
        },
      ],
      totalGoodsServicesCost: undefined,
    });

    // Explicit supplier used: "local" → 100% effective → 200 LC.
    // Auto-loaded 999999 spend ignored entirely.
    expect(result.lcGoodsServices).toBe(200);
  });

  it("defaults totalGoodsServicesCost to explicit-supplier sum when omitted", async () => {
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
          supplierId: "2801",
          name: "Supplier A",
          spend: 600,
          localityClassification: "mixed",
          localContentPercentage: 40,
          rank: 1,
        },
        {
          supplierId: "2802",
          name: "Supplier B",
          spend: 400,
          localityClassification: "local",
          localContentPercentage: 90,
          rank: 2,
        },
      ],
      // totalGoodsServicesCost omitted
    });

    // Total = 600 + 400 = 1000 (derived, not 0)
    // Selected top supplier by rank rule: mixed classified at declared pct
    // LC_GS ≥ (600×0.4 + 400×0.9)/1000 — just assert total consistency
    expect(result.trace.inputs.goodsServices.totalGoodsServicesCost).toBe(1000);
    expect(result.totalCosts).toBeGreaterThan(0);
  });
});

// ─── Persistence gates (Lead Coordinator T9) ───

describe("computeLcgpaWorkbookScore — persistence gates", () => {
  function captureRunMock(db: Partial<PrismaClient>) {
    const calls: Array<Record<string, unknown>> = [];
    (
      db.lcCalculationRun as unknown as {
        create: (args: Record<string, unknown>) => Promise<unknown>;
      }
    ).create = async (args: Record<string, unknown>) => {
      calls.push(args);
      return args;
    };
    return calls;
  }

  it("recordable result writes exactly one calculation run", async () => {
    const dataset = makeDataset("v1", [product("2801")], {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01"),
    });
    const db = makeDbMock([dataset], [], {
      spendRows: [
        { supplierId: "supplier-cuid", amount: 4000, metadata: { lcgpaProductCode: "2801" } },
      ],
      supplierRows: [
        { id: "supplier-cuid", name: "Local", localityClassification: "local", localContentPercentage: null },
      ],
    }) as PrismaClient;
    const calls = captureRunMock(db);

    await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      computedById: null,
    });

    expect(calls).toHaveLength(1);
  });

  it("non-recordable result writes zero runs", async () => {
    const db = makeDbMock([], [], {}) as PrismaClient; // no datasets → unbound
    const calls = captureRunMock(db);

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      computedById: null,
    });

    expect(result.recordable).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("allowIncompleteResolution persists UNKNOWN without substitution", async () => {
    const dataset = makeDataset("v1", [product("2801")], {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01"),
    });
    const db = makeDbMock([dataset], [], {}) as PrismaClient;
    const calls = captureRunMock(db);

    const result = await computeLcgpaWorkbookScore(db, {
      workbookId: "wb-1",
      projectId: "proj-1",
      suppliers: [
        {
          supplierId: "cuid-a",
          name: "Unmapped",
          spend: 500,
          localityClassification: "local",
          localContentPercentage: null,
          rank: 1,
          regulatoryProductCodes: ["9999"], // not in dataset
        },
      ],
      policy: { allowIncompleteResolution: true },
    });

    expect(result.recordable).toBe(true);
    expect(result.trace.regulatoryBinding.unresolved).toEqual(["9999"]);
    expect(calls).toHaveLength(1);

    const data = calls[0].data as {
      regulatoryResolution?: Array<{ productCode: string; outcome: string }>;
    };
    const row = data.regulatoryResolution?.find((r) => r.productCode === "9999");
    expect(row?.outcome).toBe("UNKNOWN");
  });
});
