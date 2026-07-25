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

const logger = createLogger({ product: "platform", action: "unknown" });

export async function submitForReview(decisionId: string) {
  try {
    const user = await getCurrentUser();

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { recommendation: true },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    await enforce(user, { type: "decision", id: decisionId, tenantId: decision.organizationId }, "update");

    if (decision.status !== "DRAFT") {
      return {
        success: false,
        error: `Decision cannot be submitted for review in ${decision.status} status`,
      };
    }

    assertDecisionOsTransition(decision.status, "submit");

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: { status: "IN_REVIEW" },
    });

    await logAudit(
      user.id,
      decisionId,
      "SUBMITTED_FOR_REVIEW",
      "Decision",
      JSON.stringify({ status: "DRAFT" }),
      JSON.stringify({ status: "IN_REVIEW" }),
      user.organizationId,
    );

    try {
      await notifyOnEvent("on_review", user.organizationId, decisionId, {
        productKey: "decisionos",
        templateKey: "decision_for_review",
        recipientId: user.id,
        templateVars: {
          title: decision.title,
          decisionType: decision.type,
          requestedAt: new Date().toISOString(),
        },
      });
    } catch {
      // Notification must not block the primary action
    }

    return { success: true, data: { status: updated.status } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error submitting for review:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to submit for review" };
  }
}
