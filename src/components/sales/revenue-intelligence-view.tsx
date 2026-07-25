"use client";

import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";
import { formatSalesConfidence } from "@/lib/sales/sales-ux-copy";
import { RevenueIntelligenceHeader } from "./components/revenue-intelligence-header";
import { RevenueMetricCard } from "./components/revenue-metric-card";
import { RevenueStageDistribution } from "./components/revenue-stage-distribution";
import { RevenueRiskFlagsCard } from "./components/revenue-risk-flags-card";
import { RevenueStalledCard } from "./components/revenue-stalled-card";
import { RevenueActionsCard } from "./components/revenue-actions-card";
import { RevenueNotesCard } from "./components/revenue-notes-card";

interface RevenueIntelligenceViewProps {
  snapshot: RevenueIntelligenceSnapshot;
}

export function RevenueIntelligenceView({ snapshot }: RevenueIntelligenceViewProps) {
  const {
    totalPipeline,
    weightedForecast,
    forecastConfidence,
    pipelineCoverage,
    stalledOpportunities,
    stageDistribution,
    riskFlags,
    opportunitiesNeedingAction,
    revenueNotes,
    won,
    lost,
    disclaimerAr,
  } = snapshot;

  return (
    <div className="space-y-6" dir="rtl">
      <RevenueIntelligenceHeader disclaimerAr={disclaimerAr} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RevenueMetricCard
          label="إجمالي المسار"
          value={`${totalPipeline.toLocaleString("ar-SA")} ر.س`}
          hint={`${stageDistribution.reduce((s, b) => s + b.count, 0)} فرصة نشطة`}
        />
        <RevenueMetricCard
          label="التوقع المرجّح"
          value={`${Math.round(weightedForecast).toLocaleString("ar-SA")} ر.س`}
          hint={`ثقة: ${formatSalesConfidence(forecastConfidence)}`}
        />
        <RevenueMetricCard
          label="تغطية المسار"
          value={`${pipelineCoverage.ratio.toFixed(1)}×`}
          hint={`${pipelineCoverage.labelAr} · هدف مرجّح ${pipelineCoverage.impliedTarget.toLocaleString("ar-SA")} ر.س`}
        />
        <RevenueMetricCard
          label="فرص متوقفة"
          value={String(stalledOpportunities.count)}
          hint="بدون نشاط 14+ يوم"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <RevenueMetricCard
          label="فوز"
          value={`${won.value.toLocaleString("ar-SA")} ر.س`}
          hint={`${won.count} صفقة`}
        />
        <RevenueMetricCard
          label="خسارة"
          value={`${lost.value.toLocaleString("ar-SA")} ر.س`}
          hint={`${lost.count} صفقة`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueStageDistribution buckets={stageDistribution} />
        <RevenueRiskFlagsCard flags={riskFlags} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueStalledCard stalled={stalledOpportunities} />
        <RevenueActionsCard items={opportunitiesNeedingAction} />
      </div>

      <RevenueNotesCard notes={revenueNotes} />
    </div>
  );
}
