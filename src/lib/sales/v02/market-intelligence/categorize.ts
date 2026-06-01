import type {
  SalesAccount,
  SalesCompetitorMention,
  SalesOpportunity,
} from "../../types";
import { isClosedOpportunityStage } from "../../types";
import type {
  CompetitorSignal,
  IndustrySignal,
  MarketSignal,
  MarketSignalCategory,
} from "./types";

function isWon(stage: SalesOpportunity["stage"]): boolean {
  return stage === "ClosedWon" || stage === "Closed Won";
}

function inferTrend(
  pipeline: number,
  wins: number,
  accountCount: number,
): IndustrySignal["trend"] {
  if (wins >= 1 && pipeline > 0) return "expanding";
  if (pipeline === 0 && accountCount >= 2) return "contracting";
  return "stable";
}

const INDUSTRY_AR: Record<string, string> = {
  Technology: "تقنية",
  "Financial Services": "خدمات مالية",
  "Data Analytics": "تحليلات بيانات",
  Energy: "طاقة",
  Government: "حكومي",
  Unknown: "غير محدد",
};

export function categorizeMarketSignals(
  signals: MarketSignal[],
  context: {
    accounts: SalesAccount[];
    opportunities: SalesOpportunity[];
    competitorMentions: SalesCompetitorMention[];
  },
): {
  general: MarketSignal[];
  industrySignals: IndustrySignal[];
  competitorSignals: CompetitorSignal[];
} {
  const accountById = new Map(context.accounts.map((a) => [a.id, a]));
  const industryStats = new Map<
    string,
    { accountIds: Set<string>; pipeline: number; wins: number; signalIds: string[] }
  >();

  for (const signal of signals) {
    const industry =
      signal.industry ??
      (signal.accountId
        ? accountById.get(signal.accountId)?.industry
        : undefined);
    if (!industry) continue;
    const bucket = industryStats.get(industry) ?? {
      accountIds: new Set<string>(),
      pipeline: 0,
      wins: 0,
      signalIds: [],
    };
    if (signal.accountId) bucket.accountIds.add(signal.accountId);
    bucket.signalIds.push(signal.id);
    industryStats.set(industry, bucket);
  }

  for (const opp of context.opportunities) {
    const industry = accountById.get(opp.accountId)?.industry ?? "Unknown";
    const bucket = industryStats.get(industry);
    if (!bucket) continue;
    if (!isClosedOpportunityStage(opp.stage)) {
      bucket.pipeline += opp.valueEstimate ?? 0;
    }
    if (isWon(opp.stage)) bucket.wins += 1;
  }

  const industrySignals: IndustrySignal[] = [...industryStats.entries()]
    .map(([industry, stats]) => ({
      id: `mi-ind-${industry.replace(/\s+/g, "-").toLowerCase()}`,
      category: "industry" as const,
      label: industry,
      labelAr: INDUSTRY_AR[industry] ?? industry,
      description: `${stats.accountIds.size} accounts · pipeline ${stats.pipeline}`,
      descriptionAr: `${stats.accountIds.size} حساب · مسار ${stats.pipeline}`,
      source: "account_industry" as const,
      industry,
      accountCount: stats.accountIds.size,
      pipelineValue: stats.pipeline,
      wonCount: stats.wins,
      trend: inferTrend(stats.pipeline, stats.wins, stats.accountIds.size),
      collectedAt: new Date().toISOString(),
    }))
    .sort((a, b) => b.pipelineValue - a.pipelineValue || b.accountCount - a.accountCount);

  const competitorBuckets = new Map<
    string,
    {
      mentionCount: number;
      threatLevel: "low" | "medium" | "high";
      opportunityIds: Set<string>;
      signalIds: string[];
      context: string;
    }
  >();

  for (const mention of context.competitorMentions) {
    const name = mention.competitorName;
    const bucket = competitorBuckets.get(name) ?? {
      mentionCount: 0,
      threatLevel: mention.threatLevel ?? "medium",
      opportunityIds: new Set<string>(),
      signalIds: [],
      context: mention.context,
    };
    bucket.mentionCount += 1;
    if (mention.opportunityId) bucket.opportunityIds.add(mention.opportunityId);
    if (mention.threatLevel === "high") bucket.threatLevel = "high";
    else if (mention.threatLevel === "medium" && bucket.threatLevel !== "high") {
      bucket.threatLevel = "medium";
    }
    competitorBuckets.set(name, bucket);
  }

  for (const signal of signals) {
    if (signal.category !== "competitor") continue;
    const name = signal.label;
    const bucket = competitorBuckets.get(name) ?? {
      mentionCount: 0,
      threatLevel: "medium" as const,
      opportunityIds: new Set<string>(),
      signalIds: [],
      context: signal.description,
    };
    bucket.signalIds.push(signal.id);
    if (signal.opportunityId) bucket.opportunityIds.add(signal.opportunityId);
    bucket.mentionCount += 1;
    competitorBuckets.set(name, bucket);
  }

  const competitorSignals: CompetitorSignal[] = [...competitorBuckets.entries()]
    .map(([competitorName, stats]) => ({
      id: `mi-comp-${competitorName.replace(/\s+/g, "-").toLowerCase()}`,
      category: "competitor" as const,
      label: competitorName,
      labelAr: competitorName,
      description: stats.context,
      descriptionAr: stats.context,
      source: "stored_competitor" as const,
      competitorName,
      mentionCount: stats.mentionCount,
      threatLevel: stats.threatLevel,
      affectedOpportunityIds: [...stats.opportunityIds],
      collectedAt: new Date().toISOString(),
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount);

  const general = signals.filter((s) => {
    if (s.category === "industry") {
      return !industrySignals.some((i) => i.industry === s.industry);
    }
    if (s.category === "competitor") {
      return !competitorSignals.some((c) => c.label === s.label);
    }
    return true;
  });

  const normalizedGeneral = general.map((s) => ({
    ...s,
    category: normalizeCategory(s.category),
  }));

  return { general: normalizedGeneral, industrySignals, competitorSignals };
}

function normalizeCategory(category: MarketSignalCategory): MarketSignalCategory {
  if (category === "buying" || category === "timing") return category;
  return category;
}
