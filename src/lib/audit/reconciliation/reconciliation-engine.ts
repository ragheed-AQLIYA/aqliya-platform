import "server-only";

import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { prisma } from "@/lib/prisma";
import {
  checkBalanceSheetEquation,
  checkIncomeToEquityFlow,
  checkLeadScheduleToFsTie,
  checkMappingCoverage,
  checkTbToLeadScheduleTie,
  parseStatementLines,
  checkCashFlowTie,
  type MappingInput,
} from "./reconciliation-checks";
import { isFsV2Enabled } from "@/lib/audit/fs-engine";
import type { ReconciliationRunResult } from "./types";

function isMissingTableError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2021"
  );
}

async function loadLeadSchedules(engagementId: string) {
  try {
    return await prisma.leadSchedule.findMany({
      where: { engagementId },
      include: { lines: true },
    });
  } catch (err) {
    if (isMissingTableError(err)) {
      console.warn(
        `[Reconciliation] LeadSchedule unavailable — schedule ties skipped for ${engagementId}`,
      );
      return [];
    }
    throw err;
  }
}

async function loadReconciliationContext(engagementId: string) {
  const [tb, mappings, schedules, statements, engagement] = await Promise.all([
    prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      include: { lines: true },
    }),
    prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
    }),
    loadLeadSchedules(engagementId),
    prisma.auditFinancialStatement.findMany({ where: { engagementId } }),
    prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { organizationId: true },
    }),
  ]);

  const mappingInputs: MappingInput[] = mappings.map((m) => ({
    id: m.id,
    sourceAccountCode: m.sourceAccountCode,
    sourceAccountName: m.sourceAccountName,
    status: m.status,
    debitAmount: m.debitAmount,
    creditAmount: m.creditAmount,
    statementClassification: m.statementClassification,
    canonicalAccount: m.canonicalAccount
      ? {
          code: m.canonicalAccount.code,
          category: m.canonicalAccount.category,
          statementType: m.canonicalAccount.statementType,
          name: m.canonicalAccount.name,
        }
      : null,
  }));

  const scheduleInputs = schedules.map((s) => ({
    id: s.id,
    accountCode: s.accountCode,
    currentYearBalance: s.currentYearBalance,
    lines: s.lines.map((l) => ({
      amount: l.amount,
      reference: l.reference,
    })),
  }));

  const statementInputs = statements.map((s) => ({
    id: s.id,
    statementType: s.statementType,
    lines: parseStatementLines(s.lines),
  }));

  return {
    organizationId: engagement?.organizationId,
    tbLines: (tb?.lines ?? []).map((l) => ({
      accountCode: l.accountCode,
      accountName: l.accountName,
      balance: l.balance,
      debitAmount: l.debitAmount,
      creditAmount: l.creditAmount,
    })),
    mappings: mappingInputs,
    schedules: scheduleInputs,
    statements: statementInputs,
  };
}

export async function runReconciliationForEngagement(
  engagementId: string,
): Promise<ReconciliationRunResult> {
  const data = await loadReconciliationContext(engagementId);

  const checks = [
    ...checkTbToLeadScheduleTie({
      mappings: data.mappings,
      schedules: data.schedules,
    }),
    ...checkLeadScheduleToFsTie({
      schedules: data.schedules,
      statements: data.statements,
    }),
    ...checkBalanceSheetEquation({ statements: data.statements }),
    ...checkIncomeToEquityFlow({ statements: data.statements }),
    ...checkMappingCoverage({
      mappings: data.mappings,
      schedules: data.schedules,
    }),
    ...(isFsV2Enabled()
      ? checkCashFlowTie({
          statements: data.statements,
          mappings: data.mappings,
        })
      : []),
  ];

  const failedCount = checks.filter(
    (c) => !c.passed && c.severity === "error",
  ).length;

  const result: ReconciliationRunResult = {
    engagementId,
    passed: failedCount === 0,
    checkCount: checks.length,
    failedCount,
    checks,
    runAt: new Date().toISOString(),
  };

  await prisma.auditEvent.create({
    data: {
      engagementId,
      eventType: "reconciliation.completed",
      actorId: "system",
      actorName: "Reconciliation Engine",
      actorRole: "system",
      targetType: "reconciliation",
      targetId: engagementId,
      newState: result.passed ? "passed" : "failed",
      description: `Reconciliation: ${result.checkCount} checks, ${result.failedCount} failed`,
      metadata: { checks: result.checks } as object,
    },
  });

  try {
    const { syncReconciliationToReportingGraph } = await import(
      "./reconciliation-graph-sync"
    );
    await syncReconciliationToReportingGraph(engagementId, result);
  } catch (err) {
    console.error(
      `[Reconciliation] graph sync failed for ${engagementId}`,
      err,
    );
  }

  return result;
}

export async function appendReconciliationValidationIssues(
  engagementId: string,
  runId: string,
  issues: Array<Record<string, unknown>>,
  startIdx: number,
  now: Date,
): Promise<number> {
  if (!isEnabled("audit.reconciliation")) return startIdx;

  const result = await runReconciliationForEngagement(engagementId);
  let idx = startIdx;

  for (const check of result.checks) {
    if (check.passed) continue;
    idx += 1;
    issues.push({
      id: `${runId}-i-${idx}`,
      validationRunId: runId,
      engagementId,
      checkType: check.checkType,
      severity: check.severity === "error" ? "high" : "medium",
      status: "open",
      title: `[${check.code}] ${check.messageEn}`,
      description: check.messageAr,
      message: check.messageEn,
      accountCode: null,
      accountName: null,
      expectedValue: check.expectedValue ?? null,
      actualValue: check.actualValue ?? null,
      difference: check.difference ?? null,
      createdAt: now,
    });
  }

  return idx;
}

export async function appendReconciliationApprovalGates(
  engagementId: string,
  blockingIssues: string[],
  checklist: Array<{ label: string; passed: boolean; detail: string }>,
): Promise<void> {
  if (!isEnabled("audit.reconciliation-gates")) return;

  const result = await runReconciliationForEngagement(engagementId);
  const failed = result.checks.filter((c) => !c.passed && c.severity === "error");

  checklist.push({
    label: "[Reconciliation] Factory tie-out checks",
    passed: failed.length === 0,
    detail:
      failed.length === 0
        ? `${result.checkCount} checks passed`
        : `${failed.length} failed: ${failed.map((c) => c.code).join(", ")}`,
  });

  if (failed.length > 0) {
    blockingIssues.push(
      `Reconciliation failed: ${failed.map((c) => c.code).join(", ")}`,
    );
  }
}
