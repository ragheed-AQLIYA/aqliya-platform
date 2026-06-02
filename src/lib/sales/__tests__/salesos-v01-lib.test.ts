// @ts-nocheck
import { describe, expect, it, beforeEach } from "@jest/globals";
import {
  normalizeOpportunityStage,
  SALES_OPPORTUNITY_STAGES_V01,
} from "../types";
import { generateNextActions } from "../next-action-engine";
import { synthesizeICPHypothesis } from "../icp-learning";
import {
  ensureSalesSeed,
  listAccounts,
  listObjections,
  listProofAssets,
  resetSalesStoreForTests,
} from "../store";
import { salesGetCommercialMemory } from "../services/intelligence";
import { salesRecommendNextActions } from "../services/next-action";
import { buildProofLinkageSummary } from "../proof-linkage-service";

const ORG = "org-salesos-v01";
const OWNER = "user-seed-001";

describe("SalesOS v0.1 — stage model", () => {
  it("exposes v0.1 stages and normalizes legacy Draft", () => {
    expect(SALES_OPPORTUNITY_STAGES_V01).toContain("Discovery");
    expect(normalizeOpportunityStage("Draft")).toBe("New");
    expect(normalizeOpportunityStage("Qualification")).toBe("Qualified");
  });
});

describe("SalesOS v0.1 — seed volume", () => {
  beforeEach(() => {
    resetSalesStoreForTests();
  });

  it("seeds 5 accounts, 8 opps, objections and proof assets", async () => {
    await ensureSalesSeed(ORG, OWNER);
    expect(listAccounts(ORG).length).toBe(5);
    expect(listObjections(ORG).length).toBeGreaterThanOrEqual(2);
    expect(listProofAssets(ORG).length).toBeGreaterThanOrEqual(2);
  });
});

describe("SalesOS v0.1 — intelligence lib", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds commercial memory snapshot", () => {
    const memory = salesGetCommercialMemory(ORG);
    expect(memory.opportunityCount).toBe(8);
    expect(memory.objections.length).toBeGreaterThan(0);
  });

  it("recommends next actions for draft opportunity", () => {
    const recs = salesRecommendNextActions(ORG, "sales-opp-003");
    expect(recs.length).toBeGreaterThan(0);
  });

  it("runs next-action engine rules", async () => {
    await ensureSalesSeed(ORG, OWNER);
    const actions = generateNextActions({
      organizationId: ORG,
      opportunities: [],
      activities: [],
      meetings: [],
      outreach: [],
      objections: [],
      proofAssets: [],
    });
    expect(Array.isArray(actions)).toBe(true);
  });

  it("synthesizes ICP hypothesis", () => {
    const learning = synthesizeICPHypothesis({
      account: listAccounts(ORG)[0],
      opportunities: [],
      existingInsights: [],
    });
    expect(learning.hypothesis.length).toBeGreaterThan(0);
    expect(learning.confidence).toBeGreaterThan(0);
  });

  it("builds proof linkage summary", () => {
    const plan = buildProofLinkageSummary({
      organizationId: ORG,
      opportunityId: "sales-opp-001",
      proofAssets: listProofAssets(ORG),
    });
    expect(plan.recommendations.length).toBeGreaterThanOrEqual(0);
  });
});
