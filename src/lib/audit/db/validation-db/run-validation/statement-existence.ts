import { prisma } from "@/lib/prisma";
import type { IssueInput } from "./common";

export async function checkStatementExistence(
  engagementId: string,
  runId: string,
  now: Date,
): Promise<IssueInput[]> {
  const statements = await prisma.auditFinancialStatement.findMany({
    where: { engagementId },
  });
  if (statements.length > 0) return [];

  return [
    {
      id: "",
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
    },
  ];
}
