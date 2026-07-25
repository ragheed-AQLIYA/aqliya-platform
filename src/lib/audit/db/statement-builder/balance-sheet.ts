import type { FinancialStatementLine } from "@/types/audit";
import {
  CASH_AND_CASH_EQUIVALENTS_FS_LABEL,
  isCashAndCashEquivalentsCanonical,
  LESS_ACCUMULATED_DEPRECIATION_NAMES,
} from "@/lib/audit/coa/canonical-coa";
import { computeIncomeStatementNetProfit } from "@/lib/audit/db/income-statement-amount";
import {
  EQUITY_BRIDGE_CURRENT_YEAR_LABEL,
} from "@/lib/audit/db/income-statement-presentation";
import {
  type MappingWithCanonical,
  getMappingDisplayAmount,
  pushSimpleTotalAndDetailLines,
  makeLine,
  sorted,
  sum,
  ids,
} from "./common";

type BalanceSheetMappings = {
  currentAssets: MappingWithCanonical[];
  nonCurrentAssets: MappingWithCanonical[];
  currentLiabilities: MappingWithCanonical[];
  nonCurrentLiabilities: MappingWithCanonical[];
  equityMappings: MappingWithCanonical[];
  confirmed: MappingWithCanonical[];
  usesTbRetainedEarnings: boolean;
};

export function buildBalanceSheetLines(
  statementId: string,
  mappings: BalanceSheetMappings,
): FinancialStatementLine[] {
  const lines: FinancialStatementLine[] = [];
  const ref = { displayOrder: 5 };

  const currentAssetsTotal = sum(mappings.currentAssets);
  const nonCurrentAssetsTotal = sum(mappings.nonCurrentAssets);
  const currentLiabilitiesTotal = sum(mappings.currentLiabilities);
  const nonCurrentLiabilitiesTotal = sum(mappings.nonCurrentLiabilities);
  const equityCoreTotal = sum(mappings.equityMappings);
  const currentYearProfit = computeIncomeStatementNetProfit(mappings.confirmed);
  const totalAssets = currentAssetsTotal + nonCurrentAssetsTotal;
  const liabilitiesTotal = currentLiabilitiesTotal + nonCurrentLiabilitiesTotal;
  let equityProfitAddOn = mappings.usesTbRetainedEarnings ? 0 : currentYearProfit;
  let tbClosingPlug = 0;
  if (mappings.usesTbRetainedEarnings) {
    tbClosingPlug = totalAssets - (liabilitiesTotal + equityCoreTotal);
    if (Math.abs(tbClosingPlug) > 0.01) {
      equityProfitAddOn = tbClosingPlug;
    }
  }
  const totalLiabilitiesAndEquity = liabilitiesTotal + equityCoreTotal + equityProfitAddOn;

  lines.push(makeLine(statementId, "ASSETS", 0, ref.displayOrder, [], { isTotal: false }));
  ref.displayOrder += 5;

  lines.push(makeLine(statementId, "Current Assets", currentAssetsTotal, ref.displayOrder, ids(mappings.currentAssets)));
  ref.displayOrder += 1;

  const cashCurrentAssets = mappings.currentAssets.filter(isCashAndCashEquivalentsCanonical);
  const otherCurrentAssets = mappings.currentAssets.filter(
    (mapping) => !isCashAndCashEquivalentsCanonical(mapping),
  );
  if (cashCurrentAssets.length > 0) {
    lines.push({
      id: `${statementId}-line-${ref.displayOrder}`,
      statementId,
      label: `  ${CASH_AND_CASH_EQUIVALENTS_FS_LABEL}`,
      amount: sum(cashCurrentAssets),
      isTotal: false,
      indentLevel: 1,
      displayOrder: ref.displayOrder,
      linkedAccountMappings: ids(cashCurrentAssets),
    });
    ref.displayOrder += 1;
  }
  for (const mapping of sorted(otherCurrentAssets)) {
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

  lines.push(makeLine(statementId, "Non-Current Assets", nonCurrentAssetsTotal, ref.displayOrder, ids(mappings.nonCurrentAssets)));
  ref.displayOrder += 1;
  for (const mapping of sorted(mappings.nonCurrentAssets)) {
    const label =
      mapping.canonicalAccount?.name &&
      LESS_ACCUMULATED_DEPRECIATION_NAMES.has(mapping.canonicalAccount.name)
        ? `  Less: ${mapping.canonicalAccount.name}`
        : `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`;
    lines.push({
      id: `${statementId}-line-${ref.displayOrder}`,
      statementId,
      label,
      amount: getMappingDisplayAmount(mapping),
      isTotal: false,
      indentLevel: 1,
      displayOrder: ref.displayOrder,
      linkedAccountMappings: [mapping.id],
    });
    ref.displayOrder += 1;
  }

  lines.push(makeLine(statementId, "TOTAL ASSETS", totalAssets, ref.displayOrder, []));
  ref.displayOrder += 5;

  lines.push(makeLine(statementId, "LIABILITIES AND EQUITY", 0, ref.displayOrder, [], { isTotal: false }));
  ref.displayOrder += 5;

  pushSimpleTotalAndDetailLines(
    lines, statementId, "Current Liabilities", currentLiabilitiesTotal,
    mappings.currentLiabilities, ref,
  );

  if (mappings.nonCurrentLiabilities.length > 0) {
    pushSimpleTotalAndDetailLines(
      lines, statementId, "Non-Current Liabilities", nonCurrentLiabilitiesTotal,
      mappings.nonCurrentLiabilities, ref,
    );
  }

  lines.push(makeLine(statementId, "Equity", equityCoreTotal + equityProfitAddOn, ref.displayOrder, ids(mappings.equityMappings)));
  ref.displayOrder += 1;
  for (const mapping of sorted(mappings.equityMappings)) {
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
  if (!mappings.usesTbRetainedEarnings) {
    lines.push({
      id: `${statementId}-line-${ref.displayOrder}`,
      statementId,
      label: "  Current Year Profit",
      amount: currentYearProfit,
      isTotal: false,
      indentLevel: 1,
      displayOrder: ref.displayOrder,
      linkedAccountMappings: [],
    });
    ref.displayOrder += 1;
  } else if (Math.abs(tbClosingPlug) > 0.01) {
    lines.push({
      id: `${statementId}-line-${ref.displayOrder}`,
      statementId,
      label: `  ${EQUITY_BRIDGE_CURRENT_YEAR_LABEL}`,
      amount: currentYearProfit,
      isTotal: false,
      indentLevel: 1,
      displayOrder: ref.displayOrder,
      linkedAccountMappings: [],
    });
    ref.displayOrder += 1;
  }

  lines.push(makeLine(statementId, "TOTAL LIABILITIES AND EQUITY", totalLiabilitiesAndEquity, ref.displayOrder, []));
  return lines;
}
