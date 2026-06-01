// ─── SalesOS opportunity intelligence helpers ───

import type { SalesOpportunity } from "../types";
import { scoreToLevel } from "@/lib/platform/intelligence";

export interface OpportunityIntelligenceSummary {
  opportunityId: string;
  winProbability: number;
  qualificationGap: string[];
  reviewRequired: boolean;
  intelligenceLabel: string;
  intelligenceLabelAr: string;
}

export function buildOpportunityIntelligence(input: {
  opportunity: SalesOpportunity;
  evidenceCount: number;
  interactionCount: number;
  hasApprovedClaims: boolean;
}): OpportunityIntelligenceSummary {
  const baseScore = input.opportunity.qualificationScore ?? 40;
  const evidenceBoost = Math.min(25, input.evidenceCount * 5);
  const interactionBoost = Math.min(15, input.interactionCount * 3);
  const approvalPenalty = input.hasApprovedClaims ? 0 : -10;

  const winProbability = Math.max(
    5,
    Math.min(95, baseScore + evidenceBoost + interactionBoost + approvalPenalty),
  );

  const qualificationGap: string[] = [];
  if (input.evidenceCount === 0) qualificationGap.push("No commercial evidence linked");
  if (!input.hasApprovedClaims) qualificationGap.push("Sensitive claims not reviewed");
  if ((input.opportunity.valueEstimate ?? 0) > 500000 && input.evidenceCount < 2) {
    qualificationGap.push("High-value deal needs additional evidence");
  }

  const level = scoreToLevel(winProbability);
  const labels: Record<typeof level, { en: string; ar: string }> = {
    "very-low": { en: "Low fit", ar: "ملاءمة منخفضة" },
    low: { en: "Early stage", ar: "مرحلة مبكرة" },
    medium: { en: "Qualified", ar: "مؤهل" },
    high: { en: "Strong pipeline", ar: "مسار قوي" },
    "very-high": { en: "Priority deal", ar: "صفقة ذات أولوية" },
  };

  return {
    opportunityId: input.opportunity.id,
    winProbability,
    qualificationGap,
    reviewRequired: !input.hasApprovedClaims || qualificationGap.length > 0,
    intelligenceLabel: labels[level].en,
    intelligenceLabelAr: labels[level].ar,
  };
}
