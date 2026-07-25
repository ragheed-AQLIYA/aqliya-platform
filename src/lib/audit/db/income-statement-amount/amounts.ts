import type { IncomeStatementMapping, IncomeStatementLineKind } from "./types";
import { getSignedTrialBalanceNet, isIncomeStatementSourceAccount } from "./common";
import { classifyIncomeStatementMapping } from "./classifier";

export function getIncomeStatementPeriodAmount(
  mapping: IncomeStatementMapping,
  lineKind?: IncomeStatementLineKind | null,
): number {
  const kind = lineKind ?? classifyIncomeStatementMapping(mapping);
  if (!kind) return 0;

  const signedNet = getSignedTrialBalanceNet(mapping);

  switch (kind) {
    case "revenue":
    case "other_income":
      return Math.max(0, signedNet);
    case "cost_of_revenue":
    case "operating_expense":
    case "finance_cost":
    case "zakat":
      return Math.max(0, -signedNet);
    default:
      return 0;
  }
}

export function computeIncomeStatementNetProfit(
  mappings: IncomeStatementMapping[],
): number {
  return mappings
    .filter(
      (mapping) =>
        mapping.status === "confirmed" &&
        isIncomeStatementSourceAccount(mapping.sourceAccountCode),
    )
    .reduce((total, mapping) => total + getSignedTrialBalanceNet(mapping), 0);
}

export function sumIncomeStatementByKind(
  mappings: IncomeStatementMapping[],
  kind: IncomeStatementLineKind,
): number {
  return mappings
    .filter((mapping) => classifyIncomeStatementMapping(mapping) === kind)
    .reduce(
      (total, mapping) =>
        total + getIncomeStatementPeriodAmount(mapping, kind),
      0,
    );
}
