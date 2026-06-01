import { describe, expect, it, beforeEach } from "@jest/globals";
import { buildStrategicRecommendationsSnapshot } from "../build-snapshot";
import { STRATEGIC_RULE_IDS } from "../rules";
import type {
  SalesAccount,
  SalesICPInsight,
  SalesInteractionLog,
  SalesOpportunity,
  SalesProofAsset,
} from "../../../types";
import { ensureSalesSeed, resetSalesStoreForTests } from "../../../store";
import { salesGetStrategicRecommendations } from "../../../services/next-action";

const NOW = new Date("2026-05-30T12:00:00.000Z");
const OWNER = "user-test-001";
const ORG = "org-salesos-v01";

function baseOpp(overrides: Partial<SalesOpportunity> = {}): SalesOpportunity {
  return {
    id: "opp-strat-1",
    organizationId: ORG,
    accountId: "acct-strat-1",
    name: "Strategic Deal",
    stage: "Proposal",
    ownerId: OWNER,
    createdById: OWNER,
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
    valueEstimate: 400_000,
    ...overrides,
  };
}

function baseAccount(overrides: Partial<SalesAccount> = {}): SalesAccount {
  return {
    id: "acct-strat-1",
    organizationId: ORG,
    name: "Strategic Account",
    status: "qualified",
    industry: "Financial Services",
    ownerId: OWNER,
    createdById: OWNER,
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
    icpFitScore: 78,
    ...overrides,
  };
}

function baseInteraction(
  overrides: Partial<SalesInteractionLog> = {},
): SalesInteractionLog {
  return {
    id: "int-1",
    organizationId: ORG,
    accountId: "acct-strat-1",
    type: "email",
    summary: "Follow-up",
    loggedAt: "2026-05-01T10:00:00.000Z",
    loggedById: OWNER,
    ...overrides,
  };
}

describe("v0.2 strategic recommendations rules", () => {
  it("surfaces industry priority from wins and pipeline", () => {
    const snapshot = buildStrategicRecommendationsSnapshot({
      organizationId: ORG,
      accounts: [
        baseAccount({ id: "a1", industry: "Energy" }),
        baseAccount({ id: "a2", industry: "Financial Services" }),
      ],
      opportunities: [
        baseOpp({
          id: "o1",
          accountId: "a1",
          stage: "Closed Won",
          name: "Energy Win",
        }),
        baseOpp({
          id: "o2",
          accountId: "a2",
          stage: "Discovery",
          valueEstimate: 250_000,
        }),
      ],
      interactions: [],
      objections: [],
      proofAssets: [],
      icpInsights: [],
      winLossInsights: [],
      now: NOW,
    });

    const industry = snapshot.byCategory.industry_priority;
    expect(industry.length).toBeGreaterThan(0);
    expect(industry[0].ruleId).toBe(STRATEGIC_RULE_IDS.INDUSTRY_PIPELINE_PRIORITY);
    expect(industry[0].confidence).toBeGreaterThan(0);
    expect(industry[0].evidence.length).toBeGreaterThan(0);
    expect(industry[0].title).toMatch(/مسودة/);
  });

  it("recommends proof when stage requirements are missing", () => {
    const snapshot = buildStrategicRecommendationsSnapshot({
      organizationId: ORG,
      accounts: [baseAccount()],
      opportunities: [baseOpp({ stage: "Proposal" })],
      interactions: [],
      proofAssets: [
        {
          id: "proof-1",
          organizationId: ORG,
          createdById: OWNER,
          createdAt: NOW.toISOString(),
          updatedAt: NOW.toISOString(),
          status: "active",
          assetType: "case_study",
          title: "Sector case study",
        } satisfies SalesProofAsset,
      ],
      objections: [],
      icpInsights: [],
      winLossInsights: [],
      now: NOW,
    });

    const proof = snapshot.byCategory.proof_to_use;
    expect(
      proof.some((r) => r.ruleId === STRATEGIC_RULE_IDS.PROOF_STAGE_GAP),
    ).toBe(true);
  });

  it("flags dormant and idle accounts for revisit", () => {
    const snapshot = buildStrategicRecommendationsSnapshot({
      organizationId: ORG,
      accounts: [
        baseAccount({ id: "d1", status: "dormant", name: "Dormant Co" }),
        baseAccount({
          id: "i1",
          status: "active",
          icpFitScore: 80,
          name: "Idle Co",
        }),
      ],
      opportunities: [],
      interactions: [
        baseInteraction({
          id: "int-old",
          accountId: "i1",
          loggedAt: "2026-04-01T10:00:00.000Z",
          summary: "Old check-in",
        }),
      ],
      proofAssets: [],
      objections: [],
      icpInsights: [],
      winLossInsights: [],
      now: NOW,
    });

    expect(snapshot.byCategory.account_revisit.length).toBeGreaterThan(0);
    expect(
      snapshot.byCategory.account_revisit.some(
        (r) =>
          r.ruleId === STRATEGIC_RULE_IDS.ACCOUNT_REVISIT_STALE ||
          r.ruleId === STRATEGIC_RULE_IDS.ACCOUNT_HIGH_ICP_STALE,
      ),
    ).toBe(true);
  });

  it("flags stalled and low-confidence opportunities at risk", () => {
    const snapshot = buildStrategicRecommendationsSnapshot({
      organizationId: ORG,
      accounts: [baseAccount()],
      opportunities: [
        baseOpp({
          confidence: {
            score: 0.45,
            rationale: "Thin evidence",
            generatedAt: NOW.toISOString(),
            outputStatus: "draft",
          },
        }),
      ],
      interactions: [
        baseInteraction({
          id: "int-stale",
          opportunityId: "opp-strat-1",
          loggedAt: "2026-05-01T10:00:00.000Z",
        }),
      ],
      proofAssets: [],
      objections: [],
      icpInsights: [],
      winLossInsights: [],
      now: NOW,
    });

    const atRisk = snapshot.byCategory.opp_at_risk;
    expect(atRisk.length).toBeGreaterThan(0);
    expect(atRisk.some((r) => r.ruleId === STRATEGIC_RULE_IDS.OPP_AT_RISK)).toBe(
      true,
    );
  });

  it("warns on ICP drift when pipeline mix diverges from stored hypothesis", () => {
    const icpInsight: SalesICPInsight = {
      id: "icp-1",
      organizationId: ORG,
      createdById: OWNER,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      status: "active",
      dimension: "industry",
      hypothesis: "Financial Services accounts show strong close rates",
      evidenceSummary: "Wins in finance segment",
    };

    const snapshot = buildStrategicRecommendationsSnapshot({
      organizationId: ORG,
      accounts: [
        baseAccount({ id: "g1", industry: "Government", icpFitScore: 30 }),
        baseAccount({ id: "g2", industry: "Government", icpFitScore: 35 }),
        baseAccount({ id: "f1", industry: "Financial Services", icpFitScore: 80 }),
      ],
      opportunities: [
        baseOpp({ id: "og1", accountId: "g1" }),
        baseOpp({ id: "og2", accountId: "g2" }),
        baseOpp({ id: "of1", accountId: "f1" }),
      ],
      interactions: [],
      proofAssets: [],
      objections: [],
      icpInsights: [icpInsight],
      winLossInsights: [],
      now: NOW,
    });

    expect(snapshot.byCategory.icp_drift.length).toBeGreaterThan(0);
    expect(snapshot.disclaimerAr).toMatch(/مسودة/);
  });

  it("includes draft disclaimers on snapshot", () => {
    const snapshot = buildStrategicRecommendationsSnapshot({
      organizationId: ORG,
      accounts: [],
      opportunities: [],
      interactions: [],
      proofAssets: [],
      objections: [],
      icpInsights: [],
      winLossInsights: [],
      now: NOW,
    });
    expect(snapshot.disclaimer).toMatch(/Draft strategic recommendations/i);
    expect(snapshot.disclaimerAr).toMatch(/مسودة/);
  });
});

describe("salesGetStrategicRecommendations service", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds snapshot from seeded org data", () => {
    const snapshot = salesGetStrategicRecommendations(ORG);
    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.recommendations.length).toBeGreaterThan(0);
    expect(snapshot.overallConfidence).toBeGreaterThan(0);
  });
});
