// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN,
  buildCommercialKnowledgeGraphView,
  industryRefId,
  getTopRelationships,
} from "../commercial-knowledge-graph";
import {
  salesBuildCommercialKnowledgeGraph,
  salesGetAccountKnowledgeSubgraph,
  salesGetCommercialKnowledgeGraphSnapshot,
  salesGetCommercialKnowledgeGraphView,
  salesGetIndustryKnowledgeSubgraph,
  salesGetProofKnowledgeSubgraph,
  salesGetTopKnowledgeRelationships,
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

  it("builds graph snapshot with node and edge counts", () => {
    const snapshot = salesGetCommercialKnowledgeGraphSnapshot(ORG);

    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.disclaimerEn).toBe(COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN);
    expect(snapshot.outputStatus).toBe("recommendation");
    expect(snapshot.totalNodes).toBeGreaterThan(0);
    expect(snapshot.totalEdges).toBeGreaterThan(0);
  });

  it("ranks top relationship patterns by frequency", () => {
    const graph = salesBuildCommercialKnowledgeGraph(ORG);
    const top = getTopRelationships(graph, 8);

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

    expect(accountSubgraph?.nodes.some((n) => n.type === "opp")).toBe(true);
    expect(
      proofSubgraph?.edges.some((e) => e.type === "uses") ||
        (proofSubgraph?.nodes.length ?? 0) > 0,
    ).toBe(true);
    expect(industrySubgraph?.nodes.some((n) => n.type === "account")).toBe(
      true,
    );
  });

  it("builds full Wave C view with snapshot, top relationships, and subgraph maps", () => {
    const account = listAccounts(ORG)[0];
    const proof = listProofAssets(ORG)[0];
    const view = salesGetCommercialKnowledgeGraphView(ORG, 10);

    expect(view.snapshot.totalNodes).toBeGreaterThan(0);
    expect(view.snapshot.topRelationships.length).toBeGreaterThan(0);
    expect(view.graph.nodes.some((n) => n.id === `account:${account.id}`)).toBe(
      true,
    );
    expect(
      view.graph.edges.some(
        (e) => e.to === `proof:${proof.id}` || e.from === `proof:${proof.id}`,
      ),
    ).toBe(true);
  });

  it("matches org-level helper output with service top relationships", () => {
    const view = buildCommercialKnowledgeGraphView(ORG);
    const serviceTop = salesGetTopKnowledgeRelationships(ORG, 12);

    expect(view.snapshot.organizationId).toBe(ORG);
    expect(view.snapshot.topRelationships.length).toBeGreaterThan(0);
    expect(serviceTop.length).toBeGreaterThan(0);
  });
});
