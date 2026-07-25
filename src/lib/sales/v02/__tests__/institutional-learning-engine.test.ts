import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// ─── Mock external dependencies ───

jest.mock("../../vnext/commercial-memory", () => ({
  getWinLossPatterns: jest.fn(),
}));

jest.mock("server-only", () => ({}));

// ─── Imports under test ───

import {
  deriveWinLossPatterns,
} from "../institutional-learning/engine/patterns";
import {
  deriveTrends,
} from "../institutional-learning/engine/trends";
import {
  deriveInsights,
} from "../institutional-learning/engine/insights";
import {
  deriveRecommendations,
} from "../institutional-learning/engine/recommendations";
import {
  buildInstitutionalLearningSnapshot,
  patternConfidence,
  overallConfidence,
  bucketReasons,
  reasonLabelAr,
  evidence,
  PATTERN_MIN_COUNT,
  INSTITUTIONAL_LEARNING_LABEL,
  INSTITUTIONAL_LEARNING_DISCLAIMER_EN,
  INSTITUTIONAL_LEARNING_DISCLAIMER_AR,
} from "../institutional-learning/engine";

import type {
  InstitutionalLearningInput,
  InstitutionalLearningPattern,
  InstitutionalLearningTrend,
  InstitutionalLearningInsight,
} from "../institutional-learning/types";

import { getWinLossPatterns } from "../../vnext/commercial-memory";

const mockedGetWinLossPatterns = jest.mocked(getWinLossPatterns);

// ─── Helper factories ───

function makeMinimalInput(overrides: Partial<InstitutionalLearningInput> = {}): InstitutionalLearningInput {
  return {
    organizationId: "org-1",
    winLossInsights: [],
    opportunities: [],
    activities: [],
    interactions: [],
    signals: [],
    proofAssets: [],
    objections: [],
    contentAssetRefs: [],
    wonDeals: [],
    lostDeals: [],
    ...overrides,
  };
}

function makeWonDeal(overrides: { opportunityId?: string; name?: string; reason?: string } = {}) {
  return {
    opportunityId: overrides.opportunityId ?? "won-1",
    name: overrides.name ?? "Won Deal A",
    reason: overrides.reason ?? "expansion_fit",
  };
}

function makeLostDeal(overrides: { opportunityId?: string; name?: string; reason?: string } = {}) {
  return {
    opportunityId: overrides.opportunityId ?? "lost-1",
    name: overrides.name ?? "Lost Deal B",
    reason: overrides.reason ?? "budget_freeze",
  };
}

function makeActivity(overrides: { id?: string; type?: string; summary?: string; loggedAt?: string } = {}) {
  return {
    id: overrides.id ?? "act-1",
    type: overrides.type ?? "meeting",
    summary: overrides.summary ?? "Discovery meeting with client",
    loggedAt: overrides.loggedAt ?? new Date().toISOString(),
    organizationId: "org-1",
    opportunityId: "opp-1",
    createdById: "user-1",
    updatedById: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function makeSignal(overrides: { id?: string; signalType?: string; strength?: string; description?: string } = {}) {
  return {
    id: overrides.id ?? "sig-1",
    signalType: overrides.signalType ?? "budget_approved",
    strength: overrides.strength ?? "strong",
    description: overrides.description ?? "Budget approved signal",
    organizationId: "org-1",
    opportunityId: "opp-1",
    createdById: "user-1",
    updatedById: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any;
}

function makeProofAsset(overrides: { id?: string; title?: string; linkedOpportunityIds?: string[] } = {}) {
  return {
    id: overrides.id ?? "pa-1",
    title: overrides.title ?? "Case Study X",
    assetType: "case_study",
    status: "active",
    linkedOpportunityIds: overrides.linkedOpportunityIds ?? ["won-1"],
    organizationId: "org-1",
    createdById: "user-1",
    updatedById: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any;
}

// ─── Tests ───

describe("Institutional Learning Engine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Constants ───

  describe("constants", () => {
    it("exports required constants", () => {
      expect(PATTERN_MIN_COUNT).toBe(2);
      expect(INSTITUTIONAL_LEARNING_LABEL).toContain("evidence-based");
      expect(INSTITUTIONAL_LEARNING_DISCLAIMER_EN).toContain("draft");
      expect(INSTITUTIONAL_LEARNING_DISCLAIMER_AR).toContain("مسودة");
    });
  });

  // ─── Helper functions ───

  describe("reasonLabelAr()", () => {
    it("returns Arabic label for known reasons", () => {
      expect(reasonLabelAr("budget_freeze")).toBe("تجميد الميزانية");
      expect(reasonLabelAr("competitor")).toBe("منافسة");
      expect(reasonLabelAr("timing")).toBe("توقيت");
    });

    it("returns the input key for unknown reasons", () => {
      expect(reasonLabelAr("unknown_reason")).toBe("unknown_reason");
    });
  });

  describe("evidence()", () => {
    it("creates evidence with summaryAr defaulting to summary", () => {
      const ev = evidence({ source: "won_deal", refId: "r1", summary: "test" });
      expect(ev.summaryAr).toBe("test");
    });

    it("respects explicit summaryAr", () => {
      const ev = evidence({ source: "won_deal", refId: "r1", summary: "test", summaryAr: "اختبار" });
      expect(ev.summaryAr).toBe("اختبار");
    });
  });

  describe("patternConfidence()", () => {
    it("computes confidence from count and evidence count", () => {
      expect(patternConfidence(2, 2)).toBeCloseTo(0.69, 1);
      expect(patternConfidence(5, 5)).toBeCloseTo(0.92, 1);
    });

    it("caps at 0.92", () => {
      expect(patternConfidence(100, 100)).toBe(0.92);
    });
  });

  describe("overallConfidence()", () => {
    it("averages pattern and insight confidences", () => {
      const patterns = [{ confidence: 0.8 }, { confidence: 0.6 }] as InstitutionalLearningPattern[];
      const insights = [{ confidence: 0.7 }] as InstitutionalLearningInsight[];
      expect(overallConfidence(patterns, insights)).toBeCloseTo(0.7, 1);
    });

    it("returns 0 when no patterns or insights", () => {
      expect(overallConfidence([], [])).toBe(0);
    });
  });

  describe("bucketReasons()", () => {
    it("groups deals by reason key", () => {
      const deals = [
        makeWonDeal({ reason: "expansion_fit" }),
        makeWonDeal({ opportunityId: "won-2", reason: "expansion_fit" }),
        makeWonDeal({ opportunityId: "won-3", reason: "competitor" }),
      ];
      const buckets = bucketReasons(deals, "won");
      expect(buckets.size).toBe(2);
      expect(buckets.get("expansion_fit")?.length).toBe(2);
      expect(buckets.get("competitor")?.length).toBe(1);
    });

    it("handles unspecified reasons", () => {
      const deals = [makeWonDeal({ reason: "" })];
      const buckets = bucketReasons(deals, "won");
      expect(buckets.has("")).toBe(true);
    });
  });

  // ─── deriveWinLossPatterns ───

  describe("deriveWinLossPatterns()", () => {
    it("derives win_theme patterns from wonDeals", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput({
        wonDeals: [
          makeWonDeal({ reason: "expansion_fit" }),
          makeWonDeal({ opportunityId: "won-2", reason: "expansion_fit" }),
          makeWonDeal({ opportunityId: "won-3", reason: "competitor" }),
        ],
      });
      const patterns = deriveWinLossPatterns(input);
      const winThemes = patterns.filter((p) => p.patternType === "win_theme");
      expect(winThemes.length).toBeGreaterThanOrEqual(1);
      expect(winThemes[0].label).toContain("expansion_fit");
    });

    it("derives loss_theme patterns from lostDeals", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput({
        lostDeals: [
          makeLostDeal({ reason: "budget_freeze" }),
          makeLostDeal({ opportunityId: "lost-2", reason: "budget_freeze" }),
        ],
      });
      const patterns = deriveWinLossPatterns(input);
      const lossThemes = patterns.filter((p) => p.patternType === "loss_theme");
      expect(lossThemes.length).toBeGreaterThanOrEqual(1);
      expect(lossThemes[0].label).toContain("budget_freeze");
    });

    it("skips patterns with fewer than PATTERN_MIN_COUNT entries", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput({
        wonDeals: [makeWonDeal({ reason: "rare_reason" })],
      });
      const patterns = deriveWinLossPatterns(input);
      const rare = patterns.filter((p) => p.label.includes("rare_reason"));
      expect(rare).toHaveLength(0);
    });

    it("derives signal_cluster patterns from strong signals", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput({
        signals: [
          makeSignal({ signalType: "budget_approved" }),
          makeSignal({ id: "sig-2", signalType: "budget_approved" }),
        ],
      });
      const patterns = deriveWinLossPatterns(input);
      const signalPatterns = patterns.filter((p) => p.patternType === "signal_cluster");
      expect(signalPatterns.length).toBeGreaterThanOrEqual(1);
    });

    it("derives proof_correlation patterns from proof assets linked to won deals", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput({
        wonDeals: [makeWonDeal()],
        proofAssets: [makeProofAsset({ linkedOpportunityIds: ["won-1"] })],
      });
      const patterns = deriveWinLossPatterns(input);
      const proofPatterns = patterns.filter((p) => p.patternType === "proof_correlation");
      expect(proofPatterns.length).toBeGreaterThanOrEqual(1);
    });

    it("derives activity_theme patterns from activities with matching keywords", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput({
        activities: [
          makeActivity({ summary: "Discovery workshop with CIO" }),
          makeActivity({ id: "act-2", summary: "Workshop on requirements" }),
        ],
      });
      const patterns = deriveWinLossPatterns(input);
      const activityPatterns = patterns.filter((p) => p.patternType === "activity_theme");
      expect(activityPatterns.length).toBeGreaterThanOrEqual(1);
    });

    it("includes patterns from winLossInsights via getWinLossPatterns", () => {
      mockedGetWinLossPatterns.mockReturnValue([
        { reason: "competitor", outcome: "lost", count: 3 },
      ] as any);
      const input = makeMinimalInput({
        winLossInsights: [{ id: "wli-1", outcome: "lost", reason: "competitor", count: 3, opportunityId: "opp-1", organizationId: "org-1" }] as any,
      });
      const patterns = deriveWinLossPatterns(input);
      const wlPatterns = patterns.filter((p) => p.id === "pattern-wl-competitor");
      expect(wlPatterns).toHaveLength(1);
    });

    it("returns patterns sorted by count descending", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput({
        wonDeals: [
          makeWonDeal({ reason: "expansion_fit" }),
          makeWonDeal({ opportunityId: "won-2", reason: "expansion_fit" }),
          makeWonDeal({ opportunityId: "won-3", reason: "expansion_fit" }),
          makeWonDeal({ opportunityId: "won-4", reason: "competitor" }),
          makeWonDeal({ opportunityId: "won-5", reason: "competitor" }),
        ],
      });
      const patterns = deriveWinLossPatterns(input);
      expect(patterns[0].count).toBeGreaterThanOrEqual(patterns[patterns.length - 1].count);
    });

    it("returns empty array when no data matches thresholds", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput();
      const patterns = deriveWinLossPatterns(input);
      expect(patterns).toHaveLength(0);
    });
  });

  // ─── deriveTrends ───

  describe("deriveTrends()", () => {
    it("produces activity-volume, win-rate, and strong-signals trends", () => {
      const input = makeMinimalInput({
        activities: [
          makeActivity({ loggedAt: new Date(Date.now() - 1 * 86400000).toISOString() }),
          makeActivity({ id: "act-2", loggedAt: new Date(Date.now() - 2 * 86400000).toISOString() }),
          makeActivity({ id: "act-3", loggedAt: new Date(Date.now() - 40 * 86400000).toISOString() }),
        ],
        wonDeals: [makeWonDeal(), makeWonDeal({ opportunityId: "won-2" })],
        lostDeals: [makeLostDeal()],
        signals: [
          makeSignal({ strength: "strong" }),
          makeSignal({ id: "sig-2", strength: "strong" }),
          makeSignal({ id: "sig-3", strength: "strong" }),
        ],
      });
      const trends = deriveTrends(input);
      expect(trends).toHaveLength(3);
      expect(trends[0].id).toBe("trend-activity-volume");
      expect(trends[1].id).toBe("trend-win-rate");
      expect(trends[2].id).toBe("trend-strong-signals");
    });

    it("sets activity direction to insufficient_data when total < 3", () => {
      const input = makeMinimalInput({ activities: [makeActivity()] });
      const trends = deriveTrends(input);
      const actTrend = trends.find((t) => t.id === "trend-activity-volume");
      expect(actTrend?.direction).toBe("insufficient_data");
    });

    it("computes win rate direction correctly", () => {
      const input = makeMinimalInput({
        wonDeals: [makeWonDeal()],
        lostDeals: [makeLostDeal(), makeLostDeal({ opportunityId: "lost-2" })],
      });
      const trends = deriveTrends(input);
      const winTrend = trends.find((t) => t.id === "trend-win-rate");
      expect(winTrend?.direction).toBe("down");
    });

    it("sets signal direction to up when >= 3 strong signals", () => {
      const input = makeMinimalInput({
        signals: [
          makeSignal({ strength: "strong" }),
          makeSignal({ id: "sig-2", strength: "strong" }),
          makeSignal({ id: "sig-3", strength: "strong" }),
        ],
      });
      const trends = deriveTrends(input);
      const sigTrend = trends.find((t) => t.id === "trend-strong-signals");
      expect(sigTrend?.direction).toBe("up");
    });

    it("sets signal direction to down when 0 strong signals", () => {
      const input = makeMinimalInput({ signals: [makeSignal({ strength: "weak" })] });
      const trends = deriveTrends(input);
      const sigTrend = trends.find((t) => t.id === "trend-strong-signals");
      expect(sigTrend?.direction).toBe("down");
    });
  });

  // ─── deriveInsights ───

  describe("deriveInsights()", () => {
    it("generates win_loss insight from top win pattern", () => {
      const patterns = [
        { id: "p1", patternType: "win_theme", label: "Win: expansion", labelAr: "فوز: توسع", count: 3, confidence: 0.7, evidence: [{ source: "won_deal" as const, refId: "w1", summary: "Won", summaryAr: "فوز" }], recommendation: "", recommendationAr: "", outputStatus: "recommendation" as const },
      ];
      const trends = [] as InstitutionalLearningTrend[];
      const input = makeMinimalInput();

      const insights = deriveInsights(patterns, trends, input);
      expect(insights.some((i) => i.id === "insight-top-win-theme")).toBe(true);
    });

    it("generates engagement insight from activity trend", () => {
      const patterns = [] as InstitutionalLearningPattern[];
      const trends = [
        { id: "trend-activity-volume", metric: "Act", metricAr: "نشاط", direction: "up", currentValue: 10, priorValue: 3, confidence: 0.62, evidence: [{ source: "activity" as const, refId: "a1", summary: "act", summaryAr: "نشاط" }], outputStatus: "recommendation" as const },
      ];
      const input = makeMinimalInput();

      const insights = deriveInsights(patterns, trends, input);
      expect(insights.some((i) => i.id === "insight-activity-trend")).toBe(true);
    });

    it("generates content stub insight when contentAssetRefs exist", () => {
      const patterns = [{ id: "p1", patternType: "win_theme", label: "W", labelAr: "ف", count: 1, confidence: 0.5, evidence: [{ source: "won_deal" as const, refId: "w1", summary: "W", summaryAr: "ف" }], recommendation: "", recommendationAr: "", outputStatus: "recommendation" as const }];
      const trends = [] as InstitutionalLearningTrend[];
      const input = makeMinimalInput({ contentAssetRefs: [{ id: "c1", title: "Content A" }] });

      const insights = deriveInsights(patterns, trends, input);
      expect(insights.some((i) => i.id === "insight-content-stub")).toBe(true);
    });

    it("filters out insights with no evidence", () => {
      const insights = deriveInsights([], [], makeMinimalInput());
      expect(insights).toHaveLength(0);
    });
  });

  // ─── deriveRecommendations ───

  describe("deriveRecommendations()", () => {
    it("generates recommendations from patterns", () => {
      const patterns = [
        { id: "p1", patternType: "loss_theme", label: "Loss: budget", labelAr: "خسارة: ميزانية", count: 3, confidence: 0.7, evidence: [{ source: "lost_deal" as const, refId: "l1", summary: "Lost", summaryAr: "خسارة" }], recommendation: "Review gates", recommendationAr: "راجع البوابات", outputStatus: "recommendation" as const },
      ];
      const insights: InstitutionalLearningInsight[] = [];
      const input = makeMinimalInput();

      const recs = deriveRecommendations(patterns, insights, input);
      expect(recs.length).toBeGreaterThanOrEqual(1);
      expect(recs[0].priority).toBe("high"); // loss_theme -> high
    });

    it("adds rec-scale-win-playbook when win insight exists", () => {
      const patterns = [] as InstitutionalLearningPattern[];
      const insights = [
        { id: "insight-top-win-theme", category: "win_loss" as const, title: "Win", titleAr: "فوز", narrative: "Wins", narrativeAr: "فوز", confidence: 0.7, evidence: [{ source: "won_deal" as const, refId: "w1", summary: "W", summaryAr: "ف" }], outputStatus: "recommendation" as const },
      ];
      const input = makeMinimalInput();

      const recs = deriveRecommendations(patterns, insights, input);
      expect(recs.some((r) => r.id === "rec-scale-win-playbook")).toBe(true);
    });

    it("adds rec-loss-review when losses exceed wins", () => {
      const patterns = [] as InstitutionalLearningPattern[];
      const insights: InstitutionalLearningInsight[] = [];
      const input = makeMinimalInput({
        lostDeals: [makeLostDeal(), makeLostDeal({ opportunityId: "lost-2" })],
        wonDeals: [makeWonDeal()],
      });

      const recs = deriveRecommendations(patterns, insights, input);
      expect(recs.some((r) => r.id === "rec-loss-review")).toBe(true);
    });

    it("sorts recommendations by priority (high first)", () => {
      const patterns = [
        { id: "p1", patternType: "loss_theme", label: "L1", labelAr: "خ1", count: 2, confidence: 0.65, evidence: [{ source: "lost_deal" as const, refId: "l1", summary: "L", summaryAr: "خ" }], recommendation: "R1", recommendationAr: "ت1", outputStatus: "recommendation" as const },
        { id: "p2", patternType: "win_theme", label: "W1", labelAr: "ف1", count: 2, confidence: 0.65, evidence: [{ source: "won_deal" as const, refId: "w1", summary: "W", summaryAr: "ف" }], recommendation: "R2", recommendationAr: "ت2", outputStatus: "recommendation" as const },
      ];
      const insights: InstitutionalLearningInsight[] = [];
      const input = makeMinimalInput();

      const recs = deriveRecommendations(patterns, insights, input);
      expect(recs[0].priority).toBe("high");
    });

    it("filters out recommendations with no evidence", () => {
      const patterns = [
        { id: "p1", patternType: "win_theme", label: "W", labelAr: "ف", count: 2, confidence: 0.5, evidence: [], recommendation: "R", recommendationAr: "ت", outputStatus: "recommendation" as const },
      ];
      const recs = deriveRecommendations(patterns, [], makeMinimalInput());
      expect(recs.filter((r) => r.evidence.length === 0)).toHaveLength(0);
    });
  });

  // ─── buildInstitutionalLearningSnapshot ───

  describe("buildInstitutionalLearningSnapshot()", () => {
    it("builds complete snapshot composing all derivations", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput({
        wonDeals: [
          makeWonDeal({ reason: "expansion_fit" }),
          makeWonDeal({ opportunityId: "won-2", reason: "expansion_fit" }),
          makeWonDeal({ opportunityId: "won-3", reason: "competitor" }),
        ],
        signals: [makeSignal(), makeSignal({ id: "sig-2" })],
        activities: [makeActivity()],
        proofAssets: [makeProofAsset({ linkedOpportunityIds: ["won-1", "won-2"] })],
      });

      const snapshot = buildInstitutionalLearningSnapshot(input);

      expect(snapshot.organizationId).toBe("org-1");
      expect(snapshot.disclaimer).toBeTruthy();
      expect(snapshot.overallConfidence).toBeGreaterThan(0);
      expect(snapshot.closedWonCount).toBe(3);
      expect(snapshot.patterns.length).toBeGreaterThan(0);
      expect(snapshot.trends.length).toBeGreaterThan(0);
      expect(snapshot.insights.length).toBeGreaterThan(0);
      expect(snapshot.recommendations.length).toBeGreaterThan(0);
    });

    it("handles empty input gracefully", () => {
      mockedGetWinLossPatterns.mockReturnValue([]);
      const input = makeMinimalInput();
      const snapshot = buildInstitutionalLearningSnapshot(input);

      expect(snapshot.patterns).toHaveLength(0);
      expect(snapshot.trends).toHaveLength(3); // always 3 trends
      expect(snapshot.insights).toHaveLength(0);
      expect(snapshot.recommendations).toHaveLength(0);
    });
  });
});
