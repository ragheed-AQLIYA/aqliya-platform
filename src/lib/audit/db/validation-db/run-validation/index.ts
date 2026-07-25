import { prisma } from "@/lib/prisma";
import type { ValidationRun } from "@/types/audit";
import type { IssueInput } from "./common";
import { issueId } from "./common";
import { checkBalanceEquality } from "./balance-check";
import { checkUnmappedAccounts } from "./unmapped-accounts";
import { checkMappingConsistency } from "./mapping-consistency";
import { checkMissingEvidence } from "./missing-evidence";
import { checkStatementExistence } from "./statement-existence";
import { persistRun } from "./persist";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "auditos", action: "run-validation" });

export async function runValidation(
  engagementId: string,
  actorId: string,
): Promise<ValidationRun> {
  try {
    const _existing = await prisma.auditValidationRun.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    const now = new Date();
    const runId = `vr-${Date.now()}`;
    const _run = await prisma.auditValidationRun.create({
      data: {
        id: runId,
        engagementId,
        validationType: "full",
        status: "completed",
        trustState: "conditional",
        createdBy: actorId,
        completedAt: now,
      },
    });

    const rawIssues: IssueInput[] = [
      ...(await checkBalanceEquality(engagementId, runId, now)),
      ...(await checkUnmappedAccounts(engagementId, runId, now)),
      ...(await checkMappingConsistency(engagementId, runId, now)),
      ...(await checkMissingEvidence(engagementId, runId, now)),
      ...(await checkStatementExistence(engagementId, runId, now)),
    ];

    let idx = 0;
    const issues: IssueInput[] = rawIssues.map((issue) => ({
      ...issue,
      id: issueId(runId, ++idx),
    }));

    try {
      const { appendReconciliationValidationIssues } = await import(
        "@/lib/audit/reconciliation/reconciliation-engine"
      );
      idx = await appendReconciliationValidationIssues(
        engagementId,
        runId,
        issues as unknown as Array<Record<string, unknown>>,
        idx,
        now,
      );
    } catch (reconErr) {
      logger.error(
        `[AuditDB] reconciliation validation append failed for ${engagementId}`,
        reconErr instanceof Error ? reconErr : undefined,
      );
    }

    try {
      const { appendIfrsValidationIssues } = await import(
        "@/lib/audit/rules/ifrs-rules-engine"
      );
      idx = await appendIfrsValidationIssues(
        engagementId,
        runId,
        issues as unknown as Array<Record<string, unknown>>,
        idx,
        now,
      );
    } catch (ifrsErr) {
      logger.error(
        `[AuditDB] IFRS validation append failed for ${engagementId}`,
        ifrsErr instanceof Error ? ifrsErr : undefined,
      );
    }

    try {
      const { appendSocpaValidationIssues } = await import(
        "@/lib/audit/rules/socpa-rules-engine"
      );
      idx = await appendSocpaValidationIssues(
        engagementId,
        runId,
        issues as unknown as Array<Record<string, unknown>>,
        idx,
        now,
      );
    } catch (socpaErr) {
      logger.error(
        `[AuditDB] SOCPA validation append failed for ${engagementId}`,
        socpaErr instanceof Error ? socpaErr : undefined,
      );
    }

    return (await persistRun(runId, engagementId, actorId, issues, now))!;
  } catch (error) {
    logger.error(
      `[AuditDB] runValidation(${engagementId}) failed. Mock fallback disabled for mutation path.`,
      error instanceof Error ? error : undefined,
    );
    throw new Error(
      `AuditOS mutation unavailable: runValidation(${engagementId}). Mock fallback disabled.`,
    );
  }
}
