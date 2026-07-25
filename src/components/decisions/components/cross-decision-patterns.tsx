import type { DashboardMetrics } from "./constants";

export function CrossDecisionPatterns({
  metrics,
}: { metrics: DashboardMetrics }) {
  if (metrics.crossDecisionPatterns.recurringRiskThemes.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border p-4 mb-4">
      <h3 className="text-sm font-semibold mb-3">
        أنماط عبر القرارات (D3-04)
      </h3>
      <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
        {metrics.crossDecisionPatterns.recurringRiskThemes.map((row) => (
          <li
            key={row.patternKey}
            className="flex justify-between gap-2 rounded border px-2 py-1"
          >
            <span className="truncate">{row.labelAr}</span>
            <span className="text-muted-foreground shrink-0">
              {row.count} قرار
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-muted-foreground mt-2">
        {metrics.crossDecisionPatterns.disclaimerAr}
      </p>
    </div>
  );
}
