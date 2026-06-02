// @ts-nocheck
import { describe, expect, it, beforeEach, jest } from "@jest/globals";

const ORG_A = "org-tier-b2-prisma-a";
const ORG_B = "org-tier-b2-prisma-b";
const NOW = new Date("2026-05-31T15:00:00.000Z");

type TierB2MockDelegate = {
  findMany: ReturnType<typeof jest.fn>;
  create: ReturnType<typeof jest.fn>;
  updateMany: ReturnType<typeof jest.fn>;
  deleteMany: ReturnType<typeof jest.fn>;
};

function makeDelegate(): TierB2MockDelegate {
  return {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
}

const tierB2Mocks: Record<string, TierB2MockDelegate> = {
  salesInstitutionalLearningInsight: makeDelegate(),
};

jest.mock("@/lib/prisma", () => ({
  prisma: new Proxy(
    {},
    {
      get: (_target, prop: string) => tierB2Mocks[prop],
    },
  ),
}));

import type { SalesInstitutionalLearningInsight } from "../types";

function snapshotRow(
  id: string,
  orgId: string,
  extra: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: orgId,
    source: "integration",
    status: "active",
    evidenceRef: null,
    evidenceLinkage: null,
    createdById: "user-1",
    createdAt: NOW,
    updatedAt: NOW,
    ...extra,
  };
}

function institutionalLearningInsight(
  id: string,
  orgId: string,
): SalesInstitutionalLearningInsight {
  const ts = NOW.toISOString();
  return {
    id,
    organizationId: orgId,
    dimension: "win_loss",
    title: "Win themes emerging",
    titleAr: "ظهور أنماط الفوز",
    narrative: "Closed-won deals share proof-heavy engagement.",
    narrativeAr: "الصفقات الرابحة تشترك في تفاعل غني بالأدلة.",
    confidence: 0.78,
    evidence: [
      {
        source: "won_deal",
        refId: "opp-1",
        summary: "Pilot proof attached before close",
        summaryAr: "تم إرفاق دليل تجريبي قبل الإغلاق",
      },
    ],
    outputStatus: "recommendation",
    insightLabel: "AI-assisted / evidence-based recommendation",
    snapshotAt: ts,
    source: "integration",
    status: "active",
    createdAt: ts,
    updatedAt: ts,
    createdById: "user-1",
  };
}

describe("salesos-prisma-repository-tier-b2", () => {
  beforeEach(() => {
    tierB2Mocks.salesInstitutionalLearningInsight = makeDelegate();
    jest.resetModules();
  });

  async function loadModule() {
    return import("../prisma-repository");
  }

  it("reports Tier B2 readiness when the delegate exists", async () => {
    const repo = await loadModule();
    expect(repo.isTierB2PrismaReady()).toBe(true);
  });

  it("returns null hydrate when Tier B2 delegate is missing (fail-soft)", async () => {
    delete tierB2Mocks.salesInstitutionalLearningInsight;
    const repo = await loadModule();
    expect(repo.isTierB2PrismaReady()).toBe(false);
    const maps = await repo.prismaLoadTierB2Intelligence(ORG_A);
    expect(maps).toBeNull();
  });

  it("hydrates Tier B2 maps with tenant-scoped rows mapped to types.ts", async () => {
    const allInsights = [
      snapshotRow("ins-a", ORG_A, {
        dimension: "engagement",
        title: "Engagement lift",
        titleAr: null,
        narrative: "Activity volume rose after proof assets.",
        narrativeAr: null,
        confidence: 0.71,
        evidence: [{ source: "activity", refId: "act-1", summary: "3 meetings" }],
        outputStatus: "recommendation",
        insightLabel: "AI-assisted / evidence-based recommendation",
        snapshotAt: NOW,
      }),
      snapshotRow("ins-b", ORG_B, {
        dimension: "market",
        title: "Other org insight",
        narrative: "Should be filtered out",
        confidence: 0.5,
        outputStatus: "recommendation",
        snapshotAt: NOW,
      }),
    ];
    tierB2Mocks.salesInstitutionalLearningInsight.findMany.mockImplementation(
      ({ where }: any) =>
        Promise.resolve(
          where?.organizationId
            ? allInsights.filter((i: any) => i.organizationId === where.organizationId)
            : allInsights,
        ),
    );

    const repo = await loadModule();
    const maps = await repo.prismaLoadTierB2Intelligence(ORG_A);
    expect(maps).not.toBeNull();
    expect(maps!.institutionalLearningInsights.size).toBe(1);
    expect(maps!.institutionalLearningInsights.get("ins-a")).toMatchObject({
      dimension: "engagement",
      title: "Engagement lift",
      confidence: 0.71,
      organizationId: ORG_A,
      evidence: [{ source: "activity", refId: "act-1", summary: "3 meetings" }],
    });
    expect(maps!.institutionalLearningInsights.has("ins-b")).toBe(false);
  });

  it("returns null on hydrate failure without throwing (fail-soft)", async () => {
    tierB2Mocks.salesInstitutionalLearningInsight.findMany.mockRejectedValue(
      new Error("db down"),
    );
    const repo = await loadModule();
    await expect(repo.prismaLoadTierB2Intelligence(ORG_A)).resolves.toBeNull();
  });

  it("createInstitutionalLearningInsight writes tenant-scoped row and does not throw on failure", async () => {
    const repo = await loadModule();
    await repo.prismaCreateInstitutionalLearningInsight(
      institutionalLearningInsight("ins-create", ORG_A),
    );
    expect(
      tierB2Mocks.salesInstitutionalLearningInsight.create,
    ).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "ins-create",
        organizationId: ORG_A,
        dimension: "win_loss",
        title: "Win themes emerging",
        narrative: "Closed-won deals share proof-heavy engagement.",
        confidence: 0.78,
        insightLabel: "AI-assisted / evidence-based recommendation",
      }),
    });

    tierB2Mocks.salesInstitutionalLearningInsight.create.mockRejectedValueOnce(
      new Error("write failed"),
    );
    await expect(
      repo.prismaCreateInstitutionalLearningInsight(
        institutionalLearningInsight("ins-fail", ORG_A),
      ),
    ).resolves.toBeUndefined();
  });

  it("updateInstitutionalLearningInsight scopes by organizationId", async () => {
    const repo = await loadModule();
    await repo.prismaUpdateInstitutionalLearningInsight(ORG_A, "ins-1", {
      title: "Updated title",
      updatedAt: NOW.toISOString(),
    });
    expect(
      tierB2Mocks.salesInstitutionalLearningInsight.updateMany,
    ).toHaveBeenCalledWith({
      where: { id: "ins-1", organizationId: ORG_A },
      data: expect.objectContaining({ title: "Updated title" }),
    });
  });

  it("deleteInstitutionalLearningInsight scopes by organizationId", async () => {
    const repo = await loadModule();
    await repo.prismaDeleteInstitutionalLearningInsight(ORG_A, "ins-del");
    expect(
      tierB2Mocks.salesInstitutionalLearningInsight.deleteMany,
    ).toHaveBeenCalledWith({
      where: { id: "ins-del", organizationId: ORG_A },
    });
  });
});
