// ─── LocalContentOS — LCGPA Entity-Level Calculation Contract ───
// Deterministic, explainable, versioned, auditable, reproducible.
// Every number must be traceable to: Rule, Version, Inputs, Calculation, Result, Evidence, Timestamp, Actor.

// ─── Calculation Method Constants ───

/** Supported calculation methods */
export const CALCULATION_METHODS = ["lcgpa_v1", "iktva_v1"] as const;
export type CalculationMethod = (typeof CALCULATION_METHODS)[number];

/** Current LCGPA rule version */
export const LCGPA_RULE_VERSION = "2026-01" as const;

/** Legacy IKTVA weights (preserved for historical records) */
export const IKTVA_WEIGHTS = {
  revenue: 0.35,
  supplierSpend: 0.35,
  workforce: 0.20,
  assets: 0.10,
} as const;

// ─── Pillar Definitions ───

/**
 * LCGPA 4-Pillar Calculation Inputs.
 * Each pillar represents a distinct cost category.
 *
 * Formula:
 *   LC% = (LC_GS + LC_AD + LC_LC + LC_CB) / Total_Costs × 100
 *
 * Where:
 *   LC_GS = Local Goods & Services (suppliers ranked by spend, 70%/top-40 rule)
 *   LC_AD = Local Asset Depreciation (KSA × 100% + Foreign × 20%)
 *   LC_LC = Local Labor Compensation (Saudi × 100% + Expat × 37%)
 *   LC_CB = Local Capacity Building (Saudi training = 100%, R&D in KSA = 100%)
 */
export interface LcPillarInputs {
  // ── Goods & Services Pillar ──
  goodsServices: GoodsServicesInputs;

  // ── Asset Depreciation Pillar ──
  assetDepreciation: AssetDepreciationInputs;

  // ── Labor Compensation Pillar ──
  laborCompensation: LaborCompensationInputs;

  // ── Capacity Building Pillar ──
  capacityBuilding: CapacityBuildingInputs;
}

// ─── Goods & Services Inputs ───

export interface GoodsServicesInputs {
  /** All suppliers with their spend, ranked by cost descending */
  suppliers: RankedSupplier[];
  /** Total goods & services costs (all suppliers combined) */
  totalGoodsServicesCost: number;
}

export interface RankedSupplier {
  /** Unique supplier identifier */
  supplierId: string;
  /** Supplier name */
  name: string;
  /** Total spend with this supplier (SAR) */
  spend: number;
  /** Locality classification */
  localityClassification: "local" | "non_local" | "mixed" | "unclassified";
  /** Supplier's declared local content percentage (0-100) */
  localContentPercentage: number | null;
  /** Rank in descending spend order (1 = highest spender) */
  rank: number;
  /**
   * Official sector LC% rate from Appendix B (0-100).
   * Used as fallback when localityClassification is "unclassified" and
   * localContentPercentage is not declared.
   */
  sectorLcRate?: number;
}

// ─── Asset Depreciation Inputs ───

export interface AssetDepreciationInputs {
  /** Depreciation of KSA-manufactured fixed assets (SAR) */
  ksaManufacturedDepreciation: number;
  /** Depreciation of foreign-origin fixed assets (SAR) */
  foreignAssetDepreciation: number;
  /** Total depreciation of all fixed assets (SAR) */
  totalDepreciation: number;
}

// ─── Labor Compensation Inputs ───

/**
 * Official ex-pat LC attribution rates.
 * - REGULATION: 37% (LCGPA Regulation Article 12)
 * - TEMPLATE:   53.4% (Official template v.2 Section 3 — may reflect different sector assumptions)
 */
export const EXPAT_LC_RATE_REGULATION = 0.37;
export const EXPAT_LC_RATE_TEMPLATE = 0.534;

export interface LaborCompensationInputs {
  /** Total compensation of Saudi employees (SAR) — attributed 100% */
  saudiCompensation: number;
  /** Total compensation of expatriate employees (SAR) */
  expatCompensation: number;
  /** Total compensation of all employees (SAR) */
  totalCompensation: number;
  /**
   * Expat LC attribution rate (0-1). Defaults to EXPAT_LC_RATE_REGULATION (0.37).
   * Set to EXPAT_LC_RATE_TEMPLATE (0.534) to match the official template v.2 Section 3.
   */
  expatLcRate?: number;
}

// ─── Capacity Building Inputs ───

export interface CapacityBuildingInputs {
  /** Cost of Saudi employee training programs (SAR) — attributed 100% */
  saudiTrainingCost: number;
  /** Cost of supplier development programs (SAR) */
  supplierDevelopmentCost: number;
  /** Cost of R&D activities performed in KSA (SAR) — attributed 100% */
  rdCostInKsa: number;
  /** Total capacity building costs (SAR) */
  totalCapacityBuildingCost: number;
}

// ─── Calculation Result ───

export interface LcPillarResult {
  /** Local Goods & Services value (SAR) */
  lcGoodsServices: number;
  /** Local Asset Depreciation value (SAR) */
  lcAssetDepreciation: number;
  /** Local Labor Compensation value (SAR) */
  lcLaborCompensation: number;
  /** Local Capacity Building value (SAR) */
  lcCapacityBuilding: number;
  /** Total costs (denominator) — sum of all pillars' totals */
  totalCosts: number;
  /** Final LC percentage */
  overallLcPct: number;

  // ── Per-pillar breakdown ──
  /** LC contribution from Goods & Services as % of total */
  gsLcPct: number;
  /** LC contribution from Asset Depreciation as % of total */
  adLcPct: number;
  /** LC contribution from Labor Compensation as % of total */
  lcPillarLcPct: number;
  /** LC contribution from Capacity Building as % of total */
  cbLcPct: number;
}

// ─── G&S Selection Rule ───

/**
 * G&S Supplier Selection Rule (Article 17):
 * Rank suppliers by descending spend.
 * Select suppliers contributing to ≥70% of total G&S cost,
 * OR the top 40 suppliers (whichever is greater).
 */
export interface GsSelectionResult {
  /** Selected suppliers after applying 70%/top-40 rule */
  selectedSuppliers: RankedSupplier[];
  /** Cumulative spend of selected suppliers (SAR) */
  selectedSpend: number;
  /** Cumulative percentage of total G&S cost */
  selectedPct: number;
  /** Selection method used: "70pct_rule" or "top40_rule" */
  selectionMethod: "70pct_rule" | "top40_rule";
  /** Whether the 70% threshold was reached */
  reached70Pct: boolean;
  /** Number of suppliers in the 70% cutoff */
  suppliersAt70Pct: number;
}

// ─── Calculation Trace ───

/**
 * Full traceability record for a single calculation run.
 * This record alone must be sufficient to reproduce the result.
 */
export interface LcCalculationTrace {
  /** Unique calculation run identifier */
  calculationRunId: string;
  /** Calculation method used */
  method: CalculationMethod;
  /** Regulatory rule version */
  ruleVersion: string;
  /** Timestamp of calculation */
  computedAt: string;
  /** User who triggered the calculation */
  computedById: string | null;
  /** Complete input snapshot (deterministic replay) */
  inputs: LcPillarInputs;
  /** Selection result for G&S pillar */
  gsSelection: GsSelectionResult;
  /** Calculation result */
  result: LcPillarResult;
  /** Evidence references used in calculation */
  evidenceRefs: EvidenceReference[];
}

export interface EvidenceReference {
  /** Type of evidence */
  type: "workbook_line" | "supplier_declaration" | "financial_statement" | "certificate" | "manual_entry" | "tender_document";
  /** Reference identifier (e.g., workbook line code, supplier ID) */
  referenceId: string;
  /** Human-readable description */
  description: string;
  /** Source value used */
  value: number | null;
}

// ─── Financial Evaluation (Article 17) ───

/**
 * Full traceability record for a single financial evaluation run.
 * This record alone must be sufficient to reproduce the result.
 */
export interface FinancialEvaluationTrace {
  /** Unique evaluation run identifier */
  evaluationRunId: string;
  /** Calculation method used */
  method: CalculationMethod;
  /** Regulatory rule version */
  ruleVersion: string;
  /** Timestamp of evaluation */
  evaluatedAt: string;
  /** User who triggered the evaluation */
  evaluatedById: string | null;
  /** Complete input snapshot (deterministic replay) */
  inputs: FinancialEvaluationInputs;
  /** Intermediate calculation values */
  intermediates: {
    /** Price ratio: lowestBidPrice / bidPrice */
    priceRatio: number;
    /** LC blend before normalization */
    lcBlendRaw: number;
    /** LC blend after normalization to [0, 1] */
    lcNormalized: number;
    /** Listed bonus as percentage (0 or 5) */
    listedBonusRaw: number;
    /** Listed bonus normalized to [0, 1] */
    listedBonusNormalized: number;
  };
  /** Calculation result */
  result: FinancialEvaluationResult;
  /** Evidence references used in evaluation */
  evidenceRefs: EvidenceReference[];
}

export interface FinancialEvaluationInputs {
  /** Tender reference number */
  tenderReference: string;
  /** Supplier being evaluated */
  supplierId: string;
  /** Supplier name */
  supplierName: string;
  /** This supplier's bid price (SAR) */
  bidPrice: number;
  /** Lowest qualifying bid price across all bidders (SAR) */
  lowestBidPrice: number;
  /** Supplier's baseline LC% */
  baselineLcPct: number;
  /** Supplier's committed LC% target */
  targetedLcPct: number;
  /** Whether supplier is listed on Tadawul/Nomu */
  isListedCompany: boolean;
}

export interface FinancialEvaluationResult {
  /** Price score component: (lowestBid / evaluatedBid) × 60 */
  priceScore: number;
  /** LC score component: (target × 50% + baseline × 50% + listedBonus) × 40 */
  lcScore: number;
  /** Listed company bonus: 5% if listed */
  listedCompanyBonus: number;
  /** Overall evaluation score (higher = better) */
  overallScore: number;
  /** Rank among all evaluated bids (1 = best) */
  rank: number | null;
}

export interface FinancialEvaluationOutput {
  /** Whether calculation succeeded */
  success: boolean;
  /** Calculation result (null if failed) */
  result: FinancialEvaluationResult | null;
  /** Error code (null if succeeded) */
  error: FinancialEvaluationError | null;
  /** Human-readable error message (null if succeeded) */
  errorMessage: string | null;
  /** Input validation warnings */
  warnings: string[];
}

/**
 * Financial evaluation error types.
 */
export type FinancialEvaluationError =
  | "BID_PRICE_ZERO"
  | "BID_PRICE_NEGATIVE"
  | "LOWEST_BID_PRICE_NEGATIVE"
  | "BID_BELOW_LOWEST"
  | "BASELINE_LC_PCT_OUT_OF_RANGE"
  | "TARGETED_LC_PCT_OUT_OF_RANGE"
  | "RULE_VERSION_NOT_FOUND";

// ─── Penalty Assessment ───

export interface PenaltyAssessmentInputs {
  /** Total contract value (SAR) */
  contractValue: number;
  /** Contractual LC% target */
  targetLcPct: number;
  /** Actual LC% achieved */
  actualLcPct: number;
}

export interface PenaltyAssessmentResult {
  /** Variance: actual - target (negative = gap) */
  variance: number;
  /** Whether |variance| > 5% (penalty eligible) */
  exceedsThreshold: boolean;
  /** Maximum penalty percentage (up to 10%) */
  maxPenaltyPct: number;
  /** Maximum penalty amount (SAR) */
  maxPenaltyAmount: number;
}

// ─── Penalty Assessment (Enhanced Output) ───

export type PenaltyAssessmentError =
  | "CONTRACT_VALUE_NEGATIVE"
  | "TARGET_LC_PCT_OUT_OF_RANGE"
  | "ACTUAL_LC_PCT_OUT_OF_RANGE"
  | "CONTRACT_VALUE_ZERO";

export interface PenaltyAssessmentOutput {
  /** Whether calculation succeeded */
  success: boolean;
  /** Calculation result (null if failed) */
  result: PenaltyAssessmentResult | null;
  /** Error code (null if succeeded) */
  error: PenaltyAssessmentError | null;
  /** Human-readable error message (null if succeeded) */
  errorMessage: string | null;
  /** Input validation warnings */
  warnings: string[];
}

// ─── Gradual Plan ───

export interface GradualPlanInputs {
  /** Contract award date */
  awardDate: Date;
  /** Baseline LC% at time of award */
  baselineLcPct: number;
  /** Target LC% to achieve */
  targetedLcPct: number;
}

export interface GradualPlanResult {
  /** Submission deadline: awardDate + 60 days */
  submissionDeadline: Date;
  /** Whether submission is still within deadline */
  isWithinDeadline: boolean;
  /** Days remaining until deadline */
  daysRemaining: number;
}

// ─── Gradual Plan (Enhanced Output) ───

export type GradualPlanError =
  | "AWARD_DATE_REQUIRED"
  | "BASELINE_LC_PCT_OUT_OF_RANGE"
  | "TARGET_LC_PCT_OUT_OF_RANGE"
  | "TARGET_BELOW_BASELINE";

export interface GradualPlanMilestoneInput {
  /** Milestone sequence number (1-based) */
  sequence: number;
  /** Target date for this milestone */
  targetDate: Date;
  /** Target LC% to achieve by this date */
  targetLcPct: number;
  /** Description of milestone */
  description?: string;
}

export interface GradualPlanMilestoneOutput {
  sequence: number;
  targetDate: Date;
  targetLcPct: number;
  description?: string;
  /** Status based on current date */
  status: "pending" | "achieved" | "missed" | "exceeded";
  daysUntilDue: number;
}

export interface GradualPlanOutput {
  /** Whether calculation succeeded */
  success: boolean;
  /** Calculation result (null if failed) */
  result: GradualPlanResult | null;
  /** Calculated milestones (null if failed) */
  milestones: GradualPlanMilestoneOutput[] | null;
  /** Error code (null if succeeded) */
  error: GradualPlanError | null;
  /** Human-readable error message (null if succeeded) */
  errorMessage: string | null;
  /** Input validation warnings */
  warnings: string[];
}

// ─── SME & Price Preference ───

export interface SmePreferenceResult {
  /** Adjusted bid price after SME preference */
  adjustedPrice: number;
  /** Whether SME preference was applied */
  preferenceApplied: boolean;
  /** Amount of preference (SAR) */
  preferenceAmount: number;
}

export interface PricePreferenceResult {
  /** Adjusted bid value after price preference */
  adjustedBidValue: number;
  /** Whether price preference was applied */
  preferenceApplied: boolean;
  /** Amount of preference (SAR) */
  preferenceAmount: number;
}

// ─── Unified Tender Evaluation (WAVE 8) ───

/**
 * Complete tender evaluation inputs combining all LCGPA rules.
 */
export interface TenderEvaluationInputs {
  // Tender info
  tenderReference: string;
  tenderType: "supply" | "service" | "works";
  
  // Supplier info
  supplierId: string;
  supplierName: string;
  saudiOwnershipPct: number | null; // For ownership rule
  isLocalSme: boolean; // For SME preference (10%)
  isListedCompany: boolean; // For listed company bonus (Article 17)
  currentClassification: string | null; // "Saudi" | "foreign" | "joint_venture" | null
  
  // Bid info
  bidPrice: number; // Original bid price
  lowestBidPrice: number; // Lowest bid among all bidders
  
  // LC% info (for Article 17)
  baselineLcPct: number;
  targetedLcPct: number;
  
  // National product share (for Article 11 Price Preference)
  nationalProductShare: number; // 0-1, share of national products in bid
  
  // Contract info (for penalty assessment)
  contractValue?: number;
  targetLcPct?: number;
  actualLcPct?: number;
  
  // Gradual plan info
  awardDate?: Date;

  // Mandatory list items (for Section 8 in submission package)
  mandatoryListItems?: MandatoryListItem[];
}

/**
 * Unified tender evaluation result.
 */
export interface TenderEvaluationResult {
  // Ownership rule
  ownershipCheck: OwnershipRuleCheck;
  
  // SME Preference (Article 12)
  smePreference: SmePreferenceResult;
  
  // Price Preference (Article 11)
  pricePreference: PricePreferenceResult;
  
  // Adjusted bid price after all preferences
  adjustedBidPrice: number;
  
  // Financial Evaluation (Article 17)
  financialEvaluation: FinancialEvaluationOutput;
  
  // Penalty Assessment (if contract info provided)
  penaltyAssessment?: PenaltyAssessmentOutput;
  
  // Gradual Plan (if award date provided)
  gradualPlan?: GradualPlanOutput;
  
  // Overall warnings
  warnings: string[];
}

/**
 * Tender evaluation error types.
 */
export type TenderEvaluationError =
  | FinancialEvaluationError
  | PenaltyAssessmentError
  | GradualPlanError
  | "SUPPLIER_NOT_SAUDI_OWNED"
  | "TENDER_TYPE_INVALID";

// ─── Ownership Rule ───

export interface OwnershipRuleCheck {
  /** Whether supplier meets ≥50% Saudi ownership threshold */
  meetsThreshold: boolean;
  /** Saudi ownership percentage (0-100) */
  saudiOwnershipPct: number;
  /** Ownership classification result */
  classification: "Saudi" | "foreign" | "joint_venture" | "unclassified";
}

// ─── Mandatory List (WAVE 6) ───

/**
 * Mandatory List version metadata.
 * Each version is a snapshot from LCGPA documents library.
 */
export interface MandatoryListVersion {
  /** Unique version identifier (e.g., "2026-Q1", "2025-Q4") */
  version: string;
  /** Source URL from LCGPA documents library */
  sourceUrl: string;
  /** When this list became effective */
  effectiveDate: Date;
  /** Number of products in this version */
  productCount: number;
  /** Number of sectors covered */
  sectorCount: number;
  /** Status of this version */
  status: "active" | "superseded" | "archived";
  /** Import timestamp */
  importedAt: Date;
  /** User who imported this version */
  importedById: string | null;
}

/**
 * Individual mandatory product entry.
 */
export interface MandatoryListItem {
  /** LCGPA product code */
  productCode: string;
  /** Arabic product name */
  productNameAr: string;
  /** English product name (if available) */
  productNameEn: string | null;
  /** LCGPA sector code (1-16) */
  sectorCode: string;
  /** Arabic sector name */
  sectorNameAr: string;
  /** English sector name (if available) */
  sectorNameEn: string | null;
  /** When this product became mandatory */
  effectiveDate: Date;
}

/**
 * Search result for mandatory list item.
 */
export interface MandatoryListSearchResult {
  /** The matching item */
  item: MandatoryListItem;
  /** Match score (0-1, higher = better match) */
  score: number;
  /** Match type */
  matchType: "exact_code" | "exact_name" | "partial_name" | "sector";
}

/**
 * Classification result for a spend item against mandatory list.
 */
export interface MandatoryListClassification {
  /** Whether the item is on the mandatory list */
  isMandatory: boolean;
  /** The matching mandatory list item (if found) */
  match: MandatoryListItem | null;
  /** Match confidence (0-1) */
  confidence: number;
  /** Classification notes */
  notes: string;
  /** Official sector LC% rate from Appendix B (0-100) if sector is identified */
  sectorLcRate?: number;
  /** Sector code if identified (e.g., "S01", "P09") */
  identifiedSectorCode?: string;
}

/**
 * Import result for mandatory list XLSX file.
 */
export interface MandatoryListImportResult {
  /** Whether import succeeded */
  success: boolean;
  /** Version that was imported */
  version: string | null;
  /** Number of products imported */
  productCount: number;
  /** Number of sectors covered */
  sectorCount: number;
  /** Errors during import */
  errors: string[];
  /** Warnings during import */
  warnings: string[];
}

/**
 * Official LCGPA sectors from Measurement Template v.2 Appendix B.
 * 23 service sectors + 15 product sectors = 38 total sectors.
 * Each sector has an official LC% rate for classification.
 * Source: نموذج قياس نسبة المحتوى المحلي (خط الأساس) v.2 — الملحق ب
 */
export const LCGPA_SECTORS = [
  // ── Service Sectors (23) ──
  { code: "S01", nameAr: "خدمات الإسكان وتأجير المنشآت", nameEn: "Housing & Rental Services", lcRate: 0.6, isicCodes: "55, 68102" },
  { code: "S02", nameAr: "خدمات تقديم الأغذية والمشروبات", nameEn: "Food & Beverage Services", lcRate: 0.4, isicCodes: "56" },
  { code: "S03", nameAr: "خدمات صناعية", nameEn: "Industrial Services", lcRate: 0.36, isicCodes: "25921, 33, 35, 38, 71" },
  { code: "S04", nameAr: "خدمات الأمن", nameEn: "Security Services", lcRate: 0.82, isicCodes: "80, 811001" },
  { code: "S05", nameAr: "خدمات مهنية محلية", nameEn: "Local Professional Services", lcRate: 0.5, isicCodes: "69-74 Exc. 712" },
  { code: "S06", nameAr: "خدمات ممثل محلي من مورد أجنبي", nameEn: "Local Agent of Foreign Supplier", lcRate: 0.2, isicCodes: "69-74 Exc. 712" },
  { code: "S07", nameAr: "خدمات العقارات", nameEn: "Real Estate Services", lcRate: 0.48, isicCodes: "68 Exc.68102" },
  { code: "S08", nameAr: "خدمات الإنشاء", nameEn: "Construction Services", lcRate: 0.4, isicCodes: "41-43" },
  { code: "S09", nameAr: "خدمات التعليم", nameEn: "Education Services", lcRate: 0.66, isicCodes: "75, 85" },
  { code: "S10", nameAr: "خدمات الأنشطة المالية والتأمينية", nameEn: "Financial & Insurance Services", lcRate: 0.75, isicCodes: "64-66" },
  { code: "S11", nameAr: "خدمات الرعاية الصحية", nameEn: "Healthcare Services", lcRate: 0.38, isicCodes: "86-88" },
  { code: "S12", nameAr: "خدمات الإدارة العامة", nameEn: "Public Administration Services", lcRate: 0.69, isicCodes: "84" },
  { code: "S13", nameAr: "خدمات النقل والخدمات اللوجستية", nameEn: "Transport & Logistics Services", lcRate: 0.45, isicCodes: "49-53, 79" },
  { code: "S14", nameAr: "خدمات الحفر البري", nameEn: "Onshore Drilling Services", lcRate: 0.3, isicCodes: "06, 091" },
  { code: "S15", nameAr: "خدمات الحفر البحري", nameEn: "Offshore Drilling Services", lcRate: 0.2, isicCodes: "06, 091" },
  { code: "S16", nameAr: "خدمات التعدين", nameEn: "Mining Services", lcRate: 0.3, isicCodes: "09" },
  { code: "S17", nameAr: "خدمات تأجير السيارات والشاحنات والمعدات", nameEn: "Vehicle & Equipment Rental", lcRate: 0.35, isicCodes: "49225, 773, 771" },
  { code: "S18", nameAr: "خدمات القوى العاملة", nameEn: "Workforce Services", lcRate: 0.59, isicCodes: "78" },
  { code: "S19", nameAr: "خدمات تقنية المعلومات والاتصالات", nameEn: "ICT Services", lcRate: 0.41, isicCodes: "582, 61-63" },
  { code: "S20", nameAr: "خدمات أخرى", nameEn: "Other Services", lcRate: 0.35, isicCodes: "39, 58-60, 772, 7912-7990, 81-99" },
  { code: "S21", nameAr: "خدمات المرافق", nameEn: "Utility Services", lcRate: 0.61, isicCodes: "351, 36, 37" },
  { code: "S22", nameAr: "خدمات وكلاء أو ممثلي شركات الخدمات", nameEn: "Service Company Agent/Representative", lcRate: 0.05, isicCodes: "N/A (supplier type)" },
  { code: "S23", nameAr: "الخدمات الأجنبية", nameEn: "Foreign Services", lcRate: 0, isicCodes: "N/A (supplier type)" },
  // ── Product Sectors (15) ──
  { code: "P01", nameAr: "منتجات الزراعة والغابات والأسماك", nameEn: "Agriculture, Forestry & Fishery Products", lcRate: 0.57, isicCodes: "01-03" },
  { code: "P02", nameAr: "منتجات الأغذية والمشروبات", nameEn: "Food & Beverage Products", lcRate: 0.35, isicCodes: "10-12" },
  { code: "P03", nameAr: "منتجات كيميائية والنفط والغاز", nameEn: "Chemical, Oil & Gas Products", lcRate: 0.61, isicCodes: "19-20, 22, 352" },
  { code: "P04", nameAr: "منتجات كيميائية أخرى", nameEn: "Other Chemical Products", lcRate: 0.29, isicCodes: "20" },
  { code: "P05", nameAr: "منتجات الآلات والمعدات", nameEn: "Machinery & Equipment Products", lcRate: 0.25, isicCodes: "265-268, 28, 29-30" },
  { code: "P06", nameAr: "منتجات المواد الكهربائية", nameEn: "Electrical Products", lcRate: 0.4, isicCodes: "27, 2814" },
  { code: "P07", nameAr: "منتجات التعدين", nameEn: "Mining Products", lcRate: 0.45, isicCodes: "05, 07-08" },
  { code: "P08", nameAr: "منتجات معدات ثابتة", nameEn: "Fixed Equipment Products", lcRate: 0.3, isicCodes: "24-25, 2813" },
  { code: "P09", nameAr: "منتجات الاسمنت والجبس", nameEn: "Cement & Gypsum Products", lcRate: 0.5, isicCodes: "2394-2395" },
  { code: "P10", nameAr: "منتجات تصنيع حديد التسليح", nameEn: "Rebar Manufacturing Products", lcRate: 0.6, isicCodes: "25114" },
  { code: "P11", nameAr: "منتجات صناعية لتقنية المعلومات والاتصالات", nameEn: "ICT Manufacturing Products", lcRate: 0.15, isicCodes: "261-264" },
  { code: "P12", nameAr: "منتجات محلية أخرى", nameEn: "Other Local Products", lcRate: 0.3, isicCodes: "13-18, 21, 23, 27, 31-32" },
  { code: "P13", nameAr: "منتجات إعادة التدوير", nameEn: "Recycling Products", lcRate: 0.7, isicCodes: "381103, 383" },
  { code: "P14", nameAr: "منتجات وكيل / موزع في المملكة", nameEn: "Local Agent/Distributor Products", lcRate: 0.05, isicCodes: "45-47" },
  { code: "P15", nameAr: "منتجات مورد أجنبي", nameEn: "Foreign Supplier Products", lcRate: 0, isicCodes: "N/A (supplier type)" },
] as const;

/**
 * Legacy manufacturing-only sectors (kept for backward compatibility).
 * Use LCGPA_SECTORS for new implementations.
 */
export const LCGPA_LEGACY_SECTORS = [
  { code: "01", nameAr: "الصناعات الغذائية", nameEn: "Food Industries" },
  { code: "02", nameAr: "الصناعات الكيميائية", nameEn: "Chemical Industries" },
  { code: "03", nameAr: "الصناعات الهندسية", nameEn: "Engineering Industries" },
  { code: "04", nameAr: "صناعات مواد البناء", nameEn: "Building Materials Industries" },
  { code: "05", nameAr: "صناعات النسيج والجلود", nameEn: "Textile and Leather Industries" },
  { code: "06", nameAr: "صناعات الورق والطباعة", nameEn: "Paper and Printing Industries" },
  { code: "07", nameAr: "الصناعات الطبية", nameEn: "Medical Industries" },
  { code: "08", nameAr: "صناعات البلاستيك والمطاط", nameEn: "Plastic and Rubber Industries" },
  { code: "09", nameAr: "الصناعات الكهربائية والإلكترونية", nameEn: "Electrical and Electronic Industries" },
  { code: "10", nameAr: "صناعات السيارات", nameEn: "Automotive Industries" },
  { code: "11", nameAr: "صناعات التعبئة والتغليف", nameEn: "Packaging Industries" },
  { code: "12", nameAr: "صناعات الأخشاب والأثاث", nameEn: "Wood and Furniture Industries" },
  { code: "13", nameAr: "الصناعات البتروكيميائية", nameEn: "Petrochemical Industries" },
  { code: "14", nameAr: "صناعات التعدين", nameEn: "Mining Industries" },
  { code: "15", nameAr: "صناعات الطاقة المتجددة", nameEn: "Renewable Energy Industries" },
  { code: "16", nameAr: "الخدمات اللوجستية", nameEn: "Logistics Services" },
] as const;

export type LcgpaSectorCode = (typeof LCGPA_SECTORS)[number]["code"];

// ─── WAVE 9: Reviewer Submission Package ───

export type SubmissionStatus = "draft" | "ready" | "submitted" | "reviewed" | "approved";

export interface ReviewerChecklistItem {
  id: string;
  labelAr: string;
  labelEn: string;
  isRequired: boolean;
  isPresent: boolean;
  notes?: string;
}

export interface ReviewerSubmissionSection {
  sectionId: string;
  titleAr: string;
  titleEn: string;
  isRequired: boolean;
  isComplete: boolean;
  data: Record<string, unknown>;
}

export interface ReviewerSubmissionPackage {
  /** Unique submission ID */
  submissionId: string;
  /** Tender / engagement reference */
  tenderReference: string;
  /** Supplier identifier */
  supplierId: string;
  /** Supplier name */
  supplierName: string;
  /** LCGPA rule version used */
  ruleVersion: string;
  /** Submission status */
  status: SubmissionStatus;
  /** Calculated overall LC% */
  overallLcPct: number;
  /** Sections included in the package */
  sections: ReviewerSubmissionSection[];
  /** Checklist items for reviewer */
  checklist: ReviewerChecklistItem[];
  /** Evidence file references */
  evidenceRefs: string[];
  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
  /** Who compiled the package */
  compiledById: string;
  /** Package integrity hash */
  integrityHash: string;
}
