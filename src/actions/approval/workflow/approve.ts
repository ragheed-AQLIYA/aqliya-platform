"use server";

import { createLogger } from "@/lib/observability/logger";

import { prisma } from "@/lib/prisma";
import {
  isExpectedAccessDeniedError,
  getCurrentUser,
} from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { logAudit } from "@/lib/decision/decision-audit";
import { notifyOnEvent } from "@/lib/platform/notification/integration";
import { buildSnapshotData } from "../common";

const logger = createLogger({ product: "platform", action: "unknown" });

export async function approveDecision(
  decisionId: string,
  notes?: string,
  overrideReason?: string,
) {
  try {
    const user = await getCurrentUser();

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { recommendation: true },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    await enforce(user, { type: "decision", id: decisionId, tenantId: decision.organizationId }, "admin");

    if (decision.status !== "IN_REVIEW") {
      return {
        success: false,
        error: `Decision cannot be approved in ${decision.status} status`,
      };
    }

    if (!decision.recommendation && !overrideReason) {
      return {
        success: false,
        error:
          "Recommendation is required before approval. Provide an override reason to approve without recommendation.",
      };
    }

    const snapshot = buildSnapshotData(decision.recommendation, overrideReason);

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "APPROVED" },
    });

    await prisma.approval.create({
      data: {
        decisionId,
        approverId: user.id,
        status: "APPROVED",
        comments: notes || "Approved without conditions",
        ...snapshot,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "DECISION_APPROVED",
      "Decision",
      JSON.stringify({
        status: "IN_REVIEW",
        recommendationId: decision.recommendation?.id,
      }),
      JSON.stringify({
        status: "APPROVED",
        notes,
        snapshotCreatedAt: snapshot.snapshotCreatedAt,
        overrideReason: snapshot.snapshotOverrideReason,
      }),
      user.organizationId,
    );

    try {
      await notifyOnEvent("on_approval", user.organizationId, decisionId, {
        productKey: "decisionos",
        templateKey: "decision_approved",
        recipientId: user.id,
        templateVars: {
          title: decision.title,
          approvedBy: user.name ?? "System",
          approvedAt: new Date().toISOString(),
        },
      });
    } catch {
      // Notification must not block the primary action
    }

    return { success: true, data: { status: updated.status, snapshot } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error approving decision:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to approve decision" };
  }
}

export async function approveWithConditions(
  decisionId: string,
  conditions: string,
  overrideReason?: string,
) {
  try {
    const user = await getCurrentUser();

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { recommendation: true },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    await enforce(user, { type: "decision", id: decisionId, tenantId: decision.organizationId }, "admin");

    if (decision.status !== "IN_REVIEW") {
      return {
        success: false,
        error: `Decision cannot be approved in ${decision.status} status`,
      };
    }

    if (!conditions || conditions.trim().length === 0) {
      return {
        success: false,
        error: "Conditions are required for conditional approval",
      };
    }

    if (!decision.recommendation && !overrideReason) {
      return {
        success: false,
        error:
          "Recommendation is required before approval. Provide an override reason to approve without recommendation.",
      };
    }

    const snapshot = buildSnapshotData(decision.recommendation, overrideReason);

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "APPROVED" },
    });

    await prisma.approval.create({
      data: {
        decisionId,
        approverId: user.id,
        status: "APPROVED",
        comments: `Approved with conditions: ${conditions}`,
        ...snapshot,
        snapshotConditions: conditions,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "DECISION_APPROVED_WITH_CONDITIONS",
      "Decision",
      JSON.stringify({
        status: "IN_REVIEW",
        recommendationId: decision.recommendation?.id,
      }),
      JSON.stringify({
        status: "APPROVED",
        conditions,
        snapshotCreatedAt: snapshot.snapshotCreatedAt,
        overrideReason: snapshot.snapshotOverrideReason,
      }),
      user.organizationId,
    );

    try {
      await notifyOnEvent("on_approval", user.organizationId, decisionId, {
        productKey: "decisionos",
        templateKey: "decision_approved",
        recipientId: user.id,
        templateVars: {
          title: decision.title,
          approvedBy: user.name ?? "System",
          approvedAt: new Date().toISOString(),
        },
      });
    } catch {
      // Notification must not block the primary action
    }

    return { success: true, data: { status: updated.status, snapshot } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error approving with conditions:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to approve with conditions" };
  }
}
