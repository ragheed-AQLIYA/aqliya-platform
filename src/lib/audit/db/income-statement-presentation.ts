// ─── Barrel re-export for backward compatibility ───
// All existing imports from "@/lib/audit/db/income-statement-presentation" continue to work unchanged.
// Domain modules live alongside this file in the same directory.

export type { PresentationMapping, PresentationLineKind } from "./income-statement-presentation-types";
export type { PresentationProfile, PresentationPolicyRules } from "./income-statement-presentation-types";
export { resolvePresentationProfile } from "./income-statement-presentation-types";
export { EQUITY_BRIDGE_CURRENT_YEAR_LABEL, EQUITY_BRIDGE_ACTUARIAL_LABEL } from "./income-statement-presentation-types";

export { resolveErpMap1Label, normalizeMap1 } from "./income-statement-presentation-helpers";

export {
  isOperatingRevenueExcludedByPolicy,
  isCorExcludedByPolicy,
  isPilotAuditedPresentationProfile,
} from "./income-statement-presentation-policy";

export {
  isPresentationZakatMapping,
  isPresentationFinanceCostMapping,
  isPresentationFinanceDepositGainMapping,
  isPresentationCostOfRevenueMapping,
  isPresentationOperatingExpenseMapping,
  isPresentationRevenueMapping,
  isPresentationOtherIncomeMapping,
  isPresentationIntercompanyRevenueMapping,
  isPresentationOperatingRevenueMapping,
  isPresentationCostOfRevenueForAuditedFace,
  classifyRevenuePresentationSegment,
  classifyPresentationMapping,
  isAuditedOperatingRevenueExcluded,
  isAuditedCorPresentationExcluded,
} from "./income-statement-presentation-classify";

export {
  getPresentationPeriodAmount,
  filterPresentationKind,
  sumPresentationKind,
  sumAllPresentationRevenue,
  getPresentationRevenueTotalConsolidated,
  getPresentationOtherIncomeNet,
  getPolicyAlignedFinanceCostNet,
  getPolicyAlignedOtherIncomeNet,
  getAuditedAlignedFinanceCostNet,
  getAuditedAlignedOtherIncomeNet,
  sumAuditedOperatingRevenueHeadline,
  sumIntercompanyRevenuePresentation,
  sumAuditedRevenueReclassifiedPresentation,
  sumAuditedCostOfRevenuePresentation,
  getGenericFinanceCostNet,
  getPresentationFinanceCostNet,
  buildPresentationIncomeStatementTotals,
} from "./income-statement-presentation-amounts";
