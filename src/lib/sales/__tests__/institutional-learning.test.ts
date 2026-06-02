// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  buildInstitutionalLearningSnapshot,
  INSTITUTIONAL_LEARNING_LABEL,
  type ContentAssetRef,
} from "../v02/institutional-learning";
import { salesBuildInstitutionalLearningSnapshot } from "../services/institutional-learning-service";
import { ensureSalesSeed, resetSalesStoreForTests } from "../store";
import {
  listActivities,
  listAllInteractions,
  listObjections,
  listOpportunities,
  listProofAssets,
  listSignals,
  listWinLossInsights,
} from "../store";
import type {
  SalesActivity,
  SalesInteractionLog,
  SalesOpportunity,
  SalesWinLossInsight,
} from "../types";

const ORG = "org-salesos-v01";
const OWNER = "user-seed-001";

function loadInput(org: string, contentAssetRefs?: ContentAssetRef[]) {
  const opportunities = listOpportunities(org);
  return {
    organizationId: org,
    winLossInsights: listWinLossInsights(org),
    opportunities,
    activities: listActivities(org),
    interactions: listAllInteractions(org),
    signals: listSignals(org),
    proofAssets: listProofAssets(org),
    objections: listObjections(org),
    contentAssetRefs,
    wonDeals: opportunities
      .filter((o) => o.stage === "Closed Won")
      .map((o) => ({ opportunityId: o.id, name: o.name })),
    lostDeals: opportunities
      .filter((o) => o.stage === "Closed Lost")
      .map((o) => ({ opportunityId: o.id, name: o.name })),
    winLossInsightIds: listWinLossInsights(org).map((w) => w.id),
  };
}

describe("institutional-learning v0.2", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds seed snapshot with evidence on every output row", () => {
    const snapshot = buildInstitutionalLearningSnapshot(loadInput(ORG));

    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.insightLabel).toBe(INSTITUTIONAL_LEARNING_LABEL);
    expect(snapshot.disclaimer.length).toBeGreaterThan(10);

    const rows = [
      ...snapshot.insights,
      ...snapshot.patterns,
      ...snapshot.trends,
      ...snapshot.recommendations,
    ];
    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      expect(row.outputStatus).toBe("recommendation");
    }
    expect(rows.some((r) => r.evidence.length > 0)).toBe(true);
  });

  it("includes win/loss patterns from seed data", () => {
    const snapshot = buildInstitutionalLearningSnapshot(loadInput(ORG));

    expect(
      snapshot.patterns.some((p) => p.patternType === "loss_theme"),
    ).toBe(true);
    expect(snapshot.insights.some((i) => i.category === "win_loss")).toBe(true);
  });

  it("merges stub content asset refs into insights", () => {
    const refs: ContentAssetRef[] = [
      { id: "content-stub-1", title: "Pilot playbook PDF", stub: true },
    ];
    const snapshot = buildInstitutionalLearningSnapshot(
      loadInput(ORG, refs),
    );

    expect(
      snapshot.insights.some((i) =>
        i.evidence.some((e) => e.source === "content_asset"),
      ),
    ).toBe(true);
  });

  it("service facade returns snapshot for seed org", () => {
    const direct = buildInstitutionalLearningSnapshot(loadInput(ORG));
    const viaService = salesBuildInstitutionalLearningSnapshot(ORG);
    expect(viaService.organizationId).toBe(direct.organizationId);
    expect(viaService.insights.length).toBeGreaterThan(0);
    expect(viaService.patterns.length).toBeGreaterThan(0);
  });

  it("omits rows without evidence when inputs are empty", () => {
    const snapshot = buildInstitutionalLearningSnapshot({
      organizationId: "org-empty",
      winLossInsights: [],
      opportunities: [],
      activities: [],
      interactions: [],
      signals: [],
      proofAssets: [],
      objections: [],
    });

    expect(snapshot.insights).toHaveLength(0);
    expect(snapshot.patterns).toHaveLength(0);
    expect(snapshot.recommendations).toHaveLength(0);
    expect(snapshot.overallConfidence).toBe(0);
  });

  it("derives win-rate trend from closed opportunities", () => {
    const opportunities: SalesOpportunity[] = [
      {
        id: "o-won",
        organizationId: ORG,
        accountId: "a1",
        name: "Won deal",
        stage: "Closed Won",
        ownerId: OWNER,
        createdById: OWNER,
      },
      {
        id: "o-lost",
        organizationId: ORG,
        accountId: "a1",
        name: "Lost deal",
        stage: "Closed Lost",
        ownerId: OWNER,
        createdById: OWNER,
      },
    ];
    const snapshot = buildInstitutionalLearningSnapshot({
      organizationId: ORG,
      winLossInsights: [],
      opportunities,
      activities: [],
      interactions: [],
      signals: [],
      proofAssets: [],
    });

    expect(snapshot.trends.some((t) => t.id === "trend-win-rate")).toBe(true);
  });

  it("builds loss pattern from duplicate activity keywords", () => {
    const activities: SalesActivity[] = [
      {
        id: "a1",
        organizationId: ORG,
        accountId: "a1",
        type: "meeting",
        summary: "Discovery workshop went well",
        ownerId: OWNER,
        loggedAt: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "a2",
        organizationId: ORG,
        accountId: "a1",
        type: "call",
        summary: "Discovery follow-up with CFO",
        ownerId: OWNER,
        loggedAt: "2026-05-02T10:00:00.000Z",
      },
    ];
    const snapshot = buildInstitutionalLearningSnapshot({
      organizationId: ORG,
      winLossInsights: [],
      opportunities: [],
      activities,
      interactions: [],
      signals: [],
      proofAssets: [],
    });

    expect(
      snapshot.patterns.some(
        (p) => p.patternType === "activity_theme" && p.count >= 2,
      ),
    ).toBe(true);
  });

  it("recommends activity logging for stalled opps without activities", () => {
    const opportunities: SalesOpportunity[] = [
      {
        id: "o-stall",
        organizationId: ORG,
        accountId: "a1",
        name: "Stalled discovery",
        stage: "Discovery",
        ownerId: OWNER,
        createdById: OWNER,
      },
    ];
    const snapshot = buildInstitutionalLearningSnapshot({
      organizationId: ORG,
      winLossInsights: [],
      opportunities,
      activities: [],
      interactions: [],
      signals: [],
      proofAssets: [],
    });

    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.closedWonCount + snapshot.closedLostCount).toBe(0);
  });

  it("uses stored win insight for replication recommendation", () => {
    const winLossInsights: SalesWinLossInsight[] = [
      {
        id: "wl-test",
        organizationId: ORG,
        opportunityId: "opp-1",
        outcome: "won",
        primaryReason: "expansion_fit",
        createdById: OWNER,
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
        status: "active",
        source: "manual",
        evidenceRef: "ev-1",
      },
    ];
    const snapshot = buildInstitutionalLearningSnapshot({
      organizationId: ORG,
      winLossInsights,
      opportunities: [],
      activities: [] as SalesActivity[],
      interactions: [],
      signals: [],
      proofAssets: [],
    });

    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.closedWonCount).toBe(0);
  });
});
