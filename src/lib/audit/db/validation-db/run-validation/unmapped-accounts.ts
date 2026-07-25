import { prisma } from "@/lib/prisma";
import type { IssueInput } from "./common";

export async function checkUnmappedAccounts(
  engagementId: string,
  runId: string,
  now: Date,
): Promise<IssueInput[]> {
  const mappings = await prisma.auditAccountMapping.findMany({
    where: { engagementId },
  });
  const pendingMappings = mappings.filter((m) => m.status === "pending");
  if (pendingMappings.length === 0) return [];

  return [
    {
      id: "",
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
    },
  ];
}
