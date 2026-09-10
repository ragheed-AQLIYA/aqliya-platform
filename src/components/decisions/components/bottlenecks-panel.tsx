import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { DashboardMetrics } from "./constants";
import { getPriorityColor } from "./constants";

export function BottlenecksPanel({ metrics }: { metrics: DashboardMetrics }) {
  if (metrics.bottlenecks.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-3 text-amber-600">
        اختناقات التنفيذ
      </h3>
      <div className="space-y-2">
        {metrics.bottlenecks.slice(0, 5).map((b) => (
          <Link
            key={b.id}
            href={`/decisions/${b.id}`}
            className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted transition-colors"
          >
            <div>
              <span className="font-medium">{b.title}</span>
              <span
                className={`ms-2 text-xs ${getPriorityColor(b.priority)}`}
              >
                {b.priority}
              </span>
            </div>
            <Badge variant="secondary">متوقف عند: {b.stage}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
