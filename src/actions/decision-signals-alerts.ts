"use server";

import {
  acknowledgeSignal,
  acknowledgeAlert,
  resolveAlert,
  getSignalsByDecision,
  getAlertsByDecision,
} from "@/lib/decision/signals-alerts";
import { buildMonitoringSignalsFromRisks } from "@/lib/decision/signal-automation";
import { validateIntelligenceGate } from "@/lib/decision/intelligence-gate";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { logAudit, toAuditJson } from "@/lib/decision/decision-audit";
import { prisma } from "@/lib/prisma";

// Signals - acknowledge requires operator (or admin)
export async function acknowledgeSignalAction(
  decisionId: string,
  signalId: string
) {
  const user = await getCurrentUser();
  const decisionLookup = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { organizationId: true },
  });
  if (!decisionLookup) {
    return { error: "Decision not found" };
  }
  await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update");
  
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
      decisionLookup.organizationId
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
  const user = await getCurrentUser();
  const decisionLookup = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { organizationId: true },
  });
  if (!decisionLookup) {
    return { error: "Decision not found" };
  }
  await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update");
  
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
      decisionLookup.organizationId
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
  const user = await getCurrentUser();
  const decisionLookup = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { organizationId: true },
  });
  if (!decisionLookup) {
    return { error: "Decision not found" };
  }
  await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "admin");
  
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
      decisionLookup.organizationId
    )
    revalidatePath(`/decisions/${decisionId}/alerts`);
    return { success: true };
  } catch {
    return { error: "Failed to resolve alert" };
  }
}

/** D3-02 — generate system monitoring signals from HIGH/MEDIUM risks (APPROVED only) */
export async function runMonitoringSignalAutomationAction(decisionId: string) {
  const user = await getCurrentUser();
  const decisionLookup = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { organizationId: true },
  });
  if (!decisionLookup) {
    return { error: "Decision not found" };
  }
  await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update");

  const gate = await validateIntelligenceGate(decisionId);
  if (!gate.allowed) {
    return { error: `Cannot run signal automation: ${gate.missing.join(", ")}` };
  }

  try {
    const decision = await prisma.decision.findFirst({
      where: { id: decisionId, organizationId: decisionLookup.organizationId },
      include: {
        risks: { select: { id: true, description: true, level: true } },
        signals: { select: { referenceId: true, source: true } },
      },
    });
    if (!decision) return { error: "Decision not found" };

    const existingReferenceIds = new Set(
      decision.signals
        .filter((s) => s.source === "risk")
        .map((s) => s.referenceId),
    );

    const drafts = buildMonitoringSignalsFromRisks({
      decisionId: decision.id,
      organizationId: decision.organizationId,
      decisionStatus: decision.status,
      risks: decision.risks,
      existingReferenceIds,
    });

    if (drafts.length === 0) {
      return { success: true, created: 0 };
    }

    await prisma.decisionMonitoringSignal.createMany({
      data: drafts.map((d) => ({
        decisionId: d.decisionId,
        organizationId: d.organizationId,
        source: d.source,
        referenceId: d.referenceId,
        signalType: d.signalType,
        description: d.description,
        severity: d.severity,
        generatedBy: "system",
        status: "NEW",
      })),
    });

    await logAudit(
      user.id,
      decisionId,
      "DECISION_UPDATED",
      "DecisionMonitoringSignal",
      "DecisionMonitoringSignal",
      toAuditJson({ created: drafts.length, automation: "D3-02" }),
      decisionLookup.organizationId,
    );

    revalidatePath(`/decisions/${decisionId}/signals`);
    return { success: true, created: drafts.length };
  } catch {
    return { error: "Failed to run monitoring signal automation" };
  }
}

// View signals - requires operator (or admin)
export async function getSignalsAction(decisionId: string) {
  const user = await getCurrentUser();
  const decisionLookup = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { organizationId: true },
  });
  if (!decisionLookup) {
    return { error: "Decision not found" };
  }
  await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update");
  
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

// Org-wide signals dashboard
export async function getAllSignalsAction() {
  const user = await getCurrentUser();
  try {
    const signals = await prisma.decisionMonitoringSignal.findMany({
      where: { organizationId: user.organizationId },
      include: {
        decision: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { data: signals };
  } catch {
    return { error: "Failed to fetch signals" };
  }
}

// Batch acknowledge signals (NEW → ACKNOWLEDGED)
export async function batchAcknowledgeSignalsAction(signalIds: string[]) {
  const user = await getCurrentUser();
  try {
    await prisma.decisionMonitoringSignal.updateMany({
      where: {
        id: { in: signalIds },
        organizationId: user.organizationId,
        status: "NEW",
      },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedBy: user.id,
        acknowledgedAt: new Date(),
      },
    });
    revalidatePath("/decisions/signals");
    return { success: true };
  } catch {
    return { error: "Failed to acknowledge signals" };
  }
}

// View alerts - requires operator (or admin)
export async function getAlertsAction(decisionId: string) {
  const user = await getCurrentUser();
  const decisionLookup = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { organizationId: true },
  });
  if (!decisionLookup) {
    return { error: "Decision not found" };
  }
  await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update");
  
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
