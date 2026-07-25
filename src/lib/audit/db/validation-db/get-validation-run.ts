import { prisma } from "@/lib/prisma";
import type { ValidationRun, ValidationIssue } from "@/types/audit";
import {
  protectedAuditReadUnavailable,
} from "../types";

export async function getValidationRun(
  engagementId: string,
): Promise<ValidationRun | null> {
  try {
    const run = await prisma.auditValidationRun.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      include: {
        issues: {
          include: { dispositions: true },
          orderBy: { severity: "asc" },
        },
      },
    });
    if (!run) return null;
    return {
      id: run.id,
      engagementId: run.engagementId,
      validationType: run.validationType,
      status: run.status as ValidationRun["status"],
      summary: run.summary ?? "",
      trustState: run.trustState as ValidationRun["trustState"],
      validatedAt:
        run.completedAt?.toISOString() ?? run.createdAt.toISOString(),
      issues: run.issues.map((i) => ({
        id: i.id,
        validationRunId: i.validationRunId,
        checkType: i.checkType as ValidationIssue["checkType"],
        severity: i.severity as ValidationIssue["severity"],
        status: (i.status as ValidationIssue["status"]) ?? "open",
        description: i.description ?? i.title,
        accountCode: i.accountCode ?? undefined,
        accountName: i.accountName ?? undefined,
        expectedValue: i.expectedValue ?? undefined,
        actualValue: i.actualValue ?? undefined,
        message: i.message ?? "",
        disposedById: i.dispositions[0]?.disposedById ?? undefined,
        disposedAt: i.dispositions[0]?.disposedAt?.toISOString() ?? undefined,
        disposition: i.dispositions[0]?.action ?? undefined,
      })),
    };
  } catch (error) {
    protectedAuditReadUnavailable(`getValidationRun(${engagementId})`, error);
  }
}
