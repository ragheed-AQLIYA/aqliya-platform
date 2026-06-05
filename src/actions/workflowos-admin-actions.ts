"use server";

import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";

export async function getAdminDashboardMetrics(organizationId: string) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId) {
      return { success: false, error: "لا تملك صلاحية الوصول" };
    }

    const { getThroughputMetrics, getSLACompliance, getStepBreakdown, getAvgCompletionTime, getDailyThroughput } =
      await import("@/lib/workflowos/analytics-service");

    const [metrics, compliance, stepBreakdown, avgCompletion, throughput] =
      await Promise.all([
        getThroughputMetrics(organizationId),
        getSLACompliance(organizationId),
        getStepBreakdown(organizationId),
        getAvgCompletionTime(organizationId),
        getDailyThroughput(organizationId),
      ]);

    return {
      success: true,
      data: {
        metrics,
        compliance,
        stepBreakdown,
        avgCompletion,
        throughput,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting admin metrics:", error);
    return { success: false, error: "فشل الحصول على مقاييس لوحة التحكم" };
  }
}

export async function exportMetricsCSV(organizationId: string) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId) {
      return { success: false, error: "لا تملك صلاحية الوصول" };
    }

    const { getThroughputMetrics, getSLACompliance, getStepBreakdown, getDailyThroughput } =
      await import("@/lib/workflowos/analytics-service");

    const [metrics, compliance, stepBreakdown, throughput] = await Promise.all([
      getThroughputMetrics(organizationId),
      getSLACompliance(organizationId),
      getStepBreakdown(organizationId),
      getDailyThroughput(organizationId),
    ]);

    // Build CSV
    const rows: string[] = [];
    rows.push("المقياس,القيمة");
    rows.push(`السجلات النشطة,${metrics.totalActive}`);
    rows.push(`متأخرة,${metrics.overdueCount}`);
    rows.push(`مكتملة اليوم,${metrics.completedToday}`);
    rows.push(`متوسط وقت الإنجاز (ساعات),${metrics.avgCompletionHours ?? "N/A"}`);
    rows.push("");
    rows.push("الالتزام بـ SLA,القيمة");
    rows.push(`في الوقت المحدد,${compliance.onTime}`);
    rows.push(`مخالفة,${compliance.breached}`);
    rows.push(`نسبة الالتزام,${compliance.complianceRate}%`);
    rows.push("");
    rows.push("نوع الخطوة,العدد,متوسط الساعات");
    for (const s of stepBreakdown) {
      rows.push(`${s.stepType},${s.count},${s.avgHours ?? "N/A"}`);
    }
    rows.push("");
    rows.push("التاريخ,تم الإنجاز,تم الإنشاء");
    for (const d of throughput) {
      rows.push(`${d.date},${d.completed},${d.created}`);
    }

    return {
      success: true,
      data: {
        content: rows.join("\n"),
        filename: `workflowos-metrics-${new Date().toISOString().slice(0, 10)}.csv`,
        mimeType: "text/csv",
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error exporting metrics:", error);
    return { success: false, error: "فشل تصدير المقاييس" };
  }
}
