"use client";

import type { ExecutiveCommercialSnapshot } from "@/lib/sales/services/executive-commercial-dashboard-service";
import { DashboardHeader } from "./components/dashboard-header";
import { RevenueSection } from "./components/revenue-section";
import { PipelineSection } from "./components/pipeline-section";
import { ExecutiveRisksSection } from "./components/executive-risks-section";
import { IcpCard } from "./components/icp-card";
import { ProofCard } from "./components/proof-card";
import { ExecutiveSignalsCard } from "./components/executive-signals-card";
import { RecommendationsCard } from "./components/recommendations-card";
import { LearningTrendsSection } from "./components/learning-trends-section";

export function ExecutiveCommercialDashboard({
  data,
}: {
  data: ExecutiveCommercialSnapshot;
}) {
  return (
    <div className="space-y-6" dir="rtl">
      <DashboardHeader disclaimerAr={data.disclaimerAr} />
      <RevenueSection section={data.revenue} />
      <PipelineSection section={data.pipeline} />
      <ExecutiveRisksSection section={data.executiveRisks} />
      <div className="grid gap-4 lg:grid-cols-2">
        <IcpCard section={data.icp} />
        <ProofCard section={data.proof} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ExecutiveSignalsCard section={data.signals} />
        <RecommendationsCard section={data.recommendations} />
      </div>
      <LearningTrendsSection section={data.learningTrends} />
      <p className="text-xs text-muted-foreground">
        \u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b:{" "}
        {new Date(data.generatedAt).toLocaleString("ar-SA")}
      </p>
    </div>
  );
}
