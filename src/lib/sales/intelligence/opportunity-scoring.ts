import type { SalesOpportunity } from "../types";

export type OpportunityScoreResult = ReturnType<typeof scoreOpportunity>;

export function scoreOpportunity(opportunity: SalesOpportunity): {
  score: number;
  factors: string[];
} {
  const factors: string[] = [];
  let score = 40;

  const stageBoost: Record<string, number> = {
    Qualification: 10,
    Discovery: 15,
    Proposal: 25,
    Negotiation: 35,
    ClosedWon: 50,
  };
  score += stageBoost[opportunity.stage] ?? 5;
  factors.push(`stage:${opportunity.stage}`);

  if ((opportunity.valueEstimate ?? 0) >= 250_000) {
    score += 15;
    factors.push("high_value");
  }

  if (opportunity.reviewStatus === "Approved") {
    score += 10;
    factors.push("review_approved");
  } else if (opportunity.reviewStatus === "InReview") {
    score += 5;
    factors.push("in_review");
  }

  return { score: Math.min(100, score), factors };
}
