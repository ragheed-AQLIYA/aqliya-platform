import type { FinancialStatementLine } from "@/types/audit";
import {
  isCorExcludedByPolicy,
} from "@/lib/audit/db/income-statement-presentation";
import {
  filterPresentationKind,
} from "@/lib/audit/db/income-statement-presentation";
import {
  resolvePresentationProfile,
  type PresentationProfile,
} from "@/lib/audit/presentation/presentation-profile";
import { resolvePolicyForProfile } from "@/lib/audit/presentation/presentation-policy-resolver";
import { policyUsesAuditedHeadlineRules } from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";

import {
  type MappingWithCanonical,
  withInferredClassification,
  getMappingDisplayAmount,
} from "./common";

export type { MappingWithCanonical } from "./common";
export { getMappingDisplayAmount } from "./common";

import { buildIncomeStatementLines } from "./income-statement";
import { buildBalanceSheetLines } from "./balance-sheet";
import { buildEquityStatementLines } from "./equity-statement";

export type StatementBuildOptions = {
  presentationProfile?: PresentationProfile | string | null;
  presentationPolicy?: PresentationPolicyRules;
};

function asPresentationMappings(
  mappings: MappingWithCanonical[],
): MappingWithCanonical[] {
  return mappings;
}

function filterPresentationMappings(
  mappings: MappingWithCanonical[],
  kind: Parameters<typeof filterPresentationKind>[1],
): MappingWithCanonical[] {
  return filterPresentationKind(mappings, kind) as MappingWithCanonical[];
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
  const revenueAffiliateMappings = filterPresentationMappings(presentationMappings, "revenue_affiliate");
  const revenueContractMappings = filterPresentationMappings(presentationMappings, "revenue_contract");
  const revenueOtherMappings = filterPresentationMappings(presentationMappings, "revenue_other");
  const otherIncomeMappings = filterPresentationMappings(presentationMappings, "other_income");
  const costOfSalesMappings = filterPresentationMappings(presentationMappings, "cost_of_revenue").filter(
    (mapping) =>
      !policyUsesAuditedHeadlineRules(presentationPolicy) ||
      !isCorExcludedByPolicy(mapping, presentationPolicy),
  );
  const operatingExpenseMappings = filterPresentationMappings(presentationMappings, "operating_expense");
  const financeCostMappings = filterPresentationMappings(presentationMappings, "finance_cost");
  const zakatMappings = filterPresentationMappings(presentationMappings, "zakat");

  const currentAssets = balanceMappings.filter((m) => m.statementClassification === "Current Assets");
  const nonCurrentAssets = balanceMappings.filter((m) => m.statementClassification === "Non-Current Assets");
  const currentLiabilities = balanceMappings.filter((m) => m.statementClassification === "Current Liabilities");
  const nonCurrentLiabilities = balanceMappings.filter((m) => m.statementClassification === "Non-Current Liabilities");
  const equityMappings = balanceMappings.filter((m) => m.statementClassification === "Equity");

  const usesTbRetainedEarnings = equityMappings.some(
    (mapping) =>
      mapping.canonicalAccount?.name === "Retained Earnings" &&
      Math.abs(getMappingDisplayAmount(mapping)) > 0.01,
  );

  if (statementType === "income_statement") {
    return buildIncomeStatementLines(statementId, {
      presentationMappings,
      revenueAffiliateMappings,
      revenueContractMappings,
      revenueOtherMappings,
      otherIncomeMappings,
      costOfSalesMappings,
      operatingExpenseMappings,
      financeCostMappings,
      zakatMappings,
      confirmed,
    }, presentationPolicy);
  }

  if (statementType === "balance_sheet") {
    return buildBalanceSheetLines(statementId, {
      currentAssets,
      nonCurrentAssets,
      currentLiabilities,
      nonCurrentLiabilities,
      equityMappings,
      confirmed,
      usesTbRetainedEarnings,
    });
  }

  return buildEquityStatementLines(statementId, equityMappings, confirmed);
}
