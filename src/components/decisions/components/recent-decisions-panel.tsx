import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { DashboardMetrics } from "./constants";
import { getPriorityColor } from "./constants";

export function RecentDecisionsPanel({
  metrics,
}: { metrics: DashboardMetrics }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-3">أحدث القرارات</h3>
      <div className="space-y-2">
        {metrics.recentDecisions.map((d) => (
          <Link
            key={d.id}
            href={`/decisions/${d.id}`}
            className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium truncate max-w-[200px]">
                {d.title}
              </span>
              <Badge variant="outline">{d.type}</Badge>
              {d.priority && (
                <span className={`text-xs ${getPriorityColor(d.priority)}`}>
                  {d.priority}
                </span>
              )}
              {d.hasEvidence ? (
                <Badge variant="outline" className="text-[10px]">
                  مدعوم بأدلة
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  بدون أدلة
                </Badge>
              )}
              {d.humanReviewRequired && (
                <Badge variant="secondary" className="text-[10px]">
                  مراجعة بشرية
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${(d.stageCount / 7) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {d.stageCount}/7
              </span>
              {d.hasApproval && (
                <Badge variant="default" className="text-xs">
                  معتمد
                </Badge>
              )}
              {d.hasRecommendation && !d.hasApproval && (
                <Badge variant="secondary" className="text-xs">
                  بانتظار الاعتماد
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
