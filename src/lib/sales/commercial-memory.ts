// ─── SalesOS commercial memory (objections, signals, competitors, patterns) ───

import type {
  SalesCompetitorMention,
  SalesObjection,
  SalesOpportunity,
  SalesSignal,
  SalesWinLossInsight,
} from "./types";

export interface CommercialMemoryPattern {
  id: string;
  patternType:
    | "recurring_objection"
    | "strong_signal"
    | "competitor_presence"
    | "loss_theme";
  label: string;
  count: number;
  recommendation: string;
  confidence: number;
}

export interface CommercialMemorySnapshot {
  organizationId: string;
  objectionCount: number;
  signalCount: number;
  competitorCount: number;
  winLossCount: number;
  patterns: CommercialMemoryPattern[];
  topObjectionCategories: Array<{ category: string; count: number }>;
}

export function buildCommercialMemorySnapshot(input: {
  organizationId: string;
  objections: SalesObjection[];
  signals: SalesSignal[];
  competitors: SalesCompetitorMention[];
  winLoss: SalesWinLossInsight[];
  opportunities: SalesOpportunity[];
}): CommercialMemorySnapshot {
  const objections = input.objections.filter(
    (o) => o.organizationId === input.organizationId,
  );
  const signals = input.signals.filter(
    (s) => s.organizationId === input.organizationId,
  );
  const competitors = input.competitors.filter(
    (c) => c.organizationId === input.organizationId,
  );
  const winLoss = input.winLoss.filter(
    (w) => w.organizationId === input.organizationId,
  );

  const categoryCounts = new Map<string, number>();
  for (const obj of objections) {
    categoryCounts.set(obj.category, (categoryCounts.get(obj.category) ?? 0) + 1);
  }
  const topObjectionCategories = [...categoryCounts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const patterns: CommercialMemoryPattern[] = [];
  for (const { category, count } of topObjectionCategories.filter((c) => c.count >= 2)) {
    patterns.push({
      id: `pattern-obj-${category}`,
      patternType: "recurring_objection",
      label: `Recurring objection: ${category}`,
      count,
      recommendation:
        "Attach proof asset and document response — recommendation only.",
      confidence: Math.min(0.9, 0.5 + count * 0.1),
    });
  }

  const strongSignals = signals.filter((s) => s.strength === "strong");
  if (strongSignals.length >= 2) {
    patterns.push({
      id: "pattern-strong-signals",
      patternType: "strong_signal",
      label: "Multiple strong buying signals",
      count: strongSignals.length,
      recommendation: "Prioritize follow-up while signals are active — draft only.",
      confidence: 0.75,
    });
  }

  const competitorNames = new Map<string, number>();
  for (const c of competitors) {
    competitorNames.set(
      c.competitorName,
      (competitorNames.get(c.competitorName) ?? 0) + 1,
    );
  }
  for (const [name, count] of competitorNames.entries()) {
    if (count < 2) continue;
    patterns.push({
      id: `pattern-comp-${name}`,
      patternType: "competitor_presence",
      label: `Competitor ${name} mentioned repeatedly`,
      count,
      recommendation: "Prepare competitive proof assets with human review.",
      confidence: 0.7,
    });
  }

  const lostReasons = new Map<string, number>();
  for (const w of winLoss.filter((x) => x.outcome === "lost")) {
    lostReasons.set(w.primaryReason, (lostReasons.get(w.primaryReason) ?? 0) + 1);
  }
  for (const [reason, count] of lostReasons.entries()) {
    if (count < 1) continue;
    patterns.push({
      id: `pattern-loss-${reason}`,
      patternType: "loss_theme",
      label: `Loss theme: ${reason}`,
      count,
      recommendation: "Review qualification gates for similar deals.",
      confidence: 0.65,
    });
  }

  void input.opportunities;

  return {
    organizationId: input.organizationId,
    objectionCount: objections.length,
    signalCount: signals.length,
    competitorCount: competitors.length,
    winLossCount: winLoss.length,
    patterns,
    topObjectionCategories: topObjectionCategories.slice(0, 5),
  };
}
