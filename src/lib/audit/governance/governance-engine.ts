import "server-only";

import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { evaluateFactoryApprovalGates } from "./approval-gates";
import {
  ApprovalGatesBlockedError,
  type FactoryGateSnapshot,
} from "./types";

export function isApprovalGatesEnabled(): boolean {
  return isEnabled("audit.approval-gates");
}

async function loadFactoryGateSnapshot(
  engagementId: string,
): Promise<FactoryGateSnapshot> {
  const [notes, statements, latestRun] = await Promise.all([
    prisma.auditDisclosureNote.findMany({
      where: { engagementId },
      select: {
        id: true,
        title: true,
        status: true,
        content: true,
        missingInformation: true,
        aiDrafted: true,
      },
    }),
    prisma.auditFinancialStatement.findMany({
      where: { engagementId },
      select: { id: true, statementType: true, status: true },
    }),
    prisma.auditValidationRun.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
  ]);

  let validationIssues: FactoryGateSnapshot["validationIssues"] = [];
  if (latestRun) {
    const issues = await prisma.auditValidationIssue.findMany({
      where: { validationRunId: latestRun.id },
      select: { severity: true, status: true, checkType: true },
    });
    validationIssues = issues;
  }

  return {
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      status: n.status,
      content: n.content,
      missingInformation: Array.isArray(n.missingInformation)
        ? (n.missingInformation as string[])
        : [],
      aiDrafted: n.aiDrafted,
    })),
    statements,
    validationIssues,
  };
}

export async function evaluateFactoryApprovalGatesForEngagement(
  engagementId: string,
) {
  const snapshot = await loadFactoryGateSnapshot(engagementId);
  return evaluateFactoryApprovalGates(snapshot);
}

export async function appendFactoryApprovalGates(
  engagementId: string,
  blockingIssues: string[],
  checklist: Array<{ label: string; passed: boolean; detail: string }>,
): Promise<void> {
  if (!isApprovalGatesEnabled()) return;

  const evaluation = await evaluateFactoryApprovalGatesForEngagement(
    engagementId,
  );

  for (const gate of evaluation.checklist) {
    checklist.push({
      label: `[Factory] ${gate.label}`,
      passed: gate.passed,
      detail: gate.detail,
    });
  }
  blockingIssues.push(...evaluation.blockingIssues);
}

export async function assertFactoryApprovalGatesPass(
  engagementId: string,
): Promise<void> {
  if (!isApprovalGatesEnabled()) return;

  const evaluation = await evaluateFactoryApprovalGatesForEngagement(
    engagementId,
  );
  if (evaluation.blockingIssues.length > 0) {
    throw new ApprovalGatesBlockedError(evaluation.blockingIssues);
  }
}

export async function promoteFinancialStatementsOnApproval(
  engagementId: string,
): Promise<number> {
  const result = await prisma.auditFinancialStatement.updateMany({
    where: { engagementId, status: { not: "approved" } },
    data: { status: "approved" },
  });
  return result.count;
}
