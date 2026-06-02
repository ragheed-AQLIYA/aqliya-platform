// @ts-nocheck
import type {
  SalesAccount,
  SalesCompetitorMention,
  SalesInteractionLog,
  SalesOpportunity,
  SalesWinLossInsight,
} from "../../types";
import {
  isClosedOpportunityStage,
  canonicalizeOpportunityStage,
} from "../../types";
import type { CompetitorSignal, IndustrySignal, MarketSignal } from "./types";

const INDUSTRY_LABELS_AR: Record<string, string> = {
  "Financial Services": "الخدمات المالية",
  Government: "حكومي",
  Energy: "الطاقة",
  Technology: "التقنية",
  "Data Analytics": "تحليل البيانات",
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isWonStage(stage: SalesOpportunity["stage"]): boolean {
  return canonicalizeOpportunityStage(stage) === "closed_won";
}

function isLostStage(stage: SalesOpportunity["stage"]): boolean {
  return canonicalizeOpportunityStage(stage) === "closed_lost";
}

/** Re-score individual market signals with category and source weighting. */
export function scoreMarketSignals(signals: MarketSignal[]): MarketSignal[] {
  const categoryBoost: Partial<Record<MarketSignal["category"], number>> = {
    buying: 8,
    expansion: 6,
    regulatory: 4,
    risk: -4,
  };

  const sourceBoost: Record<MarketSignal["source"], number> = {
    stored: 5,
    interaction: 3,
    opportunity: 6,
    win_loss: 8,
  };

  return signals.map((signal) => ({
    ...signal,
    score: clampScore(
      signal.score +
        (categoryBoost[signal.category] ?? 0) +
        sourceBoost[signal.source],
    ),
  }));
}

export interface ScoreIndustrySignalsInput {
  organizationId: string;
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  winLossInsights: SalesWinLossInsight[];
  marketSignals: MarketSignal[];
}

/** Score industry-level momentum from accounts, pipeline, and outcomes. */
export function scoreIndustrySignals(
  input: ScoreIndustrySignalsInput,
): IndustrySignal[] {
  type Bucket = {
    industry: string;
    accountIds: Set<string>;
    activeOpps: number;
    pipelineValue: number;
    wins: number;
    losses: number;
    evidence: string[];
  };

  const buckets = new Map<string, Bucket>();

  function ensure(industry: string): Bucket {
    const key = industry.trim() || "Unknown";
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        industry: key,
        accountIds: new Set(),
        activeOpps: 0,
        pipelineValue: 0,
        wins: 0,
        losses: 0,
        evidence: [],
      };
      buckets.set(key, bucket);
    }
    return bucket;
  }

  for (const account of input.accounts) {
    const bucket = ensure(account.industry ?? "Unknown");
    bucket.accountIds.add(account.id);
    bucket.evidence.push(`Account: ${account.name}`);
  }

  for (const opp of input.opportunities) {
    const account = input.accounts.find((a) => a.id === opp.accountId);
    const bucket = ensure(account?.industry ?? "Unknown");
    if (isWonStage(opp.stage)) {
      bucket.wins += 1;
      bucket.evidence.push(`Won: ${opp.name}`);
    } else if (isLostStage(opp.stage)) {
      bucket.losses += 1;
      bucket.evidence.push(`Lost: ${opp.name}`);
    } else if (!isClosedOpportunityStage(opp.stage)) {
      bucket.activeOpps += 1;
      bucket.pipelineValue += opp.valueEstimate ?? 0;
      bucket.evidence.push(`Pipeline: ${opp.name}`);
    }
  }

  for (const wl of input.winLossInsights) {
    const account = input.accounts.find((a) => a.id === wl.accountId);
    const bucket = ensure(account?.industry ?? "Unknown");
    if (wl.outcome === "won") bucket.wins += 1;
    else bucket.losses += 1;
    bucket.evidence.push(`Win/loss: ${wl.primaryReason}`);
  }

  for (const signal of input.marketSignals) {
    if (!signal.accountId) continue;
    const account = input.accounts.find((a) => a.id === signal.accountId);
    if (!account?.industry) continue;
    const bucket = ensure(account.industry);
    bucket.evidence.push(`Signal: ${signal.label}`);
  }

  return [...buckets.entries()]
    .map(([industry, bucket]) => {
      const winRate =
        bucket.wins + bucket.losses > 0
          ? bucket.wins / (bucket.wins + bucket.losses)
          : 0;
      const score = clampScore(
        30 +
          bucket.accountIds.size * 8 +
          bucket.activeOpps * 6 +
          Math.min(bucket.pipelineValue / 50_000, 20) +
          winRate * 25 -
          bucket.losses * 4,
      );

      return {
        id: `mi-industry-${industry.replace(/\s+/g, "-").toLowerCase()}`,
        organizationId: input.organizationId,
        industry,
        label: `${industry} sector activity`,
        labelAr: `${INDUSTRY_LABELS_AR[industry] ?? industry} — نشاط قطاعي`,
        accountCount: bucket.accountIds.size,
        activeOpportunityCount: bucket.activeOpps,
        pipelineValue: bucket.pipelineValue,
        winCount: bucket.wins,
        lossCount: bucket.losses,
        score,
        outputStatus: "recommendation" as const,
        evidence: [...new Set(bucket.evidence)].slice(0, 6),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export interface ScoreCompetitorSignalsInput {
  organizationId: string;
  competitorMentions: SalesCompetitorMention[];
  interactions: SalesInteractionLog[];
  marketSignals: MarketSignal[];
}

/** Score competitor presence from stored mentions and interaction hits. */
export function scoreCompetitorSignals(
  input: ScoreCompetitorSignalsInput,
): CompetitorSignal[] {
  type Bucket = {
    name: string;
    mentionCount: number;
    threatLevel: "low" | "medium" | "high";
    contexts: string[];
    accountIds: Set<string>;
  };

  const buckets = new Map<string, Bucket>();

  function ensure(name: string): Bucket {
    const key = name.trim();
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        name: key,
        mentionCount: 0,
        threatLevel: "low",
        contexts: [],
        accountIds: new Set(),
      };
      buckets.set(key, bucket);
    }
    return bucket;
  }

  const threatRank = { low: 1, medium: 2, high: 3 };

  for (const mention of input.competitorMentions) {
    const bucket = ensure(mention.competitorName);
    bucket.mentionCount += 1;
    bucket.contexts.push(mention.context);
    if (mention.accountId) bucket.accountIds.add(mention.accountId);
    if (
      mention.threatLevel &&
      threatRank[mention.threatLevel] > threatRank[bucket.threatLevel]
    ) {
      bucket.threatLevel = mention.threatLevel;
    }
  }

  for (const signal of input.marketSignals) {
    if (signal.category !== "risk") continue;
    const match = signal.label.match(/Competitor:\s*(.+)/i);
    if (!match) continue;
    const bucket = ensure(match[1].trim());
    bucket.mentionCount += 1;
    if (signal.rawText) bucket.contexts.push(signal.rawText);
    if (signal.accountId) bucket.accountIds.add(signal.accountId);
  }

  for (const interaction of input.interactions) {
    const lower = interaction.summary.toLowerCase();
    if (!lower.includes("competitor") && !lower.includes("competitive"))
      continue;
    const bucket = ensure("Unnamed competitor (interaction)");
    bucket.mentionCount += 1;
    bucket.contexts.push(interaction.summary);
    bucket.accountIds.add(interaction.accountId);
    bucket.threatLevel = "medium";
  }

  return [...buckets.values()]
    .map((bucket) => {
      const threatBoost =
        bucket.threatLevel === "high"
          ? 25
          : bucket.threatLevel === "medium"
            ? 12
            : 0;
      const score = clampScore(
        20 +
          bucket.mentionCount * 12 +
          threatBoost +
          bucket.accountIds.size * 5,
      );

      return {
        id: `mi-competitor-${bucket.name.replace(/\s+/g, "-").toLowerCase()}`,
        organizationId: input.organizationId,
        competitorName: bucket.name,
        mentionCount: bucket.mentionCount,
        threatLevel: bucket.threatLevel,
        contexts: [...new Set(bucket.contexts)].slice(0, 4),
        score,
        outputStatus: "recommendation" as const,
        accountIds: [...bucket.accountIds],
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function computeOverallMarketScore(
  marketSignals: MarketSignal[],
  industrySignals: IndustrySignal[],
  competitorSignals: CompetitorSignal[],
): number {
  const signalAvg =
    marketSignals.length > 0
      ? marketSignals.reduce((sum, s) => sum + s.score, 0) /
        marketSignals.length
      : 40;
  const industryTop = industrySignals[0]?.score ?? 40;
  const competitorPressure = competitorSignals[0]?.score ?? 0;
  return clampScore(
    signalAvg * 0.5 + industryTop * 0.35 - competitorPressure * 0.15,
  );
}
