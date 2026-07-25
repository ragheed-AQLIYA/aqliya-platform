import { describe, expect, it, beforeEach, jest } from "@jest/globals";

const ORG_A = "org-prisma-repo-a";
const ORG_B = "org-prisma-repo-b";
const OWNER_ID = "user-owner-1";
const NOW = new Date("2026-07-21T12:00:00.000Z");
const TS = NOW.toISOString();

// ─── Mock setup (follows existing tier test patterns) ──────────────────

type MockDelegate = {
  findMany: ReturnType<typeof jest.fn>;
  count: ReturnType<typeof jest.fn>;
  create: ReturnType<typeof jest.fn>;
  updateMany: ReturnType<typeof jest.fn>;
  deleteMany: ReturnType<typeof jest.fn>;
};

function makeDelegate(): MockDelegate {
  return {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
}

const modelMocks: Record<string, MockDelegate> = {
  salesAccount: makeDelegate(),
  salesContact: makeDelegate(),
  salesDeal: makeDelegate(),
  salesInteraction: makeDelegate(),
  salesEvidenceLink: makeDelegate(),
  salesMarketSignal: makeDelegate(),
  salesCommercialRecommendation: makeDelegate(),
  salesInstitutionalLearningInsight: makeDelegate(),
  salesKnowledgeGraphNode: makeDelegate(),
  salesKnowledgeGraphEdge: makeDelegate(),
  salesSignal: makeDelegate(),
  salesObjection: makeDelegate(),
  salesCompetitorMention: makeDelegate(),
  salesWinLossInsight: makeDelegate(),
  salesICPInsight: makeDelegate(),
  salesNextAction: makeDelegate(),
  salesProofAsset: makeDelegate(),
};

const txMock = jest.fn().mockImplementation(
  (fn: (tx: Record<string, MockDelegate>) => Promise<void>) =>
    fn(modelMocks),
);

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true, id: "pal-1" }),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: new Proxy(
    { $transaction: txMock },
    {
      get: (
        target: Record<string, unknown>,
        prop: string,
      ) => {
        if (prop === "$transaction") return target.$transaction;
        return modelMocks[prop as keyof typeof modelMocks];
      },
    },
  ),
}));

// ─── Imports (after mock) ───────────────────────────────────────────────

import {
  prismaLoadOrgSnapshot,
  prismaSeedOrg,
  prismaCreateAccount,
  prismaCreateOpportunity,
  prismaCreateInteraction,
  prismaUpdateOpportunity,
  prismaCreateEvidence,
  prismaAppendAuditEntry,
  isTierB1PrismaReady,
  prismaLoadTierB1Intelligence,
  prismaCreateMarketSignal,
  prismaUpdateMarketSignal,
  prismaDeleteMarketSignal,
  prismaCreateCommercialRecommendation,
  prismaUpdateCommercialRecommendation,
  prismaDeleteCommercialRecommendation,
  isTierB2PrismaReady,
  prismaLoadTierB2Intelligence,
  prismaCreateInstitutionalLearningInsight,
  prismaUpdateInstitutionalLearningInsight,
  prismaDeleteInstitutionalLearningInsight,
  isTierB3PrismaReady,
  prismaLoadTierB3Intelligence,
  prismaCreateKnowledgeGraphNode,
  prismaCreateKnowledgeGraphEdge,
  prismaUpdateKnowledgeGraphNode,
  prismaDeleteKnowledgeGraphEdge,
  isTierAPrismaIntelligenceReady,
  prismaLoadTierAIntelligence,
  prismaCreateSignal,
  prismaUpdateSignal,
  prismaDeleteSignal,
  prismaCreateObjection,
  prismaCreateCompetitorMention,
  prismaCreateWinLossInsight,
  prismaCreateICPInsight,
  prismaCreateNextAction,
  prismaCreateProofAsset,
  prismaDeleteProofAsset,
} from "../prisma-repository";

import type { SalesAccount, SalesOpportunity, SalesInteractionLog } from "../types";
import type { SalesEvidenceRef, SalesAuditEntry } from "../store";

// ─── Helpers ────────────────────────────────────────────────────────────

function resetMocks(): void {
  for (const delegate of Object.values(modelMocks)) {
    delegate.findMany.mockResolvedValue([]);
    delegate.count.mockResolvedValue(0);
    delegate.create.mockResolvedValue({});
    delegate.updateMany.mockResolvedValue({ count: 1 });
    delegate.deleteMany.mockResolvedValue({ count: 1 });
  }
  txMock.mockClear();
  txMock.mockImplementation(
    (fn: (tx: Record<string, MockDelegate>) => Promise<void>) =>
      fn(modelMocks),
  );
}

beforeEach(() => {
  resetMocks();
});

function makeAccount(id: string, orgId: string): SalesAccount {
  return {
    id,
    organizationId: orgId,
    name: "Test Account",
    nameAr: "\u062D\u0633\u0627\u0628 \u0627\u062E\u062A\u0628\u0627\u0631",
    status: "qualified",
    industry: "Technology",
    ownerId: OWNER_ID,
    createdById: OWNER_ID,
    createdAt: TS,
    updatedAt: TS,
  };
}

function makeOpportunity(id: string, orgId: string, accountId: string): SalesOpportunity {
  return {
    id,
    organizationId: orgId,
    accountId,
    name: "Test Deal",
    stage: "Qualified",
    valueEstimate: 500000,
    currency: "SAR",
    qualificationScore: 75,
    ownerId: OWNER_ID,
    createdById: OWNER_ID,
  };
}

function makeInteraction(id: string, orgId: string, accountId: string): SalesInteractionLog {
  return {
    id,
    organizationId: orgId,
    accountId,
    opportunityId: "opp-1",
    contactId: "contact-1",
    type: "meeting",
    summary: "Test interaction",
    loggedById: OWNER_ID,
    loggedAt: TS,
  };
}

function makeEvidence(id: string, orgId: string, oppId: string): SalesEvidenceRef {
  return {
    id,
    organizationId: orgId,
    opportunityId: oppId,
    typeId: "evidence-type-1",
    label: "Test evidence",
    linkedById: OWNER_ID,
    linkedAt: TS,
  };
}

function makeAuditEntry(id: string, orgId: string): SalesAuditEntry {
  return {
    id,
    organizationId: orgId,
    action: "sales.account.created",
    actorId: OWNER_ID,
    targetType: "SalesAccount",
    targetId: "acct-1",
    timestamp: TS,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────

describe("prisma-repository \u2014 Core CRUD", () => {
  // \u2014\u2014 prismaLoadOrgSnapshot \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014

  it("returns null when org has no accounts", async () => {
    modelMocks.salesAccount.count.mockResolvedValue(0);
    const result = await prismaLoadOrgSnapshot(ORG_A);
    expect(result).toBeNull();
  });

  it("loads org snapshot when accounts exist", async () => {
    modelMocks.salesAccount.count.mockResolvedValue(1);
    modelMocks.salesAccount.findMany.mockResolvedValue([
      { id: "acct-1", organizationId: ORG_A, name: "Acme", nameAr: null, industry: null, status: "qualified", ownerId: OWNER_ID, createdById: OWNER_ID, createdAt: NOW, updatedAt: NOW },
    ]);
    modelMocks.salesContact.findMany.mockResolvedValue([
      { id: "contact-1", organizationId: ORG_A, accountId: "acct-1", name: "Alice", title: null, email: null, phone: null, sensitivityLevel: "standard", ownerId: OWNER_ID, createdById: OWNER_ID },
    ]);
    modelMocks.salesDeal.findMany.mockResolvedValue([
      { id: "deal-1", organizationId: ORG_A, accountId: "acct-1", name: null, title: "Deal 1", pipelineStage: "Qualified", amount: null, currency: "SAR", qualificationScore: null, ownerId: OWNER_ID, createdById: OWNER_ID, reviewStatus: null, approvalStatus: null, probability: null, expectedCloseDate: null },
    ]);
    modelMocks.salesInteraction.findMany.mockResolvedValue([
      { id: "int-1", organizationId: ORG_A, accountId: "acct-1", dealId: null, contactId: null, type: "meeting", summary: "met", evidenceRef: null, createdById: OWNER_ID, occurredAt: NOW },
    ]);
    modelMocks.salesEvidenceLink.findMany.mockResolvedValue([
      { id: "ev-1", organizationId: ORG_A, targetId: "deal-1", evidenceId: "ev-type-1", label: null, createdById: OWNER_ID, createdAt: NOW },
    ]);

    const result = await prismaLoadOrgSnapshot(ORG_A);

    expect(result).not.toBeNull();
    expect(result!.accounts).toHaveLength(1);
    expect(result!.contacts).toHaveLength(1);
    expect(result!.opportunities).toHaveLength(1);
    expect(result!.interactions).toHaveLength(1);
    expect(result!.evidence).toHaveLength(1);
    expect(result!.seeded).toBe(true);
  });

  it("scopes snapshot load to organizationId", async () => {
    modelMocks.salesAccount.count.mockResolvedValue(1);
    await prismaLoadOrgSnapshot(ORG_B);

    expect(modelMocks.salesAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: ORG_B } }),
    );
    expect(modelMocks.salesContact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: ORG_B } }),
    );
  });

  // \u2014\u2014 prismaSeedOrg \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014

  it("seeds data via transaction when org is empty", async () => {
    modelMocks.salesAccount.count.mockResolvedValue(0);

    await prismaSeedOrg(ORG_A, OWNER_ID);

    expect(txMock).toHaveBeenCalled();
    expect(modelMocks.salesAccount.create).toHaveBeenCalled();
    expect(modelMocks.salesContact.create).toHaveBeenCalled();
    expect(modelMocks.salesDeal.create).toHaveBeenCalled();
    expect(modelMocks.salesInteraction.create).toHaveBeenCalled();
  });

  it("skips seeding when org already has accounts", async () => {
    modelMocks.salesAccount.count.mockResolvedValue(5);

    await prismaSeedOrg(ORG_A, OWNER_ID);

    expect(txMock).not.toHaveBeenCalled();
  });

  // \u2014\u2014 prismaCreateAccount \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014

  it("creates an account", async () => {
    const account = makeAccount("acct-new", ORG_A);

    await prismaCreateAccount(account);

    expect(modelMocks.salesAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: "acct-new",
          organizationId: ORG_A,
          name: "Test Account",
        }),
      }),
    );
  });

  // \u2014\u2014 prismaCreateOpportunity \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014

  it("creates an opportunity (salesDeal)", async () => {
    const opp = makeOpportunity("opp-new", ORG_A, "acct-1");

    await prismaCreateOpportunity(opp);

    expect(modelMocks.salesDeal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: "opp-new",
          organizationId: ORG_A,
          accountId: "acct-1",
          status: "open",
        }),
      }),
    );
  });

  // \u2014\u2014 prismaCreateInteraction \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014

  it("creates an interaction", async () => {
    const interaction = makeInteraction("int-new", ORG_A, "acct-1");

    await prismaCreateInteraction(interaction);

    expect(modelMocks.salesInteraction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: "int-new",
          organizationId: ORG_A,
          type: "meeting",
        }),
      }),
    );
  });

  // \u2014\u2014 prismaUpdateOpportunity \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014

  it("updates opportunity fields with org scoping", async () => {
    await prismaUpdateOpportunity(ORG_A, "opp-1", {
      stage: "Proposal",
      reviewStatus: "pending_review",
      valueEstimate: 800000,
    });

    expect(modelMocks.salesDeal.updateMany).toHaveBeenCalledWith({
      where: { id: "opp-1", organizationId: ORG_A },
      data: {
        pipelineStage: "Proposal",
        reviewStatus: "pending_review",
        amount: 800000,
      },
    });
  });

  it("does not update opportunity for wrong org", async () => {
    modelMocks.salesDeal.updateMany.mockResolvedValue({ count: 0 });

    await prismaUpdateOpportunity(ORG_B, "opp-1", { stage: "Negotiation" });

    expect(modelMocks.salesDeal.updateMany).toHaveBeenCalledWith({
      where: { id: "opp-1", organizationId: ORG_B },
      data: { pipelineStage: "Negotiation" },
    });
  });

  // \u2014\u2014 prismaCreateEvidence \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014

  it("creates evidence link", async () => {
    const ref = makeEvidence("ev-new", ORG_A, "opp-1");

    await prismaCreateEvidence(ref);

    expect(modelMocks.salesEvidenceLink.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: "ev-new",
          organizationId: ORG_A,
          targetType: "SalesDeal",
        }),
      }),
    );
  });

  // \u2014\u2014 prismaAppendAuditEntry \u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014

  it("is a no-op (platform audit trail handles persistence)", async () => {
    const entry = makeAuditEntry("audit-1", ORG_A);

    await expect(prismaAppendAuditEntry(entry)).resolves.toBeUndefined();
  });
});

describe("prisma-repository \u2014 Tier B1 (market signals, commercial recs)", () => {
  beforeEach(() => {
    modelMocks.salesMarketSignal = makeDelegate();
    modelMocks.salesCommercialRecommendation = makeDelegate();
  });

  it("isTierB1PrismaReady returns true when delegates exist", () => {
    expect(isTierB1PrismaReady()).toBe(true);
  });

  it("prismaLoadTierB1Intelligence loads and maps data", async () => {
    modelMocks.salesMarketSignal.findMany.mockResolvedValue([
      { id: "ms-1", organizationId: ORG_A, type: "buying_signal", description: "Budget allocated", detectedAt: TS, createdAt: NOW },
    ]);
    modelMocks.salesCommercialRecommendation.findMany.mockResolvedValue([
      { id: "cr-1", organizationId: ORG_A, recommendation: "Upsell", rationale: "Fit", confidence: 0.85, status: "active", createdById: OWNER_ID, createdAt: TS },
    ]);

    const result = await prismaLoadTierB1Intelligence(ORG_A);

    expect(result).not.toBeNull();
    expect(result!.marketSignals.size).toBe(1);
    expect(result!.marketSignals.get("ms-1")).toBeDefined();
    expect(result!.commercialRecommendations.size).toBe(1);
    expect(result!.commercialRecommendations.get("cr-1")).toBeDefined();
  });

  it("prismaLoadTierB1Intelligence returns null on error", async () => {
    modelMocks.salesMarketSignal.findMany.mockRejectedValue(new Error("DB error"));
    const result = await prismaLoadTierB1Intelligence(ORG_A);
    expect(result).toBeNull();
  });

  it("creates market signal", async () => {
    await prismaCreateMarketSignal({ id: "ms-new", organizationId: ORG_A });
    expect(modelMocks.salesMarketSignal.create).toHaveBeenCalledWith(
      { data: { id: "ms-new", organizationId: ORG_A } },
    );
  });

  it("updates market signal with org scoping", async () => {
    await prismaUpdateMarketSignal(ORG_A, "ms-1", { description: "Updated" });
    expect(modelMocks.salesMarketSignal.updateMany).toHaveBeenCalledWith({
      where: { id: "ms-1", organizationId: ORG_A },
      data: { description: "Updated" },
    });
  });

  it("deletes market signal with org scoping", async () => {
    await prismaDeleteMarketSignal(ORG_A, "ms-1");
    expect(modelMocks.salesMarketSignal.deleteMany).toHaveBeenCalledWith({
      where: { id: "ms-1", organizationId: ORG_A },
    });
  });

  it("creates commercial recommendation", async () => {
    await prismaCreateCommercialRecommendation({ id: "cr-new", organizationId: ORG_A });
    expect(modelMocks.salesCommercialRecommendation.create).toHaveBeenCalledWith(
      { data: { id: "cr-new", organizationId: ORG_A } },
    );
  });
});

describe("prisma-repository \u2014 Tier B2 (institutional learning insights)", () => {
  it("isTierB2PrismaReady returns true when delegate exists", () => {
    expect(isTierB2PrismaReady()).toBe(true);
  });

  it("prismaLoadTierB2Intelligence loads and maps data", async () => {
    modelMocks.salesInstitutionalLearningInsight.findMany.mockResolvedValue([
      { id: "ili-1", organizationId: ORG_A, dimension: "win_loss", title: "Win themes", narrative: "Insight text", createdAt: NOW },
    ]);

    const result = await prismaLoadTierB2Intelligence(ORG_A);

    expect(result).not.toBeNull();
    expect(result!.institutionalLearningInsights.size).toBe(1);
    expect(result!.institutionalLearningInsights.get("ili-1")).toBeDefined();
  });

  it("prismaLoadTierB2Intelligence returns null on error", async () => {
    modelMocks.salesInstitutionalLearningInsight.findMany.mockRejectedValue(new Error("fail"));
    const result = await prismaLoadTierB2Intelligence(ORG_A);
    expect(result).toBeNull();
  });

  it("creates institutional learning insight", async () => {
    await prismaCreateInstitutionalLearningInsight({ id: "ili-new", organizationId: ORG_A });
    expect(modelMocks.salesInstitutionalLearningInsight.create).toHaveBeenCalledWith(
      { data: { id: "ili-new", organizationId: ORG_A } },
    );
  });

  it("deletes institutional learning insight with org scoping", async () => {
    await prismaDeleteInstitutionalLearningInsight(ORG_A, "ili-1");
    expect(modelMocks.salesInstitutionalLearningInsight.deleteMany).toHaveBeenCalledWith({
      where: { id: "ili-1", organizationId: ORG_A },
    });
  });
});

describe("prisma-repository \u2014 Tier B3 (knowledge graph)", () => {
  it("isTierB3PrismaReady returns true when delegate exists", () => {
    expect(isTierB3PrismaReady()).toBe(true);
  });

  it("prismaLoadTierB3Intelligence loads and maps data", async () => {
    modelMocks.salesKnowledgeGraphNode.findMany.mockResolvedValue([
      { id: "node-1", organizationId: ORG_A, kind: "account", refId: "acct-1", label: "Acme", graphBuildId: "build-1", builtAt: NOW, source: "integration", status: "active", createdAt: NOW, updatedAt: NOW, createdById: OWNER_ID },
    ]);
    modelMocks.salesKnowledgeGraphEdge.findMany.mockResolvedValue([
      { id: "edge-1", organizationId: ORG_A, kind: "related", sourceNodeId: "node-1", targetNodeId: "node-2", graphBuildId: "build-1", builtAt: NOW, source: "integration", status: "active", createdAt: NOW, updatedAt: NOW, createdById: OWNER_ID },
    ]);

    const result = await prismaLoadTierB3Intelligence(ORG_A);

    expect(result).not.toBeNull();
    expect(result!.knowledgeGraphNodes.size).toBe(1);
    expect(result!.knowledgeGraphEdges.size).toBe(1);
    expect(result!.knowledgeGraphNodes.get("node-1")!.label).toBe("Acme");
  });

  it("prismaLoadTierB3Intelligence returns null on error", async () => {
    modelMocks.salesKnowledgeGraphNode.findMany.mockRejectedValue(new Error("fail"));
    const result = await prismaLoadTierB3Intelligence(ORG_A);
    expect(result).toBeNull();
  });

  it("creates knowledge graph node", async () => {
    await prismaCreateKnowledgeGraphNode({
      id: "node-new",
      organizationId: ORG_A,
      kind: "account",
      refId: "acct-1",
      label: "New Node",
      graphBuildId: "build-1",
      builtAt: TS,
      source: "manual",
      status: "active",
      createdAt: TS,
      updatedAt: TS,
      createdById: OWNER_ID,
    });
    expect(modelMocks.salesKnowledgeGraphNode.create).toHaveBeenCalled();
  });

  it("creates knowledge graph edge", async () => {
    await prismaCreateKnowledgeGraphEdge({
      id: "edge-new",
      organizationId: ORG_A,
      kind: "related",
      sourceNodeId: "node-1",
      targetNodeId: "node-2",
      graphBuildId: "build-1",
      builtAt: TS,
      source: "manual",
      status: "active",
      createdAt: TS,
      updatedAt: TS,
      createdById: OWNER_ID,
    });
    expect(modelMocks.salesKnowledgeGraphEdge.create).toHaveBeenCalled();
  });

  it("updates knowledge graph node with org scoping", async () => {
    await prismaUpdateKnowledgeGraphNode(ORG_A, "node-1", { label: "Updated Label" });
    expect(modelMocks.salesKnowledgeGraphNode.updateMany).toHaveBeenCalledWith({
      where: { id: "node-1", organizationId: ORG_A },
      data: { label: "Updated Label" },
    });
  });

  it("deletes knowledge graph edge with org scoping", async () => {
    await prismaDeleteKnowledgeGraphEdge(ORG_A, "edge-1");
    expect(modelMocks.salesKnowledgeGraphEdge.deleteMany).toHaveBeenCalledWith({
      where: { id: "edge-1", organizationId: ORG_A },
    });
  });
});

describe("prisma-repository \u2014 Tier A (signals, objections, mentions, insights)", () => {
  it("isTierAPrismaIntelligenceReady returns true when delegates exist", () => {
    expect(isTierAPrismaIntelligenceReady()).toBe(true);
  });

  it("prismaLoadTierAIntelligence loads and maps data", async () => {
    modelMocks.salesSignal.findMany.mockResolvedValue([
      { id: "sig-1", organizationId: ORG_A, signalType: "buying", description: "Budget ready", createdAt: NOW },
    ]);
    modelMocks.salesObjection.findMany.mockResolvedValue([
      { id: "obj-1", organizationId: ORG_A, category: "price", description: "Too expensive", createdAt: NOW },
    ]);
    modelMocks.salesCompetitorMention.findMany.mockResolvedValue([
      { id: "comp-1", organizationId: ORG_A, competitorName: "CompetitorX", context: "RFP", createdAt: NOW },
    ]);
    modelMocks.salesWinLossInsight.findMany.mockResolvedValue([
      { id: "wl-1", organizationId: ORG_A, outcome: "won", primaryReason: "Price", createdAt: NOW },
    ]);
    modelMocks.salesICPInsight.findMany.mockResolvedValue([
      { id: "icp-1", organizationId: ORG_A, dimension: "industry", hypothesis: "Tech firms buy", evidenceSummary: "Data shows", createdAt: NOW },
    ]);
    modelMocks.salesNextAction.findMany.mockResolvedValue([
      { id: "na-1", organizationId: ORG_A, title: "Follow up", priority: "high", createdAt: NOW },
    ]);
    modelMocks.salesProofAsset.findMany.mockResolvedValue([
      { id: "pa-1", organizationId: ORG_A, assetType: "case_study", title: "Case Study", createdAt: NOW },
    ]);

    const result = await prismaLoadTierAIntelligence(ORG_A);

    expect(result).not.toBeNull();
    expect(result!.signals.size).toBe(1);
    expect(result!.objections.size).toBe(1);
    expect(result!.competitorMentions.size).toBe(1);
    expect(result!.winLossInsights.size).toBe(1);
    expect(result!.icpInsights.size).toBe(1);
    expect(result!.nextActions.size).toBe(1);
    expect(result!.proofAssets.size).toBe(1);
  });

  it("prismaLoadTierAIntelligence returns null on error", async () => {
    modelMocks.salesSignal.findMany.mockRejectedValue(new Error("fail"));
    const result = await prismaLoadTierAIntelligence(ORG_A);
    expect(result).toBeNull();
  });

  it("creates signal", async () => {
    await prismaCreateSignal({ id: "sig-new", organizationId: ORG_A });
    expect(modelMocks.salesSignal.create).toHaveBeenCalledWith(
      { data: { id: "sig-new", organizationId: ORG_A } },
    );
  });

  it("updates signal with org scoping", async () => {
    await prismaUpdateSignal(ORG_A, "sig-1", { description: "Updated" });
    expect(modelMocks.salesSignal.updateMany).toHaveBeenCalledWith({
      where: { id: "sig-1", organizationId: ORG_A },
      data: { description: "Updated" },
    });
  });

  it("deletes signal with org scoping", async () => {
    await prismaDeleteSignal(ORG_A, "sig-1");
    expect(modelMocks.salesSignal.deleteMany).toHaveBeenCalledWith({
      where: { id: "sig-1", organizationId: ORG_A },
    });
  });

  it("creates objection", async () => {
    await prismaCreateObjection({ id: "obj-new", organizationId: ORG_A });
    expect(modelMocks.salesObjection.create).toHaveBeenCalledWith(
      { data: { id: "obj-new", organizationId: ORG_A } },
    );
  });

  it("creates competitor mention", async () => {
    await prismaCreateCompetitorMention({ id: "comp-new", organizationId: ORG_A });
    expect(modelMocks.salesCompetitorMention.create).toHaveBeenCalledWith(
      { data: { id: "comp-new", organizationId: ORG_A } },
    );
  });

  it("creates win/loss insight", async () => {
    await prismaCreateWinLossInsight({ id: "wl-new", organizationId: ORG_A });
    expect(modelMocks.salesWinLossInsight.create).toHaveBeenCalledWith(
      { data: { id: "wl-new", organizationId: ORG_A } },
    );
  });

  it("creates ICP insight", async () => {
    await prismaCreateICPInsight({ id: "icp-new", organizationId: ORG_A });
    expect(modelMocks.salesICPInsight.create).toHaveBeenCalledWith(
      { data: { id: "icp-new", organizationId: ORG_A } },
    );
  });

  it("creates next action", async () => {
    await prismaCreateNextAction({ id: "na-new", organizationId: ORG_A });
    expect(modelMocks.salesNextAction.create).toHaveBeenCalledWith(
      { data: { id: "na-new", organizationId: ORG_A } },
    );
  });

  it("creates proof asset", async () => {
    await prismaCreateProofAsset({ id: "pa-new", organizationId: ORG_A });
    expect(modelMocks.salesProofAsset.create).toHaveBeenCalledWith(
      { data: { id: "pa-new", organizationId: ORG_A } },
    );
  });

  it("deletes proof asset with org scoping", async () => {
    await prismaDeleteProofAsset(ORG_A, "pa-1");
    expect(modelMocks.salesProofAsset.deleteMany).toHaveBeenCalledWith({
      where: { id: "pa-1", organizationId: ORG_A },
    });
  });
});

describe("prisma-repository \u2014 Organization scoping edge cases", () => {
  it("snapshot count check uses correct org", async () => {
    modelMocks.salesAccount.count.mockResolvedValue(0);
    await prismaLoadOrgSnapshot(ORG_B);
    expect(modelMocks.salesAccount.count).toHaveBeenCalledWith(
      { where: { organizationId: ORG_B } },
    );
  });

  it("org A data is isolated from org B snapshot", async () => {
    modelMocks.salesAccount.count.mockResolvedValue(1);
    modelMocks.salesAccount.findMany.mockResolvedValue([
      { id: "acct-a1", organizationId: ORG_A, name: "OrgA Account", nameAr: null, industry: null, status: "active", ownerId: OWNER_ID, createdById: OWNER_ID, createdAt: NOW, updatedAt: NOW },
    ]);
    modelMocks.salesContact.findMany.mockResolvedValue([]);
    modelMocks.salesDeal.findMany.mockResolvedValue([]);
    modelMocks.salesInteraction.findMany.mockResolvedValue([]);
    modelMocks.salesEvidenceLink.findMany.mockResolvedValue([]);

    const result = await prismaLoadOrgSnapshot(ORG_A);

    expect(result).not.toBeNull();
    expect(result!.accounts[0].organizationId).toBe(ORG_A);
    expect(modelMocks.salesAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: ORG_A } }),
    );
  });

  it("tier functions fail-soft when model does not exist in schema", async () => {
    const saved = modelMocks.salesKnowledgeGraphNode;
    delete modelMocks.salesKnowledgeGraphNode;

    expect(isTierB3PrismaReady()).toBe(false);
    const result = await prismaLoadTierB3Intelligence(ORG_A);
    expect(result).toBeNull();

    modelMocks.salesKnowledgeGraphNode = saved;
  });

  it("create functions handle DB errors gracefully (fail-soft)", async () => {
    modelMocks.salesSignal.create.mockRejectedValue(new Error("DB error"));

    await expect(
      prismaCreateSignal({ id: "sig-fail", organizationId: ORG_A }),
    ).resolves.toBeUndefined();
  });

  it("update functions handle DB errors gracefully (fail-soft)", async () => {
    modelMocks.salesMarketSignal.updateMany.mockRejectedValue(new Error("DB error"));

    await expect(
      prismaUpdateMarketSignal(ORG_A, "ms-1", { description: "x" }),
    ).resolves.toBeUndefined();
  });

  it("delete functions handle DB errors gracefully (fail-soft)", async () => {
    modelMocks.salesMarketSignal.deleteMany.mockRejectedValue(new Error("DB error"));

    await expect(
      prismaDeleteMarketSignal(ORG_A, "ms-1"),
    ).resolves.toBeUndefined();
  });
});

