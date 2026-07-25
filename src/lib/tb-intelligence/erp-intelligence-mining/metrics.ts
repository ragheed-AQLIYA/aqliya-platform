/**
 * Metric category from canonical code.
 */

export function metricCategoryFromCanonical(code: string): string {
  if (code === "CA-1010") return "Cash";
  if (["CA-1070", "CA-1071", "CA-2110", "CA-2120"].includes(code))
    return "Lease";
  if (["CA-2030", "CA-2035"].includes(code)) return "Zakat";
  if (code === "CA-5010") return "Cost of Revenue";
  if (["CA-4010", "CA-4020", "CA-5100"].includes(code)) return "Revenue";
  const n = Number.parseInt(code.replace("CA-", ""), 10);
  if (Number.isNaN(n)) return "Other";
  if (n >= 5020 && n <= 5070) return "Expenses";
  if (code === "CA-2050") return "Expenses";
  if (n >= 1010 && n <= 1080) return "Assets";
  if (n >= 2010 && n <= 2140) return "Liabilities";
  if (n >= 3010 && n <= 3040) return "Equity";
  return "Other";
}
