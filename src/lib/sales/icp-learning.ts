// ─── SalesOS ICP learning engine (hypothesis, evidence, confidence) ───

import type {
  SalesAccount,
  SalesICPDimension,
  SalesICPInsight,
  SalesOpportunity,
} from "./types";
import { draftAIConfidence } from "./entity-factory";

export interface ICPLearningResult {
  hypothesis: string;
  evidenceSummary: string;
  confidence: number;
  outputStatus: "recommendation";
  dimension: SalesICPDimension;
  recommendedAdjustments: string[];
  disclaimer: string;
}

const DISCLAIMER =
  "AI-assisted / evidence-based recommendation only. Human review required before acting on ICP adjustments.";

export function synthesizeICPHypothesis(input: {
  account: SalesAccount;
  opportunities: SalesOpportunity[];
  existingInsights: SalesICPInsight[];
}): ICPLearningResult {
  const industry = input.account.industry ?? "Unknown";
  const oppCount = input.opportunities.length;
  const avgQual =
    oppCount > 0
      ? input.opportunities.reduce(
          (s, o) => s + (o.qualificationScore ?? 50),
          0,
        ) / oppCount
      : (input.account.icpFitScore ?? 50);

  const hypothesis =
    oppCount > 0
      ? `${industry} accounts with ${oppCount} active opportunity(ies) show average qualification ${Math.round(avgQual)}`
      : `${industry} account profile — insufficient opportunity evidence for strong ICP claim`;

  const evidenceSummary =
    oppCount > 0
      ? `${oppCount} opportunities; industry=${industry}; icpFit=${input.account.icpFitScore ?? "n/a"}`
      : `Account metadata only: industry=${industry}, status=${input.account.status}`;

  const confidence = Math.min(
    0.85,
    0.35 + oppCount * 0.12 + (input.existingInsights.length > 0 ? 0.1 : 0),
  );

  return {
    hypothesis,
    evidenceSummary,
    confidence,
    outputStatus: "recommendation",
    dimension: "industry",
    recommendedAdjustments: [
      confidence < 0.6
        ? "Collect more closed-won/closed-lost evidence before adjusting ICP"
        : "Validate hypothesis with stakeholder review before outbound expansion",
      avgQual < 60
        ? "Tighten qualification criteria for this segment"
        : "Document winning patterns as proof assets",
    ],
    disclaimer: DISCLAIMER,
  };
}

export function mergeICPInsightFromLearning(
  organizationId: string,
  createdById: string,
  accountId: string,
  learning: ICPLearningResult,
): Omit<SalesICPInsight, "id" | "createdAt" | "updatedAt"> {
  return {
    organizationId,
    accountId,
    dimension: learning.dimension,
    hypothesis: learning.hypothesis,
    evidenceSummary: learning.evidenceSummary,
    recommendation: learning.recommendedAdjustments.join("; "),
    createdById,
    status: "active",
    source: "ai_draft",
    confidence: draftAIConfidence(learning.confidence, learning.evidenceSummary),
  };
}

export function buildICPLearningFromOrg(input: {
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
}): ICPLearningResult[] {
  return input.accounts.slice(0, 5).map((account) =>
    synthesizeICPHypothesis({
      account,
      opportunities: input.opportunities.filter((o) => o.accountId === account.id),
      existingInsights: [],
    }),
  );
}
