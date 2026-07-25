"use client";

import { Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { MetricCard } from "./metric-card";
import type { DashboardData } from "./use-workflow-admin";

export function MetricCardsGrid({
  metrics,
  avgCompletion,
}: {
  metrics: DashboardData["metrics"];
  avgCompletion: DashboardData["avgCompletion"];
}) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="السجلات النشطة"
        value={metrics.totalActive}
        icon={<Activity className="h-5 w-5 text-blue-600" />}
        color="text-blue-600"
      />
      <MetricCard
        title="متأخرة"
        value={metrics.overdueCount}
        icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        color="text-amber-600"
        subtitle={metrics.overdueCount > 0 ? "بحاجة إلى متابعة" : undefined}
      />
      <MetricCard
        title="مكتملة اليوم"
        value={metrics.completedToday}
        icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        color="text-green-600"
      />
      <MetricCard
        title="متوسط الإنجاز"
        value={
          avgCompletion.avgHours !== null
            ? `${avgCompletion.avgHours.toFixed(1)} س`
            : "N/A"
        }
        subtitle={
          avgCompletion.recordCount > 0
            ? `من ${avgCompletion.recordCount} سجل`
            : undefined
        }
        icon={<Clock className="h-5 w-5 text-purple-600" />}
        color="text-purple-600"
      />
    </div>
  );
}
