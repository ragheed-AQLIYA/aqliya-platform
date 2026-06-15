import type { IncomeStatementMapping } from "@/lib/audit/db/income-statement-amount";
import {
  getIncomeStatementPeriodAmount,
  getSignedTrialBalanceNet,
  isIncomeStatementSourceAccount,
} from "@/lib/audit/db/income-statement-amount";
import {
  DEFAULT_PRESENTATION_PROFILE,
  PresentationProfile,
} from "@/lib/audit/presentation/presentation-profile";
import {
  GENERIC_PRESENTATION_POLICY_V1,
  type PresentationPolicyRules,
  policyUsesAuditedHeadlineRules,
} from "@/lib/audit/presentation/presentation-policy-types";
import { resolvePolicyForProfile } from "@/lib/audit/presentation/presentation-policy-resolver";

export type { PresentationProfile };
export { resolvePresentationProfile } from "@/lib/audit/presentation/presentation-profile";
export type { PresentationPolicyRules };

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

function policyGlSet(codes: string[]): Set<string> {
  return new Set(codes);
}

function isGlInPolicySet(code: string, codes: string[]): boolean {
  return policyGlSet(codes).has(code);
}

function matchesPolicyPrefix(code: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => code.startsWith(prefix));
}

export function isOperatingRevenueExcludedByPolicy(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules,
): boolean {
  return isGlInPolicySet(
    mapping.sourceAccountCode,
    policy.revenue.operatingExclusionGlCodes,
  );
}

export function isCorExcludedByPolicy(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules,
): boolean {
  const code = mapping.sourceAccountCode;
  if (isGlInPolicySet(code, policy.costOfRevenue.exclusionGlCodes)) {
    return true;
  }
  return matchesPolicyPrefix(code, policy.costOfRevenue.exclusionPrefixPatterns);
}

/** @deprecated Use policy.headline.useAuditedHeadlineRules */
export function isPilotAuditedPresentationProfile(
  policyOrProfile?: PresentationPolicyRules | PresentationProfile,
): boolean {
  return policyUsesAuditedHeadlineRules(resolvePolicyArg(policyOrProfile));
}

/** Extended mapping input for presentation (Map1 label optional — no schema change). */
export type PresentationMapping = IncomeStatementMapping & {
  erpMap1Label?: string | null;
};

const SHALFA_POLICY_FALLBACK = resolvePolicyForProfile(
  PresentationProfile.PILOT_AUDITED,
);

/** @deprecated Use isOperatingRevenueExcludedByPolicy */
export function isAuditedOperatingRevenueExcluded(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = SHALFA_POLICY_FALLBACK,
): boolean {
  return isOperatingRevenueExcludedByPolicy(mapping, policy);
}

/** @deprecated Use isCorExcludedByPolicy */
export function isAuditedCorPresentationExcluded(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = SHALFA_POLICY_FALLBACK,
): boolean {
  return isCorExcludedByPolicy(mapping, policy);
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

export type PresentationLineKind =
  | "revenue"
  | "revenue_affiliate"
  | "revenue_contract"
  | "revenue_other"
  | "cost_of_revenue"
  | "operating_expense"
  | "finance_cost"
  | "finance_deposit_gain"
  | "other_income"
  | "zakat";

function normalizeMap1(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function resolveErpMap1Label(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): string | null {
  if (mapping.erpMap1Label) {
    return mapping.erpMap1Label.trim() || null;
  }

  const code = mapping.sourceAccountCode;
  const name = mapping.sourceAccountName.toLowerCase();

  if (code.startsWith("32") || code.startsWith("33")) return "Cost of revenue";
  if (/^3101020005$/i.test(code) || /zakat|zakah|زكاة/.test(name)) {
    const map1Hint = normalizeMap1(mapping.erpMap1Label ?? "");
    if (map1Hint === "zakat expense" || /^3101020005$/i.test(code)) {
      return "zakat expense";
    }
  }
  if (
    code.startsWith("310107") ||
    /finance cost|murabaha|مرابحة|فائد/.test(name)
  ) {
    return "Finance Costs";
  }
  if (
    isGlInPolicySet(code, policy.revenue.affiliateGlCodes) ||
    /شقيقة|affiliate|intercompany|inter-company/.test(name)
  ) {
    return "Affiliate revenue";
  }
  if (
    /^4[3-7]/.test(code) &&
    !isGlInPolicySet(code, policy.revenue.contractRevenueGlCodes) &&
    !isGlInPolicySet(code, policy.revenue.affiliateGlCodes)
  ) {
    return "Revenues";
  }
  if (/other income|أرباح بيع|ايرادات اخرى|استبعاد/.test(name)) {
    return "Other income";
  }
  if (
    code.startsWith("31") &&
    !code.startsWith("310102") &&
    !code.startsWith("310107")
  ) {
    return "General and administrative expenses";
  }

  return null;
}

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

/** Murabaha / deposit gain credits — netted against other income in audited FS presentation. */
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
  // Phase 14 — Map1 line label overrides GL prefix (Shalfa: 32xx/33xx with Map1 G&A).
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

export const EQUITY_BRIDGE_CURRENT_YEAR_LABEL =
  "Current Year Profit (IS period — unclosed to RE in TB export)";

export const EQUITY_BRIDGE_ACTUARIAL_LABEL = "Actuarial reserve movement (OCI)";
