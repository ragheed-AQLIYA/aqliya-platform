"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import {
  buildPriorYearRollforwardForEngagement,
  generateLeadSchedulesFromMappings,
  isLeadScheduleAutoEnabled,
  listLeadSchedulesForEngagement,
  validateLeadSchedulesForEngagement,
} from "@/lib/audit/lead-schedule";
import { syncReportingGraphForEngagement } from "@/lib/audit/reporting-graph/graph-sync-service";

export async function isLeadScheduleAutoEnabledAction(): Promise<boolean> {
  return isLeadScheduleAutoEnabled();
}

export async function generateLeadSchedulesAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "manager", "reviewer"]);
  await assertEngagementAccess(engagementId, actor);

  const result = await generateLeadSchedulesFromMappings(
    engagementId,
    actor.actorId,
  );
  await syncReportingGraphForEngagement(engagementId, "mapping");
  return result;
}

export async function listLeadSchedulesAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, [
    "admin",
    "operator",
    "reviewer",
    "manager",
    "partner",
    "viewer",
  ]);
  await assertEngagementAccess(engagementId, actor);
  return listLeadSchedulesForEngagement(engagementId);
}

export async function validateLeadSchedulesAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, [
    "admin",
    "operator",
    "reviewer",
    "manager",
    "partner",
    "viewer",
  ]);
  await assertEngagementAccess(engagementId, actor);
  return validateLeadSchedulesForEngagement(engagementId);
}

export async function getLeadScheduleRollforwardAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, [
    "admin",
    "operator",
    "reviewer",
    "manager",
    "partner",
    "viewer",
  ]);
  await assertEngagementAccess(engagementId, actor);
  return buildPriorYearRollforwardForEngagement(engagementId);
}
