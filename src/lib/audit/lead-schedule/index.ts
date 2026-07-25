import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { createLogger } from "@/lib/observability/logger";
import { syncReportingGraphForEngagement } from "@/lib/audit/reporting-graph/graph-sync-service";
import {
  generateLeadSchedulesFromMappings,
  validateLeadSchedulesForEngagement,
  listLeadSchedulesForEngagement,
  buildPriorYearRollforwardForEngagement,
} from "./lead-schedule-generator";

export function isLeadScheduleAutoEnabled(): boolean {
  return isEnabled("audit.lead-schedule-auto");
}


const logger = createLogger({ product: "platform", action: "lib-audit-lead-schedule-index" });

export {
  generateLeadSchedulesFromMappings,
  validateLeadSchedulesForEngagement,
  listLeadSchedulesForEngagement,
  buildPriorYearRollforwardForEngagement,
};

export type {
  LeadScheduleGenerationResult,
  LeadScheduleListItem,
  LeadScheduleValidationResult,
  PriorYearRollforwardReport,
} from "./types";

/** Auto-generate after mapping confirm when flag on; refreshes reporting graph if enabled. */
export async function maybeGenerateLeadSchedules(
  engagementId: string,
  trigger: "mapping_confirm" | "manual" = "mapping_confirm",
): Promise<void> {
  if (!isLeadScheduleAutoEnabled()) return;

  try {
    await generateLeadSchedulesFromMappings(engagementId);
    await syncReportingGraphForEngagement(engagementId, "mapping");
  } catch (err) {
    logger.error(`[LeadSchedule] auto-generate failed (${trigger}) for ${engagementId}`, err instanceof Error ? err : new Error(String(err)));
  }
}
