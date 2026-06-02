// @ts-nocheck
import { describe, expect, it, beforeEach, jest } from "@jest/globals";

const ORG_A = "org-tier-a-prisma-a";
const ORG_B = "org-tier-a-prisma-b";
const NOW = new Date("2026-05-31T12:00:00.000Z");

type TierAMockDelegate = {
  findMany: ReturnType<typeof jest.fn>;
  create: ReturnType<typeof jest.fn>;
  updateMany: ReturnType<typeof jest.fn>;
  deleteMany: ReturnType<typeof jest.fn>;
};

function makeDelegate(): TierAMockDelegate {
  return {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
}

const tierAMocks: Record<string, TierAMockDelegate> = {
  salesSignal: makeDelegate(),
  salesObjection: makeDelegate(),
  salesCompetitorMention: makeDelegate(),
  salesWinLossInsight: makeDelegate(),
  salesICPInsight: makeDelegate(),
  salesNextAction: makeDelegate(),
  salesProofAsset: makeDelegate(),
};

jest.mock("@/lib/prisma", () => ({
  prisma: new Proxy(
    {},
    {
      get: (_target, prop: string) => tierAMocks[prop],
    },
  ),
}));

import type {
  SalesCompetitorMention,
  SalesICPInsight,
  SalesNextAction,
  SalesObjection,
  SalesProofAsset,
  SalesSignal,
  SalesWinLossInsight,
} from "../types";

function intelligenceRow(
  id: string,
  orgId: string,
  extra: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: orgId,
    accountId: null,
    opportunityId: null,
    source: "manual",
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

function signal(id: string, orgId: string): SalesSignal {
  const ts = NOW.toISOString();
  return {
    id,
    organizationId: orgId,
    signalType: "buying",
    description: `signal-${id}`,
    strength: "moderate",
    source: "manual",
    status: "active",
    createdAt: ts,
    updatedAt: ts,
    createdById: "user-1",
  };
}

describe("salesos-prisma-repository-intelligence", () => {
  beforeEach(() => {
    for (const delegate of Object.values(tierAMocks)) {
      delegate.findMany.mockReset().mockResolvedValue([]);
      delegate.create.mockReset().mockResolvedValue({});
      delegate.updateMany.mockReset().mockResolvedValue({ count: 1 });
      delegate.deleteMany.mockReset().mockResolvedValue({ count: 1 });
    }
    jest.resetModules();
  });

  async function loadModule() {
    return import("../prisma-repository");
  }

  it("reports Tier A readiness when all seven delegates exist", async () => {
    const repo = await loadModule();
    expect(repo.isTierAPrismaIntelligenceReady()).toBe(true);
  });

  it("returns null hydrate when Tier A delegates are missing (fail-soft)", async () => {
    for (const key of Object.keys(tierAMocks)) {
      delete tierAMocks[key];
    }
    const repo = await loadModule();
    expect(repo.isTierAPrismaIntelligenceReady()).toBe(false);
    const maps = await repo.prismaLoadTierAIntelligence(ORG_A);
    expect(maps).toBeNull();
    tierAMocks.salesSignal = makeDelegate();
    tierAMocks.salesObjection = makeDelegate();
    tierAMocks.salesCompetitorMention = makeDelegate();
    tierAMocks.salesWinLossInsight = makeDelegate();
    tierAMocks.salesICPInsight = makeDelegate();
    tierAMocks.salesNextAction = makeDelegate();
    tierAMocks.salesProofAsset = makeDelegate();
  });

  it("hydrates Tier A maps with tenant-scoped rows mapped to types.ts", async () => {
    const sigRows = [
      intelligenceRow("sig-a", ORG_A, {
        signalType: "buying",
        description: "budget confirmed",
        strength: "strong",
      }),
      intelligenceRow("sig-b", ORG_B, {
        signalType: "timing",
        description: "other org",
        strength: "weak",
      }),
    ];
    tierAMocks.salesSignal.findMany.mockImplementation((args?: any) => {
      const orgId = args?.where?.organizationId;
      return Promise.resolve(orgId ? sigRows.filter((r) => r.organizationId === orgId) : sigRows);
    });
    const objRows = [
      intelligenceRow("obj-a", ORG_A, {
        category: "price",
        description: "too expensive",
        frequency: 2,
        resolved: false,
      }),
    ];
    tierAMocks.salesObjection.findMany.mockImplementation((args?: any) => {
      const orgId = args?.where?.organizationId;
      return Promise.resolve(orgId ? objRows.filter((r) => r.organizationId === orgId) : objRows);
    });

    const repo = await loadModule();
    const maps = await repo.prismaLoadTierAIntelligence(ORG_A);
    expect(maps).not.toBeNull();
    expect(maps!.signals.size).toBe(1);
    expect(maps!.signals.get("sig-a")).toMatchObject({
      signalType: "buying",
      description: "budget confirmed",
      strength: "strong",
      organizationId: ORG_A,
    });
    expect(maps!.objections.get("obj-a")?.frequency).toBe(2);
    expect(maps!.signals.has("sig-b")).toBe(false);
  });

  it("returns null on hydrate failure without throwing (fail-soft)", async () => {
    tierAMocks.salesSignal.findMany.mockRejectedValue(new Error("db down"));
    const repo = await loadModule();
    await expect(repo.prismaLoadTierAIntelligence(ORG_A)).resolves.toBeNull();
  });

  it("createSignal writes tenant-scoped row and does not throw on failure", async () => {
    const repo = await loadModule();
    await repo.prismaCreateSignal(signal("sig-create", ORG_A));
    expect(tierAMocks.salesSignal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "sig-create",
        organizationId: ORG_A,
        signalType: "buying",
        description: "signal-sig-create",
        strength: "moderate",
      }),
    });

    tierAMocks.salesSignal.create.mockRejectedValueOnce(new Error("write failed"));
    await expect(
      repo.prismaCreateSignal(signal("sig-fail", ORG_A)),
    ).resolves.toBeUndefined();
  });

  it("updateSignal scopes by organizationId", async () => {
    const repo = await loadModule();
    await repo.prismaUpdateSignal(ORG_A, "sig-1", {
      description: "updated",
      updatedAt: NOW.toISOString(),
    });
    expect(tierAMocks.salesSignal.updateMany).toHaveBeenCalledWith({
      where: { id: "sig-1", organizationId: ORG_A },
      data: expect.objectContaining({ description: "updated" }),
    });
  });

  it("deleteSignal scopes by organizationId", async () => {
    const repo = await loadModule();
    await repo.prismaDeleteSignal(ORG_A, "sig-del");
    expect(tierAMocks.salesSignal.deleteMany).toHaveBeenCalledWith({
      where: { id: "sig-del", organizationId: ORG_A },
    });
  });

  it("CRUD for remaining Tier A entities maps domain fields", async () => {
    const repo = await loadModule();
    const ts = NOW.toISOString();

    const objection: SalesObjection = {
      id: "obj-1",
      organizationId: ORG_A,
      category: "security",
      description: "SOC2 concern",
      source: "manual",
      status: "active",
      createdAt: ts,
      updatedAt: ts,
    };
    await repo.prismaCreateObjection(objection);
    expect(tierAMocks.salesObjection.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ category: "security" }),
    });

    const mention: SalesCompetitorMention = {
      id: "cmp-1",
      organizationId: ORG_A,
      competitorName: "RivalCo",
      context: "mentioned in call",
      threatLevel: "high",
      source: "manual",
      status: "active",
      createdAt: ts,
      updatedAt: ts,
    };
    await repo.prismaCreateCompetitorMention(mention);
    expect(tierAMocks.salesCompetitorMention.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        competitorName: "RivalCo",
        threatLevel: "high",
      }),
    });

    const winLoss: SalesWinLossInsight = {
      id: "wl-1",
      organizationId: ORG_A,
      opportunityId: "opp-1",
      outcome: "won",
      primaryReason: "fit",
      contributingFactors: ["price", "timing"],
      source: "manual",
      status: "active",
      createdAt: ts,
      updatedAt: ts,
    };
    await repo.prismaCreateWinLossInsight(winLoss);
    expect(tierAMocks.salesWinLossInsight.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        opportunityId: "opp-1",
        contributingFactors: ["price", "timing"],
      }),
    });

    const icp: SalesICPInsight = {
      id: "icp-1",
      organizationId: ORG_A,
      dimension: "industry",
      hypothesis: "healthcare fits",
      evidenceSummary: "3 wins",
      source: "manual",
      status: "active",
      createdAt: ts,
      updatedAt: ts,
    };
    await repo.prismaCreateICPInsight(icp);
    expect(tierAMocks.salesICPInsight.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ dimension: "industry" }),
    });

    const nextAction: SalesNextAction = {
      id: "na-1",
      organizationId: ORG_A,
      title: "Send proposal",
      priority: "high",
      dueAt: ts,
      source: "manual",
      status: "active",
      createdAt: ts,
      updatedAt: ts,
    };
    await repo.prismaCreateNextAction(nextAction);
    expect(tierAMocks.salesNextAction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "Send proposal",
        dueAt: NOW.toISOString(),
      }),
    });

    const proof: SalesProofAsset = {
      id: "proof-1",
      organizationId: ORG_A,
      assetType: "case_study",
      title: "Pilot success",
      linkedAccountIds: ["acc-1"],
      source: "manual",
      status: "active",
      createdAt: ts,
      updatedAt: ts,
    };
    await repo.prismaCreateProofAsset(proof);
    expect(tierAMocks.salesProofAsset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        assetType: "case_study",
        linkedAccountIds: ["acc-1"],
      }),
    });

    await repo.prismaDeleteProofAsset(ORG_A, "proof-1");
    expect(tierAMocks.salesProofAsset.deleteMany).toHaveBeenCalledWith({
      where: { id: "proof-1", organizationId: ORG_A },
    });
  });
});
