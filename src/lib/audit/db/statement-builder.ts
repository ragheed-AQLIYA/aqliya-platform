import type { FinancialStatementLine } from "@/types/audit";
import {
  CASH_AND_CASH_EQUIVALENTS_FS_LABEL,
  isCashAndCashEquivalentsCanonical,
  LESS_ACCUMULATED_DEPRECIATION_NAMES,
} from "@/lib/audit/coa/canonical-coa";
import { computeIncomeStatementNetProfit } from "@/lib/audit/db/income-statement-amount";
import {
  buildPresentationIncomeStatementTotals,
  EQUITY_BRIDGE_CURRENT_YEAR_LABEL,
  filterPresentationKind,
  getPresentationPeriodAmount,
  isCorExcludedByPolicy,
  type PresentationLineKind,
} from "@/lib/audit/db/income-statement-presentation";
import {
  resolvePresentationProfile,
  type PresentationProfile,
} from "@/lib/audit/presentation/presentation-profile";
import { resolvePolicyForProfile } from "@/lib/audit/presentation/presentation-policy-resolver";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import { policyUsesAuditedHeadlineRules } from "@/lib/audit/presentation/presentation-policy-types";

export type StatementBuildOptions = {
  presentationProfile?: PresentationProfile | string | null;
  presentationPolicy?: PresentationPolicyRules;
};

export type MappingWithCanonical = {
  id: string;
  engagementId: string;
  sourceAccountId: string;
  sourceAccountCode: string;
  sourceAccountName: string;
  debitAmount: number;
  creditAmount: number;
  canonicalAccountId: string | null;
  canonicalAccount: {
    id: string;
    code: string;
    name: string;
    category: string;
    statementType: string;
    displayOrder: number;
  } | null;
  confidence: number | null;
  mappingType: string;
  status: string;
  statementClassification: string | null;
  mappedBy: string | null;
  mappedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const BALANCE_SHEET_CLASSIFICATIONS = new Set([
  "Current Assets",
  "Non-Current Assets",
  "Current Liabilities",
  "Non-Current Liabilities",
  "Equity",
]);

function withInferredClassification(
  mapping: MappingWithCanonical,
): MappingWithCanonical {
  if (mapping.statementClassification || !mapping.canonicalAccount) {
    return mapping;
  }
  const { category, statementType } = mapping.canonicalAccount;
  if (
    statementType === "balance_sheet" &&
    BALANCE_SHEET_CLASSIFICATIONS.has(category)
  ) {
    return { ...mapping, statementClassification: category };
  }
  return mapping;
}

export function getMappingDisplayAmount(mapping: MappingWithCanonical): number {
  const category =
    mapping.statementClassification ?? mapping.canonicalAccount?.category ?? "";
  const statementType = mapping.canonicalAccount?.statementType ?? "";
  if (statementType === "income_statement") {
    return mapping.creditAmount !== 0
      ? mapping.creditAmount
      : mapping.debitAmount;
  }
  const isAssetCategory =
    category === "Current Assets" || category === "Non-Current Assets";
  if (isAssetCategory) {
    return mapping.debitAmount !== 0
      ? mapping.debitAmount
      : -mapping.creditAmount;
  }
  return mapping.creditAmount !== 0
    ? mapping.creditAmount
    : -mapping.debitAmount;
}

function asPresentationMappings(
  mappings: MappingWithCanonical[],
): MappingWithCanonical[] {
  return mappings;
}

function filterPresentationMappings(
  mappings: MappingWithCanonical[],
  kind: PresentationLineKind,
): MappingWithCanonical[] {
  return filterPresentationKind(mappings, kind) as MappingWithCanonical[];
}

function getPresentationAmountForKind(
  mapping: MappingWithCanonical,
  kind: PresentationLineKind,
): number {
  return getPresentationPeriodAmount(mapping, kind);
}

export function buildStatementLinesFromMappings(
  statementId: string,
  statementType: "income_statement" | "balance_sheet" | "equity",
  mappings: MappingWithCanonical[],
  options?: StatementBuildOptions,
): FinancialStatementLine[] {
  const presentationProfile = resolvePresentationProfile(
    options?.presentationProfile,
  );
  const presentationPolicy =
    options?.presentationPolicy ??
    resolvePolicyForProfile(presentationProfile);
  const confirmed = mappings
    .filter(
      (mapping) => mapping.status === "confirmed" && mapping.canonicalAccount,
    )
    .map(withInferredClassification);
  const incomeMappings = confirmed.filter(
    (mapping) => mapping.canonicalAccount?.statementType === "income_statement",
  );
  const balanceMappings = confirmed.filter(
    (mapping) => mapping.canonicalAccount?.statementType === "balance_sheet",
  );
  const presentationMappings = asPresentationMappings(incomeMappings);
  const revenueAffiliateMappings = filterPresentationMappings(
    presentationMappings,
    "revenue_affiliate",
  );
  const revenueContractMappings = filterPresentationMappings(
    presentationMappings,
    "revenue_contract",
  );
  const revenueOtherMappings = filterPresentationMappings(
    presentationMappings,
    "revenue_other",
  );
  const otherIncomeMappings = filterPresentationMappings(
    presentationMappings,
    "other_income",
  );
  const costOfSalesMappings = filterPresentationMappings(
    presentationMappings,
    "cost_of_revenue",
  ).filter(
    (mapping) =>
      !policyUsesAuditedHeadlineRules(presentationPolicy) ||
      !isCorExcludedByPolicy(mapping, presentationPolicy),
  );
  const operatingExpenseMappings = filterPresentationMappings(
    presentationMappings,
    "operating_expense",
  );
  const financeCostMappings = filterPresentationMappings(
    presentationMappings,
    "finance_cost",
  );
  const zakatMappings = filterPresentationMappings(presentationMappings, "zakat");
  const currentAssets = balanceMappings.filter(
    (mapping) => mapping.statementClassification === "Current Assets",
  );
  const nonCurrentAssets = balanceMappings.filter(
    (mapping) => mapping.statementClassification === "Non-Current Assets",
  );
  const currentLiabilities = balanceMappings.filter(
    (mapping) => mapping.statementClassification === "Current Liabilities",
  );
  const nonCurrentLiabilities = balanceMappings.filter(
    (mapping) => mapping.statementClassification === "Non-Current Liabilities",
  );
  const equityMappings = balanceMappings.filter(
    (mapping) => mapping.statementClassification === "Equity",
  );

  const sorted = (items: MappingWithCanonical[]) =>
    [...items].sort(
      (a, b) =>
        (a.canonicalAccount?.displayOrder ?? 0) -
        (b.canonicalAccount?.displayOrder ?? 0),
    );
  const sum = (items: MappingWithCanonical[]) =>
    items.reduce((total, item) => total + getMappingDisplayAmount(item), 0);
  const ids = (items: MappingWithCanonical[]) => items.map((item) => item.id);

  /** Year-end TB often includes current P&L in Retained Earnings — avoid double-count on BS. */
  const usesTbRetainedEarnings = equityMappings.some(
    (mapping) =>
      mapping.canonicalAccount?.name === "Retained Earnings" &&
      Math.abs(getMappingDisplayAmount(mapping)) > 0.01,
  );

  if (statementType === "income_statement") {
    const lines: FinancialStatementLine[] = [];
    let displayOrder = 10;
    const totals = buildPresentationIncomeStatementTotals(
      presentationMappings,
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
    const netProfit = computeIncomeStatementNetProfit(confirmed);

    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: presentationPolicy.headline.useOperatingRevenueLabel
        ? "Operating Revenue"
        : "Revenue",
      amount: revenueTotal,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: ids([
        ...revenueAffiliateMappings,
        ...revenueContractMappings,
        ...revenueOtherMappings,
      ]),
    });
    displayOrder += 1;
    if (revenueIntercompany > 0.01) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "  Intercompany / Affiliate Revenue (consolidation memo)",
        amount: revenueIntercompany,
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: ids(revenueAffiliateMappings),
      });
      displayOrder += 1;
    }
    if (revenueReclassified > 0.01) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "  Revenue reclassified in audited FS (segment memo)",
        amount: revenueReclassified,
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: [],
      });
      displayOrder += 1;
    }
    if (revenueAffiliateMappings.length > 0) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "  Affiliate Revenue",
        amount: revenueAffiliate,
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: ids(revenueAffiliateMappings),
      });
      displayOrder += 1;
      for (const mapping of sorted(revenueAffiliateMappings)) {
        lines.push({
          id: `${statementId}-line-${displayOrder}`,
          statementId,
          label: `    ${mapping.sourceAccountName}`,
          amount: getPresentationAmountForKind(mapping, "revenue_affiliate"),
          isTotal: false,
          indentLevel: 2,
          displayOrder,
          linkedAccountMappings: [mapping.id],
        });
        displayOrder += 1;
      }
    }
    if (revenueContractMappings.length > 0) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "  Contract Revenue",
        amount: revenueContract,
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: ids(revenueContractMappings),
      });
      displayOrder += 1;
      for (const mapping of sorted(revenueContractMappings)) {
        lines.push({
          id: `${statementId}-line-${displayOrder}`,
          statementId,
          label: `    ${mapping.sourceAccountName}`,
          amount: getPresentationAmountForKind(mapping, "revenue_contract"),
          isTotal: false,
          indentLevel: 2,
          displayOrder,
          linkedAccountMappings: [mapping.id],
        });
        displayOrder += 1;
      }
    }
    if (revenueOtherMappings.length > 0) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "  Other Revenue",
        amount: revenueOther,
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: ids(revenueOtherMappings),
      });
      displayOrder += 1;
      for (const mapping of sorted(revenueOtherMappings)) {
        lines.push({
          id: `${statementId}-line-${displayOrder}`,
          statementId,
          label: `    ${mapping.sourceAccountName}`,
          amount: getPresentationAmountForKind(mapping, "revenue_other"),
          isTotal: false,
          indentLevel: 2,
          displayOrder,
          linkedAccountMappings: [mapping.id],
        });
        displayOrder += 1;
      }
    }
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Cost of Sales",
      amount: costOfRevenueTotal,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: ids(costOfSalesMappings),
    });
    displayOrder += 1;
    for (const mapping of sorted(costOfSalesMappings)) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
        amount: getPresentationAmountForKind(mapping, "cost_of_revenue"),
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: [mapping.id],
      });
      displayOrder += 1;
    }
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Gross Profit",
      amount: grossProfit,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: [],
    });
    displayOrder += 10;
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Operating Expenses",
      amount: operatingExpensesTotal,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: ids(operatingExpenseMappings),
    });
    displayOrder += 1;
    for (const mapping of sorted(operatingExpenseMappings)) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
        amount: getPresentationAmountForKind(mapping, "operating_expense"),
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: [mapping.id],
      });
      displayOrder += 1;
    }
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Operating Profit",
      amount: operatingProfit,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: [],
    });
    displayOrder += 5;
    if (financeCostMappings.length > 0) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "Finance Costs",
        amount: financeCostsTotal,
        isTotal: true,
        indentLevel: 0,
        displayOrder,
        linkedAccountMappings: ids(financeCostMappings),
      });
      displayOrder += 1;
      for (const mapping of sorted(financeCostMappings)) {
        lines.push({
          id: `${statementId}-line-${displayOrder}`,
          statementId,
          label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
          amount: getPresentationAmountForKind(mapping, "finance_cost"),
          isTotal: false,
          indentLevel: 1,
          displayOrder,
          linkedAccountMappings: [mapping.id],
        });
        displayOrder += 1;
      }
    }
    if (otherIncomeMappings.length > 0) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "Other Income (net)",
        amount: otherIncomeTotal,
        isTotal: true,
        indentLevel: 0,
        displayOrder,
        linkedAccountMappings: ids(otherIncomeMappings),
      });
      displayOrder += 1;
      for (const mapping of sorted(otherIncomeMappings)) {
        lines.push({
          id: `${statementId}-line-${displayOrder}`,
          statementId,
          label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
          amount: getPresentationAmountForKind(mapping, "other_income"),
          isTotal: false,
          indentLevel: 1,
          displayOrder,
          linkedAccountMappings: [mapping.id],
        });
        displayOrder += 1;
      }
    }
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Profit Before Zakat",
      amount: profitBeforeZakat,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: [],
    });
    displayOrder += 5;
    if (zakatMappings.length > 0) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "Zakat",
        amount: zakatTotal,
        isTotal: true,
        indentLevel: 0,
        displayOrder,
        linkedAccountMappings: ids(zakatMappings),
      });
      displayOrder += 1;
      for (const mapping of sorted(zakatMappings)) {
        lines.push({
          id: `${statementId}-line-${displayOrder}`,
          statementId,
          label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
          amount: getPresentationAmountForKind(mapping, "zakat"),
          isTotal: false,
          indentLevel: 1,
          displayOrder,
          linkedAccountMappings: [mapping.id],
        });
        displayOrder += 1;
      }
    }
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Net Profit",
      amount: netProfit,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: [],
    });
    return lines;
  }

  if (statementType === "balance_sheet") {
    const lines: FinancialStatementLine[] = [];
    let displayOrder = 5;
    const currentAssetsTotal = sum(currentAssets);
    const nonCurrentAssetsTotal = sum(nonCurrentAssets);
    const currentLiabilitiesTotal = sum(currentLiabilities);
    const nonCurrentLiabilitiesTotal = sum(nonCurrentLiabilities);
    const equityCoreTotal = sum(equityMappings);
    const currentYearProfit = computeIncomeStatementNetProfit(confirmed);
    const totalAssets = currentAssetsTotal + nonCurrentAssetsTotal;
    const liabilitiesTotal =
      currentLiabilitiesTotal + nonCurrentLiabilitiesTotal;
    let equityProfitAddOn = usesTbRetainedEarnings ? 0 : currentYearProfit;
    let tbClosingPlug = 0;
    if (usesTbRetainedEarnings) {
      tbClosingPlug = totalAssets - (liabilitiesTotal + equityCoreTotal);
      if (Math.abs(tbClosingPlug) > 0.01) {
        equityProfitAddOn = tbClosingPlug;
      }
    }
    const totalLiabilitiesAndEquity =
      liabilitiesTotal + equityCoreTotal + equityProfitAddOn;

    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "ASSETS",
      amount: 0,
      isTotal: false,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: [],
    });
    displayOrder += 5;
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Current Assets",
      amount: currentAssetsTotal,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: ids(currentAssets),
    });
    displayOrder += 1;
    const cashCurrentAssets = currentAssets.filter(isCashAndCashEquivalentsCanonical);
    const otherCurrentAssets = currentAssets.filter(
      (mapping) => !isCashAndCashEquivalentsCanonical(mapping),
    );
    if (cashCurrentAssets.length > 0) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: `  ${CASH_AND_CASH_EQUIVALENTS_FS_LABEL}`,
        amount: sum(cashCurrentAssets),
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: ids(cashCurrentAssets),
      });
      displayOrder += 1;
    }
    for (const mapping of sorted(otherCurrentAssets)) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
        amount: getMappingDisplayAmount(mapping),
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: [mapping.id],
      });
      displayOrder += 1;
    }
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Non-Current Assets",
      amount: nonCurrentAssetsTotal,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: ids(nonCurrentAssets),
    });
    displayOrder += 1;
    for (const mapping of sorted(nonCurrentAssets)) {
      const label =
        mapping.canonicalAccount?.name &&
        LESS_ACCUMULATED_DEPRECIATION_NAMES.has(mapping.canonicalAccount.name)
          ? `  Less: ${mapping.canonicalAccount.name}`
          : `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`;
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label,
        amount: getMappingDisplayAmount(mapping),
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: [mapping.id],
      });
      displayOrder += 1;
    }
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "TOTAL ASSETS",
      amount: totalAssets,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: [],
    });
    displayOrder += 5;
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "LIABILITIES AND EQUITY",
      amount: 0,
      isTotal: false,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: [],
    });
    displayOrder += 5;
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Current Liabilities",
      amount: currentLiabilitiesTotal,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: ids(currentLiabilities),
    });
    displayOrder += 1;
    for (const mapping of sorted(currentLiabilities)) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
        amount: getMappingDisplayAmount(mapping),
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: [mapping.id],
      });
      displayOrder += 1;
    }
    if (nonCurrentLiabilities.length > 0) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "Non-Current Liabilities",
        amount: nonCurrentLiabilitiesTotal,
        isTotal: true,
        indentLevel: 0,
        displayOrder,
        linkedAccountMappings: ids(nonCurrentLiabilities),
      });
      displayOrder += 1;
      for (const mapping of sorted(nonCurrentLiabilities)) {
        lines.push({
          id: `${statementId}-line-${displayOrder}`,
          statementId,
          label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
          amount: getMappingDisplayAmount(mapping),
          isTotal: false,
          indentLevel: 1,
          displayOrder,
          linkedAccountMappings: [mapping.id],
        });
        displayOrder += 1;
      }
    }
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Equity",
      amount: equityCoreTotal + equityProfitAddOn,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: ids(equityMappings),
    });
    displayOrder += 1;
    for (const mapping of sorted(equityMappings)) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
        amount: getMappingDisplayAmount(mapping),
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: [mapping.id],
      });
      displayOrder += 1;
    }
    if (!usesTbRetainedEarnings) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: "  Current Year Profit",
        amount: currentYearProfit,
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: [],
      });
      displayOrder += 1;
    } else if (Math.abs(tbClosingPlug) > 0.01) {
      lines.push({
        id: `${statementId}-line-${displayOrder}`,
        statementId,
        label: `  ${EQUITY_BRIDGE_CURRENT_YEAR_LABEL}`,
        amount: currentYearProfit,
        isTotal: false,
        indentLevel: 1,
        displayOrder,
        linkedAccountMappings: [],
      });
      displayOrder += 1;
    }
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "TOTAL LIABILITIES AND EQUITY",
      amount: totalLiabilitiesAndEquity,
      isTotal: true,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: [],
    });
    return lines;
  }

  const currentYearProfit = computeIncomeStatementNetProfit(confirmed);
  const lines: FinancialStatementLine[] = [];
  let displayOrder = 10;
  const equityCore = sum(equityMappings);
  const actuarialMapping = equityMappings.find((m) =>
    (m.canonicalAccount?.name ?? "").toLowerCase().includes("actuarial"),
  );

  lines.push({
    id: `${statementId}-line-${displayOrder}`,
    statementId,
    label: "Opening Equity (TB GL balances)",
    amount: equityCore,
    isTotal: false,
    indentLevel: 0,
    displayOrder,
    linkedAccountMappings: ids(equityMappings),
  });
  displayOrder += 10;

  for (const mapping of sorted(equityMappings)) {
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: `  ${mapping.canonicalAccount?.name ?? mapping.sourceAccountName}`,
      amount: getMappingDisplayAmount(mapping),
      isTotal: false,
      indentLevel: 1,
      displayOrder,
      linkedAccountMappings: [mapping.id],
    });
    displayOrder += 1;
  }

  lines.push({
    id: `${statementId}-line-${displayOrder}`,
    statementId,
    label: EQUITY_BRIDGE_CURRENT_YEAR_LABEL,
    amount: currentYearProfit,
    isTotal: false,
    indentLevel: 0,
    displayOrder,
    linkedAccountMappings: [],
  });
  displayOrder += 10;

  if (actuarialMapping) {
    lines.push({
      id: `${statementId}-line-${displayOrder}`,
      statementId,
      label: "Actuarial Reserve (closing per TB)",
      amount: getMappingDisplayAmount(actuarialMapping),
      isTotal: false,
      indentLevel: 0,
      displayOrder,
      linkedAccountMappings: [actuarialMapping.id],
    });
    displayOrder += 10;
  }

  lines.push({
    id: `${statementId}-line-${displayOrder}`,
    statementId,
    label: "Total Equity (TB core + current year IS result)",
    amount: equityCore + currentYearProfit,
    isTotal: true,
    indentLevel: 0,
    displayOrder,
    linkedAccountMappings: [],
  });
  return lines;
}
