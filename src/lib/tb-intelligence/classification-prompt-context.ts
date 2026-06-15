import type { CanonicalCandidate } from "./types";

const CHART_CONTEXT =
  "AuditOS canonical COA (IFRS for SMEs). Assets CA-1010–CA-1080; Liabilities CA-2010–CA-2140; Equity CA-3010–CA-3040; Revenue CA-4010, CA-4020, CA-5100; Expenses CA-5010–CA-5070, CA-2050.";

export function buildCandidateAccountLabels(
  candidates: CanonicalCandidate[],
): string[] {
  return candidates.map((c) => `${c.code}: ${c.name} (${c.category})`);
}

export function buildChartOfAccountsContext(
  candidates: CanonicalCandidate[],
): string {
  const byCategory = new Map<string, string[]>();
  for (const c of candidates) {
    const bucket = c.category;
    const list = byCategory.get(bucket) ?? [];
    list.push(`${c.code} ${c.name}`);
    byCategory.set(bucket, list);
  }
  const lines = [CHART_CONTEXT, "Allowed canonical lines:"];
  for (const [category, codes] of byCategory) {
    lines.push(`${category}: ${codes.join("; ")}`);
  }
  return lines.join("\n");
}

export function netAccountBalance(input: {
  debitAmount?: number;
  creditAmount?: number;
}): number {
  return (input.debitAmount ?? 0) - (input.creditAmount ?? 0);
}
