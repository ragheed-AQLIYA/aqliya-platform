import { beforeEach, describe, expect, it } from "@jest/globals";
import { buildICPLearningSnapshot, ICP_RECOMMENDATION_LABEL } from "../icp-learning";
import { ensureSalesSeed, resetSalesStoreForTests } from "../../store";
import {
  listAccounts,
  listAllInteractions,
  listContactsForAccount,
  listICPInsights,
  listOpportunities,
  listWinLossInsights,
} from "../../store";

const ORG = "org-salesos-v01";
const OWNER = "user-seed-001";

describe("icp-learning vnext", () => {
  beforeEach(() => {
    resetSalesStoreForTests();
    ensureSalesSeed(ORG, OWNER);
  });

  it("builds org snapshot from seed store with recommendation labels", () => {
    const accounts = listAccounts(ORG);
    const opportunities = listOpportunities(ORG);
    const contacts = accounts.flatMap((a) =>
      listContactsForAccount(ORG, a.id),
    );

    const snapshot = buildICPLearningSnapshot({
      organizationId: ORG,
      accounts,
      opportunities,
      contacts,
      icpInsights: listICPInsights(ORG),
      winLossInsights: listWinLossInsights(ORG),
      interactions: listAllInteractions(ORG),
    });

    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.currentHypothesis.insightLabel).toBe(
      ICP_RECOMMENDATION_LABEL,
    );
    expect(snapshot.bestIndustries.length).toBeGreaterThan(0);
    expect(snapshot.accountTypes.length).toBeGreaterThan(0);
    expect(snapshot.titles.length).toBeGreaterThan(0);
    expect(snapshot.storedInsights.length).toBeGreaterThan(0);
    expect(snapshot.overallConfidence).toBeGreaterThan(0);
    expect(snapshot.icpFit.length).toBe(3);

    for (const row of [
      snapshot.currentHypothesis,
      ...snapshot.bestIndustries,
      ...snapshot.winLossPatterns,
      ...snapshot.storedInsights,
    ]) {
      expect(row.insightLabel).toBe(ICP_RECOMMENDATION_LABEL);
      expect(row.confidence).toBeGreaterThan(0);
      expect(row.evidence.length).toBeGreaterThan(0);
    }
  });

  it("includes win/loss patterns from stored insights and closed opps", () => {
    const snapshot = buildICPLearningSnapshot({
      organizationId: ORG,
      accounts: listAccounts(ORG),
      opportunities: listOpportunities(ORG),
      contacts: listAccounts(ORG).flatMap((a) =>
        listContactsForAccount(ORG, a.id),
      ),
      icpInsights: listICPInsights(ORG),
      winLossInsights: listWinLossInsights(ORG),
      interactions: listAllInteractions(ORG),
    });

    expect(
      snapshot.winLossPatterns.some((p) => p.label.includes("budget_freeze")),
    ).toBe(true);
    expect(snapshot.painPoints.length).toBeGreaterThan(0);
  });
});
