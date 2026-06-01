import { describe, expect, it, beforeEach } from "@jest/globals";
import { buildStrategicRecommendationsSnapshot } from "@/lib/sales/v02/strategic-recommendations";
import { STRATEGIC_RULE_IDS } from "@/lib/sales/v02/strategic-recommendations/rules";
import type {
  SalesAccount,
  SalesObjection,
  SalesOpportunity,
} from "@/lib/sales/types";
import { ensureSalesSeed, resetSalesStoreForTests } from "@/lib/sales/store";
import {
  salesBuildCommercialRecommendations,
  salesGetCommercialRecommendations,
} from "@/lib/sales/services/commercial-recommendations-service";
import {
  toCommercialRecommendation,
  transformStrategicToCommercialSnapshot,
} from "../commercial-recommendations";

const NOW = new Date("2026-05-30T12:00:00.000Z");
const OWNER = "user-test-001";
const ORG = "org-salesos-v01";

function baseOpp(overrides: Partial<SalesOpportunity> = {}): SalesOpportunity {
  return {
    id: "opp-comm-1",
    organizationId: ORG,
    accountId: "acct-comm-1",
    name: "Commercial Deal",
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
    id: "acct-comm-1",
    organizationId: ORG,
    name: "Commercial Account",
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

describe("commercial-recommendations vnext facade", () => {
  it("maps strategic categories to Wave B commercial taxonomy", () => {
    const strategic = buildStrategicRecommendationsSnapshot({
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

    const commercial = transformStrategicToCommercialSnapshot(strategic);
    expect(commercial.notAutonomous).toBe(true);
    expect(commercial.byCategory.industries.length).toBeGreaterThan(0);
    const row = commercial.byCategory.industries[0];
    expect(row.recommendedAction).toMatch(/Review vertical/i);
    expect(row.source).toBeTruthy();
    expect(row.confidence).toBeGreaterThan(0);
    expect(row.evidence.length).toBeGreaterThan(0);
    expect(row.reasoning).toBeTruthy();
    expect(commercial.disclaimer).toMatch(/not autonomous/i);
  });

  it("surfaces messaging themes from recurring objections", () => {
    const objection: SalesObjection = {
      id: "obj-1",
      organizationId: ORG,
      accountId: "acct-comm-1",
      opportunityId: "opp-comm-1",
      source: "manual",
      status: "active",
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      category: "pricing",
      description: "Budget pushback on pilot",
      frequency: 3,
      resolved: false,
    };

    const commercial = salesBuildCommercialRecommendations({
      organizationId: ORG,
      accounts: [baseAccount()],
      opportunities: [baseOpp()],
      interactions: [],
      objections: [objection, { ...objection, id: "obj-2" }],
      proofAssets: [],
      icpInsights: [],
      winLossInsights: [],
      now: NOW,
    });

    expect(commercial.byCategory.messaging_themes.length).toBeGreaterThan(0);
    const theme = commercial.byCategory.messaging_themes[0];
    expect(theme.ruleId).toBe(STRATEGIC_RULE_IDS.MESSAGING_RECURRING_OBJECTION);
    expect(theme.recommendedActionAr.length).toBeGreaterThan(0);
  });

  it("prefixes commercial ids from strategic rows", () => {
    const strategic = buildStrategicRecommendationsSnapshot({
      organizationId: ORG,
      accounts: [baseAccount({ status: "dormant" })],
      opportunities: [],
      interactions: [],
      proofAssets: [],
      objections: [],
      icpInsights: [],
      winLossInsights: [],
      now: NOW,
    });
    const first = strategic.recommendations[0];
    if (!first) return;
    const mapped = toCommercialRecommendation(first);
    expect(mapped.id.startsWith("comm-")).toBe(true);
    expect(mapped.category).toBe("accounts_revisit");
  });
});

describe("salesGetCommercialRecommendations service", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds commercial snapshot from seeded org data", () => {
    const snapshot = salesGetCommercialRecommendations(ORG);
    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.recommendations.length).toBeGreaterThan(0);
    expect(snapshot.overallConfidence).toBeGreaterThan(0);
    expect(snapshot.recommendationLabel).toMatch(/evidence-based/i);
  });
});
