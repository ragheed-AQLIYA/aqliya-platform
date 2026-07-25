import { prisma } from "@/lib/prisma";
import type { IssueInput } from "./common";

export async function checkMissingEvidence(
  engagementId: string,
  runId: string,
  now: Date,
): Promise<IssueInput[]> {
  const evidence = await prisma.auditEvidence.findMany({
    where: { engagementId },
  });
  const missingEvidence = evidence.filter((e) => e.state === "missing");
  if (missingEvidence.length === 0) return [];

  return [
    {
      id: "",
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
    },
  ];
}
