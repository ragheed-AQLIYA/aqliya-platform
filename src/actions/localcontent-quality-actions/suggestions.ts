export interface SuggestionRow {
  status: string;
  confidence: number;
}

export interface SuggestionMetrics {
  totalSuggestions: number;
  pendingSuggestions: number;
  approvedSuggestions: number;
  rejectedSuggestions: number;
  suggestionAcceptanceRate: number | null;
  avgSuggestionConfidence: number | null;
}

export function computeSuggestionMetrics(
  suggestions: SuggestionRow[],
): SuggestionMetrics {
  const totalSuggestions = suggestions.length;
  const pendingSuggestions = suggestions.filter((s) => s.status === "pending").length;
  const approvedSuggestions = suggestions.filter((s) => s.status === "approved").length;
  const rejectedSuggestions = suggestions.filter((s) => s.status === "rejected").length;
  const suggestionAcceptanceRate =
    approvedSuggestions + rejectedSuggestions > 0
      ? Math.round(
          (approvedSuggestions / (approvedSuggestions + rejectedSuggestions)) * 100,
        )
      : null;
  const avgSuggestionConfidence =
    totalSuggestions > 0
      ? Math.round(
          suggestions.reduce((sum, s) => sum + s.confidence, 0) / totalSuggestions,
        )
      : null;

  return {
    totalSuggestions,
    pendingSuggestions,
    approvedSuggestions,
    rejectedSuggestions,
    suggestionAcceptanceRate,
    avgSuggestionConfidence,
  };
}
