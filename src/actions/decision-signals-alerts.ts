"use server";

import { acknowledgeSignal, acknowledgeAlert, resolveAlert, getSignalsByDecision, getAlertsByDecision } from "@/lib/decision/signals-alerts";
import { validateIntelligenceGate } from "@/lib/decision/intelligence-gate";
import { revalidatePath } from "next/cache";
import { requireDecisionAccess } from "@/lib/auth";
import { logAudit, toAuditJson } from "@/lib/platform-audit";
import { prisma } from "@/lib/prisma";

// Signals - acknowledge requires operator (or admin)
export async function acknowledgeSignalAction(
  decisionId: string,
  signalId: string
) {
  const { user } = await requireDecisionAccess(decisionId, "OPERATOR")
  
  const gate = await validateIntelligenceGate(decisionId);
  if (!gate.allowed) {
    return { error: `Cannot acknowledge signal: ${gate.missing.join(", ")}` };
  }

  try {
    const before = await prisma.decisionMonitoringSignal.findUnique({ where: { id: signalId } })
    if (!before || before.decisionId !== decisionId) {
      return { error: "Signal not found" }
    }
    const updated = await acknowledgeSignal(signalId, user.id);
    await logAudit(
      user.id,
      decisionId,
      "DECISION_UPDATED",
      "DecisionMonitoringSignal",
      toAuditJson(before),
      toAuditJson(updated),
      user.organizationId
    )
    revalidatePath(`/decisions/${decisionId}/signals`);
    return { success: true };
  } catch {
    return { error: "Failed to acknowledge signal" };
  }
}

// Alerts - acknowledge requires operator (or admin)
export async function acknowledgeAlertAction(
  decisionId: string,
  alertId: string
) {
  const { user } = await requireDecisionAccess(decisionId, "OPERATOR")
  
  const gate = await validateIntelligenceGate(decisionId);
  if (!gate.allowed) {
    return { error: `Cannot acknowledge alert: ${gate.missing.join(", ")}` };
  }

  try {
    const before = await prisma.decisionRiskAlert.findUnique({ where: { id: alertId } })
    if (!before || before.decisionId !== decisionId) {
      return { error: "Alert not found" }
    }
    const updated = await acknowledgeAlert(alertId, user.id);
    await logAudit(
      user.id,
      decisionId,
      "DECISION_UPDATED",
      "DecisionRiskAlert",
      toAuditJson(before),
      toAuditJson(updated),
      user.organizationId
    )
    revalidatePath(`/decisions/${decisionId}/alerts`);
    return { success: true };
  } catch {
    return { error: "Failed to acknowledge alert" };
  }
}

// Alerts - resolve requires admin only
export async function resolveAlertAction(
  decisionId: string,
  alertId: string,
  resolution: string
) {
  const { user } = await requireDecisionAccess(decisionId, "ADMIN")
  
  const gate = await validateIntelligenceGate(decisionId);
  if (!gate.allowed) {
    return { error: `Cannot resolve alert: ${gate.missing.join(", ")}` };
  }

  try {
    const before = await prisma.decisionRiskAlert.findUnique({ where: { id: alertId } })
    if (!before || before.decisionId !== decisionId) {
      return { error: "Alert not found" }
    }
    const updated = await resolveAlert(alertId, user.id, resolution);
    await logAudit(
      user.id,
      decisionId,
      "ALERT_RESOLVED",
      "DecisionRiskAlert",
      toAuditJson(before),
      toAuditJson(updated),
      user.organizationId
    )
    revalidatePath(`/decisions/${decisionId}/alerts`);
    return { success: true };
  } catch {
    return { error: "Failed to resolve alert" };
  }
}

// View signals - requires operator (or admin)
export async function getSignalsAction(decisionId: string) {
  await requireDecisionAccess(decisionId, "OPERATOR")
  
  const gate = await validateIntelligenceGate(decisionId);
  if (!gate.allowed) {
    return { error: `Cannot view signals: ${gate.missing.join(", ")}` };
  }

  try {
    const signals = await getSignalsByDecision(decisionId);
    return { data: signals };
  } catch {
    return { error: "Failed to fetch signals" };
  }
}

// View alerts - requires operator (or admin)
export async function getAlertsAction(decisionId: string) {
  await requireDecisionAccess(decisionId, "OPERATOR")
  
  const gate = await validateIntelligenceGate(decisionId);
  if (!gate.allowed) {
    return { error: `Cannot view alerts: ${gate.missing.join(", ")}` };
  }

  try {
    const alerts = await getAlertsByDecision(decisionId);
    return { data: alerts };
  } catch {
    return { error: "Failed to fetch alerts" };
  }
}
