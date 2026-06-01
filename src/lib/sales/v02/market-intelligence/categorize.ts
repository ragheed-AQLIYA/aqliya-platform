import type { MarketSignal, MarketSignalCategory } from "./types";

const CATEGORY_RULES: ReadonlyArray<{
  category: MarketSignalCategory;
  keys: string[];
}> = [
  {
    category: "buying",
    keys: [
      "buying",
      "rfp",
      "proposal",
      "procurement",
      "late-stage",
      "pilot momentum",
      "executive engagement",
    ],
  },
  {
    category: "timing",
    keys: [
      "renewal",
      "timing",
      "commercial review",
      "procurement cycle",
      "q1",
      "q2",
      "q3",
    ],
  },
  {
    category: "budget",
    keys: ["budget", "pricing", "roi", "freeze", "approved"],
  },
  {
    category: "regulatory",
    keys: [
      "governance",
      "security",
      "compliance",
      "regulatory",
      "data residency",
      "questionnaire",
    ],
  },
  {
    category: "expansion",
    keys: [
      "expansion",
      "upsell",
      "cross-sell",
      "high-value",
      "won pattern",
      "renewal intent",
    ],
  },
  {
    category: "risk",
    keys: [
      "competitor",
      "competitive",
      "lost pattern",
      "budget freeze",
      "no executive",
      "build vs buy",
    ],
  },
];

function inferCategory(signal: MarketSignal): MarketSignalCategory {
  const haystack = `${signal.label} ${signal.rawText ?? ""}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keys.some((key) => haystack.includes(key))) {
      return rule.category;
    }
  }
  return signal.category;
}

/** Assign market signal categories using keyword rules only. */
export function categorizeMarketSignals(
  signals: MarketSignal[],
): MarketSignal[] {
  return signals.map((signal) => ({
    ...signal,
    category: inferCategory(signal),
  }));
}

export function countSignalsByCategory(
  signals: MarketSignal[],
): Record<MarketSignalCategory, number> {
  const counts: Record<MarketSignalCategory, number> = {
    buying: 0,
    timing: 0,
    budget: 0,
    regulatory: 0,
    expansion: 0,
    risk: 0,
  };
  for (const signal of signals) {
    counts[signal.category] += 1;
  }
  return counts;
}
