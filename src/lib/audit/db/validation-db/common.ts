export function _severityRank(s: string): number {
  if (s === "critical") return 0;
  if (s === "high") return 1;
  if (s === "medium") return 2;
  return 3;
}
