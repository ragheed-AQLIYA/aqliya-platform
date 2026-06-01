// ─── SalesOS commercial memory (vNext rules — no real AI) ───
// Derives objections, signals, competitors, decision criteria, win/loss themes,
// and repeated patterns from interactions + opportunities + stored intelligence.

import type {
  SalesCompetitorMention,
  SalesInteractionLog,
  SalesObjection,
  SalesOpportunity,
  SalesSignal,
  SalesWinLossInsight,
} from "../types";
import { isClosedOpportunityStage } from "../types";

export interface CommercialMemoryPattern {
  id: string;
  patternType:
    | "recurring_objection"
    | "strong_signal"
    | "competitor_presence"
    | "loss_theme"
    | "decision_criteria";
  label: string;
  count: number;
  recommendation: string;
  confidence: number;
}

export interface RankedMemoryItem {
  id: string;
  label: string;
  count: number;
  source: "stored" | "interaction" | "opportunity";
  category?: string;
}

export interface CompetitorMemoryItem {
  id: string;
  name: string;
  count: number;
  context: string;
  source: "stored" | "interaction";
  accountId?: string;
  opportunityId?: string;
  threatLevel?: "low" | "medium" | "high";
}

export interface WinLossPattern {
  id: string;
  outcome: "won" | "lost";
  reason: string;
  count: number;
  contributingFactors: string[];
  source: "stored" | "opportunity" | "interaction";
}

export interface CommercialMemorySnapshot {
  organizationId: string;
  objectionCount: number;
  signalCount: number;
  competitorCount: number;
  winLossCount: number;
  decisionCriteriaCount: number;
  patterns: CommercialMemoryPattern[];
  topObjections: RankedMemoryItem[];
  topSignals: RankedMemoryItem[];
  competitors: CompetitorMemoryItem[];
  winLossPatterns: WinLossPattern[];
  decisionCriteria: RankedMemoryItem[];
}

const OBJECTION_RULES: Array<{ key: string; keywords: string[] }> = [
  { key: "budget", keywords: ["budget", "roi", "cost", "pricing", "freeze", "frozen"] },
  { key: "timing", keywords: ["timing", "delayed", "procurement", "cycle", "q3", "postpone"] },
  {
    key: "security",
    keywords: ["security", "residency", "compliance", "governance", "questionnaire"],
  },
  { key: "approval", keywords: ["approver", "cfo", "sign-off", "signoff", "approval"] },
  { key: "competitor", keywords: ["competitive", "incumbent", "rfp", "legacy grc"] },
];

const SIGNAL_RULES: Array<{ key: string; keywords: string[]; strength: "moderate" | "strong" }> =
  [
    { key: "renewal_intent", keywords: ["renewal", "renew"], strength: "strong" },
    { key: "executive_sponsor", keywords: ["executive sponsor", "sponsor intro"], strength: "strong" },
    { key: "pilot_progress", keywords: ["pilot kickoff", "pilot checkpoint", "success criteria"], strength: "strong" },
    { key: "contract_momentum", keywords: ["contract redlines", "commercial review"], strength: "moderate" },
    { key: "evidence_engagement", keywords: ["evidence pack", "qualification template"], strength: "moderate" },
  ];

const COMPETITOR_NAMES = [
  "SAP",
  "Oracle",
  "Salesforce",
  "Microsoft",
  "Legacy GRC Suite",
  "Spreadsheet workflow",
];

const DECISION_CRITERIA_RULES: Array<{ key: string; keywords: string[] }> = [
  { key: "governance", keywords: ["governance requirements", "governance"] },
  { key: "security_review", keywords: ["security questionnaire", "security review"] },
  { key: "success_criteria", keywords: ["success criteria", "pilot success"] },
  { key: "qualification", keywords: ["qualification template", "qualification"] },
  { key: "approver_chain", keywords: ["approver identified", "cfo", "stakeholders identified"] },
];

function normalizeText(text: string): string {
  return text.toLowerCase();
}

function matchKeywords(text: string, keywords: string[]): boolean {
  const lower = normalizeText(text);
  return keywords.some((k) => lower.includes(k));
}

function bumpCount(map: Map<string, number>, key: string, delta = 1): void {
  map.set(key, (map.get(key) ?? 0) + delta);
}

export function extractObjectionsFromInteractions(
  interactions: SalesInteractionLog[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const interaction of interactions) {
    for (const rule of OBJECTION_RULES) {
      if (matchKeywords(interaction.summary, rule.keywords)) {
        bumpCount(counts, rule.key);
      }
    }
  }
  return counts;
}

export function extractSignalsFromInteractions(
  interactions: SalesInteractionLog[],
): Map<string, { count: number; strength: "moderate" | "strong" }> {
  const signals = new Map<string, { count: number; strength: "moderate" | "strong" }>();
  for (const interaction of interactions) {
    for (const rule of SIGNAL_RULES) {
      if (matchKeywords(interaction.summary, rule.keywords)) {
        const existing = signals.get(rule.key);
        if (existing) {
          existing.count += 1;
          if (rule.strength === "strong") existing.strength = "strong";
        } else {
          signals.set(rule.key, { count: 1, strength: rule.strength });
        }
      }
    }
  }
  return signals;
}

export function extractCompetitorsFromInteractions(
  interactions: SalesInteractionLog[],
): Map<string, { count: number; context: string; accountId?: string; opportunityId?: string }> {
  const mentions = new Map<
    string,
    { count: number; context: string; accountId?: string; opportunityId?: string }
  >();

  for (const interaction of interactions) {
    const lower = normalizeText(interaction.summary);
    for (const name of COMPETITOR_NAMES) {
      if (lower.includes(normalizeText(name))) {
        const existing = mentions.get(name);
        if (existing) {
          existing.count += 1;
        } else {
          mentions.set(name, {
            count: 1,
            context: interaction.summary.slice(0, 120),
            accountId: interaction.accountId,
            opportunityId: interaction.opportunityId,
          });
        }
      }
    }
    if (
      lower.includes("competitive landscape") ||
      lower.includes("competitive") ||
      lower.includes("incumbent")
    ) {
      const label = lower.includes("competitive landscape")
        ? "Competitive landscape"
        : "Competitive mention";
      const existing = mentions.get(label);
      if (existing) {
        existing.count += 1;
      } else {
        mentions.set(label, {
          count: 1,
          context: interaction.summary.slice(0, 120),
          accountId: interaction.accountId,
          opportunityId: interaction.opportunityId,
        });
      }
    }
  }
  return mentions;
}

export function extractDecisionCriteriaFromInteractions(
  interactions: SalesInteractionLog[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const interaction of interactions) {
    for (const rule of DECISION_CRITERIA_RULES) {
      if (matchKeywords(interaction.summary, rule.keywords)) {
        bumpCount(counts, rule.key);
      }
    }
  }
  return counts;
}

export function extractWinLossFromInteractions(
  interactions: SalesInteractionLog[],
): WinLossPattern[] {
  const patterns: WinLossPattern[] = [];
  for (const interaction of interactions) {
    const lower = normalizeText(interaction.summary);
    if (lower.includes("loss debrief") || lower.includes("budget frozen") || lower.includes("budget freeze")) {
      patterns.push({
        id: `wl-int-${interaction.id}`,
        outcome: "lost",
        reason: lower.includes("budget") ? "budget_freeze" : "loss_debrief",
        count: 1,
        contributingFactors: [],
        source: "interaction",
      });
    }
  }
  return patterns;
}

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
