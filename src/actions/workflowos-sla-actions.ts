"use server";

import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";

export async function checkSlaStatus(organizationId: string) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId) {
      return { success: false, error: "لا تملك صلاحية الوصول" };
    }

    const { getThroughputMetrics, getSLACompliance, getStepBreakdown, getDailyThroughput } =
      await import("@/lib/workflowos/analytics-service");
    const { checkOverdue } = await import("@/lib/workflowos/sla-service");

    const [metrics, compliance, stepBreakdown, throughput, overdue] =
      await Promise.all([
        getThroughputMetrics(organizationId),
        getSLACompliance(organizationId),
        getStepBreakdown(organizationId),
        getDailyThroughput(organizationId, 7),
        checkOverdue(),
      ]);

    return {
      success: true,
      data: {
        metrics,
        compliance,
        stepBreakdown,
        throughput,
        overdue,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error checking SLA status:", error);
    return { success: false, error: "فشل الحصول على حالة SLA" };
  }
}

export async function getSlaInfoForRecord(recordId: string) {
  try {
    const { getSLAInfo } = await import("@/lib/workflowos/sla-service");
    const info = await getSLAInfo(recordId);
    return { success: true, data: info };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting SLA info:", error);
    return { success: false, error: "فشل الحصول على معلومات SLA" };
  }
}
