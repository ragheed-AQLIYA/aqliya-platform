import { GENERIC_PRESENTATION_POLICY_V1 } from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationMapping, PresentationLineKind } from "../income-statement-presentation-types";
import {
  normalizeMap1,
  isGlInPolicySet,
  resolveErpMap1Label,
} from "../income-statement-presentation-helpers";
import {
  isPresentationRevenueMapping,
  isPresentationZakatMapping,
  isPresentationFinanceDepositGainMapping,
  isPresentationFinanceCostMapping,
  isPresentationOtherIncomeMapping,
  isPresentationCostOfRevenueMapping,
  isPresentationOperatingExpenseMapping,
} from "./predicates";

export function classifyRevenuePresentationSegment(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): "revenue_affiliate" | "revenue_contract" | "revenue_other" | null {
  if (!isPresentationRevenueMapping(mapping)) return null;

  const code = mapping.sourceAccountCode;
  const name = mapping.sourceAccountName.toLowerCase();
  const map1 = normalizeMap1(resolveErpMap1Label(mapping, policy));

  if (
    isGlInPolicySet(code, policy.revenue.affiliateGlCodes) ||
    map1 === "affiliate revenue" ||
    /شقيقة|affiliate|intercompany/.test(name)
  ) {
    return "revenue_affiliate";
  }

  if (
    isGlInPolicySet(code, policy.revenue.contractRevenueGlCodes) ||
    (/غير مفوتر|unbilled|contract|مطالبات|عقد/.test(name) &&
      !isGlInPolicySet(code, policy.revenue.unbilledDuplicateGlCodes))
  ) {
    return "revenue_contract";
  }

  return "revenue_other";
}

export function classifyPresentationMapping(
  mapping: PresentationMapping,
): PresentationLineKind | null {
  if (isPresentationZakatMapping(mapping)) return "zakat";
  if (isPresentationFinanceDepositGainMapping(mapping)) {
    return "finance_deposit_gain";
  }
  if (isPresentationFinanceCostMapping(mapping)) return "finance_cost";
  if (isPresentationOtherIncomeMapping(mapping)) return "other_income";

  const revenueSegment = classifyRevenuePresentationSegment(mapping);
  if (revenueSegment) return revenueSegment;

  if (isPresentationCostOfRevenueMapping(mapping)) return "cost_of_revenue";
  if (isPresentationOperatingExpenseMapping(mapping)) return "operating_expense";

  return null;
}
