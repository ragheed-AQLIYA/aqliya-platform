import { prisma } from "@/lib/prisma";
import type { IssueInput } from "./common";

export async function checkMappingConsistency(
  engagementId: string,
  runId: string,
  now: Date,
): Promise<IssueInput[]> {
  const tb = await prisma.auditTrialBalance.findFirst({
    where: { engagementId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
  const mappings = await prisma.auditAccountMapping.findMany({
    where: { engagementId },
  });

  const issues: IssueInput[] = [];
  let count = 0;
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
        id: "",
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
    if (++count >= 30) break;
  }

  return issues;
}
