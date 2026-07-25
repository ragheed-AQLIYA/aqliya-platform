"use server";

import { createLogger } from "@/lib/observability/logger";

import { getCurrentUser, isExpectedAccessDeniedError } from "@/lib/auth";
import { enforce } from "@/lib/kernel";


const logger = createLogger({ product: "platform", action: "unknown" });

export async function checkSlaStatus(organizationId: string) {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "organization", id: organizationId, tenantId: organizationId }, "update");

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
      logger.error("Error checking SLA status:", error instanceof Error ? error : undefined);
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
      logger.error("Error getting SLA info:", error instanceof Error ? error : undefined);
    return { success: false, error: "فشل الحصول على معلومات SLA" };
  }
}
