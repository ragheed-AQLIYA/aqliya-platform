"use client";

import type { DiffData } from "./use-diff-viewer";

interface DiffSummaryProps {
  diff: DiffData;
}

export function DiffSummary({ diff }: DiffSummaryProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold">
        الفرق: v{diff.fromVersionNumber} → v{diff.toVersionNumber}
      </h3>
      <p className="text-sm text-muted-foreground">{diff.summary}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {diff.breakingChange && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            تغيير جذري
          </span>
        )}
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          خطورة: {diff.riskScore.toFixed(2)}
        </span>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          +{diff.addedRules.length} مضاف
        </span>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          ~{diff.modifiedRules.length} معدّل
        </span>
        {diff.removedRules.length > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            -{diff.removedRules.length} محذوف
          </span>
        )}
      </div>
    </div>
  );
}
