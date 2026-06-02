// @ts-nocheck
import { describe, expect, it, beforeEach, jest } from "@jest/globals";

const ORG_A = "org-tier-b3-prisma-a";
const ORG_B = "org-tier-b3-prisma-b";
const NOW = new Date("2026-05-31T16:00:00.000Z");
const BUILD_ID = "build-2026-05-31T16:00:00.000Z";

type TierB3MockDelegate = {
  findMany: ReturnType<typeof jest.fn>;
  create: ReturnType<typeof jest.fn>;
  updateMany: ReturnType<typeof jest.fn>;
  deleteMany: ReturnType<typeof jest.fn>;
};

function makeDelegate(): TierB3MockDelegate {
  return {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
}

const tierB3Mocks: Record<string, TierB3MockDelegate> = {
  salesKnowledgeGraphNode: makeDelegate(),
  salesKnowledgeGraphEdge: makeDelegate(),
};

jest.mock("@/lib/prisma", () => ({
  prisma: new Proxy(
    {},
    {
      get: (_target, prop: string) => tierB3Mocks[prop],
    },
  ),
}));

import type { SalesKnowledgeGraphEdge, SalesKnowledgeGraphNode } from "../types";

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
    graphBuildId: BUILD_ID,
    builtAt: NOW,
    ...extra,
  };
}

function knowledgeGraphNode(
  id: string,
  orgId: string,
): SalesKnowledgeGraphNode {
  const ts = NOW.toISOString();
  return {
    id,
    organizationId: orgId,
    kind: "account",
    refId: "acct-1",
    label: "Acme Corp",
    graphBuildId: BUILD_ID,
    builtAt: ts,
    source: "integration",
    status: "active",
    createdAt: ts,
    updatedAt: ts,
    createdById: "user-1",
  };
}

function knowledgeGraphEdge(
  id: string,
  orgId: string,
): SalesKnowledgeGraphEdge {
  const ts = NOW.toISOString();
  return {
    id,
    organizationId: orgId,
    kind: "related_to",
    sourceNodeId: "node-a",
    targetNodeId: "node-b",
    graphBuildId: BUILD_ID,
    builtAt: ts,
    source: "integration",
    status: "active",
    createdAt: ts,
    updatedAt: ts,
    createdById: "user-1",
  };
}

describe("salesos-prisma-repository-tier-b3", () => {
  beforeEach(() => {
    tierB3Mocks.salesKnowledgeGraphNode = makeDelegate();
    tierB3Mocks.salesKnowledgeGraphEdge = makeDelegate();
    jest.resetModules();
  });

  async function loadModule() {
    return import("../prisma-repository");
  }

  it("reports Tier B3 readiness when both delegates exist", async () => {
    const repo = await loadModule();
    expect(repo.isTierB3PrismaReady()).toBe(true);
  });

  it("returns null hydrate when Tier B3 delegates are missing (fail-soft)", async () => {
    delete tierB3Mocks.salesKnowledgeGraphNode;
    delete tierB3Mocks.salesKnowledgeGraphEdge;
    const repo = await loadModule();
    expect(repo.isTierB3PrismaReady()).toBe(false);
    const maps = await repo.prismaLoadTierB3Intelligence(ORG_A);
    expect(maps).toBeNull();
  });

  it("hydrates Tier B3 maps with tenant-scoped rows mapped to types.ts", async () => {
    const allNodes = [
      snapshotRow("node-a", ORG_A, {
        kind: "account",
        refId: "acct-1",
        label: "Acme Corp",
      }),
      snapshotRow("node-b", ORG_B, {
        kind: "account",
        refId: "acct-2",
        label: "Other org",
      }),
    ];
    tierB3Mocks.salesKnowledgeGraphNode.findMany.mockImplementation(
      ({ where }: any) =>
        Promise.resolve(
          where?.organizationId
            ? allNodes.filter((n: any) => n.organizationId === where.organizationId)
            : allNodes,
        ),
    );
    tierB3Mocks.salesKnowledgeGraphEdge.findMany.mockImplementation(
      ({ where }: any) =>
        Promise.resolve(
          where?.organizationId === ORG_A
            ? [
                snapshotRow("edge-a", ORG_A, {
                  kind: "related_to",
                  sourceNodeId: "node-a",
                  targetNodeId: "node-z",
                }),
              ]
            : [],
        ),
    );

    const repo = await loadModule();
    const maps = await repo.prismaLoadTierB3Intelligence(ORG_A);
    expect(maps).not.toBeNull();
    expect(maps!.knowledgeGraphNodes.size).toBe(1);
    expect(maps!.knowledgeGraphEdges.size).toBe(1);
    expect(maps!.knowledgeGraphNodes.get("node-a")).toMatchObject({
      kind: "account",
      refId: "acct-1",
      label: "Acme Corp",
      organizationId: ORG_A,
      graphBuildId: BUILD_ID,
    });
    expect(maps!.knowledgeGraphNodes.has("node-b")).toBe(false);
  });

  it("returns null on hydrate failure without throwing (fail-soft)", async () => {
    tierB3Mocks.salesKnowledgeGraphNode.findMany.mockRejectedValue(
      new Error("db down"),
    );
    const repo = await loadModule();
    await expect(repo.prismaLoadTierB3Intelligence(ORG_A)).resolves.toBeNull();
  });

  it("createKnowledgeGraphNode writes tenant-scoped row and does not throw on failure", async () => {
    const repo = await loadModule();
    await repo.prismaCreateKnowledgeGraphNode(
      knowledgeGraphNode("node-create", ORG_A),
    );
    expect(tierB3Mocks.salesKnowledgeGraphNode.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "node-create",
        organizationId: ORG_A,
        kind: "account",
        refId: "acct-1",
        graphBuildId: BUILD_ID,
      }),
    });

    tierB3Mocks.salesKnowledgeGraphNode.create.mockRejectedValueOnce(
      new Error("write failed"),
    );
    await expect(
      repo.prismaCreateKnowledgeGraphNode(
        knowledgeGraphNode("node-fail", ORG_A),
      ),
    ).resolves.toBeUndefined();
  });

  it("createKnowledgeGraphEdge writes tenant-scoped row", async () => {
    const repo = await loadModule();
    await repo.prismaCreateKnowledgeGraphEdge(
      knowledgeGraphEdge("edge-create", ORG_A),
    );
    expect(tierB3Mocks.salesKnowledgeGraphEdge.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: "edge-create",
        organizationId: ORG_A,
        kind: "related_to",
        sourceNodeId: "node-a",
        targetNodeId: "node-b",
      }),
    });
  });

  it("updateKnowledgeGraphNode scopes by organizationId", async () => {
    const repo = await loadModule();
    await repo.prismaUpdateKnowledgeGraphNode(ORG_A, "node-1", {
      label: "Updated label",
      updatedAt: NOW.toISOString(),
    });
    expect(tierB3Mocks.salesKnowledgeGraphNode.updateMany).toHaveBeenCalledWith({
      where: { id: "node-1", organizationId: ORG_A },
      data: expect.objectContaining({ label: "Updated label" }),
    });
  });

  it("deleteKnowledgeGraphEdge scopes by organizationId", async () => {
    const repo = await loadModule();
    await repo.prismaDeleteKnowledgeGraphEdge(ORG_A, "edge-del");
    expect(tierB3Mocks.salesKnowledgeGraphEdge.deleteMany).toHaveBeenCalledWith({
      where: { id: "edge-del", organizationId: ORG_A },
    });
  });
});
