"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import {
  runAuditIntelligenceForEngagement,
  isAuditIntelligenceEnabled,
} from "@/lib/audit/intelligence";

export async function runAuditIntelligenceAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner", "viewer"]);
  await assertEngagementAccess(engagementId, actor);
  return runAuditIntelligenceForEngagement(engagementId);
}

export async function isAuditIntelligenceEnabledAction(): Promise<boolean> {
  return isAuditIntelligenceEnabled();
}
