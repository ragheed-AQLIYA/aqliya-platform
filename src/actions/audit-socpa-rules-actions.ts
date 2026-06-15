"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import {
  isSocpaRulesEnabled,
  runSocpaRulesForEngagement,
} from "@/lib/audit/rules";

export async function isSocpaRulesEnabledAction(): Promise<boolean> {
  return isSocpaRulesEnabled();
}

export async function runSocpaRulesAction(engagementId: string) {
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
  if (!isSocpaRulesEnabled()) return null;
  return runSocpaRulesForEngagement(engagementId);
}
