"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import {
  isDisclosureAutoEnabled,
  runDisclosureAutoForEngagement,
} from "@/lib/audit/notes/disclosure-auto";
import type { DisclosureAutoRunResult } from "@/lib/audit/notes/disclosure-engine-types";

export async function isDisclosureAutoEnabledAction(): Promise<boolean> {
  return isDisclosureAutoEnabled();
}

export async function runDisclosureAutoAction(
  engagementId: string,
): Promise<DisclosureAutoRunResult | null> {
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
  if (!isDisclosureAutoEnabled()) return null;
  return runDisclosureAutoForEngagement(engagementId);
}
