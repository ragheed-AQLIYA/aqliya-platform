export interface AiQualityMetrics {
  totalSuggestions: number;
  pendingSuggestions: number;
  approvedSuggestions: number;
  rejectedSuggestions: number;
  suggestionAcceptanceRate: number | null;
  avgSuggestionConfidence: number | null;

  totalExplanations: number;
  confirmedExplanations: number;
  rejectedExplanations: number;
  falsePositives: number;
  falsePositiveRate: number | null;
  avgExplanationConfidence: number | null;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;

  totalHealthRecords: number;
  highPerformingRecords: number;
  activeRecords: number;
  decayingRecords: number;
  obsoleteRecords: number;
  avgHealthScore: number | null;

  totalReviewRuns: number;
  completedRuns: number;
  failedRuns: number;
  totalExplanationsGenerated: number;
  totalPatternSuggestions: number;
  lastRunStatus: string | null;
  lastRunAt: string | null;
  lastRunDuration: number | null;

  totalOrgMemoryRecords: number;
  manualOverrides: number;

  totalIndustryPatterns: number;
  avgEffectiveness: number | null;

  recentRuns: Array<{
    id: string;
    status: string;
    explanationsGenerated: number;
    patternSuggestions: number;
    falsePositives: number;
    startedAt: string;
    completedAt: string | null;
    durationMs: number;
  }>;

  suggestionConfidenceBuckets: [number, number, number, number];
  explanationConfidenceBuckets: [number, number, number, number];

  acceptanceOverTime: Array<{
    label: string;
    total: number;
    approved: number;
    rate: number | null;
  }>;
}
