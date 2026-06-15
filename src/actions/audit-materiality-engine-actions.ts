"use server";

// ─── AuditOS L6.3 Materiality Engine Actions ───

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { materialityEngine, type MaterialityCalculationInput } from "@/lib/audit/materiality-engine";

export async function calculateMaterialityAction(input: MaterialityCalculationInput) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "manager"]);
  await assertEngagementAccess(input.engagementId, actor);

  return materialityEngine.calculate(actor, input);
}

export async function approveMaterialityAction(
  planningMaterialityId: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager"]);
  await assertEngagementAccess(engagementId, actor);

  return materialityEngine.approve(actor, planningMaterialityId, engagementId);
}

export async function getCurrentMaterialityAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "manager", "viewer"]);
  await assertEngagementAccess(engagementId, actor);

  return materialityEngine.getCurrent(engagementId);
}

export async function getMaterialityHistoryAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "manager"]);
  await assertEngagementAccess(engagementId, actor);

  return materialityEngine.getHistory(engagementId);
}

export async function recordMaterialityOverrideAction(input: {
  engagementId: string;
  materialityType: "planning" | "performance" | "trivial";
  materialityEntityId: string;
  overriddenAmount: number;
  originalAmount: number;
  currency: string;
  reason: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  await assertEngagementAccess(input.engagementId, actor);

  return materialityEngine.recordOverride(actor, input);
}

export async function getMethodologiesAction() {
  // No auth required — methodology list is static
  return materialityEngine.getMethodologies();
}

export async function suggestBenchmarkValueAction(
  engagementId: string,
  benchmarkType: "revenue" | "profit_before_tax" | "total_assets" | "net_assets" | "custom",
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "manager"]);
  await assertEngagementAccess(engagementId, actor);

  return materialityEngine.suggestBenchmarkValue(engagementId, benchmarkType);
}

export async function generateMaterialityWorkingPaperAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "manager", "viewer"]);
  await assertEngagementAccess(engagementId, actor);

  return materialityEngine.generateWorkingPaper(engagementId);
}
