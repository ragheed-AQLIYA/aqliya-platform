import type { SuggestionRow } from "./suggestions";
import type { ExplanationRow } from "./explanations";
import type { ReviewRunRow } from "./runs";

export type ConfidenceBuckets = [number, number, number, number];

export interface AcceptanceBucket {
  label: string;
  total: number;
  approved: number;
  rate: number | null;
}

export interface DistributionMetrics {
  suggestionConfidenceBuckets: ConfidenceBuckets;
  explanationConfidenceBuckets: ConfidenceBuckets;
  acceptanceOverTime: AcceptanceBucket[];
}

export function computeConfidenceBuckets(
  suggestions: SuggestionRow[],
  explanations: ExplanationRow[],
): { suggestionConfidenceBuckets: ConfidenceBuckets; explanationConfidenceBuckets: ConfidenceBuckets } {
  const suggestionConfidenceBuckets: ConfidenceBuckets = [0, 0, 0, 0];
  for (const s of suggestions) {
    if (s.confidence <= 25) suggestionConfidenceBuckets[0]++;
    else if (s.confidence <= 50) suggestionConfidenceBuckets[1]++;
    else if (s.confidence <= 75) suggestionConfidenceBuckets[2]++;
    else suggestionConfidenceBuckets[3]++;
  }

  const explanationConfidenceBuckets: ConfidenceBuckets = [0, 0, 0, 0];
  for (const e of explanations) {
    if (e.confidence <= 25) explanationConfidenceBuckets[0]++;
    else if (e.confidence <= 50) explanationConfidenceBuckets[1]++;
    else if (e.confidence <= 75) explanationConfidenceBuckets[2]++;
    else explanationConfidenceBuckets[3]++;
  }

  return { suggestionConfidenceBuckets, explanationConfidenceBuckets };
}

export function computeAcceptanceOverTime(
  reviewRuns: ReviewRunRow[],
): AcceptanceBucket[] {
  const now = Date.now();
  const acceptanceOverTime: AcceptanceBucket[] = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now - (w + 1) * 7 * 86400000);
    const weekEnd   = new Date(now - w * 7 * 86400000);
    const runsInWeek = reviewRuns.filter((r) => {
      const t = r.startedAt.getTime();
      return t >= weekStart.getTime() && t < weekEnd.getTime();
    });
    const totalGenerated = runsInWeek.reduce((s, r) => s + (r.patternSuggestions ?? 0), 0);
    acceptanceOverTime.push({
      label: weekStart.toLocaleDateString("ar-SA", { month: "short", day: "numeric" }),
      total: totalGenerated,
      approved: 0,
      rate: null,
    });
  }

  return acceptanceOverTime;
}
