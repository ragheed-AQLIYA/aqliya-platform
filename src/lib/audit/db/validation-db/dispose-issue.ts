import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/observability/logger";
import type { ValidationRun } from "@/types/audit";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";
import { getValidationRun } from "./get-validation-run";

const logger = createLogger({ product: "platform", action: "unknown" });

export async function disposeValidationIssue(
  issueId: string,
  action: string,
  rationale: string | undefined,
  actorId: string,
  actorName: string,
): Promise<ValidationRun | null> {
  try {
    const issue = await prisma.auditValidationIssue.findUnique({
      where: { id: issueId },
      select: { id: true, engagementId: true },
    });
    if (!issue) throw new Error("Validation issue not found");

    const newStatus =
      action === "accepted"
        ? "accepted"
        : action === "dismissed"
          ? "dismissed"
          : "investigated";

    await prisma.auditValidationDisposition.create({
      data: {
        issueId,
        engagementId: issue.engagementId,
        action,
        rationale: rationale ?? null,
        disposedById: actorId,
      },
    });

    await prisma.auditValidationIssue.update({
      where: { id: issueId },
      data: { status: newStatus },
    });

    await recordAuditOsAuditEvent({
      engagementId: issue.engagementId,
      eventType: "validation.issue_disposed",
      actorId,
      actorName,
      actorRole: "reviewer",
      targetType: "validation_issue",
      targetId: issueId,
      newState: newStatus,
      description: `Validation issue ${action}${rationale ? ": " + rationale.substring(0, 80) : ""}`,
    });

    return getValidationRun(issue.engagementId);
  } catch (error) {
    logger.warn("[AuditDB] disposeValidationIssue(${issueId}) error", { error: error instanceof Error ? error?.message : String(error) });
    return null;
  }
}
