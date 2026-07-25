import { prisma } from "@/lib/prisma";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";
import { getValidationRun } from "../get-validation-run";
import type { IssueInput } from "./common";
import { computeSummaryAndTrust } from "./common";

export async function persistRun(
  runId: string,
  engagementId: string,
  actorId: string,
  issues: IssueInput[],
  now: Date,
) {
  await prisma.auditValidationIssue.createMany({ data: issues });

  const { summary, critical, high, medium, low, trustState } =
    computeSummaryAndTrust(issues);

  await prisma.auditValidationRun.update({
    where: { id: runId },
    data: {
      summary,
      issueCount: issues.length,
      criticalCount: critical,
      highCount: high,
      mediumCount: medium,
      lowCount: low,
      trustState,
    },
  });

  await recordAuditOsAuditEvent({
    engagementId,
    eventType: "validation.run_completed",
    actorId,
    actorName: "System",
    actorRole: "system",
    targetType: "validation_run",
    targetId: runId,
    newState: "completed",
    description: `Validation run completed: ${issues.length} issue(s) found`,
  });

  return await getValidationRun(engagementId);
}
