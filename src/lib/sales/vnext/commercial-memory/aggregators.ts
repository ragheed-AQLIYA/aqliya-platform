import type {
  SalesCompetitorMention,
  SalesInteractionLog,
  SalesObjection,
  SalesOpportunity,
  SalesSignal,
  SalesWinLossInsight,
} from "../../types";
import { isClosedOpportunityStage } from "../../types";
import {
  extractCompetitorsFromInteractions,
  extractObjectionsFromInteractions,
  extractSignalsFromInteractions,
  extractWinLossFromInteractions,
} from "./extractors";
import type {
  CompetitorMemoryItem,
  RankedMemoryItem,
  WinLossPattern,
} from "./types";

export function getTopObjections(input: {
  objections: SalesObjection[];
  interactions: SalesInteractionLog[];
  limit?: number;
}): RankedMemoryItem[] {
  const counts = new Map<string, { count: number; source: RankedMemoryItem["source"] }>();

  for (const obj of input.objections) {
    const key = obj.category;
    const existing = counts.get(key);
    counts.set(key, {
      count: (existing?.count ?? 0) + 1,
      source: "stored",
    });
  }

  for (const [category, count] of extractObjectionsFromInteractions(input.interactions)) {
    const existing = counts.get(category);
    counts.set(category, {
      count: (existing?.count ?? 0) + count,
      source: existing ? "stored" : "interaction",
    });
  }

  const limit = input.limit ?? 5;
  return [...counts.entries()]
    .map(([category, meta]) => ({
      id: `obj-${category}`,
      label: category,
      count: meta.count,
      source: meta.source,
      category,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopSignals(input: {
  signals: SalesSignal[];
  interactions: SalesInteractionLog[];
  limit?: number;
}): RankedMemoryItem[] {
  const counts = new Map<string, { count: number; source: RankedMemoryItem["source"] }>();

  for (const signal of input.signals) {
    const key = signal.signalType;
    const weight = signal.strength === "strong" ? 2 : 1;
    const existing = counts.get(key);
    counts.set(key, {
      count: (existing?.count ?? 0) + weight,
      source: "stored",
    });
  }

  for (const [key, meta] of extractSignalsFromInteractions(input.interactions)) {
    const weight = meta.strength === "strong" ? meta.count * 2 : meta.count;
    const existing = counts.get(key);
    counts.set(key, {
      count: (existing?.count ?? 0) + weight,
      source: existing ? "stored" : "interaction",
    });
  }

  const limit = input.limit ?? 5;
  return [...counts.entries()]
    .map(([label, meta]) => ({
      id: `sig-${label}`,
      label,
      count: meta.count,
      source: meta.source,
      category: label,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getCompetitorMentions(input: {
  competitors: SalesCompetitorMention[];
  interactions: SalesInteractionLog[];
  limit?: number;
}): CompetitorMemoryItem[] {
  const merged = new Map<string, CompetitorMemoryItem>();

  for (const c of input.competitors) {
    merged.set(c.competitorName, {
      id: c.id,
      name: c.competitorName,
      count: 1,
      context: c.context,
      source: "stored",
      accountId: c.accountId,
      opportunityId: c.opportunityId,
      threatLevel: c.threatLevel,
    });
  }

  for (const [name, meta] of extractCompetitorsFromInteractions(input.interactions)) {
    const existing = merged.get(name);
    if (existing) {
      existing.count += meta.count;
    } else {
      merged.set(name, {
        id: `comp-derived-${name.replace(/\s+/g, "-").toLowerCase()}`,
        name,
        count: meta.count,
        context: meta.context,
        source: "interaction",
        accountId: meta.accountId,
        opportunityId: meta.opportunityId,
      });
    }
  }

  const limit = input.limit ?? 8;
  return [...merged.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getWinLossPatterns(input: {
  winLoss: SalesWinLossInsight[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
}): WinLossPattern[] {
  const grouped = new Map<string, WinLossPattern>();

  for (const w of input.winLoss) {
    const key = `${w.outcome}:${w.primaryReason}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
      for (const factor of w.contributingFactors ?? []) {
        if (!existing.contributingFactors.includes(factor)) {
          existing.contributingFactors.push(factor);
        }
      }
    } else {
      grouped.set(key, {
        id: w.id,
        outcome: w.outcome,
        reason: w.primaryReason,
        count: 1,
        contributingFactors: [...(w.contributingFactors ?? [])],
        source: "stored",
      });
    }
  }

  for (const opp of input.opportunities) {
    if (!isClosedOpportunityStage(opp.stage) || !opp.winLossReason) continue;
    const outcome =
      opp.stage === "Closed Won" || opp.stage === "ClosedWon" ? "won" : "lost";
    const key = `${outcome}:${opp.winLossReason}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(key, {
        id: `wl-opp-${opp.id}`,
        outcome,
        reason: opp.winLossReason,
        count: 1,
        contributingFactors: opp.risks ?? [],
        source: "opportunity",
      });
    }
  }

  for (const pattern of extractWinLossFromInteractions(input.interactions)) {
    const key = `${pattern.outcome}:${pattern.reason}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += pattern.count;
    } else {
      grouped.set(key, pattern);
    }
  }

  return [...grouped.values()].sort((a, b) => b.count - a.count);
}
