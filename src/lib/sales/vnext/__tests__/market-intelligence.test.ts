import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  MARKET_INTELLIGENCE_WAVE_B_RECOMMENDATION_LABEL,
  buildMarketIntelligenceEvidenceMap,
  buildWaveBMarketIntelligenceFromInput,
  computeAggregateMarketConfidence,
} from "../market-intelligence";
import {
  salesBuildMarketIntelligenceView,
  salesGetMarketIntelligenceForOrg,
} from "../../services/market-intelligence-service";
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

describe("vnext market-intelligence Wave B facade", () => {
  it("uses AI-assisted evidence-based recommendation label", () => {
    expect(MARKET_INTELLIGENCE_WAVE_B_RECOMMENDATION_LABEL).toBe(
      "AI-assisted / evidence-based recommendation",
    );
  });

  it("builds evidence map for all entity kinds", () => {
    const view = buildWaveBMarketIntelligenceFromInput(seedInput(ORG));
    for (const signal of view.topMarketSignals) {
      expect(view.evidenceMap[signal.id]?.length).toBeGreaterThan(0);
    }
    for (const industry of view.topIndustrySignals) {
      expect(view.evidenceMap[industry.id]?.length).toBeGreaterThan(0);
    }
    const map = buildMarketIntelligenceEvidenceMap({
      organizationId: ORG,
      marketSignals: view.topMarketSignals,
      industrySignals: view.topIndustrySignals,
      competitorSignals: view.topCompetitorSignals,
      insights: view.insights,
      overallScore: view.overallScore,
      disclaimer: view.disclaimerEn,
      disclaimerAr: view.disclaimerAr,
    });
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });

  it("computes aggregate confidence from insights", () => {
    const view = buildWaveBMarketIntelligenceFromInput(seedInput(ORG));
    expect(view.aggregateConfidence).toBeGreaterThanOrEqual(0.35);
    expect(view.aggregateConfidence).toBeLessThanOrEqual(0.95);
    expect(computeAggregateMarketConfidence([])).toBe(0.45);
  });
});

describe("market-intelligence-service", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds Wave B view from seed store via service", () => {
    const view = salesGetMarketIntelligenceForOrg(ORG);
    expect(view.organizationId).toBe(ORG);
    expect(view.topMarketSignals.length).toBeGreaterThan(0);
    expect(view.topIndustrySignals.length).toBeGreaterThan(0);
    expect(view.topCompetitorSignals.length).toBeGreaterThan(0);
    expect(view.insights.length).toBeGreaterThan(0);
    expect(view.recommendationLabel).toContain("evidence-based");
  });

  it("matches facade output from explicit input", () => {
    const fromService = salesBuildMarketIntelligenceView(seedInput(ORG));
    const fromFacade = buildWaveBMarketIntelligenceFromInput(seedInput(ORG));
    expect(fromService.overallScore).toBe(fromFacade.overallScore);
    expect(fromService.topMarketSignals.length).toBe(fromFacade.topMarketSignals.length);
  });
});
