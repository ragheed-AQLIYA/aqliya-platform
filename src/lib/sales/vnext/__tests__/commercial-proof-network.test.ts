// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  COMMERCIAL_PROOF_NETWORK_DISCLAIMER_EN,
  categorizeProofAsset,
  searchProofAssets,
} from "../commercial-proof-network";
import {
  salesGetCommercialProofNetworkForAccount,
  salesGetCommercialProofNetworkForIndustry,
  salesGetCommercialProofNetworkForOpportunity,
  salesSearchCommercialProofNetwork,
} from "../../services/commercial-proof-network-service";
import { ensureSalesSeed, resetSalesStoreForTests } from "../../store";
import {
  listAccounts,
  listOpportunities,
  listProofAssets,
} from "../../store";

const ORG = "org-salesos-v01";
const OWNER = "user-seed-001";

describe("commercial-proof-network vnext facade", () => {
  it("re-exports v02 disclaimers under commercial aliases", () => {
    expect(COMMERCIAL_PROOF_NETWORK_DISCLAIMER_EN).toMatch(/draft/i);
  });

  it("re-exports v02 categorization primitives", () => {
    const assets = listProofAssets(ORG);
    if (assets.length === 0) return;
    expect(categorizeProofAsset(assets[0])).toBeDefined();
  });
});

describe("commercial-proof-network service", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds account bundle from seed store", () => {
    const account = listAccounts(ORG)[0];
    expect(account).toBeDefined();

    const bundle = salesGetCommercialProofNetworkForAccount(ORG, account!.id);
    expect(bundle).toBeDefined();
    expect(bundle!.scope).toBe("account");
    expect(bundle!.scopeId).toBe(account!.id);
    expect(bundle!.coveragePct).toBeGreaterThanOrEqual(0);
    expect(bundle!.searchHits.length).toBeGreaterThan(0);
  });

  it("builds opportunity bundle with stage recommendations", () => {
    const opp = listOpportunities(ORG).find((o) => o.stage === "Proposal");
    expect(opp).toBeDefined();

    const bundle = salesGetCommercialProofNetworkForOpportunity(ORG, opp!.id);
    expect(bundle).toBeDefined();
    expect(bundle!.scope).toBe("opportunity");
    expect(bundle!.recommendations.length).toBeGreaterThan(0);
  });

  it("searches proof assets with relevance ranking", () => {
    const hits = salesSearchCommercialProofNetwork(ORG, {
      includeDraft: true,
      limit: 5,
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].relevanceScore).toBeGreaterThan(0);
  });

  it("builds industry bundle for seeded account industry", () => {
    const account = listAccounts(ORG).find((a) => a.industry);
    expect(account?.industry).toBeDefined();

    const bundle = salesGetCommercialProofNetworkForIndustry(
      ORG,
      account!.industry!,
    );
    expect(bundle.scope).toBe("industry");
    expect(bundle.scopeId).toBe(account!.industry);
    expect(bundle.coveragePct).toBeGreaterThanOrEqual(0);
  });

  it("search primitive ranks seed proof assets", () => {
    const hits = searchProofAssets(listProofAssets(ORG), {
      organizationId: ORG,
      includeDraft: true,
    });
    expect(hits.length).toBeGreaterThan(0);
  });
});
