import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getOutcomeStatusLabel } from "@/lib/decision/outcome-dashboard";
import type { DashboardMetrics } from "./constants";

export function OutcomePanel({ metrics }: { metrics: DashboardMetrics }) {
  const { outcomeMetrics, outcomeCorrelation } = metrics;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-3">متابعة النتائج (D3-01)</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <div className="rounded-md bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">نتائج مسجّلة</div>
          <div className="text-xl font-bold mt-1">
            {outcomeMetrics.totalOutcomes}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            تغطية {outcomeMetrics.coveragePct}% من القرارات
          </div>
        </div>
        <div className="rounded-md bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">مراجعات النتيجة</div>
          <div className="text-xl font-bold mt-1 text-green-600">
            {outcomeMetrics.reviewedCount}
          </div>
          <div className="text-xs text-amber-600 mt-1">
            {outcomeMetrics.missingReview} بانتظار مراجعة
          </div>
        </div>
        <div className="rounded-md bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">
            معتمدة بدون نتيجة
          </div>
          <div className="text-xl font-bold mt-1 text-amber-600">
            {outcomeMetrics.approvedMissingOutcome}
          </div>
        </div>
        <div className="rounded-md bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">متوسط الانحراف</div>
          <div className="text-xl font-bold mt-1">
            {outcomeMetrics.avgVariance != null
              ? outcomeMetrics.avgVariance
              : "—"}
          </div>
        </div>
      </div>

      {Object.keys(outcomeMetrics.byStatus).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(outcomeMetrics.byStatus).map(([status, count]) => (
            <Badge key={status} variant="outline">
              {getOutcomeStatusLabel(status)}: {count}
            </Badge>
          ))}
        </div>
      )}

      {outcomeCorrelation.byPriority.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            ارتباط النتائج بالأولوية (D3-06)
          </h4>
          <ul className="space-y-1 text-sm">
            {outcomeCorrelation.byPriority
              .filter((r) => r.decisionsWithOutcome > 0)
              .map((r) => (
                <li key={r.key} className="flex justify-between gap-2">
                  <span>{r.labelAr}</span>
                  <span className="text-muted-foreground">
                    نجاح {r.successRatePct ?? "—"}%
                  </span>
                </li>
              ))}
          </ul>
          <p className="text-[10px] text-muted-foreground mt-2">
            {outcomeCorrelation.disclaimerAr}
          </p>
        </div>
      )}

      {outcomeMetrics.recentOutcomes.length > 0 ? (
        <div className="space-y-2">
          {outcomeMetrics.recentOutcomes.map((item) => (
            <Link
              key={item.decisionId}
              href={`/decisions/${item.decisionId}/outcome`}
              className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate max-w-[220px]">
                  {item.title}
                </span>
                <Badge variant="secondary">
                  {getOutcomeStatusLabel(item.outcomeStatus)}
                </Badge>
                {!item.hasReview && (
                  <Badge variant="outline" className="text-[10px]">
                    بانتظار مراجعة
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {item.variance != null ? `انحراف ${item.variance}` : "—"}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          لا توجد نتائج مسجّلة بعد. سجّل النتيجة من صفحة القرار بعد الاعتماد.
        </p>
      )}
    </div>
  );
}
