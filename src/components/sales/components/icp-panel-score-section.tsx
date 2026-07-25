"use client";

import type { AccountIcpScore } from "@/lib/sales/icp-types";
import { icpBandLabelAr } from "@/lib/sales/icp-types";
import { formatAssessedAt } from "./use-account-icp-panel";
import { DimensionsBlock } from "./icp-panel-dimensions";

export function IcpPanelScoreSection({
  score,
}: {
  score: AccountIcpScore;
}) {
  const assessedLabel = formatAssessedAt(score.assessedAt);
  const showReviewPending =
    score.agentGenerated === true && score.reviewed !== true;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tabular-nums">{score.fitScore}%</p>
          <p className="text-sm text-muted-foreground">
            {icpBandLabelAr(score.band)}
          </p>
        </div>
        {score.segment ? (
          <span className="rounded-md border px-2 py-1 text-xs font-medium">
            {score.segment}
          </span>
        ) : null}
      </div>

      {score.agentGenerated ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {showReviewPending
            ? "تقييم آلي (قواعد) — بانتظار مراجعة بشرية"
            : score.reviewed
              ? "تقييم آلي (قواعد) — تمت المراجعة"
              : "تقييم آلي (قواعد)"}
        </p>
      ) : null}

      {score.confidence != null ? (
        <p className="text-sm text-muted-foreground">
          الثقة:{" "}
          <span className="font-medium text-foreground">{score.confidence}%</span>
        </p>
      ) : null}

      {score.dimensions ? <DimensionsBlock dimensions={score.dimensions} /> : null}

      {score.reasoning && score.reasoning.length > 0 ? (
        <div className="space-y-1 rounded-md border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">التبرير (قواعد)</p>
          <ul className="list-disc space-y-1 ps-4 text-xs text-muted-foreground">
            {score.reasoning.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {score.notes ? (
        <p className="text-sm text-muted-foreground">{score.notes}</p>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {score.source ? <span>المصدر: {score.source}</span> : null}
        {assessedLabel ? <span>آخر تقييم: {assessedLabel}</span> : null}
      </div>
    </>
  );
}
