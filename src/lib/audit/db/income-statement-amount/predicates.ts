import type { IncomeStatementMapping } from "./types";
import {
  isIncomeStatementSourceAccount,
  isFinanceCostMapping,
  isZakatExpenseMapping,
} from "./common";

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
