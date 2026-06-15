export type IncomeStatementMapping = {
  sourceAccountCode: string;
  sourceAccountName: string;
  debitAmount: number;
  creditAmount: number;
  status: string;
  canonicalAccount: {
    code: string;
    name: string;
    category: string;
    statementType: string;
  } | null;
};

/** ERP BS/IS slice inferred from Saudi GL account code (pilot TB export). */
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

/** Signed trial-balance net (credit-positive / debit-negative). */
export function getSignedTrialBalanceNet(mapping: {
  debitAmount: number;
  creditAmount: number;
}): number {
  return mapping.creditAmount - mapping.debitAmount;
}

function isFinanceCostMapping(mapping: IncomeStatementMapping): boolean {
  const name = mapping.canonicalAccount?.name ?? "";
  const code = mapping.canonicalAccount?.code ?? "";
  return name === "Finance Cost" || code === "CA-2050";
}

function isZakatExpenseMapping(mapping: IncomeStatementMapping): boolean {
  const source = mapping.sourceAccountName.toLowerCase();
  const canonical = (mapping.canonicalAccount?.name ?? "").toLowerCase();
  return /zakat|zakah|زكاة|زakat/.test(source) || /zakat|zakah|زكاة/.test(canonical);
}

function isOtherIncomeMapping(mapping: IncomeStatementMapping): boolean {
  return mapping.canonicalAccount?.name === "Other Income";
}

function isRevenueMapping(mapping: IncomeStatementMapping): boolean {
  return (
    mapping.canonicalAccount?.category === "Revenue" &&
    !isOtherIncomeMapping(mapping)
  );
}

/**
 * Cost of revenue: canonical Cost of Sales plus Saudi 32xx expense GL accounts
 * (pilot TB maps most CoR to CA-5020 / CA-5070 via synonyms).
 */
export function isCostOfRevenueMapping(mapping: IncomeStatementMapping): boolean {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return false;
  if (mapping.canonicalAccount?.statementType !== "income_statement") return false;
  if (isFinanceCostMapping(mapping) || isZakatExpenseMapping(mapping)) return false;

  if (mapping.canonicalAccount?.name === "Cost of Sales") return true;

  return (
    mapping.sourceAccountCode.startsWith("32") &&
    mapping.canonicalAccount?.category === "Expenses"
  );
}

export function isOperatingExpenseMapping(mapping: IncomeStatementMapping): boolean {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return false;
  if (mapping.canonicalAccount?.statementType !== "income_statement") return false;
  if (mapping.canonicalAccount?.category !== "Expenses") return false;
  if (isCostOfRevenueMapping(mapping)) return false;
  if (isFinanceCostMapping(mapping)) return false;
  if (isZakatExpenseMapping(mapping)) return false;
  return true;
}

export type IncomeStatementLineKind =
  | "revenue"
  | "cost_of_revenue"
  | "operating_expense"
  | "finance_cost"
  | "zakat"
  | "other_income";

export function classifyIncomeStatementMapping(
  mapping: IncomeStatementMapping,
): IncomeStatementLineKind | null {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return null;
  if (mapping.canonicalAccount?.statementType !== "income_statement") return null;

  if (isRevenueMapping(mapping)) return "revenue";
  if (isOtherIncomeMapping(mapping)) return "other_income";
  if (isCostOfRevenueMapping(mapping)) return "cost_of_revenue";
  if (isFinanceCostMapping(mapping)) return "finance_cost";
  if (isZakatExpenseMapping(mapping)) return "zakat";
  if (isOperatingExpenseMapping(mapping)) return "operating_expense";
  return null;
}

/**
 * Period P&L display amount from stored TB debit/credit (closing or movement upload).
 * Uses signed net — not gross debit/credit side selection.
 */
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

/** Net profit = sum of signed nets on all income-statement-source GL rows (one mapping per account). */
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
