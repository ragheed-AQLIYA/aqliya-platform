import type { FinancialStatementLine } from "@/types/audit";
import {
  getMappingDisplayAmount,
  type MappingWithCanonical,
} from "@/lib/audit/db/statement-builder";
import { isCashAccountMapping } from "@/lib/audit/lead-schedule/balance-utils";

export interface CashFlowBuildContext {
  netProfit: number;
  depreciationAddBack: number;
  netCashFromOperating: number;
  netCashFromInvesting: number;
  netCashFromFinancing: number;
  netIncreaseInCash: number;
  cashAtBeginning: number;
  cashAtEnd: number;
  tbCashTotal: number;
}

function isCashMapping(mapping: MappingWithCanonical): boolean {
  return isCashAccountMapping(mapping);
}

export function deriveCashFlowContext(input: {
  mappings: MappingWithCanonical[];
  incomeStatementLines: Array<{ label: string; amount: number }>;
}): CashFlowBuildContext {
  const confirmed = input.mappings.filter(
    (m) => m.status === "confirmed" && m.canonicalAccount,
  );

  const netProfitLine = input.incomeStatementLines.find((l) =>
    l.label.toLowerCase().includes("net profit"),
  );
  const netProfit = netProfitLine?.amount ?? 0;

  const depreciationAddBack = confirmed
    .filter(
      (m) =>
        m.canonicalAccount?.name === "Accumulated Depreciation" ||
        m.sourceAccountName.toLowerCase().includes("depreciation"),
    )
    .reduce((sum, m) => sum + Math.abs(getMappingDisplayAmount(m)), 0);

  const cashMappings = confirmed.filter(isCashMapping);
  const tbCashTotal = cashMappings.reduce(
    (sum, m) => sum + getMappingDisplayAmount(m),
    0,
  );

  const cashAtBeginning = 0;
  const cashAtEnd = tbCashTotal;
  const netCashFromInvesting = 0;
  const netCashFromFinancing = 0;
  const netIncreaseInCash = cashAtEnd - cashAtBeginning;
  const netCashFromOperating =
    netIncreaseInCash - netCashFromInvesting - netCashFromFinancing;

  return {
    netProfit,
    depreciationAddBack,
    netCashFromOperating,
    netCashFromInvesting,
    netCashFromFinancing,
    netIncreaseInCash,
    cashAtBeginning,
    cashAtEnd,
    tbCashTotal,
  };
}

export function buildCashFlowLinesFromContext(
  statementId: string,
  ctx: CashFlowBuildContext,
): FinancialStatementLine[] {
  let displayOrder = 10;
  const push = (
    label: string,
    amount: number,
    isTotal: boolean,
    indentLevel: number,
  ): FinancialStatementLine => {
    const line: FinancialStatementLine = {
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label,
      amount,
      isTotal,
      indentLevel,
      displayOrder,
      linkedAccountMappings: [],
    };
    displayOrder += isTotal ? 5 : 1;
    return line;
  };

  return [
    push("OPERATING ACTIVITIES", 0, false, 0),
    push("  Net Profit", ctx.netProfit, false, 1),
    push("  Add: Depreciation", ctx.depreciationAddBack, false, 1),
    push("Net Cash from Operating Activities", ctx.netCashFromOperating, true, 0),
    push("INVESTING ACTIVITIES", ctx.netCashFromInvesting, true, 0),
    push("FINANCING ACTIVITIES", ctx.netCashFromFinancing, true, 0),
    push("Net Increase in Cash", ctx.netIncreaseInCash, true, 0),
    push("Cash at Beginning of Period", ctx.cashAtBeginning, false, 0),
    push("Cash at End of Period", ctx.cashAtEnd, true, 0),
  ];
}

export function extractCashFlowTieAmounts(input: {
  statements: Array<{ statementType: string; lines: Array<{ label: string; amount: number }> }>;
  mappings: MappingWithCanonical[];
}): { cashAtEnd: number; tbCashTotal: number } {
  const cf = input.statements.find((s) => s.statementType === "cash_flow");
  const cashAtEnd =
    cf?.lines.find((l) =>
      l.label.toLowerCase().includes("cash at end"),
    )?.amount ?? 0;

  const confirmed = input.mappings.filter(
    (m) => m.status === "confirmed" && m.canonicalAccount,
  );
  const tbCashTotal = confirmed
    .filter(isCashMapping)
    .reduce((sum, m) => sum + getMappingDisplayAmount(m), 0);

  return { cashAtEnd, tbCashTotal };
}
