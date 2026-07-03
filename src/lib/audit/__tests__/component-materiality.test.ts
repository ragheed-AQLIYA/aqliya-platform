jest.mock("@/lib/prisma", () => ({
  prisma: {
    componentMateriality: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import {
  createComponentMateriality,
  listComponentMaterialities,
  deleteComponentMateriality,
} from "../materiality-service";

const mockedPrisma = jest.requireMock("@/lib/prisma").prisma as {
  componentMateriality: {
    create: jest.Mock;
    findMany: jest.Mock;
    delete: jest.Mock;
  };
};

const NOW = new Date("2026-07-03T12:00:00.000Z");

describe("ComponentMateriality (L6.3 Group Audit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates a component materiality record", async () => {
    const mockRecord = {
      id: "cm-1",
      groupEngagementId: "eng-group-1",
      componentEntityName: "Subsidiary Alpha",
      componentType: "significant",
      planningMaterialityId: "pm-1",
      planningMaterialityAmount: 500000,
      performanceMaterialityAmount: 375000,
      trivialThresholdAmount: 25000,
      allocationBasis: "proportion_of_total_assets",
      consolidationNote: "100% ownership",
      reviewedById: null,
      reviewedAt: null,
      createdById: null,
      createdAt: NOW,
      updatedAt: NOW,
    };

    mockedPrisma.componentMateriality.create.mockResolvedValue(mockRecord);

    const result = await createComponentMateriality({
      groupEngagementId: "eng-group-1",
      componentEntityName: "Subsidiary Alpha",
      componentType: "significant",
      planningMaterialityId: "pm-1",
      planningMaterialityAmount: 500000,
      performanceMaterialityAmount: 375000,
      trivialThresholdAmount: 25000,
      allocationBasis: "proportion_of_total_assets",
      consolidationNote: "100% ownership",
    });

    expect(result.id).toBe("cm-1");
    expect(result.componentEntityName).toBe("Subsidiary Alpha");
    expect(mockedPrisma.componentMateriality.create).toHaveBeenCalledWith({
      data: {
        groupEngagementId: "eng-group-1",
        componentEntityName: "Subsidiary Alpha",
        componentType: "significant",
        planningMaterialityId: "pm-1",
        planningMaterialityAmount: 500000,
        performanceMaterialityAmount: 375000,
        trivialThresholdAmount: 25000,
        allocationBasis: "proportion_of_total_assets",
        consolidationNote: "100% ownership",
      },
    });
  });

  it("lists all component materialities for a group engagement", async () => {
    const mockRecords = [
      {
        id: "cm-1",
        groupEngagementId: "eng-group-1",
        componentEntityName: "Subsidiary Alpha",
        componentType: "significant",
        planningMaterialityId: "pm-1",
        planningMaterialityAmount: 500000,
        allocationBasis: null,
        consolidationNote: null,
        performanceMaterialityAmount: null,
        trivialThresholdAmount: null,
        reviewedById: null,
        reviewedAt: null,
        createdById: null,
        createdAt: NOW,
        updatedAt: NOW,
        planningMateriality: {
          id: "pm-1",
          computedAmount: 500000,
          currency: "SAR",
        },
      },
    ];

    mockedPrisma.componentMateriality.findMany.mockResolvedValue(mockRecords);

    const results = await listComponentMaterialities("eng-group-1");

    expect(results).toHaveLength(1);
    expect(results[0].componentEntityName).toBe("Subsidiary Alpha");
    expect(mockedPrisma.componentMateriality.findMany).toHaveBeenCalledWith({
      where: { groupEngagementId: "eng-group-1" },
      include: { planningMateriality: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("deletes a component materiality record", async () => {
    mockedPrisma.componentMateriality.delete.mockResolvedValue({ id: "cm-1" } as never);

    await deleteComponentMateriality("cm-1");

    expect(mockedPrisma.componentMateriality.delete).toHaveBeenCalledWith({
      where: { id: "cm-1" },
    });
  });
});
