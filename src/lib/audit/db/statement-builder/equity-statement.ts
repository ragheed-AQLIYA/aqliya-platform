import type { FinancialStatementLine } from "@/types/audit";
import { computeIncomeStatementNetProfit } from "@/lib/audit/db/income-statement-amount";
import {
  EQUITY_BRIDGE_CURRENT_YEAR_LABEL,
} from "@/lib/audit/db/income-statement-presentation";
import {
  type MappingWithCanonical,
  getMappingDisplayAmount,
  makeLine,
  sorted,
  sum,
  ids,
} from "./common";

export function buildEquityStatementLines(
  statementId: string,
  equityMappings: MappingWithCanonical[],
  confirmed: MappingWithCanonical[],
): FinancialStatementLine[] {
  const currentYearProfit = computeIncomeStatementNetProfit(confirmed);
  const lines: FinancialStatementLine[] = [];
  const ref = { displayOrder: 10 };
  const equityCore = sum(equityMappings);
  const actuarialMapping = equityMappings.find((m) =>
    (m.canonicalAccount?.name ?? "").toLowerCase().includes("actuarial"),
  );

  lines.push({
    id: `${statementId}-line-${ref.displayOrder}`,
    statementId,
    label: "Opening Equity (TB GL balances)",
    amount: equityCore,
    isTotal: false,
    indentLevel: 0,
    displayOrder: ref.displayOrder,
    linkedAccountMappings: ids(equityMappings),
  });
  ref.displayOrder += 10;

  for (const mapping of sorted(equityMappings)) {
    lines.push({
      id: `${statementId}-line-${ref.displayOrder}`,
      statementId,
      label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
      amount: getMappingDisplayAmount(mapping),
      isTotal: false,
      indentLevel: 1,
      displayOrder: ref.displayOrder,
      linkedAccountMappings: [mapping.id],
    });
    ref.displayOrder += 1;
  }

  lines.push({
    id: `${statementId}-line-${ref.displayOrder}`,
    statementId,
    label: EQUITY_BRIDGE_CURRENT_YEAR_LABEL,
    amount: currentYearProfit,
    isTotal: false,
    indentLevel: 0,
    displayOrder: ref.displayOrder,
    linkedAccountMappings: [],
  });
  ref.displayOrder += 10;

  if (actuarialMapping) {
    lines.push({
      id: `${statementId}-line-${ref.displayOrder}`,
      statementId,
      label: "Actuarial Reserve (closing per TB)",
      amount: getMappingDisplayAmount(actuarialMapping),
      isTotal: false,
      indentLevel: 0,
      displayOrder: ref.displayOrder,
      linkedAccountMappings: [actuarialMapping.id],
    });
    ref.displayOrder += 10;
  }

  lines.push({
    id: `${statementId}-line-${ref.displayOrder}`,
    statementId,
    label: "Total Equity (TB core + current year IS result)",
    amount: equityCore + currentYearProfit,
    isTotal: true,
    indentLevel: 0,
    displayOrder: ref.displayOrder,
    linkedAccountMappings: [],
  });
  return lines;
}
