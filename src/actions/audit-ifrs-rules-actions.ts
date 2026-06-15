"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import {
  isIfrsRulesEnabled,
  runIfrsRulesForEngagement,
} from "@/lib/audit/rules";

export async function isIfrsRulesEnabledAction(): Promise<boolean> {
  return isIfrsRulesEnabled();
}

export async function runIfrsRulesAction(engagementId: string) {
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
  if (!isIfrsRulesEnabled()) return null;
  return runIfrsRulesForEngagement(engagementId);
}
