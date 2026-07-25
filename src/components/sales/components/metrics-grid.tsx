"use client";

import { MetricCard } from "./metric-card";

export interface MetricsGridProps {
  activeAccounts: number;
  activeOpps: number;
  pipelineValue: number;
  stalledOpps: number;
  meetingsThisWeek: number;
  forecastWeighted?: number;
}

export function MetricsGrid({
  activeAccounts,
  activeOpps,
  pipelineValue,
  stalledOpps,
  meetingsThisWeek,
  forecastWeighted,
}: MetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="حسابات نشطة" value={activeAccounts} />
      <MetricCard label="فرص نشطة" value={activeOpps} />
      <MetricCard
        label="قيمة المسار"
        value={`${pipelineValue.toLocaleString("ar-SA")} ر.س`}
      />
      <MetricCard label="فرص متوقفة" value={stalledOpps} />
      <MetricCard label="اجتماعات هذا الأسبوع" value={meetingsThisWeek} />
      {forecastWeighted != null && (
        <MetricCard
          label="توقع مرجّح"
          value={`${Math.round(forecastWeighted).toLocaleString("ar-SA")} ر.س`}
        />
      )}
    </div>
  );
}
