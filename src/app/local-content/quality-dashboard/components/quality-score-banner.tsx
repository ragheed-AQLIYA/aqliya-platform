"use client";

import { ShieldCheck } from "lucide-react";
import type { AiQualityMetrics } from "@/actions/localcontent-quality-actions";

export function QualityScoreBanner({ metrics }: { metrics: AiQualityMetrics }) {
  const scores: number[] = [];
  if (metrics.suggestionAcceptanceRate !== null)
    scores.push(metrics.suggestionAcceptanceRate);
  if (metrics.avgSuggestionConfidence !== null)
    scores.push(metrics.avgSuggestionConfidence);
  if (metrics.avgExplanationConfidence !== null)
    scores.push(metrics.avgExplanationConfidence);
  const pipelineSuccessRate =
    metrics.totalReviewRuns > 0
      ? Math.round((metrics.completedRuns / metrics.totalReviewRuns) * 100)
      : null;
  if (pipelineSuccessRate !== null) scores.push(pipelineSuccessRate);

  const compositeScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  const scoreColor =
    compositeScore === null
      ? "border-gray-200"
      : compositeScore >= 80
        ? "border-green-400 bg-green-50 dark:bg-green-950/20"
        : compositeScore >= 50
          ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
          : "border-red-400 bg-red-50 dark:bg-red-950/20";

  const scoreLabel =
    compositeScore === null
      ? "لا توجد بيانات كافية"
      : compositeScore >= 80
        ? "جودة عالية / High Quality"
        : compositeScore >= 50
          ? "جودة متوسطة / Moderate Quality"
          : "جودة منخفضة / Low Quality";

  const iconColor =
    compositeScore !== null && compositeScore >= 80
      ? "text-green-600"
      : "text-amber-600";

  return (
    <div className={`rounded-lg border-2 p-4 ${scoreColor}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className={`h-8 w-8 ${iconColor}`} />
          <div>
            <p className="text-sm font-bold">
              مؤشر جودة AI / AI Quality Score
            </p>
            <p className="text-xs text-muted-foreground">{scoreLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-black">
              {compositeScore !== null ? `${compositeScore}%` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Composite</p>
          </div>
          {scores.length > 0 && (
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                ↗ ACC {metrics.suggestionAcceptanceRate ?? "—"}%
              </span>
              <span>
                ↗ CONF {metrics.avgSuggestionConfidence ?? "—"}%
              </span>
              <span>
                ✓ PIPELINE {pipelineSuccessRate ?? "—"}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
