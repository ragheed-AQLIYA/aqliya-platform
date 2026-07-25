import {
  getIncomeStatementPeriodAmount,
  getSignedTrialBalanceNet,
} from "@/lib/audit/db/income-statement-amount";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import {
  GENERIC_PRESENTATION_POLICY_V1,
  policyUsesAuditedHeadlineRules,
} from "@/lib/audit/presentation/presentation-policy-types";
import {
  PresentationProfile,
  DEFAULT_PRESENTATION_PROFILE,
} from "@/lib/audit/presentation/presentation-profile";
import { resolvePolicyForProfile } from "@/lib/audit/presentation/presentation-policy-resolver";
import type {
  PresentationMapping,
  PresentationLineKind,
} from "./income-statement-presentation-types";
import {
  classifyPresentationMapping,
  classifyRevenuePresentationSegment,
  isPresentationRevenueMapping,
  isPresentationIntercompanyRevenueMapping,
  isPresentationOperatingRevenueMapping,
  isPresentationCostOfRevenueForAuditedFace,
  isPresentationOtherIncomeMapping,
} from "./income-statement-presentation-classify";
import { isOperatingRevenueExcludedByPolicy } from "./income-statement-presentation-policy";

function resolvePolicyArg(
  policyOrProfile?: PresentationPolicyRules | PresentationProfile,
): PresentationPolicyRules {
  if (
    policyOrProfile &&
    typeof policyOrProfile === "object" &&
    "headline" in policyOrProfile
  ) {
    return policyOrProfile;
  }
  return resolvePolicyForProfile(
    (policyOrProfile as PresentationProfile | undefined) ??
      DEFAULT_PRESENTATION_PROFILE,
  );
}

const SHALFA_POLICY_FALLBACK = resolvePolicyForProfile(
  PresentationProfile.PILOT_AUDITED,
);

export function getPresentationPeriodAmount(
  mapping: PresentationMapping,
  kind?: PresentationLineKind | null,
): number {
  const resolved = kind ?? classifyPresentationMapping(mapping);
  if (!resolved) return 0;

  if (resolved === "finance_deposit_gain") {
    return Math.max(0, getSignedTrialBalanceNet(mapping));
  }

  const accountingKind =
    resolved === "revenue_affiliate" ||
    resolved === "revenue_contract" ||
    resolved === "revenue_other"
      ? "revenue"
      : resolved;

  return getIncomeStatementPeriodAmount(mapping, accountingKind);
}

export function filterPresentationKind(
  mappings: PresentationMapping[],
  kind: PresentationLineKind,
): PresentationMapping[] {
  return mappings.filter((m) => classifyPresentationMapping(m) === kind);
}

export function sumPresentationKind(
  mappings: PresentationMapping[],
  kind: PresentationLineKind,
): number {
  return filterPresentationKind(mappings, kind).reduce(
    (total, mapping) => total + getPresentationPeriodAmount(mapping, kind),
    0,
  );
}

export function sumAllPresentationRevenue(mappings: PresentationMapping[]): number {
  return (
    sumPresentationKind(mappings, "revenue_affiliate") +
    sumPresentationKind(mappings, "revenue_contract") +
    sumPresentationKind(mappings, "revenue_other")
  );
}

/**
 * Audited FS reports consolidated revenue without intercompany affiliate gross-up.
 * Presentation-only — does not change accounting net profit.
 */
export function getPresentationRevenueTotalConsolidated(
  mappings: PresentationMapping[],
): number {
  return (
    sumAllPresentationRevenue(mappings) -
    sumPresentationKind(mappings, "revenue_affiliate")
  );
}

/** Audited-style other income net (gross other income minus finance deposit gains). */
export function getPresentationOtherIncomeNet(
  mappings: PresentationMapping[],
): number {
  const gross = sumPresentationKind(mappings, "other_income");
  const depositGain = sumPresentationKind(mappings, "finance_deposit_gain");
  return Math.max(0, gross - depositGain);
}

/** Policy-aware finance cost net (gross minus deposit credits minus optional offset). */
export function getPolicyAlignedFinanceCostNet(
  mappings: PresentationMapping[],
  policy: PresentationPolicyRules,
): number {
  const gross = sumPresentationKind(mappings, "finance_cost");
  const depositGain = sumPresentationKind(mappings, "finance_deposit_gain");
  const offset = policy.finance.netOffset ?? 0;
  return Math.max(0, gross - depositGain - offset);
}

/** Policy-aware other income net with optional misc GL residual cap. */
export function getPolicyAlignedOtherIncomeNet(
  mappings: PresentationMapping[],
  policy: PresentationPolicyRules,
): number {
  const gross = getPresentationOtherIncomeNet(mappings);
  const miscGl = policy.otherIncome.miscNettingGlCode;
  const targetNet = policy.otherIncome.targetNet;
  if (!miscGl || targetNet == null) {
    return gross;
  }

  const nonMisc = mappings.filter(
    (m) =>
      isPresentationOtherIncomeMapping(m) && m.sourceAccountCode !== miscGl,
  );
  const nonMiscTotal = nonMisc.reduce(
    (total, mapping) =>
      total + getIncomeStatementPeriodAmount(mapping, "other_income"),
    0,
  );
  const miscTotal = mappings
    .filter(
      (m) =>
        isPresentationOtherIncomeMapping(m) && m.sourceAccountCode === miscGl,
    )
    .reduce(
      (total, mapping) =>
        total + getIncomeStatementPeriodAmount(mapping, "other_income"),
      0,
    );
  const miscResidual = Math.max(0, targetNet - nonMiscTotal);
  return nonMiscTotal + Math.min(miscTotal, miscResidual);
}

/** @deprecated Use getPolicyAlignedFinanceCostNet */
export function getAuditedAlignedFinanceCostNet(
  mappings: PresentationMapping[],
): number {
  return getPolicyAlignedFinanceCostNet(mappings, SHALFA_POLICY_FALLBACK);
}

/** @deprecated Use getPolicyAlignedOtherIncomeNet */
export function getAuditedAlignedOtherIncomeNet(
  mappings: PresentationMapping[],
): number {
  return getPolicyAlignedOtherIncomeNet(mappings, SHALFA_POLICY_FALLBACK);
}

export function sumAuditedOperatingRevenueHeadline(
  mappings: PresentationMapping[],
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): number {
  return mappings
    .filter((m) => isPresentationOperatingRevenueMapping(m, policy))
    .reduce(
      (total, mapping) =>
        total + getIncomeStatementPeriodAmount(mapping, "revenue"),
      0,
    );
}

export function sumIntercompanyRevenuePresentation(
  mappings: PresentationMapping[],
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): number {
  return mappings
    .filter((m) => isPresentationIntercompanyRevenueMapping(m, policy))
    .reduce(
      (total, mapping) =>
        total + getIncomeStatementPeriodAmount(mapping, "revenue"),
      0,
    );
}

export function sumAuditedRevenueReclassifiedPresentation(
  mappings: PresentationMapping[],
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): number {
  return mappings
    .filter(
      (m) =>
        isPresentationRevenueMapping(m) &&
        isOperatingRevenueExcludedByPolicy(m, policy),
    )
    .reduce(
      (total, mapping) =>
        total + getIncomeStatementPeriodAmount(mapping, "revenue"),
      0,
    );
}

export function sumAuditedCostOfRevenuePresentation(
  mappings: PresentationMapping[],
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): number {
  return mappings
    .filter((m) => isPresentationCostOfRevenueForAuditedFace(m, policy))
    .reduce(
      (total, mapping) =>
        total + getIncomeStatementPeriodAmount(mapping, "cost_of_revenue"),
      0,
    );
}

export function getGenericFinanceCostNet(
  mappings: PresentationMapping[],
): number {
  const gross = sumPresentationKind(mappings, "finance_cost");
  const depositGain = sumPresentationKind(mappings, "finance_deposit_gain");
  return Math.max(0, gross - depositGain);
}

export function getPresentationFinanceCostNet(
  mappings: PresentationMapping[],
  policyOrProfile?: PresentationPolicyRules | PresentationProfile,
): number {
  const policy = resolvePolicyArg(policyOrProfile);
  return policyUsesAuditedHeadlineRules(policy)
    ? getPolicyAlignedFinanceCostNet(mappings, policy)
    : getGenericFinanceCostNet(mappings);
}

function buildGenericPresentationIncomeStatementTotals(
  mappings: PresentationMapping[],
) {
  const revenueAffiliate = sumPresentationKind(mappings, "revenue_affiliate");
  const revenueContract = sumPresentationKind(mappings, "revenue_contract");
  const revenueOther = sumPresentationKind(mappings, "revenue_other");
  const revenueTotal = sumAllPresentationRevenue(mappings);
  const costOfRevenueTotal = sumPresentationKind(mappings, "cost_of_revenue");
  const operatingExpensesTotal = sumPresentationKind(
    mappings,
    "operating_expense",
  );
  const financeCostsTotal = getGenericFinanceCostNet(mappings);
  const otherIncomeTotal = getPresentationOtherIncomeNet(mappings);
  const zakatTotal = sumPresentationKind(mappings, "zakat");
  const grossProfit = revenueTotal - costOfRevenueTotal;
  const operatingProfit = grossProfit - operatingExpensesTotal;
  const profitBeforeZakat =
    operatingProfit - financeCostsTotal + otherIncomeTotal;

  return {
    revenueTotal,
    revenueIntercompany: revenueAffiliate,
    revenueReclassified: 0,
    revenueAffiliate,
    revenueContract,
    revenueOther,
    costOfRevenueTotal,
    operatingExpensesTotal,
    financeCostsTotal,
    otherIncomeTotal,
    zakatTotal,
    grossProfit,
    operatingProfit,
    profitBeforeZakat,
  };
}

function buildPolicyPresentationIncomeStatementTotals(
  mappings: PresentationMapping[],
  policy: PresentationPolicyRules,
) {
  if (!policyUsesAuditedHeadlineRules(policy)) {
    return buildGenericPresentationIncomeStatementTotals(mappings);
  }

  const revenueIntercompany = sumIntercompanyRevenuePresentation(mappings, policy);
  const revenueReclassified = sumAuditedRevenueReclassifiedPresentation(
    mappings,
    policy,
  );
  const revenueAffiliate = sumPresentationKind(mappings, "revenue_affiliate");
  const revenueContract = sumPresentationKind(mappings, "revenue_contract");
  const revenueOther = sumPresentationKind(mappings, "revenue_other");
  const revenueTotal = sumAuditedOperatingRevenueHeadline(mappings, policy);
  const costOfRevenueTotal = sumAuditedCostOfRevenuePresentation(
    mappings,
    policy,
  );
  const operatingExpensesTotal = sumPresentationKind(
    mappings,
    "operating_expense",
  );
  const financeCostsTotal = getPolicyAlignedFinanceCostNet(mappings, policy);
  const otherIncomeTotal = getPolicyAlignedOtherIncomeNet(mappings, policy);
  const zakatTotal = sumPresentationKind(mappings, "zakat");
  const grossProfit = revenueTotal - costOfRevenueTotal;
  const operatingProfit = grossProfit - operatingExpensesTotal;
  const profitBeforeZakat =
    operatingProfit - financeCostsTotal + otherIncomeTotal;

  return {
    revenueTotal,
    revenueIntercompany,
    revenueReclassified,
    revenueAffiliate,
    revenueContract,
    revenueOther,
    costOfRevenueTotal,
    operatingExpensesTotal,
    financeCostsTotal,
    otherIncomeTotal,
    zakatTotal,
    grossProfit,
    operatingProfit,
    profitBeforeZakat,
  };
}

export function buildPresentationIncomeStatementTotals(
  mappings: PresentationMapping[],
  policyOrProfile?: PresentationPolicyRules | PresentationProfile,
) {
  const policy = resolvePolicyArg(policyOrProfile);
  return buildPolicyPresentationIncomeStatementTotals(mappings, policy);
}
