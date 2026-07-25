export interface IssueInput {
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
}

export const issueId = (runId: string, n: number) => `${runId}-i-${n}`;

export function computeSummaryAndTrust(issues: IssueInput[]): {
  summary: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  trustState: string;
} {
  const critical = issues.filter((i) => i.severity === "critical").length;
  const high = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low = issues.filter((i) => i.severity === "low").length;
  const parts: string[] = [];
  if (issues.length === 0) parts.push("All checks passed");
  if (critical > 0) parts.push(`${critical} critical`);
  if (high > 0) parts.push(`${high} high`);
  if (medium > 0) parts.push(`${medium} medium`);
  if (low > 0) parts.push(`${low} low`);
  const trustState =
    critical > 0 ? "blocked" : high > 0 ? "conditional" : "trusted";
  return {
    summary: parts.join(", "),
    critical,
    high,
    medium,
    low,
    trustState,
  };
}
