import { isIncomeStatementSourceAccount, getSignedTrialBalanceNet } from "@/lib/audit/db/income-statement-amount";
import {
  GENERIC_PRESENTATION_POLICY_V1,
  policyUsesAuditedHeadlineRules,
} from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationMapping } from "../income-statement-presentation-types";
import {
  normalizeMap1,
  isGlInPolicySet,
  resolveErpMap1Label,
} from "../income-statement-presentation-helpers";
import {
  isOperatingRevenueExcludedByPolicy,
  isCorExcludedByPolicy,
} from "../income-statement-presentation-policy";

import { SHALFA_POLICY_FALLBACK } from "./common";

export function isPresentationZakatMapping(mapping: PresentationMapping): boolean {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return false;
  const map1 = normalizeMap1(resolveErpMap1Label(mapping));
  return map1 === "zakat expense";
}

export function isPresentationFinanceCostMapping(
  mapping: PresentationMapping,
): boolean {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return false;
  if (isPresentationZakatMapping(mapping)) return false;
  if (isPresentationFinanceDepositGainMapping(mapping)) return false;
  const map1 = normalizeMap1(resolveErpMap1Label(mapping));
  if (map1 === "finance costs") return true;
  return (
    mapping.canonicalAccount?.name === "Finance Cost" ||
    mapping.canonicalAccount?.code === "CA-2050"
  );
}

export function isPresentationFinanceDepositGainMapping(
  mapping: PresentationMapping,
): boolean {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return false;
  const name = mapping.sourceAccountName.toLowerCase();
  const signed = getSignedTrialBalanceNet(mapping);
  return (
    signed > 0 &&
    (/ودائع|deposit|مرابحة/.test(name) ||
      /deposit|murabaha gain/.test(normalizeMap1(resolveErpMap1Label(mapping))))
  );
}

export function isPresentationCostOfRevenueMapping(
  mapping: PresentationMapping,
): boolean {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return false;
  if (isPresentationZakatMapping(mapping)) return false;
  if (isPresentationFinanceCostMapping(mapping)) return false;

  const map1 = normalizeMap1(resolveErpMap1Label(mapping));
  if (map1 === "general and administrative expenses") return false;
  if (map1 === "cost of revenue") return true;

  const code = mapping.sourceAccountCode;
  if (code.startsWith("32") || code.startsWith("33")) return true;

  return mapping.canonicalAccount?.name === "Cost of Sales";
}

export function isPresentationOperatingExpenseMapping(
  mapping: PresentationMapping,
): boolean {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return false;
  if (isPresentationCostOfRevenueMapping(mapping)) return false;
  if (isPresentationFinanceCostMapping(mapping)) return false;
  if (isPresentationZakatMapping(mapping)) return false;
  if (isPresentationFinanceDepositGainMapping(mapping)) return false;

  const map1 = normalizeMap1(resolveErpMap1Label(mapping));
  if (map1 === "general and administrative expenses") return true;

  return (
    mapping.sourceAccountCode.startsWith("31") &&
    mapping.canonicalAccount?.statementType === "income_statement"
  );
}

export function isPresentationRevenueMapping(mapping: PresentationMapping): boolean {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return false;
  if (isPresentationCostOfRevenueMapping(mapping)) return false;
  if (isPresentationOperatingExpenseMapping(mapping)) return false;
  if (isPresentationFinanceCostMapping(mapping)) return false;
  if (isPresentationZakatMapping(mapping)) return false;
  if (isPresentationFinanceDepositGainMapping(mapping)) return false;

  const map1 = normalizeMap1(resolveErpMap1Label(mapping));
  if (
    map1 === "revenues" ||
    map1 === "affiliate revenue" ||
    map1 === "revenue"
  ) {
    return true;
  }

  const code = mapping.sourceAccountCode;
  return /^4[3-7]/.test(code) && getSignedTrialBalanceNet(mapping) > 0;
}

export function isPresentationOtherIncomeMapping(
  mapping: PresentationMapping,
): boolean {
  if (!isIncomeStatementSourceAccount(mapping.sourceAccountCode)) return false;
  const map1 = normalizeMap1(resolveErpMap1Label(mapping));
  if (map1 === "other income") return true;
  return mapping.canonicalAccount?.name === "Other Income";
}

export function isPresentationIntercompanyRevenueMapping(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): boolean {
  const code = mapping.sourceAccountCode;
  const name = mapping.sourceAccountName.toLowerCase();
  return (
    isGlInPolicySet(code, policy.revenue.affiliateGlCodes) ||
    /شقيقة|affiliate|intercompany|inter-company/.test(name) ||
    normalizeMap1(resolveErpMap1Label(mapping, policy)) === "affiliate revenue"
  );
}

export function isPresentationOperatingRevenueMapping(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): boolean {
  if (!isPresentationRevenueMapping(mapping)) return false;
  if (
    policy.revenue.excludeAffiliateFromOperatingHeadline &&
    isPresentationIntercompanyRevenueMapping(mapping, policy)
  ) {
    return false;
  }
  if (
    policyUsesAuditedHeadlineRules(policy) &&
    isOperatingRevenueExcludedByPolicy(mapping, policy)
  ) {
    return false;
  }
  return normalizeMap1(resolveErpMap1Label(mapping, policy)) === "revenues";
}

export function isPresentationCostOfRevenueForAuditedFace(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): boolean {
  if (!isPresentationCostOfRevenueMapping(mapping)) return false;
  if (
    policyUsesAuditedHeadlineRules(policy) &&
    isCorExcludedByPolicy(mapping, policy)
  ) {
    return false;
  }
  return true;
}
