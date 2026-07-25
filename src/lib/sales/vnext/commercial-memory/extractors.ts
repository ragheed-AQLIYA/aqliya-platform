import type { SalesInteractionLog } from "../../types";
import {
  COMPETITOR_NAMES,
  DECISION_CRITERIA_RULES,
  OBJECTION_RULES,
  SIGNAL_RULES,
  matchKeywords,
  normalizeText,
} from "./common";
import type { WinLossPattern } from "./types";

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

function bumpCount(map: Map<string, number>, key: string, delta = 1): void {
  map.set(key, (map.get(key) ?? 0) + delta);
}
