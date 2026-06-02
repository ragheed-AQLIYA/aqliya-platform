// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  CROSS_PRODUCT_PROOF_ADAPTERS,
  categorizeProofAsset,
  listCrossProductProofCandidates,
  preferredAssetTypesForObjection,
  searchProofAssets,
  scoreProofRelevance,
  buildProofNetworkSnapshot,
} from "../v02/proof-network";
import {
  salesBuildProofNetworkSnapshot,
  salesGetProofNetworkForAccount,
  salesGetProofNetworkForIndustry,
  salesGetProofNetworkForObjection,
  salesGetProofNetworkForOpportunity,
  salesSearchProofAssets,
} from "../services/proof-network-service";
import { ensureSalesSeed, resetSalesStoreForTests } from "../store";
import type { SalesProofAsset } from "../types";

const ORG = "org-salesos-v01";
const OWNER = "user-seed-001";

const BASE_ASSET: SalesProofAsset = {
  id: "proof-1",
  organizationId: ORG,
  createdById: OWNER,
  createdAt: "2026-05-01T10:00:00.000Z",
  updatedAt: "2026-05-01T10:00:00.000Z",
  status: "active",
  source: "manual",
  assetType: "case_study",
  title: "Financial sector pilot summary",
  linkedAccountIds: ["sales-acct-001"],
  linkedOpportunityIds: ["sales-opp-001"],
};

describe("proof-network v0.2", () => {
  describe("categorization and relevance", () => {
    it("categorizes security-related proof as security_compliance", () => {
      const asset: SalesProofAsset = {
        ...BASE_ASSET,
        assetType: "objection_response",
        title: "Data residency FAQ pack",
        description: "Security and governance responses",
      };
      expect(categorizeProofAsset(asset)).toBe("security_compliance");
    });

    it("scores higher when linked to opportunity and stage requirements", () => {
      const linked = scoreProofRelevance(BASE_ASSET, {
        organizationId: ORG,
        opportunityId: "sales-opp-001",
        stage: "Proposal",
      });
      const unlinked = scoreProofRelevance(
        { ...BASE_ASSET, linkedOpportunityIds: [], linkedAccountIds: [] },
        { organizationId: ORG, opportunityId: "sales-opp-999" },
      );
      expect(linked).toBeGreaterThan(unlinked);
    });

    it("maps objection categories to preferred asset types", () => {
      expect(preferredAssetTypesForObjection("budget")).toContain("case_study");
      expect(preferredAssetTypesForObjection("security")).toContain(
        "objection_response",
      );
    });
  });

  describe("search", () => {
    it("finds assets by title text", () => {
      const hits = searchProofAssets(
        [
          BASE_ASSET,
          {
            ...BASE_ASSET,
            id: "proof-2",
            title: "Unrelated widget demo",
            assetType: "demo_recording",
          },
        ],
        { organizationId: ORG, text: "financial", limit: 5 },
      );
      expect(hits.length).toBe(1);
      expect(hits[0]?.asset.id).toBe("proof-1");
      expect(hits[0]?.matchReasons).toContain("title_match");
    });
  });

  describe("cross-product adapters (stub)", () => {
    it("documents stub adapters and returns no live candidates", async () => {
      expect(CROSS_PRODUCT_PROOF_ADAPTERS).toHaveLength(2);
      const candidates = await listCrossProductProofCandidates(ORG);
      expect(candidates).toEqual([]);
    });
  });

  describe("network outputs per scope", () => {
    const input = {
      organizationId: ORG,
      proofAssets: [BASE_ASSET],
      accountIds: ["sales-acct-001"],
      accountIndustryById: { "sales-acct-001": "Technology" },
      opportunityIds: ["sales-opp-001"],
      opportunityStageById: { "sales-opp-001": "Qualification" },
      opportunityAccountById: { "sales-opp-001": "sales-acct-001" },
      objections: [
        {
          id: "obj-1",
          category: "budget",
          accountId: "sales-acct-001",
          opportunityId: "sales-opp-001",
        },
      ],
      industries: ["Technology"],
    };

    it("builds slices for account, opportunity, objection, and industry", () => {
      const snapshot = buildProofNetworkSnapshot(input);
      expect(snapshot.byAccount).toHaveLength(1);
      expect(snapshot.byOpportunity).toHaveLength(1);
      expect(snapshot.byObjection).toHaveLength(1);
      expect(snapshot.byIndustry).toHaveLength(1);
      expect(snapshot.byAccount[0]?.linkedCount).toBeGreaterThan(0);
      expect(snapshot.byObjection[0]?.recommendations.length).toBeGreaterThan(
        0,
      );
      expect(
        snapshot.byObjection[0]?.recommendations.every((r) => r.recommendationOnly),
      ).toBe(true);
    });
  });

  describe("proof-network service (seed-backed)", () => {
    beforeEach(async () => {
      resetSalesStoreForTests();
      await ensureSalesSeed(ORG, OWNER);
    });

    it("builds org snapshot from seed proof assets", () => {
      const snapshot = salesBuildProofNetworkSnapshot(ORG);
      expect(snapshot.organizationId).toBe(ORG);
      expect(snapshot.totalAssets).toBeGreaterThan(0);
      expect(snapshot.byAccount.length).toBeGreaterThan(0);
      expect(snapshot.byOpportunity.length).toBeGreaterThan(0);
      expect(snapshot.byObjection.length).toBeGreaterThan(0);
      expect(snapshot.byIndustry.length).toBeGreaterThan(0);
    });

    it("returns account slice for seeded account", () => {
      const slice = salesGetProofNetworkForAccount(ORG, "sales-acct-001");
      expect(slice?.scope).toBe("account");
      expect(slice?.scopeId).toBe("sales-acct-001");
    });

    it("returns opportunity slice with stage linkage", () => {
      const slice = salesGetProofNetworkForOpportunity(ORG, "sales-opp-005");
      expect(slice?.scope).toBe("opportunity");
      expect(slice?.label).toContain("Pilot");
    });

    it("returns objection slice for security objection", () => {
      const slice = salesGetProofNetworkForObjection(ORG, "sales-obj-003");
      expect(slice?.scope).toBe("objection");
      expect(slice?.label).toContain("security");
      expect(slice?.recommendations.length).toBeGreaterThan(0);
    });

    it("returns industry slice for Financial Services", () => {
      const slice = salesGetProofNetworkForIndustry(ORG, "Financial Services");
      expect(slice?.scope).toBe("industry");
      expect(slice?.scopeId).toBe("Financial Services");
    });

    it("searches seed proof by keyword", () => {
      const hits = salesSearchProofAssets(ORG, { text: "pilot", limit: 5 });
      expect(hits.some((h) => h.asset.title.toLowerCase().includes("pilot"))).toBe(
        true,
      );
    });
  });
});
