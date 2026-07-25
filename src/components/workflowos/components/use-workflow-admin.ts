"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAdminDashboardMetrics,
  exportMetricsCSV,
} from "@/actions/workflowos-admin-actions";
import { checkSlaStatus } from "@/actions/workflowos-sla-actions";

export interface DashboardData {
  metrics: {
    totalActive: number;
    overdueCount: number;
    completedToday: number;
    completedThisWeek: number;
    completedThisMonth: number;
    avgCompletionHours: number | null;
  };
  compliance: {
    onTime: number;
    breached: number;
    complianceRate: number;
    byPriority: Record<string, { total: number; onTime: number; rate: number }>;
  };
  stepBreakdown: {
    stepType: string;
    count: number;
    avgHours: number | null;
    minHours: number | null;
    maxHours: number | null;
  }[];
  avgCompletion: {
    avgHours: number | null;
    recordCount: number;
  };
  throughput: {
    date: string;
    completed: number;
    created: number;
  }[];
}

export function useWorkflowAdmin() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkSlaStatus("");
      if (result.success && result.data) {
        const adminResult = await getAdminDashboardMetrics("");
        if (adminResult.success && adminResult.data) {
          setData({
            ...adminResult.data,
            overdue: result.data.overdue,
          } as DashboardData);
        }
      } else {
        setError(result.error ?? "فشل تحميل البيانات");
      }
    } catch {
      setError("حدث خطأ أثناء تحميل لوحة التحكم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportMetricsCSV("");
      if (result.success && result.data) {
        const blob = new Blob([result.data.content], {
          type: result.data.mimeType,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  return { data, loading, error, exporting, fetchData, handleExport };
}
