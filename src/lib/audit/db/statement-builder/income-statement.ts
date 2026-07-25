import type { FinancialStatementLine } from "@/types/audit";
import { computeIncomeStatementNetProfit } from "@/lib/audit/db/income-statement-amount";
import {
  buildPresentationIncomeStatementTotals,
} from "@/lib/audit/db/income-statement-presentation";
import { policyUsesAuditedHeadlineRules } from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import {
  type MappingWithCanonical,
  getPresentationAmountForKind,
  pushTotalAndDetailLines,
  makeLine,
  ids,
} from "./common";

type IncomeStatementMappings = {
  presentationMappings: MappingWithCanonical[];
  revenueAffiliateMappings: MappingWithCanonical[];
  revenueContractMappings: MappingWithCanonical[];
  revenueOtherMappings: MappingWithCanonical[];
  otherIncomeMappings: MappingWithCanonical[];
  costOfSalesMappings: MappingWithCanonical[];
  operatingExpenseMappings: MappingWithCanonical[];
  financeCostMappings: MappingWithCanonical[];
  zakatMappings: MappingWithCanonical[];
  confirmed: MappingWithCanonical[];
};

export function buildIncomeStatementLines(
  statementId: string,
  mappings: IncomeStatementMappings,
  presentationPolicy: PresentationPolicyRules,
): FinancialStatementLine[] {
  const lines: FinancialStatementLine[] = [];
  const ref = { displayOrder: 10 };

  const totals = buildPresentationIncomeStatementTotals(
    mappings.presentationMappings,
    presentationPolicy,
  );
  const {
    revenueTotal,
    revenueIntercompany,
    revenueReclassified,
    revenueAffiliate,
    revenueContract,
    revenueOther,
    costOfRevenueTotal,
    operatingExpensesTotal,
    financeCostsTotal,
    zakatTotal,
    otherIncomeTotal,
    grossProfit,
    operatingProfit,
    profitBeforeZakat,
  } = totals;
  const netProfit = computeIncomeStatementNetProfit(mappings.confirmed);

  lines.push({
    id: `${statementId}-line-${ref.displayOrder}`,
    statementId,
    label: presentationPolicy.headline.useOperatingRevenueLabel
      ? "Operating Revenue"
      : "Revenue",
    amount: revenueTotal,
    isTotal: true,
    indentLevel: 0,
    displayOrder: ref.displayOrder,
    linkedAccountMappings: ids([
      ...mappings.revenueAffiliateMappings,
      ...mappings.revenueContractMappings,
      ...mappings.revenueOtherMappings,
    ]),
  });
  ref.displayOrder += 1;

  if (revenueIntercompany > 0.01) {
    lines.push({
      id: `${statementId}-line-${ref.displayOrder}`,
      statementId,
      label: "  Intercompany / Affiliate Revenue (consolidation memo)",
      amount: revenueIntercompany,
      isTotal: false,
      indentLevel: 1,
      displayOrder: ref.displayOrder,
      linkedAccountMappings: ids(mappings.revenueAffiliateMappings),
    });
    ref.displayOrder += 1;
  }

  if (revenueReclassified > 0.01) {
    lines.push({
      id: `${statementId}-line-${ref.displayOrder}`,
      statementId,
      label: "  Revenue reclassified in audited FS (segment memo)",
      amount: revenueReclassified,
      isTotal: false,
      indentLevel: 1,
      displayOrder: ref.displayOrder,
      linkedAccountMappings: [],
    });
    ref.displayOrder += 1;
  }

  if (mappings.revenueAffiliateMappings.length > 0) {
    pushTotalAndDetailLines(
      lines, statementId, "  Affiliate Revenue", revenueAffiliate,
      mappings.revenueAffiliateMappings, "revenue_affiliate", ref,
    );
  }

  if (mappings.revenueContractMappings.length > 0) {
    pushTotalAndDetailLines(
      lines, statementId, "  Contract Revenue", revenueContract,
      mappings.revenueContractMappings, "revenue_contract", ref,
    );
  }

  if (mappings.revenueOtherMappings.length > 0) {
    pushTotalAndDetailLines(
      lines, statementId, "  Other Revenue", revenueOther,
      mappings.revenueOtherMappings, "revenue_other", ref,
    );
  }

  pushTotalAndDetailLines(
    lines, statementId, "Cost of Sales", costOfRevenueTotal,
    mappings.costOfSalesMappings, "cost_of_revenue", ref,
  );

  lines.push(makeLine(statementId, "Gross Profit", grossProfit, ref.displayOrder, []));
  ref.displayOrder += 10;

  pushTotalAndDetailLines(
    lines, statementId, "Operating Expenses", operatingExpensesTotal,
    mappings.operatingExpenseMappings, "operating_expense", ref,
  );

  lines.push(makeLine(statementId, "Operating Profit", operatingProfit, ref.displayOrder, []));
  ref.displayOrder += 5;

  if (mappings.financeCostMappings.length > 0) {
    pushTotalAndDetailLines(
      lines, statementId, "Finance Costs", financeCostsTotal,
      mappings.financeCostMappings, "finance_cost", ref,
    );
  }

  if (mappings.otherIncomeMappings.length > 0) {
    pushTotalAndDetailLines(
      lines, statementId, "Other Income (net)", otherIncomeTotal,
      mappings.otherIncomeMappings, "other_income", ref,
    );
  }

  lines.push(makeLine(statementId, "Profit Before Zakat", profitBeforeZakat, ref.displayOrder, []));
  ref.displayOrder += 5;

  if (mappings.zakatMappings.length > 0) {
    pushTotalAndDetailLines(
      lines, statementId, "Zakat", zakatTotal,
      mappings.zakatMappings, "zakat", ref,
    );
  }

  lines.push(makeLine(statementId, "Net Profit", netProfit, ref.displayOrder, []));
  return lines;
}
