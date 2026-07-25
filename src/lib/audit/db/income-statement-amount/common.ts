import type { IncomeStatementMapping } from "./types";

export function inferSourceErpStatementSide(
  accountCode: string,
): "balance_sheet" | "income_statement" | undefined {
  const code = String(accountCode ?? "").trim();
  if (code.length < 2) return undefined;

  const prefix2 = code.substring(0, 2);

  if (["10", "11", "12", "13", "14", "20", "21", "23", "24"].includes(prefix2)) {
    return "balance_sheet";
  }

  if (["30"].includes(prefix2)) {
    return "balance_sheet";
  }

  if (["31", "32", "33", "43", "44", "45", "46", "47"].includes(prefix2)) {
    return "income_statement";
  }

  return undefined;
}

export function isIncomeStatementSourceAccount(accountCode: string): boolean {
  return inferSourceErpStatementSide(accountCode) === "income_statement";
}

export function getSignedTrialBalanceNet(mapping: {
  debitAmount: number;
  creditAmount: number;
}): number {
  return mapping.creditAmount - mapping.debitAmount;
}

export function isFinanceCostMapping(mapping: IncomeStatementMapping): boolean {
  const name = mapping.canonicalAccount?.name ?? "";
  const code = mapping.canonicalAccount?.code ?? "";
  return name === "Finance Cost" || code === "CA-2050";
}

export function isZakatExpenseMapping(mapping: IncomeStatementMapping): boolean {
  const source = mapping.sourceAccountName.toLowerCase();
  const canonical = (mapping.canonicalAccount?.name ?? "").toLowerCase();
  return /zakat|zakah|زكاة|زakat/.test(source) || /zakat|zakah|زكاة/.test(canonical);
}

export function isOtherIncomeMapping(mapping: IncomeStatementMapping): boolean {
  return mapping.canonicalAccount?.name === "Other Income";
}

export function isRevenueMapping(mapping: IncomeStatementMapping): boolean {
  return (
    mapping.canonicalAccount?.category === "Revenue" &&
    !isOtherIncomeMapping(mapping)
  );
}
