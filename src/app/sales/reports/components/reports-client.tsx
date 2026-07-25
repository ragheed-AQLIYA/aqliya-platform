"use client";

import { useEffect } from "react";
import {
  SalesNavLinks,
  SalesPageHeader,
  SalesInlineNotice,
} from "@/components/sales/sales-shell";
import { RevenueReport } from "./revenue-report";
import { PipelineReport } from "./pipeline-report";
import { ActivityReport } from "./activity-report";
import { useReports, type ReportTab } from "./use-reports";

const tabs: { id: ReportTab; label: string }[] = [
  { id: "revenue", label: "تقارير الإيرادات" },
  { id: "pipeline", label: "تقارير المراحل" },
  { id: "activity", label: "النشاطات" },
];

const periodLabels: { value: string; label: string }[] = [
  { value: "3", label: "آخر 3 أشهر" },
  { value: "6", label: "آخر 6 أشهر" },
  { value: "12", label: "آخر 12 شهر" },
];

export function ReportsClient() {
  const {
    activeTab,
    period,
    activityType,
    revenueData,
    pipelineData,
    activityData,
    loading,
    error,
    changeTab,
    changePeriod,
    changeActivityType,
  } = useReports();

  useEffect(() => {
    if (activeTab === "revenue" && revenueData.length === 0) changeTab("revenue");
    if (activeTab === "pipeline" && pipelineData.length === 0) changeTab("pipeline");
    if (activeTab === "activity" && !activityData) changeTab("activity");
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <SalesNavLinks active="reports" />
      <SalesPageHeader
        title="تقارير المبيعات"
        subtitle="تحليل الإيرادات والمراحل والنشاطات"
      />

      {error ? (
        <SalesInlineNotice variant="error" title="خطأ" description={error} />
      ) : null}

      <div className="flex items-center justify-between border-b">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => changeTab(tab.id)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary bg-primary/5 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">الفترة:</span>
          {periodLabels.map((opt) => (
            <button
              key={opt.value}
              onClick={() => changePeriod(opt.value as "3" | "6" | "12")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {activeTab === "revenue" && <RevenueReport data={revenueData} />}
          {activeTab === "pipeline" && <PipelineReport data={pipelineData} />}
          {activeTab === "activity" && activityData ? (
            <ActivityReport
              data={activityData}
              activityType={activityType}
              onTypeChange={changeActivityType}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
