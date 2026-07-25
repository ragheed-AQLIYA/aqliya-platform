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
import { assertDecisionOsTransition } from "@/lib/core/workflow/decision-os-adapter";
import { buildSnapshotData } from "../common";

const logger = createLogger({ product: "platform", action: "unknown" });

export async function rejectDecision(decisionId: string, reason: string) {
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
        error: `Decision cannot be rejected in ${decision.status} status`,
      };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "Rejection reason is required" };
    }

    assertDecisionOsTransition(decision.status, "reject");

    const snapshot = buildSnapshotData(decision.recommendation);

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "REJECTED" },
    });

    await prisma.approval.create({
      data: {
        decisionId,
        approverId: user.id,
        status: "REJECTED",
        comments: reason,
        ...snapshot,
      },
    });

    await logAudit(
      user.id,
      decisionId,
      "DECISION_REJECTED",
      "Decision",
      JSON.stringify({ status: "IN_REVIEW" }),
      JSON.stringify({ status: "REJECTED", reason }),
      user.organizationId,
    );

    try {
      await notifyOnEvent("on_rejection", user.organizationId, decisionId, {
        productKey: "decisionos",
        templateKey: "decision_rejected",
        recipientId: user.id,
        templateVars: {
          title: decision.title,
          reason: reason,
        },
      });
    } catch {
      // Notification must not block the primary action
    }

    return { success: true, data: { status: updated.status } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error rejecting decision:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to reject decision" };
  }
}

export async function requestRevision(decisionId: string, reason: string) {
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
        error: `Revision cannot be requested in ${decision.status} status`,
      };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "Revision reason is required" };
    }

    assertDecisionOsTransition(decision.status, "return");

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "DRAFT" },
    });

    await logAudit(
      user.id,
      decisionId,
      "REVISION_REQUESTED",
      "Decision",
      JSON.stringify({ status: "IN_REVIEW" }),
      JSON.stringify({ status: "DRAFT", reason }),
      user.organizationId,
    );

    return { success: true, data: { status: updated.status } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error requesting revision:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to request revision" };
  }
}

export async function requestReReview(decisionId: string, reason: string) {
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

    if (decision.status !== "APPROVED" && decision.status !== "IN_REVIEW") {
      return {
        success: false,
        error: `Re-review cannot be requested in ${decision.status} status`,
      };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "Re-review reason is required" };
    }

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "DRAFT" },
    });

    await logAudit(
      user.id,
      decisionId,
      "REVISION_REQUESTED",
      "Decision",
      JSON.stringify({
        status: decision.status,
        reason: "re-review due to recommendation change",
      }),
      JSON.stringify({ status: "DRAFT", reason: reason.trim() }),
      user.organizationId,
    );

    return { success: true, data: { status: updated.status } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error requesting re-review:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to request re-review" };
  }
}
