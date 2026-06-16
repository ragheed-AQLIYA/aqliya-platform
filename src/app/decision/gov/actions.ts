"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  createEscalationRule as svcCreateEscalationRule,
  getActiveEscalations as svcGetActiveEscalations,
  processEscalations as svcProcessEscalations,
  getDecisionEventLog as svcGetDecisionEventLog,
  DecisionGovError,
} from "@/lib/platform/decision-gov";
import type { CreateEscalationRuleData } from "@/lib/platform/decision-gov";

export async function getEscalationRules() {
  try {
    const user = await getCurrentUser();
    const rules = await prisma.decisionEscalationRule.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true as const, data: rules };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to fetch escalation rules",
    };
  }
}

export async function createEscalationRuleAction(data: CreateEscalationRuleData) {
  try {
    const user = await getCurrentUser();
    const rule = await svcCreateEscalationRule(user.organizationId, data);

    await writePlatformAuditLog({
      productKey: "decision",
      action: "DECISION_UPDATED",
      targetType: "decisionEscalationRule",
      targetId: rule.id,
      actorId: user.id,
      metadata: { action: "CREATE_ESCALATION_RULE", ...data },
    });

    revalidatePath("/decision/gov");
    return { success: true as const, data: rule };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof DecisionGovError ? err.message : "Failed to create escalation rule",
    };
  }
}

export async function updateEscalationRuleAction(
  ruleId: string,
  data: Partial<CreateEscalationRuleData> & { isActive?: boolean },
) {
  try {
    const user = await getCurrentUser();
    const existing = await prisma.decisionEscalationRule.findUnique({
      where: { id: ruleId },
    });
    if (!existing) throw new DecisionGovError("Escalation rule not found");
    if (existing.organizationId !== user.organizationId) {
      throw new DecisionGovError("Access denied");
    }

    const rule = await prisma.decisionEscalationRule.update({
      where: { id: ruleId },
      data: {
        ...(data.escalateAfterHours !== undefined && { escalateAfterHours: data.escalateAfterHours }),
        ...(data.targetRoleSlug !== undefined && { targetRoleSlug: data.targetRoleSlug }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    await writePlatformAuditLog({
      productKey: "decision",
      action: "DECISION_UPDATED",
      targetType: "decisionEscalationRule",
      targetId: rule.id,
      actorId: user.id,
      metadata: { action: "UPDATE_ESCALATION_RULE", ...data },
    });

    revalidatePath("/decision/gov");
    return { success: true as const, data: rule };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof DecisionGovError ? err.message : "Failed to update escalation rule",
    };
  }
}

export async function deleteEscalationRuleAction(ruleId: string) {
  try {
    const user = await getCurrentUser();
    const existing = await prisma.decisionEscalationRule.findUnique({
      where: { id: ruleId },
    });
    if (!existing) throw new DecisionGovError("Escalation rule not found");
    if (existing.organizationId !== user.organizationId) {
      throw new DecisionGovError("Access denied");
    }

    await prisma.decisionEscalationRule.delete({ where: { id: ruleId } });

    await writePlatformAuditLog({
      productKey: "decision",
      action: "DECISION_UPDATED",
      targetType: "decisionEscalationRule",
      targetId: ruleId,
      actorId: user.id,
      metadata: { action: "DELETE_ESCALATION_RULE" },
    });

    revalidatePath("/decision/gov");
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof DecisionGovError ? err.message : "Failed to delete escalation rule",
    };
  }
}

export async function getGovernanceEvents() {
  try {
    const user = await getCurrentUser();
    const decisionIds = await prisma.decision.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true },
    });
    const ids = decisionIds.map((d) => d.id);
    if (ids.length === 0) return { success: true as const, data: [] };

    const events = await prisma.decisionGovEvent.findMany({
      where: { decisionId: { in: ids } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true as const, data: events };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to fetch governance events",
    };
  }
}

export async function getActiveEscalationsAction() {
  try {
    const escalations = await svcGetActiveEscalations();
    return { success: true as const, data: escalations };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to fetch active escalations",
    };
  }
}

export async function processEscalationsAction() {
  try {
    const user = await getCurrentUser();
    const count = await svcProcessEscalations();

    await writePlatformAuditLog({
      productKey: "decision",
      action: "DECISION_UPDATED",
      targetType: "decision",
      actorId: user.id,
      metadata: { action: "PROCESS_ESCALATIONS", count },
    });

    revalidatePath("/decision/gov");
    return { success: true as const, data: count };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to process escalations",
    };
  }
}

export async function getDecisionEventLogAction(decisionId: string) {
  try {
    const events = await svcGetDecisionEventLog(decisionId);
    return { success: true as const, data: events };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to fetch decision event log",
    };
  }
}
