// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  analyzeOrgProofEffectiveness,
  buildProofEffectivenessReport,
  computeProofAssetEffectiveness,
  getTopProofAssets,
  toProofEffectivenessWidgetSummary,
} from "../v02/proof-effectiveness";
import { readProofEffectivenessSnapshot } from "../v02/proof-effectiveness/store-reader";
import { ensureSalesSeed, resetSalesStoreForTests } from "../store";
import type {
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
  SalesWinLossInsight,
} from "../types";

const ORG = "org-proof-analytics-v02";
const OWNER = "user-seed-001";

function baseProofAsset(
  overrides: Partial<SalesProofAsset> & Pick<SalesProofAsset, "id" | "title">,
): SalesProofAsset {
  const now = "2026-05-30T10:00:00.000Z";
  return {
    organizationId: ORG,
    createdById: OWNER,
    createdAt: now,
    updatedAt: now,
    status: "active",
    source: "manual",
    assetType: "case_study",
    ...overrides,
  };
}

function baseOpportunity(
  overrides: Partial<SalesOpportunity> & Pick<SalesOpportunity, "id" | "name">,
): SalesOpportunity {
  return {
    organizationId: ORG,
    accountId: "acct-1",
    stage: "Proposal",
    ownerId: OWNER,
    createdById: OWNER,
    valueEstimate: 100000,
    ...overrides,
  };
}

describe("SalesOS v0.2 proof effectiveness analytics", () => {
  beforeEach(() => {
    resetSalesStoreForTests();
  });

  it("ranks assets by composite effectiveness score", () => {
    const proofAssets: SalesProofAsset[] = [
      baseProofAsset({
        id: "proof-low",
        title: "Low usage asset",
        linkedOpportunityIds: ["opp-open"],
      }),
      baseProofAsset({
        id: "proof-high",
        title: "High impact asset",
        assetType: "pilot_result",
        linkedOpportunityIds: ["opp-won", "opp-advanced"],
        linkedAccountIds: ["acct-1", "acct-2"],
      }),
    ];

    const opportunities: SalesOpportunity[] = [
      baseOpportunity({ id: "opp-open", name: "Open deal", stage: "Discovery" }),
      baseOpportunity({
        id: "opp-advanced",
        name: "Advanced deal",
        stage: "Negotiation",
        valueEstimate: 500000,
      }),
      baseOpportunity({
        id: "opp-won",
        name: "Won deal",
        stage: "Closed Won",
        valueEstimate: 750000,
      }),
    ];

    const winLossInsights: SalesWinLossInsight[] = [
      {
        id: "wl-1",
        organizationId: ORG,
        opportunityId: "opp-won",
        outcome: "won",
        primaryReason: "pilot_success",
        createdById: OWNER,
        createdAt: "2026-05-30T10:00:00.000Z",
        updatedAt: "2026-05-30T10:00:00.000Z",
        status: "active",
        source: "manual",
      },
    ];

    const ranked = computeProofAssetEffectiveness({
      organizationId: ORG,
      proofAssets,
      opportunities,
      objections: [],
      winLossInsights,
      activities: [],
    });

    expect(ranked).toHaveLength(2);
    expect(ranked[0]?.assetId).toBe("proof-high");
    expect(ranked[0]?.rank).toBe(1);
    expect(ranked[0]?.winContribution.wonDealCount).toBe(1);
    expect(ranked[0]?.opportunityInfluence.advancedStageCount).toBeGreaterThan(
      ranked[1]?.opportunityInfluence.advancedStageCount ?? 0,
    );
  });

  it("tracks objection resolution for objection_response assets", () => {
    const proofAssets: SalesProofAsset[] = [
      baseProofAsset({
        id: "proof-faq",
        title: "Security FAQ pack",
        assetType: "objection_response",
        linkedOpportunityIds: ["opp-security"],
      }),
    ];

    const objections: SalesObjection[] = [
      {
        id: "obj-resolved",
        organizationId: ORG,
        opportunityId: "opp-security",
        accountId: "acct-1",
        category: "security",
        description: "Data residency concern",
        resolved: true,
        createdById: OWNER,
        createdAt: "2026-05-30T10:00:00.000Z",
        updatedAt: "2026-05-30T10:00:00.000Z",
        status: "active",
        source: "manual",
      },
      {
        id: "obj-open",
        organizationId: ORG,
        opportunityId: "opp-security",
        accountId: "acct-1",
        category: "security",
        description: "Audit trail requirement",
        resolved: false,
        createdById: OWNER,
        createdAt: "2026-05-30T10:00:00.000Z",
        updatedAt: "2026-05-30T10:00:00.000Z",
        status: "active",
        source: "manual",
      },
    ];

    const ranked = computeProofAssetEffectiveness({
      organizationId: ORG,
      proofAssets,
      opportunities: [
        baseOpportunity({ id: "opp-security", name: "Gov bundle", stage: "Proposal" }),
      ],
      objections,
      winLossInsights: [],
      activities: [],
    });

    const row = ranked[0];
    expect(row?.objectionResolution.addressableObjectionIds).toHaveLength(2);
    expect(row?.objectionResolution.resolvedObjectionIds).toEqual(["obj-resolved"]);
    expect(row?.objectionResolution.resolutionRate).toBe(50);
  });

  it("builds org report from seeded store (read-only)", async () => {
    await ensureSalesSeed(ORG, OWNER);

    const report = analyzeOrgProofEffectiveness(ORG);

    expect(report.organizationId).toBe(ORG);
    expect(report.outputStatus).toBe("draft");
    expect(report.disclaimer.length).toBeGreaterThan(0);
    expect(report.assetCount).toBeGreaterThan(0);
    expect(report.rankedAssets[0]?.rank).toBe(1);
    expect(report.topAssetIds.length).toBeGreaterThan(0);
    expect(report.rankedAssets.every((row, index) => row.rank === index + 1)).toBe(
      true,
    );
  });

  it("exposes widget summary for Agent 6 surfaces", async () => {
    await ensureSalesSeed(ORG, OWNER);
    const report = analyzeOrgProofEffectiveness(ORG);
    const widget = toProofEffectivenessWidgetSummary(report, 2);

    expect(widget.outputStatus).toBe("draft");
    expect(widget.topAssets.length).toBeLessThanOrEqual(2);
    expect(widget.topAssets[0]?.effectivenessScore).toBeGreaterThanOrEqual(0);
  });

  it("returns empty ranking when no proof assets exist", () => {
    const report = buildProofEffectivenessReport({
      organizationId: ORG,
      proofAssets: [],
      opportunities: [],
      objections: [],
      winLossInsights: [],
      activities: [],
    });

    expect(report.assetCount).toBe(0);
    expect(report.rankedAssets).toEqual([]);
    expect(getTopProofAssets(report.rankedAssets)).toEqual([]);
  });

  it("store reader only aggregates existing entities", async () => {
    await ensureSalesSeed(ORG, OWNER);
    const snapshot = readProofEffectivenessSnapshot(ORG);

    expect(snapshot.proofAssets.length).toBeGreaterThan(0);
    expect(snapshot.opportunities.length).toBeGreaterThan(0);
    expect(snapshot.objections.length).toBeGreaterThan(0);
  });
});
