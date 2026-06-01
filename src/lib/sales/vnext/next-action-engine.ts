// ─── SalesOS vNext next-best-action engine (rule-based recommendations) ───
// Recommendations are drafts — humans decide; evidence governs.

import type {
  SalesAccount,
  SalesActivity,
  SalesMeeting,
  SalesObjection,
  SalesOpportunity,
  SalesOutreach,
  SalesProofAsset,
} from "../types";
import {
  canonicalizeOpportunityStage,
  isClosedOpportunityStage,
  normalizeOpportunityStage,
} from "../types";
import type { SalesEvidenceRef } from "../store";

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

export const NBA_RULE_IDS = {
  OPP_NO_ACTIVITY_7D: "opp_no_activity_7d",
  PROPOSAL_NO_REPLY_5D: "proposal_no_reply_5d",
  HIGH_ICP_NO_OUTREACH: "high_icp_no_outreach",
  REPEATED_OBJECTION_PROOF: "repeated_objection_proof",
  MEETING_NO_SUMMARY: "meeting_no_summary",
  CLOSED_LOST_NO_REASON: "closed_lost_no_reason",
  HIGH_VALUE_LOW_CONFIDENCE: "high_value_low_confidence",
} as const;

export const NBA_THRESHOLDS = {
  STALL_DAYS: 7,
  PROPOSAL_REPLY_DAYS: 5,
  HIGH_ICP_FIT: 75,
  HIGH_VALUE: 250_000,
  LOW_CONFIDENCE_SCORE: 55,
  LOW_PROBABILITY: 50,
  REPEATED_OBJECTION_MIN: 2,
} as const;

const MS_PER_DAY = 86_400_000;

const PRIORITY_ORDER: Record<NextActionRecommendation["priority"], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function daysSince(isoDate: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(isoDate).getTime()) / MS_PER_DAY);
}

function latestActivity(activities: SalesActivity[]): SalesActivity | undefined {
  return [...activities].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  )[0];
}

function isProposalStage(stage: ReturnType<typeof normalizeOpportunityStage>): boolean {
  return stage === "Proposal" || stage === "Pilot" || stage === "Negotiation";
}

function hasLinkedObjectionProof(
  opportunityId: string,
  proofAssets: SalesProofAsset[],
): boolean {
  return proofAssets.some(
    (asset) =>
      asset.assetType === "objection_response" &&
      asset.linkedOpportunityIds?.includes(opportunityId),
  );
}

function objectionWeight(objection: SalesObjection): number {
  if (objection.resolved) return 0;
  return Math.max(objection.frequency ?? 1, 1);
}

function countRepeatedObjections(
  objections: SalesObjection[],
): { category: string; count: number } | undefined {
  const byCategory = new Map<string, number>();
  for (const objection of objections) {
    if (objection.resolved) continue;
    const key = objection.category.trim().toLowerCase() || "general";
    byCategory.set(key, (byCategory.get(key) ?? 0) + objectionWeight(objection));
  }
  let top: { category: string; count: number } | undefined;
  for (const [category, count] of byCategory.entries()) {
    if (count >= NBA_THRESHOLDS.REPEATED_OBJECTION_MIN) {
      if (!top || count > top.count) top = { category, count };
    }
  }
  return top;
}

function isLowConfidence(opportunity: SalesOpportunity): boolean {
  if (opportunity.confidence?.score != null) {
    return opportunity.confidence.score < NBA_THRESHOLDS.LOW_CONFIDENCE_SCORE;
  }
  if (opportunity.probability != null) {
    return opportunity.probability < NBA_THRESHOLDS.LOW_PROBABILITY;
  }
  return false;
}

function hasOutreachForAccount(
  accountId: string,
  opportunityId: string,
  outreach: SalesOutreach[],
): boolean {
  return outreach.some(
    (item) =>
      item.accountId === accountId &&
      (!item.opportunityId || item.opportunityId === opportunityId),
  );
}

function pastMeetingsNeedingSummary(
  meetings: SalesMeeting[],
  opportunityId: string,
  accountId: string,
  now: Date,
): SalesMeeting[] {
  return meetings.filter((meeting) => {
    if (meeting.opportunityId && meeting.opportunityId !== opportunityId) {
      return false;
    }
    if (!meeting.opportunityId && meeting.accountId !== accountId) {
      return false;
    }
    if (new Date(meeting.scheduledAt).getTime() > now.getTime()) {
      return false;
    }
    const missingSummary = !meeting.hasSummary || !meeting.summary?.trim();
    const missingActions = !meeting.actionItems?.length;
    return missingSummary || missingActions;
  });
}

/** Evaluate vNext next-action rules for a single opportunity. */
export function evaluateNextActionRules(input: {
  opportunity: SalesOpportunity;
  account?: SalesAccount;
  activities: SalesActivity[];
  evidence: SalesEvidenceRef[];
  meetings?: SalesMeeting[];
  outreach?: SalesOutreach[];
  objections?: SalesObjection[];
  proofAssets?: SalesProofAsset[];
  now?: Date;
}): NextActionRecommendation[] {
  const now = input.now ?? new Date();
  const recs: NextActionRecommendation[] = [];
  const { opportunity } = input;
  const stage = normalizeOpportunityStage(opportunity.stage);
  const canonical = canonicalizeOpportunityStage(opportunity.stage);
  const closed = isClosedOpportunityStage(opportunity.stage);

  const latest = latestActivity(input.activities);
  const lastAt = latest?.loggedAt ?? opportunity.createdAt ?? opportunity.updatedAt;
  if (
    lastAt &&
    !closed &&
    daysSince(lastAt, now) >= NBA_THRESHOLDS.STALL_DAYS
  ) {
    recs.push({
      ruleId: NBA_RULE_IDS.OPP_NO_ACTIVITY_7D,
      title: `Follow up on ${opportunity.name}`,
      description: `No activity in ${daysSince(lastAt, now)} days — draft follow-up recommended.`,
      priority: "high",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
      dueAt: new Date(now.getTime() + 2 * MS_PER_DAY).toISOString(),
      assigneeId: opportunity.ownerId,
    });
  }

  if (isProposalStage(stage) || canonical === "in_review") {
    const proposalActivities = input.activities
      .filter((activity) => activity.summary.toLowerCase().includes("proposal"))
      .sort(
        (a, b) =>
          new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
      );
    const proposalActivity = proposalActivities[0];
    if (
      proposalActivity &&
      daysSince(proposalActivity.loggedAt, now) >=
        NBA_THRESHOLDS.PROPOSAL_REPLY_DAYS &&
      !input.activities.some(
        (activity) =>
          activity.loggedAt > proposalActivity.loggedAt &&
          (activity.summary.toLowerCase().includes("reply") ||
            activity.summary.toLowerCase().includes("response")),
      )
    ) {
      recs.push({
        ruleId: NBA_RULE_IDS.PROPOSAL_NO_REPLY_5D,
        title: "Executive follow-up on proposal",
        description:
          "Proposal sent without recorded response for 5+ days — draft executive follow-up.",
        priority: "urgent",
        opportunityId: opportunity.id,
        accountId: opportunity.accountId,
        assigneeId: opportunity.ownerId,
      });
    }
  }

  const icpFit = input.account?.icpFitScore;
  if (
    !closed &&
    icpFit != null &&
    icpFit >= NBA_THRESHOLDS.HIGH_ICP_FIT &&
    !hasOutreachForAccount(
      opportunity.accountId,
      opportunity.id,
      input.outreach ?? [],
    )
  ) {
    recs.push({
      ruleId: NBA_RULE_IDS.HIGH_ICP_NO_OUTREACH,
      title: "Start outreach for high-fit account",
      description: `ICP fit ${icpFit} with no logged outreach — draft first-touch outreach.`,
      priority: "high",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
      assigneeId: opportunity.ownerId,
    });
  }

  const repeated = countRepeatedObjections(input.objections ?? []);
  if (
    repeated &&
    !hasLinkedObjectionProof(opportunity.id, input.proofAssets ?? [])
  ) {
    recs.push({
      ruleId: NBA_RULE_IDS.REPEATED_OBJECTION_PROOF,
      title: "Attach proof asset for repeated objection",
      description: `Repeated ${repeated.category} objection (${repeated.count}x) — link objection-response proof asset.`,
      priority: "high",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
    });
  }

  const meetingsNeedingSummary = pastMeetingsNeedingSummary(
    input.meetings ?? [],
    opportunity.id,
    opportunity.accountId,
    now,
  );
  if (meetingsNeedingSummary.length > 0) {
    recs.push({
      ruleId: NBA_RULE_IDS.MEETING_NO_SUMMARY,
      title: "Create meeting summary and action items",
      description: `${meetingsNeedingSummary.length} completed meeting(s) missing summary or action items — draft capture recommended.`,
      priority: "medium",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
      assigneeId: opportunity.ownerId,
    });
  }

  if (canonical === "closed_lost" && !opportunity.winLossReason?.trim()) {
    recs.push({
      ruleId: NBA_RULE_IDS.CLOSED_LOST_NO_REASON,
      title: "Capture loss reason",
      description:
        "Closed-lost opportunity missing documented loss reason — draft capture recommended.",
      priority: "high",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
    });
  }

  const value = opportunity.valueEstimate ?? 0;
  if (
    !closed &&
    value >= NBA_THRESHOLDS.HIGH_VALUE &&
    isLowConfidence(opportunity)
  ) {
    recs.push({
      ruleId: NBA_RULE_IDS.HIGH_VALUE_LOW_CONFIDENCE,
      title: "Schedule manager review",
      description: `High value (${value.toLocaleString()}) with low confidence — draft manager review before advancing.`,
      priority: "urgent",
      opportunityId: opportunity.id,
      accountId: opportunity.accountId,
      assigneeId: opportunity.ownerId,
    });
  }

  return recs.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );
}

export function evaluateOrgNextActions(input: {
  opportunities: SalesOpportunity[];
  accounts?: SalesAccount[];
  activitiesByOpp: Map<string, SalesActivity[]>;
  evidenceByOpp: Map<string, SalesEvidenceRef[]>;
  meetings?: SalesMeeting[];
  outreach?: SalesOutreach[];
  objections?: SalesObjection[];
  proofAssets?: SalesProofAsset[];
  now?: Date;
}): NextActionRecommendation[] {
  const accountById = new Map(
    (input.accounts ?? []).map((account) => [account.id, account]),
  );
  const all: NextActionRecommendation[] = [];

  for (const opportunity of input.opportunities) {
    all.push(
      ...evaluateNextActionRules({
        opportunity,
        account: accountById.get(opportunity.accountId),
        activities: input.activitiesByOpp.get(opportunity.id) ?? [],
        evidence: input.evidenceByOpp.get(opportunity.id) ?? [],
        meetings: input.meetings,
        outreach: input.outreach,
        objections: (input.objections ?? []).filter(
          (objection) =>
            objection.opportunityId === opportunity.id ||
            objection.accountId === opportunity.accountId,
        ),
        proofAssets: input.proofAssets,
        now: input.now,
      }),
    );
  }

  return all.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );
}
