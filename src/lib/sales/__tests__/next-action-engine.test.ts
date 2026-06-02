// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  evaluateNextActionRules,
  evaluateOrgNextActions,
  NBA_RULE_IDS,
  NBA_THRESHOLDS,
} from "../vnext/next-action-engine";
import type {
  SalesAccount,
  SalesActivity,
  SalesMeeting,
  SalesObjection,
  SalesOpportunity,
  SalesOutreach,
  SalesProofAsset,
} from "../types";

const NOW = new Date("2026-05-30T12:00:00.000Z");
const ORG = "org-test";
const OWNER = "user-owner";

function daysAgo(days: number): string {
  const date = new Date(NOW);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

function baseOpportunity(
  overrides: Partial<SalesOpportunity> = {},
): SalesOpportunity {
  return {
    id: "opp-1",
    organizationId: ORG,
    accountId: "acct-1",
    name: "Enterprise Deal",
    stage: "Discovery",
    ownerId: OWNER,
    createdById: OWNER,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
    ...overrides,
  };
}

function baseActivity(overrides: Partial<SalesActivity>): SalesActivity {
  return {
    id: "act-1",
    organizationId: ORG,
    accountId: "acct-1",
    opportunityId: "opp-1",
    type: "call",
    summary: "Check-in call",
    loggedAt: daysAgo(1),
    loggedById: OWNER,
    createdById: OWNER,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    status: "active",
    source: "manual",
    ...overrides,
  };
}

function baseAccount(overrides: Partial<SalesAccount> = {}): SalesAccount {
  return {
    id: "acct-1",
    organizationId: ORG,
    name: "Acme",
    status: "qualified",
    ownerId: OWNER,
    createdById: OWNER,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(60),
    ...overrides,
  };
}

describe("SalesOS vNext next-action-engine", () => {
  describe("required rules", () => {
    it("recommends follow-up when opportunity has no activity for 7+ days", () => {
      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity({ stage: "Discovery" }),
        activities: [baseActivity({ loggedAt: daysAgo(8) })],
        evidence: [],
        now: NOW,
      });

      expect(recs.some((r) => r.ruleId === NBA_RULE_IDS.OPP_NO_ACTIVITY_7D)).toBe(
        true,
      );
    });

    it("recommends executive follow-up when proposal has no reply for 5+ days", () => {
      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity({ stage: "Proposal" }),
        activities: [
          baseActivity({
            id: "proposal",
            summary: "Proposal sent to buyer",
            loggedAt: daysAgo(6),
          }),
        ],
        evidence: [],
        now: NOW,
      });

      expect(
        recs.some((r) => r.ruleId === NBA_RULE_IDS.PROPOSAL_NO_REPLY_5D),
      ).toBe(true);
    });

    it("recommends outreach when ICP fit is high and no outreach logged", () => {
      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity({ stage: "Qualified" }),
        account: baseAccount({ icpFitScore: 82 }),
        activities: [baseActivity({ loggedAt: daysAgo(1) })],
        evidence: [],
        outreach: [],
        now: NOW,
      });

      expect(
        recs.some((r) => r.ruleId === NBA_RULE_IDS.HIGH_ICP_NO_OUTREACH),
      ).toBe(true);
    });

    it("recommends proof asset when objection repeats", () => {
      const objections: SalesObjection[] = [
        {
          id: "obj-1",
          organizationId: ORG,
          accountId: "acct-1",
          opportunityId: "opp-1",
          category: "budget",
          description: "Budget freeze",
          frequency: 2,
          resolved: false,
          source: "manual",
          status: "active",
          createdAt: daysAgo(10),
          updatedAt: daysAgo(10),
        },
      ];

      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity(),
        activities: [baseActivity({ loggedAt: daysAgo(1) })],
        evidence: [],
        objections,
        proofAssets: [],
        now: NOW,
      });

      expect(
        recs.some((r) => r.ruleId === NBA_RULE_IDS.REPEATED_OBJECTION_PROOF),
      ).toBe(true);
    });

    it("recommends meeting summary when completed meeting lacks capture", () => {
      const meetings: SalesMeeting[] = [
        {
          id: "meet-1",
          organizationId: ORG,
          accountId: "acct-1",
          opportunityId: "opp-1",
          scheduledAt: daysAgo(2),
          hasSummary: false,
          loggedById: OWNER,
          createdById: OWNER,
          createdAt: daysAgo(2),
          updatedAt: daysAgo(2),
          status: "active",
          source: "manual",
        },
      ];

      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity(),
        activities: [baseActivity({ loggedAt: daysAgo(1) })],
        evidence: [],
        meetings,
        now: NOW,
      });

      expect(
        recs.some((r) => r.ruleId === NBA_RULE_IDS.MEETING_NO_SUMMARY),
      ).toBe(true);
    });

    it("recommends capturing loss reason for closed-lost without reason", () => {
      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity({
          stage: "Closed Lost",
          winLossReason: undefined,
        }),
        activities: [],
        evidence: [],
        now: NOW,
      });

      expect(
        recs.some((r) => r.ruleId === NBA_RULE_IDS.CLOSED_LOST_NO_REASON),
      ).toBe(true);
    });

    it("recommends manager review for high value with low confidence", () => {
      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity({
          valueEstimate: NBA_THRESHOLDS.HIGH_VALUE,
          confidence: {
            score: 40,
            rationale: "Limited evidence",
            generatedAt: daysAgo(1),
            outputStatus: "recommendation",
          },
        }),
        activities: [baseActivity({ loggedAt: daysAgo(1) })],
        evidence: [],
        now: NOW,
      });

      expect(
        recs.some((r) => r.ruleId === NBA_RULE_IDS.HIGH_VALUE_LOW_CONFIDENCE),
      ).toBe(true);
    });
  });

  describe("guardrails", () => {
    it("does not recommend outreach when outreach already exists", () => {
      const outreach: SalesOutreach[] = [
        {
          id: "out-1",
          organizationId: ORG,
          accountId: "acct-1",
          opportunityId: "opp-1",
          channel: "email",
          messageSummary: "Intro email sent",
          sentAt: daysAgo(3),
          loggedById: OWNER,
          createdById: OWNER,
          createdAt: daysAgo(3),
          updatedAt: daysAgo(3),
          status: "active",
          source: "manual",
        },
      ];

      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity(),
        account: baseAccount({ icpFitScore: 90 }),
        activities: [baseActivity({ loggedAt: daysAgo(1) })],
        evidence: [],
        outreach,
        now: NOW,
      });

      expect(
        recs.some((r) => r.ruleId === NBA_RULE_IDS.HIGH_ICP_NO_OUTREACH),
      ).toBe(false);
    });

    it("does not recommend proof asset when objection_response proof is linked", () => {
      const objections: SalesObjection[] = [
        {
          id: "obj-1",
          organizationId: ORG,
          accountId: "acct-1",
          opportunityId: "opp-1",
          category: "security",
          description: "Security concern",
          frequency: 2,
          resolved: false,
          source: "manual",
          status: "active",
          createdAt: daysAgo(10),
          updatedAt: daysAgo(10),
        },
      ];
      const proofAssets: SalesProofAsset[] = [
        {
          id: "proof-1",
          organizationId: ORG,
          assetType: "objection_response",
          title: "Security FAQ",
          linkedOpportunityIds: ["opp-1"],
          source: "manual",
          status: "active",
          createdAt: daysAgo(5),
          updatedAt: daysAgo(5),
        },
      ];

      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity(),
        activities: [baseActivity({ loggedAt: daysAgo(1) })],
        evidence: [],
        objections,
        proofAssets,
        now: NOW,
      });

      expect(
        recs.some((r) => r.ruleId === NBA_RULE_IDS.REPEATED_OBJECTION_PROOF),
      ).toBe(false);
    });

    it("does not recommend follow-up on closed-won opportunities", () => {
      const recs = evaluateNextActionRules({
        opportunity: baseOpportunity({ stage: "Closed Won" }),
        activities: [baseActivity({ loggedAt: daysAgo(20) })],
        evidence: [],
        now: NOW,
      });

      expect(
        recs.some((r) => r.ruleId === NBA_RULE_IDS.OPP_NO_ACTIVITY_7D),
      ).toBe(false);
    });
  });

  describe("evaluateOrgNextActions", () => {
    it("merges and sorts recommendations across opportunities", () => {
      const opportunities = [
        baseOpportunity({ id: "opp-a", stage: "Closed Lost" }),
        baseOpportunity({
          id: "opp-b",
          stage: "Proposal",
          accountId: "acct-2",
        }),
      ];

      const recs = evaluateOrgNextActions({
        opportunities,
        activitiesByOpp: new Map([
          [
            "opp-b",
            [
              baseActivity({
                id: "prop-b",
                opportunityId: "opp-b",
                accountId: "acct-2",
                summary: "Proposal delivered",
                loggedAt: daysAgo(7),
              }),
            ],
          ],
        ]),
        evidenceByOpp: new Map([
          ["opp-a", []],
          ["opp-b", []],
        ]),
        now: NOW,
      });

      expect(recs.length).toBeGreaterThanOrEqual(2);
      expect(recs[0]?.priority).toBe("urgent");
    });
  });
});
