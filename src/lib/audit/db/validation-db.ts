import { prisma } from "@/lib/prisma";
import type { ValidationRun, ValidationIssue } from "@/types/audit";
import {
  protectedAuditReadUnavailable,
} from "./types";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";

function _severityRank(s: string): number {
  if (s === "critical") return 0;
  if (s === "high") return 1;
  if (s === "medium") return 2;
  return 3;
}

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

    const issues: Array<{
      id: string;
      validationRunId: string;
      engagementId: string;
      checkType: string;
      severity: string;
      status: string;
      title: string;
      description: string;
      message: string;
      accountCode: string | null;
      accountName: string | null;
      expectedValue: number | null;
      actualValue: number | null;
      difference: number | null;
      createdAt: Date;
    }> = [];

    let idx = 0;
    const issueId = (n: number) => `${runId}-i-${n}`;

    const tb = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });

    const mappings = await prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
    });

    const evidence = await prisma.auditEvidence.findMany({
      where: { engagementId },
    });
    const statements = await prisma.auditFinancialStatement.findMany({
      where: { engagementId },
    });

    // Check 1: Trial balance balance check
    if (tb) {
      const tbLines = tb.lines ?? [];
      const totalDebits = tbLines.reduce(
        (s: number, l: { debitAmount: number }) => s + l.debitAmount,
        0,
      );
      const totalCredits = tbLines.reduce(
        (s: number, l: { creditAmount: number }) => s + l.creditAmount,
        0,
      );
      const variance = totalDebits - totalCredits;
      const sev =
        Math.abs(variance) < 1 ? "low" : variance > 10000 ? "high" : "medium";
      issues.push({
        id: issueId(++idx),
        validationRunId: runId,
        engagementId,
        checkType: "balance_equality",
        severity: sev,
        status: "open",
        title: "Trial Balance Balance Check",
        description: "Verify total debits equal total credits",
        message:
          Math.abs(variance) < 1
            ? `Trial balance is balanced (variance: SAR ${variance.toFixed(2)})`
            : `Trial balance is unbalanced — variance: SAR ${variance.toFixed(2)}`,
        accountCode: null,
        accountName: null,
        expectedValue: null,
        actualValue: variance,
        difference: variance,
        createdAt: now,
      });
    }

    // Check 2: Unmapped accounts
    const pendingMappings = mappings.filter((m) => m.status === "pending");
    if (pendingMappings.length > 0) {
      issues.push({
        id: issueId(++idx),
        validationRunId: runId,
        engagementId,
        checkType: "missing_mappings",
        severity: pendingMappings.length > 3 ? "high" : "medium",
        status: "open",
        title: "Unmapped Accounts",
        description: `${pendingMappings.length} account(s) require mapping`,
        message: `Accounts pending mapping: ${pendingMappings.map((m) => `${m.sourceAccountCode} - ${m.sourceAccountName}`).join(", ")}`,
        accountCode: null,
        accountName: null,
        expectedValue: null,
        actualValue: pendingMappings.length,
        difference: null,
        createdAt: now,
      });
    }

    // Check 3: Mapping amount consistency
    for (const m of mappings) {
      if (m.status !== "confirmed") continue;
      const line = tb?.lines.find(
        (l: { id: string }) => l.id === m.sourceAccountId,
      );
      if (
        line &&
        (Math.abs(m.debitAmount - line.debitAmount) > 1 ||
          Math.abs(m.creditAmount - line.creditAmount) > 1)
      ) {
        issues.push({
          id: issueId(++idx),
          validationRunId: runId,
          engagementId,
          checkType: "classification_conflict",
          severity: "medium",
          status: "open",
          title: `Mapping Amount Mismatch: ${m.sourceAccountCode}`,
          description: `Mapping amount for ${m.sourceAccountName} (${m.sourceAccountCode}) does not match trial balance`,
          message: `Mapping: Debit ${m.debitAmount}, Credit ${m.creditAmount} | TB: Debit ${line.debitAmount}, Credit ${line.creditAmount}`,
          accountCode: m.sourceAccountCode,
          accountName: m.sourceAccountName,
          expectedValue: line.debitAmount || line.creditAmount,
          actualValue: m.debitAmount || m.creditAmount,
          difference: null,
          createdAt: now,
        });
      }
      if (idx >= 30) break;
    }

    // Check 4: Missing evidence
    const missingEvidence = evidence.filter((e) => e.state === "missing");
    if (missingEvidence.length > 0) {
      issues.push({
        id: issueId(++idx),
        validationRunId: runId,
        engagementId,
        checkType: "completeness",
        severity: missingEvidence.length > 2 ? "high" : "medium",
        status: "open",
        title: "Missing Evidence",
        description: `${missingEvidence.length} evidence item(s) are missing or not uploaded`,
        message: `${missingEvidence.map((e) => e.filename).join(", ")}`,
        accountCode: null,
        accountName: null,
        expectedValue: null,
        actualValue: missingEvidence.length,
        difference: null,
        createdAt: now,
      });
    }

    // Check 5: Statement existence
    if (statements.length === 0) {
      issues.push({
        id: issueId(++idx),
        validationRunId: runId,
        engagementId,
        checkType: "completeness",
        severity: "medium",
        status: "open",
        title: "No Financial Statements Generated",
        description: "No financial statements found for this engagement",
        message: "Run account mapping to generate financial statements",
        accountCode: null,
        accountName: null,
        expectedValue: null,
        actualValue: null,
        difference: null,
        createdAt: now,
      });
    }

    try {
      const { appendReconciliationValidationIssues } = await import(
        "@/lib/audit/reconciliation/reconciliation-engine"
      );
      idx = await appendReconciliationValidationIssues(
        engagementId,
        runId,
        issues,
        idx,
        now,
      );
    } catch (reconErr) {
      console.error(
        `[AuditDB] reconciliation validation append failed for ${engagementId}`,
        reconErr,
      );
    }

    try {
      const { appendIfrsValidationIssues } = await import(
        "@/lib/audit/rules/ifrs-rules-engine"
      );
      idx = await appendIfrsValidationIssues(
        engagementId,
        runId,
        issues,
        idx,
        now,
      );
    } catch (ifrsErr) {
      console.error(
        `[AuditDB] IFRS validation append failed for ${engagementId}`,
        ifrsErr,
      );
    }

    try {
      const { appendSocpaValidationIssues } = await import(
        "@/lib/audit/rules/socpa-rules-engine"
      );
      idx = await appendSocpaValidationIssues(
        engagementId,
        runId,
        issues,
        idx,
        now,
      );
    } catch (socpaErr) {
      console.error(
        `[AuditDB] SOCPA validation append failed for ${engagementId}`,
        socpaErr,
      );
    }

    // Persist issues
    for (const i of issues) {
      await prisma.auditValidationIssue.create({ data: i });
    }

    // Update summary counts
    const critical = issues.filter((i) => i.severity === "critical").length;
    const high = issues.filter((i) => i.severity === "high").length;
    const medium = issues.filter((i) => i.severity === "medium").length;
    const low = issues.filter((i) => i.severity === "low").length;
    const summaryParts: string[] = [];
    if (issues.length === 0) summaryParts.push("All checks passed");
    if (critical > 0) summaryParts.push(`${critical} critical`);
    if (high > 0) summaryParts.push(`${high} high`);
    if (medium > 0) summaryParts.push(`${medium} medium`);
    if (low > 0) summaryParts.push(`${low} low`);

    const trustState =
      critical > 0 ? "blocked" : high > 0 ? "conditional" : "trusted";

    await prisma.auditValidationRun.update({
      where: { id: runId },
      data: {
        summary: summaryParts.join(", "),
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

    // Return the persisted run
    return (await getValidationRun(engagementId))!;
  } catch (error) {
    console.error(
      `[AuditDB] runValidation(${engagementId}) failed. Mock fallback disabled for mutation path.`,
      error,
    );
    throw new Error(
      `AuditOS mutation unavailable: runValidation(${engagementId}). Mock fallback disabled.`,
    );
  }
}

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
    console.warn(`[AuditDB] disposeValidationIssue(${issueId}) error`, error);
    return null;
  }
}
