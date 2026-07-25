import { Badge } from "@/components/ui/badge";
import type { DashboardMetrics } from "./constants";
import { getPriorityColor, getStatusVariant } from "./constants";

export function DistributionPanel({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">حسب الحالة</h3>
        <div className="space-y-2">
          {Object.entries(metrics.byStatus).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center justify-between text-sm"
            >
              <Badge variant={getStatusVariant(status)}>{status}</Badge>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">حسب النوع</h3>
        <div className="space-y-2">
          {Object.entries(metrics.byType).map(([type, count]) => (
            <div
              key={type}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{type}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">حسب الأولوية</h3>
        <div className="space-y-2">
          {Object.entries(metrics.byPriority).map(([priority, count]) => (
            <div
              key={priority}
              className="flex items-center justify-between text-sm"
            >
              <span className={getPriorityColor(priority)}>{priority}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
