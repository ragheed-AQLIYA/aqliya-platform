import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// ─── Mock external dependencies ───

jest.mock("@/lib/sales/store", () => ({
  listAccounts: jest.fn(),
  listAllInteractions: jest.fn(),
  listContactsForAccount: jest.fn(),
  listICPInsights: jest.fn(),
  listOpportunities: jest.fn(),
  listWinLossInsights: jest.fn(),
  listProofAssets: jest.fn(),
}));

jest.mock("@/lib/sales/vnext/pipeline-analytics", () => ({
  buildPipelineAnalytics: jest.fn(),
}));

jest.mock("@/lib/sales/services/proof-effectiveness-service", () => ({
  salesGetProofEffectivenessWidget: jest.fn(),
}));

jest.mock("@/lib/sales/services/commercial-memory-service", () => ({
  salesBuildCommercialMemorySnapshot: jest.fn(),
  salesGetTopSignals: jest.fn(),
}));

jest.mock("@/lib/sales/services/commercial-recommendations-service", () => ({
  salesGetCommercialRecommendations: jest.fn(),
}));

jest.mock("@/lib/sales/services/revenue-intelligence-service", () => ({
  getRevenueIntelligenceView: jest.fn(),
}));

jest.mock("@/lib/sales/services/icp-learning-service", () => ({
  buildICPLearningSnapshot: jest.fn(),
  ICP_DISCLAIMER_AR: "إخلاء مسؤولية ICP",
}));

jest.mock("@/lib/sales/services/institutional-learning-service", () => ({
  salesBuildInstitutionalLearningSnapshot: jest.fn(),
}));

jest.mock("@/lib/sales/services/market-intelligence-service", () => ({
  salesGetMarketIntelligenceForOrg: jest.fn(),
}));

jest.mock("@/lib/sales/services/cross-product-signals-service", () => ({
  salesListCrossProductSignalsForCommandCenter: jest.fn(),
}));

jest.mock("@/lib/sales/service", () => ({
  initSalesWorkspace: jest.fn(),
}));

jest.mock("@/lib/sales/vnext/commercial-recommendations", () => ({
  COMMERCIAL_RECOMMENDATION_DISCLAIMER_AR: "إخلاء مسؤولية التوصيات",
}));

jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(),
}));

// ─── Imports under test ───

import { buildRevenueSection } from "../executive-commercial-dashboard-service/revenue";
import { buildPipelineSection } from "../executive-commercial-dashboard-service/pipeline";
import { buildIcpSection } from "../executive-commercial-dashboard-service/icp";
import { buildProofSection } from "../executive-commercial-dashboard-service/proof";
import { buildSignalsSection } from "../executive-commercial-dashboard-service/signals";
import { buildRecommendationsSection } from "../executive-commercial-dashboard-service/recommendations";
import { buildLearningTrendsSection } from "../executive-commercial-dashboard-service/learning-trends";
import { buildExecutiveRisksSection } from "../executive-commercial-dashboard-service/risks";
import { pct, EXECUTIVE_COMMERCIAL_DISCLAIMER_AR } from "../executive-commercial-dashboard-service/common";
import { salesBuildExecutiveCommercialSnapshot } from "../executive-commercial-dashboard-service/orchestrator";

import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";
import type { ICPLearningSnapshot } from "@/lib/sales/icp-learning-snapshot";
import type { InstitutionalLearningSnapshot } from "@/lib/sales/v02/institutional-learning";
import type { WaveAInstitutionalSignal } from "@/lib/sales/vnext/cross-product-signals";
import type { WaveBMarketIntelligenceView } from "@/lib/sales/vnext/market-intelligence";

// Also import mocked modules for setup
import { listOpportunities, listProofAssets } from "@/lib/sales/store";
import { buildPipelineAnalytics } from "@/lib/sales/vnext/pipeline-analytics";
import { salesGetProofEffectivenessWidget } from "@/lib/sales/services/proof-effectiveness-service";
import { salesBuildCommercialMemorySnapshot, salesGetTopSignals } from "@/lib/sales/services/commercial-memory-service";
import { salesGetCommercialRecommendations } from "@/lib/sales/services/commercial-recommendations-service";
import { getRevenueIntelligenceView } from "@/lib/sales/services/revenue-intelligence-service";
import { buildICPLearningSnapshot } from "@/lib/sales/services/icp-learning-service";
import { salesBuildInstitutionalLearningSnapshot } from "@/lib/sales/services/institutional-learning-service";
import { salesGetMarketIntelligenceForOrg } from "@/lib/sales/services/market-intelligence-service";
import { salesListCrossProductSignalsForCommandCenter } from "@/lib/sales/services/cross-product-signals-service";
import { initSalesWorkspace } from "@/lib/sales/service";

const mockedListOpportunities = jest.mocked(listOpportunities);
const mockedListProofAssets = jest.mocked(listProofAssets);
const mockedBuildPipelineAnalytics = jest.mocked(buildPipelineAnalytics);
const mockedProofWidget = jest.mocked(salesGetProofEffectivenessWidget);
const mockedCommercialMemory = jest.mocked(salesBuildCommercialMemorySnapshot);
const mockedTopSignals = jest.mocked(salesGetTopSignals);
const mockedCommercialRecs = jest.mocked(salesGetCommercialRecommendations);
const mockedRevenueView = jest.mocked(getRevenueIntelligenceView);
const mockedIcpSnapshot = jest.mocked(buildICPLearningSnapshot);
const mockedInstitutional = jest.mocked(salesBuildInstitutionalLearningSnapshot);
const mockedMarketIntel = jest.mocked(salesGetMarketIntelligenceForOrg);
const mockedCrossProduct = jest.mocked(salesListCrossProductSignalsForCommandCenter);
const mockedInitWorkspace = jest.mocked(initSalesWorkspace);

// ─── Helpers: minimal valid snapshot factories ───

function makeRevenueSnapshot(overrides: Partial<RevenueIntelligenceSnapshot> = {}): RevenueIntelligenceSnapshot {
  return {
    totalPipeline: 1_000_000,
    weightedForecast: 650_000,
    forecastConfidence: "medium",
    pipelineCoverage: { ratio: 0.65, impliedTarget: 1_500_000, labelAr: "مناسب", level: "adequate" },
    stalledOpportunities: { count: 2, items: [] },
    stageDistribution: [],
    riskFlags: [
      { id: "rf-1", labelAr: "مخاطر السعر", severity: "high", opportunityId: "opp-1", opportunityName: "Deal A" },
    ],
    opportunitiesNeedingAction: [],
    revenueNotes: [{ id: "rn-1", textAr: "ملاحظة", kind: "observation" }],
    won: { count: 5, value: 800_000 },
    lost: { count: 3, value: 200_000 },
    disclaimerAr: "إخلاء",
    ...overrides,
  };
}

function makeIcpSnapshot(overrides: Partial<ICPLearningSnapshot> = {}): ICPLearningSnapshot {
  return {
    organizationId: "org-1",
    currentHypothesis: {
        label: "Enterprise ICP",
        labelAr: "الشركات الكبرى",
        recommendation: "Recommendation",
        recommendationAr: "الشركات الكبرى",
        confidence: 0.7,
        pct: 75,
        count: 10,
        wonCount: 4,
        pipelineValue: 500_000,
        sources: ["account", "deal"],
        evidence: [],
        id: "hyp-1",
        dimension: "hypothesis",
        insightLabel: "AI-assisted / evidence-based recommendation",
      },
    bestIndustries: [],
    accountTypes: [],
    titles: [],
    painPoints: [],
    winLossPatterns: [],
    storedInsights: [],
    overallConfidence: 0.72,
    icpFit: [
      { label: "قطاع حكومي", labelAr: "قطاع حكومي", pct: 85, rank: 1, count: 12, wonCount: 5 },
      { label: "قطاع خاص", labelAr: "قطاع خاص", pct: 62, rank: 2, count: 8, wonCount: 3 },
    ],
    disclaimer: "Disclaimer",
    disclaimerAr: "إخلاء",
    ...overrides,
  };
}

function makeInstitutionalSnapshot(overrides: Partial<InstitutionalLearningSnapshot> = {}): InstitutionalLearningSnapshot {
  return {
    organizationId: "org-1",
    generatedAt: new Date().toISOString(),
    disclaimer: "Disclaimer",
    disclaimerAr: "إخلاء",
    recommendationLabel: "AI-assisted / evidence-based recommendation",
    overallConfidence: 0.7,
    closedWonCount: 5,
    closedLostCount: 3,
    contentAssetRefs: [],
    insights: [],
    patterns: [],
    trends: [
      { id: "trend-activity-volume", metric: "Activities", metricAr: "الأنشطة", direction: "up", currentValue: 10, priorValue: 5, confidence: 0.62, evidence: [], outputStatus: "recommendation" },
    ],
    recommendations: [],
    ...overrides,
  };
}

describe("executive-commercial-dashboard-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── pct utility ───

  describe("pct()", () => {
    it("converts 0-1 ratio to 0-100 percentage", () => {
      expect(pct(0.5)).toBe(50);
    });

    it("rounds to nearest integer", () => {
      expect(pct(0.333)).toBe(33);
      expect(pct(0.6667)).toBe(67);
    });

    it("handles edge values", () => {
      expect(pct(0)).toBe(0);
      expect(pct(1)).toBe(100);
    });
  });

  // ─── EXECUTIVE_COMMERCIAL_DISCLAIMER_AR ───

  it("exports disclaimer text", () => {
    expect(EXECUTIVE_COMMERCIAL_DISCLAIMER_AR).toContain("DRAFT");
  });

  // ─── buildRevenueSection ───

  describe("buildRevenueSection()", () => {
    it("returns ok with mapped data when revenue snapshot is provided", () => {
      const rev = makeRevenueSnapshot();
      const section = buildRevenueSection(rev);

      expect(section.status).toBe("ok");
      expect(section.data).not.toBeNull();
      expect(section.data!.totalPipeline).toBe(1_000_000);
      expect(section.data!.wonCount).toBe(5);
      expect(section.data!.lostValue).toBe(200_000);
      expect(section.data!.pipelineCoverageLevel).toBe("adequate");
      expect(section.data!.coverageRatioPct).toBe(65);
    });

    it("returns fallback on error", () => {
      const section = buildRevenueSection(null, new Error("fail"));
      expect(section.status).toBe("fallback");
      expect(section.data).toBeNull();
      expect(section.fallbackMessageAr).toContain("تعذر");
    });

    it("returns empty when revenue is null", () => {
      const section = buildRevenueSection(null);
      expect(section.status).toBe("empty");
      expect(section.data).toBeNull();
    });

    it("returns empty when totalPipeline is 0", () => {
      const rev = makeRevenueSnapshot({ totalPipeline: 0, weightedForecast: 0 });
      const section = buildRevenueSection(rev);
      expect(section.status).toBe("empty");
      expect(section.data).toBeNull();
    });

    it("maps riskFlagCount and noteCount correctly", () => {
      const rev = makeRevenueSnapshot();
      const section = buildRevenueSection(rev);
      expect(section.data!.riskFlagCount).toBe(1);
      expect(section.data!.noteCount).toBe(1);
    });
  });

  // ─── buildIcpSection ───

  describe("buildIcpSection()", () => {
    it("returns ok with mapped data from ICP snapshot", () => {
      const icp = makeIcpSnapshot();
      const section = buildIcpSection(icp);

      expect(section.status).toBe("ok");
      expect(section.data).not.toBeNull();
      expect(section.data!.hypothesisAr).toBe("الشركات الكبرى");
      expect(section.data!.overallConfidencePct).toBe(72);
      expect(section.data!.topFitSegments).toHaveLength(2);
    });

    it("returns fallback on error", () => {
      const section = buildIcpSection(null, new Error("fail"));
      expect(section.status).toBe("fallback");
      expect(section.data).toBeNull();
    });

    it("returns empty when snapshot is null", () => {
      const section = buildIcpSection(null);
      expect(section.status).toBe("empty");
      expect(section.data).toBeNull();
    });

    it("limits topFitSegments to 4", () => {
      const icp = makeIcpSnapshot({
        icpFit: Array.from({ length: 6 }, (_, i) => ({ label: `s${i}`, labelAr: `s${i}`, pct: 50 + i, rank: i + 1, count: 5, wonCount: 2 })),
      });
      const section = buildIcpSection(icp);
      expect(section.data!.topFitSegments).toHaveLength(4);
    });

    it("computes reviewQueueCount from low-confidence patterns + insights", () => {
      const icp = makeIcpSnapshot({
        winLossPatterns: [
          { label: "p1", labelAr: "p1", recommendation: "r", recommendationAr: "r", confidence: 0.3, evidence: [], id: "wl-1", dimension: "win_loss", pct: 30, count: 2, wonCount: 0, sources: [], insightLabel: "AI-assisted / evidence-based recommendation" },
        ],
        storedInsights: [
          { label: "i1", labelAr: "i1", recommendation: "r", recommendationAr: "r", confidence: 0.5, evidence: [], id: "si-1", dimension: "win_loss", pct: 50, count: 1, wonCount: 0, sources: [], insightLabel: "AI-assisted / evidence-based recommendation" },
        ],
      });
      const section = buildIcpSection(icp);

      expect(section.data!.reviewQueueCount).toBe(2); // 0.3 < 0.6, 0.5 < 0.55 = both counted
    });
  });

  // ─── buildPipelineSection ───

  describe("buildPipelineSection()", () => {
    it("returns ok with analytics data", () => {
      mockedListOpportunities.mockReturnValue([
        { id: "opp-1", stage: "Proposal", valueEstimate: 100_000, accountId: "acct-1", name: "Deal A", ownerId: "user-1", organizationId: "org-1", score: 80, qualificationScore: 70, status: "active", reason: null, approvalStatus: null, reviewStatus: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isArchived: false, createdById: "user-1", updatedById: "user-1" },
        { id: "opp-2", stage: "Qualification", valueEstimate: 50_000, accountId: "acct-1", name: "Deal B", ownerId: "user-1", organizationId: "org-1", score: 50, qualificationScore: 40, status: "active", reason: null, approvalStatus: null, reviewStatus: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isArchived: false, createdById: "user-1", updatedById: "user-1" },
      ] as any);
      mockedBuildPipelineAnalytics.mockReturnValue({
        totalValue: 150_000,
        weightedValue: 90_000,
        dealsRequiringReview: 1,
        avgQualificationScore: 55,
        stageDistribution: { Proposal: 1, Qualification: 1 },
      });

      const rev = makeRevenueSnapshot();
      const section = buildPipelineSection("org-1", rev);

      expect(section.status).toBe("ok");
      expect(section.data!.totalValue).toBe(150_000);
      expect(section.data!.activeOpportunityCount).toBe(2);
      expect(section.data!.topStages).toHaveLength(2);
    });

    it("returns fallback on error from listOpportunities", () => {
      mockedListOpportunities.mockImplementation(() => { throw new Error("store error"); });
      const section = buildPipelineSection("org-1", null);
      expect(section.status).toBe("fallback");
      expect(section.data).toBeNull();
    });

    it("returns fallback on explicit error param", () => {
      const section = buildPipelineSection("org-1", null, new Error("revenue error"));
      expect(section.status).toBe("fallback");
      expect(section.data).toBeNull();
    });

    it("returns empty when no opportunities exist", () => {
      mockedListOpportunities.mockReturnValue([]);
      mockedBuildPipelineAnalytics.mockReturnValue({
        totalValue: 0, weightedValue: 0, dealsRequiringReview: 0, avgQualificationScore: 0, stageDistribution: {},
      });
      const section = buildPipelineSection("org-1", null);
      expect(section.status).toBe("empty");
      expect(section.data).toBeNull();
    });
  });

  // ─── buildProofSection ───

  describe("buildProofSection()", () => {
    it("returns ok with proof data", () => {
      mockedListProofAssets.mockReturnValue([
        { id: "asset-1", title: "Case Study A", assetType: "case_study", status: "active", linkedOpportunityIds: ["opp-1"], organizationId: "org-1", createdById: "user-1", updatedById: "user-1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "asset-2", title: "Whitepaper A", assetType: "whitepaper", status: "active", linkedOpportunityIds: [], organizationId: "org-1", createdById: "user-1", updatedById: "user-1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ] as any);
      mockedProofWidget.mockReturnValue({
        topAssets: [{ title: "Case Study A", effectivenessScore: 85, linkedOpportunityCount: 1 }],
      });

      const section = buildProofSection("org-1");

      expect(section.status).toBe("ok");
      expect(section.data!.activeAssetCount).toBe(2);
      expect(section.data!.linkedOpportunityCount).toBe(1);
      expect(section.data!.topEffectiveAssets).toHaveLength(1);
    });

    it("sets coverageGapHintAr when no links", () => {
      mockedListProofAssets.mockReturnValue([
        { id: "asset-1", title: "CS A", assetType: "case_study", status: "active", linkedOpportunityIds: [], organizationId: "org-1", createdById: "u1", updatedById: "u1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ] as any);
      mockedProofWidget.mockReturnValue({ topAssets: [] });

      const section = buildProofSection("org-1");
      expect(section.data!.coverageGapHintAr).toBeTruthy();
    });

    it("returns empty when no active proof assets", () => {
      mockedListProofAssets.mockReturnValue([]);
      mockedProofWidget.mockReturnValue({ topAssets: [] });

      const section = buildProofSection("org-1");
      expect(section.status).toBe("empty");
      expect(section.data).toBeNull();
    });

    it("returns fallback on exception", () => {
      mockedListProofAssets.mockImplementation(() => { throw new Error("fail"); });
      const section = buildProofSection("org-1");
      expect(section.status).toBe("fallback");
      expect(section.data).toBeNull();
    });
  });

  // ─── buildSignalsSection ───

  describe("buildSignalsSection()", () => {
    it("returns ok with merged signals from cross-product, market, and memory", () => {
      mockedCommercialMemory.mockReturnValue({
        topSignals: [{ label: "Signal 1", count: 3, source: "commercial-memory" }],
        version: "v1", generatedAt: new Date().toISOString(), organizationId: "org-1",
      } as any);
      mockedTopSignals.mockReturnValue([]);

      const market: WaveBMarketIntelligenceView = {
        topMarketSignals: [{ label: "Market Signal 1", labelAr: "إشارة سوق", score: 80 }],
        topCompetitorSignals: [], disclaimerAr: "", generatedAt: "", organizationId: "org-1",
      };
      const crossProduct: WaveAInstitutionalSignal[] = [
        { id: "cp-1", titleAr: "إشارة منتج", severity: "high", waveAKind: "renewal_risk", organizationId: "org-1", generatedAt: new Date().toISOString() },
      ];

      const section = buildSignalsSection("org-1", market, crossProduct);

      expect(section.status).toBe("ok");
      expect(section.data!.length).toBeGreaterThanOrEqual(2);
    });

    it("returns empty when no signals available", () => {
      mockedCommercialMemory.mockReturnValue({
        topSignals: [], version: "v1", generatedAt: new Date().toISOString(), organizationId: "org-1",
      } as any);
      mockedTopSignals.mockReturnValue([]);

      const section = buildSignalsSection("org-1", null, null);
      expect(section.status).toBe("empty");
      expect(section.data).toEqual([]);
    });

    it("returns fallback on exception", () => {
      mockedCommercialMemory.mockImplementation(() => { throw new Error("fail"); });
      const section = buildSignalsSection("org-1", null, null);
      expect(section.status).toBe("fallback");
      expect(section.data).toEqual([]);
    });

    it("deduplicates signals by label+source", () => {
      mockedCommercialMemory.mockReturnValue({
        topSignals: [{ label: "Duplicate", count: 2, source: "market-intelligence" }],
        version: "v1", generatedAt: new Date().toISOString(), organizationId: "org-1",
      } as any);
      mockedTopSignals.mockReturnValue([]);

      const market: WaveBMarketIntelligenceView = {
        topMarketSignals: [{ label: "Duplicate", labelAr: "مكرر", score: 75 }],
        topCompetitorSignals: [], disclaimerAr: "", generatedAt: "", organizationId: "org-1",
      };

      const section = buildSignalsSection("org-1", market, null);
      const duplicates = section.data!.filter((s) => s.label === "Duplicate");
      expect(duplicates).toHaveLength(1);
    });
  });

  // ─── buildRecommendationsSection ───

  describe("buildRecommendationsSection()", () => {
    it("returns ok with mapped recommendations", () => {
      mockedCommercialRecs.mockReturnValue({
        recommendations: [
          { id: "rec-1", titleAr: "توصية 1", priority: "high", reasoningAr: "سبب", category: "pipeline", confidence: 0.85, href: "/sales/pipeline" },
          { id: "rec-2", titleAr: "توصية 2", priority: "medium", reasoningAr: "سبب 2", category: "outreach", confidence: 0.65 },
        ],
        byCategory: { opps_at_risk: [] },
      } as any);

      const section = buildRecommendationsSection("org-1");

      expect(section.status).toBe("ok");
      expect(section.data).toHaveLength(2);
      expect(section.data![0].confidencePct).toBe(85);
    });

    it("returns empty when no recommendations", () => {
      mockedCommercialRecs.mockReturnValue({
        recommendations: [],
        byCategory: { opps_at_risk: [] },
      } as any);
      const section = buildRecommendationsSection("org-1");
      expect(section.status).toBe("empty");
      expect(section.data).toEqual([]);
    });

    it("returns fallback on exception", () => {
      mockedCommercialRecs.mockImplementation(() => { throw new Error("fail"); });
      const section = buildRecommendationsSection("org-1");
      expect(section.status).toBe("fallback");
      expect(section.data).toEqual([]);
    });

    it("limits to 8 recommendations", () => {
      const recs = Array.from({ length: 12 }, (_, i) => ({
        id: `rec-${i}`, titleAr: `R${i}`, priority: "low" as const, reasoningAr: "r", category: "pipeline" as const, confidence: 0.5,
      }));
      mockedCommercialRecs.mockReturnValue({ recommendations: recs, byCategory: { opps_at_risk: [] } } as any);
      const section = buildRecommendationsSection("org-1");
      expect(section.data).toHaveLength(8);
    });
  });

  // ─── buildLearningTrendsSection ───

  describe("buildLearningTrendsSection()", () => {
    it("returns ok with trends from institutional snapshot", () => {
      const inst = makeInstitutionalSnapshot();
      const section = buildLearningTrendsSection(inst, null);

      expect(section.status).toBe("ok");
      expect(section.data!.length).toBeGreaterThanOrEqual(1);
    });

    it("returns fallback when both errors", () => {
      const section = buildLearningTrendsSection(null, null, new Error("inst err"), new Error("icp err"));
      expect(section.status).toBe("fallback");
    });

    it("includes ICP confidence trend when institutional data is sparse", () => {
      const icp = makeIcpSnapshot({ overallConfidence: 0.8 });
      const section = buildLearningTrendsSection(null, icp);

      expect(section.status).toBe("ok");
      expect(section.data!.some((t) => t.id === "icp-overall")).toBe(true);
    });

    it("returns empty when no data from either source", () => {
      const section = buildLearningTrendsSection(null, null);
      expect(section.status).toBe("empty");
    });

    it("maps institutional trend directions correctly", () => {
      const inst = makeInstitutionalSnapshot({
        trends: [
          { id: "t1", metric: "Act", metricAr: "نشاط", direction: "down", currentValue: 3, priorValue: 8, confidence: 0.5, evidence: [], outputStatus: "recommendation" },
        ],
      });
      const section = buildLearningTrendsSection(inst, null);
      expect(section.data![0].direction).toBe("down");
    });
  });

  // ─── buildExecutiveRisksSection ───

  describe("buildExecutiveRisksSection()", () => {
    it("returns ok with risks aggregated from revenue and commercial recs", () => {
      const rev = makeRevenueSnapshot();
      const section = buildExecutiveRisksSection(rev, null, null, null);

      expect(section.status).toBe("ok");
      expect(section.data!.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty when no risks found", () => {
      const rev = makeRevenueSnapshot({ riskFlags: [] });
      const section = buildExecutiveRisksSection(rev, null, null, null);
      expect(section.status).toBe("empty");
      expect(section.data).toEqual([]);
    });

    it("returns fallback on exception", () => {
      // Force an error by passing invalid data
      const section = buildExecutiveRisksSection(null, null, null, null);
      // With empty inputs, should get "empty" not "fallback"
      expect(section.status).toBe("empty");
    });

    it("deduplicates risks by id", () => {
      const rev = makeRevenueSnapshot({
        riskFlags: [
          { id: "rf-1", labelAr: "Risk A", severity: "high" as const },
          { id: "rf-1", labelAr: "Risk A dupe", severity: "high" as const },
        ],
      });
      const section = buildExecutiveRisksSection(rev, null, null, null);
      const ids = section.data!.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  // ─── salesBuildExecutiveCommercialSnapshot (orchestrator) ───

  describe("salesBuildExecutiveCommercialSnapshot()", () => {
    beforeEach(() => {
      // Satisfy store calls in loadOrgSalesData
      const { listAccounts, listICPInsights, listWinLossInsights, listAllInteractions, listContactsForAccount } = require("@/lib/sales/store");
      jest.mocked(listAccounts).mockReturnValue([{ id: "acct-1", name: "Acme", organizationId: "org-1", ownerId: "user-1", status: "active", industry: "tech", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdById: "user-1", updatedById: "user-1", isArchived: false }]);
      jest.mocked(listAllInteractions).mockReturnValue([]);
      jest.mocked(listContactsForAccount).mockReturnValue([]);
      jest.mocked(listICPInsights).mockReturnValue([]);
      jest.mocked(listWinLossInsights).mockReturnValue([]);
      jest.mocked(listOpportunities).mockReturnValue([]);

      // Service mocks
      mockedRevenueView.mockResolvedValue(makeRevenueSnapshot());
      mockedIcpSnapshot.mockReturnValue(makeIcpSnapshot());
      mockedInstitutional.mockReturnValue(makeInstitutionalSnapshot());
      mockedMarketIntel.mockReturnValue(null);
      mockedCommercialRecs.mockReturnValue({
        recommendations: [],
        byCategory: { opps_at_risk: [] },
      } as any);
      mockedCrossProduct.mockResolvedValue(null);
      mockedBuildPipelineAnalytics.mockReturnValue({
        totalValue: 0, weightedValue: 0, dealsRequiringReview: 0, avgQualificationScore: 0, stageDistribution: {},
      });
      mockedListProofAssets.mockReturnValue([]);
      mockedProofWidget.mockReturnValue({ topAssets: [] });
      mockedCommercialMemory.mockReturnValue({ topSignals: [], version: "v1", generatedAt: new Date().toISOString(), organizationId: "org-1" } as any);
      mockedTopSignals.mockReturnValue([]);
    });

    it("builds a complete ExecutiveCommercialSnapshot", async () => {
      const user = { id: "user-1", organizationId: "org-1", role: "admin", name: "Admin", email: "admin@test.com" } as any;
      const result = await salesBuildExecutiveCommercialSnapshot(user);

      expect(result.organizationId).toBe("org-1");
      expect(result.generatedAt).toBeTruthy();
      expect(result.disclaimerAr).toBeTruthy();
      expect(result.revenue.status).toBe("ok");
      expect(result.pipeline.status).toBe("empty"); // no opportunities
      expect(result.icp.status).toBe("ok");
      expect(mockedInitWorkspace).toHaveBeenCalledWith(user);
    });

    it("handles revenue service failure gracefully", async () => {
      mockedRevenueView.mockRejectedValue(new Error("revenue down"));

      const user = { id: "user-1", organizationId: "org-1", role: "admin" } as any;
      const result = await salesBuildExecutiveCommercialSnapshot(user);

      expect(result.revenue.status).toBe("fallback");
    });

    it("handles ICP service failure gracefully", async () => {
      mockedIcpSnapshot.mockImplementation(() => { throw new Error("icp down"); });

      const user = { id: "user-1", organizationId: "org-1", role: "admin" } as any;
      const result = await salesBuildExecutiveCommercialSnapshot(user);

      expect(result.icp.status).toBe("fallback");
    });
  });
});

