import type { SalesActivity } from "../types";
import {
  createActivity,
  listActivities,
  listActivitiesForOpportunity,
} from "../store";

export function salesListActivities(organizationId: string): SalesActivity[] {
  return listActivities(organizationId);
}

export function salesListActivitiesForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesActivity[] {
  return listActivitiesForOpportunity(organizationId, opportunityId);
}

export function salesLogActivity(
  input: Omit<
    SalesActivity,
    "id" | "loggedAt" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesActivity {
  return createActivity({
    ...input,
    loggedAt: new Date().toISOString(),
    status: "active" as const,
    source: "manual" as const,
  });
}
