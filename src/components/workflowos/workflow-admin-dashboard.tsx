"use client";

import { useWorkflowAdmin } from "./components/use-workflow-admin";
import { DashboardLoading } from "./components/dashboard-loading";
import { DashboardError } from "./components/dashboard-error";
import { DashboardHeader } from "./components/dashboard-header";
import { MetricCardsGrid } from "./components/metric-cards-grid";
import { SlaComplianceCard } from "./components/sla-compliance-card";
import { StepBreakdownCard } from "./components/step-breakdown-card";
import { ThroughputChartCard } from "./components/throughput-chart-card";

export function WorkflowAdminDashboard() {
  const { data, loading, error, exporting, fetchData, handleExport } = useWorkflowAdmin();

  if (loading && !data) return <DashboardLoading />;
  if (error && !data) return <DashboardError message={error} onRetry={fetchData} />;
  if (!data) return null;

  return (
    <div dir="rtl" className="space-y-6">
      <DashboardHeader
        loading={loading}
        exporting={exporting}
        onRefresh={fetchData}
        onExport={handleExport}
      />
      <MetricCardsGrid metrics={data.metrics} avgCompletion={data.avgCompletion} />
      <SlaComplianceCard compliance={data.compliance} />
      <div className="grid gap-6 lg:grid-cols-2">
        <StepBreakdownCard steps={data.stepBreakdown} />
        <ThroughputChartCard throughput={data.throughput} />
      </div>
    </div>
  );
}
