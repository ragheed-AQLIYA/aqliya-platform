// ─── SalesOS next best action engine (rule-based recommendations) ───
// Recommendations are drafts — human decides.

import type { SalesActivity, SalesOpportunity } from "./types";
import { canonicalizeOpportunityStage } from "./types";
import type { SalesEvidenceRef } from "./store";

export interface NextActionRecommendation {
  ruleId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  opportunityId?: string;
  accountId?: string;
  dueAt?: string;
  assigneeId?: string;
}

const MS_PER_DAY = 86400000;

function daysSince(isoDate: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(isoDate).getTime()) / MS_PER_DAY);
}

function latestActivity(activities: SalesActivity[]): SalesActivity | undefined {
  return [...activities].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  )[0];
}

/** Evaluate v0.1 next-action rules for a single opportunity. */
export function evaluateNextActionRules(input: {
  opportunity: SalesOpportunity;
  activities: SalesActivity[];
  evidence: SalesEvidenceRef[];
  now?: Date;
}): NextActionRecommendation[] {
  const now = input.now ?? new Date();
  const recs: NextActionRecommendation[] = [];
  const stage = canonicalizeOpportunityStage(input.opportunity.stage);
  const { opportunity } = input;

  if (stage === "new" && input.activities.length === 0) {
    recs.push({
      ruleId: "new_no_activity",
      title: "Log first commercial activity",
      description:
        "New opportunity has no recorded activity — capture discovery touchpoint.",
      priority: "high",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
      assigneeId: opportunity.ownerId,
    });
  }

  if (stage === "qualified" && input.evidence.length === 0) {
    recs.push({
      ruleId: "qualified_no_evidence",
      title: "Link qualification evidence",
      description:
        "Qualified stage requires linked qualification evidence before advancing.",
      priority: "high",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
    });
  }

  const latest = latestActivity(input.activities);
  const lastAt = latest?.loggedAt ?? opportunity.createdAt;
  if (
    lastAt &&
    !["closed_won", "closed_lost"].includes(stage) &&
    daysSince(lastAt, now) >= 7
  ) {
    recs.push({
      ruleId: "stalled_opportunity_7d",
      title: `Follow up on ${opportunity.name}`,
      description: `No activity in ${daysSince(lastAt, now)} days — draft follow-up recommended.`,
      priority: "high",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
      dueAt: new Date(now.getTime() + 2 * MS_PER_DAY).toISOString(),
    });
  }

  if (
    (stage === "proposal" || stage === "in_review") &&
    input.activities.some((a) => a.summary.toLowerCase().includes("proposal"))
  ) {
    const proposalActivity = input.activities.find((a) =>
      a.summary.toLowerCase().includes("proposal"),
    );
    if (
      proposalActivity &&
      daysSince(proposalActivity.loggedAt, now) >= 5 &&
      !input.activities.some(
        (a) =>
          a.loggedAt > proposalActivity.loggedAt &&
          a.summary.toLowerCase().includes("reply"),
      )
    ) {
      recs.push({
        ruleId: "proposal_no_response_5d",
        title: "Executive follow-up on proposal",
        description: "Proposal sent without recorded response for 5+ days.",
        priority: "urgent",
        opportunityId: opportunity.id,
        accountId: opportunity.accountId,
      });
    }
  }

  if (stage === "closed_lost" && !opportunity.winLossReason) {
    recs.push({
      ruleId: "closed_lost_capture_reason",
      title: "Capture loss reason",
      description: "Closed-lost opportunity missing documented loss reason.",
      priority: "high",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
    });
  }

  return recs;
}

export function evaluateOrgNextActions(input: {
  opportunities: SalesOpportunity[];
  activitiesByOpp: Map<string, SalesActivity[]>;
  evidenceByOpp: Map<string, SalesEvidenceRef[]>;
}): NextActionRecommendation[] {
  const all: NextActionRecommendation[] = [];
  for (const opp of input.opportunities) {
    all.push(
      ...evaluateNextActionRules({
        opportunity: opp,
        activities: input.activitiesByOpp.get(opp.id) ?? [],
        evidence: input.evidenceByOpp.get(opp.id) ?? [],
      }),
    );
  }
  const order = { urgent: 0, high: 1, medium: 2, low: 3 };
  return all.sort((a, b) => order[a.priority] - order[b.priority]);
}

/** Flat-input wrapper for test compatibility. */
export function generateNextActions(input: {
  organizationId: string;
  opportunities: SalesOpportunity[];
  activities: SalesActivity[];
  meetings: unknown[];
  outreach: unknown[];
  objections: unknown[];
  proofAssets: unknown[];
}): NextActionRecommendation[] {
  const all: NextActionRecommendation[] = [];
  for (const opp of input.opportunities) {
    all.push(
      ...evaluateNextActionRules({
        opportunity: opp,
        activities: input.activities,
        evidence: [],
      }),
    );
  }
  return all;
}
