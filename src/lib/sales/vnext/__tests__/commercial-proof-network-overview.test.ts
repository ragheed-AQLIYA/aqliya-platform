// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import { buildCommercialProofNetworkOverview } from "../commercial-proof-network-overview";
import { salesBuildCommercialProofNetworkOverview } from "../../services/commercial-proof-network-service";
import { ensureSalesSeed, resetSalesStoreForTests } from "../../store";

const ORG = "org-w3-proof-network";
const OWNER = "user-seed-001";

describe("commercial-proof-network-overview", () => {
  it("builds nodes and edges from store linkages", () => {
    const overview = buildCommercialProofNetworkOverview({
      organizationId: ORG,
      proofAssets: [
        {
          id: "p1",
          organizationId: ORG,
          assetType: "case_study",
          title: "Case A",
          status: "active",
          source: "manual",
          createdById: OWNER,
          createdAt: "2026-05-30T12:00:00.000Z",
          updatedAt: "2026-05-30T12:00:00.000Z",
          linkedOpportunityIds: ["o1"],
        },
      ],
      opportunities: [
        {
          id: "o1",
          organizationId: ORG,
          accountId: "a1",
          name: "Opp One",
          stage: "Proposal",
          value: 100000,
          currency: "SAR",
          status: "active",
          source: "manual",
          createdById: OWNER,
          createdAt: "2026-05-30T12:00:00.000Z",
          updatedAt: "2026-05-30T12:00:00.000Z",
        },
      ],
      objections: [
        {
          id: "obj1",
          organizationId: ORG,
          accountId: "a1",
          opportunityId: "o1",
          category: "Price",
          description: "Too expensive",
          status: "active",
          source: "manual",
          createdById: OWNER,
          createdAt: "2026-05-30T12:00:00.000Z",
          updatedAt: "2026-05-30T12:00:00.000Z",
        },
      ],
    });

    expect(overview.nodes).toHaveLength(3);
    expect(overview.edges.length).toBeGreaterThanOrEqual(1);
    expect(overview.disclaimerAr).toMatch(/مسودة|مسودات|draft/i);
  });
});

describe("salesBuildCommercialProofNetworkOverview", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("loads org overview from seed store", () => {
    const overview = salesBuildCommercialProofNetworkOverview(ORG);
    expect(overview.organizationId).toBe(ORG);
    expect(overview.summary.assetCount).toBeGreaterThan(0);
    expect(overview.nodes.length).toBeGreaterThan(0);
  });

  it("filters to focused opportunity", () => {
    const full = salesBuildCommercialProofNetworkOverview(ORG);
    const focused = salesBuildCommercialProofNetworkOverview(ORG, {
      focusOpportunityId: "sales-opp-001",
    });
    expect(focused.focusOpportunityId).toBe("sales-opp-001");
    expect(focused.summary.opportunityCount).toBeLessThanOrEqual(
      full.summary.opportunityCount,
    );
  });
});
