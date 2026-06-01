import { describe, expect, it, beforeEach, jest } from "@jest/globals";

const ORG_A = "org-tier-b1-prisma-a";
const ORG_B = "org-tier-b1-prisma-b";
const NOW = new Date("2026-05-31T14:00:00.000Z");

type TierB1MockDelegate = {
  findMany: ReturnType<typeof jest.fn>;
  create: ReturnType<typeof jest.fn>;
  updateMany: ReturnType<typeof jest.fn>;
  deleteMany: ReturnType<typeof jest.fn>;
};

function makeDelegate(): TierB1MockDelegate {
  return {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
}

const tierB1Mocks: Record<string, TierB1MockDelegate> = {
  salesMarketSignal: makeDelegate(),
  salesCommercialRecommendation: makeDelegate(),
};

jest.mock("@/lib/prisma", () => ({
  prisma: new Proxy(
    {},
    {
      get: (_target, prop: string) => tierB1Mocks[prop],
    },
  ),
}));

import type {
  SalesCommercialRecommendation,
  SalesMarketSignal,
} from "../types";

function snapshotRow(
  id: string,
  orgId: string,
  extra: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: orgId,
    accountId: null,
    opportunityId: null,
    source: "integration",
    status: "active",
    evidenceRef: null,
    confidence: null,
    evidenceLinkage: null,
    createdById: "user-1",
    createdAt: NOW,
    updatedAt: NOW,
    ...extra,
  };
}

function marketSignal(id: string, orgId: string): SalesMarketSignal {
  const ts = NOW.toISOString();
  return {
    id,
    organizationId: orgId,
    label: `market-${id}`,
    category: "buying",
    signalSource: "interaction",
    score: 0.82,
    outputStatus: "draft",
    snapshotAt: ts,
    source: "integration",
    status: "active",
    createdAt: ts,
    updatedAt: ts,
    createdById: "user-1",
  };
}

function commercialRecommendation(
  id: string,
  orgId: string,
): SalesCommercialRecommendation {
  const ts = NOW.toISOString();
  return {
    id,
    organizationId: orgId,
    category: "proof",
    ruleId: "proof_gap",
    title: "Add case study",
    reasoning: "Low proof coverage",
    recommendedAction: "Attach pilot case study",
    priority: "high",
    confidence: 0.75,
    evidence: [{ text: "2 wins without proof", source: "win_loss" }],
    outputStatus: "recommendation",
    notAutonomous: true,
    snapshotAt: ts,
    source: "integration",
    status: "active",
    createdAt: ts,
    updatedAt: ts,
    createdById: "user-1",
  };
}

describe("salesos-prisma-repository-tier-b1", () => {
  beforeEach(() => {
    for (const delegate of Object.values(tierB1Mocks)) {
      delegate.findMany.mockReset().mockResolvedValue([]);
      delegate.create.mockReset().mockResolvedValue({});
      delegate.updateMany.mockReset().mockResolvedValue({ count: 1 });
      delegate.deleteMany.mockReset().mockResolvedValue({ count: 1 });
    }
    tierB1Mocks.salesMarketSignal = makeDelegate();
    tierB1Mocks.salesCommercialRecommendation = makeDelegate();
    jest.resetModules();
  });

  async function loadModule() {
    return import("../prisma-repository");
  }

  it("reports Tier B1 readiness when both delegates exist", async () => {
    const repo = await loadModule();
    expect(repo.isTierB1PrismaReady()).toBe(true);
  });

  it("returns null hydrate when Tier B1 delegates are missing (fail-soft)", async () => {
    delete tierB1Mocks.salesMarketSignal;
    delete tierB1Mocks.salesCommercialRecommendation;
    const repo = await loadModule();
    expect(repo.isTierB1PrismaReady()).toBe(false);
    const maps = await repo.prismaLoadTierB1Intelligence(ORG_A);
    expect(maps).toBeNull();
  });

  it("hydrates Tier B1 maps with tenant-scoped rows mapped to types.ts", async () => {
    tierB1Mocks.salesMarketSignal.findMany.mockResolvedValue([
      snapshotRow("mkt-a", ORG_A, {
        label: "Budget confirmed",
        labelAr: null,
        category: "budget",
        signalSource: "interaction",
        rawText: "Q3 budget approved",
        score: 0.9,
        outputStatus: "draft",
        snapshotAt: NOW,
        ruleVersion: "v02.1",
      }),
      snapshotRow("mkt-b", ORG_B, {
        label: "Other org",
        category: "timing",
        signalSource: "stored",
        score: 0.4,
        outputStatus: "draft",
        snapshotAt: NOW,
      }),
    ]);
    tierB1Mocks.salesCommercialRecommendation.findMany.mockResolvedValue([
      snapshotRow("rec-a", ORG_A, {
        category: "proof",
        ruleId: "proof_gap",
        title: "Add proof",
        titleAr: null,
        reasoning: "Gap detected",
        reasoningAr: null,
        recommendedAction: "Upload case study",
        recommendedActionAr: null,
        priority: "high",
        confidence: 0.8,
        evidence: [{ text: "win without proof" }],
        outputStatus: "recommendation",
        notAutonomous: true,
        snapshotAt: NOW,
      }),
    ]);

    const repo = await loadModule();
    const maps = await repo.prismaLoadTierB1Intelligence(ORG_A);
    expect(maps).not.toBeNull();
    expect(maps!.marketSignals.size).toBe(1);
    expect(maps!.marketSignals.get("mkt-a")).toMatchObject({
      label: "Budget confirmed",
      category: "budget",
      signalSource: "interaction",
      score: 0.9,
      ruleVersion: "v02.1",
      organizationId: ORG_A,
    });
    expect(maps!.commercialRecommendations.get("rec-a")?.confidence).toBe(0.8);
    expect(maps!.marketSignals.has("mkt-b")).toBe(false);
  });

  it("returns null on hydrate failure without throwing (fail-soft)", async () => {
    tierB1Mocks.salesMarketSignal.findMany.mockRejectedValue(
      new Error("db down"),
    );
    const repo = await loadModule();
    await expect(repo.prismaLoadTierB1Intelligence(ORG_A)).resolves.toBeNull();
  });

  it("createMarketSignal writes tenant-scoped row and does not throw on failure", async () => {
    const repo = await loadModule();
    await repo.prismaCreateMarketSignal(marketSignal("mkt-create", ORG_A));
    expect(tierB1Mocks.salesMarketSignal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "mkt-create",
        organizationId: ORG_A,
        label: "market-mkt-create",
        category: "buying",
        signalSource: "interaction",
        score: 0.82,
      }),
    });

    tierB1Mocks.salesMarketSignal.create.mockRejectedValueOnce(
      new Error("write failed"),
    );
    await expect(
      repo.prismaCreateMarketSignal(marketSignal("mkt-fail", ORG_A)),
    ).resolves.toBeUndefined();
  });

  it("updateMarketSignal scopes by organizationId", async () => {
    const repo = await loadModule();
    await repo.prismaUpdateMarketSignal(ORG_A, "mkt-1", {
      label: "updated",
      updatedAt: NOW.toISOString(),
    });
    expect(tierB1Mocks.salesMarketSignal.updateMany).toHaveBeenCalledWith({
      where: { id: "mkt-1", organizationId: ORG_A },
      data: expect.objectContaining({ label: "updated" }),
    });
  });

  it("deleteMarketSignal scopes by organizationId", async () => {
    const repo = await loadModule();
    await repo.prismaDeleteMarketSignal(ORG_A, "mkt-del");
    expect(tierB1Mocks.salesMarketSignal.deleteMany).toHaveBeenCalledWith({
      where: { id: "mkt-del", organizationId: ORG_A },
    });
  });

  it("CRUD for SalesCommercialRecommendation maps domain fields", async () => {
    const repo = await loadModule();
    const rec = commercialRecommendation("rec-1", ORG_A);

    await repo.prismaCreateCommercialRecommendation(rec);
    expect(tierB1Mocks.salesCommercialRecommendation.create).toHaveBeenCalledWith(
      {
        data: expect.objectContaining({
          category: "proof",
          ruleId: "proof_gap",
          title: "Add case study",
          priority: "high",
          confidence: 0.75,
          notAutonomous: true,
        }),
      },
    );

    await repo.prismaUpdateCommercialRecommendation(ORG_A, "rec-1", {
      title: "Updated title",
      updatedAt: NOW.toISOString(),
    });
    expect(
      tierB1Mocks.salesCommercialRecommendation.updateMany,
    ).toHaveBeenCalledWith({
      where: { id: "rec-1", organizationId: ORG_A },
      data: expect.objectContaining({ title: "Updated title" }),
    });

    await repo.prismaDeleteCommercialRecommendation(ORG_A, "rec-1");
    expect(
      tierB1Mocks.salesCommercialRecommendation.deleteMany,
    ).toHaveBeenCalledWith({
      where: { id: "rec-1", organizationId: ORG_A },
    });
  });
});
