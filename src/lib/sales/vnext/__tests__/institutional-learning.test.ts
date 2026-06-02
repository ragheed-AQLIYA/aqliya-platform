// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  INSTITUTIONAL_LEARNING_WAVE_C_RECOMMENDATION_LABEL,
  buildInstitutionalLearningEvidenceMap,
  buildWaveCInstitutionalLearningSnapshot,
  computeAggregateInstitutionalConfidence,
} from "../institutional-learning";
import {
  buildInstitutionalLearningSnapshot,
  INSTITUTIONAL_LEARNING_LABEL,
  type ContentAssetRef,
} from "../../v02/institutional-learning";
import {
  salesBuildInstitutionalLearningSnapshot,
  salesGetInstitutionalLearningForOrg,
} from "../../services/institutional-learning-service";
import { salesGetMarketIntelligenceForOrg } from "../../services/market-intelligence-service";
import { ensureSalesSeed, resetSalesStoreForTests } from "../../store";
import {
  listActivities,
  listAllInteractions,
  listObjections,
  listOpportunities,
  listProofAssets,
  listSignals,
  listWinLossInsights,
} from "../../store";

const ORG = "org-salesos-v01";
const OWNER = "user-seed-001";

function loadInput(org: string, contentAssetRefs?: ContentAssetRef[]) {
  return {
    organizationId: org,
    winLossInsights: listWinLossInsights(org),
    opportunities: listOpportunities(org),
    activities: listActivities(org),
    interactions: listAllInteractions(org),
    signals: listSignals(org),
    proofAssets: listProofAssets(org),
    objections: listObjections(org),
    contentAssetRefs,
  };
}

describe("vnext institutional-learning Wave C facade", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("uses AI-assisted evidence-based recommendation label", () => {
    expect(INSTITUTIONAL_LEARNING_WAVE_C_RECOMMENDATION_LABEL).toBe(
      "AI-assisted / evidence-based recommendation",
    );
  });

  it("builds evidence map for every output row", () => {
    const view = buildWaveCInstitutionalLearningSnapshot({
      ...loadInput(ORG),
      marketIntelligence: salesGetMarketIntelligenceForOrg(ORG),
    });

    const rows = [
      ...view.insights,
      ...view.patterns,
      ...view.trends,
      ...view.recommendations,
    ];
    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      expect(row.insightLabel).toBe(INSTITUTIONAL_LEARNING_LABEL);
      expect(row.evidence.length).toBeGreaterThan(0);
      expect(view.evidenceMap[row.id]?.length).toBeGreaterThan(0);
    }
  });

  it("merges market intelligence without inventing rows when market is empty", () => {
    const base = buildInstitutionalLearningSnapshot(loadInput(ORG));
    const withoutMarket = buildWaveCInstitutionalLearningSnapshot(loadInput(ORG));
    expect(withoutMarket.marketIntelligenceIncluded).toBe(false);
    expect(withoutMarket.insights.length).toBe(base.insights.length);
  });

  it("adds market-dimension insights when market intelligence is present", () => {
    const view = buildWaveCInstitutionalLearningSnapshot({
      ...loadInput(ORG),
      marketIntelligence: salesGetMarketIntelligenceForOrg(ORG),
    });

    expect(view.marketIntelligenceIncluded).toBe(true);
    expect(view.insights.some((row) => row.dimension === "market")).toBe(true);
    expect(view.aggregateConfidence).toBeGreaterThan(0);
    expect(computeAggregateInstitutionalConfidence(view)).toBe(
      view.aggregateConfidence,
    );
  });

  it("maps evidence strings from snapshot rows", () => {
    const snapshot = buildInstitutionalLearningSnapshot(loadInput(ORG));
    const map = buildInstitutionalLearningEvidenceMap(snapshot);
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });
});

describe("institutional-learning-service Wave C", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds Wave C view from seed store via service", () => {
    const view = salesGetInstitutionalLearningForOrg(ORG);
    expect(view.organizationId).toBe(ORG);
    expect(view.recommendationLabel).toContain("evidence-based");
    expect(view.marketIntelligenceIncluded).toBe(true);
    expect(view.patterns.some((p) => p.patternType === "loss_theme")).toBe(true);
  });

  it("snapshot facade matches Wave C builder on seed org", () => {
    const viaService = salesBuildInstitutionalLearningSnapshot(ORG);
    const viaFacade = buildWaveCInstitutionalLearningSnapshot({
      ...loadInput(ORG),
      marketIntelligence: salesGetMarketIntelligenceForOrg(ORG),
    });
    expect(viaService.patterns.length).toBe(viaFacade.patterns.length);
    expect(viaService.insights.length).toBe(viaFacade.insights.length);
  });

  it("omits all rows when inputs are empty", () => {
    const view = buildWaveCInstitutionalLearningSnapshot({
      organizationId: "org-empty",
      winLossInsights: [],
      opportunities: [],
      activities: [],
      interactions: [],
      signals: [],
      proofAssets: [],
      objections: [],
    });
    expect(view.insights).toHaveLength(0);
    expect(view.patterns).toHaveLength(0);
    expect(view.trends).toHaveLength(0);
    expect(view.recommendations).toHaveLength(0);
    expect(view.overallConfidence).toBe(0);
    expect(view.aggregateConfidence).toBe(0);
  });
});
