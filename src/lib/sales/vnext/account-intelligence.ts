// ─── SalesOS account intelligence helpers ───

import type { SalesAccount, SalesOpportunity } from "../types";
import {
  calculateOverallScore,
  scoreToLevel,
  type IntelligenceSignal,
} from "@/lib/platform/intelligence";

export interface AccountIntelligenceSummary {
  accountId: string;
  healthScore: number;
  healthLevel: ReturnType<typeof scoreToLevel>;
  activeOpportunities: number;
  pipelineValue: number;
  signals: IntelligenceSignal[];
  nextActions: string[];
}

export function buildAccountIntelligence(input: {
  account: SalesAccount;
  opportunities: SalesOpportunity[];
  interactionCount: number;
  daysSinceLastInteraction?: number;
}): AccountIntelligenceSummary {
  const activeOpportunities = input.opportunities.filter(
    (o) => !["ClosedLost", "Archived", "Rejected"].includes(o.stage),
  ).length;
  const pipelineValue = input.opportunities.reduce(
    (sum, o) => sum + (o.valueEstimate ?? 0),
    0,
  );

  const engagementScore =
    input.interactionCount === 0
      ? 20
      : Math.min(90, 40 + input.interactionCount * 5);
  const recencyScore =
    input.daysSinceLastInteraction === undefined
      ? 50
      : input.daysSinceLastInteraction <= 14
        ? 85
        : input.daysSinceLastInteraction <= 30
          ? 60
          : 30;

  const signals: IntelligenceSignal[] = [
    {
      id: `${input.account.id}-engagement`,
      dimension: "pipeline_quality",
      level: scoreToLevel(engagementScore),
      value: engagementScore,
      confidence: 0.75,
      label: "Engagement depth",
      entityId: input.account.id,
      entityType: "SalesAccount",
      module: "sales",
      timestamp: new Date(),
      source: "derived",
    },
    {
      id: `${input.account.id}-recency`,
      dimension: "operational_urgency",
      level: scoreToLevel(recencyScore),
      value: recencyScore,
      confidence: 0.7,
      label: "Interaction recency",
      entityId: input.account.id,
      entityType: "SalesAccount",
      module: "sales",
      timestamp: new Date(),
      source: "derived",
    },
  ];

  const healthScore = calculateOverallScore(signals);
  const nextActions: string[] = [];
  if (input.interactionCount === 0) nextActions.push("Log first interaction");
  if (activeOpportunities === 0) nextActions.push("Qualify new opportunity");
  if (recencyScore < 50) nextActions.push("Schedule follow-up meeting");

  return {
    accountId: input.account.id,
    healthScore,
    healthLevel: scoreToLevel(healthScore),
    activeOpportunities,
    pipelineValue,
    signals,
    nextActions,
  };
}
