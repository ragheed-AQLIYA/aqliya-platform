// ─── LocalContentOS — LCGPA Entity-Level Calculation Engine ───
// Deterministic, explainable, versioned, auditable, reproducible.
// Every number traceable to: Rule, Version, Inputs, Calculation, Result, Evidence, Timestamp, Actor.

import type {
  LcPillarInputs,
  LcPillarResult,
  GsSelectionResult,
  RankedSupplier,
  GoodsServicesInputs,
  AssetDepreciationInputs,
  LaborCompensationInputs,
  CapacityBuildingInputs,
  FinancialEvaluationInputs,
  FinancialEvaluationResult,
  FinancialEvaluationOutput,
  FinancialEvaluationError,
  PenaltyAssessmentInputs,
  PenaltyAssessmentResult,
  PenaltyAssessmentOutput,
  PenaltyAssessmentError,
  GradualPlanInputs,
  GradualPlanResult,
  GradualPlanOutput,
  GradualPlanError,
  GradualPlanMilestoneInput,
  GradualPlanMilestoneOutput,
  OwnershipRuleCheck,
  SmePreferenceResult,
  PricePreferenceResult,
  TenderEvaluationInputs,
  TenderEvaluationResult,
} from "./types";
import { LCGPA_RULE_VERSION, EXPAT_LC_RATE_REGULATION } from "./types";

// ─── Rounding Helper ───

/**
 * Round to specified decimal places.
 * Deterministic: uses Math.round with multiplier.
 * @param value - The value to round
 * @param decimals - Number of decimal places (default: 2)
 */
function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ─── Goods & Services Pillar ───

/**
 * Apply the G&S Supplier Selection Rule (Article 17):
 * 1. Rank suppliers by descending spend.
 * 2. Select suppliers contributing to ≥70% of total G&S cost.
 * 3. If 70% threshold is reached with fewer than 40 suppliers,
 *    select top 40 suppliers instead.
 * 4. Selection is the GREATER of the two sets.
 *
 * Deterministic: same inputs always produce same output.
 * Tie-breaking: suppliers with identical spend are ordered by supplierId (lexicographic).
 */
export function applyGsSelectionRule(
  inputs: GoodsServicesInputs,
): GsSelectionResult {
  const { suppliers, totalGoodsServicesCost } = inputs;

  if (suppliers.length === 0 || totalGoodsServicesCost === 0) {
    return {
      selectedSuppliers: [],
      selectedSpend: 0,
      selectedPct: 0,
      selectionMethod: "70pct_rule",
      reached70Pct: false,
      suppliersAt70Pct: 0,
    };
  }

  // Sort by descending spend, tie-break by supplierId lexicographically
  const sorted = [...suppliers].sort((a, b) => {
    if (b.spend !== a.spend) return b.spend - a.spend;
    return a.supplierId.localeCompare(b.supplierId);
  });

  // Assign ranks after sorting
  const ranked: RankedSupplier[] = sorted.map((s, i) => ({
    ...s,
    rank: i + 1,
  }));

  // Find 70% cutoff
  const target70Pct = totalGoodsServicesCost * 0.7;
  let cumulativeSpend = 0;
  let suppliersAt70Pct = 0;
  let reached70Pct = false;

  for (let i = 0; i < ranked.length; i++) {
    cumulativeSpend += ranked[i].spend;
    suppliersAt70Pct = i + 1;
    if (cumulativeSpend >= target70Pct) {
      reached70Pct = true;
      break;
    }
  }

  // Selection is the GREATER of: 70% cutoff suppliers OR top 40 suppliers OR minimum floor of 10
  // SC-04: minimum floor ensures at least 10 unique vendors are evaluated
  const top40Count = Math.min(40, ranked.length);
  const MIN_VENDOR_FLOOR = 10;
  const selectionCount = Math.max(suppliersAt70Pct, top40Count, MIN_VENDOR_FLOOR);
  const selectedSuppliers = ranked.slice(0, selectionCount);
  const selectedSpend = selectedSuppliers.reduce((sum, s) => sum + s.spend, 0);
  const selectedPct = roundTo(
    (selectedSpend / totalGoodsServicesCost) * 100,
  );

  const selectionMethod =
    suppliersAt70Pct >= top40Count ? "70pct_rule" : "top40_rule";

  return {
    selectedSuppliers,
    selectedSpend,
    selectedPct,
    selectionMethod,
    reached70Pct,
    suppliersAt70Pct,
  };
}

/**
 * Compute LC_GS: Local Goods & Services value.
 *
 * Rule: Sum of (spend × localContentPercentage / 100) for selected suppliers.
 * For "local" suppliers: localContentPercentage defaults to 100%.
 * For "non_local" suppliers: localContentPercentage defaults to 0%.
 * For "mixed" suppliers: use declared localContentPercentage.
 * For "unclassified" suppliers: localContentPercentage defaults to 0%.
 */
export function computeLcGoodsServices(
  inputs: GoodsServicesInputs,
): { lcValue: number; totalCost: number; selectedSpend: number } {
  const selection = applyGsSelectionRule(inputs);
  let lcValue = 0;

  for (const supplier of selection.selectedSuppliers) {
    const localPct = getEffectiveLocalPct(supplier);
    lcValue += supplier.spend * (localPct / 100);
  }

  return {
    lcValue: roundTo(lcValue),
    totalCost: inputs.totalGoodsServicesCost,
    selectedSpend: selection.selectedSpend,
  };
}

/**
 * Get effective local content percentage for a supplier.
 * Deterministic: same classification always produces same result.
 *
 * Priority:
 *   1. "local" → 100%
 *   2. "non_local" → 0%
 *   3. "mixed" → supplier's declared localContentPercentage (fallback 50%)
 *   4. "unclassified" → sector LC% rate from Appendix B (fallback 0%)
 */
function getEffectiveLocalPct(supplier: RankedSupplier): number {
  switch (supplier.localityClassification) {
    case "local":
      return 100;
    case "non_local":
      return 0;
    case "mixed":
      return supplier.localContentPercentage ?? 50;
    case "unclassified":
    default:
      // Use sector LC% rate from Appendix B if available, otherwise 0
      return supplier.sectorLcRate !== undefined ? supplier.sectorLcRate * 100 : 0;
  }
}

// ─── Asset Depreciation Pillar ───

/**
 * Compute LC_AD: Local Asset Depreciation value.
 *
 * Rule:
 *   KSA-manufactured assets: 100% of depreciation
 *   Foreign-origin assets:   20% of depreciation
 *   LC_AD = KSA × 100% + Foreign × 20%
 *
 * Deterministic: linear formula, no branching.
 */
export function computeLcAssetDepreciation(inputs: AssetDepreciationInputs): {
  lcValue: number;
  totalCost: number;
} {
  const lcValue = roundTo(
    inputs.ksaManufacturedDepreciation * 1.0 +
      inputs.foreignAssetDepreciation * 0.2,
  );

  return {
    lcValue,
    totalCost: inputs.totalDepreciation,
  };
}

// ─── Labor Compensation Pillar ───

/**
 * Compute LC_LC: Local Labor Compensation value.
 *
 * Rule:
 *   Saudi employees:  100% of compensation
 *   Expat employees:   configurable % of compensation (default 37% per regulation)
 *   LC_LC = Saudi × 100% + Expat × expatLcRate
 *
 * Deterministic: linear formula, no branching.
 */
export function computeLcLaborCompensation(inputs: LaborCompensationInputs): {
  lcValue: number;
  totalCost: number;
} {
  const expatRate = inputs.expatLcRate ?? EXPAT_LC_RATE_REGULATION;
  const lcValue = roundTo(
    inputs.saudiCompensation * 1.0 +
      inputs.expatCompensation * expatRate,
  );

  return {
    lcValue,
    totalCost: inputs.totalCompensation,
  };
}

// ─── Capacity Building Pillar ───

/**
 * Compute LC_CB: Local Capacity Building value.
 *
 * Rule:
 *   Saudi training:        100% of cost
 *   Supplier development:  included as-is (KSA-based assumed)
 *   R&D in KSA:            100% of cost
 *   LC_CB = SaudiTraining × 100% + SupplierDevelopment + RdInKsa × 100%
 *
 * Note: totalCapacityBuildingCost is the denominator for CB pillar %.
 * The numerator (LC_CB) sums the local attributions.
 *
 * Deterministic: linear formula, no branching.
 */
export function computeLcCapacityBuilding(inputs: CapacityBuildingInputs): {
  lcValue: number;
  totalCost: number;
} {
  const lcValue = roundTo(
    inputs.saudiTrainingCost * 1.0 +
      inputs.supplierDevelopmentCost +
      inputs.rdCostInKsa * 1.0,
  );

  return {
    lcValue,
    totalCost: inputs.totalCapacityBuildingCost,
  };
}

// ─── Overall LCGPA Calculation ───

/**
 * Compute the full LCGPA Entity-Level Local Content Percentage.
 *
 * Formula:
 *   LC% = (LC_GS + LC_AD + LC_LC + LC_CB) / Total_Costs × 100
 *
 * Where Total_Costs = sum of all four pillars' total costs.
 *
 * This is the canonical implementation. All other scoring methods
 * (IKTVA fixed weights) are separate and preserved for historical records.
 *
 * Deterministic: same inputs always produce same output.
 * Versioned: tied to LCGPA_RULE_VERSION.
 * Auditable: full input/output trace is recorded.
 */
export function computeLcgpaScore(inputs: LcPillarInputs): LcPillarResult {
  // Compute each pillar
  const gs = computeLcGoodsServices(inputs.goodsServices);
  const ad = computeLcAssetDepreciation(inputs.assetDepreciation);
  const lc = computeLcLaborCompensation(inputs.laborCompensation);
  const cb = computeLcCapacityBuilding(inputs.capacityBuilding);

  // Total costs = sum of all pillars' total costs
  const totalCosts = roundTo(
    gs.totalCost + ad.totalCost + lc.totalCost + cb.totalCost,
  );

  // Local content values
  const lcGoodsServices = gs.lcValue;
  const lcAssetDepreciation = ad.lcValue;
  const lcLaborCompensation = lc.lcValue;
  const lcCapacityBuilding = cb.lcValue;

  // Sum of all local content values
  const totalLc = roundTo(
    lcGoodsServices + lcAssetDepreciation + lcLaborCompensation + lcCapacityBuilding,
  );

  // Overall LC percentage
  const overallLcPct =
    totalCosts > 0 ? roundTo((totalLc / totalCosts) * 100) : 0;

  // Per-pillar percentages (contribution to total)
  const gsLcPct = totalCosts > 0 ? roundTo((lcGoodsServices / totalCosts) * 100) : 0;
  const adLcPct = totalCosts > 0 ? roundTo((lcAssetDepreciation / totalCosts) * 100) : 0;
  const lcPillarLcPct = totalCosts > 0 ? roundTo((lcLaborCompensation / totalCosts) * 100) : 0;
  const cbLcPct = totalCosts > 0 ? roundTo((lcCapacityBuilding / totalCosts) * 100) : 0;

  return {
    lcGoodsServices,
    lcAssetDepreciation,
    lcLaborCompensation,
    lcCapacityBuilding,
    totalCosts,
    overallLcPct,
    gsLcPct,
    adLcPct,
    lcPillarLcPct,
    cbLcPct,
  };
}

// ─── Financial Evaluation (Article 17) ───

/**
 * Validation errors for financial evaluation inputs.
 * Returns array of validation errors (empty = valid).
 */
export function validateFinancialEvaluationInputs(
  inputs: FinancialEvaluationInputs,
): FinancialEvaluationError[] {
  const errors: FinancialEvaluationError[] = [];

  // Bid price validation
  if (inputs.bidPrice === 0) {
    errors.push("BID_PRICE_ZERO");
  } else if (inputs.bidPrice < 0) {
    errors.push("BID_PRICE_NEGATIVE");
  }

  // Lowest bid price validation
  if (inputs.lowestBidPrice < 0) {
    errors.push("LOWEST_BID_PRICE_NEGATIVE");
  }

  // Bid below lowest (logical constraint)
  if (inputs.bidPrice > 0 && inputs.lowestBidPrice > inputs.bidPrice) {
    errors.push("BID_BELOW_LOWEST");
  }

  // LC% range validation (0-100)
  if (inputs.baselineLcPct < 0 || inputs.baselineLcPct > 100) {
    errors.push("BASELINE_LC_PCT_OUT_OF_RANGE");
  }
  if (inputs.targetedLcPct < 0 || inputs.targetedLcPct > 100) {
    errors.push("TARGETED_LC_PCT_OUT_OF_RANGE");
  }

  return errors;
}

/**
 * Get human-readable error message for a financial evaluation error.
 */
export function getFinancialEvaluationErrorMessage(
  error: FinancialEvaluationError,
): string {
  switch (error) {
    case "BID_PRICE_ZERO":
      return "سعر العرض لا يمكن أن يكون صفر";
    case "BID_PRICE_NEGATIVE":
      return "سعر العرض لا يمكن أن يكون سالباً";
    case "LOWEST_BID_PRICE_NEGATIVE":
      return "سعر أقل عرض لا يمكن أن يكون سالباً";
    case "BID_BELOW_LOWEST":
      return "سعر العرض أقل من أقل عرض مسجل";
    case "BASELINE_LC_PCT_OUT_OF_RANGE":
      return "نسبة المحتوى المحلي الأساسية يجب أن تكون بين 0 و 100";
    case "TARGETED_LC_PCT_OUT_OF_RANGE":
      return "نسبة المحتوى المحلي المستهدفة يجب أن تكون بين 0 و 100";
    case "RULE_VERSION_NOT_FOUND":
      return "إصدار التنظيم غير موجود";
  }
}

/**
 * Compute Article 17 Financial Evaluation score for a supply tender.
 *
 * Formula (LCGPA Article 17):
 *   PriceScore = (LowestBid / EvaluatedBid) × 60
 *   LCScore = ((TargetedLC% × 50% + BaselineLC% × 50%) / 100 + ListedBonus / 100) × 40
 *   ListedBonus = 5 if supplier is listed on Tadawul/Nomu (normalized to 0.05)
 *   OverallScore = PriceScore + LCScore
 *
 * Higher score = better evaluation result.
 *
 * Deterministic: same inputs always produce same output.
 * Versioned: tied to LCGPA_RULE_VERSION.
 * Validated: all inputs are checked before calculation.
 * Traceable: full input/output trace is recorded.
 *
 * @param inputs - Financial evaluation inputs
 * @returns Financial evaluation output with validation status
 */
export function computeFinancialEvaluation(
  inputs: FinancialEvaluationInputs,
): FinancialEvaluationOutput {
  const warnings: string[] = [];

  // Validate inputs
  const validationErrors = validateFinancialEvaluationInputs(inputs);
  if (validationErrors.length > 0) {
    return {
      success: false,
      result: null,
      error: validationErrors[0],
      errorMessage: getFinancialEvaluationErrorMessage(validationErrors[0]),
      warnings,
    };
  }

  // Add warnings for edge cases
  if (inputs.bidPrice === inputs.lowestBidPrice) {
    warnings.push("Bid price equals lowest bid price");
  }
  if (inputs.baselineLcPct === 0 && inputs.targetedLcPct === 0) {
    warnings.push("Both baseline and target LC% are zero");
  }

  const listedCompanyBonus = inputs.isListedCompany ? 5 : 0;

  // Price score: ratio of lowest bid to this bid, weighted 60%
  const priceRatio =
    inputs.lowestBidPrice > 0
      ? inputs.lowestBidPrice / inputs.bidPrice
      : 0;
  const priceScore = roundTo(priceRatio * 60, 4);

  // LC score: blended baseline + target, weighted 40%
  // CRITICAL: Normalize LC% from [0, 100] to [0, 1] before applying weight
  const lcBlend = inputs.targetedLcPct * 0.5 + inputs.baselineLcPct * 0.5;
  const lcNormalized = lcBlend / 100; // Normalize to [0, 1]
  const lcScore = roundTo((lcNormalized + listedCompanyBonus / 100) * 40, 4);

  const overallScore = roundTo(priceScore + lcScore, 4);

  return {
    success: true,
    result: {
      priceScore,
      lcScore,
      listedCompanyBonus,
      overallScore,
      rank: null, // Rank is assigned after all bids are evaluated
    },
    error: null,
    errorMessage: null,
    warnings,
  };
}

/**
 * Rank multiple financial evaluation results.
 * Assigns rank based on overall score (higher = better).
 * Tied scores receive the same rank.
 *
 * @param evaluations - Array of financial evaluation outputs
 * @returns Array with ranks assigned
 */
export function rankFinancialEvaluations(
  evaluations: FinancialEvaluationOutput[],
): FinancialEvaluationOutput[] {
  // Separate successful and failed evaluations
  const successful = evaluations.filter(
    (e) => e.success && e.result !== null,
  );
  const failed = evaluations.filter((e) => !e.success || e.result === null);

  // Sort successful by overall score descending
  const sorted = [...successful].sort(
    (a, b) => (b.result?.overallScore ?? 0) - (a.result?.overallScore ?? 0),
  );

  // Assign ranks (tied scores get same rank)
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (
      i > 0 &&
      sorted[i].result?.overallScore !== sorted[i - 1].result?.overallScore
    ) {
      currentRank = i + 1;
    }
    if (sorted[i].result) {
      sorted[i].result!.rank = currentRank;
    }
  }

  // Return sorted by rank (best first), failed at end
  return [...sorted, ...failed];
}

// ─── Penalty Assessment ───

// ─── Ownership Rule ───

/**
 * Check if supplier meets the ≥50% Saudi ownership threshold.
 *
 * Rule:
 *   Saudi ownership ≥ 50% → classified as "Saudi"
 *   Saudi ownership < 50% → classified as "foreign" or "joint_venture"
 *
 * Deterministic: threshold comparison.
 */
export function checkOwnershipRule(
  saudiOwnershipPct: number | null,
  currentClassification: string | null,
): OwnershipRuleCheck {
  if (saudiOwnershipPct === null || saudiOwnershipPct === undefined) {
    return {
      meetsThreshold: false,
      saudiOwnershipPct: 0,
      classification: classifyOwnership(0, currentClassification),
    };
  }

  const pct = Math.min(100, Math.max(0, saudiOwnershipPct));
  const meetsThreshold = pct >= 50;

  return {
    meetsThreshold,
    saudiOwnershipPct: pct,
    classification: classifyOwnership(pct, currentClassification),
  };
}

/**
 * Classify ownership based on percentage.
 * Deterministic mapping.
 */
function classifyOwnership(
  pct: number,
  currentClassification: string | null,
): "Saudi" | "foreign" | "joint_venture" | "unclassified" {
  if (pct >= 50) return "Saudi";
  if (pct > 0 && pct < 50) return "joint_venture";
  if (pct === 0 && currentClassification === "foreign") return "foreign";
  return "unclassified";
}

// ─── Penalty Assessment (Enhanced) ───

/**
 * Validate penalty assessment inputs.
 */
export function validatePenaltyAssessmentInputs(
  inputs: PenaltyAssessmentInputs,
): PenaltyAssessmentError[] {
  const errors: PenaltyAssessmentError[] = [];

  if (inputs.contractValue < 0) {
    errors.push("CONTRACT_VALUE_NEGATIVE");
  }
  if (inputs.targetLcPct < 0 || inputs.targetLcPct > 100) {
    errors.push("TARGET_LC_PCT_OUT_OF_RANGE");
  }
  if (inputs.actualLcPct < 0 || inputs.actualLcPct > 100) {
    errors.push("ACTUAL_LC_PCT_OUT_OF_RANGE");
  }

  return errors;
}

/**
 * Get human-readable error message for penalty assessment error.
 */
export function getPenaltyAssessmentErrorMessage(
  error: PenaltyAssessmentError,
): string {
  switch (error) {
    case "CONTRACT_VALUE_NEGATIVE":
      return "قيمة العقد لا يمكن أن تكون سالبة";
    case "TARGET_LC_PCT_OUT_OF_RANGE":
      return "نسبة المحتوى المحلي المستهدفة يجب أن تكون بين 0 و 100";
    case "ACTUAL_LC_PCT_OUT_OF_RANGE":
      return "نسبة المحتوى المحلي الفعلية يجب أن تكون بين 0 و 100";
    case "CONTRACT_VALUE_ZERO":
      return "قيمة العقد لا يمكن أن تكون صفر";
  }
}

/**
 * Compute penalty eligibility and exposure (Enhanced with validation).
 *
 * Rule:
 *   Variance = actualLcPct - targetLcPct
 *   If |variance| > 5% → penalty eligible (max 10% of contract value)
 *   If |variance| <= 5% → no penalty
 *
 * Deterministic: linear formula, no branching.
 *
 * @param inputs - Penalty assessment inputs
 * @returns Penalty assessment output with validation status
 */
export function computePenaltyAssessment(
  inputs: PenaltyAssessmentInputs,
): PenaltyAssessmentOutput {
  const warnings: string[] = [];

  // Validate inputs
  const validationErrors = validatePenaltyAssessmentInputs(inputs);
  if (validationErrors.length > 0) {
    return {
      success: false,
      result: null,
      error: validationErrors[0],
      errorMessage: getPenaltyAssessmentErrorMessage(validationErrors[0]),
      warnings,
    };
  }

  // Add warnings for edge cases
  if (inputs.contractValue === 0) {
    warnings.push("Contract value is zero — penalty amount will be zero");
  }
  if (inputs.actualLcPct > inputs.targetLcPct + 20) {
    warnings.push("Actual LC% significantly exceeds target — verify data");
  }

  const variance = roundTo(inputs.actualLcPct - inputs.targetLcPct, 4);
  const exceedsThreshold = Math.abs(variance) > 5;
  const maxPenaltyPct = exceedsThreshold ? 10 : 0;
  const maxPenaltyAmount = roundTo(
    (inputs.contractValue * maxPenaltyPct) / 100,
    4,
  );

  return {
    success: true,
    result: {
      variance,
      exceedsThreshold,
      maxPenaltyPct,
      maxPenaltyAmount,
    },
    error: null,
    errorMessage: null,
    warnings,
  };
}

// ─── Gradual Plan (Enhanced) ───

/**
 * Validate gradual plan inputs.
 */
export function validateGradualPlanInputs(
  inputs: GradualPlanInputs,
): GradualPlanError[] {
  const errors: GradualPlanError[] = [];

  if (!inputs.awardDate || isNaN(new Date(inputs.awardDate).getTime())) {
    errors.push("AWARD_DATE_REQUIRED");
  }
  if (inputs.baselineLcPct < 0 || inputs.baselineLcPct > 100) {
    errors.push("BASELINE_LC_PCT_OUT_OF_RANGE");
  }
  if (inputs.targetedLcPct < 0 || inputs.targetedLcPct > 100) {
    errors.push("TARGET_LC_PCT_OUT_OF_RANGE");
  }
  if (inputs.targetedLcPct < inputs.baselineLcPct) {
    errors.push("TARGET_BELOW_BASELINE");
  }

  return errors;
}

/**
 * Get human-readable error message for gradual plan error.
 */
export function getGradualPlanErrorMessage(
  error: GradualPlanError,
): string {
  switch (error) {
    case "AWARD_DATE_REQUIRED":
      return "تاريخ منح العقد مطلوب";
    case "BASELINE_LC_PCT_OUT_OF_RANGE":
      return "نسبة المحتوى المحلي الأساسية يجب أن تكون بين 0 و 100";
    case "TARGET_LC_PCT_OUT_OF_RANGE":
      return "نسبة المحتوى المحلي المستهدفة يجب أن تكون بين 0 و 100";
    case "TARGET_BELOW_BASELINE":
      return "النسبة المستهدفة لا يمكن أن تكون أقل من الأساسية";
  }
}

/**
 * Compute gradual plan deadline and milestones (Enhanced with validation).
 *
 * Rule:
 *   Submission deadline = awardDate + 60 days
 *   Must be submitted before deadline
 *   Milestones: evenly distributed between baseline and target over the period
 *
 * Deterministic: date arithmetic.
 *
 * @param inputs - Gradual plan inputs
 * @param milestoneCount - Number of milestones to generate (default: 4)
 * @returns Gradual plan output with validation status and milestones
 */
export function computeGradualPlan(
  inputs: GradualPlanInputs,
  milestoneCount: number = 4,
): GradualPlanOutput {
  const warnings: string[] = [];

  // Validate inputs
  const validationErrors = validateGradualPlanInputs(inputs);
  if (validationErrors.length > 0) {
    return {
      success: false,
      result: null,
      milestones: null,
      error: validationErrors[0],
      errorMessage: getGradualPlanErrorMessage(validationErrors[0]),
      warnings,
    };
  }

  const awardDate = new Date(inputs.awardDate);
  const submissionDeadline = new Date(awardDate);
  submissionDeadline.setDate(submissionDeadline.getDate() + 60);

  const now = new Date();
  const isWithinDeadline = now <= submissionDeadline;
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (submissionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  // Add warnings
  if (!isWithinDeadline) {
    warnings.push("Submission deadline has passed");
  }
  if (daysRemaining <= 7) {
    warnings.push(`Only ${daysRemaining} days remaining until deadline`);
  }
  if (inputs.targetedLcPct - inputs.baselineLcPct > 30) {
    warnings.push("Large LC% improvement required — verify feasibility");
  }

  // Generate milestones
  const milestones: GradualPlanMilestoneOutput[] = [];
  const totalDays = 60;
  const lcIncrease = inputs.targetedLcPct - inputs.baselineLcPct;

  for (let i = 1; i <= milestoneCount; i++) {
    const progress = i / milestoneCount;
    const targetDate = new Date(awardDate);
    targetDate.setDate(targetDate.getDate() + Math.round(totalDays * progress));
    const targetLcPct = roundTo(inputs.baselineLcPct + lcIncrease * progress, 2);

    const daysUntilDue = Math.ceil(
      (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let status: GradualPlanMilestoneOutput["status"] = "pending";
    if (daysUntilDue < 0) {
      status = "missed";
    }

    milestones.push({
      sequence: i,
      targetDate,
      targetLcPct,
      description: `Milestone ${i}: Reach ${targetLcPct}% LC`,
      status,
      daysUntilDue,
    });
  }

  return {
    success: true,
    result: {
      submissionDeadline,
      isWithinDeadline,
      daysRemaining,
    },
    milestones,
    error: null,
    errorMessage: null,
    warnings,
  };
}

// ─── SME & Price Preference (Article 11 & 12) ───

/**
 * SME Preference calculation (10% for local SMEs).
 * Rule: Local SME gets 10% price preference in tender evaluation.
 */
export function computeSmePreference(
  bidPrice: number,
  isLocalSme: boolean,
): SmePreferenceResult {
  if (!isLocalSme || bidPrice <= 0) {
    return { adjustedPrice: bidPrice, preferenceApplied: false, preferenceAmount: 0 };
  }

  const preferenceAmount = roundTo(bidPrice * 0.1, 2);
  const adjustedPrice = roundTo(bidPrice - preferenceAmount, 2);

  return {
    adjustedPrice,
    preferenceApplied: true,
    preferenceAmount,
  };
}

/**
 * Price Preference for national products (Article 11).
 * Rule: 10% price preference for national products in supply tenders.
 * Adjusted bid value = Bid price + 10% × Bid price × (1 - share of national products)
 */
export function computePricePreference(
  bidPrice: number,
  nationalProductShare: number, // 0-1, share of national products in the bid
): PricePreferenceResult {
  if (bidPrice <= 0) {
    return { adjustedBidValue: bidPrice, preferenceApplied: false, preferenceAmount: 0 };
  }

  const share = Math.max(0, Math.min(1, nationalProductShare));
  const nonNationalShare = 1 - share;
  const preferenceAmount = roundTo(bidPrice * 0.1 * nonNationalShare, 2);
  const adjustedBidValue = roundTo(bidPrice + preferenceAmount, 2);

  return {
    adjustedBidValue,
    preferenceApplied: nonNationalShare > 0,
    preferenceAmount,
  };
}

// ─── Unified Tender Evaluation (WAVE 8) ───

/**
 * Compute complete tender evaluation combining all LCGPA rules.
 * 
 * Applies in order:
 * 1. Ownership rule check (≥50% Saudi ownership)
 * 2. SME preference (10% discount for local SMEs)
 * 3. Price preference (Article 11: 10% for national products)
 * 4. Financial evaluation (Article 17: 60% price + 40% LC)
 * 5. Penalty assessment (if contract info provided)
 * 6. Gradual plan (if award date provided)
 * 
 * @param inputs - Complete tender evaluation inputs
 * @returns Complete tender evaluation result
 */
export function computeTenderEvaluation(
  inputs: TenderEvaluationInputs,
): TenderEvaluationResult {
  const warnings: string[] = [];

  // 1. Ownership Rule Check
  const ownershipCheck = checkOwnershipRule(inputs.saudiOwnershipPct, inputs.currentClassification);
  if (!ownershipCheck.meetsThreshold) {
    warnings.push("Supplier does not meet ≥50% Saudi ownership threshold");
  }

  // 2. SME Preference (Article 12)
  const smePreference = computeSmePreference(inputs.bidPrice, inputs.isLocalSme);
  if (smePreference.preferenceApplied) {
    warnings.push("SME preference (10%) applied");
  }

  // 3. Price Preference (Article 11)
  const pricePreference = computePricePreference(inputs.bidPrice, inputs.nationalProductShare);
  if (pricePreference.preferenceApplied) {
    warnings.push("Price preference (Article 11) applied for non-national products");
  }

  // 4. Adjusted bid price after all preferences
  // SME preference reduces bid price, Price preference increases bid value
  const adjustedBidPrice = roundTo(
    smePreference.adjustedPrice + pricePreference.preferenceAmount,
    2,
  );

  // 5. Financial Evaluation (Article 17)
  const financialEvaluation = computeFinancialEvaluation({
    tenderReference: inputs.tenderReference,
    supplierId: inputs.supplierId,
    supplierName: inputs.supplierName,
    bidPrice: adjustedBidPrice, // Use adjusted bid price for evaluation
    lowestBidPrice: inputs.lowestBidPrice,
    baselineLcPct: inputs.baselineLcPct,
    targetedLcPct: inputs.targetedLcPct,
    isListedCompany: inputs.isListedCompany,
  });

  if (!financialEvaluation.success) {
    warnings.push(`Financial evaluation failed: ${financialEvaluation.errorMessage}`);
  } else if (financialEvaluation.warnings.length > 0) {
    warnings.push(...financialEvaluation.warnings);
  }

  // 6. Penalty Assessment (if contract info provided)
  let penaltyAssessment: PenaltyAssessmentOutput | undefined;
  if (
    inputs.contractValue !== undefined &&
    inputs.targetLcPct !== undefined &&
    inputs.actualLcPct !== undefined
  ) {
    penaltyAssessment = computePenaltyAssessment({
      contractValue: inputs.contractValue,
      targetLcPct: inputs.targetLcPct,
      actualLcPct: inputs.actualLcPct,
    });
    if (!penaltyAssessment.success) {
      warnings.push(`Penalty assessment failed: ${penaltyAssessment.errorMessage}`);
    } else if (penaltyAssessment.warnings.length > 0) {
      warnings.push(...penaltyAssessment.warnings);
    }
  }

  // 7. Gradual Plan (if award date provided)
  let gradualPlan: GradualPlanOutput | undefined;
  if (inputs.awardDate !== undefined) {
    gradualPlan = computeGradualPlan({
      awardDate: inputs.awardDate,
      baselineLcPct: inputs.baselineLcPct,
      targetedLcPct: inputs.targetedLcPct,
    });
    if (!gradualPlan.success) {
      warnings.push(`Gradual plan failed: ${gradualPlan.errorMessage}`);
    } else if (gradualPlan.warnings.length > 0) {
      warnings.push(...gradualPlan.warnings);
    }
  }

  return {
    ownershipCheck,
    smePreference,
    pricePreference,
    adjustedBidPrice,
    financialEvaluation,
    penaltyAssessment,
    gradualPlan,
    warnings,
  };
}

// ─── Validation Helpers ───

/**
 * Validate that all required inputs are present and non-negative.
 * Returns array of validation errors (empty = valid).
 */
export function validateLcInputs(inputs: LcPillarInputs): string[] {
  const errors: string[] = [];

  // G&S validation
  if (inputs.goodsServices.totalGoodsServicesCost < 0) {
    errors.push("totalGoodsServicesCost must be non-negative");
  }
  for (const s of inputs.goodsServices.suppliers) {
    if (s.spend < 0) {
      errors.push(`Supplier ${s.supplierId}: spend must be non-negative`);
    }
    if (
      s.localContentPercentage !== null &&
      (s.localContentPercentage < 0 || s.localContentPercentage > 100)
    ) {
      errors.push(
        `Supplier ${s.supplierId}: localContentPercentage must be 0-100`,
      );
    }
  }

  // Asset validation
  if (inputs.assetDepreciation.ksaManufacturedDepreciation < 0) {
    errors.push("ksaManufacturedDepreciation must be non-negative");
  }
  if (inputs.assetDepreciation.foreignAssetDepreciation < 0) {
    errors.push("foreignAssetDepreciation must be non-negative");
  }
  if (inputs.assetDepreciation.totalDepreciation < 0) {
    errors.push("totalDepreciation must be non-negative");
  }

  // Labor validation
  if (inputs.laborCompensation.saudiCompensation < 0) {
    errors.push("saudiCompensation must be non-negative");
  }
  if (inputs.laborCompensation.expatCompensation < 0) {
    errors.push("expatCompensation must be non-negative");
  }
  if (inputs.laborCompensation.totalCompensation < 0) {
    errors.push("totalCompensation must be non-negative");
  }

  // Capacity Building validation
  if (inputs.capacityBuilding.saudiTrainingCost < 0) {
    errors.push("saudiTrainingCost must be non-negative");
  }
  if (inputs.capacityBuilding.supplierDevelopmentCost < 0) {
    errors.push("supplierDevelopmentCost must be non-negative");
  }
  if (inputs.capacityBuilding.rdCostInKsa < 0) {
    errors.push("rdCostInKsa must be non-negative");
  }
  if (inputs.capacityBuilding.totalCapacityBuildingCost < 0) {
    errors.push("totalCapacityBuildingCost must be non-negative");
  }

  return errors;
}
