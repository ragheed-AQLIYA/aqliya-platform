export interface ReviewRunRow {
  id: string;
  status: string;
  explanationsGenerated: number;
  patternSuggestions: number;
  falsePositives: number;
  startedAt: Date;
  completedAt: Date | null;
}

export interface IndustryPatternRow {
  effectivenessPct: number;
}

export interface RecentRunItem {
  id: string;
  status: string;
  explanationsGenerated: number;
  patternSuggestions: number;
  falsePositives: number;
  startedAt: string;
  completedAt: string | null;
  durationMs: number;
}

export interface RunMetrics {
  totalReviewRuns: number;
  completedRuns: number;
  failedRuns: number;
  totalExplanationsGenerated: number;
  totalPatternSuggestions: number;
  lastRunStatus: string | null;
  lastRunAt: string | null;
  lastRunDuration: number | null;
  recentRuns: RecentRunItem[];
}

export interface IndustryMetrics {
  totalIndustryPatterns: number;
  avgEffectiveness: number | null;
}

export function computeRunMetrics(reviewRuns: ReviewRunRow[]): RunMetrics {
  const totalReviewRuns = reviewRuns.length;
  const completedRuns = reviewRuns.filter((r) => r.status === "completed").length;
  const failedRuns = reviewRuns.filter((r) => r.status === "failed").length;
  const totalExplanationsGenerated = reviewRuns.reduce(
    (sum, r) => sum + r.explanationsGenerated,
    0,
  );
  const totalPatternSuggestions = reviewRuns.reduce(
    (sum, r) => sum + r.patternSuggestions,
    0,
  );

  const lastRun = reviewRuns[0] ?? null;

  const recentRuns = reviewRuns.map((r) => {
    const durationMs =
      r.completedAt && r.startedAt
        ? r.completedAt.getTime() - r.startedAt.getTime()
        : 0;
    return {
      id: r.id,
      status: r.status,
      explanationsGenerated: r.explanationsGenerated,
      patternSuggestions: r.patternSuggestions,
      falsePositives: r.falsePositives,
      startedAt: r.startedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      durationMs,
    };
  });

  return {
    totalReviewRuns,
    completedRuns,
    failedRuns,
    totalExplanationsGenerated,
    totalPatternSuggestions,
    lastRunStatus: lastRun?.status ?? null,
    lastRunAt: lastRun?.startedAt.toISOString() ?? null,
    lastRunDuration:
      lastRun?.completedAt && lastRun?.startedAt
        ? lastRun.completedAt.getTime() - lastRun.startedAt.getTime()
        : null,
    recentRuns,
  };
}

export function computeIndustryMetrics(
  industryPatterns: IndustryPatternRow[],
): IndustryMetrics {
  const totalIndustryPatterns = industryPatterns.length;
  const avgEffectiveness =
    totalIndustryPatterns > 0
      ? Math.round(
          industryPatterns.reduce((sum, p) => sum + p.effectivenessPct, 0) /
            totalIndustryPatterns,
        )
      : null;

  return {
    totalIndustryPatterns,
    avgEffectiveness,
  };
}
