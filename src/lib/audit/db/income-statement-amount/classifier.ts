import type { IncomeStatementMapping, IncomeStatementLineKind } from "./types";
import {
  isIncomeStatementSourceAccount,
  isRevenueMapping,
  isOtherIncomeMapping,
  isFinanceCostMapping,
  isZakatExpenseMapping,
} from "./common";
import { isCostOfRevenueMapping, isOperatingExpenseMapping } from "./predicates";

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
