// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  buildProofEffectivenessSnapshot,
  getMostEffectiveProofAssets,
  loadProofEffectivenessSnapshot,
  readProofEffectivenessInput,
  toProofEffectivenessWidgetSummary,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
} from "../proof-effectiveness";
import {
  ensureSalesSeed,
  listObjections,
  listOpportunities,
  listProofAssets,
  listWinLossInsights,
  resetSalesStoreForTests,
} from "../../store";
import type {
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
} from "../../types";

const ORG = "org-salesos-v01";
const OWNER = "user-seed-001";

describe("proof-effectiveness v0.2", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("reads store entities read-only and builds ranked snapshot from seed", () => {
    const input = readProofEffectivenessInput(ORG);
    expect(input.proofAssets.length).toBeGreaterThan(0);
    expect(input.opportunities.length).toBeGreaterThan(0);

    const snapshot = buildProofEffectivenessSnapshot(input);

    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.disclaimerEn).toBe(PROOF_EFFECTIVENESS_DISCLAIMER_EN);
    expect(snapshot.rankedAssets.length).toBeGreaterThan(0);
    expect(snapshot.summary.totalAssets).toBe(input.proofAssets.length);
    expect(snapshot.summary.topAssetId).toBe(snapshot.rankedAssets[0]?.assetId);

    for (const row of snapshot.rankedAssets) {
      expect(row.outputStatus).toBe("recommendation");
      expect(row.rank).toBeGreaterThan(0);
      expect(row.usage.linkedOpportunityCount).toBeGreaterThanOrEqual(0);
      expect(row.evidence.length).toBeGreaterThan(0);
    }

    const ranks = snapshot.rankedAssets.map((r) => r.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("tracks usage, win contribution, objection resolution, and opp influence", () => {
    const snapshot = loadProofEffectivenessSnapshot(ORG);
    const pilotAsset = snapshot.rankedAssets.find(
      (r) => r.assetId === "sales-proof-004",
    );
    expect(pilotAsset).toBeDefined();
    expect(pilotAsset!.usage.linkedOpportunityCount).toBeGreaterThan(0);
    expect(pilotAsset!.oppInfluence.lateStageOpportunityCount).toBeGreaterThan(0);
    expect(pilotAsset!.oppInfluence.influencedPipelineValue).toBeGreaterThan(0);

    const caseStudy = snapshot.rankedAssets.find(
      (r) => r.assetId === "sales-proof-001",
    );
    expect(caseStudy).toBeDefined();
    expect(caseStudy!.usage.hasEvidenceRef).toBe(true);

    const objectionPack = snapshot.rankedAssets.find(
      (r) => r.assetId === "sales-proof-005",
    );
    expect(objectionPack).toBeDefined();
    expect(objectionPack!.assetType).toBe("objection_response");
    expect(objectionPack!.objectionResolution.linkedObjectionCount).toBeGreaterThan(0);
  });

  it("ranks assets by composite effectiveness score descending", () => {
    const snapshot = loadProofEffectivenessSnapshot(ORG);
    const scores = snapshot.rankedAssets.map((r) => r.effectivenessScore);

    for (let i = 1; i < scores.length; i += 1) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]!);
    }

    const top = getMostEffectiveProofAssets(snapshot, 3);
    expect(top.length).toBeLessThanOrEqual(3);
    expect(top[0]?.rank).toBe(1);
  });

  it("attributes win contribution from closed-won and win/loss insights", () => {
    const snapshot = loadProofEffectivenessSnapshot(ORG);
    const lostOpp = listOpportunities(ORG).find((o) => o.id === "sales-opp-008");
    expect(lostOpp?.stage).toBe("Closed Lost");

    const wl = listWinLossInsights(ORG).find(
      (w) => w.opportunityId === "sales-opp-008",
    );
    expect(wl?.outcome).toBe("lost");

    expect(snapshot.summary.aggregateAttributedWonValue).toBeGreaterThanOrEqual(0);
  });

  it("exports widget summary for Agent 6 without UI", () => {
    const snapshot = loadProofEffectivenessSnapshot(ORG);
    const widget = toProofEffectivenessWidgetSummary(snapshot, 3);

    expect(widget.outputStatus).toBe("recommendation");
    expect(widget.topAssets.length).toBeLessThanOrEqual(3);
    expect(widget.topAssets[0]?.effectivenessScore).toBeGreaterThan(0);
    expect(widget.disclaimerEn).toContain("recommendation");
  });

  it("computes pure analytics from synthetic fixtures", () => {
    const opportunities: SalesOpportunity[] = [
      {
        id: "opp-won",
        organizationId: ORG,
        accountId: "acct-1",
        name: "Won deal",
        stage: "Closed Won",
        valueEstimate: 500_000,
        ownerId: OWNER,
        createdById: OWNER,
      },
      {
        id: "opp-lost",
        organizationId: ORG,
        accountId: "acct-2",
        name: "Lost deal",
        stage: "Closed Lost",
        valueEstimate: 100_000,
        ownerId: OWNER,
        createdById: OWNER,
      },
    ];

    const proofAssets: SalesProofAsset[] = [
      {
        id: "proof-star",
        organizationId: ORG,
        title: "ROI case study",
        assetType: "case_study",
        status: "active",
        source: "manual",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        linkedOpportunityIds: ["opp-won", "opp-lost"],
        evidenceRef: "int-1",
      },
      {
        id: "proof-minor",
        organizationId: ORG,
        title: "Unused draft",
        assetType: "benchmark",
        status: "draft",
        source: "ai_draft",
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
      },
    ];

    const objections: SalesObjection[] = [
      {
        id: "obj-1",
        organizationId: ORG,
        opportunityId: "opp-won",
        category: "budget",
        description: "ROI concern",
        resolved: true,
        status: "active",
        source: "manual",
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
    ];

    const snapshot = buildProofEffectivenessSnapshot({
      organizationId: ORG,
      proofAssets,
      opportunities,
      objections,
      winLossInsights: [],
      interactions: [],
    });

    expect(snapshot.rankedAssets[0]?.assetId).toBe("proof-star");
    expect(snapshot.rankedAssets[0]?.winContribution.linkedWonCount).toBe(1);
    expect(snapshot.rankedAssets[0]?.winContribution.linkedLostCount).toBe(1);
    expect(snapshot.rankedAssets[0]?.winContribution.winRate).toBe(0.5);
    expect(snapshot.rankedAssets[0]?.winContribution.attributedWonValue).toBe(500_000);
    expect(
      snapshot.rankedAssets[0]?.objectionResolution.linkedObjectionCount,
    ).toBeGreaterThan(0);

    const minor = snapshot.rankedAssets.find((r) => r.assetId === "proof-minor");
    expect(minor?.effectivenessScore ?? 0).toBeLessThan(
      snapshot.rankedAssets[0]!.effectivenessScore,
    );
  });

  it("does not mutate store when loading snapshot", () => {
    const before = listProofAssets(ORG).map((p) => ({ ...p }));
    loadProofEffectivenessSnapshot(ORG);
    const after = listProofAssets(ORG);

    expect(after.length).toBe(before.length);
    expect(after.map((p) => p.id).sort()).toEqual(before.map((p) => p.id).sort());
  });
});
