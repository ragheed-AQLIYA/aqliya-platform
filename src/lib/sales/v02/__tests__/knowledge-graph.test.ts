import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  buildKnowledgeGraphFromSnapshot,
  buildKnowledgeGraphFromStore,
} from "../knowledge-graph/builder";
import type { KnowledgeGraphStoreSnapshot } from "../knowledge-graph/store-reader";
import type {
  KnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
} from "../knowledge-graph/types";

/* ───────────────────────────────────────────────
 * Mock data factories
 * ─────────────────────────────────────────────── */

const ORG = "org-test-kg-001";

function emptySnapshot(
  overrides?: Partial<KnowledgeGraphStoreSnapshot>,
): KnowledgeGraphStoreSnapshot {
  return {
    organizationId: ORG,
    accounts: [],
    opportunities: [],
    proofAssets: [],
    signals: [],
    activities: [],
    interactions: [],
    objections: [],
    winLossInsights: [],
    icpInsights: [],
    competitorMentions: [],
    ...overrides,
  };
}

function makeAccount(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    organizationId: ORG,
    name: `Account ${id}`,
    nameAr: undefined,
    status: "active" as const,
    industry: undefined,
    ownerId: "user-1",
    createdById: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    source: "manual",
    icpFitScore: undefined,
    ...overrides,
  };
}

function makeOpportunity(
  id: string,
  accountId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: ORG,
    accountId,
    name: `Opp ${id}`,
    stage: "Discovery" as const,
    valueEstimate: undefined,
    ownerId: "user-1",
    createdById: "user-1",
    ...overrides,
  };
}

function makeProof(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    organizationId: ORG,
    title: `Proof ${id}`,
    assetType: "case_study" as const,
    status: "active" as const,
    source: "manual" as const,
    createdById: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    opportunityId: undefined,
    linkedOpportunityIds: [],
    accountId: undefined,
    linkedAccountIds: [],
    evidenceRef: undefined,
    ...overrides,
  };
}

function makeSignal(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    organizationId: ORG,
    signalType: "buying" as const,
    description: `Signal ${id}`,
    strength: "moderate" as const,
    status: "active" as const,
    source: "manual" as const,
    createdById: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    accountId: undefined,
    opportunityId: undefined,
    evidenceRef: undefined,
    ...overrides,
  };
}

function makeActivity(
  id: string,
  accountId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: ORG,
    accountId,
    opportunityId: undefined,
    type: "meeting" as const,
    summary: `Activity ${id}`,
    loggedAt: "2026-01-01T00:00:00.000Z",
    loggedById: "user-1",
    createdById: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    status: "active" as const,
    source: "manual" as const,
    ...overrides,
  };
}

function makeInteraction(
  id: string,
  accountId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: ORG,
    accountId,
    opportunityId: undefined,
    type: "meeting" as const,
    summary: `Interaction ${id}`,
    loggedById: "user-1",
    loggedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeObjection(
  id: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: ORG,
    category: "budget" as const,
    description: `Objection ${id}`,
    status: "active" as const,
    source: "manual" as const,
    createdById: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    accountId: undefined,
    opportunityId: undefined,
    resolved: false,
    evidenceRef: undefined,
    ...overrides,
  };
}

function makeWinLoss(
  id: string,
  opportunityId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: ORG,
    accountId: "acct-1",
    opportunityId,
    outcome: "won" as const,
    primaryReason: `Win/loss reason ${id}`,
    status: "active" as const,
    source: "manual" as const,
    createdById: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    competitorInvolved: undefined,
    evidenceRef: undefined,
    ...overrides,
  };
}

function makeICPInsight(
  id: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: ORG,
    dimension: "industry" as const,
    hypothesis: `ICP hypothesis ${id}`,
    evidenceSummary: `Evidence ${id}`,
    status: "active" as const,
    source: "manual" as const,
    createdById: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    accountId: undefined,
    evidenceRef: undefined,
    ...overrides,
  };
}

function makeCompetitorMention(
  id: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    organizationId: ORG,
    competitorName: `Competitor ${id}`,
    context: `Mentioned in context ${id}`,
    status: "active" as const,
    source: "manual" as const,
    createdById: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    accountId: undefined,
    opportunityId: undefined,
    threatLevel: "medium" as const,
    evidenceRef: undefined,
    ...overrides,
  };
}

/* ───────────────────────────────────────────────
 * Helper for finding nodes/edges
 * ─────────────────────────────────────────────── */

function nodeById(
  graph: KnowledgeGraph,
  id: string,
): KnowledgeGraphNode | undefined {
  return graph.nodes.find((n) => n.id === id);
}

function edgesFrom(
  graph: KnowledgeGraph,
  nodeId: string,
): KnowledgeGraphEdge[] {
  return graph.edges.filter((e) => e.from === nodeId);
}

function edgesTo(
  graph: KnowledgeGraph,
  nodeId: string,
): KnowledgeGraphEdge[] {
  return graph.edges.filter((e) => e.to === nodeId);
}

/* ───────────────────────────────────────────────
 * Tests
 * ─────────────────────────────────────────────── */

describe("Sales Knowledge Graph v0.2", () => {
  describe("buildKnowledgeGraphFromSnapshot", () => {
    it("returns a valid structure for an empty snapshot", () => {
      const graph = buildKnowledgeGraphFromSnapshot(emptySnapshot());

      expect(graph.organizationId).toBe(ORG);
      expect(typeof graph.builtAt).toBe("string");
      expect(graph.nodes).toEqual([]);
      expect(graph.edges).toEqual([]);
      expect(graph.stats.nodeCounts).toEqual({
        account: 0,
        industry: 0,
        proof: 0,
        signal: 0,
        opp: 0,
        content: 0,
        finding: 0,
      });
      expect(graph.stats.edgeCounts).toEqual({
        uses: 0,
        mentions: 0,
        wins_with: 0,
        loses_with: 0,
        related_to: 0,
      });
      expect(graph.indexes.nodesById.size).toBe(0);
            // nodesByType only contains types that have nodes; empty snapshot = 0 entries
      expect(graph.indexes.nodesByType.size).toBe(0);
    });

    it("creates account nodes with correct metadata", () => {
      const snapshot = emptySnapshot({
        accounts: [
          makeAccount("acct-1", { industry: "Technology", icpFitScore: 85 }),
          makeAccount("acct-2", { industry: "Healthcare", icpFitScore: 60 }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      const acct1 = nodeById(graph, "account:acct-1");
      expect(acct1).toBeDefined();
      expect(acct1!.label).toBe("Account acct-1");
      expect(acct1!.type).toBe("account");
      expect(acct1!.sourceId).toBe("acct-1");
      expect(acct1!.meta).toEqual({
        status: "active" as const,
        industry: "Technology",
        icpFitScore: 85,
      });

      const acct2 = nodeById(graph, "account:acct-2");
      expect(acct2).toBeDefined();
      expect(acct2!.meta).toMatchObject({
        industry: "Healthcare",
        icpFitScore: 60,
      });
    });

    it("creates industry nodes and links accounts to them", () => {
      const snapshot = emptySnapshot({
        accounts: [
          makeAccount("acct-1", { industry: "Technology" }),
          makeAccount("acct-2", { industry: "Technology" }),
          makeAccount("acct-3", { industry: "" }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      const indNode = nodeById(graph, "industry:technology");
      expect(indNode).toBeDefined();
      expect(indNode!.label).toBe("Technology");
      expect(indNode!.type).toBe("industry");

      expect(
        edgesFrom(graph, "account:acct-1").some(
          (e) => e.type === "related_to" && e.to === "industry:technology",
        ),
      ).toBe(true);
      expect(
        edgesFrom(graph, "account:acct-2").some(
          (e) => e.type === "related_to" && e.to === "industry:technology",
        ),
      ).toBe(true);
      expect(edgesFrom(graph, "account:acct-3")).toHaveLength(0);

      expect(graph.stats.nodeCounts.account).toBe(3);
      expect(graph.stats.nodeCounts.industry).toBe(1);
    });

    it("creates opportunity nodes and links to accounts", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        opportunities: [
          makeOpportunity("opp-1", "acct-1", {
            stage: "Negotiation",
            valueEstimate: 250_000,
          }),
          makeOpportunity("opp-2", "acct-1", { stage: "Closed Won" }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      const opp1 = nodeById(graph, "opp:opp-1");
      expect(opp1).toBeDefined();
      expect(opp1!.label).toBe("Opp opp-1");
      expect(opp1!.type).toBe("opp");
      expect(opp1!.meta).toMatchObject({
        stage: "Negotiation",
        accountId: "acct-1",
        valueEstimate: 250_000,
      });

      expect(
        edgesFrom(graph, "opp:opp-1").some((e) => e.to === "account:acct-1"),
      ).toBe(true);
      expect(
        edgesFrom(graph, "opp:opp-2").some((e) => e.to === "account:acct-1"),
      ).toBe(true);

      expect(graph.stats.nodeCounts.opp).toBe(2);
    });

    it("does not link opportunities to unknown accounts", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        opportunities: [
          makeOpportunity("opp-1", "acct-1"),
          makeOpportunity("opp-2", "acct-missing"),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      expect(edgesFrom(graph, "opp:opp-1").length).toBeGreaterThan(0);
      expect(edgesFrom(graph, "opp:opp-2")).toHaveLength(0);
    });

    it("creates proof nodes linked to opportunities and accounts", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        opportunities: [makeOpportunity("opp-1", "acct-1")],
        proofAssets: [
          makeProof("proof-1", {
            opportunityId: "opp-1",
            linkedAccountIds: ["acct-1"],
          }),
          makeProof("proof-orphan", {}),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      const proof1 = nodeById(graph, "proof:proof-1");
      expect(proof1).toBeDefined();
      expect(proof1!.type).toBe("proof");
      expect(proof1!.label).toBe("Proof proof-1");

      expect(
        edgesFrom(graph, "opp:opp-1").some(
          (e) => e.type === "uses" && e.to === "proof:proof-1",
        ),
      ).toBe(true);
      expect(
        edgesFrom(graph, "proof:proof-1").some(
          (e) => e.type === "related_to" && e.to === "opp:opp-1",
        ),
      ).toBe(true);
      expect(
        edgesFrom(graph, "account:acct-1").some(
          (e) => e.type === "uses" && e.to === "proof:proof-1",
        ),
      ).toBe(true);
      expect(
        edgesFrom(graph, "proof:proof-1").some(
          (e) => e.type === "related_to" && e.to === "account:acct-1",
        ),
      ).toBe(true);

      expect(edgesFrom(graph, "proof:proof-orphan")).toHaveLength(0);
      expect(edgesTo(graph, "proof:proof-orphan")).toHaveLength(0);
    });

    it("creates signal nodes linked to accounts, opportunities, and content", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        opportunities: [makeOpportunity("opp-1", "acct-1")],
        interactions: [makeInteraction("int-1", "acct-1")],
        signals: [
          makeSignal("sig-1", {
            accountId: "acct-1",
            opportunityId: "opp-1",
            signalType: "budget",
            strength: "strong",
            evidenceRef: "int-1",
          }),
          makeSignal("sig-orphan", {}),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      const sig1 = nodeById(graph, "signal:sig-1");
      expect(sig1).toBeDefined();
      expect(sig1!.type).toBe("signal");
      expect(sig1!.meta).toMatchObject({
        signalType: "budget",
        strength: "strong",
        accountId: "acct-1",
        opportunityId: "opp-1",
      });

      expect(
        edgesFrom(graph, "signal:sig-1").some((e) => e.to === "account:acct-1"),
      ).toBe(true);
      expect(
        edgesFrom(graph, "signal:sig-1").some((e) => e.to === "opp:opp-1"),
      ).toBe(true);
      expect(
        edgesFrom(graph, "signal:sig-1").some(
          (e) => e.type === "mentions" && e.to === "content:int-1",
        ),
      ).toBe(true);

      expect(edgesFrom(graph, "signal:sig-orphan")).toHaveLength(0);
    });

    it("creates content nodes from interactions and activities", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        interactions: [
          makeInteraction("int-1", "acct-1", { type: "email" }),
          makeInteraction("int-2", "acct-1", { type: "call" }),
        ],
        activities: [
          makeActivity("int-1", "acct-1"),
          makeActivity("act-1", "acct-1", { type: "task" }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      const int1 = nodeById(graph, "content:int-1");
      expect(int1).toBeDefined();
      expect(int1!.meta).toMatchObject({
        contentKind: "interaction",
        interactionType: "email",
      });

      const act1 = nodeById(graph, "content:act-1");
      expect(act1).toBeDefined();
      expect(act1!.meta).toMatchObject({
        contentKind: "activity",
        activityType: "task",
      });

      expect(graph.stats.nodeCounts.content).toBe(3);
    });

    it("creates finding nodes from objections, competitor mentions, ICP, win/loss", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        opportunities: [makeOpportunity("opp-1", "acct-1")],
        objections: [
          makeObjection("obj-1", {
            opportunityId: "opp-1",
            accountId: "acct-1",
            category: "budget" as const,
            resolved: true,
          }),
        ],
        competitorMentions: [
          makeCompetitorMention("comp-1", {
            opportunityId: "opp-1",
            competitorName: "CompetitorX",
            threatLevel: "high",
          }),
        ],
        icpInsights: [
          makeICPInsight("icp-1", {
            accountId: "acct-1",
            dimension: "company_size",
          }),
        ],
        winLossInsights: [
          makeWinLoss("wl-1", "opp-1", { outcome: "won" }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      // Objection
      const objNode = nodeById(graph, "finding:obj-1");
      expect(objNode).toBeDefined();
      expect(objNode!.type).toBe("finding");
      expect(objNode!.meta).toMatchObject({
        findingKind: "objection",
        category: "budget" as const,
        resolved: true,
      });
      expect(
        edgesFrom(graph, "finding:obj-1").some((e) => e.to === "opp:opp-1"),
      ).toBe(true);
      expect(
        edgesFrom(graph, "finding:obj-1").some(
          (e) => e.to === "account:acct-1",
        ),
      ).toBe(true);

      // Competitor
      const compNode = nodeById(graph, "finding:comp-1");
      expect(compNode).toBeDefined();
      expect(compNode!.meta).toMatchObject({
        findingKind: "competitor",
        threatLevel: "high",
      });

      // ICP
      const icpNode = nodeById(graph, "finding:icp-1");
      expect(icpNode).toBeDefined();
      expect(icpNode!.meta).toMatchObject({
        findingKind: "icp",
        dimension: "company_size",
      });

      // Win/loss
      const wlNode = nodeById(graph, "finding:wl-1");
      expect(wlNode).toBeDefined();
      expect(wlNode!.meta).toMatchObject({ findingKind: "win_loss" });

      expect(graph.stats.nodeCounts.finding).toBe(4);
    });

    it("handles win/loss with wins_with and loses_with edges", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        opportunities: [
          makeOpportunity("opp-won", "acct-1", { stage: "Closed Won" }),
          makeOpportunity("opp-lost", "acct-1", { stage: "Closed Lost" }),
        ],
        proofAssets: [
          makeProof("proof-w", { opportunityId: "opp-won" }),
          makeProof("proof-l", { opportunityId: "opp-lost" }),
        ],
        winLossInsights: [
          makeWinLoss("wl-won", "opp-won", { outcome: "won" }),
          makeWinLoss("wl-lost", "opp-lost", { outcome: "lost" }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      // Won opp wins with proof and finding
      expect(
        edgesFrom(graph, "opp:opp-won").some(
          (e) => e.type === "wins_with" && e.to === "proof:proof-w",
        ),
      ).toBe(true);
      expect(
        edgesFrom(graph, "opp:opp-won").some(
          (e) => e.type === "wins_with" && e.to === "finding:wl-won",
        ),
      ).toBe(true);

      // Lost opp loses with proof and finding
      expect(
        edgesFrom(graph, "opp:opp-lost").some(
          (e) => e.type === "loses_with" && e.to === "proof:proof-l",
        ),
      ).toBe(true);
      expect(
        edgesFrom(graph, "opp:opp-lost").some(
          (e) => e.type === "loses_with" && e.to === "finding:wl-lost",
        ),
      ).toBe(true);

      // Finding wins_with proof for won
      expect(
        edgesFrom(graph, "finding:wl-won").some(
          (e) => e.type === "wins_with" && e.to === "proof:proof-w",
        ),
      ).toBe(true);
    });

    it("builds correct indexes for traversal", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1", { industry: "Tech" })],
        opportunities: [makeOpportunity("opp-1", "acct-1")],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      expect(graph.indexes.nodesById.has("account:acct-1")).toBe(true);
      expect(graph.indexes.nodesById.has("opp:opp-1")).toBe(true);
      expect(graph.indexes.nodesById.has("industry:tech")).toBe(true);

      expect(graph.indexes.nodesByType.get("account")?.length).toBe(1);
      expect(graph.indexes.nodesByType.get("industry")?.length).toBe(1);
      expect(graph.indexes.nodesByType.get("opp")?.length).toBe(1);

      expect(
        graph.indexes.edgesByFrom.get("opp:opp-1")?.length,
      ).toBeGreaterThan(0);
      expect(
        graph.indexes.edgesByTo.get("account:acct-1")?.length,
      ).toBeGreaterThan(0);
    });

    it("produces correct stats", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1"), makeAccount("acct-2")],
        opportunities: [makeOpportunity("opp-1", "acct-1")],
        proofAssets: [makeProof("p-1", { opportunityId: "opp-1" })],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      expect(graph.stats.nodeCounts).toEqual({
        account: 2,
        industry: 0,
        proof: 1,
        signal: 0,
        opp: 1,
        content: 0,
        finding: 0,
      });

      expect(graph.stats.edgeCounts.uses).toBe(1);
      expect(graph.stats.edgeCounts.related_to).toBe(2);
    });
  });

  describe("buildKnowledgeGraphFromStore", () => {
    it("delegates to buildKnowledgeGraphFromSnapshot with reader", () => {
      const fakeSnapshot = emptySnapshot({
        accounts: [makeAccount("acct-1", { industry: "Finance" })],
      });

      const reader: (orgId: string) => KnowledgeGraphStoreSnapshot = jest.fn().mockReturnValue(fakeSnapshot);
      const graph = buildKnowledgeGraphFromStore(ORG, reader);

      expect(reader).toHaveBeenCalledWith(ORG);
      expect(graph.organizationId).toBe(ORG);
      expect(nodeById(graph, "account:acct-1")).toBeDefined();
      expect(nodeById(graph, "industry:finance")).toBeDefined();
    });
  });

  describe("edge cases and resilience", () => {
    it("handles snapshot with nullish fields gracefully", () => {
      const snapshot = emptySnapshot({
        accounts: [
          {
            ...makeAccount("acct-1"),
            industry: undefined,
            icpFitScore: undefined,
          },
        ],
        opportunities: [
          {
            ...makeOpportunity("opp-1", "acct-1"),
            stage: undefined,
            valueEstimate: undefined,
          } as any,
        ],
        signals: [
          {
            ...makeSignal("sig-1"),
            accountId: undefined,
            opportunityId: undefined,
            evidenceRef: undefined,
          } as any,
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      expect(nodeById(graph, "account:acct-1")).toBeDefined();
      expect(graph.stats.nodeCounts.industry).toBe(0);
      expect(nodeById(graph, "opp:opp-1")).toBeDefined();
      expect(nodeById(graph, "signal:sig-1")).toBeDefined();
      expect(edgesFrom(graph, "signal:sig-1")).toHaveLength(0);
    });

    it("deduplicates nodes with the same id", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("same-id")],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);
      expect(graph.stats.nodeCounts.account).toBe(1);
    });

    it("normalizes industry name (case and whitespace)", () => {
      const snapshot = emptySnapshot({
        accounts: [
          makeAccount("acct-1", { industry: "  Technology  " }),
          makeAccount("acct-2", { industry: "technology" }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      const indNode = nodeById(graph, "industry:technology");
      expect(indNode).toBeDefined();
      expect(graph.stats.nodeCounts.industry).toBe(1);
    });

    it("only links evidenceRef when content exists", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        opportunities: [makeOpportunity("opp-1", "acct-1")],
        signals: [
          makeSignal("sig-1", {
            accountId: "acct-1",
            evidenceRef: "int-missing",
          }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      const signalEdges = edgesFrom(graph, "signal:sig-1");
      expect(signalEdges.some((e) => e.type === "mentions")).toBe(false);
      expect(signalEdges).toHaveLength(1);
    });

    it("deduplicates content when interaction and activity share id", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        interactions: [
          makeInteraction("content-1", "acct-1", {
            type: "email",
            summary: "Email content",
          }),
        ],
        activities: [
          makeActivity("content-1", "acct-1", {
            type: "call",
            summary: "Call summary",
          }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      expect(graph.stats.nodeCounts.content).toBe(1);
      expect(
        nodeById(graph, "content:content-1")!.meta,
      ).toMatchObject({ contentKind: "interaction" });
    });

    it("handles win/loss with linked proofs", () => {
      const snapshot = emptySnapshot({
        accounts: [makeAccount("acct-1")],
        opportunities: [makeOpportunity("opp-1", "acct-1")],
        proofAssets: [
          makeProof("proof-a", { opportunityId: "opp-1" }),
          makeProof("proof-b", { linkedOpportunityIds: ["opp-1"] }),
        ],
        winLossInsights: [
          makeWinLoss("wl-won", "opp-1", { outcome: "won" }),
        ],
      });

      const graph = buildKnowledgeGraphFromSnapshot(snapshot);

      const oppEdges = edgesFrom(graph, "opp:opp-1").filter(
        (e) => e.type === "wins_with",
      );
      expect(oppEdges.map((e) => e.to)).toEqual(
        expect.arrayContaining(["proof:proof-a", "proof:proof-b"]),
      );

      const findingEdges = edgesFrom(graph, "finding:wl-won").filter(
        (e) => e.type === "wins_with",
      );
      expect(findingEdges).toHaveLength(2);
    });
  });
});