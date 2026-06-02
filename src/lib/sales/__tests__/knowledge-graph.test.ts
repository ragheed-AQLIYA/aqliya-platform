// @ts-nocheck
import { describe, expect, it, beforeEach } from "@jest/globals";
import {
  ensureSalesSeed,
  listAccounts,
  listProofAssets,
  resetSalesStoreForTests,
} from "../store";
import {
  buildOrgKnowledgeGraph,
  getAccountSubgraph,
  getIndustrySubgraph,
  getNeighbors,
  getNodesByKind,
  getOutgoingEdges,
  getProofUsageNetwork,
  industryRefId,
  listFindingsForOpportunity,
  summarizeGraph,
} from "../v02/knowledge-graph";

const ORG = "org-kg-test";
const OWNER = "user-kg-001";

describe("SalesOS v0.2 knowledge graph", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds typed nodes from the seeded store snapshot", () => {
    const graph = buildOrgKnowledgeGraph(ORG);
    const summary = summarizeGraph(graph);

    expect(graph.organizationId).toBe(ORG);
    expect(summary.nodeCounts.account).toBe(5);
    expect(summary.nodeCounts.opp).toBe(8);
    expect(summary.nodeCounts.proof).toBeGreaterThanOrEqual(5);
    expect(summary.nodeCounts.signal).toBeGreaterThanOrEqual(6);
    expect(summary.nodeCounts.content).toBeGreaterThanOrEqual(20);
    expect(summary.nodeCounts.finding).toBeGreaterThanOrEqual(10);
    expect(summary.nodeCounts.industry).toBeGreaterThanOrEqual(4);
  });

  it("links accounts to industries via related_to edges", () => {
    const graph = buildOrgKnowledgeGraph(ORG);
    const account = listAccounts(ORG)[0];
    const industryNeighbors = getNeighbors(graph, `account:${account.id}`, {
      nodeKind: "industry",
      edgeKind: "related_to",
    });

    expect(account.industry).toBeTruthy();
    expect(industryNeighbors.length).toBe(1);
    expect(industryNeighbors[0].label).toBe(account.industry);
  });

  it("connects proof assets to opportunities via uses edges", () => {
    const graph = buildOrgKnowledgeGraph(ORG);
    const proof = listProofAssets(ORG).find((p) => p.linkedOpportunityIds?.length);
    expect(proof).toBeTruthy();

    const usesEdges = getOutgoingEdges(graph, `proof:${proof!.id}`, "uses");
    expect(usesEdges.some((e) => e.targetId.startsWith("opp:"))).toBe(true);
  });

  it("materializes win/loss edges for closed opportunities", () => {
    const graph = buildOrgKnowledgeGraph(ORG);

    expect(graph.stats.edgeCounts.wins_with).toBeGreaterThan(0);
    expect(graph.stats.edgeCounts.loses_with).toBeGreaterThan(0);

    const findings = listFindingsForOpportunity(graph, "sales-opp-008");
    expect(findings.some((f) => f.meta?.findingType === "win_loss")).toBe(true);
  });

  it("returns account neighborhood subgraph with signals and findings", () => {
    const graph = buildOrgKnowledgeGraph(ORG);
    const subgraph = getAccountSubgraph(graph, "sales-acct-001");

    expect(subgraph).toBeDefined();
    expect(subgraph!.nodes.some((n) => n.kind === "opp")).toBe(true);
    expect(
      subgraph!.nodes.some((n) => n.kind === "signal" || n.kind === "finding"),
    ).toBe(true);
    expect(subgraph!.edges.length).toBeGreaterThan(0);
  });

  it("clusters industry-linked accounts and their commercial context", () => {
    const graph = buildOrgKnowledgeGraph(ORG);
    const cluster = getIndustrySubgraph(
      graph,
      industryRefId("Financial Services"),
    );

    expect(cluster).toBeDefined();
    expect(cluster!.nodes.some((n) => n.kind === "industry")).toBe(true);
    expect(cluster!.nodes.some((n) => n.kind === "account")).toBe(true);
    expect(cluster!.nodes.length).toBeGreaterThan(2);
  });

  it("exposes proof usage network for effectiveness queries", () => {
    const graph = buildOrgKnowledgeGraph(ORG);
    const proof = listProofAssets(ORG)[0];
    const network = getProofUsageNetwork(graph, proof.id);

    expect(network).toBeDefined();
    expect(network!.edges.some((edge) => edge.kind === "uses")).toBe(true);
  });
});
