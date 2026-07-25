import { prisma } from "@/lib/prisma";
import type { IssueInput } from "./common";

export async function checkBalanceEquality(
  engagementId: string,
  runId: string,
  now: Date,
): Promise<IssueInput[]> {
  const tb = await prisma.auditTrialBalance.findFirst({
    where: { engagementId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
  if (!tb) return [];

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

  return [
    {
      id: "",
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
    },
  ];
}
