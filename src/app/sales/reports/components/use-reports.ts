"use client";

import { useState, useCallback } from "react";
import type {
  RevenueRow,
  PipelineStageRow,
  ActivityReport,
  ReportPeriod,
} from "@/actions/sales-report-actions";

export type ReportTab = "revenue" | "pipeline" | "activity";

export function useReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [period, setPeriod] = useState<ReportPeriod>("12");
  const [activityType, setActivityType] = useState<string>("");
  const [revenueData, setRevenueData] = useState<RevenueRow[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineStageRow[]>([]);
  const [activityData, setActivityData] = useState<ActivityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async (p: ReportPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const { getRevenueReportAction } = await import(
        "@/actions/sales-report-actions"
      );
      const res = await getRevenueReportAction(p);
      if (res.ok) setRevenueData(res.data);
      else setError(res.error ?? "فشل تحميل تقرير الإيرادات");
    } catch {
      setError("فشل تحميل تقرير الإيرادات");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { getPipelineReportAction } = await import(
        "@/actions/sales-report-actions"
      );
      const res = await getPipelineReportAction();
      if (res.ok) setPipelineData(res.data);
      else setError(res.error ?? "فشل تحميل تقرير المراحل");
    } catch {
      setError("فشل تحميل تقرير المراحل");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivity = useCallback(
    async (p: ReportPeriod, type?: string) => {
      setLoading(true);
      setError(null);
      try {
        const { getActivityReportAction } = await import(
          "@/actions/sales-report-actions"
        );
        const res = await getActivityReportAction(p, type || undefined);
        if (res.ok) setActivityData(res.data);
        else setError(res.error ?? "فشل تحميل تقرير النشاطات");
      } catch {
        setError("فشل تحميل تقرير النشاطات");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const changeTab = useCallback(
    (tab: ReportTab) => {
      setActiveTab(tab);
      setError(null);
      if (tab === "revenue" && revenueData.length === 0) fetchRevenue(period);
      if (tab === "pipeline" && pipelineData.length === 0) fetchPipeline();
      if (tab === "activity" && !activityData) fetchActivity(period);
    },
    [period, revenueData, pipelineData, activityData, fetchRevenue, fetchPipeline, fetchActivity],
  );

  const changePeriod = useCallback(
    (p: ReportPeriod) => {
      setPeriod(p);
      if (activeTab === "revenue") fetchRevenue(p);
      if (activeTab === "activity") fetchActivity(p, activityType || undefined);
    },
    [activeTab, activityType, fetchRevenue, fetchActivity],
  );

  const changeActivityType = useCallback(
    (type: string) => {
      setActivityType(type);
      fetchActivity(period, type || undefined);
    },
    [period, fetchActivity],
  );

  return {
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
  };
}
