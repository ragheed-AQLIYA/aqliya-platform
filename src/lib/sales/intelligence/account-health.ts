import type { SalesAccount, SalesOpportunity } from "../types";

export function buildAccountHealthScore(input: {
  account: SalesAccount;
  opportunities: SalesOpportunity[];
  interactionCount: number;
}): { score: number; level: "weak" | "fair" | "strong" | "excellent" } {
  const active = input.opportunities.filter(
    (o) => !["ClosedLost", "Archived", "Rejected"].includes(o.stage),
  ).length;
  const pipeline = input.opportunities.reduce(
    (s, o) => s + (o.valueEstimate ?? 0),
    0,
  );

  let score = 30;
  score += Math.min(25, input.interactionCount * 4);
  score += Math.min(25, active * 8);
  score += pipeline > 500_000 ? 20 : pipeline > 100_000 ? 10 : 0;
  score = Math.min(100, score);

  const level =
    score >= 80
      ? "excellent"
      : score >= 60
        ? "strong"
        : score >= 40
          ? "fair"
          : "weak";

  return { score, level };
}
