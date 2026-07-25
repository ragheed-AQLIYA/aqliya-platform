import type { DashboardMetrics } from "./constants";

export function SummaryCards({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">إجمالي القرارات</div>
        <div className="text-2xl font-bold mt-1">
          {metrics.totalDecisions}
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">قرارات معتمدة</div>
        <div className="text-2xl font-bold mt-1 text-green-600">
          {metrics.approvedCount}
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">بانتظار الاعتماد</div>
        <div className="text-2xl font-bold mt-1 text-amber-600">
          {metrics.pendingApproval}
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">متوسط الإنجاز</div>
        <div className="text-2xl font-bold mt-1">
          {metrics.avgCompletion}%
        </div>
      </div>
    </div>
  );
}
