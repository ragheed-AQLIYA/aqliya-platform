import { beforeEach, describe, expect, it } from "@jest/globals";
import { ensureSalesSeed, resetSalesStoreForTests } from "@/lib/sales/store";
import type {
  SalesAccount,
  SalesOpportunity,
  SalesProofAsset,
} from "@/lib/sales/types";
import {
  buildProofEffectivenessWaveBSnapshot,
  computeIndustryStageRelevance,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
} from "../proof-effectiveness";
import {
  salesBuildProofEffectivenessWaveB,
  salesGetProofEffectivenessForOpportunity,
} from "../../services/proof-effectiveness-service";

const ORG = "org-salesos-v01";
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

function baseOpp(
  overrides: Partial<SalesOpportunity> & Pick<SalesOpportunity, "id" | "name">,
): SalesOpportunity {
  return {
    organizationId: ORG,
    accountId: "acct-1",
    stage: "Proposal",
    ownerId: OWNER,
    createdById: OWNER,
    ...overrides,
  };
}

describe("proof-effectiveness vnext Wave B", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds Wave B snapshot with most effective, underused, gaps, recommendations", () => {
    const waveB = salesBuildProofEffectivenessWaveB(ORG);

    expect(waveB.organizationId).toBe(ORG);
    expect(waveB.disclaimerEn).toBe(PROOF_EFFECTIVENESS_DISCLAIMER_EN);
    expect(waveB.outputStatus).toBe("recommendation");
    expect(waveB.mostEffective.length).toBeGreaterThan(0);
    expect(waveB.snapshot.rankedAssets.length).toBeGreaterThan(0);

    for (const row of waveB.mostEffective) {
      expect(row.rank).toBeGreaterThan(0);
      expect(row.usage.linkedOpportunityCount).toBeGreaterThanOrEqual(0);
    }

    expect(Array.isArray(waveB.underused)).toBe(true);
    expect(Array.isArray(waveB.gaps)).toBe(true);
    expect(Array.isArray(waveB.recommendations)).toBe(true);
    expect(waveB.recommendations.length).toBeGreaterThan(0);
  });

  it("computes industry and stage relevance from linked context", () => {
    const accounts: SalesAccount[] = [
      {
        id: "acct-energy",
        organizationId: ORG,
        name: "Energy Co",
        industry: "Energy",
        status: "active",
        ownerId: OWNER,
        createdById: OWNER,
        createdAt: "2026-05-30T10:00:00.000Z",
        updatedAt: "2026-05-30T10:00:00.000Z",
      },
    ];
    const opportunities = [
      baseOpp({
        id: "opp-late",
        name: "Late deal",
        accountId: "acct-energy",
        stage: "Negotiation",
        valueEstimate: 200_000,
      }),
    ];
    const asset = baseProofAsset({
      id: "proof-energy",
      title: "Energy ROI",
      linkedOpportunityIds: ["opp-late"],
      linkedAccountIds: ["acct-energy"],
    });

    const rel = computeIndustryStageRelevance(asset, opportunities, accounts);
    expect(rel.linkedIndustries).toContain("Energy");
    expect(rel.linkedStages).toContain("negotiation");
    expect(rel.relevanceScore).toBeGreaterThan(0);
  });

  it("detects industry gaps when pipeline has uncovered sectors", () => {
    const accounts: SalesAccount[] = [
      {
        id: "a1",
        organizationId: ORG,
        name: "FS",
        industry: "Financial Services",
        status: "active",
        ownerId: OWNER,
        createdById: OWNER,
        createdAt: "2026-05-30T10:00:00.000Z",
        updatedAt: "2026-05-30T10:00:00.000Z",
      },
    ];
    const opportunities = [
      baseOpp({
        id: "o1",
        name: "FS deal",
        accountId: "a1",
        stage: "Proposal",
      }),
    ];

    const waveB = buildProofEffectivenessWaveBSnapshot({
      organizationId: ORG,
      proofAssets: [],
      opportunities,
      objections: [],
      winLossInsights: [],
      interactions: [],
      accounts,
    });

    expect(waveB.industryStageSummary.topIndustriesWithoutProof).toContain(
      "Financial Services",
    );
    expect(waveB.gaps.some((g) => g.kind === "gap")).toBe(true);
  });

  it("scopes opportunity detail to linked proof assets", () => {
    const scoped = salesGetProofEffectivenessForOpportunity(
      ORG,
      "sales-opp-004",
    );
    const linkedIds = scoped.mostEffective.map((r) => r.assetId);
    expect(linkedIds.length).toBeGreaterThan(0);
    expect(linkedIds).toContain("sales-proof-004");
  });

  it("tracks objection resolution and win contribution on synthetic fixtures", () => {
    const waveB = buildProofEffectivenessWaveBSnapshot({
      organizationId: ORG,
      proofAssets: [
        baseProofAsset({
          id: "proof-star",
          title: "ROI pack",
          linkedOpportunityIds: ["opp-won", "opp-lost"],
          evidenceRef: "ev-1",
        }),
      ],
      opportunities: [
        baseOpp({
          id: "opp-won",
          name: "Won",
          stage: "Closed Won",
          valueEstimate: 400_000,
        }),
        baseOpp({
          id: "opp-lost",
          name: "Lost",
          stage: "Closed Lost",
          valueEstimate: 50_000,
        }),
      ],
      objections: [
        {
          id: "obj-1",
          organizationId: ORG,
          opportunityId: "opp-won",
          category: "budget",
          description: "ROI",
          resolved: true,
          status: "active",
          source: "manual",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      winLossInsights: [],
      interactions: [],
      accounts: [],
    });

    const top = waveB.mostEffective[0];
    expect(top?.assetId).toBe("proof-star");
    expect(top?.winContribution.linkedWonCount).toBe(1);
    expect(top?.objectionResolution.resolvedObjectionCount).toBeGreaterThan(0);
  });
});
