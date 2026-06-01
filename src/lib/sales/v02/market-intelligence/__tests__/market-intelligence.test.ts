import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  buildMarketIntelligenceSnapshot,
  categorizeMarketSignals,
  collectMarketSignals,
  dedupeCollectedSignals,
  MARKET_INTELLIGENCE_RECOMMENDATION_LABEL,
  scoreCompetitorSignals,
  scoreIndustrySignals,
  scoreMarketSignals,
  summarizeMarketIntelligence,
} from "../index";
import { ensureSalesSeed, resetSalesStoreForTests } from "../../store";
import {
  listAccounts,
  listAllInteractions,
  listCompetitorMentions,
  listOpportunities,
  listSignals,
  listWinLossInsights,
} from "../../store";

const ORG = "org-salesos-v01";
const OWNER = "user-seed-001";

function seedInput(orgId: string) {
  return {
    organizationId: orgId,
    accounts: listAccounts(orgId),
    opportunities: listOpportunities(orgId),
    interactions: listAllInteractions(orgId),
    storedSignals: listSignals(orgId),
    competitorMentions: listCompetitorMentions(orgId),
    winLossInsights: listWinLossInsights(orgId),
  };
}

describe("market-intelligence v02", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("collects and dedupes signals from seed store", () => {
    const input = seedInput(ORG);
    const collected = dedupeCollectedSignals(
      collectMarketSignals({
        organizationId: input.organizationId,
        storedSignals: input.storedSignals,
        interactions: input.interactions,
        opportunities: input.opportunities,
        winLossInsights: input.winLossInsights,
        competitorMentions: input.competitorMentions,
      }),
    );
    expect(collected.length).toBeGreaterThan(0);
    expect(collected.some((s) => s.category === "buying" || s.category === "expansion")).toBe(
      true,
    );
    expect(collected.some((s) => s.source === "stored")).toBe(true);
  });

  it("categorizes, scores, and summarizes pipeline", () => {
    const input = seedInput(ORG);
    const collected = collectMarketSignals({
      organizationId: input.organizationId,
      storedSignals: input.storedSignals,
      interactions: input.interactions,
      opportunities: input.opportunities,
      winLossInsights: input.winLossInsights,
      competitorMentions: input.competitorMentions,
    });
    const categorized = categorizeMarketSignals(collected);
    const marketSignals = scoreMarketSignals(categorized);
    const industrySignals = scoreIndustrySignals({
      organizationId: input.organizationId,
      accounts: input.accounts,
      opportunities: input.opportunities,
      winLossInsights: input.winLossInsights,
      marketSignals,
    });
    const competitorSignals = scoreCompetitorSignals({
      organizationId: input.organizationId,
      competitorMentions: input.competitorMentions,
      interactions: input.interactions,
      marketSignals,
    });
    const insights = summarizeMarketIntelligence({
      organizationId: input.organizationId,
      marketSignals,
      industrySignals,
      competitorSignals,
    });

    expect(industrySignals.length).toBeGreaterThan(0);
    expect(competitorSignals.length).toBeGreaterThan(0);
    expect(marketSignals[0]?.score).toBeGreaterThan(0);
    expect(insights.length).toBeGreaterThan(0);
    for (const row of insights) {
      expect(row.outputStatus).toBe("recommendation");
    }
  });

  it("builds org snapshot with disclaimers", () => {
    const snapshot = buildMarketIntelligenceSnapshot(seedInput(ORG));
    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.overallScore).toBeGreaterThan(0);
    expect(snapshot.industrySignals.length).toBeGreaterThan(0);
    expect(snapshot.competitorSignals.length).toBeGreaterThan(0);
    expect(snapshot.disclaimerAr.length).toBeGreaterThan(10);
    expect(snapshot.insights.length).toBeGreaterThan(0);
    expect(MARKET_INTELLIGENCE_RECOMMENDATION_LABEL).toContain("draft");
  });
});
