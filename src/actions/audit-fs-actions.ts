"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import {
  isFsV2Enabled,
  rebuildFinancialStatementsV2,
  markAllFinancialStatementsReviewed,
  transitionFinancialStatementStatus,
} from "@/lib/audit/fs-engine";
import type { FinancialStatementStatus } from "@/lib/audit/fs-engine/types";

export async function isFsV2EnabledAction(): Promise<boolean> {
  return isFsV2Enabled();
}

export async function rebuildFinancialStatementsV2Action(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  if (!isFsV2Enabled()) return null;
  return rebuildFinancialStatementsV2(engagementId);
}

export async function markAllStatementsReviewedAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "reviewer", "manager", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  if (!isFsV2Enabled()) return { updated: 0 };
  const updated = await markAllFinancialStatementsReviewed({
    engagementId,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
  return { updated };
}

export async function transitionStatementStatusAction(input: {
  engagementId: string;
  statementId: string;
  toStatus: FinancialStatementStatus;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "reviewer", "manager", "partner"]);
  await assertEngagementAccess(input.engagementId, actor);
  if (!isFsV2Enabled()) {
    throw new Error("FS Engine v2 is disabled");
  }
  await transitionFinancialStatementStatus({
    engagementId: input.engagementId,
    statementId: input.statementId,
    toStatus: input.toStatus,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
}
