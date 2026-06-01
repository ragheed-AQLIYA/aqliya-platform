import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN,
  KNOWLEDGE_GRAPH_EDGE_KINDS,
  buildCommercialKnowledgeGraphViewForOrg,
  industryRefId,
  rankTopCommercialRelationships,
} from "../commercial-knowledge-graph";
import {
  salesBuildCommercialKnowledgeGraph,
  salesGetAccountKnowledgeSubgraph,
  salesGetCommercialKnowledgeGraphSnapshot,
  salesGetCommercialKnowledgeGraphView,
  salesGetIndustryKnowledgeSubgraph,
  salesGetProofKnowledgeSubgraph,
  salesGetTopCommercialRelationships,
} from "../../services/commercial-knowledge-graph-service";
import {
  ensureSalesSeed,
  listAccounts,
  listProofAssets,
  resetSalesStoreForTests,
} from "../../store";

const ORG = "org-kg-wave-c";
const OWNER = "user-kg-wave-c";

describe("commercial-knowledge-graph vnext Wave C", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("includes all Wave C edge kinds including supports and blocks", () => {
    expect(KNOWLEDGE_GRAPH_EDGE_KINDS).toEqual(
      expect.arrayContaining([
        "uses",
        "mentions",
        "wins_with",
        "loses_with",
        "supports",
        "blocks",
        "related_to",
      ]),
    );
  });

  it("builds graph snapshot with node and edge counts", () => {
    const snapshot = salesGetCommercialKnowledgeGraphSnapshot(ORG);

    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.disclaimerEn).toBe(COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN);
    expect(snapshot.outputStatus).toBe("recommendation");
    expect(snapshot.totalNodes).toBeGreaterThan(20);
    expect(snapshot.totalEdges).toBeGreaterThan(20);
    expect(snapshot.nodeCounts.account).toBe(5);
    expect(snapshot.nodeCounts.opp).toBe(8);
    expect(snapshot.edgeCounts.supports).toBeGreaterThan(0);
    expect(snapshot.edgeCounts.blocks).toBeGreaterThan(0);
  });

  it("ranks top relationship patterns by frequency", () => {
    const graph = salesBuildCommercialKnowledgeGraph(ORG);
    const top = rankTopCommercialRelationships(graph, 8);

    expect(top.length).toBeGreaterThan(0);
    expect(top[0].count).toBeGreaterThanOrEqual(top[top.length - 1].count);
    for (const row of top) {
      expect(row.edgeKind).toBeTruthy();
      expect(row.sourceKind).toBeTruthy();
      expect(row.targetKind).toBeTruthy();
      expect(row.sampleEdgeIds.length).toBeGreaterThan(0);
    }
  });

  it("exposes account, proof, and industry subgraphs via service", () => {
    const account = listAccounts(ORG)[0];
    const proof = listProofAssets(ORG)[0];

    const accountSubgraph = salesGetAccountKnowledgeSubgraph(ORG, account.id);
    const proofSubgraph = salesGetProofKnowledgeSubgraph(ORG, proof.id);
    const industrySubgraph = salesGetIndustryKnowledgeSubgraph(
      ORG,
      industryRefId("Financial Services"),
    );

    expect(accountSubgraph?.nodes.some((n) => n.kind === "opp")).toBe(true);
    expect(proofSubgraph?.edges.some((e) => e.kind === "uses")).toBe(true);
    expect(industrySubgraph?.nodes.some((n) => n.kind === "account")).toBe(
      true,
    );
  });

  it("builds full Wave C view with snapshot, top relationships, and subgraph maps", () => {
    const account = listAccounts(ORG)[0];
    const proof = listProofAssets(ORG)[0];
    const view = salesGetCommercialKnowledgeGraphView(ORG, {
      accountRefIds: [account.id],
      proofRefIds: [proof.id],
      industryRefIds: [industryRefId("Financial Services")],
      maxTopRelationships: 10,
    });

    expect(view.snapshot.totalNodes).toBeGreaterThan(0);
    expect(view.topRelationships.length).toBeGreaterThan(0);
    expect(view.accountSubgraphs[account.id]).toBeDefined();
    expect(view.proofSubgraphs[proof.id]).toBeDefined();
    expect(
      view.industrySubgraphs[industryRefId("Financial Services")],
    ).toBeDefined();
  });

  it("matches org-level helper output with service top relationships", () => {
    const graph = buildCommercialKnowledgeGraphViewForOrg(ORG);
    const serviceTop = salesGetTopCommercialRelationships(ORG, 12);

    expect(graph.topRelationships).toEqual(serviceTop);
  });
});
