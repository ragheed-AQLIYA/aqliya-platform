import type { DashboardMetrics } from "./constants";

export function PortfolioPanel({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="rounded-lg border p-4 mb-4">
      <h3 className="text-sm font-semibold mb-3">محفظة القرارات (D3-05)</h3>
      <div className="grid gap-3 sm:grid-cols-4 text-sm">
        <div className="rounded-md bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">نشطة</div>
          <div className="text-xl font-bold">
            {metrics.portfolioSnapshot.active}
          </div>
        </div>
        <div className="rounded-md bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">معتمدة</div>
          <div className="text-xl font-bold">
            {metrics.portfolioSnapshot.approved}
          </div>
        </div>
        <div className="rounded-md bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">مسودة</div>
          <div className="text-xl font-bold">
            {metrics.portfolioSnapshot.draft}
          </div>
        </div>
        <div className="rounded-md bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">عالية · مفتوحة</div>
          <div className="text-xl font-bold text-amber-600">
            {metrics.portfolioSnapshot.highPriorityOpen}
          </div>
        </div>
      </div>
    </div>
  );
}
