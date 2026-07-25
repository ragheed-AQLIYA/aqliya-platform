import type {
  SalesCompetitorMention,
  SalesInteractionLog,
  SalesObjection,
  SalesOpportunity,
  SalesSignal,
  SalesWinLossInsight,
} from "../../types";
import {
  getCompetitorMentions,
  getTopObjections,
  getTopSignals,
  getWinLossPatterns,
} from "./aggregators";
import { extractDecisionCriteriaFromInteractions } from "./extractors";
import type {
  CommercialMemoryPattern,
  CommercialMemorySnapshot,
  CompetitorMemoryItem,
  RankedMemoryItem,
  WinLossPattern,
} from "./types";

function buildRepeatedPatterns(input: {
  topObjections: RankedMemoryItem[];
  topSignals: RankedMemoryItem[];
  competitors: CompetitorMemoryItem[];
  winLossPatterns: WinLossPattern[];
  decisionCriteria: RankedMemoryItem[];
}): CommercialMemoryPattern[] {
  const patterns: CommercialMemoryPattern[] = [];

  for (const obj of input.topObjections.filter((o) => o.count >= 2)) {
    patterns.push({
      id: `pattern-obj-${obj.category ?? obj.label}`,
      patternType: "recurring_objection",
      label: `Recurring objection: ${obj.label}`,
      count: obj.count,
      recommendation:
        "Attach proof asset and document response — recommendation only.",
      confidence: Math.min(0.9, 0.5 + obj.count * 0.1),
    });
  }

  const strongSignalTotal = input.topSignals.reduce((sum, s) => sum + s.count, 0);
  if (strongSignalTotal >= 2) {
    patterns.push({
      id: "pattern-strong-signals",
      patternType: "strong_signal",
      label: "Multiple buying signals detected",
      count: strongSignalTotal,
      recommendation: "Prioritize follow-up while signals are active — draft only.",
      confidence: 0.75,
    });
  }

  for (const comp of input.competitors.filter((c) => c.count >= 2)) {
    patterns.push({
      id: `pattern-comp-${comp.name.replace(/\s+/g, "-").toLowerCase()}`,
      patternType: "competitor_presence",
      label: `Competitor ${comp.name} mentioned repeatedly`,
      count: comp.count,
      recommendation: "Prepare competitive proof assets with human review.",
      confidence: 0.7,
    });
  }

  for (const wl of input.winLossPatterns.filter((w) => w.outcome === "lost")) {
    patterns.push({
      id: `pattern-loss-${wl.reason}`,
      patternType: "loss_theme",
      label: `Loss theme: ${wl.reason}`,
      count: wl.count,
      recommendation: "Review qualification gates for similar deals.",
      confidence: 0.65,
    });
  }

  for (const dc of input.decisionCriteria.filter((d) => d.count >= 2)) {
    patterns.push({
      id: `pattern-dc-${dc.label}`,
      patternType: "decision_criteria",
      label: `Repeated decision criteria: ${dc.label}`,
      count: dc.count,
      recommendation: "Align proposal and proof to documented buyer criteria.",
      confidence: 0.68,
    });
  }

  return patterns;
}

export function buildCommercialMemorySnapshot(input: {
  organizationId: string;
  interactions: SalesInteractionLog[];
  opportunities: SalesOpportunity[];
  objections: SalesObjection[];
  signals: SalesSignal[];
  competitors: SalesCompetitorMention[];
  winLoss: SalesWinLossInsight[];
}): CommercialMemorySnapshot {
  const orgId = input.organizationId;
  const interactions = input.interactions.filter((i) => i.organizationId === orgId);
  const opportunities = input.opportunities.filter((o) => o.organizationId === orgId);
  const objections = input.objections.filter((o) => o.organizationId === orgId);
  const signals = input.signals.filter((s) => s.organizationId === orgId);
  const competitors = input.competitors.filter((c) => c.organizationId === orgId);
  const winLoss = input.winLoss.filter((w) => w.organizationId === orgId);

  const topObjections = getTopObjections({ objections, interactions });
  const topSignals = getTopSignals({ signals, interactions });
  const competitorItems = getCompetitorMentions({ competitors, interactions });
  const winLossPatterns = getWinLossPatterns({ winLoss, opportunities, interactions });

  const decisionCriteriaMap = extractDecisionCriteriaFromInteractions(interactions);
  const decisionCriteria: RankedMemoryItem[] = [...decisionCriteriaMap.entries()]
    .map(([label, count]) => ({
      id: `dc-${label}`,
      label,
      count,
      source: "interaction" as const,
      category: label,
    }))
    .sort((a, b) => b.count - a.count);

  const patterns = buildRepeatedPatterns({
    topObjections,
    topSignals,
    competitors: competitorItems,
    winLossPatterns,
    decisionCriteria,
  });

  return {
    organizationId: orgId,
    objectionCount: topObjections.reduce((sum, o) => sum + o.count, 0),
    signalCount: topSignals.reduce((sum, s) => sum + s.count, 0),
    competitorCount: competitorItems.length,
    winLossCount: winLossPatterns.length,
    decisionCriteriaCount: decisionCriteria.length,
    patterns,
    topObjections,
    topSignals,
    competitors: competitorItems,
    winLossPatterns,
    decisionCriteria,
  };
}
