"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import {
  isReconciliationEnabled,
  isReconciliationGatesEnabled,
  runReconciliationForEngagement,
} from "@/lib/audit/reconciliation";

export async function isReconciliationEnabledAction(): Promise<boolean> {
  return isReconciliationEnabled();
}

export async function isReconciliationGatesEnabledAction(): Promise<boolean> {
  return isReconciliationGatesEnabled();
}

export async function runReconciliationAction(engagementId: string) {
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
  if (!isReconciliationEnabled()) {
    return null;
  }
  return runReconciliationForEngagement(engagementId);
}
